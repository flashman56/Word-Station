/**
 * merge-loan-chains.mjs —— 把 loan 词判定结果合并进 src/data/words-remorph.js
 * ==================================================================
 * 输入：reports/queue-loan-chains.json（scripts/queue-loan-chains.mjs 产出）
 * 输出：追加到 src/data/words-remorph.js 末尾（**只追加新 id，已有 id 一律不动**）
 *
 * 只收「实质性 decomposable」：
 *   - 排除 not-decomposable / uncertain（它们的 pieces 本来就是空的）
 *   - 排除「仅屈折」（travel+ing / set+s 这种，学了没东西）
 *
 * 补丁格式（与 words-remorph.js 现有条目逐字段一致）：
 *   { id, morphHints: [...实词素 id], chain: [{morph, form, gloss}] }
 *
 * 安全：
 *   - 写盘前：MORPH_IDS 校验 + 键集合校验 + 词条 id 必须真实存在 + 不与已有 id 重复
 *   - 写盘后：回读整个文件重新复验，0 悬挂才放行
 *
 * 用法：
 *   node scripts/merge-loan-chains.mjs --dry   # 只报告不写盘
 *   node scripts/merge-loan-chains.mjs         # 写盘
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REPORT = path.join(ROOT, 'reports/queue-loan-chains.json')
const TARGET = path.join(ROOT, 'src/data/words-remorph.js')
const DRY = process.argv.includes('--dry')

const INFL = new Set(['s.ed', 's.ing', 's.plural']) // 纯屈折后缀：只切出这些 = 无教学价值
const norm = (s) => String(s ?? '').toLowerCase().replace(/[-\s'’]/g, '')

// ---------------------------------------------------------------- 载入
const morphMod = await import(pathToFileURL(path.join(ROOT, 'src/data/morphemes.js')).href)
const MORPHS = morphMod.default || morphMod
const MORPH_IDS = new Set(MORPHS.map((m) => m.id))
const MORPH_BY_ID = new Map(MORPHS.map((m) => [m.id, m]))

const dataMod = await import(pathToFileURL(path.join(ROOT, 'src/data/index.js')).href)
const WORD_IDS = new Set(dataMod.words.map((w) => w.id))
const WORD_BY_ID = new Map(dataMod.words.map((w) => [w.id, w]))

const remorphMod = await import(pathToFileURL(TARGET).href)
const existing = remorphMod.default || remorphMod
const EXISTING_IDS = new Set(existing.map((p) => p.id))

const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'))
const items = Array.isArray(report.items) ? report.items : []
console.log(`[merge] 判定 ${items.length} 条 · words-remorph 现有 ${existing.length} 条 · 词素表 ${MORPH_IDS.size} 条`)

// ---------------------------------------------------------------- 筛选 + 构造补丁
/** @type {Array<{id:string,morphHints:string[],chain:Array}>} */
const patches = []
const skip = { notDecomposable: 0, uncertain: 0, inflectionOnly: 0, empty: 0, alreadyExists: 0, unknownWord: 0, badId: 0, concat: 0, slug: 0 }

for (const it of items) {
  if (it.verdict !== 'decomposable') {
    if (it.verdict === 'not-decomposable') skip.notDecomposable++
    else skip.uncertain++
    continue
  }
  const pieces = Array.isArray(it.pieces) ? it.pieces : []
  if (pieces.length === 0) {
    skip.empty++
    continue
  }
  const realIds = [...new Set(pieces.filter((p) => p && p.morph).map((p) => p.morph))]
  if (realIds.length === 0) {
    skip.empty++
    continue
  }
  // 仅屈折：实词素全落在 -ed / -ing / -s 上
  if (!realIds.some((id) => !INFL.has(id))) {
    skip.inflectionOnly++
    continue
  }
  if (EXISTING_IDS.has(it.id)) {
    skip.alreadyExists++
    continue
  }
  if (!WORD_IDS.has(it.id)) {
    skip.unknownWord++
    continue
  }
  // 写盘前硬校验：id 合法性
  const bad = realIds.filter((id) => !MORPH_IDS.has(id))
  if (bad.length) {
    console.error(`  ✗ ${it.form} 引用了不存在的词素 id: ${bad.join(', ')}`)
    skip.badId++
    continue
  }
  // 写盘前硬校验：段形拼接必须等于原词形（以词条里的真实 form 为准）
  const word = WORD_BY_ID.get(it.id)
  const joined = pieces.map((p) => norm(p.form)).join('')
  if (joined !== norm(word.form)) {
    console.error(`  ✗ ${word.form} 拼接 "${joined}" ≠ 词条形 "${norm(word.form)}"`)
    skip.concat++
    continue
  }
  // 段形与该词素词形/变体对不上 → 疑似张冠李戴，宁可不合并
  let slug = false
  for (const p of pieces) {
    if (!p.morph) continue
    const m = MORPH_BY_ID.get(p.morph)
    const f = norm(p.form)
    const cands = [m.form, ...(m.variants || [])].map(norm).filter((c) => c.length >= 2)
    const ok = cands.some((c) => f === c || f.includes(c) || (c.includes(f) && f.length >= c.length - 1))
    if (!ok) {
      console.error(`  ✗ ${word.form} 段形 "${p.form}" 与 ${p.morph}(${m.form}) 不匹配`)
      slug = true
    }
  }
  if (slug) {
    skip.slug++
    continue
  }

  patches.push({
    id: it.id,
    morphHints: realIds,
    chain: pieces.map((p) => ({ morph: p.morph || null, form: String(p.form || ''), gloss: String(p.gloss || '') })),
  })
}

console.log(
  `[merge] 待追加 ${patches.length} 条 · 跳过：` +
    ` 不可拆 ${skip.notDecomposable} / 不确定 ${skip.uncertain} / 仅屈折 ${skip.inflectionOnly} /` +
    ` 空 ${skip.empty} / 已存在 ${skip.alreadyExists} / 词条不存在 ${skip.unknownWord} /` +
    ` 坏 id ${skip.badId} / 拼接不符 ${skip.concat} / 段形不符 ${skip.slug}`
)

// ---------------------------------------------------------------- 序列化（与现有条目同款：键不带引号、单行一条）
const ser = (p) => {
  const chain = p.chain
    .map(
      (c) =>
        `{morph:${c.morph === null ? 'null' : JSON.stringify(c.morph)},form:${JSON.stringify(c.form)},gloss:${JSON.stringify(c.gloss)}}`
    )
    .join(',')
  return `  {id:${JSON.stringify(p.id)},morphHints:${JSON.stringify(p.morphHints)},chain:[${chain}]},`
}

// 键集合断言：只允许 id / morphHints / chain
for (const p of patches) {
  const keys = Object.keys(p).sort().join(',')
  if (keys !== 'chain,id,morphHints') throw new Error(`补丁键集合异常: ${keys} (${p.id})`)
  if (!Array.isArray(p.morphHints) || p.morphHints.length === 0) throw new Error(`morphHints 为空: ${p.id}`)
  if (!Array.isArray(p.chain) || p.chain.length === 0) throw new Error(`chain 为空: ${p.id}`)
  for (const c of p.chain) {
    if (c.morph !== null && !MORPH_IDS.has(c.morph)) throw new Error(`chain 里有非法 id: ${p.id} ${c.morph}`)
    if (typeof c.form !== 'string' || !c.form) throw new Error(`chain 段形为空: ${p.id}`)
    if (typeof c.gloss !== 'string') throw new Error(`chain gloss 非字符串: ${p.id}`)
  }
}
console.log(`[merge] 写盘前断言通过：${patches.length} 条补丁，键集合 / morphHints / chain 全部合法`)

if (DRY) {
  console.log('[merge] --dry：不写盘。示例 3 条：')
  for (const p of patches.slice(0, 3)) console.log('  ' + ser(p))
  process.exit(0)
}
if (patches.length === 0) {
  console.log('[merge] 无新增，不写盘。')
  process.exit(0)
}

// ---------------------------------------------------------------- 写盘：只追加
const src = fs.readFileSync(TARGET, 'utf8')
const MARK = '/** id -> 补丁（合并时查表用） */'
const mi = src.indexOf(MARK)
if (mi < 0) throw new Error('找不到 words-remorph.js 的数组结束标记')
let head = src.slice(0, mi)
const tail = src.slice(mi)
const bi = head.lastIndexOf(']')
if (bi < 0) throw new Error('找不到数组闭合括号')
head = head.slice(0, bi) + patches.map(ser).join('\n') + '\n' + head.slice(bi)

let out = head + tail
const total = existing.length + patches.length
if (!/词条数: \d+/.test(out)) throw new Error('找不到「词条数: N」注释')
out = out.replace(/词条数: \d+/, `词条数: ${total}`)

fs.writeFileSync(TARGET, out)
console.log(`[merge] 已写入 ${path.relative(ROOT, TARGET)}`)

// ---------------------------------------------------------------- 回读复验
const cacheBust = `${pathToFileURL(TARGET).href}?v=${Date.now()}`
const after = (await import(cacheBust)).default
console.log(`[merge] 回读 ${after.length} 条（期望 ${total}）`)
let orphan = 0
const seen = new Set()
for (const p of after) {
  if (seen.has(p.id)) {
    console.error(`  ✗ 重复 id: ${p.id}`)
    orphan++
  }
  seen.add(p.id)
  if (!WORD_IDS.has(p.id)) {
    console.error(`  ✗ 悬挂词条（words 里没有）: ${p.id}`)
    orphan++
  }
  for (const id of p.morphHints || []) {
    if (!MORPH_IDS.has(id)) {
      console.error(`  ✗ 悬挂词素（morphHints）: ${p.id} → ${id}`)
      orphan++
    }
  }
  for (const c of p.chain || []) {
    if (c.morph !== null && !MORPH_IDS.has(c.morph)) {
      console.error(`  ✗ 悬挂词素（chain）: ${p.id} → ${c.morph}`)
      orphan++
    }
  }
  const keys = Object.keys(p).sort().join(',')
  if (keys !== 'chain,id,morphHints') {
    console.error(`  ✗ 键集合异常: ${p.id} → ${keys}`)
    orphan++
  }
}
console.log(`[merge] 复验：${after.length} 条 · 悬挂/异常 ${orphan} 条`)
if (orphan > 0) {
  console.error('[merge] ✗ 复验未通过，请检查上面列出的条目')
  process.exit(1)
}
console.log(`[merge] ✓ 追加 ${patches.length} 条 · words-remorph.js 合并后共 ${after.length} 条`)

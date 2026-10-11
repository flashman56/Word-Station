/**
 * wire-inflected.mjs —— 让「屈折变形」继承原形的构词链
 * ==================================================================
 * 背景：学习队列里 91% 的词没有 chain，其中很大一部分只是**屈折变形**
 *       （determined / homes / boxes / packed / dropping / cleared）——
 *       它们的原形就在库里，而且原形已经有 chain，只是变形形没继承过来。
 *       本脚本把这条链「接」过去：原形 chain + 一段屈折后缀。
 *
 * ★★ 铁律：绝不臆造词素 id ★★
 *    1) 只在「原形已在本词库里、且原形已有 chain」时才接线，不猜词根；
 *    2) 用到的三个屈折词素 s.ed / s.plural / s.ing 必须在 morphemes.js 里
 *       真实存在，否则脚本直接抛错退出（历史教训：AI 编 id 造出 7 个悬挂引用）；
 *    3) 写盘前自检每个 morphHints / chain[].morph 都能在 morphemes.js 里查到。
 *
 * ★★ 只写 morphHints + chain，绝不碰 morphless 标记 ★★
 *    validate-data.mjs 规定 freqRank > 2500 且非 morphless 的词必须有
 *    phoneticBr 与 example；翻标记会一次性爆出上百条 error。
 *
 * 输出：整体重写 src/data/words-remorph.js
 *   - 已有条目（AI 重切的结果）**原样保留、一行不动**，只按 id 重排；
 *   - 新算出的条目按 id 去重后追加；
 *   - 文件头注释只改「词条数」那一行。
 *
 * 用法：node scripts/wire-inflected.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REMORPH_PATH = path.join(ROOT, 'src/data/words-remorph.js')

const { words, morphemes } = await import(pathToFileURL(path.join(ROOT, 'src/data/index.js')).href)

const MORPH_IDS = new Set(morphemes.map((m) => m.id))
const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))

// ---------------------------------------------------------------- 词素 id 契约
/** 后缀剥落段 -> 词素 id（`ies` 归 s.plural；`-d` 是 `-ed` 的变体，归 s.ed） */
const SUFFIX_BY_LETTERS = {
  ies: 's.plural',
  es: 's.plural',
  s: 's.plural',
  ing: 's.ing',
  ed: 's.ed',
  d: 's.ed',
}
/** 尝试顺序：命中即停 */
const SUFFIX_ORDER = ['ies', 'es', 's', 'ing', 'ed', 'd']

for (const letters of SUFFIX_ORDER) {
  const id = SUFFIX_BY_LETTERS[letters]
  if (!MORPH_IDS.has(id)) {
    throw new Error(`morphemes.js 里找不到词素 ${id}（后缀 -${letters}）。先在词素表补上再跑本脚本。`)
  }
}

/** 查词素 gloss（必须来自 morphemes.js 原文，不许自己编） */
function glossOf(id) {
  const g = GLOSS_BY_ID.get(id)
  if (typeof g !== 'string' || g.length === 0) throw new Error(`morphemes.js 里词素 ${id} 没有 gloss`)
  return g
}

// ---------------------------------------------------------------- 索引
/** 原形查表：小写 form -> 词条（validate 保证 form 全局唯一，故直接首条命中即可） */
const byForm = new Map()
for (const w of words) {
  const f = String(w.form || '').toLowerCase()
  if (f && !byForm.has(f)) byForm.set(f, w)
}
const byId = new Map(words.map((w) => [w.id, w]))

/** 只处理「纯小写字母」的词形，避开短语、带连字符/撇号/重音的条目 */
const PLAIN = /^[a-z]+$/
/** 不参与接线：专有名词、短语、短语前缀 id */
function isExcluded(w) {
  if (!w || typeof w.form !== 'string') return true
  if (w.kind === 'proper' || w.kind === 'phrase') return true
  if (String(w.id).startsWith('w.phr-')) return true
  return !PLAIN.test(String(w.form).toLowerCase())
}
/** 已有可用构词链 */
const hasChain = (w) => Array.isArray(w.chain) && w.chain.length > 0

// ---------------------------------------------------------------- 剥后缀
/**
 * 按后缀给出候选原形（按可信度从高到低）。
 * @param {string} f 小写词形
 * @param {string} letters 后缀字母
 * @returns {string[]} 候选原形数组（可能含重复，调用方负责去重）
 */
function baseCandidates(f, letters) {
  switch (letters) {
    case 'ies': // cities -> city
      return [f.slice(0, -3) + 'y']
    case 'es': // boxes -> box（也会误伤 makes->mak，但查不到就自然落空）
      return [f.slice(0, -2)]
    case 's': // homes -> home
      return [f.slice(0, -1)]
    case 'ing': // building->build / making->make / running->run（双写还原）
      return [f.slice(0, -3), f.slice(0, -3) + 'e', f.slice(0, -4)]
    case 'ed': // packed->pack / determined->determine / stopped->stop
      return [f.slice(0, -2), f.slice(0, -2) + 'e', f.slice(0, -3)]
    case 'd': // heard->hear（只在词形不以 ed 结尾时试，避免与 -ed 抢）
      return [f.slice(0, -1)]
    default:
      return []
  }
}

/**
 * 判断某后缀是否适用于该词形（附加的常识闸门，避免明显误切）。
 * @param {string} f 小写词形
 * @param {string} letters 后缀字母
 * @returns {boolean}
 */
function suffixApplicable(f, letters) {
  if (!f.endsWith(letters)) return false
  if (letters.length > 4) return false // 剥掉的后缀长度 ≤ 4
  if (letters === 's' && f.endsWith('ss')) return false // 英语不会给以 s 结尾的词干直接加 -s
  if (letters === 'd' && f.endsWith('ed')) return false // -ed 已优先处理过
  return true
}

/** 虚词词性（代词 / 介词 / 连词 / 冠词 / 叹词 / 数词）—— 拿它们当原形必然是错切（her -> herring） */
const FUNCTION_POS = /(pron|prep|conj|art|int|num|part)\./i

/** 被附加闸门挡掉的候选（只用于报告，不写进补丁） */
const guardDrops = []

/**
 * 为一个变形词找可继承的原形。
 *
 * 在「原形存在且已有 chain」之外，再加两道常识闸门，挡掉明显的错切：
 *   G1 原形长度 ≥ 3（2 字母的 ni / ax / us 之类当原形基本都是巧合 → nixed = ni + ed）
 *   G2 原形不能是虚词（her -> herring / herd / hers / herding / herded / heres）
 *
 * ★ 试过第三道「-ing/-ed/-d 要求动词性」的闸门，实测挡掉 32 条里只有 4 条是错切，
 *   其余 21 条（documented / disciplined / patented / titled / leveraged …）都是
 *   「名词转动词」的合法用法，误杀率太高，已弃用。宁可留 0.3% 的瑕疵，也不要系统性误杀。
 *
 * @param {{form: string, id: string, pos: string}} w 目标词
 * @returns {{letters: string, morphId: string, base: object} | null}
 */
function findBase(w) {
  const f = String(w.form).toLowerCase()
  for (const letters of SUFFIX_ORDER) {
    if (!suffixApplicable(f, letters)) continue
    for (const base of baseCandidates(f, letters)) {
      if (base.length < 2) continue // 剩余 stem 长度 ≥ 2（硬底线）
      const bw = byForm.get(base)
      if (!bw) continue
      if (bw.id === w.id) continue
      if (isExcluded(bw)) continue
      if (!hasChain(bw)) continue // ★ 不臆造：原形没拆过就跳过
      // —— 以下闸门只记录「本来会命中」的候选，便于人工复核挡掉了什么 ——
      if (base.length < 3) {
        guardDrops.push({ form: f, base, letters, why: `G1 原形过短（pos=${bw.pos || '?'}）` })
        continue
      }
      if (FUNCTION_POS.test(String(bw.pos || ''))) {
        guardDrops.push({ form: f, base, letters, why: `G2 原形是虚词（pos=${bw.pos}）` })
        continue
      }
      return { letters, morphId: SUFFIX_BY_LETTERS[letters], base: bw }
    }
  }
  return null
}

// ---------------------------------------------------------------- 现有补丁
const original = fs.readFileSync(REMORPH_PATH, 'utf8')
const MARKER = 'const wordsRemorph = ['
const markerIdx = original.indexOf(MARKER)
if (markerIdx < 0) throw new Error(`${REMORPH_PATH} 里找不到 "const wordsRemorph = ["`)
const headerRaw = original.slice(0, markerIdx + MARKER.length)
const afterMarker = original.slice(markerIdx + MARKER.length)
// 收尾的 "]" 行：兼容 LF / CRLF（Windows 上 git checkout 会把 LF 转成 CRLF）
const closeMatch = /\r?\n\](?:\r?\n)/.exec(afterMarker.slice(Math.max(0, afterMarker.lastIndexOf('\n]'))))
if (!closeMatch) throw new Error(`${REMORPH_PATH} 里找不到数组结尾的 "]" 行`)
const closeIdx = afterMarker.lastIndexOf('\n]')
const footer = afterMarker.slice(closeIdx + 1) // 形如 "]\n\n/** id -> 补丁 ... */\n..."
/** 沿用原文件的换行符，避免整文件被重写成另一种 EOL */
const EOL = original.includes('\r\n') ? '\r\n' : '\n'

/** 现存条目的**原始行文本**（原样保留，不做任何再序列化）与 id */
const ENTRY_RE = /^  \{id:"((?:[^"\\]|\\.)*)",/
const existingLines = []
const existingIds = new Set()
for (const line of original.split('\n')) {
  const m = ENTRY_RE.exec(line)
  if (!m) continue
  existingLines.push(line.replace(/\r$/, ''))
  existingIds.add(JSON.parse(`"${m[1]}"`))
}
if (existingLines.length === 0) throw new Error(`${REMORPH_PATH} 里没解析到任何条目，格式可能变了`)

/** 渲染一条补丁（与 scripts/resegment-morphs.mjs 的 renderDataFile 逐字节同款） */
function renderEntry(it) {
  const chain = it.chain
    .map((s) => `{morph:${s.morph === null ? 'null' : JSON.stringify(s.morph)},form:${JSON.stringify(s.form)},gloss:${JSON.stringify(s.gloss)}}`)
    .join(',')
  return `  {id:${JSON.stringify(it.id)},morphHints:${JSON.stringify(it.morphHints)},chain:[${chain}]},`
}

// ---------------------------------------------------------------- 阶段一：屈折接线
/** @type {Array<{id: string, morphHints: string[], chain: Array<{morph: string|null, form: string, gloss: string}>}>} */
const generated = []
/** 与 generated 一一对应的接线明细，供复核（写进 reports/wire-inflected-added.json） */
const details = []
const stat = { ies: 0, es: 0, s: 0, ing: 0, ed: 0, d: 0 }

for (const w of words) {
  if (isExcluded(w)) continue
  if (hasChain(w)) continue // 只补还没有 chain 的词
  if (existingIds.has(w.id)) continue // 已有补丁的一律不动（那是 AI 重切的结果）
  const hit = findBase(w)
  if (!hit) continue
  const { letters, morphId, base } = hit
  const morphHints = [...new Set([...(base.morphs || []), morphId])]
  generated.push({
    id: w.id,
    morphHints,
    chain: [
      ...base.chain.map((s) => ({ morph: s.morph ?? null, form: s.form, gloss: s.gloss ?? '' })),
      { morph: morphId, form: letters, gloss: glossOf(morphId) },
    ],
  })
  details.push({
    id: w.id,
    form: w.form,
    suffix: `-${letters}`,
    morphId,
    baseId: base.id,
    baseForm: base.form,
    basePos: base.pos ?? '',
    freqRank: w.freqRank ?? 0,
  })
  stat[letters] += 1
}

// ---------------------------------------------------------------- 阶段二：r.miser 家族
/**
 * 手工补丁：r.miser（可怜，悲惨；哀怜）此前挂 0 个词。
 * ★ 每个 id 都先在 morphemes.js 里 grep 到才准用 —— 见 checkManualIds()。
 *   s.y（misery / miseries 需要的 -y）在词素表里**不存在**，按「宁可少做也不造 id」
 *   的原则放弃 misery 与 miseries 两条。
 */
const MANUAL = [
  {
    id: 'w.miser',
    morphHints: ['r.miser'],
    chain: [['r.miser', 'miser']],
  },
  {
    id: 'w.miserable',
    morphHints: ['r.miser', 's.able'],
    chain: [['r.miser', 'miser'], ['s.able', 'able']],
  },
  {
    id: 'w.miserly',
    morphHints: ['r.miser', 's.ly'],
    chain: [['r.miser', 'miser'], ['s.ly', 'ly']],
  },
  {
    // miserably 的表层切分是 miser + abl + y（-able 在 -ly 前脱落 e）
    id: 'w.miserably',
    morphHints: ['r.miser', 's.able', 's.ly'],
    chain: [['r.miser', 'miser'], ['s.able', 'abl'], ['s.ly', 'y']],
  },
]

/** 手工补丁的 id 校验：词素 id 与词条 id 都必须真实存在 */
function checkManualIds() {
  const bad = []
  for (const it of MANUAL) {
    if (!byId.has(it.id)) bad.push(`词库里没有词条 ${it.id}`)
    for (const [mid] of it.chain) {
      if (!MORPH_IDS.has(mid)) bad.push(`morphemes.js 里没有词素 ${mid}（${it.id} 用到）`)
    }
  }
  if (bad.length) throw new Error(`手工补丁引用了不存在的 id：\n  - ${bad.join('\n  - ')}`)
}
checkManualIds()

let manualAdded = 0
const manualSkipped = []
for (const it of MANUAL) {
  if (existingIds.has(it.id)) {
    manualSkipped.push(`${it.id}（已有补丁，未覆盖）`)
    continue
  }
  if (hasChain(byId.get(it.id))) {
    manualSkipped.push(`${it.id}（已有 chain，未覆盖）`)
    continue
  }
  generated.push({
    id: it.id,
    morphHints: [...new Set(it.morphHints)],
    chain: it.chain.map(([mid, form]) => ({ morph: mid, form, gloss: glossOf(mid) })),
  })
  details.push({
    id: it.id,
    form: byId.get(it.id)?.form ?? it.id,
    suffix: '(手工)',
    morphId: it.morphHints.join(','),
    baseId: '',
    baseForm: '',
    basePos: byId.get(it.id)?.pos ?? '',
    freqRank: byId.get(it.id)?.freqRank ?? 0,
  })
  manualAdded += 1
}

// ---------------------------------------------------------------- 写盘前自检
/** 补丁只允许有 id / morphHints / chain 三个键（尤其不许带 morphless） */
const ALLOWED_KEYS = ['id', 'morphHints', 'chain']
function selfCheck(items, label) {
  const problems = []
  const seen = new Set()
  for (const it of items) {
    const keys = Object.keys(it)
    const extra = keys.filter((k) => !ALLOWED_KEYS.includes(k))
    if (extra.length) problems.push(`${label} ${it.id} 含多余字段：${extra.join(', ')}`)
    if (keys.length !== ALLOWED_KEYS.length) problems.push(`${label} ${it.id} 字段数不是 3：${keys.join(', ')}`)
    if (seen.has(it.id)) problems.push(`${label} id 重复：${it.id}`)
    seen.add(it.id)
    if (!Array.isArray(it.morphHints) || it.morphHints.length === 0) {
      problems.push(`${label} ${it.id} morphHints 为空`)
    }
    for (const mid of it.morphHints) {
      if (!MORPH_IDS.has(mid)) problems.push(`${label} ${it.id} morphHints 引用了不存在的词素：${mid}`)
    }
    if (!Array.isArray(it.chain) || it.chain.length === 0) {
      problems.push(`${label} ${it.id} chain 为空`)
      continue
    }
    it.chain.forEach((s, i) => {
      if (!s || typeof s.form !== 'string' || s.form.length === 0) {
        problems.push(`${label} ${it.id} chain[${i}] 缺少 form`)
      }
      if (s.morph !== null && !MORPH_IDS.has(s.morph)) {
        problems.push(`${label} ${it.id} chain[${i}] 引用了不存在的词素：${s.morph}`)
      }
      if (typeof s.gloss !== 'string') problems.push(`${label} ${it.id} chain[${i}] gloss 不是字符串`)
    })
  }
  if (problems.length) {
    throw new Error(`${label} 自检未通过（${problems.length} 条）：\n  - ${problems.slice(0, 30).join('\n  - ')}`)
  }
  return seen.size
}
const checkedCount = selfCheck(generated, '新增补丁')

// ---------------------------------------------------------------- 写盘
const newLines = generated.map(renderEntry)
const allLines = [...existingLines, ...newLines].sort((a, b) => {
  const ia = ENTRY_RE.exec(a)?.[1] ?? ''
  const ib = ENTRY_RE.exec(b)?.[1] ?? ''
  return ia < ib ? -1 : ia > ib ? 1 : 0
})
const header = headerRaw.replace(/词条数: \d+/, `词条数: ${allLines.length}`)
if (!/词条数: \d+/.test(header)) throw new Error('文件头注释里找不到「词条数: N」这一行')
// header 内部自带换行符，footer 也是原文搬过来的，只把条目区按 EOL 统一拼接
fs.writeFileSync(REMORPH_PATH, `${header}${EOL}${allLines.join(EOL)}${EOL}${footer}`, 'utf8')

// ---------------------------------------------------------------- 写盘后复核
const reread = (await import(`${pathToFileURL(REMORPH_PATH).href}?t=${Date.now()}`)).default
if (!Array.isArray(reread) || reread.length !== allLines.length) {
  throw new Error(`回读失败：期望 ${allLines.length} 条，实际 ${reread?.length}`)
}
const dangling = []
for (const p of reread) {
  for (const mid of p.morphHints) if (!MORPH_IDS.has(mid)) dangling.push(`${p.id} morphHints -> ${mid}`)
  for (const s of p.chain) if (s.morph != null && !MORPH_IDS.has(s.morph)) dangling.push(`${p.id} chain -> ${s.morph}`)
  if (Object.keys(p).some((k) => !ALLOWED_KEYS.includes(k))) dangling.push(`${p.id} 字段越界：${Object.keys(p).join(',')}`)
}
if (dangling.length) throw new Error(`回读发现悬挂引用（${dangling.length} 条）：\n  - ${dangling.slice(0, 30).join('\n  - ')}`)

// ---------------------------------------------------------------- 明细落盘（供人工复核）
const REPORT_PATH = path.join(ROOT, 'reports', 'wire-inflected-added.json')
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
fs.writeFileSync(
  REPORT_PATH,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      added: generated.length,
      bySuffix: stat,
      guardDrops,
      entries: details,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

// ---------------------------------------------------------------- 报告
const plural = stat.ies + stat.es + stat.s
const pasted = stat.ed + stat.d
console.log('='.repeat(60))
console.log('屈折变形 —— 继承原形构词链')
console.log('='.repeat(60))
console.log(`已有补丁（原样保留）  : ${existingLines.length}`)
console.log(`本次新增              : ${generated.length}（屈折 ${generated.length - manualAdded} + 手工 ${manualAdded}）`)
console.log('  按后缀分类：')
console.log(`    -ies  ${String(stat.ies).padStart(5)}   （cities -> city）`)
console.log(`    -es   ${String(stat.es).padStart(5)}   （boxes  -> box）`)
console.log(`    -s    ${String(stat.s).padStart(5)}   （homes  -> home）`)
console.log(`    -ing  ${String(stat.ing).padStart(5)}   （making -> make / running -> run）`)
console.log(`    -ed   ${String(stat.ed).padStart(5)}   （packed -> pack / determined -> determine）`)
console.log(`    -d    ${String(stat.d).padStart(5)}   （heard  -> hear）`)
console.log(`  按词素汇总：s.plural ${plural}　s.ed ${pasted}　s.ing ${stat.ing}`)
console.log(`  被附加闸门挡掉    : ${guardDrops.length}`
  + (guardDrops.length ? `（${guardDrops.slice(0, 6).map((d) => `${d.form}=${d.base}+${d.letters}`).join('、')}${guardDrops.length > 6 ? ' …' : ''}）` : ''))
console.log(`  手工（r.miser 家族）：新增 ${manualAdded}`
  + (manualSkipped.length ? `，跳过 ${manualSkipped.length}（${manualSkipped.join('；')}）` : ''))
console.log(`补丁总条数            : ${allLines.length}`)
console.log(`自检：新增 ${checkedCount} 条 100% 通过（morphHints / chain 无悬挂 id，仅含 3 个键，回读一致）`)
console.log(`已写入 ${path.relative(ROOT, REMORPH_PATH)}`)
console.log(`接线明细 ${path.relative(ROOT, REPORT_PATH)}`)

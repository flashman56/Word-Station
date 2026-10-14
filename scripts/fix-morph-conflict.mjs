/**
 * fix-morph-conflict —— 修「同一 form 的 root 与 suffix 被挂到同一个词上」的冲突（通用规则，非写死 ment）
 * ------------------------------------------------------------------
 * 背景（真实线上缺陷，2026-10-14）：
 *   `words-entry.js` 的合并是 `morphs: [...(w.morphs||[]), ...hints]`（**追加**）
 *   且 `chain: patch.chain`（**整体覆盖**）。书源管线 gen-bookchains.mjs 对 25 个
 *   -ment 词产出了 root `r.ment`（拉丁 mens「心」），而它们要的是 suffix `s.ment`
 *   （-mentum「结果、行为」）。于是学习者看到 comment / government / segment 的
 *   -mentum 被解释成「心，思想，精神」。
 *
 * ★ 铁证（说明判据可机械化，不靠语感）★
 *   `w.quasigovernment` 的 r.ment 段 gloss 写的是「**名词后缀**：结果、状态」——
 *   gloss 自称后缀，id 却是 root。同一个 form 'ment' 不可能同时承担两个构词功能。
 *
 * 冲突有两种来源，本脚本都要覆盖：
 *   ① 补丁 morphHints 同时含 r.ment 与 s.ment        → 去掉 r.ment
 *   ② 补丁只给 r.ment，而 base 文件已有 s.ment       → r.ment 改指 s.ment
 *      （合并是追加，base 的 s.ment 不会被去掉，于是两个并存）
 *
 * ★ 红线：绝不批量重指 r.ment 的其它用法 ★
 *   treatment / garment / parchment / environment / dimension 等 47 处**只挂 r.ment**
 *   的词，其中相当一部分词源是错的（treatment←tractare「拉」、environment←metiri
 *   「测量」，都与「心」无关）。但那需要**逐词考证**（查 OED/Wiktionary），
 *   不是机械替换能判的——本脚本只碰「同 form 双挂」这一类证据确凿的，
 *   其余产出审计清单交人工。错的词源比没有更糟。
 *
 * 用法：
 *   node scripts/fix-morph-conflict.mjs           # dry-run
 *   node scripts/fix-morph-conflict.mjs --write   # 写盘
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WRITE = process.argv.includes('--write')

const BOOKMORPH_FILE = path.join(ROOT, 'src', 'data', 'words-bookmorph.js')
const REMORPH_FILE = path.join(ROOT, 'src', 'data', 'words-remorph.js')
const LOAN_FILE = path.join(ROOT, 'src', 'data', 'words-loan.js')

const { default: BOOKMORPH } = await import('../src/data/words-bookmorph.js')
const { default: REMORPH } = await import('../src/data/words-remorph.js')
const { default: LOAN } = await import('../src/data/words-loan.js')
const { default: MORPH } = await import('../src/data/morphemes.js')
const GLOSS = new Map(MORPH.map((m) => [m.id, m.gloss]))

// ★ base 文件的 morphs：判断「冲突是合并产生的」的必要信息
const BASE_FILES = ['words-latin', 'words-greek', 'words-affix', 'words-extra', 'words-mono', 'words-mono-extra', 'words-mono-seed']
const baseById = new Map()
for (const f of BASE_FILES) {
  const arr = (await import(`../src/data/${f}.js`)).default
  if (!Array.isArray(arr)) continue
  for (const w of arr) if (w && w.id && !baseById.has(w.id)) baseById.set(w.id, w)
}

const R = 'r.ment'
const S = 's.ment'

/* ------------------------------------------------------------------
 * ★ 通用化：不再写死 ment 一对 ★
 *   从 morphemes.js 反推「哪些 form 同时存在 root 与 suffix 两种词素」，
 *   对每种这样的 form，命中「同一词双挂」的补丁一律**保留 suffix、删掉 root**。
 *
 *   为什么保留 suffix 是安全的（不是拍脑袋）：
 *     两者的 note 已各自划清地盘 ——
 *       s.al    note 明写 "internal（内部的）、global（全球的）"
 *       r.al    note 明写 "aliment（食物）、alimony（赡养费）"
 *       s.ment  note 明写 "development、amazement、government"
 *       r.ment  note 明写 "mental / mention / mentor / dementia"
 *     即：双挂的词全部落在 suffix 的地盘里，root 是被误挂上去的。
 *   铁证：w.quasigovernment 的 r.ment 段 gloss 自称「名词后缀」，
 *        gloss 说自己是后缀、id 却是 root。
 * ------------------------------------------------------------------ */
const morphById = new Map(MORPH.map((m) => [m.id, m]))
/** form -> { root: id, suffix: id } —— 只收「root 与 suffix 同 form」的组合 */
const formPair = new Map()
for (const m of MORPH) {
  if (!m.form) continue
  const slot = formPair.get(m.form) || {}
  if (m.type === 'root') slot.root = m.id
  else if (m.type === 'suffix') slot.suffix = m.id
  formPair.set(m.form, slot)
}
/** 可参与修复的 [rootId, suffixId] 对 */
const PAIRS = [...formPair.entries()]
  .filter(([, v]) => v.root && v.suffix)
  .map(([form, v]) => ({ form, root: v.root, suffix: v.suffix }))
console.log('同 form 的 root/suffix 组合：', PAIRS.map((p) => `${p.root}|${p.suffix}(${p.form})`).join('  '))

/** 判断某个补丁条目是否需要修，并给出修好的版本 */
function repair(p) {
  const hints = Array.isArray(p.morphHints) ? p.morphHints : []
  const base = baseById.get(p.id)
  const baseMorphs = base && Array.isArray(base.morphs) ? base.morphs : []
  const present = new Set([...hints, ...baseMorphs])

  const hit = PAIRS.find(({ root, suffix }) => hints.includes(root) && present.has(suffix))
  if (!hit) return null

  const fixedHints = []
  for (const m of hints) {
    const id = m === hit.root ? hit.suffix : m
    if (!fixedHints.includes(id)) fixedHints.push(id)
  }
  const chain = (p.chain || []).map((c) => {
    if (!c) return c
    if (c.morph !== hit.root) return c
    return { ...c, morph: hit.suffix, gloss: GLOSS.get(hit.suffix) ?? c.gloss }
  })
  return {
    fixedHints,
    chain,
    pair: hit,
    tag: hints.includes(hit.suffix) ? '补丁双挂' : '合并产生(base有suffix)',
  }
}

const plans = []
for (const [name, list] of [['bookmorph', BOOKMORPH], ['remorph', REMORPH], ['loan', LOAN]]) {
  for (const p of list) {
    const r = repair(p)
    if (r) plans.push({ name, p, ...r })
  }
}

const byName = plans.reduce((a, x) => ({ ...a, [x.name]: (a[x.name] || 0) + 1 }), {})
console.log(`扫描 bookmorph ${BOOKMORPH.length} / remorph ${REMORPH.length} / loan ${LOAN.length} 条`)
console.log(`命中需修 ${plans.length} 条，按表：${JSON.stringify(byName)}\n`)

for (const x of plans) {
  console.log(
    `  [${x.name}] ${x.p.id.padEnd(30)} ${x.pair.root}→${x.pair.suffix}  ${x.tag.padEnd(20)} ${(x.p.morphHints || []).join('+').padEnd(34)} → ${x.fixedHints.join('+')}`,
  )
}

if (!WRITE) {
  console.log(`\n[dry-run] 未写盘。加 --write 执行。`)
  process.exit(0)
}

// ---- 写盘：逐行替换命中的补丁条目 ----
const FILE_OF = { bookmorph: BOOKMORPH_FILE, remorph: REMORPH_FILE, loan: LOAN_FILE }
const grouped = {}
for (const x of plans) (grouped[x.name] = grouped[x.name] || []).push(x)

for (const [name, xs] of Object.entries(grouped)) {
  const file = FILE_OF[name]
  const lines = readFileSync(file, 'utf8').split('\n')
  let patched = 0
  for (const x of xs) {
    const idx = lines.findIndex((l) => l.includes(`"${x.p.id}"`) || l.includes(`'${x.p.id}'`))
    if (idx < 0) {
      console.error(`  !! ${name} 里找不到 ${x.p.id}，跳过`)
      continue
    }
    const indent = (lines[idx].match(/^\s*/) || [''])[0]
    const hintsJson = JSON.stringify(x.fixedHints)
    const chainJson = JSON.stringify(x.chain)
    lines[idx] = `${indent}{id:"${x.p.id}",morphHints:${hintsJson},chain:${chainJson}},`
    patched += 1
  }
  writeFileSync(file, lines.join('\n'), 'utf8')
  console.log(`\n[write] ${name}: 已修 ${patched} 条 → ${path.relative(ROOT, file)}`)
}
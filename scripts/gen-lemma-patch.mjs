/**
 * 屈折归并补丁生成器（Step-2）—— 确定性、可复跑
 * ==================================================================
 * 输入（Step-1 产物）：
 *   - scripts/.lemma-map.draft.json  归并映射（含 bucket；仅取 auto-fold）
 *   - scripts/.lemma-pairs.json      词条对（提供 fId / lId）
 * 输出：
 *   - src/data/words-lemma.js        { 'w.honored': 'w.honor', ... }（按键排序、紧凑）
 *
 * 规则（见 reports/lemma/step2-spec.md §2）：
 *   1. 逐行按 (form, lemma) join 两文件解析 fId/lId 并核对 type；join 失败即报错停机。
 *   2. 同一 form 有多行时：仅当全部行 bucket==='auto-fold' 且**解析后**代表 id 唯一，
 *      才允许折叠；否则整词不折叠，计入例外清单。
 *   3. 链式解析：目标自身也被折叠则沿链继续，止于第一个「不在补丁中」的词条；
 *      最大 4 跳；成环/超跳 → 整词不折叠并入例外清单。
 *   4. 自环 / 目标缺失 → 例外清单。
 *   5. 只导出 { wordsLemma, LEMMA_BY_ID }，与 words-remorph.js 同款风格。
 *
 * 确定性：连跑两次输出 MD5 一致（键按 id 升序、无时间戳）。
 *
 * ⚠ 本脚本**刻意不 import 词库模块**（words-entry.js 会 import 本脚本生成的
 *   words-lemma.js，构成自引用）。「目标存在于词库」的判据用 pairs 里出现过的
 *   全部 id（fId ∪ lId）——它们本就来自词库，足够作为该护栏的取证来源。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DRAFT = path.join(ROOT, 'scripts/.lemma-map.draft.json')
const PAIRS = path.join(ROOT, 'scripts/.lemma-pairs.json')
const OUT = path.join(ROOT, 'src/data/words-lemma.js')

/** 链式解析最大跳数（与运行时 src/lib/lemmaFold.js 的防御上限一致）。 */
const MAX_HOPS = 4

// ------------------------------------------------------------------
// [1] 读入 + join
// ------------------------------------------------------------------
const draft = JSON.parse(fs.readFileSync(DRAFT, 'utf8'))
const pairs = JSON.parse(fs.readFileSync(PAIRS, 'utf8'))

const pairByKey = new Map() // `${f}\u0000${l}` -> pair
const KNOWN_IDS = new Set()
for (const p of pairs) {
  pairByKey.set(`${p.f}\u0000${p.l}`, p)
  KNOWN_IDS.add(p.fId)
  KNOWN_IDS.add(p.lId)
}

/** form -> { fId, rows: [{ lId, type, bucket, lemma }] }（按 draft 顺序） */
const byForm = new Map()
let joinFail = 0
for (const d of draft) {
  const p = pairByKey.get(`${d.form}\u0000${d.lemma}`)
  if (!p) {
    joinFail += 1
    console.error(`  ✗ join 失败: ${d.form} -> ${d.lemma}`)
    continue
  }
  if (p.type !== d.type) {
    joinFail += 1
    console.error(`  ✗ type 不一致: ${d.form} -> ${d.lemma} (draft ${d.type} / pairs ${p.type})`)
    continue
  }
  let g = byForm.get(d.form)
  if (!g) {
    g = { fId: p.fId, rows: [] }
    byForm.set(d.form, g)
  } else if (g.fId !== p.fId) {
    joinFail += 1
    console.error(`  ✗ 同 form 的 fId 不一致: ${d.form} (${g.fId} / ${p.fId})`)
    continue
  }
  g.rows.push({ lId: p.lId, type: d.type, bucket: d.bucket, lemma: d.lemma })
}
if (joinFail > 0) {
  console.error(`[gen-lemma-patch] ✗ join 失败 ${joinFail} 行 —— 停机（不许静默跳过）`)
  process.exit(1)
}

// ------------------------------------------------------------------
// [2] 链式解析（纯函数，对 seed map 求终态）
// ------------------------------------------------------------------
/**
 * @param {string} id
 * @param {Map<string,string>} map fId -> lId
 * @returns {{ id: string, hops: number, cycle?: boolean, tooLong?: boolean }}
 */
function resolve(id, map) {
  let cur = id
  const seen = new Set([cur])
  let hops = 0
  while (map.has(cur)) {
    if (hops >= MAX_HOPS) return { id: cur, hops, tooLong: true }
    const next = map.get(cur)
    if (seen.has(next)) return { id, hops, cycle: true }
    seen.add(next)
    cur = next
    hops += 1
  }
  return { id: cur, hops }
}

const exceptions = []
const addException = (form, fId, reason, detail = '') => {
  exceptions.push({ form, fId, reason, detail })
}

// ------------------------------------------------------------------
// [3] 播种：单行 form（唯一、无歧义）
// ------------------------------------------------------------------
const seed = new Map() // fId -> lId（未解析链）
for (const [form, g] of byForm) {
  if (g.rows.length !== 1) continue
  const row = g.rows[0]
  if (row.bucket !== 'auto-fold') continue // audit/keep 本就不折叠（非例外）
  if (row.lId === g.fId) {
    addException(form, g.fId, 'self-loop', `${form} -> ${row.lemma}`)
    continue
  }
  seed.set(g.fId, row.lId)
}

// ------------------------------------------------------------------
// [4] 多行 form：全 auto-fold 且「解析后」代表 id 唯一才折叠
// ------------------------------------------------------------------
for (const [form, g] of byForm) {
  if (g.rows.length < 2) continue
  const nonFold = g.rows.filter((r) => r.bucket !== 'auto-fold')
  if (nonFold.length) {
    addException(
      form,
      g.fId,
      'form-has-nonfold-row',
      nonFold.map((r) => `${r.lemma}[${r.bucket}]`).join(', '),
    )
    continue
  }
  // 逐行解析到终态（对 seed 求解）
  const reps = g.rows.map((r) => resolve(r.lId, seed))
  if (reps.some((r) => r.cycle || r.tooLong)) {
    addException(form, g.fId, 'chain-unsafe', reps.map((r) => r.id).join(', '))
    continue
  }
  const uniq = new Set(reps.map((r) => r.id))
  if (uniq.size !== 1) {
    addException(form, g.fId, 'multi-target', [...uniq].join(', '))
    continue
  }
  const rep = [...uniq][0]
  if (rep === g.fId) {
    addException(form, g.fId, 'self-loop', g.rows.map((r) => r.lemma).join(', '))
    continue
  }
  seed.set(g.fId, rep)
}

// ------------------------------------------------------------------
// [5] 终态解析 + 护栏（自环 / 目标缺失）
// ------------------------------------------------------------------
const fold = new Map() // fId -> repId
const chained = []
for (const [fId, rawTarget] of [...seed.entries()]) {
  const r = resolve(fId, seed)
  if (r.cycle) {
    addException(fIdToForm(fId), fId, 'cycle', `始于 ${fId}`)
    continue
  }
  if (r.tooLong) {
    addException(fIdToForm(fId), fId, 'too-long', `> ${MAX_HOPS} 跳`)
    continue
  }
  const rep = r.id
  if (rep === fId) {
    addException(fIdToForm(fId), fId, 'self-loop', `${fId} -> ${rawTarget}`)
    continue
  }
  if (!KNOWN_IDS.has(rep)) {
    addException(fIdToForm(fId), fId, 'target-missing', `${fId} -> ${rep}`)
    continue
  }
  fold.set(fId, rep)
  if (rep !== rawTarget) chained.push({ fId, rawTarget, rep, hops: r.hops })
}

/** id -> form（仅用于例外清单可读性；缺失则回落 id）。 */
function fIdToForm(fId) {
  for (const [form, g] of byForm) if (g.fId === fId) return form
  return fId
}

// ------------------------------------------------------------------
// [6] 写 src/data/words-lemma.js（键按 id 升序，紧凑）
// ------------------------------------------------------------------
const entries = [...fold.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))

const header = `/**
 * 屈折形归并补丁表（form id → 代表形 id）
 * ------------------------------------------------------------------
 * 由 scripts/gen-lemma-patch.mjs 生成，请勿手工修改。
 *
 * 数据来源：Step-1 的 scripts/.lemma-map.draft.json（仅 bucket==='auto-fold' 折叠）
 *          + scripts/.lemma-pairs.json（提供词条 id；draft 不含 id）。
 * 例外（多原型同形 / 链式不安全 / 自环 / 目标缺失）不在此表，详见生成脚本输出。
 *
 * 用法：src/data/index.js 与 src/data/words-entry.js 在 flat() 之后调用
 *       （命中词条附 \`.lemma\` 字段）；运行时由 src/lib/lemmaFold.js 的
 *       buildFoldView 据此做**读时**折叠（不落盘、不删词条）。
 *
 * 词条数: ${entries.length}
 */

/** @typedef {Record<string, string>} LemmaPatch */

const wordsLemma = {
`

const body = entries.map(([id, rep]) => `  ${JSON.stringify(id)}:${JSON.stringify(rep)},`).join('\n')

const footer = `
}

/** id -> 代表形 id（合并时查表用） */
export const LEMMA_BY_ID = new Map(Object.entries(wordsLemma))

export { wordsLemma }
export default wordsLemma
`

fs.writeFileSync(OUT, header + body + footer)

// ------------------------------------------------------------------
// [7] 统计输出
// ------------------------------------------------------------------
const size = fs.statSync(OUT).size
console.log('[gen-lemma-patch] 输入 draft 行数:', draft.length, '| pairs 行数:', pairs.length)
console.log('[gen-lemma-patch] 折叠条数:', entries.length)
console.log('[gen-lemma-patch] 链式解析条数:', chained.length)
console.log('[gen-lemma-patch] 例外条数:', exceptions.length)
const byReason = new Map()
for (const e of exceptions) byReason.set(e.reason, (byReason.get(e.reason) || 0) + 1)
console.log('[gen-lemma-patch] 例外分布:', [...byReason.entries()].map(([k, v]) => `${k}=${v}`).join(', ') || '(无)')
for (const e of exceptions.slice(0, 60)) {
  console.log(`    · ${e.form || e.fId}  [${e.reason}]  ${e.detail}`)
}
if (exceptions.length > 60) console.log(`    … 其余 ${exceptions.length - 60} 条略`)
if (chained.length) {
  console.log('[gen-lemma-patch] 链式样本:')
  for (const c of chained.slice(0, 20)) console.log(`    · ${c.fId} -> ${c.rawTarget} -> ${c.rep} (${c.hops} 跳)`)
  if (chained.length > 20) console.log(`    … 其余 ${chained.length - 20} 条略`)
}
console.log('[gen-lemma-patch] 输出体积:', size, 'bytes')
console.log('[gen-lemma-patch] 已写:', path.relative(ROOT, OUT))

/**
 * QA · Step-2 ① / ②：独立复算折叠补丁 id 级映射 + 链式 + 例外核销
 * ------------------------------------------------------------------
 * 不引用生成器，按 step2-spec §2 规则从 draft+pairs 独立推导，与
 * src/data/words-lemma.js 逐键双向比对；并结合真实词库 words-entry 核验。
 * 用法：node scripts/qa-lemma-step2-patch.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DRAFT = path.join(ROOT, 'scripts/.lemma-map.draft.json')
const PAIRS = path.join(ROOT, 'scripts/.lemma-pairs.json')
const PATCH_FILE = path.join(ROOT, 'src/data/words-lemma.js')
const MAX_HOPS = 4

let N = 0
const FAILS = []
const ok = (c, m) => { N++; if (!c) FAILS.push(m); return c }
const eq = (a, e, m) => ok(a === e, `${m} — expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`)
const section = (t) => console.log(`\n===== ${t} =====`)

const draft = JSON.parse(fs.readFileSync(DRAFT, 'utf8'))
const pairs = JSON.parse(fs.readFileSync(PAIRS, 'utf8'))
const mod = await import(new URL('../src/data/words-lemma.js', import.meta.url).href)
const wordsLemma = mod.wordsLemma
const LEMMA_BY_ID = mod.LEMMA_BY_ID
const modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
const words = modW.words
const byId = new Map(words.map((w) => [w.id, w]))

// ---------- 独立推导（spec §2 规则，逐条复刻语义，但由 QA 独立实现） ----------
const pairByKey = new Map()
const KNOWN_IDS = new Set()
for (const p of pairs) { pairByKey.set(`${p.f}\u0000${p.l}`, p); KNOWN_IDS.add(p.fId); KNOWN_IDS.add(p.lId) }

const byForm = new Map()
let joinFail = 0
for (const d of draft) {
  const p = pairByKey.get(`${d.form}\u0000${d.lemma}`)
  if (!p || p.type !== d.type) { joinFail++; continue }
  let g = byForm.get(d.form)
  if (!g) { g = { fId: p.fId, rows: [] }; byForm.set(d.form, g) }
  g.rows.push({ lId: p.lId, bucket: d.bucket, lemma: d.lemma })
}
eq(joinFail, 0, '① draft×pairs 全 join（joinFail==0）')

function resolve(id, map) {
  let cur = id, hops = 0
  const seen = new Set([cur])
  while (map.has(cur)) {
    if (hops >= MAX_HOPS) return { id: cur, tooLong: true }
    const next = map.get(cur)
    if (seen.has(next)) return { id, cycle: true }
    seen.add(next); cur = next; hops += 1
  }
  return { id: cur, hops }
}

const seed = new Map()
const exceptions = [] // {form, fId, reason}
for (const [form, g] of byForm) {
  if (g.rows.length !== 1) continue
  const r = g.rows[0]
  if (r.bucket !== 'auto-fold') continue
  if (r.lId === g.fId) { exceptions.push({ form, fId: g.fId, reason: 'self-loop' }); continue }
  seed.set(g.fId, r.lId)
}
for (const [form, g] of byForm) {
  if (g.rows.length < 2) continue
  if (g.rows.some((r) => r.bucket !== 'auto-fold')) { exceptions.push({ form, fId: g.fId, reason: 'form-has-nonfold-row' }); continue }
  const reps = g.rows.map((r) => resolve(r.lId, seed))
  if (reps.some((r) => r.cycle || r.tooLong)) { exceptions.push({ form, fId: g.fId, reason: 'chain-unsafe' }); continue }
  const uniq = new Set(reps.map((r) => r.id))
  if (uniq.size !== 1) { exceptions.push({ form, fId: g.fId, reason: 'multi-target' }); continue }
  const rep = [...uniq][0]
  if (rep === g.fId) { exceptions.push({ form, fId: g.fId, reason: 'self-loop' }); continue }
  seed.set(g.fId, rep)
}
const derived = new Map()
const chainedList = []
for (const [fId, rawTarget] of seed.entries()) {
  const r = resolve(fId, seed)
  if (r.cycle) { exceptions.push({ form: '', fId, reason: 'cycle' }); continue }
  if (r.tooLong) { exceptions.push({ form: '', fId, reason: 'too-long' }); continue }
  if (r.id === fId) { exceptions.push({ form: '', fId, reason: 'self-loop' }); continue }
  if (!KNOWN_IDS.has(r.id)) { exceptions.push({ form: '', fId, reason: 'target-missing' }); continue }
  derived.set(fId, r.id)
  if (r.id !== rawTarget) chainedList.push({ fId, rawTarget, rep: r.id, hops: r.hops })
}

// ---------- ① 逐键双向比对 ----------
section('① 补丁逐键双向比对（独立推导 vs src/data/words-lemma.js）')
const patchKeys = new Set(Object.keys(wordsLemma))
eq(derived.size, 9888, '① 独立推导折叠条数 == 9888')
eq(patchKeys.size, 9888, '① 补丁条数 == 9888')
eq(LEMMA_BY_ID.size, 9888, '① LEMMA_BY_ID.size == 9888')
let onlyDerived = 0, onlyPatch = 0, valDiff = 0
for (const [k, v] of derived) { if (!patchKeys.has(k)) onlyDerived++; else if (wordsLemma[k] !== v) valDiff++ }
for (const k of patchKeys) if (!derived.has(k)) onlyPatch++
console.log(`   仅推导有=${onlyDerived} | 仅补丁有=${onlyPatch} | 键同值不同=${valDiff}`)
eq(onlyDerived, 0, '① 推导 → 补丁 差集 == 0')
eq(onlyPatch, 0, '① 补丁 → 推导 差集 == 0')
eq(valDiff, 0, '① 同键映射值全部一致')

// ---------- 键排序 ----------
section('① 补丁键排序（id 升序）')
const fileText = fs.readFileSync(PATCH_FILE, 'utf8')
const keyLines = fileText.split('\n').filter((l) => /^  "w\.[^"]+":/.test(l)).map((l) => l.slice(2, l.indexOf('":')))
let orderBad = 0
for (let i = 1; i < keyLines.length; i++) if (keyLines[i - 1] > keyLines[i]) orderBad++
eq(keyLines.length, 9888, '① 文件内条目行数 == 9888')
eq(orderBad, 0, '① 键按 id 升序（字典序）')

// ---------- ② 链式 ----------
section('② 链式解析（声明 53 条）')
eq(chainedList.length, 53, '② 链式解析条数 == 53')
console.log(`   链式条数: ${chainedList.length}`)
// 抽查 ≥3 条链式，逐跳核对（拼出 form 名）
const idToForm = new Map()
for (const [form, g] of byForm) idToForm.set(g.fId, form)
function chainOf(fId) {
  // 沿 seed 展示 fId -> ... 的原始跳
  const hops = []
  let cur = fId
  const seen = new Set([cur])
  while (seed.has(cur) && hops.length < 8) {
    const nxt = seed.get(cur); hops.push(`${idToForm.get(cur) || cur}(${cur}) → ${idToForm.get(nxt) || nxt}(${nxt})`)
    if (seen.has(nxt)) { hops.push('CYCLE'); break }
    seen.add(nxt); cur = nxt
  }
  return hops.join('  |  ')
}
for (const name of ['blessings', 'savings', 'lowered']) {
  const g = byForm.get(name)
  const g2 = ok(!!g, `② 链式抽查 ${name} 可定位（契约守卫）`)
  if (!g2) continue
  const rep = derived.get(g.fId)
  ok(!!rep, `② ${name} 被折叠`)
  ok(!patchKeys.has(rep), `② ${name} 的目标 ${rep} 未被折叠（终态）`)
  console.log(`   ${name}: ${chainOf(g.fId)}  ⇒ 终态 ${rep}`)
}
// 全量：补丁中不存在「目标本身也被折叠」
let targetFolded = 0
for (const [, rep] of derived) if (patchKeys.has(rep)) targetFolded++
eq(targetFolded, 0, '② 补丁中不存在「目标本身也被折叠」（0）')

// ---------- ② 例外 45 条逐条核销 ----------
section('② 例外清单（声明 45 条）')
eq(exceptions.length, 45, '② 例外条数 == 45')
const byReason = new Map()
for (const e of exceptions) byReason.set(e.reason, (byReason.get(e.reason) || 0) + 1)
console.log('   例外分布: ' + [...byReason.entries()].map(([k, v]) => `${k}=${v}`).join(', '))
let exBad = 0
for (const e of exceptions) {
  const w = byId.get(e.fId)
  if (!w) { exBad++; ok(false, `② 例外 ${e.fId} 不在词库`); continue }
  if (w.lemma) { exBad++; ok(false, `② 例外 ${e.form || e.fId} 不应被折叠，却有 .lemma=${w.lemma}`) }
}
eq(exBad, 0, '② 45 例外逐条核销：words 中均无 .lemma')

// ---------- keep/audit 词形零折叠 ----------
section('① keep/audit 词形零折叠')
let nonAutoFolded = 0, nonAutoChecked = 0
for (const d of draft) {
  if (d.bucket === 'auto-fold') continue
  const p = pairByKey.get(`${d.form}\u0000${d.lemma}`)
  if (!p) { ok(false, `① join 失败 ${d.form}->${d.lemma}`); continue }
  nonAutoChecked++
  if (wordsLemma[p.fId]) nonAutoFolded++
}
eq(nonAutoChecked > 0, true, '① 存在 keep/audit 行')
eq(nonAutoFolded, 0, '① keep/audit 词形零折叠')

// ---------- words 装配一致性 + 计数自洽 ----------
section('①/⑤ words 装配 .lemma 与补丁一致 + 计数')
const wordsFolded = new Map()
for (const w of words) if (w.lemma) wordsFolded.set(w.id, w.lemma)
eq(wordsFolded.size, 9888, '① words 中 .lemma 词数 == 9888')
let wDiff = 0
for (const [id, rep] of wordsFolded) if (wordsLemma[id] !== rep) wDiff++
eq(wDiff, 0, '① words 的 .lemma 值 == 补丁值')
eq(words.length, 64699, '① words.length == 64699')
eq(words.length - wordsFolded.size, 54811, '⑤ 单元数 54811 == 64699-9888')
let targetFold=0, targetMiss=0
for (const [id, rep] of wordsFolded) { const t = byId.get(rep); if (!t) targetMiss++; else if (t.lemma) targetFold++ }
eq(targetMiss, 0, '① 每个 .lemma 目标存在于词库')
eq(targetFold, 0, '① 每个 .lemma 目标自身未折叠')

section('汇总')
console.log(`跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

/**
 * Step-2 屈折归并契约测试（Node 直跑）
 * ------------------------------------------------------------------
 * 跑：npm run test:lemma-fold
 *
 * 两层：
 *   A. 合成用例 —— lib/lemmaFold.js 的读时合并语义（优先级 / tie-break /
 *      不变量 / 空家族 / 防御链式）。
 *   B. 真实数据契约 —— **从 Step-1 产物（draft + pairs）独立推导** id 级映射，
 *      与 src/data/words-entry.js 实际装配出的 `.lemma` 完全对账（含例外核销）。
 *
 * ★ 契约守卫：任何关键查找缺失（join 失败 / 目标不在库）都直接抛错 → 套件变红，
 *   绝不静默跳过（静默跳过会让"漏折叠"永远测不出来）。
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFoldView, isFolded } from '../src/lib/lemmaFold.js'
import { getRecord, emptyRecord } from '../src/lib/learning.js'
import words from '../src/data/words-entry.js'
import { LEMMA_BY_ID } from '../src/data/words-lemma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

let passed = 0
let failed = 0
function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

console.log('[test:lemma-fold]')

// ==================================================================
// A. 合成用例
// ==================================================================
const W = (id, lemma) => (lemma ? { id, form: id, lemma } : { id, form: id })
const rec = (status, cc = 0, lastStudiedAt = null, extra = {}) => ({
  ...emptyRecord(),
  status,
  consecutiveCorrect: cc,
  lastStudiedAt,
  ...extra,
})

test('A1 合并优先级：known > review > unknown（代表形 unknown，子形 known → 取 known）', () => {
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const knownChild = rec('known', 2, '2026-01-01T00:00:00.000Z')
  const rv = buildFoldView(ws, { 'w.r': rec('unknown', 0), 'w.c': knownChild })
  assert.deepEqual(rv.units.map((w) => w.id), ['w.r'], '被折叠形 w.c 不在 units 里')
  assert.equal(rv.records['w.r'].status, 'known', 'known 胜出')
  assert.equal(rv.records['w.c'], undefined, '被折叠形的键被移除')
  assert.equal(rv.records['w.r'], knownChild, '★ 原样取胜者（同一对象引用），不拼接字段')
})

test('A2 合并优先级：review > unknown', () => {
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const rv = buildFoldView(ws, { 'w.r': rec('unknown', 0), 'w.c': rec('review', 0, '2026-01-01T00:00:00.000Z') })
  assert.equal(rv.records['w.r'].status, 'review')
})

test('A3 同级 tie-break：先比 consecutiveCorrect 大者', () => {
  const ws = [W('w.r'), W('w.c1', 'w.r'), W('w.c2', 'w.r')]
  const lo = rec('review', 0, '2026-02-01T00:00:00.000Z')
  const hi = rec('review', 1, '2026-01-01T00:00:00.000Z') // 时间更旧但 cc 更大
  const rv = buildFoldView(ws, { 'w.c1': lo, 'w.c2': hi })
  assert.equal(rv.records['w.r'], hi, 'cc 大者胜（时间不参与，因为 cc 已分胜负）')
})

test('A4 同级 tie-break：cc 相等再比 lastStudiedAt 新者', () => {
  const ws = [W('w.r'), W('w.c1', 'w.r'), W('w.c2', 'w.r')]
  const older = rec('review', 1, '2026-01-01T00:00:00.000Z')
  const newer = rec('review', 1, '2026-03-01T00:00:00.000Z')
  const rv = buildFoldView(ws, { 'w.c1': older, 'w.c2': newer })
  assert.equal(rv.records['w.r'], newer, 'lastStudiedAt 新者胜')
})

test('A5 known 不变量：胜者原样返回，故 known ⇒ consecutiveCorrect >= 2 天然成立', () => {
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const knownChild = rec('known', 2, null)
  const rv = buildFoldView(ws, { 'w.r': rec('review', 1, null), 'w.c': knownChild })
  const win = rv.records['w.r']
  assert.equal(win.status, 'known')
  assert.ok(win.consecutiveCorrect >= 2, 'known 的 cc 不变量成立（未拼接出 known+cc=1 的坏记录）')
})

test('A6 空家族：无任何记录的单元不出现在记录视图中（getRecord 回落空记录）', () => {
  const ws = [W('w.a'), W('w.b', 'w.a'), W('w.c')]
  const rv = buildFoldView(ws, {})
  assert.equal(Object.keys(rv.records).length, 0)
  assert.equal(getRecord(rv.records, 'w.c').status, 'unknown')
})

test('A7 防御链式：a→b→c，记录并入终态 c；多余中间形被移除', () => {
  const ws = [W('w.a', 'w.b'), W('w.b', 'w.c'), W('w.c')]
  const rv = buildFoldView(ws, { 'w.a': rec('known', 2, null), 'w.b': rec('review', 0, null), 'w.c': rec('unknown', 0, null) })
  assert.deepEqual(rv.units.map((w) => w.id), ['w.c'], '只有终态 c 是单元')
  assert.equal(rv.records['w.c'].status, 'known', 'a 的 known 沿链并入 c')
  assert.equal(rv.records['w.a'], undefined)
  assert.equal(rv.records['w.b'], undefined)
})

test('A8 防御成环：a↔b 成环时视作未折叠（不从视图抹掉）', () => {
  const ws = [W('w.a', 'w.b'), W('w.b', 'w.a')]
  const rv = buildFoldView(ws, { 'w.a': rec('known', 2, null), 'w.b': rec('review', 0, null) })
  assert.deepEqual(rv.units.map((w) => w.id).sort(), ['w.a', 'w.b'])
  assert.equal(rv.records['w.a'].status, 'known')
  assert.equal(rv.records['w.b'].status, 'review')
})

test('A9 防御：不在 words 里的键（如私有词）原样保留，不因折叠丢失', () => {
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const rv = buildFoldView(ws, { 'w.c': rec('known', 2, null), 'u.private': rec('review', 0, null) })
  assert.equal(rv.records['u.private'].status, 'review', '私有词记录必须在折叠视图里可见')
  assert.equal(rv.records['w.r'].status, 'known')
  assert.equal(rv.records['w.c'], undefined)
})

test('A10 isFolded：带指向他者的 .lemma 为真；自环 / 空值为假', () => {
  assert.equal(isFolded(W('w.c', 'w.r')), true)
  assert.equal(isFolded(W('w.r')), false)
  assert.equal(isFolded({ id: 'w.x', lemma: 'w.x' }), false, '自环视作未折叠')
  assert.equal(isFolded({ id: 'w.x', lemma: '' }), false)
  assert.equal(isFolded(null), false)
})

// ==================================================================
// B. 真实数据契约
// ==================================================================
const MAX_HOPS = 4
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/.lemma-map.draft.json'), 'utf8'))
const pairs = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/.lemma-pairs.json'), 'utf8'))

// ------------------------------------------------------------------
// B0. 独立推导 id 级映射（不引用生成器，直接按 step2-spec §2 规则复算）
// ------------------------------------------------------------------
function deriveExpectedMap(draftRows, pairRows) {
  const pairByKey = new Map()
  const knownIds = new Set()
  for (const p of pairRows) {
    pairByKey.set(`${p.f}\u0000${p.l}`, p)
    knownIds.add(p.fId)
    knownIds.add(p.lId)
  }
  // join（缺失即抛错停机）
  const byForm = new Map()
  for (const d of draftRows) {
    const p = pairByKey.get(`${d.form}\u0000${d.lemma}`)
    if (!p) throw new Error(`契约守卫：join 失败 ${d.form} -> ${d.lemma}`)
    let g = byForm.get(d.form)
    if (!g) {
      g = { fId: p.fId, rows: [] }
      byForm.set(d.form, g)
    }
    g.rows.push({ lId: p.lId, bucket: d.bucket })
  }
  const resolve = (id, map) => {
    let cur = id
    const seen = new Set([cur])
    let hops = 0
    while (map.has(cur)) {
      if (hops >= MAX_HOPS) return { id: cur, bad: true }
      const next = map.get(cur)
      if (seen.has(next)) return { id, bad: true }
      seen.add(next)
      cur = next
      hops += 1
    }
    return { id: cur, bad: false }
  }
  const seed = new Map()
  const notFolded = new Set()
  // 单行 form
  for (const [form, g] of byForm) {
    if (g.rows.length !== 1) continue
    const r = g.rows[0]
    if (r.bucket !== 'auto-fold') {
      notFolded.add(g.fId)
      continue
    }
    if (r.lId === g.fId) {
      notFolded.add(g.fId)
      continue
    }
    seed.set(g.fId, r.lId)
  }
  // 多行 form
  for (const [form, g] of byForm) {
    if (g.rows.length < 2) continue
    if (g.rows.some((r) => r.bucket !== 'auto-fold')) {
      notFolded.add(g.fId)
      continue
    }
    const reps = g.rows.map((r) => resolve(r.lId, seed))
    const uniq = new Set(reps.map((r) => r.id))
    if (reps.some((r) => r.bad) || uniq.size !== 1) {
      notFolded.add(g.fId)
      continue
    }
    const rep = [...uniq][0]
    if (rep === g.fId) {
      notFolded.add(g.fId)
      continue
    }
    seed.set(g.fId, rep)
  }
  // 终态解析 + 护栏
  const map = new Map()
  for (const [fId, raw] of [...seed.entries()]) {
    const r = resolve(fId, seed)
    if (r.bad || r.id === fId || !knownIds.has(r.id)) {
      notFolded.add(fId)
      continue
    }
    map.set(fId, r.id)
  }
  return { map, notFolded }
}

let expected = null
test('B0 契约守卫：draft × pairs 能全部 join（缺一即 FAIL）', () => {
  expected = deriveExpectedMap(draft, pairs)
  assert.ok(expected.map.size > 0, '至少推导出一些折叠')
})

// ------------------------------------------------------------------
// B1. words 装配
// ------------------------------------------------------------------
const actual = new Map()
for (const w of words) if (w.lemma) actual.set(w.id, w.lemma)

test('B1 词库规模：words 共 64,699 条', () => {
  assert.equal(words.length, 64699)
})

test('B2 .lemma 词数 === 补丁条数（words-lemma.js）', () => {
  assert.equal(actual.size, LEMMA_BY_ID.size, `words 注入 ${actual.size} ≠ 补丁 ${LEMMA_BY_ID.size}`)
  assert.equal(actual.size, expected.map.size, `words 注入 ${actual.size} ≠ 独立推导 ${expected.map.size}`)
})

test('B3 全量对账：words 的实际 .lemma 与独立推导的 id 级映射**完全相等**', () => {
  assert.equal(actual.size, expected.map.size, '键数不一致')
  for (const [id, rep] of expected.map) {
    assert.equal(actual.get(id), rep, `${id} 的 .lemma 应为 ${rep}，实际 ${actual.get(id)}`)
  }
  for (const id of actual.keys()) assert.ok(expected.map.has(id), `多出未预期的折叠：${id}`)
})

test('B4 每个 .lemma 目标存在且未折叠', () => {
  const byId = new Map(words.map((w) => [w.id, w]))
  for (const [id, rep] of actual) {
    const t = byId.get(rep)
    assert.ok(t, `${id} -> ${rep} 目标不在词库`)
    assert.ok(!t.lemma, `${id} -> ${rep} 目标自身又被折叠（应为终态）`)
  }
})

test('B5 例外清单核销：所有「不应折叠」的词形在 words 里都没有 .lemma', () => {
  let checked = 0
  for (const fId of expected.notFolded) {
    const w = words.find((x) => x.id === fId)
    if (!w) continue // 例外可能是 pairs 里的 id，但 words 一定含它
    checked += 1
    assert.equal(w.lemma, undefined, `例外词形不该被折叠：${fId}`)
  }
  assert.ok(checked > 0, '至少有若干例外被核销')
})

test('B6 keep/audit 词形零折叠：非 auto-fold 的 draft 行对应词形无 .lemma', () => {
  const pairByKey = new Map()
  for (const p of pairs) pairByKey.set(`${p.f}\u0000${p.l}`, p)
  let n = 0
  for (const d of draft) {
    if (d.bucket === 'auto-fold') continue
    const p = pairByKey.get(`${d.form}\u0000${d.lemma}`)
    if (!p) throw new Error(`契约守卫：join 失败 ${d.form} -> ${d.lemma}`)
    n += 1
    assert.equal(actual.get(p.fId), undefined, `${d.bucket} 行 ${d.form} 不该被折叠`)
  }
  assert.ok(n > 0, '存在 keep/audit 行')
})

test('B7 计数自洽：单元数 + 折叠数 === 词库总数', () => {
  const units = words.filter((w) => !isFolded(w))
  assert.equal(units.length + actual.size, words.length, '单元数 + 折叠数 应等于总数')
})

test('B8 buildFoldView(words) 的 units 与「未折叠词数」一致，且代表形完整', () => {
  const rv = buildFoldView(words, {})
  assert.equal(rv.units.length, words.length - actual.size)
  // units 里不应残留任何被折叠形
  assert.equal(rv.units.some((w) => w.lemma), false)
})

// ------------------------------------------------------------------
// 汇总
// ------------------------------------------------------------------
console.log(`\n[test:lemma-fold] 跑了 ${passed + failed} / 过 ${passed} / 挂 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

/**
 * QA · Step-2 ③ 运行时模块 / ⑤ 端到端口径 / ⑩ 反例攻击
 * ------------------------------------------------------------------
 * 用法：node scripts/qa-lemma-step2-runtime.mjs
 */
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import * as lemmaFold from '../src/lib/lemmaFold.js'
import { countByStatus, buildReviewQueue, emptyRecord } from '../src/lib/learning.js'
import { words } from '../src/data/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const { buildFoldView, isFolded } = lemmaFold

let N = 0
const FAILS = []
const ok = (c, m) => { N++; if (!c) FAILS.push(m); return c }
const eq = (a, e, m) => ok(a === e, `${m} — expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`)
const section = (t) => console.log(`\n===== ${t} =====`)

const W = (id, lemma) => (lemma ? { id, form: id, lemma } : { id, form: id })
const rec = (status, cc = 0, lastStudiedAt = null) => ({ ...emptyRecord(), status, consecutiveCorrect: cc, lastStudiedAt })

// ==================================================================
section('③ 模块表面：仅 isFolded / buildFoldView 两个导出')
const exportNames = Object.keys(lemmaFold).sort()
console.log('   导出:', exportNames.join(', '))
eq(exportNames.length, 2, '③ 导出数 == 2')
ok(exportNames.includes('isFolded') && exportNames.includes('buildFoldView'), '③ 导出恰为 isFolded/buildFoldView')

// 无副作用：源码不得出现存储/落盘符号
const src = fs.readFileSync(path.join(ROOT, 'src/lib/lemmaFold.js'), 'utf8')
for (const bad of ['localStorage', 'sessionStorage', 'wrc.', 'persist', 'writeFileSync', 'fetch(']) {
  ok(!src.includes(bad), `③ 模块不含副作用符号「${bad}」`)
}

// ==================================================================
section('③ 合成用例（QA 独立构造）')
// C1 优先级 known > review > unknown（代表形 unknown，子形 known）
{
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const kc = rec('known', 2, '2026-01-01T00:00:00.000Z')
  const rv = buildFoldView(ws, { 'w.r': rec('unknown', 0), 'w.c': kc })
  ok(rv.units.map((w) => w.id).join() === 'w.r', '③ C1 子形不在 units')
  ok(rv.records['w.r'].status === 'known', '③ C1 known 胜出')
  ok(rv.records['w.r'] === kc, '③ C1 原样取胜者（同引用）')
  ok(rv.records['w.c'] === undefined, '③ C1 子形键被移除')
}
// C2 同级 cc 大者胜
{
  const ws = [W('w.r'), W('w.c1', 'w.r'), W('w.c2', 'w.r')]
  const lo = rec('review', 0, '2026-02-01T00:00:00.000Z')
  const hi = rec('review', 1, '2026-01-01T00:00:00.000Z')
  const rv = buildFoldView(ws, { 'w.c1': lo, 'w.c2': hi })
  ok(rv.records['w.r'] === hi, '③ C2 cc 大者胜（时间不参与）')
}
// C3 同级 cc 同 → lastStudiedAt 新者胜
{
  const ws = [W('w.r'), W('w.c1', 'w.r'), W('w.c2', 'w.r')]
  const older = rec('review', 1, '2026-01-01T00:00:00.000Z')
  const newer = rec('review', 1, '2026-03-01T00:00:00.000Z')
  const rv = buildFoldView(ws, { 'w.c1': older, 'w.c2': newer })
  ok(rv.records['w.r'] === newer, '③ C3 lastStudiedAt 新者胜')
}
// C4 known 不变量：胜者原样 → known ⇒ cc>=2
{
  const ws = [W('w.r'), W('w.c', 'w.r')]
  const kc = rec('known', 2, null)
  const rv = buildFoldView(ws, { 'w.r': rec('review', 1, null), 'w.c': kc })
  const win = rv.records['w.r']
  ok(win.status === 'known' && win.consecutiveCorrect >= 2, '③ C4 known 记录 cc 不变量成立（未拼接）')
}
// C5 空家族
{
  const ws = [W('w.a'), W('w.b', 'w.a'), W('w.c')]
  const rv = buildFoldView(ws, {})
  eq(Object.keys(rv.records).length, 0, '③ C5 空 records 视图无家族键')
  eq(rv.units.length, 2, '③ C5 单元 = a,c')
}
// C6 防御链式 a→b→c
{
  const ws = [W('w.a', 'w.b'), W('w.b', 'w.c'), W('w.c')]
  const rv = buildFoldView(ws, { 'w.a': rec('known', 2, null), 'w.b': rec('review', 0, null), 'w.c': rec('unknown', 0, null) })
  eq(rv.units.map((w) => w.id).join(), 'w.c', '③ C6 只有终态 c 是单元')
  eq(rv.records['w.c'].status, 'known', '③ C6 a 的 known 沿链并入 c')
  ok(rv.records['w.a'] === undefined && rv.records['w.b'] === undefined, '③ C6 中间键被移除')
}
// C7 输入不被修改：deep-freeze 输入后仍正常
{
  const ws = [Object.freeze(W('w.r')), Object.freeze(W('w.c', 'w.r'))]
  const recs = Object.freeze({ 'w.r': Object.freeze(rec('unknown', 0)), 'w.c': Object.freeze(rec('known', 2, null)) })
  Object.freeze(ws)
  let rv, threw = null
  try { rv = buildFoldView(ws, recs) } catch (e) { threw = e }
  ok(!threw, `③ C7 freeze 输入不抛错${threw ? '（实际:' + threw.message + '）' : ''}`)
  ok(rv && rv.records['w.r'].status === 'known', '③ C7 freeze 输入下结果正确')
  ok(recs['w.c'].status === 'known' && Object.keys(recs).length === 2, '③ C7 入参 records 未被改动')
}

// ==================================================================
section('⑤ 端到端口径（真实 words + 合成 records，复刻 useLearn 顺序）')
eq(words.length, 64699, '⑤ 真实词库 64699')
// excludeProper=false → baseList = words
const baseList = words
const emptyRec = {}
{
  const fold = buildFoldView(baseList, emptyRec)
  const units = fold.units
  const stats = countByStatus(units, fold.records)
  eq(units.length, 54811, '⑤ units == 54811')
  eq(stats.total, 54811, '⑤ countByStatus(units, foldRecords).total == 54811')
  eq(54811 + 9888, 64699, '⑤ 54811 + 9888 == 64699')
  console.log(`   空记录：units ${units.length} | stats.total ${stats.total}`)
}
// 合成：某被折叠子形 known → 代表形浮为 known；子形不在 units
{
  const child = 'w.abandoning', rep = 'w.abandon'
  const fold = buildFoldView(baseList, { [child]: rec('known', 2, '2026-01-01T00:00:00.000Z') })
  const stats = countByStatus(fold.units, fold.records)
  const byIdU = new Set(fold.units.map((w) => w.id))
  ok(!byIdU.has(child), '⑤ 子形不在 units')
  ok(byIdU.has(rep), '⑤ 代表形在 units')
  eq(fold.records[rep].status, 'known', '⑤ 子形 known → 代表形 known')
  eq(fold.records[child], undefined, '⑤ 子形记录键被移除')
  eq(stats.total, 54811, '⑤ total 仍 54811（不因合并改变）')
  eq(stats.known, 1, '⑤ known == 1（代表形继承）')
}
// 复习队列 best-of：子形到期 → 代表形进入复习队列
{
  const child = 'w.abandoning', rep = 'w.abandon'
  const past = new Date(Date.now() - 86400000).toISOString()
  const fold = buildFoldView(baseList, { [child]: { ...emptyRecord(), status: 'review', consecutiveCorrect: 0, nextDueAt: past, statusSource: 'learning' } })
  const q = buildReviewQueue(fold.units, fold.records, 50, new Date().toISOString())
  ok(q.some((w) => w.id === rep), '⑤ 子形到期 → 代表形入复习队列')
  ok(!q.some((w) => w.id === child), '⑤ 子形自身不在队列')
}
// 子形与代表形同时 known → 不重复计数
{
  const child = 'w.abandoning', rep = 'w.abandon'
  const fold = buildFoldView(baseList, { [child]: rec('known', 2, null), [rep]: rec('known', 2, null) })
  const stats = countByStatus(fold.units, fold.records)
  eq(stats.total, 54811, '⑤ 双 known 场景 total 不变')
  eq(stats.known, 1, '⑤ 双 known 只计一次（代表形）')
}

function units0(list) { return buildFoldView(list, {}).units }

// ==================================================================
section('⑩ 反例攻击（预期 vs 实际）')
const attacks = []
function attack(name, expected, fn) {
  let actual, threw = null
  try { actual = fn() } catch (e) { threw = e }
  const pass = threw ? false : actual === expected
  attacks.push({ name, expected, actual: threw ? `THREW:${threw.message}` : actual, pass })
  ok(pass, `⑩ ${name} — 预期 ${expected}，实际 ${threw ? 'THREW:' + threw.message : actual}`)
  console.log(`   [${pass ? 'PASS' : 'FAIL'}] ${name}\n        预期 ${expected} ｜ 实际 ${threw ? 'THREW:' + threw.message : actual}`)
}
// 攻1：known 子形 + review 代表形 → 取 known
attack('known 子形 + review 代表形 → 取 known',
  'known',
  () => buildFoldView([W('w.r'), W('w.c', 'w.r')], { 'w.r': rec('review', 5, '2026-05-01T00:00:00Z'), 'w.c': rec('known', 2, '2026-01-01T00:00:00Z') }).records['w.r'].status)
// 攻2：三跳链 a→b→c→d，a 的 known 落到终态 d
attack('三跳链 a→b→c→d：a 的记录并入终态 d，units 仅 d',
  'w.d|known',
  () => {
    const ws = [W('w.a', 'w.b'), W('w.b', 'w.c'), W('w.c', 'w.d'), W('w.d')]
    const rv = buildFoldView(ws, { 'w.a': rec('known', 2, null) })
    return `${rv.units.map((w) => w.id).join()}|${rv.records['w.d'].status}`
  })
// 攻3：子形与代表形同时 known → 计数不重复
attack('子形与代表形同时 known → known 计 1、total 2',
  'total=2,known=1',
  () => {
    const ws = [W('w.r'), W('w.c', 'w.r'), W('w.other')]
    const s = countByStatus(ws.filter((w) => !isFolded(w)), buildFoldView(ws, { 'w.r': rec('known', 2, null), 'w.c': rec('known', 2, null) }).records)
    return `total=${s.total},known=${s.known}`
  })
// 攻4：w.lemma 指向不存在 id（防御）
attack('w.lemma 指向不存在 id：不崩、子形移出 units、记录挂到缺失 id',
  'units=w.b|repKeyPresent=true|childKeyGone=true',
  () => {
    const ws = [W('w.a', 'w.missing'), W('w.b')]
    const rv = buildFoldView(ws, { 'w.a': rec('known', 2, null) })
    return `units=${rv.units.map((w) => w.id).join()}|repKeyPresent=${'w.missing' in rv.records}|childKeyGone=${!('w.a' in rv.records)}`
  })
// 攻5：自环词形视作未折叠（不抹掉）
attack('自环 lemma===id 视作未折叠，仍在 units',
  'units=w.x|isFolded=false',
  () => {
    const ws = [W('w.x', 'w.x')]
    const rv = buildFoldView(ws, {})
    return `units=${rv.units.map((w) => w.id).join()}|isFolded=${isFolded(W('w.x', 'w.x'))}`
  })
// 攻6：keep 词误折应无（真实数据抽验，代表形不折叠）
attack('真实数据：keep 词形（如 thanks→thank 的 thank 族成员）中无「目标被折叠」',
  '0',
  () => {
    const byId = new Map(words.map((w) => [w.id, w]))
    let bad = 0
    for (const w of words) if (w.lemma) { const t = byId.get(w.lemma); if (!t || t.lemma) bad++ }
    return String(bad)
  })

section('汇总')
console.log(`跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

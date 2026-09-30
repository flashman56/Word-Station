/**
 * 学习状态机 / 迁移 / 派生的断言测试（纯 Node ESM，零依赖）
 * ------------------------------------------------------------------
 * 覆盖：三态迁移全表、我会了、退回复习、清空、不变量 1~5、
 *       两个队列的排序与截断、去重统计、validateRecords 拒绝脏数据、
 *       v1→v2 迁移映射表与原子写入、derive 的三态口径与词库分母。
 *
 * 跑：npm run test:learning
 */
import {
  LEARN_STATUS,
  MASTER_THRESHOLD,
  DEFAULT_ROUND_SIZE,
  LEARN_STORE_VERSION,
  STATUS_SOURCE,
  INCORRECT_DUE_MS,
  emptyRecord,
  getRecord,
  applyAnswer,
  markKnown,
  retreatToReview,
  resetRecord,
  statusLabel,
  isMastered,
  isReviewDue,
  buildLearnQueue,
  buildReviewQueue,
  defaultFamilyKeyOf,
  countByStatus,
  validateRecords,
} from '../src/lib/learning.js'
import { migrateV1toV2, runMigration, KEYS } from '../src/lib/migrate.js'
import { STATS_SCOPE, AUTO_KNOWN_RANK, effectiveStatus, autoKnown } from '../src/lib/derive.js'
import { words as REAL_WORDS } from '../src/data/index.js'

const T0 = '2026-09-26T00:00:00.000Z'
const T1 = '2026-09-26T00:01:00.000Z'
const T2 = '2026-09-26T00:02:00.000Z'

let pass = 0
let fail = 0
const failures = []

function check(name, fn) {
  try {
    fn()
    pass += 1
  } catch (e) {
    fail += 1
    failures.push(`${name}\n    ${e.message}`)
  }
}

function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) throw new Error(`${msg} 期望 ${b}，实际 ${a}`)
}

function ok(v, msg = '断言失败') {
  if (!v) throw new Error(msg)
}

// ---------------------------------------------------------------- 常量

check('常量取值符合约定', () => {
  eq(LEARN_STATUS, ['unknown', 'review', 'known'])
  eq(MASTER_THRESHOLD, 2)
  eq(DEFAULT_ROUND_SIZE, 10)
  eq(LEARN_STORE_VERSION, 2)
  // 增量3：setReview 手工加入待复习会产生 statusSource='manual'，已纳入白名单（否则导出再导入会被校验拒绝）
  eq(STATUS_SOURCE, ['initial', 'learning', 'manual-known', 'manual-retreat', 'manual', 'migration'])
})

check('emptyRecord 默认值', () => {
  eq(emptyRecord(), {
    status: 'unknown',
    correctCount: 0,
    consecutiveCorrect: 0,
    incorrectCount: 0,
    lastStudiedAt: null,
    lastResult: null,
    lastIncorrectAt: null,
    nextDueAt: null,
    statusChangedAt: null,
    statusSource: 'initial',
  })
})

check('emptyRecord 每次返回新对象（不共享引用）', () => {
  const a = emptyRecord()
  const b = emptyRecord()
  a.status = 'known'
  eq(b.status, 'unknown')
})

// ---------------------------------------------------------------- getRecord

check('getRecord 缺失时返回 emptyRecord 且不写回入参', () => {
  const records = {}
  const r = getRecord(records, 'w.nope')
  eq(r.status, 'unknown')
  eq(Object.keys(records).length, 0)
})

check('getRecord 容忍 records 为 undefined / null', () => {
  eq(getRecord(undefined, 'w.a').status, 'unknown')
  eq(getRecord(null, 'w.a').status, 'unknown')
})

check('getRecord 补全缺字段的脏记录', () => {
  const r = getRecord({ 'w.a': { status: 'review' } }, 'w.a')
  eq(r.status, 'review')
  eq(r.correctCount, 0)
  eq(r.statusSource, 'initial')
})

// ---------------------------------------------------------------- 状态机全表

check('unknown 答对第 1 次：仍 unknown，连续=1，展示「学习中 1/2」', () => {
  const { record, statusChanged, mastered } = applyAnswer(emptyRecord(), 'correct', T0)
  eq(record.status, 'unknown')
  eq(record.consecutiveCorrect, 1)
  eq(record.correctCount, 1)
  eq(record.incorrectCount, 0)
  eq(record.lastResult, 'correct')
  eq(record.lastStudiedAt, T0)
  eq(record.statusSource, 'learning')
  eq(statusChanged, false)
  eq(mastered, false)
  eq(statusLabel(record), '学习中 1/2')
})

check('unknown 连续答对第 2 次：进 known，mastered=true', () => {
  const first = applyAnswer(emptyRecord(), 'correct', T0).record
  const { record, statusChanged, mastered } = applyAnswer(first, 'correct', T1)
  eq(record.status, 'known')
  eq(record.consecutiveCorrect, 2)
  eq(record.correctCount, 2)
  eq(record.statusChangedAt, T1)
  eq(statusChanged, true)
  eq(mastered, true)
  eq(statusLabel(record), '已掌握')
  ok(isMastered(record))
})

check('unknown 答错：进 review、连续归零、incorrectCount+1、写 lastIncorrectAt', () => {
  const { record, statusChanged, mastered } = applyAnswer(emptyRecord(), 'incorrect', T0)
  eq(record.status, 'review')
  eq(record.consecutiveCorrect, 0)
  eq(record.correctCount, 0)
  eq(record.incorrectCount, 1)
  eq(record.lastResult, 'incorrect')
  eq(record.lastIncorrectAt, T0)
  eq(statusChanged, true)
  eq(mastered, false)
})

check('review 答对第 1 次：仍 review（不回 unknown），连续=1', () => {
  const review = applyAnswer(emptyRecord(), 'incorrect', T0).record
  const { record, statusChanged } = applyAnswer(review, 'correct', T1)
  eq(record.status, 'review')
  eq(record.consecutiveCorrect, 1)
  eq(record.correctCount, 1)
  eq(statusChanged, false)
  eq(statusLabel(record), '复习中 1/2')
})

check('review 连续答对第 2 次：进 known', () => {
  let r = applyAnswer(emptyRecord(), 'incorrect', T0).record
  r = applyAnswer(r, 'correct', T1).record
  const { record, mastered } = applyAnswer(r, 'correct', T2)
  eq(record.status, 'known')
  eq(record.consecutiveCorrect, 2)
  eq(mastered, true)
})

check('review 答错：仍 review，连续归零，incorrectCount 累加', () => {
  let r = applyAnswer(emptyRecord(), 'incorrect', T0).record
  r = applyAnswer(r, 'correct', T1).record
  const { record, statusChanged } = applyAnswer(r, 'incorrect', T2)
  eq(record.status, 'review')
  eq(record.consecutiveCorrect, 0)
  eq(record.incorrectCount, 2)
  eq(record.lastIncorrectAt, T2)
  eq(statusChanged, false)
})

check('known 答错：回 review，连续归零', () => {
  let r = applyAnswer(emptyRecord(), 'correct', T0).record
  r = applyAnswer(r, 'correct', T1).record
  eq(r.status, 'known')
  const { record, statusChanged } = applyAnswer(r, 'incorrect', T2)
  eq(record.status, 'review')
  eq(record.consecutiveCorrect, 0)
  eq(record.incorrectCount, 1)
  eq(statusChanged, true)
})

check('known 答对：保持 known，correctCount 继续累加', () => {
  let r = applyAnswer(emptyRecord(), 'correct', T0).record
  r = applyAnswer(r, 'correct', T1).record
  const { record, statusChanged } = applyAnswer(r, 'correct', T2)
  eq(record.status, 'known')
  eq(record.correctCount, 3)
  eq(statusChanged, false)
})

check("'wrong' 是 'incorrect' 的别名", () => {
  const a = applyAnswer(emptyRecord(), 'wrong', T0).record
  const b = applyAnswer(emptyRecord(), 'incorrect', T0).record
  eq(a, b)
})

check('applyAnswer 未知 result 抛错', () => {
  let threw = false
  try {
    applyAnswer(emptyRecord(), 'maybe', T0)
  } catch {
    threw = true
  }
  ok(threw, '未知 result 应当抛错')
})

check('applyAnswer 不修改入参', () => {
  const before = emptyRecord()
  const snapshot = JSON.stringify(before)
  applyAnswer(before, 'correct', T0)
  applyAnswer(before, 'incorrect', T0)
  markKnown(before, T0)
  eq(JSON.stringify(before), snapshot)
})

// ---------------------------------------------------------------- 我会了 / 退回 / 清空

check('markKnown：直达 known、连续置 2、不涨 correctCount、不写答题时间', () => {
  const base = { ...emptyRecord(), correctCount: 3, incorrectCount: 2, lastResult: 'incorrect' }
  const r = markKnown(base, T1)
  eq(r.status, 'known')
  eq(r.consecutiveCorrect, 2)
  eq(r.correctCount, 3, 'correctCount 不应变化')
  eq(r.incorrectCount, 2)
  eq(r.lastResult, 'incorrect')
  eq(r.lastStudiedAt, null, '「我会了」不算真实答题')
  eq(r.statusSource, 'manual-known')
  eq(r.statusChangedAt, T1)
})

check('markKnown 从 review 直达 known 同样置 2', () => {
  const review = applyAnswer(emptyRecord(), 'incorrect', T0).record
  const r = markKnown(review, T1)
  eq(r.status, 'known')
  eq(r.consecutiveCorrect, 2)
  eq(r.incorrectCount, 1, '累计答错次数保留')
})

check('retreatToReview：进 review、连续归零、累计数据保留', () => {
  const k = { ...markKnown(emptyRecord(), T0), correctCount: 4, incorrectCount: 1 }
  const back = retreatToReview(k, T1)
  eq(back.status, 'review')
  eq(back.consecutiveCorrect, 0)
  eq(back.correctCount, 4, '累计答对保留')
  eq(back.incorrectCount, 1, '累计答错保留')
  eq(back.statusSource, 'manual-retreat')
  eq(back.statusChangedAt, T1)
})

check('retreatToReview 后连答 2 次可重新达标', () => {
  let k = markKnown(emptyRecord(), T0)
  k = retreatToReview(k, T1)
  k = applyAnswer(k, 'correct', T1).record
  eq(k.status, 'review')
  k = applyAnswer(k, 'correct', T2).record
  eq(k.status, 'known')
})

check('resetRecord：回到 unknown，计数与时间全部归零', () => {
  let r = applyAnswer(emptyRecord(), 'incorrect', T0).record
  r = { ...r, correctCount: 5, statusSource: 'learning' }
  const cleared = resetRecord(T1)
  eq(cleared.status, 'unknown')
  eq(cleared.correctCount, 0)
  eq(cleared.consecutiveCorrect, 0)
  eq(cleared.incorrectCount, 0)
  eq(cleared.lastResult, null)
  eq(cleared.lastIncorrectAt, null)
  eq(cleared.statusSource, 'initial')
})

// ---------------------------------------------------------------- 不变量

check('不变量：known ⇒ consecutiveCorrect >= 2（迁移/我会了/答题三者都满足）', () => {
  const samples = [
    markKnown(emptyRecord(), T0),
    applyAnswer(applyAnswer(emptyRecord(), 'correct', T0).record, 'correct', T1).record,
    { ...emptyRecord(), status: 'known', consecutiveCorrect: 2, statusSource: 'migration' },
  ]
  samples.forEach((r) => {
    eq(r.status, 'known')
    ok(r.consecutiveCorrect >= MASTER_THRESHOLD, `known 但连续=${r.consecutiveCorrect}`)
  })
})

check('不变量：非 known ⇒ consecutiveCorrect < 2', () => {
  let r = applyAnswer(emptyRecord(), 'correct', T0).record
  ok(r.consecutiveCorrect < MASTER_THRESHOLD)
  const wrong = applyAnswer(r, 'incorrect', T1).record
  ok(wrong.consecutiveCorrect < MASTER_THRESHOLD)
})

check('不变量：计数非负整数', () => {
  const r = applyAnswer(applyAnswer(emptyRecord(), 'incorrect', T0).record, 'incorrect', T1).record
  ;['correctCount', 'consecutiveCorrect', 'incorrectCount'].forEach((f) => {
    ok(Number.isInteger(r[f]) && r[f] >= 0, `${f} 非法：${r[f]}`)
  })
})

// ---------------------------------------------------------------- 队列

const W = (id, form, freqRank, cefrScore) => ({ id, form, freqRank, cefrScore })

// ---------------------------------------------------------------- 最小到期调度（nextDueAt）

check('答错：nextDueAt = 答题时刻 + 1 天（唯一调度规则）', () => {
  const { record } = applyAnswer(emptyRecord(), 'incorrect', T0)
  eq(record.nextDueAt, '2026-09-27T00:00:00.000Z')
})

check('答对：不触碰 nextDueAt（保持原值）', () => {
  const wrong = applyAnswer(emptyRecord(), 'incorrect', T0).record
  const right = applyAnswer(wrong, 'correct', T1).record
  eq(right.nextDueAt, '2026-09-27T00:00:00.000Z')
  eq(right.status, 'review')
})

check('isReviewDue：无 nextDueAt / 过期 → 到期；未来 → 未到期（旧记录兼容）', () => {
  eq(isReviewDue({ status: 'review' }, T1), true, '旧记录无 nextDueAt 视作已到期')
  eq(isReviewDue({ status: 'review', nextDueAt: '2026-09-26T00:00:00.000Z' }, T1), true)
  eq(isReviewDue({ status: 'review', nextDueAt: '2026-09-27T00:00:00.000Z' }, T1), false)
  eq(isReviewDue(null, T1), true)
  eq(isReviewDue({ nextDueAt: '垃圾数据' }, T1), true, '非法 nextDueAt 兜底为到期')
})

check('buildReviewQueue 只排已到期词，未到期不排（含 now 缺省走系统时钟）', () => {
  const words = [W('w.due', 'a', 1000, 1), W('w.future', 'b', 2000, 1), W('w.old', 'c', 3000, 1)]
  const records = {
    'w.due': { ...emptyRecord(), status: 'review', nextDueAt: T0 },
    'w.future': { ...emptyRecord(), status: 'review', nextDueAt: '2026-09-27T00:00:00.000Z' },
    'w.old': { ...emptyRecord(), status: 'review' },
  }
  eq(
    buildReviewQueue(words, records, 10, T1).map((w) => w.id),
    ['w.due', 'w.old'],
    '未到期的 w.future 不排；旧记录 w.old 与到期 w.due 正常排入（按 freqRank 排序）',
  )
})

// ---------------------------------------------------------------- 词族成组（需求1）

/** 词族测试用 familyKeyOf：按 morphs[0]（无词素 → null 散词） */
const famKey = (w) => (Array.isArray(w.morphs) && w.morphs.length ? w.morphs[0] : null)

check('defaultFamilyKeyOf：优先词根（r.*），morphTypeOf 可用则按 type', () => {
  eq(defaultFamilyKeyOf({ morphs: ['p.ex', 'r.spect'] }), 'r.spect', '按 id 约定取词根')
  eq(
    defaultFamilyKeyOf({ morphs: ['p.ex', 'r.spect'] }, (id) => (id === 'r.spect' ? 'root' : 'prefix')),
    'r.spect',
  )
  eq(defaultFamilyKeyOf({ morphs: ['p.re'] }), 'p.re', '无词根取第一个词素')
  eq(defaultFamilyKeyOf({ morphs: [] }), null, '无词素 → 散词')
  eq(defaultFamilyKeyOf(null), null)
})

check('buildLearnQueue groupByFamily：同族词连续成组，散词不成组硬凑', () => {
  const words = [
    { id: 'w.spect.1', form: 'a', freqRank: 100, cefrScore: 1, morphs: ['r.spect'] },
    { id: 'w.loose', form: 'b', freqRank: 200, cefrScore: 1, morphs: [] },
    { id: 'w.spect.2', form: 'c', freqRank: 300, cefrScore: 1, morphs: ['r.spect'] },
    { id: 'w.port.1', form: 'd', freqRank: 400, cefrScore: 1, morphs: ['r.port'] },
    { id: 'w.spect.3', form: 'e', freqRank: 500, cefrScore: 1, morphs: ['r.spect'] },
    { id: 'w.loose.2', form: 'f', freqRank: 600, cefrScore: 1, morphs: [] },
  ]
  const q = buildLearnQueue(words, {}, 10, { groupByFamily: true, familyKeyOf: famKey })
  eq(
    q.map((w) => w.id),
    ['w.spect.1', 'w.spect.2', 'w.spect.3', 'w.loose', 'w.port.1', 'w.loose.2'],
    'spect 三词连续成组（族序=族首词位置），散词各占原位不成组',
  )
  // 关开关 → 回退原排序
  const qOff = buildLearnQueue(words, {}, 10)
  eq(
    qOff.map((w) => w.id),
    ['w.spect.1', 'w.loose', 'w.spect.2', 'w.port.1', 'w.spect.3', 'w.loose.2'],
  )
  // size 截断优先保族完整（能装多少装多少，不跨族拼凑由下轮自然续上）
  const qCut = buildLearnQueue(words, {}, 4, { groupByFamily: true, familyKeyOf: famKey })
  eq(qCut.map((w) => w.id), ['w.spect.1', 'w.spect.2', 'w.spect.3', 'w.loose'])
})

check('buildLearnQueue groupByFamily：只聚 unknown，grouped 开关默认关闭', () => {
  const words = [
    { id: 'w.a', form: 'a', freqRank: 100, cefrScore: 1, morphs: ['r.spect'] },
    { id: 'w.b', form: 'b', freqRank: 200, cefrScore: 1, morphs: ['r.spect'] },
    { id: 'w.c', form: 'c', freqRank: 300, cefrScore: 1, morphs: ['r.spect'] },
  ]
  const records = { 'w.b': { ...emptyRecord(), status: 'known', consecutiveCorrect: 2 } }
  eq(buildLearnQueue(words, records, 10).map((w) => w.id), ['w.a', 'w.c'], '缺省不分组')
  eq(
    buildLearnQueue(words, records, 10, { groupByFamily: true, familyKeyOf: famKey }).map((w) => w.id),
    ['w.a', 'w.c'],
    'known 不进队列',
  )
})

check('validateRecords：nextDueAt 可缺省 / null，非法值拒绝', () => {
  eq(validateRecords({ a: { ...emptyRecord(), status: 'review' } }).ok, true)
  eq(validateRecords({ a: { ...emptyRecord(), status: 'review', nextDueAt: null } }).ok, true)
  eq(validateRecords({ a: { ...emptyRecord(), status: 'review', nextDueAt: T1 } }).ok, true)
  eq(validateRecords({ a: { ...emptyRecord(), status: 'review', nextDueAt: 'not-a-date' } }).ok, false)
  eq(validateRecords({ a: { ...emptyRecord(), status: 'review', nextDueAt: 123 } }).ok, false)
})

check('buildLearnQueue 只取 unknown，按 freqRank → cefrScore → form 排序', () => {
  const words = [
    W('w.c', 'c', 3000, 3),
    W('w.a', 'a', 9000, 2),
    W('w.b', 'b', 3000, 1),
    W('w.d', 'd', 3000, 1),
  ]
  const q = buildLearnQueue(words, {}, 10)
  eq(
    q.map((w) => w.id),
    ['w.b', 'w.d', 'w.c', 'w.a'],
    '同 freqRank 按 cefrScore 升序，再按 form 兜底',
  )
})

check('buildLearnQueue 排除 review / known，且被 size 截断', () => {
  const words = [W('w.1', 'a', 1000, 1), W('w.2', 'b', 2000, 1), W('w.3', 'c', 3000, 1)]
  const records = {
    'w.1': { ...emptyRecord(), status: 'known', consecutiveCorrect: 2 },
    'w.2': { ...emptyRecord(), status: 'review' },
  }
  eq(
    buildLearnQueue(words, records, 10).map((w) => w.id),
    ['w.3'],
  )
  eq(buildLearnQueue(words, {}, 2).map((w) => w.id), ['w.1', 'w.2'])
})

check('buildLearnQueue 答对 1 次的词仍是 unknown，下轮可再现', () => {
  const words = [W('w.x', 'x', 5000, 2)]
  const r = applyAnswer(emptyRecord(), 'correct', T0).record
  eq(
    buildLearnQueue(words, { 'w.x': r }, 10).map((w) => w.id),
    ['w.x'],
  )
})

check('buildReviewQueue 排序：连续升序 → 答错降序 → 最近答错升序（null 最后）→ freqRank → form', () => {
  const mk = (id, form, freqRank, cc, ic, lastAt) => ({
    id,
    form,
    freqRank,
    record: { ...emptyRecord(), status: 'review', consecutiveCorrect: cc, incorrectCount: ic, lastIncorrectAt: lastAt },
  })
  const defs = [
    mk('w.1', 'alpha', 5000, 1, 3, T2),
    mk('w.2', 'beta', 5000, 0, 1, null),
    mk('w.3', 'gamma', 5000, 0, 5, T0),
    mk('w.4', 'delta', 5000, 0, 5, T1),
    mk('w.5', 'echo', 4000, 0, 5, T0),
  ]
  const words = defs.map((d) => W(d.id, d.form, d.freqRank, 3))
  const records = Object.fromEntries(defs.map((d) => [d.id, d.record]))

  eq(
    buildReviewQueue(words, records, 10).map((w) => w.id),
    ['w.5', 'w.3', 'w.4', 'w.2', 'w.1'],
    'w.5 连续0错5最早；w.3 早于 w.4；w.2 null 排在同组最后；w.1 连续1排最后',
  )
})

check('buildReviewQueue 排除 unknown / known，且被 size 截断', () => {
  const words = [W('w.1', 'a', 1000, 1), W('w.2', 'b', 2000, 1), W('w.3', 'c', 3000, 1)]
  const records = {
    'w.1': { ...emptyRecord(), status: 'known', consecutiveCorrect: 2 },
    'w.2': { ...emptyRecord(), status: 'unknown' },
    'w.3': { ...emptyRecord(), status: 'review' },
  }
  eq(
    buildReviewQueue(words, records, 10).map((w) => w.id),
    ['w.3'],
  )
  const all = [W('w.1', 'a', 1000, 1), W('w.2', 'b', 2000, 1), W('w.3', 'c', 3000, 1)]
  const rs = Object.fromEntries(all.map((w) => [w.id, { ...emptyRecord(), status: 'review' }]))
  eq(buildReviewQueue(all, rs, 2).length, 2)
})

check('队列结果稳定：同样入参调用两次结果一致', () => {
  const words = [W('w.b', 'b', 3000, 2), W('w.a', 'a', 3000, 2), W('w.c', 'c', 1000, 5)]
  const records = { 'w.a': { ...emptyRecord(), status: 'review', incorrectCount: 2, lastIncorrectAt: T1 } }
  const q1 = buildLearnQueue(words, records, 10).map((w) => w.id)
  const q2 = buildLearnQueue(words, records, 10).map((w) => w.id)
  eq(q1, q2)
})

check('队列默认 size 为 DEFAULT_ROUND_SIZE', () => {
  const words = Array.from({ length: 25 }, (_, i) => W(`w.${i}`, `f${String(i).padStart(2, '0')}`, i, 1))
  eq(buildLearnQueue(words, {}, undefined).length, DEFAULT_ROUND_SIZE)
})

// ---------------------------------------------------------------- 统计

check('countByStatus 按 word.id 去重，三态和 = total', () => {
  const words = [W('w.a', 'a', 1, 1), W('w.a', 'a', 1, 1), W('w.b', 'b', 2, 1), W('w.c', 'c', 3, 1)]
  const records = {
    'w.a': { ...emptyRecord(), status: 'known', consecutiveCorrect: 2 },
    'w.b': { ...emptyRecord(), status: 'review' },
  }
  const s = countByStatus(words, records)
  eq(s, { unknown: 1, review: 1, known: 1, total: 3 })
  eq(s.unknown + s.review + s.known, s.total)
})

check('countByStatus 空 records 时全为 unknown', () => {
  const words = [W('w.a', 'a', 1, 1), W('w.b', 'b', 2, 1)]
  eq(countByStatus(words, {}), { unknown: 2, review: 0, known: 0, total: 2 })
  eq(countByStatus([], {}), { unknown: 0, review: 0, known: 0, total: 0 })
})

// ---------------------------------------------------------------- 校验

check('validateRecords 通过合法记录', () => {
  const res = validateRecords({
    'w.a': { ...emptyRecord(), status: 'known', consecutiveCorrect: 2, statusSource: 'migration' },
    'w.b': { ...emptyRecord(), status: 'review' },
  })
  eq(res.ok, true)
  eq(res.errors, [])
})

check('validateRecords 拒绝非对象', () => {
  eq(validateRecords(null).ok, false)
  eq(validateRecords([]).ok, false)
  eq(validateRecords('x').ok, false)
})

check('validateRecords 拒绝非法 status', () => {
  const res = validateRecords({ 'w.a': { ...emptyRecord(), status: 'new' } })
  eq(res.ok, false)
  ok(res.errors.some((e) => e.includes('status 非法')))
})

check('validateRecords 拒绝负的 / 小数的 / 非数字计数', () => {
  const bad = [
    { ...emptyRecord(), correctCount: -1 },
    { ...emptyRecord(), consecutiveCorrect: 1.5 },
    { ...emptyRecord(), incorrectCount: '2' },
  ]
  eq(validateRecords({ a: bad[0], b: bad[1], c: bad[2] }).ok, false)
})

check('validateRecords 拒绝违反 known ⇔ 连续数不变量的记录', () => {
  eq(validateRecords({ a: { ...emptyRecord(), status: 'known', consecutiveCorrect: 0 } }).ok, false)
  eq(validateRecords({ b: { ...emptyRecord(), status: 'unknown', consecutiveCorrect: 2 } }).ok, false)
})

check('validateRecords 拒绝非法 lastResult / statusSource', () => {
  eq(validateRecords({ a: { ...emptyRecord(), lastResult: 'maybe' } }).ok, false)
  eq(validateRecords({ b: { ...emptyRecord(), statusSource: 'unknown-origin' } }).ok, false)
})

check('validateRecords 拒绝非对象条目', () => {
  eq(validateRecords({ a: 'known', b: null }).ok, false)
})

// ---------------------------------------------------------------- 迁移（v1 → v2）

/** 极简 localStorage 替身，只在测试里用 */
function fakeStorage() {
  const store = new Map()
  return {
    store,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  }
}

const MW = (id, freqRank) => ({ id, form: id.slice(2), freqRank, cefr: 'B1' })
const M_WORDS = [
  MW('w.hi1', 800), // 高频、无手工记录 → 继承 known
  MW('w.hi2', 2400), // 高频、手工 new → unknown（不覆盖手工）
  MW('w.mid', 5000), // 中频、无手工记录 → unknown
  MW('w.known', 9000), // 手工 known
  MW('w.review', 9001), // 手工 review
]

check('迁移映射：手工 known → known、review → review、new → unknown', () => {
  const { records } = migrateV1toV2({
    legacyStatus: { 'w.known': 'known', 'w.review': 'review', 'w.hi2': 'new' },
    words: M_WORDS,
    inheritFreqKnown: false,
    now: T0,
  })
  eq(records['w.known'].status, 'known')
  eq(records['w.known'].consecutiveCorrect, 2, 'known 必须满足连续 >= 2')
  eq(records['w.known'].statusSource, 'migration')
  eq(records['w.review'].status, 'review')
  eq(records['w.review'].consecutiveCorrect, 0)
  eq(records['w.hi2'], undefined, '手工 new === unknown，不预写空记录')
})

check('迁移映射：迁移来的 known 计数全 0，不伪造答题历史', () => {
  const { records } = migrateV1toV2({
    legacyStatus: { 'w.known': 'known' },
    words: M_WORDS,
    inheritFreqKnown: false,
    now: T0,
  })
  eq(records['w.known'].correctCount, 0)
  eq(records['w.known'].incorrectCount, 0)
  eq(records['w.known'].lastStudiedAt, null)
  eq(records['w.known'].lastResult, null)
})

check('迁移映射：inheritFreqKnown=true 时高频无记录词继承 known，且被计入 inheritedByFreq', () => {
  const { records, report } = migrateV1toV2({
    legacyStatus: {},
    words: M_WORDS,
    inheritFreqKnown: true,
    freqRankLine: AUTO_KNOWN_RANK,
    now: T0,
  })
  eq(records['w.hi1'].status, 'known')
  eq(records['w.hi2'].status, 'known')
  eq(records['w.mid'], undefined)
  eq(report.inheritedByFreq, 2)
  eq(report.dropped, 0)
})

check('迁移映射：inheritFreqKnown=false 时高频词一律 unknown', () => {
  const { records, report } = migrateV1toV2({
    legacyStatus: {},
    words: M_WORDS,
    inheritFreqKnown: false,
    now: T0,
  })
  eq(records['w.hi1'], undefined)
  eq(report.inheritedByFreq, 0)
  eq(report.known, 0)
})

check('迁移映射：手工记录优先于词频继承（手工 new 的高频词不继承）', () => {
  const { records } = migrateV1toV2({
    legacyStatus: { 'w.hi2': 'new' },
    words: M_WORDS,
    inheritFreqKnown: true,
    now: T0,
  })
  eq(records['w.hi2'], undefined)
})

check('迁移映射：失效 wordId 不写入 v2，只计入 dropped', () => {
  const { records, report } = migrateV1toV2({
    legacyStatus: { 'w.ghost': 'known', 'w.gone': 'review' },
    words: M_WORDS,
    inheritFreqKnown: false,
    now: T0,
  })
  eq(records['w.ghost'], undefined)
  eq(records['w.gone'], undefined)
  eq(report.dropped, 2)
})

check('迁移映射：report 的三态之和等于去重后的总词数', () => {
  const { report } = migrateV1toV2({
    legacyStatus: { 'w.known': 'known', 'w.review': 'review', 'w.ghost': 'known' },
    words: M_WORDS,
    inheritFreqKnown: true,
    now: T0,
  })
  eq(report.known + report.review + report.unknown, 5)
  eq(report.migratedManual, 2, '失效的 w.ghost 不计入手工迁移数')
  eq(report.dropped, 1)
})

check('迁移映射：结果必须通过 validateRecords', () => {
  const { records } = migrateV1toV2({
    legacyStatus: { 'w.known': 'known', 'w.review': 'review' },
    words: M_WORDS,
    inheritFreqKnown: true,
    now: T0,
  })
  eq(validateRecords(records).ok, true)
})

check('runMigration：写备份 → 写 v2 → 写标记，且 v1 原样不动', () => {
  globalThis.localStorage = fakeStorage()
  localStorage.setItem(KEYS.statusV1, JSON.stringify({ 'w.known': 'known' }))
  const res = runMigration({ words: M_WORDS, inheritFreqKnown: true, now: T0 })
  eq(res.ok, true)
  ok(localStorage.getItem(KEYS.learn) != null, '应写入 wrc.learn.v2')
  ok(localStorage.getItem(KEYS.settings) != null, '应写入 wrc.settings.v2')
  ok(localStorage.getItem(KEYS.migration) != null, '应写入迁移标记')
  ok(localStorage.getItem(KEYS.statusV1Backup) != null, '应写入状态备份')
  eq(localStorage.getItem(KEYS.statusV1), JSON.stringify({ 'w.known': 'known' }), 'v1 不得被改写')
  const learn = JSON.parse(localStorage.getItem(KEYS.learn))
  eq(learn.version, 2)
  eq(learn.records['w.known'].status, 'known')
})

check('runMigration：幂等，第二次调用直接跳过且不重写备份', () => {
  globalThis.localStorage = fakeStorage()
  localStorage.setItem(KEYS.statusV1, JSON.stringify({ 'w.known': 'known' }))
  runMigration({ words: M_WORDS, inheritFreqKnown: true, now: T0 })
  const backupAfterFirst = localStorage.getItem(KEYS.statusV1Backup)
  localStorage.setItem(KEYS.statusV1Backup, '{"tampered":true}')
  const second = runMigration({ words: M_WORDS, inheritFreqKnown: true, now: T1 })
  eq(second.ok, true)
  eq(second.skipped, true)
  eq(localStorage.getItem(KEYS.statusV1Backup), '{"tampered":true}', '备份只写一次')
  ok(backupAfterFirst != null)
})

check('runMigration：写入失败时不留下半份 v2', () => {
  globalThis.localStorage = fakeStorage()
  const realSet = localStorage.setItem
  localStorage.setItem = (k, v) => {
    if (k === KEYS.learn) throw new Error('磁盘满')
    realSet.call(localStorage, k, v)
  }
  const res = runMigration({ words: M_WORDS, inheritFreqKnown: true, now: T0 })
  localStorage.setItem = realSet
  eq(res.ok, false)
  ok(res.error && res.error.length > 0)
  eq(localStorage.getItem(KEYS.learn), null)
  eq(localStorage.getItem(KEYS.settings), null)
  eq(localStorage.getItem(KEYS.migration), null)
})

check('runMigration：旧设置里的 status:"new" 落成 "unknown"', () => {
  globalThis.localStorage = fakeStorage()
  localStorage.setItem(KEYS.settingsV1, JSON.stringify({ status: 'new', minCefr: 'A1' }))
  runMigration({ words: M_WORDS, inheritFreqKnown: true, now: T0 })
  const s = JSON.parse(localStorage.getItem(KEYS.settings))
  eq(s.status, 'unknown')
  eq(s.minCefr, 'A1', '旧设置的其他项要带过来')
  eq(s.inheritFreqKnown, true)
})

// ---------------------------------------------------------------- derive 三态口径

check('STATS_SCOPE 等于去重后的单词数（全库分母）', () => {
  eq(STATS_SCOPE, new Set(REAL_WORDS.map((w) => w.id)).size)
  // 增量3 起词库由 AI 扩词（words-extra.js）动态增长，不再硬编码基线 310，只要求为正
  ok(STATS_SCOPE > 0, `STATS_SCOPE 应为正数，实际 ${STATS_SCOPE}`)
})

check('effectiveStatus 读学习记录，无记录时回落到 autoKnown 弱化判定', () => {
  const hi = { id: 'w.a', freqRank: 100 }
  const lo = { id: 'w.b', freqRank: 9000 }
  eq(effectiveStatus(hi, {}), 'known', '高频无记录 → 弱化判定为 known')
  eq(effectiveStatus(lo, {}), 'unknown')
  eq(effectiveStatus(lo, { 'w.b': { status: 'review' } }), 'review', '学习记录优先')
  eq(effectiveStatus(lo, { 'w.b': { status: 'known', consecutiveCorrect: 2 } }), 'known')
  eq(effectiveStatus(hi, { 'w.a': { status: 'unknown' } }), 'unknown', '记录里的 unknown 覆盖词频')
})

check('effectiveStatus 兼容过渡期仍在传的 v1 字符串标注', () => {
  const w = { id: 'w.a', freqRank: 9000 }
  eq(effectiveStatus(w, { 'w.a': 'review' }), 'review')
  eq(effectiveStatus(w, { 'w.a': 'new' }), 'unknown')
  eq(effectiveStatus(w, { 'w.a': 'known' }), 'known')
})

check('autoKnown 仍在，但只回答词频弱化，不参与状态判定', () => {
  eq(autoKnown({ freqRank: 2500 }), true)
  eq(autoKnown({ freqRank: 2501 }), false)
  eq(AUTO_KNOWN_RANK, 2500)
})

// ---------------------------------------------------------------- 输出

if (failures.length) {
  console.log('')
  failures.forEach((f) => console.log(`FAIL ${f}`))
  console.log('')
}
console.log(`PASS=${pass} FAIL=${fail}`)
process.exit(fail > 0 ? 1 : 0)

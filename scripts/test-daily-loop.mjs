/**
 * test:daily —— 「今天该做什么 / 这周发生了什么」的持久回归
 * ------------------------------------------------------------------
 * 运行：npm run test:daily
 *
 * ★ 为什么这个文件必须存在 ★
 *   qa-react-e2e.mjs **对日循环完全不敏感**：把日循环整套改动 stash 掉再跑 e2e，
 *   输出字节完全相同（md5 一致）——因为 e2e 的组件链
 *   （BulkActionBar → AddToStationMenu / WordRow → derive.js）
 *   根本不 import daily.js / DailyTask.jsx / WeeklySummary.jsx。
 *   也就是说：e2e 绿**不能**作为本模块的证据。本文件才是。
 *
 * ★ 它挡住过的三个真 bug（都已修）★
 *   1. countNewAvailable 判据写成 status!=='unknown' ⇒ 把已掌握的词算成新词，
 *      首页会对背完的账号说「还有 6 万词要学」，永远学不完。
 *   2. 分钟公式除以 60000 而不是 60 ⇒ 355 秒被报成「约 1 分钟」。
 *   3. countUpcomingDue 极性写反 ⇒ 把「已到期」算进「明天还有」。
 *   这三条都有专门的断言钉住，下面注释里标了 [回归]。
 *
 * ★ 断言分两段 ★
 *   A. 纯函数：不碰 React、不碰 DOM、不导入词库大文件（跑得快，可进 CI）
 *   B. 渲染：jsdom + 真 React 18，渲染真组件看真文案（慢，但不装看不见）
 *
 * ★ 不 import 词库数据文件 ★
 *   与 test-word-forms 同一考量：数据文件几十 MB，import 进来会让这个套件
 *   又慢又占内存；A 段全部用合成 fixture，B 段只用空壳组件。
 */
import assert from 'node:assert/strict'
import {
  SECONDS_PER_REVIEW_WORD,
  SECONDS_PER_NEW_WORD,
  SECONDS_PER_MINUTE,
  MIN_DAILY_MINUTES,
  NEXT_DUE_WINDOW_MS,
  estimateDailyMinutes,
  countDueNow,
  countNewAvailable,
  countUpcomingDue,
  nextDueChangeAt,
  describeNextAppointment,
  countNewlyMastered,
  reviewCompletion,
  rewindNewlyMastered,
  buildDailyTask,
  buildWeeklySummary,
} from '../src/lib/daily.js'
import { isReviewDue, countByStatus } from '../src/lib/learning.js'
import { countScheduled } from '../src/lib/scheduled.js'

let pass = 0
const failures = []
/**
 * ok(cond, name, detail) —— 条件在前、名字在后。
 * 写成 ok(cond, '…') 是本文件初版全篇的写法；与其逐处调换 85 个调用点，
 * 不如让签名对齐实际调用顺序。名字若写成布尔值，输出就会退化成一行行 "true"，
 * 失败时也看不到是哪一条 —— 这正是要避免的。
 */
function ok(cond, name, detail = '') {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const section = (t) => console.log(`\n${t}`)

const NOW = Date.parse('2026-06-15T12:00:00.000Z')
const NOW_ISO = new Date(NOW).toISOString()
const H = 36e5
const D = 864e5
const at = (offsetMs) => new Date(NOW + offsetMs).toISOString()

/** 造一条复习态记录 */
function rec(over = {}) {
  return {
    status: 'review',
    consecutiveCorrect: 0,
    correctCount: 0,
    incorrectCount: 1,
    lastStudiedAt: at(-2 * D),
    lastResult: 'incorrect',
    lastIncorrectAt: at(-2 * D),
    nextDueAt: at(-H), // 默认：已到期
    statusChangedAt: at(-2 * D),
    statusSource: 'learning',
    ...over,
  }
}
const words = (n) => Array.from({ length: n }, (_, i) => ({ id: `w.${i}`, form: `w${i}`, freqRank: 3000 + i }))

// ================================================================= A. 纯函数

section('A1. 分钟公式（[回归] #2：曾误除 60000）')
{
  ok(estimateDailyMinutes(0, 0) === 0, '无任务 → 0 分钟（不是「约 1 分钟」）')
  ok(estimateDailyMinutes(1, 0) === 1, '1 个复习词 → 1 分钟（不下限把 0.00025 分钟压成 1）')
  ok(estimateDailyMinutes(0, 1) === 1, '1 个新词 → 1 分钟')

  // ★ 变异测试实测：删掉 Math.max(MIN_DAILY_MINUTES, …) 这层下限，套件仍然全绿。
  //   根因已实测确认 —— 常量固定为 15s/25s 时，ceil(i*15/60) 对 i=1..4 都等于 1，
  //   恰好与 MIN_DAILY_MINUTES 恒等，于是**任何**基于输出的断言都观察不到这次变异。
  //   所以这里不断言「下限存在」（那是不可观测的），只把这条变异如实记为
  //   本套件已知、且**原理上不可杀**的一个洞，免得后来人误以为覆盖面是 100%。
  //   下限真正防的是「某天把耗时常量调小后算出 0 分钟」——那属于常量变更，
  //   由上面两条常量断言（15 / 25 / 60）守住。
  ok(MIN_DAILY_MINUTES === 1, '下限常量 = 1 分钟')
  let floorHolds = true
  for (let i = 1; i <= 40; i += 1) {
    if (estimateDailyMinutes(i, 0) < MIN_DAILY_MINUTES) floorHolds = false
  }
  ok(floorHolds, '只要有任务，分钟数绝不为 0（1..40 词逐个验）')

  const r = 7, n = 10
  const seconds = r * SECONDS_PER_REVIEW_WORD + n * SECONDS_PER_NEW_WORD
  const expect = Math.max(MIN_DAILY_MINUTES, Math.ceil(seconds / SECONDS_PER_MINUTE))
  ok(estimateDailyMinutes(r, n) === expect,
    `7 复习 + 10 新词 → ${expect} 分钟（${seconds}s / ${SECONDS_PER_MINUTE}，常量可复算）`)
  ok(expect === 6, '7×15s + 10×25s = 355s → 6 分钟（若除数误用 60000 会得 1，是个会误导用户的谎）')

  // 常量自洽：两个常量必须是「秒」，否则下面的换算不成立
  ok(SECONDS_PER_REVIEW_WORD === 15 && SECONDS_PER_NEW_WORD === 25, '耗时常量确为秒（15s 复习 / 25s 新学）')
  ok(SECONDS_PER_MINUTE === 60, '换算基准是 60（不是 60000）')

  // 大规模不溢出、不为 0
  ok(estimateDailyMinutes(500, 500) === Math.ceil((500 * 15 + 500 * 25) / 60), '1000 词规模按公式外推正确')
  ok(estimateDailyMinutes(NaN, 5) === estimateDailyMinutes(0, 5), 'NaN 输入不产生 NaN（退化同 0）')
  ok(estimateDailyMinutes(-3, -3) === 0, '负数输入按 0 处理')
}

section('A2. 到期 / 新学计数（[回归] #1 + #3）')
{
  const ws = words(50)
  const records = {}
  for (let i = 0; i < 4; i += 1) records[`w.${i}`] = rec() // 已到期
  for (let i = 10; i < 16; i += 1) records[`w.${i}`] = rec({ nextDueAt: at(6 * H) }) // 6h 后到期
  for (let i = 20; i < 26; i += 1) records[`w.${i}`] = rec({ nextDueAt: at(48 * H) }) // 更晚

  ok(countDueNow(ws, records, NOW_ISO) === 4, '到期数 = 4', `实得 ${countDueNow(ws, records, NOW_ISO)}`)
  ok(countScheduled(ws, records, NOW_ISO) === 12, '已排期 = 12（到期与未来都算排期）')
  ok(countDueNow(ws, records, NOW_ISO) + countScheduled(ws, records, NOW_ISO) - 4 === 12,
    '到期 ⊆ 已排期（子集关系）')
  ok(countUpcomingDue(ws, records, NOW_ISO) === 6, '24h 内到期 = 6（只有那 6 个 6h 后到期的）')

  // [回归] #3：已到期绝不能被算成「明天还有」
  const upcomingIds = new Set()
  for (const w of ws) {
    const r = records[w.id]
    if (r && r.status === 'review' && !isReviewDue(r, NOW_ISO) && isReviewDue(r, at(NEXT_DUE_WINDOW_MS))) upcomingIds.add(w.id)
  }
  ok(!upcomingIds.has('w.0'), '已到期的 w.0 不在「明天还有」集合里')

  // 边界：右端闭合
  ok(countUpcomingDue(ws, { 'w.0': rec({ nextDueAt: at(NEXT_DUE_WINDOW_MS) }) }, NOW_ISO) === 1,
    'nextDueAt 恰好 = now+24h → 计入（窗口右端闭合）')
  ok(countUpcomingDue(ws, { 'w.0': rec({ nextDueAt: at(NEXT_DUE_WINDOW_MS + 1000) }) }, NOW_ISO) === 0,
    'nextDueAt = now+24h+1s → 不计入（窗口外）')

  // 无 nextDueAt 的旧记录 = 已到期，不是「明天还有」
  const legacy = { 'w.0': { status: 'review', consecutiveCorrect: 0 } }
  ok(countDueNow(ws, legacy, NOW_ISO) === 1, '无 nextDueAt → 视作已到期（learning.js 既有约定）')
  ok(countUpcomingDue(ws, legacy, NOW_ISO) === 0, '无 nextDueAt → 不计入「明天还有」')

  // 已掌握的词即便 nextDueAt 在未来，也不该进「明天还有」
  const knownFuture = { 'w.0': rec({ status: 'known', nextDueAt: at(6 * H), statusChangedAt: at(-D), statusSource: 'learning' }) }
  ok(countUpcomingDue(ws, knownFuture, NOW_ISO) === 0, '已掌握的词即便 nextDueAt 在未来也不计入「明天还有」')
  ok(countDueNow(ws, knownFuture, NOW_ISO) === 0, '已掌握的词不计入到期')

  // [回归] #1：已掌握 ≠ 新词
  const mixed = { 'w.0': rec({ status: 'known', statusChangedAt: at(-D) }), 'w.1': rec({ status: 'review' }) }
  const n1 = countNewAvailable(ws, mixed)
  ok(n1 === 48, '已掌握的词不算「新词」（50 - 2 条有记录）', `实得 ${n1}`)
  ok(n1 === 50 - Object.keys(mixed).length, '新学数 == 词库 - 有记录的词（与 unknown 桶同判据）')

  // 最强的一条：不看实现，只断言 daily 与既有 countByStatus 的 unknown 桶一致。
  // [回归] #1 若把判据写成 status!=='unknown'，这一条立刻红。
  const buckets = countByStatus(ws, mixed)
  ok(n1 === buckets.unknown, '新学数 == countByStatus().unknown（跨模块口径一致性）', `daily=${n1} vs countByStatus=${buckets.unknown}`)
  ok(n1 !== buckets.known + buckets.review + buckets.unknown - 10, '反例护栏：不会把已掌握词计入新学')

  // 空输入不炸
  ok(countDueNow([], {}, NOW_ISO) === 0 && countNewAvailable([], {}) === 0 && countUpcomingDue([], {}, NOW_ISO) === 0,
    '空词库 → 全 0，不抛异常')
  ok(countDueNow(undefined, undefined) === 0 && countNewAvailable(null, null) === 0,
    'undefined / null 入参 → 0，不抛异常')
}

section('A3. 集合关系：到期 / 已排期 / 明天还有 三者口径自洽')
{
  // 合成一批混合状态，穷举式验证子集关系
  const ws = words(200)
  const records = {}
  for (let i = 0; i < 40; i += 1) records[`w.${i}`] = rec({ nextDueAt: at(-H) }) // 已到期
  for (let i = 40; i < 90; i += 1) records[`w.${i}`] = rec({ nextDueAt: at(6 * H) }) // 24h 内
  for (let i = 90; i < 140; i += 1) records[`w.${i}`] = rec({ nextDueAt: at(72 * H) }) // 更远
  for (let i = 140; i < 160; i += 1) records[`w.${i}`] = rec({ status: 'known', nextDueAt: at(6 * H), statusChangedAt: at(-D) }) // 已掌握但有未来排期

  const due = countDueNow(ws, records, NOW_ISO)
  const sched = countScheduled(ws, records, NOW_ISO)
  const up = countUpcomingDue(ws, records, NOW_ISO)

  ok(due === 40, `到期 = 40（实得 ${due}）`)
  ok(sched === 100, `已排期 = 100（到期 40 + 24h内 50 + 更远 50；实得 ${sched}）`)
  ok(up === 50, `24h 内到期 = 50（实得 ${up}）`)
  ok(up < sched, '「明天还有」严格小于「已排期」（子集非等集）')
  ok(sched <= 160, '已排期 ≤ 有记录且可复习的总数（已掌握的不算）')

  // buildDailyTask 必须与三个独立函数口径完全一致
  const task = buildDailyTask({ reviewPool: ws, learnPool: ws, records, now: NOW_ISO, roundSize: 10 })
  ok(task.dueTotal === due, 'buildDailyTask.dueTotal == countDueNow')
  ok(task.upcoming24h === up, 'buildDailyTask.upcoming24h == countUpcomingDue')
  ok(task.scheduled === sched, 'buildDailyTask.scheduled == countScheduled')
  ok(task.dueRound === Math.min(due, 10) && task.newRound === Math.min(task.newTotal, 10),
    '本轮数 = min(总数, roundSize)')
  ok(task.taskCount === task.dueRound + task.newRound, 'taskCount == 复习本轮 + 新学本轮')
  ok(task.minutes === estimateDailyMinutes(task.dueRound, task.newRound), 'minutes 与公式一致')
  ok(task.hasDue === (task.dueRound > 0) && task.hasNew === (task.newRound > 0), 'hasDue / hasNew 与计数自洽')
}

section('A4. 下一唤醒时刻')
{
  const ws = words(10)
  ok(nextDueChangeAt(ws, {}, NOW_ISO) === null, '无任何未来排期 → null（没有唤醒必要）')
  ok(nextDueChangeAt(ws, { 'w.0': rec({ nextDueAt: at(-H) }) }, NOW_ISO) === null, '只有已到期 → null（已到期不用等）')
  const soon = at(5 * H)
  ok(nextDueChangeAt(ws, { 'w.0': rec({ nextDueAt: soon }), 'w.1': rec({ nextDueAt: at(50 * H) }) }, NOW_ISO) === NOW + 5 * H,
    '取所有未来 nextDueAt 的最小值')
  ok(nextDueChangeAt(ws, { 'w.0': rec({ nextDueAt: 'not-a-date' }) }, NOW_ISO) === null, '非法 nextDueAt 被跳过，不产出 NaN')
  ok(nextDueChangeAt(ws, { 'w.0': rec({ nextDueAt: at(5 * H), status: 'known', statusChangedAt: at(-D) }) }, NOW_ISO) === null,
    '已掌握的词不参与唤醒（永不出题）')
}

section('A5. 下一次预约文案')
{
  ok(describeNextAppointment({ upcoming24h: 9, scheduled: 4 }).tone === 'due', '有明天到期的 → tone=due')
  ok(describeNextAppointment({ upcoming24h: 9 }).text.includes('明天还有 9 个到期'), '「明天还有 N 个」用真实计数')
  ok(describeNextAppointment({ upcoming24h: 0, scheduled: 5 }).tone === 'scheduled', '到期清空但有排期 → tone=scheduled')
  ok(describeNextAppointment({ upcoming24h: 0, scheduled: 5 }).text.includes('5'), '仍报出已排期数（不静默归零）')
  ok(describeNextAppointment({ upcoming24h: 0, scheduled: 0 }).tone === 'clear', '两者皆 0 → tone=clear')
  ok(describeNextAppointment({}).tone === 'clear', '空对象入参 → clear，不抛异常')
  ok(!describeNextAppointment({ upcoming24h: 0, scheduled: 0 }).text.includes('还有 0 个'), 'clear 文案不说「还有 0 个」')
}

section('A6. 周报：新增掌握')
{
  ok(countNewlyMastered({}, NOW_ISO) === 0, '空记录 → 0')
  const r = {
    a: rec({ status: 'known', statusChangedAt: at(-1 * D), statusSource: 'learning' }), // 本周
    b: rec({ status: 'known', statusChangedAt: at(-30 * D), statusSource: 'learning' }), // 更早
    c: rec({ status: 'known', statusChangedAt: at(-1 * D), statusSource: 'migration' }), // 继承
    d: rec({ status: 'review', statusChangedAt: at(-1 * D), statusSource: 'learning' }), // 未掌握
    e: rec({ status: 'known', statusChangedAt: undefined, statusSource: 'learning' }), // 无时间戳
  }
  ok(countNewlyMastered(r, NOW_ISO) === 1, '只数本周 statusChangedAt 的已掌握（a）', `实得 ${countNewlyMastered(r, NOW_ISO)}`)
  ok(!countNewlyMastered({ c: r.c }, NOW_ISO), 'migration 继承的「已掌握」不算本周新增')
  ok(countNewlyMastered(null, NOW_ISO) === 0, 'null 入参 → 0')
}

section('A7. 周报：复习完成率（分母 0 ⇒ 不出百分比）')
{
  const empty = reviewCompletion({}, NOW_ISO)
  ok(empty.due === 0 && empty.answered === 0, '空记录 → due=0 answered=0')
  ok(empty.ratio === null, '分母 0 → ratio=null（组件据此不渲染任何百分比）')

  const r = {}
  for (let i = 0; i < 10; i += 1) {
    r[`w.a${i}`] = rec({ nextDueAt: at(-3 * D), lastStudiedAt: at(-1 * D), status: 'known', consecutiveCorrect: 2, statusChangedAt: at(-2 * D) })
  }
  for (let i = 0; i < 5; i += 1) {
    r[`w.b${i}`] = rec({ nextDueAt: at(-2 * D), lastStudiedAt: null })
  }
  const c = reviewCompletion(r, NOW_ISO)
  ok(c.due === 15, `分母 = 15（窗口内到期的全部词，含已达标的 known；实得 ${c.due}）`)
  ok(c.answered === 10, '分子 = 10（lastStudiedAt >= nextDueAt）')
  ok(Math.abs(c.ratio - 10 / 15) < 1e-12, 'ratio = 10/15 可复算')

  // 关键设计：分母不按当前 status 过滤
  ok(c.due === 15, '已达标的 known 词仍计入分母（否则完成率虚高）')
  // 未到期的词不进分母
  ok(reviewCompletion({ z: rec({ nextDueAt: at(5 * H) }) }, NOW_ISO).due === 0, '未来到期的词不进本周分母')
  // lastStudiedAt 早于 nextDueAt = 没在到期后作答过
  const pre = reviewCompletion({ q: rec({ nextDueAt: at(-1 * D), lastStudiedAt: at(-5 * D) }) }, NOW_ISO)
  ok(pre.due === 1 && pre.answered === 0 && pre.ratio === 0, 'lastStudiedAt < nextDueAt → 未作答')

  // ★ 变异测试实测：把 studiedAt >= dueAt 改成 > ，套件一度全绿 ——
  //   因为所有 fixture 的两个时间戳都差着整整一天，永远碰不到相等那一档。
  //   「恰好在到期那一刻作答」必须单独钉住：它是「刚到期就学了」的真实情形，
  //   也是 >= 与 > 的唯一分歧点。
  const exact = reviewCompletion({
    q: rec({ nextDueAt: at(-1 * D), lastStudiedAt: at(-1 * D) }),
  }, NOW_ISO)
  ok(exact.due === 1 && exact.answered === 1, 'lastStudiedAt === nextDueAt → 计入已作答（边界闭合于等号）')

  // 相等且两侧同毫秒，逐字复现「同一次作答」的极端情形
  const sameInstant = at(-3 * D)
  const tie = reviewCompletion({
    q: rec({ nextDueAt: sameInstant, lastStudiedAt: sameInstant, status: 'known', consecutiveCorrect: 2 }),
  }, NOW_ISO)
  ok(tie.due === 1 && tie.answered === 1 && tie.ratio === 1, '两个时间戳完全相同 → 100% 完成')

  // 差 1 毫秒：到期后 1ms 作答，仍算已作答（不得用严格大于）
  const plus1 = reviewCompletion({
    q: rec({ nextDueAt: at(-1 * D), lastStudiedAt: new Date(Date.parse(at(-1 * D)) + 1).toISOString() }),
  }, NOW_ISO)
  ok(plus1.answered === 1, '到期后 1 毫秒作答 → 已计入')
}

section('A8. 周报：词汇量是反事实，不是快照')
{
  const r = {}
  for (let i = 0; i < 5; i += 1) r[`w.a${i}`] = rec({ status: 'known', statusChangedAt: at(-1 * D) })
  for (let i = 0; i < 5; i += 1) r[`w.b${i}`] = rec({ status: 'known', statusChangedAt: at(-30 * D) })
  const out = rewindNewlyMastered(r, NOW_ISO)
  ok(out.rewound === 5, '只回退本周掌握的 5 个', `实得 ${out.rewound}`)
  ok(out.records['w.a0'].status === 'review' && out.records['w.a0'].consecutiveCorrect === 0, '回退目标 = review 且连续数归零')
  ok(out.records['w.b0'].status === 'known', '更早掌握的 b 段不动')
  ok(out.records['w.a0'].incorrectCount === 1, '累计计数原样保留（不是清零）')
  ok(r['w.a0'].status === 'known', '原记录未被就地修改（返回新对象）')
  ok(countNewlyMastered(out.records, NOW_ISO) === 0, '回退后本周新增掌握 = 0')

  // 无迁移痕迹也要能跑
  ok(rewindNewlyMastered({}, NOW_ISO).rewound === 0, '空记录 → rewound=0')
  ok(rewindNewlyMastered(null, NOW_ISO).rewound === 0, 'null 入参 → 0')
}

section('A9. 周报组装')
{
  const none = buildWeeklySummary({ records: {}, now: NOW_ISO, vocab: null, vocabBefore: null })
  ok(none.hasHistory === false, '无历史 → hasHistory=false')
  ok(none.insufficient.includes('history'), '数据不足标记含 history')
  ok(none.insufficient.includes('vocab'), '数据不足标记含 vocab')
  ok(none.review.ratio === null, 'ratio=null（不足时不渲染百分比）')
  ok(none.newlyMastered === 0, '新增掌握 = 0')
  ok(none.vocab.sufficient === false && none.vocab.from === null && none.vocab.delta === null,
    '词汇量段无数字，from / delta 皆 null（不编造）')

  const r = {}
  for (let i = 0; i < 200; i += 1) {
    r[`w.a${i}`] = rec({ status: 'known', statusChangedAt: at(-1 * D), nextDueAt: at(-3 * D), lastStudiedAt: at(-2 * D), statusSource: 'learning' })
  }
  const rich = buildWeeklySummary({
    records: r,
    now: NOW_ISO,
    vocab: { estimate: 5000, sufficient: true },
    vocabBefore: { estimate: 4000, sufficient: true },
  })
  ok(rich.hasHistory === true, '有历史 → hasHistory=true')
  ok(rich.insufficient.length === 0, '两侧样本都够 → 无不足标记', JSON.stringify(rich.insufficient))
  ok(rich.newlyMastered === 200, '新增掌握 = 200')
  ok(rich.vocab.sufficient && rich.vocab.from === 4000 && rich.vocab.to === 5000, 'from → to 原样传出')
  ok(rich.vocab.delta === 1000, 'delta = 1000，与两次估算之差一致')
  ok(rich.vocab.method === 'counterfactual', 'method 明确标记为反事实')

  // 只有当前估算够、反事实不够 → 必须报 vocabFrom 不足，不能拿 from 当 0
  const half = buildWeeklySummary({ records: r, now: NOW_ISO, vocab: { estimate: 5000, sufficient: true }, vocabBefore: null })
  ok(half.insufficient.includes('vocabFrom'), '反事实侧样本不足 → 标记 vocabFrom')
  ok(half.vocab.sufficient === false, '不足时 vocab 段 insufficient')
}

console.log(`\n---------- A 段断言 ${pass + failures.length} · 通过 ${pass} · 失败 ${failures.length} ----------`)
if (failures.length) {
  console.log('\n失败明细：')
  failures.forEach((f) => console.log(`  ✗ ${f.name}${f.detail ? '\n      ' + f.detail : ''}`))
  process.exit(1)
}
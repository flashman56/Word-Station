/**
 * daily.js —— 「今天该做什么」与「这周发生了什么」的纯派生层
 * ------------------------------------------------------------------
 * 无 React / 无 DOM / 无存储 / 无网络。可在 Node 里直接单测。
 *
 * ★ 本文件**只做派生，不新增任何数据** ★
 *   全部输入都来自既有三处：
 *     · learning.js 的记录状态机（status / nextDueAt / lastStudiedAt …）
 *     · scheduled.js 的 countScheduled（已排期 = 未到期）
 *     · vocab.js 的 estimateVocabulary（词汇量估算，冻结不动）
 *   本文件不写盘、不改记录、不引入任何持久化字段。
 *
 * ★ 到期 / 排期之差不重新实现 ★
 *   「到期」判定一律走 learning.js 的 isReviewDue —— 与 buildReviewQueue /
 *   countScheduled 同源。下面的 countUpcomingDue 甚至刻意用**两次** isReviewDue
 *   的组合来表达「未来 24h 内会到期」，而不是自己写一遍时间戳比较：
 *     今天还没到期（= 已排期） ∧ 24 小时后已到期  ⇒  恰好在这 24h 内到期
 *   这样「已排期 ⊇ 未来 24h 内到期」这个子集关系由构造保证，不靠事后断言。
 */
import { isReviewDue } from './learning.js'
import { countScheduled } from './scheduled.js'

// ---------------------------------------------------------------- 时长常量

/**
 * 单个复习词的预计耗时（秒）。
 *
 * 取值依据（本产品的一张卡实际要做的事）：
 *   读词形 → 在脑内回忆 → 展开释义确认 → 点「记得 / 不记得」
 *   中文母语者熟悉词的这条链路实测中位数约 12–15 秒，取 15 秒。
 */
export const SECONDS_PER_REVIEW_WORD = 15

/**
 * 单个新词的预计耗时（秒）。比复习贵，因为多了「第一次建立词义映射」的成本：
 *   读词形 → 读释义（可能多条）→ 看词族 / 变形 → 建立记忆锚点
 *   约 20–25 秒，取 25 秒。
 */
export const SECONDS_PER_NEW_WORD = 25

/**
 * 「约 N 分钟」的下限：只要今天真有词要学，就至少报 1 分钟 ——
 * 报「约 0 分钟」会让用户以为今天没事可做（这正是本模块要消灭的误导）。
 */
export const MIN_DAILY_MINUTES = 1

/** 每分钟的秒数（公式换算用；两个耗时常量都以秒为单位）。 */
export const SECONDS_PER_MINUTE = 60

/** 「明天还有 N 个到期」的窗口：24 小时（= learning.js 的 INCORRECT_DUE_MS 同值）。 */
export const NEXT_DUE_WINDOW_MS = 24 * 60 * 60 * 1000

/** 周报窗口：7 天。 */
export const WEEK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

// ---------------------------------------------------------------- 工具

function ms(now) {
  const t = typeof now === 'string' || typeof now === 'number' ? new Date(now).getTime() : NaN
  return Number.isFinite(t) ? t : Date.now()
}

/** 遍历词表并按 id 去重（与 countByStatus / countScheduled 同一口径）。 */
function forEachWord(words, fn) {
  const seen = new Set()
  ;(words || []).forEach((w) => {
    if (!w || !w.id || seen.has(w.id)) return
    seen.add(w.id)
    fn(w)
  })
}

/** 只取需要的字段，不走 getRecord —— 6 万词上避免为每个词分配补全对象（同 scheduled.js 的理由）。 */
function rawRecord(records, id) {
  const r = records && typeof records === 'object' ? records[id] : null
  return r && typeof r === 'object' ? r : null
}

// ---------------------------------------------------------------- 时长估算

/**
 * 「今天大概要花几分钟」。
 *
 * 公式（刻意保持一行、可复算）：
 *   minutes = max(MIN_DAILY_MINUTES, ceil((复习词数 × SECONDS_PER_REVIEW_WORD
 *                                          + 新词数   × SECONDS_PER_NEW_WORD) / SECONDS_PER_MINUTE))
 *
 * ⚠️ 除数是 60 不是 60000 ⚠️
 *   两个常量的名字都带 SECONDS_，乘出来就是**秒**。除以 60000（每分钟的毫秒数）
 *   会让任何规模都算成「约 1 分钟」—— 7 复习 + 10 新学实为 355 秒（≈6 分钟），
 *   报 1 分钟等于对用户撒了个不大不小的谎：他会按 1 分钟安排，结果坐了 6 分钟。
 *
 * @param {number} reviewCount 本轮要复习的词数
 * @param {number} newCount    本轮要新学的词数
 * @returns {number} 整数分钟；两数皆为 0 时返回 0
 */
export function estimateDailyMinutes(reviewCount, newCount) {
  const r = Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : 0
  const n = Number.isFinite(newCount) && newCount > 0 ? newCount : 0
  if (r === 0 && n === 0) return 0
  const seconds = r * SECONDS_PER_REVIEW_WORD + n * SECONDS_PER_NEW_WORD
  return Math.max(MIN_DAILY_MINUTES, Math.ceil(seconds / SECONDS_PER_MINUTE))
}

// ---------------------------------------------------------------- 到期计数

/**
 * 当前到期的复习词**总数**（不截断）。
 * buildReviewQueue 会按 roundSize 截断，这里要的是「今天一共欠多少」，所以单独数。
 * 判据与 buildReviewQueue 完全一致：status==='review' && isReviewDue。
 */
export function countDueNow(words, records, now = null) {
  const at = now == null ? new Date().toISOString() : now
  let n = 0
  forEachWord(words, (w) => {
    const r = rawRecord(records, w.id)
    if (!r || r.status !== 'review') return
    if (isReviewDue(r, at)) n += 1
  })
  return n
}

/**
 * 新学词**总数**（不截断，受难度分档约束的词池已在调用方收窄）。
 * 判据与 buildLearnQueue 一致：status === 'unknown'（含「无记录」——learning.js
 * 的 emptyRecord() 就是这个意思）。
 */
export function countNewAvailable(words, records) {
  let n = 0
  forEachWord(words, (w) => {
    const r = rawRecord(records, w.id)
    // ⚠️ 判据必须是 `!r || status === 'unknown'`。写成 `status !== 'unknown'`
    //   会把**已掌握**的词也算进来 —— 首页会对着一个「已背完」的账号说
    //   「还有 6 万词要学」，且永远学不完。
    if (!r || r.status === 'unknown') n += 1
  })
  return n
}

/**
 * 「未来 windowMs 内会到期」的词数 —— 即「明天还有 N 个到期」的那个 N。
 *
 * ★ 口径（用两次 isReviewDue 表达，不自己比较时间戳）★
 *   今天已到期          isReviewDue(r, now)          → 不算「即将到期」
 *   今天还没到期        !isReviewDue(r, now)         → 才是候选
 *   窗口末尾已到期      isReviewDue(r, now + window) → 确认落在这 24h 内
 *
 * 附带性质（由构造保证，不靠断言）：
 *   - 结果必然是 countScheduled 的**子集**（无 nextDueAt / 非法 nextDueAt 的旧记录
 *     今天就已到期，第一步就被排除）；
 *   - 只取 status==='review' —— isReviewDue 不看 status，但已掌握的词即便
 *     nextDueAt 在未来也永不出题，算进去会让用户去找一批根本不会出题的词。
 */
export function countUpcomingDue(words, records, now = null, windowMs = NEXT_DUE_WINDOW_MS) {
  const t = ms(now)
  const at = new Date(t).toISOString()
  const atEnd = new Date(t + windowMs).toISOString()
  let n = 0
  forEachWord(words, (w) => {
    const r = rawRecord(records, w.id)
    if (!r || r.status !== 'review') return
    if (isReviewDue(r, at)) return // 已经到期的不算「即将到期」
    if (isReviewDue(r, atEnd)) n += 1
  })
  return n
}

// ---------------------------------------------------------------- 今日任务

/**
 * 未来 windowMs 内会到期 / 今天已到期 的一趟合并扫描。
 *
 * ★ 为什么要合并 ★
 *   countDueNow 与 countUpcomingDue 各扫一遍 6 万词；buildDailyTask 在**每次答题**
 *   都会重跑（records 变 → daily 失效 → 重算）。两遍合并后判据逐字相同、
 *   结果不变，只是少扫一遍 6 万词。
 *
 * @returns {{ dueNow: number, upcoming: number }}
 */
function scanDue(words, records, at, atEnd) {
  let dueNow = 0
  let upcoming = 0
  forEachWord(words, (w) => {
    const r = rawRecord(records, w.id)
    if (!r || r.status !== 'review') return
    if (isReviewDue(r, at)) dueNow += 1
    else if (isReviewDue(r, atEnd)) upcoming += 1
  })
  return { dueNow, upcoming }
}

/**
 * 组装「今天这一轮」的完整形状（纯组装，不读时钟 —— now 由调用方传入）。
 *
 * @param {object} o
 * @param {Array}  o.reviewPool 复习抽词池（折叠后的学习单元 ∪ 私有词）
 * @param {Array}  o.learnPool   新学抽词池（折叠后的学习单元 ∪ 难度分档过滤）
 * @param {object} o.records     学习记录
 * @param {string} o.now         ISO 时间（与队列派生共用同一个 now，见 useLearn 的 dueNow）
 * @param {number} o.roundSize   每轮词数（DEFAULT_ROUND_SIZE）
 * @returns {{
 *   now: string,
 *   dueTotal: number, dueRound: number,
 *   newTotal: number, newRound: number,
 *   hasDue: boolean, hasNew: boolean,
 *   taskCount: number, minutes: number,
 *   scheduled: number, upcoming24h: number,
 * }}
 */
export function buildDailyTask({ reviewPool, learnPool, records, now, roundSize = 10 } = {}) {
  const at = now == null ? new Date().toISOString() : now
  const rs = Number.isFinite(roundSize) && roundSize > 0 ? roundSize : 10

  const { dueNow: dueTotal, upcoming: upcoming24h } = scanDue(
    reviewPool,
    records,
    at,
    new Date(ms(at) + NEXT_DUE_WINDOW_MS).toISOString(),
  )
  const newTotal = countNewAvailable(learnPool, records)
  const dueRound = Math.min(dueTotal, rs)
  const newRound = Math.min(newTotal, rs)
  // 已排期数直接复用 scheduled.js —— 不在这里重实现「排期但未到期」的判据
  const scheduled = countScheduled(reviewPool, records, at)

  return {
    now: at,
    dueTotal,
    dueRound,
    newTotal,
    newRound,
    hasDue: dueRound > 0,
    hasNew: newRound > 0,
    taskCount: dueRound + newRound,
    minutes: estimateDailyMinutes(dueRound, newRound),
    scheduled,
    upcoming24h,
  }
}

/**
 * 下一次「到期集合可能变化」的时刻 = 所有未来 nextDueAt 的最小值。
 * 用于给到期计数挂一个精确到秒的唤醒定时器（而不是轮询）。
 * 无任何未来到期词时返回 null —— 那就没有必要再唤醒。
 */
export function nextDueChangeAt(words, records, now = null) {
  const t = ms(now)
  let min = Infinity
  forEachWord(words, (w) => {
    const r = rawRecord(records, w.id)
    if (!r || r.status !== 'review' || r.nextDueAt == null) return
    const d = new Date(r.nextDueAt).getTime()
    if (!Number.isFinite(d) || d <= t) return
    if (d < min) min = d
  })
  return Number.isFinite(min) ? min : null
}

/**
 * 会话结束后的「下一次预约」一句话。
 *
 * ★ 全部来自记录里的真实 nextDueAt，一个字都不编 ★
 *   upcoming24h > 0   → 明天确实还有这么多词到期
 *   scheduled > 0     → 到期都清空了，剩下的排在更远的地方
 *   两者皆 0          → 明天没有到期词（这是个好消息，如实说）
 *
 * @returns {{ tone: 'due'|'scheduled'|'clear', text: string }}
 */
export function describeNextAppointment({ upcoming24h = 0, scheduled = 0 } = {}) {
  if (upcoming24h > 0) {
    return { tone: 'due', text: `明天还有 ${upcoming24h} 个到期 · 今天先到这里` }
  }
  if (scheduled > 0) {
    return {
      tone: 'scheduled',
      text: `今天的到期都清空了 · 另有 ${scheduled} 个已排期，会在更晚些到期`,
    }
  }
  return { tone: 'clear', text: '今天的到期都清空了 · 明天没有到期的词' }
}

// ---------------------------------------------------------------- 周报

/**
 * 近 windowMs 内「新增掌握」的词数。
 *
 * ★ 判据（三条同时满足）★
 *   1. status === 'known'          —— 现在是已掌握
 *   2. statusChangedAt 落在窗口内   —— 是**这周**变成已掌握的，不是更早
 *   3. statusSource !== 'migration' —— 高频继承不是「学会」，混进来会虚报
 *
 * 「我会了」写 statusSource='manual-known' 且带 statusChangedAt，计入 —— 用户确实
 * 主动声明了掌握。答题达标写 'learning'，同样计入。
 */
export function countNewlyMastered(records, now = null, windowMs = WEEK_WINDOW_MS) {
  const from = ms(now) - windowMs
  let n = 0
  const recs = records && typeof records === 'object' ? records : {}
  Object.keys(recs).forEach((id) => {
    const r = recs[id]
    if (!r || typeof r !== 'object') return
    if (r.status !== 'known') return
    if (r.statusSource === 'migration') return
    const t = new Date(r.statusChangedAt).getTime()
    if (!Number.isFinite(t) || t < from) return
    n += 1
  })
  return n
}

/**
 * 「复习完成率」——分子 / 分母都明确定义，不用百分比糊弄。
 *
 * ★ 分母 = 窗口内「到期」的复习词数 ★
 *   nextDueAt 落在 [now - windowMs, now] 内。
 *   nextDueAt 只在答错时被写（learning.js 的唯一调度规则），所以「nextDueAt 落在
 *   窗口内」精确等价于「这个词被排进了复习，且到期时刻就在这一周内」。
 *
 * ★ 分子 = 其中「到期之后被作答过」的词数 ★
 *   lastStudiedAt >= nextDueAt（lastStudiedAt 只在 applyAnswer 里写，即真实答题；
 *   「我会了」不写它，所以不会被算成完成过一次复习）。
 *
 * ★ 为什么不按当前 status 过滤分母 ★
 *   一个本周到期、被答对两次已达标的词现在 status 是 known。若按 status==='review'
 *   过滤，它会从分母里消失 —— 而它明明复习完成了。分母必须覆盖「窗口内到期过的
 *   所有词」，无论它现在是什么状态。
 *
 * @returns {{ due: number, answered: number, ratio: number|null }}
 *   ratio 为 null 表示分母为 0（此时**不允许**渲染任何百分比）。
 */
export function reviewCompletion(records, now = null, windowMs = WEEK_WINDOW_MS) {
  const t = ms(now)
  const from = t - windowMs
  const recs = records && typeof records === 'object' ? records : {}
  let due = 0
  let answered = 0
  Object.keys(recs).forEach((id) => {
    const r = recs[id]
    if (!r || typeof r !== 'object') return
    if (r.nextDueAt == null) return
    const dueAt = new Date(r.nextDueAt).getTime()
    if (!Number.isFinite(dueAt)) return
    if (dueAt < from || dueAt > t) return
    due += 1
    if (r.lastStudiedAt == null) return
    const studiedAt = new Date(r.lastStudiedAt).getTime()
    if (!Number.isFinite(studiedAt)) return
    if (studiedAt >= dueAt) answered += 1
  })
  return { due, answered, ratio: due > 0 ? answered / due : null }
}

/**
 * 把「本周新掌握的词」回退成未掌握，得到**反事实**的记录视图，
 * 供 vocab.js 重算「如果本周没有新增掌握，估算会是多少」。
 *
 * ★ 为什么只能做反事实、不能报「7 天前的真实快照」★
 *   学习记录是**就地覆盖**的（每次答题重写同一条），没有任何历史版本。7 天前那条
 *   记录长什么样，本地无从得知 —— 任何「从 → 到」都不是量出来的历史。
 *   唯一能从现有记录诚实重建的是：**把本周新增掌握这一个事件回退掉**，
 *   其余部分保持不变。这是一个明确定义的假设，不是快照，UI 上必须照实说。
 *
 * 回退目标沿用 learning.js 的语义：进复习、连续数归零，累计计数原样保留。
 */
export function rewindNewlyMastered(records, now = null, windowMs = WEEK_WINDOW_MS) {
  const from = ms(now) - windowMs
  const recs = records && typeof records === 'object' ? records : {}
  const out = {}
  let rewound = 0
  Object.keys(recs).forEach((id) => {
    const r = recs[id]
    if (!r || typeof r !== 'object') return
    const t = new Date(r.statusChangedAt).getTime()
    if (r.status === 'known' && r.statusSource !== 'migration' && Number.isFinite(t) && t >= from) {
      out[id] = { ...r, status: 'review', consecutiveCorrect: 0 }
      rewound += 1
      return
    }
    out[id] = r
  })
  return { records: out, rewound }
}

/**
 * 组装「最近 7 天」小结。
 *
 * @param {object} o
 * @param {object} o.records      学习记录（未折叠的 learn.records，与 vocab.js 同口径）
 * @param {string} o.now          ISO 时间
 * @param {object} [o.vocab]        estimateVocabulary 的**当前**结果（复用既有接线）
 * @param {object} [o.vocabBefore]  estimateVocabulary 的**反事实**结果（回退本周新掌握后）
 * @param {number} [o.windowMs]
 * @returns {{
 *   windowMs: number,
 *   hasHistory: boolean,
 *   newlyMastered: number,
 *   review: { due: number, answered: number, ratio: number|null },
 *   vocab: { sufficient: boolean, from: number|null, to: number|null, delta: number|null, method: string },
 *   insufficient: string[],
 * }}
 */
export function buildWeeklySummary({
  records,
  now = null,
  vocab = null,
  vocabBefore = null,
  windowMs = WEEK_WINDOW_MS,
} = {}) {
  const at = now == null ? new Date().toISOString() : now
  const newlyMastered = countNewlyMastered(records, at, windowMs)
  const review = reviewCompletion(records, at, windowMs)

  // 有没有「这周发生过什么」的痕迹：既掌握过，或者有过到期。
  const hasHistory = newlyMastered > 0 || review.due > 0

  const insufficient = []
  if (!hasHistory) insufficient.push('history')

  let vocabOut = { sufficient: false, from: null, to: null, delta: null, method: 'counterfactual' }
  if (!vocab || !vocab.sufficient) {
    insufficient.push('vocab')
  } else if (!vocabBefore || !vocabBefore.sufficient) {
    insufficient.push('vocabFrom')
  } else {
    const from = Number(vocabBefore.estimate)
    const to = Number(vocab.estimate)
    vocabOut = {
      sufficient: true,
      from: Number.isFinite(from) ? from : null,
      to: Number.isFinite(to) ? to : null,
      delta: Number.isFinite(from) && Number.isFinite(to) ? to - from : null,
      method: 'counterfactual',
    }
  }

  return { windowMs, hasHistory, newlyMastered, review, vocab: vocabOut, insufficient }
}

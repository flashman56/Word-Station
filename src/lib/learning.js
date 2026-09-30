/**
 * 学习状态机与取词队列 —— 纯函数层（无任何 React / DOM / 存储依赖）
 * ------------------------------------------------------------------
 * 这里只回答三件事：
 *   1. 一条学习记录长什么样（LearningRecord）
 *   2. 答对 / 答错 / 我会了 / 退回复习 / 清空 会怎么改这条记录
 *   3. 从全量词表里怎么挑出这一轮要学 / 要复习的词
 *
 * 所有函数都不修改入参，返回新对象。时间统一 ISO 8601 字符串，由调用方传入（now），
 * 函数内部不读 Date，保证可测试。
 *
 * 注意：本文件不决定"词频高低"—— 那是 derive.js 的 autoKnown 的事；
 *      本文件也不碰 localStorage —— 那是 hooks/useLearn.js 的事。
 */

// ---------------------------------------------------------------- 常量

/** 三态（全小写，不用 new） */
export const LEARN_STATUS = ['unknown', 'review', 'known']

/** 连续答对几次进 known */
export const MASTER_THRESHOLD = 2

/** 每轮词数 */
export const DEFAULT_ROUND_SIZE = 10

/** 答错后的最小到期间隔：+1 天（唯一调度规则，不引入任何 SRS 参数） */
export const INCORRECT_DUE_MS = 24 * 60 * 60 * 1000

/** v2 存储版本号 */
export const LEARN_STORE_VERSION = 2

/** 状态来源，用于解释"这条记录是怎么变成现在这个状态的" */
export const STATUS_SOURCE = ['initial', 'learning', 'manual-known', 'manual-retreat', 'manual', 'migration']

/** 展示文案（组件不得自己硬编码这三组词） */
export const STATUS_LABEL = {
  unknown: '未知',
  review: '待复习',
  known: '已掌握',
}

// ---------------------------------------------------------------- 记录构造

/** 一条默认学习记录：unknown、计数全 0、时间全 null */
export function emptyRecord() {
  return {
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
  }
}

/**
 * 读一条记录；缺失 / 结构不完整时返回 emptyRecord() 的补全版本。
 * 只读，不写回入参（不为查过的词预写空记录）。
 */
export function getRecord(records, wordId) {
  const raw = records && typeof records === 'object' ? records[wordId] : null
  if (!raw || typeof raw !== 'object') return emptyRecord()
  return { ...emptyRecord(), ...raw }
}

/** 是否已达掌握门槛（用于列表 / 详情的进度小标） */
export function isMastered(record) {
  return Boolean(record) && record.status === 'known'
}

/**
 * 展示态：'未知' | '学习中 1/2' | '待复习' | '复习中 1/2' | '已掌握'
 * 「答对 1 次但仍未达标」是 unknown / review 内部的展示分支，不是第四个状态。
 */
export function statusLabel(record) {
  const rec = record || emptyRecord()
  if (rec.status === 'known') return STATUS_LABEL.known
  const n = Math.min(rec.consecutiveCorrect || 0, MASTER_THRESHOLD)
  const prefix = rec.status === 'review' ? '复习中' : '学习中'
  if (n > 0) return `${prefix} ${n}/${MASTER_THRESHOLD}`
  return STATUS_LABEL[rec.status] || STATUS_LABEL.unknown
}

// ---------------------------------------------------------------- 状态迁移

/** 把 result 归一成 'correct' | 'incorrect'；'wrong' 是 'incorrect' 的别名 */
function normalizeResult(result) {
  if (result === 'correct') return 'correct'
  if (result === 'incorrect' || result === 'wrong') return 'incorrect'
  throw new Error(`applyAnswer: 未知的 result "${result}"`)
}

/**
 * 答错后的下次到期时间：now + 1 天（ISO 字符串）。
 * 只在答错时写；答对不触碰该字段。now 非法时返回 null（视作无调度）。
 */
function nextDueFrom(now) {
  const t = typeof now === 'string' || typeof now === 'number' ? new Date(now).getTime() : NaN
  if (!Number.isFinite(t)) return null
  return new Date(t + INCORRECT_DUE_MS).toISOString()
}

/**
 * 复习到期判定（最小到期调度，兼容旧记录）：
 * - 无 nextDueAt（含全部旧记录）→ 视作已到期
 * - nextDueAt <= now → 已到期
 * - nextDueAt > now → 未到期，不排入复习队列
 */
export function isReviewDue(record, now) {
  const due = record ? record.nextDueAt : null
  if (due == null) return true
  const t = new Date(due).getTime()
  if (!Number.isFinite(t)) return true
  const n = typeof now === 'string' || typeof now === 'number' ? new Date(now).getTime() : Date.now()
  return t <= n
}

/**
 * 答题（真实答题，会写 lastStudiedAt / lastResult）。
 * 答错时写 nextDueAt = now + 1 天（最小到期调度）；答对不改 nextDueAt。
 * @returns {{ record: LearningRecord, statusChanged: boolean, mastered: boolean }}
 *   mastered 表示"本次答题正好达标"（用于卡片上的一次性庆祝反馈）。
 */
export function applyAnswer(record, result, now) {
  const prev = record ? { ...emptyRecord(), ...record } : emptyRecord()
  const res = normalizeResult(result)

  let next
  if (res === 'correct') {
    const consecutiveCorrect = (prev.consecutiveCorrect || 0) + 1
    const reached = consecutiveCorrect >= MASTER_THRESHOLD
    // 已在 known 上再答对：状态不变，但仍算一次真实答题
    const status = reached || prev.status === 'known' ? 'known' : prev.status
    next = {
      ...prev,
      status,
      correctCount: (prev.correctCount || 0) + 1,
      consecutiveCorrect,
      lastStudiedAt: now,
      lastResult: 'correct',
      statusChangedAt: status === prev.status ? prev.statusChangedAt : now,
      statusSource: 'learning',
    }
  } else {
    const status = 'review'
    next = {
      ...prev,
      status,
      consecutiveCorrect: 0,
      incorrectCount: (prev.incorrectCount || 0) + 1,
      lastStudiedAt: now,
      lastResult: 'incorrect',
      lastIncorrectAt: now,
      nextDueAt: nextDueFrom(now),
      statusChangedAt: status === prev.status ? prev.statusChangedAt : now,
      statusSource: 'learning',
    }
  }

  return {
    record: next,
    statusChanged: next.status !== prev.status,
    mastered: next.status === 'known' && prev.status !== 'known',
  }
}

/**
 * 「我会了」一键直达 known。
 * 把 consecutiveCorrect 置为 MASTER_THRESHOLD 而不是 0，是为了守住不变量
 * 「status === 'known' ⇒ consecutiveCorrect >= MASTER_THRESHOLD」，
 * 但它不增加 correctCount —— 不伪造答题历史，也不写 lastStudiedAt / lastResult。
 */
export function markKnown(record, now) {
  const prev = record ? { ...emptyRecord(), ...record } : emptyRecord()
  if (prev.status === 'known' && (prev.consecutiveCorrect || 0) >= MASTER_THRESHOLD) return prev
  return {
    ...prev,
    status: 'known',
    consecutiveCorrect: Math.max(prev.consecutiveCorrect || 0, MASTER_THRESHOLD),
    statusChangedAt: now,
    statusSource: 'manual-known',
  }
}

/** 已掌握 → 退回复习：连续数归零，累计数据（correctCount / incorrectCount）保留 */
export function retreatToReview(record, now) {
  const prev = record ? { ...emptyRecord(), ...record } : emptyRecord()
  if (prev.status === 'review' && (prev.consecutiveCorrect || 0) === 0) return prev
  return {
    ...prev,
    status: 'review',
    consecutiveCorrect: 0,
    statusChangedAt: now,
    statusSource: 'manual-retreat',
  }
}

/** 清空该词的学习记录，回到 unknown（计数与累计全部归零） */
export function resetRecord(now) {
  return { ...emptyRecord(), statusChangedAt: now ?? null }
}

// ---------------------------------------------------------------- 排序键

/** 字母序兜底：保证任何排序结果都稳定、可回归 */
function byForm(a, b) {
  return String(a.form || '').localeCompare(String(b.form || ''), 'en')
}

function num(v, fallback = Number.MAX_SAFE_INTEGER) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/** null 排最后的升序比较器 */
function nullLastAsc(a, b) {
  if (a === b) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a < b ? -1 : 1
}

// ---------------------------------------------------------------- 队列

/**
 * 词族键（需求1：按词族成组出题）。
 * 「词族」= 共享同一词素的词群；一个词可能挂多个词素，族键优先取词根：
 * ① 有 morphTypeOf 时取第一个 type==='root' 的词素；
 * ② 无类型信息时按 id 约定兜底（r.* 为词根）；
 * ③ 都没有则取第一个词素。
 * 无词素词（morphless）返回 null —— 不成组硬凑，单独作散词保持原位。
 * @param {object} word 单词对象
 * @param {(morphId: string) => string} [morphTypeOf] 词素 id → type 映射（可选）
 * @returns {string|null} 词族键（词素 id）或 null
 */
export function defaultFamilyKeyOf(word, morphTypeOf) {
  const morphs = word && Array.isArray(word.morphs) ? word.morphs : []
  if (morphs.length === 0) return null
  const isRoot =
    typeof morphTypeOf === 'function'
      ? (id) => morphTypeOf(id) === 'root'
      : (id) => typeof id === 'string' && id.startsWith('r.')
  const root = morphs.find(isRoot)
  return root || morphs[0]
}

/**
 * 学习队列：只取 status === 'unknown'。
 * 排序：freqRank 升序 → cefrScore 升序 → form 字母序。
 * options.groupByFamily（需求1）：开启后按词族连续成组——排序结果里同族词
 * 被聚到一起（族间先后按各族首词在原排序中的位置），散词（无词素）不成组、
 * 保持原排序位置。默认关闭，行为与旧版完全一致。
 * 不跟随浏览页的筛选（不受 minCefr / 搜索词 / 弱化开关影响）。
 * @param {Array} words
 * @param {object} records
 * @param {number} [size]
 * @param {{ groupByFamily?: boolean, familyKeyOf?: (word) => string|null }} [options]
 */
export function buildLearnQueue(words, records, size = DEFAULT_ROUND_SIZE, options = {}) {
  const pool = (words || []).filter((w) => getRecord(records, w.id).status === 'unknown')
  pool.sort((a, b) => {
    if (num(a.freqRank) !== num(b.freqRank)) return num(a.freqRank) - num(b.freqRank)
    if (num(a.cefrScore) !== num(b.cefrScore)) return num(a.cefrScore) - num(b.cefrScore)
    return byForm(a, b)
  })
  const { groupByFamily = false, familyKeyOf = null } = options || {}
  if (!groupByFamily || typeof familyKeyOf !== 'function') return take(pool, size)
  // 词族聚簇：组首次出现的先后 = 族首词在原排序中的位置；组内保持原排序
  const grouped = []
  const byKey = new Map()
  pool.forEach((w) => {
    const key = familyKeyOf(w)
    if (!key) {
      grouped.push([w]) // 散词单独成组（不挪位、不硬凑）
      return
    }
    let g = byKey.get(key)
    if (!g) {
      g = []
      byKey.set(key, g)
      grouped.push(g)
    }
    g.push(w)
  })
  return take(grouped.flat(), size)
}

/**
 * 复习队列：只取 status === 'review' 且已到期（isReviewDue）。
 * 无 nextDueAt 的旧记录视作已到期；未到期的词不排入（最小到期调度）。
 * 排序：consecutiveCorrect 升序 → incorrectCount 降序 → lastIncorrectAt 升序（null 最后）
 *      → freqRank 升序 → form 字母序。
 * @param {Array} words
 * @param {object} records
 * @param {number} [size]
 * @param {string} [now] ISO 时间；缺省用当前时间（仅此一处读系统时钟）
 */
export function buildReviewQueue(words, records, size = DEFAULT_ROUND_SIZE, now = null) {
  const rec = (w) => getRecord(records, w.id)
  const dueNow = now || new Date().toISOString()
  const pool = (words || []).filter((w) => {
    const r = rec(w)
    return r.status === 'review' && isReviewDue(r, dueNow)
  })
  pool.sort((a, b) => {
    const ra = rec(a)
    const rb = rec(b)
    const ca = num(ra.consecutiveCorrect, 0)
    const cb = num(rb.consecutiveCorrect, 0)
    if (ca !== cb) return ca - cb

    const ia = num(ra.incorrectCount, 0)
    const ib = num(rb.incorrectCount, 0)
    if (ia !== ib) return ib - ia

    const ta = nullLastAsc(ra.lastIncorrectAt, rb.lastIncorrectAt)
    if (ta !== 0) return ta

    if (num(a.freqRank) !== num(b.freqRank)) return num(a.freqRank) - num(b.freqRank)
    return byForm(a, b)
  })
  return take(pool, size)
}

function take(list, size) {
  const n = typeof size === 'number' && size >= 0 ? size : DEFAULT_ROUND_SIZE
  return n === 0 ? list.slice() : list.slice(0, n)
}

// ---------------------------------------------------------------- 统计

/**
 * 三态去重统计（按 word.id 去重，同一个词可能挂在多个词素下被算多次）。
 * total 是去重后的单词数，不是入参数组的长度。
 */
export function countByStatus(words, records) {
  const seen = new Set()
  const out = { unknown: 0, review: 0, known: 0, total: 0 }
  ;(words || []).forEach((w) => {
    if (!w || seen.has(w.id)) return
    seen.add(w.id)
    const status = getRecord(records, w.id).status
    if (out[status] === undefined) out.unknown += 1
    else out[status] += 1
    out.total += 1
  })
  return out
}

// ---------------------------------------------------------------- 校验

const INT_FIELDS = ['correctCount', 'consecutiveCorrect', 'incorrectCount']

/**
 * 校验一份 records 映射（导入 / 迁移结果都要过这一关）。
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateRecords(obj) {
  const errors = []
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, errors: ['records 必须是对象'] }
  }

  Object.entries(obj).forEach(([id, r]) => {
    const at = `records["${id}"]`
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      errors.push(`${at} 必须是对象`)
      return
    }
    if (!LEARN_STATUS.includes(r.status)) {
      errors.push(`${at}.status 非法：${JSON.stringify(r.status)}`)
    }
    INT_FIELDS.forEach((f) => {
      const v = r[f]
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
        errors.push(`${at}.${f} 必须是非负整数：${JSON.stringify(v)}`)
      }
    })
    if (r.status === 'known' && (r.consecutiveCorrect || 0) < MASTER_THRESHOLD) {
      errors.push(`${at} 违反不变量：known 需要 consecutiveCorrect >= ${MASTER_THRESHOLD}`)
    }
    if (r.status !== 'known' && (r.consecutiveCorrect || 0) >= MASTER_THRESHOLD) {
      errors.push(`${at} 违反不变量：非 known 的 consecutiveCorrect 必须 < ${MASTER_THRESHOLD}`)
    }
    if (r.lastResult !== null && r.lastResult !== 'correct' && r.lastResult !== 'incorrect') {
      errors.push(`${at}.lastResult 非法：${JSON.stringify(r.lastResult)}`)
    }
    // nextDueAt（最小到期调度）：可缺省（旧记录兼容）/ null，填了必须是合法 ISO 时间字符串
    if (r.nextDueAt != null) {
      const t = new Date(r.nextDueAt).getTime()
      if (typeof r.nextDueAt !== 'string' || !Number.isFinite(t)) {
        errors.push(`${at}.nextDueAt 非法：${JSON.stringify(r.nextDueAt)}`)
      }
    }
    if (r.statusSource !== undefined && !STATUS_SOURCE.includes(r.statusSource)) {
      errors.push(`${at}.statusSource 非法：${JSON.stringify(r.statusSource)}`)
    }
  })

  return { ok: errors.length === 0, errors }
}

/**
 * 手工把某词加入「待复习」：status='review'、连续答对归零、保留累计计数；
 * 不伪造答题时间（lastStudiedAt / lastResult 不变）。
 * 已处于「待复习且连续数为 0」时幂等返回prev（不刷新时间）。
 * @returns {LearningRecord}
 */
export function setReview(record, now) {
  const prev = record ? { ...emptyRecord(), ...record } : emptyRecord()
  if (prev.status === 'review' && (prev.consecutiveCorrect || 0) === 0) return prev
  return {
    ...prev,
    status: 'review',
    consecutiveCorrect: 0,
    statusChangedAt: now,
    statusSource: 'manual',
  }
}

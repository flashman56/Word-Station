/**
 * 学习记录的唯一对外入口：状态 + 持久化 + 派生（统计 / 队列）
 * ------------------------------------------------------------------
 * - 存储：localStorage（**键约定全部见 lib/migrate.js**，本文件不出现任何键名）
 * - 首次挂载跑一次迁移（幂等），之后所有写操作在写入函数内部同步落盘
 * - 所有状态变更都走 lib/learning.js 的纯函数，这里只负责「取 → 算 → 存」
 *
 * ★ 两条与分区隔离直接相关的铁律 ★
 *   1. **没有「records 变化即写盘」的副作用**。落盘一律在六个写入点显式
 *      `persist(next, scopeRef.current)`。副作用式写盘在切号时会出最隐蔽的 bug：
 *      scope 变了一帧、setRecords 还没提交 → 旧 records 被写进**新**分区键。
 *      去掉副作用等于整类 bug 消失。
 *   2. 任何 `writeXxx` 的 scope 参数恒等于 `scopeRef.current`（records 归属分区）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_ROUND_SIZE,
  LEARN_STORE_VERSION,
  applyAnswer,
  buildLearnQueue,
  buildReviewQueue,
  countByStatus,
  defaultFamilyKeyOf,
  getRecord,
  markKnown as markKnownPure,
  resetRecord,
  retreatToReview,
  setReview as setReviewPure,
  validateRecords,
} from '../lib/learning.js'
import {
  clearMigration,
  ensurePartition,
  readLearn,
  readMigrationFlag,
  readPrefs,
  runMigration,
  scopeOf,
  writeLearn,
  writePrefs,
} from '../lib/migrate.js'
import { countScheduled } from '../lib/scheduled.js'
import { buildFoldView } from '../lib/lemmaFold.js'
import { buildDailyTask, nextDueChangeAt } from '../lib/daily.js'

/**
 * 到期时钟（dueNow）的最大回跳间隔。
 *
 * ★ 为什么需要它 ★
 *   到期判定（isReviewDue）读的是 `new Date()`，而本文件所有派生都被 useMemo 缓存 ——
 *   没有时钟推进，页面开着不动，「今天该复习 N 个」就会停在上次渲染那一刻。
 *   `nextDueAt` 只在**答错**时写（唯一调度规则 = +24h），所以到期集合真正发生变化的
 *   时刻是**可预知的**：就是记录里那个 nextDueAt。定时器按那一刻精确唤醒，
 *   不做轮询。
 *
 * ★ 为什么还有 10 分钟兜底 ★
 *   后台标签页的 setTimeout 会被浏览器节流，恢复时可能晚几分钟才触发；系统时钟
 *   被手动改动也会让已排的唤醒点失真。10 分钟一次的重校准把这类漂移的上界压到
 *   10 分钟 —— 代价是每小时至多 4 次额外渲染，每次只重算到期相关的那几个 memo，
 *   不是渲染风暴（对比：每答一题本来就会触发同样规模的 countByStatus 重算）。
 */
export const DUE_CLOCK_MAX_MS = 10 * 60 * 1000

/**
 * 到期时钟 hook —— 给「凡是独立派生到期相关数字的组件」用。
 *
 * 返回一个随时间推进的 ISO 字符串。**不是** Date 对象：它要作为 useMemo 的依赖，
 * 必须是可比较的值类型。
 *
 * ★ 为什么单独抽出来 ★
 *   useLearn 与 StationLearn 各有一套折叠视图与抽词池，但到期语义完全一样。
 *   两者共用这一个 hook，「今天该复习几个」在两处就必然同口径 —— 若各自写一份
 *   定时器，迟早会出现学习页说 7 个、小站说 6 个（同一条记录、同一套判据）。
 *
 * @param {Array}  words    词表（用于找下一次到期时刻）
 * @param {object} records  学习记录
 * @returns {string} 当前时间（ISO 8601）
 */
export function useDueClock(words, records) {
  const [dueNow, setDueNow] = useState(() => new Date().toISOString())
  useEffect(() => {
    const nowMs = Date.now()
    const changeAt = nextDueChangeAt(words, records, new Date(nowMs).toISOString())
    const waitMs = Math.min(
      DUE_CLOCK_MAX_MS,
      changeAt == null ? DUE_CLOCK_MAX_MS : Math.max(1000, changeAt - nowMs + 1000),
    )
    const timer = setTimeout(() => setDueNow(new Date().toISOString()), waitMs)
    return () => clearTimeout(timer)
  }, [words, records, dueNow])
  return dueNow
}

/**
 * 难度分档常量（区间语义）：
 * - 20000 以内每 3000 词一档：0~3000、3000~6000、…、18000~20000
 * - 20000 以后每 10000 词一档：20000~30000、30000~40000、…
 * - 最后一档自动截到 maxRank（如 60000~64825）
 * 档位由 buildBands(maxRank) 动态推导，词库扩容后自动多出高档位，不硬编码。
 */
export const BAND_STEP_SMALL = 3000
export const BAND_STEP_LARGE = 10000
export const BAND_SWITCH_RANK = 20000

/**
 * 由数据最大 freqRank 推导全部难度档位。
 * @param {number} maxRank 词库中最大的 freqRank（无数据时传 0）
 * @returns {Array<{id: string, lo: number, hi: number, label: string}>}
 *   首项固定为「全部」档（id='all'，hi=Infinity），其余按上述规则生成，
 *   抽词语义为 freqRank ∈ (lo, hi]。
 */
export function buildBands(maxRank) {
  const max = Number(maxRank)
  const bands = [{ id: 'all', lo: 0, hi: Infinity, label: '全部' }]
  if (!Number.isFinite(max) || max <= 0) return bands
  let lo = 0
  while (lo < max) {
    const step = lo >= BAND_SWITCH_RANK ? BAND_STEP_LARGE : BAND_STEP_SMALL
    // 小步阶段封顶在 20000（18000~20000 而非 18000~21000），大步阶段自然截到 max
    const capped = lo >= BAND_SWITCH_RANK ? lo + step : Math.min(lo + step, BAND_SWITCH_RANK)
    const hi = Math.min(capped, max)
    bands.push({ id: `${lo}-${hi}`, lo, hi, label: `${lo}~${hi}` })
    lo = hi
  }
  return bands
}

/**
 * 归一化持久化里读到的 learnBand 值。
 * 兼容迁移：旧版 topN 数字（5000/7000/9000/11000）无法一一映射区间，
 * 一律回落 'all'；其他未知值同样兜底为 'all'，保证旧 localStorage 不崩。
 * @param {'all'|number|string|{lo:number,hi:number,id?:string}|null} band
 * @returns {'all'|{id: string, lo: number, hi: number}}
 */
export function normalizeBand(band) {
  if (band == null || band === 'all') return 'all'
  // 新格式：区间对象（含从 localStorage 反序列化回来的普通对象）
  if (typeof band === 'object') {
    const lo = Number(band.lo)
    const hi = Number(band.hi)
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) {
      return { lo, hi, id: typeof band.id === 'string' ? band.id : `${lo}-${hi}` }
    }
    return 'all'
  }
  // 字符串区间 id，如 '3000-6000'
  if (typeof band === 'string') {
    const m = /^(\d+)-(\d+)$/.exec(band)
    if (m) {
      const lo = Number(m[1])
      const hi = Number(m[2])
      return { lo, hi, id: `${lo}-${hi}` }
    }
  }
  return 'all'
}

/**
 * 难度分档（词频区间）：'all' 表示全库；区间对象表示 freqRank ∈ (lo, hi]。
 * 只作用于「学习队列」的抽词池——复习队列与统计始终用全库口径，
 * 保证已在学 / 已掌握的记录不受选档影响。freqRank 缺失的词只进「全部」档。
 */
export function bandFilter(words, band) {
  const b = normalizeBand(band)
  if (b === 'all') return words
  return words.filter(
    (w) => typeof w.freqRank === 'number' && w.freqRank > b.lo && w.freqRank <= b.hi,
  )
}

/**
 * 空数组哨兵。
 *
 * ⚠ 默认参数里写字面量 `[]` 会**每次渲染都产生新数组身份**，从而让
 *   `statWords` 的 useMemo 依赖失效 → countByStatus 每次渲染都重算 6 万词
 *   （实测会拖慢总览地图的首屏渲染到断言超时）。必须是模块级常量。
 */
const NO_PRIVATE_WORDS = []

/**
 * 批量操作的分批大小（只被本文件的 applyMany 用，故不放 lib/）。
 *
 * 取 500 的理由：一批 ≈ 500 条记录，setRecords 触发的重算（countByStatus 全库
 * 6 万词）能在可感知的阈值内摊平；同时批数不至于多到让 persist 放大总字节太多
 * （12 批 / 6000 条 ≈ 12 倍放大 —— 见 applyMany 注释里「分批不减少单次体积」的提醒，
 * 配额真正的护栏是调用方的 2000 条上限，不是这个数）。
 */
const BULK_CHUNK = 500

/**
 * 「全选当前结果」一次最多批量操作的条数（A-07）。
 *
 * ★ 上限放在这里而不是组件里，是为了让它和 applyMany 的分批处在同一份约定下：
 *   6.4 万条一次性 setRecords 会卡死，2000 条则既摊平了渲染又远小于配额危险区。
 *   组件必须**只算一次**这个集合，然后文案与提交都用它（单一数据源）——
 *   见 ListView 的 selectableAllIds 注释。
 */
export const BULK_SELECT_CAP = 2000

/**
 * @param {Array} words 全量单词
 * @param {object} [opts]
 * @param {string} [opts.scope] 当前分区（scopeOf(ownerId) 的结果；默认 'guest'）
 * @param {Array}  [opts.privateWords] 私有词视图对象（默认 []）—— 只进统计与复习队列，不进新学队列
 * @param {number} [opts.roundSize] 每轮词数
 * @param {'all'|{id,lo,hi}} [opts.band] 难度分档（只收窄学习抽词池）
 * @param {boolean} [opts.groupByFamily] 需求1：新学队列按词族成组学习（默认开）
 * @param {Array<string>} [opts.selectedRoots] 按词族成组学习时自选词根（词素 id 数组）；
 *   为空 / null 表示学全部词根；仅在 groupByFamily 为 true 时生效，只收窄新学抽词池。
 * @param {Array} [opts.morphemes] 词素数组（用于识别词根 → 词族键）
 * @param {(keys: string[]) => void} [opts.onDirty] 写操作回调（云端同步据此标记 dirty，纯函数层不受影响）
 * @param {(err: {code: string, message: string}|null) => void} [opts.onStorageError] 写盘失败回调（A-12）
 * @param {boolean} [opts.stampUpdatedAt] 是否给写出的记录打 updatedAt（默认 true）
 * @param {boolean} [opts.excludeProper] 开启后把专有名词（kind === 'proper'）排除在
 *   学习 / 复习队列与统计之外（默认关）。过滤发生在**传给 learning.js 之前**：
 *   buildLearnQueue / buildReviewQueue 只接收数组、永远不知道 kind。
 */
export function useLearn(
  words,
  {
    scope = 'guest',
    privateWords = NO_PRIVATE_WORDS,
    roundSize = DEFAULT_ROUND_SIZE,
    band = 'all',
    groupByFamily = true,
    selectedRoots = null,
    morphemes = null,
    onDirty = null,
    onStorageError = null,
    stampUpdatedAt = true,
    excludeProper = false,
  } = {},
) {
  const list = words || []

  /**
   * 学习 / 复习 / 统计的基准词表：按 excludeProper 过滤掉专有名词。
   *
   * ★ 迁移必须用 `list` 而不是 `baseList` ★
   *   runMigration 的继承语义是「按全库高频词继承已知状态」，若用过滤后的
   *   baseList 跑，用户翻一下 excludeProper 开关再重跑迁移，就会静默改掉
   *   约 1.4 万个专有名词的继承状态（数据事故，且无任何提示）。
   */
  const baseList = useMemo(
    () => (excludeProper ? list.filter((w) => w && w.kind !== 'proper') : list),
    [list, excludeProper],
  )

  // onDirty 放进 ref：回调变化不应引起下面的 useCallback 重建（否则队列会重算）
  const onDirtyRef = useRef(onDirty)
  useEffect(() => {
    onDirtyRef.current = onDirty
  }, [onDirty])

  /**
   * 是否给写出的记录打 updatedAt（云端冲突合并的依据）。
   * ★ 默认 true（常开），游客态也打。理由：merge.js 把「无 updatedAt」视为 0
   *   → 登录合并时云端默认值永远赢，游客背的词会被云端 unknown 覆盖（GAP-4）。
   *   成本可控：只有游客态**新写入**的记录带 updatedAt，
   *   3 万条历史继承记录是存量、不会被回填。
   */
  const stampRef = useRef(Boolean(stampUpdatedAt))
  useEffect(() => {
    stampRef.current = Boolean(stampUpdatedAt)
  }, [stampUpdatedAt])

  // records 归属分区。声明在所有写入点之前，任何 persist 都取它。
  const scopeRef = useRef(scopeOf(scope))

  // 写盘失败信号（A-12）：放进 ref，回调变化不引起 persist 重建
  const onStorageErrorRef = useRef(onStorageError)
  useEffect(() => {
    onStorageErrorRef.current = onStorageError
  }, [onStorageError])

  /**
   * 显式落盘。**写失败绝不能静默**（A-12）。
   *
   * 分区后每个账号一份载荷，多账号会把本机配额顶满（Safari 无痕单域约 5MB）。
   * 静默 catch 的后果是：用户以为进度存上了，实际根本没存进去，刷新即丢，
   * 而且**无任何提示** —— 这比一开始报错更糟。所以：
   *   - 失败 → onStorageError({code, message}) 上报，徽标进入红色告警态；
   *   - 成功 → onStorageError(null) 清除告警（告警态持续到下一次写成功，
   *     不做成一次性 toast：否则用户改完一条看到告警消失，会以为问题已解决）；
   *   - **内存态照常更新**：写盘失败不得让用户刚做的操作凭空消失，答题零阻塞。
   */
  const persist = useCallback((next, sc) => {
    const target = sc || scopeRef.current
    try {
      writeLearn(next, target)
      if (onStorageErrorRef.current) onStorageErrorRef.current(null)
    } catch (e) {
      if (onStorageErrorRef.current) {
        onStorageErrorRef.current({
          code: e && e.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'WRITE_FAILED',
          message: (e && e.message) || String(e),
        })
      }
      // 故意不 rethrow：内存态已经是新的（调用方在此之前已 setRecords），
      // 这里抛出去只会让答题路径变成一次未处理的异常。
    }
  }, [])

  // 首次渲染就跑迁移（幂等），保证第一帧统计就是迁移后的口径
  const [records, setRecords] = useState(() => {
    const sc = scopeOf(scope)
    if (typeof localStorage !== 'undefined') {
      ensurePartition(sc)
      runMigration({ scope: sc, words: list, inheritFreqKnown: readPrefs(sc).inheritFreqKnown !== false })
    }
    return readLearn(sc)
  })

  const [migration, setMigration] = useState(() => readMigrationFlag(scopeOf(scope)))

  const [inheritFreqKnown, setInheritFreqKnown] = useState(
    () => readPrefs(scopeOf(scope)).inheritFreqKnown !== false,
  )

  // ref 与 state 同步：写操作需要"立刻算出结果返回给调用方"，不能等下一次 render
  const recordsRef = useRef(records)
  useEffect(() => {
    recordsRef.current = records
  }, [records])

  // ---------------------------------------------------------------- 切分区
  //
  // scope 变化（登录 / 登出 / 换号）时：换分区 → 领养旧键（仅首个）→ 跑该分区的
  // 迁移 → 读该分区的记录。**不在这里落盘**（setRecords 之后由下一次显式写入负责），
  // 避免「切号瞬间把上一个分区的 records 写进新分区」。

  const prevScopeRef = useRef(scopeRef.current)
  useEffect(() => {
    const sc = scopeOf(scope)
    if (prevScopeRef.current === sc) return
    prevScopeRef.current = sc
    scopeRef.current = sc

    ensurePartition(sc)
    runMigration({ scope: sc, words: list, inheritFreqKnown: readPrefs(sc).inheritFreqKnown !== false })
    setMigration(readMigrationFlag(sc))
    setInheritFreqKnown(readPrefs(sc).inheritFreqKnown !== false)
    // ★ 直接改 ref 而不是等下一帧 setState：这一帧内到达的写操作
    //   （例如同步派发的 onDirty 回调）必须落到新分区。
    const fresh = readLearn(sc)
    recordsRef.current = fresh
    setRecords(fresh)
  }, [scope, list])

  const commit = useCallback(
    (wordId, nextRecord) => {
      // updatedAt 是云端冲突合并（按 updated_at 记录级 LWW）的依据，本地写必须打时间戳。
      // learning.js 是纯函数、不关心存储，所以时间戳在这里补，纯函数层零改动。
      const stamped = stampRef.current
        ? { ...nextRecord, updatedAt: new Date().toISOString() }
        : nextRecord
      const next = { ...recordsRef.current, [wordId]: stamped }
      recordsRef.current = next
      setRecords(next)
      persist(next, scopeRef.current)
      // 云端同步：标记该 word_key 为 dirty（离线可用，写路径本身不变）
      if (onDirtyRef.current) onDirtyRef.current([wordId])
    },
    [persist],
  )

  /**
   * 答题。result: 'correct' | 'incorrect'（'wrong' 亦可）
   * @returns {{ record, statusChanged, mastered }} 便于卡片立刻给出反馈
   */
  const answer = useCallback(
    (wordId, result) => {
      const now = new Date().toISOString()
      const out = applyAnswer(getRecord(recordsRef.current, wordId), result, now)
      commit(wordId, out.record)
      return out
    },
    [commit],
  )

  /** 「我会了」：一键直达 known */
  const markKnown = useCallback(
    (wordId) => {
      const now = new Date().toISOString()
      commit(wordId, markKnownPure(getRecord(recordsRef.current, wordId), now))
    },
    [commit],
  )

  /** 已掌握 → 退回复习（累计数据保留） */
  const retreat = useCallback(
    (wordId) => {
      const now = new Date().toISOString()
      commit(wordId, retreatToReview(getRecord(recordsRef.current, wordId), now))
    },
    [commit],
  )

  /** 清空该词的学习记录，回到 unknown */
  const reset = useCallback(
    (wordId) => {
      const now = new Date().toISOString()
      commit(wordId, resetRecord(now))
    },
    [commit],
  )

  /** 手工加入「待复习」：连续归零、累计数据保留 */
  const setReview = useCallback(
    (wordId) => {
      const now = new Date().toISOString()
      commit(wordId, setReviewPure(getRecord(recordsRef.current, wordId), now))
    },
    [commit],
  )

  /**
   * 批量操作：只 commit 一次，避免上万条逐个 setState 卡死。
   * kind: 'known'（我会了）| 'review'（加入待复习）| 'reset'（清除学习记录）
   *
   * ★ 分批的收益必须说清楚（别被「分批能缓解配额」的说法误导）★
   *   `persist` → `writeLearn(records, scope)` 写的是**整个 records 映射**
   *   （`{version, records}`）。所以分批之后，**每次 persist 写的仍然是全量**，
   *   单次写入的体积一点没变，总字节反而放大 N 倍。
   *   分批的真实收益只有两条：
   *     ① 摊平上万次 setRecords 带来的渲染成本（这是真的卡顿来源）；
   *     ② onDirty 能只在最后调一次。
   *   **真正把 QuotaExceededError 压下去的是调用方的 2000 条上限**
   *   （它把「新生成的记录数」从最多 6.4 万压到最多 2000）。
   *   两条**缺一不可**：只有上限 → 大列表点一下仍会一次 setRecords 6 万条卡顿；
   *   只有分批 → 配额照样爆。
   *
   * ★ 批内失败为什么不中断循环 ★
   *   persist 内部已 catch 并走 onStorageError，**内存态已经是新的**。中途 break
   *   会把「已写 2500 条」变成一个用户和磁盘都不认识的中间态 —— 而实际上内存里
   *   已经有 6000 条了。继续跑完，让内存态与磁盘的差距保持为「整批未落盘」，
   *   告警徽标会一直亮着，用户知道要导出备份。
   *
   * @returns {{ count: number, chunks: number }|null} 供调用方出准确文案
   */
  const applyMany = useCallback(
    (ids, kind) => {
      if (!ids || !ids.length) return null
      const now = new Date().toISOString()
      const chunks = Math.ceil(ids.length / BULK_CHUNK)
      let next = recordsRef.current

      for (let start = 0; start < ids.length; start += BULK_CHUNK) {
        const batch = ids.slice(start, start + BULK_CHUNK)
        const acc = { ...next }
        batch.forEach((id) => {
          const cur = getRecord(acc, id)
          let rec
          if (kind === 'known') rec = markKnownPure(cur, now)
          else if (kind === 'review') rec = setReviewPure(cur, now)
          else rec = resetRecord(now)
          // 同上：默认补 updatedAt，供冲突合并使用
          acc[id] = stampRef.current ? { ...rec, updatedAt: now } : rec
        })
        next = acc
        // 直接改 ref 而不是等下一帧：下一批要在这个基础上继续累加
        recordsRef.current = next
        setRecords(next)
        persist(next, scopeRef.current)
      }

      // ★ 只在最后调一次（不是每批一次）★
      //   逐批调会让 useLearnCloud 起 N 个防抖窗口、N 次 pushDirty，而 pushDirty
      //   读的是 recordsRef.current（此时已含全部批次）—— 逐批调纯属浪费。
      if (onDirtyRef.current) onDirtyRef.current(ids)
      return { count: ids.length, chunks }
    },
    [persist],
  )

  /**
   * 整体替换记录（云端下行合并 / 切分区时用）。
   * 只做「内存 + 落盘」，不触碰 learning.js 的纯函数规则。
   * @param {Record<string, object>} next
   * @param {string} [sc] 目标分区；缺省当前分区
   */
  const replaceAll = useCallback(
    (next, sc) => {
      const clean = next && typeof next === 'object' ? next : {}
      recordsRef.current = clean
      setRecords(clean)
      persist(clean, sc)
    },
    [persist],
  )

  const clearAll = useCallback(() => {
    recordsRef.current = {}
    setRecords({})
    persist({}, scopeRef.current)
  }, [persist])

  /**
   * 导出 v2 结构，供用户另存。
   *
   * ★ 依赖提醒（A-12 徽标文案依赖这条）★
   *   徽标的容量告警文案里写着「建议先导出 JSON 备份当前进度」——
   *   那句话之所以成立，靠的就是这里序列化的是**内存态 `records`**（依赖数组 [records]），
   *   而**不是**从 localStorage 读。
   *
   *   这一点在写盘失败时尤其关键：磁盘是旧的、内存是新的，若哪天有人把这里
   *   改成读 localStorage，导出的就会是那份「丢掉了最近改动」的旧数据，
   *   告警文案里的补救建议随之变成一句假承诺 —— 用户照做，备份出来的却正是
   *   他最需要保住的那部分内容的反面。
   */
  const exportJson = useCallback(
    () => JSON.stringify({ version: LEARN_STORE_VERSION, records }, null, 2),
    [records],
  )

  /**
   * 导入 v2 结构（也容忍直接传 records 对象）。校验不通过则什么都不改。
   * @returns {{ ok: boolean, count: number, errors?: string[] }}
   */
  const importJson = useCallback((text) => {
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return { ok: false, count: 0, errors: ['不是合法的 JSON'] }
    }
    const incoming = parsed && typeof parsed === 'object' ? parsed.records || parsed : null
    if (!incoming || typeof incoming !== 'object') {
      return { ok: false, count: 0, errors: ['缺少 records 字段'] }
    }
    const check = validateRecords(incoming)
    if (!check.ok) return { ok: false, count: 0, errors: check.errors }
    recordsRef.current = incoming
    setRecords(incoming)
    persist(incoming, scopeRef.current)
    return { ok: true, count: Object.keys(incoming).length }
  }, [persist])

  /**
   * 重跑迁移（设置里切换「高频继承」后用）。会覆盖当前分区的 v2 记录，调用方需二次确认。
   * 备份键永不被清，旧数据随时可找回。开关值同时写入分区 prefs 键。
   */
  const rerunMigration = useCallback(
    (nextInherit = true) => {
      const sc = scopeRef.current
      clearMigration(sc)
      setInheritFreqKnown(nextInherit)
      writePrefs({ inheritFreqKnown: Boolean(nextInherit) }, sc)
      const res = runMigration({ scope: sc, words: list, inheritFreqKnown: nextInherit })
      if (res.ok) {
        const now = new Date().toISOString()
        setMigration({ done: true, at: now, report: res.report || null })
        const fresh = readLearn(sc)
        recordsRef.current = fresh
        setRecords(fresh)
      }
      return res
    },
    [list, persist],
  )

  // ---------------------------------------------------------------- 派生
  //
  // ★ 屈折归并（Step-2）★
  //   学习单元收敛到词族：被折叠形（w.lemma 有值）不再单列，其学习记录按
  //   known > review > unknown 的优先级并入代表形（详见 lib/lemmaFold.js）。
  //   「折叠只作用于学习 / 复习队列与统计」——词条仍在词库、仍可浏览（UI 阶段另做）。
  //
  //   statWords 拆成两份，切勿混用：
  //     · statWords     —— **未折叠**（公共 ∪ 私有）：对外返回，供 App 做词汇量估算
  //                         输入（vocab.js 冻结域，样本口径不动，见 reports/lemma/step2-spec.md §6）。
  //     · foldStatWords —— **折叠后**（foldUnits ∪ 私有）：供 countByStatus /
  //                         countScheduled / buildReviewQueue 使用，分母随之收缩到单元数。
  //
  // statWords = 公共词库 ∪ 私有词：私有词的 word_key 口径与公共词完全一致，
  //   所以统计（countByStatus）、复习队列（buildReviewQueue）、词汇量预测都该看它，
  //   否则私有词在三个地方同时隐形。
  // learnPool 仍只用公共词：私有词 freqRank 多为 null（排到最后一档再被 take 砍掉），
  //   放进新学队列不但打乱难度序，还几乎必然抽不到（Q4）。私有词不参与折叠。
  //
  // ★ 两者都以 `baseList`（已按 excludeProper 过滤）为准 ★
  //   专有名词开关一旦开启，被排除的词必须在「统计 / 复习 / 新学」三处同时消失；
  //   只过滤 learnPool 而不过滤 statWords 会出现：某个专有名词明明背过、
  //   却仍每天出现在复习队列里 —— 用户会认为开关坏了。
  //   迁移（runMigration）是唯一例外，仍用未过滤的 list，见 baseList 处注释。
  const privateList = privateWords || []
  const statWords = useMemo(
    () => (privateList.length ? [...baseList, ...privateList] : baseList),
    [baseList, privateList],
  )

  /**
   * 折叠视图（读时合并，不改原对象 / 不落盘）：
   *   · foldUnits   —— 代表形集合（words 中未被折叠者，保持原顺序）= 学习单元。
   *   · foldRecords —— 被折叠形的记录按最优并入代表形后的记录视图
   *                    （不在 baseList 里的键，如私有词，原样保留）。
   * 依赖 baseList（而非 list）以与 excludeProper 口径一致；迁移与存储路径不受影响。
   */
  const fold = useMemo(() => buildFoldView(baseList, records), [baseList, records])
  const foldUnits = fold.units
  const foldRecords = fold.records
  // 折叠后的统计词表（私有词不入折叠域，原样并入）
  const foldStatWords = useMemo(
    () => (privateList.length ? [...foldUnits, ...privateList] : foldUnits),
    [foldUnits, privateList],
  )

  /**
   * 三态去重计数（不含「已排期」）。
   *
   * ★ 单独拆一个 memo，是为了让时钟推进不重跑它 ★
   *   countByStatus 要给 6 万个词各分配一个 getRecord 补全对象，是本文件最贵的一遍。
   *   它只看 status、**与时间无关** —— 若把它和 countScheduled 放进同一个 memo，
   *   每 10 分钟一次的时钟校准就会连带重跑它。拆开后，dueNow 变化只重跑
   *   countScheduled（不分配对象）与下面的 daily。
   */
  const statusCounts = useMemo(() => countByStatus(foldStatWords, foldRecords), [foldStatWords, foldRecords])

  /**
   * 到期时钟：本 hook 内**唯一**的「现在」（实现见文件顶部的 useDueClock）。
   * 唤醒策略：精确到下一次到期时刻 + DUE_CLOCK_MAX_MS 兜底重校准，不做轮询。
   */
  const dueNow = useDueClock(foldStatWords, foldRecords)

  /**
   * 三态统计 + 「已排期」。
   *
   * ★★ 为什么 `scheduled` 挂在 stats 对象里，而不是单独 return 一个字段 ★★
   *   records 只存在于这个 hook 内；Sidebar / LearnHome 拿到的都是 `learn.stats`。
   *   若把 scheduled 作为**独立 prop** 下发，就必须由 App.jsx 显式透传 ——
   *   而 App.jsx 正由另一位工程师并行修改，红线是不碰的，那条 prop 永远传不过来，
   *   组件里恒为默认 0，功能就成了永不显示的死代码。
   *   放进 stats 则随既有对象自动抵达两处，**不需要动 App.jsx**。
   *
   * ★★ 口径：它是 review 的**子集**，不是并列的一栏 ★★
   *   countByStatus 只按 record.status 分桶，**不看** nextDueAt —— 所以
   *   「明天到期」的词本来就计入待复习卡片。这两个数字不是并列关系，
   *   组件里必须写成「其中 N 个已排期」，否则用户会以为待复习之外
   *   还多出 N 个词，数字对不上账。
   *
   * ★★ 为什么没有改 countByStatus 让它一并返回 ★★
   *   learning.js 自初始提交起零改动是本项目的硬红线；且该函数是纯状态机语义，
   *   「已排期」纯属展示层派生，混进去会让红线文件凭空多出一个非语义的字段。
   *   与 countByStatus 共用同一个 foldStatWords 数组与 foldRecords，保证两者口径一致（子集关系）。
   *
   * ★★ 为什么走折叠视图（Step-2）★★
   *   折叠后 total 自然收缩到「学习单元数」，学习页进度条分母（stats.total）随之变小；
   *   STATS_SCOPE 常量保持「词库总量」语义，**已不参与任何显示分母**（见 derive.js 注释）。
   *
   * ★ now 显式传 dueNow（不再让 countScheduled 自读时钟）★
   *   队列、统计、日行三者共用同一个时间点，避免「已排期 / 待复习 / 今天要复习」
   *   三个数字来自三个不同瞬间。
   */
  const stats = useMemo(
    () => ({ ...statusCounts, scheduled: countScheduled(foldStatWords, foldRecords, dueNow) }),
    [statusCounts, foldStatWords, foldRecords, dueNow],
  )
  // 词素 id → type 映射：词族键优先取词根（r.*），与词云的「词根为干、单词为叶」口径一致。
  // ★ 必须放在 familyKeyOf 之前：familyKeyOf 的 useCallback 工厂直接读它。
  const morphTypes = useMemo(() => {
    const map = new Map()
    ;(morphemes || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m.type)
    })
    return map
  }, [morphemes])
  // 词族键（词根优先）。★ 必须放在 learnPool 之前 ——
  // learnPool 的 useMemo 工厂同步调用 familyKeyOf，而 const 在声明行之前处于 TDZ，
  // 若晚于 learnPool 定义，首屏渲染即 ReferenceError 白屏（线上事故根因：
  // 01e35be 把它挪到了 learnPool 之后，导致整站「打不开」）。
  const familyKeyOf = useCallback(
    (w) => defaultFamilyKeyOf(w, (id) => morphTypes.get(id)),
    [morphTypes],
  )
  // 难度分档只收窄学习抽词池；复习队列仍取全库（选档不影响已加入待复习的词）。
  // ★ 两者都走折叠视图：队列单元即代表形，与统计口径一致。
  // 自选词根（selectedRoots）：仅 groupByFamily 时生效，按词族键再收窄新学抽词池；
  // 与选档同一语义——只影响新学、不动复习队列与统计。0 个 / null 选择表示全部词根。
  const learnPool = useMemo(() => {
    const banded = bandFilter(foldUnits, band)
    if (!groupByFamily || !selectedRoots || selectedRoots.length === 0) return banded
    const set = new Set(selectedRoots)
    return banded.filter((w) => {
      const key = familyKeyOf(w)
      return key && set.has(key)
    })
  }, [foldUnits, band, groupByFamily, selectedRoots, familyKeyOf])
  // 词素 id → 整条词素对象（取展示形 / 释义用）
  const morphById = useMemo(() => {
    const map = new Map()
    ;(morphemes || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m)
    })
    return map
  }, [morphemes])
  /**
   * 可选词根目录（仅 groupByFamily 时有意义）：列出当前学习池里出现的全部词根，
   * 供「按词族成组学习」模式下用户自选要学的词族。
   * 每条：{ id（词素 id）, form（展示形）, display, gloss（释义）, count（该族剩余未知词数） }。
   * 排序：剩余未知词数降序 → 展示形字母序，让用户先看到还有最多词可学的族。
   */
  const rootOptions = useMemo(() => {
    if (!groupByFamily) return []
    const byKey = new Map()
    foldUnits.forEach((w) => {
      const key = familyKeyOf(w)
      if (!key) return
      let e = byKey.get(key)
      if (!e) {
        e = { id: key, count: 0, remaining: 0 }
        byKey.set(key, e)
      }
      // count = 该词根词族覆盖的「代表形」总数（衡量这个词根能教多少词，扩充后立即可见）；
      // remaining = 其中尚未学习的词数（给已学过一些词的老用户一个进度提示）。
      e.count += 1
      if (getRecord(foldRecords, w.id).status === 'unknown') e.remaining += 1
    })
    const out = []
    byKey.forEach((e) => {
      const m = morphById.get(e.id)
      const form = (m && (m.display || m.form)) || e.id.replace(/^r\./, '')
      out.push({
        id: e.id,
        form,
        display: (m && (m.display || m.form)) || form,
        gloss: (m && m.gloss) || '',
        count: e.count,
        remaining: e.remaining,
      })
    })
    out.sort((a, b) => b.count - a.count || String(a.form).localeCompare(String(b.form), 'en'))
    return out
  }, [foldUnits, foldRecords, familyKeyOf, morphById, groupByFamily])
  const learnQueue = useMemo(
    () => buildLearnQueue(learnPool, foldRecords, roundSize, { groupByFamily, familyKeyOf }),
    [learnPool, foldRecords, roundSize, groupByFamily, familyKeyOf],
  )
  // 复习队列：只排已到期词（nextDueAt 为空 / 已过期；未到期不排，答错 +1 天）
  //
  // ★ now 从 dueNow 取，不再各自 new Date() ★
  //   原先这一行与 scheduled.js:33 各读一次系统时钟：两次采样之间若跨过到期边界，
  //   「待复习总数」与「已排期」会同时属于两个时间点，出现「已排期 3，待复习 0」
  //   这类自相矛盾的显示（scheduled.js 的注释已经把它列为必须避免的反例）。
  //   统一到同一个 dueNow 之后，子集关系由构造保证。
  const reviewQueue = useMemo(
    () => buildReviewQueue(foldStatWords, foldRecords, roundSize, dueNow),
    [foldStatWords, foldRecords, roundSize, dueNow],
  )

  /**
   * 「今天这一轮」：到期数 / 新学数 / 本轮各取几个 / 预计分钟 / 已排期 / 24h 内到期数。
   *
   * 复用既有池与既有判据，不新增数据：dueTotal 与 reviewQueue 同源（同一个
   * foldStatWords + foldRecords + dueNow），newTotal 与 learnQueue 同源（同一个
   * learnPool），scheduled 走 countScheduled。
   */
  const daily = useMemo(
    () =>
      buildDailyTask({
        reviewPool: foldStatWords,
        learnPool,
        records: foldRecords,
        now: dueNow,
        roundSize,
      }),
    [foldStatWords, learnPool, foldRecords, dueNow, roundSize],
  )

  // ★ recordOf 对外仍走**未折叠** records（与 learn.records 同口径）★
  //   卡片展示的是代表形自身记录；跨词形的合并进度只体现在队列与统计里。
  const recordOf = useCallback((wordId) => getRecord(records, wordId), [records])

  return {
    records,
    recordOf,
    scope: scopeRef.current,
    statWords,
    stats,
    /**
     * 「今天这一轮」。**刻意不塞进 stats** —— stats 是「三态计数」这个概念的
     * 单一数据源，混入时间预估会让它的语义变浑；daily 独立成字段，语义自洽。
     * App.jsx 需显式透传（见 App.jsx 的 daily={learn.daily}），本文件不碰 App.jsx。
     */
    daily,
    learnQueue,
    reviewQueue,
    /** 可选词根目录（仅 groupByFamily 时非空）：供学习首页渲染「自选词根」查找器 */
    rootOptions,
    answer,
    markKnown,
    retreat,
    reset,
    setReview,
    applyMany,
    clearAll,
    replaceAll,
    exportJson,
    importJson,
    rerunMigration,
    inheritFreqKnown,
    migrationReport: migration && migration.report ? migration.report : null,
  }
}

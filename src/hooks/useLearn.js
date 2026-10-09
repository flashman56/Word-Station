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
 * @param {boolean} [opts.groupByFamily] 需求1：新学队列按词族成组出题（默认开）
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
  // statWords = 公共词库 ∪ 私有词：私有词的 word_key 口径与公共词完全一致，
  //   所以统计（countByStatus）、复习队列（buildReviewQueue）、词汇量预测都该看它，
  //   否则私有词在三个地方同时隐形。
  // learnPool 仍只用公共词：私有词 freqRank 多为 null（排到最后一档再被 take 砍掉），
  //   放进新学队列不但打乱难度序，还几乎必然抽不到（Q4）。
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
   *   与 countByStatus 共用同一个 statWords 数组，保证两者口径一致（子集关系）。
   *
   * 成本：比原先多一遍 6 万词的遍历，但与 stats 共用同一组依赖
   * （statWords / records），只在二者变化时重算，不进渲染热路径。
   */
  const stats = useMemo(
    () => ({ ...countByStatus(statWords, records), scheduled: countScheduled(statWords, records) }),
    [statWords, records],
  )
  // 难度分档只收窄学习抽词池；复习队列仍取全库（选档不影响已加入待复习的词）
  const learnPool = useMemo(() => bandFilter(baseList, band), [baseList, band])
  // 词素 id → type 映射：词族键优先取词根（r.*），与词云的「词根为干、单词为叶」口径一致
  const morphTypes = useMemo(() => {
    const map = new Map()
    ;(morphemes || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m.type)
    })
    return map
  }, [morphemes])
  const familyKeyOf = useCallback(
    (w) => defaultFamilyKeyOf(w, (id) => morphTypes.get(id)),
    [morphTypes],
  )
  const learnQueue = useMemo(
    () => buildLearnQueue(learnPool, records, roundSize, { groupByFamily, familyKeyOf }),
    [learnPool, records, roundSize, groupByFamily, familyKeyOf],
  )
  // 复习队列：只排已到期词（nextDueAt 为空 / 已过期；未到期不排，答错 +1 天）
  const reviewQueue = useMemo(
    () => buildReviewQueue(statWords, records, roundSize, new Date().toISOString()),
    [statWords, records, roundSize],
  )
  const recordOf = useCallback((wordId) => getRecord(records, wordId), [records])

  return {
    records,
    recordOf,
    scope: scopeRef.current,
    statWords,
    stats,
    learnQueue,
    reviewQueue,
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

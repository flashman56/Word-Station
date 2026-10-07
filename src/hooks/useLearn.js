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
 * @param {Array} words 全量单词
 * @param {object} [opts]
 * @param {string} [opts.scope] 当前分区（scopeOf(ownerId) 的结果；默认 'guest'）
 * @param {Array}  [opts.privateWords] 私有词视图对象（默认 []）—— 只进统计与复习队列，不进新学队列
 * @param {number} [opts.roundSize] 每轮词数
 * @param {'all'|{id,lo,hi}} [opts.band] 难度分档（只收窄学习抽词池）
 * @param {boolean} [opts.groupByFamily] 需求1：新学队列按词族成组出题（默认开）
 * @param {Array} [opts.morphemes] 词素数组（用于识别词根 → 词族键）
 * @param {(keys: string[]) => void} [opts.onDirty] 写操作回调（云端同步据此标记 dirty，纯函数层不受影响）
 * @param {boolean} [opts.stampUpdatedAt] 是否给写出的记录打 updatedAt（默认 true）
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
    stampUpdatedAt = true,
  } = {},
) {
  const list = words || []

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

  /** 显式落盘（隐私模式写入失败忽略，内存态仍可用） */
  const persist = useCallback((next, sc) => {
    const target = sc || scopeRef.current
    try {
      writeLearn(next, target)
    } catch {
      /* ignore */
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
   */
  const applyMany = useCallback(
    (ids, kind) => {
      if (!ids || !ids.length) return
      const now = new Date().toISOString()
      const next = { ...recordsRef.current }
      ids.forEach((id) => {
        const cur = getRecord(next, id)
        let rec
        if (kind === 'known') rec = markKnownPure(cur, now)
        else if (kind === 'review') rec = setReviewPure(cur, now)
        else rec = resetRecord(now)
        // 同上：默认补 updatedAt，供冲突合并使用
        next[id] = stampRef.current ? { ...rec, updatedAt: now } : rec
      })
      recordsRef.current = next
      setRecords(next)
      persist(next, scopeRef.current)
      if (onDirtyRef.current) onDirtyRef.current(ids)
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

  /** 导出 v2 结构，供用户另存 */
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
  const privateList = privateWords || []
  const statWords = useMemo(
    () => (privateList.length ? [...list, ...privateList] : list),
    [list, privateList],
  )

  const stats = useMemo(() => countByStatus(statWords, records), [statWords, records])
  // 难度分档只收窄学习抽词池；复习队列仍取全库（选档不影响已加入待复习的词）
  const learnPool = useMemo(() => bandFilter(list, band), [list, band])
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

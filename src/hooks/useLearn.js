/**
 * 学习记录的唯一对外入口：状态 + 持久化 + 派生（统计 / 队列）
 * ------------------------------------------------------------------
 * - 存储：localStorage `wrc.learn.v2`（key 约定见 lib/migrate.js）
 * - 首次挂载跑一次迁移（幂等），之后所有写操作同步落盘
 * - 所有状态变更都走 lib/learning.js 的纯函数，这里只负责「取 → 算 → 存」
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
import { KEYS, clearMigration, readLearn, readSettingsV2, runMigration, writeLearn } from '../lib/migrate.js'

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
 * @param {Array} words 全量单词
 * @param {object} [opts]
 * @param {number} [opts.roundSize] 每轮词数
 * @param {'all'|{id,lo,hi}} [opts.band] 难度分档（只收窄学习抽词池）
 * @param {boolean} [opts.groupByFamily] 需求1：新学队列按词族成组出题（默认开）
 * @param {Array} [opts.morphemes] 词素数组（用于识别词根 → 词族键）
 * @param {(keys: string[]) => void} [opts.onDirty] 写操作回调（云端同步据此标记 dirty，纯函数层不受影响）
 */
export function useLearn(
  words,
  {
    roundSize = DEFAULT_ROUND_SIZE,
    band = 'all',
    groupByFamily = true,
    morphemes = null,
    onDirty = null,
    stampUpdatedAt = false,
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
   * 只在启用云同步时打：纯本地模式下不打，避免老用户的 localStorage 体积无谓膨胀。
   */
  const stampRef = useRef(Boolean(stampUpdatedAt))
  useEffect(() => {
    stampRef.current = Boolean(stampUpdatedAt)
  }, [stampUpdatedAt])

  // 首次渲染就跑迁移（幂等），保证第一帧统计就是迁移后的口径
  const [records, setRecords] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      runMigration({ words: list, inheritFreqKnown: readSettingsV2().inheritFreqKnown !== false })
    }
    return readLearn()
  })

  const [migration, setMigration] = useState(() => {
    try {
      const raw = localStorage.getItem(KEYS.migration)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [inheritFreqKnown, setInheritFreqKnown] = useState(
    () => readSettingsV2().inheritFreqKnown !== false,
  )

  // ref 与 state 同步：写操作需要"立刻算出结果返回给调用方"，不能等下一次 render
  const recordsRef = useRef(records)
  useEffect(() => {
    recordsRef.current = records
  }, [records])

  // 所有写操作同步落 localStorage（隐私模式写入失败忽略，内存态仍可用）
  useEffect(() => {
    try {
      writeLearn(records)
    } catch {
      /* ignore */
    }
  }, [records])

  const commit = useCallback((wordId, nextRecord) => {
    // updatedAt 是云端冲突合并（按 updated_at 记录级 LWW）的依据，本地写必须打时间戳。
    // learning.js 是纯函数、不关心存储，所以时间戳在这里补，纯函数层零改动。
    const stamped = stampRef.current
      ? { ...nextRecord, updatedAt: new Date().toISOString() }
      : nextRecord
    const next = { ...recordsRef.current, [wordId]: stamped }
    recordsRef.current = next
    setRecords(next)
    // 云端同步：标记该 word_key 为 dirty（离线可用，写路径本身不变）
    if (onDirtyRef.current) onDirtyRef.current([wordId])
  }, [])

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
  const applyMany = useCallback((ids, kind) => {
    if (!ids || !ids.length) return
    const now = new Date().toISOString()
    const next = { ...recordsRef.current }
    ids.forEach((id) => {
      const cur = getRecord(next, id)
      let rec
      if (kind === 'known') rec = markKnownPure(cur, now)
      else if (kind === 'review') rec = setReviewPure(cur, now)
      else rec = resetRecord(now)
      // 同上：启用云同步时补 updatedAt，供冲突合并使用
      next[id] = stampRef.current ? { ...rec, updatedAt: now } : rec
    })
    recordsRef.current = next
    setRecords(next)
    if (onDirtyRef.current) onDirtyRef.current(ids)
  }, [])

  /**
   * 整体替换记录（云端下行合并后用）。
   * 只做「内存 + 落盘」，不触碰 learning.js 的纯函数规则。
   * @param {Record<string, object>} next
   */
  const replaceAll = useCallback((next) => {
    const clean = next && typeof next === 'object' ? next : {}
    recordsRef.current = clean
    setRecords(clean)
  }, [])

  const clearAll = useCallback(() => {
    recordsRef.current = {}
    setRecords({})
  }, [])

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
    return { ok: true, count: Object.keys(incoming).length }
  }, [])

  /**
   * 重跑迁移（设置里切换「高频继承」后用）。会覆盖当前 v2 记录，调用方需二次确认。
   * 备份 key 永不被清，旧数据随时可找回。
   */
  const rerunMigration = useCallback(
    (nextInherit = true) => {
      clearMigration()
      setInheritFreqKnown(nextInherit)
      const res = runMigration({ words: list, inheritFreqKnown: nextInherit })
      if (res.ok) {
        const now = new Date().toISOString()
        setMigration({ done: true, at: now, report: res.report || null })
        recordsRef.current = readLearn()
        setRecords(recordsRef.current)
      }
      return res
    },
    [list],
  )

  const stats = useMemo(() => countByStatus(list, records), [list, records])
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
    () => buildReviewQueue(list, records, roundSize, new Date().toISOString()),
    [list, records, roundSize],
  )
  const recordOf = useCallback((wordId) => getRecord(records, wordId), [records])

  return {
    records,
    recordOf,
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

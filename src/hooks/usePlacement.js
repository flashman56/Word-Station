/**
 * usePlacement.js —— 起点测评的「出题 / 作答 / 评分 / 落盘」编排（React 层）
 * ------------------------------------------------------------------
 * 本文件**只做编排**：状态归 React、算分一律委托 lib/placement.js（纯函数、可单测）、
 * 读写一律委托 lib/placementStore.js（键名只存在于 lib/migrate.js）。
 *
 * ★ 为什么出题结果要存下来，而不是每次重算 ★
 *   题目是**确定性抽样**（placement.js 内按 freqRank 等距取），但它依赖当时的词库。
 *   词库一旦更新（加词 / 删词 / 改词频），重算出来的题就不是用户刚答过的那一份，
 *   于是「他答的哪 40 个词」与「现在算的是哪 40 个词」对不上，历史作答凭空作废。
 *   所以：出题时把 items 一起存，写盘的是**当时那份题**。
 *
 * ★ 为什么这里一次 learn.records 都不碰 ★
 *   见 lib/placement.js 头部：写进去会被 vocab.js 读成「实测已知」，
 *   「全答认识」就变成 64,700 词。这是本特性最容易踩、也最不可逆的坑。
 */
import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  PLACEMENT_SAMPLE_SIZE,
  scorePlacement,
  pickNextPlacementWord,
  placementShouldStop,
} from '../lib/placement.js'
import { clearPlacement, readPlacement, writePlacement } from '../lib/placementStore.js'

/**
 * @param {Array} words 全量单词（尚未加载时传 null）
 * @param {Array} bands buildBands(maxRank) 的输出
 * @param {string} scope  当前账号分区（scopeOf(ownerId) 的结果）
 * @returns {object} 见文件末尾的返回值说明
 */
export function usePlacement(words, bands, scope) {
  const [session, setSession] = useState(null)
  /** 出题失败的**可读原因**；空串 = 无。用于把「正在出题…」的永久卡死换成一句可行动的提示。 */
  const [startError, setStartError] = useState('')
  // ★ tick：落盘 / 清盘后强制重读 storage。stored 只依赖 scope，不 bump 的话，
  //   交卷后 session 被清空、但 storage 已写入，memo 因 scope 未变仍读到旧(null)值，
  //   于是 result 瞬间变 null → 结果表单闪没、又退回入口态。这是线上的老 bug。
  const [tick, setTick] = useState(0)
  const stored = useMemo(() => readPlacement(scope), [scope, tick])

  /** 正在进行的这一份（题 + 已答）；null = 没在测 */
  const probe = session || stored || null
  const answers = session ? session.answers : (stored ? stored.answers : null)

  /**
   * 评分：只读词库 + 只读题目，**不写任何学习记录**。
   * words 未加载完时返回空结果（组件据此显示「加载中」，而不是给一个 0）。
   */
  const result = useMemo(() => {
    // ★ 没有 probe（没测过 / 交卷后 storage 尚未就绪）就返回 null，而不是 emptyPlacement()。
    //   emptyPlacement() 是个 truthy 对象，会让组件入口态的 `!result` 判据失效 ——
    //   首访时用户看到的不是「从哪一档开始背」入口，而是「这次的作答太薄」结果卡。
    // ★ 题目在 `probe.probe.items`（session / stored 两层都按 { probe:{items}, answers } 落）
    //   不是 `probe.items` —— 这里曾写错，导致作答态 items 恒为空、永远卡在「暂时出不了题」。
    const probeItems = probe && probe.probe && Array.isArray(probe.probe.items) ? probe.probe.items : []
    if (probeItems.length === 0) return null
    if (!Array.isArray(words) || words.length === 0) return null
    return scorePlacement({ items: probeItems, answers, words, bands })
  }, [probe, answers, words, bands])

  // ★ 题目在 `probe.probe.items`：session={probe:p,answers} 与 stored={probe:{items},answers}
  //   两层都把 p 包在 `probe` 下，所以读 items 必须走 `probe.probe.items`（见上方 result 注释）。
  const items = probe && probe.probe && Array.isArray(probe.probe.items) ? probe.probe.items : []
  const answeredCount = items.length
  /** 当前正在问的那一题（尚未落定为已答）；null = 没有题在问 */
  const current = session ? session.current : null
  /** 已选但「待二次确认」的作答 { value }；null = 还没选或已确认 */
  const pending = session ? session.pending : null
  /** 是否已自适应收敛结束（题数够 / 置信度够 / 没题可出 / 饱和） */
  const finished = session ? session.finished : false
  /** 正在作答（区别于「已测过」的结果态）：有 session 且未结束 */
  const running = Boolean(session) && !finished

  /** 是否具备开测条件：词库已加载 + 词频分档已就绪（>1 档，排除 maxRank=0 的「全部」单档）。 */
  const canStart = Boolean(
    Array.isArray(words) && words.length > 0 &&
    Array.isArray(bands) && bands.length > 1,
  )

  /** 开测：自适应出第一题（落 {probe:{items:[]}}，current 指向首题；半份作答不落盘） */
  const start = useCallback(() => {
    if (!Array.isArray(words) || words.length === 0) return
    const first = pickNextPlacementWord(words, bands, [], {})
    // ★ 出不来题时**不许静默 return**：那会让界面永远停在「正在出题…」。
    //   首题都抽不到（词库/分档未就绪）才走到这，给出可读原因而不是吞掉。
    if (!first) {
      setStartError('暂时出不了题（词频分档还没就绪），请稍后再试或直接用默认档开始。')
      return
    }
    setStartError('')
    setSession({
      probe: { items: [], bandIndexes: [], size: 0 },
      answers: {},
      pending: null,
      current: first,
      finished: false,
    })
  }, [words, bands])

  /** 记一次作答：先进入「待确认」态（pending），不立即入 items，等 confirm 才落定。
   *  ★ 这是与背单词同款的「二次确认」前置：选了不急着算数，先看释义/例句核对再确认。 */
  const answer = useCallback((wordId, value) => {
    setSession((prev) => {
      if (!prev || prev.finished || !prev.current) return prev
      if (prev.current.id !== wordId) return prev
      return { ...prev, pending: { value } }
    })
  }, [])

  /** 二次确认：把 pending 落定为已答，并据此选下一题或结束（自适应收敛）。 */
  const confirm = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.finished || !prev.current || !prev.pending) return prev
      const item = {
        id: prev.current.id,
        form: prev.current.form,
        freqRank: prev.current.freqRank,
        bandIndex: prev.current.bandIndex,
      }
      const newItems = prev.probe.items.concat(item)
      const newAnswers = { ...prev.answers, [item.id]: prev.pending.value }
      const newProbe = {
        items: newItems,
        bandIndexes: Array.from(new Set(newItems.map((it) => it.bandIndex))).sort((a, b) => a - b),
        size: newItems.length,
      }
      // ★ 复用 scorePlacement 判停：题数够 + 置信区间够窄 + sufficient 即停；饱和也给不出边界 → 停。
      const res = scorePlacement({ items: newItems, answers: newAnswers, words, bands })
      const stop = placementShouldStop(newItems, res) || res.reason === 'saturated'
      if (stop) {
        return { ...prev, probe: newProbe, answers: newAnswers, pending: null, current: null, finished: true }
      }
      const next = pickNextPlacementWord(words, bands, newItems, newAnswers)
      if (!next) {
        return { ...prev, probe: newProbe, answers: newAnswers, pending: null, current: null, finished: true }
      }
      return { ...prev, probe: newProbe, answers: newAnswers, pending: null, current: next, finished: false }
    })
  }, [words, bands])

  /** 撤销上一作答选择：回到作答态重选（二次确认的反悔入口） */
  const undo = useCallback(() => {
    setSession((prev) => {
      if (!prev || !prev.pending) return prev
      return { ...prev, pending: null }
    })
  }, [])

  /** 放弃本次作答，回到入口（或历史结果） */
  const cancel = useCallback(() => setSession(null), [])

  /** 重测：清掉本 scope 历史结果，重新自适应出题 */
  const retake = useCallback(() => {
    clearPlacement(scope)
    setTick((t) => t + 1) // ★ 清盘后也让 stored 重读（读到 null）
    setSession(null)
    if (!Array.isArray(words) || words.length === 0) return
    const first = pickNextPlacementWord(words, bands, [], {})
    if (first) {
      setSession({
        probe: { items: [], bandIndexes: [], size: 0 },
        answers: {},
        pending: null,
        current: first,
        finished: false,
      })
    }
  }, [scope, words, bands])

  // ★ 自适应收敛结束时把题目 + 作答落盘（与旧 submit 同款存储路径；半份作答不落盘）。
  //   落盘后 tick bump → stored 重读，结果态稳定不闪没。
  useEffect(() => {
    if (session && session.finished && Array.isArray(session.probe.items) && session.probe.items.length > 0) {
      writePlacement(session.probe, session.answers, scope)
      setTick((t) => t + 1)
    }
  }, [session, scope])

  return {
    /** 已答数量（自适应：题量不固定，入口态文案用不到固定 40） */
    size: items.length,
    /** 出题失败原因（空串 = 无）；供 UI 显示而不是无限「正在出题…」 */
    startError,
    /** 已答题目（存的是当时那一份） */
    items,
    /** 当前在问的那一题（含 form/gloss/example，供确认态展示） */
    current,
    /** 待二次确认的取值（'known'|'unknown'|'unsure'|null） */
    pendingValue: pending ? pending.value : null,
    /** 已作答数 */
    answeredCount,
    /** 作答表 { wordId: 'known'|'unknown'|'unsure' } */
    answers,
    /** 是否正在作答（区别于「已测过」的结果态） */
    running,
    /** 是否已自适应收敛结束（→ 结果态） */
    finished,
    /** 是否具备开测条件（词库 + 分档就绪）；入口态按钮据此 disable */
    canStart,
    /** 评分结果；没有 probe 或 words 未加载完时为 null（入口态据此显示） */
    result,
    /** 是否已有可展示的历史结果（已收敛且已算分） */
    hasResult: Boolean(result && (result.sampleSize > 0 || result.itemCount > 0)),
    /** 推荐起点档（无法定位时为 null，由调用方回落默认档） */
    recommendedBand: result ? result.band : null,
    start,
    answer,
    confirm,
    undo,
    retake,
    cancel,
  }
}

export { PLACEMENT_SAMPLE_SIZE }

export default usePlacement
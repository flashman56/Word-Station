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
import { useCallback, useMemo, useState } from 'react'
import {
  PLACEMENT_SAMPLE_SIZE,
  buildPlacementProbe,
  scorePlacement,
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
  const answeredCount = answers ? Object.keys(answers).length : 0
  const done = answeredCount >= items.length && items.length > 0

  /** 是否具备开测条件：词库已加载 + 词频分档已就绪（>1 档，排除 maxRank=0 的「全部」单档）。 */
  const canStart = Boolean(
    Array.isArray(words) && words.length > 0 &&
    Array.isArray(bands) && bands.length > 1,
  )

  /** 开测：出题并进入作答态（不落盘 —— 半份作答不该留下持久痕迹） */
  const start = useCallback(() => {
    if (!Array.isArray(words) || words.length === 0) return
    const p = buildPlacementProbe(words, bands)
    // ★ 出不来题时**不许静默 return**：那会让界面永远停在「正在出题…」。
    //   最常见成因是 bands 只剩一档（maxRank 尚未算出时 buildBands(0) = ["全部"]），
    //   此时 probeBands 为空 ⇒ items 长度 0。宁可给出可读的原因也不要吞掉。
    if (!p || !Array.isArray(p.items) || p.items.length === 0) {
      setStartError('暂时出不了题（词频分档还没就绪），请稍后再试或直接用默认档开始。')
      return
    }
    setStartError('')
    setSession({ probe: p, answers: {} })
  }, [words, bands])

  /** 记一次作答 */
  const answer = useCallback((wordId, value) => {
    setSession((prev) => {
      if (!prev) return prev
      return { ...prev, answers: { ...prev.answers, [wordId]: value } }
    })
  }, [])

  /** 交卷：把题目与作答一起落盘（此后每次渲染都用这份题算分） */
  const submit = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev
      writePlacement(prev.probe, prev.answers, scope)
      setTick((t) => t + 1) // ★ 触发 stored 重读，否则交卷后 result 闪没
      return null
    })
  }, [scope])

  /** 重测：清掉当前 scope 的历史结果，重新出题 */
  const retake = useCallback(() => {
    clearPlacement(scope)
    setTick((t) => t + 1) // ★ 清盘后也让 stored 重读（读到 null）
    setSession(null)
    if (!Array.isArray(words) || words.length === 0) return
    const p = buildPlacementProbe(words, bands)
    if (p.items.length > 0) setSession({ probe: p, answers: {} })
  }, [scope, words, bands])

  /** 放弃本次作答，回到上次的结果（或「没测过」） */
  const cancel = useCallback(() => setSession(null), [])

  return {
    /** 出题总数（未出题时为 0） */
    size: items.length,
    /** 出题失败原因（空串 = 无）；供 UI 显示而不是无限「正在出题…」 */
    startError,
    /** 题目（存的是当时那一份） */
    items,
    /** 已作答数 */
    answeredCount,
    /** 作答表 { wordId: 'known'|'unknown'|'unsure' } */
    answers,
    /** 是否正在作答（区别于「已测过」） */
    running: Boolean(session),
    /** 已答满 */
    done,
    /** 是否具备开测条件（词库 + 分档就绪）；入口态按钮据此 disable */
    canStart,
    /** 评分结果；没有 probe 或 words 未加载完时为 null（入口态据此显示） */
    result,
    /** 是否已有可展示的历史结果（已交卷且已算分） */
    hasResult: Boolean(result && (result.sampleSize > 0 || result.itemCount > 0)),
    /** 推荐起点档（无法定位时为 null，由调用方回落默认档） */
    recommendedBand: result ? result.band : null,
    start,
    answer,
    submit,
    retake,
    cancel,
  }
}

export { PLACEMENT_SAMPLE_SIZE }

export default usePlacement
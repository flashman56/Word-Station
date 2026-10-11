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
  emptyPlacement,
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
  const stored = useMemo(() => readPlacement(scope), [scope])
  const [session, setSession] = useState(null)

  /** 正在进行的这一份（题 + 已答）；null = 没在测 */
  const probe = session || stored || null
  const answers = session ? session.answers : (stored ? stored.answers : null)

  /**
   * 评分：只读词库 + 只读题目，**不写任何学习记录**。
   * words 未加载完时返回空结果（组件据此显示「加载中」，而不是给一个 0）。
   */
  const result = useMemo(() => {
    if (!probe || !Array.isArray(probe.items) || probe.items.length === 0) return emptyPlacement()
    if (!Array.isArray(words) || words.length === 0) return null
    return scorePlacement({ items: probe.items, answers, words, bands })
  }, [probe, answers, words, bands])

  const items = probe && Array.isArray(probe.items) ? probe.items : []
  const answeredCount = answers ? Object.keys(answers).length : 0
  const done = answeredCount >= items.length && items.length > 0

  /** 开测：出题并进入作答态（不落盘 —— 半份作答不该留下持久痕迹） */
  const start = useCallback(() => {
    if (!Array.isArray(words) || words.length === 0) return
    const p = buildPlacementProbe(words, bands)
    if (p.items.length === 0) return
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
      return null
    })
  }, [scope])

  /** 重测：清掉当前 scope 的历史结果，重新出题 */
  const retake = useCallback(() => {
    clearPlacement(scope)
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
    /** 评分结果；words 未加载完时为 null */
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
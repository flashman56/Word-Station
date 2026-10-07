/**
 * 当前账号的全部私有词 → 学习侧视图对象（离线可用）
 * ------------------------------------------------------------------
 * 私有词不在公共词库里，而 `useLearn(words)` 的 words 恰恰是公共库 —— 于是私有词
 * 在统计、复习队列、词汇量预测三处同时隐形。这个钩子补上这一段：
 *
 *   App → useUserWords(auth.userId) → privateWords → useLearnCloud → useLearn
 *
 * ★ 离线兜底（B-3）★
 *   首帧用 localStorage 缓存渲染，随后异步刷新。断网时学习页的私有词统计
 *   不消失 —— 否则一断网就表现为「我背的词全没了」，比不显示更糟。
 *
 * 缓存按账号分区（键约定见 lib/migrate.js）：A 的私有词绝不能出现在 B 的界面。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import * as userWordsApi from '../lib/cloud/userWords.js'
import { keysFor, scopeOf } from '../lib/migrate.js'
import { toUserWordView } from '../lib/wordView.js'


/** 读当前分区的私有词缓存（断网时首帧用） */
function readCache(scope) {
  try {
    const raw = localStorage.getItem(keysFor(scope).userWordsCache)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** 写缓存（隐私模式写失败忽略） */
function writeCache(scope, words) {
  try {
    localStorage.setItem(keysFor(scope).userWordsCache, JSON.stringify(words))
  } catch {
    /* ignore */
  }
}

/**
 * @param {string|null} ownerId 当前账号；null（游客）→ 恒为空数组
 * @returns {{
 *   words: object[], loading: boolean, error: object|null, refresh: () => Promise<void>
 * }}
 */
export function useUserWords(ownerId) {
  const scope = scopeOf(ownerId)
  // 首帧直接读缓存 —— 断网刷新页面时统计仍在
  const [words, setWords] = useState(() => (ownerId ? readCache(scope) : []))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 当前 scope 的 ref。
   * 异步回来后必须比对它：账号可能在 await 期间变了，此时把结果写进新分区
   * 就等于「把 A 的私有词写进 B 的缓存」—— 和学习记录跨区是同一类事故。
   */
  const scopeRef = useRef(scope)
  scopeRef.current = scope

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setWords([])
      setError(null)
      setLoading(false)
      return
    }
    const myScope = scopeRef.current
    setLoading(true)
    const { data, error: err } = await userWordsApi.listMine(ownerId)
    // 账号在 await 期间变了 → 丢弃结果，不 setState、不写缓存
    if (scopeRef.current !== myScope) return
    setLoading(false)
    if (err) {
      // 失败时**保留缓存内容**（不清空）—— 断网不该让统计归零
      setError(err)
      return
    }
    setError(null)
    const next = (data || []).map((row) => toUserWordView(row, null))
    setWords(next)
    writeCache(myScope, next)
  }, [ownerId])

  // 换号时先切到新分区的缓存，避免短暂显示上一个账号的私有词
  useEffect(() => {
    setWords(ownerId ? readCache(scope) : [])
    setError(null)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, ownerId])

  return { words, loading, error, refresh }
}

export default useUserWords

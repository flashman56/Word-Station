/**
 * 当前小站词条 → 统一 Word 视图对象
 * ------------------------------------------------------------------
 * 小站里只有 word_key 引用（'w.<slug>' 公共引用 / 'u.<form_key>' 私有词），
 * 本钩子负责：
 *   1) 取小站引用行；
 *   2) 公共引用 → dict.loadWords() 从分片加载完整词条（公共库只读，只引用不复制）；
 *   3) 私有引用 → cloud/userWords.listByKeys() 取用户词条；
 *   4) 合并成统一视图对象（都带 wordKey / source / note / 笔记）。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as stationWordsApi from '../lib/cloud/stationWords.js'
import * as userWordsApi from '../lib/cloud/userWords.js'
import { loadWords } from '../lib/dict.js'
import { isUserKey } from '../lib/wordKey.js'

/**
 * @param {string|null} stationId
 * @param {string|null} ownerId
 * @returns {{
 *   words: object[], refs: object[], loading: boolean, error: object|null,
 *   refresh: () => Promise<void>,
 *   removeWord: (wordKey: string) => Promise<boolean>,
 *   updateNote: (wordKey: string, note: string|null) => Promise<boolean>,
 *   counts: { total: number, public: number, user: number }
 * }}
 */
export function useStationWords(stationId, ownerId) {
  const [refs, setRefs] = useState([])
  const [publicWords, setPublicWords] = useState([])
  const [userWords, setUserWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!stationId || !ownerId) {
      setRefs([])
      setPublicWords([])
      setUserWords([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await stationWordsApi.listByStation(stationId)
    if (err) {
      setError(err)
      setLoading(false)
      return
    }
    setError(null)
    setRefs(data || [])

    const pubKeys = (data || []).filter((r) => !isUserKey(r.wordKey)).map((r) => r.wordKey)
    const userKeys = (data || []).filter((r) => isUserKey(r.wordKey)).map((r) => r.wordKey)

    const [pubRes, userRes] = await Promise.all([
      pubKeys.length ? loadWords(pubKeys).catch(() => []) : Promise.resolve([]),
      userKeys.length ? userWordsApi.listByKeys(ownerId, userKeys).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ])
    setPublicWords(pubRes || [])
    setUserWords(userRes?.data || [])
    setLoading(false)
  }, [stationId, ownerId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const words = useMemo(() => {
    const noteByKey = new Map((refs || []).map((r) => [r.wordKey, r.note]))
    const pub = (publicWords || []).map((w) => ({
      ...w,
      wordKey: w.id,
      source: 'public',
      note: noteByKey.get(w.id) ?? null,
      phoneticStatus: w.phoneticBr ? 'ok' : 'pending',
    }))
    const own = (userWords || []).map((w) => ({
      // 统一成与公共词相同的字段口径，供 StudyCard / 列表复用
      id: w.wordKey,
      wordKey: w.wordKey,
      form: w.form,
      pos: w.pos,
      gloss: w.gloss,
      morphs: w.morphs || [],
      chain: w.chain || [],
      cefr: w.cefr,
      freqRank: w.freqRank,
      phoneticBr: w.phoneticBr,
      phoneticStatus: w.phoneticStatus || 'pending',
      example: w.example,
      usage: w.usage,
      morphless: (w.morphs || []).length === 0 || (w.morphs || [])[0] === 'x.unk',
      kind: 'user',
      source: 'user',
      note: noteByKey.get(w.wordKey) ?? null,
      userWordId: w.id,
      editedByUser: w.editedByUser,
      generationStatus: w.generationStatus,
    }))
    // 按加入时间倒序（refs 的顺序）
    const byKey = new Map()
    pub.forEach((w) => byKey.set(w.wordKey, w))
    own.forEach((w) => byKey.set(w.wordKey, w))
    const ordered = []
    ;(refs || []).forEach((r) => {
      const w = byKey.get(r.wordKey)
      if (w) ordered.push(w)
    })
    return ordered
  }, [refs, publicWords, userWords])

  const removeWord = useCallback(
    async (wordKey) => {
      if (!stationId) return false
      const { error: err } = await stationWordsApi.remove(stationId, wordKey)
      if (err) {
        setError(err)
        return false
      }
      await refresh()
      return true
    },
    [stationId, refresh],
  )

  const updateNote = useCallback(
    async (wordKey, note) => {
      if (!stationId) return false
      const { error: err } = await stationWordsApi.updateNote(stationId, wordKey, note)
      if (err) {
        setError(err)
        return false
      }
      await refresh()
      return true
    },
    [stationId, refresh],
  )

  const counts = useMemo(
    () => ({
      total: words.length,
      public: words.filter((w) => w.source === 'public').length,
      user: words.filter((w) => w.source === 'user').length,
    }),
    [words],
  )

  return { words, refs, loading, error, refresh, removeWord, updateNote, counts }
}

export default useStationWords

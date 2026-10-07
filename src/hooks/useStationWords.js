/**
 * 当前小站词条 → 统一 Word 视图对象
 * ------------------------------------------------------------------
 * 小站里只有 word_key 引用（'w.<slug>' 公共引用 / 'u.<form_key>' 私有词），
 * 本钩子负责：
 *   1) 取小站引用行（**先读本地缓存**，断网 + F5 时首帧就有内容）；
 *   2) 公共引用 → dict.loadWords() 从分片加载完整词条（公共库只读，只引用不复制）；
 *   3) 私有引用 → cloud/userWords.listByKeys() 取用户词条（在线时）；
 *   4) 合并成统一视图对象（都带 wordKey / source / note / 笔记）。
 *
 * ★ 离线优先（A-05 / A-06）★
 *   - refs 走 stationWordsCache：refresh() 成功才写，断网 + F5 首帧可读；
 *   - 离线草稿投影 pending：离线提交的词立刻出现在列表里（标「待上传」），
 *     否则用户提交完看到列表没变，会以为没加上；
 *   - ★ 反查来源（M3）★：`w.*` 走 dict.loadWords（IndexedDB，离线可用）；
 *     `u.*` **绝不走** userWordsApi.listByKeys（那是纯网络，离线必然失败），
 *     而是从 App 注入的私有词本地缓存（useUserWords 已全量缓存）反查
 *     —— 零新增请求。
 *
 * ★ 草稿必须走 readDrafts(scope)（A-06 红线）★
 *   离线草稿按账号分区，且由 offline.js 的 claim() 认领。自行解析键去读
 *   drafts 会绕过分区隔离 —— A 的草稿会出现在 B 的界面上。键只经 offlineApi。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as stationWordsApi from '../lib/cloud/stationWords.js'
import * as userWordsApi from '../lib/cloud/userWords.js'
import * as offlineApi from '../lib/cloud/offline.js'
import { loadWords } from '../lib/dict.js'
import { isUserKey, parseWordKey } from '../lib/wordKey.js'
import { toUserWordView } from '../lib/wordView.js'
import { readStationRefs, scopeOf, writeStationRefs } from '../lib/migrate.js'

/**
 * @param {string|null} stationId
 * @param {string|null} ownerId
 * @param {object} [opts]
 * @param {Array} [opts.privateWords] 私有词的本地缓存（useUserWords().words）——
 *   **离线反查的唯一来源**，见文件头 M3。缺省时私有词投影退化为「显示 wordKey 原文」。
 * @returns {{
 *   words: object[], refs: object[], loading: boolean, error: object|null,
 *   refresh: () => Promise<void>,
 *   removeWord: (wordKey: string) => Promise<boolean>,
 *   updateNote: (wordKey: string, note: string|null) => Promise<boolean>,
 *   counts: { total: number, public: number, user: number },
 *   pending: object[], pendingCount: number
 * }}
 */
export function useStationWords(stationId, ownerId, opts = {}) {
  const scope = scopeOf(ownerId)
  const privateWords = opts.privateWords || EMPTY_PRIVATE_WORDS

  /** ★ 首帧直接读缓存 ★ 断网 + F5 时站词条不消失（红线 6） */
  const [refs, setRefs] = useState(() => (ownerId && stationId ? readStationRefs(stationId, scope).refs : []))
  const [publicWords, setPublicWords] = useState([])
  const [userWords, setUserWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  /** 离线草稿投影（草稿里已入队、但还没上云的那批词） */
  const [pendingItems, setPendingItems] = useState(() => readPendingKeys(stationId, scope))

  /**
   * scope / stationId 的 ref：异步回来后必须比对，否则账号在 await 期间变了，
   * 就把 A 的结果写进了 B 的界面（与 useUserWords 的同一类事故）。
   */
  const ctxRef = useRef({ scope, stationId })
  ctxRef.current = { scope, stationId }

  const refresh = useCallback(async () => {
    if (!stationId || !ownerId) {
      setRefs([])
      setPublicWords([])
      setUserWords([])
      setLoading(false)
      return
    }
    setLoading(true)
    const myScope = scope
    const { data, error: err } = await stationWordsApi.listByStation(stationId)
    // 账号 / 小站在 await 期间变了 → 丢弃结果，不 setState、不写缓存
    const ctx = ctxRef.current
    if (ctx.stationId !== stationId || ctx.scope !== myScope) return
    if (err) {
      // ★ 失败时保留 refs（缓存或本次会话已有的内容）——
      //   「断网就清空列表」正是 A-05 要修的症状。
      setError(err)
      setLoading(false)
      return
    }
    setError(null)
    const list = data || []
    setRefs(list)
    // ★ 只在成功时写缓存（失败时保留旧缓存，那才是断网时唯一的希望）
    writeStationRefs(stationId, list, myScope)

    const pubKeys = list.filter((r) => !isUserKey(r.wordKey)).map((r) => r.wordKey)
    const userKeys = list.filter((r) => isUserKey(r.wordKey)).map((r) => r.wordKey)

    const [pubRes, userRes] = await Promise.all([
      pubKeys.length ? loadWords(pubKeys).catch(() => []) : Promise.resolve([]),
      userKeys.length ? userWordsApi.listByKeys(ownerId, userKeys).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ])
    setPublicWords(pubRes || [])
    setUserWords(userRes?.data || [])
    setLoading(false)
  }, [stationId, ownerId, scope])

  useEffect(() => {
    refresh()
  }, [refresh])

  // ---------------------------------------------------------------- 离线草稿投影

  /** 重算投影（入队 / 补传完成时由 onPendingChange 触发，**不轮询**） */
  const recomputePending = useCallback(() => {
    const ctx = ctxRef.current
    setPendingItems(readPendingKeys(ctx.stationId, ctx.scope))
  }, [])

  useEffect(() => {
    if (!stationId || !ownerId) {
      setPendingItems([])
      return undefined
    }
    // stationId / scope 变化时立即重算
    setPendingItems(readPendingKeys(stationId, scope))
    return offlineApi.onPendingChange(recomputePending)
  }, [stationId, ownerId, scope, recomputePending])

  // ---------------------------------------------------------------- 合并视图

  const words = useMemo(() => {
    const noteByKey = new Map((refs || []).map((r) => [r.wordKey, r.note]))
    const pub = (publicWords || []).map((w) => ({
      ...w,
      wordKey: w.id,
      source: 'public',
      note: noteByKey.get(w.id) ?? null,
      phoneticStatus: w.phoneticBr ? 'ok' : 'pending',
    }))
    // 私有词统一走 lib/wordView.js 的 toUserWordView ——
    // 与 useUserWords 共用同一个构造点，杜绝两处内联映射漂移
    // （曾经的风险：一处加了字段另一处没加 →「小站里正常、学习页统计里凭空消失」）
    const own = (userWords || []).map((w) => toUserWordView(w, noteByKey.get(w.wordKey) ?? null))
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

  /**
   * 草稿投影行：把 { wordKey, source } 反查成可渲染的视图对象。
   *
   * ★ 为什么这层反查必须有（M3，A-06 的核心）★
   *   草稿 items **只有 wordKey 与 source**，没有 form / pos / gloss。渲染一行
   *   需要这些字段，而取数路径有严格分工：
   *     - `w.*` → dict.loadWords（IndexedDB 三级缓存，离线可用）
   *     - `u.*` → **本地私有词缓存**，绝不走 userWordsApi.listByKeys
   *       （那是纯网络请求，离线必然失败 —— 而离线正是需要投影的时刻）
   *   反查不到词条时（极端：私有词缓存被清）渲染 wordKey 原文 + 「待上传」，
   *   **不留空白行** —— 留空白会让用户以为词丢了。
   */
  const pending = useMemo(
    () => buildPendingRows(pendingItems, refs, publicWords, userWords, privateWords),
    [pendingItems, refs, publicWords, userWords, privateWords],
  )

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

  return {
    words,
    refs,
    loading,
    error,
    refresh,
    removeWord,
    updateNote,
    counts,
    pending,
    pendingCount: pending.length,
  }
}

/** 模块级空数组哨兵：默认参数里的字面量 [] 每次渲染都是新身份，会让下游 memo 失效 */
const EMPTY_PRIVATE_WORDS = []

/**
 * 读本小站还没上云的草稿词（**只经 offlineApi.readDrafts**，键不外泄）。
 *
 * @param {string|null} stationId
 * @param {string} scope
 * @returns {Array<{wordKey: string, source: 'public'|'user', queuedAt: string|null}>}
 */
function readPendingKeys(stationId, scope) {
  if (!stationId || !scope || scope === 'guest') return []
  let drafts
  try {
    drafts = offlineApi.readDrafts(scope)
  } catch {
    return []
  }
  const queue = (drafts && drafts.stationWords) || []
  const out = []
  const seen = new Set()
  queue.forEach((item) => {
    if (!item || item.stationId !== stationId) return
    // parked = 已被 park（跨账号 / 永久失败）：不投影，
    // 否则用户会看到一条永远传不上去的「待上传」行
    if (item.parked) return
    const items = Array.isArray(item.items) ? item.items : []
    items.forEach((it) => {
      if (!it || typeof it.wordKey !== 'string' || it.wordKey === '') return
      // 同一条草稿只在**首个匹配**的 stationId 下出现一次；
      // 同一 stationId 内多次入队时，queuedAt 最新的那条代表它
      if (seen.has(it.wordKey)) return
      seen.add(it.wordKey)
      out.push({ wordKey: it.wordKey, source: it.source === 'user' ? 'user' : 'public', queuedAt: item.queuedAt ?? null })
    })
  })
  return out
}

/**
 * 把草稿投影反查成视图行，并按「已同步的 refs 优先」去重。
 *
 * @param {Array<{wordKey: string, source: string}>} items 草稿词
 * @param {object[]} refs 已同步的引用行（优先级最高）
 * @param {object[]} publicWords 已加载的公共词条
 * @param {object[]} userWords 已从云端取到的私有词条
 * @param {object[]} privateWords 私有词本地缓存（M3 的离线反查来源）
 * @returns {object[]} 投影行
 */
function buildPendingRows(items, refs, publicWords, userWords, privateWords) {
  if (!items || items.length === 0) return []
  // ★ 去重优先级：已同步的 refs 优先（同一词既在 refs 又在草稿里 → 只出现一行，
  //   且以 refs 为准 —— 因为 refs 才是用户真正已经加进去的）
  const synced = new Set((refs || []).map((r) => r.wordKey))
  const pubByKey = new Map((publicWords || []).map((w) => [w.id, w]))
  const userByKey = new Map((userWords || []).map((w) => [w.wordKey, w]))
  const cacheByKey = new Map((privateWords || []).map((w) => [w.wordKey || w.id, w]))

  const rows = []
  items.forEach((it) => {
    if (synced.has(it.wordKey)) return
    let view = null
    if (it.source === 'user') {
      // 私有词：先看已取到的，再回落本地缓存（★ 离线时后者是唯一来源）
      view = userByKey.get(it.wordKey) || cacheByKey.get(it.wordKey) || null
    } else {
      const w = pubByKey.get(it.wordKey)
      if (w) {
        view = { ...w, wordKey: w.id, source: 'public', note: null, phoneticStatus: w.phoneticBr ? 'ok' : 'pending' }
      }
    }
    if (view) {
      rows.push({ ...view, pendingSync: true, queuedAt: it.queuedAt })
      return
    }
    // ★ 反查不到 → 渲染 wordKey 原文 + 「待上传」，不留空白行
    //   （留空白会让用户以为词丢了，而它其实在草稿队列里好好的）
    const parsed = parseWordKey(it.wordKey)
    rows.push({
      id: it.wordKey,
      wordKey: it.wordKey,
      form: parsed.form || it.wordKey,
      pos: '',
      gloss: '',
      source: it.source,
      note: null,
      pendingSync: true,
      queuedAt: it.queuedAt,
      unresolved: true,
    })
  })
  return rows
}

export default useStationWords

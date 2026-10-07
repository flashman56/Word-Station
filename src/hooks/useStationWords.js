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
import { projectRef, readStationRefs, scopeOf, writeStationRefs } from '../lib/migrate.js'

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
    //
    // ★★ 写缓存前必须做列裁剪（见 pickCacheRef 的完整论证）★★
    //   内存态 setRefs(list) 持**全字段**；落盘的只是「断网能看见词条 +
    //   站内复习」所需的最小投影。将来 K5 接笔记 UI、或要按 id/addedAt 排序，
    //   数据都在内存态与云端，缓存里没有不影响。
    // ★ 显式投影只是**文档化**，不是防线 ——
    //   真正的防线在 writeStationRefs 内部（migrate.js 的 projectRef）。
    //   这里再写一次是为了让读代码的人一眼看到「落盘的是裁剪版」；
    //   即使这行被删掉，writeStationRefs 仍会裁（QA 的脚本就是这么验证的）。
    writeStationRefs(stationId, list.map(projectRef), myScope)

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
 * 缓存投影：只留 `wordKey`（写盘前的唯一裁剪点）
 * ------------------------------------------------------------------
 * ★ 为什么裁（实测依据，不是估算）★
 *   `schema.stationWordFromRow` 返回 8 个字段，序列化后**单条 299.7 字节**
 *   （scripts/measure-station-cache.mjs，1000 条取平均，JSON.stringify + UTF-8）。
 *   而 1 站 × 500 词 = 146.3KB ⇒ 256KB 护栏在**第 2 个站**就拒写
 *   ⇒ A-02（断网刷新小站消失）在多站场景下等于没修好。
 *
 *   逐字段实测占比：id 22.7% / stationId 17.0% / ownerId 16.3% / updatedAt 13.0%
 *   / addedAt 12.3% / source 5.9% / note 4.0% / **wordKey 8.0%**
 *   ⇒ 裁掉 7 个字段省 **91.3%**（273.6 B/条）。
 *   换句话说：现状那 300 字节里，**只有 8% 是真正承载信息的 wordKey**，
 *   其余全是**每行重复的上下文**。
 *
 * ★ 为什么这 7 个字段都能裁（逐条追踪消费点，不是推测）★
 *   id          无人读。updateNote 的入参是 (stationId, wordKey, note)，
 *               全部来自调用处的变量，**没有一个来自 refs**。
 *   stationId   无人读。缓存本身就是按 stationId 分条目的，条目内每行再存
 *               一遍纯属重复。
 *   ownerId     无人读。分区已由 storage key 的 scope 保证，行内再存是
 *               第二重冗余。
 *   source      无人读。★ 消费侧分流用的是 isUserKey(r.wordKey) 即
 *               startsWith('u.')，而 words[].source 是**硬编码**的
 *               （public 分支写 'public'、user 分支由 toUserWordView 写 'user'）
 *               ⇒ r.source 与 wordKey 前缀是**同一信息的两份副本**。
 *   note        无人用于显示。PRD §8-3 / B-08 明确「站内笔记本期不做」，
 *               且 addToStation.js 构造的 item 是 {wordKey, source}（无 note）
 *               ⇒ 库里 today 恒为 null。**将来 K5 接 UI 时必须走 refresh()
 *               从云端取，不能读缓存** —— 这条前提写在 K5 的设计里。
 *   addedAt     无人读。「按加入时间倒序」靠的是 refs 的**数组顺序**，
 *               而 listByStation 已 .order('added_at', {ascending:false})；
 *               normalizeByStation 的 filter 保持原序。
 *   updatedAt   无人读。updateNote **自己写** updated_at（new Date().toISOString()），
 *               从不读，也没有 eq('updated_at', ...) 的并发判定。
 *
 * ★ 不能牺牲的两条能力（裁剪后完全不受影响）★
 *   ① 断网 + F5 能看到小站词条：消费点只用 wordKey
 *      （useStationWords 的 noteByKey / isUserKey 分流 / 排序 / synced 去重，
 *        App.jsx:220 的 existingKeys）。
 *   ② 站内复习：buildLearnQueue / buildReviewQueue 的入参是由 wordKey 驱动的
 *      视图对象 words，不读 refs 的其余字段。
 *
 * ★ 体积（test-station-words.mjs 里逐字节实测，最坏情况取最长词）★
 *   wordKey-only 单条：**17 B（w.a）/ 36 B（w.internationalization）—— 差 2.12 倍**
 *   1 站 × 500 词：**8.3 KB（短）/ 17.6 KB（长）**
 *   10 站满配：  **83 KB（短）/ 175.8 KB（长）**
 *   护栏 256KB + LRU 10 站 ⇒ 正常路径永不触发拒写；
 *   **长词场景余量 31%**（175.8/256），短词场景余量 68%。
 *
 * ★★ 调这个护栏值之前必须重新实测，不能用短词估算 ★★
 *   词形长度让单条体积差 **2.12 倍**（17B vs 36B）。
 *   用短词测出「83KB，很安全」而按最长词实际是 175.8KB —— 结论虽仍在护栏内，
 *   但余量差了一倍多。**按最坏情况留余量，不要按平均**（team-lead 明确要求）。
 *
 * @param {object} r stationWordsApi.stationWordFromRow 的输出
 * @returns {{wordKey: string}} 落盘用的最小投影
 */
export function pickCacheRef(r) {
  return projectRef(r)
}

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

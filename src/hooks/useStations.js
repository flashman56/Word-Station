/**
 * 小站列表 + 当前小站 + CRUD（乐观更新）
 * ------------------------------------------------------------------
 * 未登录或未配置 Supabase → 空列表 + isGuest，组件走「游客模式」提示。
 *
 * ★ 分区：「当前小站」按账号隔离（键约定见 lib/migrate.js，本文件不出现键名）。
 *   换号后不残留上一个账号的 current —— 否则 A 选的小站 id 会带到 B 的界面。
 *
 * ★ 离线优先（A-02 / A-10）★
 *   stations 是纯云端态时，**断网 + 刷新页面**首帧恒为 []，而界面会显示
 *   「还没有小站，点右侧新建」—— 用户以为被删了。所以：
 *     - 首帧读本地缓存（不 await）；
 *     - refresh() 成功后写缓存（失败静默，缓存不是数据源）；
 *     - 断网建站 → 落草稿 + 乐观插入，不做「建不了就报错」。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as stationsApi from '../lib/cloud/stations.js'
import * as offlineApi from '../lib/cloud/offline.js'
import { dropStationRefs, ensurePartition, keysFor, readStationsCache, scopeOf, writeStationsCache } from '../lib/migrate.js'

function readCurrent(scope) {
  try {
    return localStorage.getItem(keysFor(scope).stationCurrent) || null
  } catch {
    return null
  }
}

function writeCurrent(id, scope) {
  try {
    if (id) localStorage.setItem(keysFor(scope).stationCurrent, id)
    else localStorage.removeItem(keysFor(scope).stationCurrent)
  } catch {
    /* ignore */
  }
}

/**
 * 服务端校验类错误码：重试无意义，绝不入队。
 *
 * ⚠ 与 lib/cloud/offline.js 的 isPermanentError 是两套判据、两个用途：
 *   那张判「队列里这条草稿还推得上去吗」（本轮红线不允许改它），
 *   这张判「这次调用失败该不该把同样的东西再排一次」。两者不能互相替代。
 */
const NON_RETRYABLE = new Set(['NO_AUTH', 'BAD_REQUEST', 'DUPLICATE_NAME'])

/**
 * @param {string|null} ownerId 当前登录用户 id；null 表示游客
 * @returns {{
 *   stations: object[], current: object|null, loading: boolean, error: object|null, busy: boolean,
 *   setCurrentId: (id: string|null) => void,
 *   createStation: (name: string) => Promise<object|null>,
 *   renameStation: (id: string, name: string) => Promise<boolean>,
 *   removeStation: (id: string) => Promise<boolean>,
 *   togglePin: (id: string, pinned: boolean) => Promise<boolean>,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useStations(ownerId) {
  const scope = scopeOf(ownerId)
  // ★ 首帧就用缓存渲染（A-02）：不等 refresh()。断网时 refresh 只 setError 后
  //   return，而首帧已经是缓存内容 —— 这正是「刷新后小站消失」的修法。
  const [stations, setStations] = useState(() => (ownerId ? readStationsCache(scope).stations : []))
  const [currentId, setCurrentIdState] = useState(() => readCurrent(scope))
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId

  // 换号时读回该账号自己的 current（不残留上一个账号的选择）+ 该账号的小站缓存
  useEffect(() => {
    ensurePartition(scope)
    setCurrentIdState(readCurrent(scope))
    if (ownerId) setStations(readStationsCache(scope).stations)
    else setStations([])
  }, [scope, ownerId])

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setStations([])
      setCurrentIdState(readCurrent(scope))
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await stationsApi.list(ownerId)
    setLoading(false)
    if (err) {
      // ★ 不清空 stations：失败时保留（缓存的或本次会话已有的）内容 ——
      //   「断网就变成空列表」正是 A-02 的症状。
      setError(err)
      return
    }
    setError(null)
    const list = data || []
    setStations(list)
    // 只在成功时整体重写缓存（失败时保留旧缓存，那才是断网时唯一的希望）
    writeStationsCache(list, scope)
    // 当前小站失效（被删 / 换账号）→ 自动落到第一个
    setCurrentIdState((prev) => {
      if (prev && list.some((s) => s.id === prev)) return prev
      const next = list.length ? list[0].id : null
      writeCurrent(next, scope)
      return next
    })
  }, [ownerId, scope])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setCurrentId = useCallback(
    (id) => {
      setCurrentIdState(id)
      writeCurrent(id, scope)
    },
    [scope],
  )

  /**
   * 小站名的唯一化判据：与 Postgres 唯一索引 `(owner_id, lower(btrim(name)))` 逐字对齐。
   *
   * ★ 为什么本地就要比一次（M4②，跨账号隔离之外的另一道硬伤）★
   *   `stations` 上有唯一索引 `(owner_id, lower(btrim(name)))`。离线建站时我们
   *   看不到云端，于是重名草稿会一路走到补传那一步才撞 `23505`。而
   *   offline.js 的 `isPermanentError` 白名单里**没有 23505**（且本轮红线不允许
   *   改它）→ 判为「可重试」→ 每 30s 重试一次、pending 永远减不掉，
   *   用户只看到一个减不掉的僵尸草稿。
   *
   *   所以修法是**入队前**在本地比一次：重名直接报错、**不入队**。
   *
   *   ⚠ 将来若要放开「离线也能建重名站」，必须先给 isPermanentError 补 23505 判据
   *     —— 而那需要改 lib/cloud/offline.js，本轮红线不允许。改之前请先读这里。
   *
   * @param {string} name 已 trim 的名字
   * @param {object[]} list 当前已知的全部小站
   * @returns {string|null} 冲突的小站名；无冲突返回 null
   */
  const findDuplicate = useCallback((cleanName, list) => {
    const target = String(cleanName).trim().toLowerCase()
    const hit = list.find((s) => String(s.name || '').trim().toLowerCase() === target)
    return hit ? hit.name : null
  }, [])

  const createStation = useCallback(
    async (name) => {
      if (!ownerId) {
        setError({ code: 'NO_AUTH', message: '请先登录后再创建小站' })
        return null
      }

      // ---- 本地前置校验（与 stationsApi.create 的服务端校验一致）----
      // 先做本地校验再入队：这些错重试一万次也一样失败，入队只会变成僵尸草稿。
      const clean = String(name ?? '').trim()
      if (!clean) {
        setError({ code: 'BAD_REQUEST', message: '小站名不能为空' })
        return null
      }
      if (clean.length > 40) {
        setError({ code: 'BAD_REQUEST', message: '小站名不能超过 40 字符' })
        return null
      }
      const dup = findDuplicate(clean, stations)
      if (dup) {
        // ★ 不入队（M4②）：见 findDuplicate 的注释
        setError({ code: 'DUPLICATE_NAME', message: `已存在同名小站「${dup}」` })
        return null
      }

      setBusy(true)
      setError(null)
      const { data, error: err } = await stationsApi.create(ownerId, clean)
      setBusy(false)
      if (!err) {
        setStations((prev) => [data, ...prev.filter((s) => s.id !== data.id)])
        writeStationsCache([data, ...stations.filter((s) => s.id !== data.id)], scope)
        setCurrentId(data.id)
        return data
      }

      // ---- 失败：区分「服务端校验错」（原样抛出）与「网络类」（入队）----
      //
      // 判定顺序是「先试网络，失败再看 error.code」而不是先看 navigator.onLine：
      // Wi-Fi 标志连着但没网是常态，onLine 不可靠。
      if (NON_RETRYABLE.has(String(err.code))) {
        setError(err)
        return null
      }

      // ---- 离线建站（A-10）：落草稿 + 乐观插入 ----
      //
      // ★ payload 形状必须是 { row: {...} }，三者对齐，改一处必伤另两处 ★
      //   claim('stations')   要求 item.row.id
      //   itemOwnerId()       要求 item.row.ownerId
      //   pushOne('stations') 解构 { row } 交给 stationsApi.upsert
      // DRAIN_ORDER 已含 'stations'，claim / pushOne / upsert 全都现成，
      // 本轮**零新增 kind**、offline.js 零改动。
      const row = {
        id: stationsApi.newStationId(),
        ownerId,
        name: clean,
        pinned: false,
        createdAt: new Date().toISOString(),
      }
      offlineApi.enqueue('stations', { row }, scope)
      // pendingSync 是给 UI 的**唯一**提示依据：它是本地内存标记，不入库、不上行。
      // 刷新页面后这个标记会消失（云端列表里本来也没有它）—— 那时草稿已在队列里，
      // SyncBadge 的 pending 计数会接手，用户仍能看到「1 条待传」。
      const optimistic = { ...row, pendingSync: true }
      setStations((prev) => [optimistic, ...prev])
      setCurrentId(row.id)
      // 返回 row 而非 null：StationBar 靠它关掉输入框并给出「已存为离线草稿」提示
      return optimistic
    },
    [ownerId, scope, stations, findDuplicate, setCurrentId],
  )

  const renameStation = useCallback(
    async (id, name) => {
      setBusy(true)
      setError(null)
      // 乐观更新
      setStations((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
      const { data, error: err } = await stationsApi.update(id, { name })
      setBusy(false)
      if (err) {
        setError(err)
        await refresh()
        return false
      }
      setStations((prev) => prev.map((s) => (s.id === id ? data : s)))
      writeStationsCache(stations.map((s) => (s.id === id ? data : s)), scope)
      return true
    },
    [stations, scope, refresh],
  )

  const removeStation = useCallback(
    async (id) => {
      setBusy(true)
      setError(null)
      const snapshot = stations
      setStations((prev) => prev.filter((s) => s.id !== id))
      const { error: err } = await stationsApi.remove(id)
      setBusy(false)
      if (err) {
        setError(err)
        setStations(snapshot)
        return false
      }
      // ★ Q8：删站顺手清掉该站的词条缓存条目 ★
      //   1. 正确性：currentId 会落到另一个小站，若那个站有缓存条目，
      //      切过去首帧就是对的，不会「刚删完还显示」；
      //   2. 配额：stationWordsCache 是只增不减的 map，反复「建站→删站」会
      //      无界增长，而 localStorage 配额正是 A-07 要保护的同一个资源。
      //      这是唯一成本近似为零的回收点。
      //   stationsCache 本身**不**手动清 —— 它由 refresh() 成功时整体重写覆盖。
      dropStationRefs(id, scope)
      writeStationsCache(snapshot.filter((s) => s.id !== id), scope)
      setCurrentIdState((prev) => {
        if (prev !== id) return prev
        const next = snapshot.filter((s) => s.id !== id)[0]?.id ?? null
        writeCurrent(next, scope)
        return next
      })
      return true
    },
    [stations, scope],
  )

  const togglePin = useCallback(
    async (id, pinned) => {
      setBusy(true)
      setError(null)
      setStations((prev) => prev.map((s) => (s.id === id ? { ...s, pinned } : s)))
      const { data, error: err } = await stationsApi.update(id, { pinned })
      setBusy(false)
      if (err) {
        setError(err)
        await refresh()
        return false
      }
      setStations((prev) => prev.map((s) => (s.id === id ? data : s)))
      writeStationsCache(stations.map((s) => (s.id === id ? data : s)), scope)
      return true
    },
    [stations, scope, refresh],
  )

  const current = useMemo(
    () => stations.find((s) => s.id === currentId) || null,
    [stations, currentId],
  )

  return {
    stations,
    current,
    currentId,
    loading,
    busy,
    error,
    setCurrentId,
    createStation,
    renameStation,
    removeStation,
    togglePin,
    refresh,
  }
}

export default useStations

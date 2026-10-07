/**
 * 小站列表 + 当前小站 + CRUD（乐观更新）
 * ------------------------------------------------------------------
 * 未登录或未配置 Supabase → 空列表 + isGuest，组件走「游客模式」提示。
 *
 * ★ 分区：「当前小站」按账号隔离（键约定见 lib/migrate.js，本文件不出现键名）。
 *   换号后不残留上一个账号的 current —— 否则 A 选的小站 id 会带到 B 的界面。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as stationsApi from '../lib/cloud/stations.js'
import { ensurePartition, keysFor, scopeOf } from '../lib/migrate.js'

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
  const [stations, setStations] = useState([])
  const [currentId, setCurrentIdState] = useState(() => readCurrent(scope))
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId

  // 换号时读回该账号自己的 current（不残留上一个账号的选择）
  useEffect(() => {
    ensurePartition(scope)
    setCurrentIdState(readCurrent(scope))
  }, [scope])

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
      setError(err)
      return
    }
    setError(null)
    setStations(data || [])
    // 当前小站失效（被删 / 换账号）→ 自动落到第一个
    setCurrentIdState((prev) => {
      const list = data || []
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

  const createStation = useCallback(
    async (name) => {
      if (!ownerId) {
        setError({ code: 'NO_AUTH', message: '请先登录后再创建小站' })
        return null
      }
      setBusy(true)
      setError(null)
      const { data, error: err } = await stationsApi.create(ownerId, name)
      setBusy(false)
      if (err) {
        setError(err)
        return null
      }
      setStations((prev) => [data, ...prev.filter((s) => s.id !== data.id)])
      setCurrentId(data.id)
      return data
    },
    [ownerId, setCurrentId],
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
      return true
    },
    [refresh],
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
      return true
    },
    [refresh],
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

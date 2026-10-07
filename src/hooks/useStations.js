/**
 * 小站列表 + 当前小站 + CRUD（乐观更新）
 * ------------------------------------------------------------------
 * 未登录或未配置 Supabase → 空列表 + isGuest，组件走「游客模式」提示。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as stationsApi from '../lib/cloud/stations.js'

const LS_CURRENT = 'wrc.station.current'

function readCurrent() {
  try {
    return localStorage.getItem(LS_CURRENT) || null
  } catch {
    return null
  }
}

function writeCurrent(id) {
  try {
    if (id) localStorage.setItem(LS_CURRENT, id)
    else localStorage.removeItem(LS_CURRENT)
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
  const [stations, setStations] = useState([])
  const [currentId, setCurrentIdState] = useState(() => readCurrent())
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setStations([])
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
      writeCurrent(next)
      return next
    })
  }, [ownerId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setCurrentId = useCallback((id) => {
    setCurrentIdState(id)
    writeCurrent(id)
  }, [])

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
        writeCurrent(next)
        return next
      })
      return true
    },
    [stations],
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

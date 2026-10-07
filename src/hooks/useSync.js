/**
 * 在线状态 + 同步状态机 + 定时 / 事件驱动的补传
 * ------------------------------------------------------------------
 * 职责：
 *   1. navigator.onLine 监听（online / offline 事件）；
 *   2. 每 30s 尝试 drain 离线草稿；每 60s 触发一次下行（由 useLearnCloud 注册）；
 *   3. 页面回到前台（visibilitychange）立刻同步一次；
 *   4. 暴露 pending / syncing / lastSyncAt 供 SyncBadge 展示。
 *
 * ★ 分区：pending 与 drain 都只针对当前 scope 的队列（换号不残留上一个账号的徽标数字）。
 *
 * 断网判定：navigator.onLine === false **或** 请求抛网络错（后者由 cloud/*.js 返回 error 后 enqueue）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import * as offlineApi from '../lib/cloud/offline.js'
import { onPendingChange } from '../lib/cloud/offline.js'
import { readSync, scopeOf } from '../lib/migrate.js'

/** 由 useLearnCloud 注册的下行回调（避免两个 hook 互相 import 造成循环） */
let pullHandler = null

/**
 * 注册「拉取云端增量并合并」的实现。
 * @param {(() => Promise<void>)|null} fn
 */
export function registerPullHandler(fn) {
  pullHandler = fn
}

/**
 * @param {object} [opts]
 * @param {string|null} [opts.ownerId]
 * @returns {{
 *   online: boolean, syncing: boolean, pending: number, lastSyncAt: string|null,
 *   syncNow: () => Promise<void>, drain: () => Promise<object>, refreshPending: () => void
 * }}
 */
export function useSync({ ownerId = null } = {}) {
  const scope = scopeOf(ownerId)
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false,
  )
  const [pending, setPending] = useState(() => offlineApi.pendingCount(scope))
  const [syncing, setSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(() => readSync(scope).lastSyncAt || null)
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId
  const timerRef = useRef(null)

  // 换号时把 pending 与游标读回来（新账号分区初始为 0 条、游标 null）。
  // ★ 首次挂载跳过 ★：初值已由 useState 的初始化函数从当前 scope 读过；
  //   多 set 一遍会多出一轮渲染，推迟懒加载 chunk（首屏体感变差）。
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setPending(offlineApi.pendingCount(scope))
    setLastSyncAt(readSync(scope).lastSyncAt || null)
  }, [scope])

  const refreshPending = useCallback(() => setPending(offlineApi.pendingCount(scope)), [scope])

  // 订阅草稿队列变化（入队 / 补传都会通知），保证徽标计数实时
  useEffect(() => onPendingChange(refreshPending), [refreshPending])

  /** 补传离线草稿（只补当前 scope 的队列） */
  const drain = useCallback(async () => {
    const uid = ownerRef.current
    setSyncing(true)
    try {
      const res = await offlineApi.drain({ scope, uid })
      setPending(offlineApi.pendingCount(scope))
      return res
    } finally {
      setSyncing(false)
    }
  }, [scope])

  /** 手动「立即同步」：先补传草稿，再拉云端增量合并 */
  const syncNow = useCallback(async () => {
    await drain()
    if (pullHandler) {
      setSyncing(true)
      try {
        await pullHandler()
      } finally {
        setSyncing(false)
      }
    }
    setLastSyncAt(readSync(scope).lastSyncAt || null)
  }, [drain, scope])

  // ---------------------------------------------------------------- 事件监听
  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      syncNow()
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [syncNow])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncNow()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [syncNow])

  // ---------------------------------------------------------------- 定时轮询
  useEffect(() => {
    if (!ownerRef.current) return undefined
    let ticks = 0
    timerRef.current = setInterval(() => {
      ticks += 1
      // 每 30s 补传一次草稿；每 60s 额外拉一次云端增量
      drain()
      if (ticks % 2 === 0 && pullHandler) pullHandler()
    }, 30000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [scope, drain])

  return { online, syncing, pending, lastSyncAt, syncNow, drain, refreshPending }
}

export default useSync

/**
 * useLearn 的云端包装：本地写 + 标记 dirty + 触发上行 + 下行增量合并
 * ------------------------------------------------------------------
 * 设计要点（§7.2）：
 *   - 本地写路径 **完全不变**（learning.js 纯函数 + localStorage 立即落盘），
 *     保证离线可用与 UI 零延迟；
 *   - 写操作额外 markDirty → 防抖 2s 或 dirty ≥20 条触发上行；
 *   - 下行：pullSince(lastSyncAt) → mergeAll（按 updated_at 记录级 LWW）→ 写本地 + 更新游标；
 *   - 断网：上行失败 / navigator.onLine=false → 写 wrc.drafts.v1，联网后自动补传。
 *
 * 红线：src/lib/learning.js 零改动，不新增任何 SRS 字段。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLearn } from './useLearn.js'
import { mergeAll, updatedAtMs } from '../lib/cloud/merge.js'
import * as learnSyncApi from '../lib/cloud/learnSync.js'
import * as offlineApi from '../lib/cloud/offline.js'
import { notifyPendingChanged } from '../lib/cloud/offline.js'
import {
  exportLocalRecords,
  readCloudMigration,
  readLearn,
  readSettingsV2,
  readSync,
  runMigration,
  writeCloudMigration,
  writeSync,
} from '../lib/migrate.js'
import { registerPullHandler } from './useSync.js'

const PUSH_DEBOUNCE_MS = 2000
const PUSH_THRESHOLD = 20

/**
 * @param {Array} words 全量 / 小站词表（与 useLearn 同参）
 * @param {object} opts
 * @param {string|null} opts.ownerId
 * @param {boolean} opts.online
 * @param {object} [opts.learnOpts] 透传给 useLearn（band / groupByFamily / morphemes / roundSize）
 * @returns {object} useLearn 的全部返回值 + 同步相关字段
 */
export function useLearnCloud(words, { ownerId = null, online = true, learnOpts = {} } = {}) {
  const dirtyRef = useRef(null)
  if (dirtyRef.current === null) dirtyRef.current = new Set()
  const dirty = dirtyRef.current

  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | offline | error | done
  const [lastSyncAt, setLastSyncAt] = useState(() => readSync().lastSyncAt || null)
  const [lastError, setLastError] = useState(null)
  const onlineRef = useRef(online)
  onlineRef.current = online
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId
  const timerRef = useRef(null)
  const pushingRef = useRef(false)

  // 本地 records 的镜像（上行时读最新值，避免闭包拿到旧 state）
  const recordsRef = useRef({})

  const markDirty = useCallback((keys) => {
    ;(keys || []).forEach((k) => dirty.add(k))
    schedulePush()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const learn = useLearn(words, {
    ...learnOpts,
    onDirty: markDirty,
    // 有账号才给记录打 updatedAt（纯本地模式保持原存储口径，不额外占空间）
    stampUpdatedAt: Boolean(ownerId),
  })

  useEffect(() => {
    recordsRef.current = learn.records
  }, [learn.records])

  // replaceAll 放进 ref：learn 每次渲染都是新对象，直接进 useCallback 依赖会让 pull 一直重建 → 死循环
  const replaceAllRef = useRef(null)
  replaceAllRef.current = learn.replaceAll

  /** 用云端合并结果覆盖本地（供下行使用） */
  const applyMerged = useCallback((merged) => {
    if (replaceAllRef.current) replaceAllRef.current(merged)
  }, [])

  /**
   * 上行 dirty 记录。
   * @param {boolean} [force]
   */
  const pushDirty = useCallback(
    async (force = false) => {
      const uid = ownerRef.current
      if (!uid) return
      if (dirty.size === 0 && !force) return
      if (pushingRef.current) return
      pushingRef.current = true
      try {
        const keys = [...dirty]
        const rows = keys
          .map((k) => ({ wordKey: k, record: { ...(recordsRef.current[k] || {}), updatedAt: recordsRef.current[k]?.updatedAt || new Date().toISOString() } }))
          .filter((r) => r.record && r.record.status)
        if (rows.length === 0) {
          dirty.clear()
          return
        }
        setSyncStatus(onlineRef.current ? 'syncing' : 'offline')
        if (!onlineRef.current) {
          offlineApi.enqueue('learn', { ownerId: uid, rows })
          dirty.clear()
          notifyPendingChanged()
          setSyncStatus('offline')
          return
        }
        const { error } = await learnSyncApi.pushBatch(uid, rows)
        if (error) {
          // 请求失败同样按离线处理：草稿不丢，联网后补传
          offlineApi.enqueue('learn', { ownerId: uid, rows })
          dirty.clear()
          notifyPendingChanged()
          setLastError(error)
          setSyncStatus('offline')
          return
        }
        dirty.clear()
        setLastError(null)
        setSyncStatus('done')
        const now = new Date().toISOString()
        writeSync(now)
        setLastSyncAt(now)
      } finally {
        pushingRef.current = false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /** 防抖调度：2s 后推，或 dirty 超过 20 条立即推 */
  function schedulePush() {
    if (dirty.size >= PUSH_THRESHOLD) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      pushDirty()
      return
    }
    if (timerRef.current) return
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      pushDirty()
    }, PUSH_DEBOUNCE_MS)
  }

  /**
   * 下行：拉云端增量 → 与本地合并 → 写本地 + 更新游标；本地胜出的行顺带上行。
   * @returns {Promise<void>}
   */
  const pull = useCallback(async () => {
    const uid = ownerRef.current
    if (!uid) return
    // 先确保本地是 v2 口径（幂等，已迁移则跳过）；继承开关沿用用户设置
    runMigration({ words: words || [], inheritFreqKnown: readSettingsV2().inheritFreqKnown !== false })
    const cursor = readSync().lastSyncAt
    const { data, error } = await learnSyncApi.pullSince(uid, cursor)
    if (error) {
      setLastError(error)
      setSyncStatus(onlineRef.current ? 'error' : 'offline')
      return
    }
    const remote = data?.rows || {}
    const local = recordsRef.current || {}
    const { merged, toPush } = mergeAll(local, remote)
    applyMerged(merged)
    if (toPush.length > 0 && onlineRef.current) {
      await learnSyncApi.pushBatch(uid, toPush)
    }
    const maxRemote = data?.maxUpdatedAt
    const maxLocal = Object.keys(merged).reduce((m, k) => Math.max(m, updatedAtMs(merged[k])), 0)
    const nextCursor = maxRemote && maxRemote > new Date(maxLocal || 0).toISOString() ? maxRemote : new Date(maxLocal || Date.now()).toISOString()
    writeSync(nextCursor)
    setLastSyncAt(nextCursor)
    setSyncStatus('done')
    setLastError(null)
  }, [words, applyMerged])

  /** 首次登录：全量拉取 + 合并上传（幂等，标记存在则跳过） */
  const migrateToCloud = useCallback(async () => {
    const uid = ownerRef.current
    if (!uid) return
    if (readCloudMigration().done) {
      await pull()
      return
    }
    // 强制跑一次本地迁移，保证导出的是 v2 口径
    runMigration({ words: words || [], inheritFreqKnown: readSettingsV2().inheritFreqKnown !== false })
    const local = exportLocalRecords() || readLearn()
    const { data, error } = await learnSyncApi.pullSince(uid, null)
    if (error) {
      setLastError(error)
      setSyncStatus('error')
      return
    }
    const remote = data?.rows || {}
    const { merged, toPush } = mergeAll(local, remote)
    if (toPush.length > 0 && onlineRef.current) {
      await learnSyncApi.pushBatch(uid, toPush)
    }
    applyMerged(merged)
    writeCloudMigration()
    const nextCursor = data?.maxUpdatedAt || new Date().toISOString()
    writeSync(nextCursor)
    setLastSyncAt(nextCursor)
    setSyncStatus('done')
  }, [words, pull, applyMerged])

  // 登录 / 切换账号时：首次跑全量迁移，之后按增量
  useEffect(() => {
    if (!ownerId) return
    if (readCloudMigration().done) pull()
    else migrateToCloud()
  }, [ownerId, pull, migrateToCloud])

  // 注册下行回调给 useSync（定时 / 回到前台 / 手动同步时触发）
  useEffect(() => {
    registerPullHandler(pull)
    return () => registerPullHandler(null)
  }, [pull])

  // 恢复在线 → 立刻补传 + 增量
  useEffect(() => {
    if (online) {
      pushDirty(true)
      pull()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online])

  // 卸载前清掉防抖定时器，避免内存泄漏
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const stats = useMemo(() => learn.stats, [learn.stats])

  return {
    ...learn,
    stats,
    syncStatus,
    lastSyncAt,
    lastError,
    pending: offlineApi.pendingCount(),
    pushNow: () => pushDirty(true),
    pull,
  }
}

export default useLearnCloud

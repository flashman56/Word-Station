/**
 * useLearn 的云端包装：本地写 + 标记 dirty + 触发上行 + 下行增量合并
 * ------------------------------------------------------------------
 * 设计要点（§7.2）：
 *   - 本地写路径 **完全不变**（learning.js 纯函数 + localStorage 立即落盘），
 *     保证离线可用与 UI 零延迟；
 *   - 写操作额外 markDirty → 防抖 2s 或 dirty ≥20 条触发上行；
 *   - 下行：pullSince(lastSyncAt) → mergeAll（按 updated_at 记录级 LWW）→ 写本地 + 更新游标；
 *   - 断网：上行失败 / navigator.onLine=false → 写离线草稿（**按 scope 分区**），联网后自动补传。
 *
 * ★ 三层隔离（缺一不可，切号场景的真实数据事故就来自漏掉其中一层）★
 *   L1 数据源：切号时先 `replaceAll(readLearn(newScope))`，让 recordsRef 只可能是当前 scope 的数据
 *              → toPush 里不可能出现他账号行（根治）
 *   L2 epoch 守卫：ownerId 变化时 epochRef++；pushDirty / pull / migrateToCloud
 *              入口取 myEpoch，每个 await 之后、任何 setState / writeXxx / applyMerged
 *              之前校验 myEpoch === epochRef.current，不等则整段丢弃
 *   L3 互斥收敛：切号前 await settleInFlight()（等当前 push promise，最多 3s）
 *
 * ★ 上行只传「学习证据」★
 *   statusSource === 'migration' 的继承记录永不上行（filterUploadable 单点收敛），
 *   但本地统计照常计入 —— 否则 3 万条继承记录会灌进云端 learn_records。
 *
 * 红线：src/lib/learning.js 零改动，不新增任何 SRS 字段。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLearn } from './useLearn.js'
import { filterUploadable, filterUploadableRows, mergeAll, stampRowsForUpload } from '../lib/cloud/merge.js'
import * as learnSyncApi from '../lib/cloud/learnSync.js'
import * as offlineApi from '../lib/cloud/offline.js'
import { notifyPendingChanged, onPendingChange } from '../lib/cloud/offline.js'
import {
  ensurePartition,
  readCloudMigration,
  readLearn,
  readPrefs,
  readSync,
  runMigration,
  scopeOf,
  writeCloudMigration,
  writeSync,
} from '../lib/migrate.js'
import { registerPullHandler } from './useSync.js'

const PUSH_DEBOUNCE_MS = 2000
const PUSH_THRESHOLD = 20
/** L3：切号前等在途 push 的上限（A-9：等结束或显式放弃） */
const SETTLE_TIMEOUT_MS = 3000

/** 空数组哨兵：默认参数写字面量 [] 会每次渲染换新身份，让 useLearn 里
 *  statWords 的 useMemo 失效 → countByStatus 每次渲染重算 6 万词 */
const NO_PRIVATE_WORDS = []

/**
 * @param {Array} words 全量 / 小站词表（与 useLearn 同参）
 * @param {object} opts
 * @param {string|null} opts.ownerId
 * @param {boolean} opts.online
 * @param {Array} [opts.privateWords] 私有词视图对象（只进统计与复习队列）
 * @param {object} [opts.learnOpts] 透传给 useLearn（band / groupByFamily / morphemes / roundSize）
 * @returns {object} useLearn 的全部返回值 + 同步相关字段
 */
export function useLearnCloud(words, { ownerId = null, online = true, privateWords = NO_PRIVATE_WORDS, learnOpts = {} } = {}) {
  const dirtyRef = useRef(null)
  if (dirtyRef.current === null) dirtyRef.current = new Set()
  const dirty = dirtyRef.current

  const scope = scopeOf(ownerId)

  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | offline | error | done
  const [lastSyncAt, setLastSyncAt] = useState(() => readSync(scope).lastSyncAt || null)
  const [lastError, setLastError] = useState(null)
  // 写盘失败信号（A-12）：内存是新的、磁盘是旧的 → 徽标红色告警，直到下一次写成功
  const [storageError, setStorageError] = useState(null)
  // pending 响应式：草稿入队 / 补传都通过 onPendingChange 通知，徽标计数实时
  const [pending, setPending] = useState(() => offlineApi.pendingCount(scope))
  // A-14：永久失败但被保留（parked）的草稿条数，与 pending 分开计
  const [stuck, setStuck] = useState(() => offlineApi.stuckCount(scope))
  const onlineRef = useRef(online)
  onlineRef.current = online
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId

  /** 当前分区（records 的归属分区）；由 scope 派生，业务层只见 ownerId */
  const scopeRef = useRef(scope)
  scopeRef.current = scope

  /** L2 epoch 守卫：任何跨 await 的副作用都要先比对它 */
  const epochRef = useRef(0)
  const timerRef = useRef(null)
  const pushingRef = useRef(false)
  /** L3：在途 push 的 promise */
  const inflightRef = useRef(null)

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
    onStorageError: setStorageError,
    privateWords,
    scope,
    // ★ 常开：游客态也打 updatedAt，否则游客背的词在登录合并时会被云端默认值覆盖（GAP-4）
    stampUpdatedAt: true,
  })

  useEffect(() => {
    recordsRef.current = learn.records
  }, [learn.records])

  // replaceAll 放进 ref：learn 每次渲染都是新对象，直接进 useCallback 依赖会让 pull 一直重建 → 死循环
  const replaceAllRef = useRef(null)
  replaceAllRef.current = learn.replaceAll

  /**
   * 用云端合并结果覆盖本地（供下行使用）。
   * @param {object} merged
   * @param {string} sc 目标分区
   */
  const applyMerged = useCallback((merged, sc) => {
    if (replaceAllRef.current) replaceAllRef.current(merged, sc)
  }, [])

  /** L3：等在途 push 结束（最多 3s；超时则放弃等待，但 epoch 已失配，落地也会被丢弃） */
  const settleInFlight = useCallback(async () => {
    const p = inflightRef.current
    if (!p) return
    await Promise.race([
      p.catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, SETTLE_TIMEOUT_MS)),
    ])
  }, [])

  /**
   * 上行 dirty 记录。
   * @param {boolean} [force]
   */
  const pushDirty = useCallback(
    async (force = false) => {
      const uid = ownerRef.current
      if (!uid) return
      const myEpoch = epochRef.current
      const sc = scopeRef.current
      if (dirty.size === 0 && !force) return
      if (pushingRef.current) return
      pushingRef.current = true
      const task = (async () => {
        try {
          const keys = [...dirty]
          const rows = keys
            .map((k) => ({
              wordKey: k,
              record: { ...(recordsRef.current[k] || {}), updatedAt: recordsRef.current[k]?.updatedAt || new Date().toISOString() },
            }))
            .filter((r) => r.record && r.record.status)
          if (rows.length === 0) {
            dirty.clear()
            return
          }
          setSyncStatus(onlineRef.current ? 'syncing' : 'offline')
          if (!onlineRef.current) {
            offlineApi.enqueue('learn', { ownerId: uid, rows }, sc)
            dirty.clear()
            notifyPendingChanged()
            setSyncStatus('offline')
            return
          }
          const { error } = await learnSyncApi.pushBatch(uid, filterUploadableRows(stampRowsForUpload(rows)))
          if (epochRef.current !== myEpoch) return // L2：账号已变，整段丢弃
          if (error) {
            // 请求失败同样按离线处理：草稿不丢，联网后补传
            offlineApi.enqueue('learn', { ownerId: uid, rows }, sc)
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
          writeSync(now, sc)
          setLastSyncAt(now)
        } finally {
          pushingRef.current = false
        }
      })()
      inflightRef.current = task
      try {
        await task
      } finally {
        if (inflightRef.current === task) inflightRef.current = null
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
   * 游客证据合并（设计 A-4）：把游客分区的**真实学习证据**并入账号分区。
   *
   * 为什么只并证据、不并继承记录：新账号自己会跑一次 runMigration 生成
   * **属于自己 inheritFreqKnown 开关**的继承集合；把游客的继承集合也塞进来
   * 会产生两套语义重叠的记录，且在账号改过继承开关后互相打架。
   *
   * 幂等：每次进入账号分区都跑（不只在首次）——「登录 → 登出 → 游客背几个词
   * → 再登录」这条路径必须有合并，否则游客期间的学习证据会丢。
   * filterUploadable 为空时开销≈0（一个对象过滤），不做短路优化以免埋第二套判据。
   *
   * @param {string} sc 账号 scope
   * @returns {Record<string, object>} 合并后的账号本地记录
   */
  const mergeGuestEvidence = useCallback((sc) => {
    const guestRecords = readLearn('guest')
    const evidence = filterUploadable(guestRecords)
    const accountLocal = readLearn(sc)
    // 记录级 LWW：同键时按 updatedAt 裁决（mergeAll 语义未改，只是复用）
    return { ...accountLocal, ...mergeAll(evidence, accountLocal).merged }
  }, [])

  /**
   * 下行：拉云端增量 → 与本地合并 → 写本地 + 更新游标；本地胜出的行顺带上行。
   *
   * ★ 游标口径（U6，取安全侧）：只按**服务端**返回的 maxUpdatedAt 前进。
   *   旧实现用 max(remote, local) 抬高游标，本地时钟漂移会让 pull 跳过
   *   自己从未真正取到的行。代价是「账号长期只有本地写入」时游标停滞、
   *   重复拉全量（LWW 幂等，只是流量浪费）—— 正确性优先。
   *
   * @returns {Promise<void>}
   */
  const pull = useCallback(async () => {
    const uid = ownerRef.current
    if (!uid) return
    const myEpoch = epochRef.current
    const sc = scopeRef.current
    // 先确保本地是 v2 口径（幂等，已迁移则跳过）；继承开关取**该账号**的 prefs
    runMigration({ scope: sc, words: words || [], inheritFreqKnown: readPrefs(sc).inheritFreqKnown !== false })
    if (epochRef.current !== myEpoch) return

    const cursor = readSync(sc).lastSyncAt
    const { data, error } = await learnSyncApi.pullSince(uid, cursor)
    if (epochRef.current !== myEpoch) return // L2
    if (error) {
      setLastError(error)
      setSyncStatus(onlineRef.current ? 'error' : 'offline')
      return
    }
    const remote = data?.rows || {}
    // 切号时 L1 已把 records 换成当前 scope 的；这里再读一次 scope 内的本地盘，
    // 避免闭包拿到上一个 scope 的 in-memory 值
    const local = readLearn(sc)
    const { merged, toPush } = mergeAll(local, remote)
    if (epochRef.current !== myEpoch) return
    applyMerged(merged, sc)
    if (toPush.length > 0 && onlineRef.current) {
      await learnSyncApi.pushBatch(uid, filterUploadableRows(stampRowsForUpload(toPush)))
      if (epochRef.current !== myEpoch) return
    }
    // 只按服务端时间推进游标
    const nextCursor = data?.maxUpdatedAt || cursor
    if (nextCursor) {
      writeSync(nextCursor, sc)
      setLastSyncAt(nextCursor)
    }
    setSyncStatus('done')
    setLastError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, applyMerged, mergeGuestEvidence])

  /** 首次登录该账号：全量拉取 + 合并上传（按 scope 幂等，标记存在则跳过） */
  const migrateToCloud = useCallback(async () => {
    const uid = ownerRef.current
    if (!uid) return
    const myEpoch = epochRef.current
    const sc = scopeRef.current
    if (readCloudMigration(sc).done) {
      await pull()
      return
    }
    // 强制跑一次本地迁移，保证导出的是 v2 口径（该账号自己的继承开关）
    runMigration({ scope: sc, words: words || [], inheritFreqKnown: readPrefs(sc).inheritFreqKnown !== false })
    if (epochRef.current !== myEpoch) return

    // 三步走（设计 A-4）：
    //   1) 游客证据 → 账号分区（记录级 LWW）
    //   2) 账号本地 → 云端（mergeAll）
    //   3) 只上传真实学习证据（filterUploadable + stampRowsForUpload）
    const local = mergeGuestEvidence(sc)
    const { data, error } = await learnSyncApi.pullSince(uid, null)
    if (epochRef.current !== myEpoch) return
    if (error) {
      setLastError(error)
      setSyncStatus('error')
      return
    }
    const remote = data?.rows || {}
    const { merged, toPush } = mergeAll(local, remote)
    if (epochRef.current !== myEpoch) return
    if (toPush.length > 0 && onlineRef.current) {
      await learnSyncApi.pushBatch(uid, filterUploadableRows(stampRowsForUpload(toPush)))
      if (epochRef.current !== myEpoch) return
    }
    applyMerged(merged, sc)
    writeCloudMigration(sc)
    const nextCursor = data?.maxUpdatedAt || null
    if (nextCursor) {
      writeSync(nextCursor, sc)
      setLastSyncAt(nextCursor)
    }
    setSyncStatus('done')
    setLastError(null)
  }, [words, pull, applyMerged, mergeGuestEvidence])

  /** 补传离线草稿（当前 scope 的队列），顺带推 dirty */
  const drainDrafts = useCallback(async () => {
    const uid = ownerRef.current
    if (!uid) return
    const sc = scopeRef.current
    const res = await offlineApi.drain({ scope: sc, uid })
    setPending(offlineApi.pendingCount(sc))
    setStuck(offlineApi.stuckCount(sc))
    return res
  }, [])

  /** 手动「立即同步」：dirty 推上去 + 草稿补传 + 下行合并（登出前也用它） */
  const flush = useCallback(async () => {
    await pushDirty(true)
    await drainDrafts()
    await pull()
  }, [pushDirty, drainDrafts, pull])

  /**
   * 一键清除「传不上去」的草稿（A-14）。
   *
   * ★ 只删草稿队列，不碰任何学习记录 ★
   *   学习记录在 learn 分区（keysFor(scope).learn），与草稿队列是两个独立的键。
   *   学习进度早已落盘、并在联网时上行过 —— 删草稿 ≠ 删进度。
   */
  const clearStuckDrafts = useCallback(() => {
    const cleared = offlineApi.clearStuck(scopeRef.current)
    setPending(offlineApi.pendingCount(scopeRef.current))
    setStuck(offlineApi.stuckCount(scopeRef.current))
    return cleared
  }, [])

  // ---------------------------------------------------------------- 切账号状态机
  //
  // idle(guest) --ownerId→uid--> loading --(done?)--> syncing --> idle(uid)
  // 任意 --ownerId 变化--> epoch++ → settleInFlight → replaceAll(当前 scope 本地) → dirty.clear()

  // ownerId 变化：epoch++ + 清 dirty（必须先于任何异步等待）
  //
  // ★ 首次挂载要跳过 ★：pending / lastSyncAt 的初值已经由 useState 的初始化函数
  //   从当前 scope 读过了，此处再 set 一遍只会多出一轮渲染。首屏多渲染会推迟
  //   懒加载 chunk（实测总览地图的图例因此渲染不出来）。
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    epochRef.current += 1
    dirty.clear()
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPending(offlineApi.pendingCount(scope))
    setStuck(offlineApi.stuckCount(scope))
    setLastSyncAt(readSync(scope).lastSyncAt || null)
    setLastError(null)
    setSyncStatus('idle')
  }, [scope])

  // 切号时把本地记录换成新 scope 的（L1 数据源，根治 toPush 混入他账号行）
  useEffect(() => {
    if (!ownerId) return
    ensurePartition(scope)
    replaceAllRef.current?.(readLearn(scope), scope)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope])

  // 登录 / 切换账号时：L3 等在途 push → L1 换成本地 → 首次全量迁移 / 之后增量 → 补传草稿
  //
  // 「每次 scope 迁移只跑一次」用 ref 记：pull / migrateToCloud 的身份会随 words
  // 变化而重建，若只靠依赖数组，词库重新加载一次就会把整套首次迁移再跑一遍。
  const syncedScopeRef = useRef(null)
  useEffect(() => {
    if (!ownerId) return undefined
    let cancelled = false
    const run = async () => {
      await settleInFlight()
      if (cancelled) return
      const myEpoch = epochRef.current
      // L1 兜底：上面那个 effect 已换过一次，这里在 await 之后再确认一次
      replaceAllRef.current?.(readLearn(scope), scope)
      if (epochRef.current !== myEpoch || cancelled) return
      if (readCloudMigration(scope).done) await pull()
      else await migrateToCloud()
      if (cancelled || epochRef.current !== myEpoch) return
      await drainDrafts()
    }
    if (syncedScopeRef.current === scope) return undefined
    syncedScopeRef.current = scope
    run().catch(() => {
      /* 网络错误由 pull / migrateToCloud 内部记入 lastError，不向上抛 */
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, pull, migrateToCloud])

  // 登出：清掉「已同步过」的记号，下次登录同一账号仍会走一遍完整流程
  useEffect(() => {
    if (ownerId) return
    syncedScopeRef.current = null
  }, [ownerId])

  // 注册下行回调给 useSync（定时 / 回到前台 / 手动同步时触发）
  useEffect(() => {
    registerPullHandler(pull)
    return () => registerPullHandler(null)
  }, [pull])

  // 恢复在线 → 立刻补传 + 增量
  useEffect(() => {
    if (online && ownerId) {
      pushDirty(true)
      drainDrafts()
      pull()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online])

  // pending 订阅：入队 / 补传都通知，徽标计数实时
  useEffect(
    () =>
      onPendingChange(() => {
        setPending(offlineApi.pendingCount(scopeRef.current))
        setStuck(offlineApi.stuckCount(scopeRef.current))
      }),
    [],
  )

  // ---------------------------------------------------------------- U2 多标签页串号
  //
  // 同源多标签下，A 在标签 1 登出、B 在标签 2 登录时，本标签会收到 storage 事件，
  // 但内存里仍持有 A 的 records（Supabase auth 变化由 useAuth 异步跟上，存在窗口）。
  // 这里做**保守处理**：命中任何 learn 分区键 / 账号相关键的外部写入即强制重载
  // 当前 scope 的本地态。若另一个标签写的是别的 scope，本标签同样重载 —— 因为
  // 它无法确定自己是不是也该跟着换号，重载是唯一不会「显示前一个账号数据」的动作。
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const onStorage = (e) => {
      const key = e.key || ''
      if (!key.startsWith('wrc.')) return
      // 分区学习键 / 设备级设置键之外的不理会（避免草稿入队引发无谓重载）
      const relevant = key.includes('learn.v2') || key.includes('migration.cloud') || key.includes('status.v1')
      if (!relevant) return
      const sc = scopeRef.current
      replaceAllRef.current?.(readLearn(sc), sc)
      dirty.clear()
      setLastSyncAt(readSync(sc).lastSyncAt || null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

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
    scope,
    syncStatus,
    lastSyncAt,
    lastError,
    storageError,
    pending,
    stuck,
    clearStuck: clearStuckDrafts,
    epoch: epochRef.current,
    pushNow: () => pushDirty(true),
    flush,
    pull,
  }
}

export default useLearnCloud
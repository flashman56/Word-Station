/**
 * 冲突合并：按 updated_at 记录级 LWW（Last Write Wins）
 * ------------------------------------------------------------------
 * 规则（设计 §3.4）：
 *   1. 仅本地有           → 上行（upsert）
 *   2. 仅云端有           → 下行（写入本地）
 *   3. 双方都有           → 比较 updatedAt：新的胜出
 *      - 相等则比较内容指纹，不同则取云端（服务端权威）
 *      - 本地无 updatedAt（旧数据）→ 视为 0，取云端
 *
 * 纯函数，不碰存储，可直接单测（scripts/test-merge.mjs）。
 */

/** 参与指纹比较的字段（不含 updatedAt 本身） */
const FINGERPRINT_FIELDS = [
  'status',
  'correctCount',
  'consecutiveCorrect',
  'incorrectCount',
  'lastStudiedAt',
  'lastResult',
  'lastIncorrectAt',
  'nextDueAt',
  'statusChangedAt',
  'statusSource',
]

/**
 * 内容指纹：字段值拼串（用于 updatedAt 相等时的兜底比较）。
 * @param {object} rec
 * @returns {string}
 */
export function fingerprint(rec) {
  if (!rec || typeof rec !== 'object') return ''
  return FINGERPRINT_FIELDS.map((k) => String(rec[k] ?? '')).join('|')
}

/**
 * 取记录的更新时间戳（毫秒）；缺失 / 非法一律视为 0（旧数据 → 云端胜出）。
 * @param {object} rec
 * @returns {number}
 */
export function updatedAtMs(rec) {
  const v = rec && rec.updatedAt
  if (!v) return 0
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : 0
}

/**
 * 合并单条记录。
 * @param {object|null|undefined} local
 * @param {object|null|undefined} remote
 * @returns {{ record: object|null, winner: 'local'|'remote'|'none' }}
 */
export function mergeRecord(local, remote) {
  if (!local && !remote) return { record: null, winner: 'none' }
  if (local && !remote) return { record: { ...local }, winner: 'local' }
  if (!local && remote) return { record: { ...remote }, winner: 'remote' }

  const lt = updatedAtMs(local)
  const rt = updatedAtMs(remote)
  if (lt > rt) return { record: { ...local }, winner: 'local' }
  if (rt > lt) return { record: { ...remote }, winner: 'remote' }
  // 时间戳相等：指纹不同则取云端（服务端权威）
  if (fingerprint(local) !== fingerprint(remote)) return { record: { ...remote }, winner: 'remote' }
  // 完全一致：保留本地（带上云端的 updatedAt，保证本地也有时间戳可用于下次比较）
  return { record: { ...local, updatedAt: remote.updatedAt || local.updatedAt }, winner: 'local' }
}

/**
 * 全量合并。
 *
 * @param {Record<string, object>} local   wordKey -> 本地记录
 * @param {Record<string, object>} remote  wordKey -> 云端记录
 * @returns {{
 *   merged: Record<string, object>,
 *   toPush: Array<{wordKey: string, record: object}>,
 *   toLocal: string[],
 *   stats: { localOnly: number, remoteOnly: number, conflictLocal: number, conflictRemote: number }
 * }}
 */
export function mergeAll(local = {}, remote = {}) {
  const merged = {}
  const toPush = []
  const toLocal = []
  const stats = { localOnly: 0, remoteOnly: 0, conflictLocal: 0, conflictRemote: 0 }

  const keys = new Set([...Object.keys(local || {}), ...Object.keys(remote || {})])
  keys.forEach((key) => {
    const l = local[key]
    const r = remote[key]
    const { record, winner } = mergeRecord(l, r)
    if (!record) return
    merged[key] = record
    if (!r) {
      stats.localOnly += 1
      toPush.push({ wordKey: key, record })
    } else if (!l) {
      stats.remoteOnly += 1
      toLocal.push(key)
    } else if (winner === 'local') {
      stats.conflictLocal += 1
      toPush.push({ wordKey: key, record })
    } else {
      stats.conflictRemote += 1
      toLocal.push(key)
    }
  })

  return { merged, toPush, toLocal, stats }
}

/**
 * 云端行 → 本地记录（补齐 updatedAt 缺省）。
 * @param {Record<string, object>} rows wordKey -> learnRecordFromRow 的结果
 * @returns {Record<string, object>}
 */
export function remoteToLocalMap(rows = {}) {
  const out = {}
  Object.keys(rows || {}).forEach((k) => {
    out[k] = { ...rows[k] }
  })
  return out
}

// ---------------------------------------------------------------- 上行白名单
//
// 下面四个是**纯函数**，与 mergeAll 完全解耦（mergeRecord / mergeAll 逻辑一行未改，
// 红线「裁决口径不变」保持）。它们把「哪些记录允许上行」这件事单点收敛到一处，
// 避免每个调用点各写一套判据而漂移。

/** 永不上行的 statusSource：v1→v2 迁移的继承集合（3 万条历史存量） */
export const NON_UPLOADABLE_SOURCE = 'migration'

/**
 * 这条记录是否允许上行云端。
 *
 * 规则：`statusSource !== 'migration'`。
 * - 真实学习证据（learning / manual-*）必须跨设备延续 → 上行；
 * - 继承记录（migration）是**本机按词频表推导的默认值**，不是学习证据：
 *   上行会让 3 万条继承记录灌进云端 learn_records，而且它们在别的设备上会与
 *   别的账号/别的继承开关打架。它们本地照常计入统计与词汇量预测。
 *
 * @param {object} rec
 * @returns {boolean}
 */
export function isUploadableRecord(rec) {
  if (!rec || typeof rec !== 'object') return false
  return rec.statusSource !== NON_UPLOADABLE_SOURCE
}

/**
 * 从 record 映射里剔除不可上行的行。
 * @param {Record<string, object>} map
 * @returns {Record<string, object>} 新对象（不改入参）
 */
export function filterUploadable(map) {
  const out = {}
  Object.keys(map || {}).forEach((k) => {
    if (isUploadableRecord(map[k])) out[k] = map[k]
  })
  return out
}

/**
 * 从 toPush 行数组里剔除不可上行的行。
 * 行形状 `{ wordKey, record }`。
 * @param {Array<{wordKey: string, record: object}>} rows
 * @returns {Array<{wordKey: string, record: object}>}
 */
export function filterUploadableRows(rows) {
  return (rows || []).filter((r) => r && r.wordKey && isUploadableRecord(r.record))
}

/**
 * 上行前的时间戳兜底：`updatedAt || statusChangedAt || lastStudiedAt || now`。
 *
 * 为什么需要（设计 A-5）：老版本客户端在游客态写过记录但没打 updatedAt，
 * 且本地已被清过 —— 这些行若原样上行，服务端 `learnRecordToRow` 会用 now 兜底，
 * 反而把它们标成「刚改过」，可能盖掉另一台设备上更新的数据。这里在**上行前**
 * 补一个可解释的时间戳，宁可取一个偏旧但真实的时间。
 *
 * @param {Array<{wordKey: string, record: object}>} rows
 * @param {string} [now] ISO 时间；缺省 new Date()
 * @returns {Array<{wordKey: string, record: object}>} 新数组 / 新 record，不改入参
 */
export function stampRowsForUpload(rows, now = null) {
  const fallback = now || new Date().toISOString()
  return (rows || [])
    .filter((r) => r && r.wordKey && r.record && typeof r.record === 'object')
    .map((r) => {
      const rec = r.record
      const ts = rec.updatedAt || rec.statusChangedAt || rec.lastStudiedAt || fallback
      if (rec.updatedAt === ts) return r
      return { wordKey: r.wordKey, record: { ...rec, updatedAt: ts } }
    })
}

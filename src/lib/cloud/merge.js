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

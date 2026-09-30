/**
 * 学习进度上行 / 下行
 * ------------------------------------------------------------------
 * 下行：增量拉取 `updated_at > lastSyncAt`
 * 上行：dirty 记录批量 upsert（on conflict (owner_id, word_key)），每批 ≤30
 *
 * ★ 红线 ★
 *   - 不引入任何 SRS 字段（ease / interval / lapses / reps），
 *     schema.learnRecordToRow() 里有断言兜底。
 */
import { supabase } from '../supabase.js'
import { TABLES, learnRecordFromRow, learnRecordToRow } from './schema.js'
import { withSyncLock } from './syncLock.js'

/** 单批上限（PostgREST URL 长度与事务大小的折中） */
export const BATCH = 100

function guard() {
  if (!supabase) {
    return { code: 'NO_SUPABASE', message: '未配置 Supabase，云端同步不可用' }
  }
  return null
}

/**
 * 拉取云端增量。
 *
 * @param {string} ownerId
 * @param {string|null} lastSyncAt ISO 时间；null 表示全量（首次登录迁移）
 * @returns {Promise<{data: {rows: Record<string, object>, maxUpdatedAt: string|null}|null, error: object|null}>}
 */
export async function pullSince(ownerId, lastSyncAt = null) {
  return withSyncLock(async () => {
    const g = guard()
    if (g) return { data: null, error: g }
    let query = supabase
      .from(TABLES.learnRecords)
      .select('*')
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: true })
    if (lastSyncAt) query = query.gt('updated_at', lastSyncAt)

    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 30000)
    try {
      const { data, error } = await query.abortSignal(ac.signal)
      if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }

      const rows = {}
      let maxUpdatedAt = null
      ;(data || []).forEach((r) => {
        rows[r.word_key] = learnRecordFromRow(r)
        if (!maxUpdatedAt || (r.updated_at && r.updated_at > maxUpdatedAt)) maxUpdatedAt = r.updated_at
      })
      return { data: { rows, maxUpdatedAt }, error: null }
    } catch (e) {
      if (ac.signal.aborted) {
        return { data: null, error: { code: 'TIMEOUT', message: '下行超时（30s）' } }
      }
      return { data: null, error: { code: e?.code || 'INTERNAL', message: e?.message || '网络异常' } }
    } finally {
      clearTimeout(timer)
    }
  }, 'learn-pull')
}

/**
 * 上行一批记录（幂等 upsert）。
 *
 * @param {string} ownerId
 * @param {Array<{wordKey: string, record: object}>} rows
 * @returns {Promise<{data: {pushed: number}|null, error: object|null}>}
 */
export async function pushBatch(ownerId, rows) {
  return withSyncLock(async () => {
    const g = guard()
    if (g) return { data: null, error: g }
    const list = (rows || []).filter((r) => r && r.wordKey && r.record)
    if (list.length === 0) return { data: { pushed: 0 }, error: null }

    let pushed = 0
    for (let i = 0; i < list.length; i += BATCH) {
      const slice = list.slice(i, i + BATCH).map((r) => learnRecordToRow(r.record, ownerId, r.wordKey))
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), 30000)
      try {
        const { error } = await supabase
          .from(TABLES.learnRecords)
          .upsert(slice, { onConflict: 'owner_id,word_key' })
          .abortSignal(ac.signal)
        if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
        pushed += slice.length
      } catch (e) {
        if (ac.signal.aborted) {
          return { data: null, error: { code: 'TIMEOUT', message: '上行超时（30s）' } }
        }
        return { data: null, error: { code: e?.code || 'INTERNAL', message: e?.message || '网络异常' } }
      } finally {
        clearTimeout(timer)
      }
    }
    return { data: { pushed }, error: null }
  }, 'learn-push')
}

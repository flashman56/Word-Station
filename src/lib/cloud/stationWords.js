/**
 * 小站词条：加词 / 删词 / 改笔记 / 批量 upsert
 * ------------------------------------------------------------------
 * 红线（公共库只读）：命中公共库的词只存 **引用**（word_key = 'w.<slug>'，source='public'），
 * 绝不复制词条、绝不覆盖公共库；用户只能追加 note。
 *
 * 幂等：所有写入都用 upsert + onConflict，离线补传可重复执行。
 */
import { supabase } from '../supabase.js'
import { TABLES, stationWordFromRow } from './schema.js'

function guard() {
  if (!supabase) {
    return { code: 'NO_SUPABASE', message: '未配置 Supabase，云端功能不可用' }
  }
  return null
}

/**
 * 小站词条列表。
 * @param {string} stationId
 * @returns {Promise<{data: object[]|null, error: object|null}>}
 */
export async function listByStation(stationId) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { data, error } = await supabase
    .from(TABLES.stationWords)
    .select('*')
    .eq('station_id', stationId)
    .order('added_at', { ascending: false })
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: (data || []).map(stationWordFromRow), error: null }
}

/**
 * 批量加词（命中公共库的引用行）。
 *
 * @param {string} ownerId
 * @param {string} stationId
 * @param {Array<{wordKey: string, source?: 'public'|'user', note?: string|null}>} items
 * @returns {Promise<{data: {inserted: number, skipped: number}|null, error: object|null}>}
 */
export async function addMany(ownerId, stationId, items) {
  const g = guard()
  if (g) return { data: null, error: g }
  const rows = (items || [])
    .filter((it) => it && it.wordKey)
    .map((it) => ({
      station_id: stationId,
      owner_id: ownerId,
      word_key: it.wordKey,
      source: it.source === 'user' ? 'user' : 'public',
      note: it.note ?? null,
      updated_at: new Date().toISOString(),
    }))
  if (rows.length === 0) return { data: { inserted: 0, skipped: 0 }, error: null }

  // ignoreDuplicates: true → 站内已有的词直接跳过，返回行数即新增数
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 15000)
  try {
    const { data, error } = await supabase
      .from(TABLES.stationWords)
      .upsert(rows, { onConflict: 'station_id,word_key', ignoreDuplicates: true })
      .select('id')
      .abortSignal(ac.signal)
    if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
    const inserted = (data || []).length
    return { data: { inserted, skipped: rows.length - inserted }, error: null }
  } catch (e) {
    if (ac.signal.aborted) {
      return {
        data: null,
        error: { code: 'TIMEOUT', message: '写入小站超时（15s），已转入离线队列稍后重试' },
      }
    }
    return { data: null, error: { code: e?.code || 'INTERNAL', message: e?.message || '网络异常' } }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 删除小站内的一个词（不删私有词条本身）。
 * @param {string} stationId
 * @param {string} wordKey
 * @returns {Promise<{data: null, error: object|null}>}
 */
export async function remove(stationId, wordKey) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { error } = await supabase
    .from(TABLES.stationWords)
    .delete()
    .match({ station_id: stationId, word_key: wordKey })
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: null, error: null }
}

/**
 * 改个人笔记（公共词也允许加，PRD §5）。
 * @param {string} stationId
 * @param {string} wordKey
 * @param {string|null} note
 * @returns {Promise<{data: null, error: object|null}>}
 */
export async function updateNote(stationId, wordKey, note) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { error } = await supabase
    .from(TABLES.stationWords)
    .update({ note: note == null || note === '' ? null : String(note), updated_at: new Date().toISOString() })
    .match({ station_id: stationId, word_key: wordKey })
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: null, error: null }
}

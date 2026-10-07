/**
 * 小站 CRUD（数据访问层）
 * ------------------------------------------------------------------
 * 所有方法返回 `{ data, error }`，error 恒为 `{ code, message }` 或 null。
 * 组件层禁止直接使用 supabase.from(...)。
 */
import { supabase } from '../supabase.js'
import { TABLES, stationFromRow } from './schema.js'

const ORDER = { column: 'pinned', ascending: false }

function guard() {
  if (!supabase) {
    return { code: 'NO_SUPABASE', message: '未配置 Supabase（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY），云端功能不可用' }
  }
  return null
}

/**
 * 当前用户的小站列表（置顶优先，其次按更新时间倒序）。
 * @param {string} ownerId
 * @returns {Promise<{data: object[]|null, error: object|null}>}
 */
export async function list(ownerId) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { data, error } = await supabase
    .from(TABLES.stations)
    .select('*')
    .eq('owner_id', ownerId)
    .order(ORDER.column, { ascending: ORDER.ascending })
    .order('updated_at', { ascending: false })
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: (data || []).map(stationFromRow), error: null }
}

/**
 * 新建小站。重名会撞唯一索引 (owner_id, lower(btrim(name)))。
 * @param {string} ownerId
 * @param {string} name
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function create(ownerId, name) {
  const g = guard()
  if (g) return { data: null, error: g }
  const clean = String(name ?? '').trim()
  if (!clean) return { data: null, error: { code: 'BAD_REQUEST', message: '小站名不能为空' } }
  if (clean.length > 40) return { data: null, error: { code: 'BAD_REQUEST', message: '小站名不能超过 40 字符' } }

  const { data, error } = await supabase
    .from(TABLES.stations)
    .insert({ owner_id: ownerId, name: clean })
    .select()
    .single()
  if (error) {
    const dup = String(error.code) === '23505'
    return {
      data: null,
      error: { code: dup ? 'DUPLICATE_NAME' : error.code || 'INTERNAL', message: dup ? `已存在同名小站「${clean}」` : error.message },
    }
  }
  return { data: stationFromRow(data), error: null }
}

/**
 * 改名 / 置顶。
 * @param {string} id
 * @param {{name?: string, pinned?: boolean}} patch
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function update(id, patch = {}) {
  const g = guard()
  if (g) return { data: null, error: g }
  const row = { updated_at: new Date().toISOString() }
  if (typeof patch.name === 'string') row.name = patch.name.trim()
  if (typeof patch.pinned === 'boolean') row.pinned = patch.pinned
  const { data, error } = await supabase.from(TABLES.stations).update(row).eq('id', id).select().single()
  if (error) {
    const dup = String(error.code) === '23505'
    return {
      data: null,
      error: { code: dup ? 'DUPLICATE_NAME' : error.code || 'INTERNAL', message: dup ? '已存在同名小站' : error.message },
    }
  }
  return { data: stationFromRow(data), error: null }
}

/**
 * upsert 一条小站（离线补传用：客户端生成的 uuid 做幂等键）。
 * @param {object} station 含 id / ownerId / name / pinned / createdAt
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function upsert(station) {
  const g = guard()
  if (g) return { data: null, error: g }
  if (!station || !station.id || !station.ownerId) {
    return { data: null, error: { code: 'BAD_REQUEST', message: '小站缺少 id / ownerId' } }
  }
  const { data, error } = await supabase
    .from(TABLES.stations)
    .upsert(
      {
        id: station.id,
        owner_id: station.ownerId,
        name: station.name,
        pinned: Boolean(station.pinned),
        created_at: station.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single()
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: stationFromRow(data), error: null }
}

/**
 * 删除小站（station_words 由外键级联删除）。
 * @param {string} id
 * @returns {Promise<{data: null, error: object|null}>}
 */
export async function remove(id) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { error } = await supabase.from(TABLES.stations).delete().eq('id', id)
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: null, error: null }
}

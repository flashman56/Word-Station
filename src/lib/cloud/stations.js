/**
 * 小站 CRUD（数据访问层）
 * ------------------------------------------------------------------
 * 所有方法返回 `{ data, error }`，error 恒为 `{ code, message }` 或 null。
 * 组件层禁止直接使用 supabase.from(...)。
 */
import { supabase } from '../supabase.js'
import { TABLES, stationFromRow } from './schema.js'

const ORDER = { column: 'pinned', ascending: false }

/**
 * 生成一个小站 id（离线建站用；客户端生成才能当幂等键）。
 *
 * ★ 为什么必须带兜底（M4①）★
 *   `crypto.randomUUID` **只在安全上下文可用**：https、localhost、以及
 *   127.0.0.1。局域网 `http://192.168.x.x` 直连开发时 `crypto` 可能整个不存在
 *   或没有 randomUUID —— 那一行会直接抛 TypeError，于是「断网建站」这条
 *   本来只在离线才走的路径，在内网开发时反而变成必崩。
 *
 * ★ 兜底为什么必须是 uuid 形状而不是随便拼一个随机串 ★
 *   `stations.id` 的列类型是 uuid。Postgres 接受
 *   `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` 形式的字面量，但会拒绝
 *   `s-1699-abcd`。所以兜底也必须凑出 v4 的形状（8-4-4-4-12 + 版本位 + variant 位）。
 *
 * @returns {string} 合法 uuid 字面量
 */
export function newStationId() {
  const g = typeof globalThis !== 'undefined' ? globalThis : {}
  const c = g.crypto || null

  // ---- 主路径 ----
  if (c && typeof c.randomUUID === 'function') {
    try {
      return c.randomUUID()
    } catch {
      /* 非安全上下文下个别实现会抛，走兜底 */
    }
  }

  // ---- 兜底 1：crypto.getRandomValues（也是原生，同样不需要 npm 包）----
  const bytes = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes)
  } else {
    // 连 crypto 都没有（极老的浏览器 / 某些内嵌 WebView）
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  // v4：版本位 0100 << 4，variant 位 10xx
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = []
  for (let i = 0; i < 16; i += 1) hex.push(bytes[i].toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

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

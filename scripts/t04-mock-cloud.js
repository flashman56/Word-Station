/**
 * T04 的 cloud 侧替身（由 test-private-words-ui.mjs 通过 esbuild 插件注入）
 *
 * 只实现被测组件真正用到的那几个出口，其余给最小可用桩。
 * 真模块会 import supabase 客户端 —— 在 jsdom 里会真发网络请求，
 * 所以必须替换（而不是靠「恰好请求失败」来断言）。
 */

const state = {
  removeError: null,
  addManyResult: { inserted: 1, skipped: 0, error: null },
  createResult: null,
  createError: null,
  calls: {
    // userWords
    remove: [],
    patch: [],
    listMine: 0,
    onRefresh: 0,
    // stationWords
    stationWordsRemove: [],
    addMany: [],
    // stations
    createStation: [],
    // offline
    enqueue: [],
  },
}

/** 让 stationWordsApi.remove 返回错误（B 组的失败路径） */
export function __setRemoveError(e) {
  state.removeError = e || null
}
/** 让 stationWordsApi.addMany 返回指定结果（C 组的 inserted/skipped 口径） */
export function __setAddMany(v) {
  state.addManyResult = v || { inserted: 0, skipped: 0, error: null }
}
/** 让 stationsApi.create 返回指定的小站（零小站引导新建用） */
export function __setCreateResult(v) {
  state.createResult = v || null
}

export function __resetCalls() {
  state.calls = {
    remove: [],
    patch: [],
    listMine: 0,
    onRefresh: 0,
    stationWordsRemove: [],
    addMany: [],
    createStation: [],
    enqueue: [],
  }
  state.removeError = null
  state.addManyResult = { inserted: 1, skipped: 0, error: null }
  state.createResult = null
}
export function getCalls() {
  return state.calls
}

// ---------------------------------------------------------------- userWords

/**
 * 彻底删除私有词：★ 记录调用 ★
 * 真实行为（lib/cloud/userWords.js 的 remove）是两件事：
 *   ① delete station_words where owner_id + word_key（所有小站的引用）
 *   ② delete user_words where id
 * 所以这里必须把三个参数都记下来供断言 —— 少传 wordKey 就只会删词条、
 * 留下各小站里的孤儿引用行。
 */
export async function remove(ownerId, id, wordKey) {
  state.calls.remove.push({ ownerId, id, wordKey })
  if (state.removeError) return { data: null, error: state.removeError }
  return { data: null, error: null }
}

export async function patch(id, p) {
  state.calls.patch.push({ id, patch: { ...p } })
  return { data: null, error: null }
}

export async function listMine() {
  state.calls.listMine += 1
  return { data: [], error: null }
}

export async function listByKeys() {
  return { data: [], error: null }
}

// 注意：stations.js 与 userWords.js 都导出 upsert，而 esbuild 把两者映射到同一个
// 替身文件 —— ESM 不允许同名导出，所以这里只留一个 upsert（行为对本用例无差别：
// 本面板不碰它）。
export async function upsert() {
  return { data: null, error: null }
}

// ---------------------------------------------------------------- generate

export async function generate() {
  return { results: [], error: null }
}
export async function retry() {
  return { data: null, error: { code: 'INTERNAL', message: '未启用' } }
}

// ---------------------------------------------------------------- offline（最小桩）

export const DRAIN_ORDER = ['generate', 'stationWords', 'learn', 'stations']
export function enqueue(kind, payload, scope) {
  state.calls.enqueue.push({ kind, payload: JSON.parse(JSON.stringify(payload)), scope })
  return state.calls.enqueue.length
}
export function __resetEnqueue() {
  state.calls.enqueue = []
}
export function pendingCount() {
  return 0
}
export function stuckCount() {
  return 0
}
export function pendingByKind() {
  return { generate: 0, stationWords: 0, learn: 0, stations: 0 }
}
export function readDrafts() {
  return { generate: [], stationWords: [], learn: [], stations: [] }
}
export function clearKind() {}
export function clearStuck() {
  return 0
}
export function isOffline() {
  return false
}
export function isPermanentError() {
  return false
}
export function onPendingChange() {
  return () => {}
}
export function notifyPendingChanged() {}
export function readDiscarded() {
  return { at: null, entries: [] }
}
export function moveToDiscarded() {
  return {}
}
export function hashUid() {
  return ''
}
export async function drain() {
  return { ok: true, pushed: 0, failed: 0, discarded: 0, parked: 0 }
}
export function claim() {
  return { ok: true }
}

// ---------------------------------------------------------------- stationWords / stations（最小桩）

export async function addMany(ownerId, stationId, items) {
  state.calls.addMany.push({ ownerId, stationId, items: (items || []).map((i) => ({ ...i })) })
  return { data: { inserted: state.addManyResult.inserted, skipped: state.addManyResult.skipped }, error: state.addManyResult.error }
}
export async function listByStation() {
  return { data: [], error: null }
}
/**
 * ★ 只删 station_words 的一行引用（与 userWords.remove 语义相反，必须能区分）★
 *
 * stationWords.js 与 userWords.js **都导出 remove**，而 esbuild 把两者映射到同一个
 * 替身文件 —— ESM 不允许同名导出，所以这里只保留 userWords 语义的 remove，
 * stationWords 的删除由 t05-probe-entry.jsx 直接调用本函数的别名
 * `removeStationWordRef`（它同样在本模块内，不是另一份实现）。
 */
export async function removeStationWordRef(stationId, wordKey) {
  state.calls.stationWordsRemove.push({ stationId, wordKey })
  if (state.removeError) return { data: null, error: state.removeError }
  return { data: null, error: null }
}
export async function updateNote() {
  return { data: null, error: null }
}
export async function list() {
  return { data: [], error: null }
}
export async function create(ownerId, name) {
  state.calls.createStation.push(name)
  if (state.createResult) return { data: state.createResult, error: null }
  return { data: { id: 'station-created', name, pinned: false }, error: null }
}
export async function update() {
  return { data: null, error: null }
}
export async function removeStation() {
  return { data: null, error: null }
}
export function newStationId() {
  return '00000000-0000-4000-8000-000000000000'
}

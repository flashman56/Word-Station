/**
 * 两个云出口的测试替身（由 test-a01-words.mjs 通过 esbuild 插件注入）
 *
 * 记录每次调用，让测试能断言「真的只写了该写的、真的调了几次」——
 * A-01 的失败模式是「两个 if 都不进、一次请求都没发」，只断言 UI 文案
 * 会漏掉这种「什么都没发生」的假成功。
 */

const state = {
  /** addMany 的返回值 */
  addMany: { inserted: 0, skipped: 0, error: null },
  /** generate 的返回值 */
  generate: { results: [], error: null },
  calls: { addMany: [], generate: [], enqueue: [] },
}

export function __setAddMany(v) {
  state.addMany = v
}
export function __setGenerate(v) {
  state.generate = v
}
export function __getCalls() {
  return state.calls
}
export function __resetCalls() {
  state.calls = { addMany: [], generate: [], enqueue: [] }
}

// ---------------------------------------------------------------- stationWords

export async function addMany(ownerId, stationId, items) {
  state.calls.addMany.push({ ownerId, stationId, items: (items || []).map((i) => ({ ...i })) })
  return state.addMany
}

export async function listByStation() {
  return { data: [], error: null }
}

export async function remove() {
  return { data: null, error: null }
}

export async function updateNote() {
  return { data: null, error: null }
}

// ---------------------------------------------------------------- generate

export async function generate(forms, stationId, onProgress) {
  state.calls.generate.push({ forms: (forms || []).slice(), stationId })
  if (onProgress) onProgress({ phase: 'generate', done: 0, total: (forms || []).length })
  return state.generate
}

export async function retry() {
  return state.generate
}

// ---------------------------------------------------------------- offline（只记录入队）

export const DRAIN_ORDER = ['generate', 'stationWords', 'learn', 'stations']

export function enqueue(kind, payload, scope) {
  state.calls.enqueue.push({ kind, payload: JSON.parse(JSON.stringify(payload)), scope })
  return 1
}
export function pendingCount() {
  return state.calls.enqueue.length
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

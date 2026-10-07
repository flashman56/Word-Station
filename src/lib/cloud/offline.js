/**
 * 离线草稿队列（wrc.drafts.v1）
 * ------------------------------------------------------------------
 * 断网判定：navigator.onLine === false **或** 请求抛网络错（不只看 onLine）。
 * 容器：单一 key `wrc.drafts.v1` = { generate: [], stationWords: [], learn: [], stations: [] }
 * 补传顺序固定：generate → stationWords → learn → stations；逐条成功后逐条移除。
 * 幂等：所有上行都是 upsert（冲突键见各 API）。
 */
import * as stationWordsApi from './stationWords.js'
import * as stationsApi from './stations.js'
import * as generateApi from './generate.js'
import * as learnSyncApi from './learnSync.js'

export const DRAFTS_KEY = 'wrc.drafts.v1'
/** 补传顺序（generate 必须先于 stationWords：要先拿到 word_key 才能进小站） */
export const DRAIN_ORDER = ['generate', 'stationWords', 'learn', 'stations']

const EMPTY = { generate: [], stationWords: [], learn: [], stations: [] }

/** pending 计数变化订阅（SyncBadge 等 UI 用） */
const pendingListeners = new Set()

/**
 * 订阅 pending 计数变化。
 * @param {() => void} fn
 * @returns {() => void} 取消订阅
 */
export function onPendingChange(fn) {
  pendingListeners.add(fn)
  return () => pendingListeners.delete(fn)
}

/** 通知所有订阅者刷新 pending（入队 / 补传后调用） */
export function notifyPendingChanged() {
  pendingListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore */
    }
  })
}

function read() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...(parsed && typeof parsed === 'object' ? parsed : {}) }
  } catch {
    return { ...EMPTY }
  }
}

function write(drafts) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch {
    /* 隐私模式写入失败忽略 */
  }
}

/**
 * 入队一条草稿。
 * @param {'generate'|'stationWords'|'learn'|'stations'} kind
 * @param {object} payload
 * @returns {number} 入队后该 kind 的条数
 */
export function enqueue(kind, payload) {
  if (!DRAIN_ORDER.includes(kind)) return 0
  const drafts = read()
  drafts[kind] = drafts[kind] || []
  drafts[kind].push({ ...payload, queuedAt: new Date().toISOString() })
  write(drafts)
  notifyPendingChanged()
  return drafts[kind].length
}

/** 待同步总条数 */
export function pendingCount() {
  const drafts = read()
  return DRAIN_ORDER.reduce((n, k) => n + (drafts[k]?.length || 0), 0)
}

/** 各 kind 的待同步条数 */
export function pendingByKind() {
  const drafts = read()
  const out = {}
  DRAIN_ORDER.forEach((k) => {
    out[k] = drafts[k]?.length || 0
  })
  return out
}

/** 读取全部草稿（调试 / UI 用） */
export function readDrafts() {
  return read()
}

/** 清空某类草稿 */
export function clearKind(kind) {
  const drafts = read()
  drafts[kind] = []
  write(drafts)
}

/**
 * 移除某类的前 n 条（逐条移除，避免中途失败丢整批）。
 * @param {string} kind
 * @param {number} n
 */
function dropFirst(kind, n) {
  const drafts = read()
  drafts[kind] = (drafts[kind] || []).slice(n)
  write(drafts)
}

/** 是否在离线状态 */
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/**
 * 补传编排。
 *
 * @param {object} [opts]
 * @param {boolean} [opts.force] 忽略 navigator.onLine（手动点「立即同步」时用）
 * @param {(info: {kind: string, done: number, total: number}) => void} [opts.onProgress]
 * @returns {Promise<{ok: boolean, pushed: number, failed: number, skippedOffline: boolean}>}
 */
export async function drain({ force = false, onProgress = null } = {}) {
  if (!force && isOffline()) return { ok: true, pushed: 0, failed: 0, skippedOffline: true }

  let pushed = 0
  let failed = 0

  for (const kind of DRAIN_ORDER) {
    const drafts = read()
    const queue = drafts[kind] || []
    if (queue.length === 0) continue

    let done = 0
    for (const item of queue) {
      let ok = false
      try {
        ok = await pushOne(kind, item)
      } catch {
        ok = false
      }
      if (ok) {
        dropFirst(kind, 1)
        pushed += 1
        done += 1
        notifyPendingChanged()
        if (onProgress) onProgress({ kind, done, total: queue.length })
      } else {
        // 单条失败：保留在队列（不丢），本 kind 中断，等下一轮
        failed += 1
        break
      }
    }
  }

  return { ok: failed === 0, pushed, failed, skippedOffline: false }
}

/**
 * 推送单条草稿（全部幂等）。
 * @param {string} kind
 * @param {object} item
 * @returns {Promise<boolean>}
 */
async function pushOne(kind, item) {
  if (kind === 'stationWords') {
    const { ownerId, stationId, items } = item
    if (!ownerId || !stationId || !Array.isArray(items)) return true // 结构损坏：丢弃
    const { error } = await stationWordsApi.addMany(ownerId, stationId, items)
    return !error
  }
  if (kind === 'generate') {
    const { stationId, forms } = item
    if (!Array.isArray(forms) || forms.length === 0) return true
    const { error } = await generateApi.generate(forms, stationId || null)
    return !error
  }
  if (kind === 'learn') {
    const { ownerId, rows } = item
    if (!ownerId || !Array.isArray(rows)) return true
    const { error } = await learnSyncApi.pushBatch(ownerId, rows)
    return !error
  }
  if (kind === 'stations') {
    // 小站 CRUD 离线补传：用客户端生成的 uuid 做幂等键，重复执行只会覆盖同一行
    const { row } = item
    if (!row || !row.id || !row.ownerId) return true
    const { error } = await stationsApi.upsert(row)
    return !error
  }
  return true
}

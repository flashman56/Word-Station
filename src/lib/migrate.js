/**
 * v1（手工标注字符串）→ v2（学习记录对象）迁移
 * ------------------------------------------------------------------
 * 两条铁律：
 *   1. 旧 key `wrc.status.v1` 原样保留，只读、永不写入、永不删除。
 *   2. 迁移要么完整成功，要么一个 v2 key 都不写 —— 绝不产生半份记录。
 *
 * 迁移不伪造答题历史：所有计数从 0 起，只有"继承为 known"为满足不变量把
 * consecutiveCorrect 置为 MASTER_THRESHOLD。
 */
import {
  LEARN_STORE_VERSION,
  MASTER_THRESHOLD,
  emptyRecord,
  countByStatus,
  validateRecords,
} from './learning.js'
import { AUTO_KNOWN_RANK } from './derive.js'

// ---------------------------------------------------------------- key 约定

export const KEYS = {
  learn: 'wrc.learn.v2',
  settings: 'wrc.settings.v2',
  statusV1: 'wrc.status.v1',
  statusV1Backup: 'wrc.status.v1.backup',
  settingsV1: 'wrc.settings.v1',
  settingsV1Backup: 'wrc.settings.v1.backup',
  migration: 'wrc.migration.v2',
  // ---- 云端同步新增（旧 key 一律不动）----
  drafts: 'wrc.drafts.v1',
  sync: 'wrc.sync.v1',
  cloudMigration: 'wrc.migration.cloud',
}

const V1_STATUS = ['known', 'review', 'new']

// ---------------------------------------------------------------- 存储读写

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const parsed = JSON.parse(raw)
    return parsed == null ? fallback : parsed
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function hasKey(key) {
  try {
    return localStorage.getItem(key) != null
  } catch {
    return false
  }
}

/** 读 v2 主存储，只取 records（结构异常时退化为空对象，不让 UI 崩） */
export function readLearn() {
  const raw = readJSON(KEYS.learn, null)
  if (!raw || typeof raw !== 'object') return {}
  return raw.records && typeof raw.records === 'object' ? raw.records : {}
}

/** 读 v2 设置（含 inheritFreqKnown 迁移开关） */
export function readSettingsV2() {
  return typeof localStorage === 'undefined' ? {} : readJSON(KEYS.settings, {})
}

/** 写 v2 主存储（版本号由 LEARN_STORE_VERSION 统一） */
export function writeLearn(records) {
  writeJSON(KEYS.learn, { version: LEARN_STORE_VERSION, records })
}

// ---------------------------------------------------------------- 纯迁移

/**
 * 内存里的迁移映射（不碰存储，可直接单测）。
 *
 * @param {object}   args
 * @param {object}   args.legacyStatus      wrc.status.v1 的内容，形如 { 'w.inspect': 'review' }
 * @param {Word[]}   args.words             全量单词（countByStatus 内部会按 id 去重）
 * @param {boolean}  args.inheritFreqKnown  是否让高频无记录词继承为 known
 * @param {number}   args.freqRankLine      继承判定线，默认 AUTO_KNOWN_RANK
 * @param {string}   args.now               ISO 时间字符串
 * @returns {{ records: Object, report: { known, review, unknown, inheritedByFreq, migratedManual, dropped } }}
 */
export function migrateV1toV2({
  legacyStatus = {},
  words = [],
  inheritFreqKnown = true,
  freqRankLine = AUTO_KNOWN_RANK,
  now = null,
} = {}) {
  const legacy = legacyStatus && typeof legacyStatus === 'object' ? legacyStatus : {}
  const wordIds = new Set((words || []).map((w) => w && w.id))
  const records = {}

  let inheritedByFreq = 0
  let migratedManual = 0
  let dropped = 0

  // 1) 失效的 wordId（不在当前词库里）：不写入 v2，只留在备份里
  Object.keys(legacy).forEach((id) => {
    if (!wordIds.has(id)) dropped += 1
  })

  // 2) 逐词映射
  ;(words || []).forEach((w) => {
    if (!w) return
    if (records[w.id]) return // 同一个词重复出现（挂多个词素），只映射一次

    const manual = V1_STATUS.includes(legacy[w.id]) ? legacy[w.id] : null

    if (manual === 'known') {
      records[w.id] = {
        ...emptyRecord(),
        status: 'known',
        consecutiveCorrect: MASTER_THRESHOLD,
        statusChangedAt: now,
        statusSource: 'migration',
      }
      migratedManual += 1
      return
    }
    if (manual === 'review') {
      records[w.id] = {
        ...emptyRecord(),
        status: 'review',
        statusChangedAt: now,
        statusSource: 'migration',
      }
      migratedManual += 1
      return
    }
    if (manual === 'new') {
      // 手工 new === 默认 unknown，不预写空记录
      migratedManual += 1
      return
    }

    // 无手工记录：按词频继承（开关关闭则一律 unknown）
    if (inheritFreqKnown && typeof w.freqRank === 'number' && w.freqRank <= freqRankLine) {
      records[w.id] = {
        ...emptyRecord(),
        status: 'known',
        consecutiveCorrect: MASTER_THRESHOLD,
        statusChangedAt: now,
        statusSource: 'migration',
      }
      inheritedByFreq += 1
    }
  })

  const stats = countByStatus(words, records)
  return {
    records,
    report: {
      known: stats.known,
      review: stats.review,
      unknown: stats.unknown,
      inheritedByFreq,
      migratedManual,
      dropped,
    },
  }
}

// ---------------------------------------------------------------- 编排

/**
 * 读旧 → 迁移 → 写备份 → 写 v2 → 写标记。
 * 任一环节失败：回滚本次写入的 v2 key，返回 { ok: false, error }，继续用旧数据。
 *
 * @returns {{ ok: boolean, skipped?: boolean, report?: object, error?: string }}
 */
export function runMigration({ words = [], inheritFreqKnown = true, now } = {}) {
  const at = now || new Date().toISOString()

  if (typeof localStorage === 'undefined') {
    return { ok: false, error: '当前环境没有 localStorage，跳过迁移' }
  }

  // 幂等：已迁移过 / v2 已存在就直接跳过，绝不重跑
  const flag = readJSON(KEYS.migration, null)
  if (flag && flag.done === true) return { ok: true, skipped: true, report: flag.report }
  if (hasKey(KEYS.learn)) return { ok: true, skipped: true }

  try {
    const legacyStatus = readJSON(KEYS.statusV1, {})
    const legacySettings = readJSON(KEYS.settingsV1, {})

    // 1) 内存里生成 + 校验（不通过直接抛错，此时一个 key 都还没写）
    const { records, report } = migrateV1toV2({ legacyStatus, words, inheritFreqKnown, now: at })
    const check = validateRecords(records)
    if (!check.ok) throw new Error(`迁移结果校验失败：${check.errors.slice(0, 3).join('；')}`)

    // 2) 序列化 v2 载荷（先序列化再落盘，避免写一半时才发现 JSON 有问题）
    const learnPayload = JSON.stringify({ version: LEARN_STORE_VERSION, records })
    const settingsPayload = JSON.stringify({
      ...legacySettings,
      status: legacySettings.status === 'new' ? 'unknown' : legacySettings.status || 'all',
      inheritFreqKnown: Boolean(inheritFreqKnown),
    })
    const flagPayload = JSON.stringify({ done: true, at, report })

    // 3) 备份只写一次，永不删
    if (!hasKey(KEYS.statusV1Backup)) {
      writeJSON(KEYS.statusV1Backup, { ...legacyStatus, backedUpAt: at })
    }
    if (!hasKey(KEYS.settingsV1Backup)) {
      writeJSON(KEYS.settingsV1Backup, legacySettings)
    }

    // 4) 正式写入：v2 主存储 → v2 设置 → 迁移标记
    try {
      localStorage.setItem(KEYS.learn, learnPayload)
      localStorage.setItem(KEYS.settings, settingsPayload)
      localStorage.setItem(KEYS.migration, flagPayload)
    } catch (e) {
      removeKey(KEYS.learn)
      removeKey(KEYS.settings)
      removeKey(KEYS.migration)
      throw e
    }

    return { ok: true, skipped: false, report }
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
}

// ---------------------------------------------------------------- 云端同步辅助

/**
 * 读同步游标 `{ lastSyncAt }`。
 * @returns {{lastSyncAt: string|null}}
 */
export function readSync() {
  const raw = readJSON(KEYS.sync, null)
  if (!raw || typeof raw !== 'object') return { lastSyncAt: null }
  return { lastSyncAt: typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null }
}

/**
 * 写同步游标（只更新 lastSyncAt，其他字段保留）。
 * @param {string|null} lastSyncAt
 */
export function writeSync(lastSyncAt) {
  writeJSON(KEYS.sync, { ...readSync(), lastSyncAt })
}

/**
 * 读「是否已做过首次登录云端迁移」标记。
 * @returns {{done: boolean, at: string|null}}
 */
export function readCloudMigration() {
  const raw = readJSON(KEYS.cloudMigration, null)
  if (!raw || typeof raw !== 'object') return { done: false, at: null }
  return { done: raw.done === true, at: typeof raw.at === 'string' ? raw.at : null }
}

/** 写首次登录云端迁移标记（幂等：重复写无副作用） */
export function writeCloudMigration() {
  if (readCloudMigration().done) return
  writeJSON(KEYS.cloudMigration, { done: true, at: new Date().toISOString() })
}

/**
 * 导出本地 v2 记录（首次登录上传用）。
 * 调用前必须先跑 runMigration() 保证是 v2 口径；本函数不写任何 key。
 * @returns {Record<string, object>}
 */
export function exportLocalRecords() {
  return { ...readLearn() }
}

/** 供设置页「重跑迁移」使用：清掉 v2 与标记（备份不动），之后重新调用 runMigration */
export function clearMigration() {
  removeKey(KEYS.learn)
  removeKey(KEYS.settings)
  removeKey(KEYS.migration)
}

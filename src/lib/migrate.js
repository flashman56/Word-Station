/**
 * v1（手工标注字符串）→ v2（学习记录对象）迁移 + **全应用唯一的存储键访问器**
 * ------------------------------------------------------------------
 * 本文件是 `wrc.*` 键名的**唯一来源**。业务代码只传 `ownerId`（或 `scopeOf(ownerId)`
 * 的结果），永不接触 scope 字符串、更永不自己拼键。这条不变量由
 * `scripts/check-storage-keys.mjs`（npm run test:keys）机器保证：
 * 除本文件与 dict.js 的 IndexedDB 前缀白名单外，`src/**` 里出现任何
 * 分区键字面量（**含注释**）即判失败。
 *
 * 三条铁律：
 *   1. 旧键（无后缀，如 learn 主存储）**一律保留不删**，只被「首个领养者」幂等复制一份；
 *   2. `wrc.status.v1` 及其备份键原样保留，只读、永不写入、永不删除；
 *   3. 迁移要么完整成功，要么一个 v2 键都不写 —— 绝不产生半份记录。
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

// ---------------------------------------------------------------- scope 与键

/** 游客 scope 的字面量（非法 scope 一律回落到这里，绝不抛错） */
export const GUEST_SCOPE = 'guest'

/**
 * 归一化 scope：任何 falsy 或非字符串 → `'guest'`。
 * 绝不给业务层返回 `undefined` 键 —— 宁可退化成游客隔离，也不让整页崩。
 * @param {string|null|undefined} userId
 * @returns {string}
 */
export function normalizeScope(userId) {
  if (typeof userId !== 'string') return GUEST_SCOPE
  const trimmed = userId.trim()
  return trimmed === '' ? GUEST_SCOPE : trimmed
}

/**
 * scopeOf：业务层唯一入口。传 uid 或 null，拿到分区标识。
 * @param {string|null|undefined} userId
 * @returns {string} `'guest'` 或用户 uid
 */
export function scopeOf(userId) {
  return normalizeScope(userId)
}

/**
 * 旧键（无后缀）：**只读领养，永不删除**。
 * 这些是分区化之前的老客户端写入的键；升级后它们必须仍能在 DevTools 看到。
 */
export const LEGACY_KEYS = {
  learn: 'wrc.learn.v2',
  migration: 'wrc.migration.v2',
  sync: 'wrc.sync.v1',
  cloudMigration: 'wrc.migration.cloud',
  drafts: 'wrc.drafts.v1',
  stationCurrent: 'wrc.station.current',
}

/**
 * 冻结键：本次**不新增任何访问**（v1→v2 迁移的既有读取保持原样）。
 * R5 门禁保证它们不会被 writeJSON / removeKey 触达。
 */
export const FROZEN_KEYS = {
  statusV1: 'wrc.status.v1',
  statusV1Backup: 'wrc.status.v1.backup',
  settingsV1: 'wrc.settings.v1',
  settingsV1Backup: 'wrc.settings.v1.backup',
}

/**
 * KEYS：向后兼容的扁平视图（**仅限 migrate.js 内部与测试**）。
 * 业务代码请改用 `keysFor(scope)`。
 *
 * - 分区键（learn / prefs / migration / sync / cloudMigration / drafts /
 *   stationCurrent / userWordsCache）的实际键由 `keysFor(scope)` 生成；
 * - 设备级键（settings）与全局键（partition / draftsDiscarded）不分区。
 */
export const KEYS = {
  // 旧键（只读领养源）
  learn: LEGACY_KEYS.learn,
  migration: LEGACY_KEYS.migration,
  sync: LEGACY_KEYS.sync,
  cloudMigration: LEGACY_KEYS.cloudMigration,
  drafts: LEGACY_KEYS.drafts,
  stationCurrent: LEGACY_KEYS.stationCurrent,
  // 冻结键
  statusV1: FROZEN_KEYS.statusV1,
  statusV1Backup: FROZEN_KEYS.statusV1Backup,
  settingsV1: FROZEN_KEYS.settingsV1,
  settingsV1Backup: FROZEN_KEYS.settingsV1Backup,
  // 设备级 / 全局键
  settings: 'wrc.settings.v2',
  partition: 'wrc.partition.v1',
  draftsDiscarded: 'wrc.drafts.discarded',
}

/**
 * @typedef {Object} ScopeKeys
 * @property {string} scope
 * @property {string} learn            wrc.learn.v2:<scope>
 * @property {string} prefs           wrc.prefs.v1:<scope>
 * @property {string} migration       wrc.migration.v2:<scope>
 * @property {string} sync            wrc.sync.v1:<scope>
 * @property {string} cloudMigration  wrc.migration.cloud:<scope>
 * @property {string} drafts          wrc.drafts.v1:<scope>
 * @property {string} stationCurrent  wrc.station.current:<scope>
 * @property {string} userWordsCache  wrc.userwords.v1:<scope>
 * @property {string} settings        wrc.settings.v2            （设备级，不分区）
 * @property {string} partition       wrc.partition.v1           （全局升级标记）
 * @property {string} draftsDiscarded wrc.drafts.discarded       （全局丢弃日志）
 */

/**
 * 全应用唯一的存储键访问器。业务代码禁止自行拼接 'wrc.*'。
 * @param {string|null|undefined} scope scopeOf() 的结果；非法值回落 'guest'
 * @returns {ScopeKeys}
 */
export function keysFor(scope) {
  const sc = normalizeScope(scope)
  const suffix = `:${sc}`
  return {
    scope: sc,
    learn: `wrc.learn.v2${suffix}`,
    prefs: `wrc.prefs.v1${suffix}`,
    migration: `wrc.migration.v2${suffix}`,
    sync: `wrc.sync.v1${suffix}`,
    cloudMigration: `wrc.migration.cloud${suffix}`,
    drafts: `wrc.drafts.v1${suffix}`,
    stationCurrent: `wrc.station.current${suffix}`,
    userWordsCache: `wrc.userwords.v1${suffix}`,
    // 设备级 / 全局键：跨账号共享（难度档、词族成组、自动朗读本就与账号无关）
    settings: KEYS.settings,
    partition: KEYS.partition,
    draftsDiscarded: KEYS.draftsDiscarded,
  }
}

/** prefs 载荷缺省值 */
function emptyPrefs() {
  return { inheritFreqKnown: true, updatedAt: null }
}

/** partition 载荷缺省值 */
function emptyPartition() {
  return { v: 1, at: null, adopted: {} }
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

/** 环境是否有 localStorage（隐私模式 / SSR 一律视为无） */
function hasStorage() {
  return typeof localStorage !== 'undefined' && localStorage != null
}

// ---------------------------------------------------------------- 旧键升级

/**
 * 旧键 → 分区键的幂等升级（可重复调用）。
 *
 * 契约：
 *   1. 旧键一律保留不删；
 *   2. `adopted.X` 记录「哪个 scope 领养了旧 X 键」——**只允许第一个领养者**。
 *      第二个账号进来时不再复制 → 旧数据不会二次扩散到新账号（这是 GAP-3 的
 *      另一半防线：光靠 cloudMigration 分区键还不够，旧 learn 键若被每个账号
 *      各领养一次，A 的 500 条记录照样会出现在 B 的分区里）；
 *   3. 每步先 `hasKey` 判存在再写；任何一步失败只影响该键，不回滚已成功的键
 *      （升级是「锦上添花」，真正的主存储写入由 writeLearn 独立负责）；
 *   4. localStorage 不可写（隐私模式）→ 静默返回 `{ ok: false }`。
 *
 * @param {string} scope
 * @returns {{ ok: boolean, adopted: string[], skipped: boolean, error?: string }}
 */
export function ensurePartition(scope) {
  const sc = normalizeScope(scope)
  if (!hasStorage()) return { ok: false, adopted: [], skipped: true, error: 'no-local-storage' }

  const keys = keysFor(sc)
  let adopted = []
  try {
    const rawPartition = readJSON(keys.partition, null)
    const partition =
      rawPartition && typeof rawPartition === 'object'
        ? { ...emptyPartition(), ...rawPartition, adopted: { ...(rawPartition.adopted || {}) } }
        : emptyPartition()

    // 草稿的领养时机是「首次以某账号身份进入」；游客不领养（等人登录）。
    // 其余三类游客态即可领养（老用户清空 localStorage 登录后仍要拿回自己的进度）。
    const plan = [
      { name: 'learn', from: LEGACY_KEYS.learn, to: keys.learn, guestOk: true },
      { name: 'stationCurrent', from: LEGACY_KEYS.stationCurrent, to: keys.stationCurrent, guestOk: true },
      { name: 'drafts', from: LEGACY_KEYS.drafts, to: keys.drafts, guestOk: false },
    ]

    plan.forEach((step) => {
      if (partition.adopted[step.name]) return // 只允许第一个领养者
      if (!hasKey(step.from)) return // 旧键不存在 → 无需领养，但也不标记（等旧键真的出现）
      if (!step.guestOk && sc === GUEST_SCOPE) return
      try {
        if (!hasKey(step.to)) {
          localStorage.setItem(step.to, localStorage.getItem(step.from))
        }
        partition.adopted[step.name] = sc
        adopted.push(step.name)
      } catch {
        /* 单步失败不影响其余步骤，也不回滚已成功的步骤 */
      }
    })

    try {
      localStorage.setItem(
        keys.partition,
        JSON.stringify({ v: 1, at: partition.at || new Date().toISOString(), adopted: partition.adopted }),
      )
    } catch {
      /* 标记写不进去也无妨：本次已复制的内容依然可用，下次重试即可 */
    }
    return { ok: true, adopted, skipped: adopted.length === 0 }
  } catch (e) {
    return { ok: false, adopted, skipped: false, error: e && e.message ? e.message : String(e) }
  }
}

// ---------------------------------------------------------------- 主存储

/**
 * 读 v2 主存储，只取 records（结构异常时退化为空对象，不让 UI 崩）。
 * @param {string} [scope] keysFor(scope).learn；缺省 'guest'
 * @returns {Record<string, object>}
 */
export function readLearn(scope = GUEST_SCOPE) {
  const raw = readJSON(keysFor(scope).learn, null)
  if (!raw || typeof raw !== 'object') return {}
  return raw.records && typeof raw.records === 'object' ? raw.records : {}
}

/**
 * 写 v2 主存储（版本号由 LEARN_STORE_VERSION 统一）。
 * 载荷形状 `{ version, records }` **字节级不变** —— metadata 一律走 prefs 键。
 * @param {Record<string, object>} records
 * @param {string} [scope]
 */
export function writeLearn(records, scope = GUEST_SCOPE) {
  writeJSON(keysFor(scope).learn, { version: LEARN_STORE_VERSION, records })
}

/**
 * 读设备级设置（难度档 / 词族成组 / 自动朗读）。
 * ★ `inheritFreqKnown` **不再**属于这里 —— 它已迁到按账号分区的 prefs 键，
 *   否则「切账号」会把上一个账号的继承策略带给下一个账号。
 * @returns {object}
 */
export function readSettingsV2() {
  return !hasStorage() ? {} : readJSON(KEYS.settings, {})
}

/**
 * 写设备级设置。
 * @param {object} obj
 */
export function writeSettingsV2(obj) {
  if (!hasStorage()) return
  writeJSON(KEYS.settings, obj && typeof obj === 'object' ? obj : {})
}

/**
 * 读**旧** v1 设备设置（只读一次，供设置钩子做向后兼容的默认值兜底）。
 *
 * 这是冻结键的唯一对外读出口：调用方拿不到键名本身，也就没法把它写回去或删掉
 * —— 「冻结键只在 migrate.js 内被命名」这条不变量因此可被机器检查
 * （scripts/check-storage-keys.mjs 的 R5）。
 *
 * @returns {object}
 */
export function readSettingsV1() {
  if (!hasStorage()) return {}
  const raw = readJSON(FROZEN_KEYS.settingsV1, {})
  return raw && typeof raw === 'object' ? raw : {}
}

/**
 * 读账号级偏好（独立键，**不进 learn 载荷**）。
 * @param {string} [scope]
 * @returns {{ inheritFreqKnown: boolean, updatedAt: string|null }}
 */
export function readPrefs(scope = GUEST_SCOPE) {
  const raw = readJSON(keysFor(scope).prefs, null)
  if (!raw || typeof raw !== 'object') return emptyPrefs()
  return {
    inheritFreqKnown: raw.inheritFreqKnown !== false,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

/**
 * 写账号级偏好（浅合并）。
 * @param {object} patch
 * @param {string} [scope]
 */
export function writePrefs(patch, scope = GUEST_SCOPE) {
  const next = { ...readPrefs(scope), ...(patch && typeof patch === 'object' ? patch : {}) }
  writeJSON(keysFor(scope).prefs, { ...next, updatedAt: next.updatedAt || new Date().toISOString() })
}

// ---------------------------------------------------------------- 纯迁移

/**
 * 内存里的迁移映射（不碰存储，可直接单测）。
 *
 * @param {object}   args
 * @param {object}   args.legacyStatus      冻结的手工标注源内容，形如 { 'w.inspect': 'review' }
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
 * 读旧 → 迁移 → 写备份 → 写 v2 → 写标记（**按 scope**）。
 * 任一环节失败：回滚本次写入的 v2 键，返回 { ok: false, error }，继续用旧数据。
 *
 * @param {object}   [args]
 * @param {string}   [args.scope]              分区；缺省 'guest'
 * @param {Word[]}   [args.words]
 * @param {boolean}  [args.inheritFreqKnown]
 * @param {string}   [args.now]
 * @returns {{ ok: boolean, skipped?: boolean, report?: object, error?: string }}
 */
export function runMigration({ scope = GUEST_SCOPE, words = [], inheritFreqKnown = true, now } = {}) {
  const at = now || new Date().toISOString()

  if (!hasStorage()) {
    return { ok: false, error: '当前环境没有 localStorage，跳过迁移' }
  }

  const keys = keysFor(scope)

  // 幂等：已迁移过 / v2 已存在就直接跳过，绝不重跑
  const flag = readJSON(keys.migration, null)
  if (flag && flag.done === true) return { ok: true, skipped: true, report: flag.report }
  if (hasKey(keys.learn)) return { ok: true, skipped: true }

  try {
    const legacyStatus = readJSON(FROZEN_KEYS.statusV1, {})
    const legacySettings = readJSON(FROZEN_KEYS.settingsV1, {})

    // 1) 内存里生成 + 校验（不通过直接抛错，此时一个键都还没写）
    const { records, report } = migrateV1toV2({ legacyStatus, words, inheritFreqKnown, now: at })
    const check = validateRecords(records)
    if (!check.ok) throw new Error(`迁移结果校验失败：${check.errors.slice(0, 3).join('；')}`)

    // 2) 序列化载荷（先序列化再落盘，避免写一半时才发现 JSON 有问题）
    const learnPayload = JSON.stringify({ version: LEARN_STORE_VERSION, records })
    // settings 载荷保留旧设置的其他项，但 **inheritFreqKnown 迁出** 到 prefs
    const { inheritFreqKnown: _dropped, ...settingsRest } = legacySettings
    const settingsPayload = JSON.stringify({
      ...settingsRest,
      status: legacySettings.status === 'new' ? 'unknown' : legacySettings.status || 'all',
    })
    const flagPayload = JSON.stringify({ done: true, at, report })

    // 3) 备份只写一次，永不删
    if (!hasKey(FROZEN_KEYS.statusV1Backup)) {
      writeJSON(FROZEN_KEYS.statusV1Backup, { ...legacyStatus, backedUpAt: at })
    }
    if (!hasKey(FROZEN_KEYS.settingsV1Backup)) {
      writeJSON(FROZEN_KEYS.settingsV1Backup, legacySettings)
    }

    // 4) 正式写入：v2 主存储 → 设备级设置 → 账号级 prefs → 迁移标记
    try {
      localStorage.setItem(keys.learn, learnPayload)
      localStorage.setItem(keys.settings, settingsPayload)
      localStorage.setItem(keys.prefs, JSON.stringify({ inheritFreqKnown: Boolean(inheritFreqKnown), updatedAt: at }))
      localStorage.setItem(keys.migration, flagPayload)
    } catch (e) {
      removeKey(keys.learn)
      removeKey(keys.migration)
      removeKey(keys.prefs)
      throw e
    }

    return { ok: true, skipped: false, report }
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
}

// ---------------------------------------------------------------- 云端同步辅助

/**
 * 读某分区的迁移标记（供设置页展示迁移报告）。
 * @param {string} [scope]
 * @returns {{done: boolean, at: string|null, report: object|null}|null} 无标记时返回 null
 */
export function readMigrationFlag(scope = GUEST_SCOPE) {
  const raw = readJSON(keysFor(scope).migration, null)
  if (!raw || typeof raw !== 'object') return null
  return {
    done: raw.done === true,
    at: typeof raw.at === 'string' ? raw.at : null,
    report: raw.report && typeof raw.report === 'object' ? raw.report : null,
  }
}

/**
 * 读同步游标 `{ lastSyncAt }`（**按 scope**：新账号分区初始 null → 必走全量）。
 * @param {string} [scope]
 * @returns {{lastSyncAt: string|null}}
 */
export function readSync(scope = GUEST_SCOPE) {
  const raw = readJSON(keysFor(scope).sync, null)
  if (!raw || typeof raw !== 'object') return { lastSyncAt: null }
  return { lastSyncAt: typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null }
}

/**
 * 写同步游标（只更新 lastSyncAt，其他字段保留）。
 * @param {string|null} lastSyncAt
 * @param {string} [scope]
 */
export function writeSync(lastSyncAt, scope = GUEST_SCOPE) {
  const key = keysFor(scope).sync
  writeJSON(key, { ...readSync(scope), lastSyncAt })
}

/**
 * 读「本账号是否已做过首次登录云端迁移」标记。
 *
 * ★ 这个读取**必须带 scope**（GAP-3 的根因）：旧实现读全局键，A 登录写过的
 *   `done:true` 会让 B 直接跳过 migrateToCloud 走 pull，进而把 A 的 local-only
 *   行当成 B 的待上行数据 push 进 B 的云端账号 —— RLS 拦不住（owner_id=B 合法）。
 * @param {string} [scope]
 * @returns {{done: boolean, at: string|null}}
 */
export function readCloudMigration(scope = GUEST_SCOPE) {
  const raw = readJSON(keysFor(scope).cloudMigration, null)
  if (!raw || typeof raw !== 'object') return { done: false, at: null }
  return { done: raw.done === true, at: typeof raw.at === 'string' ? raw.at : null }
}

/** 写首次登录云端迁移标记（幂等：重复写无副作用） */
export function writeCloudMigration(scope = GUEST_SCOPE) {
  if (readCloudMigration(scope).done) return
  writeJSON(keysFor(scope).cloudMigration, { done: true, at: new Date().toISOString() })
}

/**
 * 导出本地 v2 记录（首次登录上传用）。
 * 调用前必须先跑 runMigration() 保证是 v2 口径；本函数不写任何键。
 * @param {string} [scope]
 * @returns {Record<string, object>}
 */
export function exportLocalRecords(scope = GUEST_SCOPE) {
  return { ...readLearn(scope) }
}

/**
 * 供设置页「重跑迁移」使用：清掉**当前 scope** 的 v2 主存储与标记
 * （设备级 settings 与全部备份键不动），之后重新调用 runMigration。
 * @param {string} [scope]
 */
export function clearMigration(scope = GUEST_SCOPE) {
  const keys = keysFor(scope)
  removeKey(keys.learn)
  removeKey(keys.migration)
}
/**
 * v1（手工标注字符串）→ v2（学习记录对象）迁移 + **全应用唯一的存储键访问器**
 * ------------------------------------------------------------------
 * 本文件是存储键名的**唯一来源**。业务代码只传 `ownerId`（或 `scopeOf(ownerId)`
 * 的结果），永不接触 scope 字符串、更永不自己拼键或判断键。
 *
 * ★ 可被机器保证的不变量（scripts/check-storage-keys.mjs，npm run test:keys）★
 *   除本文件与 dict.js 的 IndexedDB 前缀白名单外，`src/**` 里出现任何
 *   `wrc.` 命名空间字面量即判失败 —— **含注释，且包括裸前缀**
 *   （不只是 `wrc.learn.v2` 这类具体键名）。
 *
 *   裸前缀也在禁列内，是因为「业务代码自己判断 `k.startsWith('wrc.')`」
 *   与「业务代码自己拼 `wrc.learn.v2:<uid>`」是同一种泄漏：键名知识一旦离开
 *   本文件，改键名 / 加分区键时就必然漏改一处。需要做这种判断时，
 *   调 `isStorageKey()` / `affectsLocalScope()`。
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
 * 本应用在 localStorage 上的**键命名空间前缀**。
 *
 * 它连同下面的 `isStorageKey()` / `affectsLocalScope()` 一起构成一条
 * 可被机器保证的不变量：**除本文件与 dict.js 的 IndexedDB 白名单外，
 * `src/**` 里不出现任何 `wrc.` 字面量**（scripts/check-storage-keys.mjs 的 R1）。
 *
 * 为什么要专门导出一个「前缀」：业务代码确实偶尔需要判断「这个 storage 事件
 * 的键是不是我们的」（多标签页串号处理）。若让它自己写 `k.startsWith('wrc.')`，
 * 键名知识就又漏回了业务文件 —— 那正是分区键 bug 的源头（R1 注释里写的
 * 「工程师照着过时注释改代码」同款回流路径）。
 */
export const STORAGE_PREFIX = 'wrc.'

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
  settings: `${STORAGE_PREFIX}settings.v2`,
  partition: `${STORAGE_PREFIX}partition.v1`,
  draftsDiscarded: `${STORAGE_PREFIX}drafts.discarded`,
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
 * @property {string} stationsCache    wrc.stations.v1:<scope>     （小站列表本地缓存）
 * @property {string} stationWordsCache wrc.stationwords.v1:<scope>（各小站词条引用本地缓存）
 * @property {string} settings        wrc.settings.v2            （设备级，不分区）
 * @property {string} partition       wrc.partition.v1           （全局升级标记）
 * @property {string} draftsDiscarded wrc.drafts.discarded       （全局丢弃日志）
 */

/**
 * 全应用唯一的存储键访问器。业务代码禁止自行拼接键名 —— 需要判断某个字符串
 * 是不是本应用的存储键时，用 `isStorageKey()`，不要自己写前缀比较。
 * @param {string|null|undefined} scope scopeOf() 的结果；非法值回落 'guest'
 * @returns {ScopeKeys}
 */
export function keysFor(scope) {
  const sc = normalizeScope(scope)
  const suffix = `:${sc}`
  return {
    scope: sc,
    learn: `${STORAGE_PREFIX}learn.v2${suffix}`,
    prefs: `${STORAGE_PREFIX}prefs.v1${suffix}`,
    migration: `${STORAGE_PREFIX}migration.v2${suffix}`,
    sync: `${STORAGE_PREFIX}sync.v1${suffix}`,
    cloudMigration: `${STORAGE_PREFIX}migration.cloud${suffix}`,
    drafts: `${STORAGE_PREFIX}drafts.v1${suffix}`,
    stationCurrent: `${STORAGE_PREFIX}station.current${suffix}`,
    userWordsCache: `${STORAGE_PREFIX}userwords.v1${suffix}`,
    // 小站本地缓存（A-02 / A-06）：断网 + F5 时首帧就能读出小站与词条，
    // 否则界面会显示「还没有小站」，用户以为被删了。
    stationsCache: `${STORAGE_PREFIX}stations.v1${suffix}`,
    stationWordsCache: `${STORAGE_PREFIX}stationwords.v1${suffix}`,
    // 设备级 / 全局键：跨账号共享（难度档、词族成组、自动朗读本就与账号无关）
    settings: KEYS.settings,
    partition: KEYS.partition,
    draftsDiscarded: KEYS.draftsDiscarded,
  }
}

/**
 * 这个 key 是否与「当前账号的本地学习态」有关？
 *
 * 用途：`storage` 事件（多标签页串号，A-11）只对该重载的键做反应。
 * 由本文件判定而不是在调用处 `key.includes('learn.v2')` —— 后者等于把
 * 键名知识又漏回业务文件，那正是分区键 bug 的源头。
 *
 * @param {string} key
 * @returns {boolean}
 */
export function isStorageKey(key) {
  return typeof key === 'string' && key.startsWith(STORAGE_PREFIX)
}

/**
 * 该键变化时，是否要强制重载当前 scope 的内存态（切号可能已在别处发生）。
 *
 * 覆盖：分区 learn 键（另一个标签写了别的 scope 的进度）、cloudMigration 标记、
 * 设备级设置键，以及**小站与词条缓存键**（多标签页在别处登录了另一个账号时，
 * 本标签的内存态必须重读缓存，否则 A 的小站会挂在 B 的界面上）。
 * **故意不包括** drafts：草稿入队 / 补传只影响计数，
 * 由 onPendingChange 通知即可，没必要整表重载。
 *
 * @param {string} key
 * @returns {boolean}
 */
export function affectsLocalScope(key) {
  if (!isStorageKey(key)) return false
  // ★ 坑（改错过一次）：keysFor() 返回的分区键是**带 scope 后缀**的（`…:uid-A`），
  //   而 storage 事件给的是完整键名。比较「逻辑键」时两边都必须截到最后一个冒号之前 ——
  //   拿 `…:guest` 直接比 `…:uid-A`，永远不相等，于是这个函数静默失效，
  //   症状只是「多标签页不重载」，极难归因。
  //   键名里不含冒号，所以按最后一个冒号截断是安全的。
  const k = keysFor(GUEST_SCOPE)
  const base = (fullKey) => String(fullKey).split(':')[0]
  const family = base(key)
  return (
    family === base(k.learn) ||
    family === base(k.prefs) ||
    family === base(k.cloudMigration) ||
    family === base(k.migration) ||
    // 小站缓存：漏掉这两条的症状是「另一个标签切了号，本标签还显示旧小站」——
    // 而小站里可能有几百个词条，用户会以为词被删了。
    family === base(k.stationsCache) ||
    family === base(k.stationWordsCache) ||
    // 设备级 / 全局键本来就没有后缀，base 是恒等变换
    family === k.settings ||
    // 冻结的 v1 源与备份：另一个标签重跑迁移时会写备份，此时本标签应重读。
    // 迁移的主判据（migration 标记）已在上面，但 v1 备份只写一次、且可能先于
    // 标记写入，补上它保证「别的标签动过迁移源」一定能被察觉。
    family === FROZEN_KEYS.statusV1 ||
    family === FROZEN_KEYS.statusV1Backup
  )
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

// ---------------------------------------------------------------- 小站本地缓存
//
// ★ 这两个键里的一切都可以随时丢弃 —— 它们**不是数据源**，只是「断网首帧」的加速器。
//   读不中就回落到网络请求；写不进就静默跳过。这条定位是下面所有写失败路径
//   都能静默的根本理由：缓存写失败绝不能影响内存态、UI 与学习记录。
//
// ★ 缓存形状直接存 API 的行对象（stationsApi.stationFromRow /
//   stationWordsApi.stationWordFromRow 的输出），零转换 —— 任何转换都是一处
//   可能与云端漂移的副本。

/**
 * 缓存里最多保留几个小站的词条条目（按 savedAt 做 LRU）。
 *
 * ★ 为什么必须有这个上限 ★
 *   `byStation` 是一个**只增不减**的 map：用户建站 → 加词 → 删站，只要曾经
 *   缓存过，那个条目就会一直留在键里。这正是 localStorage 配额的「慢漏」——
 *   不报错、不显眼，直到某天学习记录写不进去，而那时没人会想到是小站缓存干的。
 *   A-07 刚修好的正是同一个配额问题，这里不能换个地方再犯一次。
 */
const MAX_CACHED_STATIONS = 10

/**
 * 序列化后的体积上限（两个键各自独立计算）。超限则**拒写**（返回 false）。
 *
 * 取 256KB 的依据（★ 数字已按 T06 列裁剪后的实测更新 ★）：
 *   裁剪后单条 **17 B（短词）/ 36 B（长词 `w.internationalization`）**，
 *   500 词的小站约 8.3~17.6 KB，10 站满配约 83~175.8 KB
 *   ⇒ 256KB 能存 14~30 站，而 MAX_CACHED_STATIONS 只有 10
 *   ⇒ **这条护栏在正常路径上永不触发**，它退化为纯兜底。
 *
 * 裁剪前是 299.7 B/条 ⇒ 10 站满配 1463 KB ⇒ 护栏在**第 2 个站就拒写**，
 * 而拒写是**静默**的（返回 false、不抛错），症状是「离线读不到自己的站」。
 * 这就是下面 `projectRef` 必须**内置在写入器里**的原因。
 *
 * 宁可少缓存几个站，也不能挤掉学习进度。
 */
const MAX_CACHE_BYTES = 256 * 1024

/** 读一个缓存键的原始载荷；结构异常一律回落 null（绝不抛错） */
function readCacheRaw(scope, keyName) {
  if (!hasStorage()) return null
  const raw = readJSON(keysFor(scope)[keyName], null)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw
}

/**
 * 序列化后是否超过体积护栏。
 * @param {object} payload
 * @returns {boolean} true = 超限（应拒写）
 */
function exceedsCacheBudget(payload) {
  try {
    return JSON.stringify(payload).length > MAX_CACHE_BYTES
  } catch {
    // 序列化不了（循环引用等）→ 视为超限，静默拒写
    return true
  }
}

// ---------------------------------------------------------------- 小站列表缓存

/**
 * 读小站列表缓存（断网时首帧用，避免界面显示「还没有小站」）。
 * @param {string} [scope]
 * @returns {{ stations: object[], savedAt: string|null }}
 */
export function readStationsCache(scope = GUEST_SCOPE) {
  const raw = readCacheRaw(scope, 'stationsCache')
  if (!raw) return { stations: [], savedAt: null }
  const stations = Array.isArray(raw.stations)
    ? raw.stations.filter((s) => s && typeof s === 'object' && typeof s.id === 'string')
    : []
  return {
    stations,
    savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : null,
  }
}

/**
 * 写小站列表缓存（**只在 refresh() 成功后调**）。
 *
 * ★ 写失败返回 false 而不抛错：缓存不是数据源，主流程不该因为它崩。
 *
 * @param {object[]} stations stationsApi.stationFromRow 的形状
 * @param {string} [scope]
 * @returns {boolean} false = 无存储 / 被体积护栏拒写 / setItem 抛错
 */
export function writeStationsCache(stations, scope = GUEST_SCOPE) {
  if (!hasStorage()) return false
  const payload = {
    v: 1,
    savedAt: new Date().toISOString(),
    stations: Array.isArray(stations) ? stations : [],
  }
  if (exceedsCacheBudget(payload)) return false
  try {
    writeJSON(keysFor(scope).stationsCache, payload)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- 小站词条缓存

/**
 * 归一化 byStation：剔掉结构异常与体积异常（savedAt 缺失）的条目 */
function normalizeByStation(raw) {
  const out = {}
  if (!raw || typeof raw.byStation !== 'object' || raw.byStation === null || Array.isArray(raw.byStation)) {
    return out
  }
  Object.keys(raw.byStation).forEach((id) => {
    const entry = raw.byStation[id]
    if (!entry || typeof entry !== 'object') return
    if (!Array.isArray(entry.refs)) return
    out[id] = {
      savedAt: typeof entry.savedAt === 'string' ? entry.savedAt : null,
      seq: Number.isFinite(entry.seq) ? entry.seq : 0,
      refs: entry.refs.filter((r) => r && typeof r === 'object' && typeof r.wordKey === 'string'),
    }
  })
  return out
}

/**
 * 同毫秒写入的次序判据（LRU 的兜底 tiebreaker）。
 *
 * ★ 为什么需要它（这是缺陷注入实测出来的，不是预想的）★
 *   `new Date().toISOString()` 只有毫秒精度，而「连着刷新几个小站」完全可能
 *   在同一毫秒内写两次。只按 savedAt 排序时，**同一毫秒内的先后关系会退化成
 *   「按 stationId 字典序」** —— 于是「刚写过的那个站」可能被当成最旧的丢掉，
 *   症状是「刚在小站 A 加完词，切走再切回来，离线就读不到了」。
 *
 *   这个计数器只在**本次会话内**用于打破平局。刷新页面后它从 0 重来，此时靠
 *   savedAt 本身的差值决定（毫秒精度足够 —— 两次会话内的写入必然相隔 > 1ms），
 *   仍平局才退到 id 字典序，而那仍是确定性的（不会每次排序结果都不同）。
 */
let writeSeq = 0

/**
 * 按 LRU 裁剪，只保留最近 MAX_CACHED_STATIONS 个小站条目。
 * @param {Record<string, {savedAt: string|null, seq: number, refs: object[]}>} byStation
 * @returns {Record<string, {savedAt: string|null, seq: number, refs: object[]}>}
 */
function lruTrim(byStation) {
  const ids = Object.keys(byStation)
  if (ids.length <= MAX_CACHED_STATIONS) return byStation
  // savedAt 缺失的视为最旧（排到前面先被丢）；同刻再用 seq，最后才用 id
  const sorted = ids.slice().sort((a, b) => {
    const ta = typeof byStation[a].savedAt === 'string' ? Date.parse(byStation[a].savedAt) : 0
    const tb = typeof byStation[b].savedAt === 'string' ? Date.parse(byStation[b].savedAt) : 0
    if (ta !== tb) return ta - tb
    const sa = Number.isFinite(byStation[a].seq) ? byStation[a].seq : 0
    const sb = Number.isFinite(byStation[b].seq) ? byStation[b].seq : 0
    if (sa !== sb) return sa - sb
    return a < b ? -1 : a > b ? 1 : 0
  })
  const keep = new Set(sorted.slice(sorted.length - MAX_CACHED_STATIONS))
  const out = {}
  ids.forEach((id) => {
    if (keep.has(id)) out[id] = byStation[id]
  })
  return out
}

/**
 * 读某个小站的词条引用缓存（断网 + F5 时首帧用）。
 *
 * ★ 为什么是 map 而不是单槽：红线是「断网必须仍可查看小站」（复数）。单槽只能
 *   记住最后看过的那个小站，切到别的站就空了 —— map 才能让「离线切小站」也出内容。
 *
 * @param {string} stationId
 * @param {string} [scope]
 * @returns {{ refs: object[], savedAt: string|null }}
 */
export function readStationRefs(stationId, scope = GUEST_SCOPE) {
  if (!stationId) return { refs: [], savedAt: null }
  const raw = readCacheRaw(scope, 'stationWordsCache')
  if (!raw) return { refs: [], savedAt: null }
  const entry = normalizeByStation(raw)[stationId]
  if (!entry) return { refs: [], savedAt: null }
  return { refs: entry.refs, savedAt: entry.savedAt }
}

/**
 * 写某个小站的词条引用缓存（**只在 refresh() 成功后调**）。
 *
 * ★ 写入侧纪律（U3）★
 *   这个键绝不能在批量操作的循环里被写（哪怕每批都更新内存态）——
 *   那会让另一个标签页的 storage 监听被高频触发、反复重载。
 *
 * @param {string} stationId
 * @param {object[]} refs stationWordsApi.stationWordFromRow 的形状
 * @param {string} [scope]
 * @returns {boolean} false = 被 LRU / 体积护栏拒写，或 setItem 抛错
 */
/**
 * ★★ 缓存投影：落盘前把引用行裁到只剩 wordKey ★★
 *
 * ★★ 为什么必须内置在**写入器**里，而不是靠每个调用方自觉 ★★
 *   这是 T06 返工的直接原因：防线原本建在调用方
 *   （`useStationWords.js` 里的 `list.map(pickCacheRef)`）——
 *   而 QA 的脚本无意中扮演了「第二个调用方」，**原样传入 8 字段行**，
 *   照出来一个静默故障：写进缓存的是 8 字段（299.7 B/条）⇒ 10 站满配 1463 KB
 *   ⇒ 护栏在第 2 个站**静默拒写**（返回 false、不抛错、无日志）
 *   ⇒ 症状是「**离线读不到自己的站**」，直接违反红线 6。
 *
 *   ⇒ **防线必须落在写入器内部**。调用方仍然可以传全字段（本函数会裁），
 *   也可以传已裁剪的（幂等，裁完还是只有 wordKey）。
 *
 * ★ 为什么只留 wordKey（实测省 91.3%）★
 *   消费点只用 wordKey：`useStationWords` 的 noteByKey / isUserKey 分流 /
 *   排序 / synced 去重，以及 App.jsx 的 existingKeys。
 *
 * ★★ 为什么连 `source` 也裁（这条最容易被人当成漏了字段）★★
 *   `source` 与 wordKey 的前缀是**同一信息的两份副本**：
 *     · 落盘侧的 `r.source` 来自 `stationWordFromRow`，是 DB 的列；
 *     · 消费侧分流用的是 `isUserKey(r.wordKey)`（即 `startsWith('u.')`），
 *       **从不读 `r.source`**；
 *     · 而 UI 上的 `words[].source` 是**硬编码**的（public 分支写 'public'、
 *       user 分支由 `toUserWordView` 写 'user'）—— 根本不来自 refs。
 *   ⇒ 保留它就是保留一个「看着有用但没人读」的 5.9%。
 *   ⚠️ 与 `note` 不同：`note` 至少还有「K5 接 UI 后要走 refresh」这条解释链，
 *     `source` 没有 —— 将来若有人在缓存里找不到 source，会误以为是漏了字段
 *     而「补」回去，白白多付 5.9%。补回来只需改这一行 + 补一条测试。
 *
 * ★ `note` 为什么也裁（对照）★
 *   PRD §8-3 / B-08：站内笔记本期不做（无入口、无展示）；实测所有写入路径的
 *   note 恒为 null（`addToStation` 构造的 item 是 `{wordKey, source}`）。
 *   ⚠️ K5 接 UI 时**必须走 `refresh()`（云端），不得读缓存** ——
 *     这是「缓存不是数据源」这条纪律的具体化。
 *
 * ★ 向后兼容（实测，scripts/test-cache-compat.mjs）★
 *   · 读侧 `normalizeByStation` 的过滤条件只要求 `typeof r.wordKey === 'string'`
 *     ⇒ 新代码读**旧缓存**（8 字段）行不丢、消费点全部成立；
 *   · 旧代码读**新缓存**（1 字段）不崩：`noteByKey` 的 `?? null` 把 undefined
 *     兜成 null，`isUserKey` 分流与 `existingKeys` 不受影响；
 *   · 新旧混存在同一站也正常（升级瞬间的真实状态）。
 *   ⇒ **不需要迁移、不需要作废旧缓存**。
 *   ⚠️ 这个结论依赖「读侧过滤只要求 wordKey 是字符串」这个**不变量**：
 *     若将来给缓存加版本门槛（如 `if (raw.v !== 2) return []`），
 *     必须同步处理旧形状，否则会**静默作废所有用户的离线缓存**。
 *
 * @param {object} r stationWordsApi.stationWordFromRow 的输出
 * @returns {{wordKey: string}} 落盘用的最小投影
 */
export function projectRef(r) {
  return { wordKey: r && r.wordKey }
}

/**
 * 写入一个小站的词条引用缓存。
 *
 * ★ refs 会被 `projectRef` 裁到只剩 wordKey ★
 *   传全字段是安全的（会被裁）；传已裁剪的也是（幂等）。
 *   调用方的显式投影只作文档用途，**不是防线** —— 见 projectRef 的注释。
 *
 * @returns {boolean} 是否写成功。**false = 超限拒写或存储不可用**（不抛错，
 *   旧值保持完好）—— 调用方可以选择提示，但绝不应当作「已缓存」。
 */
export function writeStationRefs(stationId, refs, scope = GUEST_SCOPE) {
  if (!hasStorage()) return false
  if (!stationId) return false
  const raw = readCacheRaw(scope, 'stationWordsCache')
  // ★★★ 防线在这里：任何调用方传进来的行都会被裁 ★★★
  const projected = (Array.isArray(refs) ? refs : []).map(projectRef)
  const byStation = lruTrim(
    Object.assign(normalizeByStation(raw), {
      [stationId]: {
        savedAt: new Date().toISOString(),
        seq: (writeSeq += 1),
        refs: projected,
      },
    }),
  )
  const payload = { v: 1, savedAt: new Date().toISOString(), byStation }
  if (exceedsCacheBudget(payload)) return false
  try {
    writeJSON(keysFor(scope).stationWordsCache, payload)
    return true
  } catch {
    return false
  }
}

/**
 * 清掉某个小站的词条缓存条目（删站时调用）。
 *
 * ★ 为什么删站要顺手清这一条（Q8）★
 *   1. 正确性：删站后 currentId 会落到另一个小站，若那个站有缓存条目，
 *      切过去首帧就是对的，不会出现「刚删完还显示」的错位；
 *   2. 配额：这是**唯一成本近似为零的回收点** —— byStation 只增不减，
 *      「建站→删站」反复循环会无界增长，而 localStorage 配额正是 A-07 要保护的
 *      同一个资源。
 *
 * @param {string} stationId
 * @param {string} [scope]
 */
export function dropStationRefs(stationId, scope = GUEST_SCOPE) {
  if (!hasStorage() || !stationId) return
  const raw = readCacheRaw(scope, 'stationWordsCache')
  if (!raw) return
  const byStation = normalizeByStation(raw)
  if (!(stationId in byStation)) return
  delete byStation[stationId]
  try {
    writeJSON(keysFor(scope).stationWordsCache, {
      v: 1,
      savedAt: new Date().toISOString(),
      byStation,
    })
  } catch {
    /* 清不掉也不影响任何流程：缓存不是数据源 */
  }
}

/**
 * 清空全部小站词条缓存（「清空标注」等场景）。
 *
 * ★ 边界：只碰这个缓存键。learn 分区与草稿队列一律不触碰 ——
 *   「清缓存」绝不能变成「清学习进度」。
 *
 * @param {string} [scope]
 */
export function dropAllStationRefs(scope = GUEST_SCOPE) {
  removeKey(keysFor(scope).stationWordsCache)
}
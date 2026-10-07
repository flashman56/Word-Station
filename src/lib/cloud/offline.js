/**
 * 离线草稿队列（**按账号分区**，键约定见 lib/migrate.js）
 * ------------------------------------------------------------------
 * 断网判定：navigator.onLine === false **或** 请求抛网络错（不只看 onLine）。
 * 容器：每个 scope 一个队列键 = { generate: [], stationWords: [], learn: [], stations: [] }
 * 补传顺序固定：generate → stationWords → learn → stations；逐条成功后逐条移除。
 * 幂等：所有上行都是 upsert（冲突键见各 API）。
 *
 * ★ 为什么必须分区 + 认领（GAP-5，真实事故）★
 *   旧实现是一条全局队列、`drain()` 遇失败即 `break`。A 离线产生的草稿带着
 *   A 的 ownerId 留在队首；B 登录后用 B 的 token 去推 → RLS 拒绝 → 草稿永不删
 *   且**卡住队首**，B 自己的草稿也永远传不上去。
 *
 *   新语义是四分：**认领 / park / 丢弃 / 真失败**。
 *   - 认领（claim）：草稿的 ownerId 不等于当前 uid → **park 保留**（不推送、
 *     不重试、不阻塞后续）。它们属于别的账号，替别人删数据是不可逆的损失；
 *     等该账号回来认领通过时会自动解除 park 并补传。
 *   - 永久失败（isPermanentError，且属本 scope）→ **park 保留** + 记日志；
 *   - 结构损坏（缺 rows / stationId 等）→ 真丢弃（推上去必然失败）；
 *   - 可重试失败（网络 / 5xx / 超时）→ 原样保留，**继续下一条**（不 break，见下）。
 *
 *   ★ park 与丢弃的区别（A-14）★
 *     parked 条目**保留在队列里**，但**不计入 pendingCount** —— 否则徽标会永久
 *     显示一个减不掉的数字。它们由 stuckCount 单独统计，UI 给出一键清除入口。
 *     学习记录早已落在 learn 分区，与草稿队列是两个独立的键；清除草稿**绝不**
 *     会碰到学习进度。
 *
 *   ★ 为什么可重试失败也不再 break ★
 *     U1 实测结论：RLS 拒绝在 Cloudflare Pages `/supabase` 网关转发后
 *     error.code === '42501'（网关逐字转发 status 与 body，不改写错误体）。
 *     但万一遇到没见过的形状，`break` 会让一条无法识别的草稿把整个队列堵死。
 *     丢弃是**永久数据丢失**，重试只多花请求 —— 所以失败一律「保留 + 继续」，
 *     队列不会被单条毒草永久阻塞。详见 isPermanentError 的注释。
 */
import * as stationWordsApi from './stationWords.js'
import * as stationsApi from './stations.js'
import * as generateApi from './generate.js'
import * as learnSyncApi from './learnSync.js'
import { keysFor } from '../migrate.js'

/** 补传顺序（generate 必须先于 stationWords：要先拿到 word_key 才能进小站） */
export const DRAIN_ORDER = ['generate', 'stationWords', 'learn', 'stations']

/** 丢弃日志上限（环形覆盖，跨账号共用一条，不分区） */
export const DISCARDED_LIMIT = 50


/**
 * 造一份**全新的**空队列。
 *
 * ⚠ 不能用 `{ ...EMPTY }`：那是浅拷贝，`drafts.learn` 会与模块级 EMPTY.learn
 *   是同一个数组对象，任何 push / splice 都会**永久改写 EMPTY**。
 *   症状极隐蔽：清过一次的队列会在下一次 read 时"复活"已丢弃的草稿
 *   （测试里表现为 reset 后 pendingCount 仍然不为 0）。
 */
function emptyDrafts() {
  return { generate: [], stationWords: [], learn: [], stations: [] }
}

// ---------------------------------------------------------------- pending 订阅

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

// ---------------------------------------------------------------- 队列读写

function read(scope) {
  try {
    const raw = localStorage.getItem(keysFor(scope).drafts)
    if (!raw) return emptyDrafts()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptyDrafts()
    const out = emptyDrafts()
    DRAIN_ORDER.forEach((k) => {
      out[k] = Array.isArray(parsed[k]) ? parsed[k] : []
    })
    return out
  } catch {
    return emptyDrafts()
  }
}

function write(drafts, scope) {
  try {
    localStorage.setItem(keysFor(scope).drafts, JSON.stringify(drafts))
  } catch {
    /* 隐私模式写入失败忽略 */
  }
}

/**
 * 入队一条草稿（**按 scope**）。
 * @param {'generate'|'stationWords'|'learn'|'stations'} kind
 * @param {object} payload
 * @param {string} [scope] scopeOf(ownerId) 的结果；缺省 'guest'
 * @returns {number} 入队后该 kind 的条数
 */
export function enqueue(kind, payload, scope = 'guest') {
  if (!DRAIN_ORDER.includes(kind)) return 0
  const drafts = read(scope)
  drafts[kind] = drafts[kind] || []
  drafts[kind].push({ ...payload, queuedAt: new Date().toISOString() })
  write(drafts, scope)
  notifyPendingChanged()
  return drafts[kind].length
}

/**
 * 待同步条数（**只统计当前 scope 的队列**）。
 *
 * ★ A-14：只算「可重试」的草稿 ★
 *   被标记为 parked 的（永久失败 / 跨账号）条目**不计入** —— 否则徽标会永久
 *   显示一个减不掉的数字，用户既不知道怎么消掉、也没法回到绿色。
 *   它们由 stuckCount 单独统计并单独展示。
 *
 * discarded 同样不计入（它已是历史日志，不是待办）。
 *
 * @param {string} [scope]
 * @returns {number}
 */
export function pendingCount(scope = 'guest') {
  const drafts = read(scope)
  return DRAIN_ORDER.reduce((n, k) => n + (drafts[k] || []).filter((it) => !isParked(it)).length, 0)
}

/**
 * 「传不上去」的条数（A-14）：永久失败或跨账号、被 park 保留的草稿。
 *
 * 这些条目仍然躺在队列里（数据不丢），但不计入 pendingCount。UI 需给出一键
 * 清除入口（clearStuck），否则它们只会静静堆积。
 *
 * @param {string} [scope]
 * @returns {number}
 */
export function stuckCount(scope = 'guest') {
  const drafts = read(scope)
  return DRAIN_ORDER.reduce((n, k) => n + (drafts[k] || []).filter(isParked).length, 0)
}

/** 该草稿是否被 park（保留但不计入 pending） */
function isParked(item) {
  return Boolean(item && item.parked)
}

/**
 * 一键清除「传不上去」的草稿（A-14）。
 *
 * ★★ 边界：只删草稿队列，绝不碰任何学习记录 ★★
 *   学习记录早已落在 learn 分区（keysFor(scope).learn），与草稿队列是两个
 *   独立的键、独立的生命周期。这里只对 drafts 做 filter + write，
 *   代码路径上根本触达不到 learn 键 —— 删草稿 ≠ 删学习进度。
 *   （有对应的回归断言：见 scripts/test-drafts.mjs「清除传不上去的草稿后，
 *   对应词的学习记录仍存在于 learn 分区」。）
 *
 * @param {string} [scope]
 * @returns {number} 实际清除的条数
 */
export function clearStuck(scope = 'guest') {
  const drafts = read(scope)
  let cleared = 0
  DRAIN_ORDER.forEach((k) => {
    const before = drafts[k].length
    drafts[k] = drafts[k].filter((it) => !isParked(it))
    cleared += before - drafts[k].length
  })
  if (cleared > 0) {
    write(drafts, scope)
    notifyPendingChanged()
  }
  return cleared
}

/**
 * 各 kind 的待同步条数（同样只算可重试的）。
 * @param {string} [scope]
 * @returns {object}
 */
export function pendingByKind(scope = 'guest') {
  const drafts = read(scope)
  const out = {}
  DRAIN_ORDER.forEach((k) => {
    out[k] = (drafts[k] || []).filter((it) => !isParked(it)).length
  })
  return out
}

/**
 * 读取全部草稿（调试 / UI 用）。
 * @param {string} [scope]
 */
export function readDrafts(scope = 'guest') {
  return read(scope)
}

/**
 * 清空某类草稿。
 * @param {string} kind
 * @param {string} [scope]
 */
export function clearKind(kind, scope = 'guest') {
  const drafts = read(scope)
  drafts[kind] = []
  write(drafts, scope)
}

/** 是否在离线状态 */
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

// ---------------------------------------------------------------- 丢弃日志

/**
 * uid 的短哈希前缀（**不存半个 uid**）。
 *
 * U5：`slice(0,8) + '…'` 存下来的半个 uid 在同一台设备上仍可与其他线索拼出完整
 * uid。这里改存 FNV-1a 哈希的前 8 位十六进制 —— 单向、够短、够区分，
 * 排查时能看出「是不是同一个账号的同一批草稿」就够了。
 *
 * @param {string|null|undefined} uid
 * @returns {string} 形如 'a1b2c3d4'；uid 为空时返回 ''
 */
export function hashUid(uid) {
  if (typeof uid !== 'string' || uid === '') return ''
  let h = 0x811c9dc5
  for (let i = 0; i < uid.length; i += 1) {
    h ^= uid.charCodeAt(i)
    // 乘 16777619，用移位避免 32 位溢出丢失（>>> 0 保持无符号）
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 8)
}

/**
 * 读跨账号丢弃日志（环形，保留最近 50 条）。
 * @returns {{ at: string|null, entries: Array<object> }}
 */
export function readDiscarded() {
  try {
    const raw = localStorage.getItem(keysFor('guest').draftsDiscarded)
    if (!raw) return { at: null, entries: [] }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { at: null, entries: [] }
    return {
      at: typeof parsed.at === 'string' ? parsed.at : null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  } catch {
    return { at: null, entries: [] }
  }
}

/**
 * 记一条丢弃（跨账号共用一条日志，不分区；uid 只留哈希前缀）。
 *
 * ★ A-14 适用边界（收紧）★
 *   只有「**本 scope 的草稿** 且 **错误属已实测白名单**」才允许移入 discarded：
 *     - 跨 scope 的草稿 → 一律 `parked` 保留，**不进 discarded**。
 *       理由：它们属于别的账号，删除等于替别人扔数据；而 A 自己的登录态
 *       可能马上回来、届时这些草稿本可正常上行，先删掉是不可逆的损失。
 *     - 未识别的错误 → 同样 park 保留（`isPermanentError` 已返回 false，
 *       根本到不了这里，但边界仍写明以防将来有人绕过判定直接调用）。
 *   传入 parked=true 时**只打日志、不删队列条目**（drain 里据此保留数据）。
 *
 * @param {string} kind
 * @param {object} item 原始草稿
 * @param {string} reason
 * @param {boolean} [parked] true = 仅记录，条目保留在队列里
 * @returns {object} 写入的 entry
 */
export function moveToDiscarded(kind, item, reason, parked = false) {
  const entry = {
    at: new Date().toISOString(),
    kind,
    reason,
    // ★ 只存哈希前缀，绝不存半个 uid（可被拼回完整 uid）
    ownerIdHash: hashUid(itemOwnerId(kind, item)),
    queuedAt: item?.queuedAt ?? null,
    summary: summarize(kind, item),
    // parked=true 表示「只记录、条目保留在队列」——日志里必须能区分这两种情况，
    // 否则事后排查会以为数据已经被删了。
    parked: Boolean(parked),
  }
  try {
    const cur = readDiscarded()
    const entries = [...cur.entries, entry].slice(-DISCARDED_LIMIT)
    localStorage.setItem(
      keysFor('guest').draftsDiscarded,
      JSON.stringify({ at: entry.at, entries }),
    )
  } catch {
    /* 隐私模式写不进去也不影响主流程 */
  }
  return entry
}

/** 取草稿的 ownerId（四类草稿的 ownerId 位置不同） */
function itemOwnerId(kind, item) {
  if (!item) return null
  if (kind === 'stations') return item.row?.ownerId ?? null
  return item.ownerId ?? null
}

/** 生成一句人可读的摘要（不泄露完整记录内容） */
function summarize(kind, item) {
  if (kind === 'learn') return `学习记录 ${Array.isArray(item?.rows) ? item.rows.length : 0} 条`
  if (kind === 'stationWords') return `小站词条 ${Array.isArray(item?.items) ? item.items.length : 0} 条`
  if (kind === 'generate') return `生词请求 ${Array.isArray(item?.forms) ? item.forms.length : 0} 个`
  if (kind === 'stations') return `小站 1 个（${item?.row?.name || '未命名'}）`
  return '未知类型'
}

// ---------------------------------------------------------------- 认领判定

/**
 * 认领判定（纯函数，可单测）。
 *
 * 每类草稿都带 ownerId，只有等于当前 uid 的才允许上行。这一条同时兜住了两类
 * 跨账号污染：
 *   - learn / stationWords / stations：A 的草稿在 B 会话下会被 RLS 拒绝；
 *   - **generate**：`generateApi.generate()` 由服务端从 JWT 推导 owner，
 *     A 遗留的 generate 草稿在 B 登录后执行，会**把词生成到 B 账号下** ——
 *     比 learn 更隐蔽（不报错，词就进了 B 的库）。
 *
 * @param {string} kind
 * @param {object} item
 * @param {string} uid 当前 auth.uid()
 * @returns {{ ok: true } | { ok: false, verdict: 'discard'|'skip', reason: string }}
 *   - `discard`：结构合法但不属于当前账号 → 删除并记日志；
 *   - `skip`：结构性损坏（缺 rows / stationId / forms）→ 删除并记日志。
 */
export function claim(kind, item, uid) {
  if (!uid || typeof uid !== 'string') return { ok: false, verdict: 'skip', reason: 'no-auth' }
  if (!item || typeof item !== 'object') return { ok: false, verdict: 'skip', reason: 'malformed' }

  const owner = itemOwnerId(kind, item)
  if (typeof owner !== 'string' || owner === '') {
    return { ok: false, verdict: 'skip', reason: 'malformed' }
  }
  if (owner !== uid) return { ok: false, verdict: 'discard', reason: 'owner-mismatch' }

  // 结构性校验（缺字段的草稿推上去必然失败，留着只会反复报错）
  if (kind === 'learn' && !Array.isArray(item.rows)) {
    return { ok: false, verdict: 'skip', reason: 'malformed' }
  }
  if (kind === 'stationWords' && (!item.stationId || !Array.isArray(item.items))) {
    return { ok: false, verdict: 'skip', reason: 'malformed' }
  }
  if (kind === 'generate' && !Array.isArray(item.forms)) {
    return { ok: false, verdict: 'skip', reason: 'malformed' }
  }
  if (kind === 'stations' && (!item.row || !item.row.id)) {
    return { ok: false, verdict: 'skip', reason: 'malformed' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------- 永久失败判定

/**
 * 永久失败判定：RLS / 鉴权 / 资源不存在 → 重试无意义。
 *
 * ★ U1 实测校准 ★
 *   Cloudflare Pages 的 `/supabase` 网关（functions/_middleware.js）**逐字转发**
 *   `upstream.status` / `statusText` / body，只剥离逐跳头 —— 所以错误体在网关
 *   前后**完全一致**，直连实测结果可直接用于校准。**HTTP 状态码一列以 QA 的
 *   生产实测为准**（我第一版注释写的是 401，实际是 403；白名单靠 `code` 命中所以
 *   行为一直正确，但注释会误导后来人，故按实测更正）：
 *
 *   | 场景                    | HTTP | error.code   | error.message                                  |
 *   |-------------------------|------|--------------|------------------------------------------------|
 *   | RLS `with check` 拒绝     | 403  | `'42501'`    | `new row violates row-level security policy…` |
 *   | JWT 无效 / 结构错误       | 401  | `'PGRST301'` | `Expected 3 parts in JWT; got 1` 等            |
 *   | API key 无效             | 401  | **无 code**  | `Invalid API key`                              |
 *   | 表不存在（PGRST）         | 404  | `'PGRST205'` | `Could not find the table …`                   |
 *   | 网络不可达               | —    | `''`         | `TypeError: fetch failed`                      |
 *
 *   注意 RLS 拒绝是 **403 + code 42501**：它既不是 401（那是鉴权），也不能只按
 *   HTTP 判 —— 只按 `status` 会漏掉「无 code 的 Invalid API key」，只按 `code`
 *   也会漏它。所以白名单同时覆盖 code 列表与 message 关键词。
 *
 * ★ 失败方向：默认安全侧 ★
 *   **未识别**的错误一律返回 false（= 可重试）→ 草稿保留 + 继续下一条。
 *   丢弃是永久数据丢失，重试只多花请求 —— 永远不在猜测上丢数据。
 *
 * @param {object|null|undefined} error
 * @returns {boolean}
 */
export function isPermanentError(error) {
  if (!error || typeof error !== 'object') return false
  const code = String(error.code ?? '').trim()
  const msg = String(error.message ?? '').toLowerCase()

  // ① 明确的永久错误码（全部来自上表实测）
  if (['42501', '403', '401', '404', 'pgrst301', 'pgrst205', 'not_found'].includes(code.toLowerCase())) {
    return true
  }
  // ② message 关键词（覆盖「没有 code」的形状，如 Invalid API key）
  if (/row-level security|row level security|permission denied|permission|jwt|invalid api key|not authenticated|api key/.test(msg)) {
    return true
  }
  // ③ 其它一律视为可重试（安全侧）
  return false
}

// ---------------------------------------------------------------- 补传编排

/**
 * 补传编排（认领 / 丢弃 / 永久失败三分，**任何情况下都不阻塞后续条目**）。
 *
 * @param {object} [opts]
 * @param {string}  [opts.scope]   scopeOf(ownerId) 的结果；缺省 'guest'
 * @param {string}  [opts.uid]     当前 auth.uid()；null → 游客，整轮跳过
 * @param {boolean} [opts.force]    忽略 navigator.onLine（手动点同步）
 * @param {(info: {kind: string, done: number, total: number}) => void} [opts.onProgress]
 * @param {(kind: string, item: object) => Promise<{ok: boolean, error?: object|null}>} [opts.push]
 *   上行实现注入点。**仅供测试**：scripts/test-drafts.mjs 需要在无网络的环境里
 *   确定性地造出「可重试失败」与「永久失败」两种形状。drain 的三分语义是本项目
 *   最关键的数据安全逻辑，不能只靠真打网络来验证。
 * @returns {Promise<{ok, pushed, failed, discarded, skippedOffline, skippedNoAuth}>}
 */
export async function drain({ scope = 'guest', uid = null, force = false, onProgress = null, push = null } = {}) {
  if (!uid) return { ok: true, pushed: 0, failed: 0, discarded: 0, parked: 0, skippedOffline: false, skippedNoAuth: true }
  if (!force && isOffline()) {
    return { ok: true, pushed: 0, failed: 0, discarded: 0, parked: 0, skippedOffline: true, skippedNoAuth: false }
  }
  const pushImpl = typeof push === 'function' ? push : pushOne

  let pushed = 0
  let failed = 0
  let discarded = 0
  let parked = 0

  for (const kind of DRAIN_ORDER) {
    const drafts = read(scope)
    const queue = Array.isArray(drafts[kind]) ? drafts[kind] : []
    if (queue.length === 0) continue

    const total = queue.length
    let done = 0
    let i = 0
    // ★ 游标契约（这里改错过一次，GAP-A）★
    //   `i` 指向当前待处理元素。每个分支必须自己决定要不要推进：
    //     - 原地改写（park / 解除 park）→ length 不变 → **必须 i += 1**，
    //       否则会一直重访同一条、死循环；
    //     - `splice(i, 1)` → 后面的元素左移到了 i，**绝不能再 i += 1** ——
    //       那样会把刚移过来的那条整个跳过，破坏「单轮 drain 逐条走完队列」的
    //       契约（首页登录那一次 drain 很可能就是唯一一次机会）。
    //   所以下面的分支里，推进游标的位置各不相同，且都紧贴对应操作。
    while (i < queue.length) {
      const item = queue[i]

      // ① 认领。与错误形态无关的第一道防线：非本账号的条目在推送之前就被摘掉。
      const verdict = claim(kind, item, uid)
      if (!verdict.ok) {
        done += 1
        notifyPendingChanged()
        if (verdict.verdict === 'discard') {
          // 跨账号（A-14）：**保留**并 park，不删除。
          // 它们属于别的账号 —— A 自己的登录态可能马上回来、届时本可正常上行，
          // 现在替别人删掉是不可逆的数据损失。它们不计入 pendingCount，
          // 由 stuckCount 单独展示 + 一键清除。
          queue[i] = { ...item, parked: true, parkedReason: verdict.reason }
          moveToDiscarded(kind, item, verdict.reason, true)
          parked += 1
          i += 1 // 原地改写，length 未变 → 推进
        } else {
          // 结构损坏（缺 rows / stationId 等）：推上去必然失败，留着只会反复报错
          // → 真丢弃。
          //
          // ★ 为什么丢草稿不算丢数据（别误判成数据丢失）★
          //   草稿只是**上行队列项**，不是数据源。真正的数据源是 learn 分区 ——
          //   答题时就已经落盘（本地先于上行持久化），草稿只是「把这份数据送上去」
          //   的一次性载体。所以删草稿不会让学习进度消失：原主人下次登录时，
          //   pull / migrateToCloud 会从 learn 分区重新上行。
          //   ★ 反过来，跨账号时把 A 的草稿「落回 B」才是危险的：那等于用 B 的
          //     身份推 A 的数据，可能造成跨账号重复上行。所以此处宁可丢草稿。
          moveToDiscarded(kind, item, verdict.reason)
          queue.splice(i, 1) // ★ length 变了 → 此处「不」推进 i（GAP-A 的修法）
          discarded += 1
        }
        continue // 无论哪条分支都不阻塞后续
      }

      // 认领通过说明「这个条目现在归当前账号管」：
      //   - 之前因 owner-mismatch 被 park 的 → **解除 park**，正常推送。
      //     这是必须的：A 登出时它的草稿被 park，B 登录后认领失败；等 A 回来
      //     若还跳过它，A 的离线进度就永远传不上去了。
      //   - 之前因 push-rejected 被 park 的 → 只有 force（手动重试 / 登出前
      //     flush）才重推。否则每 30 秒的定时 drain 都会对一条已知推不上去的
      //     条目重复发一次请求，纯属浪费。
      let cur = item
      if (isParked(item)) {
        if (item.parkedReason === 'push-rejected' && !force) {
          i += 1
          continue
        }
        const { parked, parkedReason, ...rest } = item
        void parked
        void parkedReason
        cur = rest
        queue[i] = cur // 原地改写，length 未变
      }

      // ② 上行
      let ok = false
      let lastError = null
      try {
        const res = await pushImpl(kind, cur)
        ok = Boolean(res && res.ok)
        lastError = (res && res.error) || null
      } catch (e) {
        ok = false
        lastError = e && typeof e === 'object' ? e : { code: '', message: String(e) }
      }

      if (ok) {
        queue.splice(i, 1) // ★ length 变了 → 不推进 i
        pushed += 1
        done += 1
        notifyPendingChanged()
        if (onProgress) onProgress({ kind, done, total })
        continue
      }

      // ③ 永久失败（本 scope + 已实测白名单）→ **park 保留**，记日志，不阻塞后续。
      //   不删除：删了就找不回来了，而用户可能只是暂时登出/换号。
      //   不计入 pendingCount：否则徽标永远显示一个减不掉的数字（A-14）。
      //   （丢弃草稿不丢数据的理由同上：数据源是 learn 分区，见 ① 的注释。）
      if (isPermanentError(lastError)) {
        queue[i] = { ...item, parked: true, parkedReason: 'push-rejected' }
        moveToDiscarded(kind, item, 'push-rejected', true)
        parked += 1
        done += 1
        i += 1 // 原地改写，length 未变 → 推进
        notifyPendingChanged()
        continue
      }

      // ④ 可重试失败 → **原样保留**，继续下一条（不 break，见文件头注释）
      failed += 1
      i += 1
    }

    // 一次性落盘本 kind 的最终队列
    const cur = read(scope)
    cur[kind] = queue
    write(cur, scope)
  }

  notifyPendingChanged()
  return { ok: failed === 0, pushed, failed, discarded, parked, skippedOffline: false, skippedNoAuth: false }
}

/**
 * 推送单条草稿（全部幂等）。
 * @param {string} kind
 * @param {object} item 已通过 claim 校验
 * @returns {Promise<{ok: boolean, error: object|null}>}
 */
async function pushOne(kind, item) {
  if (kind === 'stationWords') {
    const { ownerId, stationId, items } = item
    if (!ownerId || !stationId || !Array.isArray(items)) return { ok: false, error: { code: 'BAD_REQUEST', message: '草稿结构损坏' } }
    const { error } = await stationWordsApi.addMany(ownerId, stationId, items)
    return { ok: !error, error }
  }
  if (kind === 'generate') {
    // ★ GAP-13：`ownerId` 必须保留 ★
    //   generateApi.generate(forms, stationId, onProgress) 根本没有 ownerId 参数
    //   ——owner 100% 由服务端从 JWT 推导。所以这里的 ownerId 只能用于**认领**
    //   （claim 已在上游做完），绝不能因为「用不上」就把它从解构里丢掉：
    //   一旦丢掉，跨账号的 generate 草稿就会在 B 的会话下真的把词生成到 B 账号下
    //   （不留学习痕迹，B 只看到一批陌生词条且无法解释来源）。
    //   这里显式解构出来并留空赋值，就是为了让「它没被用上」这件事在代码里可见。
    const { ownerId: _ownerIdForClaimOnly, stationId, forms } = item
    void _ownerIdForClaimOnly
    if (!Array.isArray(forms) || forms.length === 0) return { ok: false, error: { code: 'BAD_REQUEST', message: '草稿结构损坏' } }
    const { error } = await generateApi.generate(forms, stationId || null)
    return { ok: !error, error }
  }
  if (kind === 'learn') {
    const { ownerId, rows } = item
    if (!ownerId || !Array.isArray(rows)) return { ok: false, error: { code: 'BAD_REQUEST', message: '草稿结构损坏' } }
    const { error } = await learnSyncApi.pushBatch(ownerId, rows)
    return { ok: !error, error }
  }
  if (kind === 'stations') {
    // 小站 CRUD 离线补传：用客户端生成的 uuid 做幂等键，重复执行只会覆盖同一行
    const { row } = item
    if (!row || !row.id || !row.ownerId) return { ok: false, error: { code: 'BAD_REQUEST', message: '草稿结构损坏' } }
    const { error } = await stationsApi.upsert(row)
    return { ok: !error, error }
  }
  return { ok: false, error: { code: 'BAD_REQUEST', message: `未知草稿类型 ${kind}` } }
}
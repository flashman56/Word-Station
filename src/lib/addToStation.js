/**
 * 「把若干词加入小站」的唯一出口（在线直写，失败/离线落草稿）
 * ------------------------------------------------------------------
 * 它放在 lib/ 而**不是** lib/cloud/ 下，是有意的：它是**编排层**，同时调
 * cloud 数据访问层与 offline 草稿队列。放进 cloud/ 会造成「数据访问层里混编排」
 * 的层次倒置 —— 而这正是本项目此前反复出现的那类问题的形状（UI 里内联一份、
 * hook 里再来一份，两份入队逻辑悄悄漂移）。
 *
 * ★ 为什么在线失败也入队（不是只看 navigator.onLine）★
 *   `stationWordsApi.addMany` 有 15s 超时，超时 / 网络抖动在「Wi-Fi 标志连着
 *   但没网」时也会发生。不入队 = 静默丢词，而用户看到的只是「已加入 0 词」。
 *
 * ★ 唯一的例外：服务端校验错（NO_AUTH / BAD_REQUEST / DUPLICATE_NAME）★
 *   那类错误重试一万次也一样失败，入队只会变成永不消除的 pending。这里原样
 *   返回、不入队。
 *
 * ★ payload 契约（与 offline.js 的 claim('stationWords') 校验逐字对齐）★
 *   enqueue('stationWords', { ownerId, stationId, items }, scope)
 *   其中 items = [{ wordKey, source: 'public' | 'user' }]。
 *   stationId 必须真值、items 必须是数组、ownerId 必须等于当前 uid，
 *   否则 claim 判 malformed 直接丢弃 —— 而本地投影还在，用户会以为「加过了」。
 *   跨账号时 claim 判 owner-mismatch → park 保留（不推送、不阻塞、不计入 pending）。
 */
import * as stationWordsApi from './cloud/stationWords.js'
import * as offlineApi from './cloud/offline.js'
import { scopeOf } from './migrate.js'

/**
 * 服务端校验类错误码：重试无意义，绝不入队。
 *
 * ⚠ 边界说明：这张表与 cloud/offline.js 的 isPermanentError 是**两套判据**、
 *   两个用途 —— 那张判「队列里的草稿这条还推得上去吗」（且本轮红线不允许改它），
 *   这张判「这次调用失败该不该把同样的东西再排一次」。两者不能互相替代。
 */
const NON_RETRYABLE = new Set(['NO_AUTH', 'BAD_REQUEST', 'DUPLICATE_NAME'])

/**
 * 把若干词加入小站。
 *
 * @param {object} args
 * @param {string|null} args.ownerId 当前账号；null → 直接返回 NO_AUTH，**不入队**
 *   （游客草稿会在登录后被 claim 判 owner-mismatch park 掉，白排一场）
 * @param {string} args.stationId 目标小站 id
 * @param {Array<{wordKey: string, source?: 'public'|'user'}>} args.items
 * @param {boolean} [args.online] 缺省用 navigator.onLine !== false
 * @param {string}  [args.scope]  缺省 scopeOf(ownerId)
 * @returns {Promise<{
 *   ok: boolean,
 *   inserted: number,
 *   skipped: number,
 *   offline: number,
 *   error: {code: string, message: string}|null
 * }>}
 *   ok=false 仅代表「一次都没写进去」；offline>0 表示已落草稿、联网后会自动补传。
 */
export async function addToStation({ ownerId, stationId, items, online, scope } = {}) {
  /** 空结果的统一形状：发请求前就把契约定死，调用方不必判 undefined */
  const empty = { ok: true, inserted: 0, skipped: 0, offline: 0, error: null }

  if (!ownerId) {
    return { ok: false, inserted: 0, skipped: 0, offline: 0, error: { code: 'NO_AUTH', message: '请先登录后再把小站加词' } }
  }
  if (!stationId) {
    return { ok: false, inserted: 0, skipped: 0, offline: 0, error: { code: 'BAD_REQUEST', message: '请先选择一个小站' } }
  }

  // 过滤掉没有 wordKey 的脏项：addMany 也会过滤，但这里先滤一次才能让
  // 「offline = items.length」这个计数与实际入队条数一致（否则文案会虚高）
  const clean = (Array.isArray(items) ? items : [])
    .filter((it) => it && typeof it.wordKey === 'string' && it.wordKey !== '')
    .map((it) => ({ wordKey: it.wordKey, source: it.source === 'user' ? 'user' : 'public' }))

  if (clean.length === 0) return empty

  const myScope = scope || scopeOf(ownerId)
  const isOnline = online === undefined ? !(typeof navigator !== 'undefined' && navigator.onLine === false) : Boolean(online)

  // ---- 离线：直接入队 ----
  if (!isOnline) {
    offlineApi.enqueue('stationWords', { ownerId, stationId, items: clean }, myScope)
    return { ok: true, inserted: 0, skipped: 0, offline: clean.length, error: null }
  }

  // ---- 在线：先试网络 ----
  const { data, error } = await stationWordsApi.addMany(ownerId, stationId, clean)

  if (!error) {
    return {
      ok: true,
      inserted: (data && data.inserted) || 0,
      skipped: (data && data.skipped) || 0,
      offline: 0,
      error: null,
    }
  }

  // ---- 在线失败：校验错原样抛出（不入队），其余入队 ----
  if (NON_RETRYABLE.has(String(error.code))) {
    return { ok: false, inserted: 0, skipped: 0, offline: 0, error }
  }
  offlineApi.enqueue('stationWords', { ownerId, stationId, items: clean }, myScope)
  return { ok: false, inserted: 0, skipped: 0, offline: clean.length, error }
}

export default addToStation

/**
 * QA 专用的假Supabase 客户端（被 qa2-a12.mjs / qa2-isolation.mjs 经esbuild 顶替
 * src/lib/supabase.js）。
 *
 * 目的有两个：
 *   1. **不打真网络** —— jsdom 里的 useLearnCloud 一旦带 ownerId 就会去pull /
 *      migrateToCloud，真打 fetch 会让测试变慢且不确定；
 *   2. **服务端语义正确** —— 行的 owner_id 恒等于调用方 JWT 里的 uid，
 *      客户端无法伪造。这正是 GAP-13 要验证的那条规则。
 *
 * 仅供测试。不参与任何构建。
 */

/** 每个 owner 一张表（learn_records 等），行按 word_key 存 */
export const qserver = {
  tables: new Map(),
  /** 记录每次上行/下行的调用，供断言 */
  calls: [],
  reset() {
    this.tables = new Map()
    this.calls = []
  },
  _tbl(t, owner) {
    if (!this.tables.has(t)) this.tables.set(t, new Map())
    const byOwner = this.tables.get(t)
    if (!byOwner.has(owner)) byOwner.set(owner, new Map())
    return byOwner.get(owner)
  },
  upsert(t, ownerId, rows) {
    this.calls.push({ op: 'upsert', table: t, ownerId, wordKeys: rows.map((r) => r.word_key) })
    const tbl = this._tbl(t, ownerId)
    rows.forEach((r) => tbl.set(r.word_key, r))
    return { data: rows, error: null }
  },
  select(t, ownerId, gt) {
    const byOwner = this.tables.get(t)
    const all = byOwner ? [...byOwner.get(ownerId).values()] : []
    const rows = gt ? all.filter((r) => r.updated_at > gt) : all
    this.calls.push({ op: 'select', table: t, ownerId, returned: rows.map((r) => r.word_key) })
    return { data: rows, error: null }
  },
  wordKeys(t, ownerId) {
    const byOwner = this.tables.get(t)
    return byOwner ? [...byOwner.get(ownerId).keys()] : []
  },
}

export const hasSupabase = true

/** 当前令牌里的 uid（模拟 JWT）。测试通过 setToken 切换登录身份。 */
let tokenUid = null
export function setToken(uid) {
  tokenUid = uid
}

export const supabase = {
  auth: {
    getSession: async () => ({
      data: { session: tokenUid ? { access_token: 'x', user: { id: tokenUid } } : null },
      error: null,
    }),
    getUser: async () => ({ data: { user: tokenUid ? { id: tokenUid } : null }, error: null }),
  },
  from(t) {
    let gt = null
    const api = {
      select() {
        return api
      },
      eq() {
        return api
      },
      order() {
        return api
      },
      gt(col, v) {
        if (col === 'updated_at') gt = v
        return api
      },
      abortSignal() {
        return api
      },
      then(resolve2) {
        const r = tokenUid
          ? qserver.select(t, tokenUid, gt)
          : { data: null, error: { code: 'PGRST301', message: 'JWT 缺失' } }
        return Promise.resolve(r).then(resolve2)
      },
      upsert(rows) {
        const r = tokenUid
          ? qserver.upsert(t, tokenUid, rows)
          : {
              data: null,
              error: { code: '42501', message: 'new row violates row-level security policy' },
            }
        return Promise.resolve(r)
      },
    }
    return api
  },
  functions: {
    invoke: async () => ({ data: null, error: { message: 'QA fake: functions not available' } }),
  },
}

export async function getAccessToken() {
  return tokenUid ? 'x' : null
}
export async function getUserId() {
  return tokenUid
}
export function normalize(res, fb = 'INTERNAL') {
  if (!res || !res.error) return { data: res?.data ?? null, error: null }
  return { data: null, error: { code: res.error.code || fb, message: res.error.message || '未知错误' } }
}
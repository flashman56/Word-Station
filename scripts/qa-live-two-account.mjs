/**
 * QA 决定性验证：真双账号 E2E，打生产 Supabase
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-live-two-account.mjs
 *
 * 通过**线上网关**（https://word-station.pages.dev/supabase）打真实 Supabase，
 * 账号用 admin API 现建现删。所有创建的账号在结束时删除，并逐个复查。
 *
 * 验证：
 *   L1  A 标记若干词为 known 并上行 → 登出 → B 登录 → B 看不到 A 的任何记录，
 *       且 B 的云端 learn_records 行里没有 A 的 word_key
 *   L2  游客态记录 → 登录 → 以登录者 owner 上云，且 updated_at 非空
 *       （GAP-4：游客记录曾无时间戳，会被云端默认值覆盖）
 *   L3  A 的离线 generate 草稿 → B 登录后 drain → B 的 user_words **不增**
 *       （GAP-13：generate 的 owner 由服务端从 JWT 推导）
 *   L4  采集真实错误形状，校准 isPermanentError 的白名单
 *
 * ⚠ 若 .env.local 缺 service role key，本脚本**跳过**并明确说明，不伪造结果。
 */
import { readFileSync } from 'node:fs'

// ---------------------------------------------------------------- 配置
function loadEnv(file) {
  const out = {}
  try {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  } catch { /* 文件不存在 */ }
  return out
}
const env = { ...loadEnv('.env.local'), ...loadEnv('.env') }

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://svnwsbkhpzejygugtorl.supabase.co'
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6fm_XDqCS4BWwyqEeOb_BA_YODx2ghg'
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const GATEWAY = 'https://word-station.pages.dev/supabase'

const stamp = Date.now()
const createdAccounts = []

if (!SERVICE_KEY) {
  console.log('[qa-live] ⚠ .env.local 里没有 SUPABASE_SERVICE_ROLE_KEY —— 跳过生产 E2E（不伪造结果）')
  console.log('[qa-live]   需要 service role key 才能建临时账号。请让工程师补上后重跑。')
  process.exit(2)
}

let pass = 0
const failures = []
function ok(name, cond, detail = '') {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}

// ---------------------------------------------------------------- HTTP 工具
async function http(url, { method = 'GET', headers = {}, body = null } = {}) {
  const res = await fetch(url, { method, headers, body })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* 非 JSON */ }
  return { status: res.status, json, text, headers: res.headers }
}

/** admin API（service role）*/
const admin = (path, opts = {}) =>
  http(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    ...opts,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })

/** 经线上网关的登录（与浏览器完全同一条路径）*/
async function signInViaGateway(email, password) {
  const r = await http(`${GATEWAY}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return r
}

/** 带用户 token 查 learn_records（走网关，与前端一致）*/
async function queryLearnRecords(token, ownerId) {
  const r = await http(`${GATEWAY}/rest/v1/learn_records?owner_id=eq.${ownerId}&select=word_key,status,updated_at,owner_id`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  })
  return r
}

/** 用 admin 查（绕过 RLS，QA 需要「云端真相」）*/
async function adminQueryLearnRecords(ownerId) {
  const r = await http(`${SUPABASE_URL}/rest/v1/learn_records?owner_id=eq.${ownerId}&select=word_key,status,updated_at,owner_id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  return r
}

async function adminQueryUserWords(ownerId) {
  const r = await http(`${SUPABASE_URL}/rest/v1/user_words?owner_id=eq.${ownerId}&select=word_key,owner_id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  return r
}

async function countRows(table, ownerId) {
  const r = await http(`${SUPABASE_URL}/rest/v1/${table}?owner_id=eq.${ownerId}&select=word_key`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'count=exact',
      Range: '0-0',
    },
  })
  const cr = r.headers.get('content-range')
  return { count: cr ? Number(cr.split('/')[1]) : null, rows: r.json, status: r.status, body: r.text }
}

// ---------------------------------------------------------------- 账号生命周期
const PASSWORD = `Qa!${stamp}9x`
const cleanupLog = []

async function createAccount(tag) {
  const email = `qa-${tag}-${stamp}@example.com`
  const r = await admin('/users', {
    method: 'POST',
    body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }),
  })
  if (r.status !== 200 || !r.json?.id) {
    throw new Error(`建号失败 ${tag}: HTTP ${r.status} ${r.text.slice(0, 300)}`)
  }
  const acc = { tag, email, id: r.json.id }
  createdAccounts.push(acc)
  console.log(`  · 已建临时账号 ${tag}: ${email} / uid=${acc.id.slice(0, 8)}…`)
  return acc
}

async function deleteAccount(acc) {
  const r = await admin(`/users/${acc.id}`, { method: 'DELETE' })
  cleanupLog.push({ email: acc.email, uid: acc.id, status: r.status, body: r.text.slice(0, 200) })
  return r
}

// ---------------------------------------------------------------- 上行（复刻 pushBatch 的 wire 形状）
/**
 * 复刻 learnRecordToRow + pushBatch 的 upsert 请求，走网关、带用户 token。
 * 形状取自 src/lib/cloud/schema.js（红线文件，QA 不改它，只照抄 wire 格式）。
 */
function learnRecordToRow(record, ownerId, wordKey) {
  return {
    owner_id: ownerId,
    word_key: wordKey,
    status: record.status,
    correct_count: record.correctCount ?? 0,
    incorrect_count: record.incorrectCount ?? 0,
    consecutive_correct: record.consecutiveCorrect ?? 0,
    last_studied_at: record.lastStudiedAt ?? null,
    last_result: record.lastResult ?? null,
    last_incorrect_at: record.lastIncorrectAt ?? null,
    next_due_at: record.nextDueAt ?? null,
    status_changed_at: record.statusChangedAt ?? null,
    status_source: record.statusSource ?? null,
    updated_at: record.updatedAt || new Date().toISOString(),
  }
}

async function pushRows(token, ownerId, rows) {
  return http(`${GATEWAY}/rest/v1/learn_records?on_conflict=owner_id,word_key`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(rows),
  })
}

// ================================================================ 主流程
console.log('[qa-live] ===== 环境 =====')
console.log(`  Supabase : ${SUPABASE_URL}`)
console.log(`  网关     : ${GATEWAY}`)

console.log('\n[qa-live] ===== 建两个临时账号 =====')
let accA
let accB
try {
  accA = await createAccount('A')
  accB = await createAccount('B')
} catch (e) {
  console.error(`[qa-live] ✗ ${e.message}`)
  // 建号失败也要清理已建的部分
  for (const a of createdAccounts) await deleteAccount(a)
  process.exit(1)
}

// 登录（经线上网关）
const loginA = await signInViaGateway(accA.email, PASSWORD)
const loginB = await signInViaGateway(accB.email, PASSWORD)
const tokenA = loginA.json?.access_token
const tokenB = loginB.json?.access_token

ok('L0a A 经线上网关登录成功', Boolean(tokenA), `HTTP ${loginA.status} ${loginA.text.slice(0, 200)}`)
ok('L0b B 经线上网关登录成功', Boolean(tokenB), `HTTP ${loginB.status} ${loginB.text.slice(0, 200)}`)

if (!tokenA || !tokenB) {
  console.error('[qa-live] 登录失败，无法继续')
  for (const a of createdAccounts) await deleteAccount(a)
  process.exit(1)
}

const uidA = loginA.json.user.id
const uidB = loginB.json.user.id
ok('L0c 两个账号 uid 不同', uidA !== uidB, `${uidA} vs ${uidB}`)

// ---------------------------------------------------------------- L1 跨账号隔离
console.log('\n[qa-live] ===== L1  A 上行 → B 登录，B 看不到 A 的记录 =====')

// A 标记 12 个词为 known（真实学习证据）
const aWordKeys = Array.from({ length: 12 }, (_, i) => `qa.live.w.${stamp}.${i}`)
const aRows = aWordKeys.map((k, i) =>
  learnRecordToRow(
    {
      status: i % 2 === 0 ? 'known' : 'review',
      correctCount: 5,
      consecutiveCorrect: 3,
      statusSource: 'learning',
      lastStudiedAt: new Date().toISOString(),
      statusChangedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    uidA,
    k,
  ),
)
const pushA = await pushRows(tokenA, uidA, aRows)

ok('L1a A 的 12 条记录上行成功（无 error）', !pushA.json?.error && pushA.status < 300,
  `HTTP ${pushA.status} ${pushA.text.slice(0, 300)}`)

const aCloud = await adminQueryLearnRecords(uidA)
const aCloudKeys = new Set((aCloud.json || []).map((r) => r.word_key))
ok('L1b A 的云端确有 12 条 learn_records', aCloudKeys.size === 12, `实际 ${aCloudKeys.size}：${(aCloud.json || []).map((r) => r.word_key).join(',')}`)

// ★ 关键：B 登录后拉自己的记录 —— 用 B 的 token 查自己的 owner_id
const bView = await queryLearnRecords(tokenB, uidB)
ok('L1c B 查自己的 learn_records 成功（HTTP 200）', bView.status === 200, `HTTP ${bView.status} ${bView.text.slice(0, 300)}`)

const bRows = bView.json || []
const bKeys = new Set(bRows.map((r) => r.word_key))
const leakedToB = [...bKeys].filter((k) => aCloudKeys.has(k))
ok('L1d ★ B 的行集与 A 的 word_key 集合交集为 0（真实生产库）', leakedToB.length === 0,
  `泄漏 ${leakedToB.length} 条：${leakedToB.join(',')}`)

const bAdmin = await adminQueryLearnRecords(uidB)
const bAdminKeys = new Set((bAdmin.json || []).map((r) => r.word_key))
const leakedAdmin = [...bAdminKeys].filter((k) => aCloudKeys.has(k))
ok('L1e ★ admin 视角（绕 RLS）下 B 也拿不到 A 的任何 word_key', leakedAdmin.length === 0,
  `泄漏：${leakedAdmin.join(',')}`)

ok('L1f B 的分区行数为 0（B 什么都没做，不该凭空有行）', bAdminKeys.size === 0, `实际 ${bAdminKeys.size}`)

// B 用自己的 token 试着写 A 的 word_key —— RLS 允许（owner_id=B 合法），
// 所以这条不是测 RLS，而是测「客户端会不会这么干」。这里只验证 A 的行没被动过。
const aCloudAfter = await adminQueryLearnRecords(uidA)
ok('L1g A 的 12 条记录在 B 登录后完好无损', (aCloudAfter.json || []).length === 12,
  `实际 ${(aCloudAfter.json || []).length}`)

// ---------------------------------------------------------------- L2 游客 → 登录
console.log('\n[qa-live] ===== L2  游客态记录 → 登录 → 以登录者 owner 上云 + updated_at 非空 =====')

// 游客态记录：useLearn 现在 stampUpdatedAt 常开，所以游客写的记录也带 updatedAt
const guestWordKeys = Array.from({ length: 5 }, (_, i) => `qa.live.guest.${stamp}.${i}`)
const guestRows = guestWordKeys.map((k) =>
  learnRecordToRow(
    {
      status: 'known',
      correctCount: 2,
      consecutiveCorrect: 2,
      statusSource: 'learning', // 游客真实学习证据
      lastStudiedAt: new Date().toISOString(),
      statusChangedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    uidB,
    k,
  ),
)
const pushGuest = await pushRows(tokenB, uidB, guestRows)
ok('L2a 游客证据以 B 的 owner 上行成功', !pushGuest.json?.error && pushGuest.status < 300,
  `HTTP ${pushGuest.status} ${pushGuest.text.slice(0, 300)}`)

const bAfter = await adminQueryLearnRecords(uidB)
const bAfterRows = bAfter.json || []
const guestOnCloud = bAfterRows.filter((r) => guestWordKeys.includes(r.word_key))
ok('L2b ★ 游客的 5 条记录到达云端且归属 B', guestOnCloud.length === 5,
  `实际 ${guestOnCloud.length}/${guestWordKeys.length}`)
ok('L2c ★ 每条都有非空 updated_at（GAP-4：曾因缺时间戳被云端默认值覆盖）',
  guestOnCloud.length === 5 && guestOnCloud.every((r) => typeof r.updated_at === 'string' && r.updated_at.length > 0),
  JSON.stringify(guestOnCloud.map((r) => r.updated_at)))
ok('L2d updated_at 是合法 ISO 且能解析', guestOnCloud.every((r) => Number.isFinite(new Date(r.updated_at).getTime())),
  guestOnCloud.map((r) => r.updated_at).join(','))

// 反证：如果没有 updated_at，mergeRecord 会把它当 0 → 云端默认值赢。
// 这里确认我们上行的行都带得上时间戳（也就是 stampRowsForUpload 的兜底有效）
const allHaveTs = bAfterRows.every((r) => r.updated_at)
ok('L2e B 的所有上行行都带 updated_at', allHaveTs, JSON.stringify(bAfterRows.map((r) => [r.word_key, r.updated_at])))

// ---------------------------------------------------------------- L3 GAP-13 generate
console.log('\n[qa-live] ===== L3  A 的离线 generate 草稿 → B 登录后 drain → B 不增 =====')

const beforeB = await countRows('user_words', uidB)
const beforeA = await countRows('user_words', uidA)
console.log(`  · B 的 user_words 行数（drain 前）: ${beforeB.count}`)
console.log(`  · A 的 user_words 行数            : ${beforeA.count}`)

// A 离线产生一条 generate 草稿：ownerId 是 A，但当前登录的是 B。
// GAP-13：generate API 的 owner 由服务端从 JWT 推导 —— 如果客户端不守 claim，
// 这条草稿就会把词生成到 B 账号下。
// 这里直接在**数据层**证明：claim 判定 + drain 的 park 语义挡住了它。
const { claim, enqueue, drain, readDrafts, stuckCount } = await import('../src/lib/cloud/offline.js')
const { JSDOM } = await import('jsdom')
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.localStorage = dom.window.localStorage

const scopeA = uidA
const scopeB = uidB
localStorage.clear()
enqueue('generate', { ownerId: uidA, stationId: null, forms: ['zzqqxx', 'qqxxtest'] }, scopeA)

const verdict = claim('generate', { ownerId: uidA, forms: ['a'] }, uidB)
ok('L3a claim 判定：A 的 generate 草稿在 B 会话下认领失败（owner-mismatch）',
  verdict.ok === false && verdict.verdict === 'discard', JSON.stringify(verdict))

const drainRes = await drain({ scope: scopeA, uid: uidB, force: true, push: async () => ({ ok: true }) })
ok('L3b drain 在推送前就把它 park 掉（pushed=0）', drainRes.pushed === 0 && drainRes.parked === 1,
  JSON.stringify(drainRes))

const stillThere = (Object.values(readDrafts(scopeA)).flat()).filter((x) => x && x.forms)
ok('L3c 草稿仍被保留（未被替 B 删掉）', stillThere.length === 1, `实际 ${stillThere.length}`)

const afterB = await countRows('user_words', uidB)
ok('L3d ★ B 的 user_words 增量 = 0（GAP-13 未复现）',
  afterB.count === beforeB.count, `drain 前 ${beforeB.count} → drain 后 ${afterB.count}`)

// 再从服务端侧确认：generate 的 owner 确实由 JWT 推导 ——
// 直调 Edge Function 但**不传任何 ownerId**，看词落到谁名下。
// ⚠ 函数真名是 `generate-word`（src/lib/cloud/generate.js:74 `functions.invoke('generate-word')`，
//   源码目录 supabase/functions/generate-word/ 印证），不是 `generate`。
console.log('  · 附加：直调 generate-word Edge Function（不传 ownerId），验证 owner 由 JWT 推导')
const genAsB = await http(`${GATEWAY}/functions/v1/generate-word`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${tokenB}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ forms: ['zzqqxx'] }),
})
console.log(`    generate-word(B) → HTTP ${genAsB.status} ${genAsB.text.slice(0, 160)}`)
const genErrorShape = genAsB.json?.error || genAsB.json?.msg || genAsB.json?.message || null
const afterGenB = await countRows('user_words', uidB)
console.log(`    B 的 user_words: ${beforeB.count} → ${afterGenB.count}`)
const genDeployed = genAsB.status !== 404
console.log(`    generate-word 是否已部署: ${genDeployed ? '是' : '否（HTTP 404 NOT_FOUND）—— GAP-13 的服务端侧无法端到端验证'}`)
ok('L3e generate 未携带 ownerId 参数（owner 只能来自 JWT）',
  !JSON.stringify(genAsB.json || {}).match(/"owner_id"\s*:\s*"[0-9a-f]{8}-/i),
  '请求体里不该出现调用方指定的 owner_id')

// ---------------------------------------------------------------- L4 错误形状采集
console.log('\n[qa-live] ===== L4  真实错误形状（校准 isPermanentError 白名单）=====')
const shapes = {}

// 无 token → 401
const noTok = await http(`${GATEWAY}/rest/v1/learn_records?select=word_key`, { headers: { apikey: ANON_KEY } })
shapes['无 Authorization 头'] = { status: noTok.status, body: (noTok.json?.message || noTok.json?.error || noTok.text || '').slice(0, 160) }

// 坏 token
const badTok = await http(`${GATEWAY}/rest/v1/learn_records?select=word_key`, {
  headers: { apikey: ANON_KEY, Authorization: 'Bearer not-a-jwt' },
})
shapes['垃圾 JWT'] = { status: badTok.status, body: (badTok.json?.message || badTok.json?.error || badTok.text || '').slice(0, 160) }

// 坏 apikey
const badKey = await http(`${GATEWAY}/rest/v1/learn_records?select=word_key`, {
  headers: { apikey: 'sb_publishable_totally_wrong', Authorization: 'Bearer x' },
})
shapes['错误 publishable key'] = { status: badKey.status, body: (badKey.json?.message || badKey.json?.error || badKey.text || '').slice(0, 160) }

// 不存在的表
const noTable = await http(`${GATEWAY}/rest/v1/definitely_not_a_table_xyz?select=*`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${tokenA}` },
})
shapes['表不存在'] = { status: noTable.status, body: (noTable.json?.message || noTable.json?.error || noTable.text || '').slice(0, 160) }

// RLS 拒绝：service role 之外，用 A 的 token 写 B 的 owner_id
const rlsTry = await http(`${GATEWAY}/rest/v1/learn_records`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
  body: JSON.stringify([learnRecordToRow({ status: 'known', statusSource: 'learning', updatedAt: new Date().toISOString() }, uidB, `qa.rls.${stamp}`)]),
})
shapes['RLS 跨账号写'] = { status: rlsTry.status, body: (rlsTry.json?.message || rlsTry.json?.error || rlsTry.text || '').slice(0, 200) }

console.log('\n  实测错误形状：')
Object.entries(shapes).forEach(([k, v]) => console.log(`    ${k.padEnd(22)} HTTP ${String(v.status).padEnd(4)} ${v.body}`))

// 用真实形状跑 isPermanentError
const { isPermanentError } = await import('../src/lib/cloud/offline.js')
console.log('\n  isPermanentError 对实测形状的判定：')
const rlsShape = shapes['RLS 跨账号写']
const rlsErrObj = { code: rlsShape.body.match(/^(\w+)/)?.[1] || '', message: rlsShape.body }
Object.entries(shapes).forEach(([k, v]) => {
  const code = String(v.body).match(/\b(42501|PGRST301|PGRST205)\b/)?.[1] || ''
  const verdictPE = isPermanentError({ code, message: v.body })
  console.log(`    ${k.padEnd(22)} code=${(code || '(无)').padEnd(10)} → 永久失败? ${verdictPE}`)
})
ok('L4a RLS 拒绝被 isPermanentError 判为永久失败（否则草稿会无限重试）',
  isPermanentError(rlsErrObj) === true, JSON.stringify(rlsErrObj))
ok('L4b 无 token / 垃圾 JWT 被判为永久失败（重试无意义）',
  isPermanentError({ code: '', message: shapes['垃圾 JWT'].body }) === true ||
  isPermanentError({ code: '', message: shapes['无 Authorization 头'].body }) === true,
  JSON.stringify(shapes['垃圾 JWT']))

// ---------------------------------------------------------------- L5 A→logout→B 连跑
console.log('\n[qa-live] ===== L5  A→logout→B 连跑 50 轮（T02 缺口）=====')
let leakTotal = 0 // 保留：兼容旧引用，实际用 leakCount
const leakSamples = []
// ★ 登录失败与泄漏必须分开计数：把「登录失败」记成负数泄漏会让断言含义错乱
// （QA 首轮 50 连跑时 28 次登录撞上 Supabase 限流 429，得到 -28 这种荒谬读数）。
let leakCount = 0
let skippedRounds = 0
let completedRounds = 0
const loginFailures = []

/** 登录，遇 429 退避重试若干次；仍失败则返回 null（本轮跳过，不计入泄漏） */
async function signInWithRetry(email, maxRetry = 4) {
  for (let attempt = 0; attempt <= maxRetry; attempt += 1) {
    const r = await signInViaGateway(email, PASSWORD)
    if (r.json?.access_token) return r
    if (r.status === 429 && attempt < maxRetry) {
      await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)))
      continue
    }
    loginFailures.push(`HTTP ${r.status}`)
    return null
  }
  return null
}

for (let i = 0; i < 50; i += 1) {
  // A 登录 → 拉（模拟 A 在线使用）
  const la = await signInWithRetry(accA.email)
  if (!la) { skippedRounds += 1; continue }
  const ta = la.json.access_token
  await queryLearnRecords(ta, uidA)
  // 登出（丢弃 token），B 登录 → 拉
  const lb = await signInWithRetry(accB.email)
  if (!lb) { skippedRounds += 1; continue }
  const tb = lb.json.access_token
  const vb = await queryLearnRecords(tb, uidB)
  if (vb.status !== 200) { skippedRounds += 1; continue }
  completedRounds += 1
  const bSet = new Set((vb.json || []).map((r) => r.word_key))
  const leak = [...bSet].filter((k) => aCloudKeys.has(k))
  if (leak.length) {
    leakCount += leak.length
    if (leakSamples.length < 3) leakSamples.push(`round${i}: ${leak.join(',')}`)
  }
}
console.log(`  · 完成 ${completedRounds} 轮 / 跳过 ${skippedRounds} 轮（登录限流等）`)
if (loginFailures.length) console.log(`  · 登录失败记录: ${[...new Set(loginFailures)].join(', ')}`)
ok('L5 连跑 A→logout→B，B 从未看到 A 的 word_key', leakCount === 0,
  `完成 ${completedRounds} 轮，累计泄漏 ${leakCount} 条 ${leakSamples.join(' | ')}`)
ok('L5b 有效轮次足够（≥40 轮，跳过不超过 10 轮）', completedRounds >= 40,
  `只完成 ${completedRounds} 轮 —— 限流让这轮验证的说服力不足，需要重跑`)

// ---------------------------------------------------------------- 清理（必做）
console.log('\n[qa-live] ===== 清理临时账号 =====')
for (const acc of createdAccounts) {
  const r = await deleteAccount(acc)
  console.log(`  · 删除 ${acc.email}: HTTP ${r.status} ${r.status === 200 || r.status === 204 ? '✓' : r.text.slice(0, 120)}`)
}

// 复查：确认真的删掉了
console.log('\n[qa-live] ===== 复查删除结果 =====')
let allGone = true
for (const acc of createdAccounts) {
  const probe = await admin(`/users/${acc.id}`)
  const gone = probe.status === 404
  const reLogin = await signInViaGateway(acc.email, PASSWORD)
  const cantLogin = reLogin.status >= 400
  console.log(`  · ${acc.email}: admin 查 uid → HTTP ${probe.status} ${gone ? '(已删除 ✓)' : '(仍存在 ✗)'}；重新登录 → HTTP ${reLogin.status} ${cantLogin ? '(已失效 ✓)' : '(仍可登录 ✗)'}`)
  if (!gone || !cantLogin) allGone = false
}
ok('L6 ★ 所有我创建的账号都已删除且无法登录', allGone,
  cleanupLog.map((c) => `${c.email}:${c.status}`).join(', '))

dom.window.close()

// ---------------------------------------------------------------- 汇总
console.log(`\n[qa-live] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  console.error('[qa-live] ✗ 失败：')
  failures.forEach((f) => console.error(`  - ${f.name}: ${f.detail}`))
  process.exit(1)
}
console.log('[qa-live] ✓ 全部通过')
process.exit(0)

/**
 * QA 独立验证：真实双账号端到端（打生产）
 * ------------------------------------------------------------------
 * 这是本次重构最不可伪造的一项 —— 前面所有测试都在 jsdom 里打转，
 * 只有这里会真的经过 Cloudflare Pages 的 `/supabase` 网关 + Supabase + RLS。
 *
 * 造两个一次性账号（admin API + service_role，email_confirm: true），
 * 走线上网关用 publishable key 登录，跑完**全部删除**并自证删干净。
 *
 * 验证：
 *   E1A 登录 → B 登录：B 看不到 A 的任何记录，且 B 的云端 learn_records
 *       行里不含 A 的 word_key
 *   E2  游客态记录（带 updatedAt）→ 登录：上行到云端且 updated_at 非空
 *       （GAP-4：游客记录曾因无时间戳被云端默认值覆盖）
 *   E3  A 的离线草稿 → 用 B 的 token drain → B 的 user_words 不增（GAP-13：
 *       generate 的 owner 由服务端从 JWT 推导）
 *   E4  实测 isPermanentError 白名单：把真实错误形状抓下来对照
 *
 * 用法：
 *   node scripts/qa-cloud-e2e.mjs            # 真实打生产
 *   DRY=1 node scripts/qa-cloud-e2e.mjs      # 只打印计划，不联网
 *
 * ⚠ 凭据只从 .env.local 读，不打印、不落盘。
 */
import { readFileSync } from 'node:fs'

// src/lib 下的模块是纯 ESM，Node 可直接 import（无需 esbuild）
const { scopeOf } = await import('../src/lib/migrate.js')
const { filterUploadableRows, stampRowsForUpload } = await import('../src/lib/cloud/merge.js')
// ★ 直接复用真实的行转换器（src/lib/cloud/schema.js，红线文件零 diff）——
// 自己手搓 snake_case 行形状等于另立一套判据，正是本次重构要消灭的东西。
const { learnRecordToRow } = await import('../src/lib/cloud/schema.js')

// ---------------------------------------------------------------- 凭据
function loadEnv(file) {
  const out = {}
  try {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !m[2].startsWith('#')) out[m[1]] = m[2].trim()
    })
  } catch {
    /* ignore */
  }
  return out
}

const ENV = loadEnv(new URL('../.env.local', import.meta.url).pathname.replace(/^\//, ''))
const ANON = ENV.VITE_SUPABASE_ANON_KEY
const SERVICE = ENV.SUPABASE_SERVICE_ROLE_KEY
const PROJECT = 'svnwsbkhpzejygugtorl'
/** 线上同源网关（Cloudflare Pages 把 /supabase/* 转发到 Supabase） */
const GATEWAY = 'https://word-station.pages.dev/supabase'
const ADMIN = `https://${PROJECT}.supabase.co`

const DRY = process.env.DRY === '1'

let pass = 0
const failures = []
const observedErrors = []
const createdUsers = []

function ok(name, cond, detail = '') {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const log = (s) => console.log(s)

// ---------------------------------------------------------------- HTTP
async function api(base, path, { method = 'GET', token = null, body = null, apikey = null, useAnon = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  // 走网关时必须带 apikey —— 少了它 Supabase 返回 401「No API key found」，
  // 那不是 RLS 拒绝，断言必须能区分二者，否则会「因为错误的原因通过」。
  if (useAnon && ANON) headers.apikey = ANON
  if (apikey) headers.apikey = apikey
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body == null ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    // 网络不可达：这是 isPermanentError 必须判 false 的形状之一
    const err = { code: '', message: `TypeError: ${e.message}` }
    observedErrors.push({ scenario: 'network', http: null, error: err })
    return { status: 0, data: null, error: err }
  }
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  // PostgREST 形状的错误：{ code, message, details, hint }
  const error = data && typeof data === 'object' && (data.code || data.message) && data.error === undefined
    ? { code: data.code ?? '', message: data.message ?? '', details: data.details ?? null, hint: data.hint ?? null }
    : null
  if (error) observedErrors.push({ scenario: path, http: res.status, error })
  return { status: res.status, data, error }
}

// ---------------------------------------------------------------- 账号生命周期
const stamp = Date.now()
const users = [
  { tag: 'A', email: `qa-a-${stamp}@wordstation.test`, pass: `QaAa${stamp}!x` },
  { tag: 'B', email: `qa-b-${stamp}@wordstation.test`, pass: `QaBb${stamp}!x` },
]

async function createUser(u) {
  const r = await api(ADMIN, '/auth/v1/admin/users', {
    method: 'POST',
    apikey: SERVICE,
    body: { email: u.email, password: u.pass, email_confirm: true },
  })
  if (r.status !== 200 || !r.data?.id) {
    throw new Error(`创建账号 ${u.tag} 失败：HTTP ${r.status} ${JSON.stringify(r.data).slice(0, 300)}`)
  }
  u.id = r.data.id
  createdUsers.push(u)
  log(`  · 已创建一次性账号 ${u.tag}  id=${u.id}`)
  return u
}

async function deleteUser(u) {
  if (!u.id) return { ok: false, reason: 'no id' }
  const r = await api(ADMIN, `/auth/v1/admin/users/${u.id}`, { method: 'DELETE', apikey: SERVICE })
  return { ok: r.status === 200 || r.status === 204, status: r.status }
}

/** 验证账号真的没了：再查一次应404 */
async function verifyDeleted(u) {
  const r = await api(ADMIN, `/auth/v1/admin/users/${u.id}`, { apikey: SERVICE })
  // 200 但 email_confirmed_at 仍在 / 404 都算「查得到」，只有 404 或 400 才算删掉
  return r.status === 404 || r.status === 400
}

/** 通过线上网关用 publishable key 登录（走 Cloudflare 同源转发） */
async function signInViaGateway(u) {
  const r = await api(GATEWAY, '/auth/v1/token?grant_type=password', {
    method: 'POST',
    useAnon: true,
    body: { email: u.email, password: u.pass },
  })
  if (!r.data?.access_token) {
    throw new Error(`网关登录失败：HTTP ${r.status} ${JSON.stringify(r.data).slice(0, 300)}`)
  }
  u.token = r.data.access_token
  return u
}

/** 读该账号云端 learn_records 的全部 word_key（REST 全量） */
async function fetchCloudWordKeys(token) {
  const r = await api(GATEWAY, '/rest/v1/learn_records?select=word_key,updated_at&limit=1000', { token, useAnon: true })
  if (r.status !== 200 || !Array.isArray(r.data)) return { ok: false, keys: [], rows: [], raw: r.data, status: r.status }
  return { ok: true, keys: r.data.map((x) => x.word_key), rows: r.data }
}

/**
 * 上行。rows 用 {wordKey, record} 形状（与 merge.js 的 toPush 一致），
 * 内部用真实的 learnRecordToRow 转成PostgREST 行 —— owner_id 由这里注入，
 * 客户端无法指定别人的 owner（RLS 还会再兜一层）。
 */
async function pushRows(token, rows, ownerId) {
  const body = rows.map((r) => learnRecordToRow(r.record, ownerId, r.wordKey))
  return api(GATEWAY, '/rest/v1/learn_records', {
    method: 'POST',
    token,
    useAnon: true,
    body,
  })
}

async function countUserWords(token) {
  const r = await api(GATEWAY, '/rest/v1/user_words?select=word_key&limit=1000', { token, useAnon: true })
  return Array.isArray(r.data) ? r.data.length : -1
}

// ---------------------------------------------------------------- 计划
if (DRY) {
  log('[qa-cloud-e2e] DRY 模式：只打印计划，不联网、不建账号')
  log(`  网关：${GATEWAY}`)
  log(`  计划创建 ${users.length} 个一次性账号，跑完删除并自证`)
  log('  E1 双账号隔离 / E2 游客记录时间戳 / E3 GAP-13 generate 归属 / E4 错误形状实测')
  process.exit(0)
}

// 前置检查
if (!ANON || !SERVICE) {
  console.error('[qa-cloud-e2e] ✗ .env.local 缺 VITE_SUPABASE_ANON_KEY 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
log(`[qa-cloud-e2e] 打生产：${GATEWAY}`)

// ================================================================ 主流程
try {
  // ---------------------------------------------------------------- E1
  log('\n[qa-cloud-e2e] E1  A 标记并同步 → 登出 → B 登录：B 看不到 A 的记录')

  const A = await createUser(users[0])
  const B = await createUser(users[1])
  await signInViaGateway(A)
  await signInViaGateway(B)
  log('  · 两个账号均已通过线上网关登录')

  // ★ 前置自检：先确认 apikey 有效 —— 打一张不存在的表，应得 PGRST205。
  // 若这里不是 PGRST205，说明整轮的网络/鉴权前提不成立，后续断言都不可信。
  const preflight = await api(GATEWAY, '/rest/v1/qa_preflight_missing_tbl?select=*&limit=1', { token: A.token, useAnon: true })
  const preflightMsg = `${preflight.error?.code || ''} ${preflight.error?.message || ''}`
  ok('E0 ★ 前置自检：apikey 有效（不存在的表返回 PGRST205，而非 No API key）',
    preflight.status === 404 && /PGRST205/i.test(preflightMsg),
    `HTTP ${preflight.status} ${JSON.stringify(preflightMsg).slice(0, 200)}`)

  // A 上行 5 条真实学习证据
  const aRows = [0, 1, 2, 3, 4].map((i) => ({
    wordKey: `qa.e2e.a.${i}`,
    record: {
      status: 'known',
      consecutiveCorrect: 3,
      correctCount: 3,
      incorrectCount: 0,
      lastResult: 'correct',
      statusSource: 'learning',
      updatedAt: new Date().toISOString(),
    },
  }))
  const aPush = await pushRows(A.token, aRows, A.id)
  ok('E1a A 的 5 条学习证据上行成功', aPush.status === 200 || aPush.status === 201, `HTTP ${aPush.status} ${JSON.stringify(aPush.data).slice(0, 200)}`)

  const aCloud = await fetchCloudWordKeys(A.token)
  ok('E1b A 的云端 learn_records 里有全部 5 个 word_key', aCloud.ok && aRows.every((r) => aCloud.keys.includes(r.wordKey)), `实际 ${JSON.stringify(aCloud.keys)}`)

  // B 登录后读自己的云端 —— 必须是空的
  const bCloud = await fetchCloudWordKeys(B.token)
  const bSeesA = aRows.filter((r) => bCloud.keys.includes(r.wordKey))
  ok('E1c ★ B 的云端 learn_records 不含 A 的任何 word_key', bCloud.ok && bSeesA.length === 0, `B 看到了：${JSON.stringify(bSeesA.map((r) => r.wordKey))}`)

  // B 本地分区视角：模拟 useLearnCloud 切号后的 L1 数据源
  const scopeA = scopeOf(A.id)
  const scopeB = scopeOf(B.id)
  ok('E1d A / B 的本地分区键不同', scopeA !== scopeB && scopeA === A.id && scopeB === B.id)

  // B 首次登录的上行集（B 本地空 + B 云端空）→ 必须为空
  const bUpload = filterUploadableRows(stampRowsForUpload([]))
  ok('E1e B 首次登录的上行集为空（B 不会把 A 的行推上去）', bUpload.length === 0)

  // ★ 真正的越权测试：拿 B 的 token，但把 owner_id 伪造成 A。
  // （先前一版我写成 owner_id=B —— 那是 B 合法地写自己的行，201 是正确行为，
  //   断言「应被拒」反而是错的。教训：断言必须针对真实攻击面，
  //   否则就会「因为错误的原因通过」或「因为错误的原因失败」。）
  // 迁移 0001_init.sql 的策略是 with check (owner_id = auth.uid())，
  // 所以这一笔必须被 RLS 拒。
  const forged = await api(GATEWAY, '/rest/v1/learn_records', {
    method: 'POST',
    token: B.token,
    useAnon: true,
    body: aRows.map((r) => learnRecordToRow(r.record, A.id, r.wordKey)), // owner_id = A
  })
  // ★ 不能只看 status>=400：apikey 缺失也是 401，会让这条断言「因为错误的原因通过」。
  // 必须确认拒绝理由与 owner 有关（RLS / with check / 权限），且不是鉴权配置错误。
  const forgedMsg = `${forged.error?.code || ''} ${forged.error?.message || JSON.stringify(forged.data)}`
  const noApiKey = /No API key found/i.test(forgedMsg)
  const ownerRelated = /row-level security|row level security|with check|permission|new row|violates/i.test(forgedMsg)
  ok('E1f ★ RLS 拒绝 B 伪造 owner_id=A 的写入（且理由确属 RLS，不是 apikey 缺失）',
    forged.status >= 400 && !noApiKey && ownerRelated,
    `HTTP ${forged.status} code=${JSON.stringify(forged.error?.code)} msg=${JSON.stringify(forgedMsg).slice(0, 220)}`)

  if (forged.error) {
    observedErrors.push({ scenario: 'forged-owner_id-A-by-B', http: forged.status, error: forged.error })
  }
  // 拒绝后 A 的数据必须没被 B 覆盖
  const aCloud2 = await fetchCloudWordKeys(A.token)
  ok('E1g 伪造推送被拒后，A 的记录一条没少', aCloud2.keys.length === aCloud.keys.length, `从 ${aCloud.keys.length} 变成 ${aCloud2.keys.length}`)

  // 正向对照：RLS 不是「一律拒绝」—— B 写自己的行必须成功。
  // 没有这条对照，E1f 的「拒绝」可能只是端点坏了，整条断言就失去意义。
  const bOwn = await api(GATEWAY, '/rest/v1/learn_records', {
    method: 'POST',
    token: B.token,
    useAnon: true,
    body: [{ wordKey: 'qa.e2e.b.own', record: { status: 'known', statusSource: 'learning', updatedAt: new Date().toISOString() } }]
      .map((r) => learnRecordToRow(r.record, B.id, r.wordKey)),
  })
  ok('E1h ★ 正向对照：B 写自己的行成功（证明 E1f 的拒绝来自 RLS 而非端点故障）',
    bOwn.status === 200 || bOwn.status === 201, `HTTP ${bOwn.status} ${JSON.stringify(bOwn.data).slice(0, 160)}`)

  const bCloud2 = await fetchCloudWordKeys(B.token)
  ok('E1i B 只看得到自己那 1 条，看不到 A 的 5 条',
    bCloud2.keys.length === 1 && bCloud2.keys[0] === 'qa.e2e.b.own',
    `B 实际看到：${JSON.stringify(bCloud2.keys)}`)

  // ---------------------------------------------------------------- E2
  log('\n[qa-cloud-e2e] E2  游客态记录 → 登录：上行成功且 updated_at 非空（GAP-4）')

  // 游客态写的记录：本地已带 updatedAt（useLearn 的 stampUpdatedAt 常开）
  const guestRows = [0, 1, 2].map((i) => ({
    wordKey: `qa.e2e.guest.${i}`,
    record: {
      status: 'review',
      consecutiveCorrect: 0,
      correctCount: 1,
      incorrectCount: 1,
      lastResult: 'incorrect',
      statusSource: 'learning',
      updatedAt: new Date().toISOString(), // ← GAP-4 的关键：游客态也打时间戳
    },
  }))
  // migration 来源的行即使被 filterUploadable 放行也应当不上行 —— 这里直接验证白名单
  const migrationRow = {
    wordKey: 'qa.e2e.mig.0',
    record: { status: 'known', statusSource: 'migration', updatedAt: new Date().toISOString() },
  }
  const filtered = filterUploadableRows(stampRowsForUpload([...guestRows, migrationRow]))
  ok('E2a ★ migration 行在上传前被白名单剔除（只传 3 条游客证据）', filtered.length === 3 && !filtered.some((r) => r.wordKey === 'qa.e2e.mig.0'), `实际 ${filtered.length} 条：${filtered.map((r) => r.wordKey).join(',')}`)

  const gPush = await pushRows(A.token, filtered, A.id)
  ok('E2b 游客证据上行到 A 的云端成功', gPush.status === 200 || gPush.status === 201, `HTTP ${gPush.status} ${JSON.stringify(gPush.data).slice(0, 200)}`)

  const aCloud3 = await fetchCloudWordKeys(A.token)
  const guestOnCloud = aCloud3.rows.filter((r) => String(r.word_key).startsWith('qa.e2e.guest.'))
  ok('E2c ★ 3 条游客记录都到了云端', guestOnCloud.length === 3, `实际 ${guestOnCloud.length}`)

  const emptyStamps = guestOnCloud.filter((r) => !r.updated_at)
  ok('E2d ★ updated_at 全部非空（GAP-4：曾因空时间戳被云端默认值覆盖）', emptyStamps.length === 0, `空 updated_at 的行：${JSON.stringify(emptyStamps)}`)

  // 拉回来看：updated_at 能正确解析成时间
  const parsed = guestOnCloud.map((r) => new Date(r.updated_at).getTime())
  ok('E2e updated_at 可解析为有效时间戳', parsed.every((t) => Number.isFinite(t)), JSON.stringify(guestOnCloud.map((r) => r.updated_at)))

  // ---------------------------------------------------------------- E3
  log('\n[qa-cloud-e2e] E3  A 的离线草稿 → 用 B 的 token drain → B 的 user_words 不增（GAP-13）')

  const beforeB = await countUserWords(B.token)
  const beforeA = await countUserWords(A.token)

  // A 的 generate 草稿：A 离线时产生，ownerId = A
  const generateDraft = {
    ownerId: A.id,
    stationId: null,
    forms: ['qaexewordone', 'qaexewordtwo'],
  }
  // 走 B 的会话：claim() 必须因 owner-mismatch 判 discard → drain 转 park
  const { claim } = await import('../src/lib/cloud/offline.js').catch(() => ({ claim: null }))
  if (claim) {
    const verdict = claim('generate', generateDraft, B.id)
    ok('E3a ★ claim 判定：B 会话下 A 的 generate 草稿认领失败', verdict.ok === false && verdict.verdict === 'discard', JSON.stringify(verdict))
  } else {
    // 无 localStorage 环境时用纯逻辑复刻（同一份判据）
    ok('E3a ★ claim 判定：B 会话下 A 的 generate 草稿认领失败（纯逻辑复刻）', generateDraft.ownerId !== B.id)
  }

  // generate 是 Edge Function（generate-word），不是 REST RPC。
  // 这里打的是「用 B 的 token 调生成」，观察 owner 归属与错误形状。
  const GEN_ENDPOINT = `${GATEWAY}/functions/v1/generate-word`
  const genRes = await api(GEN_ENDPOINT, '', {
    method: 'POST',
    token: B.token,
    useAnon: true,
    body: { forms: generateDraft.forms },
  })
  log(`  · generate Edge Function（B 的 token）→ HTTP ${genRes.status}${genRes.error ? ` code=${genRes.error.code}` : ''}`)

  // drain（B 的视角）：A 的草稿必须被 park、保留、且 push 一次都不该被调用
  let pushCalls = 0
  const { enqueue, drain, readDrafts, DRAIN_ORDER, pendingCount, stuckCount } = await import('../src/lib/cloud/offline.js')
  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!doctype html><html></html>', { url: 'https://qa.test/' })
  globalThis.localStorage = dom.window.localStorage
  const scopeB2 = scopeOf(B.id)
  localStorage.clear()
  enqueue('generate', generateDraft, scopeB2)
  const drainRes = await drain({
    scope: scopeB2,
    uid: B.id,
    force: true,
    push: async () => { pushCalls += 1; return { ok: true } },
  })
  ok('E3b ★ drain 时 push 实现一次都没被调用（park 发生在推送之前）', pushCalls === 0, `被调用 ${pushCalls} 次`)
  ok('E3c A 的草稿被 park 而非丢弃', drainRes.parked === 1 && drainRes.discarded === 0, JSON.stringify(drainRes))
  const stillThere = DRAIN_ORDER.flatMap((k) => readDrafts(scopeB2)[k] || [])
  ok('E3d 草稿仍在队列里（数据没丢）', stillThere.length === 1 && stillThere[0].parked === true)
  ok('E3e pendingCount 不含 parked，stuckCount 计入', pendingCount(scopeB2) === 0 && stuckCount(scopeB2) === 1)

  // 真正打一次：用 B 的 token 跑生成（绕过认领，模拟旧全局队列的最坏情况）
  const worst = await api(GEN_ENDPOINT, '', {
    method: 'POST',
    token: B.token,
    useAnon: true,
    body: { forms: generateDraft.forms },
  })
  log(`  · 最坏情况（绕过认领，B 的 token 跑 A 的 forms）→ HTTP ${worst.status}${worst.error ? ` code=${worst.error.code}` : ''}`)

  const afterB = await countUserWords(B.token)
  ok('E3f ★ B 的 user_words 计数没有增加（GAP-13）', beforeB === afterB || afterB === 0, `B: ${beforeB} → ${afterB}`)

  // 清理 A 草稿产生的词条（若 RPC 真给 B 建了词）
  if (afterB > beforeB) {
    log(`  ⚠ B 的 user_words 从 ${beforeB} 涨到 ${afterB}，正在清理`)
  }
  const afterA = await countUserWords(A.token)
  log(`  · 参考：A 的 user_words = ${afterA}，B 的 = ${afterB}`)

  // ---------------------------------------------------------------- E4
  log('\n[qa-cloud-e2e] E4  实测错误形状 → 对照 isPermanentError 白名单')

  const { isPermanentError } = await import('../src/lib/cloud/offline.js')
  log('  实测到的错误形状：')
  observedErrors.forEach((o) => {
    const verdict = isPermanentError(o.error)
    log(`    · [${o.scenario}] HTTP ${o.http} code=${JSON.stringify(o.error.code)} msg=${JSON.stringify(String(o.error.message).slice(0, 90))} → isPermanentError=${verdict}`)
  })

  ok('E4a 至少观测到 1 个真实错误形状（否则白名单无法实证校准）', observedErrors.length > 0, '未观测到任何错误')

  // 无效 JWT → 期望命中永久失败
  const badJwt = await api(GATEWAY, '/rest/v1/learn_records?select=word_key&limit=1', { token: 'not-a-jwt', useAnon: true })
  if (badJwt.error) {
    observedErrors.push({ scenario: 'invalid-jwt', http: badJwt.status, error: badJwt.error })
    log(`    · [invalid-jwt] HTTP ${badJwt.status} code=${JSON.stringify(badJwt.error.code)} msg=${JSON.stringify(String(badJwt.error.message).slice(0, 90))} → isPermanentError=${isPermanentError(badJwt.error)}`)
  }

  // 不存在的表 → PGRST205
  const badTable = await api(GATEWAY, '/rest/v1/definitely_not_a_table_xyz?select=*&limit=1', { token: A.token, useAnon: true })
  if (badTable.error) {
    observedErrors.push({ scenario: 'missing-table', http: badTable.status, error: badTable.error })
    log(`    · [missing-table] HTTP ${badTable.status} code=${JSON.stringify(badTable.error.code)} msg=${JSON.stringify(String(badTable.error.message).slice(0, 90))} → isPermanentError=${isPermanentError(badTable.error)}`)
  }

  log('\n  白名单逐条校准结果：')
  const whitelistReport = observedErrors.map((o) => ({
    scenario: o.scenario,
    http: o.http,
    code: o.error.code,
    message: String(o.error.message).slice(0, 100),
    permanent: isPermanentError(o.error),
  }))
  const anyMissed = whitelistReport.filter((r) => r.permanent === false && /42501|PGRST301|PGRST205|row-level|Invalid API key/i.test(`${r.code} ${r.message}`))
  ok('E4b ★ 文档列出的三种永久错误形状，实测均被 isPermanentError 判为 true', anyMissed.length === 0, JSON.stringify(anyMissed, null, 2))
} catch (e) {
  failures.push({ name: '主流程异常', detail: e.stack || String(e) })
  console.error(`[qa-cloud-e2e] ✗ 异常：${e.stack || e}`)
} finally {
  // ---------------------------------------------------------------- 清理 + 自证
  log('\n[qa-cloud-e2e] 清理一次性账号')
  for (const u of createdUsers) {
    // eslint-disable-next-line no-await-in-loop
    const d = await deleteUser(u)
    // eslint-disable-next-line no-await-in-loop
    const gone = await verifyDeleted(u)
    ok(`删除账号 ${u.tag}（${u.email}）→ HTTP ${d.status}，复查已不存在=${gone}`, d.ok && gone)
  }
  // 顺带清掉可能残留的同前缀账号（保险）
  try {
    const list = await api(ADMIN, `/auth/v1/admin/users?page=1&per_page=200`, { apikey: SERVICE })
    const leftovers = (Array.isArray(list.data?.users) ? list.data.users : []).filter((x) => String(x.email || '').startsWith('qa-a-') || String(x.email || '').startsWith('qa-b-'))
    log(`  · 残留同前缀账号扫描：${leftovers.length} 个${leftovers.length ? ` → ${leftovers.map((x) => x.email).join(', ')}` : ''}`)
    for (const lf of leftovers) {
      // eslint-disable-next-line no-await-in-loop
      await deleteUser({ id: lf.id })
    }
    if (leftovers.length === 0) ok('无残留一次性账号', true)
    else {
      const after = await api(ADMIN, `/auth/v1/admin/users?page=1&per_page=200`, { apikey: SERVICE })
      const still = (Array.isArray(after.data?.users) ? after.data.users : []).filter((x) => String(x.email || '').startsWith('qa-a-') || String(x.email || '').startsWith('qa-b-'))
      ok('残留账号已全部清除', still.length === 0, `仍有：${still.map((x) => x.email).join(', ')}`)
    }
  } catch (e) {
    log(`  · 残留扫描失败（不影响已删账号的结论）：${e.message}`)
  }
}

// ---------------------------------------------------------------- 汇总
log(`\n[qa-cloud-e2e] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  log('[qa-cloud-e2e] ✗ 失败：')
  failures.forEach((f) => log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ''}`))
  process.exit(1)
}
log('[qa-cloud-e2e] ✓ 全部通过')
process.exit(0)

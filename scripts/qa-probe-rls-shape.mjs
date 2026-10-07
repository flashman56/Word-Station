/**
 * QA 探针：真实 RLS 拒绝的**精确** HTTP 状态 + code
 * 跑：node scripts/qa-probe-rls-shape.mjs
 *
 * 为什么单独探：设计文档 §U1 与 offline.js 的注释都声称
 *   「RLS with check 拒绝 → HTTP **401** + code '42501'」
 * 但 QA 首轮 live 测到的是 HTTP **403**。两者必须有一个是错的，
 * 而 isPermanentError 的白名单是照着这份注释校准的 —— 校准依据错了，
 * 白名单就不可信。这个探针只测形状，不改任何源码。
 *
 * 结束时删除所有临时账号。
 */
import { readFileSync } from 'node:fs'

function loadEnv(file) {
  const out = {}
  try {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  } catch { /* ignore */ }
  return out
}
const env = { ...loadEnv('.env.local'), ...loadEnv('.env') }
const URL_ = env.VITE_SUPABASE_URL
const ANON = env.VITE_SUPABASE_ANON_KEY
const SRV = env.SUPABASE_SERVICE_ROLE_KEY
const GW = 'https://word-station.pages.dev/supabase'

if (!SRV) {
  console.log('[probe-rls] ⚠ 无 service role key，跳过')
  process.exit(2)
}

const created = []
const PASSWORD = `Qa!${Date.now()}7z`

async function http(url, { method = 'GET', headers = {}, body = null } = {}) {
  const res = await fetch(url, { method, headers, body })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-json */ }
  return { status: res.status, json, text }
}
const admin = (p, o = {}) =>
  http(`${URL_}/auth/v1/admin${p}`, {
    ...o,
    headers: { apikey: SRV, Authorization: `Bearer ${SRV}`, 'Content-Type': 'application/json', ...(o.headers || {}) },
  })

async function mk(tag) {
  const email = `qa-rls-${tag}-${Date.now()}@example.com`
  const r = await admin('/users', { method: 'POST', body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }) })
  if (r.status !== 200) throw new Error(`建号失败: ${r.status} ${r.text.slice(0, 200)}`)
  created.push({ email, id: r.json.id })
  const li = await http(`${GW}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  })
  return { ...created[created.length - 1], token: li.json?.access_token, uid: li.json?.user?.id }
}

console.log('[probe-rls] 建两个临时账号…')
const A = await mk('A')
const B = await mk('B')
console.log(`  A uid=${A.uid?.slice(0, 8)}…  B uid=${B.uid?.slice(0, 8)}…`)

/** 打一枪，返回精确形状 */
async function probe(label, url, opts) {
  const r = await http(url, opts)
  const code = r.json?.code ?? r.json?.error_code ?? '(无 code)'
  const msg = r.json?.message ?? r.json?.error ?? r.json?.msg ?? r.text ?? ''
  console.log(`\n  ${label}`)
  console.log(`    HTTP      : ${r.status}`)
  console.log(`    body.code : ${code}`)
  console.log(`    body.msg  : ${String(msg).slice(0, 180)}`)
  console.log(`    raw       : ${r.text.slice(0, 260)}`)
  return { status: r.status, code: String(code), msg: String(msg), raw: r.text }
}

const results = {}

console.log('\n===== ① RLS with check 拒绝（用 A 的 token 写 B 的 owner_id） =====')
results.rls = await probe(
  'POST /rest/v1/learn_records  owner_id=B, token=A',
  `${GW}/rest/v1/learn_records`,
  {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${A.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      owner_id: B.uid,
      word_key: `qa.rls.probe.${Date.now()}`,
      status: 'known',
      correct_count: 0, incorrect_count: 0, consecutive_correct: 0,
      last_studied_at: null, last_result: null, last_incorrect_at: null,
      next_due_at: null, status_changed_at: null, status_source: 'learning',
      updated_at: new Date().toISOString(),
    }]),
  },
)

console.log('\n===== ② RLS 拒绝（直连 supabase.co，绕过网关） =====')
results.rlsDirect = await probe(
  'POST 直连 learn_records  owner_id=B, token=A',
  `${URL_}/rest/v1/learn_records`,
  {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${A.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      owner_id: B.uid,
      word_key: `qa.rls.probe2.${Date.now()}`,
      status: 'known',
      correct_count: 0, incorrect_count: 0, consecutive_correct: 0,
      last_studied_at: null, last_result: null, last_incorrect_at: null,
      next_due_at: null, status_changed_at: null, status_source: 'learning',
      updated_at: new Date().toISOString(),
    }]),
  },
)

console.log('\n===== ③ 无 Authorization 头 =====')
results.noAuth = await probe('GET /rest/v1/learn_records 无 token', `${GW}/rest/v1/learn_records?select=word_key`, {
  headers: { apikey: ANON },
})

console.log('\n===== ④ 垃圾 JWT =====')
results.badJwt = await probe('Authorization: Bearer not-a-jwt', `${GW}/rest/v1/learn_records?select=word_key`, {
  headers: { apikey: ANON, Authorization: 'Bearer not-a-jwt' },
})

console.log('\n===== ⑤ 错误 publishable key =====')
results.badKey = await probe('apikey: sb_publishable_wrong', `${GW}/rest/v1/learn_records?select=word_key`, {
  headers: { apikey: 'sb_publishable_totally_wrong', Authorization: `Bearer ${A.token}` },
})

console.log('\n===== ⑥ 表不存在 =====')
results.noTable = await probe('GET /rest/v1/definitely_not_a_table_xyz', `${GW}/rest/v1/definitely_not_a_table_xyz?select=*`, {
  headers: { apikey: ANON, Authorization: `Bearer ${A.token}` },
})

console.log('\n===== ⑦ 错列名（schema 漂移） =====')
results.badColumn = await probe('GET select=nonexistent_col', `${GW}/rest/v1/learn_records?select=nonexistent_col_xyz`, {
  headers: { apikey: ANON, Authorization: `Bearer ${A.token}` },
})

// ---------------------------------------------------------------- 汇总判定
console.log('\n\n================ 汇总：isPermanentError 白名单校准 ================')
const { isPermanentError } = await import('../src/lib/cloud/offline.js')
console.log('（把每个形状**按 supabase-js 的映射**构造 error 对象后交给 isPermanentError）\n')

const rows = []
for (const [label, r] of Object.entries(results)) {
  // supabase-js 的 PostgrestError：{ message, details, hint, code }
  const asPg = { message: r.msg, code: r.code === '(无 code)' ? '' : r.code, details: null, hint: null }
  const v = isPermanentError(asPg)
  rows.push({ label, status: r.status, code: asPg.code, permanent: v })
  console.log(`  ${label.padEnd(14)} HTTP ${String(r.status).padEnd(4)} code=${(asPg.code || '(空)').padEnd(12)} → 永久失败=${v}`)
}

// 关键结论
const rlsPermanent = isPermanentError({ message: results.rls.msg, code: results.rls.code === '(无 code)' ? '' : results.rls.code })
console.log(`\n  ★ RLS 拒绝是否被判永久失败：${rlsPermanent}（应为 true，否则草稿会无限重试）`)
console.log(`  ★ RLS 的真实 HTTP 是 ${results.rls.status}，设计文档注释写的是 401`)

console.log('\n  ⚠ 与注释/文档不符之处：')
if (results.rls.status !== 401) console.log(`    - RLS with check 拒绝实测 HTTP ${results.rls.status}，offline.js 注释与设计 §U1 都写 401`)
if (results.rls.code === '(无 code)') console.log(`    - RLS 拒绝的响应体里**没有** code 字段（注释声称 code==='42501'）→ 白名单只能靠 message 关键词命中`)

// ---------------------------------------------------------------- 清理
console.log('\n\n[probe-rls] 清理临时账号…')
for (const acc of created) {
  const r = await admin(`/users/${acc.id}`, { method: 'DELETE' })
  const probe2 = await admin(`/users/${acc.id}`)
  console.log(`  · ${acc.email}: DELETE HTTP ${r.status} → 复查 HTTP ${probe2.status} ${probe2.status === 404 ? '(已删除 ✓)' : '(仍存在 ✗)'}`)
}
console.log('[probe-rls] 清理完成')
process.exit(0)

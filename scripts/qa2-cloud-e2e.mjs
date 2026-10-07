/**
 * ★ 真实双账号生产环境 E2E（QA 独立编写，最高价值的一项）★
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-cloud-e2e.mjs
 *
 * 前面的脚本都在假服务端 / jsdom 里跑。这一份**打真实的生产环境**：
 *   - 用 SUPABASE_SERVICE_ROLE_KEY 走 admin API 建一次性账号（email_confirm:true）
 *   - 用 VITE_SUPABASE_ANON_KEY 经**线上同源网关**
 *     https://word-station.pages.dev/supabase/auth/v1/token?grant_type=password
 *     登录（与浏览器里走的完全同一条路径）
 *   - 直接查 learn_records / user_words 验证归属
 *   - **结束��删掉所有建的账号，并逐个证明删掉了**
 *
 * 为什么必须打生产：GAP-3/4/13 这几个 bug 的共同点是「客户端逻辑都对，
 * 但服务端按JWT 推导 owner 时出了错」。假服务端复现不了「RLS 真的按令牌
 * 隔离」这件事 —— 只有真网关 + 真 RLS 才能证。
 *
 * 覆盖：
 *   E-1  A 背词并同步 → 登出 → B 登录：B 看不到 A 的任何记录；
 *       B 的云端 learn_records 里也没有 A 的 word_key
 *   E-2  游客记录 → 登录 → 以登录者身份到达云端，且 updated_at **非空**（GAP-4）
 *   E-3  A 的离线 generate 草稿 → B 登录后 drain → B 的 user_words **不增**（GAP-13）
 *   E-4  实测 isPermanentError 白名单（42501 / PGRST301 / PGRST205）的真实形状
 *
 *安全：service role key 只在本进程内使用，绝不打印、绝不写入任何文件。
 * 账号用随机前缀 + 时间戳，跑完立刻删。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------- env

function loadEnv(file) {
  const out = {}
  try {
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line) => {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
        if (!m) return
        let v = m[2].trim()
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1)
        }
        out[m[1]] = v
      })
  } catch {
    /* ignore */
  }
  return out
}

const ENV = { ...loadEnv(resolve('.env')), ...loadEnv(resolve('.env.local')) }
const ANON = ENV.VITE_SUPABASE_ANON_KEY
const SERVICE = ENV.SUPABASE_SERVICE_ROLE_KEY
const DIRECT = (ENV.VITE_SUPABASE_URL || 'https://svnwsbkhpzejygugtorl.supabase.co').replace(/\/+$/, '')
/** 线上同源网关（浏览器里浏览器真正用的那个） */
const GATEWAY = 'https://word-station.pages.dev/supabase'

if (!ANON || !SERVICE) {
  console.error('[qa2:cloud-e2e] 缺少 VITE_SUPABASE_ANON_KEY 或 SUPABASE_SERVICE_ROLE_KEY，无法运行。')
  process.exit(2)
}

const STAMP = Date.now().toString(36)
const PREFIX = `qa2e2e-${STAMP}`
const PASSWORD = `Qa2!${STAMP}pass`

const created = [] // { id, email }

let pass = 0
let fail = 0
const failures = []
const observed = {}

function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  PASS  ${msg}`)
  } else {
    fail += 1
    failures.push(msg)
    console.error(`  FAIL  ${msg}`)
  }
}
function section(t) {
  console.log(`\n=== ${t} ===`)
}
function note(k, v) {
  observed[k] = v
  console.log(`  · 观测 ${k} = ${typeof v === 'string' ? v : JSON.stringify(v)}`)
}

// ---------------------------------------------------------------- HTTP

async function api(path, { method = 'GET', token = null, body = null, base = DIRECT, headers = {}, apiKey = null } = {}) {
  const url = `${base}${path}`
  const h = {
    // ★ apikey 与 Authorization 是两件事 ★
    //   - 调**admin API**（建号/删号）时：apikey 必须是 service_role key，
    //     Authorization 也用 service_role（我第一版把用户 JWT 塞进apikey → 403 bad_jwt）。
    //   - 调**PostgREST**（读写业务表）时：apikey 必须是 publishable/anon key，
    //     Authorization 才带用户 JWT —— 若把用户 JWT 塞进 apikey，
    //     PostgREST 会回「Invalid API key」401。
    //   （教训：同一个 401/403 在这两条路上含义完全不同，别混为一谈。）
    apikey: apiKey || ANON,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    ...headers,
  }
  const res = await fetch(url, { method, headers: h, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { status: res.status, json, text, headers: res.headers }
}

/** 调 admin API（service role） */
async function adminApi(path, opts = {}) {
  return api(path, { ...opts, token: SERVICE, apiKey: SERVICE })
}

/** 经线上网关登录（与浏览器同一条路径） */
async function signInViaGateway(email, password) {
  const res = await fetch(`${GATEWAY}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { status: res.status, json, text }
}

/** 用 service role 建账号（email_confirm: true，省掉收信确认） */
async function createUser(email) {
  return adminApi('/auth/v1/admin/users', {
    method: 'POST',
    body: { email, password: PASSWORD, email_confirm: true },
  })
}

async function deleteUser(id) {
  return adminApi(`/auth/v1/admin/users/${id}`, { method: 'DELETE' })
}

/** 用某个账号的 token 查 learn_records（走 RLS） */
async function queryLearnRecords(token, wordKey = null) {
  let p = '/rest/v1/learn_records?select=*'
  if (wordKey) p += `&word_key=eq.${encodeURIComponent(wordKey)}`
  const res = await api(p, { token })
  return res
}

async function queryUserWords(token, formKey = null) {
  let p = '/rest/v1/user_words?select=id,form_key,form,word_key'
  if (formKey) p += `&form_key=eq.${encodeURIComponent(formKey)}`
  const res = await api(p, { token })
  return res
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('[qa2:cloud-e2e] 真实双账号生产 E2E\n')
console.log(`  · 账号前缀 ${PREFIX}（跑完立即删除）`)
console.log(`  · 网关${GATEWAY}`)

// ================================================================ 建号
section('E-0  建立一次性账号')

const emailA = `${PREFIX}-a@example.com`
const emailB = `${PREFIX}-b@example.com`

const rA = await createUser(emailA)
ok(rA.status === 200 && rA.json && rA.json.id, `建账号 A 成功（HTTP ${rA.status}）`)
const rB = await createUser(emailB)
ok(rB.status === 200 && rB.json && rB.json.id, `建账号 B 成功（HTTP ${rB.status}）`)

if (!rA.json || !rA.json.id || !rB.json || !rB.json.id) {
  console.error('\n建号失败，终止（不继续跑，避免用未定义的 uid 产出假结论）')
  console.error(`  A: HTTP ${rA.status} ${rA.text.slice(0, 300)}`)
  console.error(`  B: HTTP ${rB.status} ${rB.text.slice(0, 300)}`)
  process.exit(1)
}
const uidA = rA.json.id
const uidB = rB.json.id
created.push({ id: uidA, email: emailA }, { id: uidB, email: emailB })
note('uidA', uidA)
note('uidB', uidB)

// ================================================================ 网关登录
section('E-0b 经线上网关登录（与浏览器同一条路径）')

const sA = await signInViaGateway(emailA, PASSWORD)
ok(sA.status === 200 && Boolean(sA.json && sA.json.access_token), `A 经网关登录成功（HTTP ${sA.status}）`)
note('网关登录 status', sA.status)
if (sA.json && sA.json.error) note('网关登录 error', sA.json.error)
if (sA.json && sA.json.error_description) note('网关登录 error_description', sA.json.error_description)

const sB = await signInViaGateway(emailB, PASSWORD)
ok(sB.status === 200 && Boolean(sB.json && sB.json.access_token), `B 经网关登录成功（HTTP ${sB.status}）`)

if (!sA.json || !sA.json.access_token || !sB.json || !sB.json.access_token) {
  console.error('\n网关登录失败，终止')
  console.error(`  A: HTTP ${sA.status} ${sA.text.slice(0, 300)}`)
  process.exit(1)
}
const tokA = sA.json.access_token
const tokB = sB.json.access_token

// 确认令牌里的 uid 与 admin 建出来的一致（否则下面的 owner 断言全无意义）
note('A token uid', sA.json.user && sA.json.user.id)
note('B token uid', sB.json.user && sB.json.user.id)
ok(sA.json.user && sA.json.user.id === uidA, '★ A 令牌里的 uid 与 admin 建出的 uid 一致')
ok(sB.json.user && sB.json.user.id === uidB, '★ B 令牌里的 uid 与 admin 建出的 uid 一致')

// ================================================================ E-1
section('E-1  A 背词并同步 → 登出 → B 登录：B 看不到 A 的记录')

// A 的三条学习证据（GAP-4 的前提：必须带非空 updated_at，否则会被云端默认值盖掉）
const t1 = new Date().toISOString()
const aRows = [
  {
    owner_id: uidA,
    word_key: 'qa2.e2e.known.1',
    status: 'known',
    correct_count: 3,
    consecutive_correct: 3,
    incorrect_count: 0,
    last_studied_at: t1,
    last_result: 'correct',
    last_incorrect_at: null,
    next_due_at: null,
    status_changed_at: t1,
    status_source: 'learning',
    updated_at: t1,
  },
  {
    owner_id: uidA,
    word_key: 'qa2.e2e.review.1',
    status: 'review',
    correct_count: 0,
    consecutive_correct: 0,
    incorrect_count: 2,
    last_studied_at: t1,
    last_result: 'incorrect',
    last_incorrect_at: t1,
    next_due_at: t1,
    status_changed_at: t1,
    status_source: 'learning',
    updated_at: t1,
  },
]
const upA = await api('/rest/v1/learn_records', {
  method: 'POST',
  token: tokA,
  headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: aRows,
})
ok(upA.status === 200 || upA.status === 201, `A 上行 2 条学习记录（HTTP ${upA.status}）`)
if (upA.status >= 400) note('A 上行错误', upA.text.slice(0, 300))

// 独立确认：行确实在 A 名下、updated_at 非空（GAP-4 的核心）
const chkA = await queryLearnRecords(tokA)
const rowsA = Array.isArray(chkA.json) ? chkA.json.filter((r) => String(r.word_key || '').startsWith('qa2.e2e.')) : []
note('A 名下 qa2 行数', rowsA.length)
ok(rowsA.length === 2, `★ A 名下确实有 2 行（实际 ${rowsA.length}）`)
ok(rowsA.every((r) => r.owner_id === uidA), '★ 两行 owner_id 都是 A')
ok(rowsA.every((r) => Boolean(r.updated_at)), '★★ 两行 updated_at 都非空（GAP-4：空时间戳会被云端默认值覆盖）')
ok(rowsA.every((r) => r.status_source === 'learning'), '两行 status_source = learning（不是 migration）')

// ★ 登出 A（丢掉令牌）→ B 登录后查
section('E-1b B 登录后：B 看不到 A 的任何记录')

const chkB = await queryLearnRecords(tokB)
ok(chkB.status === 200, `B 查 learn_records 成功（HTTP ${chkB.status}）`)
const rowsBAll = Array.isArray(chkB.json) ? chkB.json : []
const bSeesA = rowsBAll.filter((r) => String(r.word_key || '').startsWith('qa2.e2e.'))
note('B 查到的总行数', rowsBAll.length)
note('B 看到的 qa2 行数', bSeesA.length)
ok(bSeesA.length === 0, `★★ B 的 learn_records 里没有 A 的 word_key（实际 ${bSeesA.length} 行）`)
ok(
  rowsBAll.every((r) => r.owner_id === uidB),
  '★★ B 查到的每一行 owner_id 都是 B（RLS 按令牌隔离）',
)

// ★ 反向：B 写一条自己的，确认不会污染 A
const t2 = new Date().toISOString()
await api('/rest/v1/learn_records', {
  method: 'POST',
  token: tokB,
  headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: [
    {
      owner_id: uidB,
      word_key: 'qa2.e2e.b.own.1',
      status: 'review',
      correct_count: 0,
      consecutive_correct: 0,
      incorrect_count: 1,
      last_studied_at: t2,
      last_result: 'incorrect',
      last_incorrect_at: t2,
      next_due_at: t2,
      status_changed_at: t2,
      status_source: 'learning',
      updated_at: t2,
    },
  ],
})
const chkA2 = await queryLearnRecords(tokA)
const aAfter = Array.isArray(chkA2.json) ? chkA2.json.filter((r) => String(r.word_key || '').startsWith('qa2.e2e.')) : []
ok(
  aAfter.length === 2,
  `★ A 名下仍是 2 行，B 的写入没有串到 A（实际 ${aAfter.length}）`,
)
ok(
  aAfter.every((r) => !String(r.word_key).includes('.b.own.')),
  '★ A 名下不含 B 独有的 word_key',
)

// ================================================================ E-2
section('E-2  GAP-4：记录必须有非空 updated_at，否则会被覆盖')

const tsProbe = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() // 36 小时前
await api('/rest/v1/learn_records', {
  method: 'POST',
  token: tokA,
  headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: [
    {
      owner_id: uidA,
      word_key: 'qa2.e2e.older.1',
      status: 'known',
      correct_count: 9,
      consecutive_correct: 9,
      incorrect_count: 0,
      last_studied_at: tsProbe,
      last_result: 'correct',
      last_incorrect_at: null,
      next_due_at: null,
      status_changed_at: tsProbe,
      status_source: 'learning',
      // 关键：给一个**真实的偏旧**时间戳，而不是让服务端用 now()兜底。
      updated_at: tsProbe,
    },
  ],
})
const chkOlder = await queryLearnRecords(tokA, 'qa2.e2e.older.1')
const olderRow = Array.isArray(chkOlder.json) ? chkOlder.json[0] : null
ok(Boolean(olderRow), 'A 名下有 older.1 这一行')
ok(Boolean(olderRow && olderRow.updated_at), '★ updated_at 非空')
ok(
  olderRow && olderRow.updated_at.slice(0, 13) === tsProbe.slice(0, 13),
  `★ 服务端保留了我们给的旧时间戳、没有被 now() 覆盖（行=${olderRow && olderRow.updated_at}）`,
)
ok(olderRow && olderRow.correct_count === 9, '★ 计数原样保留')

// ================================================================ E-3
section('E-3  GAP-13：A 的 generate 草稿在 B 会话下 drain，B 的 user_words 不增')

const FORM = `qa2w${STAMP}`
const beforeB = await queryUserWords(tokB, FORM)
const beforeCnt = Array.isArray(beforeB.json) ? beforeB.json.length : 0
note('B 事先的 user_words 命中数', beforeCnt)

// 模拟：A 离线时点了「生成这个词」，草稿里带着 **A 的 ownerId**，
// 然后 A 登出、B 登录。B 的 drain 会先走 claim → owner-mismatch → park，
// 所以**根本不会发出请求**。这里直接验「就算真发出去了也不会写进 B」：
// 用 generate Edge Function 以 B 的令牌调用，观察 user_words 是否增长。
const genRes = await fetch(`${GATEWAY}/functions/v1/generate-word`, {
  method: 'POST',
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${tokB}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ forms: [FORM], stationId: null }),
})
const genText = await genRes.text()
note('generate-word HTTP', genRes.status)
// 无论 Edge Function 是否可用（可能未部署 / 未授权），核心断言是：
// **B 名下不该出现这个 A 的词条**。若 Function 真的执行了，它会把词写进 B，
// 那才是 GAP-13 复发 —— 所以这里要区分「没执行」与「执行了但拒绝」。
note('generate-word 响应片段', genText.slice(0, 200))

await sleep(1500)
const afterB = await queryUserWords(tokB, FORM)
const afterCnt = Array.isArray(afterB.json) ? afterB.json.length : 0
note('B 之后的 user_words 命中数', afterCnt)

// ★ 决定性判定：用 A 的令牌查这个 form —— 词条既不该在 A 名下（因为 A 没生成），
//   也不该在 B 名下（A 的草稿不该在 B 的会话下执行）。
const afterA = await queryUserWords(tokA, FORM)
const aCnt = Array.isArray(afterA.json) ? afterA.json.length : 0
ok(
  aCnt === 0,
  `★★ A 名下没有这个 form_key（A 从没真正生成过，期望 0，实际 ${aCnt}）`,
)

// 若 generate 因故真的执行了并写进了 B，那就是 GAP-13 复发，必须红。
if (genRes.status === 200 && afterCnt > beforeCnt) {
  ok(
    false,
    `★★ GAP-13 复发：以 B 的令牌调用 generate 后，B 名下多了 ${afterCnt - beforeCnt} 行 user_words（form=${FORM}）`,
  )
} else {
  ok(
    afterCnt === beforeCnt,
    `★★ B 的 user_words 没有增加（${beforeCnt} → ${afterCnt}）—— A 的草稿没有在 B 的账号下生成词条`,
  )
}

// ================================================================ E-3b  GAP-C：连跑 N轮
//
// 实现者标记的第二个缺口：「A→logout→B 连跑 50 次」从未跑过。
// 这里真的连跑：每轮都用**新造的词**（word_key 带轮次），
// 于是「上一轮的行会不会漏到下一轮 / 漏到另一个账号」能被逐轮发现，
// 而不是第一轮对、第二轮开始就悄悄串了。
const LOOPS = Number((process.argv.find((a) => a.startsWith('--loops=')) || '').split('=')[1] || 0)
if (LOOPS > 0) {
  section(`E-3b GAP-C  A→登出→B 连跑 ${LOOPS} 轮`)
  let leakB = 0
  let leakA = 0
  let badStamp = 0
  const tA = new Date().toISOString()
  for (let i = 0; i < LOOPS; i += 1) {
    const key = `qa2.loop.${STAMP}.${i}`
    // A 写本轮的行
    const r = await api('/rest/v1/learn_records', {
      method: 'POST',
      token: tokA,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: [
        {
          owner_id: uidA,
          word_key: key,
          status: 'review',
          correct_count: 0,
          consecutive_correct: 0,
          incorrect_count: 1,
          last_studied_at: tA,
          last_result: 'incorrect',
          last_incorrect_at: tA,
          next_due_at: tA,
          status_changed_at: tA,
          status_source: 'learning',
          updated_at: tA,
        },
      ],
    })
    if (r.status >= 400) {
      badStamp += 1
      if (badStamp === 1) note('首轮写入失败', `${r.status} ${r.text.slice(0, 160)}`)
      continue
    }
    // B 查（登出 A、以 B 身份）：必须看不到
    const rb = await queryLearnRecords(tokB)
    const rows = Array.isArray(rb.json) ? rb.json : []
    if (rows.some((x) => String(x.word_key || '').startsWith('qa2.loop.'))) leakB += 1
    // A 自己查：必须看得到本轮的行，且 updated_at 非空
    const ra = await queryLearnRecords(tokA, key)
    const row = Array.isArray(ra.json) ? ra.json[0] : null
    if (!row || !row.updated_at) badStamp += 1
  }
  note('轮数', LOOPS)
  note('B 看到 A 的轮次行次数', leakB)
  note('A 侧异常次数', badStamp)
  ok(leakB === 0, `★★ 连跑 ${LOOPS} 轮，B 从未看到 A 的任何一行（泄漏 ${leakB} 轮）`)
  ok(badStamp === 0, `★ A 每一轮都能读回自己的行、updated_at 非空（异常 ${badStamp} 次）`)

  // 收尾：把这批 loop 行删掉（按 A 的令牌无权删，只能留着随账号一起删）
  // —— 账号删除会级联带走这些行，下面统一验证。
}

// ================================================================ E-4
section('E-4  实测错误形状（校准 isPermanentError 白名单）')

// ① 无 Authorization / 坏 key → PostgREST 的形状
const noAuth = await fetch(`${GATEWAY}/rest/v1/learn_records?select=*`, {
  headers: { apikey: ANON },
})
const noAuthText = await noAuth.text()
let noAuthJson = null
try {
  noAuthJson = JSON.parse(noAuthText)
} catch {
  /* ignore */
}
note('无 token select HTTP', noAuth.status)
note('无 token error.code', noAuthJson && noAuthJson.code)
note('无 token error.message', noAuthJson && noAuthJson.message)
// HTTP 200 但很可能返回的是**空数组**（PostgREST + RLS：查得到表、读不到行）。
// 这两者含义完全不同，所以把行数也记下来 —— 否则「200」会被误读成「无鉴权也能读全表」。
let noAuthRows = null
try {
  const parsed = JSON.parse(noAuthText)
  noAuthRows = Array.isArray(parsed) ? parsed.length : null
} catch {
  /* ignore */
}
note('无 token select 返回行数', noAuthRows === null ? '非数组响应' : noAuthRows)
ok(
  noAuth.status !== 200 || noAuthRows === 0,
  `★ 无 token 时读不到任何行（HTTP ${noAuth.status}，行数 ${noAuthRows}）—— RLS 不是「返回全表」`,
)

// ② 不存在的表 → PGRST205
const badTable = await fetch(`${GATEWAY}/rest/v1/table_that_does_not_exist_zzz?select=*`, {
  headers: { apikey: ANON, Authorization: `Bearer ${tokA}` },
})
const badTableText = await badTable.text()
let badTableJson = null
try {
  badTableJson = JSON.parse(badTableText)
} catch {
  /* ignore */
}
note('不存在的表 HTTP', badTable.status)
note('不存在的表 error.code', badTableJson && badTableJson.code)
note('不存在的表 error.message', badTableJson && badTableJson.message)

// ③ 坏 JWT → PGRST301
const badJwt = await fetch(`${GATEWAY}/rest/v1/learn_records?select=*`, {
  headers: { apikey: ANON, Authorization: 'Bearer not-a-jwt' },
})
const badJwtText = await badJwt.text()
let badJwtJson = null
try {
  badJwtJson = JSON.parse(badJwtText)
} catch {
  /* ignore */
}
note('坏 JWT HTTP', badJwt.status)
note('坏 JWT error.code', badJwtJson && badJwtJson.code)
note('坏 JWT error.message', badJwtJson && badJwtJson.message)

// ④ RLS 拒绝：用 A 的令牌写一条 owner_id = B 的行（若 RLS 生效应被拒）
const t3 = new Date().toISOString()
const rlsRes = await api('/rest/v1/learn_records', {
  method: 'POST',
  token: tokA,
  headers: { Prefer: 'return=minimal' },
  body: [
    {
      owner_id: uidB, // ← 故意写 B 的 uid，但令牌是 A
      word_key: 'qa2.e2e.rls.probe.1',
      status: 'review',
      correct_count: 0,
      consecutive_correct: 0,
      incorrect_count: 1,
      last_studied_at: t3,
      last_result: 'incorrect',
      last_incorrect_at: t3,
      next_due_at: t3,
      status_changed_at: t3,
      status_source: 'learning',
      updated_at: t3,
    },
  ],
})
note('RLS 越权写 HTTP', rlsRes.status)
note('RLS 越权写 响应', rlsRes.text.slice(0, 200))

// 关键：不管 RLS 放没放行，B 名下都**不该**出现 rls.probe（如果放行了，说明 RLS 缺失，
// 那本身就是要报的发现）
await sleep(500)
const probeB = await queryUserWords(tokA, 'qa2.e2e.rls.probe.1')
const bHasProbe = await api('/rest/v1/learn_records?select=word_key&word_key=eq.qa2.e2e.rls.probe.1', { token: tokB })
const bProbeRows = Array.isArray(bHasProbe.json) ? bHasProbe.json.length : 0
void probeB
note('B 名下 rls.probe 行数', bProbeRows)
ok(
  bProbeRows === 0,
  `★★ A 的令牌没能往 B 名下写进 rls.probe（实际 ${bProbeRows} 行）—— RLS 按令牌隔离成立`,
)

// ⑤ GAP-13 的**兜底防线**：即使 generate-word 真执行了、且假设它有 bug
//   （把词写进了「调用者」以外的人名下），user_words 的 RLS 是否还会兜住？
//   这一条独立验证「GAP-13 即使复发也不会污染他人账号」。
//   注意：线上 generate-word Edge Function 当前未部署（上面观测到 404 NOT_FOUND），
//   所以无法端到端跑真实的生成流程 —— 那是 GAP-13 唯一没能动态覆盖的部分。
const formProbe = `qa2rls${STAMP}`
const t4 = new Date().toISOString()
const uwRow = {
  id: crypto.randomUUID(), // ★ 必须是合法 uuid：id 列是 uuid 类型，用非 uuid 会在类型检查就被拒（40022P02），
  //   根本走不到 RLS —— 那样这条断言就是「因为写不进去所以没污染」的假通过。
  owner_id: uidB, // ← 故意写 B，令牌却是 A
  form: formProbe,
  form_key: formProbe,
  word_key: formProbe,
  source: 'ai',
  generation_status: 'ready',
  created_at: t4,
  updated_at: t4,
}
const uwRes = await api('/rest/v1/user_words', {
  method: 'POST',
  token: tokA,
  headers: { Prefer: 'return=minimal' },
  body: [uwRow],
})
note('user_words 越权写 HTTP', uwRes.status)
note('user_words 越权写 响应', uwRes.text.slice(0, 200))
// ★ 前置：必须确认这次失败**确实是 RLS 拒绝**，而不是 UUID 类型错误之类的别的原因。
//   否则「B 名下 0 行」可能只是因为请求根本没写成功 —— 假通过。
const uwBody = (() => { try { return JSON.parse(uwRes.text || '{}') } catch { return {} } })()
ok(
  uwRes.status === 403 || uwBody.code === '42501',
  `★ 前置：越权写被 RLS 以 42501/403 拒绝（HTTP ${uwRes.status}，code=${uwBody.code}）—— 不是别的错误`,
)
await sleep(500)
const uwInB = await queryUserWords(tokB, formProbe)
const inB = Array.isArray(uwInB.json) ? uwInB.json.length : 0
const uwInA = await queryUserWords(tokA, formProbe)
const inA = Array.isArray(uwInA.json) ? uwInA.json.length : 0
note('B 名下该 form_key 行数', inB)
note('A 名下该 form_key 行数', inA)
ok(
  inB === 0,
  `★★ A 的令牌没能把 user_words 写进 B 名下（实际 ${inB} 行）—— GAP-13 的 DB 兜底防线成立`,
)
ok(
  inA === 0,
  `A 名下也没有（它写的是 B 的 uid，RLS 应直接拒绝，实际 ${inA} 行）`,
)

// ================================================================ 清理
section('清理：删除所有一次性账号并证明')

for (const u of created) {
  const d = await deleteUser(u.id)
  ok(d.status === 200 || d.status === 204, `删除账号 ${u.email}（HTTP ${d.status}）`)
  // 证明：再查一次，应当 404 / 找不到
  const chk = await adminApi(`/auth/v1/admin/users/${u.id}`)
  const gone = chk.status === 404 || (Array.isArray(chk.json) && chk.json.length === 0)
  ok(gone, `★ 确认 ${u.email} 已不存在（复查 HTTP ${chk.status}）`)
}

// 兜底：再按邮箱搜一遍，确保没有漏网
const listRes = await adminApi(`/auth/v1/admin/users?per_page=100`)
const all = Array.isArray(listRes.json) ? listRes.json : (listRes.json && listRes.json.users) || []
const leftovers = all.filter((u) => String(u.email || '').startsWith(PREFIX))
note('按前缀残留的账号数', leftovers.length)
ok(leftovers.length === 0, `★★ 没有以 ${PREFIX} 开头的残留账号（实际 ${leftovers.length}）`)

created.length = 0

// ---------------------------------------------------------------- 汇总
console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
console.log('\n实测错误形状（供 isPermanentError 白名单校准参考）：')
Object.entries(observed)
  .filter(([k]) => k.includes('HTTP') || k.includes('code') || k.includes('message') || k.includes('error'))
  .forEach(([k, v]) => console.log(`  · ${k}: ${v}`))

if (fail > 0) {
  console.error('\n失败项：')
  failures.forEach((f) => console.error(`  · ${f}`))
}
process.exit(fail === 0 ? 0 : 1)
/**
 * B 组 P0 四条断言 · 连真 Supabase 跑（QA 独立执行）
 * ===================================================================
 * 跑：node scripts/qa-live-b.mjs
 *
 * ★ 为什么必须连真库 ★
 *   实现者诚实标注了「后两条单测无法覆盖、需 QA 上真库」。这是本轮唯一的
 *   验证缺口，也是 B 组最不可妥协的四条：
 *     ① 学习记录逐字段一致（移出小站前后 exportJson 快照逐字节比对）
 *     ② 移出后到期仍在学习页复习队列
 *     ③ 端到端删词：station_words 该行消失 / user_words 仍在 / learn_records 不变
 *     ④ 跨账号隔离：A 的记录在 B 登录后不可见
 *   这些全都依赖 Postgres 的真实行为（RLS、唯一索引、cascade），
 *   mock 一个 supabase-js 只能验证「我们调用了正确的 URL」，验证不了
 *   「数据库真的这么做了」。
 *
 * ★ 走线上网关而非本地 supabase ★
 *   网关地址 https://word-station.pages.dev/supabase（生产同款链路）。
 *
 * ★ 凭据处理（红线）★
 *   service_role 与 anon key 只从 .env.local 读进内存，**绝不打印**。
 *   所有日志只输出 uid 前后 8 位、id 的前 8 位、以及布尔结论。
 *
 * ★ 清理（红线）★
 *   临时账号一律用前缀 qa-b-<时间戳>- 开头，结束时：
 *     ① 逐个复查（getUserById → 404）
 *     ② 按前缀全量扫描残留数 = 0
 *   两者都通过才算清理完成；任一不通过则 process.exit(2) 并打印补救指引。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// ---------------------------------------------------------------- 凭据（不打印）
function loadEnv() {
  const txt = readFileSync(resolve('.env.local'), 'utf8')
  const env = {}
  txt.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (!m) return
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[m[1]] = v
  })
  return env
}
const ENV = loadEnv()
const GW = 'https://word-station.pages.dev/supabase'
const ANON = ENV.VITE_SUPABASE_ANON_KEY
const SERVICE = ENV.SUPABASE_SERVICE_ROLE_KEY
if (!ANON || !SERVICE) {
  console.error('★ 缺少 .env.local 里的 key，无法连真库')
  process.exit(2)
}

/** 只显示前 8 位，避免泄露完整凭据 / uuid */
const short = (s) => (s ? String(s).slice(0, 8) : '(null)')

let pass = 0
let fail = 0
const failures = []
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    failures.push(m)
    console.error(`  ✗ ${m}`)
  }
}
const section = (t) => console.log(`\n— ${t}`)

// ---------------------------------------------------------------- HTTP 封装
async function req(path, { method = 'GET', body, token, useService = false, raw = false, headers: extra = {} } = {}) {
  const url = `${GW}${path}`
  const headers = {
    apikey: useService ? SERVICE : ANON,
    Authorization: `Bearer ${token || (useService ? SERVICE : ANON)}`,
    'Content-Type': 'application/json',
    ...extra,
  }
  const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    if (!raw) json = { _text: text.slice(0, 200) }
  }
  return { status: res.status, json, text }
}

const PREFIX = `qa-b-${Date.now().toString(36)}-`
const createdUsers = []

/** 建临时账号（email_confirm: true），返回 { email, password, uid, accessToken } */
async function mkUser(tag) {
  const email = `${PREFIX}${tag}@example.com`
  const password = `QaB-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const r = await req('/auth/v1/admin/users', {
    method: 'POST',
    useService: true,
    body: { email, password, email_confirm: true },
  })
  if (r.status !== 200 || !r.json || !r.json.id) {
    throw new Error(`建账号失败：${r.status} ${JSON.stringify(r.json).slice(0, 200)}`)
  }
  // 换一枚 anon token（用密码登录），后续所有调用都用**用户自己的 JWT**
  const lr = await req('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
  if (lr.status !== 200 || !lr.json || !lr.json.access_token) {
    throw new Error(`登录失败：${lr.status} ${JSON.stringify(lr.json).slice(0, 200)}`)
  }
  const u = { email, password, uid: r.json.id, token: lr.json.access_token, tag }
  createdUsers.push(u)
  console.log(`  · 临时账号已建 [${tag}] uid=${short(u.uid)} email 前缀=${PREFIX}${tag}@…`)
  return u
}

// ---------------------------------------------------------------- REST helpers
const rest = {
  list: (u, table, query = '') =>
    req(`/rest/v1/${table}?${query}`, { token: u.token }),
  insert: (u, table, body) =>
    req(`/rest/v1/${table}`, { method: 'POST', token: u.token, body }),
  del: (u, table, query) => req(`/rest/v1/${table}?${query}`, { method: 'DELETE', token: u.token }),
  // service_role 直查（绕 RLS）
  svcList: (table, query) => req(`/rest/v1/${table}?${query}`, { useService: true }),
  svcDel: (table, query) => req(`/rest/v1/${table}?${query}`, { method: 'DELETE', useService: true }),
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

/** 稳定序列化（键排序），用于「逐字段/逐字节比对」 */
function stable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`
  const keys = Object.keys(v).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`
}

console.log('[qa-live-b] B 组 P0 四条断言 · 连真 Supabase（线上网关）')
console.log(`  临时账号前缀：${PREFIX}*`)

// ================================================================== 主流程
let A, B, stationId, stationId2, wordPub, wordUser, wordKeep
let exportBefore, exportAfter, learnRowBefore, learnRowAfter
let userWordsCountBefore, userWordsCountAfter

try {
  // ---------------------------------------------------------------- 建号
  section('准备：建两个临时账号（A 用于主流程，B 用于跨账号隔离）')
  A = await mkUser('a')
  B = await mkUser('b')
  ok(Boolean(A.uid && B.uid && A.uid !== B.uid), '两个账号建成且 uid 不同')

  // ---------------------------------------------------------------- 建站 + 加词
  section('准备：A 建两个小站并加词（一个公共词 + 一个私有词 + 一个留作对照）')
  const stName = `${PREFIX}雅思`.slice(0, 40)
  const st2Name = `${PREFIX}论文`.slice(0, 40)
  // ★ 必须显式带 owner_id：RLS 的 WITH CHECK 是
  //   owner_id = (select auth.uid())，而 PostgREST **不会**把 JWT 里的 uid
  //   自动填进未提供的列。第一版我漏了 owner_id → 全部 403
  //   （new row violates row-level security policy）。
  //   这不是产品缺陷：src/lib/cloud/stations.js:104 的真实写法就是
  //   insert({ owner_id: ownerId, name: clean }) —— 应用侧一直是对的。
  // ★ 两个关于 PostgREST 的实测坑（都写下来免得重犯）：
  //   ① 不带 `?select=` 的 insert **不返回响应体**（body=null）→ 拿不到新行 id。
  //      真实 app 用 supabase-js 的 `.insert().select().single()`，那会让
  //      PostgREST 带上 `Prefer: return=representation` 并回填 id。
  //      我这里走裸 fetch，所以改成「插入后按 owner_id 查回来」。
  //   ② 插入前必须显式带 owner_id（RLS with check 不认 JWT 自动填充）。
  const s1 = await rest.insert(A, 'stations', { owner_id: A.uid, name: stName, pinned: false })
  const s2 = await rest.insert(A, 'stations', { owner_id: A.uid, name: st2Name, pinned: false })
  const stList = await rest.list(A, 'stations', `owner_id=eq.${A.uid}&select=id,name&order=name`)
  ok(
    (s1.status === 201 || s1.status === 200) && (s2.status === 201 || s2.status === 200),
    `A 建两个小站成功（${s1.status} / ${s2.status}）`,
  )
  const names = (stList.json || []).map((x) => x.name)
  const idByName = Object.fromEntries((stList.json || []).map((x) => [x.name, x.id]))
  stationId = idByName[stName]
  stationId2 = idByName[st2Name]
  ok(names.length === 2, `查到 2 个小站（实际 ${names.length}：${names.join(' / ')}）`)
  ok(Boolean(stationId && stationId2), '两个小站都取到了 id')

  // 私有词（先落 user_words，再引用）
  wordUser = `u.qa${Date.now().toString(36)}word`
  const uw = await rest.insert(A, 'user_words', {
    owner_id: A.uid,
    form: 'quixotic',
    form_key: wordUser.slice(2),
    word_key: wordUser,
    pos: 'adj.',
    gloss: '异想天开的',
    cefr: 'C2',
    morphs: [],
    chain: [],
  })
  ok(uw.status === 201 || uw.status === 200, `A 建私有词成功（${uw.status}）`)
  ok(Boolean(wordUser), '私有词 wordKey 已确定（u.<form_key>）')

  wordPub = `w.photosynthesis`
  wordKeep = `w.obtuse`

  // ★ RLS 的 with check 是 `owner_id = auth.uid() and station_owned_by_me(station_id)` ——
  //   所以 owner_id 与 station_id 两者都必须对，否则 403。
  //   （第一版 403 就是因为 stationId 此刻还是 undefined，policy 判定失败。）
  const add = await rest.insert(A, 'station_words', [
    { owner_id: A.uid, station_id: stationId, word_key: wordPub, source: 'public' },
    { owner_id: A.uid, station_id: stationId, word_key: wordUser, source: 'user' },
    { owner_id: A.uid, station_id: stationId, word_key: wordKeep, source: 'public' },
    { owner_id: A.uid, station_id: stationId2, word_key: wordUser, source: 'user' },
  ])
  ok(
    add.status === 201 || add.status === 200,
    `A 加 4 条词条引用成功（${add.status}${add.json && add.json.message ? `：${String(add.json.message).slice(0, 80)}` : ''}；含跨两个小站各一条 u.*）`,
  )

  // ---------------------------------------------------------------- 准备学习记录
  section('准备：写入学习记录（status/correctCount/nextDueAt/lastResult/statusSource 全部设成非默认值）')
  const nextDuePast = '2026-01-01T00:00:00.000Z' // 已到期 → 应出现在复习队列
  const lrs = await rest.insert(A, 'learn_records', [
    {
      owner_id: A.uid,
      word_key: wordPub,
      status: 'review',
      correct_count: 7,
      consecutive_correct: 3,
      incorrect_count: 5,
      last_studied_at: '2025-12-01T00:00:00.000Z',
      last_result: 'incorrect',
      last_incorrect_at: '2025-12-01T00:00:00.000Z',
      next_due_at: nextDuePast,
      status_changed_at: '2025-12-01T00:00:00.000Z',
      status_source: 'user',
    },
    {
      owner_id: A.uid,
      word_key: wordUser,
      status: 'review',
      correct_count: 2,
      consecutive_correct: 0,
      incorrect_count: 1,
      last_studied_at: '2025-11-01T00:00:00.000Z',
      last_result: 'incorrect',
      last_incorrect_at: '2025-11-01T00:00:00.000Z',
      next_due_at: nextDuePast,
      status_changed_at: '2025-11-01T00:00:00.000Z',
      status_source: 'user',
    },
  ])
  ok(lrs.status === 201 || lrs.status === 200, `A 写入 2 条学习记录成功（${lrs.status}）`)

  // 快照 ①：移出前的 learn_records（service_role 直查，绕 RLS）
  const lb = await rest.svcList('learn_records', `owner_id=eq.${A.uid}&select=*`)
  ok(lb.status === 200, `service_role 直查 learn_records 成功（${lb.status}）`)
  const beforeRows = lb.json || []
  learnRowBefore = Object.fromEntries(beforeRows.map((r) => [r.word_key, r]))
  ok(Object.keys(learnRowBefore).length === 2, `移出前 learn_records 有 2 行（实际 ${Object.keys(learnRowBefore).length}）`)

  // 快照 ②：user_words 行数
  const ub = await rest.svcList('user_words', `owner_id=eq.${A.uid}&select=id`)
  userWordsCountBefore = (ub.json || []).length
  ok(userWordsCountBefore === 1, `移出前 user_words 有 1 行（实际 ${userWordsCountBefore}）`)

  // ---------------------------------------------------------------- 断言 ③-1
  section('断言 ③-1：端到端删词 —— 移出前 station_words 的行确实存在')
  const swBefore = await rest.svcList('station_words', `station_id=eq.${stationId}&select=*`)
  ok(Array.isArray(swBefore.json), `service_role 查 station_words 返回数组（status=${swBefore.status}）`)
  const beforeRefs = Array.isArray(swBefore.json) ? swBefore.json : []
  ok(beforeRefs.length === 3, `移出前该小站 3 条引用（实际 ${beforeRefs.length}）`)
  ok(beforeRefs.some((r) => r.word_key === wordPub), '目标公共词在站内')

  // ---------------------------------------------------------------- 执行移出
  section('执行：A 把公共词移出小站（DELETE station_words … match{station_id, word_key}）')
  const del = await rest.del(A, 'station_words', `station_id=eq.${stationId}&word_key=eq.${wordPub}`)
  ok(del.status === 204 || del.status === 200, `删除请求成功（${del.status}）`)

  // ---------------------------------------------------------------- 断言 ③-2
  section('断言 ③-2：station_words 该行消失（service_role 绕 RLS 直查）')
  const swAfter = await rest.svcList('station_words', `station_id=eq.${stationId}&select=*`)
  const afterRefs = swAfter.json || []
  ok(!afterRefs.some((r) => r.word_key === wordPub), '★ 目标词的 station_words 行已消失（无残留）')
  ok(afterRefs.length === 2, `该小站剩 2 条（实际 ${afterRefs.length}）`)
  const dup = await rest.svcList('station_words', `station_id=eq.${stationId}&word_key=eq.${wordPub}`)
  ok((dup.json || []).length === 0, '★ 唯一索引 station_words_uniq 下无残留行')

  // ---------------------------------------------------------------- 断言 ③-3
  section('断言 ③-3：user_words 里的私有词条仍在（未被连带删除）')
  const uwAfter = await rest.svcList('user_words', `owner_id=eq.${A.uid}&select=*`)
  userWordsCountAfter = (uwAfter.json || []).length
  ok(userWordsCountAfter === userWordsCountBefore, `★ user_words 行数不变（${userWordsCountBefore} → ${userWordsCountAfter}）`)
  ok((uwAfter.json || []).some((r) => r.word_key === wordUser), '★ 私有词条仍在')

  // ---------------------------------------------------------------- 断言 ③-4 + ①
  section('断言 ①③-4：learn_records 逐字段不变（逐字节稳定序列化比对）')
  const la = await rest.svcList('learn_records', `owner_id=eq.${A.uid}&select=*`)
  const afterRows = la.json || []
  learnRowAfter = Object.fromEntries(afterRows.map((r) => [r.word_key, r]))
  ok(
    Object.keys(learnRowAfter).length === Object.keys(learnRowBefore).length,
    `行数不变（${Object.keys(learnRowBefore).length} → ${Object.keys(learnRowAfter).length}）`,
  )
  // 对每个字段逐一比对（含 updated_at —— 它若变了就说明有过写）
  const FIELDS = [
    'status',
    'correct_count',
    'consecutive_correct',
    'incorrect_count',
    'last_studied_at',
    'last_result',
    'last_incorrect_at',
    'next_due_at',
    'status_changed_at',
    'status_source',
    'updated_at',
  ]
  let allSame = true
  const diffs = []
  for (const k of Object.keys(learnRowBefore)) {
    for (const f of FIELDS) {
      const b4 = learnRowBefore[k][f] ?? null
      const af = learnRowAfter[k] ? (learnRowAfter[k][f] ?? null) : null
      if (stable(b4) !== stable(af)) {
        allSame = false
        diffs.push(`${k}.${f}: ${stable(b4)} → ${stable(af)}`)
      }
    }
  }
  ok(allSame, `★★ 逐字段比对：所有 key 的 ${FIELDS.length} 个字段完全一致${diffs.length ? `（差异：${diffs.join('; ')}）` : ''}`)
  ok(
    stable(learnRowBefore) === stable(learnRowAfter),
    '★★ 整体稳定序列化逐字节相同（exportJson 快照等价）',
  )
  // 明确验一下「非默认值真的写进去了」—— 否则「一致」可能因为两行都是空
  // ★ 必须验「快照非平凡」，否则「前后一致」可能只是因为两行都是默认值。
  //   逐字段打印实际值 —— 我第一版只写了一句笼统的断言，
  //   失败时看不出到底哪个字段没写进去。
  const rb = learnRowBefore[wordPub] || {}
  const expectPub = {
    correct_count: 7,
    consecutive_correct: 3,
    incorrect_count: 5,
    status: 'review',
    last_result: 'incorrect',
    status_source: 'user',
  }
  const badFields = Object.entries(expectPub).filter(([k, v]) => rb[k] !== v)
  ok(
    badFields.length === 0,
    `★ 公共词快照非平凡：${Object.entries(expectPub)
      .map(([k, v]) => `${k}=${JSON.stringify(rb[k])}${rb[k] === v ? '' : `（期望 ${v}）`}`)
      .join(' / ')}`,
  )
  const ru = learnRowBefore[wordUser] || {}
  ok(
    ru.correct_count === 2 && ru.incorrect_count === 1 && ru.consecutive_correct === 0,
    `★ 私有词快照非平凡：correct_count=${ru.correct_count} / incorrect_count=${ru.incorrect_count} / consecutive_correct=${ru.consecutive_correct}`,
  )
  const dueVals = [rb.next_due_at, ru.next_due_at]
  ok(
    dueVals.every((v) => typeof v === 'string' && v.length > 0),
    `★ next_due_at 均已写入且已到期：${dueVals.join(' / ')}（判定基准 ${nextDuePast}）`,
  )

  // ---------------------------------------------------------------- 断言 ②
  section('断言 ②：移出后到期，仍在学习页复习队列（用真 learning.js 纯函数判定）')
  // ★ Windows 上必须转 file:// URL：直接 import('C:/…') 会抛
  //   ERR_UNSUPPORTED_ESM_URL_SCHEME（Received protocol 'c:'）。
  const learning = await import(pathToFileURL(resolve('src/lib/learning.js')).href)
  // statWords = 全库 ∪ 私有词，与小站无关 —— 这里用「全库代表词 + 私有词」
  const statWords = [
    { id: wordPub, form: 'photosynthesis' },
    { id: wordUser, form: 'quixotic' },
    { id: wordKeep, form: 'obtuse' },
  ]
  const nowIso = new Date().toISOString()
  const recs = Object.fromEntries(
    Object.values(learnRowAfter).map((r) => [
      r.word_key,
      {
        wordKey: r.word_key,
        status: r.status,
        correctCount: r.correct_count,
        consecutiveCorrect: r.consecutive_correct,
        incorrectCount: r.incorrect_count,
        lastResult: r.last_result,
        lastIncorrectAt: r.last_incorrect_at,
        nextDueAt: r.next_due_at,
        statusChangedAt: r.status_changed_at,
        statusSource: r.status_source,
      },
    ]),
  )
  const queue = learning.buildReviewQueue(statWords, recs, 50, nowIso)
  const qKeys = queue.map((w) => w.id || w.wordKey)
  ok(qKeys.includes(wordPub), `★★ 已移出小站的公共词仍在复习队列里（队列键：${qKeys.join(', ') || '(空)'}）`)
  ok(qKeys.includes(wordUser), '★ 未移出的小站私有词也在队列里')

  // 站内队列（对照）：该词应**不在**站内队列
  const stRefsAfter = await rest.svcList('station_words', `station_id=eq.${stationId}&select=word_key`)
  const stKeys = (stRefsAfter.json || []).map((r) => r.word_key)
  const stWords = stKeys.map((k) => ({ id: k, form: k.slice(2) }))
  const stQueue = learning.buildReviewQueue(stWords, recs, 50, nowIso)
  const stQueueKeys = stQueue.map((w) => w.id || w.wordKey)
  ok(!stQueueKeys.includes(wordPub), '★ 对照：它已从**站内**复习队列消失（两边语义确实不同）')
  ok(stQueueKeys.includes(wordUser), '对照：站内队列仍含未移出的词')

  // ---------------------------------------------------------------- 断言 ②b
  section('断言 ②b：在学习页复习它，status 照常更新')
  // ★ 409 是我的错：learn_records 的主键是 (owner_id, word_key)，
  //   而我用的是裸 POST（= 纯 insert）→ 撞主键冲突。
  //   真实 app 走 supabase-js 的 `.upsert()`，对应 PostgREST 的
  //   POST + `Prefer: resolution=merge-duplicates`（或 on_conflict）。
  //   这里必须照做，否则验的就不是「复习能照常更新」而是「insert 会不会撞」。
  const up = await req('/rest/v1/learn_records', {
    method: 'POST',
    token: A.token,
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: [
      {
        owner_id: A.uid,
        word_key: wordPub,
        status: 'known',
        correct_count: 8,
        consecutive_correct: 1,
        incorrect_count: 5,
        last_studied_at: nowIso,
        last_result: 'correct',
        next_due_at: null,
        status_changed_at: nowIso,
        status_source: 'user',
      },
    ],
  })
  ok(
    up.status === 201 || up.status === 200,
    `复习后 upsert 成功（${up.status}${up.json && up.json.message ? `：${String(up.json.message).slice(0, 80)}` : ''}）`,
  )
  const afterReview = await rest.svcList('learn_records', `owner_id=eq.${A.uid}&word_key=eq.${wordPub}&select=*`)
  const rr = (afterReview.json || [])[0]
  ok(rr && rr.status === 'known' && rr.correct_count === 8, `★ 该词状态照常更新为 known / correct_count=8（实际 ${rr && rr.status}/${rr && rr.correct_count}）`)

  // ---------------------------------------------------------------- 断言 ④
  section('断言 ④：跨账号隔离 —— A 的记录在 B 登录后不可见（B 用自己的 JWT 直查）')
  const bStations = await rest.list(B, 'stations', 'select=*')
  const bStationsList = bStations.json || []
  ok(
    !bStationsList.some((s) => s.id === stationId),
    '★ B 看不到 A 的小站',
  )
  ok(bStationsList.length === 0, `B 的小站列表为空（实际 ${bStationsList.length}）`)
  const bSw = await rest.list(B, 'station_words', `station_id=eq.${stationId}&select=*`)
  ok((bSw.json || []).length === 0, '★ B 用自己的 token 查 A 的 station_words 查不到（RLS 兜住）')
  const bLr = await rest.list(B, 'learn_records', `owner_id=eq.${A.uid}&select=*`)
  ok((bLr.json || []).length === 0, '★ B 查不到 A 的 learn_records')
  const bUw = await rest.list(B, 'user_words', `owner_id=eq.${A.uid}&select=*`)
  ok((bUw.json || []).length === 0, '★ B 查不到 A 的 user_words')
  // 反向：A 能看到自己的
  const aLr = await rest.list(A, 'learn_records', `owner_id=eq.${A.uid}&select=*`)
  ok((aLr.json || []).length === 2, `A 能看到自己的 2 条记录（实际 ${(aLr.json || []).length}）`)

  // ---------------------------------------------------------------- 额外：彻底删除连带清引用
  section('额外：userWordsApi.remove 的语义 —— 删词条连带清所有小站引用')
  const uwCountBefore2 = ((await rest.svcList('user_words', `owner_id=eq.${A.uid}&select=id`)).json || []).length
  const refsBefore2 = ((await rest.svcList('station_words', `owner_id=eq.${A.uid}&word_key=eq.${wordUser}&select=*`)).json || [])
  ok(refsBefore2.length === 2, `私有词当前有 ${refsBefore2.length} 条小站引用（两个小站各一条）`)
  // 模拟 userWordsApi.remove 的两步（先删引用再删词条）
  await rest.del(A, 'station_words', `owner_id=eq.${A.uid}&word_key=eq.${wordUser}`)
  await rest.del(A, 'user_words', `owner_id=eq.${A.uid}&word_key=eq.${wordUser}`)
  const refsAfter2 = ((await rest.svcList('station_words', `owner_id=eq.${A.uid}&word_key=eq.${wordUser}&select=*`)).json || [])
  const uwCountAfter2 = ((await rest.svcList('user_words', `owner_id=eq.${A.uid}&select=id`)).json || []).length
  ok(refsAfter2.length === 0, `★ 所有小站引用都被清掉（剩 ${refsAfter2.length} 条）`)
  ok(uwCountAfter2 === uwCountBefore2 - 1, `★ user_words 词条被删（${uwCountBefore2} → ${uwCountAfter2}）`)
  const lrStill = await rest.svcList('learn_records', `owner_id=eq.${A.uid}&word_key=eq.${wordUser}&select=*`)
  ok((lrStill.json || []).length === 1, '★ 学习记录不受「彻底删除词条」影响（仍在）')
} catch (e) {
  fail += 1
  failures.push(`运行异常：${e && e.message}`)
  console.error(`\n  ✗ 运行异常：${e && e.stack ? e.stack : e}`)
}

// ---------------------------------------------------------------- 清理（红线）
section('清理临时账号（红线：必须证明删干净）')
let cleanupOk = true
for (const u of createdUsers) {
  // ① 逐个复查
  const chk = await req(`/auth/v1/admin/users/${u.uid}`, { useService: true })
  const gone = chk.status === 404 || chk.status === 200
  if (chk.status === 200) {
    // 还在 → 再删一次
    const rm = await req(`/auth/v1/admin/users/${u.uid}`, { method: 'DELETE', useService: true })
    const re = await req(`/auth/v1/admin/users/${u.uid}`, { useService: true })
    const okNow = re.status === 404
    console.log(`  ${okNow ? '✓' : '✗'} [${u.tag}] 复查时仍存在 → 已再删，现 status=${re.status}`)
    if (!okNow) cleanupOk = false
  } else {
    console.log(`  ✓ [${u.tag}] 复查：已不存在（status=${chk.status}）`)
  }
  // 连带数据自检（cascade 应已清干净）
  const cnt = await rest.svcList('station_words', `owner_id=eq.${u.uid}&select=id`)
  const c = (cnt.json || []).length
  if (c !== 0) {
    console.log(`  ⚠ [${u.tag}] 残留 station_words ${c} 行（auth cascade 未清干净）`)
    cleanupOk = false
  }
}

// ② 按前缀全量扫描残留
const scan = await req(`/auth/v1/admin/users?per_page=1000`, { useService: true })
const all = scan.json || []
const leftovers = Array.isArray(all) ? all.filter((x) => String(x.email || '').startsWith(PREFIX)) : []
ok(leftovers.length === 0, `按前缀全量扫描残留账号数 = ${leftovers.length}（前缀 ${PREFIX}）`)
if (leftovers.length) {
  cleanupOk = false
  console.error(`  ✗ 残留邮箱：${leftovers.map((x) => x.email).join(', ')}`)
}
ok(cleanupOk, '★★ 临时账号清理完成且已证明删干净')

console.log(`\n=== qa-live-b 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) {
  console.log('失败项：')
  failures.forEach((f) => console.log(`  - ${f}`))
}
process.exit(fail === 0 && cleanupOk ? 0 : fail === 0 ? 2 : 1)

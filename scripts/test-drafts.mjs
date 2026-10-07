/**
 * 草稿队列的认领 / 丢弃 / 永久失败单测（Node 直跑）
 * ------------------------------------------------------------------
 * 跑：npm run test:drafts
 *
 * 覆盖 GAP-5 的三条语义（纯函数 + 本地队列，无需网络）：
 *   1. 认领：草稿 ownerId 不等于当前 uid → 丢弃，不推送、不阻塞后续；
 *   2. 结构损坏 → 丢弃并记日志；
 *   3. 可重试失败 → 保留但**继续下一条**（绝不 break 堵死队列）；
 *   4. 永久失败判定按 U1 实测形状校准，且未识别错误默认安全侧（保留）。
 *
 * 网络调用全部通过注入的假 API 完成（offline.js 的 pushOne 走真实模块，
 * 这里用「草稿结构性损坏 → 走不到网络」与「认领阶段就丢弃」两条路径覆盖，
 * 上行成功/失败的分支由 claim 的返回值驱动，不需要真的打网络）。
 */
import assert from 'node:assert/strict'

/** 极简 localStorage mock */
function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}

globalThis.localStorage = fakeStorage()

const { keysFor, readLearn, scopeOf, writeLearn } = await import('../src/lib/migrate.js')
const {
  claim,
  clearStuck,
  drain,
  enqueue,
  hashUid,
  isPermanentError,
  moveToDiscarded,
  pendingByKind,
  pendingCount,
  readDiscarded,
  readDrafts,
  stuckCount,
  DISCARDED_LIMIT,
} = await import('../src/lib/cloud/offline.js')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

/** 异步版（当前 claim / discard 路径都是同步的，但保留 async 以便将来覆盖上行分支） */
async function atest(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

function reset() {
  globalThis.localStorage = fakeStorage()
}

const UID_A = '11111111-1111-1111-1111-111111111111'
const UID_B = '22222222-2222-2222-2222-222222222222'

console.log('[test:drafts]')

// ---------------------------------------------------------------- claim

test('claim：ownerId 等于当前 uid → 认领成功（四类草稿都认）', () => {
  const items = {
    learn: { ownerId: UID_A, rows: [{ wordKey: 'w.a', record: {} }] },
    stationWords: { ownerId: UID_A, stationId: 'st-1', items: [{ wordKey: 'w.a' }] },
    stations: { row: { id: 'st-1', ownerId: UID_A, name: '雅思' } },
    generate: { ownerId: UID_A, stationId: 'st-1', forms: ['quixotic'] },
  }
  Object.keys(items).forEach((kind) => {
    assert.deepEqual(claim(kind, items[kind], UID_A), { ok: true }, `${kind} 应被认领`)
  })
})

test('claim：ownerId 是别的账号 → discard / owner-mismatch（四类都拦）', () => {
  const items = {
    learn: { ownerId: UID_A, rows: [{ wordKey: 'w.a', record: {} }] },
    stationWords: { ownerId: UID_A, stationId: 'st-1', items: [{ wordKey: 'w.a' }] },
    stations: { row: { id: 'st-1', ownerId: UID_A, name: '雅思' } },
    // generate 也必须拦：服务端从 JWT 推导 owner，A 的生词草稿在 B 会话下
    // 会真的把词生成到 B 的账号里（比 learn 更隐蔽，因为它不报错）
    generate: { ownerId: UID_A, stationId: 'st-1', forms: ['quixotic'] },
  }
  Object.keys(items).forEach((kind) => {
    assert.deepEqual(
      claim(kind, items[kind], UID_B),
      { ok: false, verdict: 'discard', reason: 'owner-mismatch' },
      `${kind} 必须因 owner 不匹配被丢弃`,
    )
  })
})

test('claim：结构性损坏 → skip / malformed（不推送、不无限重试）', () => {
  assert.equal(claim('learn', { ownerId: UID_A, rows: '不是数组' }, UID_A).reason, 'malformed')
  assert.equal(claim('stationWords', { ownerId: UID_A, stationId: null, items: [] }, UID_A).reason, 'malformed')
  assert.equal(claim('stationWords', { ownerId: UID_A, stationId: 'st-1', items: null }, UID_A).reason, 'malformed')
  assert.equal(claim('generate', { ownerId: UID_A, forms: null }, UID_A).reason, 'malformed')
  assert.equal(claim('stations', { ownerId: UID_A }, UID_A).reason, 'malformed')
  assert.equal(claim('stations', { row: { ownerId: UID_A } }, UID_A).reason, 'malformed')
  assert.equal(claim('learn', { ownerId: UID_A, rows: [] }, UID_A).ok, true, '空数组是合法草稿（推上去 0 条）')
})

test('claim：缺 ownerId → skip；游客（uid 为空）→ skip / no-auth', () => {
  assert.equal(claim('learn', { rows: [] }, UID_A).reason, 'malformed', '缺 ownerId 视为结构损坏')
  assert.deepEqual(claim('learn', { ownerId: UID_A, rows: [] }, null), {
    ok: false,
    verdict: 'skip',
    reason: 'no-auth',
  })
  assert.deepEqual(claim('learn', { ownerId: UID_A, rows: [] }, ''), { ok: false, verdict: 'skip', reason: 'no-auth' })
})

test('claim：item 不是对象 → skip / malformed', () => {
  assert.deepEqual(claim('learn', null, UID_A), { ok: false, verdict: 'skip', reason: 'malformed' })
  assert.deepEqual(claim('learn', '字符串', UID_A), { ok: false, verdict: 'skip', reason: 'malformed' })
})

// ---------------------------------------------------------------- isPermanentError（U1 实测校准）

test('isPermanentError：RLS 拒绝（U1 实测：HTTP 401 + code 42501）判为永久', () => {
  assert.equal(
    isPermanentError({ code: '42501', message: 'new row violates row-level security policy for table "learn_records"' }),
    true,
  )
})

test('isPermanentError：JWT / API key 失败（U1 实测）判为永久', () => {
  assert.equal(isPermanentError({ code: 'PGRST301', message: 'Expected 3 parts in JWT; got 1' }), true)
  assert.equal(isPermanentError({ code: 'PGRST301', message: 'No suitable key or wrong key type' }), true)
  // 「Invalid API key」实测**没有 code**，只能靠 message 关键词
  assert.equal(isPermanentError({ message: 'Invalid API key', hint: 'Double check your Supabase anon key' }), true)
  assert.equal(isPermanentError({ code: '401', message: 'JWT expired' }), true)
})

test('isPermanentError：资源不存在（PGRST205 / 404 / NOT_FOUND）判为永久', () => {
  assert.equal(isPermanentError({ code: 'PGRST205', message: "Could not find the table 'x'" }), true)
  assert.equal(isPermanentError({ code: '404', message: 'not found' }), true)
  assert.equal(isPermanentError({ code: 'NOT_FOUND', message: '' }), true)
})

test('isPermanentError：网络 / 5xx / 超时判为可重试（草稿必须保留）', () => {
  assert.equal(isPermanentError({ code: '', message: 'TypeError: fetch failed' }), false)
  assert.equal(isPermanentError({ code: 'INTERNAL', message: '网络异常' }), false)
  assert.equal(isPermanentError({ code: 'TIMEOUT', message: '上行超时（30s）' }), false)
  assert.equal(isPermanentError({ code: '500', message: 'Internal Server Error' }), false)
  assert.equal(isPermanentError({ code: '503', message: 'Service Unavailable' }), false)
  assert.equal(isPermanentError({ code: 'NO_SUPABASE', message: '未配置 Supabase' }), false)
})

test('isPermanentError：未识别的错误默认安全侧 —— 一律可重试，绝不丢数据', () => {
  // 这是 U1 的核心要求：无法识别时**保留**草稿而不是猜测丢弃
  assert.equal(isPermanentError({ code: 'SOMETHING_NEW', message: '以前没见过的形状' }), false)
  assert.equal(isPermanentError({}), false)
  assert.equal(isPermanentError(null), false)
  assert.equal(isPermanentError(undefined), false)
  assert.equal(isPermanentError('字符串'), false, '非对象一律视为可重试')
})

test('isPermanentError：TOO_BATCHY 之类的新错误码不会被误判为永久', () => {
  // 只要不认识，就必须保留 —— 宁可下轮重试，也不能永久丢
  assert.equal(isPermanentError({ code: '57014', message: 'canceling statement due to statement timeout' }), false)
})

// ---------------------------------------------------------------- hashUid（U5）

test('hashUid：存的是哈希前缀，不是半个 uid', () => {
  const h = hashUid(UID_A)
  assert.equal(h.length, 8)
  assert.ok(/^[0-9a-f]{8}$/.test(h), `应为 8 位十六进制，实际 ${h}`)
  assert.ok(!h.includes(UID_A.slice(0, 8)), '绝不能包含 uid 的原文片段')
  assert.ok(!UID_A.includes(h), '哈希也不该是 uid 的子串')
})

test('hashUid：同 uid 稳定、不同 uid 不同、空值返回空串', () => {
  assert.equal(hashUid(UID_A), hashUid(UID_A))
  assert.notEqual(hashUid(UID_A), hashUid(UID_B))
  assert.equal(hashUid(''), '')
  assert.equal(hashUid(null), '')
  assert.equal(hashUid(undefined), '')
  assert.equal(hashUid(123), '')
})

// ---------------------------------------------------------------- 队列分区

test('enqueue / pendingCount：草稿按 scope 分区，互不串', () => {
  reset()
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.a', record: {} }] }, scopeOf(UID_A))
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.b', record: {} }] }, scopeOf(UID_A))
  enqueue('learn', { ownerId: UID_B, rows: [{ wordKey: 'w.c', record: {} }] }, scopeOf(UID_B))
  assert.equal(pendingCount(scopeOf(UID_A)), 2)
  assert.equal(pendingCount(scopeOf(UID_B)), 1)
  assert.equal(pendingCount('guest'), 0)
  assert.ok(localStorage.has(keysFor(scopeOf(UID_A)).drafts))
  assert.ok(localStorage.has(keysFor(scopeOf(UID_B)).drafts))
})

test('pendingCount：只算当前 scope 的队列', () => {
  reset()
  enqueue('learn', { ownerId: UID_A, rows: [] }, scopeOf(UID_A))
  enqueue('stationWords', { ownerId: UID_A, stationId: 's', items: [] }, scopeOf(UID_A))
  enqueue('stations', { row: { id: 's', ownerId: UID_A } }, scopeOf(UID_A))
  assert.equal(pendingCount(scopeOf(UID_A)), 3)
  const byKind = pendingByKind(scopeOf(UID_A))
  assert.deepEqual(byKind, { generate: 0, stationWords: 1, learn: 1, stations: 1 })
})

test('readDrafts：能读回各 kind 的原始草稿', () => {
  reset()
  enqueue('generate', { ownerId: UID_A, stationId: 'st-1', forms: ['quixotic'] }, scopeOf(UID_A))
  const d = readDrafts(scopeOf(UID_A))
  assert.equal(d.generate.length, 1)
  assert.equal(d.generate[0].forms[0], 'quixotic')
  assert.ok(d.generate[0].queuedAt, '入队要记 queuedAt')
})

// ---------------------------------------------------------------- 丢弃日志

test('moveToDiscarded：写进环形日志，含 reason / 哈希 / 摘要，且不含 uid 原文', () => {
  reset()
  const item = { ownerId: UID_A, rows: [{}, {}, {}], queuedAt: '2026-01-01T00:00:00.000Z' }
  const entry = moveToDiscarded('learn', item, 'owner-mismatch')
  assert.equal(entry.reason, 'owner-mismatch')
  assert.equal(entry.ownerIdHash, hashUid(UID_A))
  assert.equal(entry.summary, '学习记录 3 条')
  assert.equal(entry.queuedAt, '2026-01-01T00:00:00.000Z')

  const log = readDiscarded()
  assert.equal(log.entries.length, 1)
  const raw = JSON.stringify(log)
  assert.ok(!raw.includes(UID_A), '日志里绝不能出现完整 uid')
  assert.ok(!raw.includes(UID_A.slice(0, 8)), '也不能出现半个 uid')
})

test('moveToDiscarded：环形上限 50 条', () => {
  reset()
  for (let i = 0; i < DISCARDED_LIMIT + 20; i += 1) {
    moveToDiscarded('learn', { ownerId: UID_A, rows: [] }, 'owner-mismatch')
  }
  assert.equal(readDiscarded().entries.length, DISCARDED_LIMIT)
})

test('discarded：跨账号共用一条日志（不分区，换号仍能排查）', () => {
  reset()
  moveToDiscarded('learn', { ownerId: UID_A, rows: [] }, 'owner-mismatch')
  moveToDiscarded('learn', { ownerId: UID_B, rows: [] }, 'owner-mismatch')
  const log = readDiscarded()
  assert.equal(log.entries.length, 2)
  assert.notEqual(log.entries[0].ownerIdHash, log.entries[1].ownerIdHash, '不同账号哈希不同')
})

test('readDiscarded：无记录 / 脏数据时返回空壳，不崩', () => {
  reset()
  assert.deepEqual(readDiscarded(), { at: null, entries: [] })
  localStorage.setItem(keysFor('guest').draftsDiscarded, '{坏 JSON')
  assert.deepEqual(readDiscarded(), { at: null, entries: [] })
  localStorage.setItem(keysFor('guest').draftsDiscarded, '"字符串"')
  assert.deepEqual(readDiscarded(), { at: null, entries: [] })
})

// ---------------------------------------------------------------- drain 三态

await atest('drain：游客（uid 为空）整轮跳过，队列一动不动', async () => {
  reset()
  enqueue('learn', { ownerId: UID_A, rows: [] }, scopeOf(UID_A))
  const res = await drain({ scope: scopeOf(UID_A), uid: null })
  assert.equal(res.skippedNoAuth, true)
  assert.equal(res.pushed, 0)
  assert.equal(res.parked, 0)
  assert.equal(pendingCount(scopeOf(UID_A)), 1, '游客 drain 不得动队列')
})

await atest('drain：A 的 5 条草稿在 B 会话下 → 全部 park 保留，pending 归零、stuck=5', async () => {
  reset()
  const sb = scopeOf(UID_B)
  for (let i = 0; i < 5; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.a${i}`, record: { status: 'review' } }] }, sb)
  }
  const res = await drain({ scope: sb, uid: UID_B, force: true })
  assert.equal(res.parked, 5, 'A 的 5 条草稿应被 park（保留不删）')
  assert.equal(res.pushed, 0, '一条都不该推送')
  assert.equal(res.failed, 0)
  // ★ A-14 核心：pending 归零（徽标能回绿），stuck 单独计数
  assert.equal(pendingCount(sb), 0, 'parked 的不计入 pending —— 否则徽标永远减不掉')
  assert.equal(stuckCount(sb), 5, 'stuck 单独统计这 5 条')

  const log = readDiscarded()
  assert.equal(log.entries.length, 5)
  log.entries.forEach((e) => {
    assert.equal(e.reason, 'owner-mismatch')
    assert.equal(e.kind, 'learn')
    assert.equal(e.parked, true, '日志要标出「只记录、条目仍保留」')
    assert.ok(!JSON.stringify(log).includes(UID_A), '日志不含 uid 原文')
  })
})

await atest('★ A-14：清掉「传不上去」的草稿后，对应学习记录必须仍在 learn 分区', async () => {
  reset()
  const sc = scopeOf(UID_A)
  // 造一条永久失败草稿（RLS 42501）
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.quiz', record: { status: 'review' } }] }, sc)
  // 同时造一条对应的学习记录（模拟「离线答题已落本地，只是没传上去」）
  writeLearn({ 'w.quiz': { status: 'review', statusSource: 'learning' } }, sc)

  const res = await drain({
    scope: sc,
    uid: UID_A,
    force: true,
    push: async () => ({ ok: false, error: { code: '42501', message: 'new row violates row-level security policy' } }),
  })
  assert.equal(res.parked, 1)
  assert.equal(pendingCount(sc), 0)
  assert.equal(stuckCount(sc), 1)
  // 清除前：学习记录在
  assert.ok(readLearn(sc)['w.quiz'], '前置条件：学习记录已落 learn 分区')

  // ★ 一键清除
  const cleared = clearStuck(sc)
  assert.equal(cleared, 1)
  assert.equal(stuckCount(sc), 0, '清除后 stuck 归零')
  assert.equal(pendingCount(sc), 0)
  // ★ 关键断言：学习记录分毫未动
  assert.ok(readLearn(sc)['w.quiz'], '★ 清草稿绝不能删掉学习记录')
  assert.equal(readLearn(sc)['w.quiz'].status, 'review')
  assert.equal(readLearn(sc)['w.quiz'].statusSource, 'learning')
})

await atest('clearStuck：只删 parked 的，可重试的草稿必须留下', async () => {
  reset()
  const sc = scopeOf(UID_A)
  // 3 条永久失败 → park
  for (let i = 0; i < 3; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.p${i}`, record: { status: 'review' } }] }, sc)
  }
  // 2 条可重试 → 留在 pending
  for (let i = 0; i < 2; i += 1) {
    enqueue('stationWords', { ownerId: UID_A, stationId: 'st-1', items: [{ wordKey: `w.r${i}` }] }, sc)
  }
  await drain({
    scope: sc,
    uid: UID_A,
    force: true,
    push: async (kind) =>
      kind === 'learn'
        ? { ok: false, error: { code: '42501', message: 'row-level security' } }
        : { ok: false, error: { code: '', message: 'TypeError: fetch failed' } },
  })
  assert.equal(stuckCount(sc), 3)
  assert.equal(pendingCount(sc), 2)

  const cleared = clearStuck(sc)
  assert.equal(cleared, 3, '只清 3 条 parked')
  assert.equal(stuckCount(sc), 0)
  assert.equal(pendingCount(sc), 2, '★ 可重试的 2 条必须完好保留 —— 它们还能传')
})

await atest('A 回来后认领通过 → 自动解除 park 并补传（不否则 A 的离线进度永远传不上去）', async () => {
  reset()
  const sc = scopeOf(UID_A)
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.back', record: { status: 'review' } }] }, sc)

  // 先以 B 的身份 drain → park
  await drain({ scope: sc, uid: UID_B, force: true })
  assert.equal(stuckCount(sc), 1, 'B 会话下被 park')
  assert.equal(pendingCount(sc), 0)

  // A 回来 → 认领通过 → 解除 park 并推上去
  const res = await drain({
    scope: sc,
    uid: UID_A,
    force: true,
    push: async () => ({ ok: true, error: null }),
  })
  assert.equal(res.pushed, 1, 'A 的草稿必须能补传')
  assert.equal(stuckCount(sc), 0)
  assert.equal(pendingCount(sc), 0)
})

await atest('A 的草稿在队首也不阻塞 B 自己的草稿（认领 park 不 break）', async () => {
  reset()
  const sb = scopeOf(UID_B)
  // 队首：A 的 3 条（park）
  for (let i = 0; i < 3; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.a${i}`, record: { status: 'review' } }] }, sb)
  }
  // 队中：A 的一条 generate（更危险：服务端从 JWT 推导 owner）
  enqueue('generate', { ownerId: UID_A, stationId: 'st-1', forms: ['quixotic'] }, sb)
  // 队尾：B 自己的 1 条（应真的推送）
  enqueue('stations', { row: { id: 'st-9', ownerId: UID_B, name: '雅思' } }, sb)

  const res = await drain({
    scope: sb,
    uid: UID_B,
    force: true,
    push: async () => ({ ok: true, error: null }),
  })
  assert.equal(res.parked, 4, '4 条 A 的跨账号草稿被 park')
  assert.equal(res.pushed, 1, 'B 自己的那条照常推送 —— A 的草稿没有卡住队首')
  assert.equal(res.failed, 0)
  assert.equal(pendingCount(sb), 0)
  assert.equal(stuckCount(sb), 4)
  assert.equal(readDiscarded().entries.filter((e) => e.kind === 'generate').length, 1, 'generate 草稿也被认领拦下')
})

await atest('drain：只处理当前 scope 的队列，不动别的账号的草稿', async () => {
  reset()
  enqueue('learn', { ownerId: UID_A, rows: [] }, scopeOf(UID_A))
  await drain({ scope: scopeOf(UID_B), uid: UID_B, force: true })
  assert.equal(pendingCount(scopeOf(UID_A)), 1, 'A 的队列不受 B 的 drain 影响')
  assert.equal(pendingCount(scopeOf(UID_B)), 0)
})

await atest('drain：队列本身为空时是安全的空跑', async () => {
  reset()
  const res = await drain({ scope: scopeOf(UID_A), uid: UID_A, force: true })
  assert.deepEqual(
    { ok: res.ok, pushed: res.pushed, failed: res.failed, discarded: res.discarded, parked: res.parked },
    { ok: true, pushed: 0, failed: 0, discarded: 0, parked: 0 },
  )
})

// ---------------------------------------------------------------- 关键回归：可重试失败不 break

await atest('drain：上行失败（可重试）→ 原样保留且仍算 pending，继续处理后续条目，不 break', async () => {
  reset()
  const sb = scopeOf(UID_A)
  for (let i = 0; i < 3; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.x${i}`, record: { status: 'review' } }] }, sb)
  }
  let attempted = 0
  const res = await drain({
    scope: sb,
    uid: UID_A,
    force: true,
    push: async () => {
      attempted += 1
      return { ok: false, error: { code: '', message: 'TypeError: fetch failed' } }
    },
  })
  assert.equal(attempted, 3, '三条都必须被尝试（旧实现会在第一条失败后 break）')
  assert.equal(res.failed, 3, `failed 应为 3，实际 ${res.failed}`)
  assert.equal(res.parked, 0)
  assert.equal(pendingCount(sb), 3, '可重试失败的草稿必须保留且仍算待传')
  assert.equal(stuckCount(sb), 0, '可重试 ≠ 传不上去')
})

await atest('drain：永久失败（RLS 42501）→ park 保留 + 记 push-rejected，不阻塞后续', async () => {
  reset()
  const sb = scopeOf(UID_A)
  for (let i = 0; i < 2; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.y${i}`, record: { status: 'review' } }] }, sb)
  }
  // 第三条是可重试的：验证永久失败被 park 后仍会继续往后处理
  enqueue('stations', { row: { id: 'st-9', ownerId: UID_A, name: '雅思' } }, sb)

  const res = await drain({
    scope: sb,
    uid: UID_A,
    force: true,
    push: async (kind) =>
      kind === 'learn'
        ? { ok: false, error: { code: '42501', message: 'new row violates row-level security policy' } }
        : { ok: true, error: null },
  })
  assert.equal(res.parked, 2, '两条 42501 应被 park')
  assert.equal(res.pushed, 1, '永久失败不阻塞后续条目')
  assert.equal(res.failed, 0)
  assert.equal(pendingCount(sb), 0, 'parked 不计入 pending')
  assert.equal(stuckCount(sb), 2)
  const log = readDiscarded()
  assert.equal(log.entries.length, 2)
  log.entries.forEach((e) => {
    assert.equal(e.reason, 'push-rejected')
    assert.equal(e.parked, true)
  })
})

await atest('drain：push-rejected 的条目只在 force 时重试（定时 drain 不烧请求）', async () => {
  reset()
  const sc = scopeOf(UID_A)
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.rej', record: { status: 'review' } }] }, sc)
  const alwaysReject = async () => ({ ok: false, error: { code: '42501', message: 'row-level security' } })
  await drain({ scope: sc, uid: UID_A, force: true, push: alwaysReject })
  assert.equal(stuckCount(sc), 1)

  // 非 force 的第二轮：不应再尝试推送
  let attempts = 0
  await drain({
    scope: sc,
    uid: UID_A,
    force: false,
    push: async () => {
      attempts += 1
      return { ok: true, error: null }
    },
  })
  assert.equal(attempts, 0, '非 force 不该重推已知推不上去的条目')
  assert.equal(stuckCount(sc), 1, '仍保留，等用户手动清除')

  // force：允许重试并成功
  const res = await drain({ scope: sc, uid: UID_A, force: true, push: async () => ({ ok: true, error: null }) })
  assert.equal(res.pushed, 1, 'force 时可重试并成功')
  assert.equal(stuckCount(sc), 0)
})

await atest('drain：认领 park 后仍会处理同 kind 的后续条目（不 break）', async () => {
  reset()
  const sb = scopeOf(UID_B)
  // 队首 3 条 A 的（park），第 4 条 B 自己的（应真的推送）
  for (let i = 0; i < 3; i += 1) {
    enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: `w.a${i}`, record: { status: 'review' } }] }, sb)
  }
  enqueue('learn', { ownerId: UID_B, rows: [{ wordKey: 'w.b0', record: { status: 'review' } }] }, sb)

  const pushedKeys = []
  const res = await drain({
    scope: sb,
    uid: UID_B,
    force: true,
    push: async (kind, item) => {
      pushedKeys.push(...item.rows.map((r) => r.wordKey))
      return { ok: true, error: null }
    },
  })
  assert.equal(res.parked, 3, 'A 的 3 条被 park')
  assert.equal(res.pushed, 1)
  assert.deepEqual(pushedKeys, ['w.b0'], '★ 只有 B 自己的那条被推送 —— A 的 word_key 绝不进 B 的上行')
})

await atest('drain：结构损坏 → 真丢弃（推上去必然失败，留着只会反复报错）', async () => {
  reset()
  const sc = scopeOf(UID_A)
  enqueue('learn', { ownerId: UID_A, rows: '不是数组' }, sc)
  const res = await drain({ scope: sc, uid: UID_A, force: true, push: async () => ({ ok: true, error: null }) })
  assert.equal(res.discarded, 1)
  assert.equal(res.parked, 0)
  assert.equal(pendingCount(sc), 0)
  assert.equal(stuckCount(sc), 0)
})

await atest('drain：push 抛异常也算可重试失败，草稿保留且仍算 pending', async () => {
  reset()
  const sc = scopeOf(UID_A)
  enqueue('learn', { ownerId: UID_A, rows: [{ wordKey: 'w.z', record: { status: 'review' } }] }, sc)
  const res = await drain({
    scope: sc,
    uid: UID_A,
    force: true,
    push: async () => {
      throw new Error('网络异常')
    },
  })
  assert.equal(res.failed, 1)
  assert.equal(res.parked, 0)
  assert.equal(pendingCount(sc), 1, '抛异常也必须保留草稿')
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

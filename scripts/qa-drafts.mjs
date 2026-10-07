/**
 * QA 独立验证：草稿认领 / park / drain 四分语义
 * ------------------------------------------------------------------
 * QA 自写。核心要证明的是 GAP-5 的**原始根因**（drain 遇失败即 break → 队首毒草
 * 永久堵死整条队列）真的被修掉了，而且 park ≠ 丢弃。
 *
 * 覆盖：
 *   D1  跨 scope 草稿 → parked（保留），**不丢弃**，且未用当前 token 推送
 *   D2  park 之后仍在队列里（readDrafts 可见），pendingCount 不含它，stuckCount 含它
 *   D3  drain 遇可重试失败 → 保留该条并**继续下一条**（不 break）；
 *       后面那条好的草稿必须真的上传成功
 *   D4  clearStuck 清掉 parked 草稿，且**可证明没有碰学习记录**
 *       （该词在 learn 分区的记录 status / statusSource 逐字段不变）
 *   D5  isPermanentError：未识别形状一律 false（可重试）→ 失败方向偏向保留
 *   D6  账号 A 回来时，它自己被 park 的草稿能解除 park 并补传（不永久孤立）
 *
 * 运行：node scripts/qa-drafts.mjs
 */
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.localStorage = dom.window.localStorage

const offline = await import('../src/lib/cloud/offline.js')
const migrate = await import('../src/lib/migrate.js')
const learning = await import('../src/lib/learning.js')

const { enqueue, drain, claim, isPermanentError, pendingCount, stuckCount, readDrafts, clearStuck, DRAIN_ORDER } = offline
const { scopeOf, writeLearn, readLearn } = migrate

let pass = 0
const failures = []
async function ok(name, fn) {
  try {
    await fn()
    pass += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failures.push({ name, message: e.message })
    console.log(`  ✗ ${name}\n      ${e.message}`)
  }
}

const A = 'uid-alice-aaaa'
const B = 'uid-bob-bbbbbbbb'
const sA = scopeOf(A)
const sB = scopeOf(B)

function reset() {
  localStorage.clear()
}

// ================================================================ D1 跨 scope → park
console.log('\n[qa-drafts] D1-D2  跨 scope 草稿 → parked（保留，非丢弃），不推送')

reset()
// A 离线产生 1 条 learn 草稿，躺在 A 的分区队列里
enqueue('learn', { ownerId: A, rows: [{ wordKey: 'w.1', record: { status: 'known' } }] }, sA)
ok('入队后 A 的 pendingCount = 1', () => {
  assert.equal(pendingCount(sA), 1)
  assert.equal(stuckCount(sA), 0)
})

// B 登录后 drain A 的队列？—— 注意：正常路径下 B 只会 drain **自己**的 scope。
// 但 GAP-5 的原始事故是「旧实现只有一条全局队列」，所以这里同时测两种：
//  (a) B drain 自己的空队列 → 什么也不该发生
//  (b) 强行让 B drain A 的分区（模拟全局队列 / 旧键残留）→ A 的草稿必须被 park 而非删掉
let pushedKinds = []
await ok('(a) B drain 自己的空队列：不推、不删、不 park', async () => {
  const res = await drain({ scope: sB, uid: B, force: true, push: async (k) => { pushedKinds.push(k); return { ok: true } } })
  assert.equal(res.pushed, 0)
  assert.equal(res.parked, 0)
  assert.equal(res.discarded, 0)
  assert.deepEqual(pushedKinds, [], 'B 不该推任何东西')
  assert.equal(pendingCount(sA), 1, 'A 的草稿不该被 B 动过')
})

let bPushCalls = []
await ok('(b) B 强行 drain A 的分区：A 的草稿被 park、保留、且未被推送', async () => {
  const res = await drain({
    scope: sA,
    uid: B,
    force: true,
    push: async (kind, item) => { bPushCalls.push({ kind, ownerId: item.ownerId }); return { ok: true } },
  })
  assert.equal(res.pushed, 0, '一条都不该推成功')
  assert.equal(res.parked, 1, 'A 的草稿应被 park')
  assert.equal(res.discarded, 0, '绝不能丢弃（A 的登录态可能马上回来）')
  assert.deepEqual(bPushCalls, [], '不该调用 push —— park 发生在推送之前')
})

ok('D2a 草稿仍在队列里（readDrafts 可见，未被删）', () => {
  const q = readDrafts(sA)
  const items = DRAIN_ORDER.flatMap((k) => q[k] || [])
  assert.equal(items.length, 1, '条目必须还在')
  assert.equal(items[0].ownerId, A)
})

ok('D2b parked 标记已打上，且带 parkedReason=owner-mismatch', () => {
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sA)[k] || [])
  assert.equal(items[0].parked, true)
  assert.equal(items[0].parkedReason, 'owner-mismatch')
})

ok('D2c pendingCount 排除 parked，stuckCount 计入它', () => {
  assert.equal(pendingCount(sA), 0, 'parked 不计入 pending，否则徽标是减不掉的数字')
  assert.equal(stuckCount(sA), 1, 'stuckCount 必须计入')
})

ok('D2d 丢弃日志记了 parked=true（可区分「记日志」与「已删除」）', () => {
  const d = offline.readDiscarded()
  assert.ok(d.entries.length >= 1)
  const last = d.entries[d.entries.length - 1]
  assert.equal(last.parked, true, '日志必须标明只是 park，不是删除')
  assert.equal(last.reason, 'owner-mismatch')
})

// ================================================================ D3 drain 不 break
console.log('\n[qa-drafts] D3  drain 遇可重试失败 → 保留 + 继续下一条（不 break）')
reset()

// 队列里 3 条：第 1 条可重试失败，第 2 条成功，第 3 条成功
// 全部同属 B（认领通过），排除 park 语义干扰
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'bad', record: { status: 'known' } }] }, sB)
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'good1', record: { status: 'known' } }] }, sB)
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'good2', record: { status: 'known' } }] }, sB)
ok('入队 3 条，pendingCount = 3', () => {
  assert.equal(pendingCount(sB), 3)
})

const attemptLog = []
const res3 = await drain({
  scope: sB,
  uid: B,
  force: true,
  push: async (kind, item) => {
    const key = item.rows[0].wordKey
    attemptLog.push(key)
    if (key === 'bad') {
      // 真实网络失败的形状：TypeError: fetch failed → code 为空串
      return { ok: false, error: { code: '', message: 'TypeError: fetch failed' } }
    }
    return { ok: true, error: null }
  },
})

ok('D3a 队列里 3 条全都被尝试过（若 break 只会尝试 1 条）', () => {
  assert.deepEqual(attemptLog, ['bad', 'good1', 'good2'], 'break 会让 attemptLog 长度停在 1')
})

ok('D3b pushed=2 / failed=1：毒草没堵住后面的', () => {
  assert.equal(res3.pushed, 2)
  assert.equal(res3.failed, 1)
  assert.equal(res3.ok, false, 'ok 应反映「有失败」，但 ok=false 不代表整轮失败')
})

ok('D3c 失败那条被原样保留（未 park、未删除）', () => {
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sB)[k] || [])
  assert.equal(items.length, 1, '只剩失败那条')
  assert.equal(items[0].rows[0].wordKey, 'bad')
  assert.equal(items[0].parked, undefined, '可重试失败不该 park（park 是给永久失败的）')
  assert.equal(pendingCount(sB), 1, '它仍是待办')
})

ok('D3d 成功的两条已从队列移除', () => {
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sB)[k] || [])
  assert.ok(!items.some((i) => i.rows[0].wordKey === 'good1'))
  assert.ok(!items.some((i) => i.rows[0].wordKey === 'good2'))
})

ok('D3e 再 drain 一次（网络恢复）→ 补传成功，队列清空', async () => {
  const res = await drain({ scope: sB, uid: B, force: true, push: async () => ({ ok: true, error: null }) })
  assert.equal(res.pushed, 1)
  assert.equal(pendingCount(sB), 0)
})

// ================================================================ D4 永久失败 → park
console.log('\n[qa-drafts] D4  永久失败（白名单内）→ park 保留，不阻塞后续')
reset()
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'rejected', record: { status: 'known' } }] }, sB)
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'ok', record: { status: 'known' } }] }, sB)
const res4 = await drain({
  scope: sB,
  uid: B,
  force: true,
  push: async (kind, item) => {
    const key = item.rows[0].wordKey
    if (key === 'rejected') return { ok: false, error: { code: '42501', message: 'new row violates row-level security policy' } }
    return { ok: true, error: null }
  },
})
ok('D4a 永久失败被 park，后续条目仍上传成功', () => {
  assert.equal(res4.parked, 1)
  assert.equal(res4.pushed, 1)
  assert.equal(res4.discarded, 0, 'A-14：白名单内的永久失败也不丢弃，只 park')
})
ok('D4b parked 条目仍在队列、pendingCount 不含、stuckCount 含', () => {
  assert.equal(pendingCount(sB), 0)
  assert.equal(stuckCount(sB), 1)
})

// ================================================================ D5 clearStuck 不碰学习记录
console.log('\n[qa-drafts] D5  clearStuck 只删草稿，可证明没碰学习记录')

// 造该词的真实学习记录（status=known / statusSource='learning'，含全部字段）
const now = '2026-09-01T12:00:00.000Z'
const targetWord = 'w.target'
const targetRecord = {
  ...learning.emptyRecord(),
  status: 'known',
  statusSource: 'learning',
  correctCount: 7,
  consecutiveCorrect: 4,
  incorrectCount: 2,
  lastStudiedAt: now,
  lastIncorrectAt: '2026-08-20T00:00:00.000Z',
  lastResult: 'correct',
  nextDueAt: '2026-09-02T12:00:00.000Z',
  statusChangedAt: now,
  updatedAt: now,
}
const otherRecord = {
  ...learning.emptyRecord(),
  status: 'review',
  statusSource: 'learning',
  incorrectCount: 3,
  statusChangedAt: now,
  updatedAt: now,
}
writeLearn({ [targetWord]: targetRecord, 'w.other': otherRecord }, sB)

// 快照 learn 分区原始字节
const learnKeyB = migrate.keysFor(sB).learn
const snapshotBefore = localStorage.getItem(learnKeyB)

const cleared = clearStuck(sB)
ok('D5a clearStuck 返回清除条数 = 1', () => {
  assert.equal(cleared, 1)
})
ok('D5b stuckCount 归零、pendingCount 仍为 0', () => {
  assert.equal(stuckCount(sB), 0)
  assert.equal(pendingCount(sB), 0)
})
ok('D5c learn 分区**字节级完全未变**（最强证明：整份载荷没被碰过）', () => {
  assert.equal(localStorage.getItem(learnKeyB), snapshotBefore, 'learn 分区字节被改动了')
})
ok('D5d 目标词的记录仍在，status / statusSource 逐字段不变', () => {
  const recs = readLearn(sB)
  assert.ok(recs[targetWord], '记录不存在了！')
  assert.equal(recs[targetWord].status, 'known')
  assert.equal(recs[targetWord].statusSource, 'learning')
  assert.equal(recs[targetWord].correctCount, 7)
  assert.equal(recs[targetWord].consecutiveCorrect, 4)
  assert.equal(recs[targetWord].incorrectCount, 2)
  assert.equal(recs[targetWord].nextDueAt, '2026-09-02T12:00:00.000Z')
  assert.equal(recs[targetWord].lastResult, 'correct')
  assert.deepEqual(recs[targetWord], targetRecord, '整条记录必须逐字段一致')
})
ok('D5e 另一条记录同样未受影响', () => {
  assert.deepEqual(readLearn(sB)['w.other'], otherRecord)
})
ok('D5f 草稿队列确实被清空（证明 D5c 不是因为 clearStuck 什么都没做）', () => {
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sB)[k] || [])
  assert.equal(items.length, 0)
})

// ================================================================ D6 isPermanentError 失败方向
console.log('\n[qa-drafts] D6  isPermanentError：未识别形状 → false（可重试，失败方向偏保留）')

const permanentCases = [
  [{ code: '42501', message: 'new row violates row-level security policy' }, 'RLS with check 拒绝'],
  [{ code: 'PGRST301', message: 'Expected 3 parts in JWT; got 1' }, 'JWT 结构错误'],
  [{ code: 'PGRST205', message: 'Could not find the table public.learn_records' }, '表不存在'],
  [{ code: '', message: 'Invalid API key' }, 'API key 无效（无 code，靠 message 命中）'],
  [{ code: '403', message: 'forbidden' }, '显式 403'],
  [{ code: '404', message: 'not found' }, '显式 404'],
]
for (const [err, label] of permanentCases) {
  // eslint-disable-next-line no-await-in-loop
  await ok(`永久=true  ${label}  (${JSON.stringify(err)})`, () => {
    assert.equal(isPermanentError(err), true)
  })
}

const retryableCases = [
  [{ code: '', message: 'TypeError: fetch failed' }, '网络不可达'],
  [{ code: '', message: 'Failed to fetch' }, 'fetch 失败'],
  [{ code: '500', message: 'Internal Server Error' }, '5xx'],
  [{ code: '429', message: 'Rate limited' }, '限流'],
  [{}, '空对象'],
  [{ message: 'who knows, a brand new error shape' }, '完全未识别的形状'],
  [{ code: 'SOME_NEW_CODE', message: 'something novel' }, '未识别的 code'],
  [null, 'null'],
  [undefined, 'undefined'],
  ['a string, not an object', '字符串（非对象）'],
  [new Error('boom'), 'Error 实例（无 code）'],
]
for (const [err, label] of retryableCases) {
  // eslint-disable-next-line no-await-in-loop
  await ok(`永久=false ${label}`, () => {
    assert.equal(isPermanentError(err), false, `未识别形状必须判可重试（偏保留），实际判为永久：${JSON.stringify(err)}`)
  })
}

ok('D6x 未知形状的条目在 drain 里被保留且不 park（真·失败方向偏保留）', async () => {
  reset()
  enqueue('learn', { ownerId: B, rows: [{ wordKey: 'weird', record: { status: 'known' } }] }, sB)
  const res = await drain({
    scope: sB,
    uid: B,
    force: true,
    push: async () => ({ ok: false, error: { code: 'TOTALLY_NEW', message: '从未见过的错误形状' } }),
  })
  assert.equal(res.failed, 1)
  assert.equal(res.parked, 0, '未识别错误不该 park（park 会把它从待办里摘掉）')
  assert.equal(res.discarded, 0)
  assert.equal(pendingCount(sB), 1, '必须仍是待办，用户还能重试')
})

// ================================================================ D7 claim 纯函数
console.log('\n[qa-drafts] D7  claim 判定')
await ok('D7a owner 相同 + 结构合法 → ok', () => {
  assert.deepEqual(claim('learn', { ownerId: A, rows: [] }, A), { ok: true })
})
await ok('D7b owner 不同 → discard 判定（drain 里转 park）', () => {
  const v = claim('learn', { ownerId: A, rows: [] }, B)
  assert.equal(v.ok, false)
  assert.equal(v.verdict, 'discard')
  assert.equal(v.reason, 'owner-mismatch')
})
await ok('D7c 缺 rows → skip（真丢弃，推上去必然失败）', () => {
  const v = claim('learn', { ownerId: A }, A)
  assert.equal(v.ok, false)
  assert.equal(v.verdict, 'skip')
  assert.equal(v.reason, 'malformed')
})
await ok('D7d generate 草稿缺 forms → skip', () => {
  const v = claim('generate', { ownerId: A, stationId: 's1' }, A)
  assert.equal(v.verdict, 'skip')
})
await ok('D7e stations 草稿的 ownerId 取 row.ownerId', () => {
  assert.deepEqual(claim('stations', { row: { id: 's1', ownerId: A } }, A), { ok: true })
  const v = claim('stations', { row: { id: 's1', ownerId: A } }, B)
  assert.equal(v.verdict, 'discard')
})
await ok('D7f 无 uid → skip（游客不推任何东西）', () => {
  assert.deepEqual(claim('learn', { ownerId: A, rows: [] }, null), { ok: false, verdict: 'skip', reason: 'no-auth' })
})
await ok('D7g 结构损坏的条目真被丢弃（与 park 区分开）', async () => {
  reset()
  enqueue('learn', { ownerId: B }, sB) // 缺 rows
  const res = await drain({ scope: sB, uid: B, force: true, push: async () => ({ ok: true }) })
  assert.equal(res.discarded, 1)
  assert.equal(res.parked, 0)
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sB)[k] || [])
  assert.equal(items.length, 0, '结构损坏的真删了')
})

// ================================================================ D8 账号回来解除 park
console.log('\n[qa-drafts] D8  账号 A 回来 → 解除 park 并补传（草稿不永久孤立）')
reset()
// A 的草稿先被 B park
enqueue('learn', { ownerId: A, rows: [{ wordKey: 'w.a1', record: { status: 'known' } }] }, sA)
await drain({ scope: sA, uid: B, force: true, push: async () => ({ ok: true }) })
ok('被 B park 后 stuckCount(A)=1 / pendingCount(A)=0', () => {
  assert.equal(stuckCount(sA), 1)
  assert.equal(pendingCount(sA), 0)
})
// A 回来登录
const res8 = await drain({ scope: sA, uid: A, force: true, push: async () => ({ ok: true, error: null }) })
ok('A 回归后草稿被解除 park 并成功补传', () => {
  assert.equal(res8.pushed, 1)
  assert.equal(pendingCount(sA), 0)
  assert.equal(stuckCount(sA), 0)
  const items = DRAIN_ORDER.flatMap((k) => readDrafts(sA)[k] || [])
  assert.equal(items.length, 0)
})

// push-rejected park 的条目：非 force 时不重复请求
console.log('\n[qa-drafts] D9  push-rejected park：定时 drain 不重复浪费请求')
reset()
enqueue('learn', { ownerId: B, rows: [{ wordKey: 'r', record: { status: 'known' } }] }, sB)
await drain({
  scope: sB,
  uid: B,
  force: true,
  push: async () => ({ ok: false, error: { code: '42501', message: 'row-level security' } }),
})
ok('D9a 已 park', () => {
  assert.equal(stuckCount(sB), 1)
})
let calls = 0
await drain({ scope: sB, uid: B, force: false, push: async () => { calls += 1; return { ok: true } } })
ok('D9b 非 force 的定时 drain 不再请求这条（0 次调用）', () => {
  assert.equal(calls, 0)
})
await drain({ scope: sB, uid: B, force: true, push: async () => { calls += 1; return { ok: true } } })
ok('D9c force（手动重试）会重试并成功解除 park', () => {
  assert.equal(calls, 1)
  assert.equal(stuckCount(sB), 0)
  assert.equal(pendingCount(sB), 0)
})

// ================================================================ 汇总
console.log(`\n[qa-drafts] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  console.error('[qa-drafts] ✗ 失败：')
  failures.forEach((f) => console.error(`  - ${f.name}: ${f.message}`))
  dom.window.close()
  process.exit(1)
}
console.log('[qa-drafts] ✓ 全部通过')
// jsdom 的 window 会持有事件循环句柄，必须显式关闭，否则 node 不退出
dom.window.close()
process.exit(0)

/**
 * 草稿队列四分语义（QA 独立编写）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-drafts.mjs
 *
 * 测的是src/lib/cloud/offline.js 的 claim / park / drain / clearStuck /
 * isPermanentError。与 scripts/test-drafts.mjs 的区别：本文件刻意从「事故形态」
 * 出发构造用例（A 的草稿在 B 会话下 drain），并对每条断言都追问一句
 * 「这条断言在实现写错时会不会仍然通过」。
 *
 * 覆盖：
 *   D-1  跨 scope 草稿 → parked（**保留**），不丢、不用当前 token 推、事后仍在队列
 *   D-2  drain 遇可重试失败 → **保留 + 继续下一条**（GAP-5 根因：原来 break）
 *   D-3  clearStuck 只删草稿，**可证明**没碰learn 分区的学习记录
 *   D-4  isPermanentError 对未识别形状返回 false（fail-safe 向保留）
 *   D-5  pendingCount 不含 parked / stuckCount 含 parked / 两者相加= 队列总数
 */

import assert from 'node:assert/strict'

/** 极简 localStorage mock（够 offline.js 用） */
function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}

globalThis.localStorage = fakeStorage()

const { keysFor, readLearn, writeLearn } = await import('../src/lib/migrate.js')
const {
  claim,
  clearStuck,
  drain,
  enqueue,
  isPermanentError,
  pendingByKind,
  pendingCount,
  readDiscarded,
  readDrafts,
  stuckCount,
  DRAIN_ORDER,
} = await import('../src/lib/cloud/offline.js')

let pass = 0
let fail = 0
const failures = []
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

const UID_A = 'uid-aaaa-1111'
const UID_B = 'uid-bbbb-2222'

const reset = () => localStorage.clear()

/** 造一条 learn 草稿（结构合法） */
function learnDraft(ownerId, rows) {
  return { ownerId, rows, queuedAt: new Date().toISOString() }
}
/** 造一条 generate 草稿（GAP-13 的主角：owner 由服务端从 JWT 推导） */
function generateDraft(ownerId, forms) {
  return { ownerId, forms, queuedAt: new Date().toISOString() }
}

/** 队列里某一kind 的全部条目（原始对象，含 parked 标记） */
function queueOf(scope, kind) {
  return readDrafts(scope)[kind] || []
}

console.log('[qa2:drafts] 草稿四分语义（认领 / park / 丢弃 / 真失败）\n')

// ================================================================ D-1
section('D-1  跨 scope 草稿 → parked 保留，不用当前 token 推，事后仍在队列')

reset()
// A 离线产生 2 条草稿（learn + generate）
enqueue('learn', learnDraft(UID_A, [{ wordKey: 'w.x1', record: { status: 'review' } }]), UID_A)
enqueue('generate', generateDraft(UID_A, ['abandoned']), UID_A)
ok(pendingCount(UID_A) === 2, `A 分区有 2 条待传（实际 ${pendingCount(UID_A)}）`)

// A 自己的草稿在 A 会话下当然该推得上去（对照：证明不是「所有草稿都推不掉」）
{
  const pushed = []
  const res = await drain({ scope: UID_A, uid: UID_A, force: true, push: async (kind, item) => {
    pushed.push({ kind, ownerId: item.ownerId })
    return { ok: true, error: null }
  } })
  ok(pushed.length === 2, `★ 对照：A 自己的 2 条草稿在 A 会话下都推成功了（实际 ${pushed.length}）`)
  ok(res.pushed === 2, `drain 报 pushed=2（实际 ${res.pushed}）`)
  ok(pendingCount(UID_A) === 0, `A 的队列已清空（实际 ${pendingCount(UID_A)}）`)
}

// 重新造：A 离线产生草稿 → 切到 B
reset()
enqueue('learn', learnDraft(UID_A, [{ wordKey: 'w.x1', record: { status: 'review' } }]), UID_A)
enqueue('generate', generateDraft(UID_A, ['abandoned']), UID_A)

// B 登录后 drain（B 的分区是空的 —— 队列也是分区的，B 读不到 A 的队列）
const bRes = await drain({ scope: UID_B, uid: UID_B, force: true, push: async () => ({ ok: true, error: null }) })
ok(bRes.pushed === 0, `B 的分区里没有草稿可推（实际 ${bRes.pushed}）`)

// ★ 真正的跨账号场景：A 的草稿**留在 A 的分区**，但当 A 的会话带着 B 的 token 回来
//   （或者：草稿被迁移到当前 scope 但 ownerId 是别人）时，才走 claim 的owner-mismatch。
//   这里直接构造那个形状：草稿在当前 scope、ownerId 是 A、当前 uid 是 B。
enqueue('learn', learnDraft(UID_A, [{ wordKey: 'w.x1', record: { status: 'review' } }]), UID_B)
enqueue('generate', generateDraft(UID_A, ['abandoned']), UID_B)
ok(pendingCount(UID_B) === 2, `B 分区里有 2 条「ownerId 是 A」的草稿（实际 ${pendingCount(UID_B)}）`)

const attempted = []
const res = await drain({ scope: UID_B, uid: UID_B, force: true, push: async (kind, item) => {
  attempted.push({ kind, ownerId: item.ownerId })
  return { ok: true, error: null }
} })

ok(
  attempted.length === 0,
  `★★ ownerId≠当前 uid 的草稿一次都没被推送（实际尝试 ${attempted.length} 次）—— 不能用 B 的 token 推A 的数据`,
)
ok(res.pushed === 0, `drain 报 pushed=0（实际 ${res.pushed}）`)
ok(res.parked === 2, `★ 两条都被 park（实际 ${res.parked}）`)

// ★ 关键：**保留**在队列里，没有被丢弃
const learnQ = queueOf(UID_B, 'learn')
const genQ = queueOf(UID_B, 'generate')
ok(learnQ.length === 1, `★ learn 草稿仍在队列里，没被丢（实际 ${learnQ.length} 条）`)
ok(genQ.length === 1, `★ generate 草稿仍在队列里，没被丢（实际 ${genQ.length} 条）`)
ok(Boolean(learnQ[0] && learnQ[0].parked), '★ learn 草稿被标记 parked=true')
ok(Boolean(genQ[0] && genQ[0].parked), '★ generate 草稿被标记 parked=true')
ok(learnQ[0] && learnQ[0].parkedReason === 'owner-mismatch', `parkedReason=owner-mismatch（实际 ${learnQ[0] && learnQ[0].parkedReason}）`)

// ★ 数据本身完好（不是只留了个空壳）
ok(
  learnQ[0] && learnQ[0].rows && learnQ[0].rows.length === 1 && learnQ[0].rows[0].wordKey === 'w.x1',
  '★ 草稿内容完好（rows 仍在，word_key 没丢）',
)
ok(
  genQ[0] && Array.isArray(genQ[0].forms) && genQ[0].forms[0] === 'abandoned',
  '★ generate 草稿内容完好（forms 仍在）',
)
ok(learnQ[0] && learnQ[0].ownerId === UID_A, '★ ownerId 仍是 A（没有被改成 B —— 那就等于替 A 改数据）')

// discard 日志记了「只记录、未删除」
const log = readDiscarded()
const parkedEntries = log.entries.filter((e) => e.parked === true)
ok(parkedEntries.length === 2, `★ 丢弃日志里两条都标了 parked=true（实际 ${parkedEntries.length}）`)
ok(
  parkedEntries.every((e) => e.ownerIdHash && e.ownerIdHash.length === 8 && !String(e.ownerIdHash).includes(UID_A)),
  `★ 日志只存 8 位哈希、不含完整 uid（实际：${parkedEntries.map((e) => e.ownerIdHash).join(',')}）`,
)

// ★ A 回来认领 → 自动解除 park 并补传
const reclaimed = []
const res2 = await drain({ scope: UID_B, uid: UID_A, force: true, push: async (kind, item) => {
  reclaimed.push({ kind, ownerId: item.ownerId })
  return { ok: true, error: null }
} })
ok(reclaimed.length === 2, `★ A 回来后两条都被补传（实际 ${reclaimed.length}）`)
ok(res2.pushed === 2, `drain 报 pushed=2（实际 ${res2.pushed}）`)
ok(pendingCount(UID_B) === 0 && stuckCount(UID_B) === 0, 'A 认领后队列与 stuck 都归零')

// ================================================================ D-2
section('D-2  可重试失败 → 保留 + **继续下一条**（GAP-5 根因：原来 break）')

reset()
// 三条 learn 草稿，同属B：第 1 条永久失败形状，第 2 条可重试失败，第 3 条应当成功
//   —— 「毒草」在第 1 条，可重试失败在第 2 条。
enqueue(
  'learn',
  {
    ownerId: UID_B,
    queuedAt: new Date().toISOString(),
    rows: [{ wordKey: 'w.poison', record: { status: 'review' } }],
    tag: 'poison',
  },
  UID_B,
)
enqueue(
  'learn',
  {
    ownerId: UID_B,
    queuedAt: new Date().toISOString(),
    rows: [{ wordKey: 'w.retry', record: { status: 'review' } }],
    tag: 'retry',
  },
  UID_B,
)
enqueue(
  'learn',
  {
    ownerId: UID_B,
    queuedAt: new Date().toISOString(),
    rows: [{ wordKey: 'w.good', record: { status: 'review' } }],
    tag: 'good',
  },
  UID_B,
)

const order = []
const res3 = await drain({ scope: UID_B, uid: UID_B, force: true, push: async (kind, item) => {
  order.push(item.tag)
  if (item.tag === 'poison') {
    // 已实测的 RLS 形状 → 永久失败
    return { ok: false, error: { code: '42501', message: 'new row violates row-level security policy' } }
  }
  if (item.tag === 'retry') {
    // 网络错（无code / fetch failed）→ 可重试
    return { ok: false, error: { code: '', message: 'TypeError: fetch failed' } }
  }
  return { ok: true, error: null }
} })

ok(
  order.length === 3 && order[2] === 'good',
  `★★ 三条都被尝试过了，顺序 ${order.join('→')} —— 可重试失败没有 break 掉队列`,
)
ok(res3.pushed === 1, `★ 只有 1 条真正推上去（实际 ${res3.pushed}）`)
ok(res3.parked === 1, `★ 永久失败那条被 park（实际 ${res3.parked}）`)
ok(res3.failed === 1, `可重试失败被计为 failed（实际 ${res3.failed}）`)

const after = queueOf(UID_B, 'learn')
const tags = after.map((i) => i.tag)
ok(tags.includes('retry'), `★ 可重试失败那条被保留（实际队列：${tags.join(',')}）`)
ok(
  after.find((i) => i.tag === 'retry' && !i.parked),
  '★ 保留的可重试条目没有被误标 parked（否则会被算进 stuck，用户永远清不掉）',
)
ok(!tags.includes('good'), '★ 成功那条已从队列移除')
ok(tags.includes('poison'), '永久失败那条保留在队列里（park）')

// ★ 再跑一次：可重试那条这次成功了 → 队列能收敛到 0
const res4 = await drain({ scope: UID_B, uid: UID_B, force: true, push: async () => ({ ok: true, error: null }) })
ok(res4.pushed >= 1, `第二轮把保留下来的推掉了（实际 ${res4.pushed}）`)

// ★ 对照：如果实现是 break，第 2、3 条永远轮不到。
//   用一个「只有可重试失败、没有毒草」的队列证明 continue 不是靠毒草的 park 顺带完成的。
reset()
enqueue('learn', { ownerId: UID_B, queuedAt: '', rows: [{ wordKey: 'w.1', record: { status: 'review' } }], tag: 'a' }, UID_B)
enqueue('learn', { ownerId: UID_B, queuedAt: '', rows: [{ wordKey: 'w.2', record: { status: 'review' } }], tag: 'b' }, UID_B)
enqueue('learn', { ownerId: UID_B, queuedAt: '', rows: [{ wordKey: 'w.3', record: { status: 'review' } }], tag: 'c' }, UID_B)
const order2 = []
await drain({ scope: UID_B, uid: UID_B, force: true, push: async (kind, item) => {
  order2.push(item.tag)
  // 第 1 条可重试失败；后面两条应当照常尝试
  return item.tag === 'a' ? { ok: false, error: { code: '', message: 'TypeError: fetch failed' } } : { ok: true, error: null }
} })
ok(
  order2.join(',') === 'a,b,c',
  `★★ 无毒草场景：可重试失败后仍继续到 b、c（实际 ${order2.join(',')}）—— 这条直接证伪 break 实现`,
)
ok(pendingCount(UID_B) === 1, `只剩那条可重试失败的（实际 ${pendingCount(UID_B)}）`)

// ================================================================ D-3
section('D-3  clearStuck 只删草稿，可证明没碰 learn 分区的学习记录')

reset()
// learn 分区里放两条真实记录（一条 learning、一条 migration）
const at = new Date().toISOString()
writeLearn(
  {
    'w.keep1': {
      status: 'known',
      correctCount: 3,
      consecutiveCorrect: 3,
      incorrectCount: 0,
      lastStudiedAt: at,
      lastResult: 'correct',
      lastIncorrectAt: null,
      nextDueAt: null,
      statusChangedAt: at,
      statusSource: 'learning',
      updatedAt: at,
    },
    'w.keep2': {
      status: 'review',
      correctCount: 0,
      consecutiveCorrect: 0,
      incorrectCount: 2,
      lastStudiedAt: at,
      lastResult: 'incorrect',
      lastIncorrectAt: at,
      nextDueAt: at,
      statusChangedAt: at,
      statusSource: 'migration',
      updatedAt: at,
    },
  },
  UID_B,
)
const learnSnapshot = JSON.stringify(readLearn(UID_B))

// 队列里放 2 条 parked + 1 条正常待传
enqueue('learn', { ownerId: UID_A, queuedAt: '', rows: [{ wordKey: 'w.x', record: {} }], parked: true, parkedReason: 'owner-mismatch' }, UID_B)
enqueue('generate', { ownerId: UID_A, queuedAt: '', forms: ['x'], parked: true, parkedReason: 'owner-mismatch' }, UID_B)
enqueue('learn', { ownerId: UID_B, queuedAt: '', rows: [{ wordKey: 'w.pending', record: { status: 'review' } }] }, UID_B)

ok(pendingCount(UID_B) === 1, `pendingCount 只算 1 条正常待传（实际 ${pendingCount(UID_B)}）`)
ok(stuckCount(UID_B) === 2, `stuckCount 数出 2 条 parked（实际 ${stuckCount(UID_B)}）`)
ok(
  pendingByKind(UID_B).learn === 1 && pendingByKind(UID_B).generate === 0,
  `pendingByKind 同样不含 parked（learn=${pendingByKind(UID_B).learn} generate=${pendingByKind(UID_B).generate}）`,
)

const cleared = clearStuck(UID_B)
ok(cleared === 2, `clearStuck 返回 2（实际 ${cleared}）`)
ok(stuckCount(UID_B) === 0, 'stuckCount 归零')
ok(pendingCount(UID_B) === 1, '★ 正常待传那条没被误删（pendingCount 仍为 1）')
ok(queueOf(UID_B, 'generate').length === 0, '★ parked 的 generate 草稿被删了')
ok(
  queueOf(UID_B, 'learn').some((i) => i.rows && i.rows[0] && i.rows[0].wordKey === 'w.pending'),
  '★ 待传那条还在队列里',
)

//★★ 关键断言：学习记录逐字节未变 ★★
const learnAfter = readLearn(UID_B)
ok(JSON.stringify(learnAfter) === learnSnapshot, '★★ clearStuck 后 learn 分区逐字节未变')
ok(Boolean(learnAfter['w.keep1']), '★ w.keep1 记录仍存在')
ok(learnAfter['w.keep1'].status === 'known', `★ 它的 status 仍是 known（实际 ${learnAfter['w.keep1'] && learnAfter['w.keep1'].status}）`)
ok(learnAfter['w.keep1'].statusSource === 'learning', `★ 它的 statusSource 仍是 learning（实际 ${learnAfter['w.keep1'] && learnAfter['w.keep1'].statusSource}）`)
ok(learnAfter['w.keep1'].correctCount === 3, '★ 计数没被清零')
ok(Boolean(learnAfter['w.keep2']), '★ w.keep2（migration 记录）仍存在')
ok(learnAfter['w.keep2'].status === 'review', `★ 它的 status 仍是 review（实际 ${learnAfter['w.keep2'] && learnAfter['w.keep2'].status}）`)
ok(learnAfter['w.keep2'].statusSource === 'migration', `★ 它的 statusSource 仍是 migration（实际 ${learnAfter['w.keep2'] && learnAfter['w.keep2'].statusSource}）`)
ok(learnAfter['w.keep2'].incorrectCount === 2, '★ 它的计数没被清零')

// 别的分区也不该被动
writeLearn({ 'w.other': { status: 'known', correctCount: 9, consecutiveCorrect: 9, incorrectCount: 0, lastStudiedAt: null, lastResult: null, lastIncorrectAt: null, nextDueAt: null, statusChangedAt: null, statusSource: 'learning' } }, UID_A)
clearStuck(UID_B)
ok(Boolean(readLearn(UID_A)['w.other']), '★ 另一个分区的记录也没被碰')

// ================================================================ D-4
section('D-4  isPermanentError：未识别形状一律 false（fail-safe 向保留）')

ok(isPermanentError({ code: '42501', message: 'new row violates row-level security policy' }) === true, 'RLS 42501 → true')
ok(isPermanentError({ code: 'PGRST301', message: 'Expected 3 parts in JWT; got 1' }) === true, 'JWT 结构错 PGRST301 → true')
ok(isPermanentError({ code: 'PGRST205', message: 'Could not find the table' }) === true, '表不存在 PGRST205 → true')
ok(isPermanentError({ code: '', message: 'Invalid API key' }) === true, '无 code 的 Invalid API key → true（靠 message 兜住）')
ok(isPermanentError({ code: '', message: 'TypeError: fetch failed' }) === false, '网络不可达 → false（可重试）')
ok(isPermanentError({ code: '', message: '' }) === false, '空错误 → false')

// ★ fail-safe：各种「没见过的形状」都必须判false（=保留）
const unknownShapes = [
  null,
  undefined,
  0,
  '',
  'a string error',
  [],
  {},
  { message: 'something totally new' },
  { code: 'ECONNRESET', message: 'socket hang up' },
  { code: 'ERR_NETWORK', message: 'network error' },
  { code: 500, message: 'Internal Server Error' },
  { code: '99999', message: 'who knows' },
  { status: 500, message: 'gateway blew up' },
  { status: 403, message: '' }, // 只有 status、没有 code/message 关键词
  { code: null, message: null },
  { detail: 'no code no message' },
  new Error('boom'), //Error 实例：code 是 undefined
  Object.create(null), // 无原型对象
]
unknownShapes.forEach((shape, i) => {
  let r
  try {
    r = isPermanentError(shape)
  } catch (e) {
    r = `THREW:${e.message}`
  }
  ok(r === false, `未识别形状 #${i}（${safeLabel(shape)}）→ false（实际 ${r}）`)
})

// ★ 抛异常也不能被当成「永久失败」→ 必须被 catch 成可重试
//   drain 里 push 抛异常时走 catch 分支，这里确认 isPermanentError 不会把异常判成永久
ok(isPermanentError({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' }) === false, '连接被拒 → false（保留重试）')
ok(isPermanentError({ code: 'ETIMEDOUT', message: 'timeout' }) === false, '超时 → false')

// ================================================================ D-5
section('D-5  claim 纯函数：结构损坏真丢、跨账号 park、不阻塞后续')

reset()
ok(claim('learn', { ownerId: UID_B, rows: [] }, UID_B).ok === true, '合法 learn 草稿可认领')
ok(claim('learn', { ownerId: UID_A, rows: [] }, UID_B).verdict === 'discard', 'ownerId 不同 → discard(=park)')
ok(claim('learn', { ownerId: UID_B, rows: 'not-array' }, UID_B).verdict === 'skip', 'rows 非数组 → skip(结构损坏)')
ok(claim('generate', { ownerId: UID_B }, UID_B).verdict === 'skip', 'generate 缺 forms → skip')
ok(claim('stationWords', { ownerId: UID_B, items: [] }, UID_B).verdict === 'skip', 'stationWords 缺 stationId → skip')
ok(claim('stations', { ownerId: UID_B }, UID_B).verdict === 'skip', 'stations 缺 row.id → skip')
ok(claim('stations', { ownerId: UID_B, row: { id: 's1', ownerId: UID_B } }, UID_B).ok === true, '合法 stations 可认领（ownerId 取自 row）')
ok(claim('learn', { ownerId: UID_B, rows: [] }, null).ok === false, '未登录 → ok:false（整轮跳过）')
ok(claim('learn', { ownerId: UID_B, rows: [] }, '').ok === false, '空 uid → ok:false')
ok(claim('learn', { ownerId: UID_B, rows: [] }, 123).ok === false, '非字符串 uid → ok:false（不能把数字当账号）')
ok(claim('learn', null, UID_B).verdict === 'skip', 'item 为 null → skip')
ok(claim('learn', { rows: [] }, UID_B).verdict === 'skip', '缺 ownerId → skip')

// 结构损坏的草稿 → 真丢（推上去必然失败）
//★ 注意：这里只放「损坏 + 1 条正常」，且断言里只查discarded 计数。
//   「损坏条目之后的那条会不会被跳过」是另一个问题 —— 它是真bug，已单独记在
//   scripts/qa2-bug-drain-skip.mjs（offline.js:478 的 splice 与 482 的 i += 1
//   双重推进）。这里刻意不去断言它，免得把一个 bug 混进本文件的结论里。
reset()
enqueue('learn', { ownerId: UID_B, queuedAt: '', rows: 'broken' }, UID_B)
enqueue('learn', learnDraft(UID_B, [{ wordKey: 'w.ok', record: { status: 'review' } }]), UID_B)
let n = 0
const res5 = await drain({ scope: UID_B, uid: UID_B, force: true, push: async () => { n += 1; return { ok: true, error: null } } })
ok(res5.discarded === 1, `结构损坏那条被真丢弃（实际 discarded=${res5.discarded}）`)
// ★ 这里刻意**不断言**「同轮里后面的正常草稿被推了」—— 那条断言现在是红的，
//   原因是offline.js:478/482 的双重推进（splice 后又 i += 1）。已单独记在
//   scripts/qa2-bug-drain-skip.mjs。在那个 bug 修好之前，把它写进本文件只会
//   让「草稿语义」这份结论里混进一个不属于本文件的红灯。
//跑第二轮把可能漏掉的补上，队列应当最终清空（数据没丢，只是本轮漏推）
await drain({ scope: UID_B, uid: UID_B, force: true, push: async () => { n += 1; return { ok: true, error: null } } })
ok(n >= 1, `★ 结构损坏最终不阻塞：两轮之内正常草稿被推了（累计推送 ${n} 次）`)
ok(pendingCount(UID_B) === 0, `两轮之后队列清空（实际还剩 ${pendingCount(UID_B)} 条）`)

// DRAIN_ORDER 固定（generate 必须先于 stationWords）
ok(
  DRAIN_ORDER.join(',') === 'generate,stationWords,learn,stations',
  `补传顺序固定：${DRAIN_ORDER.join(' → ')}`,
)

// 未登录时整轮跳过，不动任何东西
reset()
enqueue('learn', learnDraft(UID_B, [{ wordKey: 'w.keep', record: { status: 'review' } }]), UID_B)
const resNoAuth = await drain({ scope: UID_B, uid: null, force: true, push: async () => ({ ok: true, error: null }) })
ok(resNoAuth.skippedNoAuth === true, '未登录 → skippedNoAuth')
ok(resNoAuth.pushed === 0, '未登录 → 一条都不推')
ok(pendingCount(UID_B) === 1, '★ 未登录时草稿原封不动保留')

// ---------------------------------------------------------------- 汇总
console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
if (fail > 0) {
  console.error('\n失败项：')
  failures.forEach((f) => console.error(`· ${f}`))
}
process.exit(fail === 0 ? 0 : 1)

function safeLabel(s) {
  try {
    if (s === null) return 'null'
    if (s === undefined) return 'undefined'
    const t = typeof s
    if (t === 'object') {
      if (s instanceof Error) return `Error(${s.message})`
      if (Array.isArray(s)) return 'array'
      if (Object.getPrototypeOf(s) === null) return 'null-prototype obj'
      return `obj{${Object.keys(s).join(',')}}`
    }
    return `${t}(${String(s).slice(0, 20)})`
  } catch {
    return 'unlabelable'
  }
}

void assert
void keysFor
void readLearn
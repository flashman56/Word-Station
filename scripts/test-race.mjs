/**
 * L2 epoch 守卫 / L3 settleInFlight 的**竞态动态测试**
 * ------------------------------------------------------------------
 * 跑：npm run test:race
 *
 * ★ 为什么必须是动态测试 ★
 *   QA 诚实声明过：这两层只做了结构审读，没能构造出「在途 push 期间切号」的
 *   真实竞态去触发。50 轮循环验的是数据源隔离（L1）与云端视图，**不等于**把
 *   竞态窗口跑出来了 —— 窗口只存在于「await 已进入、尚未返回」这一瞬间。
 *
 * ★ 怎么把这个窗口撑开 ★
 *   把 `learnSync.pushBatch` 换成可控替身（race-fake-learnsync.mjs）：
 *   让它**挂起**（返回一个不 resolve 的 promise），此时 useLearnCloud 正停在
 *   `await pushBatch(...)` 上；然后切号（epoch++），最后再把 push 放行。
 *   真网络做不到这件事 —— 请求要么秒失败、要么在不确定的时刻返回。
 *
 * ★ 三条断言（对应 lead 的三项要求）★
 *   1. 旧 scope 的在途结果**不写进**新 scope 的内存态 / 落盘键 / 草稿队列；
 *   2. 每个 await 之后 epoch 校验**确实被走到** —— 用计数器证明
 *      （断言 push 确实在途、确实跨越了 epoch 变更、且副作用计数为 0）；
 *   3. settleInFlight 在超时内收敛，**不留悬挂状态**。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.race-bundle.mjs')
const ENTRY = resolve('scripts/race-probe-entry.jsx')
const FAKE = resolve('scripts/race-fake-learnsync.mjs')

// ---------------------------------------------------------------- jsdom
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5178/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false

// learnSync 的替身：只替换这一个模块，其余（migrate / merge / offline）都是真的
const swapPlugin = {
  name: 'swap-learnsync',
  setup(build) {
    build.onResolve({ filter: /lib[\\/]cloud[\\/]learnSync\.js$/ }, () => ({ path: FAKE }))
  },
}

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [swapPlugin],
  logLevel: 'warning',
})

const probe = await import(pathToFileURL(OUT).href)

let pass = 0
let fail = 0
function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  PASS  ${msg}`)
  } else {
    fail += 1
    console.log(`  FAIL  ${msg}`)
  }
}
const flush = (ms = 60) => new Promise((r) => setTimeout(r, ms))
const A = 'uid-A'
const B = 'uid-B'

console.log('[test:race] L2 epoch 守卫 / L3 settleInFlight 的竞态动态测试\n')

// ================================================================ 场景 0（阳性对照）
//
// 这一段的作用是**让后面的「零副作用」断言不是空转**。
// 如果同一条代码路径在「不切号」时压根不产生任何可观测副作用，那么场景 1~3
// 里那些「没有污染」的断言就可能只是因为「什么都没发生」而通过 —— 那种测试
// 骗自己。
//
// 这里固定住「不切号」这一支：同一个挂起的 push 被放行后，**必须**看到副作用
// （A 的同步游标被推进）。看到它，才说明场景 1 里观测不到副作用确实是守卫的功劳。
{
  console.log('--- 场景 0（阳性对照）：不切号时，同样在途的 push 必须留下副作用 ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  probe.answerWord('w.gamma', 'correct')
  await flush(40)
  probe.fake.hangPushes(true)
  probe.pushNow()
  await flush(60)
  ok(probe.fake.counters.pushStarted === 1, `push 进入在途（pushStarted=${probe.fake.counters.pushStarted}）`)

  const cursorBefore = probe.readCursor(A)
  probe.fake.releaseAllPushes({ data: { pushed: 1 }, error: null })
  await flush(150)

  const cursorAfter = probe.readCursor(A)
  ok(
    Boolean(cursorAfter) && cursorAfter !== cursorBefore,
    `★ 不切号时游标被推进（${cursorBefore || 'null'} → ${cursorAfter || 'null'}）—— 副作用确实可观测，后面的「零污染」不是空转`,
  )
  ok(Boolean(probe.readScope(A)['w.gamma']), 'A 分区里有 w.gamma（本地早于上行就已持久化）')

  probe.unmountRace()
}

// ================================================================ 场景 1
// push 在途 → 切号 → 放行 push → A 的结果不得落到 B 的任何地方
{
  console.log('--- 场景 1：push 在途时切号（A → B），放行后 A 的结果零污染 ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  // 铺一份 A 的本地记录，并把它标脏
  probe.answerWord('w.alpha', 'correct')
  await flush(40)
  ok(probe.fake.counters.pushCalls === 0, `起手：还没推（pushCalls=${probe.fake.counters.pushCalls}）`)

  // 让 push 挂起 → 进入在途
  probe.fake.hangPushes(true)
  probe.pushNow() // ★ 不能 await：push 已挂起，await 会永远等下去（那正是「在途」的定义）
  await flush(60)
  ok(probe.fake.counters.pushStarted === 1, `★ push 确实进入在途（pushStarted=${probe.fake.counters.pushStarted}）`)
  ok(probe.fake.pendingPushCount() === 1, `★ 有 1 个挂起的 push（pending=${probe.fake.pendingPushCount()}）`)

  // 切号：epoch++ → settleInFlight → replaceAll(B)
  probe.setOwnerId(B)
  await flush(60)
  const epochAfterSwitch = probe.getLearn().epoch
  ok(epochAfterSwitch > 0, `切号后 epoch 已递增（epoch=${epochAfterSwitch}）`)

  // 放行在途 push —— 此时它返回时 epoch 已经变了
  probe.fake.releaseAllPushes({ data: { pushed: 1 }, error: null })
  await flush(120)

  // ① 旧 scope 结果不落地
  const bRecords = probe.readScope(B)
  ok(
    !Object.prototype.hasOwnProperty.call(bRecords, 'w.alpha'),
    '★ B 分区磁盘上没有 A 的 w.alpha（在途结果未落地）',
  )
  const memB = probe.getLearn().records
  ok(!memB['w.alpha'], '★ B 的内存态里也没有 A 的 w.alpha')
  ok(probe.getLearn().scope === B, `当前 scope 是 B（${probe.getLearn().scope}）`)

  // A 自己的分区不受影响（它本来就该有这条）
  const aRecords = probe.readScope(A)
  ok(Boolean(aRecords['w.alpha']), 'A 分区里 w.alpha 仍在（各归各位）')

  // 上行日志：只应看到 ownerId=A 的那一笔，绝不该出现 ownerId=B 带 A 的词
  const bPushWithA = probe.fake.pushLog.filter((p) => p.ownerId === B && p.rows.some((r) => r.wordKey === 'w.alpha'))
  ok(bPushWithA.length === 0, '★ 上行日志里没有「ownerId=B 却带 A 的词」这种组合')

  // 草稿队列：失败兜底入队也必须落在 A 的分区，不能落进 B
  const bDrafts = probe.readDraftsOf(B)
  ok(
    !bDrafts.learn.some((d) => (d.rows || []).some((r) => r.wordKey === 'w.alpha')),
    '★ B 的草稿队列里没有 A 的 w.alpha（连兜底入队都没串）',
  )

  // ③ 不留悬挂状态
  ok(probe.fake.pendingPushCount() === 0, `挂起的 push 已全部释放（pending=${probe.fake.pendingPushCount()}）`)

  probe.unmountRace()
}

// ================================================================ 场景 2
// 上行「失败」的在途结果同样不得跨号落地（失败路径会走 enqueue，最容易串）
{
  console.log('\n--- 场景 2：在途 push 以「失败」返回，切号后不得入队到 B ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  probe.answerWord('w.beta', 'correct')
  await flush(40)

  probe.fake.hangPushes(true)
  probe.pushNow() // 同上：不 await，保持在途
  await flush(60)
  ok(probe.fake.counters.pushStarted === 1, `push 进入在途（pushStarted=${probe.fake.counters.pushStarted}）`)

  probe.setOwnerId(B)
  await flush(60)

  // 失败返回 —— 旧实现会把 rows 兜底 enqueue，若 scope 取错就会写进 B
  probe.fake.releaseAllPushes({ data: null, error: { code: '', message: 'TypeError: fetch failed' } })
  await flush(120)

  const bDrafts = probe.readDraftsOf(B)
  const aDrafts = probe.readDraftsOf(A)
  ok(
    !bDrafts.learn.some((d) => (d.rows || []).some((r) => r.wordKey === 'w.beta')),
    '★ B 的草稿队列里没有 A 的 w.beta（失败兜底也没有串号）',
  )
  // epoch 失配时守卫在错误分支**之前**就 return 了，所以这条草稿既没进 B、
  // 也没进 A 的队列 —— 整段丢弃。这是有意的：跨号入队比丢弃更危险。
  // 而「数据没丢」的真正依据是：记录早已落在 A 的 learn 分区（本地已持久化），
  // A 下次登录时 pull/migrate 会从那里重新上行。
  ok(
    !aDrafts.learn.some((d) => (d.rows || []).some((r) => r.wordKey === 'w.beta')),
    '在途失败且 epoch 已变 → 整段丢弃，既不入 B 也不入 A 的草稿队列（跨号入队比丢弃更危险）',
  )
  ok(
    Boolean(probe.readScope(A)['w.beta']),
    '★ 数据没丢：w.beta 早已持久化在 A 的 learn 分区（A 下次登录会重新上行）',
  )
  ok(probe.fake.pendingPushCount() === 0, '挂起的 push 已释放')

  probe.unmountRace()
}

// ================================================================ 场景 3
// 连续快速切号 A → B → A：epoch 单调递增，且任何一次都不串
{
  console.log('\n--- 场景 3：连续快速切号（A → B → A），逐次校验零串号 ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  const epochs = [probe.getLearn().epoch]
  probe.answerWord('w.gamma', 'correct')
  await flush(40)
  probe.fake.hangPushes(true)
  probe.pushNow() // 同上：不 await，保持在途
  await flush(60)

  probe.setOwnerId(B)
  await flush(50)
  epochs.push(probe.getLearn().epoch)

  probe.setOwnerId(A)
  await flush(50)
  epochs.push(probe.getLearn().epoch)

  ok(
    epochs.every((v, i) => i === 0 || v >= epochs[i - 1]),
    `epoch 单调不减（${epochs.join(' → ')}）`,
  )
  ok(epochs[epochs.length - 1] >= 2, `两次切号后 epoch 至少 +2（实际 ${epochs[epochs.length - 1]}）`)

  probe.fake.releaseAllPushes({ data: { pushed: 1 }, error: null })
  await flush(120)

  const bRecords = probe.readScope(B)
  ok(!Object.prototype.hasOwnProperty.call(bRecords, 'w.gamma'), '★ 三次切换后 B 分区仍无 A 的词')
  ok(probe.fake.pendingPushCount() === 0, '挂起的 push 已释放，无悬挂')

  probe.unmountRace()
}

// ================================================================ 场景 4
// L3 收敛性：切号后立刻能正常推新 scope 的数据（守卫没有把 hook 卡死）
{
  console.log('\n--- 场景 4：L3 收敛 —— 切号后 hook 仍可正常推新 scope 的数据 ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  // 先制造一次在途
  probe.answerWord('w.delta', 'correct')
  await flush(40)
  probe.fake.hangPushes(true)
  probe.pushNow() // 同上：不 await，保持在途
  await flush(60)

  // 切号并**立刻**推 B 的数据（不等在途的 A）
  probe.setOwnerId(B)
  await flush(40)
  probe.answerWord('w.alpha', 'correct')
  await flush(40)
  probe.fake.releaseAllPushes({ data: { pushed: 1 }, error: null })
  await flush(60)

  // 此刻应能对 B 正常推
  probe.fake.hangPushes(false)
  probe.fake.queuePushResults([{ data: { pushed: 1 }, error: null }])
  probe.answerWord('w.beta', 'correct')
  await flush(40)
  probe.pushNow() // 同上：不 await
  await flush(120)

  const bPushes = probe.fake.pushLog.filter((p) => p.ownerId === B)
  ok(bPushes.length >= 1, `★ B 账号能正常上行（ownerId=B 的 push ${bPushes.length} 次）`)
  // B 的分区里只有 B 自己答的词；w.delta 属于 A，绝不该由 B 推上去
  const bPushedKeys = new Set(bPushes.flatMap((p) => p.rows.map((r) => r.wordKey)))
  ok(
    !bPushedKeys.has('w.delta'),
    `★ B 的上行里没有 A 的 w.delta（实际：${[...bPushedKeys].join(',') || '空'}）`,
  )
  ok(bPushedKeys.has('w.beta'), '★ B 确实推了自己的 w.beta（不是「什么都没推」的假通过）')
  ok(probe.getLearn().syncStatus !== undefined, 'hook 仍存活（守卫没有把 hook 卡死）')

  probe.unmountRace()
}

// ================================================================ 场景 5
// L3 的超时语义：push 一直挂着不回来时，settleInFlight 必须在上限内放弃等待，
// 切号流程不能被它无限拖住（否则用户点了登出就没反应）。
{
  console.log('\n--- 场景 5：L3 超时收敛 —— 在途 push 永不返回时，切号仍能在上限内完成 ---')
  probe.fake.resetFake()
  probe.mountRace(A)
  await flush(120)

  probe.answerWord('w.delta', 'correct')
  await flush(40)
  probe.fake.hangPushes(true) // 这次**永不** release
  probe.pushNow()
  await flush(60)
  ok(probe.fake.counters.pushStarted === 1, 'push 进入在途且永不返回')

  const t0 = Date.now()
  probe.setOwnerId(B)
  let switched = false
  for (let i = 0; i < 80; i += 1) {
    await flush(100)
    if (probe.getLearn().scope === B) {
      switched = true
      break
    }
  }
  const elapsed = Date.now() - t0
  ok(switched, `在途 push 永不返回的情况下，scope 仍切到了 B（耗时 ${elapsed}ms）`)
  ok(elapsed < 8000, `★ settleInFlight 在上限内收敛，没有无限等待（${elapsed}ms < 8000ms）`)
  ok(
    probe.fake.pendingPushCount() === 1,
    `旧 push 仍挂在后台（pending=${probe.fake.pendingPushCount()}）—— 不阻塞 UI`,
  )

  probe.fake.releaseAllPushes({ data: { pushed: 1 }, error: null })
  await flush(80)
  ok(probe.fake.pendingPushCount() === 0, '放行后挂起清零，无残留')
  ok(!probe.readScope(B)['w.delta'], '★ 迟到的结果仍没写进 B（超时路径上守卫同样有效）')

  probe.unmountRace()
}

console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------\n`)
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)
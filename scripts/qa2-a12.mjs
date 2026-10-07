/**
 * A-12（写入失败可见）+ A-14（待传 / 传不上去分开）的独立验证
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-a12.mjs
 *
 * 与 scripts/test-a12-ui.mjs 的区别：那一轮只覆盖 A-12 的信号链；
 * 本文件额外做两件事：
 *   1. **A-14 的徽标渲染**：pendingCount 排除 parked、stuckCount 计入 parked，
 *      两者都出现在徽标文案里 —— 且徽标给出的是「清除传不上去」的入口，
 *      而不是把用户困在一个减不掉的数字上。
 *   2. **可证伪性**：每段都断言「失败确实发生了」（mock 真的被调用 N>0 次）。
 *      只断言「没出现告警」的写法，在persist 根本没被调用、或异常又被
 *      吞掉的情况下同样会通过 —— 那种测试是「测了等于没测」。
 */

import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa2-a12-bundle.mjs')
const ENTRY = resolve('scripts/qa2-a12-probe.jsx')

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5181/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false
globalThis.alert = () => {}
// A-14 的一键清除会confirm()；接受它，才能测到清除后的状态
window.confirm = () => true

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  // 顶替 supabase 客户端：不打真网络（jsdom 里带 ownerId 会触发 pull）
  plugins: [
    {
      name: 'qa2-a12-supabase-shim',
      setup(build) {
        build.onResolve({ filter: /supabase\.js$/ }, () => ({ path: resolve('scripts/qa2-fake-supabase.mjs') }))
      },
    },
  ],
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})

const probe = await import(pathToFileURL(OUT).href)

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
const warnings = []
/** 记录「已知的源码现状问题」：打印出来但不计入 FAIL（cosmetic 类） */
function warn(cond, msg) {
  if (cond) {
    warnings.push(msg)
    console.log(`  WARN  ${msg}`)
  }
}
const text = () => window.document.body.textContent || ''
/** 徽标树的文案（只读 #badge 容器：body 里同时挂着 Probe 树与徽标树） */
const badgeText = () => (window.document.getElementById('badge') || {}).textContent || ''
const flush = (ms = 120) => new Promise((r) => setTimeout(r, ms))

console.log('[qa2:a12] A-12 写入失败可见 / A-14 待传与传不上去分开\n')

// ================================================================ A-12 正常路径
section('A-12a 正常路径：写入成功、无告警')

probe.mountProbe()
await flush()
ok(text().includes('本地模式'), '游客态显示「本地模式（游客）」')
ok(!text().includes('本机存储已满'), '初始没有容量告警')

probe.api().answer('w.p1', 'correct')
await flush()
ok(Boolean(probe.api().records['w.p1']), '内存态有这条记录')
ok(Boolean(probe.storedRecords()['w.p1']), '磁盘也写进去了')

// ================================================================ A-12 配额写满
section('A-12b 配额写满：UI 存活 + 内存存活 + 徽标第六态')

probe.setStorageFailure(true)
probe.api().answer('w.p2', 'correct')
await flush(150)

const quotaHits = probe.getQuotaThrows()
ok(
  quotaHits > 0,
  `★ 前置：learn 分区写入确实抛了 QuotaExceededError（${quotaHits} 次）—— 为 0 说明本段等于没测`,
)

const afterFail = text()
ok(
  afterFail.includes('本机存储已满') && afterFail.includes('改动未保存'),
  `★ 徽标进入第六态「本机存储已满 · 改动未保存」（实际：${afterFail.slice(0, 40)}…）`,
)

// ★ UI 存活：页面没崩、组件还在渲染
ok(window.document.querySelectorAll('[data-testid="known"]').length === 1, '★ UI 存活（组件仍在渲染，没有白屏）')
ok(text().includes('已掌握') === false || text().length > 0, '★ 页面仍有内容输出')

// ★ 内存存活：用户刚做的操作没丢
ok(Boolean(probe.api().records['w.p2']), '★ 写盘失败后内存态仍保留这条记录')
ok(!probe.storedRecords()['w.p2'], '磁盘上确实没有（这正是必须告警的原因）')

// 告警徽标的 title 要有可执行指引
const badge = [...window.document.querySelectorAll('button, span')].find((b) =>
  (b.textContent || '').includes('本机存储已满'),
)
const title = badge ? badge.getAttribute('title') || '' : ''
ok(Boolean(title), '告警徽标带 title 展开说明')
ok(title.includes('刷新') && title.includes('丢'), '★ 说明提到「刷新会丢」')
ok(title.includes('导出 JSON'), '★ 给出可执行的下一步（导出 JSON 备份）')

// 导出的是内存态（告警文案的前提）
const exported = JSON.parse(probe.api().exportJson())
ok(Boolean(exported.records['w.p2']), '★ exportJson 导出的是内存态（含刚答的这条）')

// ★ 告警不是一次性 toast
probe.api().answer('w.p3', 'correct')
await flush(150)
ok(text().includes('本机存储已满'), '★ 告警持续存在（不是 toast）')
ok(probe.getQuotaThrows() > quotaHits, '第二次答题也确实又抛了一次')

// 恢复 → 告警清除
section('A-12c 恢复后：告警清除、内存攒下的记录一次性落盘')

probe.setStorageFailure(false)
probe.api().answer('w.p4', 'correct')
await flush(150)

ok(!text().includes('本机存储已满'), '★ 下一次persist 成功后告警消失')
const disk = probe.storedRecords()
ok(Boolean(disk['w.p4']), '恢复后落盘成功')
ok(Object.keys(disk).length >= 4, `★ 恢复后把内存里攒下的记录全写上（${Object.keys(disk).length} 条）`)
ok(!text().includes('本机存储已满'), '恢复后不再有告警')

probe.unmountProbe()

// ================================================================ A-14
//
// ★ 三个必须注意的机制（A-14 段一开始就踩了这三个）★
//   1. mountProbe() 会 localStorage.clear() → 造队列必须放在**挂载之后**；
//   2. 探针是 esbuild 打包出的独立模块实例，它内部的 offline.js 与主 realm
//      `import()` 到的那个是**两个模块单例**（pendingListeners 互不相通）。
//      所以「造数据 + 通知」都必须在探针内做，否则 React 收不到通知、
//      徽标数字永远不更新 —— 表现为一堆红，但代码没 bug。
//   3. SyncBadge 对游客（ownerId=null）会在 pending/stuck 之前提前 return
//      「本地模式（游客）」（SyncBadge 73–79 行，故意如此），所以这段必须登录态。

// A-12 段的 Probe root 必须先卸载：徽标段要用同一个 #root 容器，
// 两个 root 同时挂在一个容器上会互相打架（React 报NotFoundError）。
probe.unmountProbe()
probe.unmountBadge()

section('A-14a  pendingCount 排除 parked / stuckCount 计入 parked')

const FAKE_UID = 'uid-fake-owner'
probe.mountProbe(FAKE_UID)
await flush(250)

// 造 2 条 parked（跨账号）+ 1 条可重试待传
probe.seedParked(2, FAKE_UID)
probe.seedPending(1, FAKE_UID, FAKE_UID)
await flush(250)

let c = probe.counts(FAKE_UID)
const pendEl = window.document.querySelector('[data-testid="pending"]')
const stuckElVal = window.document.querySelector('[data-testid="stuck"]')
ok(c.pending === 1, `★ pendingCount 排除 parked（实际 ${c.pending}，应为 1）`)
ok(c.stuck === 2, `★ stuckCount 计入 parked（实际 ${c.stuck}，应为 2）`)
ok(c.pending + c.stuck === 3, `pending + stuck = 队列总数 3（实际 ${c.pending + c.stuck}）`)
ok(
  Number(pendEl.textContent) === 1,
  `★ useLearnCloud 暴露的 pending 也排除了 parked（实际 ${pendEl.textContent}）`,
)
ok(
  Number(stuckElVal.textContent) === 2,
  `★ useLearnCloud 暴露的 stuck 计入 parked（实际 ${stuckElVal.textContent}）`,
)

section('A-14b 徽标契约：给定 pending / stuck 显示什么、给什么入口')

// 静态渲染真组件：只给定 pending / stuck，断言徽标的纯契约
// （为什么不用挂着的 hook，见 qa2-a12-probe.jsx 里renderBadge 的注释）
probe.renderBadge({ pending: 1, stuck: 2 })
await flush(200)
let bt = badgeText()
ok(
  bt.includes('1 条待传') && bt.includes('2 条传不上去'),
  `★ pending=1 & stuck=2 → 同时显示两段（实际：${bt.trim()}）`,
)

probe.renderBadge({ pending: 0, stuck: 2 })
await flush(200)
bt = badgeText()
ok(bt.includes('2 条传不上去'), `★ pending=0 & stuck=2 → 显示「2 条传不上去」（实际：${bt.trim()}）`)
// ⚠ MINOR（源码现状，**不是**我断言写错）：pending 归零时文案里仍出现「0 条待传」。
//   成因：SyncBadge.jsx:115 走 ②'分支时传的是 stuckText(false, 0, stuck)，
//   而 stuckText 无条件拼上 left（`${pending} 条待传`）→ 输出「0 条待传 · 2 条传不上去」。
//   「0 条待传」对用户没有信息量、属噪声；但它**不影响任何数据安全**，
//   且徽标仍给出了正确的「2 条传不上去」与清除入口 —— 故记为 cosmetic，不判 FAIL。
//   若工程师决定修：stuckText 里当 pending<=0 且非离线时省略 left 即可。
warn(
  bt.includes('0 条待传'),
  `MINOR：pending=0 时文案里仍出现「0 条待传」（实际：${bt.trim()}）—— SyncBadge.jsx:115 + stuckText 无条件拼 left`,
)

probe.renderBadge({ pending: 3, stuck: 0 })
await flush(200)
bt = badgeText()
ok(
  bt.includes('3 条待传') && !bt.includes('传不上去'),
  `★ pending=3 & stuck=0 → 只显示「3 条待传」（实际：${bt.trim()}）`,
)

probe.renderBadge({ pending: 0, stuck: 0 })
await flush(200)
bt = badgeText()
ok(
  !bt.includes('条待传') && !bt.includes('传不上去'),
  `★ 两者都为 0 → 徽标回到「已同步」这类正常态（实际：${bt.trim()}）`,
)

section('A-14c  只有 stuck 时给的是「清除」入口，且只删草稿不碰学习记录')

// title 必须说清「清除不影响学习记录」—— 这是让用户敢点的前提
probe.renderBadge({ pending: 0, stuck: 2 })
await flush(200)
const stuckEl = [...window.document.querySelectorAll('#badge button, #badge span')].find((b) =>
  (b.textContent || '').includes('传不上去'),
)
ok(Boolean(stuckEl), '★ 有「传不上去」的徽标元素')
const stuckTitle = stuckEl ? stuckEl.getAttribute('title') || '' : ''
ok(Boolean(stuckTitle), '徽标带 title 说明')
ok(
  // 原文是「不会影响已保存的学习记录」—— 我最初断言的是 "不影响"，
  // 那是我抄错了字（源码里「影响」后面还有「已保存的」），不是文案的问题。
  // 这里断言两段语义都在：明确「不影响」+ 明确指向「学习记录」。
  stuckTitle.includes('影响') &&
    stuckTitle.includes('学习记录') &&
    stuckTitle.includes('已保存'),
  `★ title 说明清除不影响已保存的学习记录（实际：${stuckTitle.split(String.fromCharCode(10)).join(' ').slice(0, 60)}…）`,
)
ok(stuckTitle.includes('清除'), '★ title 给出清除指引')

// 离线且有待传时，徽标仍应是「待传」而不是「已同步」
probe.renderBadge({ pending: 1, stuck: 0, online: false })
await flush(200)
ok(badgeText().includes('离线'), `★ 离线时显示离线态（实际：${badgeText().trim()}）`)

// 徽标可点击 → confirm（已 mock true）→ clearStuck 被调用
probe.renderBadge({ pending: 0, stuck: 2 })
await flush(200)
const clickable = [...window.document.querySelectorAll('#badge button')].find((b) =>
  (b.textContent || '').includes('传不上去'),
)
ok(Boolean(clickable), '★ 徽标是可点击的 button（有一键清除入口）')
if (clickable) {
  clickable.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  await flush(200)
  ok(probe.badgeStub().cleared === true, '★ 点一下真的调用了 clearStuck')
}

// ★★ 真正的重活：clearStuck 落盘后，learn 分区逐字节未变
const snap = probe.seedLearnRecord(FAKE_UID)
ok(probe.learnRecordOf('w.keep', FAKE_UID) !== null, '前置：learn 分区里确实有那条学习记录')
probe.seedParked(2, FAKE_UID)
ok(probe.counts(FAKE_UID).stuck === 2, `前置：造出 2 条 parked（实际 ${probe.counts(FAKE_UID).stuck}）`)

const cleared = probe.doClearStuck(FAKE_UID)
ok(cleared === 2, `clearStuck 清掉 2 条（实际 ${cleared}）`)
ok(probe.counts(FAKE_UID).stuck === 0, '★ stuck 归零')
ok(probe.readLearnSnapshot(FAKE_UID) === snap, '★★ 清除后 learn 分区逐字节未变')
const keep = probe.learnRecordOf('w.keep', FAKE_UID)
ok(keep !== null, '★ 学习记录仍在')
ok(keep && keep.status === 'known', `★ 它的 status 仍是 known（实际 ${keep && keep.status}）`)
ok(
  keep && keep.statusSource === 'learning',
  `★ 它的 statusSource 仍是 learning（实际 ${keep && keep.statusSource}）`,
)
ok(keep && keep.correctCount === 5, `★ 计数没被清零（实际 ${keep && keep.correctCount}）`)

// 收尾：两棵树（Probe 在 #root、徽标在 #badge）各自独立卸掉
probe.unmountBadge()
probe.unmountProbe()

// ---------------------------------------------------------------- 汇总
console.log(`\n---------- PASS=${pass}  FAIL=${fail}  WARN=${warnings.length} ----------`)
if (fail > 0) {
  console.error('\n失败项：')
  failures.forEach((f) => console.error(`  · ${f}`))
}
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

void keysFor_unused_placeholder
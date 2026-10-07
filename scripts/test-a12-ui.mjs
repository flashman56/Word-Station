/**
 * A-12 信号链的 UI 级验证（jsdom + 真React + 真组件）
 * ------------------------------------------------------------------
 * 跑：npm run test:a12-ui
 *
 * 为什么单独一个 harness 而不塞进 qa-harness：
 *   qa-harness 驱动的是整个 App（词库16MB、懒加载 chunk、多个视图），
 *   走一遍答题路径要跨若干次异步渲染，时序脆弱 —— 测「写盘失败可见」这件事
 *   本身并不需要那么大的场景。这里只挂 useLearn + SyncBadge 两个真组件，
 *   把「persist 失败 → onStorageError → setStorageError → 徽标第六态」
 *   这条链**完整且确定性地**跑一遍。
 *
 * ★ 验收的是「失败确实发生了」而不是「没有失败」★
 *   一个「测了等于没测」的写法是只断言页面没出现告警 —— 那在 persist 根本没
 *   被调用、或 catch 又被吞掉的实现下同样会通过。所以第一条断言就是
 *   「setItem 确实抛了 N 次」，N = 0 直接判 FAIL。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.a12-bundle.mjs')
const ENTRY = resolve('scripts/a12-probe-entry.jsx')

// ---------------------------------------------------------------- jsdom 环境
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
// 游客态：没有 ownerId，徽标显示「本地模式」；但写盘失败告警仍应盖过它
// —— 因为「以为存上了其实没存」与是否登录无关。
globalThis.alert = () => {}

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})

const mod = await import(pathToFileURL(OUT).href)
const { mountProbe, unmountProbe, setStorageFailure, getQuotaThrows, getExports } = mod

/** 让 React 完成一次渲染 + 跑完 persist */
const flush = (ms = 90) => new Promise((r) => setTimeout(r, ms))

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

console.log('[test:a12-ui] 写盘失败必须可见（A-12 信号链端到端）\n')

// ---------------------------------------------------------------- 1) 正常路径先跑一遍
mountProbe()
await flush() // React 18 createRoot().render() 是异步的，必须让出一帧
let api = getExports()
const before = window.document.body.textContent || ''
ok(before.includes('本地模式'), `游客态初始显示「本地模式（游客）」（实际：${before.slice(0, 24)}…）`)
ok(!before.includes('本机存储已满'), '初始没有容量告警')

api.answer('w.probe', 'correct')
await flush()
const afterOk = window.document.body.textContent || ''
ok(!afterOk.includes('本机存储已满'), '正常写入后不应出现容量告警')
ok(getExports().records['w.probe'], '内存态有这条记录')
ok(getExports().storedRecords()['w.probe'], '★ 磁盘也写进去了（正常路径）')
unmountProbe()

// ---------------------------------------------------------------- 2) 配额写满
mountProbe()
await flush()
api = getExports()
setStorageFailure(true) // 让 learn 分区的 setItem 抛 QuotaExceededError

api.answer('w.full', 'correct')
await flush(120)

const quotaHits = getQuotaThrows()
ok(
  quotaHits > 0,
  `★ 前置：learn 分区写入确实抛了 QuotaExceededError（${quotaHits} 次）—— 为 0 说明本段等于没测`,
)

const afterFail = window.document.body.textContent || ''
ok(
  afterFail.includes('本机存储已满') && afterFail.includes('改动未保存'),
  `徽标进入第六态「本机存储已满 · 改动未保存」（实际：${afterFail.slice(0, 40)}…）`,
)

const badge = [...window.document.querySelectorAll('button, span')].find((b) =>
  (b.textContent || '').includes('本机存储已满'),
)
const title = badge ? badge.getAttribute('title') || '' : ''
ok(Boolean(title), '告警徽标带 title 展开说明')
ok(title.includes('刷新') && title.includes('丢失'), '★ 说明里提到「刷新会丢」—— 唯一能改变用户行为的信息')
ok(title.includes('导出 JSON'), '★ 说明里给出可执行的下一步（导出 JSON 备份）')
ok(title.includes('建议'), '★ 用「建议」而非命令')

// ★ 内存态必须保留：用户刚做的操作不能凭空消失
ok(Boolean(getExports().records['w.full']), '★ 写盘失败后内存态仍保留这条记录（用户操作没丢）')
ok(!getExports().storedRecords()['w.full'], '磁盘上确实没有（这正是必须告警的原因）')

// 导出的 JSON 必须包含刚答的那条（文案里「建议先导出 JSON 备份」的前提）
const exported = JSON.parse(getExports().exportJson())
ok(Boolean(exported.records['w.full']), '★ exportJson 导出的是内存态（含刚答的这条），导出备份才真的有用')

// ---------------------------------------------------------------- 3) 告警不是 toast
api.answer('w.full2', 'correct')
await flush(120)
const stillBad = window.document.body.textContent || ''
ok(
  stillBad.includes('本机存储已满'),
  '★ 告警持续存在（不是一次性 toast）—— 连续失败时不能自己消失',
)
ok(getQuotaThrows() > quotaHits, '第二次答题也确实又抛了一次')

// ---------------------------------------------------------------- 4) 恢复后告警消失
setStorageFailure(false)
api.answer('w.recovered', 'correct')
await flush(120)

const afterRecover = window.document.body.textContent || ''
ok(
  !afterRecover.includes('本机存储已满'),
  '★ 下一次 persist 成功后告警消失（onStorageError(null)）',
)
ok(getExports().storedRecords()['w.recovered'], '恢复后落盘成功')
ok(
  Object.keys(getExports().storedRecords()).length >= 3,
  `★ 恢复后一次性把内存里攒下的记录全写上（${Object.keys(getExports().storedRecords()).length} 条）`,
)

unmountProbe()

console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------\n`)
// 只删打包产物；ENTRY 是源码，必须留在仓库里
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

// 保留引用，避免 readFileSync 未使用告警
void readFileSync
void writeFileSync
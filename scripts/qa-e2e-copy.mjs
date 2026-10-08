/**
 * QA 专用 e2e 入口 —— 在 scripts/qa-harness-qa.jsx 上跑。
 *
 * ★ 为什么需要它（不是为了让测试变绿，而是为了看到崩溃背后藏着什么）★
 *   HEAD 上 `npm run test:e2e` 在「附加 B」抛 TypeError 并**中止**，
 *   于是 C~J 共约 60 条断言根本没执行 —— 其中包含 C-02 要看的
 *   MorphDetail / FocusView 的 BulkActionBar 三处调用点。
 *
 *   崩溃的根因是 harness 的两条断言编码了**本轮有意变更**的旧契约：
 *     ① 「全选当前结果（N）」 → A-07 改成「全选前 2000 个（当前结果 N 个）」
 *     ② 「已更新 N 个」        → A-14 改成按动作区分
 *   我在副本里按**新契约**改断言，且新断言比旧的更严
 *   （额外断言「文案数字 === 实写数字」「不超过上限」「括号真实命中数 == 侧栏」），
 *   不是放宽。原 harness（scripts/qa-harness.jsx）保持原样不动，
 *   其失败由 QA 报告如实记录，不在此"修"掉。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa-bundle-qa.mjs')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5179/',
  pretendToBeVisual: true,
})
const { window } = dom

globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', {
  value: window.navigator,
  configurable: true,
  writable: true,
})
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false

await esbuild.build({
  entryPoints: ['scripts/qa-harness-qa.jsx'],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})
console.log('[bundle] QA 副本打包完成\n')

const consoleIssues = []
const origError = console.error
const origWarn = console.warn
console.error = (...a) => {
  consoleIssues.push(['error', a.map(String).join(' ').slice(0, 300)])
}
console.warn = (...a) => {
  consoleIssues.push(['warn', a.map(String).join(' ').slice(0, 300)])
}

let code = 1
try {
  const mod = await import(pathToFileURL(OUT).href)
  const r = await mod.run()
  code = r.fail === 0 ? 0 : 1
} catch (e) {
  console.error('\n!!! 运行异常：\n', e && e.stack ? e.stack : e)
  code = 1
} finally {
  console.error = origError
  console.warn = origWarn
  console.log(`\n=== 控制台告警：${consoleIssues.length} 条 ===`)
  try {
    unlinkSync(OUT)
  } catch {}
  process.exit(code)
}

/**
 * 端到端回归测试入口（长期保留，不要删）
 *
 * 做法：搭一个 jsdom 环境 → 用 esbuild 把 scripts/qa-harness.jsx（真实引入 src/App.jsx）
 * 打包成临时 esm → 在 Node 里 import 执行。渲染的是项目里的真组件、真 hooks、真 React 18，
 * 派发的也是真实 DOM 事件，不是逻辑复刻。
 *
 * 覆盖场景（详见 qa-harness.jsx）：
 *   1. 列表视图渲染 + 行首复选框
 *   2. 勾选 2 个词 → 批量「标为已掌握」：左栏统计、localStorage、行按钮高亮、条内 flash 反馈
 *   3. 「清除标注」退回自动判定，localStorage 无残留脏 key
 *   4. Shift 连续选：区间选满 + 按锚点状态整段取消
 *   5. 「全选当前结果」跨词群去重，且与左栏「可见单词」口径一致
 *   6. 批量「标为待复习」→ 再清除，统计归零
 *   7. 折叠词群后 Shift 区间只覆盖展开可见的行
 *   8. 右栏 MorphDetail 的 全选 / 反选 / 清空（验证 checked/onToggleCheck 没漏传）
 *   9. 聚焦视图：Ctrl+点节点加入多选、蓝色虚线描边、普通点击仍打开详情
 *   10. 全程捕获 console.error / console.warn，React 警告会打印出来，按 fail 计数
 *
 * 怎么执行：
 *   npm run test:e2e      # 依赖已固化在 devDependencies（jsdom + esbuild），无需额外安装
 *   node scripts/qa-react-e2e.mjs
 *
 * 退出码：0 = 全部通过，1 = 有用例失败或运行异常。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa-bundle.mjs')

// 1) jsdom 环境
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5178/',
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

// 2) 打包真实源码
await esbuild.build({
  entryPoints: ['scripts/qa-harness.jsx'],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})
console.log('[bundle] 打包完成，真实引入 src/App.jsx 及其全部子组件/hooks\n')

// 2.5) 捕获 React 警告 / 错误
const consoleIssues = []
const origError = console.error
const origWarn = console.warn
console.error = (...a) => {
  consoleIssues.push(['error', a.map(String).join(' ').slice(0, 300)])
}
console.warn = (...a) => {
  consoleIssues.push(['warn', a.map(String).join(' ').slice(0, 300)])
}

// 3) 运行
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
  console.log(`\n=== 控制台告警检查：捕获到 ${consoleIssues.length} 条 ===`)
  consoleIssues.forEach(([lv, m]) => origError(`  [${lv}] ${m}`))
  if (consoleIssues.length === 0) origError('  （无 React 警告 / 错误）')
  try {
    unlinkSync(OUT)
  } catch {}
  process.exit(code)
}

/**
 * QA 报出的 3 个源码 bug 的回归测试（真渲染，jsdom + 真 React）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-regress-fixes.mjs
 *
 * ★★★ 这三个 bug 的共性，值得写在这里当作方法论 ★★★
 *   **全部都是「我之前的断言没渲染那个组件」。**
 *
 *   Bug 1（白屏）：我只对 App.jsx 源码做正则匹配，检查「`{...addToStationProps}`
 *     这个字符串在不在」—— 字符串在，但**作用域不成立**（MorphDetail 是顶层函数，
 *     拿不到 AppShell 的变量）。它能过 `npm run build`（esbuild 不做作用域分析）、
 *     能过我的 14 条源码纪律断言、能过全绿的 test:cloud。
 *     **只有真的把 MorphDetail 渲染出来，ReferenceError 才会现形。**
 *
 *   Bug 2/3（C-04）：我只断言了「下拉头有 K2 口径」和「汇总含 skipped」，
 *     从没断言「✓ 已在那一项本身 disabled / 只标当前小站」。
 *
 *   ⇒ 两条教训，已在文件末尾的「源码纪律」断言里钉成不变量：
 *     ① 凡「某组件用了新 prop」，必须**渲染那个组件**来验；
 *     ② 凡「新增了一个 UI 状态」，必须断言**那个状态本身**，
 *        而不是它旁边的说明文字。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.regress-bundle.mjs')
const ENTRY = resolve('scripts/qa-regress-probe.jsx')
const MOCK_CLOUD = resolve('scripts/t04-mock-cloud.js')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5184/',
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

/**
 * React 18 的并发 root（createRoot）在渲染失败时，会把异常**异步重抛**到
 * process 的 uncaughtException —— 不是同步 throw。
 *
 * ★ 为什么必须在这里收着 ★
 *   不收的话，「故障版」的 ReferenceError 会直接**崩掉整个测试进程**，
 *   后面的断言一条都跑不到 —— 那正是 QA 那次看到白屏的机制。
 *   而「崩了」绝不能被当成「测试通过」，所以收下之后必须 assert 它
 *   确实是 ReferenceError（见下面的 captured 断言）。
 */
const asyncRenderErrors = []
process.on('uncaughtException', (e) => {
  asyncRenderErrors.push(e)
})

/** 取出「本场景内」捕获到的渲染异常（先清空再渲染，避免串场） */
function drainAsyncRenderErrors() {
  const out = asyncRenderErrors.slice()
  asyncRenderErrors.length = 0
  return out
}

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 'regress-mocks',
      setup(build) {
        // ★ 按文件名匹配（同一模块在不同文件里的 import 写法不同）★
        build.onResolve({ filter: /(^|\/)(userWords|generate|offline|stationWords|stations)\.js$/ }, () => ({
          path: MOCK_CLOUD,
        }))
      },
    },
  ],
  logLevel: 'warning',
})

const bundle = await import(pathToFileURL(OUT).href)
const { mountBroken, mountFixed, mountMenu, unmount } = bundle

const flush = (ms = 90) => new Promise((r) => setTimeout(r, ms))

let pass = 0
let fail = 0
function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    console.error(`  ✗ ${msg}`)
  }
}

console.log('[qa-regress-fixes] QA 报出的 3 个 bug 的回归（真渲染）\n')

// ================================================================ 前置自检

function selfCheck() {
  console.log('— 前置自检：探针与替身真的在 bundle 里')
  const t = readFileSync(OUT, 'utf8')
  ok(t.includes('mountBroken') && t.includes('mountMenu'), '★ 探针导出在 bundle 里')
  ok(
    !t.includes("from '../lib/supabase.js'"),
    '★ 真 supabase 客户端不在 bundle 里（否则会真发网络请求）',
  )
}

// ================================================================ Bug 1：MorphDetail 白屏

async function scenarioMorphDetailScope() {
  console.log('\n— Bug 1：MorphDetail 里 addToStationProps 的作用域（QA 报的白屏）')

  // ---- 第一步：证明「故障版」挂上真 React 真的会炸 ----
  drainAsyncRenderErrors()
  unmount()
  try {
    mountBroken({ selectedIds: new Set(['w.a']) })
    await flush(60)
  } catch (e) {
    asyncRenderErrors.push(e)
  }
  unmount()
  const captured = drainAsyncRenderErrors().find((e) => e instanceof ReferenceError) || null
  const desc = captured ? `${captured.name}: ${captured.message}` : '没炸'
  ok(
    Boolean(captured),
    `★ 前置：真 React 渲染「未解构」的那一版确实炸 ReferenceError（实际：${desc}）`,
  )
  ok(
    /addToStationProps/.test(String(captured && captured.message)),
    '★ 报错点名 addToStationProps（确认就是这个变量，不是别的）',
  )

  // ---- 第二步：修复后的 MorphDetail 结构必须渲染成功 ----
  drainAsyncRenderErrors()
  unmount()
  let renderThrew = null
  try {
    mountFixed({ selectedIds: new Set(['w.a', 'w.b']), addToStationProps: { addToStation: true } })
    await flush()
  } catch (e) {
    renderThrew = e
    asyncRenderErrors.push(e)
  }
  ok(!renderThrew, `★ 修复后的 MorphDetail 渲染不抛（实际：${renderThrew ? renderThrew.message : '无'}）`)
  const leftover = drainAsyncRenderErrors()
  ok(
    leftover.length === 0,
    `★ 没有异步重抛的渲染异常（实际 ${leftover.length} 条：${leftover.map((e) => e && e.message).join(' | ')}）`,
  )
  ok(
    (window.document.body.textContent || '').includes('已选 2 个'),
    '★ 批量操作栏真的渲染出来了（已选 2 个）',
  )
  unmount()
}

// ================================================================ Bug 2/3：C-04「✓ 已在」

const STATIONS = [
  { id: 'station-1', name: '雅思', pinned: true },
  { id: 'station-2', name: '论文阅读', pinned: false },
]

/** 打开下拉并返回两个小站项（按「含站名」过滤，避开「加入小站」触发按钮） */
async function openMenu() {
  const toggle = [...window.document.querySelectorAll('button')].find((b) =>
    (b.textContent || '').includes('加入小站'),
  )
  if (!toggle) throw new Error('找不到「加入小站」触发按钮')
  toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  await flush()
  return [...window.document.querySelectorAll('button')].filter((b) => {
    const t = (b.textContent || '').trim()
    return t.includes('雅思') || t.includes('论文阅读')
  })
}

async function scenarioInHereMarker() {
  console.log('\n— Bug 2/3：C-04「✓ 已在」—— 只标当前小站，且不可点')

  drainAsyncRenderErrors()
  unmount()
  mountMenu({
    wordKeys: ['w.x'],
    sources: ['public'],
    stations: STATIONS,
    existingKeys: new Set(['w.x']), // 该词已在「雅思」（= currentStationId）
    currentStationId: 'station-1',
    currentStationName: '雅思',
  })
  await flush()
  const items = await openMenu()

  ok(items.length === 2, `★ 下拉里有 2 个小站项（实际 ${items.length}）`)

  const marks = items.filter((b) => (b.textContent || '').includes('✓ 已在'))
  ok(
    marks.length === 1,
    `★★ 只标 1 个「✓ 已在」，不是每个站都标（实际标了 ${marks.length} 个）—— Bug 2（QA 实测是 2 个）`,
  )

  const current = items.find((b) => (b.textContent || '').includes('雅思'))
  const other = items.find((b) => (b.textContent || '').includes('论文阅读'))
  ok(
    Boolean(current) && (current.textContent || '').includes('✓ 已在'),
    '★ 标在**当前小站**（雅思）那一项',
  )
  ok(
    Boolean(other) && !(other.textContent || '').includes('✓ 已在'),
    '★ 别的站（论文阅读）不标「✓ 已在」',
  )
  ok(
    Boolean(current) && current.disabled === true,
    `★★ 当前小站那一项**不可点**（实际 disabled=${current && current.disabled}）—— Bug 3 / PRD C-04 / US-C3`,
  )
  ok(
    Boolean(other) && other.disabled === false,
    `★ 别的站仍可点（disabled=${other && other.disabled}）—— 不阻断「加到其他站」这条主路径`,
  )
  unmount()
}

async function scenarioNotInCurrent() {
  console.log('\n— 边界：词不在任何小站 → 两个站都可点、都无「✓ 已在」')
  drainAsyncRenderErrors()
  unmount()
  mountMenu({
    wordKeys: ['w.x'],
    sources: ['public'],
    stations: STATIONS,
    existingKeys: new Set(),
    currentStationId: 'station-1',
    currentStationName: '雅思',
  })
  await flush()
  const items = await openMenu()
  ok(!items.some((b) => (b.textContent || '').includes('✓ 已在')), '★ 无任何「✓ 已在」标记')
  ok(items.length === 2 && items.every((b) => !b.disabled), '★ 两个站都可点（否则会把「加入其他站」也堵死）')
  unmount()
}

async function scenarioMultiNoMark() {
  console.log('\n— 边界：批量时不标「✓ 已在」（逐词不同，不能一刀切）')
  drainAsyncRenderErrors()
  unmount()
  mountMenu({
    wordKeys: ['w.x', 'w.y'],
    sources: ['public', 'public'],
    stations: STATIONS,
    existingKeys: new Set(['w.x']), // 只有 w.x 在
    currentStationId: 'station-1',
    currentStationName: '雅思',
  })
  await flush()
  const items = await openMenu()
  ok(
    !items.some((b) => (b.textContent || '').includes('✓ 已在')),
    '★ 批量时完全不标（w.y 还没在，标了会误导）',
  )
  ok(items.length === 2 && items.every((b) => !b.disabled), '★ 批量时两个站都可点')
  unmount()
}

// ================================================================ 源码纪律

function sourceDiscipline() {
  console.log('\n— 源码纪律：把这次的教训钉成不变量')
  const app = readFileSync(resolve('src/App.jsx'), 'utf8')
  const menu = readFileSync(resolve('src/components/AddToStationMenu.jsx'), 'utf8')

  // ★ Bug 1 的不变量：MorphDetail 必须解构出 addToStationProps ★
  const mdStart = app.indexOf('function MorphDetail(')
  ok(mdStart !== -1, '找得到 MorphDetail')
  const mdSig = app.slice(mdStart, app.indexOf(') {', mdStart))
  ok(
    /addToStationProps\s*=\s*EMPTY_ADD_PROPS/.test(mdSig),
    '★★ MorphDetail 的参数列表里必须有 addToStationProps（否则渲染即白屏，且 build / 静态断言都发现不了）',
  )
  const callStart = app.lastIndexOf('<MorphDetail', mdStart)
  ok(
    /addToStationProps=\{addToStationProps\}/.test(app.slice(callStart, app.indexOf('/>', callStart))),
    '★ MorphDetail 的调用点必须传 addToStationProps',
  )

  // ★ Bug 2/3 的不变量 ★
  ok(
    /const inHere = !isMulti && s\.id === currentStationId && existing\.has\(keys\[0\]\)/.test(menu),
    '★★ inHere 必须同时限定「批量否」+「当前小站」+「在 refs 里」—— 少一条就会每个站都标',
  )
  ok(
    /disabled=\{busy \|\| inHere\}/.test(menu),
    '★★ 已「✓ 已在」的那项必须 disabled（PRD C-04 / US-C3）',
  )

  // ★ e2e harness：契约断裂必须显式失败，不能静默吞掉后续用例 ★
  const h = readFileSync(resolve('scripts/qa-harness.jsx'), 'utf8')
  ok(/function mustFind\(/.test(h), '★ e2e harness 必须有 mustFind（找不到元素就记 FAIL 并中止）')
  ok(/E2EContractBreak/.test(h), '★ 契约断裂要与「代码 bug」区分开')
  ok(
    !/const allBtn = byText\('button', '全选当前结果'\)/.test(h),
    '★ 不许再用整串 byText 找「全选当前结果」（A-07 改了文案，那正是崩因）',
  )
  ok(/已标记 2 个已掌握/.test(h), '★ e2e harness 的 flash 断言要跟 A-14 的新文案一致')
  const e2e = readFileSync(resolve('scripts/qa-react-e2e.mjs'), 'utf8')
  ok(/isContract/.test(e2e), '★ qa-react-e2e 必须能识别契约断裂并说清「后续用例未执行」')
}

async function main() {
  selfCheck()
  await scenarioMorphDetailScope()
  await scenarioInHereMarker()
  await scenarioNotInCurrent()
  await scenarioMultiNoMark()
  sourceDiscipline()

  console.log(`\n通过 ${pass} · 失败 ${fail}`)
  try {
    unlinkSync(OUT)
  } catch {
    /* ignore */
  }
  process.exit(fail === 0 ? 0 : 1)
}

main()

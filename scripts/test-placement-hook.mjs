/**
 * test:placement-hook —— 起点测评**整链路**（hook + 组件 + 真实词库）回归
 * ------------------------------------------------------------------
 * 运行：node scripts/test-placement-hook.mjs（建议并入 test:cloud）
 *
 * ★ 为什么要这个测试 ★
 *   test:placement-ui 把 items 作为 prop 直接喂给 PlacementTest，永远走不到
 *   usePlacement 内部的 items 提取逻辑 —— 于是「session 落的是 {probe:{items}}
 *   但 hook 读的是 probe.items」这种形状错位，单测全绿却线上永久卡在
 *   「暂时出不了题，请稍后再试。」。本测试用**真实词库**渲染一个用 usePlacement
 *   的壳组件，点「开始」后断言真的出了一道题，把那条唯一的真实链路钉死。
 *
 * 脚手架与 test-placement-ui.mjs 同一套（jsdom + 真 React 18 + esbuild 现打包）。
 */
import { JSDOM } from 'jsdom'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'

let pass = 0
const failures = []
const ok = (cond, name, detail = '') => {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const section = (t) => console.log(`\n${t}`)

// ---------------------------------------------------------------- jsdom 脚手架
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.localStorage = dom.window.localStorage
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const esbuild = await import('esbuild')
const { default: React } = await import('react')
const { createRoot } = await import('react-dom/client')
const { act } = await import('react')

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'scripts', '.test-placement-hook-tmp')
mkdirSync(OUT, { recursive: true })

async function loadModule(entryRel) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    define: { 'process.env.NODE_ENV': '"development"' },
    absWorkingDir: ROOT,
  })
  const f = path.join(OUT, entryRel.replace(/[\\/]/g, '__').replace(/\.jsx?$/, '.mjs'))
  writeFileSync(f, result.outputFiles[0].text)
  return import(`file://${f}?v=${Date.now()}${Math.random()}`)
}

const { usePlacement } = await loadModule('src/hooks/usePlacement.js')
const { buildBands } = await import('../src/hooks/useLearn.js')
const { default: PlacementTest } = await loadModule('src/components/PlacementTest.jsx')
let WORDS = null
try {
  ;({ default: WORDS } = await loadModule('src/data/words-entry.js'))
} catch (e) {
  console.error('[test:placement-hook] 词库打包失败：', e && e.message)
  process.exit(1)
}

// ---------------------------------------------------------------- 真实词库 → bands
const maxRank = WORDS.reduce(
  (m, w) => (w && typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) && w.freqRank > m ? w.freqRank : m),
  0,
)
const BANDS = buildBands(maxRank)
section('H0. 词库与分档就绪')
ok(Array.isArray(WORDS) && WORDS.length > 1000, `词库加载成功（${WORDS.length} 词）`)
ok(maxRank > 20000, `最大词频序号 ${maxRank}（足以撑出多档）`)
ok(BANDS.length > 5, `难度档生成 ${BANDS.length} 档（含「全部」）`)

// ---------------------------------------------------------------- 壳组件：把 hook 接到组件
function Harness() {
  const placement = usePlacement(WORDS, BANDS, 'test-scope-hook')
  return React.createElement(PlacementTest, {
    ...placement,
    onStart: placement.start,
    onAnswer: placement.answer,
    onConfirm: placement.confirm,
    onUndo: placement.undo,
    onRetake: placement.retake,
    onCancel: placement.cancel,
    onApplyBand: () => {},
    activeBandId: null,
  })
}

section('H1. 点「开始」真的出第一道题（自适应：首题从中段词频开始，不再固定 40 题）')
{
  const container = document.createElement('div')
  document.body.appendChild(container)
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(React.createElement(Harness))
  })
  const txt0 = container.textContent || ''
  ok(txt0.includes('从哪一档开始背'), '入口态：显示起点测评说明')
  const startBtn = [...container.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '开始')
  ok(Boolean(startBtn), '入口态：有「开始」按钮')

  // 点击「开始」—— 自适应流程：start() 用 pickNextPlacementWord 出首题（首题从中段词频起），
  // current 被设置，running 生效，组件渲染作答态（不再卡「暂时出不了题」）。
  await act(async () => {
    startBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  const txt1 = container.textContent || ''
  ok(!txt1.includes('暂时出不了题'), '★ 点开始后不再卡在「暂时出不了题」')
  ok(txt1.includes('第 1 题'), '★ 点开始后进入作答态（显示「第 1 题」）')
  ok(txt1.includes('已答 0'), '★ 已答数为 0（自适应，题量不固定、不预填 40）')
  ok([...container.querySelectorAll('button')].some((b) => (b.textContent || '').includes('认识')), '作答按钮出现（认识/不认识/不确定）')
  ok(txt1.includes('凭第一反应就好'), '自适应提示：凭第一反应')

  await act(async () => root.unmount())
  document.body.removeChild(container)
}

// ---------------------------------------------------------------- 汇总
console.log(`\n${'-'.repeat(60)}`)
if (failures.length === 0) {
  console.log(`[test:placement-hook] ✓ 通过（${pass} 条断言）`)
  console.log('  真实词库整链路：hook 出题 → 组件渲染第一题')
  try {
    renameSync(OUT, `${OUT}-done`)
  } catch {}
  process.exit(0)
}
console.error(`[test:placement-hook] ✗ 失败（${failures.length}/${pass + failures.length} 条）\n`)
failures.forEach((f) => console.error(`  ✗ ${f.name}${f.detail ? `\n      ${f.detail}` : ''}`))
try {
  renameSync(OUT, `${OUT}-done`)
} catch {}
process.exit(1)

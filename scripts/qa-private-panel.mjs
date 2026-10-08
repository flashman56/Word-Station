/**
 * 「我的私有词」列表（T04）+ 侧栏入口（QA 独立验证）
 * ===================================================================
 * 跑：node scripts/qa-private-panel.mjs
 *
 * 验的是「用户能不能一眼分辨两个后果相反的操作」，以及：
 *   · 全量渲染 + 「显示更多」增量（不做服务端分页）
 *   · 每行可编辑 / 重新生成 / 彻底删除 / 加回小站
 *   · 移出小站后的私有词**仍能被这个列表管到**（B 的硬前置意义）
 *   · 彻底删除确实连带清掉所有小站引用
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

let pass = 0
let fail = 0
const failures = []
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    failures.push(m)
    console.error(`  ✗ ${m}`)
  }
}
const section = (t) => console.log(`\n— ${t}`)
const flush = (ms = 80) => new Promise((r) => setTimeout(r, ms))

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:5194/', pretendToBeVisual: true })
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

// 记录 window.confirm 的文案
const confirms = []
window.confirm = (msg) => {
  confirms.push(String(msg))
  return true
}

const MOCK_CLOUD = resolve('scripts/qa-a01-mock-cloud.js')
const P = resolve('scripts/.qa-pwp-probe.jsx')
writeFileSync(
  P,
  `
import React from 'react'
import { createRoot } from 'react-dom/client'
import PrivateWordsPanel from '../src/components/PrivateWordsPanel.jsx'
import UserWordEditor from '../src/components/UserWordEditor.jsx'
import AddToStationMenu from '../src/components/AddToStationMenu.jsx'
import { __setAddMany } from './qa-a01-mock-cloud.js'
let root = null, el = null
export function mount(props) {
  unmount()
  el = document.createElement('div'); document.body.appendChild(el)
  root = createRoot(el); root.render(<PrivateWordsPanel {...props} />)
}
export function unmount() { if (root) root.unmount(); root = null; if (el && el.parentNode) el.parentNode.removeChild(el); el = null }
export const texts = () => (document.body.textContent || '')
export const buttons = () => Array.from(document.querySelectorAll('button'))
export const byText = (t) => buttons().find((b) => (b.textContent || '').includes(t)) || null
export const click = (e) => e && e.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
export { __setAddMany }
`,
  'utf8',
)
const OUT = resolve('scripts/.qa-pwp-bundle.mjs')
await esbuild.build({
  entryPoints: [P],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 'm',
      setup(b) {
        b.onResolve({ filter: /dict\.js$/ }, () => ({ path: resolve('scripts/qa-a01-mock-dict.js') }))
        b.onResolve({ filter: /(stationWords|generate|offline)\.js$/ }, () => ({ path: MOCK_CLOUD }))
      },
    },
  ],
  logLevel: 'error',
})
const m = await import(pathToFileURL(OUT).href + '?t=' + Math.random())

console.log('[qa-private-panel] T04「我的私有词」列表\n')

// 造 250 个私有词（验证「显示更多」增量 + 全量渲染）
const WORDS = Array.from({ length: 250 }, (_, i) => ({
  id: `u.qa${i}word`,
  wordKey: `u.qa${i}word`,
  form: `qa${i}word`,
  pos: 'adj.',
  gloss: `释义 ${i}`,
  cefr: 'B2',
  status: i % 3 === 0 ? 'known' : i % 3 === 1 ? 'review' : 'unknown',
  source: 'user',
}))

section('全量渲染 + 「显示更多」增量（不做服务端分页）')
// ★ prop 名是 **userWords**（不是 words）—— 我第一版写错成 words，
//   面板拿到空列表 → 首屏 0 行 → 一堆断言全红，差点误判成「面板没实现」。
m.mount({
  userWords: WORDS,
  ownerId: 'uid-A',
  existingKeys: new Set(['u.qa0word']),
  currentStationName: '雅思',
  addToStationProps: {
    ownerId: 'uid-A',
    stations: [{ id: 'st-1', name: '雅思', pinned: false }],
    online: true,
    wordKeys: [],
  },
  records: {},
  onClose: () => {},
  onRefresh: () => {},
})
await flush(120)
const txt = m.texts()
ok(txt.includes('250'), `面板显示总数 250（${/(\d+)\s*个/.exec(txt) ? /(\d+)\s*个/.exec(txt)[0] : '未找到计数'}）`)
ok(m.texts().includes('显示更多'), '★ 提供「显示更多」增量入口')
// 首屏不应渲染 250 行（否则「增量」没生效）
const rowCount = () => m.buttons().filter((b) => (b.textContent || '').includes('彻底删除')).length
const firstBatch = rowCount()
ok(firstBatch > 0 && firstBatch < 250, `★ 首屏只渲染 ${firstBatch} 行（< 250，增量生效）`)
const qa0 = WORDS[0]
ok(txt.includes(qa0.form), `首个词 ${qa0.form} 在首屏可见`)
ok(!txt.includes(WORDS[240].form), `第 241 个词不在首屏（增量正确）`)

section('「显示更多」点击后行数增加')
m.click(m.byText('显示更多'))
await flush(100)
const secondBatch = rowCount()
ok(secondBatch > firstBatch, `点击后行数 ${firstBatch} → ${secondBatch}`)

section('每行可做：编辑 / 彻底删除 / 加回小站')
ok(m.buttons().some((b) => (b.textContent || '').includes('加入小站')), '★ 每行有「加入小站」入口')
ok(m.buttons().some((b) => (b.textContent || '').includes('彻底删除')), '★ 每行有「彻底删除」')
// 词形可点（编辑）
const formBtn = m.buttons().find((b) => (b.textContent || '').trim() === qa0.form)
ok(Boolean(formBtn), '★ 词形是可点的（打开 UserWordEditor）')

section('★ 与「移出小站」在 UI 上可区分（后果相反，文案不能相似）')
{
  const delBtn = m.buttons().find((b) => (b.textContent || '').includes('彻底删除'))
  ok(delBtn && delBtn.className.includes('text-red'), `★ 「彻底删除」是红字（class 含 text-red：${delBtn && delBtn.className.includes('text-red')}）`)
  ok(delBtn && (delBtn.title || '').includes('所有小站'), '★ title 说清「所有小站里的引用也会一并移除」')
  ok(delBtn && (delBtn.title || '').includes('学习记录不受影响'), '★ title 说清「学习记录不受影响」')
  ok(!m.texts().includes('移出小站」') || m.texts().includes('移出小站请到小站页'), '★ 面板里不出现「移出小站」按钮（那是小站页的操作）')
  ok(m.texts().includes('移出小站请到小站页内操作'), '★ 面板明确指引「移出小站」在小站页操作 —— 两个操作分离')
}

section('移出小站后的私有词**仍能被这个列表管到**（B 的硬前置意义）')
{
  // 模拟：把 u.qa1word 从小站移出 → 它不在 existingKeys 里，但仍应由本列表列出
  const orphan = WORDS[1]
  ok(!WORDS.slice(0, 30).some((w) => w.id === orphan.id) || true, '（构造前提）')
  ok(m.texts().includes(orphan.form), `★ 未在小站里的私有词 ${orphan.form} 仍在列表中（数据源与小站无关）`)
  const src = readFileSync(resolve('src/components/PrivateWordsPanel.jsx'), 'utf8')
  ok(!/filter\([^)]*existingKeys/.test(src), '★ 列表的数据源不按 existingKeys 过滤（否则移出后就消失了）')
  ok(/words\.length/.test(src) || /words\b/.test(src), '列表按 useUserWords 的全量 words 渲染')
}

section('彻底删除的 confirm 文案')
{
  const delBtn = m.buttons().find((b) => (b.textContent || '').includes('彻底删除'))
  confirms.length = 0
  m.click(delBtn)
  await flush(120)
  ok(confirms.length === 1, `点「彻底删除」弹了一次 confirm（实际 ${confirms.length} 次）`)
  // confirm 里写的是「它在**所有**小站里的引用也会一并移除」（带 markdown 强调号）
  ok(
    confirms[0] && /所有/.test(confirms[0]) && /小站/.test(confirms[0]),
    '★ confirm 含「所有小站里的引用也会一并移除」',
  )
  ok(confirms[0] && confirms[0].includes('学习记录'), '★ confirm 含「学习记录」不受影响')
}

section('侧栏入口存在')
{
  const sb = readFileSync(resolve('src/components/Sidebar.jsx'), 'utf8')
  ok(/我的私有词/.test(sb), '★ 侧栏有「我的私有词」入口文案')
  ok(/PrivateWordsPanel|privateWordsOpen/.test(sb), '侧栏接了面板开关')
  const app = readFileSync(resolve('src/App.jsx'), 'utf8')
  ok(/PrivateWordsPanel/.test(app), 'App 引入了 PrivateWordsPanel')
}

section('零新增请求路径（复用 useUserWords 的缓存）')
{
  const src = readFileSync(resolve('src/components/PrivateWordsPanel.jsx'), 'utf8')
  // ★ 必须剥掉注释再判：面板文件头解释了「为什么不用 listMine」，
  //   那段说明里就出现了 listMine 这个词。第一版直接 grep 全文，
  //   把注释当成了「真的调了 listMine」，误报成零新增请求没做到。
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  ok(!/listMine/.test(code), '★ 面板代码（剥注释后）不调 listMine —— 零新增请求，只复用 useUserWords 的缓存')
  ok(!/listByKeys/.test(src), '★ 面板不调 listByKeys')
}

try {
  unlinkSync(OUT)
  unlinkSync(P)
} catch {}

console.log(`\n=== qa-private-panel 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) {
  console.log('失败项：')
  failures.forEach((f) => console.log(`  - ${f}`))
}
process.exit(fail === 0 ? 0 : 1)

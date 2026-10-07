/**
 * 补上两个实现者自己标记的缺口（QA 独立验证）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-gaps.mjs
 *
 * GAP-8：私有词 >500 显示 B-8 提示、≤500 不显示
 *   之前只做了纯函数断言（computeIncludesPrivate(501) === false），
 *   从没让**真组件**在 501 个真私有词下渲染过。
 *   本文件把 LearnHome + VocabCard + estimateVocabulary + toUserWordView
 *   串起来，用 500 / 501 两个真实边界各跑一遍，断言提示的**有无**与**文案**。
 *
 * GAP-C：真实云端 A→登出→B 连跑 50 次
 *   见配套的 scripts/qa2-cloud-e2e.mjs --loops N（本文件不含网络部分）。
 */

import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa2-gaps-bundle.mjs')
const ENTRY = resolve('scripts/qa2-gaps-probe.jsx')

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5182/',
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
const flush = (ms = 150) => new Promise((r) => setTimeout(r, ms))
const body = () => window.document.body.textContent || ''

console.log('[qa2:gaps] 补测实现者标记的两个缺口\n')

// ================================================================ GAP-8
section('GAP-8  私有词 500 / 501 边界（B-8 提示的有无）')

// ---- 恰好 500：不显示提示
await probe.renderWithPrivate(500)
await flush()
let txt = body()
ok(
  !txt.includes('暂不含私有词'),
  `★ 500 个私有词：**不**显示 B-8 提示（实际含提示：${txt.includes('暂不含私有词')}）`,
)
ok(
  txt.includes('含 500 个私有词'),
  `★ 500 个私有词：仍显示「含 500 个私有词」（B-3 注脚不受护栏影响）`,
)

// ---- 501：显示提示
await probe.renderWithPrivate(501)
await flush()
txt = body()
ok(
  txt.includes('暂不含私有词'),
  `★ 501 个私有词：**显示** B-8 提示（实际：${txt.includes('暂不含私有词')}）`,
)
ok(
  txt.includes('私有词较多'),
  '★ 提示文案是「私有词较多，词汇量估算暂不含私有词」',
)
// ★ 阈值 500 不暴露：**要看 B-8 提示那一句本身**，不能扫全文 ——
//   页面上本来就有「含 501 个私有词」这种注脚（B-3 的「有几个私有词」，
//   那个数字是个数、不是阈值）。而且 textContent 里**没有换行**，
//   正则没法切句（我第一版栽在这：正则把整页都吞进来 → 假失败两次）。
//   正确做法：直接取渲染出的那个 <p> 元素的 textContent。
const b8El = [...window.document.querySelectorAll('#root p')].find(
  (e) => (e.textContent || '').includes('暂不含私有词'),
)
const b8Line = b8El ? b8El.textContent : ''
ok(
  !b8Line.includes('500'),
  `★ B-8 提示语里不含阈值 500（实际该句：「${b8Line}」）`,
)
ok(
  /私有词较多[，,]词汇量估算暂不含私有词/.test(txt),
  `★ 提示是完整一句话，不是干巴巴一个数字（实际：「${b8Line}」）`,
)
ok(
  txt.includes('含 501 个私有词'),
  '★ 501 个私有词：「含 N 个私有词」注脚照样显示（B-3 与 B-8 相互独立）',
)

// ---- 护栏生效的实质：估算输入确实回退到公共词（不只是多了行字）
const at500 = await probe.renderWithPrivate(500)
await flush()
const vocabAt500 = probe.vocabNumber()
const at501 = await probe.renderWithPrivate(501)
await flush()
const vocabAt501 = probe.vocabNumber()
ok(Number.isFinite(vocabAt500), `500 个私有词时估算有数值（${vocabAt500}）`)
ok(Number.isFinite(vocabAt501), `501 个私有词时回退后仍有数值（${vocabAt501}）`)
ok(
  vocabAt501 !== vocabAt500,
  `★ 跨过阈值后估算值确实变了（500 → ${vocabAt500}，501 → ${vocabAt501}）—— 护栏不只是文案`,
)
ok(
  vocabAt501 < vocabAt500,
  `★ 501 时回退到公共词、估算值下降（${vocabAt500} → ${vocabAt501}）`,
)

// ---- 大规模：2000 个私有词也不能崩
await probe.renderWithPrivate(2000)
await flush()
ok(body().includes('暂不含私有词'), '★ 2000 个私有词：仍显示提示、页面不崩')
ok(Number.isFinite(probe.vocabNumber()), `2000 个时估算仍有数值（${probe.vocabNumber()}）`)

// ---- 私有词的 word_key 口径与公共词一致（统计能并进去的前提）
const view = probe.firstPrivateView()
ok(view && view.id === view.wordKey, `★ toUserWordView 保证 id === wordKey（实际 ${view && view.id}）`)
ok(view && String(view.id).startsWith('u.'), `★ 私有词 word_key 是 u.* 口径（实际 ${view && view.id}）`)
ok(view && view.morphless === true, '★ 无词素的私有词 morphless=true')

// ---- 私有词确实进了统计（B-3）与复习队列（B-4）
const statsBig = probe.statsFor(600)
ok(statsBig.total >= 600, `★ 600 个私有词被计入 total（实际 ${statsBig.total}）`)
const revQueue = probe.reviewQueueFor(600)
ok(revQueue.length > 0, `★ 私有词进入了复习队列（B-4，实际 ${revQueue.length} 条）`)

// ================================================================ GAP-C
section('GAP-C  A→登出→B 连跑 50 次（云端部分）')

const loops = Number(process.argv[2] || 0)
if (loops > 0) {
  console.log(`  （云端连跑由 scripts/qa2-cloud-e2e.mjs --loops ${loops} 承担）`)
} else {
  console.log('  SKIP 需显式传参：node scripts/qa2-cloud-e2e.mjs --loops 50')
  console.log('        （本次未在云端连跑 50 次 —— 见最终报告的「未验证项」）')
}

console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
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
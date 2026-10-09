/**
 * 「常见变形 / 派生词」UI 的 DOM 级对抗性验证
 * ------------------------------------------------------------------
 * 跑：npm run test:word-forms-ui
 *
 * ★ 为什么必须挂真组件、做 DOM 断言 ★
 *   本功能的失败模式有两类，源码正则都抓不到：
 *     ① 卡片渲染了标题却没渲染 chip（空面板）；
 *     ② StudySession 漏把 relatedOf 透传给 StudyCard —— 源码里 `relatedOf` 字符串
 *        在不在都算「改了」，可学习页整块永远不出现。
 *   所以这里 jsdom + esbuild 打包，挂**真 StudyCard / 真 StudySession**，
 *   点「记得」进入作答态，再对真实 DOM 断言。
 *
 * ★ 断言锚定本 harness 容器 #wf-root ★（StudyCard 与 WordDetail 都有同名标题）
 * ★ 崩在中途比失败更危险 ★：后续断言依赖的查找走 mustFind 契约守卫，找不到即中止该用例。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.wf-bundle.mjs')
const ENTRY = resolve('scripts/wf-probe-entry.jsx')
const MOCK = resolve('scripts/tsm-mock-deps.js')

// ---------------------------------------------------------------- jsdom 环境

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

const uncaught = []
process.on('uncaughtException', (e) => {
  uncaught.push(e)
})
process.on('unhandledRejection', (e) => {
  uncaught.push(e)
})

// ---------------------------------------------------------------- 打包探针

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  // ★ charset=utf8：否则 esbuild 会把中文转义成 \uXXXX，前置自检里对
  //   「常见变形 / 派生词」文案的 grep 会假红（断言的是 bundle 内容，非运行时）。
  charset: 'utf8',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 'wf-mocks',
      setup(build) {
        build.onResolve({ filter: /(^|\/)(dict|useSpeech|usageSupplement)\.js$/ }, () => ({ path: MOCK }))
      },
    },
  ],
  logLevel: 'warning',
})

const bundle = await import(pathToFileURL(OUT).href)
const {
  mountCard,
  mountSession,
  unmount,
  clickExact,
  hasProbeError,
  probeErrorText,
  buildWordForms,
  buildIndex,
  buildStemIndex,
} = bundle

const flush = (ms = 90) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- 断言基建

let pass = 0
let fail = 0
let total = 0
function ok(cond, msg) {
  total += 1
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    console.error(`  ✗ ${msg}`)
  }
}

class MustFindError extends Error {}
function mustFind(fn, where) {
  const v = fn()
  if (v === null || v === undefined || v === false) throw new MustFindError(where)
  return v
}

function rootEl() {
  return mustFind(() => window.document.getElementById('wf-root'), '未找到 harness 容器 #wf-root')
}
/** 找渲染出的区块标题 <p>（精确文本） */
function heading(text) {
  const root = rootEl()
  return mustFind(
    () => [...root.querySelectorAll('p')].find((p) => (p.textContent || '').trim() === text),
    `未找到标题「${text}」`,
  )
}
function sectionOf(text) {
  return mustFind(() => heading(text).parentElement, `「${text}」标题没有父容器`)
}
const cls = (el) => (typeof el.className === 'string' ? el.className : '')
const txt = (el) => (el.textContent || '').trim()
/** 区块内的 chip（span / button，rounded + border） */
function chips(sec) {
  return [...sec.querySelectorAll('span,button')].filter(
    (el) => cls(el).includes('rounded') && cls(el).includes('border'),
  )
}
function hasHeading(text) {
  const root = window.document.getElementById('wf-root')
  if (!root) return false
  return [...root.querySelectorAll('p')].some((p) => (p.textContent || '').trim() === text)
}

async function runCase(name, fn) {
  console.log(`\n— ${name}`)
  try {
    await fn()
  } catch (e) {
    if (e instanceof MustFindError) {
      ok(false, `[契约守卫] ${e.message} —— 该用例中止（后面断言不再执行）`)
    } else {
      ok(false, `[异常] ${e && e.message ? e.message : e} —— 该用例中止`)
      console.error(e)
    }
  }
}

// ---------------------------------------------------------------- 夹具与模型

const MORPHS = [
  { id: 'm.don', type: 'root', origin: 'latin', form: 'don', display: 'don', gloss: '给' },
  { id: 'm.ment', type: 'suffix', origin: 'latin', form: '-ment', display: '-ment', gloss: '名词后缀' },
]
const ABANDON = {
  id: 'w.abandon',
  form: 'abandon',
  pos: 'v.',
  gloss: '放弃',
  morphs: ['m.don'],
  chain: [{ form: 'abandon', gloss: '放弃' }],
  freqRank: 1200,
  cefr: 'B1',
}
const WORDS = [
  ABANDON,
  { id: 'w.abandoned', form: 'abandoned', pos: 'adj.', gloss: '放弃', lemma: 'w.abandon', morphs: [], chain: [], freqRank: 2500, cefr: 'B1' },
  { id: 'w.abandoning', form: 'abandoning', pos: 'v.', gloss: '放弃', lemma: 'w.abandon', morphs: [], chain: [], freqRank: 3000, cefr: 'B1' },
  { id: 'w.abandonment', form: 'abandonment', pos: 'n.', gloss: '放弃；抛弃', morphs: ['m.don', 'm.ment'], chain: [{ form: 'abandon', gloss: '放弃' }], freqRank: 5000, cefr: 'B2' },
]

function buildModel() {
  const index = buildIndex(MORPHS, WORDS)
  const stemIndex = buildStemIndex(WORDS)
  return buildWordForms(WORDS, index, stemIndex)
}

// ================================================================ 前置自检

function selfCheck() {
  console.log('— 前置自检：替身与功能串都在 bundle 里')
  const t = readFileSync(OUT, 'utf8')
  ok(t.includes('tsm-mock-deps-v1'), '★ 依赖替身标记在 bundle 里（替换生效）')
  ok(!t.includes('wrc.dict.v1:'), '★ 真 dict.js 不在 bundle 里')
  ok(!t.includes('voiceschanged'), '★ 真 useSpeech.js 不在 bundle 里')
  ok(t.includes('常见变形') && t.includes('派生词'), '★ 「常见变形 / 派生词」文案在 bundle 里（WordForms 已进链路）')
}

// ================================================================ ① 学习卡：作答后展示

async function caseCardShowsForms() {
  const model = buildModel()
  unmount()
  mountCard(ABANDON, { relatedOf: model.relatedFor })
  await flush()
  ok(!hasProbeError(), `挂载未触发渲染异常${hasProbeError() ? '：' + probeErrorText() : ''}`)

  ok(!hasHeading('常见变形'), '★ 作答前不显示「常见变形」（只在展开态出现）')
  ok(!hasHeading('派生词'), '作答前不显示「派生词」')

  ok(clickExact('记得'), '找到并点击「记得」')
  await flush()
  ok(!hasProbeError(), `作答展开未触发渲染异常${hasProbeError() ? '：' + probeErrorText() : ''}`)

  const formsSec = sectionOf('常见变形')
  const forms = chips(formsSec).map(txt)
  ok(forms.length === 2, `★ 「常见变形」渲染 2 个 chip（实际 ${forms.length}：${forms.join(' | ')}）`)
  ok(forms.some((s) => s.includes('abandoned')), '含 abandoned')
  ok(forms.some((s) => s.includes('abandoning')), '含 abandoning')
  ok(forms[0].includes('abandoned'), `按词频升序（abandoned 在前，实际首项：${forms[0]}）`)

  const derSec = sectionOf('派生词')
  const ders = chips(derSec).map(txt)
  ok(ders.length === 1, `★ 「派生词」渲染 1 个 chip（实际 ${ders.length}：${ders.join(' | ')}）`)
  ok(ders[0].includes('abandonment'), '派生词含 abandonment')
  ok(ders[0].includes('放弃'), '派生词带差异化的简注（放弃；抛弃 → 放弃）')
  ok(!ders[0].includes('abandoned'), '派生词不含屈折形（排除链生效）')

  // 学习卡里 chip 是只读 span（无 onSelect），区块内不应出现可点按钮
  ok(chips(formsSec).every((el) => el.tagName === 'SPAN'), '学习卡的变形 chip 为只读 span')

  unmount()
}

// ================================================================ ② 无 relatedOf → 优雅降级

async function caseCardGraceful() {
  unmount()
  mountCard(ABANDON, {})
  await flush()
  clickExact('记得')
  await flush()
  ok(!hasProbeError(), '无 relatedOf 时作答展开不抛错')
  ok(!hasHeading('常见变形') && !hasHeading('派生词'), '★ 未提供 relatedOf → 整块不渲染（向后兼容）')
  unmount()
}

// ================================================================ ③ StudySession 透传

async function caseSessionThreading() {
  const model = buildModel()
  unmount()
  mountSession(ABANDON, { relatedOf: model.relatedFor })
  await flush()
  ok(!hasProbeError(), `会话挂载未触发渲染异常${hasProbeError() ? '：' + probeErrorText() : ''}`)

  ok(clickExact('记得'), '会话内点击「记得」')
  await flush()

  // ★ 这一条专抓「容器漏传 prop」★
  ok(hasHeading('常见变形'), '★ relatedOf 经 StudySession 透传到 StudyCard（学习页能显示常见变形）')
  const forms = chips(sectionOf('常见变形')).map(txt)
  ok(forms.length === 2 && forms.some((s) => s.includes('abandoned')), '透传后 chip 内容正确')
  unmount()
}

// ================================================================ ④ 无折叠/无派生 → 不渲染

async function caseEmptyRelated() {
  const lone = {
    id: 'w.lonely',
    form: 'lonely',
    pos: 'adj.',
    gloss: '孤独的',
    morphs: ['m.dis'],
    chain: [{ form: 'lone', gloss: '独自' }],
    freqRank: 9000,
    cefr: 'B1',
  }
  const MORPHS2 = [{ id: 'm.dis', type: 'prefix', origin: 'latin', form: 'dis-', display: 'dis-', gloss: '不' }]
  const index = buildIndex(MORPHS2, [lone])
  const stemIndex = buildStemIndex([lone])
  const model = buildWordForms([lone], index, stemIndex)

  unmount()
  mountCard(lone, { relatedOf: model.relatedFor })
  await flush()
  clickExact('记得')
  await flush()
  ok(!hasProbeError(), '孤立词作答展开不抛错')
  ok(!hasHeading('常见变形') && !hasHeading('派生词'), '★ 既无变形也无派生词 → 两块都不渲染（不占位）')
  unmount()
}

// ================================================================ 执行

console.log('[test:word-forms-ui] 「常见变形 / 派生词」DOM 级验证\n')
selfCheck()
await runCase('① 学习卡：作答后展示常见变形 + 派生词', caseCardShowsForms)
await runCase('② 学习卡：无 relatedOf 优雅降级', caseCardGraceful)
await runCase('③ StudySession 透传 relatedOf（抓「漏接线」）', caseSessionThreading)
await runCase('④ 孤立词：无内容则不渲染', caseEmptyRelated)

ok(uncaught.length === 0, `无进程级未捕获异常（实际 ${uncaught.length} 个${uncaught.length ? '：' + uncaught.map((e) => (e && e.message) || e).join(' | ') : ''}）`)

console.log(`\n---------- 断言 ${total} 条 · 通过 ${pass} · 失败 ${fail} ----------\n`)
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

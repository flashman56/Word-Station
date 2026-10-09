/**
 * QA 独立验收 · 攻击点 ①：真实 App 接线（App.jsx → StudySession → StudyCard）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-wf-app-wiring.mjs
 *
 * 为什么必须这样测：工程师的 test-word-forms-ui 只在 StudySession 层 mount 真组件，
 * 抓不到「App.jsx 漏把 relatedOf 传给 StudySession/StudyCard」这一类缺陷
 * （本项目历史：MorphDetail 因未解构 prop 而白屏，逃过 build / 源码正则 / 单独 mount）。
 *
 * 做法：jsdom + esbuild 打包一个**只渲染真 App** 的探针 → 进入学习 → 真答一题 →
 * 断言「常见变形」chips 出现在真实 DOM，且其内容 == 独立算出的同族成员。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { words } from '../src/data/index.js'

const OUT = resolve('scripts/.qa-wf-app-bundle.mjs')
const PROBE = resolve('scripts/qa-wf-app-probe.jsx')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5190/',
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

await esbuild.build({
  entryPoints: [PROBE],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})

const { mount, unmount, mountWordForms } = await import(pathToFileURL(OUT).href)

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
class ContractBreak extends Error {}
class SkipCase extends Error {}
function mustFind(sel, pred, what) {
  const el = [...document.querySelectorAll(sel)].find(pred)
  if (!el) {
    ok(false, `[契约守卫] 找不到${what}`)
    throw new ContractBreak(what)
  }
  return el
}

const q = (sel) => [...document.querySelectorAll(sel)]
const byExact = (sel, text) => q(sel).find((e) => (e.textContent || '').trim() === text)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const flush = (ms = 60) => sleep(ms)
const click = (el) =>
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))

// ---- 契约：唯一存储是 lib/migrate.js 的分区 learn 键（不硬编码）
const { keysFor } = await import('../src/lib/migrate.js')
const LEARN_KEY = keysFor('guest').learn

// ---- 选一个「有同族变形」的真实代表形（freqRank>2500，保证在学习池里）
const folded = words.filter((w) => w.lemma && w.lemma !== w.id)
const byId = new Map(words.map((w) => [w.id, w]))
let R = null
let child = null
for (const c of folded) {
  const r = byId.get(c.lemma)
  if (r && !r.lemma && typeof r.freqRank === 'number' && r.freqRank > 2500) {
    R = r
    child = c
    break
  }
}
if (!R) {
  console.error('无法定位一个有变形的真实代表形，中止')
  process.exit(1)
}
const childForms = folded.filter((w) => w.lemma === R.id).map((w) => w.form)
console.log(`[目标] 代表形 R=${R.form}(${R.id}) freqRank=${R.freqRank}；同族变形=${childForms.join(', ')}\n`)

// ================================================================ 执行
console.log('— 真实 App 接线：进入学习 → 真答一题 → 断言「常见变形」出现在真实 DOM')
window.localStorage.clear()
const at = new Date(Date.now() - 60000).toISOString()
window.localStorage.setItem(
  LEARN_KEY,
  JSON.stringify({
    version: 2,
    records: {
      [R.id]: {
        status: 'review',
        correctCount: 0,
        consecutiveCorrect: 0,
        incorrectCount: 5,
        lastStudiedAt: at,
        lastResult: 'incorrect',
        lastIncorrectAt: at,
        statusChangedAt: at,
        statusSource: 'manual',
      },
    },
  }),
)

try {
  mount()
  // 词库 14MB 动态 import，需等待其加载完成（期间页面显示「词库加载中…」）
  const waitFor = async (pred, ms = 8000, step = 100) => {
    const t0 = Date.now()
    while (Date.now() - t0 < ms) {
      if (pred()) return true
      await sleep(step)
    }
    return pred()
  }
  // 等 AppShell 真正渲染（左栏统计「学习库总计」只在 words 就绪后的 AppShell 出现）
  const loaded = await waitFor(() => (document.body.textContent || '').includes('学习库总计'))
  ok(loaded, `真实 App 词库加载完成（${loaded ? 'AppShell 已渲染' : '超时仍未加载'}）`)
  await flush(200)

  // 进入学习页（有的布局先点「学习」主导航）
  const learnNav = byExact('button', '学习')
  if (learnNav) {
    click(learnNav)
    await flush(150)
  }

  if (process.env.QA_WF_DEBUG === '1') {
    console.log('   [debug] 按钮：', q('button').map((b) => (b.textContent || '').trim()).filter(Boolean).slice(0, 40))
    console.log('   [debug] body 片段：', (document.body.textContent || '').replace(/\s+/g, ' ').slice(0, 300))
  }
  const priBtn = mustFind('button', (b) => (b.textContent || '').includes('优先复习'), '「优先复习」按钮')
  click(priBtn)
  await flush(200)

  // 首张学习卡 = 真 StudyCard
  const card = mustFind('h2', (h) => (h.className || '').includes('text-4xl'), 'StudyCard 大号词形标题（h2.text-4xl）')
  const cardForm = card.textContent.trim()
  ok(true, `真实 App 渲染出学习卡（首卡词形 = ${cardForm}）`)

  // 作答前：折叠态，不应出现「常见变形」（它只在展开态渲染）
  ok(
    !q('p').some((p) => (p.textContent || '').trim() === '常见变形'),
    '★ 作答前不显示「常见变形」（证明该块只在展开态出现，非恒显）',
  )

  // 真答一题
  const rememberBtn = mustFind('button', (b) => (b.textContent || '').trim() === '记得', '「记得」按钮')
  click(rememberBtn)
  await flush(250)

  // ★ 核心：真链路上「常见变形」chips 是否出现
  const heading = q('p').find((p) => (p.textContent || '').trim() === '常见变形')
  ok(
    !!heading,
    '★★ 真答一题后「常见变形」区块出现在真实 App DOM（证明 App→StudySession→StudyCard 透传成立）',
  )

  if (heading) {
    const section = heading.parentElement
    const chips = [...section.querySelectorAll('span,button')].map((el) => (el.textContent || '').trim())
    const expect = new Set(childForms)
    const hit = chips.filter((t) => [...expect].some((f) => t.includes(f)))
    ok(hit.length > 0, `★ chips 含同族变形（实际 chips=[${chips.join(' | ')}]；期望之一 ∈ {${[...expect].join(', ')}}）`)
    ok(
      chips.every((t) => t && !/^常见变形$/.test(t)),
      'chips 均为词形（非区块标题串入）',
    )
    // 学习卡里 chip 应为只读 span（无 onSelect）
    const asButtons = [...section.querySelectorAll('button')].length
    ok(asButtons === 0, `学习卡的变形 chip 为只读（区块内无 button，实际 ${asButtons}）`)
  }
} catch (e) {
  if (!(e instanceof ContractBreak)) {
    ok(false, `[异常] ${e && e.message ? e.message : e}`)
    console.error(e)
  }
} finally {
  try {
    unmount()
  } catch {
    /* ignore */
  }
}

// ================================================================ 攻击点①(b)：chip 双向形态
// 工程师主张：chip「有 onSelect → <button>；无 → <span>」。此前**两个方向都无独立 DOM 断言**。
console.log('\n— chip 双向形态：有 onSelect → 可点击 <button>（点击回调 onSelect(id)）；无 → 只读 <span>')
{
  const chipOf = () =>
    [...document.querySelectorAll('#wf-root span, #wf-root button')].filter((el) => {
      const c = typeof el.className === 'string' ? el.className : ''
      return c.includes('rounded') && c.includes('border')
    })
  const stubWord = { id: 'w.probe', form: 'probe', gloss: '探测' }
  const stubRelated = () => ({
    forms: [{ id: 'w.probe1', form: 'probes', gloss: '探测' }],
    derivatives: [{ id: 'w.probe2', form: 'probing', gloss: '探测中的' }],
  })

  // (a) 传 onSelect → button，且点击回调被调用
  let calledWith = null
  unmount()
  mountWordForms(stubWord, { relatedOf: stubRelated, onSelect: (id) => { calledWith = id } })
  await flush(60)
  const withSel = chipOf()
  ok(withSel.length === 2, `传 onSelect：渲染 2 个 chip（实际 ${withSel.length}）`)
  ok(withSel.length > 0 && withSel.every((el) => el.tagName === 'BUTTON'), '★ 有 onSelect → chip 全为可点击 <button>')
  const firstBtn = document.querySelector('#wf-root button')
  if (firstBtn) click(firstBtn)
  await flush(20)
  ok(
    calledWith === 'w.probe1',
    `★ 点击 chip 触发 onSelect(id)（调用参数实际 = ${JSON.stringify(calledWith)}，期望 'w.probe1'）`,
  )

  // (b) 不传 onSelect → span，且不存在 button
  unmount()
  mountWordForms(stubWord, { relatedOf: stubRelated })
  await flush(60)
  const noSel = chipOf()
  ok(noSel.length === 2, `无 onSelect：渲染 2 个 chip（实际 ${noSel.length}）`)
  ok(noSel.length > 0 && noSel.every((el) => el.tagName === 'SPAN'), '★ 无 onSelect → chip 全为只读 <span>')
  ok(document.querySelectorAll('#wf-root button').length === 0, '★ 无 onSelect → 区块内无任何 button')

  unmount()
}

try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}

console.log(`\n---------- [qa-wf-app-wiring] 断言 ${total} 条 · 通过 ${pass} · 失败 ${fail} ----------\n`)
process.exit(fail === 0 ? 0 : 1)

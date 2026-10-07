/**
 * scripts/qa-features-e2e.mjs —— 三大新功能 E2E 运行器（QA 独立编写）
 * ------------------------------------------------------------------
 * 复用 scripts/qa-react-e2e.mjs 的既有模式：jsdom 环境 → esbuild 打包
 * scripts/qa-features-harness.jsx → Node 里 import 执行。
 *
 * 关键点：useSpeech.js 的 SUPPORTED 是**模块级常量**（在模块加载时判定
 * window.speechSynthesis 是否存在）。因此「有语音 / 无语音」两种情形必须在
 * **两个独立进程**里分别跑（各自 import 一次 bundle，常量独立求值）：
 *
 *   node scripts/qa-features-e2e.mjs              # 默认 with-speech
 *   node scripts/qa-features-e2e.mjs no-speech    # 无 speechSynthesis
 *
 * 退出码：0 = 全部通过；1 = 有用例失败或运行异常。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const MODE = process.argv[2] === 'no-speech' ? 'no-speech' : 'with-speech'
const OUT = resolve(`scripts/.qa-features-bundle-${MODE}.mjs`)

// 1) jsdom 环境（与既有 harness 保持一致）
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

// 2) 按模式注入 / 移除伪 speechSynthesis（必须在 import bundle **之前**）
function installMockSpeech(w) {
  const spoken = []
  w.__spoken = spoken
  w.__cancels = 0
  class FakeUtterance {
    constructor(text) {
      this.text = text
      this.lang = ''
      this.rate = 1
      this.voice = null
      this.onend = null
      this.onerror = null
    }
  }
  // 故意把 en-US 放在中间，证明选声是「按优先级」而非「取列表第一个」
  const voices = [
    { lang: 'fr-FR', name: 'French' },
    { lang: 'en-GB', name: 'British' },
    { lang: 'en-US', name: 'American' },
    { lang: 'en-AU', name: 'Australian' },
  ]
  const synth = {
    getVoices: () => voices,
    speak: (u) => {
      spoken.push(u)
    },
    cancel: () => {
      w.__cancels += 1
    },
    addEventListener: () => {},
    onvoiceschanged: null,
  }
  w.speechSynthesis = synth
  w.SpeechSynthesisUtterance = FakeUtterance
}

if (MODE === 'with-speech') {
  installMockSpeech(window)
} else {
  delete window.speechSynthesis
  delete window.SpeechSynthesisUtterance
}
globalThis.__QA_MODE__ = MODE

// 3) 打包真实组件
await esbuild.build({
  entryPoints: ['scripts/qa-features-harness.jsx'],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})
console.log(`[bundle] 打包完成（mode=${MODE}），真实引入 SpeakerButton / VocabCard / EtymologyPanel\n`)

// 4) 捕获 React 警告 / 错误（不影响退出码，单独汇报）
const consoleIssues = []
const origError = console.error
const origWarn = console.warn
console.error = (...a) => consoleIssues.push(['error', a.map(String).join(' ').slice(0, 300)])
console.warn = (...a) => consoleIssues.push(['warn', a.map(String).join(' ').slice(0, 300)])

// 5) 运行
let code = 1
try {
  const mod = await import(pathToFileURL(OUT).href)
  const r = await mod.run(MODE)
  code = r.fail === 0 ? 0 : 1
} catch (e) {
  origError('\n!!! 运行异常：\n', e && e.stack ? e.stack : e)
  code = 1
} finally {
  console.error = origError
  console.warn = origWarn
  console.log(`\n=== [mode=${MODE}] 控制台告警检查：捕获到 ${consoleIssues.length} 条 ===`)
  consoleIssues.forEach(([lv, m]) => origError(`  [${lv}] ${m}`))
  if (consoleIssues.length === 0) origError('  （无 React 警告 / 错误）')
  try {
    unlinkSync(OUT)
  } catch {
    /* ignore */
  }
  process.exit(code)
}

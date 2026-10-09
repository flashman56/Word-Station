/**
 * 「常见变形 / 派生词」DOM 级测试的探针入口（由 test-word-forms-ui.mjs 打包执行，勿直接运行）。
 * ------------------------------------------------------------------
 * ★ 挂的是**真组件** ★
 *   - StudyCard（学习卡）：验证 relatedOf 注入后作答态渲染出「常见变形 / 派生词」。
 *   - StudySession（会话容器）：验证 relatedOf 被**透传**到 StudyCard（回到「看起来改了
 *     其实没接线」的典型缺陷：容器漏传 prop → 卡片永远收不到 → 学习页整块不出现）。
 *
 * 依赖替身（dict / useSpeech / usageSupplement）由测试脚本经 esbuild 插件注入 ——
 * 真模块会 fetch / 碰 IndexedDB / 读 speechSynthesis，jsdom 里必须替换。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import StudyCard from '../src/components/StudyCard.jsx'
import StudySession from '../src/components/StudySession.jsx'
import { buildWordForms } from '../src/lib/wordForms.js'
import { buildIndex } from '../src/lib/derive.js'
import { buildStemIndex } from '../src/lib/stemFamily.js'

/** 经入口再导出这三个纯函数，保证测的是打进 bundle 的那一份（而非另一份模块实例）。 */
export { buildWordForms, buildIndex, buildStemIndex }

/** 捕获渲染异常的错误边界：出错转成可查询标记，不让进程崩掉。 */
class Boundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }
  static getDerivedStateFromError(err) {
    return { err }
  }
  render() {
    if (this.state.err) {
      const msg = this.state.err && this.state.err.message ? this.state.err.message : String(this.state.err)
      return React.createElement('div', { 'data-testid': 'wf-probe-error' }, msg)
    }
    return this.props.children
  }
}

let root = null
let container = null

function render(node) {
  container = window.document.createElement('div')
  container.id = 'wf-root'
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(React.createElement(Boundary, null, node))
}

/**
 * 挂载一张学习卡。
 * @param {object} word 词条
 * @param {{ relatedOf?: Function, mode?: string, record?: object }} [opts]
 */
export function mountCard(word, opts = {}) {
  render(
    React.createElement(StudyCard, {
      word,
      mode: opts.mode || 'learn',
      record: opts.record,
      onMarkKnown: () => {},
      onNext: () => {},
      relatedOf: opts.relatedOf,
    }),
  )
}

/**
 * 挂载一个单题学习会话（验证 relatedOf 透传）。
 * @param {object} word 词条
 * @param {{ relatedOf?: Function }} [opts]
 */
export function mountSession(word, opts = {}) {
  render(
    React.createElement(StudySession, {
      mode: 'learn',
      queue: [word],
      answer: () => ({ record: null }),
      markKnown: () => {},
      onExit: () => {},
      relatedOf: opts.relatedOf,
    }),
  )
}

export function unmount() {
  if (root) {
    root.unmount()
    root = null
  }
  if (container && container.parentNode) container.parentNode.removeChild(container)
  container = null
}

/** 按精确文本点击 #wf-root 内的按钮（避开「不记得」含子串「记得」的陷阱）。 */
export function clickExact(text) {
  const btns = [...window.document.querySelectorAll('#wf-root button')]
  const el = btns.find((b) => (b.textContent || '').trim() === text)
  if (!el) return false
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  return true
}

export function hasProbeError() {
  return Boolean(window.document.querySelector('[data-testid="wf-probe-error"]'))
}

export function probeErrorText() {
  const el = window.document.querySelector('[data-testid="wf-probe-error"]')
  return el ? el.textContent || '' : ''
}

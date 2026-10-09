/**
 * StudyCard 无拆解面板测试的探针入口（由 test-studycard-morphless.mjs 打包执行，勿直接运行）。
 * ------------------------------------------------------------------
 * ★ 挂的是**真组件** src/components/StudyCard.jsx ★
 *   不做逻辑复刻 —— 复刻了就测不到「守卫有没有被写回去」。
 *
 * ★ 为什么要包一层 ErrorBoundary ★
 *   本 harness 有一条验收线是「chain 为 undefined 时组件不得抛错」。React 的
 *   渲染异常若无人接住，在 createRoot 下会异步抛出、把整个测试进程崩掉 ——
 *   「崩在中途」比「断言失败」更危险（后面的用例全不跑，且看不出是哪条挂的）。
 *   ErrorBoundary 把渲染异常**确定性地**转成一个可查询的 DOM 标记，测试据此
 *   记 FAIL 并继续，而不是让进程崩掉。
 *
 * 依赖替身（dict / useSpeech / usageSupplement）由测试脚本经 esbuild 插件注入。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import StudyCard from '../src/components/StudyCard.jsx'
import { hasDecomposition, morphlessKindLabel } from '../src/lib/derive.js'

/**
 * ★ 把 derive 的两个纯函数经本入口再导出 ★
 *   测试若直接 import 源码，拿到的是**另一份模块实例**；经入口再导出，测的就是
 *   打进 bundle、被 StudyCard 真正调用的那一份（避免「源码对、bundle 里是旧的」）。
 */
export { hasDecomposition, morphlessKindLabel }

/** 捕获渲染异常的错误边界：出错时渲染一个可查询的标记，不向进程抛。 */
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
      return React.createElement('div', { 'data-testid': 'tsm-probe-error' }, msg)
    }
    return this.props.children
  }
}

let root = null
let container = null

/**
 * 挂载一张学习卡。
 * @param {object} word 词条（must be 真形状：form/pos/gloss/chain/kind ...）
 * @param {object} [props] 透传 mode/record 等
 */
export function mount(word, props = {}) {
  container = window.document.createElement('div')
  container.id = 'tsm-root'
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(
    React.createElement(
      Boundary,
      null,
      React.createElement(StudyCard, {
        word,
        mode: props.mode || 'learn',
        record: props.record,
        onAnswer: props.onAnswer,
        onMarkKnown: props.onMarkKnown || (() => {}),
        onNext: props.onNext || (() => {}),
      }),
    ),
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

/**
 * 按**精确文本**点击卡片里的按钮。
 *
 * ★ 必须精确匹配而不是 includes ★
 *   作答前有两个按钮「不记得」与「记得」，「不记得」含子串「记得」—— 用
 *   includes('记得') 会命中排在前面的「不记得」。用精确 trim 相等避免这个陷阱。
 *
 * @param {string} text 按钮文本（已 trim）
 * @returns {boolean} 是否点到
 */
export function clickExact(text) {
  const btns = [...window.document.querySelectorAll('#tsm-root button')]
  const el = btns.find((b) => (b.textContent || '').trim() === text)
  if (!el) return false
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  return true
}

/** 是否存在渲染异常标记 */
export function hasProbeError() {
  return Boolean(window.document.querySelector('[data-testid="tsm-probe-error"]'))
}

/** 渲染异常文本（无则空串） */
export function probeErrorText() {
  const el = window.document.querySelector('[data-testid="tsm-probe-error"]')
  return el ? el.textContent || '' : ''
}

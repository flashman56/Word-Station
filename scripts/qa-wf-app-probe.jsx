/**
 * QA 独立验收 · 真实 App 接线探针（攻击点 ①）
 * 由 scripts/qa-wf-app-wiring.mjs 打包执行，勿直接运行。
 *
 * ★ 目的 ★：只挂**真 App**（React.createElement(App)），验证
 *   App.jsx → StudySession → StudyCard 的 relatedOf 透传在**真链路上**成立，
 *   而不是在 StudySession 层单独 mount（那正是本项目栽过的「看起来改了其实没接线」盲区）。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.jsx'
import WordForms from '../src/components/WordForms.jsx'

let root = null
let container = null

/** 渲染到新的 #wf-root 容器（容器 id 供测试脚本锚定）。 */
function render(node) {
  if (container && container.parentNode) container.parentNode.removeChild(container)
  container = document.createElement('div')
  container.id = 'wf-root'
  document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(node)
}

export function mount() {
  render(React.createElement(App))
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
 * 直接挂载「常见变形 / 派生词」区块（WordForms），用于**双向**断言 chip 的两种形态：
 *   - 传 onSelect → chip 必须是可点击 <button>（词详情面），点击应回调 onSelect(id)；
 *   - 不传 onSelect → chip 必须是只读 <span>（学习卡面）。
 * @param {object} word 当前词条
 * @param {{ relatedOf?: Function, onSelect?: Function, showDerivatives?: boolean }} [opts]
 */
export function mountWordForms(word, opts = {}) {
  render(
    React.createElement(WordForms, {
      word,
      relatedOf: opts.relatedOf,
      onSelect: opts.onSelect,
      showDerivatives: opts.showDerivatives === undefined ? true : opts.showDerivatives,
    }),
  )
}

/**
 * A-01 的被测组件：批量加词面板（由 test-a01-words.mjs 打包执行，勿直接运行）
 *
 * ★ 挂载的是**真组件** src/components/AddWordsPanel.jsx ★
 *   不做任何逻辑复刻 —— 复刻了就测不到「三道防护有没有真的接上」这种问题。
 *   这一点对本用例尤其关键：A-01 的本质是「三处代码各自看起来都对，
 *   合起来却让 20 个词凭空消失」。任何一处用逻辑复刻代替真组件，
 *   测的就只是复刻品的行为。
 *
 * dict / cloud 两组依赖由 test-a01-words.mjs 通过 esbuild 插件替换为可控制的
 * 替身（ESM 命名空间对象冻结，运行时打不了补丁 —— 见 a01-mock-dict.js 注释）。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import AddWordsPanel from '../src/components/AddWordsPanel.jsx'
// ★ 替身的控制句柄必须**经本文件再导出**，不能由测试直接 import 替身文件 ★
//   替身被 esbuild 打进了 bundle：测试侧再 import 一次 a01-mock-dict.js 得到的是
//   **另一个模块实例**，改它的 state 对 bundle 里的那份毫无作用 —— 症状是
//   「测试全红但一行报错都没有」，极难归因。经入口再导出则保证同一个实例。
import * as mockDict from '../src/lib/dict.js'
import * as mockCloud from '../src/lib/cloud/offline.js'

export const __setIndexReady = mockDict.__setIndexReady
export const __resolveIndex = mockDict.__resolveIndex
export const __setKnownForms = mockDict.__setKnownForms
export const __setAddMany = mockCloud.__setAddMany
export const __setGenerate = mockCloud.__setGenerate
export const __getCalls = mockCloud.__getCalls
export const __resetCalls = mockCloud.__resetCalls

const OWNER = 'uid-A'
const STATION = 'station-1'

function Probe({ online }) {
  return (
    <AddWordsPanel
      ownerId={OWNER}
      stationId={STATION}
      existingKeys={new Set()}
      online={online}
      onDone={() => {}}
    />
  )
}

let root = null
let container = null

export function mountProbe({ online = true } = {}) {
  container = window.document.createElement('div')
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(<Probe online={online} />)
}

export function unmountProbe() {
  if (root) {
    root.unmount()
    root = null
  }
  if (container && container.parentNode) container.parentNode.removeChild(container)
}

/** 往 textarea 里写入文本（模拟用户粘贴），并触发 React 的 onChange */
export function pasteInto(textarea, text) {
  const proto = window.HTMLTextAreaElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
  setter.call(textarea, text)
  textarea.dispatchEvent(new window.Event('input', { bubbles: true }))
}

/** 读 textarea 当前的值（用户真正能看到的东西） */
export function textareaValue() {
  const ta = window.document.querySelector('textarea')
  return ta ? ta.value : null
}

/** 按可见文案找按钮 */
export function findButtonByText(fragment) {
  const buttons = [...window.document.querySelectorAll('button')]
  return buttons.find((b) => (b.textContent || '').includes(fragment)) || null
}

/** 全部按钮的 {文案, disabled}（用于断言第一道防护） */
export function allButtons() {
  return [...window.document.querySelectorAll('button')].map((b) => ({
    text: (b.textContent || '').trim(),
    disabled: Boolean(b.disabled),
  }))
}

/** 点某个按钮（触发 React onClick） */
export function click(el) {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
}

/** 页面上是否出现了某个文案片段 */
export function pageHas(fragment) {
  return (window.document.body.textContent || '').includes(fragment)
}

/** 取消息块的 class（用于断言三态配色） */
export function messageBlock() {
  const all = [...window.document.querySelectorAll('div')]
  const hit = all.find(
    (d) =>
      typeof d.className === 'string' &&
      d.className.includes('rounded') &&
      d.className.includes('border') &&
      /bg-(emerald|amber|red)-50/.test(d.className) &&
    d.className.includes('text-xs'),
  )
  if (!hit) return null
  return { className: hit.className, text: (hit.textContent || '').trim() }
}

/** 已勾选的可选行数（从「已选 N / M」里读） */
export function selectedCount() {
  const m = /已选 (\d+) \/ (\d+)/.exec(window.document.body.textContent || '')
  return m ? { selected: Number(m[1]), selectable: Number(m[2]) } : null
}

/** 预览行的状态（复选框 disabled = 未能识别） */
export function previewRows() {
  const labels = [...window.document.querySelectorAll('label')]
  return labels.map((l) => {
    const cb = l.querySelector('input[type="checkbox"]')
    return {
      form: (l.querySelector('span') ? l.querySelector('span').textContent : '').trim(),
      checked: Boolean(cb && cb.checked),
      disabled: Boolean(cb && cb.disabled),
      rowText: (l.textContent || '').trim(),
    }
  })
}

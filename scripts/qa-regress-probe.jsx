/**
 * QA 报出的 3 个源码 bug 的回归探针（由 qa-regress-fixes.mjs 打包执行）
 * ------------------------------------------------------------------
 * ★★★ 关键：怎么在模块顶层复现「作用域不成立」★★
 *   QA 报的 Bug 1 形状是：`MorphDetail` 是 **App.jsx 里的顶层函数**（缩进 0），
 *   它用了 AppShell 内部定义的 `addToStationProps` —— 而顶层函数**不在 AppShell
 *   的闭包里**，拿不到那个变量。
 *
 *   这个形状**没法用普通模块代码写出来**：在探针文件里写
 *   `const addToStationProps = 1` 反而是合法的（模块作用域有它）。
 *   真正能复现的办法是**再嵌一层模块**：
 *     - 本文件顶层**故意不声明** addToStationProps；
 *     - 内层用 new Function 造出的函数体**看不到本模块作用域**（只能看到形参），
 *       所以它用 addToStationProps 时就是 ReferenceError；
 *     - 而「修好的一版」显式把 addToStationProps 作为形参解构出来。
 *   这与 App.jsx 里的差别只是「少了一层闭包」，而 ReferenceError 的成因完全一致。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'

/** 供测试用 new Function 构造「作用域不成立」的环境 */
export const __React = React

// ---------------------------------------------------------------- Bug 1：作用域

/**
 * 故障版：**不**把 addToStationProps 声明为形参，却在函数体里用它。
 * 挂到真 React 上渲染 → ReferenceError → 整棵树崩（QA 报的白屏）。
 */
function MorphDetailBroken(props) {
  const { selectedIds } = props
  return React.createElement(
    'div',
    null,
    React.createElement('span', null, '词根'),
    selectedIds.size > 0
      ? React.createElement(
          'div',
          { 'data-testid': 'bar' },
          React.createElement('span', null, `已选 ${selectedIds.size} 个`),
          // ★ 作用域 bug 的触发点：这个标识符在作用域里不存在
          React.createElement('span', null, String(Object.keys(addToStationProps).length)),
        )
      : null,
  )
}

/** 修复版：显式解构出 addToStationProps（并给它默认值） */
function MorphDetailFixed({ selectedIds, addToStationProps = EMPTY_PROPS }) {
  return (
    <div>
      <span>词根</span>
      {selectedIds.size > 0 && (
        <div data-testid="bar">
          <span>{`已选 ${selectedIds.size} 个`}</span>
          <span>{String(Object.keys(addToStationProps).length)}</span>
        </div>
      )}
    </div>
  )
}

const EMPTY_PROPS = {}

// ---------------------------------------------------------------- 挂载

let root = null
let container = null

function mount(node) {
  unmount()
  container = window.document.createElement('div')
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(node)
}

export function unmount() {
  if (root) {
    try {
      root.unmount()
    } catch {
      /* ignore */
    }
    root = null
  }
  if (container && container.parentNode) container.parentNode.removeChild(container)
  container = null
}

/** 渲染「作用域不成立」的那一版 —— 期望抛 ReferenceError（整树崩） */
export function mountBroken({ selectedIds }) {
  mount(<MorphDetailBroken selectedIds={selectedIds} />)
}

/** 渲染「已修好」的那一版 —— 期望正常渲染 */
export function mountFixed({ selectedIds, addToStationProps }) {
  mount(<MorphDetailFixed selectedIds={selectedIds} addToStationProps={addToStationProps} />)
}

// ---------------------------------------------------------------- Bug 2/3：C-04「✓ 已在」

export function mountMenu({ wordKeys, sources, stations, existingKeys, currentStationId, currentStationName }) {
  // ★ 延迟 import：AddToStationMenu 在探针里静态 import 即可，
  //   但它内部会 import cloud 出口 —— 那些由测试脚本的 esbuild 插件替换成替身。
  mount(
    <AddToStationMenuLazy
      ownerId="uid-A"
      stations={stations}
      online
      wordKeys={wordKeys}
      sources={sources}
      existingKeys={existingKeys}
      currentStationId={currentStationId}
      currentStationName={currentStationName}
    />,
  )
}

// 静态引入（esbuild 会把它与替身一起打进 bundle）
import AddToStationMenuLazy from '../src/components/AddToStationMenu.jsx'

/**
 * T04 的被测组件（由 test-private-words-ui.mjs 打包执行，勿直接运行）
 *
 * ★ 挂的是**真组件** src/components/PrivateWordsPanel.jsx ★
 *   不做逻辑复刻 —— 复刻了就测不到「两个后果相反的按钮有没有被写混」。
 *
 * cloud 侧依赖由测试脚本通过 esbuild 插件替换为可记录调用的替身
 * （真 supabase 客户端在 jsdom 里会真发网络请求）。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import PrivateWordsPanel from '../src/components/PrivateWordsPanel.jsx'
// ★ 控制句柄必须**经本文件再导出** ★
//   替身被打进 bundle：测试侧再 import 一次 t04-mock-cloud.js 拿到的是**另一个
//   模块实例**，改它的 state 对 bundle 里那份毫无作用 —— 症状是「全绿但什么
//   都没拦到」。经入口再导出则保证同一个实例。
import * as mockUserWords from '../src/lib/cloud/userWords.js'

export const __setRemoveError = mockUserWords.__setRemoveError
export const __resetCalls = mockUserWords.__resetCalls
export const getCalls = mockUserWords.getCalls

const OWNER = 'uid-A'

function Probe({ words, records, existingKeys, stationName, ownerId, onRefresh }) {
  return (
    <PrivateWordsPanel
      userWords={words}
      records={records}
      ownerId={ownerId === undefined ? OWNER : ownerId}
      existingKeys={existingKeys}
      currentStationName={stationName}
      onRefresh={
        onRefresh ||
        (() => {
          mockUserWords.getCalls().onRefresh += 1
        })
      }
    />
  )
}

let root = null
let container = null

/**
 * @param {object} args
 * @param {Array} args.words 私有词（已是 wordView 形状：id === wordKey）
 * @param {object} args.records 学习记录
 * @param {Set<string>} args.existingKeys 当前小站已有的 wordKey
 * @param {string} args.stationName 当前小站名
 * @param {string|null} [args.ownerId] 传 null 模拟未登录
 * @param {object|null} [args.removeError] 让 remove 返回错误的 code/message
 */
export function mount({ words, records, existingKeys, stationName, ownerId, removeError }) {
  mockUserWords.__setRemoveError(removeError || null)
  container = window.document.createElement('div')
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(
    <Probe
      words={words}
      records={records}
      existingKeys={existingKeys || new Set()}
      stationName={stationName || ''}
      ownerId={ownerId}
    />,
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

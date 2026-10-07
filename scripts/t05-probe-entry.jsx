/**
 * T05 的被测组件（由 test-station-words-ui.mjs 打包执行，勿直接运行）
 *
 * ★ 全部挂真组件 ★
 *   StationLearn / AddToStationMenu / BulkActionBar 都不做逻辑复刻 ——
 *   B 组最容易「看起来改了其实没生效」，复刻了就测不到信号链有没有接错。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import StationLearn from '../src/components/StationLearn.jsx'
import AddToStationMenu from '../src/components/AddToStationMenu.jsx'
import BulkActionBar from '../src/components/BulkActionBar.jsx'
// ★ 控制句柄经本文件再导出，保证与 bundle 里的替身是**同一个实例** ★
import * as mockStationWords from '../src/lib/cloud/stationWords.js'
import * as mockUserWords from '../src/lib/cloud/userWords.js'
import * as mockStations from '../src/lib/cloud/stations.js'
import * as mockOffline from '../src/lib/cloud/offline.js'

export const __resetCalls = () => {
  mockStationWords.__resetCalls()
  mockUserWords.__resetCalls()
  mockOffline.__resetCalls()
}
/**
 * 汇总四个模块的调用记录。
 *
 * ★ 为什么手工列字段而不用对象展开 ★
 *   userWords / stations / stationWords / offline 四者都有名为 `remove` 的调用
 *   记录（语义完全不同：删词条 vs 删小站 vs 删词条引用）。用 `{...a, ...b}` 合并时
 *   后者会**静默覆盖**前者 —— 测试于是断言到一个永远为空或错误的数组，
 *   而且照样「通过」（或者报 undefined.length 的错，浪费一轮排查）。
 *   ★ 这与我在 BulkActionBar 里遇到的是同一类问题：同名的东西必须显式消歧，
 *     绝不靠覆盖顺序。
 */
export const getCalls = () => ({
  // userWords
  userWordsRemove: mockUserWords.getCalls().remove,
  userWordsPatch: mockUserWords.getCalls().patch,
  // stationWords
  stationWordsRemove: mockStationWords.getCalls().stationWordsRemove,
  addMany: mockStationWords.getCalls().addMany,
  // stations
  createStation: mockStations.getCalls().createStation,
  // offline
  enqueue: mockOffline.getCalls().enqueue,
})
export const __setRemoveError = mockStationWords.__setRemoveError
export const __setAddMany = mockStationWords.__setAddMany
export const __setCreateResult = mockStations.__setCreateResult

let root = null
let container = null

function mountRoot(node) {
  unmount()
  container = window.document.createElement('div')
  window.document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
  root.render(node)
}

export function unmount() {
  if (root) {
    root.unmount()
    root = null
  }
  if (container && container.parentNode) container.parentNode.removeChild(container)
  container = null
}

/** B 组：真 StationLearn，removeWord 换成可控实现 */
export function mountRemove({ words, records, online, stationName, removeOk }) {
  mockStationWords.__setRemoveError(removeOk ? null : { code: 'INTERNAL', message: 'RLS 拒绝' })
  mountRoot(
    <StationLearn
      words={words}
      morphemes={[]}
      records={records}
      markKnown={() => {}}
      setReview={() => {}}
      retreat={() => {}}
      answer={() => {}}
      ownerId="uid-A"
      online={online}
      currentStationName={stationName}
      removeWord={async (wordKey) => {
        // ★ 用替身的 removeStationWordRef：stationWords.js 与 userWords.js 都导出
        //   remove，而两者映射到同一个替身文件（ESM 不允许同名导出），
        //   所以替身把 stationWords 侧的删除挂在别名上。
        const res = await mockStationWords.removeStationWordRef('station-1', wordKey)
        return !res.error
      }}
      pending={[]}
    />,
  )
}

/** C 组：真 AddToStationMenu */
export function mountAdd({ wordKeys, sources, stations, ownerId, online, existingKeys, currentStationId, currentStationName }) {
  mountRoot(
    <div>
      <AddToStationMenu
        ownerId={ownerId}
        stations={stations}
        online={online}
        wordKeys={wordKeys}
        sources={sources}
        existingKeys={existingKeys}
        currentStationId={currentStationId}
        currentStationName={currentStationName}
        onCreateStation={async (name) => {
          const res = await mockStations.create(ownerId, name)
          return res.data
        }}
      />
    </div>,
  )
}

/** C 组：真 BulkActionBar（代表三处调用点的实际用法，只差 layout） */
export function mountBulk({ count, ids, layout, addToStation = true }) {
  mountRoot(
    <BulkActionBar
      count={count}
      ids={ids}
      layout={layout}
      onMarkKnown={() => {}}
      onSetReview={() => {}}
      onReset={() => {}}
      onClear={() => {}}
      addToStation={addToStation}
      ownerId="uid-A"
      stations={[
        { id: 'station-1', name: '雅思', pinned: true },
        { id: 'station-2', name: '论文阅读', pinned: false },
      ]}
      existingKeys={new Set()}
      currentStationId="station-1"
      currentStationName="雅思"
    />,
  )
}

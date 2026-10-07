/**
 * 竞态测试的被测组件（由 test-race.mjs 打包执行，勿直接运行）。
 *
 * 挂载的是**真的** `useLearnCloud` —— L2 epoch 守卫与 L3 settleInFlight 都在这个
 * hook 内部，只有跑真 hook 才算真的动态触发了竞态窗口。任何逻辑复刻都会
 * 把「守卫到底走没走到」这个要验的东西给复刻掉。
 *
 * 上行经由 esbuild 插件换成 race-fake-learnsync.mjs，从而能控制「在途」。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { useLearnCloud } from '../src/hooks/useLearnCloud.js'
import { keysFor } from '../src/lib/migrate.js'
// ★ 关键：直接 import 那个替身文件本身 ★
//   useLearnCloud 里的 learnSync 已被 esbuild 插件换成同一个路径，
//   于是这里拿到的与 hook 内部用的是**同一个模块实例**（esbuild 按路径去重）。
//   测试若在 Node 侧另行 import 该文件，会得到另一份实例 —— 状态各改各的，
//   于是「让 push 挂起」根本不生效（这正是本测试第一版失败的原因）。
import * as learnSyncFake from './race-fake-learnsync.mjs'

const WORDS = [
  { id: 'w.alpha', form: 'alpha', freqRank: 9100, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.beta', form: 'beta', freqRank: 9200, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.gamma', form: 'gamma', freqRank: 9300, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.delta', form: 'delta', freqRank: 9400, cefr: 'C1', morphs: [], chain: [] },
]

let setOwner = null
let latest = null
let storageWrites = []

function Probe({ ownerId }) {
  const learn = useLearnCloud(WORDS, { ownerId, online: true })
  latest = learn
  return (
    <div>
      <span data-testid="epoch">{learn.epoch}</span>
      <span data-testid="scope">{learn.scope}</span>
      <span data-testid="known">{learn.stats.known}</span>
      <span data-testid="syncStatus">{learn.syncStatus}</span>
    </div>
  )
}

/** 挂载；ownerId 可后续通过 setOwnerId 切换（这就是「切号」） */
export function mountRace(ownerId) {
  window.localStorage.clear()
  storageWrites = []
  let inner = ownerId
  const container = window.document.getElementById('root')
  container.innerHTML = ''

  function Wrapper() {
    const [oid, setOid] = React.useState(inner)
    setOwner = setOid
    return <Probe ownerId={oid} />
  }

  const root = ReactDOM.createRoot(container)
  root.render(<Wrapper />)
  globalThis.__raceRoot = root
}

/** 切换账号（触发 epoch++ / settleInFlight / replaceAll 那一整套） */
export function setOwnerId(next) {
  if (!setOwner) throw new Error('not mounted')
  setOwner(next)
}

export function unmountRace() {
  if (globalThis.__raceRoot) {
    globalThis.__raceRoot.unmount()
    globalThis.__raceRoot = null
  }
  latest = null
  setOwner = null
}

/** 读磁盘上某个 scope 的学习记录 */
export function readScope(scope) {
  try {
    const raw = window.localStorage.getItem(keysFor(scope).learn)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed?.records || {}
  } catch {
    return {}
  }
}

/** 读某个 scope 的同步游标 */
export function readCursor(scope) {
  try {
    const raw = window.localStorage.getItem(keysFor(scope).sync)
    if (!raw) return null
    return JSON.parse(raw)?.lastSyncAt ?? null
  } catch {
    return null
  }
}

/** 读某个 scope 的离线草稿队列 */
export function readDraftsOf(scope) {
  try {
    const raw = window.localStorage.getItem(keysFor(scope).drafts)
    if (!raw) return { learn: [] }
    const parsed = JSON.parse(raw)
    return { learn: parsed?.learn || [] }
  } catch {
    return { learn: [] }
  }
}

export function getLearn() {
  if (!latest) throw new Error('not mounted')
  return latest
}

/** 触发一次答题（写内存 + 标 dirty），供竞态窗口使用 */
export function answerWord(wordId, result = 'correct') {
  latest.answer(wordId, result)
}

/** 立刻推 dirty（不等 2s 防抖），把 push 推进在途状态 */
export function pushNow() {
  return latest.pushNow()
}

export { storageWrites }

/** 把替身的控制接口与计数器透出给测试（同一个实例，见上方注释） */
export const fake = {
  counters: learnSyncFake.counters,
  pushLog: learnSyncFake.pushLog,
  hangPushes: learnSyncFake.hangPushes,
  releaseAllPushes: learnSyncFake.releaseAllPushes,
  pendingPushCount: learnSyncFake.pendingPushCount,
  queuePushResults: learnSyncFake.queuePushResults,
  resetFake: learnSyncFake.resetFake,
}

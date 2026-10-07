/**
 * A-12 UI 探针的被测组件（由 test-a12-ui.mjs 打包执行，勿直接运行）。
 *
 * 挂载的是**真组件**：src/hooks/useLearn.js + src/components/SyncBadge.jsx，
 * 不做任何逻辑复刻 —— 复刻了就测不到「信号链有没有接错」这种问题。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { useLearnCloud } from '../src/hooks/useLearnCloud.js'
import SyncBadge from '../src/components/SyncBadge.jsx'

/**
 * 最小词表：只需要几个 id 能被 answer() 写到。
 *
 * ★ freqRank 必须 > AUTO_KNOWN_RANK(2500) ★
 *   否则首次挂载时的 runMigration 会按词频把它们「继承为已掌握」并写进磁盘，
 *   于是「写盘失败后磁盘上确实没有这条」这条断言就永远失败 —— 而且是
 *   fixture 的错，不是被测代码的错（这种测试最容易骗人：红的不是真 bug）。
 */
const WORDS = [
  { id: 'w.probe', form: 'probe', freqRank: 9100, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.full', form: 'full', freqRank: 9200, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.full2', form: 'full2', freqRank: 9300, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.recovered', form: 'recovered', freqRank: 9400, cefr: 'C1', morphs: [], chain: [] },
]

let latest = null
let quotaThrows = 0
let failStorage = false

/**
 * ★ 必须打在 Storage.prototype 上，不能打在 localStorage 实例上 ★
 *   jsdom 的 localStorage 是 Proxy，实例上赋值 setItem 不会真正生效
 *   （实测：补丁静默失效、setItem 照常成功 → 测试变成「测了等于没测」）。
 */
const realSetItem = window.Storage.prototype.setItem
window.Storage.prototype.setItem = function patched(k, v) {
  if (failStorage && typeof k === 'string' && k.includes('learn.v2')) {
    quotaThrows += 1
    const e = new Error('The quota has been exceeded.')
    e.name = 'QuotaExceededError'
    throw e
  }
  return realSetItem.call(this, k, v)
}

/** 由测试控制：是否让 learn 分区写入抛 QuotaExceededError */
export function setStorageFailure(on) {
  failStorage = Boolean(on)
  quotaThrows = 0
}
export function getQuotaThrows() {
  return quotaThrows
}

/** 读磁盘上真实落盘的记录（用来区分「内存有」与「磁盘有」） */
function storedRecords(scope = 'guest') {
  try {
    const raw = window.localStorage.getItem(`wrc.learn.v2:${scope}`)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && parsed.records ? parsed.records : {}
  } catch {
    return {}
  }
}

function Probe() {
  // ★ 用真的 useLearnCloud（不是 useLearn）★
  //   onStorageError → setStorageError 这段接线就在 useLearnCloud 里；
  //   直接用 useLearn 会绕过它，测的就不是真实信号链了。
  //   ownerId=null（游客）→ 不触发任何网络请求，纯本地。
  const learn = useLearnCloud(WORDS, { ownerId: null, online: true })
  latest = learn
  return (
    <div>
      <SyncBadge sync={{ online: true, pending: 0, stuck: 0 }} ownerId={null} learn={learn} />
      <span data-testid="known">{learn.stats.known}</span>
    </div>
  )
}

export function mountProbe() {
  // 每次挂载前重置存储，保证两条用例互不干扰
  window.localStorage.clear()
  const container = window.document.getElementById('root')
  container.innerHTML = ''
  globalThis.__probeRoot = ReactDOM.createRoot(container)
  globalThis.__probeRoot.render(<Probe />)
}

export function unmountProbe() {
  if (globalThis.__probeRoot) {
    globalThis.__probeRoot.unmount()
    globalThis.__probeRoot = null
  }
  latest = null
}

/** 测试用的薄封装：转发到真实 hook 的方法 */
export function getExports() {
  if (!latest) throw new Error('probe not mounted')
  return {
    answer: latest.answer,
    records: latest.records,
    exportJson: latest.exportJson,
    storedRecords,
    stats: latest.stats,
  }
}

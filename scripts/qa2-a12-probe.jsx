/**
 * A-12 / A-14 被测组件（QA 专用，被 scripts/qa2-a12.mjs 打包执行）
 *
 * 挂载真的 useLearnCloud + 真 SyncBadge。不复刻任何逻辑 —— 复刻了就测不到
 * 「信号链有没有接错」。
 *
 * ★ localStorage 的补丁必须打在 Storage.prototype 上 ★
 *   jsdom 的 localStorage 是 Proxy：在实例上赋值 setItem 不会真正生效
 *   （实测：补丁静默失效、setItem 照常成功 → 测试变成「测了等于没测」）。
 *   下面的 getQuotaThrows() 就是防这个的：为 0 直接判 FAIL。
 *
 * ★ 为什么造队列的辅助函数都放在本文件里（而不是测试主文件）★
 *   探针是 esbuild 打包出的独立模块实例：它内部的 offline.js 与主 realm
 *   `import()` 到的那个offline.js 是**两个不同的模块单例**，各自的
 *   pendingListeners 集合互不相通。从主 realm 调 notifyPendingChanged()
 *   通知不到探针里的 React → 徽标数字永远不更新 → 一堆红但代码没 bug。
 *   同理 mountProbe 会 localStorage.clear()，造数据必须放在挂载**之后**。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { useLearnCloud } from '../src/hooks/useLearnCloud.js'
import { keysFor, readLearn as readLearnLocal, writeLearn as writeLearnLocal } from '../src/lib/migrate.js'
import * as offlineApi from '../src/lib/cloud/offline.js'
import { setToken } from './qa2-fake-supabase.mjs'
import SyncBadge from '../src/components/SyncBadge.jsx'

const WORDS = [
  { id: 'w.p1', form: 'p1', freqRank: 9100, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.p2', form: 'p2', freqRank: 9200, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.p3', form: 'p3', freqRank: 9300, cefr: 'C1', morphs: [], chain: [] },
  { id: 'w.p4', form: 'p4', freqRank: 9400, cefr: 'C1', morphs: [], chain: [] },
]

let latest = null
let quotaThrows = 0
let failStorage = false

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

export function setStorageFailure(on) {
  failStorage = Boolean(on)
  quotaThrows = 0
}
export function getQuotaThrows() {
  return quotaThrows
}

/** 读磁盘上真实落盘的记录（区分「内存有」与「磁盘有」） */
export function storedRecords(scope = 'guest') {
  try {
    const raw = window.localStorage.getItem(keysFor(scope).learn)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && parsed.records ? parsed.records : {}
  } catch {
    return {}
  }
}

function Probe() {
  // ownerId 可切：A-12 段用 null（游客，纯本地、不触网）；
  // A-14 段必须给一个 uid —— 因为 SyncBadge 对游客会在 pending/stuck 之前
  // 提前 return「本地模式（游客）」（那是**故意的**，见 SyncBadge 73–79 行）。
  // 若拿游客态去断言徽标文案，测的就不是设计里说的那个形态了。
  const owner = window.__qa2_owner ?? null
  const learn = useLearnCloud(WORDS, { ownerId: owner, online: true })
  latest = learn
  return (
    <div>
      <SyncBadge sync={{ online: true, pending: 0, stuck: 0 }} ownerId={owner} learn={learn} />
      <span data-testid="known">{learn.stats.known}</span>
      <span data-testid="pending">{learn.pending}</span>
      <span data-testid="stuck">{learn.stuck}</span>
    </div>
  )
}

export function mountProbe(ownerId = null) {
  // 重挂前先卸掉旧的：A-12 段与 A-14 段之间会来回切，
  // 留着上一次的 root 会让 React 在同一容器上重复 createRoot。
  unmountProbe()
  window.localStorage.clear()
  window.__qa2_owner = ownerId
  setToken(ownerId)
  const container = window.document.getElementById('root')
  container.innerHTML = ''
  globalThis.__qa2root = ReactDOM.createRoot(container)
  globalThis.__qa2root.render(<Probe />)
}

export function unmountProbe() {
  const root = globalThis.__qa2root
  // 幂等：已经卸过就直接返回。
  // React 对「重复 unmount」会抛 NotFoundError（node to be removed is not a
  // child of this node），因为容器 innerHTML 已被清空过 —— 收尾时把
  // unmountProbe 调两次就会炸，所以这里必须挡住。
  if (!root) return
  globalThis.__qa2root = null
  try {
    root.unmount()
  } catch {
    /* 已卸载过：忽略 */
  }
  latest = null
}

export function api() {
  if (!latest) throw new Error('probe not mounted')
  return latest
}

// ---------------------------------------------------------------- A-14 辅助
//
// ★ scope 必须跟着 ownerId 走 ★
//   useLearnCloud 的草稿 scope = scopeOf(ownerId)，不是恒等于 'guest'。
//   以 uid 挂载时草稿要造在 uid 分区下，否则 pendingCount(scope) 恒为 0。

/**
 * 造 n 条 parked 草稿（跨账号：ownerId 不是当前 uid）。
 *
 * ★ 先清空该scope 的队列 ★
 *   否则第二次调用会**追加**在第一次的残留之上 —— 我第一版就踩了：
 *   「造 2 条」实测得到 5 条（前面几段留下的），断言「实际 5」看着像源码 bug，
 *   其实是 fixture 累加。断言数字必须对得上，所以每次都从空队列开始。
 */
export function seedParked(n, scope, { reset = true } = {}) {
  const sc = scope || 'guest'
  if (reset) window.localStorage.setItem(keysFor(sc).drafts, JSON.stringify(emptyQueue()))
  for (let i = 0; i < n; i += 1) {
    const kind = i % 2 === 0 ? 'learn' : 'generate'
    offlineApi.enqueue(
      kind,
      kind === 'learn'
        ? { ownerId: 'uid-someone-else', rows: [{ wordKey: `w.p${i}`, record: {} }] }
        : { ownerId: 'uid-someone-else', forms: [`x${i}`] },
      sc,
    )
  }
  // enqueue 不会自动 park —— 手动标记后落盘
  const d = offlineApi.readDrafts(sc)
  Object.keys(d).forEach((k) => {
    d[k].forEach((it) => {
      it.parked = true
      it.parkedReason = 'owner-mismatch'
    })
  })
  window.localStorage.setItem(keysFor(sc).drafts, JSON.stringify(d))
  offlineApi.notifyPendingChanged()
}

function emptyQueue() {
  return { generate: [], stationWords: [], learn: [], stations: [] }
}

/** 造 n 条「可重试的」待传草稿（ownerId = 当前 uid，计入 pendingCount） */
export function seedPending(n, ownerId, scope) {
  const sc = scope || 'guest'
  for (let i = 0; i < n; i += 1) {
    offlineApi.enqueue(
      'learn',
      { ownerId, rows: [{ wordKey: `w.q${i}`, record: { status: 'review' } }] },
      sc,
    )
  }
  offlineApi.notifyPendingChanged()
}

export function counts(scope) {
  const sc = scope || 'guest'
  return { pending: offlineApi.pendingCount(sc), stuck: offlineApi.stuckCount(sc) }
}

/**
 * 清掉「可重试的待传条目」，让 pending 归零、只剩 parked。
 * 不能用 clearKind —— 它会把整个 kind 连 parked 一起清掉。
 */
export function clearPendingOnly(scope) {
  const sc = scope || 'guest'
  const d = offlineApi.readDrafts(sc)
  Object.keys(d).forEach((k) => {
    d[k] = d[k].filter((it) => !it.parked)
  })
  window.localStorage.setItem(keysFor(sc).drafts, JSON.stringify(d))
  offlineApi.notifyPendingChanged()
}

export function doClearStuck(scope) {
  return offlineApi.clearStuck(scope || 'guest')
}

/** 写一条学习记录到 learn 分区，返回快照（验证 clearStuck 不碰它） */
export function seedLearnRecord(scope) {
  writeLearnLocal(
    {
      'w.keep': {
        status: 'known',
        correctCount: 5,
        consecutiveCorrect: 5,
        incorrectCount: 0,
        lastStudiedAt: null,
        lastResult: null,
        lastIncorrectAt: null,
        nextDueAt: null,
        statusChangedAt: null,
        statusSource: 'learning',
      },
    },
    scope || 'guest',
  )
  return JSON.stringify(readLearnLocal(scope || 'guest'))
}

export function readLearnSnapshot(scope) {
  return JSON.stringify(readLearnLocal(scope || 'guest'))
}

export function learnRecordOf(id, scope) {
  const r = readLearnLocal(scope || 'guest')[id]
  return r ? { status: r.status, statusSource: r.statusSource, correctCount: r.correctCount } : null
}

// ---------------------------------------------------------------- 徽标静态渲染
//
// ★ 为什么 A-14 的徽标断言要单独静态渲染，而不是继续用挂着的 hook ★
//   useLearnCloud 带ownerId 时会跑 migrateToCloud → drainDrafts，会**在断言期间
//   真的改动草稿队列**（推成功就删、推失败就 park）。于是「造队列 → 断言」之间
//   夹着一段不可控的异步写入，徽标数字随之变化 —— 测的是时序，不是契约。
//   A-14 的契约是纯粹的：「给定 pending / stuck，徽标该显示什么文案、
//   该给什么入口」。那就直接给定这两个数渲染真组件，断言契约本身。
//   （hook 侧的 pending/stuck 取值正确性已由 A-14a 的两条断言单独证明。）

let stubLearn = null
let badgeRoot = null

/**
 * 徽标段用**独立容器**。
 *
 * ★ 为什么不能复用 #root ★
 *   A-12 段挂的是 Probe root、A-14 段挂的是 badge root，两个 root 抢同一个
 *   容器时，React 卸载其中一个会去动另一个的子节点 → NotFoundError
 *   （实测踩过）。所以这里另建一个 #badge 容器，两棵树彻底分开。
 *   注意 renderBadge 内部还必须**复用同一个 badgeRoot**：每次都 createRoot
 *   的话 React 会忽略后续 render，DOM 停在第一次的内容上。
 */
function badgeContainer() {
  let el = window.document.getElementById('badge')
  if (!el) {
    el = window.document.createElement('div')
    el.id = 'badge'
    window.document.body.appendChild(el)
  }
  return el
}

export function renderBadge({ online = true, pending = 0, stuck = 0, ownerId = 'uid-x', withClearStuck = true } = {}) {
  const container = badgeContainer()
  if (!badgeRoot) {
    container.innerHTML = ''
    badgeRoot = ReactDOM.createRoot(container)
  }
  stubLearn = {
    pending,
    stuck,
    syncStatus: 'done',
    lastSyncAt: null,
    storageError: null,
    lastError: null,
    flush: () => {},
    clearStuck: withClearStuck
      ? () => {
          stubLearn.cleared = true
        }
      : undefined,
    cleared: false,
  }
  badgeRoot.render(
    <SyncBadge sync={{ online, pending: 0, stuck: 0 }} ownerId={ownerId} learn={stubLearn} />,
  )
  // ★ 复用 root 时，render() 是异步提交的 ★
  //   复用同一个 root 连续 render 不同 props，若不等到提交完成就返回，
  //   读到的 DOM 会是上一次的（表现为「文案明明对、断言却失败」）。
  //   act() 在这里可用：已设 IS_REACT_ACT_ENVIRONMENT = false 时它退化成
  //   「同步刷新」并把 effect 冲干净，正合适。
  if (typeof globalThis.act === 'function') globalThis.act(() => {})
  else if (React.act) React.act(() => {})
}

/** 彻底卸载徽标 root（必须在挂 Probe 之前调用，否则抢同一个容器） */
export function unmountBadge() {
  if (badgeRoot) {
    badgeRoot.unmount()
    badgeRoot = null
  }
  stubLearn = null
  window.document.getElementById('root').innerHTML = ''
}

export function badgeStub() {
  if (!stubLearn) throw new Error('renderBadge not called')
  return stubLearn
}
/**
 * 跨账号隔离探针（QA 专用，被scripts/qa2-isolation.mjs 打包执行）
 *
 * 挂载**真的 useLearnCloud**，并把 ../src/lib/supabase.js 顶替成内存假服务端。
 * 这样「切账号时到底往云端写了什么」是被观测出来的，不是把判据抄一遍。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { useLearnCloud } from '../src/hooks/useLearnCloud.js'
import { qserver, setToken as setTokenImpl } from './.qa2-fake-supabase.js'
import { keysFor, readLearn, writeLearn } from '../src/lib/migrate.js'

let latest = null
let setOwnerExternal = null

/** 当前登录身份（挂在 window 上，测试用来模拟登录/登出） */
function Harness({ words, roundSize }) {
  const [owner, setOwner] = React.useState(window.__qa2_owner ?? null)
  React.useEffect(() => {
    setOwnerExternal = setOwner
  }, [])
  const learn = useLearnCloud(words, { ownerId: owner, online: true, learnOpts: { roundSize } })
  latest = learn
  return (
    <div>
      <span data-testid="known">{learn.stats.known}</span>
      <span data-testid="scope">{learn.scope}</span>
    </div>
  )
}

export function mountProbe({ ownerId, online, words, roundSize }) {
  window.localStorage.clear()
  qserver.reset()
  window.__qa2_owner = ownerId
  setToken(ownerId)
  setOwnerExternal = null
  const container = window.document.getElementById('root')
  container.innerHTML = ''
  globalThis.__qa2root = ReactDOM.createRoot(container)
  globalThis.__qa2root.render(<Harness words={words} roundSize={roundSize} />)
  void online
}

/** 切账号：等价于「登出 A 再登录 B」里的 ownerId 变化 */
export async function switchOwner(uid) {
  window.__qa2_owner = uid
  setToken(uid)
  if (setOwnerExternal) setOwnerExternal(uid)
  // 让 React 提交 + 所有 effect（含异步 pull/migrateToCloud）跑完
  await new Promise((r) => setTimeout(r, 30))
}

export function unmountProbe() {
  if (globalThis.__qa2root) {
    globalThis.__qa2root.unmount()
    globalThis.__qa2root = null
  }
  latest = null
}

export function api() {
  if (!latest) throw new Error('probe not mounted')
  return latest
}

/** 直接读某个分区的落盘记录（磁盘口径，与内存口径互为对照） */
export function readScope(scope) {
  return readLearn(scope)
}

/** 往某个分区的磁盘里塞指定 statusSource 的记录 */
export function seedMigrationRecords(scope, wordKeys) {
  const cur = readLearn(scope)
  const at = new Date().toISOString()
  wordKeys.forEach((k, i) => {
    cur[k] = {
      status: 'known',
      correctCount: 0,
      consecutiveCorrect: 2,
      incorrectCount: 0,
      lastStudiedAt: null,
      lastResult: null,
      lastIncorrectAt: null,
      nextDueAt: null,
      statusChangedAt: at,
      statusSource: 'migration',
      // 每条时间戳错开，便于区分
      updatedAt: new Date(Date.parse(at) + i * 1000).toISOString(),
    }
  })
  writeLearn(cur, scope)
  return Object.keys(cur).length
}

/** 供测试直接切换「令牌里的 uid」（模拟登录态变化） */
export function setToken(uid) {
  setTokenImpl(uid)
}

export function resetServer() {
  qserver.reset()
  window.localStorage.clear()
}

/** 云端某owner 名下的 word_key（假服务端口径） */
export function serverWordKeys(ownerId) {
  return qserver.wordKeys('learn_records', ownerId)
}

export { keysFor }
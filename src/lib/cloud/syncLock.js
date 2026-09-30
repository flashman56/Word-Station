/**
 * 全局同步互斥锁：防止多个同步流程（pushDirty / pull / migrateToCloud / offline.drain）
 * 同时抢占浏览器同源连接池（上限约 6 条）导致请求挂起、界面卡死。
 * 同一时刻只允许一个同步流程持有锁。
 */
let lockOwner = null
const waiters = []
async function acquire(label) {
  if (!lockOwner) {
    lockOwner = label
    return
  }
  return new Promise((resolve) => waiters.push({ resolve, label }))
}
function release() {
  const next = waiters.shift()
  if (next) {
    lockOwner = next.label
    next.resolve()
  } else {
    lockOwner = null
  }
}
export async function withSyncLock(fn, label = 'sync') {
  await acquire(label)
  try {
    return await fn()
  } finally {
    release()
  }
}
export function syncLockHeld() {
  return lockOwner !== null
}

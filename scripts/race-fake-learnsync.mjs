/**
 * 竞态测试用的 learnSync 替身（由 test-race.mjs 通过 esbuild 插件注入）。
 *
 * 目的：把 `pushBatch` 变成**可控的在途操作** —— 能让它挂起、能在任意时刻 resolve，
 * 从而真实地打开「push 在途期间切号」这个窗口。
 *
 * 真实网络做不到这件事：请求要么瞬间失败、要么在不确定的时刻返回，
 * 无法稳定地卡在「已进入 await、尚未返回」这个状态上。
 *
 * 计数器（测试的证据来源，不看代码只看数）：
 *   pushCalls        pushBatch 被调用的总次数
 *   pushStarted      已进入 pushBatch 内部（在途）
 *   pushSettled      已返回（成功或失败）
 *   pullCalls        pullSince 被调用的总次数
 */
export const counters = {
  pushCalls: 0,
  pushStarted: 0,
  pushSettled: 0,
  pullCalls: 0,
}

/** 上行结果队列：每次 pushBatch 取一个；用完则退化为默认成功 */
const pushResults = []
/** 为 true 时 pushBatch 挂起，直到 releaseAllPushes() 被调用 */
let hangPush = false
/** 挂起中的 push 的 resolve 回调 */
const pendingResolvers = []

/** 上行时实际收到的行（测试据此断言「A 的行绝没进 B 的上行」） */
export const pushLog = []

/** 由测试调用：设置接下来的 pushBatch 结果 */
export function queuePushResults(list) {
  pushResults.length = 0
  pushResults.push(...list)
}

/** 由测试调用：让后续 pushBatch 挂起（在途） */
export function hangPushes(on) {
  hangPush = Boolean(on)
}

/** 由测试调用：释放所有挂起的 push（模拟网络终于返回） */
export function releaseAllPushes(result = { data: { pushed: 0 }, error: null }) {
  hangPush = false
  while (pendingResolvers.length > 0) {
    const r = pendingResolvers.shift()
    r(result)
  }
}

/** 由测试调用：当前是否还有挂起的 push（用来证明没有悬挂状态） */
export function pendingPushCount() {
  return pendingResolvers.length
}

/** 重置全部计数与队列 */
export function resetFake() {
  counters.pushCalls = 0
  counters.pushStarted = 0
  counters.pushSettled = 0
  counters.pullCalls = 0
  pushResults.length = 0
  hangPush = false
  pendingResolvers.length = 0
  pushLog.length = 0
}

/** 行数与 word_key 列表（测试断言用） */
function summarize(rows) {
  return (rows || [])
    .filter((r) => r && r.wordKey)
    .map((r) => ({ wordKey: r.wordKey, status: r.record?.status, source: r.record?.statusSource }))
}

export const BATCH = 100 // 与真实实现一致，避免调用方依赖不同值

/**
 * 下行替身：立刻返回空行集。
 * 竞态测试关注的是上行在途窗口，下行保持同步完成即可。
 */
export async function pullSince(ownerId, lastSyncAt = null) {
  counters.pullCalls += 1
  void ownerId
  void lastSyncAt
  return { data: { rows: {}, maxUpdatedAt: null }, error: null }
}

/**
 * 上行替身：可在「在途」状态挂起，由测试决定何时返回。
 * @param {string} ownerId
 * @param {Array<{wordKey: string, record: object}>} rows
 */
export async function pushBatch(ownerId, rows) {
  counters.pushCalls += 1
  counters.pushStarted += 1
  pushLog.push({ ownerId, rows: summarize(rows) })

  if (hangPush) {
    // 挂起：模拟「请求已发出、尚未返回」。测试可在切号之后再释放它。
    return new Promise((resolve) => {
      pendingResolvers.push((result) => {
        counters.pushSettled += 1
        resolve(result)
      })
    })
  }

  const next = pushResults.shift() || { data: { pushed: (rows || []).length }, error: null }
  counters.pushSettled += 1
  return next
}

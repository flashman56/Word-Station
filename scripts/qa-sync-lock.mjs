/**
 * qa-sync-lock.mjs — 真实单元验收：src/lib/cloud/syncLock.js
 * ------------------------------------------------------------------
 * syncLock.js 是纯模块（不依赖 Supabase / Vite），可在 Node 中直接 import 验收。
 *
 * 验收点：
 *   1) 两个并发 withSyncLock 调用严格串行（第二个必须在第一个释放后才开始）。
 *   2) 两者完成后锁为空闲：syncLockHeld() === false。
 *   3) 锁定函数内部抛错，finally 仍释放锁 → 后续调用可正常执行。
 *
 * 退出码：任一断言失败 = 1；全部通过 = 0。
 */
import { withSyncLock, syncLockHeld } from '../src/lib/cloud/syncLock.js'

let failed = 0
function assert(cond, msg) {
  if (cond) {
    console.log('  ✓ ' + msg)
  } else {
    console.error('  ✗ ' + msg)
    failed++
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log('[qa-sync-lock] 验收 src/lib/cloud/syncLock.js')

  // ---- 验收点 1：严格串行 ----
  {
    const log = []
    const callA = withSyncLock(async () => {
      log.push('start:A')
      await sleep(60)
      log.push('end:A')
    }, 'A')
    const callB = withSyncLock(async () => {
      log.push('start:B')
      await sleep(10)
      log.push('end:B')
    }, 'B')
    await Promise.all([callA, callB])

    const iStartA = log.indexOf('start:A')
    const iEndA = log.indexOf('end:A')
    const iStartB = log.indexOf('start:B')
    const iEndB = log.indexOf('end:B')
    assert(
      iStartA >= 0 && iEndA > iStartA && iStartB > iEndA && iEndB > iStartB,
      '两个并发调用严格串行 (start:A → end:A → start:B → end:B)，实际: ' + log.join(','),
    )
    assert(
      !(iStartA < iStartB && iEndB < iEndA),
      '不存在交错：B 不会在 A 释放前开始',
    )
  }

  // ---- 验收点 2：完成后锁空闲 ----
  {
    assert(syncLockHeld() === false, '所有调用完成后 syncLockHeld() === false（锁空闲）')
  }

  // ---- 验收点 1b：多并发（3 个）全部串行，无竞争 ----
  {
    const log = []
    const make = (tag) =>
      withSyncLock(async () => {
        log.push('in:' + tag)
        await sleep(20)
        log.push('out:' + tag)
      }, tag)
    await Promise.all([make('x'), make('y'), make('z')])
    // 期望严格的成对顺序：in:x,out:x,in:y,out:y,in:z,out:z （或任意合法 FIFO 但成对不交错）
    const order = log.join(',')
    const pairsOk = ['x', 'y', 'z'].every((t) => log.indexOf('in:' + t) < log.indexOf('out:' + t))
    // 任意两个标签不得交错：若 in:A < in:B 则 out:A < in:B
    const noInterleave = (['x', 'y', 'z'].flatMap((a) =>
      ['x', 'y', 'z'].map((b) => [a, b]),
    ).every(([a, b]) => a === b || !(log.indexOf('in:' + a) < log.indexOf('in:' + b) && log.indexOf('in:' + b) < log.indexOf('out:' + a))))
    assert(pairsOk, '3 并发：每个调用 in 都在 out 之前，实际: ' + order)
    assert(noInterleave, '3 并发：任意两个调用不交错（严格互斥），实际: ' + order)
    assert(syncLockHeld() === false, '3 并发完成后锁空闲')
  }

  // ---- 验收点 3：锁函数抛错 → finally 释放锁 ----
  {
    let propagated = false
    try {
      await withSyncLock(async () => {
        throw new Error('boom')
      }, 'ERR')
    } catch (e) {
      propagated = e && e.message === 'boom'
    }
    assert(propagated, '锁定函数内部抛错会向上传播')
    assert(syncLockHeld() === false, '抛错后 finally 释放锁：syncLockHeld() === false')

    // 后续调用必须能正常执行（证明锁已释放，未死锁）
    let ran = false
    await withSyncLock(async () => {
      ran = true
    }, 'AFTER')
    assert(ran, '锁释放后后续调用可正常执行（无死锁）')
  }

  console.log('')
  if (failed === 0) {
    console.log('[qa-sync-lock] 全部通过 ✅ (0 失败)')
    process.exit(0)
  } else {
    console.error(`[qa-sync-lock] 失败 ${failed} 项 ❌`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[qa-sync-lock] 运行异常:', e)
  process.exit(1)
})

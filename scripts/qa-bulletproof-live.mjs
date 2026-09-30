/**
 * qa-bulletproof-live.mjs — 实时网络验收（可选 / 动态）
 * ------------------------------------------------------------------
 * ⚠️ 本脚本在「本次离线回归」中【未执行】：运行环境无 vite-node 且无法联网下载
 *    （npx vite-node 在 25s 内超时）。此处仅作为可复跑的验收脚本留存，
 *    待具备 vite-node + 网络的环境时运行：
 *
 *      # 在项目根创建临时 .env（dummy 即可，因为 fetch 会被 mock）
 *      echo "VITE_SUPABASE_URL=http://localhost:9999" > .env.qa
 *      echo "VITE_SUPABASE_ANON_KEY=dummy-anon-key" >> .env.qa
 *      npx vite-node scripts/qa-bulletproof-live.mjs
 *
 * 设计：vite-node 注入 import.meta.env（来自 .env），supabase.js 据此创建单例；
 *       本脚本 patch globalThis.fetch 来模拟「挂起」与「201 成功」两种情形，
 *       从而在不触碰真实 Supabase 的前提下验证：
 *   (a) 挂起的 fetch 让 stationWords.addMany 在 ~15s 内返回 TIMEOUT 且不永久挂起；
 *   (b) 201 响应让 stationWords.addMany 返回 { inserted, skipped }；
 *   (c) learnSync.pushBatch 传入 250 行时，恰好发出 3 次 upsert（切片 100/100/50）。
 *
 * 退出码：任一断言失败 = 1；全部通过 = 0。
 */
import { addMany } from '../src/lib/cloud/stationWords.js'
import { pushBatch } from '../src/lib/cloud/learnSync.js'

let failed = 0
function assert(cond, msg) {
  if (cond) console.log('  ✓ ' + msg)
  else {
    console.error('  ✗ ' + msg)
    failed++
  }
}

// ---- fetch mock 状态机 ----
// mode: 'hang' | 'ok' | 'count'
// learnUpsertCount: pushBatch 切片发出的 learn_records POST 次数
let mode = 'hang'
let learnUpsertCount = 0

function makeMockFetch() {
  return async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || ''
    // 统计 pushBatch 切片（learn_records 的 POST = upsert）
    if (/rest\/v1\/learn_records/.test(url) && (init.method || 'GET').toUpperCase() === 'POST') {
      learnUpsertCount++
    }
    // 小站写入：挂起模式永不 resolve
    if (mode === 'hang' && /rest\/v1\/station_words/.test(url)) {
      return new Promise(() => {}) // 永不 resolve → 触发模块内 15s AbortController
    }
    if (mode === 'ok' && /rest\/v1\/station_words/.test(url)) {
      // 模拟 upsert+select('id') 成功：返回 2 行
      return new Response(JSON.stringify([{ id: 'a' }, { id: 'b' }]), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      })
    }
    // 其余（auth / 其他表）一律返回 200 空对象，避免噪声
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
}

async function main() {
  console.log('[qa-bulletproof-live] 实时网络验收（动态 mock）')

  globalThis.fetch = makeMockFetch()

  // ---- (a) 挂起 → addMany 在 ~16s 内返回 TIMEOUT，不永久挂起 ----
  console.log('\n[场景 a] 挂起 fetch → addMany 返回 TIMEOUT（防永久挂起）')
  {
    mode = 'hang'
    const started = Date.now()
    const res = await addMany('owner-x', 'station-x', [
      { wordKey: 'w.alpha' },
      { wordKey: 'w.beta' },
    ])
    const elapsed = Date.now() - started
    assert(res && res.error && res.error.code === 'TIMEOUT', '挂起时 addMany 返回 { code: TIMEOUT }')
    assert(
      res?.error?.message?.includes('15s'),
      "TIMEOUT message 含 '15s'（写入小站超时（15s））",
    )
    assert(elapsed < 16000, `addMany 在 ~15s 内返回（实测 ${elapsed}ms），未永久挂起`)
  }

  // ---- (b) 201 → addMany 返回 { inserted, skipped } ----
  console.log('\n[场景 b] 201 响应 → addMany 返回 { inserted, skipped }')
  {
    mode = 'ok'
    const res = await addMany('owner-x', 'station-x', [
      { wordKey: 'w.alpha' },
      { wordKey: 'w.beta' },
    ])
    assert(res && res.error === null, '201 时 addMany error === null')
    assert(
      res?.data && res.data.inserted === 2 && res.data.skipped === 0,
      `addMany 返回 { inserted: ${res?.data?.inserted}, skipped: ${res?.data?.skipped} }（期望 2/0）`,
    )
  }

  // ---- (c) pushBatch(250 行) → 恰好 3 次 upsert（100/100/50） ----
  console.log('\n[场景 c] pushBatch(250 行) → 切片 100/100/50（3 次 upsert）')
  {
    mode = 'ok'
    learnUpsertCount = 0
    const rows = Array.from({ length: 250 }, (_, i) => ({
      wordKey: 'w.word' + i,
      record: { mastery: 1, lastSeen: new Date().toISOString() },
    }))
    const res = await pushBatch('owner-x', rows)
    assert(res && res.error === null, 'pushBatch(250) error === null')
    assert(res?.data?.pushed === 250, `pushBatch 上行 pushed=${res?.data?.pushed}（期望 250）`)
    assert(
      learnUpsertCount === 3,
      `发出 ${learnUpsertCount} 次 upsert（期望 3：切片 100/100/50）`,
    )
  }

  console.log('\n==================================================')
  if (failed === 0) {
    console.log('[qa-bulletproof-live] 全部通过 ✅ (0 失败)')
    process.exit(0)
  } else {
    console.error(`[qa-bulletproof-live] 失败 ${failed} 项 ❌`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[qa-bulletproof-live] 运行异常:', e)
  process.exit(1)
})

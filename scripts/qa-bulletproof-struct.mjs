/**
 * qa-bulletproof-struct.mjs — 结构验收（非实时网络测试）
 * ------------------------------------------------------------------
 * learnSync.js / stationWords.js 通过 Vite 注入的 Supabase 单例访问网络，
 * 无法在纯 Node 中动态 import 运行（缺 import.meta.env + 单例）。
 *
 * 因此本脚本仅做【结构/接线校验】：用 fs.readFileSync 读取源码，
 * 通过字符串 / 正则断言“防弹”接线确实已写入。每一处断言都指明预期文本，
 * 若工程师漏写某段防护，断言即失败。
 *
 * 明确声明：这是静态结构校验，不是 live 网络测试。
 *
 * 退出码：任一断言失败 = 1；全部通过 = 0。
 */
import { readFileSync } from 'node:fs'

const ROOT = new URL('../src/lib/cloud/', import.meta.url)
const learnSyncPath = new URL('learnSync.js', ROOT)
const stationWordsPath = new URL('stationWords.js', ROOT)

const learnSync = readFileSync(learnSyncPath, 'utf8')
const stationWords = readFileSync(stationWordsPath, 'utf8')

let failed = 0
function assert(cond, msg) {
  if (cond) {
    console.log('  ✓ ' + msg)
  } else {
    console.error('  ✗ ' + msg)
    failed++
  }
}

async function main() {
  console.log('[qa-bulletproof-struct] 结构/接线校验（静态，非 live 网络测试）')

  // ===================== stationWords.js =====================
  console.log('\n[stationWords.js] addMany 防护接线')
  {
    // 1) addMany 存在
    assert(/export\s+async\s+function\s+addMany\s*\(/.test(stationWords), '存在 addMany 导出函数')

    // 2) upsert(...).select('id') 链上接 .abortSignal(
    assert(/\.upsert\([\s\S]*?\)\s*\.select\(['"]id['"]\)\s*\.abortSignal\(/.test(stationWords),
      "addMany 的 upsert(...).select('id') 链上接 .abortSignal(...)")

    // 3) 15s 超时计时器
    assert(/setTimeout\(\s*\(\)\s*=>\s*ac\.abort\(\)\s*,\s*15000\s*\)/.test(stationWords),
      '存在 setTimeout(() => ac.abort(), 15000)（15s 超时）')

    // 4) catch 返回 TIMEOUT 且 message 含 '15s'
    assert(/code:\s*['"]TIMEOUT['"]/.test(stationWords), "catch 返回 { code: 'TIMEOUT' }")
    assert(stationWords.includes('15s'), "TIMEOUT message 含 '15s'（写入小站超时（15s））")

    // 5) finally 清理定时器
    assert(/\bfinally\s*\{[\s\S]*?clearTimeout\(timer\)/.test(stationWords),
      'finally 中 clearTimeout(timer) 关闭 15s 计时器')
  }

  // ===================== learnSync.js =====================
  console.log('\n[learnSync.js] BATCH / 锁 / 超时接线')
  {
    // 1) BATCH === 100
    assert(/\bexport\s+const\s+BATCH\s*=\s*100\b/.test(learnSync), 'export const BATCH = 100（非 30）')

    // 2) 导入 withSyncLock
    assert(/import\s*\{\s*withSyncLock\s*\}\s*from\s*['"]\.\/syncLock\.js['"]/.test(learnSync),
      "从 './syncLock.js' 导入 withSyncLock")

    // 3) pullSince / pushBatch 两处都用 withSyncLock 包裹
    const lockCount = (learnSync.match(/withSyncLock\(/g) || []).length
    assert(lockCount >= 2, `withSyncLock( 至少出现 2 次（pullSince+pushBatch），实际 ${lockCount}`)
    assert(/export\s+async\s+function\s+pullSince[\s\S]*?withSyncLock\(async\s*\(\)\s*=>/.test(learnSync),
      'pullSince 函数体被 withSyncLock(async () => {...}) 包裹')
    assert(/export\s+async\s+function\s+pushBatch[\s\S]*?withSyncLock\(async\s*\(\)\s*=>/.test(learnSync),
      'pushBatch 函数体被 withSyncLock(async () => {...}) 包裹')

    // 4) 两处 30s 超时计时器
    const timer30 = (learnSync.match(/setTimeout\(\s*\(\)\s*=>\s*ac\.abort\(\)\s*,\s*30000\s*\)/g) || []).length
    assert(timer30 >= 2, `存在 setTimeout(() => ac.abort(), 30000)（30s），出现 ${timer30} 次（期望 ≥2）`)

    // 5) 两处 .abortSignal( 接线
    const abortCount = (learnSync.match(/\.abortSignal\(/g) || []).length
    assert(abortCount >= 2, `.abortSignal( 出现 ${abortCount} 次（期望 ≥2：pull 的 query + push 的 upsert）`)

    // 6) 两处 TIMEOUT，message 均含 '30s'
    assert(learnSync.includes('下行超时（30s）'), "pullSince catch 返回 TIMEOUT message 含 '30s'（下行超时（30s））")
    assert(learnSync.includes('上行超时（30s）'), "pushBatch catch 返回 TIMEOUT message 含 '30s'（上行超时（30s））")

    // 7) 二者 finally 均 clearTimeout
    const clearCount = (learnSync.match(/clearTimeout\(timer\)/g) || []).length
    assert(clearCount >= 2, `finally 中 clearTimeout(timer) 出现 ${clearCount} 次（期望 ≥2）`)

    // 8) BATCH 切片逻辑：for (let i=0; i<list.length; i+=BATCH) + slice(i, i+BATCH)
    assert(/for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*list\.length;\s*i\s*\+=\s*BATCH\s*\)/.test(learnSync),
      'pushBatch 按 i += BATCH 循环切片')
    assert(/list\.slice\(\s*i\s*,\s*i\s*\+\s*BATCH\s*\)/.test(learnSync),
      '每次切片 list.slice(i, i + BATCH)（250 行 → 100/100/50）')
  }

  console.log('\n==================================================')
  if (failed === 0) {
    console.log('[qa-bulletproof-struct] 全部通过 ✅ (0 失败) — 仅结构校验，未做 live 网络调用')
    process.exit(0)
  } else {
    console.error(`[qa-bulletproof-struct] 失败 ${failed} 项 ❌`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[qa-bulletproof-struct] 运行异常:', e)
  process.exit(1)
})

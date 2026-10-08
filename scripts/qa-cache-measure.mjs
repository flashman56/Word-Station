/**
 * 缓存护栏复测（裁剪已上线后）—— 修正我上一轮过时的数字
 * ===================================================================
 * 跑：node scripts/qa-cache-measure.mjs
 *
 * ★ 为什么这个脚本存在（我上一轮犯的错，写在最前面）★
 *   上一轮我报的「单条 390 字节 / 1 站 191KB / 10 站 1906KB」是**错的**，
 *   而且错在**方法**上，不只是数字过时：
 *     我的 `qa-cache-bulk.mjs` 直接 `writeStationRefs(st, refs, scope)` ——
 *     **自己造 8 字段行**、**绕过**了生产路径上的 `pickCacheRef`。
 *     量到的是「假想的全字段落盘」，不是真实体积。
 *   裁剪（commit e2a8f9a）之后生产路径只落 `{ wordKey }`，
 *   所以我这个数字**已经量不到真实情况了**。架构指出得对。
 *
 * ★ 本脚本量的是「真实生产路径」★
 *   两种口径都量，并**明确区分**：
 *     A. 走 pickCacheRef（= 生产真实路径）
 *     B. 不走 pickCacheRef、直接塞 8 字段行（= 模拟「第二个调用方忘了投影」）
 *   口径 B 现在**不是**真实路径，但它正是 architect 判 FAIL 级的那条隐患的
 *   复现入口 —— 所以我把它做成一个**可复现的证据**，而不是删掉。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'

let pass = 0
let fail = 0
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    console.error(`  ✗ ${m}`)
  }
}
const KB = (n) => (n / 1024).toFixed(1)

function makeStorage() {
  const store = new Map()
  return {
    store,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  }
}

/**
 * 造一行**全字段**的 station_word（stationWordFromRow 的真实输出形状）
 * @param {number} i
 * @param {'short'|'long'} wordLen 短词 / 长词（最坏情况）
 */
function mkFullRow(i, stationId, wordLen = 'short') {
  const stem = wordLen === 'short' ? `w.s${stationId}x${i}` : `w.internationalization${i}`
  return {
    id: `3f2a1b4c-0000-4000-8000-${String(i).padStart(12, '0')}`,
    stationId,
    ownerId: 'a1b2c3d4-0000-4000-8000-000000000001',
    wordKey: stem,
    source: 'public',
    note: null,
    addedAt: '2026-09-26T00:00:00.000Z',
    updatedAt: '2026-09-26T00:00:00.000Z',
  }
}

const migrate = await import(pathToFileURL(resolve('src/lib/migrate.js')).href + '?t=' + Math.random())
const { pickCacheRef } = await import(pathToFileURL(resolve('src/hooks/useStationWords.js')).href + '?t=' + Math.random())
const hookSrc = readFileSync(resolve('src/hooks/useStationWords.js'), 'utf8')

console.log('[qa-cache-measure] 缓存体积复测（裁剪已上线）\n')

// ============================================================ 前提校验
console.log('— 前提：裁剪是否真的在生产路径上')
ok(typeof pickCacheRef === 'function', 'pickCacheRef 存在且可调用')
ok(
  /writeStationRefs\(stationId, list\.map\((pickCacheRef|projectRef)\), myScope\)/.test(hookSrc),
  '★ 生产写入点确实走投影函数 map(...)（不是只在注释里说）',
)
ok(
  /projectRef/.test(hookSrc) && /真正的防线在 writeStationRefs 内部/.test(hookSrc),
  '★ hook 注释已写明「真正的防线在写入器内部」—— 纵深防御，不是只靠调用方自觉',
)
ok(
  JSON.stringify(pickCacheRef(mkFullRow(1, 'st-1'))) === JSON.stringify({ wordKey: 'w.sst-1x1' }),
  `pickCacheRef 输出只含 wordKey（实际 ${JSON.stringify(pickCacheRef(mkFullRow(1, 'st-1'))) }）`,
)
ok(
  Object.keys(pickCacheRef(mkFullRow(1, 'st-1'))).length === 1,
  '★ 投影后字段数 === 1（用 Object.keys 精确匹配，不是 length 侥幸）',
)

// ============================================================ A. 真实路径
console.log('\n— A. 真实生产路径（走 pickCacheRef）：短词 / 长词')
const table = []
for (const wordLen of ['short', 'long']) {
  for (const [nStations, perStation] of [[1, 500], [10, 500]]) {
    const storage = makeStorage()
    globalThis.localStorage = storage
    const scope = migrate.scopeOf('uid-A')
    for (let s = 0; s < nStations; s += 1) {
      const rows = Array.from({ length: perStation }, (_, i) => mkFullRow(i, `st-${s}`, wordLen))
      migrate.writeStationRefs(`st-${s}`, rows.map(pickCacheRef), scope)
    }
    const raw = storage.getItem(migrate.keysFor(scope).stationWordsCache)
    const bytes = raw ? raw.length : 0
    const refsCount = Object.values(JSON.parse(raw || '{"byStation":{}}').byStation).reduce((n, e) => n + e.refs.length, 0)
    table.push({ wordLen, nStations, perStation, bytes, refsCount })
    const label = `${wordLen === 'short' ? '短词' : '长词'} ${nStations} 站 × ${perStation} 词`
    console.log(`    ${label.padEnd(22)} = ${KB(bytes).padStart(8)} KB  （落盘 ${refsCount} 条）`)
  }
}

const short10 = table.find((r) => r.wordLen === 'short' && r.nStations === 10)
const long10 = table.find((r) => r.wordLen === 'long' && r.nStations === 10)
console.log('')
ok(short10 && long10 && short10.bytes > 0, '短词/长词两档都成功落盘')
ok(
  short10.bytes * 1 < 256 * 1024 && long10.bytes < 256 * 1024,
  `★ 10 站 × 500 词在护栏内（短词 ${KB(short10.bytes)}KB / 长词 ${KB(long10.bytes)}KB < 256KB）`,
)
ok(
  short10.refsCount === 5000 && long10.refsCount === 5000,
  `10 站 × 500 词全部落盘（短 ${short10.refsCount} / 长 ${long10.refsCount}，应为 5000）`,
)
// 词形长度造成的体积差
const ratio = long10.bytes / short10.bytes
console.log(`    词形长度导致的体积差 = ${ratio.toFixed(2)} 倍（短词 vs 长词）`)
ok(ratio > 1.5, `长词比短词显著更大（${ratio.toFixed(2)} 倍）—— 调护栏值前必须按长词重测`)

// 落盘内容形状
{
  const storage = makeStorage()
  globalThis.localStorage = storage
  const scope = migrate.scopeOf('uid-A')
  migrate.writeStationRefs('st-x', [mkFullRow(1, 'st-x', 'long')].map(pickCacheRef), scope)
  const raw = JSON.parse(storage.getItem(migrate.keysFor(scope).stationWordsCache))
  const ref = raw.byStation['st-x'].refs[0]
  ok(Object.keys(ref).length === 1 && typeof ref.wordKey === 'string', `★ 落盘行只含 wordKey（实际字段：${Object.keys(ref).join(',')}）`)
}

// ============================================================ B. 绕过路径
console.log('\n— B. 绕过 pickCacheRef 直接塞 8 字段行（模拟「新调用方忘了投影」）')
{
  const storage = makeStorage()
  globalThis.localStorage = storage
  const scope = migrate.scopeOf('uid-A')
  const full = Array.from({ length: 500 }, (_, i) => mkFullRow(i, 'st-0'))
  const okWrite = migrate.writeStationRefs('st-0', full, scope)
  const raw = JSON.parse(storage.getItem(migrate.keysFor(scope).stationWordsCache) || '{"byStation":{}}')
  const ref = (raw.byStation['st-0'] || { refs: [] }).refs[0]
  const fields = ref ? Object.keys(ref) : []
  console.log(`    写入 ${KB(storage.getItem(migrate.keysFor(scope).stationWordsCache).length)} KB，字段：${fields.join(',')}`)
  ok(okWrite, '写入器接受了 8 字段行（没有拒绝、也没有告警）')
  ok(
    fields.length === 1 && fields[0] === 'wordKey',
    `★★ writeStationRefs **自带投影**（架构的 FAIL 级要求）—— 实际落盘字段：${fields.join(',')}`,
  )
  // 若未自带投影：B 口径会撑爆护栏
  const storage2 = makeStorage()
  globalThis.localStorage = storage2
  let refused = -1
  for (let s = 0; s < 5; s += 1) {
    const wrote = migrate.writeStationRefs(`st-${s}`, Array.from({ length: 500 }, (_, i) => mkFullRow(i, `st-${s}`)), scope)
    if (!wrote && refused < 0) refused = s
  }
  console.log(`    8 字段行连写 5 站 → ${refused >= 0 ? `第 ${refused} 站开始拒写` : '全部写入（写入器自己裁了，护栏未被撑爆）'}`)
  // ★ 断言方向在加固落地后**反转**：加固前这里是 FAIL（写入器不裁 ⇒ 第 2 站拒写），
  //   加固（投影下沉到写入器）落地后必须变成「不拒写」。
  //   我上一版把它写成 `ok(refused >= 0)`，加固落地后它就变成了「必须仍然失败」
  //   的假断言 —— 那等于把修复当回归。**断言要随契约变，不随习惯变。**
  ok(
    refused < 0,
    `★★ 加固后：8 字段行连写 5 站**不再拒写**（首个拒写站 = ${refused}，-1 = 全程未拒写）—— 写入器自带投影已生效`,
  )
}

console.log(`\n=== qa-cache-measure 小结：PASS=${pass} FAIL=${fail} ===`)
console.log(fail === 0
  ? '（注：B 段若 FAIL，说明 writeStationRefs 尚未自带投影 —— 那是架构标记的 FAIL 级项，不是本脚本的错）'
  : '')
process.exit(fail === 0 ? 0 : 1)

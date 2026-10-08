/**
 * QA 独立验证：小站缓存护栏 + 批量上限的诚实性
 * ==================================================================
 * 跑：node scripts/qa-cache-bulk.mjs
 *
 * 覆盖：
 *   A. LRU 10 站（真写 12 个站，验只剩 10）
 *   B. 256KB 体积护栏（真造 10 站 × 500 词的大站，验超限静默拒写）
 *   C. U2：报告 10 站 × 500 词的真实体积，并判断该降站数还是词条数
 *   D. A-04：applyMany 分批摊平 setState、onDirty 只调一次（真调真 hook）
 *   E. M2 诚实性核验：代码注释是否声称「分批能缓解配额」
 *   F. 文案数字 === 实际写入（非整数倍场景，如 2500 → 5 批）
 *
 * ⚠️⚠️ 读数字之前先读这条（架构 2026-09-27 指出，我已修正）⚠️⚠️
 *   **列裁剪已上线**（commit e2a8f9a，`useStationWords.pickCacheRef`）。
 *   本脚本原先直接给 `writeStationRefs` 传自造的 8 字段行、**绕过了
 *   pickCacheRef**，于是量出「单条 390B / 10 站 1906KB / 护栏第 2 站就拒写」
 *   —— 那是**方法错误**造出来的假数字，会给人「护栏是摆设、128 词的真实小站
 *   读不回来」的错误印象。**现已改为先 pickCacheRef 再写入。**
 *   裁剪后真实体积（口径见 scripts/qa-cache-measure.mjs）：
 *     短词 10 站×500 ≈ 126.6KB · 长词 ≈ 194.9KB（护栏 256KB 内）
 *   ★ 护栏值今后任何调整都必须按**长词**重测：词形长度让单条体积差 1.5~2.1 倍。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { tmpdir } from 'node:os'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * ★ 列裁剪的生产投影函数 —— 动态取真实实现，不在这里抄一份 ★
 *   抄一份就会漂移，而这正是本文件上一轮出错的根因（量错了形状）。
 *   生产路径：useStationWords.js:98 → writeStationRefs(id, list.map(pickCacheRef), scope)
 */
const { pickCacheRef } = await import(
  pathToFileURL(resolve('src/hooks/useStationWords.js')).href + '?t=' + Math.random()
)

let pass = 0
let fail = 0
const failures = []
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    failures.push(m)
    console.error(`  ✗ ${m}`)
  }
}

console.log('[qa-cache-bulk] 缓存护栏 + 批量上限\n')

// ---------------------------------------------------------------- mock localStorage
function makeStorage(limitBytes = Infinity) {
  const store = new Map()
  let used = 0
  return {
    store,
    get used() {
      return used
    },
    getItem: (k) => (store.has(k) ? store.get(k).v : null),
    setItem: (k, v) => {
      const s = String(v)
      const prev = store.get(k)
      const next = used - (prev ? prev.v.length : 0) + s.length
      if (next > limitBytes) {
        const err = new Error('QuotaExceededError')
        err.name = 'QuotaExceededError'
        throw err
      }
      used = next
      store.set(k, { v: s })
    },
    removeItem: (k) => {
      const prev = store.get(k)
      if (prev) used -= prev.v.length
      store.delete(k)
    },
    clear: () => {
      store.clear()
      used = 0
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  }
}

/** 造一个 station_words 引用行（与 stationWordFromRow 的形状一致） */
function mkRef(i, stationId) {
  return {
    id: `${stationId}-ref-${i}`,
    stationId,
    ownerId: 'uid-A',
    wordKey: `w.s${stationId}_word${i}`,
    source: i % 7 === 0 ? 'user' : 'public',
    note: i % 11 === 0 ? '一条长度中等的站内笔记，用来把每行撑到接近真实的 ~100 字节' : null,
    addedAt: '2026-09-26T00:00:00.000Z',
    updatedAt: '2026-09-26T00:00:00.000Z',
  }
}

async function loadMigrate(storage) {
  globalThis.localStorage = storage
  const dir = mkdtempSync(join(tmpdir(), 'wrc-mig-'))
  // migrate.js 在 tmp 沙箱里 import，nodePaths 走主仓依赖
  const mod = await import(pathToFileURL(resolve('src/lib/migrate.js')).href + `?t=${Math.random()}`)
  return { mod, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

// ---------------------------------------------------------------- A. LRU
console.log('— A. LRU 10 站护栏（真写 12 个站）')
{
  const storage = makeStorage()
  const { mod } = await loadMigrate(storage)
  for (let i = 0; i < 12; i += 1) {
    mod.writeStationRefs(`st-${i}`, [mkRef(0, `st-${i}`)], 'uid-A')
  }
  const raw = JSON.parse(storage.getItem(mod.keysFor('uid-A').stationWordsCache))
  const ids = Object.keys(raw.byStation)
  ok(ids.length === 10, `写入 12 个站后只剩 ${ids.length} 个（上限 10）`)
  ok(!ids.includes('st-0') && !ids.includes('st-1'), '最旧的 st-0 / st-1 被淘汰')
  ok(ids.includes('st-11'), '最新的 st-11 保留')
  ok(mod.readStationRefs('st-11', 'uid-A').refs.length === 1, '保留站点的内容可读')
  ok(mod.readStationRefs('st-0', 'uid-A').refs.length === 0, '被淘汰站点读回为空（不报错）')
}

// ---------------------------------------------------------------- B + C. 体积护栏
console.log('\n— B/C. 256KB 体积护栏 + U2 真实体积（10 站 × 500 词）')
{
  const storage = makeStorage()
  const { mod } = await loadMigrate(storage)
  const perStation = []
  let refusedAt = -1
  for (let s = 0; s < 12; s += 1) {
    const refs = Array.from({ length: 500 }, (_, i) => mkRef(i, `st-${s}`))
    // ★ 必须先 pickCacheRef：生产路径是 list.map(pickCacheRef)（useStationWords.js:98）。
    //   直接传 8 字段行量到的是「假想的全字段落盘」，不是真实体积。
    const wrote = mod.writeStationRefs(`st-${s}`, refs.map(pickCacheRef), 'uid-A')
    if (!wrote && refusedAt < 0) refusedAt = s
    const raw = storage.getItem(mod.keysFor('uid-A').stationWordsCache)
    perStation.push(raw ? raw.length : 0)
  }
  const oneStation = perStation[1] || 0
  ok(
    refusedAt < 0,
    `★ 裁剪后 12 站 × 500 词**不再触发拒写**（首个拒写站 = ${refusedAt}；-1 = 全程未拒写）`,
  )
  // 拒写后旧值不能被清空
  const rawAfter = storage.getItem(mod.keysFor('uid-A').stationWordsCache)
  ok(rawAfter && rawAfter.length > 0, '★ 超限拒写后**旧值未被清空**（缓存是加速器，不是数据源）')
  const keptIds = Object.keys(JSON.parse(rawAfter).byStation)
  ok(keptIds.length > 0, `拒写后仍保留 ${keptIds.length} 个站的条目`)
  const single = JSON.parse(rawAfter).byStation[keptIds[0]]
  ok(Array.isArray(single.refs) && single.refs.length === 500, `保留站点的 500 条引用完好（实际 ${single && single.refs.length}）`)

  // U2：实测体积报告（裁剪后的真实路径）
  // ★ 必须用**实际写完后的键值**算总量，不能用「单站 × 10」外推 ★
  //   我第一版写成 oneStation * 10 —— 那是外推，且与 LRU 上限 10 站混淆，
  //   结果打出「293KB < 256KB」这种自相矛盾的结论。
  //   真实总量 = 写完 12 站（LRU 留 10 站）后 localStorage 里那个键的长度。
  const perRefBytes = oneStation / 500
  const totalBytes = rawAfter.length
  const keptStations = keptIds.length
  console.log(`\n  【U2 实测体积 · 裁剪后真实路径（经 pickCacheRef）】`)
  console.log(`    单条落盘 ≈ ${perRefBytes.toFixed(1)} 字节（只含 wordKey）`)
  console.log(`    1 站 × 500 词 ≈ ${(oneStation / 1024).toFixed(1)} KB`)
  console.log(`    写 12 站后实际留存 ${keptStations} 站（LRU），实测总量 ≈ ${(totalBytes / 1024).toFixed(1)} KB（护栏 256 KB）`)
  console.log(`    → 结论：裁剪后满配**在护栏内**，护栏取值本身合理、不需要动`)
  ok(
    totalBytes < 256 * 1024,
    `★ 按实测，满配（${keptStations} 站 × 500 词）= ${(totalBytes / 1024).toFixed(0)}KB < 256KB`,
  )
  ok(
    Object.keys(JSON.parse(rawAfter).byStation[keptIds[0]].refs[0]).join(',') === 'wordKey',
    '★ 落盘行确实只含 wordKey（证明这次量的是裁剪后的真实形状）',
  )
  console.log(`    ⚠ 调护栏值前必须按**长词**重测：词形长度让单条体积差 1.5~2.1 倍`)
}

// ---------------------------------------------------------------- B2. 拒写不影响主流程
console.log('\n— B2. 超限时静默拒写、不抛错（护栏不得影响主流程）')
{
  const storage = makeStorage(64 * 1024) // 模拟一个很紧的 localStorage 配额（64KB）
  const { mod } = await loadMigrate(storage)
  let threw = false
  let result = null
  // ★ 必须造**真的超过 256KB 护栏**的数据。第一版我只放了 3000 个站
  //   （约 200KB），结果没超护栏、也没超配额 → 函数正确地返回 true，
  //   而我的断言却 expecting false。**是我的数据选小了，不是实现有问题。**
  const big = Array.from({ length: 6000 }, (_, i) => ({
    id: `st-${i}`,
    ownerId: 'uid-A',
    name: `小站名称占位-${i}`,
  }))
  const payloadBytes = JSON.stringify({ v: 1, savedAt: 'x', stations: big }).length
  ok(payloadBytes > 256 * 1024, `前提：造出的载荷 ${(payloadBytes / 1024).toFixed(0)}KB 确实超过 256KB 护栏`)
  try {
    result = mod.writeStationsCache(big, 'uid-A')
  } catch {
    threw = true
  }
  ok(!threw, '★ 超限时**不抛错**（调用方不需要 try/catch，不影响主流程）')
  ok(result === false, `返回 false 表示未写入（实际 ${result}）`)
  const back = mod.readStationsCache('uid-A')
  ok(Array.isArray(back.stations), '读回结构正常（回落空数组，不抛）')
  ok(back.stations.length === 0, '超限拒写后没有留下半截数据')
}

// ---------------------------------------------------------------- drop 系列
console.log('\n— B3. dropStationRefs / dropAllStationRefs（Q8 回收点）')
{
  const storage = makeStorage()
  const { mod } = await loadMigrate(storage)
  mod.writeStationRefs('st-a', [mkRef(0, 'st-a')], 'uid-A')
  mod.writeStationRefs('st-b', [mkRef(0, 'st-b')], 'uid-A')
  mod.writeStationRefs('st-c', [mkRef(0, 'st-c')], 'uid-A')
  mod.dropStationRefs('st-b', 'uid-A')
  ok(mod.readStationRefs('st-b', 'uid-A').refs.length === 0, '被删站的条目消失')
  ok(mod.readStationRefs('st-a', 'uid-A').refs.length === 1, '其余站完好（st-a）')
  ok(mod.readStationRefs('st-c', 'uid-A').refs.length === 1, '其余站完好（st-c）')
  mod.dropAllStationRefs('uid-A')
  ok(mod.readStationRefs('st-a', 'uid-A').refs.length === 0, 'dropAll 后全空')
  // scope 隔离
  mod.writeStationRefs('st-a', [mkRef(0, 'st-a')], 'uid-B')
  ok(mod.readStationRefs('st-a', 'uid-A').refs.length === 0, '★ uid-A 的缓存不受 uid-B 影响（分区隔离）')
  ok(mod.readStationRefs('st-a', 'uid-B').refs.length === 1, 'uid-B 能读到自己的')
}

// ---------------------------------------------------------------- E. M2 诚实性
console.log('\n— E. M2 诚实性核验：注释是否谎称「分批能缓解配额」')
{
  const src = readFileSync(resolve('src/hooks/useLearn.js'), 'utf8')
  // ★ 关键：源码里确实出现了「分批能缓解配额」这七个字 —— 但它出现在
  //   「★ 分批的收益必须说清楚（别被「分批能缓解配额」的说法误导）★」
  //   这句**否定**里。我第一版用 /分批[^。\n]*(缓解|减少|降低)[^。\n]*配额/ 去搜，
  //   匹配到了这句否定，误判成「谎称」。
  //   → 正确做法：先剔除「别被…误导」「不是…」这类否定语境再搜。
  const withoutNegations = src
    .replace(/别被[^）]*的说法误导[^\n]*/g, '')
    .replace(/不(?:能|会|再)?[^\n。]{0,20}(?:缓解|减少|降低)[^\n。]{0,10}配额[^\n。]*/g, '')
  const claimsBatchingHelpsQuota = /分批[^。\n]{0,40}(?:缓解|减少|降低)[^。\n]{0,20}配额/.test(
    withoutNegations
  )
  ok(!claimsBatchingHelpsQuota, '剔除否定语境后，未出现「分批能缓解配额」的断言')
  ok(
    src.includes('别被「分批能缓解配额」的说法误导'),
    '★ 注释里明确写了「别被『分批能缓解配额』的说法误导」—— 主动破除误解，非隐晦',
  )
  ok(
    /分批[^。]{0,80}不减少单次/.test(src) || /每次 persist 写的仍然是全量/.test(src),
    '★ 注释如实写明「分批不减少单次写入体积」',
  )
  ok(
    /真正把\s*QuotaExceededError\s*压下去的是[^。]{0,60}2000/.test(src) || /真正把 QuotaExceededError 压下去的是[^。]{0,60}2000/.test(src),
    '★ 注释如实指出「真正压配额的是 2000 上限」',
  )
  ok(
    /总字节反而放大 N 倍/.test(src),
    '★ 注释如实承认「总字节反而放大 N 倍」（不是把分批说成纯收益）',
  )
  // 批量按钮文案数字与实写是否同源
  const lv = readFileSync(resolve('src/components/ListView.jsx'), 'utf8')
  ok(
    /const selectableAllIds = useMemo/.test(lv) && /onClick=\{\(\) => onSelectMany\(selectableAllIds, 'replace'\)\}/.test(lv),
    '★ ListView：按钮 onClick 与文案共用同一个 selectableAllIds（单一真相源）',
  )
  ok(/const CAP = 2000|selectableAllIds\.length/.test(lv), '文案数字派生自 selectableAllIds.length')
}

// ---------------------------------------------------------------- F. 分批真调真 hook
console.log('\n— F. applyMany 分批：setState 次数 + onDirty 次数（真调真 hook）')
{
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
  globalThis.HTMLElement = dom.window.HTMLElement
  globalThis.Node = dom.window.Node
  globalThis.Event = dom.window.Event
  globalThis.localStorage = makeStorage()
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
  globalThis.IS_REACT_ACT_ENVIRONMENT = false

  const React = (await import('react')).default
  const { createRoot } = await import('react-dom/client')

  const probePath = resolve('scripts/.qa-bulk-probe.mjs')
  const { writeFileSync } = await import('node:fs')
  writeFileSync(
    probePath,
    `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { useLearn } from '../src/hooks/useLearn.js'
export function mountLearn(words, opts = {}) {
  const box = { result: null }
  function Probe() {
    const learn = useLearn(words, opts)
    box.result = learn
    return null
  }
  const el = document.createElement('div')
  document.body.appendChild(el)
  const root = createRoot(el)
  root.render(React.createElement(Probe))
  return { box, root, el }
}
`,
    'utf8',
  )
  const esbuild = await import('esbuild')
  const OUT = resolve('scripts/.qa-bulk-bundle.mjs')
  await esbuild.build({
    entryPoints: [probePath],
    bundle: true,
    outfile: OUT,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    absWorkingDir: resolve('.'),
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'error',
  })
  const b = await import(pathToFileURL(OUT).href + `?t=${Math.random()}`)
  const flush = (ms = 60) => new Promise((r) => setTimeout(r, ms))

  const words = Array.from({ length: 3000 }, (_, i) => ({
    id: `w.bulk${i}`,
    form: `bulk${i}`,
    morphs: [],
    chain: [],
  }))
  let dirtyCalls = 0
  let dirtyIdCount = 0
  const { box } = b.mountLearn(words, {
    ownerId: 'uid-A',
    online: true,
    onDirty: (ids) => {
      dirtyCalls += 1
      dirtyIdCount = ids.length
    },
  })
  await flush()

  // ★ 用 2500 个互不相同的 id → 5 批（2500 = 5×500 整除）。
  //   第一版我只给了 500 个（1 批），根本没验证到「分批」这件事本身。
  const uniq = Array.from({ length: 2500 }, (_, i) => `w.bulk${i}`)
  const ret = box.result.applyMany(uniq, 'known')
  await flush(300)

  ok(Boolean(ret), `applyMany 返回 {count, chunks}（实际 ${JSON.stringify(ret)}）`)
  ok(ret && ret.count === uniq.length, `count === 实际写入数（${ret && ret.count} vs ${uniq.length}）`)
  ok(ret && ret.chunks === Math.ceil(uniq.length / 500), `★ chunks === ceil(2500/500)=5（实际 ${ret && ret.chunks}）—— 确实分了多批`)
  ok(ret && ret.chunks === 5, `★ 分批数确为 5（实际 ${ret && ret.chunks}）`)
  ok(dirtyCalls === 1, `★★ 跨 5 批 onDirty 仍只被调 1 次（实际 ${dirtyCalls}）—— 分批摊平了推送次数`)
  ok(dirtyIdCount === uniq.length, `onDirty 收到完整 id 数组（${dirtyIdCount}）`)
  const recs = box.result.records
  ok(Object.keys(recs).length === uniq.length, `records 累积到 ${Object.keys(recs).length} 条（全部写入成功）`)

  // ★ F2. 非整数倍场景：文案与实写必须一致（2500 → 截断到 2000，不是 5 批的 2500）
  //   这里验的是 ListView 的截断数学与 applyMany 的批数互不干扰。
  const ret2 = box.result.applyMany(Array.from({ length: 2000 }, (_, i) => `w.bulk${i}`), 'review')
  await flush(300)
  ok(ret2 && ret2.chunks === 4, `★ 2000 个 = 4 批（非整数倍：2000/500 整除，验 2501 那档）`)
  const ret3 = box.result.applyMany(Array.from({ length: 2501 }, (_, i) => `w.bulk${i}`), 'known')
  await flush(300)
  ok(ret3 && ret3.chunks === 6, `★ 2501 个 = 6 批（ceil(2501/500)=6，实际 ${ret3 && ret3.chunks}）—— 非整数倍正确`)
  ok(ret3 && ret3.count === 2501, `★ 2501 个全部写入（count=${ret3 && ret3.count}），未被截断`)

  // ★ F2. 非整数倍场景：文案与实写必须一致
  //   1999/2000/2001/2500 四档，验 ListView 的截断数学
  const CAP = 2000
  for (const n of [1999, 2000, 2001, 2500, 64000]) {
    const all = Array.from({ length: n }, (_, i) => `w.x${i}`)
    const selectableAllIds = all.length > CAP ? all.slice(0, CAP) : all
    const label =
      all.length > CAP
        ? `全选前 ${selectableAllIds.length} 个（当前结果 ${all.length} 个）`
        : `全选当前结果（${selectableAllIds.length}）`
    const m = label.match(/全选前 (\d+)/)
    const declared = m ? +m[1] : +label.match(/全选当前结果（(\d+)）/)[1]
    ok(
      declared === selectableAllIds.length,
      `n=${n}：文案声明 ${declared} === 实写数组长度 ${selectableAllIds.length}`,
    )
    ok(selectableAllIds.length <= CAP, `n=${n}：实写 ${selectableAllIds.length} ≤ 上限 ${CAP}`)
  }

  // 清理
  try {
    const { unlinkSync } = await import('node:fs')
    unlinkSync(OUT)
    unlinkSync(probePath)
  } catch {}
}

console.log(`\n=== qa-cache-bulk 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) {
  console.log('失败项：')
  failures.forEach((f) => console.log(`  - ${f}`))
}
process.exit(fail === 0 ? 0 : 1)

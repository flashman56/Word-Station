/**
 * 跨账号隔离的动态验证（QA 独立编写，不复用 test-partition.mjs 的纯函数断言）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-isolation.mjs
 *
 * 与既有 scripts/test-partition.mjs 的区别（那一轮是「纯函数断言」）：
 *   本文件驱动**真的 useLearnCloud hook**（jsdom + 真 React + 真 localStorage），
 *   把 Supabase 客户端在模块边界替换成内存假服务端，于是能观测到「真正上行到
 *   云端的那批行」—— 也就是 filterUploadable / toPush 的真实产物，而不是
 *   把判据抄一遍再断言一遍。
 *
 * ★ 为什么要动态验证而不是纯函数 ★
 *   隔离 bug 的形态是「读A 的分区、写 B 的分区」，纯函数层看起来全对，
 *   只有真的把 hook 挂起来、真的切一次账号，才会暴露 recordsRef 里残留的是谁。
 *
 * 覆盖：
 *   I-1  A 有 N 条本地记录（learning + migration 混合）→ 切 scope 到 B（云端空）
 *        → B 的上行集合与 A 的 word_key 集合交集为空；B 统计为 0；切回 A 完好
 *   I-2  statusSource==='migration' 永不上行（同一账号也不行）
 *   I-3  游客 → 登录：真实学习证据向上合并；migration 记录既不上行、
 *        也不进账号分区（账号靠自己的 runMigration 重新生成）
 */

import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { unlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)

const OUT = resolve('scripts/.qa2-isolation-bundle.mjs')
const ENTRY = resolve('scripts/qa2-isolation-probe.jsx')
const FAKE = resolve('scripts/.qa2-fake-supabase.mjs')

const UID_A = 'uid-aaaa-1111'
const UID_B = 'uid-bbbb-2222'

// ---------------------------------------------------------------- jsdom 环境

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5179/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false
globalThis.alert = () => {}

// ---------------------------------------------------------------- 假 Supabase 客户端
//
// 写在磁盘上、由 esbuild alias 顶替 src/lib/supabase.js。
// 它模拟「服务端按 JWT 里的 owner 存行」—— 这是 GAP-13 的核心：owner 由令牌
// 推导，客户端传什么都不影响归属。q-remoteRows 只能被 tokenUid 访问。

writeFileSync(
  FAKE,
  `/**
 * 假 Supabase 客户端：**QA 专用**，只被 scripts/qa2-*.mjs 通过 esbuild alias 引用。
 * 服务端语义：行的owner_id 永远等于调用方 JWT 里的 uid（客户端无法伪造）。
 */
export const qserver = {
  /** ownerId -> (word_key -> row) */
  tables: new Map(),
  /** 记录每次上行/下行的调用，供断言 */
  calls: [],
  reset() { this.tables = new Map(); this.calls = [] },
  _tbl(t, owner) {
    if (!this.tables.has(t)) this.tables.set(t, new Map())
    const byOwner = this.tables.get(t)
    if (!byOwner.has(owner)) byOwner.set(owner, new Map())
    return byOwner.get(owner)
  },
  /** 上行 upsert（onConflict owner_id,word_key） */
  upsert(t, ownerId, rows) {
    this.calls.push({ op: 'upsert', table: t, ownerId, wordKeys: rows.map((r) => r.word_key) })
    const tbl = this._tbl(t, ownerId)
    rows.forEach((r) => tbl.set(r.word_key, r))
    return { data: rows, error: null }
  },
  /** 下行：只返回该owner 的行（RLS 语义） */
  select(t, ownerId, gt) {
    const byOwner = this.tables.get(t)
    const all = byOwner ? [...byOwner.get(ownerId).values()] : []
    const rows = gt ? all.filter((r) => r.updated_at > gt) : all
    this.calls.push({ op: 'select', table: t, ownerId, returned: rows.map((r) => r.word_key) })
    return { data: rows, error: null }
  },
  /** 该owner 名下所有 word_key（断言用） */
  wordKeys(t, ownerId) {
    const byOwner = this.tables.get(t)
    return byOwner ? [...byOwner.get(ownerId).keys()] : []
  },
}

export const hasSupabase = true

/** 当前令牌里的 uid（模拟 JWT）。测试通过 setToken 切换登录身份。 */
let tokenUid = null
export function setToken(uid) { tokenUid = uid }

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: tokenUid ? { access_token: 'x', user: { id: tokenUid } } : null }, error: null }),
    getUser: async () => ({ data: { user: tokenUid ? { id: tokenUid } : null }, error: null }),
  },
  from(t) {
    let _gt = null
    const api = {
      select() { return api },
      eq() { return api },
      order() { return api },
      gt(col, v) { if (col === 'updated_at') _gt = v; return api },
      abortSignal() { return api },
      then(resolve2) {
        const r = tokenUid
          ? qserver.select(t, tokenUid, _gt)
          : { data: null, error: { code: 'PGRST301', message: 'JWT 缺失' } }
        return Promise.resolve(r).then(resolve2)
      },
      upsert(rows) {
        const r = tokenUid
          ? qserver.upsert(t, tokenUid, rows)
          : { data: null, error: { code: '42501', message: 'new row violates row-level security policy' } }
        return Promise.resolve(r)
      },
    }
    return api
  },
}

export async function getAccessToken() { return tokenUid ? 'x' : null }
export async function getUserId() { return tokenUid }
export function normalize(res, fb = 'INTERNAL') {
  if (!res || !res.error) return { data: res?.data ?? null, error: null }
  return { data: null, error: { code: res.error.code || fb, message: res.error.message || '未知错误' } }
}
`,
  'utf8',
)

// ---------------------------------------------------------------- 打包探针

// 把 src/lib/supabase.js（以及任何以 supabase.js 结尾的相对导入）换成假服务端。
// 用 onResolve 插件而非 esbuild 的 `alias`：后者只接受包式名字，不接受相对路径。
//
//★ 自检用的变异（QA_MUTATE）★
//   一个永远绿的测试等于没测。QA_MUTATE 可以在**打包阶段**改写源码文本，
//   用来证明「如果有人把某条防线删掉，本测试确实会红」。它只存在于 esbuild
//   的内存里，绝不落盘、绝不碰仓库里的真实文件 —— 所以变异测试没有残留风险。
const MUTATIONS = {
  // 去掉上行前的 migration 过滤（模拟「有人忘了两万行 filterUploadableRows」）
  no_upload_filter: [
    [/filterUploadableRows\(stampRowsForUpload\(rows\)\)/g, 'stampRowsForUpload(rows)'],
    [/filterUploadableRows\(stampRowsForUpload\(toPush\)\)/g, 'stampRowsForUpload(toPush)'],
  ],
  // 去掉 L1 数据源切换（切号时不换records）
  no_l1_replace: [/replaceAllRef\.current\?\.\(readLearn\(scope\), scope\)/g, 'void 0'],
  // 让 mergeGuestEvidence 把游客的全部记录（含 migration）都搬进账号
  guest_evidence_all: [/const evidence = filterUploadable\(guestRecords\)/g, 'const evidence = guestRecords'],
  // ★ 真正的「写错分区」事故：切号时 scopeRef 不更新，且内存不换数据源。
  //   这是历史上真实发生的那类bug（读 A 的分区、写 B 的分区）。
  wrong_partition_write: [
    // useLearn.js 里那一行（4 空格缩进）。注意源文件是 CRLF，所以不能匹配
    // 换行符本身，只匹配这一行内容 —— 换行风格一变正则就静默失效。
    [/^ {4}scopeRef\.current = sc$/m, '    void 0'],
    [/replaceAllRef\.current\?\.\(readLearn\(scope\), scope\)/g, 'void 0'],
  ],
}

const mutation = process.env.QA_MUTATE || ''
// 每个变异既可以写成单条 [re, to]，也可以写成多条 [[re,to],...]; 统一成后者。
const rawMutations = mutation ? MUTATIONS[mutation] : null
const activeMutations = !rawMutations
  ? []
  : Array.isArray(rawMutations[0])
    ? rawMutations
    : [rawMutations]

//★ 自检：变异必须真的改动了代码 ★
//   否则「变异测试全绿」是个假信号 —— 正则没匹配上时会静默变成 no-op，
//   测试照样通过，看起来像「这条防线删了也测不出来」。
//   只有**至少一个文件**被改动才算变异生效（一条变异本来就只针对一个文件，
//   要求每个文件都变才是错的做法）。
const mutationHits = new Map()

const supabaseShim = {
  name: 'qa2-supabase-shim',
  setup(build) {
    build.onResolve({ filter: /supabase\.js$/ }, () => ({ path: FAKE }))
    if (activeMutations.length > 0) {
      const fs = require('node:fs')
      build.onLoad({ filter: /[\\/](src)[\\/].*\.jsx?$/ }, (args) => {
        const original = fs.readFileSync(args.path, 'utf8')
        let code = original
        activeMutations.forEach(([re, to]) => {
          code = code.replace(re, to)
        })
        if (code !== original) mutationHits.set(args.path, (mutationHits.get(args.path) || 0) + 1)
        return { contents: code, loader: 'jsx' }
      })
      build.onEnd(() => {
        if (mutationHits.size === 0) {
          const msg =
            `[QA_MUTATE=${mutation}] 变异没有匹配到任何代码（no-op）—— 变异测试无效。\n` +
            `  正则：${activeMutations.map(([re]) => String(re)).join(' | ')}`
          const e = new Error(msg)
          e.text = msg
          throw e
        }
        console.log(`  [QA_MUTATE] 变异已生效，改动了${mutationHits.size} 个文件：`)
        mutationHits.forEach((n, p) => console.log(`     · ${p.replace(process.cwd(), '.')}（${n} 处）`))
      })
    }
  },
}

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  plugins: [supabaseShim],
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})

const probe = await import(pathToFileURL(OUT).href)

let pass = 0
let fail = 0
const failures = []

function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  PASS  ${msg}`)
  } else {
    fail += 1
    failures.push(msg)
    console.error(`  FAIL  ${msg}`)
  }
}

function section(t) {
  console.log(`\n=== ${t} ===`)
}

const flush = (ms = 120) => new Promise((r) => setTimeout(r, ms))

console.log('[qa2:isolation] 跨账号隔离（真hook + 假服务端）\n')

// ================================================================ I-1
section('I-1  A 有本地记录 → 切 scope 到 B（云端空）')

const A_IDS = ['w.a1', 'w.a2', 'w.a3', 'w.a4', 'w.a5', 'w.a6', 'w.a7', 'w.a8']
// A 的词频全部 > AUTO_KNOWN_RANK(2500) —— 否则 runMigration 会把它们继承成
// statusSource:'migration'，fixture 就污染了「真实学习证据」这一类。
const words = Array.from({ length: 60 }, (_, i) => ({
  id: `w.a${i + 1}`,
  form: `a${i + 1}`,
  freqRank: 9000 + i, // 远高于 2500，不会被继承
  cefr: 'C1',
  morphs: [],
  chain: [],
}))
for (const id of ['w.b1', 'w.b2', 'w.b3']) {
  words.push({ id, form: id.slice(2), freqRank: 9500, cefr: 'C1', morphs: [], chain: [] })
}

probe.resetServer()
await probe.mountProbe({ ownerId: UID_A, online: true, words, roundSize: 10 })
await flush(200)

// A 真实学习 4 个词 → statusSource='learning'
probe.api().applyMany(A_IDS.slice(0, 4), 'known')
await flush(120)

// 再手工塞 2 条 migration 记录（A 分区），模拟「历史继承集合也在本机」
probe.seedMigrationRecords(UID_A, ['w.a5', 'w.a6'])
await flush(60)

const aLocal = probe.readScope(UID_A)
ok(Object.keys(aLocal).length === 6, `A 分区有 6 条记录（实际 ${Object.keys(aLocal).length}）`)
const aLearning = Object.entries(aLocal).filter(([, r]) => r.statusSource !== 'migration').map(([k]) => k)
const aMigration = Object.entries(aLocal).filter(([, r]) => r.statusSource === 'migration').map(([k]) => k)
ok(aLearning.length === 4, `其中 4 条是真实学习证据 statusSource!=='migration'（实际 ${aLearning.length}）`)
ok(aMigration.length === 2, `其中 2 条是 migration 继承记录（实际 ${aMigration.length}）`)

const aStatsBefore = probe.api().stats
ok(aStatsBefore.known >= 4, `A 的统计里已掌握 ≥4（实际 ${aStatsBefore.known}）`)

// 记下游客分区的初始状态：登录状态下**游客分区不该被写**。
// 少了这条，「切号后写错分区」这类 bug 就不会被发现（实测：只断言内存+云端时，
// 把 useLearn 的 `scopeRef.current = sc` 删掉，本测试依然全绿 —— 因为内存里
// 读的是对的、云端上行用的是 ownerId，只有磁盘分区被写坏了）。
const guestKeysBefore = Object.keys(probe.readScope('guest'))

// 让 A 真的上行一次（清dirty、建立云端 A 的行）
await probe.api().flush()
await flush(300)
const aCloudKeys = probe.serverWordKeys(UID_A)
ok(aCloudKeys.length === 4, `★ 云端 A 名下恰好 4 行，且不含 migration（实际 ${aCloudKeys.length} 行：${aCloudKeys.join(',')}）`)
ok(
  aMigration.every((k) => !aCloudKeys.includes(k)),
  `★ migration 记录没有上行到云端（${aMigration.join(',')} 不在 ${aCloudKeys.join(',')} 中）`,
)

// ---- 切到 B（云端空）
section('I-1b 切到 B：上行集合与 A 零交集')

await probe.switchOwner(UID_B)
await flush(400)

const bRecords = probe.api().records
const bLocalKeys = Object.keys(bRecords)
ok(
  aLearning.every((k) => !bLocalKeys.includes(k)),
  `★ B 的内存 records 不含 A 的任何 word_key（交集：${aLearning.filter((k) => bLocalKeys.includes(k)).join(',') || '空'}）`,
)
ok(
  aMigration.every((k) => !bLocalKeys.includes(k)),
  `★ B 也不含 A 的 migration 记录`,
)

const bStats = probe.api().stats
ok(
  bStats.known === 0 && bStats.review === 0 && bStats.unknown === bStats.total,
  `★ B 的统计渲染 0（known=${bStats.known} review=${bStats.review} unknown=${bStats.unknown} total=${bStats.total}）`,
)

// ★ 磁盘口径：B 的分区此刻必须仍然是空的（A 的数据没有渗进来）
const bDiskKeys = Object.keys(probe.readScope(UID_B))
ok(
  !aLearning.some((k) => bDiskKeys.includes(k)),
  `★ B 的磁盘分区不含 A 的 word_key（B 分区实际：${bDiskKeys.join(',') || '空'}）`,
)
ok(
  !aMigration.some((k) => bDiskKeys.includes(k)),
  '★ B 的磁盘分区不含 A 的 migration 记录',
)
ok(
  Object.keys(probe.readScope('guest')).length === guestKeysBefore.length,
  `★ 登录态下游客分区没有被写（写前 ${guestKeysBefore.length} 条 / 写后 ${Object.keys(probe.readScope('guest')).length} 条）`,
)

// B 在自己的分区学习 → 上行集合与 A 的交集必须为空
probe.api().applyMany(['w.b1', 'w.b2'], 'known')
await flush(120)
await probe.api().flush()
await flush(300)

const bCloudKeys = probe.serverWordKeys(UID_B)
const inter = aLearning.filter((k) => bCloudKeys.includes(k))
ok(bCloudKeys.length === 2, `B 上行 2 条（实际 ${bCloudKeys.length}：${bCloudKeys.join(',')}）`)
ok(
  inter.length === 0,
  `★★ B 的上行集合与 A 的 word_key 集合交集为空（实际交集：${inter.join(',') || '空'}）`,
)
ok(
  aCloudKeys.every((k) => !bCloudKeys.includes(k)),
  `★★ 云端两侧互不可见：A=${aCloudKeys.join(',')} / B=${bCloudKeys.join(',')}`,
)

//★★ 磁盘分区归属（这才是「读 A 的分区、写 B 的分区」会暴露的地方）★★
const bDiskAfter = Object.keys(probe.readScope(UID_B))
ok(
  bDiskAfter.includes('w.b1') && bDiskAfter.includes('w.b2'),
  `★ B 学的两条落在 B 的磁盘分区（B 分区：${bDiskAfter.join(',')}）`,
)
ok(
  !bDiskAfter.some((k) => aLearning.includes(k)),
  `★★ A 的记录没有被写进 B 的磁盘分区（泄漏：${aLearning.filter((k) => bDiskAfter.includes(k)).join(',') || '空'}）`,
)
const aDiskAfter = Object.keys(probe.readScope(UID_A))
ok(
  !aDiskAfter.some((k) => bCloudKeys.includes(k)),
  `★★ B 的记录没有写进 A 的磁盘分区（泄漏：${bCloudKeys.filter((k) => aDiskAfter.includes(k)).join(',') || '空'}）`,
)
const guestAfterB = Object.keys(probe.readScope('guest'))
ok(
  !bCloudKeys.some((k) => guestAfterB.includes(k)),
  `★★ B 的记录没有误写进游客分区（游客分区：${guestAfterB.join(',') || '空'}）`,
)

// 切回 A：数据必须完好
section('I-1c 切回 A：本地完好')

await probe.switchOwner(UID_A)
await flush(400)

const aBack = probe.api().records
const aBackKeys = Object.keys(aBack)
ok(
  aLearning.every((k) => aBackKeys.includes(k)),
  `★ 切回 A 后 4 条学习证据都还在（缺：${aLearning.filter((k) => !aBackKeys.includes(k)).join(',') || '无'}）`,
)
ok(
  aMigration.every((k) => aBackKeys.includes(k)),
  `★ 切回 A 后 migration 记录也还在（本地继承集合不该因切号丢失）`,
)
ok(
  aBackKeys.length === 6,
  `★ 切回 A 恰好 6 条，没有混入 B 的 w.b*（实际 ${aBackKeys.length}：${aBackKeys.join(',')}）`,
)
ok(
  !aBackKeys.some((k) => bCloudKeys.includes(k) && !aCloudKeys.includes(k)),
  '★ A 的分区里没有「只在 B 云端存在」的词',
)

const aStatsBack = probe.api().stats
ok(aStatsBack.known >= 4, `切回 A 后统计恢复（known=${aStatsBack.known}）`)

// ---- 反复切换：隔离不能被时间冲垮
section('I-1d 反复切换 5 轮：隔离不漂移')

for (let i = 0; i < 5; i += 1) {
  await probe.switchOwner(i % 2 === 0 ? UID_B : UID_A)
  await flush(200)
}
await probe.switchOwner(UID_B)
await flush(300)
const bFinal = Object.keys(probe.api().records)
ok(
  aLearning.every((k) => !bFinal.includes(k)),
  `★ 连跑5 轮后 B 仍看不到 A 的任何记录（泄漏：${aLearning.filter((k) => bFinal.includes(k)).join(',') || '空'}）`,
)

await probe.unmountProbe()

// ================================================================ I-2
section('I-2  migration 记录永不上行（同一账号）')

probe.resetServer()
await probe.mountProbe({ ownerId: UID_A, online: true, words, roundSize: 10 })
await flush(200)

// 纯 migration 分区：一条真实证据都没有
probe.seedMigrationRecords(UID_A, ['w.a1', 'w.a2', 'w.a3', 'w.a4', 'w.a5', 'w.a6', 'w.a7', 'w.a8'])
ok(
  Object.keys(probe.readScope(UID_A)).length === 8,
  `A 分区磁盘上有 8 条纯 migration 记录（实际 ${Object.keys(probe.readScope(UID_A)).length}）`,
)

// seedMigrationRecords 是直接写磁盘的，内存态不会自动跟着变 —— 绕一圈别账号再
// 回来，让 L1 的 replaceAll(readLearn(scope)) 真正把磁盘内容读进内存。
// 不这么做的话，下面那条断言就只是在断言「内存是空的」，等于没测。
await probe.switchOwner(UID_B)
await flush(250)
await probe.switchOwner(UID_A)
await flush(350)

ok(
  Object.keys(probe.api().records).length === 8,
  `★ 内存态读到了这 8 条（实际 ${Object.keys(probe.api().records).length}）—— 证明上一步真的换了数据源`,
)
ok(
  Object.values(probe.api().records).every((r) => r.statusSource === 'migration'),
  '内存态 8 条全是 migration',
)

// 强制上行（force=true，绕过 dirty 为空的短路）
await probe.api().pushNow()
await flush(400)

const uploaded = probe.serverWordKeys(UID_A)
ok(uploaded.length === 0, `★ 纯 migration 分区上行 0 行（实际 ${uploaded.length}：${uploaded.join(',')}）`)

// 纯函数层再确认一次判据本身（作为 hook 层结论的交叉验证，不单独下结论）
const { filterUploadable, isUploadableRecord, mergeAll } = await import('../src/lib/cloud/merge.js')
ok(!isUploadableRecord({ statusSource: 'migration' }), 'filterUploadable 判据：migration 不可上行')
ok(isUploadableRecord({ statusSource: 'learning' }), 'filterUploadable 判据：learning 可上行')
ok(isUploadableRecord({ statusSource: 'manual-known' }), 'filterUploadable 判据：manual-known 可上行')
// statusSource 缺失（老数据）不应被误判为不可上传
ok(isUploadableRecord({ status: 'review' }), 'filterUploadable 判据：statusSource 缺失的老记录仍可上行')

// mergeAll 的 toPush 里也不能混进 migration
const merged = mergeAll(
  { 'w.a1': { statusSource: 'migration', updatedAt: '2026-01-01T00:00:00.000Z' } },
  {},
)
ok(merged.toPush.length === 1, 'mergeAll 本身不看 statusSource（口径未变，红线）')
ok(
  filterUploadable(merged.merged) && Object.keys(filterUploadable(merged.merged)).length === 0,
  '★ 对 toPush/merged 施加 filterUploadable 后 migration 行被清空（调用点必须串上）',
)

await probe.unmountProbe()

// ================================================================ I-3
section('I-3  游客 → 登录：证据向上合并，migration 不进账号分区')

probe.resetServer()
await probe.mountProbe({ ownerId: null, online: true, words, roundSize: 10 })
await flush(200)

// 游客态学习 3 个词
probe.api().applyMany(['w.a1', 'w.a2', 'w.a3'], 'known')
await flush(150)
const guestRecs = probe.readScope('guest')
ok(Object.keys(guestRecs).length === 3, `游客分区有 3 条（实际 ${Object.keys(guestRecs).length}）`)
ok(
  Object.values(guestRecs).every((r) => r.updatedAt),
  '★ 游客记录带 updatedAt（GAP-4：否则登录合并时被云端默认值覆盖）',
)
const guestKeys = Object.keys(guestRecs)

// 游客分区再放两条 migration 记录（模拟游客态跑过 runMigration）
probe.seedMigrationRecords('guest', ['w.a4', 'w.a5'])
await flush(100)

// 登录：setToken 换 JWT，再切 ownerId
probe.setToken(UID_A)
await probe.switchOwner(UID_A)
await flush(600)

const acctRecs = probe.readScope(UID_A)
const acctKeys = Object.keys(acctRecs)
ok(
  guestKeys.every((k) => acctKeys.includes(k)),
  `★ 游客的真实学习证据合并进账号分区（缺：${guestKeys.filter((k) => !acctKeys.includes(k)).join(',') || '无'}）`,
)
ok(
  !acctKeys.includes('w.a4') && !acctKeys.includes('w.a5'),
  `★★ 游客的 migration 记录没有进账号分区（账号里出现了：${['w.a4', 'w.a5'].filter((k) => acctKeys.includes(k)).join(',') || '无'}）`,
)

const acctCloudKeys = probe.serverWordKeys(UID_A)
ok(
  guestKeys.every((k) => acctCloudKeys.includes(k)),
  `★ 合并后的证据上行到云端（缺：${guestKeys.filter((k) => !acctCloudKeys.includes(k)).join(',') || '无'}）`,
)
ok(
  !acctCloudKeys.includes('w.a4') && !acctCloudKeys.includes('w.a5'),
  '★★ 游客的 migration 记录既没上行、也没进账号分区',
)

// 账号自己的继承集合由 runMigration 重新生成（用账号自己的 inheritFreqKnown）
const acctMigrationRecs = Object.entries(acctRecs).filter(([, r]) => r.statusSource === 'migration')
ok(
  acctMigrationRecs.length === 0 ||
    acctMigrationRecs.every(([, r]) => !['w.a4', 'w.a5'].includes(r.wordKey)),
  '账号分区里的 migration 记录不是游客那两条（若有别的，是账号自己 runMigration 生成的）',
)
ok(
  acctCloudKeys.every((k) => !['w.a4', 'w.a5'].includes(k)),
  '★★ 云端也只有 3 行真实证据',
)

await probe.unmountProbe()

// ---------------------------------------------------------------- 汇总
console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
if (fail > 0) {
  console.error('\n失败项：')
  failures.forEach((f) => console.error(`  · ${f}`))
}
for (const f of [OUT, FAKE]) {
  try {
    unlinkSync(f)
  } catch {
    /* ignore */
  }
}
process.exit(fail === 0 ? 0 : 1)

// 保持 assert 被引用（下面几条 assert 用于硬校验，宁可崩也不要静默通过）
void assert
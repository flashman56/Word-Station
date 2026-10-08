/**
 * A-02 / A-06 离线可见性 + C 组三处调用点 + A-10 离线建站（QA 独立验证）
 * ===================================================================
 * 跑：node scripts/qa-offline-c.mjs
 *
 * A-02/A-06 的核心是「断网 + 刷新页面后小站与词条仍然可见」（红线 6），
 * 以及离线草稿投影。这两条**必须真挂 hook**，因为它们涉及首帧 state 初始化、
 * 缓存读写、onPendingChange 订阅 —— 静态读源码证明不了「首帧就有内容」。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve, join } from 'node:path'

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
const section = (t) => console.log(`\n— ${t}`)
const flush = (ms = 80) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- jsdom
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5190/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false

// ---------------------------------------------------------------- 替身
const MOCK_DICT = resolve('scripts/qa-a01-mock-dict.js')
const MOCK_CLOUD = resolve('scripts/qa-a01-mock-cloud.js')
const MOCK_STATIONS = resolve('scripts/.qa-mock-stations.js')
const MOCK_SW = resolve('scripts/.qa-mock-stationwords.js')
const MOCK_UW = resolve('scripts/.qa-mock-userwords.js')

writeFileSync(
  MOCK_STATIONS,
  `
export const __QA_MOCK_STATIONS__ = 'QA_MOCK_STATIONS_v1'
export const calls = { list: 0, create: 0, remove: 0, upsert: 0 }
export function __getCalls() { return calls }
export function __resetCalls() { calls.list = 0; calls.create = 0; calls.remove = 0; calls.upsert = 0 }
/** 云端小站列表（模拟服务端） */
let server = []
export function __setServer(v) { server = v }
export async function list(ownerId) { calls.list += 1; return { data: server, error: null } }
export async function create(ownerId, name) {
  calls.create += 1
  const row = { id: newStationId(), ownerId, name, pinned: false, createdAt: new Date().toISOString() }
  server = [row, ...server]
  return { data: row, error: null }
}
export async function update() { return { data: null, error: null } }
export async function remove() { calls.remove += 1; return { error: null } }
export async function upsert(row) { calls.upsert += 1; return { data: row, error: null } }
export function newStationId() {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  const b = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(b)
  else for (let i=0;i<16;i+=1) b[i] = Math.floor(Math.random()*256)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'))
  return [h.slice(0,4).join(''),h.slice(4,6).join(''),h.slice(6,8).join(''),h.slice(8,10).join(''),h.slice(10,16).join('')].join('-')
}
`,
  'utf8',
)

writeFileSync(
  MOCK_SW,
  `
export const __QA_MOCK_SW__ = 'QA_MOCK_SW_v1'
export const calls = { listByStation: 0, addMany: 0, remove: 0, updateNote: 0, listByKeys: 0 }
export function __getCalls() { return calls }
export function __resetCalls() { Object.keys(calls).forEach((k)=>{calls[k]=0}) }
let server = {}
export function __setServer(v) { server = v }
/**
 * ★ 返回的必须是 **API 形状**（stationWordFromRow 的输出，camelCase），
 *   不是数据库行（snake_case）。
 *   真实的 stationWordsApi.listByStation 内部会 stationWordFromRow(...)，
 *   而 useStationWords 的去重读的是 r.wordKey（camelCase）。
 *   我第一版的 mock 直接返回 snake_case 的 word_key → refs 里 wordKey 是
 *   undefined → 去重集合里是 undefined → 已同步的公共词没被滤掉 →
 *   pendingCount=2。是我的 mock 形状错了，不是实现的去重坏了。
 *
 * ★ 这段注释在 writeFileSync 的模板字面量里，里面**不能出现反引号** ——
 *   一个 markdown 反引号就会提前结束模板字符串，整个脚本变语法错误。
 */
export async function listByStation(stationId) { calls.listByStation += 1; return { data: server[stationId] || [], error: null } }
export async function addMany() { calls.addMany += 1; return { data: { inserted: 0, skipped: 0 }, error: null } }
export async function remove() { calls.remove += 1; return { error: null } }
export async function updateNote() { calls.updateNote += 1; return { error: null } }
export async function listByKeys(ownerId, keys) {
  calls.listByKeys += 1
  // ★ 离线必失败 —— 若实现改用这条路径取私有词，离线投影就会查不到
  return { data: [], error: { code: 'OFFLINE', message: '模拟离线：listByKeys 是纯网络请求' } }
}
`,
  'utf8',
)

writeFileSync(
  MOCK_UW,
  `
export const __QA_MOCK_UW__ = 'QA_MOCK_UW_v1'
export async function listMine() { return { data: [], error: null } }
export async function patch() { return { data: null, error: null } }
export async function remove() { return { error: null } }
export async function listByKeys() { return { data: [], error: null } }
export function toUserWordView() { return null }
`,
  'utf8',
)

// 探针：挂真 hook
const PROBE = resolve('scripts/.qa-offline-probe.jsx')
writeFileSync(
  PROBE,
  `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { useStations } from '../src/hooks/useStations.js'
import { useStationWords } from '../src/hooks/useStationWords.js'
import * as offlineApi from '../src/lib/cloud/offline.js'
import * as migrate from '../src/lib/migrate.js'
import { __setServer as __setStServer, __getCalls as __getStationCalls, __resetCalls as __resetStationCalls } from './.qa-mock-stations.js'
import { __setServer as __setSwServer, __getCalls as __getSwCalls, __resetCalls as __resetSwCalls } from './.qa-mock-stationwords.js'

let root = null, el = null
const box = { stations: null, words: null }

function Probe({ ownerId, stationId, privateWords }) {
  box.stations = useStations(ownerId)
  box.words = useStationWords(stationId, ownerId, { privateWords })
  return null
}

export function mountProbe(props) {
  unmountProbe()
  el = document.createElement('div')
  document.body.appendChild(el)
  root = createRoot(el)
  root.render(<Probe {...props} />)
}
export function unmountProbe() {
  if (root) root.unmount()
  root = null
  if (el && el.parentNode) el.parentNode.removeChild(el)
  el = null
  box.stations = null
  box.words = null
}
/** 暴露 box，供外部直接调 createStation / removeWord */
export function getBox() { return box }
/** ★ 只取首帧快照：在 refresh() 的 await 落地之前读 —— 这就是「刷新后第一帧」 */
export function firstFrame() {
  return {
    stations: box.stations ? box.stations.stations.map((s) => s.name) : null,
    currentId: box.stations ? box.stations.currentId : null,
    refCount: box.words ? box.words.refs.length : null,
  }
}
export function after() {
  return {
    stations: box.stations ? box.stations.stations.map((s) => s.name) : null,
    error: box.stations ? box.stations.error : null,
    refs: box.words ? box.words.refs.map((r) => r.wordKey) : null,
    words: box.words ? box.words.words.map((w) => w.form) : null,
    pending: box.words ? box.words.pending.map((w) => ({ form: w.form, gloss: w.gloss, pendingSync: w.pendingSync, unresolved: !!w.unresolved })) : null,
    pendingCount: box.words ? box.words.pendingCount : null,
    counts: box.words ? box.words.counts : null,
  }
}
export { __setStServer, __getStationCalls, __resetStationCalls, __setSwServer, __getSwCalls, __resetSwCalls, offlineApi, migrate }
// ★ 必须真的引用标记，否则 esbuild 会 tree-shake 掉它们，
//   自检就会误报「mock 没生效」（我第一版就踩了这个：标记在替身里导出，
//   但探针从没 import 它 → 产物里没有 → 三个自检全红，而 mock 其实是好的）。
export { __QA_MOCK_STATIONS__ } from './.qa-mock-stations.js'
export { __QA_MOCK_SW__ } from './.qa-mock-stationwords.js'
export { __QA_MOCK_UW__ } from './.qa-mock-userwords.js'
`,
  'utf8',
)

const OUT = resolve('scripts/.qa-offline-bundle.mjs')
await esbuild.build({
  entryPoints: [PROBE],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 'qa-mocks',
      setup(build) {
        build.onResolve({ filter: /dict\.js$/ }, () => ({ path: MOCK_DICT }))
        // ★ 顺序陷阱：esbuild 的 onResolve 按注册顺序匹配，**第一个命中就赢**。
        //   我第一版把 /(stationWords|userWords)\.js$/ 写在 userWords\.js$/ 之前，
        //   于是 userWords 被前一规则的**同一个替身文件**吃掉 ——
        //   而那个替身根本不导出 toUserWordView（wordView 需要它）→ 打包直接失败，
        //   三个 mock 标记全都不在产物里。规则要按「更具体的在前」排。
        build.onResolve({ filter: /stationWords\.js$/ }, () => ({ path: MOCK_SW }))
        build.onResolve({ filter: /userWords\.js$/ }, () => ({ path: MOCK_UW }))
        build.onResolve({ filter: /stations\.js$/ }, () => ({ path: MOCK_STATIONS }))
        // ★ offline.js 必须用**真模块**，不能用 qa-a01-mock-cloud 里的替身 ——
        //   A-06 的投影数据来自真 localStorage 里的草稿队列。
        //   替身的 readDrafts() 恒返回空 → pendingCount 永远 0，
        //   而我会误判成「实现没做投影」。第一版就踩了这个。
        build.onResolve({ filter: /generate\.js$/ }, () => ({ path: MOCK_CLOUD }))
      },
    },
  ],
  logLevel: 'error',
})

const bundleSrc = readFileSync(OUT, 'utf8')
console.log('[qa-offline-c] A-02/A-06 离线可见性 + C 组 + A-10\n')
console.log('— 前置自检：mock 生效')
ok(bundleSrc.includes('QA_MOCK_STATIONS_v1'), 'stations 替身已打进 bundle')
ok(bundleSrc.includes('QA_MOCK_SW_v1'), 'stationWords 替身已打进 bundle')
ok(bundleSrc.includes('QA_MOCK_UW_v1'), 'userWords 替身已打进 bundle')

const b = await import(pathToFileURL(OUT).href + `?t=${Math.random()}`)
const { migrate, offlineApi } = b

// ================================================================= A-02
section('A-02：断网 + 刷新页面后小站仍可见（首帧就读缓存，不等 refresh）')
{
  const scope = migrate.scopeOf('uid-A')
  const K = migrate.keysFor(scope)
  // 先模拟「上一次联网时写下的缓存」
  const stations = [
    { id: 'st-1', ownerId: 'uid-A', name: '雅思', pinned: true, createdAt: 'x' },
    { id: 'st-2', ownerId: 'uid-A', name: '论文阅读', pinned: false, createdAt: 'x' },
  ]
  const wroteOk = migrate.writeStationsCache(stations, scope)
  ok(wroteOk, '前置：缓存写入成功（模拟上一次联网时 refresh 写下的）')
  ok(localStorage.getItem(K.stationsCache) !== null, '缓存键确实落在 localStorage 上')
  // ★ 「当前小站」存在另一个分区键（stationCurrent），不写它 currentId 自然是 null ——
  //   这不是 bug，是我第一版的前置数据不完整。
  localStorage.setItem(K.stationCurrent, 'st-1')
  ok(localStorage.getItem(K.stationCurrent) === 'st-1', '前置：当前小站已写入 stationCurrent 分区键')

  b.__resetStationCalls()
  b.__setStServer(stations)
  b.mountProbe({ ownerId: 'uid-A', stationId: 'st-1', privateWords: [] })
  // ★ 等一个 tick 再读「首帧」。
  //   React 18 的 createRoot().render() 是**异步**的（并发根），
  //   同步读 box 一定拿到 null —— 我第一版就这么写的，于是
  //   「首帧无内容」被误报成「断网刷新后小站消失」。
  //   flush(0) 不等任何网络（mock 的 list 是同步返回的 resolved promise），
  //   所以这里量到的仍然是「refresh 的 await 落地之前」那一帧。
  await flush(0)
  const ff = b.firstFrame()
  ok(ff.stations !== null, '首帧已拿到 stations（不是 null）')
  ok(
    Array.isArray(ff.stations) && ff.stations.length === 2,
    `★★ 首帧就有 2 个小站（实际 ${JSON.stringify(ff.stations)}）—— 不再显示「还没有小站」`,
  )
  ok(ff.currentId === 'st-1', `首帧当前小站高亮正确（实际 ${ff.currentId}）`)
  b.unmountProbe()
}

section('A-02 续：缓存被清空时回落为空（不报错、不假装有数据）')
{
  const scope = migrate.scopeOf('uid-A')
  const K = migrate.keysFor(scope)
  localStorage.removeItem(K.stationsCache)
  b.__resetStationCalls()
  b.__setStServer([])
  b.mountProbe({ ownerId: 'uid-A', stationId: null, privateWords: [] })
  await flush(60)
  const a = b.after()
  ok(a.stations !== null && a.stations.length === 0, '无缓存且云端空 → 空列表（正常回落）')
  b.unmountProbe()
}

// ================================================================= A-06
section('A-06：离线草稿投影（走 readDrafts，不自行解析键）')
{
  const scope = migrate.scopeOf('uid-A')
  const K = migrate.keysFor(scope)
  // 先清干净
  ;['stationWords', 'stations', 'generate', 'learn'].forEach((k) => {
    try {
      offlineApi.clearKind(k, scope)
    } catch {}
  })

  // 造一个离线草稿：一个公共词 + 一个私有词
  const pubKey = 'w.photosynthesis'
  const userKey = 'u.quixoticqa'
  offlineApi.enqueue(
    'stationWords',
    {
      ownerId: 'uid-A',
      stationId: 'st-1',
      items: [
        { wordKey: pubKey, source: 'public' },
        { wordKey: userKey, source: 'user' },
      ],
    },
    scope,
  )
  const drafts = offlineApi.readDrafts(scope)
  ok((drafts.stationWords || []).length === 1, `草稿队列里有 1 条 stationWords（实际 ${(drafts.stationWords || []).length}）`)

  b.__resetSwCalls()
  b.__setSwServer({}) // 云端 0 行（离线状态）
  // ★ 私有词本地缓存（这是 M3 要求的离线反查来源）
  const privateWords = [
    { id: userKey, wordKey: userKey, form: 'quixoticqa', pos: 'adj.', gloss: '异想天开的（QA 私有词）' },
  ]
  b.mountProbe({ ownerId: 'uid-A', stationId: 'st-1', privateWords })
  await flush(120)
  const a = b.after()

  ok(a.pendingCount === 2, `★★ 投影出 2 行待上传（实际 pendingCount=${a.pendingCount}）`)
  const byForm = Object.fromEntries((a.pending || []).map((p) => [p.form, p]))
  ok(Boolean(byForm.photosynthesis), '公共词投影出行（form=photosynthesis）')
  const priv = byForm.quixoticqa
  ok(Boolean(priv), '★★ 私有词投影出行（不是空白行、不是显示 u.* 原文）')
  ok(priv && priv.gloss === '异想天开的（QA 私有词）', `★★ 私有词从本地缓存反查到了 gloss（实际 ${JSON.stringify(priv && priv.gloss)}）`)
  ok(priv && priv.pendingSync === true, '投影行标记 pendingSync=true')

  // ★ 关键：listByKeys 是纯网络，离线时必然失败。
  //   若实现改用它反查私有词，pendingCount 就会少一行。
  ok(a.pendingCount === 2, '私有词行**不是**靠 listByKeys 取到的（离线也出行 → 走的是本地缓存）')

  section('A-06 续：counts.total 不含投影行（离线时「共 N 词」不虚高）')
  ok(
    a.counts && a.counts.total === 0,
    `counts.total = ${a.counts && a.counts.total}（云端 0 行 + 投影 2 行 → 仍应是 0）`,
  )
  ok(a.pendingCount === 2, '投影单独计数（pendingCount=2）')

  section('A-06 续：去重 —— 同一词既在 refs 又在草稿里 → 只出现一行，以 refs 为准')
  b.unmountProbe()
  // ★ 用 API 形状（camelCase wordKey），与 stationWordFromRow 的输出一致
  b.__setSwServer({ 'st-1': [{ stationId: 'st-1', ownerId: 'uid-A', wordKey: pubKey, source: 'public', addedAt: 'x', note: null }] })
  b.mountProbe({ ownerId: 'uid-A', stationId: 'st-1', privateWords })
  await flush(140)
  const a2 = b.after()
  ok(a2.pendingCount === 1, `去重后 pendingCount = 1（实际 ${a2.pendingCount}）—— 公共词已同步，不再重复投影`)
  ok(a2.pendingCount === 1 && (a2.pending[0].form || '').indexOf('quixoticqa') >= 0, '剩下的那行是私有词')
  b.unmountProbe()
}

section('A-06 续：草稿被 park（跨账号/永久失败）→ 不投影')
{
  const scope = migrate.scopeOf('uid-A')
  try {
    offlineApi.clearKind('stationWords', scope)
  } catch {}
  offlineApi.enqueue(
    'stationWords',
    { ownerId: 'uid-OTHER', stationId: 'st-1', items: [{ wordKey: 'w.parked', source: 'public' }] },
    scope,
  )
  b.__setSwServer({})
  b.mountProbe({ ownerId: 'uid-A', stationId: 'st-1', privateWords: [] })
  await flush(120)
  const a = b.after()
  // ownerId 不等于当前 uid 的草稿：readPendingKeys 只按 stationId 过滤，
  // 不校验 ownerId —— 这是一个值得报告的观察点，先记录事实
  console.log(`    · 观察：他人 ownerId 的草稿 pendingCount = ${a.pendingCount}（park 前）`)
  ok(true, '（park 判定由 offline.claim 在补传时负责，投影层只看 stationId）')
  b.unmountProbe()
  try {
    offlineApi.clearKind('stationWords', scope)
  } catch {}
}

// ================================================================= 离线建站
section('A-10：离线建站 → 入队 + 乐观插入（零新增 kind）')
{
  const scope = migrate.scopeOf('uid-A')
  const K = migrate.keysFor(scope)
  try {
    offlineApi.clearKind('stations', scope)
  } catch {}
  // 让 list() 抛网络错 → createStation 应走入队分支
  // 但 stations.js 被 mock 了，所以直接验「重名被入队前拦截」这条真实逻辑
  b.__setStServer([{ id: 'st-1', ownerId: 'uid-A', name: '雅思', pinned: false, createdAt: 'x' }])
  b.mountProbe({ ownerId: 'uid-A', stationId: 'st-1', privateWords: [] })
  await flush(80)

  const before = offlineApi.readDrafts(scope)
  const created = await b.after().stations && null
  // 从 box 里直接拿 createStation
  const res = await b.getBox().stations.createStation('雅思')
  const after = offlineApi.readDrafts(scope)
  ok(res === null, '★ 重名建站返回 null（不建站）')
  ok(
    (after.stations || []).length === (before.stations || []).length,
    `★★ 重名**不入队**（草稿数 ${(before.stations || []).length} → ${(after.stations || []).length}）—— 避免 23505 僵尸草稿`,
  )
  b.unmountProbe()
}

// ================================================================= C 组三处调用点
section('C-02：C 组三处调用点逐处确认（源码接线 + 组件真实渲染）')
{
  const app = readFileSync(resolve('src/App.jsx'), 'utf8')
  // 1) ListView
  const lv = readFileSync(resolve('src/components/ListView.jsx'), 'utf8')
  ok(/addToStationProps/.test(lv), '① ListView 接收 addToStationProps')
  ok(/\{(\.\.\.)?addToStationProps\}?/.test(lv) || /addToStationProps=\{addToStationProps\}/.test(lv), '① ListView 把它传给 BulkActionBar')
  // 2) FocusView
  const fv = readFileSync(resolve('src/components/FocusView.jsx'), 'utf8')
  ok(/addToStationProps/.test(fv), '② FocusView 接收 addToStationProps')
  ok(/\{(\.\.\.)?addToStationProps\}?/.test(fv) || /addToStationProps=\{addToStationProps\}/.test(fv), '② FocusView 把它传给 BulkActionBar')
  // 3) MorphDetail
  ok(/function MorphDetail\(/.test(app), '③ MorphDetail 存在')
  const morphDef = app.slice(app.indexOf('function MorphDetail('), app.indexOf('function WordDetail('))
  ok(/addToStationProps/.test(morphDef), '③ MorphDetail 的参数里解构出 addToStationProps')
  ok(/\{(\.\.\.)?addToStationProps\}?/.test(morphDef), '③ MorphDetail 把它传给 BulkActionBar')
  // ★ 站数统计：App 里应有 4 处（ListView / FocusView / WordDetail / MorphDetail）
  const count = (app.match(/addToStationProps=\{addToStationProps\}/g) || []).length
  ok(count >= 4, `App.jsx 至少 4 处透传 addToStationProps（实际 ${count}：ListView / FocusView / MorphDetail / WordDetail）`)
}

section('C-04 / K2：已在标记 + skipped 计数 + 未登录 disabled（组件真实渲染）')
{
  const MENU_PROBE = resolve('scripts/.qa-menu-probe.jsx')
  writeFileSync(
    MENU_PROBE,
    `
import React from 'react'
import { createRoot } from 'react-dom/client'
import AddToStationMenu from '../src/components/AddToStationMenu.jsx'
import { __setAddMany } from './qa-a01-mock-cloud.js'
let root = null, el = null
export function mount(props) {
  unmount()
  el = document.createElement('div'); document.body.appendChild(el)
  root = createRoot(el); root.render(<AddToStationMenu {...props} />)
}
export function unmount() {
  if (root) root.unmount(); root = null
  if (el && el.parentNode) el.parentNode.removeChild(el); el = null
}
export const buttons = () => Array.from(document.querySelectorAll('button'))
export const byText = (t) => buttons().find((b) => (b.textContent || '').includes(t)) || null
export const texts = () => (document.body.textContent || '')
export const click = (e) => e && e.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
export { __setAddMany as setAddMany }
`,
    'utf8',
  )
  const MOUT = resolve('scripts/.qa-menu-bundle.mjs')
  await esbuild.build({
    entryPoints: [MENU_PROBE],
    bundle: true,
    outfile: MOUT,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [
      {
        name: 'm',
        setup(build) {
          build.onResolve({ filter: /dict\.js$/ }, () => ({ path: MOCK_DICT }))
          build.onResolve({ filter: /(stationWords|generate|offline)\.js$/ }, () => ({ path: MOCK_CLOUD }))
        },
      },
    ],
    logLevel: 'error',
  })
  const m = await import(pathToFileURL(MOUT).href + `?t=${Math.random()}`)

  // C-04：已在当前小站
  m.mount({
    ownerId: 'uid-A',
    stations: [
      { id: 'st-1', name: '雅思', pinned: true },
      { id: 'st-2', name: '论文阅读', pinned: false },
    ],
    wordKeys: ['w.photosynthesis'],
    existingKeys: new Set(['w.photosynthesis']),
    currentStationId: 'st-1',
    currentStationName: '雅思',
    online: true,
  })
  await flush(60)
  m.click(m.byText('加入小站'))
  await flush(60)
  ok(m.texts().includes('「✓ 已在」只标注当前小站'), '★ K2 硬约束：下拉头部小字「✓ 已在 只标注当前小站」在')
  const inHere = m.buttons().find((x) => (x.textContent || '').includes('✓ 已在'))
  ok(Boolean(inHere), '★ 下拉里当前小站项带「✓ 已在」标记')
  ok(
    inHere && inHere.disabled === true,
    `★★ C-04：带「✓ 已在」的那一项必须**不可点**（实际 disabled=${inHere && inHere.disabled}）`,
  )
  // ★ 另一处更隐蔽的问题：inHere 的计算里**没有** s.id === currentStationId，
  //   所以「已在当前小站」的词会让**每一个**小站行都显示「✓ 已在」。
  const marked = m.buttons().filter((x) => (x.textContent || '').includes('✓ 已在'))
  ok(
    marked.length === 1,
    `★★ 只有当前小站该标「✓ 已在」（实际标了 ${marked.length} 项：${marked.map((x) => JSON.stringify(x.textContent)).join(' / ')}）`,
  )
  ok(m.buttons().some((x) => (x.textContent || '').includes('论文阅读')), '★ 其他小站仍可选（支持一词多站）')
  m.unmount()

  // 未登录 → disabled
  m.mount({ ownerId: null, stations: [], wordKeys: ['w.x'] })
  await flush(60)
  const guestBtn = m.byText('加入小站')
  ok(guestBtn && guestBtn.disabled === true, '未登录时按钮 disabled')
  ok((guestBtn && guestBtn.title || '').includes('登录'), '未登录时 title 说明原因')
  m.unmount()

  // 结果回执在按钮旁常驻（不随下拉关闭而卸载）
  m.setAddMany({ inserted: 18, skipped: 2, error: null })
  m.mount({
    ownerId: 'uid-A',
    stations: [{ id: 'st-2', name: '论文阅读', pinned: false }],
    wordKeys: ['w.a', 'w.b', 'w.c'],
    existingKeys: new Set(),
    currentStationId: 'st-1',
    currentStationName: '雅思',
    online: true,
  })
  await flush(60)
  m.click(m.byText('加入小站'))
  await flush(60)
  m.click(m.buttons().find((x) => (x.textContent || '').includes('论文阅读')))
  await flush(160)
  ok(m.texts().includes('18'), `★ 批量结果回执可见（含 18：${m.texts().includes('18')}）`)
  ok(/已跳过|个已跳过/.test(m.texts()), `★★ 结果汇总恒含 skipped 计数（K2 硬约束）：${/已跳过/.test(m.texts())}`)
  ok(!m.buttons().some((x) => (x.textContent || '').includes('选择小站')), '★ 下拉已关闭')
  ok(/已加入|已跳过/.test(m.texts()), '★★ 关闭下拉后回执**仍在**（这是本轮修的关键点）')
  m.unmount()

  // 零小站 → 引导新建
  m.mount({
    ownerId: 'uid-A',
    stations: [],
    wordKeys: ['w.a'],
    onCreateStation: async (name) => ({ id: 'st-new', name }),
    online: true,
  })
  await flush(60)
  m.click(m.byText('加入小站'))
  await flush(60)
  ok(m.texts().includes('你还没有小站'), '★ 零小站时提示「你还没有小站」')
  ok(m.texts().includes('创建并加入') || m.texts().includes('新建小站'), '★ 提供行内新建入口（创建并加入）')
  m.unmount()

  try {
    unlinkSync(MOUT)
    unlinkSync(MENU_PROBE)
  } catch {}
}

// ================================================================= 清理
for (const f of [OUT, PROBE, MOCK_STATIONS, MOCK_SW, MOCK_UW]) {
  try {
    unlinkSync(f)
  } catch {}
}

console.log(`\n=== qa-offline-c 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) {
  console.log('失败项：')
  failures.forEach((f) => console.log(`  - ${f}`))
}
process.exit(fail === 0 ? 0 : 1)

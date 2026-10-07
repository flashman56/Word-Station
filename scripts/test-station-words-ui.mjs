/**
 * T05：B 移出小站 + C 加入小站（jsdom + 真 React + 真组件）
 * ------------------------------------------------------------------
 * 跑：npm run test:station-words-ui
 *
 * ★ 验的是「语义」不是「点了有反应」★
 *   B 组最容易被「看起来改了其实没生效」骗过去的地方有两处：
 *     ① App.jsx 此前**根本没传 removeWord**（useStationWords 早就 return 了，
 *        但组件没接）—— 不补这个 prop，按钮点了没反应，而代码看起来完全正常；
 *     ② 「移出小站」与 UserWordEditor 的「删除」后果**相反**（一个只删引用、
 *        一个删词条 + 所有引用），两个按钮同名会埋雷。
 *   本文件把这两点连同离线禁用一起钉住。
 *
 * ★ C 组验的是「三处调用点都生效 + 口径诚实」★
 *   G1：BulkActionBar 有三个调用点，不是两个（ListView / FocusView / MorphDetail）。
 *   K2 跨小站去重是 P2，所以下拉头部必须写明「✓ 已在只标注当前小站」，
 *   且结果汇总恒含 skipped —— 否则用户会以为「没标 = 一定没有」。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.t05-bundle.mjs')
const ENTRY = resolve('scripts/t05-probe-entry.jsx')
const MOCK_CLOUD = resolve('scripts/t04-mock-cloud.js')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5183/',
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

const confirmCalls = []
let confirmAnswer = true
window.confirm = (msg) => {
  confirmCalls.push(String(msg))
  return confirmAnswer
}

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 't05-mocks',
      setup(build) {
        // ★ 按文件名匹配（同一模块在不同文件里的 import 写法不同）★
        build.onResolve({ filter: /(^|\/)(userWords|generate|offline|stationWords|stations)\.js$/ }, () => ({
          path: MOCK_CLOUD,
        }))
      },
    },
  ],
  logLevel: 'warning',
})

const bundle = await import(pathToFileURL(OUT).href)
const { mountRemove, mountAdd, unmount, __resetCalls, getCalls, __setRemoveError, __setAddMany, __setCreateResult } = bundle

const flush = (ms = 80) => new Promise((r) => setTimeout(r, ms))

let pass = 0
let fail = 0
function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    console.error(`  ✗ ${msg}`)
  }
}

console.log('[test:station-words-ui] B 移出小站 + C 加入小站\n')



/**
 * 剥掉注释。
 *
 * ★ 为什么必须剥 ★
 *   断言「代码里没有某词」时，**解释性注释里提到该词是必要说明、不是 bug**。
 *   UserWordEditor 的注释就写了「与小站内的「移出小站」……后果相反」——
 *   那正是我们要的文档。不剥注释的断言会判它失败，然后**逼人删掉那段解释**。
 *   这与「把注释当代码数」是同一类坏断言的两个方向。
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\r\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)))
}

function texts() {
  return window.document.body.textContent || ''
}

function allButtons() {
  return [...window.document.querySelectorAll('button')].map((b) => ({
    text: (b.textContent || '').trim(),
    disabled: Boolean(b.disabled),
    cls: typeof b.className === 'string' ? b.className : '',
    title: b.getAttribute('title') || '',
  }))
}

function clickText(fragment) {
  const el = [...window.document.querySelectorAll('button')].find((b) =>
    (b.textContent || '').includes(fragment),
  )
  if (!el) throw new Error(`找不到按钮：${fragment}`)
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  return el
}

/** 三个公共词 + 一个私有词，形状与 wordView.toUserWordView 一致 */
const WORDS = [
  { id: 'w.photosynthesis', wordKey: 'w.photosynthesis', form: 'photosynthesis', pos: 'n.', gloss: '光合作用', morphs: [], chain: [], source: 'public', freqRank: 12000 },
  { id: 'w.quixotic', wordKey: 'w.quixotic', form: 'quixotic', pos: 'adj.', gloss: '不切实际的', morphs: [], chain: [], source: 'public', freqRank: 13000 },
  { id: 'u.myword', wordKey: 'u.myword', form: 'myword', pos: 'n.', gloss: '我的词', morphs: [], chain: [], source: 'user', userWordId: 'uw-1', freqRank: null },
]

const RECORDS = { 'w.quixotic': { status: 'known', consecutiveCorrect: 2 } }

// ================================================================ B 组

async function scenarioRemoveOnline() {
  console.log('— B① 在线「移出小站」：confirm 三行 → 只删 station_words → 事后反馈')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mountRemove({ words: WORDS, records: RECORDS, online: true, stationName: '雅思', removeOk: true })
  await flush()

  const btn = allButtons().find((b) => b.text === '移出小站')
  ok(Boolean(btn), '★ 词条行有「移出小站」按钮')
  ok(Boolean(btn) && !btn.disabled, '在线时可点')
  ok(
    Boolean(btn) && /移出小站|移除这个词/.test(btn.title),
    `★ title 说清语义（实际：${btn && btn.title}）`,
  )
  ok(
    Boolean(btn) && /hover:border-red-300/.test(btn.cls),
    '★ hover 转红（危险语义）',
  )
  ok(
    !allButtons().some((b) => b.text === '删除'),
    '★ 行内绝不出现叫「删除」的按钮（那是「彻底删词条」的语义）',
  )

  clickText('移出小站')
  await flush(140)

  ok(confirmCalls.length === 1, `弹了 confirm（${confirmCalls.length} 次）`)
  const msg = confirmCalls[0] || ''
  ok(msg.includes('雅思'), '★ confirm 写明是哪个小站')
  ok(msg.includes('不会删除这个词条本身'), '★ confirm 说清「不删什么」（词条保留）')
  ok(msg.includes('学习记录保留'), '★ confirm 说清「学习记录保留」')
  ok(msg.includes('重新加回'), '★ confirm 说清「可以加回来」—— 降低不可撤销的心理成本')
  ok(msg.includes('不可撤销'), '★ confirm 说清不可撤销')

  const rm = getCalls().stationWordsRemove
  ok(rm.length === 1, `★ 调了 1 次 stationWordsApi.remove（实际 ${rm.length}）`)
  ok(
    rm.length === 1 && rm[0].stationId === 'station-1' && rm[0].wordKey === 'w.photosynthesis',
    `★ remove 拿到 stationId + wordKey（实际：${JSON.stringify(rm[0] || {})}）`,
  )
  ok(getCalls().userWordsRemove.length === 0, '★★ **没有**删 user_words —— 词条必须保留')
  ok(texts().includes('已从') && texts().includes('移出'), '★ 有事后反馈（不能只靠 confirm）')
  ok(texts().includes('学习记录保留'), '★ 事后反馈重申「学习记录保留」')
  unmount()
}

async function scenarioRemoveCancel() {
  console.log('\n— B② 取消 confirm：零副作用')
  unmount()
  confirmAnswer = false
  confirmCalls.length = 0
  __resetCalls()
  mountRemove({ words: WORDS, records: RECORDS, online: true, stationName: '雅思', removeOk: true })
  await flush()

  clickText('移出小站')
  await flush(120)

  ok(confirmCalls.length === 1, '弹了 confirm')
  ok(getCalls().stationWordsRemove.length === 0, '★ 取消后没有任何 remove 调用')
  ok(texts().includes('photosynthesis'), '★ 词仍在列表里')
  ok(!texts().includes('已从'), '★ 没有事后反馈')
  confirmAnswer = true
  unmount()
}

async function scenarioRemoveOffline() {
  console.log('\n— B③ 离线：按钮 disabled + 可执行提示 + 零草稿（Q1）')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mountRemove({ words: WORDS, records: RECORDS, online: false, stationName: '雅思', removeOk: true })
  await flush()

  const btn = allButtons().find((b) => b.text === '移出小站')
  ok(Boolean(btn) && btn.disabled, `★ 离线时按钮 disabled（实际 ${btn && btn.disabled}）`)
  ok(
    Boolean(btn) && btn.title.includes('联网后再试'),
    `★ title 给出可执行提示（实际：${btn && btn.title}）`,
  )

  // ★★ 「绕过 disabled」的第二条路：直接调 React 的 onClick prop ★★
  //   往 disabled 按钮上派发 click 事件在 jsdom 里**根本不会到达 onClick**
  //   （浏览器与 jsdom 都拦掉 disabled 元素上的交互事件）——
  //   所以那种写法测到的只是「disabled 有用」，而不是「doRemove 的第一行守卫有用」。
  //   而 doRemove 的守卫才是承重墙：上层若忘传 online、或按钮的 disabled 因为
  //   任何原因失效，第一行 return 是最后一道拦截。
  //   （这条是缺陷注入逼出来的：把 `if (!online) return` 删掉，DOM 层全绿。）
  const btnEl = [...window.document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '移出小站')
  const propsKey = Object.keys(btnEl).find((k) => k.startsWith('__reactProps$'))
  ok(Boolean(propsKey), '前置：拿到了 React props（否则这条测不到真实路径）')
  confirmCalls.length = 0
  await btnEl[propsKey].onClick()
  await flush(140)

  ok(confirmCalls.length === 0, '★★ 直接调 onClick（绕过 disabled）也不弹 confirm —— doRemove 第一行 return 生效')
  ok(getCalls().stationWordsRemove.length === 0, '★★ 没有 remove 调用')
  ok(getCalls().enqueue.length === 0, '★★★ 零草稿入队 —— 不新增删除草稿 kind（pendingCount 前后相等，DRAIN_ORDER 仍 4 项）')
  unmount()
}

async function scenarioRemoveFails() {
  console.log('\n— B④ remove 返回 false：词留在列表 + 错误提示')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mountRemove({ words: WORDS, records: RECORDS, online: true, stationName: '雅思', removeOk: false })
  await flush()

  clickText('移出小站')
  await flush(140)

  ok(getCalls().stationWordsRemove.length === 1, '确实调了 remove')
  ok(texts().includes('移出失败'), '★ 有失败提示')
  ok(texts().includes('photosynthesis'), '★ 词仍在列表里（无乐观删除）')
  unmount()
}

// ================================================================ C 组

const STATIONS = [
  { id: 'station-1', name: '雅思', pinned: true },
  { id: 'station-2', name: '论文阅读', pinned: false },
]

async function scenarioAddMenu() {
  console.log('\n— C① 下拉：小站列表 + 置顶优先 + 「✓ 已在」口径说明')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  __setAddMany({ inserted: 1, skipped: 0, error: null })
  mountAdd({ wordKeys: ['w.photosynthesis'], sources: ['public'], stations: STATIONS, ownerId: 'uid-A', online: true, existingKeys: new Set(['w.photosynthesis']), currentStationId: 'station-1', currentStationName: '雅思' })
  await flush()

  ok(texts().includes('加入小站'), '★ 渲染「加入小站 ▾」按钮')
  clickText('加入小站')
  await flush()

  ok(texts().includes('雅思') && texts().includes('论文阅读'), '★ 下拉列出全部小站')
  ok(texts().indexOf('雅思') < texts().indexOf('论文阅读'), '★ 置顶小站排在前')
  ok(texts().includes('✓ 已在'), '★ 已有的词标「✓ 已在」')
  ok(texts().includes('只标注当前小站'), '★★ 写明「✓ 已在只标注当前小站」（K2 口径，缺了就是误导）')
  ok(texts().includes('当前'), '★ 标出哪个是当前小站')
  unmount()
}

async function scenarioAddSkipped() {
  console.log('\n— C② 重复添加：汇总恒含 skipped（K2 未落地前的诚实出口）')
  unmount()
  confirmAnswer = true
  __resetCalls()
  __setAddMany({ inserted: 0, skipped: 1, error: null })
  mountAdd({ wordKeys: ['w.photosynthesis'], sources: ['public'], stations: STATIONS, ownerId: 'uid-A', online: true, existingKeys: new Set(), currentStationId: 'station-1', currentStationName: '雅思' })
  await flush()
  clickText('加入小站')
  await flush()
  clickText('雅思')
  await flush(140)

  ok(getCalls().addMany.length === 1, '调了 addMany')
  ok(texts().includes('已在小站中') && texts().includes('跳过'), '★ 全跳过时说「已在小站中，已跳过」而不是「已加入 1 个」')
  unmount()
}

async function scenarioAddOffline() {
  console.log('\n— C③ 离线：提示「已存为离线草稿」且真的入队')
  unmount()
  confirmAnswer = true
  __resetCalls()
  __setAddMany({ inserted: 0, skipped: 0, error: null })
  mountAdd({ wordKeys: ['w.a', 'w.b'], sources: ['public', 'public'], stations: STATIONS, ownerId: 'uid-A', online: false, existingKeys: new Set(), currentStationId: 'station-1', currentStationName: '雅思' })
  await flush()
  clickText('加入小站')
  await flush()
  ok(texts().includes('当前离线'), '★ 下拉里说明离线行为')
  clickText('雅思')
  await flush(140)

  const enq = getCalls().enqueue
  ok(enq.length === 1, `★ 落了 1 条草稿（实际 ${enq.length}）`)
  ok(
    enq.length === 1 && enq[0].kind === 'stationWords',
    `★ kind 是 stationWords（复用既有 kind，零新增）（实际：${enq[0] && enq[0].kind}）`,
  )
  ok(
    enq.length === 1 && enq[0].payload.ownerId === 'uid-A' && Boolean(enq[0].payload.stationId) && Array.isArray(enq[0].payload.items),
    '★ payload 满足 claim() 结构校验（ownerId / stationId 真值 / items 是数组）',
  )
  ok(texts().includes('离线草稿'), '★ 提示「已存为离线草稿」')
  ok(texts().includes('联网后'), '★ 提示说清「联网后」会自动加入')
  unmount()
}

async function scenarioZeroStations() {
  console.log('\n— C④ 零小站：引导新建并自动加入（不让用户做两件事）')
  unmount()
  confirmAnswer = true
  __resetCalls()
  __setAddMany({ inserted: 1, skipped: 0, error: null })
  __setCreateResult({ id: 'station-new', name: '新站', pendingSync: false })
  mountAdd({ wordKeys: ['w.x'], sources: ['public'], stations: [], ownerId: 'uid-A', online: true, existingKeys: new Set(), currentStationId: null, currentStationName: '' })
  await flush()
  clickText('加入小站')
  await flush()
  ok(texts().includes('你还没有小站'), '★ 说明「你还没有小站」')
  ok(texts().includes('创建并加入'), '★ 提供「创建并加入」（不是先建站再手动加）')

  const input = window.document.querySelector('input')
  ok(Boolean(input), '有行内输入框')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, '新建站名')
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  await flush()
  clickText('创建并加入')
  await flush(160)

  ok(getCalls().createStation.length === 1, '★ 调了 createStation')
  ok(getCalls().createStation[0] === '新建站名', `★ 用输入的名字（实际：${getCalls().createStation[0]}）`)
  ok(getCalls().addMany.length === 1, '★ 自动 addMany（用户不用做第二步）')
  ok(
    getCalls().addMany.length === 1 && getCalls().addMany[0].stationId === 'station-new',
    '★ 加到刚建的那个站',
  )
  ok(texts().includes('已新建') && texts().includes('并加入'), '★ 提示「已新建「x」并加入」')
  unmount()
}

async function scenarioGuest() {
  console.log('\n— C⑤ 游客：按钮 disabled（不做游客本地小站）')
  unmount()
  __resetCalls()
  mountAdd({ wordKeys: ['w.x'], sources: ['public'], stations: STATIONS, ownerId: null, online: true, existingKeys: new Set(), currentStationId: null, currentStationName: '' })
  await flush()
  const btn = allButtons().find((b) => b.text.includes('加入小站'))
  ok(Boolean(btn) && btn.disabled, '★ 游客时按钮 disabled')
  ok(Boolean(btn) && /登录/.test(btn.title), `★ title 说明要登录（实际：${btn && btn.title}）`)
  unmount()
}

async function scenarioBulkThreeSites() {
  console.log('\n— C⑥ G1：BulkActionBar 三个调用点都渲染「加入小站」（逐处确认）')
  unmount()
  __resetCalls()
  // 用 BulkActionBar 直接挂三种 layout，代表三处调用点的实际用法
  const { mountBulk } = bundle
  mountBulk({ count: 3, ids: ['w.a', 'w.b', 'w.c'], layout: 'row' })
  await flush()
  ok(texts().includes('加入小站'), '① ListView（layout=row）有「加入小站」')

  unmount()
  mountBulk({ count: 3, ids: ['w.a', 'w.b', 'w.c'], layout: 'column' })
  await flush()
  ok(texts().includes('加入小站'), '② FocusView / ③ MorphDetail（layout=column）也有「加入小站」')
  ok(texts().includes('已选 3 个'), '批量上下文正确')
  unmount()

  // 不传 addToStation 时按钮**不渲染**（默认行为不变）
  unmount()
  mountBulk({ count: 3, ids: ['w.a'], layout: 'row', addToStation: false })
  await flush()
  ok(!texts().includes('加入小站'), '★ addToStation=false 时按钮不渲染（既有调用点零影响）')
  unmount()
}

async function scenarioBulkFlash() {
  console.log('\n— C⑦ A-14：flash 文案按动作区分（不共用「已更新 N 个」）')
  unmount()
  __resetCalls()
  const { mountBulk } = bundle
  mountBulk({ count: 12, ids: Array.from({ length: 12 }, (_, i) => `w.${i}`), layout: 'row' })
  await flush()

  clickText('我会了')
  await flush(60)
  ok(texts().includes('已掌握'), `★ 「我会了」→ 说「已标记 N 个已掌握」（实际：${/已[^<]*掌握/.exec(texts()) || ''}）`)

  clickText('加入待复习')
  await flush(60)
  ok(texts().includes('待复习'), '★ 「加入待复习」→ 说「已加入 N 个待复习」')

  clickText('清除学习记录')
  await flush(60)
  ok(texts().includes('已清除'), '★ 「清除学习记录」→ 说「已清除 N 个学习记录」')
  unmount()
}

// ================================================================ 源码纪律

function sourceDiscipline() {
  console.log('\n— 源码纪律：本轮红线与接线')
  const app = readFileSync(resolve('src/App.jsx'), 'utf8')
  const sl = readFileSync(resolve('src/components/StationLearn.jsx'), 'utf8')
  const bab = readFileSync(resolve('src/components/BulkActionBar.jsx'), 'utf8')
  const menu = readFileSync(resolve('src/components/AddToStationMenu.jsx'), 'utf8')
  const uwe = readFileSync(resolve('src/components/UserWordEditor.jsx'), 'utf8')

  // ★ B 组最关键的接线：removeWord 必须真的传下去 ★
  ok(/removeWord=\{stationWords\.removeWord\}/.test(app), '★★ App.jsx 必须传 removeWord 给 StationLearn（此前缺失 → 按钮点了没反应）')
  // ★ 注意：这里是「解构出 removeWord」，不是「给它一个默认值」——
  //   必须允许 undefined，这样 disabled={!online || !removeWord} 才能在
  //   上层忘传时把按钮禁掉（而不是点了没反应）。
  ok(/^\s+removeWord,$/m.test(sl), '★ StationLearn 从 props 解构出 removeWord（不设默认值，以便缺失时被禁掉）')
  ok(/disabled=\{!online \|\| !removeWord\}/.test(sl), '★ removeWord 缺失时按钮 disabled（不能点了没反应）')

  // 三处调用点都接了
  ok((app.match(/addToStationProps=\{addToStationProps\}/g) || []).length >= 3, '★ App.jsx 至少 3 处透传 addToStationProps（ListView / FocusView / WordDetail）')
  ok(/onSetReview=\{bulkSetReview\}/.test(app) && /\{...addToStationProps\}/.test(app), '★ MorphDetail 的 BulkActionBar 也接了 spread')
  ok(/addToStationProps = \{\}/.test(readFileSync(resolve('src/components/ListView.jsx'), 'utf8')), '★ ListView 有默认空对象（不传则行为不变）')
  ok(/addToStationProps = \{\}/.test(readFileSync(resolve('src/components/FocusView.jsx'), 'utf8')), '★ FocusView 有默认空对象')

  // Q2 语义分离
  ok(/UserWordEditor[\s\S]*?彻底删除这个词条，它在所有小站里的引用也会一并移除/.test(uwe), '★ UserWordEditor 的「删除」title 说清「所有小站」')
  // ★ 必须剥掉注释再判：UserWordEditor 的注释里**提到**「移出小站」是为了
  //   解释两个操作的差异（那是必要的说明，不是 bug）。断言要检查的是
  //   「**按钮文案**里没有它」—— 否则这条断言会逼人删掉那段解释。
  ok(!/移出小站/.test(stripComments(uwe)), '★ UserWordEditor 的**代码**里不出现「移出小站」（注释里的语义说明不算）')
  ok(/彻底删除这个词条/.test(uwe), '★ UserWordEditor 的删除 title 用「彻底删除这个词条」措辞')
  ok(/移出小站/.test(sl), '★ StationLearn 里用「移出小站」')

  // Q1：不做离线删除 → 不新增草稿 kind，offline.js 零改动
  ok(!/enqueue\(/.test(sl), '★★ StationLearn 不许调 enqueue（离线不做删除队列）')
  ok(!/offlineApi/.test(sl), '★ StationLearn 不 import offlineApi（离线删除是禁止的）')

  // K2 口径
  ok(/只标注当前小站/.test(menu), '★★ 下拉头必须写「✓ 已在 只标注当前小站」')
  ok(/skipped/.test(menu), '★ 汇总含 skipped 计数')

  // C 组三个入口都走同一个组件
  ok(/AddToStationMenu/.test(app), '★ App.jsx 用了 AddToStationMenu')
  ok((app.match(/AddToStationMenu/g) || []).length >= 2, '★ App.jsx 至少 import + 使用两处')
  ok(!/stationWordsApi\.addMany/.test(app), '★ App.jsx 不直调 addMany（必须经共享出口）')
  ok(!/stationWordsApi\.addMany/.test(menu), '★ AddToStationMenu 不直调 addMany（走 lib/addToStation.js）')
  ok(/addToStationApi\.addToStation|from '\.\.\/lib\/addToStation\.js'/.test(menu), '★ AddToStationMenu 走共享的 addToStation()')
}

async function main() {
  await scenarioRemoveOnline()
  await scenarioRemoveCancel()
  await scenarioRemoveOffline()
  await scenarioRemoveFails()
  await scenarioAddMenu()
  await scenarioAddSkipped()
  await scenarioAddOffline()
  await scenarioZeroStations()
  await scenarioGuest()
  await scenarioBulkThreeSites()
  await scenarioBulkFlash()
  sourceDiscipline()

  console.log(`\n通过 ${pass} · 失败 ${fail}`)
  try {
    unlinkSync(OUT)
  } catch {
    /* ignore */
  }
  process.exit(fail === 0 ? 0 : 1)
}

main()

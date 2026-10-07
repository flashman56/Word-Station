/**
 * T04：「我的私有词」面板的 DOM 级验证（jsdom + 真 React + 真组件）
 * ------------------------------------------------------------------
 * 跑：npm run test:private-words-ui
 *
 * ★ 这个面板为什么值得单独一个 harness（它不是「顺手加个列表」）★
 *   它是 B 组「移出小站」的**硬前置**：私有词的编辑 / 重新生成 / 删除入口
 *   **只在 StationLearn 内**。一旦把私有词移出小站，它就离开所有小站 → 编辑入口
 *   消失 → 但它照样计入统计、照样出现在复习队列。于是用户看到一个**清不掉的
 *   幽灵词**。所以「移出小站之后还能不能找回管理入口」必须被钉住。
 *
 * ★ 两条后果相反的操作必须在 UI 上一眼可辨（Q2）★
 *   「移出小站」= 只删 station_words 一行引用（词条保留）
 *   「彻底删除」  = 删 user_words 词条 + 所有小站引用
 *   本文件断言两者的**文案 / 颜色 / 位置**三个维度都不同，并断言 confirm
 *   文案里明确写了「所有小站里的引用也会一并移除」—— 否则用户以为只是从列表
 *   里移除，而实际上别的小站里那个词也没了。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.t04-bundle.mjs')
const ENTRY = resolve('scripts/t04-probe-entry.jsx')
const MOCK_CLOUD = resolve('scripts/t04-mock-cloud.js')

// ---------------------------------------------------------------- jsdom

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5182/',
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

// window.confirm 的记录器（测试要断言 confirm 文案的内容）
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
      name: 't04-mocks',
      setup(build) {
        // ★ 按文件名匹配，不按目录前缀 ★
        //   同一个模块在不同文件里的 import 写法不同（'../lib/cloud/userWords.js'
        //   vs './cloud/userWords.js'），只匹配一种会让另一种打到真模块 ——
        //   症状是「测试全绿但什么都没拦到」，且一行错都不报。
        build.onResolve({ filter: /(^|\/)(userWords|generate|offline|stationWords|stations)\.js$/ }, () => ({
          path: MOCK_CLOUD,
        }))
      },
    },
  ],
  logLevel: 'warning',
})

const bundle = await import(pathToFileURL(OUT).href)
const { mount, unmount, getCalls, __resetCalls } = bundle

const flush = (ms = 70) => new Promise((r) => setTimeout(r, ms))

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

console.log('[test:private-words-ui] 「我的私有词」面板（移出小站后的孤儿闭环入口）\n')

/** 三个私有词：其中一个已在当前小站、一个不在、一个有学习记录 */
const PRIVATE_WORDS = [
  {
    userWordId: 'uw-1',
    wordKey: 'u.photosynthesis',
    form: 'photosynthesis',
    pos: 'n.',
    gloss: '光合作用',
    cefr: 'B2',
    morphs: [],
    chain: [],
    example: null,
    usage: null,
    phoneticBr: '/ˌfəʊtəʊˈsɪnθəsɪs/',
    editedByUser: false,
  },
  {
    userWordId: 'uw-2',
    wordKey: 'u.quixotic',
    form: 'quixotic',
    pos: 'adj.',
    gloss: '不切实际的',
    cefr: 'C1',
    morphs: [],
    chain: [],
    example: null,
    usage: null,
    phoneticBr: null,
    editedByUser: true,
  },
  {
    userWordId: 'uw-3',
    wordKey: 'u.obtuse',
    form: 'obtuse',
    pos: 'adj.',
    gloss: '钝的；晦涩的',
    cefr: 'B2',
    morphs: [],
    chain: [],
    example: null,
    usage: null,
    phoneticBr: null,
    editedByUser: false,
  },
]

const RECORDS = {
  'u.quixotic': { status: 'known', consecutiveCorrect: 2 },
  'u.obtuse': { status: 'review', consecutiveCorrect: 0 },
}

function texts() {
  return window.document.body.textContent || ''
}

function buttons() {
  return [...window.document.querySelectorAll('button')].map((b) => ({
    text: (b.textContent || '').trim(),
    disabled: Boolean(b.disabled),
    cls: typeof b.className === 'string' ? b.className : '',
    title: b.getAttribute('title') || '',
  }))
}

function findBtn(fragment) {
  return buttons().find((b) => b.text.includes(fragment))
}

/**
 * 取某一行（以词形按钮为锚点）的 DOM 子树。
 *
 * ★ 为什么要按行定位而不是「findBtn('彻底删除')」★
 *   面板里每一行都有一个同名按钮，按文本找第一个永远命中第 1 行
 *   （photosynthesis）。于是测试「删 quixotic」实际删的是 photosynthesis ——
 *   而断言里如果也写成第 1 词，就自洽地绿了，完全测不到「删的是不是用户
 *   点的那一行」。这是「按实现细节写断言」的典型自欺。
 *
 * ★ 为什么不能「从按钮往上找包含词形的祖先」（这个坑我踩过）★
 *   往上第 3 层是**列表容器**，它的 textContent 包含**所有**词形 —— 于是第 1 行
 *   的按钮也会「匹配」任意词形。表现是断言全绿，而被删的其实是 photosynthesis。
 *   正确做法是**以词形按钮为锚点，向下取它的行容器**，再在行内查询。
 *
 * @param {string} form 词形
 * @returns {Element|null} 该行的行容器
 */
function rowOf(form) {
  const anchor = [...window.document.querySelectorAll('button')].find(
    (b) => (b.textContent || '').trim() === form,
  )
  if (!anchor) return null
  // 行容器的 class 含 'px-2 py-1.5'（见 PrivateWordsPanel 的行首 div）
  let el = anchor.parentElement
  for (let i = 0; i < 3 && el; i += 1) {
    if (typeof el.className === 'string' && el.className.includes('px-2 py-1.5')) return el
    el = el.parentElement
  }
  return anchor.parentElement
}

function btnInRow(form, fragment) {
  const row = rowOf(form)
  if (!row) return null
  return [...row.querySelectorAll('button')].find((b) => (b.textContent || '').includes(fragment)) || null
}

function btnInfo(form, fragment) {
  const el = btnInRow(form, fragment)
  if (!el) return null
  return {
    text: (el.textContent || '').trim(),
    disabled: Boolean(el.disabled),
    cls: typeof el.className === 'string' ? el.className : '',
    title: el.getAttribute('title') || '',
  }
}

function clickBtn(fragment) {
  const el = [...window.document.querySelectorAll('button')].find((b) =>
    (b.textContent || '').includes(fragment),
  )
  if (!el) throw new Error(`找不到按钮：${fragment}`)
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  return el
}

/** 点某一行的某个按钮（按词形定位行） */
function clickInRow(form, fragment) {
  const el = btnInRow(form, fragment)
  if (!el) throw new Error(`找不到 ${form} 行里的按钮：${fragment}`)
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  return el
}

// ================================================================ 前置自检

function selfCheck() {
  console.log('— 前置自检：替身真的替换了真模块')
  const t = readFileSync(OUT, 'utf8')
  ok(t.includes('__resetCalls'), '★ 替身标记在 bundle 里')
  ok(!/from '\.\.\/\.\.\/lib\/supabase\.js'/.test(t), '★ 真 supabase 客户端不在 bundle 里（否则会真发网络请求）')
  ok(!/createClient\(/.test(t), '★ 没有 createClient 调用')
}

// ================================================================ ① 渲染

async function scenarioRender() {
  console.log('\n— ① 渲染：私有词全量列出，含 form / pos / gloss / StatusPill')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mount({ words: PRIVATE_WORDS, records: RECORDS, existingKeys: new Set(['u.photosynthesis']), stationName: '雅思' })
  await flush()

  const body = texts()
  ok(body.includes('我的私有词 3 个'), `★ 标题给出总数（实际：${/我的私有词 \d+ 个/.exec(body)})`)
  ok(body.includes('photosynthesis') && body.includes('光合作用'), '第 1 行：form + gloss')
  ok(body.includes('quixotic') && body.includes('不切实际的'), '第 2 行：form + gloss')
  ok(body.includes('obtuse') && body.includes('钝的'), '第 3 行：form + gloss')
  ok(body.includes('n.') && body.includes('adj.'), '词性展示')

  // StatusPill：唯一配色源 derive.STATUS，三态色块
  const pills = [...window.document.querySelectorAll('span[title]')].filter((s) =>
    ['已掌握', '待复习', '未知'].includes(s.getAttribute('title')),
  )
  ok(pills.length === 3, `★ 三个词各有 StatusPill（实际 ${pills.length}）`)
  ok(
    pills.some((p) => p.getAttribute('title') === '已掌握'),
    '✓ quixotic 标「已掌握」（与 records 一致）',
  )
  ok(
    pills.some((p) => p.getAttribute('title') === '待复习'),
    '✓ obtuse 标「待复习」（与 records 一致）',
  )
  ok(pills.some((p) => p.getAttribute('title') === '未知'), '✓ photosynthesis 无记录 → 「未知」')

  ok(body.includes('已在「雅思」✓'), '★ 已在当前小站的词标「已在「雅思」✓」')
  unmount()
}

// ================================================================ ② Q2 语义分离

async function scenarioSemanticSeparation() {
  console.log('\n— ② Q2：「彻底删除」与「移出小站」在文案/颜色/位置三维度都不同')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mount({ words: PRIVATE_WORDS, records: RECORDS, existingKeys: new Set(), stationName: '雅思' })
  await flush()

  const destroyBtn = btnInfo('quixotic', '彻底删除')
  ok(Boolean(destroyBtn), '★ 有「彻底删除」按钮')
  ok(!/移出小站/.test(destroyBtn.text), '★ 按钮文案绝不叫「移出小站」—— 两个后果相反的按钮不能同名')

  // 颜色：红字（危险语义）
  ok(/text-red-600/.test(destroyBtn.cls), `★ 「彻底删除」是红字（实际 class：${destroyBtn.cls.slice(0, 60)}）`)

  // 位置：行尾独立位置（ml-auto）
  ok(/ml-auto/.test(destroyBtn.cls), '★ 「彻底删除」在行尾独立位置（ml-auto），不在操作区中间')

  // title 必须说清后果
  ok(
    destroyBtn.title.includes('所有小站') && destroyBtn.title.includes('学习记录不受影响'),
    `★ title 说清后果（实际：${destroyBtn.title}）`,
  )

  // 文案：明确指向「移出小站请到小站页内操作」
  ok(
    texts().includes('移出小站请到小站页内操作'),
    '★ 面板里明确区分两个操作，避免用户在这里找「移出小站」',
  )
  unmount()
}

// ================================================================ ③ 彻底删除

async function scenarioRemove() {
  console.log('\n— ③ 彻底删除：confirm 说清后果 → 调用 API → 事后反馈')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mount({ words: PRIVATE_WORDS, records: RECORDS, existingKeys: new Set(), stationName: '雅思' })
  await flush()

  clickInRow('quixotic', '彻底删除')
  await flush(120)

  ok(confirmCalls.length === 1, `★ 弹了 confirm（实际 ${confirmCalls.length} 次）`)
  const msg = confirmCalls[0] || ''
  ok(msg.includes('所有') && msg.includes('小站'), '★ confirm 写明「所有小站里的引用也会一并移除」')
  ok(msg.includes('学习记录保留'), '★ confirm 写明「学习记录保留」')
  ok(msg.includes('不可撤销'), '★ confirm 写明不可撤销')
  ok(msg.includes('quixotic'), '★ confirm 里出现词形（不是内部 id）—— 用户要能确认删的是哪个词')

  const calls = getCalls().remove
  ok(calls.length === 1, `★ 调了 1 次 remove（实际 ${calls.length}）`)
  ok(
    calls.length === 1 && calls[0].wordKey === 'u.quixotic' && calls[0].id === 'uw-2' && calls[0].ownerId === 'uid-A',
    `★ remove 拿到真实的 ownerId / id / wordKey（实际：${JSON.stringify(calls[0] || {})}）`,
  )

  ok(
    texts().includes('已彻底删除') && texts().includes('学习记录保留'),
    '★ 删除后有事后反馈（不能只靠 confirm 就消失）',
  )
  ok(getCalls().onRefresh === 1, `★ 触发 onRefresh（同时刷私有词与小站词条，实际 ${getCalls().onRefresh} 次）`)
  unmount()
}

async function scenarioRemoveCancel() {
  console.log('\n— ④ 取消 confirm：什么都不该发生')
  unmount()
  confirmAnswer = false
  confirmCalls.length = 0
  __resetCalls()
  mount({ words: PRIVATE_WORDS, records: RECORDS, existingKeys: new Set(), stationName: '雅思' })
  await flush()

  clickInRow('quixotic', '彻底删除')
  await flush(120)

  ok(confirmCalls.length === 1, '弹了 confirm')
  ok(getCalls().remove.length === 0, '★ 取消后**没有任何** API 调用（词还在）')
  ok(texts().includes('quixotic'), '★ 取消后词仍在列表里')
  confirmAnswer = true
  unmount()
}

async function scenarioRemoveError() {
  console.log('\n— ⑤ 删除失败：必须留在列表 + 有错误提示')
  unmount()
  confirmAnswer = true
  confirmCalls.length = 0
  __resetCalls()
  mount({
    words: PRIVATE_WORDS,
    records: RECORDS,
    existingKeys: new Set(),
    stationName: '雅思',
    removeError: { code: 'INTERNAL', message: 'RLS 拒绝' },
  })
  await flush()

  clickInRow('quixotic', '彻底删除')
  await flush(120)

  ok(getCalls().remove.length === 1, '确实调了 remove')
  ok(texts().includes('删除失败'), '★ 有错误提示')
  ok(texts().includes('RLS 拒绝'), '★ 错误提示带服务端原因')
  ok(texts().includes('quixotic'), '★ 失败后词**仍在**列表里（没有乐观删除）')
  ok(!texts().includes('已彻底删除'), '★ 失败时不得显示成功反馈')
  unmount()
}

// ================================================================ ⑥ 空态

async function scenarioEmpty() {
  console.log('\n— ⑥ 空态与未登录态：都要说明下一步能做什么')
  unmount()
  __resetCalls()
  mount({ words: [], records: {}, existingKeys: new Set(), stationName: '' })
  await flush()
  ok(texts().includes('还没有私有词'), '空列表：说明「还没有私有词」')
  ok(
    texts().includes('小站') && (texts().includes('粘贴') || texts().includes('生成')),
    '★ 空态说明下一步能做什么（去小站粘贴生词），不只说「空」',
  )
  unmount()

  __resetCalls()
  mount({ words: [], records: {}, existingKeys: new Set(), stationName: '', ownerId: null })
  await flush()
  ok(texts().includes('需要登录'), '★ 未登录：说明私有词需要登录')
  ok(texts().includes('本机浏览器'), '★ 未登录：说清学习进度只在本机')
  unmount()
}

// ================================================================ ⑦ 显示更多

async function scenarioPaging() {
  console.log('\n— ⑦ 显示更多：增量渲染，复用 ListView 的 PAGE_STEP 模式')
  unmount()
  confirmAnswer = true
  __resetCalls()
  const many = Array.from({ length: 250 }, (_, i) => ({
    id: `uw-${i}`,
    wordKey: `u.w${i}`,
    form: `w${i}`,
    pos: 'n.',
    gloss: `释义 ${i}`,
    cefr: 'B1',
    morphs: [],
    chain: [],
    example: null,
    usage: null,
    phoneticBr: null,
    editedByUser: false,
  }))
  mount({ words: many, records: {}, existingKeys: new Set(), stationName: '雅思' })
  await flush()

  ok(texts().includes('我的私有词 250 个'), '总数是 250（全量，不是 100）')
  ok(!texts().includes('释义 249'), '★ 首屏只渲染前 100 个（不全量铺 DOM）')
  ok(texts().includes('释义 0'), '首屏含第 1 个')
  ok(texts().includes('显示更多'), '★ 有「显示更多」')

  clickBtn('显示更多')
  await flush(120)
  ok(texts().includes('释义 149'), '★ 点一次后渲染到 200 个')
  ok(texts().includes('显示更多'), '还有更多可加载')
  clickBtn('显示更多')
  await flush(120)
  ok(texts().includes('释义 249'), '★ 点两次后渲染全部 250 个')
  ok(!texts().includes('显示更多'), '★ 全部显示后「显示更多」消失')
  unmount()
}

// ================================================================ ⑧ 源码纪律

function sourceDiscipline() {
  console.log('\n— ⑧ 源码纪律：本面板必须走共享出口与既有构造点')
  const src = readFileSync(resolve('src/components/PrivateWordsPanel.jsx'), 'utf8')

  ok(
    !/stationWordsApi\.addMany/.test(src),
    '★ 不得直调 stationWordsApi.addMany —— 必须走共享的 addToStation（T05 接）',
  )
  ok(/userWordsApi\.remove\(/.test(src), '彻底删除走 userWordsApi.remove（它的真实行为就是删词条 + 所有小站引用）')
  ok(!/StatusPill\s*\(?\s*status=/.test(src) === false, '用了 StatusPill 组件（不自己画状态色块）')
  ok(/from '\.\/StatusPill\.jsx'/.test(src), '★ 状态徽标复用 StatusPill.jsx（三态配色的唯一来源）')
  ok(/from '\.\/StationLearn\.jsx'/.test(src), '★ 行内小按钮复用 StationLearn 导出的 GhostBtn（不新建按钮样式）')
  ok(!/bg-(emerald|amber|red)-\d00.*已掌握/.test(src), '不得硬编码状态色（配色唯一源是 derive.STATUS）')

  // 私有词绝不写进 dict 的 IndexedDB 缓存
  ok(
    !/from '\.\.\/lib\/dict\.js'/.test(src),
    '★ 本面板不 import dict.js —— 私有词绝不写进设备级 IndexedDB 缓存（会跨账号泄露释义）',
  )
}

selfCheck()
await scenarioRender()
await scenarioSemanticSeparation()
await scenarioRemove()
await scenarioRemoveCancel()
await scenarioRemoveError()
await scenarioEmpty()
await scenarioPaging()
sourceDiscipline()

console.log(`\n通过 ${pass} · 失败 ${fail}`)
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

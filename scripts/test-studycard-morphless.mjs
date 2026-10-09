/**
 * StudyCard「无词素」空面板修复的 DOM 级对抗性验证
 * ------------------------------------------------------------------
 * 跑：npm run test:studycard
 *
 * ★ 为什么必须挂真组件、做 DOM 断言（而不是源码正则）★
 *   被修的缺陷是「学习卡对 chain:[] 的词渲染了标题 + 空面板」（用户截图词 boer）。
 *   一个只做正则的测试会这样作弊：源码里有「无词素 · 」字样就算过 —— 可组件
 *   照样可能把标题渲染出来、面板留空。所以本文件用 jsdom + esbuild 打包探针，
 *   挂载**真 StudyCard 组件本身** src/components/StudyCard.jsx，点「记得」进入
 *   作答展开态，再对真实渲染出的 DOM 断言。
 *
 * ★ 断言锚定本组件渲染出的 DOM，且两端收紧 ★
 *   StudyCard 与 WordDetail 都会渲染同名标题「构词拆解」，所以断言一律限定在
 *   本 harness 自己创建的容器 #tsm-root 内，绝不全局乱找。
 *
 * ★ 崩在中途比失败更危险 ★
 *   后续断言要读取的查找（构词拆解区块、chip 容器）走 mustFind 契约守卫，
 *   找不到 → 记 FAIL 并**中止该用例**（而不是让后面的代码 TypeError 崩掉进程，
 *   连累了其他用例、也看不出挂在哪）。最终报告同时给出「执行了多少条断言」。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.tsm-bundle.mjs')
const ENTRY = resolve('scripts/tsm-probe-entry.jsx')
const MOCK = resolve('scripts/tsm-mock-deps.js')

// ---------------------------------------------------------------- jsdom 环境

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5184/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.localStorage = window.localStorage
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.IS_REACT_ACT_ENVIRONMENT = false

// 兜底捕获进程级未捕获异常（正常应由 ErrorBoundary 接住；这里只作最后一道网）
const uncaught = []
process.on('uncaughtException', (e) => {
  uncaught.push(e)
})
process.on('unhandledRejection', (e) => {
  uncaught.push(e)
})

// ---------------------------------------------------------------- 打包探针

await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    {
      name: 'tsm-mocks',
      setup(build) {
        // ★ 按文件名匹配（不按目录前缀）★ 依赖真模块会 fetch / 碰 IndexedDB /
        //   读 speechSynthesis，jsdom 里都必须替换成惰性替身。
        build.onResolve({ filter: /(^|\/)(dict|useSpeech|usageSupplement)\.js$/ }, () => ({
          path: MOCK,
        }))
      },
    },
  ],
  logLevel: 'warning',
})

const bundle = await import(pathToFileURL(OUT).href)
const { mount, unmount, clickExact, hasProbeError, probeErrorText, hasDecomposition, morphlessKindLabel } =
  bundle

const flush = (ms = 90) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- 断言基建

let pass = 0
let fail = 0
let total = 0
function ok(cond, msg) {
  total += 1
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    console.error(`  ✗ ${msg}`)
  }
}

class MustFindError extends Error {}
/** 契约守卫：后续断言依赖的查找失败 → 抛错中止该用例（不静默、不崩） */
function mustFind(fn, where) {
  const v = fn()
  if (v === null || v === undefined || v === false) throw new MustFindError(where)
  return v
}

/**
 * 取本 harness 容器内「构词拆解」区块（标题 <p> 的父 div）。
 * 找不到 → 中止该用例（后面所有断言都锚在它上面）。
 */
function decompSection() {
  const root = mustFind(() => window.document.getElementById('tsm-root'), '未找到本 harness 容器 #tsm-root')
  const title = mustFind(
    () => [...root.querySelectorAll('p')].find((p) => (p.textContent || '').trim() === '构词拆解'),
    '未找到「构词拆解」标题 <p>（组件未渲染该区块）',
  )
  return mustFind(() => title.parentElement, '「构词拆解」标题没有父容器')
}

const cls = (el) => (typeof el.className === 'string' ? el.className : '')
const hasAll = (el, ...names) => names.every((n) => el.classList.contains(n))
const txt = (el) => (el.textContent || '').trim()

/** 区块内的 chip 容器（flex + items-center + flex-wrap） */
function chipContainers(sec) {
  return [...sec.querySelectorAll('div')].filter((d) => hasAll(d, 'flex', 'items-center', 'flex-wrap'))
}
/** 区块内的 amber 无词素提示 */
function amberHints(sec) {
  return [...sec.querySelectorAll('div')].filter((d) => cls(d).includes('text-amber-700'))
}
/** 区块内的「+」分隔符 */
function plusSpans(scope) {
  return [...scope.querySelectorAll('span')].filter((s) => txt(s) === '+')
}
/** 区块内的构词 chip（rounded + border 的 span） */
function chipSpans(sec) {
  return [...sec.querySelectorAll('span')].filter((s) => hasAll(s, 'rounded', 'border'))
}

/** 运行一个用例：MustFindError → FAIL 并中止该用例；其他异常 → FAIL 并打印 */
async function runCase(name, fn) {
  console.log(`\n— ${name}`)
  try {
    await fn()
  } catch (e) {
    if (e instanceof MustFindError) {
      ok(false, `[契约守卫] ${e.message} —— 该用例中止（后面断言不再执行）`)
    } else {
      ok(false, `[异常] ${e && e.message ? e.message : e} —— 该用例中止`)
      console.error(e)
    }
  }
}

// ---------------------------------------------------------------- 夹具

/** 真实 boer 形状（取自 src/data/words-mono-seed.js：id w.boer，外来词，无可拆部分） */
const BOER = {
  id: 'w.boer',
  form: 'boer',
  pos: 'n.',
  gloss: '布尔人（南非荷兰裔）',
  morphs: [],
  chain: [],
  morphless: true,
  kind: 'loan',
  origin: 'loan:nl',
  freqRank: 30018,
  cefr: 'B2',
}

/** 有拆解：un + known，两步链 */
const UNKNOWN = {
  id: 'w.unknown',
  form: 'unknown',
  pos: 'adj.',
  gloss: '未知的',
  morphs: ['m.un', 'm.known'],
  chain: [
    { form: 'un-', gloss: '不' },
    { form: 'known', gloss: '已知的' },
  ],
}

/** chain 缺失（undefined）—— 不得抛错，落 amber 分支 */
const NO_CHAIN = {
  id: 'w.nochain',
  form: 'nochain',
  pos: 'n.',
  gloss: '测试用词',
  morphs: [],
}

// ================================================================ 前置自检

function selfCheck() {
  console.log('— 前置自检：替身真的替换了真模块')
  const t = readFileSync(OUT, 'utf8')
  ok(t.includes('tsm-mock-deps-v1'), '★ 替身标记 tsm-mock-deps-v1 在 bundle 里（替换确实生效）')
  ok(!t.includes('wrc.dict.v1:'), '★ 真 dict.js 不在 bundle 里（否则会碰 IndexedDB / 发 fetch）')
  ok(!t.includes('data/v1/manifest.json'), '★ 真 dict.js 的分片清单串不在 bundle 里')
  ok(!t.includes('usageShardKey'), '★ 真 usageSupplement.js 不在 bundle 里（不 fetch 用法分片）')
  ok(!t.includes('voiceschanged'), '★ 真 useSpeech.js 不在 bundle 里（不读 speechSynthesis）')
  ok(typeof hasDecomposition === 'function' && typeof morphlessKindLabel === 'function', '★ derive 两函数经入口导出可用')
}

// ================================================================ ① morphless（boer 形状）

async function caseMorphless() {
  unmount()
  mount(BOER)
  await flush()
  ok(!hasProbeError(), 'morphless 词挂载未触发渲染异常')

  const clicked = clickExact('记得')
  ok(clicked, '找到并点击精确文本「记得」（不是含子串的「不记得」）')
  await flush()
  ok(!hasProbeError(), '作答展开未触发渲染异常')

  const sec = decompSection() // mustFind：找不到则中止本用例
  ok(txt(sec).includes('构词拆解'), '★ 标题「构词拆解」仍在（两条路径一致）')

  const ambers = amberHints(sec)
  ok(
    ambers.length === 1 && txt(ambers[0]) === '无词素 · 外来词',
    `★ 出现 amber 提示「无词素 · 外来词」（实际 ${ambers.length} 个：${ambers.map(txt).join(' | ')}）`,
  )

  // 反向：绝不能再出现「标题在、面板空」——即零 chip 的拆解容器
  const containers = chipContainers(sec)
  ok(containers.length === 0, `★ 不出现零 chip 的拆解容器（flex items-center flex-wrap，实际 ${containers.length} 个）`)
  ok(plusSpans(sec).length === 0, `★ 不出现「+」分隔符（实际 ${plusSpans(sec).length} 个）`)
  ok(chipSpans(sec).length === 0, `★ 不出现任何构词 chip（实际 ${chipSpans(sec).length} 个）`)

  unmount()
}

// ================================================================ ② 有拆解

async function caseDecomposition() {
  unmount()
  mount(UNKNOWN)
  await flush()
  clickExact('记得')
  await flush()

  const sec = decompSection()
  ok(txt(sec).includes('构词拆解'), '标题「构词拆解」仍在')

  const container = mustFind(() => chipContainers(sec)[0], '未找到拆解 chip 容器（有拆解词却无容器）')
  const chips = [...container.querySelectorAll('span')].filter((s) => hasAll(s, 'rounded', 'border'))
  ok(chips.length === 2, `★ 两个 chip 都渲染（实际 ${chips.length} 个）`)
  ok(chips.length === 2 && txt(chips[0]).includes('un-') && txt(chips[0]).includes('不'), `第 1 个 chip = un- / 不（实际：${chips[0] ? txt(chips[0]) : '—'}）`)
  ok(chips.length === 2 && txt(chips[1]).includes('known') && txt(chips[1]).includes('已知'), `第 2 个 chip = known / 已知的（实际：${chips[1] ? txt(chips[1]) : '—'}）`)

  ok(plusSpans(container).length === 1, `★ 中间出现 1 个「+」分隔符（实际 ${plusSpans(container).length} 个）`)
  ok(amberHints(sec).length === 0, `★ amber 提示不出现（实际 ${amberHints(sec).length} 个）`)

  unmount()
}

// ================================================================ ③ chain undefined

async function caseChainUndefined() {
  unmount()
  mount(NO_CHAIN)
  await flush()
  ok(!hasProbeError(), `★ 挂载（chain undefined）未触发渲染异常${hasProbeError() ? '：' + probeErrorText() : ''}`)

  clickExact('记得')
  await flush()
  ok(!hasProbeError(), `★ 作答展开（chain undefined）未触发渲染异常${hasProbeError() ? '：' + probeErrorText() : ''}`)

  const sec = decompSection()
  const ambers = amberHints(sec)
  ok(
    ambers.length === 1 && txt(ambers[0]) === '无词素 · 固定搭配',
    `chain undefined 落 amber 分支（实际 ${ambers.length} 个：${ambers.map(txt).join(' | ')}）`,
  )
  ok(chipContainers(sec).length === 0, '且不出现拆解容器')

  unmount()
}

// ================================================================ ④ 映射表

async function caseMapping() {
  const table = [
    [{ kind: 'mono' }, '单纯词'],
    [{ kind: 'loan' }, '外来词'],
    [{ kind: 'proper' }, '专有名词'],
    [{ kind: 'phrase' }, '固定搭配'],
    [{ kind: 'user' }, '固定搭配'],
    [undefined, '固定搭配'],
  ]
  for (const [word, want] of table) {
    const got = morphlessKindLabel(word)
    ok(got === want, `morphlessKindLabel(${word ? 'kind=' + JSON.stringify(word.kind) : 'undefined'}) = ${want}（实际 ${JSON.stringify(got)}）`)
  }
}

// ================================================================ ⑤ 真实数据一致性

async function caseRealData() {
  const mod = await import(pathToFileURL(resolve('src/data/words-entry.js')).href)
  const words = mod.words
  const boer = mustFind(() => words.find((w) => w.form === 'boer'), '真实词库（words-entry）中找不到 boer')

  ok(boer.id === 'w.boer', `真实 boer id = w.boer（实际 ${boer.id}）`)
  ok(boer.kind === 'loan' && boer.morphless === true, `真实 boer kind=loan 且 morphless=true（实际 kind=${boer.kind}, morphless=${boer.morphless}）`)
  ok(Array.isArray(boer.chain) && boer.chain.length === 0, `真实 boer chain 为空数组（实际 length=${boer.chain && boer.chain.length}）`)
  ok(hasDecomposition(boer) === false, '★ hasDecomposition(真实 boer) === false')
  ok(morphlessKindLabel(boer) === '外来词', '★ morphlessKindLabel(真实 boer) === 外来词')

  // 合成夹具与真实数据形状不漂移
  ok(
    BOER.chain.length === 0 && BOER.kind === 'loan' && BOER.morphless === true,
    '夹具 BOER 与真实数据形状一致',
  )
}

// ================================================================ 执行

console.log('[test:studycard] StudyCard「无词素」空面板修复的 DOM 级验证\n')
selfCheck()
await runCase('① morphless 词（boer 形状）：amber 提示 + 不出现空面板', caseMorphless)
await runCase('② 有拆解词：两 chip + 「+」分隔 + 无 amber', caseDecomposition)
await runCase('③ chain undefined：不抛错，落 amber 分支', caseChainUndefined)
await runCase('④ morphlessKindLabel 映射表（六例）', caseMapping)
await runCase('⑤ 真实数据一致性（words-entry 的 boer）', caseRealData)

// 进程级未捕获异常（渲染异常应由 ErrorBoundary 接住；到这一层说明有漏网）
ok(uncaught.length === 0, `无进程级未捕获异常（实际 ${uncaught.length} 个${uncaught.length ? '：' + uncaught.map((e) => (e && e.message) || e).join(' | ') : ''}）`)

console.log(`\n---------- 断言 ${total} 条 · 通过 ${pass} · 失败 ${fail} ----------\n`)
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

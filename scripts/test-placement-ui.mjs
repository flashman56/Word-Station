/**
 * test:placement-ui —— 起点测评组件的**真实渲染**回归
 * ------------------------------------------------------------------
 * 运行：npm run test:placement-ui（已并入 npm run test:cloud）
 *
 * ★ 为什么必须渲染，不能只测纯函数 ★
 *   test-placement.mjs 证明「算得对」，本文件证明「**显示得对**」。
 *   本特性最可能出的错恰恰在两者之间：
 *     · 组件忘了传 onApplyBand → 按钮点了没反应（纯函数全绿）
 *     · 条件写反 → 证据不足时反而渲染出「用这个档开始」（纯函数全绿）
 *     · 传了 result 却忘了 hasResult → 没测过也显示一份结果
 *   这三类都是「看起来接好了其实没接上」，只有真渲染才现形。
 *   （同款理由见 test-daily-ui.mjs 的文件头。）
 *
 * ★ 脚手架与 test-daily-ui.mjs 同一套 ★
 *   jsdom + 真 React 18 + esbuild 现打包；产物落在 scripts/ 下（react 是 external，
 *   靠 node_modules 向上查找解析）。临时目录用 rename 清理，不用 rmSync ——
 *   50+ 文件的批量删除会触发本机 safe-delete 闸门，把「断言全过」变成退出码 1。
 */
import { JSDOM } from 'jsdom'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'

let pass = 0
const failures = []
const ok = (cond, name, detail = '') => {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const section = (t) => console.log(`\n${t}`)

// ---------------------------------------------------------------- jsdom 脚手架
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.localStorage = dom.window.localStorage
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const esbuild = await import('esbuild')
const { default: React } = await import('react')
const { createRoot } = await import('react-dom/client')
const { act } = await import('react')

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'scripts', '.test-placement-ui-tmp')
mkdirSync(OUT, { recursive: true })

async function loadModule(entryRel) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    define: { 'process.env.NODE_ENV': '"development"' },
    absWorkingDir: ROOT,
  })
  const f = path.join(OUT, entryRel.replace(/[\\/]/g, '__').replace(/\.jsx?$/, '.mjs'))
  writeFileSync(f, result.outputFiles[0].text)
  return import(`file://${f}?v=${Date.now()}${Math.random()}`)
}

const { default: PlacementTest } = await loadModule('src/components/PlacementTest.jsx')
const { buildPlacementProbe, scorePlacement, emptyPlacement } = await loadModule('src/lib/placement.js')

const container = document.createElement('div')
document.body.appendChild(container)

async function render(props) {
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(React.createElement(PlacementTest, props))
  })
  const txt = container.textContent || ''
  const buttons = [...container.querySelectorAll('button')].map((b) => (b.textContent || '').trim())
  const findBtn = (label) => buttons.find((b) => b.includes(label)) || null
  await act(async () => root.unmount())
  return { txt, buttons, findBtn }
}

/** 点一个按钮，返回点击后的文案 */
async function clickAndRerender(props, label) {
  let root = null
  let buttons = []
  await act(async () => {
    root = createRoot(container)
    root.render(React.createElement(PlacementTest, props))
  })
  const target = [...container.querySelectorAll('button')].find((b) => (b.textContent || '').includes(label))
  if (target) {
    await act(async () => {
      target.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    })
  }
  buttons = [...container.querySelectorAll('button')].map((b) => (b.textContent || '').trim())
  const txt = container.textContent || ''
  await act(async () => root.unmount())
  return { txt, buttons, clicked: Boolean(target) }
}

// ---------------------------------------------------------------- 合成 fixture
//
// ★ 为什么必须铺满**每一个**可选题频档 ★
//   第一版只在三个频段各放 40 个词，于是 probeBandIndices 选中的 5 档里有 2 档是空的
//   —— buildPlacementProbe 只能出 24 题（少于 5×8），评分侧 bandCount 不足、
//   reason 变成 'thin'，于是「有结论」那组用例压根进不了 U3。
//   症状是「渲染相关」的断言集体变红，但根因在 fixture 造词造少了 —— 这正是
//   test-daily-ui.mjs 文件头说的「靠字符串匹配断言看不出真因」的同款陷阱。
const N_PER_BAND = 40
function synthLibrary(maxRank) {
  const bands = buildBands(maxRank)
  const words = []
  bands.slice(1).forEach((b) => {
    const lo = Number(b.lo)
    const hi = Number(b.hi)
    const step = Math.max(1, Math.floor((hi - lo) / N_PER_BAND))
    for (let k = 0; k < N_PER_BAND; k += 1) {
      const rank = lo + 1 + k * step
      if (rank > hi) break
      words.push({ id: `w.${b.id}.${k}`, form: `${b.id}w${k}`, freqRank: rank, kind: 'common' })
    }
  })
  return words
}

const { buildBands } = await import('../src/hooks/useLearn.js')
const WORDS = synthLibrary(60000)
const WORDS_MAX = WORDS.reduce((m, w) => (w.freqRank > m ? w.freqRank : m), 0)
const BANDS = buildBands(WORDS_MAX)
const probe = buildPlacementProbe(WORDS, BANDS)

// fixture 自检：造词不对时，后面的断言会集体变红却看不出真因，所以先在这里喊出来
if (probe.size !== 40) {
  console.error(`[test:placement-ui] fixture 造词失败：期望 40 题，实际 ${probe.size} 题`)
  process.exit(1)
}

function answersFor(ratios) {
  const byBand = new Map()
  probe.items.forEach((it) => {
    if (!byBand.has(it.bandIndex)) byBand.set(it.bandIndex, [])
    byBand.get(it.bandIndex).push(it)
  })
  const order = [...byBand.keys()].sort((a, b) => a - b)
  const answers = {}
  order.forEach((bandIndex, pos) => {
    const list = byBand.get(bandIndex)
    const nKnown = Math.round((ratios[pos] || 0) * list.length)
    list.forEach((it, i) => {
      answers[it.id] = i < nKnown ? 'known' : 'unknown'
    })
  })
  return answers
}

const scored = (ratios) => scorePlacement({ items: probe.items, answers: answersFor(ratios), words: WORDS, bands: BANDS })

// ================================================================ 1. 入口态
section('U1. 没测过：入口态')
{
  const { txt, buttons, findBtn } = await render({
    size: probe.size,
    items: [],
    answeredCount: 0,
    answers: {},
    running: false,
    result: null,
    onStart: () => {},
  })
  ok(txt.includes('从哪一档开始背'), '标题说明这是起点测评')
  ok(txt.includes('不会改动你的学习记录'), '★ 明说不会改学习记录（这是用户最担心的副作用）')
  ok(txt.includes(String(probe.size)), `明说题量（${probe.size} 题）`)
  ok(findBtn('开始') !== null, '有「开始」按钮')
  ok(!txt.includes('词汇量'), '入口态不出现任何词汇量数字')
  ok(buttons.length === 1, '入口态只有一个可点的东西（不给人乱点的机会）')
}

// ================================================================ 2. 作答中
section('U2. 作答中')
{
  // 只答了前两档（16 题），组件据此定位当前题
  const twoBands = answersFor([1, 1, 0, 0, 0])
  const firstTwo = probe.items.filter((it) => probe.bandIndexes.indexOf(it.bandIndex) < 2).map((it) => it.id)
  const partial = Object.fromEntries(firstTwo.map((k) => [k, twoBands[k]]))
  const { txt, findBtn } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: firstTwo.length,
    answers: partial,
    running: true,
    done: false,
    result: null,
    onStart: () => {},
    onAnswer: () => {},
    onSubmit: () => {},
    onCancel: () => {},
  })
  // answeredCount 不得超过 items.length：组件用 Math.min 夹住，所以末题显示「第 N / N 个」
  const shown = Math.min(firstTwo.length + 1, probe.size)
  ok(txt.includes(`第 ${shown} / ${probe.size} 个`), `显示进度（第 ${shown} / ${probe.size} 个）`)
  ok(findBtn('认识') !== null && findBtn('不认识') !== null && findBtn('不确定') !== null, '三个作答按钮齐全')
  ok(findBtn('放弃') !== null, '有「放弃」（可退出，不逼答完 40 题）')
  ok(txt.includes('按「不认识」计'), '★ 明说「不确定」按不认识计（解释偏保守的原因）')
  ok(!findBtn('交卷'), '没答满时没有「交卷」（按钮显示剩余题数）')
}

{
  // 点「认识」真的回调了 onAnswer
  let called = null
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(
      React.createElement(PlacementTest, {
        size: probe.size,
        items: probe.items,
        answeredCount: 0,
        answers: {},
        running: true,
        done: false,
        result: null,
        onAnswer: (id, v) => {
          called = { id, v }
        },
        onSubmit: () => {},
        onCancel: () => {},
      }),
    )
  })
  const btn = [...container.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '认识')
  await act(async () => {
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  ok(called && called.id === probe.items[0].id, '点「认识」回调 onAnswer(当前题 id)')
  ok(called && called.v === 'known', '回调值是 known')
  await act(async () => root.unmount())
}

// ================================================================ 3. 结果态（有结论）
section('U3. 结果态：给出建议档')
{
  const result = scored([1, 1, 0.9, 0, 0])
  ok(result.sufficient === true, 'fixture：有结论（sufficient=true）')

  const { txt, findBtn } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: probe.size,
    answers: answersFor([1, 1, 0.9, 0, 0]),
    running: false,
    done: true,
    result,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: null,
  })
  ok(txt.includes('建议从'), '显示建议起点档')
  // buildBands 的档只有 {id, lo, hi, label}，而 bandRangeLabel 按 lo~hi 带千分位渲染
  // （「30,000~40,000」）。断言必须比**渲染口径**，不能直接拿 band.label 原串比 ——
  // 否则这里红的是格式差异，而真出 bug 时（比如档算错）也红在这里，两种都看不出区别。
  const bandLo = result.band.lo.toLocaleString('en-US')
  const bandHi = result.band.hi.toLocaleString('en-US')
  ok(txt.includes(`${bandLo}~${bandHi}`), `建议档标签与结果一致（${bandLo}~${bandHi}）`)
  ok(txt.includes(`大约认识 ${result.estimate.toLocaleString('en-US')} 词`), `显示词汇量估计（${result.estimate}）`)
  ok(txt.includes('证据：'), '★ 有「证据」行')
  ok(txt.includes('作答'), '证据行里有作答数')
  ok(txt.includes('限度：'), '★ 有「限度」行')
  ok(txt.includes('自评抽样'), '★ 限度行明说这是自评、不是测验')
  ok(findBtn('重测') !== null, '有「重测」')
  ok(findBtn('看每一档的证据') !== null, '有「看每一档的证据」的展开入口')
  ok(txt.includes('已在学的词不受影响'), '★ 明说只影响新会话（改档的副作用边界）')
}

// ================================================================ 4. 「用这个档开始」真的回调
section('U4. 采用推荐档 → 真的把 band 对象传出去')
{
  const result = scored([1, 1, 0.9, 0, 0])
  let got = null
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(
      React.createElement(PlacementTest, {
        size: probe.size,
        items: probe.items,
        answeredCount: probe.size,
        answers: answersFor([1, 1, 0.9, 0, 0]),
        running: false,
        done: true,
        result,
        onApplyBand: (b) => {
          got = b
        },
        onRetake: () => {},
        activeBandId: null,
      }),
    )
  })
  const btn = [...container.querySelectorAll('button')].find((b) => (b.textContent || '').includes('这一档开始'))
  ok(Boolean(btn), '有「从 X 这一档开始」按钮')
  await act(async () => {
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  ok(got !== null, '★ 点按钮真的回调 onApplyBand')
  ok(got && got.lo === result.band.lo && got.hi === result.band.hi, '★ 回调传出的是完整的 band 对象（lo/hi 齐全）')
  ok(got && got.id === result.band.id, 'band 对象带 id（与难度分档按钮用的是同一个字段）')
  await act(async () => root.unmount())
}

{
  // 已经生效时：按钮变禁用态且文案说清「已经在用」
  const result = scored([1, 1, 0.9, 0, 0])
  const { txt, buttons } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: probe.size,
    answers: answersFor([1, 1, 0.9, 0, 0]),
    running: false,
    done: true,
    result,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: result.band.id,
  })
  ok(txt.includes('已经在用'), '已在该档时按钮文案改为「已经在用」（不重复施力）')
  ok(buttons.some((b) => b.includes('已经在用')), '「已经在用」是一个真实按钮')
}

// ================================================================ 5. 证据不足 / 饱和：不给数
section('U5. 不给结论的两种情形，界面上也必须不给')
{
  // 5.1 证据不足
  const partialAnswers = answersFor([1, 1, 0, 0, 0])
  const ids = Object.keys(partialAnswers).slice(0, 12)
  const thin = scorePlacement({
    items: probe.items,
    answers: Object.fromEntries(ids.map((k) => [k, partialAnswers[k]])),
    words: WORDS,
    bands: BANDS,
  })
  ok(thin.reason === 'thin', `fixture：证据不足（reason='${thin.reason}'）`)

  const { txt, findBtn } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: ids.length,
    answers: Object.fromEntries(ids.map((k) => [k, partialAnswers[k]])),
    running: false,
    done: false,
    result: thin,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: null,
  })
  ok(txt.includes('太薄'), '证据不足：标题说明证据薄')
  ok(txt.includes('不给数字'), '★ 证据不足：明说「不给数字」')
  ok(!/大约认识\s*[\d,]+/.test(txt), '★ 证据不足：页面上没有任何词汇量数字')
  ok(findBtn('从') === null || !buttons_start(txt), '★ 证据不足：没有「从这一档开始」按钮')
  ok(txt.includes('默认档'), '证据不足：给出可执行的替代（从默认档开始）')
  // 「为什么不给」必须说清楚是**覆盖不足**（而不只是「样本少」）：
  // 只答 12 个但铺在 5 档上，样本量与覆盖率是两个独立的问题，混淆会误导用户重答
  ok(txt.includes('词频段'), '★ 证据不足：点明「词频段覆盖不足」是原因之一')
  ok(txt.includes('只会误导你'), '★ 证据不足：说明为什么宁可不给（而不是含糊说「再测一次」）')
}

function buttons_start(txt) {
  return /从\s*[\d,]+\+?\s*~?\s*[\d,]*\s*这一档开始/.test(txt)
}

{
  // 5.2 饱和（全答认识）
  const sat = scored([1, 1, 1, 1, 1])
  ok(sat.reason === 'saturated', `fixture：饱和（reason='${sat.reason}'）`)
  ok(sat.estimate === null, 'fixture：饱和时 estimate 为 null')

  const { txt, findBtn } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: probe.size,
    answers: answersFor([1, 1, 1, 1, 1]),
    running: false,
    done: true,
    result: sat,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: null,
  })
  ok(txt.includes('不给词汇量数字'), '★ 饱和：标题明说不给词汇量数字')
  ok(!/大约认识\s*[\d,]+/.test(txt), '★ 饱和：页面上没有任何词汇量数字')
  ok(!txt.includes('64,700') && !txt.includes('64700'), '★ 饱和：绝不出现 64,700')
  ok(txt.includes(`${Math.round(sat.hardestKnownP * 100)}%`), '饱和：给出最难档的已知率作为理由')
  ok(findBtn('重测') !== null, '饱和：仍可重测（这是用户唯一的出路）')
  ok(!buttons_start(txt), '★ 饱和：没有「从这一档开始」按钮')
  ok(txt.includes('先从默认档'), '饱和：给出可执行的替代（从默认档开始）')
}

// ================================================================ 6. 证据表
section('U6. 展开的证据表')
{
  const result = scored([1, 1, 0.9, 0, 0])
  const { txt, buttons } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: probe.size,
    answers: answersFor([1, 1, 0.9, 0, 0]),
    running: false,
    done: true,
    result,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: null,
  })
  ok(!txt.includes('库内词数'), '默认不展开证据表')

  const expanded = await clickAndRerender(
    {
      size: probe.size,
      items: probe.items,
      answeredCount: probe.size,
      answers: answersFor([1, 1, 0.9, 0, 0]),
      running: false,
      done: true,
      result,
      onApplyBand: () => {},
      onRetake: () => {},
      activeBandId: null,
    },
    '看每一档的证据',
  )
  ok(expanded.clicked, '能点开证据表')
  ok(expanded.txt.includes('库内词数'), '★ 证据表展开：每档的库内词数')
  ok(expanded.txt.includes('抽样'), '证据表标出哪些档是抽样的')
  ok(expanded.txt.includes('插值'), '★ 证据表标出哪些档是插值的（没抽到却参与计算的档）')
  ok(expanded.txt.includes('线性补'), '★ 说明插值是怎么来的')
  void buttons
}

{
  // 不充分时不该出现「看证据」入口 —— 没有结论时，摊开分档表只会让人误读
  const thin = scorePlacement({
    items: probe.items,
    answers: Object.fromEntries(Object.keys(answersFor([1, 1, 0, 0, 0])).slice(0, 10).map((k) => [k, 'known'])),
    words: WORDS,
    bands: BANDS,
  })
  const { buttons, txt } = await render({
    size: probe.size,
    items: probe.items,
    answeredCount: 10,
    answers: {},
    running: false,
    done: false,
    result: thin,
    onApplyBand: () => {},
    onRetake: () => {},
    activeBandId: null,
  })
  ok(!buttons.some((b) => b.includes('看每一档的证据')), '证据不足时没有「看证据」入口')
  ok(!txt.includes('库内词数'), '证据不足时不展开分档表')
}

// ================================================================ 7. 词库未加载
section('U7. 词库还没加载完')
{
  const { txt } = await render({
    size: 0,
    items: [],
    answeredCount: 0,
    answers: {},
    running: false,
    result: null,
    onStart: () => {},
  })
  ok(txt.includes('从哪一档开始背'), '词库未加载时仍渲染入口（不白屏）')
  const { txt: emptyTxt } = await render({
    size: probe.size,
    items: [],
    answeredCount: 0,
    answers: {},
    running: false,
    result: emptyPlacement(),
    onStart: () => {},
    onApplyBand: () => {},
    onRetake: () => {},
  })
  // emptyPlacement 的 sampleSize=0 → reason='thin' → 走「证据不足」那一支。
  // 组件必须**不崩**且给出可读文案；这里断言的是「有话说」，不是具体哪句 ——
  // 因为「0 个」这种文案本身不该被用户看见（入口态才是它的正常呈现）。
  ok(
    emptyTxt.includes('这次的作答太薄') || emptyTxt.includes('正在读取'),
    '空结果不会崩（有兜底文案）',
  )
  ok(!emptyTxt.includes('undefined') && !emptyTxt.includes('NaN'), '★ 空结果不出现 undefined / NaN')
}

// ================================================================ 汇总
console.log(`\n${'-'.repeat(60)}`)
if (failures.length === 0) {
  console.log(`[test:placement-ui] ✓ 通过（${pass} 条断言）`)
  console.log('  三形态（入口 / 作答 / 结果）+ 两种不给结论的情形，全部真渲染验证')
  process.exit(0)
}
console.error(`[test:placement-ui] ✗ 失败（${failures.length}/${pass + failures.length} 条）\n`)
failures.forEach((f) => console.error(`  ✗ ${f.name}${f.detail ? `\n      ${f.detail}` : ''}`))
process.exit(1)
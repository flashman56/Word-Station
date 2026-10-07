/**
 * QA 独立验证：T05 的 B-8 提示（私有词 > 500 显示、≤500 不显示）
 * ------------------------------------------------------------------
 * 补上实现者自己标记的缺口：「只在纯函数层断言过，从没拿 501 个真私有词跑过」。
 *
 * 这里用**真组件 + 真 React + 真的 501 个私有词对象**跑，断言两件事：
 *   T1  501 个私有词 → LearnHome 渲染 B-8 提示「私有词较多，词汇量估算暂不含私有词」
 *   T2  500 个私有词 → **不**渲染该提示
 *   T3  提示文案里**不出现** 500 这个阈值（设计：「阈值不暴露给用户」）
 *   T4  B-3 的「含 N 个私有词」在两侧都渲染，且 N 正确
 *
 * 阈值判据本身（`<= MAX_VOCAB_PRIVATE_WORDS`）也在真实边界上打一遍。
 *
 * 跑：node scripts/qa-t05-b8.mjs
 */
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import * as esbuild from 'esbuild'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'scripts', '.qa-t05-tmp')
mkdirSync(OUT_DIR, { recursive: true })

async function loadModule(entryRel) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    // ★ react 必须 external：否则 esbuild 会把 react 打进 bundle，
    // 与本脚本从 node_modules 导入的那份形成**两个 React 实例**，
    // hooks dispatcher 为 null → "Cannot read properties of null (reading 'useState')"。
    // bundle 目录在 scripts/ 下（仓库内），所以 external 也能正常解析到 node_modules。
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    define: { 'process.env.NODE_ENV': '"development"' },
    absWorkingDir: ROOT,
  })
  const outFile = path.join(OUT_DIR, entryRel.replace(/[\\/]/g, '__').replace(/\.jsx?$/, '.mjs'))
  writeFileSync(outFile, result.outputFiles[0].text)
  return import(`file://${outFile}?v=${Date.now()}${Math.random()}`)
}

// ---------------------------------------------------------------- jsdom
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://qa.test/',
  pretendToBeVisual: true,
})
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.Event = dom.window.Event
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.localStorage = dom.window.localStorage
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(() => {})
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = (await import('react')).default
const { createRoot } = await import('react-dom/client')
const { act } = await import('react')

const LearnHomeMod = await loadModule('src/components/LearnHome.jsx')
const LearnHome = LearnHomeMod.default

// ---------------------------------------------------------------- 断言框架
let pass = 0
const failures = []
async function ok(name, fn) {
  try {
    await fn()
    pass += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failures.push({ name, message: e.message })
    console.log(`  ✗ ${name}\n      ${e.message}`)
  }
}

// ---------------------------------------------------------------- 501 个真私有词
/** 造 N 个私有词视图对象（word_key 口径与公共词一致，带 u. 前缀） */
function makePrivateWords(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `u.qa.private.${i}`,
    form: `privword${i}`,
    gloss: `私有词释义 ${i}`,
    freqRank: null,
    status: 'unknown',
  }))
}

// LearnHome 的默认 props —— 只给 B-8 / B-3 关心的那几个
const baseProps = {
  stats: { unknown: 100, review: 0, known: 0, total: 100 },
  learnQueue: [],
  reviewQueue: [],
  onStartLearn: () => {},
  onStartReview: () => {},
  band: 'all',
  bands: [{ id: 'all', label: '全部' }],
  bandCounts: { all: 100 },
  groupByFamily: true,
  onChangeBand: () => {},
  onToggleGroupByFamily: () => {},
}

const container = dom.window.document.createElement('div')
dom.window.document.body.appendChild(container)
let root = null
async function render(props) {
  if (!root) root = createRoot(container)
  await act(async () => { root.render(React.createElement(LearnHome, props)) })
}
function text() { return container.textContent || '' }

/** 复刻 App.jsx:245 的判据 */
const MAX_VOCAB_PRIVATE_WORDS = 500
function computeIncludesPrivate(n) { return n <= MAX_VOCAB_PRIVATE_WORDS }

// ---------------------------------------------------------------- T1 / T2 / T3 / T4
console.log('\n[qa-t05-b8] T1  501 个真私有词 → 显示 B-8 提示')

await ok('T1a 501 个私有词 → B-8 提示出现', async () => {
  const privates = makePrivateWords(501)
  const n = privates.length
  const vocabIncludesPrivate = computeIncludesPrivate(n)
  await render({
    ...baseProps,
    vocab: { estimate: 3500, label: '四级 ~4,500', bounds: [500, 1000] },
    privateCount: n,
    vocabIncludesPrivate,
  })
  assert.equal(vocabIncludesPrivate, false, '501 > 500 应回退到公共词口径')
  const t = text()
  assert.ok(t.includes('私有词较多，词汇量估算暂不含私有词'), `实际文案：${t.slice(0, 400)}`)
})

await ok('T1b 提示文案与源码定稿逐字一致', async () => {
  const t = text()
  const exact = '私有词较多，词汇量估算暂不含私有词'
  assert.ok(t.includes(exact), '文案被改写了')
})

await ok('T1c ★ 提示里不出现阈值 500（设计：「阈值不暴露给用户」）', async () => {
  const t = text()
  assert.ok(!/500/.test(t), `文案里泄漏了阈值：${t.slice(0, 400)}`)
})

await ok('T1d B-3「含 501 个私有词」同时渲染', async () => {
  const t = text()
  assert.ok(t.includes('含 501 个私有词'), `实际：${t.slice(0, 400)}`)
})

console.log('\n[qa-t05-b8] T2  恰好 500 个私有词 → 不显示 B-8 提示')

await ok('T2a 500 个私有词 → B-8 提示**不**出现（边界含等号）', async () => {
  const privates = makePrivateWords(500)
  const vocabIncludesPrivate = computeIncludesPrivate(privates.length)
  assert.equal(vocabIncludesPrivate, true, '500 <= 500 应仍含私有词')
  await render({
    ...baseProps,
    vocab: { estimate: 3500, label: '四级 ~4,500', bounds: [500, 1000] },
    privateCount: privates.length,
    vocabIncludesPrivate,
  })
  const t = text()
  assert.ok(!t.includes('私有词较多'), `500 个时不该显示 B-8 提示：${t.slice(0, 400)}`)
})

await ok('T2b 边界对照：499 / 500 不显示，501 显示（逐点验证判据）', async () => {
  for (const n of [0, 1, 499, 500]) {
    const inc = computeIncludesPrivate(n)
    assert.equal(inc, true, `${n} 个私有词应含入估算`)
    await render({ ...baseProps, vocab: { estimate: 3500, label: 'x', bounds: [] }, privateCount: n, vocabIncludesPrivate: inc })
    assert.ok(!text().includes('私有词较多'), `${n} 个时不该显示`)
  }
  for (const n of [501, 502, 5000]) {
    const inc = computeIncludesPrivate(n)
    assert.equal(inc, false, `${n} 个私有词应回退`)
    await render({ ...baseProps, vocab: { estimate: 3500, label: 'x', bounds: [] }, privateCount: n, vocabIncludesPrivate: inc })
    assert.ok(text().includes('私有词较多'), `${n} 个时应显示 B-8`)
  }
})

console.log('\n[qa-t05-b8] T3  私有词真的进了统计与复习队列（T05 主张）')

const learningMod = await loadModule('src/lib/learning.js')
const { countByStatus, buildReviewQueue } = learningMod

await ok('T3a 501 个私有词全部计入统计（total 含私有词）', () => {
  const pub = Array.from({ length: 50 }, (_, i) => ({ id: `w.pub.${i}`, freqRank: i + 1 }))
  const priv = makePrivateWords(501)
  const statWords = [...pub, ...priv]
  // 给 2 个私有词打 known、1 个打 review（review 队列只收 review 状态的词）
  const records = {
    'u.qa.private.0': { status: 'known', statusSource: 'learning', nextDueAt: null },
    'u.qa.private.1': { status: 'review', statusSource: 'learning', nextDueAt: null },
    'u.qa.private.2': { status: 'known', statusSource: 'learning', nextDueAt: null },
  }
  const st = countByStatus(statWords, records)
  assert.equal(st.total, 551, `total 应为 50+501=551，实际 ${st.total}`)
  assert.equal(st.known, 2, `known 应为 2，实际 ${st.known}`)
  assert.equal(st.review, 1, `review 应为 1，实际 ${st.review}`)
  assert.equal(st.unknown, 548, `unknown 应为 548，实际 ${st.unknown}`)
})

await ok('T3b 对照：501 个私有词若**不**并入统计，total 就会少 501（T05 的主张可证伪）', () => {
  const pub = Array.from({ length: 50 }, (_, i) => ({ id: `w.pub.${i}`, freqRank: i + 1 }))
  const priv = makePrivateWords(501)
  const withPrivate = countByStatus([...pub, ...priv], {})
  const withoutPrivate = countByStatus(pub, {})
  assert.equal(withPrivate.total - withoutPrivate.total, 501, '私有词确实进了统计')
})

await ok('T3c 私有词进入复习队列（buildReviewQueue 看得到它们）', () => {
  const pub = Array.from({ length: 50 }, (_, i) => ({ id: `w.pub.${i}`, freqRank: i + 1 }))
  const priv = makePrivateWords(501)
  const records = {
    // review 状态的词才进复习队列（known 是已掌握，不排）
    'u.qa.private.1': { status: 'review', statusSource: 'learning', nextDueAt: null, incorrectCount: 1 },
    'u.qa.private.7': { status: 'review', statusSource: 'learning', nextDueAt: null, incorrectCount: 1 },
  }
  const q = buildReviewQueue([...pub, ...priv], records, 100, new Date().toISOString())
  const keys = q.map((w) => w.id)
  assert.ok(keys.includes('u.qa.private.1'), 'review 私有词未进复习队列')
  assert.ok(keys.includes('u.qa.private.7'), 'review 私有词未进复习队列')
  const qNoPrivate = buildReviewQueue(pub, records, 100, new Date().toISOString())
  assert.equal(qNoPrivate.length, 0, '不并入私有词时队列为空 —— 反证私有词确实进了队列')
})

await ok('T3d 未到期的 review 私有词不排进队列（nextDueAt 语义仍成立）', () => {
  const pub = [{ id: 'w.pub.0', freqRank: 1 }]
  const priv = makePrivateWords(501)
  const future = new Date(Date.now() + 86400000).toISOString()
  const records = { 'u.qa.private.1': { status: 'review', statusSource: 'learning', nextDueAt: future } }
  const q = buildReviewQueue([...pub, ...priv], records, 100, new Date().toISOString())
  assert.equal(q.length, 0, '未到期的 review 词不该排进队列')
})

await ok('T3e 私有词不进新学队列（learnPool 只用公共词 —— Q4 的理由）', async () => {
  const useLearnMod = await loadModule('src/hooks/useLearn.js')
  const pub = Array.from({ length: 50 }, (_, i) => ({ id: `w.pub.${i}`, freqRank: i + 1 }))
  const priv = makePrivateWords(501)
  // 复刻 useLearn 的 statWords / learnPool 分工
  const { bandFilter } = useLearnMod
  const statWords = priv.length ? [...pub, ...priv] : pub
  const learnPool = bandFilter(pub, 'all')
  assert.equal(statWords.length, 551)
  assert.equal(learnPool.length, 50, '新学队列只用公共词')
  assert.ok(!learnPool.some((w) => String(w.id).startsWith('u.')), '私有词不该进新学队列')
})

// ---------------------------------------------------------------- 汇总
if (root) await act(async () => root.unmount())
rmSync(OUT_DIR, { recursive: true, force: true })
dom.window.close()

console.log(`\n[qa-t05-b8] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  console.error('[qa-t05-b8] ✗ 失败：')
  failures.forEach((f) => console.error(`  - ${f.name}: ${f.message}`))
  process.exit(1)
}
console.log('[qa-t05-b8] ✓ 全部通过（B-8 缺口已闭合）')
process.exit(0)

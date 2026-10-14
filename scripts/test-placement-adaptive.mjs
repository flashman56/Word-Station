/**
 * test:placement-adaptive —— 自适应（二分式）起点测评的整链路回归
 * ------------------------------------------------------------------
 * 运行：node scripts/test-placement-adaptive.mjs（建议并入 test:cloud）
 *
 * ★ 为什么这个测试必须存在 ★
 *   自适应把「固定 40 题」改成了「每答一题动态选下一题、直到置信区间够窄才停」。
 *   这条改动最危险的两个退化都是静默的：
 *     ① 答题后题目不收敛（boundary 永远跳到极端）→ 用户被反复问同一档，永远停不下来；
 *     ② 二次确认形同虚设（answer 直接落定，不看释义就记入）→ 与「背单词两步确认」
 *        的同款契约被破坏，自评失去意义。
 *   两种退化纯函数测试都看不出来，必须驱动**真实 hook**走完一整轮。
 *
 * 本文件分两段：
 *   A. 纯函数方向性：pickNextPlacementWord 在「认识→升一点 / 不认识→降一点」上的行为
 *      （不渲染，直接验证抽题落点随作答移动）
 *   B. 真实 hook 整轮：模拟三类用户（中段阈值 / 全认识 / 全不认识），
 *      断言 ① 收敛（finished 且题数在 [MIN_Q, MAX_Q] 或退化态）② 二次确认契约
 *      （answer 只进 pending、不增已答；confirm 才落定）③ 评分复用 scorePlacement。
 *
 * 脚手架与 test-placement-hook.mjs 同一套（jsdom + 真 React 18 + esbuild 现打包）。
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
const OUT = path.join(ROOT, 'scripts', '.test-placement-adaptive-tmp')
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

const { usePlacement } = await loadModule('src/hooks/usePlacement.js')
const { buildBands } = await import('../src/hooks/useLearn.js')
const { default: PlacementTest } = await loadModule('src/components/PlacementTest.jsx')
const {
  pickNextPlacementWord,
  placementShouldStop,
  PLACEMENT_ADAPTIVE_MAX_Q,
  PLACEMENT_ADAPTIVE_MIN_Q,
  PLACEMENT_SEED_RANK,
} = await loadModule('src/lib/placement.js')
const { clearPlacement } = await import('../src/lib/placementStore.js')

let WORDS = null
try {
  ;({ default: WORDS } = await loadModule('src/data/words-entry.js'))
} catch (e) {
  console.error('[test:placement-adaptive] 词库打包失败：', e && e.message)
  process.exit(1)
}

const maxRank = WORDS.reduce(
  (m, w) => (w && typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) && w.freqRank > m ? w.freqRank : m),
  0,
)
const BANDS = buildBands(maxRank)
section('A0. 词库与分档就绪')
ok(Array.isArray(WORDS) && WORDS.length > 1000, `词库加载成功（${WORDS.length} 词）`)
ok(BANDS.length > 5, `难度档生成 ${BANDS.length} 档（含「全部」）`)
ok(PLACEMENT_ADAPTIVE_MAX_Q === 40 && PLACEMENT_ADAPTIVE_MIN_Q === 12, '自适应题量闸门 12~40')

// ================================================================ A. 纯函数方向性
section('A. pickNextPlacementWord 随作答移动边界（会的升、不会的降）')

const first = pickNextPlacementWord(WORDS, BANDS, [], {})
ok(first && typeof first.freqRank === 'number', '空作答也能出首题')
ok(
  first && Math.abs(first.freqRank - PLACEMENT_SEED_RANK) <= 3000,
  `首题落在中段附近（rank=${first ? first.freqRank : '?'} ≈ seed ${PLACEMENT_SEED_RANK}，不从头/从尾开始）`,
)

// 首题答「认识」→ 边界上移 → 下一题更难
const knownItems = [{ id: first.id, form: first.form, freqRank: first.freqRank, bandIndex: first.bandIndex }]
const knownAns = { [first.id]: 'known' }
const second = pickNextPlacementWord(WORDS, BANDS, knownItems, knownAns)
ok(second && second.freqRank > first.freqRank, `认识 → 下一题更难（${first.freqRank} → ${second ? second.freqRank : '?'}）`)

// 第二题答「不认识」→ 边界落回两者之间 → 下一题介于两者之间（二分逼近）
const unkItems = knownItems.concat([
  { id: second.id, form: second.form, freqRank: second.freqRank, bandIndex: second.bandIndex },
])
const unkAns = { ...knownAns, [second.id]: 'unknown' }
const third = pickNextPlacementWord(WORDS, BANDS, unkItems, unkAns)
ok(
  third && third.freqRank > first.freqRank && third.freqRank < second.freqRank,
  `不认识 → 下一题落在两者之间（${first.freqRank} < ${third ? third.freqRank : '?'} < ${second.freqRank}）`,
)

// placementShouldStop：题数到上限必停；前几题（< MIN_Q）即便运气好也不停
ok(placementShouldStop(new Array(PLACEMENT_ADAPTIVE_MAX_Q).fill({ id: 'x', freqRank: 1, bandIndex: 0 }), { sufficient: true, estimate: 100, low: 90, high: 110 }) === true, '题数到 40 上限必停')
ok(
  placementShouldStop(new Array(3).fill({ id: 'x', freqRank: 1, bandIndex: 0 }), { sufficient: true, estimate: 100, low: 99, high: 101 }) === false,
  '少于 12 题即便区间很窄也不停（防止前几题运气好就停）',
)

// ================================================================ B. 真实 hook 整轮
section('B. 真实 hook 跑完整轮（含二次确认契约）')

// 壳组件：把 hook 接到组件，并把「最新的 placement」外泄到模块级 H，供循环驱动
let activeScope = 'test-scope-adaptive'
let H = null
function Harness() {
  const placement = usePlacement(WORDS, BANDS, activeScope)
  H = placement
  return React.createElement(PlacementTest, {
    ...placement,
    onStart: placement.start,
    onAnswer: placement.answer,
    onConfirm: placement.confirm,
    onUndo: placement.undo,
    onRetake: placement.retake,
    onCancel: placement.cancel,
    onApplyBand: () => {},
    activeBandId: null,
  })
}

/**
 * 驱动一次完整自适应测评。
 * @param {(freqRank:number)=>'known'|'unknown'|'unsure'} decide 模拟用户：给定词频序号给出作答
 * @returns {{ finished:boolean, items:Array, guard:number, result:object|null }}
 */
async function runAdaptive(scope, decide) {
  activeScope = scope
  clearPlacement(scope)
  const container = document.createElement('div')
  document.body.appendChild(container)
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(React.createElement(Harness))
  })
  await act(async () => {
    H.start()
  })
  let guard = 0
  while (H.finished === false && guard < 200) {
    guard += 1
    const cur = H.current
    if (!cur) break
    const value = decide(cur.freqRank)
    const beforeLen = H.items.length
    // ★ 二次确认契约 ①：answer 只进 pending，不增已答、不改 current
    await act(async () => {
      H.answer(cur.id, value)
    })
    ok(H.pendingValue === value, `B. 二次确认①：选「${value}」后 pendingValue 已设（第 ${beforeLen + 1} 题）`)
    ok(H.items.length === beforeLen, 'B. 二次确认①：确认前已答数不增（未落定）')
    ok(H.current && H.current.id === cur.id, 'B. 二次确认①：当前题仍是同一词（等待确认）')
    // ★ 二次确认契约 ②：confirm 才落定为已答
    await act(async () => {
      H.confirm()
    })
    ok(H.items.length === beforeLen + 1, 'B. 二次确认②：确认后该题落定为已答')
  }
  const out = { finished: H.finished, items: H.items, guard, result: H.result }
  await act(async () => root.unmount())
  document.body.removeChild(container)
  clearPlacement(scope)
  return out
}

// ---- B1. 中段阈值用户（认识 rank≤15000，不认识以上）----
section('B1. 中段阈值用户（认识 ≤15000）：收敛到真实起点档')
{
  const THRESHOLD = 15000
  const r = await runAdaptive(`test-scope-adaptive-mid-${Date.now()}`, (rank) => (rank <= THRESHOLD ? 'known' : 'unknown'))
  ok(r.finished === true, `★ 收敛结束（guard=${r.guard}，未陷入死循环）`)
  ok(r.items.length >= PLACEMENT_ADAPTIVE_MIN_Q, `★ 题数 ≥ 下限 ${PLACEMENT_ADAPTIVE_MIN_Q}（实际 ${r.items.length}）`)
  ok(r.items.length <= PLACEMENT_ADAPTIVE_MAX_Q, `★ 题数 ≤ 上限 ${PLACEMENT_ADAPTIVE_MAX_Q}（实际 ${r.items.length}）`)
  ok(r.result && r.result.sufficient === true, '★ 评分充分（sufficient=true，未退化为 thin/saturated）')
  ok(r.result && r.result.band !== null, '★ 给出推荐起点档（边界被测到）')
  if (r.result && r.result.band) {
    const lo = Number(r.result.band.lo)
    ok(
      lo >= THRESHOLD - 6000 && lo <= THRESHOLD + 6000,
      `推荐档落在真实阈值附近（band.lo=${lo}，阈值=${THRESHOLD}，±2 档容差）`,
    )
    ok(r.result.estimate > 0 && r.result.estimate < WORDS.length, `词汇量估计在合理区间（${r.result.estimate}）`)
  }
}

// ---- B2. 全认识用户：饱和，不给数（与旧版一致）----
section('B2. 全认识用户：饱和，正确不给词汇量数字')
{
  const r = await runAdaptive(`test-scope-adaptive-allknown-${Date.now()}`, () => 'known')
  ok(r.finished === true, `★ 收敛结束（guard=${r.guard}）`)
  ok(r.result && r.result.reason === 'saturated', `★ 饱和（reason='${r.result ? r.result.reason : '?'}'）`)
  ok(r.result && r.result.estimate === null, '★ 饱和时不给词汇量估计（避免假 64,700）')
  ok(r.result && r.result.band === null, '★ 饱和时不给推荐档（边界测不到）')
}

// ---- B3. 全不认识用户：收敛终止（题量有界），不陷入死循环----
section('B3. 全不认识用户：终止且不越界')
{
  const r = await runAdaptive(`test-scope-adaptive-allunk-${Date.now()}`, () => 'unknown')
  ok(r.finished === true, `★ 收敛结束（guard=${r.guard}，未陷入死循环）`)
  ok(r.items.length <= PLACEMENT_ADAPTIVE_MAX_Q, `★ 题数 ≤ 上限 ${PLACEMENT_ADAPTIVE_MAX_Q}（实际 ${r.items.length}）`)
  ok(r.result && (r.result.reason === 'thin' || r.result.band !== null), '终止态合理（证据不足 thin，或落到最低档）')
}

// ================================================================ 汇总
console.log(`\n${'-'.repeat(60)}`)
if (failures.length === 0) {
  console.log(`[test:placement-adaptive] ✓ 通过（${pass} 条断言）`)
  console.log('  A. 抽题边界随作答移动（二分）· B. 真实 hook 整轮 + 二次确认契约')
  try {
    renameSync(OUT, `${OUT}-done`)
  } catch {}
  process.exit(0)
}
console.error(`[test:placement-adaptive] ✗ 失败（${failures.length}/${pass + failures.length} 条）\n`)
failures.forEach((f) => console.error(`  ✗ ${f.name}${f.detail ? `\n      ${f.detail}` : ''}`))
try {
  renameSync(OUT, `${OUT}-done`)
} catch {}
process.exit(1)

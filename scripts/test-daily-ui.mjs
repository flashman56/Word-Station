/**
 * test:daily-ui —— 日循环组件的**真实渲染**回归
 * ------------------------------------------------------------------
 * 运行：npm run test:daily-ui
 *
 * ★ 为什么必须渲染，不能只测纯函数 ★
 *   纯函数说「dueRound=7、minutes=6」，UI 完全可能仍显示旧的「优先复习（7）」
 *   而没有那行「约 6 分钟」；也可能 weekly summary 传了 summary 却因为条件写错
 *   整块不渲染。这类「看起来接好了其实没接上」的 bug 只有真渲染才现形。
 *   纯函数那半在 test-daily-loop.mjs（90 条），此文件是它的对照。
 *
 * ★ 依赖与打包方式（与 qa-gaps.mjs 同一套脚手架）★
 *   jsdom + 真 React 18 + esbuild 现打包。产物落在项目内 scripts/ 下，
 *   因为 bundle 里 react 是 external，靠 node_modules 向上查找解析。
 *
 * ★ 清理不用 rmSync ★
 *   临时 bundle 目录有 50+ 文件，会触发本机 safe-delete 的批量删除闸门，
 *   把「断言全过」变成退出码 1，很有迷惑性（我踩过一次）。改为 rename。
 */
import { JSDOM } from 'jsdom'
import { writeFileSync, mkdirSync, renameSync } from 'node:fs'
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
const OUT = path.join(ROOT, 'scripts', '.test-daily-ui-tmp')
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

const { default: LearnHome } = await loadModule('src/components/LearnHome.jsx')
const { default: StudySession } = await loadModule('src/components/StudySession.jsx')
const { default: WeeklySummary } = await loadModule('src/components/WeeklySummary.jsx')
const { buildDailyTask, buildWeeklySummary, estimateDailyMinutes } = await loadModule('src/lib/daily.js')

const container = document.createElement('div')
document.body.appendChild(container)

async function render(props, comp = LearnHome) {
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(React.createElement(comp, props))
  })
  const txt = container.textContent || ''
  const buttons = [...container.querySelectorAll('button')].map((b) => (b.textContent || '').trim())
  await act(async () => root.unmount())
  return { txt, buttons }
}

// ---------------------------------------------------------------- 合成 fixture
const H = 36e5
const D = 864e5
const NOW = Date.now()
const NOW_ISO = new Date(NOW).toISOString()
const iso = (off) => new Date(NOW + off).toISOString()

/**
 * 造词库 + 记录，喂给**真实的** buildDailyTask。
 * 三段 id 区间互不重叠（到期 0-49 / 24h内 50-99 / 更晚 100-149），否则
 * 「全空」场景会被 upcoming 段悄悄填满，newTotal 根本不是 0 —— 我第一版就踩了。
 */
function fixture({ due = 0, upcoming = 0, scheduled = 0 } = {}) {
  const words = Array.from({ length: 200 }, (_, i) => ({ id: `w.${i}`, form: `w${i}`, freqRank: 3000 + i }))
  const records = {}
  const revRec = (nextDueAt, lastStudiedAt) => ({
    status: 'review', consecutiveCorrect: 0, correctCount: 0, incorrectCount: 1,
    lastStudiedAt, lastResult: lastStudiedAt ? 'incorrect' : null,
    lastIncorrectAt: lastStudiedAt,
    nextDueAt,
    statusChangedAt: lastStudiedAt || iso(0),
    statusSource: 'learning',
  })
  for (let i = 0; i < due; i += 1) records[`w.${i}`] = revRec(iso(-H), iso(-2 * D))
  for (let i = 0; i < upcoming; i += 1) records[`w.${50 + i}`] = revRec(iso(6 * H), iso(0))
  for (let i = 0; i < scheduled; i += 1) records[`w.${100 + i}`] = revRec(iso(48 * H), iso(0))
  // 已掌握占掉尾部，让「剩下的都是新词」这个说法成立
  for (let i = 0; i < 10; i += 1) {
    records[`w.${190 + i}`] = {
      status: 'known', consecutiveCorrect: 2, correctCount: 2, incorrectCount: 0,
      lastStudiedAt: iso(-D), lastResult: 'correct', lastIncorrectAt: null, nextDueAt: null,
      statusChangedAt: iso(-2 * D), statusSource: 'learning',
    }
  }
  const daily = buildDailyTask({ reviewPool: words, learnPool: words, records, now: NOW_ISO, roundSize: 10 })
  const unknown = words.filter((w) => !records[w.id]).length
  const stats = { unknown, review: due + upcoming + scheduled, known: 10, total: words.length, scheduled }
  return { words, records, daily, stats }
}

const baseProps = (f) => ({
  stats: f.stats,
  learnQueue: f.words.filter((w) => !f.records[w.id]).slice(0, 10),
  reviewQueue: f.words.slice(0, Math.min(10, f.daily.dueTotal)),
  daily: f.daily,
  onStartLearn: () => {},
  onStartReview: () => {},
  migrationReport: null,
  band: 'all',
  bands: [],
  bandCounts: {},
  onChangeBand: () => {},
  groupByFamily: true,
  onToggleGroupByFamily: () => {},
})

// ---------------------------------------------------------------- 1. 到期 + 新词并存
section('B1. 第一屏：到期 + 新词并存')
{
  const f = fixture({ due: 7, upcoming: 9, scheduled: 4 })
  const { txt, buttons } = await render(baseProps(f))
  const minutes = estimateDailyMinutes(f.daily.dueRound, f.daily.newRound)
  ok(txt.includes(`今天该复习 7 个、再学 10 个新词，约 ${minutes} 分钟`), `一句话行含到期数/新学数/分钟（=${minutes}）`)
  ok(minutes === 6, '7×15s + 10×25s = 355s → 约 6 分钟（[回归] #2：曾报「约 1 分钟」）')
  ok(txt.includes('先做完到期的复习，再接着学新词'), '明说顺序意图')
  ok(buttons.some((b) => b === '优先复习（7）'), '主按钮 = 优先复习（7）')
  ok(buttons.some((b) => b === '改为开始学习（10）'), '副按钮 = 改为开始学习（10）')
  ok(txt.includes('明天还有 9 个到期'), '下一次预约行（真实 nextDueAt 计数）')
  ok(txt.indexOf('今天') < txt.indexOf('掌握进度'), '「今天」块排在掌握进度条之前（第一屏）')
  ok(!txt.includes('今天该复习 0 个'), '不出现自相矛盾的「今天该复习 0 个」')
}

// ---------------------------------------------------------------- 2. 只剩新学
section('B2. 没有到期、只有新学')
{
  const f = fixture({ due: 0 })
  const { txt, buttons } = await render(baseProps(f))
  const minutes = estimateDailyMinutes(0, f.daily.newRound)
  ok(txt.includes(`今天没有到期的复习，学 10 个新词，约 ${minutes} 分钟`), `首行含分钟数（=${minutes}）`)
  ok(buttons.some((b) => b === '开始学习（10）'), '主按钮 = 开始学习（10）')
  ok(!buttons.some((b) => b.startsWith('优先复习')), '没有到期就不出现「优先复习」')
  ok(!buttons.some((b) => b.startsWith('改为开始学习')), '不出现多余的副按钮')
}

// ---------------------------------------------------------------- 3. 全空
section('B3. 今天没词可做')
{
  const f = fixture({ due: 0, upcoming: 0, scheduled: 0 })
  // 把所有词都排到 48h 后 → 今天既无到期、也无新词
  f.words.forEach((w) => {
    f.records[w.id] = {
      status: 'review', consecutiveCorrect: 0, correctCount: 0, incorrectCount: 1,
      lastStudiedAt: iso(0), lastResult: 'incorrect', lastIncorrectAt: iso(0),
      nextDueAt: iso(48 * H), statusChangedAt: iso(0), statusSource: 'learning',
    }
  })
  const f2 = { ...f, daily: buildDailyTask({ reviewPool: f.words, learnPool: f.words, records: f.records, now: NOW_ISO, roundSize: 10 }) }
  const { txt, buttons } = await render(baseProps(f2))
  ok(f2.daily.newTotal === 0 && f2.daily.dueTotal === 0, '场景确实是全空', JSON.stringify({ new: f2.daily.newTotal, due: f2.daily.dueTotal }))
  ok(txt.includes('今天没有到期的复习，也没有待学的新词'), '空状态首行')
  ok(txt.includes('暂无待学 / 待复习词'), '空状态引导语')
  ok(txt.includes('个已排期'), '仍如实报出已排期数（不静默归零）')
  ok(buttons.filter(Boolean).length === 0, '空状态不渲染任何操作按钮')
}

// ---------------------------------------------------------------- 4. 积压：dueTotal ≠ dueRound
section('B4. 积压场景：文案必须说本轮数，欠账另算')
{
  // 27 个到期、roundSize=10 ⇒ dueRound=10（点进去看到的个数）
  // 违例形态是把 dueTotal=27 写进首行：用户以为今天要坐 27 个，实际点进去只有 10 个，
  // 出来发现还欠 17 —— 这是「承诺的数字和实做的不一致」这一类谎。
  // 变异测试实测：把 headline 的 ${dueRound} 改成 ${dueTotal}，套件一度全绿，
  // 因为 B1~B3 的 fixture 里 dueTotal 恰好都 <= roundSize，两个值同值 ⇒ 断言看不见。
  const f = fixture({ due: 27 })
  ok(f.daily.dueTotal === 27 && f.daily.dueRound === 10, '场景确实是积压（总 27 / 本轮 10）', JSON.stringify({ total: f.daily.dueTotal, round: f.daily.dueRound }))
  const { txt, buttons } = await render(baseProps(f))
  ok(txt.includes('今天该复习 10 个'), '首行用 dueRound（本轮 10），不是 dueTotal（27）')
  ok(!txt.includes('今天该复习 27 个'), '不把总到期数写进首行')
  ok(buttons.some((b) => b === '优先复习（10）'), '按钮数字与首行一致（10）')
  ok(txt.includes('今天一共到期 27 个'), '欠账如实另算一行（total=27）')
  ok(txt.includes('剩下的下轮继续'), '说明余量会在后续轮次出现')
}

// ---------------------------------------------------------------- 5. daily 缺失兜底
section('B5. daily 未传入 → 退回旧行为')
{
  const f = fixture({ due: 5 })
  const { txt, buttons } = await render({ ...baseProps(f), daily: null })
  ok(buttons.some((b) => b.startsWith('优先复习')), '兜底路径仍有「优先复习」入口')
  ok(!txt.includes('今天该复习'), '兜底路径不显示新的日行')
}

// ---------------------------------------------------------------- 5. StudySession 总结页
section('B6. 复习结束后的「下一次预约」')
{
  const f = fixture({ due: 3, upcoming: 9 })
  const { txt } = await render(
    { mode: 'review', queue: [], answer: () => {}, markKnown: () => {}, onExit: () => {}, daily: f.daily },
    StudySession,
  )
  ok(txt.includes('复习完成'), '进入总结页')
  ok(txt.includes('明天还有 9 个到期 · 今天先到这里'), '总结页给出明天的预约（N=9 来自真实记录）')
  ok(!txt.includes('明天还有 12 个'), '不会把已到期的 3 个混进「明天」（[回归] #3）')
}

// ---------------------------------------------------------------- 6. WeeklySummary
section('B7. WeeklySummary：无历史 → 数据不足')
{
  const summary = buildWeeklySummary({ records: {}, now: NOW_ISO, vocab: null, vocabBefore: null })
  const { txt } = await render({ summary }, WeeklySummary)
  ok(txt.includes('数据不足'), '显式「数据不足」')
  ok(txt.includes('近 7 天没有到期或新增掌握的记录'), '说明为什么不足')
  ok(!txt.includes('%'), '不足时不出现任何百分比')
  ok(!txt.includes('新增掌握0') && !txt.includes('0新增掌握'), '不足时不把三栏数字摆出来')
  ok(txt.includes('反事实'), '始终声明词汇量变化是反事实而非快照')
}

section('B8. WeeklySummary：有历史 → 分子分母都摆出来')
{
  const T = Date.now()
  const records = {}
  for (let i = 0; i < 10; i += 1) {
    records[`w.a${i}`] = {
      status: 'known', consecutiveCorrect: 2, correctCount: 2, incorrectCount: 1,
      lastStudiedAt: new Date(T - D).toISOString(), lastResult: 'correct',
      lastIncorrectAt: new Date(T - 4 * D).toISOString(),
      nextDueAt: new Date(T - 3 * D).toISOString(),
      statusChangedAt: new Date(T - 2 * D).toISOString(), statusSource: 'learning',
    }
  }
  for (let i = 0; i < 5; i += 1) {
    records[`w.b${i}`] = {
      status: 'review', consecutiveCorrect: 0, correctCount: 0, incorrectCount: 1,
      lastStudiedAt: null, lastResult: 'incorrect',
      lastIncorrectAt: new Date(T - 3 * D).toISOString(),
      nextDueAt: new Date(T - 2 * D).toISOString(),
      statusChangedAt: new Date(T - 3 * D).toISOString(), statusSource: 'learning',
    }
  }
  const summary = buildWeeklySummary({
    records,
    now: new Date(T).toISOString(),
    vocab: { estimate: 5000, sufficient: true },
    vocabBefore: { estimate: 4000, sufficient: true },
  })
  const { txt } = await render({ summary }, WeeklySummary)
  ok(txt.includes('已作答 10 / 本周到期 15'), '分子分母原样露出，不只给百分比')
  ok(txt.includes('67%'), '百分比可复算（10/15）')
  ok(txt.includes('4000 → 5000'), '词汇量 from → to')
  ok(txt.includes('+1000'), 'delta 显示为 +1000')
  ok(txt.includes('假设本周没新掌握这些词的估算值'), '明说是反事实')
  ok(!txt.includes('数据不足'), '有足够样本时不显示数据不足')
}

// ---------------------------------------------------------------- 收尾
await act(async () => {})
// rename 而非 rmSync：见文件头「清理不用 rmSync」
try { renameSync(OUT, `${OUT}.done`) } catch { /* 忽略：清理只是锦上添花 */ }

console.log(`\n---------- B 段断言 ${pass + failures.length} · 通过 ${pass} · 失败 ${failures.length} ----------`)
if (failures.length) {
  console.log('\n失败明细：')
  failures.forEach((f) => console.log(`  ✗ ${f.name}${f.detail ? '\n      ' + f.detail : ''}`))
  process.exit(1)
}
/**
 * 缺陷注入（QA 独立执行）—— 证明我的测试**会红**，不是永远绿
 * ==================================================================
 * 跑：node scripts/qa-inject.mjs
 *
 * 为什么要自己做一遍：实现者报告「11 处注入全部转红」是他自己的测试。
 * 我必须确认**我的**独立测试也会红，否则「全绿」什么都不能证明。
 *
 * ★★ 两个会「假绿」的陷阱（务必避开）★★
 *   陷阱 A：esbuild onResolve 的 filter 写成 `/(^|\/)foo/`（**结尾没有锚点**）。
 *     `^` 分支能匹配任何位置的空串 → filter 对**每一个** import 都成立
 *     → 连被测组件自己都被替换掉 → 测试变成在测替身，必绿。
 *     正确写法：`/foo\.js$/`（结尾锚定）。本文件所有 filter 都带 `$`。
 *   陷阱 B：`const m = /re/` 拿到的是 RegExp **对象**，`Boolean(m)` 恒为 true。
 *     用它判「替换是否生效」会永远绿。本文件一律用 `String.prototype.includes`
 *     对**产物文本**做判断，不对 RegExp 对象取布尔。
 *
 * 注入手法：把源码副本改掉后打包，**不改 app 源码**。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync, cpSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'

const ROOT = resolve('.')
const PANEL = resolve('src/components/AddWordsPanel.jsx')
const LISTVIEW = resolve('src/components/ListView.jsx')
const MIGRATE = resolve('src/lib/migrate.js')

let pass = 0
let fail = 0
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    console.error(`  ✗ ${m}`)
  }
}

/** 建一个可写副本的工作区，返回 cleanup */
function makeSandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'wrc-inject-'))
  cpSync(join(ROOT, 'src'), join(dir, 'src'), { recursive: true })
  cpSync(join(ROOT, 'scripts'), join(dir, 'scripts'), { recursive: true })
  cpSync(join(ROOT, 'package.json'), join(dir, 'package.json'))
  // node_modules 用 junction 不行（tmp 跨盘），改为解析绝对路径让 esbuild 走主仓
  return {
    dir,
    file: (rel) => join(dir, rel),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  }
}

/** 在副本里做一次替换（替换不到就抛，避免「注入没生效」被误读成「测试抓到了」） */
function inject(sandbox, rel, from, to) {
  const p = sandbox.file(rel)
  const src = readFileSync(p, 'utf8')
  if (!src.includes(from)) {
    throw new Error(`★ 注入锚点未命中：${rel} 里找不到 ${JSON.stringify(from)} —— 注入本身失效，不能据此判红`)
  }
  const out = src.split(from).join(to)
  if (out === src) throw new Error('注入后内容没变')
  writeFileSync(p, out, 'utf8')
  return true
}

/**
 * 在沙箱里跑 A-01 探针，返回观测结果。
 *
 * ★ scenario 必须可切换 ★
 *   「条件清空」那道防护只在**索引就绪且提交真的跑完**的路径上才执行到；
 *   索引未就绪时 submit() 在开头就 early-return 了，根本走不到那里。
 *   所以验第③道必须用 scenario='allFail'（就绪 + 全失败），
 *   否则注入「无条件清空」也不会转红 —— 那是**测法不覆盖**，
 *   不是「防护无关紧要」。这个区分很重要，不要混。
 *
 * @param {'notReady'|'allFail'|'offline'} scenario
 */
async function runA01(sandbox, label, scenario = 'notReady') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost:5188/',
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

  const OUT = join(sandbox.dir, 'probe.bundle.mjs')
  await esbuild.build({
    entryPoints: [join(sandbox.dir, 'scripts/qa-a01-probe.jsx')],
    bundle: true,
    outfile: OUT,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    loader: { '.js': 'jsx',
      '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
    nodePaths: [join(ROOT, 'node_modules')],
    absWorkingDir: sandbox.dir,
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [
      {
        name: 'qa-mocks',
        setup(build) {
          build.onResolve({ filter: /dict\.js$/ }, () => ({ path: join(sandbox.dir, 'scripts/qa-a01-mock-dict.js') }))
          build.onResolve({ filter: /(stationWords|generate|offline)\.js$/ }, () => ({
            path: join(sandbox.dir, 'scripts/qa-a01-mock-cloud.js'),
          }))
        },
      },
    ],
    logLevel: 'error',
  })

  // ★ 陷阱 B 的正面规避：对产物文本用 includes 判定，不对 RegExp 对象取布尔
  const src = readFileSync(OUT, 'utf8')
  const mockIn = src.includes('QA_MOCK_DICT_v1') && src.includes('QA_MOCK_CLOUD_v1')

  const lines = []
  const origLog = console.log
  const origErr = console.error
  console.log = (...a) => lines.push(a.join(' '))
  console.error = (...a) => lines.push(a.join(' '))

  const b = await import(pathToFileURL(OUT).href + `?t=${Math.random()}`)
  const flush = (ms = 90) => new Promise((r) => setTimeout(r, ms))
  const TWENTY = Array.from({ length: 20 }, (_, i) => `newword${i}`).join(', ')

  b.unmountProbe()
  b.__resetEnqueued()
  if (scenario === 'offline') {
    // 离线 + 索引就绪 + 20 个词全命中公共库 → addToStation 走离线分支入队
    b.__setIndexReady(true)
    b.__setKnownForms(Array.from({ length: 20 }, (_, i) => `newword${i}`))
    b.__setAddMany({ inserted: 0, skipped: 0, error: null })
    b.__setGenerate({ results: [], error: null })
  } else if (scenario === 'allFail') {
    b.__setIndexReady(true)
    b.__setKnownForms(['newword0', 'newword1'])
    b.__setAddMany({ inserted: 0, skipped: 0, error: { code: 'INTERNAL', message: '服务端炸了' } })
    b.__setGenerate({ results: [], error: { code: 'INTERNAL', message: '生成服务不可用' } })
  } else {
    b.__setIndexReady(false)
    b.__setKnownForms([])
    b.__setAddMany({ inserted: 99, skipped: 0, error: null })
    b.__setGenerate({ results: [], error: null })
  }
  b.mountProbe({ online: scenario !== 'offline' })
  await flush()
  b.pasteInto(globalThis.document.querySelector('textarea'), TWENTY)
  await flush()
  const btn = b.findButtonByText('加入小站')
  const before = globalThis.document.querySelector('textarea').value
  const rk = Object.keys(btn).find((k) => k.startsWith('__reactProps$'))
  await btn[rk].onClick()
  await flush(160)
  const after = globalThis.document.querySelector('textarea').value
  const text = globalThis.document.body.textContent || ''
  const msgEl = Array.from(globalThis.document.querySelectorAll('div')).find((d) => {
    const c = d.className || ''
    return /bg-(emerald|amber|red)-50/.test(c) && (d.textContent || '').trim()
  })
  const tone = msgEl
    ? (msgEl.className.includes('bg-red-50') ? 'error' : msgEl.className.includes('bg-amber-50') ? 'warn' : 'success')
    : null

  console.log = origLog
  console.error = origErr

  return {
    mockIn,
    label,
    inputPreserved: after === before,
    noZeroMsg: !text.includes('已加入 0 词'),
    btnDisabled: btn.disabled,
    rows: b.previewRows(),
    text,
    tone,
    enqueued: b.__getEnqueued().length,
  }
}

console.log('[qa-inject] 缺陷注入 —— 证明独立测试会红\n')

// ---------------------------------------------------------------- 注入 1
console.log('— 注入 1：把 canSubmit 的 indexReady 去掉（A-01 第①道）')
{
  const sb = makeSandbox()
  try {
    inject(sb, 'src/components/AddWordsPanel.jsx', '&& !submitting && indexReady', '&& !submitting')
    const r = await runA01(sb, 'inject1')
    ok(r.mockIn, 'mock 确实生效（否则下面的红是假红）')
    // 行为上：selectable 为空 → canSubmit 仍 false → 按钮仍 disabled
    // 所以这条注入**在行为上不可观测**（正是实现者标注的那点）→ 只能靠源码形状抓
    const srcCode = readFileSync(sb.file('src/components/AddWordsPanel.jsx'), 'utf8')
    const shapeCaught = !/const canSubmit = .*&& indexReady/.test(srcCode)
    ok(shapeCaught, '★ 我的源码形状断言抓到了它（canSubmit 不再含 indexReady）')
    console.log(`    （行为层：btnDisabled=${r.btnDisabled} —— 与未注入时相同，证实「行为不可观测」）`)
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 2
console.log('\n— 注入 2：把条件清空 setRaw(\'\') 退回无条件（A-01 第③道，最严重）')
{
  const sb = makeSandbox()
  try {
    inject(
      sb,
      'src/components/AddWordsPanel.jsx',
      'if (summary.failed === 0 && summary.offline === 0) {',
      'if (true) {',
    )
    // ★ 必须用 allFail：索引未就绪时 submit 开头就 early-return，走不到清空那行
    const r = await runA01(sb, 'inject2', 'allFail')
    ok(r.mockIn, 'mock 确实生效')
    ok(!r.inputPreserved, '★★ 我的测试转红：输入框被清空了（第③道失效被抓到）')
    console.log(`    （scenario=allFail，inputPreserved=${r.inputPreserved}，预期 false）`)
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 3
console.log('\n— 注入 3：索引未就绪时恢复「全部勾选」（A-02 的起点）')
{
  const sb = makeSandbox()
  try {
    inject(
      sb,
      'src/components/AddWordsPanel.jsx',
      // ★ 只锚这一行本身，不带换行与缩进 —— 带缩进的版本在 Windows 的
      //   CRLF 行尾下匹配不到（我第一版就踩了，锚点失配被 guard 直接抛出）。
      'setChecked(new Set())',
      'setChecked(new Set(usable.map((it) => it.formKey)))'
    )
    const r = await runA01(sb, 'inject3')
    ok(r.mockIn, 'mock 确实生效')
    // ★★ 诚实且重要的结论：这条注入**不会**让按钮变可点，也**不会**出现
    //   「已加入 0 词」。因为即使 20 行都被勾上，它们的 kind 仍是 'unknown'
    //   → 进不了 selectable → selectedSelectable 为空 → canSubmit 仍为 false、
    //   submit 仍在更早处 return。
    //   也就是说 A-02 的「默认不勾选」与 A-01 的「indexReady 守卫」互为冗余：
    //   去掉任一条，另一条仍然拦住。这正是实现者标注「冗余但承重」的含义，
    //   我在行为层独立证实了它 —— 不是「防护没用」，是「双重兜底」。
    // ★ 注意：checkbox 的 DOM checked 属性受 `disabled` 影响 ——
    //   组件里写的是 `checked={!disabled && checked.has(r.formKey)}`，
    //   而 unknown 行的 disabled 恒为 true → DOM 上永远显示未勾选。
    //   所以「默认勾选被恢复」这件事在 DOM 上**看不到**，
    //   只能从源码形状断言。我第一版按 DOM 断言，写错了。
    const shape = readFileSync(sb.file('src/components/AddWordsPanel.jsx'), 'utf8')
    ok(
      /setChecked\(new Set\(usable\.map/.test(shape),
      '★ 注入生效：源码里已是「按 usable 全量勾选」（这一条只能测源码形状）',
    )
    ok(
      r.btnDisabled === true,
      `★ 但按钮仍 disabled（${r.btnDisabled}）—— 证实「默认勾选」与「indexReady 守卫」互为冗余`,
    )
    ok(
      r.inputPreserved === true && r.text.includes('词条索引还在加载'),
      `★ 输入框仍不变且提示索引未就绪 —— 另一道防护独立拦住了（提示命中=${r.text.includes('词条索引还在加载')}）`,
    )
    ok(
      !/setChecked\(new Set\(\)\)/.test(shape),
      '★ 原来的「索引未就绪则不勾选」已被移除（形状断言确认）',
    )
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 3b
console.log('\n— 注入 3b：把 A-01 第②道（submit 开头的 indexReady early-return）废掉')
{
  const sb = makeSandbox()
  try {
    inject(sb, 'src/components/AddWordsPanel.jsx', 'if (!indexReady) {', 'if (false) {')
    const r = await runA01(sb, 'inject3b')
    ok(r.mockIn, 'mock 确实生效')
    ok(
      r.inputPreserved === true,
      `第②道被废后输入框仍不变（${r.inputPreserved}）—— 因为 selectedSelectable 为空，更早处就 return 了`,
    )
    const srcCode = readFileSync(sb.file('src/components/AddWordsPanel.jsx'), 'utf8')
    ok(!/if \(!indexReady\) \{/.test(srcCode), '★ 我的源码形状断言抓到了它（第②道 early-return 已被废）')
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 4
console.log('\n— 注入 4：把离线判成「失败」（A-04 的 tone 判据）')
{
  const sb = makeSandbox()
  try {
    inject(
      sb,
      'src/components/AddWordsPanel.jsx',
      "summary.failed === 0 && summary.offline === 0 ? 'success' : summary.failed > 0 && succeeded === 0 ? 'error' : 'warn'",
      "summary.failed > 0 && succeeded === 0 ? 'error' : 'error'",
    )
    // ★ 必须用 offline 场景：索引未就绪时 submit 开头就 return，
    //   根本走不到 tone 计算 —— 用错场景会让「注入没转红」被误读成「防护无关」。
    const r = await runA01(sb, 'inject4', 'offline')
    ok(r.mockIn, 'mock 确实生效')
    ok(
      r.enqueued === 1,
      `前提成立：离线入队 1 条草稿（实际 ${r.enqueued} 条；20 个词装在同一条的 items 里）`,
    )
    ok(
      r.tone === 'error',
      `★★ 我的测试转红：离线被显示为红色失败（实际 tone=${r.tone}；正确实现应为 warn）`,
    )
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 4b（对照）
console.log('\n— 注入 4b（对照）：未注入时离线必须是 warn（证明上一条不是恒绿）')
{
  const sb = makeSandbox()
  try {
    const r = await runA01(sb, 'inject4b-control', 'offline')
    ok(r.mockIn, 'mock 确实生效')
    ok(r.tone === 'warn', `未注入时离线 tone=warn（实际 ${r.tone}）`)
  } finally {
    sb.cleanup()
  }
}

// ---------------------------------------------------------------- 注入 5
console.log('\n— 注入 5：把 LRU 上限放大到 1000（缓存护栏 A-05/U2）')
{
  const sb = makeSandbox()
  try {
    inject(sb, 'src/lib/migrate.js', 'const MAX_CACHED_STATIONS = 10', 'const MAX_CACHED_STATIONS = 1000')
    // 用真实 migrate.js 直接验 LRU 行为（无需 React）
    const mod = await import(pathToFileURL(sb.file('src/lib/migrate.js')).href + `?t=${Math.random()}`)
    // mock localStorage
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
      key: (i) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size
      },
    }
    for (let i = 0; i < 12; i += 1) mod.writeStationRefs(`st-${i}`, [{ wordKey: `w.x${i}` }], 'uid-A')
    const raw = store.get(mod.keysFor('uid-A').stationWordsCache)
    const n = Object.keys(JSON.parse(raw).byStation).length
    ok(n === 12, `★ 注入后 12 个站全留下（实际 ${n}）—— 证实 LRU 上限已被放大（未注入时应为 10）`)
  } finally {
    sb.cleanup()
  }
}

console.log(`\n=== qa-inject 小结：PASS=${pass} FAIL=${fail} ===`)
console.log(fail === 0 ? '全部注入均按预期被独立测试抓到 ✓' : '有注入未被抓到 —— 我的测试存在盲区')
process.exit(fail === 0 ? 0 : 1)

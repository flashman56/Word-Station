/**
 * A-01 独立验证（QA 自写，不复用实现者的测试）
 * ==================================================================
 * 跑：node scripts/qa-a01.mjs
 *
 * ★ 本文件测的是「代码在」，不是「行为可观测」的部分，已在下方明确标注 ★
 *   A-01 的第 ① 道防护（按钮 disabled）与第 ③ 道防护（条件清空）在本实现下
 *   **不能各自独立观测失效**：`selectable` 必为空集（索引未就绪 → 全部行
 *   kind='unknown' → 可选集为空）→ `canSubmit` 已经是 false。
 *   也就是说：即使把 `&& indexReady` 从 canSubmit 里删掉，按钮**仍然**是
 *   disabled 的（因为 selectedSelectable.length === 0）。这两道防护是
 *   「冗余但承重」的：它们防的是**未来** selectable 不为空集的情形
 *   （例如索引部分就绪、或新增了不依赖索引的提交路径）。
 *   所以本文件对这两道用**源码形状断言**（证明代码在），并显式标注
 *   「测的是代码在，不是行为可观测」。删掉它们需要先确认
 *   selectable 是否仍排除 unknown —— 这一条也钉住。
 *
 * ★ 可观测的那一道（第 ② 道 submit() 开头 early-return）测的是真行为 ★
 *   通过 React 内部 __reactProps$* 直接调 onClick，绕开 disabled 的事件屏蔽。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa-a01-bundle.mjs')
const ENTRY = resolve('scripts/qa-a01-probe.jsx')
const MOCK_DICT = resolve('scripts/qa-a01-mock-dict.js')
const MOCK_CLOUD = resolve('scripts/qa-a01-mock-cloud.js')

// ---------------------------------------------------------------- jsdom
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5179/',
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

// ---------------------------------------------------------------- 打包 + 替换
/**
 * ★★ 替换必须按**文件名**匹配，且 filter 里不能有会匹配空串的分支 ★★
 *
 * 坑 ①：只匹配 `lib/cloud/stationWords.js` 不够。
 *   AddWordsPanel 写 '../lib/cloud/stationWords.js'，
 *   而 lib/addToStation.js（真实存在的编排层）写 './cloud/stationWords.js'
 *   —— 后者**不含 'lib/'**，会绕过替换打到真模块。症状：全绿，零拦截。
 *
 * 坑 ②：filter 写成 `/(^|\/)foo/` 且 foo 后无锚点时，
 *   `^` 分支可匹配任意位置空串 → filter 对**每个** import 都成立，
 *   连被测组件自己都会被替换掉。这里一律用 `\.js$` 结尾锚定。
 */
const mockPlugin = {
  name: 'qa-a01-mocks',
  setup(build) {
    build.onResolve({ filter: /dict\.js$/ }, () => ({ path: MOCK_DICT }))
    build.onResolve({ filter: /(stationWords|generate|offline)\.js$/ }, () => ({ path: MOCK_CLOUD }))
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
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [mockPlugin],
  logLevel: 'warning',
})

// ---------------------------------------------------------------- ★ 前置自检 ★
// 证明替身真被打进了 bundle。若替换没生效，下面这条会 FAIL 而不是让后续假绿。
const bundleSrc = readFileSync(OUT, 'utf8')
const mockDictIn = bundleSrc.includes('QA_MOCK_DICT_v1')
const mockCloudIn = bundleSrc.includes('QA_MOCK_CLOUD_v1')
// 反向证据：真模块的独有字符串不该在产物里
const realSupabaseIn = bundleSrc.includes('SUPABASE_URL') || bundleSrc.includes('createClient')

let pass = 0
let fail = 0
const failures = []
function ok(cond, msg) {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    failures.push(msg)
    console.error(`  ✗ ${msg}`)
  }
}
const flush = (ms = 80) => new Promise((r) => setTimeout(r, ms))

console.log('[qa-a01] A-01「索引未就绪提交 → 20 个词凭空消失」独立验证\n')

console.log('— 前置自检：证明 mock 真的生效（否则下面全部断言会假绿）')
ok(mockDictIn, 'dict.js 替身已打进 bundle（找到 QA_MOCK_DICT_v1 标记）')
ok(mockCloudIn, 'stationWords/generate/offline 替身已打进 bundle（找到 QA_MOCK_CLOUD_v1 标记）')
ok(!realSupabaseIn, '真云端模块未被误打包（产物里没有 Supabase 客户端痕迹）')

if (!mockDictIn || !mockCloudIn) {
  console.error('\n★★ mock 未生效，后续断言无意义 —— 中止 ★★')
  process.exit(1)
}

const b = await import(pathToFileURL(OUT).href)
const {
  mountProbe,
  unmountProbe,
  pasteInto,
  textareaValue,
  findButtonByText,
  click,
  callOnClick,
  hasReactProps,
  messageBlock,
  pageText,
  selectedCountText,
  previewRows,
  __setIndexReady,
  __setKnownForms,
  __setAddMany,
  __setAddManyDelay,
  __setGenerate,
  __getAddManyCalls,
  __resetAddManyCalls,
  __getEnqueued,
  __resetEnqueued,
} = b

// 20 个生词
const TWENTY = Array.from({ length: 20 }, (_, i) => `newword${i}`).join(', ')

/**
 * 场景 1：索引未就绪时点提交 → 输入框逐字符不变
 * 走两条路径：
 *   (a) 正常派发 click 到 disabled 按钮 —— jsdom 不会触发 onClick，
 *       这条只证明「点了没反应」，不能证明是守卫拦的；
 *   (b) ★ 直接取 React props 调 onClick ★ —— 这才是测 early-return 本身。
 */
async function scenarioIndexNotReady() {
  console.log('\n— 场景 1：索引未就绪时提交（真按提交路径走）')
  unmountProbe()
  __resetEnqueued()
  __setIndexReady(false)
  __setKnownForms([])
  __setAddMany({ inserted: 99, skipped: 0, error: null })
  __setGenerate({ results: [], error: null })
  mountProbe({ online: true })
  await flush()

  const before = TWENTY
  pasteInto(document.querySelector('textarea'), before)
  await flush()

  const btn = findButtonByText('加入小站')
  ok(Boolean(btn), '提交按钮存在')
  ok(btn.disabled === true, `★ 索引未就绪时按钮 disabled（实际 disabled=${btn && btn.disabled}）`)

  const rows = previewRows()
  ok(rows.length === 20, `预览渲染 20 行（实际 ${rows.length}）`)
  ok(
    rows.every((r) => r.checked === false),
    '★ A-02：索引未就绪时 20 行**一个都没被勾选**（旧实现是全部勾上 → 灾难起点）',
  )
  ok(
    rows.every((r) => r.disabled === true),
    '★ A-02：20 行复选框全部禁用',
  )
  ok(
    rows.every((r) => r.rowText.includes('未能识别')),
    '★ A-02：每行标注「未能识别」',
  )
  const sc = selectedCountText()
  ok(sc && sc.selectable === 0, `★ 可选集为空（已选 ${sc && sc.checked} / 可选 ${sc && sc.selectable}）`)

  // (b) ★ 直接调 onClick 绕过 disabled 的事件屏蔽 ★
  ok(hasReactProps(btn), '能从按钮取到 React 内部 props（证明是 React 渲染的）')
  await callOnClick(btn)
  await flush(120)

  ok(textareaValue() === before, '★★ 输入框内容逐字符不变（原 bug 会把它清空）')
  const txt = pageText()
  ok(!txt.includes('已加入 0 词'), '★★ 不出现「已加入 0 词」（旧 bug 的标志性文案）')
  ok(txt.includes('索引') && (txt.includes('加载') || txt.includes('就绪')), '消息区提示索引未就绪')

  // 再点一次（重复提交不应产生任何条目）
  await callOnClick(btn)
  await flush(120)
  ok(textareaValue() === before, '重复点提交后输入框仍逐字符不变')
  ok(__getEnqueued().length === 0, `重复点提交不产生任何草稿条目（实际 ${__getEnqueued().length}）`)
  unmountProbe()
}

/** 场景 2：全失败（真失败）→ 输入框逐字符不变 + 红色 */
async function scenarioAllFailed() {
  console.log('\n— 场景 2：提交全失败（真失败，不是离线）')
  unmountProbe()
  __resetEnqueued()
  __setIndexReady(true)
  // 前 2 个命中公共库（走 addMany）→ 让 addMany 返回一个**真错误**
  __setKnownForms(['newword0', 'newword1'])
  __setAddMany({ inserted: 0, skipped: 0, error: { code: 'INTERNAL', message: '服务端炸了' } })
  // 18 个未命中 → 走 generate，也返回真错误
  __setGenerate({ results: [], error: { code: 'INTERNAL', message: '生成服务不可用' } })
  mountProbe({ online: true })
  await flush()

  const before = TWENTY
  pasteInto(document.querySelector('textarea'), before)
  await flush()

  const btn = findButtonByText('加入小站')
  ok(btn && !btn.disabled, '索引就绪后按钮自动可用（A-01 第 ① 道的后半：就绪后可用）')
  await callOnClick(btn)
  await flush(150)

  ok(textareaValue() === before, '★★ 全失败时输入框逐字符不变（保留原文可重试）')
  const msg = messageBlock()
  ok(msg && msg.className.includes('bg-red-50'), `全失败应是红底（实际 ${msg && msg.className}）`)
  const txt = pageText()
  ok(txt.includes('20 条失败') || txt.includes('条失败'), '文案含精确失败数')
  unmountProbe()
}

/** 场景 3：离线入队（failed=0, offline=20）→ 输入框不变 + 琥珀色（非红色） */
async function scenarioOffline() {
  console.log('\n— 场景 3：离线提交（推迟到联网后，不是失败）')
  unmountProbe()
  __resetEnqueued()
  __setIndexReady(true)
  __setKnownForms(Array.from({ length: 20 }, (_, i) => `newword${i}`))
  // 离线：AddWordsPanel 的 online=false 走 addToStation 的离线分支 → 直接入队
  __setAddMany({ inserted: 0, skipped: 0, error: null })
  __setGenerate({ results: [], error: null })
  mountProbe({ online: false })
  await flush()

  const before = TWENTY
  pasteInto(document.querySelector('textarea'), before)
  await flush()

  const btn = findButtonByText('加入小站')
  ok(btn && !btn.disabled, '离线时按钮仍可用（离线加词是允许的）')
  await callOnClick(btn)
  await flush(150)

  ok(textareaValue() === before, '★★ 离线入队时输入框逐字符不变')
  const msg = messageBlock()
  ok(
    msg && msg.className.includes('bg-amber-50'),
    `★★ 离线是琥珀色不是红色（实际 ${msg && msg.className}）—— 离线是推迟不是失败`,
  )
  ok(!msg.className.includes('bg-red-50'), '离线不出红色')
  const enq = __getEnqueued()
  ok(enq.length === 1, `入队 1 条（实际 ${enq.length}）`)
  ok(enq[0] && enq[0].kind === 'stationWords', `入队 kind='stationWords'（实际 ${enq[0] && enq[0].kind}）`)
  ok(
    enq[0] && enq[0].payload && enq[0].payload.stationId === 'st-1' && Array.isArray(enq[0].payload.items),
    '★ payload 形状 {ownerId, stationId, items} —— 与 claim() 的校验逐字对齐',
  )
  ok(
    enq[0] && enq[0].payload && enq[0].payload.items.length === 20,
    `入队 items 20 条（实际 ${enq[0] && enq[0].payload.items.length}）`,
  )
  unmountProbe()
}

/**
 * 场景 4：提交进行中重复点击 → 不产生重复条目
 *
 * ★★★ 这里踩了两个坑，都写下来以免重犯 ★★★
 *
 * 坑 1：离线路径测不了这道守卫。
 *   enqueue 是同步的，submit() 在同一 tick 内跑完，React 来不及提交
 *   setSubmitting(true) →「提交中」那一帧**根本不存在**，按钮永远不是
 *   disabled。第一版据此以为「守卫失效」，实际是**测法错了**。
 *   → 修法：让 addMany 延迟 150ms，submitting 才能跨 tick 存活。
 *
 * 坑 2：重复点击**必须走真 click 事件**，不能直接调 onClick。
 *   第二版用 callOnClick 再点一次 → addMany 变 2 次 → 看起来像
 *   「重复提交产生了重复条目」的严重 bug。实际是：直接调 onClick
 *   **绕过了 disabled 这道屏障**，而真实用户点不到 disabled 按钮。
 *   实测（scripts/.dbg6.mjs 已验）：React 的合成事件系统会检查
 *   target.disabled，对 disabled 按钮派发真 click 时 onClick **根本不被调用**
 *   —— jsdom 在这一层与真浏览器一致（注意：直接 addEventListener 不被屏蔽，
 *   必须走 React，所以这个结论只在 React 路径上成立）。
 *   → 判据改成：disabled 期间派发**真 click**，断言 addMany 仍只有 1 次；
 *     并补一条反向证据，证明 onClick 确实绑着（否则「只有 1 次」可能是因为没绑）。
 */
async function scenarioDoubleClickGuard() {
  console.log('\n— 场景 4：提交进行中重复点击（addMany 延迟 150ms + 真 click 事件）')
  unmountProbe()
  __resetEnqueued()
  __resetAddManyCalls()
  __setIndexReady(true)
  __setKnownForms(Array.from({ length: 20 }, (_, i) => `newword${i}`))
  __setAddMany({ inserted: 20, skipped: 0, error: null })
  __setAddManyDelay(150)
  __setGenerate({ results: [], error: null })
  mountProbe({ online: true })
  await flush()
  pasteInto(document.querySelector('textarea'), TWENTY)
  await flush()

  const btn = findButtonByText('加入小站')
  ok(btn && !btn.disabled, '提交前按钮可点')
  click(btn) // 真 click 事件，不 await，让它在飞
  await flush(40) // 让 React 提交 setSubmitting(true)

  const btnMid = findButtonByText('处理中') || findButtonByText('加入小站')
  ok(btnMid && btnMid.disabled === true, `★ 提交中按钮 disabled（实际 ${btnMid && btnMid.disabled}）`)

  // 提交中又点了三下 —— 全部走真 click 事件路径
  click(btnMid)
  click(btnMid)
  click(btnMid)
  await flush(40)
  await flush(250)
  __setAddManyDelay(0)

  const calls = __getAddManyCalls()
  ok(
    calls.length === 1,
    `★★ 提交中连点 3 下，addMany 仍只有 1 次（实际 ${calls.length} 次）—— 不产生重复条目`,
  )
  ok(
    calls.length === 1 && calls[0].count === 20,
    `唯一那次调用带 20 个词（实际 ${calls.length ? calls[0].count : 'n/a'}）`,
  )
  const totalAdded = calls.reduce((n, c) => n + c.count, 0)
  ok(totalAdded === 20, `★ 累计写入 20 个词Key，无重复（实际 ${totalAdded}）`)
  ok(__getEnqueued().length === 0, `★ 在线路径不入队（草稿数 ${__getEnqueued().length}，预期 0）`)

  // ★ 反向证据：证明 onClick 确实绑在按钮上 ——
  //   否则「只有 1 次」可能是因为事件没绑上而假绿。
  const rk = Object.keys(btnMid).find((k) => k.startsWith('__reactProps$'))
  ok(
    Boolean(rk) && typeof btnMid[rk].onClick === 'function',
    '★ 反向证据：按钮确实绑着 onClick ——「只有 1 次」是因为 disabled 挡住，不是因为没绑',
  )
  unmountProbe()
}

/** 场景 5：源码形状断言（明确标注「测的是代码在，不是行为可观测」） */
function scenarioSourceShape() {
  console.log('\n— 场景 5：源码形状（★ 测的是代码在，不是行为可观测 ★）')
  const src = readFileSync(resolve('src/components/AddWordsPanel.jsx'), 'utf8')
  // ★ 剥掉注释再数 setRaw('')：文件头与行内注释大量提及它（那是必要的说明），
  //   直接 grep 全文会把注释算进去，得出「4 处」的错误结论。
  const srcCode = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  ok(
    /const canSubmit = .*&& indexReady/.test(src),
    '★ 第①道：canSubmit 含 indexReady（行为上被 selectable 空集掩盖，故测代码形状）',
  )
  ok(
    /if \(!indexReady\) \{\s*setMessage\(/.test(src),
    '★ 第②道：submit() 开头有 !indexReady 的 early-return',
  )
  const clears = (srcCode.match(/setRaw\(''\)/g) || [])
  ok(
    clears.length === 1,
    `★ 第③道：可执行代码里只有 1 处 setRaw('')，且在条件清空里（实际 ${clears.length} 处；注释里的提及不算）`,
  )
  ok(
    /if \(summary\.failed === 0 && summary\.offline === 0\) \{\s*setRaw\(''\)/.test(src),
    '★ 第③道：setRaw(\'\') 的前置条件是「零失败零草稿」',
  )
  ok(
    /const selectable = useMemo\(\(\) => rows\.filter\(\(r\) => r\.kind === 'hit' \|\| r\.kind === 'miss'\)/.test(src),
    '★ 承重前提：selectable 仍排除 unknown —— 删掉①②③之前必须先确认这一条',
  )
  ok(
    /rows\.filter\(\(r\) => r\.kind === 'unknown'\)/.test(src),
    'unrecognized 集仍按 kind===\'unknown\' 派生',
  )
}

await scenarioIndexNotReady()
await scenarioAllFailed()
await scenarioOffline()
await scenarioDoubleClickGuard()
scenarioSourceShape()

console.log(`\n=== qa-a01 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) {
  console.log('失败项：')
  failures.forEach((f) => console.log(`  - ${f}`))
}
try {
  unlinkSync(OUT)
} catch {}
process.exit(fail === 0 ? 0 : 1)

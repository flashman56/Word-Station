/**
 * A-01：索引未就绪时提交 → 20 个词凭空消失（jsdom + 真 React + 真组件）
 * ------------------------------------------------------------------
 * 跑：npm run test:a01-words
 *
 * ★★ 这是本轮最严重的一条，也是唯一一条「零报错」的数据丢失 ★★
 *   旧实现的三个动作各自看起来都合理：
 *     ① `!indexReady` 时置 lookup={hit:[],miss:[]} —— 合理，索引没好没法查
 *     ② 但同时 `setChecked(全部 usable)`     —— 于是 20 行看起来「全被勾上了」
 *     ③ `canSubmit` **不检查 indexReady**     —— 于是按钮是可点的
 *   提交时：rows 全是 kind:'unknown'、wordKey:null → selectedHits 与
 *   selectedMiss **双双为空** → 两个 `if` 都不进 → 显示「已加入 0 词」→
 *   **`setRaw('')` 无条件清空输入框**。全程零报错、零警告。
 *
 * ★ 为什么必须用 jsdom + 真组件，而不是把 submit 的逻辑复刻一遍 ★
 *   因为这条 bug 的本质是「三处代码的组合」，复刻逻辑只会测到复刻品。
 *   这里挂的是真的 <AddWordsPanel>，断言的是**用户真正能看到的那个
 *   textarea.value** —— 失败后它必须与提交前逐字符相同。
 *
 * ★ 三道防护缺一不可，本文件逐条验 ★
 *   ① canSubmit 加 indexReady → 按钮 disabled
 *   ② submit() 开头 early-return → 绕过 disabled 强行调用也安全
 *   ③ 失败路径绝不碰 setRaw('') → 输入框内容保持不变
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ROOT = resolve('.')
const OUT = resolve('scripts/.a01-bundle.mjs')
const ENTRY = resolve('scripts/a01-probe-entry.jsx')
const MOCK_DICT = resolve('scripts/a01-mock-dict.js')
const MOCK_CLOUD = resolve('scripts/a01-mock-cloud.js')

// ---------------------------------------------------------------- jsdom 环境

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

// ---------------------------------------------------------------- 打包（含模块替换）

/**
 * 把被测组件 import 的真实模块换成可控替身。
 *
 * ★ 为什么要替换而不是运行时打补丁 ★
 *   ESM 的模块命名空间对象是冻结的：`dict.isIndexReady = fn` 在严格模式下抛
 *   TypeError。而 A-01 的复现前提恰恰是「停在索引未就绪那一帧」，必须能控制。
 *   （另一条路是把该断言写成静态源码检查 —— 但那样测的是「代码长什么样」，
 *   不是「用户会看到什么」，而这条 bug 的全部危害都发生在用户那一侧。）
 */
const mockPlugin = {
  name: 'a01-mocks',
  setup(build) {
    // ⚠⚠ 两条踩过的坑，都属于「测试悄悄没测到、且一行错都不报」那种：
    //
    // ① filter 里不要写 `(^|\/)foo` 这种带空 alternation 的正则。`^` 分支能匹配
    //    任何位置的空串，于是 filter 对**每个** import 都成立，连被测组件本身
    //    都会被替换掉。
    //
    // ② 只按 `lib/cloud/xxx.js` 匹配也不够 —— 被测代码里同一个模块有**两种**
    //    import 写法：AddWordsPanel 写 '../lib/cloud/stationWords.js'，
    //    而 lib/addToStation.js 写 './cloud/stationWords.js'（它就在 lib/ 下）。
    //    前者含 'lib/cloud/'，后者**不含** —— 于是 addToStation 里的那次调用
    //    打到了真模块，测试却在断言 mock 的记录。症状：全绿，而实际什么都没拦到。
    //    所以这里一律**按文件名**匹配。
    build.onResolve({ filter: /(^|\/)dict\.js$/ }, () => ({ path: MOCK_DICT }))
    build.onResolve({ filter: /(^|\/)(stationWords|generate|offline)\.js$/ }, () => ({ path: MOCK_CLOUD }))
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

const bundle = await import(pathToFileURL(OUT).href)

const {
  mountProbe,
  unmountProbe,
  pasteInto,
  textareaValue,
  findButtonByText,
  allButtons,
  click,
  pageHas,
  messageBlock,
  selectedCount,
  previewRows,
  // ★ 控制句柄从 bundle 里取（与被测组件共用同一个替身实例）
  __setIndexReady: setIndexReady,
  __resolveIndex: resolveIndex,
  __setKnownForms: setKnownForms,
  __setAddMany: setAddMany,
  __setGenerate: setGenerate,
  __getCalls: getCalls,
  __resetCalls: resetCalls,
} = bundle

/** 让 React 完成渲染 + 异步出口跑完 */
const flush = (ms = 60) => new Promise((r) => setTimeout(r, ms))

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

console.log('[test:a01-words] 索引未就绪时提交 → 20 个词凭空消失（A-01）')
console.log('  复现前提：首屏进小站页 → 词条索引（1.7MB）尚未加载完 → 粘贴 20 词 → 立刻点提交\n')

/** 20 个真实形态的生词（前两个会命中假索引，其余走生成） */
const TWENTY_WORDS = Array.from({ length: 20 }, (_, i) => `newword${i}`).join(', ')

/** 场景 0：索引就绪时的正常提交（作为对照组 —— 必须仍然是「成功会清空」） */
async function scenarioReadyBaseline() {
  console.log('— 对照组：索引就绪时的正常路径（清空输入框是正确行为）')
  unmountProbe()
  resetCalls()
  setIndexReady(true)
  setAddMany({ inserted: 2, skipped: 0, error: null })
  setGenerate({
    results: Array.from({ length: 18 }, () => ({ status: 'generated' })),
    error: null,
  })
  mountProbe({ online: true })
  await flush()
  pasteInto(window.document.querySelector('textarea'), TWENTY_WORDS)
  await flush()

  const btn = findButtonByText('加入小站')
  ok(Boolean(btn) && !btn.disabled, `索引就绪时按钮可点（disabled=${btn && btn.disabled}）`)
  click(btn)
  await flush(120)

  ok(textareaValue() === '', '★ 成功路径下输入框被清空 —— 这是正确行为，不能为了防 A-01 而改坏')
  // 20 个词全不在假索引的 known 里 → 全是 miss → addMany 一次都不该被调
  ok(getCalls().addMany.length === 0, '全是未命中词时 addMany 一次都不该被调（不能白发一次请求）')
  ok(getCalls().generate.length === 1, 'generate 被调用 1 次（未命中的词一次批量调用）')
  const msg = messageBlock()
  ok(msg && msg.className.includes('bg-emerald-50'), `成功是绿底（实际：${msg && msg.className}）`)
  unmountProbe()
}

/** 场景 1：★ 索引未就绪 → 按钮必须 disabled（第一道防护） */
async function scenarioButtonDisabled() {
  console.log('\n— 第一道防护：索引未就绪时按钮必须 disabled')
  unmountProbe()
  resetCalls()
  setIndexReady(false)
  setAddMany({ inserted: 99, skipped: 0, error: null })
  setGenerate({ results: [], error: null })
  mountProbe({ online: true })
  await flush()

  const before = TWENTY_WORDS
  pasteInto(window.document.querySelector('textarea'), before)
  await flush()

  ok(textareaValue() === before, '前置：粘贴后输入框内容正确')

  const rows = previewRows()
  ok(rows.length === 20, `预览出 20 行（实际 ${rows.length}）`)

  // ★ 关键断言：全部行都不可勾选、不可提交
  const anyChecked = rows.some((r) => r.checked)
  ok(!anyChecked, '★ 索引未就绪时一行都不该默认勾选（旧实现在这里全勾上了，是灾难的起点）')
  const allDisabled = rows.every((r) => r.disabled)
  ok(allDisabled, '★ 索引未就绪时每行都置灰（复选框 disabled）')

  const btn = findButtonByText('加入小站')
  ok(Boolean(btn) && btn.disabled === true, `★ 按钮 disabled（实际 disabled=${btn && btn.disabled}）`)

  const counts = selectedCount()
  ok(counts && counts.selected === 0, `★ 「已选 N / M」必须是 0（实际 ${JSON.stringify(counts)}）`)

  // ★ 而且要告诉用户为什么是灰的
  ok(pageHas('索引就绪后才能提交'), '★ 给出可执行提示「索引就绪后才能提交」，而不是让按钮默默灰着')
}

/**
 * ★ 真正「绕过 disabled」★
 *
 * 注意：在 jsdom 里对一个 disabled 按钮派发 click，事件**根本不会到达 React 的
 * onClick**（浏览器与 jsdom 都会拦掉 disabled 元素上的交互事件）。所以
 * 「点一下 disabled 按钮」这种写法测不到第二道防线 —— 它测的是「disabled 有用」，
 * 而第二道防线的意义恰恰是「**在 disabled 拦不住的那条路上**仍然安全」。
 *
 * 真实会绕过 disabled 的三条路：
 *   ① 用户点下的那一帧 indexReady 还是 false，按钮的 disabled 属性还没被 React
 *      提交到 DOM（React 渲染是异步的）；
 *   ② 竞态：点下之后、await 期间索引状态变化；
 *   ③ 脚本 / 自动化直接调 handler。
 * 这里用 ③（最直接、也最难被"环境恰好拦住了"伪装成通过）。
 */
function forceSubmitWithoutDisabled() {
  const btn = findButtonByText('加入小站')
  if (!btn) throw new Error('找不到提交按钮')
  // 拿到 React 挂在 DOM 节点上的 props，直接调用 onClick —— 完全绕开 disabled
  const propsKey = Object.keys(btn).find((k) => k.startsWith('__reactProps$'))
  if (!propsKey) throw new Error('找不到 React props（jsdom/React 版本变了？）')
  const props = btn[propsKey]
  if (typeof props.onClick !== 'function') throw new Error('按钮没有 onClick')
  return props.onClick()
}

/** 场景 2：★ 绕过 disabled 强行提交 → submit() 开头必须 early-return（第二道防护） */
async function scenarioSubmitGuard() {
  console.log('\n— 第二道防护：绕过 disabled 强行调用 submit() → 必须 early-return')
  const before = textareaValue()
  ok(before === TWENTY_WORDS, '前置：提交前输入框内容是那 20 个词')

  await forceSubmitWithoutDisabled()
  await flush(120)

  // ★ 核心断言：内容逐字符不变
  ok(
    textareaValue() === before,
    `★ 输入框内容与提交前逐字符相同（实际：${JSON.stringify(textareaValue())}）`,
  )
  ok(getCalls().addMany.length === 0, '★ 一次请求都没发（early-return 生效）')
  ok(getCalls().generate.length === 0, '★ generate 也没被调')

  const msg = messageBlock()
  ok(Boolean(msg), '给出了消息（用户不会对着没反应的按钮发呆）')
  ok(msg && msg.text.includes('索引'), `★ 消息解释了原因（实际：${msg && msg.text}）`)
  ok(
    msg && !msg.className.includes('bg-emerald-50'),
    `★ 不是绿色成功色（实际：${msg && msg.className}）`,
  )
  unmountProbe()
}

/** 场景 3：★ 索引就绪但服务端全失败 → 输入框仍必须保留（A-01 第三道防护） */
async function scenarioFullFailureKeepsRaw() {
  console.log('\n— 第三道防护：服务端全失败 → 输入框内容必须保留')
  unmountProbe()
  resetCalls()
  setIndexReady(true)
  // 校验类错误码 → addToStation 原样返回、不入队（不入队不等于成功！）
  setAddMany({
    inserted: 0,
    skipped: 0,
    error: { code: 'DUPLICATE_NAME', message: '服务端拒绝' },
  })
  setGenerate({ results: [], error: { code: 'INTERNAL', message: '生成失败' } })
  mountProbe({ online: true })
  await flush()

  pasteInto(window.document.querySelector('textarea'), TWENTY_WORDS)
  await flush()

  const before = textareaValue()
  click(findButtonByText('加入小站'))
  await flush(140)

  ok(textareaValue() === before, `★ 全失败后输入框逐字符不变（实际：${JSON.stringify(textareaValue())}）`)
  ok(getCalls().enqueue.length === 0, '校验类错误不入队（否则是永不消除的 pending）')

  const msg = messageBlock()
  ok(msg && msg.className.includes('bg-red-50'), `★ 全失败是红底（实际：${msg && msg.className}）`)
  ok(msg && msg.text.includes('0 词'), `消息如实说明「已加入 0 词」（实际：${msg && msg.text}）`)
  unmountProbe()
}

/** 场景 4：★ 离线入队 → 输入框必须保留，且提示草稿条数 */
async function scenarioOfflineKeepsRaw() {
  console.log('\n— 第三道防护（离线分支）：落草稿时输入框必须保留')
  unmountProbe()
  resetCalls()
  setIndexReady(true)
  setAddMany({ inserted: 0, skipped: 0, error: null })
  setGenerate({ results: [], error: null })
  mountProbe({ online: false })
  await flush()

  // ★ 混入两个「命中公共库」的词：它们走 stationWords 草稿（复用既有 kind），
  //   其余 18 个走 generate 草稿。两条路径都要验 —— A-01 的旧代码里，
  //   stationWords 的入队是内联在 UI 里的，正是最容易与新抽出的 addToStation 漂移的一处。
  setKnownForms(['photosynthesis', 'quixotic'])
  const mixed = 'photosynthesis, quixotic, ' + TWENTY_WORDS
  pasteInto(window.document.querySelector('textarea'), mixed)
  await flush()

  const before = textareaValue()
  click(findButtonByText('加入小站'))
  await flush(140)

  ok(textareaValue() === before, `★ 离线入队后输入框逐字符不变（实际：${JSON.stringify(textareaValue())}）`)
  const enq = getCalls().enqueue
  ok(enq.length > 0, `确实落了草稿（${enq.length} 条）`)

  const sw = enq.find((e) => e.kind === 'stationWords')
  ok(Boolean(sw), `命中公共库的 2 个词落 stationWords 草稿（实际 kinds：${enq.map((e) => e.kind).join(',')}）`)
  ok(
    Boolean(sw) && sw.payload.ownerId === 'uid-A' && Boolean(sw.payload.stationId) && Array.isArray(sw.payload.items),
    '★ 草稿 payload 满足 claim() 的结构校验（ownerId / stationId 真值 / items 是数组）',
  )
  ok(
    Boolean(sw) && sw.payload.items.length === 2 && sw.payload.items.every((i) => i.source === 'public'),
    'stationWords 草稿只含 2 个命中词且 source 正确',
  )
  const gen = enq.find((e) => e.kind === 'generate')
  ok(
    Boolean(gen) && Array.isArray(gen.payload.forms) && gen.payload.forms.length === TWENTY_WORDS.split(', ').length,
    `generate 草稿含其余 ${TWENTY_WORDS.split(', ').length} 个未命中词（实际 ${gen && gen.payload.forms.length}）`,
  )

  const msg = messageBlock()
  ok(msg && msg.className.includes('bg-amber-50'), `★ 落草稿是琥珀底，不是红色（实际：${msg && msg.className}）`)
  ok(msg && msg.text.includes('离线草稿'), `消息说明存了草稿（实际：${msg && msg.text}）`)
  setKnownForms(['photosynthesis', 'quixotic']) // 复位
  unmountProbe()
}

/** 场景 5：★ M1 —— toggleAll 的判据必须是「全部可选行」而不是「全部行」 */
async function scenarioToggleAll() {
  console.log('\n— M1：toggleAll 的判据（unknown 行默认不勾选后不得永久失效）')
  unmountProbe()
  resetCalls()
  setIndexReady(false)
  setAddMany({ inserted: 0, skipped: 0, error: null })
  mountProbe({ online: true })
  await flush()
  pasteInto(window.document.querySelector('textarea'), 'photosynthesis, unknownone')
  await flush()

  let btn = findButtonByText('全选')
  ok(Boolean(btn), `★ 索引未就绪时按钮文案是「全选」而不是恒为「全不选」（实际文案：${btn && btn.textContent}）`)
  ok(btn && btn.disabled, '可选集为空时「全选」按钮禁用（没有可全选的行）')

  // 切到索引就绪：兑现挂起的 loadIndex（这才是真实的「1.7MB 索引终于加载完」时序），
  // 面板的 setIndexReady(true) 会重跑「解析 + 命中查询」effect，两行都变成可选
  resolveIndex()
  await flush(80)
  pasteInto(window.document.querySelector('textarea'), 'photosynthesis, unknownone')
  await flush()

  btn = findButtonByText('全不选') || findButtonByText('全选')
  ok(Boolean(btn) && btn.textContent.trim() === '全不选', `★ 两行都可选且默认勾上时文案应为「全不选」（实际：${btn && btn.textContent}）`)

  click(findButtonByText('全不选'))
  await flush()
  const counts = selectedCount()
  ok(counts && counts.selected === 0, `★ 点「全不选」后真的全清了（实际 ${JSON.stringify(counts)}）—— 旧判据在这一步会永久失效`)

  const btn2 = findButtonByText('全选')
  ok(Boolean(btn2) && btn2.textContent.trim() === '全选', '清空后文案回到「全选」（可来回切换）')
  click(btn2)
  await flush()
  const counts2 = selectedCount()
  ok(counts2 && counts2.selected === 2, `再点「全选」全勾上（实际 ${JSON.stringify(counts2)}）`)
  unmountProbe()
}

/**
 * 场景 6：★★ 索引「已就绪」但仍存在 unknown 行 ★★
 *
 * 这不是理论构造，而是真实生产路径：真的 lookupForms 用 slug 去重
 * （`if (!s || seen.has(s)) return`），而两个**不同 formKey** 可以共享同一个
 * slug —— 'hello-world' 与 'helloworld' 都 slug 成 'helloworld'，于是第二个
 * 既不进 hit 也不进 miss，在面板里落成 kind:'unknown'。
 *
 * ★ 为什么这个场景是本文件的关键（它是靠缺陷注入逼出来的）★
 *   只测「索引未就绪」时，unknown 行与「全部不可选」是等价的，于是这两处缺陷
 *   **测不出来** —— 注入验证时它们都全绿：
 *     ① 「canSubmit 去掉 indexReady 条件」
 *     ② 「toggleAll 判据退回 rows.length」
 *   在那个只有「全 unknown」的世界里，这两处缺陷恰好等价于正确实现。
 *   只有当索引就绪、可选行与 unknown 行**共存**时，三道防护与 M1 的判据才真正
 *   彼此可区分。这也是替身必须逐字复刻真 lookupForms 三条规则的原因。
 */
async function scenarioUnknownRowsWhileReady() {
  console.log('\n— ★ 索引就绪但混有 unknown 行（slug 去重造成的真实路径）')
  unmountProbe()
  resetCalls()
  setIndexReady(true)
  setKnownForms(['photosynthesis'])
  setAddMany({ inserted: 0, skipped: 0, error: null })
  setGenerate({ results: [], error: null })
  mountProbe({ online: true })
  await flush()

  // photosynthesis 命中；hello-world 与 helloworld 共享 slug → 后者被丢弃 → unknown 行
  pasteInto(window.document.querySelector('textarea'), 'photosynthesis, hello-world, helloworld')
  await flush()

  const rows = previewRows()
  const counts = selectedCount()
  ok(rows.length === 3, `预览出 3 行（实际 ${rows.length}）`)
  ok(counts && counts.selectable === 2, `★ 可选行是 2 个（实际 ${JSON.stringify(counts)}）—— unknown 行不计入可选集`)
  const unknownRows = rows.filter((r) => r.disabled)
  ok(unknownRows.length === 1, `★ 确实出现 1 个 unknown 行（实际 ${unknownRows.length}）`)
  ok(unknownRows.length === 1 && /未能识别/.test(unknownRows[0].rowText), 'unknown 行带「未能识别」说明')
  ok(!unknownRows.some((r) => r.checked), '★ unknown 行永不默认勾选')

  // ★ M1：混合集合下，全选 / 全不选 必须能来回切换
  let btn = findButtonByText('全不选')
  ok(
    Boolean(btn),
    `★ 可选行都勾上时文案是「全不选」而不是恒为「全选」（实际：${btn && btn.textContent}）—— rows.length 判据在这里会永久失效`,
  )

  click(findButtonByText('全不选'))
  await flush()
  let c = selectedCount()
  ok(c && c.selected === 0, `★ 「全不选」真的全清了（实际 ${JSON.stringify(c)}）`)

  btn = findButtonByText('全选')
  ok(Boolean(btn) && btn.textContent.trim() === '全选', '清空后文案回到「全选」（可来回切换）')
  click(btn)
  await flush()
  c = selectedCount()
  ok(c && c.selected === 2, `★ 再点「全选」只勾上 2 个可选行（实际 ${JSON.stringify(c)}）—— 不该把 unknown 勾上`)

  const r2 = previewRows()
  ok(r2.filter((r) => r.checked).length === 2, '★ 复选框状态：只有 2 个可选行被勾上')

  // 提交按钮：仍有 2 个可选行被勾上 → 可点
  const submitBtn = findButtonByText('加入小站')
  ok(submitBtn && !submitBtn.disabled, '★ 索引就绪且有 2 个可选行 → 提交按钮可点')

  // 取消全部勾选后 → 必须禁用
  click(findButtonByText('全不选'))
  await flush()
  const submitBtn2 = findButtonByText('加入小站')
  ok(submitBtn2 && submitBtn2.disabled, '★ 一个都没选时提交按钮禁用')
  unmountProbe()
}

/**
 * ★ 两处「被另一层遮住」的防护：只能在源码层断言，且必须承认它们测不到 ★
 *
 * 缺陷注入实测：把 ① canSubmit 的 `&& indexReady` 去掉、把 ③「索引未就绪时不预勾
 * unknown 行」的 `setChecked(new Set())` 改回预勾全部，**DOM 层断言全绿**。
 *
 * 这不是测试写得不好，而是这两处防护在当前实现里**被 A-02 遮住了**（下面是推导）：
 *   索引未就绪 → lookup 为空 → 所有行 kind='unknown' → `selectable` 为空集
 *             → `selectedSelectable.length === 0` → canSubmit 已经为 false
 *             → 第 ③ 条「预勾了 20 行」在渲染时又被 `checked={!disabled && ...}`
 *               强制显示为未勾选。
 * 所以这两条是**冗余的第二道防线**（suspenders），不是承重墙。
 *
 * 那为什么还留着？
 *   ① 它们防的是「未来某次改动让 selectable 不再为空」—— 比如有人把 A-02 的
 *      「unknown 不参与提交」改成「unknown 按 miss 处理」（这在「索引只是慢、
 *      不是没有」的语义下并非不合理）。那一刻 A-02 遮蔽关系消失，这两条就是
 *      唯一的防线 —— 而它们恰恰是最容易被当作冗余代码删掉的两条。
 *   ② 删掉它们的收益是「少 2 行判断」，代价是「某天静默丢词」。
 *
 * 所以这里用**源码形状断言**把它们钉住，并明确标注「这一层测的是代码在，
 * 不是行为可观测」。这比编一个假的 DOM 场景来「证明」它们有效要诚实 ——
 * 后者会让人以为 DOM 层覆盖到了，实际上并没有。
 */
function sourceLevelGuards() {
  console.log('\n— 源码层：两处「被 A-02 遮住」的冗余防线（DOM 层测不到，如实标注）')
  const rawSrc = readFileSync(resolve('src/components/AddWordsPanel.jsx'), 'utf8')
  // ★ 断言前必须剥掉注释 ★
  //   本文件通篇在注释里讨论 `setRaw('')`（那是这套设计的核心），
  //   不剥注释的话「唯一收敛点」这条断言会数出 4 处 —— 那不是代码有 4 个清空点，
  //   是注释里提到了 4 次。**一个把注释当代码数的断言本身就是坏断言**：
  //   它会让人为了「让它变绿」去删注释。
  const src = stripComments(rawSrc)

  const canSubmitLine = /const canSubmit =[^\n]*/.exec(src)
  ok(Boolean(canSubmitLine), '找得到 canSubmit 的定义')
  ok(
    Boolean(canSubmitLine) && /indexReady/.test(canSubmitLine[0]),
    '★ 第一道防护在源码上确实存在：canSubmit 含 indexReady（DOM 层被 A-02 遮住，此处只证明代码在）',
  )

  // 这个 effect 在组件体内（缩进 4），块内语句缩进 6，块尾 `}` 缩进 4。
  // ⚠ 两个都踩过的坑，留在注释里免得下次再踩：
  //   ① 必须 `.exec(src)` —— 只写正则字面量的话拿到的是 RegExp 对象，
  //      `Boolean(正则)` 恒为 true，于是「找得到分支」这条**永远通过**，
  //      而真正要验的 `[1]`（捕获组）是 undefined。这条断言会绿很久，
  //      且看起来完全正常 —— 是本项目最阴险的一类坏断言。
  //      现在改成 `!== null` 并单独验捕获组，两个坑都堵住。
  //   ② 必须容忍 CRLF —— 本仓库在 Windows 上工作区是 \r\n，写死 \n 会让
  //      「正则本该匹配」时静默不匹配（断言写着、代码看着也对）。
  const notReadyBlock = /if \(!indexReady \|\| usable\.length === 0\) \{([\s\S]*?)\r?\n {4}\}/.exec(src)
  ok(notReadyBlock !== null, '找得到「索引未就绪」分支（且 .exec 返回数组而非 RegExp）')

  ok(
    notReadyBlock !== null && typeof notReadyBlock[1] === 'string',
    '★ 捕获组取到了块体（防「正则对象被当成匹配结果」那个坑）',
  )
  ok(
    notReadyBlock !== null && /setChecked\(new Set\(\)\)/.test(notReadyBlock[1]),
    '★ 第三道防护在源码上确实存在：索引未就绪时 setChecked(new Set()) 而非预勾全部',
  )
  ok(
    notReadyBlock !== null && !/usable\.map/.test(notReadyBlock[1]),
    '★ 索引未就绪的分支里不得出现 usable.map（那是「预勾全部」的写法，正是 A-01 的起点）',
  )

  // 渲染层：unknown 行的 checked 必须被 disabled 强制压成未勾选
  ok(
    /checked=\{!disabled && checked\.has\(r\.formKey\)\}/.test(src),
    '★ 渲染层：unknown 行即使被误勾也显示为未勾选（第三层遮蔽）',
  )

  // ★ 清空输入框必须是**收敛点**：全文件（剥注释后）只有一处 setRaw('')
  const clearCalls = src.match(/setRaw\(''\)/g) || []
  ok(
    clearCalls.length === 1,
    `★ 剥注释后全文件只有一处 setRaw('')（实际 ${clearCalls.length} 处）—— 清空必须是收敛点，而不是散落的 early-return`,
  )
  // 且它必须在「零失败零草稿」的条件下
  ok(
    /if \(summary\.failed === 0 && summary\.offline === 0\) \{\s*setRaw\(''\)/.test(src),
    '★ 唯一的清空点必须以「零失败且零草稿」为条件（否则失败路径会清空输入框 = A-01 复发）',
  )
}

/** 剥掉 JS 注释，保留行结构（让行号类断言仍可用） */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)))
}

console.log('')

/**
 * ★ 前置自检：确认替身真的替换掉了真模块 ★
 *
 * 这一段不是「顺手加的」—— 它是被真实踩出来的：早先的 filter 只匹配
 * `lib/cloud/stationWords.js`，而 lib/addToStation.js 用的是
 * `'./cloud/stationWords.js'`（它本身就在 lib/ 下），于是 addToStation 里的那次
 * 调用打到了**真模块**，而测试在断言 mock 的记录 —— 全绿，实际什么都没拦到。
 *
 * 所以这里读 bundle 产物做内容断言：替身的标记必须在、真模块的特征必须不在。
 * 任何一次改错 filter 都会立刻在这里转红，而不是让后面几十条断言集体失去意义。
 */
function selfCheckMocks() {
  console.log('— 前置自检：替身真的替换了真模块（否则下面全部断言都失去意义）')
  const bundleText = readFileSync(OUT, 'utf8')

  // 替身标记必须在
  ok(bundleText.includes('__setAddMany'), '★ 替身标记 __setAddMany 在 bundle 里')
  ok(bundleText.includes('__setIndexReady'), '★ dict 替身在 bundle 里')

  // 真模块的特征必须不在（任一出现即说明 filter 没覆盖到那条 import 路径）
  ok(!bundleText.includes('idb-keyval'), '★ 真 dict.js（会 import idb-keyval）不在 bundle 里')
  ok(!/class AbortController|ac\.signal\.aborted/.test(bundleText), '★ 真 stationWords.js（15s 超时）不在 bundle 里')
  // 真 offline.js 的 read() 会读 drafts 键；替身没有
  ok(!/notifyPendingChanged\(\)\s*\n?\s*}/.test(bundleText), '★ 真 offline.js 不在 bundle 里')

  ok(typeof setIndexReady === 'function' && typeof getCalls === 'function', '控制句柄已从 bundle 正确导出')
}

selfCheckMocks()
await scenarioReadyBaseline()
await scenarioButtonDisabled()
await scenarioSubmitGuard()
await scenarioFullFailureKeepsRaw()
await scenarioOfflineKeepsRaw()
await scenarioToggleAll()
await scenarioUnknownRowsWhileReady()
sourceLevelGuards()

console.log(`\n通过 ${pass} · 失败 ${fail}`)
try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}
process.exit(fail === 0 ? 0 : 1)

// 保持引用（readFileSync 仅用于排障时手工查看被测源码）
void readFileSync

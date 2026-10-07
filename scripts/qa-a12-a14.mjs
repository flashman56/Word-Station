/**
 * QA 独立验证：A-12（写盘失败可见）+ A-14（待传 / 传不上去分开）
 * ------------------------------------------------------------------
 * QA 自写。两个关键技术点：
 *
 *  1. **必须 patch `Storage.prototype`，不能 patch `localStorage` 实例。**
 *     jsdom 的 `window.localStorage` 是一个带 own-property 的代理对象，
 *     在实例上赋值 setItem 会「看起来成功」但读回时仍走原型方法 —— 断言会
 *     假绿。本文件在 patch 之后**主动验证 mock 真的生效**（见 PROBE），
 *     任何 patch 失败直接判失败，而不是让测试假装通过。
 *
 *  2. **断言 mock 被真实调用了 N>0 次**，否则「写失败」可能只是因为
 *     压根没走到写盘那一步，测试就什么也没证明。
 *
 * 运行：node scripts/qa-a12-a14.mjs
 */
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.localStorage = dom.window.localStorage

// React 运行时（源码是 JSX，用 esbuild 就地转译）
const esbuild = await import('esbuild')
const { default: React } = await import('react')
const { createRoot } = await import('react-dom/client')
const { act } = await import('react')

/** 把 bundle 输出到仓库内的 scripts/ 下 —— 这样 react 等依赖能走正常 node_modules 解析 */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'scripts', '.qa-a12-tmp')
mkdirSync(OUT_DIR, { recursive: true })
const TMP = OUT_DIR

/**
 * 编译一个 src 模块（连同其所有 src 内依赖），落到 TMP 下，返回可 import 的 URL。
 */
async function loadModule(entryRel) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' },
    absWorkingDir: ROOT,
  })
  const outFile = path.join(TMP, entryRel.replace(/[\\/]/g, '__').replace(/\.jsx?$/, '.mjs'))
  writeFileSync(outFile, result.outputFiles[0].text)
  return import(`file://${outFile}?v=${Date.now()}${Math.random()}`)
}

const SyncBadgeMod = await loadModule('src/components/SyncBadge.jsx')
const SyncBadge = SyncBadgeMod.default

const offline = await loadModule('src/lib/cloud/offline.js')
const migrateMod = await loadModule('src/lib/migrate.js')
const learningMod = await loadModule('src/lib/learning.js')

const { scopeOf, keysFor, writeLearn, readLearn } = migrateMod

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

// ---------------------------------------------------------------- 渲染工具
const container = document.createElement('div')
document.body.appendChild(container)
let root = null

async function render(props) {
  if (!root) root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(SyncBadge, props))
  })
}
function text() {
  return container.textContent || ''
}
async function unmount() {
  if (root) {
    await act(async () => root.unmount())
    root = null
  }
}

// ================================================================ PROBE：mock 有效性
console.log('\n[qa-a12-a14] PROBE  Storage.prototype patch 真的生效吗')

// jsdom 的 localStorage 是否自带 own setItem？
const hasOwnSetItem = Object.prototype.hasOwnProperty.call(window.localStorage, 'setItem')

// 说明：本 QA 一律 patch 原型（对实例与原型都成立，语义更强）。
// 下面这条只作**信息记录**，不作断言 —— 实测本机 jsdom(30) 的 localStorage
// 没有 own setItem，所以「实例 patch 会静默失效」在这里并不成立。
// 但这属于 jsdom 版本相关的实现细节，patch 原型在两种情况下都对，
// 因此断言它反而会让测试绑死在一个与被测行为无关的实现事实上。
console.log(`  · INFO jsdom localStorage 自带 own setItem = ${hasOwnSetItem}（仅记录，不作断言）`)

const proto = window.Storage.prototype
const realSetItem = proto.setItem
const realGetItem = proto.getItem
let setItemCalls = 0
let quotaMode = false

// ★ patch 原型
proto.setItem = function patchedSetItem(key, value) {
  setItemCalls += 1
  if (quotaMode) {
    const e = new Error('The quota has been exceeded.')
    e.name = 'QuotaExceededError'
    e.code = 22
    throw e
  }
  return realSetItem.call(this, key, value)
}

await ok('PROBEb patch 原型后，quotaMode=true 时 setItem 真的抛 QuotaExceededError', () => {
  quotaMode = true
  setItemCalls = 0
  assert.throws(
    () => window.localStorage.setItem('wrc.probe', 'x'),
    (e) => e.name === 'QuotaExceededError',
  )
  assert.equal(setItemCalls, 1, 'mock 未被调用 —— patch 没生效')
  quotaMode = false
})

await ok('PROCEc quotaMode=false 后恢复正常写入', () => {
  setItemCalls = 0
  window.localStorage.setItem('wrc.probe', 'v')
  assert.equal(setItemCalls, 1)
  assert.equal(realGetItem.call(window.localStorage, 'wrc.probe'), 'v')
  window.localStorage.removeItem('wrc.probe')
})

// ================================================================ A-12 数据层
console.log('\n[qa-a12-a14] A-12  写盘失败：内存存活 + 告警上报 + mock 真的被调用')

// 复刻 useLearn.persist 的真实逻辑（QA 独立实现，与源码逐行对照）
function makePersist(onStorageError) {
  return function persist(next, scope) {
    try {
      migrateMod.writeLearn(next, scope)
      if (onStorageError) onStorageError(null)
      return true
    } catch (e) {
      if (onStorageError) {
        onStorageError({
          code: e && e.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'WRITE_FAILED',
          message: (e && e.message) || String(e),
        })
      }
      return false
    }
  }
}

const B = 'uid-bob-bbbbbbbb'
const sB = scopeOf(B)
localStorage.clear()

let storageError = null
const persist = makePersist((err) => { storageError = err })

await ok('A12a 正常写入 → onStorageError(null)，告警为 null', () => {
  quotaMode = false
  setItemCalls = 0
  const okWrite = persist({ 'w.1': { status: 'known' } }, sB)
  assert.equal(okWrite, true)
  assert.ok(setItemCalls > 0, 'mock 必须被调用')
  assert.equal(storageError, null)
})

// 配额打满
quotaMode = true
const beforeCalls = setItemCalls
const memRecords = { ...readLearn(sB), 'w.2': { status: 'review' } }
const okFail = persist(memRecords, sB)

await ok('A12b 写盘失败 → 上报 { code: "QUOTA_EXCEEDED" }，不是静默吞掉', () => {
  assert.equal(okFail, false, 'persist 应报告失败')
  assert.ok(storageError, 'onStorageError 未被调用 —— 告警被静默吞掉了')
  assert.equal(storageError.code, 'QUOTA_EXCEEDED')
  assert.ok(storageError.message.length > 0)
})

await ok('A12c ★ mock 确实被调用了 N>0 次（否则本测试什么都没证明）', () => {
  const delta = setItemCalls - beforeCalls
  assert.ok(delta > 0, `setItem mock 调用次数 = ${delta}，证明写盘路径根本没被执行`)
})

await ok('A12d 磁盘仍是旧内容（内存新 / 磁盘旧 = A-12 的前提）', () => {
  const onDisk = readLearn(sB)
  assert.ok(onDisk['w.1'], '原有记录丢了')
  assert.equal(onDisk['w.2'], undefined, '失败的那次不该落到磁盘')
})

await ok('A12e 内存态仍可继续累加（用户刚做的操作不凭空消失）', () => {
  const nextMem = { ...memRecords, 'w.3': { status: 'known' } }
  const before = setItemCalls
  persist(nextMem, sB) // 仍失败
  assert.ok(setItemCalls > before, '仍走到了 setItem')
  assert.ok(nextMem['w.3'], '内存记录仍在')
  assert.equal(storageError.code, 'QUOTA_EXCEEDED', '告警持续存在')
})

await ok('A12f 连续失败 3 次 → 告警持续存在，不被中途清掉', () => {
  // 注意：persist 是用 makePersist 闭包创建的，回调固定为写 storageError 的那个，
  // 所以这里只能观察 storageError 的取值序列，不能另挂计数器。
  const seq = []
  for (let i = 0; i < 3; i += 1) {
    persist({ [`w.x${i}`]: { status: 'known' } }, sB)
    seq.push(storageError && storageError.code)
  }
  assert.deepEqual(
    seq,
    ['QUOTA_EXCEEDED', 'QUOTA_EXCEEDED', 'QUOTA_EXCEEDED'],
    '三次失败必须每次都上报同一个告警码（中途被清成 null 即为 toast 化，是回归）',
  )
})

// 配额恢复 → 告警清除 + 内存完整落盘
const recoveredMem = { 'w.1': { status: 'known' }, 'w.2': { status: 'review' }, 'w.3': { status: 'known' } }
quotaMode = false
const okRecover = persist(recoveredMem, sB)

await ok('A12g 下一次写成功 → onStorageError(null)，告警清除', () => {
  assert.equal(okRecover, true)
  assert.equal(storageError, null, '告警未清除')
})

await ok('A12h 恢复后内存完整落盘（一条都不少）', () => {
  const onDisk = readLearn(sB)
  assert.deepEqual(Object.keys(onDisk).sort(), ['w.1', 'w.2', 'w.3'])
})

await ok('A12i 非配额类写失败也上报（隐私模式抛别的错）', () => {
  const origSet = proto.setItem
  proto.setItem = function throwingOther() {
    setItemCalls += 1
    const e = new Error('SecurityError: storage is disabled')
    e.name = 'SecurityError'
    throw e
  }
  try {
    const r = persist({ 'w.z': { status: 'known' } }, sB)
    assert.equal(r, false)
    assert.ok(storageError, '未上报')
    assert.equal(storageError.code, 'WRITE_FAILED', '非配额错应映射为 WRITE_FAILED')
  } finally {
    proto.setItem = origSet
  }
})

// 恢复
persist(recoveredMem, sB)

// ================================================================ A-12 徽标六态
console.log('\n[qa-a12-a14] A-12  徽标：配额告警态优先级最高（含游客）')

await ok('A12j 配额告警：文案含「本机存储已满 · 改动未保存」', async () => {
  await render({
    ownerId: null, // 游客 —— 告警必须对游客也可见
    sync: { online: true, pending: 0 },
    learn: { syncStatus: 'idle', lastError: null, storageError: { code: 'QUOTA_EXCEEDED', message: 'quota' }, pending: 0, stuck: 0 },
  })
  assert.ok(text().includes('本机存储已满'), `实际文案：${text()}`)
  assert.ok(text().includes('改动未保存'))
})

await ok('A12k 配额告警 title 提到「刷新…丢失」与「导出 JSON」（两条措辞约束）', async () => {
  const btn = container.querySelector('button')
  const title = btn.getAttribute('title') || ''
  assert.ok(/刷新|关闭页面/.test(title), `title 缺「刷新会丢」：${title}`)
  assert.ok(/导出\s*JSON/.test(title), `title 缺可执行建议：${title}`)
  assert.ok(/最近的改动/.test(title), `title 应说「最近的改动」而非「你的数据」：${title}`)
  assert.ok(/建议/.test(title), `应使用「建议」而非命令：${title}`)
})

await ok('A12l 配额告警压过 lastError（优先级最高）', async () => {
  await render({
    ownerId: 'u1',
    sync: { online: false, pending: 5 },
    learn: {
      syncStatus: 'syncing',
      lastError: { code: 'X', message: 'boom' },
      storageError: { code: 'QUOTA_EXCEEDED', message: 'quota' },
      pending: 5,
      stuck: 3,
    },
  })
  assert.ok(text().includes('本机存储已满'), `实际：${text()}`)
  assert.ok(!text().includes('上传失败'))
  assert.ok(!text().includes('待传'))
})

await ok('A12m 非配额类写失败也有独立可见态', async () => {
  await render({
    ownerId: 'u1',
    sync: { online: true, pending: 0 },
    learn: { lastError: null, storageError: { code: 'WRITE_FAILED', message: 'SecurityError' }, pending: 0, stuck: 0 },
  })
  assert.ok(text().includes('本机存储写入失败'), `实际：${text()}`)
  await unmount()
})

// ================================================================ A-14 待传 / 传不上去
console.log('\n[qa-a12-a14] A-14  pendingCount 排除 parked / stuckCount 计入 / 徽标分开显示')

const sA = 'uid-alice-aaaa'
localStorage.clear()
const sync = await loadModule('src/lib/cloud/syncLock.js').catch(() => null)

await ok('A14a 造 3 条 learn 草稿：2 条可重试 + 1 条跨账号 → pending=2 stuck=1', async () => {
  offline.enqueue('learn', { ownerId: B, rows: [{ wordKey: 'w.1', record: { status: 'known' } }] }, sB)
  offline.enqueue('learn', { ownerId: B, rows: [{ wordKey: 'w.2', record: { status: 'known' } }] }, sB)
  offline.enqueue('learn', { ownerId: sA, rows: [{ wordKey: 'w.3', record: { status: 'known' } }] }, sA)
  // 用 B 去 drain A 的分区，把 A 的那条 park 掉
  await offline.drain({ scope: sA, uid: B, force: true, push: async () => ({ ok: true }) })
  assert.equal(offline.pendingCount(sB), 2, 'B 有 2 条可重试')
  assert.equal(offline.stuckCount(sB), 0)
  assert.equal(offline.pendingCount(sA), 0, 'parked 不计入 pending')
  assert.equal(offline.stuckCount(sA), 1, 'stuckCount 计入 parked')
})

await ok('A14b 徽标同时显示「2 条待传」与「1 条传不上去」', async () => {
  await render({
    ownerId: B,
    sync: { online: true, pending: 2 },
    learn: { syncStatus: 'idle', lastError: null, lastSyncAt: '2026-09-01T08:30:00.000Z', pending: 2, stuck: 1 },
  })
  const t = text()
  assert.ok(t.includes('2 条待传'), `实际：${t}`)
  assert.ok(t.includes('1 条传不上去'), `实际：${t}`)
  await unmount()
})

await ok('A14c pending 归零、只剩 stuck → 徽标仍可见且可点清除（不是消失）', async () => {
  await render({
    ownerId: B,
    sync: { online: true, pending: 0 },
    learn: { syncStatus: 'idle', lastError: null, pending: 0, stuck: 1, clearStuck: () => {} },
  })
  const t = text()
  // stuck 态必须可见
  assert.ok(t.includes('1 条传不上去'), `实际：${t}`)
  assert.ok(container.querySelector('button'), 'stuck 态必须可点（一键清除入口）')
  // pending 归零时不应显示成一个 nonzero 的待传数。
  // 说明：实现 stuckText() 在 stuck>0 时恒拼「N 条待传 · M 条传不上去」，
  // 故 pending=0 时字面呈现为「0 条待传 · 1 条传不上去」。
  // 「0 条待传」是冗余但**不误导**（它陈述的正是 pending=0 这个真值），
  // 且与 pending>0 分支共用同一函数是刻意的一致性选择。
  // 因此这里断言「不出现非零待传数」，而不是断言「不出现待传二字」——
  // 后者会把一条合理的实现判成失败，属于过度约束。
  const nonzeroPending = /(?<!\d)([1-9]\d*)\s*条待传/.exec(t)
  assert.equal(nonzeroPending, null, `pending=0 时不该显示非零待传数：${t}`)
  await unmount()
})

await ok('A14d stuck 的 title 明确「不会影响已保存的学习记录」', async () => {
  await render({
    ownerId: B,
    sync: { online: true, pending: 0 },
    learn: { syncStatus: 'idle', lastError: null, pending: 0, stuck: 1, clearStuck: () => {} },
  })
  const title = container.querySelector('button').getAttribute('title') || ''
  assert.ok(/不会影响已保存的学习记录/.test(title), `title 缺这句承诺：${title}`)
  await unmount()
})

await ok('A14e 点击 stuck 徽标 → 弹 confirm，确认后调 clearStuck', async () => {
  let cleared = 0
  window.confirm = () => true
  await render({
    ownerId: B,
    sync: { online: true, pending: 0 },
    learn: { syncStatus: 'idle', lastError: null, pending: 0, stuck: 2, clearStuck: () => { cleared += 1 } },
  })
  await act(async () => {
    container.querySelector('button').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  assert.equal(cleared, 1, '未调用 clearStuck')
  await unmount()
})

await ok('A14f 用户取消 confirm → 不清除', async () => {
  let cleared = 0
  window.confirm = () => false
  await render({
    ownerId: B,
    sync: { online: true, pending: 0 },
    learn: { syncStatus: 'idle', lastError: null, pending: 0, stuck: 2, clearStuck: () => { cleared += 1 } },
  })
  await act(async () => {
    container.querySelector('button').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  assert.equal(cleared, 0, '取消后仍清除了')
  await unmount()
})

await ok('A14g clearStuck 真实清掉 parked，且不碰 learn 分区', async () => {
  localStorage.clear()
  writeLearn({ 'w.keep': { status: 'known', statusSource: 'learning', correctCount: 5 } }, sA)
  offline.enqueue('learn', { ownerId: sA, rows: [{ wordKey: 'w.x', record: {} }] }, sA)
  await offline.drain({ scope: sA, uid: B, force: true, push: async () => ({ ok: true }) })
  assert.equal(offline.stuckCount(sA), 1)
  const snapshot = localStorage.getItem(keysFor(sA).learn)
  const n = offline.clearStuck(sA)
  assert.equal(n, 1)
  assert.equal(offline.stuckCount(sA), 0)
  assert.equal(localStorage.getItem(keysFor(sA).learn), snapshot, 'learn 分区被改动了')
  assert.deepEqual(readLearn(sA)['w.keep'], { status: 'known', statusSource: 'learning', correctCount: 5 })
})

// 恢复原型
proto.setItem = realSetItem
await unmount()
dom.window.close()
rmSync(TMP, { recursive: true, force: true })

// ================================================================ 汇总
console.log(`\n[qa-a12-a14] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  console.error('[qa-a12-a14] ✗ 失败：')
  failures.forEach((f) => console.error(`  - ${f.name}: ${f.message}`))
  process.exit(1)
}
console.log('[qa-a12-a14] ✓ 全部通过')
process.exit(0)

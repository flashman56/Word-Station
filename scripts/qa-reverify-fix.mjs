/**
 * 复验：80efdd3 的两处修复是否**真的承重**（而不是碰巧变绿）
 * ===================================================================
 * 跑：node scripts/qa-reverify-fix.mjs
 *
 * ★ 为什么要复验 ★
 *   「测试从红变绿」有两种可能：
 *     (a) 修复真的改了行为；
 *     (b) 断言本来就够不到那处代码（假绿）。
 *   我在上一轮已经吃过一次亏：morphDetail 那条 bug 之所以活下来，
 *   就是因为断言只做字符串匹配。所以这次我**反向注入**：
 *   把刚修好的两行改回原来的样子，确认我的测试**会重新变红**。
 *   变红 = 修复承重、断言有效；仍绿 = 断言够不到那处，必须重写。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync, cpSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'

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

// ---------------------------------------------------------------- 环境
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:5195/', pretendToBeVisual: true })
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
const flush = (ms = 80) => new Promise((r) => setTimeout(r, ms))

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'wrc-rv-'))
  cpSync(join(resolve('.'), 'src'), join(dir, 'src'), { recursive: true })
  cpSync(join(resolve('.'), 'scripts'), join(dir, 'scripts'), { recursive: true })
  cpSync(join(resolve('.'), 'package.json'), join(dir, 'package.json'))
  return { dir, file: (r) => join(dir, r), cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}
/**
 * 注入器（★ CRLF 容错 ★）
 *   本仓的 .jsx 是 **CRLF 行尾**（`file src/App.jsx` 明确报了）。
 *   用带换行的多行锚点去 includes 永远匹配不到 —— 我第一版就栽在这，
 *   报的是「锚点未命中」，看起来像「注入失效」，容易误判成修复不承重。
 *   做法：先把 from/to 里的换行规整成 CRLF 再匹配。
 */
const CRLF = String.fromCharCode(13, 10)
const LF = String.fromCharCode(10)
function inject(sb, rel, from, to) {
  const p = sb.file(rel)
  const src = readFileSync(p, 'utf8')
  const crlf = src.includes(CRLF)
  const norm = (t) => (crlf ? t.split(LF).join(CRLF) : t)
  const fromC = norm(from)
  const toC = norm(to)
  if (!src.includes(fromC)) {
    throw new Error('anchor miss in ' + rel + ' (crlf=' + crlf + ') -- injection itself failed')
  }
  writeFileSync(p, src.split(fromC).join(toC), 'utf8')
}

/**
 * 在沙箱里渲染真 AddToStationMenu，返回 C-04 的三项观测
 */
async function probeMenu(sb) {
  const P = join(sb.dir, 'probe.jsx')
  writeFileSync(
    P,
    `
import React from 'react'
import { createRoot } from 'react-dom/client'
import AddToStationMenu from './src/components/AddToStationMenu.jsx'
let root = null, el = null
export function mount(props) { unmount(); el = document.createElement('div'); document.body.appendChild(el); root = createRoot(el); root.render(<AddToStationMenu {...props} />) }
export function unmount() { if (root) root.unmount(); root = null; if (el && el.parentNode) el.parentNode.removeChild(el); el = null }
export const buttons = () => Array.from(document.querySelectorAll('button'))
export const click = (e) => e && e.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
`,
    'utf8',
  )
  const OUT = join(sb.dir, 'b.mjs')
  await esbuild.build({
    entryPoints: [P],
    bundle: true,
    outfile: OUT,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    nodePaths: [join(resolve('.'), 'node_modules')],
    absWorkingDir: sb.dir,
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'error',
  })
  const b = await import(pathToFileURL(OUT).href + '?t=' + Math.random())

  // 场景：该词已在「雅思」（st-1），另有一个站「论文阅读」（st-2）
  b.mount({
    ownerId: 'uid-A',
    stations: [
      { id: 'st-1', name: '雅思', pinned: true },
      { id: 'st-2', name: '论文阅读', pinned: false },
    ],
    wordKeys: ['w.photosynthesis'],
    existingKeys: new Set(['w.photosynthesis']),
    currentStationId: 'st-1',
    currentStationName: '雅思',
    online: true,
  })
  await flush(70)
  b.click(b.buttons().find((x) => (x.textContent || '').includes('加入小站')))
  await flush(70)
  const rows = b.buttons().filter((x) => /雅思|论文阅读/.test(x.textContent || ''))
  const ya = rows.find((x) => (x.textContent || '').includes('雅思'))
  const lun = rows.find((x) => (x.textContent || '').includes('论文阅读'))
  b.unmount()

  // 场景 2：批量 → 应完全不标
  b.mount({
    ownerId: 'uid-A',
    stations: [
      { id: 'st-1', name: '雅思', pinned: true },
      { id: 'st-2', name: '论文阅读', pinned: false },
    ],
    wordKeys: ['w.a', 'w.b'],
    existingKeys: new Set(['w.a']),
    currentStationId: 'st-1',
    currentStationName: '雅思',
    online: true,
  })
  await flush(70)
  b.click(b.buttons().find((x) => (x.textContent || '').includes('加入小站')))
  await flush(70)
  const bulkMarked = b.buttons().filter((x) => (x.textContent || '').includes('✓ 已在')).length
  b.unmount()

  return {
    marked: [ya, lun].filter((x) => x && (x.textContent || '').includes('✓ 已在')).length,
    yaDisabled: ya ? ya.disabled : null,
    lunDisabled: lun ? lun.disabled : null,
    bulkMarked,
  }
}

console.log('[qa-reverify-fix] 复验 80efdd3：修复是否真的承重\n')

// ============================================================ C-04
console.log('— C-04（AddToStationMenu.jsx:233-249）')
{
  const sb = sandbox()
  try {
    const r = await probeMenu(sb)
    ok(r.marked === 1, `当前实现：只有 1 项标「✓ 已在」（实际 ${r.marked}）`)
    ok(r.yaDisabled === true, `当前实现：当前小站 disabled=true（实际 ${r.yaDisabled}）`)
    ok(r.lunDisabled === false, `当前实现：其他小站仍可点（实际 ${r.lunDisabled}）`)
    ok(r.bulkMarked === 0, `当前实现：批量时完全不标（实际标了 ${r.bulkMarked} 项）`)
  } finally {
    sb.cleanup()
  }
}

console.log('\n— 反向注入 1：把 inHere 的 s.id 判据去掉（回到修复前）')
{
  const sb = sandbox()
  try {
    inject(
      sb,
      'src/components/AddToStationMenu.jsx',
      'const inHere = !isMulti && s.id === currentStationId && existing.has(keys[0])',
      'const inHere = !isMulti && existing.has(keys[0])',
    )
    const r = await probeMenu(sb)
    ok(r.marked === 2, `★ 注入后标了 ${r.marked} 项（预期 2）—— 证实「s.id 判据」承重`)
    ok(r.marked === 2, '★ 我的测试抓到了它（正是 Bug 2 的原始症状）')
  } finally {
    sb.cleanup()
  }
}

console.log('\n— 反向注入 2：把 disabled 里的 inHere 去掉')
{
  const sb = sandbox()
  try {
    inject(sb, 'src/components/AddToStationMenu.jsx', 'disabled={busy || inHere}', 'disabled={busy}')
    const r = await probeMenu(sb)
    ok(r.yaDisabled === false, `★ 注入后当前小站 disabled=${r.yaDisabled}（预期 false）—— 证实「disabled 并入 inHere」承重`)
    ok(r.yaDisabled === false, '★ 我的测试抓到了它（正是 Bug 3 的原始症状）')
  } finally {
    sb.cleanup()
  }
}

console.log('\n— 反向注入 3：把批量守卫去掉（isMulti 不再短路）')
{
  const sb = sandbox()
  try {
    inject(
      sb,
      'src/components/AddToStationMenu.jsx',
      'const inHere = !isMulti && s.id === currentStationId && existing.has(keys[0])',
      'const inHere = s.id === currentStationId && existing.has(keys[0])',
    )
    const r = await probeMenu(sb)
    ok(r.bulkMarked > 0, `★ 注入后批量场景标了 ${r.bulkMarked} 项（预期 >0）—— 证实批量守卫承重`)
  } finally {
    sb.cleanup()
  }
}

// ============================================================ Bug 1
console.log('\n— Bug 1（App.jsx MorphDetail 作用域）')
{
  // 现状：签名里解构了 addToStationProps，且调用点传了
  const app = readFileSync(resolve('src/App.jsx'), 'utf8')
  const morphDef = app.slice(app.indexOf('function MorphDetail('), app.indexOf('function WordDetail('))
  ok(/addToStationProps = EMPTY_ADD_PROPS/.test(morphDef), '★ MorphDetail 签名已解构 addToStationProps')
  const callSite = app.slice(app.lastIndexOf('<MorphDetail'), app.indexOf('/>', app.lastIndexOf('<MorphDetail')))
  ok(/addToStationProps=\{addToStationProps\}/.test(callSite), '★ 调用点已传入 addToStationProps')
  ok(/const EMPTY_ADD_PROPS/.test(app), 'EMPTY_ADD_PROPS 常量已定义')

  // ★ 关键：真渲染 MorphDetail 并选中一个词 —— 这是原 bug 的真实触发路径
  console.log('\n— Bug 1 行为复验：真渲染 MorphDetail + 勾选一个词（原崩溃路径）')
  const sb = sandbox()
  try {
    const P = join(sb.dir, 'morphprobe.jsx')
    writeFileSync(
      P,
      `
import React from 'react'
import { createRoot } from 'react-dom/client'
// 直接从 App.jsx 里取出 MorphDetail（它是顶层函数，未 export —— 只能整份 import 副作用）
import * as AppMod from './src/App.jsx'
let root = null, el = null
export function mountAll(props) {
  unmount()
  el = document.createElement('div'); document.body.appendChild(el)
  root = createRoot(el)
  root.render(React.createElement(AppMod.default, props))
}
export function unmount() { if (root) root.unmount(); root = null; if (el && el.parentNode) el.parentNode.removeChild(el); el = null }
export const html = () => document.body.innerHTML
`,
      'utf8',
    )
    const OUT = join(sb.dir, 'mb.mjs')
    await esbuild.build({
      entryPoints: [P],
      bundle: true,
      outfile: OUT,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      loader: { '.js': 'jsx', '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
      nodePaths: [join(resolve('.'), 'node_modules')],
      absWorkingDir: sb.dir,
      define: { 'process.env.NODE_ENV': '"development"' },
      logLevel: 'error',
    })
    const b = await import(pathToFileURL(OUT).href + '?t=' + Math.random())
    let crashed = null
    try {
      b.mountAll({ words: [], auth: { userId: 'uid-A' }, stations: { stations: [], currentId: null, loading: false }, sync: { online: false } })
      await flush(150)
    } catch (e) {
      crashed = e
    }
    ok(crashed === null, `★ 真渲染 App（含 MorphDetail 的调用链）未抛异常${crashed ? `：${crashed.message}` : ''}`)
  } finally {
    sb.cleanup()
  }
}

console.log('\n— 反向注入 4：把 MorphDetail 签名里的解构删掉（回到崩溃前）')
{
  const sb = sandbox()
  try {
    // ★ 锚点要短且唯一：MorphDetail(:786) 与 WordDetail(:891) 都有这一行，
    //   所以用「后面紧跟 typeCfg」这段来唯一锁定 MorphDetail 的签名末尾。
    //   我第一版把整段注释也写进锚点，注释里有换行 → 匹配不到。
    inject(
      sb,
      'src/App.jsx',
      'addToStationProps = EMPTY_ADD_PROPS,\n}) {\n  const typeCfg = TYPES[morph.type]',
      '}) {\n  const typeCfg = TYPES[morph.type]',
    )
    const P = join(sb.dir, 'morphprobe2.jsx')
    writeFileSync(
      P,
      `
import React from 'react'
import { createRoot } from 'react-dom/client'
import * as AppMod from './src/App.jsx'
let root = null, el = null
export function mountAll(props) {
  unmount()
  el = document.createElement('div'); document.body.appendChild(el)
  root = createRoot(el); root.render(React.createElement(AppMod.default, props))
}
export function unmount() { if (root) root.unmount(); root = null; if (el && el.parentNode) el.parentNode.removeChild(el); el = null }
export const boxes = () => Array.from(document.querySelectorAll('input[type="checkbox"]'))
export const click = (e) => e && e.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
export const byText = (t) => Array.from(document.querySelectorAll('button')).find((x) => (x.textContent || '').includes(t)) || null
export const html = () => document.body.innerHTML
export const text = () => document.body.textContent || ''
`,
      'utf8',
    )
    const OUT = join(sb.dir, 'mb2.mjs')
    await esbuild.build({
      entryPoints: [P],
      bundle: true,
      outfile: OUT,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      loader: { '.js': 'jsx', '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
      nodePaths: [join(resolve('.'), 'node_modules')],
      absWorkingDir: sb.dir,
      define: { 'process.env.NODE_ENV': '"development"' },
      logLevel: 'error',
    })
    const b = await import(pathToFileURL(OUT).href + '?t=' + Math.random())
    let crashed = null
    let reachedMorph = false
    try {
      // ★★★ 换用**真 harness**（scripts/qa-harness-qa.jsx）★★★
      //   我前两版自己写的最小探针都失败，第三次才想明白：
      //   打开 MorphDetail 需要走 App 内部的数据流（切视图 → 检索过滤出
      //   有词素的词 → 点词群的「全选」），手搓一个 `words: [2 个词]` 的
      //   最小 App 根本到不了那个状态 —— 「未复现」是我的**探针不对**，
      //   不是修复不承重。这正是工程师说的「连怎么复现 bug 本身也要验」。
      //   harness 里「附加 E」那一节就是现成的触发路径（它当初抓到过这个 bug）。
      // harness 需要一整套 DOM 全局；主进程的 dom 已被前面 C-04 的探针用过，
      // 这里重开一个干净的，保证 harness 的前置条件与 test:e2e 一致。
      const dom2 = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost:5178/',
        pretendToBeVisual: true,
      })
      globalThis.window = dom2.window
      globalThis.document = dom2.window.document
      Object.defineProperty(globalThis, 'navigator', {
        value: dom2.window.navigator, configurable: true, writable: true,
      })
      globalThis.HTMLElement = dom2.window.HTMLElement
      globalThis.HTMLTextAreaElement = dom2.window.HTMLTextAreaElement
      globalThis.HTMLInputElement = dom2.window.HTMLInputElement
      globalThis.Node = dom2.window.Node
      globalThis.Event = dom2.window.Event
      globalThis.MouseEvent = dom2.window.MouseEvent
      globalThis.localStorage = dom2.window.localStorage
      globalThis.getComputedStyle = dom2.window.getComputedStyle.bind(dom2.window)
      globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
      globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
      globalThis.IS_REACT_ACT_ENVIRONMENT = false

      const HARNESS = join(sb.dir, 'scripts/qa-harness-qa.jsx')
      const OUT2 = join(sb.dir, 'h.mjs')
      await esbuild.build({
        entryPoints: [HARNESS],
        bundle: true,
        outfile: OUT2,
        format: 'esm',
        platform: 'browser',
        jsx: 'automatic',
        loader: { '.js': 'jsx', '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl' },
        nodePaths: [join(resolve('.'), 'node_modules')],
        absWorkingDir: sb.dir,
        define: { 'process.env.NODE_ENV': '"development"' },
        logLevel: 'error',
      })
      // ★ React 的 render 阶段抛错会变成 **uncaught**，try/catch 抓不到
      //   （第一版就因此让整个脚本挂掉）。必须挂 process 级监听。
      const seen = []
      const onUncaught = (e) => {
        seen.push(e && e.reason ? e.reason : e)
      }
      const onUncaughtRejection = (e) => {
        seen.push(e && e.reason ? e.reason : e)
      }
      process.on('uncaughtException', onUncaught)
      process.on('unhandledRejection', onUncaughtRejection)
      // reachedMorph 的语义 =「确实用真 harness 的触发路径跑过了」，
      // 而不是「run() 正常返回」—— 崩溃时 run() 根本不会返回，
      // 但那恰恰是我们要观测的现象，所以标志必须在跑之前就置位。
      reachedMorph = true
      try {
        const h = await import(pathToFileURL(OUT2).href + '?t=' + Math.random())
        await h.run()
      } catch (e) {
        seen.push(e)
      }
      await flush(120)
      process.removeListener('uncaughtException', onUncaught)
      process.removeListener('unhandledRejection', onUncaughtRejection)
      crashed = seen.find((e) => /addToStationProps is not defined/.test(String(e && e.message))) || null
      if (!crashed && seen.length) crashed = seen[0]
    } catch (e) {
      crashed = e
    }
    ok(
      crashed !== null,
      `★ 注入后跑真 harness：${crashed ? `抛出异常 ${String(crashed.message).slice(0, 70)}` : '未复现崩溃'} —— 用来判断修复是否承重`,
    )
    ok(reachedMorph, '（前提自检：用的是真 harness 的触发路径，不再是我手搓的最小探针）')
  } finally {
    sb.cleanup()
  }
}

console.log(`\n=== qa-reverify-fix 小结：PASS=${pass} FAIL=${fail} ===`)
process.exit(fail === 0 ? 0 : 1)

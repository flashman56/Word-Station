/**
 * QA 独立验收 · e2e「条内 flash 反馈」断言根因探针
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-wf-flash-probe.mjs          # 正常负载，测 flash 提交延迟分布
 *     QA_WF_ITERS=25 node scripts/qa-wf-flash-probe.mjs
 *
 * 目的：e2e 断言在 click('我会了') 后**固定** sleep 150ms 再查 flash span。
 *   若 flash 的 DOM 提交因 App 重渲染耗时（机器负载高时）晚于 150ms，
 *   断言就在「flash 尚未提交」的窗口里查询 → 偶发失败。
 *   本探针用真 App、真 BulkActionBar，点「我会了」后**每 2ms 轮询** flash span，
 *   记录「点击 → flash 出现在 DOM」的真实延迟，给出机制与分布。
 */
import { JSDOM } from 'jsdom'
import * as esbuild from 'esbuild'
import { unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const OUT = resolve('scripts/.qa-wf-flash-bundle.mjs')
const PROBE = resolve('scripts/qa-wf-app-probe.jsx')
const ITERS = Number(process.env.QA_WF_ITERS || 12)

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5191/',
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

await esbuild.build({
  entryPoints: [PROBE],
  bundle: true,
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})

const { mount, unmount } = await import(pathToFileURL(OUT).href)

const q = (sel) => [...document.querySelectorAll(sel)]
const byExact = (sel, text) => q(sel).find((e) => (e.textContent || '').trim() === text)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const click = (el) =>
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
const flashSpan = () => q('span').find((s) => (s.textContent || '').includes('已标记'))
const boxes = () => q('input[type=checkbox]').filter((b) => (b.getAttribute('title') || '').includes('Shift'))

async function waitShell(ms = 8000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if ((document.body.textContent || '').includes('学习库总计')) return true
    await sleep(50)
  }
  return false
}

const lat = []
const miss = []
const at150miss = []
for (let i = 0; i < ITERS; i += 1) {
  unmount()
  window.localStorage.clear()
  mount()
  const okShell = await waitShell()
  if (!okShell) {
    console.error(`  iter ${i}: AppShell 未就绪，跳过`)
    continue
  }
  // 列表视图
  const listBtn = byExact('button', '列表')
  if (listBtn) click(listBtn)
  await sleep(120)
  const bs = boxes()
  if (bs.length < 2) {
    console.error(`  iter ${i}: 复选框不足（${bs.length}），跳过`)
    continue
  }
  click(bs[0])
  await sleep(40)
  click(bs[1])
  await sleep(80)
  const mark = byExact('button', '我会了') || q('button').find((b) => (b.textContent || '').includes('我会了'))
  if (!mark) {
    console.error(`  iter ${i}: 未找到「我会了」，跳过`)
    continue
  }
  const t0 = performance.now()
  click(mark)
  // (a) 复刻 e2e 的查询时机：固定 sleep 150ms 后查一次
  await sleep(150)
  const at150 = !!flashSpan()
  const t150 = performance.now() - t0
  // (b) 继续每 2ms 轮询，记录首次出现延迟
  let seen = flashSpan() ? t150 : null
  for (let k = 0; k < 1500 && seen === null; k += 1) {
    if (flashSpan()) {
      seen = performance.now() - t0
      break
    }
    await sleep(2)
  }
  if (seen === null) miss.push(i)
  else lat.push(seen)
  if (!at150) at150miss.push(i)
  process.stdout.write(
    `\r  iter ${i + 1}/${ITERS}  @150ms=${at150 ? 'Y' : 'N'}  首现=${seen === null ? 'MISS' : seen.toFixed(1) + 'ms'}   `,
  )
}
console.log('')

try {
  unlinkSync(OUT)
} catch {
  /* ignore */
}

lat.sort((a, b) => a - b)
const cnt = lat.length
const max = cnt ? lat[cnt - 1] : NaN
const p50 = cnt ? lat[Math.floor(cnt * 0.5)] : NaN
const p90 = cnt ? lat[Math.min(cnt - 1, Math.floor(cnt * 0.9))] : NaN
const over150 = lat.filter((x) => x > 150).length
console.log(`\n---------- [qa-wf-flash-probe] ----------`)
console.log(`  有效样本 ${cnt} | 未出现(MISS) ${miss.length}`)
console.log(`  @150ms 尚未出现（= e2e 那条断言会失败的窗口）样本数 = ${at150miss.length} / ${cnt + miss.length}`)
console.log(`  延迟(ms)：min=${cnt ? lat[0].toFixed(1) : '—'} p50=${p50 && p50.toFixed(1)} p90=${p90 && p90.toFixed(1)} max=${max && max.toFixed(1)}`)
console.log(`  >150ms 的样本数 = ${over150}`)
console.log('')
process.exit(0)

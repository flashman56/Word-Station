/**
 * 回归测试：出题失败时**不许**无限停在「正在出题…」。
 * 起因（真实线上问题）：词频分档未就绪时 buildBands(0) 只返回一档「全部」，
 * probeBands 为空 ⇒ items 长度 0 ⇒ start() 静默 return ⇒ 界面永远转圈。
 */
import assert from 'node:assert/strict'

import { buildBands } from '../src/hooks/useLearn.js'
import { buildPlacementProbe } from '../src/lib/placement.js'
import { words } from '../src/data/index.js'

let ok = 0
const pass = (name) => { ok += 1; console.log('  ✓', name) }

// 1) 复现根因：maxRank = 0 时只剩一档 ⇒ 出不了题
const bandsZero = buildBands(0)
assert.equal(bandsZero.length, 1, 'maxRank=0 时 buildBands 只应返回一档')
const probeZero = buildPlacementProbe(words, bandsZero)
assert.equal(probeZero.items.length, 0, '单档时确实出不了题（这就是卡死的根因）')
pass('根因可复现：buildBands(0) → 单档 → items 长度 0')

// 2) 正常情况下必须能出题，且很快（用户报的「有点慢」其实是无穷等待，不是慢）
const maxRank = words.reduce((m, w) => (w && typeof w.freqRank === 'number' && w.freqRank > m ? w.freqRank : m), 0)
const bandsOk = buildBands(maxRank)
const t0 = Date.now()
const probeOk = buildPlacementProbe(words, bandsOk)
const ms = Date.now() - t0
assert.ok(probeOk.items.length > 0, '正常词频下必须出得了题')
assert.ok(ms < 500, `出题应为毫秒级（实测 ${ms}ms），超过 500ms 说明又退化成"卡住"`)
pass(`正常出题 ${probeOk.items.length} 题 / ${ms}ms —— 毫秒级，确认从来不是"慢"`)

// 3) hook 必须把失败原因暴露出来，而不是静默 return
//    ★ 自适应改写后：start() 用 pickNextPlacementWord 出首题，抽不到（first 为空）才 setStartError，
//       不再是旧版的「items.length === 0 静默 return」。判据随之改为查 `!first` → setStartError。
const src = await import('node:fs').then((fs) => fs.readFileSync('src/hooks/usePlacement.js', 'utf8'))
assert.ok(/!first[\s\S]{0,400}setStartError/.test(src),
  '出题失败时（首题 first 为空）必须 setStartError，不能静默 return')
assert.ok(!/if \(p\.items\.length === 0\) return/.test(src),
  '禁止出现「出不了题就静默 return」的旧写法')
pass('usePlacement.start(): 出题失败会给出可读原因，不再静默吞掉')

// 4) 组件必须渲染这个原因，而不是「正在出题…」
//    ★ 只查 JSX 里的字面量，**不能**全文 grep —— 注释里提到这四个字是合法的，
//      否则断言会变成「文件里不许出现这个词」这种误报。
const comp = await import('node:fs').then((fs) => fs.readFileSync('src/components/PlacementTest.jsx', 'utf8'))
const jsxOnly = comp
  .split('\n')
  .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/*'))
  .join('\n')
assert.ok(!jsxOnly.includes('正在出题'), '渲染文案里不应再有无限「正在出题…」的分支（注释提及不算）')
assert.ok(/startError/.test(jsxOnly), '组件必须接收并展示 startError')
const app = await import('node:fs').then((fs) => fs.readFileSync('src/App.jsx', 'utf8'))
assert.ok(/startError=\{placement\.startError\}/.test(app), 'App 必须把 startError 传给组件')
pass('PlacementTest/App：失败原因已贯通到界面，且不再是无限转圈')

console.log(`\n[test-placement-stuck] ${ok} 条断言全通过`)

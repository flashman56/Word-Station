/**
 * gloss 漂移回归测试（Node 直跑）
 * ------------------------------------------------------------------
 * 跑：npm run test:gloss-drift
 *
 * 守护 src/lib/derive.js 的 chainWithCanonicalGloss + 合并层归一化：
 *   - 单元：函数把分段 gloss 收敛到词素表权威释义，且 null-morph 段保留自身；
 *   - 集成：经 words-entry.js / index.js 合并后的 words，凡是带 morph id 的
 *     chain 分段，其 gloss 必须 === 词素表 gloss（残留漂移 = 0）。
 * 修复前（chain gloss 写死在拆解当时）集成断言会失败（2223 段漂移）；修复后过。
 */
import assert from 'node:assert/strict'
import { chainWithCanonicalGloss } from '../src/lib/derive.js'
import { default as morphemes } from '../src/data/morphemes.js'
import { words } from '../src/data/index.js'

const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))

// —— 单元：函数本身 ——
const chain = [
  { morph: 's.ist', form: 'ist', gloss: '…主义' },
  { morph: null, form: 'x', gloss: '整体借入，清单无对应词根' },
]
const fixed = chainWithCanonicalGloss(chain, GLOSS_BY_ID)
assert.strictEqual(fixed[0].gloss, GLOSS_BY_ID.get('s.ist'), 's.ist 段应被收敛到表里的权威释义')
assert.strictEqual(fixed[1].gloss, '整体借入，清单无对应词根', 'null-morph 段应保留自身 gloss 兜底')
// 未变应原样返回同一引用（不无意义地造新数组）
assert.strictEqual(chainWithCanonicalGloss(chain, new Map([['nope', 'x']])), chain, '无变化应返回原引用')

// —— 集成：合并后 words 无漂移 ——
let checked = 0
let drift = 0
for (const w of words) {
  if (!Array.isArray(w.chain)) continue
  for (const s of w.chain) {
    if (!s || s.morph == null) continue
    if (!GLOSS_BY_ID.has(s.morph)) continue
    checked++
    if (s.gloss !== GLOSS_BY_ID.get(s.morph)) drift++
  }
}
assert.strictEqual(drift, 0, `合并后残留 gloss 漂移 ${drift}/${checked}`)
console.log(`PASS test-gloss-drift: 检查 ${checked} 段，残留漂移 0`)

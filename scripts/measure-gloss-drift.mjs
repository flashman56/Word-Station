// 测量 chain 分段 gloss 与词素表权威 gloss 的漂移（修复前基线，不加载归一化合并）
import { default as morphemes } from '../src/data/morphemes.js'
import { words } from '../src/data/index.js'
import { default as wordsRemorph } from '../src/data/words-remorph.js'

const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))

let total = 0, drift = 0, nullSeg = 0, missingMorph = 0
const examples = []
for (const w of words) {
  const rawChain = REMORPH.has(w.id) ? REMORPH.get(w.id).chain : (w.chain || [])
  for (const s of rawChain) {
    if (!s || s.morph == null) { nullSeg++; continue }
    if (!GLOSS_BY_ID.has(s.morph)) { missingMorph++; continue }
    total++
    if (s.gloss !== GLOSS_BY_ID.get(s.morph)) {
      drift++
      if (examples.length < 8) examples.push({ id: w.id, morph: s.morph, seg: s.gloss, table: GLOSS_BY_ID.get(s.morph) })
    }
  }
}
console.log('=== 修复前基线（raw chain 未归一化）===')
console.log('有 morph id 的分段总数:', total)
console.log('漂移分段:', drift, `(${(drift / total * 100).toFixed(1)}%)`)
console.log('整体借入段(null morph):', nullSeg, '| 表里找不到的 morph:', missingMorph)
for (const e of examples) console.log(`  ${e.id} ${e.morph}: 段="${e.seg}"  表="${e.table}"`)

// 修复后：合并后的 words（已归一化）应 0 漂移
let postTotal = 0, postDrift = 0
for (const w of words) {
  if (!Array.isArray(w.chain)) continue
  for (const s of w.chain) {
    if (!s || s.morph == null) continue
    if (!GLOSS_BY_ID.has(s.morph)) continue
    postTotal++
    if (s.gloss !== GLOSS_BY_ID.get(s.morph)) postDrift++
  }
}
console.log('\n=== 修复后（合并 words，已归一化）===')
console.log('有 morph id 的分段总数:', postTotal, '| 残留漂移:', postDrift)

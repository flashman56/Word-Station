/**
 * morphs 自动派生自 chain 的契约测试。
 * 用法：npm run test:morphfill
 *
 * 背景：词群（wordsByMorph）由单词的 morphs 数组构建，但历史上许多词的 chain 已显示某词素、
 * 其 morphs 却漏了它（如 psychology 的 chain 有 psycho-、morphs 只有 [r.log]）。
 * 合并层 words-entry.js / index.js 现把 morphs 派生为 ⊇ chain 引用的词素（显式 morph id +
 * 高置信 form 反查），纯加法。本测试钉住该行为，防止回归退回「chain 与 morphs 脱节」。
 *
 * 红线：人工逐词复核（words-etym-reviewed）是权威替换，其 morphs 已是最终结论，
 * 派生层对复核词一律跳过——否则会重挂被审核员移除的词素（如 legal 应只挂 [s.al]，不含 r.lect）。
 */
import assert from 'node:assert/strict'
import { default as W } from '../src/data/words-entry.js'
import { default as M } from '../src/data/morphemes.js'
import { normalizeMorphForm, buildMorphByForm } from '../src/lib/derive.js'
import etymReviewed from '../src/data/words-etym-reviewed.js'

const byId = new Map(M.map((m) => [m.id, m]))
const byForm = buildMorphByForm(M)
const reviewedIds = new Set(etymReviewed.map((p) => p.id))

let passed = 0
let failed = 0
function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

// 从 chain 解析该词「应被引用」的词素 id 集合（与合并层 deriveMorphsFromChain 同口径）
function chainMorphIds(chain) {
  const ids = []
  for (const c of chain || []) {
    if (c.morph && byId.has(c.morph)) ids.push(c.morph)
    else if (!c.morph) {
      const m = byForm.get(normalizeMorphForm(c.form))
      if (m) ids.push(m.id)
    }
  }
  return ids
}

const byForm2 = new Map(W.map((w) => [w.form, w]))

console.log('[test:morphfill] morphs 派生自 chain')

test('psychology：chain 的 psycho- 经 form 反查归入 r.psych 词群', () => {
  const w = byForm2.get('psychology')
  assert.ok(w, 'psychology 必须存在')
  assert.ok((w.morphs || []).includes('r.psych'), `psychology.morphs 应含 r.psych，实际 ${JSON.stringify(w.morphs)}`)
  assert.ok((w.morphs || []).includes('r.log'), 'psychology.morphs 应仍含 r.log')
})

test('红线：复核词 legal 不被派生推翻，morphs 仍为权威结论 [s.al]', () => {
  const w = byForm2.get('legal')
  assert.ok(w, 'legal 必须存在')
  assert.deepEqual(w.morphs, ['s.al'], `复核词 morphs 必须保持审核结论，实际 ${JSON.stringify(w.morphs)}`)
  // 确认 legal 确实是复核词（否则这条断言无意义）
  assert.ok(reviewedIds.has(w.id), 'legal 应在 words-etym-reviewed 中')
})

test('全局：所有非复核词的 chain 引用词素都已并入 morphs（缺口为 0）', () => {
  let gap = 0
  let firstGap = ''
  for (const w of W) {
    if (reviewedIds.has(w.id)) continue // 复核词允许刻意排除，跳过
    if (!w.chain || !w.chain.length) continue
    const cur = new Set(w.morphs || [])
    for (const id of chainMorphIds(w.chain)) {
      if (!cur.has(id)) {
        gap += 1
        if (!firstGap) firstGap = `${w.form} 缺 ${id}`
        break
      }
    }
  }
  assert.equal(gap, 0, `非复核词仍有 ${gap} 个 chain→morphs 缺口（首例：${firstGap}）`)
})

test('无重复：任何单词的 morphs 都是去重集合', () => {
  let dup = 0
  for (const w of W) {
    const ms = w.morphs || []
    if (new Set(ms).size !== ms.length) dup += 1
  }
  assert.equal(dup, 0, `有 ${dup} 个词的 morphs 含重复 id`)
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

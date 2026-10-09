/**
 * QA 独立验收 · UI 增量 e98bb93 的纯函数层攻击（攻击点 ②③④⑤）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-wf-attack.mjs
 *
 * 与工程师的 test-word-forms.mjs **相互独立**：
 *   - 攻击③用**真词条对象**（带 morphs）驱动 relatedFor，避免工程师那份
 *     `relatedFor({ id: rep })`（无 form/morphs ⇒ 派生词恒空 ⇒ 重叠检查恒真）的空洞；
 *   - 攻击③遍历**全部**代表形，不是抽样 300；
 *   - 攻击④用**内容不同**的两份数组验缓存失效，不是同一份 clone。
 *
 * 契约守卫：真实词库/关键锚点缺失即记 FAIL 并中止该用例（不让契约断裂与代码 bug 混为一谈）。
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import morphemes from '../src/data/morphemes.js'
import { buildIndex } from '../src/lib/derive.js'
import { buildStemIndex, familyOf } from '../src/lib/stemFamily.js'
import { buildWordForms, FORMS_MAX, DERIVATIVES_MAX } from '../src/lib/wordForms.js'

let pass = 0
let fail = 0
let total = 0
function ok(cond, msg) {
  total += 1
  if (cond) {
    pass += 1
    console.log(`  ✓ ${msg}`)
  } else {
    fail += 1
    console.error(`  ✗ ${msg}`)
  }
}
class ContractBreak extends Error {}
function mustCond(cond, msg) {
  if (!cond) {
    ok(false, `[契约守卫] ${msg}`)
    throw new ContractBreak(msg)
  }
}

// ================================================================ 真实数据
const mod = await import(pathToFileURL(resolve('src/data/words-entry.js')).href)
const words = mod.words
mustCond(Array.isArray(words) && words.length > 60000, `真实词库加载（${words && words.length} 词）`)
const byId = new Map(words.map((w) => [w.id, w]))

const index = buildIndex(morphemes, words)
const stemIndex = buildStemIndex(words)
const model = buildWordForms(words, index, stemIndex)
const ids = (arr) => arr.map((x) => x.id)

// 全部代表形（有被折叠子形的词）+ 全部被折叠形
const reps = []
const folded = []
for (const w of words) {
  if (w && typeof w.lemma === 'string' && w.lemma && w.lemma !== w.id) folded.push(w)
}
const repSet = new Set(folded.map((w) => w.lemma))
for (const r of repSet) reps.push(byId.get(r))
mustCond(folded.length > 5000, `词库含被折叠形 ${folded.length} 个`)
mustCond(reps.length > 5000, `涉及代表形 ${reps.length} 个（含缺失目标）`)

// ================================================================ ② 被折叠形反查
console.log('\n— ② formsOf(被折叠形)：返回同族其它词形（含代表形），不含自己')
{
  // 选一个真实存在的被折叠形
  const child = words.find((w) => w.form === 'abandoning' && w.lemma) || folded[0]
  mustCond(!!child && !!child.lemma, '找到了一个真实被折叠形')
  const fam = model.formsOf(child.id)
  ok(!ids(fam).includes(child.id), `★ formsOf(${child.form}) 不含自己`)
  ok(ids(fam).includes(child.lemma), `★ formsOf(${child.form}) 含其代表形 ${child.lemma}`)
  // 该族其它成员应都是折叠到同一代表的词（或代表形）
  const otherChildren = folded.filter((w) => w.lemma === child.lemma).map((w) => w.id)
  const expect = new Set([child.lemma, ...otherChildren].filter((id) => id !== child.id))
  const got = new Set(ids(fam))
  const notInFamily = ids(fam).filter((id) => !expect.has(id))
  ok(notInFamily.length === 0, `★ formsOf(被折叠形) 只返回同族成员（越界 ${notInFamily.length} 个）`)
  ok([...expect].every((id) => got.has(id)) || fam.length === FORMS_MAX, '同族成员均在列（或已达 cap）')

  // 全量：每个被折叠形，其 formsOf 必含代表形、不含自己
  let missRep = 0
  let selfIn = 0
  let n = 0
  for (const w of folded) {
    n += 1
    const f = model.formsOf(w.id)
    if (ids(f).includes(w.id)) selfIn += 1
    if (!ids(f).includes(w.lemma)) missRep += 1
  }
  ok(selfIn === 0, `★ 全量 ${n} 个被折叠形无一把自己列进变形（${selfIn} 例）`)
  ok(missRep === 0, `★ 全量 ${n} 个被折叠形的 formsOf 均含代表形（缺失 ${missRep} 例）`)
}

// ================================================================ ③ 全量零重叠（真词条驱动）
console.log('\n— ③ 全量：变形 ∩ 派生词 = ∅（用真词条对象，遍历全部代表形）')
{
  let overlap = 0
  let selfIn = 0
  let derNonEmpty = 0
  let formsNonEmpty = 0
  let processed = 0
  const worst = []
  for (const rep of reps) {
    if (!rep) continue // 悬空目标：由攻击⑤覆盖
    processed += 1
    const r = model.relatedFor(rep) // ← 真词条：带 morphs / form
    const formSet = new Set(ids(r.forms))
    if (r.forms.length > 0) formsNonEmpty += 1
    if (r.derivatives.length > 0) derNonEmpty += 1
    if (ids(r.derivatives).some((id) => formSet.has(id))) {
      overlap += 1
      if (worst.length < 5) worst.push(rep.id)
    }
    if (formSet.has(rep.id) || ids(r.derivatives).includes(rep.id)) selfIn += 1
  }
  console.log(`   代表形总数=${reps.length} 有变形=${formsNonEmpty} 有派生词=${derNonEmpty} 派生非空占比=${((derNonEmpty / processed) * 100).toFixed(1)}%`)
  ok(derNonEmpty > 0, `★ 派生词在真实数据上非空（${derNonEmpty} 个代表形有派生词）—— 证明重叠检查非空洞`)
  ok(overlap === 0, `★ 变形与派生词零重叠（${overlap} 例${worst.length ? '：' + worst.join(',') : ''}）`)
  ok(selfIn === 0, `★ 没有任何词把自己列进自己（${selfIn} 例）`)

  // 反向：工程师那份测试用 { id: rep } 会得到多少派生词？证明其空洞
  const hollowDer = model.relatedFor({ id: reps.find((r) => r) ? reps.find((r) => r).id : 'x' })
  const realOne = model.relatedFor(reps.find((r) => r))
  console.log(`   对照：relatedFor({id}) 派生词数=${hollowDer.derivatives.length}，relatedFor(真词条) 派生词数=${realOne.derivatives.length}`)
  ok(
    hollowDer.derivatives.length === 0 && realOne.derivatives.length >= 0,
    '★ 佐证：relatedFor({id:rep}) 因缺 form/morphs → 派生词恒空（工程师抽样口径空洞）',
  )
}

// ================================================================ ④ WeakMap 缓存失效
console.log('\n— ④ 缓存：内容不同 / 引用不同的两份数组不得互相污染')
{
  const A = [
    { id: 'w.a', form: 'aaa', gloss: 'g', morphs: [], freqRank: 1 },
    { id: 'w.ac', form: 'aac', gloss: 'g', lemma: 'w.a', morphs: [], freqRank: 2 },
  ]
  const B = [
    { id: 'w.b', form: 'bbb', gloss: 'g', morphs: [], freqRank: 1 },
    { id: 'w.bc', form: 'bbc', gloss: 'g', lemma: 'w.b', morphs: [], freqRank: 2 },
    { id: 'w.bc2', form: 'bbc2', gloss: 'g', lemma: 'w.b', morphs: [], freqRank: 3 },
  ]
  const iA = buildIndex([], A)
  const sA = buildStemIndex(A)
  const iB = buildIndex([], B)
  const sB = buildStemIndex(B)

  const mA = buildWordForms(A, iA, sA)
  const mB = buildWordForms(B, iB, sB)
  ok(mA !== mB, '两份不同 words → 不同模型（不误命中缓存）')
  ok(ids(mA.formsOf('w.a')).join(',') === 'w.ac', `模型 A 结果来自 A（${ids(mA.formsOf('w.a')).join(',')}）`)
  ok(ids(mB.formsOf('w.b')).join(',') === 'w.bc,w.bc2', `模型 B 结果来自 B（${ids(mB.formsOf('w.b')).join(',')}）`)
  ok(mB.formsOf('w.a').length === 0, '★ 模型 B 查不到 A 的词（未取到上一份缓存）')

  // 同内容但不同引用的两份数组 → 应各建各的（且结果一致）
  const A2 = A.map((w) => ({ ...w }))
  const iA2 = buildIndex([], A2)
  const sA2 = buildStemIndex(A2)
  const mA2 = buildWordForms(A2, iA2, sA2)
  ok(mA2 !== mA, '同内容不同引用 → 新模型（引用即键）')
  ok(ids(mA2.formsOf('w.a')).join(',') === ids(mA.formsOf('w.a')).join(','), '两份同内容模型结果一致')

  // 命中缓存：同引用三连 → 同一模型
  const mHit = buildWordForms(A, iA, sA)
  ok(mHit === mA, '同 (words,index,stemIndex) 引用 → 命中缓存返回同一模型')
  // index 变 → 失效
  const iA3 = buildIndex([], A)
  ok(buildWordForms(A, iA3, sA) !== mA, 'index 引用变化 → 缓存失效')
}

// ================================================================ ⑤ 坏引用：悬空 / 自环 / 成环 / 超长链
console.log('\n— ⑤ 坏数据：.lemma 悬空 / 自环 / 两跳成环 / 超长链 → 不崩、不死循环')
{
  function run(label, list) {
    const idx = buildIndex([], list)
    const sIdx = buildStemIndex(list)
    const t0 = Date.now()
    let m
    try {
      m = buildWordForms(list, idx, sIdx)
    } catch (e) {
      ok(false, `${label}：buildWordForms 抛错 ${e && e.message}`)
      return
    }
    // 对所有 id 跑一遍 formsOf / relatedFor，必须不抛错、有限时间
    let threw = null
    try {
      for (const w of list) {
        m.formsOf(w.id)
        m.relatedFor(w)
      }
      m.formsOf('不存在')
      m.relatedFor({ id: '不存在' })
    } catch (e) {
      threw = e
    }
    const dt = Date.now() - t0
    ok(!threw, `${label}：查询不抛错${threw ? '（实际 ' + threw.message + '）' : ''}`)
    ok(dt < 2000, `${label}：不挂起（耗时 ${dt}ms）`)
    return m
  }

  // 悬空：child.lemma 指向不存在 id
  const dangling = [
    { id: 'w.x', form: 'xform', gloss: 'g', morphs: [], freqRank: 1, lemma: 'w.missing' },
    { id: 'w.y', form: 'yform', gloss: 'g', morphs: [], freqRank: 2 },
  ]
  const m1 = run('悬空目标', dangling)
  ok(m1 && ids(m1.formsOf('w.x')).length === 0, '★ 悬空目标：formsOf(child) 返回空（不产生悬空引用）')

  // 自环：lemma === id
  const selfLoop = [
    { id: 'w.s', form: 'sform', gloss: 'g', morphs: [], freqRank: 1, lemma: 'w.s' },
    { id: 'w.t', form: 'tform', gloss: 'g', morphs: [], freqRank: 2 },
  ]
  const m2 = run('自环', selfLoop)
  ok(m2 && ids(m2.formsOf('w.s')).length === 0, '★ 自环：视作未折叠（formsOf 空，不把自己当族）')

  // 两跳成环：a.lemma=b, b.lemma=a
  const cycle = [
    { id: 'w.a', form: 'aform', gloss: 'g', morphs: [], freqRank: 1, lemma: 'w.b' },
    { id: 'w.b', form: 'bform', gloss: 'g', morphs: [], freqRank: 2, lemma: 'w.a' },
  ]
  const m3 = run('两跳成环', cycle)
  ok(m3 !== null, '★ 两跳成环：构建未崩、未死循环')
  // 坏数据下的可接受行为 = 有界（不递归扩散、不含自己）。实测：互列对方（含代表形注入所致）。
  const cycA = m3 ? ids(m3.formsOf('w.a')) : ['__err__']
  const cycB = m3 ? ids(m3.formsOf('w.b')) : ['__err__']
  ok(
    cycA.every((id) => id === 'w.b') && cycB.every((id) => id === 'w.a'),
    `★ 两跳成环：结果有界（formsOf(w.a)=[${cycA}] / formsOf(w.b)=[${cycB}]，不越界、不含自己）`,
  )
  ok(!cycA.includes('w.a') && !cycB.includes('w.b'), '★ 两跳成环：均不把自己列进自己的变形')

  // 三跳成环
  const cycle3 = [
    { id: 'w.a', form: 'aform', gloss: 'g', morphs: [], freqRank: 1, lemma: 'w.b' },
    { id: 'w.b', form: 'bform', gloss: 'g', morphs: [], freqRank: 2, lemma: 'w.c' },
    { id: 'w.c', form: 'cform', gloss: 'g', morphs: [], freqRank: 3, lemma: 'w.a' },
  ]
  const m4 = run('三跳成环', cycle3)
  ok(m4 !== null, '★ 三跳成环：构建未崩、未死循环')

  // 超长链：6 跳（> MAX_LEMMA_HOPS=4），终点是真实存在词
  const longChain = [
    { id: 'w.0', form: 'f0', gloss: 'g', morphs: [], freqRank: 1, lemma: 'w.1' },
    { id: 'w.1', form: 'f1', gloss: 'g', morphs: [], freqRank: 2, lemma: 'w.2' },
    { id: 'w.2', form: 'f2', gloss: 'g', morphs: [], freqRank: 3, lemma: 'w.3' },
    { id: 'w.3', form: 'f3', gloss: 'g', morphs: [], freqRank: 4, lemma: 'w.4' },
    { id: 'w.4', form: 'f4', gloss: 'g', morphs: [], freqRank: 5, lemma: 'w.5' },
    { id: 'w.5', form: 'f5', gloss: 'g', morphs: [], freqRank: 6 },
  ]
  const m5 = run('超长链(5跳)', longChain)
  ok(m5 !== null, '★ 超长链：构建未崩、未死循环（≤4 跳截断）')
  // 5 跳链：w.0 → ... → w.5，跳数=5 > 4 → 截断在 w.4，w.5 不被并入
  ok(m5 && ids(m5.formsOf('w.0')).includes('w.4'), '★ 超长链：被 4 跳上限截断（w.0 的代表止于 w.4）')
}

// ================================================================ 汇总
// 自检：QA_SELFTEST=1 注入一个必红断言，证明本脚本能失败（不是恒真空转）
if (process.env.QA_SELFTEST === '1') ok(false, '[自检] 注入的反例（应使脚本变红）')
console.log(`\n---------- [qa-wf-attack] 断言 ${total} 条 · 通过 ${pass} · 失败 ${fail} ----------\n`)
process.exit(fail === 0 ? 0 : 1)

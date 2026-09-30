/**
 * 语义关系单元测试：src/lib/relations.js + src/data/synants.js
 * 执行：npm run test:relations（已并入 test:all）
 *
 * 口径：
 *   - 关系一律**无向**：pairKey 排序后 a|b，两端邻接表各存一份。
 *   - 同一 type 同一 pair 重复出现只保留一条，保留 grade 最小者，note 用「；」去重拼接。
 *   - 同一 pair 既近义又反义 = **冲突**：只登记到 conflicts，**两边索引都不丢**。
 *   - grade 非法（缺失 / 0 / 99 / 'x' / null / 小数）一律回落 2；合法整数 1~3 原样保留。
 *   - 端点解析不到（或两端相同）→ 进 unresolved，且不写进任何索引。
 */
import { morphemes, words } from '../src/data/index.js'
import wordsMono from '../src/data/words-mono.js'
import wordsMonoExtra from '../src/data/words-mono-extra.js'
import wordsMonoSeed from '../src/data/words-mono-seed.js'

/** 全部无词素词（三份 mono 数据合并；旧断言曾只统计 words-mono） */
const wordsMonoAll = [...wordsMono, ...wordsMonoExtra, ...wordsMonoSeed]
import { ANTONYMS, SYNONYMS } from '../src/data/synants.js'
import {
  RELATION_META,
  buildRelations,
  pairKey,
  relationReport,
  relationsOf,
} from '../src/lib/relations.js'

let pass = 0
let fail = 0
const check = (name, fn) => {
  try {
    const r = fn()
    if (r === false) throw new Error('断言返回 false')
    pass++
    console.log(`  PASS  ${name}`)
  } catch (e) {
    fail++
    console.log(`  FAIL  ${name}\n        ${e.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed')
}
const eq = (actual, expected, msg) => {
  if (actual !== expected) throw new Error(`${msg || '值不符'}：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

// ---------------------------------------------------------------- 夹具

/** 最小可用词表：id / form / morphs / chain 齐备（兼容老代码遍历） */
const fixture = [
  { id: 'w.alpha', form: 'alpha', morphs: [], chain: [] },
  { id: 'w.beta', form: 'beta', morphs: [], chain: [] },
  { id: 'w.gamma', form: 'gamma', morphs: [], chain: [] },
  { id: 'w.Big', form: 'Big', morphs: [], chain: [] },
]
const idOf = (form) => fixture.find((w) => w.form.toLowerCase() === form.toLowerCase()).id

console.log(`数据规模：单词 ${words.length} · 词素 ${morphemes.length} · 无词素 ${wordsMonoAll.length}`)

// ---------------- RELATION_META ----------------

check('RELATION_META：近义绿 #16a34a / 虚线 7 5，反义红 #dc2626 / 点线 2 4', () => {
  eq(RELATION_META.synonym.color, '#16a34a', '近义色')
  eq(RELATION_META.synonym.dash, '7 5', '近义线型')
  eq(RELATION_META.antonym.color, '#dc2626', '反义色')
  eq(RELATION_META.antonym.dash, '2 4', '反义线型')
  assert(RELATION_META.synonym.color !== RELATION_META.antonym.color, '两类边颜色必须不同')
  assert(RELATION_META.synonym.dash !== RELATION_META.antonym.dash, '两类边线型必须不同')
})

check('RELATION_META：线宽 3 档，grade 越小线越粗', () => {
  ;['synonym', 'antonym'].forEach((type) => {
    const w = RELATION_META[type].width
    assert(Array.isArray(w) && w.length === 3, `${type} 线宽应为 3 档`)
    assert(w[0] > w[1] && w[1] > w[2], `${type} 线宽应随 grade 递减：${w.join()}`)
    w.forEach((x) => assert(x > 0, `${type} 线宽应为正数`))
  })
})

// ---------------- pairKey ----------------

check('pairKey：无向（两端顺序不影响结果）', () => {
  eq(pairKey('a', 'b'), 'a|b', '字典序在前')
  eq(pairKey('b', 'a'), 'a|b', '字典序在后')
  eq(pairKey('a', 'b'), pairKey('b', 'a'), '必须无向')
  eq(pairKey('w.beta', 'w.alpha'), 'w.alpha|w.beta', '端点为 id 时同样排序')
  eq(pairKey('same', 'same'), 'same|same', '自环 pairKey')
})

// ---------------- 去重 ----------------

check('去重：同一 type 同一 pair 重复 3 次 → 只留 1 条，duplicates = 2', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 3, note: '甲；乙' },
      { a: 'w.beta', b: 'w.alpha', grade: 1, note: '乙；丙' },
      { a: 'alpha', b: 'beta', grade: 2, note: '丙' },
    ],
  })
  eq(index.stats.synonymPairs, 1, '去重后近义对数')
  eq(index.duplicates, 2, 'duplicates 计数')
  eq(index.stats.duplicates, 2, 'stats.duplicates 计数')
  eq(index.syn.get('w.alpha').length, 1, 'alpha 的近义邻居数')
  eq(index.syn.get('w.beta').length, 1, 'beta 的近义邻居数')
})

check('去重：保留 grade 最小者（3 / 1 / 2 → 1）', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 3 },
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
      { a: 'w.alpha', b: 'w.beta', grade: 2 },
    ],
  })
  const neighbor = index.syn.get('w.alpha')[0]
  eq(neighbor.grade, 1, '保留的 grade')
  eq(index.syn.get('w.beta')[0].grade, 1, '对端 grade 同步')
})

check('去重：note 按「；」拆分去重后拼接（甲；乙 + 乙；丙 + 丙 → 甲；乙；丙）', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 1, note: '甲；乙' },
      { a: 'w.alpha', b: 'w.beta', grade: 1, note: '乙；丙' },
      { a: 'w.alpha', b: 'w.beta', grade: 1, note: '丙' },
    ],
  })
  eq(index.syn.get('w.alpha')[0].note, '甲；乙；丙', '拼接后的 note')
})

check('去重：只在同一 type 内生效（近义 / 反义各自独立计数）', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
    ],
    antonyms: [
      { a: 'w.alpha', b: 'w.gamma', grade: 1 },
      { a: 'w.alpha', b: 'w.gamma', grade: 1 },
    ],
  })
  eq(index.duplicates, 2, '两类各去重 1 次')
  eq(index.stats.synonymPairs, 1, '近义对数')
  eq(index.stats.antonymPairs, 1, '反义对数')
})

// ---------------- 无向 ----------------

check('无向：syn.get(a) 含 b、syn.get(b) 含 a（双向建索引）', () => {
  const index = buildRelations(fixture, { synonyms: [{ a: 'w.alpha', b: 'w.beta', grade: 2 }] })
  const a = index.syn.get('w.alpha')
  const b = index.syn.get('w.beta')
  assert(Array.isArray(a) && Array.isArray(b), '两端都要有邻接数组')
  eq(a[0].id, 'w.beta', 'a → b')
  eq(a[0].form, 'beta', 'a → b 带 form')
  eq(b[0].id, 'w.alpha', 'b → a')
  eq(b[0].form, 'alpha', 'b → a 带 form')
  eq(relationsOf(index, 'w.alpha').synonyms[0].id, 'w.beta', 'relationsOf(a).synonyms')
  eq(relationsOf(index, 'w.beta').synonyms[0].id, 'w.alpha', 'relationsOf(b).synonyms')
})

check('无向：反义同样双向，且不与近义混用', () => {
  const index = buildRelations(fixture, { antonyms: [{ a: 'w.alpha', b: 'w.gamma', grade: 1 }] })
  eq(relationsOf(index, 'w.alpha').antonyms[0].id, 'w.gamma', 'alpha 的反义词')
  eq(relationsOf(index, 'w.gamma').antonyms[0].id, 'w.alpha', 'gamma 的反义词')
  eq(relationsOf(index, 'w.alpha').synonyms.length, 0, '反义不进近义表')
})

check('端点解析：先按 id 命中，再按不区分大小写的完整词形命中', () => {
  const byForm = buildRelations(fixture, { synonyms: [{ a: 'alpha', b: 'BETA', grade: 2 }] })
  eq(byForm.stats.synonymPairs, 1, '词形大小写不敏感')
  eq(relationsOf(byForm, idOf('alpha')).synonyms[0].id, idOf('beta'), 'form 解析到同一个词')
  const byId = buildRelations(fixture, { synonyms: [{ a: 'w.Big', b: 'w.alpha', grade: 2 }] })
  eq(byId.stats.synonymPairs, 1, 'id 命中')
  eq(relationsOf(byId, 'w.Big').synonyms[0].id, 'w.alpha', 'id 优先命中')
})

// ---------------- 冲突 ----------------

check('冲突：同一 pair 同时进近义与反义 → conflicts 1 条，字段正确', () => {
  const index = buildRelations(fixture, {
    synonyms: [{ a: 'w.alpha', b: 'w.beta', grade: 1 }],
    antonyms: [{ a: 'w.beta', b: 'w.alpha', grade: 3 }],
  })
  eq(index.conflicts.length, 1, '冲突条数')
  eq(index.stats.conflicts, 1, 'stats.conflicts')
  const c = index.conflicts[0]
  eq(c.pairKey, 'w.alpha|w.beta', '冲突 pairKey')
  eq(c.aForm, 'alpha', 'aForm')
  eq(c.bForm, 'beta', 'bForm')
  eq(c.synGrade, 1, 'synGrade')
  eq(c.antGrade, 3, 'antGrade')
})

check('冲突：两边索引都还能查到（不丢数据）', () => {
  const index = buildRelations(fixture, {
    synonyms: [{ a: 'w.alpha', b: 'w.beta', grade: 1 }],
    antonyms: [{ a: 'w.alpha', b: 'w.beta', grade: 3 }],
  })
  eq(index.stats.synonymPairs, 1, '近义仍保留')
  eq(index.stats.antonymPairs, 1, '反义仍保留')
  eq(relationsOf(index, 'w.alpha').synonyms.length, 1, 'alpha 近义不丢')
  eq(relationsOf(index, 'w.alpha').antonyms.length, 1, 'alpha 反义不丢')
  eq(relationsOf(index, 'w.beta').synonyms.length, 1, 'beta 近义不丢')
  eq(relationsOf(index, 'w.beta').antonyms.length, 1, 'beta 反义不丢')
})

check('冲突清单按 pairKey 字典序排序（报告稳定可比对）', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.gamma', b: 'w.alpha', grade: 2 },
      { a: 'w.alpha', b: 'w.beta', grade: 2 },
    ],
    antonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 3 },
      { a: 'w.gamma', b: 'w.alpha', grade: 3 },
    ],
  })
  eq(index.conflicts.length, 2, '冲突条数')
  const keys = index.conflicts.map((c) => c.pairKey)
  eq(keys.join(','), [...keys].sort().join(','), '应已排序')
})

// ---------------- 未解析 ----------------

check('未解析：引用不存在的 id / form → 进 unresolved，不进索引', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.nope', grade: 1 },
      { a: 'nope', b: 'w.beta', grade: 1 },
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
    ],
  })
  eq(index.unresolved.length, 2, '未解析条数')
  eq(index.stats.unresolved, 2, 'stats.unresolved')
  eq(index.stats.synonymPairs, 1, '只有能解析的那条成边')
  index.unresolved.forEach((u) => {
    eq(u.type, 'synonym', '未解析条目带 type')
    assert(Number.isInteger(u.index), '未解析条目带原始下标')
    eq(u.reason, '端点无法解析', '未解析原因')
  })
  assert(!index.syn.has('w.nope'), '不存在的端点不进索引')
  assert(!index.syn.has('nope'), '不存在的词形不进索引')
})

check('未解析：两端相同（自反）也算未解析，且不成边', () => {
  const index = buildRelations(fixture, {
    synonyms: [{ a: 'w.alpha', b: 'w.alpha', grade: 1 }],
    antonyms: [{ a: 'alpha', b: 'w.alpha', grade: 1 }],
  })
  eq(index.unresolved.length, 2, '两条自反都被拦下')
  index.unresolved.forEach((u) => eq(u.reason, '关系端点相同', '自反原因'))
  eq(index.stats.synonymPairs, 0, '近义未成边')
  eq(index.stats.antonymPairs, 0, '反义未成边')
  eq(index.syn.size, 0, '邻接表为空')
})

check('未解析：脏数据（null / 字符串 / 缺字段）不抛错，统一进 unresolved', () => {
  const index = buildRelations(fixture, {
    synonyms: [null, 'alpha', {}, { a: null, b: 'w.beta' }, { a: 'w.alpha' }],
  })
  eq(index.unresolved.length, 5, '5 条脏数据全部进 unresolved')
  eq(index.stats.synonymPairs, 0, '没有成边')
})

// ---------------- grade 归一化 ----------------

check('grade 归一：合法整数 1 / 2 / 3 原样保留', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
      { a: 'w.alpha', b: 'w.gamma', grade: 3 },
    ],
  })
  const grades = index.syn.get('w.alpha').map((n) => `${n.id}:${n.grade}`).sort()
  eq(grades.join(','), 'w.beta:1,w.gamma:3', 'grade 原样')
})

check('grade 归一：缺失 / 0 / 99 / "x" / null / 小数 / 负数 → 一律回落 2', () => {
  const bad = [undefined, 0, 99, 'x', null, 1.5, -1, NaN, {}, []]
  bad.forEach((grade, i) => {
    const index = buildRelations(fixture, {
      synonyms: [{ a: 'w.alpha', b: 'w.beta', grade }],
    })
    eq(index.syn.get('w.alpha')[0].grade, 2, `grade=${JSON.stringify(grade)}（第 ${i + 1} 项）应回落 2`)
  })
})

check('grade 归一：字符串数字 "1" / "3" 按数值处理', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.beta', grade: '1' },
      { a: 'w.alpha', b: 'w.gamma', grade: '3' },
    ],
  })
  const grades = index.syn.get('w.alpha').map((n) => `${n.id}:${n.grade}`).sort()
  eq(grades.join(','), 'w.beta:1,w.gamma:3', '字符串数字应被解析')
})

check('邻接表排序：grade 小的在前，同档按词形', () => {
  const index = buildRelations(fixture, {
    synonyms: [
      { a: 'w.alpha', b: 'w.gamma', grade: 3 },
      { a: 'w.alpha', b: 'w.beta', grade: 1 },
    ],
  })
  eq(index.syn.get('w.alpha').map((n) => n.id).join(','), 'w.beta,w.gamma', 'grade 1 排在 grade 3 前')
})

// ---------------- 向后兼容 / 鲁棒 ----------------

check('向后兼容：buildRelations(words) / (words, {}) 不抛错且返回空结构', () => {
  ;[undefined, {}, { synonyms: null, antonyms: null }, null, 'nope'].forEach((raw, i) => {
    const index = buildRelations(words, raw)
    assert(index && index.syn instanceof Map && index.ant instanceof Map, `raw=${i} 应返回 Map 索引`)
    eq(index.stats.synonymPairs, 0, `raw=${i} 近义应为 0`)
    eq(index.stats.antonymPairs, 0, `raw=${i} 反义应为 0`)
    eq(index.conflicts.length, 0, `raw=${i} 冲突应为 0`)
    eq(index.unresolved.length, 0, `raw=${i} 未解析应为 0`)
    eq(index.pairs.length, 0, `raw=${i} pairs 应为空`)
  })
  const bare = buildRelations()
  assert(bare.syn instanceof Map && bare.stats.synonymPairs === 0, '无参调用也应安全')
  const junk = buildRelations('nope', 'nope')
  assert(junk.syn instanceof Map && junk.syn.size === 0, '脏输入不应抛错')
})

check('向后兼容：relationsOf 对空索引 / 缺失 id 返回空数组', () => {
  eq(relationsOf(null, 'w.alpha').synonyms.length, 0, 'index 为 null')
  eq(relationsOf(buildRelations(words), null).antonyms.length, 0, 'wordId 为 null')
  eq(relationsOf({}, 'w.alpha').synonyms.length, 0, 'index 非关系索引')
})

check('向后兼容：全库每个单词的 morphs / chain 都是数组（老代码 w.morphs.forEach 不炸）', () => {
  words.forEach((w, i) => {
    assert(Array.isArray(w.morphs), `words[${i}](${w.id}) morphs 不是数组：${typeof w.morphs}`)
    assert(Array.isArray(w.chain), `words[${i}](${w.id}) chain 不是数组：${typeof w.chain}`)
    w.chain.forEach((step) => assert(step && typeof step.form === 'string', `words[${i}](${w.id}) chain 步骤缺 form`))
  })
})

check('无词素词：morphless / pos / gloss / origin / kind 齐备，且 morphs 与 chain 为空数组', () => {
  const list = words.filter((w) => w.morphless === true)
  eq(list.length, wordsMonoAll.length, '无词素词数量应等于三份 mono 数据之和')
  const kinds = new Set(['mono', 'loan', 'proper', 'phrase'])
  list.forEach((w) => {
    eq(w.morphs.length, 0, `${w.id} morphs 应为空数组`)
    eq(w.chain.length, 0, `${w.id} chain 应为空数组`)
    assert(typeof w.pos === 'string' && w.pos.trim(), `${w.id} 缺 pos`)
    assert(typeof w.gloss === 'string' && w.gloss.trim(), `${w.id} 缺 gloss`)
    assert(typeof w.origin === 'string' && w.origin.trim(), `${w.id} 缺 origin`)
    assert(kinds.has(w.kind), `${w.id} kind 非法：${w.kind}`)
    assert(Number.isInteger(w.freqRank) && w.freqRank > 0, `${w.id} freqRank 非法`)
  })
  const byKind = list.reduce((acc, w) => ({ ...acc, [w.kind]: (acc[w.kind] || 0) + 1 }), {})
  console.log(`        无词素分类：${JSON.stringify(byKind)}`)
  eq(byKind.mono + byKind.loan + byKind.proper + byKind.phrase, list.length, '四类之和')
})

check('全库 id 唯一、form 唯一（大小写不敏感）', () => {
  const ids = new Set()
  const forms = new Set()
  words.forEach((w) => {
    assert(!ids.has(w.id), `id 重复：${w.id}`)
    ids.add(w.id)
    const key = String(w.form).toLowerCase()
    assert(!forms.has(key), `form 重复（忽略大小写）：${w.form}`)
    forms.add(key)
  })
  eq(ids.size, words.length, 'id 去重数')
  eq(forms.size, words.length, 'form 去重数')
})

check('pairs：带 type 标记，数量 = 近义 + 反义', () => {
  const index = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
  eq(index.pairs.length, index.stats.synonymPairs + index.stats.antonymPairs, 'pairs 总数')
  const types = new Set(index.pairs.map((p) => p.type))
  assert(types.has('synonym') && types.has('antonym'), 'pairs 应含两类 type')
  index.pairs.forEach((p) => {
    assert(p.grade >= 1 && p.grade <= 3, `pair ${p.pairKey} grade 越界：${p.grade}`)
    assert(typeof p.aForm === 'string' && typeof p.bForm === 'string', `pair ${p.pairKey} 缺词形`)
  })
})

check('opts.freeze：stats 被冻结（防止调用方误改统计）', () => {
  const index = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS }, { freeze: true })
  assert(Object.isFrozen(index.stats), 'stats 应被 Object.freeze')
  const loose = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
  assert(!Object.isFrozen(loose.stats), '默认不应冻结')
})

// ---------------- 真实数据 ----------------

const realIndex = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
const report = relationReport(realIndex, words)

check('真实数据：未解析 0 条（synants 里每个端点都能落到词条）', () => {
  eq(report.unresolved, 0, '未解析数')
  eq(realIndex.unresolved.length, 0, 'unresolved 数组长度')
})

check('真实数据：冲突 5 条，且是 big↔large / debt↔loan / glad↔happy / laugh↔smile / open↔start', () => {
  eq(report.conflicts.length, 5, '冲突数')
  const forms = realIndex.conflicts.map((c) => `${c.aForm}↔${c.bForm}`).sort()
  eq(
    forms.join(' | '),
    ['big↔large', 'debt↔loan', 'glad↔happy', 'laugh↔smile', 'open↔start'].sort().join(' | '),
    '冲突清单',
  )
  realIndex.conflicts.forEach((c) => {
    assert(c.synGrade >= 1 && c.synGrade <= 3, `${c.pairKey} synGrade 越界`)
    assert(c.antGrade >= 1 && c.antGrade <= 3, `${c.pairKey} antGrade 越界`)
    // 冲突对必须在两边索引里都还在
    assert(relationsOf(realIndex, c.a).synonyms.some((n) => n.id === c.b), `${c.pairKey} 近义丢失`)
    assert(relationsOf(realIndex, c.a).antonyms.some((n) => n.id === c.b), `${c.pairKey} 反义丢失`)
  })
})

check('真实数据：stats.synonymPairs / antonymPairs 与 relation-report 输出一致', () => {
  eq(report.synonymPairs, 8725, '近义关系数')
  eq(report.antonymPairs, 2856, '反义关系数')
  eq(report.duplicates, 262, '去重数')
  eq(report.synonymPairs, realIndex.stats.synonymPairs, 'stats 与 report 同口径')
  eq(report.antonymPairs, realIndex.stats.antonymPairs, 'stats 与 report 同口径')
  eq(report.morphlessTotal, wordsMonoAll.length, '无词素词总数')
  eq(report.wordTotal, words.length, '全库词条数')
})

check('真实数据：索引双向自洽（每条边的两端互相可见，且不出现自环）', () => {
  let edges = 0
  realIndex.syn.forEach((neighbors, id) => {
    neighbors.forEach((n) => {
      assert(n.id !== id, `出现自环：${id}`)
      const back = realIndex.syn.get(n.id) || []
      assert(back.some((x) => x.id === id), `近义边不双向：${id} → ${n.id}`)
      edges += 1
    })
  })
  eq(edges, realIndex.stats.synonymPairs * 2, '近义边双向计数 = 对数 × 2')
  let antEdges = 0
  realIndex.ant.forEach((neighbors, id) => {
    neighbors.forEach((n) => {
      assert(n.id !== id, `反义出现自环：${id}`)
      const back = realIndex.ant.get(n.id) || []
      assert(back.some((x) => x.id === id), `反义边不双向：${id} → ${n.id}`)
      antEdges += 1
    })
  })
  eq(antEdges, realIndex.stats.antonymPairs * 2, '反义边双向计数 = 对数 × 2')
})

check('真实数据：big 至少有近义邻居，且能查到 large（冲突对不丢）', () => {
  const big = words.find((w) => w.form === 'big')
  assert(big, '全库应存在 big')
  const rel = relationsOf(realIndex, big.id)
  assert(rel.synonyms.length > 0, `big 应有近义词（实际 ${rel.synonyms.length}）`)
  assert(rel.antonyms.length > 0, `big 应有反义词（实际 ${rel.antonyms.length}）`)
  assert(rel.synonyms.some((n) => n.form === 'large'), 'big 的近义里应有 large')
  assert(rel.antonyms.some((n) => n.form === 'large'), 'big 的反义里也应有 large（冲突对两边保留）')
  rel.synonyms.forEach((n) => assert(n.grade >= 1 && n.grade <= 3, `grade 越界：${n.grade}`))
})

check('relationReport：空索引 / 脏输入也能安全出报告', () => {
  const empty = relationReport(null, words)
  eq(empty.synonymPairs, 0, '空索引近义 0')
  eq(empty.conflicts.length, 0, '空索引冲突 0')
  eq(empty.wordTotal, words.length, 'wordTotal 仍是全库数')
  const dirty = relationReport({}, [])
  eq(dirty.wordTotal, 0, '空词表 wordTotal')
})

console.log(`\n---------- 关系测试汇总：PASS=${pass}  FAIL=${fail} ----------\n`)
if (fail > 0) process.exit(1)

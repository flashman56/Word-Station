/**
 * 「常见变形 / 派生词」反查模型的对抗性验证（纯函数层）
 * ------------------------------------------------------------------
 * 跑：npm run test:word-forms
 *
 * ★ 为什么不止测「能返回」★
 *   本模块的失败模式是**静默错答**：把「派生词」也塞进「常见变形」、把被折叠形
 *   当成独立词族、或把当前词自己列进自己的变形 —— 这些都不会抛错，只会让用户
 *   在学习卡上看到错的词。所以断言锚定**精确集合 + 精确顺序 + 精确排除**，
 *   并用一份独立推导（不调用本模块）做全量对账。
 *
 * ★ 三层验证 ★
 *   ① 合成夹具：精确断言排序 / 排除 / cap / 缓存失效。
 *   ② 源码卫生（对抗性）：UI 侧文件不得静态 import 词库数据、不得引入 `wrc.` 字面量。
 *   ③ 真实数据对账：拿全量词库独立重算族成员数，逐族比对 formsOf 的长度。
 */
import { pathToFileURL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import morphemes from '../src/data/morphemes.js'
import { buildIndex } from '../src/lib/derive.js'
import { buildStemIndex } from '../src/lib/stemFamily.js'
import { isFolded } from '../src/lib/lemmaFold.js'
import { FORMS_BY_ID } from '../src/data/words-forms.js'
import { LEMMA_BY_ID } from '../src/data/words-lemma.js'
import { buildWordForms, FORMS_MAX, DERIVATIVES_MAX, firstGloss } from '../src/lib/wordForms.js'

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

// ================================================================ 夹具

const MORPHS = [
  { id: 'm.don', type: 'root', origin: 'latin', form: 'don', display: 'don', gloss: '给' },
  { id: 'm.ment', type: 'suffix', origin: 'latin', form: '-ment', display: '-ment', gloss: '名词后缀' },
  { id: 'm.er', type: 'suffix', origin: 'latin', form: '-er', display: '-er', gloss: '人/物' },
  { id: 'm.rand', type: 'root', origin: 'other', form: 'rand', display: 'rand', gloss: '随机' },
]

/** 合成词条：rank 越小越常见 */
const W = [
  { id: 'w.abandon', form: 'abandon', gloss: '放弃', morphs: ['m.don'], chain: [{ form: 'abandon', gloss: '放弃' }], freqRank: 1200, cefr: 'B1' },
  { id: 'w.abandoned', form: 'abandoned', gloss: '放弃', lemma: 'w.abandon', morphs: [], chain: [], freqRank: 2500, cefr: 'B1' },
  { id: 'w.abandoning', form: 'abandoning', gloss: '放弃', lemma: 'w.abandon', morphs: [], chain: [], freqRank: 3000, cefr: 'B1' },
  { id: 'w.abandons', form: 'abandons', gloss: '放弃', lemma: 'w.abandon', morphs: [], chain: [], freqRank: 4000, cefr: 'B1' },
  { id: 'w.abandonment', form: 'abandonment', gloss: '放弃；抛弃', morphs: ['m.don', 'm.ment'], chain: [{ form: 'abandon', gloss: '放弃' }], freqRank: 5000, cefr: 'B2' },
  { id: 'w.abandoner', form: 'abandoner', gloss: '放弃者', morphs: ['m.don', 'm.er'], chain: [{ form: 'abandon', gloss: '放弃' }], freqRank: 6000, cefr: 'C1' },
  // 与 abandonment 共享**两个**词素（m.don + m.ment）→ 派生排序应排第一
  { id: 'w.abandonderiv', form: 'abandonderiv', gloss: '放弃（合成测试词）', morphs: ['m.don', 'm.ment'], chain: [{ form: 'abandon', gloss: '放弃' }], freqRank: 7000, cefr: 'C1' },
  { id: 'w.don', form: 'don', gloss: '穿上', morphs: ['m.don'], chain: [{ form: 'don', gloss: '穿上' }], freqRank: 800, cefr: 'A2' },
  { id: 'w.random', form: 'random', gloss: '随机的', morphs: ['m.rand'], chain: [{ form: 'random', gloss: '随机' }], freqRank: 1500, cefr: 'B1' },
  // 无词素：走 familyOf 按词形反查
  { id: 'w.determined', form: 'determined', gloss: '坚决的', morphs: [], chain: [], morphless: true, kind: 'loan', freqRank: 2000, cefr: 'B1', formRep: 'w.determine' },
  { id: 'w.determination', form: 'determination', gloss: '决心', morphs: ['m.rand'], chain: [{ form: 'determin', gloss: '决定' }], freqRank: 2200, cefr: 'B2' },
  // 只有 formRep、没有 lemma 的代表形（determined 的展示代表形，本身不被折叠）
  { id: 'w.determine', form: 'determine', gloss: '决定', morphs: [], chain: [], freqRank: 1500, cefr: 'B1' },
  // ★ 展示表与折叠表**给出不同代表形**时：展示用 formRep，折叠仍用 lemma ★
  { id: 'w.mixed', form: 'mixed', gloss: '混合的', morphs: [], chain: [], freqRank: 1800, cefr: 'B1', lemma: 'w.mixA', formRep: 'w.mixB' },
  { id: 'w.mixA', form: 'mixA', gloss: 'A 侧代表形', morphs: [], chain: [], freqRank: 1600, cefr: 'B1' },
  { id: 'w.mixB', form: 'mixB', gloss: 'B 侧代表形', morphs: [], chain: [], freqRank: 1700, cefr: 'B1' },
]
// 14 个折叠形 → 验证 FORMS_MAX 截断
for (let i = 0; i < 14; i += 1) {
  W.push({ id: `w.big${i}`, form: `bigform${i}`, gloss: '大', lemma: 'w.big', morphs: [], chain: [], freqRank: 10000 + i })
}
W.push({ id: 'w.big', form: 'bigform', gloss: '大', morphs: [], chain: [], freqRank: 9000 })

function buildIndexes(list) {
  const index = buildIndex(MORPHS, list)
  const stemIndex = buildStemIndex(list)
  return { index, stemIndex }
}
const { index: IDX, stemIndex: SIDX } = buildIndexes(W)
const model = buildWordForms(W, IDX, SIDX)

const ids = (arr) => arr.map((x) => x.id)

// ================================================================ ① 常见变形

function caseForms() {
  console.log('\n— ① formsOf：族内成员、排序、排除自身')

  const fromRep = model.formsOf('w.abandon')
  ok(
    ids(fromRep).join(',') === 'w.abandoned,w.abandoning,w.abandons',
    `★ formsOf(代表形) = 三个屈折形、按词频升序（实际 ${ids(fromRep).join(',')}）`,
  )
  ok(!ids(fromRep).includes('w.abandon'), '★ 不含自身（代表形不列进自己的变形）')
  ok(!ids(fromRep).includes('w.abandonment'), '★ 不含派生词（abandonment 不是屈折形）')

  const fromFolded = model.formsOf('w.abandoning')
  ok(
    ids(fromFolded).join(',') === 'w.abandon,w.abandoned,w.abandons',
    `★ formsOf(被折叠形) = 代表形 + 兄弟形、按词频升序（实际 ${ids(fromFolded).join(',')}）`,
  )
  ok(!ids(fromFolded).includes('w.abandoning'), '★ 不含自身')

  ok(model.formsOf('w.random').length === 0, '无折叠关系的词 → 变形为空')
  ok(model.formsOf('不存在').length === 0, '未知 id → 变形为空（不抛错）')
  ok(model.formsOf(undefined).length === 0, 'undefined → 变形为空（不抛错）')

  const bigForms = model.formsOf('w.big')
  ok(bigForms.length === FORMS_MAX, `★ 族成员 14 个 → 截断到 FORMS_MAX=${FORMS_MAX}（实际 ${bigForms.length}）`)
  ok(bigForms[0].id === 'w.big0', 'cap 后保留的是词频最低的若干（bigform0 首位）')
}

// ================================================================ ② 派生词

function caseDerivatives() {
  console.log('\n— ② derivativesOf：共享词素、排序、排除')

  const der = model.derivativesOf(W.find((w) => w.id === 'w.abandonment'))
  // abandonment 有 m.don / m.ment：abandonderiv 共享二者(2)，abandon/don/abandoner 各共享其一(1)
  ok(der.length > 0, '派生词非空')
  ok(der[0].id === 'w.abandonderiv', `★ 共享 2 个词素的词排第一（实际 ${der[0] ? der[0].id : '—'}）`)
  ok(ids(der).includes('w.abandon') && ids(der).includes('w.don'), '共享 1 个词素的词均在列')
  ok(!ids(der).includes('w.abandonment'), '★ 不含自身')
  ok(!ids(der).includes('w.random'), '不共享词素的词不在列')

  const capped = model.derivativesOf(W.find((w) => w.id === 'w.abandonment'), { cap: 1 })
  ok(capped.length === 1, `cap=1 生效（实际 ${capped.length}）`)

  const excluded = model.derivativesOf(W.find((w) => w.id === 'w.abandonment'), {
    excludeIds: ['w.abandoner', 'w.don'],
  })
  ok(!ids(excluded).includes('w.abandoner') && !ids(excluded).includes('w.don'), '★ excludeIds 生效')

  // 无词素 → familyOf 按词形反查
  const morphless = model.derivativesOf(W.find((w) => w.id === 'w.determined'))
  ok(ids(morphless).includes('w.determination'), `★ 无词素词按词形反查到 determination（实际 ${ids(morphless).join(',')}）`)
  ok(!ids(morphless).includes('w.determined'), '无词素词不含自身')

  ok(model.derivativesOf(null).length === 0, 'null → 派生词为空（不抛错）')
}

// ================================================================ ③ relatedFor 去重链

function caseRelatedFor() {
  console.log('\n— ③ relatedFor：变形与派生词互不重复')

  const r = model.relatedFor(W.find((w) => w.id === 'w.abandon'))
  ok(ids(r.forms).join(',') === 'w.abandoned,w.abandoning,w.abandons', 'forms 正确')
  const formSet = new Set(ids(r.forms))
  ok(!ids(r.derivatives).some((id) => formSet.has(id)), '★ 派生词不含任何变形（排除链生效）')
  ok(!ids(r.derivatives).includes('w.abandon'), '★ 派生词不含自身')
  ok(ids(r.derivatives).includes('w.don'), '派生词含共享词素的 don')
  ok(
    !ids(r.derivatives).includes('w.abandoning'),
    '派生词不含被折叠形（虽与 abandon 无共享词素，双重保障）',
  )

  const empty = model.relatedFor(undefined)
  ok(empty.forms.length === 0 && empty.derivatives.length === 0, 'undefined → 两段皆空（结构完整）')
}

// ================================================================ ⑤ formRep（展示表）

function caseFormRep() {
  console.log('\n— ⑤ formRep：展示表优先、折叠不动')

  // 只有 formRep、没有 lemma：词照样能进族（determined → determine）
  const fromRep = model.formsOf('w.determine')
  ok(ids(fromRep).includes('w.determined'), `★ 只有 formRep 的词进族：formsOf(determine) 含 determined（实际 ${ids(fromRep).join(',')}）`)
  const fromInfl = model.formsOf('w.determined')
  ok(ids(fromInfl).includes('w.determine'), '★ 反向也能查到代表形（所有单词有的话都要做）')
  ok(!isFolded(W.find((w) => w.id === 'w.determined')), '★ determined 的折叠身份不变（isFolded=false，仍是独立学习单元）')

  // 两张表给出不同代表形时：展示跟 formRep，折叠仍跟 lemma
  const mixed = model.formsOf('w.mixed')
  ok(ids(mixed).join(',') === 'w.mixB', `★ formRep 优先：formsOf(mixed) = [mixB]（实际 ${ids(mixed).join(',')}）`)
  ok(!ids(mixed).includes('w.mixA'), '★ 折叠侧的 mixA 不出现在展示族里')
  ok(model.formsOf('w.mixA').length === 0, '★ mixA 自己没有展示族（没人指向它）')
  const mixedWord = W.find((w) => w.id === 'w.mixed')
  ok(isFolded(mixedWord) && mixedWord.lemma === 'w.mixA', '★ 但 mixed 的**折叠**仍指向 mixA（展示改了、折叠没改）')
}

// ================================================================ ⑥ 缓存

function caseCache() {
  console.log('\n— ④ 缓存：同引用复用、索引变更即失效')

  const m1 = buildWordForms(W, IDX, SIDX)
  const m2 = buildWordForms(W, IDX, SIDX)
  ok(m1 === m2, '相同 (words, index, stemIndex) 引用 → 返回同一模型（命中缓存）')

  const IDX2 = buildIndex(MORPHS, W)
  const m3 = buildWordForms(W, IDX2, SIDX)
  ok(m3 !== m1, '★ index 引用变化 → 缓存失效、重建（不会取到旧索引）')

  const W2 = W.map((w) => ({ ...w }))
  const m4 = buildWordForms(W2, IDX, SIDX)
  ok(m4 !== m1, '★ words 引用变化 → 缓存失效、重建')
}

// ================================================================ ⑤ 源码卫生（对抗性）

function caseSourceHygiene() {
  console.log('\n— ⑤ 源码卫生：UI 侧不得静态 import 词库 / 不得出现 wrc. 字面量')

  const uiFiles = [
    'src/lib/wordForms.js',
    'src/components/WordForms.jsx',
    'src/components/StudyCard.jsx',
    'src/components/StudySession.jsx',
    'src/App.jsx',
  ]
  const staticWordsImport = /import\s+[^;\n]*from\s+['"][^'"]*data\/words-/
  for (const f of uiFiles) {
    const src = readFileSync(resolve(f), 'utf8')
    ok(!staticWordsImport.test(src), `★ ${f} 无「静态 import 词库数据」`)
    ok(!/wrc\./.test(src), `★ ${f} 无 wrc. 字面量`)
  }
  // App.jsx 允许「动态 import」词库（首屏不下载词库的关键），这里确认它确实存在
  ok(
    /import\(\s*['"][^'"]*data\/words-entry\.js['"]\s*\)/.test(readFileSync(resolve('src/App.jsx'), 'utf8')),
    'App.jsx 仍以动态 import 加载词库入口（首屏不拖 28MB）',
  )

  // wordForms.js 不得依赖 React / DOM / 存储
  const lib = readFileSync(resolve('src/lib/wordForms.js'), 'utf8')
  ok(!/from\s+['"]react['"]/.test(lib), '★ lib/wordForms.js 不依赖 React')
  ok(!/\bdocument\b|\bwindow\b|localStorage|indexedDB/i.test(lib), '★ lib/wordForms.js 不碰 DOM / 存储')

  ok(firstGloss('放弃；抛弃') === '放弃', `firstGloss 取首个义项（实际 ${firstGloss('放弃；抛弃')}）`)
  ok(firstGloss('a, b; c') === 'a', 'firstGloss 兼容英文分隔符')
  ok(firstGloss(undefined) === '', 'firstGloss 容错 undefined')
}

// ================================================================ ⑥ 真实数据对账

async function caseRealData() {
  console.log('\n— ⑥ 真实数据对账（独立重算族成员数）')
  const mod = await import(pathToFileURL(resolve('src/data/words-entry.js')).href)
  const words = mod.words
  ok(Array.isArray(words) && words.length > 60000, `真实词库已加载（${words.length} 词）`)

  const index = buildIndex(morphemes, words)
  const stemIndex = buildStemIndex(words)
  const real = buildWordForms(words, index, stemIndex)

  // 独立推导：不调用本模块，直接读两张补丁表（FORMS_BY_ID / LEMMA_BY_ID）重算
  // 每个展示代表形的成员数（口径与 repField 一致：formRep 优先、lemma 回退）。
  // ★ 同时并数「仅按折叠表」的成员数，用于证明**折叠完全没变**。
  const repRawOf = (w) => {
    const fr = FORMS_BY_ID.get(w.id)
    if (typeof fr === 'string' && fr && fr !== w.id) return fr
    const l = LEMMA_BY_ID.get(w.id)
    return typeof l === 'string' && l && l !== w.id ? l : null
  }
  const rawRep = new Map()
  for (const w of words) {
    const r = repRawOf(w)
    if (r) rawRep.set(w.id, r)
  }
  /** 沿 rawRep 解析到终态（最多 4 跳，与模块内一致） */
  const terminal = (id) => {
    let cur = id
    const seen = new Set([cur])
    for (let i = 0; i < 4; i += 1) {
      const next = rawRep.get(cur)
      if (!next || next === cur) break
      if (seen.has(next)) return id
      seen.add(next)
      cur = next
    }
    return cur
  }

  const famByRep = new Map()
  const foldByRep = new Map()
  let foldedCount = 0
  let displayCount = 0
  for (const w of words) {
    const r = repRawOf(w)
    if (r) {
      const t = terminal(r)
      if (t !== w.id) famByRep.set(t, (famByRep.get(t) || 0) + 1)
      displayCount += 1
    }
    if (isFolded(w)) {
      foldedCount += 1
      foldByRep.set(w.lemma, (foldByRep.get(w.lemma) || 0) + 1)
    }
  }
  ok(foldedCount === 9888, `★ 被折叠形仍为 9888 个（折叠未因展示表而变，实际 ${foldedCount}）`)
  ok(displayCount === FORMS_BY_ID.size, `★ 展示关系词条数 = words-forms.js 条数（${displayCount} / ${FORMS_BY_ID.size}）`)
  ok(famByRep.size > 0, `涉及展示代表形 ${famByRep.size} 个`)
  ok(
    LEMMA_BY_ID.size === 9888,
    `★ words-lemma.js 仍为 9888 条（折叠表一字未动，实际 ${LEMMA_BY_ID.size}）`,
  )

  let bad = 0
  for (const [rep, cnt] of famByRep) {
    const got = real.formsOf(rep).length
    if (got !== Math.min(cnt, FORMS_MAX)) bad += 1
  }
  ok(bad === 0, `★ formsOf(rep).length === min(族成员数, FORMS_MAX) 全量成立（不一致 ${bad} 族 / 共 ${famByRep.size} 族）`)

  // ★ 展示比折叠宽，但折叠一个都没多折 ★
  const displayOnly = words.filter((w) => repRawOf(w) && !isFolded(w)).length
  ok(displayOnly > 0, `★ 仅展示、不折叠的新增关系 ${displayOnly} 条（determined / blown / cleared …）`)
  const foldNoDisplay = words.filter((w) => isFolded(w) && !repRawOf(w))
  console.log(`    · 折叠但无展示关系的词条 ${foldNoDisplay.length} 个（显式名单剔除项，如 honored）`)

  // ★ 用户点名的三个锚点：展示关系进来了，但**折叠身份没变** ★
  for (const [baseForm, inflForm] of [
    ['determine', 'determined'],
    ['blow', 'blown'],
    ['clear', 'cleared'],
  ]) {
    const base = words.find((w) => w.form === baseForm)
    const infl = words.find((w) => w.form === inflForm)
    if (!base || !infl) {
      ok(false, `词库缺少锚点词 ${baseForm} / ${inflForm}`)
      continue
    }
    ok(
      ids(real.formsOf(base.id)).includes(infl.id),
      `★ formsOf(${baseForm}) 现在包含 ${inflForm}（展示关系已扩充）`,
    )
    ok(
      ids(real.formsOf(infl.id)).includes(base.id),
      `★ formsOf(${inflForm}) 反查到 ${baseForm}`,
    )
    ok(!isFolded(infl), `★ ${inflForm} **仍未被折叠**（仍是独立学习单元，折叠表未动）`)
  }

  // ★★ 展示链只走 1 跳（不做多跳串联）★★
  //   多跳会把 evenings→evening→even、feeds→feed→fee、numbered→number→numb、
  //   beings→being→be 这类**单条就不成立**的边串进来 —— 展示表是用户直接读到的
  //   答案，绝不能出现。这里逐条钉死「必须是 1 跳的 raw target、且不是 2 跳目标」。
  const ONE_HOP = [
    ['evenings', 'evening', 'even'],
    ['feeds', 'feed', 'fee'],
    ['numbered', 'number', 'numb'],
    ['beings', 'being', 'be'],
  ]
  const idOfForm = (f) => {
    const w = words.find((x) => x.form === f)
    return w ? w.id : null
  }
  for (const [form, mustBe, mustNotBe] of ONE_HOP) {
    const w = words.find((x) => x.form === form)
    if (!w) {
      ok(false, `词库缺少 1 跳锚点词 ${form}`)
      continue
    }
    const rep = FORMS_BY_ID.get(w.id)
    const want = idOfForm(mustBe)
    const notWant = idOfForm(mustNotBe)
    ok(rep === want, `★ ${form} 的 formRep = ${mustBe}（1 跳 raw target；期望 id=${want}，实际 ${rep}）`)
    ok(rep !== notWant, `★ ${form} 的 formRep **不是** 2 跳目标 ${mustNotBe}（多跳串联已被禁用）`)
  }

  // 条数护栏：改成 1 跳后条数必须仍是 12,804（变了说明有隐藏丢弃分支被触发）
  ok(FORMS_BY_ID.size === 12804, `★ words-forms.js 条数仍为 12804（实际 ${FORMS_BY_ID.size}）`)

  // relatedFor 的两段互斥 + 不含自身，抽样 300 个代表形
  let overlap = 0
  let selfIn = 0
  let withForms = 0
  for (const rep of [...famByRep.keys()].slice(0, 300)) {
    const r = real.relatedFor({ id: rep })
    const fs = new Set(ids(r.forms))
    if (r.forms.length > 0) withForms += 1
    if (ids(r.derivatives).some((id) => fs.has(id))) overlap += 1
    if (fs.has(rep) || ids(r.derivatives).includes(rep)) selfIn += 1
  }
  ok(withForms > 0, `抽样的代表形中 ${withForms} 个有「常见变形」`)
  ok(overlap === 0, `★ 变形与派生词零重叠（${overlap} 例）`)
  ok(selfIn === 0, `★ 没有任何词把自己列进自己（${selfIn} 例）`)

  // 具体锚点（若该词存在）：abandoning → abandon
  const aband = words.find((w) => w.form === 'abandoning')
  if (aband && isFolded(aband)) {
    const fam = real.formsOf(aband.lemma)
    ok(ids(fam).includes(aband.id), `★ formsOf(${aband.lemma}) 含 abandoning`)
    ok(ids(real.formsOf(aband.id)).includes(aband.lemma), '★ formsOf(abandoning) 含其代表形')
  } else {
    ok(true, '（abandoning 不在词库或未折叠 → 跳过该具体锚点）')
  }

  // DERIVATIVES_MAX 生效
  const someWord = words.find((w) => Array.isArray(w.morphs) && w.morphs.length > 0)
  if (someWord) {
    ok(real.derivativesOf(someWord).length <= DERIVATIVES_MAX, `★ 真实派生词默认不超过 DERIVATIVES_MAX=${DERIVATIVES_MAX}`)
  }
}

// ================================================================ 执行

console.log('[test:word-forms] 常见变形 / 派生词反查模型验证\n')
caseForms()
caseDerivatives()
caseRelatedFor()
caseFormRep()
caseCache()
caseSourceHygiene()
await caseRealData()

console.log(`\n---------- 断言 ${total} 条 · 通过 ${pass} · 失败 ${fail} ----------\n`)
process.exit(fail === 0 ? 0 : 1)

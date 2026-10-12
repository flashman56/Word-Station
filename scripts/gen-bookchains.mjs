#!/usr/bin/env node
/**
 * 词族扩充生成器（书源补链 + 断链修复 + 新词素收编）
 * ==================================================================
 * 目标：把「按词族学习」词根目录里的 0/1 词弱族补成真词族。
 * 三条杠杆（按优先级）：
 *   B. 断链修复 —— chain 里 morph:null 的段，若其 form 精确匹配**唯一**一个
 *      root 词素的 form/variants，就接上该 id。这类词（active/expel/subsequent/
 *      honorary/transaction…）链早建好了，只差临门一脚，精度最高。
 *   C. 书源补链 —— 参考书目（scripts/.book-mining/*.json，人工编排的切分）
 *      与库内词精确求交：拼接校验（各段 form 连起来 === 单词本身）必须通过，
 *      段落优先匹配既有词素；一个 root 都没有的书源链不采用。
 *   D. 新词素收编 —— 书源切分里反复出现（≥3 个库内词）且现有表完全没有的
 *      形态，按书里的 type/gloss 收编为新词素（上限 120，按词数降序），
 *      让 C 阶段的段落能挂上 id 而不是 null。
 *
 * 产出：
 *   - src/data/morphemes.js 末尾（x.unk 之前）追加新词素（仅 D 阶段有产出时）
 *   - src/data/words-bookmorph.js  补丁表（覆盖/补齐 words-remorph，二者并存：
 *      命中优先级 BOOKMORPH > REMORPH，由 index.js / words-entry.js 逐字同款接线）
 *   - scripts/.book-mining/gen-report.json  全量报告
 *
 * 红线：不生成音标；不动 learning.js/vocab.js；不改 morphless 标记；
 *       morphHints 里的 id 全部来自 morphemes.js（运行时 MORPH_IDS 过滤兜底）。
 *
 * 用法：
 *   node scripts/gen-bookchains.mjs            # 干跑：打印报告，不写文件
 *   node scripts/gen-bookchains.mjs --emit     # 落盘 morphemes 增量 + words-bookmorph.js
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import morphemesRaw from '../src/data/morphemes.js'
import { words } from '../src/data/index.js'
import { wordsRemorph } from '../src/data/words-remorph.js'
import { isFolded } from '../src/lib/lemmaFold.js'

// 旧版 words-bookmorph（若存在）：生成器必须以「bookmorph 之前」的干净 raw 态为基准，
// 否则上一轮的 hints 会混进 raw，导致重复追加/漏判。运行时合并是尾部追加
// （morphs = raw + hints），所以 raw = merged 去掉末尾 oldHints.length 个。
let OLD_BOOK = new Map()
try {
  const m = await import('../src/data/words-bookmorph.js')
  OLD_BOOK = m.BOOKMORPH_BY_ID || new Map((m.default || []).map((p) => [p.id, p]))
} catch {
  /* 首次生成时不存在 */
}
const rawMorphsOf = (w) => {
  const old = OLD_BOOK.get(w.id)
  const merged = w.morphs || []
  return old ? merged.slice(0, Math.max(0, merged.length - old.morphHints.length)) : merged
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const MINING_DIR = resolve(__dirname, '.book-mining')
const EMIT = process.argv.includes('--emit')
const MAX_NEW_MORPHEMES = 240

// ---------------------------------------------------------------- 工具
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

// chain 显示字段清洗：书源（尤其 pdf）的 seg 可能带整句解释、英文引号甚至换行，
// 直接内插进单行 JS 字符串会产出非法语法（线上事故：w.absolute 的段文本里带 " 和换行）。
// form 取首个英文字母段（拼接校验用的是中段 form，不受显示清洗影响）；gloss 去换行去引号。
const chainFormDisplay = (s) => {
  const seg = String(s.seg || s.form || '')
  const m = seg.match(/[a-zA-Z-]+/)
  return (m ? m[0] : String(s.form || '')).replace(/[\r\n"]/g, '').slice(0, 20) || norm(s.form).slice(0, 20)
}
const chainGlossDisplay = (g) => String(g ?? '').replace(/[\r\n]+/g, ' ').replace(/"/g, '“').trim()

// ---------------------------------------------------------------- D 前置：书源 JSON 读取
function loadBookJsons() {
  if (!existsSync(MINING_DIR)) return []
  const out = []
  for (const f of readdirSync(MINING_DIR)) {
    if (!f.endsWith('.json') || f === 'weak-families.json' || f === 'gen-report.json') continue
    try {
      const j = JSON.parse(readFileSync(join(MINING_DIR, f), 'utf8'))
      if (Array.isArray(j.morphemes)) out.push({ file: f, ...j })
    } catch (e) {
      console.warn(`  ! 跳过损坏 JSON: ${f} (${e.message})`)
    }
  }
  return out
}

// 解析 decomp 段：兼容 "seg|form|gloss" 与 "form|gloss" 与纯 "form"
function parseDecomp(d) {
  if (typeof d === 'string') d = [d]
  if (!Array.isArray(d)) return []
  return d
    .map((raw) => {
      const parts = String(raw).split('|')
      if (parts.length >= 3) return { seg: parts[0], form: parts[1], gloss: parts[2] }
      if (parts.length === 2) return { seg: parts[0], form: parts[0], gloss: parts[1] }
      return { seg: parts[0], form: parts[0], gloss: '' }
    })
    .filter((x) => x.form)
}

const books = loadBookJsons()
console.log(`书源 JSON：${books.length} 份（${books.map((b) => b.file).join(', ') || '暂无 —— 仅跑 B 阶段'}）`)

// ---------------------------------------------------------------- D 阶段：候选新词素（章节声明制）
// 只收编「书源章节自己声明的词形」：章节 form/variants 里出现、现有表完全没有、
// 且 ≥3 个「章节词表成员 ∩ 库内词」的拼写包含该形态。
// 不再从 decomp 散段收集 —— 那会把 -ain/-ice/-men 这类尾段碎片误立成词根。
function collectNewMorphemeCandidates() {
  const libForms = new Set(words.map((w) => norm(w.form)))
  const existing = new Set()
  for (const m of morphemesRaw) {
    for (const v of [m.form, ...(m.variants || []), ...String(m.display || '').split('/')]) {
      const f = norm(v)
      if (f) existing.add(f)
    }
  }
  const cand = new Map()
  for (const b of books) {
    for (const sec of b.morphemes || []) {
      if ((sec.type || 'root') !== 'root') continue // 前后缀不参与词族键，收编无收益
      const variants = [...new Set([sec.form, ...(sec.variants || [])].map(norm).filter((f) => f.length >= 3))]
      const memberForms = new Set((sec.words || []).map((w) => norm(w.w)).filter(Boolean))
      for (const f of variants) {
        if (existing.has(f)) continue
        let e = cand.get(f)
        if (!e) {
          e = { form: f, gloss: sec.gloss || '', type: 'root', origin: sec.origin || null, display: sec.display || sec.form, words: new Set(), books: new Set() }
          cand.set(f, e)
        }
        if (!e.gloss && sec.gloss) e.gloss = sec.gloss
        e.books.add(b.file)
        for (const wf of memberForms) {
          if (libForms.has(wf) && wf.includes(f)) e.words.add(wf)
        }
      }
    }
  }
  const out = []
  for (const e of cand.values()) {
    if (e.words.size >= 3) out.push(e)
  }
  out.sort((a, b) => b.words.size - a.words.size)
  return out.slice(0, MAX_NEW_MORPHEMES)
}

const newMorphemes = collectNewMorphemeCandidates()
console.log(`D 阶段：候选新词素 ${newMorphemes.length} 个（≥3 库内词、现有表完全未收编）`)

// ---------------------------------------------------------------- 词素表（含新增）与匹配索引
const morphemes = [...morphemesRaw]
for (const nm of newMorphemes) {
  morphemes.push({
    id: `r.${nm.form}`,
    type: nm.type === 'prefix' || nm.type === 'suffix' ? nm.type : 'root',
    form: nm.form,
    display: nm.display || nm.form,
    variants: [],
    gloss: nm.gloss || '',
    glossEn: '',
    origin: nm.origin || 'latin',
    note: `书源收编（${[...nm.books].join('、')}）：例词 ${[...nm.words].slice(0, 6).join('、')}。`,
  })
}
const TYPE_BY_ID = new Map(morphemes.map((m) => [m.id, m.type]))
const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))
const FORM_MATCH = new Map() // norm(form) -> Set(ids)（全类型）
const ROOT_MATCH = new Map() // norm(form) -> Set(rootIds)
for (const m of morphemes) {
  const forms = new Set()
  const add = (s) => {
    const f = norm(s)
    if (f) forms.add(f)
  }
  add(m.form)
  ;(m.variants || []).forEach(add)
  String(m.display || '')
    .split('/')
    .forEach(add)
  for (const f of forms) {
    if (!FORM_MATCH.has(f)) FORM_MATCH.set(f, new Set())
    FORM_MATCH.get(f).add(m.id)
    if (m.type === 'root') {
      if (!ROOT_MATCH.has(f)) ROOT_MATCH.set(f, new Set())
      ROOT_MATCH.get(f).add(m.id)
    }
  }
}
const NEW_IDS = new Set(morphemes.slice(morphemesRaw.length).map((m) => m.id))

// ---------------------------------------------------------------- 库内扫描
const REMORPH_BY_ID = new Map(wordsRemorph.map((p) => [p.id, p]))
const units = words.filter(
  (w) =>
    w &&
    typeof w.form === 'string' &&
    w.kind !== 'proper' &&
    w.kind !== 'phrase' &&
    !/[^a-zA-Z-]/.test(w.form) &&
    !isFolded(w),
)
console.log(`库内代表形（非专名/短语/多词单位/非折叠屈折形）：${units.length}`)

function hasRoot(w) {
  return rawMorphsOf(w).some((id) => TYPE_BY_ID.get(id) === 'root')
}

const patches = new Map() // wordId -> {morphHints, chain}
const stats = { nullUpgraded: 0, bookChained: 0, skippedConcat: 0, ambiguous: 0 }

// ---- B 阶段：断链修复 -------------------------------------------------------
for (const w of units) {
  if (hasRoot(w)) continue
  const chain = Array.isArray(w.chain) ? w.chain : []
  if (chain.length === 0) continue
  let touched = false
  let ambiguous = false
  const newRoots = []
  const chain2 = chain.map((seg) => {
    if (!seg || seg.morph !== null) return seg
    const f = norm(seg.form)
    const ids = ROOT_MATCH.get(f)
    if (!ids || ids.size === 0) return seg
    if (ids.size > 1) {
      ambiguous = true
      return seg
    }
    const id = [...ids][0]
    newRoots.push(id)
    touched = true
    return { ...seg, morph: id }
  })
  if (ambiguous) stats.ambiguous += 1
  if (!touched) continue
  const base = REMORPH_BY_ID.get(w.id)
  // ★ hints 只放「运行时合并后还缺的 id」★
  //   运行时合并是 morphs = rawMorphs + hints：
  //   · 在 remorph 的词 rawMorphs = []（hints 就是全部）→ hints = baseHints ∪ chainIds
  //   · 不在 remorph 的词 rawMorphs = w.morphs（base 文件自带）→ hints = 目标集合 − raw，
  //     否则 base 已有的 id（如 s.ive）会被追加两次（线上实测出过 ["s.ive","r.act","s.ive"]）。
  const chainIds = chain2.filter((s) => s.morph).map((s) => s.morph)
  let hints
  if (base) {
    hints = [...new Set([...base.morphHints, ...chainIds])]
  } else {
    const raw = new Set(rawMorphsOf(w))
    hints = [...new Set(chainIds)].filter((id) => !raw.has(id))
  }
  patches.set(w.id, { morphHints: hints, chain: chain2 })
  stats.nullUpgraded += 1
}
console.log(`B 阶段：断链修复 ${stats.nullUpgraded} 词（歧义跳过 ${stats.ambiguous}）`)

// ---- C 阶段：书源补链（只补「仍无词根」的词，B 的产出可被书源更完整的切分覆盖） --
const bookByWord = new Map() // norm(word) -> [{segs, book}]
for (const b of books) {
  for (const sec of b.morphemes || []) {
    for (const w of sec.words || []) {
      const f = norm(w.w)
      if (!f) continue
      const segs = parseDecomp(w.decomp)
      if (segs.length === 0) continue
      if (!bookByWord.has(f)) bookByWord.set(f, [])
      bookByWord.get(f).push({ segs, book: b.file, secType: sec.type, secGloss: sec.gloss })
    }
  }
}
console.log(`C 阶段：书源词目 ${bookByWord.size} 个（与库内词求交）`)

for (const w of units) {
  if (hasRoot(w)) continue
  const entries = bookByWord.get(norm(w.form))
  if (!entries || entries.length === 0) continue
  const letters = norm(w.form)
  // 取第一个能通过「拼接校验 + 至少一个词素命中」的切分
  let chosen = null
  for (const { segs, book } of entries) {
    const concat = segs.map((s) => norm(s.form)).join('')
    if (concat !== letters) continue
    const chain = segs.map((s) => {
      const f = norm(s.form)
      const ids = FORM_MATCH.get(f)
      let id = null
      if (ids && ids.size === 1) id = [...ids][0]
      else if (ids && ids.size > 1) {
        // 多命中时优先唯一 root；仍不唯一则放弃该段（保持 null）
        const roots = [...ids].filter((x) => TYPE_BY_ID.get(x) === 'root')
        if (roots.length === 1) id = roots[0]
      }
      return { morph: id, form: chainFormDisplay(s), gloss: id ? GLOSS_BY_ID.get(id) || '' : chainGlossDisplay(s.gloss) }
    })
    const rootIds = chain.filter((s) => s.morph && TYPE_BY_ID.get(s.morph) === 'root').map((s) => s.morph)
    if (rootIds.length === 0) continue
    chosen = { chain, rootIds, book }
    break
  }
  if (!chosen) {
    stats.skippedConcat += 1
    continue
  }
  // ★ 同 B 阶段：hints = 目标集合 − raw 已有（remorph 词 raw 为空，直接全量）
  const chainIds = chosen.chain.filter((s) => s.morph).map((s) => s.morph)
  const base = REMORPH_BY_ID.get(w.id)
  let hints
  if (base) {
    hints = [...new Set([...base.morphHints, ...chainIds])]
  } else {
    const raw = new Set(rawMorphsOf(w))
    hints = [...new Set(chainIds)].filter((id) => !raw.has(id))
  }
  patches.set(w.id, { morphHints: hints, chain: chosen.chain })
  stats.bookChained += 1
}
console.log(`C 阶段：书源补链 ${stats.bookChained} 词（拼接校验不过/无词根而放弃 ${stats.skippedConcat}）`)

// ---- E 阶段：章节成员补链（书里无切分的词表：章节归属即词族） ----------------
// 章节 → 词素 id（含 D 阶段新增）。仅 root 型章节；成员词拼写必须包含章节变体，
// 多章节同时命中取「最长变体」，并列异 id 则弃权（宁缺毋滥）。
function sectionIdFor(sec) {
  const ids = new Set()
  for (const v of [sec.form, ...(sec.variants || [])]) {
    const f = norm(v)
    for (const id of FORM_MATCH.get(f) || []) {
      if (TYPE_BY_ID.get(id) === 'root') ids.add(id)
    }
  }
  return ids.size === 1 ? [...ids][0] : null
}
const memberOf = new Map() // norm(word) -> {f, id|null}
for (const b of books) {
  for (const sec of b.morphemes || []) {
    if ((sec.type || 'root') !== 'root') continue
    const id = sectionIdFor(sec)
    if (!id) continue
    const variants = [...new Set([sec.form, ...(sec.variants || [])].map(norm).filter((f) => f.length >= 3))]
    for (const w of sec.words || []) {
      const wf = norm(w.w)
      if (!wf) continue
      let hit = null
      for (const f of variants) {
        if (wf.includes(f) && (!hit || f.length > hit.f)) hit = { f, id }
      }
      if (!hit) continue
      const prev = memberOf.get(wf)
      if (!prev || hit.f.length > prev.f) memberOf.set(wf, hit)
      else if (hit.f.length === prev.f && hit.id !== prev.id) memberOf.set(wf, { f: hit.f, id: null })
    }
  }
}
const unitByNorm = new Map(units.map((w) => [norm(w.form), w]))
for (const [wf, hit] of memberOf) {
  if (!hit.id) continue
  const w = unitByNorm.get(wf)
  if (!w || hasRoot(w) || patches.has(w.id)) continue
  patches.set(w.id, { morphHints: [hit.id], chain: [{ morph: hit.id, form: hit.f, gloss: GLOSS_BY_ID.get(hit.id) || '' }] })
  stats.memberChained = (stats.memberChained || 0) + 1
}
console.log(`E 阶段：章节成员补链 ${stats.memberChained || 0} 词（成员资格 + 拼写包含 + 最长变体唯一）`)

// ---------------------------------------------------------------- 补丁自检（模拟运行时合并）
// 运行时：morphs = rawMorphs + hints，chain = patch.chain，gloss 由 GLOSS_BY_ID 收敛。
// 这里逐条断言：最终 morphs 无重复 id、hints 全部存在于词素表、chain 非空。
const ALL_IDS = new Set(morphemes.map((m) => m.id))
const unitById = new Map(units.map((w) => [w.id, w]))
let checkFail = 0
let baseDupWarn = 0
for (const [id, p] of patches) {
  const raw = REMORPH_BY_ID.has(id) ? [] : rawMorphsOf(unitById.get(id) || { morphs: [] })
  const final = [...raw, ...p.morphHints]
  // ★ 只拦「补丁自身引入」的重复：hints 内部重复、或 hints 与 raw 撞车。
  //   base 数据里可能本来就带重复（如 outcast 的 ["p.out","p.out"]）——那是存量数据
  //   问题，补丁不新增重复即可放行，单独预警不阻塞。
  if (new Set(p.morphHints).size !== p.morphHints.length) {
    console.error(`  ! hints 内部重复: ${id} -> ${JSON.stringify(p.morphHints)}`)
    checkFail += 1
  }
  const rawSet = new Set(raw)
  if (p.morphHints.some((h) => rawSet.has(h))) {
    console.error(`  ! hints 与 raw 撞车: ${id} raw=${JSON.stringify(raw)} hints=${JSON.stringify(p.morphHints)}`)
    checkFail += 1
  }
  if (new Set(final).size !== final.length && new Set(p.morphHints).size === p.morphHints.length && !p.morphHints.some((h) => rawSet.has(h))) {
    baseDupWarn += 1
    if (baseDupWarn <= 10) console.warn(`  ⚠ base 存量重复（非本补丁引入）: ${id} final=${JSON.stringify(final)}`)
  }
  if (p.morphHints.some((h) => !ALL_IDS.has(h))) {
    console.error(`  ! hints 含未知词素: ${id} -> ${JSON.stringify(p.morphHints)}`)
    checkFail += 1
  }
  if (!Array.isArray(p.chain) || p.chain.length === 0) {
    console.error(`  ! chain 为空: ${id}`)
    checkFail += 1
  }
}
if (baseDupWarn > 0) console.warn(`  ⚠ base 存量重复共 ${baseDupWarn} 词（不阻塞，另行统计）`)
if (checkFail > 0) throw new Error(`补丁自检失败 ${checkFail} 条 —— 修生成器后再 emit`)
console.log(`补丁自检通过：${patches.size} 条（morphs 无重复 / hints 全部可解析 / chain 非空）`)

// ---------------------------------------------------------------- 家族规模对比报告
function familyCensus() {
  const cnt = new Map()
  for (const w of units) {
    const morphs = patches.has(w.id) ? (REMORPH_BY_ID.get(w.id)?.morphHints || []) : w.morphs || []
    const eff = patches.has(w.id) ? patches.get(w.id).morphHints : morphs
    const root = eff.find((id) => TYPE_BY_ID.get(id) === 'root')
    if (!root) continue
    cnt.set(root, (cnt.get(root) || 0) + 1)
  }
  return cnt
}
const before = new Map()
for (const w of units) {
  const root = rawMorphsOf(w).find((id) => TYPE_BY_ID.get(id) === 'root')
  if (root) before.set(root, (before.get(root) || 0) + 1)
}
const after = familyCensus()
const spotlight = ['r.pell', 'r.act', 'r.sequ', 'r.tex', 'r.metr', 'r.pac', 'r.soci', 'r.techn', 'r.zo', 'r.via', 'r.vin', 'r.var', 'r.honor', 'r.plant', 'r.mark', 'r.aqu', 'r.corp', 'r.crux', 'r.cyan', 'r.chem']
console.log('\n=== 词族规模对比（重点族） ===')
for (const id of spotlight) {
  const b = before.get(id) || 0
  const a = after.get(id) || 0
  const nm = newMorphemes.find((m) => `r.${m.form}` === id)
  console.log(`${id}${nm ? '(新)' : ''}: ${b} -> ${a} 词`)
}
const totalFamBefore = before.size
const totalFamAfter = after.size
const totalWordsRootedBefore = [...before.values()].reduce((x, y) => x + y, 0)
const totalWordsRootedAfter = [...after.values()].reduce((x, y) => x + y, 0)
console.log(`\n有词根归属的代表形：${totalWordsRootedBefore} -> ${totalWordsRootedAfter}（+${totalWordsRootedAfter - totalWordsRootedBefore}）`)
console.log(`非空词族数：${totalFamBefore} -> ${totalFamAfter}`)

// ---------------------------------------------------------------- 落盘
const report = {
  generatedAt: new Date().toISOString(),
  books: books.map((b) => b.file),
  newMorphemes: newMorphemes.map((m) => ({ id: `r.${m.form}`, form: m.form, gloss: m.gloss, type: m.type, words: [...m.words].slice(0, 12), n: m.words.size })),
  stats,
  spotlight: spotlight.map((id) => ({ id, before: before.get(id) || 0, after: after.get(id) || 0 })),
  totals: { totalWordsRootedBefore, totalWordsRootedAfter, totalFamBefore, totalFamAfter },
  patches: [...patches.entries()].map(([id, p]) => ({ id, ...p })),
}
writeFileSync(join(MINING_DIR, 'gen-report.json'), JSON.stringify(report, null, 1))
console.log(`\n报告已写入 scripts/.book-mining/gen-report.json（补丁 ${patches.size} 条）`)

if (EMIT) {
  // 1) morphemes.js：新词素插到 x.unk 之前（保持占位词素收尾的约定）
  if (newMorphemes.length > 0) {
    let mtext = readFileSync(resolve(__dirname, '../src/data/morphemes.js'), 'utf8')
    const anchor = "  { id: 'x.unk'"
    if (!mtext.includes(anchor)) throw new Error('morphemes.js 找不到 x.unk 插入锚点')
    const lines = newMorphemes.map((nm) => {
      const id = `r.${nm.form}`
      if (!NEW_IDS.has(id)) throw new Error(`非新增词素混入: ${id}`)
      const type = nm.type === 'prefix' || nm.type === 'suffix' ? nm.type : 'root'
      const clean = (t) => String(t ?? '').replace(/[\r\n]+/g, ' ').replace(/"/g, '“').trim()
      return `  {"id":"${id}","type":"${type}","form":"${clean(nm.form)}","display":"${clean(nm.display || nm.form)}","variants":[],"gloss":"${clean(nm.gloss)}","glossEn":"","origin":"${nm.origin || 'latin'}","note":"书源收编（${[...nm.books].join('、')}）：例词 ${[...nm.words].slice(0, 6).join('、')}。"},`
    })
    mtext = mtext.replace(anchor, lines.join('\n') + `\n` + anchor)
    writeFileSync(resolve(__dirname, '../src/data/morphemes.js'), mtext)
    console.log(`morphemes.js: +${newMorphemes.length} 新词素（插于 x.unk 之前）`)
  }

  // 2) words-bookmorph.js
  const outLines = []
  outLines.push('/**')
  outLines.push(' * 书源补链 + 断链修复补丁表（words-bookmorph）')
  outLines.push(' * ------------------------------------------------------------------')
  outLines.push(' * 由 scripts/gen-bookchains.mjs 生成，请勿手工修改。')
  outLines.push(' *')
  outLines.push(' * 与 words-remorph.js 并存：index.js / words-entry.js 的合并顺序是')
  outLines.push(' *   BOOKMORPH.get(id) || REMORPH.get(id) —— 本表命中时整体覆盖补丁')
  outLines.push(' * （morphHints/chain 都是完整值，不是增量）。')
  outLines.push(' *')
  outLines.push(' * 来源：① 断链修复（chain 中 morph:null 的段精确匹配唯一 root 词素）；')
  outLines.push(' *       ② 参考书目人工编排切分（scripts/.book-mining/*.json），')
  outLines.push(' *          逐词通过「各段 form 拼接 === 单词本身」的拼接校验。')
  outLines.push(' *')
  outLines.push(' * 词条数: ' + patches.size)
  outLines.push(' */')
  outLines.push('')
  outLines.push('/** @typedef {{ id: string, morphHints: string[], chain: Array<{morph: string|null, form: string, gloss: string}> }} BookPatch */')
  outLines.push('')
  outLines.push('const wordsBookmorph = [')
  for (const [id, p] of [...patches].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const hints = JSON.stringify(p.morphHints)
    const chain = '[' + p.chain.map((s) => `{morph:${s.morph ? `"${s.morph}"` : 'null'},form:"${String(s.form).replace(/"/g, '')}",gloss:"${String(s.gloss || '').replace(/"/g, '“')}"}`).join(',') + ']'
    outLines.push(`  {id:"${id}",morphHints:${hints},chain:${chain}},`)
  }
  outLines.push(']')
  outLines.push('')
  outLines.push('/** id -> 补丁（合并时查表用） */')
  outLines.push('export const BOOKMORPH_BY_ID = new Map(wordsBookmorph.map((p) => [p.id, p]))')
  outLines.push('')
  outLines.push('export { wordsBookmorph }')
  outLines.push('export default wordsBookmorph')
  writeFileSync(resolve(__dirname, '../src/data/words-bookmorph.js'), outLines.join('\n') + '\n')
  console.log(`words-bookmorph.js: ${patches.size} 条补丁已写入`)
} else {
  console.log('（干跑模式：未写任何文件。加 --emit 落盘）')
}

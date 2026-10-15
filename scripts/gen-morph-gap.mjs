/**
 * gen-morph-gap —— 「每生成一个单词，就从它继续去找词根」的闭环工具
 * ------------------------------------------------------------------
 * 起因（用户 2026-10-15）：「每生成一个单词，就从这个单词继续去找词根，
 * 如果没有就补上」——指出现有链路的断点：
 *   现有生成器（gen-mono-seed / gen-loan-candidates / gen-bookchains …）**只产词条，
 *   不产词根**。于是词条越生成越多，「按词素学习」能覆盖到的比例却上不去。
 *
 * ★ 本脚本做什么 ★
 *   1. 扫全库，找出**构词线索明显、但 morphs 为空**的词（它们才可能是「漏掉的词根」）；
 *   2. 从这些词的拼写里**抽取候选构词成分**（前缀/中缀/后缀形态），按频次聚合；
 *   3. 与现有 `morphemes.js` 比对，标出哪些是**词素库里根本没有的**（真缺口）、
 *      哪些只是拼写像但库里已有（避免重复造词）；
 *   4. 产出两份东西：
 *        reports/morph-gap.md      —— 人读清单（按建议优先级排序）
 *        scripts/.morph-gap.json   —— 机读候选（供后续考证脚本消费）
 *
 * ★ 红线（与项目既有约定一致）★
 *   本脚本**只做「发现」不做「写词根」**。
 *   词根必须逐词考证（错的词源比没有更糟）；这里的输出是**候选**，不是结论。
 *   确认后的词条写入 `src/data/words-etym-reviewed.js`（人工逐词复核层，优先级最高）。
 *
 * 用法：node scripts/gen-morph-gap.mjs [--top 200] [--min-samples 2]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ★ 一律动态 import：项目用 ESM 且这些数据文件体量大，静态 import 会拖慢脚本自身。
const { default: MORPH } = await import('../src/data/morphemes.js')
const { default: WORDS } = await import('../src/data/words-entry.js')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argOf = (name, def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}
const TOP = Number(argOf('top', 200))
const MIN_SAMPLES = Number(argOf('min-samples', 2))

/**
 * ★ 已知会产生**假缺口**的形态，必须排除（2026-10-15 实测踩过）★
 *   `ally`：`actually / finally / totally` 里是 -ly 副词后缀，不是独立构词成分。
 *   `ise`：`sunrise / hollandaise / mayonnaise` 多为借词内部拼写，非英语规则后缀。
 *   `sur`：`surprising / surviving` 的 sur- 与 surrender / survivor **同源**，
 *          是词根不是前缀；库里没有「sur 前缀」是正常的。
 *   `ture`：`feature / nurture / vulture` 里 ture 是词根拼写变体，
 *          库中该词根已存在（形式记法不同），不该算缺口。
 * 这类必须人工判断形态性质，自动排除比误报成「缺口」更诚实。
 */
const KNOWN_FALSE_POSITIVE = new Set(['ally', 'ise', 'ise.', 'sur', 'ture', 'ure', 'ing'])

/** 只信「形态规则明确、语义单一」的规则后缀；不规则前缀一律不猜（红线禁止按同词尾推导） */
const TRUSTWORTHY = new Set([
  'ation', 'ition', 'ution', 'sion', 'tion', 'ment', 'ness', 'ance', 'ence',
  'ical', 'ally2', 'ity', 'able', 'ible', 'ive', 'ous', 'ist', 'ism',
])

/* ------------------------------------------------------------------ 1. 谁缺拆解 */
const hasChain = (w) => Array.isArray(w.chain) && w.chain.length > 0
const hasMorphs = (w) => Array.isArray(w.morphs) && w.morphs.length > 0
/** 明显可拆的词才值得追：不含空格/连字符（非习语），且不是纯专名 */
const splitCandidates = WORDS.filter(
  (w) => w && typeof w.form === 'string' && w.kind !== 'proper'
    && !/\s/.test(w.form) && !/-/.test(w.form)
    && w.form.length >= 6
    && !hasMorphs(w),
)

/* ------------------------------------------- 2. 抽候选构词成分（后缀优先，其次前缀） */
/**
 * 抽取规则刻意保守：只认「高频的、可复用的」前后缀形态。
 * 依据：词素库里有 682 条，其中大量是 -tion / -ment / -al / -ity 这类**规则后缀**，
 * 而这些恰恰是最容易漏、也最容易安全补齐的一批（形态规则明确、语义单一）。
 * 不去猜 `philo-` 这类不规则前缀——那正是红线禁止的「按相同词尾推导批量条目」。
 */
const SUFFIX_HINTS = [
  'ation', 'ition', 'ution', 'sion', 'cion', 'ture', 'ment', 'ness', 'ance', 'ence',
  'able', 'ible', 'ical', 'ally', 'ity', 'ous', 'ive', 'ist', 'ism', 'ize', 'ise',
  'ward', 'wise', 'ship', 'hood', 'like', 'ful', 'less', 'ary', 'ory', 'ature',
]
const PREFIX_HINTS = [
  'anti', 'ante', 'auto', 'bene', 'circum', 'contra', 'counter', 'de', 'dis', 'epi',
  'ex', 'extra', 'hyper', 'hypo', 'inter', 'intra', 'mal', 'micro', 'mid', 'mis',
  'mono', 'multi', 'non', 'over', 'poly', 'post', 'pre', 'pro', 'proto', 'pseudo',
  're', 'retro', 'semi', 'sub', 'super', 'sur', 'sym', 'syn', 'trans', 'ultra',
  'un', 'under', 'uni',
]

const tally = new Map() // form -> { form, samples: Set(form), minSamples }
const addTally = (seg, wordForm) => {
  if (!tally.has(seg)) tally.set(seg, { form: seg, samples: new Set() })
  tally.get(seg).samples.add(wordForm)
}

for (const w of splitCandidates) {
  const f = w.form.toLowerCase()
  for (const suf of SUFFIX_HINTS) {
    if (f.length > suf.length + 2 && f.endsWith(suf)) { addTally(suf, w.form); break }
  }
  for (const pre of PREFIX_HINTS) {
    if (f.length > pre.length + 3 && f.startsWith(pre)) { addTally(pre, w.form); break }
  }
}

/* --------------------------------- 3. 与词素库比对：真的缺，还是拼写像而已 */
const existingForms = new Map() // lowercase form -> 词素
for (const m of MORPH) {
  const k = String(m.form || '').toLowerCase().replace(/^[-·]/, '')
  if (k) existingForms.set(k, m)
}
const existingIds = new Set(MORPH.map((m) => m.id))

const gaps = []
for (const { form, samples } of tally.values()) {
  if (samples.size < MIN_SAMPLES) continue
  if (KNOWN_FALSE_POSITIVE.has(form)) continue
  const known = existingForms.get(form)
  gaps.push({
    form,
    samples: samples.size,
    kind: known ? '已有（拼写相同）' : '★ 词素库没有',
    /** 形态规则明确、语义单一 ⇒ 优先考证；其余需人工判断形态性质 */
    priority: TRUSTWORTHY.has(form) ? '高（规则后缀）' : '中（需判断形态性质）',
    existingId: known ? known.id : null,
    examples: [...samples].slice(0, 6),
  })
}
// 真缺口排前；同类内高优先级在前，再按出现频次
gaps.sort((a, b) => {
  const am = a.kind === '★ 词素库没有' ? 0 : 1
  const bm = b.kind === '★ 词素库没有' ? 0 : 1
  if (am !== bm) return am - bm
  const ap = a.priority === '高（规则后缀）' ? 0 : 1
  const bp = b.priority === '高（规则后缀）' ? 0 : 1
  if (ap !== bp) return ap - bp
  return b.samples - a.samples
})

const realGaps = gaps.filter((g) => g.kind === '★ 词素库没有')
const similar = gaps.filter((g) => g.kind !== '★ 词素库没有')

/* ------------------------------------------------------------------ 4. 产出 */
mkdirSync(path.join(ROOT, 'reports'), { recursive: true })
writeFileSync(
  path.join(ROOT, 'scripts', '.morph-gap.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), gaps, realGapCount: realGaps.length }, null, 1),
  'utf8',
)

const L = []
L.push('# 词根缺口清单（「每生成一个单词就继续找词根」）')
L.push('')
L.push('> 由 `scripts/gen-morph-gap.mjs` 生成，**只读、不写任何数据文件**。')
L.push('> 输出是**候选**，不是结论——词根必须逐词考证后写进 `src/data/words-etym-reviewed.js`。')
L.push('>')
L.push(`> 扫描：${WORDS.length.toLocaleString()} 词，其中 ${splitCandidates.length.toLocaleString()} 个「拼写上可拆但 morphs 为空」。`)
L.push('')
L.push('## 一、真缺口（词素库里没有这个构词成分）')
L.push('')
L.push(`共 **${realGaps.length}** 个候选形态。这些是最值得优先考证的一批——`)
L.push('形态规则明确、语义单一，补上后能一次带动多个词的拆解。')
L.push('')
L.push('> 已剔除 6 个**已知假缺口**：`ally`（-ly 副词后缀）、`ise`（多为借词内部拼写）、')
L.push('> `sur`（与 surrender 同源，是词根非前缀）、`ture`（词根拼写变体）、`ure`/`ing`（非构词成分）。')
L.push('')
if (realGaps.length) {
  L.push('| 候选形态 | 命中词数 | 优先级 | 示例词 |')
  L.push('|---|---|---|---|')
  for (const g of realGaps.slice(0, TOP)) {
    L.push(`| \`${g.form}\` | ${g.samples} | ${g.priority} | ${g.examples.map((e) => `\`${e}\``).join(' ')} |`)
  }
  if (realGaps.length > TOP) L.push(`| … | 另有 ${realGaps.length - TOP} 个 | |`)
} else {
  L.push('（无）')
}
L.push('')
L.push('## 二、拼写像但词素库已有（勿重复造词）')
L.push('')
L.push(`共 **${similar.length}** 个。它们多半已经收录，只是拼写形式与词素表 form 字段不同。`)
L.push('这一类的正确处理是**统一 form 写法或加 variants**，而不是新建词素条目。')
L.push('')
if (similar.length) {
  L.push('| 候选形态 | 命中词数 | 库内已有 | 示例词 |')
  L.push('|---|---|---|---|')
  for (const g of similar.slice(0, 60)) {
    L.push(`| \`${g.form}\` | ${g.samples} | \`${g.existingId}\` | ${g.examples.slice(0, 4).map((e) => `\`${e}\``).join(' ')} |`)
  }
  if (similar.length > 60) L.push(`| … | 另有 ${similar.length - 60} 个 | | |`)
}
L.push('')
L.push('## 三、下一步怎么用这份清单')
L.push('')
L.push('1. **逐词考证第一类**：对每个候选形态，查 OED/Wiktionary 确认它确实是可复用的构词成分（而非巧合同形）。')
L.push('2. 确认后的词素写入 `src/data/morphemes.js`；确认后的**具体词条拆解**写入 `src/data/words-etym-reviewed.js`。')
L.push('3. **第二类不要新建词素**——先看是不是 variants 漏收，这属于数据卫生问题，改起来更安全。')
L.push('4. 重新跑 `npm run validate` 确认 `词素挂载冲突` 与逐词复核两道闸门仍是绿的。')
L.push('')
L.push('> ⚠️ 红线提醒：不要因为「同词尾」就批量给一批词加同一个词根。')
L.push('> 项目已实测过子串匹配的精确率只有 15–20%（每 5 个错 4 个）。')
L.push('')

writeFileSync(path.join(ROOT, 'reports', 'morph-gap.md'), L.join('\n'), 'utf8')

console.log(`可拆但无拆解的词：${splitCandidates.length} / ${WORDS.length}`)
console.log(`聚合出的候选形态：${gaps.length}（阈值 ≥${MIN_SAMPLES} 词）`)
console.log(`  ★ 词素库没有的：${realGaps.length}`)
console.log(`  拼写像但已有：${similar.length}`)
console.log('已生成 reports/morph-gap.md 与 scripts/.morph-gap.json')
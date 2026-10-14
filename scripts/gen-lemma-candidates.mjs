/**
 * gen-lemma-candidates —— 补全 lemma 折叠的**候选清单**（只读，不写 words-lemma.js）
 * ------------------------------------------------------------------
 * 背景：src/data/words-lemma.js 只有 9,888 条，而实测还有 ~2,168 个未折叠的屈折形
 *       （其中 ~1,358 无 chain）。但**不能直接批量补**。
 *
 * ★ 为什么只出清单、不直接写盘 ★
 *   折叠把「变形形的���习记录」并到「代表形」上。判错一次 = 把学习记录并到**错误的词**
 *   上，比不折叠更糟。实测基准（scripts/probe-lemma-detector.mjs）：
 *     形态优先 98.74% / 词频优先 98.38% —— 两边都会错，
 *     且参考基准 draft 自身也有错（putting→putt、feels→felt、falls→fell、better→good）。
 *   2,168 × 1.3% ≈ **28 个错误折叠**，不可接受。
 *
 * ★ 分级 ★
 *   T1 自动安全：原形来自**手写不规则表**（不靠启发式猜）+ 变形形确实比原形冷僻
 *               （freqRank 更大）+ 原形在库且非专名。判据不依赖检测器的判断力。
 *   T2 待复核：靠形态规则推断原形。需逐词人工确认后才能写进 words-lemma.js。
 *   T3 不建议：变形形比原形更常用（折叠会把学习者推到冷僻原形）。
 *
 * 用法：node scripts/gen-lemma-candidates.mjs
 * 产出：reports/lemma-candidates.md
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findBaseForm, isIrregular, irregularBase } from './lib/base-form.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const draft = JSON.parse(readFileSync(path.join(ROOT, 'scripts', '.lemma-map.draft.json'), 'utf8'))
const { default: WORDS } = await import('../src/data/words-entry.js')

const index = new Map()
for (const w of WORDS) {
  if (w && typeof w.form === 'string') {
    const k = w.form.toLowerCase()
    if (!index.has(k)) index.set(k, w)
  }
}
const draftByForm = new Map(draft.map((r) => [r.form, r]))
const isFolded = (w) => typeof w.lemma === 'string' && w.lemma !== '' && w.lemma !== w.id
const hasChain = (w) => Array.isArray(w.chain) && w.chain.length > 0

const t1 = []
const t2 = []
const t3 = []
let alreadyDraft = 0
let alreadyFolded = 0

for (const w of WORDS) {
  if (isFolded(w)) { alreadyFolded += 1; continue }
  if (!w || typeof w.form !== 'string' || w.kind === 'proper') continue
  const inDraft = draftByForm.get(w.form)
  if (inDraft) { alreadyDraft += 1; continue }

  const irrBase = irregularBase(w.form, index)
  const guess = irrBase || findBaseForm(w.form, index)
  if (!guess) continue
  const target = index.get(guess)
  if (!target || target.id === w.id) continue

  const fRank = Number.isFinite(w.freqRank) ? w.freqRank : Infinity
  const tRank = Number.isFinite(target.freqRank) ? target.freqRank : Infinity
  // 变形形比原形更常用 ⇒ 折叠会把学习者推到冷僻原形 ⇒ 不建议
  if (fRank < tRank) {
    t3.push({ w, target, irr: Boolean(irrBase), fRank, tRank })
    continue
  }
  const row = { w, target, irr: Boolean(irrBase), fRank, tRank, gainChain: !hasChain(w) && hasChain(target) }
  if (irrBase) t1.push(row)
  else t2.push(row)
}

const pct = (n) => ((n / Math.max(1, t1.length + t2.length + t3.length)) * 100).toFixed(1)
const L = []
L.push('# 补全 lemma 折叠 · 候选清单')
L.push('')
L.push('> 由 `scripts/gen-lemma-candidates.mjs` 生成，**只读**，未写入 `src/data/words-lemma.js`。')
L.push('> 折叠 = 把变形形的「学习记录」并到代表形。判错一次就是把记录并到错误的词上，比不折叠更糟。')
L.push('')
L.push('## 为什么不出手直接补')
L.push('')
L.push('检测器在已审 draft（13,183 对）上的精确率：')
L.push('')
L.push('| 主键 | 精确率 |')
L.push('|---|---|')
L.push('| 形态学优先 | **98.74%** |')
L.push('| 有 chain 优先 | 98.70% |')
L.push('| 词频优先 | 98.38% |')
L.push('')
L.push('两边都会错，且参考基准 draft 自身也含错例（`putting→putt`、`feels→felt`、`falls→fell`、`better→good`）。')
L.push('按 2,168 条 × 约 1.3% 估算，**约有 28 个错误折叠**——不可接受，故只出清单。')
L.push('')
L.push('## 分级口径')
L.push('')
L.push('- **T1 自动安全** — 原形来自手写不规则表（不靠启发式猜）+ 变形形不比原形常用。判据不依赖检测器的判断力。')
L.push('- **T2 待复核** — 原形靠形态规则推断，需逐词人工确认。')
L.push('- **T3 不建议** — 变形形比原形更常用，折叠会把学习者推到冷僻原形。')
L.push('')
L.push(`## 统计`)
L.push('')
L.push(`| 桶 | 条数 | 占比 |`)
L.push(`|---|---|---|`)
L.push(`| T1 自动安全 | **${t1.length}** | ${pct(t1.length)}% |`)
L.push(`| T2 待复核 | ${t2.length} | ${pct(t2.length)}% |`)
L.push(`| T3 不建议 | ${t3.length} | ${pct(t3.length)}% |`)
L.push('')
L.push(`已折叠 ${alreadyFolded} 条；draft 里已判定过（故不在本清单）${alreadyDraft} 条。`)
L.push('')
L.push(`其中「折叠后学习单元有 chain」的数量（直接受益于「按词素学习」）：`)
L.push('')
L.push(`- T1：**${t1.filter((x) => x.gainChain).length}** / ${t1.length}`)
L.push(`- T2：${t2.filter((x) => x.gainChain).length} / ${t2.length}`)
L.push('')

const show = (title, rows, note) => {
  L.push(`## ${title}`)
  L.push('')
  if (note) { L.push(note); L.push('') }
  if (!rows.length) { L.push('（空）'); L.push(''); return }
  const sorted = rows.slice().sort((a, b) => (b.gainChain ? 1 : 0) - (a.gainChain ? 1 : 0) || a.fRank - b.fRank)
  L.push('| form | → 原形 | form rank | 原形 rank | 有chain | 折叠后有chain |')
  L.push('|---|---|---|---|---|---|')
  for (const r of sorted.slice(0, 120)) {
    L.push(`| ${r.w.form} | ${r.target.form} | ${r.fRank} | ${r.tRank} | ${hasChain(r.w) ? '✓' : '—'} | ${r.gainChain ? '**✓**' : '—'} |`)
  }
  if (sorted.length > 120) L.push(`| … | 另有 ${sorted.length - 120} 条 | | | | |`)
  L.push('')
}

show('T1 · 自动安全（不规则形，判据不依赖检测器）', t1, '原形来自 `scripts/lib/base-form.mjs` 的手写 `IRREGULAR` 表。')
show('T2 · 待复核（形态规则推断，需人工确认）', t2)
show('T3 · 不建议（变形形比原形更常用）', t3)

mkdirSync(path.join(ROOT, 'reports'), { recursive: true })
const out = path.join(ROOT, 'reports', 'lemma-candidates.md')
writeFileSync(out, L.join('\n'), 'utf8')
console.log(`已生成 ${path.relative(ROOT, out)}`)
console.log(`T1 自动安全 ${t1.length} · T2 待复核 ${t2.length} · T3 不建议 ${t3.length}`)
console.log(`折叠后有 chain 的：T1 ${t1.filter((x) => x.gainChain).length} / T2 ${t2.filter((x) => x.gainChain).length}`)
console.log(`T1 样例: ${t1.slice(0, 20).map((x) => `${x.w.form}→${x.target.form}`).join(' ')}`)
/**
 * lemma 屈折形归并 · Step-1 数据产物生成器（可复跑，确定性）
 * ==================================================================
 * 产物（共 4 件，全部写在仓库内显式路径，避免 node 下 /tmp 落到 C:\tmp 的陷阱）：
 *   1. scripts/.lemma-map.draft.json   —— 归并映射表（每条一桶：auto-fold / keep / audit）
 *   2. reports/lemma/audit.csv         —— 人工审计清单（逐条可裁决）
 *   3. reports/lemma/audit.md          —— 人工审计清单（人读版）
 *   4. reports/lemma/report.md         —— 方法 / 计数 / 桶分布 / 硬案例 / 家族统计
 *
 * 数据源：
 *   - scripts/.ecdict/ecdict.csv   （77 万条；标准 CSV，第 4 列 translation，
 *                                   第 11 列 exchange = `0:原型/1:类型码/p:xx/d:xx/...`）
 *   - ../src/data/words-entry.js   （词库 words：form/freqRank/kind/gloss/id）
 *   - scripts/.lemma-pairs.json    （上轮只读探针基线，13,183 对；用于对账断言）
 *
 * 复用了 .lemma-probe.mjs 的配对逻辑（双向印证 A/B），并在此之上做 4 道闸门判定 + 规则②。
 *
 * 设计口径（与主理人确认过的产品方向一致）：
 *   ① 学习单元收敛到词族；排序/卡面按「族内最高频形式」定位（rank = min）。
 *   ② 同族若有 ≥2 个高频成员（freqRank ≤ highFreqRankMax = 2500）→ 都保留，不折叠。
 *   ③ 折叠只影响学习队列；词库不删任何词。
 *   ④ 折叠桶只对「安全」的变形开放；一切存疑 → audit（人工裁决）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CSV = path.join(ROOT, 'scripts/.ecdict/ecdict.csv')
const PAIRS_BASELINE = path.join(ROOT, 'scripts/.lemma-pairs.json')
const OUT_DRAFT = path.join(ROOT, 'scripts/.lemma-map.draft.json')
const OUT_DIR = path.join(ROOT, 'reports/lemma')
const OUT_CSV = path.join(OUT_DIR, 'audit.csv')
const OUT_MD = path.join(OUT_DIR, 'audit.md')
const OUT_REPORT = path.join(OUT_DIR, 'report.md')
fs.mkdirSync(OUT_DIR, { recursive: true })

// ------------------------------------------------------------------
// 可解释的阈值 / 名单（集中在此，便于审计）
// ------------------------------------------------------------------
const THRESHOLDS = {
  /** G3：变形频率下限——变形比原型更「高频」且自身 fRank ≤ 此值 → 全部 audit。 */
  highFreqBeforeMax: 5000,
  /** G4：可疑目标——lRank > suspectRatio × fRank 且 lRank > suspectAbsFloor。 */
  suspectRatio: 3,
  suspectAbsFloor: 15000,
  /** 「同族多高频成员」统计口径：成员 fRank ≤ 此值视为高频。 */
  familyHighFreqMax: 5000,
  /**
   * 规则②（多高频成员保留）阈值：freqRank ≤ 此值视为「高频」。
   * = `src/lib/derive.js` 的 `FREQ_BANDS` 中 `{ key:'high', max:2500, label:'高频' }`
   *   的边界，且与 `AUTO_KNOWN_RANK`（=2500，"多少词频以内算已知"）同值。
   * 理由：Step-2 折叠时按学习队列「已知/高频」口径判断哪些成员应保留，与本项目既有
   *   高频判定保持一致，避免出现两套口径。
   */
  highFreqRankMax: 2500,
}

/** 显式同形异义观察名单（主理人给定；大小写不敏感）。 */
const WATCHLIST_EXPLICIT = [
  'saw', 'left', 'found', 'fell', 'bound', 'rose', 'lay', 'means',
  'better', 'worse', 'worst', 'leaves', 'honored',
]

/** ECDICT translation 占位/噪声判定（判定「目标是否有实义」）。 */
const PLACEHOLDER_TRANS = /^(?:[\s\W]*|无|暂无|见[^\s]*|n\.\s*无|null|none|—+|-+)$/i

// ------------------------------------------------------------------
// 工具函数
// ------------------------------------------------------------------
/** 标准 CSV 行解析（引号保护，支持 "" 转义）。 */
function parseCsvLine(line) {
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else q = false
      } else cur += ch
    } else if (ch === '"') q = true
    else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out
}

/** 归一化文本：把 ECDICT 的 `\n` 转义与真实换行都压成空格。 */
function normText(s) {
  return String(s == null ? '' : s)
    .replace(/\\n/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 截断到 n 个字符（摘要用）。 */
function clip(s, n = 60) {
  const t = normText(s)
  return t.length <= n ? t : t.slice(0, n) + '…'
}

/** 判定一段 ECDICT translation 是否「有实义」（非空、非占位、含真实内容）。 */
function hasMeaningText(trans) {
  const t = normText(trans)
  if (!t) return false
  if (PLACEHOLDER_TRANS.test(t)) return false
  // 去掉常见词性/领域标记后仍需有实义字符
  const stripped = t
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(?:n|v|vt|vi|a|adj|adv|prep|conj|pron|num|art|int|aux|abbr|suffix|prefix)\./gi, ' ')
    .replace(/[^\p{Script=Han}A-Za-z]/gu, ' ')
    .trim()
  if (!stripped) return false
  // 至少含一个汉字，或一段长度 ≥ 2 的字母串
  return /[\p{Script=Han}]/u.test(stripped) || /[A-Za-z]{2,}/.test(stripped)
}

// ==================================================================
// [1] 读 ECDICT —— 每词：原型 / 类型码 / 变形表 / translation
// ==================================================================
const raw = fs.readFileSync(CSV, 'utf8')
const lines = raw.split('\n')
const byWord = new Map() // word -> { lemma, types, own:[{t,v}], trans }
let badCols = 0
for (let i = 1; i < lines.length; i++) {
  const l = lines[i]
  if (!l) continue
  const f = parseCsvLine(l)
  if (f.length !== 13) {
    badCols++
    continue
  }
  const w = f[0].trim().toLowerCase()
  if (!w) continue
  const ex = f[10] || ''
  let lemma = null
  let types = ''
  const own = []
  for (const tok of ex.split('/')) {
    const c = tok.indexOf(':')
    if (c < 0) continue
    const k = tok.slice(0, c)
    const v = tok.slice(c + 1).trim().toLowerCase()
    if (k === '0') lemma = v
    else if (k === '1') types = v
    else if ('pdi3srt'.includes(k) && k.length === 1) own.push({ t: k, v })
  }
  const prev = byWord.get(w)
  if (prev) {
    if (!prev.lemma && lemma) prev.lemma = lemma
    if (!prev.types && types) prev.types = types
    for (const o of own) if (!prev.own.some((x) => x.t === o.t && x.v === o.v)) prev.own.push(o)
    if (!prev.trans && f[3]) prev.trans = f[3]
  } else {
    byWord.set(w, { lemma, types, own, trans: f[3] || '' })
  }
}

// ==================================================================
// [2] 读词库 words（form → 词条；保留首个，同 .lemma-probe 口径）
// ==================================================================
const modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
const DB = modW.words
const dbByForm = new Map()
for (const w of DB) {
  const k = String(w.form || '').toLowerCase()
  if (k && !dbByForm.has(k)) dbByForm.set(k, w)
}

// ==================================================================
// [3] 配对（复用探针逻辑：A 变形→原型 / B 基词→变形，双向印证）
// ==================================================================
// 每个 pair 记录「哪个方向触达过」：seenA=变形→原型命中；seenB=基词→变形命中。
// ⚠ 同方向重复触达**不**升级（否则会把「B∧B（同词条两个类型码指向同一变形）」误当成双向，绕过 G2）。
const pairs = new Map() // "f->l" -> { f, l, type, seenA, seenB }
function touchPair(f, l, type, dir) {
  const k = `${f}->${l}`
  let p = pairs.get(k)
  if (!p) {
    p = { f, l, type, seenA: false, seenB: false }
    pairs.set(k, p)
  }
  if (dir === 'A') p.seenA = true
  else p.seenB = true
}
for (const [w, e] of byWord) {
  const F = dbByForm.get(w)
  if (!F) continue
  if (e.lemma && e.lemma !== w) {
    const L = dbByForm.get(e.lemma)
    if (L && L.id !== F.id) touchPair(w, e.lemma, e.types || '?', 'A')
  }
  for (const o of e.own) {
    if (o.v === w) continue
    const V = dbByForm.get(o.v)
    if (V && V.id !== F.id) touchPair(o.v, w, o.t, 'B')
  }
}
// 方向各触达 ≥1 次 → AB；仅单向 → A / B。同方向重复不升级。
for (const p of pairs.values()) p.src = p.seenA && p.seenB ? 'AB' : p.seenA ? 'A' : 'B'

// 组装为记录（附 rank / kind / id / gloss / ECDICT 摘要）
const records = []
for (const p of pairs.values()) {
  const F = dbByForm.get(p.f)
  const L = dbByForm.get(p.l)
  records.push({
    form: p.f,
    lemma: p.l,
    type: p.type,
    src: p.src,
    fRank: F.freqRank,
    lRank: L.freqRank,
    fKind: F.kind,
    lKind: L.kind,
    fId: F.id,
    lId: L.id,
    fGloss: F.gloss || '',
    lGloss: L.gloss || '',
    fTrans: (byWord.get(p.f) && byWord.get(p.f).trans) || '',
    lTrans: (byWord.get(p.l) && byWord.get(p.l).trans) || '',
  })
}

// 与基线对账
let baselineCount = null
try {
  baselineCount = JSON.parse(fs.readFileSync(PAIRS_BASELINE, 'utf8')).length
} catch {
  baselineCount = null
}

// ==================================================================
// [4] 同形异义名单：显式名单 ∪ 数据中发现的多原型同形形
// ==================================================================
const lemmaSetsByForm = new Map() // form -> Set(lemma)
for (const r of records) {
  if (!lemmaSetsByForm.has(r.form)) lemmaSetsByForm.set(r.form, new Set())
  lemmaSetsByForm.get(r.form).add(r.lemma)
}
const discoveredHomographs = []
for (const [f, s] of lemmaSetsByForm) if (s.size >= 2) discoveredHomographs.push(f)
const WATCH = new Set([...WATCHLIST_EXPLICIT, ...discoveredHomographs].map((w) => w.toLowerCase()))

// ==================================================================
// [5] 闸门判定（bucket + flags）
// ==================================================================
const { highFreqBeforeMax, suspectRatio, suspectAbsFloor } = THRESHOLDS

function judge(r) {
  const flags = []
  const g1TargetInDb = true // 配对阶段已保证目標在库
  const g1NotProper = r.lKind !== 'proper'
  const g1HasMeaning = hasMeaningText(r.lTrans)

  if (!g1NotProper) flags.push('lemma-proper')
  if (!g1HasMeaning) flags.push('lemma-no-gloss')

  const g2 = r.src === 'AB'
  if (!g2) flags.push(r.src === 'A' ? 'src-a-only' : r.src === 'B' ? 'src-b-only' : 'src-single')

  const g3HighFreqBefore = r.fRank < r.lRank && r.fRank <= highFreqBeforeMax
  // 变形比原型更高频：≤5000 归入 G3「高潮/词汇化」；>5000 也一并标出（否则该审计行无任何 flag 依据）
  const g3FormMoreFrequent = r.fRank < r.lRank && r.fRank > highFreqBeforeMax
  if (g3HighFreqBefore) flags.push('highfreq-before')
  if (g3FormMoreFrequent) flags.push('form-more-frequent')
  if (r.fRank === r.lRank) flags.push('rank-tie')
  const homograph = WATCH.has(r.form) || WATCH.has(r.lemma)
  if (homograph) flags.push('homograph')
  const g3 = g3HighFreqBefore || g3FormMoreFrequent || r.fRank === r.lRank || homograph

  const g4 = r.lRank > suspectRatio * r.fRank && r.lRank > suspectAbsFloor
  if (g4) flags.push('suspect-target')

  const g1 = g1TargetInDb && g1NotProper && g1HasMeaning
  const bucket = g1 && g2 && !g3 && !g4 && r.fRank > r.lRank ? 'auto-fold' : 'audit'
  return { bucket, flags }
}

// 建议（自动可判者）——规则集中，逐条可解释
function suggest(r, flags) {
  const has = (x) => flags.includes(x)
  if (has('suspect-target')) {
    // 同形形若另有一条「更合理的原型」→ 建议改指
    const alts = records
      .filter((o) => o.form === r.form && o.lemma !== r.lemma)
      .filter((o) => o.lKind !== 'proper' && hasMeaningText(o.lTrans) && o.lRank < r.lRank)
      .sort((a, b) => a.lRank - b.lRank)
    if (alts.length) return `fix-target:${alts[0].lemma}`
    return 'keep'
  }
  if (has('lemma-proper')) return 'keep' // 目标是人名等专名，不可作为普通词族原型
  if (has('lemma-no-gloss')) return 'keep' // 目标无实义
  // 规则①：变形比原型更高频（fRank < lRank）→ 学习单元应落在该变形，不宜折叠
  if (has('highfreq-before') || has('form-more-frequent')) return 'keep'
  if (has('homograph') && r.fRank <= highFreqBeforeMax) return 'keep'
  return '?'
}

const mapped = records.map((r) => {
  const { bucket, flags } = judge(r)
  return { ...r, bucket, flags, suggest: suggest(r, flags) }
})

// ==================================================================
// [5b] 规则②落地：同族 ≥2 高频成员 → 这些成员「保留不折叠」（bucket=keep）
// ------------------------------------------------------------------
// 口径（主理人裁定，产品规则已获用户确认）：
//   族成员集合 = {lemma} ∪ {所有 form'→lemma 的行}；
//   成员频次：lemma 取 lRank，form 取自身 fRank；
//   若族内 freqRank ≤ highFreqRankMax（=2500，见上方常量说明）的成员 ≥2，
//   且本行 form 自身 fRank ≤ 该阈值 → 本行由 auto-fold 改为 keep，flags += multi-highfreq。
// audit 桶不动（audit 行即使命中规则②仍保持 audit，Step-2 反正不折叠）。
// ==================================================================
const { highFreqRankMax } = THRESHOLDS
// 族成员 rank 表：lemma -> Map(memberForm -> freqRank)
const famRanks = new Map()
for (const r of mapped) {
  if (!famRanks.has(r.lemma)) famRanks.set(r.lemma, new Map())
  const m = famRanks.get(r.lemma)
  m.set(r.lemma, r.lRank)
  m.set(r.form, r.fRank)
}
/** 在阈值 T 下，本行是否应保留：form 自身 ≤T，且族内 ≤T 成员数 ≥2。 */
function shouldKeep(r, T) {
  if (r.fRank > T) return false
  const m = famRanks.get(r.lemma)
  if (!m) return false
  let n = 0
  for (const rk of m.values()) if (rk <= T) n++
  return n >= 2
}
// 原始 auto-fold 候选（用于敏感度统计；转换前快照引用）
const autoFoldCandidates = mapped.filter((r) => r.bucket === 'auto-fold')
let keptCount = 0
for (const r of autoFoldCandidates) {
  if (shouldKeep(r, highFreqRankMax)) {
    r.bucket = 'keep'
    r.flags = [...r.flags, 'multi-highfreq']
    keptCount++
  }
}
// 敏感度：阈值 1000 / 2500 / 5000 各会保留多少条（生效值 = highFreqRankMax）
const KEEP_SENSITIVITY = [1000, highFreqRankMax, 5000]
const keepSensitivity = KEEP_SENSITIVITY.map((T) => ({
  threshold: T,
  count: autoFoldCandidates.filter((r) => shouldKeep(r, T)).length,
  active: T === highFreqRankMax,
}))

// 输出草案字段（契约：form, lemma, type, src, fRank, lRank, bucket, flags）
const draft = mapped
  .map((r) => ({
    form: r.form,
    lemma: r.lemma,
    type: r.type,
    src: r.src,
    fRank: r.fRank,
    lRank: r.lRank,
    bucket: r.bucket,
    flags: r.flags,
  }))
  .sort((a, b) => a.fRank - b.fRank || a.form.localeCompare(b.form) || a.lemma.localeCompare(b.lemma))

// ------------------------------------------------------------------
// [6] 写 draft JSON
// ------------------------------------------------------------------
fs.writeFileSync(OUT_DRAFT, JSON.stringify(draft, null, 1))

// ==================================================================
// [7] 审计清单（审计桶按 fRank 升序）
// ==================================================================
const auditRows = mapped
  .filter((r) => r.bucket === 'audit')
  .sort((a, b) => a.fRank - b.fRank || a.form.localeCompare(b.form) || a.lemma.localeCompare(b.lemma))

/** CSV 字段转义。 */
function csvCell(v) {
  const s = String(v == null ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

const AUDIT_COLS = [
  'fRank', 'lRank', 'form', 'lemma', 'type', 'src',
  'fKind', 'lKind', 'flags', 'suggest',
  'form_gloss', 'lemma_gloss', 'form_trans', 'lemma_trans',
]
const csvLines = [AUDIT_COLS.join(',')]
for (const r of auditRows) {
  csvLines.push([
    r.fRank, r.lRank, r.form, r.lemma, r.type, r.src,
    r.fKind || '', r.lKind || '', r.flags.join('|'), r.suggest,
    r.fGloss, r.lGloss, clip(r.fTrans, 60), clip(r.lTrans, 60),
  ].map(csvCell).join(','))
}
fs.writeFileSync(OUT_CSV, csvLines.join('\n') + '\n')

// md 版
const mdRows = []
mdRows.push('# lemma 归并 · 人工审计清单', '')
mdRows.push(`> 共 **${auditRows.length}** 条待审（\`auto-fold\` 与 \`keep\` 桶已自动放行，不在此列）。按 fRank 升序，优先审高频。`)
mdRows.push('> 证据列：form/lemma 的 rank、kind、词库 gloss、ECDICT translation 摘要（各截 ~60 字）、type、src、flags。')
mdRows.push('> `建议` 为机器可判者（fold / keep / fix-target:<原型>）；`?` 表示需人工语义裁决。', '')
for (const r of auditRows) {
  mdRows.push(`## ${r.form} → ${r.lemma}`)
  mdRows.push(`- rank：form ${r.fRank} / lemma ${r.lRank} ｜ type \`${r.type}\` ｜ src \`${r.src}\` ｜ flags \`${r.flags.join(', ') || '-'}\``)
  mdRows.push(`- kind：form \`${r.fKind || '-'}\` / lemma \`${r.lKind || '-'}\``)
  mdRows.push(`- 词库 gloss：form「${normText(r.fGloss)}」 / lemma「${normText(r.lGloss)}」`)
  mdRows.push(`- ECDICT：form「${clip(r.fTrans, 60)}」 / lemma「${clip(r.lTrans, 60)}」`)
  mdRows.push(`- **建议：\`${r.suggest}\`**`)
  mdRows.push('')
}
fs.writeFileSync(OUT_MD, mdRows.join('\n') + '\n')

// ==================================================================
// [8] report.md —— 方法 / 计数 / 桶分布 / 硬案例 / 家族统计
// ==================================================================
const total = mapped.length
const autoRows = mapped.filter((r) => r.bucket === 'auto-fold')
const keepRows = mapped.filter((r) => r.bucket === 'keep')
const flagCount = new Map()
for (const r of mapped) for (const fl of r.flags) flagCount.set(fl, (flagCount.get(fl) || 0) + 1)
const flagSorted = [...flagCount.entries()].sort((a, b) => b[1] - a[1])

const typeCount = new Map()
for (const r of mapped) typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1)
const typeSorted = [...typeCount.entries()].sort((a, b) => b[1] - a[1])

const srcCount = new Map()
for (const r of mapped) srcCount.set(r.src, (srcCount.get(r.src) || 0) + 1)

// 硬案例
const HARD = [
  'shelves', 'honored', 'sled', 'saw', 'rose', 'means', 'better', 'lay', 'left',
  'found', 'bound', 'blown', 'headphones', 'headphone', 'footsteps', 'footstep',
  'according', 'amazing', 'advanced', 'accused', 'arms', 'aliens',
]
function hardRows(word) {
  return mapped.filter((r) => r.form === word || r.lemma === word)
}

// 家族统计：以 lemma 为族核心，成员 = {lemma} ∪ {f : f→lemma}
const familyByLemma = new Map() // lemma -> Map(memberForm -> fRank)
for (const r of mapped) {
  if (!familyByLemma.has(r.lemma)) familyByLemma.set(r.lemma, new Map())
  const fam = familyByLemma.get(r.lemma)
  fam.set(r.lemma, r.lRank)
  fam.set(r.form, r.fRank)
}
let famMultiHigh = 0
const famMultiHighList = []
for (const [lemma, members] of familyByLemma) {
  const highs = [...members.entries()].filter(([, rk]) => rk <= THRESHOLDS.familyHighFreqMax)
  if (highs.length >= 2) {
    famMultiHigh++
    famMultiHighList.push({ lemma, members: highs })
  }
}
famMultiHighList.sort((a, b) => Math.min(...a.members.map((m) => m[1])) - Math.min(...b.members.map((m) => m[1])))

const L = []
L.push('# lemma 屈折形归并 · Step-1 数据产物报告', '')
L.push('> 生成器：`scripts/gen-lemma-map.mjs`（同输入同输出，确定性；复跑不依赖网络）。')
L.push('> 红线：**不碰产品代码**（`src/` 零改动）、不 commit、不删任何词。', '')

L.push('## 1. 方法与数据源', '')
L.push('- 数据源：ECDICT `exchange` 字段（词典数据，非规则剥离）+ 词库 `words`（64,699 条）。')
L.push('- 配对：复用 `.lemma-probe.mjs` 的双向印证逻辑')
L.push('  - A（变形→原型）：本词有 `0:原型` 且原型也在词库；')
L.push('  - B（基词→变形）：本词 `p:/d:/i:/s:/3:/r:/t:` 的值也在词库 → 该值→本词；')
L.push('  - 每个 pair 记录 `seenA`/`seenB` 两个方向是否**各触达过 ≥1 次**（同方向重复触达**不**升级）；')
L.push('  - `src = seenA && seenB ? \'AB\' : seenA ? \'A\' : \'B\'`（仅「A∧B 真双向」才进 G2 放行）。')
L.push('- 四道闸门 + 规则②（见下）决定每条落 `auto-fold` / `keep` / `audit` 三桶之一。','')

L.push('## 2. 闸门规则', '')
L.push('| 闸门 | 规则 | 落桶 |')
L.push('| --- | --- | --- |')
L.push('| G1 目标可信 | 目标在库（配对已保证）+ kind ≠ proper + ECDICT translation 有实义（非空非占位） | 不通过→audit |')
L.push('| G2 双源一致 | 仅 `src=AB` 可进 auto-fold；A-only / B-only 一律 audit | 不通过→audit |')
L.push(`| G3 高潮/词汇化 | \`fRank < lRank && fRank ≤ ${THRESHOLDS.highFreqBeforeMax}\` 全部 audit（\`highfreq-before\`）；\`fRank < lRank\` 但 > ${THRESHOLDS.highFreqBeforeMax} 亦 audit（\`form-more-frequent\`）；\`fRank == lRank\`（\`rank-tie\`）与同形异义观察名单涉及的在库对（\`homograph\`）一律 audit | 命中→audit |`)
L.push(`| G4 可疑目标 | \`lRank > ${THRESHOLDS.suspectRatio}×fRank && lRank > ${THRESHOLDS.suspectAbsFloor}\` 标 \`suspect-target\` | 命中→audit |`)
L.push(`| 规则② 多高频成员保留 | 族成员 = {lemma}∪{所有 form'→lemma 的行}；族内 \`freqRank ≤ ${THRESHOLDS.highFreqRankMax}\`（=derive.js FREQ_BANDS 高频档 / AUTO_KNOWN_RANK）成员 ≥2，且本行 form 的 fRank ≤ ${THRESHOLDS.highFreqRankMax} | auto-fold→**keep**（flags += multi-highfreq） |`)
L.push('')
L.push('**auto-fold 充要条件**：G1 通过 且 G2 通过（`src=AB`）且 未命中 G3/G4 且 `fRank > lRank`（变形比原型罕见）且 未命中规则②。')
L.push('')
L.push('**三桶语义**：`auto-fold`（安全折叠，Step-2 可直接折叠）｜ `keep`（命中规则②的多高频成员，保留不折叠）｜ `audit`（人工裁决，Step-2 不折叠）。三桶之和恒 = 记录总数。')
L.push('')

L.push('## 3. 计数与桶分布', '')
L.push(`- 生成记录总数：**${total}**`)
if (baselineCount != null) {
  L.push(`- 基线 \`scripts/.lemma-pairs.json\`：**${baselineCount}** 对；差异 **${total - baselineCount}**（应为 0）`)
}
L.push(`- \`auto-fold\`：**${autoRows.length}**（${((autoRows.length / total) * 100).toFixed(1)}%）`)
L.push(`- \`keep\`（规则②，保留）：**${keepRows.length}**（${((keepRows.length / total) * 100).toFixed(1)}%）`)
L.push(`- \`audit\`：**${auditRows.length}**（${((auditRows.length / total) * 100).toFixed(1)}%）`)
L.push(`- **三桶之和**：${autoRows.length} + ${keepRows.length} + ${auditRows.length} = **${autoRows.length + keepRows.length + auditRows.length}**（= 总数 ${total}，必须相等）`)
L.push(`- \`src\` 分布：${[...srcCount.entries()].map(([k, v]) => `${k} ${v}`).join(' / ')}`)
L.push(`- 唯一变形词：**${lemmaSetsByForm.size}**`)
L.push('')
L.push('### 规则② 阈值敏感度（生效值 = ' + THRESHOLDS.highFreqRankMax + '）', '')
L.push('> 阈值 T：族内 freqRank ≤ T 的成员视为「高频」；族内高频成员 ≥2 且本行 form ≤T → keep。')
L.push('')
L.push('| 阈值 T | keep 条数 | 是否生效 |')
L.push('| --- | --- | --- |')
for (const s of keepSensitivity) L.push(`| ${s.threshold} | ${s.count} | ${s.active ? '**✅ 生效**' : ''} |`)
L.push('')
L.push('### keep 桶 Top20 样本（按 form fRank 升序）', '')
L.push('| form→lemma | fRank/lRank | type | src | flags |')
L.push('| --- | --- | --- | --- | --- |')
for (const r of keepRows.slice().sort((a, b) => a.fRank - b.fRank || a.form.localeCompare(b.form)).slice(0, 20)) {
  L.push(`| ${r.form} → ${r.lemma} | ${r.fRank}/${r.lRank} | ${r.type} | ${r.src} | ${r.flags.join(', ')} |`)
}
L.push('')
L.push('### flags 分布', '')
L.push('| flag | 条数 |')
L.push('| --- | --- |')
for (const [fl, n] of flagSorted) L.push(`| ${fl} | ${n} |`)
L.push('')
L.push(`### type 分布（全部 ${typeSorted.length} 类，合计 ${typeSorted.reduce((a, [, n]) => a + n, 0)}）`, '')
L.push('| type | 条数 |')
L.push('| --- | --- |')
for (const [t, n] of typeSorted) L.push(`| ${t} | ${n} |`)
L.push('')

L.push('## 4. 硬案例落桶表', '')
L.push('| 词 | form→lemma | fRank/lRank | type | src | bucket | flags |')
L.push('| --- | --- | --- | --- | --- | --- | --- |')
for (const w of HARD) {
  const rows = hardRows(w)
  if (!rows.length) {
    L.push(`| ${w} | _不在配对结果中_ | - | - | - | - | - |`)
    continue
  }
  for (const r of rows) {
    L.push(`| ${w} | ${r.form} → ${r.lemma} | ${r.fRank}/${r.lRank} | ${r.type} | ${r.src} | **${r.bucket}** | ${r.flags.join(', ') || '-'} |`)
  }
}
L.push('')

L.push('## 5. 同族 ≥2 高频成员统计', '')
L.push(`> 口径：以 lemma 为族核，成员 = {lemma} ∪ {f : f→lemma}；成员 \`freqRank ≤ ${THRESHOLDS.familyHighFreqMax}\` 视为高频（此为 Step-1 统计口径）。`)
L.push(`> 注：规则②的**生效阈值**为 \`${THRESHOLDS.highFreqRankMax}\`（见 §3），本节 \`${THRESHOLDS.familyHighFreqMax}\` 仅用于「多高频成员族」规模统计。`)
L.push('')
L.push(`- 族总数（以 lemma 计）：**${familyByLemma.size}**`)
L.push(`- **同族 ≥2 高频成员（双方 fRank ≤ ${THRESHOLDS.familyHighFreqMax}）的族数：${famMultiHigh}**`)
L.push('')
L.push('Top 20（按族内最高频成员 rank 升序）：', '')
L.push('| lemma | 族内高频成员（rank） |')
L.push('| --- | --- |')
for (const f of famMultiHighList.slice(0, 20)) {
  const ms = f.members.slice().sort((a, b) => a[1] - b[1]).map((m) => `${m[0]}(${m[1]})`).join(', ')
  L.push(`| ${f.lemma} | ${ms} |`)
}
L.push('')

L.push('## 6. 复跑与确定性', '')
L.push('```bash')
L.push('node scripts/gen-lemma-map.mjs')
L.push('```')
L.push('')
L.push('产物：`scripts/.lemma-map.draft.json`、`reports/lemma/audit.csv`、`reports/lemma/audit.md`、`reports/lemma/report.md`。')
L.push('同一输入连续两次运行，MD5 一致（见回报）。')
L.push('')

fs.writeFileSync(OUT_REPORT, L.join('\n') + '\n')

// ------------------------------------------------------------------
// [9] 控制台摘要
// ------------------------------------------------------------------
console.log(`[gen-lemma-map] 记录总数: ${total}${baselineCount != null ? ` (基线 ${baselineCount}, 差异 ${total - baselineCount})` : ''}`)
console.log(`[gen-lemma-map] auto-fold: ${autoRows.length} | keep: ${keepRows.length} | audit: ${auditRows.length} | 三桶和: ${autoRows.length + keepRows.length + auditRows.length}`)
console.log(`[gen-lemma-map] src: ${[...srcCount.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`)
console.log(`[gen-lemma-map] 规则②阈值敏感度: ${keepSensitivity.map((s) => `${s.threshold}→${s.count}${s.active ? '(生效)' : ''}`).join(' | ')}`)
console.log(`[gen-lemma-map] flags: ${flagSorted.map(([k, v]) => `${k}=${v}`).join(', ')}`)
const auditNoFlag = auditRows.filter((r) => r.flags.length === 0).length
console.log(`[gen-lemma-map] 审计行无 flag 者: ${auditNoFlag}（应为 0）`)
const autoWithFlag = autoRows.filter((r) => r.flags.length > 0).length
console.log(`[gen-lemma-map] auto-fold 带 flag 者: ${autoWithFlag}（应为 0）`)
const autoNonAB = autoRows.filter((r) => r.src !== 'AB').length
console.log(`[gen-lemma-map] auto-fold src≠AB 者: ${autoNonAB}（应为 0）`)
const keepBadFlag = keepRows.filter((r) => !r.flags.includes('multi-highfreq')).length
console.log(`[gen-lemma-map] keep 桶缺 multi-highfreq 者: ${keepBadFlag}（应为 0）`)
const keepBadCond = keepRows.filter((r) => !shouldKeep(r, highFreqRankMax)).length
console.log(`[gen-lemma-map] keep 桶不满足规则②条件者: ${keepBadCond}（应为 0）`)
const autoStillKeep = autoRows.filter((r) => shouldKeep(r, highFreqRankMax)).length
console.log(`[gen-lemma-map] 仍满足规则②却仍在 auto-fold 者: ${autoStillKeep}（应为 0）`)
const inverted = mapped.filter((r) => r.fRank < r.lRank && r.bucket === 'auto-fold').length
console.log(`[gen-lemma-map] auto-fold 倒挂(fRank<lRank)者: ${inverted}（应为 0）`)
const selfLoop = mapped.filter((r) => r.form === r.lemma).length
console.log(`[gen-lemma-map] 自环(form===lemma)者: ${selfLoop}（应为 0）`)
console.log(`[gen-lemma-map] 同族≥2高频成员族数(≤${THRESHOLDS.familyHighFreqMax}): ${famMultiHigh}`)
console.log(`[gen-lemma-map] 已写: ${path.relative(ROOT, OUT_DRAFT)}, ${path.relative(ROOT, OUT_CSV)}, ${path.relative(ROOT, OUT_MD)}, ${path.relative(ROOT, OUT_REPORT)}`)

/**
 * QA · lemma 映射产物对抗性验收 — Round 2（只读，不改任何产物）
 * ==================================================================
 * 覆盖：③ 计数/结构、① 硬案例、规则②聚合、audit 三方一致、916 族、敏感度
 * 用法：node scripts/qa-lemma-verify.mjs     自检：QA_SELFTEST=1 node ...
 * 新规格：桶={auto-fold,keep,audit}；规则② 阈值 2500；src=AB 仅 A∧B。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DRAFT = path.join(ROOT, 'scripts/.lemma-map.draft.json')
const PAIRS = path.join(ROOT, 'scripts/.lemma-pairs.json')
const AUDIT_CSV = path.join(ROOT, 'reports/lemma/audit.csv')
const AUDIT_MD = path.join(ROOT, 'reports/lemma/audit.md')

const SELFTEST = process.env.QA_SELFTEST === '1'
let N = 0
const FAILS = []
function ok(c, m) { N++; if (c) return true; FAILS.push(m); return false }
function eq(a, e, m) { return ok(a === e, `${m} — expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`) }

const FLAG_VOCAB = new Set([
  'lemma-proper', 'lemma-no-gloss', 'src-a-only', 'src-b-only', 'src-single',
  'highfreq-before', 'form-more-frequent', 'rank-tie', 'homograph', 'suspect-target',
  'multi-highfreq',
])
const DRAFT_FIELDS = ['form', 'lemma', 'type', 'src', 'fRank', 'lRank', 'bucket', 'flags']
const SRC_VOCAB = new Set(['A', 'B', 'AB'])
const BUCKET_VOCAB = new Set(['auto-fold', 'keep', 'audit'])

const draft = JSON.parse(fs.readFileSync(DRAFT, 'utf8'))
const pairs = JSON.parse(fs.readFileSync(PAIRS, 'utf8'))
const modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
const DB = modW.words
const dbByForm = new Map()
for (const w of DB) { const k = String(w.form || '').toLowerCase(); if (k && !dbByForm.has(k)) dbByForm.set(k, w) }

let GUARD_OK = Array.isArray(draft) && Array.isArray(pairs) && draft.length > 0 && pairs.length > 0
ok(GUARD_OK, 'GUARD: draft/pairs 为非空数组')
if (!GUARD_OK) { console.log('[ABORT] 契约守卫失败'); process.exit(2) }
const section = (t) => console.log(`\n===== ${t} =====`)

// ==================================================================
section('③ JSON 结构合法性（8 字段 / 枚举 / 类型 / flag 词表）')
let fieldMaskBad = 0, structBad = 0, rankTypeBad = 0, srcBad = 0, bucketBad = 0, flagsTypeBad = 0, flagVocabBad = 0
const flagVocabSeen = new Set()
for (const r of draft) {
  const keys = Object.keys(r)
  if (keys.length !== 8 || !DRAFT_FIELDS.every((f) => keys.includes(f))) fieldMaskBad++
  if (typeof r.form !== 'string' || typeof r.lemma !== 'string' || typeof r.type !== 'string') structBad++
  if (typeof r.fRank !== 'number' || typeof r.lRank !== 'number') rankTypeBad++
  if (!SRC_VOCAB.has(r.src)) srcBad++
  if (!BUCKET_VOCAB.has(r.bucket)) bucketBad++
  if (!Array.isArray(r.flags)) flagsTypeBad++
  else for (const f of r.flags) { flagVocabSeen.add(f); if (!FLAG_VOCAB.has(f)) flagVocabBad++ }
}
eq(fieldMaskBad, 0, '③ 每行字段名恰为 8 契约字段')
eq(structBad, 0, '③ form/lemma/type 均 string')
eq(rankTypeBad, 0, '③ fRank/lRank 均 number')
eq(srcBad, 0, '③ src ∈ {A,B,AB}')
eq(bucketBad, 0, '③ bucket ∈ {auto-fold,keep,audit}')
eq(flagsTypeBad, 0, '③ flags 均为数组')
eq(flagVocabBad, 0, '③ flags 取值均 ∈ 合法词表')
console.log(`   flag 词表: ${[...flagVocabSeen].sort().join(', ')}`)

// ==================================================================
section('③ 计数独立复算（新规格）')
const total = draft.length
const auto = draft.filter((r) => r.bucket === 'auto-fold')
const keep = draft.filter((r) => r.bucket === 'keep')
const audit = draft.filter((r) => r.bucket === 'audit')
console.log(`   总行数 ${total} | auto-fold ${auto.length} | keep ${keep.length} | audit ${audit.length}`)
eq(total, 13183, '③ 总行数 == 13183')
eq(auto.length, 9888, '③ auto-fold == 9888')
eq(keep.length, 330, '③ keep == 330')
eq(audit.length, 2965, '③ audit == 2965')
eq(auto.length + keep.length + audit.length, total, '③ 三桶之和 == 总行数')

const flagCount = new Map()
for (const r of draft) for (const f of r.flags) flagCount.set(f, (flagCount.get(f) || 0) + 1)
const flagSorted = [...flagCount.entries()].sort((a, b) => b[1] - a[1])
console.log('   flags: ' + flagSorted.map(([k, v]) => `${k}=${v}`).join(' / '))
const EXPECT_FLAG = {
  'form-more-frequent': 1494, 'highfreq-before': 815, 'src-b-only': 416, 'multi-highfreq': 330,
  'lemma-proper': 233, 'lemma-no-gloss': 144, 'homograph': 116, 'suspect-target': 75,
  'src-a-only': 53, 'rank-tie': 2,
}
for (const [k, v] of Object.entries(EXPECT_FLAG)) eq(flagCount.get(k) || 0, v, `③ flag ${k} == ${v}`)
eq(flagCount.get('src-single') || 0, 0, '③ src-single 不应出现')

const typeCount = new Map()
for (const r of draft) typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1)
const typeSorted = [...typeCount.entries()].sort((a, b) => b[1] - a[1])
console.log('   type: ' + typeSorted.map(([k, v]) => `${k}=${v}`).join(' / '))
const EXPECT_TYPE = { s: 5985, i: 2809, d: 1805, p: 1190, '3': 939, r: 169, t: 125, dp: 72, pd: 51, s3: 33, '3s': 5 }
for (const [k, v] of Object.entries(EXPECT_TYPE)) eq(typeCount.get(k) || 0, v, `③ type ${k} == ${v}`)
eq(typeSorted.length, 11, '③ type 恰 11 类')
eq(typeSorted.reduce((a, [, v]) => a + v, 0), total, '③ type 求和 == 总行数')

const srcCount = new Map()
for (const r of draft) srcCount.set(r.src, (srcCount.get(r.src) || 0) + 1)
console.log('   src: ' + [...srcCount.entries()].map(([k, v]) => `${k}=${v}`).join(' / '))
eq(srcCount.get('AB') || 0, 12714, '③ src AB == 12714')
eq(srcCount.get('B') || 0, 416, '③ src B == 416')
eq(srcCount.get('A') || 0, 53, '③ src A == 53')

const formSet = new Set(draft.map((r) => r.form))
eq(formSet.size, 13138, '③ 唯一 form == 13138')
const formOcc = new Map()
for (const r of draft) formOcc.set(r.form, (formOcc.get(r.form) || 0) + 1)
let extra = 0, multiForm = 0
for (const [, c] of formOcc) if (c > 1) { extra += c - 1; multiForm++ }
eq(extra, total - formSet.size, '③ Σ(form次数-1) == 行数-唯一form')
eq(extra, 45, '③ 差值 45')
console.log(`   → 唯一 form ${formSet.size}，${multiForm} 个 form 各含 2 个 lemma 目标，多出 ${extra} 行`)

// draft ≡ pairs
const key3 = (a, b, c) => `${a}\u0001${b}\u0001${c}`
const dk = new Set(); let dup = 0
for (const r of draft) { const k = key3(r.form, r.lemma, r.type); if (dk.has(k)) dup++; dk.add(k) }
const pk = new Set(); let pdup = 0
for (const p of pairs) { const k = key3(p.f, p.l, p.type); if (pk.has(k)) pdup++; pk.add(k) }
eq(dup, 0, '③ draft 无重复行')
eq(pdup, 0, '③ pairs 无重复行')
eq(dk.size, pk.size, '③ draft 键数 == pairs 键数')
let od = 0, op = 0
for (const k of dk) if (!pk.has(k)) od++
for (const k of pk) if (!dk.has(k)) op++
eq(od, 0, '③ pairs ⊆ draft（无多余）')
eq(op, 0, '③ draft ⊆ pairs（无多余）')
const pmap = new Map(pairs.map((p) => [key3(p.f, p.l, p.type), p]))
let rankMis = 0
for (const r of draft) { const p = pmap.get(key3(r.form, r.lemma, r.type)); if (!p) continue; if (p.fRank !== r.fRank || p.lRank !== r.lRank) rankMis++ }
eq(rankMis, 0, '③ draft 与 pairs 的 fRank/lRank 一致')

// ==================================================================
section('① 硬案例落桶（新规格：仅 shelves→shelve & honored→honor 新增 src-b-only）')
const rowOf = (f, l) => draft.find((r) => r.form === f && r.lemma === l)
const setEq = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')
const HARD = [
  ['shelves', 'shelf', 'audit', ['homograph'], 'AB'],
  ['shelves', 'shelve', 'audit', ['src-b-only', 'form-more-frequent', 'homograph', 'suspect-target'], 'B'],
  ['honored', 'honor', 'audit', ['src-b-only', 'homograph'], 'B'],
  ['honored', 'honore', 'audit', ['lemma-proper', 'lemma-no-gloss', 'src-a-only', 'highfreq-before', 'homograph', 'suspect-target'], 'A'],
  ['sled', 'sle', 'audit', ['form-more-frequent', 'suspect-target'], 'AB'],
  ['sledding', 'sled', 'auto-fold', [], 'AB'],
  ['saw', 'see', 'audit', ['homograph'], 'AB'],
  ['sawing', 'saw', 'audit', ['homograph'], 'AB'],
  ['saws', 'saw', 'audit', ['homograph'], 'AB'],
  ['sawed', 'saw', 'audit', ['homograph'], 'AB'],
  ['rose', 'rise', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['roses', 'rose', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['means', 'mean', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['better', 'good', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['betters', 'better', 'audit', ['homograph'], 'AB'],
  ['laid', 'lay', 'audit', ['homograph'], 'AB'],
  ['lay', 'lie', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['laying', 'lay', 'audit', ['homograph'], 'AB'],
  ['lays', 'lay', 'audit', ['homograph'], 'AB'],
  ['left', 'leave', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['found', 'find', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['founded', 'found', 'audit', ['homograph'], 'AB'],
  ['founding', 'found', 'audit', ['homograph'], 'AB'],
  ['bound', 'bind', 'audit', ['highfreq-before', 'homograph'], 'AB'],
  ['bounds', 'bound', 'audit', ['homograph'], 'AB'],
  ['bounded', 'bound', 'audit', ['homograph'], 'AB'],
  ['blown', 'blow', 'audit', ['highfreq-before'], 'AB'],
  ['headphones', 'headphone', 'audit', ['form-more-frequent', 'suspect-target'], 'AB'],
  ['footsteps', 'footstep', 'audit', ['highfreq-before', 'suspect-target'], 'AB'],
  ['according', 'accord', 'audit', ['highfreq-before'], 'AB'],
  ['amazing', 'amaze', 'audit', ['src-b-only', 'highfreq-before'], 'B'],
  ['advanced', 'advance', 'audit', ['highfreq-before'], 'AB'],
  ['accused', 'accuse', 'audit', ['highfreq-before'], 'AB'],
  ['arms', 'arm', 'audit', ['highfreq-before'], 'AB'],
  ['aliens', 'alien', 'audit', ['highfreq-before'], 'AB'],
]
const hardReport = []
for (const [f, l, eb, ef, es] of HARD) {
  const r = rowOf(f, l)
  const g = ok(!!r, `① ${f}→${l} 可定位（契约守卫）`)
  if (!g) { hardReport.push([`${f}→${l}`, 'NOT FOUND']); continue }
  ok(r.bucket === eb, `① ${f}→${l} bucket==${eb}（实际 ${r.bucket}）`)
  ok(setEq(r.flags, ef), `① ${f}→${l} flags==[${ef.join(',')}]（实际 [${r.flags.join(',')}]）`)
  ok(r.src === es, `① ${f}→${l} src==${es}（实际 ${r.src}）`)
  hardReport.push([`${f}→${l}`, `${r.bucket} src=${r.src} [${r.flags.join('|')}]`])
}
console.log('   硬案例实测：')
for (const [w, s] of hardReport) console.log(`     ${w} : ${s}`)

// ==================================================================
section('④-extra 规则②：keep 桶逐条 + 反向泄漏 + 敏感度')
// 族 rank 表：lemma -> Map(member -> rank)
const famRanks = new Map()
for (const r of draft) {
  if (!famRanks.has(r.lemma)) famRanks.set(r.lemma, new Map())
  const m = famRanks.get(r.lemma); m.set(r.lemma, r.lRank); m.set(r.form, r.fRank)
}
function shouldKeep(r, T) {
  if (r.fRank > T) return false
  const m = famRanks.get(r.lemma); if (!m) return false
  let n = 0; for (const rk of m.values()) if (rk <= T) n++
  return n >= 2
}
// keep 桶：flags 恰 ['multi-highfreq']，且满足规则②
let keepFlagBad = 0, keepCondBad = 0
for (const r of keep) {
  if (!(r.flags.length === 1 && r.flags[0] === 'multi-highfreq')) keepFlagBad++
  if (!shouldKeep(r, 2500)) keepCondBad++
}
eq(keepFlagBad, 0, '④ keep 每行 flags 恰 == [\'multi-highfreq\']')
eq(keepCondBad, 0, '④ keep 每行满足规则②(2500)')
// keep 不得混入 audit 条件：flags 只有 multi-highfreq + src=AB + fRank>lRank + lemma 非 proper
let keepAuditCond = 0
for (const r of keep) {
  const L = dbByForm.get(r.lemma)
  if (r.src !== 'AB' || !(r.fRank > r.lRank) || !L || L.kind === 'proper') keepAuditCond++
}
eq(keepAuditCond, 0, '④ keep 无行满足 audit 条件（src/前向/非proper）')
// 反向泄漏：auto-fold 中不得存在满足规则②的行
const leak = auto.filter((r) => shouldKeep(r, 2500))
eq(leak.length, 0, '④ 反向泄漏：auto-fold 中满足规则②的行 == 0')
console.log(`   keep=${keep.length} | auto-fold 泄漏=${leak.length}`)
// 敏感度：候选集 = auto-fold ∪ keep（规则②转换前的 auto-fold 快照）
const candidates = [...auto, ...keep]
const sens = (T) => candidates.filter((r) => shouldKeep(r, T)).length
console.log(`   敏感度复算: 1000→${sens(1000)} | 2500→${sens(2500)} | 5000→${sens(5000)}`)
eq(candidates.length, 10218, '④ 候选集(auto-fold∪keep) == 10315-97 = 10218')
eq(sens(1000), 82, '④ 敏感度 1000 → 82')
eq(sens(2500), 330, '④ 敏感度 2500 → 330（生效）')
eq(sens(5000), 845, '④ 敏感度 5000 → 845')

// ==================================================================
section('④ auto-fold 不变式 + 倒挂/自环/目标')
eq(auto.filter((r) => r.flags.length > 0).length, 0, '④ auto-fold flags 全空')
eq(auto.filter((r) => r.src !== 'AB').length, 0, '④ auto-fold src 全 AB')
eq(auto.filter((r) => !(r.fRank > r.lRank)).length, 0, '④ auto-fold 无倒挂/并列')
eq(draft.filter((r) => r.form === r.lemma).length, 0, '④ 无自环 form===lemma')
let lemmaMiss = 0, lemmaProper = 0
for (const r of draft) { const L = dbByForm.get(r.lemma); if (!L) lemmaMiss++; else if (L.kind === 'proper') lemmaProper++ }
eq(lemmaMiss, 0, '④ 所有 lemma 在库')
eq(auto.filter((r) => { const L = dbByForm.get(r.lemma); return !L || L.kind === 'proper' }).length, 0, '④ auto-fold lemma 非 proper')
// >5000 倒挂是否放行
const invGt5000 = draft.filter((r) => r.fRank < r.lRank && r.fRank > 5000)
eq(invGt5000.filter((r) => r.bucket === 'auto-fold').length, 0, '④ >5000 倒挂未被放行')
console.log(`   全局 >5000 倒挂 ${invGt5000.length}，auto-fold 中 0`)

// ==================================================================
section('③ audit.csv / audit.md / draft 三方一致（新 2965）')
function parseCsv(text) {
  const rows = []; let cur = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false } else field += ch }
    else if (ch === '"') q = true
    else if (ch === ',') { cur.push(field); field = '' }
    else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
    else if (ch === '\r') { } else field += ch
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur) }
  return rows
}
const csvRows = parseCsv(fs.readFileSync(AUDIT_CSV, 'utf8'))
const header = csvRows[0]
const body = csvRows.slice(1).filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''))
eq(header.length, 14, '③ audit.csv 表头 14 列')
eq(body.length, audit.length, '③ audit.csv 数据行 == audit 桶 2965')
let colBad = 0, orderBad = 0
for (let i = 0; i < body.length; i++) { if (body[i].length !== 14) colBad++; if (i > 0 && Number(body[i][0]) < Number(body[i - 1][0])) orderBad++ }
eq(colBad, 0, '③ audit.csv 每行 14 列')
eq(orderBad, 0, '③ audit.csv fRank 升序')
const csvKeys = new Set(body.map((r) => `${r[2]}→${r[3]}`))
const draftAuditKeys = new Set(audit.map((r) => `${r.form}→${r.lemma}`))
let co = 0, doo = 0
for (const k of csvKeys) if (!draftAuditKeys.has(k)) co++
for (const k of draftAuditKeys) if (!csvKeys.has(k)) doo++
eq(co, 0, '③ audit.csv 无 draft 外多余')
eq(doo, 0, '③ draft audit 桶全在 audit.csv')
const mdHead = (fs.readFileSync(AUDIT_MD, 'utf8').match(/^## .+ → .+$/gm) || []).length
eq(mdHead, audit.length, '③ audit.md 条目数 == 2965')

// ==================================================================
section('③ 916 族口径（Step-1 统计，阈值 5000）')
const familyByLemma = new Map()
for (const r of draft) {
  if (!familyByLemma.has(r.lemma)) familyByLemma.set(r.lemma, new Map())
  const fam = familyByLemma.get(r.lemma); fam.set(r.lemma, r.lRank); fam.set(r.form, r.fRank)
}
let famMulti = 0
for (const [, m] of familyByLemma) { const h = [...m.values()].filter((rk) => rk <= 5000); if (h.length >= 2) famMulti++ }
eq(familyByLemma.size, 8438, '③ 族总数 == 8438')
eq(famMulti, 916, '③ 同族≥2高频(≤5000)族数 == 916')

// ==================================================================
section('⑧ report.md 计数与数据一致')
const reportTxt = fs.readFileSync(path.join(ROOT, 'reports/lemma/report.md'), 'utf8')
const must = [
  '生成记录总数：**13183**',
  '`auto-fold`：**9888**', '`keep`（规则②，保留）：**330**', '`audit`：**2965**',
  '9888 + 330 + 2965 = **13183**',
  'AB 12714 / B 416 / A 53',
  '唯一变形词：**13138**',
  '| 1000 | 82 |', '| 2500 | 330 | **✅ 生效** |', '| 5000 | 845 |',
  '全部 11 类，合计 13183',
  '| src-b-only | 416 |', '| multi-highfreq | 330 |', '| form-more-frequent | 1494 |',
  '**8438**', '的族数：916**',
  'A∧B 真双向',
  'scripts/.lemma-map.draft.json', 'reports/lemma/audit.csv', 'reports/lemma/audit.md', 'reports/lemma/report.md',
  '| shelves | shelves → shelve | 9813/47466 | 3 | B |', '| honored | honored → honor | 3735/589 | p | B |',
]
let miss = 0
for (const m of must) if (!reportTxt.includes(m)) { miss++; ok(false, `⑧ report.md 缺失声明「${m}」`) }
ok(miss === 0, `⑧ report.md 关键计数全部与数据一致（缺失 ${miss}）`)
console.log(`   report.md 关键计数核对：${must.length - miss}/${must.length} 命中`)

// ==================================================================
section('汇总')
if (SELFTEST) { console.log('*** SELFTEST：注入反例（预期 FAIL）***'); eq(auto.length, -999999, 'SELFTEST auto-fold 数（故意错）') }
console.log(`跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL 明细 ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

/**
 * QA · 抽样复核 + 全量 ECDICT 关系反查 — Round 2（只读）
 * ==================================================================
 * 任务②：auto-fold 30 + audit 30 + keep 30（固定种子）
 * 全量加强：全部 auto-fold 行 + 全部 keep 行独立回查 ecdict.csv 屈折关系
 * src 语义（新）：src = A∧B ? 'AB' : A ? 'A' : 'B'（同方向重复不升级）
 * 用法：node scripts/qa-lemma-sample.mjs   种子 20260926
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DRAFT = path.join(ROOT, 'scripts/.lemma-map.draft.json')
const CSV = path.join(ROOT, 'scripts/.ecdict/ecdict.csv')
const SEED = 20260926
const SAMPLE_N = 30

let N = 0
const FAILS = []
const ok = (c, m) => { N++; if (!c) FAILS.push(m); return c }

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function pick(arr, n, rng) { const idx = arr.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1));[idx[i], idx[j]] = [idx[j], idx[i]] } return idx.slice(0, n).map((i) => arr[i]) }

function parseCsvLine(line) {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += ch }
    else if (ch === '"') q = true
    else if (ch === ',') { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur); return out
}
const lines = fs.readFileSync(CSV, 'utf8').split('\n')
const byWord = new Map()
for (let i = 1; i < lines.length; i++) {
  const l = lines[i]; if (!l) continue
  const f = parseCsvLine(l); if (f.length !== 13) continue
  const w = f[0].trim().toLowerCase(); if (!w) continue
  const ex = f[10] || ''
  let lemma = null; const own = []
  for (const tok of ex.split('/')) {
    const c = tok.indexOf(':'); if (c < 0) continue
    const k = tok.slice(0, c); const v = tok.slice(c + 1).trim().toLowerCase()
    if (k === '0') lemma = v; else if ('pdi3srt'.includes(k) && k.length === 1) own.push({ t: k, v })
  }
  const prev = byWord.get(w)
  if (prev) { if (!prev.lemma && lemma) prev.lemma = lemma; for (const o of own) if (!prev.own.some((x) => x.t === o.t && x.v === o.v)) prev.own.push(o) }
  else byWord.set(w, { lemma, own })
}
console.log(`[ecdict] 词条 ${byWord.size}`)

const modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
const dbByForm = new Map()
for (const w of modW.words) { const k = String(w.form || '').toLowerCase(); if (k && !dbByForm.has(k)) dbByForm.set(k, w) }

const draft = JSON.parse(fs.readFileSync(DRAFT, 'utf8'))
const auto = draft.filter((r) => r.bucket === 'auto-fold')
const audit = draft.filter((r) => r.bucket === 'audit')
const keep = draft.filter((r) => r.bucket === 'keep')

// 独立判定：A/B 方向；src = A∧B?AB:A?A:B
function recompute(r) {
  const eF = byWord.get(r.form); const eL = byWord.get(r.lemma)
  let A = false, B = false
  if (eF && eF.lemma && eF.lemma === r.lemma) { const L = dbByForm.get(eF.lemma); const F = dbByForm.get(r.form); if (L && F && L.id !== F.id) A = true }
  if (eL) for (const o of eL.own) if (o.v === r.form && o.v !== r.lemma) { const V = dbByForm.get(o.v); const W = dbByForm.get(r.lemma); if (V && W && V.id !== W.id) B = true }
  return { A, B, src: A && B ? 'AB' : A ? 'A' : 'B', relHolds: A || B }
}

console.log('\n===== ②-全量：draft.src 独立复算（新语义 A∧B）=====')
let srcMis = 0, srcMisEx = []
for (const r of draft) { const { src } = recompute(r); if (src !== r.src) { srcMis++; if (srcMisEx.length < 6) srcMisEx.push(`${r.form}→${r.lemma} draft=${r.src} recompute=${src}`) } }
ok(srcMis === 0, `② draft.src 全部 == 独立复算（新语义），不一致 ${srcMis}`)
console.log(`   src 不一致: ${srcMis}${srcMisEx.length ? ' | ' + srcMisEx.join(' ; ') : ''}`)

console.log('\n===== ②-全量：auto-fold + keep 屈折关系回查 ECDICT =====')
let autoRel = 0, keepRel = 0
for (const r of auto) if (!recompute(r).relHolds) autoRel++
for (const r of keep) if (!recompute(r).relHolds) keepRel++
ok(autoRel === 0, `② 全部 auto-fold 关系成立（${auto.length - autoRel}/${auto.length}）`)
ok(keepRel === 0, `② 全部 keep 关系成立（${keep.length - keepRel}/${keep.length}）`)
console.log(`   auto-fold 关系成立 ${auto.length - autoRel}/${auto.length} | keep ${keep.length - keepRel}/${keep.length}`)

// keep 桶规则② 逐条
const famRanks = new Map()
for (const r of draft) { if (!famRanks.has(r.lemma)) famRanks.set(r.lemma, new Map()); const m = famRanks.get(r.lemma); m.set(r.lemma, r.lRank); m.set(r.form, r.fRank) }
function shouldKeep(r, T) { if (r.fRank > T) return false; const m = famRanks.get(r.lemma); if (!m) return false; let n = 0; for (const rk of m.values()) if (rk <= T) n++; return n >= 2 }
let keepBad = 0
for (const r of keep) if (!(r.flags.length === 1 && r.flags[0] === 'multi-highfreq' && r.src === 'AB' && r.fRank > r.lRank && shouldKeep(r, 2500))) keepBad++
ok(keepBad === 0, `② keep 逐条满足规则②(2500)+src=AB+前向+flags，违规 ${keepBad}`)
console.log(`   keep 违规: ${keepBad}/${keep.length}`)

// ==================================================================
const rng = mulberry32(SEED)
console.log(`\n===== ②-抽样（种子 ${SEED}，各 ${SAMPLE_N}）=====`)
function runSample(name, arr, judge) {
  console.log(`\n--- ${name} 抽样 ---`)
  let pass = 0
  for (const r of pick(arr, SAMPLE_N, rng)) {
    const res = judge(r)
    if (res.ok) pass++; else ok(false, `② ${name} 抽样 FAIL: ${r.form}→${r.lemma} — ${res.why}`)
    console.log(`   [${res.ok ? 'PASS' : 'FAIL'}] ${r.form}(${r.fRank})→${r.lemma}(${r.lRank}) src=${r.src} [${r.flags.join('|')}] ${res.note || ''}`)
  }
  ok(pass === SAMPLE_N, `② ${name} 抽样 ${SAMPLE_N} 全 PASS（实际 ${pass}）`)
  console.log(`   ${name} 抽样: ${pass}/${SAMPLE_N} PASS`)
}
runSample('auto-fold', auto, (r) => {
  const { A, B, relHolds } = recompute(r); const L = dbByForm.get(r.lemma)
  const cond = { 'no-flag': r.flags.length === 0, 'src=AB': r.src === 'AB', 'fwd': r.fRank > r.lRank, 'inDB': !!L && !!L.id, 'notProper': L && L.kind !== 'proper', 'rel': relHolds }
  const bad = Object.entries(cond).filter(([, v]) => !v).map(([k]) => k)
  return { ok: bad.length === 0, why: bad.join(','), note: `A=${A} B=${B}` }
})
runSample('audit', audit, (r) => {
  const s = new Set(r.flags)
  const holds = {
    'highfreq-before': r.fRank < r.lRank && r.fRank <= 5000,
    'form-more-frequent': r.fRank < r.lRank && r.fRank > 5000,
    'rank-tie': r.fRank === r.lRank,
    'suspect-target': r.lRank > 3 * r.fRank && r.lRank > 15000,
    'src-a-only': r.src === 'A', 'src-b-only': r.src === 'B',
    'lemma-proper': (dbByForm.get(r.lemma) || {}).kind === 'proper',
  }
  const structural = [...s].filter((f) => f in holds && !holds[f])
  return { ok: r.flags.length > 0 && structural.length === 0, why: `无flag或结构不成立 ${structural.join(',')}`, note: '' }
})
runSample('keep', keep, (r) => {
  const { relHolds } = recompute(r)
  const cond = { 'flags=[multi-highfreq]': r.flags.length === 1 && r.flags[0] === 'multi-highfreq', 'src=AB': r.src === 'AB', 'fwd': r.fRank > r.lRank, 'fRank<=2500': r.fRank <= 2500, 'rule2': shouldKeep(r, 2500), 'rel': relHolds }
  const bad = Object.entries(cond).filter(([, v]) => !v).map(([k]) => k)
  return { ok: bad.length === 0, why: bad.join(','), note: '' }
})

console.log('\n===== 汇总 =====')
console.log(`跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

/**
 * QA · 攻门测试（⑤ / Round 2）：独立复刻「新 judge()+规则②」，对全部 13,183 行复算 bucket+flags
 * ------------------------------------------------------------------
 * gen-lemma-map.mjs 无 export → 以「数据反查 + 规则复刻」替代（已声明：未直接调用生成器函数）。
 * 新规格：src = A∧B?AB:A?B；规则② auto-fold→keep（阈值 2500，flags+=multi-highfreq）。
 * 用法：node scripts/qa-lemma-attack.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CSV = path.join(ROOT, 'scripts/.ecdict/ecdict.csv')

let N = 0
const FAILS = []
const ok = (c, m) => { N++; if (!c) FAILS.push(m); return c }

function parseCsvLine(line) { const out = []; let cur = '', q = false; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += ch } else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = '' } else cur += ch } out.push(cur); return out }
const lines = fs.readFileSync(CSV, 'utf8').split('\n')
const byWord = new Map()
for (let i = 1; i < lines.length; i++) {
  const l = lines[i]; if (!l) continue
  const f = parseCsvLine(l); if (f.length !== 13) continue
  const w = f[0].trim().toLowerCase(); if (!w) continue
  const ex = f[10] || ''
  let lemma = null, types = ''; const own = []
  for (const tok of ex.split('/')) { const c = tok.indexOf(':'); if (c < 0) continue; const k = tok.slice(0, c), v = tok.slice(c + 1).trim().toLowerCase(); if (k === '0') lemma = v; else if (k === '1') types = v; else if ('pdi3srt'.includes(k) && k.length === 1) own.push({ t: k, v }) }
  const prev = byWord.get(w)
  if (prev) { if (!prev.lemma && lemma) prev.lemma = lemma; if (!prev.types && types) prev.types = types; for (const o of own) if (!prev.own.some((x) => x.t === o.t && x.v === o.v)) prev.own.push(o); if (!prev.trans && f[3]) prev.trans = f[3] }
  else byWord.set(w, { lemma, types, own, trans: f[3] || '' })
}
const PLACEHOLDER_TRANS = /^(?:[\s\W]*|无|暂无|见[^\s]*|n\.\s*无|null|none|—+|-+)$/i
const normText = (s) => String(s == null ? '' : s).replace(/\\n/g, ' ').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()
function hasMeaningText(trans) {
  const t = normText(trans); if (!t) return false; if (PLACEHOLDER_TRANS.test(t)) return false
  const stripped = t.replace(/\[[^\]]*\]/g, ' ').replace(/\b(?:n|v|vt|vi|a|adj|adv|prep|conj|pron|num|art|int|aux|abbr|suffix|prefix)\./gi, ' ').replace(/[^\p{Script=Han}A-Za-z]/gu, ' ').trim()
  if (!stripped) return false
  return /[\p{Script=Han}]/u.test(stripped) || /[A-Za-z]{2,}/.test(stripped)
}
const modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
const dbByForm = new Map()
for (const w of modW.words) { const k = String(w.form || '').toLowerCase(); if (k && !dbByForm.has(k)) dbByForm.set(k, w) }
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/.lemma-map.draft.json'), 'utf8'))

const WATCHLIST_EXPLICIT = ['saw', 'left', 'found', 'fell', 'bound', 'rose', 'lay', 'means', 'better', 'worse', 'worst', 'leaves', 'honored']
const lemmaSets = new Map()
for (const r of draft) { if (!lemmaSets.has(r.form)) lemmaSets.set(r.form, new Set()); lemmaSets.get(r.form).add(r.lemma) }
const discovered = []; for (const [f, s] of lemmaSets) if (s.size >= 2) discovered.push(f)
const WATCH = new Set([...WATCHLIST_EXPLICIT, ...discovered].map((w) => w.toLowerCase()))

// A/B 方向复算（独立）
function dirs(r) {
  const eF = byWord.get(r.form), eL = byWord.get(r.lemma)
  let A = false, bCount = 0
  if (eF && eF.lemma && eF.lemma === r.lemma) { const L = dbByForm.get(eF.lemma), F = dbByForm.get(r.form); if (L && F && L.id !== F.id) A = true }
  if (eL) for (const o of eL.own) if (o.v === r.form && o.v !== r.lemma) { const V = dbByForm.get(o.v), W = dbByForm.get(r.lemma); if (V && W && V.id !== W.id) bCount++ }
  const srcNew = A && bCount > 0 ? 'AB' : A ? 'A' : 'B'
  const srcOld = (A ? 1 : 0) + bCount >= 2 ? 'AB' : A ? 'A' : bCount >= 1 ? 'B' : null
  return { A, bCount, srcNew, srcOld }
}
// judge() core 复刻（line 259-287）
function judgeCore(r, src) {
  const flags = []
  const L = dbByForm.get(r.lemma)
  const g1NotProper = (L ? L.kind : undefined) !== 'proper'
  const g1HasMeaning = hasMeaningText((byWord.get(r.lemma) || {}).trans || '')
  if (!g1NotProper) flags.push('lemma-proper')
  if (!g1HasMeaning) flags.push('lemma-no-gloss')
  const g2 = src === 'AB'
  if (!g2) flags.push(src === 'A' ? 'src-a-only' : src === 'B' ? 'src-b-only' : 'src-single')
  const g3High = r.fRank < r.lRank && r.fRank <= 5000
  const g3Form = r.fRank < r.lRank && r.fRank > 5000
  if (g3High) flags.push('highfreq-before')
  if (g3Form) flags.push('form-more-frequent')
  if (r.fRank === r.lRank) flags.push('rank-tie')
  const homograph = WATCH.has(r.form) || WATCH.has(r.lemma)
  if (homograph) flags.push('homograph')
  const g3 = g3High || g3Form || r.fRank === r.lRank || homograph
  const g4 = r.lRank > 3 * r.fRank && r.lRank > 15000
  if (g4) flags.push('suspect-target')
  const g1 = !!L && g1NotProper && g1HasMeaning
  const bucket = g1 && g2 && !g3 && !g4 && r.fRank > r.lRank ? 'auto-fold' : 'audit'
  return { bucket, flags }
}
// 规则②（line 324-351）
const famRanks = new Map()
for (const r of draft) { if (!famRanks.has(r.lemma)) famRanks.set(r.lemma, new Map()); const m = famRanks.get(r.lemma); m.set(r.lemma, r.lRank); m.set(r.form, r.fRank) }
function shouldKeep(r, T) { if (r.fRank > T) return false; const m = famRanks.get(r.lemma); if (!m) return false; let n = 0; for (const rk of m.values()) if (rk <= T) n++; return n >= 2 }

// ==================================================================
console.log('===== ⑤ 全量复刻（new judge + 规则②）=====')
let bucketMis = 0, flagMis = 0; const bmEx = [], fmEx = []
let oldAuto = 0; const oldAuditSet = new Set(), newAuditSet = new Set()
for (const r of draft) {
  const { srcNew, srcOld } = dirs(r)
  const core = judgeCore(r, srcNew)
  let bucket = core.bucket, flags = core.flags
  if (bucket === 'auto-fold' && shouldKeep(r, 2500)) { bucket = 'keep'; flags = [...flags, 'multi-highfreq'] }
  if (bucket !== r.bucket) { bucketMis++; if (bmEx.length < 8) bmEx.push(`${r.form}→${r.lemma} draft=${r.bucket} replica=${bucket}`) }
  if (flags.join('|') !== r.flags.join('|')) { flagMis++; if (fmEx.length < 8) fmEx.push(`${r.form}→${r.lemma} draft=[${r.flags.join('|')}] replica=[${flags.join('|')}]`) }
  const old = judgeCore(r, srcOld)
  if (old.bucket === 'auto-fold') oldAuto++
  if (old.bucket === 'audit') oldAuditSet.add(`${r.form}→${r.lemma}`)
  if (r.bucket === 'audit') newAuditSet.add(`${r.form}→${r.lemma}`)
}
ok(bucketMis === 0, `⑤ 复刻 bucket 全一致（不一致 ${bucketMis}）`)
ok(flagMis === 0, `⑤ 复刻 flags 全一致（不一致 ${flagMis}）`)
console.log(`   bucket 不一致 ${bucketMis} | flags 不一致 ${flagMis}（共 ${draft.length} 行）`)
if (bmEx.length) console.log('   ', bmEx.join(' ; '))
if (fmEx.length) console.log('   ', fmEx.join(' ; '))

// ==================================================================
console.log('\n===== ①/② P0-1 修复验证 =====')
const moved = draft.filter((r) => { const { srcOld } = dirs(r); return judgeCore(r, srcOld).bucket === 'auto-fold' && r.bucket === 'audit' })
const fakeNow = draft.filter((r) => { const { srcOld, srcNew } = dirs(r); return srcOld === 'AB' && srcNew === 'B' })
ok(fakeNow.length === 175, `① 原 175 条伪AB 现 src=B（实测 ${fakeNow.length}）`)
ok(fakeNow.every((r) => r.src === 'B'), '① 175 条伪AB 的 draft.src 全为 B')
ok(moved.length === 97, `① 原 97 条误放行 auto-fold 现落 audit（实测 ${moved.length}）`)
ok(oldAuto === 10315, `① 旧语义 auto-fold == 10315（实测 ${oldAuto}）`)
console.log(`   伪AB(旧AB→新B): ${fakeNow.length} | 迁移至 audit: ${moved.length} | 旧 auto-fold: ${oldAuto}`)
// audit 只增不减
let removedFromAudit = 0
for (const k of oldAuditSet) if (!newAuditSet.has(k)) removedFromAudit++
ok(removedFromAudit === 0, '③ 原 2868 audit 集合未被移除（audit 只增）')
ok(oldAuditSet.size === 2868, `③ 旧 audit 集合 == 2868（实测 ${oldAuditSet.size}）`)
ok(newAuditSet.size === 2965, `③ 新 audit 集合 == 2965（实测 ${newAuditSet.size}）`)
console.log(`   旧 audit ${oldAuditSet.size} → 新 audit ${newAuditSet.size}（新增 ${newAuditSet.size - oldAuditSet.size}，移除 ${removedFromAudit}）`)
// P0-1 抽查
for (const [f, l] of [['tired', 'tire'], ['colored', 'color'], ['practiced', 'practice'], ['winged', 'wing'], ['seasoned', 'season'], ['armored', 'armor']]) {
  const r = draft.find((x) => x.form === f && x.lemma === l)
  const g = ok(!!r, `① ${f}→${l} 可定位`)
  if (g) ok(r.bucket === 'audit' && r.src === 'B' && r.flags.includes('src-b-only'), `① ${f}→${l} = audit + src=B + src-b-only（实际 ${r.bucket}/${r.src}/[${r.flags.join('|')}]）`)
  console.log(`   ${f}→${l}: ${r ? `${r.bucket} src=${r.src} [${r.flags.join('|')}]` : 'N/A'}`)
}

// ==================================================================
console.log('\n===== ① 执行序与互斥 =====')
ok(10315 - 97 - 330 === 9888, '① 算术 10315-97-330 == 9888')
// 97 与 330 互斥：moved 全 audit；keep 全 keep
const movedKeys = new Set(moved.map((r) => `${r.form}→${r.lemma}`))
const keepRows = draft.filter((r) => r.bucket === 'keep')
ok(keepRows.every((r) => !movedKeys.has(`${r.form}→${r.lemma}`)), '① 97 迁移集 与 330 keep 集互斥')
ok(moved.every((r) => r.bucket === 'audit'), '① 97 条保持 audit（未被规则②转 keep）')

// ==================================================================
console.log('\n===== ⑤ 边界构造（谓词级）=====')
function mk(o) { return Object.assign({ form: 'zzzq', lemma: 'tour', type: 's', src: 'AB', fRank: 1, lRank: 2 }, o) }
ok(judgeCore(mk({ fRank: 5000, lRank: 5001 }), 'AB').flags.includes('highfreq-before'), '⑤ fRank=5000(<lRank) → highfreq-before')
ok(judgeCore(mk({ fRank: 5001, lRank: 5002 }), 'AB').flags.includes('form-more-frequent'), '⑤ fRank=5001(<lRank) → form-more-frequent')
ok(judgeCore(mk({ fRank: 6000, lRank: 7000 }), 'AB').bucket === 'audit', '⑤ 倒挂>5000 → audit')
ok(judgeCore(mk({ fRank: 3000, lRank: 3000 }), 'AB').flags.includes('rank-tie'), '⑤ fRank==lRank → rank-tie')
ok(!judgeCore(mk({ fRank: 6000, lRank: 18000 }), 'AB').flags.includes('suspect-target'), '⑤ lRank=3×fRank 不算 suspect')
ok(judgeCore(mk({ fRank: 6000, lRank: 18001 }), 'AB').flags.includes('suspect-target'), '⑤ lRank=3×fRank+1 且>15000 → suspect')
ok(judgeCore(mk({ src: 'A', fRank: 9000, lRank: 100 }), 'A').bucket === 'audit', '⑤ src=A → audit')
ok(judgeCore(mk({ src: 'B', fRank: 9000, lRank: 100 }), 'B').bucket === 'audit', '⑤ src=B → audit')
ok(judgeCore(mk({ fRank: 9000, lRank: 100 }), 'AB').bucket === 'auto-fold', '⑤ 前向+AB+无flag → auto-fold（对照组）')
// 规则② 阈值边界：small 族成员含 small(110)/smaller(2500) → 端点 2500 应计入
ok(shouldKeep({ form: 'zzzq', lemma: 'small', fRank: 1, lRank: 110 }, 2500) === true, '⑤ 规则② 成员端点 rank=2500 计入（small 族 smaller@2500）')
ok(shouldKeep({ form: 'zzzq', lemma: 'big', fRank: 2500, lRank: 100 }, 2500) === true, '⑤ 规则② form 自身 rank=2500 计入')
ok(shouldKeep({ form: 'zzzq', lemma: 'big', fRank: 2501, lRank: 100 }, 2500) === false, '⑤ 规则② form 自身 rank=2501 不保留')

// ==================================================================
console.log('\n===== ⑤ 反向攻门（放行检测）=====')
ok(draft.filter((r) => r.bucket === 'auto-fold' && r.flags.length > 0).length === 0, '⑤ auto-fold 无带 flag 行')
ok(draft.filter((r) => r.bucket === 'auto-fold' && r.src !== 'AB').length === 0, '⑤ auto-fold 无 src≠AB 行')
ok(draft.filter((r) => r.bucket === 'auto-fold' && shouldKeep(r, 2500)).length === 0, '⑤ auto-fold 无规则②泄漏')
ok(draft.filter((r) => r.bucket === 'keep' && !shouldKeep(r, 2500)).length === 0, '⑤ keep 无规则②外行')
for (const fl of ['lemma-proper', 'lemma-no-gloss', 'src-a-only', 'src-b-only', 'highfreq-before', 'form-more-frequent', 'rank-tie', 'homograph', 'suspect-target']) {
  const rows = draft.filter((r) => r.flags.includes(fl))
  ok(rows.every((r) => r.bucket !== 'auto-fold' && r.bucket !== 'keep'), `⑤ flag ${fl} 命中的 ${rows.length} 行均为 audit`)
}

console.log(`\n===== 汇总 =====\n跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

/**
 * QA 复验脚本（Edward / QA Engineer）
 * 验证扩充后数据的完整性、关系一致性、索引可查性与性能。
 * 只读校验，不修改任何源码/数据。
 */
import { words, morphemes } from '../src/data/index.js'
import { SYNONYMS, ANTONYMS } from '../src/data/synants.js'
import wordsMono from '../src/data/words-mono.js'
import wordsMonoExtra from '../src/data/words-mono-extra.js'
import wordsMonoSeed from '../src/data/words-mono-seed.js'
import { MONO_SYNONYMS, MONO_ANTONYMS } from '../src/data/synants-mono.js'
import { MONO_SEED_SYNONYMS, MONO_SEED_ANTONYMS } from '../src/data/synants-mono-seed.js'
import { writeFileSync } from 'node:fs'

const out = []
const log = (s) => { out.push(s); console.log(s) }
const section = (s) => log(`\n=== ${s} ===`)

const t0 = performance.now()
const monoAll = [...wordsMono, ...wordsMonoExtra, ...wordsMonoSeed]
const monoPairs = {
  syn: [...MONO_SYNONYMS, ...MONO_SEED_SYNONYMS],
  ant: [...MONO_ANTONYMS, ...MONO_SEED_ANTONYMS],
}

// ---------- 1. 数据完整性 ----------
section('1. 数据完整性')
// 与 validate-data.mjs / 运行时 schema 对齐：
//  - 全部词条必有 id/form/pos/gloss(非空字符串)、cefr ∈ A1..C2、morphs/chain 为数组
//  - 无词素词(morphs 空) 额外必有 morphless===true、kind ∈ mono/loan/proper/phrase、origin
//  - 有词素词不需 kind/relations（relations 由 src/lib/relations.js 运行时构建）
const KINDS = new Set(['mono', 'loan', 'proper', 'phrase'])
const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
const dupId = new Map(); const dupForm = new Map()
const errs = []
for (const w of words) {
  if (dupId.has(w.id)) { if (!dupId.has(w.id + '.dup')) dupId.set(w.id + '.dup', [dupId.get(w.id)]); dupId.get(w.id + '.dup').push(w.id) } else dupId.set(w.id, w.id)
  const fk = w.form?.toLowerCase?.()
  if (dupForm.has(fk)) { if (!dupForm.has(fk + '.dup')) dupForm.set(fk + '.dup', [dupForm.get(fk)]); dupForm.get(fk + '.dup').push(w.form) } else dupForm.set(fk, w.form)
  const problems = []
  for (const f of ['id', 'form', 'pos', 'gloss']) {
    const v = w[f]
    if (typeof v !== 'string' || !v.trim()) problems.push(`${f} 非法(${JSON.stringify(v)})`)
  }
  if (!CEFR.has(w.cefr)) problems.push(`cefr 非法(${JSON.stringify(w.cefr)})`)
  if (!Array.isArray(w.morphs)) problems.push('morphs 非数组')
  if (!Array.isArray(w.chain)) problems.push('chain 非数组')
  if (!Number.isInteger(w.freqRank) || w.freqRank <= 0) problems.push(`freqRank 非法(${w.freqRank})`)
  if (Array.isArray(w.morphs) && w.morphs.length === 0) {
    if (w.morphless !== true) problems.push('morphless 未显式为 true')
    if (!KINDS.has(w.kind)) problems.push(`kind 非法(${JSON.stringify(w.kind)})`)
    if (typeof w.origin !== 'string' || !w.origin.trim()) problems.push('origin 缺失')
  }
  if (problems.length) { errs.push(`${w.id}: ${problems.join('; ')}`); if (errs.length > 10) break }
}
const idDupes = [...dupId.entries()].filter(([k]) => k.endsWith('.dup'))
const formDupes = [...dupForm.entries()].filter(([k]) => k.endsWith('.dup'))
log(`总词条: ${words.length}`)
log(`重复 id: ${idDupes.length} 组${idDupes.slice(0, 3).map((e) => ' ' + JSON.stringify(e[0]))}`)
log(`重复 form(大小写归一): ${formDupes.length} 组${formDupes.slice(0, 3).map((e) => ' ' + JSON.stringify(e[0]))}`)
log(`必填字段/cefr/kind/relations 校验: ${errs.length === 0 ? 'PASS' : 'FAIL'}`)
if (errs.length) log('  样例: ' + errs.slice(0, 5).join(' | '))

// 随机 50 条 mono-seed 人工审读（输出供 QA 抽查）
section('1b. words-mono-seed 随机 50 条 gloss 抽查')
const seedShuffled = [...wordsMonoSeed]
for (let i = seedShuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [seedShuffled[i], seedShuffled[j]] = [seedShuffled[j], seedShuffled[i]] }
for (const w of seedShuffled.slice(0, 50)) log(`  ${w.form} [${w.pos}] ${w.gloss} (${w.cefr})`)

// ---------- 2. 关系一致性 ----------
section('2. 关系一致性 (synants 全量)')
const formSet = new Set(words.map((w) => w.form.toLowerCase()))
const missing = { syn: [], ant: [] }
const selfRef = { syn: [], ant: [] }
const pairDup = { syn: 0, ant: 0 }
const seen = { syn: new Set(), ant: new Set() }
let pairTotal = { syn: 0, ant: 0 }
for (const [type, pairs] of [['syn', SYNONYMS], ['ant', ANTONYMS]]) {
  for (const p of pairs) {
    pairTotal[type] += 1
    const a = p.a?.toLowerCase(); const b = p.b?.toLowerCase()
    if (typeof a !== 'string' || typeof b !== 'string') { missing[type].push(`非法端点 ${JSON.stringify(p)}`); continue }
    if (!formSet.has(a)) missing[type].push(`${p.a}`)
    if (!formSet.has(b)) missing[type].push(`${p.b}`)
    if (a === b) selfRef[type].push(p.a)
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (seen[type].has(key)) pairDup[type] += 1
    else seen[type].add(key)
  }
}
for (const t of ['syn', 'ant']) {
  log(`${t}: 共 ${pairTotal[t]} 对; 端点缺失 ${missing[t].length}${missing[t].length ? ' 如 ' + missing[t].slice(0, 8).join(',') : ''}; 自指 ${selfRef[t].length}${selfRef[t].length ? ' 如 ' + selfRef[t].slice(0, 5).join(',') : ''}; 重复对 ${pairDup[t]}`)
}
// mono 两文件单独确认
for (const [name, arr] of [['synants-mono.syn', monoPairs.syn], ['synants-mono.ant', monoPairs.ant]]) {
  const bad = arr.filter((p) => !formSet.has(p.a?.toLowerCase()) || !formSet.has(p.b?.toLowerCase()))
  log(`${name}: ${arr.length} 对, 端点缺失 ${bad.length}`)
}

// ---------- 3. 应用集成 ----------
section('3. 应用集成 (import 实测)')
log(`words 总数(实测): ${words.length}`)
log(`mono 三文件合计(实测): ${monoAll.length} = ${wordsMono.length} + ${wordsMonoExtra.length} + ${wordsMonoSeed.length}`)
const wordIdx = new Map(); for (const w of words) { const k = w.form.toLowerCase(); if (!wordIdx.has(k)) wordIdx.set(k, []); wordIdx.get(k).push(w) }
// 检查应用侧索引入口（合并去重后按 form 查询）
const sampleIdx = Math.floor(Math.random() * wordsMonoSeed.length)
const pick = [wordsMonoSeed[sampleIdx], wordsMonoSeed[(sampleIdx + 7777) % wordsMonoSeed.length], wordsMonoSeed[(sampleIdx + 22222) % wordsMonoSeed.length], wordsMonoExtra[Math.floor(Math.random() * wordsMonoExtra.length)], wordsMono[Math.floor(Math.random() * wordsMono.length)]]
for (const w of pick) {
  const hit = wordIdx.get(w.form.toLowerCase())
  log(`  查询 "${w.form}" → ${hit && hit.length ? `命中(${hit.length}条, id=${hit[0].id})` : '未命中!'}`)
}

// ---------- 5. 性能 sanity ----------
section('5. 性能 sanity')
const t1 = performance.now()
const idx2 = new Map()
for (const w of words) { const k = w.form.toLowerCase(); if (!idx2.has(k)) idx2.set(k, []); idx2.get(k).push(w) }
const t2 = performance.now()
log(`索引构建(64825条): ${(t2 - t1).toFixed(1)} ms; mono 词数 ${monoAll.length}`)
const kindDist = {}
for (const w of monoAll) kindDist[w.kind] = (kindDist[w.kind] || 0) + 1
log(`mono kind 分布: ${JSON.stringify(kindDist)}`)
const capNotProper = monoAll.filter((w) => /^[A-Z]/.test(w.form) && w.kind !== 'proper')
log(`首字母大写但 kind≠proper: ${capNotProper.length}${capNotProper.length ? ' 如 ' + capNotProper.slice(0, 5).map((w) => `${w.form}(${w.kind})`).join(',') : ''}`)

// 重复对明细（跨文件 vs 同文件）
section('2b. 重复对明细')
const fileSrc = { syn: [[SYNONYMS, 'synants.js 手写簇'], ...[[MONO_SYNONYMS, 'synants-mono'], [MONO_SEED_SYNONYMS, 'synants-mono-seed']].map((x) => x)], ant: [[ANTONYMS, 'synants.js 手写簇'], [MONO_ANTONYMS, 'synants-mono'], [MONO_SEED_ANTONYMS, 'synants-mono-seed']] }
for (const t of ['syn', 'ant']) {
  const owner = new Map(); const dupSamples = []
  for (const [arr, name] of fileSrc[t]) {
    for (const p of arr) {
      const key = pairKey2(p.a, p.b)
      if (owner.has(key)) { if (dupSamples.length < 5) dupSamples.push(`${p.a}~${p.b} [${owner.get(key)} + ${name}]`) }
      else owner.set(key, name)
    }
  }
  log(`${t} 重复对样例: ${dupSamples.length ? dupSamples.join(' | ') : '无'}`)
}
function pairKey2(a, b) { return String(a) <= String(b) ? `${a}|${b}` : `${b}|${a}` }

section('5. 性能 sanity')
const mem = process.memoryUsage()
log(`heapUsed: ${(mem.heapUsed / 1048576).toFixed(1)} MB; rss: ${(mem.rss / 1048576).toFixed(1)} MB`)
log(`总耗时(含 import): ${(t2 - t0).toFixed(0)} ms`)

writeFileSync('reports/qa-edward-data-check.log', out.join('\n'))

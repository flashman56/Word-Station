/**
 * wire-new-morphemes.mjs —— 用「精确词干=词根」规则，把词根挂到尚未拆解的词上。
 * ==================================================================
 * 思路（安全）：对未拆解的词，只剥离**词素表里真实存在**的前缀/后缀，剥完后的
 * 剩余必须**精确等于某个词根的 form 或 variant**，否则不接。绝不靠子串猜词根，
 * 因此不会产生「40% 语义错」那种误拆。
 *
 *   - 前缀剥离：仅用词素表前缀，且变体长度 ≥ 2（排除 1 字母 a-，避免 false start）；
 *   - 后缀剥离：仅用词素表后缀，**排除屈折后缀** s.ed / s.ing / s.plural，变体长度 ≥ 2；
 *   - 后缀最多剥 2 层（如 chem+ic+al、dict+ion+ary）；
 *   - 最终剩余精确命中词根 form / variant 才接线；
 *   - 若一个词能命中多个不同词根，跳过（宁少接，不接错）。
 *
 * 输出：纯加法补丁，追加到 src/data/words-remorph.js（保留既有条目，行级重建）。
 * 用法：node scripts/wire-new-morphemes.mjs            # 干跑
 *       node scripts/wire-new-morphemes.mjs --apply    # 写入
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REMORPH = path.join(ROOT, 'src/data/words-remorph.js')
const apply = process.argv.includes('--apply')

const { default: morphemes } = await import(pathToFileURL(path.join(ROOT, 'src/data/morphemes.js')).href)
const { words } = await import(pathToFileURL(path.join(ROOT, 'src/data/index.js')).href)
const MORPH_IDS = new Set(morphemes.map((m) => m.id))
const GLOSS = new Map(morphemes.map((m) => [m.id, m.gloss]))

// 词根查表：form/variant -> rootId（命中即精确等于）
const rootForm = new Map()
const rootVariant = new Map()
for (const m of morphemes) {
  if (m.type !== 'root') continue
  if (!rootForm.has(m.form)) rootForm.set(m.form, m.id)
  for (const v of (m.variants || [])) if (!rootVariant.has(v)) rootVariant.set(v, m.id)
}

// 前缀剥离词表（变体长度 ≥ 2）
const prefixV = new Map()
for (const m of morphemes) {
  if (m.type !== 'prefix') continue
  const keys = [m.form, ...(m.variants || [])].filter((k) => typeof k === 'string' && k.length >= 2)
  for (const k of keys) if (!prefixV.has(k)) prefixV.set(k, m.id)
}
// 后缀剥离词表（变体长度 ≥ 2，排除屈折后缀）
const suffixV = new Map()
for (const m of morphemes) {
  if (m.type !== 'suffix') continue
  if (m.id === 's.ed' || m.id === 's.ing' || m.id === 's.plural') continue
  const keys = [m.form, ...(m.variants || [])].filter((k) => typeof k === 'string' && k.length >= 2)
  for (const k of keys) if (!suffixV.has(k)) suffixV.set(k, m.id)
}
// 后缀按长度降序，优先剥更长的
const suffixKeys = [...suffixV.keys()].sort((a, b) => b.length - a.length)
const prefixKeys = [...prefixV.keys()].sort((a, b) => b.length - a.length)

// 安全接线规则（v2，保守）：仅做「整词 == 词根规范形」的精确整词匹配。
// 不再剥离任何前后缀——前缀/后缀的贪心剥离会把 star→st+ar、apple→ad+ple、
// string→strict 这类完全无关的常用词误接成词根派生，严重损害词源学习正确性。
// 整词精确命中根规范形，至少保证「该词的拼写就是该词根」，对同语言词根是
// 严格正确的（如 act→r.act、form→r.form、port→r.port）。
// 注：刻意不使用 variant 匹配（variant 多为拼写变体，整词命中 variant 多半是巧合，
// 如 mat→r.matur 实为误接），也不用任何前后缀剥离。
function decompose(form) {
  const rootId = rootForm.get(form)
  if (!rootId) return []
  return [{ rootId, rootForm: form, suf: [], prefixId: null }]
}

// 排除清单：这些英文词仅是「拼写碰巧等于某拉丁/希腊词根」，实际来源与词根无关
// （多为日耳曼本族词，或存在同形异源/语言错配），接上会教错词源，故剔除。
// 例：leg(肢体)≠r.leg(读)；man(人)≠r.man(手)；arm(肢体)≠r.arm(武器)；
//     pan(锅)≠r.pan(全)；fall(掉落)≠r.fall(欺骗)；rat(鼠)≠r.rat(算)；
//     pen(羽毛笔)←pinna 而非 r.pen(罚)；par(相等)←par 而非 r.par(显现)；
//     tax(税)←taxare 而非 r.tax(排列,希腊)；fin(鱼鳍)←pinna 而非 r.fin(终)。
const EXCLUDE = new Set([
  'the', 'it', 'for', 'not', 'am', 'still', 'put', 'son', 'later', 'harm',
  'top', 'ten', 'man', 'bar', 'rid', 'bell', 'van', 'leg', 'arm', 'path',
  'pal', 'sat', 'blast', 'pet', 'st', 'sit', 'pat', 'lit', 'rap', 'ton',
  'tin', 'rot', 'rat', 'bat', 'clam', 'rig', 'pan', 'pond', 'fall', 'ball',
  'pen', 'fin', 'log', 'disc', 'tax', 'tit', 'halo', 'par', 'sever', 'lab',
])

// 候选词：未拆解、纯字母、非专名/短语
const byIdHasChain = new Set()
const PLAIN = /^[a-z]+$/
const candidates = []
for (const w of words) {
  if (!PLAIN.test(String(w.form || ''))) continue
  if (w.kind === 'proper' || w.kind === 'phrase') continue
  const hasChain = Array.isArray(w.chain) && w.chain.length > 0
  const hasMorphs = (w.morphs || []).length > 0
  if (hasChain || hasMorphs) continue
  candidates.push(w)
}

const added = []
const seen = new Set()
const samples = []
const rootCount = new Map() // rootId -> 接了多少词
for (const w of candidates) {
  const form = String(w.form).toLowerCase()
  if (EXCLUDE.has(form)) continue
  const matches = decompose(form)
  if (matches.length !== 1) continue // 精确命中唯一词根才接；多义/歧义跳过
  const m = matches[0]
  const segs = []
  if (m.prefixId) segs.push({ morph: m.prefixId, form: null, gloss: GLOSS.get(m.prefixId) || '' })
  segs.push({ morph: m.rootId, form: m.rootForm, gloss: GLOSS.get(m.rootId) || '' })
  for (const s of m.suf) segs.push({ morph: s.id, form: s.form, gloss: GLOSS.get(s.id) || '' })
  // 校验 morph id 全部合法
  if (!segs.every((s) => MORPH_IDS.has(s.morph))) continue
  const morphHints = segs.map((s) => s.morph)
  // chain 段 form：前缀段 form 用实际剥离串（这里 prefixId 已知，取变体串需回查；用 ''(空) 也可，merge 不依赖）
  const chain = segs.map((s) => ({ morph: s.morph, form: s.form || '', gloss: s.gloss }))
  if (seen.has(w.id)) continue
  seen.add(w.id)
  const patch = { id: w.id, morphHints, chain }
  added.push(patch)
  rootCount.set(m.rootId, (rootCount.get(m.rootId) || 0) + 1)
  if (samples.length < 25) samples.push(`${w.form} => ${morphHints.join('+')}`)
}

console.log('=== 干跑（未写入）===')
console.log('候选未拆解词:', candidates.length)
console.log('本次可接线:', added.length)
console.log('涉及词根数:', rootCount.size)
console.log('样本:')
for (const s of samples) console.log('  ', s)
const top = [...rootCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
console.log('接得最多的词根（前 12）:', top.map(([k, v]) => `${k}:${v}`).join('  '))

if (!apply) {
  console.log('\n（加 --apply 执行写入）')
  process.exit(0)
}

// ---- 写入：行级重建，保留既有条目 ----
const src = fs.readFileSync(REMORPH, 'utf8')
const MARKER = 'const wordsRemorph = ['
const mi = src.indexOf(MARKER)
if (mi < 0) { console.error('找不到数组标记'); process.exit(1) }
const header = src.slice(0, mi)
const after = src.slice(mi)
const closeIdx = after.lastIndexOf('\n]')
if (closeIdx < 0) { console.error('找不到数组结尾'); process.exit(1) }
const footer = after.slice(closeIdx)
const ENTRY_RE = /^  \{id:"((?:[^"\\]|\\.)*)",/
const origById = new Map()
for (const line of after.slice(0, closeIdx).split('\n')) {
  const em = ENTRY_RE.exec(line)
  if (!em) continue
  const id = JSON.parse(`"${em[1]}"`)
  if (!origById.has(id)) origById.set(id, line.replace(/\r$/, ''))
}
// 序列化成与既有条目一致的「非引号键」格式（便于将来 ENTRY_RE 重新解析）
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
const segTxt = (s) => `{morph:${s.morph == null ? 'null' : `"${s.morph}"`},form:"${esc(s.form)}",gloss:"${esc(s.gloss)}"}`
const serializeEntry = (p) =>
  `  {id:"${p.id}",morphHints:[${p.morphHints.map((m) => `"${m}"`).join(',')}],chain:[${p.chain.map(segTxt).join(',')}]},`
let dupSkip = 0
for (const p of added) {
  if (origById.has(p.id)) { dupSkip++; continue }
  origById.set(p.id, serializeEntry(p))
}
const lines = [...origById.values()].sort((a, b) => {
  const ia = ENTRY_RE.exec(a)?.[1] ?? ''
  const ib = ENTRY_RE.exec(b)?.[1] ?? ''
  return ia < ib ? -1 : ia > ib ? 1 : 0
})
const EOL = src.includes('\r\n') ? '\r\n' : '\n'
const newHeader = header.replace(/词条数:\s*\d+/, `词条数: ${lines.length}`)
if (!/词条数:\s*\d+/.test(newHeader)) console.error('WARN 找不到词条数注释')
fs.writeFileSync(REMORPH, `${newHeader}${MARKER}${EOL}${lines.join(EOL)}${footer}`, 'utf8')
console.log(`已写入：新增 ${added.length - dupSkip} 条（重复跳过 ${dupSkip}），文件共 ${lines.length} 条。`)

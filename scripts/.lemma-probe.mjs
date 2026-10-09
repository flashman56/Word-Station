/**
 * 只读探测（不改任何数据）：词库「屈折形归并」的真实规模测量
 * ------------------------------------------------------------------
 * 数据源：scripts/.ecdict/ecdict.csv 的 exchange 字段（**词典数据，非规则剥离**）
 *   exchange 格式：`0:<原型>/1:<类型码>/p:xx/d:xx/...`
 *     - `0:`  该词的原型（如 blown→0:blow、mice→0:mouse、went→0:go）
 *     - `1:`  该词的屈折类型码（p 过去式 / d 过去分词 / i 现在分词 / s 复数 / 3 三单 / r 比较级 / t 最高级）
 *     - `p:xx/d:xx/...` 该词的变形表（反向：由基词指向各变形）
 *
 * 两个方向互相印证：
 *   A（变形→原型）：本词有 `0:LEM` 且 LEM 也在词库
 *   B（基词→变形）：本词的 `p:/d:/...` 值 V 也在词库 → V→本词
 */
import fs from 'node:fs'

const ROOT = 'C:/Users/lyy/WorkBuddy/2026-09-26-22-28-35/word-root-cloud'
const CSV = `${ROOT}/scripts/.ecdict/ecdict.csv`

// ---------------- 标准 CSV 解析（引号保护；统计列数异常行） ----------------
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

const text = fs.readFileSync(CSV, 'utf8')
const lines = text.split('\n')
console.log(`[1] csv 行数: ${lines.length}`)

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
console.log(`[1] 解析词条: ${byWord.size} | 列数异常行: ${badCols}`)

// ---------------- 词库 ----------------
let modW = null
try {
  modW = await import(new URL('../src/data/words-entry.js', import.meta.url).href)
} catch (e) {
  modW = await import(new URL('../src/data/index.js', import.meta.url).href)
}
const DB = modW.words
console.log(`[2] 词库词条: ${DB.length}`)
const dbByForm = new Map()
for (const w of DB) {
  const k = String(w.form || '').toLowerCase()
  if (k && !dbByForm.has(k)) dbByForm.set(k, w)
}

// 覆盖率
let covHit = 0
let covEx = 0
for (const [k] of dbByForm) {
  const e = byWord.get(k)
  if (e) {
    covHit++
    if (e.lemma || e.own.length) covEx++
  }
}
console.log(`[2] 词库在 ECDICT 命中: ${covHit}/${dbByForm.size} | 带 exchange 信息: ${covEx}`)

// ---------------- 配对 ----------------
const pairs = new Map() // f->l
let dirA = 0 // 变形→原型 命中（含目标不在库的）
let dirA_miss = 0
let dirB = 0
for (const [w, e] of byWord) {
  const F = dbByForm.get(w)
  if (!F) continue
  if (e.lemma && e.lemma !== w) {
    const L = dbByForm.get(e.lemma)
    if (L && L.id !== F.id) {
      dirA++
      const k = `${w}->${e.lemma}`
      const p = pairs.get(k)
      if (!p) pairs.set(k, { f: w, l: e.lemma, type: e.types || '?', src: 'A' })
      else p.src = 'AB'
    } else dirA_miss++
  }
  for (const o of e.own) {
    if (o.v === w) continue
    const V = dbByForm.get(o.v)
    if (V && V.id !== F.id) {
      dirB++
      const k = `${o.v}->${w}`
      const p = pairs.get(k)
      if (!p) pairs.set(k, { f: o.v, l: w, type: o.t, src: 'B' })
      else p.src = 'AB'
    }
  }
}
console.log(`[3] 方向A 命中(目标在库): ${dirA} | 方向A 目标不在库: ${dirA_miss} | 方向B 命中: ${dirB}`)
const list = [...pairs.values()].map((p) => {
  const F = dbByForm.get(p.f)
  const L = dbByForm.get(p.l)
  return { ...p, fRank: F.freqRank, lRank: L.freqRank, fKind: F.kind, lKind: L.kind, fId: F.id, lId: L.id }
})
const uniqF = new Set(list.map((p) => p.f))
console.log(`[3] 去重后候选对: ${list.length} 对 | 涉及变形词: ${uniqF.size} 个`)

// ---------------- 分类统计 ----------------
const byType = new Map()
for (const p of list) byType.set(p.type, (byType.get(p.type) || 0) + 1)
console.log(`[4] 类型分布 top16:`)
;[...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).forEach(([t, n]) => console.log(`      ${t}: ${n}`))

const zone = (lo, hi) => list.filter((p) => p.fRank >= lo && p.fRank < hi).length
console.log(`[4] 变形词频区间: ≤1000: ${zone(0, 1001)} | 1001-3000: ${zone(1001, 3001)} | 3001-10000: ${zone(3001, 10001)} | >10000: ${zone(10001, Infinity)}`)

const gain = list.filter((p) => p.fRank < p.lRank) // 变形比原型更"高频"（队列纠正案例）
const loss = list.filter((p) => p.fRank > p.lRank)
console.log(`[4] 变形先行（fRank<lRank，归并会纠正队列顺序）: ${gain.length} | 变形靠后（fRank>lRank）: ${loss.length}`)

console.log(`[5] 队列纠正 top20（归并后原型提前到变形的排位）:`)
const bySpread = gain.slice().sort((a, b) => b.lRank - b.fRank - (a.lRank - a.fRank))
bySpread.slice(0, 20).forEach((p) => {
  console.log(`      ${p.f}(${p.fRank}) → ${p.l}(${p.lRank})  [${p.type}] ${p.src}`)
})

console.log(`[5] 同形异义观察名单:`)
const watch = ['saw', 'left', 'found', 'fell', 'bound', 'rose', 'lay', 'means', 'axes', 'better', 'worse', 'worst', 'leaves', 'us', 'me', 'went', 'mice', 'blown']
for (const w of watch) {
  const F = dbByForm.get(w)
  const e = byWord.get(w)
  const lem = e && e.lemma ? e.lemma : '-'
  const own = e ? e.own.map((o) => `${o.t}:${o.v}`).slice(0, 5).join(',') : '-'
  console.log(`      ${w}: inDB=${F ? 'Y' : 'N'} | 0:${lem} | types=${e ? e.types || '-' : '-'} | own=${own}`)
}

console.log(`[6] 抽样 25 对:`)
const step = Math.max(1, Math.floor(list.length / 25))
for (let i = 0; i < list.length && i / step < 25; i += step) {
  const p = list[i]
  console.log(`      ${p.f}(${p.fRank}) => ${p.l}(${p.lRank}) [${p.type}] ${p.src}`)
}

// 落盘完整清单，供后续步骤使用
const out = '/tmp/lemma-pairs.json'
fs.writeFileSync(out, JSON.stringify(list, null, 1))
console.log(`[7] 全量清单已写: ${out}（${list.length} 对）`)

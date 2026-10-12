#!/usr/bin/env node
/**
 * 一次性手术（第二轮）：再合并 21 对分裂词素。
 * ------------------------------------------------------------------
 * 与第一轮（scripts/dedupe-morphemes.mjs，8 对）的区别：本轮改成**数据驱动**
 * —— 合并对写成数据表，词素条目用「解析 → 改字段 → 按原样式序列化」处理，
 *    不再手写 from/to 长串（第一轮那样手写的替换模板容易漏字符、也难复核）。
 *
 * 判据（两条都要满足才会合并）：
 *   ① stub 一侧词数 ≤ 1（0/1 词弱族的根因）；
 *   ② 两侧 gloss 同义（r.halo「盐」vs r.hal「呼吸」虽同形但不同根 ⇒ 不并；
 *      r.ten 被 r.tend「伸展」与 r.tain「握住」同时声明，按词义并入 r.tain）。
 *
 * 已核实（合并前）：21 个 stub 在 morph-etym.js 均无条目；词库侧只有
 * w.corpus / w.aqua 两个词引用它们（各 1 行，在 words-remorph.js）。
 *
 * 用法：node scripts/dedupe-morphemes2.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

// [stub, 保留（rich 一侧）]
const MERGES = [
  ['r.ten', 'r.tain'], // tenere 握住，保持 —— 与 r.tain 同根，非 r.tend（伸展）
  ['r.audi', 'r.aud'],
  ['r.corpus', 'r.corp'],
  ['r.leg', 'r.lect'], // legere 读，收集
  ['r.nasc', 'r.nat'],
  ['r.st', 'r.stat'],
  ['r.van', 'r.vac'],
  ['r.vic', 'r.vict'],
  ['r.volunt', 'r.vol'],
  ['r.geo', 'r.ge'],
  ['r.theo', 'r.the'],
  ['r.aqua', 'r.aqu'],
  ['r.curr', 'r.curs'],
  ['r.sanct', 'r.sacr'],
  ['r.pneuma', 'r.pneum'],
  ['r.thes', 'r.thet'],
  ['r.gnost', 'r.gnos'],
  ['r.phen', 'r.phan'], // phan/phen 同根（显现），并入 r.phan
  ['r.clud', 'r.claud'],
  ['r.phot', 'r.phos'],
  ['r.rhino', 'r.rhin'],
]

const morphPath = 'src/data/morphemes.js'
const remorphPath = 'src/data/words-remorph.js'
let morph = readFileSync(morphPath, 'utf8')

/** 找到某 id 所在的整行，并解析成对象；同时判断样式（spaced / compact） */
function findEntry(text, id) {
  const lines = text.split('\n')
  const hits = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.includes(`'${id}'`) || l.includes(`"${id}"`))
  if (hits.length !== 1) throw new Error(`条目行应恰好 1 条，实际 ${hits.length}: ${id}`)
  const { l, i } = hits[0]
  const start = l.indexOf('{')
  const end = l.lastIndexOf('}')
  if (start < 0 || end < 0) throw new Error(`条目行不是单行对象: ${id}`)
  const literal = l.slice(start, end + 1)
  // eslint-disable-next-line no-new-func
  const obj = Function(`return ${literal}`)()
  const style = l.includes(`"id":"`) ? 'compact' : 'spaced'
  return { obj, line: l, idx: i, style }
}

function serialize(obj, style) {
  if (style === 'compact') return `  ${JSON.stringify(obj)},`
  const q = (s) => `'${String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  return `  { id: ${q(obj.id)}, type: ${q(obj.type)}, form: ${q(obj.form)}, display: ${q(obj.display)}, variants: [${(obj.variants || []).map(q).join(', ')}], gloss: ${q(obj.gloss)}, glossEn: ${q(obj.glossEn)}, origin: ${q(obj.origin)}, note: ${q(obj.note)} },`
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z]/g, '')

for (const [stub, canon] of MERGES) {
  const stubE = findEntry(morph, stub)
  const canonE = findEntry(morph, canon)

  // 1) 删 stub 行
  const lines = morph.split('\n')
  if (!lines[stubE.idx].includes(`'${stub}'`) && !lines[stubE.idx].includes(`"${stub}"`)) {
    throw new Error(`stub 行定位漂移: ${stub}`)
  }
  lines.splice(stubE.idx, 1)
  morph = lines.join('\n')

  // 2) 收编：variants / display / note
  const c = findEntry(morph, canon)
  const variants = new Set([...(c.obj.variants || []), stubE.obj.form, ...(stubE.obj.variants || [])].map(norm).filter(Boolean))
  variants.delete(norm(c.obj.form))
  const dispParts = []
  for (const p of [c.obj.display, stubE.obj.display].join(' / ').split('/')) {
    const t = String(p).trim()
    if (t && !dispParts.includes(t)) dispParts.push(t)
  }
  const note = c.obj.note === stubE.obj.note || !stubE.obj.note
    ? c.obj.note
    : `${String(c.obj.note).replace(/。$/, '')}；${stubE.obj.note}`
  const next = { ...c.obj, variants: [...variants], display: dispParts.join(' / '), note }
  const newLine = serialize(next, c.style)
  const lines2 = morph.split('\n')
  lines2[c.idx] = newLine
  morph = lines2.join('\n')
}

// 3) words-remorph.js：stub id 一律改指正身（gloss 运行时由 GLOSS_BY_ID 收敛，无需改）
let rm = readFileSync(remorphPath, 'utf8')
const idPart = (s) => s.slice(2) // 'r.xxx' -> 'xxx'
let rmHits = 0
for (const [stub, canon] of MERGES) {
  // 只在 "r.stub" 这种带引号的整词处替换，避免误伤 r.st ↔ r.stat 之类的前缀关系
  const re = new RegExp(`"${stub.replace('.', '\\.')}"`, 'g')
  rmHits += (rm.match(re) || []).length
  rm = rm.replace(re, `"${canon}"`)
}
writeFileSync(remorphPath, rm)
writeFileSync(morphPath, morph)

console.log(`morphemes.js: -${MERGES.length} stub（variants/display/note 已收编）`)
console.log(`words-remorph.js: stub id 引用改写 ${rmHits} 处`)

// ---------------------------------------------------------------- 自检
const { default: ms } = await import(`../src/data/morphemes.js?v=${Date.now()}`)
const ids = new Set(ms.map((m) => m.id))
if (ms.length !== 728) throw new Error(`morphemes 数应为 728，实际 ${ms.length}`)
for (const [stub, canon] of MERGES) {
  if (ids.has(stub)) throw new Error(`stub 仍存在: ${stub}`)
  if (!ids.has(canon)) throw new Error(`正身丢失: ${canon}`)
}
// 同一 id 不得重复
if (ids.size !== ms.length) throw new Error('存在重复 id')
const { REMORPH_BY_ID } = await import(`../src/data/words-remorph.js?v=${Date.now()}`)
const pc = REMORPH_BY_ID.get('w.corpus')
const pa = REMORPH_BY_ID.get('w.aqua')
if (!pc || pc.morphHints[0] !== 'r.corp') throw new Error('w.corpus 未指向 r.corp')
if (!pa || pa.morphHints[0] !== 'r.aqu') throw new Error('w.aqua 未指向 r.aqu')
// form 集合不得因收编而跨根撞车（撞车会让 B 阶段判歧义、只是少收，不算错，这里只提醒）
const formOwners = new Map()
for (const m of ms) {
  for (const v of [m.form, ...(m.variants || [])].map(norm).filter((f) => f.length >= 3)) {
    if (!formOwners.has(v)) formOwners.set(v, new Set())
    formOwners.get(v).add(m.id)
  }
}
const shared = [...formOwners.entries()].filter(([, s]) => s.size > 1)
console.log(`自检通过：morphemes ${ms.length} 条、stub 清零、补丁指向正确`)
console.log(`（提示）多 root 共用的词形仍有 ${shared.length} 个 —— 这些词形在断链修复阶段会判歧义跳过，属于保守行为，不是错误`)

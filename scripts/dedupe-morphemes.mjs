#!/usr/bin/env node
/**
 * 一次性手术：合并 8 对「同一词根被拆成两个 id」的重复词素。
 * ------------------------------------------------------------------
 * 背景（2026-10-13 线上验收发现的家族分裂）：
 *   每个词根族里词多的 id 是「正身」，同根的短变体被另立了一个 id，
 *   而后者只挂着 0~1 个词（resegment 的 anchor=root4 启发式放不过 3 字母根）。
 *   用户在「按词族学习」的词根目录里看到同根两颗徽标、其中一颗 0/1 词。
 *
 * 本脚本做的事（全部是精确字符串手术，每处替换都断言恰好命中 1 次）：
 *   1. src/data/morphemes.js      删除 8 条 stub 条目；
 *                                  更新 8 条正身条目（variants/display/note 收编 stub 的词形与出处）；
 *   2. src/data/words-remorph.js  把 8 条只挂 stub 的补丁改挂正身 id（gloss 同步为正身 gloss）。
 *
 * 不做的事：
 *   - 不动 learning.js / vocab.js / cloud 层（红线）；
 *   - 不动 morph-etym.js（8 条 stub 均无 etym 条目，已核实，无合并损失）；
 *   - 不重跑 resegment（words-remorph 其余 3927 条原样保留）。
 *
 * stub → 正身 映射（正身 = 词多、有 etym 的一侧）：
 *   r.pel→r.pell     r.meter→r.metr   r.text→r.tex     r.zoo→r.zo
 *   r.sec→r.sequ     r.soc→r.soci     r.tech→r.techn   r.pay→r.pac
 */
import { readFileSync, writeFileSync } from 'node:fs'

const morphPath = 'src/data/morphemes.js'
const remorphPath = 'src/data/words-remorph.js'

// ---- 1. morphemes.js：删 stub 条目、更新正身条目 ------------------------
let morph = readFileSync(morphPath, 'utf8')

const STUB_LINES = [
  '"r.pay"', '"r.zoo"', '"r.text"', '"r.tech"', '"r.meter"', '"r.soc"', '"r.pel"', '"r.sec"',
].map((q) => new RegExp(`^  \\{"id":${q.replace(/"/g, '"')}.*\\},\\n`, 'm'))

// 删除 stub 行（整行，紧凑 JSON 风格，全部以 `  {"id":"r.xxx"...},` 形式存在）
const stubIds = ['r.pay', 'r.zoo', 'r.text', 'r.tech', 'r.meter', 'r.soc', 'r.pel', 'r.sec']
for (const id of stubIds) {
  const re = new RegExp(`^  \\{"id":"${id}",.*?\\},\\n`, 'm')
  const before = morph
  morph = morph.replace(re, '')
  if (morph === before) throw new Error(`stub 条目未找到: ${id}`)
}

// 正身条目更新（variants/display/note 收编 stub 内容；每处替换断言恰好一次）
const CANON_UPDATES = [
  {
    id: 'r.metr',
    from: "{ id: 'r.metr', type: 'root', form: 'metr', display: 'metr / meter', variants: ['meter'], gloss: '测量，计量', glossEn: 'to measure', origin: 'greek', note: 'symmetry（对称）、thermometer（温度计）。' }",
    to: "{ id: 'r.metr', type: 'root', form: 'metr', display: 'metr / meter / metry', variants: ['meter', 'metry'], gloss: '测量，计量', glossEn: 'to measure', origin: 'greek', note: 'metron（量度）：symmetry（对称）、thermometer（温度计）、geometry（geo+metry）。' }",
  },
  {
    id: 'r.pell',
    from: "{ id: 'r.pell', type: 'root', form: 'pell', display: 'pell / puls', variants: ['puls'], gloss: '推，驱', glossEn: 'to drive', origin: 'latin', note: 'expel（驱逐）、impulse（冲动）。' }",
    to: "{ id: 'r.pell', type: 'root', form: 'pell', display: 'pel / pell / puls', variants: ['pel', 'puls'], gloss: '推，驱', glossEn: 'to drive, to push', origin: 'latin', note: 'pellere（推）：expel（驱逐）、propel、repel、compel、impulse（im+puls）。' }",
  },
  {
    id: 'r.tex',
    from: "{ id: 'r.tex', type: 'root', form: 'tex', display: 'tex / text', variants: ['text'], gloss: '编织', glossEn: 'to weave', origin: 'latin', note: 'texture（质地）、context（语境）。' }",
    to: "{ id: 'r.tex', type: 'root', form: 'tex', display: 'tex / text', variants: ['text'], gloss: '编织，构造', glossEn: 'to weave, to construct', origin: 'latin', note: 'texere（编织）：texture（质地）、context（语境）、textile。' }",
  },
  {
    id: 'r.zo',
    from: "{ id: 'r.zo', type: 'root', form: 'zo', display: 'zo / zoo', variants: ['zoo'], gloss: '动物', glossEn: 'animal', origin: 'greek', note: 'zoology（动物学）、zoo（动物园）。' }",
    to: "{ id: 'r.zo', type: 'root', form: 'zo', display: 'zo / zoo', variants: ['zoo'], gloss: '动物', glossEn: 'animal', origin: 'greek', note: 'zōon（动物）：zoology（动物学）、zoo（动物园）、zodiac。' }",
  },
  {
    id: 'r.sequ',
    from: "{ id: 'r.sequ', type: 'root', form: 'sequ', display: 'sequ / secut', variants: ['secut'], gloss: '跟随', glossEn: 'to follow', origin: 'latin', note: 'sequence（序列）、consecutive（连续的）。' }",
    to: "{ id: 'r.sequ', type: 'root', form: 'sequ', display: 'sequ / sec / se / secut', variants: ['secut', 'sec', 'se'], gloss: '跟随', glossEn: 'to follow', origin: 'latin', note: 'sequi（跟随）：sequence（序列）、consequence、subsequent、consecutive（连续的）。' }",
  },
  {
    id: 'r.soci',
    from: "{ id: 'r.soci', type: 'root', form: 'soci', display: 'soci', variants: [], gloss: '社会，同伴', glossEn: 'companion, society', origin: 'latin', note: 'social（社会的）、associate（联合）。' }",
    to: "{ id: 'r.soci', type: 'root', form: 'soci', display: 'soci / soc', variants: ['soc'], gloss: '社会，同伴', glossEn: 'companion, society', origin: 'latin', note: 'socius（同伴）：society、social（社会的）、associate（联合）、sociable。' }",
  },
  {
    id: 'r.techn',
    from: "{ id: 'r.techn', type: 'root', form: 'techn', display: 'techn / techno', variants: ['techno'], gloss: '技艺，技术', glossEn: 'art, skill', origin: 'greek', note: 'technology（技术）、technique（技巧）。' }",
    to: "{ id: 'r.techn', type: 'root', form: 'techn', display: 'techn / techno / tech', variants: ['techno', 'tech'], gloss: '技艺，技术', glossEn: 'art, skill, craft', origin: 'greek', note: 'technē（技艺）：technology（技术）、technique（技巧）、technical。' }",
  },
  {
    id: 'r.pac',
    from: "{ id: 'r.pac', type: 'root', form: 'pac', display: 'pac', variants: [], gloss: '和平，平静', glossEn: 'peace', origin: 'latin', note: 'pacify（安抚）、pacific（和平的）。' }",
    to: "{ id: 'r.pac', type: 'root', form: 'pac', display: 'pac / pay', variants: ['pay'], gloss: '和平，平静；支付；安抚', glossEn: 'peace; to pay; to pacify', origin: 'latin', note: 'pacare（使平静/支付偿付）：pacify（安抚）、pacific（和平的）、pay、payment、peace。' }",
  },
]

for (const { id, from, to } of CANON_UPDATES) {
  const parts = morph.split(from)
  if (parts.length !== 2) throw new Error(`正身条目替换应恰好命中 1 次，实际 ${parts.length - 1} 次: ${id}`)
  morph = parts.join(to)
}

// stub id 在 morphemes.js 里必须已无残留
for (const id of stubIds) {
  if (morph.includes(`"${id}"`) || morph.includes(`'${id}'`)) throw new Error(`stub 仍残留于 morphemes.js: ${id}`)
}
writeFileSync(morphPath, morph)
console.log(`morphemes.js: -8 stub, 8 正身收编完成（词条总数 ${morph.split('\n').filter((l) => l.trim().startsWith('{')).length}）`)

// ---- 2. words-remorph.js：8 条补丁改挂正身 ------------------------------
let rm = readFileSync(remorphPath, 'utf8')
const RM_REWRITE = [
  // [wordId, stubId, canonicalId, canonicalGloss, formInChain]
  ['w.meter', 'r.meter', 'r.metr', '测量，计量', 'meter'],
  ['w.pay', 'r.pay', 'r.pac', '和平，平静；支付；安抚', 'pay'],
  ['w.pel', 'r.pel', 'r.pell', '推，驱', 'pel'],
  ['w.sec', 'r.sec', 'r.sequ', '跟随', 'sec'],
  ['w.soc', 'r.soc', 'r.soci', '社会，同伴', 'soc'],
  ['w.tech', 'r.tech', 'r.techn', '技艺，技术', 'tech'],
  ['w.text', 'r.text', 'r.tex', '编织，构造', 'text'],
  ['w.zoo', 'r.zoo', 'r.zo', '动物', 'zoo'],
]
for (const [wid, stub, canon, gloss, form] of RM_REWRITE) {
  const from = `morphHints:["${stub}"],chain:[{morph:"${stub}",form:"${form}",gloss:`
  const to = `morphHints:["${canon}"],chain:[{morph:"${canon}",form:"${form}",gloss:"${gloss}"}`
  // 原行的 gloss 结尾是 `"}]},` —— 只替换到 gloss 起始处即可保住结尾（原 gloss 内容整段换掉）
  const re = new RegExp(`${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*}`, '')
  const before = rm
  rm = rm.replace(re, to + '}')
  if (rm === before) throw new Error(`remorph 补丁未命中: ${wid} (${stub})`)
}
// stub id 在 remorph 里必须无残留
for (const id of stubIds) {
  if (rm.includes(`"${id}"`)) throw new Error(`stub 仍残留于 words-remorph.js: ${id}`)
}
writeFileSync(remorphPath, rm)
console.log('words-remorph.js: 8 条 stub 补丁改挂正身完成')

// ---- 3. 自检：模块仍可加载、家族规模正确 --------------------------------
const { default: ms } = await import(`../src/data/morphemes.js?v=${Date.now()}`)
const ids = new Set(ms.map((m) => m.id))
if (ms.length !== 749) throw new Error(`morphemes 数应为 749，实际 ${ms.length}`)
for (const id of stubIds) if (ids.has(id)) throw new Error(`stub 仍可被 import: ${id}`)
for (const cid of ['r.pell', 'r.metr', 'r.tex', 'r.zo', 'r.sequ', 'r.soci', 'r.techn', 'r.pac']) {
  if (!ids.has(cid)) throw new Error(`正身 id 丢失: ${cid}`)
}
const { REMORPH_BY_ID } = await import(`../src/data/words-remorph.js?v=${Date.now()}`)
const p1 = REMORPH_BY_ID.get('w.pel')
if (!p1 || p1.morphHints[0] !== 'r.pell') throw new Error('w.pel 补丁未指向 r.pell')
console.log('自检通过：morphemes 749 条、stub 清零、正身/补丁指向正确')

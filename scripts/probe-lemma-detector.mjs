/**
 * probe-lemma-detector —— 屈折形检测器的精度基准（只读，不改任何文件）
 * ------------------------------------------------------------------
 * 用已审校过的 scripts/.lemma-map.draft.json（13,183 对，含 bucket）当基准，
 * 量 scripts/lib/base-form.mjs 的精确率与召回率。
 *
 * ★ 为什么必须先量再用 ★
 *   折叠把「变形形的��习记录」并到「代表形」上。判错一次 = ��习记录并到错误的词，
 *   比不折叠更糟。所以这个检测器在**上生产之前**必须先过基准。
 *
 * 用法：node scripts/probe-lemma-detector.mjs
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findBaseForm } from './lib/base-form.mjs'

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

let agree = 0
let disagree = 0
let noDetect = 0
const wrong = []
for (const d of draft) {
  const mine = findBaseForm(d.form, index)
  if (!mine) { noDetect += 1; continue }
  if (mine === String(d.lemma).toLowerCase()) agree += 1
  else {
    disagree += 1
    if (wrong.length < 25) wrong.push(`${d.form} → 我的 ${mine} vs 审校 ${d.lemma} [${d.bucket}]`)
  }
}

console.log(`基准 draft：${draft.length} 对`)
console.log(`  一致      : ${agree}`)
console.log(`  不一致    : ${disagree}　（精确率 ${((agree / (agree + disagree)) * 100).toFixed(2)}%）`)
console.log(`  检测不出  : ${noDetect}　（保守跳过，召回 ${((agree / (agree + disagree)) * 100).toFixed(2)}%）`)
console.log('  不一致样例：')
wrong.forEach((w) => console.log('    ' + w))
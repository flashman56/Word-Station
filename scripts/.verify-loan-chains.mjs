/** 独立复检 reports/queue-loan-chains.json：不信任产出脚本，重新校验一遍 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/queue-loan-chains.json'), 'utf8'))
const mm = (await import(pathToFileURL(path.join(ROOT, 'src/data/morphemes.js')).href)).default
const IDS = new Set(mm.map((m) => m.id))
const norm = (s) => String(s ?? '').toLowerCase().replace(/[-\s'’]/g, '')

let bad = 0
const dec = j.items.filter((v) => v.verdict === 'decomposable')
for (const v of j.items) {
  if (v.verdict !== 'decomposable') {
    if (v.pieces.length) {
      console.log('✗ 非 decomposable 却有 pieces:', v.form)
      bad++
    }
    continue
  }
  const ps = v.pieces
  if (!ps.some((p) => p.morph)) {
    console.log('✗ 无实词素:', v.form)
    bad++
  }
  for (const p of ps) {
    if (p.morph && !IDS.has(p.morph)) {
      console.log('✗ 不存在的 id:', v.form, p.morph)
      bad++
    }
    if (!/^[a-z]+$/.test(norm(p.form))) {
      console.log('✗ 段形非法:', v.form, p.form)
      bad++
    }
  }
  if (ps.map((p) => norm(p.form)).join('') !== norm(v.form)) {
    console.log('✗ 拼接不等:', v.form, ps.map((p) => p.form).join('+'))
    bad++
  }
}
console.log(`[verify] 判定 ${j.items.length} 条 · decomposable ${dec.length} · 问题 ${bad} 条`)

// 每个被用到的 id 的使用次数（Top 20）
const use = new Map()
for (const v of dec) for (const p of v.pieces) if (p.morph) use.set(p.morph, (use.get(p.morph) || 0) + 1)
console.log('[verify] 用到的词素 id 数:', use.size)
console.log(
  '[verify] Top 20:',
  [...use.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, n]) => `${k}:${n}`).join('  ')
)
// 只用到屈折后缀的
const INFL = new Set(['s.ed', 's.ing', 's.plural'])
console.log('[verify] 仅屈折:', dec.filter((v) => !v.pieces.some((p) => p.morph && !INFL.has(p.morph))).length)
console.log('[verify] 含真实词根(r.*):', dec.filter((v) => v.pieces.some((p) => p.morph && p.morph.startsWith('r.'))).length)

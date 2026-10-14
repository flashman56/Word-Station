/**
 * gen-suspect-morph-audit —— 产出「root 被当成 suffix 用」的可疑词源审计清单
 * ------------------------------------------------------------------
 * 为什么需要它：
 *   2026-10-14 修掉了「root 与 suffix 同挂一词」的显性冲突（56 词），但**单挂**的
 *   可疑用法闸门抓不到、也不该机械改 —— 那需要逐词考证（红线：错的词源比没有更糟）。
 *   本脚本把这些待考证的词列出来，并用**词素自己 note 里点名过的例词**作白名单分级：
 *     · note 点名过  → 大概率合法（该 root 的真实地盘）
 *     · note 未点名  → 高危，需逐词查 OED / Wiktionary 定夺
 *
 * 用法：node scripts/gen-suspect-morph-audit.mjs
 * 产出：reports/suspect-morph-audit.md
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { default: MORPH } = await import('../src/data/morphemes.js')
const { default: WORDS } = await import('../src/data/words-entry.js')

// 同 form 的 root/suffix 组合 —— 这些 root 是「被当成 suffix 用」的高危位
const byForm = new Map()
for (const m of MORPH) {
  if (!m.form) continue
  const slot = byForm.get(m.form) || {}
  if (m.type === 'root') slot.root = m
  else if (m.type === 'suffix') slot.suffix = m
  byForm.set(m.form, slot)
}
const pairs = [...byForm.entries()].filter(([, v]) => v.root && v.suffix)

const lines = []
lines.push('# 可疑词源审计清单（root 被当成 suffix 用）')
lines.push('')
lines.push('> 由 `scripts/gen-suspect-morph-audit.mjs` 生成，只读，不改任何数据文件。')
lines.push('> 已修掉的是「同一词 root 与 suffix 双挂」的显性冲突（2026-10-14，56 词）。')
lines.push('> 本清单是剩下的**单挂**可疑用法：形态上像后缀，却挂了词根 id。')
lines.push('> **红线：错的词源比没有更糟——必须逐词考证，不可批量替换。**')
lines.push('')

let totalHigh = 0
let totalLow = 0

for (const [form, v] of pairs) {
  const rootId = v.root.id
  const suffixId = v.suffix.id
  const claimed = WORDS.filter((w) => (w.morphs || []).includes(rootId))
  if (!claimed.length) continue

  // 该 root 的 note 里点名过的例词 = 它声明的真实地盘
  const note = String(v.root.note || '')
  const inNote = []
  const outOfNote = []
  for (const w of claimed) {
    if (note.toLowerCase().includes(String(w.form).toLowerCase())) inNote.push(w)
    else outOfNote.push(w)
  }
  totalHigh += outOfNote.length
  totalLow += inNote.length

  lines.push(`## ${rootId}（root，form \`${form}\`） vs ${suffixId}（suffix）`)
  lines.push('')
  lines.push(`- **${rootId} 声称的地盘**（note）：${v.root.gloss}　——　${note || '(无 note)'}`)
  lines.push(`- **${suffixId} 的地盘**（note）：${v.suffix.gloss}　——　${v.root && suffixId ? (MORPH.find((m) => m.id === suffixId).note || '') : ''}`)
  lines.push(`- 全库挂 ${rootId} 的词：**${claimed.length}**　其中 note 点名 ${inNote.length} / 未点名 ${outOfNote.length}`)
  lines.push('')
  if (inNote.length) {
    lines.push(`### ✅ note 点名过（大概率合法，${inNote.length}）`)
    lines.push('')
    lines.push(inNote.map((w) => w.form).join(' · '))
    lines.push('')
  }
  if (outOfNote.length) {
    lines.push(`### ⚠️ note 未点名（需逐词考证，${outOfNote.length}）`)
    lines.push('')
    lines.push(outOfNote.map((w) => `${w.form}(r${w.freqRank})`).join(' · '))
    lines.push('')
  }
}

lines.push('---')
lines.push('')
lines.push(`合计：**${totalHigh}** 个高危（note 未点名，需逐词考证）+ **${totalLow}** 个大概率合法（note 已点名）。`)
lines.push('')
lines.push('考证时请注意常见误判（本项目已实测踩过）：')
lines.push('')
lines.push('- `treatment` ← 拉丁 `tractare`「拉、处理」，与 mens「心」无关')
lines.push('- `garment` ← 法语 `garnir`「配备」；`parchment` ← `pergamene`；`assortment` ← `assortir`')
lines.push('- `environment / announcement / dimension / immense / measurement` ← 拉丁 `metiri`「测量」，与「心」无关')
lines.push('- `impediment` ← `impedire`「绊住」；`amenable` ← `amabilis`；`appeasement` ← appease「使平静」')
lines.push('')

const outDir = path.join(ROOT, 'reports')
mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, 'suspect-morph-audit.md')
writeFileSync(outFile, lines.join('\n'), 'utf8')

console.log(`已生成 ${path.relative(ROOT, outFile)}`)
console.log(`高危（note 未点名，需逐词考证）: ${totalHigh}`)
console.log(`大概率合法（note 已点名）: ${totalLow}`)
for (const [form, v] of pairs) {
  const n = WORDS.filter((w) => (w.morphs || []).includes(v.root.id)).length
  if (n) console.log(`  ${v.root.id} 挂 ${n} 词（form '${form}'，与 ${v.suffix.id} 同形）`)
}
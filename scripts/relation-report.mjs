import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { words } from '../src/data/index.js'
import wordsMono from '../src/data/words-mono.js'
import { ANTONYMS, SYNONYMS } from '../src/data/synants.js'
import { buildRelations, relationReport } from '../src/lib/relations.js'

const here = dirname(fileURLToPath(import.meta.url))
const relationIndex = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
const report = relationReport(relationIndex, words)
const byKind = wordsMono.reduce((counts, word) => {
  counts[word.kind] = (counts[word.kind] || 0) + 1
  return counts
}, {})

console.log('='.repeat(56))
console.log('词根词缀单词云 — 语义关系报告')
console.log('='.repeat(56))
console.log(`新增词条数：${wordsMono.length}`, byKind)
console.log(`无词素词数：${report.morphlessTotal}`)
console.log(`近义关系数：${report.synonymPairs}`)
console.log(`反义关系数：${report.antonymPairs}`)
console.log(`去重数：${report.duplicates}`)
console.log(`未解析数：${report.unresolved}`)
console.log(`冲突数：${report.conflicts.length}`)
report.conflicts.forEach((item) => {
  console.log(`  - ${item.aForm} ↔ ${item.bForm}（近义 grade ${item.synGrade} / 反义 grade ${item.antGrade}）`)
})

const conflictPath = resolve(here, '../reports/relations-conflicts.md')
const markdown = [
  '# 近义 / 反义关系冲突',
  '',
  `生成时间：${new Date().toISOString()}`,
  '',
  `共 ${report.conflicts.length} 条。同一无向词对同时存在于近义与反义数据中；两边关系均保留，仅提示人工复核。`,
  '',
  '| 词对 | 近义 grade | 反义 grade | 原因 |',
  '| --- | ---: | ---: | --- |',
  ...report.conflicts.map(
    (item) => `| ${item.aForm} ↔ ${item.bForm} | ${item.synGrade} | ${item.antGrade} | 同一词对同时标记为近义和反义 |`,
  ),
  '',
].join('\n')
await mkdir(dirname(conflictPath), { recursive: true })
await writeFile(conflictPath, markdown, 'utf8')
console.log(`冲突清单已写入：${conflictPath}`)

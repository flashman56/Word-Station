// 外科式清理 words-remorph.js：删短语/多词/被折叠的 DP 重切垃圾，保留正确补丁
// 做法：用离线 words 数据判定每条补丁该删还是该留，写盘时**只删行**，保留命中
// 条目的原始文本（不重新序列化），最大限度保住「逐字同款」合并契约的可读性。
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const apply = process.argv.includes('--apply')

const { words } = await import(pathToFileURL(path.join(root, 'src/data/index.js')).href)
const { default: wordsRemorph } = await import(pathToFileURL(path.join(root, 'src/data/words-remorph.js')).href)

const byId = new Map(words.map((w) => [w.id, w]))

// 保护集合：屈折继承 + loan AI 补链（正确性由来源保证，删了会丢正确数据）
const wi = JSON.parse(fs.readFileSync(path.join(root, 'reports/wire-inflected-added.json'), 'utf8'))
const wiIds = new Set((wi.entries || []).map((e) => e.id))
const ql = JSON.parse(fs.readFileSync(path.join(root, 'reports/queue-loan-chains.json'), 'utf8'))
const qlItems = ql.items || ql
const loanIds = new Set(qlItems.filter((x) => x.verdict === 'decomposable').map((x) => x.id))
const protect = new Set([...wiIds, ...loanIds])

function isFolded(w) {
  return Boolean(w && w.lemma && w.lemma !== w.id && byId.has(w.lemma))
}

const stats = { total: wordsRemorph.length, deleted: 0, kept: 0, counts: {} }
const keepIds = new Set()
const deleteIds = new Set()
for (const p of wordsRemorph) {
  const w = byId.get(p.id)
  let reason = null
  if (p.id && p.id.startsWith('w.phr-')) reason = 'phrase-id'
  else if (w && w.kind === 'phrase') reason = 'phrase-kind'
  else if (w && /[\s-]/.test(w.form || '')) reason = 'space-hyphen'
  else if (isFolded(w)) reason = 'folded'

  if (reason && protect.has(p.id)) reason = null // 受保护

  if (reason) {
    stats.deleted++
    stats.counts[reason] = (stats.counts[reason] || 0) + 1
    deleteIds.add(p.id)
  } else {
    stats.kept++
    keepIds.add(p.id)
  }
}

console.log('=== dry-run ===')
console.log('原始条数', stats.total)
console.log('真删', stats.deleted, JSON.stringify(stats.counts))
console.log('保留', stats.kept)
console.log('受保护集合大小', protect.size, '(wire-inflected', wiIds.size, '/ loan', loanIds.size, ')')

if (!apply) {
  console.log('（未写盘，加 --apply 执行）')
  process.exit(0)
}

// ---------------------------------------------------------------- 行级保留写盘
const file = path.join(root, 'src/data/words-remorph.js')
const src = fs.readFileSync(file, 'utf8')
const EOL = src.includes('\r\n') ? '\r\n' : '\n'
const MARKER = 'const wordsRemorph = ['
const markerIdx = src.indexOf(MARKER)
if (markerIdx < 0) { console.error('结构未找到：缺少 const wordsRemorph = ['); process.exit(1) }
const header = src.slice(0, markerIdx)
const after = src.slice(markerIdx)
const closeIdx = after.lastIndexOf('\n]')
if (closeIdx < 0) { console.error('结构未找到：缺少数组结尾 ]'); process.exit(1) }
const footer = after.slice(closeIdx) // 形如 "\n]\n\n/** id -> 补丁 ... */\nexport ...\n"

// 逐行解析：保留命中条目原始文本；同时校验行内 id 不重复
const ENTRY_RE = /^  \{id:"((?:[^"\\]|\\.)*)",/
const origById = new Map()
let dup = 0
for (const line of after.slice(0, closeIdx).split('\n')) {
  const m = ENTRY_RE.exec(line)
  if (!m) continue
  const id = JSON.parse(`"${m[1]}"`)
  if (origById.has(id)) { dup++; continue }
  origById.set(id, line.replace(/\r$/, ''))
}
if (dup > 0) console.error('WARN 源文件存在重复 id（已去重）：', dup)

const keptLines = []
let missing = 0
for (const id of keepIds) {
  const line = origById.get(id)
  if (!line) { missing++; continue }
  keptLines.push(line)
}
if (missing > 0) console.error('WARN 保留集中找不到原始行（跳过）：', missing)

// 按 id 排序，保持文件整洁
keptLines.sort((a, b) => {
  const ia = ENTRY_RE.exec(a)?.[1] ?? ''
  const ib = ENTRY_RE.exec(b)?.[1] ?? ''
  return ia < ib ? -1 : ia > ib ? 1 : 0
})

const newHeader = header.replace(/词条数: \s*\d+/, `词条数: ${keptLines.length}`)
if (!/词条数: \s*\d+/.test(newHeader)) console.error('WARN 文件头注释里找不到「词条数: N」这一行')

fs.writeFileSync(file, `${newHeader}${MARKER}${EOL}${keptLines.join(EOL)}${footer}`, 'utf8')
console.log('已写盘，删除', stats.deleted, '条，剩余', keptLines.length)

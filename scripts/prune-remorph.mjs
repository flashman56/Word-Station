// 外科式清理 words-remorph.js：删短语/多词/被折叠的 DP 重切垃圾，保留正确补丁
// 做法：用离线 words 数据判定每条补丁该删还是该留，写盘时**只删行**，保留命中
// 条目的原始文本（不重新序列化），最大限度保住「逐字同款」合并契约的可读性。
//
// 删除判据（命中任一条即候选删除）：
//   J1 短语      ：id 以 w.phr- 开头，或词条 kind === 'phrase'
//   J2 多词单位  ：词条 form 含空白或连字符 /[\s-]/
//   J3 被折叠形  ：w.lemma 存在、≠ w.id、且 lemma 词条在库（折叠形不该自带补丁，
//                  链由代表形携带；运行时也会被 lemmaFold 折出队列）
//   J4 错误词根  ：WRONG_ROOT_BLOCKLIST 显式列出的已知错误词源词（DP 重切把
//                  anchor 误切成 an+chor 的遗留，形状判据抓不到，只能点名）
//
// 保护名单（命中判据也不删）：
//   - reports/wire-inflected-added.json：屈折继承接线，正确性由原形保证
//   - reports/queue-loan-chains.json 里 verdict === 'decomposable' 的 loan 补链
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const apply = process.argv.includes('--apply')

const { words } = await import(pathToFileURL(path.join(root, 'src/data/index.js')).href)
const { default: wordsRemorph } = await import(pathToFileURL(path.join(root, 'src/data/words-remorph.js')).href)
const { default: morphemes } = await import(pathToFileURL(path.join(root, 'src/data/morphemes.js')).href)
const MORPH_IDS = new Set(morphemes.map((m) => m.id))

const byId = new Map(words.map((w) => [w.id, w]))

// ---------------------------------------------------------------- 保护集合
const wi = JSON.parse(fs.readFileSync(path.join(root, 'reports/wire-inflected-added.json'), 'utf8'))
const wiIds = new Set((wi.entries || []).map((e) => e.id))
const ql = JSON.parse(fs.readFileSync(path.join(root, 'reports/queue-loan-chains.json'), 'utf8'))
const qlItems = ql.items || ql
const loanIds = new Set(qlItems.filter((x) => x.verdict === 'decomposable').map((x) => x.id))
const protect = new Set([...wiIds, ...loanIds])

// ---------------------------------------------------------------- J4 错误词根块名单
// 同族错误词根：DP 重切按字面切分、不看词源，把本族语/英语固有词挂到了拉丁/希腊词根上。
// 形状判据（J1~J3）抓不到它们（都是单词、无空白连字符、未被 lemma 折叠），只能点名：
//   - anchor 系：anchor 源自希腊 ἀγκύρα → 拉丁 ancora「锚」，与 chor（χορός 舞蹈）无关。
//     anchor 与 phr-drop-anchor 已在首轮清理中删除，anchorage / anchorman 是单词，
//     不触发 J1~J3，在这里显式点名。
//   - fall 系：falling（OE feallan 现在分词）、fallout（fall+out 英语固有合成词）都是
//     日耳曼源英语词，与拉丁 fallere「欺骗」无关（failure/befall 等同族词另属书源
//     补链 words-bookmorph.js，不在本表范围）。
//   - chortling：chortle 是 Carroll 的 chuckle+snort 造词，与希腊 choros 无关。
const WRONG_ROOT_BLOCKLIST = new Set([
  'w.anchorage', 'w.anchorman',
  'w.falling', 'w.fallout', 'w.chortling',
])

function isFolded(w) {
  return Boolean(w && w.lemma && w.lemma !== w.id && byId.has(w.lemma))
}

// ---------------------------------------------------------------- 判定
const CRITERIA = ['J1-phrase', 'J2-space-hyphen', 'J3-folded', 'J4-wrong-root']
const stats = { total: wordsRemorph.length, deleted: 0, kept: 0 }
const per = Object.fromEntries(CRITERIA.map((c) => [c, { hit: 0, prot: 0, del: 0 }]))
const keepIds = new Set()
const deleteIds = new Set()
const delSamples = []

for (const p of wordsRemorph) {
  const w = byId.get(p.id)
  const reasons = []
  if (p.id && p.id.startsWith('w.phr-')) reasons.push('J1-phrase')
  if (w && w.kind === 'phrase') reasons.push('J1-phrase')
  if (w && /[\s-]/.test(w.form || '')) reasons.push('J2-space-hyphen')
  if (isFolded(w)) reasons.push('J3-folded')
  if (WRONG_ROOT_BLOCKLIST.has(p.id)) reasons.push('J4-wrong-root')

  const isProt = reasons.length > 0 && protect.has(p.id)
  for (const r of new Set(reasons)) {
    per[r].hit++
    if (isProt) per[r].prot++
    else per[r].del++
  }

  if (reasons.length > 0 && !isProt) {
    stats.deleted++
    deleteIds.add(p.id)
    if (delSamples.length < 20) delSamples.push(`${p.id} [${[...new Set(reasons)].join('+')}]`)
  } else {
    stats.kept++
    keepIds.add(p.id)
  }
}

console.log('=== dry-run ===')
console.log('原始条数', stats.total)
for (const c of CRITERIA) {
  const v = per[c]
  console.log(`  ${c}: 命中 ${v.hit}（被保护 ${v.prot} / 真删 ${v.del}）`)
}
console.log('真删', stats.deleted, delSamples.length ? `样本: ${delSamples.join(' | ')}` : '')
console.log('保留', stats.kept)
console.log('删后剩余', stats.kept)
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

// ---------------------------------------------------------------- 写盘后回读复验
const reread = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)).default
const problems = []
if (!Array.isArray(reread) || reread.length !== keptLines.length) {
  problems.push(`条数不符：期望 ${keptLines.length}，实际 ${reread?.length}`)
}
const seen = new Set()
for (const p of reread) {
  const keys = Object.keys(p).sort()
  if (keys.join(',') !== 'chain,id,morphHints') problems.push(`${p.id} 字段不是 id/morphHints/chain 三键：${keys.join(',')}`)
  if (seen.has(p.id)) problems.push(`id 重复：${p.id}`)
  seen.add(p.id)
  for (const mid of p.morphHints || []) {
    if (!MORPH_IDS.has(mid)) problems.push(`${p.id} morphHints 引用不存在词素：${mid}`)
  }
  for (const s of p.chain || []) {
    if (s && s.morph != null && !MORPH_IDS.has(s.morph)) problems.push(`${p.id} chain 引用不存在词素：${s.morph}`)
  }
}
const headNow = Number(/词条数:\s*(\d+)/.exec(fs.readFileSync(file, 'utf8'))?.[1])
if (headNow !== reread.length) problems.push(`文件头「词条数」与回读条数不符：${headNow} vs ${reread.length}`)
if (problems.length > 0) {
  console.error(`回读复验未通过（${problems.length} 条）：`)
  for (const p of problems.slice(0, 30)) console.error('  -', p)
  process.exit(1)
}
console.log(`回读复验通过：${reread.length} 条，三键完整、无重复 id、morphHints/chain 词素引用全部有效，文件头计数一致`)

/**
 * QA · Step-2 ④ 接入真实性（源码锚定） / ⑥ 分母与 bandCounts 口径 / 部分 ⑧
 * ------------------------------------------------------------------
 * 用法：node scripts/qa-lemma-step2-static.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildBands, bandFilter } from '../src/hooks/useLearn.js'
import { buildFoldView, isFolded } from '../src/lib/lemmaFold.js'
import { words } from '../src/data/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

let N = 0
const FAILS = []
const ok = (c, m) => { N++; if (!c) FAILS.push(m); return c }
const eq = (a, e, m) => ok(a === e, `${m} — expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`)
const has = (txt, s, m) => ok(txt.includes(s), `${m} — 未找到锚点「${s}」`)
const section = (t) => console.log(`\n===== ${t} =====`)

const useLearn = read('src/hooks/useLearn.js')
const station = read('src/components/StationLearn.jsx')
const app = read('src/App.jsx')

// ==================================================================
section('④ useLearn 派生段接入折叠（锚定具体表达式）')
has(useLearn, 'buildFoldView(baseList, records)', '④ fold = buildFoldView(baseList, records)')
has(useLearn, 'countByStatus(foldStatWords, foldRecords)', '④ stats 走折叠视图')
has(useLearn, 'countScheduled(foldStatWords, foldRecords)', '④ scheduled 走折叠视图')
has(useLearn, 'bandFilter(foldUnits, band)', '④ learnPool = bandFilter(foldUnits, band)')
has(useLearn, 'buildLearnQueue(learnPool, foldRecords,', '④ learnQueue 用 foldRecords')
has(useLearn, 'buildReviewQueue(foldStatWords, foldRecords,', '④ reviewQueue 用折叠视图')
has(useLearn, 'const statWords = useMemo', '④ statWords 未被删除（对外未折叠）')
has(useLearn, '(privateList.length ? [...baseList, ...privateList] : baseList)', '④ statWords = baseList ∪ privateList（未折叠）')
has(useLearn, 'getRecord(records, wordId)', '④ recordOf 走未折叠 records')
// 迁移仍用未过滤 list
const migCount = (useLearn.match(/runMigration\(\{ scope: sc, words: list,/g) || []).length
eq(migCount, 3, '④ runMigration 3 处均传未过滤 list')
ok(!useLearn.includes('runMigration({ scope: sc, words: foldUnits'), '④ 迁移未误用 foldUnits')
// 返回对外仍为未折叠
const retIdx = useLearn.lastIndexOf('return {')
const retBlock = useLearn.slice(retIdx, retIdx + 400)
ok(/^\s*records,\s*$/m.test(retBlock), '④ 返回 records（未折叠）')
ok(/^\s*statWords,\s*$/m.test(retBlock), '④ 返回 statWords（未折叠）')
ok(!/^\s*foldRecords,\s*$/m.test(retBlock) && !/^\s*foldUnits,\s*$/m.test(retBlock), '④ 未对外暴露 foldRecords/foldUnits')

section('④ StationLearn 同口径')
has(station, 'buildFoldView(baseList, recs)', '④ StationLearn buildFoldView(baseList, recs)')
has(station, 'countByStatus(foldUnits, foldRecords)', '④ StationLearn stats 折叠')
has(station, 'bandFilter(foldUnits, activeBand)', '④ StationLearn learnPool 折叠')
has(station, 'buildLearnQueue(learnPool, foldRecords,', '④ StationLearn learnQueue 折叠')
has(station, 'buildReviewQueue(foldUnits, foldRecords,', '④ StationLearn reviewQueue 折叠')
has(station, 'const counts = { all: foldUnits.length }', '④ StationLearn bandCounts.all 用 foldUnits')
has(station, 'foldUnits.forEach((w) => {', '④ StationLearn bandCounts 遍历 foldUnits')

section('④ App.jsx bandCounts 用 isFolded')
has(app, "import { isFolded } from './lib/lemmaFold.js'", '④ App 引入 isFolded')
has(app, 'if (isFolded(w)) return', '④ bandCounts 跳过被折叠形')

section('④ 两份数据装配 merge 代码逐字同款')
function mergeBlock(txt) {
  const m = txt.match(/const REMORPH[\s\S]*?return out\n\}\)/)
  return m ? m[0] : null
}
const b1 = mergeBlock(read('src/data/words-entry.js'))
const b2 = mergeBlock(read('src/data/index.js'))
ok(!!b1 && !!b2, '④ 两份文件均能提取 merge 代码块')
eq(b1, b2, '④ words-entry.js 与 index.js 的 merge 代码逐字同款')
console.log('   merge 代码块一致: ' + (b1 === b2))

// ==================================================================
section('⑧ 新文件无存储键字面量 wrc.')
for (const f of ['src/lib/lemmaFold.js', 'src/data/words-lemma.js']) {
  ok(!read(f).includes('wrc.'), `⑧ ${f} 不含 wrc.`)
}

// ==================================================================
section('⑥ 分母：STATS_SCOPE / LearnHome / bandCounts 与 foldUnits 同口径')
const total = (() => { const m = read('src/components/LearnHome.jsx').match(/const total = [^\n]+/); return m ? m[0] : '' })()
console.log('   LearnHome 分母表达式: ' + total.trim())
ok(total.includes('stats.total || STATS_SCOPE'), '⑥ LearnHome 分母 = stats.total（空态回落 STATS_SCOPE）')

// 复刻 App bandCounts 与 StationLearn bandCounts，和 foldUnits 对拍
const maxRank = words.reduce((m, w) => (typeof w.freqRank === 'number' && w.freqRank > m ? w.freqRank : m), 0)
const bands = buildBands(maxRank)
const foldUnits = buildFoldView(words, {}).units
function countsFrom(list, guard) {
  const counts = {}; bands.forEach((b) => { counts[b.id] = 0 })
  const seen = new Set()
  for (const w of list) {
    if (!w || seen.has(w.id)) continue
    seen.add(w.id)
    if (guard && isFolded(w)) continue
    counts.all += 1
    const r = w.freqRank
    if (typeof r !== 'number' || !Number.isFinite(r)) continue
    for (let i = 1; i < bands.length; i += 1) if (r > bands[i].lo && r <= bands[i].hi) { counts[bands[i].id] += 1; break }
  }
  return counts
}
const appCounts = countsFrom(words, true)          // App：遍历 words + isFolded 守卫
const stationCounts = countsFrom(foldUnits, false) // StationLearn：遍历 foldUnits
eq(appCounts.all, 54811, '⑥ App bandCounts.all == 54811')
let bandMis = 0
for (const b of bands) if (appCounts[b.id] !== stationCounts[b.id]) bandMis++
eq(bandMis, 0, '⑥ App 与 StationLearn bandCounts 逐档一致')
// 与真实抽词池 bandFilter(foldUnits) 对拍
let poolMis = 0
for (const b of bands) if (b.id !== 'all') { if (bandFilter(foldUnits, b.id).length !== appCounts[b.id]) poolMis++ }
eq(poolMis, 0, '⑥ bandCounts 与 bandFilter(foldUnits) 逐档一致（计数==队列池）')
const bandSum = bands.filter((b) => b.id !== 'all').reduce((a, b) => a + appCounts[b.id], 0)
console.log(`   App counts.all=${appCounts.all} | 各档之和=${bandSum}（差 = freqRank 缺失词 ${appCounts.all - bandSum}）`)

section('汇总')
console.log(`跑了 ${N} 条 / 过 ${N - FAILS.length} 条 / 挂 ${FAILS.length} 条`)
if (FAILS.length) { console.log('--- FAIL ---'); for (const f of FAILS) console.log(' FAIL: ' + f); process.exitCode = 1 } else console.log('RESULT: ALL_PASS')

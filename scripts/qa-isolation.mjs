/**
 * QA 独立验证：跨账号隔离（数据层）
 * ------------------------------------------------------------------
 * QA 自写，不复用 scripts/test-partition.mjs 的任何断言。
 * 目标：证明「按账号分区」在**数据层**真的成立，而不只是纯函数返回正确。
 *
 * 覆盖：
 *   I1  A 有 N 条本地记录（learning + migration 混合）→ 切到 scope B（云端空）
 *       → B 的上行集 filterUploadable/toPush 与 A 的 word_key 集合交集为 0
 *   I2  B 的 stats 渲染为 0
 *   I3  切回 A，A 的记录完好
 *   I4  statusSource==='migration' 永不入上行集（同账号也不行）
 *   I5  ensurePartition 的「首个领养者」语义：旧键只被第一个账号领养一次
 *   I6  游客 → 登录：真实学习证据向上合并；migration 记录不上行、也不进账号分区
 *
 * 运行：node scripts/qa-isolation.mjs
 */
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

// ---------------------------------------------------------------- jsdom 环境
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
// Node 22 的 globalThis.navigator 是只读 getter，必须 defineProperty 覆盖
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.localStorage = dom.window.localStorage
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const migrate = await import('../src/lib/migrate.js')
const merge = await import('../src/lib/cloud/merge.js')
const learning = await import('../src/lib/learning.js')

const { keysFor, scopeOf, readLearn, writeLearn, ensurePartition, GUEST_SCOPE } = migrate
const { filterUploadable, filterUploadableRows, mergeAll, stampRowsForUpload, isUploadableRecord } = merge

let pass = 0
const failures = []

function ok(name, fn) {
  try {
    fn()
    pass += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failures.push({ name, message: e.message })
    console.log(`  ✗ ${name}\n      ${e.message}`)
  }
}

function resetStorage() {
  localStorage.clear()
}

/**
 * 造一批本地记录：可指定 statusSource 分布。
 * @param {number} nLearning 真实学习证据条数
 * @param {number} nMigration迁移继承条数
 * @param {string} prefix word_key 前缀（保证 A / B 的 key 不重叠）
 */
function makeRecords(nLearning, nMigration, prefix) {
  const out = {}
  const now = new Date().toISOString()
  for (let i = 0; i < nLearning; i += 1) {
    out[`${prefix}.learn.${i}`] = {
      ...learning.emptyRecord(),
      status: 'known',
      statusSource: 'learning',
      consecutiveCorrect: 3,
      correctCount: 3,
      lastStudiedAt: now,
      statusChangedAt: now,
      updatedAt: now,
    }
  }
  for (let i = 0; i < nMigration; i += 1) {
    out[`${prefix}.mig.${i}`] = {
      ...learning.emptyRecord(),
      status: 'known',
      statusSource: 'migration',
      consecutiveCorrect: learning.MASTER_THRESHOLD,
      statusChangedAt: now,
      updatedAt: now,
    }
  }
  return out
}

/** 极简 countByStatus 复刻（真实实现在 learning.js，QA 独立再算一遍避免自证） */
function countByStatusQa(words, records) {
  let known = 0
  let review = 0
  let unknown = 0
  for (const w of words) {
    const r = records[w.id]
    if (r && r.status === 'known') known += 1
    else if (r && r.status === 'review') review += 1
    else unknown += 1
  }
  return { known, review, unknown }
}

// ================================================================ I1~I3 主场景
console.log('\n[qa-isolation] I1-I3  A(N 条混合) → 切 scope B(云端空) → 上行集隔离')

const A = 'uid-alice-aaaa'
const B = 'uid-bob-bbbbbbbb'

resetStorage()

// A 登录并产生 40 条学习证据 + 25 条 migration 继承记录
const aRecords = makeRecords(40, 25, 'w.A')
writeLearn(aRecords, scopeOf(A))
assert.deepEqual(Object.keys(readLearn(scopeOf(A))).length, 65, 'A 分区应有 65 条')

const aWordKeys = new Set(Object.keys(aRecords))
const aMigrationKeys = new Set(Object.keys(aRecords).filter((k) => aRecords[k].statusSource === 'migration'))

// 切到 B。B 是新账号 → 本地分区为空；云端也为空
const bScope = scopeOf(B)
ok('B 的分区键与 A 的分区键完全不同', () => {
  assert.notEqual(keysFor(scopeOf(A)).learn, keysFor(bScope).learn)
  assert.ok(keysFor(scopeOf(A)).learn.endsWith(`:${A}`))
  assert.ok(keysFor(bScope).learn.endsWith(`:${B}`))
})

const bLocal = readLearn(bScope) // L1 replaceAll(readLearn(newScope)) 的数据源
ok('B 的本地分区为空（L1 数据源不含 A 的行）', () => {
  assert.deepEqual(Object.keys(bLocal), [])
})

// B 的上行集：mergeAll(B 本地={}, B 云端={}) → toPush 应为空
const bMergeEmpty = mergeAll(bLocal, {})
ok('B 的 toPush 为空（云端空 + 本地空）', () => {
  assert.deepEqual(bMergeEmpty.toPush, [])
})

// 更严苛：即使 B 分区里被写入了 A 的行（模拟脏数据/旧 bug 复发），
// filterUploadableRows 也不该让 migration 行上行；且我们要验证
// 「切号后正常路径」下上行集与 A 的 key 交集为 0。
const bUploadRows = filterUploadableRows(stampRowsForUpload(bMergeEmpty.toPush))
ok('B 的上行行集合与 A 的 word_key 集合交集为 0', () => {
  const bKeys = new Set(bUploadRows.map((r) => r.wordKey))
  const intersection = [...bKeys].filter((k) => aWordKeys.has(k))
  assert.deepEqual(intersection, [], `不应有任何交集，实际：${intersection.join(',')}`)
})

// 反向证明：把 A 的记录直接喂给 B 的上行管线，验证 filterUploadable 的收敛
ok('【反向】A 的 65 条里只有 40 条 learning 会上行，25 条 migration 被剔除', () => {
  const aUpload = filterUploadable(aRecords)
  assert.equal(Object.keys(aUpload).length, 40)
  const leaked = Object.keys(aUpload).filter((k) => aMigrationKeys.has(k))
  assert.deepEqual(leaked, [], 'migration 记录不得出现在上行集')
})

ok('【反向】filterUploadableRows 对 toPush 行同样剔除 migration 行', () => {
  const rows = Object.keys(aRecords).map((wordKey) => ({ wordKey, record: aRecords[wordKey] }))
  const kept = filterUploadableRows(rows)
  assert.equal(kept.length, 40)
  assert.ok(kept.every((r) => r.record.statusSource !== 'migration'))
})

// ================================================================ I2 B 的 stats
console.log('\n[qa-isolation] I2  B 的统计渲染为 0')
const fakeWords = [
  { id: 'w.A.learn.0' },
  { id: 'w.A.learn.1' },
  { id: 'w.A.mig.0' },
  { id: 'w.unknown.x' },
]
const bStats = countByStatusQa(fakeWords, readLearn(bScope))
ok('B 的 known/review 均为 0（看不到 A 的任何标记）', () => {
  assert.equal(bStats.known, 0)
  assert.equal(bStats.review, 0)
  assert.equal(bStats.unknown, 4)
})

// ================================================================ I3 切回 A
console.log('\n[qa-isolation] I3  切回 A，数据完好')
ok('A 分区 65 条一字不差地还在', () => {
  const back = readLearn(scopeOf(A))
  assert.equal(Object.keys(back).length, 65)
  assert.deepEqual(Object.keys(back).sort(), [...aWordKeys].sort())
})
ok('A 的 migration 记录切回后仍在（本地统计照常计入）', () => {
  const back = readLearn(scopeOf(A))
  assert.equal(Object.keys(back).filter((k) => back[k].statusSource === 'migration').length, 25)
})
ok('A 的统计切回后恢复为 40 known + 25 migration known', () => {
  const back = readLearn(scopeOf(A))
  const st = countByStatusQa([...aWordKeys].map((id) => ({ id })), back)
  assert.equal(st.known, 65)
})

// ================================================================ I4 migration 永不上行
console.log('\n[qa-isolation] I4  migration 记录永不入上行集（同账号也不行）')
ok('isUploadableRecord 对 migration 返回 false', () => {
  assert.equal(isUploadableRecord({ statusSource: 'migration' }), false)
})
ok('对 learning / manual-* / 无 statusSource 返回 true', () => {
  assert.equal(isUploadableRecord({ statusSource: 'learning' }), true)
  assert.equal(isUploadableRecord({ statusSource: 'manual' }), true)
  assert.equal(isUploadableRecord({}), true)
  assert.equal(isUploadableRecord(null), false)
})
ok('即使 migration 行是 mergeAll 判定「本地胜出」，filterUploadableRows 仍剔除', () => {
  const now = new Date().toISOString()
  const local = { 'w.x': { status: 'review', statusSource: 'migration', updatedAt: now } }
  const remote = { 'w.x': { status: 'known', statusSource: 'learning', updatedAt: '2020-01-01T00:00:00.000Z' } }
  const { toPush } = mergeAll(local, remote)
  assert.equal(toPush.length, 1, 'mergeAll 判定本地胜出 → 进入 toPush')
  assert.equal(filterUploadableRows(toPush).length, 0, '但白名单把它挡在门外')
})

// ================================================================ I5 首个领养者
console.log('\n[qa-isolation] I5  ensurePartition「首个领养者」幂等（防旧键二次扩散）')
resetStorage()
localStorage.setItem('wrc.learn.v2', JSON.stringify({ version: 2, records: aRecords }))
const r1 = ensurePartition(scopeOf(A))
ok('A 是首个领养者 → 领到旧 learn 键', () => {
  assert.ok(r1.adopted.includes('learn'))
  assert.equal(Object.keys(readLearn(scopeOf(A))).length, 65)
})
const r2 = ensurePartition(scopeOf(B))
ok('B 不是首个领养者 → 不领养，A 的 65 条不会扩散到 B', () => {
  assert.ok(!r2.adopted.includes('learn'))
  assert.deepEqual(Object.keys(readLearn(scopeOf(B))), [])
})
const r3 = ensurePartition(scopeOf(A))
ok('A 重复调用幂等（skipped，不再复制）', () => {
  assert.equal(r3.adopted.length, 0)
  assert.equal(Object.keys(readLearn(scopeOf(A))).length, 65)
})

// ================================================================ I6 游客 → 登录
console.log('\n[qa-isolation] I6  游客 → 登录：证据向上合并，migration 不上行也不进账号分区')

resetStorage()
// 游客态：10 条真实学习证据 + 12 条 migration 继承
const guestRecords = makeRecords(10, 12, 'w.G')
writeLearn(guestRecords, GUEST_SCOPE)

ok('游客分区有 22 条', () => {
  assert.equal(Object.keys(readLearn(GUEST_SCOPE)).length, 22)
})

// 复刻 useLearnCloud.mergeGuestEvidence 的数据流（QA 独立实现，不 import 内部）
const guestEvidence = filterUploadable(readLearn(GUEST_SCOPE))
ok('游客证据过滤后只剩 10 条 learning（migration 被剔除）', () => {
  assert.equal(Object.keys(guestEvidence).length, 10)
  assert.ok(Object.keys(guestEvidence).every((k) => guestEvidence[k].statusSource !== 'migration'))
})

// 账号 A 首次登录：runMigration(A) 跑自己的迁移（inheritFreqKnown 默认 true）
// 用一份不含 freqRank 的极简词库 → A 自己的 runMigration 不会凭词频造出记录，
// 这样「migration 记录是否进入账号分区」就能被干净地观察。
const tinyWords = [{ id: 'w.pub.1' }, { id: 'w.pub.2' }]
migrate.runMigration({ scope: scopeOf(A), words: tinyWords, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })

const accountLocal = readLearn(scopeOf(A))
const mergedLocal = { ...accountLocal, ...mergeAll(guestEvidence, accountLocal).merged }

ok('合并后账号上行集含游客的 10 条证据', () => {
  const up = filterUploadable(mergedLocal)
  const guestEvidenceKeys = Object.keys(guestEvidence)
  assert.ok(guestEvidenceKeys.every((k) => up[k]), '游客的每条学习证据都应进入账号上行集')
  assert.equal(Object.keys(up).length, 10)
})

ok('游客的 12 条 migration 记录不在合并结果里（设计要求由账号自己的 runMigration 重生成）', () => {
  const guestMigKeys = Object.keys(guestRecords).filter((k) => guestRecords[k].statusSource === 'migration')
  const leaked = guestMigKeys.filter((k) => mergedLocal[k])
  assert.deepEqual(leaked, [], `migration 记录泄漏进账号分区：${leaked.join(',')}`)
})

ok('合并结果里没有任何 migration 来源的记录', () => {
  assert.ok(Object.values(mergedLocal).every((r) => r.statusSource !== 'migration'))
})

// 账号自己的 runMigration 产物（继承记录）确实带 migration，且不上行
const aOwnMig = readLearn(scopeOf(A))
ok('账号自己的 runMigration 产物存在且为 migration 来源（本例无 freqRank → 0 条继承）', () => {
  const migs = Object.values(aOwnMig).filter((r) => r.statusSource === 'migration')
  assert.equal(migs.length, 0, 'tinyWords 无 freqRank，不应产生继承记录')
})

// 带 freqRank 的词库 → 账号自己会生成继承记录，且这些记录同样不上行
resetStorage()
const freqWords = [
  { id: 'w.f.1', freqRank: 10 },
  { id: 'w.f.2', freqRank: 20 },
  { id: 'w.f.3', freqRank: 99999 },
]
const migRes = migrate.runMigration({ scope: scopeOf(A), words: freqWords, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })
ok('账号自己的 runMigration 生成 2 条继承记录', () => {
  assert.equal(migRes.ok, true)
  const recs = readLearn(scopeOf(A))
  assert.equal(Object.values(recs).filter((r) => r.statusSource === 'migration').length, 2)
})
ok('账号自己的继承记录也不上行', () => {
  assert.equal(Object.keys(filterUploadable(readLearn(scopeOf(A)))).length, 0)
})
ok('账号自己的继承记录在本地统计里照常计入（不因不上行而消失）', () => {
  const recs = readLearn(scopeOf(A))
  const st = countByStatusQa(freqWords, recs)
  assert.equal(st.known, 2)
  assert.equal(st.unknown, 1)
})

// ================================================================ 汇总
console.log(`\n[qa-isolation] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  console.error('[qa-isolation] ✗ 失败：')
  failures.forEach((f) => console.error(`  - ${f.name}: ${f.message}`))
  process.exit(1)
}
console.log('[qa-isolation] ✓ 全部通过')

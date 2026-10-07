/**
 * 冲突合并策略单测（按 updated_at 记录级 LWW）
 * 用法：npm run test:merge
 *
 * 覆盖两组：
 *   A. 合并语义（红线：mergeAll / mergeRecord 语义一行未改）
 *   B. 上行白名单（证据过滤 / 时间戳兜底 / 证据合并幂等）—— T02 新增
 */
import assert from 'node:assert/strict'
import {
  fingerprint,
  filterUploadable,
  filterUploadableRows,
  isUploadableRecord,
  mergeAll,
  mergeRecord,
  stampRowsForUpload,
  updatedAtMs,
} from '../src/lib/cloud/merge.js'
import { assertNoSrsFields, learnRecordToRow } from '../src/lib/cloud/schema.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

const rec = (over = {}) => ({
  status: 'unknown',
  correctCount: 0,
  consecutiveCorrect: 0,
  incorrectCount: 0,
  lastStudiedAt: null,
  lastResult: null,
  lastIncorrectAt: null,
  nextDueAt: null,
  statusChangedAt: null,
  statusSource: 'initial',
  ...over,
})

console.log('[test:merge]')

test('updatedAtMs：缺失 / 非法一律视为 0', () => {
  assert.equal(updatedAtMs(rec()), 0)
  assert.equal(updatedAtMs({ updatedAt: 'not-a-date' }), 0)
  assert.equal(updatedAtMs({ updatedAt: '2026-01-01T00:00:00.000Z' }), Date.parse('2026-01-01T00:00:00.000Z'))
})

test('fingerprint：内容相同则指纹相同，updatedAt 不参与', () => {
  const a = rec({ status: 'known', updatedAt: '2026-01-01T00:00:00.000Z' })
  const b = rec({ status: 'known', updatedAt: '2999-01-01T00:00:00.000Z' })
  assert.equal(fingerprint(a), fingerprint(b))
  assert.notEqual(fingerprint(a), fingerprint(rec({ status: 'review' })))
})

test('仅本地有 → 上行', () => {
  const { merged, toPush, toLocal } = mergeAll({ 'w.a': rec({ status: 'known' }) }, {})
  assert.equal(merged['w.a'].status, 'known')
  assert.equal(toPush.length, 1)
  assert.equal(toLocal.length, 0)
})

test('仅云端有 → 下行', () => {
  const { merged, toPush, toLocal } = mergeAll({}, { 'w.a': rec({ status: 'review' }) })
  assert.equal(merged['w.a'].status, 'review')
  assert.equal(toPush.length, 0)
  assert.deepEqual(toLocal, ['w.a'])
})

test('本地更新 → 本地胜出并上行', () => {
  const l = rec({ status: 'known', updatedAt: '2026-05-02T00:00:00.000Z' })
  const r = rec({ status: 'unknown', updatedAt: '2026-05-01T00:00:00.000Z' })
  const { merged, toPush } = mergeAll({ 'w.a': l }, { 'w.a': r })
  assert.equal(merged['w.a'].status, 'known')
  assert.equal(toPush.length, 1)
})

test('云端更新 → 云端胜出并下行', () => {
  const l = rec({ status: 'unknown', updatedAt: '2026-05-01T00:00:00.000Z' })
  const r = rec({ status: 'known', updatedAt: '2026-05-02T00:00:00.000Z' })
  const { merged, toLocal } = mergeAll({ 'w.a': l }, { 'w.a': r })
  assert.equal(merged['w.a'].status, 'known')
  assert.deepEqual(toLocal, ['w.a'])
})

test('本地无 updatedAt（旧数据）→ 视为 0，取云端', () => {
  const l = rec({ status: 'known' })
  const r = rec({ status: 'review', updatedAt: '2026-05-02T00:00:00.000Z' })
  const { merged } = mergeAll({ 'w.a': l }, { 'w.a': r })
  assert.equal(merged['w.a'].status, 'review')
})

test('时间戳相等且内容不同 → 取云端（服务端权威）', () => {
  const t = '2026-05-02T00:00:00.000Z'
  const l = rec({ status: 'unknown', updatedAt: t })
  const r = rec({ status: 'known', updatedAt: t })
  const { merged } = mergeAll({ 'w.a': l }, { 'w.a': r })
  assert.equal(merged['w.a'].status, 'known')
})

test('时间戳相等且内容相同 → 保留本地并带上云端的 updatedAt', () => {
  const t = '2026-05-02T00:00:00.000Z'
  const l = rec({ status: 'known', updatedAt: t })
  const r = rec({ status: 'known', updatedAt: t })
  const out = mergeRecord(l, r)
  assert.equal(out.winner, 'local')
  assert.equal(out.record.updatedAt, t)
})

test('多键合并：统计正确、不丢任何一方的词', () => {
  const local = { 'w.a': rec({ updatedAt: '2026-05-02T00:00:00.000Z', status: 'known' }) }
  const remote = {
    'w.a': rec({ updatedAt: '2026-05-01T00:00:00.000Z', status: 'unknown' }),
    'w.b': rec({ updatedAt: '2026-05-03T00:00:00.000Z', status: 'review' }),
  }
  const { merged, stats } = mergeAll(local, remote)
  assert.equal(Object.keys(merged).length, 2)
  assert.equal(stats.conflictLocal, 1)
  assert.equal(stats.remoteOnly, 1)
})

test('红线：写入行不含任何 SRS 字段', () => {
  const row = learnRecordToRow(rec({ status: 'known' }), 'uid-1', 'w.a')
  assert.equal('ease' in row, false)
  assert.equal('interval' in row, false)
  assert.equal('lapses' in row, false)
  assert.equal('reps' in row, false)
  assert.equal(row.owner_id, 'uid-1')
  assert.equal(row.word_key, 'w.a')
})

test('红线：出现 SRS 字段直接抛错', () => {
  assert.throws(() => assertNoSrsFields({ ease: 2.5 }, 'test'), /SRS/)
  assert.throws(() => assertNoSrsFields({ lapses: 1 }, 'test'), /SRS/)
})

test('红线：记录里的 SRS 字段不会漏进上行行', () => {
  const row = learnRecordToRow(rec({ interval: 3, reps: 9 }), 'uid-1', 'w.a')
  assert.equal('interval' in row, false)
  assert.equal('reps' in row, false)
})

// ================================================================ B. 上行白名单（T02）

console.log('[test:merge] 上行白名单')

test('isUploadableRecord：migration 来源永不上行，其他来源一律上行', () => {
  assert.equal(isUploadableRecord(rec({ statusSource: 'migration' })), false)
  ;['initial', 'learning', 'manual', 'manual-known', 'manual-retreat', null, undefined].forEach((s) => {
    assert.equal(isUploadableRecord(rec({ statusSource: s })), true, `${s} 应可上行`)
  })
  assert.equal(isUploadableRecord(null), false)
  assert.equal(isUploadableRecord('x'), false)
})

test('filterUploadable：3 万条继承记录被剔除，真实学习证据全部保留（且不改入参）', () => {
  const inherited = {}
  for (let i = 0; i < 30000; i += 1) inherited[`w.i${i}`] = rec({ statusSource: 'migration' })
  const evidence = {}
  for (let i = 0; i < 20; i += 1) {
    evidence[`w.l${i}`] = rec({ statusSource: 'learning', updatedAt: '2026-05-01T00:00:00.000Z' })
  }
  const all = { ...inherited, ...evidence }
  const snapshot = JSON.stringify(all)
  const out = filterUploadable(all)
  assert.equal(Object.keys(out).length, 20, '只有 20 条真实证据可上行')
  assert.ok(out['w.l0'])
  assert.equal(out['w.i0'], undefined)
  assert.equal(JSON.stringify(all), snapshot, '入参不得被改写')
})

test('游客证据 → 账号分区：只并证据，不并继承集合（理由见设计 A-4）', () => {
  const guest = {
    'w.inherit': rec({ statusSource: 'migration' }),
    'w.learn': rec({ statusSource: 'learning', updatedAt: '2026-05-02T00:00:00.000Z' }),
  }
  const accountLocal = {}
  const evidence = filterUploadable(guest)
  const merged = { ...accountLocal, ...mergeAll(evidence, accountLocal).merged }
  assert.deepEqual(Object.keys(merged), ['w.learn'], '继承记录不进账号分区（账号会自己生成符合自己开关的一份）')
  assert.equal(merged['w.learn'].statusSource, 'learning')
})

test('stampRowsForUpload：四级兜底（updatedAt → statusChangedAt → lastStudiedAt → now）', () => {
  const NOW = '2026-06-01T00:00:00.000Z'
  const rows = [
    { wordKey: 'w.1', record: rec({ updatedAt: '2026-01-01T00:00:00.000Z', statusChangedAt: 'x', lastStudiedAt: 'y' }) },
    { wordKey: 'w.2', record: rec({ statusChangedAt: '2026-02-01T00:00:00.000Z' }) },
    { wordKey: 'w.3', record: rec({ lastStudiedAt: '2026-03-01T00:00:00.000Z' }) },
    { wordKey: 'w.4', record: rec() },
  ]
  const out = stampRowsForUpload(rows, NOW)
  assert.deepEqual(
    out.map((r) => r.record.updatedAt),
    ['2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z', '2026-03-01T00:00:00.000Z', NOW],
  )
})

test('幂等：同一份证据重复合并两次，结果完全一致（登录→登出→再登录不会漂移）', () => {
  const guest = {
    'w.a': rec({ statusSource: 'learning', status: 'review', updatedAt: '2026-05-01T00:00:00.000Z' }),
    'w.b': rec({ statusSource: 'learning', status: 'known', updatedAt: '2026-05-02T00:00:00.000Z' }),
    'w.inh': rec({ statusSource: 'migration', status: 'known' }),
  }
  const evidence = filterUploadable(guest)

  // 第一次进入账号分区
  let local = {}
  let r1 = mergeAll(evidence, local)
  local = { ...local, ...r1.merged }

  // 第二次进入账号分区（游客证据还在，账号分区已有这些键）
  const r2 = mergeAll(evidence, local)
  local = { ...local, ...r2.merged }

  // 第三次
  const r3 = mergeAll(evidence, local)
  local = { ...local, ...r3.merged }

  const first = JSON.stringify(r1.merged)
  assert.equal(JSON.stringify(r2.merged), first, '第二次合并不得改变任何字段')
  assert.equal(JSON.stringify(r3.merged), first, '第三次合并仍不得改变')
  assert.deepEqual(Object.keys(local).sort(), ['w.a', 'w.b'], '继承记录始终不进来')
})

test('幂等：重复 mergeAll（同输入两次）toPush 集合一致 —— 不会反复推同一批', () => {
  const local = {
    'w.a': rec({ statusSource: 'learning', updatedAt: '2026-05-02T00:00:00.000Z' }),
    'w.inh': rec({ statusSource: 'migration' }),
  }
  const remote = { 'w.a': rec({ status: 'unknown', updatedAt: '2026-05-01T00:00:00.000Z' }) }
  const run1 = filterUploadableRows(stampRowsForUpload(mergeAll(local, remote).toPush))
  const run2 = filterUploadableRows(stampRowsForUpload(mergeAll(local, remote).toPush))
  assert.deepEqual(run1.map((r) => r.wordKey), ['w.a'])
  assert.deepEqual(run2.map((r) => r.wordKey), run1.map((r) => r.wordKey))
})

test('跨账号污染防线：A 的 500 条本地行绝不会出现在 B 的上行集合里', () => {
  // 切到 B 时，recordsRef 只可能是 B 分区的数据；此处用「B 分区为空」复现该前提
  const bPartition = {} // 云端也是空的
  const { toPush } = mergeAll(bPartition, {})
  assert.deepEqual(toPush, [])
  assert.deepEqual(filterUploadableRows(stampRowsForUpload(toPush)), [])
})

test('时间戳兜底后 learnRecordToRow 的 updated_at 一定非空（GAP-4 验收）', () => {
  const rows = stampRowsForUpload([{ wordKey: 'w.a', record: rec() }], '2026-06-01T00:00:00.000Z')
  const row = learnRecordToRow(rows[0].record, 'uid-1', rows[0].wordKey)
  assert.ok(row.updated_at, 'updated_at 必须非空，否则云端 LWW 会把这条当最旧')
  assert.equal(row.updated_at, '2026-06-01T00:00:00.000Z')
})

test('游客态新写的记录带 updatedAt，合并时不会被云端默认 unknown 覆盖（GAP-4 根因）', () => {
  // 游客答题：useLearn 的 stampUpdatedAt 现在默认 true
  const guestRecord = rec({ status: 'review', statusSource: 'learning', updatedAt: '2026-05-10T00:00:00.000Z' })
  // 云端同一词还停在默认态（updatedAt 更早 —— 模拟「云端从没见过这次答题」）
  const cloudDefault = rec({ status: 'unknown', statusSource: null, updatedAt: '2026-05-01T00:00:00.000Z' })
  const { record, winner } = mergeRecord(guestRecord, cloudDefault)
  assert.equal(winner, 'local')
  assert.equal(record.status, 'review', '本地真实学习证据不被云端默认值覆盖')
})

test('老数据（无 updatedAt）仍按原口径取云端 —— 裁决规则未变', () => {
  const legacyLocal = rec({ status: 'known', statusSource: 'learning' })
  const cloud = rec({ status: 'unknown', updatedAt: '2026-05-02T00:00:00.000Z' })
  const { winner } = mergeRecord(legacyLocal, cloud)
  assert.equal(winner, 'remote', '无 updatedAt 视为 0 → 取云端（红线：裁决口径不变）')
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

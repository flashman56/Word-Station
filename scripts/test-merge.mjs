/**
 * 冲突合并策略单测（按 updated_at 记录级 LWW）
 * 用法：npm run test:merge
 */
import assert from 'node:assert/strict'
import { fingerprint, mergeAll, mergeRecord, updatedAtMs } from '../src/lib/cloud/merge.js'
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

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

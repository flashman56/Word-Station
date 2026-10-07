/**
 * 分区键与上行过滤的纯函数单测（Node 直跑，零浏览器依赖）
 * ------------------------------------------------------------------
 * 跑：npm run test:partition
 *
 * 覆盖：
 *   - keysFor 的键集合与后缀格式
 *   - scopeOf / normalizeScope 的回落（绝不抛错、绝不返回 undefined 键）
 *   - ensurePartition 幂等（连跑两次 adopted 不变、旧键仍在、第二个 scope 不领养）
 *   - readPrefs / writePrefs 与 inheritFreqKnown 迁出 settings
 *   - filterUploadable 剔除 migration 记录
 *   - stampRowsForUpload 四级兜底
 *   - readCloudMigration 按 scope 隔离（GAP-3 根因）
 *   - runMigration 按 scope 隔离且旧键不被删除
 */
import assert from 'node:assert/strict'

/** 极简 localStorage mock（够 migrate.js 用，带配额/异常注入能力） */
function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    get size() {
      return map.size
    },
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}

globalThis.localStorage = fakeStorage()

const {
  GUEST_SCOPE,
  LEGACY_KEYS,
  FROZEN_KEYS,
  affectsLocalScope,
  ensurePartition,
  isStorageKey,
  keysFor,
  normalizeScope,
  readCloudMigration,
  readLearn,
  readPrefs,
  readSettingsV2,
  runMigration,
  scopeOf,
  writeCloudMigration,
  writeLearn,
  writePrefs,
  writeSync,
  readSync,
} = await import('../src/lib/migrate.js')

const { filterUploadable, filterUploadableRows, isUploadableRecord, stampRowsForUpload, mergeAll } = await import(
  '../src/lib/cloud/merge.js'
)

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

function reset() {
  globalThis.localStorage = fakeStorage()
}

console.log('[test:partition]')

/** 设备级设置键（用于断言 isStorageKey；不引入裸键名字面量） */
const KEYS_FOR_TEST = keysFor('guest').settings

// ---------------------------------------------------------------- scopeOf / normalizeScope

test('scopeOf：null / undefined / 空串 / 空格 / 非字符串一律回落 guest', () => {
  assert.equal(scopeOf(null), 'guest')
  assert.equal(scopeOf(undefined), 'guest')
  assert.equal(scopeOf(''), 'guest')
  assert.equal(scopeOf('   '), 'guest')
  assert.equal(scopeOf(0), 'guest')
  assert.equal(scopeOf(123), 'guest')
  assert.equal(scopeOf(false), 'guest')
  assert.equal(scopeOf({}), 'guest')
  assert.equal(scopeOf([]), 'guest')
  assert.equal(scopeOf(GUEST_SCOPE), 'guest')
  assert.equal(scopeOf('uid-A'), 'uid-A')
  assert.equal(scopeOf('  uid-B  '), 'uid-B')
  assert.equal(normalizeScope('uid-C'), 'uid-C')
})

test('scopeOf：绝不抛错（畸形输入也返回字符串）', () => {
  const weird = [Symbol('x'), () => {}, NaN, Infinity, new Date(0)]
  weird.forEach((w) => {
    const s = scopeOf(w)
    assert.equal(typeof s, 'string')
    assert.ok(s.length > 0, 'scope 不得为空串')
  })
})

// ---------------------------------------------------------------- keysFor

test('keysFor：分区键带 :<scope> 后缀，设备级 / 全局键不带', () => {
  const k = keysFor('uid-A')
  assert.equal(k.scope, 'uid-A')
  assert.equal(k.learn, 'wrc.learn.v2:uid-A')
  assert.equal(k.prefs, 'wrc.prefs.v1:uid-A')
  assert.equal(k.migration, 'wrc.migration.v2:uid-A')
  assert.equal(k.sync, 'wrc.sync.v1:uid-A')
  assert.equal(k.cloudMigration, 'wrc.migration.cloud:uid-A')
  assert.equal(k.drafts, 'wrc.drafts.v1:uid-A')
  assert.equal(k.stationCurrent, 'wrc.station.current:uid-A')
  assert.equal(k.userWordsCache, 'wrc.userwords.v1:uid-A')
  // 设备级 / 全局：跨账号共享，不带后缀
  assert.equal(k.settings, 'wrc.settings.v2')
  assert.equal(k.partition, 'wrc.partition.v1')
  assert.equal(k.draftsDiscarded, 'wrc.drafts.discarded')
})

test('keysFor：非法 scope 回落 guest，绝不返回 undefined 键', () => {
  ;[null, undefined, '', 42, {}].forEach((bad) => {
    const k = keysFor(bad)
    Object.keys(k).forEach((name) => {
      assert.equal(typeof k[name], 'string', `${name} 必须是字符串`)
      assert.ok(k[name].length > 0, `${name} 不得为空串`)
    })
    assert.equal(k.learn, 'wrc.learn.v2:guest')
  })
})

test('keysFor：不同 scope 的分区键互不相同（这是隔离的全部基础）', () => {
  const a = keysFor('uid-A')
  const b = keysFor('uid-B')
  const g = keysFor('guest')
  const partitioned = ['learn', 'prefs', 'migration', 'sync', 'cloudMigration', 'drafts', 'stationCurrent', 'userWordsCache']
  partitioned.forEach((name) => {
    const set = new Set([a[name], b[name], g[name]])
    assert.equal(set.size, 3, `${name} 必须在三个 scope 下互不相同`)
  })
  // 设备级键故意相同
  assert.equal(a.settings, b.settings)
  assert.equal(a.partition, b.partition)
})

// ---------------------------------------------------------------- ensurePartition

test('ensurePartition：领养旧 learn 键，旧键本身仍在', () => {
  reset()
  localStorage.setItem(LEGACY_KEYS.learn, JSON.stringify({ version: 2, records: { 'w.a': { status: 'known' } } }))
  const res = ensurePartition('uid-A')
  assert.equal(res.ok, true)
  assert.deepEqual(res.adopted, ['learn'])
  assert.ok(localStorage.getItem(LEGACY_KEYS.learn) != null, '旧键必须保留不删')
  const adopted = JSON.parse(localStorage.getItem(keysFor('uid-A').partition))
  assert.equal(adopted.adopted.learn, 'uid-A')
  const recs = readLearn('uid-A')
  assert.equal(recs['w.a'].status, 'known')
})

test('ensurePartition：幂等 —— 连跑两次 adopted 不变、不重复领养', () => {
  reset()
  localStorage.setItem(LEGACY_KEYS.learn, JSON.stringify({ version: 2, records: { 'w.a': { status: 'known' } } }))
  const first = ensurePartition('uid-A')
  const second = ensurePartition('uid-A')
  assert.deepEqual(first.adopted, ['learn'])
  assert.deepEqual(second.adopted, [], '第二次不应再领养')
  assert.equal(second.skipped, true)
  const adopted = JSON.parse(localStorage.getItem(keysFor('uid-A').partition))
  assert.equal(adopted.adopted.learn, 'uid-A')
})

test('ensurePartition：第二个账号不领养旧键（旧数据不二次扩散）', () => {
  reset()
  localStorage.setItem(LEGACY_KEYS.learn, JSON.stringify({ version: 2, records: { 'w.a': { status: 'known' } } }))
  ensurePartition('uid-A')
  const resB = ensurePartition('uid-B')
  assert.deepEqual(resB.adopted, [], 'B 不得领养 A 已领养的旧键')
  assert.deepEqual(readLearn('uid-B'), {}, 'B 分区必须是空的')
  assert.equal(readLearn('uid-A')['w.a'].status, 'known', 'A 的数据完好')
})

test('ensurePartition：旧草稿只有登录账号能领养，游客不领', () => {
  reset()
  localStorage.setItem(LEGACY_KEYS.drafts, JSON.stringify({ learn: [{ ownerId: 'uid-A', rows: [] }] }))
  const guest = ensurePartition('guest')
  assert.ok(!guest.adopted.includes('drafts'), '游客不领养草稿（等人登录）')
  assert.ok(localStorage.getItem(keysFor('guest').drafts) == null)
  const a = ensurePartition('uid-A')
  assert.ok(a.adopted.includes('drafts'), '首个登录账号领养旧草稿')
  assert.equal(JSON.parse(localStorage.getItem(keysFor('uid-A').drafts)).learn.length, 1)
})

test('ensurePartition：无 localStorage 时静默返回 ok:false，不抛错', () => {
  const saved = globalThis.localStorage
  globalThis.localStorage = undefined
  try {
    const res = ensurePartition('uid-A')
    assert.equal(res.ok, false)
    assert.equal(res.skipped, true)
  } finally {
    globalThis.localStorage = saved
  }
})

test('ensurePartition：单步失败不影响其余步骤，也不回滚已成功的步骤', () => {
  reset()
  localStorage.setItem(LEGACY_KEYS.learn, JSON.stringify({ version: 2, records: { 'w.a': { status: 'known' } } }))
  localStorage.setItem(LEGACY_KEYS.stationCurrent, 'st-1')
  const realSet = localStorage.setItem
  localStorage.setItem = (k, v) => {
    if (k === keysFor('uid-A').stationCurrent) throw new Error('磁盘满')
    realSet.call(localStorage, k, v)
  }
  const res = ensurePartition('uid-A')
  localStorage.setItem = realSet
  assert.equal(res.ok, true)
  assert.ok(res.adopted.includes('learn'), 'learn 已成功领养')
  assert.ok(!res.adopted.includes('stationCurrent'), 'stationCurrent 领养失败')
  assert.equal(readLearn('uid-A')['w.a'].status, 'known')
})

// ---------------------------------------------------------------- cloudMigration 分区（GAP-3 根因）

test('readCloudMigration：A 登录写过的 done 不会让 B 跳过迁移（跨账号污染的根因）', () => {
  reset()
  assert.equal(readCloudMigration('uid-A').done, false)
  writeCloudMigration('uid-A')
  assert.equal(readCloudMigration('uid-A').done, true)
  assert.equal(readCloudMigration('uid-B').done, false, 'B 的分区必须是独立的 false')
  assert.equal(readCloudMigration('guest').done, false)
})

test('readSync / writeSync：游标按 scope 隔离，B 必走全量', () => {
  reset()
  writeSync('2026-01-01T00:00:00.000Z', 'uid-A')
  assert.equal(readSync('uid-A').lastSyncAt, '2026-01-01T00:00:00.000Z')
  assert.equal(readSync('uid-B').lastSyncAt, null, 'B 的游标必须为 null → 首次必走全量')
})

// ---------------------------------------------------------------- prefs / settings

test('prefs 独立成键：inheritFreqKnown 不再随 settings 走', () => {
  reset()
  writePrefs({ inheritFreqKnown: false }, 'uid-A')
  assert.equal(readPrefs('uid-A').inheritFreqKnown, false)
  assert.equal(readPrefs('uid-B').inheritFreqKnown, true, 'B 默认开启，不继承 A 的关闭态')
  assert.deepEqual(readSettingsV2(), {}, 'settings 里不该有 inheritFreqKnown')
  assert.ok(readPrefs('uid-A').updatedAt, 'prefs 要记 updatedAt')
})

test('prefs 载荷形状固定为 { inheritFreqKnown, updatedAt }', () => {
  reset()
  writePrefs({ inheritFreqKnown: true }, 'uid-A')
  const raw = JSON.parse(localStorage.getItem(keysFor('uid-A').prefs))
  assert.deepEqual(Object.keys(raw).sort(), ['inheritFreqKnown', 'updatedAt'])
})

test('readPrefs：无记录 / 脏数据时回落默认值，不崩', () => {
  reset()
  assert.deepEqual(readPrefs('uid-A'), { inheritFreqKnown: true, updatedAt: null })
  localStorage.setItem(keysFor('uid-A').prefs, '{坏 JSON')
  assert.deepEqual(readPrefs('uid-A'), { inheritFreqKnown: true, updatedAt: null })
})

// ---------------------------------------------------------------- runMigration 分区

const M_WORDS = [
  { id: 'w.known', freqRank: 10 },
  { id: 'w.review', freqRank: 20000 },
  { id: 'w.freqy', freqRank: 1200 },
  { id: 'w.plain', freqRank: 30000 },
  { id: 'w.ghost', freqRank: 40000 },
]

test('runMigration：按 scope 写入互不干扰的两个分区', () => {
  reset()
  localStorage.setItem(FROZEN_KEYS.statusV1, JSON.stringify({ 'w.known': 'known', 'w.review': 'review' }))
  const a = runMigration({ scope: 'uid-A', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })
  assert.equal(a.ok, true)
  assert.equal(readLearn('uid-A')['w.known'].status, 'known')
  assert.deepEqual(readLearn('uid-B'), {}, 'B 分区必须为空（不会被 A 的迁移结果污染）')
  // B 自己跑一次，继承集合属于 B 自己的开关
  const b = runMigration({ scope: 'uid-B', words: M_WORDS, inheritFreqKnown: false, now: '2026-01-01T00:00:00.000Z' })
  assert.equal(b.ok, true)
  assert.equal(readLearn('uid-B')['w.known'].status, 'known', '手工标注是设备级的，两账号都会继承')
  assert.equal(readLearn('uid-B')['w.freqy'], undefined, 'B 关了继承 → 不生成继承记录')
  assert.ok(readLearn('uid-A')['w.freqy'], 'A 开着继承 → 有继承记录')
  assert.equal(readLearn('uid-A')['w.freqy'].statusSource, 'migration')
})

test('runMigration：幂等，第二次调用跳过', () => {
  reset()
  localStorage.setItem(FROZEN_KEYS.statusV1, JSON.stringify({ 'w.known': 'known' }))
  runMigration({ scope: 'uid-A', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })
  const second = runMigration({ scope: 'uid-A', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-02T00:00:00.000Z' })
  assert.equal(second.skipped, true)
})

test('runMigration：冻结键只读不写、只备份一次', () => {
  reset()
  localStorage.setItem(FROZEN_KEYS.statusV1, JSON.stringify({ 'w.known': 'known' }))
  runMigration({ scope: 'uid-A', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })
  assert.equal(localStorage.getItem(FROZEN_KEYS.statusV1), JSON.stringify({ 'w.known': 'known' }), 'v1 源不得被改写')
  const backup = localStorage.getItem(FROZEN_KEYS.statusV1Backup)
  assert.ok(backup != null, '必须写一次备份')
  localStorage.setItem(FROZEN_KEYS.statusV1Backup, '{"tampered":true}')
  // 换一个 scope 触发新的 runMigration（幂等标记是按 scope 的）
  runMigration({ scope: 'uid-B', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-02T00:00:00.000Z' })
  assert.equal(localStorage.getItem(FROZEN_KEYS.statusV1Backup), '{"tampered":true}', '备份只写一次，永不覆盖')
})

test('runMigration：写入失败时不留下半份 v2（含分区键）', () => {
  reset()
  localStorage.setItem(FROZEN_KEYS.statusV1, JSON.stringify({ 'w.known': 'known' }))
  const keys = keysFor('uid-A')
  const realSet = localStorage.setItem
  localStorage.setItem = (k, v) => {
    if (k === keys.learn) throw new Error('磁盘满')
    realSet.call(localStorage, k, v)
  }
  const res = runMigration({ scope: 'uid-A', words: M_WORDS, inheritFreqKnown: true, now: '2026-01-01T00:00:00.000Z' })
  localStorage.setItem = realSet
  assert.equal(res.ok, false)
  assert.equal(localStorage.getItem(keys.learn), null)
  assert.equal(localStorage.getItem(keys.migration), null)
  assert.equal(localStorage.getItem(keys.prefs), null)
})

test('writeLearn：载荷形状字节级不变 { version, records }', () => {
  reset()
  writeLearn({ 'w.a': { status: 'known' } }, 'uid-A')
  const raw = JSON.parse(localStorage.getItem(keysFor('uid-A').learn))
  assert.deepEqual(Object.keys(raw).sort(), ['records', 'version'])
  assert.equal(raw.version, 2)
})

test('readLearn：无键 / 脏数据 / 缺 records 一律退化为空对象', () => {
  reset()
  assert.deepEqual(readLearn('uid-A'), {})
  localStorage.setItem(keysFor('uid-A').learn, 'null')
  assert.deepEqual(readLearn('uid-A'), {})
  localStorage.setItem(keysFor('uid-A').learn, '"字符串"')
  assert.deepEqual(readLearn('uid-A'), {})
  localStorage.setItem(keysFor('uid-A').learn, JSON.stringify({ version: 2 }))
  assert.deepEqual(readLearn('uid-A'), {})
})

// ---------------------------------------------------------------- 上行过滤

const rec = (over = {}) => ({
  status: 'review',
  correctCount: 1,
  consecutiveCorrect: 0,
  incorrectCount: 1,
  lastStudiedAt: null,
  lastResult: 'incorrect',
  lastIncorrectAt: null,
  nextDueAt: null,
  statusChangedAt: null,
  statusSource: 'learning',
  ...over,
})

test('isUploadableRecord：migration 来源永不上行，其他一律上行', () => {
  assert.equal(isUploadableRecord(rec({ statusSource: 'migration' })), false)
  assert.equal(isUploadableRecord(rec({ statusSource: 'learning' })), true)
  assert.equal(isUploadableRecord(rec({ statusSource: 'manual-known' })), true)
  assert.equal(isUploadableRecord(rec({ statusSource: 'manual-retreat' })), true)
  assert.equal(isUploadableRecord(rec({ statusSource: 'manual' })), true)
  assert.equal(isUploadableRecord(rec({ statusSource: 'initial' })), true)
  assert.equal(isUploadableRecord(rec({ statusSource: null })), true, '缺失来源视为真实记录')
  assert.equal(isUploadableRecord(null), false)
  assert.equal(isUploadableRecord(undefined), false)
  assert.equal(isUploadableRecord('字符串'), false)
})

test('filterUploadable：剔除 3 万条继承记录，保留真实学习证据，且不改入参', () => {
  const map = {
    'w.inherit1': rec({ statusSource: 'migration' }),
    'w.inherit2': rec({ statusSource: 'migration' }),
    'w.learn1': rec({ statusSource: 'learning' }),
    'w.manual': rec({ statusSource: 'manual-known' }),
  }
  const frozen = JSON.stringify(map)
  const out = filterUploadable(map)
  assert.deepEqual(Object.keys(out).sort(), ['w.learn1', 'w.manual'])
  assert.equal(JSON.stringify(map), frozen, '入参不得被修改')
  assert.deepEqual(filterUploadable(null), {})
  assert.deepEqual(filterUploadable({}), {})
})

test('filterUploadableRows：toPush 里混了继承记录时只上行证据', () => {
  const rows = [
    { wordKey: 'w.a', record: rec({ statusSource: 'learning' }) },
    { wordKey: 'w.b', record: rec({ statusSource: 'migration' }) },
    { wordKey: 'w.c', record: rec({ statusSource: 'manual' }) },
    null,
    { wordKey: '', record: rec() },
  ]
  const out = filterUploadableRows(rows)
  assert.deepEqual(out.map((r) => r.wordKey), ['w.a', 'w.c'])
  assert.deepEqual(filterUploadableRows(null), [])
})

test('stampRowsForUpload：四级时间戳兜底', () => {
  const NOW = '2026-06-01T00:00:00.000Z'
  const rows = [
    { wordKey: 'w.full', record: rec({ updatedAt: '2026-01-01T00:00:00.000Z', statusChangedAt: 'x', lastStudiedAt: 'y' }) },
    { wordKey: 'w.status', record: rec({ statusChangedAt: '2026-02-01T00:00:00.000Z', lastStudiedAt: 'y' }) },
    { wordKey: 'w.studied', record: rec({ lastStudiedAt: '2026-03-01T00:00:00.000Z' }) },
    { wordKey: 'w.none', record: rec() },
  ]
  const out = stampRowsForUpload(rows, NOW)
  assert.equal(out[0].record.updatedAt, '2026-01-01T00:00:00.000Z', '一级：已有 updatedAt 不动')
  assert.equal(out[1].record.updatedAt, '2026-02-01T00:00:00.000Z', '二级：退 statusChangedAt')
  assert.equal(out[2].record.updatedAt, '2026-03-01T00:00:00.000Z', '三级：退 lastStudiedAt')
  assert.equal(out[3].record.updatedAt, NOW, '四级：退 now')
  // 不改入参
  assert.equal(rows[1].record.updatedAt, undefined)
  assert.deepEqual(stampRowsForUpload(null, NOW), [])
  assert.deepEqual(stampRowsForUpload([null, { wordKey: 'w.x' }], NOW), [])
})

test('游客 20 条真实证据 + 3 万条继承记录：合并后只上行 20 条', () => {
  // 构造 3 万条继承记录（不进上传白名单）
  const inherited = {}
  for (let i = 0; i < 30000; i += 1) inherited[`w.i${i}`] = rec({ statusSource: 'migration' })
  // 20 条真实学习证据
  const evidence = {}
  for (let i = 0; i < 20; i += 1) {
    evidence[`w.l${i}`] = rec({ statusSource: 'learning', updatedAt: '2026-05-01T00:00:00.000Z' })
  }
  const guestPartition = { ...inherited, ...evidence }

  // 步骤1：游客证据 → 账号分区（继承记录不并入，理由见设计 A-4）
  const mergedIntoAccount = { ...inherited, ...mergeAll(evidence, {}).merged }
  assert.equal(Object.keys(mergedIntoAccount).length, 30020, '继承记录留在游客分区，证据并入账号')

  // 步骤2：账号本地 → 云端（云端空）
  const { merged, toPush } = mergeAll(mergedIntoAccount, {})
  assert.equal(Object.keys(merged).length, 30020)

  // 步骤3：只上传真实学习证据
  const up = filterUploadableRows(toPush)
  assert.equal(up.length, 20, '只有 20 条真实证据上行，3 万条继承记录不上行')
  assert.ok(up.every((r) => r.record.statusSource === 'learning'))

  // 本地统计仍含全部 30020 条
  assert.equal(Object.keys(merged).length, 30020)
})

test('A 有 500 条 → 切到 B（云端 0 条）：B 分区恒为空，A 完好', () => {
  reset()
  const aRecords = {}
  for (let i = 0; i < 500; i += 1) {
    aRecords[`w.a${i}`] = rec({ statusSource: 'learning', updatedAt: '2026-05-01T00:00:00.000Z' })
  }
  writeLearn(aRecords, 'uid-A')

  // B 的分区尚未建立 → 读出来必须是空的（B 的云端也是 0 条）
  assert.deepEqual(readLearn('uid-B'), {}, 'B 不得看到 A 的任何记录')
  assert.equal(Object.keys(readLearn('uid-A')).length, 500)

  // 切到 B 时 toPush 只可能来自 B 的本地（空）→ 上行 0 条，A 的数据不会被写进 B
  const { toPush } = mergeAll(readLearn('uid-B'), {})
  assert.deepEqual(filterUploadableRows(toPush), [])

  // 切回 A 完好
  assert.equal(Object.keys(readLearn('uid-A')).length, 500)
})

// ---------------------------------------------------------------- 键的语义判定（P1）

test('isStorageKey：认得本应用的命名空间，其他一律不认', () => {
  assert.equal(isStorageKey(keysFor('uid-A').learn), true)
  assert.equal(isStorageKey(KEYS_FOR_TEST), true)
  assert.equal(isStorageKey('some.other.key'), false)
  assert.equal(isStorageKey(''), false)
  assert.equal(isStorageKey(null), false)
  assert.equal(isStorageKey(undefined), false)
})

test('STAR affectsLocalScope：分区 learn 键必须被认出来（P1 修复的真实回归点）', () => {
  // 这里曾出过一个静默失效的 bug：拿 keysFor('guest').learn（带 ':guest' 后缀）
  // 去比 storage 事件给的 '…:uid-A'，永远不相等 → 函数恒为 false →
  // 多标签页切换账号时根本不重载。症状只是「偶尔不刷新」，极难归因。
  assert.equal(affectsLocalScope(keysFor('uid-A').learn), true, 'uid-A 的 learn 键')
  assert.equal(affectsLocalScope(keysFor('uid-B').learn), true, 'uid-B 的 learn 键')
  assert.equal(affectsLocalScope(keysFor('guest').learn), true, 'guest 的 learn 键')
})

test('affectsLocalScope：账号相关的其余键要认，刻意不认的不能认', () => {
  // 认：这些变化意味着「别的标签动了本地学习态」
  ;[
    ['prefs', keysFor('uid-A').prefs],
    ['cloudMigration', keysFor('uid-A').cloudMigration],
    ['migration 标记', keysFor('guest').migration],
    ['设备级 settings', keysFor('guest').settings],
    ['冻结 v1 源', FROZEN_KEYS.statusV1],
    ['冻结 v1 备份', FROZEN_KEYS.statusV1Backup],
    ['旧的无后缀 learn 键（同一逻辑键）', LEGACY_KEYS.learn],
  ].forEach(([name, key]) => {
    assert.equal(affectsLocalScope(key), true, name + ' 应当被认')
  })
  // 不认：草稿只影响计数；整表重载会打断输入
  ;[
    ['草稿', keysFor('uid-A').drafts],
    ['游标', keysFor('uid-A').sync],
    ['丢弃日志', keysFor('guest').draftsDiscarded],
    ['partition 标记', keysFor('guest').partition],
    ['当前小站', keysFor('uid-A').stationCurrent],
    ['私有词缓存', keysFor('uid-A').userWordsCache],
  ].forEach(([name, key]) => {
    assert.equal(affectsLocalScope(key), false, name + ' 不应触发整表重载')
  })
  ;['', null, undefined, 'some.other.key'].forEach((k) => {
    assert.equal(affectsLocalScope(k), false, '垃圾输入 ' + String(k) + ' 应返回 false')
  })
})

console.log(`
通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)
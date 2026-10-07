/**
 * T01：小站本地缓存的读写器单测（Node 直跑，零浏览器依赖）
 * ------------------------------------------------------------------
 * 跑：npm run test:station-cache
 *
 * 为什么这组测试要单独存在：这两个键是 A-02/A-06 的全部依赖，而它们的失败模式
 * **全部是静默的**——LRU 没生效只是多占点配额，体积护栏没生效只是挤掉学习记录，
 * affectsLocalScope 漏了一个 family 只是「多标签页不重读」。没有任何一条会报错，
 * 所以必须在这里用确定性断言把它们钉住。
 *
 * ★ 本文件刻意断言「护栏真的拦住了东西」，而不只断言「没抛错」★
 *   断言「writeStationRefs 返回 true」是几乎无意义的：size 护栏和 LRU 都可能
 *   因为某个条件没满足而根本没被触发，测试照样绿。所以每条护栏都有一个
 *   「先证明它会被触发」的前置断言。
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** localStorage mock，带配额注入（用于验证「写不进去 → 静默 false」） */
function makeStorage({ failOn = null, error = null } = {}) {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (failOn && k.includes(failOn)) throw error || new Error('setItem 失败')
      map.set(k, String(v))
    },
    removeItem: (k) => map.delete(k),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}

globalThis.localStorage = makeStorage()

const MIGRATE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'lib',
  'migrate.js',
)
const SRC_ROOT = path.resolve(MIGRATE_PATH, '..', '..')

/**
 * 遍历 src 下的 .js / .jsx（跳过 migrate.js 与 dict.js 两个既有白名单）。
 * @param {(rel: string, full: string) => void} visit
 */
function walkSrc(visit) {
  const walk = (dir) => {
    readdirSync(dir).forEach((name) => {
      const full = path.join(dir, name)
      if (statSync(full).isDirectory()) {
        if (name === 'node_modules' || name === 'dist') return
        walk(full)
        return
      }
      if (!/\.(js|jsx)$/.test(name)) return
      const rel = path.relative(SRC_ROOT, full).split(path.sep).join('/')
      if (rel === 'lib/migrate.js' || rel === 'lib/dict.js') return
      visit(rel, full)
    })
  }
  walk(SRC_ROOT)
}
const {
  GUEST_SCOPE,
  affectsLocalScope,
  dropAllStationRefs,
  dropStationRefs,
  isStorageKey,
  keysFor,
  readStationRefs,
  readStationsCache,
  writeStationRefs,
  writeStationsCache,
} = await import('../src/lib/migrate.js')

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
  globalThis.localStorage = makeStorage()
}

const SCOPE_A = 'uid-A'
const SCOPE_B = 'uid-B'

/** 造一个形状合法的 Station 行（stationsApi.stationFromRow 的形状） */
function station(id, name) {
  return { id, ownerId: SCOPE_A, name, pinned: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
}

/** 造一个形状合法的 StationWordRef 行（stationWordFromRow 的形状） */
function ref(stationId, n) {
  return {
    id: `sw-${stationId}-${n}`,
    stationId,
    ownerId: SCOPE_A,
    wordKey: `w.word${n}`,
    source: 'public',
    note: null,
    addedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

console.log('[test:station-cache]')

// ---------------------------------------------------------------- ① 键的分区性

test('keysFor：两个新键都带 :<scope> 后缀', () => {
  const k = keysFor(SCOPE_A)
  assert.equal(k.stationsCache, 'wrc.stations.v1:uid-A')
  assert.equal(k.stationWordsCache, 'wrc.stationwords.v1:uid-A')
})

test('keysFor：三个 scope 下的两个新键两两互不相同（这是隔离的全部基础）', () => {
  const a = keysFor(SCOPE_A)
  const b = keysFor(SCOPE_B)
  const g = keysFor(GUEST_SCOPE)
  ;['stationsCache', 'stationWordsCache'].forEach((name) => {
    const set = new Set([a[name], b[name], g[name]])
    assert.equal(set.size, 3, `${name}: 三个 scope 必须给出三个不同的键`)
    ;[a[name], b[name], g[name]].forEach((k) => {
      assert.ok(isStorageKey(k), `${k} 必须是本命名空间的键`)
      assert.ok(k.endsWith(':uid-A') || k.endsWith(':uid-B') || k.endsWith(':guest'))
    })
  })
})

test('keysFor：非法 scope 回落 guest，绝不返回 undefined 键', () => {
  const k = keysFor(undefined)
  assert.equal(k.stationsCache, keysFor(GUEST_SCOPE).stationsCache)
  assert.equal(k.stationWordsCache, keysFor(GUEST_SCOPE).stationWordsCache)
})

// ---------------------------------------------------------------- ② affectsLocalScope

test('affectsLocalScope：两个新键都必须返回 true（漏一条 = 多标签页不重读）', () => {
  assert.equal(affectsLocalScope(keysFor(SCOPE_A).stationsCache), true, 'stationsCache 键')
  assert.equal(affectsLocalScope(keysFor(SCOPE_A).stationWordsCache), true, 'stationWordsCache 键')
  // 别的 scope 的同一个 family 也必须命中：判定是 family 级，不是完整键级
  assert.equal(affectsLocalScope(keysFor(SCOPE_B).stationsCache), true, 'uid-B 的 stationsCache 键')
  assert.equal(affectsLocalScope(keysFor(GUEST_SCOPE).stationWordsCache), true, 'guest 的 stationWordsCache 键')
})

test('affectsLocalScope：判定按 base() 截断，不是按完整键比较', () => {
  // 反例说明：若有人图省事写成 `key === keysFor(GUEST).stationsCache`，
  // uid-A 的键就永远不相等 —— 症状是「多标签页切号不重读」，极难归因。
  const guestKey = keysFor(GUEST_SCOPE).stationsCache
  assert.notEqual(keysFor(SCOPE_A).stationsCache, guestKey, '前置：两个完整键确实不同')
  assert.equal(affectsLocalScope(keysFor(SCOPE_A).stationsCache), true, '但 family 判定必须命中')
})

test('affectsLocalScope：非本命名空间与无关键仍返回 false', () => {
  assert.equal(affectsLocalScope('some.other.key:uid-A'), false)
  assert.equal(affectsLocalScope(keysFor(SCOPE_A).userWordsCache), false, 'userWordsCache 本就不在判定里（既有行为不变）')
  assert.equal(affectsLocalScope(keysFor(SCOPE_A).drafts), false, '草稿键仍被有意排除')
})

// ---------------------------------------------------------------- ③ stationsCache 读写

test('stationsCache：写入后能原样读回（零转换，存的就是 API 形状）', () => {
  reset()
  const list = [station('s1', '雅思'), station('s2', '论文阅读')]
  assert.equal(writeStationsCache(list, SCOPE_A), true)
  const out = readStationsCache(SCOPE_A)
  assert.deepEqual(out.stations, list, '★ 必须逐字段一致：缓存里存的就是 API 行对象')
  assert.ok(typeof out.savedAt === 'string', '要带 savedAt，否则 LRU / 「多旧」无从判断')
})

test('stationsCache：分区隔离 —— B 读不到 A 写入的内容', () => {
  reset()
  writeStationsCache([station('s1', '雅思')], SCOPE_A)
  assert.deepEqual(readStationsCache(SCOPE_B).stations, [], 'B 的首帧必须是空的，不能看到 A 的小站')
  assert.equal(readStationsCache(GUEST_SCOPE).stations.length, 0)
})

test('stationsCache：无缓存 / 无存储时回落空且不抛错', () => {
  reset()
  const out = readStationsCache(SCOPE_A)
  assert.deepEqual(out.stations, [])
  assert.equal(out.savedAt, null)

  globalThis.localStorage = undefined // 模拟 SSR / 隐私模式
  assert.deepEqual(readStationsCache(SCOPE_A).stations, [])
  assert.equal(writeStationsCache([station('s1', 'x')], SCOPE_A), false, '无存储时必须安静地返回 false')
  reset()
})

test('stationsCache：读损坏 JSON → 回落空且不抛', () => {
  reset()
  localStorage.setItem(keysFor(SCOPE_A).stationsCache, '{坏 JSON')
  assert.deepEqual(readStationsCache(SCOPE_A).stations, [])
  localStorage.setItem(keysFor(SCOPE_A).stationsCache, '"一个字符串"')
  assert.deepEqual(readStationsCache(SCOPE_A).stations, [], '非对象结构必须被拒')
  localStorage.setItem(keysFor(SCOPE_A).stationsCache, JSON.stringify({ stations: '不是数组' }))
  assert.deepEqual(readStationsCache(SCOPE_A).stations, [])
})

test('stationsCache：剔掉结构异常的条目（没有字符串 id 的行）', () => {
  reset()
  localStorage.setItem(
    keysFor(SCOPE_A).stationsCache,
    JSON.stringify({ v: 1, savedAt: 'x', stations: [station('s1', 'ok'), { name: '无 id' }, null, 42] }),
  )
  const out = readStationsCache(SCOPE_A)
  assert.equal(out.stations.length, 1)
  assert.equal(out.stations[0].id, 's1')
})

test('stationsCache：setItem 抛错 → 返回 false，不抛到调用方', () => {
  globalThis.localStorage = makeStorage({ failOn: 'stations.v1' })
  const threw = (() => {
    try {
      return writeStationsCache([station('s1', '雅思')], SCOPE_A)
    } catch {
      return 'THREW'
    }
  })()
  assert.equal(threw, false, '★ 缓存写失败绝不能抛：它不是数据源，抛了就会打断主流程')
  reset()
})

test('stationsCache：超过 256KB 护栏 → 拒写（返回 false）且旧值未被清空', () => {
  reset()
  const small = [station('s1', '雅思')]
  assert.equal(writeStationsCache(small, SCOPE_A), true)
  const before = localStorage.getItem(keysFor(SCOPE_A).stationsCache)
  assert.ok(before, '前置：旧值存在')

  // 造一个必然超 256KB 的载荷
  const huge = []
  for (let i = 0; i < 4000; i += 1) huge.push(station(`s${i}`, 'x'.repeat(120)))
  const ok = writeStationsCache(huge, SCOPE_A)
  assert.equal(ok, false, '★ 护栏必须拒写而不是截断 —— 截断会让缓存内容与云端不一致')
  assert.equal(localStorage.getItem(keysFor(SCOPE_A).stationsCache), before, '★ 拒写时旧值必须完好')
  assert.deepEqual(readStationsCache(SCOPE_A).stations, small, '读出来仍应是拒写前的内容')
})

test('stationsCache：护栏不是「恒不触发」—— 明确证明 256KB 附近确实会被拦', () => {
  reset()
  // 一行 Station 序列化后约 210B（含 80 字符 name）。700 行 ≈ 150KB，在护栏内；
  // 2000 行 ≈ 420KB，必被拦。两档都跑，才能证明护栏既没误伤也真的在工作。
  const withinBudget = []
  for (let i = 0; i < 700; i += 1) withinBudget.push(station(`s${i}`, 'y'.repeat(80)))
  const withinBytes = JSON.stringify({ v: 1, savedAt: 'x', stations: withinBudget }).length
  assert.ok(withinBytes > 100 * 1024, `前置：这一档应当明显大于 100KB，实际 ${withinBytes}B`)
  assert.ok(withinBytes < 256 * 1024, `前置：这一档必须在护栏内，实际 ${withinBytes}B`)
  assert.equal(writeStationsCache(withinBudget, SCOPE_A), true, '接近上限的正常载荷必须能写')

  const overBudget = []
  for (let i = 0; i < 2000; i += 1) overBudget.push(station(`t${i}`, 'z'.repeat(80)))
  assert.equal(writeStationsCache(overBudget, SCOPE_A), false, '超限必须被拦 —— 说明护栏真的在工作')
  assert.equal(readStationsCache(SCOPE_A).stations.length, 700, '拒写后仍是上一档的内容')
})

// ---------------------------------------------------------------- ④ stationWordsCache 读写

test('stationRefs：写入后能原样读回；按 stationId 分条目', () => {
  reset()
  const r1 = [ref('s1', 1), ref('s1', 2)]
  const r2 = [ref('s2', 9)]
  assert.equal(writeStationRefs('s1', r1, SCOPE_A), true)
  assert.equal(writeStationRefs('s2', r2, SCOPE_A), true)
  assert.deepEqual(readStationRefs('s1', SCOPE_A).refs, r1)
  assert.deepEqual(readStationRefs('s2', SCOPE_A).refs, r2, 'map 语义：两个小站各留一份')
})

test('stationRefs：无条目 / 未知 stationId → 空数组且不抛', () => {
  reset()
  writeStationRefs('s1', [ref('s1', 1)], SCOPE_A)
  assert.deepEqual(readStationRefs('sX', SCOPE_A).refs, [])
  assert.deepEqual(readStationRefs(null, SCOPE_A).refs, [])
  assert.deepEqual(readStationRefs('s1', SCOPE_B).refs, [], '分区隔离：别的 scope 读不到')
})

test('stationRefs：读损坏 JSON / 结构异常 → 回落空', () => {
  reset()
  localStorage.setItem(keysFor(SCOPE_A).stationWordsCache, '{坏 JSON')
  assert.deepEqual(readStationRefs('s1', SCOPE_A).refs, [])
  localStorage.setItem(
    keysFor(SCOPE_A).stationWordsCache,
    JSON.stringify({
      v: 1,
      byStation: { s1: '不是对象', s2: { refs: '不是数组' }, s3: { refs: [{ 没有键: 'wordKey' }] } },
    }),
  )
  assert.deepEqual(readStationRefs('s1', SCOPE_A).refs, [])
  assert.deepEqual(readStationRefs('s2', SCOPE_A).refs, [])
  assert.deepEqual(readStationRefs('s3', SCOPE_A).refs, [], '没有 wordKey 的行必须被剔掉，不能留空白行')
})

test('stationRefs：setItem 抛错 → 返回 false', () => {
  globalThis.localStorage = makeStorage({ failOn: 'stationwords.v1' })
  assert.equal(writeStationRefs('s1', [ref('s1', 1)], SCOPE_A), false)
  reset()
})

// ---------------------------------------------------------------- ⑤ LRU 护栏

test('★ LRU：写 12 个小站 → 只留最近 10 个，最旧的 2 个被丢', () => {
  reset()
  // 刻意**不在**测试里手工改 savedAt —— 那会掩盖「同毫秒连写」的次序问题。
  // 真实场景就是连着写多次，LRU 必须自己判对。
  for (let i = 1; i <= 12; i += 1) {
    const ok = writeStationRefs(`s${i}`, [ref(`s${i}`, i)], SCOPE_A)
    assert.equal(ok, true, `第 ${i} 次写入本应成功（体积远小于护栏）`)
  }
  const kept = []
  const dropped = []
  for (let i = 1; i <= 12; i += 1) {
    ;(readStationRefs(`s${i}`, SCOPE_A).refs.length ? kept : dropped).push(i)
  }
  assert.equal(kept.length, 10, `只应保留 10 个条目，实际 ${kept.length}：${kept}`)
  assert.deepEqual(dropped, [1, 2], '最旧的两个（s1 / s2）必须被丢 —— 只增不减的 map 是配额慢漏')
})

test('LRU：护栏确实在工作 —— 未超上限时一条都不丢', () => {
  reset()
  for (let i = 1; i <= 10; i += 1) writeStationRefs(`s${i}`, [ref(`s${i}`, i)], SCOPE_A)
  for (let i = 1; i <= 10; i += 1) {
    assert.equal(readStationRefs(`s${i}`, SCOPE_A).refs.length, 1, `s${i} 在上限内不该被丢`)
  }
})

test('★ LRU：同一毫秒内连写时，刚访问过的站不会被当成最旧的丢掉', () => {
  // 这条是**缺陷注入实测逼出来的**：早先只按 savedAt 排序，而 savedAt 只有毫秒精度，
  // 于是同刻写入退化成按 stationId 字典序 —— s1 字典序最小，每次都被当成最旧的丢掉，
  // 症状是「刚在小站 A 加完词，刷新后离线就读不到了」（而且完全静默）。
  reset()
  for (let i = 1; i <= 12; i += 1) writeStationRefs(`s${i}`, [ref(`s${i}`, i)], SCOPE_A)
  writeStationRefs('s1', [ref('s1', 999)], SCOPE_A) // 重新访问最早的那个站
  assert.equal(readStationRefs('s1', SCOPE_A).refs[0].wordKey, 'w.word999', '★ 刚访问的站必须还在')
  const raw = JSON.parse(localStorage.getItem(keysFor(SCOPE_A).stationWordsCache))
  assert.equal(Object.keys(raw.byStation).length, 10, '重写不新增条目，仍然是 10 个')
})

// ---------------------------------------------------------------- ⑥ 体积护栏（词条侧）

test('★ stationRefs：超过 256KB → 拒写且其余站条目完好', () => {
  reset()
  writeStationRefs('keep', [ref('keep', 1)], SCOPE_A)
  const before = localStorage.getItem(keysFor(SCOPE_A).stationWordsCache)

  const fat = []
  for (let i = 0; i < 4000; i += 1) fat.push(ref('fat', i))
  assert.equal(writeStationRefs('fat', fat, SCOPE_A), false, '超限必须拒写')
  assert.equal(localStorage.getItem(keysFor(SCOPE_A).stationWordsCache), before, '★ 旧值必须完好（整键读改写，拒写时不动）')
  assert.equal(readStationRefs('keep', SCOPE_A).refs.length, 1, '已缓存的小站不能因为另一个站超限而丢')
  assert.deepEqual(readStationRefs('fat', SCOPE_A).refs, [], '被拒的站不应留下半份数据')
})

test('stationRefs：接近上限的正常载荷能写进去（护栏没误伤）', () => {
  reset()
  const normal = []
  // 一行约 150B → 1200 行约 180KB，应在护栏内
  for (let i = 0; i < 1200; i += 1) normal.push(ref('big', i))
  assert.equal(writeStationRefs('big', normal, SCOPE_A), true, '正常体积的大站必须可缓存 —— 大站离线不可读的代价更高')
})

// ---------------------------------------------------------------- ⑦ 失效：删站清条目

test('dropStationRefs：删一个站的条目，其余站条目完好（Q8 的配额回收点）', () => {
  reset()
  writeStationRefs('s1', [ref('s1', 1), ref('s1', 2)], SCOPE_A)
  writeStationRefs('s2', [ref('s2', 3)], SCOPE_A)
  writeStationRefs('s3', [ref('s3', 4)], SCOPE_A)

  dropStationRefs('s2', SCOPE_A)

  assert.deepEqual(readStationRefs('s2', SCOPE_A).refs, [], '被删站的条目必须消失')
  assert.equal(readStationRefs('s1', SCOPE_A).refs.length, 2, '★ 其余站条目必须完好')
  assert.equal(readStationRefs('s3', SCOPE_A).refs.length, 1)
})

test('dropStationRefs：删不存在的站 / 无缓存时不抛、键不被凭空创建', () => {
  reset()
  dropStationRefs('ghost', SCOPE_A) // 无缓存
  assert.equal(localStorage.getItem(keysFor(SCOPE_A).stationWordsCache), null, '不该凭空写出一个空键')
  writeStationRefs('s1', [ref('s1', 1)], SCOPE_A)
  dropStationRefs('ghost', SCOPE_A)
  assert.equal(readStationRefs('s1', SCOPE_A).refs.length, 1, '删不存在的站不得影响别的条目')
})

test('dropStationRefs：分区隔离 —— 删 A 的条目不影响 B', () => {
  reset()
  writeStationRefs('s1', [ref('s1', 1)], SCOPE_A)
  writeStationRefs('s1', [ref('s1', 2)], SCOPE_B)
  dropStationRefs('s1', SCOPE_A)
  assert.deepEqual(readStationRefs('s1', SCOPE_A).refs, [])
  assert.equal(readStationRefs('s1', SCOPE_B).refs.length, 1, '★ B 的同名小站条目必须还在')
})

test('dropAllStationRefs：只清词条缓存，不碰 learn 分区与草稿队列', () => {
  reset()
  writeStationRefs('s1', [ref('s1', 1)], SCOPE_A)
  writeStationsCache([station('s1', '雅思')], SCOPE_A)
  localStorage.setItem(keysFor(SCOPE_A).learn, JSON.stringify({ version: 2, records: { 'w.a': {} } }))
  localStorage.setItem(keysFor(SCOPE_A).drafts, JSON.stringify({ generate: [{ x: 1 }], stationWords: [], learn: [], stations: [] }))

  dropAllStationRefs(SCOPE_A)

  assert.equal(localStorage.getItem(keysFor(SCOPE_A).stationWordsCache), null, '词条缓存键被整个移除')
  assert.deepEqual(readStationsCache(SCOPE_A).stations.length, 1, '小站列表缓存不动')
  assert.ok(localStorage.getItem(keysFor(SCOPE_A).learn), '★ learn 分区绝不能被「清缓存」碰到')
  assert.equal(JSON.parse(localStorage.getItem(keysFor(SCOPE_A).drafts)).generate.length, 1, '★ 草稿队列绝不触碰')
})

// ---------------------------------------------------------------- ⑧ 门禁纪律自查

test('★ 红线：两个新键的字面量只允许出现在 migrate.js 里', () => {
  // 业务文件若自己拼 `wrc.stations.v1:${uid}`，改键名 / 加分区键时必然漏改一处。
  // 这里不重复门禁脚本的全量扫描，只断言「除 migrate.js 外没有第二处出现」。
  const migrateText = readFileSync(MIGRATE_PATH, 'utf8')
  assert.ok(migrateText.includes('${STORAGE_PREFIX}stations.v1'), 'migrate.js 内当然有')
  const offenders = []
  walkSrc((rel, full) => {
    const text = readFileSync(full, 'utf8')
    if (text.includes('stations.v1:') || text.includes('stationwords.v1:')) offenders.push(rel)
  })
  assert.deepEqual(offenders, [], '这些文件里出现了缓存键字面量：')
})

test('★ 红线：migrate.js 是唯一新增键的落点，且未引入新的 wrc 命名空间', () => {
  const text = readFileSync(MIGRATE_PATH, 'utf8')
  // 分区键家族：既有 5 个 + 本轮 2 个（learn / prefs / migration / sync / cloudMigration 之外，
  // drafts、stationCurrent、userWordsCache 也在同一模板里，这里只断言本轮两个确实在 keysFor 内）
  assert.ok(/stationsCache:\s*`\$\{STORAGE_PREFIX\}stations\.v1\$\{suffix\}`/.test(text), 'stationsCache 必须在 keysFor 内声明')
  assert.ok(/stationWordsCache:\s*`\$\{STORAGE_PREFIX\}stationwords\.v1\$\{suffix\}`/.test(text), 'stationWordsCache 必须在 keysFor 内声明')
  // 命名空间前缀仍然只有一个（没有为缓存另起一个 wrc2. 之类的前缀）
  const prefixes = new Set()
  const re = /STORAGE_PREFIX\s*=\s*'([^']+)'/g
  let m = re.exec(text)
  while (m) {
    prefixes.add(m[1])
    m = re.exec(text)
  }
  assert.equal(prefixes.size, 1, `命名空间前缀必须唯一，实际 ${[...prefixes].join(', ')}`)
})

test('★ 红线：业务侧不得从 migrate.js 直接 import 存储键名常量', () => {
  // 缓存布局（键名、payload 形状）必须只经 6 个具名读写器暴露；直接拿 keysFor().xxx
  // 去读缓存键，等于把「缓存键怎么拼」的知识漏回业务文件，与拼字面量同级。
  const banned = ['STORAGE_PREFIX', 'LEGACY_KEYS', 'FROZEN_KEYS', 'KEYS']
  const cacheKeys = ['stationsCache', 'stationWordsCache']
  const offenders = []
  walkSrc((rel, full) => {
    const text = readFileSync(full, 'utf8')
    const importMatch = /import\s*\{([^}]*)\}\s*from\s*['"][^'"]*migrate\.js['"]/.exec(text)
    if (!importMatch) return
    ;[...banned, ...cacheKeys].forEach((sym) => {
      if (new RegExp(`\\b${sym}\\b`).test(importMatch[1])) offenders.push(`${rel} 导入了 ${sym}`)
    })
  })
  assert.deepEqual(offenders, [], '业务侧直接 import 键名常量会让分区键知识漏回业务文件：')
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

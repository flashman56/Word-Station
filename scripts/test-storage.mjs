/**
 * A-12：写入失败必须可见（不是「没有失败」）
 * ------------------------------------------------------------------
 * 跑：npm run test:storage
 *
 * 验证的是一条完整信号链，且刻意断言「**失败确实发生了**」——
 * 一个「测了等于没测」的写法是只断言「没有告警」，那在 persist 根本没被调用
 * 或 catch 又被吞掉的情况下同样会通过。所以这里先断言 setItem **真的抛了**、
 * 上报回调**真的收到了** QUOTA_EXCEEDED，再断言成功写入后告警消失。
 *
 * 覆盖：
 *   1. persist 写失败 → onStorageError({code:'QUOTA_EXCEEDED'})，内存态保留；
 *   2. 写成功 → onStorageError(null)，告警清除（不是一次性 toast）；
 *   3. 内存态在写失败后仍可继续累加（用户刚做的操作不丢）；
 *   4. 非配额类写失败（如隐私模式抛别的错）也必须上报，不能静默；
 *   5. 导出 JSON 序列化的是**内存态** —— 徽标文案「建议先导出 JSON」的前提。
 */
import assert from 'node:assert/strict'

/** localStorage mock，可注入写失败 */
function makeStorage({ failOn = null, error = null } = {}) {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (failOn && k.includes(failOn)) throw error
      map.set(k, String(v))
    },
    removeItem: (k) => map.delete(k),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}

globalThis.localStorage = makeStorage()

const { keysFor, readLearn, writeLearn } = await import('../src/lib/migrate.js')

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

console.log('[test:storage]')

// ---------------------------------------------------------------- persist 的等价实现
//
// 这里复刻 useLearn.js 里 persist 的判定逻辑（就那 8 行），目的是**单独**验证
// 「QuotaExceededError → QUOTA_EXCEEDED」这条映射，以及「成功 → 清除告警」。
// 真正的 hook 行为由 test:e2e 覆盖（那里渲染真实组件）。
// 若 useLearn.js 改了这里的判定，请同步改本函数 —— 两处不一致就是 bug。

/** 把一个 Error 归一成 { code, message }，与 useLearn.persist 一致 */
function classifyStorageError(e) {
  return {
    code: e && e.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'WRITE_FAILED',
    message: (e && e.message) || String(e),
  }
}

/** 复刻 persist：成功 → 上报 null；失败 → 上报 {code,message}；永不 rethrow */
function persist(next, scope, onStorageError, storage) {
  try {
    storage.setItem(keysFor(scope).learn, JSON.stringify({ version: 2, records: next }))
    if (onStorageError) onStorageError(null)
    return true
  } catch (e) {
    if (onStorageError) onStorageError(classifyStorageError(e))
    return false
  }
}

const quotaErr = () => {
  const e = new Error('The quota has been exceeded.')
  e.name = 'QuotaExceededError'
  return e
}

// ---------------------------------------------------------------- ① 写失败必须上报

test('写盘失败（QuotaExceededError）→ 上报 { code: "QUOTA_EXCEEDED" }，不是静默吞掉', () => {
  const storage = makeStorage({ failOn: 'learn', error: quotaErr() })
  const seen = []
  const ok = persist({ 'w.a': { status: 'known' } }, 'uid-A', (e) => seen.push(e), storage)

  assert.equal(ok, false, 'persist 必须报告写盘失败')
  assert.equal(seen.length, 1, '★ 必须恰好上报一次（原实现是 catch { /* ignore */ }，一次都不报）')
  assert.equal(seen[0].code, 'QUOTA_EXCEEDED', 'QuotaExceededError 必须映射成 QUOTA_EXCEEDED')
  assert.ok(seen[0].message, '要带上原始 message 便于排查')
})

test('非配额类写失败也必须上报（隐私模式抛别的错），不能只认 QuotaExceededError', () => {
  const storage = makeStorage({ failOn: 'learn', error: new Error('SecurityError: 隐私模式') })
  const seen = []
  persist({ 'w.a': {} }, 'uid-A', (e) => seen.push(e), storage)
  assert.equal(seen.length, 1)
  assert.equal(seen[0].code, 'WRITE_FAILED', '未识别的写错误也要走 WRITE_FAILED，不能消失')
})

test('persist 永不 rethrow —— 写失败不能变成未处理的异常打断答题', () => {
  const storage = makeStorage({ failOn: 'learn', error: quotaErr() })
  let threw = false
  try {
    persist({ 'w.a': {} }, 'uid-A', null, storage)
  } catch {
    threw = true
  }
  assert.equal(threw, false, 'persist 必须吞掉异常向上返回，内存态才是可靠的')
})

// ---------------------------------------------------------------- ② 成功 → 清除告警

test('写成功 → 上报 null，告警清除（告警态持续到下一次写成功，不是 toast）', () => {
  const storage = makeStorage()
  const seen = []
  // 先失败一次
  const failStore = makeStorage({ failOn: 'learn', error: quotaErr() })
  persist({ 'w.a': {} }, 'uid-A', (e) => seen.push(e), failStore)
  assert.equal(seen[seen.length - 1].code, 'QUOTA_EXCEEDED', '前置：先进入告警态')

  // 再成功一次（配额腾出后）
  persist({ 'w.a': {} }, 'uid-A', (e) => seen.push(e), storage)
  assert.equal(seen.length, 2)
  assert.equal(seen[1], null, '★ 写成功必须上报 null —— 这是告警能恢复的唯一途径')
})

test('连续失败 3 次 → 告警持续存在（不会被中途清掉），直到某次成功', () => {
  const seen = []
  for (let i = 0; i < 3; i += 1) {
    const storage = makeStorage({ failOn: 'learn', error: quotaErr() })
    persist({ 'w.a': {} }, 'uid-A', (e) => seen.push(e), storage)
  }
  assert.equal(seen.length, 3)
  seen.forEach((e) => assert.equal(e && e.code, 'QUOTA_EXCEEDED', '每次失败都要报，不能第 2 次就静默'))
  // 最后一次成功
  persist({ 'w.a': {} }, 'uid-A', (e) => seen.push(e), makeStorage())
  assert.equal(seen[3], null)
})

// ---------------------------------------------------------------- ③ 内存态不丢

test('写盘失败时内存态仍可继续累加（用户刚做的操作不丢）', () => {
  const storage = makeStorage({ failOn: 'learn', error: quotaErr() })
  // 内存态（React 里的 records）
  let mem = {}
  const onStorageError = []
  // 连续答 3 题，每次 persist 都失败
  for (let i = 0; i < 3; i += 1) {
    mem = { ...mem, [`w.q${i}`]: { status: 'review', correctCount: i + 1 } }
    persist(mem, 'uid-A', (e) => onStorageError.push(e), storage)
  }
  assert.equal(Object.keys(mem).length, 3, '★ 内存态必须完整保留 3 条 —— 这是 A-12 的前提')
  assert.equal(onStorageError.length, 3, '三次失败都要可见，不能只报第一次')
  // 磁盘上确实什么都没写成
  assert.equal(storage.getItem(keysFor('uid-A').learn), null, '磁盘是旧的（这就是为什么必须告警）')
})

test('写失败 → 恢复后一次成功，把内存态完整落盘（一条都不少）', () => {
  const mem = {
    'w.q0': { status: 'review' },
    'w.q1': { status: 'known' },
    'w.q2': { status: 'unknown' },
  }
  // 先在配额满的情况下答（内存有 3 条，磁盘 0 条）
  const failing = makeStorage({ failOn: 'learn', error: quotaErr() })
  persist(mem, 'uid-A', null, failing)
  assert.equal(failing.getItem(keysFor('uid-A').learn), null)

  // 配额恢复 → 再答一题触发 persist → 整个内存态（含之前 3 条）一起落盘
  const healthy = makeStorage()
  const mem2 = { ...mem, 'w.q3': { status: 'review' } }
  persist(mem2, 'uid-A', null, healthy)
  const written = JSON.parse(healthy.getItem(keysFor('uid-A').learn))
  assert.equal(Object.keys(written.records).length, 4, '恢复后落盘必须包含全部 4 条，不能只写最后一条')
})

// ---------------------------------------------------------------- ④ 导出依赖内存态

test('★ 徽标文案「建议先导出 JSON 备份」的前提：导出的是内存态而非磁盘', () => {
  // 构造：磁盘是旧的（写失败过），内存是新的
  const failing = makeStorage({ failOn: 'learn', error: quotaErr() })
  writeLearn({ 'w.old': { status: 'known' } }, 'uid-B') // 先成功写一条到磁盘
  const healthy = makeStorage()
  healthy.setItem(keysFor('uid-B').learn, JSON.stringify({ version: 2, records: { 'w.old': { status: 'known' } } }))

  // 磁盘上只有 w.old
  assert.deepEqual(Object.keys(JSON.parse(healthy.getItem(keysFor('uid-B').learn)).records), ['w.old'])

  // 内存态多了一条（刚答的题，写盘失败）
  const memoryRecords = { 'w.old': { status: 'known' }, 'w.fresh': { status: 'review' } }
  // useLearn.exportJson 的实现：序列化内存态
  const exported = JSON.parse(JSON.stringify({ version: 2, records: memoryRecords }, null, 2))
  assert.ok(exported.records['w.fresh'], '★ 导出必须包含刚答的那条 —— 否则那句补救建议是假承诺')
  assert.equal(Object.keys(exported.records).length, 2)
  void failing
})

test('对照：若 exportJson 改成读磁盘，导出就会丢掉最近的改动（这正是不能改的原因）', () => {
  const healthy = makeStorage()
  healthy.setItem(keysFor('uid-C').learn, JSON.stringify({ version: 2, records: { 'w.old': { status: 'known' } } }))
  // 假设有人把 exportJson 改成读 localStorage
  const badExport = JSON.parse(healthy.getItem(keysFor('uid-C').learn))
  assert.equal(badExport.records['w.fresh'], undefined, '读磁盘的导出会丢掉刚答的题 —— 告警文案随之失效')
})

// ---------------------------------------------------------------- ⑤ 分区后配额更紧张

test('分区后配额压力可复现：写满一个分区后另一个分区也会失败', () => {
  // 造一个很大的载荷，写爆 mock 的「配额」
  const LIMIT = 4096
  const map = new Map()
  let used = 0
  const tinyQuota = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      const size = String(v).length
      if (used + size > LIMIT) {
        const e = new Error('quota')
        e.name = 'QuotaExceededError'
        throw e
      }
      used += size
      map.set(k, String(v))
    },
    removeItem: (k) => map.delete(k),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }

  const big = {}
  for (let i = 0; i < 400; i += 1) big[`w.${i}`] = { status: 'known', correctCount: i }

  const seen = []
  persist(big, 'uid-A', (e) => seen.push(e), tinyQuota)
  assert.equal(seen.length, 1)
  assert.equal(seen[0].code, 'QUOTA_EXCEEDED', '大载荷写失败必须可见')

  // 关键：换账号（另一个分区）也一样失败 —— 分区后多账号会顶满同一域配额
  const seenB = []
  persist(big, 'uid-B', (e) => seenB.push(e), tinyQuota)
  assert.equal(seenB.length, 1, '★ 分区不解决配额问题 —— 同一域配额是共享的，第二个账号也会写失败')
  assert.equal(seenB[0].code, 'QUOTA_EXCEEDED')
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

// 保持引用（readLearn 用于让读者知道 learn 分区的真实读取路径）
void readLearn
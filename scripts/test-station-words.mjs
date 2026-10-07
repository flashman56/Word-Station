/**
 * T03：小站词条缓存 + 离线草稿投影（A-05 词条侧 / A-06）
 * ------------------------------------------------------------------
 * 跑：npm run test:station-words
 *
 * ★ 为什么要单独测这条 ★
 *   A-05 与 A-06 的失败形态**全部是静默的**：
 *     - 断网 + F5 词条列表空 → 用户以为词被删了（没有报错）
 *     - 离线提交的词看不见 → 用户以为没加上（也没有报错）
 *     - 私有词离线反查不到 → 渲染成空白行（更糟：看起来像坏了）
 *   所以必须在这里把它们钉住。
 *
 * ★ 分区隔离是不可绕过的红线 ★
 *   草稿按账号分区。自行解析 drafts 键去读会绕过分区隔离 —— A 的草稿会出现在
 *   B 的界面上。本文件显式断言「readDrafts 只被 useStationWords 调用，
 *   业务代码里不出现草稿键字面量」。
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** localStorage mock（带配额注入） */
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STATION_WORDS_HOOK = path.join(ROOT, 'src', 'hooks', 'useStationWords.js')

const { keysFor, readStationRefs, scopeOf, writeStationRefs } = await import('../src/lib/migrate.js')
const offlineApi = await import('../src/lib/cloud/offline.js')
const { parseWordKey } = await import('../src/lib/wordKey.js')

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
const ST1 = 'station-1'
const ST2 = 'station-2'

/** 造一个形状合法的引用行 */
function ref(stationId, wordKey, source = 'public') {
  return {
    id: `sw-${stationId}-${wordKey}`,
    stationId,
    ownerId: SCOPE_A,
    wordKey,
    source,
    note: null,
    addedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

console.log('[test:station-words]')

// ================================================================ 第一部分：
// 把 useStationWords 里的两个纯函数抽出来单测（readPendingKeys / buildPendingRows）
//
// 为什么不整份 import 那个 hook：它 import 了 React 与 dict.js（IndexedDB），
// Node 直跑会炸。而这两个函数是**纯的**（入参 → 出参，无 IO），
// 抽出来测是安全的 —— 且我会额外断言「它们的签名与实现没有漂移」。

const hookSrc = readFileSync(STATION_WORDS_HOOK, 'utf8')

/**
 * 从 hook 源码里取出某个顶层函数的**真实实现**（不是复刻）。
 *
 * ★ 为什么用 new Function 而不是复刻一份逻辑 ★
 *   复刻只会测到复刻品 —— 源码改了、复刻没改，测试照样全绿。
 *   这里把源码里的函数体原样取出来 eval，所以测的就是真正在跑的那份代码。
 *
 * ★ 为什么按「花括号配平」截取而不是找下一个 "\n}\n" ★
 *   早先的写法在缺陷注入时炸了：注入把某一行改短/改长后，`indexOf('\n}\n')`
 *   截到了错误的位置，于是「函数体未闭合」—— 测试根本没跑到被测代码，
 *   却也没报告失败。这个坑很阴险：**它看起来像是「注入后测试没反应」**，
 *   容易被误读成「这条缺陷测不出来」。按括号配平截取与代码长度无关。
 *
 * @param {string} src 整个文件源码
 * @param {string} name 函数名
 * @returns {string} 从 `function name(` 到其闭合 `}` 的完整源码
 */
function extractFunction(src, name) {
  const start = src.indexOf(`function ${name}(`)
  assert.ok(start !== -1, `hook 里找不到 ${name}`)
  // 从第一个 '{' 开始做括号配平（跳过字符串/注释里的括号太复杂；
  // 这两个函数体内没有含花括号的字符串字面量，必要时再加排除）
  const open = src.indexOf('{', start)
  assert.ok(open !== -1, `${name} 找不到 '{'`)
  let depth = 0
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  assert.fail(`${name} 的花括号未闭合`)
  return ''
}

/** 从 hook 源码里取出 readPendingKeys 的实现（eval 后得到真函数，非复刻） */
function loadReadPendingKeys() {
  const body = extractFunction(hookSrc, 'readPendingKeys')
  // eslint-disable-next-line no-new-func
  return new Function('offlineApi', `${body}; return readPendingKeys;`)(offlineApi)
}

/** 同上，取 buildPendingRows（parseWordKey 从真模块取，不复刻） */
function loadBuildPendingRows() {
  const body = extractFunction(hookSrc, 'buildPendingRows')
  // eslint-disable-next-line no-new-func
  return new Function('parseWordKey', `${body}; return buildPendingRows;`)(parseWordKey)
}

const readPendingKeys = loadReadPendingKeys()
const buildPendingRows = loadBuildPendingRows()

// ---------------------------------------------------------------- ① 草稿投影的取数

test('★ 只投影本小站的草稿词（其他小站的词不该出现在这里）', () => {
  reset()
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, SCOPE_A)
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST2, items: [{ wordKey: 'w.b', source: 'public' }] }, SCOPE_A)

  const p1 = readPendingKeys(ST1, SCOPE_A)
  const p2 = readPendingKeys(ST2, SCOPE_A)
  assert.deepEqual(p1.map((x) => x.wordKey), ['w.a'], 'ST1 只应看到自己的草稿')
  assert.deepEqual(p2.map((x) => x.wordKey), ['w.b'], 'ST2 只应看到自己的草稿')
})

test('★ 分区隔离：A 的草稿不会出现在 B 的投影里', () => {
  reset()
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, SCOPE_A)
  assert.deepEqual(readPendingKeys(ST1, SCOPE_B), [], '★ B 的投影必须为空（A 的草稿绝不能出现在 B 的界面）')
  assert.equal(readPendingKeys(ST1, SCOPE_A).length, 1, 'A 自己能看到')
})

test('游客 scope（guest）恒不投影 —— 草稿必须带账号', () => {
  reset()
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, SCOPE_A)
  assert.deepEqual(readPendingKeys(ST1, 'guest'), [], '★ 游客态没有 ownerId，不该有任何投影')
  assert.deepEqual(readPendingKeys(null, SCOPE_A), [], 'stationId 为 null 时无投影')
})

test('★ scope 为空 / undefined 时也不投影（草稿必须带真实账号）', () => {
  // 这条是缺陷注入逼出来的：把 `|| scope === 'guest'` 这个 guard 去掉后，
  // 上面的游客用例**依然全绿** —— 因为 readDrafts('guest') 恰好本来就是空的。
  // 也就是说那条断言在无意中测的是「guest 分区没有草稿」，而不是
  // 「代码拒绝为 guest 投影」—— 两件事完全不同。
  //
  // 真正能区分的是：**guest 分区里确实有草稿时**（模拟历史数据 / 脏数据 /
  // 将来某个版本把草稿写进了 guest），代码必须仍然拒绝投影 ——
  // 因为游客态没有 ownerId，投出来的行无法被 claim 认领，是删不掉的孤儿。
  reset()
  // 往 guest 分区塞一条草稿
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, 'guest')
  const guestDrafts = offlineApi.readDrafts('guest')
  assert.equal(guestDrafts.stationWords.length, 1, '前置：guest 分区里确实有草稿')

  assert.deepEqual(readPendingKeys(ST1, 'guest'), [], '★ 即便 guest 分区有草稿也绝不投影（认领不了 = 删不掉的孤儿）')

  // 再验空 scope
  reset()
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, 'guest')
  assert.deepEqual(readPendingKeys(ST1, ''), [], '★ 空 scope 不投影')
  assert.deepEqual(readPendingKeys(ST1, null), [], '★ null scope 不投影')
  assert.deepEqual(readPendingKeys(ST1, undefined), [], '★ undefined scope 不投影')
})

test('parked 草稿不投影（否则用户看到永远传不上去的「待上传」）', () => {
  reset()
  offlineApi.enqueue('stationWords', { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }] }, SCOPE_A)
  // 直接构造一条 parked 的草稿：模拟跨账号被 park 的情形
  const drafts = offlineApi.readDrafts(SCOPE_A)
  drafts.stationWords[0].parked = true
  localStorage.setItem(keysFor(SCOPE_A).drafts, JSON.stringify(drafts))
  assert.deepEqual(readPendingKeys(ST1, SCOPE_A), [], '★ parked 的条目不该被投影成「待上传」')
})

test('同一草稿内 wordKey 去重（重复入队只出现一次）', () => {
  reset()
  offlineApi.enqueue(
    'stationWords',
    { ownerId: SCOPE_A, stationId: ST1, items: [{ wordKey: 'w.a', source: 'public' }, { wordKey: 'w.a', source: 'public' }] },
    SCOPE_A,
  )
  assert.equal(readPendingKeys(ST1, SCOPE_A).length, 1, '★ 同一个词只应出现一行')
})

test('脏草稿项被跳过（缺 wordKey / 结构损坏），不抛错', () => {
  reset()
  offlineApi.enqueue(
    'stationWords',
    { ownerId: SCOPE_A, stationId: ST1, items: [null, { wordKey: '' }, { source: 'public' }, { wordKey: 'w.ok', source: 'public' }] },
    SCOPE_A,
  )
  const out = readPendingKeys(ST1, SCOPE_A)
  assert.deepEqual(out.map((x) => x.wordKey), ['w.ok'], '★ 只保留结构完整的那一条')
})

// ---------------------------------------------------------------- ② 投影行的反查

test('★ 公共词：已加载到内存的词条能反查出 form', () => {
  const rows = buildPendingRows(
    [{ wordKey: 'w.photosynthesis', source: 'public', queuedAt: null }],
    [],
    [{ id: 'w.photosynthesis', form: 'photosynthesis', pos: 'n.', gloss: '光合作用', phoneticBr: '/x/' }],
    [],
    [],
  )
  assert.equal(rows.length, 1)
  assert.equal(rows[0].form, 'photosynthesis')
  assert.equal(rows[0].gloss, '光合作用')
  assert.equal(rows[0].pendingSync, true, '★ 投影行必须带 pendingSync 标记')
  assert.equal(rows[0].unresolved, undefined, '能反查到就不该标 unresolved')
})

test('★ 私有词：从本地缓存反查（M3 的核心 —— 不走网络）', () => {
  // privateWords 模拟 useUserWords 的本地缓存（断网时唯一的来源）
  const privateCache = [
    { id: 'u.myword', wordKey: 'u.myword', form: 'myword', pos: 'n.', gloss: '我的词', chain: [], morphs: [] },
  ]
  const rows = buildPendingRows([{ wordKey: 'u.myword', source: 'user', queuedAt: null }], [], [], [], privateCache)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].form, 'myword', '★ 私有词必须能从本地缓存反查出 form（而不是显示 wordKey 原文）')
  assert.equal(rows[0].gloss, '我的词', '★ 也要能反查出 gloss')
  assert.equal(rows[0].unresolved, undefined)
})

test('★ 反查不到时渲染 wordKey 原文 + 标 unresolved（不留空白行）', () => {
  const rows = buildPendingRows([{ wordKey: 'u.gone', source: 'user', queuedAt: null }], [], [], [], [])
  assert.equal(rows.length, 1)
  assert.ok(rows[0].unresolved === true, '★ 必须标 unresolved，让 UI 显示「待上传」而不是空白')
  assert.ok(rows[0].form && rows[0].form.length > 0, '★ form 不能为空 —— 空白行会让用户以为词丢了')
  assert.equal(rows[0].pendingSync, true)
})

test('★ 同一词既在 refs 又在草稿里 → 只出现一行，以 refs 为准（去重优先级）', () => {
  const rows = buildPendingRows(
    [{ wordKey: 'w.dup', source: 'public', queuedAt: null }],
    [ref(ST1, 'w.dup')],
    [{ id: 'w.dup', form: 'dup', gloss: '已同步的释义' }],
    [],
    [],
  )
  assert.equal(rows.length, 0, '★ 已在 refs 里的词不该再出现在投影中（会重复显示）')
})

test('公共词与私有词混合投影：各自走各自的反查路径', () => {
  const rows = buildPendingRows(
    [
      { wordKey: 'w.pub', source: 'public', queuedAt: null },
      { wordKey: 'u.priv', source: 'user', queuedAt: null },
    ],
    [],
    [{ id: 'w.pub', form: 'pub', gloss: '公共的' }],
    [],
    [{ id: 'u.priv', wordKey: 'u.priv', form: 'priv', gloss: '私有的' }],
  )
  assert.equal(rows.length, 2)
  assert.equal(rows[0].form, 'pub')
  assert.equal(rows[1].form, 'priv')
  assert.ok(rows.every((r) => r.pendingSync), '两行都要标待上传')
})

test('空草稿 → 空投影（不留空数组以外的东西）', () => {
  assert.deepEqual(buildPendingRows([], [], [], [], []), [])
  assert.deepEqual(buildPendingRows(null, [], [], [], []), [])
})

// ---------------------------------------------------------------- ③ 词条缓存

test('★ 词条缓存：断网 + F5 的首帧来源（refs 按 stationId 分条目）', () => {
  reset()
  writeStationRefs(ST1, [ref(ST1, 'w.a'), ref(ST1, 'w.b')], SCOPE_A)
  writeStationRefs(ST2, [ref(ST2, 'w.c', 'user')], SCOPE_A)

  assert.equal(readStationRefs(ST1, SCOPE_A).refs.length, 2, 'ST1 有 2 条')
  assert.equal(readStationRefs(ST2, SCOPE_A).refs.length, 1, 'ST2 有 1 条')
  assert.equal(readStationRefs(ST2, SCOPE_A).refs[0].source, 'user', '私有词引用也缓存')
})

test('★ 词条缓存：分区隔离 —— B 读不到 A 的词条引用', () => {
  reset()
  writeStationRefs(ST1, [ref(ST1, 'w.a')], SCOPE_A)
  assert.deepEqual(readStationRefs(ST1, SCOPE_B).refs, [], '★ B 的首帧必须是空的')
})

test('词条缓存：损坏 JSON / 结构异常 → 回落空且不抛', () => {
  reset()
  localStorage.setItem(keysFor(SCOPE_A).stationWordsCache, '{坏 JSON')
  assert.deepEqual(readStationRefs(ST1, SCOPE_A).refs, [])
})

test('词条缓存：写失败（隐私模式）→ 抛错被吞掉（缓存不是数据源）', () => {
  globalThis.localStorage = makeStorage({ failOn: 'stationwords.v1' })
  const ok = writeStationRefs(ST1, [ref(ST1, 'w.a')], SCOPE_A)
  assert.equal(ok, false, '★ 返回 false 而不是抛出 —— 主流程不受缓存影响')
  reset()
})

// ---------------------------------------------------------------- ④ 源码纪律

test('★ 源码纪律：readDrafts 只经 offlineApi（业务代码不碰草稿键）', () => {
  const src = readFileSync(STATION_WORDS_HOOK, 'utf8')
  assert.ok(src.includes('offlineApi.readDrafts('), '必须通过 offlineApi 读草稿')
  assert.ok(!/wrc\.drafts/.test(src), '★ hook 里绝不能出现草稿键字面量')
  // 也不许自己 localStorage.getItem 草稿键
  assert.ok(!/localStorage\.getItem\([^)]*drafts/.test(src), '★ 不许自行读草稿键（会绕过分区隔离）')
})

test('★ 源码纪律：草稿反查不直连 userWordsApi.listByKeys（M3）', () => {
  const src = readFileSync(STATION_WORDS_HOOK, 'utf8')
  // listByKeys 允许出现在 refresh() 里（在线拉取 refs 对应的词条）
  // 但 buildPendingRows 里绝不能出现 —— 那是纯网络，离线必失败
  const pendingStart = src.indexOf('function buildPendingRows(')
  assert.ok(pendingStart !== -1, '找不到 buildPendingRows')
  const body = src.slice(pendingStart)
  assert.ok(
    !/listByKeys/.test(body),
    '★ buildPendingRows 里不得出现 listByKeys —— 离线投影绝不能走网络',
  )
  // 反查来源必须是 privateWords 入参
  assert.ok(/privateWords/.test(body), '反查必须用入参 privateWords（本地缓存）')
})

test('★ 源码纪律：pending 不计入 counts（counts 只数已同步的 refs）', () => {
  const src = readFileSync(STATION_WORDS_HOOK, 'utf8')
  const countsBlock = /const counts = useMemo\(([\s\S]*?)\n  \)/.exec(src)
  assert.ok(countsBlock, '找不到 counts 的定义')
  assert.ok(
    /words\.length/.test(countsBlock[1]),
    'counts.total 由 words.length 派生（words 只含已同步的 refs）',
  )
  assert.ok(!/pending/.test(countsBlock[1]), '★ counts 块里不得引用 pending（否则离线时「共 N 词」虚高）')
  // pendingCount 单独给出
  assert.ok(/pendingCount: pending\.length/.test(src), 'pendingCount 单独暴露')
})

test('★ 源码纪律：refresh 失败时不清空 refs（断网不该让列表消失）', () => {
  const src = readFileSync(STATION_WORDS_HOOK, 'utf8')
  const refreshStart = src.indexOf('const refresh = useCallback(')
  const refreshEnd = src.indexOf('}, [stationId, ownerId, scope])')
  const body = src.slice(refreshStart, refreshEnd)
  // err 分支里必须有 setError + setLoading(false) + return，且不含 setRefs([])
  const errBranch = body.slice(body.indexOf('if (err) {'))
  const errBranchEnd = errBranch.indexOf('setError(null)')
  const errBody = errBranch.slice(0, errBranchEnd === -1 ? 200 : errBranchEnd)
  assert.ok(/setError\(err\)/.test(errBody), '失败分支要 setError')
  assert.ok(!/setRefs\(\[\]\)/.test(errBody), '★ 失败分支不得 setRefs([]) —— 那会让断网时列表消失')
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

// 保持引用
void readdirSync
void statSync
void scopeOf

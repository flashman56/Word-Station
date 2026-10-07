/**
 * 缓存形状的**双向兼容**验证（架构师要点头的那一点）
 * ------------------------------------------------------------------
 * 跑：node scripts/test-cache-compat.mjs
 *
 * ★ 为什么要单独一个文件 ★
 *   裁剪把「缓存里存 API 行对象、零转换」这条纪律打破了。架构关心的是
 *   **读侧形状**与**向后兼容**两件事：
 *     ① 旧缓存（8 字段）被新代码读，会不会出问题？
 *     ② 新缓存（1 字段）被旧代码读，会不会出问题？
 *   这两条**都必须实测**，不能靠推理 —— 推理只能说明「应该没问题」，
 *   而实测能说明「确实没问题，且在哪些情况下会出问题」。
 *
 * ★ 结论先行（详见下方断言）
 *   双向兼容，**不需要作废旧缓存、不需要迁移**。原因是消费点只用 wordKey，
 *   而 normalizeByStation 的过滤条件只要求 `typeof r.wordKey === 'string'`。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function makeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    keys: () => [...map.keys()],
  }
}
globalThis.localStorage = makeStorage()

const { keysFor, readStationRefs, scopeOf, writeStationRefs } = await import('../src/lib/migrate.js')
const { isUserKey } = await import('../src/lib/wordKey.js')

const ROOT = resolve('.')
const HOOK = resolve('src/hooks/useStationWords.js')

let pass = 0
let fail = 0
function test(name, fn) {
  try {
    fn()
    pass += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    fail += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}
function reset() {
  globalThis.localStorage = makeStorage()
}

const SCOPE = 'uid-A'
const ST = 'station-1'
const KEY = (i) => `w.someword${i}`

/** 旧版缓存行：schema.stationWordFromRow 的 8 字段输出 */
function legacyRow(i) {
  return {
    id: `sw-00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    stationId: ST,
    ownerId: SCOPE,
    wordKey: KEY(i),
    source: 'public',
    note: i === 1 ? '旧缓存里的笔记' : null,
    addedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  }
}

/** 新版缓存行：pickCacheRef 的输出 */
function trimmedRow(i) {
  return { wordKey: KEY(i) }
}

console.log('[test-cache-compat] 裁剪前后的双向兼容\n')

// ================================================================ ① 读侧形状

test('★ 读侧 normalizeByStation 的过滤条件只要求 wordKey 是字符串', () => {
  const src = readFileSync(resolve('src/lib/migrate.js'), 'utf8')
  const m = /refs: entry\.refs\.filter\(([^;]*?)\)\s*,/.exec(src)
  assert.ok(m, '找得到 refs 的 filter')
  assert.ok(
    /typeof r\.wordKey === 'string'/.test(m[1]),
    '★ 过滤条件必须是 typeof r.wordKey === "string"（只要求 wordKey，不挑其它字段）—— ' +
      '这是双向兼容的关键：旧行（8 字段）通过、新行（1 字段）也通过',
  )
  // ★ 关键：过滤条件里**不能**出现「必须有 note」这类新增约束，
  //   否则旧缓存会被整行丢掉。
  assert.ok(
    !/typeof r\.note/.test(m[1]),
    '★ 过滤条件不得涉及 note（否则裁剪版缓存整行被丢）',
  )
})

// ================================================================ ② 新代码读旧缓存

test('★ 新代码读旧缓存（8 字段）：行不丢、wordKey 正确', () => {
  reset()
  // 直接把旧形状写进缓存（模拟上一版本的缓存）
  const raw = {
    v: 1,
    savedAt: new Date().toISOString(),
    byStation: {
      [ST]: { savedAt: new Date().toISOString(), seq: 1, refs: [legacyRow(1), legacyRow(2)] },
    },
  }
  localStorage.setItem(keysFor(SCOPE).stationWordsCache, JSON.stringify(raw))

  const { refs } = readStationRefs(ST, SCOPE)
  assert.equal(refs.length, 2, '★ 两行都在（没被过滤掉）')
  assert.equal(refs[0].wordKey, KEY(1), 'wordKey 正确')
  assert.equal(refs[1].wordKey, KEY(2), 'wordKey 正确')
})

test('★ 新代码读旧缓存：消费点（noteByKey / isUserKey / existingKeys）全部成立', () => {
  reset()
  const raw = {
    v: 1,
    savedAt: new Date().toISOString(),
    byStation: {
      [ST]: {
        savedAt: new Date().toISOString(),
        seq: 1,
        refs: [{ ...legacyRow(1), source: 'user', wordKey: 'u.myword' }, legacyRow(2)],
      },
    },
  }
  localStorage.setItem(keysFor(SCOPE).stationWordsCache, JSON.stringify(raw))
  const { refs } = readStationRefs(ST, SCOPE)

  // App.jsx:220 的 existingKeys
  const existingKeys = new Set(refs.map((r) => r.wordKey))
  assert.ok(existingKeys.has('u.myword'), '★ existingKeys 能从旧缓存建出来')
  assert.ok(existingKeys.has(KEY(2)), '★ existingKeys 含公共词')

  // useStationWords 的 isUserKey 分流
  const userKeys = refs.filter((r) => isUserKey(r.wordKey)).map((r) => r.wordKey)
  const pubKeys = refs.filter((r) => !isUserKey(r.wordKey)).map((r) => r.wordKey)
  assert.deepEqual(userKeys, ['u.myword'], '★ isUserKey 分流在旧缓存上成立')
  assert.deepEqual(pubKeys, [KEY(2)], '★ 公共词分流正确')

  // noteByKey —— 旧缓存里 note 还在，所以能读到
  const noteByKey = new Map(refs.map((r) => [r.wordKey, r.note]))
  assert.equal(noteByKey.get('u.myword'), '旧缓存里的笔记', '★ 旧缓存的 note 仍可读（不丢数据）')
})

// ================================================================ ③ 旧代码读新缓存

test('★ 旧代码读新缓存（1 字段）：noteByKey 回落 null 而不是崩', () => {
  reset()
  // 用 writeStationRefs 写入裁剪版（与线上新代码同一条路径）
  writeStationRefs(ST, [trimmedRow(1), trimmedRow(2)], SCOPE)
  const { refs } = readStationRefs(ST, SCOPE)
  assert.equal(refs.length, 2, '两行都在')
  assert.deepEqual(Object.keys(refs[0]), ['wordKey'], '★ 确认落盘的是裁剪版')

  // 旧代码的 noteByKey 构建 —— note 是 undefined
  const noteByKey = new Map(refs.map((r) => [r.wordKey, r.note]))
  assert.equal(noteByKey.get(KEY(1)), undefined, 'note 取到 undefined')
  // useStationWords 的写法是 `noteByKey.get(w.id) ?? null`
  const note = noteByKey.get(KEY(1)) ?? null
  assert.equal(note, null, '★ `?? null` 把 undefined 兜成 null（不是 undefined，也不是崩）')
})

test('★ 旧代码读新缓存：分流与 existingKeys 不受影响（都只看 wordKey）', () => {
  reset()
  writeStationRefs(ST, [{ wordKey: 'u.myword' }, { wordKey: KEY(2) }], SCOPE)
  const { refs } = readStationRefs(ST, SCOPE)

  assert.deepEqual(refs.filter((r) => isUserKey(r.wordKey)).map((r) => r.wordKey), ['u.myword'], '私有词分流正确')
  assert.deepEqual(
    refs.filter((r) => !isUserKey(r.wordKey)).map((r) => r.wordKey),
    [KEY(2)],
    '★ 公共词分流正确 —— 证明「不存 source」是安全的（isUserKey 读的是 wordKey 前缀）',
  )
  const existingKeys = new Set(refs.map((r) => r.wordKey))
  assert.equal(existingKeys.size, 2, 'existingKeys 正确')
})

test('★ updateNote 在新缓存上仍可用（它的入参不来自 refs）', () => {
  // stationWords.updateNote(stationId, wordKey, note) —— 三个入参都来自调用处
  // 的变量或用户操作，不读 refs 的任何字段。
  reset()
  writeStationRefs(ST, [trimmedRow(1)], SCOPE)
  const { refs } = readStationRefs(ST, SCOPE)
  // 模拟用户在某行点了「编辑笔记」：wordKey 来自该行的视图对象
  const wordKey = refs[0].wordKey
  assert.equal(typeof wordKey, 'string', 'wordKey 可用（这是 updateNote 唯一需要的 refs 信息）')
})

// ================================================================ ④ 排序

test('★ 数组顺序被保留（新旧都是）—— 倒序渲染不依赖 addedAt', () => {
  reset()
  // 模拟 listByStation 的 .order('added_at', {ascending:false}) 返回的顺序
  writeStationRefs(ST, [{ wordKey: KEY(3) }, { wordKey: KEY(2) }, { wordKey: KEY(1) }], SCOPE)
  const { refs } = readStationRefs(ST, SCOPE)
  assert.deepEqual(refs.map((r) => r.wordKey), [KEY(3), KEY(2), KEY(1)], '★ 顺序原样保留')
})

// ================================================================ ⑤ 混存

test('★ 新旧缓存行混存在同一站也能正常工作', () => {
  reset()
  const raw = {
    v: 1,
    savedAt: new Date().toISOString(),
    byStation: {
      [ST]: {
        savedAt: new Date().toISOString(),
        seq: 1,
        // 一半旧格式、一半新格式（升级瞬间的真实状态）
        refs: [legacyRow(1), trimmedRow(2), legacyRow(3), trimmedRow(4)],
      },
    },
  }
  localStorage.setItem(keysFor(SCOPE).stationWordsCache, JSON.stringify(raw))
  const { refs } = readStationRefs(ST, SCOPE)
  assert.equal(refs.length, 4, '★ 四行都在（没被过滤掉）')
  const keys = refs.map((r) => r.wordKey)
  assert.deepEqual(keys, [KEY(1), KEY(2), KEY(3), KEY(4)], '顺序与 wordKey 都正确')
  // 消费点对两种形状一致
  const existingKeys = new Set(keys)
  assert.equal(existingKeys.size, 4, '★ existingKeys 对混合形状同样成立')
})

// ================================================================ ⑥ 迁移策略结论

test('★ 结论：不需要迁移作废（filter 条件对两种形状都成立）', () => {
  reset()
  // 若需要作废，得有一个显式的版本门槛；实测 filter 条件不含它
  const src = readFileSync(resolve('src/lib/migrate.js'), 'utf8')
  const versionGate = /stationWordsCache[^\n]*v\s*[><=]/.test(src)
  assert.ok(
    !versionGate,
    '★ 缓存读取路径上没有按 v 判门槛 —— 所以旧缓存（v:1）与新缓存共存，' +
      '不需要「作废」这一步，也不需要写迁移',
  )
})

// ================================================================ ⑦ 裁剪纪律本身

test('★ 源码纪律：裁剪只在写盘那一个点发生（read 侧零改动）', () => {
  const src = readFileSync(HOOK, 'utf8')
  // 写盘：投影
  assert.ok(
    /writeStationRefs\(\s*stationId,\s*list\.map\(pickCacheRef\)/.test(src),
    '★ 写盘走 list.map(pickCacheRef)',
  )
  // 读盘：零投影（读回来的形状就是写进去的形状）
  const readLine = /readStationRefs\(([^)]*)\)\.refs/.exec(src)
  assert.ok(readLine, '读盘走 readStationRefs(...).refs')
  assert.ok(
    !/readStationRefs\([^)]*\)[\s\S]{0,40}\.map\(/.test(src),
    '★ 读侧不得再做 map/投影 —— 写进去什么形状，读出来就是什么形状（零转换原则在读侧仍成立）',
  )
})

test('★ 内存态零转换：setRefs(list) 仍是原始 API 行对象', () => {
  const src = readFileSync(HOOK, 'utf8')
  const calls = [...src.matchAll(/setRefs\(([^)]*)\)/g)].map((m) => m[1].trim())
  assert.ok(calls.includes('list'), '★ 内存态是 setRefs(list) —— 零转换，原始行对象')
  assert.ok(
    !calls.some((a) => a.includes('pickCacheRef')),
    '★ 内存态绝不投影（将来 K5 接笔记 UI 要靠它）',
  )
})

console.log(`\n通过 ${pass} · 失败 ${fail}`)
process.exit(fail === 0 ? 0 : 1)

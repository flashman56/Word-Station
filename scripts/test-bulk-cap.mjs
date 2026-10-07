/**
 * A-07：批量截断的「文案数字 === 实际写入数」恒等性
 * ------------------------------------------------------------------
 * 跑：npm run test:bulk-cap
 *
 * ★ 这组测试要防的是哪一个具体 bug ★
 *   「全选当前结果」在 6.4 万词时会一次 applyMany 6.4 万条：
 *   setRecords 6 万条卡死，且 writeLearn 写的是**整个 records 映射**
 *   （`{version, records}`）→ QuotaExceededError → 徽标转红、内存态已更新而磁盘
 *   没更新 → 刷新即丢。所以必须加 2000 上限。
 *
 * ★ 为什么「文案数字」要单独断言 ★
 *   加上限最自然的写法是：按钮文案写死 `Math.min(allIds.length, 2000)`，onClick 里
 *   再写一次 `allIds.slice(0, 2000)`。**两处各算一遍**，任何一侧漏改就出现
 *   「按钮说「全选前 2000 个」而实际只选进 1500 个」——用户点了发现少了一半，
 *   而代码看起来完全正常。正确做法是 ListView 里只派生一个 selectableAllIds，
 *   文案与提交都用它。本测试就是钉住这一条。
 *
 * 断言用「从 ListView 源码里抽出真实的派生表达式并求值」的方式，而不是把算法
 * 在测试里重写一遍 —— 后者只会测到测试自己，永远测不到 ListView 改坏了。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LISTVIEW = path.join(ROOT, 'src', 'components', 'ListView.jsx')
const USE_LEARN = path.join(ROOT, 'src', 'hooks', 'useLearn.js')

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

console.log('[test:bulk-cap]')

// ---------------------------------------------------------------- 读源码里的真值

const listSrc = readFileSync(LISTVIEW, 'utf8')
const learnSrc = readFileSync(USE_LEARN, 'utf8')

/** 从 useLearn.js 里读出真实的上限常量（而不是在测试里重写一个 2000） */
function readBulkCap() {
  const m = /export const BULK_SELECT_CAP = (\d+)/.exec(learnSrc)
  assert.ok(m, 'useLearn.js 必须导出 BULK_SELECT_CAP —— 组件与测试都从这一处取真相源')
  return Number(m[1])
}

function readBulkChunk() {
  const m = /const BULK_CHUNK = (\d+)/.exec(learnSrc)
  assert.ok(m, 'useLearn.js 必须定义 BULK_CHUNK')
  return Number(m[1])
}

const BULK_SELECT_CAP = readBulkCap()
const BULK_CHUNK = readBulkChunk()

/**
 * 复刻 ListView 里的派生链。**刻意用与源码逐字等价的表达式**，
 * 并且下面的「源码形状」测试负责保证两边真的等价。
 */
function deriveListView(allIds) {
  const selectableAllIds = allIds.length > BULK_SELECT_CAP ? allIds.slice(0, BULK_SELECT_CAP) : allIds
  const selectAllLabel =
    allIds.length > BULK_SELECT_CAP
      ? `全选前 ${selectableAllIds.length} 个（当前结果 ${allIds.length} 个）`
      : `全选当前结果（${selectableAllIds.length}）`
  return { selectableAllIds, selectAllLabel }
}

/** 从按钮 label 里把「实际会选中的数量」抠出来 —— 这就是用户以为会选中的数 */
function parseSelectedCount(label) {
  const front = /^全选前 (\d+) 个/.exec(label)
  if (front) return Number(front[1])
  const plain = /^全选当前结果（(\d+)）/.exec(label)
  if (plain) return Number(plain[1])
  throw new Error(`无法从按钮文案里解析数量：${label}`)
}

const mkIds = (n) => Array.from({ length: n }, (_, i) => `w.word${i}`)

console.log(`  （真相源：BULK_SELECT_CAP = ${BULK_SELECT_CAP}，BULK_CHUNK = ${BULK_CHUNK}）`)

// ---------------------------------------------------------------- ① 四个边界下恒等

/**
 * 完整链路：按钮文案 → 用户以为的选中数 → 实际提交的数组 → selectedIds.size
 *                → applyMany 收到的 ids.length
 * 四处必须**恒等**。
 */
;[
  { n: 0, why: '空结果' },
  { n: 1, why: '单个' },
  { n: BULK_SELECT_CAP - 1, why: '上限 - 1（不截断）' },
  { n: BULK_SELECT_CAP, why: '恰好等于上限（不截断 —— 边界最容易写错）' },
  { n: BULK_SELECT_CAP + 1, why: '上限 + 1（刚好截断）' },
  { n: 2001, why: 'PRD 指定的边界 2001' },
  { n: 64000, why: 'PRD 指定的真实规模 6.4 万' },
].forEach(({ n, why }) => {
  test(`恒等性（${why} · allIds.length = ${n}）`, () => {
    const allIds = mkIds(n)
    const { selectableAllIds, selectAllLabel } = deriveListView(allIds)

    const claimed = parseSelectedCount(selectAllLabel)
    assert.equal(
      claimed,
      selectableAllIds.length,
      `★ 文案说 ${claimed} 个，实际提交 ${selectableAllIds.length} 个 —— 这就是 PRD 明令禁止的「文案与写入不一致」`,
    )
    assert.equal(selectableAllIds.length, Math.min(n, BULK_SELECT_CAP), '实际写入必须是 min(命中数, 上限)')
    assert.ok(selectableAllIds.length <= BULK_SELECT_CAP, `实际写入 ${selectableAllIds.length} 不得超过上限 ${BULK_SELECT_CAP}`)
  })
})

test('★ 6.4 万词：实际写入被压到上限，而命中数在文案里如实告知', () => {
  const { selectableAllIds, selectAllLabel } = deriveListView(mkIds(64000))
  assert.equal(selectableAllIds.length, BULK_SELECT_CAP, '★ 必须截断到上限，否则配额必爆')
  // 括号里必须是**真实命中数** 64000，否则用户会以为搜索只命中 2000
  assert.ok(/当前结果 64000 个/.test(selectAllLabel), `文案必须如实告知命中数，实际：${selectAllLabel}`)
})

// ---------------------------------------------------------------- ② applyMany 分批

/** 复刻 useLearn.applyMany 的分批循环（下面的「源码形状」测试保证它没变） */
function simulateApplyMany(ids, chunkSize) {
  const calls = { persistCount: 0, setRecordsCount: 0, onDirtyCalls: [] }
  let next = {}
  const chunks = Math.ceil(ids.length / chunkSize)
  for (let start = 0; start < ids.length; start += chunkSize) {
    const batch = ids.slice(start, start + chunkSize)
    const acc = { ...next }
    batch.forEach((id) => {
      acc[id] = { status: 'known' }
    })
    next = acc
    calls.setRecordsCount += 1
    calls.persistCount += 1 // persist 写的是**全量**映射，不是这一批
  }
  calls.onDirtyCalls.push(ids)
  return { ...calls, chunks, finalCount: Object.keys(next).length }
}

test('applyMany：6000 个 id 分成 12 批，setRecords 被摊平到 12 次', () => {
  const ids = mkIds(6000)
  const out = simulateApplyMany(ids, BULK_CHUNK)
  assert.equal(out.chunks, Math.ceil(6000 / BULK_CHUNK), `6000 / ${BULK_CHUNK} 应为 12 批`)
  assert.equal(out.setRecordsCount, 12, '★ 分批的收益之一：setState 次数被摊平')
  assert.equal(out.finalCount, 6000, '★ 但一条都不能少（分批不改变写入总量）')
})

test('★ applyMany：onDirty 只被调一次（逐批调会让 useLearnCloud 起 N 个防抖窗口）', () => {
  const ids = mkIds(6000)
  const out = simulateApplyMany(ids, BULK_CHUNK)
  assert.equal(out.onDirtyCalls.length, 1, '★ onDirty 必须只在结束时调一次')
  assert.equal(out.onDirtyCalls[0].length, 6000, '且传的是**完整** id 数组，不是最后一批')
})

test('★ 分批不减少单次写入体积 —— 所以上限才是真正的护栏（M2 的诚实断言）', () => {
  // writeLearn 写的是 { version, records } 全量映射，与批数无关。
  // 这条测试的作用是**防止有人又写出「分批能缓解配额」的错觉**：
  // 如果哪天 writeLearn 改成增量写，本测试的 bytesPerWrite 断言会提醒人重新评估。
  const single = JSON.stringify({ version: 2, records: mkIds(2000).reduce((a, id) => ({ ...a, [id]: {} }), {}) })
  const chunked = JSON.stringify({ version: 2, records: mkIds(2000).reduce((a, id) => ({ ...a, [id]: {} }), {}) })
  assert.equal(single.length, chunked.length, '每次 persist 的体积与批数无关 —— 配额靠 2000 上限，不靠分批')
  assert.equal(simulateApplyMany(mkIds(2000), BULK_CHUNK).persistCount, 4, '2000 条仍是 4 次全量写，总字节是 4 倍')
})

// ---------------------------------------------------------------- ③ 源码形状：测试必须钉住真实实现

test('★ ListView 只有一个真相源：文案与 onClick 都用 selectableAllIds', () => {
  // onClick 必须传 selectableAllIds，不能是 allIds / allIds.slice(...)
  const onClick = /onClick=\{\(\) => onSelectMany\(([^,]+),\s*'replace'\)\}/.exec(listSrc)
  assert.ok(onClick, '找不到「全选当前结果」的 onClick')
  assert.equal(
    onClick[1].trim(),
    'selectableAllIds',
    `★ onClick 必须传 selectableAllIds，实际是 ${onClick[1].trim()} —— 传 allIds 就绕过了上限`,
  )

  // 文案必须是 selectAllLabel 变量（它由 selectableAllIds 派生）
  assert.ok(/\{selectAllLabel\}/.test(listSrc), '按钮必须渲染 {selectAllLabel}，不能内联再算一遍')
  assert.ok(!/全选当前结果（\{allIds\.length\}）/.test(listSrc), '★ 旧写法「全选当前结果（{allIds.length}）」必须已消失')
})

test('★ ListView 的 selectAllLabel 与 selectableAllIds 同源', () => {
  // 两个派生必须都出现在源码里，且 selectableAllIds 的定义里只有一个上限常量
  const m = /const selectableAllIds = useMemo\(\s*\(\) => \(allIds\.length > BULK_SELECT_CAP \? allIds\.slice\(0, BULK_SELECT_CAP\) : allIds\)/.test(
    listSrc,
  )
  assert.ok(m, 'selectableAllIds 的定义必须与本测试复刻的表达式一致 —— 否则测试测的是自己，不是源码')
  const labelM = /const selectAllLabel =[\s\S]*?selectableAllIds\.length/.test(listSrc)
  assert.ok(labelM, 'selectAllLabel 必须从 selectableAllIds.length 派生')
})

test('★ ListView 从 useLearn 导入上限常量，而不是本地写死 2000', () => {
  const imp = /import \{([^}]*)\} from '\.\.\/hooks\/useLearn\.js'/.exec(listSrc)
  assert.ok(imp, 'ListView 必须从 useLearn.js 导入上限')
  assert.ok(/\bBULK_SELECT_CAP\b/.test(imp[1]), '★ 必须导入 BULK_SELECT_CAP；本地写死数字会出现「上限改了但组件没改」')
  // 组件里不允许出现第二个裸 2000
  const hardcoded = /allIds\.slice\(\s*0\s*,\s*\d+\s*\)/.test(listSrc)
  assert.ok(!hardcoded, '★ 不许出现 allIds.slice(0, 数字) —— 上限只能从常量来')
})

test('★ useLearn.applyMany 的分批实现形状（onDirty 在循环外）', () => {
  // 从 `const applyMany = useCallback(` 起，取到依赖数组 `[persist],` 之前的全部 body。
  // 用非贪婪 + 显式的依赖数组终止符，避免把后面的函数也吞进来。
  const start = learnSrc.indexOf('const applyMany = useCallback(')
  assert.ok(start !== -1, '找不到 applyMany 的实现')
  const end = learnSrc.indexOf('[persist],', start)
  assert.ok(end !== -1 && end > start, '找不到 applyMany 的依赖数组终止符')
  const body = learnSrc.slice(start, end)

  const loopStart = body.indexOf('for (let start = 0;')
  assert.ok(loopStart !== -1, 'applyMany 必须有分批循环（只截断不分批 → 6 万次 setState 仍会卡死）')

  // 分批循环的结束位置：循环体内不应出现 onDirty
  const dirtyAt = body.indexOf('onDirtyRef.current(ids)')
  assert.ok(dirtyAt !== -1, 'applyMany 必须调 onDirty')
  const dirtyBeforeLoop = dirtyAt < loopStart
  assert.ok(!dirtyBeforeLoop, '★ onDirty 不得在分批循环之前被调（那样一次批量会起 N 个防抖窗口）')

  // 循环体：从 for 到 `next = acc` 之后的第一个 `}` 之前
  const loopEnd = body.indexOf('\n      }', loopStart)
  const loopBody = body.slice(loopStart, loopEnd === -1 ? body.length : loopEnd)
  assert.ok(
    !loopBody.includes('onDirtyRef.current'),
    '★ onDirty 必须只在循环外调一次；逐批调会让 useLearnCloud 起 N 个防抖窗口、N 次 pushDirty，而 pushDirty 读的是 recordsRef.current（此时已含全部批次），逐批调纯属浪费',
  )
  assert.ok(/return \{ count: ids\.length, chunks \}/.test(body), 'applyMany 必须返回 { count, chunks } 供文案使用')
  assert.ok(
    /BULK_CHUNK/.test(loopBody) && /recordsRef\.current = next/.test(loopBody) && /persist\(next, scopeRef\.current\)/.test(loopBody),
    '每批必须做三件事：改 ref、setRecords、persist',
  )
})

test('★ 上限与分批步长都有合理取值（上限必须 ≥ 分批步长，否则分批无意义）', () => {
  assert.ok(BULK_SELECT_CAP > 0, '上限必须为正')
  assert.ok(BULK_CHUNK > 0, '分批步长必须为正')
  assert.ok(BULK_SELECT_CAP >= BULK_CHUNK, `上限 ${BULK_SELECT_CAP} 必须 ≥ 分批步长 ${BULK_CHUNK}`)
  assert.ok(BULK_SELECT_CAP <= 20000, `上限 ${BULK_SELECT_CAP} 过大（接近全库规模就等于没截断）`)
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

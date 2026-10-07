/**
 * 测量脚本（只读，不改任何生产代码）—— 为「小站词条缓存列裁剪」方案提供实测依据
 * ------------------------------------------------------------------
 * 跑：node scripts/measure-station-cache.mjs
 *
 * ★ 为什么必须实测而不是估算 ★
 *   QA 实测「单条 ≈ 390B」推导出「1 站×500 词 ≈ 191KB，护栏在第 2 个站就拒写」。
 *   这个结论会直接决定护栏取值（256KB 还是 1-2MB），而它建立在**估算**上。
 *   JSON.stringify 的实际开销高度依赖**键名长度**与**值的形态**：
 *     - wordKey = 'w.photosynthesis' 是长字符串，占比不小；
 *     - stationId 是个 36 字符的 uuid，**每条都重复存一遍**；
 *     - ownerId 也是 uuid，**每条都重复存一遍**；
 *     - note 多为 null（2 字节）。
 *   所以「哪几个字段占大头」必须实测，不能凭直觉。
 *
 * ★ 本脚本只读生产代码里的真实转换函数，不复制字段清单 ★
 *   字段清单若在这里重抄一份，两处就会漂移 —— 而字段漂移正是这次要解决的问题。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------- 真数据构造
//
// 直接照抄 supabase 行的形状（snake_case），再过**真的** stationWordFromRow。

const OWNER = '3f9a1c22-7b41-4d8e-9a0f-2c6d8e5b1a37'
const STATION = 'b2e4f7a9-1d3c-4e5f-8a7b-9c0d1e2f3a4b'

/** 真实的 word_key 形态：公共词是 w.<slug>，私有词是 u.<formKey> */
const FORMS = [
  'photosynthesis', 'quixotic', 'obtuse', 'ubiquitous', 'ephemeral',
  'ubiquity', 'gregarious', 'fastidious', 'laconic', 'ineffable',
]

/** 一条 station_words 行（Postgres 的 snake_case 形状） */
function makeRow(i, { withNote = false } = {}) {
  const isUser = i % 5 === 4
  return {
    id: `9a3f${String(i).padStart(28, '0')}-0000-4000-8000-000000000000`,
    station_id: STATION,
    owner_id: OWNER,
    word_key: isUser ? `u.${FORMS[i % FORMS.length]}` : `w.${FORMS[i % FORMS.length]}`,
    source: isUser ? 'user' : 'public',
    note: withNote ? `这是第 ${i} 个词的站内笔记，用来估算非空 note 的体积影响` : null,
    added_at: '2026-09-26T12:34:56.789Z',
    updated_at: '2026-09-26T12:34:56.789Z',
  }
}

// ---------------------------------------------------------------- 真的转换函数
//
// 从 schema.js 源码里**取出真的 stationWordFromRow** 来跑（不重抄字段清单）。
// 用 new Function 构造：给它一个 r，返回 schema.js 那段实现的结果。

const schemaSrc = readFileSync(resolve('src/lib/cloud/schema.js'), 'utf8')

function loadStationWordFromRow() {
  const start = schemaSrc.indexOf('export function stationWordFromRow(')
  if (start === -1) throw new Error('schema.js 里找不到 stationWordFromRow')
  const open = schemaSrc.indexOf('{', start)
  let depth = 0
  let end = -1
  for (let i = open; i < schemaSrc.length; i += 1) {
    if (schemaSrc[i] === '{') depth += 1
    else if (schemaSrc[i] === '}') {
      depth -= 1
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) throw new Error('stationWordFromRow 的花括号未闭合')
  const body = schemaSrc.slice(start, end + 1).replace('export function', 'function')
  // eslint-disable-next-line no-new-func
  return new Function(`${body}; return stationWordFromRow;`)()
}

const stationWordFromRow = loadStationWordFromRow()

// ---------------------------------------------------------------- 测量

/** 单条序列化的字节数（UTF-8，与 localStorage 实际占用同口径） */
function bytesOf(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8')
}

/** 测 N 条的平均单条字节 */
function measure(label, build, n = 1000) {
  const items = []
  for (let i = 0; i < n; i += 1) items.push(build(i))
  const total = bytesOf(items)
  const per = total / n
  console.log(
    `  ${label.padEnd(34)} 单条 ${per.toFixed(1).padStart(7)} B   500 条 ${(per * 500 / 1024).toFixed(1).padStart(7)} KB   5000 条 ${(per * 5000 / 1024).toFixed(1).padStart(8)} KB`,
  )
  return per
}

console.log('[measure] 小站词条缓存的单条体积（实测，非估算）\n')
console.log(`  ownerId / stationId 各 ${OWNER.length} 字符，word_key 形如 w.${FORMS[0]}（${FORMS[0].length + 2} 字符）\n`)

console.log('① 现状（全字段，来自 schema.stationWordFromRow）')
const full = measure('全字段（note=null）', (i) => stationWordFromRow(makeRow(i)))
measure('全字段（note 非空 ~30 字）', (i) => stationWordFromRow(makeRow(i, { withNote: true })))

console.log('\n② 逐字段裁剪（每行只留 wordKey / note 两项）')
const wordKeyOnly = measure('只留 wordKey', (i) => ({ wordKey: `w.${FORMS[i % FORMS.length]}` }))
const wordKeyNote = measure('只留 wordKey + note(null)', (i) => ({ wordKey: `w.${FORMS[i % FORMS.length]}`, note: null }))
const wordKeyNoteStr = measure('只留 wordKey + note("")', (i) => ({ wordKey: `w.${FORMS[i % FORMS.length]}` }))
void wordKeyNoteStr

console.log('\n③ 分档方案对比（单条 → 1 站×500 词 → 10 站满配）')
const CAPS = [
  ['现状（8 字段）', full],
  ['A 只留 wordKey', wordKeyOnly],
  ['B wordKey + note', wordKeyNote],
]
console.log(`  ${'方案'.padEnd(20)} ${'单条'.padStart(8)}   ${'1 站×500'.padStart(10)}   ${'10 站×500'.padStart(11)}   ${'256KB 可存'.padStart(12)}   ${'1MB 可存'.padStart(10)}`)
for (const [name, per] of CAPS) {
  const per500 = (per * 500) / 1024
  const per10 = (per * 5000) / 1024
  console.log(
    `  ${name.padEnd(18)} ${per.toFixed(1).padStart(7)}B   ${per500.toFixed(1).padStart(8)} KB   ${per10.toFixed(1).padStart(9)} KB   ${Math.floor(256 / per500).toString().padStart(11)} 站   ${Math.floor(1024 / per500).toString().padStart(9)} 站`,
  )
}

console.log('\n④ 各字段的实际占比（现状 8 字段里，每字段省下的字节）')
{
  const n = 1000
  const base = []
  for (let i = 0; i < n; i += 1) base.push(stationWordFromRow(makeRow(i)))
  const fullBytes = bytesOf(base)
  for (const field of ['id', 'stationId', 'ownerId', 'wordKey', 'source', 'note', 'addedAt', 'updatedAt']) {
    const trimmed = base.map((r) => {
      const c = { ...r }
      delete c[field]
      return c
    })
    const saved = fullBytes - bytesOf(trimmed)
    console.log(
      `  去掉 ${field.padEnd(10)} 省 ${(saved / n).toFixed(1).padStart(6)} B/条  = ${((saved / fullBytes) * 100).toFixed(1).padStart(5)}%`,
    )
  }
  // 合计：只留 wordKey（+ note）时省下多少
  const onlyKeyBytes = bytesOf(base.map((r) => ({ wordKey: r.wordKey })))
  const keyNoteBytes = bytesOf(base.map((r) => ({ wordKey: r.wordKey, note: r.note })))
  console.log(
    `  裁成「只留 wordKey」        省 ${((fullBytes - onlyKeyBytes) / n).toFixed(1).padStart(6)} B/条 = ${(((fullBytes - onlyKeyBytes) / fullBytes) * 100).toFixed(1).padStart(5)}%`,
  )
  console.log(
    `  裁成「wordKey + note」      省 ${((fullBytes - keyNoteBytes) / n).toFixed(1).padStart(6)} B/条 = ${(((fullBytes - keyNoteBytes) / fullBytes) * 100).toFixed(1).padStart(5)}%`,
  )
}

console.log('\n⑤ 真实词形长度对体积的影响（word_key 越长越贵）')
for (const form of ['a', 'photosynthesis', 'internationalization']) {
  const per = measure(`wordKey = w.${form}`, (i) => ({ wordKey: `w.${form}` }), 200)
  void per
}

console.log(`\n  说明：JSON.stringify 的键名开销已计入（实测口径与 localStorage 一致）。`)
console.log(`        实際占用还受浏览器实现影响（部分浏览器按 UTF-16 计），`)
console.log(`        但**相对**关系（哪个字段占大头）不受影响 —— 那才是本方案要依据的。`)

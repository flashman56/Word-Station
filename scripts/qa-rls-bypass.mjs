/**
 * QA：定位 D3 失败的真实原因 + 第 7 题（绕过构造）
 * ------------------------------------------------------------------
 * 发现：往镜像追加一个越权函数，门禁仍然绿。追查发现不是「门禁没跑」，
 * 而是**豁免 A2 被文件里更早的一次合法归属查询满足了** ——
 * 尽管新增函数自己**根本没有**做归属校验。
 *
 * A2 的实现（check-rls-writes.mjs:631-645）：
 *   const priorCode = code.slice(0, m.index)   ← 只看「文本上更早」
 *   …只要更早出现过一次 .from('stations').select().eq('owner_id',…)
 *   且那条链的文本里含有与写入 payload 相同的变量名，就判定 parentOk。
 *
 * 它**不看控制流、不看函数边界、不看该查询与写入之间有没有条件关联**。
 * 于是：在已通过校验的代码**之后**追加一个新函数，复用同一个变量名，
 * 就能白拿 A2 豁免。
 *
 * 本脚本用 4 个对照样本精确定位这条缝的边界。
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

const PRELUDE = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
`

/** 已有的、正当的归属校验（模拟镜像里 index.ts 修复后的那段） */
const LEGIT_CHECK = `
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
`

/** A1：owner_id 钉到已鉴权 uid（自限写入，合法）
 *  ⚠️ QA 第一版忘了带 PRELUDE（没有 auth.getUser ⇒ uid 不可溯源），
 *     门禁正确地报红了 —— 那是 QA 样本写错，不是门禁的错。 */
const V1 = `
const admin = createClient(url, ${KEY})
await admin.from('user_words').upsert({ owner_id: uid, form, form_key: fk })
`

/** A2：写入前自己验了父表归属（合法） */
const V2 = `
const admin = createClient(url, ${KEY})
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
`

/** 绕过①：复用「已校验」那个变量名 stationId，新函数自己不做任何校验 */
const V3 = `
export async function escalated(stationId, uid, wordKey) {
  const admin = createClient(url, ${KEY})
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`

/** 绕过②：换变量名（victimStationId）—— 预期会被拦，作为对照 */
const V4 = `
export async function escalated(victimStationId, uid, wordKey) {
  const admin = createClient(url, ${KEY})
  await admin.from('station_words').upsert({ station_id: victimStationId, owner_id: uid, word_key: wordKey })
}
`

/** 绕过③：连 owner_id 也不钉（最赤裸的形态）—— 预期会被拦 */
const V5 = `
export async function escalated(stationId, wordKey) {
  const admin = createClient(url, ${KEY})
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: body.owner_id, word_key: wordKey })
}
`

function runWith(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  dropProbe(PROBE)
  return {
    code: r.status,
    hits: out.split('\n').filter((l) => l.includes('dev-zzprobe.mjs') && /\[\w+\]/.test(l)).map((l) => l.trim()),
  }
}

const cases = [
  { id: 'A1', title: 'A1 自限写入（合法，应绿）', code: PRELUDE + V1, expect: 'green' },
  { id: 'A2', title: 'A2 写入前自验父表归属（合法，应绿）', code: V2, expect: 'green' },
  {
    id: 'B1',
    title: '绕过①：合法校验之后追加新函数，复用同名变量 stationId',
    code: PRELUDE + LEGIT_CHECK + V3,
    expect: 'red',
  },
  {
    id: 'B1c',
    title: '绕过①对照：同样的新函数，但**没有**前置的合法校验',
    code: PRELUDE + V3,
    expect: 'red',
  },
  {
    id: 'B2',
    title: '绕过②：换变量名 victimStationId（应拦，作为对照）',
    code: PRELUDE + LEGIT_CHECK + V4,
    expect: 'red',
  },
  {
    id: 'B3',
    title: '绕过③：复用同名变量且不钉 owner_id（应拦，作为对照）',
    code: PRELUDE + LEGIT_CHECK + V5,
    expect: 'red',
  },
]

const results = []
for (const c of cases) {
  const res = runWith(c.code)
  const red = res.code === 1 && res.hits.length > 0
  const ok = c.expect === 'red' ? red : !red
  results.push({
    id: c.id,
    title: c.title,
    expect: c.expect,
    got: red ? 'red' : 'green',
    pass: ok,
    note: red ? res.hits.join(' | ').replace(/\|/g, '/') : '零违规',
  })
}

console.log('| 用例 | 期望 | 实际 | 结论 | 证据 |')
console.log('| --- | --- | --- | --- | --- |')
for (const r of results) {
  console.log(`| ${r.id} ${r.title} | ${r.expect} | ${r.got} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.note} |`)
}
const bypass = results.filter((r) => !r.pass)
console.log('')
console.log(`残留：'无 ✓（探针清空复用）'`)
if (bypass.length) {
  console.log('')
  console.log('🔴 门禁被绕过（期望红却绿）：')
  bypass.forEach((b) => console.log(`   ${b.id} ${b.title}`))
  process.exit(1)
}
console.log('✅ 全部符合预期')
process.exit(0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

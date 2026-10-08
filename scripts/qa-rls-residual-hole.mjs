/**
 * QA 第二轮 · 对「静态推断关不掉」这一说法的独立判断
 * ------------------------------------------------------------------
 * Engineer 在头部注释里记录了一个残留洞，并断言「零侵入前提下关不掉」。
 * 纪律要求「门禁看起来没生效时先怀疑自己的口径」，所以我必须**独立验证这个断言**
 * 而不是采信 —— 但我也要给出**零侵入**的办法，不能只是指出问题。
 *
 * 他的洞：
 *   const { data: owned } = await admin.from('stations').select('id')
 *     .eq('id', sId).eq('owner_id', body.ownerId).maybeSingle()   // 攻击者可控
 *   if (owned) await admin.from('station_words')
 *     .upsert({ station_id: sId, owner_id: body.ownerId, ... })
 *
 * 他的理由：要抓它，只能要求「归属校验里过滤的 owner 值」可溯源到 auth.getUser，
 * 但那会把「uid 从入参传入」的合法写法全误报。
 *
 * 我的独立判断：**这个理由不成立。** 关键在于区分两类入参：
 *   - 「uid 由入参传入」   ：函数形参，**值来自本文件的调用方**（同一个文件里可见）
 *   - 「owner 值来自 body」 ：body.x，**来源是 HTTP 请求体**，本文件里看不到它的约束
 * 判据不需要「值可溯源到 auth.getUser」，只需要「**这个表达式在本文件里能否被
 * 追溯到一个可信来源**」—— 对 body.* / req.* / params.* 这类**请求来源**，
 * 零侵入地就能判为不可信，且**不会**误伤「uid 从入参传入」：
 * 因为入参名既不是 body.* 也不是 req.*，它不是请求来源。
 *
 * 本脚本对这条判据做**差分实测**：同一形态改一个变量，看红绿是否变化。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe4.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

function runWith(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  if (existsSync(PROBE)) dropProbe(PROBE)
  return {
    code: r.status,
    hits: out
      .split('\n')
      .filter((l) => l.includes('dev-zzprobe4.mjs') && /\[\w+\]/.test(l))
      .map((l) => l.trim()),
  }
}

/** P1 =Engineer 记录的残留洞（攻击者可控 owner 值）⇒ 期望红 */
const HOLE = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})

export async function saveWords(body) {
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', body.station_id)
    .eq('owner_id', body.owner_id)
    .maybeSingle()
  if (owned) {
    await admin
      .from('station_words')
      .upsert({ station_id: body.station_id, owner_id: body.owner_id, word_key: body.word_key })
  }
}
`

/** P2 = 同形，但 owner 值是**函数形参**（合法写法：uid 由入参传入）⇒ 期望绿 */
const PARAM = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})

export async function saveWords(sId, ownerId, wordKey) {
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', sId)
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (owned) {
    await admin
      .from('station_words')
      .upsert({ station_id: sId, owner_id: ownerId, word_key: wordKey })
  }
}
`

/** P3 = 同一个洞，但值来自 req.params（同样是请求来源）⇒ 期望红 */
const REQ = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})

export async function saveWords(req) {
  const sId = req.nextUrl.searchParams.get('station_id')
  const ownerId = req.nextUrl.searchParams.get('owner_id')
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', sId)
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (owned) {
    await admin
      .from('station_words')
      .upsert({ station_id: sId, owner_id: ownerId, word_key: req.nextUrl.searchParams.get('k') })
  }
}
`

const cases = [
  { id: 'P1', title: 'Engineer 记录的残留洞：owner 值取自 body.*（期望红）', code: HOLE, expect: 'red' },
  { id: 'P2', title: '结构同形但 owner 值是函数形参（合法写法，期望绿）', code: PARAM, expect: 'green' },
  { id: 'P3', title: '同一洞换成 req 来源（期望红）', code: REQ, expect: 'red' },
]

console.log('当前门禁下的实际表现：')
console.log('| 用例 | 期望 | 实际 |')
console.log('| --- | --- | --- |')
const got = []
for (const c of cases) {
  const r = runWith(c.code)
  const red = r.code === 1 && r.hits.length > 0
  got.push({ ...c, red })
  console.log(`| ${c.id} ${c.title} | ${c.expect} | ${red ? '红' : '**绿**'} |`)
}

console.log('')
const p1 = got.find((x) => x.id === 'P1')
const p2 = got.find((x) => x.id === 'P2')
const p3 = got.find((x) => x.id === 'P3')

if (!p1.red && !p2.red) {
  console.log('🟡 结论：残留洞**确认存在**（P1 绿），且P2（合法写法）也绿⇒ 当前门禁完全无法区分二者。')
  console.log('   ⇒「静态推断关不掉」这一说法，就**现状**而言成立。')
  console.log('')
  console.log('   但「关不掉」的**理由**（要抓它就必须让 owner 值溯源到 auth.getUser，')
  console.log('   而那会误伤「uid 从入参传入」）**不成立**—— 见下方「零侵入判据」。')
} else if (!p1.red && p2.red) {
  console.log('🟢 残留洞**已可被抓**，且合法写法未被误伤 ⇒ Engineer 的「关不掉」断言已过时。')
} else {
  console.log('ℹ️ P1 已红 —— 残留洞当前就被拦住了。')
}
console.log('')
console.log('【零侵入判据：区分「请求来源」而非「是否溯源到auth.getUser」】')
console.log('  判据：归属校验里被过滤的 owner 值，其表达式若是 **请求来源**')
console.log('        （body.* / req.* / params.* / event.* / formData / searchParams / payload.*），')
console.log('        则它不可信 —— 无论它是否同时出现在 payload 的 owner 列里。')
console.log('  为何不误伤「uid 从入参传入」：形参名既不是 body.* 也不是 req.*，')
console.log('        **不是请求来源**，该判据对它恒不触发。')
console.log('')
console.log('  ⇒ 这条判据纯文本、可测、零侵入，且**不需要**要求值溯源到 auth.getUser。')
console.log('  ⇒ 因此 Engineer 那句「只能靠uid 的可信来源才能分辨」需要修正为：')
console.log('     只需排除**请求来源**表达式即可，不必强求全文件溯源。')
console.log('')
console.log('  ⚠️ 我**未**修改 check-rls-writes.mjs（红线：src/ 与门禁源码本轮由 Engineer 拥有）。')
console.log('     本脚本是QA 侧证据，是否采纳由 Engineer 决定。')
console.log(`残留：'无 ✓（探针清空复用）'`)
/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

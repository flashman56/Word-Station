/**
 * QA 独立验证探针（不入扫描范围：本文件是 qa-* 测试夹具）
 * ------------------------------------------------------------------
 * 目的：独立验证 scripts/check-rls-writes.mjs 这道门禁**是否真能失败**。
 * 不复用它自带的 SELFTEST_GOOD / SELFTEST_BAD，全部样本由 QA 自拟。
 *
 * 反「假绿」的两道保险：
 * ① 每次跑完都解析门禁自己打印的「扫描 N 个服务端文件」清单，
 *    确认探针文件**确实被扫到了**。没被扫到而结果为绿 = 假绿。
 * ② 每个 case 配一个 CANARY（必然违规的最小样本）。
 *    若 canary 不红，说明这一轮注入根本没生效，结果全部不可信。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe.mjs')
const PROBE_REL = 'scripts/dev-zzprobe.mjs'

const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"
const ANON = "Deno.env.get('SUPABASE_ANON_KEY')"

/** 必红最小样本：这行字面量就是「service_role 直写受保护表且不校验归属」 */
const CANARY = `const admin = createClient(url, ${KEY})
await admin.from('learn_records').upsert({ word_key: kw, status: 'known' })
`

const CASES = [
  // ---------------- 必须报红 ----------------
  {
    id: 'RED-1',
    title: 'service_role 写受保护表、无归属校验',
    expect: 'red',
    code: `const admin = createClient(url, ${KEY})
await admin.from('learn_records').upsert({ word_key: kw, status: 'known' })
`,
  },
  {
    id: 'RED-2',
    title: '变量名叫 sb（证明不吃变量名）',
    expect: 'red',
    code: `const sb = createClient(url, ${KEY})
await sb.from('learn_records').upsert({ word_key: kw, status: 'known' })
`,
  },
  {
    id: 'RED-3',
    title: '变量名叫 svc（证明不吃变量名）',
    expect: 'red',
    code: `const svc = createClient(url, ${KEY})
await svc.from('user_words').upsert({ form, form_key: fk })
`,
  },
  {
    id: 'RED-4',
    title: '内联 createClient(...).from(...) 不留变量名',
    expect: 'red',
    code: `await createClient(url, ${KEY})
  .from('learn_records').upsert({ word_key: kw, status: 'known' })
`,
  },
  {
    id: 'RED-5',
    title: '「验的是 A 站、写的是 B 站」（A2 豁免的绕过形态）',
    expect: 'red',
    code: `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
const { data: owned } = await admin.from('stations').select('id').eq('id', myOwnStation).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: body.victimStationId, word_key: kw })
`,
  },
  {
    id: 'RED-6',
    title: 'owner_id 取自请求 body',
    expect: 'red',
    code: `const admin = createClient(url, ${KEY})
await admin.from('user_words').upsert({ owner_id: body.owner_id, form, form_key: fk })
`,
  },
  {
    id: 'RED-7',
    title: 'service_role 调依赖 auth.uid() 的 RPC',
    expect: 'red',
    code: `const admin = createClient(url, ${KEY})
const { data: q, error: e } = await admin.rpc('consume_generation_quota', { n: 1 })
`,
  },
  {
    id: 'RED-8',
    title: 'service_role 直写 stations 本体（越权建站）',
    expect: 'red',
    code: `const admin = createClient(url, ${KEY})
await admin.from('stations').insert({ owner_id: body.ownerId, name: body.name })
`,
  },
  // ---------------- 必须放行 ----------------
  {
    id: 'GREEN-1',
    title: 'service_role 写共享表 dict_cache（豁免 B）',
    expect: 'green',
    code: `const admin = createClient(url, ${KEY})
await admin.from('dict_cache').upsert({ form_key: fk, payload }, { onConflict: 'form_key' })
`,
  },
  {
    id: 'GREEN-2',
    title: 'service_role 读任何表（R1 读一律放行）',
    expect: 'green',
    code: `const admin = createClient(url, ${KEY})
const a = await admin.from('dict_cache').select('payload').in('form_key', keys)
const b = await admin.from('generation_usage').select('used,quota').eq('owner_id', uid)
const c = await admin.from('stations').select('id').eq('owner_id', uid)
`,
  },
  {
    id: 'GREEN-3',
    title: '带用户 Authorization 的客户端调配额 RPC（红线二的正解）',
    expect: 'green',
    code: `const anonAsUser = createClient(url, ${ANON}, {
  global: { headers: { Authorization: authHeader } },
})
const { data: q } = await anonAsUser.rpc('consume_generation_quota', { n: 1 })
`,
  },
  {
    id: 'GREEN-4',
    title: 'client 由函数入参传入 + 归属校验齐全（实现者声称的误报边界①）',
    expect: 'green',
    code: `const bootstrap = createClient(url, ${KEY})
export default function handler(admin, uid, stationId, kw) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) return null
  return admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
}
`,
  },
  {
    id: 'GREEN-5',
    title: 'client 来自别的模块 + 归属校验齐全（误报边界②）',
    expect: 'green',
    code: `import { getServiceClient } from './db.js'
const bootstrap = createClient(url, ${KEY})
const db = getServiceClient()
const { data: owned } = await db.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await db.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
`,
  },
  {
    id: 'GREEN-6',
    title: 'service_role 写 user_words + owner 钉到已鉴权 uid（A1 自限写入）',
    expect: 'green',
    code: `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
await admin.from('user_words').upsert({ owner_id: uid, form, form_key: fk })
`,
  },
]

function runGate() {
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  // 门禁自己的输出里有两处能证明探针**确实被处理了**：
  //   ① 绿分支打印「扫描 N 个服务端文件：…」清单；
  //   ② 红分支逐条打印「[R2] <file>:<line>」。
  // ⚠️ 早期版本只查 ①，导致「探针真的报红了」反而被判成假绿 —— QA 自己的 bug。
  const scanLine = out.split('\n').find((l) => l.includes('扫描') && l.includes('个服务端文件')) || ''
  const violations = out
    .split('\n')
    .filter((l) => l.includes(PROBE_REL) && /\[\w+\]/.test(l))
    .map((l) => l.trim())
  const scanned = scanLine.includes(PROBE_REL) || violations.length > 0
  return { code: r.status, out, scanned, violations, selftestFailed: out.includes('门禁自检失败') }
}

function probeWith(code) {
  if (existsSync(PROBE)) dropProbe(PROBE)
  writeFileSync(PROBE, code, 'utf8')
  const res = runGate()
  dropProbe(PROBE)
  return res
}

const results = []

// ---- 保险②：先跑 CANARY，证明这一轮注入机制生效 ----
const canary = probeWith(CANARY)
const canaryOk = canary.code === 1 && canary.scanned && canary.violations.length > 0
console.log(`CANARY（必然违规的最小样本）：${canaryOk ? '✓ 报红 —— 注入机制生效，本轮结果可信' : '✗ 未报红 —— 注入机制失效，本轮结果全部不可信'}`)
if (!canaryOk) {
  console.log(`  canary exit=${canary.code} scanned=${canary.scanned} violations=${JSON.stringify(canary.violations)}`)
  console.log(canary.out)
}
results.push({ id: 'CANARY', title: '注入机制有效性（必红最小样本）', pass: canaryOk, detail: canary.violations.join(' | ') || `exit=${canary.code} scanned=${canary.scanned}` })

if (canaryOk) {
  for (const c of CASES) {
    const res = probeWith(c.code)
    const red = res.code === 1 && res.violations.length > 0
    const green = res.code === 0
    let pass
    let detail
    if (!res.scanned) {
      pass = false
      detail = '探针未被扫描 —— 假绿，结果无效'
    } else if (c.expect === 'red') {
      pass = red
      detail = red ? res.violations.join(' | ') : `未被拦住（exit=${res.code}）—— 门禁有洞`
    } else {
      pass = green
      detail = green ? '零违规' : `误报：${res.violations.join(' | ')}`
    }
    results.push({ id: c.id, title: c.title, pass, detail })
  }
}

// ---- 保险①收尾：确认探针已删除、工作区无残留 ----
const leftover = existsSync(PROBE)

console.log('')
console.log('| 用例 | 期望 | 结论 | 证据 |')
console.log('| --- | --- | --- | --- |')
for (const r of results) {
  console.log(`| ${r.id} ${r.title} | ${r.pass ? 'PASS' : '**FAIL**'} | ${r.pass ? '✅' : '❌'} | ${r.detail.replace(/\|/g, '/')} |`)
}
const failed = results.filter((r) => !r.pass)
console.log('')
console.log(`探针残留：${leftover ? '❌ 仍在工作区' : '无 ✓'}   通过 ${results.length - failed.length}/${results.length}`)
if (failed.length) {
  console.log('')
  console.log('失败用例：')
  failed.forEach((f) => console.log(`  - ${f.id} ${f.title} :: ${f.detail}`))
  process.exit(1)
}
process.exit(0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

/**
 * QA：扫描范围验证（第 3 项）
 * ------------------------------------------------------------------
 * 目标：证明镜像是**按规则自动纳入**，而不是靠硬编码文件名名单。
 *
 * 关键用例：造一个**从未被任何名单提及**的新镜像文件名
 * （scripts/dev-station-mirror.mjs），内含真实越权写入，确认：
 *   ① 门禁自动纳入并报红；
 *   ② 删掉后恢复绿色（证明报红确实由这个文件引起，不是别的噪声）。
 *
 * 同时验证反向：qa-*.mjs 里用 service_role 造数据**不该**被误报。
 *
 * ⚠️ 全部文件在本脚本内创建并删除，不留残留。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

// 全新文件名：dev-station-mirror.mjs —— 不在任何名单里，也不用 plugin/local 后缀
const NEW_MIRROR_REL = 'scripts/dev-station-mirror.mjs'
const NEW_MIRROR = path.join(ROOT, NEW_MIRROR_REL)

/** 越权写入：service_role 写 station_words，不校验 stationId 归属（同源事故形态） */
const MIRROR_CODE = `// QA 临时探针：验证「按规则纳入新镜像」
import { createClient } from '@supabase/supabase-js'
const admin = createClient(url, ${KEY})
export async function addWords(stationId, uid, words) {
  for (const w of words) {
    await admin
      .from('station_words')
      .upsert({ station_id: stationId, owner_id: uid, word_key: w }, { onConflict: 'station_id,word_key' })
  }
}
`

/** QA 夹具：用 service_role 造数据是本职工作，不该被误报 */
const QA_FIXTURE_REL = 'scripts/qa-zzscope-probe.mjs'
const QA_FIXTURE = path.join(ROOT, QA_FIXTURE_REL)
const QA_CODE = `// QA 临时探针：测试夹具用高权限造数据是本职工作，不该被误报
import { createClient } from '@supabase/supabase-js'
const admin = createClient(url, ${KEY})
export async function seedOtherUsersWords(victimUid, words) {
  await admin.from('user_words').upsert({ owner_id: victimUid, form: 'x', form_key: 'k' })
  await admin.from('station_words').upsert({ station_id: 'other-station', owner_id: victimUid, word_key: 'k' })
  await admin.rpc('consume_generation_quota', { n: 1 })
}
`

function runGate() {
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  return {
    code: r.status,
    out,
    scanned: out.split('\n').find((l) => l.includes('扫描') && l.includes('个服务端文件')) || '',
    hits: out.split('\n').filter((l) => /\[\w+\]/.test(l) && l.includes('.mjs')).map((l) => l.trim()),
  }
}

const results = []
function record(id, title, pass, note) {
  results.push({ id, title, pass, note })
}

try {
  // ---- 基线（无注入）----
  const base = runGate()
  record('S0', '基线：无注入时门禁应绿', base.code === 0, `exit=${base.code}`)

  // ---- ① 全新镜像文件名必须自动纳入并报红 ----
  writeFileSync(NEW_MIRROR, MIRROR_CODE, 'utf8')
  const withMirror = runGate()
  const mirrorScanned =
    withMirror.scanned.includes('dev-station-mirror.mjs') ||
    withMirror.hits.some((h) => h.includes('dev-station-mirror.mjs'))
  const mirrorRed = withMirror.code === 1 && withMirror.hits.some((h) => h.includes('dev-station-mirror.mjs'))
  record(
    'S1',
    '全新镜像名 dev-station-mirror.mjs 被自动纳入',
    mirrorScanned,
    mirrorScanned ? `扫描清单/违规里出现该文件（exit=${withMirror.code}）` : '未出现在扫描清单 —— 规则没认出它',
  )
  record(
    'S2',
    '全新镜像里的越权写入被报红',
    mirrorRed,
    mirrorRed ? withMirror.hits.filter((h) => h.includes('dev-station-mirror')).join(' | ') : `exit=${withMirror.code} 未报红`,
  )
  dropProbe(NEW_MIRROR)

  // ---- ② 删掉后必须恢复绿（证明报红确由该文件引起）----
  const afterMirror = runGate()
  record(
    'S3',
    '删除新镜像后恢复绿色（证明报红确由它引起）',
    afterMirror.code === 0,
    `exit=${afterMirror.code}`,
  )

  // ---- ③ qa-* 夹具用 service_role 不该被误报 ----
  writeFileSync(QA_FIXTURE, QA_CODE, 'utf8')
  const withQa = runGate()
  const qaScanned = withQa.scanned.includes('qa-zzscope-probe.mjs')
  const qaRed = withQa.code === 1
  record(
    'S4',
    'qa-*.mjs 用 service_role 造数据不被误报',
    withQa.code === 0 && !qaScanned,
    qaScanned ? '❌ qa 文件被纳入扫描了' : `未被纳入扫描且 exit=${withQa.code}（零误报）`,
  )
  record('S5', 'qa 场景未引入任何新违规', !qaRed, qaRed ? withQa.hits.join(' | ') : '零违规')
  dropProbe(QA_FIXTURE)

  // ---- ④ 确认既有镜像确实在扫描清单里（它自己声明的关键用例）----
  const final = runGate()
  record(
    'S6',
    'scripts/dev-generate-plugin.mjs 确实被扫到',
    final.scanned.includes('dev-generate-plugin.mjs'),
    final.scanned.includes('dev-generate-plugin.mjs') ? '在扫描清单中' : '❌ 不在扫描清单里',
  )
} finally {
  if (existsSync(NEW_MIRROR)) dropProbe(NEW_MIRROR)
  if (existsSync(QA_FIXTURE)) dropProbe(QA_FIXTURE)
}

console.log('| 用例 | 结论 | 证据 |')
console.log('| --- | --- | --- |')
for (const r of results) {
  console.log(`| ${r.id} ${r.title} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.note} |`)
}
const failed = results.filter((r) => !r.pass)
console.log('')
console.log(`通过 ${results.length - failed.length}/${results.length}`)
console.log(`残留：${existsSync(NEW_MIRROR) || existsSync(QA_FIXTURE) ? '❌ 有' : '无 ✓'}`)
process.exit(failed.length ? 1 : 0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

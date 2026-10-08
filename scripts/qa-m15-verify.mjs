/**
 * QA：M15 复核 —— A2 豁免的「owner 列匹配」被拆掉后，自检是否真的抓不到？
 * 若真抓不到，说明**存在一种越权写法门禁会放行，且自检无法发现**。
 *
 * 这里不只跑变异体，而是**直接用真实门禁源码 + 绕过样本**做端到端验证：
 * 绕过样本 = 「查了父表 stations，但只按 id 过滤，没按 owner_id 过滤」
 *         —— 这正是「验的是 A 站 / 根本不是自己的站」的弱化形态。
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const MUT_FILE = path.join(ROOT, 'scripts', 'qa-rls-mutant.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe.mjs')

const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"
const LF = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')

/** 绕过形态：查了 stations，但**只按主键过滤、没按 owner 过滤** ⇒ 不构成归属校验 */
const BYPASS = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
const { data: st } = await admin.from('stations').select('id').eq('id', body.victimStationId).maybeSingle()
if (!st) throw new Error('STATION_NOT_FOUND')
await admin.from('station_words').upsert({ station_id: body.victimStationId, owner_id: uid, word_key: kw })
`

/**
 * 「变异体是否被杀」的判定口径。
 *
 * ⚠️ QA 第一版口径是错的（Engineer 58886dd 指出的，现修）：
 *   原判据 `pass: mutated.probeHit` —— 只认「探针文件被报红」。
 *   但门禁的**自检在扫描真实文件之前就退出**了：变异版一进main 就因
 *   「门禁自检失败」exit=1，探针文件根本没被扫到 ⇒ probeHit=false。
 *   ⇒变异体明明**已经被杀死**（门禁确实抓到了判据腐化），却被记成「存活」。
 *   这是把「被杀的方式」当成了「是否被杀」——口径错误，不是门禁问题。
 *
 * 正确口径：**exit≠0 且不是崩溃**即算被杀（与 qa-rls-mutation.mjs 一致）。
 * 崩溃必须排除：进程挂掉也算 exit≠0，但那是 QA 副本放错位置导致的假象。
 */
function killed(res) {
  const crashed =
    res.code !== 0 &&
    /(?:Error|TypeError|ReferenceError|SyntaxError|ENOENT|at\s+\w+\s+\()/.test(res.out) &&
    !res.selftestFailed
  return { isKilled: res.code !== 0 && !crashed, crashed }
}

function runGate() {
  const r = spawnSync(process.execPath, [MUT_FILE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  return {
    code: r.status,
    out,
    selftestFailed: out.includes('门禁自检失败'),
    probeHit: out.split('\n').some((l) => l.includes('dev-zzprobe.mjs') && /\[\w+\]/.test(l)),
  }
}

function withProbe(code, gateSource) {
  writeFileSync(MUT_FILE, gateSource, 'utf8')
  writeFileSync(PROBE, code, 'utf8')
  const res = runGate()
  dropProbe(PROBE)
  dropProbe(MUT_FILE)
  return res
}

const results = []

// ---- 对照组：原版门禁 + 绕过样本 ----
const orig = withProbe(BYPASS, LF)
results.push({
  id: 'B0',
  title: '对照组：原版门禁 + 弱化归属校验样本',
  note: orig.probeHit
    ? '报红（预期：它认得出这是越权）'
    : `exit=${orig.code} 未报红 —— 原版门禁就抓不到，绕过已存在`,
  pass: orig.probeHit,
})
if (orig.probeHit) {
  results[0].note += ' → ' + orig.out.split('\n').find((l) => l.includes('dev-zzprobe')).trim()
}

// ---- 变异组：拆掉 owner 列匹配后 + 同一个绕过样本 ----
const MUT = LF.replace(
  '          if (ownerMatched && qChain.text.includes(fkValue)) {',
  '          if (qChain.text.includes(fkValue)) { //mut',
)
console.log('M15 变异是否生效：', MUT !== LF)
const mutated = withProbe(BYPASS, MUT)
const mutKill = killed(mutated)
results.push({
  id: 'B1',
  title: '变异组：拆掉 A2 的 owner 列匹配 + 同一个绕过样本',
  note: mutKill.crashed
    ? '⚠️ 崩溃，不计杀'
    : mutKill.isKilled
      ? `已被杀死：exit=${mutated.code}` +
        (mutated.selftestFailed ? '（自检转红 ⇒ 判据腐化被自检抓到）' : '') +
        (mutated.probeHit ? ' + 探针也被报红' : ' + 探针未被报红（自检先退出）')
      : `exit=${mutated.code} 未被杀（自检也未报错：${mutated.selftestFailed}）`,
  pass: mutKill.isKilled,
})

console.log('')
console.log('| 场景 | 结论 | 说明 |')
console.log('| --- | --- | --- |')
for (const r of results) {
  console.log(`| ${r.id} ${r.title} | ${r.pass ? '✅' : '❌'} | ${r.note} |`)
}
const holeConfirmed = results[0].pass && !results[1].pass
const blindSpotFixed = results[0].pass && results[1].pass
console.log('')
if (holeConfirmed) {
  console.log('🔴 确认存在自检盲区：')
  console.log('   A2 豁免的「owner 列匹配」一旦失效，门禁会把「只按主键查了父表」当成归属校验并放行，')
  console.log('   而 SELFTEST_BAD / SELFTEST_GOOD 里没有任何样本覆盖这个形态 ⇒ 自检不会报警。')
  console.log('   ⇒ 门禁「全绿」在这个方向上不可信。')
} else if (blindSpotFixed) {
  console.log('🟢 上一轮的自检盲区已修复：')
  console.log('   原版门禁能报红这个弱化形态（对照组红）；')
  console.log('   拆掉 owner 列匹配后变异体**也被杀死**⇒ ownerMatched 这条判据现在有自检样本覆盖，')
  console.log('   不再是「拆掉仍全绿」的盲区。')
} else {
  console.log('🟡 原版门禁本身就抓不到该弱化形态（与变异无关）—— 需按真实漏洞处理。')
}
console.log(`残留：${existsSync(MUT_FILE) || existsSync(PROBE) ? '❌ 有' : '无 ✓'}`)
process.exit(holeConfirmed ? 1 : 0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

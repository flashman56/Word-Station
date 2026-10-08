/**
 * QA：部署预检验证（第 4 项）
 * ------------------------------------------------------------------
 * 目标：门禁失败时，`deploy-generate-fn.mjs --dry-run` 必须
 *      **在任何写操作之前** BLOCKED。
 *
 * 做法：往镜像里注入一处越权写入 → 跑 --dry-run → 断言：
 *   ① exit != 0；
 *   ② 输出含 BLOCKED 且提到 test:rls；
 *   ③ 输出里**不含**任何写操作痕迹（secrets set / functions deploy / 真正调用 CLI 的步骤）。
 *
 * ⚠️ 全程 --dry-run，绝不真正部署；绝不打印 .env.local 里的任何密钥。
 */
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEPLOY = path.join(ROOT, 'scripts', 'deploy-generate-fn.mjs')
const MIRROR = path.join(ROOT, 'scripts', 'dev-generate-plugin.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

const original = readFileSync(MIRROR, 'utf8')
const results = []
const rec = (id, title, pass, note) => results.push({ id, title, pass, note })

/**
 * 越权写入：service_role 直写 station_words，不校验 stationId 归属。
 * ⚠️ QA 第一版写成 `station_id: stationId, owner_id: uid` —— 那个形态**合法**：
 *   owner_id 钉到已鉴权 uid（豁免 A1 成立）⇒ 门禁正确地放行，deploy 也正确地没阻断。
 *   那是 QA 样本写错，不是门禁的错。
 *   现在改用**攻击者可控**的 victimStationId（换名字 ⇒ A2 匹配不上），
 *   这才是真正的越权形态。
 */
const INJECT = `
export async function qaInjectedPrivilegeEscalation(victimStationId, wordKey) {
  const admin = createClient(url, ${KEY})
  await admin.from('station_words').upsert({
    station_id: victimStationId,
    owner_id: body.owner_id,
    word_key: wordKey,
  })
}
`

function runDeploy() {
  const r = spawnSync(process.execPath, [DEPLOY, '--dry-run'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }
}

try {
  // ---- A. 基线：门禁通过时 --dry-run 应正常继续（走到 DRY RUN 结束）----
  const base = runDeploy()
  rec(
    'D1',
    '基线：门禁通过时 --dry-run 正常走完预检',
    base.code === 0 && base.out.includes('DRY RUN 结束'),
    `exit=${base.code}，${base.out.includes('DRY RUN 结束') ? '走到 dry-run 末尾' : base.out.slice(-200).replace(/\n/g, ' ')}`,
  )
  rec('D2', '基线：门禁通过时不报 BLOCKED', !base.out.includes('BLOCKED'), base.out.includes('BLOCKED') ? '❌ 误报 BLOCKED' : '无 BLOCKED')

  // ---- B. 注入越权写入 ----
  writeFileSync(MIRROR, original + INJECT, 'utf8')

  // 先确认门禁本身确实红了（否则下一条是假绿）
  const gate = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-rls-writes.mjs')], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  const gateRed = gate.status !== 0
  rec('D3', '注入后门禁自身报红（保证后续不是假绿）', gateRed, `exit=${gate.status}`)

  const blocked = runDeploy()

  rec(
    'D4',
    '注入越权后 --dry-run 被 BLOCKED（exit != 0）',
    blocked.code !== 0,
    `exit=${blocked.code}`,
  )
  rec(
    'D5',
    'BLOCKED 原因明确指向红线门禁',
    blocked.out.includes('BLOCKED') && blocked.out.includes('test:rls'),
    blocked.out.includes('BLOCKED') ? '输出含 BLOCKED + test:rls' : '❌ 未见 BLOCKED',
  )
  // 关键：写操作一步都不能执行到
  const reachedDryRunEnd = blocked.out.includes('DRY RUN 结束')
  rec(
    'D6',
    '在任何写操作之前 BLOCKED（未走到 dry-run 末尾 = 未进入部署流程）',
    !reachedDryRunEnd,
    reachedDryRunEnd ? '❌ 竟然走到了 DRY RUN 结束' : '未到达 dry-run 末尾',
  )
  const wroteSecret = /secrets\s+set/i.test(blocked.out)
  const deployedFn = /functions\s+deploy/i.test(blocked.out)
  rec('D7', '未执行 secrets set / functions deploy', !wroteSecret && !deployedFn, `secrets set=${wroteSecret} functions deploy=${deployedFn}`)

  // ---- C. 还原后必须恢复绿 ----
  writeFileSync(MIRROR, original, 'utf8')
  const restored = runDeploy()
  rec(
    'D8',
    '还原镜像后 --dry-run 恢复正常（证明阻断确由注入引起）',
    restored.code === 0 && !restored.out.includes('BLOCKED'),
    `exit=${restored.code}`,
  )
} finally {
  writeFileSync(MIRROR, original, 'utf8')
  if (existsSync(MIRROR)) {
    const now = readFileSync(MIRROR, 'utf8')
    if (now !== original) console.error('❌ 镜像未能还原！')
  }
}

// 安全检查：确认输出里没有泄露密钥
const allOut = results.map((r) => r.note).join(' ')
const leak = /(sbp_[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{10,}|eyJ[A-Za-z0-9_-]{20,})/.test(allOut)
rec('D9', '测试过程中未泄露任何密钥', !leak, leak ? '❌ 输出疑似含密钥' : '未发现密钥样式字符串')

console.log('| 用例 | 结论 | 证据 |')
console.log('| --- | --- | --- |')
for (const r of results) {
  console.log(`| ${r.id} ${r.title} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.note} |`)
}
const failed = results.filter((r) => !r.pass)
console.log('')
console.log(`通过 ${results.length - failed.length}/${results.length}`)
process.exit(failed.length ? 1 : 0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

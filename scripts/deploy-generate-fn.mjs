#!/usr/bin/env node
/**
 * 部署 Edge Function `generate-word`（runbook 级脚本）
 * -----------------------------------------------------------------------------
 * 做两件事：
 *   ① 把 DEEPSEEK_API_KEY 写成 Supabase Edge Function secret
 *   ② 部署 supabase/functions/generate-word
 *
 * 硬性安全约束（本脚本自身的设计红线）：
 *   - DEEPSEEK_API_KEY 只从 .env.local 读，绝不硬编码、绝不打日志；
 *   - 不把 key 放进命令行参数（会进 shell history 与 `ps` 的 argv），
 *     改为写一个只含该 key 的临时 env-file，用 `--env-file` 传给 CLI，用完即删；
 *   - 所有子进程输出都经过 redact() 过滤后才打印。
 *
 * 认证判据（重要）：
 *   「能不能部署」以 **CLI 自身的认证状态**为准，而不是「我们能不能读到 token 文件」。
 *   新版 CLI 可能把凭证存在系统凭据库等我们读不到的位置，此时文件读不到 ≠ 未登录。
 *   所以流程是：先尝试显式 token（命中即用），读不到就退化为只读探测
 *   `projects list --output json`（60s 超时、不触发交互、不写入），
 *   两者都不成立才 BLOCKED。
 *
 * Access Token 的两个显式来源（按优先级）：
 *   ① 环境变量 SUPABASE_ACCESS_TOKEN
 *   ② Supabase CLI 登录态文件（旧版 CLI 的产物）
 *      Windows: %USERPROFILE%\.supabase\access-token
 *      POSIX:   ~/.supabase/access-token
 *   仅打印来源、长度与 3 字符前缀，绝不打印 token 本身。
 *
 * 前置条件（下列任一即可，通常什么都不用做）：
 *   npx supabase login
 *   # 或：supabase.com → Account → Access Tokens 生成 sbp_xxx，再 export
 *   export SUPABASE_ACCESS_TOKEN=sbp_xxx
 *
 * CLI 版本要求：`--use-api` 需要 Supabase CLI ≥ 2.13.3，脚本会在预检阶段前置校验。
 *
 * 用法：
 *   node scripts/deploy-generate-fn.mjs              # 设 secret + 部署
 *   node scripts/deploy-generate-fn.mjs --dry-run    # 只做预检，不调 CLI
 *   node scripts/deploy-generate-fn.mjs --skip-secret # 跳过设 secret（key 未变时）
 *   node scripts/deploy-generate-fn.mjs --use-api    # 见下方「重要」一节
 *
 * 文档：docs/DEPLOY-EDGE-FUNCTION.md
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ENV_LOCAL = path.join(ROOT, '.env.local')
const CONFIG_TOML = path.join(ROOT, 'supabase', 'config.toml')
const FUNCTION_NAME = 'generate-word'
const SECRET_NAME = 'DEEPSEEK_API_KEY'

/** Supabase CLI 登录态文件（`supabase login` 写入、CLI 自身也读取）。 */
const CLI_TOKEN_FILE = path.join(os.homedir(), '.supabase', 'access-token')
/** `--use-api` 所需的最低 CLI 版本。 */
const MIN_CLI_VERSION = [2, 13, 3]

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_SECRET = argv.includes('--skip-secret')
const USE_API = argv.includes('--use-api')

/** 从 .env.local 读单个变量；不打印值。 */
function readEnvLocal(name) {
  if (!fs.existsSync(ENV_LOCAL)) return ''
  const line = fs
    .readFileSync(ENV_LOCAL, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${name}=`))
  if (!line) return ''
  return line
    .slice(line.indexOf('=') + 1)
    .trim()
    .replace(/^["']|["']$/g, '')
}

/** 需要脱敏的敏感串集合（仅内存，不落盘、不输出）。 */
const SECRETS = new Set()

/**
 * 尝试解析 Access Token，两个来源按优先级：
 *   ① 环境变量 SUPABASE_ACCESS_TOKEN
 *   ② Supabase CLI 登录态文件（旧版 CLI 的产物）
 *
 * 返回 { token, source } 或 null（两个来源都没有可用 token）。
 * ⚠️ 返回 null **不等于**无法部署：新版 CLI 可能把凭证放在我们读不到的位置
 * （系统凭据库等），此时由 probeCliAuth() 探测 CLI 自身的认证状态。
 * 任何分支都不会打印 token 本身。
 */
function resolveAccessToken() {
  const fromEnv = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  if (fromEnv) return { token: fromEnv, source: '环境变量 SUPABASE_ACCESS_TOKEN' }

  if (!fs.existsSync(CLI_TOKEN_FILE)) return null

  // CLI 写文件时带结尾换行；不 trim 会得到一个「看起来像错 token」的认证失败。
  const raw = fs.readFileSync(CLI_TOKEN_FILE, 'utf8')
  const fromFile = raw.trim()
  if (!fromFile) {
    console.log(`⚠ CLI 登录态文件存在但是空的，已忽略：${CLI_TOKEN_FILE}`)
    console.log('  （文件写入可能被截断。若下面的 CLI 认证探测失败，请重跑 npx supabase login）')
    return null
  }
  if (!fromFile.startsWith('sbp_')) {
    // 不再直接退出：文件坏掉不代表没登录，交给 CLI 探测定夺。
    console.log(`⚠ CLI 登录态文件内容不合法（不以 sbp_ 开头），已忽略：${CLI_TOKEN_FILE}`)
    console.log(`  （读到的长度 ${fromFile.length}，前缀 "${fromFile.slice(0, 3)}"。该文件可能已损坏）`)
    return null
  }
  return { token: fromFile, source: 'CLI 登录态文件' }
}

/** 探测超时：只读命令也要设上限，避免预检永远挂住。 */
const PROBE_TIMEOUT_MS = 60_000

/**
 * 探测 CLI 自身的认证状态——这是「能不能部署」的唯一权威判据。
 *
 * 用 `projects list --output json`：只读、不触发交互授权、不写任何东西。
 * 判定只看 exit code 与能否解析出项目数组，**不看 stderr**
 * （未 link 项目时 CLI 会往 stderr 写 "Cannot find project ref"，与认证无关）。
 *
 * 返回 { ok: true, count, hasProject } 或 { ok: false, reason }。
 */
function probeCliAuth({ cmd, prefix }) {
  const args = [...prefix, 'projects', 'list', '--output', 'json']
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: PROBE_TIMEOUT_MS,
  })

  if (res.error) {
    const timedOut = res.error.code === 'ETIMEDOUT'
    return { ok: false, reason: timedOut ? `探测超时（> ${PROBE_TIMEOUT_MS / 1000}s）` : `探测命令无法执行：${res.error.message}` }
  }
  const code = res.status === null ? 1 : res.status
  if (code !== 0) {
    const err = (res.stderr || '').trim().split('\n').filter(Boolean).slice(-3).join(' / ')
    return { ok: false, reason: `CLI 未认证或探测失败（exit ${code}）${err ? `：${redact(err)}` : ''}` }
  }

  // stdout 理论上就是 JSON；为容错，截取最外层 [ ... ]
  const out = res.stdout || ''
  const from = out.indexOf('[')
  const to = out.lastIndexOf(']')
  if (from === -1 || to <= from) return { ok: false, reason: '探测输出不是可解析的 JSON 项目列表' }
  let projects
  try {
    projects = JSON.parse(out.slice(from, to + 1))
  } catch {
    return { ok: false, reason: '探测输出的 JSON 解析失败' }
  }
  if (!Array.isArray(projects)) return { ok: false, reason: '探测输出不是 JSON 数组' }
  if (projects.length === 0) return { ok: false, reason: 'CLI 认证成功但该账号下没有任何项目' }

  return {
    ok: true,
    count: projects.length,
    hasProject: projects.some((p) => p && (p.ref === projectId || p.id === projectId)),
  }
}

/** 从 CLI `--version` 输出里解析主版本号，解析不出来返回 null。 */
function parseCliVersion(text) {
  const m = String(text).match(/(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** 比较 a 是否 >= b（逐段数值比较）。 */
function isAtLeast(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true
    if (a[i] < b[i]) return false
  }
  return true
}

/** 过滤掉任何敏感串后再输出。 */
function redact(text) {
  let out = String(text)
  for (const s of SECRETS) {
    if (s.length >= 8) out = out.split(s).join('***REDACTED***')
  }
  return out
}

function fail(msg, hint) {
  console.error(`\n✗ BLOCKED: ${msg}`)
  if (hint) console.error(`  ${hint}`)
  process.exit(1)
}

function step(n, total, title) {
  console.log(`\n[${n}/${total}] ${title}`)
  console.log('-'.repeat(60))
}

/** 运行一条命令；返回 exit code。子进程输出经脱敏后实时打印。 */
function run(cmd, cmdArgs, { allowFail = false } = {}) {
  console.log(`$ ${cmd} ${cmdArgs.map((a) => (a.startsWith('--env-file') ? '--env-file <tmp>' : a)).join(' ')}`)
  const res = spawnSync(cmd, cmdArgs, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })
  if (res.stdout) process.stdout.write(redact(res.stdout))
  if (res.stderr) process.stderr.write(redact(res.stderr))
  if (res.error) {
    console.error(`spawn 失败: ${redact(res.error.message)}`)
    return 127
  }
  const code = res.status === null ? 1 : res.status
  console.log(`exit code: ${code}`)
  if (code !== 0 && !allowFail) {
    console.error(`\n✗ 命令失败（exit ${code}）：${cmd} ${cmdArgs[0]}`)
    process.exit(code)
  }
  return code
}

/** 找到可用的 supabase CLI。 */
function resolveCli() {
  if (process.env.SUPABASE_CLI) return { cmd: process.env.SUPABASE_CLI, prefix: [] }
  const probe = spawnSync('supabase', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' })
  if (probe.status === 0) return { cmd: 'supabase', prefix: [] }
  return { cmd: 'npx', prefix: ['--yes', 'supabase@latest'] }
}

const TOTAL = 4

// -----------------------------------------------------------------------------
console.log('=== Edge Function generate-word 部署 ===')

// ① 预检：配置与代码
step(1, TOTAL, '预检：config.toml / 函数入口 / 依赖可解析性')

if (!fs.existsSync(CONFIG_TOML)) {
  fail('supabase/config.toml 不存在，CLI 无法确定 project_id。', '见 docs/DEPLOY-EDGE-FUNCTION.md')
}
const toml = fs.readFileSync(CONFIG_TOML, 'utf8')
const projectId = (toml.match(/^project_id\s*=\s*"([^"]+)"/m) || [])[1]
console.log(`config.toml: OK（project_id = ${projectId || '未设置!'}）`)
if (!projectId) fail('config.toml 缺少 project_id。')

if (!/verify_jwt\s*=\s*true/.test(toml)) {
  fail('[functions.generate-word] verify_jwt 不为 true。未登录用户将能直接调用本函数烧 DeepSeek 额度。')
}
console.log('verify_jwt = true: OK')

const entry = path.join(ROOT, 'supabase', 'functions', FUNCTION_NAME, 'index.ts')
if (!fs.existsSync(entry)) fail(`函数入口不存在：${entry}`)
console.log(`函数入口: OK（supabase/functions/${FUNCTION_NAME}/index.ts）`)

// 依赖解析：morphemes.js 在 supabase/ 之外，默认 Docker 打包不会带上它
const morphemes = path.resolve(path.dirname(entry), '../../../src/data/morphemes.js')
const escapesSupabase = !morphemes.startsWith(path.join(ROOT, 'supabase') + path.sep)
console.log(`\n⚠ 依赖检查：index.ts 引用了 supabase/ 之外的文件`)
console.log(`   ${path.relative(ROOT, morphemes)}（${fs.existsSync(morphemes) ? fs.statSync(morphemes).size : 0} bytes）`)
if (escapesSupabase) {
  console.log('   → 默认（Docker）打包只上传 supabase/ 目录，部署会 400 "Module not found"。')
  console.log('   → 必须加 --use-api 部署，或把该数据文件复制进 supabase/functions/_shared/。')
}
if (!USE_API && escapesSupabase && !DRY_RUN) {
  fail(
    'index.ts 的本地依赖逃出了 supabase/ 目录，直接 deploy 一定失败。',
    '改用：node scripts/deploy-generate-fn.mjs --use-api',
  )
}

// ② 预检：认证 + CLI 版本
step(2, TOTAL, '预检：认证与 CLI 版本（值一律不打印）')

const { cmd, prefix } = resolveCli()
const ver = spawnSync(cmd, [...prefix, '--version'], { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
const verText = (ver.stdout || ver.stderr || '').trim().split('\n')[0] || '未知'
console.log(`CLI: ${cmd} ${prefix.join(' ')} → ${verText}`)

// 认证：先试我们能直接读到的 token，读不到就问 CLI 自己。
const resolved = resolveAccessToken()
if (resolved) {
  console.log(`Access Token: OK（来自 ${resolved.source}，长度 ${resolved.token.length}，前缀 ${resolved.token.slice(0, 3)}…）`)
  console.log('（显式提供的 token 优先于 CLI 自身登录态）')
} else {
  console.log('Access Token: 环境变量与 CLI 登录态文件均未提供 → 改为探测 CLI 自身认证状态')
  console.log(`  $ ${cmd} ${prefix.join(' ')} projects list --output json   # 只读探测`)
  const probe = probeCliAuth({ cmd, prefix })
  if (probe.ok) {
    console.log(`CLI 认证：OK（由 CLI 自身登录态管理，可访问 ${probe.count} 个项目${probe.hasProject ? '，含本项目 ' + projectId : ''}）`)
    console.log('  （新版 CLI 可能把凭证存在系统凭据库等位置，读不到文件不代表未登录）')
  } else {
    fail(
      `无法确认 Supabase 认证状态：${probe.reason}`,
      [
        '本脚本读不到 token 文件、CLI 自身也认证失败，任选一种方式即可：',
        '  ① npx supabase login                # 交互式登录，登录态由 CLI 自己管理',
        '  ② supabase.com → Account → Access Tokens → Generate new token，复制 sbp_xxx，然后：',
        '     export SUPABASE_ACCESS_TOKEN=sbp_xxx',
        '  验证：npx --yes supabase@latest projects list',
      ].join('\n  '),
    )
  }
}

let deepseekKey = ''
if (!SKIP_SECRET) {
  deepseekKey = readEnvLocal(SECRET_NAME)
  if (!deepseekKey) {
    fail(`.env.local 里没有 ${SECRET_NAME}。`, `请在 ${path.relative(ROOT, ENV_LOCAL)} 中添加 ${SECRET_NAME}=sk-xxx（切勿加 VITE_ 前缀）`)
  }
  SECRETS.add(deepseekKey)
  console.log(`${SECRET_NAME}: 已从 .env.local 读取（长度 ${deepseekKey.length}，前缀 ${deepseekKey.slice(0, 3)}…）`)
} else {
  console.log(`${SECRET_NAME}: --skip-secret，跳过读取与设置`)
}

// `--use-api` 需要 CLI ≥ 2.13.3；提前失败，避免部署到一半才报看不懂的 flag 错误。
const parsedVer = parseCliVersion(verText)
if (parsedVer && !isAtLeast(parsedVer, MIN_CLI_VERSION)) {
  const found = parsedVer.join('.')
  const need = MIN_CLI_VERSION.join('.')
  fail(
    `Supabase CLI 版本过低：${found}，本项目部署需要 ≥ ${need}。`,
    [
      `${USE_API ? '你用了 --use-api，该参数自 ' : '本项目部署路径依赖 --use-api，该参数自 '}${need} 起才存在。`,
      '升级命令：',
      `  ${cmd === 'npx' ? 'npx --yes supabase@latest' : 'npm i -g supabase@latest && supabase --version'}`,
      '（本脚本在 SUPABASE_CLI 未设置时已自动走 npx supabase@latest，若仍报此错说明网络/缓存导致解析到了旧版本）',
    ].join('\n  '),
  )
}
if (parsedVer) {
  console.log(`CLI 版本: OK（${parsedVer.join('.')} ≥ ${MIN_CLI_VERSION.join('.')}）`)
} else {
  console.log(`CLI 版本: 无法从 "${verText}" 解析，跳过版本校验。`)
}

if (DRY_RUN) {
  console.log('\n=== DRY RUN 结束：未调用任何写操作命令 ===')
  console.log('去掉 --dry-run 即可真正部署。')
  process.exit(0)
}

// ③ 设 secret
if (!SKIP_SECRET) {
  step(3, TOTAL, `设置 Edge Function secret：${SECRET_NAME}`)
  // 只含该 secret 的临时 env-file：避免 key 出现在 argv / shell history 里
  const tmpEnv = path.join(os.tmpdir(), `supabase-secret-${process.pid}-${Date.now()}.env`)
  try {
    fs.writeFileSync(tmpEnv, `${SECRET_NAME}=${deepseekKey}\n`, { encoding: 'utf8', mode: 0o600 })
    run(cmd, [...prefix, 'secrets', 'set', '--env-file', tmpEnv, '--project-ref', projectId])
  } finally {
    fs.rmSync(tmpEnv, { force: true })
    console.log(`（临时 env-file 已删除：${path.basename(tmpEnv)}）`)
  }
} else {
  step(3, TOTAL, '设置 secret：已跳过（--skip-secret）')
}

// ④ 部署
step(4, TOTAL, `部署函数：${FUNCTION_NAME}`)
const deployArgs = [...prefix, 'functions', 'deploy', FUNCTION_NAME, '--project-ref', projectId]
if (USE_API) {
  deployArgs.push('--use-api')
  console.log('（--use-api：跳过 Docker，直接上传，保留 supabase/ 之外的本地依赖）')
}
run(cmd, deployArgs)

console.log('\n=== 部署完成 ===')
console.log('验证：')
console.log(`  curl -i -X POST "https://${projectId}.supabase.co/functions/v1/${FUNCTION_NAME}" \\`)
console.log(`    -H "Authorization: Bearer <用户 access_token>" -H "Content-Type: application/json" \\`)
console.log(`    -d '{"forms":["photosynthesis"]}'`)
console.log('回滚：')
console.log(`  ${cmd} ${prefix.join(' ')} functions delete ${FUNCTION_NAME} --project-ref ${projectId}`)

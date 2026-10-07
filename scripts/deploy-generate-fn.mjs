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
 *   - 所有子进程输出都经过 redact() 过滤后才打印；
 *   - 缺少 SUPABASE_ACCESS_TOKEN 或 key 时立刻退出，不做任何“降级尝试”。
 *
 * 前置条件（Access Token 在 supabase.com → Account → Access Tokens 生成）：
 *   export SUPABASE_ACCESS_TOKEN=sbp_xxx
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

// ② 预检：凭据
step(2, TOTAL, '预检：凭据（值一律不打印）')

const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
if (!token) {
  fail(
    '环境变量 SUPABASE_ACCESS_TOKEN 未设置。',
    '在 supabase.com → Account → Access Tokens 生成 sbp_ 开头的 token，然后 export SUPABASE_ACCESS_TOKEN=sbp_xxx',
  )
}
console.log(`SUPABASE_ACCESS_TOKEN: 已设置（长度 ${token.length}，前缀 ${token.slice(0, 3)}…）`)

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

const { cmd, prefix } = resolveCli()
const ver = spawnSync(cmd, [...prefix, '--version'], { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
console.log(`CLI: ${cmd} ${prefix.join(' ')} → ${(ver.stdout || ver.stderr || '').trim().split('\n')[0] || '未知'}`)

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

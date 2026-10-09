/**
 * scripts/validate-usage-extra.mjs
 * ------------------------------------------------------------------
 * 校验 src/data/usage-extra.js（用法补充数据：固定搭配 / 背景 / 补缺用法）：
 *   1. 默认导出为对象，键 ⊆ 词库现有 form（小写，src/data/index.js）
 *   2. ★ 音标红线：无音标 / 发音类字段名；字符串值不得形如 /…/ 音标串或密集 IPA 符号
 *   3. c 为 2~6 条非空英文搭配数组；不得等于单词本身；不得有编号前缀
 *   4. b 为非空中文背景，长度落在 [40, 260]
 *   5. u（若存在）为非空中文用法，长度 ≤ 40，且**只能出现在 phonetics.js 缺 u 的词上**
 *   6. 统计：条数、文件体积、每词平均字节数、各字段覆盖率
 *
 * 退出码：0 = 通过；1 = 有违规（逐条打印明细）。
 * 用法：node scripts/validate-usage-extra.mjs [--verbose]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { words as ALL_WORDS } from '../src/data/index.js'
import phonetics from '../src/data/phonetics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_PATH = path.join(ROOT, 'src/data/usage-extra.js')
const VERBOSE = process.argv.includes('--verbose')

const FORBIDDEN_KEY = /phonetic|pronunc|pronunciation|ipa|音标|读音|发音/i
const IPA_CHARS = /[ˈˌəɪʊɛæɑɔʌʃʒθðŋɹɚɝɜɒɐˑː]/
const COLL_MIN = 2
const COLL_MAX = 6
const BG_MIN = 40
const BG_MAX = 260
const USAGE_MAX = 40

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

// ---------------------------------------------------------------- 词库集合
/** form 小写 -> { form, needsU } */
const known = new Map()
for (const w of ALL_WORDS) {
  if (!w || typeof w.form !== 'string' || !w.form) continue
  const key = w.form.toLowerCase()
  if (known.has(key)) continue
  const e = phonetics && typeof phonetics === 'object' ? phonetics[key] : null
  known.set(key, { form: w.form, needsU: !(e && typeof e.u === 'string' && e.u.trim()) })
}

// ---------------------------------------------------------------- 音标扫描
/** 疑似音标：/.../ 包裹 + IPA 字符，或 IPA 字符出现 ≥3 次 */
function looksLikePhonetic(s) {
  const t = String(s).trim()
  if (t.startsWith('/') && t.endsWith('/') && t.length > 2 && IPA_CHARS.test(t)) return 'slash-ipa'
  const hits = t.match(new RegExp(IPA_CHARS.source, 'g'))
  if (hits && hits.length >= 3) return 'ipa-chars'
  return ''
}

function scanForbiddenKeys(obj, pathStr, out) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanForbiddenKeys(v, `${pathStr}[${i}]`, out))
    return
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_KEY.test(k)) out.push(`${pathStr}.${k}`)
      scanForbiddenKeys(v, `${pathStr}.${k}`, out)
    }
  }
}

function scanPhoneticValues(obj, pathStr, out) {
  if (typeof obj === 'string') {
    const hit = looksLikePhonetic(obj)
    if (hit) out.push(`${pathStr} = ${obj.slice(0, 60)}（${hit}）`)
    return
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanPhoneticValues(v, `${pathStr}[${i}]`, out))
    return
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) scanPhoneticValues(v, `${pathStr}.${k}`, out)
  }
}

// ---------------------------------------------------------------- 单条校验
function checkEntry(key, e) {
  const at = `usageExtra["${key}"]`
  if (!e || typeof e !== 'object' || Array.isArray(e)) {
    err(`${at} 必须是对象`)
    return { c: 0, b: 0, u: 0 }
  }
  const meta = known.get(key)

  // 音标红线
  const pk = []
  scanForbiddenKeys(e, at, pk)
  pk.forEach((p) => err(`含音标/发音类字段：${p}`))
  const pv = []
  scanPhoneticValues(e, at, pv)
  pv.forEach((p) => err(`含疑似音标值：${p}`))

  // c 固定搭配
  let nC = 0
  if (e.c !== undefined) {
    if (!Array.isArray(e.c)) {
      err(`${at}.c 必须是数组`)
    } else if (e.c.length < COLL_MIN || e.c.length > COLL_MAX) {
      err(`${at}.c 条数 ${e.c.length} 越界（应 ${COLL_MIN}~${COLL_MAX}）`)
    } else {
      const flatWord = key.replace(/[^a-z0-9'-]/g, '')
      e.c.forEach((s, i) => {
        if (typeof s !== 'string' || !s.trim()) {
          err(`${at}.c[${i}] 必须是非空字符串`)
          return
        }
        if (/^\s*[-•*]?\s*\d+[.、)]/.test(s)) warn(`${at}.c[${i}] 带编号前缀：${s.slice(0, 30)}`)
        // 归一化顺序必须是「先 toLowerCase 再 strip」：`[^a-z0-9'-]` 不含大写 A–Z，
        // 若先 strip 会把配词里的大写字母（如 "TV series" 的 TV、"USB port" 的 USB）
        // 一起剥掉，于是缩写开头的合法搭配被误判成「与单词本身相同」。
        // 此顺序与生成器 scripts/gen-usage-extra.mjs 的 normalizeCollocations 保持一致。
        if (s.toLowerCase().replace(/[^a-z0-9'-]/g, '') === flatWord) {
          err(`${at}.c[${i}] 与单词本身相同：${s}`)
        }
      })
      nC = e.c.length
    }
  }

  // b 背景
  let nB = 0
  if (e.b !== undefined) {
    if (typeof e.b !== 'string' || !e.b.trim()) err(`${at}.b 必须是非空字符串`)
    else if (e.b.length < BG_MIN) err(`${at}.b 过短（${e.b.length} < ${BG_MIN}）`)
    else if (e.b.length > BG_MAX) err(`${at}.b 过长（${e.b.length} > ${BG_MAX}）`)
    else nB = 1
  }

  // u 用法：只能出现在「phonetics.js 缺 u」的词上
  let nU = 0
  if (e.u !== undefined) {
    if (typeof e.u !== 'string' || !e.u.trim()) err(`${at}.u 必须是非空字符串`)
    else if (e.u.length > USAGE_MAX) err(`${at}.u 过长（${e.u.length} > ${USAGE_MAX}）`)
    else nU = 1
    if (meta && !meta.needsU) err(`${at}.u 该词 phonetics.js 已有用法，不应重复生成`)
  }

  // 至少得有一个有效字段
  if (!nC && !nB && !nU) warn(`${at} 无任何有效字段（空条目）`)
  return { c: nC ? 1 : 0, b: nB ? 1 : 0, u: nU ? 1 : 0 }
}

// ---------------------------------------------------------------- main
async function main() {
  if (!fs.existsSync(OUT_PATH)) {
    console.error(`✗ 产物不存在：${path.relative(ROOT, OUT_PATH)}（先跑 scripts/gen-usage-extra.mjs）`)
    process.exit(1)
  }
  const mod = await import(pathToFileURL(OUT_PATH).href)
  const map = mod && (mod.usageExtra || mod.default)
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    console.error('✗ usage-extra.js 必须导出对象 { [form小写]: { c, b, u } }')
    process.exit(1)
  }

  const ids = Object.keys(map)
  const cov = { c: 0, b: 0, u: 0 }
  let unknownKeys = 0
  for (const key of ids) {
    if (!known.has(key)) {
      err(`键不在词库内：${key}`)
      unknownKeys += 1
    }
    const r = checkEntry(key, map[key])
    cov.c += r.c
    cov.b += r.b
    cov.u += r.u
  }

  const stat = fs.statSync(OUT_PATH)
  const mb = (stat.size / 1024 / 1024).toFixed(2)
  const avg = ids.length ? (stat.size / ids.length).toFixed(0) : '0'
  const pct = (n) => `${((n / Math.max(1, ids.length)) * 100).toFixed(1)}%`

  console.log(`[validate-usage-extra] 词库 ${known.size} 词 / 产物 ${ids.length} 条 / 未知键 ${unknownKeys}`)
  console.log(`  文件体积    ${mb} MB（${stat.size} B）`)
  console.log(`  每词字节    ${avg} B`)
  console.log(`  覆盖率      c 固定搭配 ${cov.c}/${ids.length}（${pct(cov.c)}）· b 背景 ${cov.b}/${ids.length}（${pct(cov.b)}）· u 补用法 ${cov.u}/${ids.length}（${pct(cov.u)}）`)
  console.log(`  全库覆盖    ${((ids.length / known.size) * 100).toFixed(1)}%（${ids.length}/${known.size}）`)

  if (warnings.length) {
    console.log(`\n⚠ 警告 ${warnings.length} 条：`)
    warnings.slice(0, 30).forEach((w) => console.log('  - ' + w))
    if (warnings.length > 30) console.log(`  …其余 ${warnings.length - 30} 条省略`)
  } else if (VERBOSE) {
    console.log('  无警告。')
  }

  if (errors.length) {
    console.log(`\n✗ 校验失败，共 ${errors.length} 处违规：`)
    errors.slice(0, 60).forEach((e) => console.log('  - ' + e))
    if (errors.length > 60) console.log(`  …其余 ${errors.length - 60} 条省略`)
    process.exit(1)
  }
  console.log(`\n✓ 校验通过：${ids.length} 条用法补充数据合法、无音标字段、结构完整。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

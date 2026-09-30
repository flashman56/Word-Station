/**
 * scripts/validate-etym.mjs
 * ------------------------------------------------------------------
 * 校验 src/data/morph-etym.js（精编词源数据）：
 *   1. 顶层为对象，键 ⊆ 现有词素 id（src/data/morphemes.js）
 *   2. 无音标 / 发音类字段（键名黑名单 + 值里的 /…/ IPA 串）
 *   3. 必填字段齐全且非空：origin（合法枚举）、story、timeline（≥1 段，text 非空）
 *   4. 结构合法：evolution（若存在）同 timeline；cognates 为数组；pie 为布尔；proto/protoGloss 为 string|null
 *
 * 退出码：0 = 通过；1 = 有违规（逐条打印明细）。
 * 用法：node scripts/validate-etym.mjs
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import morphemes from '../src/data/morphemes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ETYM_PATH = path.join(ROOT, 'src/data/morph-etym.js')

const ORIGIN_KEYS = new Set(['latin', 'greek', 'germanic', 'old_english', 'french', 'other'])
const FORBIDDEN_KEY = /phonetic|pronunc|pronunciation|ipa|音标|读音|发音/i
const IPA_CHARS = /[ˈˌəɪʊɛæɑɔʌʃʒθðŋɹɚɝɜɒɐˑː]/

const errors = []
const warnings = []

function err(msg) {
  errors.push(msg)
}
function warn(msg) {
  warnings.push(msg)
}

// ---------------------------------------------------------------- 词素 id 集合
const allowed = new Set()
for (const m of morphemes) if (m && m.id) allowed.add(m.id)

// ---------------------------------------------------------------- 音标扫描
/** 递归扫描**字段名**是否含音标类词（顶层 morph id 不参与，避免 r.phon 误报） */
function scanPhoneticKeys(obj, pathStr, out) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanPhoneticKeys(v, `${pathStr}[${i}]`, out))
    return
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_KEY.test(k)) out.push(`${pathStr}.${k}`)
      scanPhoneticKeys(v, `${pathStr}.${k}`, out)
    }
  }
}

/** 递归扫描**字符串值**是否形如 /…/ 音标串 */
function scanPhoneticValues(obj, pathStr, out) {
  if (typeof obj === 'string') {
    const s = obj.trim()
    if (s.startsWith('/') && s.endsWith('/') && s.length > 2 && IPA_CHARS.test(s)) out.push(`${pathStr} = ${s}`)
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

// ---------------------------------------------------------------- 结构校验
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function checkTimeline(list, at) {
  if (!Array.isArray(list) || list.length === 0) {
    err(`${at} 必须是非空数组`)
    return
  }
  list.forEach((s, i) => {
    if (!s || typeof s !== 'object') {
      err(`${at}[${i}] 必须是对象`)
      return
    }
    if (s.era !== undefined && typeof s.era !== 'string') err(`${at}[${i}].era 必须是字符串`)
    if (!isNonEmptyString(s.text)) err(`${at}[${i}].text 必须是非空字符串`)
  })
}

function checkEntry(id, e) {
  const at = `morph-etym["${id}"]`
  if (!e || typeof e !== 'object' || Array.isArray(e)) {
    err(`${at} 必须是对象`)
    return
  }

  // origin
  if (!isNonEmptyString(e.origin)) err(`${at}.origin 缺失`)
  else if (!ORIGIN_KEYS.has(e.origin)) err(`${at}.origin 非法：${JSON.stringify(e.origin)}（应为 ${[...ORIGIN_KEYS].join('|')}）`)

  // story
  if (!isNonEmptyString(e.story)) err(`${at}.story 缺失或为空`)

  // timeline（必填、非空）
  checkTimeline(e.timeline, `${at}.timeline`)

  // proto / protoGloss：string | null
  for (const f of ['proto', 'protoGloss']) {
    if (e[f] !== undefined && e[f] !== null && typeof e[f] !== 'string') err(`${at}.${f} 必须是 string|null`)
  }
  // 别名
  for (const f of ['originalForm', 'originalMeaning']) {
    if (e[f] !== undefined && e[f] !== null && typeof e[f] !== 'string') err(`${at}.${f} 必须是 string|null`)
  }
  if (e.pieRoot !== undefined && e.pieRoot !== null && typeof e.pieRoot !== 'string') err(`${at}.pieRoot 必须是 string|null`)

  // pie
  if (e.pie !== undefined && typeof e.pie !== 'boolean') err(`${at}.pie 必须是布尔`)

  // evolution（别名，若存在）
  if (e.evolution !== undefined) checkTimeline(e.evolution, `${at}.evolution`)

  // cognates
  if (e.cognates !== undefined) {
    if (!Array.isArray(e.cognates)) err(`${at}.cognates 必须是数组`)
    else {
      e.cognates.forEach((c, i) => {
        if (!c || typeof c !== 'object' || !isNonEmptyString(c.form)) err(`${at}.cognates[${i}].form 缺失或为空`)
      })
      if (e.cognates.length === 0) warn(`${at}.cognates 为空（建议补同源词）`)
    }
  }

  // 音标红线
  const pk = []
  scanPhoneticKeys(e, at, pk)
  pk.forEach((p) => err(`含音标/发音类字段：${p}`))
  const pv = []
  scanPhoneticValues(e, at, pv)
  pv.forEach((p) => err(`含疑似音标值：${p}`))
}

// ---------------------------------------------------------------- main
async function main() {
  const mod = await import(pathToFileURL(ETYM_PATH).href)
  const map = mod && mod.default ? mod.default : null
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    console.error('✗ morph-etym.js 默认导出必须是对象 { [morphId]: EtymEntry }')
    process.exit(1)
  }

  const ids = Object.keys(map)
  let extraKeys = 0
  for (const id of ids) {
    if (!allowed.has(id)) {
      err(`键不在现有词素集合内：${id}`)
      extraKeys += 1
    }
    checkEntry(id, map[id])
  }

  console.log(`[validate-etym] 词素集合 ${allowed.size} 条 / 文件条目 ${ids.length} 条`)
  if (warnings.length) {
    console.log(`\n⚠ 警告 ${warnings.length} 条：`)
    warnings.slice(0, 40).forEach((w) => console.log('  - ' + w))
    if (warnings.length > 40) console.log(`  …其余 ${warnings.length - 40} 条省略`)
  }
  if (errors.length) {
    console.log(`\n✗ 校验失败，共 ${errors.length} 处违规：`)
    errors.slice(0, 60).forEach((e) => console.log('  - ' + e))
    if (errors.length > 60) console.log(`  …其余 ${errors.length - 60} 条省略`)
    process.exit(1)
  }
  if (ids.length === 0) {
    console.log('✓ 校验通过（当前为空占位，待生成）。')
  } else {
    console.log(`✓ 校验通过：${ids.length} 条词源数据合法、无音标字段、结构完整。`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

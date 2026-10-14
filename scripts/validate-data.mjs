/**
 * 数据校验脚本（纯 Node ESM，无第三方依赖）
 * 用法：npm run validate
 *
 * error 会导致 exit 1；warn 只提示，不阻断。
 */
import { morphemes, words } from '../src/data/index.js'

const VALID_TYPES = ['root', 'prefix', 'suffix']
const VALID_ORIGINS = ['latin', 'greek', 'germanic', 'old_english', 'french', 'other']
const VALID_CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const AUTO_KNOWN_RANK = 2500

// ---------------------------------------------------------------- 新字段规则
// 音标：DJ 英式，含首尾斜杠，内容只允许英文字母 + IPA 符号（含音节点）
const DJ_CHARS = /^[a-zA-Z ˈˌːˑəɐɑɒɔɜɛɘɞɪɨɯʌʊæøɵɶʉɤʏɹɾʃʒθðŋɲɳɡɢʔχʁʀħʕʜʢʍɥʧʤ˘.()]+$/
// KK 美式专用符号，一律禁止
const KK_CHARS = /[ˋˊ˝ɚɝ]/
const EXAMPLE_EN_MIN = 8
const EXAMPLE_EN_MAX = 200

const errors = []
const warns = []
const err = (msg) => errors.push(msg)
const warn = (msg) => warns.push(msg)

// ---------------------------------------------------------------- 词素

const morphIds = new Set()
morphemes.forEach((m, i) => {
  const at = `morphemes[${i}](${m?.id ?? '?'})`
  if (!m.id) return err(`${at} 缺少 id`)
  if (morphIds.has(m.id)) err(`${at} id 重复：${m.id}`)
  morphIds.add(m.id)
  if (!VALID_TYPES.includes(m.type)) err(`${at} type 非法：${m.type}`)
  if (!VALID_ORIGINS.includes(m.origin)) err(`${at} origin 非法：${m.origin}`)
  if (!m.form) err(`${at} 缺少 form`)
  if (!m.gloss) err(`${at} 缺少 gloss`)
  if (!Array.isArray(m.variants)) err(`${at} variants 必须是数组`)
  if (!m.display) warn(`${at} 建议填写 display（展示词形）`)
})

// ---------------------------------------------------------------- 单词

const wordIds = new Set()
const wordForms = new Set()
const countByMorph = new Map()
morphemes.forEach((m) => countByMorph.set(m.id, { total: 0, high: 0, mid: 0 }))
const freqBands = { base: 0, high: 0, mid: 0, lowmid: 0, low: 0 }
const cefrDist = {}
// 补齐进度（口径：freqRank > AUTO_KNOWN_RANK 的中低频词，即学习卡片真实抽取池）
const fill = { total: 0, phonetic: 0, example: 0 }

/** 非空字符串 */
const filled = (v) => typeof v === 'string' && v.trim().length > 0

/** phoneticBr：填了就必须合法；未填不算 error，只计入进度 */
function checkPhonetic(w, at) {
  const p = w.phoneticBr
  if (p == null || p === '') return false
  if (typeof p !== 'string') {
    err(`${at} phoneticBr 必须是字符串：${JSON.stringify(p)}`)
    return false
  }
  const body = p.slice(1, -1)
  if (!(p.startsWith('/') && p.endsWith('/') && p.length > 2)) {
    err(`${at} phoneticBr 必须是 DJ 音标格式（首尾各一个 /）：${p}`)
  } else if (KK_CHARS.test(body)) {
    err(`${at} phoneticBr 含 KK 美式符号（ˋ ˊ ˝ ɚ ɝ），请用 DJ 英式：${p}`)
  } else if (!DJ_CHARS.test(body)) {
    err(`${at} phoneticBr 含非 IPA 字符，只允许字母与 IPA 符号：${p}`)
  }
  return true
}

/** example：填了就必须是 { en, zh } 且都非空、en 长度 8~200；未填不算 error */
function checkExample(w, at) {
  const e = w.example
  if (e == null) return false
  if (typeof e !== 'object' || Array.isArray(e)) {
    err(`${at} example 必须是对象 { en, zh }`)
    return false
  }
  if (!filled(e.en)) err(`${at} example.en 缺失或为空`)
  else if (e.en.length < EXAMPLE_EN_MIN || e.en.length > EXAMPLE_EN_MAX) {
    err(`${at} example.en 长度须在 ${EXAMPLE_EN_MIN}~${EXAMPLE_EN_MAX} 字符，当前 ${e.en.length}`)
  }
  if (!filled(e.zh)) err(`${at} example.zh 缺失或为空`)
  return true
}

words.forEach((w, i) => {
  const at = `words[${i}](${w?.id ?? '?'})`
  if (!w.id) return err(`${at} 缺少 id`)
  if (wordIds.has(w.id)) err(`${at} id 重复：${w.id}`)
  wordIds.add(w.id)
  if (!w.form) err(`${at} 缺少 form`)
  else {
    const normalizedForm = String(w.form).toLowerCase()
    if (wordForms.has(normalizedForm)) err(`${at} form 重复（忽略大小写）：${w.form}`)
    wordForms.add(normalizedForm)
  }
  if (!w.gloss) err(`${at} 缺少 gloss`)
  if (!w.pos) err(`${at} 缺少 pos（词性，必填）`)
  if (!VALID_CEFR.includes(w.cefr)) err(`${at} cefr 非法：${w.cefr}`)

  const hasPhonetic = checkPhonetic(w, at)
  const hasExample = checkExample(w, at)
  if (w.freqRank > AUTO_KNOWN_RANK && w.morphless !== true) {
    fill.total += 1
    if (hasPhonetic) fill.phonetic += 1
    if (hasExample) fill.example += 1
    // 数据完整性（向前加固，防止将来回退）：目标补齐词缺失音标 / 例句必须判 error
    if (!hasPhonetic) err(`${at} 目标补齐词（freqRank>${AUTO_KNOWN_RANK}）缺失 phoneticBr，须补齐音标`)
    if (!hasExample) err(`${at} 目标补齐词（freqRank>${AUTO_KNOWN_RANK}）缺失 example，须补齐双语例句`)
  }
  if (!Number.isInteger(w.freqRank) || w.freqRank <= 0) err(`${at} freqRank 必须是正整数：${w.freqRank}`)

  if (!Array.isArray(w.morphs)) {
    err(`${at} morphs 必须是数组`)
    return
  }
  if (w.morphs.length === 0) {
    if (w.morphless !== true) {
      err(`${at} morphs 为空时必须显式标记 morphless: true`)
      return
    }
    if (!filled(w.pos)) err(`${at} 无词素词缺少 pos`)
    if (!filled(w.gloss)) err(`${at} 无词素词缺少 gloss`)
    if (!filled(w.origin)) err(`${at} 无词素词缺少 origin`)
    if (!filled(w.kind)) err(`${at} 无词素词缺少 kind`)
  }
  w.morphs.forEach((mid) => {
    if (!morphIds.has(mid)) err(`${at} morphs 引用了不存在的词素：${mid}`)
    const c = countByMorph.get(mid)
    if (c) {
      c.total += 1
      if (w.freqRank <= AUTO_KNOWN_RANK) c.high += 1
      else if (w.cefr === 'B2' || w.cefr === 'C1' || w.cefr === 'C2') c.mid += 1
    }
  })

  if (Array.isArray(w.chain)) {
    w.chain.forEach((step) => {
      if (!step || !step.form) err(`${at} chain 某一步缺少 form`)
      if (step.morph != null && !morphIds.has(step.morph)) {
        err(`${at} chain 引用了不存在的词素：${step.morph}`)
      }
    })
  } else {
    err(`${at} 缺少 chain（构词拆解路径）`)
  }

  const b =
    w.freqRank <= 1000 ? 'base'
      : w.freqRank <= 2500 ? 'high'
        : w.freqRank <= 6000 ? 'mid'
          : w.freqRank <= 12000 ? 'lowmid' : 'low'
  freqBands[b] += 1
  cefrDist[w.cefr] = (cefrDist[w.cefr] || 0) + 1
})

// ---------------------------------------------------------------- 补齐进度提示

if (fill.phonetic < fill.total || fill.example < fill.total) {
  warn(
    `中低频词（freqRank > ${AUTO_KNOWN_RANK}）共 ${fill.total} 个，`
    + `仍有 ${fill.total - fill.phonetic} 个缺 phoneticBr、${fill.total - fill.example} 个缺 example（P0 分批补齐中）`
  )
}

// ---------------------------------------------------------------- 词群规模提示

morphemes.forEach((m) => {
  const c = countByMorph.get(m.id)
  if (!c) return
  if (c.total < 5) warn(`词素 ${m.id}（${m.form}）下只有 ${c.total} 个词，建议补到 5 个以上`)
  if (c.high < 2) warn(`词素 ${m.id}（${m.form}）下高频词仅 ${c.high} 个，建议至少 2 个（freqRank<=${AUTO_KNOWN_RANK}）`)
  if (c.mid < 3) warn(`词素 ${m.id}（${m.form}）下 B2 及以上难度的词仅 ${c.mid} 个，建议至少 3 个`)
})

// ---------------------------------------------------------------- 输出

const byType = {}
const byOrigin = {}
morphemes.forEach((m) => {
  byType[m.type] = (byType[m.type] || 0) + 1
  byOrigin[m.origin] = (byOrigin[m.origin] || 0) + 1
})

console.log('='.repeat(56))
console.log('词根词缀单词云 — 数据校验')
console.log('='.repeat(56))
console.log(`词素总数：${morphemes.length}`)
console.log(`  按类型：`, byType)
console.log(`  按来源：`, byOrigin)
console.log(`单词总数：${words.length}`)
console.log(`  词频分档：`, freqBands)
console.log(`  难度分布：`, cefrDist)
console.log(`  补齐口径：freqRank > ${AUTO_KNOWN_RANK} 的中低频词 ${fill.total} 个`)
console.log(`音标补齐进度 ${fill.phonetic}/${fill.total}　例句补齐进度 ${fill.example}/${fill.total}`)
console.log('-' .repeat(56))

if (warns.length) {
  console.log(`\n[WARN] ${warns.length} 条：`)
  warns.slice(0, 40).forEach((w) => console.log('  - ' + w))
  if (warns.length > 40) console.log(`  ... 另有 ${warns.length - 40} 条`)
}

if (errors.length) {
  console.log(`\n[ERROR] ${errors.length} 条：`)
  errors.slice(0, 60).forEach((e) => console.log('  x ' + e))
  if (errors.length > 60) console.log(`  ... 另有 ${errors.length - 60} 条`)
  console.log('\n结论：IS_PASS: NO')
  process.exit(1)
}

console.log(`\n结论：IS_PASS: YES（warn ${warns.length} 条，error 0 条）`)

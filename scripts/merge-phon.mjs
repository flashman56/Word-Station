/**
 * scripts/merge-phon.mjs
 * ------------------------------------------------------------------
 * 音标覆盖率提升：在【不丢失现有 47,744 条】前提下，用外部词典音标源
 * 补全缺失词形，并把外部标准 IPA 转写为与现有 phonetics.js 完全一致的
 * ECDICT/KK 记法（符号集严格限定在「现有 p 字段已用到的符号」之内，
 * 任何外部引入但现有数据没用过的符号一律剔除，杜绝显示乱码）。
 *
 * 数据源（查表，绝不现场生成）：
 *   1. 本地 ECDICT（scripts/.ecdict/ecdict.csv）—— 已是目标记法，优先。
 *   2. ipa-dict（open-dict-data/ipa-dict）en_US.txt / en_UK.txt —— 标准 IPA，
 *      经 toEcdict() 转写。en_US 偏美式，与 ECDICT 的 KK 风格更接近。
 *   3. kaikki.org 英文词典（scripts/.kaikki-ipa.txt，由 extract-kaikki.mjs 抽取）
 *      —— 标准 IPA，经 toEcdict() 转写，覆盖更全。
 *
 * 用法：
 *   node scripts/merge-phon.mjs                 # 试运行：写 phonetics.merged.js + 报告，不动原文件
 *   node scripts/merge-phon.mjs --apply         # 把合并结果写回 src/data/phonetics.js
 *
 * 红线：绝不修改 dict.js / useSpeech.js / learning.js / migrate.js / vocab.js；
 *       现有 47,744 条 p 一律保留（只新增缺失词形的 p，或补 en/zh/u 不动 p）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const APPLY = process.argv.includes('--apply')

// ---------------- 读取现有 phonetics（直接 import，无副作用） ----------------
const phonMod = await import(pathToFileURL(path.join(ROOT, 'src/data/phonetics.js')).href)
const phonetics = phonMod.phonetics
const phonKeys = Object.keys(phonetics)
let existingWithP = 0
for (const k of phonKeys) if (phonetics[k] && phonetics[k].p) existingWithP++
console.error(`[merge] 现有 phonetics 词条 ${phonKeys.length}，其中带 p 的 ${existingWithP}`)

// ---------------- 词库词形（直接 import 前端安全入口，覆盖 JS 字面量 + JSON 两种词库文件） ----------------
const we = await import(pathToFileURL(path.join(ROOT, 'src/data/words-entry.js')).href)
const forms = new Set()
for (const w of we.words) {
  if (w && typeof w.form === 'string' && w.form) forms.add(w.form.toLowerCase())
}
console.error(`[merge] 词库唯一词形 ${forms.size}`)

// ---------------- 现有 p 字段符号白名单（一致性基石） ----------------
const ALLOWED = new Set()
for (const k of phonKeys) {
  const p = phonetics[k] && phonetics[k].p
  if (!p) continue
  for (const ch of p) ALLOWED.add(ch)
}
console.error(`[merge] 现有 p 符号白名单（${ALLOWED.size} 个）`)

// ---------------- 标准 IPA -> ECDICT/KK 转写表 ----------------
// 仅做符号级映射；映射后若仍有白名单外的符号，会在 toEcdict 末尾被剔除。
const MAP = {
  'ˈ': "'", // 主重音
  'ˌ': '', // 次重音：ECDICT 不标，直接丢弃
  'ː': ':', // 长元音
  'ɛ': 'e', // ECDICT 用 e 表 /ɛ/
  'ɝ': 'ə', // 卷舌中央元音 -> ə（ECDICT bird→bə:d）
  'ɚ': 'ə', // 卷舌 schwa -> ə
  'ɹ': 'r', // 美式 r -> r
  'ɡ': 'g',
  'ʧ': 'tʃ',
  'ʤ': 'dʒ',
  'ɾ': 't', // 闪音 t（better）→ t
  'ᵻ': 'ə',
  'ɪ̈': 'ɪ',
  'ʊ̈': 'ʊ',
  'ɫ': 'l', // 暗 l
  'ʍ': 'w', // 清 w
  'ɱ': 'm',
  'ɳ': 'n',
  'ɲ': 'n',
  'ɻ': 'r',
  'ʈ': 't',
  'ɖ': 'd',
  'ɕ': 'ʃ',
  'ʑ': 'ʒ',
  'ʂ': 'ʃ',
  'ʐ': 'ʒ',
  'ɣ': 'g',
  'ɨ': 'ə',
  'ʉ': 'ə',
  'ɯ': 'u',
  'ɤ': 'ə',
  '̃': '', // 鼻化标记丢弃
  'ʔ': '', // 喉塞丢弃
  'ʲ': '', // 腭化丢弃
  '͡': '', // 连音符丢弃
  '̩': '', // 音节化标记丢弃
  '̯': '', // 非音节标记丢弃
}
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ɑ', 'ɔ', 'ɒ', 'ʌ', 'ə', 'ɜ', 'æ', 'ɪ', 'ʊ', "'", ':'])

function toEcdict(ipa) {
  if (typeof ipa !== 'string') return null
  let s = ipa.trim()
  // 去掉两侧斜杠
  if (s.startsWith('/')) s = s.slice(1)
  if (s.endsWith('/')) s = s.slice(0, -1)
  s = s.trim()
  // 只取第一个发音（逗号分隔的变体）
  const comma = s.indexOf(',')
  if (comma >= 0) s = s.slice(0, comma)
  // 去掉括号内可省略音，如 (p)
  s = s.replace(/\([^)]*\)/g, '')
  // 符号级映射
  let out = ''
  for (const ch of s) {
    if (Object.prototype.hasOwnProperty.call(MAP, ch)) {
      const m = MAP[ch]
      if (m) out += m
      // 映射为空串则丢弃
    } else {
      out += ch
    }
  }
  // 去空格、控制字符、以及 kaikki 等来源带来的音节分隔点（ECDICT 记法无点，避免参差不齐）
  out = out.replace(/[\s.·‧‌‍­]/g, '')
  // 剔除白名单外符号（保证与现有记法完全一致）
  let cleaned = ''
  for (const ch of out) if (ALLOWED.has(ch)) cleaned += ch
  // 基本有效性：长度 >=2 且至少含一个元音/重音类符号
  if (cleaned.length < 2) return null
  let hasVowel = false
  for (const ch of cleaned) if (VOWELS.has(ch)) { hasVowel = true; break }
  if (!hasVowel) return null
  return cleaned
}

// ---------------- 解析 ipa-dict / kaikki（word\t/IPA/） ----------------
function parseIpaFile(p) {
  const map = new Map()
  if (!fs.existsSync(p)) { console.error(`[merge] 跳过缺失的 ipa 文件: ${p}`); return map }
  const text = fs.readFileSync(p, 'utf8')
  for (const line of text.split('\n')) {
    if (!line) continue
    const tab = line.indexOf('\t')
    if (tab < 0) continue
    let word = line.slice(0, tab).trim().toLowerCase()
    let ipa = line.slice(tab + 1).trim()
    if (!word || !ipa) continue
    if (!map.has(word)) map.set(word, ipa)
  }
  return map
}
const IPA_US = parseIpaFile(process.env.IPA_US || path.join(ROOT, 'scripts/.ipa-en_US.txt'))
const IPA_UK = parseIpaFile(process.env.IPA_UK || path.join(ROOT, 'scripts/.ipa-en_UK.txt'))
// kaikki.org 英文词典抽取结果（word\t/IPA/，同一格式）
const IPA_KAIKKI = parseIpaFile(process.env.IPA_KAIKKI || path.join(ROOT, 'scripts/.kaikki-ipa.txt'))
// 回退：脚本运行环境若未把 ipa 文件放进 scripts/，从 /tmp 读取（下载态）
if (IPA_US.size === 0 && fs.existsSync('/tmp/ipa_en_US.txt')) {
  for (const [k, v] of parseIpaFile('/tmp/ipa_en_US.txt')) if (!IPA_US.has(k)) IPA_US.set(k, v)
}
if (IPA_UK.size === 0 && fs.existsSync('/tmp/ipa_en_UK.txt')) {
  for (const [k, v] of parseIpaFile('/tmp/ipa_en_UK.txt')) if (!IPA_UK.has(k)) IPA_UK.set(k, v)
}
if (IPA_KAIKKI.size === 0 && fs.existsSync('/tmp/kaikki-ipa.txt')) {
  for (const [k, v] of parseIpaFile('/tmp/kaikki-ipa.txt')) if (!IPA_KAIKKI.has(k)) IPA_KAIKKI.set(k, v)
}
console.error(`[merge] ipa-dict US=${IPA_US.size} UK=${IPA_UK.size} | kaikki=${IPA_KAIKKI.size}`)

// ---------------- 本地 ECDICT 索引（已是目标记法） ----------------
function buildEcdict() {
  const p = path.join(ROOT, 'scripts/.ecdict/ecdict.csv')
  const text = fs.readFileSync(p, 'utf8')
  const map = new Map()
  for (const line of text.split('\n')) {
    if (!line) continue
    const c1 = line.indexOf(',')
    if (c1 < 0) continue
    let word = line.slice(0, c1).trim()
    if (word.startsWith("'") && word.endsWith("'")) word = word.slice(1, -1)
    let phon = line.slice(c1 + 1).split(',')[0].trim()
    if (phon.startsWith("'") && phon.endsWith("'")) phon = phon.slice(1, -1)
    if (!word || !phon) continue
    const k = word.toLowerCase()
    if (!map.has(k)) map.set(k, phon)
  }
  return map
}
const ECDICT = buildEcdict()
console.error(`[merge] ECDICT 索引 ${ECDICT.size}`)

// ---------------- 屈折原形候选（与 gen-phon.mjs 同思路，查表不编造） ----------------
function lemmaCandidates(form) {
  const out = []
  const add = (s) => { if (s && s.length > 2 && !out.includes(s)) out.push(s) }
  const collapseDouble = (s) => {
    if (s.length > 2 && s[s.length - 1] === s[s.length - 2]) { add(s.slice(0, -1)); add(s.slice(0, -1) + 'e') }
  }
  if (form.endsWith("'s")) add(form.slice(0, -2))
  if (form.endsWith("s'")) add(form.slice(0, -1))
  if (form.endsWith('ies') && form.length > 4) add(form.slice(0, -3) + 'y')
  if (form.endsWith('es')) { add(form.slice(0, -2)); add(form.slice(0, -1)); if (form.endsWith('ies')) add(form.slice(0, -3) + 'y') }
  if (form.endsWith('s') && !form.endsWith('ss') && !form.endsWith('us')) { const st = form.slice(0, -1); add(st); add(st + 'e'); collapseDouble(st) }
  if (form.endsWith('ied') && form.length > 4) add(form.slice(0, -3) + 'y')
  if (form.endsWith('ed')) { const st = form.slice(0, -2); add(st); add(form.slice(0, -1)); add(st + 'e'); collapseDouble(st) }
  if (form.endsWith('ing') && form.length > 5) { const st = form.slice(0, -3); add(st); add(st + 'e'); collapseDouble(st) }
  if (form.endsWith('er') && form.length > 4) { const st = form.slice(0, -2); add(st); add(st + 'e'); collapseDouble(st) }
  if (form.endsWith('est') && form.length > 5) { const st = form.slice(0, -3); add(st); add(st + 'e'); collapseDouble(st) }
  if (form.endsWith('ly') && form.length > 4) { const st = form.slice(0, -2); add(st); if (st.endsWith('i')) add(st.slice(0, -1) + 'y') }
  return out
}

/** 为缺失词形找一个外部 IPA（精确 + 屈折回退）。优先 ipa-dict，其次 kaikki。 */
function lookupExternal(form) {
  const maps = [IPA_US, IPA_UK, IPA_KAIKKI]
  for (const map of maps) {
    if (!map || map.size === 0) continue
    let v = map.get(form)
    if (v) { const r = toEcdict(v); if (r) return r }
    for (const cand of lemmaCandidates(form)) {
      const cv = map.get(cand)
      if (cv) { const r = toEcdict(cv); if (r) return r }
    }
  }
  return null
}

// ---------------- 合并 ----------------
let addedEc = 0
let addedExt = 0
let addedNewEntry = 0
const samples = []
for (const f of forms) {
  const e = phonetics[f]
  if (e && e.p) continue // 现有 47,744 条一律保留
  // 1) 本地 ECDICT（目标记法，优先）
  let p = ECDICT.get(f) || null
  let src = 'ec'
  if (!p) {
    for (const cand of lemmaCandidates(f)) { const cp = ECDICT.get(cand); if (cp) { p = cp; break } }
    if (p) src = 'ec'
  }
  // 2) 外部 ipa-dict / kaikki（转写后）
  if (!p) { p = lookupExternal(f); if (p) src = 'ext' }
  if (!p) continue
  const cur = e || {}
  phonetics[f] = { ...cur, p }
  if (src === 'ec') addedEc++ ; else addedExt++
  if (!e) addedNewEntry++
  if (samples.length < 60) {
    const raw = (IPA_US.get(f) || IPA_UK.get(f) || IPA_KAIKKI.get(f) || ECDICT.get(f) || '')
    samples.push(`${f}\t[${src}]\t${raw}\t->\t${p}`)
  }
}

const finalWithP = (() => { let n = 0; for (const k of Object.keys(phonetics)) if (phonetics[k] && phonetics[k].p) n++; return n })()
console.error(`[merge] 新增带 p 词条：外部 ${addedExt}（其中新建条目 ${addedNewEntry}）+ 本地ECDICT ${addedEc} = ${addedExt + addedEc}`)
console.error(`[merge] 最终带 p 词条 ${finalWithP} / 词库 ${forms.size} = ${((finalWithP / forms.size) * 100).toFixed(1)}%`)

// 报告
const report = [
  `现有带 p 词条: ${existingWithP}`,
  `新增: 外部ipa-dict/kaikki=${addedExt} (新建条目=${addedNewEntry}), 本地ECDICT=${addedEc}, 合计=${addedExt + addedEc}`,
  `最终带 p 词条: ${finalWithP} / 词库 ${forms.size} = ${((finalWithP / forms.size) * 100).toFixed(1)}%`,
  '--- 样本（form [来源] 原始IPA -> 转写后p）---',
  ...samples,
].join('\n')
fs.writeFileSync(path.join(ROOT, 'scripts/_merge_report.txt'), report)
console.error('[merge] 报告已写 scripts/_merge_report.txt')

// ---------------- 写文件 ----------------
function writePhonetics(outPath) {
  const keys = Object.keys(phonetics).sort()
  const lines = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(phonetics[k])},`)
  const head = `/**
 * 音标 / 例句 / 用法 数据（由 scripts/gen-phon.mjs 生成，勿手工编辑）
 * ------------------------------------------------------------------
 * 数据源：
 *   - 音标 p：ECDICT 开源英汉词典（本地查表匹配，匹配不到留空，绝不编造）
 *             + ipa-dict（open-dict-data/ipa-dict，en_US/en_UK，标准 IPA 经转写对齐 ECDICT 记法）
 *             + kaikki.org 英文词典（标准 IPA 经转写对齐 ECDICT 记法）
 *   - 例句 en/zh、用法 u：DeepSeek 依词条 pos/gloss 生成（licensed 数据管线）
 *
 * 键：单词 form 小写；字段：p=音标主体（不带斜杠）en=英文例句 zh=中文翻译 u=用法
 * 生成时间：${new Date().toISOString()}
 * 词条数：${keys.length}
 */
export const phonetics = {
`
  const tail = `
}

/**
 * 查一个单词的音标 / 例句 / 用法（归一化输出，查不到返回 null）。
 * @param {string} form 单词词形（大小写不敏感）
 * @returns {{ phonetic: string, example: { en: string, zh: string } | null, usage: string } | null}
 */
export function phoneticsOf(form) {
  if (typeof form !== 'string') return null
  const entry = phonetics[form.toLowerCase()]
  if (!entry || typeof entry !== 'object') return null
  return {
    phonetic: typeof entry.p === 'string' ? entry.p : '',
    example:
      typeof entry.en === 'string' && entry.en && typeof entry.zh === 'string' && entry.zh
        ? { en: entry.en, zh: entry.zh }
        : null,
    usage: typeof entry.u === 'string' && entry.u ? entry.u : '',
  }
}

export default phonetics
`
  fs.writeFileSync(outPath, head + lines.join('\n') + tail)
}

const target = APPLY ? path.join(ROOT, 'src/data/phonetics.js') : path.join(ROOT, 'src/data/phonetics.merged.js')
writePhonetics(target)
console.error(`[merge] 已写出 ${APPLY ? '（已覆盖原文件！）' : 'phonetics.merged.js（试运行）'} -> ${target}`)

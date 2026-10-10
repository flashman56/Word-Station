/**
 * scripts/gen-usage-extra.mjs
 * ------------------------------------------------------------------
 * 为全库单词补充「固定搭配 + 背景 + 缺失用法」，产出 src/data/usage-extra.js。
 *
 * 与既有产物的关系：
 *   - src/data/phonetics.js 提供 { p 音标, en/zh 例句, u 用法 }（既有，本脚本只读不写）。
 *   - 本脚本只产出「phonetics.js 里没有的东西」：固定搭配 c、背景 b，
 *     以及**仅当该词缺 usage** 时补一条 u（沿用既有风格，≤30 字）。
 *   - 音标红线：提示词显式禁止音标；产物经校验器逐条扫描，命中即丢弃并计数。
 *
 * 用法：
 *   node scripts/gen-usage-extra.mjs --pilot 200          # 试点（100 高频 + 100 缺 usage）
 *   node scripts/gen-usage-extra.mjs --only-missing --only-u          # 3a：补齐缺失 usage
 *   node scripts/gen-usage-extra.mjs --band 1-20000                   # 3b：前 2 万词补 c+b
 *   node scripts/gen-usage-extra.mjs --band 1-20000 --concurrency 4 --batch 16
 *
 * CLI：
 *   --pilot N          只处理 N 个词（样本混合：一半取 freqRank 前 5000，一半取缺 usage 集合）
 *   --limit N          最多处理 N 个词（按 freqRank 升序）
 *   --band lo-hi       只处理 freqRank 落在 [lo, hi] 的词
 *   --only-missing     只处理「缺 usage」的词（含连 phon 条目都没有的）
 *   --only-u           只补 u（提示词更短、输出更小、更省钱；用于 3a）
 *   --concurrency N    并发请求数（默认 4）
 *   --batch N          每批词数（默认：--only-u 时 40，否则 16）
 *   --force            忽略已完成条目，全部重生成
 *   --skip-proper      跳过专有名词（w.kind === 'proper'）；默认关闭，行为与历史一致
 *   --no-write         只跑统计、不写产物（调试用）
 *   --dry-list         只打印待办清单规模后退出（不请求 API、不写产物，自证用）
 *
 * 断点续跑：进度缓存在 scripts/.gen-usage-extra-cache.json（已被 .gitignore 的
 * `scripts/.gen-*.json` 规则覆盖）。每批完成即落盘；Ctrl-C 会先落盘再退出。
 *
 * 资金安全阀：遇到 402 / Insufficient balance / 余额不足 立即停止，不重试、不烧钱。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { words as ALL_WORDS } from '../src/data/index.js'
import phonetics from '../src/data/phonetics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CACHE_PATH = path.join(__dirname, '.gen-usage-extra-cache.json')
const OUT_PATH = path.join(ROOT, 'src/data/usage-extra.js')
const REPORT_PATH = path.join(__dirname, '.usage-extra-pilot-report.json')
const LOG_PATH = path.join(__dirname, '.gen-usage-extra.log')

// ---------------------------------------------------------------- env
/**
 * 依次读 .env / .env.local（后读的只补空缺）。
 * token 只留在 Node 侧，绝不写入任何文件、绝不下发前端。
 */
function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const p = path.join(ROOT, name)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      if (!process.env[m[1]]) process.env[m[1]] = v
    }
  }
}
loadEnv()
const KEY = process.env.DEEPSEEK_API_KEY || ''
if (!KEY) {
  console.error('缺少 DEEPSEEK_API_KEY，请在 .env 或 .env.local 中配置后重试。')
  process.exit(1)
}

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2)
/** 取 --name value 或 --name=value；缺省返回 def */
function argVal(name, def) {
  const i = argv.indexOf(name)
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith(name + '='))
  if (eq) return eq.split('=').slice(1).join('=')
  return def
}
const has = (name) => argv.includes(name)

const PILOT = has('--pilot') ? Math.max(1, parseInt(argVal('--pilot', '50'), 10) || 50) : null
const LIMIT = has('--limit') ? Math.max(1, parseInt(argVal('--limit', '0'), 10) || 0) : null
const ONLY_MISSING = has('--only-missing') || has('--missing-only')
const ONLY_U = has('--only-u')
const FORCE = has('--force')
const NO_WRITE = has('--no-write')
// 排除专有名词（w.kind === 'proper'）。默认开启：专有名词不处理、不计费、不写入，
// 既符合「专有名词不用」的原始需求，又可省掉约 24.5% 的预算。用 --include-proper 可强制纳入。
const SKIP_PROPER = !has('--include-proper')
// 只打印待办清单规模就退出（不请求 API、不写产物），用于自证过滤前后词数。
const DRY_LIST = has('--dry-list')
const CONCURRENCY = Math.max(1, Math.min(8, parseInt(argVal('--concurrency', '4'), 10) || 4))
const DEFAULT_BATCH = ONLY_U ? 40 : 16
const BATCH = Math.max(1, Math.min(60, parseInt(argVal('--batch', String(DEFAULT_BATCH)), 10) || DEFAULT_BATCH))
const PILOT_TOP_RANK = 5000

/** --band lo-hi → [lo, hi]；解析失败抛错 */
function parseBand() {
  const raw = argVal('--band', '')
  if (!raw) return null
  const m = String(raw).match(/^\s*(\d+)\s*[-~,]\s*(\d+)\s*$/)
  if (!m) throw new Error(`--band 格式应为 lo-hi（如 1-20000），收到：${raw}`)
  const lo = parseInt(m[1], 10)
  const hi = parseInt(m[2], 10)
  if (lo > hi) throw new Error(`--band 下界 ${lo} 大于上界 ${hi}`)
  return [lo, hi]
}
const BAND = parseBand()

// ---------------------------------------------------------------- 词库清单
/** form(小写) -> { form, pos, gloss, freqRank, cefr, needsU } */
const byForm = new Map()
for (const w of ALL_WORDS) {
  if (!w || typeof w.form !== 'string' || !w.form) continue
  const key = w.form.toLowerCase()
  if (byForm.has(key)) continue
  const entry = phonetics && typeof phonetics === 'object' ? phonetics[key] : null
  const hasUsage = Boolean(entry && typeof entry.u === 'string' && entry.u.trim())
  byForm.set(key, {
    form: w.form,
    key,
    pos: typeof w.pos === 'string' ? w.pos : '',
    gloss: typeof w.gloss === 'string' ? w.gloss : '',
    // kind 用于 --skip-proper：'proper' 表示专有名词（人名/地名/机构名等）
    kind: typeof w.kind === 'string' ? w.kind : '',
    freqRank: typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) ? w.freqRank : Number.MAX_SAFE_INTEGER,
    cefr: typeof w.cefr === 'string' ? w.cefr : '',
    needsU: !hasUsage,
  })
}
const ALL_FORMS = [...byForm.keys()]
/** 稳定排序：词频升序（高频优先），同频按字母序保证可复现 */
const FORMS_BY_RANK = [...byForm.values()].sort((a, b) => {
  if (a.freqRank !== b.freqRank) return a.freqRank - b.freqRank
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
})
const MISSING_USAGE = FORMS_BY_RANK.filter((m) => m.needsU)

console.log(
  `[usage-extra] 词库唯一词形 ${ALL_FORMS.length} / 缺 usage ${MISSING_USAGE.length}` +
    `${BAND ? ` / band ${BAND[0]}-${BAND[1]}` : ''} / 并发 ${CONCURRENCY} / 每批 ${BATCH}` +
    `${ONLY_MISSING ? ' / only-missing' : ''}${ONLY_U ? ' / only-u' : ''}${SKIP_PROPER ? ' / skip-proper(default)' : ' / include-proper'}${PILOT != null ? ` / pilot ${PILOT}` : ''}`,
)

// ---------------------------------------------------------------- 断点缓存
/** @type {{ v:number, stats:object, tries:object, entries:object }} */
let cache = { v: 1, stats: blankStats(), tries: {}, entries: {} }
if (fs.existsSync(CACHE_PATH)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    if (parsed && parsed.v === 1 && parsed.entries && typeof parsed.entries === 'object') {
      cache = parsed
      cache.stats = { ...blankStats(), ...(parsed.stats || {}) }
      cache.tries = parsed.tries && typeof parsed.tries === 'object' ? parsed.tries : {}
    }
  } catch {
    console.warn('[usage-extra] 缓存损坏，重新开始（旧文件已备份为 .bad）')
    try {
      fs.renameSync(CACHE_PATH, CACHE_PATH + '.bad')
    } catch {
      /* 备份失败不影响主流程 */
    }
  }
}

// 词库会因其它任务线清理垃圾词而缩水：同步剪掉已不存在的键，避免产物里出现孤儿条目
let pruned = 0
for (const k of Object.keys(cache.entries)) {
  if (!byForm.has(k)) {
    delete cache.entries[k]
    delete cache.tries[k]
    pruned += 1
  }
}
if (pruned) console.log(`[usage-extra] 词库已变更，剪除失效键 ${pruned} 个`)

// 防御 Object.prototype 污染：词表里存在 'constructor' 这个真实单词，普通对象
// `cache.tries['constructor']` 会命中原型链上的 Object 构造函数（真值），使
// `(cache.tries[k] || 0) < MAX_TRIES` 变成 `NaN < 3 === false`，把该词误判成
// 「重试已达上限」而永久跳过。改成 null 原型对象后，键查询只认自身属性。
cache.tries = Object.assign(Object.create(null), cache.tries)

function blankStats() {
  return {
    requests: 0,
    failedRequests: 0,
    promptTokens: 0,
    completionTokens: 0,
    cachedPromptTokens: 0,
    wordsRequested: 0,
    wordsStored: 0,
    droppedByValidator: 0,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  }
}

function saveCache() {
  cache.stats.lastUpdatedAt = new Date().toISOString()
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache))
}

/** 把已有产物文件并入缓存（首次运行时用于接续历史产物） */
async function mergeOutputIntoCache() {
  if (!fs.existsSync(OUT_PATH)) return 0
  try {
    const mod = await import(pathToFileURL(OUT_PATH).href + '?t=' + fs.statSync(OUT_PATH).mtimeMs)
    const obj = mod && (mod.usageExtra || mod.default)
    if (!obj || typeof obj !== 'object') return 0
    let n = 0
    for (const [k, v] of Object.entries(obj)) {
      if (!byForm.has(k) || !v || typeof v !== 'object') continue
      const cur = cache.entries[k] || {}
      cache.entries[k] = { ...cur, ...v }
      n += 1
    }
    return n
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------- 字段完整性
/** 某字段是否已达标 */
function fieldOk(entry, field) {
  if (!entry || typeof entry !== 'object') return false
  if (field === 'c') return Array.isArray(entry.c) && entry.c.filter((s) => typeof s === 'string' && s.trim()).length >= 2
  if (field === 'b') return typeof entry.b === 'string' && entry.b.trim().length >= BG_MIN
  if (field === 'u') return typeof entry.u === 'string' && entry.u.trim().length >= USAGE_MIN
  return false
}

/** 该词本次需要哪些字段；空集合表示不需要处理 */
function wantedFields(meta) {
  if (ONLY_U) return meta.needsU ? ['u'] : []
  const out = ['c', 'b']
  if (meta.needsU) out.push('u')
  return out
}

function isDone(meta) {
  const want = wantedFields(meta)
  if (!want.length) return true
  const entry = cache.entries[meta.key]
  return want.every((f) => fieldOk(entry, f))
}

// ---------------------------------------------------------------- 归一化 / 校验
const FORBIDDEN_KEY = /phonetic|pronunc|pronunciation|ipa|音标|读音|发音/i
const IPA_CHARS = /[ˈˌəɪʊɛæɑɔʌʃʒθðŋɹɚɝɜɒɐˑː]/
const COLL_MIN = 3 // 单条搭配最少条数
const COLL_MAX = 6
const COLL_ITEM_MAX_WORDS = 10
const BG_MIN = 40 // 背景最短（目标 60–120，放宽下界避免误杀）
const BG_MAX = 260
const USAGE_MIN = 4
const USAGE_MAX = 40
const MAX_TRIES = 3

/** 疑似音标串：/.../ 包裹且含 IPA 字符，或 IPA 字符出现 ≥3 次 */
function looksLikePhonetic(s) {
  const t = String(s).trim()
  if (t.startsWith('/') && t.endsWith('/') && t.length > 2 && IPA_CHARS.test(t)) return 'slash-ipa'
  const hits = t.match(new RegExp(IPA_CHARS.source, 'g'))
  if (hits && hits.length >= 3) return 'ipa-chars'
  return ''
}

/** 递归扫描字段名黑名单 */
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

/** 归一化搭配列表：去重、丢空、丢「只有单词本身」的、丢疑似音标的 */
function normalizeCollocations(raw, meta) {
  if (!Array.isArray(raw)) return { list: [], dropped: 0 }
  const seen = new Set()
  const list = []
  let dropped = 0
  for (const item of raw) {
    if (typeof item !== 'string') {
      dropped += 1
      continue
    }
    let s = item.trim().replace(/^[-•*\d]+[.、)]?\s*/, '').replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
    if (!s) {
      dropped += 1
      continue
    }
    if (s.length > 120 || s.split(/\s+/).length > COLL_ITEM_MAX_WORDS) {
      dropped += 1
      continue
    }
    const flat = s.toLowerCase().replace(/[^a-z0-9'-]/g, '')
    const wordFlat = meta.key.toLowerCase().replace(/[^a-z0-9'-]/g, '')
    if (flat === wordFlat) {
      dropped += 1
      continue
    }
    if (looksLikePhonetic(s)) {
      dropped += 1
      continue
    }
    const dedup = s.toLowerCase()
    if (seen.has(dedup)) {
      dropped += 1
      continue
    }
    seen.add(dedup)
    list.push(s)
    if (list.length >= COLL_MAX) break
  }
  if (list.length < COLL_MIN) return { list: [], dropped: dropped + list.length }
  // 丢弃多余部分同样计为 dropped
  return { list: list.slice(0, COLL_MAX), dropped }
}

/** 归一化背景：60–120 字为目标，接受 [BG_MIN, BG_MAX] */
function normalizeBackground(raw) {
  if (typeof raw !== 'string') return { text: '', reason: 'not-string' }
  let s = raw.trim().replace(/^(背景|背景知识|Background)\s*[:：]\s*/i, '')
  s = s.replace(/^["'“”]+|["'“”]+$/g, '').trim()
  if (!s) return { text: '', reason: 'empty' }
  if (looksLikePhonetic(s)) return { text: '', reason: looksLikePhonetic(s) }
  if (s.length < BG_MIN) return { text: '', reason: `too-short(${s.length})` }
  if (s.length > BG_MAX) s = s.slice(0, BG_MAX)
  return { text: s, reason: '' }
}

/**
 * 在 max 字内截断，但退到最近的标点/空格边界，避免把英文单词切一半
 * （如 "…disposable tablew" 这种断尾）。
 */
function clipAtBoundary(s, max) {
  if (s.length <= max) return s
  const head = s.slice(0, max)
  const stops = /[。；！？，、,;.!?\s]/
  for (let i = head.length - 1; i >= Math.floor(max * 0.5); i -= 1) {
    if (stops.test(head[i])) return head.slice(0, i).replace(/[，,、；;\s]+$/, '')
  }
  return head
}

/** 归一化用法：≤USAGE_MAX 字 */
function normalizeUsage(raw) {
  if (typeof raw !== 'string') return { text: '', reason: 'not-string' }
  let s = raw.trim().replace(/^(用法|Usage)\s*[:：]\s*/i, '')
  s = s.replace(/^["'“”]+|["'“”]+$/g, '').trim()
  if (!s) return { text: '', reason: 'empty' }
  if (looksLikePhonetic(s)) return { text: '', reason: looksLikePhonetic(s) }
  if (s.length < USAGE_MIN) return { text: '', reason: `too-short(${s.length})` }
  if (s.length > USAGE_MAX) s = clipAtBoundary(s, USAGE_MAX)
  return { text: s, reason: '' }
}

/**
 * 把模型给的一条原始产出转成落盘条目。
 * @returns {{ entry: object|null, wanted: string[], missing: string[], dropped: number, reasons: string[] }}
 */
function buildEntry(raw, meta) {
  const want = wantedFields(meta)
  const reasons = []
  const missing = []
  const entry = {}
  let dropped = 0

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { entry: null, wanted: want, missing: want, dropped: 0, reasons: ['not-object'] }
  }

  // 音标红线：字段名黑名单（整条丢弃）
  const badKeys = []
  scanForbiddenKeys(raw, meta.key, badKeys)
  if (badKeys.length) {
    return { entry: null, wanted: want, missing: want, dropped: 0, reasons: [`forbidden-key:${badKeys[0]}`] }
  }

  let c = null
  if (want.includes('c')) {
    const r = normalizeCollocations(raw.c, meta)
    dropped += r.dropped
    if (r.list.length) c = r.list
    else {
      missing.push('c')
      reasons.push('c-invalid')
    }
  }
  if (c) entry.c = c

  if (want.includes('b')) {
    const r = normalizeBackground(raw.b)
    if (r.text) entry.b = r.text
    else {
      missing.push('b')
      reasons.push(`b:${r.reason}`)
    }
  }

  if (want.includes('u')) {
    const r = normalizeUsage(raw.u)
    if (r.text) entry.u = r.text
    else {
      missing.push('u')
      reasons.push(`u:${r.reason}`)
    }
  }

  // 一个字段都没拿到 → 整条丢弃（下次运行重试）
  if (Object.keys(entry).length === 0) {
    return { entry: null, wanted: want, missing, dropped, reasons }
  }
  return { entry, wanted: want, missing, dropped, reasons }
}

// ---------------------------------------------------------------- LLM
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
// 遗留模型别名：官方文档现指向 v4.1-flash 非思考模式；实测该名字当前仍 HTTP 200 可用，
// 故保留不改。若某天返回 401/404（别名下线），改回 'deepseek-flash' 即可。
const MODEL = 'deepseek-chat'
const REQUEST_TIMEOUT_MS = 180000

/** 资金/配额类致命错误：不再重试、立即停跑 */
class FatalError extends Error {}

let ABORTED = false

function buildPrompt(batch) {
  const list = batch
    .map((m) => {
      const hint = m.pos || m.gloss ? `（${[m.pos, m.gloss].filter(Boolean).join('：')}）` : ''
      const flag = m.needsU ? ' [需用法]' : ''
      return `- ${m.form}${hint}${flag}`
    })
    .join('\n')

  const taskLines = []
  if (ONLY_U) {
    taskLines.push('- u: 一条简短中文用法说明（30 字以内），讲清最常用的搭配或辨析要点。')
  } else {
    taskLines.push(
      '- c: 固定搭配 collocations，3~5 条**英文**搭配或短语（动宾 / 介宾 / 形+名 / 动+副 等），每条都是学习者可直接照搬使用的自然搭配；不要只写单词本身，不要重复单词原形单独成条。',
    )
    taskLines.push(
      '- b: 背景 background，60~120 字中文，讲这个词的来历（词源、构词理据）、文化背景、或中国学习者最常见的误用点，让人读完有「原来如此」的收获。',
    )
    if (batch.some((m) => m.needsU)) {
      taskLines.push(
        '- u: **凡标注 [需用法] 的词，u 必须给一条 30 字以内的中文用法说明，留空则该条整条判废**；未标注 [需用法] 的词 u 填空字符串 ""。',
      )
    }
  }

  return `你在为中文学习者编写英语单词的用法补充材料。

【本批单词】（每行：单词（词性：中文释义）[需用法]）
${list}

【任务】为每个单词生成：
${taskLines.join('\n')}

【输出】
只输出一个 JSON 对象，不要任何解释文字、不要 markdown 代码块：
{"items":[{"form":"单词原形","c":["..."],"b":"...","u":"..."}]}

硬性规则：
1. items 数量必须等于本批单词数量，form 原样照抄（大小写与输入一致），不要新增或遗漏。
2. ★★ 绝对禁止输出任何音标或发音内容 ★★
   不得出现 phonetic / ipa / pronunciation / 音标 / 读音 / 发音 之类的字段，
   不得出现 /.../ 形式的音标串，不得出现任何国际音标符号。
   音标只能由词典查表提供，模型生成的音标一律作废并整条丢弃。
3. c 必须是**英文**搭配短语，3~5 条，每条 2~8 个词，真实常用、可直接造句；不要加编号前缀。
4. b 必须是**中文**，60~120 字，言之有物（词源来历 / 文化背景 / 常见误用三选一或组合），不要写空话套话。
5. u 只对标注 [需用法] 的词给，其余填 ""；30 字以内中文。凡标注 [需用法] 的词 u 绝不能为空，否则整条作废。
6. 不确定的内容用保守表述，但字段必须齐全、非空，不要写「暂无」。`
}

async function callDeepSeek(prompt) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a precise lexicographer. Output strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8192,
      }),
      signal: ctrl.signal,
    })
    const bodyText = res.ok ? '' : await res.text().catch(() => '')
    if (!res.ok) {
      if (res.status === 402 || /insufficient\s+balance|余额不足|insufficient_balance/i.test(bodyText)) {
        throw new FatalError(`DeepSeek ${res.status}: 余额不足，立即停止（${bodyText.slice(0, 200)}）`)
      }
      throw new Error(`DeepSeek ${res.status}: ${bodyText.slice(0, 300)}`)
    }
    const data = await res.json()
    const usage = data && data.usage ? data.usage : {}
    const content = data.choices?.[0]?.message?.content || ''
    return {
      content,
      promptTokens: Number(usage.prompt_tokens) || 0,
      completionTokens: Number(usage.completion_tokens) || 0,
      cachedTokens: Number(usage.prompt_cache_hit_tokens) || 0,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** 解析模型输出 → { [小写form]: raw } */
function parseToMap(content, keys) {
  let s = String(content || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  let obj
  try {
    obj = JSON.parse(s)
  } catch {
    const a = s.indexOf('{')
    const b = s.lastIndexOf('}')
    if (a >= 0 && b > a) obj = JSON.parse(s.slice(a, b + 1))
    else throw new Error('JSON 解析失败')
  }
  const raws = Array.isArray(obj) ? obj : Array.isArray(obj?.items) ? obj.items : null
  const out = {}
  if (raws) {
    for (const it of raws) {
      if (it && typeof it.form === 'string') out[it.form.toLowerCase().trim()] = it
    }
  } else if (obj && typeof obj === 'object') {
    // 兜底：{ "word": {...} } 形式
    for (const [k, v] of Object.entries(obj)) {
      const lk = String(k).toLowerCase().trim()
      if (keys.includes(lk) && v && typeof v === 'object') out[lk] = { form: k, ...v }
    }
  }
  return out
}

// ---------------------------------------------------------------- 写盘
/** 用缓存内容重写 src/data/usage-extra.js（按字母序，一条一行，便于 diff） */
function writeOutput() {
  if (NO_WRITE) return
  const keys = Object.keys(cache.entries).sort()
  const lines = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(cache.entries[k])},`)
  const head = `/**
 * 用法补充数据（由 scripts/gen-usage-extra.mjs 生成，勿手工编辑）
 * ------------------------------------------------------------------
 * 键：单词 form 小写；字段：
 *   c = 固定搭配 collocations（英文短语数组，3~5 条）
 *   b = 背景 background（中文 60~120 字：词源来历 / 文化背景 / 常见误用）
 *   u = 用法 usage（中文 ≤30 字，**仅当 phonetics.js 该词缺 u 时才补**）
 *
 * ★ 音标红线：本文件不含任何音标字段（音标只能由 phonetics.js 查表提供）。
 * ★ 本文件体积较大，前端请按需异步加载，不要静态 import。
 *
 * 条数：${keys.length}
 * 生成时间：${new Date().toISOString()}
 */
export const usageExtra = {
`
  const tail = `
}

/**
 * 查一个单词的用法补充（固定搭配 / 背景 / 补缺用法）。
 * @param {string} form 单词词形（大小写不敏感）
 * @returns {{ collocations: string[], background: string, usage: string } | null}
 */
export function usageExtraOf(form) {
  if (typeof form !== 'string') return null
  const entry = usageExtra[form.toLowerCase()]
  if (!entry || typeof entry !== 'object') return null
  return {
    collocations: Array.isArray(entry.c) ? entry.c.filter((s) => typeof s === 'string') : [],
    background: typeof entry.b === 'string' ? entry.b : '',
    usage: typeof entry.u === 'string' ? entry.u : '',
  }
}

export default usageExtra
`
  fs.writeFileSync(OUT_PATH, head + lines.join('\n') + tail)
}

// ---------------------------------------------------------------- 金额估算
// 价格常量：DeepSeek 官方现行价（模型 deepseek-flash），2026-10-10 抓取自
//   https://api-docs.deepseek.com/quick_start/pricing
// 低谷时段（含全部周末）：输入 $0.15 / 输出 $0.60（USD / 百万 token）
// 高峰时段（UTC 周一–五 01:00–04:00 与 06:00–10:00）：输入 $0.30 / 输出 $1.20
// 这里按**低谷**价估算（最常见档位）。若在高峰时段跑，真实花费最高约为估算值的 2×。
// 注：缓存命中输入按 10% 计价（下方 costUsd 已实现）。
const PRICE_IN_PER_M = 0.15
const PRICE_OUT_PER_M = 0.60
function costUsd(st) {
  const missIn = Math.max(0, (st.promptTokens || 0) - (st.cachedPromptTokens || 0))
  const hitIn = Math.min(st.cachedPromptTokens || 0, st.promptTokens || 0)
  return (
    (missIn / 1e6) * PRICE_IN_PER_M +
    (hitIn / 1e6) * PRICE_IN_PER_M * 0.1 +
    ((st.completionTokens || 0) / 1e6) * PRICE_OUT_PER_M
  )
}

// ---------------------------------------------------------------- 并发池
async function runPool(items, worker, concurrency) {
  let cursor = 0
  const runners = Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
    while (!ABORTED) {
      const idx = cursor
      cursor += 1
      if (idx >= items.length) break
      await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
}

// ---------------------------------------------------------------- 待办清单
function buildWorkList() {
  let pool = FORMS_BY_RANK
  if (SKIP_PROPER) pool = pool.filter((m) => m.kind !== 'proper')
  if (ONLY_MISSING) pool = pool.filter((m) => m.needsU)
  if (BAND) pool = pool.filter((m) => m.freqRank >= BAND[0] && m.freqRank <= BAND[1])
  const pending = FORCE ? pool : pool.filter((m) => !isDone(m))

  // pilot 样本混合：一半取词频前 5000（代表高频），一半取缺 usage 集合
  if (PILOT != null) {
    const half = Math.ceil(PILOT / 2)
    const top = pending.filter((m) => m.freqRank <= PILOT_TOP_RANK).slice(0, half)
    const taken = new Set(top.map((m) => m.key))
    const rest = pending.filter((m) => !taken.has(m.key) && m.needsU).slice(0, PILOT - top.length)
    const rest2 =
      rest.length < PILOT - top.length
        ? rest.concat(
            pending
              .filter((m) => !taken.has(m.key) && !rest.some((r) => r.key === m.key))
              .slice(0, PILOT - top.length - rest.length),
          )
        : rest
    return [...top, ...rest2].slice(0, PILOT)
  }

  const capped = pending.filter((m) => (cache.tries[m.key] || 0) < MAX_TRIES)
  return LIMIT != null ? capped.slice(0, LIMIT) : capped
}

// ---------------------------------------------------------------- main
async function main() {
  const merged = await mergeOutputIntoCache()
  if (merged) console.log(`[usage-extra] 已并入既有产物 ${merged} 条`)

  const work = buildWorkList()
  if (DRY_LIST) {
    // 只自证待办清单规模，不请求 API、不写产物、不落盘
    const proper = work.filter((m) => m.kind === 'proper').length
    console.log(
      `[usage-extra] DRY-LIST 待办 ${work.length} 词（其中 proper ${proper} / 非 proper ${work.length - proper}）` +
        `${SKIP_PROPER ? ' [排除专有名词=开(default)]' : ' [排除专有名词=关(--include-proper)]'}` +
        `${BAND ? ` [band ${BAND[0]}-${BAND[1]}]` : ''}`,
    )
    return
  }
  if (work.length === 0) {
    console.log('[usage-extra] 无需生成（全部已完成）。')
    writeOutput()
    return
  }

  const batches = []
  for (let i = 0; i < work.length; i += BATCH) batches.push(work.slice(i, i + BATCH))

  const t0 = Date.now()
  // 累计统计是跨运行累加的；这里快照一份，报告里同时给出「本轮增量」与「累计」
  const st0 = { ...cache.stats }
  let processed = 0
  let nextReport = 500
  const generated = [] // pilot 报告用
  const dropReasons = new Map()
  let fatalMsg = ''

  const bump = (reason) => dropReasons.set(reason, (dropReasons.get(reason) || 0) + 1)

  await runPool(
    batches,
    async (batch, bidx) => {
      const keys = batch.map((m) => m.key)
      let ok = false
      for (let attempt = 1; attempt <= 3 && !ok && !ABORTED; attempt += 1) {
        try {
          const res = await callDeepSeek(buildPrompt(batch))
          cache.stats.requests += 1
          cache.stats.promptTokens += res.promptTokens
          cache.stats.completionTokens += res.completionTokens
          cache.stats.cachedPromptTokens += res.cachedTokens
          cache.stats.wordsRequested += batch.length

          const map = parseToMap(res.content, keys)
          let added = 0
          let dropped = 0
          for (const m of batch) {
            const raw = map[m.key]
            const r = buildEntry(raw, m)
            dropped += r.dropped
            if (!r.entry) {
              cache.tries[m.key] = (cache.tries[m.key] || 0) + 1
              for (const rs of r.reasons) bump(rs)
              continue
            }
            const cur = cache.entries[m.key] || {}
            const next = { ...cur, ...r.entry }
            // 字段顺序固定为 c, b, u，保证产物 diff 稳定
            cache.entries[m.key] = Object.fromEntries(
              ['c', 'b', 'u'].filter((f) => next[f] !== undefined).map((f) => [f, next[f]]),
            )
            added += 1
            cache.stats.wordsStored += 1
            for (const miss of r.missing) {
              const why = r.reasons.find((x) => x.startsWith(miss + ':'))
              bump(`missing:${miss}${why ? ':' + why.slice(miss.length + 1) : ''}`)
            }
            if (generated.length < 2000) {
              generated.push({ form: m.form, freqRank: m.freqRank, ...cache.entries[m.key] })
            }
          }
          cache.stats.droppedByValidator += dropped
          saveCache()
          if (!NO_WRITE) writeOutput()
          processed += batch.length
          ok = added > 0
          if (!ok) console.warn(`  [批 ${bidx + 1}/${batches.length}] 本轮 0 条入库，重试`)
          console.log(
            `  [批 ${bidx + 1}/${batches.length}] ${batch[0].form}…${batch[batch.length - 1].form} 入库 ${added}/${batch.length}` +
              ` | 累计 ${processed}/${work.length} | 请求 ${cache.stats.requests} | ≈$${costUsd(cache.stats).toFixed(3)}`,
          )
          if (processed >= nextReport) {
            nextReport += 500
            const st = cache.stats
            console.log(
              `  ── 进度 ${processed}/${work.length}：成功 ${st.wordsStored} · 丢弃 ${st.droppedByValidator} ·` +
                ` 失败请求 ${st.failedRequests} · token ${st.promptTokens}/${st.completionTokens} · ≈$${costUsd(st).toFixed(3)} ·` +
                ` ${((Date.now() - t0) / 1000).toFixed(0)}s`,
            )
          }
        } catch (e) {
          if (e instanceof FatalError) {
            ABORTED = true
            fatalMsg = e.message
            console.error(`\n[usage-extra] ⛔ 致命错误，立即停止：${e.message}`)
            return
          }
          cache.stats.failedRequests += 1
          console.warn(`  [批 ${bidx + 1}/${batches.length}] 第${attempt}次失败：${e.message}`)
          await new Promise((r) => setTimeout(r, 2000 * attempt))
        }
      }
      if (!ok && !ABORTED) {
        console.warn(`  [批 ${bidx + 1}/${batches.length}] 三次尝试均未入库，跳过（下次运行会重试）`)
      }
    },
    CONCURRENCY,
  )

  saveCache()
  writeOutput()

  // ---------------------------------------------------------------- 汇总报告
  const st = cache.stats
  const d = {
    requests: st.requests - st0.requests,
    failedRequests: st.failedRequests - st0.failedRequests,
    promptTokens: st.promptTokens - st0.promptTokens,
    completionTokens: st.completionTokens - st0.completionTokens,
    cachedPromptTokens: st.cachedPromptTokens - st0.cachedPromptTokens,
    wordsRequested: st.wordsRequested - st0.wordsRequested,
    wordsStored: st.wordsStored - st0.wordsStored,
    droppedByValidator: st.droppedByValidator - st0.droppedByValidator,
  }
  const secs = (Date.now() - t0) / 1000
  const entryCount = Object.keys(cache.entries).length
  // 中文占 3 字节 UTF-8，必须用 byteLength 而不是 JS 字符串长度，否则体积会严重低估
  const bytes = Buffer.byteLength(JSON.stringify(cache.entries), 'utf8')
  const avgBytes = entryCount ? bytes / entryCount : 0
  const lines = []
  lines.push(`[usage-extra] ${new Date().toISOString()}`)
  lines.push(`  模式        ${ONLY_U ? 'only-u' : 'c+b(+u)'}${ONLY_MISSING ? ' + only-missing' : ''}${BAND ? ` + band ${BAND[0]}-${BAND[1]}` : ''}${PILOT != null ? ` + pilot ${PILOT}` : ''}`)
  lines.push(`  本轮计划    ${work.length} 词 / ${batches.length} 批 / 并发 ${CONCURRENCY} / 每批 ${BATCH}`)
  lines.push(`  实际处理    ${processed} 词`)
  lines.push(`  入库词条    本轮 ${d.wordsStored}（缓存累计 ${entryCount} 条）`)
  lines.push(`  请求        本轮 ${d.requests} 次（失败 ${d.failedRequests} 次）｜累计 ${st.requests} 次`)
  lines.push(`  丢弃        本轮 ${d.droppedByValidator} 条（校验器拦截）`)
  lines.push(`  token       本轮 输入 ${d.promptTokens} / 输出 ${d.completionTokens}（缓存命中 ${d.cachedPromptTokens}）`)
  lines.push(`  金额估算    本轮 ≈$${costUsd(d).toFixed(4)}｜累计 ≈$${costUsd(st).toFixed(4)}（低谷价 $${PRICE_IN_PER_M}/M 输入 + $${PRICE_OUT_PER_M}/M 输出；高峰价 ×2）`)
  lines.push(`  耗时        ${(secs / 60).toFixed(1)} 分钟（${secs.toFixed(0)}s）｜${processed ? `${(secs / processed).toFixed(2)} s/词` : '—'}`)
  lines.push(`  每词字节    ${avgBytes.toFixed(0)} B（产物总字节 ${(bytes / 1024 / 1024).toFixed(2)} MB）`)
  if (ONLY_U) {
    lines.push(`  全量推算    ${MISSING_USAGE.length} 词 × ${(costUsd(d) / Math.max(1, d.wordsStored)).toFixed(6)} $/词 ≈ $${((costUsd(d) / Math.max(1, d.wordsStored)) * MISSING_USAGE.length).toFixed(2)}`)
  } else {
    lines.push(`  全量推算    ${ALL_FORMS.length} 词 × ${avgBytes.toFixed(0)} B ≈ ${((avgBytes * ALL_FORMS.length) / 1024 / 1024).toFixed(1)} MB`)
  }
  if (dropReasons.size) {
    lines.push('  丢弃原因：')
    ;[...dropReasons.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([r, n]) => lines.push(`    - ${r}: ${n}`))
  }
  if (fatalMsg) lines.push(`  ⛔ 中断原因  ${fatalMsg}`)
  const report = lines.join('\n')
  console.log('\n' + report)
  try {
    fs.appendFileSync(LOG_PATH, report + '\n\n')
  } catch {
    /* 日志写失败不影响主流程 */
  }

  // ---------------------------------------------------------------- pilot 样本
  if (PILOT != null && generated.length) {
    const samples = generated.slice(0, 10)
    fs.writeFileSync(
      REPORT_PATH,
      JSON.stringify({ generatedAt: new Date().toISOString(), samples, allCount: generated.length }, null, 2),
    )
    console.log(`\n=== pilot 真实样本（${samples.length}/${generated.length}，另存 ${path.relative(ROOT, REPORT_PATH)}）===`)
    for (const s of samples) {
      console.log(`\n【${s.form}】freqRank ${s.freqRank}`)
      console.log(`  c 固定搭配: ${Array.isArray(s.c) ? s.c.join(' / ') : '—'}`)
      console.log(`  b 背景: ${s.b || '—'}`)
      console.log(`  u 用法: ${s.u || '（该词已有用法，未生成）'}`)
    }
  }
}

// ---------------------------------------------------------------- 优雅中断
let sigintHandled = false
process.on('SIGINT', () => {
  if (sigintHandled) process.exit(130)
  sigintHandled = true
  ABORTED = true
  console.log('\n[usage-extra] 收到 Ctrl-C，正在落盘…（再按一次强制退出）')
  try {
    saveCache()
    writeOutput()
    console.log('[usage-extra] 进度已保存，可重新运行本命令续跑。')
  } catch (e) {
    console.error('[usage-extra] 落盘失败：', e.message)
  }
  process.exit(130)
})

main().catch((e) => {
  if (e instanceof FatalError) {
    console.error(`\n[usage-extra] ⛔ ${e.message}`)
    try {
      saveCache()
      writeOutput()
    } catch {
      /* ignore */
    }
    process.exit(2)
  }
  console.error(e)
  process.exit(1)
})

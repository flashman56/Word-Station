/**
 * scripts/gen-mono-words.mjs
 * ------------------------------------------------------------------
 * 用 DeepSeek 批量扩充「无词素词条库」（src/data/words-mono.js 现有 358 条），
 * 产出 src/data/words-mono-extra.js（AI 扩充）+ src/data/synants-mono.js（近义/反义关系）。
 *
 * 四类来源全部覆盖：
 *   mono   —— 单纯词（不可拆的本土词，如 cage / milk / jump / sad）
 *   loan   —— 外来词/借词（如 ballet / piano / sushi / karate），origin 形如 loan:fr
 *   proper —— 专有名词转普通词（地名/人名/神话 + eponym 普通词如 sandwich / boycott）
 *   phrase —— 固定搭配/短语（如 take off / in fact），id 带 phr- 前缀
 *
 * 用法：
 *   node scripts/gen-mono-words.mjs --pilot 40      # 只生成 40 个（验证管线）
 *   node scripts/gen-mono-words.mjs                 # 全量生成（默认目标：无词素词总数 ≥3000）
 *   node scripts/gen-mono-words.mjs --target 3200 --per 80
 *
 * 特点：
 *   - 从 .env 读取 DEEPSEEK_API_KEY
 *   - 全库去重：与 words-latin / words-greek / words-affix / words-extra / words-mono
 *     全部已有词条按 id + form（忽略大小写）查重
 *   - 可续跑：进度缓存在 scripts/.gen-mono-cache.json
 *   - 每批生成后立即校验 + 落盘，中途失败可安全重跑
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { words as allWords } from '../src/data/index.js'
import wordsMono from '../src/data/words-mono.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EXTRA_PATH = path.join(ROOT, 'src/data/words-mono-extra.js')
const REL_PATH = path.join(ROOT, 'src/data/synants-mono.js')
const CACHE_PATH = path.join(ROOT, 'scripts/.gen-mono-cache.json')

// ---------------- env ----------------
function loadEnv() {
  const p = path.join(ROOT, '.env')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
loadEnv()
const KEY = process.env.DEEPSEEK_API_KEY
if (!KEY) {
  console.error('缺少 DEEPSEEK_API_KEY，请在项目根目录 .env 中配置。')
  process.exit(1)
}

// ---------------- args ----------------
const argv = process.argv.slice(2)
function argVal(name, def) {
  const i = argv.indexOf(name)
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith(name + '='))
  if (eq) return eq.split('=').slice(1).join('=')
  return def
}
const EXISTING_MONO = wordsMono.length
const PILOT = argv.includes('--pilot') ? parseInt(argVal('--pilot', '40'), 10) : null
const TARGET_NEW = PILOT ?? Math.max(0, parseInt(argVal('--target', '3000'), 10) - EXISTING_MONO)
const PER = parseInt(argVal('--per', '80'), 10)

// ---------------- schema helpers（与 words-mono.js 的 makeWord 保持一致） ----------------
const slugify = (form) =>
  form.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function monoId(form, kind) {
  const phrasePrefix = kind === 'phrase' ? 'phr-' : ''
  return `w.${phrasePrefix}${slugify(form)}`
}

const VALID_CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const KINDS = ['mono', 'loan', 'proper', 'phrase']
const DEFAULT_CEFR = { mono: 'A2', loan: 'B1', proper: 'B1', phrase: 'B2' }

// ---------------- inventory / dedupe ----------------
const usedIds = new Set(allWords.map((w) => w.id))
const usedForms = new Set(allWords.map((w) => String(w.form).toLowerCase()))

// ---------------- resume cache ----------------
let cache = []
let relCache = { syn: [], ant: [] }
if (fs.existsSync(CACHE_PATH)) {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    cache = Array.isArray(raw.words) ? raw.words : []
    relCache = raw.relations && typeof raw.relations === 'object' ? raw.relations : { syn: [], ant: [] }
  } catch {
    cache = []
  }
}
for (const w of cache) {
  usedIds.add(w.id)
  usedForms.add(w.form.toLowerCase())
}

const relKeys = new Set()
for (const list of [relCache.syn, relCache.ant]) {
  for (const p of list) relKeys.add(`${String(p.a).toLowerCase()}|${String(p.b).toLowerCase()}`)
}

// ---------------- 分批主题队列 ----------------
const MONO_THEMES = [
  'animals, birds, insects and sea creatures',
  'fruits, vegetables, plants and trees',
  'food, cooking and kitchen items',
  'house, furniture and everyday objects',
  'clothing, accessories and fabrics',
  'body parts and physical actions',
  'emotions and personality traits',
  'weather, nature and landscape',
  'verbs of movement, speed and direction',
  'verbs of speaking, thinking and perception',
  'work, money and business basics',
  'school, learning and tools',
  'sports, games and play',
  'health, illness and the human body',
  'travel, transport and places in town',
  'time, numbers and measurement',
  'colors, shapes, sizes and textures',
  'family, people and social life',
  'law, war, government and religion',
  'music, art and entertainment',
  'materials, substances and containers',
  'farming, fishing and rural life',
  'communication, media and technology basics',
  'crime, safety and emergencies',
  'beauty, cleanliness and personal care',
]

const LOAN_THEMES = [
  { lang: 'fr', code: 'fr', theme: 'French food, cuisine and dining' },
  { lang: 'fr', code: 'fr', theme: 'French fashion, art and elegance' },
  { lang: 'fr', code: 'fr', theme: 'French law, politics and military words' },
  { lang: 'fr', code: 'fr', theme: 'French everyday and literary words' },
  { lang: 'it', code: 'it', theme: 'Italian music and art terms' },
  { lang: 'it', code: 'it', theme: 'Italian food and architecture' },
  { lang: 'es', code: 'es', theme: 'Spanish food, animals and culture' },
  { lang: 'es', code: 'es', theme: 'Spanish everyday and fiesta words' },
  { lang: 'de', code: 'de', theme: 'German philosophy, science and food' },
  { lang: 'de', code: 'de', theme: 'German everyday words and gems/geology' },
  { lang: 'ja', code: 'ja', theme: 'Japanese culture, food and aesthetics' },
  { lang: 'ja', code: 'ja', theme: 'Japanese martial arts and modern life' },
  { lang: 'zh', code: 'zh', theme: 'Chinese food, philosophy and objects' },
  { lang: 'ar', code: 'ar', theme: 'Arabic science, math and trade words' },
  { lang: 'ar', code: 'ar', theme: 'Arabic everyday and spices words' },
  { lang: 'hi', code: 'hi', theme: 'Hindi clothing, life and philosophy' },
  { lang: 'ru', code: 'ru', theme: 'Russian food, culture and politics' },
  { lang: 'tr', code: 'tr', theme: 'Turkish everyday items and food' },
  { lang: 'sa', code: 'sa', theme: 'Sanskrit philosophy, yoga and religion' },
  { lang: 'others', code: 'other', theme: 'words from Nahuatl, Quechua, Polynesian and African languages (food, nature, culture)' },
  { lang: 'others', code: 'other', theme: 'words from Korean, Thai, Vietnamese, Portuguese and Dutch (food, culture, trade)' },
  { lang: 'others', code: 'other', theme: 'words from Persian, Swahili, Greek, Native American and Celtic languages' },
]

const PROPER_THEMES = [
  'capital cities and major world cities (not Paris/Tokyo/London/Beijing/Shanghai/New York)',
  'famous scientists and mathematicians (not Einstein/Newton/Darwin/Galileo/Copernicus/Tesla/Edison)',
  'famous writers and poets (not Shakespeare/Tolstoy/Dante/Goethe/Homer)',
  'composers, painters and sculptors (not Mozart/Beethoven/Picasso/Michelangelo)',
  'world leaders and historical figures (not Caesar/Napoleon/Lincoln/Washington/Gandhi/Mandela/Cleopatra)',
  'rivers, mountains, deserts, seas and famous landmarks (not Nile/Atlantic/Everest/Sahara/Himalayas/Amazon)',
  'Greek, Roman and Norse mythology figures (not Socrates/Plato/Aristotle/Homer)',
  'eponyms that became everyday English words (lowercase, e.g. sandwich-like: boycott, pasteurize, silhouette...)',
  'explorers, inventors and engineers (not Columbus/Magellan)',
  'famous universities, institutions and historical events/places (not Oxford/Cambridge/Harvard)',
]

const PHRASE_THEMES = [
  'phrasal verbs with take / get / make',
  'phrasal verbs with go / come / run',
  'phrasal verbs with put / set / turn',
  'phrasal verbs with break / bring / carry',
  'phrasal verbs with look / give / hold',
  'phrasal verbs with keep / let / point / work',
  'phrasal verbs with fall / cut / drop / stand',
  'prepositional and connective phrases with in / on / at',
  'prepositional and connective phrases with by / for / of / to',
  'idioms with body parts (heart, hand, eye, head...)',
  'idioms with animals and food',
  'idioms about time, money and luck',
  'everyday conversational set phrases (e.g. in fact / as it were style)',
  'business and formal writing set phrases',
]

/** 无限产出批次计划的生成器：按 mono → loan → proper → phrase 轮转，不够则再来一轮 */
function* batchQueue() {
  let round = 0
  const monoPer = PER
  const plan = []
  // 第一轮按四类配比铺满：mono 14 批 / loan 7 批 / proper 6 批 / phrase 8 批（约 35 批 × 80 ≈ 2800 新词）
  const firstRound = [
    ...MONO_THEMES.slice(0, 14).map((t) => ({ kind: 'mono', theme: t })),
    ...LOAN_THEMES.slice(0, 7).map((s) => ({ kind: 'loan', theme: s.theme, origin: `loan:${s.code}` })),
    ...PROPER_THEMES.slice(0, 6).map((t) => ({ kind: 'proper', theme: t })),
    ...PHRASE_THEMES.slice(0, 8).map((t) => ({ kind: 'phrase', theme: t })),
  ]
  const laterRounds = () => [
    ...MONO_THEMES.map((t) => ({ kind: 'mono', theme: t })),
    ...LOAN_THEMES.map((s) => ({ kind: 'loan', theme: s.theme, origin: `loan:${s.code}` })),
    ...PROPER_THEMES.map((t) => ({ kind: 'proper', theme: t })),
    ...PHRASE_THEMES.map((t) => ({ kind: 'phrase', theme: t })),
  ]
  while (true) {
    const batches = round === 0 ? firstRound : laterRounds()
    for (const b of batches) yield { ...b, round }
    round += 1
  }
}

// ---------------- prompt ----------------
const KIND_RULES = {
  mono: 'kind 必须是 "mono"，origin 固定填 "germanic"。只收单个英语单词（不含空格、不含连字符亦可含连字符但必须是一个词位），必须是不可拆分词素的本土常用词（古英语/本土词源优先）。',
  loan: 'kind 必须是 "loan"，origin 按真实借出语言填，格式 "loan:fr" / "loan:it" / "loan:es" / "loan:de" / "loan:ja" / "loan:zh" / "loan:ar" / "loan:hi" / "loan:ru" / "loan:tr" / "loan:sa" / "loan:other"。',
  proper: 'kind 必须是 "proper"。若是地名/人名/山川等专有名词，origin 填 "proper"；若是由人名/地名转成的普通英语词（如 sandwich、boycott、quixotic），origin 填 "eponym"，form 用小写。',
  phrase: 'kind 必须是 "phrase"，origin 固定填 "phrase"。必须是固定搭配或短语（2~6 个单词，用空格分隔），form 保持小写。',
}

function buildPrompt(batch, n, recentForms) {
  const kindRule = KIND_RULES[batch.kind]
  const avoid = recentForms.length
    ? `\n【已收录的词条样例（绝对禁止重复，也不要给它们的屈折变形）】\n${recentForms.join(', ')}\n`
    : ''
  return `你在为中文学习者构建"无词素单词"词库（这类词无法用词根词缀拆解，靠整体记忆）。

【本批类别】${batch.kind}
【本批主题】${batch.theme}
【类别规则】${kindRule}

【任务】生成 ${n} 个符合上述类别与主题的词条。

硬性规则：
1. 每个词条的 form 必须真实存在、拼写正确（专有名词保留大写；短语全小写）。
2. form 中不要出现逗号、括号、引号；短语用空格分隔。
3. pos：词性缩写，如 n. / v. / adj. / adv. / prep. / phrase（短语一律填 phrase）。
4. gloss：简体中文释义，简洁准确，20 字以内，用「；」分隔多义。
5. cefr：从 A2 / B1 / B2 / C1 中选一个最贴切的。
6. syn / ant（可选）：各 0~3 个英语单词词形，作为近义词/反义词提示。优先给常见词（最好已在学习者词典中），也可以给本批其他新词。专有名词（kind=proper）syn/ant 留空数组。短语的 syn/ant 一般留空数组。
7. 词条之间、以及与上面「已收录词条」之间不得重复（忽略大小写）。
8. 只输出 JSON 对象：{"words":[...]}，不要解释文字、不要 markdown 代码块。

每个词条对象字段：
- form: 词条原形
- pos: 词性缩写
- gloss: 中文释义
- kind: "${batch.kind}"
- origin: 见类别规则
- cefr: "A2"|"B1"|"B2"|"C1"
- syn: [近义词形数组]（可为空）
- ant: [反义词形数组]（可为空）`
}

// ---------------- DeepSeek ----------------
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a precise bilingual lexicographer. Output strict JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.1,
      max_tokens: 8000,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`DeepSeek ${res.status}: ${t.slice(0, 300)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function parseWords(content) {
  let s = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  let obj
  try {
    obj = JSON.parse(s)
  } catch {
    const a = s.indexOf('{')
    const b = s.lastIndexOf('}')
    if (a >= 0 && b > a) obj = JSON.parse(s.slice(a, b + 1))
    else throw new Error('JSON 解析失败')
  }
  return Array.isArray(obj) ? obj : obj.words || []
}

// ---------------- 校验 / 规范化 ----------------
const FORM_RE = /^[A-Za-z][A-Za-z'’\- ]*$/
const CJK_RE = /[\u4e00-\u9fff]/

/** 校验并规范化一个模型输出的词条；不合规返回错误信息（字符串），合规返回词条对象。 */
function normalize(w, seq) {
  if (!w || typeof w.form !== 'string') return 'no form'
  const form = w.form.trim().replace(/\s+/g, ' ')
  if (!form) return 'empty form'
  if (!FORM_RE.test(form)) return 'bad form chars'
  if (form.length > 60) return 'form too long'
  const lower = form.toLowerCase()
  if (usedForms.has(lower)) return 'dup form'
  const kind = KINDS.includes(w.kind) ? w.kind : batchKindFallback(form)
  if (kind !== w.kind) return 'kind mismatch'
  if (kind === 'phrase') {
    const parts = form.split(' ')
    if (parts.length < 2 || parts.length > 6) return 'phrase word count'
  } else if (kind !== 'proper' && /\s/.test(form)) {
    return 'non-phrase with space'
  }
  const origin = typeof w.origin === 'string' && w.origin.trim() ? w.origin.trim() : null
  if (!origin) return 'no origin'
  if (kind === 'loan' && !/^loan:[a-z]+$/.test(origin)) return 'bad loan origin'
  const pos = typeof w.pos === 'string' && w.pos.trim() ? w.pos.trim() : null
  if (!pos) return 'no pos'
  const gloss = typeof w.gloss === 'string' && CJK_RE.test(w.gloss) ? w.gloss.trim() : null
  if (!gloss) return 'no chinese gloss'
  const cefr = VALID_CEFR.includes(w.cefr) ? w.cefr : DEFAULT_CEFR[kind]
  const id = monoId(form, kind)
  if (usedIds.has(id)) return 'dup id'

  const word = {
    id,
    form,
    pos: kind === 'phrase' ? 'phrase' : pos,
    gloss,
    morphs: [],
    chain: [],
    morphless: true,
    kind,
    origin,
    freqRank: 4200 + seq * 3,
    cefr,
  }
  return word
}

function batchKindFallback() {
  return null
}

// ---------------- 关系（近义/反义） ----------------
/** 收集本批新词 + 既有词的词形索引，用于解析关系端点 */
function buildFormIndex(extraForms) {
  const map = new Map()
  for (const w of allWords) {
    const k = String(w.form).toLowerCase()
    if (!map.has(k)) map.set(k, w.form)
  }
  for (const f of extraForms) {
    const k = f.toLowerCase()
    if (!map.has(k)) map.set(k, f)
  }
  return map
}

function collectRelations(rawWords, newWordForms, formIndex) {
  const newForms = new Set(newWordForms.map((f) => f.toLowerCase()))
  const addedSyn = []
  const addedAnt = []
  for (const w of rawWords) {
    if (!w || typeof w.form !== 'string') continue
    const aKey = w.form.toLowerCase()
    if (!newForms.has(aKey)) continue
    for (const [field, bucket] of [['syn', addedSyn], ['ant', addedAnt]]) {
      const arr = Array.isArray(w[field]) ? w[field] : []
      for (const raw of arr.slice(0, 3)) {
        if (typeof raw !== 'string') continue
        const other = formIndex.get(raw.trim().toLowerCase())
        if (!other) continue
        const a = w.form
        const b = other
        if (a.toLowerCase() === b.toLowerCase()) continue
        const key = `${a.toLowerCase()}|${b.toLowerCase()}`
        if (relKeys.has(key)) continue
        relKeys.add(key)
        bucket.push({ a, b, grade: 3, note: 'AI 扩充（gen-mono-words）' })
      }
    }
  }
  return { addedSyn, addedAnt }
}

// ---------------- 落盘 ----------------
function writeOutputs() {
  const header =
    '/**\n' +
    ' * AI 扩充无词素词条库（DeepSeek 生成）\n' +
    ' * 由 scripts/gen-mono-words.mjs 生成，请勿手工修改。\n' +
    ` * 词数: ${cache.length}\n` +
    ' */\n'
  const body = cache.map((w) => '  ' + JSON.stringify(w)).join(',\n')
  fs.writeFileSync(EXTRA_PATH, `${header}const wordsMonoExtra = [\n${body}\n]\n\nexport default wordsMonoExtra\n`)

  const relHeader =
    '/**\n' +
    ' * AI 扩充无词素词条的近义/反义关系（DeepSeek 生成，端点均已在词库中解析）\n' +
    ' * 由 scripts/gen-mono-words.mjs 生成，请勿手工修改。\n' +
    ` * 近义对: ${relCache.syn.length}　反义对: ${relCache.ant.length}\n` +
    ' */\n'
  const fmt = (pairs) =>
    pairs.map((p) => `  { a: ${JSON.stringify(p.a)}, b: ${JSON.stringify(p.b)}, grade: ${p.grade}, note: ${JSON.stringify(p.note)} }`).join(',\n')
  fs.writeFileSync(
    REL_PATH,
    `${relHeader}export const MONO_SYNONYMS = [\n${fmt(relCache.syn)}\n]\n\nexport const MONO_ANTONYMS = [\n${fmt(relCache.ant)}\n]\n`,
  )

  fs.writeFileSync(CACHE_PATH, JSON.stringify({ words: cache, relations: relCache }, null, 0))
}

function kindStats() {
  const stats = { mono: 0, loan: 0, proper: 0, phrase: 0 }
  for (const w of [...wordsMono, ...cache]) {
    if (stats[w.kind] != null) stats[w.kind] += 1
    else stats[w.kind] = 1
  }
  return stats
}

// ---------------- main ----------------
async function main() {
  console.log(`既有无词素词条 ${EXISTING_MONO} 条，目标新增 ${TARGET_NEW} 条，每批 ${PER} 条，缓存已有 ${cache.length} 条`)
  if (TARGET_NEW === 0) {
    console.log('目标已达成，无需生成。')
    return
  }

  let seq = cache.length
  let fails = 0
  let generatedThisRun = 0
  const queue = batchQueue()

  while (cache.length < TARGET_NEW) {
    const batch = queue.next().value
    const need = Math.min(PER, TARGET_NEW - cache.length)
    // 排除列表：最近生成的词（全局防重），样本展示给模型
    const recent = cache.slice(-Math.min(600, cache.length)).map((w) => w.form)
    const existingSample = wordsMono.slice(0, 120).map((w) => w.form)
    const prompt = buildPrompt(batch, need, [...existingSample, ...recent].slice(-800))
    const tag = `#${batch.kind}/${batch.round} ${batch.theme.slice(0, 28)}`

    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt += 1) {
      try {
        const content = await callDeepSeek(prompt)
        const raw = parseWords(content)
        const accepted = []
        let rejected = 0
        for (const w of raw) {
          const nw = normalize(w, seq)
          if (typeof nw === 'string') {
            rejected += 1
            continue
          }
          cache.push(nw)
          usedIds.add(nw.id)
          usedForms.add(nw.form.toLowerCase())
          accepted.push(nw)
          seq += 1
        }
        // 关系：把本批新词的 syn/ant 解析到「全库 + 本批新词」的词形上
        const formIndex = buildFormIndex(accepted.map((w) => w.form))
        const { addedSyn, addedAnt } = collectRelations(raw, accepted.map((w) => w.form), formIndex)
        relCache.syn.push(...addedSyn)
        relCache.ant.push(...addedAnt)
        writeOutputs()
        console.log(
          `  [${tag}] 接收 ${accepted.length}（拒绝 ${rejected}）→ 缓存 ${cache.length}；+syn ${addedSyn.length} / +ant ${addedAnt.length}`,
        )
        ok = accepted.length > 0
      } catch (e) {
        console.warn(`  [${tag}] 第${attempt}次失败: ${e.message}`)
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
    if (!ok) {
      fails += 1
      if (fails > 10) {
        console.error('连续多批无产出，提前中止（缓存已落盘，可重跑续接）。')
        break
      }
    } else {
      fails = 0
      generatedThisRun += 1
    }
  }

  writeOutputs()
  const total = EXISTING_MONO + cache.length
  console.log(`完成：无词素词条共 ${total} 条（新增 ${cache.length}）`)
  console.log(`四类分布：`, kindStats())
  console.log(`关系：syn ${relCache.syn.length} 对 / ant ${relCache.ant.length} 对`)
  console.log(`产出文件：src/data/words-mono-extra.js + src/data/synants-mono.js`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

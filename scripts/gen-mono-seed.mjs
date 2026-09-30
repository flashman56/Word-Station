/**
 * scripts/gen-mono-seed.mjs
 * ------------------------------------------------------------------
 * 「词表种子 + DeepSeek 标注」模式：把 scripts/seed-words.txt（约 4.7 万条、
 * 已做全库去重）中的种子词逐批交给 DeepSeek 标注，产出：
 *   - src/data/words-mono-seed.js    （词条，结构与 words-mono-extra.js 同构）
 *   - src/data/synants-mono-seed.js  （近义/反义关系，结构与 synants-mono.js 同构）
 *
 * 与 gen-mono-words.mjs（自由生成模式）互不影响：
 *   - 独立缓存 scripts/.gen-mono-seed-cache.json（断点续跑）
 *   - 不读写 .gen-mono-cache.json / words-mono-extra.js / synants-mono.js
 *
 * 用法：
 *   node scripts/gen-mono-seed.mjs --pilot 40     # 只标注 40 词（验证管线）
 *   node scripts/gen-mono-seed.mjs                # 全量（按 seed-words.txt 顺序跑完）
 *   node scripts/gen-mono-seed.mjs --limit 5000   # 只跑前 5000 个种子
 *   node scripts/gen-mono-seed.mjs --per 80       # 每批词数（默认 80）
 *
 * 健壮性：
 *   - 每批失败自动重试 3 次（退避 1.5s/3s/4.5s）
 *   - 连续 10 批零产出则中止（缓存已落盘，重跑续接）
 *   - 全库 form/id 去重（含 words-extra 派生词与既有全部无词素词）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { words as allWords } from '../src/data/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SEED_PATH = path.join(ROOT, 'scripts/seed-words.txt')
const EXTRA_PATH = path.join(ROOT, 'src/data/words-mono-seed.js')
const REL_PATH = path.join(ROOT, 'src/data/synants-mono-seed.js')
const CACHE_PATH = path.join(ROOT, 'scripts/.gen-mono-seed-cache.json')

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
const PILOT = argv.includes('--pilot') ? parseInt(argVal('--pilot', '40'), 10) : null
const LIMIT = PILOT ?? (argv.includes('--limit') ? parseInt(argVal('--limit', '0'), 10) : 0)
const PER = Math.max(10, parseInt(argVal('--per', '80'), 10))
const MAX_CONSEC_FAILS = 10
const RETRIES_PER_BATCH = 3

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

// ---------------- seed ----------------
const SEED_RE = /^[a-z][a-z'’-]*$/
function loadSeed() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`缺少种子词表 ${SEED_PATH}`)
    process.exit(1)
  }
  const out = []
  const seen = new Set()
  for (const line of fs.readFileSync(SEED_PATH, 'utf8').split(/\r?\n/)) {
    const t = line.trim().toLowerCase()
    if (!SEED_RE.test(t) || t.length < 2 || t.length > 24 || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}
const seedWords = loadSeed()
const seedTarget = LIMIT > 0 ? Math.min(LIMIT, seedWords.length) : seedWords.length

// ---------------- inventory / dedupe ----------------
const usedIds = new Set(allWords.map((w) => w.id))
const usedForms = new Set(allWords.map((w) => String(w.form).toLowerCase()))

// ---------------- resume cache ----------------
let cache = []
let relCache = { syn: [], ant: [] }
let cursor = 0 // 已消费的种子词数量（无论接受与否，保证可续跑不回头）
if (fs.existsSync(CACHE_PATH)) {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    cache = Array.isArray(raw.words) ? raw.words : []
    relCache = raw.relations && typeof raw.relations === 'object' ? raw.relations : { syn: [], ant: [] }
    cursor = Number.isInteger(raw.cursor) && raw.cursor >= 0 ? raw.cursor : cache.length
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

// ---------------- prompt（标注模式） ----------------
function buildPrompt(batchForms) {
  return `你在为中文学习者构建「无词素单词」词库（这类词无法用词根词缀拆解，靠整体记忆）。
下面给你一批真实存在的英语种子词，请逐个标注。

【种子词（共 ${batchForms.length} 个，按顺序处理，一个都不许跳过）】
${batchForms.join(', ')}

【标注规则】
1. form：原样返回该词（保持我给你的拼写）。
2. kind（四选一）：
   - "mono"：不可拆词素的本土/基本词（如 milk、cage、jump），origin 固定 "germanic"；
   - "loan"：外来借词（如 ballet、piano、sushi），origin 填 "loan:fr"/"loan:it"/"loan:es"/"loan:de"/"loan:ja"/"loan:zh"/"loan:ar"/"loan:hi"/"loan:ru"/"loan:tr"/"loan:sa"/"loan:other" 之一；
   - "proper"：专有名词（人名/地名/品牌等，保留大写），origin 填 "proper"；若是由人名/地名转成的普通词（eponym，如 boycott、sandwich），form 用小写、origin 填 "eponym"；
   - "phrase"：若该种子实为固定短语（罕见），origin 填 "phrase"。
3. pos：词性缩写，如 n. / v. / adj. / adv. / prep. / pron. / conj. / interj. / num. / phrase（短语一律 phrase）。
4. gloss：简体中文释义，简洁准确，20 字以内，多义用「；」分隔。
5. cefr：从 A1/A2/B1/B2/C1/C2 选最贴切的一个。
6. syn / ant：各 0~3 个英语词形（近义词/反义词提示，优先常见词）。专有名词（kind=proper）两栏都留空数组；短语一般留空数组。
7. 只输出 JSON 对象：{"words":[...]}，数组顺序与种子词顺序一致，不要解释文字、不要 markdown 代码块。

每个词条对象字段：
- form, pos, gloss, kind, origin, cefr, syn (数组), ant (数组)`
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
      temperature: 0.4,
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

/** 校验并规范化一个标注结果；seedRank 为种子表频序（1 起）。不合规返回错误信息（字符串），合规返回词条对象。 */
function normalize(w, seedRank) {
  if (!w || typeof w.form !== 'string') return 'no form'
  const form = w.form.trim().replace(/\s+/g, ' ')
  if (!form) return 'empty form'
  if (!FORM_RE.test(form)) return 'bad form chars'
  if (form.length > 60) return 'form too long'
  const lower = form.toLowerCase()
  if (usedForms.has(lower)) return 'dup form'

  // 标注模式容错：kind 非法回退 mono；loan 的 origin 非法则降级为 mono
  let kind = KINDS.includes(w.kind) ? w.kind : 'mono'
  let origin = typeof w.origin === 'string' && w.origin.trim() ? w.origin.trim() : null
  if (kind === 'loan' && (!origin || !/^loan:[a-z]+$/.test(origin))) {
    kind = 'mono'
    origin = 'germanic'
  }
  if (!origin) origin = kind === 'mono' ? 'germanic' : kind === 'phrase' ? 'phrase' : 'proper'
  if (kind === 'phrase') {
    const parts = form.split(' ')
    if (parts.length < 2 || parts.length > 6) return 'phrase word count'
  } else if (kind !== 'proper' && /\s/.test(form)) {
    return 'non-phrase with space'
  }

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
    // 种子表本身按频率排序：freqRank 直接取种子频序（真实频序，比自由生成的伪频序更有意义）
    freqRank: seedRank,
    cefr,
  }
  return word
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
        bucket.push({ a, b, grade: 3, note: 'AI 扩充（gen-mono-seed）' })
      }
    }
  }
  return { addedSyn, addedAnt }
}

// ---------------- 落盘 ----------------
function writeOutputs() {
  const header =
    '/**\n' +
    ' * 词表种子标注扩充的无词素词条库（DeepSeek 标注 seed-words.txt）\n' +
    ' * 由 scripts/gen-mono-seed.mjs 生成，请勿手工修改。\n' +
    ` * 词数: ${cache.length}\n` +
    ' */\n'
  const body = cache.map((w) => '  ' + JSON.stringify(w)).join(',\n')
  fs.writeFileSync(EXTRA_PATH, `${header}const wordsMonoSeed = [\n${body}\n]\n\nexport default wordsMonoSeed\n`)

  const relHeader =
    '/**\n' +
    ' * 词表种子标注词条的近义/反义关系（端点均已在词库中解析）\n' +
    ' * 由 scripts/gen-mono-seed.mjs 生成，请勿手工修改。\n' +
    ` * 近义对: ${relCache.syn.length}　反义对: ${relCache.ant.length}\n` +
    ' */\n'
  const fmt = (pairs) =>
    pairs.map((p) => `  { a: ${JSON.stringify(p.a)}, b: ${JSON.stringify(p.b)}, grade: ${p.grade}, note: ${JSON.stringify(p.note)} }`).join(',\n')
  fs.writeFileSync(
    REL_PATH,
    `${relHeader}export const MONO_SEED_SYNONYMS = [\n${fmt(relCache.syn)}\n]\n\nexport const MONO_SEED_ANTONYMS = [\n${fmt(relCache.ant)}\n]\n`,
  )

  fs.writeFileSync(CACHE_PATH, JSON.stringify({ words: cache, relations: relCache, cursor }, null, 0))
}

function kindStats() {
  const stats = {}
  for (const w of cache) stats[w.kind] = (stats[w.kind] || 0) + 1
  return stats
}

// ---------------- main ----------------
async function main() {
  console.log(
    `种子词 ${seedWords.length} 条，本轮目标 ${seedTarget} 条，每批 ${PER} 条，` +
      `缓存已有 ${cache.length} 条（cursor=${cursor}）`,
  )
  if (cursor >= seedTarget) {
    console.log('目标已达成，无需标注。')
    return
  }

  let fails = 0
  let processedThisRun = 0

  while (cursor < seedTarget) {
    // 取一批种子词；跳过缓存词条已覆盖的（理论上不会，但防御性处理）
    const batchForms = []
    let consumed = 0
    while (cursor + consumed < seedTarget && batchForms.length < PER) {
      const f = seedWords[cursor + consumed]
      if (!usedForms.has(f)) batchForms.push(f)
      consumed += 1
    }
    const batchStart = cursor
    cursor += consumed

    const tag = `#${batchStart}-${cursor - 1}`
    if (batchForms.length === 0) {
      writeOutputs()
      continue
    }

    let ok = false
    for (let attempt = 1; attempt <= RETRIES_PER_BATCH && !ok; attempt += 1) {
      try {
        const content = await callDeepSeek(buildPrompt(batchForms))
        const raw = parseWords(content)
        // 按种子顺序对齐：用 form（忽略大小写）做索引，而非依赖模型返回顺序
        const byForm = new Map()
        for (const w of raw) {
          if (w && typeof w.form === 'string') byForm.set(w.form.trim().toLowerCase(), w)
        }
        const accepted = []
        let rejected = 0
        for (let bi = 0; bi < batchForms.length; bi += 1) {
          const f = batchForms[bi]
          const nw = normalize(byForm.get(f) || null, batchStart + bi + 1)
          if (typeof nw === 'string') {
            rejected += 1
            continue
          }
          cache.push(nw)
          usedIds.add(nw.id)
          usedForms.add(nw.form.toLowerCase())
          accepted.push(nw)
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
        ok = true
      } catch (e) {
        console.warn(`  [${tag}] 第${attempt}次失败: ${e.message}`)
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
    processedThisRun += consumed
    if (!ok) {
      fails += 1
      console.warn(`  [${tag}] 本批最终失败（种子词已消费，续跑不会重试该批）`)
      if (fails >= MAX_CONSEC_FAILS) {
        console.error(`连续 ${MAX_CONSEC_FAILS} 批无产出，中止（缓存已落盘，可重跑续接 cursor=${cursor}）。`)
        break
      }
    } else {
      fails = 0
    }
  }

  writeOutputs()
  console.log(`完成：本轮消费种子 ${processedThisRun} 个，累计标注 ${cache.length} 条`)
  console.log(`四类分布：`, kindStats())
  console.log(`关系：syn ${relCache.syn.length} 对 / ant ${relCache.ant.length} 对`)
  console.log(`产出文件：src/data/words-mono-seed.js + src/data/synants-mono-seed.js`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

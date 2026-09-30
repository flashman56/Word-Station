/**
 * scripts/gen-words.mjs
 * ------------------------------------------------------------------
 * 用 DeepSeek 批量生成 IELTS~GRE 级别的单词，并挂到既有词素库存上，
 * 产出 src/data/words-extra.js（AI 扩充词库）。
 *
 * 用法：
 *   node scripts/gen-words.mjs --pilot 40      # 只生成 40 个（验证管线）
 *   node scripts/gen-words.mjs                 # 全量生成（默认目标 2000）
 *   node scripts/gen-words.mjs --target 2000 --per 20
 *
 * 特点：
 *   - 从 .env 读取 DEEPSEEK_API_KEY
 *   - 每个单词的 morphs / chain[].morph 必须是已注册词素 id（保证连进网络图）
 *   - 可续跑：进度缓存在 scripts/.gen-cache.json，已存在的 id 跳过
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import morphemes from '../src/data/morphemes.js'
import wordsLatin from '../src/data/words-latin.js'
import wordsGreek from '../src/data/words-greek.js'
import wordsAffix from '../src/data/words-affix.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EXTRA_PATH = path.join(ROOT, 'src/data/words-extra.js')
const CACHE_PATH = path.join(ROOT, 'scripts/.gen-cache.json')

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
const TARGET = PILOT ?? parseInt(argVal('--target', '2000'), 10)
const PER = parseInt(argVal('--per', '24'), 10)
// 每批给定「词素窗口」大小：单词用到窗口内任意一个词素即可（比单根出词产率高得多）
const WINDOW = parseInt(argVal('--window', '12'), 10)

// ---------------- inventory ----------------
const ALLOWED = new Map(morphemes.map((m) => [m.id, m]))
// 种子：先轮询全部词根（网络连通主力），再轮询前缀/后缀，扩大产词多样性
const seeds = [
  ...morphemes.filter((m) => m.type === 'root'),
  ...morphemes.filter((m) => m.type !== 'root'),
]

const baseWords = [...wordsLatin, ...wordsGreek, ...wordsAffix]
const usedIds = new Set(baseWords.map((w) => w.id))
const usedForms = new Set(baseWords.map((w) => w.form.toLowerCase()))

// ---------------- resume cache ----------------
let cache = []
if (fs.existsSync(CACHE_PATH)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')).words || []
  } catch {
    cache = []
  }
}
for (const w of cache) {
  usedIds.add(w.id)
  usedForms.add(w.form.toLowerCase())
}

/** 统计每个词素下现有的词数（既有词库 + 已生成） */
function wordCountByMorph() {
  const map = new Map(morphemes.map((m) => [m.id, 0]))
  const bump = (list) =>
    list.forEach((w) =>
      (w.morphs || []).forEach((id) => {
        if (map.has(id)) map.set(id, map.get(id) + 1)
      }),
    )
  bump(baseWords)
  bump(cache)
  return map
}

/** 种子按「现有词数」升序：优先给词少的词素（尤其新扩充、为 0 的）出词，避免重复挖老词根 */
function orderedSeeds() {
  const cnt = wordCountByMorph()
  return [...seeds].sort((a, b) => (cnt.get(a.id) || 0) - (cnt.get(b.id) || 0))
}

// ---------------- prompt ----------------
const INV = morphemes.map((m) => `${m.id} (${m.form}) = ${m.gloss}`).join('\n')

function buildPrompt(targets, n, avoidForms = []) {
  const list = targets.map((m) => `${m.id} (${m.form}) = ${m.gloss}`).join('\n')
  const avoid = avoidForms.length
    ? `\n【已生成的单词（禁止重复，也不要用它们的变形）】\n${avoidForms.join(', ')}\n`
    : ''
  return `你在为中文学习者构建一份 IELTS–GRE 级别的英语词库（词根词缀记忆法）。

【可用词素清单】（每行格式：id (词形) = 中文含义）
${INV}

【本批重点词素】请围绕下列词素出词，每个单词的 morphs 必须至少包含其中 1 个：
${list}
${avoid}
【任务】生成 ${n} 个互不相同的英语单词。

硬性规则：
1. 每个单词 morphs 与 chain[].morph 中的 id 必须严格来自上面「可用词素清单」，出现清单外的 id 一律不要输出该词。
2. 每个单词的 morphs 必须至少包含「本批重点词素」中的 1 个（该词素要真实参与构词）。
3. 语义精准（重要）：只有当某个部件确实、词源正确地对应清单里的词素时，才把该 id 写进 morphs / chain[].morph；对不上的部件（例如清单里没有的前缀 circum-、后缀 -acious）在 chain 里的 morph 一律填 null，绝不允许为了凑数把语义不符的 id 硬套上去。
4. morphs 只保留真正对应本词构词的词素 id。
5. 只输出 JSON 对象，格式：{"words":[ ... ]}，不要任何解释文字、不要 markdown 代码块。
6. 难度定位 IELTS~GRE（对应 CEFR B2 / C1 / C2），避免 expect、respect、report 这类基础词；尽量给出学术/书面/较少见的派生词。若重点词素确实难再组出新词，可放宽到较少见的学术/专业词，但必须真实存在、拼写正确；宁可少给，也绝不编造不存在的单词。
7. 单词之间不要重复，也不要与上面「已生成的单词」重复。

每个单词对象字段：
- id: "w." + 全部小写单词（如 "w.benevolent"），全局唯一
- form: 单词原形
- pos: 词性缩写（v. / n. / adj. / adv. / prep. / conj. 等）
- gloss: 中文释义（简洁）
- morphs: 词素 id 数组（全部来自清单，且至少含 1 个本批重点词素）
- chain: 构词拆解数组，元素 {"morph": 词素id或null, "form": 该部件在单词中的拼写, "gloss": 部件中文含义}
- freqRank: 词频序号（越大越罕见），取 12000–32000 之间的整数
- cefr: "B2" | "C1" | "C2"
- phoneticBr: 英式音标，如 "/bəˈnevələnt/"
- example: {"en": 英文例句, "zh": 中文翻译}`
}

async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a precise lexicographer. Output strict JSON only.' },
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

function slugId(form) {
  return 'w.' + form.toLowerCase().replace(/[^a-z]/g, '')
}

// 与 scripts/validate-data.mjs 保持一致的数据质量约束（不合格的词直接丢弃，避免污染词库）
const IPA_BODY = /^[a-zA-Z ˈˌːˑəɐɑɒɔɜɛɘɞɪɨɯʌʊæøɵɶʉɤʏɹɾʃʒθðŋɲɳɡɢʔχʁʀħʕʜʢʍɥʧʤ˘.()]+$/
const KK_CHARS = /[ˋˊ˝ɚɝ]/
const EXAMPLE_MIN = 8
const EXAMPLE_MAX = 200

/** 清洗音标：补斜杠、剔除 IPA 白名单外的字符（如鼻化元音的组合波浪号 ̃） */
function sanitizePhonetic(p) {
  if (typeof p !== 'string') return ''
  let inner = p.trim()
  if (!inner) return ''
  if (inner.startsWith('/')) inner = inner.slice(1)
  if (inner.endsWith('/')) inner = inner.slice(0, -1)
  inner = [...inner].filter((ch) => IPA_BODY.test(ch)).join('')
  return inner ? '/' + inner + '/' : ''
}

/** 音标是否合规（清洗后仍不合规就丢弃该词） */
function phoneticOk(p) {
  if (typeof p !== 'string' || p.length <= 2) return false
  if (!(p.startsWith('/') && p.endsWith('/'))) return false
  const body = p.slice(1, -1)
  if (KK_CHARS.test(body)) return false
  return IPA_BODY.test(body)
}

/** 清洗 chain：丢掉缺 form 的步骤；全丢光就用词形兜底一步（保证「构词拆解」非空） */
function sanitizeChain(chain, w) {
  const steps = (chain || [])
    .filter((c) => c && typeof c.form === 'string' && c.form.trim())
    .map((c) => ({
      morph: c.morph && ALLOWED.has(c.morph) ? c.morph : null,
      form: String(c.form).trim(),
      gloss: c.gloss || '',
    }))
  if (steps.length) return steps
  return [
    {
      morph: (w.morphs || []).find((m) => ALLOWED.has(m)) || null,
      form: w.form.trim(),
      gloss: w.gloss || '',
    },
  ]
}

/** 例句是否合规（freqRank>2500 的词必须有 8~200 字符的英文例句与中文翻译） */
function exampleOk(e) {
  return Boolean(
    e &&
      typeof e === 'object' &&
      typeof e.en === 'string' &&
      e.en.length >= EXAMPLE_MIN &&
      e.en.length <= EXAMPLE_MAX &&
      typeof e.zh === 'string' &&
      e.zh.trim(),
  )
}

function validate(w, windowIds) {
  if (!w || typeof w.form !== 'string' || !w.form.trim()) return 'no form'
  const id = slugId(w.form)
  if (usedIds.has(id)) return 'dup id'
  if (usedForms.has(w.form.toLowerCase())) return 'dup form'
  if (!Array.isArray(w.morphs) || !w.morphs.length) return 'no morphs'
  for (const m of w.morphs) if (!ALLOWED.has(m)) return 'bad morph ' + m
  if (!w.morphs.some((m) => windowIds.has(m))) return 'window missing'
  if (!phoneticOk(sanitizePhonetic(w.phoneticBr))) return 'bad phonetic'
  if (!exampleOk(w.example)) return 'bad example'
  const chain = sanitizeChain(w.chain, w)
  for (const c of chain) if (c.morph != null && !ALLOWED.has(c.morph)) return 'bad chain morph ' + c.morph
  return null
}

function normalize(w) {
  return {
    id: slugId(w.form),
    form: w.form.trim(),
    pos: w.pos || 'n.',
    gloss: w.gloss || '',
    morphs: w.morphs.filter((m) => ALLOWED.has(m)),
    chain: sanitizeChain(w.chain, w),
    freqRank: Number.isFinite(w.freqRank) ? w.freqRank : 15000,
    cefr: ['B2', 'C1', 'C2'].includes(w.cefr) ? w.cefr : 'C1',
    phoneticBr: sanitizePhonetic(w.phoneticBr),
    example: { en: String(w.example.en).slice(0, EXAMPLE_MAX), zh: w.example.zh },
  }
}

function writeExtra() {
  const header =
    '/**\n' +
    ' * AI 扩充词库（DeepSeek 生成）\n' +
    ' * 由 scripts/gen-words.mjs 生成，请勿手工修改。\n' +
    ` * 词数: ${cache.length}\n` +
    ' */\n'
  const body = cache.map((w) => '  ' + JSON.stringify(w)).join(',\n')
  const out = `${header}const wordsExtra = [\n${body}\n]\n\nexport default wordsExtra\n`
  fs.writeFileSync(EXTRA_PATH, out)
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ words: cache }))
}

async function main() {
  // 启动清洗历史缓存：修音标 / 补 chain，丢弃例句或词素不符的词，保证产物始终能过 validate
  const before = cache.length
  cache = cache
    .filter(
      (w) =>
        w &&
        w.form &&
        Array.isArray(w.morphs) &&
        w.morphs.length &&
        w.morphs.every((m) => ALLOWED.has(m)) &&
        exampleOk(w.example) &&
        phoneticOk(sanitizePhonetic(w.phoneticBr)),
    )
    .map((w) => ({ ...w, chain: sanitizeChain(w.chain, w), phoneticBr: sanitizePhonetic(w.phoneticBr) }))
  if (cache.length !== before) console.log(`启动清洗：${before} → ${cache.length} 词（丢弃不合格项）`)
  writeExtra()

  console.log(`目标 ${TARGET} 词 / 每批 ${PER} / 窗口 ${WINDOW} / 已有 ${cache.length}`)
  let batchIdx = 0
  let fails = 0
  while (cache.length < TARGET) {
    // 每批先把词素按「现有词数升序」排序，取最缺词的 40 个里的一段作为本批窗口
    const focus = orderedSeeds().slice(0, 40)
    const off = (batchIdx * WINDOW) % Math.max(1, focus.length)
    const targets = Array.from({ length: WINDOW }, (_, k) => focus[(off + k) % focus.length])
    batchIdx += 1
    const windowIds = new Set(targets.map((m) => m.id))

    const need = Math.min(PER, TARGET - cache.length)
    // 排除列表：与窗口词素相交的已有词 + 最近生成的词（全局降重）
    const avoidSet = new Set()
    const collect = (arr) =>
      arr.forEach((w) => {
        if ((w.morphs || []).some((m) => windowIds.has(m))) avoidSet.add(w.form)
      })
    collect(baseWords)
    collect(cache)
    for (let i = Math.max(0, cache.length - 300); i < cache.length; i += 1) avoidSet.add(cache[i].form)
    const prompt = buildPrompt(targets, need, [...avoidSet].slice(0, 1500))
    const tag = `${targets[0].id}…${targets[targets.length - 1].id}`

    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt += 1) {
      try {
        const content = await callDeepSeek(prompt)
        const raw = parseWords(content)
        let added = 0
        for (const w of raw) {
          if (validate(w, windowIds)) continue
          const nw = normalize(w)
          if (usedIds.has(nw.id) || usedForms.has(nw.form.toLowerCase())) continue
          cache.push(nw)
          usedIds.add(nw.id)
          usedForms.add(nw.form.toLowerCase())
          added += 1
        }
        writeExtra()
        console.log(`  [${tag}] +${added} → 共 ${cache.length}`)
        ok = added > 0
      } catch (e) {
        console.warn(`  [${tag}] 第${attempt}次失败: ${e.message}`)
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
    if (!ok) {
      fails += 1
      if (fails > 12) {
        console.error('连续多批无产出，提前中止。')
        break
      }
    } else fails = 0
  }
  writeExtra()
  console.log(`完成，共 ${cache.length} 词 → src/data/words-extra.js`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * scripts/gen-phon.mjs
 * ------------------------------------------------------------------
 * 为全库单词补「音标 / 例句 / 用法」，产出 src/data/phonetics.js。
 *
 * 两阶段（可断点续跑，进度缓存在 scripts/.gen-phon-cache.json）：
 *   阶段A（本地查表，快）：下载 ECDICT 开源英汉词典（GitHub 清华仓库，走
 *     ghproxy.net 镜像），按 form 小写匹配全库 64825 词，落盘音标。
 *     红线：音标匹配不到就留空，严禁编造音标（任何模型生成的音标都不接受）。
 *   阶段B（慢，DeepSeek）：对缺例句/用法的词分批调用 DeepSeek 依词条
 *     pos/gloss 生成双语例句 + 用法说明，逐批写缓存与产物，可随时中断续跑。
 *
 * 用法：
 *   node scripts/gen-phon.mjs --match-only          # 只跑阶段A（ECDICT 匹配）
 *   node scripts/gen-phon.mjs --pilot 20            # 阶段A + 例句试点 20 词
 *   node scripts/gen-phon.mjs                       # 阶段A（幂等）+ 全量例句（长跑）
 *   node scripts/gen-phon.mjs --examples-only       # 跳过阶段A，只补例句
 *   node scripts/gen-phon.mjs --batch 8             # 例句每批词数（默认 8）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { words as ALL_WORDS } from '../src/data/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CACHE_PATH = path.join(ROOT, 'scripts/.gen-phon-cache.json')
const OUT_PATH = path.join(ROOT, 'src/data/phonetics.js')
const ECDICT_DIR = path.join(ROOT, 'scripts/.ecdict')
const ECDICT_PATH = path.join(ECDICT_DIR, 'ecdict.csv')

// ECDICT 官方仓库经 ghproxy.net 镜像（全量 ecdict.csv，约 66MB / 77 万词条）
const ECDICT_URLS = [
  'https://ghproxy.net/https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv',
  'https://ghproxy.net/https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.mini.csv',
]

// ---------------- args ----------------
const argv = process.argv.slice(2)
function argVal(name, def) {
  const i = argv.indexOf(name)
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith(name + '='))
  if (eq) return eq.split('=').slice(1).join('=')
  return def
}
const MATCH_ONLY = argv.includes('--match-only')
const EXAMPLES_ONLY = argv.includes('--examples-only')
const PILOT = argv.includes('--pilot') ? parseInt(argVal('--pilot', '20'), 10) : null
const BATCH = Math.max(1, parseInt(argVal('--batch', '8'), 10))

// ---------------- env（阶段B才需要 key） ----------------
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
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''

// ---------------- 词库清单（按 form 去重） ----------------
// 同 form 多条记录只处理一次；记录 pos/gloss 供例句生成用
const byForm = new Map() // form(小写) -> { form, pos, gloss, hasExample }
for (const w of ALL_WORDS) {
  if (!w || typeof w.form !== 'string' || !w.form) continue
  const key = w.form.toLowerCase()
  if (!byForm.has(key)) {
    byForm.set(key, {
      form: w.form,
      pos: typeof w.pos === 'string' ? w.pos : '',
      gloss: typeof w.gloss === 'string' ? w.gloss : '',
      hasExample: Boolean(w.example && w.example.en && w.example.zh),
    })
  }
}
const ALL_FORMS = [...byForm.keys()]
console.log(`[phon] 词库唯一词形 ${ALL_FORMS.length} 个（总词条 ${ALL_WORDS.length}）`)

// ---------------- 断点缓存 ----------------
// cache.entries[form] = { p?, en?, zh?, u? }；p 是音标主体（无斜杠）
let cache = { v: 1, entries: {} }
if (fs.existsSync(CACHE_PATH)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    if (parsed && parsed.v === 1 && parsed.entries && typeof parsed.entries === 'object') {
      cache = parsed
    }
  } catch {
    console.warn('[phon] 缓存损坏，重新开始（会重新匹配/覆盖生成）')
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache))
}

// ---------------- 产物生成 ----------------
/** 用缓存内容重写 src/data/phonetics.js（按字母序，一条一行，便于 diff） */
function writePhoneticsJs() {
  const keys = Object.keys(cache.entries).sort()
  const lines = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(cache.entries[k])},`)
  const head = `/**
 * 音标 / 例句 / 用法 数据（由 scripts/gen-phon.mjs 生成，勿手工编辑）
 * ------------------------------------------------------------------
 * 数据源：
 *   - 音标 p：ECDICT 开源英汉词典（本地查表匹配，匹配不到留空，绝不编造）
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
  fs.writeFileSync(OUT_PATH, head + lines.join('\n') + tail)
  console.log(`[phon] 已写出 ${path.relative(ROOT, OUT_PATH)}（${keys.length} 词条）`)
}

/** 覆盖率报告 */
function report() {
  const entries = cache.entries
  let withPhon = 0
  let withExample = 0
  let withUsage = 0
  for (const form of ALL_FORMS) {
    const e = entries[form]
    if (!e) continue
    if (e.p) withPhon += 1
    if (e.en && e.zh) withExample += 1
    if (e.u) withUsage += 1
  }
  const total = ALL_FORMS.length
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`
  console.log(
    `[phon] 覆盖：音标 ${withPhon}/${total}（${pct(withPhon)}）· 例句 ${withExample}/${total}（${pct(withExample)}）· 用法 ${withUsage}/${total}（${pct(withUsage)}）`,
  )
  return { total, withPhon, withExample, withUsage }
}

// ================= 阶段A：ECDICT 音标匹配 =================

/** 下载 ECDICT（依次尝试镜像，已有本地文件则跳过） */
async function ensureEcdict() {
  if (fs.existsSync(ECDICT_PATH) && fs.statSync(ECDICT_PATH).size > 1024 * 1024) {
    console.log(`[phon] 使用本地 ECDICT：${ECDICT_PATH}`)
    return
  }
  fs.mkdirSync(ECDICT_DIR, { recursive: true })
  let lastErr = null
  for (const url of ECDICT_URLS) {
    try {
      console.log(`[phon] 下载 ECDICT：${url}`)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1024 * 1024) throw new Error(`文件过小（${buf.length}B），疑似失败`)
      fs.writeFileSync(ECDICT_PATH, buf)
      console.log(`[phon] 下载完成：${(buf.length / 1024 / 1024).toFixed(1)}MB`)
      return
    } catch (e) {
      lastErr = e
      console.warn(`[phon] 下载失败：${e.message}，尝试下一个镜像`)
    }
  }
  throw lastErr || new Error('ECDICT 下载失败')
}

/**
 * 解析 ECDICT CSV，回调每个数据行（字段数组）。
 * 手写状态机解析器：正确处理引号内逗号 / 换行 / 转义双引号。
 */
async function parseEcdict(onRow) {
  const raw = await fs.promises.readFile(ECDICT_PATH, 'utf8')
  const n = raw.length
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  let header = null
  let rowIndex = 0
  const flushField = () => {
    row.push(field)
    field = ''
  }
  const flushRow = () => {
    flushField()
    if (rowIndex === 0) {
      header = row.map((h) => h.trim().toLowerCase())
    } else {
      onRow(header, row)
    }
    row = []
    rowIndex += 1
  }
  while (i < n) {
    const ch = raw[i]
    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      flushField()
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && raw[i + 1] === '\n') i += 1
      flushRow()
    } else {
      field += ch
    }
    i += 1
  }
  if (field.length > 0 || row.length > 0) flushRow()
  return header
}

async function matchEcdict() {
  await ensureEcdict()
  const need = ALL_FORMS.filter((f) => {
    const e = cache.entries[f]
    return !e || !e.p
  })
  console.log(`[phon] 待匹配音标：${need.length} 个词形`)
  const needSet = new Set(need)
  // 全量词形 → 音标索引（一次扫描建索引，供精确匹配 + 词形归一回退共用）
  const fullMap = new Map()
  let scanned = 0
  await parseEcdict((header, row) => {
    scanned += 1
    if (scanned % 200000 === 0) console.log(`[phon] 建索引 ${scanned} 行`)
    const wIdx = header.indexOf('word')
    const pIdx = header.indexOf('phonetic')
    if (wIdx < 0 || pIdx < 0) return
    const word = row[wIdx]
    if (!word) return
    const phon = sanitizeEcdictPhonetic(row[pIdx])
    if (!phon) return
    const key = word.toLowerCase()
    if (!fullMap.has(key)) fullMap.set(key, phon)
  })
  console.log(`[phon] ECDICT 索引完成：${scanned} 行，${fullMap.size} 个有音标词形`)

  // pass1：精确匹配
  let matched = 0
  for (const key of needSet) {
    const phon = fullMap.get(key)
    if (!phon) continue
    const cur = cache.entries[key] || {}
    cache.entries[key] = { ...cur, p: phon }
    matched += 1
    needSet.delete(key)
  }
  console.log(`[phon] pass1 精确匹配：${matched} 个`)

  // pass2：词形归一回退——对仍缺失的词形生成常规屈折变体的原形候选
  // （复数 / 过式 / 进行式 / 比较级等 → 原形音标；全部来自 ECDICT 查表，不编造）
  let fallback = 0
  for (const key of needSet) {
    const cands = lemmaCandidates(key)
    for (const cand of cands) {
      const phon = fullMap.get(cand)
      if (!phon) continue
      const cur = cache.entries[key] || {}
      cache.entries[key] = { ...cur, p: phon }
      fallback += 1
      break
    }
  }
  console.log(`[phon] pass2 词形归一回退：${fallback} 个`)
  saveCache()
  writePhoneticsJs()
}

/**
 * 生成「原形候选」：把常见规则屈折变体还原为可能的词典原形。
 * 只生成候选，命中与否以 ECDICT 查表为准——查不到就放弃，绝不猜测音标。
 */
function lemmaCandidates(form) {
  const out = []
  const add = (s) => {
    if (s && s.length > 2 && !out.includes(s)) out.push(s)
  }
  const collapseDouble = (s) => {
    if (s.length > 2 && s[s.length - 1] === s[s.length - 2]) {
      add(s.slice(0, -1))
      add(s.slice(0, -1) + 'e')
    }
  }
  if (form.endsWith("'s")) add(form.slice(0, -2))
  if (form.endsWith("s'")) add(form.slice(0, -1))
  if (form.endsWith('ies') && form.length > 4) add(form.slice(0, -3) + 'y')
  if (form.endsWith('es')) {
    add(form.slice(0, -2))
    add(form.slice(0, -1))
    if (form.endsWith('ies')) add(form.slice(0, -3) + 'y')
  }
  if (form.endsWith('s') && !form.endsWith('ss') && !form.endsWith('us')) {
    const st = form.slice(0, -1)
    add(st)
    add(st + 'e')
    collapseDouble(st)
  }
  if (form.endsWith('ied') && form.length > 4) add(form.slice(0, -3) + 'y')
  if (form.endsWith('ed')) {
    const st = form.slice(0, -2)
    add(st)
    add(form.slice(0, -1))
    add(st + 'e')
    collapseDouble(st)
  }
  if (form.endsWith('ing') && form.length > 5) {
    const st = form.slice(0, -3)
    add(st)
    add(st + 'e')
    collapseDouble(st)
  }
  if (form.endsWith('er') && form.length > 4) {
    const st = form.slice(0, -2)
    add(st)
    add(st + 'e')
    collapseDouble(st)
  }
  if (form.endsWith('est') && form.length > 5) {
    const st = form.slice(0, -3)
    add(st)
    add(st + 'e')
    collapseDouble(st)
  }
  if (form.endsWith('ly') && form.length > 4) {
    const st = form.slice(0, -2)
    add(st)
    if (st.endsWith('i')) add(st.slice(0, -1) + 'y')
  }
  return out
}

/** 清洗 ECDICT 音标：去首尾斜杠与空白；KK 专用符号剔除后若为空则视为无音标 */
function sanitizeEcdictPhonetic(p) {
  if (typeof p !== 'string') return ''
  let s = p.trim()
  if (s.startsWith('/')) s = s.slice(1)
  if (s.endsWith('/')) s = s.slice(0, -1)
  s = s.trim().replace(/[ˋˊ˝ɚɝ]/g, '')
  return s
}

// ================= 阶段B：DeepSeek 例句 / 用法生成 =================

/** 需要补例句的词形：词库自带 example 的跳过；缓存里已有 en+zh 的跳过 */
function missingExampleForms() {
  const list = []
  for (const key of ALL_FORMS) {
    const meta = byForm.get(key)
    if (meta.hasExample) continue
    const e = cache.entries[key]
    if (e && e.en && e.zh) continue
    list.push(key)
  }
  // 高频词优先（freqRank 升序已体现在词库顺序里；这里按出现顺序即可）
  return list
}

function buildExamplePrompt(batch) {
  const list = batch
    .map((key) => {
      const m = byForm.get(key)
      return `- ${m.form}${m.pos ? `（${m.pos}）` : ''}：${m.gloss || '（无释义，请按最常用义项）'}`
    })
    .join('\n')
  return `你在为中文学习者编写英语单词的例句和用法说明。

【本批单词】
${list}

【任务】为每个单词生成：
- en: 一个自然、地道的英文例句（8~30 词，尽量包含该单词或其常见变形，难度贴合词条释义）
- zh: 例句的中文翻译（与英文严格对应）
- u: 一条简短用法说明（30 字以内，讲清最常用的搭配或辨析要点，中文）

硬性规则：
1. 只输出 JSON 对象：{"items":[{"form":"单词原形","en":"...","zh":"...","u":"..."}]}，不要解释、不要 markdown 代码块。
2. items 数量必须等于本批单词数量，form 原样照抄，不要新增或遗漏。
3. 例句必须真实自然，不许堆砌生僻搭配；释义有多个义项时取最常用的一个。`
}

async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a precise lexicographer. Output strict JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0,
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

function parseItems(content) {
  let s = String(content).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  let obj
  try {
    obj = JSON.parse(s)
  } catch {
    const a = s.indexOf('{')
    const b = s.lastIndexOf('}')
    if (a >= 0 && b > a) obj = JSON.parse(s.slice(a, b + 1))
    else throw new Error('JSON 解析失败')
  }
  const items = Array.isArray(obj) ? obj : obj.items || []
  return Array.isArray(items) ? items : []
}

const EXAMPLE_EN_MIN = 8
const EXAMPLE_EN_MAX = 200
const USAGE_MAX = 120

/** 单批生成：返回成功写入的词形数 */
async function generateBatch(keys, batchNo) {
  const promptText = buildExamplePrompt(keys)
  const content = await callDeepSeek(promptText)
  const items = parseItems(content)
  let saved = 0
  for (const it of items) {
    if (!it || typeof it.form !== 'string') continue
    const key = it.form.toLowerCase()
    if (!keys.includes(key)) continue
    const en = typeof it.en === 'string' ? it.en.trim() : ''
    const zh = typeof it.zh === 'string' ? it.zh.trim() : ''
    const u = typeof it.u === 'string' ? it.u.trim().slice(0, USAGE_MAX) : ''
    // 质量闸门：例句长度合理、中英都非空才收（缺 usage 不拒绝）
    if (en.length < EXAMPLE_EN_MIN || en.length > EXAMPLE_EN_MAX || !zh) continue
    const cur = cache.entries[key] || {}
    cache.entries[key] = { ...cur, en, zh, ...(u ? { u } : {}) }
    saved += 1
  }
  console.log(`[phon] 批次 ${batchNo}：请求 ${keys.length} 词，合格入库 ${saved} 词`)
  return saved
}

async function generateExamples() {
  if (!DEEPSEEK_KEY) {
    console.error('[phon] 缺少 DEEPSEEK_API_KEY，无法生成例句（阶段B需要）。阶段A结果已保留。')
    process.exit(1)
  }
  const all = missingExampleForms()
  const todo = PILOT != null ? all.slice(0, PILOT) : all
  console.log(`[phon] 缺例句词形 ${all.length} 个；本次处理 ${todo.length} 个${PILOT != null ? `（pilot=${PILOT}）` : '（全量）'}`)
  let done = 0
  for (let i = 0; i < todo.length; i += BATCH) {
    const keys = todo.slice(i, i + BATCH)
    const batchNo = Math.floor(i / BATCH) + 1
    try {
      await generateBatch(keys, batchNo)
    } catch (e) {
      console.warn(`[phon] 批次 ${batchNo} 失败：${e.message}；30 秒后重试本批（已入库进度不受影响）`)
      await new Promise((r) => setTimeout(r, 30000))
      try {
        await generateBatch(keys, batchNo)
      } catch (e2) {
        console.warn(`[phon] 批次 ${batchNo} 重试仍失败：${e2.message}；跳过继续`)
      }
    }
    done += keys.length
    // 逐批落盘：随时中断都不丢进度
    saveCache()
    if (batchNo % 5 === 0 || done >= todo.length) writePhoneticsJs()
  }
  writePhoneticsJs()
  report()
}

// ---------------- 主流程 ----------------
async function main() {
  const t0 = Date.now()
  if (!EXAMPLES_ONLY) {
    await matchEcdict()
    report()
  }
  if (MATCH_ONLY) {
    console.log(`[phon] --match-only：阶段A完成，耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`)
    return
  }
  await generateExamples()
  console.log(`[phon] 全部完成，耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch((e) => {
  console.error('[phon] 管线异常：', e)
  process.exit(1)
})

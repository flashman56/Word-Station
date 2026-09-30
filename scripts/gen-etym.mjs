/**
 * scripts/gen-etym.mjs
 * ------------------------------------------------------------------
 * 用 DeepSeek 批量生成 678 个英语词素的**精编词源故事**（中文），产出
 * `src/data/morph-etym.js`（`export default { [morphId]: EtymEntry }`），
 * 供前端 `src/lib/etym.js::resolveEtymology` 动态 import（精编优先、缺失回退组合叙述）。
 *
 * 用法：
 *   node scripts/gen-etym.mjs --pilot 20        # 只生成 20 条 + 抽样复核报告
 *   node scripts/gen-etym.mjs                   # 全量生成（仅补齐缺失词素，断点续跑）
 *   node scripts/gen-etym.mjs --force           # 忽略已有条目，全部重生成
 *   node scripts/gen-etym.mjs --concurrency 3 --batch 8
 *
 * 特点：
 *   - DEEPSEEK_API_KEY 取自 .env / .env.local（脚本/Node 侧，绝不下发前端）
 *   - 断点续跑：每批完成即写盘；已存在且字段完整的 id 跳过
 *   - 保守并发（默认 3）+ 每批 3 次重试；失败不中断，结束汇总待补 id
 *   - --pilot 额外把抽样报告写到 scripts/.etym-pilot-report.json 并打印到 stdout
 *
 * ★ 音标红线：本脚本提示词显式禁止音标；产出条目不包含任何音标字段。
 *
 * 数据字段（对齐 docs/features-design.md 的 EtymEntry；同时给出别名以便其它读取方）：
 *   消费字段（src/lib/etym.js / EtymologyPanel 使用）：
 *     origin     来源语言 key（latin|greek|germanic|old_english|french|other）
 *     proto      原始形态（可含语言标签；PIE 重构形以 * 开头）或 null
 *     protoGloss 原始形态本义（中文）或 null
 *     pie        proto 是否为原始印欧语重构形
 *     story      一段 80–200 字中文词源叙述
 *     timeline   [{ era, text }] 演变阶段（时间线）
 *     cognates   [{ form, gloss, wordId?, morphId? }] 同源/同族英语词
 *   语义别名：originalForm / originalMeaning / evolution / pieRoot
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import morphemes from '../src/data/morphemes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ETYM_PATH = path.join(ROOT, 'src/data/morph-etym.js')
const REPORT_PATH = path.join(__dirname, '.etym-pilot-report.json')

// ---------------------------------------------------------------- env
/** 依次读 .env（后读的只补空缺），token 只留在 Node 侧 */
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
const KEY = process.env.DEEPSEEK_API_KEY
if (!KEY) {
  console.error('缺少 DEEPSEEK_API_KEY，请在 .env 或 .env.local 中配置。')
  process.exit(1)
}

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2)
function argVal(name, def) {
  const i = argv.indexOf(name)
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith(name + '='))
  if (eq) return eq.split('=').slice(1).join('=')
  return def
}
const PILOT = argv.includes('--pilot') ? Math.max(1, parseInt(argVal('--pilot', '20'), 10) || 20) : null
const FORCE = argv.includes('--force')
const CONCURRENCY = Math.max(1, Math.min(6, parseInt(argVal('--concurrency', '3'), 10) || 3))
const BATCH = Math.max(1, Math.min(20, parseInt(argVal('--batch', '8'), 10) || 8))

// ---------------------------------------------------------------- inventory
/** 去重后的词素清单（id 唯一） */
const ALL = []
const seen = new Set()
for (const m of morphemes) {
  if (!m || !m.id || seen.has(m.id)) continue
  seen.add(m.id)
  ALL.push(m)
}
const ALLOWED = new Set(ALL.map((m) => m.id))
const MORPH_BY_ID = new Map(ALL.map((m) => [m.id, m]))

// ---------------------------------------------------------------- 读入已有（断点续跑）
async function readExisting() {
  try {
    const mod = await import(pathToFileURL(ETYM_PATH).href)
    const obj = mod && mod.default ? mod.default : {}
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

/** 条目是否“已完成”（有叙述 + 非空演变时间线即可跳过） */
function isDone(entry) {
  return Boolean(
    entry &&
      typeof entry === 'object' &&
      typeof entry.story === 'string' &&
      entry.story.trim() &&
      Array.isArray(entry.timeline) &&
      entry.timeline.length > 0,
  )
}

// ---------------------------------------------------------------- 归一化
const ORIGIN_KEYS = ['latin', 'greek', 'germanic', 'old_english', 'french', 'other']
const ORIGIN_ALIASES = {
  latin: 'latin', '拉丁': 'latin', '拉丁语': 'latin',
  greek: 'greek', '希腊': 'greek', '希腊语': 'greek',
  germanic: 'germanic', '日耳曼': 'germanic', '日耳曼语': 'germanic',
  old_english: 'old_english', '古英语': 'old_english', '英语': 'old_english',
  french: 'french', '法语': 'french', anglo_french: 'french',
  other: 'other', '其他': 'other', 混合: 'other',
}
function normalizeOrigin(raw, fallback) {
  const s = String(raw || '').trim().toLowerCase()
  if (ORIGIN_KEYS.includes(s)) return s
  if (ORIGIN_ALIASES[s]) return ORIGIN_ALIASES[s]
  const fb = String(fallback || '').trim().toLowerCase()
  if (ORIGIN_KEYS.includes(fb)) return fb
  return 'other'
}

function str(v) {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim()
}

/** 归一化演变阶段 → [{era, text}]，丢弃空 text */
function normalizeTimeline(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({ era: str(s.era), text: str(s.text) }))
    .filter((s) => s.text)
    .slice(0, 6)
}

/** 归一化同源词 → [{form, gloss}]，丢弃空 form */
function normalizeCognates(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter((c) => c && typeof c === 'object' && str(c.form))
    .slice(0, 6)
    .map((c) => {
      const o = { form: str(c.form), gloss: str(c.gloss) }
      if (str(c.wordId)) o.wordId = str(c.wordId)
      if (str(c.morphId)) o.morphId = str(c.morphId)
      return o
    })
}

function buildStory(morph, origin, originalForm, originalMeaning, timeline) {
  const evo = timeline.map((s) => `${s.era ? s.era + '：' : ''}${s.text}`).join(' → ')
  return `词素「${morph.form}」（${morph.gloss}）源自${origin}，原始形态 ${originalForm || '—'}${
    originalMeaning ? `（${originalMeaning}）` : ''
  }。演变：${evo}。`
}

/**
 * 把模型输出归一成落盘条目。缺关键内容（story / timeline）返回 null。
 * @param {object} raw 模型给的条目
 * @param {object} morph 对应词素
 */
function normalizeEntry(raw, morph) {
  if (!raw || typeof raw !== 'object') return null
  const origin = normalizeOrigin(raw.origin, morph.origin)
  const pieRootRaw = str(raw.pieRoot)
  const originalForm = str(raw.originalForm || raw.proto)
  const originalMeaning = str(raw.originalMeaning || raw.protoGloss)
  // 仅当原始形态确为 PIE 重构形（以 * 开头）才标 pie —— 避免把普通拉丁/希腊原形误标为「重构形」
  const pieForm = originalForm.startsWith('*') ? originalForm : pieRootRaw.startsWith('*') ? pieRootRaw : ''
  const pie = Boolean(pieForm)
  const proto = originalForm || pieRootRaw || null
  const protoGloss = originalMeaning || null
  const timeline = normalizeTimeline(raw.evolution || raw.timeline)
  if (!timeline.length) return null
  const cognates = normalizeCognates(raw.cognates)
  let story = str(raw.story)
  if (!story) story = buildStory(morph, origin, proto, protoGloss, timeline)

  return {
    // —— 消费字段（etym.js / EtymologyPanel）——
    origin,
    proto,
    protoGloss,
    pie,
    story,
    timeline,
    cognates,
    // —— 语义别名（对齐 team-lead 命名口径）——
    originalForm: proto || '',
    originalMeaning: protoGloss || '',
    pieRoot: pie ? pieForm : null,
    evolution: timeline,
  }
}

// ---------------------------------------------------------------- LLM
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

function buildPrompt(batch) {
  const list = batch
    .map(
      (m) =>
        `${m.id} | ${m.type} | ${m.form} | ${m.display || m.form} | ${m.gloss} | ${m.glossEn || ''} | ${
          m.origin || ''
        } | ${(m.variants || []).join('/')} | ${m.note || ''}`,
    )
    .join('\n')
  return `你在为中文学习者编写英语词根词缀的**词源故事（etymology）**。请为下列英语词素各写一条中文词源说明。

【词素清单】（每行：id | 类型 | 词形 | 展示形 | 中文含义 | 英文含义 | 来源 | 变体 | 助记）
${list}

【输出要求】
只输出一个 JSON 对象（键为词素 id，值为下述结构），不要任何解释文字、不要 markdown 代码块：
{
  "<id>": {
    "origin": "latin",
    "originalForm": "拉丁 specere",
    "originalMeaning": "看",
    "pieRoot": "*spek-",
    "story": "……80-200 字中文叙述：由何语言、何种形态、如何演变为现代英语词素……",
    "evolution": [
      { "era": "原始印欧语", "text": "*spek-（重构形）注视" },
      { "era": "拉丁", "text": "specere 看 → spectare 反复看" },
      { "era": "英语", "text": "构成 spect-/spec- 词族" }
    ],
    "cognates": [
      { "form": "spectator", "gloss": "观众" },
      { "form": "perspective", "gloss": "视角" }
    ]
  }
}

硬性规则：
1. origin 只能取以下之一：latin | greek | germanic | old_english | french | other。
2. originalForm 写原始形态并可带语言标签；若为原始印欧语（PIE）重构形，必须以 * 开头（如 *spek-）。
3. pieRoot 仅在 originalForm 属 PIE 重构形时给出（同 originalForm），否则填 null。
4. story 必填，用中文，80–200 字；evolution 必填，按时间先后 2–4 段；cognates 必填，2–5 个**真实存在**的英语同源/同族词（拼写必须正确）。
5. 只写确有把握的词源；不确定时用保守表述，但字段必须齐全、非空。
6. **绝对禁止输出任何音标 / 发音内容**（不得出现 phonetic、ipa、读音 等字段或 /…/ 音标串）。
7. 必须为清单中**每一个 id** 都给出条目，且键名与 id 完全一致。`
}

async function callDeepSeek(prompt) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 120000)
  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a precise historical etymologist. Output strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 8000,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`DeepSeek ${res.status}: ${t.slice(0, 300)}`)
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timer)
  }
}

function parseJsonObject(content) {
  const s = String(content || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(s)
  } catch {
    const a = s.indexOf('{')
    const b = s.lastIndexOf('}')
    if (a >= 0 && b > a) return JSON.parse(s.slice(a, b + 1))
    throw new Error('JSON 解析失败')
  }
}

// ---------------------------------------------------------------- 写盘
function writeEtym(map, total) {
  const ids = Object.keys(map)
  const header =
    '/**\n' +
    ' * morph-etym.js —— 精编词源数据 { [morphId]: EtymEntry }\n' +
    ' * ------------------------------------------------------------------\n' +
    ' * 由 scripts/gen-etym.mjs 自动生成，请勿手工修改。\n' +
    ` * 条数: ${ids.length} / ${total}\n` +
    ' * ★ 只允许经 src/lib/etym.js 动态 import 加载（禁止静态 import，避免进首屏 bundle）。\n' +
    ' * ★ 音标红线：本文件不含任何音标字段。\n' +
    ' *\n' +
    ' * 消费字段：origin / proto / protoGloss / pie / story / timeline[{era,text}] / cognates[{form,gloss}]\n' +
    ' * 语义别名：originalForm / originalMeaning / evolution / pieRoot\n' +
    ' */\n'
  const out = header + 'export default ' + JSON.stringify(map, null, 2) + '\n'
  fs.writeFileSync(ETYM_PATH, out)
}

// ---------------------------------------------------------------- 并发池
async function runPool(items, worker, concurrency) {
  let cursor = 0
  const runners = Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
    while (true) {
      const idx = cursor
      cursor += 1
      if (idx >= items.length) break
      await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
}

// ---------------------------------------------------------------- main
async function main() {
  const existing = await readExisting()
  const map = FORCE ? {} : { ...existing }
  // 清理非法键（不属于现有词素）——保持文件始终合法
  for (const k of Object.keys(map)) if (!ALLOWED.has(k)) delete map[k]

  const pending = ALL.filter((m) => !isDone(map[m.id]))
  const limit = PILOT != null ? Math.min(PILOT, pending.length) : pending.length
  const work = pending.slice(0, limit)

  console.log(
    `[gen-etym] 词素总数 ${ALL.length} / 已有 ${Object.keys(map).length} / 待生成 ${pending.length}` +
      `${PILOT != null ? ` / pilot ${limit}` : ''} / 并发 ${CONCURRENCY} / 每批 ${BATCH}`,
  )
  if (work.length === 0) {
    console.log('[gen-etym] 无需生成（全部已完成）。')
    writeEtym(map, ALL.length)
    if (PILOT != null) writePilotReport(map, PILOT)
    return
  }

  // 切批
  const batches = []
  for (let i = 0; i < work.length; i += BATCH) batches.push(work.slice(i, i + BATCH))

  const generated = [] // pilot 报告用
  let doneBatches = 0
  let failedBatches = 0

  await runPool(
    batches,
    async (batch, bidx) => {
      const ids = batch.map((m) => m.id)
      let ok = false
      for (let attempt = 1; attempt <= 3 && !ok; attempt += 1) {
        try {
          const content = await callDeepSeek(buildPrompt(batch))
          const obj = parseJsonObject(content)
          let added = 0
          for (const m of batch) {
            const raw = obj[m.id]
            const entry = normalizeEntry(raw, m)
            if (!entry) continue
            map[m.id] = entry
            added += 1
            generated.push({
              id: m.id,
              form: m.form,
              origin: entry.origin,
              originalForm: entry.originalForm,
              originalMeaning: entry.originalMeaning,
              pie: entry.pie,
              pieRoot: entry.pieRoot,
              story: entry.story,
              evolution: entry.evolution,
              cognates: entry.cognates,
            })
          }
          // 每批写盘：断点续跑
          writeEtym(map, ALL.length)
          doneBatches += 1
          console.log(
            `  [批 ${bidx + 1}/${batches.length}] ${ids[0]}…${ids[ids.length - 1]} +${added} → 共 ${Object.keys(map).length}`,
          )
          ok = added > 0
        } catch (e) {
          console.warn(`  [批 ${bidx + 1}/${batches.length}] 第${attempt}次失败: ${e.message}`)
          await new Promise((r) => setTimeout(r, 1500 * attempt))
        }
      }
      if (!ok) failedBatches += 1
    },
    CONCURRENCY,
  )

  writeEtym(map, ALL.length)

  const stillPending = ALL.filter((m) => !isDone(map[m.id])).map((m) => m.id)
  console.log(
    `[gen-etym] 完成：已生成 ${Object.keys(map).length}/${ALL.length}；失败批次 ${failedBatches}；仍待补 ${stillPending.length}${
      stillPending.length ? `（前 10：${stillPending.slice(0, 10).join(', ')}）` : ''
    }`,
  )

  if (PILOT != null) {
    writePilotReport(
      PILOT != null ? Object.fromEntries(generated.slice(0, PILOT).map((g) => [g.id, g])) : map,
      PILOT,
    )
  }
}

/** 写 pilot 抽样复核报告（脚本目录 + stdout） */
function writePilotReport(source, n) {
  const entries = Object.values(source).slice(0, n).map((e) => ({
    id: e.id || '',
    origin: e.origin,
    originalForm: e.originalForm || e.proto || '',
    originalMeaning: e.originalMeaning || e.protoGloss || '',
    pie: Boolean(e.pie),
    pieRoot: e.pieRoot || null,
    evolution: Array.isArray(e.evolution) ? e.evolution : e.timeline || [],
    cognates: e.cognates || [],
    story: e.story || '',
  }))
  fs.writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), count: entries.length, entries }, null, 2))
  console.log(`\n=== pilot 抽样复核报告（${entries.length} 条，另存 ${path.relative(ROOT, REPORT_PATH)}）===`)
  for (const e of entries) {
    const evo = e.evolution.map((s) => `${s.era || ''}${s.era ? '：' : ''}${s.text}`).join(' → ')
    console.log(
      `\n• ${e.id}  [${e.origin}]  ${e.originalForm}${e.pie && e.pieRoot ? `（PIE 重构形 ${e.pieRoot}）` : ''} = ${
        e.originalMeaning
      }\n  演变: ${evo}\n  同源: ${e.cognates.map((c) => c.form + (c.gloss ? `(${c.gloss})` : '')).join(', ') || '—'}\n  叙述: ${
        e.story
      }`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

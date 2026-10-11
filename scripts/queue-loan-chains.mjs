/**
 * queue-loan-chains.mjs —— 给「新用户队列里 kind==='loan' 且无 chain」的词补构词拆解
 * ==================================================================
 * 背景
 *   队列里 21,219 个代表形词没有 chain，其中 10,238 个 `kind === 'loan'`。
 *   `loan` 只表示「来源是 mono 词库」，**不代表不可拆解**（tradition / reasonable /
 *   organization / activity / benefit / motive … 明明都能拆）。这导致初学者打开
 *   「按词素学习」几乎看不到东西（前 1000 词只有 12.1% 有拆解）。
 *
 * 本脚本只做**判定**，产出 `reports/queue-loan-chains.json`，由主程决定怎么合并。
 * ★ 绝不修改 src/data 下任何文件 ★
 *
 * 铁律
 *   1. 词素 id 必须能在 src/data/morphemes.js 里 grep 到 —— 代码侧用 MORPH_IDS.has() 硬校验，
 *      编造 id 一律降级 uncertain（历史上 AI 编过 s.ed/s.ion/r.bac/r.wund，被代码拦下）。
 *   2. 宁可漏拆，不可错拆：判 not-decomposable 只是维持现状；判错会往词素岛里塞错误词根。
 *   3. pieces 的 form 逐段拼接（忽略大小写/连字符）必须**完全等于**原词形。
 *
 * 用法
 *   node scripts/queue-loan-chains.mjs --probe                 # 只打印池子规模
 *   node scripts/queue-loan-chains.mjs --limit 300             # 第一批 300
 *   node scripts/queue-loan-chains.mjs --limit 3000 --resume   # 续跑到 3000
 *   node scripts/queue-loan-chains.mjs --audit 30              # 抽 30 条 decomposable 供人工判读
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'reports/queue-loan-chains.json')
const CACHE = path.join(ROOT, 'scripts/.queue-loan-cache.json')
const LASTRUN = path.join(ROOT, 'scripts/.queue-loan-lastrun.json') // 本轮新判定 id，供 --from last 抽样
const AUDIT_OUT = path.join(ROOT, 'reports/queue-loan-audit-sample.json')

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const argVal = (f, d) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d
}
const LIMIT = has('--limit') ? parseInt(argVal('--limit', '300'), 10) : null
const AUDIT_N = has('--audit') ? parseInt(argVal('--audit', '30'), 10) : null
const AUDIT_FROM = argVal('--from', '') // 'all' | 'last' ：抽全部已判定 / 只抽本轮新判定的
const RESUME = has('--resume')
const PROBE = has('--probe')
const CONCURRENCY = Math.max(1, Math.min(8, parseInt(argVal('--concurrency', '4'), 10) || 4))
const BATCH = Math.max(1, Math.min(20, parseInt(argVal('--batch', '10'), 10) || 10))
// deepseek-chat 现行价：输入 cache miss $0.28/M、cache hit $0.028/M、输出 $0.42/M
const P_MISS = 0.28 / 1e6
const P_HIT = 0.028 / 1e6
const P_OUT = 0.42 / 1e6

function loadEnv() {
  for (const f of ['.env', '.env.local']) {
    const p = path.join(ROOT, f)
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
const DRY = has('--dry') || !KEY
if (!KEY) console.log('[loan] ⚠ 无 DEEPSEEK_API_KEY ⇒ 只统计不请求')

// ---------------------------------------------------------------- 池子
const dataMod = await import(pathToFileURL(path.join(ROOT, 'src/data/index.js')).href)
const words = dataMod.words
const byId = new Map(words.map((w) => [w.id, w]))
/** 被折叠进代表形的非代表形（lemma 指向别的词条）跳过 */
const isFolded = (w) => !!(w.lemma && w.lemma !== w.id && byId.has(w.lemma))

const pool = words
  .filter((w) => w && typeof w.form === 'string')
  .filter((w) => !isFolded(w))
  .filter((w) => w.kind === 'loan')
  .filter((w) => !Array.isArray(w.chain) || w.chain.length === 0)
  .filter((w) => typeof w.freqRank === 'number' && w.freqRank > 2500)
  .filter((w) => !/[\s'’\-]/.test(w.form)) // 多词单位 / 带撇号 / 带连字符 不可拆
  .sort((a, b) => a.freqRank - b.freqRank || a.form.localeCompare(b.form, 'en'))

console.log(`[loan] 池子总数 ${pool.length}（全库 ${words.length}）`)
console.log(
  `[loan] 前 5: ` +
    pool.slice(0, 5).map((w) => `${w.form}(${w.freqRank},${w.pos || '?'})`).join(', ')
)
console.log(
  `[loan] 后 5: ` +
    pool.slice(-5).map((w) => `${w.form}(${w.freqRank},${w.pos || '?'})`).join(', ')
)
console.log(`[loan] freqRank ≤ 8000: ${pool.filter((w) => w.freqRank <= 8000).length} · ≤ 20000: ${pool.filter((w) => w.freqRank <= 20000).length}`)

// ---------------------------------------------------------------- 词素表
const morphMod = await import(pathToFileURL(path.join(ROOT, 'src/data/morphemes.js')).href)
const MORPHS = morphMod.default || morphMod
const MORPH_IDS = new Set(MORPHS.map((m) => m.id))
const MORPH_BY_ID = new Map(MORPHS.map((m) => [m.id, m]))
/** 只发「id / type / 词形(含变体) / 中文义」四列；display 里带变体，模型才知道 ceive→r.cap */
const MORPH_TABLE = MORPHS.map((m) =>
  [m.id, m.type, m.display || m.form, m.gloss || m.glossEn || ''].join('\t')
).join('\n')
console.log(`[loan] 词素表 ${MORPHS.length} 条 / ${MORPH_TABLE.length} 字符`)

const INFLECTION = new Set(['s.ed', 's.ing', 's.plural'])
const isInflectionOnly = (pieces) => !pieces.some((p) => p.morph && !INFLECTION.has(p.morph))

// ---------------------------------------------------------------- 缓存
let cache = { v: 1, entries: {} }
// ★ 默认总是读缓存：已经判过的词不会重复花钱。想从头重跑就用 --fresh。
//   （--resume 保留为显式别名）
if (!has('--fresh') && fs.existsSync(CACHE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE, 'utf8'))
    if (cache && cache.entries) console.log(`[loan] 载入缓存 ${Object.keys(cache.entries).length} 条${RESUME ? ' (--resume)' : ''}`)
  } catch {
    console.log('[loan] 缓存损坏，重建')
  }
}
const saveCache = () => fs.writeFileSync(CACHE, JSON.stringify(cache))
// 本轮新判定的 id（供 --from last 抽样）
const freshIds = new Set()

// 词素表新增条目后，只重跑受影响的那一小批（不重新花钱跑全量）
const RERUN_AL = has('--rerun-al')
const AL_END = /(al|ical|ual)$/i
let todo
if (RERUN_AL) {
  todo = Object.values(cache.entries)
    .filter((v) => v.verdict !== 'decomposable' && AL_END.test(v.form))
    .map((v) => ({ id: v.id, form: v.form, pos: v.pos, freqRank: v.freqRank, cefr: '' }))
    .sort((a, b) => a.freqRank - b.freqRank)
  console.log(`[loan] --rerun-al：重跑「非 decomposable 且以 al/ical/ual 结尾」的 ${todo.length} 条`)
} else {
  todo = LIMIT != null ? pool.slice(0, LIMIT) : pool
  todo = todo.filter((w) => !cache.entries[w.id])
}

if (PROBE) {
  console.log('[loan] --probe 结束，不请求 API。')
  process.exit(0)
}

// ---------------------------------------------------------------- 人工抽检
if (AUDIT_N) {
  const vals = Object.values(cache.entries)
  let src = vals
  if (AUDIT_FROM === 'last') {
    let ids = []
    try {
      ids = JSON.parse(fs.readFileSync(LASTRUN, 'utf8'))
    } catch {
      ids = []
    }
    const set = new Set(ids)
    if (set.size) src = vals.filter((v) => set.has(v.id))
    else console.log('[loan] ⚠ 无上一轮记录，退回全量抽样')
  }
  const dec = src.filter((v) => v.verdict === 'decomposable')
  const pick = sampleRandom(dec, AUDIT_N)
  const rows = pick.map((v) => ({
    form: v.form,
    freqRank: v.freqRank,
    pos: v.pos,
    etym: v.etym || '',
    pieces: v.pieces,
    inflectionOnly: !!v.inflectionOnly,
  }))
  fs.mkdirSync(path.dirname(AUDIT_OUT), { recursive: true })
  fs.writeFileSync(AUDIT_OUT, JSON.stringify(rows, null, 1))
  console.log(`[loan] 抽检样本 ${rows.length} 条 → ${path.relative(ROOT, AUDIT_OUT)}`)
  for (const r of rows) {
    const seg = r.pieces.map((p) => `${p.form}${p.morph ? `[${p.morph}]` : '[null]'}`).join(' + ')
    console.log(`  ${r.form} (${r.freqRank}) = ${seg}   ‖ ${r.etym}`)
  }
  process.exit(0)
}
function sampleRandom(arr, n) {
  if (arr.length <= n) return arr.slice()
  // 固定种子的 LCG：同一份结果每次抽到的样本一致，便于复核
  let seed = 20261013
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const idx = new Set()
  while (idx.size < n) idx.add(Math.floor(rnd() * arr.length))
  return [...idx].sort((a, b) => a - b).map((i) => arr[i])
}

// ---------------------------------------------------------------- prompt
function buildPrompt() {
  return [
    '你是英语词源学（etymology）专家，正在为一个「词根词缀学习站」判定哪些英语单词能拆成真实的拉丁/希腊词素。',
    '',
    '## 可用词素清单（id \\t type \\t 词形(含变体) \\t 中文义）',
    '★ 只能使用清单里出现的 id；清单里没有的词素一律不允许使用。',
    MORPH_TABLE,
    '',
    '## 三选一判定',
    '- `decomposable`：该词在**真实词源上**确实由清单里的词素构成，且你能把词形**逐字母完整**切分覆盖。',
    '- `not-decomposable`：整体借入词、日耳曼/古英语基本词、专有名词派生、来源不明、或缺少清单里必要的词素。',
    '- `uncertain`：拿不准就用它。**这是安全选项，宁可漏拆也不要错拆**——判错会把错误词根塞进教学内容，判成不可拆只是维持现状。',
    '',
    '## 硬性规则（违反即判错）',
    '1. **只允许原样引用清单里的 id**。缺词素就把那一段写成 `"morph": null`，并在 `missing` 里写清楚缺什么（如 "act=做，行动"）。**绝不许自己拼 id**。',
    '2. **pieces 的 form 按顺序拼接（忽略大小写与连字符）必须完全等于原词**。不许删字母、加字母、改写字母，也不许写成 "str(uct)" 这种带括号的形式。',
    '   连接字母 / 无法归属的残段一律用 `"morph": null`。',
    '3. **语义检验（最重要）**：每个词根的义项必须真的与该词的**现代词义**有可解释的关联。仅因拼写相同而切分 = 错误。',
    '4. ★**找不到词根就用 null，不要凑一个拼写相近的词根**★：词干是整体借入词（如 `organization` 的 organ、`activity` 的 act、`reasonable` 的 reason）时，词干段用 null，',
    '   只要确实含有清单里的**派生后缀/前缀**（-tion / -able / -ive / -ity / -ize / -ment / -ous / pre- …），整体仍判 `decomposable`。',
    '   这与本站已有数据的写法一致（如 realized = real[null] + -ize + -ed）。',
    '5. 若只切得出词干 + 屈折后缀（-ed / -ing / -s），也判 `decomposable`，但 reason 里必须注明「仅屈折」。',
    '   若连一个清单里的前缀/后缀/词根都没有（如 booth / pour / atmosphere），判 `not-decomposable`。',
    '6. pieces 段数 2~5 段。整词只切一段 = not-decomposable。',
    '',
    '## 严禁的错误模式（这些是上一轮人工审计判错的真实例子，务必避开）',
    '- **日耳曼/古英语基本词硬套拉丁希腊词根**：`marching`≠march+r.arch(首领)、`spelling`≠spell+r.pell、`faltering`≠falter+r.ali、`archery`≠r.arch、`anchor`≠r.chor、`curveball/basketball`≠ball(投掷)、`bartending`≠r.bar(重压)、`siphoning`≠r.phon(声音)、`worth`≠r.orth(正,直)。这些全是日耳曼基本词，一律 not-decomposable。',
    '- **纯字母巧合**：`rapprochement`≠r.rap+r.pro、`mentalist`≠r.ment+r.ali、`monogrammed` 的双写 m+ed ≠ r.med(中间)。',
    '- **整词借入误当可拆**：`pandering`（源自专名 Pandareos）、`difficult`（不是 -cult，也不能随便切 fic）。',
    '- **把英语介词/小品词当词缀**：`in`≠s.ine、`out`≠p.out、`over`≠p.over（在 fall over 这类短语里它们是独立小品词）。',
    '- **语义无关的拼写切分**：`reasonable`≠rea+r.son(声音)+able —— reason 来自拉丁 ratio「计算、理性」，和「声音」无关。',
    '- **拿拼写相近的词根给整体借入词干凑数**（正确做法是把词干写成 null）：',
    '  `benefit`≠bene+r.fac(fit)（fit 段与 fac 词形对不上，应写 null）；`reasonable`≠r.rat(reason)+able；',
    '  `tradition`≠tra+r.don(di)+tion；`cleared`≠r.clar(clear)+ed；`developed`≠p.dis(de)+velop+ed。',
    '',
    '## 自检（输出前逐条默念）',
    '- 我用的每个 id 都在清单里原样出现过吗？（没出现过 → 那段写 null）',
    '- 每段 form 拼起来与原词**逐字母**相等吗？',
    '- 每个词根的义项能解释这个词的**现代词义**吗？不能 → 那段改 null，或改判 uncertain。',
    '- 词源不确定 → `uncertain`。**误拆的代价远大于漏拆。**',
    '',
    '## 输出（严格 JSON 数组，每个输入词一条，顺序一致，不要任何多余文字）',
    '[' +
      '{"form":"determined","verdict":"decomposable","etym":"拉丁 de- + terminare(定界) + -ed",' +
      '"pieces":[{"morph":"p.de","form":"de","gloss":"彻底"},{"morph":"r.termin","form":"termin","gloss":"界限，限定"},{"morph":"s.ed","form":"ed","gloss":"过去式/过去分词"}],"missing":[],"reason":"de(彻底)+termin(定界)+ed"},' +
      '{"form":"reasonable","verdict":"decomposable","etym":"拉丁 ratio(计算、理性) → reason + -able",' +
      '"pieces":[{"morph":null,"form":"reason","gloss":"理由（整体借入，清单无对应词根）"},{"morph":"s.able","form":"able","gloss":"可…的"}],"missing":["ratio=计算、理性（清单无对应词根）"],"reason":"reason[null]+able"},' +
      '{"form":"pour","verdict":"not-decomposable","etym":"中古英语 pouren，来源不明","pieces":[],"missing":[],"reason":"日耳曼基本词/来源不明"}' +
      ']',
  ].join('\n')
}
const SYSTEM_PROMPT = buildPrompt()

// ---------------------------------------------------------------- 校验
const norm = (s) => String(s ?? '').toLowerCase().replace(/[-\s'’]/g, '')

/**
 * 代码侧硬校验——不依赖模型遵守指令。
 * @returns {{ok: boolean, verdict: string, pieces: Array, why: string}}
 */
function validate(wordForm, raw) {
  const wf = norm(wordForm)
  let verdict = ['decomposable', 'not-decomposable', 'uncertain'].includes(raw.verdict) ? raw.verdict : 'uncertain'
  let pieces = Array.isArray(raw.pieces) ? raw.pieces.filter((p) => p && typeof p === 'object') : []
  pieces = pieces.map((p) => ({
    morph: typeof p.morph === 'string' && p.morph ? p.morph : null,
    form: typeof p.form === 'string' ? p.form : '',
    gloss: typeof p.gloss === 'string' ? p.gloss : '',
  }))

  // (a) 编造 id
  const invented = pieces.filter((p) => p.morph && !MORPH_IDS.has(p.morph)).map((p) => p.morph)
  if (invented.length) return { ok: false, verdict: 'uncertain', pieces: [], why: `编造 id ${invented.join('/')}` }

  // (b) 不可拆却给了实词素 → 自相矛盾；只给 null 段则视为无害，清空即可
  if (verdict === 'not-decomposable') {
    if (pieces.some((p) => p.morph)) return { ok: false, verdict: 'uncertain', pieces: [], why: 'verdict=not-decomposable 但给了实词素' }
    return { ok: true, verdict: 'not-decomposable', pieces: [], why: '' }
  }
  if (verdict === 'uncertain') return { ok: true, verdict: 'uncertain', pieces: [], why: '' }

  // (c) decomposable：必须有 >=1 个实词素，>=2 段，<=5 段
  if (!pieces.some((p) => p.morph)) return { ok: true, verdict: 'not-decomposable', pieces: [], why: '无实词素（降级）' }
  if (pieces.length < 2) return { ok: false, verdict: 'uncertain', pieces: [], why: '只有 1 段' }
  if (pieces.length > 5) return { ok: false, verdict: 'uncertain', pieces: [], why: `段数 ${pieces.length} > 5` }

  // (d) 每段 form 必须是纯字母，且非空
  for (const p of pieces) {
    const f = norm(p.form)
    if (!f || !/^[a-z]+$/.test(f)) return { ok: false, verdict: 'uncertain', pieces: [], why: `段形非法 "${p.form}"` }
  }

  // (e) 拼接必须完全等于原词形
  const joined = pieces.map((p) => norm(p.form)).join('')
  if (joined !== wf) return { ok: false, verdict: 'uncertain', pieces: [], why: `拼接 "${joined}" ≠ 原词 "${wf}"` }

  // (f) 段形与该词素的词形/变体毫无关系（既不包含也不被包含）→ 疑似张冠李戴
  for (const p of pieces) {
    if (!p.morph) continue
    const m = MORPH_BY_ID.get(p.morph)
    if (!m) continue
    const f = norm(p.form)
    const cands = [m.form, ...(m.variants || []), ...String(m.display || '').split(/[\s\/,]+/)]
      .map(norm)
      .filter(Boolean)
    // ★ 长度约束：只靠「变体包含段形」会放过 al ⊂ ical 这种张冠李戴
    //   （spiritual 的 -al 曾被标成 s.ic）。要求段形至少达到变体长度 -1。
    const related = cands.some(
      (c) => c.length >= 2 && (f === c || f.includes(c) || (c.includes(f) && f.length >= c.length - 1))
    )
    if (!related) return { ok: false, verdict: 'uncertain', pieces: [], why: `段形 "${p.form}" 与 ${p.morph}(${m.form}) 不匹配` }
  }

  return { ok: true, verdict: 'decomposable', pieces, why: '' }
}

/**
 * 段边界归位：模型常把词干末尾的一两个字母算进后缀段（internal → inter + nal）。
 * 词素归属是对的，但展示给用户看的段形是错的（internal 的 -al 只有 "al"，"n" 属词干）。
 * 处理：把多出来的前缀字母挪回前一段——前一段是 null 就直接拼接，
 *      前一段带词素就在中间插一个 null 段，避免污染那个词素的段形。
 * @param {Array<{morph: string|null, form: string, gloss: string}>} pieces
 * @returns {Array} 新数组（不改动入参）
 */
function normalizeSuffixEdge(pieces) {
  const out = pieces.map((p) => ({ ...p }))
  for (let i = 1; i < out.length; i++) {
    const p = out[i]
    if (!p.morph) continue
    const m = MORPH_BY_ID.get(p.morph)
    if (!m || m.type !== 'suffix') continue
    const f = norm(p.form)
    const cands = [m.form, ...(m.variants || [])].map(norm).filter((c) => c.length >= 2)
    const c = cands.filter((x) => f !== x && f.endsWith(x)).sort((a, b) => b.length - a.length)[0]
    if (!c) continue
    const extra = f.slice(0, f.length - c.length)
    if (extra.length < 1 || extra.length > 4) continue
    const prev = out[i - 1]
    if (prev.morph) {
      if (out.length >= 5) continue // 插段会超上限就放弃
      out.splice(i, 0, { morph: null, form: extra, gloss: '' })
      p.form = c
      i++ // 跳过刚插入的 null 段
    } else {
      prev.form = prev.form + extra
      p.form = c
    }
  }
  return out
}

// ---------------------------------------------------------------- 请求
let tPrompt = 0
let tHit = 0
let tMiss = 0
let tOut = 0
let stored = 0
let failed = 0
let rejected = 0

async function callApi(messages) {
  const body = { model: 'deepseek-chat', temperature: 0, max_tokens: 4000, messages }
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 120000)
  let res
  try {
    res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
      signal: ac.signal,
    })
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`)
  }
  return res.json()
}

async function classifyBatch(batch, attempt = 1) {
  const json = await callApi([
    { role: 'system', content: '只输出 JSON 数组。' },
    {
      role: 'user',
      content:
        SYSTEM_PROMPT +
        '\n\n## 待判定单词\n' +
        JSON.stringify(batch.map((w) => ({ form: w.form, pos: w.pos || '', cefr: w.cefr || '' }))),
    },
  ])
  const u = json.usage || {}
  tPrompt += u.prompt_tokens || 0
  tHit += u.prompt_cache_hit_tokens || 0
  tMiss += u.prompt_cache_miss_tokens || 0
  tOut += u.completion_tokens || 0
  const content = String(json.choices?.[0]?.message?.content || '').trim()
  const m = content.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('返回里没有 JSON 数组: ' + content.slice(0, 200))
  const arr = JSON.parse(m[0])
  const byForm = new Map()
  for (const r of arr) if (r && r.form) byForm.set(norm(r.form), r)

  for (const w of batch) {
    const r = byForm.get(norm(w.form))
    if (!r) {
      failed++
      continue
    }
    let v = validate(w.form, r)
    // 段边界归位后必须重新校验：挪字母可能让某个词素的段形匹配失效
    if (v.verdict === 'decomposable') {
      const fixed = normalizeSuffixEdge(v.pieces)
      if (fixed.length !== v.pieces.length || fixed.some((p, k) => norm(p.form) !== norm(v.pieces[k].form))) {
        const v2 = validate(w.form, { verdict: 'decomposable', pieces: fixed })
        if (v2.verdict === 'decomposable') {
          v = v2
        } else {
          console.warn(`  · ${w.form} 边界归位后校验失败(${v2.why})，保留原切分`)
        }
      }
    }
    let missing = []
    if (Array.isArray(r.missing)) {
      missing = r.missing.filter((x) => typeof x === 'string').slice(0, 4).map((x) => x.slice(0, 40))
    }
    const entry = {
      id: w.id,
      form: w.form,
      freqRank: w.freqRank,
      pos: w.pos || '',
      verdict: v.verdict,
      pieces: v.pieces,
      inflectionOnly: v.verdict === 'decomposable' ? isInflectionOnly(v.pieces) : false,
      etym: typeof r.etym === 'string' ? r.etym.slice(0, 160) : '',
      reason: typeof r.reason === 'string' ? r.reason.slice(0, 200) : '',
      missing, // ★ 仅用于统计「缺哪些词素」，绝不可当作 morphId 使用
      at: new Date().toISOString(),
    }
    if (!v.ok) {
      rejected++
      entry.raw = { verdict: r.verdict, pieces: Array.isArray(r.pieces) ? r.pieces : [], reason: String(r.reason || '').slice(0, 200) }
      entry.reason = `【已拦】${v.why}；模型原判 ${r.verdict}`
    }
    cache.entries[w.id] = entry
    freshIds.add(w.id)
    stored++
  }
}

// ---------------------------------------------------------------- 主流程
if (has('--revalidate') || has('--normalize')) {
  console.log('[loan] 只做离线复检，跳过 API 请求。')
} else if (DRY) {
  console.log('[loan] --dry：只报告规模，不请求 API。')
} else if (todo.length) {
  console.log(`[loan] 本次处理 ${todo.length} · 并发 ${CONCURRENCY} · 每批 ${BATCH}`)
  if (todo.length) console.log(`[loan] 起点: ${todo.slice(0, 10).map((w) => w.form).join(', ')}`)
  const batches = []
  for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH))
  let done = 0
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const slice = batches.slice(i, i + CONCURRENCY)
    await Promise.all(
      slice.map(async (b) => {
        try {
          await classifyBatch(b)
        } catch (e1) {
          try {
            await classifyBatch(b, 2) // 单次重试
          } catch (e2) {
            failed += b.length
            console.error(`  ✗ 批失败(${b[0].form}…): ${e2.message}`)
          }
        }
      })
    )
    done += slice.length
    saveCache()
    const cost = tMiss * P_MISS + tHit * P_HIT + tOut * P_OUT
    console.log(`  [loan] ${done}/${batches.length} 批 · 入库 ${stored} · 失败 ${failed} · 拦下 ${rejected} · ≈$${cost.toFixed(4)}`)
  }
}

// ---------------------------------------------------------------- 离线复检
// 收紧校验规则后，对**已判定**的结果重跑一遍代码侧校验（不花钱、不调 API）。
// 只影响 `decomposable`：过不了新规则的降级为 uncertain。
if (has('--revalidate') || has('--normalize')) {
  const vals = Object.values(cache.entries)
  let down = 0
  let cleaned = 0
  let moved = 0
  for (const v of vals) {
    // 段边界归位（internal: inter+nal → inter+n+al）
    if (has('--normalize') && v.verdict === 'decomposable' && Array.isArray(v.pieces) && v.pieces.length) {
      const fixed = normalizeSuffixEdge(v.pieces)
      if (fixed.some((p, k) => norm(p.form) !== norm(v.pieces[k].form) || p.morph !== v.pieces[k].morph)) {
        const v2 = validate(v.form, { verdict: 'decomposable', pieces: fixed })
        if (v2.verdict === 'decomposable') {
          v.pieces = v2.pieces
          moved++
        }
      }
    }
    // ★ 顺带清理「verdict 不是 decomposable 却还挂着 pieces」的脏记录
    //   （第一次复检只改了 verdict 忘了清 pieces，产出会被下游当成可拆数据）
    if (v.verdict !== 'decomposable' && Array.isArray(v.pieces) && v.pieces.length) {
      v.raw = v.raw || { verdict: v.verdict, pieces: v.pieces, reason: v.reason }
      v.pieces = []
      v.inflectionOnly = false
      cleaned++
    }
    if (v.verdict !== 'decomposable' || !Array.isArray(v.pieces) || v.pieces.length === 0) continue
    const r = validate(v.form, { verdict: 'decomposable', pieces: v.pieces })
    if (r.verdict !== 'decomposable') {
      down++
      v.raw = { verdict: v.verdict, pieces: v.pieces, reason: v.reason }
      v.pieces = [] // ★ 一并清空，绝不留半成品
      v.reason = `【复检拦下】${r.why}`
      v.verdict = 'uncertain'
      v.inflectionOnly = false
    }
  }
  saveCache()
  console.log(`[loan] 复检：${vals.length} 条 · 降级 ${down} · 边界归位 ${moved} · 清理残留 pieces ${cleaned}`)
}

// ---------------------------------------------------------------- 输出
function writeOut() {
  if (freshIds.size) fs.writeFileSync(LASTRUN, JSON.stringify([...freshIds]))
  const vals = Object.values(cache.entries).sort((a, b) => a.freqRank - b.freqRank || a.form.localeCompare(b.form, 'en'))
  const dec = vals.filter((v) => v.verdict === 'decomposable')
  const not = vals.filter((v) => v.verdict === 'not-decomposable').length
  const unc = vals.filter((v) => v.verdict === 'uncertain').length
  const infl = dec.filter((v) => v.inflectionOnly).length
  const rej = vals.filter((v) => v.raw).length
  const missingCount = new Map()
  for (const v of vals) for (const s of v.missing || []) missingCount.set(s, (missingCount.get(s) || 0) + 1)
  const missingTop = [...missingCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)
  const cost = tMiss * P_MISS + tHit * P_HIT + tOut * P_OUT
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        pool: { total: pool.length, processed: vals.length, freqRankMin: vals[0]?.freqRank ?? null, freqRankMax: vals.at(-1)?.freqRank ?? null },
        totals: {
          judged: vals.length,
          decomposable: dec.length,
          decomposableSubstantive: dec.length - infl,
          decomposableInflectionOnly: infl,
          notDecomposable: not,
          uncertain: unc,
          rejectedByGuard: rej,
          failed,
        },
        tokens: { prompt: tPrompt, cacheHit: tHit, cacheMiss: tMiss, completion: tOut },
        costUsd: Number(cost.toFixed(4)),
        missingTop,
        items: vals,
      },
      null,
      1
    )
  )
  console.log(
    `[loan] 已写 ${path.relative(ROOT, OUT)} · 可拆 ${dec.length}（其中仅屈折 ${infl}）· 不可拆 ${not} · 不确定 ${unc} · 校验拦下 ${rej} · ≈$${cost.toFixed(4)}`
  )
}
writeOut()

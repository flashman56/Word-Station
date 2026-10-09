/**
 * 垃圾/可疑词条全量扫描器（审计脚本，只读不写）
 * ------------------------------------------------------------------
 * 用途：扫描 src/data/words-*.js，找出两类可疑词条：
 *
 *   A 类 —— gloss 里**自认**是错词（「拼写有误」「疑为」「疑似」「错别字」
 *           「误拼」「非标准拼写」等），且能判定该描述是针对**本条目自身**
 *           而不是在解释「拼写错误」这个概念。这类最确定，应删除。
 *
 *   B 类 —— form 本身不像合法英文单词：长度 ≤2、含数字、含非 ASCII、
 *           含空格/连字符但 kind 不是 phrase、疑似乱码串。这类需人工复核，
 *           注意别误伤合法短词（ox / ax / pi / id / oh / ah）和真正的 phrase。
 *
 * 判定「自认错词」的关键：关键词必须出现在括号里，或紧跟在另一个词后面
 * 构成「X 的误拼」这种引用式描述。否则像 cacography（释义「拙劣的书法；
 * 拼写错误」）、misspell（「拼错」）这类**以拼写错误为词义**的正常词会误伤。
 *
 * 用法：node scripts/scan-junk-words.mjs
 * 输出：stdout 摘要 + reports/junk-scan.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src/data')

/** 参与扫描的数据文件（顺序同 src/data/index.js） */
const WORD_FILES = [
  'words-latin.js',
  'words-greek.js',
  'words-affix.js',
  'words-extra.js',
  'words-mono.js',
  'words-mono-extra.js',
  'words-mono-seed.js',
]

/** A 类：gloss 中「自认有误」的关键词 */
const A_KEYWORDS = [
  '拼写有误', '拼写错误', '疑似拼写', '错误拼写', '疑似为', '疑为', '疑似',
  '错别字', '误拼', '错拼', '拼错', '疑是', '非标准', '不规范', '拼写异常',
  '乱码', '无实义', '无意义拼写', '未明词',
]

/**
 * A 类白名单：这些词本身是**合法英文词**，只是词义恰好和「拼写错误」有关，
 * 不是自认错词，扫描器必须显式排除，删了会造成词库缺口。
 */
const A_FALSE_POSITIVE_WHITELIST = new Set([
  'cacography', // 拙劣的书法；（本义就是）拼写错误
  'cacographyc',
  'misspell', // 拼错（动词）
  'misspelled', // 拼错的
  'misspelling', // 拼写错误（名词）
  'misspells',
  'denormalize', // 使非正常化；使不规范
  'denormalized',
  'denormalization',
  'nonstandard', // 非标准的
  'substandard', // 不规范的
  'irregular', // 不规则的
])

/** B 类：合法英文短词白名单（长度 ≤3），避免误伤 */
const B_SHORT_WHITELIST = new Set([
  'a', 'i', 'o', 'ox', 'ax', 'pi', 'id', 'in', 'on', 'at', 'an', 'as', 'am',
  'be', 'by', 'do', 'go', 'he', 'if', 'is', 'it', 'me', 'my', 'no', 'of',
  'or', 'so', 'to', 'up', 'us', 'we', 'add', 'age', 'aid', 'aim', 'air',
  'all', 'and', 'any', 'ape', 'arm', 'art', 'ask', 'bad', 'bag', 'bar',
  'bat', 'bay', 'bed', 'bet', 'big', 'bit', 'box', 'boy', 'bug', 'bus',
  'but', 'buy', 'can', 'cap', 'car', 'cat', 'cop', 'cow', 'cry', 'cup',
  'cut', 'day', 'die', 'dig', 'dog', 'dot', 'dry', 'due', 'ear', 'eat',
  'egg', 'end', 'era', 'eye', 'fan', 'far', 'fat', 'fee', 'few', 'fit',
  'fix', 'fly', 'for', 'fox', 'fun', 'gap', 'gas', 'get', 'god', 'got',
  'gym', 'had', 'hat', 'her', 'him', 'his', 'hit', 'hot', 'how', 'hub',
  'ice', 'ill', 'job', 'joy', 'key', 'kid', 'law', 'lay', 'let', 'lie',
  'lip', 'log', 'lot', 'low', 'mad', 'man', 'map', 'may', 'men', 'mix',
  'mom', 'mud', 'net', 'new', 'nor', 'not', 'now', 'nut', 'odd', 'off',
  'oil', 'old', 'one', 'out', 'own', 'pan', 'pay', 'pen', 'pet', 'pop',
  'pot', 'put', 'raw', 'red', 'rid', 'run', 'sad', 'say', 'sea', 'see',
  'set', 'she', 'sin', 'sit', 'six', 'sky', 'son', 'sun', 'tax', 'tea',
  'ten', 'tie', 'tip', 'too', 'top', 'try', 'two', 'use', 'van', 'via',
  'war', 'way', 'who', 'why', 'win', 'yes', 'yet', 'you', 'zip', 'zoo',
  'the', 'are', 'was', 'were', 'has', 'have', 'been', 'its', 'our', // 功能词
  'oh', 'ah', 'eh', 'mm', 'hm', 'er', 'ow', 'aw', 'ha', 'hey', 'hi', 'ho',
  'ok', 'okay', 'ye', 'yo', 'uh', 'um', 'ai', 'tv', 'pc', 'cd', 'dvd', 'gps',
  'mr', 'ms', 'mrs', 'dr', 'st', 'vs', 'ex', 'pm', 'am', 'un', // 缩写/称呼
])

/**
 * 判断一条 gloss 是否**自认**本条目是错词。
 *
 * 判定条件（满足其一）：
 *   1) 关键词出现在中文括号「（…）」内部 —— 例如「（拼写有误，疑为 everything）」
 *   2) 关键词以「X 的<关键词>」形式引用了另一个词 —— 例如「everything 的误拼」
 *
 * @param {string} gloss 释义原文
 * @param {string} form 词形（用于查白名单，排除以「拼写错误」为词义的正常词）
 * @returns {string[]} 命中的关键词列表（去重）
 */
function classAHits(gloss, form) {
  const text = String(gloss || '')
  if (!text) return []
  if (A_FALSE_POSITIVE_WHITELIST.has(String(form || '').toLowerCase())) return []

  const hits = new Set()

  // 规则 1：关键词位于括号内
  const parens = text.match(/（[^）]*）/g) || []
  for (const seg of parens) {
    for (const kw of A_KEYWORDS) {
      if (seg.includes(kw)) hits.add(`${kw}(括号内)`)
    }
  }

  // 规则 2：「X 的<关键词>」引用式描述（关键词前带「的」）
  for (const kw of A_KEYWORDS) {
    const idx = text.indexOf(kw)
    if (idx <= 0) continue
    const before = text.slice(Math.max(0, idx - 1), idx)
    if (before === '的') hits.add(`${kw}(引用式)`)
  }

  // 规则 3：整条 gloss 就是「（疑似拼写错误）」这类，且不含任何实义中文释义
  // （已被规则 1 覆盖，这里不再重复）

  return [...hits]
}

/**
 * 判断 form 本身是否不像合法英文单词。
 * @param {object} w 词条对象
 * @returns {string[]} 命中原因
 */
function classBHits(w) {
  const form = String(w.form || '')
  const kind = String(w.kind || '')
  const reasons = []

  if (!form) return ['空 form']

  if (/[^\x00-\x7F]/.test(form)) reasons.push('含非 ASCII 字符')
  if (/[0-9]/.test(form)) reasons.push('含数字')
  if (/[^\w\s'-]/.test(form)) reasons.push('含异常符号')
  if (form.length <= 2 && !B_SHORT_WHITELIST.has(form.toLowerCase())) {
    reasons.push(`长度 ${form.length}（非白名单）`)
  }
  if (/^[bcdfghjklmnpqrstvwxyz]{5,}$/.test(form) && !/[aeiouy]/.test(form)) {
    reasons.push('全辅音且长度 ≥5（疑似乱码）')
  }
  if (
    (form.includes(' ') || form.includes('-')) &&
    kind !== 'phrase' &&
    kind !== 'proper' &&
    kind !== 'loan'
  ) {
    reasons.push(`含空格/连字符但 kind=${kind || '(空)'}`)
  }

  return reasons
}

/**
 * 在源文件文本里定位某个 form 首次出现的行号（用于报告）。
 * @param {string[]} lines 文件按行切分
 * @param {string} form 词形
 * @returns {number} 行号（1 起），找不到返回 0
 */
function findLine(lines, form) {
  const quoted = [`"form":"${form}"`, `'${form}'`, `"${form}"`]
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (quoted.some((q) => line.includes(q))) return i + 1
  }
  return 0
}

/** 主流程 */
async function main() {
  const classA = []
  const classB = []
  const stats = []

  for (const f of WORD_FILES) {
    const abs = path.join(DATA_DIR, f)
    const mod = await import(`file://${abs}`)
    const list = mod.default || []
    const lines = fs.readFileSync(abs, 'utf8').split('\n')

    let a = 0
    let b = 0
    const seenForm = new Map()

    list.forEach((w, i) => {
      if (!w || typeof w.form !== 'string') return
      const form = w.form
      const aHits = classAHits(w.gloss, form)
      if (aHits.length > 0) {
        a += 1
        classA.push({
          file: f,
          line: findLine(lines, form) || i,
          form,
          gloss: w.gloss,
          id: w.id,
          kind: w.kind || '',
          hits: aHits,
        })
      }
      const bHits = classBHits(w)
      if (bHits.length > 0) {
        b += 1
        const key = `${form}|${bHits.join(';')}`
        if (!seenForm.has(key)) {
          seenForm.set(key, true)
          classB.push({
            file: f,
            line: findLine(lines, form) || i,
            form,
            gloss: w.gloss,
            id: w.id,
            kind: w.kind || '',
            reasons: bHits,
          })
        }
      }
    })

    stats.push({ file: f, count: list.length, a, b })
  }

  const out = { generatedAt: new Date().toISOString(), stats, classA, classB }
  const outFile = path.join(ROOT, 'reports/junk-scan.json')
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8')

  console.log('=== 文件统计 ===')
  for (const s of stats) {
    console.log(`${s.file.padEnd(22)} count=${String(s.count).padStart(6)}  A=${String(s.a).padStart(4)}  B=${String(s.b).padStart(5)}`)
  }
  console.log(`\n=== A 类（gloss 自认有误）：${classA.length} 条 ===`)
  for (const x of classA) {
    console.log(`  ${x.file}:${x.line}\t${x.form}\t${JSON.stringify(x.gloss)}\t[${x.hits.join(',')}]`)
  }
  console.log(`\n=== B 类（form 不合法）：${classB.length} 条 ===`)
  const byReason = {}
  for (const x of classB) {
    const k = x.reasons.join('; ')
    byReason[k] = (byReason[k] || 0) + 1
  }
  console.log('-- 原因分布 --')
  Object.entries(byReason)
    .sort((p, q) => q[1] - p[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`))
  console.log('-- 明细 --')
  for (const x of classB) {
    console.log(`  ${x.file}:${x.line}\t${x.form}\tkind=${x.kind || '-'}\t[${x.reasons.join(';')}]\t${JSON.stringify(String(x.gloss || '').slice(0, 30))}`)
  }
  console.log(`\n报告已写入: ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

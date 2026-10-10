/**
 * scripts/compose-phon.mjs
 * ------------------------------------------------------------------
 * 短语 / 复合词音标**拼接**（查表组合，绝不编造）
 *
 * 背景：phonetics.js 缺音标的 5,866 条里，有 1,183 条是「多词短语」或「连字符复合词」
 *       （如 `take into account`、`apple-tree`）。**任何单词词典都不会把短语作为词条收录**，
 *       所以 ECDICT / ipa-dict / kaikki 全都拿不到——但它们可以由**成分词的真实音标拼接**得到。
 *
 * 红线（与 gen-phon.mjs 一致）：**绝不生成音标**。本脚本只做拼接：
 *   ① 成分词音标必须来自既有真实数据（`phonetics.p` 或词条内联 `phoneticBr`）；
 *   ② **全部成分都有音标才拼接**，缺任意一个 → 整条跳过（不做部分填充、不猜测、不补全）；
 *   ③ 只填空缺，绝不覆盖已有 p；
 *   ④ 产物写回交给 gen-phon.mjs 的 writePhoneticsJs（复用其字段级防丢合并）。
 *
 * 用法：
 *   node scripts/compose-phon.mjs           # 试运行：只统计，不写任何东西
 *   node scripts/compose-phon.mjs --apply   # 把拼接结果写入 .gen-phon-cache.json
 *                                           # 随后须跑 node scripts/gen-phon.mjs --match-only 落盘
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { words } from '../src/data/index.js'
import { phonetics } from '../src/data/phonetics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CACHE_PATH = path.join(ROOT, 'scripts/.gen-phon-cache.json')
const APPLY = process.argv.includes('--apply')

/** 去掉音标两端的斜杠（内联 phoneticBr 形如 /ˈsɜːkəmspekt/，phonetics.p 无斜杠）。 */
function stripSlashes(s) {
  return String(s == null ? '' : s).trim().replace(/^\/+/, '').replace(/\/+$/, '')
}

// ---------------- 成分词音标查表 ----------------
/** 词条内联音标：form(小写) -> p（已去斜杠） */
const inlineP = new Map()
for (const w of words) {
  const k = String((w && w.form) || '').toLowerCase()
  if (!k || inlineP.has(k)) continue
  const raw = w.phoneticBr || w.phonetic
  if (raw && String(raw).trim()) inlineP.set(k, stripSlashes(raw))
}

/** 查一个成分词的真实音标；查不到返回 null。 */
function lookupP(token) {
  const e = phonetics[token]
  if (e && e.p && String(e.p).trim()) return String(e.p).trim()
  const i = inlineP.get(token)
  if (i) return i
  return null
}

/**
 * 把词形切成成分词；不是短语/复合词则返回 null。
 * - 含空格 → 多词短语（按空白切）
 * - 含连字符 → 复合词（按 - 切）
 */
function tokens(form) {
  if (form.includes(' ')) return form.split(/\s+/).filter(Boolean)
  if (form.includes('-')) return form.split('-').filter(Boolean)
  return null
}

// ---------------- 主流程 ----------------
let candidates = 0
let composed = 0
let skipped = 0
const composedMap = new Map()

for (const w of words) {
  const k = String((w && w.form) || '').toLowerCase()
  if (!k) continue
  // 已有音标（phonetics.p 或内联）→ 不动
  const e = phonetics[k]
  if ((e && e.p && String(e.p).trim()) || w.phoneticBr || w.phonetic) continue

  const toks = tokens(k)
  if (!toks || toks.length < 2) continue // 单词不在此脚本职责内
  candidates++

  // 全部成分都必须有真实音标，缺一个整条跳过
  const parts = []
  let ok = true
  for (const t of toks) {
    const p = lookupP(t)
    if (!p) {
      ok = false
      break
    }
    parts.push(p)
  }
  if (!ok) {
    skipped++
    continue
  }
  composedMap.set(k, parts.join(' '))
  composed++
}

console.log(`[compose] 缺音标中的短语/复合词候选：${candidates}`)
console.log(`[compose] 可拼接（全部成分都有真实音标）：${composed}`)
console.log(`[compose] 跳过（至少一个成分缺音标）：${skipped}`)
const sample = [...composedMap.entries()].slice(0, 8)
for (const [k, v] of sample) console.log(`    · ${k}  ->  ${v}`)

if (!APPLY) {
  console.log('[compose] 试运行结束（未写入）。加 --apply 才会写入缓存。')
  process.exit(0)
}

// ---------------- 写入 gen-phon 缓存（只补 p，绝不覆盖） ----------------
let cache = { v: 1, entries: {} }
if (fs.existsSync(CACHE_PATH)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    if (parsed && parsed.v === 1 && parsed.entries && typeof parsed.entries === 'object') cache = parsed
  } catch {
    console.warn('[compose] 缓存损坏，将重建')
  }
}

let wrote = 0
let skippedExisting = 0
for (const [k, p] of composedMap) {
  const cur = cache.entries[k]
  if (cur && cur.p && String(cur.p).trim()) {
    skippedExisting++ // 已有 p，绝不覆盖
    continue
  }
  cache.entries[k] = { ...(cur || {}), p }
  wrote++
}

fs.writeFileSync(CACHE_PATH, JSON.stringify(cache))
console.log(`[compose] 已写入缓存 ${wrote} 条（跳过已有 p ${skippedExisting} 条）`)
console.log('[compose] 下一步：node scripts/gen-phon.mjs --match-only   # 由 gen-phon 安全落盘')

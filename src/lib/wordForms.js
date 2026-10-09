/**
 * 「常见变形」与「派生词」的展示层反查 —— 纯函数（无 React / DOM / 存储依赖）
 * ------------------------------------------------------------------
 * 背景（数据侧 Step-1 / Step-2 已上线）：
 *   罕见屈折形（honored / shelves …）不再单独学习，学习单元收敛到**词族**；
 *   词库本身**不删任何词** —— 于是「被折叠形」仍在词库里、仍能被浏览到，
 *   只是不出现在学习队列与统计里。本模块补上「既然词还在，就把它的关系显出来」
 *   这一层纯展示逻辑。
 *
 * 本模块回答两个纯展示问题：
 *   ① 「常见变形」= 同一词族的其它词形（屈折形 / 兄弟形）。
 *      数据来源：`src/data/words-lemma.js` 生成的 `.lemma` 折叠关系
 *      （判据借用 `lemmaFold.isFolded`，**不重复实现**折叠规则）。
 *   ② 「派生词」  = 共享**词素**的其它词（构词派生，如 abandon → abandonment）；
 *      无词素的词（`morphs` 为空）退回按词形反查（`stemFamily.familyOf`）。
 *
 * ★ 四条约束 ★
 *   1. **纯函数**：绝不 import 任何 `words-*.js` 数据文件（那会把 28MB 拖进
 *      首屏 chunk）；也绝不 import React / 触碰 DOM / 存储。
 *   2. **只读**：不改任何入参对象；返回的是**新数组**（族内顺序确定）。
 *   3. **一次建好、整个会话复用**：调用方应包在 `useMemo` 里；本模块再按
 *      `words` 数组引用 + `index` / `stemIndex` 引用做 WeakMap 缓存，
 *      避免同一份词库被反复重建索引。
 *   4. **确定性与可解释**：所有排序均给出明确的 tie-break（词频升序，再按词形
 *      字典序），保证同一份输入永远得到同一份输出。
 */

import { isFolded } from './lemmaFold.js'
import { familyOf } from './stemFamily.js'

/** 「常见变形」最多展示几个词形 */
export const FORMS_MAX = 12
/** 「派生词」最多展示几个词 */
export const DERIVATIVES_MAX = 8

/**
 * 与 `lemmaFold.js` 一致的链式解析上限（防御坏数据；生成器已把目标解析到终态）。
 * @type {number}
 */
const MAX_LEMMA_HOPS = 4

/**
 * 排序用词频键：freqRank 越小越常见；缺失/非法 → 排最后。
 * @param {object} w 词条
 * @returns {number}
 */
function rankOf(w) {
  const r = w && w.freqRank
  return typeof r === 'number' && Number.isFinite(r) ? r : Number.MAX_SAFE_INTEGER
}

/**
 * 族内稳定排序：先按词频升序（最常用在前），再按词形字典序。
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function byRankAsc(a, b) {
  const ra = rankOf(a)
  const rb = rankOf(b)
  if (ra !== rb) return ra - rb
  return String(a && a.form).localeCompare(String(b && b.form))
}

/**
 * 取释义的首个义项（`；` / `;` / `,` 分隔），用于 chip 内的简注。
 * @param {string} gloss
 * @returns {string}
 */
function firstGloss(gloss) {
  if (typeof gloss !== 'string') return ''
  return gloss.split(/[；;,，]/)[0].trim()
}

/**
 * 防御性链式解析 `.lemma`，最多 MAX_LEMMA_HOPS 跳；成环时返回起点 id
 * （交由调用方按「未折叠」处理，绝不死循环）。
 * 与 `lemmaFold.js` 的私有实现同语义 —— 这里**只读不改**那份数据，故本轮不允许
 * 改动其导出面，于是在本模块内保留一份等价实现（数据侧目标已是终态，实际 0 跳）。
 * @param {string} id
 * @param {Map<string, object>} byId
 * @returns {string}
 */
function resolveRep(id, byId) {
  let cur = id
  const seen = new Set([cur])
  for (let i = 0; i < MAX_LEMMA_HOPS; i += 1) {
    const w = byId.get(cur)
    const next = w ? w.lemma : null
    if (!next || next === cur) break
    if (seen.has(next)) return id
    seen.add(next)
    cur = next
  }
  return cur
}

/**
 * 模型缓存：以 `words` 数组引用为键，并校验 `index` / `stemIndex` 引用一致才复用。
 * 三者都由调用方（AppShell）从同一份 `words` 派生，故缓存命中稳定、不会取到旧索引。
 * @type {WeakMap<Array, { index: object, stemIndex: object, model: object }>}
 */
const MODEL_CACHE = new WeakMap()

/**
 * 构建「变形 / 派生词」反查模型。
 *
 * @param {Array<object>} words 全量词条（含被折叠形；App 装配后的 `words`）
 * @param {{ morphById: Map, wordsByMorph: Map, wordById: Map }} index
 *        `derive.buildIndex(morphemes, words)` 的产物
 * @param {{ byStem: Map, indexed: number }} stemIndex
 *        `stemFamily.buildStemIndex(words)` 的产物
 * @returns {{
 *   formsOf: (id: string) => Array<object>,
 *   derivativesOf: (word: object, opts?: { excludeIds?: string[], cap?: number }) => Array<object>,
 *   relatedFor: (word: object) => { forms: Array<object>, derivatives: Array<object> },
 * }} 模型对象（三个查询函数均为闭包，共享预建索引）
 */
export function buildWordForms(words, index, stemIndex) {
  const list = Array.isArray(words) ? words : []

  const hit = MODEL_CACHE.get(list)
  if (hit && hit.index === index && hit.stemIndex === stemIndex) return hit.model

  const byId = new Map()
  for (const w of list) {
    if (w && typeof w.id === 'string') byId.set(w.id, w)
  }

  // ---------------------------------------------------------------- 变形族
  // repId -> 词形数组（含代表形），族内按词频升序。
  const families = new Map()
  for (const w of list) {
    if (!w || typeof w.id !== 'string') continue
    if (!isFolded(w)) continue
    const rep = resolveRep(w.lemma, byId)
    // 自环 / 成环 → 视作未折叠（不并入任何族）；目标缺失 → 跳过（宁可不给，也不给悬空引用）
    if (rep === w.id) continue
    if (!byId.has(rep)) continue
    const bucket = families.get(rep)
    if (bucket) bucket.push(w)
    else families.set(rep, [w])
  }
  for (const [rep, members] of families) {
    const repWord = byId.get(rep)
    const all = repWord ? [repWord, ...members] : members.slice()
    all.sort(byRankAsc)
    families.set(rep, all)
  }

  const wordsByMorph = (index && index.wordsByMorph) || new Map()

  /**
   * 「常见变形」：给定词 id，返回其**所在词族**的其它词形（不含自己），
   * 按词频升序（最常用在前），最多 FORMS_MAX 个。
   *
   * id 既可以是代表形（返回其屈折形），也可以是被折叠形（返回代表形 + 兄弟形）——
   * 满足「所有单词有的话都要做」。
   *
   * @param {string} id
   * @returns {Array<object>}
   */
  function formsOf(id) {
    if (typeof id !== 'string') return []
    const w = byId.get(id)
    const rep = w && isFolded(w) ? resolveRep(w.lemma, byId) : id
    const fam = families.get(rep)
    if (!fam || fam.length === 0) return []
    return fam.filter((x) => x && x.id !== id).slice(0, FORMS_MAX)
  }

  /**
   * 「派生词」：给定词条，返回与之**共享词素**的其它词。
   * 排序：共享词素数降序 → 词频升序 → 词形字典序。
   * 无词素（`morphs` 为空）时退回 `familyOf` 按词形反查。
   *
   * @param {object} word 当前词条
   * @param {{ excludeIds?: string[], cap?: number }} [opts]
   * @returns {Array<object>}
   */
  function derivativesOf(word, opts = {}) {
    if (!word || typeof word !== 'object' || typeof word.id !== 'string') return []
    const exclude = new Set(Array.isArray(opts.excludeIds) ? opts.excludeIds : [])
    exclude.add(word.id)
    const cap = Number.isInteger(opts.cap) && opts.cap > 0 ? opts.cap : DERIVATIVES_MAX

    const morphs = Array.isArray(word.morphs) ? word.morphs : []

    if (morphs.length === 0) {
      // 无词素：按词形反查同族（多取一些，剔除后仍够 cap）
      const picked = familyOf(stemIndex, word, cap + exclude.size)
      return picked.filter((x) => x && !exclude.has(x.id)).slice(0, cap)
    }

    // 有词素：共享词素并集，记录共享数
    const scores = new Map() // id -> { word, shared }
    for (const mid of morphs) {
      const bucket = wordsByMorph.get(mid)
      if (!bucket) continue
      for (const cand of bucket) {
        if (!cand || typeof cand.id !== 'string') continue
        if (exclude.has(cand.id)) continue
        const cur = scores.get(cand.id)
        if (cur) cur.shared += 1
        else scores.set(cand.id, { word: cand, shared: 1 })
      }
    }
    const ranked = [...scores.values()]
    ranked.sort((a, b) => b.shared - a.shared || byRankAsc(a.word, b.word))
    return ranked.slice(0, cap).map((x) => x.word)
  }

  /**
   * 「一次取回」便捷封装：常见变形 + 派生词，且派生词已自动排除自身与全部变形
   * （避免同一批词在「变形」和「派生词」两块里重复出现）。
   *
   * @param {object} word 当前词条
   * @returns {{ forms: Array<object>, derivatives: Array<object> }}
   */
  function relatedFor(word) {
    if (!word || typeof word !== 'object' || typeof word.id !== 'string') {
      return { forms: [], derivatives: [] }
    }
    const forms = formsOf(word.id)
    const excludeIds = [word.id, ...forms.map((f) => f.id)]
    const derivatives = derivativesOf(word, { excludeIds })
    return { forms, derivatives }
  }

  const model = { formsOf, derivativesOf, relatedFor }
  MODEL_CACHE.set(list, { index, stemIndex, model })
  return model
}

/** 供 UI 复用的释义截断工具（chip 简注）。 */
export { firstGloss }

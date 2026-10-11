/**
 * 「同族词」反查 —— **按真实词素（词根 id）分组，不按词形**
 * ------------------------------------------------------------------
 * 它回答什么
 *   给一个词，找出与之**共享同一个词根（root morph）**的其它词。
 *   共享词根 = 同源，这是数据层已经写明的事实（`word.morphs` / `word.chain[].morph`
 *   指向 `src/data/morphemes.js` 里注册的词素），不是本模块猜出来的。
 *
 * ★ 为什么不再按词形 ★
 *   旧实现按「前 5 个字符 + 最长公共前缀 ≥ max(5, len×0.7)」分桶，
 *   看起来省事，实则**制造了假的词源关系**：
 *     suspect  → 数据明确写着 chain=["p.sub","r.spect"]（词根 r.spect）
 *     suspend  → 数据明确写着 chain=["p.sub","r.pend"] （词根 r.pend）
 *   两者只因共享拼写 `suspe` 就被归成一族 —— 用户点进去看到的是「和 suspend 同源」，
 *   而事实是「和 suspend 只是长得像」。**一个错误的同族词比没有同族词更伤**：
 *   它会让用户对整张词素网的可信度打折。
 *   同类误报还有 `str`（strong/start）、`help`（help/helper）、`port`（import/export）…
 *   —— 拼写相近从来不等于同源，所以整条词形路径已删除，而不是调阈值。
 *
 * ★ 分组规则（唯一一条）★
 *   词根 id 相同 ⇒ 同族。词根 id 从两处取、并集去重（顺序即首次出现顺序）：
 *     · `word.morphs`      —— 词条登记的词素列表
 *     · `word.chain[].morph`—— 拆解链上实际指向的词素
 *   并集而非只取 `morphs`：有 140 个词的 `chain` 里带词根而 `morphs` 里没登记
 *   （如 premise：morphs=["p.pre"] 但 chain 含 r.mit）。只读 `morphs` 会漏掉这批
 *   真同源关系；两处都读则与 `hasDecomposition`（判 `chain`）的语义保持一致。
 *
 * ★ 多根词（`jurisdiction` = r.jur + r.dict）★
 *   规则是**多归属**，不是「选一个主根」：一个词属于它**每一个**词根的族。
 *   · 好处：不需要任何主观 tie-break，`A 与 B 同族` ⟺ `A、B 至少共享一个词根`，
 *     天然对称、天然幂等；组成分并集时按 id 去重，故**同一次结果里不会出现重复词**。
 *   · 代价：多根词的族可能较大（并集），由 `cap` 截断，不做「只取最大那族」的猜测。
 *
 * ★ 无词根的词一律返回 `[]` ★
 *   · `morphs` / `chain` 都空（真·无拆解词，64699 词里 47148 个）→ 没有锚点，返回 `[]`。
 *   · 只有词缀、没有词根（如 `unable` = p.un + s.able、`undo` = p.un）→ **不**拿词缀当锚点：
 *     按前缀分组会把 undo / undertake / return / reflect 拧成一族，按后缀分组更会
 *     把成千上万个 -tion / -ous 拧成一族 —— 那不是词族，是拼写又一次。
 *     宁可不给，也不给一整个假族群。
 *   一句话：**没有词根就没有词族，宁缺毋滥。**
 *
 * 排序：词频升序（最常用在前），再按词形字典序 —— 全序且与输入顺序无关。
 * （旧实现只按词频排，`freqRank` 相同时结果依赖 `words` 数组顺序；现已补上 tie-break。）
 */

/** 词素 id 的**非词根**命名空间：前缀 p.* / 后缀 s.* / 未知占位 x.*。其余（r.*）视为词根。 */
const AFFIX_NAMESPACES = ['p.', 's.', 'x.']

/** UI 最多展示几个同族词 */
export const FAMILY_MAX_CHIPS = 6

/**
 * 该词素 id 是否是**词根**（即能否作为同族的锚点）。
 * 判据是**命名空间**而非「id 在不在 morphemes.js 里」—— 本模块必须保持纯函数、
 * 不 import 任何数据文件（那会把 28MB 词库拖进首屏 chunk）。
 * @param {unknown} mid 词素 id
 * @returns {boolean}
 */
function isRootMorph(mid) {
  if (typeof mid !== 'string' || mid === '') return false
  return !AFFIX_NAMESPACES.some((ns) => mid.startsWith(ns))
}

/**
 * 取一个词的全部**词根 id**（已去重，顺序 = 首次出现顺序）。
 * 来源：`word.morphs` 与 `word.chain[].morph` 的并集（见文件头「分组规则」）。
 *
 * @param {object} word 词条
 * @returns {Array<string>} 词根 id 数组；无词根则为空数组
 */
function rootsOf(word) {
  if (!word || typeof word !== 'object') return []
  const out = []
  const seen = new Set()
  const take = (mid) => {
    if (!isRootMorph(mid) || seen.has(mid)) return
    seen.add(mid)
    out.push(mid)
  }
  if (Array.isArray(word.morphs)) for (const mid of word.morphs) take(mid)
  if (Array.isArray(word.chain)) for (const step of word.chain) take(step && step.morph)
  return out
}

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
 * 族内稳定排序：词频升序 → 词形字典序（保证同词频时结果唯一）。
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
 * 建同族词索引：按**词根 id**分桶（不再是按词形前缀）。
 *
 * ★ 只收「有词根」的词 ★
 *   两道门：① 至少有一个词根（否则没有锚点，按约定返回空）；
 *          ② `chain` 非空（点进去必须能看到真实拆解，否则这个同族词毫无价值）。
 *   门②在当前词库上恰好不裁掉任何词（64699 词里「有词根但 chain 为空」= 0 个），
 *   保留它是为了守住「给出的每个 chip 都点得进去」这条不变量，不依赖数据恰好干净。
 *
 * ★ 必须一次建好、不可在渲染期现算 ★
 *   词库 6.4 万条，每次打开详情页都全表扫一遍会明显卡顿；
 *   这里由调用方包在 useMemo 里，建索引 ≈ 一次 O(n) 遍历（实测最大桶 402 条）。
 *
 * @param {Array<object>} words 全量词条
 * @returns {{byStem: Map<string, Array<object>>, indexed: number}} 词根索引
 *   （`byStem` 的键是词素 id，值是共享该词根的词条数组；`indexed` = 成功入桶的词数）
 */
export function buildStemIndex(words) {
  const byStem = new Map()
  let indexed = 0
  if (!Array.isArray(words)) return { byStem, indexed }
  for (const w of words) {
    if (!w || typeof w !== 'object' || typeof w.id !== 'string') continue
    // 门②：点进去得有拆解可看，否则这个同族词是废的
    if (!Array.isArray(w.chain) || w.chain.length === 0) continue
    const roots = rootsOf(w)
    if (roots.length === 0) continue // 门①：没词根就没有族（不拿词缀凑，见文件头）
    indexed += 1
    for (const r of roots) {
      const bucket = byStem.get(r)
      if (bucket) bucket.push(w)
      else byStem.set(r, [w])
    }
  }
  return { byStem, indexed }
}

/**
 * 查一个词的同族词（按词根查表 + 桶内线性比对，不做全表扫描）。
 *
 * 多根词取**各词根族的并集**并按 id 去重；无词根（含 morphless）一律返回 `[]`。
 *
 * @param {{byStem: Map<string, Array<object>>}} stemIndex buildStemIndex 的产物
 * @param {object} word 当前词条
 * @param {number} [cap] 最多返回几个，默认 FAMILY_MAX_CHIPS
 * @returns {Array<object>} 同族词数组（词频升序 → 词形字典序；不含自身；无重复 id）
 */
export function familyOf(stemIndex, word, cap = FAMILY_MAX_CHIPS) {
  if (!word || typeof word !== 'object' || typeof word.id !== 'string') return []
  const byStem = stemIndex && stemIndex.byStem
  if (!byStem) return []

  const roots = rootsOf(word)
  if (roots.length === 0) return [] // 无词根 → 无族，不猜（文件头「无词根一律返回 []」）

  // 并集去重：多根词会命中多个桶，同一个候选可能重复出现
  const picked = []
  const seenIds = new Set()
  for (const r of roots) {
    const bucket = byStem.get(r)
    if (!bucket || bucket.length === 0) continue
    for (const cand of bucket) {
      if (!cand || typeof cand.id !== 'string') continue
      if (cand.id === word.id) continue // 不含自身
      if (seenIds.has(cand.id)) continue
      seenIds.add(cand.id)
      picked.push(cand)
    }
  }
  // 同族词里最常用的最有参考价值 —— 词频升序，同频按词形字典序（结果唯一）
  picked.sort(byRankAsc)
  return picked.slice(0, cap)
}
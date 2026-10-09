/**
 * 无拆解词的「同族词」反查（按词形，不按词素）
 * ------------------------------------------------------------------
 * 为什么需要它
 *   morphless 词没有锚点：chain 为空、morphs 为空，
 *   `learning.js` 的 `defaultFamilyKeyOf` 对它返回 null，
 *   于是它进不了任何词族、也点不出词素故事 —— 用户点开只剩一块空面板。
 *   但它**在词形上仍然有同族**（determined / determination / determinate…），
 *   那些同族词大多是有拆解的，点进去能看到真实的构词拆解。
 *   所以这里用「词形」而不是「词素」做一次反查，把用户从空面板带到有内容的页面。
 *
 * 为什么宁缺毋滥
 *   纯词形相近极易误报：`strong` 与 `stroking` 共享前 3 字符 `str`，
 *   `help` 与 `helper` 共享 `help` —— 但它们其实不同源。
 *   一个错误的同族词会让用户「点进去发现还是没拆解」，比不给更伤。
 *   所以守卫卡得比较严：词干必须 ≥ 5 字符，且至少占全词的 70%。
 *
 * 判据与实测（64699 词全量）
 *   determined → determination / determinant / determinist / determinative / determinate
 *   water      → waterproof
 *   strong / start / help → 不给（宁可不给也不误报）
 */

/** 词干字符数下限：低于 5 字符的前缀极易撞车（star↔start、help↔helper） */
export const FAMILY_MIN_STEM = 5
/** 词干占全词长度的最低比例 */
export const FAMILY_STEM_RATIO = 0.7
/** UI 最多展示几个同族词 */
export const FAMILY_MAX_CHIPS = 6

/** 分桶键长度：与 FAMILY_MIN_STEM 一致 —— need 恒 ≥ 5，故凡 LCP≥5 必同桶 */
const BUCKET_LEN = FAMILY_MIN_STEM

/**
 * 两词最长公共前缀长度。
 *
 * @param {string} a 词形 A
 * @param {string} b 词形 B
 * @returns {number} 公共前缀字符数
 */
function lcpLength(a, b) {
  const n = Math.min(a.length, b.length)
  let i = 0
  while (i < n && a[i] === b[i]) i += 1
  return i
}

/**
 * 该词形配对所需的最小公共词干长度。
 * 守卫：词干至少 FAMILY_MIN_STEM 字符，且至少占全词 FAMILY_STEM_RATIO。
 *
 * @param {string} form 词形
 * @returns {number} 最小公共词干长度
 */
function neededStem(form) {
  return Math.max(FAMILY_MIN_STEM, Math.ceil(form.length * FAMILY_STEM_RATIO))
}

/**
 * 建同族词索引：**只收「已有拆解」的词**，按前 BUCKET_LEN 字符分桶。
 *
 * ★ 必须一次建好、不可在渲染期现算 ★
 *   词库 6.4 万条，每次打开详情页都全表扫一遍会明显卡顿；
 *   这里由调用方包在 useMemo 里，建索引 ≈ 一次 O(n) 遍历（实测最大桶 133 条）。
 *
 * 分桶键为什么取 BUCKET_LEN：neededStem 恒 ≥ FAMILY_MIN_STEM = BUCKET_LEN，
 * 所以「能配成同族」的两个词必然落在同一个桶里 —— 单键分桶即完备，无需多键登记。
 *
 * @param {Array<object>} words 全量词条
 * @returns {{byStem: Map<string, Array<object>>, indexed: number}} 词干索引
 */
export function buildStemIndex(words) {
  const byStem = new Map()
  let indexed = 0
  for (const w of words) {
    if (!w || typeof w.form !== 'string' || !w.form) continue
    // 只收有拆解的词：点进去必须能看到真实拆解，否则这个同族词毫无价值
    if (!Array.isArray(w.chain) || w.chain.length === 0) continue
    const key = w.form.slice(0, BUCKET_LEN)
    let bucket = byStem.get(key)
    if (!bucket) {
      bucket = []
      byStem.set(key, bucket)
    }
    bucket.push(w)
    indexed += 1
  }
  return { byStem, indexed }
}

/**
 * 查一个词的同族词（查表 + 桶内线性比对，不做全表扫描）。
 *
 * @param {{byStem: Map<string, Array<object>>}} stemIndex buildStemIndex 的产物
 * @param {object} word 当前词条
 * @param {number} [cap] 最多返回几个，默认 FAMILY_MAX_CHIPS
 * @returns {Array<object>} 同族词数组（按词频升序，即最常用的在前）
 */
export function familyOf(stemIndex, word, cap = FAMILY_MAX_CHIPS) {
  if (!word || typeof word.form !== 'string' || !word.form) return []
  const byStem = stemIndex && stemIndex.byStem
  if (!byStem) return []

  const form = word.form
  const need = neededStem(form)
  const bucket = byStem.get(form.slice(0, BUCKET_LEN))
  if (!bucket || bucket.length === 0) return []

  const picked = []
  for (const cand of bucket) {
    if (cand.id === word.id) continue
    if (lcpLength(form, cand.form) < need) continue
    picked.push(cand)
  }
  // 同族词里最常用的最有参考价值 —— 按词频升序，freqRank 缺失的排最后
  picked.sort((a, b) => {
    const ra = typeof a.freqRank === 'number' ? a.freqRank : Number.MAX_SAFE_INTEGER
    const rb = typeof b.freqRank === 'number' ? b.freqRank : Number.MAX_SAFE_INTEGER
    return ra - rb
  })
  return picked.slice(0, cap)
}
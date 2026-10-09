/**
 * 私有词 → 学习侧 Word 视图对象（**唯一构造点**）
 * ------------------------------------------------------------------
 * 小站（useStationWords）与全局私有词（useUserWords）都需要把
 * `user_words` 的一行变成「学习侧看得懂的词条对象」。这两处如果各写一份内联
 * 映射，迟早会漂移 —— 一处加了字段另一处没加，就会出现「小站里显示正常、
 * 学习页统计里这个词凭空消失」这类极难查的问题。所以收敛到这里。
 *
 * ★ `id === wordKey` 是硬要求 ★
 *   学习记录以 wordKey 为键（公共 `w.<slug>` / 私有 `u.<formKey>`），
 *   只要 id 等于 wordKey，同一份 records 才能同时服务小站与学习页。
 */

// ★ 判据统一 ★
//   这里以前自己写了一套「morphs 为空 或 morphs[0]==='x.unk'」，与公共词的
//   UI 判据语义不一致 —— 同一个词在两条路径下可能一个显示拆解、一个显示「无词素」。
//   现在统一走 derive.hasDecomposition（判 chain 是否有内容），私有词与公共词同义。
import { hasDecomposition } from './derive.js'

/**
 * 把一行私有词记录转成学习侧视图对象。
 *
 * 字段与 `useStationWords` 原有的内联映射**逐字段一致**，不做任何扩展 ——
 * 扩展会让「两处形状不同」这个本要解决的问题重新出现。
 *
 * @param {object} row   userWordsApi.userWordFromRow() 的结果（camelCase）
 * @param {string|null} [note] 站内笔记（可空）
 * @returns {object} 学习侧 Word 视图对象
 */
export function toUserWordView(row, note = null) {
  const morphs = Array.isArray(row?.morphs) ? row.morphs : []
  const chain = Array.isArray(row?.chain) ? row.chain : []
  return {
    // id 必须等于 wordKey —— 学习记录就是按这个键存的
    id: row.wordKey,
    wordKey: row.wordKey,
    form: row.form,
    pos: row.pos,
    gloss: row.gloss,
    morphs,
    chain,
    cefr: row.cefr,
    freqRank: row.freqRank,
    phoneticBr: row.phoneticBr,
    phoneticStatus: row.phoneticStatus || 'pending',
    example: row.example,
    usage: row.usage,
    // 供 WordDetail / 列表分组复用：判据与公共词完全一致（判 chain，不判 morphless 标记）
    morphless: !hasDecomposition({ chain }),
    kind: 'user',
    source: 'user',
    note: note ?? null,
    // UserWordEditor 需要
    userWordId: row.id,
    editedByUser: row.editedByUser,
    generationStatus: row.generationStatus,
  }
}

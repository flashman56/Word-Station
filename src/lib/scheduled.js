/**
 * 「已排期」计数 —— 待复习里**尚未到期**的那部分
 * ------------------------------------------------------------------
 * 纯函数，与 learning.js 同口径（复用它的 isReviewDue），但**刻意不放在
 * learning.js 里**：那个文件自初始提交起零改动是本项目的硬红线，而本函数
 * 纯属展示层派生，不是状态机语义。
 *
 * ★★ 口径：为什么它必须遍历 `words` 而不是遍历 `records` ★★
 *   `countByStatus(words, records)` 是**按当前词表**逐词取状态再分桶的，
 *   所以词表里已经没有的词（被移出小站的私有词、被 excludeProper 过滤掉的
 *   专有名词、脏数据里指向已下架词的记录）在任何统计里都**不出现**。
 *   若这里改成遍历 records.key()，就会出现
 *   「已排期 3，待复习 0」这种自相矛盾的显示 —— 已排期必须是待复习的子集。
 *   实测正是这个子集关系约束了实现。
 *
 * ★★ 口径：`status === 'review'` 且 `!isReviewDue` ★★
 *   - `status === 'known'` 但 nextDueAt 在未来的记录**不算**：
 *     它已掌握、永不进复习队列，算进「已排期」会让用户去找一批根本不会出题的词。
 *   - `isReviewDue` 把「无 nextDueAt」与「nextDueAt 非法」都判为已到期
 *     （learning.js 的既有约定，兼容全部旧记录），因此无需在此重复处理。
 */
import { isReviewDue } from './learning.js'

/**
 * 数出「已排期」——有复习记录、但今天还没到期的词数。
 *
 * @param {Array} words   当前词表（与 countByStatus 传同一个数组，保证口径一致）
 * @param {object} records v2 学习记录
 * @param {string} [now]  ISO 时间；缺省读系统时钟（与 useLearn 的 reviewQueue 同法）
 * @returns {number} 已排期词数（按 word.id 去重）
 */
export function countScheduled(words, records, now = null) {
  const at = now || new Date().toISOString()
  const seen = new Set()
  let n = 0
  ;(words || []).forEach((w) => {
    if (!w || seen.has(w.id)) return
    seen.add(w.id)
    // 刻意不用 getRecord：它会为每个词（含 6 万个无记录的词）分配一个补全对象，
    // 在 6 万词词表上白烧一遍 CPU。这里只读需要的两个字段。
    const r = records && typeof records === 'object' ? records[w.id] : null
    if (!r || typeof r !== 'object' || r.status !== 'review') return
    if (!isReviewDue(r, at)) n += 1
  })
  return n
}

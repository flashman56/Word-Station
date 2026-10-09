/**
 * 迁移报告的**用户可见说法** —— 单一数据源
 * ------------------------------------------------------------------
 * Sidebar 与 LearnHome 都展示这条迁移提示。两处各写一份文案是本文件存在的
 * 全部理由：文案重复过一次，就出现过一次「两处措辞不一致」的漂移。
 *
 * ★ 为什么要区分两种语义 ★
 *   迁移报告里的 known **不一定**来自「旧版数据」。`migrateV1toV2` 有两条独立的
 *   来源（migrate.js）：
 *     1. `migratedManual`  —— v1 手工标注键里真有对应记录（这才是「从旧版保留」）；
 *     2. `inheritedByFreq` —— 没有任何历史记录，只因词频 ≤ AUTO_KNOWN_RANK 被
 *                             自动继承为已掌握（`inheritFreqKnown` 开关，默认开）。
 *   新访客身上**只有来源 2**。对他们说「已从旧版保留」会让人以为自己连错了账号
 *   或丢了进度 —— 实测中这正是用户锐评的原文。所以两种来源必须说不同的话。
 *
 * 本文件是**纯函数**：不碰存储、不读时钟、不 import 词库（那会把 28MB 拖进首屏）。
 */
import { STATUS_LABEL } from './learning.js'

/**
 * 报告里可能缺失/为 NaN 的计数一律归零 —— 迁移标记是**持久化**的载荷，
 * 老版本写下的 report 可能没有后来新增的字段，展示层不能因此渲染出 NaN。
 * @param {unknown} v
 * @returns {number}
 */
function n(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0
}

/**
 * 把迁移报告翻成一句（最多两句）实话。
 *
 * @param {object|null} report migrateV1toV2 的 report 字段（可为 null）
 * @returns {{ tone: 'legacy'|'mixed'|'freq', text: string }|null}
 *   - `tone: 'legacy'` 真检测到 v1 手工标注 → 可以说「从旧版保留」
 *   - `tone: 'mixed'`   旧版数据 + 另有高频自动继承 → 两句都说清
 *   - `tone: 'freq'`    **无任何历史数据**，纯按词频继承 → 绝不说「旧版」
 *   返回 `null` 表示「没有任何值得展示的内容」，调用方应整块不渲染
 *   （这是 `inheritFreqKnown` 关闭且无旧版数据的情况：此时报三个 0 + 全量未知，
 *   渲染出来既无信息量又同样误导）。
 */
export function describeMigrationReport(report) {
  if (!report || typeof report !== 'object') return null

  const known = n(report.known)
  const review = n(report.review)
  const unknown = n(report.unknown)
  const manual = n(report.migratedManual)
  const byFreq = n(report.inheritedByFreq)

  // 没有任何历史数据 —— 唯一的信息就是「按词频自动继承了多少」，如实这么说。
  // ★ 刻意不写「首次使用」：migratedManual === 0 只说明「无可迁移的 v1 记录」，
  //   老用户若旧键里的词全被移出词库（计入 dropped）也会落到这一支，
  //   断言他「首次使用」等于凭空编造一段他没做过的历史。
  // ★★ 这里只列 review / unknown，不再重复列 known ★★
  //   migratedManual === 0 ⇒ 已知词**全部**来自词频继承，known 恒等于 byFreq。
  //   两个数字都写出来就成了「自动标记了 3 个已掌握；另有 3 个已掌握」，读着像 bug。
  if (manual === 0) {
    if (byFreq === 0) return null
    return {
      tone: 'freq',
      text:
        `按词频自动标记了 ${byFreq} 个高频词为${STATUS_LABEL.known}` +
        `（可在「已知词处理」里关闭）；另有 ${review} 个${STATUS_LABEL.review}、${unknown} 个${STATUS_LABEL.unknown}。`,
    }
  }

  // 真有 v1 手工标注 → 「从旧版保留」成立。若同时有高频继承，必须补一句，
  // 否则 known 这个数里混着一部分「不是从旧版来的」，用户对不上账。
  const tally = `${known} 个${STATUS_LABEL.known}、${review} 个${STATUS_LABEL.review}、${unknown} 个${STATUS_LABEL.unknown}`
  if (byFreq > 0) {
    return {
      tone: 'mixed',
      text: `已从旧版保留 ${tally}（其中 ${byFreq} 个高频词是按词频自动标记的）。`,
    }
  }

  return { tone: 'legacy', text: `已从旧版保留 ${tally}。` }
}

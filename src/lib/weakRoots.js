/**
 * 「我的薄弱词根」—— 纯派生层（无 React / DOM / 存储依赖）
 * ------------------------------------------------------------------
 * 本项目已有三块互不相通的数据：
 *   ① 词族分组（每个词能归到某个词根族，见 learning.js 的 defaultFamilyKeyOf）
 *   ② 学习记录（每词 unknown / review / known，见 learning.js 的 emptyRecord）
 *   ③ 词素表（982 个词根 / 前缀 / 后缀，含 gloss 释义）
 * 本文件把它们串起来：把「你答错过、且至今没掌握的词」按词族聚合，
 * 得出「你在 r.act 这个词根下卡住了 N 个词」，并按薄弱程度排序。
 *
 * ★ 纯派生 ★
 *   不新增任何数据、不请求后端、不写盘：入参是既有的折叠学习单元 + 折叠记录 + 词素表，
 *   出参是一个数组。learning.js / vocab.js / learnSync.js 等冻结文件零改动（只读地
 *   import 了 learning.js 的 getRecord，用于与统计口径共用同一套记录补全规则）。
 *
 * ★ 口径为什么这样定 ★
 *   见本文件 isStuckRecord 与 buildWeakRoots 上的注释——「卡住」必须是**真的答错过**，
 *   不能把手工标记的、迁移继承的、以及从没碰过的词算成薄弱。
 */

/** 说明：本文件只做纯函数派生，不直接读 learning.js 的记录结构——
 *  记录由调用方（useLearn）传入，避免这里与统计口径出现第二份补全规则。 */

/**
 * 「答错过」：唯一判据是 incorrectCount > 0。
 *
 * ★ 为什么不用 status === 'review' 单判 ★
 *   review 有四条来源，其中三条**不代表答错过**：
 *     · applyAnswer(incorrect)      —— learning.js:155，真答错，incorrectCount +1
 *     · retreatToReview()           —— learning.js:191，已掌握→退回复习（手工），不计错
 *     · setReview()                 —— learning.js:413，手工加入待复习，不计错
 *     · migrateV1toV2()             —— migrate.js:479，旧版手工 review 继承，不计错
 *   后三条产出的记录 incorrectCount 恒为 0、lastIncorrectAt 恒为 null。
 *   若只看 status，一个从没背过、被迁移继承成 review 的词会被算成「卡住」，
 *   薄弱榜立刻变成噪声。
 *
 * ★ 为什么不用 lastIncorrectAt != null ★
 *   它与 incorrectCount 由同一处写入，语义等价，但它是时间戳、可能为非法字符串；
 *   incorrectCount 是计数、语义更直白，且与复习队列（buildReviewQueue 用它排序）同源。
 */
export function hasBeenWrong(record) {
  return (Number(record && record.incorrectCount) || 0) > 0
}

/**
 * 「接触过」：学过至少一次。
 *
 * 不能只看 status !== 'unknown' —— 答对一次但还没到掌握门槛的词，status 仍是
 * unknown（learning.js:134-138 只在达标时才改成 known），但它确实是学过的。
 * 所以补上 correctCount / incorrectCount 两个累计计数：它们只在真实答题时增长。
 * markKnown() 不增长计数，但它会把 status 置为 known，同样被这里覆盖。
 */
export function hasTouched(record) {
  if (!record) return false
  if (record.status === 'review' || record.status === 'known') return true
  return (Number(record.correctCount) || 0) > 0 || (Number(record.incorrectCount) || 0) > 0
}

/**
 * 「卡住」= 学过但没掌握 **且** 真的答错过。
 *
 * ★ 为什么要求 status === 'review' ★
 *   known 的词即使曾经答错（incorrectCount > 0）也已经是掌握状态，不是当前薄弱点；
 *   unknown 的词还没进入学习循环，答错过一次后 consecutiveCorrect 归零、
 *   status 会被置成 review（learning.js:150），所以「答错过且未掌握」必然落在 review。
 *
 * ★ 为什么不把「只标了待复习、没答过错」算进来 ★
 *   那是用户自己排的计划，不是系统观测到的失败。两者混在一起会让榜单无法解释。
 */
export function isStuckRecord(record) {
  return Boolean(record) && record.status === 'review' && hasBeenWrong(record)
}

/**
 * 按词族聚合出「薄弱词根」榜。
 *
 * @param {object}   options
 * @param {object}   options.records      折叠后的记录视图（useLearn.foldRecords，id → 记录）
 * @param {Map}      options.wordById     id → 词条（useLearn 建好传入，不随记录变化重建）
 * @param {Map}      options.morphById    词素 id → 词素对象（useLearn 已有，取 form / gloss）
 * @param {Function} options.familyKeyOf  (word) => 词族键 | null（useLearn 已有）
 * @param {number}   [options.limit=8]    取前 N 个
 * @returns {Array<{id: string, form: string, display: string, gloss: string,
 *                   stuck: number, touched: number, rate: number}>}
 *   rate = stuck / touched（0~1）。元素已排序，无数据（一个卡住词都没有）时返回 []。
 */
export function buildWeakRoots({ records = null, wordById = null, morphById = null, familyKeyOf = null, limit = 8 } = {}) {
  if (typeof familyKeyOf !== 'function') return []
  if (!records) return []

  /**
   * ★ 为什么遍历「记录」而不是遍历「学习单元」★
   *   第一版是遍历 units（折叠后 54,811 个）逐个查记录——每答一个词，
   *   foldRecords 一变就要重扫 5 万多个词一次 familyKeyOf + getRecord。
   *   实测在 e2e（jsdom + 6.4 万词）里把 React 提交拖慢到超过 1.8 秒，
   *   直接让「已标记 N 个」那个 1800ms 自动消失的 toast 在断言看到之前就没了。
   *
   *   而**只有有记录的词才可能卡住**：一个从没背过的词必然 status==='unknown'、
   *   incorrectCount===0，绝不会贡献 stuck。所以遍历 records（几千条）就够了，
   *   词表索引单独建、且不随记录变化重建（见 useLearn 里的 wordById memo）。
   */
  const byKey = new Map()
  for (const [id, rec] of Object.entries(records)) {
    if (!rec) continue
    if (!isStuckRecord(rec) && !hasTouched(rec)) continue // 既不卡住也没学过 → 与聚合无关
    const w = wordById && typeof wordById.get === 'function' ? wordById.get(id) : null
    if (!w) continue
    const key = familyKeyOf(w)
    if (!key) continue // 无词素词（散词）不参与词族聚合，与 RootPicker 同口径
    let e = byKey.get(key)
    if (!e) {
      e = { id: key, stuck: 0, touched: 0 }
      byKey.set(key, e)
    }
    if (hasTouched(rec)) e.touched += 1
    if (isStuckRecord(rec)) e.stuck += 1
  }

  const out = []
  byKey.forEach((e) => {
    // ★ 只有 unknown、从没学过的族不算薄弱 ★
    //   还没接触过 ≠ 薄弱：一个词都没背过的词根出现在「薄弱榜」上，
    //   会暗示用户「我在这个词根上不行」，而事实是他根本没学过它。
    if (e.stuck <= 0) return
    const m = morphById && typeof morphById.get === 'function' ? morphById.get(e.id) : null
    const form = (m && (m.display || m.form)) || String(e.id).replace(/^r\./, '')
    out.push({
      id: e.id,
      form,
      display: (m && (m.display || m.form)) || form,
      gloss: (m && m.gloss) || '',
      stuck: e.stuck,
      touched: e.touched,
      rate: e.touched > 0 ? e.stuck / e.touched : 0,
    })
  })

  /**
   * 排序：卡住数降序 → 卡住率降序 → 学过数降序 → 展示形字母序。
   *
   * ★ 为什么主键是绝对数而不是占比 ★
   *   「定向刷这个族」的收益正比于能刷到的卡住词数量：卡住 6 个的族值得先刷，
   *   卡住 1 个的族点进去只有一道题。纯看占比会让「学过 1 个、错了 1 个」的
   *   100% 压过「学过 40 个、错了 12 个」的 30%，把榜单变成小样本噪声。
   *
   * ★ 为什么次键是占比 ★
   *   卡住数相同时，占比高的族说明「这个词根一学就错」，比大族里的偶发失误更值得先刷。
   *
   * ★ 末位字母序 ★
   *   与 learning.js 的 byForm 同旨：保证任何排序结果都稳定、可回归。
   */
  out.sort(
    (a, b) =>
      b.stuck - a.stuck ||
      b.rate - a.rate ||
      b.touched - a.touched ||
      String(a.form).localeCompare(String(b.form), 'en'),
  )

  const n = Number.isFinite(limit) && limit > 0 ? limit : 8
  return out.slice(0, n)
}

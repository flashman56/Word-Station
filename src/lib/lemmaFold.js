/**
 * 屈折归并的「读时折叠视图」—— 纯函数层（无 React / DOM / 存储依赖）
 * ------------------------------------------------------------------
 * 背景（Step-1 已产出数据）：罕见屈折形（如 honored / shelves）不再单独学习，
 * 学习单元收敛到**词族**；词库本身**不删任何词**。词条在数据装配阶段被打了
 * 一个 `.lemma` 字段（= 代表词条 id，由 src/data/words-lemma.js 提供），
 * 本模块据此在**读取时**把「被折叠形」的进度并入「代表形」。
 *
 * ★ 三条铁律 ★
 *   1. **只读**：不落盘、不改原对象（返回的 records 是新建的浅拷贝）。
 *   2. **不改学习记录本身**：胜者是「原样取胜者」——胜者自身的 known 不变量
 *      天然成立，绝不拼接字段（拼接会造出 known + consecutiveCorrect=1 这类
 *      违反 learning.js 不变量的记录）。
 *   3. **折叠只作用于队列与统计**：词条仍在词库、仍可浏览（UI 阶段另做）。
 *
 * 与 learning.js 的关系：本文件不重复实现取词 / 分桶规则，只负责「把多词形的
 * 记录合并成代表形的一份」，合并结果再交给 learning.js 的既有纯函数消费。
 *
 * 仅两个导出：`isFolded(w)` 与 `buildFoldView(words, records)`。
 */

/**
 * 补丁在生成阶段已把目标解析到「终态代表形」（见 scripts/gen-lemma-patch.mjs），
 * 运行时的链式解析只是**防御**——万一数据被手工改成多跳，这里兜住不崩。
 */
const MAX_LEMMA_HOPS = 4

/** 状态优先级：known > review > unknown（合并时取胜者）。 */
const STATUS_RANK = { known: 2, review: 1, unknown: 0 }

/**
 * 该词条是否为「被折叠形」（即应由其代表形承载学习单元）。
 *
 * 判据：带有一个指向**其它**词条的 `.lemma`。`.lemma === w.id` 的自环视作
 * 未折叠（数据侧本就不产出自环；这里多一道防线，避免把词条从视图里抹掉）。
 *
 * @param {object} w 词条
 * @returns {boolean}
 */
export function isFolded(w) {
  return Boolean(w) && typeof w.lemma === 'string' && w.lemma !== '' && w.lemma !== w.id
}

/**
 * 防御性链式解析：沿 `.lemma` 指到「仍存在」的词条，最多 MAX_LEMMA_HOPS 跳。
 * 成环时返回起点 id（放弃解析，交由调用方按「未折叠」处理，绝不死循环）。
 * @param {string} id
 * @param {Map<string, object>} byId
 * @returns {string} 终态代表形 id
 */
function resolveRep(id, byId) {
  let cur = id
  const seen = new Set([cur])
  for (let i = 0; i < MAX_LEMMA_HOPS; i += 1) {
    const w = byId.get(cur)
    const next = w ? w.lemma : null
    if (!next || next === cur) break
    if (seen.has(next)) return id // 成环：放弃解析
    seen.add(next)
    cur = next
  }
  return cur
}

/** 记录的可比较时间戳（lastStudiedAt 缺省/非法 → -Infinity）。 */
function studiedAtMs(rec) {
  const t = rec && rec.lastStudiedAt
  const ms = typeof t === 'string' || typeof t === 'number' ? new Date(t).getTime() : NaN
  return Number.isFinite(ms) ? ms : -Infinity
}

/**
 * 两条记录取「更优者」（**原样返回胜者对象**，绝不拼接字段）：
 *   ① known > review > unknown
 *   ② 同级：consecutiveCorrect 大者
 *   ③ 再同级：lastStudiedAt 新者
 *   ④ 完全相等：保留先出现者（稳定）
 * @param {object|null} a
 * @param {object|null} b
 * @returns {object|null}
 */
function pickBest(a, b) {
  if (!a) return b || null
  if (!b) return a
  const ra = STATUS_RANK[a.status] ?? 0
  const rb = STATUS_RANK[b.status] ?? 0
  if (ra !== rb) return ra > rb ? a : b
  const ca = Number.isFinite(a.consecutiveCorrect) ? a.consecutiveCorrect : 0
  const cb = Number.isFinite(b.consecutiveCorrect) ? b.consecutiveCorrect : 0
  if (ca !== cb) return ca > cb ? a : b
  const ta = studiedAtMs(a)
  const tb = studiedAtMs(b)
  if (ta !== tb) return ta > tb ? a : b
  return a
}

/**
 * 构造折叠视图。
 *
 * @param {Array} words   词条数组（**单元集合的候选**；被折叠形会被移除）
 * @param {object} records 学习记录映射（`Record<wordId, LearningRecord>`）
 * @returns {{ units: Array, records: object }}
 *   - `units`：`words` 中**未被折叠**的词条（保持原顺序）——代表形即学习单元。
 *   - `records`：读时合并后的新记录映射。以入参 records 的浅拷贝为底，
 *     把每个被折叠形的记录按「最优」并入其代表形，并移除被折叠形自身的键。
 *     **不在 `words` 里的键（如私有词）原样保留**（否则私有词的进度会在统计里消失）。
 *     家族无任何记录则代表形不出现在视图中（`getRecord` 自然回落空记录）。
 */
export function buildFoldView(words, records) {
  const list = Array.isArray(words) ? words : []
  const recs = records && typeof records === 'object' ? records : {}

  const byId = new Map()
  for (const w of list) {
    if (w && typeof w.id === 'string') byId.set(w.id, w)
  }

  const units = []
  const foldedIds = new Set()
  const childRecordsByRep = new Map() // repId -> record[]

  for (const w of list) {
    if (!w || typeof w.id !== 'string') continue
    if (!isFolded(w)) {
      units.push(w)
      continue
    }
    const rep = resolveRep(w.id, byId)
    // 防御：链式解析回到自身（自环 / 成环）时视作**未折叠**，绝不把词条从视图里抹掉。
    // 生成器已剔除成环与自环（见 scripts/gen-lemma-patch.mjs），此处仅兜底坏数据。
    if (rep === w.id) {
      units.push(w)
      continue
    }
    foldedIds.add(w.id)
    const r = recs[w.id]
    if (r && typeof r === 'object') {
      if (!childRecordsByRep.has(rep)) childRecordsByRep.set(rep, [])
      childRecordsByRep.get(rep).push(r)
    }
  }

  // 浅拷贝：保留全部原键（含不在 words 里的私有词），再就地折叠
  const out = { ...recs }
  for (const id of foldedIds) delete out[id]
  for (const [rep, childRecs] of childRecordsByRep) {
    const own = recs[rep] && typeof recs[rep] === 'object' ? recs[rep] : null
    let best = own
    for (const r of childRecs) best = pickBest(best, r)
    if (best) out[rep] = best
  }

  return { units, records: out }
}

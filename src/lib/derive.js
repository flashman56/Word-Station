/**
 * 派生规则层：所有"算出来的"字段都在这里，数据文件里只存原始数据。
 * 想调整"多少词频以内算已知"，只改 AUTO_KNOWN_RANK 一个常量即可。
 *
 * 状态判定与词频弱化的分工（别搞混）：
 *   - 三态（unknown / review / known）一律由 lib/learning.js 的学习记录决定，走 effectiveStatus(word, records)
 *   - autoKnown() / AUTO_KNOWN_RANK 只回答"这个词是不是高频、要不要在词群视图里弱化展示"，
 *     它不再参与任何状态判定；迁移时它被复用一次作为"继承判定线"（可被 inheritFreqKnown 开关关掉）
 *
 * ⚠️ 本文件不得 import 任何词库数据文件（words-*.js / phonetics.js）：
 *     那会把 28MB 拖进首屏 bundle。词库总数字面量见 STATS_SCOPE。
 */
import { LEARN_STATUS, emptyRecord } from './learning.js'

// ---------------------------------------------------------------- 常量表

export const TYPES = {
  root: { label: '词根', color: '#4f7fd4', soft: '#e8f0fd' },
  prefix: { label: '前缀', color: '#3fa07a', soft: '#e4f5ee' },
  suffix: { label: '后缀', color: '#8a6cc4', soft: '#f0eafc' },
}

export const ORIGINS = {
  latin: { label: '拉丁', color: '#c2703d' },
  greek: { label: '希腊', color: '#3d8ac2' },
  germanic: { label: '日耳曼', color: '#6b8e4e' },
  old_english: { label: '古英语', color: '#8a8f98' },
  french: { label: '法语', color: '#b5678f' },
  other: { label: '其他', color: '#9aa1ac' },
}

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CEFR_SCORE = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }

/** 三态配色 / 文案的唯一来源，组件不得硬编码颜色（键与 LEARN_STATUS 一致） */
export const STATUS = {
  known: { label: '已掌握', color: '#9aa1ac', soft: '#f1f3f6', icon: '✓' },
  review: { label: '待复习', color: '#c98a17', soft: '#fdf3e0', icon: '~' },
  unknown: { label: '未知', color: '#c9484b', soft: '#fdeaea', icon: '!' },
}

/** 词频分档阈值（freqRank 越小越常见） */
export const FREQ_BANDS = [
  { key: 'base', max: 1000, label: '基础' },
  { key: 'high', max: 2500, label: '高频' },
  { key: 'mid', max: 6000, label: '中频' },
  { key: 'lowmid', max: 12000, label: '次低频' },
  { key: 'low', max: Infinity, label: '低频' },
]

/** 词频序号 <= 这个值时，在词群视图里弱化展示（只是展示，不是状态） */
export const AUTO_KNOWN_RANK = 2500

/**
 * 词库分母常量（**仅作空态兜底**）。
 *
 * ★ 语义已随屈折归并（Step-2）收敛 ★
 *   学习页进度条的分母实际取 `stats.total`（= 折叠后的**学习单元数**，动态：
 *   词库总量 − 被折叠形数），而**不是**这个常量。理由：被折叠的屈折形不再是
 *   独立学习单元，若分母仍用词库总量，进度条永远到不了头。
 *   因此「三态之和恒等于它」这句话**只对空态成立**（无数据时 stats.total 为 0，
 *   组件回落 STATS_SCOPE 显示 0%）——勿据此常量做任何一致性断言。
 *
 * 为什么仍保留常量而不是删掉：算「词库总量」要 import 全量词库（28MB）会拖进首屏
 * bundle；空态又需要一个非 0 分母避免除零。词库扩容时改这一个数字即可
 * （scripts/split-data.mjs 的输出里有准确词数）。需要精确值时可用可注入版本：setStatsScope(n)。
 *
 * 变更记录：
 *   64825 → 64723：清理了 102 条「自认错词」的垃圾词条
 *     （evemhing / iong / ieast / ge / ieft / lnspector / ofhere / ionger /
 *     commited 等，释义里写着「拼写有误」「疑为 X」）。
 *   64723 → 64699：清理 24 条高置信垃圾词条（保守策略，绝不误删 ECDICT 已收录词）：
 *     3 条 AI 杜撰占位/乱凑词（words-extra.js：extraviv / chronologyof / misterr）；
 *     21 条清晰错拼且正确词已在库内的词条（words-mono-seed.js：carefull / wory /
 *     arert / iive / faii / iooked / beeplng / lnternet / riend / beastiality /
 *     voyuer / masterbating / masterbation / lmagine / iife / rember / couid /
 *     lnternational / embarassing / colord / ioved）。同时从 synants-mono-seed.js
 *     移除 10 对引用了已删错拼词的近/反义对。
 * 精确值校验：scripts/test-learning.mjs 断言 STATS_SCOPE === 全库唯一 id 数。
 */
export const STATS_SCOPE = 64699

/**
 * 词汇量预测纳入私有词的上限（B-8 护栏）。
 *
 * 为什么需要：estimateVocabulary 按 freqRank 分档，而私有词的 freqRank 多为
 * `null`，会被 bandIndexOf 归到**最后一档**（60000~∞），既进 libraryN 又进
 * studiedN。5 个私有词是噪声（末档约 2 万词，且尾档通常被 cutoff=0.25 截断不计）；
 * 但私有词上千时会实打实抬高尾档 knownP → 吹大估值。
 *
 * 这是**护栏**，不是口径变更：`statusSource !== 'migration'` 判别式、
 * minSample / minBands / cutoff / PAVA 全部不动（vocab.js 零改动）。
 *
 * ★ 阈值不暴露给用户 ★：UI 只说「私有词较多，词汇量估算暂不含私有词」，
 *   不说「因为超过 500 个」—— 那是实现细节，用户改不了、也不需要知道。
 */
export const MAX_VOCAB_PRIVATE_WORDS = 500

let injectedScope = null

/**
 * 注入精确的词库分母（App 拿到词库后调用一次即可，不注入则用上面的常量）。
 * @param {number} n
 */
export function setStatsScope(n) {
  const v = Number(n)
  injectedScope = Number.isFinite(v) && v > 0 ? v : null
}

/** 取当前生效的词库分母 */
export function statsScope() {
  return injectedScope || STATS_SCOPE
}

// ---------------------------------------------------------------- 单条记录的派生

export function freqBand(rank) {
  const hit = FREQ_BANDS.find((b) => rank <= b.max)
  return { key: hit.key, label: hit.label }
}

export function cefrScore(cefr) {
  return CEFR_SCORE[cefr] ?? 0
}

/** 是否已自动判定为已知（基础高频词） */
export function autoKnown(word) {
  return word.freqRank <= AUTO_KNOWN_RANK
}

/**
 * 有效状态：优先读学习记录 records[word.id].status；
 * 没有记录时回落到 autoKnown() 的弱化展示判定（高频 → known，其余 → unknown）。
 *
 * records 既接受 v2 的学习记录对象 `{ [id]: LearningRecord }`，
 * 也兼容过渡期仍在传的 v1 字符串标注 `{ [id]: 'known'|'review'|'new' }`。
 */
export function effectiveStatus(word, records = {}) {
  const raw = word && records ? records[word.id] : null
  let status = null
  if (typeof raw === 'string') {
    status = LEARN_STATUS.includes(raw) || raw === 'new' ? (raw === 'new' ? 'unknown' : raw) : null
  } else if (raw && typeof raw === 'object') {
    status = LEARN_STATUS.includes(raw.status) ? raw.status : null
  }
  if (status) return status
  return autoKnown(word) ? 'known' : 'unknown'
}

/** 该词是否有学习记录 / 手工标注（用于"自动判定"提示与弱化展示判断） */
export function isManual(word, records = {}) {
  return Boolean(word && records && records[word.id])
}

/** 取一条学习记录（缺失时给默认结构），供视图读计数与进度 */
export function recordOf(word, records = {}) {
  const raw = word && records ? records[word.id] : null
  return raw && typeof raw === 'object' ? { ...emptyRecord(), ...raw } : emptyRecord()
}

// ---------------------------------------------------------------- 索引构建

/**
 * 「这个词有没有构词拆解」——**全站唯一判据**。
 * ------------------------------------------------------------------
 * ★ 为什么不能用 `word.morphless` ★
 *   `morphless: true` 是**数据层的「我承认没拆解」声明**，不是 UI 的显示开关。
 *   remorph 补丁（scripts/resegment-morphs.mjs）给 morphless 词补上了 morphs/chain，
 *   但为了不破坏 validate-data.mjs 的硬约束（morphs 为空必须显式标记 morphless:true）
 *   必须**保留** morphless:true —— 于是数据说「有拆解」、标记说「无拆解」，
 *   而 UI 判的是标记，结果 2244 条补丁一条都没生效（点开全是空面板）。
 *   判据改成「chain 是否有内容」后，数据与 UI 才自洽。
 *
 * 全量实测（64699 词）：`chain.length > 0` ⟺ `morphs` 非空且非 x.unk 占位，
 * 两种写法零分歧，所以这里取语义更直接的 chain。
 *
 * @param {object} word 词条（公共词或私有词视图对象）
 * @returns {boolean} 有可展示的构词拆解
 */
export function hasDecomposition(word) {
  return Boolean(word && Array.isArray(word.chain) && word.chain.length > 0)
}

/**
 * 「无词素」词条的类型标签 —— **只读展示**，供 UI 在无拆解时补一行说明。
 * ------------------------------------------------------------------
 * ★ 与 hasDecomposition **同源** ★
 *   二者共同构成「无词素」语义的两半：hasDecomposition 回答「有没有拆解」，
 *   本函数回答「既然没有，它属于哪类词」。任何需要「无词素 · X」文案的 UI
 *   面（WordDetail、StudyCard …）都必须调用本函数，不得各自内联三元 ——
 *   两个 UI 面各写一份映射迟早漂移（一处改了词另一处没改），用户就会在
 *   学习卡和词云里看到同一个词被叫成两种类型。收敛到一处正是为此。
 *
 * ★ 映射口径（与 WordDetail 原内联三元逐字符串一致，纯提取、零行为变更）★
 *   mono   → '单纯词'   （单语素，无词缀可拆）
 *   loan   → '外来词'   （整体借入，内部无构词层级）
 *   proper → '专有名词' （地名/人名等，不作构词切分）
 *   其余   → '固定搭配' （含 phrase / user / 历史 undefined 等一切兜底）
 *
 * @param {object} word 词条（公共词或私有词视图对象）
 * @returns {string} 无词素词的类型标签
 */
export function morphlessKindLabel(word) {
  const kind = word && word.kind
  if (kind === 'mono') return '单纯词'
  if (kind === 'loan') return '外来词'
  if (kind === 'proper') return '专有名词'
  return '固定搭配'
}

/**
 * 建索引：词素 id -> 词素；词素 id -> 其下单词数组；单词 id -> 单词。
 * 一个单词可以挂在多个词素下（网状结构的关键）。
 */
export function buildIndex(morphemes, words) {
  const morphById = new Map()
  morphemes.forEach((m) => morphById.set(m.id, m))

  const wordsByMorph = new Map()
  morphemes.forEach((m) => wordsByMorph.set(m.id, []))
  words.forEach((w) => {
    if (!Array.isArray(w.morphs)) return
    w.morphs.forEach((mid) => {
      const bucket = wordsByMorph.get(mid)
      // 防御：出现未知/悬挂词素 id 时跳过，绝不抛错（合并补丁已按词素表过滤）
      if (!bucket) return
      bucket.push(w)
    })
  })

  const wordById = new Map()
  words.forEach((w) => wordById.set(w.id, w))

  return { morphById, wordsByMorph, wordById }
}

/** 检索：同时匹配词素（词形/变体/中英含义）与单词（词形/释义） */
export function search(query, morphemes, words, morphById) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return { morphs: [], words: [] }

  const hitMorphs = morphemes.filter((m) =>
    [m.form, m.display, m.gloss, m.glossEn, ...(m.variants || [])]
      .filter(Boolean)
      .some((s) => String(s).toLowerCase().includes(q)),
  )
  const hitMorphIds = new Set(hitMorphs.map((m) => m.id))
  const hitWords = words.filter(
    (w) =>
      w.form.toLowerCase().includes(q) ||
      (w.gloss || '').toLowerCase().includes(q) ||
      w.morphs.some((mid) => hitMorphIds.has(mid)),
  )
  return { morphs: hitMorphs, words: hitWords, morphIds: hitMorphIds }
}

// ---------------------------------------------------------------- 过滤

/**
 * 按条件过滤，返回 { visibleMorphs（含 words 字段）, stats }
 * 注意两种计数口径：stats.wordCount 按词群计次（同一单词挂在 2 个词素下数 2 次），
 * stats.uniqueWords 是去重后的单词数 —— 对外展示一律用 uniqueWords，wordCount 只作次要说明。
 * filters: { status: 'all'|'known'|'review'|'unknown', minCefr: 'A1'.., types:Set, origins:Set, hideAutoKnown:boolean }
 */
export function applyFilters(morphemes, words, wordsByMorph, records, filters) {
  const {
    status = 'all',
    minCefr = 'A1',
    types = new Set(['root', 'prefix', 'suffix']),
    origins = new Set(Object.keys(ORIGINS)),
    hideAutoKnown = true,
    query = '',
  } = filters || {}

  const minScore = cefrScore(minCefr)
  // 旧设置里存的 'new' 等价于现在的 'unknown'
  const wanted = status === 'new' ? 'unknown' : status
  const morphIdsFromQuery = query
    ? new Set(search(query, morphemes, words, null).morphs.map((m) => m.id))
    : null

  const wordPasses = (w) => {
    if (!types.size) return false
    if (cefrScore(w.cefr) < minScore) return false
    if (wanted !== 'all' && effectiveStatus(w, records) !== wanted) return false
    if (hideAutoKnown && autoKnown(w) && !isManual(w, records)) return false
    if (morphIdsFromQuery && !w.morphs.some((id) => morphIdsFromQuery.has(id))) return false
    return true
  }

  const visibleMorphs = []
  const stats = { morphCount: 0, wordCount: 0, known: 0, review: 0, unknown: 0, seen: new Set() }

  morphemes.forEach((m) => {
    if (!types.has(m.type)) return
    if (!origins.has(m.origin)) return
    if (morphIdsFromQuery && !morphIdsFromQuery.has(m.id)) return

    const list = (wordsByMorph.get(m.id) || []).filter(wordPasses)
    if (list.length === 0) return

    visibleMorphs.push({ ...m, words: list })
    stats.morphCount += 1
    list.forEach((w) => {
      stats.wordCount += 1
      if (!stats.seen.has(w.id)) {
        stats.seen.add(w.id)
        stats[effectiveStatus(w, records)] += 1
      }
    })
  })

  // seen 是统计过程的临时容器：wordCount 按词群计次，uniqueWords 才是去重后的真实单词数
  stats.uniqueWords = stats.seen.size
  stats.seen = undefined
  return { visibleMorphs, stats }
}

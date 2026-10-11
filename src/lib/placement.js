/**
 * placement.js —— 「你从哪一档开始背」的起点测评（纯函数层，无 React / 无 DOM / 无存储）
 * ------------------------------------------------------------------
 * 解决的问题：新用户的学习队列固定从 freqRank 2501 开始（derive.js 的
 * AUTO_KNOWN_RANK = 2500 之下自动视为已掌握），于是所有人第一天都在背
 * 2501~2600 这一条窄缝 —— 无论真实水平如何。本模块给出一条**有证据的**起点档。
 *
 * ★★★ 为什么这一层必须自己算，不能把作答写进 learn.records ★★★
 *   vocab.js 的证据判别式只有一条：`records[id]` 存在 **且** `statusSource !== 'migration'`。
 *   也就是说，任何一条 `status:'known'` 的记录都会被它当成「**实测**已知」，
 *   而不是「**自报**已知」。测评作答恰恰 100% 是自报。
 *   若把「认识」直接写进 records：每档 knownP = 1.0 → interpolateNulls 把无样本档
 *   也填成 1.0 → 11 档全部计入 → **64,700（本词库全量）**。
 *   实测（scripts/test-placement.mjs 的 P0 组把这个数钉死）：
 *     纯自报 known 铺到 sampleSize=30（vocab.js 自己的 minSample）即 sufficient=true，
 *     estimate=64,700、low=64,600、high=64,700、reference=「更高」。
 *   同时 `statusSource:'manual-known'` 的记录会被 cloud/merge.js 的 filterUploadable
 *   当成真学习证据**上行** —— 等于伪造跨设备学习史。
 *   ⇒ 结论：测评**只读词库、只写自己的键**，一条记录都不碰 learn.records。
 *
 * ★ 三条结构性护栏（都是「按证据截断」，不是「打个折」）★
 *   1. **饱和 ⇒ 不给数**：最难抽到的那一段也全答「认识」时，作答不含任何关于
 *      「知识在哪里终止」的信息（与「点满 40 次没看词」不可区分）⇒ 估计**不可识别**，
 *      于是返回 estimate=null，而不是把 64,700 印出来。
 *   2. **不外推到未抽样的低频区**：只有**最难的抽样档及以下**参与求和；
 *      它之上的档一律记 0，并在界面上明说「这一段没有证据」。
 *   3. **截断到已知率 < 25% 的档**（与 vocab.js 的 cutoff 同值同义）：
 *      用户已经明显答错的那一段按「未掌握」处理，长尾不会把数字吹大。
 *
 * ★ 与 vocab.js 的「预测词汇量」是两件事 ★
 *   VocabCard 那个数来自**实测学习记录**（答对/掌握），本模块的数来自**一次性自评抽样**。
 *   两者口径、证据强度、可信度都不同，所以界面上必须分开表述、不能互相引用。
 *
 * ★ 本文件不 import 任何数据 / React 模块，可在 Node 中直接单测。
 */

import { isFolded } from './lemmaFold.js'

// ---------------------------------------------------------------- 常量与门槛

/**
 * 抽样的总词数 = 40。
 *
 * 取 40 的理由（三条都必要）：
 *   · vocab.js 自己的门槛是 `sampleSize >= 30 && usableBands >= 2`；本测评虽然
 *     **不**走那条管线（见文件头），但仍刻意越过同一条线 —— 低于 30 的证据
 *     连「够不够格给个数」都过不了。
 *   · 5 档 × 8 个：每档 8 个时 knownP 的二项标准误 ≤ sqrt(0.25/8) ≈ 0.177。
 *     每档 5 个是 0.224、每档 3 个是 0.289 —— 后者已大到分不出相邻档。
 *   · 5 档而不是 3 档：起点档是「在第几档答崩了」，档数越少，崩点能被定位到的
 *     范围越粗。5 档让「崩在最前」与「崩在最后」推荐出真正不同的档。
 */
export const PLACEMENT_SAMPLE_SIZE = 40

/** 抽几档（从可选难度档里等距取，含首尾）。5 × 8 = 40，见上。 */
export const PLACEMENT_PROBE_BANDS = 5

/** 能给出数字的最低作答数（与 vocab.js 的 minSample 同值）。 */
export const PLACEMENT_MIN_SAMPLE = 30

/** 能给出数字的最低覆盖档数（与 vocab.js 的 minBands 同值）。 */
export const PLACEMENT_MIN_BANDS = 2

/**
 * 起点档的判据：拟合已知率**低于**此值的档，就是「从这里开始」。
 * 取 0.5 ——「一半以上认得出」才算这一档还站得住。
 */
export const RECOMMEND_FLOOR = 0.5

/**
 * 词汇量估计的截断线：拟合已知率**低于**此值的档及以下，按未掌握计（记 0）。
 * 与 vocab.js 的 cutoff 同值同义（都是防长尾吹大），但两处独立实现 —— vocab.js 冻结。
 */
export const ESTIMATE_CUTOFF = 0.25

/**
 * 饱和线：最难抽到的那一档拟合已知率 ≥ 此值 ⇒ 作答未暴露任何上限 ⇒ 不给数。
 *
 * 8 个样本下 ≥ 0.875 即「8/8 全认识」。为什么不是 1.0：7/8（0.875）在
 * 「最生僻的一段也基本都认识」与「随便点满」之间同样不可区分，也定不了上限。
 */
export const SATURATION_P = 0.875

/** 三种作答。'unsure' 一律按「不认识」计 —— 偏保守，方向上不会高估。 */
export const PLACEMENT_ANSWERS = ['known', 'unknown', 'unsure']

/** 空答案表的模块级哨兵（默认参数写字面量会让引用每次都变，进而打穿 memo）。 */
const NO_ANSWERS = {}

// ---------------------------------------------------------------- 文案辅助

/** 千分位（与 VocabCard 的 fmt 同一口径） */
function fmt(n) {
  return Number(n || 0).toLocaleString('en-US')
}

/** 词频段标签：`0~3000`，末档 `45000+` */
export function bandRangeLabel(band) {
  if (!band) return '—'
  const lo = Number(band.lo)
  const hi = Number(band.hi)
  if (!Number.isFinite(lo)) return '—'
  if (!Number.isFinite(hi)) return `${fmt(lo)}+`
  return `${fmt(lo)}~${fmt(hi)}`
}

/**
 * 起点档的人类可读名：`3000~6000 这一档`。
 */
export function recommendBandLabel(band) {
  return band ? `${bandRangeLabel(band)} 这一档` : '默认档'
}

// ---------------------------------------------------------------- 单调化

/**
 * 无样本档线性插值（与 vocab.js::interpolateNulls 同义，独立实现：vocab.js 冻结）。
 * @param {Array<number|null>} vals
 * @returns {Array<number|null>}
 */
function interpolateNulls(vals) {
  const out = vals.slice()
  const known = []
  for (let i = 0; i < out.length; i += 1) if (out[i] != null) known.push(i)
  if (known.length === 0) return out
  const first = known[0]
  const last = known[known.length - 1]
  for (let i = 0; i < first; i += 1) out[i] = out[first]
  for (let i = last + 1; i < out.length; i += 1) out[i] = out[last]
  for (let k = 0; k < known.length - 1; k += 1) {
    const a = known[k]
    const b = known[k + 1]
    for (let i = a + 1; i < b; i += 1) {
      out[i] = vals[a] + (vals[b] - vals[a]) * ((i - a) / (b - a))
    }
  }
  return out
}

/**
 * Pool Adjacent Violators：把序列调整为**非增**（词频升序 → 已知率应递减）。
 * 与 vocab.js::pavaNonIncreasing 同义，独立实现：vocab.js 冻结，零改动。
 *
 * ★ 为什么这道约束对**自评**比对**实测**更重要 ★
 *   实测作答里「高频不认识、低频认识」是真信号（这个词你背过但想不起来）。
 *   自评里它几乎总是噪声 —— 人对陌生词的默认反应就是「不认识」。
 *   不做单调化，一个在 45000 档随手点的「认识」会把整条已知率曲线抬平，
 *   再由插值铺满全库，正好复现 64,700 那条路径。
 *
 * @param {Array<number>} values
 * @param {Array<number>} weights 每档样本数（0 = 未作答，不参与池化）
 * @returns {Array<number>}
 */
function pavaNonIncreasing(values, weights) {
  const v = []
  const w = []
  const c = []
  for (let i = 0; i < values.length; i += 1) {
    v.push(values[i])
    w.push(weights[i] > 0 ? weights[i] : 0)
    c.push(1)
  }
  let i = 0
  while (i < v.length - 1) {
    if (v[i] < v[i + 1]) {
      const wSum = w[i] + w[i + 1]
      const pooled = wSum > 0 ? (v[i] * w[i] + v[i + 1] * w[i + 1]) / wSum : (v[i] + v[i + 1]) / 2
      v.splice(i, 2, pooled)
      w.splice(i, 2, wSum)
      c.splice(i, 2, c[i] + c[i + 1])
      if (i > 0) i -= 1
    } else {
      i += 1
    }
  }
  const out = []
  for (let k = 0; k < v.length; k += 1) for (let j = 0; j < c[k]; j += 1) out.push(v[k])
  return out
}

// ---------------------------------------------------------------- 档位筛选（单一数据源）

/**
 * 去掉「全部」档 —— 测评题与推荐档都只能落在**用户真的能选**的档上。
 * buildBands() 的首项恒为 { id:'all' }，它不是一个词频区间。
 *
 * ★ 抽样与评分共用这一个函数 ★
 *   早版两处各写一遍过滤，结果 buildPlacementProbe 返回的 bandIndex 与
 *   scorePlacement 内部的数组下标**错位一格**（一边含 'all' 一边不含），
 *   于是作答被记到隔壁档上、knownP 全错 —— 而所有单条断言都还是绿的。
 *   两处共用同一份数组，这类错位从结构上就不可能发生。
 *
 * @param {Array} bands
 * @returns {Array} 原数组按原顺序过滤出的子集（不改动入参）
 */
function selectableBands(bands) {
  return (Array.isArray(bands) ? bands : []).filter(
    (b) => b && b.id !== 'all' && Number.isFinite(Number(b.lo)) && Number.isFinite(Number(b.hi)),
  )
}

// ---------------------------------------------------------------- 抽样

/**
 * 从 `bands`（hooks/useLearn.js::buildBands 的输出）里等距挑 `count` 个可选题频档，
 * **必含首尾**。
 *
 * ★ 为什么档位由调用方传入，而不是本文件自己生成 ★
 *   难度档的定义在 hooks/useLearn.js::buildBands（档宽 3000/10000 的分段规则）。
 *   本模块必须推荐一个**用户真的能选**的档，所以要对着那份列表取；自己重造一份
 *   等于把档宽规则抄一遍，词库一变就会漂。这里传进来即单一数据源。
 *
 * @param {Array} bands
 * @param {number} [count]
 * @returns {number[]} 可选题频档的索引数组（升序、无重复）
 */
export function probeBandIndices(bands, count = PLACEMENT_PROBE_BANDS) {
  const selectable = selectableBands(bands)
  const n = Math.max(1, Math.floor(count))
  if (selectable.length === 0) return []
  if (selectable.length <= n) return selectable.map((_, i) => i)
  const out = []
  for (let i = 0; i < n; i += 1) {
    out.push(Math.round((i * (selectable.length - 1)) / (n - 1)))
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

/**
 * 构造一次测评的题目。
 *
 * ★ 为什么要排除专有名词 ★
 *   词库里约 1.4 万个专有名词（占 21%，见 App.jsx 的 excludeProper 注释）。
 *   多数人并不会「认识」Shakespeare / Kyoto 这类词，把它们混进起点测评会系统性地
 *   把所有人的起点档往前推。所以默认排除，并在界面上**明说**排除了什么。
 *
 * ★ 为什么要排除被折叠形 ★
 *   屈折归并后学习单元收敛到代表形（lib/lemmaFold.js）；给用户出 shelves 而不是
 *   shelf，等于测了一个用户背不到的东西。折叠判据复用 isFolded，与队列同口径。
 *
 * ★ 为什么抽样是确定性的（不用随机数）★
 *   用户中途刷新页面看到的必须是同一份题，否则「重测」变成「换一批题」，
 *   而已给出的进度也无从对应。这里按 freqRank 排序后等距取，天然可复现、可单测。
 *
 * @param {Array} words 词库（公共同行词）
 * @param {Array} bands buildBands 的输出
 * @param {{size?: number, bandCount?: number}} [opts]
 * @returns {{ items: Array, bandIndexes: number[], bands: Array, size: number, perBand: number }}
 */
export function buildPlacementProbe(words, bands, opts = {}) {
  const size = Math.max(1, Math.floor(opts.size || PLACEMENT_SAMPLE_SIZE))
  const bandCount = Math.max(1, Math.floor(opts.bandCount || PLACEMENT_PROBE_BANDS))
  const list = Array.isArray(words) ? words : []

  /* ★ 关键：item.bandIndex 必须是「**可选题频档**数组」的下标，不是 probeBands 的下标 ★
   *
   *   probeBands 是 5 个被选中的档，压缩成下标 0..4。若把那个位置直接写进
   *   item.bandIndex，评分端 `allBands[item.bandIndex]` 取到的就是**隔壁档**：
   *   抽的 0~3000 被记成 3000~6000，依此类推。
   *
   *   这个 bug 极隐蔽：题照出、分数照算、每条单点断言都绿，
   *   只有「推荐档」与「每一档的已知率」整体偏移 —— 而那正是本特性唯一的产出。
   *   （npm run test:placement 的「bandIndex 落在被抽样的档上」一条就是钉它的。）
   */
  const selectable = selectableBands(bands)
  const bandIndexes = probeBandIndices(selectable, bandCount)
  const probeBands = bandIndexes.map((i) => selectable[i]).filter(Boolean)
  // probeBands 可能被 filter 掉空档而比 bandIndexes 短，用同一个位置 j 对齐两表
  const probedIndexes = probeBands.map((_, j) => bandIndexes[j])

  // 每档候选：去重 → 排除专有名词与折叠形 → 有词频 → 稳定排序
  const seen = new Set()
  const byBand = probeBands.map(() => [])
  list.forEach((w) => {
    if (!w || typeof w.id !== 'string' || seen.has(w.id)) return
    const rank = w.freqRank
    if (typeof rank !== 'number' || !Number.isFinite(rank)) return
    if (w.kind === 'proper') return
    if (isFolded(w)) return
    for (let i = 0; i < probeBands.length; i += 1) {
      const b = probeBands[i]
      if (rank > Number(b.lo) && rank <= Number(b.hi)) {
        seen.add(w.id)
        byBand[i].push(w)
        return
      }
    }
  })

  const perBand = Math.max(1, Math.floor(size / Math.max(1, probeBands.length)))
  const items = []
  const picked = new Set()
  byBand.forEach((pool, j) => {
    const bandIndex = probedIndexes[j]
    pool.sort((a, b) => (a.freqRank - b.freqRank) || String(a.form).localeCompare(String(b.form), 'en'))
    if (pool.length === 0) return
    for (let k = 0; k < perBand; k += 1) {
      const idx = Math.round((k * (pool.length - 1)) / Math.max(1, perBand - 1))
      const w = pool[Math.min(idx, pool.length - 1)]
      if (!w || picked.has(w.id)) continue
      picked.add(w.id)
      items.push({ id: w.id, form: w.form, freqRank: w.freqRank, bandIndex })
    }
  })

  return { items, bandIndexes, bands: probeBands, size: items.length, perBand }
}

// ---------------------------------------------------------------- 库内分档计数

/**
 * 可选题频档的库内词数（按 id 去重；排除专有名词与折叠形，与抽样同口径）。
 *
 * ★ 与抽样同口径是硬要求 ★
 *   估计 = Σ libraryN_b × knownP_b。若分子里的 libraryN_b 把专有名词、折叠形
 *   算进去，等于用「抽样时的口径」乘「全库的口径」，两套口径相乘必然虚高。
 *
 * @param {Array} words
 * @param {Array} bands **可选题频档**数组（不是含 'all' 的原始 bands）
 * @returns {number[]} 与 bands 等长
 */
export function countByBand(words, bands) {
  const list = Array.isArray(bands) ? bands : []
  const out = new Array(list.length).fill(0)
  const seen = new Set()
  ;(Array.isArray(words) ? words : []).forEach((w) => {
    if (!w || typeof w.id !== 'string' || seen.has(w.id)) return
    const rank = w.freqRank
    if (typeof rank !== 'number' || !Number.isFinite(rank)) return
    if (w.kind === 'proper') return
    if (isFolded(w)) return
    for (let i = 0; i < list.length; i += 1) {
      const b = list[i]
      if (b && rank > Number(b.lo) && rank <= Number(b.hi)) {
        seen.add(w.id)
        out[i] += 1
        return
      }
    }
  })
  return out
}

// ---------------------------------------------------------------- 评分

/**
 * 给测评打分。
 *
 * @param {object} args
 * @param {Array}  args.items   buildPlacementProbe 的 items（**必须是当时那一份**，
 *                              存进设置的就是它；不要重算，否则换库后题会变）
 * @param {object} [args.answers] { [wordId]: 'known'|'unknown'|'unsure' }
 * @param {Array}  [args.words]  全量词库（只用于分档计数）
 * @param {Array}  [args.bands]  buildBands 的输出（含 'all' 首项）
 * @returns {object} 见下方字段表
 */
export function scorePlacement({ items, answers, words, bands } = {}) {
  const list = Array.isArray(items) ? items : []
  const ans = answers && typeof answers === 'object' ? answers : NO_ANSWERS
  const allBands = selectableBands(bands)

  // 题目涉及的档（升序）。它给出「最难的抽样档」，也就是护栏 2 的上界。
  const probedIdxs = [
    ...new Set(list.map((it) => it && it.bandIndex).filter((i) => Number.isInteger(i) && i >= 0 && i < allBands.length)),
  ].sort((a, b) => a - b)
  const probedSet = new Set(probedIdxs)
  const libraryN = countByBand(words, allBands)

  const answered = new Array(allBands.length).fill(0)
  const known = new Array(allBands.length).fill(0)
  const unknown = new Array(allBands.length).fill(0)
  const unsure = new Array(allBands.length).fill(0)
  list.forEach((it) => {
    if (!it || typeof it.id !== 'string') return
    const a = ans[it.id]
    if (!PLACEMENT_ANSWERS.includes(a)) return
    const bi = it.bandIndex
    if (!Number.isInteger(bi) || bi < 0 || bi >= allBands.length) return
    answered[bi] += 1
    if (a === 'known') known[bi] += 1
    else if (a === 'unsure') unsure[bi] += 1
    else unknown[bi] += 1
  })

  const sampleSize = answered.reduce((a, b) => a + b, 0)
  const bandCount = answered.filter((n) => n > 0).length

  /* 「证据到哪里为止」= **最后一个真的有作答的档**，不是最后一个被抽到的档 ★
   *
   *   两者为什么必须分开：抽样**总是**包含最难的那一档（probeBandIndices 必取首尾），
   *   所以「最难的抽样档」恒等于 lastProbed。于是「不外推到未抽样区」这条护栏
   *   按它算时**永远不会生效** —— 它看起来在守着，其实一直空转：用户若中途放弃、
   *   最难那档一题没答，那一档的 knownP 就只是插值产物，却被当成「测到了」。
   *
   *   按 lastAnswered 算才是真的：没有作答的档一律 knownP=null、covered=false、
   *   不进估计。用户没答的那一段，就是没有证据 —— 「不外推」由此成为真规则。
   */
  let lastAnswered = -1
  for (let i = 0; i < allBands.length; i += 1) {
    if (answered[i] > 0) lastAnswered = i
  }
  const hardest = lastAnswered

  const rawP = answered.map((n, i) => (n > 0 ? known[i] / n : null))
  const filled = interpolateNulls(rawP)
  const fitted = sampleSize > 0 ? pavaNonIncreasing(filled, answered) : filled.map(() => 0)

  // 标准误：被插值出来的档没有自己的样本，借**最近的、真的作答过的档**的 se。
  // vocab.js 在这一步记 0（低估方差、让区间假窄），本模块不跟那份账。
  const rawSe = answered.map((n, i) => {
    const p = fitted[i] == null ? 0 : fitted[i]
    return n > 0 ? Math.sqrt((p * (1 - p)) / n) : 0
  })
  function nearestSe(bandIdx) {
    for (let d = 0; d < allBands.length; d += 1) {
      for (const j of [bandIdx - d, bandIdx + d]) {
        if (j >= 0 && j < allBands.length && answered[j] > 0) return rawSe[j]
      }
    }
    return 0
  }

  const hardestP = hardest >= 0 && fitted[hardest] != null ? fitted[hardest] : 0
  const saturated = hardest >= 0 && hardestP >= SATURATION_P

  // 起点档：第一个「拟合已知率跌破 0.5」的**被抽样**档。
  // 只在被抽样档里找 —— 没抽到的档，其 rate 是插值产物，拿它定起点等于凭空定位。
  let frontier = -1
  for (const bi of probedIdxs) {
    const p = fitted[bi] == null ? 0 : fitted[bi]
    if (p < RECOMMEND_FLOOR) {
      frontier = bi
      break
    }
  }
  /* ★ 没有跌破线时，推荐**最难的抽样档**，而不是 null ★
   *   这是一个真实存在的档位，不是一次「测不出来」：
   *   用户在**最难抽到的那一段**也认得出 ≥ 一半，没有任何一档跌破 0.5。
   *   那种情况下回落 null，等于对「明显会得比默认档多的人」说「没结论」——
   *   而证据其实指向得很清楚：默认档对他太简单。
   *
   *   为什么取最难的抽样档、而不是它**上面**那一档：
   *   上面那档一个词都没抽过，它的 knownP 是插值产物。让插值决定起点，
   *   就等于把「我们没测过」当成「他也会」。取最难的抽样档 = 停在证据的边界上，
   *   文案里如实写「你在最难的一段也认得出 N/M」。
   *
   *   ★ 两条不得跨越的界线 ★
   *     · **饱和**（hardestP ≥ SATURATION_P）：「几乎全答认识」与「点满了没看词」
   *       不可区分 ⇒ 不给推荐档，走 sufficient=false 那一支。
   *     · **证据不足**（thin）：覆盖档数 / 作答数不达标 ⇒ 同样不给推荐档 ——
   *       一个建立在 12 个样本上的起点，比没有起点更糟。
   *   所以 band 只在 sufficient 时才有值；两条「不给」的情形一律 null，
   *   由界面回落到默认档并说明原因。
   */
  const recommended =
    frontier >= 0
      ? { ...allBands[frontier] }
      : hardest >= 0 && hardestP >= RECOMMEND_FLOOR && !saturated
        ? { ...allBands[hardest] }
        : null

  // 词汇量估计：只到「最难的抽样档」为止（护栏 2），并截断到已知率 < 25% 的档（护栏 3）
  let lastIncluded = -1
  for (let bi = 0; bi <= hardest; bi += 1) {
    const p = fitted[bi] == null ? 0 : fitted[bi]
    if (p >= ESTIMATE_CUTOFF) lastIncluded = bi
  }

  let raw = 0
  let variance = 0
  const bandRows = allBands.map((b, bi) => {
    const isProbed = probedSet.has(bi)
    const p = fitted[bi] == null ? 0 : fitted[bi]
    const included = bi <= lastIncluded && libraryN[bi] > 0 && bi <= hardest
    const se = isProbed ? rawSe[bi] : nearestSe(bi)
    if (included) {
      raw += libraryN[bi] * p
      variance += libraryN[bi] * libraryN[bi] * se * se
    }
    return {
      id: b.id,
      lo: Number(b.lo),
      hi: Number(b.hi),
      label: bandRangeLabel(b),
      libraryN: libraryN[bi],
      answered: answered[bi],
      known: known[bi],
      unknown: unknown[bi],
      unsure: unsure[bi],
      knownP: rawP[bi],
      fittedP: p,
      se,
      covered: bi <= hardest,
      probed: isProbed,
      included,
    }
  })

  const thin = sampleSize < PLACEMENT_MIN_SAMPLE || bandCount < PLACEMENT_MIN_BANDS
  const sufficient = !thin && !saturated

  /* band 与 estimate 用**同一道**充分性闸门 ★
     只在 estimate 上生效、却在 band 上放行，会造出一个自相矛盾的界面：
     「数据不足，不给数字，但建议从 12000~15000 开始」—— 用户凭什么信后半句？
     两者的证据门槛是同一个（见 recommended 处的界线说明），所以要么都给，要么都不给。
     不充分时回落到 fallbackBand（界面明说「先从默认档开始」）。 */
  const finalBand = sufficient ? recommended : null

  const round100 = (n, mode) => {
    const v = Number.isFinite(n) ? n : 0
    if (mode === 'floor') return Math.max(0, Math.floor(v / 100) * 100)
    if (mode === 'ceil') return Math.ceil(v / 100) * 100
    return Math.round(v / 100) * 100
  }
  const seTotal = Math.sqrt(variance)

  return {
    sufficient,
    reason: thin ? 'thin' : saturated ? 'saturated' : 'ok',
    sampleSize,
    bandCount,
    itemCount: list.length,
    hardestKnownP: hardestP,
    frontierBandIndex: frontier,
    band: finalBand,
    fallbackBand: allBands.length > 0 ? { ...allBands[0] } : null,
    estimate: sufficient ? round100(raw, 'nearest') : null,
    low: sufficient ? round100(raw - 1.96 * seTotal, 'floor') : null,
    high: sufficient ? round100(raw + 1.96 * seTotal, 'ceil') : null,
    bands: bandRows,
  }
}

// ---------------------------------------------------------------- 文案

/**
 * 统一产出界面文案（组件不得自己拼这些句子 —— 口径要能单测，且只此一处）。
 *
 * @param {object} result scorePlacement 的返回值
 * @returns {{headline:string, detail:string, bandLine:string, evidence:string,
 *            estimateLine:string|null, caveat:string, canApply:boolean}}
 */
export function describePlacement(result) {
  const r = result || {}
  const fallbackLabel = bandRangeLabel(r.fallbackBand)

  if (r.reason === 'thin') {
    const bits = []
    if (r.sampleSize < PLACEMENT_MIN_SAMPLE) {
      bits.push(`只答了 ${r.sampleSize} 个（至少要 ${PLACEMENT_MIN_SAMPLE} 个）`)
    }
    if (r.bandCount < PLACEMENT_MIN_BANDS) {
      bits.push(`只覆盖 ${r.bandCount} 个词频段（至少要 ${PLACEMENT_MIN_BANDS} 个）`)
    }
    return {
      headline: '这次的作答太薄，不给数字',
      detail: `${bits.join('，')}。词频段覆盖不足时，「你在哪一档开始答不动了」这件事根本没被测到，算出来的数只会误导你。`,
      bandLine: `先从默认档（${fallbackLabel}）开始就行 —— 觉得太简单随时可以往上换档。`,
      evidence: `作答 ${r.sampleSize} 个 · 覆盖 ${r.bandCount} 个词频段`,
      estimateLine: null,
      caveat: '这次没有词汇量估计。',
      canApply: false,
    }
  }

  if (r.reason === 'saturated') {
    return {
      headline: '测不出边界，这次不给词汇量数字',
      detail: `你把抽样词几乎全标成了「认识」，包括最生僻的那一段（已知率 ${Math.round(
        (r.hardestKnownP || 0) * 100,
      )}%）。这样的答法既可能说明你真会，也可能只是点满了没看词 —— 两者区分不出来，所以不给数。`,
      bandLine: `先从默认档（${fallbackLabel}）开始；学二三十个觉得太简单，再往上一档换。`,
      evidence: `作答 ${r.sampleSize} 个 · 覆盖 ${r.bandCount} 个词频段`,
      estimateLine: null,
      caveat: '这次没有词汇量估计。',
      canApply: false,
    }
  }

  const probed = (r.bands || []).filter((b) => b.probed && b.answered > 0)
  const first = probed[0]
  const last = probed[probed.length - 1]
  const frontierRow = (r.bands || []).find((b) => r.band && b.id === r.band.id)

  /* 两种「为什么是这一档」要分开写 ★
   * ① 最简单的那档就已经跌破 0.5 ⇒ 用户在**任何**一段都还站不住
   *    「从还认得出大半到已经认不出大半之间的那一档」这句话在 0/8 → 0/8 时是空的
   *    （第一版就这么写，于是「全不认识」的用户读到一句毫无信息的话）。
   * ② 中间某处跌破 ⇒ 两端对比才有意义，原来的说法成立。
   */
  const noneKnown = first && last && first.known === 0 && last.known === 0
  const why = noneKnown
    ? `从最常见的 ${first.label} 段到最生僻的 ${last.label} 段，你一个都没认出来 —— 先从第一档开始打基础。`
    : first && last
      ? `你在 ${first.label} 段认出 ${first.known}/${first.answered} 个，在 ${last.label} 段认出 ${
          last.known
        }/${last.answered} 个 —— 从「还认得出大半」到「已经认不出大半」之间的那一档，就是该开始背的地方。`
      : '按各词频段的认出比例，找到了你还是答得动的那一段。'

  const delta = Math.round(Math.max(0, (r.high || 0) - (r.low || 0)) / 2)
  const estimateLine = `按这次作答推算，你大约认识 ${fmt(r.estimate)} 词（区间 ${fmt(r.low)}~${fmt(r.high)}）。`
  const uncovered = (r.bands || []).filter((b) => !b.covered)
  const evidence =
    `作答 ${r.sampleSize} 个 · 抽样覆盖 ${probed.length} 个词频段` +
    (uncovered.length > 0 ? ` · ${bandRangeLabel(uncovered[0])} 以上没有证据，未计入` : '')

  return {
    // 用 recommendBandLabel 自带「这一档」三字，句尾不再补空格
    headline: `建议从${recommendBandLabel(r.band)}开始`,
    detail: why,
    bandLine: frontierRow
      ? `${frontierRow.label} 段你只认出 ${frontierRow.known}/${frontierRow.answered} 个，从这里开始最省力。`
      : '',
    evidence,
    estimateLine,
    caveat: `这是自评抽样，不是测验结果：「认识」不等于会用，所以这个数偏乐观。${
      delta > 0 ? `每档只有 ${PLACEMENT_SAMPLE_SIZE / PLACEMENT_PROBE_BANDS} 个样本，区间宽是正常的。` : ''
    }`,
    canApply: true,
  }
}

/** 空结果（还没测过）—— 让组件不必各处判空 */
export function emptyPlacement() {
  return {
    sufficient: false,
    reason: 'thin',
    sampleSize: 0,
    bandCount: 0,
    itemCount: 0,
    hardestKnownP: 0,
    frontierBandIndex: -1,
    band: null,
    fallbackBand: null,
    estimate: null,
    low: null,
    high: null,
    bands: [],
  }
}

export default {
  PLACEMENT_SAMPLE_SIZE,
  PLACEMENT_PROBE_BANDS,
  PLACEMENT_MIN_SAMPLE,
  PLACEMENT_MIN_BANDS,
  RECOMMEND_FLOOR,
  ESTIMATE_CUTOFF,
  SATURATION_P,
  buildPlacementProbe,
  scorePlacement,
  describePlacement,
  emptyPlacement,
  countByBand,
  probeBandIndices,
  bandRangeLabel,
  recommendBandLabel,
}
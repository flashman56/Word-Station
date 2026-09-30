/**
 * vocab.js —— 预测词汇量（纯函数层，无 React / 无网络 / 无存储）
 * ------------------------------------------------------------------
 * 模型（可解释 / 可测 / 诚实，对应 docs/features-design.md B·预测词汇量）：
 *   1. 分档：沿 freqRank 切成 ~11 档（默认边界见 VOCAB_BOUNDS）。
 *   2. 证据：每档只统计**有真实学习记录**的词为样本
 *      —— 判别 = `records[id]` 存在 **且 statusSource !== 'migration'`。
 *      ⚠️ 关键红线：绝不用 effectiveStatus / autoKnown（那会把"高频默认已知"的
 *      继承词算进基线，新用户会被严重高估）。
 *   3. 单调约束：对 knownP 施加**非增约束**（PAVA isotonic，词频升序 → 已知率应递减）；
 *      无样本档在相邻档之间线性插值。
 *   4. 外推求和：estimate = Σ_b knownP_b × libraryN_b，**截断**到最后一个仍满足
 *      knownP_b ≥ cutoff(0.25) 的档（更低频档按未掌握处理，防长尾吹大）。
 *   5. 区间：每档二项方差 se_b = sqrt(p(1-p)/M_b)，方差传播
 *      Var = Σ (libraryN_b)²·se_b²，low/high = estimate ∓ z·√Var。
 *   6. 样本闸门：Σ 真实样本 ≥ minSample(30) **且** 有效档（有样本的档）≥ minBands(2)，
 *      否则 sufficient=false。
 *
 * 数字统一取整到整百（low 向下、high 向上、estimate 就近），UI 文案「≈ N 词（估算 ±D）」。
 *
 * ★ 本文件不 import 任何数据/React 模块，可在 Node 中直接单测。
 */

/** 默认分档边界（freqRank 的累计上界；越小越常见） */
export const VOCAB_BOUNDS = [500, 1000, 2000, 3000, 5000, 8000, 12000, 20000, 30000, 45000, 64825]

/**
 * 粗略参照带（Q1：只给「本词库口径」+ 一个粗略参照，不做母语者对标）。
 * UI 必须标注「粗略参照，非权威口径」。
 */
export const VOCAB_REFERENCE = [
  { max: 3500, label: '高中 ~3,500' },
  { max: 4500, label: '四级 ~4,500' },
  { max: 6000, label: '六级 ~6,000' },
  { max: 8000, label: '考研 ~5,500–8,000' },
  { max: Infinity, label: '更高' },
]

/** 取整到整百 */
function round100(n, mode = 'nearest') {
  const v = Number.isFinite(n) ? n : 0
  if (mode === 'floor') return Math.floor(v / 100) * 100
  if (mode === 'ceil') return Math.ceil(v / 100) * 100
  return Math.round(v / 100) * 100
}

/**
 * 由边界数组切出档位定义。首档 lo=0，末档 hi=Infinity（保证超界词也归入末档）。
 * @param {number[]} bounds
 * @returns {Array<{lo: number, hi: number}>}
 */
function buildBands(bounds) {
  const edges = [0, ...bounds]
  const bands = []
  for (let i = 0; i < edges.length - 1; i += 1) {
    const lo = edges[i]
    const hi = i === edges.length - 2 ? Infinity : edges[i + 1]
    bands.push({ lo, hi })
  }
  return bands
}

/** 词频序号 → 档位下标（lo < rank <= hi；非有限值归入末档） */
function bandIndexOf(bands, rank) {
  const r = typeof rank === 'number' && Number.isFinite(rank) ? rank : Infinity
  for (let i = 0; i < bands.length; i += 1) {
    if (r > bands[i].lo && r <= bands[i].hi) return i
  }
  return bands.length - 1
}

/**
 * 无样本档线性插值（按档位下标）。
 * 头部 / 尾部无样本时用最近的已知档值填充；全为空则原样返回。
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
    const va = vals[a]
    const vb = vals[b]
    for (let i = a + 1; i < b; i += 1) {
      const t = (i - a) / (b - a)
      out[i] = va + (vb - va) * t
    }
  }
  return out
}

/**
 * Pool Adjacent Violators：把序列调整为**非增**（v[i] >= v[i+1]）。
 * 权重取自各档样本数（无样本档权重 0，不参与池化，只随相邻档取值）。
 * @param {number[]} values
 * @param {number[]} weights
 * @returns {number[]}
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
    // 非增约束要求 v[i] >= v[i+1]；违例即 v[i] < v[i+1]
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
  for (let k = 0; k < v.length; k += 1) {
    for (let j = 0; j < c[k]; j += 1) out.push(v[k])
  }
  return out
}

/**
 * 参照带：给定估算值返回粗略区间标签。
 * @param {number} estimate
 * @returns {{ label: string, max: number }}
 */
export function referenceOf(estimate) {
  const e = Number.isFinite(estimate) ? estimate : 0
  for (const ref of VOCAB_REFERENCE) {
    if (e <= ref.max) return { label: ref.label, max: ref.max }
  }
  return VOCAB_REFERENCE[VOCAB_REFERENCE.length - 1]
}

/**
 * 预测词汇量。
 * @param {Array<{id: string, freqRank?: number}>} words 全量单词（按 id 去重）
 * @param {Record<string, {status?: string, statusSource?: string}|string>} records 学习记录
 * @param {{
 *   bounds?: number[],
 *   minSample?: number,
 *   minBands?: number,
 *   cutoff?: number,
 *   z?: number,
 * }} [opts]
 * @returns {{
 *   estimate: number, low: number, high: number,
 *   sufficient: boolean, sampleSize: number,
 *   bands: Array<{lo:number,hi:number,libraryN:number,studiedN:number,knownP:number,estKnown:number,included:boolean}>,
 *   reference: {label:string, max:number},
 * }}
 */
export function estimateVocabulary(words, records, opts = {}) {
  const {
    bounds = VOCAB_BOUNDS,
    minSample = 30,
    minBands = 2,
    cutoff = 0.25,
    z = 1.96,
  } = opts || {}

  const list = Array.isArray(words) ? words : []
  const recs = records && typeof records === 'object' ? records : {}
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

  const bandDefs = buildBands(bounds)
  const B = bandDefs.length

  // 去重 + 分档：库内词数 libraryN[b]
  const libraryN = new Array(B).fill(0)
  const seen = new Set()
  for (const w of list) {
    if (!w || !w.id || seen.has(w.id)) continue
    seen.add(w.id)
    libraryN[bandIndexOf(bandDefs, w.freqRank)] += 1
  }

  // 真实样本：records[id] 存在 且 statusSource !== 'migration'
  // ⚠️ 不用 effectiveStatus / autoKnown（继承已知会污染基线）
  const studiedN = new Array(B).fill(0)
  const knownN = new Array(B).fill(0)
  for (const w of list) {
    if (!w || !w.id) continue
    if (!hasOwn(recs, w.id)) continue
    const raw = recs[w.id]
    let status
    let statusSource
    if (typeof raw === 'string') {
      status = raw === 'new' ? 'unknown' : raw
      statusSource = undefined
    } else if (raw && typeof raw === 'object') {
      status = raw.status
      statusSource = raw.statusSource
    } else {
      continue
    }
    if (statusSource === 'migration') continue // 继承已知：排除
    const bi = bandIndexOf(bandDefs, w.freqRank)
    studiedN[bi] += 1
    if (status === 'known') knownN[bi] += 1
  }

  // 每档已知率（无样本为 null）
  const rawP = studiedN.map((m, i) => (m > 0 ? knownN[i] / m : null))
  const usableBands = studiedN.filter((m) => m > 0).length
  const sampleSize = studiedN.reduce((a, b) => a + b, 0)

  // 插值 + PAVA 非增
  const filled = interpolateNulls(rawP)
  const hasAnySample = rawP.some((v) => v != null)
  const adjustedP = hasAnySample ? pavaNonIncreasing(filled, studiedN) : filled.map(() => 0)

  // 外推求和：截断到最后一个 knownP >= cutoff 的档
  let lastIncluded = -1
  for (let i = 0; i < B; i += 1) {
    const p = adjustedP[i] == null ? 0 : adjustedP[i]
    if (p >= cutoff) lastIncluded = i
  }

  let rawEstimate = 0
  let variance = 0
  const bands = []
  for (let i = 0; i < B; i += 1) {
    const p = adjustedP[i] == null ? 0 : adjustedP[i]
    const included = i <= lastIncluded && libraryN[i] > 0
    const estKnown = libraryN[i] * p
    if (included) {
      rawEstimate += estKnown
      const m = studiedN[i]
      const se = m > 0 ? Math.sqrt((p * (1 - p)) / m) : 0
      variance += libraryN[i] * libraryN[i] * se * se
    }
    bands.push({
      lo: bandDefs[i].lo,
      hi: bandDefs[i].hi,
      libraryN: libraryN[i],
      studiedN: studiedN[i],
      knownP: p,
      estKnown: round100(estKnown, 'nearest'),
      included,
    })
  }

  const seTotal = Math.sqrt(variance)
  const sufficient = sampleSize >= minSample && usableBands >= minBands

  const estimate = round100(rawEstimate, 'nearest')
  const low = Math.max(0, round100(rawEstimate - z * seTotal, 'floor'))
  const high = round100(rawEstimate + z * seTotal, 'ceil')

  return {
    estimate,
    low,
    high,
    sufficient,
    sampleSize,
    bands,
    reference: referenceOf(estimate),
  }
}

export default { VOCAB_BOUNDS, VOCAB_REFERENCE, estimateVocabulary, referenceOf }

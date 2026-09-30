/**
 * 纯几何布局算法（不依赖 d3）
 *   radialLayout —— 聚焦视图：单词按难度/词频由内到外排成同心环
 * （总览的圆打包见 graph.packCircles / 群岛地形见 atlas.buildAtlas）
 */

/**
 * 同心环布局：单词按 sortKey 升序，由内环到外环。
 * 内环容量小、外环容量大，读起来就是"越往外越难 / 越冷门"。
 * 传 maxRadius 时环距自适应、均匀铺满画布（词多时不会溢出，也不丢词）。
 */
export function radialLayout(words, opts = {}) {
  const {
    cx = 0,
    cy = 0,
    minRadius = 120,
    maxRadius = null,
    ringGap = 96,
    baseCapacity = 6,
    capacityGrowth = 5,
    sortKey = (w) => w.freqRank,
  } = opts

  const sorted = [...words].sort((a, b) => sortKey(a) - sortKey(b))
  const nodes = []
  if (!sorted.length) return nodes

  // 预演：装下全部词需要多少环
  let capacityTotal = 0
  let rings = 0
  while (capacityTotal < sorted.length && rings < 40) {
    capacityTotal += baseCapacity + rings * capacityGrowth
    rings += 1
  }
  // 给了 maxRadius 就自适应环距（均匀铺满且不溢出），否则用固定 ringGap
  const gap =
    maxRadius != null && rings > 1 ? Math.max(18, (maxRadius - minRadius) / (rings - 1)) : ringGap

  let index = 0
  let ring = 0
  while (index < sorted.length) {
    const capacity = baseCapacity + ring * capacityGrowth
    const slice = sorted.slice(index, index + capacity)
    const radius = minRadius + ring * gap
    const start = ring % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / capacity
    slice.forEach((w, i) => {
      const a = start + (2 * Math.PI * i) / slice.length
      nodes.push({ ...w, x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a), ring })
    })
    index += slice.length
    ring += 1
    if (ring > 40) break // 兜底（40 环可容纳约 4000 词，正常不触发）
  }

  return nodes
}

/** 字号映射：词频越高字号越大（对数压缩，避免极端值） */
export function fontSizeByFreq(rank, { min = 11, max = 22 } = {}) {
  const t = 1 - Math.min(1, Math.log10(Math.max(rank, 10)) / Math.log10(20000))
  return Math.round(min + (max - min) * t)
}

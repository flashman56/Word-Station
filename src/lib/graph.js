/**
 * 网络关系图数据模型 + 轻量力导向布局（纯函数，零外部依赖）
 * ------------------------------------------------------------------
 * 三种图：
 *   buildMorphGraph —— 词素共现网络（词素为节点，共享单词为边）
 *   buildMorphEgo   —— 单点词素自我网络（词素 + 其下单词）
 *   buildWordEgo    —— 单点单词自我网络（单词 + 其词素 + 同源词）
 *
 * 掌握量着色：knownRatio = known / total，红→琥珀→绿。
 * 默认只画「选中 / 悬停」节点的边（caller 决定），本层的 links 是完整候选集。
 */
import { effectiveStatus } from './derive.js'

// ---------------------------------------------------------------- 配色

/**
 * 卡通风配色（三档）：
 *   沙岛（未掌握）→ 草丘（待复习）→ 绿岛（基本掌握）
 * 学得越多岛越绿 —— 一眼看出"我把地图点亮了多少"。
 */
export const MAP_PALETTE = [
  { name: '沙屿', fill: '#f7e7c6', stroke: '#d3a35f', dot: '#e6cd9c' },
  { name: '草丘', fill: '#fbe4ae', stroke: '#d9a02c', dot: '#f0d188' },
  { name: '绿岛', fill: '#c6e9d4', stroke: '#4f9e75', dot: '#a3d7b8' },
]

/** 掌握档位：0 沙岛 / 1 草丘 / 2 绿岛（>=66% 视为基本掌握） */
export function masteryTier(known, total) {
  if (!total) return 0
  const r = known / total
  if (r >= 0.66) return 2
  if (r >= 0.33) return 1
  return 0
}

/** 节点描边色（按掌握档位） */
export function masteryColor(known, total) {
  return MAP_PALETTE[masteryTier(known, total)].stroke
}

/** 节点填充色（按掌握档位） */
export function masterySoft(known, total) {
  return MAP_PALETTE[masteryTier(known, total)].fill
}

/**
 * 稳定字符串哈希（用于把词素 id 变成固定的"岛形种子"）。
 * 同一个词素每次渲染都得到同一座岛，不会闪烁变形。
 */
export function hashId(str) {
  let h = 2166136261
  for (let i = 0; i < String(str).length; i += 1) {
    h ^= String(str).charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 1000000
}

/**
 * 统计一组单词的三态数量（渲染期调用，与布局解耦）。
 * 布局只依赖「结构」（节点/边），掌握量着色才依赖 records，
 * 这样批量标记时不会触发重新布局、图不会跳。
 */
export function statusCounts(words, records) {
  let known = 0
  let review = 0
  let unknown = 0
  ;(words || []).forEach((w) => {
    const s = effectiveStatus(w, records)
    if (s === 'known') known += 1
    else if (s === 'review') review += 1
    else unknown += 1
  })
  return { known, review, unknown, total: (words || []).length }
}

// ---------------------------------------------------------------- 词素共现网络

/**
 * 词素网络：节点=词素（有词的才算），边=两个词素在同一单词中共现。
 * 只依赖结构（morphemes + index），不接收 records —— 掌握量在渲染期着色。
 * @param {Array} morphemes 全量词素（不过滤）
 * @param {Object} index buildIndex 的结果
 * @param {Object} opts { minEdgeWeight, maxDegree }
 */
export function buildMorphGraph(morphemes, index, opts = {}) {
  const { minEdgeWeight = 2, maxDegree = 8 } = opts

  const nodes = []
  const nodeById = new Map()
  morphemes.forEach((m) => {
    const ws = index.wordsByMorph.get(m.id) || []
    if (!ws.length) return
    const node = {
      id: m.id,
      kind: 'morph',
      morph: m,
      label: (m.display || m.form).split(' / ')[0],
      words: ws,
      count: ws.length,
      type: m.type,
    }
    nodes.push(node)
    nodeById.set(m.id, node)
  })

  // 单词 → 出现在哪些「有节点的」词素
  const wordToMorphs = new Map()
  nodes.forEach((n) => {
    n.words.forEach((w) => {
      if (!wordToMorphs.has(w.id)) wordToMorphs.set(w.id, [])
      wordToMorphs.get(w.id).push(n.id)
    })
  })

  // 词素两两共现计数
  const pairWeight = new Map()
  wordToMorphs.forEach((ids) => {
    const uniq = [...new Set(ids)]
    for (let i = 0; i < uniq.length; i += 1) {
      for (let j = i + 1; j < uniq.length; j += 1) {
        const a = uniq[i]
        const b = uniq[j]
        const key = a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`
        pairWeight.set(key, (pairWeight.get(key) || 0) + 1)
      }
    }
  })

  const candidates = []
  pairWeight.forEach((weight, key) => {
    if (weight < minEdgeWeight) return
    const [a, b] = key.split('\u0000')
    if (!nodeById.has(a) || !nodeById.has(b)) return
    candidates.push({ source: a, target: b, weight })
  })

  // 度数封顶：按权重从高到低贪心加入，保证两端度数都不超过 maxDegree
  // （只用「各节点自选 top-N」再取并集是不够的：某节点会被邻接方选中而超出上限）
  candidates.sort((x, y) => y.weight - x.weight)
  const deg = new Map()
  const links = []
  candidates.forEach((l) => {
    const da = deg.get(l.source) || 0
    const db = deg.get(l.target) || 0
    if (da >= maxDegree || db >= maxDegree) return
    deg.set(l.source, da + 1)
    deg.set(l.target, db + 1)
    links.push(l)
  })

  return { nodes, links }
}

// ---------------------------------------------------------------- 邻居索引

/** 邻接表：nodeId -> Set(nodeId)，边无向 */
export function buildAdjacency(links) {
  const adj = new Map()
  const add = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set())
    adj.get(a).add(b)
  }
  links.forEach((l) => {
    add(l.source, l.target)
    add(l.target, l.source)
  })
  return adj
}

// ---------------------------------------------------------------- 单词自我网络

/**
 * 单词自我网络：中心词 + 它的词素 + 与之共享词素的同源词（限量）。
 * 只依赖结构，不接收 records。
 */
export function buildWordEgo(word, index, opts = {}) {
  const { maxSiblings = 18 } = opts
  if (!word) return { nodes: [], links: [] }

  const nodes = []
  const links = []

  const center = {
    id: `word:${word.id}`,
    kind: 'word',
    word,
    label: word.form,
    isCenter: true,
    ring: 0,
  }
  nodes.push(center)

  const centerMorphs = word.morphs.map((mid) => index.morphById.get(mid)).filter(Boolean)
  centerMorphs.forEach((m) => {
    const ws = index.wordsByMorph.get(m.id) || []
    nodes.push({
      id: `morph:${m.id}`,
      kind: 'morph',
      morph: m,
      label: (m.display || m.form).split(' / ')[0],
      words: ws,
      count: ws.length,
      type: m.type,
      ring: 1,
    })
    links.push({ source: `word:${word.id}`, target: `morph:${m.id}`, weight: 1, via: m.id })
  })

  // 同源词：按共享词素数量排序取前 N
  const shared = new Map()
  word.morphs.forEach((mid) => {
    ;(index.wordsByMorph.get(mid) || []).forEach((w) => {
      if (w.id === word.id) return
      if (!shared.has(w.id)) shared.set(w.id, { word: w, vias: [] })
      shared.get(w.id).vias.push(mid)
    })
  })
  ;[...shared.values()]
    .sort((a, b) => b.vias.length - a.vias.length)
    .slice(0, maxSiblings)
    .forEach(({ word: w, vias }) => {
      const nid = `word:${w.id}`
      nodes.push({
        id: nid,
        kind: 'word',
        word: w,
        label: w.form,
        shared: vias.length,
        ring: 2,
      })
      vias.forEach((mid) => {
        links.push({ source: nid, target: `morph:${mid}`, weight: 1, via: mid })
      })
    })

  return { nodes, links }
}

/** 词素自我网络：中心词素 + 其下全部单词（限量） */
export function buildMorphEgo(morph, index, opts = {}) {
  const { maxWords = 24 } = opts
  if (!morph) return { nodes: [], links: [] }
  const all = index.wordsByMorph.get(morph.id) || []
  const ws = all.slice(0, maxWords)
  const nodes = [
    {
      id: `morph:${morph.id}`,
      kind: 'morph',
      morph,
      label: (morph.display || morph.form).split(' / ')[0],
      words: all,
      count: all.length,
      type: morph.type,
      isCenter: true,
      ring: 0,
    },
  ]
  const links = []
  ws.forEach((w) => {
    nodes.push({
      id: `word:${w.id}`,
      kind: 'word',
      word: w,
      label: w.form,
      ring: 1,
    })
    links.push({ source: `morph:${morph.id}`, target: `word:${w.id}`, weight: 1 })
  })
  return { nodes, links }
}

// ---------------------------------------------------------------- 布局

/**
 * 轻量力导向布局（Fruchterman-Reingold 变体，O(n²)，适合 ≤ 400 节点）。
 * 直接写回 node.x / node.y，返回 nodes。
 */
export function forceLayout(nodes, links, opts = {}) {
  const { width = 800, height = 560, iterations = 280, padding = 30 } = opts
  const n = nodes.length
  if (!n) return nodes

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const cx = width / 2
  const cy = height / 2
  const area = width * height
  const k = Math.sqrt(area / n) * 0.85

  // 初始：黄金角螺旋，避免对称死锁
  nodes.forEach((node, i) => {
    const a = i * 2.399963
    const rad = Math.min(width, height) * 0.36 * Math.sqrt((i + 1) / n)
    node.x = cx + rad * Math.cos(a)
    node.y = cy + rad * Math.sin(a)
    node.vx = 0
    node.vy = 0
  })

  const springs = links
    .map((l) => ({ a: byId.get(l.source), b: byId.get(l.target), w: l.weight || 1 }))
    .filter((s) => s.a && s.b)

  for (let it = 0; it < iterations; it += 1) {
    const cool = 1 - it / iterations
    // 斥力
    for (let i = 0; i < n; i += 1) {
      const a = nodes[i]
      for (let j = i + 1; j < n; j += 1) {
        const b = nodes[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        let d2 = dx * dx + dy * dy
        if (d2 < 0.01) {
          // 用节点索引做确定性扰动，避免 Math.random 破坏布局可重复性（同输入必须同输出）
          dx = (((i * 12.9898) % 1) - 0.5) * 0.1
          dy = (((j * 78.233) % 1) - 0.5) * 0.1
          d2 = dx * dx + dy * dy
          if (d2 < 1e-6) {
            dx = 0.01
            dy = 0.01
            d2 = dx * dx + dy * dy
          }
        }
        const f = (k * k) / d2
        const fx = dx * f
        const fy = dy * f
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }
    }
    // 弹簧力
    springs.forEach((s) => {
      let dx = s.b.x - s.a.x
      let dy = s.b.y - s.a.y
      const d = Math.hypot(dx, dy) || 0.01
      const f = ((d - k) / d) * 0.12 * Math.min(s.w, 4)
      const fx = dx * f
      const fy = dy * f
      s.a.vx += fx
      s.a.vy += fy
      s.b.vx -= fx
      s.b.vy -= fy
    })
    // 向心力 + 位移限幅
    const maxStep = Math.max(2, 18 * cool)
    nodes.forEach((node) => {
      node.vx += (cx - node.x) * 0.012
      node.vy += (cy - node.y) * 0.012
      const v = Math.hypot(node.vx, node.vy) || 1
      const step = Math.min(v, maxStep)
      node.x += (node.vx / v) * step
      node.y += (node.vy / v) * step
      node.x = Math.max(padding, Math.min(width - padding, node.x))
      node.y = Math.max(padding, Math.min(height - padding, node.y))
      node.vx *= 0.82
      node.vy *= 0.82
    })
  }

  nodes.forEach((node) => {
    delete node.vx
    delete node.vy
  })
  return nodes
}

/**
 * 同心环布局（自我网络用）：中心 ring0 → ring1 → ring2。
 */
export function radialEgoLayout(nodes, opts = {}) {
  const { width = 800, height = 560 } = opts
  const cx = width / 2
  const cy = height / 2
  const rings = new Map()
  nodes.forEach((node) => {
    const r = node.ring || 0
    if (!rings.has(r)) rings.set(r, [])
    rings.get(r).push(node)
  })
  const maxR = Math.min(width, height) / 2 - 36
  rings.forEach((list, ring) => {
    if (ring === 0) {
      list.forEach((node) => {
        node.x = cx
        node.y = cy
      })
      return
    }
    const radius = ring === 1 ? maxR * 0.52 : maxR
    list.forEach((node, i) => {
      const a = (2 * Math.PI * i) / list.length - Math.PI / 2
      node.x = cx + radius * Math.cos(a)
      node.y = cy + radius * Math.sin(a)
    })
  })
  return nodes
}

/** 节点半径 */
export function nodeRadius(node) {
  if (node.kind === 'word') return node.isCenter ? 13 : 7
  const c = node.count || 1
  return Math.round(9 + Math.min(20, Math.sqrt(c) * 2.6))
}

// ---------------------------------------------------------------- 圆打包（群岛地形 / 通用）

/**
 * 贪心螺旋打包：把全部圆铺成一张紧凑的大地图（词素彼此独立，不产生连线）。
 * - 大圆先落在中心、小圆后填缝 → 观感自然、无重叠
 * - 均匀网格加速碰撞检测，700 个圆也在几十毫秒内完成
 * - 纯确定性（同输入必同输出），便于测试与缓存
 *
 * @param {Array} nodes 每项需含 { id, r }
 * @param {Object} opts { gap 圆间距, cell 网格尺寸, aspectX/aspectY 纵横拉伸 }
 * @returns {{ nodes: Array, bounds: {minX,minY,maxX,maxY,width,height} }}
 */
export function packCircles(nodes, opts = {}) {
  const gap = opts.gap != null ? opts.gap : 9
  const ax = opts.aspectX != null ? opts.aspectX : 1
  const ay = opts.aspectY != null ? opts.aspectY : 1
  if (!nodes.length) {
    return {
      nodes: [],
      bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, width: -Infinity, height: -Infinity },
    }
  }
  const maxR = nodes.reduce((m, n) => Math.max(m, n.r), 0)
  // 网格边长 ≥ 两倍最大半径 + 间距 → 只需检查 3×3 邻域即可覆盖所有可能碰撞
  const cell = opts.cell != null ? opts.cell : Math.max(64, maxR * 2 + gap * 2 + 4)

  const placed = []
  const grid = new Map()
  const key = (cx, cy) => `${cx},${cy}`
  const insert = (n) => {
    const k = key(Math.round(n.x / cell), Math.round(n.y / cell))
    const arr = grid.get(k)
    if (arr) arr.push(n)
    else grid.set(k, [n])
  }
  const fits = (x, y, r) => {
    const cx = Math.round(x / cell)
    const cy = Math.round(y / cell)
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        const arr = grid.get(key(cx + i, cy + j))
        if (!arr) continue
        for (let t = 0; t < arr.length; t += 1) {
          const p = arr[t]
          const dx = x - p.x
          const dy = y - p.y
          const min = r + p.r + gap
          if (dx * dx + dy * dy < min * min) return false
        }
      }
    }
    return true
  }

  // 大圆优先（半径相同按 id 稳定排序），保证布局确定性；
  // keepOrder=true 时尊重传入顺序（用于"按分组依次落位"的场景）
  const order = opts.keepOrder
    ? [...nodes]
    : [...nodes].sort((a, b) => b.r - a.r || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  // 采样密度：只影响「紧凑度」，不影响正确性（fits 是精确判定，永不重叠）。
  // 步长越大越快、间隙略大；这里取到「观感够紧 + 700 圆 <300ms」的平衡点。
  const minStep = opts.minStep != null ? opts.minStep : 10
  const stepFactor = opts.stepFactor != null ? opts.stepFactor : 0.55
  const minPitch = opts.minPitch != null ? opts.minPitch : 6
  const pitchFactor = opts.pitchFactor != null ? opts.pitchFactor : 0.45

  order.forEach((node, idx) => {
    if (idx === 0) {
      node.x = 0
      node.y = 0
      placed.push(node)
      insert(node)
      return
    }
    const stepLen = Math.max(minStep, node.r * stepFactor) // 目标切向步长（弧长）
    const pitch = Math.max(minPitch, node.r * pitchFactor) // 螺旋每圈径向外扩
    // 从「上一个已放置圆」附近起扫：新圆几乎总落在边缘，跳过内圈可省大量空转
    // （坐标被 aspectX/Y 拉伸过，先换算回"参数半径"再起扫）
    let angle = 0
    let radius = 0
    if (opts.fromFrontier !== false && placed.length > 1) {
      const last = placed[placed.length - 1]
      const qx = last.x / ax
      const qy = last.y / ay
      const lr = Math.hypot(qx, qy)
      if (lr > pitch) {
        angle = Math.atan2(qy, qx)
        radius = Math.max(0, lr - pitch * 1.5)
      }
    }
    let guard = 0
    while (guard < 200000) {
      guard += 1
      const x = radius * Math.cos(angle) * ax
      const y = radius * Math.sin(angle) * ay
      if (radius > node.r * 0.4 && fits(x, y, node.r)) break
      // 切向步长按半径自适应 → 保证采样密度（弧长 ≈ stepLen），不因半径变大而漏缝
      const dTheta = Math.min(0.6, stepLen / Math.max(radius, node.r))
      angle += dTheta
      radius += (pitch * dTheta) / (2 * Math.PI)
    }
    node.x = radius * Math.cos(angle) * ax
    node.y = radius * Math.sin(angle) * ay
    placed.push(node)
    insert(node)
  })

  const bounds = placed.reduce(
    (b, n) => ({
      minX: Math.min(b.minX, n.x - n.r),
      minY: Math.min(b.minY, n.y - n.r),
      maxX: Math.max(b.maxX, n.x + n.r),
      maxY: Math.max(b.maxY, n.y + n.r),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )
  bounds.width = bounds.maxX - bounds.minX
  bounds.height = bounds.maxY - bounds.minY

  return { nodes: placed, bounds }
}

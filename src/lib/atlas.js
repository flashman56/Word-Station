/**
 * 群岛地形生成（卡通插画地图）
 * ------------------------------------------------------------------
 * **一座岛 = 一个词素**（全库 678 个词素 → 678 座岛），
 * 按词素类型分成 3 大板块，彼此分离、海域留白清晰：
 *   root   → 火山熔岩型
 *   prefix → 热带植被型
 *   suffix → 冰雪岩石型
 *
 * 板块内部再按「来源 + 词频档」分成若干**子群岛簇**（拉丁·核心 / 希腊 / 古英语…），
 * 让几百座岛看起来是有层次的群岛，而不是一坨散点。
 *
 * 每座岛的轮廓由「词素 id」派生的唯一种子决定：控制点数量、起伏、明暗微差都不同，
 * 因此**每座岛长相都不一样**，且永不抖动变形。
 *
 * 纯函数、零外部依赖：不读 records（掌握量在渲染期着色）。
 */
import { ORIGINS } from './derive.js'
import { hashId, packCircles } from './graph.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

/** 确定性 0~1 噪声（同一 seed/i 必得同值） */
export function noise01(seed, i) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** 颜色加深 / 提亮：amt>0 变亮，amt<0 变暗 */
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return `#${ch
    .map((c) => {
      const v = amt > 0 ? c + (255 - c) * amt : c * (1 + amt)
      return Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
    })
    .join('')}`
}

// ---------------------------------------------------------------- 三个生物群系

export const THEMES = {
  root: {
    key: 'root',
    archName: '词根群岛',
    name: '火山熔岩型',
    icon: '🌋',
    feature: '炽热熔岩台地：主岛立着活火山，山脊泛橙红，海岸布满黑色礁石',
    tier: ['#ffd9a4', '#ffb267', '#ff8a3d'],
    ink: '#7a2708',
    accent: '#ff3d00',
    terrain: 'volcano',
  },
  prefix: {
    key: 'prefix',
    archName: '前缀群岛',
    name: '热带植被型',
    icon: '🌴',
    feature: '热带雨林绿岛：棕榈成荫、地势平缓圆润，边缘多浅滩与白沙',
    tier: ['#dcf7c4', '#a8e97f', '#61d651'],
    ink: '#1c5520',
    accent: '#0f9d3f',
    terrain: 'palm',
  },
  suffix: {
    key: 'suffix',
    archName: '后缀群岛',
    name: '冰雪岩石型',
    icon: '❄️',
    feature: '极地冰原：锐利的雪峰岩脊、亮白冰面与冷蓝阴影，四周漂着碎冰',
    tier: ['#f4fcff', '#d2ecfa', '#9cd8f1'],
    ink: '#1d5470',
    accent: '#1ea3cf',
    terrain: 'ice',
  },
}

export const TYPE_ORDER = ['root', 'prefix', 'suffix']

// ---------------------------------------------------------------- 海岸线 / 礁石

/** 一座岛该用几个控制点（12~16，由种子决定 → 形状天然各不相同） */
export function coastPoints(seed) {
  return 12 + Math.floor(noise01(seed, 31) * 5)
}

/**
 * 小岛轮廓：多八度噪声扰动的闭合海岸线。
 * - 圆润为主（12~16 个控制点 + Catmull-Rom 平滑）
 * - 少量控制点被抬成「岬角」、压低成「海湾」→ 凹凸自然，绝不成正圆
 * - 半径夹在 [0.42r, 1.2r]：最大外凸 1.2r，打包半径取 1.22r 即永不重叠
 * - opts.rough=true 出「手绘重描线」（同一轮廓的微抖动副本）
 */
export function coastPath(cx, cy, r, seed, opts = {}) {
  const points = opts.points || coastPoints(seed)
  const rough = !!opts.rough
  // 每座岛强制一个岬角 + 一个海湾（位置由种子决定）→ 保证"绝不规整"
  const capeIdx = Math.floor(noise01(seed + 6001, 1) * points)
  const bayIdx = (capeIdx + 2 + Math.floor(noise01(seed + 7001, 2) * (points - 3))) % points
  const pts = []
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2
    const n1 = noise01(seed, i) - 0.5
    const n2 = noise01(seed + 991, Math.floor(i / 2)) - 0.5
    let s = 0.86 + n1 * 0.26 + n2 * 0.16
    if (i === capeIdx) {
      s = 1.04 + noise01(seed + 8887, i) * 0.12 // 岬角：必定外凸
    } else if (i === bayIdx) {
      s = 0.5 + noise01(seed + 9991, i) * 0.14 // 海湾：必定内凹
    } else {
      const kind = noise01(seed + 5557, i)
      if (kind > 0.82) s *= 1.12 // 随机岬角
      else if (kind < 0.16) s *= 0.74 // 随机海湾
    }
    if (rough) s *= 1 + (noise01(seed + 4242, i) - 0.5) * 0.1
    const rr = clamp(r * s, r * 0.42, r * 1.2)
    pts.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) })
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < points; i += 1) {
    const p0 = pts[(i - 1 + points) % points]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % points]
    const p3 = pts[(i + 2) % points]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return `${d}Z`
}

/** 岛外散落礁石：确定性分布，恒在 1.14r~1.48r（不侵占别的岛） */
export function rockSpots(cx, cy, r, seed) {
  const n = 2 + Math.floor(noise01(seed, 71) * 3) // 2~4 块
  const out = []
  for (let i = 0; i < n; i += 1) {
    const a = noise01(seed, 101 + i) * Math.PI * 2
    const d = r * (1.14 + noise01(seed, 211 + i) * 0.34)
    out.push({
      x: cx + d * Math.cos(a),
      y: cy + d * Math.sin(a),
      r: clamp(r * (0.16 + noise01(seed, 307 + i) * 0.16), 1.6, 7),
      seed: seed + 1000 + i * 37,
    })
  }
  return out
}

// ---------------------------------------------------------------- 岛上装饰

/**
 * 岛上的"村庄"：小屋数量随词数增长（1~5 间），聚在岛的中部。
 * 位置 / 朝向 / 大小都由种子决定 → 每座岛的村子都不一样。
 */
export function houseSpots(cx, cy, r, seed, wordCount) {
  const n = clamp(Math.round(wordCount / 45), 1, 5)
  const out = []
  for (let i = 0; i < n; i += 1) {
    const a = noise01(seed + 1301, i) * Math.PI * 2
    const d = r * (0.1 + noise01(seed + 1409, i) * 0.34)
    out.push({
      x: cx + d * Math.cos(a),
      y: cy + d * Math.sin(a),
      s: r * (0.16 + noise01(seed + 1501, i) * 0.08),
      flip: noise01(seed + 1601, i) > 0.5 ? 1 : -1,
    })
  }
  return out
}

/**
 * 岛上的植被：**数量随掌握度增长** —— 一座岛学得越多，长得越茂密。
 * @param {number} ratio 已掌握比例 0~1
 * @returns {Array} 每株 { x, y, s, kind }，kind 1=阔叶 2=针叶
 */
export function plantSpots(cx, cy, r, seed, ratio) {
  const n = Math.round(clamp(ratio, 0, 1) * 7)
  const out = []
  for (let i = 0; i < n; i += 1) {
    const a = noise01(seed + 2201, i) * Math.PI * 2
    const d = r * (0.32 + noise01(seed + 2309, i) * 0.46)
    out.push({
      x: cx + d * Math.cos(a),
      y: cy + d * Math.sin(a),
      s: r * (0.18 + noise01(seed + 2407, i) * 0.1),
      kind: noise01(seed + 2503, i) > 0.45 ? 1 : 2,
    })
  }
  return out
}

// ---------------------------------------------------------------- 尺寸

/**
 * 岛半径：把「词数」在**本板块内**归一化后映射到 10~42，
 * 既保留"词多的岛更大"的语义，又保证小岛不是看不见的针尖。
 * （半径整体偏大是刻意的：打包间隙是固定值，岛越大、间隙占比越小 → 同屏看得越清）
 */
export function islandRadius(count, minCount, maxCount) {
  const s = Math.sqrt(Math.max(count, 1))
  const lo = Math.sqrt(Math.max(minCount, 1))
  const hi = Math.sqrt(Math.max(maxCount, 1))
  const t = hi > lo ? (s - lo) / (hi - lo) : 0.5
  return Math.round((10 + 32 * Math.pow(clamp(t, 0, 1), 0.6)) * 10) / 10
}

// ---------------------------------------------------------------- 来源分组

/**
 * 按「来源」把岛分组（拉丁 / 希腊 / 古英语 / 法语 / 日耳曼…）。
 * 组的先后 = 组内岛数降序；组内按词数降序。
 * 铺开时按这个顺序依次落位 → **同源的岛自然聚成一团**，也就有了"子群岛"的观感。
 */
function groupByOrigin(islands) {
  const byOrigin = new Map()
  islands.forEach((s) => {
    const o = s.origin || 'other'
    if (!byOrigin.has(o)) byOrigin.set(o, [])
    byOrigin.get(o).push(s)
  })
  return [...byOrigin.entries()]
    .sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1))
    .map(([origin, list]) => ({
      id: `cl.${origin}`,
      origin,
      label: ORIGINS[origin]?.label || origin,
      islands: [...list].sort((a, b) => b.wordCount - a.wordCount || (a.id < b.id ? -1 : 1)),
    }))
}

// ---------------------------------------------------------------- 构造

/**
 * 生成整张群岛地图。
 * @returns {{ regions: Array, archipelagos: Array, islands: Array, bounds: Object, stats: Object }}
 */
export function buildAtlas(morphemes, index) {
  const islands = []
  const regions = TYPE_ORDER.map((type) => {
    const theme = THEMES[type]
    const mine = morphemes.filter((m) => m.type === type)
    const counts = mine.map((m) => (index.wordsByMorph.get(m.id) || []).length)
    const minW = Math.min(...counts)
    const maxW = Math.max(...counts)

    const regionIslands = mine.map((m) => {
      const words = index.wordsByMorph.get(m.id) || []
      const seed = hashId(m.id)
      const R = islandRadius(words.length, minW, maxW)
      const variant = ((seed % 5) - 2) * 0.045 // ±9% 明暗微差 → 每座岛色调略不同
      return {
        id: `isl.${m.id}`,
        kind: 'island',
        type,
        theme,
        morph: m,
        label: (m.display || m.form).split(' / ')[0],
        origin: m.origin || 'other',
        words,
        wordCount: words.length,
        R,
        seed,
        variant,
        isMain: false,
        x: 0,
        y: 0,
      }
    })
    islands.push(...regionIslands)

    // 主岛：本板块词最多的词素
    const main = regionIslands.reduce((a, b) => (b.wordCount > a.wordCount ? b : a), regionIslands[0])
    if (main) {
      main.isMain = true
      main.R = Math.round(main.R * 1.3 * 10) / 10
    }

    // 一次成型：把本板块所有岛按「来源分组顺序」依次落位。
    // 不做"簇内打包 + 簇间打包"两级嵌套（那会把板块撑大近一倍），
    // 单级铺开既紧凑，又因为落位顺序 = 来源顺序，同源的岛会自然抱团成子群岛。
    const clusters = groupByOrigin(regionIslands)
    const ordered = clusters.flatMap((c) => c.islands)
    const packed = packCircles(
      ordered.map((s) => ({ id: s.id, r: s.R * 1.22 + 3 })),
      { gap: 7, keepOrder: true },
    )
    const byId = new Map(packed.nodes.map((n) => [n.id, n]))
    regionIslands.forEach((s) => {
      const p = byId.get(s.id)
      s.x = p.x
      s.y = p.y
    })

    // 子群岛（=来源分组）：质心与半径直接由落位结果算出
    clusters.forEach((c) => {
      const xs = c.islands.map((s) => s.x)
      const ys = c.islands.map((s) => s.y)
      c.x = (Math.min(...xs) + Math.max(...xs)) / 2
      c.y = (Math.min(...ys) + Math.max(...ys)) / 2
      c.radius = Math.max(...c.islands.map((s) => Math.hypot(s.x - c.x, s.y - c.y) + s.R * 1.4))
      c.islandCount = c.islands.length
      c.wordCount = c.islands.reduce((sum, s) => sum + s.wordCount, 0)
      c.title = `${c.label}（${c.islandCount}）`
      c.titleAnchor = { x: c.x, y: c.y - c.radius * 0.96 }
    })

    const radius = Math.max(...regionIslands.map((s) => Math.hypot(s.x, s.y) + s.R * 1.5))
    return {
      id: `arch.${type}`,
      type,
      theme,
      name: `${theme.archName} · ${theme.name}`,
      icon: theme.icon,
      islands: regionIslands,
      clusters,
      radius,
      morphCount: regionIslands.length,
      wordCount: regionIslands.reduce((sum, s) => sum + s.wordCount, 0),
      mainIsland: main,
      center: { x: 0, y: 0 },
    }
  })

  // 三大板块拉开距离：按体量降序放在 180° / ±43° 方向
  // 间距系数 1.22 → 板块包围圈之间仍留出约 1/5 直径的开阔海域，但整图更紧凑、岛更大
  const order = [...regions].sort((a, b) => b.radius - a.radius)
  const angles = [-Math.PI, -0.75, 0.75]
  const sizes = order.map((a) => a.radius)
  let Rc = Math.max(...sizes, 1) * 1.2
  for (let it = 0; it < 120; it += 1) {
    let ok = true
    for (let i = 0; i < order.length && ok; i += 1) {
      for (let j = i + 1; j < order.length; j += 1) {
        const d = 2 * Rc * Math.sin(Math.abs(angles[i] - angles[j]) / 2)
        if (d < (sizes[i] + sizes[j]) * 1.22) {
          ok = false
          break
        }
      }
    }
    if (ok) break
    Rc *= 1.06
  }
  order.forEach((a, i) => {
    a.center = { x: Rc * Math.cos(angles[i]), y: Rc * Math.sin(angles[i]) }
    a.islands.forEach((s) => {
      s.x += a.center.x
      s.y += a.center.y
    })
    a.clusters.forEach((c) => {
      c.x += a.center.x
      c.y += a.center.y
      c.titleAnchor = { x: c.x, y: c.y - c.radius * 0.96 }
    })
    // 板块标题锚点：中心正上方、最靠上的那座岛再往上抬一点
    a.titleAnchor = { x: a.center.x, y: Math.min(...a.islands.map((s) => s.y - s.R * 1.9)) }
  })

  // 全局包围盒（海岸外凸 1.2R + 礁石 + 岛名）
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  islands.forEach((s) => {
    const pad = s.R * 1.9
    minX = Math.min(minX, s.x - pad)
    minY = Math.min(minY, s.y - pad)
    maxX = Math.max(maxX, s.x + pad)
    maxY = Math.max(maxY, s.y + pad)
  })
  const pad = 55
  const bounds = {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  }

  return {
    regions,
    archipelagos: regions, // 兼容旧字段名
    islands,
    bounds,
    stats: {
      islandCount: islands.length,
      regionCount: regions.length,
      clusterCount: regions.reduce((s, a) => s + a.clusters.length, 0),
      morphCount: islands.length,
      wordCount: islands.reduce((s, i) => s + i.wordCount, 0),
    },
  }
}

/** 给测试 / 交付报告用的结构化摘要 */
export function atlasSummary(atlas) {
  return atlas.regions.map((a) => ({
    type: a.type,
    name: a.name,
    icon: a.icon,
    center: [Math.round(a.center.x), Math.round(a.center.y)],
    radius: Math.round(a.radius),
    islandCount: a.islands.length,
    clusterCount: a.clusters.length,
    clusters: a.clusters.map((c) => ({ title: c.title, islands: c.islandCount, radius: Math.round(c.radius) })),
    mainIsland: a.mainIsland ? `${a.mainIsland.label}（${a.mainIsland.wordCount} 词）` : '',
    morphCount: a.morphCount,
    wordCount: a.wordCount,
    features: a.theme.feature,
    biggest: a.islands
      .slice()
      .sort((x, y) => y.R - x.R)
      .slice(0, 3)
      .map((s) => `${s.label} R${s.R}`),
  }))
}

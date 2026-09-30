/**
 * 图模型单元测试：src/lib/graph.js
 * 执行：npm run test:graph
 *
 * 覆盖：词素共现网络的连通性/去自环、力导向布局的有限性与确定性、
 *       单词/词素自我网络的中心节点、掌握量配色分档。
 */
import { morphemes, words } from '../src/data/index.js'
import { buildIndex, effectiveStatus } from '../src/lib/derive.js'
import {
  MAP_PALETTE,
  buildMorphEgo,
  buildMorphGraph,
  buildWordEgo,
  forceLayout,
  masteryColor,
  masterySoft,
  masteryTier,
  packCircles,
  statusCounts,
} from '../src/lib/graph.js'

let pass = 0
let fail = 0
const check = (name, fn) => {
  try {
    const r = fn()
    if (r === false) throw new Error('断言返回 false')
    pass++
    console.log(`  PASS  ${name}`)
  } catch (e) {
    fail++
    console.log(`  FAIL  ${name}\n        ${e.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed')
}

const index = buildIndex(morphemes, words)
console.log(`数据规模：词素 ${morphemes.length} · 单词 ${words.length}`)

// ---------------- 词素共现网络 ----------------

const g = buildMorphGraph(morphemes, index, { minEdgeWeight: 2, maxDegree: 6 })

check('buildMorphGraph：节点数 = 有词的词素数', () => {
  const withWords = morphemes.filter((m) => (index.wordsByMorph.get(m.id) || []).length > 0).length
  assert(g.nodes.length === withWords, `期望 ${withWords}，实际 ${g.nodes.length}`)
})

check('buildMorphGraph：每个节点都有 count>0 且 words 非空', () => {
  g.nodes.forEach((n) => {
    assert(n.count > 0 && n.words.length === n.count, `${n.id} count=${n.count}`)
  })
})

check('buildMorphGraph：边两端都指向存在的节点，且无自环', () => {
  const ids = new Set(g.nodes.map((n) => n.id))
  g.links.forEach((l) => {
    assert(ids.has(l.source), `source 缺失 ${l.source}`)
    assert(ids.has(l.target), `target 缺失 ${l.target}`)
    assert(l.source !== l.target, `自环 ${l.source}`)
    assert(l.weight >= 2, `权重 <2 的边不该保留：${l.weight}`)
  })
})

check('buildMorphGraph：度数封顶生效（每个节点 ≤ maxDegree 条边）', () => {
  const deg = new Map()
  g.links.forEach((l) => {
    deg.set(l.source, (deg.get(l.source) || 0) + 1)
    deg.set(l.target, (deg.get(l.target) || 0) + 1)
  })
  deg.forEach((d, id) => assert(d <= 6, `${id} 度数 ${d} > 6`))
})

// ---------------- 力导向布局 ----------------

check('forceLayout：所有坐标有限且被夹在画布内', () => {
  const nodes = g.nodes.map((n) => ({ ...n }))
  forceLayout(nodes, g.links, { width: 800, height: 560 })
  nodes.forEach((n) => {
    assert(Number.isFinite(n.x) && Number.isFinite(n.y), `${n.id} 坐标非有限`)
    assert(n.x >= 0 && n.x <= 800 && n.y >= 0 && n.y <= 560, `${n.id} 越界 (${n.x},${n.y})`)
  })
})

check('forceLayout：确定性（同输入两次结果一致）', () => {
  const a = g.nodes.map((n) => ({ ...n }))
  const b = g.nodes.map((n) => ({ ...n }))
  forceLayout(a, g.links, { width: 800, height: 560 })
  forceLayout(b, g.links, { width: 800, height: 560 })
  a.forEach((n, i) => {
    assert(Math.abs(n.x - b[i].x) < 1e-9 && Math.abs(n.y - b[i].y) < 1e-9, `${n.id} 位置不确定`)
  })
})

// ---------------- 圆打包（群岛地形的底层布局） ----------------

/** 测试用半径：面积 ∝ 词数（packCircles 只关心 r 本身） */
const radiusOf = (count) => 20 + Math.sqrt(Math.max(count, 1)) * 3.2
const mapNodes = () =>
  morphemes.map((m) => ({
    id: m.id,
    r: radiusOf((index.wordsByMorph.get(m.id) || []).length),
  }))

check('packCircles：铺满全部词素（不丢节点）', () => {
  const input = mapNodes()
  const { nodes } = packCircles(input)
  assert(nodes.length === input.length, `期望 ${input.length}，实际 ${nodes.length}`)
  nodes.forEach((n) => {
    assert(Number.isFinite(n.x) && Number.isFinite(n.y), `${n.id} 坐标非有限`)
  })
})

check('packCircles：任意两圆不重叠（含间距）', () => {
  const { nodes } = packCircles(mapNodes(), { gap: 9 })
  let worst = Infinity
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i]
      const b = nodes[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      const gap = d - a.r - b.r
      if (gap < worst) worst = gap
      assert(gap > 0, `${a.id} 与 ${b.id} 重叠（间隙 ${gap.toFixed(2)}）`)
    }
  }
  assert(worst < 12, `布局过于松散，最小间隙 ${worst.toFixed(2)}`)
})

check('packCircles：包围盒覆盖所有圆', () => {
  const { nodes, bounds } = packCircles(mapNodes())
  nodes.forEach((n) => {
    assert(n.x - n.r >= bounds.minX - 1e-6, `${n.id} 超出左边界`)
    assert(n.x + n.r <= bounds.maxX + 1e-6, `${n.id} 超出右边界`)
    assert(n.y - n.r >= bounds.minY - 1e-6, `${n.id} 超出上边界`)
    assert(n.y + n.r <= bounds.maxY + 1e-6, `${n.id} 超出下边界`)
  })
  assert(
    Math.abs(bounds.width - (bounds.maxX - bounds.minX)) < 1e-6 &&
      Math.abs(bounds.height - (bounds.maxY - bounds.minY)) < 1e-6,
    '包围盒尺寸不自洽',
  )
})

check('packCircles：确定性（同输入两次结果一致）', () => {
  const a = packCircles(mapNodes()).nodes
  const b = packCircles(mapNodes()).nodes
  // 打包内部按 (r,id) 排序，输出顺序即排序后顺序，可逐项比对
  a.forEach((n, i) => {
    assert(
      n.id === b[i].id && Math.abs(n.x - b[i].x) < 1e-9 && Math.abs(n.y - b[i].y) < 1e-9,
      `${n.id} 位置不确定`,
    )
  })
})

check('packCircles：椭圆铺开（纵横比）仍不重叠、且更贴合宽画布', () => {
  const ax = Math.sqrt(1.8)
  const ay = 1 / ax
  const flat = packCircles(mapNodes(), { gap: 17 }).bounds
  const wide = packCircles(mapNodes(), { gap: 17, aspectX: ax, aspectY: ay }).bounds
  const { nodes } = packCircles(mapNodes(), { gap: 17, aspectX: ax, aspectY: ay })
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i]
      const b = nodes[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      assert(d - a.r - b.r > 0, `${a.id} 与 ${b.id} 重叠`)
    }
  }
  assert(wide.width / wide.height > flat.width / flat.height, '纵横比应被拉宽')
  assert(Math.abs((wide.width * wide.height) / (flat.width * flat.height) - 1) < 0.35, '面积应大致守恒')
})

check('packCircles：空输入安全', () => {
  const r = packCircles([])
  assert(r.nodes.length === 0, '空输入应返回空数组')
  assert(r.bounds.width === -Infinity || Number.isNaN(r.bounds.width) || r.bounds.width === 0, '空输入包围盒应退化')
})

// ---------------- 自我网络 ----------------

check('buildWordEgo：中心词存在，边连到中心或同源词', () => {
  const w = words.find((x) => x.morphs.length > 0)
  const ego = buildWordEgo(w, index)
  const center = ego.nodes.find((n) => n.isCenter)
  assert(center && center.kind === 'word' && center.word.id === w.id, '中心词节点缺失')
  assert(ego.links.length > 0, '没有连线')
  assert(
    ego.nodes.every((n) => n.kind === 'word' || n.kind === 'morph'),
    '出现未知节点类型',
  )
})

check('buildWordEgo：同源词上限生效', () => {
  const w = words.find((x) => (index.wordsByMorph.get(x.morphs[0]) || []).length > 30) || words[0]
  const ego = buildWordEgo(w, index, { maxSiblings: 5 })
  const siblings = ego.nodes.filter((n) => n.kind === 'word' && !n.isCenter)
  assert(siblings.length <= 5, `同源词 ${siblings.length} > 5`)
})

check('buildMorphEgo：中心词素 + 其下单词', () => {
  const m = morphemes.find((x) => (index.wordsByMorph.get(x.id) || []).length > 0)
  const ego = buildMorphEgo(m, index)
  assert(ego.nodes[0].isCenter && ego.nodes[0].kind === 'morph', '中心词素缺失')
  assert(ego.nodes.length === 1 + Math.min((index.wordsByMorph.get(m.id) || []).length, 24), '节点数不符')
})

// ---------------- 掌握量着色 ----------------

check('statusCounts：三态之和 = 总数', () => {
  const s = statusCounts(words.slice(0, 50), {})
  assert(s.known + s.review + s.unknown === s.total, '三态之和不等于总数')
})

check('statusCounts：已掌握的词计入 known', () => {
  const w = words[0]
  const s = statusCounts([w], { [w.id]: { status: 'known', consecutiveCorrect: 2 } })
  assert(s.known === 1, `expected known=1, got ${s.known}`)
})

check('masteryColor：0% 沙岛、满 绿岛、区间草丘', () => {
  const [sand, hill, green] = MAP_PALETTE
  assert(masteryTier(0, 10) === 0 && masteryColor(0, 10) === sand.stroke, '0% 应为沙岛')
  assert(masteryTier(10, 10) === 2 && masteryColor(10, 10) === green.stroke, '100% 应为绿岛')
  assert(masteryTier(5, 10) === 1 && masteryColor(5, 10) === hill.stroke, '50% 应为草丘')
  assert(masterySoft(0, 10) === sand.fill, '0% 填充应为沙色')
  assert(masterySoft(10, 10) === green.fill, '100% 填充应为绿色')
})

// ---------------- 岛屿轮廓（已迁至 scripts/test-atlas.mjs） ----------------

console.log(`\n---------- 图模型测试汇总：PASS=${pass}  FAIL=${fail} ----------\n`)
if (fail > 0) process.exit(1)

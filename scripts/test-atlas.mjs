/**
 * 群岛地形单元测试：src/lib/atlas.js
 * 执行：npm run test:atlas
 *
 * 口径：**一座岛 = 一个词素**，按类型分 3 大板块，板块内按来源+词频档分子群岛簇。
 */
import { morphemes, words } from '../src/data/index.js'
import { buildIndex } from '../src/lib/derive.js'
import {
  TYPE_ORDER,
  atlasSummary,
  buildAtlas,
  coastPath,
  coastPoints,
  houseSpots,
  islandRadius,
  plantSpots,
  rockSpots,
  shade,
} from '../src/lib/atlas.js'

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
const atlas = buildAtlas(morphemes, index)
const summary = atlasSummary(atlas)
const islands = atlas.islands

console.log(
  `数据规模：词素 ${morphemes.length} · 单词 ${words.length} · 板块 ${atlas.stats.regionCount} · 子簇 ${atlas.stats.clusterCount} · 岛屿 ${atlas.stats.islandCount}`,
)

// ---------------- 海岸线 ----------------

function anchorRadii(cx, cy, d) {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number)
  const pts = [[n[0], n[1]]]
  for (let i = 2; i + 1 < n.length; i += 6) pts.push([n[i + 4], n[i + 5]])
  return pts.map(([x, y]) => Math.hypot(x - cx, y - cy))
}

check('海岸线：确定性（同种子同形）、闭合、无 NaN', () => {
  const a = coastPath(0, 0, 40, 12345)
  assert(a === coastPath(0, 0, 40, 12345), '同输入应产生完全相同的海岸线')
  assert(a !== coastPath(0, 0, 40, 999), '不同种子应产生不同海岸线')
  assert(a.startsWith('M') && a.endsWith('Z'), '路径应以 M 开头、Z 结尾')
  assert(!a.includes('NaN'), '路径里出现了 NaN')
})

check('海岸线：控制点数 12~16，且不同岛点数会变化（形状不复用）', () => {
  const nums = []
  for (let s = 1; s <= 400; s += 7) nums.push(coastPoints(s * 13))
  assert(Math.min(...nums) >= 12 && Math.max(...nums) <= 16, `控制点数越界 ${Math.min(...nums)}~${Math.max(...nums)}`)
  assert(new Set(nums).size >= 4, '控制点数几乎不变 → 岛形会雷同')
})

check('海岸线：半径恒在 [0.42R, 1.2R]（海湾够深、岬角不越界）', () => {
  let minS = Infinity
  let maxS = -Infinity
  islands.forEach((s) => {
    anchorRadii(s.x, s.y, coastPath(s.x, s.y, s.R, s.seed)).forEach((r) => {
      minS = Math.min(minS, r / s.R)
      maxS = Math.max(maxS, r / s.R)
    })
  })
  assert(minS >= 0.41, `最小半径 ${minS.toFixed(3)}R 低于下限`)
  assert(maxS <= 1.21, `最大半径 ${maxS.toFixed(3)}R 超出上限`)
  assert(minS < 0.72, '没有足够深的海湾')
  assert(maxS > 1.08, '没有足够凸的岬角')
})

check('海岸线：每座岛都凹凸明显，不是正圆', () => {
  islands.forEach((s) => {
    const rs = anchorRadii(s.x, s.y, coastPath(s.x, s.y, s.R, s.seed))
    const spread = Math.max(...rs) - Math.min(...rs)
    assert(spread > s.R * 0.25, `${s.label} 的海岸线太规整（起伏 ${(spread / s.R).toFixed(2)}R）`)
  })
})

check('海岸线：手绘重描线与主轮廓同源但不同（抖动感）', () => {
  const s = islands[0]
  const main = coastPath(s.x, s.y, s.R, s.seed)
  const rough = coastPath(s.x, s.y, s.R, s.seed, { rough: true })
  assert(main !== rough, '重描线应不同')
  const a = anchorRadii(s.x, s.y, main)
  const b = anchorRadii(s.x, s.y, rough)
  assert(a.length === b.length, '控制点数量应一致')
  let maxDiff = 0
  a.forEach((r, i) => {
    maxDiff = Math.max(maxDiff, Math.abs(r - b[i]) / s.R)
  })
  assert(maxDiff < 0.12, `重描线偏离过大（${maxDiff.toFixed(3)}R）`)
})

// ---------------- 礁石 / 尺寸 / 明暗 ----------------

check('礁石：每座岛 2~4 块，都在自己岛外、且不飞太远', () => {
  islands.forEach((s) => {
    const rocks = rockSpots(s.x, s.y, s.R, s.seed)
    assert(rocks.length >= 2 && rocks.length <= 4, `${s.label} 礁石数 ${rocks.length}`)
    rocks.forEach((rk) => {
      assert(Number.isFinite(rk.x) && Number.isFinite(rk.y), `${s.label} 礁石坐标非有限`)
      const d = Math.hypot(rk.x - s.x, rk.y - s.y)
      assert(d > s.R * 1.05, `${s.label} 有礁石落进岛里`)
      assert(d + rk.r < s.R * 1.95, `${s.label} 有礁石飘得太远`)
    })
  })
})

check('islandRadius：单调不减、落在 10~42，且层次够开', () => {
  assert(islandRadius(21, 21, 861) === 10, '最小词数应取下限 10')
  assert(islandRadius(861, 21, 861) >= 40, '最大词数应接近上限 42')
  assert(islandRadius(50, 21, 861) <= islandRadius(300, 21, 861), '词多半径不该更小')
  const rs = islands.map((s) => s.R)
  assert(Math.max(...rs) >= 40 && Math.min(...rs) <= 12, `实际半径 ${Math.min(...rs)}~${Math.max(...rs)}`)
})

check('岛上小屋：间数随词数 1~5，且都在岛内', () => {
  islands.slice(0, 120).forEach((s) => {
    const houses = houseSpots(s.x, s.y, s.R, s.seed, s.wordCount)
    assert(houses.length >= 1 && houses.length <= 5, `${s.label} 小屋 ${houses.length} 间`)
    houses.forEach((h) => {
      assert(Math.hypot(h.x - s.x, h.y - s.y) < s.R, `${s.label} 有房子掉进海里`)
      assert(h.s > 0, `${s.label} 房子尺寸非法`)
    })
  })
  // 词越多、房子越多
  assert(
    houseSpots(0, 0, 40, 1, 300).length > houseSpots(0, 0, 40, 1, 20).length,
    '词多的岛应该有更多房子',
  )
})

check('岛上植被：数量随掌握度增长（0 掌握 = 不长树）', () => {
  const bare = plantSpots(0, 0, 40, 7, 0)
  assert(bare.length === 0, `未掌握不该长植被，实际 ${bare.length} 株`)
  const half = plantSpots(0, 0, 40, 7, 0.5)
  const full = plantSpots(0, 0, 40, 7, 1)
  assert(half.length > 0 && full.length >= half.length, '掌握度越高植被应越多越密')
  full.forEach((p) => {
    assert(Math.hypot(p.x, p.y) < 40, '植被长到海里了')
    assert(p.kind === 1 || p.kind === 2, `植被造型非法 ${p.kind}`)
    assert(p.s > 0, '植被尺寸非法')
  })
  // 确定性
  assert(JSON.stringify(full) === JSON.stringify(plantSpots(0, 0, 40, 7, 1)), '植被分布应确定')
})

check('shade：提亮变亮、变暗变暗，且不改长度', () => {
  assert(shade('#808080', 0.2) > '#808080', '提亮应产生更大的十六进制值')
  assert(shade('#808080', -0.2) < '#808080', '变暗应产生更小的十六进制值')
  assert(/^#[0-9a-f]{6}$/i.test(shade('#f4fcff', -0.09)), '输出应仍是 6 位十六进制')
  assert(shade('#ffffff', 0.5) === '#ffffff', '纯白提亮仍是纯白')
  assert(shade('#000000', -0.5) === '#000000', '纯黑变暗仍是纯黑')
})

// ---------------- 结构：1 岛 = 1 词素 ----------------

check('一座岛 = 一个词素：岛数 = 词素数，且一一对应', () => {
  assert(islands.length === morphemes.length, `岛 ${islands.length} 座 vs 词素 ${morphemes.length}`)
  const ids = new Set(islands.map((s) => s.morph.id))
  assert(ids.size === morphemes.length, '有词素没有对应的岛')
  morphemes.forEach((m) => assert(ids.has(m.id), `词素 ${m.id} 没有岛`))
})

check('共 3 大板块，按词根 / 前缀 / 后缀划分', () => {
  assert(atlas.regions.length === 3, `应有 3 块，实际 ${atlas.regions.length}`)
  const types = atlas.regions.map((a) => a.type).sort()
  assert(types.join(',') === [...TYPE_ORDER].sort().join(','), `类型不符：${types.join(',')}`)
  atlas.regions.forEach((a) => {
    assert(
      a.islands.every((s) => s.type === a.type),
      `${a.name} 里混进了别的类型的岛`,
    )
  })
})

check('每座板块内的岛数 = 该类型词素数', () => {
  atlas.regions.forEach((a) => {
    const expect = morphemes.filter((m) => m.type === a.type).length
    assert(a.islands.length === expect, `${a.name}：${a.islands.length} ≠ ${expect}`)
  })
})

check('每块板块都分出 ≥2 个子群岛簇，且簇内岛数 > 0', () => {
  atlas.regions.forEach((a) => {
    assert(a.clusters.length >= 2, `${a.name} 只有 ${a.clusters.length} 个子簇`)
    a.clusters.forEach((c) => assert(c.islands.length > 0 && c.label, `${a.name} 有空簇`))
    const sum = a.clusters.reduce((s, c) => s + c.islands.length, 0)
    assert(sum === a.islands.length, `${a.name} 子簇岛数之和 ${sum} ≠ ${a.islands.length}`)
  })
})

// ---------------- 形状唯一 / 不重叠 / 间距 ----------------

check('每座岛形状都不同：种子全唯一，且海岸线路径不全相同', () => {
  const seeds = islands.map((s) => s.seed)
  assert(new Set(seeds).size === seeds.length, '存在重复的岛形种子（会复用模板）')
  const sample = islands.slice(0, 60).map((s) => coastPath(s.x, s.y, s.R, s.seed))
  assert(new Set(sample).size === sample.length, '有岛屿共用同一条海岸线')
})

check('同板块内岛与岛不重叠（中心距 > 1.2×(两岛半径和)）', () => {
  atlas.regions.forEach((a) => {
    const list = a.islands
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const x = list[i]
        const y = list[j]
        const d = Math.hypot(x.x - y.x, x.y - y.y)
        assert(d > (x.R + y.R) * 1.2, `${a.name}：${x.label} 与 ${y.label} 重叠（${Math.round(d)}）`)
      }
    }
  })
})

check('三大板块彼此分离（中心距 > 两块包围半径之和）', () => {
  const as = atlas.regions
  for (let i = 0; i < as.length; i += 1) {
    for (let j = i + 1; j < as.length; j += 1) {
      const d = Math.hypot(as[i].center.x - as[j].center.x, as[i].center.y - as[j].center.y)
      assert(d > as[i].radius + as[j].radius, `${as[i].name} 与 ${as[j].name} 挨得太近`)
    }
  }
})

check('每块板块有一位"主岛"（本板块词最多的词素），且它最大', () => {
  atlas.regions.forEach((a) => {
    const mains = a.islands.filter((s) => s.isMain)
    assert(mains.length === 1, `${a.name} 主岛数量 ${mains.length}`)
    const main = mains[0]
    const maxWords = Math.max(...a.islands.map((s) => s.wordCount))
    assert(main.wordCount === maxWords, `${a.name} 主岛不是词最多的词素`)
    assert(maxWords > 0, `${a.name} 主岛词数为 0`)
  })
})

check('三块板块的配色与地形互不相同', () => {
  const keys = atlas.regions.map((a) => `${a.theme.terrain}|${a.theme.tier.join()}|${a.theme.ink}`)
  assert(new Set(keys).size === 3, '存在两块板块配色/地形相同')
  atlas.regions.forEach((a) => {
    assert(a.theme.tier.length >= 3, `${a.name} 配色档位不足`)
    assert(/^#[0-9a-f]{6}$/i.test(a.theme.ink), `${a.name} 描边色不合法`)
    assert(typeof a.theme.feature === 'string' && a.theme.feature.length > 6, `${a.name} 缺少特征说明`)
  })
})

// ---------------- 报告 ----------------

check('atlasSummary：类型名称 / 中心坐标 / 岛数 / 子簇 / 主岛 / 特征', () => {
  assert(summary.length === 3, '摘要应为 3 条')
  summary.forEach((s) => {
    assert(typeof s.name === 'string' && s.name.includes('群岛'), `${s.type} 名称缺失`)
    assert(Array.isArray(s.center) && s.center.length === 2, `${s.type} 中心坐标缺失`)
    assert(Number.isFinite(s.center[0]) && Number.isFinite(s.center[1]), `${s.type} 中心坐标非有限`)
    assert(s.islandCount === morphemes.filter((m) => m.type === s.type).length, `${s.type} 岛数不符`)
    assert(s.clusterCount >= 2 && s.clusters.length === s.clusterCount, `${s.type} 子簇信息不符`)
    assert(typeof s.mainIsland === 'string' && s.mainIsland.length > 0, `${s.type} 主岛名缺失`)
    assert(typeof s.features === 'string' && s.features.length > 6, `${s.type} 特征说明缺失`)
  })
  const centers = summary.map((s) => s.center.join(','))
  assert(new Set(centers).size === 3, '存在两块板块中心重合')
})

console.log(`\n---------- 群岛地形测试汇总：PASS=${pass}  FAIL=${fail} ----------\n`)
if (fail > 0) process.exit(1)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ORIGINS, TYPES, effectiveStatus } from '../lib/derive.js'
import {
  MAP_PALETTE,
  buildMorphEgo,
  buildWordEgo,
  masteryTier,
  radialEgoLayout,
  statusCounts,
} from '../lib/graph.js'
import { buildAtlas, coastPath, houseSpots, plantSpots, rockSpots, shade } from '../lib/atlas.js'
import { RELATION_META, pairKey, relationsOf } from '../lib/relations.js'
import { CUTE_FONT, Compass, House, Landmark, Plant } from './landmarks.jsx'

const WORD_STATUS_COLOR = { known: '#9aa1ac', review: '#c98a17', unknown: '#c9484b' }
const WORD_STATUS_SOFT = { known: '#f1f3f6', review: '#fdf3e0', unknown: '#fdeaea' }

const BUBBLE_MAX = 12 // 气泡同时最多几个
const INK = '#4b3f2e'

// ---------------------------------------------------------------- 取样工具（气泡用）

function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = (seed * 9301 + 49297) % 233280 || 1
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function pickSample(morphs, index, n, seed) {
  const pool = morphs
    .map((m) => ({ m, c: (index.wordsByMorph.get(m.id) || []).length }))
    .filter((x) => x.c > 0)
  if (!pool.length) return []
  const shuffled = seededShuffle(pool, seed)
  const big = [...shuffled].sort((a, b) => b.c - a.c).slice(0, Math.ceil(n * 0.5))
  const bigIds = new Set(big.map((x) => x.m.id))
  const rest = shuffled.filter((x) => !bigIds.has(x.m.id)).slice(0, n - big.length)
  return [...big, ...rest].map((x) => x.m)
}

// ---------------------------------------------------------------- 地图零件

/** 海面：明亮高饱和青蓝 + 波浪纹 + 四周压暗 */
function SeaDefs() {
  return (
    <defs>
      <linearGradient id="wrcSea" x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" stopColor="#9de6f7" />
        <stop offset="0.55" stopColor="#63cdea" />
        <stop offset="1" stopColor="#33a8d4" />
      </linearGradient>
      <pattern id="wrcWaves" width="132" height="132" patternUnits="userSpaceOnUse">
        <path d="M10 28 q8 -8 16 0 t16 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.62" />
        <path d="M74 84 q8 -8 16 0 t16 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
        <path d="M36 110 q6 -6 12 0 t12 0" fill="none" stroke="#d6f4ff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      </pattern>
      <radialGradient id="wrcVignette" cx="50%" cy="40%" r="80%">
        <stop offset="0.5" stopColor="#1c6f92" stopOpacity="0" />
        <stop offset="1" stopColor="#1c6f92" stopOpacity="0.26" />
      </radialGradient>
    </defs>
  )
}

// ---------------------------------------------------------------- 气泡漂流

function BubbleCloud({ morphs, index, records, width, height, onSelect }) {
  const counter = useRef(0)
  const rnd01 = (s) => {
    const x = Math.sin(s * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }

  const makeBubble = (morph, seed) => {
    const ws = index.wordsByMorph.get(morph.id) || []
    const r = Math.max(34, Math.min(70, Math.round(28 + Math.sqrt(ws.length) * 5.2)))
    return {
      key: `${morph.id}-${seed}`,
      morph,
      r,
      x: 0.08 + rnd01(seed * 1.7) * 0.76,
      dur: 11 + rnd01(seed * 3.1) * 7,
      delay: 0,
    }
  }

  const [bubbles, setBubbles] = useState(() => {
    const pool = pickSample(morphs, index, BUBBLE_MAX, 11)
    return pool.map((m, i) => {
      const b = makeBubble(m, i + 1)
      return { ...b, delay: -(i * (b.dur / BUBBLE_MAX)) }
    })
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const pool = morphs.filter((m) => (index.wordsByMorph.get(m.id) || []).length > 0)
      if (!pool.length) return
      const m = pool[Math.floor(Math.random() * pool.length)]
      counter.current += 1
      const b = makeBubble(m, counter.current * 97 + 13)
      setBubbles((prev) => [...prev.slice(1), b])
    }, 1600)
    return () => clearInterval(timer)
  }, [morphs, index])

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200"
      style={{ width, height, background: 'linear-gradient(180deg, #9de6f7 0%, #63cdea 55%, #33a8d4 100%)' }}
    >
      <style>{`@keyframes wrcRise{0%{transform:translate(-50%,0);opacity:0}8%{opacity:1}88%{opacity:1}100%{transform:translate(-50%,-${height + 240}px);opacity:0}}`}</style>

      {bubbles.map((b) => {
        const s = statusCounts(index.wordsByMorph.get(b.morph.id) || [], records)
        const pal = MAP_PALETTE[masteryTier(s.known, s.total)]
        return (
          <button
            key={b.key}
            onClick={() => onSelect(b.morph.id)}
            className="absolute rounded-full flex flex-col items-center justify-center select-none transition-transform hover:scale-105"
            style={{
              left: `${b.x * 100}%`,
              bottom: -b.r * 2,
              width: b.r * 2,
              height: b.r * 2,
              background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${pal.fill} 62%, ${pal.fill} 100%)`,
              border: `2px solid ${pal.stroke}88`,
              boxShadow: `0 12px 28px ${pal.stroke}22, inset 0 2px 10px rgba(255,255,255,.9)`,
              animation: `wrcRise ${b.dur}s linear infinite`,
              animationDelay: `${b.delay}s`,
            }}
          >
            <span className="font-semibold leading-tight" style={{ color: INK, fontSize: Math.max(12, Math.round(b.r * 0.33)), fontFamily: CUTE_FONT }}>
              {b.morph.display.split(' / ')[0]}
            </span>
            <span style={{ color: '#4a6b7a', fontSize: Math.max(9, Math.round(b.r * 0.2)), fontFamily: CUTE_FONT }}>
              {s.total} 词 · 未掌握 {s.total - s.known}
            </span>
          </button>
        )
      })}

      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-slate-600 bg-white/85 backdrop-blur rounded-xl px-3 py-1.5 border border-white/70 shadow-sm">
        {MAP_PALETTE.map((p) => (
          <span key={p.name} className="flex items-center gap-1" style={{ fontFamily: CUTE_FONT }}>
            <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: p.fill, border: `1.6px solid ${p.stroke}` }} />
            {p.name}
          </span>
        ))}
        <span style={{ color: '#4a6b7a', fontFamily: CUTE_FONT }}>气泡越大 = 词越多</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 主组件

/**
 * 总览：卡通风「群岛地图」—— **一座岛 = 一个词素**（全库 678 座岛），
 * 按 词根 / 前缀 / 后缀 分成 3 大板块，板块内再按来源+词频档分成子群岛簇。
 *
 * - root  → 火山熔岩型（橙红 / 活火山 / 黑礁石）
 * - prefix→ 热带植被型（亮绿 / 棕榈 / 白沙）
 * - suffix→ 冰雪岩石型（冰白 / 雪峰 / 冷蓝）
 *
 * 一屏看三大板块；点板块标题牌飞过去，就能看清每座岛的形状与岛名。
 * 点任意小岛 → 进该词素的关系网。
 */
export default function NetworkView({
  morphemes,
  words,
  index,
  records,
  visibleMorphs,
  relationIndex,
  focusWordId = null,
  onSelectMorph,
  onSelectWord,
  onOpenFocus,
  width = 880,
  height = 620,
}) {
  const [mode, setMode] = useState('map') // 'map' | 'bubble'
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState(null) // null | { kind:'word'|'morph', id }
  const [showSynonyms, setShowSynonyms] = useState(true)
  const [showAntonyms, setShowAntonyms] = useState(true)
  const [hover, setHover] = useState(null) // 岛 id
  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 })

  const wrapRef = useRef(null)
  const dragRef = useRef(null)
  const lastDragMoved = useRef(false)

  // 整张群岛地图（纯结构，与学习记录解耦）
  const atlas = useMemo(() => buildAtlas(morphemes, index), [morphemes, index])
  const islandById = useMemo(() => new Map(atlas.islands.map((s) => [s.id, s])), [atlas])

  useEffect(() => {
    if (focusWordId && index.wordById.has(focusWordId)) {
      setMode('map')
      setFocus({ kind: 'word', id: focusWordId })
    }
  }, [focusWordId, index])

  const fitView = useCallback(() => {
    const b = atlas.bounds
    if (!b || !Number.isFinite(b.width) || b.width <= 0) return
    const k = Math.max(0.1, Math.min((width / b.width) * 0.94, (height / b.height) * 0.94, 1.6))
    const cx = (b.minX + b.maxX) / 2
    const cy = (b.minY + b.maxY) / 2
    setTf({ k, x: width / 2 - cx * k, y: height / 2 - cy * k })
  }, [atlas, width, height])

  useEffect(() => {
    if (mode === 'map' && !focus) fitView()
  }, [mode, focus, fitView])

  /** 飞到某块板块（那里岛够大，能看清形状与岛名） */
  const zoomToRegion = useCallback(
    (region) => {
      const box = region.radius * 1.5
      const k = Math.max(0.15, Math.min(width / box, height / box, 5))
      setTf({ k, x: width / 2 - region.center.x * k, y: height / 2 - region.center.y * k })
    },
    [width, height],
  )

  /** 飞到某个子群岛（同一来源的那一团岛） */
  const zoomToCluster = useCallback(
    (c) => {
      const box = c.radius * 2.6
      const k = Math.max(0.15, Math.min(width / box, height / box, 6))
      setTf({ k, x: width / 2 - c.x * k, y: height / 2 - c.y * k })
    },
    [width, height],
  )

  // 滚轮缩放（原生监听才能 preventDefault）
  useEffect(() => {
    const el = wrapRef.current
    if (!el || mode !== 'map' || focus) return undefined
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      setTf((t) => {
        const k = Math.max(0.12, Math.min(10, t.k * factor))
        const s = k / t.k
        return { k, x: mx - (mx - t.x) * s, y: my - (my - t.y) * s }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [mode, focus])

  const zoomBy = (factor) =>
    setTf((t) => {
      const k = Math.max(0.12, Math.min(10, t.k * factor))
      const s = k / t.k
      const cx = width / 2
      const cy = height / 2
      return { k, x: cx - (cx - t.x) * s, y: cy - (cy - t.y) * s }
    })

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    dragRef.current = { px: e.clientX, py: e.clientY, ox: tf.x, oy: tf.y, moved: false, pid: e.pointerId }
  }
  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.px
    const dy = e.clientY - d.py
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      d.moved = true
      // 真正开始拖动才捕获指针 —— 按下即捕获会把 click 重定向到 SVG 根，点岛会失效
      if (e.currentTarget.setPointerCapture && d.pid != null) {
        try {
          e.currentTarget.setPointerCapture(d.pid)
        } catch {
          /* 指针已释放 */
        }
      }
    }
    if (d.moved) setTf((t) => ({ ...t, x: d.ox + dx, y: d.oy + dy }))
  }
  const endDrag = (e) => {
    const d = dragRef.current
    lastDragMoved.current = !!(d && d.moved)
    dragRef.current = null
    if (e.currentTarget.releasePointerCapture && e.pointerId != null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* 指针已释放 */
      }
    }
  }

  // 下钻：单词 / 词素自我网络；语义端点不在派生图时补成外围小节点。
  const graph = useMemo(() => {
    let base = null
    if (focus && focus.kind === 'word') {
      const word = index.wordById.get(focus.id)
      if (word) base = buildWordEgo(word, index)
    } else if (focus && focus.kind === 'morph') {
      const morph = index.morphById.get(focus.id)
      if (morph) base = buildMorphEgo(morph, index)
    }
    if (!base) return null

    const laidOut = { ...base, nodes: radialEgoLayout(base.nodes, { width, height }) }
    if (!relationIndex || (!showSynonyms && !showAntonyms)) return { ...laidOut, semanticLinks: [] }

    const nodes = [...laidOut.nodes]
    const sourceNodes = nodes.filter((node) => node.kind === 'word' && node.word)
    const nodeByWordId = new Map(sourceNodes.map((node) => [node.word.id, node]))
    const semanticLinks = []
    const seenLinks = new Set()
    const addLinks = (sourceNode, neighbors, type) => {
      neighbors.forEach((neighbor) => {
        const linkKey = `${type}:${pairKey(sourceNode.word.id, neighbor.id)}`
        if (seenLinks.has(linkKey)) return
        seenLinks.add(linkKey)
        let targetNode = nodeByWordId.get(neighbor.id)
        if (!targetNode) {
          const word = index.wordById.get(neighbor.id)
          if (!word) return
          targetNode = {
            id: `semantic:${word.id}`,
            kind: 'word',
            label: word.form,
            word,
            isSemanticPeripheral: true,
            x: width / 2,
            y: height / 2,
          }
          nodes.push(targetNode)
          nodeByWordId.set(word.id, targetNode)
        }
        semanticLinks.push({
          source: sourceNode.id,
          target: targetNode.id,
          type,
          grade: neighbor.grade,
          note: neighbor.note || '',
        })
      })
    }
    sourceNodes.forEach((node) => {
      /* ★ 必须用 node.word.id，不是 node.id ★
         node.id 是**带前缀**的图节点 id（graph.js 的
         `id: \`word:${word.id}\``，为了让 word:/morph: 两类节点不撞 id），
         而 relationsOf / relationIndex 的键是**词条 id**（w.calm）。
         传 node.id ⇒ 永远查不到 ⇒ **语义关系连线一条都画不出来**。

         这个 bug 的隐蔽性在于：它不报错、不白屏，只是「近义/反义连线凭空消失」，
         而 e2e 里那条断言又恰好写成了 `q('svg line')`（实现用 <path>），
         于是**断言与 bug 互相掩护**：断言本来就永远为假，所以没人发现连线其实也没画。 */
      const related = relationsOf(relationIndex, node.word.id)
      if (showSynonyms) addLinks(node, related.synonyms, 'synonym')
      if (showAntonyms) addLinks(node, related.antonyms, 'antonym')
    })

    const peripheral = nodes.filter((node) => node.isSemanticPeripheral)
    const radiusX = Math.max(120, width / 2 - 78)
    const radiusY = Math.max(90, height / 2 - 66)
    peripheral.forEach((node, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(1, peripheral.length)
      node.x = width / 2 + Math.cos(angle) * radiusX
      node.y = height / 2 + Math.sin(angle) * radiusY
    })
    return { ...laidOut, nodes, semanticLinks }
  }, [focus, index, relationIndex, showSynonyms, showAntonyms, width, height])

  const focusById = useMemo(() => (graph ? new Map(graph.nodes.map((n) => [n.id, n])) : new Map()), [graph])
  const overall = useMemo(() => statusCounts(words, records), [words, records])
  const centerId = useMemo(() => (graph ? graph.nodes.find((n) => n.isCenter)?.id || null : null), [graph])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    /* ★★ K6：精确匹配置顶（主链路搜索缺陷）★★
     *
     * 症状：用户输入一个词，**命中数超过下拉上限**时，他要找的那个词
     * 恰好排在第 9 位之后 ⇒ 搜了、看到下拉、但**选不到自己输入的词**。
     *
     * 实测（均匀抽样 500 个词形，命中数 > 8 的 35 个里 17 个选不到 = 48.6%；
     * 架构师在真实查询上测得 55.9%）：例
     *   搜 hi  → 命中 2012 个，hi 排第 **613** 位
     *   搜 of  → 命中  404 个
     *   搜 mel → 命中  131 个
     *
     * ★ 触发条件是「命中数 > 上限」，与词频/字母序无关 ★
     *   词库不是严格字母序（实测 `严格字母序？false`），但无论按什么顺序，
     *   只要精确匹配的那个词排在第 9 位之后，它就必然被截断掉。
     *
     * 修法：**精确匹配项排在最前**，再做 slice。
     *   为什么不能靠「按长度/词频排序」—— 那只能降低概率，不能消除；
     *   用户输入的就是那个词，最该出现在第一条。
     *
     * ★ 为什么这不是「无关紧要的小体验问题」★
     *   这是**搜索主链路**：`hitWords` 有 8 条上限，而精确匹配往往排在后面。
     *   用户搜不到自己要搜的词，会以为「这个词库里没有」——
     *   而它其实在词库里。这是 48.6% 概率的**主链路失败**，不是排序偏好。
     */
    const allWordHits = words.filter(
      (w) => w.form.toLowerCase().includes(q) || (w.gloss || '').toLowerCase().includes(q),
    )
    // 精确匹配：form 全等（不分大小写，已把 q 归一化过）
    const exactWords = allWordHits.filter((w) => w.form.toLowerCase() === q)
    const otherWords = allWordHits.filter((w) => w.form.toLowerCase() !== q)
    // ★ 稳定排序：精确组内保留原序（词库序），两组拼接后再截断
    const hitWords = [...exactWords, ...otherWords].slice(0, 8)

    // 词素侧同形问题、同一手法（上限 6）
    const allMorphHits = morphemes.filter((m) =>
      [m.form, m.display, m.gloss, m.glossEn, ...(m.variants || [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q)),
    )
    // ★ 词素的「精确匹配」要覆盖多个字段：form / display / variants 任一全等
    //   （词素常以变体形式被搜索，只比 form 会漏）
    const isExactMorph = (m) =>
      [m.form, m.display, ...(m.variants || [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase() === q)
    const exactMorphs = allMorphHits.filter(isExactMorph)
    const otherMorphs = allMorphHits.filter((m) => !isExactMorph(m))
    const hitMorphs = [...exactMorphs, ...otherMorphs].slice(0, 6)

    return { hitWords, hitMorphs, totalWords: allWordHits.length, totalMorphs: allMorphHits.length }
  }, [query, words, morphemes])

  const wordColor = (word) => {
    const s = effectiveStatus(word, records)
    return { stroke: WORD_STATUS_COLOR[s], fill: WORD_STATUS_SOFT[s] }
  }

  /** 点岛（单击 / 双击都一样）→ 直接进聚焦视图，以这座词素岛为中心看它的一簇同源词 */
  const clickIsland = (island) => {
    if (lastDragMoved.current) return
    if (onOpenFocus) onOpenFocus(island.morph.id)
    else setFocus({ kind: 'morph', id: island.morph.id })
  }

  const pickWord = (w) => {
    setQuery('')
    setFocus({ kind: 'word', id: w.id })
    if (onSelectWord) onSelectWord(w)
  }
  const pickMorph = (m) => {
    setQuery('')
    setFocus({ kind: 'morph', id: m.id })
  }

  const hoverIsland = hover ? islandById.get(hover) : null

  /**
   * 群岛图层：整体套在 <g transform>，缩放平移由 SVG 变换完成。
   * 描边 / 字号 / 装饰都反比于缩放比 → 视觉恒定。
   * 分级渲染（LOD）：缩得小只画岛体，放大才出手绘重描线 / 礁石 / 进度环 / 岛名，
   * 否则 678 座岛会产生几千条路径、又糊又卡。
   */
  const atlasLayer = useMemo(() => {
    const inv = 1 / tf.k
    /** 卡通描边：随岛等比变粗，但限制在 0.5~2.4 屏幕像素之间（缩小时不糊成一团） */
    const strokeFor = (R) => Math.min(Math.max(R * 0.2, 0.5 * inv), 2.4 * inv)
    const roughW = Math.max(0.5, 0.9 * inv)
    return (
      <>
        {atlas.regions.map((a) => (
          <g key={a.id}>
            {/* 板块浅滩：整块外围一圈淡淡的浅水色，暗示"这里是一整块群岛" */}
            <circle cx={a.center.x} cy={a.center.y} r={a.radius * 1.02} fill="#eafcff" opacity={0.22} />
            {a.islands.map((isl) => {
              const theme = isl.theme
              const agg = statusCounts(isl.words, records)
              const ratio = agg.total ? agg.known / agg.total : 0
              const tier = ratio >= 0.66 ? 2 : ratio >= 0.33 ? 1 : 0
              const fill = shade(theme.tier[tier], isl.variant)
              const coast = coastPath(isl.x, isl.y, isl.R, isl.seed)
              const isHover = hover === isl.id
              const renderedR = isl.R * tf.k
              const showDetail = renderedR >= 6 // 手绘重描线
              const showRocks = renderedR >= 13
              const showRing = renderedR >= 15
              const showDecor = renderedR >= 11 // 房子 + 植被
              const labelFont = Math.min(isl.R * 0.42, 13 * inv)
              const labelFits = isl.label.length * labelFont * 0.56 <= isl.R * 2.3
              const showLabel = isHover || (renderedR >= 13 && labelFits)
              const showSub = renderedR >= 30
              const houses = showDecor ? houseSpots(isl.x, isl.y, isl.R, isl.seed, isl.wordCount) : []
              const plants = showDecor ? plantSpots(isl.x, isl.y, isl.R, isl.seed, ratio) : []
              const ringScale = 1.32
              const ringW = Math.max(isl.R * 0.2, 0.7 * inv)
              return (
                <g
                  key={isl.id}
                  onClick={() => clickIsland(isl)}
                  onMouseEnter={() => setHover(isl.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  {showRocks &&
                    rockSpots(isl.x, isl.y, isl.R, isl.seed).map((rk) => (
                      <path
                        key={rk.seed}
                        d={coastPath(rk.x, rk.y, rk.r, rk.seed, { points: 7 })}
                        fill={shade(theme.tier[0], -0.08)}
                        stroke={theme.ink}
                        strokeWidth={Math.max(0.5, 0.9 * inv)}
                        strokeLinejoin="round"
                      />
                    ))}
                  {showDetail && (
                    <path d={coastPath(isl.x, isl.y, isl.R, isl.seed, { rough: true })} fill="none" stroke={theme.ink} strokeWidth={roughW} opacity={0.38} strokeLinejoin="round" />
                  )}
                  <path
                    d={coast}
                    fill={fill}
                    stroke={theme.ink}
                    strokeWidth={isHover ? strokeFor(isl.R) * 1.8 : strokeFor(isl.R)}
                    strokeLinejoin="round"
                  />
                  {/* 岛上的村子：间数随词数增长 */}
                  {houses.map((h, hi) => (
                    <House key={`h${hi}`} x={h.x} y={h.y} s={h.s} flip={h.flip} theme={theme} inv={inv} />
                  ))}
                  {/* 植被：掌握度越高长得越密 */}
                  {plants.map((p, pi) => (
                    <Plant key={`p${pi}`} x={p.x} y={p.y} s={p.s} kind={p.kind} theme={theme} inv={inv} />
                  ))}
                  {showRing && (
                    <g transform={`translate(${isl.x},${isl.y}) scale(${ringScale}) translate(${-isl.x},${-isl.y})`}>
                      <path d={coast} fill="none" stroke={theme.ink} strokeOpacity={0.16} strokeWidth={ringW} pathLength={100} strokeLinecap="round" />
                      {ratio > 0.001 && (
                        <path
                          d={coast}
                          fill="none"
                          stroke={theme.accent}
                          strokeWidth={ringW}
                          pathLength={100}
                          strokeDasharray={`${(ratio * 100).toFixed(1)} 100`}
                          strokeLinecap="round"
                        />
                      )}
                    </g>
                  )}
                  {/* 主岛（本板块词最多的词素）：放大 + 主题地标 */}
                  {isl.isMain && renderedR >= 10 && (
                    <g transform={`translate(${isl.x},${isl.y + isl.R * 0.04})`}>
                      <Landmark kind={theme.terrain} s={isl.R * 0.4} inv={inv} />
                    </g>
                  )}
                  {showLabel && (
                    <text
                      x={isl.x}
                      y={isl.y + isl.R * 1.55}
                      textAnchor="middle"
                      fontSize={labelFont}
                      fontWeight={700}
                      fill={theme.ink}
                      stroke="#ffffff"
                      strokeWidth={3 * inv}
                      strokeLinejoin="round"
                      style={{ fontFamily: CUTE_FONT, paintOrder: 'stroke' }}
                      pointerEvents="none"
                    >
                      {isl.label}
                    </text>
                  )}
                  {showSub && (
                    <text
                      x={isl.x}
                      y={isl.y + isl.R * 1.55 + 14 * inv}
                      textAnchor="middle"
                      fontSize={Math.min(isl.R * 0.3, 11 * inv)}
                      fontWeight={600}
                      fill={theme.ink}
                      opacity={0.72}
                      stroke="#ffffff"
                      strokeWidth={2.6 * inv}
                      strokeLinejoin="round"
                      style={{ fontFamily: CUTE_FONT, paintOrder: 'stroke' }}
                      pointerEvents="none"
                    >
                      {isl.wordCount} 词
                    </text>
                  )}
                </g>
              )
            })}
            {/* 子群岛标题（点它飞到这一团岛） */}
            {a.clusters.map((c) => {
              const font = Math.min(c.radius * 0.16, 12 * inv)
              if (font * tf.k < 7.5) return null
              const w = c.title.length * font * 0.62
              const h = font * 1.7
              return (
                <g key={c.id} className="cursor-pointer" onClick={() => zoomToCluster(c)}>
                  <rect
                    x={c.titleAnchor.x - w / 2}
                    y={c.titleAnchor.y - h * 0.74}
                    width={w}
                    height={h}
                    rx={h / 2}
                    fill="#ffffff"
                    fillOpacity={0.8}
                    stroke={a.theme.ink}
                    strokeOpacity={0.35}
                    strokeWidth={Math.max(0.5, 0.9 * inv)}
                  />
                  <text
                    x={c.titleAnchor.x}
                    y={c.titleAnchor.y}
                    textAnchor="middle"
                    fontSize={font}
                    fontWeight={700}
                    fill={a.theme.ink}
                    pointerEvents="none"
                    style={{ fontFamily: CUTE_FONT }}
                  >
                    {c.title}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlas, tf.k, records, hover])

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
          {[
            ['map', '群岛地图'],
            ['bubble', '气泡漂流'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`px-3.5 py-1 text-sm rounded-lg transition-colors ${
                mode === k ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'map' && !focus && (
          <>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="查找单词 / 词根词缀…"
                className="w-56 px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              {results && (results.hitWords.length > 0 || results.hitMorphs.length > 0) && (
                <div className="absolute z-30 mt-1 w-72 max-h-80 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 text-sm">
                  {results.hitWords.length > 0 && (
                    <div className="text-[11px] text-slate-400 px-2 pt-1 pb-0.5 flex items-center gap-1.5">
                      <span>单词</span>
                      {/* ★ 被截断时诚实告知总数 —— 否则用户以为「只有这些」★ */}
                      {results.totalWords > results.hitWords.length && (
                        <span className="text-slate-400">
                          · 精确匹配已置顶，共 {results.totalWords} 个
                        </span>
                      )}
                    </div>
                  )}
                  {results.hitWords.map((w) => {
                    const exact = w.form.toLowerCase() === query.trim().toLowerCase()
                    return (
                      <button
                        key={w.id}
                        onClick={() => pickWord(w)}
                        className={`w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 flex justify-between gap-2 ${
                          exact ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <span className="font-medium text-slate-700">
                          {exact && <span className="text-blue-500 mr-0.5" aria-hidden="true">★</span>}
                          {w.form}
                        </span>
                        <span className="text-slate-400 truncate">{w.gloss}</span>
                      </button>
                    )
                  })}
                  {results.hitMorphs.length > 0 && <div className="text-[11px] text-slate-400 px-2 pt-1.5 pb-0.5">词根 / 词缀</div>}
                  {results.hitMorphs.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => pickMorph(m)}
                      className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 flex justify-between gap-2"
                    >
                      <span className="font-medium" style={{ color: TYPES[m.type].color }}>
                        {m.display}
                      </span>
                      <span className="text-slate-400 truncate">{m.gloss}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="inline-flex items-center gap-1">
              {atlas.regions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => zoomToRegion(a)}
                  title={`飞到${a.name}`}
                  className="px-2 py-1 text-xs rounded-lg border shadow-sm hover:brightness-[1.03]"
                  style={{ borderColor: a.theme.ink, color: a.theme.ink, background: `${a.theme.tier[0]}` }}
                >
                  {a.icon} {a.theme.archName.replace('群岛', '')}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">单击进关系网 · 双击进聚焦 · 滚轮缩放</span>
          </>
        )}

        {focus && (
          <button
            onClick={() => setFocus(null)}
            className="px-3 py-1 text-sm rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            ← 返回群岛
          </button>
        )}

        {focus && (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-pressed={showSynonyms}
              onClick={() => setShowSynonyms((value) => !value)}
              className="px-2.5 py-1 text-xs rounded-full border transition-colors"
              style={{
                color: showSynonyms ? '#166534' : '#64748b',
                borderColor: showSynonyms ? '#86efac' : '#cbd5e1',
                background: showSynonyms ? '#dcfce7' : '#f8fafc',
              }}
            >
              近义
            </button>
            <button
              type="button"
              aria-pressed={showAntonyms}
              onClick={() => setShowAntonyms((value) => !value)}
              className="px-2.5 py-1 text-xs rounded-full border transition-colors"
              style={{
                color: showAntonyms ? '#991b1b' : '#64748b',
                borderColor: showAntonyms ? '#fca5a5' : '#cbd5e1',
                background: showAntonyms ? '#fee2e2' : '#f8fafc',
              }}
            >
              反义
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 bg-white/70 rounded-xl px-3 py-1 border border-slate-200">
          <span>
            全库 <b className="text-slate-700">{overall.total}</b> 词
          </span>
          <span className="text-[#0f9d3f]">已掌握 {overall.known}</span>
          <span className="text-[#d9a02c]">待复习 {overall.review}</span>
          <span className="text-[#e2673a]">未掌握 {overall.unknown}</span>
        </div>
      </div>

      {mode === 'bubble' ? (
        <BubbleCloud
          morphs={visibleMorphs && visibleMorphs.length ? visibleMorphs : morphemes}
          index={index}
          records={records}
          width={width}
          height={height}
          onSelect={(id) => {
            setMode('map')
            setFocus({ kind: 'morph', id })
          }}
        />
      ) : (
        <div
          className="relative"
          ref={wrapRef}
          data-atlas-regions={atlas.stats.regionCount}
          data-atlas-archipelagos={atlas.stats.regionCount}
          data-atlas-clusters={atlas.stats.clusterCount}
          data-atlas-islands={atlas.stats.islandCount}
        >
          <svg
            width={width}
            height={height}
            className="rounded-2xl border border-slate-200 touch-none select-none"
            style={{ cursor: dragRef.current ? 'grabbing' : focus ? 'default' : 'grab', fontFamily: CUTE_FONT }}
            onPointerDown={focus ? undefined : onPointerDown}
            onPointerMove={focus ? undefined : onPointerMove}
            onPointerUp={focus ? undefined : endDrag}
            onPointerLeave={focus ? undefined : endDrag}
          >
            <SeaDefs />
            <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#wrcSea)" />
            <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#wrcWaves)" />
            <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#wrcVignette)" />

            {graph ? (
              <>
                {(graph.semanticLinks || []).map((link) => {
                  const sourceNode = focusById.get(link.source)
                  const targetNode = focusById.get(link.target)
                  if (!sourceNode || !targetNode) return null
                  const meta = RELATION_META[link.type]
                  const grade = Number.isInteger(link.grade) ? Math.max(1, Math.min(3, link.grade)) : 2
                  return (
                    /* ★ data-testid 供 e2e 断言（QA 实测出的断言 bug 修复）★
                       qa-harness 原来断言 `q('svg line').length > 0` 来验证
                       「词关系网有连线」，而这里渲染的是 <path> —— 那个断言
                       **结构上永远不可能为真**（项目刻意不画 <line>）。
                       也不能改成数 `svg path`：海岸线/浪花/岛屿全是 path，
                       直接数会假绿。⇒ 用专属 testid 与装饰性 path 区分。 */
                    <path
                      key={`${link.type}:${pairKey(link.source, link.target)}`}
                      data-testid="relation-link"
                      d={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                      fill="none"
                      stroke={meta.color}
                      strokeWidth={meta.width[grade - 1]}
                      strokeDasharray={meta.dash}
                      strokeLinecap="round"
                      opacity={0.62}
                    />
                  )
                })}
                {graph.links.map((l, i) => {
                  const a = focusById.get(l.source)
                  const b = focusById.get(l.target)
                  if (!a || !b) return null
                  const active =
                    (hover && (l.source === hover || l.target === hover)) ||
                    (centerId && (l.source === centerId || l.target === centerId))
                  return (
                    <path
                      key={i}
                      d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                      fill="none"
                      stroke={active ? '#3f7f9c' : '#9fc9dd'}
                      strokeWidth={active ? 1.8 : 1.1}
                      opacity={active ? 0.95 : 0.35}
                    />
                  )
                })}
                {graph.nodes.map((n) => {
                  const r =
                    n.kind === 'word' ? (n.isCenter ? 14 : 7) : Math.round(9 + Math.min(20, Math.sqrt(n.count || 1) * 2.6))
                  const isHover = hover === n.id
                  let fill = '#ffffff'
                  let stroke = '#3f7f9c'
                  if (n.kind === 'word') {
                    const c = wordColor(n.word)
                    fill = c.fill
                    stroke = c.stroke
                  } else {
                    const s = statusCounts(n.words, records)
                    const pal = MAP_PALETTE[masteryTier(s.known, s.total)]
                    fill = pal.fill
                    stroke = pal.stroke
                  }
                  const showLabel = n.kind === 'morph' ? r >= 20 || isHover : n.isCenter || !!focus
                  const showSub = n.kind === 'morph' && r >= 28
                  return (
                    <g
                      key={n.id}
                      onClick={() => {
                        if (n.kind === 'morph') {
                          if (focus && focus.kind === 'morph' && focus.id === n.morph.id) onSelectMorph(n.morph.id)
                          else setFocus({ kind: 'morph', id: n.morph.id })
                        } else if (n.word) {
                          setFocus({ kind: 'word', id: n.word.id })
                          if (onSelectWord) onSelectWord(n.word)
                        }
                      }}
                      onMouseEnter={() => setHover(n.id)}
                      onMouseLeave={() => setHover(null)}
                      className="cursor-pointer"
                    >
                      {n.isSemanticPeripheral ? (
                        <>
                          <rect
                            x={n.x - 34}
                            y={n.y - 11}
                            width={68}
                            height={22}
                            rx={8}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isHover ? 2.2 : 1.4}
                          />
                          <text
                            x={n.x}
                            y={n.y + 3.5}
                            textAnchor="middle"
                            fontSize={9.5}
                            fontWeight={700}
                            fill={INK}
                            style={{ fontFamily: CUTE_FONT }}
                            pointerEvents="none"
                          >
                            {n.label.length > 11 ? `${n.label.slice(0, 10)}…` : n.label}
                          </text>
                        </>
                      ) : (
                        <>
                          <circle cx={n.x} cy={n.y} r={r + 2} fill="#ffffff" opacity={0.75} />
                          <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={stroke} strokeWidth={isHover || n.isCenter ? 2.6 : 1.6} />
                          <circle cx={n.x - r * 0.3} cy={n.y - r * 0.34} r={Math.max(2, r * 0.16)} fill="#ffffff" opacity={0.75} />
                          {showLabel && (
                            <text
                              x={n.x}
                              y={n.y + (showSub ? -1 : r * 0.32)}
                              textAnchor="middle"
                              fontSize={n.kind === 'word' ? 9.5 : Math.max(11, Math.min(18, r * 0.5))}
                              fontWeight={700}
                              fill={INK}
                              stroke="#ffffff"
                              strokeWidth={2.4}
                              strokeLinejoin="round"
                              style={{ fontFamily: CUTE_FONT, paintOrder: 'stroke' }}
                              pointerEvents="none"
                            >
                              {n.label}
                            </text>
                          )}
                          {showSub && (
                            <text
                              x={n.x}
                              y={n.y + 13}
                              textAnchor="middle"
                              fontSize={10}
                              fill={INK}
                              opacity={0.6}
                              stroke="#ffffff"
                              strokeWidth={2.2}
                              strokeLinejoin="round"
                              style={{ fontFamily: CUTE_FONT, paintOrder: 'stroke' }}
                              pointerEvents="none"
                            >
                              {n.count} 词
                            </text>
                          )}
                        </>
                      )}
                    </g>
                  )
                })}
              </>
            ) : (
              <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>{atlasLayer}</g>
            )}

            <rect x={10} y={10} width={Math.max(0, width - 20)} height={Math.max(0, height - 20)} rx={13} fill="none" stroke="#ffffff" strokeWidth={3.5} opacity={0.7} pointerEvents="none" />
            <rect
              x={18}
              y={18}
              width={Math.max(0, width - 36)}
              height={Math.max(0, height - 36)}
              rx={10}
              fill="none"
              stroke="#eafcff"
              strokeWidth={2}
              strokeDasharray="10 8"
              opacity={0.9}
              pointerEvents="none"
            />
            {!focus && <Compass x={width - 48} y={height - 48} r={24} />}
          </svg>

          {/* 板块标题牌（跟着地图走，点它飞过去） */}
          {!focus && mode === 'map' &&
            atlas.regions.map((a) => {
              const sx = a.titleAnchor.x * tf.k + tf.x
              const sy = a.titleAnchor.y * tf.k + tf.y
              if (sx < -180 || sx > width + 180 || sy < -90 || sy > height + 90) return null
              return (
                <button
                  key={a.id}
                  onClick={() => zoomToRegion(a)}
                  title={`飞到${a.name}`}
                  className="absolute whitespace-nowrap shadow-md hover:brightness-[1.04]"
                  style={{
                    left: Math.max(120, Math.min(width - 120, sx)),
                    top: Math.max(30, sy),
                    transform: 'translate(-50%,-100%)',
                    background: 'rgba(255,255,255,.94)',
                    border: `2.5px solid ${a.theme.ink}`,
                    color: a.theme.ink,
                    fontFamily: CUTE_FONT,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: '4px 10px',
                  }}
                >
                  {a.icon} {a.name}
                  <span style={{ opacity: 0.7, fontSize: 11, marginLeft: 6 }}>
                    {a.islands.length} 岛 · {a.clusters.length} 簇
                  </span>
                </button>
              )
            })}

          {/* 缩放控件 */}
          {!focus && mode === 'map' && (
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {[
                ['＋', () => zoomBy(1.25)],
                ['－', () => zoomBy(1 / 1.25)],
                ['⤢', fitView],
              ].map(([label, fn]) => (
                <button
                  key={label}
                  onClick={fn}
                  title={label === '⤢' ? '重置视图' : label === '＋' ? '放大' : '缩小'}
                  className="w-9 h-9 rounded-full bg-white/95 backdrop-blur border border-sky-200 text-sky-700 hover:bg-white shadow-md text-sm leading-none"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {focus && focus.kind === 'morph' && (
            <button
              onClick={() => onSelectMorph(focus.id)}
              className="absolute top-3 left-3 px-3 py-1.5 text-xs rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              进入聚焦视图（看这一簇同源词）→
            </button>
          )}

          {(hoverIsland || (graph && hover)) && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur border border-sky-100 shadow-md rounded-xl px-3 py-2 text-xs max-w-64 pointer-events-none">
              {hoverIsland ? (
                <>
                  <div className="font-semibold text-slate-800" style={{ fontFamily: CUTE_FONT }}>
                    {hoverIsland.theme.icon} {hoverIsland.label}
                    {hoverIsland.isMain ? ' · 主岛' : ''}
                  </div>
                  <div className="text-slate-500 mt-0.5" style={{ fontFamily: CUTE_FONT }}>
                    {TYPES[hoverIsland.morph.type].label} · {ORIGINS[hoverIsland.origin]?.label || hoverIsland.origin} ·{' '}
                    {hoverIsland.morph.gloss}
                  </div>
                  {(() => {
                    const s = statusCounts(hoverIsland.words, records)
                    return (
                      <div className="text-slate-400 mt-1">
                        {s.total} 词 · 已掌握 {s.known} · 待复习 {s.review} · 未掌握 {s.unknown} · 点击看关系网
                      </div>
                    )
                  })()}
                </>
              ) : (
                <>
                  <div className="font-semibold text-slate-800">{focusById.get(hover)?.word?.form}</div>
                  <div className="text-slate-600 mt-0.5">{focusById.get(hover)?.word?.gloss}</div>
                </>
              )}
            </div>
          )}

          {/* 图例 */}
          <div className="absolute bottom-3 left-3 bg-white/92 backdrop-blur rounded-xl px-3 py-1.5 border border-white/70 shadow-sm">
            <div className="flex items-center gap-3 text-[11px] text-slate-700" style={{ fontFamily: CUTE_FONT }}>
              {focus ? (
                <>
                  <span className="flex items-center gap-1">
                    <svg width="24" height="8" aria-hidden="true">
                      <path d="M 1 4 L 23 4" fill="none" stroke="#3f7f9c" strokeWidth="1.6" />
                    </svg>
                    实线 = 派生
                  </span>
                  <span className="flex items-center gap-1" style={{ color: RELATION_META.synonym.color }}>
                    <svg width="24" height="8" aria-hidden="true">
                      <path d="M 1 4 L 23 4" fill="none" stroke={RELATION_META.synonym.color} strokeWidth="2" strokeDasharray={RELATION_META.synonym.dash} />
                    </svg>
                    虚线 = 近义
                  </span>
                  <span className="flex items-center gap-1" style={{ color: RELATION_META.antonym.color }}>
                    <svg width="24" height="8" aria-hidden="true">
                      <path d="M 1 4 L 23 4" fill="none" stroke={RELATION_META.antonym.color} strokeWidth="2" strokeDasharray={RELATION_META.antonym.dash} />
                    </svg>
                    点线 = 反义
                  </span>
                </>
              ) : (
                <>
                  {atlas.regions.map((a) => (
                    <span key={a.id} className="flex items-center gap-1">
                      <span
                        className="inline-block w-3.5 h-3.5"
                        style={{ background: a.theme.tier[0], border: `1.8px solid ${a.theme.ink}`, borderRadius: '48% 52% 46% 54%' }}
                      />
                      {a.theme.archName.replace('群岛', '')}
                    </span>
                  ))}
                  <span className="text-slate-400">
                    {`${atlas.stats.islandCount} 座岛（1 岛 = 1 词素）· 岛越大词越多 · 圈 = 已掌握 · 屋 = 词多 · 树 = 学得多`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

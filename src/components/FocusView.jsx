import React, { useEffect, useMemo, useState } from 'react'
import { STATUS, TYPES, ORIGINS, effectiveStatus, autoKnown, isManual, freqBand, cefrScore } from '../lib/derive.js'
import { radialLayout, fontSizeByFreq } from '../lib/layout.js'
import { THEMES, coastPath } from '../lib/atlas.js'
import { hashId } from '../lib/graph.js'
import { CUTE_FONT, Compass, Landmark, starPoints } from './landmarks.jsx'
import BulkActionBar from './BulkActionBar.jsx'

/** 图上最多渲染的单词数：词根下可能挂几百词，全画会糊成一团 */
const FOCUS_CAP = 120
/** 以单词为中心时，同源词最多画几个 */
const EGO_CAP = 24
const INK = '#3f3323'

/**
 * 聚焦视图：以某座"词素岛"为中心的那一小片群岛。
 * 视觉与「群岛地图」完全一致 —— 同一个海面、同一套卡通描边与地标。
 * 点任意单词 → 以那个单词为中心重新布局（词素链 + 同源词）。
 */
export default function FocusView({
  morph,
  index,
  records,
  orderBy = 'cefr',
  width = 880,
  height = 620,
  onSelectWord,
  onOpenMorph,
  selectedWordId,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onMarkKnown,
  onSetReview,
  onReset,
  onBackToMap,
  /* ★ C-02：「加入小站」的透传 props（G1 第 2 处调用点）★
     默认值 = 空对象 → 按钮不渲染，既有调用点行为完全不变。 */
  addToStationProps = {},
}) {
  const [hover, setHover] = useState(null)
  const [centerWord, setCenterWord] = useState(null)
  const cx = width / 2
  const cy = height / 2
  const maxRadius = Math.max(160, Math.min(width, height) / 2 - 46)
  const theme = THEMES[morph.type]
  const centerR = Math.max(48, Math.min(78, width * 0.07))
  const centerSeed = hashId(`focus.${morph.id}`)

  const nodes = useMemo(() => {
    const sortKey = orderBy === 'freq' ? (w) => w.freqRank : (w) => cefrScore(w) * 100000 + w.freqRank / 1000
    const capped = [...morph.words].sort((a, b) => sortKey(a) - sortKey(b)).slice(0, FOCUS_CAP)
    return radialLayout(capped, { cx, cy, sortKey, minRadius: centerR + 74, maxRadius })
  }, [morph, orderBy, cx, cy, maxRadius, centerR])

  const ringCount = nodes.length ? Math.max(...nodes.map((n) => n.ring)) + 1 : 1
  const ringGapActual = ringCount > 1 ? Math.max(18, (maxRadius - centerR - 74) / (ringCount - 1)) : 92
  const typeCfg = TYPES[morph.type]
  const known = nodes.filter((n) => effectiveStatus(n, records) === 'known').length

  // 换了词素 → 退出单词中心视图
  useEffect(() => {
    setCenterWord(null)
  }, [morph.id])

  /**
   * 单词 ego 布局：点一个单词后，它成为中心 ——
   * 第一圈是它的词素链（小岛），第二圈是共享这些词素的同源词。
   */
  const ego = useMemo(() => {
    if (!centerWord || !index) return null
    const chain = (centerWord.morphs || []).map((id) => index.morphById.get(id)).filter(Boolean)
    const sibMap = new Map()
    chain.forEach((m) =>
      (index.wordsByMorph.get(m.id) || []).forEach((w) => {
        if (w.id !== centerWord.id && !sibMap.has(w.id)) sibMap.set(w.id, { word: w, via: m.id })
      }),
    )
    const siblings = [...sibMap.values()]
      .sort((a, b) => cefrScore(a.word) - cefrScore(b.word))
      .slice(0, EGO_CAP)
    const r1 = centerR + 64
    const r2 = Math.min(maxRadius, r1 + 104)
    const morphNodes = chain.map((m, i) => {
      const a = -Math.PI / 2 + (i / Math.max(chain.length, 1)) * Math.PI * 2
      return { morph: m, x: cx + r1 * Math.cos(a), y: cy + r1 * Math.sin(a) }
    })
    const wordNodes = siblings.map((s, i) => {
      const a = (i / Math.max(siblings.length, 1)) * Math.PI * 2 + Math.PI / Math.max(siblings.length, 2)
      return { ...s, x: cx + r2 * Math.cos(a), y: cy + r2 * Math.sin(a) }
    })
    return { morphNodes, wordNodes, r1, r2 }
  }, [centerWord, index, cx, cy, maxRadius, centerR])

  /** 点单词 → 以它为中心（右侧栏同时显示它的详情） */
  const focusOnWord = (w) => {
    setCenterWord(w)
    onSelectWord?.(w)
  }

  return (
    <div className="relative">
      <svg width={width} height={height} className="rounded-2xl border border-slate-200" style={{ fontFamily: CUTE_FONT }}>
        <defs>
          <linearGradient id="focSea" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#9de6f7" />
            <stop offset="0.55" stopColor="#63cdea" />
            <stop offset="1" stopColor="#33a8d4" />
          </linearGradient>
          <pattern id="focWaves" width="132" height="132" patternUnits="userSpaceOnUse">
            <path d="M10 28 q8 -8 16 0 t16 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            <path d="M74 84 q8 -8 16 0 t16 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.36" />
          </pattern>
          <radialGradient id="focVignette" cx="50%" cy="40%" r="80%">
            <stop offset="0.5" stopColor="#1c6f92" stopOpacity="0" />
            <stop offset="1" stopColor="#1c6f92" stopOpacity="0.26" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#focSea)" />
        <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#focWaves)" />
        <rect x={0} y={0} width={width} height={height} rx={16} fill="url(#focVignette)" />

        {/* 难度参考环：虚线"等深线"（词素中心视图） */}
        {!ego &&
          Array.from({ length: Math.min(ringCount, 6) }).map((_, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={centerR + 74 + i * ringGapActual}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.4}
              strokeDasharray="7 9"
              opacity={0.5}
            />
          ))}

        {/* 单词中心视图的两圈"等深线" */}
        {ego && (
          <>
            <circle cx={cx} cy={cy} r={ego.r1} fill="none" stroke="#ffffff" strokeWidth={1.4} strokeDasharray="7 9" opacity={0.45} />
            <circle cx={cx} cy={cy} r={ego.r2} fill="none" stroke="#ffffff" strokeWidth={1.4} strokeDasharray="7 9" opacity={0.35} />
          </>
        )}

        {/* 航线（用 path，保持"没有 <line>"的好习惯） */}
        {!ego &&
          nodes.map((n) => {
            const st = effectiveStatus(n, records)
            return (
              <path
                key={`l-${n.id}`}
                d={`M${cx} ${cy}L${n.x} ${n.y}`}
                fill="none"
                stroke={STATUS[st].color}
                strokeWidth={n.id === selectedWordId ? 2.6 : 1.2}
                opacity={n.id === selectedWordId ? 0.75 : 0.28}
              />
            )
          })}

        {/* 单词中心视图的航线：中心词 → 词素链 → 同源词 */}
        {ego && (
          <>
            {ego.morphNodes.map((m) => (
              <path
                key={`el-${m.morph.id}`}
                d={`M${cx} ${cy}L${m.x} ${m.y}`}
                fill="none"
                stroke={theme.ink}
                strokeWidth={1.8}
                opacity={0.4}
              />
            ))}
            {ego.wordNodes.map((s) => {
              const st = effectiveStatus(s.word, records)
              const anchor = ego.morphNodes.find((m) => m.morph.id === s.via)
              if (!anchor) return null
              return (
                <path
                  key={`ew-${s.word.id}`}
                  d={`M${anchor.x} ${anchor.y}L${s.x} ${s.y}`}
                  fill="none"
                  stroke={STATUS[st].color}
                  strokeWidth={s.word.id === selectedWordId ? 2.4 : 1.1}
                  opacity={s.word.id === selectedWordId ? 0.75 : 0.26}
                />
              )
            })}
          </>
        )}

        {/* 中心：词素岛（词素中心视图） */}
        {!ego && (
          <g className="focus-center">
            <circle cx={cx} cy={cy} r={centerR * 1.16} fill="#eafcff" opacity={0.7} />
            <path
              d={coastPath(cx, cy, centerR, centerSeed)}
              fill={theme.tier[1]}
              stroke={theme.ink}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <path
              d={coastPath(cx, cy, centerR, centerSeed, { rough: true })}
              fill="none"
              stroke={theme.ink}
              strokeWidth={1.2}
              opacity={0.35}
              strokeLinejoin="round"
            />
            <g transform={`translate(${cx},${cy - centerR * 0.08})`}>
              <Landmark kind={theme.terrain} s={centerR * 0.52} inv={1} />
            </g>
            <polygon
              points={starPoints(centerR * 0.2)}
              transform={`translate(${cx},${cy - centerR * 1.34})`}
              fill="#ffd23f"
              stroke="#7a5a10"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <text x={cx} y={cy + centerR * 1.5} textAnchor="middle" fontSize={20} fontWeight={700} fill={theme.ink} stroke="#ffffff" strokeWidth={3.4} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>
              {morph.display.split(' / ')[0]}
            </text>
            <text x={cx} y={cy + centerR * 1.5 + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={theme.ink} opacity={0.8} stroke="#ffffff" strokeWidth={3} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>
              {typeCfg.label} · {ORIGINS[morph.origin]?.label ?? morph.origin} · {morph.words.length} 词（已掌握 {known}）
            </text>
          </g>
        )}

        {/* 中心：单词木牌（单词中心视图），点它看详情 */}
        {ego && centerWord && (
          <g
            className="focus-center cursor-pointer"
            onClick={() => onSelectWord?.(centerWord)}
            onMouseEnter={() => setHover(centerWord)}
            onMouseLeave={() => setHover(null)}
          >
            <circle cx={cx} cy={cy} r={centerR * 0.98} fill="#eafcff" opacity={0.75} />
            <rect
              x={cx - 88}
              y={cy - 24}
              width={176}
              height={48}
              rx={24}
              fill="#fffdf5"
              stroke={theme.ink}
              strokeWidth={2.8}
            />
            <text x={cx} y={cy + 2} textAnchor="middle" fontSize={17} fontWeight={700} fill={INK}>
              {centerWord.form}
            </text>
            <text x={cx} y={cy + 17} textAnchor="middle" fontSize={9.5} fill="#7c6a4d">
              {centerWord.pos} · {centerWord.gloss.length > 14 ? `${centerWord.gloss.slice(0, 14)}…` : centerWord.gloss}
            </text>
            <text x={cx} y={cy + centerR * 1.34} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={theme.ink} opacity={0.85} stroke="#ffffff" strokeWidth={3} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>
              {centerWord.chain.map((s) => s.form).join(' + ')}
            </text>
          </g>
        )}

        {/* 单词：一座座"小岛牌"（词素中心视图）—— 点单词以它为中心 */}
        {!ego &&
          nodes.map((n) => {
            const st = effectiveStatus(n, records)
            const cfg = STATUS[st]
            const weak = autoKnown(n) && !isManual(n, records)
            const size = weak ? 11 : fontSizeByFreq(n.freqRank)
            const isChecked = selectedIds?.has(n.id)
            const isHover = hover === n
            const w = n.form.length * size * 0.64 + 16
            const h = size * 1.85
            return (
              <g
                key={n.id}
                onClick={(e) => {
                  // Ctrl / Cmd / Shift + 点击 = 加入或移出多选，而不是换中心
                  if (e.ctrlKey || e.metaKey || e.shiftKey) {
                    e.stopPropagation()
                    onToggleSelect?.(n.id)
                  } else {
                    focusOnWord(n)
                  }
                }}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer focus-word"
              >
                <rect x={n.x - w / 2} y={n.y - h / 2 + 1.5} width={w} height={h} rx={h / 2} fill="#1c6f92" opacity={0.14} />
                <rect
                  x={n.x - w / 2}
                  y={n.y - h / 2}
                  width={w}
                  height={h}
                  rx={h / 2}
                  fill={n.id === selectedWordId ? cfg.soft : isChecked ? '#e8f4ff' : '#ffffffeb'}
                  stroke={isChecked ? '#2563eb' : isHover ? theme.ink : cfg.color}
                  strokeWidth={isChecked ? 2.6 : isHover ? 2.4 : 1.8}
                  strokeDasharray={isChecked ? '5 3' : undefined}
                  opacity={weak ? 0.6 : 1}
                />
                <text
                  x={n.x}
                  y={n.y + size * 0.36}
                  textAnchor="middle"
                  fontSize={size}
                  fontWeight={weak ? 500 : 700}
                  fill={weak ? '#5f6b76' : INK}
                  pointerEvents="none"
                >
                  {n.form}
                </text>
              </g>
            )
          })}

        {/* 单词中心视图：词素链小岛 + 同源词牌 */}
        {ego && (
          <>
            {ego.morphNodes.map((m) => {
              const seed = hashId(`ego.${m.morph.id}`)
              return (
                <g
                  key={m.morph.id}
                  onClick={() => onOpenMorph?.(m.morph.id)}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(m.morph)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={m.x} cy={m.y} r={24} fill="#eafcff" opacity={0.6} />
                  <path d={coastPath(m.x, m.y, 19, seed)} fill={theme.tier[0]} stroke={theme.ink} strokeWidth={2.2} strokeLinejoin="round" />
                  <text x={m.x} y={m.y + 34} textAnchor="middle" fontSize={12} fontWeight={700} fill={theme.ink} stroke="#ffffff" strokeWidth={3} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>
                    {(m.morph.display || m.morph.form).split(' / ')[0]}
                  </text>
                </g>
              )
            })}
            {ego.wordNodes.map((s) => {
              const st = effectiveStatus(s.word, records)
              const cfg = STATUS[st]
              const weak = autoKnown(s.word) && !isManual(s.word, records)
              const size = weak ? 10.5 : fontSizeByFreq(s.word.freqRank)
              const isChecked = selectedIds?.has(s.word.id)
              const isHover = hover === s.word
              const isCenterSel = s.word.id === selectedWordId
              const w = s.word.form.length * size * 0.64 + 16
              const h = size * 1.85
              return (
                <g
                  key={s.word.id}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                      e.stopPropagation()
                      onToggleSelect?.(s.word.id)
                    } else {
                      focusOnWord(s.word)
                    }
                  }}
                  onMouseEnter={() => setHover(s.word)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer focus-word"
                >
                  <rect x={s.x - w / 2} y={s.y - h / 2 + 1.5} width={w} height={h} rx={h / 2} fill="#1c6f92" opacity={0.12} />
                  <rect
                    x={s.x - w / 2}
                    y={s.y - h / 2}
                    width={w}
                    height={h}
                    rx={h / 2}
                    fill={isCenterSel ? cfg.soft : isChecked ? '#e8f4ff' : '#ffffffeb'}
                    stroke={isChecked ? '#2563eb' : isHover ? theme.ink : cfg.color}
                    strokeWidth={isChecked ? 2.6 : isHover ? 2.4 : 1.6}
                    strokeDasharray={isChecked ? '5 3' : undefined}
                    opacity={weak ? 0.6 : 1}
                  />
                  <text x={s.x} y={s.y + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={weak ? 500 : 700} fill={weak ? '#5f6b76' : INK} pointerEvents="none">
                    {s.word.form}
                  </text>
                </g>
              )
            })}
          </>
        )}

        {/* 画框 + 罗盘 */}
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
        <Compass x={width - 48} y={height - 48} r={24} />
      </svg>

      {/* 原路返回地图 */}
      <button
        onClick={() => onBackToMap?.()}
        className="absolute left-3 top-3 px-3 py-1.5 text-xs rounded-xl shadow-md hover:brightness-[1.05]"
        style={{ background: 'rgba(255,255,255,.95)', border: `2.5px solid ${theme.ink}`, color: theme.ink, fontFamily: CUTE_FONT, fontWeight: 700 }}
      >
        ← 返回群岛地图
      </button>

      {/* 单词中心视图 → 回到词素岛 */}
      {ego && (
        <button
          onClick={() => setCenterWord(null)}
          className="absolute left-3 top-11 px-3 py-1.5 text-xs rounded-xl shadow-md hover:brightness-[1.05]"
          style={{ background: '#fffdf5', border: `2px solid ${theme.ink}`, color: theme.ink, fontFamily: CUTE_FONT, fontWeight: 700 }}
        >
          ← 回到「{morph.display.split(' / ')[0]}」词素岛
        </button>
      )}

      {selectedIds?.size > 0 ? (
        <div className="absolute right-3 top-3 w-64 shadow-sm rounded-md">
          <BulkActionBar
            count={selectedIds.size}
            ids={[...selectedIds]}
            onMarkKnown={onMarkKnown}
            onSetReview={onSetReview}
            onReset={onReset}
            onClear={onClearSelection}
            layout="column"
            /* ★ G1 第 2 处调用点（聚焦视图浮层）★ */
            {...addToStationProps}
          />
        </div>
      ) : (
        <div className="absolute right-3 top-3 text-xs text-slate-500 bg-white/85 rounded px-2 py-1 border border-white/70" style={{ fontFamily: CUTE_FONT }}>
          点单词换中心 · 点中心词看详情 · Ctrl / Shift 多选
        </div>
      )}

      {morph.words.length > FOCUS_CAP && (
        <div className="absolute left-3 bottom-3 text-xs text-slate-600 bg-white/88 rounded px-2 py-1 border border-white/70 max-w-72" style={{ fontFamily: CUTE_FONT }}>
          这簇共 {morph.words.length} 词，图上按当前排序显示前 {FOCUS_CAP} 个；其余可在「列表」查看。
        </div>
      )}

      {hover && hover.chain && (
        <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-white/95 border border-sky-100 shadow-md rounded-xl px-3 py-2 text-xs max-w-80" style={{ fontFamily: CUTE_FONT }}>
          <div className="font-bold" style={{ color: INK }}>
            {hover.form} <span className="text-slate-400 font-normal">{hover.pos}</span>
          </div>
          <div className="text-slate-600">{hover.gloss}</div>
          <div className="text-slate-500 mt-1">{hover.chain.map((s) => `${s.form}(${s.gloss})`).join(' + ')}</div>
          <div className="text-slate-400 mt-1">
            {hover.cefr} · 词频 {freqBand(hover.freqRank).label}（{hover.freqRank}）
          </div>
        </div>
      )}
    </div>
  )
}

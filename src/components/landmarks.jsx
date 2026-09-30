/**
 * 卡通地形零件（群岛地图 / 聚焦视图共用）
 * 只用 polygon / path / circle / text —— 绝不出现 <line>，
 * 这样"地图里没有连线"这类断言不会被装饰元素误伤。
 */
import React from 'react'

export const CUTE_FONT = '"Segoe Print", "Comic Sans MS", "Microsoft YaHei", "PingFang SC", sans-serif'

/** 四角星顶点（罗盘 / 主岛标记） */
export function starPoints(R) {
  const inner = R * 0.3
  const pts = []
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const rr = i % 2 === 0 ? R : inner
    pts.push(`${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** 罗盘 */
export function Compass({ x, y, r = 26 }) {
  return (
    <g transform={`translate(${x},${y})`} opacity={0.95} pointerEvents="none">
      <circle r={r} fill="#ffffff" opacity={0.9} stroke="#3f7f9c" strokeWidth={1.6} />
      <polygon points={starPoints(r * 0.78)} fill="#fdfefe" stroke="#3f7f9c" strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={starPoints(r * 0.44)} fill="#ff5a3c" stroke="#c23a1e" strokeWidth={0.9} strokeLinejoin="round" />
      <circle r={2.2} fill="#3f7f9c" />
      <text y={-r * 0.98} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f7f9c" style={{ fontFamily: CUTE_FONT }}>
        N
      </text>
    </g>
  )
}

/** 主题地标：火山（熔岩锥） */
export function Volcano({ s, inv }) {
  const sw = Math.max(s * 0.075, 1.8 * inv)
  return (
    <g>
      <polygon points={`0,${-s} ${s * 0.95},${s * 0.55} ${-s * 0.95},${s * 0.55}`} fill="#c74a1c" stroke="#6d2409" strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`0,${-s} ${s * 0.34},${-s * 0.4} ${-s * 0.34},${-s * 0.4}`} fill="#ff8a2b" />
      <ellipse cx={0} cy={-s * 0.4} rx={s * 0.33} ry={s * 0.14} fill="#ffd23f" stroke="#6d2409" strokeWidth={sw * 0.7} />
      <path
        d={`M${-s * 0.12} ${-s * 0.28} q ${s * 0.2} ${s * 0.3} ${s * 0.04} ${s * 0.56}`}
        fill="none"
        stroke="#ff3d00"
        strokeWidth={Math.max(s * 0.13, 1.6 * inv)}
        strokeLinecap="round"
      />
    </g>
  )
}

/** 主题地标：棕榈（热带） */
export function Palm({ s, inv }) {
  const sw = Math.max(s * 0.14, 1.6 * inv)
  return (
    <g>
      <path d={`M0 ${s * 0.6} q ${s * 0.16} ${-s * 0.7} ${-s * 0.02} ${-s * 1.0}`} fill="none" stroke="#a9672c" strokeWidth={sw} strokeLinecap="round" />
      <path d={`M0 ${-s * 1.0} q ${-s * 0.8} ${-s * 0.26} ${-s * 1.05} ${s * 0.18}`} fill="none" stroke="#1f9c46" strokeWidth={sw} strokeLinecap="round" />
      <path d={`M0 ${-s * 1.0} q ${s * 0.8} ${-s * 0.26} ${s * 1.05} ${s * 0.18}`} fill="none" stroke="#1f9c46" strokeWidth={sw} strokeLinecap="round" />
      <path d={`M0 ${-s * 1.0} q ${-s * 0.2} ${-s * 0.46} ${-s * 0.42} ${-s * 0.5}`} fill="none" stroke="#25b352" strokeWidth={sw} strokeLinecap="round" />
      <circle cx={-s * 0.2} cy={-s * 0.82} r={Math.max(s * 0.13, 1.2 * inv)} fill="#b06f2e" stroke="#6d4318" strokeWidth={sw * 0.5} />
    </g>
  )
}

/** 主题地标：雪峰（冰雪） */
export function IcePeaks({ s, inv }) {
  const sw = Math.max(s * 0.07, 1.8 * inv)
  return (
    <g>
      <polygon points={`${-s * 0.98},${s * 0.55} ${-s * 0.34},${-s * 0.55} ${s * 0.16},${s * 0.55}`} fill="#ffffff" stroke="#1d5470" strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${-s * 0.34},${-s * 0.55} ${-s * 0.06},${s * 0.55} ${s * 0.16},${s * 0.55}`} fill="#cbe8f8" />
      <polygon points={`${s * 0.02},${s * 0.55} ${s * 0.52},${-s * 0.78} ${s * 1.0},${s * 0.55}`} fill="#f7fdff" stroke="#1d5470" strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={`${s * 0.52},${-s * 0.78} ${s * 0.74},${s * 0.55} ${s * 1.0},${s * 0.55}`} fill="#b6ddf2" />
    </g>
  )
}

export function Landmark({ kind, s, inv }) {
  if (kind === 'volcano') return <Volcano s={s} inv={inv} />
  if (kind === 'palm') return <Palm s={s} inv={inv} />
  return <IcePeaks s={s} inv={inv} />
}

/** 植被颜色（按生物群系） */
export const PLANT_COLOR = { root: '#3f7d3a', prefix: '#22a94f', suffix: '#6fb9d8' }

/** 岛上的植被：阔叶（kind 1）/ 针叶（kind 2）两种造型 */
export function Plant({ x, y, s, kind, theme, inv }) {
  const sw = Math.max(0.3, 0.42 * inv)
  const canopy = PLANT_COLOR[theme.key] || '#22a94f'
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-s * 0.11} y={s * 0.14} width={s * 0.22} height={s * 0.56} fill="#a9672c" stroke={theme.ink} strokeWidth={sw * 0.7} />
      {kind === 2 ? (
        <polygon
          points={`0,${-s} ${s * 0.6},${s * 0.28} ${-s * 0.6},${s * 0.28}`}
          fill={canopy}
          stroke={theme.ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ) : (
        <>
          <circle cx={0} cy={-s * 0.2} r={s * 0.62} fill={canopy} stroke={theme.ink} strokeWidth={sw} />
          <circle cx={s * 0.42} cy={s * 0.04} r={s * 0.4} fill={canopy} stroke={theme.ink} strokeWidth={sw} />
          <circle cx={-s * 0.42} cy={s * 0.02} r={s * 0.36} fill={canopy} stroke={theme.ink} strokeWidth={sw} />
        </>
      )}
    </g>
  )
}

/** 岛上的小房子（村子）：间数随词数增长 */
export function House({ x, y, s, flip, theme, inv }) {
  const w = s * 1.5
  const h = s * 1.05
  const sw = Math.max(0.32, 0.5 * inv)
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={s * 0.16} fill="#fffaf0" stroke={theme.ink} strokeWidth={sw} />
      <polygon
        points={`${-w * 0.64},${-h / 2} 0,${-h * 1.15} ${w * 0.64},${-h / 2}`}
        fill="#e2705f"
        stroke={theme.ink}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <rect
        x={flip > 0 ? -w * 0.34 : w * 0.06}
        y={-h * 0.06}
        width={w * 0.28}
        height={h * 0.56}
        rx={s * 0.05}
        fill={theme.ink}
        opacity={0.7}
      />
    </g>
  )
}

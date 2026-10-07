import React from 'react'
import { STATUS } from '../lib/derive.js'

/**
 * 三态状态徽标（已掌握 / 待复习 / 未知）
 * ------------------------------------------------------------------
 * 配色的**唯一来源是 `derive.js` 的 `STATUS`**（color / soft / icon / label），
 * 与 WordDetail、LearnHome 的统计卡视觉完全一致。
 *
 * ★ 组件不得硬编码颜色 ★（PRD 红线）：三态文案与配色都从 STATUS 读，
 *   将来调整配色只改 derive.js 一处，不会出现「小站里是绿的、学习页是黄的」。
 *
 * props:
 *   status  'known' | 'review' | 'unknown'（缺省按 unknown 处理）
 *   size    'sm' 列表行内（默认） | 'md' 卡片级
 *   showLabel 是否显示文字（默认 true；空间紧张时可只留色块 + icon）
 */
export default function StatusPill({ status = 'unknown', size = 'sm', showLabel = true }) {
  const cfg = STATUS[status] || STATUS.unknown
  const isSm = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border whitespace-nowrap ${
        isSm ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'
      }`}
      style={{ background: cfg.soft, borderColor: cfg.color, color: cfg.color }}
      title={cfg.label}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {showLabel && <span>{cfg.label}</span>}
      {isSm && !showLabel && <span className="sr-only">{cfg.label}</span>}
    </span>
  )
}

/**
 * 三色图例（列表头用）。
 *
 * 为什么需要它：行内有了色块之后，「那个颜色是什么意思」就成了新问题 ——
 * 尤其是色弱用户不能只靠颜色分辨。把三态并排写出来，成本极低。
 */
export function StatusLegend({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-slate-400">图例</span>
      {['unknown', 'review', 'known'].map((k) => (
        <StatusPill key={k} status={k} size="sm" />
      ))}
    </span>
  )
}

import React from 'react'
import { STATUS, effectiveStatus, autoKnown, isManual, freqBand, recordOf } from '../lib/derive.js'
import { statusLabel } from '../lib/learning.js'
import SpeakerButton from './SpeakerButton.jsx'

export default function WordRow({
  word,
  records,
  onSetStatus,
  onSelect,
  selected,
  showMorph = false,
  checked = false,
  onToggleCheck,
}) {
  const st = effectiveStatus(word, records)
  const rec = recordOf(word, records)
  const weak = autoKnown(word) && !isManual(word, records)
  const band = freqBand(word.freqRank)
  // 状态列同时显示 x/2（学习中 1/2 / 复习中 0/2 / 已掌握 / 未知）
  const label = statusLabel(rec)

  return (
    <div
      onClick={() => onSelect?.(word)}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-sm cursor-pointer ${
        selected ? 'border-blue-300 bg-blue-50' : checked ? 'border-blue-200 bg-blue-50/40' : 'border-transparent hover:bg-slate-50'
      } ${weak ? 'opacity-55' : ''}`}
    >
      {onToggleCheck && (
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          onClick={(e) => {
            e.stopPropagation()
            onToggleCheck(word.id, e.shiftKey)
          }}
          title="Shift 点击可连续多选"
          className="w-3.5 h-3.5 shrink-0 cursor-pointer accent-blue-600"
        />
      )}

      <div className="w-44 shrink-0 truncate">
        <span className="font-medium text-slate-800">{word.form}</span>
        <span className="text-slate-400 text-xs ml-1">{word.pos}</span>
      </div>

      {/* 喇叭：点一下即朗读该词；stopPropagation 不触发行选中 / 多选 */}
      <SpeakerButton text={word.form} size="xs" />

      <div className="flex-1 min-w-0 truncate text-slate-600 text-xs">{word.gloss}</div>

      {showMorph && (
        <div className="w-24 shrink-0 truncate text-xs text-slate-400">
          {word.morphs.join(' · ')}
        </div>
      )}

      <div className="w-40 shrink-0 truncate text-xs text-slate-400" title={word.chain.map((s) => `${s.form}=${s.gloss}`).join(' + ')}>
        {word.chain.map((s) => s.form).join('+')}
      </div>

      <div className="w-16 shrink-0 text-xs text-slate-400">{band.label} {word.freqRank}</div>
      <div className="w-8 shrink-0 text-xs font-medium text-slate-500">{word.cefr}</div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-xs whitespace-nowrap" style={{ color: STATUS[st].color }}>
          {label}
        </span>
        <div className="flex gap-0.5">
          {Object.entries(STATUS).map(([key, cfg]) => {
            const active = st === key
            return (
              <button
                key={key}
                title={cfg.label}
                onClick={(e) => {
                  e.stopPropagation()
                  onSetStatus(word.id, key)
                }}
                className="w-6 h-6 rounded text-xs border leading-none"
                style={{
                  background: active ? cfg.color : '#ffffff',
                  color: active ? '#ffffff' : cfg.color,
                  borderColor: cfg.color,
                  opacity: active ? 1 : 0.45,
                }}
              >
                {cfg.icon}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

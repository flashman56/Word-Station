/**
 * EtymologyPanel —— 词源故事面板
 * ------------------------------------------------------------------
 * 统一渲染词素词源：来源 / 原始形态 / 演变时间线 / 同源词（或同词素词）。
 * 数据来源（优先精编、缺失回退本地组合叙述）由 lib/etym.js 提供：
 *   - resolveEtymology(morph)：首次调用动态 import 精编数据（morph-etym.js，懒加载），
 *     键存在用精编（source='curated'），否则本地组合（source='composed'）。
 *   - 面板挂载即解析；加载中显示骨架态。
 *
 * ★ 措辞红线：精编数据用「同源词」；组合叙述只给「同词素词」（同源 ≠ 同词素）。
 * ★ 音标红线：本面板不显示任何音标。
 *
 * props:
 *   morph          词素对象（含 display/form/gloss/origin/note…；有 words 时组合叙述会带出同词素词）
 *   entry          可选：已解析的 EtymEntry（传入则跳过解析）
 *   defaultOpen    默认是否展开，默认 false
 *   onSelectWord   (wordId) => void，点击可跳转的同源词 / 同词素词
 *   onSelectMorph  (morphId) => void，点击可跳转的词素
 */
import React, { useEffect, useState } from 'react'
import { ORIGINS } from '../lib/derive.js'
import { composeEtymology, resolveEtymology } from '../lib/etym.js'

/** 来源 key → 中文标签（复用 derive.js ORIGINS） */
function originLabel(origin) {
  const cfg = ORIGINS && origin ? ORIGINS[origin] : null
  return (cfg && cfg.label) || '其他'
}

/**
 * 词源主体内容。
 * @param {{ entry: object, onSelectWord?: Function, onSelectMorph?: Function }} props
 */
function EtymBody({ entry, onSelectWord, onSelectMorph }) {
  const curated = entry.source === 'curated'
  const timeline = Array.isArray(entry.timeline) ? entry.timeline : []
  const cognates = Array.isArray(entry.cognates) ? entry.cognates : []

  return (
    <div className="text-xs leading-relaxed space-y-2">
      {/* 来源 + 原始形态 */}
      <div className="flex gap-2">
        <span className="text-slate-400 shrink-0 w-10">来源</span>
        <span className="text-slate-600">
          {originLabel(entry.origin)}
          {entry.proto ? (
            <>
              {' · '}
              <span className="font-medium text-slate-700">{entry.proto}</span>
              {entry.protoGloss ? <span className="text-slate-400">（{entry.protoGloss}）</span> : null}
              {entry.pie ? (
                <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                  重构形
                </span>
              ) : null}
            </>
          ) : null}
        </span>
      </div>

      {/* 演变时间线 */}
      {timeline.length > 0 && (
        <div className="flex gap-2">
          <span className="text-slate-400 shrink-0 w-10">演变</span>
          <ul className="space-y-0.5">
            {timeline.map((s, i) => (
              <li key={i} className="text-slate-600">
                {s.era ? <span className="text-slate-400">{s.era}：</span> : null}
                {s.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 一段叙述 */}
      {entry.story && <p className="text-slate-600">{entry.story}</p>}

      {/* 同源词（精编）/ 同词素词（组合） */}
      {cognates.length > 0 && (
        <div className="flex gap-2">
          <span className="text-slate-400 shrink-0 w-10">{curated ? '同源词' : '同词素词'}</span>
          <div className="flex flex-wrap gap-1">
            {cognates.map((c, i) => {
              const linkWord = c.wordId && typeof onSelectWord === 'function'
              const linkMorph = c.morphId && typeof onSelectMorph === 'function'
              if (linkWord || linkMorph) {
                const onClick = linkWord ? () => onSelectWord(c.wordId) : () => onSelectMorph(c.morphId)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={onClick}
                    className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  >
                    {c.form}
                    {c.gloss ? <span className="text-slate-400 ml-1">{c.gloss}</span> : null}
                  </button>
                )
              }
              return (
                <span key={i} className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600">
                  {c.form}
                  {c.gloss ? <span className="text-slate-400 ml-1">{c.gloss}</span> : null}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        {curated ? '精编词源 · 随构建内置，离线可看' : '组合叙述 · 由词库内置字段合成，离线可看'}
      </p>
    </div>
  )
}

export default function EtymologyPanel({
  morph,
  entry = null,
  defaultOpen = false,
  onSelectWord = null,
  onSelectMorph = null,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [resolved, setResolved] = useState(entry || null)
  const [loading, setLoading] = useState(!entry)

  useEffect(() => {
    let alive = true
    if (entry) {
      setResolved(entry)
      setLoading(false)
      return undefined
    }
    if (!morph) {
      setResolved(null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    resolveEtymology(morph)
      .then((e) => {
        if (alive) {
          setResolved(e)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setResolved(composeEtymology(morph))
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [morph, entry])

  const title = morph ? morph.display || morph.form || '' : ''
  const isCurated = resolved && resolved.source === 'curated'
  const badgeCls = isCurated
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-slate-50 text-slate-500 border-slate-200'

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left"
      >
        <span className="text-xs font-semibold text-slate-600">
          词源故事{title ? ` · ${title}` : ''}
        </span>
        {resolved && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeCls}`}>
            {isCurated ? '精编' : '组合叙述'}
          </span>
        )}
        <span className="ml-auto text-slate-400 text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-2.5 pb-2.5">
          {loading ? (
            <div className="space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
            </div>
          ) : resolved ? (
            <EtymBody entry={resolved} onSelectWord={onSelectWord} onSelectMorph={onSelectMorph} />
          ) : (
            <p className="text-xs text-slate-400">暂无词源信息</p>
          )}
        </div>
      )}
    </div>
  )
}

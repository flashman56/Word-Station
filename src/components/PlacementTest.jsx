/**
 * PlacementTest.jsx —— 起点测评卡片（学习首页「难度分档」下方）
 * ------------------------------------------------------------------
 * 三种形态，同一张卡：
 *   · 没测过   → 说明 + 「开始」（一句话讲清它干什么、会不会改学习记录）
 *   · 作答中   → 一题一屏 · 认识 / 不认识 / 不确定 · 进度 · 交卷
 *   · 出结果   → 建议档 + 词汇量估计 + **证据与它的限度** + 「用这个档开始」
 *
 * ★ 文案全部来自 lib/placement.js::describePlacement ★
 *   本组件不自己拼任何一句结论 —— 口径要能单测，且只有一处会随阈值改动而漂移。
 *
 * ★ 「用这个档开始」是**唯一**让结果生效的动作 ★
 *   它把推荐档写进 filters.learnBand（与难度分档同一个字段），而 learnBand 已经
 *   在 useLearn 里经 bandFilter() 过滤新学抽词池 —— 即：生效点在
 *   buildLearnQueue 的**上游**（hooks/useLearn.js:657），learning.js 一行未动。
 *
 * props:
 *   size / items / answeredCount / answers / running / done / result
 *     usePlacement() 的返回值（**不传 result 时只渲染入口态**，便于单独复用）
 *   onStart / onAnswer(wordId, value) / onSubmit / onRetake / onCancel
 *   onApplyBand(band)  采用推荐档（由 App 写进 filters.learnBand）
 *   activeBandId        当前难度分档 id，用于「已生效」提示
 */
import React, { useState } from 'react'
import { describePlacement, bandRangeLabel } from '../lib/placement.js'

const ANSWER_OPTS = [
  { value: 'known', label: '认识', cls: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
  { value: 'unknown', label: '不认识', cls: 'border-slate-300 text-slate-600 hover:bg-slate-50' },
  { value: 'unsure', label: '不确定', cls: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
]

/** 单档作答行（结果态的证据表） */
function BandRow({ row }) {
  const pct = row.answered > 0 ? Math.round(((row.known || 0) / row.answered) * 100) : null
  return (
    <tr className={`border-t border-slate-100 ${row.covered ? 'text-slate-600' : 'text-slate-300'}`}>
      <td className="py-1 pr-2 whitespace-nowrap">{row.label}</td>
      <td className="py-1 pr-2 text-right">{row.libraryN.toLocaleString('en-US')}</td>
      <td className="py-1 pr-2 text-right">{row.answered > 0 ? `${row.known}/${row.answered}` : '—'}</td>
      <td className="py-1 pr-2 text-right">{pct === null ? '—' : `${pct}%`}</td>
      <td className="py-1 text-right">
        {row.probed ? '抽样' : row.covered ? '插值' : '未覆盖'}
      </td>
    </tr>
  )
}

export default function PlacementTest({
  size = 0,
  items = [],
  answeredCount = 0,
  answers = {},
  running = false,
  done = false,
  result = null,
  startError = '',
  canStart = true,
  onStart,
  onAnswer,
  onSubmit,
  onRetake,
  onCancel,
  onApplyBand,
  activeBandId = null,
}) {
  const [showTable, setShowTable] = useState(false)

  // ---------------- 形态 1：入口
  if (!running && !result) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">从哪一档开始背</span>
          <span className="text-xs text-slate-400">约 1 分钟</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          现在所有人第一天都从同一个词频序号开始。用 {size || 40} 个词量一下，给你一条有依据的起点。
          <br />
          只做参考，<span className="font-medium text-slate-600">不会改动你的学习记录</span>，
          也不会替你标「已掌握」。
        </p>
        {/* ★ 出题失败的可读原因：start() 提前 return 时不进作答态（形态 2），
            琥珀色告警框反而够不到，所以入口态也要把 startError 摆出来 */}
        {startError && (
          <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            {startError}
          </div>
        )}
        {/* 词库 / 分档未就绪：按钮禁用并给一句可行动提示，而不是永久转圈 */}
        {!canStart && !startError && (
          <p className="mt-3 text-xs text-slate-400">词库还在加载，稍等片刻就能开始。</p>
        )}
        <button
          type="button"
          onClick={onStart}
          disabled={!onStart || !canStart}
          className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          开始
        </button>
      </div>
    )
  }

  // ---------------- 形态 2：作答中
  if (running) {
    const idx = Math.min(answeredCount, items.length - 1)
    const current = items[idx]
    if (!current) {
      // ★ 别再无限「正在出题…」：出题失败是有原因的（词频分档未就绪 / 词库未加载完）。
      //   把原因显示出来，并允许返回入口重试，否则用户只能干等。
      return (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="text-sm text-amber-800">{startError || '暂时出不了题，请稍后再试。'}</div>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 text-xs hover:bg-amber-100"
          >
            返回
          </button>
        </div>
      )
    }
    const pct = items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0
    return (
      <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            第 {Math.min(answeredCount + 1, items.length)} / {items.length} 个
          </span>
          <span>凭第一反应就好</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-4 text-2xl font-bold text-slate-800">{current.form}</div>
        <div className="text-xs text-slate-400 mt-0.5">词频序号 {current.freqRank}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ANSWER_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer && onAnswer(current.id, opt.value)}
              className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${opt.cls}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!done}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            {done ? '交卷，看结果' : `还剩 ${items.length - answeredCount} 个`}
          </button>
          <button type="button" onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">
            放弃
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          「不确定」按「不认识」计 —— 宁可把你估低，也不给你一个偏乐观的起点。
        </p>
      </div>
    )
  }

  // ---------------- 形态 3：结果
  if (!result) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-400">
        正在读取测评结果…
      </div>
    )
  }

  const copy = describePlacement(result)
  const recommendedId = result.band ? result.band.id : null
  const applied = Boolean(recommendedId && activeBandId === recommendedId)

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">起点测评</span>
        <div className="flex items-center gap-3">
          {result.sufficient && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {showTable ? '▾ 收起证据' : '▸ 看每一档的证据'}
            </button>
          )}
          <button type="button" onClick={onRetake} className="text-xs text-slate-400 hover:text-slate-600">
            重测
          </button>
        </div>
      </div>

      <div className="mt-2 text-lg font-semibold text-slate-800 leading-snug">{copy.headline}</div>
      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{copy.detail}</p>
      {copy.bandLine && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{copy.bandLine}</p>}

      {copy.estimateLine && (
        <div className="mt-3 rounded-md bg-slate-50 border border-slate-100 px-3 py-2">
          <span className="text-base font-semibold text-slate-800">{copy.estimateLine}</span>
        </div>
      )}

      {showTable && result.sufficient && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-left">
                <th className="font-medium py-1 pr-2">词频档</th>
                <th className="font-medium py-1 pr-2 text-right">库内词数</th>
                <th className="font-medium py-1 pr-2 text-right">认出</th>
                <th className="font-medium py-1 pr-2 text-right">已知率</th>
                <th className="font-medium py-1 text-right">来源</th>
              </tr>
            </thead>
            <tbody>
              {result.bands.map((row) => (
                <BandRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
            「抽样」= 这档里抽了词让你答；「插值」= 相邻抽样档之间线性补的；「未覆盖」=
            这档比所有抽样档都难，没有证据，不计入估计。
          </p>
        </div>
      )}

      {/* 证据与限度：样本量 / 覆盖范围 / 自评的性质，一行都不省 */}
      <div className="mt-3 rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <span className="font-medium">证据：</span>
          {copy.evidence}
        </p>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          <span className="font-medium">限度：</span>
          {copy.caveat}
        </p>
      </div>

      {copy.canApply && result.band && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onApplyBand && onApplyBand(result.band)}
            disabled={applied}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            {applied ? `已经在用 ${bandRangeLabel(result.band)} 这一档` : `从 ${bandRangeLabel(result.band)} 这一档开始`}
          </button>
          <span className="text-[11px] text-slate-400">
            只改之后新开的学习会话，已在学的词不受影响
          </span>
        </div>
      )}

      {!copy.canApply && (
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          这次不给推荐档 —— 证据不足时给一个「看起来很准」的起点，比不给更糟。
          你随时可以自己点上面的难度分档。
        </p>
      )}
    </div>
  )
}
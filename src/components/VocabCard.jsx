/**
 * VocabCard —— 预测词汇量卡片
 * ------------------------------------------------------------------
 * 两个形态（对应 docs/features-design.md B / PRD 4.2）：
 *   - 默认（显著版）：挂在 LearnHome 三张统计卡下方。显示
 *     「≈ N 词（估算 ±D）」+ 可展开的「怎么算的」（渲染 bands[] 分档表）。
 *   - compact（精简版）：挂在 Sidebar 统计区上方，只给一行数字。
 *
 * 样本不足（sufficient=false）时**不显示数字**，改显示「样本不足（已确认 N 个词）」。
 * 参照带一律标注「粗略参照，非权威口径」（Q1：不做母语者对标）。
 * 纯展示组件，数据由 App 用 estimateVocabulary 计算后经 props 传入。
 *
 * props:
 *   result   estimateVocabulary 的返回值（VocabResult）；为 null 时**不渲染**
 *   compact  是否精简版
 */
import React, { useState } from 'react'

/** 千分位格式化 */
function fmt(n) {
  return Number(n || 0).toLocaleString('en-US')
}

/** 词频档标签：末档 hi=Infinity 显示为 `lo+` */
function bandLabel(lo, hi) {
  return hi === Infinity ? `${fmt(lo)}+` : `${fmt(lo)}–${fmt(hi)}`
}

/**
 * 「怎么算的」分档表。
 * @param {{ bands: Array, estimate: number }} props
 */
function BandsTable({ bands, estimate }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-400 text-left">
            <th className="font-medium py-1 pr-2">词频档</th>
            <th className="font-medium py-1 pr-2 text-right">库内词数</th>
            <th className="font-medium py-1 pr-2 text-right">已学</th>
            <th className="font-medium py-1 pr-2 text-right">已知率</th>
            <th className="font-medium py-1 text-right">推断掌握量</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((b, i) => (
            <tr
              key={i}
              className={`border-t border-slate-100 ${b.included ? 'text-slate-600' : 'text-slate-300'}`}
            >
              <td className="py-1 pr-2 whitespace-nowrap">{bandLabel(b.lo, b.hi)}</td>
              <td className="py-1 pr-2 text-right">{fmt(b.libraryN)}</td>
              <td className="py-1 pr-2 text-right">{fmt(b.studiedN)}</td>
              <td className="py-1 pr-2 text-right">{Math.round((b.knownP || 0) * 100)}%</td>
              <td className="py-1 text-right">{b.included ? fmt(b.estKnown) : '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-medium text-slate-700">
            <td className="py-1 pr-2" colSpan={4}>
              合计（截断至已知率 &lt; 25% 的档）
            </td>
            <td className="py-1 text-right">{fmt(estimate)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
        样本 = 有真实学习记录且非「高频继承」的词；已知率经非增约束后逐档外推，二项方差给出 ± 区间。
      </p>
    </div>
  )
}

export default function VocabCard({ result, compact = false }) {
  const [open, setOpen] = useState(false)

  // StationLearn 等场景不传 vocab → 不渲染
  if (!result) return null

  const { estimate, low, high, sufficient, sampleSize, bands = [], reference } = result
  const delta = Math.round(Math.max(0, (Number(high) || 0) - (Number(low) || 0)) / 2)

  if (compact) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
        <div className="text-xs text-slate-500">预测词汇量</div>
        {sufficient ? (
          <div className="mt-0.5">
            <span className="text-lg font-bold text-slate-800">≈ {fmt(estimate)}</span>
            <span className="text-xs text-slate-400 ml-1">词 ±{fmt(delta)}</span>
          </div>
        ) : (
          <div className="mt-0.5 text-xs text-slate-500">样本不足（已确认 {fmt(sampleSize)} 个）</div>
        )}
        <div className="text-[10px] text-slate-400 mt-0.5">估算 · 非精确 · 本词库口径</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600">预测词汇量</span>
        {sufficient && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {open ? '▾ 收起' : '▸ 怎么算的'}
          </button>
        )}
      </div>

      {sufficient ? (
        <>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold text-slate-800">≈ {fmt(estimate)} 词</span>
            <span className="text-sm text-slate-400">（估算 ±{fmt(delta)}）</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            基于已学 {fmt(sampleSize)} 词的样本分档外推 · 估算 · 非精确 · 本词库口径
          </p>
          {reference && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-2 py-1 text-xs text-slate-500">
              <span>参照：{reference.label}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">粗略参照，非权威口径</span>
            </div>
          )}
          {open && <BandsTable bands={bands} estimate={estimate} />}
        </>
      ) : (
        <>
          <div className="mt-2 text-2xl font-bold text-slate-400">样本不足</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            已确认 {fmt(sampleSize)} 个词；再学几轮、多标几个「已掌握」就能估算 →
          </p>
        </>
      )}
    </div>
  )
}

import React from 'react'
import { STATUS, STATS_SCOPE } from '../lib/derive.js'

/**
 * 学习首页（进入「学习」页签默认看到的）。
 *
 * 三张统计卡（未知 / 待复习 / 已掌握，数字来自 useLearn.stats，去重口径）；
 * 掌握进度条（已知 / 全量 310）；
 * 主按钮：有待复习时「优先复习（N）」，否则「开始学习（N）」，副按钮可手动切另一模式；
 * 空状态与迁移提示。
 *
 * props:
 *   stats           useLearn.stats { unknown, review, known, total }
 *   learnQueue      useLearn.learnQueue
 *   reviewQueue     useLearn.reviewQueue
 *   onStartLearn    () => void
 *   onStartReview   () => void
 *   migrationReport 迁移报告 { known, review, unknown, ... } 或 null
 *   band            当前难度分档 'all' | { id, lo, hi }（已 normalizeBand 归一化）
 *   bands           动态档位列表 [{ id, lo, hi, label }]，首项为「全部」
 *   bandCounts      每档实际可用词数 { all: n, '0-3000': n, ... }，按 band.id 取
 *   onChangeBand    (band) => void，band 为 bands 中的档位对象
 *   groupByFamily   需求1：按词族成组出题开关（默认 true）
 *   onToggleGroupByFamily () => void 切换开关
 */
export default function LearnHome({
  stats = { unknown: 0, review: 0, known: 0, total: 0 },
  learnQueue = [],
  reviewQueue = [],
  onStartLearn,
  onStartReview,
  migrationReport = null,
  band = 'all',
  bands = [],
  bandCounts = {},
  onChangeBand,
  groupByFamily = true,
  onToggleGroupByFamily,
}) {
  // 当前选中档位 id（'all' 或 'lo-hi'），用于高亮按钮
  const activeBandId = band === 'all' || band == null ? 'all' : band.id
  const total = stats.total || STATS_SCOPE
  const knownPct = total > 0 ? Math.round((stats.known / total) * 100) : 0

  const hasReview = reviewQueue.length > 0
  const hasLearn = learnQueue.length > 0
  const isEmpty = !hasReview && !hasLearn

  const cards = [
    { key: 'unknown', value: stats.unknown },
    { key: 'review', value: stats.review },
    { key: 'known', value: stats.known },
  ]

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* 三态统计卡 */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ key, value }) => {
          const cfg = STATUS[key]
          return (
            <div
              key={key}
              className="rounded-2xl border p-4"
              style={{ borderColor: cfg.soft, background: cfg.soft }}
            >
              <div className="text-3xl font-bold" style={{ color: cfg.color }}>
                {value}
              </div>
              <div className="text-sm mt-1" style={{ color: cfg.color }}>
                {cfg.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* 掌握进度条 */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>掌握进度</span>
          <span>
            已掌握 {stats.known} 个 · {knownPct}%
          </span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${knownPct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-slate-400 text-right">
          已知 {stats.known} / {total}
        </div>
      </div>

      {/* 难度分档：按词频区间限定新学抽词池（档位由数据动态生成，可换行不撑爆布局） */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">难度分档</span>
          <span className="text-xs text-slate-400">按词频区间限定新学抽词池</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {bands.map((opt) => {
            const active = activeBandId === opt.id
            const count = bandCounts[opt.id]
            return (
              <button
                key={opt.id}
                onClick={() => onChangeBand && onChangeBand(opt)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
                {typeof count === 'number' && (
                  <span className={`text-xs ml-1 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                    {count} 词
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2.5">
          选档只影响之后新开的学习会话；已在学 / 待复习 / 已掌握记录不受影响。
        </p>
      </div>

      {/* 按词族成组出题开关（需求1）：词根为干、单词为叶，同族词连续出 */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-600">按词族成组出题</div>
            <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              开启后，新学队列按词根家族连续出词（如学完 spect 家族再进下一族）；
              关闭则回退为按词频排序抽词。
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={groupByFamily}
            onClick={() => onToggleGroupByFamily && onToggleGroupByFamily()}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
              groupByFamily ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                groupByFamily ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 主操作区 */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        {isEmpty ? (
          <p className="text-sm text-slate-500">
            暂无待学 / 待复习词，去词库里挑几个标「记得」吧。
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {hasReview ? (
              <button
                onClick={onStartReview}
                className="w-full max-w-xs py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                优先复习（{reviewQueue.length}）
              </button>
            ) : (
              <button
                onClick={onStartLearn}
                className="w-full max-w-xs py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                开始学习（{learnQueue.length}）
              </button>
            )}

            {/* 副按钮：手动切另一模式（仅当另一模式有词时） */}
            {hasReview && hasLearn && (
              <button
                onClick={onStartLearn}
                className="w-full max-w-xs py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                改为开始学习（{learnQueue.length}）
              </button>
            )}
          </div>
        )}
      </div>

      {/* 迁移提示 */}
      {migrationReport && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          已从旧版保留 {migrationReport.known} 个已掌握、{migrationReport.review} 个待复习、
          {migrationReport.unknown} 个未知。
        </p>
      )}
    </div>
  )
}

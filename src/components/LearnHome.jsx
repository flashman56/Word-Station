import React from 'react'
import { STATUS, STATS_SCOPE } from '../lib/derive.js'
import { describeMigrationReport } from '../lib/migrationCopy.js'
import VocabCard from './VocabCard.jsx'

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
 *   vocab            词汇量预测结果（不传则不渲染该区块）
 *   showSharedNote   是否显示「小站复习与学习复习是同一份记录」说明（B-5，默认 false）
 *   privateCount     私有词数量；>0 时在词汇量区块下渲染「含 N 个私有词」（B-3）
 *   vocabIncludesPrivate 词汇量估算是否含私有词；false 时渲染 B-8 提示（阈值不暴露给用户）
 *   excludeProper  是否排除专有名词（kind === 'proper'）；默认 false
 *   onToggleExcludeProper () => void 切换开关。**不传则整张卡片不渲染** ——
 *                  本组件被 StationLearn 复用，那里没有这个设置，
 *                  渲染出一个点了没反应的死开关比不显示更糟。
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
  vocab = null,
  showSharedNote = false,
  privateCount = 0,
  vocabIncludesPrivate = true,
  excludeProper = false,
  onToggleExcludeProper,
}) {
  // 当前选中档位 id（'all' 或 'lo-hi'），用于高亮按钮
  const activeBandId = band === 'all' || band == null ? 'all' : band.id
  const total = stats.total || STATS_SCOPE
  const knownPct = total > 0 ? Math.round((stats.known / total) * 100) : 0

  const hasReview = reviewQueue.length > 0
  const hasLearn = learnQueue.length > 0
  const isEmpty = !hasReview && !hasLearn

  /* 迁移提示：措辞由 lib/migrationCopy.js 统一产出（Sidebar 共用同一份）。
     ★ 判据不是「有没有 report」，而是「有没有值得说的话」——
       inheritFreqKnown 关掉且无旧版数据时返回 null，此时整块不渲染，
       而不是渲染出「已从旧版保留 0 个已掌握、0 个待复习…」这种既无信息
       量又同样误导的话。 */
  const migrationNote = describeMigrationReport(migrationReport)

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

      {/* 「已排期」：待复习里今天还没到期的部分（明天起陆续到期）。
          ★ 措辞用「其中」而非并列一栏 ★
            countByStatus 只按 status 分桶、不看 nextDueAt，所以「明天到期」的词
            本来就含在上面的「待复习」卡片里 —— 两者是子集关系。若写成并列的
            「已排期 N」，用户会以为待复习之外还多出 N 个词，数字对不上账。
          ★ 为什么放在这里 ★
            学习首页是唯一能回答「明天要复习几个」的地方 —— 三张卡片只给出
            「待复习」的总数，排期中的词就那样消失在总数里，用户看不到盼头。
          ★ 读的是 stats.scheduled（useLearn 随 stats 一起下发），不是独立 prop ★
            独立 prop 需要 App.jsx 透传，而那个文件正被并行修改、不在本任务红线内，
            那样这条 prop 永远传不过来，功能会变成永不显示的死代码。
            StationLearn 复用本组件时它自己算 stats、不带该字段 → ?? 0 → 不渲染。
          N=0 时不渲染：显示「已排期 0」只是噪声（「待复习 0」已说明没有）。 */}
      {(stats.scheduled ?? 0) > 0 && (
        <p className="mt-2 text-xs text-slate-400 text-center">
          其中 {stats.scheduled} 个已排期，明天起陆续到期。
        </p>
      )}

      {/* 预测词汇量（显著位）：无 vocab 传入（如 StationLearn）则不渲染 */}
      {vocab && (
        <div className="mt-5">
          <VocabCard result={vocab} />
          {/* B-3：一个数 + 一行注脚（Q6）。私有词确实参与了统计，这里说明它有几个 */}
          {privateCount > 0 && (
            <p className="mt-1.5 text-xs text-slate-400">含 {privateCount} 个私有词</p>
          )}
          {/* B-8：私有词过多时估算回退到公共词，明说「暂不含」——
              阈值不暴露给用户（500 是实现细节，不是产品口径）。 */}
          {!vocabIncludesPrivate && (
            <p className="mt-1.5 text-xs text-slate-400">私有词较多，词汇量估算暂不含私有词</p>
          )}
        </div>
      )}

      {/* B-5：说明「小站复习」与「学习复习」是同一份记录，避免用户以为是两套进度 */}
      {showSharedNote && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          小站复习与学习复习是同一份记录、同一个到期时间（答错 +24h），到期后两边都会出现，不是重复出题。
        </p>
      )}

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

      {/* 排除专有名词开关（人名 / 地名 / 品牌）。
          ★ 只在传了 handler 时渲染 ★：StationLearn 复用本组件但它没有这个设置，
            那里渲染出来会是一个点了没反应的死开关。 */}
      {onToggleExcludeProper && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-600">排除专有名词（人名 / 地名 / 品牌）</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                开启后不再新学这类词（当前词库约 1.4 万）
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={excludeProper}
              onClick={() => onToggleExcludeProper && onToggleExcludeProper()}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                excludeProper ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  excludeProper ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      )}

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
      {migrationNote && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          {migrationNote.text}
        </p>
      )}
    </div>
  )
}

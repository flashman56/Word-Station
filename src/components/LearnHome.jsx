import React, { useState } from 'react'
import { STATUS } from '../lib/derive.js'
import { describeMigrationReport } from '../lib/migrationCopy.js'
import DailyTask from './DailyTask.jsx'
import VocabCard from './VocabCard.jsx'

/**
 * 学习首页（进入「学习」页签默认看到的）。
 *
 * ★ 第一块是 DailyTask（「今天该做什么」），不是统计卡 ★
 * 三张统计卡（未知 / 待复习 / 已掌握，数字来自 useLearn.stats，去重口径）紧随其后；
 * 掌握进度条（已知 / 全量 310）；难度分档与成组开关；空状态与迁移提示。
 *
 * props:
 *   stats           useLearn.stats { unknown, review, known, total, scheduled }
 *   learnQueue      useLearn.learnQueue
 *   reviewQueue     useLearn.reviewQueue
 *   daily           useLearn.daily（今天该做什么：到期数 / 新学数 / 预计分钟 /
 *                   已排期 / 24h 内到期）。**不传则退回 FallbackActions**（旧行为）。
 *   onStartLearn    () => void
 *   onStartReview   () => void
 *   migrationReport 迁移报告 { known, review, unknown, ... } 或 null
 *   band            当前难度分档 'all' | { id, lo, hi }（已 normalizeBand 归一化）
 *   bands           动态档位列表 [{ id, lo, hi, label }]，首项为「全部」
 *   bandCounts      每档实际可用词数 { all: n, '0-3000': n, ... }，按 band.id 取
 *   onChangeBand    (band) => void，band 为 bands 中的档位对象
 *   groupByFamily   需求1：按词族成组学习开关（默认 true）
 *   onToggleGroupByFamily () => void 切换开关
 *   roots          按词族成组学习时可选词根目录（useLearn.rootOptions：
 *                  [{ id, form, display, gloss, count }]）；空数组或不传则不渲染查找器
 *   selectedRoots   已选词根 id 数组（空 = 全部）
 *   onToggleRoot    (rootId) => void 切换某个词的选中态
 *   onClearRoots    () => void 清空选择（回到学全部词根）
 *   weakRoots      「我的薄弱词根」榜（useLearn.weakRoots：
 *                  [{ id, form, display, gloss, stuck, touched, rate }]，已按薄弱程度排序）；
 *                  空数组 / 不传则整块不渲染——没有卡住的词时不显示空洞的 0
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
  daily = null,
  migrationReport = null,
  band = 'all',
  bands = [],
  bandCounts = {},
  onChangeBand,
  groupByFamily = true,
  onToggleGroupByFamily,
  roots = [],
  selectedRoots = [],
  onToggleRoot,
  onClearRoots,
  weakRoots = [],
  vocab = null,
  showSharedNote = false,
  privateCount = 0,
  vocabIncludesPrivate = true,
  excludeProper = false,
  onToggleExcludeProper,
}) {
  // 当前选中档位 id（'all' 或 'lo-hi'），用于高亮按钮
  const activeBandId = band === 'all' || band == null ? 'all' : band.id
  // 分母 = 当前范围内的折叠学习单元数（stats.total，运行时动态值）。
  //
  // ★ 不再用 STATS_SCOPE 兜底 ★
  //   这个兜底只在 stats.total === 0 时才会触发，而 total 为 0 恰恰意味着
  //   「当前范围里一个词都没有」（空小站）。此时拿全库 6.4 万当分母，会把
  //   一个空站显示成「已知 0 / 64,699」——凭空造出一个并不存在的规模，
  //   比什么都不显示更具误导性。total 有值时它本身就是真实分母，无需常量兜底。
  const total = stats.total
  const knownPct = total > 0 ? Math.round((stats.known / total) * 100) : 0

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
      {/* ★ 第一块是「今天该做什么」，不是统计 ★
          原来这块位置放的是三张统计卡（未知 / 待复习 / 已掌握）—— 用户得先在
          三个数字里自己判断该点哪个按钮。「今天该复习 N 个、约 M 分钟」把这个判断
          直接给出结论，并按「先清到期复习、再学新词」的顺序排序动作。
          daily 为 null 时（如未接线的调用方）整块不渲染，下面的旧操作区兜底。 */}
      {daily ? (
        <DailyTask daily={daily} onStartReview={onStartReview} onStartLearn={onStartLearn} />
      ) : (
        <FallbackActions
          learnQueue={learnQueue}
          reviewQueue={reviewQueue}
          onStartLearn={onStartLearn}
          onStartReview={onStartReview}
        />
      )}

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
          {total > 0 ? `已知 ${stats.known} / ${total}` : '还没有可统计的词条'}
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

      {/* 按词族成组学习开关（需求1）：词根为干、单词为叶，同族词连续学 */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-600">按词族成组学习</div>
            <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              开启后，新学队列按词根家族成组学习（如学完 spect 家族再进下一族）；
              关闭则回退为按词频排序逐词学习。
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

      {/* 我的薄弱词根（本产品的差异化特性）：
          把「词族分组 × 学习记录 × 词素释义」三块已有数据串起来——
          「你在 r.act 这个词根下卡住了 N 个词」→ 按薄弱程度排序 → 一键定向刷这个族。
          ★ 判据是用户本人的失败记录，不是词频 ★
            按词频从易到难给所有人同一条路径；这里的排序来自**你答错过什么**，
            而这条能力依赖本项目特有的词素数据结构（每个词都能归到某个词根族）。
          ★ 无数据整块不渲染 ★
            一个卡住的词都没有时返回空数组——显示「卡住 0 个」只是噪声。
          ★ 仅在 groupByFamily 开启时渲染 ★
            选中词根只收窄新学抽词池，而该收窄仅在成组学习时生效（useLearn.learnPool）。
            关掉时渲染出来会是一排点了没反应的按钮——与「排除专有名词」开关同一条惯例：
            死开关比不显示更糟。 */}
      {groupByFamily && weakRoots && weakRoots.length > 0 && (
        <WeakRoots roots={weakRoots} selectedRoots={selectedRoots} onToggleRoot={onToggleRoot} />
      )}

      {/* 自选词根查找器（仅按词族成组学习时、且确有词根可选时渲染）。
          ★ 不选 = 学全部词族；选了 = 新学抽词池只留所选词根的词族 ★
          与难度分档同一语义：只收窄新学、不动复习队列与统计。 */}
      {groupByFamily && roots && roots.length > 0 && (
        <RootPicker
          roots={roots}
          selectedRoots={selectedRoots}
          onToggleRoot={onToggleRoot}
          onClearRoots={onClearRoots}
        />
      )}

      {/* 排除专有名词开关（人名 / 地名 / 品牌）。
          ★ 只在传了 handler 时渲染 ★：StationLearn 复用本组件但它没有这个设置，
            那里渲染出来会是一个点了没反应的死开关。 */}
      {onToggleExcludeProper && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-600">排除专有名词（人名 / 地名 / 品牌）</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                默认已开启——它们会挤在新手队列最前面（实测约占前 1000 词的 19%），
                人名既非学习目标也无词根可拆；要学人名/地名可以在这里关掉
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

      {/* 迁移提示 */}
      {migrationNote && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          {migrationNote.text}
        </p>
      )}
    </div>
  )
}

/**
 * 自选词根查找器：在「按词族成组学习」下，让用户挑要学的词根（可多选 + 查找）。
 *
 * ★ 为什么是独立子组件 ★
 *   它自己持有查找输入框的本地状态（rootQuery），不放进 LearnHome 主组件——
 *   避免查找输入这种高频变更触发 LearnHome 整块重渲染（统计卡 / 进度条都在里面）。
 *
 * ★ 渲染判据 ★
 *   父组件已用 `groupByFamily && roots?.length > 0` 包住，这里只管渲染。
 *   空选择（selectedRoots 为空）表示「学全部词根」，「全部词根」按钮高亮。
 */
function RootPicker({ roots, selectedRoots, onToggleRoot, onClearRoots }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? roots.filter(
        (r) =>
          r.form.toLowerCase().includes(q) ||
          (r.display && r.display.toLowerCase().includes(q)) ||
          (r.gloss && r.gloss.toLowerCase().includes(q)),
      )
    : roots
  const selected = selectedRoots || []
  const allActive = selected.length === 0
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-600">选择词根（可选）</div>
          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            只学选中的词根家族；不选则按全部词根成组学习。
          </div>
        </div>
        <button
          type="button"
          onClick={onClearRoots}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
            allActive
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          全部词根
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="查找词根，如 spect / 看 / 说"
        className="mt-3 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400"
      />

      <div className="mt-3 max-h-56 overflow-y-auto flex flex-wrap gap-2 content-start">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400">没有匹配「{query}」的词根。</p>
        ) : (
          filtered.map((r) => {
            const active = selected.includes(r.id)
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onToggleRoot && onToggleRoot(r.id)}
                title={r.gloss ? `${r.form} · ${r.gloss}` : r.form}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r.form}
                {r.gloss ? <span className={active ? 'text-blue-100' : 'text-slate-400'}> · {r.gloss}</span> : null}
                <span className={`text-xs ml-1 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                  {r.count} 词
                  {r.remaining > 0 && r.remaining < r.count ? (
                    <span className="opacity-80"> · 剩 {r.remaining}</span>
                  ) : null}
                </span>
              </button>
            )
          })
        )}
      </div>

      {selected.length > 0 && (
        <p className="mt-2.5 text-xs text-slate-400">
          已选 {selected.length} 个词根，新学队列只从这些家族抽取（复习队列不受影响）。
        </p>
      )}
    </div>
  )
}

/**
 * 我的薄弱词根。
 *
 * ★ 为什么是独立子组件 ★
 *   与 RootPicker 同理：这里没有任何本地输入状态需要持有，但拆出来能让
 *   LearnHome 的区块列表保持「一段注释 = 一块 UI」的可读结构。
 *
 * ★ 点击 = 直接选中该词根，从而定向刷这个族 ★
 *   走的是既有 onToggleRoot / selectedRoots 这条链路，与「自选词根」查找器
 *   完全同一套状态：选中后新学抽词池只留该词族（复习队列与统计不受影响）。
 *   已选中时再点一次是取消——与查找器里同一个按钮的行为一致，不给两套语义。
 *
 * ★ 数字为什么是「卡住 N 个 · P%」★
 *   N 是绝对数（决定值不值得先刷），P% = 卡住数 / 该族学过的词数（说明是不是
 *   一学就错）。只给百分比会让「学过 1 个错了 1 个」的 100% 压过「学过 40 个
 *   错了 12 个」的 30%，所以绝对数在前。精确口径写在 title 里，鼠标悬停可查。
 */
function WeakRoots({ roots, selectedRoots, onToggleRoot }) {
  const selected = selectedRoots || []
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-600">我的薄弱词根</div>
          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            这些词根下你答错过、至今还没掌握。点一下即只学这个族。
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {roots.map((r) => {
          const active = selected.includes(r.id)
          const pct = Math.round(r.rate * 100)
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onToggleRoot && onToggleRoot(r.id)}
              title={`${r.form}${r.gloss ? ` · ${r.gloss}` : ''}：学过 ${r.touched} 个，其中 ${r.stuck} 个答错过还没掌握`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r.form}
              {r.gloss ? (
                <span className={active ? 'text-blue-100' : 'text-slate-400'}> · {r.gloss}</span>
              ) : null}
              <span className={`text-xs ml-1 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                <span className={active ? 'text-blue-100' : 'text-amber-600'}>卡住 {r.stuck} 个</span>
                <span className="opacity-80"> · {pct}%</span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-2.5 text-xs text-slate-400">
        口径：答错过且仍在待复习的词，按词根家族聚合；手工标的待复习、还没学过的词不算薄弱。
      </p>
    </div>
  )
}

/**
 * 没有 `daily` 时的兜底操作区（= 本模块接入前的原样行为）。
 *
 * ★ 为什么保留而不是直接删 ★
 *   LearnHome 被两处复用（学习页 / StationLearn），任一调用方漏传 daily 时，
 *   若只剩统计卡，用户会发现「今天没有任何入口能开始学习」—— 一个比旧行为
 *   明显更差的结果。保留它让漏传退化为「没有新功能」，而不是「功能消失」。
 */
function FallbackActions({ learnQueue, reviewQueue, onStartLearn, onStartReview }) {
  const hasReview = reviewQueue.length > 0
  const hasLearn = learnQueue.length > 0
  if (!hasReview && !hasLearn) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">暂无待学 / 待复习词，去词库里挑几个标「记得」吧。</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
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
    </div>
  )
}

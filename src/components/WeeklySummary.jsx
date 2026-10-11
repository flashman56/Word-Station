import React from 'react'

/**
 * WeeklySummary —— 最近 7 天小结
 * ------------------------------------------------------------------
 * 只读本地学习记录，不新增任何数据、不发任何网络请求。
 *
 * ★ 三条口径，UI 上必须原样露出分子分母 ★
 *   1. 新增掌握：status==='known' 且 statusChangedAt 落在近 7 天、
 *      且 statusSource !== 'migration'（高频继承不算「学会」）。
 *   2. 复习完成率 = 已作答 / 本周到期
 *      分母 = nextDueAt 落在近 7 天内的复习词数
 *             （nextDueAt 只在答错时写，所以它落在窗口内 ≡ 这一周内到期过）
 *      分子 = 其中 lastStudiedAt >= nextDueAt 的（到期之后被真实答过题的）
 *      ★ 分母为 0 时**不显示任何百分比** —— 只说「本周没有到期的复习」。
 *   3. 词汇量变化：**反事实**，不是历史快照。
 *      学习记录是就地覆盖的，没有任何历史版本，所以「7 天前的估算」无从取得。
 *      这里做的是把「本周新增掌握」这一个事件回退掉重算，并如实标注这是假设。
 *
 * ★ 数据不足时说什么 ★
 *   没有可判定的样本就明说「数据不足」，绝不显示一个自信但无依据的数字。
 *
 * props:
 *   summary  daily.js::buildWeeklySummary 的返回值；为 null 时不渲染
 */
export default function WeeklySummary({ summary = null }) {
  if (!summary) return null

  const { hasHistory, newlyMastered, review, vocab } = summary
  const noData = !hasHistory

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600">最近 7 天</span>
        <span className="text-xs text-slate-400">只看本地记录 · 未上传云端</span>
      </div>

      {noData ? (
        <>
          <div className="mt-2 text-2xl font-bold text-slate-400">数据不足</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            近 7 天没有到期或新增掌握的记录，还看不出趋势。完成一轮学习或复习后这里就会有数字。
          </p>
        </>
      ) : (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 新增掌握 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-3xl font-bold text-slate-700">{newlyMastered}</div>
            <div className="text-sm text-slate-500 mt-1">新增掌握</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              近 7 天新达到「已掌握」的词数（不含高频继承）
            </p>
          </div>

          {/* 复习完成率：分子分母都摆出来，不给一个无依据的百分比 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-3xl font-bold text-slate-700">
              {review.due > 0 ? `${Math.round((review.ratio || 0) * 100)}%` : '—'}
            </div>
            <div className="text-sm text-slate-500 mt-1">复习完成率</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {review.due > 0 ? (
                <>
                  已作答 {review.answered} / 本周到期 {review.due}
                </>
              ) : (
                '本周没有到期的复习，没有可计算的完成率'
              )}
            </p>
          </div>

          {/* 词汇量变化：反事实，明说是假设 */}
          {vocab.sufficient ? (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-3xl font-bold text-slate-700">
                {vocab.delta > 0 ? `+${vocab.delta}` : vocab.delta}
              </div>
              <div className="text-sm text-slate-500 mt-1">词汇量估算变化</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {vocab.from} → {vocab.to}（假设本周没新掌握这些词的估算值）
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-3xl font-bold text-slate-400">数据不足</div>
              <div className="text-sm text-slate-500 mt-1">词汇量估算变化</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                学习样本还不够给出可信估算，学满 30 个词后会显示。
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
        「完成率」的分母是本周到期的复习词数，分子是其中到期后被真实答过的词数；
        「词汇量变化」是把本周新增掌握回退后的反事实估算，不是历史快照 —— 学习记录是就地覆盖的，本地不留历史版本。
      </p>
    </div>
  )
}

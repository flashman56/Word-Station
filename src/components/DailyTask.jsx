import React from 'react'
import { STATUS } from '../lib/derive.js'
import { describeNextAppointment } from '../lib/daily.js'

/**
 * DailyTask —— 学习首页的**第一块**，取代原先「三张统计卡打头」的位置。
 * ------------------------------------------------------------------
 * 一句话回答「我今天该做什么」，而不是先给一堆数字让用户自己算。
 *
 * ★ 三个数字的来源（全部现算，无新数据）★
 *   dueRound   到期复习词数，本轮实际会出的个数（= min(dueTotal, roundSize)）
 *   newRound   新学词数，本轮实际会出的个数
 *   minutes    daily.js::estimateDailyMinutes（SECONDS_PER_REVIEW_WORD=15 /
 *              SECONDS_PER_NEW_WORD=25，见该文件顶部的取值依据）
 *
 * ★ 为什么「该复习 N 个」用 dueRound 而不是 dueTotal ★
 *   dueTotal 是「一共欠了多少」，dueRound 是「这一轮会做多少」。把两者混着说，
 *   用户点进去发现只出了 10 个会觉得数字骗人。若 dueTotal > dueRound（积压），
 *   额外一行把积压量明说，而不是把它藏起来。
 *
 * ★ 「先复习再学新词」的意图必须写在文案里 ★
 *   到期复习会随时间越积越多、且不影响新学进度，所以它优先；但只给一个
 *   「优先复习（N）」按钮而不说明，用户会以为另一个模式被藏起来了。
 *
 * props:
 *   daily        useLearn.daily（见 hooks/useLearn.js）；**不传则整块不渲染**
 *   onStartReview () => void
 *   onStartLearn  () => void
 *   compact       紧凑模式（StationLearn 复用时无需额外信息）
 */
export default function DailyTask({ daily = null, onStartReview, onStartLearn }) {
  if (!daily) return null

  const { dueRound, dueTotal, newRound, minutes, upcoming24h, scheduled } = daily
  const hasDue = dueRound > 0
  const hasNew = newRound > 0
  const hasBoth = hasDue && hasNew
  const backlogged = dueTotal > dueRound

  /** 主标题：把「今天有几件事、各多少个、大概多久」压成一句话。 */
  let headline
  if (hasBoth) {
    headline = `今天该复习 ${dueRound} 个、再学 ${newRound} 个新词，约 ${minutes} 分钟`
  } else if (hasDue) {
    headline = `今天该复习 ${dueRound} 个，约 ${minutes} 分钟`
  } else if (hasNew) {
    headline = `今天没有到期的复习，学 ${newRound} 个新词，约 ${minutes} 分钟`
  } else {
    headline = '今天没有到期的复习，也没有待学的新词'
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: hasDue ? '#f0d9a8' : '#cfe3d8', background: hasDue ? '#fdf9f0' : '#f2faf6' }}
    >
      <div className="text-xs font-medium tracking-wide" style={{ color: hasDue ? STATUS.review.color : '#3fa07a' }}>
        今天
      </div>

      <div className="mt-1.5 text-lg font-semibold leading-snug text-slate-800">{headline}</div>

      {/* 意图说明：两种模式并存时讲清顺序，否则「另一个按钮去哪了」是个真问题 */}
      {hasBoth && (
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          先做完到期的复习，再接着学新词 —— 两件都做完，今天就算达标。
        </p>
      )}

      {/* 积压：dueTotal > dueRound 时明说，不让「今天 10 个」听起来像全部欠账 */}
      {backlogged && (
        <p className="mt-1 text-xs text-slate-500">
          今天一共到期 {dueTotal} 个，这一轮先做 {dueRound} 个，剩下的下轮继续。
        </p>
      )}

      {/* 今天的复习量与新学量并排对照：让「今天干了什么」在结束后仍可核对 */}
      {(hasDue || hasNew) && (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span>
            待复习 <span className="font-semibold" style={{ color: STATUS.review.color }}>{daily.dueTotal}</span>
          </span>
          <span>
            待新学 <span className="font-semibold" style={{ color: STATUS.unknown.color }}>{daily.newTotal}</span>
          </span>
        </div>
      )}

      {/* 主操作：有到期时复习优先，没有到期才轮到新学 */}
      {hasDue ? (
        <button
          onClick={onStartReview}
          className="mt-4 w-full max-w-xs py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          优先复习（{dueRound}）
        </button>
      ) : hasNew ? (
        <button
          onClick={onStartLearn}
          className="mt-4 w-full max-w-xs py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          开始学习（{newRound}）
        </button>
      ) : (
        <p className="mt-3 text-sm text-slate-500">暂无待学 / 待复习词，去词库里挑几个标「记得」吧。</p>
      )}

      {/* 副按钮：手动切另一模式（仅当另一模式本轮确有词时） */}
      {hasBoth && (
        <button
          onClick={onStartLearn}
          className="mt-2 w-full max-w-xs py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
        >
          改为开始学习（{newRound}）
        </button>
      )}

      {/* 下一次预约：即使今天清空了，也给一个回来的理由 */}
      {(upcoming24h > 0 || scheduled > 0) && (
        <p className="mt-3 text-xs text-slate-400 text-center">{describeNextAppointment(daily).text}</p>
      )}
    </div>
  )
}

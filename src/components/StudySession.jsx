import React, { useState } from 'react'
import StudyCard from './StudyCard.jsx'

/**
 * 一轮学习 / 复习会话容器（受 roundSize 控制，默认 10 词）。
 *
 * 队列在挂载时冻结（useState 初始化），避免答题导致全局队列重新派生后
 * 打乱本轮顺序；每题作答 / 标记后立即通过传入的 answer / markKnown 落盘。
 * 队列耗尽或满 10 词后进入总结页，不自动开下一轮（用户手动再进）。
 *
 * props:
 *   mode        'learn' | 'review'
 *   queue       来自 useLearn.learnQueue 或 reviewQueue 的单词数组
 *   answer      (wordId, result) => { record, statusChanged, mastered }
 *   markKnown   (wordId) => void
 *   onExit      () => void  返回学习首页
 *   onViewInCloud (word) => void  在词云中查看当前词（会话暂停但进度保留）
 *   relatedOf   (word) => { forms, derivatives }  常见变形 / 派生词反查（透传给 StudyCard）
 */
export default function StudySession({
  mode = 'learn',
  queue = [],
  answer,
  markKnown,
  onExit,
  onViewInCloud,
  autoSpeak = false,
  relatedOf,
}) {
  const [round] = useState(() => (Array.isArray(queue) ? queue.slice() : []))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([]) // 每项：{ result, out, wordId }

  const finished = index >= round.length
  const current = finished ? null : round[index]
  const isReview = mode === 'review'

  const submitAnswer = (r) => {
    if (!current) return undefined
    const res = answer ? answer(current.id, r) : undefined
    setResults((prev) => {
      const next = prev.slice()
      next[index] = { result: r, out: res || null, wordId: current.id }
      return next
    })
    return res
  }

  const submitMarkKnown = () => {
    if (!current) return
    if (markKnown) markKnown(current.id)
    setResults((prev) => {
      const next = prev.slice()
      next[index] = { result: 'known', out: null, wordId: current.id }
      return next
    })
  }

  const goNext = () => setIndex((i) => i + 1)

  if (finished) {
    return <Summary mode={mode} round={round} results={results} onExit={onExit} />
  }

  // 已完成比例（已作答的词数 / 本轮总数）
  const progress = round.length > 0 ? (index / round.length) * 100 : 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* 轮次进度 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
          {isReview ? '复习' : '学习'} · 第 {index + 1} / {round.length} 词
        </span>
        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <StudyCard
        key={index}
        word={current}
        mode={mode}
        record={results[index] ? results[index].out && results[index].out.record : null}
        onAnswer={submitAnswer}
        onMarkKnown={submitMarkKnown}
        onNext={goNext}
        onViewInCloud={onViewInCloud}
        autoSpeak={autoSpeak}
        relatedOf={relatedOf}
      />
    </div>
  )
}

/**
 * 本轮总结页。
 */
function Summary({ mode, round, results, onExit }) {
  const remembered = results.filter((r) => r && (r.result === 'known' || r.result === 'correct')).length
  const forgot = results.filter((r) => r && r.result === 'incorrect').length
  const mastered = results.filter(
    (r) => r && (r.result === 'known' || (r.out && r.out.mastered)),
  ).length
  const studied = results.filter(Boolean).length
  const remaining = round.length - studied

  const isReview = mode === 'review'

  const items = [
    { label: '记得', value: remembered, color: '#3fa07a' },
    { label: '不记得', value: forgot, color: '#c9484b' },
    { label: '新增掌握', value: mastered, color: '#9aa1ac' },
    { label: '剩余', value: remaining, color: '#c98a17' },
  ]

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
      <h2 className="text-2xl font-bold text-slate-800">
        {isReview ? '复习完成' : '学习完成'}
      </h2>
      <p className="text-sm text-slate-400 mt-1">本轮共 {round.length} 词</p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-slate-200 p-4">
            <div className="text-3xl font-bold" style={{ color: it.color }}>
              {it.value}
            </div>
            <div className="text-sm text-slate-500 mt-1">{it.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onExit}
        className="mt-8 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        返回
      </button>
    </div>
  )
}

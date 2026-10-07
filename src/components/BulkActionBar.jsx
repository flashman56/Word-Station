import React, { useEffect, useRef, useState } from 'react'

/**
 * 批量操作条：显示已选数量 + 三个批量学习按钮（我会了 / 加入待复习 / 清除学习记录）
 * + 取消选择。执行后保留选择，只在条上短暂显示"已更新 N 个"。
 *
 * 与详情/卡片的「我会了」共用同一 markKnown 行为，结果一致。
 *
 * @param count        已选单词数（用于显示与提示）
 * @param ids          已选单词 id 数组（透传，便于扩展）
 * @param onMarkKnown  () => void，批量「我会了」
 * @param onSetReview  () => void，批量「加入待复习」
 * @param onReset      () => void，批量「清除学习记录」
 * @param onClear      取消选择
 * @param layout       'row' 横向（列表/侧栏）| 'column' 纵向（聚焦视图浮层）
 */
export default function BulkActionBar({ count, ids, onMarkKnown, onSetReview, onReset, onClear, layout = 'row' }) {
  const [flash, setFlash] = useState('')
  const timer = useRef(null)
  const column = layout === 'column'

  useEffect(() => () => clearTimeout(timer.current), [])

  const run = (fn, text) => {
    if (!count) return
    fn()
    setFlash(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFlash(''), 1800)
  }

  return (
    <div
      className={`flex gap-2 px-2 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-xs ${
        column ? 'flex-col' : 'items-center'
      }`}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-medium text-blue-700">已选 {count} 个</span>
        {flash && <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{flash}</span>}
      </div>

      <div className={column ? 'grid grid-cols-2 gap-1' : 'flex items-center gap-1 ml-auto'}>
        <button
          title="批量标记为已掌握"
          onClick={() => run(onMarkKnown, `已更新 ${count} 个`)}
          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
        >
          我会了
        </button>
        <button
          title="批量加入待复习"
          onClick={() => run(onSetReview, `已更新 ${count} 个`)}
          className="px-2 py-1 rounded-md border border-amber-400 text-amber-700 hover:bg-amber-50 text-xs font-medium"
        >
          加入待复习
        </button>
        <button
          title="清除这批单词的学习记录，回到未知"
          onClick={() => run(onReset, `已更新 ${count} 个`)}
          className="px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 text-xs font-medium"
        >
          清除学习记录
        </button>
        <button
          onClick={onClear}
          className={`px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-600 hover:bg-white ${
            column ? 'col-span-2' : ''
          }`}
        >
          取消选择
        </button>
      </div>
    </div>
  )
}

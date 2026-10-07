import React, { useEffect, useRef, useState } from 'react'
import AddToStationMenu from './AddToStationMenu.jsx'

/**
 * 批量操作条：显示已选数量 + 三个批量学习按钮（我会了 / 加入待复习 / 清除学习记录）
 * + 可选的第 4 个「加入小站 ▾」+ 取消选择。执行后保留选择，只在条上短暂显示结果。
 *
 * 与详情/卡片的「我会了」共用同一 markKnown 行为，结果一致。
 *
 * ★ G1：BulkActionBar 有**三个**调用点，不是两个 ★
 *   ListView（列表页）/ FocusView（聚焦视图）/ App.jsx 的 MorphDetail（右侧词群详情）。
 *   三处语义都成立（都是「已选若干词 → 批量操作」），所以第 4 个按钮一处改动
 *   三处生效 —— 但也因此**三处都要验**：任一处漏传 ownerId/stations，
 *   那处的按钮就会静默 disabled，而界面上看不出原因。
 *
 * props:
 *   count        已选单词数（用于显示与提示）
 *   ids          已选单词 id 数组（透传，便于扩展）
 *   onMarkKnown  () => void，批量「我会了」
 *   onSetReview  () => void，批量「加入待复习」
 *   onReset      () => void，批量「清除学习记录」
 *   onClear      取消选择
 *   layout       'row' 横向（列表/侧栏）| 'column' 纵向（聚焦视图浮层）
 *
 *   ★ 以下是 C-02 新增的可选 prop，默认值 = 不渲染该按钮（既有调用点零影响）：
 *   addToStation   是否渲染「加入小站 ▾」。传 true 时下面几个才被用到。
 *   stations / stationsLoading / ownerId / online / currentStationId /
 *   currentStationName / existingKeys / createStation  透传给 AddToStationMenu。
 */
export default function BulkActionBar({
  count,
  ids,
  onMarkKnown,
  onSetReview,
  onReset,
  onClear,
  layout = 'row',
  addToStation = false,
  stations = [],
  stationsLoading = false,
  ownerId = null,
  online = true,
  currentStationId = null,
  currentStationName = '',
  existingKeys = EMPTY_SET,
  createStation = null,
  onRefreshStations = null,
}) {
  const [flash, setFlash] = useState('')
  const timer = useRef(null)
  const column = layout === 'column'

  useEffect(() => () => clearTimeout(timer.current), [])

  /**
   * ★ A-14：flash 文案按动作区分 ★
   *   原来三个按钮共用一句「已更新 N 个」。加了「加入小站」之后这就成了歧义 ——
   *   「已更新 20 个」到底是标了 20 个已掌握，还是加了 20 个进小站？
   *   用户会以为小站里有了。所以每个动作给一句自己的话。
   */
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
          onClick={() => run(onMarkKnown, `已标记 ${count} 个已掌握`)}
          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
        >
          我会了
        </button>
        <button
          title="批量加入待复习"
          onClick={() => run(onSetReview, `已加入 ${count} 个待复习`)}
          className="px-2 py-1 rounded-md border border-amber-400 text-amber-700 hover:bg-amber-50 text-xs font-medium"
        >
          加入待复习
        </button>
        <button
          title="清除这批单词的学习记录，回到未知"
          onClick={() => run(onReset, `已清除 ${count} 个学习记录`)}
          className="px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 text-xs font-medium"
        >
          清除学习记录
        </button>

        {/* ★ C-02：第 4 个按钮。加词是异步的（可能落草稿），
            所以不用 run() 的同步 flash —— 反馈由 AddToStationMenu 自己的提示条给。 */}
        {addToStation && (
          <AddToStationMenu
            ownerId={ownerId}
            stations={stations}
            loading={stationsLoading}
            online={online}
            wordKeys={ids}
            sources={null}
            existingKeys={existingKeys}
            currentStationId={currentStationId}
            currentStationName={currentStationName}
            onCreateStation={createStation}
            onDone={onRefreshStations}
          />
        )}

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

/** 模块级空集合哨兵：默认参数里的字面量每次渲染都是新身份，会让下游 memo 失效 */
const EMPTY_SET = new Set()

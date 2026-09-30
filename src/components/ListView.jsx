import React, { useMemo, useRef, useState } from 'react'
import { TYPES, cefrScore, effectiveStatus } from '../lib/derive.js'
import WordRow from './WordRow.jsx'
import BulkActionBar from './BulkActionBar.jsx'

const COLUMNS = [
  { key: 'form', label: '词形', width: 'w-44' },
  { key: 'freqRank', label: '词频', width: 'w-16' },
  { key: 'cefr', label: '难度', width: 'w-8' },
]

/** 首屏渲染行数上限：词表可上万，一次性渲染全部行会卡死；用「显示更多」逐步加载 */
const PAGE_STEP = 300

/** 行级唯一 key：词群 id + 单词 id（同一单词挂多个词群时是多行） */
const rowKey = (morphId, wordId) => `${morphId}::${wordId}`

export default function ListView({
  morphs,
  orphanWords = [],
  records,
  setStatus,
  onSelectWord,
  selectedWordId,
  selectedIds,
  onToggleCheck,
  onSelectMany,
  onClearSelection,
  onMarkKnown,
  onSetReview,
  onReset,
}) {
  const [sortKey, setSortKey] = useState('freqRank')
  const [asc, setAsc] = useState(true)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [limit, setLimit] = useState(PAGE_STEP)
  // 锚点存「行 key」而不是单词 id：同一个单词可跨词群出现多次，只有行 key 能唯一定位一行
  const lastCheckedKey = useRef(null)

  const toggleGroup = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const sortWords = (list) => {
    const val = (w) => {
      if (sortKey === 'cefr') return cefrScore(w.cefr)
      if (sortKey === 'status') return effectiveStatus(w, records)
      return w[sortKey]
    }
    return [...list].sort((a, b) => {
      const va = val(a)
      const vb = val(b)
      const r = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return asc ? r : -r
    })
  }

  const groups = useMemo(() => {
    const morphGroups = morphs.map((morph) => ({ id: morph.id, morph, orphan: false, words: sortWords(morph.words) }))
    if (!orphanWords.length) return morphGroups
    return [
      {
        id: '__orphan_words__',
        morph: null,
        orphan: true,
        words: sortWords(orphanWords),
      },
      ...morphGroups,
    ]
  }, [morphs, orphanWords, sortKey, asc, records])

  const clickCol = (key) => {
    if (sortKey === key) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  /**
   * 当前展开着的行，按视觉顺序铺平 —— 供 Shift 连续选定位区间。
   * 每一项是 { key, id }：key = 词群 id + 单词 id，行级唯一（同一单词跨词群会出现多行）；
   * id 才是写进 selectedIds 的单词 id（集合本身去重）。
   */
  const totalWords = useMemo(() => groups.reduce((n, g) => n + g.words.length, 0), [groups])

  /**
   * 分页渲染：按词群顺序铺平，只取前 limit 行；折叠的词群只出标题不占额度。
   * 这样 1 万词也只渲染 limit 行，其余靠「显示更多」逐步展开。
   */
  const visibleGroups = useMemo(() => {
    let budget = limit
    const out = []
    for (const g of groups) {
      if (collapsed.has(g.id)) {
        out.push({ ...g, renderWords: [] })
        continue
      }
      if (budget <= 0) break
      const renderWords = g.words.slice(0, budget)
      budget -= renderWords.length
      out.push({ ...g, renderWords })
      if (renderWords.length < g.words.length) break
    }
    return out
  }, [groups, collapsed, limit])

  const renderedCount = useMemo(
    () => visibleGroups.reduce((n, g) => n + g.renderWords.length, 0),
    [visibleGroups],
  )

  const flatRows = useMemo(() => {
    const out = []
    visibleGroups.forEach(({ id, renderWords }) => {
      renderWords.forEach((w) => out.push({ key: rowKey(id, w.id), id: w.id }))
    })
    return out
  }, [visibleGroups])

  /** 当前过滤结果里全部单词（含折叠词群），去重后  */
  const allIds = useMemo(() => {
    const seen = new Set()
    const out = []
    groups.forEach(({ words }) =>
      words.forEach((w) => {
        if (seen.has(w.id)) return
        seen.add(w.id)
        out.push(w.id)
      }),
    )
    return out
  }, [groups])

  /**
   * 勾选：Shift + 点击时把两次点击之间的行一并选中/取消。
   * 整段模式由「这段区间当前是否已经整段选中」决定 —— 已全选就整段取消，否则整段选中。
   * 注意不能只看锚点行：普通点击设下锚点时必然把它勾上，若按"锚点已选中→取消"判定，
   * 第一次 Shift 连选就会被判成取消（区间全空），连最基本的连选都不成立。
   * 用整段判定后，在同一区间上重复 Shift 点击可稳定地在"全选/全不选"之间来回切换。
   */
  const handleCheck = (wordId, shiftKey, key) => {
    const last = lastCheckedKey.current
    if (shiftKey && last && last !== key) {
      const a = flatRows.findIndex((r) => r.key === last)
      const b = flatRows.findIndex((r) => r.key === key)
      if (a !== -1 && b !== -1) {
        const range = flatRows.slice(Math.min(a, b), Math.max(a, b) + 1).map((r) => r.id)
        // 锚点不动：重复 Shift 点击同一行时才能稳定地来回切换
        const allChecked = range.every((id) => selectedIds.has(id))
        onSelectMany(range, allChecked ? 'remove' : 'add')
        return
      }
    }
    lastCheckedKey.current = key
    onToggleCheck(wordId)
  }

  const toggleGroupSelection = (words) => {
    const ids = words.map((w) => w.id)
    const allChecked = ids.every((id) => selectedIds.has(id))
    onSelectMany(ids, allChecked ? 'remove' : 'add')
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-2 pt-2 pb-1 text-xs">
        <button
          onClick={() => onSelectMany(allIds, 'replace')}
          className="px-2 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-white"
        >
          全选当前结果（{allIds.length}）
        </button>
        <button
          onClick={onClearSelection}
          disabled={!selectedIds.size}
          className="px-2 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
        >
          清空选择
        </button>
        <span className="text-slate-400">勾选行首复选框可多选，Shift 点击可连续选</span>
      </div>

      {selectedIds.size > 0 && (
        <div className="px-2 pb-1">
          <BulkActionBar
            count={selectedIds.size}
            ids={[...selectedIds]}
            onMarkKnown={onMarkKnown}
            onSetReview={onSetReview}
            onReset={onReset}
            onClear={onClearSelection}
          />
        </div>
      )}

      <div className="flex items-center gap-2 px-2 py-2 bg-slate-50 border-y border-slate-200 text-xs text-slate-500">
        <div className="w-3.5 shrink-0" />
        {COLUMNS.map((c) => (
          <button
            key={c.key}
            onClick={() => clickCol(c.key)}
            className={`${c.width} text-left font-medium hover:text-blue-600 ${sortKey === c.key ? 'text-blue-600' : ''}`}
          >
            {c.label}
            {sortKey === c.key ? (asc ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
        <div className="flex-1">释义 / 拆解</div>
      </div>

      <div className="max-h-[620px] overflow-y-auto p-1">
        {visibleGroups.map(({ id, morph, orphan, words, renderWords }) => (
          <div key={id}>
            <div className="w-full flex items-center gap-2 px-2 py-1.5 mt-1 bg-slate-50 hover:bg-slate-100 rounded">
              <button
                onClick={() => toggleGroup(id)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span className="text-xs text-slate-400">{collapsed.has(id) ? '▸' : '▾'}</span>
                {orphan ? (
                  <span className="text-xs px-1.5 py-0.5 rounded shrink-0 bg-amber-50 text-amber-700">无词素</span>
                ) : (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: TYPES[morph.type].soft, color: TYPES[morph.type].color }}
                  >
                    {TYPES[morph.type].label}
                  </span>
                )}
                <span className="font-semibold text-sm text-slate-700">
                  {orphan ? '无词素 · 单纯词 / 外来词 / 专有名词 / 固定搭配' : morph.display}
                </span>
                {!orphan && <span className="text-xs text-slate-500 truncate">{morph.gloss}</span>}
                <span className="ml-auto text-xs text-slate-400 shrink-0">{words.length} 词</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroupSelection(words)
                }}
                className="shrink-0 px-1.5 py-0.5 rounded border border-slate-300 text-xs text-slate-500 hover:bg-white"
              >
                {words.every((w) => selectedIds.has(w.id)) ? '取消本群' : '全选本群'}
              </button>
            </div>

            {!collapsed.has(id) && (
              <div>
                {renderWords.map((w) => {
                  const key = rowKey(id, w.id)
                  return (
                    <WordRow
                      key={key}
                      word={w}
                      records={records}
                      onSetStatus={setStatus}
                      onSelect={onSelectWord}
                      selected={selectedWordId === w.id}
                      checked={selectedIds.has(w.id)}
                      onToggleCheck={(wid, shift) => handleCheck(wid, shift, key)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {renderedCount < totalWords && (
          <div className="text-center py-3">
            <button
              onClick={() => setLimit((l) => l + PAGE_STEP)}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              显示更多（已渲染 {renderedCount} / {totalWords} 行）
            </button>
          </div>
        )}

        {groups.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">当前过滤条件下没有词，放宽条件试试。</p>
        )}
      </div>
    </div>
  )
}

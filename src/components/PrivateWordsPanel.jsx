import React, { useMemo, useState } from 'react'
import * as userWordsApi from '../lib/cloud/userWords.js'
import { recordOf as recordOfPure } from '../lib/derive.js'
import UserWordEditor from './UserWordEditor.jsx'
import StatusPill from './StatusPill.jsx'
import { GhostBtn } from './StationLearn.jsx'

/**
 * 「我的私有词」内联列表（侧栏展开）
 * ------------------------------------------------------------------
 * ★ 为什么这个面板是 B 组「移出小站」的硬前置（不是可选优化）★
 *   私有词的**编辑 / 重新生成 / 删除入口只在 StationLearn 内**。一旦把一个私有词
 *   「移出小站」，它就离开了所有小站 → 编辑入口消失 → 但它照样计入统计、
 *   照样出现在复习队列里。于是用户看到一个**清不掉的幽灵词**：能背、能统计，
 *   却找不到在哪删。本面板是那个出口。
 *
 * ★ 为什么用「全量渲染 + 显示更多」而不用服务端分页（Q3 已定）★
 *   ① useUserWords 本来就是全量拉取（userWordsApi.listMine 无 limit）且缓存全量，
 *      复用它 = 零新请求路径 + 断网自动可用。服务端分页要再造一条 paged fetch
 *      + 一套缓存失效逻辑；
 *   ② MAX_VOCAB_PRIVATE_WORDS = 500 是**词汇量估算护栏**，不是存储上限 ——
 *      拿它当分页阈值是误读；
 *   ③ 「上万行列表卡顿」这个问题 ListView 已用 PAGE_STEP + 「显示更多」解过一次。
 *      **复用同一模式，不引入第二个概念。**
 *
 * ★ 与「移出小站」在 UI 上必须一眼可辨（Q2）★
 *   | 操作     | 文案       | 位置               | 语义                       |
 *   |----------|------------|--------------------|----------------------------|
 *   | 本面板   | 彻底删除   | 行尾独立位置、红字 | 删 user_words + 所有小站引用 |
 *   | 小站内   | 移出小站   | 行内操作区、灰按钮 | 只删 station_words 一行引用  |
 *   两个**后果相反**的按钮绝不能同名。
 *
 * props:
 *   userWords   useUserWords().words（全量，离线可用）
 *   records     全量学习记录（给 StatusPill 用）
 *   ownerId     当前账号（UserWordEditor 保存 / 删除都要真实 uid）
 *   existingKeys 当前小站已有的 wordKey 集合（标「已在「x」✓」）
 *   currentStationName 当前小站名（用于那句提示）
 *   onAddToStation (word) => void  加入小站（T05 接 AddToStationMenu）
 *   onRefresh   刷新回调（编辑 / 删除之后要同时刷私有词与小站词条）
 *   onClose     收起面板
 */
export default function PrivateWordsPanel({
  userWords = EMPTY_LIST,
  records = EMPTY_MAP,
  ownerId = null,
  existingKeys = EMPTY_SET,
  currentStationName = '',
  onAddToStation,
  onRefresh,
  onClose,
}) {
  const [limit, setLimit] = useState(PAGE_STEP)
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState(null)
  const [busyKey, setBusyKey] = useState(null)

  const list = userWords || EMPTY_LIST
  const recs = records || EMPTY_MAP
  const existing = existingKeys instanceof Set ? existingKeys : new Set(existingKeys || [])

  const visible = useMemo(() => list.slice(0, limit), [list, limit])

  if (editing) {
    return (
      <div className="mt-2">
        <UserWordEditor
          word={editing}
          ownerId={ownerId}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            if (onRefresh) await onRefresh()
          }}
        />
      </div>
    )
  }

  /**
   * ★ 彻底删除私有词 = 删 user_words 行 + 删掉**所有**小站里的引用 ★
   *   （userWordsApi.remove 的真实行为就是这两件事，学习记录不受影响）
   *   confirm 必须把「所有小站里的引用也会一并移除」写进去 —— 否则用户会以为
   *   只是从列表里移除，而实际上别的小站里那个词也没了。
   */
  const removeWord = async (w) => {
    if (!window.confirm(
      `彻底删除私有词「${w.form}」？\n` +
        `· 这个词条会从「我的私有词」里消失\n` +
        `· 它在**所有**小站里的引用也会一并移除\n` +
        `· 你的学习记录保留（仍会出现在「学习」页的复习队列里）\n` +
        `此操作不可撤销。`,
    )) return
    setBusyKey(w.wordKey)
    setError(null)
    setNotice(null)
    const { error: err } = await userWordsApi.remove(ownerId, w.userWordId, w.wordKey)
    setBusyKey(null)
    if (err) {
      setError(`删除失败：${err.message}`)
      return
    }
    // ★ 事后反馈（不能只靠 confirm 就消失）
    setNotice(`已彻底删除「${w.form}」· 各小站里的引用已一并移除，学习记录保留`)
    if (onRefresh) await onRefresh()
  }

  return (
    <div className="mt-2 border border-slate-200 rounded bg-white">
      <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border-b border-slate-200 text-xs">
        <span className="font-medium text-slate-600">我的私有词 {list.length} 个</span>
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600" title="收起">
          ▾收起
        </button>
      </div>

      {error && (
        <div className="mx-2 mt-2 text-xs px-2 py-1.5 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mx-2 mt-2 text-xs px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
          {notice}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState loggedIn={Boolean(ownerId)} />
      ) : (
        <>
          <div className="max-h-72 overflow-auto divide-y divide-slate-100">
            {visible.map((w) => {
              const rec = recs[w.wordKey] || recordOfPure(w, recs)
              const st = rec && rec.status ? rec.status : 'unknown'
              const inStation = existing.has(w.wordKey)
              const busy = busyKey === w.wordKey
              return (
                <div key={w.wordKey} className="px-2 py-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(w)}
                      className="font-medium text-blue-700 hover:underline shrink-0"
                      title="编辑 / 重新生成这条私有词"
                    >
                      {w.form}
                    </button>
                    <span className="text-xs text-slate-400 shrink-0">{w.pos}</span>
                    <span className="text-xs text-slate-600 truncate">{w.gloss}</span>

                    <span className="ml-auto flex items-center gap-1.5 shrink-0">
                      {inStation && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                          title={`已在「${currentStationName || '当前小站'}」中`}
                        >
                          已在「{currentStationName || '当前小站'}」✓
                        </span>
                      )}
                      <StatusPill status={st} size="sm" />
                    </span>
                  </div>

                  {/* 操作区：与「彻底删除」在位置与视觉上分开（Q2） */}
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <GhostBtn onClick={() => setEditing(w)} title="编辑释义 / 词性 / 例句">
                      编辑
                    </GhostBtn>
                    {onAddToStation && (
                      <GhostBtn
                        onClick={() => onAddToStation(w)}
                        title={inStation ? `已在「${currentStationName || '当前小站'}」中，可选择其他小站` : '加入小站'}
                      >
                        加入小站 ▾
                      </GhostBtn>
                    )}
                    <span className="text-[10px] text-slate-400">
                      移出小站请到小站页内操作（那里只删引用，词条仍在本列表）
                    </span>

                    {/* ★ 彻底删除：行尾独立位置 + 红字，与「移出小站」三个维度都不同 ★ */}
                    <button
                      onClick={() => removeWord(w)}
                      disabled={busy}
                      title="彻底删除这个词条，它在所有小站里的引用也会一并移除；学习记录不受影响。"
                      className="ml-auto px-1.5 py-0.5 rounded border border-red-300 text-red-600 text-[11px] hover:bg-red-50 disabled:opacity-50"
                    >
                      {busy ? '删除中…' : '彻底删除'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {visible.length < list.length && (
            <div className="text-center py-2 border-t border-slate-100">
              <button
                onClick={() => setLimit((l) => l + PAGE_STEP)}
                className="px-2 py-1 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                显示更多（已显示 {visible.length} / {list.length} 个）
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * 空态：**说明下一步能做什么**，不只说「空」。
 * 与「已知词处理」那节的口径一致（每处列表都要有空态且要有出路）。
 */
function EmptyState({ loggedIn }) {
  if (!loggedIn) {
    return (
      <div className="px-3 py-6 text-center text-sm text-slate-400">
        私有词需要登录才能保存。
        <span className="block text-xs mt-1">未登录时学习进度只存在本机浏览器。</span>
      </div>
    )
  }
  return (
    <div className="px-3 py-6 text-center text-sm text-slate-400">
      还没有私有词。
      <span className="block text-xs mt-1">
        在「小站」里粘贴生词，不在公共库的词会自动生成并存进这里；也可以在「学习」页答题时生成。
      </span>
    </div>
  )
}

/** 首屏渲染行数：与 ListView 的 PAGE_STEP 同一模式（全量数据 + 增量渲染） */
export const PAGE_STEP = 100

/** 模块级空值哨兵：默认参数里的字面量 [] / {} 每次渲染都是新身份，会让下游 memo 失效 */
const EMPTY_LIST = []
const EMPTY_MAP = {}
const EMPTY_SET = new Set()

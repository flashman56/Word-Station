import React, { useState } from 'react'

/**
 * 小站切换 / 新建 / 改名 / 删除 / 置顶
 *
 * props:
 *   stations      useStations() 的返回值
 *   auth          useAuth() 的返回值（用于判断是否登录）
 */
export default function StationBar({ stations: api, auth }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const submitCreate = async (e) => {
    e.preventDefault()
    const created = await api.createStation(name)
    if (created) {
      setName('')
      setCreating(false)
    }
  }

  const submitRename = async (e, id) => {
    e.preventDefault()
    const ok = await api.renameStation(id, renameValue)
    if (ok) {
      setRenamingId(null)
      setRenameValue('')
    }
  }

  const doRemove = async (station) => {
    if (!window.confirm(`删除小站「${station.name}」？站内词条会一并移除，不可撤销。`)) return
    await api.removeStation(station.id)
  }

  if (!auth.user) {
    return (
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
        游客模式：小站与云端同步需先
        <span className="font-medium"> 登录 </span>
        （未登录时学习进度只存在本机浏览器）。
      </div>
    )
  }

  return (
    <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center gap-2 flex-wrap text-xs">
      <span className="text-slate-400">我的小站</span>

      {api.loading && <span className="text-slate-400">加载中…</span>}

      {!api.loading && api.stations.length === 0 && !creating && (
        <span className="text-slate-400">还没有小站，点右侧「+ 新建」创建一个（如「雅思」「论文阅读」）</span>
      )}

      {api.stations.map((s) => (
        <div
          key={s.id}
          className={`flex items-center gap-1 px-2 py-1 rounded border ${
            s.id === api.currentId ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {renamingId === s.id ? (
            <form onSubmit={(e) => submitRename(e, s.id)} className="flex items-center gap-1">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-24 px-1 py-0.5 border border-slate-300 rounded"
              />
              <button type="submit" className="text-blue-600">保存</button>
              <button type="button" onClick={() => setRenamingId(null)} className="text-slate-400">取消</button>
            </form>
          ) : (
            <>
              <button onClick={() => api.setCurrentId(s.id)} className="font-medium">
                {s.pinned ? '📌 ' : ''}
                {s.name}
              </button>
              <button
                onClick={() => api.togglePin(s.id, !s.pinned)}
                title={s.pinned ? '取消置顶' : '置顶'}
                className="text-slate-400 hover:text-amber-600"
              >
                {s.pinned ? '★' : '☆'}
              </button>
              <button
                onClick={() => {
                  setRenamingId(s.id)
                  setRenameValue(s.name)
                }}
                title="改名"
                className="text-slate-400 hover:text-blue-600"
              >
                ✎
              </button>
              <button onClick={() => doRemove(s)} title="删除" className="text-slate-400 hover:text-red-600">
                ✕
              </button>
            </>
          )}
        </div>
      ))}

      {creating ? (
        <form onSubmit={submitCreate} className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="小站名"
            className="w-28 px-1.5 py-0.5 border border-slate-300 rounded"
          />
          <button type="submit" disabled={api.busy} className="px-1.5 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            创建
          </button>
          <button type="button" onClick={() => setCreating(false)} className="text-slate-400">
            取消
          </button>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="px-2 py-1 rounded border border-dashed border-slate-400 text-slate-500 hover:bg-slate-50"
        >
          + 新建
        </button>
      )}

      {api.error && <span className="text-red-600">{api.error.message}</span>}
    </div>
  )
}

import React from 'react'

/**
 * 同步状态徽标（三态契约）
 * ------------------------------------------------------------------
 *   ✅ 已同步 <时间>      绿色
 *   ⏳ 同步中…             灰色
 *   ⚠ 离线 · N 条待同步   琥珀色（可点手动重试）
 *
 * 答题等本地操作永不阻塞：离线时照常可用，只是徽标变琥珀。
 *
 * props:
 *   sync      useSync() 的返回值
 *   ownerId   当前用户 id（游客时不显示云端状态）
 */
export default function SyncBadge({ sync, ownerId }) {
  if (!ownerId) {
    return (
      <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-400">
        本地模式
      </span>
    )
  }

  const offline = !sync.online
  const pending = sync.pending || 0

  const cls = offline || pending > 0
    ? 'border-amber-300 bg-amber-50 text-amber-700'
    : sync.syncing
      ? 'border-slate-300 bg-slate-50 text-slate-500'
      : 'border-emerald-300 bg-emerald-50 text-emerald-700'

  const text = offline
    ? `离线 · ${pending} 条待同步`
    : pending > 0
      ? `${pending} 条待同步`
      : sync.syncing
        ? '同步中…'
        : sync.lastSyncAt
          ? `已同步 ${sync.lastSyncAt.slice(11, 16)}`
          : '已同步'

  return (
    <button
      onClick={() => sync.syncNow()}
      disabled={sync.syncing}
      title={sync.lastSyncAt ? `上次同步：${sync.lastSyncAt}` : '尚未同步过'}
      className={`px-2 py-1 rounded border text-[11px] hover:brightness-95 disabled:opacity-60 ${cls}`}
    >
      {text}
    </button>
  )
}

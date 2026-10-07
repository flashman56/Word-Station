import React from 'react'

/**
 * 同步状态徽标（五态契约）
 * ------------------------------------------------------------------
 * 同时接两个数据源：
 *   sync —— 连接层 + 草稿层（useSync：online / pending）
 *   learn —— 上行 + 合并层（useLearnCloud：syncStatus / lastError / flush）
 * 旧实现只看 useSync，看不到上行失败，徽标在「上传失败」时仍显示绿色「已同步」。
 *
 *   游客            本地模式（游客）        slate
 *   learn.lastError 上传失败：<原因> · 点此重试   red
 *   离线 / 有待传   离线 · N 条待传          amber
 *   同步中           同步中…                slate
 *   已同步          已同步 HH:mm           emerald
 *
 * 答题等本地操作永不阻塞：离线时照常可用，只是徽标变琥珀。
 *
 * 点击 → learn.flush()（= pushDirty(true) + drain + pull）。
 * 旧实现点的是 sync.syncNow()，它只补传草稿、不推 dirty —— 用户点了没反应，
 * 因为真正待传的数据在 dirty 集合里而不在草稿队列里。
 *
 * props:
 *   sync      useSync() 的返回值（可选，缺省按未登录处理）
 *   ownerId   当前用户 id（游客时不显示云端状态）
 *   learn     useLearnCloud() 的返回值（可选）
 */
export default function SyncBadge({ sync, ownerId, learn = null }) {
  if (!ownerId) {
    return (
      <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-400">
        本地模式（游客）
      </span>
    )
  }

  const s = sync || {}
  const offline = !s.online
  const pending = learn?.pending ?? s.pending ?? 0
  const learning = learn?.syncStatus === 'syncing' || s.syncing
  const lastError = learn?.lastError || null
  const lastSyncAt = learn?.lastSyncAt ?? s.lastSyncAt ?? null

  // ① 上行失败优先展示（红色，且必须可点重试）
  if (lastError) {
    const msg = lastError.message || lastError.code || '未知原因'
    return (
      <Badge
        cls="border-red-300 bg-red-50 text-red-700"
        title={`上传失败：${msg}（${lastError.code || 'no code'}）`}
        onClick={learn?.flush ? () => learn.flush() : () => s.syncNow?.()}
        text={`上传失败：${truncate(msg, 18)} · 点此重试`}
      />
    )
  }

  // ② 离线 / 有待传草稿
  if (offline || pending > 0) {
    return (
      <Badge
        cls="border-amber-300 bg-amber-50 text-amber-700"
        title={offline ? '当前离线，恢复网络后会自动补传' : `${pending} 条草稿待补传`}
        onClick={learn?.flush ? () => learn.flush() : () => s.syncNow?.()}
        text={offline ? `离线 · ${pending} 条待传` : `${pending} 条待传`}
      />
    )
  }

  // ③ 同步中
  if (learning) {
    return (
      <Badge
        cls="border-slate-300 bg-slate-50 text-slate-500"
        title="正在与云端对齐学习记录"
        disabled
        text="同步中…"
      />
    )
  }

  // ④ 已同步
  return (
    <Badge
      cls="border-emerald-300 bg-emerald-50 text-emerald-700"
      title={lastSyncAt ? `上次同步：${lastSyncAt}` : '尚未同步过'}
      onClick={learn?.flush ? () => learn.flush() : () => s.syncNow?.()}
      text={lastSyncAt ? `已同步 ${lastSyncAt.slice(11, 16)}` : '已同步'}
    />
  )
}

/** 截断过长文案，避免徽标撑破布局 */
function truncate(text, max) {
  const s = String(text ?? '')
  return s.length > max ? `${s.slice(0, max)}…` : s
}

/** 统一样式的按钮 / 静态标签 */
function Badge({ cls, text, title, onClick, disabled = false }) {
  if (!onClick) {
    return (
      <span className={`px-2 py-1 rounded border text-[11px] ${cls}`} title={title}>
        {text}
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded border text-[11px] hover:brightness-95 disabled:opacity-60 ${cls}`}
    >
      {text}
    </button>
  )
}
import React from 'react'

/**
 * 同步状态徽标（六态契约）
 * ------------------------------------------------------------------
 * 同时接两个数据源：
 *   sync —— 连接层 + 草稿层（useSync：online / pending / stuck）
 *   learn —— 上行 + 合并层（useLearnCloud：syncStatus / lastError / storageError / flush）
 *
 * | 条件                                   | 文案                                | 配色    |
 * |----------------------------------------|-------------------------------------|---------|
 * | !ownerId                               | 本地模式（游客）                    | slate   |
 * | storageError.code === 'QUOTA_EXCEEDED' | 本机存储已满 · 改动未保存（A-12）  | red     |
 * | learn.lastError                        | 上传失败：<原因> · 点此重试         | red     |
 * | 离线 / pending > 0                     | 离线 · N 条待传                     | amber   |
 * | learn.syncStatus === 'syncing'         | 同步中…                             | slate   |
 * | lastSyncAt                             | 已同步 HH:mm                        | emerald |
 *
 * ★ 容量告警优先级最高（A-12）★
 *   它意味着「用户以为存上了其实没存」—— 内存里是新的、磁盘是旧的，刷新即丢。
 *   这比上传失败严重得多（上传失败还有草稿兜着），所以压过 lastError 与离线态。
 *   告警态**持续到下一次 persist 成功**才恢复，不做成一次性 toast ——
 *   否则用户改完一条看到告警消失，会以为问题已经解决。
 *
 * ★ A-14：pending 与 stuck 分开 ★
 *   pending = 还能传的；stuck = 传不上去的（永久失败 / 跨账号被 park 的）。
 *   stuck 不计入 pending，所以徽标能回到绿色；但它也不会自己消失 ——
 *   所以文案里带上 M，并提供一键清除。
 *
 * props:
 *   sync      useSync() 的返回值（可选，缺省按未登录处理）
 *   ownerId   当前用户 id（游客时不显示云端状态）
 *   learn     useLearnCloud() 的返回值（可选）
 */
export default function SyncBadge({ sync, ownerId, learn = null }) {
  const s = sync || {}
  const pending = learn?.pending ?? s.pending ?? 0
  const stuck = learn?.stuck ?? s.stuck ?? 0
  const learning = learn?.syncStatus === 'syncing' || s.syncing
  const lastError = learn?.lastError || null
  const lastSyncAt = learn?.lastSyncAt ?? s.lastSyncAt ?? null
  const storageError = learn?.storageError || null
  const retry = () => (learn?.flush ? learn.flush() : s.syncNow?.())

  // ⓿ 容量告警（A-12）—— **优先级最高，压过下面所有态，包括「游客」**
  //
  //   为什么游客也要显示：游客恰恰是最可能撑爆本机配额的人（3 万条继承记录
  //   就存在本地，且云端没有任何副本）。如果这里先 return 掉游客态，
  //   容量告警就恰好对最需要它的人不可见 —— 而「以为存上了其实没存」正是
  //   A-12 要消灭的那个后果。
  if (storageError && storageError.code === 'QUOTA_EXCEEDED') {
    return (
      <Badge
        cls="border-red-300 bg-red-50 text-red-700"
        title={STORAGE_FULL_TITLE}
        onClick={retry}
        text={STORAGE_FULL_TEXT}
      />
    )
  }
  // 写失败但不是配额问题（如隐私模式下 setItem 抛别的错）→ 同样必须可见
  if (storageError) {
    return (
      <Badge
        cls="border-red-300 bg-red-50 text-red-700"
        title={`${WRITE_FAILED_TITLE}\n（${storageError.code}: ${storageError.message || '未知原因'}）`}
        onClick={retry}
        text={WRITE_FAILED_TEXT}
      />
    )
  }

  if (!ownerId) {
    return (
      <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-400">
        本地模式（游客）
      </span>
    )
  }

  const offline = !s.online

  // ① 上传失败
  if (lastError) {
    const msg = lastError.message || lastError.code || '未知原因'
    return (
      <Badge
        cls="border-red-300 bg-red-50 text-red-700"
        title={`上传失败：${msg}（${lastError.code || 'no code'}）`}
        onClick={retry}
        text={responsiveText(`上传失败：${truncate(msg, 18)} · 点此重试`, '上传失败')}
      />
    )
  }

  // ② 离线 / 有待传
  if (offline || pending > 0) {
    return (
      <Badge
        cls="border-amber-300 bg-amber-50 text-amber-700"
        title={offline ? '当前离线，恢复网络后会自动补传' : `${pending} 条草稿待补传`}
        onClick={retry}
        text={responsiveText(stuckText(offline, pending, stuck), offline ? `离线 ${pending}` : `${pending} 条`)}
      />
    )
  }

  // ②' 只有 stuck（pending 已归零）：徽标回到可点清除的形态
  if (stuck > 0) {
    return (
      <Badge
        cls="border-amber-300 bg-amber-50 text-amber-700"
        title={STUCK_TITLE}
        onClick={() => confirmClearStuck(learn, stuck)}
        text={responsiveText(stuckText(false, 0, stuck), `${stuck} 条`)}
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
        text={responsiveText('同步中…', '同步中')}
      />
    )
  }

  // ④ 已同步
  return (
    <Badge
      cls="border-emerald-300 bg-emerald-50 text-emerald-700"
      title={lastSyncAt ? `上次同步：${lastSyncAt}` : '尚未同步过'}
      onClick={retry}
      text={responsiveText(lastSyncAt ? `已同步 ${lastSyncAt.slice(11, 16)}` : '已同步', '已同步')}
    />
  )
}

// ---------------------------------------------------------------- 文案（已定稿，不得改写）

/** A-12 容量告警徽标文案 */
const STORAGE_FULL_TEXT = '本机存储已满 · 改动未保存'

/**
 * A-12 展开说明。
 *
 * 四条措辞约束（设计 §3.6）：
 *   1. 必须提到「刷新会丢」—— 这是唯一能改变用户行为的信息；
 *   2. 必须说清「最近的改动」而非「你的数据」—— 分区后绝大多数记录早已落盘，
 *      丢的只是写失败那几条；写成「数据会丢失」会让用户以为要全部重来；
 *   3. 必须给出可执行的下一步（清理存储 / 换浏览器）；
 *   4. 用「建议」而非命令 —— 不替用户决定。
 *
 * ★ 依赖提醒 ★「先导出 JSON 备份当前进度」这句建议的前提是 `useLearn` 的
 *   `exportJson` 继续序列化**内存态** records（而不是读 localStorage）。
 *   写盘失败时磁盘是旧的、内存是新的 —— 若哪天改成读盘，导出的就会是
 *   「丢掉了最近改动」的那份，这句建议随之变成假承诺。
 *   该依赖记录在 src/hooks/useLearn.js 的 exportJson 上。
 */
const STORAGE_FULL_TITLE = [
  '本机存储空间不足，最近的改动没能保存到磁盘。刷新或关闭页面会丢失本次改动。',
  '建议先点侧栏「导出 JSON」备份当前进度，再清理浏览器存储或换用其他浏览器后继续。',
].join('\n')

/** 非配额类写失败（隐私模式等）同样必须可见 */
const WRITE_FAILED_TEXT = '本机存储写入失败 · 改动未保存'
const WRITE_FAILED_TITLE =
  '本机存储写入失败，最近的改动没能保存到磁盘。刷新或关闭页面会丢失本次改动。\n建议先点侧栏「导出 JSON」备份当前进度。'

const STUCK_TITLE =
  '这些草稿已确认传不上去（多半属于另一个账号，或被服务器拒绝），仍保留在本地队列里。\n点击可清除它们 —— 只会删草稿，不会影响已保存的学习记录。'

/**
 * 组合「待传 / 传不上去」两段文案。
 * @param {boolean} offline
 * @param {number} pending
 * @param {number} stuck
 * @returns {string}
 */
function stuckText(offline, pending, stuck) {
  const left = offline ? `离线 · ${pending} 条待传` : `${pending} 条待传`
  if (stuck <= 0) return left
  return `${left} · ${stuck} 条传不上去`
}

/**
 * 一键清除「传不上去」的草稿（A-14）。
 * ★ 只删草稿队列，不碰任何学习记录 ★（学习记录在 learn 分区，与草稿是两个独立的键）
 */
function confirmClearStuck(learn, stuck) {
  if (!learn?.clearStuck) return
  const ok = window.confirm(
    `有 ${stuck} 条草稿传不上去（多半属于另一个账号，或被服务器拒绝）。\n\n` +
      '清除它们只会删掉这些待传草稿，不会影响你已经保存的学习记录。\n\n' +
      '确定清除吗？',
  )
  if (ok) learn.clearStuck()
}

/** 截断过长文案，避免徽标撑破布局 */
function truncate(text, max) {
  const s = String(text ?? '')
  return s.length > max ? `${s.slice(0, max)}…` : s
}

/**
 * 移动端显示短文案，桌面端显示完整文案。
 * 顶部栏在手机上横向空间极紧，把徽标压短才能让 小站/学习/总览/聚焦/列表 五个 tab 显出来。
 */
function responsiveText(full, short) {
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  )
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
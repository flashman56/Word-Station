import React, { useEffect, useRef, useState } from 'react'
import * as addToStationApi from '../lib/addToStation.js'

/**
 * 「加入小站 ▾」下拉（三处共用：WordDetail / BulkActionBar / 我的私有词面板）
 * ------------------------------------------------------------------
 * ★ 为什么是「下拉选站」而不是「立即加入当前小站」★
 *   当前小站未必是目标。用户在看某个词的详情时，想加的可能是另一个小站 ——
 *   「立即加入当前小站」会把它塞进一个他没选的地方，而且不告诉他。
 *
 * ★ K2 跨小站去重是 P2，所以下拉头部**必须**有一行小字把口径说清 ★
 *   「✓ 已在」只标注**当前小站**（复用 App 已有的 existingKeys，零新增请求）。
 *   若不说清，用户会以为「没标 = 一定没有」，而重复添加是被数据库唯一索引
 *   + ignoreDuplicates **静默跳过**的 —— 用户什么反馈都收不到。
 *   所以结果汇总恒含 skipped 计数。这是 P2 落地前唯一的诚实出口。
 *
 * ★ 无小站时引导新建并自动加入（不让用户做两件事）★
 *   先建站再手动加词是两步，而用户的心智是「我想把这个词存起来」。
 *   离线建站也走同一条路（A-10 已支持），只是提示变成「已存为离线草稿」。
 *
 * props:
 *   ownerId       当前账号；null → 整个按钮 disabled（游客不做本地小站：
 *                  那会立刻引出「登出后小站去哪」这个我们答不了的问题）
 *   stations      useStations().stations
 *   loading       小站是否在加载
 *   online        是否在线（离线也允许 —— 走草稿队列）
 *   wordKeys      要加入的 wordKey 数组（批量时多个）
 *   sources       Record<'public'|'user', true>，与 wordKeys 等长时用前缀决定 source；
 *                 传数组则按位取。**传 sources 时 source 由它决定**，
 *                 因为私有词的 source 恒为 'user'，不能靠猜。
 *   existingKeys  当前小站已有的 wordKey 集合（只标当前小站）
 *   currentStationId / currentStationName  当前小站
 *   onCreateStation (name) => Promise<station|null>  新建小站（零站时行内新建用；
 *                 复用 useStations.createStation，离线时它会落草稿 + 乐观插入）
 *   onDone        (result) => void   完成后回调（触发词条刷新）
 *   label         按钮文案（默认「加入小站」）
 */
export default function AddToStationMenu({
  ownerId = null,
  stations = [],
  loading = false,
  online = true,
  wordKeys = [],
  sources = null,
  existingKeys = EMPTY_SET,
  currentStationId = null,
  currentStationName = '',
  onCreateStation,
  onDone,
  label = '加入小站',
  size = 'sm',
}) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState(null)
  const ref = useRef(null)
  const timer = useRef(null)

  const keys = Array.isArray(wordKeys) ? wordKeys : [wordKeys].filter(Boolean)
  const count = keys.length
  const existing = existingKeys instanceof Set ? existingKeys : new Set(existingKeys || [])
  const isMulti = count > 1

  /** ★ 由 sources 决定每项的 source；缺省按 'public'（私有词面板会显式传 sources） */
  const itemsOf = (stationId) => {
    const srcs = Array.isArray(sources) ? sources : null
    return keys.map((k, i) => ({
      wordKey: k,
      source: srcs ? (srcs[i] === 'user' ? 'user' : 'public') : 'public',
    }))
  }

  // 卸载时清掉未触发的定时器（否则会对已卸载组件 setState）
  useEffect(() => () => clearTimeout(timer.current), [])

  // 点外面关闭
  useEffect(() => {
    if (!open) return undefined
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setCreating(false)
        // ★ 不清 notice：它在按钮旁边的常驻区，是操作结果回执
      }
    }
    window.document.addEventListener('mousedown', onDocClick)
    return () => window.document.removeEventListener('mousedown', onDocClick)
  }, [open])

  /**
   * 结果反馈。
   *
   * ★ 反馈必须显示在**下拉之外** ★
   *   早先把 notice 渲染在下拉内部，而 doAdd 是「先 setOpen(false) 再 finish()」——
   *   于是下拉一关，反馈条跟着卸载，用户**根本看不到结果**：
   *   「已加入 18 个 · 2 个已跳过」这种关键信息（尤其 skipped 计数）白写了。
   *   现在 notice 渲染在按钮旁边、属于常驻区域，与 open 无关。
   *
   * ★ 为什么错误不过期 ★
   *   成功 3.5s 自动消失（用户已经看到结果），错误常驻到下一次操作 ——
   *   失败是需要用户去处理的，滑走等于没提示。
   */
  const finish = (text, tone) => {
    if (tone === 'error') {
      setError(text)
      setNotice(null)
      return
    }
    setNotice(text)
    setError(null)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(null), 3500)
  }

  const doAdd = async (station) => {
    setBusy(true)
    setError(null)
    const res = await addToStationApi.addToStation({
      ownerId,
      stationId: station.id,
      items: itemsOf(station.id),
      online,
    })
    setBusy(false)
    setOpen(false)
    setCreating(false)

    if (res.offline > 0) {
      finish(`已存为离线草稿${res.offline > 0 ? `（${res.offline} 条）` : ''}，联网后自动加入「${station.name}」`)
    } else if (res.inserted > 0) {
      // ★ 批量时恒含 skipped 计数（K2 未落地前的唯一诚实出口）
      const skipped = res.skipped > 0 ? ` · ${res.skipped} 个已跳过` : ''
      finish(
        isMulti
          ? `已加入「${station.name}」${res.inserted} 个${skipped}`
          : `已加入「${station.name}」`,
      )
    } else if (res.skipped > 0) {
      finish(`${res.skipped} 个已在小站中，已跳过`)
    } else if (res.error) {
      finish(`加入失败：${res.error.message}`, 'error')
    } else {
      finish('没有可加入的词', 'error')
    }
    if (onDone) onDone({ ...res, stationId: station.id })
  }

  /**
   * 零小站 → 行内新建并自动加入（不让用户做两件事）。
   * 离线时 createStation 会落草稿并乐观插入（useStations 的 A-10），返回的行
   * 带 pendingSync —— 此时提示语要说「已存为离线草稿」。
   */
  const doCreateAndAdd = async (createStation) => {
    const name = newName.trim()
    if (!name) {
      setError('请输入小站名')
      return
    }
    setBusy(true)
    setError(null)
    const created = await createStation(name)
    if (!created) {
      // 重名 / 未登录 / 校验错 —— createStation 已经 setError 了，这里不重复
      setBusy(false)
      return
    }
    const res = await addToStationApi.addToStation({
      ownerId,
      stationId: created.id,
      items: itemsOf(created.id),
      online,
    })
    setBusy(false)
    setCreating(false)
    setNewName('')
    setOpen(false)

    if (res.offline > 0) {
      finish(`已新建「${created.name}」并存为离线草稿，联网后自动加入`)
    } else if (res.inserted > 0) {
      finish(`已新建「${created.name}」并加入${isMulti ? ` ${res.inserted} 个` : ''}`)
    } else if (res.error) {
      finish(`已新建「${created.name}」，但加入失败：${res.error.message}`, 'error')
    } else {
      finish(`已新建「${created.name}」`, 'error')
    }
    if (onDone) onDone({ ...res, stationId: created.id })
  }

  // 游客：整个按钮 disabled，且给出原因
  if (!ownerId) {
    return (
      <button
        disabled
        title="请先登录后再把小站加词"
        className={`${btnCls(size)} border border-slate-300 text-slate-400 cursor-not-allowed`}
      >
        {label} ▾
      </button>
    )
  }

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        title={loading ? '小站加载中…' : `把这${isMulti ? `${count} 个词` : '个词'}加入指定小站`}
        className={`${btnCls(size)} border border-slate-300 text-slate-600 hover:bg-white ${
          loading ? 'opacity-50 cursor-wait' : ''
        }`}
      >
        {label} ▾
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-md border border-slate-300 bg-white shadow-lg text-xs text-slate-700">
          {/* ★ K2：口径必须写在这里，不能只靠「✓ 已在」暗示 */}
          <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            「✓ 已在」只标注当前小站
            {currentStationName ? `（${currentStationName}）` : ''}；
            加入其他小站不做去重检查，重复的会被自动跳过。
          </div>

          <div className="max-h-64 overflow-auto py-1">
            {/* 置顶优先 */}
            {[...stations]
              .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
              .map((s) => {
                const inHere = isMulti ? false : existing.has(keys[0])
                return (
                  <button
                    key={s.id}
                    onClick={() => doAdd(s)}
                    disabled={busy}
                    className="w-full text-left px-2 py-1.5 hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className={s.pinned ? 'text-amber-600' : ''}>{s.pinned ? '📌' : '·'}</span>
                    <span className="font-medium truncate">{s.name}</span>
                    {s.id === currentStationId && <span className="text-[10px] text-slate-400">当前</span>}
                    {inHere && <span className="ml-auto text-emerald-600 text-[11px]">✓ 已在</span>}
                  </button>
                )
              })}

            {stations.length === 0 && !creating && (
              <div className="px-2 py-2 text-slate-400">你还没有小站</div>
            )}
          </div>

          {/* ★ 零小站 → 行内新建并自动加入（C-03） */}
          {stations.length === 0 || creating ? (
            <div className="px-2 py-1.5 border-t border-slate-200">
              {creating || stations.length === 0 ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && onCreateStation) doCreateAndAdd(onCreateStation)
                    }}
                    placeholder="小站名，如「雅思」"
                    className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                  />
                  <button
                    onClick={() => (onCreateStation ? doCreateAndAdd(onCreateStation) : setError('新建小站功能不可用'))}
                    disabled={busy}
                    className="px-1.5 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    创建并加入
                  </button>
                  {stations.length > 0 && (
                    <button onClick={() => setCreating(false)} className="text-slate-400">
                      取消
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => setCreating(true)} className="text-blue-600 hover:underline">
                  ＋ 新建小站…
                </button>
              )}
            </div>
          ) : (
            <div className="px-2 py-1.5 border-t border-slate-200">
              <button onClick={() => setCreating(true)} className="text-blue-600 hover:underline">
                ＋ 新建小站…
              </button>
            </div>
          )}

          {!online && (
            <div className="px-2 py-1.5 bg-amber-50 border-t border-amber-100 text-[11px] text-amber-800">
              当前离线：会存为草稿，联网后自动加入
            </div>
          )}
        </div>
      )}

      {/* ★ 结果回执渲染在**下拉之外**（与 open 无关）★
          关掉下拉后用户仍能看到「已加入 N 个 · K 个已跳过」——
          skipped 计数是 K2 未落地前唯一的诚实出口，弄丢了就等于没提示。 */}
      {notice && (
        <span className="absolute left-0 top-full mt-1 z-50 w-64 rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-800 shadow-sm">
          {notice}
        </span>
      )}
      {error && (
        <span className="absolute left-0 top-full mt-1 z-50 w-64 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700 shadow-sm">
          {error}
        </span>
      )}
    </span>
  )
}

/** 行内按钮规格：沿用 GhostBtn（11px）用于行内；md 用于详情页的次级按钮 */
function btnCls(size) {
  return size === 'md'
    ? 'px-2 py-1.5 rounded-md text-xs font-medium'
    : 'px-1.5 py-0.5 rounded text-[11px]'
}

/** 模块级空集合哨兵：默认参数里的字面量每次渲染都是新身份 */
const EMPTY_SET = new Set()

import React, { useMemo, useState } from 'react'
import {
  DEFAULT_ROUND_SIZE,
  buildLearnQueue,
  buildReviewQueue,
  countByStatus,
  defaultFamilyKeyOf,
} from '../lib/learning.js'
import { buildBands, normalizeBand, bandFilter } from '../hooks/useLearn.js'
import { buildFoldView } from '../lib/lemmaFold.js'
import { countScheduled } from '../lib/scheduled.js'
import { STATUS } from '../lib/derive.js'
import LearnHome from './LearnHome.jsx'
import StudySession from './StudySession.jsx'
import UserWordEditor from './UserWordEditor.jsx'
import StatusPill, { StatusLegend } from './StatusPill.jsx'

/**
 * 小站内学习 / 复习
 * ------------------------------------------------------------------
 * 复用现有学习闭环：队列与到期口径全部来自 lib/learning.js 的纯函数，
 * 只把「抽词池」从全库换成「本小站的词」（PRD R-07）。
 *
 * 注意：本组件**不自带**学习记录状态 —— records / answer / markKnown 由上层
 * （App 的唯一 useLearnCloud 实例）传入，保证全局只有一份 localStorage 写者。
 *
 * ★ 小站与学习页共用同一份记录（B-5）★
 *   行内徽标与学习页看到的状态、以及这里的复习队列，都来自同一个 `records`，
 *   所以「小站复习」和「学习复习」不是两套进度 —— 到期后两边都会出现该词。
 *
 * ★ 离线草稿投影（A-06）★
 *   `pending` 是「已入草稿队列、还没上云」的词。它们的操作按钮**全部 disabled** ——
 *   标记状态会与草稿补传顺序产生竞态（草稿可能先于标记补传，于是标记落在一个
 *   还没进小站的词上）。而且**不计入 counts.total**（否则离线时「共 128 词」虚高）。
 *
 * props:
 *   words       小站词条（统一视图对象，wordKey 即记录 key）
 *   morphemes   词素表（词族成组用）
 *   records     全量学习记录（Record<wordKey, record>）
 *   answer      (wordKey, result) => void
 *   markKnown   (wordKey) => void
 *   setReview   (wordKey) => void   —— 行内「加入待复习」
 *   retreat     (wordKey) => void   —— 行内「退回复习」
 *   removeWord  (wordKey) => Promise<boolean> —— 「移出小站」（B-01）
 *   online      是否在线（离线时禁用「移出小站」；Q1 已定：不做离线删除队列）
 *   ownerId     当前账号（B-6：UserWordEditor 需要真实 ownerId 才能保存）
 *   pending     离线草稿投影行（默认 []）
 *   onRetrySync 立即重试补传（→ learn.flush()）
 *   onRefresh   小站词条刷新回调
 *   excludeProper 是否排除专有名词（与学习页同一个全局设置；默认 false）
 */
export default function StationLearn({
  words,
  morphemes,
  records,
  answer,
  markKnown,
  setReview,
  retreat,
  removeWord,
  online = true,
  ownerId = null,
  currentStationName = '',
  pending = EMPTY_PENDING,
  onRetrySync,
  onRefresh,
  excludeProper = false,
}) {
  const [band, setBand] = useState('all')
  const [groupByFamily, setGroupByFamily] = useState(true)
  const [sessionMode, setSessionMode] = useState('none')
  const [editing, setEditing] = useState(null)

  const activeBand = useMemo(() => normalizeBand(band), [band])
  const list = words || []
  const recs = records || {}
  const pendingList = pending || EMPTY_PENDING
  const [rowNotice, setRowNotice] = useState(null)

  /**
   * ★ B-01「移出小站」★
   *
   * 语义定稿（**只删 station_words 的一行引用**）：
   *   · user_words 里的私有词条**保留**；
   *   · learn_records 的学习记录**逐字段不变**（nextDueAt / 计数全不变）。
   *
   * ★ 所以 confirm 必须把「不删什么」也写出来 ★
   *   只说「确定移除？」的话，用户最担心的恰恰是「我的学习记录会不会没了」——
   *   而答案是「不会」。写清这一句，用户才敢点。
   *
   * ★ 站内复习队列 vs 学习页复习队列（PRD 3.1.4）★
   *   移除后该词立即从**站内**复习队列消失（list 变小 → 派生队列变小）；
   *   但它**仍在**学习页复习队列里 —— 因为 buildReviewQueue 的 statWords 是
   *   全库 ∪ 私有词，与小站无关。到期后会照常出现在学习页，状态照常更新。
   *   这不是 bug，是设计；所以删除后要给一条事后反馈。
   *
   * ★ Q1 已定：离线时禁用并说明为什么 ★
   *   不做离线删除队列。理由不是「改动小」：
   *     - 加词草稿是**幂等 upsert**（重复执行无损），删除不是；
   *     - remove 草稿一旦被 park（跨账号 / 永久失败）会出现「云端词还在、
   *       用户以为删了、刷新又回来」—— 正是本项目在系统性消灭的那类静默不一致；
   *     - 离线下顺序只靠 queuedAt 侥幸正确，force 重试 / 多设备并发 / 队列重排
   *       任一发生就会提前执行。
   *   offline.js 因此**零改动**、不新增草稿 kind。
   */
  const doRemove = async (w) => {
    if (!online) return
    if (
      !window.confirm(
        `从「${currentStationName || '这个小站'}」移出 ${w.form}？\n` +
          `· 只是从这个小站移除，不会删除这个词条本身\n` +
          `· 你的学习记录保留，仍会出现在「学习」页的复习队列里\n` +
          `· 移出后可以随时从学习页重新加回\n` +
          `此操作不可撤销。`,
      )
    )
      return
    const ok = await removeWord(w.wordKey)
    if (ok) {
      // ★ 事后反馈：不能只靠 confirm（confirm 一关，用户就没有任何回执了）
      setRowNotice(`已从「${currentStationName || '当前小站'}」移出 ${w.form} · 学习记录保留`)
      setTimeout(() => setRowNotice(null), 4000)
      if (onRefresh) await onRefresh()
    } else {
      setRowNotice(`移出失败：${w.form} 仍在小站中，请稍后重试`)
      setTimeout(() => setRowNotice(null), 4000)
    }
  }

  /** 该词的记录（wordKey 与 word.id 天然对齐，无需再算） */
  const recordOf = useMemo(() => (w) => recs[w.id] || recs[w.wordKey], [recs])

  const maxRank = useMemo(
    () =>
      list.reduce(
        (m, w) => (w && typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) && w.freqRank > m ? w.freqRank : m),
        0,
      ),
    [list],
  )
  /**
   * 抽词池 / 统计的基准词表：与学习页同一个 excludeProper 过滤。
   *
   * ★ 只作用于「出什么题」，不作用于「列什么词」★
   *   下方词条列表仍渲染 `list`（它是浏览视图，用户要能看见并编辑自己加进去的词）；
   *   被排除的词只是不进统计与队列 —— 这正是「学习队列设置」而不是「筛选」的语义。
   */
  const baseList = useMemo(
    () => (excludeProper ? list.filter((w) => w && w.kind !== 'proper') : list),
    [list, excludeProper],
  )

  /**
   * ★ 屈折归并（Step-2）：站内与学习页**同口径** ★
   *   foldUnits   = 站内未被折叠的词条（代表形）= 出题单元（保持原顺序）。
   *   foldRecords = 被折叠形记录并入代表形后的读时视图。
   *   观察项：站内若含被折词、而代表词不在站内，该词仍被折叠移除（与学习页统一口径）——
   *   否则「同一份记录、两处口径」会让站内复习与学习页复习打架。
   *   列表渲染仍用 `list`（浏览视图），折叠只作用于统计与出题。
   */
  const fold = useMemo(() => buildFoldView(baseList, recs), [baseList, recs])
  const foldUnits = fold.units
  const foldRecords = fold.records

  const bands = useMemo(() => buildBands(maxRank), [maxRank])
  const bandCounts = useMemo(() => {
    const counts = { all: foldUnits.length }
    bands.forEach((b) => {
      if (b.id !== 'all') counts[b.id] = 0
    })
    foldUnits.forEach((w) => {
      const r = w.freqRank
      if (typeof r !== 'number' || !Number.isFinite(r)) return
      for (let i = 1; i < bands.length; i += 1) {
        if (r > bands[i].lo && r <= bands[i].hi) {
          counts[bands[i].id] += 1
          break
        }
      }
    })
    return counts
  }, [foldUnits, bands])

  /* ★ 与 useLearn.js:584-587 逐字同形：小站也要报「已排期」★
     * LearnHome 渲染 `stats.scheduled ?? 0 > 0` 那一行（LearnHome.jsx:115），
     * 而这里原本只给 countByStatus 的三桶 —— 没有 scheduled 键 → `?? 0` → 恒不渲染。
     * 同一个 LearnHome 组件，小站页永远缺这一栏，而「明天要复习几个」恰恰是小站用户
     * 最该知道的事（小站就是给自己背的一组词）。调用方无需改：补上键即可，
     * 且 countScheduled 与 countByStatus 共用同一个 foldUnits / foldRecords，
     * 子集关系（已排期 ⊆ 待复习）自动成立。 */
  const stats = useMemo(
    () => ({ ...countByStatus(foldUnits, foldRecords), scheduled: countScheduled(foldUnits, foldRecords) }),
    [foldUnits, foldRecords],
  )
  const learnPool = useMemo(() => bandFilter(foldUnits, activeBand), [foldUnits, activeBand])
  const morphTypes = useMemo(() => {
    const map = new Map()
    ;(morphemes || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m.type)
    })
    return map
  }, [morphemes])
  const familyKeyOf = useMemo(
    () => (w) => defaultFamilyKeyOf(w, (id) => morphTypes.get(id)),
    [morphTypes],
  )
  const learnQueue = useMemo(
    () => buildLearnQueue(learnPool, foldRecords, DEFAULT_ROUND_SIZE, { groupByFamily, familyKeyOf }),
    [learnPool, foldRecords, groupByFamily, familyKeyOf],
  )
  const reviewQueue = useMemo(
    () => buildReviewQueue(foldUnits, foldRecords, DEFAULT_ROUND_SIZE, new Date().toISOString()),
    [foldUnits, foldRecords],
  )

  if (editing) {
    return (
      <div className="p-4">
        {/* B-6：ownerId 必须是真实账号 —— 传 null 会让编辑保存直接失败 */}
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

  return (
    <div className="p-4">
      {sessionMode === 'none' ? (
        <>
          <LearnHome
            stats={stats}
            learnQueue={learnQueue}
            reviewQueue={reviewQueue}
            onStartLearn={() => setSessionMode('learn')}
            onStartReview={() => setSessionMode('review')}
            migrationReport={null}
            band={activeBand}
            bands={bands}
            bandCounts={bandCounts}
            onChangeBand={setBand}
            groupByFamily={groupByFamily}
            onToggleGroupByFamily={() => setGroupByFamily((v) => !v)}
            showSharedNote
          />

          <div className="mt-4 border border-slate-200 rounded">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center gap-3">
              <span>
                本小站词条 {list.length} 个（点私有词的词形可编辑）
              </span>
              {/* B-1 事后反馈：移出成功后必须给一条回执，不能只靠 confirm */}
              {rowNotice && <span className="text-emerald-700 font-medium">{rowNotice}</span>}
              {/* B-7：行内有了状态色块后，「颜色代表什么」就成了新问题 —— 补三色图例 */}
              <StatusLegend className="ml-auto" />
            </div>

            {/* ★ A-06：离线草稿投影 ★
                单独一块、单独计数，不混进上面的「共 N 词」—— 混进去会让离线时
                「共 128 词」虚高，而那 20 个词其实还没上云。 */}
            {pendingList.length > 0 && (
              <div className="px-3 py-2 bg-amber-50/60 border-b border-amber-100">
                <div className="flex items-center gap-2 text-xs text-amber-800 mb-1">
                  <span>
                    {pendingList.length} 个词待上传（联网后自动加入本小站）
                  </span>
                  {onRetrySync && (
                    <button
                      onClick={onRetrySync}
                      className="px-1.5 py-0.5 rounded border border-amber-300 text-amber-700 hover:bg-white"
                    >
                      立即重试
                    </button>
                  )}
                </div>
                <div className="max-h-32 overflow-auto divide-y divide-amber-100">
                  {pendingList.map((w) => (
                    <div
                      key={w.wordKey}
                      className="flex items-center gap-2 px-1 py-1 text-sm text-slate-500 italic"
                      title="还没上传到云端，联网后会自动补传"
                    >
                      <span className="truncate">{w.form}</span>
                      {w.pos && <span className="text-xs text-slate-400">{w.pos}</span>}
                      {w.gloss && <span className="text-xs text-slate-400 truncate">{w.gloss}</span>}
                      <span className="ml-auto text-[11px] text-amber-700 shrink-0">待上传</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-72 overflow-auto divide-y divide-slate-100">
              {list.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-slate-400">
                  这个小站还没有词，用上方「批量加词」把生词扔进来。
                </div>
              )}
              {list.map((w) => {
                const rec = recordOf(w)
                const st = rec && rec.status ? rec.status : 'unknown'
                const prog = rec ? `学习中 ${Math.min(rec.consecutiveCorrect || 0, 2)}/2` : ''
                return (
                  <div key={w.wordKey} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                    {w.source === 'user' ? (
                      <button
                        onClick={() => setEditing(w)}
                        className="font-medium text-blue-700 hover:underline"
                        title="编辑这条私有词"
                      >
                        {w.form}
                      </button>
                    ) : (
                      <span className="font-medium text-slate-700">{w.form}</span>
                    )}
                    <span className="text-xs text-slate-400">{w.pos}</span>
                    <span className="text-xs text-slate-600 truncate">{w.gloss}</span>
                    {!w.phoneticBr && <span className="text-xs text-amber-600">音标待补</span>}
                    {w.source === 'user' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        私有
                      </span>
                    )}

                    {/* B-1/B-2：状态徽标 + 行内快捷标记 */}
                    <span className="ml-auto flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {prog && st !== 'known' && (
                        <span className="text-[11px] text-slate-400">{prog}</span>
                      )}
                      <StatusPill status={st} size="sm" />

                      {st !== 'known' && (
                        <GhostBtn onClick={() => markKnown && markKnown(w.wordKey)} title="我会了">
                          我会了
                        </GhostBtn>
                      )}
                      {st !== 'review' && (
                        <GhostBtn onClick={() => setReview && setReview(w.wordKey)} title="加入待复习">
                          待复习
                        </GhostBtn>
                      )}
                      {st === 'known' && (
                        <GhostBtn onClick={() => retreat && retreat(w.wordKey)} title="退回复习">
                          退回复习
                        </GhostBtn>
                      )}

                      {/* ★ B-01 第 4 个按钮：移出小站 ★
                          离线时 disabled + 可执行提示（Q1：不做离线删除队列，
                          理由见 doRemove 的注释）。文案绝不能叫「删除」——
                          那是 UserWordEditor 里「彻底删词条 + 所有小站引用」的语义，
                          两个后果相反的按钮同名会埋雷。 */}
                      <GhostBtn
                        onClick={() => doRemove(w)}
                        disabled={!online || !removeWord}
                        danger
                        title={
                          !online
                            ? '离线时不能移除词条，联网后再试'
                            : `只从「${currentStationName || '当前小站'}」移除这个词；词条本身与学习记录都保留`
                        }
                      >
                        移出小站
                      </GhostBtn>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <StudySession
          mode={sessionMode}
          queue={sessionMode === 'learn' ? learnQueue : reviewQueue}
          answer={answer}
          markKnown={markKnown}
          onExit={() => setSessionMode('none')}
          onViewInCloud={null}
        />
      )}
    </div>
  )
}

/**
 * 行内快捷按钮（11px 幽灵按钮）。
 *
 * 规格沿用本文件既有的「私有」标签（px-1.5 py-0.5 rounded border text-[11px]），
 * 不引入新的设计语言。
 *
 * @param disabled 时按钮禁用（离线态的「移出小站」用）—— 且**必须**由调用方
 *   同时给出 title 说明原因，否则用户只看到一个点不动的按钮。
 */
function GhostBtn({ onClick, title, children, disabled = false, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`px-1.5 py-0.5 rounded border text-[11px] disabled:opacity-50 disabled:hover:bg-transparent ${
        danger
          ? 'border-slate-300 text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-slate-50'
          : 'border-slate-300 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

export { GhostBtn }

/** 空数组哨兵：默认参数里的字面量 [] 每次渲染都是新身份，会让下游 memo 失效 */
const EMPTY_PENDING = []

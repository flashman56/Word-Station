import React, { useMemo, useState } from 'react'
import {
  DEFAULT_ROUND_SIZE,
  buildLearnQueue,
  buildReviewQueue,
  countByStatus,
  defaultFamilyKeyOf,
} from '../lib/learning.js'
import { buildBands, normalizeBand, bandFilter } from '../hooks/useLearn.js'
import LearnHome from './LearnHome.jsx'
import StudySession from './StudySession.jsx'
import UserWordEditor from './UserWordEditor.jsx'

/**
 * 小站内学习 / 复习
 * ------------------------------------------------------------------
 * 复用现有学习闭环：队列与到期口径全部来自 lib/learning.js 的纯函数，
 * 只把「抽词池」从全库换成「本小站的词」（PRD R-07）。
 *
 * 注意：本组件**不自带**学习记录状态 —— records / answer / markKnown 由上层
 * （App 的唯一 useLearnCloud 实例）传入，保证全局只有一份 localStorage 写者。
 *
 * props:
 *   words       小站词条（统一视图对象，wordKey 即记录 key）
 *   morphemes   词素表（词族成组用）
 *   records     全量学习记录（Record<wordKey, record>）
 *   answer      (wordKey, result) => void
 *   markKnown   (wordKey) => void
 *   onRefresh   小站词条刷新回调
 */
export default function StationLearn({ words, morphemes, records, answer, markKnown, onRefresh }) {
  const [band, setBand] = useState('all')
  const [groupByFamily, setGroupByFamily] = useState(true)
  const [sessionMode, setSessionMode] = useState('none')
  const [editing, setEditing] = useState(null)

  const activeBand = useMemo(() => normalizeBand(band), [band])
  const list = words || []

  const maxRank = useMemo(
    () =>
      list.reduce(
        (m, w) => (w && typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) && w.freqRank > m ? w.freqRank : m),
        0,
      ),
    [list],
  )
  const bands = useMemo(() => buildBands(maxRank), [maxRank])
  const bandCounts = useMemo(() => {
    const counts = { all: list.length }
    bands.forEach((b) => {
      if (b.id !== 'all') counts[b.id] = 0
    })
    list.forEach((w) => {
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
  }, [list, bands])

  const stats = useMemo(() => countByStatus(list, records || {}), [list, records])
  const learnPool = useMemo(() => bandFilter(list, activeBand), [list, activeBand])
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
    () => buildLearnQueue(learnPool, records || {}, DEFAULT_ROUND_SIZE, { groupByFamily, familyKeyOf }),
    [learnPool, records, groupByFamily, familyKeyOf],
  )
  const reviewQueue = useMemo(
    () => buildReviewQueue(list, records || {}, DEFAULT_ROUND_SIZE, new Date().toISOString()),
    [list, records],
  )

  if (editing) {
    return (
      <div className="p-4">
        <UserWordEditor
          word={editing}
          ownerId={null}
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
          />

          <div className="mt-4 border border-slate-200 rounded">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              本小站词条 {list.length} 个（点私有词的词形可编辑）
            </div>
            <div className="max-h-72 overflow-auto divide-y divide-slate-100">
              {list.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-slate-400">
                  这个小站还没有词，用上方「批量加词」把生词扔进来。
                </div>
              )}
              {list.map((w) => (
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
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      私有
                    </span>
                  )}
                </div>
              ))}
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

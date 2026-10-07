import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import morphemes from './data/morphemes.js'
import { ANTONYMS, SYNONYMS } from './data/synants.js'
import {
  ORIGINS,
  STATUS,
  TYPES,
  applyFilters,
  buildIndex,
  freqBand,
  recordOf,
  search,
} from './lib/derive.js'
import { buildRelations, pairKey, relationsOf } from './lib/relations.js'
import { phoneticsOfAsync } from './lib/dict.js'
import { estimateVocabulary } from './lib/vocab.js'
import { useSettings } from './hooks/useSettings.js'
import { buildBands, normalizeBand } from './hooks/useLearn.js'
import { useAuth } from './hooks/useAuth.js'
import { useStations } from './hooks/useStations.js'
import { useSync } from './hooks/useSync.js'
import { useLearnCloud } from './hooks/useLearnCloud.js'
import { useStationWords } from './hooks/useStationWords.js'
import Sidebar from './components/Sidebar.jsx'
import LearnHome from './components/LearnHome.jsx'
import StudySession from './components/StudySession.jsx'
import WordRow from './components/WordRow.jsx'
import SpeakerButton from './components/SpeakerButton.jsx'
import EtymologyPanel from './components/EtymologyPanel.jsx'
import BulkActionBar from './components/BulkActionBar.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import StationBar from './components/StationBar.jsx'
import AddWordsPanel from './components/AddWordsPanel.jsx'
import StationLearn from './components/StationLearn.jsx'
import SyncBadge from './components/SyncBadge.jsx'

// 词云三视图：懒加载。用户不点「总览 / 聚焦 / 列表」就永远不下载这几个 chunk
const NetworkView = lazy(() => import('./components/NetworkView.jsx'))
const FocusView = lazy(() => import('./components/FocusView.jsx'))
const ListView = lazy(() => import('./components/ListView.jsx'))

const DEFAULT_FILTERS = {
  query: '',
  status: 'all',
  minCefr: 'B1',
  types: ['root', 'prefix', 'suffix'],
  origins: Object.keys(ORIGINS),
  hideAutoKnown: true,
  // 背单词难度分档（词频区间）：'all' = 全库；区间对象 { id, lo, hi } 随 settings v2 持久化。
  learnBand: 'all',
  // 需求1：新学队列按词族成组出题（默认开，可关回退乱序/原排序）
  groupByFamily: true,
  // 增量：学习卡进入新词时自动朗读单词（默认关，仅朗读单词、不读例句）
  autoSpeak: false,
}

/** ISO 时间格式化：YYYY-MM-DD HH:mm；无值回落「尚未学习」 */
function formatDateTime(iso) {
  if (!iso) return '尚未学习'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '尚未学习'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * 顶层：账号 / 小站 / 同步状态 + 词库按需加载。
 * 词库（16MB）走动态 import，首屏只渲染登录与小站 UI。
 */
export default function App() {
  const [words, setWords] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const auth = useAuth()
  const stations = useStations(auth.userId)
  const sync = useSync({ ownerId: auth.userId })

  useEffect(() => {
    let alive = true
    import('./data/words-entry.js')
      .then((mod) => {
        if (alive) setWords(mod.words || [])
      })
      .catch((e) => {
        if (alive) setLoadError(e && e.message ? e.message : String(e))
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="h-screen flex text-slate-700 bg-slate-100">
      {words ? (
        <AppShell words={words} auth={auth} stations={stations} sync={sync} />
      ) : (
        <div className="flex-1 flex flex-col">
          <TopBar auth={auth} stations={stations} sync={sync} view={null} setView={() => {}} stats={null} />
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            {loadError ? `词库加载失败：${loadError}` : '词库加载中…（首次约需几秒，之后走浏览器缓存）'}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * @param {object} [learn] useLearnCloud() 的返回值；词库未加载完时还没有它，
 *   此时徽标退化为只看 sync（仍可用，只少一态）。
 */
function TopBar({ auth, stations, sync, view, setView, stats, sessionMode, learn = null }) {
  const tabs = [
    ['station', '小站'],
    ['learn', sessionMode !== 'none' ? '学习 · 进行中' : '学习'],
    ['overview', '总览'],
    ['focus', '聚焦'],
    ['list', '列表'],
  ]
  return (
    <>
      <div className="flex items-center gap-2 px-4 h-12 shrink-0 bg-white border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-700 mr-2">词根词缀单词云</span>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView && setView(key)}
            className={`px-3 py-1 rounded-md text-sm ${
              view === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {/* 口径与左栏「可见单词」一致（都按 word.id 去重）；保持纯文本 div 便于回归测试断言 */}
          {stats && (
            <div className="text-xs text-slate-400">
              {`词群 ${stats.morphCount} · 单词 ${stats.uniqueWords ?? stats.wordCount}`}
            </div>
          )}
          <SyncBadge sync={sync} ownerId={auth.userId} learn={learn} />
          <AuthPanel auth={auth} />
        </div>
      </div>
      <StationBar stations={stations} auth={auth} />
    </>
  )
}

/**
 * 主壳体：拿到词库后才挂载（保证 useLearn 的迁移跑在全量词上，不会误写空记录）。
 */
function AppShell({ words, auth, stations, sync }) {
  const [filters, setFilters] = useSettings(DEFAULT_FILTERS)
  const activeBand = useMemo(() => normalizeBand(filters.learnBand), [filters.learnBand])

  const learn = useLearnCloud(words, {
    ownerId: auth.userId,
    online: sync.online,
    learnOpts: {
      band: activeBand,
      groupByFamily: filters.groupByFamily !== false,
      morphemes,
    },
  })

  const [view, setView] = useState(auth.userId ? 'station' : 'learn')
  const [sessionMode, setSessionMode] = useState('none')
  const startLearn = useCallback(() => setSessionMode('learn'), [])
  const startReview = useCallback(() => setSessionMode('review'), [])
  const exitSession = useCallback(() => setSessionMode('none'), [])
  const [selectedMorphId, setSelectedMorphId] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)
  const [networkFocusWordId, setNetworkFocusWordId] = useState(null)
  const [orderBy, setOrderBy] = useState('cefr')
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  // 登录状态变化时把用户带到「小站」页签（首次进入未登录则留学习页）
  useEffect(() => {
    if (auth.userId) setView((v) => (v === 'learn' && sessionMode === 'none' ? 'station' : v))
  }, [auth.userId, sessionMode])

  const stationWords = useStationWords(stations.currentId, auth.userId)
  const existingKeys = useMemo(
    () => new Set((stationWords.refs || []).map((r) => r.wordKey)),
    [stationWords.refs],
  )

  // 词云三视图是 React.lazy 的异步 chunk；首屏渲染完就后台预取，
  // 用户点「总览 / 聚焦 / 列表」时无需再等网络（对慢网与回归测试都友好）
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./components/NetworkView.jsx').catch(() => {})
      import('./components/FocusView.jsx').catch(() => {})
      import('./components/ListView.jsx').catch(() => {})
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const index = useMemo(() => buildIndex(morphemes, words), [words])
  const relationIndex = useMemo(
    () => buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS }),
    [words],
  )
  const orphanWords = useMemo(() => words.filter((word) => word.morphless === true), [words])

  const maxRank = useMemo(
    () =>
      words.reduce(
        (m, w) =>
          w && typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) && w.freqRank > m ? w.freqRank : m,
        0,
      ),
    [words],
  )
  const bands = useMemo(() => buildBands(maxRank), [maxRank])

  // 预测词汇量：纯本地派生（离线 / 未登录天然可用），随学习记录变化重算
  const vocab = useMemo(() => estimateVocabulary(words, learn.records), [words, learn.records])

  const bandCounts = useMemo(() => {
    const counts = {}
    bands.forEach((b) => {
      counts[b.id] = 0
    })
    const seen = new Set()
    words.forEach((w) => {
      if (!w || seen.has(w.id)) return
      seen.add(w.id)
      counts.all += 1
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
  }, [words, bands])

  const query = (filters.query || '').trim()

  const searchResult = useMemo(
    () => search(query, morphemes, words, index.morphById),
    [query, morphemes, words, index],
  )
  const hitWordIds = useMemo(() => new Set(searchResult.words.map((w) => w.id)), [searchResult])

  const visibleOrphans = useMemo(
    () => (query ? orphanWords.filter((w) => hitWordIds.has(w.id)) : orphanWords),
    [query, orphanWords, hitWordIds],
  )

  const wordHits = useMemo(() => (query ? searchResult.words.slice(0, 10) : []), [query, searchResult])

  const { visibleMorphs, stats } = useMemo(
    () =>
      applyFilters(morphemes, words, index.wordsByMorph, learn.records, {
        ...filters,
        types: new Set(filters.types),
        origins: new Set(filters.origins),
      }),
    [filters, learn.records, index, words],
  )
  const visibleStats = useMemo(
    () => ({
      ...stats,
      wordCount: stats.wordCount + visibleOrphans.length,
      uniqueWords: (stats.uniqueWords || 0) + visibleOrphans.length,
    }),
    [stats, visibleOrphans],
  )

  const selectedMorph = useMemo(() => {
    if (!selectedMorphId) return null
    const visible = visibleMorphs.find((m) => m.id === selectedMorphId)
    if (visible) return visible
    const raw = index.morphById.get(selectedMorphId)
    return raw ? { ...raw, words: index.wordsByMorph.get(raw.id) || [] } : null
  }, [selectedMorphId, visibleMorphs, index])

  const openMorph = (id) => {
    setSelectedMorphId(id)
    setSelectedWord(null)
    setView('focus')
  }

  const openRelatedWord = useCallback(
    (wordId) => {
      const word = index.wordById.get(wordId)
      if (!word) return
      setSelectedWord(word)
      setNetworkFocusWordId(word.id)
      setView('overview')
    },
    [index],
  )

  const openWordFromSearch = useCallback((word) => setSelectedWord(word), [])

  const openWordFromStudy = useCallback((word) => {
    if (!word) return
    setSelectedWord(word)
    setNetworkFocusWordId(word.id)
    setView('overview')
  }, [])

  const stepMorph = (delta) => {
    if (!selectedMorph) return
    const i = visibleMorphs.findIndex((m) => m.id === selectedMorph.id)
    const next = visibleMorphs[(i + delta + visibleMorphs.length) % visibleMorphs.length]
    if (next) {
      setSelectedMorphId(next.id)
      setSelectedWord(null)
    }
  }

  // ---------------------------------------------------------------- 多选

  const toggleSelect = useCallback((wordId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(wordId)) next.delete(wordId)
      else next.add(wordId)
      return next
    })
  }, [])

  const selectMany = useCallback((ids, mode = 'add') => {
    setSelectedIds((prev) => {
      if (mode === 'replace') return new Set(ids)
      const next = new Set(prev)
      ids.forEach((id) => {
        if (mode === 'remove') next.delete(id)
        else next.add(id)
      })
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ---------------------------------------------------------------- 单条 / 批量学习操作

  const onMarkKnown = useCallback((wordId) => learn.markKnown(wordId), [learn])
  const onSetReview = useCallback((wordId) => learn.setReview(wordId), [learn])
  const onRetreat = useCallback((wordId) => learn.retreat(wordId), [learn])
  const onReset = useCallback((wordId) => learn.reset(wordId), [learn])

  const setStatus = useCallback(
    (wordId, key) => {
      if (key === 'known') learn.markKnown(wordId)
      else if (key === 'review') learn.setReview(wordId)
      else learn.reset(wordId)
    },
    [learn],
  )

  const bulkMarkKnown = useCallback(() => learn.applyMany([...selectedIds], 'known'), [selectedIds, learn])
  const bulkSetReview = useCallback(() => learn.applyMany([...selectedIds], 'review'), [selectedIds, learn])
  const bulkReset = useCallback(() => learn.applyMany([...selectedIds], 'reset'), [selectedIds, learn])

  // ---------------------------------------------------------------- 导入 / 导出 / 清空

  const handleExport = () => {
    const text = learn.exportJson()
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `word-root-cloud-learn-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const res = learn.importJson(reader.result)
        if (res.ok) alert(`已导入 ${res.count} 条学习记录`)
        else alert(`导入失败：${(res.errors || ['未知错误']).join('；')}`)
      } catch {
        alert('导入失败：不是合法的 JSON')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    if (confirm('确定清空全部学习记录吗？此操作不可撤销。')) learn.clearAll()
  }

  const handleToggleInherit = () => {
    const next = !learn.inheritFreqKnown
    if (confirm('重新迁移将覆盖当前学习记录，确定？')) learn.rerunMigration(next)
  }

  return (
    <>
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        stats={visibleStats}
        learnStats={learn.stats}
        migrationReport={learn.migrationReport}
        inheritFreqKnown={learn.inheritFreqKnown}
        onToggleInherit={handleToggleInherit}
        hitCount={stats.morphCount}
        wordHits={wordHits}
        onSelectWordHit={openWordFromSearch}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
        vocab={vocab}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar
          auth={auth}
          stations={stations}
          sync={sync}
          view={view}
          setView={setView}
          stats={visibleStats}
          sessionMode={sessionMode}
          learn={learn}
        />

        {view === 'focus' && (
          <div className="px-4 py-1.5 flex items-center gap-2 text-sm bg-white border-b border-slate-200">
            <button onClick={() => stepMorph(-1)} className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">
              ← 上一个
            </button>
            <button onClick={() => stepMorph(1)} className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-50">
              下一个 →
            </button>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-sm"
            >
              <option value="cefr">按难度由内到外</option>
              <option value="freq">按词频由内到外</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto">
          {/* ---------------- 小站（批量加词 + 站内复习） ---------------- */}
          {view === 'station' && (
            <div className="divide-y divide-slate-200">
              <AddWordsPanel
                ownerId={auth.userId}
                stationId={stations.currentId}
                existingKeys={existingKeys}
                online={sync.online}
                onDone={() => stationWords.refresh()}
              />
              <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
                {stations.current
                  ? `当前小站：${stations.current.name} · 共 ${stationWords.counts.total} 词（公共 ${stationWords.counts.public} · 私有 ${stationWords.counts.user}）`
                  : '还没有小站：在上方新建一个（如「雅思」「论文阅读」）'}
              </div>
              <StationLearn
                words={stationWords.words}
                morphemes={morphemes}
                records={learn.records}
                answer={learn.answer}
                markKnown={learn.markKnown}
                onRefresh={stationWords.refresh}
              />
            </div>
          )}

          {/* ---------------- 学习 ---------------- */}
          {view === 'learn' && sessionMode === 'none' && (
            <div className="p-4">
              <LearnHome
                stats={learn.stats}
                learnQueue={learn.learnQueue}
                reviewQueue={learn.reviewQueue}
                onStartLearn={startLearn}
                onStartReview={startReview}
                migrationReport={learn.migrationReport}
                band={activeBand}
                bands={bands}
                bandCounts={bandCounts}
                onChangeBand={(band) => setFilters((prev) => ({ ...prev, learnBand: band }))}
                groupByFamily={filters.groupByFamily !== false}
                onToggleGroupByFamily={() =>
                  setFilters((prev) => ({ ...prev, groupByFamily: prev.groupByFamily === false }))
                }
                vocab={vocab}
              />
            </div>
          )}

          {/* 学习/复习会话：非「学习」页签时仅隐藏不卸载，跳词云后回来进度保留 */}
          {sessionMode !== 'none' && (
            <div className={view === 'learn' ? '' : 'hidden'}>
              <StudySession
                mode={sessionMode}
                queue={sessionMode === 'learn' ? learn.learnQueue : learn.reviewQueue}
                answer={learn.answer}
                markKnown={learn.markKnown}
                onExit={exitSession}
                onViewInCloud={openWordFromStudy}
                autoSpeak={filters.autoSpeak === true}
              />
            </div>
          )}

          {/* ---------------- 词云三视图（懒加载） ---------------- */}
          {view === 'overview' && (
            <Suspense fallback={<div className="p-6 text-sm text-slate-400">词云加载中…</div>}>
              <NetworkView
                morphemes={morphemes}
                words={words}
                index={index}
                records={learn.records}
                visibleMorphs={visibleMorphs}
                relationIndex={relationIndex}
                focusWordId={networkFocusWordId}
                onSelectMorph={openMorph}
                onSelectWord={setSelectedWord}
                onOpenFocus={openMorph}
                width={Math.max(560, window.innerWidth - 620)}
                height={Math.max(420, window.innerHeight - 140)}
              />
            </Suspense>
          )}

          {view === 'focus' &&
            (selectedMorph ? (
              <Suspense fallback={<div className="p-6 text-sm text-slate-400">词云加载中…</div>}>
                <FocusView
                  morph={selectedMorph}
                  index={index}
                  records={learn.records}
                  orderBy={orderBy}
                  onSelectWord={setSelectedWord}
                  onOpenMorph={openMorph}
                  selectedWordId={selectedWord?.id}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onClearSelection={clearSelection}
                  onMarkKnown={bulkMarkKnown}
                  onSetReview={bulkSetReview}
                  onReset={bulkReset}
                  onBackToMap={() => setView('overview')}
                  width={Math.max(520, window.innerWidth - 640)}
                  height={Math.max(420, window.innerHeight - 140)}
                />
              </Suspense>
            ) : (
              <div className="text-sm text-slate-400 py-20 text-center">
                还没有选中词群。回到「总览」点一座小岛，或用左侧搜索定位。
              </div>
            ))}

          {view === 'list' && (
            <Suspense fallback={<div className="p-6 text-sm text-slate-400">列表加载中…</div>}>
              <ListView
                morphs={visibleMorphs}
                orphanWords={visibleOrphans}
                records={learn.records}
                setStatus={setStatus}
                onSelectWord={(w) => {
                  setSelectedWord(w)
                  if (w.morphs[0]) setSelectedMorphId(w.morphs[0])
                }}
                selectedWordId={selectedWord?.id}
                selectedIds={selectedIds}
                onToggleCheck={toggleSelect}
                onSelectMany={selectMany}
                onClearSelection={clearSelection}
                onMarkKnown={bulkMarkKnown}
                onSetReview={bulkSetReview}
                onReset={bulkReset}
              />
            </Suspense>
          )}
        </div>
      </main>

      {/* 右侧详情 */}
      <aside className="w-80 shrink-0 h-full overflow-y-auto bg-white border-l border-slate-200 p-4">
        {selectedWord ? (
          <WordDetail
            word={selectedWord}
            records={learn.records}
            index={index}
            relationIndex={relationIndex}
            onSelectRelated={openRelatedWord}
            onJump={openMorph}
            onBack={() => setSelectedWord(null)}
            onMarkKnown={onMarkKnown}
            onSetReview={onSetReview}
            onRetreat={onRetreat}
          />
        ) : selectedMorph ? (
          <MorphDetail
            morph={selectedMorph}
            records={learn.records}
            onSetStatus={setStatus}
            onSelectWord={setSelectedWord}
            selectedIds={selectedIds}
            onSelectMany={selectMany}
            onClearSelection={clearSelection}
            onMarkKnown={bulkMarkKnown}
            onSetReview={bulkSetReview}
            onReset={bulkReset}
          />
        ) : (
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-medium text-slate-600 mb-2">怎么用</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>「小站」里粘贴生词，一次可加 20 个</li>
              <li>不在公共库的词点一下就自动生成并入库</li>
              <li>小站内可直接背这些词（答错 +24h 到期）</li>
              <li>总览里气泡越大 = 该词根下词越多</li>
              <li>点气泡进入聚焦，看这一簇同源词</li>
              <li>登录后进度跨设备同步，断网也能用</li>
            </ol>
          </div>
        )}
      </aside>
    </>
  )
}

function MorphDetail({
  morph,
  records,
  onSetStatus,
  onSelectWord,
  selectedIds,
  onSelectMany,
  onClearSelection,
  onMarkKnown,
  onSetReview,
  onReset,
}) {
  const typeCfg = TYPES[morph.type]
  const ids = morph.words.map((w) => w.id)

  const invertSelection = () => {
    const picked = ids.filter((id) => selectedIds.has(id))
    const rest = ids.filter((id) => !selectedIds.has(id))
    onSelectMany(rest, 'add')
    onSelectMany(picked, 'remove')
  }

  const toggleOne = (wordId) => onSelectMany([wordId], selectedIds.has(wordId) ? 'remove' : 'add')
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: typeCfg.soft, color: typeCfg.color }}>
          {typeCfg.label}
        </span>
        <span className="text-xs text-slate-400">{ORIGINS[morph.origin]?.label}</span>
      </div>
      <h2 className="text-lg font-bold text-slate-800">{morph.display}</h2>
      <p className="text-sm text-slate-600 mt-0.5">{morph.gloss}</p>
      {morph.glossEn && <p className="text-xs text-slate-400 mt-0.5">{morph.glossEn}</p>}
      {morph.note && (
        <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded p-2 mt-2 leading-relaxed">
          {morph.note}
        </p>
      )}

      {/* 词源故事：精编优先，缺失回退本地组合叙述（懒加载 morph-etym.js） */}
      <div className="mt-3">
        <EtymologyPanel morph={morph} />
      </div>

      <h3 className="text-xs font-semibold text-slate-500 mt-4 mb-1">同源词 {morph.words.length}</h3>

      <div className="flex items-center gap-1 mb-1.5 text-xs">
        <button
          onClick={() => onSelectMany(ids, 'add')}
          className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50"
        >
          全选
        </button>
        <button
          onClick={invertSelection}
          className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50"
        >
          反选
        </button>
        <button
          onClick={onClearSelection}
          disabled={!selectedIds.size}
          className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          清空
        </button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-1.5">
          <BulkActionBar
            count={selectedIds.size}
            ids={[...selectedIds]}
            onMarkKnown={onMarkKnown}
            onSetReview={onSetReview}
            onReset={onReset}
            onClear={onClearSelection}
            layout="column"
          />
        </div>
      )}

      <div>
        {morph.words.map((w) => (
          <WordRow
            key={w.id}
            word={w}
            records={records}
            onSetStatus={onSetStatus}
            onSelect={onSelectWord}
            checked={selectedIds.has(w.id)}
            onToggleCheck={toggleOne}
          />
        ))}
      </div>
    </div>
  )
}

function WordDetail({
  word,
  records,
  index,
  relationIndex,
  onSelectRelated,
  onJump,
  onBack,
  onMarkKnown,
  onSetReview,
  onRetreat,
}) {
  const rec = recordOf(word, records)
  const st = rec.status
  const cfg = STATUS[st]
  const band = freqBand(word.freqRank)
  // 构词拆解：点词素 chip 内联展开其词源故事
  const [expandedMorphId, setExpandedMorphId] = useState(null)
  const expandedMorph = expandedMorphId ? index.morphById.get(expandedMorphId) || null : null
  // 音标 / 例句 / 用法：异步查表（红线：严禁生成，查不到显示「音标待补」）
  const [phon, setPhon] = useState(null)
  useEffect(() => {
    let alive = true
    setPhon(null)
    phoneticsOfAsync(word.form)
      .then((p) => {
        if (alive) setPhon(p)
      })
      .catch(() => {
        if (alive) setPhon(null)
      })
    return () => {
      alive = false
    }
  }, [word.form])

  const phonetic = word.phoneticBr || (phon && phon.phonetic) || null
  const example = word.example || (phon && phon.example) || null
  const usage = (phon && phon.usage) || null
  const progress = `${Math.min(rec.consecutiveCorrect || 0, 2)}/2`
  const related = relationsOf(relationIndex, word.id)
  const conflictPairs = new Set((relationIndex?.conflicts || []).map((item) => item.pairKey))
  const gradeStars = (grade) => `${'★'.repeat(4 - grade)}${'☆'.repeat(grade - 1)}`

  const renderRelationPills = (items, type) => (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => {
        const conflict = conflictPairs.has(pairKey(word.id, item.id))
        const isSynonym = type === 'synonym'
        return (
          <button
            key={`${type}:${item.id}`}
            type="button"
            onClick={() => onSelectRelated(item.id)}
            className="px-2 py-1 rounded-full border text-xs hover:brightness-95"
            style={{
              color: isSynonym ? '#166534' : '#991b1b',
              borderColor: isSynonym ? '#86efac' : '#fca5a5',
              background: isSynonym ? '#f0fdf4' : '#fef2f2',
            }}
            title={item.note || ''}
          >
            {item.form} <span className="opacity-70">{gradeStars(item.grade)}</span>
            {conflict && <span className="ml-1 font-semibold text-red-600">⚠ 冲突</span>}
          </button>
        )
      })}
    </div>
  )

  return (
    <div>
      <button onClick={onBack} className="text-xs text-slate-400 hover:text-blue-600">
        ← 返回词群
      </button>
      <div className="flex items-center gap-2 mt-1">
        <h2 className="text-lg font-bold text-slate-800">{word.form}</h2>
        <SpeakerButton text={word.form} size="sm" />
      </div>
      <p className="text-xs text-slate-400">{word.pos}</p>
      <p className="text-sm text-slate-700 mt-1">{word.gloss}</p>

      {/* 音标（英式 DJ，有则显示；查不到显示「音标待补」） */}
      {phonetic ? (
        <p className="text-sm text-slate-500 mt-1 font-medium">{phonetic}</p>
      ) : (
        <p className="text-xs text-amber-600 mt-1">音标待补</p>
      )}

      {example && example.en && example.zh && (
        <div className="mt-2 rounded-md bg-slate-50 border border-slate-100 p-2 text-xs leading-relaxed">
          <div className="text-slate-700">{example.en}</div>
          <div className="text-slate-400 mt-0.5">{example.zh}</div>
        </div>
      )}

      {usage && (
        <div className="mt-2 rounded-md bg-blue-50 border border-blue-100 p-2 text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-blue-700">用法： </span>
          {usage}
        </div>
      )}

      {related.synonyms.length > 0 && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold text-emerald-700 mb-1.5">近义词</h3>
          {renderRelationPills(related.synonyms, 'synonym')}
        </section>
      )}
      {related.antonyms.length > 0 && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold text-red-700 mb-1.5">反义词</h3>
          {renderRelationPills(related.antonyms, 'antonym')}
        </section>
      )}

      <div className="mt-3 rounded-md border border-slate-200 p-2.5 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ background: cfg.soft, color: cfg.color }}
          >
            {cfg.icon} {cfg.label}
          </span>
          <span className="text-xs text-slate-500">连续答对 {progress}</span>
        </div>

        <dl className="text-xs mt-2 space-y-1 text-slate-500">
          <div className="flex justify-between">
            <dt>累计答对</dt>
            <dd className="font-medium">{rec.correctCount} 次</dd>
          </div>
          <div className="flex justify-between">
            <dt>累计答错</dt>
            <dd className="font-medium">{rec.incorrectCount} 次</dd>
          </div>
          <div className="flex justify-between">
            <dt>最近学习</dt>
            <dd className="font-medium">{formatDateTime(rec.lastStudiedAt)}</dd>
          </div>
        </dl>

        <div className="flex gap-2 mt-2.5">
          {st !== 'known' ? (
            <>
              <button
                onClick={() => onMarkKnown(word.id)}
                className="flex-1 px-2 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                我会了
              </button>
              <button
                onClick={() => onSetReview(word.id)}
                className="flex-1 px-2 py-1.5 rounded-md border border-amber-400 text-amber-700 hover:bg-amber-50 text-xs font-medium"
              >
                加入待复习
              </button>
            </>
          ) : (
            <button
              onClick={() => onRetreat(word.id)}
              className="flex-1 px-2 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
            >
              退回复习
            </button>
          )}
        </div>
      </div>

      <h3 className="text-xs font-semibold text-slate-500 mt-4 mb-1.5">构词拆解</h3>
      {word.morphless ? (
        <div className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
          无词素 · {word.kind === 'mono' ? '单纯词' : word.kind === 'loan' ? '外来词' : word.kind === 'proper' ? '专有名词' : '固定搭配'}
        </div>
      ) : (
        <>
          <div className="flex items-center flex-wrap gap-1">
            {word.chain.map((step, i) => {
              const m = step.morph ? index.morphById.get(step.morph) : null
              const clickable = Boolean(m)
              const expanded = clickable && expandedMorphId === m.id
              return (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-300">+</span>}
                  {clickable ? (
                    <button
                      type="button"
                      onClick={() => setExpandedMorphId(expanded ? null : m.id)}
                      title="查看词源故事"
                      className={`px-2 py-1 rounded border text-xs transition-colors ${
                        expanded
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-medium text-slate-700">{step.form}</span>
                      <span className="text-slate-400 ml-1">{step.gloss}</span>
                      <span className="ml-1 text-slate-400">{expanded ? '▾' : '▸'}</span>
                    </button>
                  ) : (
                    <span className="px-2 py-1 rounded border border-slate-200 text-xs">
                      <span className="font-medium text-slate-700">{step.form}</span>
                      <span className="text-slate-400 ml-1">{step.gloss}</span>
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </div>
          {expandedMorph && (
            <div className="mt-2">
              <EtymologyPanel morph={expandedMorph} defaultOpen />
            </div>
          )}
        </>
      )}

      <h3 className="text-xs font-semibold text-slate-500 mt-4 mb-1.5">所属词群</h3>
      <div className="flex flex-wrap gap-1">
        {word.morphs.map((mid) => {
          const m = index.morphById.get(mid)
          if (!m) return null
          return (
            <button
              key={mid}
              onClick={() => onJump(mid)}
              className="px-2 py-1 rounded text-xs border"
              style={{ borderColor: TYPES[m.type].color, color: TYPES[m.type].color, background: TYPES[m.type].soft }}
            >
              {m.display}
            </button>
          )
        })}
      </div>

      <dl className="text-xs mt-4 space-y-1 text-slate-500">
        <div className="flex justify-between">
          <dt>难度</dt>
          <dd className="font-medium">{word.cefr}</dd>
        </div>
        <div className="flex justify-between">
          <dt>词频</dt>
          <dd className="font-medium">
            {band.label} · 序号 {word.freqRank}
          </dd>
        </div>
      </dl>
    </div>
  )
}

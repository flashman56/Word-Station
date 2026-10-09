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
  hasDecomposition,
  morphlessKindLabel,
  recordOf,
  search,
} from './lib/derive.js'
import { buildRelations, pairKey, relationsOf } from './lib/relations.js'
import { buildStemIndex, familyOf } from './lib/stemFamily.js'
import { phoneticsOfAsync } from './lib/dict.js'
import { shouldShowPhoneticPending } from './lib/phoneticDisplay.js'
import { estimateVocabulary } from './lib/vocab.js'
import { MAX_VOCAB_PRIVATE_WORDS } from './lib/derive.js'
import { useSettings } from './hooks/useSettings.js'
import { buildBands, normalizeBand } from './hooks/useLearn.js'
import { useAuth } from './hooks/useAuth.js'
import { useStations } from './hooks/useStations.js'
import { useSync } from './hooks/useSync.js'
import { useLearnCloud } from './hooks/useLearnCloud.js'
import { useStationWords } from './hooks/useStationWords.js'
import { useUserWords } from './hooks/useUserWords.js'
import Sidebar from './components/Sidebar.jsx'
import LearnHome from './components/LearnHome.jsx'
import StudySession from './components/StudySession.jsx'
import WordRow from './components/WordRow.jsx'
import SpeakerButton from './components/SpeakerButton.jsx'
import EtymologyPanel from './components/EtymologyPanel.jsx'
import UsageSupplement from './components/UsageSupplement.jsx'
import BulkActionBar from './components/BulkActionBar.jsx'
import AddToStationMenu from './components/AddToStationMenu.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import StationBar from './components/StationBar.jsx'
import AddWordsPanel from './components/AddWordsPanel.jsx'
import StationLearn from './components/StationLearn.jsx'
import PrivateWordsPanel from './components/PrivateWordsPanel.jsx'
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
  // 专有名词开关：**默认必须关** —— 全库约 1.4 万个（占 21%），
  // 默认开启会让绝大多数用户莫名其妙地「少了一批常见词」。
  // 判定只用 word.kind === 'proper'（不按 origin / 首字母大写：sandwich、boycott
  // 这类 eponym 是普通词）。读老 settings 用 === true 兜底（老用户该字段 undefined）。
  excludeProper: false,
}

/** WordDetail 的 addToStationProps 缺省值：空对象 = 按钮不渲染（默认行为不变） */
const EMPTY_ADD_PROPS = {}

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
function TopBar({ auth, stations, sync, view, setView, stats, sessionMode, learn = null, onBeforeSignOut = null, pending = 0, stuck = 0, manualInherited = 0, onMenuToggle }) {
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
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden -ml-1 p-1 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="打开筛选"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <span className="hidden md:inline text-sm font-semibold text-slate-700 mr-2">词根词缀单词云</span>
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView && setView(key)}
              className={`shrink-0 px-3 py-1 rounded-md text-sm ${
                view === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* 口径与左栏「可见单词」一致（都按 word.id 去重）；保持纯文本 div 便于回归测试断言 */}
          {stats && (
            <div className="hidden sm:block text-xs text-slate-400">
              {`词群 ${stats.morphCount} · 单词 ${stats.uniqueWords ?? stats.wordCount}`}
            </div>
          )}
          <SyncBadge sync={sync} ownerId={auth.userId} learn={learn} />
          <AuthPanel
            auth={auth}
            beforeSignOut={onBeforeSignOut}
            pendingCount={pending}
            pendingStuck={stuck}
            manualInherited={manualInherited}
          />
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
  // 防御式读取：settings v2 是整对象写入，老用户没有这个字段（undefined）→ 关
  const excludeProper = filters.excludeProper === true

  // T05：私有词并入统计 / 复习队列 / 词汇量预测（B-3 / B-4 / Q4）
  const userWords = useUserWords(auth.userId)

  const learn = useLearnCloud(words, {
    ownerId: auth.userId,
    online: sync.online,
    privateWords: userWords.words,
    learnOpts: {
      band: activeBand,
      groupByFamily: filters.groupByFamily !== false,
      morphemes,
      excludeProper,
    },
  })

  /** Q7：登出前把该传的传完；返回 false 表示还没准备好、应中止登出 */
  const beforeSignOut = useCallback(async () => {
    try {
      await learn.flush()
      return true
    } catch {
      return true // 收尾失败不阻塞登出：用户要的是登出
    }
  }, [learn])

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
  // T04：「我的私有词」侧栏面板的展开态（不开新页签 —— 理由见 Sidebar 注释）
  const [privateWordsOpen, setPrivateWordsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 登录状态变化时把用户带到「小站」页签（首次进入未登录则留学习页）
  useEffect(() => {
    if (auth.userId) setView((v) => (v === 'learn' && sessionMode === 'none' ? 'station' : v))
  }, [auth.userId, sessionMode])

  const stationWords = useStationWords(stations.currentId, auth.userId, {
    // ★ A-06 / M3：私有词的**离线反查来源**。
    //   useUserWords 已全量缓存私有词，断网时草稿里的 u.* 靠它反查出 form/gloss。
    //   绝不能改成走 userWordsApi.listByKeys —— 那是纯网络请求，离线必然失败，
    //   而离线正是需要投影的那一刻。
    privateWords: userWords.words,
  })
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
  // ★ 无拆解词（「无词素」组）的唯一判据是「chain 里没有内容」★
  //   原来按 `word.morphless === true` 过滤，而 remorph 补丁给 2244 个 morphless 词
  //   补了 morphs/chain 却保留了 morphless:true（validate 的硬约束要求保留）——
  //   于是这 2244 个词同时出现在「词素岛屿」和「无词素孤儿组」里，
  //   数据与 UI 自相矛盾：岛屿里能点开看到拆解，孤儿组里却标着「无词素」。
  const orphanWords = useMemo(() => words.filter((word) => !hasDecomposition(word)), [words])
  // ★ 同族词反查索引：无拆解词没有词素锚点，只能按词形找同族 ★
  //   一次建好、整个会话复用；WordDetail 只查表，绝不在渲染期遍历词库。
  const stemIndex = useMemo(() => buildStemIndex(words), [words])

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
  //
  // B-8 护栏：私有词 freqRank 多为 null，会被归到最后一档而抬高尾档 knownP。
  // 超过上限就回退到公共词（vocab.js 的判别式与闸门一律不动），
  // 并用一行小字告诉用户「暂不含私有词」—— 阈值本身不暴露。
  const vocabIncludesPrivate = userWords.words.length <= MAX_VOCAB_PRIVATE_WORDS
  const vocabInput = vocabIncludesPrivate ? learn.statWords : words
  const vocab = useMemo(() => estimateVocabulary(vocabInput, learn.records), [vocabInput, learn.records])

  const bandCounts = useMemo(() => {
    const counts = {}
    bands.forEach((b) => {
      counts[b.id] = 0
    })
    const seen = new Set()
    words.forEach((w) => {
      if (!w || seen.has(w.id)) return
      seen.add(w.id)
      // ★ 与 learnPool 同一个过滤条件 ★
      //   否则「0~3000 · 3000 词」写的仍是未过滤的口径，用户照着分档选完，
      //   实际开出来的队列却少几千 —— 计数与真实队列对不上是最难自查的一类 bug。
      if (excludeProper && w.kind === 'proper') return
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
  }, [words, bands, excludeProper])

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

  /**
   * ★ C 组「加入小站」三处共用的 props（G1）★
   * BulkActionBar 有三个调用点（ListView / FocusView / MorphDetail），语义都成立，
   * 所以这里抽一份共用的 —— 三处任一漏传都会让那处的按钮静默 disabled，
   * 而界面上看不出原因（这是「看起来改了其实只生效两处」的典型）。
   */
  const addToStationProps = useMemo(
    () => ({
      addToStation: true,
      ownerId: auth.userId,
      stations: stations.stations,
      stationsLoading: stations.loading,
      online: sync.online,
      currentStationId: stations.currentId,
      currentStationName: stations.current ? stations.current.name : '',
      existingKeys,
      createStation: stations.createStation,
      onRefreshStations: async () => {
        await stations.refresh()
        await stationWords.refresh()
      },
    }),
    [
      auth.userId,
      stations.stations,
      stations.loading,
      stations.currentId,
      stations.current,
      stations.createStation,
      stations.refresh,
      sync.online,
      existingKeys,
      stationWords.refresh,
    ],
  )

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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        stats={visibleStats}
        learnStats={learn.stats}
        migrationReport={learn.migrationReport}
        inheritFreqKnown={learn.inheritFreqKnown}
        onToggleInherit={handleToggleInherit}
        hitCount={searchResult.morphs.length}
        wordHits={wordHits}
        onSelectWordHit={openWordFromSearch}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
        vocab={vocab}
        privateWordCount={userWords.words.length}
        privateWordsOpen={privateWordsOpen}
        onTogglePrivateWords={() => setPrivateWordsOpen((v) => !v)}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        privateWordsPanel={
          <PrivateWordsPanel
            userWords={userWords.words}
            records={learn.records}
            ownerId={auth.userId}
            existingKeys={existingKeys}
            currentStationName={stations.current ? stations.current.name : ''}
            addToStationProps={addToStationProps}
            onClose={() => setPrivateWordsOpen(false)}
            onRefresh={async () => {
              // 彻底删除会同时动 user_words 与 station_words → 两边都要刷
              await userWords.refresh()
              await stationWords.refresh()
            }}
          />
        }
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
          onBeforeSignOut={beforeSignOut}
          pending={learn.pending}
          stuck={learn.stuck}
          manualInherited={learn.migrationReport?.migratedManual || 0}
          onMenuToggle={() => setSidebarOpen(true)}
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
                  ? `当前小站：${stations.current.name} · 共 ${stationWords.counts.total} 词（公共 ${stationWords.counts.public} · 私有 ${stationWords.counts.user}）${
                      stationWords.pendingCount > 0 ? ` · 另有 ${stationWords.pendingCount} 词待上传` : ''
                    }`
                  : '还没有小站：在上方新建一个（如「雅思」「论文阅读」）'}
              </div>
              <StationLearn
                words={stationWords.words}
                morphemes={morphemes}
                records={learn.records}
                /* 小站背词遵守同一个专有名词开关（学习队列设置是全局的，
                   不是某一页的视图筛选）—— 不传的话小站会把学习页排除掉的词
                   照常出给用户，等于开关只生效一半。 */
                excludeProper={excludeProper}
                answer={learn.answer}
                markKnown={learn.markKnown}
                setReview={learn.setReview}
                retreat={learn.retreat}
                ownerId={auth.userId}
                online={sync.online}
                currentStationName={stations.current ? stations.current.name : ''}
                pending={stationWords.pending}
                onRetrySync={learn.flush}
                /* ★ B-01 的补漏（架构师 G-补漏）：此前根本没传 ★
                   useStationWords 早就 return 了 removeWord，但这里只传了
                   words / records / answer / markKnown / setReview / retreat /
                   ownerId / onRefresh —— 不补这个 prop，「移出小站」按钮点了
                   没反应。这正是「看起来改了其实没生效」的典型。 */
                removeWord={stationWords.removeWord}
                onRefresh={async () => {
                  // 私有词可能被编辑过 → 顺手刷新全局私有词，否则学习页统计会停在旧值
                  await stationWords.refresh()
                  await userWords.refresh()
                }}
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
                excludeProper={excludeProper}
                onToggleExcludeProper={() =>
                  setFilters((prev) => ({ ...prev, excludeProper: prev.excludeProper !== true }))
                }
                vocab={vocab}
                showSharedNote
                privateCount={userWords.words.length}
                vocabIncludesPrivate={vocabIncludesPrivate}
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
                width={window.innerWidth < 768 ? window.innerWidth : Math.max(560, window.innerWidth - 620)}
                height={window.innerWidth < 768 ? window.innerHeight - 120 : Math.max(420, window.innerHeight - 140)}
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
                  addToStationProps={addToStationProps}
                  onBackToMap={() => setView('overview')}
                  width={window.innerWidth < 768 ? window.innerWidth : Math.max(520, window.innerWidth - 640)}
                  height={window.innerWidth < 768 ? window.innerHeight - 120 : Math.max(420, window.innerHeight - 140)}
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
                addToStationProps={addToStationProps}
              />
            </Suspense>
          )}
        </div>
      </main>

      {/* 右侧详情：桌面（md+）常驻 320px 列；移动端默认隐藏，
          仅当已选中词/词群时以全屏浮层出现（否则会挤压主区成窄条） */}
      <aside
        className={[
          'bg-white border-slate-200 overflow-y-auto p-4 z-40',
          selectedWord || selectedMorph
            ? 'fixed inset-0 w-full h-full md:static md:w-80 md:shrink-0 md:h-full md:border-l'
            : 'hidden md:block md:static md:w-80 md:shrink-0 md:h-full md:border-l',
        ].join(' ')}
      >
        {(selectedWord || selectedMorph) && (
          <button
            type="button"
            onClick={() => {
              setSelectedWord(null)
              setSelectedMorphId(null)
            }}
            className="md:hidden mb-2 -ml-1 p-1 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="关闭详情"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}
        {selectedWord ? (
          <WordDetail
            word={selectedWord}
            records={learn.records}
            index={index}
            stemIndex={stemIndex}
            relationIndex={relationIndex}
            onSelectRelated={openRelatedWord}
            onJump={openMorph}
            onBack={() => setSelectedWord(null)}
            onMarkKnown={onMarkKnown}
            onSetReview={onSetReview}
            onRetreat={onRetreat}
            /* ★ C-01：WordDetail 不是独立文件，是 App.jsx 内的内部函数 ★
               「加入小站 ▾」加在既有「我会了 / 加入待复习」按钮组**同层** ——
               同一组「对这个词做标记或归档」的操作，不另开一个区域。 */
            addToStationProps={addToStationProps}
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
            addToStationProps={addToStationProps}
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
  /* ★ C-02：G1 第 3 处调用点。
     ★★ 踩过的坑（QA 独立验出的白屏）★★
     MorphDetail 是**顶层函数**（缩进 0），拿不到 AppShell 里的
     addToStationProps —— 早先只在函数体内写了 {...addToStationProps} 而没在
     签名里解构它，于是「右侧词群详情里勾选任意一个词」就 ReferenceError
     白屏。触发条件极浅，而它能过 build（esbuild 不做作用域分析）、
     也能过我的源码正则断言（那断言只检查「字符串在不在」）。
     ⇒ 教训：凡「某组件用了新 prop」，必须**渲染那个组件**来验，
       而不是只对源码做字符串匹配。 */
  addToStationProps = EMPTY_ADD_PROPS,
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
            /* ★ G1 第 3 处调用点（右侧词群详情）★
               语义与 ListView / FocusView 相同（已选若干公共词 → 批量操作），
               所以第 4 个「加入小站」按钮在这里同样成立。 */
            {...addToStationProps}
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
  stemIndex,
  relationIndex,
  onSelectRelated,
  onJump,
  onBack,
  onMarkKnown,
  onSetReview,
  onRetreat,
  addToStationProps = EMPTY_ADD_PROPS,
}) {
  const rec = recordOf(word, records)
  const st = rec.status
  const cfg = STATUS[st]
  const band = freqBand(word.freqRank)
  // 构词拆解：点词素 chip 内联展开其词源故事
  const [expandedMorphId, setExpandedMorphId] = useState(null)
  const expandedMorph = expandedMorphId ? index.morphById.get(expandedMorphId) || null : null
  // 音标 / 例句 / 用法：异步查表（红线：严禁生成；单词查不到显示「音标待补」）
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
  const usage = word.usage || (phon && phon.usage) || null
  const progress = `${Math.min(rec.consecutiveCorrect || 0, 2)}/2`
  const related = relationsOf(relationIndex, word.id)
  // 同族词：只有「无拆解」的词才需要（它是空面板时的救命出口）。
  // 查表 O(桶大小)，索引在 AppShell 建一次，这里不做任何全表扫描。
  const stemFamily = useMemo(
    () => (hasDecomposition(word) ? [] : familyOf(stemIndex, word)),
    [stemIndex, word],
  )
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

      {/* 音标（英式 DJ，有则显示；普通单词查不到显示「音标待补」） */}
      {phonetic ? (
        <p className="text-sm text-slate-500 mt-1 font-medium">{phonetic}</p>
      ) : shouldShowPhoneticPending(word, phonetic) ? (
        <p className="text-xs text-amber-600 mt-1">音标待补</p>
      ) : null}

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

      {/* 用法补充：固定搭配 / 背景 / 用法（按需异步加载，无条目则无渲染） */}
      <UsageSupplement form={word.form} />

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
          {/* ★ C-01「加入小站 ▾」★
              放在同一按钮组的**同层**（不是另开一块）：它与「我会了」同属
              「对这个词做一个动作」，拆到别处会让用户以为这是页面级操作。
              ★ 私有词与公共词走**完全相同**的这条路径：wordView 的
                id === wordKey 让同一份 records 同时服务小站与学习页，
                而 source 由 sources 显式给出（私有词恒为 'user'，不能靠猜）。 */}
          <AddToStationMenu
            {...addToStationProps}
            wordKeys={[word.wordKey || word.id]}
            sources={[word.source === 'user' ? 'user' : 'public']}
            size="md"
          />
        </div>
      </div>

      <h3 className="text-xs font-semibold text-slate-500 mt-4 mb-1.5">构词拆解</h3>
      {/* ★ 判据是「chain 里有没有内容」，不是 word.morphless ★
          remorph 补丁给 2244 个 morphless 词补了 morphs/chain，但必须保留
          morphless:true（validate-data.mjs 的硬约束），判标记会让这 2244 条补丁
          一条都不显示 —— 用户点开全是空面板。判 chain 后补丁全部生效。 */}
      {!hasDecomposition(word) ? (
        <>
          <div className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
            无词素 · {morphlessKindLabel(word)}
          </div>
          {/* ★ 同族词互链 ★
              无拆解词没有词素锚点，点不出任何内容 —— 这是「空面板」的第二层原因。
              这里按词形反查同族词（索引在 AppShell 建好），给的每个 chip 都是
              「有真实拆解」的词，点进去能看到构词拆解，不会又撞回空面板。
              只有确实找不到同族词时，才只剩上面那行 amber 提示。 */}
          {stemFamily.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-slate-500 mb-1">该词无词根拆解，但同族词：</div>
              <div className="flex flex-wrap gap-1">
                {stemFamily.map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => onSelectRelated(fam.id)}
                    className="px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    {fam.form}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
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

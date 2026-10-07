import React from 'react'
import { CEFR, ORIGINS, STATUS, TYPES, AUTO_KNOWN_RANK } from '../lib/derive.js'
import VocabCard from './VocabCard.jsx'

function Section({ title, children }) {
  return (
    <div className="border-b border-slate-200 pb-4 mb-4 last:border-0">
      <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded-md text-xs border transition-colors"
      style={{
        background: active ? color : '#ffffff',
        color: active ? '#ffffff' : '#475569',
        borderColor: active ? color : '#cbd5e1',
      }}
    >
      {children}
    </button>
  )
}

export default function Sidebar({
  filters,
  setFilters,
  stats,
  learnStats,
  migrationReport,
  inheritFreqKnown,
  onToggleInherit,
  hitCount,
  wordHits = [],
  onSelectWordHit,
  onExport,
  onImport,
  onClear,
  vocab = null,
  privateWordCount = 0,
  privateWordsOpen = false,
  onTogglePrivateWords,
  privateWordsPanel = null,
}) {
  const patch = (p) => setFilters((f) => ({ ...f, ...p }))

  const toggleIn = (key, value) =>
    setFilters((f) => {
      const list = f[key] || []
      return { ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] }
    })

  return (
    <aside className="w-72 shrink-0 h-full overflow-y-auto bg-white border-r border-slate-200 p-4 text-slate-700">
      <div className="mb-4">
        <h1 className="text-base font-bold text-slate-800">词根词缀单词云</h1>
        <p className="text-xs text-slate-400 mt-0.5">词素为干，单词为叶</p>
      </div>

      {migrationReport && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-100 px-2.5 py-2 text-xs text-blue-700 leading-relaxed">
          已从旧版保留 {migrationReport.known} 个已掌握、{migrationReport.review} 个待复习、
          {migrationReport.unknown} 个未知。
        </div>
      )}

      <Section title="检索">
        <input
          value={filters.query}
          onChange={(e) => patch({ query: e.target.value })}
          placeholder="词根 / 词缀 / 单词 / 释义"
          className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-400"
        />
        {filters.query && (
          /* ★ A-05：命中数只统计「搜索命中」，与筛选器无关 ★
             原先这里传的是 applyFilters 的 stats.morphCount，而那个 stats 吃
             types/origins/minCefr/status/hideAutoKnown —— 于是「把难度收到 B2 再
             搜 spec」会让这个数字变小，读起来像是「搜索本身命中变少了」。
             现在它读 searchResult.morphs.length（零新增开销：searchResult 本来就
             被 hitWordIds / visibleOrphans 消费，读 .length 是 O(1) 字段访问），
             并补一行小字把口径写明。 */
          <p className="text-xs text-slate-400 mt-1.5">
            命中 {hitCount} 个词群
            <span className="block text-slate-400">（当前筛选下的可见词群，不随筛选变化）</span>
          </p>
        )}
        {filters.query && wordHits.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-400 mb-1">
              单词命中（前 {wordHits.length} 条，点击查看详情）：
            </p>
            <ul className="space-y-0.5">
              {wordHits.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => onSelectWordHit?.(w)}
                    className="w-full text-left text-xs px-1.5 py-1 rounded hover:bg-blue-50 truncate"
                    title={w.gloss || ''}
                  >
                    <span className="font-medium text-blue-600">{w.form}</span>
                    {w.gloss && <span className="text-slate-400 ml-1.5">{w.gloss}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="掌握状态">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={filters.status === 'all'} color="#475569" onClick={() => patch({ status: 'all' })}>
            全部
          </Chip>
          {Object.entries(STATUS).map(([key, cfg]) => (
            <Chip key={key} active={filters.status === key} color={cfg.color} onClick={() => patch({ status: key })}>
              {cfg.label}
            </Chip>
          ))}
        </div>

        {/* ★ T04：我的私有词入口 ★
            放在「掌握状态」区下方 —— 私有词正是「按掌握状态管理我的词」的一部分，
            放在这里符合用户心智（上面就是三态筛选）。
            ★ 它是 B 组「移出小站」的硬前置：私有词被移出小站后仍留在 user_words，
              若没有这个入口就彻底失去编辑 / 重新生成 / 删除入口，成为清不掉的幽灵词
              （照样计入统计、照样出现在复习队列）。
            0 个时显示「暂无」且不可点 —— 给一个点进去必然是空的入口没有意义。 */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <button
            onClick={privateWordCount > 0 ? onTogglePrivateWords : undefined}
            disabled={privateWordCount === 0}
            title={
              privateWordCount > 0
                ? '查看 / 编辑 / 彻底删除我的私有词'
                : '还没有私有词：在「小站」里粘贴不在公共库的生词即可自动生成'
            }
            className="w-full text-left text-xs text-slate-500 hover:text-blue-600 disabled:text-slate-400 disabled:hover:text-slate-400 py-0.5"
          >
            我的私有词{' '}
            {privateWordCount > 0 ? `${privateWordCount} 个` : '（暂无）'}
            {privateWordCount > 0 && (
              <span className="ml-1 text-slate-400">{privateWordsOpen ? '▾ 收起' : '· 查看'}</span>
            )}
          </button>
        </div>

        {/* 面板内联展开在「掌握状态」区下方，不开新页签、不进「列表」页 ——
            理由：allIds 的语义与 A-07 的批量上限口径会被搅在一起 */}
        {privateWordsOpen && privateWordsPanel}
      </Section>

      <Section title="最低难度">
        <div className="flex flex-wrap gap-1.5">
          {CEFR.map((c) => (
            <Chip key={c} active={filters.minCefr === c} color="#4f7fd4" onClick={() => patch({ minCefr: c })}>
              {c}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">只显示该等级及以上的词</p>
      </Section>

      <Section title="词素类型">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TYPES).map(([key, cfg]) => (
            <Chip
              key={key}
              active={(filters.types || []).includes(key)}
              color={cfg.color}
              onClick={() => toggleIn('types', key)}
            >
              {cfg.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="来源">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ORIGINS).map(([key, cfg]) => (
            <Chip
              key={key}
              active={(filters.origins || []).includes(key)}
              color={cfg.color}
              onClick={() => toggleIn('origins', key)}
            >
              {cfg.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="已知词处理">
        <label className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hideAutoKnown}
            onChange={(e) => patch({ hideAutoKnown: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            隐藏自动判定的已知高频词
            <span className="block text-slate-400">词频序号 ≤ {AUTO_KNOWN_RANK} 视为你已掌握</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={Boolean(inheritFreqKnown)}
            onChange={onToggleInherit}
            className="mt-0.5"
          />
          <span>
            高频词继承为已掌握
            <span className="block text-slate-400">开启后重跑迁移：高频无记录词直接记为已掌握</span>
          </span>
        </label>
      </Section>

      <Section title="朗读">
        <label className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.autoSpeak)}
            onChange={(e) => patch({ autoSpeak: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            学习卡自动朗读
            <span className="block text-slate-400">进入新词时自动朗读单词（不读例句）</span>
          </span>
        </label>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          点任意词旁的喇叭即可朗读（浏览器原生语音）；移动端静音键下系统语音仍可出声。
        </p>
      </Section>

      {/* 预测词汇量（精简位）：与 LearnHome 显著位同源同值 */}
      {vocab && (
        <div className="mb-4">
          <VocabCard result={vocab} compact />
        </div>
      )}

      <Section title="统计">
        <dl className="text-xs space-y-1">
          <div className="flex justify-between"><dt>可见词群</dt><dd className="font-medium">{stats.morphCount}</dd></div>
          <div className="flex justify-between"><dt>可见单词</dt><dd className="font-medium">{stats.uniqueWords ?? stats.wordCount}</dd></div>
          {stats.wordCount > (stats.uniqueWords ?? stats.wordCount) && (
            <p className="text-slate-400 -mt-0.5">跨词群出现 {stats.wordCount} 次（一个词可挂多个词素）</p>
          )}
          {learnStats && Object.entries(STATUS).map(([key, cfg]) => (
            <div key={key} className="flex justify-between">
              <dt style={{ color: cfg.color }}>{cfg.label}</dt>
              <dd className="font-medium">{learnStats[key] ?? 0}</dd>
            </div>
          ))}
          {learnStats && (
            <div className="flex justify-between text-slate-400">
              <dt>学习库总计</dt>
              <dd>{learnStats.total ?? 0}</dd>
            </div>
          )}
        </dl>
      </Section>

      <Section title="图例">
        <ul className="text-xs space-y-1 leading-relaxed text-slate-500">
          <li>气泡颜色 = 词素类型（蓝 词根 / 绿 前缀 / 紫 后缀）</li>
          <li>气泡大小与字号 = 词群规模</li>
          <li>外圈弧 = 未掌握词占比</li>
          <li>聚焦视图：越外环越难、字号越大越常见</li>
        </ul>
      </Section>

      <Section title="标注数据">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button onClick={onExport} className="px-2 py-1 border border-slate-300 rounded-md hover:bg-slate-50">
            导出 JSON
          </button>
          <label className="px-2 py-1 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
            导入 JSON
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button onClick={onClear} className="px-2 py-1 border border-slate-300 rounded-md hover:bg-slate-50">
            清空标注
          </button>
        </div>
      </Section>
    </aside>
  )
}

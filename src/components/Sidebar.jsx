import React from 'react'
import { CEFR, ORIGINS, STATUS, TYPES, AUTO_KNOWN_RANK } from '../lib/derive.js'

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
          <p className="text-xs text-slate-400 mt-1.5">命中 {hitCount} 个词群</p>
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

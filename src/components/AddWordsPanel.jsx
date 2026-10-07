import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { parse } from '../lib/parseForms.js'
import { isIndexReady, loadIndex, lookupForms } from '../lib/dict.js'
import { publicKey } from '../lib/wordKey.js'
import * as stationWordsApi from '../lib/cloud/stationWords.js'
import * as generateApi from '../lib/cloud/generate.js'
import * as offlineApi from '../lib/cloud/offline.js'

/**
 * 批量加词面板：粘贴 → 解析 → 预览（命中 ✓ / 待生成 ⚡ / 站内已有 ⚠）→ 勾选 → 提交
 *
 * props:
 *   ownerId       当前用户 id（游客为 null）
 *   stationId     当前小站 id（无小站时禁用提交）
 *   existingKeys  站内已有 wordKey 集合（用于「重复」提示）
 *   online        是否在线（离线时命中词走草稿队列）
 *   onDone        (summary) => void 提交完成回调（触发小站词条刷新）
 */
export default function AddWordsPanel({ ownerId, stationId, existingKeys, online = true, onDone }) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(() => parse(''))
  const [checked, setChecked] = useState(() => new Set())
  const [lookup, setLookup] = useState({ hit: [], miss: [] })
  const [indexReady, setIndexReady] = useState(isIndexReady())
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(null)
  const [message, setMessage] = useState(null)

  // 首次挂载后台预取词条索引（1.7MB，IndexedDB 缓存后近乎瞬时）
  useEffect(() => {
    let alive = true
    if (isIndexReady()) {
      setIndexReady(true)
      return () => {
        alive = false
      }
    }
    loadIndex()
      .then(() => {
        if (alive) setIndexReady(true)
      })
      .catch(() => {
        if (alive) setIndexReady(false)
      })
    return () => {
      alive = false
    }
  }, [])

  // 解析 + 命中查询（纯内存，零网络往返）
  useEffect(() => {
    const result = parse(raw)
    setParsed(result)
    const usable = result.items.filter((it) => it.valid && !it.duplicate)
    if (!indexReady || usable.length === 0) {
      setLookup({ hit: [], miss: [] })
      setChecked(new Set(usable.map((it) => it.formKey)))
      return
    }
    const { hit, miss } = lookupForms(usable.map((it) => it.form))
    setLookup({ hit, miss })
    setChecked(new Set([...hit, ...miss].map((it) => it.formKey)))
  }, [raw, indexReady])

  const existing = existingKeys instanceof Set ? existingKeys : new Set(existingKeys || [])

  /** 预览行：命中 / 待生成 / 站内已有 */
  const rows = useMemo(() => {
    const hitMap = new Map(lookup.hit.map((h) => [h.formKey, h]))
    const missMap = new Map(lookup.miss.map((m) => [m.formKey, m]))
    return parsed.items
      .filter((it) => it.valid && !it.duplicate)
      .map((it) => {
        const h = hitMap.get(it.formKey)
        if (h) return { ...it, kind: 'hit', wordKey: h.wordKey, cefr: h.cefr, freqRank: h.freqRank }
        const m = missMap.get(it.formKey)
        if (m) return { ...it, kind: 'miss', wordKey: null }
        return { ...it, kind: 'unknown', wordKey: null }
      })
      .map((it) => ({ ...it, already: it.wordKey ? existing.has(it.wordKey) : false }))
  }, [parsed, lookup, existing])

  const toggle = useCallback((formKey) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(formKey)) next.delete(formKey)
      else next.add(formKey)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setChecked((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.formKey))))
  }, [rows])

  const selected = useMemo(() => rows.filter((r) => checked.has(r.formKey)), [rows, checked])
  const selectedHits = selected.filter((r) => r.kind === 'hit')
  const selectedMiss = selected.filter((r) => r.kind === 'miss')

  const canSubmit = Boolean(ownerId && stationId) && selected.length > 0 && !submitting

  const submit = useCallback(async () => {
    if (!ownerId || !stationId) {
      setMessage('请先登录并选择一个小站')
      return
    }
    setSubmitting(true)
    setMessage(null)
    setProgress({ phase: 'save', done: 0, total: selected.length, text: '写入小站…' })
    const summary = { added: 0, skipped: 0, generated: 0, failed: 0, offline: 0 }

    try {
      // ① 命中公共库 → 只存引用，重复自动跳过
      if (selectedHits.length > 0) {
        const items = selectedHits.map((r) => ({ wordKey: r.wordKey, source: 'public' }))
        if (online) {
          const { data, error } = await stationWordsApi.addMany(ownerId, stationId, items)
          if (error) {
            // 网络失败 → 落离线草稿，联网后补传（PRD 用户故事 8）
            offlineApi.enqueue('stationWords', { ownerId, stationId, items })
            summary.offline += items.length
          } else {
            summary.added += data.inserted
            summary.skipped += data.skipped
          }
        } else {
          offlineApi.enqueue('stationWords', { ownerId, stationId, items })
          summary.offline += items.length
        }
      }

      // ② 未命中 → 服务端生成（一次批量调用，前端只发一次请求）
      if (selectedMiss.length > 0) {
        if (!online) {
          offlineApi.enqueue('generate', {
            ownerId,
            stationId,
            forms: selectedMiss.map((r) => r.form),
          })
          summary.offline += selectedMiss.length
          setProgress({ phase: 'offline', done: selected.length, total: selected.length, text: '已存为草稿，联网后自动补生成' })
        } else {
          setProgress({ phase: 'generate', done: selectedHits.length, total: selected.length, text: `生成 ${selectedMiss.length} 个新词…` })
          const { data, error } = await generateApi.generate(
            selectedMiss.map((r) => r.form),
            stationId,
            (p) => setProgress(p),
          )
          if (error) {
            summary.failed += selectedMiss.length
            setMessage(`生成失败：${error.message}`)
          } else {
            ;(data?.results || []).forEach((r) => {
              if (r.status === 'public_hit') summary.added += 1
              else if (r.status === 'generated') summary.generated += 1
              else summary.failed += 1
            })
          }
        }
      }

      setProgress({ phase: 'done', done: selected.length, total: selected.length, text: '完成' })
      const parts = [`已加入 ${summary.added} 词`]
      if (summary.generated) parts.push(`新生成 ${summary.generated} 词`)
      if (summary.skipped) parts.push(`跳过 ${summary.skipped} 条重复`)
      if (summary.failed) parts.push(`${summary.failed} 条失败`)
      if (summary.offline) parts.push(`${summary.offline} 条存为离线草稿`)
      setMessage(parts.join(' · '))
      setRaw('')
      if (onDone) onDone(summary)
    } finally {
      setSubmitting(false)
    }
  }, [ownerId, stationId, online, selected, selectedHits, selectedMiss, onDone])

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-semibold text-slate-700">批量加词</h2>
        <span className="text-xs text-slate-400">
          支持逗号 / 分号 / 空格 / 换行分隔，自动去重
        </span>
        {!indexReady && <span className="text-xs text-amber-600">词条索引加载中…</span>}
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={4}
        placeholder="把今天遇到的生词粘进来，例如：&#10;photosynthesis, quixotic; obtuse  ubiquitous"
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 resize-y"
      />

      {parsed.stats.total > 0 && (
        <div className="mt-2 text-xs text-slate-500">
          解析 {parsed.stats.total} 个 token：
          <span className="text-emerald-700"> 可用 {parsed.stats.valid}</span>
          {parsed.stats.duplicate > 0 && <span className="text-slate-400"> · 去重 {parsed.stats.duplicate}</span>}
          {parsed.stats.invalid > 0 && <span className="text-amber-600"> · 非法 {parsed.stats.invalid}</span>}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-2 border border-slate-200 rounded">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border-b border-slate-200 text-xs">
            <button onClick={toggleAll} className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-white">
              {checked.size === rows.length ? '全不选' : '全选'}
            </button>
            <span className="text-slate-500">已选 {checked.size} / {rows.length}</span>
            <span className="ml-auto text-slate-400">
              ✓ 命中公共库 · ⚡ 待生成 · ⚠ 站内已有
            </span>
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-slate-100">
            {rows.map((r) => (
              <label
                key={r.formKey}
                className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked.has(r.formKey)}
                  onChange={() => toggle(r.formKey)}
                  className="accent-blue-600"
                />
                <span className="font-medium text-slate-700 w-48 truncate">{r.form}</span>
                {r.kind === 'hit' && <span className="text-emerald-600 text-xs">✓ 命中公共库</span>}
                {r.kind === 'miss' && <span className="text-amber-600 text-xs">⚡ 待生成</span>}
                {r.kind === 'unknown' && <span className="text-slate-400 text-xs">…</span>}
                {r.already && <span className="text-amber-600 text-xs">⚠ 站内已有</span>}
                {r.cefr && <span className="text-xs text-slate-400">{r.cefr}</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {submitting ? '处理中…' : `加入小站（${selected.length}）`}
        </button>
        {!ownerId && <span className="text-xs text-amber-700">请先登录</span>}
        {ownerId && !stationId && <span className="text-xs text-amber-700">请先新建 / 选择一个小站</span>}
        {!online && <span className="text-xs text-amber-700">离线：将存为草稿，联网后自动补传</span>}
      </div>

      {progress && progress.phase !== 'done' && (
        <div className="mt-2 text-xs text-slate-500">
          {progress.text}
          {progress.total > 0 && `（${progress.done}/${progress.total}）`}
        </div>
      )}

      {message && (
        <div className="mt-2 text-xs px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
          {message}
        </div>
      )}

      {parsed.items.some((it) => !it.valid) && (
        <div className="mt-2 text-xs text-amber-700">
          已忽略：
          {parsed.items
            .filter((it) => !it.valid)
            .slice(0, 6)
            .map((it) => `${it.form || '空'}（${it.reason}）`)
            .join('、')}
        </div>
      )}
    </div>
  )
}

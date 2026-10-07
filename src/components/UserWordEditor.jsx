import React, { useState } from 'react'
import * as userWordsApi from '../lib/cloud/userWords.js'
import * as generateApi from '../lib/cloud/generate.js'

/**
 * 私有词编辑 + 重新生成（PRD R-10）
 * ------------------------------------------------------------------
 * 红线：音标不可编辑、不可由模型生成 —— 这里只展示「音标待补」或查表得到的音标。
 * 任何编辑都会写 edited_by_user = true。
 *
 * props:
 *   word        统一视图对象（含 userWordId / form / pos / gloss / example / usage / morphs / chain）
 *   ownerId     当前用户 id
 *   onClose     () => void
 *   onSaved     () => void
 */
export default function UserWordEditor({ word, ownerId, onClose, onSaved }) {
  const [pos, setPos] = useState(word.pos || '')
  const [gloss, setGloss] = useState(word.gloss || '')
  const [cefr, setCefr] = useState(word.cefr || 'B1')
  const [exampleEn, setExampleEn] = useState(word.example?.en || '')
  const [exampleZh, setExampleZh] = useState(word.example?.zh || '')
  const [usage, setUsage] = useState(word.usage || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const id = word.userWordId

  const save = async () => {
    setBusy(true)
    setError(null)
    setNotice(null)
    const { error: err } = await userWordsApi.patch(id, {
      pos,
      gloss,
      cefr,
      example: exampleEn || exampleZh ? { en: exampleEn, zh: exampleZh } : null,
      usage: usage || null,
    })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('已保存（标记为用户编辑）')
    if (onSaved) onSaved()
  }

  const regenerate = async () => {
    if (!window.confirm('重新生成会覆盖当前释义 / 例句 / 拆解，确定？')) return
    setBusy(true)
    setError(null)
    setNotice(null)
    const { data, error: err } = await generateApi.retry(word.form, null)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    if (!data || data.status !== 'generated' || !data.userWord) {
      setError(data?.message || '重新生成失败，请稍后重试')
      return
    }
    setNotice('已重新生成并覆盖')
    if (onSaved) onSaved()
  }

  const remove = async () => {
    if (!window.confirm(`删除私有词「${word.form}」？各小站里的引用也会一并移除。`)) return
    setBusy(true)
    const { error: err } = await userWordsApi.remove(ownerId, id, word.wordKey)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    if (onSaved) onSaved()
  }

  return (
    <div className="p-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold text-slate-800">编辑私有词：{word.form}</h2>
        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px]">
          仅本人可见
        </span>
        {word.editedByUser && (
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">已手工编辑</span>
        )}
        <button onClick={onClose} className="ml-auto text-xs text-slate-400 hover:text-blue-600">
          ← 返回小站
        </button>
      </div>

      {/* 音标：只读展示（红线：严禁编辑 / 严禁模型生成） */}
      <div className="mb-3 text-xs text-slate-500">
        音标：
        {word.phoneticBr ? (
          <span className="font-medium text-slate-700">{word.phoneticBr}</span>
        ) : (
          <span className="text-amber-600">音标待补（由词典查表提供，不可编辑）</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate-500">
          词性
          <input
            value={pos}
            onChange={(e) => setPos(e.target.value)}
            placeholder="n. / v. / adj."
            className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          难度 CEFR
          <select value={cefr} onChange={(e) => setCefr(e.target.value)} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block mt-3 text-xs text-slate-500">
        中文释义
        <input
          value={gloss}
          onChange={(e) => setGloss(e.target.value)}
          className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm"
        />
      </label>

      <label className="block mt-3 text-xs text-slate-500">
        例句（英文）
        <textarea
          value={exampleEn}
          onChange={(e) => setExampleEn(e.target.value)}
          rows={2}
          className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm"
        />
      </label>

      <label className="block mt-3 text-xs text-slate-500">
        例句（中文）
        <textarea
          value={exampleZh}
          onChange={(e) => setExampleZh(e.target.value)}
          rows={2}
          className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm"
        />
      </label>

      <label className="block mt-3 text-xs text-slate-500">
        用法说明
        <textarea
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          rows={2}
          className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-sm"
        />
      </label>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={save}
          disabled={busy || !id}
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40"
        >
          {busy ? '保存中…' : '保存'}
        </button>
        <button
          onClick={regenerate}
          disabled={busy}
          className="px-3 py-1.5 rounded border border-amber-400 text-amber-700 text-sm hover:bg-amber-50 disabled:opacity-40"
        >
          重新生成
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="px-3 py-1.5 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50 disabled:opacity-40"
        >
          删除
        </button>
      </div>

      {error && <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5">{error}</div>}
      {notice && <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1.5">{notice}</div>}

      <div className="mt-4 text-xs text-slate-400">
        构词拆解：
        {(word.chain || []).length === 0 ? (
          <span className="ml-1 text-amber-600">未拆解（x.unk）</span>
        ) : (
          <span className="ml-1">
            {(word.chain || []).map((c, i) => (
              <span key={i}>
                {i > 0 && ' + '}
                <span className="text-slate-600">{c.form}</span>
                <span className="text-slate-400">（{c.gloss}）</span>
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

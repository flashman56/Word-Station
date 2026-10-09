import React, { useMemo } from 'react'
import { firstGloss } from '../lib/wordForms.js'

/**
 * 「常见变形」与「派生词」展示区块。
 * ------------------------------------------------------------------
 * 用在学习卡（StudyCard）与词详情（WordDetail）两个面上 —— **两处共用同一组件**，
 * 防止两个 UI 面各写一份、文案与排序迟早漂移（用户会在学习卡和词云里看到同一个词
 * 被列出两套不一样的变形）。
 *
 * ★ 纯展示、零数据依赖 ★
 *   数据由上游的 `relatedOf`（= `buildWordForms(...).relatedFor`）同步算出：
 *   它在 AppShell 里已按整个词库建好索引并缓存，这里只做一次 O(1) 查表 + 渲染，
 *   绝不在渲染期遍历词库，也绝不 import 任何 `words-*.js`。
 *
 * ★ 优雅降级 ★
 *   无变形也无派生词（或未提供 relatedOf）→ 渲染 null（不占位、不报错），
 *   与 UsageSupplement 同风格。
 *
 * props:
 *   word     object  当前词条（需含 id / form / gloss / morphs）
 *   relatedOf (word) => { forms: object[], derivatives: object[] }  由上游注入
 *   onSelect 可选 (wordId) => void  提供时 chip 可点（详情页跳转）；否则只读
 *   showDerivatives 可选 boolean，默认 true；详情页对「无拆解词」传 false，
 *                   避免与既有的「同族词」区块重复列出同一批词
 */
export default function WordForms({ word, relatedOf, onSelect, showDerivatives = true }) {
  const related = useMemo(() => {
    if (!word || typeof relatedOf !== 'function') return { forms: [], derivatives: [] }
    const r = relatedOf(word)
    return r && typeof r === 'object' ? r : { forms: [], derivatives: [] }
  }, [word, relatedOf])

  const forms = Array.isArray(related.forms) ? related.forms : []
  const derivatives = Array.isArray(related.derivatives) ? related.derivatives : []
  const showDerivs = showDerivatives !== false && derivatives.length > 0

  if (forms.length === 0 && !showDerivs) return null

  const baseGloss = word && word.gloss

  return (
    <div className="mt-3">
      {forms.length > 0 && (
        <section className="mb-2">
          <p className="text-xs font-semibold text-slate-500 mb-1.5">常见变形</p>
          <div className="flex items-center flex-wrap gap-1.5">
            {forms.map((f) => (
              <Chip key={f.id} item={f} baseGloss={baseGloss} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}
      {showDerivs && (
        <section>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">派生词</p>
          <div className="flex items-center flex-wrap gap-1.5">
            {derivatives.map((d) => (
              <Chip key={d.id} item={d} baseGloss={baseGloss} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * 单个词形 chip。
 * - 有 `onSelect` → 渲染为可点按钮（详情页用，点了跳到该词）；
 * - 无 `onSelect` → 渲染为只读 span（学习卡用，作答阶段不该跳走）。
 * - 简注只在「与本词释义不同」时显示：屈折形与代表形同义，重复显示只会制造噪音。
 *
 * @param {{ item: object, baseGloss: string|undefined, onSelect?: (id:string)=>void }} props
 */
function Chip({ item, baseGloss, onSelect }) {
  const label = item && item.form ? String(item.form) : ''
  const gloss = item && item.gloss && item.gloss !== baseGloss ? firstGloss(item.gloss) : ''
  const cls = 'px-2 py-1 rounded border border-slate-200 text-xs'
  const inner = (
    <>
      <span className="font-medium text-slate-700">{label}</span>
      {gloss && <span className="text-slate-400 ml-1">{gloss}</span>}
    </>
  )
  if (typeof onSelect === 'function') {
    return (
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        title={item.gloss || ''}
        className={`${cls} hover:border-blue-300 hover:bg-blue-50 transition-colors`}
      >
        {inner}
      </button>
    )
  }
  return (
    <span className={cls} title={item.gloss || ''}>
      {inner}
    </span>
  )
}

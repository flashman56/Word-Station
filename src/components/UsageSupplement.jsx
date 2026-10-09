import React, { useEffect, useState } from 'react'
import { getUsageSupplement } from '../lib/usageSupplement.js'

/**
 * 用法补充区块：固定搭配 / 背景 / 用法。
 *
 * 数据按需从构建期分片 public/data/v1/usage/u-<bucket>.json 加载
 * （源文件 src/data/usage-extra.js 有 12.4MB / 26,983 条，绝不能整包进 bundle）。
 * 查一个词只拉它所属的那一片（约 40~470KB），由 lib/usageSupplement.js 负责。
 * 任意词无条目、词形非法、分片缺失或加载失败 → 渲染 null（不占位、不报错），
 * 与词详情面板 / 学习卡既有内容视觉一致（中性 slate 风格，不引入花哨 UI）。
 *
 * props:
 *   form  string  词形（大小写不限；lookup 内部按小写键查找）
 */
export default function UsageSupplement({ form }) {
  const [entry, setEntry] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    setReady(false)
    setEntry(null)
    getUsageSupplement(form)
      .then((e) => {
        if (alive) setEntry(e || null)
      })
      .catch(() => {
        if (alive) setEntry(null)
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [form])

  // 未就绪、无数据、或三字段全空 → 什么都不渲染（优雅降级）
  if (!ready || !entry) return null
  const collocations = entry.collocations || []
  const background = entry.background || ''
  const usage = entry.usage || ''
  const hasContent = collocations.length > 0 || background || usage
  if (!hasContent) return null

  return (
    <section className="mt-3">
      <h3 className="text-xs font-semibold text-slate-500 mb-1.5">用法补充</h3>
      <div className="rounded-md bg-slate-50 border border-slate-100 p-2.5 text-xs leading-relaxed text-slate-600">
        {collocations.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold text-slate-600 mb-1">固定搭配</p>
            <div className="flex flex-wrap gap-1.5">
              {collocations.map((phrase, i) => (
                <span
                  key={`${phrase}-${i}`}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}
        {background && (
          <div className="mb-2">
            <p className="font-semibold text-slate-600 mb-0.5">背景</p>
            <p className="text-slate-600 leading-relaxed">{background}</p>
          </div>
        )}
        {usage && (
          <div>
            <p className="font-semibold text-slate-600 mb-0.5">用法</p>
            <p className="text-slate-600 leading-relaxed">{usage}</p>
          </div>
        )}
      </div>
    </section>
  )
}

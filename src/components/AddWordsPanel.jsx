import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parse } from '../lib/parseForms.js'
import { isIndexReady, loadIndex, lookupForms } from '../lib/dict.js'
import { scopeOf } from '../lib/migrate.js'
import * as addToStationApi from '../lib/addToStation.js'
import * as generateApi from '../lib/cloud/generate.js'
import * as offlineApi from '../lib/cloud/offline.js'

/**
 * 消息三态的唯一配色源（与色唯一源 derive.STATUS 是同一种纪律：色与文案不许两处各判一次）
 *
 * ★ 为什么必须是三态而不是「有 message / 没 message」★
 *   旧实现是一个字符串 + 固定 emerald 底色。于是「已加入 0 词 · 20 条失败」会显示成
 *   一条**绿色的成功消息** —— 这正是 A-01 最恶劣的地方：不只是数据丢了，UI 还在
 *   告诉用户「一切正常」。而更早的一条错误消息会被后一条 setMessage 直接覆盖，
 *   用户只能看到最后一句（PRD 3-5 / A-17 同源）。
 */
const TONE_CLASS = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-900',
  error: 'bg-red-50 border-red-200 text-red-700',
}

/**
 * 批量加词面板：粘贴 → 解析 → 预览（命中 ✓ / 待生成 ⚡ / 站内已有 ⚠）→ 勾选 → 提交
 *
 * props:
 *   ownerId       当前用户 id（游客为 null）
 *   stationId     当前小站 id（无小站时禁用提交）
 *   existingKeys  站内已有 wordKey 集合（用于「重复」提示）
 *   online        是否在线（离线时命中词走草稿队列）
 *   onDone        (summary) => void 提交完成回调（触发小站词条刷新）
 *
 * ★ 草稿一律带 scope：草稿队列按账号分区，A 离线时加的词不会在 B 登录后
 *   被推进 B 的账号（generate 更危险——服务端从 JWT 推导 owner，
 *   旧账号遗留的生词草稿会在 B 会话下真的把词生成到 B 库里）。
 *
 * ★ 全代码库唯一的 setRaw('') 在 submit() 的收敛点上，且条件是「零失败零草稿」★
 *   见 submit() 末尾的注释 —— 这是三道防护里唯一防「数据消失」的那一道。
 */
export default function AddWordsPanel({ ownerId, stationId, existingKeys, online = true, onDone }) {
  const scope = scopeOf(ownerId)
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(() => parse(''))
  const [checked, setChecked] = useState(() => new Set())
  const [lookup, setLookup] = useState({ hit: [], miss: [] })
  const [indexReady, setIndexReady] = useState(isIndexReady())
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(null)
  // ★ 改 { tone, text }：色与文案由同一个 tone 计算派生，不允许两处各判一次
  const [message, setMessage] = useState(null)
  // 「词条已入库、但没进小站」「配额校验失败」等真实原因。
  // ★ 与 message（汇总计数）分开：统计口径不变（已入库的仍算 generated），
  //   但把服务端回传的真实原因显示出来，避免「静默失败」——
  //   用户看到「生成成功」却不知道词没进小站。
  const [notice, setNotice] = useState([])
  const textareaRef = useRef(null)

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
  //
  // ★ A-02：`wordKey === null` 的行不参与提交 ★
  //   `indexReady === false` 时 lookup 恒为空 → 所有行 kind 都是 'unknown'、
  //   wordKey 为 null。此时**只勾选 unknown 行**就是灾难的起点：它们看起来
  //   「全被勾上了」，但一个都提交不了（selectedHits / selectedMiss 双双为空），
  //   于是显示「已加入 0 词」并清空输入框 —— 20 个词凭空消失且零报错。
  useEffect(() => {
    const result = parse(raw)
    setParsed(result)
    const usable = result.items.filter((it) => it.valid && !it.duplicate)
    if (!indexReady || usable.length === 0) {
      setLookup({ hit: [], miss: [] })
      // ★ 索引未就绪时**一个都不勾选**：宁可让用户看见「全是灰的、按钮点不动」，
      //   也不要制造「看起来已全选、实则提交不了」的假象。
      setChecked(new Set())
      return
    }
    const { hit, miss } = lookupForms(usable.map((it) => it.form))
    setLookup({ hit, miss })
    setChecked(new Set([...hit, ...miss].map((it) => it.formKey)))
  }, [raw, indexReady])

  const existing = existingKeys instanceof Set ? existingKeys : new Set(existingKeys || [])

  /** 预览行：命中 / 待生成 / 站内已有 / 未能识别 */
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

  /**
   * ★ 可提交 / 不可提交的分流（A-02）★
   *
   * `selectable`：能进小站的行（hit 存引用 / miss 走生成）。只有它们参与计数、
   * 参与提交、参与 toggleAll。
   * `unrecognized`：索引没就绪时全部落在这里 —— 置灰、永不默认勾选。
   */
  const selectable = useMemo(() => rows.filter((r) => r.kind === 'hit' || r.kind === 'miss'), [rows])
  const unrecognized = useMemo(() => rows.filter((r) => r.kind === 'unknown'), [rows])

  const toggle = useCallback((formKey) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(formKey)) next.delete(formKey)
      else next.add(formKey)
      return next
    })
  }, [])

  /**
   * ★ M1：`checked.size === rows.length` 这个判据在 A-02 之后永久失效 ★
   *
   * 旧判据拿「已勾选数」比「全部行数」。一旦 unknown 行默认不勾选，
   * `checked.size` 就永远小于 `rows.length` → 「全不选」按钮永久点不动、
   * 文案恒为「全选」。
   *
   * 正确判据是「**每一个可选行**是否都已勾选」—— 可选集单独派生，
   * 不可选的行既不参与判断也不参与操作。
   */
  const allSelectableChecked = useMemo(
    () => selectable.length > 0 && selectable.every((r) => checked.has(r.formKey)),
    [selectable, checked],
  )

  const toggleAll = useCallback(() => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (allSelectableChecked) {
        // 全不选：只清可选的那些（unrecognized 本来就没勾）
        selectable.forEach((r) => next.delete(r.formKey))
        return next
      }
      selectable.forEach((r) => next.add(r.formKey))
      return next
    })
  }, [selectable, allSelectableChecked])

  const selectedSelectable = useMemo(
    () => selectable.filter((r) => checked.has(r.formKey)),
    [selectable, checked],
  )
  const selectedHits = selectedSelectable.filter((r) => r.kind === 'hit')
  const selectedMiss = selectedSelectable.filter((r) => r.kind === 'miss')

  /**
   * ★ A-01 第一道防护：按钮 disabled ★
   *   `indexReady` 是**必需**条件。缺它时用户能在索引加载完成前点下提交，
   *   走进「已加入 0 词 + 输入框被清空」那条路径。
   */
  const canSubmit = Boolean(ownerId && stationId) && selectedSelectable.length > 0 && !submitting && indexReady

  /**
   * 把光标放到输入框末尾（失败后保留原文时的可执行性）。
   * 不做这一步的话，用户粘了 20 个词看到「已加入 0 词」，还得手动全选重粘。
   */
  const focusCaretEnd = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    try {
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
    } catch {
      /* focus 失败不影响任何事 */
    }
  }, [])

  const submit = useCallback(async () => {
    if (!ownerId || !stationId) {
      setMessage({ tone: 'error', text: '请先登录并选择一个小站' })
      return
    }

    // ★ A-01 第二道防护：兜底 early-return ★
    //   防的是「按钮 disabled 生效之前的那一帧」以及脚本/竞态直接调用 submit 的情况。
    //   这一道**单独存在**是有意义的：disabled 是 UI 层的礼貌，不是数据层的保证。
    //   ★ 早退时**绝不碰 setRaw('')** —— 输入框内容保持逐字符不变。
    if (!indexReady) {
      setMessage({ tone: 'warn', text: '词条索引还在加载，请稍候再提交（内容已保留）' })
      focusCaretEnd()
      return
    }

    // 第三道防线在末尾（收敛点）：只有「零失败零草稿」才清空输入框。
    // 这里是**全代码库唯一的 setRaw('')**。
    if (selectedSelectable.length === 0) {
      setMessage({ tone: 'warn', text: '还没有勾选可加入的词' })
      return
    }

    setSubmitting(true)
    setMessage(null)
    setNotice([])
    setProgress({ phase: 'save', done: 0, total: selectedSelectable.length, text: '写入小站…' })
    const summary = { added: 0, skipped: 0, generated: 0, failed: 0, offline: 0 }
    // 收集「统计口径不变、但必须让用户看见」的真实原因
    const notes = []

    try {
      // ① 命中公共库 → 只存引用，重复自动跳过
      //   ★ 走共享出口 addToStation()：入队逻辑不再在本文件内联一份 ——
      //     这段代码此前在 UI 里内联，而 addToStation.js 又要抽同一份，两份必然漂移。
      if (selectedHits.length > 0) {
        const res = await addToStationApi.addToStation({
          ownerId,
          stationId,
          items: selectedHits.map((r) => ({ wordKey: r.wordKey, source: 'public' })),
          online,
          scope,
        })
        summary.added += res.inserted
        summary.skipped += res.skipped
        summary.offline += res.offline
        // ★ 「一次都没写进去」必须记 failed：否则文案会说「已加入 0 词」而看起来像成功
        if (!res.ok && res.offline === 0) {
          summary.failed += selectedHits.length
          if (res.error) notes.push(`加入小站失败：${res.error.message}`)
        }
      }

      // ② 未命中 → 服务端生成（一次批量调用，前端只发一次请求）
      if (selectedMiss.length > 0) {
        if (!online) {
          offlineApi.enqueue(
            'generate',
            {
              ownerId,
              stationId,
              forms: selectedMiss.map((r) => r.form),
            },
            scope,
          )
          summary.offline += selectedMiss.length
          setProgress({
            phase: 'offline',
            done: selectedSelectable.length,
            total: selectedSelectable.length,
            text: '已存为草稿，联网后自动补生成',
          })
        } else {
          setProgress({
            phase: 'generate',
            done: selectedHits.length,
            total: selectedSelectable.length,
            text: `生成 ${selectedMiss.length} 个新词…`,
          })
          const { data, error } = await generateApi.generate(
            selectedMiss.map((r) => r.form),
            stationId,
            (p) => setProgress(p),
          )
          if (error) {
            summary.failed += selectedMiss.length
            // ★ 不再用 setMessage 单独写一条 —— 那会覆盖掉下面的汇总消息（PRD 3-5）
            notes.push(`生成失败：${error.message}`)
          } else {
            const results = data?.results || []
            results.forEach((r) => {
              // ★ 统计口径保持原样：已入库的词仍算 generated / public_hit，
              //   不因为「没进小站」就改判 failed（那会让用户以为白花了额度）。
              if (r.status === 'public_hit') summary.added += 1
              else if (r.status === 'generated') summary.generated += 1
              else summary.failed += 1

              // ---- 以下只补充「原因说明」，不影响上面的计数 ----
              if (r.code === 'QUOTA_CHECK_FAILED') {
                notes.push('配额校验失败，请稍后重试（本次未消耗生成额度，也未调用生成服务）')
              } else if (r.code === 'QUOTA_EXCEEDED') {
                notes.push(r.message || '今日生成额度已用完')
              }
              if (r.stationAdded === false) {
                if (r.stationAddCode === 'STATION_FORBIDDEN') {
                  notes.push(`「${r.form}」：该小站不属于当前账号，词条已存入个人词库但未加入小站`)
                } else {
                  notes.push(`「${r.form}」：${r.stationAddMessage || '词条已保存到个人词库，但加入小站失败'}`)
                }
              }
            })
          }
        }
      }

      setProgress({
        phase: 'done',
        done: selectedSelectable.length,
        total: selectedSelectable.length,
        text: '完成',
      })

      // ★ A-04：文案与配色从同一组数字派生（唯一真相源）★
      //   tone 只有一个计算点，杜绝「色是绿的、说的却是 0 词」这种自相矛盾。
      const parts = [`已加入 ${summary.added} 词`]
      if (summary.generated) parts.push(`新生成 ${summary.generated} 词`)
      if (summary.skipped) parts.push(`跳过 ${summary.skipped} 条重复`)
      if (summary.failed) parts.push(`${summary.failed} 条失败`)
      if (summary.offline) parts.push(`${summary.offline} 条存为离线草稿`)

      // ★ 判定顺序有讲究：error 的前提是「**真的失败了**」，而不是「这次没写进去」★
      //   纯离线时 added/generated 都是 0，但 offline>0、failed===0 —— 那不是失败，
      //   是「推迟到联网后」，应该是琥珀色。若写成 `succeeded === 0 → error`，
      //   每次离线加词都会得到一条刺眼的红色消息，用户会以为词丢了。
      const succeeded = summary.added + summary.generated + summary.skipped
      const tone =
        summary.failed === 0 && summary.offline === 0 ? 'success' : summary.failed > 0 && succeeded === 0 ? 'error' : 'warn'
      setMessage({ tone, text: parts.join(' · ') })

      // 同一条原因可能命中多个词（如整个小站都 FORBIDDEN），去重后再展示
      setNotice([...new Set(notes)])

      // ★★★ A-01 第三道防护：清空输入框的**唯一**位置与**唯一**条件 ★★★
      //
      // 条件是「零失败 + 零草稿」。任何一种「有一部分没进去」的情形 —— 失败、
      // 落草稿、校验错 —— 都保留原文并把光标定位到末尾。
      //
      // 为什么把它写成收敛点而不是散落的 early-return：③ 真正防的不是「这一条
      // 路径」，而是**将来任何新增的失败分支**。散落的 early-return 漏一个就
      // 又是一次「20 个词凭空消失」。收敛后「清空」只有一个发生点，且它的前置
      // 条件可以被一眼读完。
      if (summary.failed === 0 && summary.offline === 0) {
        setRaw('')
      } else {
        focusCaretEnd()
      }

      if (onDone) onDone(summary)
    } finally {
      setSubmitting(false)
    }
  }, [
    ownerId,
    stationId,
    online,
    scope,
    indexReady,
    selectedSelectable,
    selectedHits,
    selectedMiss,
    onDone,
    focusCaretEnd,
  ])

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-semibold text-slate-700">批量加词</h2>
        <span className="text-xs text-slate-400">
          支持逗号 / 分号 / 空格 / 换行分隔，自动去重
        </span>
        {!indexReady && (
          <span className="text-xs text-amber-600">词条索引加载中…索引就绪后才能提交</span>
        )}
      </div>

      <textarea
        ref={textareaRef}
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
            <button
              onClick={toggleAll}
              disabled={selectable.length === 0}
              className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-white"
            >
              {/* ★ M1：判据是「全部可选行是否已勾」，不是「checked.size === rows.length」 */}
              {allSelectableChecked ? '全不选' : '全选'}
            </button>
            <span className="text-slate-500">
              已选 {selectedSelectable.length} / {selectable.length}
            </span>
            {unrecognized.length > 0 && (
              <span className="text-slate-400">（另有 {unrecognized.length} 个待识别）</span>
            )}
            <span className="ml-auto text-slate-400">
              ✓ 命中公共库 · ⚡ 待生成 · ⚠ 站内已有
            </span>
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-slate-100">
            {rows.map((r) => {
              // ★ A-02：unrecognized 行置灰、复选框禁用、且**永不默认勾选**
              const disabled = r.kind === 'unknown'
              return (
                <label
                  key={r.formKey}
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm ${
                    disabled ? 'text-slate-400 bg-slate-50/60' : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!disabled && checked.has(r.formKey)}
                    disabled={disabled}
                    onChange={() => toggle(r.formKey)}
                    className="accent-blue-600"
                  />
                  <span className={`w-48 truncate ${disabled ? '' : 'font-medium text-slate-700'}`}>{r.form}</span>
                  {r.kind === 'hit' && <span className="text-emerald-600 text-xs">✓ 命中公共库</span>}
                  {r.kind === 'miss' && <span className="text-amber-600 text-xs">⚡ 待生成</span>}
                  {r.kind === 'unknown' && (
                    <span className="text-slate-400 text-xs">未能识别，索引就绪后可重试</span>
                  )}
                  {r.already && <span className="text-amber-600 text-xs">⚠ 站内已有</span>}
                  {r.cefr && <span className="text-xs text-slate-400">{r.cefr}</span>}
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          {submitting ? '处理中…' : `加入小站（${selectedSelectable.length}）`}
        </button>
        {!ownerId && <span className="text-xs text-amber-700">请先登录</span>}
        {ownerId && !stationId && <span className="text-xs text-amber-700">请先新建 / 选择一个小站</span>}
        {/* ★ A-01 第一道防护的可见解释：为什么按钮是灰的 */}
        {ownerId && stationId && !indexReady && (
          <span className="text-xs text-amber-700">词条索引加载中，就绪后才能提交（内容不会丢）</span>
        )}
        {!online && <span className="text-xs text-amber-700">离线：将存为草稿，联网后自动补传</span>}
      </div>

      {progress && progress.phase !== 'done' && (
        <div className="mt-2 text-xs text-slate-500">
          {progress.text}
          {progress.total > 0 && `（${progress.done}/${progress.total}）`}
        </div>
      )}

      {/* ★ A-04 三态：色与文案同源，绝不出现「绿色的失败消息」 */}
      {message && (
        <div className={`mt-2 text-xs px-2 py-1.5 rounded border ${TONE_CLASS[message.tone] || TONE_CLASS.success}`}>
          {message.text}
        </div>
      )}

      {/* 真实原因（成功计数之外）：词条入库了但没进小站 / 配额校验失败等。
          不做成红色错误块：这些情况下词往往已经生成成功，红字会误导用户以为白花了额度。 */}
      {notice.length > 0 && (
        <ul className="mt-2 text-xs px-2 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 space-y-0.5">
          {notice.map((n, i) => (
            <li key={`${i}-${n.slice(0, 12)}`}>⚠ {n}</li>
          ))}
        </ul>
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

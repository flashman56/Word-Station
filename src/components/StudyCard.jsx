import React, { useEffect, useState } from 'react'
import { MASTER_THRESHOLD, statusLabel } from '../lib/learning.js'
// 红线：音标只查表（public/data/v1/phon/*.json，源头是 ECDICT），严禁模型生成
import { phoneticsOfAsync } from '../lib/dict.js'
import { shouldShowPhoneticPending } from '../lib/phoneticDisplay.js'
import { hasDecomposition, morphlessKindLabel } from '../lib/derive.js'
import { useSpeech } from '../hooks/useSpeech.js'
import SpeakerButton from './SpeakerButton.jsx'
import UsageSupplement from './UsageSupplement.jsx'
import WordForms from './WordForms.jsx'

/**
 * 单张学习 / 复习卡片。
 *
 * 作答前只显示词形 / 音标 / 词性 + 两个按钮（不记得 / 记得）；
 * 揭开态（点过「记得」但尚未确认）展开中文释义、双语例句、构词拆解，但**输入不锁死**、
 * 也不出现「下一个」；已落盘（answered）后追加状态反馈，且只能点「下一个」。
 *
 * 语义：点「记得」= **两步确认**。第一次只揭开释义/例句（revealed）供用户自我核对，
 * **不落盘、不改状态**；第二次（按钮变「确实记得 →」）才调用 onMarkKnown 标记为已掌握。
 * 点「不记得」= 立刻加入待复习；在揭开态下点它同样走这条正常答错路径（可反悔）。
 *
 * props:
 *   word        单词对象 { id, form, pos, gloss, phoneticBr?, example?, chain }
 *   mode        'learn' | 'review'
 *   onAnswer    (result: 'correct'|'incorrect') => { record, statusChanged, mastered } | void
 *   onMarkKnown () => void
 *   onNext      () => void
 *   record      可选，当前学习记录（用于进度展示）
 *   onViewInCloud 可选 (word) => void，提供时显示「在词云中查看」入口
 *   relatedOf   可选 (word) => { forms, derivatives }，提供时展示「常见变形 / 派生词」
 */
export default function StudyCard({
  word,
  mode = 'learn',
  onAnswer,
  onMarkKnown,
  onNext,
  record,
  onViewInCloud,
  autoSpeak = false,
  relatedOf,
}) {
  const [answered, setAnswered] = useState(false)
  const [revealed, setRevealed] = useState(false) // 「记得」第 1 步：已揭开释义、尚未确认掌握
  const [result, setResult] = useState(null) // 'correct' | 'incorrect' | 'known'
  const [out, setOut] = useState(null) // onAnswer 的返回值，便于立刻给反馈

  const isReview = mode === 'review'
  const { speak } = useSpeech()

  // 自动朗读（默认关）：进入新卡时朗读**单词**（绝不读例句）。
  // StudyCard 在 StudySession 中以 key=index 挂载，故换卡即重挂 → 每次只读新词一次。
  useEffect(() => {
    if (!autoSpeak) return
    speak(word.form, { lang: 'en-US', rate: 0.85 })
  }, [word.form, autoSpeak, speak])

  const handleAnswer = (r) => {
    if (answered) return
    const res = onAnswer ? onAnswer(r) : undefined
    setResult(r)
    setOut(res || null)
    setAnswered(true)
  }

  // 「记得」第 1 步：只揭开释义，不调 onMarkKnown —— 自评必须先看到答案才有意义。
  // answered 仍是 false，所以此刻「不记得」照常走 handleAnswer（可反悔）。
  const handleReveal = () => {
    if (answered || revealed) return
    setRevealed(true)
  }

  // 「记得」第 2 步：自评通过，才真正标记为已掌握。
  const handleMarkKnown = () => {
    if (answered) return
    if (!revealed) {
      handleReveal()
      return
    }
    if (onMarkKnown) onMarkKnown()
    setResult('known')
    setAnswered(true)
  }

  // 揭开态是「详情已展开但输入未锁死」的中间态：详情块与作答按钮都要渲染。
  const showDetail = answered || revealed

  const feedback = buildFeedback(result, out, isReview)
  // 作答后优先用本次返回的新记录展示 x/2 进度
  const displayRecord = (out && out.record) || record || null

  // 音标 / 例句 / 用法：词条自带字段优先，缺的异步查音标分片（ECDICT 查表，非生成）
  const [phon, setPhon] = useState(null)
  useEffect(() => {
    let alive = true
    setPhon(null)
    if (word.phoneticBr && word.example) return undefined
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
  }, [word.form, word.phoneticBr, word.example])

  const phonetic = word.phoneticBr || (phon && phon.phonetic) || null
  const example = word.example || (phon && phon.example) || null
  const usage = word.usage || (phon && phon.usage) || null

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      {/* 词头 */}
      <div className="flex items-end gap-3 flex-wrap">
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">{word.form}</h2>
        {/* 喇叭：作答前 / 后均可点，不影响下方作答按钮 */}
        <SpeakerButton text={word.form} size="md" className="mb-1" />
        {phonetic ? (
          <span className="text-lg text-slate-400">/{phonetic.replace(/^\/|\/$/g, '')}/</span>
        ) : shouldShowPhoneticPending(word, phonetic) ? (
          <span className="text-xs text-amber-600">音标待补</span>
        ) : null}
        {word.pos && (
          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
            {word.pos}
          </span>
        )}

        {/* 词云跳转入口：会话暂停但进度保留，返回「学习」页签即可继续 */}
        {onViewInCloud && (
          <button
            type="button"
            onClick={() => onViewInCloud(word)}
            title="在词云中查看该词（本轮学习暂停，进度保留）"
            className="ml-auto self-center px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            ☁ 在词云中查看
          </button>
        )}
      </div>

      {/* 未作答 / 已揭开未确认：两个按钮（不记得 / 记得 → 确实记得）。answered=true 后不再渲染 */}
      {!answered && (
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            onClick={() => handleAnswer('incorrect')}
            className="py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
          >
            不记得
          </button>
          <button
            onClick={handleMarkKnown}
            title={revealed ? '确认记得：标记为已掌握' : '先看看释义，再决定是否真的记得'}
            className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            {revealed ? '确实记得 →' : '记得'}
          </button>
        </div>
      )}

      {/* 揭开态提示：释义已展开，但还没有落盘 */}
      {revealed && !answered && (
        <p className="mt-3 text-sm text-slate-500">释义已展开 · 对上了再点「确实记得 →」，没对上点「不记得」</p>
      )}

      {/* 详情块：answered 或 revealed 任一成立即复用同一段 markup（不复制 JSX） */}
      {showDetail && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            {/* 揭开态 result 仍为 null —— 没有结论就不渲染空药丸 */}
            {feedback.text && (
              <span
                className="text-sm font-medium px-2.5 py-1 rounded-full"
                style={{
                  background:
                    feedback.tone === 'good'
                      ? '#e4f5ee'
                      : feedback.tone === 'known'
                        ? '#f1f3f6'
                        : '#fdeaea',
                  color:
                    feedback.tone === 'good'
                      ? '#3fa07a'
                      : feedback.tone === 'known'
                        ? '#9aa1ac'
                        : '#c9484b',
                }}
              >
                {feedback.text}
              </span>
            )}
            {displayRecord && (
              <span className="text-xs text-slate-400">{statusLabel(displayRecord)}</span>
            )}
          </div>

          <p className="text-lg text-slate-800">{word.gloss}</p>

          {example && example.en && (
            <div className="mt-3 pl-3 border-l-2 border-slate-200">
              <p className="text-slate-700 italic">{example.en}</p>
              {example.zh && <p className="text-slate-500 text-sm mt-0.5">{example.zh}</p>}
            </div>
          )}

          {usage && (
            <div className="mt-3 rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">用法</p>
              <p className="text-slate-600 text-sm leading-relaxed">{usage}</p>
            </div>
          )}

          {/* 用法补充：固定搭配 / 背景 / 用法（按需异步加载，无条目则无渲染） */}
          <UsageSupplement form={word.form} />

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">构词拆解</p>
            {/* ★ 判据是「chain 里有没有内容」(derive.hasDecomposition)，不是 word.morphless ★
                remorph 补丁给 2244 个 morphless 词补了 morphs/chain，但必须保留
                morphless:true（validate-data.mjs 的硬约束），判标记会让这 2244 条补丁
                一条都不显示 —— 这正是用户看到「标题在、面板空」的根因。判 chain 后
                补丁全部生效。文案与 WordDetail（App.jsx）同源同字符串，防止两个 UI 面漂移。 */}
            {hasDecomposition(word) ? (
              <div className="flex items-center flex-wrap gap-1.5">
                {word.chain.map((step, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-300">+</span>}
                    <span className="px-2 py-1 rounded border border-slate-200 text-xs">
                      <span className="font-medium text-slate-700">{step.form}</span>
                      <span className="text-slate-400 ml-1">{step.gloss}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
                无词素 · {morphlessKindLabel(word)}
              </div>
            )}
          </div>

          {/* 常见变形 / 派生词：与词详情（App.jsx WordDetail）**同一组件、同一顺序**，
              两个 UI 面共用一份渲染，文案与排序不会漂移。无内容则整体不渲染。 */}
          <WordForms word={word} relatedOf={relatedOf} />

          {/* 下一个只在已落盘（answered）后出现：揭开态下必须先在「确实记得 / 不记得」之间做出结论，
              否则这一词会既没写记录、也没进 results，结算页口径会漏算。 */}
          {answered && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={onNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                下一个 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 根据作答结果生成反馈文案与色调。
 * @param {('correct'|'incorrect'|'known'|null)} result
 * @param {{ record?: object, mastered?: boolean }|null} out  onAnswer 的返回值
 * @param {boolean} isReview
 */
function buildFeedback(result, out, isReview) {
  if (!result) return { text: '', tone: 'neutral' }
  if (result === 'known') return { text: '记得，已掌握 ✓', tone: 'good' }
  if (result === 'correct') {
    const rec = out && out.record
    const mastered = Boolean(out && out.mastered)
    const isKnown = (rec && rec.status === 'known') || mastered
    if (isKnown) return { text: '认识，已掌握 ✓', tone: 'good' }
    const left = MASTER_THRESHOLD - (rec && rec.consecutiveCorrect ? rec.consecutiveCorrect : 1)
    return { text: `答对了，再对 ${left} 次即可掌握`, tone: 'good' }
  }
  // incorrect（最小到期调度：答错 +1 天，次日到期再排复习）
  return { text: '不记得，已加入待复习 · 明天到期', tone: 'bad' }
}

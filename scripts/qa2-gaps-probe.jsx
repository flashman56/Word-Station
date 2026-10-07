/**
 * GAP-8 探针（QA 专用，被 scripts/qa2-gaps.mjs 打包执行）
 *
 * 用**真的** LearnHome + VocabCard + estimateVocabulary + toUserWordView +
 * countByStatus / buildReviewQueue，把 App.jsx 里 B-8 那一行的判据
 * （`userWords.words.length <= MAX_VOCAB_PRIVATE_WORDS`）原样搬过来。
 *
 * 为什么搬那一行而不是渲染整个 App：整个 App 要加载 16MB 词库与懒加载
 * chunk，测一个布尔护栏不值当；而这一行判据本身只有 1 行，搬过来即等价。
 * 组件本身（LearnHome / VocabCard）是**真组件**，提示文案是它真渲染出来的。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import LearnHome from '../src/components/LearnHome.jsx'
import { MAX_VOCAB_PRIVATE_WORDS } from '../src/lib/derive.js'
import { toUserWordView } from '../src/lib/wordView.js'
import { estimateVocabulary } from '../src/lib/vocab.js'
import { countByStatus, buildReviewQueue } from '../src/lib/learning.js'

/** 造 n 个「真私有词」：user_words 行 → toUserWordView（id === wordKey） */
function makePrivateRows(n) {
  const out = []
  for (let i = 0; i < n; i += 1) {
    const form = `qa2priv${i}`
    const wordKey = `u.${form}`
    out.push(
      toUserWordView({
        id: `row-${i}`,
        wordKey,
        form,
        pos: 'n',
        gloss: `释义 ${i}`,
        morphs: [],
        chain: [],
        cefr: 'B1',
        freqRank: null, // 私有词典型形状：freqRank 为 null
        phoneticBr: null,
        phoneticStatus: 'ready',
        example: null,
        usage: null,
        note: null,
        editedByUser: false,
        generationStatus: 'ready',
      }),
    )
  }
  return out
}

/**
 * 公共词表：**必须够大**，否则 estimateVocabulary 的外推会退化成 0。
 * vocab.js 的 estimate = Σ_b knownP_b × libraryN_b，libraryN_b 是各档的词库规模；
 * 只有 40 个词时任何一档都凑不出有意义的规模 → 估算为 0 → 我第一版就因为这个
 * 误判成「护栏把估算打成 0 了」。用 3000 个（跨 AUTO_KNOWN_RANK=2500）才有意义。
 */
const PUBLIC_WORDS = Array.from({ length: 3000 }, (_, i) => ({
  id: `w.pub${i}`,
  form: `pub${i}`,
  freqRank: 100 + i, // 100~3099，跨过 2500 那条继承线
  cefr: 'B1',
  morphs: [],
  chain: [],
}))

/**
 * 学习记录：公共词默认 known（模拟「学过了」），私有词按 mode 决定状态。
 * @param {Array} words
 * @param {'known'|'review'} mode
 */
function makeRecords(words, mode = 'known') {
  const at = new Date().toISOString()
  const recs = {}
  words.forEach((w) => {
    recs[w.id] = {
      status: mode === 'review' ? 'review' : 'known',
      correctCount: mode === 'review' ? 0 : 3,
      consecutiveCorrect: mode === 'review' ? 0 : 3,
      incorrectCount: mode === 'review' ? 2 : 0,
      lastStudiedAt: at,
      lastResult: mode === 'review' ? 'incorrect' : 'correct',
      lastIncorrectAt: mode === 'review' ? at : null,
      // nextDueAt 为 null → isReviewDue 视为已到期（复习队列只排 review + 已到期）
      nextDueAt: null,
      statusChangedAt: at,
      statusSource: 'learning',
      updatedAt: at,
    }
  })
  return recs
}

let root = null
let latest = null

/**
 * 以 n 个私有词渲染 LearnHome。
 * @returns {number} 词汇量估算值
 */
export function renderWithPrivate(n) {
  const privateWords = makePrivateRows(n)
  const statWords = [...PUBLIC_WORDS, ...privateWords]
  const records = makeRecords(statWords)

  // ★ App.jsx:245 的判据，原样 ★
  const vocabIncludesPrivate = privateWords.length <= MAX_VOCAB_PRIVATE_WORDS
  const vocabInput = vocabIncludesPrivate ? statWords : PUBLIC_WORDS
  const vocab = estimateVocabulary(vocabInput, records)
  latest = { vocab, privateWords, statWords, records, vocabIncludesPrivate }

  const container = window.document.getElementById('root')
  if (!root) {
    container.innerHTML = ''
    root = ReactDOM.createRoot(container)
  }
  root.render(
    <LearnHome
      stats={countByStatus(statWords, records)}
      vocab={vocab}
      privateCount={privateWords.length}
      vocabIncludesPrivate={vocabIncludesPrivate}
      reviewQueue={buildReviewQueue(statWords, records, 10, new Date().toISOString())}
      learnQueue={[]}
      round={null}
      onAnswer={() => {}}
    />,
  )
  return vocab.estimate
}

export function vocabNumber() {
  return latest ? latest.vocab.estimate : NaN
}

export function firstPrivateView() {
  return latest && latest.privateWords.length ? latest.privateWords[0] : null
}

export function statsFor(n) {
  const pw = makePrivateRows(n)
  const sw = [...PUBLIC_WORDS, ...pw]
  return countByStatus(sw, makeRecords(sw))
}

export function reviewQueueFor(n) {
  const pw = makePrivateRows(n)
  const sw = [...PUBLIC_WORDS, ...pw]
  // ★ 复习队列只排 status==='review' 且已到期的词 ★
  //   全部标成 known 时队列当然是空的 —— 那是 fixture 的错，不是 B-4 的问题。
  //   所以这里单独造一份「都是 review」的记录。
  return buildReviewQueue(sw, makeRecords(sw, 'review'), 10, new Date().toISOString())
}
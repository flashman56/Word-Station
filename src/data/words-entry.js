/**
 * 单词数据懒加载入口（仅供词云三视图 / 学习队列按需 import）
 * ------------------------------------------------------------------
 * 与 src/data/index.js 的区别：**不含 phonetics.js（11.5MB）**。
 * 音标/例句/用法一律走 src/lib/dict.js 的异步分片查表，绝不打进 bundle。
 *
 * 红线：本文件只聚合 words-*.js，不是离线脚本入口；
 *       离线脚本请用 src/data/index.js。
 */
import wordsLatin from './words-latin.js'
import wordsGreek from './words-greek.js'
import wordsAffix from './words-affix.js'
import wordsExtra from './words-extra.js'
import wordsMono from './words-mono.js'
import wordsMonoExtra from './words-mono-extra.js'
import wordsMonoSeed from './words-mono-seed.js'
import morphemes from './morphemes.js'
import wordsRemorph from './words-remorph.js'
import wordsBookmorph from './words-bookmorph.js'
import wordsLoan from './words-loan.js'
import wordsEtymReviewed from './words-etym-reviewed.js'
import { chainWithCanonicalGloss } from '../lib/derive.js'
import wordsLemma, { LEMMA_BY_ID } from './words-lemma.js'
import wordsForms, { FORMS_BY_ID } from './words-forms.js'

export const WORD_FILES = [
  wordsLatin,
  wordsGreek,
  wordsAffix,
  wordsExtra,
  wordsMono,
  wordsMonoExtra,
  wordsMonoSeed,
]

/**
 * 补丁合并（**与 src/data/index.js 逐字同款——既有明写契约**）：
 *
 * ① words-etym-reviewed：逐词人工复核结果，精确替换对应词条的 morphs 与 chain，
 *    允许删除被证实错误的旧挂载；这是唯一采用替换语义的词源补丁层。
 * ② words-remorph：无词素词的「构词提示」补丁，把 scripts/resegment-morphs.mjs
 *    生成的 morphHints 合并进对应词条的 morphs / chain，使这些原本 morphless 的词
 *    也能挂到词素岛屿下。只做加法：绝不修改既有 gloss / phonetics / 原 morphs 内容，
 *    只在末尾追加新拆出的词素 id，并**保持 morphless 标记不变**（validate 据此放行）。
 * ③ words-lemma ：屈折归并补丁，命中词条附 `.lemma`（= 代表形 id），供
 *    src/lib/lemmaFold.js 的 buildFoldView 做**读时**折叠（不落盘、不删词条）。
 * ④ words-forms ：「常见变形」展示关系补丁，命中词条附 `.formRep`（= 展示用
 *    代表形 id），**仅供 UI 展示**，不参与折叠 —— 展示比折叠宽（收的是双向印证
 *    的全部可靠屈折关系），但**不改变任何词条的学习单元身份**。详见
 *    src/data/words-forms.js 头部注释与 scripts/gen-forms-patch.mjs。
 * ⑤ words-loan ：借词（loan / mono）构词提示补丁，与 words-remorph 同机制，仅覆盖新用户队列里
 *    确可拆出真实词素的借词（scripts/gen-loan-patch.mjs 依据审核后的候选生成）。
 *    沿用「只做加法、保持 morphless 标记」原则，validate 据此放行。
 */
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))
const BOOKMORPH = new Map(wordsBookmorph.map((p) => [p.id, p]))
const LOANMORPH = new Map(wordsLoan.map((p) => [p.id, p]))
const ETYM_REVIEWED = new Map(wordsEtymReviewed.map((p) => [p.id, p]))
const MORPH_IDS = new Set(morphemes.map((m) => m.id))
// 词素 id -> 权威 gloss（单一信源）。chain 分段 gloss 一律收敛到表里，消除漂移。
const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))

const rawWords = WORD_FILES.flat()
export const words = rawWords.map((w) => {
  // 人工逐词复核优先级最高；不得让旧自动/书本补丁覆盖已审定结论。
  const patch = ETYM_REVIEWED.get(w.id) || BOOKMORPH.get(w.id) || REMORPH.get(w.id) || LOANMORPH.get(w.id)
  const hasEtymReview = ETYM_REVIEWED.has(w.id)
  const lemma = LEMMA_BY_ID.get(w.id)
  const formRep = FORMS_BY_ID.get(w.id)
  const hints = patch ? patch.morphHints.filter((mid) => MORPH_IDS.has(mid)) : []
  const etymReview = hasEtymReview ? {
    status: patch.status || 'reviewed',
    sourceName: patch.sourceName || 'Wiktionary',
    sourceUrl: patch.sourceUrl || `https://en.wiktionary.org/wiki/${encodeURIComponent(String(w.form || '').replaceAll(' ', '_'))}`,
  } : null
  // ★★ formRep **必须**一起纳入早退判断 ★★
  //    只带 formRep、不带 remorph / lemma 的词（如 determined / blown / cleared）
  //    若漏了它，会在这一行被原样 return w，永远拿不到字段 —— 卡面也就永远不显示
  //    它的常见变形。这是本补丁最容易漏的一处。
  if (hints.length === 0 && !hasEtymReview && !lemma && !formRep) {
    // 早退词也可能自带 chain（base 文件里写死的），同样收敛 gloss
    if (w.chain && w.chain.length) {
      const nc = chainWithCanonicalGloss(w.chain, GLOSS_BY_ID)
      if (nc !== w.chain) return { ...w, chain: nc, ...(etymReview ? { etymReview } : {}) }
    }
    return etymReview ? { ...w, etymReview } : w
  }
  // ★ morphs 必须去重（与 src/data/index.js 逐字同款——既有明写契约）★
  //   合并是「base 的 morphs + 补丁的 morphHints」直接追加。补丁与 base 命中**同一个**
  //   词素时会产出重复 id（如 base 有 s.ment、补丁也补 s.ment → ["s.ment","s.ment"]）。
  //   重复会让词素岛计数 / countByMorph 把同一个词算两次，统计虚高。
  //   真实触发例：2026-10-14 修 r.ment→s.ment 冲突后，government/resentment 等 25 词
  //   的 morphs 出现重复。词素 id 本身是集合语义，去重永远正确、不改变语义。
  // 人工逐词复核是权威替换：旧自动拆解中的错误挂载必须能被移除；其他补丁仍只做加法。
  const out = hasEtymReview
    ? { ...w, morphs: [...new Set(hints)], chain: patch.chain }
    : hints.length === 0
      ? { ...w }
      : { ...w, morphs: [...new Set([...(w.morphs || []), ...hints])], chain: patch.chain }
  if (out.chain && out.chain.length) out.chain = chainWithCanonicalGloss(out.chain, GLOSS_BY_ID)
  if (lemma) out.lemma = lemma
  if (formRep) out.formRep = formRep
  if (etymReview) out.etymReview = etymReview
  // ★ 复核清空拆解后必须补 morphless 标记（数据自洽，非绕过门禁）★
  //   逐词复核会把**证据不足**的拆解整个移除（unverified 词条的 morphHints 为空），
  //   于是最终 morphs 变成空数组。R6 是硬约束「morphs 为空 ⇒ 显式 morphless: true」，
  //   这里在数据装配层补齐，而不是让每条 unverified 词目各自记得带标记。
  //   注意：base 文件里这些词原本带 morphless:false（因为它们曾被自动补丁补过拆解），
  //   移除拆解后若不翻标记，数据就自相矛盾了。
  if (hasEtymReview && Array.isArray(out.morphs) && out.morphs.length === 0) out.morphless = true
  return out
})

export default words

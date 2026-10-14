/**
 * 数据统一入口 —— 仅供离线脚本使用
 * ------------------------------------------------------------------
 * ⚠️ 前端禁止 import 本文件：它连带 phonetics.js（11.5MB）一起进 bundle。
 *    前端请用 src/data/words-entry.js（只有单词）+ src/lib/dict.js（音标异步查表）。
 *
 * 单词按来源拆成三个文件，只是为了单个文件不至于太长、便于分批改。
 * 想批量扩充时：
 *   1. 在 morphemes.js 末尾追加词素；
 *   2. 在 words-latin / words-greek / words-affix 任一文件里追加单词；
 *      （也可以新建 words-xxx.js，然后在这里 import 并塞进 WORD_FILES 数组）
 *   3. 跑 npm run validate 检查引用是否正确。
 */
import morphemes from './morphemes.js'
import { chainWithCanonicalGloss } from '../lib/derive.js'
import wordsLatin from './words-latin.js'
import wordsGreek from './words-greek.js'
import wordsAffix from './words-affix.js'
import wordsExtra from './words-extra.js'
import wordsMono from './words-mono.js'
import wordsMonoExtra from './words-mono-extra.js'
import wordsMonoSeed from './words-mono-seed.js'
import phonetics, { phoneticsOf } from './phonetics.js'
import wordsRemorph from './words-remorph.js'
import wordsBookmorph from './words-bookmorph.js'
import wordsLoan from './words-loan.js'
import wordsLemma, { LEMMA_BY_ID } from './words-lemma.js'
import wordsForms, { FORMS_BY_ID } from './words-forms.js'

export const WORD_FILES = [wordsLatin, wordsGreek, wordsAffix, wordsExtra, wordsMono, wordsMonoExtra, wordsMonoSeed]

/**
 * 与 src/data/words-entry.js 保持完全一致的补丁合并逻辑，
 * 让离线脚本（validate / test:*）看到的 morphs / lemma / formRep 与线上运行时一致。
 *
 * ★ 两份文件必须逐字同款（既有明写契约）★
 *   ① words-remorph：命中词条追加 morphHints 与 chain（只做加法）；
 *   ② words-lemma ：命中词条附 `.lemma`（= 代表形 id），供 lib/lemmaFold.js 读时折叠；
 *   ③ words-forms ：命中词条附 `.formRep`（= 展示用代表形 id），**仅供 UI 展示**
 *      「常见变形」，不参与折叠 —— 展示与折叠是两件事，见该文件头部注释。
 *   ④ words-loan ：借词（loan / mono）构词提示补丁，与 ① 同机制，仅覆盖确可拆出真实
 *      词素的借词（scripts/gen-loan-patch.mjs 依据审核后候选生成），保持 morphless 标记。
 */
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))
const BOOKMORPH = new Map(wordsBookmorph.map((p) => [p.id, p]))
const LOANMORPH = new Map(wordsLoan.map((p) => [p.id, p]))
const MORPH_IDS = new Set(morphemes.map((m) => m.id))
// 词素 id -> 权威 gloss（单一信源）。chain 分段 gloss 一律收敛到表里，消除漂移。
const GLOSS_BY_ID = new Map(morphemes.map((m) => [m.id, m.gloss]))

const rawWords = WORD_FILES.flat()
export const words = rawWords.map((w) => {
  const patch = BOOKMORPH.get(w.id) || REMORPH.get(w.id) || LOANMORPH.get(w.id)
  const lemma = LEMMA_BY_ID.get(w.id)
  const formRep = FORMS_BY_ID.get(w.id)
  const hints = patch ? patch.morphHints.filter((mid) => MORPH_IDS.has(mid)) : []
  // ★★ formRep **必须**一起纳入早退判断 ★★
  //    只带 formRep、不带 remorph / lemma 的词（如 determined / blown / cleared）
  //    若漏了它，会在这一行被原样 return w，永远拿不到字段 —— 卡面也就永远不显示
  //    它的常见变形。这是本补丁最容易漏的一处。
  if (hints.length === 0 && !lemma && !formRep) {
    // 早退词也可能自带 chain（base 文件里写死的），同样收敛 gloss
    if (w.chain && w.chain.length) {
      const nc = chainWithCanonicalGloss(w.chain, GLOSS_BY_ID)
      if (nc !== w.chain) return { ...w, chain: nc }
    }
    return w
  }
  // ★ morphs 必须去重 ★
  //   合并是「base 的 morphs + 补丁的 morphHints」直接追加。补丁与 base 命中**同一个**
  //   词素时会产出重复 id（如 base 有 s.ment、补丁也补 s.ment → ["s.ment","s.ment"]）。
  //   重复会让词素岛计数 / countByMorph 把同一个词算两次，统计虚高。
  //   真实触发例：2026-10-14 修 r.ment→s.ment 冲突后，government/resentment 等 25 词
  //   的 morphs 出现重复。词素 id 本身是集合语义，去重永远正确、不改变语义。
  const out = hints.length === 0 ? { ...w } : { ...w, morphs: [...new Set([...(w.morphs || []), ...hints])], chain: patch.chain }
  if (out.chain && out.chain.length) out.chain = chainWithCanonicalGloss(out.chain, GLOSS_BY_ID)
  if (lemma) out.lemma = lemma
  if (formRep) out.formRep = formRep
  return out
})

export { morphemes, phonetics, phoneticsOf }
export default { morphemes, words, phonetics, phoneticsOf }

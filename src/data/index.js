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
import wordsLatin from './words-latin.js'
import wordsGreek from './words-greek.js'
import wordsAffix from './words-affix.js'
import wordsExtra from './words-extra.js'
import wordsMono from './words-mono.js'
import wordsMonoExtra from './words-mono-extra.js'
import wordsMonoSeed from './words-mono-seed.js'
import phonetics, { phoneticsOf } from './phonetics.js'
import wordsRemorph from './words-remorph.js'
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
 */
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))
const MORPH_IDS = new Set(morphemes.map((m) => m.id))

const rawWords = WORD_FILES.flat()
export const words = rawWords.map((w) => {
  const patch = REMORPH.get(w.id)
  const lemma = LEMMA_BY_ID.get(w.id)
  const formRep = FORMS_BY_ID.get(w.id)
  const hints = patch ? patch.morphHints.filter((mid) => MORPH_IDS.has(mid)) : []
  // ★★ formRep **必须**一起纳入早退判断 ★★
  //    只带 formRep、不带 remorph / lemma 的词（如 determined / blown / cleared）
  //    若漏了它，会在这一行被原样 return w，永远拿不到字段 —— 卡面也就永远不显示
  //    它的常见变形。这是本补丁最容易漏的一处。
  if (hints.length === 0 && !lemma && !formRep) return w
  const out = hints.length === 0 ? { ...w } : { ...w, morphs: [...(w.morphs || []), ...hints], chain: patch.chain }
  if (lemma) out.lemma = lemma
  if (formRep) out.formRep = formRep
  return out
})

export { morphemes, phonetics, phoneticsOf }
export default { morphemes, words, phonetics, phoneticsOf }

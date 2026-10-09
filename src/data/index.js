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

export const WORD_FILES = [wordsLatin, wordsGreek, wordsAffix, wordsExtra, wordsMono, wordsMonoExtra, wordsMonoSeed]

/**
 * 与 src/data/words-entry.js 保持完全一致的再切分补丁合并逻辑，
 * 让离线脚本（validate / test:*）看到的 morphs 与线上运行时一致。
 */
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))
const MORPH_IDS = new Set(morphemes.map((m) => m.id))

const rawWords = WORD_FILES.flat()
export const words = rawWords.map((w) => {
  const patch = REMORPH.get(w.id)
  if (!patch) return w
  const hints = patch.morphHints.filter((mid) => MORPH_IDS.has(mid))
  if (hints.length === 0) return w
  return { ...w, morphs: [...(w.morphs || []), ...hints], chain: patch.chain }
})

export { morphemes, phonetics, phoneticsOf }
export default { morphemes, words, phonetics, phoneticsOf }

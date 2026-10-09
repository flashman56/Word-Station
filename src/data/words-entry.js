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
import wordsLemma, { LEMMA_BY_ID } from './words-lemma.js'

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
 * ① words-remorph：无词素词的「构词提示」补丁，把 scripts/resegment-morphs.mjs
 *    生成的 morphHints 合并进对应词条的 morphs / chain，使这些原本 morphless 的词
 *    也能挂到词素岛屿下。只做加法：绝不修改既有 gloss / phonetics / 原 morphs 内容，
 *    只在末尾追加新拆出的词素 id，并**保持 morphless 标记不变**（validate 据此放行）。
 * ② words-lemma ：屈折归并补丁，命中词条附 `.lemma`（= 代表形 id），供
 *    src/lib/lemmaFold.js 的 buildFoldView 做**读时**折叠（不落盘、不删词条）。
 */
const REMORPH = new Map(wordsRemorph.map((p) => [p.id, p]))
const MORPH_IDS = new Set(morphemes.map((m) => m.id))

const rawWords = WORD_FILES.flat()
export const words = rawWords.map((w) => {
  const patch = REMORPH.get(w.id)
  const lemma = LEMMA_BY_ID.get(w.id)
  const hints = patch ? patch.morphHints.filter((mid) => MORPH_IDS.has(mid)) : []
  if (hints.length === 0 && !lemma) return w
  const out = hints.length === 0 ? { ...w } : { ...w, morphs: [...(w.morphs || []), ...hints], chain: patch.chain }
  if (lemma) out.lemma = lemma
  return out
})

export default words

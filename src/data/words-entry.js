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

export const WORD_FILES = [
  wordsLatin,
  wordsGreek,
  wordsAffix,
  wordsExtra,
  wordsMono,
  wordsMonoExtra,
  wordsMonoSeed,
]

/** 全量单词（合并后） */
export const words = WORD_FILES.flat()

export default words

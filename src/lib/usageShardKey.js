/**
 * 用法补充分片的桶键（构建期与运行时共用的唯一口径）
 * ------------------------------------------------------------------
 * 构建期 scripts/split-data.mjs 用它把 src/data/usage-extra.js 切成
 *   public/data/v1/usage/u-<bucket>.json
 * 运行时 src/lib/usageSupplement.js 用同一个函数算出 bucket，
 * 再经 manifest.usageShards[bucket] 找到要拉的那一片。
 *
 * ★ 为什么必须共用一份实现 ★
 *   桶键一旦两侧漂移（构建期切 a-ab、运行时期望 a-ba），表现是「静默查不到数据」，
 *   不报错、不白屏，最难查。这里由单文件实现 + 两处 import 从根上消除漂移。
 *
 * ★ 为什么分片内容可以安全合并 ★
 *   每个分片是 { [完整词形]: entry } 的字典，查找始终用完整词形做 key，
 *   所以两个前缀被编码成同一个桶时只是「提前合并」，绝不丢条目、绝不串数据。
 *
 * ★ 音标红线 ★
 *   本模块只负责算桶键，不接触任何数据内容；更不会引入音标字段。
 *   音标只能由 phonetics（src/lib/dict.js 查 phon 分片）提供。
 */

/** 桶键非法/缺省时的占位（保证任何输入都能得到一个可寻址的桶名） */
const FALLBACK_BUCKET = '__'

/**
 * 把字符编码成桶键里的单个字符：
 *   a-z / 0-9 原样保留，其余（含 '-'、'\''、重音字符、空位）统一记作 '_'。
 * 碰撞是安全的：同桶的条目会被合并进同一片，查找仍按完整词形命中。
 *
 * @param {string} ch 单个字符
 * @returns {string}
 */
function encodeChar(ch) {
  if (!ch) return '_'
  return /[a-z0-9]/.test(ch) ? ch : '_'
}

/**
 * 计算词形对应的分片桶键（两字母：`首字母桶 + 次字母桶`）。
 *
 * 形如 'about' -> 'ab'、'Zürich' -> 'zu'、'a-' -> 'a_'、'42' -> '42'。
 * 单词只有 1 个字母时，次字母位记作 '_'（'a' -> 'a_'）。
 *
 * @param {string|undefined|null} form 词形（大小写/首尾空白不限，内部归一化）
 * @returns {string} 两字符桶键；输入为空时返回 '__'
 */
export function usageBucketOf(form) {
  const key = String(form ?? '')
    .trim()
    .toLowerCase()
  if (!key) return FALLBACK_BUCKET
  return encodeChar(key.charAt(0)) + encodeChar(key.charAt(1))
}

/**
 * 分片文件名（不含目录）。与 split-data.mjs 的写盘口径一致。
 *
 * @param {string} bucket 桶键
 * @returns {string} 例：'ab' -> 'u-ab.json'
 */
export function usageShardFileName(bucket) {
  return `u-${bucket}.json`
}
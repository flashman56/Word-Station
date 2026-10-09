/**
 * 公共词库按需加载：构建期切分片
 * ------------------------------------------------------------------
 * 读 src/data/index.js（离线脚本入口，前端禁止 import），产出：
 *   public/data/v1/manifest.json         版本 + 分片清单
 *   public/data/v1/words-index.json      formSlug -> [shardIdx, idx, freqRank, cefrIdx]
 *   public/data/v1/words/w-<n>.json      完整词条，1500 条/片
 *   public/data/v1/phon/p-<a..z|_>.json  音标/例句/用法，按首字母分片
 *   public/data/v1/usage/u-<bucket>.json 用法补充（固定搭配/背景/用法），按两字母前缀分片
 *
 * 用法：npm run split:data
 *
 * 红线：
 *   - 只做「读 → 切 → 写」，不修改任何词条内容（音标严禁生成，这里更不会动）。
 *   - 切分必须稳定：同一输入产出同一批文件（分片顺序按 words 数组原顺序）。
 *   - usage-extra 字段只有 c/b/u，绝不在这里引入任何音标字段。
 */
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { words, phonetics } from '../src/data/index.js'
// 用法补充数据源（26,983 条，12.4MB）。只读取，不改写。
import { usageExtra } from '../src/data/usage-extra.js'
// slug 口径与前端 wordKey.js 共用一份实现，避免两侧漂移
import { slug as slugForm } from '../src/lib/wordKey.js'
// 桶键口径与前端 usageSupplement.js 共用一份实现，避免两侧漂移
import { usageBucketOf, usageShardFileName } from '../src/lib/usageShardKey.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/data/v1')
const VERSION = 'v1'
const SHARD_SIZE = 1500

/** CEFR -> 紧凑整数编码（0 表示未知/缺失），索引里不存字符串以节省体积 */
const CEFR_LIST = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const cefrIdxOf = (cefr) => {
  const i = CEFR_LIST.indexOf(cefr)
  return i < 0 ? 0 : i
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function main() {
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error('src/data/index.js 没有产出任何单词，终止切分')
  }

  // 清理旧产物，避免残留分片被 manifest 漏掉或误引用
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  ensureDir(resolve(OUT_DIR, 'words'))
  ensureDir(resolve(OUT_DIR, 'phon'))
  ensureDir(resolve(OUT_DIR, 'usage'))

  // ---------------------------------------------------------------- 词条分片
  const index = {}
  const shardCount = Math.ceil(words.length / SHARD_SIZE)
  let written = 0

  for (let s = 0; s < shardCount; s += 1) {
    const slice = words.slice(s * SHARD_SIZE, (s + 1) * SHARD_SIZE)
    writeFileSync(
      resolve(OUT_DIR, 'words', `w-${s}.json`),
      JSON.stringify(slice),
      'utf8',
    )
    slice.forEach((w, i) => {
      const slug = slugForm(w.form)
      if (!slug) return
      // [分片号, 片内下标, 词频序号(0=缺失), CEFR 编码]
      index[slug] = [
        s,
        i,
        typeof w.freqRank === 'number' && Number.isFinite(w.freqRank) ? w.freqRank : 0,
        cefrIdxOf(w.cefr),
      ]
    })
    written += slice.length
  }

  writeFileSync(resolve(OUT_DIR, 'words-index.json'), JSON.stringify(index), 'utf8')

  // ---------------------------------------------------------------- 音标分片
  // phonetics: { [form小写]: { p, en, zh, u } }；按首字母分 27 片（a-z + '_'）
  const phonGroups = new Map()
  const phonKeys = Object.keys(phonetics || {})
  phonKeys.forEach((form) => {
    const entry = phonetics[form]
    if (!entry || typeof entry !== 'object') return
    const first = String(form).charAt(0).toLowerCase()
    const bucket = /[a-z]/.test(first) ? first : '_'
    if (!phonGroups.has(bucket)) phonGroups.set(bucket, {})
    phonGroups.get(bucket)[form] = entry
  })

  const phonShards = {}
  ;[...phonGroups.keys()].sort().forEach((bucket) => {
    const file = `data/${VERSION}/phon/p-${bucket}.json`
    phonShards[bucket] = file
    writeFileSync(
      resolve(OUT_DIR, 'phon', `p-${bucket}.json`),
      JSON.stringify(phonGroups.get(bucket)),
      'utf8',
    )
  })

  // ---------------------------------------------------------------- 用法补充分片
  // usageExtra: { [form小写]: { c, b, u } }；按「两字母前缀」分片。
  //
  // 为什么不是首字母：usage-extra 有 12.4MB / 26,983 条，首字母最大片 1.26MB；
  // 两字母前缀最大片 455KB，且查一个词永远只命中 1 片。
  // 桶键口径由 src/lib/usageShardKey.js 独占定义，运行时复用同一份实现。
  const USAGE_ALLOWED_FIELDS = new Set(['c', 'b', 'u'])
  const usageGroups = new Map()
  const usageKeys = Object.keys(usageExtra || {})
  usageKeys.forEach((form) => {
    const entry = usageExtra[form]
    if (!entry || typeof entry !== 'object') return
    // 音标红线守卫：usage-extra 只允许 c/b/u，出现音标类字段立即让构建失败。
    Object.keys(entry).forEach((field) => {
      if (!USAGE_ALLOWED_FIELDS.has(field)) {
        throw new Error(
          `usage-extra.js 的 "${form}" 含非法字段 "${field}"；只允许 c/b/u（音标红线）`,
        )
      }
    })
    const bucket = usageBucketOf(form)
    if (!usageGroups.has(bucket)) usageGroups.set(bucket, {})
    usageGroups.get(bucket)[form] = entry
  })

  const usageShards = {}
  let usageShardCount = 0
  let usageBytes = 0
  let usageLargestBucket = ''
  ;[...usageGroups.keys()].sort().forEach((bucket) => {
    const payload = JSON.stringify(usageGroups.get(bucket))
    usageBytes += Buffer.byteLength(payload, 'utf8')
    if (payload.length > usageLargestBucket.length) usageLargestBucket = bucket
    const file = `data/${VERSION}/usage/${usageShardFileName(bucket)}`
    usageShards[bucket] = file
    writeFileSync(
      resolve(OUT_DIR, 'usage', usageShardFileName(bucket)),
      payload,
      'utf8',
    )
    usageShardCount += 1
  })

  // ---------------------------------------------------------------- manifest
  const manifest = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    wordCount: words.length,
    shardSize: SHARD_SIZE,
    shardCount,
    indexFile: `data/${VERSION}/words-index.json`,
    wordShardPrefix: `data/${VERSION}/words/w-`,
    wordShardSuffix: '.json',
    phonShards,
    // generatedAt 变 → 运行时 IndexedDB 缓存键变 → 旧分片缓存自动失效并被清理。
    usageShards,
    usageShardPrefix: `data/${VERSION}/usage/u-`,
    usageShardSuffix: '.json',
    usageCount: usageKeys.length,
    cefrLegend: CEFR_LIST,
  }
  writeFileSync(resolve(OUT_DIR, 'manifest.json'), JSON.stringify(manifest), 'utf8')

  // ---------------------------------------------------------------- 报告
  const indexBytes = Buffer.byteLength(JSON.stringify(index), 'utf8')
  /* eslint-disable no-console */
  console.log('[split:data] 完成')
  console.log(`  词条        ${written} / ${words.length}`)
  console.log(`  词条分片    ${shardCount} 片 × ${SHARD_SIZE} 条`)
  console.log(`  音标分片    ${Object.keys(phonShards).length} 片（${phonKeys.length} 条）`)
  console.log(
    `  用法分片    ${usageShardCount} 片（${usageKeys.length} 条，` +
      `${(usageBytes / 1024 / 1024).toFixed(2)} MB，最大片 "${usageLargestBucket}"）`,
  )
  console.log(`  索引体积    ${(indexBytes / 1024 / 1024).toFixed(2)} MB（未压缩）`)
  console.log(`  输出目录    public/data/${VERSION}/`)
  /* eslint-enable no-console */
}

main()

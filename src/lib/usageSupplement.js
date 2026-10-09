/**
 * 用法补充数据的按需分片加载封装。
 * ------------------------------------------------------------------
 * src/data/usage-extra.js 已达 12.4MB / 26,983 条（固定搭配 c + 背景 b + 用法 u）。
 * 早期实现是 `import('../data/usage-extra.js')` 整包懒加载，构建产物是单个
 * 7.24MB chunk（gzip 4.6MB）—— 用户点开任何一个词都要下载全部 7.24MB。
 *
 * 现在改为「查哪片拉哪片」，完全沿用 src/lib/dict.js 已验证的音标分片范式：
 *   public/data/v1/usage/u-<bucket>.json   由 scripts/split-data.mjs 在构建期切出
 *   manifest.usageShards[bucket]           bucket -> 分片 URL
 *   内存 Map → IndexedDB → fetch           三级缓存，键带 manifest.generatedAt
 *
 * 桶键由 src/lib/usageShardKey.js 独占定义，与构建期共用同一份实现，避免两侧漂移。
 *
 * 红线：
 *   1) 本模块只承载「固定搭配 / 背景 / 用法」，绝不引入任何音标数据
 *      （音标永远来自 src/lib/dict.js 查 phon 分片）。
 *   2) 任何加载失败（分片缺失 / 网络错误 / IndexedDB 不可用）都降级为 null，
 *      绝不让上层组件崩溃——与整包时代的 .catch 兜底行为完全一致。
 */
import { loadManifest, loadCachedJson } from './dict.js'
import { usageBucketOf } from './usageShardKey.js'

/**
 * 模块级内存缓存：bucket -> { [form小写]: { c, b, u } }。
 * 让 WordDetail 与 StudyCard 同时挂载时，同一桶只下载一次。
 * @type {Map<string, object>}
 */
const bucketCache = new Map()

/** 桶键 -> 该片加载结果（含失败标记），避免并发重复 fetch */
const inflight = new Map()

/** 已确认加载失败的桶，不再重试（防止离线时反复打请求） */
const failedBuckets = new Set()

/**
 * 取某个桶的分片数据；失败一律返回 null（不抛异常）。
 *
 * @param {string} bucket 两字母桶键
 * @returns {Promise<object|null>} { [form小写]: entry } 或 null
 */
async function loadBucket(bucket) {
  if (bucketCache.has(bucket)) return bucketCache.get(bucket)
  if (failedBuckets.has(bucket)) return null
  if (inflight.has(bucket)) return inflight.get(bucket)

  const request = (async () => {
    try {
      // manifest.generatedAt 参与缓存键 → 重新生成数据后老用户不会读到旧缓存。
      const manifest = await loadManifest()
      const file = manifest?.usageShards?.[bucket]
      // manifest 里没有这片 = 这批数据没有该词（或数据版本不匹配），按无数据处理。
      if (!file) {
        bucketCache.set(bucket, null)
        return null
      }
      const table = await loadCachedJson(file, `usage-${bucket}`, manifest)
      if (!table || typeof table !== 'object') {
        failedBuckets.add(bucket)
        return null
      }
      bucketCache.set(bucket, table)
      return table
    } catch (err) {
      // 分片缺失 / 网络错误 / IndexedDB 异常：静默降级，沿用整包时代的 console.warn 口径。
      failedBuckets.add(bucket)
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          `[usageSupplement] usage 分片 "${bucket}" 加载失败，已跳过：`,
          err && err.message ? err.message : err,
        )
      }
      return null
    } finally {
      inflight.delete(bucket)
    }
  })()

  inflight.set(bucket, request)
  return request
}

/**
 * 按词形查询用法补充（固定搭配 / 背景 / 用法）。
 *
 * 只会拉取词形所属的那一个分片，不会加载全量数据。
 *
 * @param {string|undefined|null} form 词形（大小写不限，内部归一化）
 * @returns {Promise<{collocations: string[], background: string, usage: string}|null>}
 *   - 命中且有内容：{ collocations, background, usage }
 *   - 无条目 / 词形非法 / 分片缺失 / 加载失败：null
 *     调用方据此渲染 null，实现「无数据 = 不显示任何内容」的优雅降级。
 */
export async function getUsageSupplement(form) {
  if (!form || typeof form !== 'string') return null
  const key = form.trim().toLowerCase()
  if (!key) return null

  const table = await loadBucket(usageBucketOf(key))
  if (!table) return null

  // 分片内用完整词形做 key（构建期按同一口径归一化），桶键碰撞只会提前合并，不会串词。
  const entry = table[key]
  if (!entry || typeof entry !== 'object') return null

  // 与 usageExtraOf 同口径归一化；这里再兜底一次，确保字段类型稳定。
  return {
    collocations: Array.isArray(entry.c) ? entry.c.filter((s) => typeof s === 'string') : [],
    background: typeof entry.b === 'string' ? entry.b : '',
    usage: typeof entry.u === 'string' ? entry.u : '',
  }
}

/** 清空内存缓存与失败标记（测试用；IndexedDB 缓存保留） */
export function __resetUsageMemory() {
  bucketCache.clear()
  inflight.clear()
  failedBuckets.clear()
}
/**
 * 应用词库加载器。
 *
 * 生产环境从构建期切出的 JSON 分片加载，避免把 64k 词目编译成一个超大 JS chunk；
 * 每片复用 dict.js 的 IndexedDB 缓存和 manifest 版本策略。开发环境由 App 直接动态
 * import words-entry.js，便于改词条后立即热更新，不要求先手动切分数据。
 */
import { loadCachedJson, loadManifest } from './dict.js'

let allWordsCache = null
let allWordsInflight = null
const progressListeners = new Set()

/**
 * 加载完整词库（应用现有队列和视图仍依赖完整词条数组）。
 * @param {(progress: { loaded: number, total: number }) => void} [onProgress]
 * @returns {Promise<object[]>}
 */
export async function loadAllWords(onProgress) {
  if (allWordsCache) return allWordsCache
  if (typeof onProgress === 'function') progressListeners.add(onProgress)
  if (allWordsInflight) return allWordsInflight

  allWordsInflight = (async () => {
    const manifest = await loadManifest()
    const shardCount = Number(manifest?.shardCount)
    const wordCount = Number(manifest?.wordCount)
    const prefix = manifest?.wordShardPrefix
    const suffix = manifest?.wordShardSuffix
    if (
      !Number.isInteger(shardCount) || shardCount < 1 || shardCount > 1000
      || !Number.isInteger(wordCount) || wordCount < 1
      || typeof prefix !== 'string' || typeof suffix !== 'string'
    ) {
      throw new Error('词库清单格式无效，请刷新页面后重试。')
    }

    let loaded = 0
    let nextShard = 0
    let workerError = null
    const shards = new Array(shardCount)
    const workerCount = Math.min(8, shardCount)
    const workers = Array.from({ length: workerCount }, async () => {
      while (nextShard < shardCount && !workerError) {
        const shardIndex = nextShard
        nextShard += 1
        try {
          const shard = await loadCachedJson(
            `${prefix}${shardIndex}${suffix}`,
            `words-${shardIndex}`,
            manifest,
          )
          if (!Array.isArray(shard)) {
            throw new Error(`词库分片 ${shardIndex + 1} 格式无效，请刷新页面后重试。`)
          }
          shards[shardIndex] = shard
          loaded += 1
          for (const listener of progressListeners) {
            try {
              listener({ loaded, total: shardCount })
            } catch {
              /* 一个观察者失败不能中断其他观察者或词库加载 */
            }
          }
        } catch (error) {
          workerError ||= error
          throw error
        }
      }
    })
    await Promise.allSettled(workers)
    if (workerError) throw workerError

    const words = shards.flat()
    if (words.length !== wordCount) {
      throw new Error(`词库数量不完整（${words.length}/${wordCount}），请检查网络后重试。`)
    }
    allWordsCache = words
    return words
  })().finally(() => {
    allWordsInflight = null
    progressListeners.clear()
  })

  return allWordsInflight
}

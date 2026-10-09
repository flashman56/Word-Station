/**
 * 公共词库按需加载器
 * ------------------------------------------------------------------
 * 数据来自构建期产物 public/data/v1/（由 scripts/split-data.mjs 产出）：
 *   manifest.json        分片清单
 *   words-index.json     formSlug -> [shardIdx, idxInShard, freqRank, cefrIdx]
 *   words/w-<n>.json     词条分片（1500 条/片）
 *   phon/p-<x>.json      音标 / 例句 / 用法（按首字母分片）
 *
 * 三级缓存：内存 Map → IndexedDB（按 manifest.generatedAt 版本隔离）→ fetch。
 *
 * 重要：任何音标 / 例句 / 用法数据变更都必须同时更新 manifest.generatedAt，
 * 否则浏览器会继续命中同版本 IndexedDB 缓存，用户看不到新数据。
 *
 * ★ 音标红线 ★
 *   音标只从 phon 分片读取（源头是 ECDICT 离线产出）。
 *   本文件不提供任何「生成音标」的能力，查不到一律返回 null，由 UI 决定是否提示。
 */
import { del as idbDel, get as idbGet, keys as idbKeys, set as idbSet } from 'idb-keyval'
import { publicKey, slug } from './wordKey.js'

// 保留设备级词典缓存命名空间；真正的数据版本由 manifest.generatedAt 追加在其后。
const CACHE_PREFIX = 'wrc.dict.v1:'
const MANIFEST_URL = 'data/v1/manifest.json'

/** @type {object|null} */
let manifestCache = null
/** @type {Map<string, number[]>|null} formSlug -> [shardIdx, idx, freqRank, cefrIdx] */
let indexCache = null
/** @type {Map<number, object[]>|null} shardIdx -> 词条数组 */
const shardCache = new Map()
/** @type {Map<string, object>|null} phonBucket -> {form: entry} */
const phonCache = new Map()
/** 已发起但未完成的请求，避免并发重复 fetch */
const inflight = new Map()

/** 已清理旧 IndexedDB 版本，避免同一页面重复枚举全部键 */
let cleanedCacheVersion = null

/**
 * 由 manifest 生成稳定的 IndexedDB 键。同一 generatedAt 幂等，不同值自然失效。
 *
 * 改音标数据必须更新 generatedAt，否则用户端永远读到旧缓存。
 *
 * @param {{generatedAt?: string}|null} manifest
 * @param {string} cacheKey
 * @returns {string}
 */
export function buildDictCacheKey(manifest, cacheKey) {
  const generatedAt = String(manifest?.generatedAt || 'unversioned').trim() || 'unversioned'
  return `${CACHE_PREFIX}${encodeURIComponent(generatedAt)}:${cacheKey}`
}

/**
 * 清理非当前 manifest 版本的设备级词典缓存。IndexedDB 不可用时静默降级。
 * @param {{generatedAt?: string}|null} manifest
 * @returns {Promise<void>}
 */
async function cleanupStaleCacheVersions(manifest) {
  const currentPrefix = buildDictCacheKey(manifest, '')
  if (cleanedCacheVersion === currentPrefix) return
  cleanedCacheVersion = currentPrefix
  try {
    const allKeys = await idbKeys()
    const staleKeys = allKeys.filter(
      (key) => typeof key === 'string' && key.startsWith(CACHE_PREFIX) && !key.startsWith(currentPrefix),
    )
    await Promise.all(
      staleKeys.map(async (key) => {
        try {
          await idbDel(key)
        } catch {
          /* 单条删除失败不影响查表，也不阻止清理其他旧记录 */
        }
      }),
    )
  } catch {
    /* IndexedDB 不可用（如隐私模式）时不缓存，但查表功能仍可用 */
  }
}

async function fetchJson(url) {
  // reload 同时绕过浏览器 HTTP 缓存，避免已发布的新分片被旧响应遮住。
  const res = await fetch(url, { cache: 'reload' })
  if (!res.ok) throw new Error(`加载 ${url} 失败：HTTP ${res.status}`)
  return res.json()
}

/**
 * 读分片：先 IndexedDB → 再 fetch。内存缓存由各调用方按分片类型维护。
 * @param {string} url
 * @param {string} cacheKey
 * @param {{generatedAt?: string}} manifest
 * @returns {Promise<any>}
 */
async function loadWithCache(url, cacheKey, manifest) {
  const key = buildDictCacheKey(manifest, cacheKey)
  try {
    const cached = await idbGet(key)
    if (cached != null) return cached
  } catch {
    /* IndexedDB 不可用（隐私模式）时直接走网络 */
  }
  if (inflight.has(key)) return inflight.get(key)
  const request = (async () => {
    try {
      const data = await fetchJson(url)
      try {
        await idbSet(key, data)
      } catch {
        /* 缓存写失败不影响功能 */
      }
      return data
    } finally {
      inflight.delete(key)
    }
  })()
  inflight.set(key, request)
  return request
}

/**
 * 加载并缓存 manifest。
 * @returns {Promise<object>}
 */
export async function loadManifest() {
  if (manifestCache) return manifestCache
  // manifest 决定缓存版本，不能再放进自身控制的 IndexedDB 缓存。
  manifestCache = await fetchJson(MANIFEST_URL)
  await cleanupStaleCacheVersions(manifestCache)
  return manifestCache
}

/**
 * 加载词条索引（首屏后台预取即可，1.7MB / gzip 后约 500KB）。
 * @returns {Promise<Map<string, number[]>>}
 */
export async function loadIndex() {
  if (indexCache) return indexCache
  const manifest = await loadManifest()
  const raw = await loadWithCache(manifest.indexFile, 'words-index', manifest)
  indexCache = new Map(Object.entries(raw))
  return indexCache
}

/** 索引是否已就绪（同步查询的前提） */
export function isIndexReady() {
  return indexCache != null
}

/**
 * 已加载索引中的词条总数（未加载返回 0）。
 * @returns {number}
 */
export function indexSize() {
  return indexCache ? indexCache.size : 0
}

/**
 * 纯内存命中查询（零网络往返），供批量加词预览使用。
 * **前提**：必须先 await loadIndex()。
 *
 * @param {string[]} forms 原始词形数组（大小写任意）
 * @returns {{ hit: Array<{form: string, formKey: string, wordKey: string, freqRank: number|null, cefr: string|null}>,
 *            miss: Array<{form: string, formKey: string}> }}
 */
export function lookupForms(forms) {
  const hit = []
  const miss = []
  const index = indexCache
  if (!index) {
    // 索引未就绪：全部视为未命中（调用方应先 loadIndex）
    ;(forms || []).forEach((form) => {
      miss.push({ form, formKey: String(form ?? '').trim().toLowerCase() })
    })
    return { hit, miss }
  }
  const seen = new Set()
  ;(forms || []).forEach((form) => {
    const s = slug(form)
    const formKey = String(form ?? '').trim().toLowerCase()
    if (!s || seen.has(s)) return
    seen.add(s)
    const rec = index.get(s)
    if (!rec) {
      miss.push({ form, formKey })
      return
    }
    const [shardIdx, , freqRank, cefrIdx] = rec
    void shardIdx
    const cefr = manifestCache && Array.isArray(manifestCache.cefrLegend) ? manifestCache.cefrLegend[cefrIdx] || null : null
    hit.push({
      form,
      formKey,
      // 公共库 word_key 就是现有 word.id，老 localStorage 记录零迁移
      wordKey: publicKey(form),
      freqRank: freqRank > 0 ? freqRank : null,
      cefr: cefr || null,
    })
  })
  return { hit, miss }
}

/**
 * 按 word_key 批量加载完整词条（自动聚合并行取分片）。
 * @param {string[]} wordKeys
 * @returns {Promise<object[]>}
 */
export async function loadWords(wordKeys) {
  const keys = [...new Set((wordKeys || []).filter(Boolean))]
  if (keys.length === 0) return []
  await loadIndex()
  const manifest = await loadManifest()

  // word_key(w.<slug>) → 需要哪些分片
  const needShards = new Set()
  const slugToKey = new Map()
  keys.forEach((k) => {
    const s = k.startsWith('w.') ? k.slice(2) : slug(k)
    const rec = indexCache.get(s)
    if (!rec) return
    needShards.add(rec[0])
    if (!slugToKey.has(s)) slugToKey.set(s, k)
  })

  await Promise.all([...needShards].map((s) => loadShard(s, manifest)))

  const out = []
  slugToKey.forEach((key, s) => {
    const rec = indexCache.get(s)
    const shard = shardCache.get(rec[0])
    const word = shard ? shard[rec[1]] : null
    if (word) out.push(word)
  })
  return out
}

/**
 * 加载单个词条分片。
 * @param {number} shardIdx
 * @param {object} [manifest]
 * @returns {Promise<object[]>}
 */
export async function loadShard(shardIdx, manifest = null) {
  if (shardCache.has(shardIdx)) return shardCache.get(shardIdx)
  const mf = manifest || (await loadManifest())
  const url = `${mf.wordShardPrefix}${shardIdx}${mf.wordShardSuffix}`
  const data = await loadWithCache(url, `words-${shardIdx}`, mf)
  shardCache.set(shardIdx, data)
  return data
}

/**
 * 异步查音标 / 例句 / 用法（红线：只查表，绝不生成）。
 * @param {string} form
 * @returns {Promise<{phonetic: string, example: {en: string, zh: string}|null, usage: string}|null>}
 */
export async function phoneticsOfAsync(form) {
  const key = String(form ?? '').trim().toLowerCase()
  if (!key) return null
  const manifest = await loadManifest()
  const first = key.charAt(0)
  const bucket = /[a-z]/.test(first) ? first : '_'
  const file = manifest.phonShards?.[bucket]
  if (!file) return null

  let table = phonCache.get(bucket)
  if (!table) {
    table = await loadWithCache(file, `phon-${bucket}`, manifest)
    phonCache.set(bucket, table)
  }
  const entry = table?.[key]
  if (!entry || typeof entry !== 'object') return null
  return {
    phonetic: typeof entry.p === 'string' ? entry.p : '',
    example:
      typeof entry.en === 'string' && entry.en && typeof entry.zh === 'string' && entry.zh
        ? { en: entry.en, zh: entry.zh }
        : null,
    usage: typeof entry.u === 'string' ? entry.u : '',
  }
}

/** 清空内存缓存（测试用；IndexedDB 缓存保留） */
export function __resetDictMemory() {
  manifestCache = null
  indexCache = null
  shardCache.clear()
  phonCache.clear()
  inflight.clear()
  cleanedCacheVersion = null
}

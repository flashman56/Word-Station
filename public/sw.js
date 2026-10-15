// 发布了不兼容的缓存策略或资源格式时递增版本，activate 会清理旧缓存。
const CACHE_VERSION = 'word-station-v1'
const SHELL_CACHE = `${CACHE_VERSION}:shell`
const ASSET_CACHE = `${CACHE_VERSION}:assets`
const DATA_CACHE = `${CACHE_VERSION}:data`
const SHELL_URLS = ['/', '/index.html', '/offline.html']

async function precacheShell() {
  const shell = await caches.open(SHELL_CACHE)
  await shell.addAll(SHELL_URLS)

  // SW 在首屏资源下载后才注册；安装时从入口 HTML 取出主 JS/CSS 并缓存，
  // 否则离线虽能打开 HTML，却可能因主 bundle 未缓存而无法启动。
  const response = await fetch('/index.html', { cache: 'no-cache' })
  if (!response.ok) throw new Error(`入口页面缓存失败：HTTP ${response.status}`)
  const html = await response.clone().text()
  const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => new URL(match[1], self.location.origin))
    .filter((url) => url.origin === self.location.origin && url.pathname.startsWith('/assets/'))
    .map((url) => url.href)
  if (assetUrls.length) await caches.open(ASSET_CACHE).then((cache) => cache.addAll(assetUrls))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheShell()
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names
      .filter((name) => name.startsWith('word-station-') && !name.startsWith(`${CACHE_VERSION}:`))
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

async function networkFirst(request, cacheName, fallbackUrls = []) {
  const cache = await caches.open(cacheName)
  const useCachedResponse = async () => {
    const cachedRequest = await cache.match(request)
    if (cachedRequest) return cachedRequest
    for (const fallbackUrl of fallbackUrls) {
      const fallback = await cache.match(fallbackUrl)
      if (fallback) return fallback
    }
    return null
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      try { await cache.put(request, response.clone()) } catch { /* 配额不足不影响在线使用 */ }
    } else if (response.status >= 500) {
      // 网络在线但源站/CDN 暂时故障时，也优先保住上次成功缓存的页面或数据。
      const cachedResponse = await useCachedResponse()
      if (cachedResponse) return cachedResponse
    }
    return response
  } catch {
    return await useCachedResponse() || Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    try { await cache.put(request, response.clone()) } catch { /* 配额不足不影响在线使用 */ }
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 账号、同步和生成请求始终直达网络，不进入 Cache Storage。
  if (url.pathname.startsWith('/supabase/') || url.pathname.startsWith('/functions/')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, ['/index.html', '/offline.html']))
    return
  }

  if (url.pathname.startsWith('/data/v1/')) {
    // 在线时检查最新分片；断网时回退到此前访问过的版本。
    event.respondWith(networkFirst(request, DATA_CACHE))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  }
})

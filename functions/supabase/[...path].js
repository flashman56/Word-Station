/**
 * Cloudflare Pages Function —— Supabase 同源代理 / 生产环境网关
 * ------------------------------------------------------------------
 * 浏览器只与本应用的 Pages 域名通信（请求 /supabase/*），本函数在边缘节点
 * 把请求转发到真实 Supabase 项目。这样无论用户本机装了什么代理 / 分流插件，
 * 应用都不再直连 supabase.co，从根上消除 Failed to fetch 与注册/登录失败。
 *
 * 覆盖范围：auth（/supabase/auth/*）、rest（/supabase/rest/*）、
 *           functions（/supabase/functions/*，含 Edge Function generate-word）、storage。
 *
 * 安全：
 *   - 不持有任何密钥；浏览器请求自带的 apikey / Authorization 头原样转发，RLS 照常生效；
 *   - 仅需在 Pages 环境变量里配置 SUPABASE_URL（公开值，非密钥）。
 */
const FALLBACK_SUPABASE_URL = 'https://svnwsbkhpzejygugtorl.supabase.co'

// 逐跳（hop-by-hop）/ 平台注入头，转发时一律剥离，避免干扰上游与浏览器
const BLOCKED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-visitor',
  'cf-worker',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-real-ip',
])

function forwardHeaders(headers) {
  const out = new Headers()
  for (const [key, value] of headers.entries()) {
    if (BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) continue
    out.set(key, value)
  }
  return out
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)

  // /supabase 前缀去掉后拼到真实 Supabase 域名下
  const targetPath = url.pathname.replace(/^\/supabase/, '') || '/'
  const target = new URL(targetPath + url.search, env?.SUPABASE_URL || FALLBACK_SUPABASE_URL)

  const init = {
    method: request.method,
    headers: forwardHeaders(request.headers),
    redirect: 'manual',
  }

  // GET/HEAD 无 body；其余方法原样透传请求体（Workers 原生支持流式转发）
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  const upstream = await fetch(target.toString(), init)

  // 响应头同样剥离逐跳头，避免浏览器解析异常
  const responseHeaders = forwardHeaders(upstream.headers)
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

/**
 * Cloudflare Pages Function —— Supabase 同源代理 / 生产环境网关（中间件版）
 * ------------------------------------------------------------------
 * 浏览器只与本应用的 Pages 域名通信（请求 /supabase/*），本中间件在边缘节点
 * 把请求转发到真实 Supabase 项目。这样无论用户本机装了什么代理 / 分流插件，
 * 应用都不再直连 supabase.co，从根上消除 Failed to fetch 与注册/登录失败。
 *
 * 覆盖范围：auth（/supabase/auth/*）、rest（/supabase/rest/*）、
 *           functions（/supabase/functions/*，含 Edge Function generate-word）、storage。
 *
 * 为什么用 _middleware.js 而不是 [...path].js：
 *   Cloudflare Pages 不允许 catch-all 路由参数包含非字母数字字符，
 *   "[...path]" 中的方括号会触发 "Invalid Pages function route parameter" 报错。
 *   改用 _middleware.js 可拦截 /supabase 下的所有请求，规避该限制。
 *
 * 安全：
 *   - 不持有任何密钥；浏览器请求自带的 apikey / Authorization 头原样转发，RLS 照常生效；
 *   - 仅需在 Pages 环境变量（或 wrangler.toml [vars]）里配置 SUPABASE_URL（公开值，非密钥）。
 */
const FALLBACK_SUPABASE_URL = 'https://svnwsbkhpzejygugtorl.supabase.co'

// 逐跳（hop-by-hop）头：转发到上游时一律剥离，避免协议层冲突
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
])

// Cloudflare 注入头：不应透传给 Supabase，剥离更安全
const CLOUDFLARE_HEADERS = new Set([
  'cf-ray',
  'cf-connecting-ip',
  'cf-ew-via',
  'x-forwarded-for',
])

const BLOCKED_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  ...CLOUDFLARE_HEADERS,
])

/**
 * 复制请求头并剥离禁止透传的头。
 * @param {Headers} headers 原始请求头
 * @returns {Headers} 清洗后的请求头
 */
function forwardHeaders(headers) {
  const out = new Headers()
  for (const [key, value] of headers.entries()) {
    if (BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) continue
    out.set(key, value)
  }
  return out
}

/**
 * Pages Functions 中间件处理函数（默认导出）。
 * @param {object} context 包含 request / env / next 的上下文
 * @returns {Promise<Response>}
 */
export default async function onRequest(context) {
  const { request, env, next } = context
  const url = new URL(request.url)

  // 仅拦截 /supabase 前缀的请求；其余请求交由后续处理（站点的其他部分照常工作）
  if (!url.pathname.startsWith('/supabase')) {
    return next()
  }

  // 去掉 /supabase 前缀得到真实 Supabase 路径，查询字符串保持不变
  const targetPath = url.pathname.replace(/^\/supabase/, '') || '/'
  const base = env?.SUPABASE_URL || FALLBACK_SUPABASE_URL
  const target = base + targetPath + url.search

  const init = {
    method: request.method,
    headers: forwardHeaders(request.headers),
    redirect: 'manual',
  }

  // GET/HEAD 无 body；其余方法原样透传请求体（Workers 原生支持流式转发）
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  const upstream = await fetch(target, init)

  // 响应头同样剥离逐跳头，避免浏览器解析异常
  const responseHeaders = forwardHeaders(upstream.headers)
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

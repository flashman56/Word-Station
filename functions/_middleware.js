/**
 * Cloudflare Pages Function —— Supabase 同源代理 / 生产环境网关（根级中间件版）
 * ------------------------------------------------------------------
 * 浏览器只与本应用的 Pages 域名通信（请求 /supabase/*），本中间件在边缘节点
 * 把请求转发到真实 Supabase 项目。这样无论用户本机装了什么代理 / 分流插件，
 * 应用都不再直连 supabase.co，从根上消除 Failed to fetch 与注册/登录失败。
 *
 * 覆盖范围：auth（/supabase/auth/*）、rest（/supabase/rest/*）、
 *           functions（/supabase/functions/*，含 Edge Function generate-word）、storage。
 *
 * ⚠️ 为什么必须放在「仓库根级 functions/ 目录」且必须用「具名导出」：
 *   历史 Bug（线上 /supabase/* 全部落回静态 SPA、登录/注册失败）由两个规则共同导致：
 *   1) Cloudflare Pages 的 _middleware.js 只会对「同目录或子目录内存在实际 Pages
 *      Function 路由」的请求生效。此前该文件放在 functions/supabase/ 下、且该目录
 *      没有任何真正的路由处理文件，导致中间件从未被挂载，/supabase/* 无人接管
 *      → 静态兜底返回 index.html。
 *   2) Pages Function 处理器必须是「具名导出」(export const onRequest / export
 *      async function onRequest)。之前用 `export default` 不会被识别为处理器。
 *   例外：放在仓库根级 functions/_middleware.js 的中间件会先于「整个应用」（含静态
 *         文件）执行。因此本文件放在根级 + 具名导出，才能正确拦截 /supabase/*。
 *   —— 请勿改回子目录或默认导出，否则该 Bug 会复现。
 *
 * 配套：public/_routes.json 限定仅 /supabase/* 调用本 Function，其余静态资源不触发。
 *
 * 安全：
 *   - 不持有任何密钥；浏览器请求自带的 apikey / Authorization 头原样转发，RLS 照常生效；
 *   - 仅需在 Pages 环境变量（或 wrangler.toml [vars]）里配置 SUPABASE_URL（公开值，非密钥）。
 */
const FALLBACK_SUPABASE_URL = 'https://svnwsbkhpzejygugtorl.supabase.co'

// 逐跳（hop-by-hop）头：转发到上游时一律剥离，避免协议层冲突
const HOP_BY_HOP = new Set([
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

/**
 * 复制请求/响应头并剥离禁止透传的头。
 * @param {Headers} headers 原始头
 * @returns {Headers} 清洗后的头
 */
function cleanHeaders(headers) {
  const out = new Headers()
  for (const [k, v] of headers.entries()) {
    const key = k.toLowerCase()
    if (HOP_BY_HOP.has(key) || CLOUDFLARE_HEADERS.has(key)) continue
    out.set(k, v)
  }
  return out
}

/**
 * 具名导出：Cloudflare Pages Function 要求 onRequest 必须是具名导出（不能 export default）。
 * @param {object} context 包含 request / env / next 的上下文
 * @returns {Promise<Response>}
 */
export const onRequest = async (context) => {
  const { request, env, next } = context
  const url = new URL(request.url)

  // 只接管 /supabase/*，其余请求（静态资源、SPA）原样放行
  if (!url.pathname.startsWith('/supabase')) return next()

  // 去掉 /supabase 前缀得到真实 Supabase 路径，查询字符串保持不变
  const targetPath = url.pathname.replace(/^\/supabase/, '') || '/'
  const base = env?.SUPABASE_URL || FALLBACK_SUPABASE_URL
  const target = base + targetPath + url.search

  const init = {
    method: request.method,
    headers: cleanHeaders(request.headers),
    redirect: 'manual',
  }

  // GET/HEAD 无 body；其余方法原样透传请求体（Workers 原生支持流式转发）
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  const upstream = await fetch(target, init)

  // 响应头同样剥离逐跳头，避免浏览器解析异常
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: cleanHeaders(upstream.headers),
  })
}

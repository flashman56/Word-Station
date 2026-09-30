/**
 * Supabase 客户端单例
 * ------------------------------------------------------------------
 * - 只持有公开信息（URL + publishable/anon key），安全性由 RLS 保证；
 * - 配置规则：若构建环境注入了 VITE_SUPABASE_*，则以环境变量为准；
 *   否则回退到下面内置的「公开兜底配置」，指向生产 Supabase 项目——
 *   因此应用在任何构建环境下都视为「已配置 Supabase」，线上登录/注册始终可用
 *   （即便 Cloudflare Pages 忘了配环境变量也不会退回本地模式）。
 * - DEEPSEEK_API_KEY / SUPABASE_SERVICE_ROLE_KEY 严禁出现在本文件及任何 VITE_ 变量里。
 */
import { createClient } from '@supabase/supabase-js'

// 公开兜底配置：publishable key + 项目 URL，本就设计为可在浏览器暴露（安全性由 RLS 保证）。
// 这样即便构建环境没有注入 VITE_SUPABASE_*（例如 Cloudflare Pages 忘了配环境变量），
// 线上也能连上 Supabase；若显式配置了环境变量，则以环境变量为准。
// 注意：必须用 || 而非 ??，因为未注入时构建期得到的是空字符串（''），?? 不会触发兜底。
const FALLBACK_SUPABASE_URL = 'https://svnwsbkhpzejygugtorl.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_6fm_XDqCS4BWwyqEeOb_BA_YODx2ghg'

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim()
const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY).trim()

/**
 * 浏览器内一律走同源 `/supabase` 代理（开发=Vite 中间件，生产=Cloudflare Pages Function），
 * 浏览器全程只与本应用自己的域名通信——不受任何本机/浏览器代理与分流插件影响，
 * 从根上消除注册/登录时的 Failed to fetch。Node 侧或非浏览器环境回退到直连。
 */
const CLIENT_URL =
  SUPABASE_URL && typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`
    : SUPABASE_URL

/** 是否已配置 Supabase（未配置则全应用走本地模式） */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Supabase 客户端；未配置时为 null。
 * 组件层禁止直接使用它，一律走 src/lib/cloud/*.js。
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase = hasSupabase
  ? createClient(CLIENT_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * 取当前 access_token（供 functions.invoke 之外的场景使用）。
 * @returns {Promise<string|null>}
 */
export async function getAccessToken() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token ?? null
  } catch {
    return null
  }
}

/**
 * 取当前用户 id。
 * @returns {Promise<string|null>}
 */
export async function getUserId() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id ?? null
  } catch {
    return null
  }
}

/**
 * 统一错误归一化：把 supabase 的 { data, error } 收敛成 { data, error }，
 * error 一定是 { code, message } 形状（便于组件直接展示）。
 * @param {{data: any, error: any}} res
 * @param {string} [fallbackCode]
 * @returns {{data: any, error: {code: string, message: string}|null}}
 */
export function normalize(res, fallbackCode = 'INTERNAL') {
  if (!res || !res.error) return { data: res?.data ?? null, error: null }
  const e = res.error
  return {
    data: null,
    error: {
      code: e.code || fallbackCode,
      message: e.message || '未知错误',
    },
  }
}

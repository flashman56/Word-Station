/**
 * Supabase 客户端单例
 * ------------------------------------------------------------------
 * - 只持有公开信息（URL + anon key），安全性由 RLS 保证；
 * - 未配置环境变量时降级为 null，应用进入「纯本地游客模式」，不发任何网络请求；
 * - DEEPSEEK_API_KEY 严禁出现在本文件及任何 VITE_ 变量里。
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL ?? '').trim()
const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '').trim()

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

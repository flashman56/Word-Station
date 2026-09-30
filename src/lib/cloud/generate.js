/**
 * 调生词生成服务（Edge Function `generate-word`）
 * ------------------------------------------------------------------
 * 生产：supabase.functions.invoke（走 https://<ref>.supabase.co/functions/v1/generate-word）
 * 开发：POST 到同源 /functions/v1/generate-word，由 vite.config.js 里的 dev 中间件接管
 *       （Supabase CLI 部署需登录，dev 中间件保证本地立刻能端到端跑通）。
 *
 * 两条红线：
 *   - 音标不在这里产生（服务端查表，本文件原样透传）；
 *   - 单批最多 20 词，前端不做并发（一次一个请求）。
 */
import { getAccessToken, supabase } from '../supabase.js'

const MAX_BATCH = 20
const DEV_ENDPOINT = '/functions/v1/generate-word'

/** 是否是 vite dev（走本地中间件） */
const IS_DEV = Boolean(import.meta.env?.DEV)

async function postDev(body) {
  const token = await getAccessToken()
  const res = await fetch(DEV_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  if (!res.ok) {
    const code = json?.error?.code || (res.status === 401 ? 'UNAUTHORIZED' : res.status === 402 ? 'QUOTA_EXCEEDED' : 'INTERNAL')
    const message = json?.error?.message || `HTTP ${res.status}`
    return { data: null, error: { code, message } }
  }
  return { data: json, error: null }
}

/**
 * 批量生成（一次请求最多 20 词）。
 *
 * @param {string[]} forms 待生成词形
 * @param {string|null} stationId 传了则生成成功后自动加入该小站
 * @param {(p: {phase: string, done: number, total: number, text: string}) => void} [onProgress]
 * @returns {Promise<{data: {results: object[], quota?: object}|null, error: {code: string, message: string}|null}>}
 */
export async function generate(forms, stationId = null, onProgress = null) {
  const list = [...new Set((forms || []).map((f) => String(f ?? '').trim()).filter(Boolean))]
  if (list.length === 0) return { data: { results: [] }, error: null }
  if (list.length > MAX_BATCH) {
    return { data: null, error: { code: 'BAD_REQUEST', message: `单批最多 ${MAX_BATCH} 词（当前 ${list.length}）` } }
  }
  if (!supabase && !IS_DEV) {
    return { data: null, error: { code: 'NO_SUPABASE', message: '未配置 Supabase，无法生成' } }
  }

  const report = (p) => {
    if (onProgress) onProgress(p)
  }
  report({ phase: 'generate', done: 0, total: list.length, text: `提交 ${list.length} 个词到生成服务…` })

  const body = { forms: list, stationId: stationId || null }

  let out
  if (IS_DEV) {
    out = await postDev(body)
  } else {
    const { data, error } = await supabase.functions.invoke('generate-word', { body })
    if (error) {
      out = { data: null, error: { code: error.code || 'INTERNAL', message: error.message || '生成服务调用失败' } }
    } else {
      out = { data, error: null }
    }
  }

  if (out.error) {
    report({ phase: 'generate', done: 0, total: list.length, text: `生成失败：${out.error.message}` })
    return out
  }
  const results = out.data?.results || []
  report({
    phase: 'generate',
    done: results.length,
    total: list.length,
    text: `生成完成（成功 ${results.filter((r) => r.status === 'generated' || r.status === 'public_hit').length}）`,
  })
  return { data: { results, quota: out.data?.quota || null }, error: null }
}

/**
 * 单个词重试（本质是批量接口的单元素调用）。
 * @param {string} form
 * @param {string|null} stationId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function retry(form, stationId = null) {
  const { data, error } = await generate([form], stationId)
  if (error) return { data: null, error }
  return { data: data?.results?.[0] ?? null, error: null }
}

/**
 * Supabase Edge Function：generate-word
 * ------------------------------------------------------------------
 * 职责（设计 §5.1）：
 *   ① 校验 JWT → uid（绝不信任 body 里的 owner_id）
 *   ② 查 dict_cache：公共库命中？音标查表？跨用户生成缓存？
 *   ③ 未命中才调 DeepSeek（持 DEEPSEEK_API_KEY），先原子扣配额
 *   ④ 校验模型产出（丢弃任何音标字段）
 *   ⑤ service_role 回写 user_words / station_words + 写回 dict_cache
 *
 * 部署：
 *   supabase secrets set DEEPSEEK_API_KEY=sk-...
 *   supabase functions deploy generate-word
 *
 * 本地未部署 CLI 时，vite dev 用 scripts/dev-generate-plugin.mjs 接管同一路径，
 * 复用 ./prompt.js 的 prompt 与校验，契约与本函数完全一致。
 */
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import {
  DEFAULT_MODEL,
  MAX_BATCH,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildUserPrompt,
  candidateMorphIds,
  extractJson,
  sanitizeItem,
  validateGenItem,
} from './prompt.js'
// @ts-ignore - Deno 侧按需解析（Supabase 会内联打包本地文件）
import morphemesRaw from '../../../src/data/morphemes.js'

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const morphemes: any[] = Array.isArray(morphemesRaw) ? (morphemesRaw as any[]) : []

// 校验候选集 = 全部词素 id（prompt 里的候选集只用于约束模型，不用于判合法）
const ALL_MORPH_IDS: Set<string> = new Set([...morphemes.map((m: any) => m.id), 'x.unk'])

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function fail(status: number, code: string, message: string, extra: Record<string, unknown> = {}): Response {
  return json({ error: { code, message }, ...extra }, status)
}

function formKeyOf(form: string): string {
  return String(form ?? '').trim().toLowerCase()
}

async function callDeepSeek(items: unknown[], apiKey: string): Promise<any> {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(items as any) },
      ],
      temperature: 0.4,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  const data = await res.json()
  return extractJson(data?.choices?.[0]?.message?.content ?? '')
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail(405, 'BAD_REQUEST', '仅支持 POST')

  // ---------------------------------------------------------------- 鉴权
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return fail(401, 'UNAUTHORIZED', '缺少 access token')

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const { data: userData, error: userErr } = await anon.auth.getUser(token)
  if (userErr || !userData?.user?.id) return fail(401, 'UNAUTHORIZED', 'token 无效或已过期')
  const uid = userData.user.id
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // ---------------------------------------------------------------- 入参
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return fail(400, 'BAD_REQUEST', '请求体不是合法 JSON')
  }
  const rawForms = Array.isArray(body?.forms) ? body.forms : []
  const forms: string[] = [...new Set(rawForms.map((f: unknown) => String(f ?? '').trim()).filter(Boolean))]
  if (forms.length === 0) return fail(400, 'BAD_REQUEST', 'forms 为空')
  if (forms.length > MAX_BATCH) return fail(400, 'BAD_REQUEST', `单批最多 ${MAX_BATCH} 词`)
  if (forms.some((f) => f.length > 64)) return fail(400, 'BAD_REQUEST', '单词长度不能超过 64 字符')
  const stationId: string | null = typeof body?.stationId === 'string' && body.stationId ? body.stationId : null

  const results: any[] = []
  const toGenerate: Array<{ form: string; fk: string }> = []

  // ---------------------------------------------------------------- ① 查 dict_cache
  const keys = forms.map(formKeyOf)
  const { data: cacheRows } = await admin
    .from('dict_cache')
    .select('form_key,word_id,phonetic,payload,prompt_version')
    .in('form_key', keys)

  const cacheByKey = new Map<string, any>()
  ;(cacheRows || []).forEach((r: any) => cacheByKey.set(r.form_key, r))

  for (const form of forms) {
    const fk = formKeyOf(form)
    const row = cacheByKey.get(fk)
    // 公共库命中：不生成、不消耗配额
    if (row && row.word_id) {
      results.push({ form, status: 'public_hit', wordKey: row.word_id, wordId: row.word_id })
      continue
    }
    // 跨用户生成缓存命中
    if (row && row.payload && row.prompt_version === PROMPT_VERSION) {
      results.push({ form, status: 'generated', cached: true, wordKey: `u.${fk}`, payload: row.payload, phonetic: row.phonetic })
      continue
    }
    toGenerate.push({ form, fk })
  }

  // ---------------------------------------------------------------- ② 配额 + 生成
  let quota: any = null
  if (toGenerate.length > 0) {
    if (!deepseekKey) {
      toGenerate.forEach((g) => results.push({ form: g.form, status: 'failed', code: 'INTERNAL', message: '服务端未配置 DEEPSEEK_API_KEY' }))
    } else {
      const { data: quotaRow, error: quotaErr } = await admin.rpc('consume_generation_quota', { n: toGenerate.length })
      const q = Array.isArray(quotaRow) ? quotaRow[0] : quotaRow
      quota = q ? { used: q.used, quota: q.quota, day: new Date().toISOString().slice(0, 10) } : null
      if (!quotaErr && q && q.allowed === false) {
        toGenerate.forEach((g) =>
          results.push({ form: g.form, status: 'failed', code: 'QUOTA_EXCEEDED', message: `今日 ${q.quota} 次生成已用完，明日 0 点重置` }),
        )
      } else {
        const batch = toGenerate.map((g) => ({ form: g.form, candidates: candidateMorphIds(g.form, morphemes) }))
        let parsed: any = null
        let upstreamError: any = null
        try {
          parsed = await callDeepSeek(batch, deepseekKey)
        } catch (e) {
          upstreamError = e
        }
        if (!parsed || !Array.isArray(parsed.items)) {
          toGenerate.forEach((g) =>
            results.push({
              form: g.form,
              status: 'failed',
              code: upstreamError?.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
              message: upstreamError ? String(upstreamError.message).slice(0, 200) : '模型返回无法解析',
            }),
          )
        } else {
          const byForm = new Map<string, any>()
          parsed.items.forEach((it: any) => {
            if (it && typeof it.form === 'string') byForm.set(String(it.form).trim().toLowerCase(), sanitizeItem(it))
          })
          for (const g of toGenerate) {
            const raw = byForm.get(g.form.toLowerCase())
            if (!raw) {
              results.push({ form: g.form, status: 'failed', code: 'VALIDATION_FAILED', message: '模型未返回该词' })
              continue
            }
            const check = validateGenItem(raw, ALL_MORPH_IDS)
            if (!check.ok) {
              results.push({ form: g.form, status: 'failed', code: 'VALIDATION_FAILED', message: check.errors.slice(0, 2).join('；') })
              continue
            }
            results.push({
              form: g.form,
              status: 'generated',
              cached: false,
              wordKey: `u.${g.fk}`,
              payload: check.item,
              // 音标红线：只取 dict_cache 查表结果，模型产出里的音标已丢弃
              phonetic: cacheByKey.get(g.fk)?.phonetic ?? null,
            })
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------- ③ 回写 user_words / station_words
  for (const r of results) {
    if (r.status !== 'generated' || !r.payload) continue
    const payload = r.payload
    const fk = formKeyOf(r.form)
    const row = {
      owner_id: uid,
      form: r.form,
      form_key: fk,
      word_key: `u.${fk}`,
      pos: r.payload.pos,
      gloss: r.payload.gloss,
      // 红线：phonetic_br 只来自查表；查不到 → pending（UI 显示「音标待补」）
      phonetic_br: r.phonetic || null,
      phonetic_status: r.phonetic ? 'ok' : 'pending',
      example: r.payload.example,
      usage: r.payload.usage || null,
      cefr: r.payload.cefr,
      freq_rank: null,
      morphs: r.payload.morphs,
      chain: r.payload.chain,
      source: 'ai',
      edited_by_user: false,
      generation_status: 'ready',
      gen_error: null,
      updated_at: new Date().toISOString(),
    }
    const { data: uw, error: uwErr } = await admin
      .from('user_words')
      .upsert(row, { onConflict: 'owner_id,form_key' })
      .select()
      .single()

    if (uwErr) {
      r.status = 'failed'
      r.code = 'INTERNAL'
      r.message = `入库失败：${uwErr.message}`
      delete r.payload
      continue
    }
    r.userWord = {
      id: uw.id,
      wordKey: uw.word_key,
      form: uw.form,
      pos: uw.pos,
      gloss: uw.gloss,
      phoneticBr: uw.phonetic_br,
      phoneticStatus: uw.phonetic_status,
      example: uw.example,
      usage: uw.usage,
      cefr: uw.cefr,
      freqRank: uw.freq_rank,
      morphs: uw.morphs || [],
      chain: uw.chain || [],
      source: uw.source,
      editedByUser: Boolean(uw.edited_by_user),
      generationStatus: uw.generation_status,
    }
    delete r.payload

    if (stationId) {
      await admin.from('station_words').upsert(
        { station_id: stationId, owner_id: uid, word_key: uw.word_key, source: 'user', updated_at: new Date().toISOString() },
        { onConflict: 'station_id,word_key', ignoreDuplicates: true },
      )
    }
    // 写回跨用户生成缓存（只存词条本身，不含任何用户数据）
    await admin.from('dict_cache').upsert(
      {
        form_key: fk,
        word_id: null,
        payload,
        model: DEFAULT_MODEL,
        prompt_version: PROMPT_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'form_key' },
    )
  }

  // ---------------------------------------------------------------- ④ 取最新配额
  const today = new Date().toISOString().slice(0, 10)
  const { data: quotaNow } = await admin
    .from('generation_usage')
    .select('used,quota')
    .eq('owner_id', uid)
    .eq('day', today)
    .maybeSingle()

  return json({ results, quota: quota || (quotaNow ? { ...quotaNow, day: today } : null) })
})

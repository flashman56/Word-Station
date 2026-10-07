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
 *   node scripts/deploy-generate-fn.mjs --use-api
 *   （--use-api 必加：本文件 import 了 supabase/ 之外的 ../../../src/data/morphemes.js，
 *     默认 Docker 打包只上传 supabase/ 目录，会 400 Module not found → BOOT_ERROR。
 *     详见 docs/DEPLOY-EDGE-FUNCTION.md §2）
 *
 * 本地未部署 CLI 时，vite dev 用 scripts/dev-generate-plugin.mjs 接管同一路径，
 * 复用 ./prompt.js 的 prompt 与校验，契约与本函数完全一致。
 *
 * =============================================================================
 * ★★★ 红线一：service_role 不得用于「本应由 RLS 按 owner_id 保护」的写入 ★★★
 * =============================================================================
 *   service_role **绕过 RLS**（本项目铁证：dict_cache 按设计零策略，
 *   但 service_role 依然能全表读出 64559 行）。因此对受 owner_id 保护的表，
 *   RLS 在 service_role 通道上形同虚设，「数据库会挡住」是错的假设。
 *
 *   【本次真实事故】写 station_words 用的是 service_role 客户端，而 stations 的
 *   RLS 策略是 owner_id = auth.uid()（对 service_role 不生效），代码又从不校验
 *   stationId 归属 ⇒ 调用方可以传**任意他人的 stationId**，把词条写进别人的小站。
 *   这不是「静默失败」，是越权写入。
 *   修法：插入前应用层核对 stations.id = stationId AND owner_id = uid，
 *        不匹配则 STATION_FORBIDDEN 且不写库。
 *
 *   ⇒ 新增任何 admin.from(<受 owner_id 保护的表>).insert/upsert 时，
 *     必须先在应用层显式校验归属，不许指望 RLS 兜底。
 *
 * =============================================================================
 * ★★★ 红线二：配额检查必须 fail closed ★★★
 * =============================================================================
 *   consume_generation_quota 内部靠 auth.uid() 推导身份，
 *   必须用**带用户 Authorization 的客户端**（见下方 anonAsUser）调用。
 *
 *   【本次真实事故】曾用 service_role 调它 → JWT 无 sub → auth.uid() 为 NULL →
 *   RPC 第一行 raise 'not authenticated'。而旧判定
 *   `if (!quotaErr && q && q.allowed === false)` 把 error 当成「没超限」→
 *   直接进生成分支 ⇒ 日配额 50 次在生产完全失效，任何登录用户可无限烧额度。
 *
 *   ⇒ 把「校验失败」等同于「无限额」是危险默认值：今后任何一次 RPC 抖动、
 *     函数被误删、权限变更、DB 超时，都会再次变成静默放行烧钱。
 *     宁可拒绝生成（用户看到明确报错、可重试），也不能在不确定状态下放行。
 *   ⇒ 三态必须显式区分，不许用 && 短路合并：
 *       quotaErr → QUOTA_CHECK_FAILED / allowed===false → QUOTA_EXCEEDED / else → 生成
 *
 *   ⇒ 同样**绝不能**给 RPC 加 p_uid 参数来「修」这个问题：
 *     那会把身份从「令牌推导」变成「调用方指定」，任何人传别人的 uid 就能烧别人的额度。
 *     身份必须永远由 JWT 推导。
 *
 *   ⇒ scripts/dev-generate-plugin.mjs 必须与本文件保持同构，否则本地跑不出
 *     QUOTA_EXCEEDED，会误导后续判断。
 *
 * =============================================================================
 * ★ 音标红线（既有）★
 * =============================================================================
 *   phonetic_br 只来自 dict_cache 查表；模型产出的音标字段一律丢弃。
 *   查不到 → phonetic_status = 'pending'，UI 显示「音标待补」。
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

  // 「以用户身份」客户端：只用于调那些靠 auth.uid() 推导身份的 RPC。
  // 全局挂上进来的 Authorization，PostgREST 才会把它解成 request.jwt.claims，
  // RPC 内部的 auth.uid() 才有值。
  //
  // ⚠️ 为什么绝不能改用 service_role（admin）调，也绝不能给 RPC 加 p_uid 参数：
  //   consume_generation_quota 内部第一行就是 `uid := auth.uid(); if uid is null then raise`。
  //   service_role 的 JWT 没有 sub → auth.uid() 为 NULL → 必然抛 'not authenticated'。
  //   而如果改成「调用方传 uid」，配额身份就从「令牌推导」变成「调用方指定」，
  //   任何人传别人的 uid 就能烧别人的额度 —— 这是更严重的安全问题。
  //   身份必须始终由 JWT 推导。
  const anonAsUser = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  })

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
      // 配额必须 fail closed（这是本次修复的核心，理由见下）
      //
      // 【真实事故】原先这里用 service_role 客户端调 consume_generation_quota，
      // 而该 RPC 内部靠 auth.uid() 取身份：service_role 的 JWT 没有 sub →
      // auth.uid() 为 NULL → RPC 第一行 raise 'not authenticated'。
      // 老代码写的是 `if (!quotaErr && q && q.allowed === false)`，
      // 于是 quotaErr 为真时被当成「没超限」→ 直接进生成分支 →
      // 线上日配额 50 次的限制完全失效，任何登录用户可无限烧 DeepSeek 额度。
      //
      // 【为什么必须 fail closed】把「校验失败」等同于「无限额」是危险的默认值：
      // 今后任何一次 RPC 抖动、函数被误删、权限变更、数据库超时，
      // 都会再次变成「静默放行烧钱」。宁可拒绝生成（用户看到明确报错、可重试），
      // 也不能在不确定状态下放行。因此三种情况必须显式区分，不许用 && 短路合并。
      const { data: quotaRow, error: quotaErr } = await anonAsUser.rpc('consume_generation_quota', { n: toGenerate.length })
      const q = Array.isArray(quotaRow) ? quotaRow[0] : quotaRow
      quota = q ? { used: q.used, quota: q.quota, day: new Date().toISOString().slice(0, 10) } : null
      if (quotaErr) {
        // 配额校验失败 → 拒绝生成（绝不 fall through 到生成分支）
        console.error('consume_generation_quota failed:', quotaErr.message)
        toGenerate.forEach((g) =>
          results.push({ form: g.form, status: 'failed', code: 'QUOTA_CHECK_FAILED', message: '配额校验失败，请稍后重试' }),
        )
      } else if (q && q.allowed === false) {
        // 真正的配额用尽
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
      // ⚠️ 为什么这里必须显式校验归属：
      //   写入用的是 service_role 客户端，它**绕过 RLS**（本项目 dict_cache 零策略仍可被
      //   service_role 全表读取即为证据）。而 stations 的 RLS 策略是
      //   `owner_id = auth.uid()`，对 service_role 不生效。
      //   因此若只靠数据库兜底，调用方可以传任意他人的 stationId，
      //   把词条塞进别人的小站（越权写入）。这里必须自己在应用层核对。
      const { data: owned } = await admin
        .from('stations')
        .select('id')
        .eq('id', stationId)
        .eq('owner_id', uid)
        .maybeSingle()

      if (!owned) {
        // 不属于该用户：明确回报，不静默吞掉
        r.stationAdded = false
        r.stationAddCode = 'STATION_FORBIDDEN'
        r.stationAddMessage = '小站不存在或不属于当前用户，词条已保存到个人词库但未加入小站'
      } else {
        const { error: swErr } = await admin.from('station_words').upsert(
          { station_id: stationId, owner_id: uid, word_key: uw.word_key, source: 'user', updated_at: new Date().toISOString() },
          { onConflict: 'station_id,word_key', ignoreDuplicates: true },
        )
        // 旧代码丢弃了这里的 error，导致「词生成了但没进小站」完全无感知（外键失败即静默）
        if (swErr) {
          console.error('station_words upsert failed:', swErr.message)
          r.stationAdded = false
          r.stationAddCode = 'STATION_WRITE_FAILED'
          r.stationAddMessage = `词条已保存到个人词库，但加入小站失败：${swErr.message.slice(0, 120)}`
        } else {
          r.stationAdded = true
        }
      }
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

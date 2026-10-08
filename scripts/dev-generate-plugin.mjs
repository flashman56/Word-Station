/**
 * dev-only：本地模拟 Supabase Edge Function `generate-word`
 * ------------------------------------------------------------------
 * 为什么需要它：Supabase CLI 部署需要登录（短期不可用），但前端要立刻能端到端联调。
 * 本中间件在 `vite dev` 里挂一个 `/functions/v1/generate-word`，
 * **复用 supabase/functions/generate-word/prompt.js 的同一份 prompt 与校验逻辑**，
 * 契约与真 Edge Function 完全一致，上线后前端只需切回 functions.invoke 即可。
 *
 * 红线：
 *   - 音标只查表（本地 src/data/phonetics.js / DB dict_cache.phonetic），模型产出里的音标一律丢弃；
 *   - DeepSeek key 只在 Node 侧（.env / .env.local 的非 VITE_ 变量），永不下发前端。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
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
} from '../supabase/functions/generate-word/prompt.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const LOCAL_CACHE_FILE = resolve(ROOT, 'scripts/.dev-gen-cache.json')
const LOCAL_QUOTA_FILE = resolve(ROOT, 'scripts/.dev-gen-quota.json')
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const DAILY_QUOTA = 50

/** 懒加载的公共词库 / 音标库 / 词素表（28MB，只在第一次请求时读） */
let dictPromise = null
async function loadDict() {
  if (!dictPromise) {
    dictPromise = (async () => {
      const [{ words, phonetics }, { default: morphemes }] = await Promise.all([
        import('../src/data/index.js'),
        import('../src/data/morphemes.js'),
      ])
      const bySlug = new Map()
      words.forEach((w) => {
        const slug = String(w.form ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
        if (slug && !bySlug.has(slug)) bySlug.set(slug, w)
      })
      return { words, phonetics, morphemes, bySlug }
    })()
  }
  return dictPromise
}

function readJsonFile(file, fallback) {
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback
  } catch {
    return fallback
  }
}

function writeJsonFile(file, value) {
  try {
    writeFileSync(file, JSON.stringify(value), 'utf8')
  } catch {
    /* ignore */
  }
}

function slugOf(form) {
  return String(form ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function formKeyOf(form) {
  return String(form ?? '').trim().toLowerCase()
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 1e6) {
        fail(new Error('请求体过大'))
        req.destroy()
      }
    })
    req.on('end', () => ok(raw))
    req.on('error', fail)
  })
}

/**
 * 调 DeepSeek 批量生成。
 * @param {Array<object>} items [{form, pos, gloss, candidates}]
 * @param {string} apiKey
 * @returns {Promise<object|null>}
 */
async function callDeepSeek(items, apiKey) {
  if (!apiKey) throw new Error('缺少 DEEPSEEK_API_KEY（请写入 .env 或 .env.local）')
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(items) },
      ],
      temperature: 0.4,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`DeepSeek ${res.status}: ${text.slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content ?? ''
  return extractJson(content)
}

/**
 * 本地配额（DB 不可用时兜底）；与线上 consume_generation_quota 语义一致。
 * @param {string} uid
 * @param {number} n
 * @returns {{used: number, quota: number, allowed: boolean}}
 */
function consumeLocalQuota(uid, n) {
  const today = new Date().toISOString().slice(0, 10)
  const all = readJsonFile(LOCAL_QUOTA_FILE, {})
  const cur = all[uid] && all[uid].day === today ? all[uid] : { day: today, used: 0 }
  if (cur.used + n > DAILY_QUOTA) {
    all[uid] = cur
    writeJsonFile(LOCAL_QUOTA_FILE, all)
    return { used: cur.used, quota: DAILY_QUOTA, allowed: false }
  }
  cur.used += n
  all[uid] = cur
  writeJsonFile(LOCAL_QUOTA_FILE, all)
  return { used: cur.used, quota: DAILY_QUOTA, allowed: true }
}

function currentQuota(uid) {
  const today = new Date().toISOString().slice(0, 10)
  const all = readJsonFile(LOCAL_QUOTA_FILE, {})
  const cur = all[uid] && all[uid].day === today ? all[uid] : { day: today, used: 0 }
  return { used: cur.used, quota: DAILY_QUOTA, day: today }
}

/**
 * @param {{deepseekKey?: string, supabaseUrl?: string, anonKey?: string, serviceKey?: string}} options
 * @returns {import('vite').Plugin}
 */
export default function devGeneratePlugin(options = {}) {
  const {
    deepseekKey = '',
    supabaseUrl = '',
    anonKey = '',
    serviceKey = '',
  } = options

  /** @type {import('@supabase/supabase-js').SupabaseClient | null} */
  let admin = null
  /** @type {import('@supabase/supabase-js').SupabaseClient | null} */
  let anon = null

  const dbReady = () => Boolean(supabaseUrl && serviceKey)

  if (supabaseUrl && serviceKey) {
    admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  if (supabaseUrl && anonKey) {
    anon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return {
    name: 'dev-generate-word',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/functions/v1/generate-word', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { error: { code: 'BAD_REQUEST', message: '仅支持 POST' } })

        let body
        try {
          body = JSON.parse((await readBody(req)) || '{}')
        } catch {
          return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: '请求体不是合法 JSON' } })
        }

        // ---------------------------------------------------------------- 鉴权
        const authHeader = String(req.headers.authorization || '')
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return sendJson(res, 401, { error: { code: 'UNAUTHORIZED', message: '缺少 access token' } })

        let uid = null
        if (anon) {
          try {
            const { data, error } = await anon.auth.getUser(token)
            if (!error && data?.user?.id) uid = data.user.id
          } catch {
            uid = null
          }
        }
        if (!uid) {
          return sendJson(res, 401, { error: { code: 'UNAUTHORIZED', message: 'token 无效或已过期' } })
        }

        // ---------------------------------------------------------------- 入参校验
        const rawForms = Array.isArray(body.forms) ? body.forms : []
        const forms = [...new Set(rawForms.map((f) => String(f ?? '').trim()).filter(Boolean))]
        if (forms.length === 0) {
          return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'forms 为空' } })
        }
        if (forms.length > MAX_BATCH) {
          return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: `单批最多 ${MAX_BATCH} 词` } })
        }
        if (forms.some((f) => f.length > 64)) {
          return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: '单词长度不能超过 64 字符' } })
        }
        const stationId = typeof body.stationId === 'string' && body.stationId ? body.stationId : null

        // ---------------------------------------------------------------- 加载词库
        const dict = await loadDict()
        // 校验候选集 = 全部词素 id（prompt 候选集只用于约束模型，不用于判合法）
        const allMorphIds = new Set(dict.morphemes.map((m) => m.id))
        allMorphIds.add('x.unk')
        const cache = readJsonFile(LOCAL_CACHE_FILE, {})

        const results = []
        const toGenerate = []
        // 配额校验是否已因 RPC 失败而 fail closed（已逐条写入 QUOTA_CHECK_FAILED）
        let quotaCheckFailed = false

        for (const form of forms) {
          const slug = slugOf(form)
          // ① 公共库命中 → 不生成、不消耗配额
          const pub = slug ? dict.bySlug.get(slug) : null
          if (pub) {
            results.push({
              form,
              status: 'public_hit',
              wordKey: pub.id,
              wordId: pub.id,
            })
            continue
          }

          const fk = formKeyOf(form)
          // ② 跨用户缓存命中（本地文件缓存优先，DB dict_cache 次之）
          const cached = cache[fk]
          if (cached && cached.promptVersion === PROMPT_VERSION) {
            results.push({ form, status: 'generated', cached: true, wordKey: `u.${fk}`, userWord: null, payload: cached.payload })
            continue
          }
          let dbCached = null
          if (dbReady()) {
            try {
              const { data } = await admin
                .from('dict_cache')
                .select('payload,prompt_version,phonetic')
                .eq('form_key', fk)
                .maybeSingle()
              if (data && data.prompt_version === PROMPT_VERSION && data.payload) {
                dbCached = { payload: data.payload, phonetic: data.phonetic }
              }
            } catch {
              dbCached = null
            }
          }
          if (dbCached) {
            cache[fk] = { promptVersion: PROMPT_VERSION, payload: dbCached.payload }
            results.push({ form, status: 'generated', cached: true, wordKey: `u.${fk}`, userWord: null, payload: dbCached.payload })
            continue
          }

          toGenerate.push({ form, fk, slug })
        }

        // ---------------------------------------------------------------- 生成
        if (toGenerate.length > 0) {
          let quota = currentQuota(uid)
          let allowed = true
          // 「以用户身份」客户端：与线上 index.ts 同构，只用于调靠 auth.uid() 推导身份的 RPC。
          // 全局挂上进来的 Authorization，PostgREST 才会把它解成 request.jwt.claims。
          // ⚠️ 绝不能改用 admin（service_role）调，也绝不能给 RPC 加显式 uid 参数：
          //    service_role 的 JWT 没有 sub → auth.uid() 为 NULL → RPC 第一行 raise；
          //    而「调用方传 uid」会把身份从「令牌推导」变成「调用方指定」，可烧他人额度。
          const anonAsUser =
            supabaseUrl && anonKey
              ? createClient(supabaseUrl, anonKey, {
                  auth: { persistSession: false, autoRefreshToken: false },
                  global: { headers: { Authorization: authHeader } },
                })
              : null

          if (anonAsUser && dbReady()) {
            try {
              const { data, error } = await anonAsUser.rpc('consume_generation_quota', { n: toGenerate.length })
              const row = Array.isArray(data) ? data[0] : data
              // 配额必须 fail closed：校验失败 ≠ 无限额。
              // 【真实事故】原代码用 admin(service_role) 调这个 RPC，auth.uid() 为 NULL →
              // 必然抛 'not authenticated'；而旧判定把 error 当成「没超限」直接放行生成，
              // 于是本地/线上日配额完全失效，任何人可无限烧 DeepSeek 额度。
              // 现在 error 一律拒绝生成，绝不 fall through。
              if (error) {
                console.error('[dev] consume_generation_quota failed:', error.message)
                toGenerate.forEach((g) => {
                  results.push({
                    form: g.form,
                    status: 'failed',
                    code: 'QUOTA_CHECK_FAILED',
                    message: '配额校验失败，请稍后重试',
                  })
                })
                quota = currentQuota(uid)
                allowed = false
                quotaCheckFailed = true
              } else {
                if (row) quota = { used: row.used, quota: row.quota, day: new Date().toISOString().slice(0, 10), allowed: row.allowed }
                allowed = row ? Boolean(row.allowed) : true
              }
            } catch (e) {
              // 网络/异常同样 fail closed
              console.error('[dev] consume_generation_quota threw:', e && e.message)
              toGenerate.forEach((g) => {
                results.push({
                  form: g.form,
                  status: 'failed',
                  code: 'QUOTA_CHECK_FAILED',
                  message: '配额校验失败，请稍后重试',
                })
              })
              quota = currentQuota(uid)
              allowed = false
              quotaCheckFailed = true
            }
          } else {
            // DB 不可用 → 纯本地配额（本地开发兜底，不涉及线上烧钱）
            const local = consumeLocalQuota(uid, toGenerate.length)
            quota = { ...local, day: new Date().toISOString().slice(0, 10) }
            allowed = local.allowed
          }

          if (quotaCheckFailed) {
            // 已在上面逐条写入 QUOTA_CHECK_FAILED，不再走下面的分支
          } else if (!allowed) {
            toGenerate.forEach((g) => {
              results.push({
                form: g.form,
                status: 'failed',
                code: 'QUOTA_EXCEEDED',
                message: `今日 ${quota.quota} 次生成已用完，明日 0 点重置`,
              })
            })
          } else {
            const batchItems = toGenerate.map((g) => ({
              form: g.form,
              candidates: candidateMorphIds(g.form, dict.morphemes),
            }))
            let parsed = null
            let upstreamError = null
            try {
              parsed = await callDeepSeek(batchItems, deepseekKey)
            } catch (e) {
              upstreamError = e
            }

            if (!parsed || !Array.isArray(parsed.items)) {
              toGenerate.forEach((g) => {
                results.push({
                  form: g.form,
                  status: 'failed',
                  code: upstreamError && upstreamError.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
                  message: upstreamError ? upstreamError.message.slice(0, 200) : '模型返回无法解析',
                })
              })
            } else {
              const byForm = new Map()
              parsed.items.forEach((it) => {
                if (it && typeof it.form === 'string') {
                  byForm.set(String(it.form).trim().toLowerCase(), sanitizeItem(it))
                }
              })

              for (const g of toGenerate) {
                const raw = byForm.get(g.form.toLowerCase())
                if (!raw) {
                  results.push({ form: g.form, status: 'failed', code: 'VALIDATION_FAILED', message: '模型未返回该词' })
                  continue
                }
                const check = validateGenItem(raw, allMorphIds)
                if (!check.ok) {
                  results.push({
                    form: g.form,
                    status: 'failed',
                    code: 'VALIDATION_FAILED',
                    message: check.errors.slice(0, 2).join('；'),
                  })
                  continue
                }
                const payload = check.item
                cache[g.fk] = { promptVersion: PROMPT_VERSION, payload }
                results.push({ form: g.form, status: 'generated', cached: false, wordKey: `u.${g.fk}`, userWord: null, payload })
              }
            }
          }
          writeJsonFile(LOCAL_CACHE_FILE, cache)
        }

        // ---------------------------------------------------------------- 回写 DB
        const finalQuota = currentQuota(uid)
        if (dbReady()) {
          const okResults = results.filter((r) => r.status === 'generated' && r.payload)
          for (const r of okResults) {
            const fk = formKeyOf(r.form)
            // 音标红线：只查表，绝不取模型产出
            const phoneticEntry = dict.phonetics[String(r.form).toLowerCase()]
            let phonetic = phoneticEntry && typeof phoneticEntry.p === 'string' ? phoneticEntry.p : null
            if (!phonetic) {
              try {
                const { data } = await admin.from('dict_cache').select('phonetic').eq('form_key', fk).maybeSingle()
                if (data && data.phonetic) phonetic = data.phonetic
              } catch {
                /* ignore */
              }
            }
            const row = {
              owner_id: uid,
              form: r.form,
              form_key: fk,
              word_key: `u.${fk}`,
              pos: r.payload.pos,
              gloss: r.payload.gloss,
              phonetic_br: phonetic,
              phonetic_status: phonetic ? 'ok' : 'pending',
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
            try {
              const { data, error } = await admin
                .from('user_words')
                .upsert(row, { onConflict: 'owner_id,form_key' })
                .select()
                .single()
              if (error) throw error
              r.userWord = {
                id: data.id,
                wordKey: data.word_key,
                form: data.form,
                pos: data.pos,
                gloss: data.gloss,
                phoneticBr: data.phonetic_br,
                phoneticStatus: data.phonetic_status,
                example: data.example,
                usage: data.usage,
                cefr: data.cefr,
                freqRank: data.freq_rank,
                morphs: data.morphs || [],
                chain: data.chain || [],
                source: data.source,
                editedByUser: Boolean(data.edited_by_user),
                generationStatus: data.generation_status,
              }
              if (stationId) {
                // ⚠️ 为什么这里必须显式校验归属（红线一，与 Edge Function 同构）：
                //   写入用的是 service_role 客户端，它**绕过 RLS**（本项目 dict_cache 零策略
                //   仍可被 service_role 全表读取即为证据）。而 stations 的 RLS 策略是
                //   `owner_id = auth.uid()`，对 service_role 不生效。
                //   因此若只靠数据库兜底，调用方可以传任意他人的 stationId，
                //   把词条塞进别人的小站（越权写入）。这里必须自己在应用层核对。
                //   ⚠️ 注意：光把 owner_id 钉成自己的 uid **不够** —— 那次真实越权的
                //   payload 里也写了 owner_id: uid。
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
                  const { error: swErr } = await admin
                    .from('station_words')
                    .upsert(
                      {
                        station_id: stationId,
                        owner_id: uid,
                        word_key: data.word_key,
                        source: 'user',
                        updated_at: new Date().toISOString(),
                      },
                      { onConflict: 'station_id,word_key', ignoreDuplicates: true },
                    )
                  if (swErr) {
                    console.error('station_words upsert failed:', swErr.message)
                    r.stationAdded = false
                    r.stationAddCode = 'STATION_WRITE_FAILED'
                    r.stationAddMessage = `词条已保存到个人词库，但加入小站失败：${String(swErr.message).slice(0, 120)}`
                  } else {
                    r.stationAdded = true
                  }
                }
              }
              // 写回跨用户生成缓存（不含任何用户数据）
              await admin
                .from('dict_cache')
                .upsert(
                  {
                    form_key: fk,
                    word_id: null,
                    payload: r.payload,
                    model: DEFAULT_MODEL,
                    prompt_version: PROMPT_VERSION,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'form_key' },
                )
            } catch (e) {
              r.status = 'failed'
              r.code = 'INTERNAL'
              r.message = `入库失败：${e && e.message ? e.message.slice(0, 160) : String(e)}`
            }
            delete r.payload
          }
        } else {
          // 无 DB：把 payload 直接回给前端（前端不落库，仅预览）
          results.forEach((r) => {
            if (r.payload) {
              r.userWord = {
                id: null,
                wordKey: r.wordKey,
                form: r.form,
                pos: r.payload.pos,
                gloss: r.payload.gloss,
                phoneticBr: null,
                phoneticStatus: 'pending',
                example: r.payload.example,
                usage: r.payload.usage,
                cefr: r.payload.cefr,
                freqRank: null,
                morphs: r.payload.morphs,
                chain: r.payload.chain,
                source: 'ai',
                editedByUser: false,
                generationStatus: 'ready',
              }
              r.persisted = false
              delete r.payload
            }
          })
        }

        return sendJson(res, 200, { results, quota: finalQuota })
      })
    },
  }
}

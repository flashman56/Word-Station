/**
 * generate-word 的 Prompt 模板 + 产出校验（Edge Function 与本地 dev 中间件共用）
 * ------------------------------------------------------------------
 * 之所以是 .js 而不是 .ts：这份文件要同时被 Deno（index.ts）与 Node（scripts/dev-generate-plugin.mjs）
 * 导入，不能带任何 TypeScript 语法。
 *
 * ★ 音标红线（最高优先级）★
 *   - prompt 里不出现任何音标字段要求；
 *   - 模型即便自作主张产出 phonetic / ipa / pronunciation，一律在 sanitizeItem() 里丢弃；
 *   - 音标唯一来源是 dict_cache.phonetic（ECDICT 查表）。
 */

/** prompt 版本：变更后旧缓存不再命中 */
export const PROMPT_VERSION = 'v1.0.0'

export const DEFAULT_MODEL = 'deepseek-chat'

/** 一批最多几个词（与前端单批上限一致） */
export const MAX_BATCH = 20

export const SYSTEM_PROMPT = [
  'You are a precise lexicographer writing entries for Chinese learners of English.',
  'Output strict JSON only. No markdown, no code fences, no extra commentary.',
].join(' ')

/**
 * 生成 user prompt。
 * @param {Array<{form: string, pos?: string, gloss?: string, candidates?: string[]}>} items
 * @returns {string}
 */
export function buildUserPrompt(items) {
  const list = items
    .map((it) => {
      const hint = it.pos || it.gloss ? `（${[it.pos, it.gloss].filter(Boolean).join('：')}）` : ''
      const cands = it.candidates && it.candidates.length ? it.candidates.join(', ') : '无'
      return `- ${it.form}${hint}\n  候选词素 id：${cands}`
    })
    .join('\n')

  return `【本批单词】
${list}

【输出】
{"items":[{"form","pos","gloss","cefr","example":{"en","zh"},"usage","morphs":[...],"chain":[{"morph","form","gloss"}]}]}

硬性规则：
1. 只输出 JSON，items 数量 == 输入数量，form 原样照抄（大小写与输入一致）。
2. 禁止输出 phonetic / 音标字段（音标由词典查表提供，你给的一律丢弃）。
3. morphs 只能从该词的【候选词素 id】中选；无法拆解时填 ["x.unk"]，此时 chain 只写一项、morph 填 null、gloss 填整词含义。
4. cefr 必须是 A1..C2 大写之一。
5. example.en 8~200 字符、自然地道；example.zh 与英文严格对应；usage ≤120 中文字符。
6. gloss 用简明中文释义，≤40 字符；pos 用常见缩写（n. / v. / adj. / adv. / prep. 等）。`
}

/**
 * 从模型产出里剥离音标相关字段（红线：音标严禁来自模型）。
 * @param {object} raw
 * @returns {object}
 */
export function sanitizeItem(raw) {
  const banned = ['phonetic', 'phoneticBr', 'phonetic_br', 'ipa', 'pronunciation', 'phoneticStatus']
  const out = {}
  Object.keys(raw || {}).forEach((k) => {
    if (banned.includes(k)) return
    out[k] = raw[k]
  })
  return out
}

const CEFR_SET = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const EXAMPLE_EN_MIN = 8
const EXAMPLE_EN_MAX = 200
const USAGE_MAX = 120

/**
 * 校验单个生成项（与 scripts/validate-data.mjs 同规则语义）。
 * @param {object} item
 * @param {Set<string>} [candidateIds] 允许的 morph id 集合；不传则不校验归属
 * @returns {{ ok: boolean, errors: string[], item?: object }}
 */
export function validateGenItem(item, candidateIds = null) {
  const errors = []
  if (!item || typeof item !== 'object') return { ok: false, errors: ['产出不是对象'] }

  const form = typeof item.form === 'string' ? item.form.trim() : ''
  if (!form) errors.push('缺少 form')
  if (!item.pos || typeof item.pos !== 'string' || !item.pos.trim()) errors.push('缺少 pos')
  if (!item.gloss || typeof item.gloss !== 'string' || !item.gloss.trim()) errors.push('缺少 gloss')
  if (!CEFR_SET.includes(item.cefr)) errors.push(`cefr 非法：${item.cefr}`)

  const ex = item.example
  if (!ex || typeof ex !== 'object') {
    errors.push('缺少 example')
  } else {
    const en = typeof ex.en === 'string' ? ex.en.trim() : ''
    const zh = typeof ex.zh === 'string' ? ex.zh.trim() : ''
    if (en.length < EXAMPLE_EN_MIN || en.length > EXAMPLE_EN_MAX) {
      errors.push(`example.en 长度需在 ${EXAMPLE_EN_MIN}~${EXAMPLE_EN_MAX}（实际 ${en.length}）`)
    }
    if (!zh) errors.push('example.zh 为空')
  }

  let morphs = Array.isArray(item.morphs) ? item.morphs.filter((m) => typeof m === 'string' && m) : []
  // 兜底：模型给不出拆解 → x.unk 占位（保证图谱可见）
  if (morphs.length === 0) morphs = ['x.unk']

  let chain = Array.isArray(item.chain) ? item.chain : []
  if (chain.length === 0) {
    chain = [{ morph: null, form, gloss: typeof item.gloss === 'string' ? item.gloss : '' }]
  }
  chain = chain
    .filter((c) => c && typeof c === 'object')
    .map((c) => ({
      morph: typeof c.morph === 'string' && c.morph ? c.morph : null,
      form: typeof c.form === 'string' ? c.form : '',
      gloss: typeof c.gloss === 'string' ? c.gloss : '',
    }))
  chain.forEach((c, i) => {
    if (!c.form) errors.push(`chain[${i}].form 为空`)
    if (!c.gloss) errors.push(`chain[${i}].gloss 为空`)
    if (c.morph && candidateIds && !candidateIds.has(c.morph) && c.morph !== 'x.unk') {
      // 不在候选集：判为不可用（宁可让模型重试，也不塞脏数据）
      errors.push(`chain[${i}].morph 不在候选集：${c.morph}`)
    }
  })

  const usage = typeof item.usage === 'string' ? item.usage.trim() : ''
  if (usage.length > USAGE_MAX) errors.push(`usage 超过 ${USAGE_MAX} 字符`)

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    errors: [],
    item: {
      form,
      pos: item.pos.trim(),
      gloss: item.gloss.trim(),
      cefr: item.cefr,
      example: { en: ex.en.trim(), zh: ex.zh.trim() },
      usage: usage || '',
      morphs,
      chain,
    },
  }
}

/**
 * 为某个词形挑选候选词素 id（启发式：词素形/变体作为子串出现在词形里）。
 * 候选集只用于约束模型，不用于最终判定（无法拆解时模型会填 x.unk）。
 *
 * @param {string} form
 * @param {Array<{id: string, form: string, variants?: string[]}>} morphemes
 * @param {number} [limit]
 * @returns {string[]}
 */
export function candidateMorphIds(form, morphemes, limit = 14) {
  const needle = String(form ?? '').toLowerCase()
  if (!needle) return []
  const hits = []
  ;(morphemes || []).forEach((m) => {
    if (!m || !m.id) return
    const forms = [m.form, ...(Array.isArray(m.variants) ? m.variants : [])]
      .filter((f) => typeof f === 'string' && f.length >= 2)
      .map((f) => f.toLowerCase())
    if (forms.some((f) => needle.includes(f))) hits.push(m.id)
  })
  return [...new Set(hits)].slice(0, limit)
}

/** 从模型返回的文本里抠出 JSON（容忍 markdown 代码围栏） */
export function extractJson(text) {
  const raw = String(text ?? '').trim()
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw)
  const body = fenced ? fenced[1].trim() : raw
  try {
    return JSON.parse(body)
  } catch {
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(body.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

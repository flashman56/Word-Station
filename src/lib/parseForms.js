/**
 * 批量加词的多分隔符解析（纯函数，可单测）
 * ------------------------------------------------------------------
 * 分隔符：逗号（, ，）、分号（; ；）、空格 / 换行 / Tab。
 * 处理链：切分 → 去空 → 修剪边缘标点 → 合法性校验 → 按 formKey 去重。
 *
 * 只做「解析」，不做「查库」：命中判定交给 src/lib/dict.js。
 */

/** 分隔符：逗号 / 分号 / 任意空白（空格、换行、Tab） */
export const SEPARATORS = /[,，;；\s]+/

/** 合法词形：以字母开头，允许字母、数字、连字符、撇号、句点；最长 64 */
const FORM_PATTERN = /^[A-Za-z][A-Za-z0-9'’.\-]*$/

export const MAX_FORM_LENGTH = 64

/**
 * 修剪边缘的引号 / 括号等杂字符（内部字符不动）。
 * @param {string} s
 * @returns {string}
 */
function trimEdgeNoise(s) {
  // 开头不修剪撇号（否则 "'em" 会被误判成合法词 "em"）；结尾的撇号要剪掉
  return String(s ?? '')
    .replace(/^[\s"“”(（【\[《<·、。.,，;；:：!！?？]+/, '')
    .replace(/[\s"'‘’“”)）】\]》>。.,，;；:：!！?？]+$/, '')
}

/**
 * 单个 token 的合法性判定。
 * @param {string} token
 * @returns {{ valid: boolean, reason: string }}
 */
export function checkForm(token) {
  const raw = String(token ?? '').trim()
  if (!raw) return { valid: false, reason: '空' }
  const form = trimEdgeNoise(raw)
  if (!form) return { valid: false, reason: '空' }
  if (form.length > MAX_FORM_LENGTH) return { valid: false, reason: `超过 ${MAX_FORM_LENGTH} 字符` }
  if (!FORM_PATTERN.test(form)) return { valid: false, reason: '含非法字符（需以字母开头）' }
  return { valid: true, reason: '' }
}

/**
 * 解析原始输入。
 * @param {string} raw 用户粘贴的一整段文本
 * @returns {{
 *   items: Array<{form: string, formKey: string, index: number, valid: boolean, reason: string, duplicate: boolean}>,
 *   stats: { total: number, valid: number, invalid: number, duplicate: number }
 * }}
 */
export function parse(raw) {
  const text = typeof raw === 'string' ? raw : ''
  const tokens = text.split(SEPARATORS).filter((t) => t !== '')
  const seen = new Set()
  const items = []

  tokens.forEach((token, i) => {
    const check = checkForm(token)
    const form = check.valid ? trimEdgeNoise(token.trim()) : String(token ?? '').trim()
    const formKey = form.toLowerCase()
    const duplicate = check.valid && seen.has(formKey)
    if (check.valid && !duplicate) seen.add(formKey)
    items.push({
      form,
      formKey,
      index: i,
      valid: check.valid,
      reason: check.valid ? '' : check.reason,
      duplicate,
    })
  })

  const validItems = items.filter((it) => it.valid && !it.duplicate)
  return {
    items,
    stats: {
      total: items.length,
      valid: validItems.length,
      invalid: items.filter((it) => !it.valid).length,
      duplicate: items.filter((it) => it.duplicate).length,
    },
  }
}

/**
 * 去重（保留首次出现，顺序不变）。
 * @param {Array<{form: string, formKey?: string}>} forms
 * @returns {Array<{form: string, formKey: string}>}
 */
export function dedupe(forms) {
  const seen = new Set()
  const out = []
  ;(forms || []).forEach((f) => {
    const form = String((f && f.form) ?? f ?? '').trim()
    if (!form) return
    const key = (f && f.formKey) || form.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push({ form, formKey: key })
  })
  return out
}

/**
 * 只取「有效且未重复」的词形，供查库使用。
 * @param {string} raw
 * @returns {Array<{form: string, formKey: string}>}
 */
export function parseUsable(raw) {
  return dedupe(
    parse(raw)
      .items.filter((it) => it.valid && !it.duplicate)
      .map((it) => ({ form: it.form, formKey: it.formKey })),
  )
}

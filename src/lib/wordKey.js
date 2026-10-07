/**
 * 统一词条引用 key（word_key）——全应用唯一口径
 * ------------------------------------------------------------------
 * | 来源   | word_key        | 说明                                        |
 * |--------|-----------------|---------------------------------------------|
 * | 公共库 | `w.<slug(form)>` | 恰好等于现有 `word.id`，老 localStorage 零迁移 |
 * | 私有库 | `u.<formKey>`    | `formKey = lower(btrim(form))`，owner 内唯一  |
 *
 * 关键点：`slug()` 与离线脚本生成 `word.id` 的口径一致（去变音符号 + 去非字母数字 + 小写），
 * 所以公共词的 word_key 与既有学习记录里的记录 key 完全相同，不需要任何迁移。
 * （学习记录存在哪个 localStorage 键由 lib/migrate.js 独占，本文件不关心。）
 */

/**
 * 词形 slug：'vivandière' -> 'vivandiere'；'mortuary chapel' -> 'mortuarychapel'。
 * @param {string} form
 * @returns {string}
 */
export function slug(form) {
  return String(form ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * 用户私有词的 form_key：小写 + 去首尾空白（与 Postgres `lower(btrim(form))` 一致）。
 * @param {string} form
 * @returns {string}
 */
export function formKeyOf(form) {
  return String(form ?? '').trim().toLowerCase()
}

/** 公共库词条的 word_key（等于 word.id） */
export function publicKey(form) {
  return `w.${slug(form)}`
}

/** 用户私有词条的 word_key */
export function userKey(form) {
  return `u.${formKeyOf(form)}`
}

/**
 * 解析 word_key。
 * @param {string} key
 * @returns {{ kind: 'public'|'user'|'unknown', form: string, key: string }}
 *   form 对公共词是 slug（不是原始 form），对私有词是 form_key。
 */
export function parseWordKey(key) {
  const raw = String(key ?? '')
  if (raw.startsWith('w.')) return { kind: 'public', form: raw.slice(2), key: raw }
  if (raw.startsWith('u.')) return { kind: 'user', form: raw.slice(2), key: raw }
  return { kind: 'unknown', form: raw, key: raw }
}

/** 是否公共库引用 */
export function isPublicKey(key) {
  return String(key ?? '').startsWith('w.')
}

/** 是否私有库引用 */
export function isUserKey(key) {
  return String(key ?? '').startsWith('u.')
}

/**
 * 判断词条是否属于不应提示“音标待补”的短语形态。
 *
 * 公共库的多词短语和连字符复合词本来就不承诺单词级音标；kind 明确为 phrase
 * 时同样按短语处理。此函数只控制提示展示，不生成、推断或修改任何音标。
 *
 * @param {{form?: string, kind?: string}|null|undefined} word
 * @returns {boolean}
 */
export function isPhraseLike(word) {
  if (word?.kind === 'phrase') return true
  return /[\s-]/.test(String(word?.form || '').trim())
}

/**
 * 是否应显示“音标待补”。
 * @param {{form?: string, kind?: string}|null|undefined} word
 * @param {unknown} phonetic
 * @returns {boolean}
 */
export function shouldShowPhoneticPending(word, phonetic) {
  return !phonetic && !isPhraseLike(word)
}

/**
 * etym.js —— 词源故事：本地组合兜底 + 精编懒加载
 * ------------------------------------------------------------------
 * 三层结构（对应 docs/features-design.md C·词源故事）：
 *   ① composeEtymology(morph)：**本地组合叙述**。仅用现有 origin / gloss / glossEn /
 *      note / variants 零依赖合成，678 词素 100% 覆盖、离线、即时、**不发网络请求**。
 *   ② loadEtymologyMap()：首次调用时**动态 import** `../data/morph-etym.js`（模块级
 *      Promise 缓存，只加载一次）。**禁止任何静态 import**，否则大数据文件会进首屏 bundle。
 *   ③ resolveEtymology(morph)：精编优先，缺失回退组合。
 *
 * ★ 音标红线：本文件绝不产出 / 存储音标；词源数据（morph-etym.js）同样不含音标字段。
 * ★ 同源词措辞：精编数据用「同源词」；组合叙述只给「同词素词」（语义更诚实）。
 */
import { ORIGINS, TYPES } from './derive.js'

/**
 * @typedef {{ era: string, text: string }} TimelineStep
 * @typedef {{ form: string, gloss?: string, wordId?: string, morphId?: string }} Cognate
 * @typedef {{
 *   origin: string,
 *   proto: string|null,
 *   protoGloss: string|null,
 *   pie: boolean,
 *   story: string,
 *   timeline: TimelineStep[],
 *   cognates: Cognate[],
 *   source: 'composed' | 'curated',
 * }} EtymEntry
 */

/** 组合叙述最多列几个「同词素词」 */
const MAX_RELATED = 8

/** 来源 key → 中文标签（复用 derive.js 的 ORIGINS，缺失兜底） */
function originLabel(origin) {
  const cfg = ORIGINS && origin ? ORIGINS[origin] : null
  return (cfg && cfg.label) || '其他'
}

/** 类型 key → 中文标签（复用 derive.js 的 TYPES） */
function typeLabel(type) {
  const cfg = TYPES && type ? TYPES[type] : null
  return (cfg && cfg.label) || '词素'
}

/**
 * 本地组合叙述：由现有词素字段合成一段词源简介。
 * @param {object} morph 词素对象（morph.words 存在时会带出「同词素词」）
 * @returns {EtymEntry}
 */
export function composeEtymology(morph) {
  const m = morph && typeof morph === 'object' ? morph : {}
  const origin = typeof m.origin === 'string' ? m.origin : 'other'
  const form = m.form || m.display || ''
  const display = m.display || form
  const gloss = m.gloss || ''
  const glossEn = m.glossEn || ''
  const variants = Array.isArray(m.variants) ? m.variants.filter(Boolean) : []
  const type = m.type || ''
  const note = m.note || ''
  const oLabel = originLabel(origin)
  const tLabel = typeLabel(type)

  // 演变时间线：来源 → 词形 → 记忆（组合叙述不编造具体年代/语源年代）
  const timeline = [
    { era: '来源', text: `${oLabel}${tLabel}「${form}」${gloss || glossEn ? `，义为「${gloss || glossEn}」` : ''}` },
    {
      era: '词形',
      text: variants.length ? `常见变体：${display}` : `词形：${display}`,
    },
  ]
  if (note) timeline.push({ era: '记忆', text: note })

  const storyParts = [
    `「${form}」是${oLabel}${tLabel}，含义为「${gloss}」${glossEn ? `（${glossEn}）` : ''}。`,
  ]
  if (variants.length) storyParts.push(`常见变体有 ${variants.join('、')}。`)
  if (note) storyParts.push(note)
  storyParts.push('（以上为词库内置的组合说明，完整词源演变待精编数据补充。）')
  const story = storyParts.join('')

  // 组合叙述不做「同源词」（语义上同源 ≠ 同词素）；仅在有 words 时给出「同词素词」
  const words = Array.isArray(m.words) ? m.words : []
  const cognates = words
    .slice(0, MAX_RELATED)
    .map((w) => (w && w.form ? { form: w.form, gloss: w.gloss || '', wordId: w.id } : null))
    .filter(Boolean)

  return {
    origin,
    proto: null,
    protoGloss: null,
    pie: false,
    story,
    timeline,
    cognates,
    source: 'composed',
  }
}

/**
 * 归一化精编条目：补全缺省字段、统一类型，并标注 source='curated'。
 * @param {object} entry 原始数据
 * @param {object} [morph] 词素（用于兜底 origin）
 * @returns {EtymEntry}
 */
function normalizeCurated(entry, morph) {
  const e = entry && typeof entry === 'object' ? entry : {}
  const timeline = Array.isArray(e.timeline)
    ? e.timeline
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({ era: String(s.era || ''), text: String(s.text || '') }))
    : []
  const cognates = Array.isArray(e.cognates)
    ? e.cognates
        .filter((c) => c && typeof c === 'object' && c.form)
        .map((c) => ({
          form: String(c.form),
          gloss: typeof c.gloss === 'string' ? c.gloss : '',
          wordId: typeof c.wordId === 'string' ? c.wordId : undefined,
          morphId: typeof c.morphId === 'string' ? c.morphId : undefined,
        }))
    : []
  return {
    origin: typeof e.origin === 'string' ? e.origin : (morph && morph.origin) || 'other',
    proto: typeof e.proto === 'string' ? e.proto : null,
    protoGloss: typeof e.protoGloss === 'string' ? e.protoGloss : null,
    pie: e.pie === true,
    story: typeof e.story === 'string' ? e.story : '',
    timeline,
    cognates,
    source: 'curated',
  }
}

/** 模块级 Promise 缓存：morph-etym.js 只加载一次 */
let mapPromise = null

/**
 * 动态加载精编词源映射（懒加载，仅一次）。
 * ⚠️ 必须保持动态 import —— 静态 import 会把数据打进首屏 bundle。
 * @returns {Promise<Record<string, EtymEntry>>}
 */
export function loadEtymologyMap() {
  if (!mapPromise) {
    mapPromise = import('../data/morph-etym.js')
      .then((mod) => (mod && mod.default) || {})
      .catch(() => ({}))
  }
  return mapPromise
}

/**
 * 解析某词素的词源故事：精编优先，缺失回退本地组合叙述。
 * @param {object} morph 词素对象
 * @returns {Promise<EtymEntry>}
 */
export async function resolveEtymology(morph) {
  if (!morph || typeof morph !== 'object' || !morph.id) return composeEtymology(morph)
  const map = await loadEtymologyMap()
  const entry = map ? map[morph.id] : null
  if (entry && typeof entry === 'object') return normalizeCurated(entry, morph)
  return composeEtymology(morph)
}

export default { composeEtymology, loadEtymologyMap, resolveEtymology }

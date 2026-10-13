// 数据质量门槛（入库门禁）—— 类别感知 + 自检
//
// ★ 为什么不是「无 chain 一律不入库」★
//   mono / proper / loan / phrase 四类天生没有词根链（功能词 you/the、借词 café、
//   专有名词、短语）。实测 44,283 个无 morphs 的词**全部**带 morphless:true 标记，
//   漏拆解的嫌疑词为 0 —— morphless 是「词性/来源属性」，不是缺陷。
//   所以门槛只对**内容词**（其余类别）要求 morphs+chain，并对其余类别校验结构完整性。
//
// 用法：node scripts/check-quality-gate.mjs   （CI/部署前跑，errors>0 即红）

import { WORD_FILES, words } from '../src/data/words-entry.js'
import morphemes from '../src/data/morphemes.js'

// 天生无词根链的类别（门槛不要求它们有 morphs/chain）
const NO_CHAIN_KINDS = new Set(['mono', 'proper', 'loan', 'phrase'])
const isContent = (w) => !NO_CHAIN_KINDS.has(w.kind)

const hasMorphs = (w) => Array.isArray(w.morphs) && w.morphs.length > 0
const hasChain = (w) => Array.isArray(w.chain) && w.chain.length > 0
const norm = (f) =>
  'w.' + String(f).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * 核心判定（纯函数，供自检与真实数据共用）
 * @param {Array} ws 词条
 * @param {Set<string>} morphIds 词素 id 全集
 */
export function gate(ws, morphIds) {
  const errors = []
  const warns = []
  const E = (code, w, msg) => errors.push({ code, form: w && w.form, id: w && w.id, msg })
  const W = (code, msg) => warns.push({ code, msg })

  // R1 id 唯一
  const seenId = new Map()
  for (const w of ws) {
    if (seenId.has(w.id)) E('R1_DUP_ID', w, `id 重复：与 ${seenId.get(w.id).form} 撞 id ${w.id}`)
    else seenId.set(w.id, w)
  }

  // R2 form 唯一（同一词形只能有一条）
  const seenForm = new Map()
  for (const w of ws) {
    if (seenForm.has(w.form)) E('R2_DUP_FORM', w, `form 重复：与 ${seenForm.get(w.form).id} 同形 ${w.form}`)
    else seenForm.set(w.form, w)
  }

  // R3 form / gloss 非空
  for (const w of ws) {
    if (!w.form || !String(w.form).trim()) E('R3_NO_FORM', w, 'form 为空')
    if (!w.gloss || !String(w.gloss).trim()) E('R3_NO_GLOSS', w, 'gloss 为空')
  }

  // R4 内容词必须有 morphs + chain（词族教学的底线）
  for (const w of ws) {
    if (!isContent(w)) continue
    if (!hasMorphs(w)) E('R4_CONTENT_NO_MORPHS', w, `内容词缺 morphs（kind=${w.kind || '-'}）`)
    else if (!hasChain(w)) E('R4_CONTENT_NO_CHAIN', w, `内容词有 morphs 但缺 chain（kind=${w.kind || '-'}）`)
  }

  // R5 morphs 里的 id 必须都在词素表中（防拼错 / 防孤儿 id）
  for (const w of ws) {
    if (!hasMorphs(w)) continue
    for (const id of w.morphs) {
      if (!morphIds.has(id)) E('R5_UNKNOWN_MORPH', w, `morphs 引用了词素表里没有的 id：${id}`)
    }
  }

  // R6 无 morphs 的词必须带 morphless:true（否则 validate 会误判、统计口径会漂）
  for (const w of ws) {
    if (!hasMorphs(w) && w.morphless !== true) {
      E('R6_UNFLAGGED_MORPHLESS', w, '无 morphs 却未标 morphless:true')
    }
  }

  // ---- 以下为「已知问题」告警，不阻断（需专项数据 pass 才能根治）----
  // W1 freqRank 高位成桶：难度分档 + 词汇量预测都靠 freqRank
  const rankCount = new Map()
  for (const w of ws) if (typeof w.freqRank === 'number') rankCount.set(w.freqRank, (rankCount.get(w.freqRank) || 0) + 1)
  let collided = 0, collideWords = 0, worst = [0, 0]
  for (const [r, c] of rankCount) {
    if (c > 1) { collided++; collideWords += c; if (c > worst[1]) worst = [r, c] }
  }
  if (collideWords > 0) W('W1_FREQ_BUCKET', `freqRank 碰撞：${collided} 个排名被多词共用，牵涉 ${collideWords} 词；最严重 rank ${worst[0]} 有 ${worst[1]} 词`)

  // W2 专名混进默认池（excludeProper 默认关）
  const lowBand = ws.filter((w) => typeof w.freqRank === 'number' && w.freqRank <= 3000)
  const properLow = lowBand.filter((w) => w.kind === 'proper').length
  if (properLow > 0) W('W2_PROPER_IN_LOW_BAND', `最低 3000 频段里有 ${properLow} 个专名（占 ${(properLow / (lowBand.length || 1) * 100).toFixed(1)}%），新手第一档会混进人名地名`)

  // W3 短语 / 连字符词条会污染词族
  const spaced = ws.filter((w) => /\s/.test(w.form || '')).length
  const hyph = ws.filter((w) => /-/.test(w.form || '')).length
  if (spaced) W('W3_PHRASE_POLLUTION', `含空格词条 ${spaced} 条、含连字符 ${hyph} 条，短语会落进词族分组`)

  return { errors, warns }
}

// ---------- 自检：正样本须过、反样本须被拦 ----------
function selftest() {
  const ids = new Set(['r.act', 's.ive'])
  const ok = []
  const bad = []
  const base = { id: 'w.active', form: 'active', gloss: '活跃的', kind: undefined, morphs: ['r.act'], chain: [{ morph: 'r.act', form: 'act', gloss: '做' }] }

  const cases = [
    ['正:内容词有 morphs+chain', [base], 0],
    ['反:内容词缺 chain', [{ ...base, chain: [] }], 1],
    ['反:内容词缺 morphs', [{ ...base, morphs: [], chain: [], morphless: false }], 2],
    ['正:mono 词无 morphs 但有标记', [{ id: 'w.the', form: 'the', gloss: '这', kind: 'mono', morphs: [], chain: [], morphless: true }], 0],
    ['反:无 morphs 却没标记', [{ id: 'w.the', form: 'the', gloss: '这', kind: 'mono', morphs: [], chain: [] }], 1],
    ['反:id 重复', [base, { ...base }], 2],
    ['反:form 重复', [base, { ...base, id: 'w.active2' }], 1],
    ['反:gloss 空', [{ ...base, gloss: '' }], 1],
    ['反:未知 morph id', [{ ...base, morphs: ['r.nope'] }], 1],
  ]
  for (const [name, ws, expectMin] of cases) {
    const { errors } = gate(ws, ids)
    const got = errors.length
    if (expectMin === 0) {
      if (got === 0) ok.push(name); else bad.push(`${name} → 期望 0 错，实得 ${got}`)
    } else {
      if (got >= expectMin) ok.push(name); else bad.push(`${name} → 期望 ≥${expectMin} 错，实得 ${got}`)
    }
  }
  return { ok, bad }
}

// ---------- 主流程 ----------
const isMain = process.argv[1] && process.argv[1].endsWith('check-quality-gate.mjs')
if (isMain) {
  console.log('=== 门槛自检 ===')
  const st = selftest()
  st.ok.forEach((n) => console.log('  ✓', n))
  st.bad.forEach((n) => console.log('  ✗', n))

  console.log('\n=== 真实数据 ===')
  const ids = new Set(morphemes.map((m) => m.id))
  const { errors, warns } = gate(words, ids)
  console.log(`内容词门槛下 errors=${errors.length}，已知问题 warns=${warns.length}`)
  if (errors.length) {
    const byCode = new Map()
    errors.forEach((e) => byCode.set(e.code, (byCode.get(e.code) || 0) + 1))
    console.log('  错误分布:', [...byCode].map(([c, n]) => `${c}×${n}`).join(' '))
    errors.slice(0, 20).forEach((e) => console.log('   -', e.code, e.form, e.msg))
  }
  warns.forEach((w) => console.log('  [warn]', w.code, w.msg))

  const pass = st.bad.length === 0 && errors.length === 0
  console.log(`\nIS_PASS: ${pass ? 'YES' : 'NO'}（自检失败 ${st.bad.length} · 数据错误 ${errors.length}）`)
  process.exit(pass ? 0 : 1)
}
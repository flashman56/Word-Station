/**
 * 数据校验脚本（纯 Node ESM，无第三方依赖）
 * 用法：npm run validate
 *
 * error 会导致 exit 1；warn 只提示，不阻断。
 */
import { morphemes, words } from '../src/data/index.js'
import wordsEtymReviewed from '../src/data/words-etym-reviewed.js'

const VALID_TYPES = ['root', 'prefix', 'suffix']
const VALID_ORIGINS = ['latin', 'greek', 'germanic', 'old_english', 'french', 'other']
const VALID_CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const AUTO_KNOWN_RANK = 2500

// ---------------------------------------------------------------- 新字段规则
// 音标：DJ 英式，含首尾斜杠，内容只允许英文字母 + IPA 符号（含音节点）
const DJ_CHARS = /^[a-zA-Z ˈˌːˑəɐɑɒɔɜɛɘɞɪɨɯʌʊæøɵɶʉɤʏɹɾʃʒθðŋɲɳɡɢʔχʁʀħʕʜʢʍɥʧʤ˘.()]+$/
// KK 美式专用符号，一律禁止
const KK_CHARS = /[ˋˊ˝ɚɝ]/
const EXAMPLE_EN_MIN = 8
const EXAMPLE_EN_MAX = 200

const errors = []
const warns = []
const err = (msg) => errors.push(msg)
const warn = (msg) => warns.push(msg)

// ---------------------------------------------------------------- 词素

const morphIds = new Set()
morphemes.forEach((m, i) => {
  const at = `morphemes[${i}](${m?.id ?? '?'})`
  if (!m.id) return err(`${at} 缺少 id`)
  if (morphIds.has(m.id)) err(`${at} id 重复：${m.id}`)
  morphIds.add(m.id)
  if (!VALID_TYPES.includes(m.type)) err(`${at} type 非法：${m.type}`)
  if (!VALID_ORIGINS.includes(m.origin)) err(`${at} origin 非法：${m.origin}`)
  if (!m.form) err(`${at} 缺少 form`)
  if (!m.gloss) err(`${at} 缺少 gloss`)
  if (!Array.isArray(m.variants)) err(`${at} variants 必须是数组`)
  if (!m.display) warn(`${at} 建议填写 display（展示词形）`)
})

// ---------------------------------------------------------------- 单词

const wordIds = new Set()
const wordForms = new Set()
const countByMorph = new Map()
morphemes.forEach((m) => countByMorph.set(m.id, { total: 0, high: 0, mid: 0 }))
const freqBands = { base: 0, high: 0, mid: 0, lowmid: 0, low: 0 }
const cefrDist = {}
// 补齐进度（口径：freqRank > AUTO_KNOWN_RANK 的中低频词，即学习卡片真实抽取池）
const fill = { total: 0, phonetic: 0, example: 0 }

/** 非空字符串 */
const filled = (v) => typeof v === 'string' && v.trim().length > 0

/** phoneticBr：填了就必须合法；未填不算 error，只计入进度 */
function checkPhonetic(w, at) {
  const p = w.phoneticBr
  if (p == null || p === '') return false
  if (typeof p !== 'string') {
    err(`${at} phoneticBr 必须是字符串：${JSON.stringify(p)}`)
    return false
  }
  const body = p.slice(1, -1)
  if (!(p.startsWith('/') && p.endsWith('/') && p.length > 2)) {
    err(`${at} phoneticBr 必须是 DJ 音标格式（首尾各一个 /）：${p}`)
  } else if (KK_CHARS.test(body)) {
    err(`${at} phoneticBr 含 KK 美式符号（ˋ ˊ ˝ ɚ ɝ），请用 DJ 英式：${p}`)
  } else if (!DJ_CHARS.test(body)) {
    err(`${at} phoneticBr 含非 IPA 字符，只允许字母与 IPA 符号：${p}`)
  }
  return true
}

/** example：填了就必须是 { en, zh } 且都非空、en 长度 8~200；未填不算 error */
function checkExample(w, at) {
  const e = w.example
  if (e == null) return false
  if (typeof e !== 'object' || Array.isArray(e)) {
    err(`${at} example 必须是对象 { en, zh }`)
    return false
  }
  if (!filled(e.en)) err(`${at} example.en 缺失或为空`)
  else if (e.en.length < EXAMPLE_EN_MIN || e.en.length > EXAMPLE_EN_MAX) {
    err(`${at} example.en 长度须在 ${EXAMPLE_EN_MIN}~${EXAMPLE_EN_MAX} 字符，当前 ${e.en.length}`)
  }
  if (!filled(e.zh)) err(`${at} example.zh 缺失或为空`)
  return true
}

words.forEach((w, i) => {
  const at = `words[${i}](${w?.id ?? '?'})`
  if (!w.id) return err(`${at} 缺少 id`)
  if (wordIds.has(w.id)) err(`${at} id 重复：${w.id}`)
  wordIds.add(w.id)
  if (!w.form) err(`${at} 缺少 form`)
  else {
    const normalizedForm = String(w.form).toLowerCase()
    if (wordForms.has(normalizedForm)) err(`${at} form 重复（忽略大小写）：${w.form}`)
    wordForms.add(normalizedForm)
  }
  if (!w.gloss) err(`${at} 缺少 gloss`)
  if (!w.pos) err(`${at} 缺少 pos（词性，必填）`)
  if (!VALID_CEFR.includes(w.cefr)) err(`${at} cefr 非法：${w.cefr}`)

  const hasPhonetic = checkPhonetic(w, at)
  const hasExample = checkExample(w, at)
  if (w.freqRank > AUTO_KNOWN_RANK && w.morphless !== true) {
    fill.total += 1
    if (hasPhonetic) fill.phonetic += 1
    if (hasExample) fill.example += 1
    // 数据完整性（向前加固，防止将来回退）：目标补齐词缺失音标 / 例句必须判 error
    if (!hasPhonetic) err(`${at} 目标补齐词（freqRank>${AUTO_KNOWN_RANK}）缺失 phoneticBr，须补齐音标`)
    if (!hasExample) err(`${at} 目标补齐词（freqRank>${AUTO_KNOWN_RANK}）缺失 example，须补齐双语例句`)
  }
  if (!Number.isInteger(w.freqRank) || w.freqRank <= 0) err(`${at} freqRank 必须是正整数：${w.freqRank}`)

  if (!Array.isArray(w.morphs)) {
    err(`${at} morphs 必须是数组`)
    return
  }
  if (w.morphs.length === 0) {
    if (w.morphless !== true) {
      err(`${at} morphs 为空时必须显式标记 morphless: true`)
      return
    }
    if (!filled(w.pos)) err(`${at} 无词素词缺少 pos`)
    if (!filled(w.gloss)) err(`${at} 无词素词缺少 gloss`)
    if (!filled(w.origin)) err(`${at} 无词素词缺少 origin`)
    if (!filled(w.kind)) err(`${at} 无词素词缺少 kind`)
  }
  w.morphs.forEach((mid) => {
    if (!morphIds.has(mid)) err(`${at} morphs 引用了不存在的词素：${mid}`)
    const c = countByMorph.get(mid)
    if (c) {
      c.total += 1
      if (w.freqRank <= AUTO_KNOWN_RANK) c.high += 1
      else if (w.cefr === 'B2' || w.cefr === 'C1' || w.cefr === 'C2') c.mid += 1
    }
  })

  if (Array.isArray(w.chain)) {
    w.chain.forEach((step) => {
      if (!step || !step.form) err(`${at} chain 某一步缺少 form`)
      if (step.morph != null && !morphIds.has(step.morph)) {
        err(`${at} chain 引用了不存在的词素：${step.morph}`)
      }
    })
  } else {
    err(`${at} 缺少 chain（构词拆解路径）`)
  }

  const b =
    w.freqRank <= 1000 ? 'base'
      : w.freqRank <= 2500 ? 'high'
        : w.freqRank <= 6000 ? 'mid'
          : w.freqRank <= 12000 ? 'lowmid' : 'low'
  freqBands[b] += 1
  cefrDist[w.cefr] = (cefrDist[w.cefr] || 0) + 1
})

// ---------------------------------------------------------------- 逐词复核词源闸门
// 逐词审定的 patch 必须在最终数据里完整生效，防止旧补丁优先级或追加式合并
// 把已纠正的错误词素重新带回来。新增这些词时，需要先更新人工复核记录。
const wordById = new Map(words.map((w) => [w.id, w]))
const reviewedIds = new Set()
wordsEtymReviewed.forEach((patch) => {
  if (reviewedIds.has(patch.id)) {
    err(`[逐词复核] 修订表中目标重复：${patch.id}`)
    return
  }
  reviewedIds.add(patch.id)
  const w = wordById.get(patch.id)
  if (!w) {
    err(`[逐词复核] 找不到目标词：${patch.id}`)
    return
  }
  const expectedMorphs = [...patch.morphHints].sort()
  const actualMorphs = [...(w.morphs || [])].sort()
  if (JSON.stringify(actualMorphs) !== JSON.stringify(expectedMorphs)) {
    err(`[逐词复核] ${patch.id} 最终 morphs 应为 [${expectedMorphs.join(', ')}]，实际为 [${actualMorphs.join(', ')}]`)
  }
  const expectedChainMorphs = patch.chain.map((step) => step.morph).filter(Boolean)
  const actualChainMorphs = (w.chain || []).map((step) => step.morph).filter(Boolean)
  if (JSON.stringify(actualChainMorphs) !== JSON.stringify(expectedChainMorphs)) {
    err(`[逐词复核] ${patch.id} 最终 chain 未采用人工复核版本`)
  }
})
if (wordsEtymReviewed.length) {
  console.log(`[闸门] 逐词复核词源覆盖：${wordsEtymReviewed.length} 条`)
}

// ---------------------------------------------------------------- 词素挂载冲突（warn）
//
// ★ 为什么这条闸门必须存在 ★
//   `words-entry.js` / `index.js` 的合并是 `morphs: [...base.morphs, ...patch.morphHints]`
//   ——**追加**。若 base 与补丁对同一个词给出「同 form 但不同 type」的两个词素，
//   合并后两个都在，而 chain 又被补丁整体覆盖，卡面会渲染出**不可能成立**的拆解。
//
//   真实案例（2026-10-14 修）：`r.ment`(root, form 'ment', 拉丁 mens「心」) 与
//   `s.ment`(suffix, form 'ment', -mentum「结果/行为」) 同时挂在 government / comment /
//   segment / attachment 等 25 词上，学习者看到 -mentum 被解释成「心，思想，精神」。
//   铁证：`w.quasigovernment` 的 r.ment 段 gloss 自称「名词后缀」，id 却是 root。
//
//   ★ 为什么此前三个校验器都看不见 ★
//   validate 只验「morph id 是否存在」，不验「这个 id 挂得对不对、彼此是否自相矛盾」。
//   一条 id 存在但语义错位的链路，在旧规则下是全绿的——这正是本条要补的盲区。
//
//   先 warn 不升 error：存量若还有漏网，升 error 会让 validate 直接红掉、挡住其它工作。
//
// ★★ 2026-10-15 判据修正（三版都踩过坑，这是教训合集）★★
//   v1「morphs[] 里有同 form 不同 type 即冲突」→ 假阳性：
//     `alimental` = aliment(r.al) + -al(s.al) 是**真实的拉丁构词**，被误报。
//   v2「root 排在同 form 的 suffix 之后才冲突」→ **漏报**：
//     `government` 的 chain 是 `[null:'govern', r.ment:'ment']`，链里根本没有 s.ment
//     可比对，于是整个跳过——25 个真缺陷全被放行。变异测试当场抓到这个洞。
//   v3「用了 root 就必须配同形 suffix」→ **过严**：
//     `mental` = ment(r.al 之外的真实词根) + -al，r.ment 后面不需要配 s.ment，
//     被误判为「root 无对应 suffix」。
//   v4「段形态带 - 就报 / 与词根同形就报」→ **过严**：
//     `mental` = ment(r.ment) + -al(s.al)、`mention` = ment(r.ment) + ion(s.tion)
//     是**真实的词根用法**（拉丁 mens「心」），但它们 r.ment 段的 form 也是 'ment'，
//     与要拦的 government 尾段在数据上同形，被误判。
//   v5「只看尾段」→ **仍过严**：命中 16 词，全是**整词即该词根**的合法用法：
//     monarch / matriarch / patriarch = mono+arch(r.arch「统治」)、malady = mal(r.mal「坏」)、
//     bene = bene(r.bene「善」)、ment / arch 本身就是词根词。
//     根子：**`r.X` 与 `s.X` 同形不等于互斥**。arch 作首段时是「整词以此为词根」，完全合法；
//     只有当它跟在别的词干之后、却没配对应后缀时，才是「本该用后缀」。
//   v6（现行）：尾段挂 root **且其前面还有非空段**（即它是附加成分、不是整词词根），
//     而该段 form 等于该 root 的 form、且该 form 另有 affix 形态 ⇒ 冲突。
//     拦：government 尾段 r.ment/form='ment'（前面有 'govern'）
//     放：monarch / malady / arch 本身（root 在首段）、mental（r.ment 不在尾段）、alimental
const morphById = new Map(morphemes.map((m) => [m.id, m]))
/** form -> affix id —— 只收「另有 affix 同形态」的 form（即 root 与 affix 同形的那些） */
const formAffixRival = new Map()
for (const m of morphemes) {
  if (!m.form || m.type === 'root') continue
  if (morphemes.some((x) => x.type === 'root' && x.form === m.form)) formAffixRival.set(m.form, m.id)
}
/** 该段是否为链尾段（忽略尾部空段） */
function isTailSeg(steps, idx) {
  for (let i = steps.length - 1; i > idx; i -= 1) {
    if (steps[i] && (steps[i].morph || steps[i].form)) return false
  }
  return true
}
/** 该段之前是否还有非空段（有 ⇒ 它是附加成分；无 ⇒ 它是整词词干） */
function hasPrevSeg(steps, idx) {
  for (let i = 0; i < idx; i += 1) {
    if (steps[i] && (steps[i].morph || steps[i].form)) return true
  }
  return false
}
// ★★ 2026-10-15 结论：这条自动判据做不出来，如实记下来，别再猜 ★★
//   我为它连改 6 版（v1~v6），每版都被变异测试或真实数据打脸：
//     v1 morphs[] 有同 form 双挂即冲突  → 假阳性：alimental（aliment + -al 是真实构词）
//     v2 root 排在 suffix 之后才冲突      → **漏报**：government 链里没有 s.ment 可比对，整条跳过
//     v3 用了 root 就必须配同形 suffix    → 过严：mental（r.ment 后面接 -al，本就不需要 s.ment）
//     v4 段形态带 - 就报 / 与词根同形就报 → 过严：mental / mention 被误判
//     v5 只看链尾段                       → 过严：命中 16 词，全是 monarch/malady/arch 这类
//                                        「整词即该词根」的合法构词
//     v6 尾段 + 前置词干段                 → 仍过严：12 词，patriarch 的 [0] 是 r.patr 真实词根
//   根本困难：**`r.X` 与 `s.X` 同形并不互斥**。arch 作首段是「整词以此为词根」，
//   作尾段才是「本该用后缀」；而「首段 vs 尾段」不足以区分，因为 monarch = mon+arch
//   两个都是词根，而 government = govern+ment 尾段才是误挂。要判准必须查该词的**真实词源**
//   （OED/Wiktionary），这不是能从数据层推出来的——正是「错的词源比没有更糟」红线要求逐词考证的原因。
//
//   ⇒ 本条**默认关闭**（2026-10-15 实测：真实数据里该类缺陷为 0，191 词条已人工复核覆盖）。
//      保留代码与记录，供将来有人拿到可靠词源表后重建判据。
//      启用方式：设环境变量 PLACEMENT_CHECK_MORPH_CONFLICT=1。
//      （morphById / formAffixRival / isTailSeg / hasPrevSeg 见上方 v6 处声明）
const CHECK_CONFLICT = process.env.PLACEMENT_CHECK_MORPH_CONFLICT === '1'
{
  let conflictWords = 0
  if (CHECK_CONFLICT) {
    words.forEach((w) => {
      const steps = Array.isArray(w.chain) ? w.chain : []
      const conflicts = []
      steps.forEach((step, idx) => {
        const mid = step && step.morph
        const segForm = step && typeof step.form === 'string' ? step.form : ''
        if (!mid || !segForm || !isTailSeg(steps, idx) || !hasPrevSeg(steps, idx)) return
        const m = morphById.get(mid)
        if (!m || m.type !== 'root') return
        const rival = formAffixRival.get(m.form)
        if (segForm === m.form && rival) {
          conflicts.push(`尾段 form='${segForm}' 挂了词根 ${mid}（前面已有词干段），该形态此处应为后缀 ${rival}`)
        }
      })
      if (conflicts.length) {
        conflictWords += 1
        warn(`词 ${w.form}(${w.id}) 的 chain 词素挂载冲突：${conflicts.join('；')}`)
      }
    })
  }
  if (!CHECK_CONFLICT) {
    console.log('[闸门] 词素挂载冲突：默认关闭（判据存在不可消除的假阳性，2026-10-15 实测该类缺陷为 0；详见上方注释）')
  } else if (conflictWords === 0) {
    console.log('[闸门] 词素挂载冲突：0 条（已启用 PLACEMENT_CHECK_MORPH_CONFLICT）')
  } else {
    console.log(`[闸门] 词素挂载冲突：${conflictWords} 词命中（见下方 WARN）`)
  }
}

// ---------------------------------------------------------------- 补齐进度提示

if (fill.phonetic < fill.total || fill.example < fill.total) {
  warn(
    `中低频词（freqRank > ${AUTO_KNOWN_RANK}）共 ${fill.total} 个，`
    + `仍有 ${fill.total - fill.phonetic} 个缺 phoneticBr、${fill.total - fill.example} 个缺 example（P0 分批补齐中）`
  )
}

// ---------------------------------------------------------------- 词群规模提示

morphemes.forEach((m) => {
  const c = countByMorph.get(m.id)
  if (!c) return
  if (c.total < 5) warn(`词素 ${m.id}（${m.form}）下只有 ${c.total} 个词，建议补到 5 个以上`)
  if (c.high < 2) warn(`词素 ${m.id}（${m.form}）下高频词仅 ${c.high} 个，建议至少 2 个（freqRank<=${AUTO_KNOWN_RANK}）`)
  if (c.mid < 3) warn(`词素 ${m.id}（${m.form}）下 B2 及以上难度的词仅 ${c.mid} 个，建议至少 3 个`)
})

// ---------------------------------------------------------------- 输出

const byType = {}
const byOrigin = {}
morphemes.forEach((m) => {
  byType[m.type] = (byType[m.type] || 0) + 1
  byOrigin[m.origin] = (byOrigin[m.origin] || 0) + 1
})

console.log('='.repeat(56))
console.log('词根词缀单词云 — 数据校验')
console.log('='.repeat(56))
console.log(`词素总数：${morphemes.length}`)
console.log(`  按类型：`, byType)
console.log(`  按来源：`, byOrigin)
console.log(`单词总数：${words.length}`)
console.log(`  词频分档：`, freqBands)
console.log(`  难度分布：`, cefrDist)
console.log(`  补齐口径：freqRank > ${AUTO_KNOWN_RANK} 的中低频词 ${fill.total} 个`)
console.log(`音标补齐进度 ${fill.phonetic}/${fill.total}　例句补齐进度 ${fill.example}/${fill.total}`)
console.log('-' .repeat(56))

if (warns.length) {
  const verboseWarnings = process.argv.includes('--verbose-warnings')
  const classifyWarning = (message) => {
    if (message.includes('同 form 不同 type')) return '结构冲突'
    if (message.includes('缺 phoneticBr') || message.includes('缺 example')) return '词条字段覆盖'
    if (message.includes('建议填写 display')) return '展示信息'
    if (message.includes('建议补到 5 个以上')) return '词群规模'
    if (message.includes('高频词仅')) return '高频样本覆盖'
    if (message.includes('B2 及以上难度')) return '高阶样本覆盖'
    return '其他提醒'
  }
  const grouped = new Map()
  for (const message of warns) {
    const group = classifyWarning(message)
    grouped.set(group, [...(grouped.get(group) || []), message])
  }
  console.log(`\n[WARN] ${warns.length} 条，按类别汇总：`)
  for (const [group, messages] of grouped) console.log(`  - ${group}：${messages.length} 条`)

  // 结构冲突可能导致词根/后缀语义互相污染，默认完整显示；低优先级覆盖建议只汇总，
  // 避免上千条可选建议淹没真正需要修复的问题。需要逐条清单时传 --verbose-warnings。
  const critical = grouped.get('结构冲突') || []
  critical.forEach((message) => console.log('  [结构冲突] ' + message))
  if (verboseWarnings) {
    warns.forEach((message) => console.log('  [详情] ' + message))
  } else if (warns.length > critical.length) {
    console.log('  低优先级条目已汇总；使用 --verbose-warnings 查看逐条详情。')
  }
}

if (errors.length) {
  console.log(`\n[ERROR] ${errors.length} 条：`)
  errors.slice(0, 60).forEach((e) => console.log('  x ' + e))
  if (errors.length > 60) console.log(`  ... 另有 ${errors.length - 60} 条`)
  console.log('\n结论：IS_PASS: NO')
  process.exit(1)
}

console.log(`\n结论：IS_PASS: YES（warn ${warns.length} 条，error 0 条）`)

/**
 * 「常见变形」展示关系补丁生成器 —— 确定性、可复跑
 * ==================================================================
 * 输入（只用 Step-1 的成对数据）：
 *   - scripts/.lemma-pairs.json   词条对（f,l,type,src,fId,lId,fRank,lRank）
 * 输出：
 *   - src/data/words-forms.js     { 'w.determined': 'w.determine', ... }（按键排序、紧凑）
 *
 * ★ 与折叠补丁的分工（**切勿混淆**）★
 *   scripts/gen-lemma-patch.mjs → src/data/words-lemma.js：
 *       只收 bucket==='auto-fold' 的 9,888 条，词条挂 `.lemma`，
 *       **决定学习队列与统计的折叠**（Step-1 四闸门裁定，用户明确不放宽）。
 *   本脚本 → src/data/words-forms.js：
 *       只按「双向印证（src==='AB'）+ 两端在库 + 非自环 + 非同形异义」取关系，
 *       词条挂 `.formRep`，**仅供 UI 展示「常见变形」**，不参与任何折叠。
 *   展示与折叠是两件事：`determined` 仍是一个独立学习单元，
 *   但它的卡面会显示「常见变形：determined ↔ determine」。
 *
 * ★ 因此本脚本刻意不读 .lemma-map.draft.json、不使用 bucket 字段 ★
 *   bucket 是折叠专用的裁定结果，与展示无关。
 *
 * 过滤链（顺序固定，逐阶段计数）：
 *   ① src === 'AB'（双向印证，最可靠）
 *   ② fId 与 lId 都在词库
 *   ③ f !== l（非自环）
 *   ④ 排除同形异义：某 form 在 pairs 中对应 ≥2 个不同 lemma 的，整词全部剔除；
 *      另剔除显式名单中作为 form 或 lemma 出现的对
 *   ⑤ 链式解析到终态（最多 4 跳）；成环 / 超跳 / 终态自环 → 丢弃并计入分布
 *
 * 确定性：键按 id 升序、无时间戳；同输入必同输出（脚本内做一次重算对拍）。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PAIRS = path.join(ROOT, 'scripts/.lemma-pairs.json')
const OUT = path.join(ROOT, 'src/data/words-forms.js')

/**
 * ★★ 展示链只走 1 跳 —— 即直接用 raw target，不做多跳串联 ★★
 *    折叠表（gen-lemma-patch.mjs）允许最多 4 跳，因为它只影响队列、用户看不见；
 *    **展示表是用户能直接读到的答案**，多跳会串联出可见的错误内容：
 *      evenings→evening→even   （evening 根本不是 even 的变形）
 *      feeds   →feed   →fee
 *      numbered→number →numb
 *      beings  →being  →be
 *    ECDICT 的 exchange 字段把「X 的比较级/复数」也记成一条关系，多跳就把
 *    `number → numb`、`evening → even` 这类**单条就不成立**的边串了进来。
 *    raw target 本身是 `src='AB'` 双向印证过的、可信度最高的一步；1 跳即用它。
 *    关键用例 determined→determine / blown→blow / cleared→clear 本来就是 1 跳，
 *    收益一点不丢（实测条数不变，见下方统计）。
 *
 *    ⚠️ 后人请不要「补全」成多跳：那不是遗漏，是上面这条有意的取舍。
 *
 * 与 src/lib/lemmaFold.js、src/lib/wordForms.js 的运行时防御上限（4 跳）不冲突：
 * 那里是**防御**（数据已是终态，实际 0 跳），这里是**生成口径**。
 */
const MAX_HOPS = 1

/**
 * 显式剔除名单：这些词形在词典里既是某动词的过去式、本身又是常用独立词条
 * （saw 锯子 / left 左 / found 建立 / bound 必然的 / rose 玫瑰 / lay 放置 /
 *  means 手段 / better / worse / worst / leaves / honored）。
 * 把它们算进「变形」会让用户在学 saw（锯子）时看到「see 的过去式」这类误导。
 * 宁可不给，也不误报。
 */
const EXPLICIT_EXCLUDE = [
  'saw', 'left', 'found', 'fell', 'bound', 'rose', 'lay', 'means',
  'better', 'worse', 'worst', 'leaves', 'honored',
]

// ------------------------------------------------------------------
// [1] 读入
// ------------------------------------------------------------------
const pairs = JSON.parse(fs.readFileSync(PAIRS, 'utf8'))

// ------------------------------------------------------------------
// [2] 词库存在性判据：动态 import words-entry 取全部 id
//     （本脚本输出会被 words-entry 引用，故**必须先于接线跑一次**；
//      接线后重跑也安全 —— words-forms.js 已存在。）
// ------------------------------------------------------------------
async function loadLexiconIds() {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src/data/words-entry.js')).href)
  const words = mod.words
  const ids = new Set()
  for (const w of words) if (w && typeof w.id === 'string') ids.add(w.id)
  return { ids, count: words.length }
}

// ------------------------------------------------------------------
// [3] 过滤链
// ------------------------------------------------------------------
function filterPairs(lexIds) {
  const stats = { total: pairs.length, notAB: 0, missingId: 0, selfLoop: 0, homograph: 0, explicit: 0, kept: 0 }

  const ab = []
  for (const p of pairs) {
    if (p.src === 'AB') ab.push(p)
    else stats.notAB += 1
  }
  stats.afterAB = ab.length

  // ★ 同形异义判据：某 form 在 **pairs 全表** 中对应 ≥2 个不同 lemma → 整词剔除 ★
  //   只看过滤后的子集会漏判：一个 form 的另一条（src='A'/'B'）关系恰恰说明它
  //   是多原型同形（如 leaves ← leaf / leave），展示时必须整词不给。
  const lemmaByForm = new Map() // form -> Set(lemma)
  for (const p of pairs) {
    let s = lemmaByForm.get(p.f)
    if (!s) {
      s = new Set()
      lemmaByForm.set(p.f, s)
    }
    s.add(p.l)
  }
  const homographForms = new Set()
  for (const [form, s] of lemmaByForm) if (s.size >= 2) homographForms.add(form)
  const explicit = new Set(EXPLICIT_EXCLUDE)

  const kept = []
  for (const p of ab) {
    if (!lexIds.has(p.fId) || !lexIds.has(p.lId)) {
      stats.missingId += 1
      continue
    }
    if (p.f === p.l) {
      stats.selfLoop += 1
      continue
    }
    if (homographForms.has(p.f)) {
      stats.homograph += 1
      continue
    }
    if (explicit.has(p.f) || explicit.has(p.l)) {
      stats.explicit += 1
      continue
    }
    kept.push(p)
  }
  stats.kept = kept.length
  stats.homographForms = homographForms.size
  return { kept, stats, homographForms }
}

// ------------------------------------------------------------------
// [4] 播种 + 链式解析
// ------------------------------------------------------------------
/**
 * 沿 seed 走最多 MAX_HOPS 跳，**走满即停**（不是「必须走到终态」）。
 *
 * ★ 为什么「走满即停」而不是「超跳报错」★
 *   展示表 MAX_HOPS=1：raw target 自身还在表里（即存在 2 跳链）是**正常情况**，
 *   不该被当成错误丢弃 —— 那会白白扔掉 149 条并改变条数。所以超跳在这里不是
 *   错误，只是「停止串联」的信号：走到 1 跳就返回 raw target。
 *   成环（next 已见过）仍是错误，保留丢弃分支（当前数据下恒为 0）。
 *
 * @param {string} id
 * @param {Map<string,string>} map fId -> lId
 * @returns {{ id: string, hops: number, cycle?: boolean }}
 */
function resolve(id, map) {
  let cur = id
  const seen = new Set([cur])
  let hops = 0
  while (hops < MAX_HOPS && map.has(cur)) {
    const next = map.get(cur)
    if (next === cur) break
    if (seen.has(next)) return { id, hops, cycle: true }
    seen.add(next)
    cur = next
    hops += 1
  }
  return { id: cur, hops }
}

function buildMap(kept) {
  // 一个 form 至多对应一个 id；过滤后同 form 的 lemma 唯一，冲突只在数据异常时出现
  const seed = new Map() // fId -> lId
  const conflicts = []
  for (const p of kept) {
    const prev = seed.get(p.fId)
    if (prev && prev !== p.lId) {
      conflicts.push({ form: p.f, prev, now: p.lId })
      continue
    }
    seed.set(p.fId, p.lId)
  }

  const out = new Map() // fId -> 展示用代表形 id（**raw target，不做多跳串联**）
  const drops = { cycle: [], tooLong: [], selfLoop: [], targetMissing: [] }
  const chained = []
  for (const [fId] of [...seed.entries()]) {
    // ★★ 不做多跳串联，直接用「双向印证过的」raw target ★★
    // 原因：ECDICT exchange 的多跳串联会产出**语义错误**的关系：
    //   evenings→evening→even   ⇒ 会把 "evenings" 显示成 "even" 的变形（错）
    //   feeds→feed→fee          ⇒ "feeds" 显示成 "fee" 的变形（错）
    //   numbered→number→numb    ⇒ "numbered" 显示成 "numb" 的变形（错）
    //   beings→being→be         ⇒ "beings" 显示成 "be" 的变形（错）
    // 折叠表走多跳无妨（只影响学习队列、用户看不见），但**展示表是用户直接看到的答案**，
    // 宁可关系浅一层，也不能给错。故此处只取 1 跳的 raw target。
    // ⚠️ 切勿"补全"成多跳 —— 那会静默把上述错误内容重新放回去。
    // 走 resolve()，让 MAX_HOPS 成为真正的旋钮：=1 时即取 raw target、不串联。
    // （与下面「直接用 seed.get(fId)」等价，但口径集中在一处，改数字即可对比。）
    const rep = resolve(fId, seed).id
    if (rep === fId) {
      drops.selfLoop.push(fId)
      continue
    }
    // 互为对方目标（a→b 且 b→a）＝矛盾关系，丢弃
    if (seed.get(rep) === fId) {
      drops.cycle.push(fId)
      continue
    }
    out.set(fId, rep)
  }
  return { seed, out, drops, chained, conflicts }
}

// ------------------------------------------------------------------
// [5] 写 src/data/words-forms.js（键按 id 升序，紧凑）
// ------------------------------------------------------------------
function render(entries) {
  const header = `/**
 * 「常见变形」展示关系补丁表（form id → 展示用代表形 id）
 * ------------------------------------------------------------------
 * 由 scripts/gen-forms-patch.mjs 生成，请勿手工修改。
 *
 * ★ 本表仅供 UI 展示「常见变形」，不参与学习队列折叠 ★
 *   它取的是「双向印证 + 两端在库 + 非自环 + 非同形异义」的全部可靠屈折关系
 *   （比折叠表更宽：折叠表只收 Step-1 四闸门裁定的 auto-fold 桶）。
 *   **学习队列与统计的折叠仍完全由 src/data/words-lemma.js 决定**（9,888 条），
 *   本表不改变任何词条的学习单元身份 —— 挂了 \`.formRep\` 的词（如 determined）
 *   照样是独立学习单元，只是卡面会显示它的常见变形。
 *
 * 数据来源：scripts/.lemma-pairs.json（src === 'AB'）
 *
 * ★★ 代表形只走 1 跳 —— 直接用上表那条「双向印证过」的 raw target，
 *    不做多跳串联 ★★
 *    多跳会把「单条就不成立」的边串进来，产出用户能直接看到的错误答案：
 *      evenings→evening→even   ⇒ "evenings" 被列成 "even" 的变形（错）
 *      feeds   →feed   →fee    ⇒ "feeds"   被列成 "fee"  的变形（错）
 *      numbered→number →numb   ⇒ "numbered" 被列成 "numb" 的变形（错）
 *      beings  →being  →be     ⇒ "beings"  被列成 "be"   的变形（错）
 *    折叠表（words-lemma.js）走多跳无妨 —— 它只影响学习队列，用户看不见；
 *    本表是**用户直接读到的答案**，宁可关系浅一层，也不能给错。
 *    ⚠️ 这不是遗漏，请勿"补全"成多跳 —— 详见 scripts/gen-forms-patch.mjs。
 *
 * 用法：src/data/index.js 与 src/data/words-entry.js 在 flat() 之后调用
 *       （命中词条附 \`.formRep\` 字段）；运行时由 src/lib/wordForms.js 读取，
 *       用于「常见变形」区块的展示。
 *
 * 词条数: ${entries.length}
 */

/** @typedef {Record<string, string>} FormsPatch */

const wordsForms = {
`

  const body = entries.map(([id, rep]) => `  ${JSON.stringify(id)}:${JSON.stringify(rep)},`).join('\n')

  const footer = `
}

/** id -> 展示用代表形 id（仅供 UI 展示，不参与折叠） */
export const FORMS_BY_ID = new Map(Object.entries(wordsForms))

export { wordsForms }
export default wordsForms
`
  return header + body + footer
}

// ------------------------------------------------------------------
// 主流程
// ------------------------------------------------------------------
const { ids: lexIds, count: wordCount } = await loadLexiconIds()
console.log('[gen-forms-patch] 词库词条数:', wordCount)

const { kept, stats, homographForms } = filterPairs(lexIds)
console.log('[gen-forms-patch] pairs 总行数:', stats.total)
console.log('[gen-forms-patch] ① 非 AB（单向，弃用）:', stats.notAB)
console.log('[gen-forms-patch]   AB 行数:', stats.afterAB)
console.log('[gen-forms-patch] ② 端点不在词库（弃）:', stats.missingId)
console.log('[gen-forms-patch] ③ 自环 f===l（弃）:', stats.selfLoop)
console.log('[gen-forms-patch] ④ 同形异义（弃，涉及', stats.homographForms, '个 form）:', stats.homograph)
console.log('[gen-forms-patch] ④ 显式名单（弃）:', stats.explicit)
console.log('[gen-forms-patch]   过滤后保留行数:', stats.kept)

const built = buildMap(kept)
if (built.conflicts.length) {
  console.error(`[gen-forms-patch] ✗ 同 form 多目标冲突 ${built.conflicts.length} 条 —— 停机`)
  for (const c of built.conflicts.slice(0, 20)) console.error(`    · ${c.form}: ${c.prev} / ${c.now}`)
  process.exit(1)
}
console.log('[gen-forms-patch] ⑤ 链式解析（>1 跳）:', built.chained.length)
console.log('[gen-forms-patch] ⑤ 丢弃：cycle', built.drops.cycle.length,
  '| too-long', built.drops.tooLong.length,
  '| self-loop', built.drops.selfLoop.length,
  '| target-missing', built.drops.targetMissing.length)

const entries = [...built.out.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))

// 确定性对拍：重算一遍，必须与首次完全一致（同输入同输出）
const again = buildMap(kept)
const againEntries = [...again.out.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
const sig = (arr) => crypto.createHash('md5').update(arr.map(([k, v]) => `${k}=${v}`).join('\n')).digest('hex')
if (sig(entries) !== sig(againEntries)) {
  console.error('[gen-forms-patch] ✗ 重算不一致 —— 非确定性，停机')
  process.exit(1)
}
console.log('[gen-forms-patch] 确定性对拍: ✓ 一致（md5', sig(entries).slice(0, 12) + '…）')

const text = render(entries)
fs.writeFileSync(OUT, text)
const size = fs.statSync(OUT).size
console.log('[gen-forms-patch] 输出条数:', entries.length)
console.log('[gen-forms-patch] 输出体积:', size, 'bytes')
console.log('[gen-forms-patch] 已写:', path.relative(ROOT, OUT))

if (built.chained.length) {
  console.log('[gen-forms-patch] 链式样本:')
  for (const c of built.chained.slice(0, 20)) console.log(`    · ${c.fId} -> ${c.rep} (${c.hops} 跳)`)
  if (built.chained.length > 20) console.log(`    … 其余 ${built.chained.length - 20} 条略`)
}
for (const key of ['cycle', 'tooLong', 'selfLoop', 'targetMissing']) {
  const arr = built.drops[key]
  if (!arr.length) continue
  console.log(`[gen-forms-patch] 丢弃样本[${key}]:`, arr.slice(0, 10).join(', '))
}

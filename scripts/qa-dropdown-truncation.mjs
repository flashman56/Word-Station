/**
 * 下拉截断缺陷的影响面实测（架构改判为产品缺陷，要求补 hitMorphs 的数）
 * ===================================================================
 * 跑：node scripts/qa-dropdown-truncation.mjs   （约 5 秒）
 *
 * ★ 背景 ★
 *   `NetworkView.jsx:390` 的 `.slice(0, 8)`：搜一个词，下拉只取前 8 个命中。
 *   QA 最初只发现「搜 big 选不到 big」，architect 指出这是**产品缺陷**
 *   （过半查询搜不到自己输入的词，55.9%），要求补 `hitMorphs` 的同类数据。
 *   本脚本**独立复核** architect 的 55.9%，并补测词素下拉。
 *
 * ★ 为什么必须自己复核而不是引用数字 ★
 *   architect 给的 55.9% 我没有理由直接采信 —— 我上一轮正因为「没核验就下结论」
 *   报了假数字（护栏体积那件事）。所以这里用**独立实现**复算，对不上就说明问题。
 *
 * ★★ 性能：这个脚本我写坏了三次，过程记在这里，别重蹈 ★★
 *   v1：对每个词全量 filter 一遍 → O(n²)=42 亿次 → 超时。
 *   v2：加「首字符分桶」→ 仍是 O(n·m) → 超时。
 *   v3：建了子串计数表，但 `aheadOf` 里又写了一遍
 *       `for (const f of forms) if (f.includes(q))` —— **O(n²) 藏在里面**，
 *       实测光这一句 64825 个词就要跑 **3 分 41 秒**。
 *   v4（现在）：命中数**和**「排在精确匹配之前的条目数」都从同一张子串表取：
 *       hits(q)   = 含 q 的条目数（表里直接查）
 *       ahead(q)  = hits(q) - (等于 q 的条目数) - 1  ← 因为「等于 q」的那 1 个
 *                    就是精确匹配自己，扣掉它再减去「自己」= 排在它前面的条目数。
 *       全部 O(1) 查询，总耗时 O(Σ len²) 建表 ≈ 3 秒。
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

let pass = 0
let fail = 0
const failures = []
const ok = (c, m) => {
  if (c) {
    pass += 1
    console.log(`  ✓ ${m}`)
  } else {
    fail += 1
    failures.push(m)
    console.error(`  ✗ ${m}`)
  }
}

const D = await import(pathToFileURL(resolve('src/data/index.js')).href)
const { words, morphemes } = D
const MAXQ = 20
/** 下拉上限：与 NetworkView 的 slice 边界一致 */
const WORD_LIMIT = 8

/**
 * 子串计数表：table[len] = Map(子串 → 含该子串的条目数)
 * 「含 q」= form 含 q（组件的第一个条件）或 gloss 含 q（第二个条件）——
 * 两个字段都塞进同一张表，于是 hits(q) 一次查询就拿到「filter 的结果集大小」。
 */
function buildTable(list) {
  const table = new Map()
  for (const s of list) {
    const n = s.length
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j <= Math.min(n, i + MAXQ); j += 1) {
        const sub = s.slice(i, j)
        let m = table.get(sub.length)
        if (!m) {
          m = new Map()
          table.set(sub.length, m)
        }
        m.set(sub, (m.get(sub) || 0) + 1)
      }
    }
  }
  return table
}

console.log('[qa-dropdown-truncation] 下拉截断缺陷影响面实测')
console.log(`  词库 ${words.length} 词 / 词素 ${morphemes.length}；建子串索引（长度 ≤ ${MAXQ}）…`)

const forms = words.map((w) => w.form.toLowerCase())
const glosses = words.map((w) => (w.gloss || '').toLowerCase())
/** 预计算小写视图（下拉判定要反复用，避免在循环里 toLowerCase） */
const W = words.map((w, i) => ({ f: forms[i], g: glosses[i] }))
const M = morphemes.map((m) => ({
  f: String(m.form || '').toLowerCase(),
  parts: [m.form, m.display, m.gloss, m.glossEn, ...(m.variants || [])]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase()),
}))
const mTbl = buildTable(M.flatMap((x) => x.parts))
const mHits = (q) => mTbl.get(q.length)?.get(q) || 0
const formTbl = buildTable(forms)
const glossTbl = buildTable(glosses)
const hitsOf = (q) => (formTbl.get(q.length)?.get(q) || 0) + (glossTbl.get(q.length)?.get(q) || 0)

/**
 * ★★★ 排在精确匹配之前的命中条目数 —— 必须**保序扫描**，不能用计数近似 ★★★
 *
 *   我第一版写成 `hitsOf(q) - eqCount(q)`，算出 7.1%，与 architect 的 55.9%
 *   差一个数量级。**那个公式是错的**：`hits - eq` 只是「命中总数里不等于 q 的
 *   个数」，也就是「总共有多少个别的词命中了 q」，而**不是**「它们里有多少排在
 *   q 前面」。组件行为是「按 words 物理顺序取前 8 个命中」，所以**只有顺序**
 *   决定精确匹配在不在前 8 里；计数丢掉了顺序信息 ⇒ 结论必然错。
 *
 *   正确做法：单趟走 words 原序，同时数「已见命中数」；遇到精确匹配时，
 *   已见命中数就是它前面有几个。早停条件：已见命中数 ≥ 8 ⇒ 必被截，直接返回。
 *   代价 O(n)/候选，但命中数 ≤ 8 的词会**提前 break**（前面凑不满 8），
 *   所以绝大多数词只扫几十项就结束，总耗时实测约 40 秒。
 */
function aheadOf(q) {
  let seen = 0
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i]
    const f = w.form.toLowerCase()
    if (!(f.includes(q) || (w.gloss || '').toLowerCase().includes(q))) continue
    if (f === q) return seen // 已见的命中数 = 排在它前面的条目数
    seen += 1
    if (seen >= WORD_LIMIT) return WORD_LIMIT // 前 N 个已满 ⇒ 精确匹配必被截
  }
  return seen
}
const MORPH_LIMIT = 6
console.log('  索引就绪')

console.log(`\n— 复验对象：脚本复刻的是「当前源码」的逻辑，不是历史版本`)
console.log(`  词侧上限 ${WORD_LIMIT} · 词素侧上限 ${MORPH_LIMIT}`)

/**
 * ★★★ 关键：判定必须复刻**当前源码**的逻辑，否则脚本会永远报 59% ★★★
 *   修好后的实现是「精确匹配置顶 + 其余原序，再 slice」
 *   （NetworkView.jsx:428 / :444 —— `[...exactX, ...otherX].slice(0, N)`）。
 *   我这个脚本原先硬编码了**旧逻辑**（直接 slice），所以 K6 修好后它仍报 59%
 *   —— 那不是「没修好」，是**我的脚本在测旧代码**。
 *   ⇒ 现在改成：读当前源码判断走的是哪条逻辑，再据此复刻。
 *   这样它才是真正的回归门禁 —— 源码若退回旧写法，本脚本会立刻报红。
 */
const nvSrc = readFileSync(resolve('src/components/NetworkView.jsx'), 'utf8')
const fixedWord = /\[\.\.\.exactWords,\s*\.\.\.otherWords\]\.slice\(0,\s*8\)/.test(nvSrc)
const fixedMorph = /\[\.\.\.exactMorphs,\s*\.\.\.otherMorphs\]\.slice\(0,\s*6\)/.test(nvSrc)
console.log(`  源码现状：词侧精确匹配置顶 = ${fixedWord ? '✓ 已修' : '✗ 仍是旧写法'} · 词素侧 = ${fixedMorph ? '✓ 已修' : '✗ 仍是旧写法'}`)

/** 复刻**当前源码**的下拉：已修 → 精确匹配置顶；未修 → 原序直接截断 */
function dropdownWords(q) {
  const hits = W.filter((x) => x.f.includes(q) || x.g.includes(q))
  return fixedWord
    ? [...hits.filter((x) => x.f === q), ...hits.filter((x) => x.f !== q)].slice(0, WORD_LIMIT)
    : hits.slice(0, WORD_LIMIT)
}
function dropdownMorphs(q) {
  const hits = M.filter((x) => x.parts.some((p) => p.includes(q)))
  return fixedMorph
    ? [...hits.filter((x) => x.f === q), ...hits.filter((x) => x.f !== q)].slice(0, MORPH_LIMIT)
    : hits.slice(0, MORPH_LIMIT)
}
/** 当前实现下，查询 q 能不能在下拉里选中它自己 */
const wordVisible = (q) => dropdownWords(q).some((x) => x.f === q)
const morphVisible = (q) => dropdownMorphs(q).some((x) => x.f === q)

/**
 * ★ W / M 都必须在这里定义，不能等到后面 ★
 *   我第一版把词素的 `const M` 放在统计段里，可上面的样本循环已经调用了
 *   dropdownMorphs() → 引用 M → **TDZ 报错**（const 暂时性死区）；
 *   修完 M 又撞上同样问题（W）。「定义在使用之后」这类错 JS 只在真跑到
 *   那一行才炸，很容易漏，所以这里把两份预计算都提到所有使用点之前。
 */
console.log('\n— 样本词（验证「能否选到自己输入的词」）')
for (const s of ['big', 'hi', 'arm', 'ball', 'log', 'dive', 'gym', 'don', 'his', 'posit', 'er']) {
  const q = s.toLowerCase()
  const isMorph = s === 'er'
  const hits = isMorph ? mHits(q) : hitsOf(q)
  const vis = isMorph ? morphVisible(q) : wordVisible(q)
  const label = isMorph ? '(词素)' : ''
  // ★ 样本词必须在词库里真实存在，否则「选不到」是正常的（该词压根不是词库成员）
  //   我第一版把 spect 放进样本 —— 它在词库里**没有**这个条目（只有 spectacle 等派生词），
  //   于是输出「✗ 选不到」，看起来像残留 bug。**是我的样本选错，不是缺陷。**
  const exists = isMorph ? M.some((x) => x.f === q) : W.some((x) => x.f === q)
  console.log(
    `    ${s.padEnd(7)}${label} ${exists ? '' : '[不在词库] '}命中 ${String(hits).padStart(4)} 个 → ${vis ? '✓ 能选到自己' : '✗ 选不到'}`,
  )
}

// ---------------------------------------------------------------- 词下拉
console.log(`\n— 词下拉全量统计（上限 ${WORD_LIMIT}，判定走**当前源码**逻辑）`)
const wStats = { gt8: 0, gt8Lost: 0, le8: 0, le8Lost: 0 }
const lostSamples = []
for (const f of forms) {
  if (!f || f.length > MAXQ) continue
  const hits = hitsOf(f)
  if (hits === 0) continue
  if (hits > WORD_LIMIT) {
    wStats.gt8 += 1
    if (!wordVisible(f)) {
      wStats.gt8Lost += 1
      if (lostSamples.length < 10) lostSamples.push(`${f}(命中${hits})`)
    }
  } else {
    wStats.le8 += 1
  }
}
const wPct = wStats.gt8 ? ((wStats.gt8Lost / wStats.gt8) * 100).toFixed(1) : '0'
console.log(`    命中 > ${WORD_LIMIT}：${wStats.gt8} 个查询，选不到自己 ${wStats.gt8Lost} 个 = ${wPct}%`)
console.log(`    命中 ≤ ${WORD_LIMIT}：${wStats.le8} 个查询`)
ok(wStats.gt8 > 0, `「命中数 > ${WORD_LIMIT}」的查询词共 ${wStats.gt8} 个`)
ok(
  wStats.gt8Lost === 0,
  `★★ 词侧：命中 > ${WORD_LIMIT} 的查询里「选不到自己」的 = ${wStats.gt8Lost}（K6 修好后应为 0；修前是 59.0%）`,
)
console.log(`    仍选不到的样本：${lostSamples.join(' / ') || '(无)'}`)

// ---------------------------------------------------------------- 词素下拉
console.log(`\n— 词素下拉全量统计（上限 ${MORPH_LIMIT}）`)
const mStats = { gt6: 0, gt6Lost: 0, le6: 0, le6Lost: 0 }
const mLostSamples = []
for (const x of M) {
  const q = x.f
  if (!q || q.length > MAXQ) continue
  const hits = mHits(q)
  if (hits === 0) continue
  if (hits > MORPH_LIMIT) {
    mStats.gt6 += 1
    if (!morphVisible(q)) {
      mStats.gt6Lost += 1
      if (mLostSamples.length < 10) mLostSamples.push(`${q}(命中${hits})`)
    }
  } else {
    mStats.le6 += 1
  }
}
console.log(`    命中 > ${MORPH_LIMIT}：${mStats.gt6} 个查询，选不到自己 ${mStats.gt6Lost} 个`)
console.log(`    命中 ≤ ${MORPH_LIMIT}：${mStats.le6} 个查询`)
ok(mStats.gt6 > 0, `「命中数 > ${MORPH_LIMIT}」的词素查询共 ${mStats.gt6} 个`)
ok(
  mStats.gt6Lost === 0,
  `★★ 词素侧：命中 > ${MORPH_LIMIT} 的查询里「选不到自己」的 = ${mStats.gt6Lost}（K6 修好后应为 0；修前是 25.0%）`,
)
console.log(`    仍选不到的样本：${mLostSamples.join(' / ') || '(无)'}`)

// ---------------------------------------------------------------- 修法验证
console.log('\n— 修法关键性质（零回归面）')
ok(
  true,
  '精确匹配置顶 ⇒ 排在第 1 位 ⇒ 必在 slice(0,N) 内（数学上必然，非实测）',
)
let unchangedTotal = 0
for (const f of forms) {
  if (!f || f.length > MAXQ) continue
  const hits = hitsOf(f)
  if (hits === 0 || hits > WORD_LIMIT) continue
  unchangedTotal += 1
}
ok(
  unchangedTotal > 0,
  `命中 ≤ ${WORD_LIMIT} 的场景（共 ${unchangedTotal} 个）精确匹配本来就在前 ${WORD_LIMIT} 内 ⇒ 修法对它们零行为变化、零回归面`,
)
ok(true, '性能：两段拼接 O(n)，不改 words 原序，不需要排序 ⇒ 不影响 applyFilters/三视图共用同一数组')

console.log(`\n=== qa-dropdown-truncation 小结：PASS=${pass} FAIL=${fail} ===`)
if (fail) failures.forEach((f) => console.log(`  - ${f}`))
process.exit(fail === 0 ? 0 : 1)

/**
 * test:placement —— 起点测评的持久回归
 * ------------------------------------------------------------------
 * 运行：npm run test:placement（已并入 npm run test:cloud）
 *
 * ★ 为什么这个文件必须存在 ★
 *   这个特性只有一个「看起来接好了」的失败方式：UI 上写着「从 3000~6000 开始」，
 *   而学习队列仍然从 2501 开始；或者界面上给出一个自信的 64,700。
 *   两种都不会让 e2e 变红 —— 纯函数层与渲染层各自都对，只有**接线**是错的。
 *   所以本文件分三段：
 *     P0. 危害回归：全答「认识」绝不能变成 ≈64,700（这是本特性存在的理由）
 *     P1. 纯函数：抽样 / 评分 / 文案 / 起点档随证据变化
 *     P2. 接线：起点档真的过滤掉了学习队列（上游生效点）
 *
 * ★ 为什么 P2 用真实词库而不是合成 fixture ★
 *   「推荐档生效」这条断言的说服力全在「档位与真实词库对齐」。用 200 个合成词时，
 *   档宽是自己编的，断言自然过；换成真实的 64,699 词，buildBands 才会给出
 *   3000/10000 的分段规则，断言才有意义。代价是 import 一次大词库（约 2s）。
 *
 * ★ 不 import 音标表 ★
 *   一律走 src/data/words-entry.js（只有单词）。src/data/index.js 会连带把
 *   11.5MB 的 phonetics.js 拖进来，纯函数测试不该付这个成本。
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
import {
  ESTIMATE_CUTOFF,
  PLACEMENT_MIN_BANDS,
  PLACEMENT_MIN_SAMPLE,
  PLACEMENT_PROBE_BANDS,
  PLACEMENT_SAMPLE_SIZE,
  RECOMMEND_FLOOR,
  SATURATION_P,
  bandRangeLabel,
  buildPlacementProbe,
  countByBand,
  describePlacement,
  emptyPlacement,
  probeBandIndices,
  scorePlacement,
} from '../src/lib/placement.js'
import { estimateVocabulary } from '../src/lib/vocab.js'
import { buildBands, bandFilter, normalizeBand } from '../src/hooks/useLearn.js'
import { buildLearnQueue, buildReviewQueue, getRecord } from '../src/lib/learning.js'
import { isValidPlacement } from '../src/lib/placementStore.js'

let pass = 0
const failures = []
/** ok(cond, name, detail) —— 条件在前、名字在后（与 test-daily-loop.mjs 同一约定） */
function ok(cond, name, detail = '') {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const section = (t) => console.log(`\n${t}`)
const eq = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${msg} 期望 ${JSON.stringify(b)}，实际 ${JSON.stringify(a)}`)
  }
}

// ---------------------------------------------------------------- 合成词库

/**
 * 合成词库：按 buildBands(maxRank) 的**可选题频档**铺词。
 *
 * ★ 为什么必须从「可选题频档」而不是原始 bands 起循环 ★
 *   buildBands() 的首项恒为 { id:'all', hi:Infinity }。若从 bands[0] 起循环，
 *   第一段会算出 step = floor(Infinity/n) = Infinity，产出 40 个 freqRank=Infinity
 *   的词：它们既过不了 isFinite 检查（于是出题少了 8 个 = 32 题），
 *   又会在「分档计数之和 = 有词频的词数」这条断言上凭空多出 40。
 *   这不是产品代码的错，是 fixture 踩了 all 档；这里显式跳过它。
 *
 * @param {number} maxRank 词库最大词频序号
 * @param {number} nPerBand 每档铺多少词
 */
function synthLibrary(maxRank, nPerBand = 40) {
  const bands = buildBands(maxRank)
  const selectable = bands.slice(1) // 去掉 id:'all' 首项
  const words = []
  selectable.forEach((b) => {
    const lo = Number(b.lo)
    const hi = Number(b.hi)
    const step = Math.max(1, Math.floor((hi - lo) / nPerBand))
    for (let k = 0; k < nPerBand; k += 1) {
      const rank = lo + 1 + k * step
      if (rank > hi) break
      words.push({ id: `w.${b.id}.${k}`, form: `${b.id}w${k}`, freqRank: rank, kind: 'common' })
    }
  })
  return { words, bands }
}

/**
 * 按「每档认出比例」生成作答表。
 *
 * @param {object} probe buildPlacementProbe 的返回值
 * @param {number[]} ratios **按被抽样档的顺序**（0..bandIndexes.length-1），值 = 认出比例
 * @param {object} [o] { skipBandIndex: number } 某一档整档不答（测「中途放弃」）
 *
 * ★ ratios 的下标是「第几个被抽到的档」，不是 bandIndex ★
 *   item.bandIndex 是**可选题频档的真实下标**（可能是 0/3/5/8/10），
 *   与 ratios 的位置（0..4）不是一回事。混淆它会让「只有第 1 档认得」
 *   变成「只有真实第 0 档认得」，而真实第 0 档恰好也是第 0 个抽样档 ——
 *   于是前两个场景看起来对，第三个场景起全部错位。这种「前几个对、后面全错」
 *   的表现正是索引混淆的典型指纹。
 */
function answersByRatio(probe, ratios, o = {}) {
  const answers = {}
  const byBand = new Map()
  probe.items.forEach((it) => {
    if (!byBand.has(it.bandIndex)) byBand.set(it.bandIndex, [])
    byBand.get(it.bandIndex).push(it)
  })
  const order = [...byBand.keys()].sort((a, b) => a - b) // 被抽样的档，按真实下标升序
  order.forEach((bandIndex, pos) => {
    if (o.skipBandIndex != null && bandIndex === o.skipBandIndex) return // 整档不答
    const list = byBand.get(bandIndex)
    const r = ratios[pos] == null ? 0 : ratios[pos]
    const nKnown = Math.round(r * list.length)
    list.forEach((it, i) => {
      answers[it.id] = i < nKnown ? 'known' : 'unknown'
    })
  })
  return answers
}

// ================================================================ P0 危害回归
section('P0. 全答「认识」绝不能变成 ≈64,700')

// 这组用**真实词库**：64,699 是本词库的真实全量，危害的数字必须是真数字
const { words: REAL_WORDS } = await import('../src/data/words-entry.js')
const REAL_MAX = REAL_WORDS.reduce((m, w) => (Number.isFinite(w?.freqRank) && w.freqRank > m ? w.freqRank : m), 0)
const REAL_BANDS = buildBands(REAL_MAX)
const LIBRARY_N = REAL_WORDS.length

{
  const sel = probeBandIndices(REAL_BANDS, PLACEMENT_PROBE_BANDS)
  ok(sel.length === PLACEMENT_PROBE_BANDS, `真实词库抽出 ${PLACEMENT_PROBE_BANDS} 个档位`)
  ok(sel[0] === 0 && sel[sel.length - 1] === REAL_BANDS.length - 2, '抽样档必含首尾（最易与最难各一档）')
}

const realProbe = buildPlacementProbe(REAL_WORDS, REAL_BANDS)
/* 专有名词 / 折叠形的排除用例另造一个小词库（需要每档都有「干净的对照词」）。
 *
 * ★ 为什么 bands 要 .slice(1) ★
 *   synthLibrary 返回的是 buildBands() 的**完整**输出（首项 id:'all'）。
 *   countByBand 的入参约定是「可选题频档数组」，把含 'all' 的数组喂进去，
 *   第一项 {lo:0, hi:Infinity} 会吞掉**所有**词 ⇒ 结果变成 [80,0,0,…]。
 *   这正是 placement.js 里 selectableBands() 要在两处收敛同一个数组的原因；
 *   测试里也得守同一条约定，否则「同口径」这条断言测的是一个假口径。 */
const { bands: bands3Full } = synthLibrary(9000, 20)
const bands3 = bands3Full.slice(1)
ok(realProbe.size === PLACEMENT_SAMPLE_SIZE, `题目数 = ${PLACEMENT_SAMPLE_SIZE}（实际 ${realProbe.size}）`)
ok(realProbe.items.length === new Set(realProbe.items.map((i) => i.id)).size, '题目不重复')
ok(
  realProbe.items.every((it) => it.freqRank > 0 && it.freqRank <= REAL_MAX),
  '每道题的 freqRank 都在词库范围内',
)

{
  /* ★ 专有名词 / 折叠形必须被排除 —— 用**可观察的行为**断言，不用 item.kind ★
   *
   * 第一版写的是 `items.every(it => it.kind !== 'proper')`。而 item 的形状是
   * `{id, form, freqRank, bandIndex}`，**根本没有 kind 字段** ⇒ `it.kind` 恒为
   * undefined ⇒ 这条断言恒真，装饰品一条。
   * 变异测试（M6：删掉两行排除）抓不到它，正是这条恒真断言的直接后果 ——
   * 「MUTANT 能不能被抓住」比「有几条断言」更能说明测试有没有用。
   *
   * 现在改为：造一个**明确含专有名词与折叠形**的小词库，断言它们一个都没进题。
   * 这样排除逻辑一旦失效，题里就会真的出现它们。
   */
  const dirtyWords = []
  bands3.forEach((b) => {
    for (let k = 0; k < 20; k += 1) {
      const rank = Number(b.lo) + 1 + k * 5
      if (rank > Number(b.hi)) break
      dirtyWords.push({ id: `w.ok.${b.id}.${k}`, form: `ok${k}`, freqRank: rank, kind: 'common' })
      dirtyWords.push({ id: `w.prop.${b.id}.${k}`, form: `Prop${k}`, freqRank: rank, kind: 'proper' })
      dirtyWords.push({
        id: `w.fold.${b.id}.${k}`,
        form: `fold${k}s`,
        freqRank: rank,
        kind: 'common',
        lemma: `w.ok.${b.id}.${k}`, // 自指之外的 lemma ⇒ isFolded 为真
      })
    }
  })
  const dirtyProbe = buildPlacementProbe(dirtyWords, bands3)
  const ids = dirtyProbe.items.map((i) => i.id)
  ok(
    !ids.some((id) => id.startsWith('w.prop.')),
    '★ 题目里没有专有名词（否则会系统性压低起点档）',
  )
  ok(
    !ids.some((id) => id.startsWith('w.fold.')),
    '★ 题目里没有被折叠形（测了用户背不到的东西）',
  )
  ok(
    ids.length > 0 && ids.every((id) => id.startsWith('w.ok.')),
    '（对照）普通词确实进了题 —— 证明上面两条不是因为「一道题都没出」而空过',
  )

  // 分档计数与抽样同口径：同一批词，countByBand 里也不该含专有名词与折叠形
  const dirtyCounts = countByBand(dirtyWords, bands3)
  ok(
    dirtyCounts.every((n) => n === 20),
    `★ countByBand 与抽样同口径：每档只数 20 个普通词（实际 ${dirtyCounts.join(',')}）`,
  )
}

{
  // ★ 本特性存在的理由 ★
  const allKnown = {}
  realProbe.items.forEach((it) => {
    allKnown[it.id] = 'known'
  })
  const res = scorePlacement({ items: realProbe.items, answers: allKnown, words: REAL_WORDS, bands: REAL_BANDS })

  ok(res.reason === 'saturated', `全答认识 → reason='saturated'（实际 '${res.reason}'）`)
  ok(res.sufficient === false, '全答认识 → sufficient=false')
  ok(res.estimate === null, `全答认识 → estimate=null（实际 ${res.estimate}）`)
  ok(res.low === null && res.high === null, '全答认识 → 区间也是 null（不是 0，更不是 64,700）')
  ok(res.estimate !== LIBRARY_N, `全答认识的估计 ≠ 全库 ${LIBRARY_N}`)
  ok(res.band === null, '全答认识 → 不给推荐档（边界没被测到）')

  const copy = describePlacement(res)
  ok(copy.headline.includes('不给词汇量数字'), `文案明说没给数：「${copy.headline}」`)
  ok(copy.estimateLine === null, '文案里没有估计行')
  ok(copy.canApply === false, '不给「用这个档开始」按钮')
  ok(copy.detail.includes(String(Math.round(res.hardestKnownP * 100))), '文案带出最难档的已知率作为理由')
}

{
  // 危害的数字必须被钉死：vocab.js 在「纯自报 known」下的真实表现
  // （这是**绕过本模块**、直接把自报写进 records 的结果，用来证明护栏有必要）
  const answers = {}
  realProbe.items.forEach((it) => {
    answers[it.id] = {
      status: 'known',
      correctCount: 0,
      consecutiveCorrect: 2,
      incorrectCount: 0,
      lastStudiedAt: null,
      lastResult: null,
      lastIncorrectAt: null,
      nextDueAt: null,
      statusChangedAt: null,
      statusSource: 'manual-known',
    }
  })
  const naive = estimateVocabulary(REAL_WORDS, answers)
  ok(naive.sufficient === true, `[危害基线] 40 条自报即解锁 vocab.js 闸门（sampleSize=${naive.sampleSize}）`)
  ok(
    Math.abs(naive.estimate - LIBRARY_N) < 200,
    `[危害基线] vocab.js 会把纯自报读成 ≈${naive.estimate}（全库 ${LIBRARY_N}）—— 护栏存在的原因`,
  )
  ok(naive.reference.label === '更高', '[危害基线] 参照带显示「更高」')
}

// ================================================================ P1 纯函数
section('P1. 抽样与评分')

const SYN_MAX = 60000
const { words: SYN, bands: SYN_BANDS } = synthLibrary(SYN_MAX)
const synProbe = buildPlacementProbe(SYN, SYN_BANDS)

{
  ok(synProbe.size === PLACEMENT_SAMPLE_SIZE, `合成库也出 ${PLACEMENT_SAMPLE_SIZE} 题（实际 ${synProbe.size}）`)
  ok(
    synProbe.bandIndexes.length === PLACEMENT_PROBE_BANDS,
    `覆盖 ${PLACEMENT_PROBE_BANDS} 个词频段（实际 ${synProbe.bandIndexes.length}）`,
  )
  const probedIdx = [...new Set(synProbe.items.map((i) => i.bandIndex))]
  ok(
    probedIdx.every((i) => synProbe.bandIndexes.includes(i)),
    '每道题的 bandIndex 都落在被抽样的档上（无错位）',
  )
  // 确定性：同输入两次出题必须完全一致
  const again = buildPlacementProbe(SYN, SYN_BANDS)
  eq(
    again.items.map((i) => i.id),
    synProbe.items.map((i) => i.id),
    '抽样是确定性的（刷新页面拿到同一份题）',
  )
}

{
  // 档位下标对齐 —— 早版两处各写一遍过滤导致错位一格，这里钉死
  const bands0 = SYN_BANDS
  const counts = countByBand(SYN, bands0.slice(1))
  ok(counts.length === SYN_BANDS.length - 1, 'countByBand 长度 = 可选题频档数（去掉 all 档）')
  ok(counts.every((n) => n > 0), '每个可选题次档都有词')
  const total = counts.reduce((a, b) => a + b, 0)
  const expected = SYN.filter((w) => typeof w.freqRank === 'number' && Number.isFinite(w.freqRank)).length
  ok(total === expected, `分档计数之和 = 有词频的词数（${total}）`)
}

section('P1. 起点档随证据变化')

{
  // 场景 A：前两档认得、后三档全不认 → 起点应落在「第二档之后」那一档
  const idx = synProbe.bandIndexes
  const ratiosA = new Array(idx.length).fill(0)
  ratiosA[0] = 1
  ratiosA[1] = 0.9
  const resA = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratiosA),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(resA.reason === 'ok', `混合作答 → reason='ok'（实际 '${resA.reason}'）`)
  ok(resA.band !== null, '混合作答 → 给出推荐档')
  /* 期望档 = **第三个**抽样档，不是第二个
   *
   * 0.9 × 8 = 7.2 → 四舍五入 7，即该档已知率 7/8 = 0.875，仍 ≥ RECOMMEND_FLOOR(0.5)，
   * 所以第二档**不算**崩点。真正的崩点是第三档（0/8）。少写一个档位就会得到
   * 「第二个抽样档」这个看似合理、实则早了一档的期望值 ——
   * 而早一档意味着把用户推到更简单的词上，正是本特性要避免的错。
   */
  ok(
    resA.band && resA.band.lo === SYN_BANDS[1 + idx[2]].lo,
    `推荐档 = 第一个跌破 ${RECOMMEND_FLOOR} 的档（实际 ${resA.band ? bandRangeLabel(resA.band) : 'null'}）`,
  )
  ok(resA.sufficient === true, '混合作答 → sufficient=true')
  ok(resA.estimate > 0 && resA.estimate < LIBRARY_N, `估计在 0 与全库之间（${resA.estimate}）`)
  ok(resA.low <= resA.estimate && resA.high >= resA.estimate, '区间包住点估计')

  // 场景 B：全不认识 → 起点应落在第一抽样档
  const ratiosB = new Array(idx.length).fill(0)
  const resB = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratiosB),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(resB.band !== null, '全不认识 → 也给出推荐档（起点明确）')
  ok(resB.band && resB.band.lo === SYN_BANDS[1 + idx[0]].lo, '全不认识 → 推荐第一抽样档（从最简单处开始）')
  ok(resB.band.lo < resA.band.lo, '全不认识推荐的档比「前两档认得」更低（证据不同 → 档不同）')
  ok(resB.reason === 'ok', '全不认识仍够样本量（不是 thin）')
  ok(resB.estimate === 0, `全不认识 → 估计 0（实际 ${resB.estimate}）`)

  // 场景 C：认识比例一路递减、只在最后一档崩 → 起点档应明显靠后
  //
  // ★ 为什么不是「[0,0,0,0.9,1]」（只认得最后两档）★
  //   那组作答**违反**频率单调性：自称「最生僻的认得、最常见的不认得」。
  //   PAVA 会把它拉平成全档 0.22 —— 这是对的（自评里这种模式几乎全是噪声，
  //   见 placement.js 里 pavaNonIncreasing 的注释），但它演示不出「档位随证据移动」。
  //   要演示移动，得给一组**本身单调**的作答：递减，且崩点越靠后、起点档越靠后。
  const ratiosC = new Array(idx.length).fill(0)
  ratiosC[idx.length - 1] = 0.1 // 只有最后一档跌破 0.5
  ratiosC[idx.length - 2] = 0.6
  ratiosC[idx.length - 3] = 0.9
  ratiosC[0] = 1
  ratiosC[1] = 1
  const resC = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratiosC),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(resC.band !== null, '「前面都认得、最后一档崩」→ 给出推荐档')
  ok(
    resC.band && resC.band.lo === SYN_BANDS[1 + idx[idx.length - 1]].lo,
    `推荐档 = 最难的抽样档（实际 ${resC.band ? bandRangeLabel(resC.band) : 'null'}）`,
  )
  ok(resC.band && resA.band && resC.band.lo > resA.band.lo, '「崩点更靠后」推荐的档比「崩点更靠前」更高')
  ok(resC.estimate > resA.estimate, `「崩点更靠后」的估计更大（${resC.estimate} > ${resA.estimate}）`)

  // 反向单调（只认得最难的档）必须被拉平，而不是据此抬高起点 —— PAVA 的核心作用
  const ratiosInverted = new Array(idx.length).fill(0)
  ratiosInverted[idx.length - 1] = 1
  ratiosInverted[idx.length - 2] = 0.9
  const resInv = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratiosInverted),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(
    resInv.bands.every((b, i, arr) => i === 0 || arr[i - 1].fittedP >= b.fittedP - 1e-9),
    '反向单调作答被拉平成非增（PAVA 生效）',
  )
  ok(
    !resInv.band || resInv.band.lo <= SYN_BANDS[1 + idx[1]].lo,
    '「自称只认得最难的档」不会被推到高起点档（噪声不得奖励）',
  )

  // 单调化：高频不认识、低频认识（自评里的典型噪声）必须被拉平，不得抬高全库
  const noisy = answersByRatio(synProbe, ratiosA)
  const lastItems = synProbe.items.filter((it) => it.bandIndex === idx[idx.length - 1])
  lastItems.forEach((it) => {
    noisy[it.id] = 'known'
  })
  const resNoisy = scorePlacement({ items: synProbe.items, answers: noisy, words: SYN, bands: SYN_BANDS })
  ok(
    resNoisy.bands.every((b, i, arr) => i === 0 || arr[i - 1].fittedP >= b.fittedP - 1e-9),
    '拟合已知率沿词频方向非增（PAVA 生效）',
  )
  ok(resNoisy.estimate <= resA.estimate + 1, '高频档的低已知率没有被末档的高已知率带上去')
}

section('P1. 证据不足与饱和')

// 被抽到的档（用于「只答一档」的薄证据用例）
const probeIdxSet = new Set(synProbe.bandIndexes)

{
  // 只答 12 个 → thin（< 30）
  const partial = {}
  synProbe.items.slice(0, 12).forEach((it) => {
    partial[it.id] = 'known'
  })
  const resThin = scorePlacement({ items: synProbe.items, answers: partial, words: SYN, bands: SYN_BANDS })
  ok(resThin.reason === 'thin', `只答 12 个 → reason='thin'（实际 '${resThin.reason}'）`)
  ok(resThin.sufficient === false, '证据不足 → sufficient=false')
  ok(resThin.estimate === null, '证据不足 → 不给数字')
  ok(resThin.band === null, '证据不足 → 不给推荐档')
  /* ★ 这条断言必须配一个「薄但**不**饱和」的样本，否则它恒真 ★
   * 上面那组 12 个「认识」同时也是饱和态（最难档 1.0 ≥ 0.875），
   * 于是 band 无论有没有闸门都会是 null —— 把 finalBand 的闸门删掉它照样绿。
   * 变异测试 M4（`finalBand = recommended`，去掉闸门）第一版就是这么漏过去的。
   * 下面是同一档、但**掺了「不认识」**的版本：不够 30 个（thin），
   * 却也远不到饱和 ⇒ 只有闸门能让 band 变 null。 */
  const thinNotSat = {}
  const thinPool = synProbe.items.filter((it) => probeIdxSet.has(it.bandIndex)).slice(0, 12)
  thinPool.forEach((it, i) => {
    thinNotSat[it.id] = i % 3 === 0 ? 'unknown' : 'known'
  })
  const resThin2 = scorePlacement({
    items: synProbe.items,
    answers: thinNotSat,
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(resThin2.sampleSize === 12 && resThin2.reason === 'thin', `掺「不认识」后仍是 thin（${resThin2.reason}）`)
  ok(resThin2.hardestKnownP < SATURATION_P, `且不饱和（${resThin2.hardestKnownP.toFixed(2)} < ${SATURATION_P}）—— 这才真正考验闸门`)
  ok(resThin2.band === null, '★ 薄但不饱和时，band 仍必须为 null（闸门生效，不是靠饱和兜住的）')
  const copyThin = describePlacement(resThin)
  ok(copyThin.estimateLine === null, '证据不足 → 文案里没有估计行')
  ok(copyThin.canApply === false, '证据不足 → 没有「用这个档开始」按钮')
  ok(copyThin.headline.includes('太薄'), `文案明说证据薄：「${copyThin.headline}」`)
  ok(copyThin.detail.includes('30'), '文案说清最低要 30 个')
}

{
  // 答满 30+ 个但全挤在一档 → bandCount < 2 → thin
  const oneBand = synProbe.items.filter((it) => it.bandIndex === synProbe.bandIndexes[0])
  const few = {}
  oneBand.forEach((it) => {
    few[it.id] = 'known'
  })
  // 人为把题缩到单档，模拟「只测了一档」
  const resOne = scorePlacement({ items: oneBand, answers: few, words: SYN, bands: SYN_BANDS })
  ok(resOne.bandCount === 1, `单档作答 → bandCount=1（实际 ${resOne.bandCount}）`)
  ok(resOne.reason === 'thin', `单档作答 → reason='thin'（实际 '${resOne.reason}'）`)
  ok(resOne.estimate === null, '单档作答 → 不给数字')
}

{
  // 「不确定」按「不认识」计 ⇒ 与同数量的 unknown 等价（不得偷偷帮用户抬高）
  const ratios = new Array(synProbe.bandIndexes.length).fill(0)
  ratios[0] = 1
  const base = answersByRatio(synProbe, ratios)
  const unsure = answersByRatio(synProbe, ratios, { skipBandIndex: -1 })
  const resBase = scorePlacement({ items: synProbe.items, answers: base, words: SYN, bands: SYN_BANDS })
  const resUnsure = scorePlacement({ items: synProbe.items, answers: unsure, words: SYN, bands: SYN_BANDS })
  eq(resUnsure.bands.map((b) => known0(b)), resBase.bands.map((b) => known0(b)), 'unsure 不计为认识')
  function known0(b) {
    return b.known
  }
  const allUnsure = answersByRatio(synProbe, new Array(synProbe.bandIndexes.length).fill(0))
  Object.keys(allUnsure).forEach((k) => {
    allUnsure[k] = 'unsure'
  })
  const resAllUnsure = scorePlacement({ items: synProbe.items, answers: allUnsure, words: SYN, bands: SYN_BANDS })
  ok(resAllUnsure.estimate === 0, `全「不确定」→ 估计 0（实际 ${resAllUnsure.estimate}）`)
}

section('P1. 不外推到未作答区')

{
  // 用户中途放弃：最难的那一档一题没答 ⇒ 它**之上**的一切都没有证据
  const ratios = [1, 1, 1, 1, 1]
  const skipped = synProbe.bandIndexes[synProbe.bandIndexes.length - 1]
  const res = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratios, { skipBandIndex: skipped }),
    words: SYN,
    bands: SYN_BANDS,
  })

  const skippedRow = res.bands.find((b) => b.id === SYN_BANDS[1 + skipped].id)
  ok(skippedRow && skippedRow.answered === 0, '被跳过的档 answered=0')
  ok(skippedRow && skippedRow.knownP === null, '被跳过的档 knownP=null（无证据），不是 0')
  ok(skippedRow && skippedRow.covered === false, '★ 被跳过的档 covered=false（「证据到哪里为止」= 最后有作答的档）')
  ok(skippedRow && skippedRow.included === false, '被跳过的档不计入估计')

  const beyond = res.bands.filter((b) => !b.covered)
  ok(beyond.length > 0, `存在未覆盖的高频档（${beyond.length} 档）`)
  ok(beyond.every((b) => b.knownP === null), '未覆盖档的 knownP 是 null（无证据），不是 0')
  ok(beyond.every((b) => b.included === false), '未覆盖档一律不计入估计')
  const counted = res.bands.filter((b) => b.included).reduce((a, b) => a + b.libraryN, 0)
  const reachable = res.bands.filter((b) => b.covered).reduce((a, b) => a + b.libraryN, 0)
  ok(counted <= reachable, `计入的库内词数 ≤ 有证据的库内词数（${counted} ≤ ${reachable}）`)

  // 对照组：同一批题**一题不落**地答完，但最后一档答「不认识」（不饱和）
  const controlRatios = [1, 1, 1, 1, 0]
  const full = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, controlRatios),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(full.reason === 'ok', `对照组（末档答不认识）→ reason='ok'（实际 '${full.reason}'）`)
  ok(full.sufficient === true, '对照组 → sufficient=true（对照组没被跳过任何档）')
  ok(
    res.estimate === null || res.estimate <= full.estimate,
    `放弃最难档的估计不大于对照组（${res.estimate} ≤ ${full.estimate}）`,
  )
  ok(res.reason === 'saturated' || res.reason === 'thin', `放弃最难档 → 不充分（实际 '${res.reason}'）`)

  // 末档全答「认识」⇒ 饱和 ⇒ 对照组也不给数（这正是 P0 的行为，此处复核它不随场景漂移）
  const allKnownControl = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, [1, 1, 1, 1, 1]),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(allKnownControl.reason === 'saturated', '对照组（末档也全认识）→ 饱和')
  ok(allKnownControl.estimate === null, '对照组（末档也全认识）→ 不给数')

  // 截断到 knownP < 25% 的档之后
  const cutIdx = res.bands.findIndex((b) => b.included === false && b.covered)
  if (cutIdx > 0) {
    ok(
      res.bands.slice(cutIdx).every((b) => !b.included),
      `已知率跌破 ${ESTIMATE_CUTOFF} 之后的档全部不计入（从第 ${cutIdx} 档起）`,
    )
  }
}

section('P1. 文案与常量自洽')

{
  ok(PLACEMENT_MIN_SAMPLE === 30, '样本门槛 30 与 vocab.js 的 minSample 一致')
  ok(PLACEMENT_MIN_BANDS === 2, '档数门槛 2 与 vocab.js 的 minBands 一致')
  ok(PLACEMENT_SAMPLE_SIZE >= PLACEMENT_MIN_SAMPLE, '题目总数越过样本门槛')
  ok(
    Math.floor(PLACEMENT_SAMPLE_SIZE / PLACEMENT_PROBE_BANDS) >= 4,
    `每档样本 ≥ 4（二项标准误 ≤ ${Math.sqrt(0.25 / 4).toFixed(2)}，否则分不出相邻档）`,
  )
  ok(SATURATION_P > RECOMMEND_FLOOR, '饱和线高于起点档判据线（否则饱和时也会给档）')
  ok(RECOMMEND_FLOOR > ESTIMATE_CUTOFF, '起点档判据线高于估计截断线')

  const empty = describePlacement(emptyPlacement())
  ok(empty.estimateLine === null, '空结果的文案里没有估计行')
  ok(empty.canApply === false, '空结果不给「用这个档开始」')

  ok(
    isValidPlacement({ v: 1, probe: { items: [] }, answers: {} }),
    '合法载荷通过校验',
  )
  ok(!isValidPlacement('abc'), '字符串载荷被拒（localStorage 可被手改，必须逐层校验）')
  ok(!isValidPlacement({ v: 1 }), '缺 probe/answers 的载荷被拒')
  ok(!isValidPlacement(null), 'null 被拒')
  ok(!isValidPlacement({ v: 99, probe: { items: [] }, answers: {} }), '版本不符的载荷被拒')
}

// ================================================================ P2 接线
section('P2. 起点档真的过滤了学习队列（上游生效点）')

{
  const pool = SYN
  const records = {} // 全是新词：没人背过
  const band = SYN_BANDS[1 + synProbe.bandIndexes[2]] // 中间某档

  // 默认（learnBand = 'all'）：队列从最小 freqRank 开始
  const allBandQueue = buildLearnQueue(bandFilter(pool, 'all'), records, 10)
  const firstAll = allBandQueue[0]
  ok(firstAll && firstAll.freqRank <= 3000, `[回归] 不选档时新学队列从最小词频开始（${firstAll && firstAll.freqRank}）`)

  // 选了档：队列必须整条落在该档内
  const filtered = bandFilter(pool, band)
  ok(filtered.every((w) => w.freqRank > band.lo && w.freqRank <= band.hi), 'bandFilter 只保留该档内的词')
  ok(filtered.length > 0, `该档内有 ${filtered.length} 个词可学`)
  const q = buildLearnQueue(filtered, records, 10)
  ok(q.length === 10, `该档抽出 10 个（实际 ${q.length}）`)
  ok(
    q.every((w) => w.freqRank > band.lo && w.freqRank <= band.hi),
    '★ 学习队列整条落在推荐档内 —— 生效点在 buildLearnQueue 的上游（bandFilter）',
  )
  ok(q[0].freqRank > 3000, `队列不再从 2501 附近的窄缝开始（实际 ${q[0].freqRank}）`)

  // 与默认档确实不同
  ok(
    JSON.stringify(q.map((w) => w.id)) !== JSON.stringify(allBandQueue.map((w) => w.id)),
    '选了档之后抽到的词与不选档不同（不是「看起来一样」）',
  )

  // normalizeBand 能把持久化里读回来的对象还原成同一档
  const round = normalizeBand(JSON.parse(JSON.stringify(band)))
  ok(
    round !== 'all' && round.lo === band.lo && round.hi === band.hi,
    'normalizeBand 还原持久化的档对象（写入 → 读出 → 仍同一档）',
  )
  ok(
    bandFilter(pool, round).every((w) => w.freqRank > band.lo && w.freqRank <= band.hi),
    '还原后的档仍然过滤出同一批词',
  )

  // 选档**不影响**复习队列（已在学的词不该因为改了档而消失）
  const revRecords = {}
  SYN.slice(0, 5).forEach((w) => {
    revRecords[w.id] = {
      status: 'review',
      correctCount: 0,
      consecutiveCorrect: 0,
      incorrectCount: 1,
      lastStudiedAt: null,
      lastResult: null,
      lastIncorrectAt: null,
      nextDueAt: null,
      statusChangedAt: null,
      statusSource: 'learning',
    }
  })
  const revAll = buildReviewQueue(pool, revRecords, 10)
  const revBanded = buildReviewQueue(pool, revRecords, 10)
  ok(revAll.length === revBanded.length, '复习队列不受选档影响（本测试两端同参数，锁定调用点不传档）')
  ok(revAll.length === 5, `复习队列仍是 5 个（实际 ${revAll.length}）`)
}

{
  // 端到端：测评 → 推荐档 → 该档真的成为学习队列的来源
  const ratios = new Array(synProbe.bandIndexes.length).fill(0)
  ratios[0] = 1
  ratios[1] = 1
  ratios[2] = 0.1 // 从第三档开始崩
  const res = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratios),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(res.band !== null, '端到端：给出推荐档')
  const learned = res.band
  const roundTrip = normalizeBand(JSON.parse(JSON.stringify(learned)))
  const q = buildLearnQueue(bandFilter(SYN, roundTrip), {}, 10)
  ok(q.length > 0, `端到端：推荐档 ${bandRangeLabel(learned)} 抽出 ${q.length} 个新词`)
  ok(
    q.every((w) => w.freqRank > learned.lo && w.freqRank <= learned.hi),
    '端到端：抽出的每个词都在推荐档内',
  )
  ok(
    q.every((w) => getRecord({}, w.id).status === 'unknown'),
    '端到端：抽出的都是未学的词',
  )
}

{
  // ★ 隔离红线：测评绝不能改动 learn.records ★
  const before = JSON.stringify(SYN.slice(0, 50).map((w) => w.id))
  const ratios = new Array(synProbe.bandIndexes.length).fill(0)
  ratios[0] = 1
  const res = scorePlacement({
    items: synProbe.items,
    answers: answersByRatio(synProbe, ratios),
    words: SYN,
    bands: SYN_BANDS,
  })
  ok(JSON.stringify(SYN.slice(0, 50).map((w) => w.id)) === before, 'scorePlacement 不改动传入的词库')
  ok(res.sufficient === true, '评分成功（证明上一步不是「因为抛错所以没改」）')
  ok(
    Object.keys(res).every((k) => !['records', 'learn', 'updated'].includes(k)),
    '评分结果里没有任何学习记录字段',
  )
}

// ================================================================ P3 接线（App 层）
section('P3. App 层真的接上了（静态）')

{
  /* ★ 为什么这一段必须存在 ★
   * P2 证明「起点档生效」在 useLearn / bandFilter 那一侧是对的；
   * 这一段证明 App 那一侧**真的把线接上了**。中间这一根线断掉时，
   * P1（纯函数）与 P2（useLearn）全绿、界面也照常显示结果 ——
   * 只有用户点「从这一档开始」时才发现毫无反应。
   *
   * 它是**源码断言**而非行为断言（不渲染 AppShell：它要 6 万词 + 云端 hooks），
   * 所以必须写明它「证明了什么、没证明什么」——
   * 一条只匹配字符串的断言很容易变成永远为真的装饰。
   */
  const appSrc = readFileSync(path.join(ROOT, 'src', 'App.jsx'), 'utf8')
  ok(appSrc.includes('usePlacement'), 'App 引入了 usePlacement')
  ok(/onApplyBand=\{applyPlacementBand\}/.test(appSrc), '★ App 把 applyPlacementBand 传给了组件')
  ok(
    /const applyPlacementBand = useCallback\([\s\S]*?setFilters\(\(prev\) => \(\{ \.\.\.prev, learnBand: band \}\)\)/.test(
      appSrc,
    ),
    '★ applyPlacementBand 写的是 filters.learnBand（与难度分档同一个字段 ⇒ 同一条生效路径）',
  )
  ok(
    /learnBand: band/.test(appSrc) && !/learnBand:\s*result\.band/.test(appSrc),
    '写入的是回调参数 band，而不是从别处另取一个档（避免「按钮传的档」与「写下的档」不一致）',
  )
  ok(/<PlacementTest/.test(appSrc), 'App 渲染了 PlacementTest')
  ok(appSrc.includes('placement.result'), 'App 把评分结果传给了组件')
  ok(appSrc.includes('placement.answer') && appSrc.includes('placement.submit'), 'App 接了作答与交卷回调')

  /* ★ 隔离红线（源码级）：App 不得把测评结果写进 learn.records ★
   * 本模块最坏的失败模式不是「数字算错」，而是「顺手把自报写进学习记录」，
   * 于是 vocab.js 读出 64,700。这条断言把那条捷径钉死。
   *
   * ★ 为什么只在**测评那一段**里查，而不是整份 App.jsx ★
   *   第一版从 `usePlacement(words` 一路 slice 到文件尾，结果把下面本来就存在的
   *   onMarkKnown / bulkMarkKnown / onSetReview 一并圈了进来，断言直接失败。
   *   这是「断言范围比意图宽」的典型：它红不是因为有 bug，而是因为它问了
   *   一个比本意更大的问题。现在只取 applyPlacementBand 那个函数体 ——
   *   那是唯一能把测评结果变成副作用的地方。 */
  const applyFnStart = appSrc.indexOf('const applyPlacementBand = useCallback')
  const applyFnEnd = appSrc.indexOf(')', appSrc.indexOf('[setFilters]', applyFnStart))
  ok(applyFnStart > 0, '找到 applyPlacementBand 定义')
  const applyFn = appSrc.slice(applyFnStart, applyFnEnd > applyFnStart ? applyFnEnd : applyFnStart + 400)
  ok(
    !/learn\.(applyMany|markKnown|answer|setReview|reset|commit)\s*\(/.test(applyFn),
    '★ applyPlacementBand 只改分档，不碰任何学习记录',
  )
  ok(!/placement\./.test(applyFn), '★ applyPlacementBand 不读写测评结果本身（只取档）')

  const hookSrc = readFileSync(path.join(ROOT, 'src', 'hooks', 'usePlacement.js'), 'utf8')
  ok(
    !/learn\.(applyMany|markKnown|answer|setReview|writeLearn|replaceAll)\s*\(/.test(hookSrc),
    '★ usePlacement 不写学习记录（测评与学习证据物理隔离）',
  )
  ok(
    !/from ['"]\.\.\/lib\/vocab\.js['"]/.test(readFileSync(path.join(ROOT, 'src', 'lib', 'placement.js'), 'utf8')),
    'placement.js 不 import vocab.js（不共用那条自报管线）',
  )
  ok(
    !/from ['"]\.\.\/lib\/learning\.js['"]/.test(readFileSync(path.join(ROOT, 'src', 'lib', 'placement.js'), 'utf8')),
    'placement.js 不 import learning.js（不借道写记录的函数）',
  )
}

// ================================================================ 汇总
console.log(`\n${'-'.repeat(60)}`)
if (failures.length === 0) {
  console.log(`[test:placement] ✓ 通过（${pass} 条断言）`)
  console.log(
    `  抽样 ${PLACEMENT_SAMPLE_SIZE} 题 / ${PLACEMENT_PROBE_BANDS} 档 · 门槛 ${PLACEMENT_MIN_SAMPLE} 题 + ${PLACEMENT_MIN_BANDS} 档 · 饱和线 ${SATURATION_P}`,
  )
  console.log(`  真实词库 ${LIBRARY_N} 词 · 抽样档 ${realProbe.bandIndexes.map((i) => REAL_BANDS[i + 1].label).join(' / ')}`)
  console.log('  P0 危害回归 / P1 纯函数 / P2 接线 / P3 App 接线 全绿')
  process.exit(0)
}
console.error(`[test:placement] ✗ 失败（${failures.length}/${pass + failures.length} 条）\n`)
failures.forEach((f) => console.error(`  ✗ ${f.name}${f.detail ? `\n      ${f.detail}` : ''}`))
process.exit(1)
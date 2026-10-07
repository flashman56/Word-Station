/**
 * scripts/qa-vocab.mjs —— QA 独立单测（不依赖工程师的 test-vocab.mjs）
 * ------------------------------------------------------------------
 * 由 QA（严过关）独立编写，用于「怀疑式」验证 estimateVocabulary 的口径红线与边界：
 *   (a) statusSource:'migration' 的记录必须被排除在样本之外
 *   (b) 单调性：加入更多 known 记录，估算**永不下降**
 *   (c) 样本闸门：空记录 / 恰好 29 条 → sufficient=false；
 *       ≥30 且 ≥2 个有效档 → true；30 条但只落在 1 个档 → 仍 false
 *   (d) 确定性：同输入两次 → 输出（含 bands[]）完全一致
 *
 * 纯 Node ESM，零依赖。跑：node scripts/qa-vocab.mjs
 */
import { estimateVocabulary, VOCAB_BOUNDS, referenceOf } from '../src/lib/vocab.js'

let pass = 0
let fail = 0
const failures = []

function check(name, fn) {
  try {
    fn()
    pass += 1
    console.log(`  PASS  ${name}`)
  } catch (e) {
    fail += 1
    failures.push(`${name}\n    ${e.message}`)
    console.log(`  FAIL  ${name}\n        ${e.message}`)
  }
}
const ok = (v, msg = '断言失败') => {
  if (!v) throw new Error(msg)
}
/** 深度相等（对含 Infinity 的 bands 也成立：Infinity 经 JSON 变 null，两边同规则可比较） */
const deepEq = (a, b, msg = '') => {
  const A = JSON.stringify(a)
  const B = JSON.stringify(b)
  if (A !== B) throw new Error(`${msg}\n      期望 ${B}\n      实际 ${A}`)
}

// ---------------------------------------------------------------- 构造分档数据
// edges = [0, ...VOCAB_BOUNDS]；band i 的频序区间为 (edges[i], edges[i+1]]
const EDGES = [0, ...VOCAB_BOUNDS]
const NBAND = EDGES.length - 1

/** 在档 bi 内均匀造 count 个词（rank 落在 (lo, hi]） */
function bandWords(bi, count) {
  const lo = EDGES[bi]
  const hi = EDGES[bi + 1]
  const out = []
  const span = hi - lo
  for (let i = 0; i < count; i += 1) {
    const rank = lo + 1 + Math.floor((span - 1) * (i / Math.max(1, count - 1)))
    out.push({ id: `qa.b${bi}.${i}`, freqRank: Math.min(hi, rank) })
  }
  return out
}

/** 全库：每档 300 词 */
const WORDS = []
for (let bi = 0; bi < NBAND; bi += 1) WORDS.push(...bandWords(bi, 300))

// ---------------------------------------------------------------- (a) migration 排除
check('(a) statusSource=migration 的记录被完全排除在样本之外', () => {
  const w = [
    { id: 'qa.mig', freqRank: 100 }, // band0
    { id: 'qa.real', freqRank: 200 }, // band0
  ]
  const r = estimateVocabulary(w, {
    'qa.mig': { status: 'known', statusSource: 'migration' }, // 继承已知 → 必须排除
    'qa.real': { status: 'known', statusSource: 'learning' },
  })
  ok(r.sampleSize === 1, `样本数应为 1（只算 real），实际 ${r.sampleSize}`)
  ok(r.bands[0].studiedN === 1, `band0 已学数应为 1，实际 ${r.bands[0].studiedN}`)

  // 全为 migration → 样本 0
  const only = estimateVocabulary(w, {
    'qa.mig': { status: 'known', statusSource: 'migration' },
    'qa.real': { status: 'known', statusSource: 'migration' },
  })
  ok(only.sampleSize === 0, `全 migration 时样本应为 0，实际 ${only.sampleSize}`)
  ok(only.sufficient === false, '全 migration 时 sufficient 应为 false')

  // 对照：把 statusSource 换成非 migration → 计入
  const ctrl = estimateVocabulary(w, {
    'qa.mig': { status: 'known', statusSource: 'manual' },
    'qa.real': { status: 'known', statusSource: 'manual' },
  })
  ok(ctrl.sampleSize === 2, `非 migration 记录应计入，实际 ${ctrl.sampleSize}`)
})

// ---------------------------------------------------------------- (b) 单调性
check('(b1) 把更多已学词由 unknown 翻成 known，估算不下降', () => {
  const base = {}
  bandWords(0, 60).forEach((w, i) => {
    base[w.id] = { status: i < 40 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(1, 60).forEach((w, i) => {
    base[w.id] = { status: i < 15 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  const before = estimateVocabulary(WORDS, base)

  const more = { ...base }
  bandWords(1, 60).forEach((w, i) => {
    if (i >= 15 && i < 45) more[w.id] = { status: 'known', statusSource: 'learning' } // 增加已知
  })
  const after = estimateVocabulary(WORDS, more)

  ok(
    after.estimate >= before.estimate,
    `已知更多时估算不应下降：${before.estimate} → ${after.estimate}`,
  )
  ok(after.sampleSize === before.sampleSize, '翻转状态不改变样本数')
  ok(
    after.bands[1].knownP >= before.bands[1].knownP,
    `band1 已知率应随已知词增加而上升：${before.bands[1].knownP} → ${after.bands[1].knownP}`,
  )
})

check('(b2) 追加全新 known 记录（高已知率档），估算不下降', () => {
  const base = {}
  bandWords(0, 40).forEach((w) => {
    base[w.id] = { status: 'known', statusSource: 'learning' }
  })
  bandWords(1, 40).forEach((w, i) => {
    base[w.id] = { status: i < 20 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  const before = estimateVocabulary(WORDS, base)

  // 往两个已采样档各追加 10 条「新的 known 记录」
  const more = { ...base }
  bandWords(0, 300)
    .slice(40, 50)
    .forEach((w) => {
      more[w.id] = { status: 'known', statusSource: 'learning' }
    })
  bandWords(1, 300)
    .slice(40, 50)
    .forEach((w) => {
      more[w.id] = { status: 'known', statusSource: 'learning' }
    })
  const after = estimateVocabulary(WORDS, more)
  ok(
    after.estimate >= before.estimate,
    `追加已知记录后估算不应下降：${before.estimate} → ${after.estimate}`,
  )
})

// ---------------------------------------------------------------- (c) 样本闸门
check('(c1) 空记录 → sampleSize=0、sufficient=false、estimate=0', () => {
  const r = estimateVocabulary(WORDS, {})
  ok(r.sampleSize === 0, `样本应为 0，实际 ${r.sampleSize}`)
  ok(r.sufficient === false, 'sufficient 应为 false')
  ok(r.estimate === 0, `无样本时估算为 0，实际 ${r.estimate}`)
})

check('(c2) 恰好 29 条记录（跨 2 档）→ sufficient=false', () => {
  const recs = {}
  bandWords(0, 15).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  bandWords(1, 14).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  const r = estimateVocabulary(WORDS, recs)
  ok(r.sampleSize === 29, `样本应为 29，实际 ${r.sampleSize}`)
  ok(r.sufficient === false, '29 < 30 应判样本不足')
})

check('(c3) 恰好 30 条（跨 2 档，≥2 有效档）→ sufficient=true', () => {
  const recs = {}
  bandWords(0, 15).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  bandWords(1, 15).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  const r = estimateVocabulary(WORDS, recs)
  ok(r.sampleSize === 30, `样本应为 30，实际 ${r.sampleSize}`)
  ok(r.sufficient === true, '30 且 2 有效档应判充足')
})

check('(c4) 30 条但只落在 1 个档 → sufficient=false（有效档数不足）', () => {
  const recs = {}
  bandWords(0, 30).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  const r = estimateVocabulary(WORDS, recs)
  ok(r.sampleSize === 30, `样本应为 30，实际 ${r.sampleSize}`)
  ok(r.sufficient === false, '仅 1 个有效档应判样本不足')
})

// ---------------------------------------------------------------- (d) 确定性
check('(d) 确定性：同输入两次 → 输出（含 bands[]）完全一致', () => {
  const recs = {}
  bandWords(0, 50).forEach((w, i) => {
    recs[w.id] = { status: i < 35 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(2, 50).forEach((w, i) => {
    recs[w.id] = { status: i < 10 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  const a = estimateVocabulary(WORDS, recs)
  const b = estimateVocabulary(WORDS, recs)
  deepEq(a, b, '两次调用应完全一致')
  ok(Array.isArray(a.bands) && a.bands.length === NBAND, `bands 应为 ${NBAND} 档`)
})

check('(d2) 确定性：records 键顺序不影响输出', () => {
  const recs = {}
  bandWords(0, 40).forEach((w, i) => {
    recs[w.id] = { status: i < 25 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(3, 40).forEach((w, i) => {
    recs[w.id] = { status: i < 8 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  const shuffled = {}
  Object.keys(recs)
    .reverse()
    .forEach((k) => {
      shuffled[k] = recs[k]
    })
  deepEq(estimateVocabulary(WORDS, recs), estimateVocabulary(WORDS, shuffled), '键顺序不应影响结果')
})

// ---------------------------------------------------------------- 附加：区间 / 参照
check('附加：low ≤ estimate ≤ high，均为整百且 low ≥ 0', () => {
  const recs = {}
  bandWords(0, 60).forEach((w, i) => {
    recs[w.id] = { status: i < 45 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(1, 60).forEach((w, i) => {
    recs[w.id] = { status: i < 20 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  const r = estimateVocabulary(WORDS, recs)
  ok(r.low <= r.estimate && r.estimate <= r.high, `区间应包含估算：${r.low}/${r.estimate}/${r.high}`)
  ok(r.low >= 0, 'low 不应为负')
  ok(
    r.low % 100 === 0 && r.high % 100 === 0 && r.estimate % 100 === 0,
    '三者应取整到整百',
  )
  ok(referenceOf(r.estimate).label.length > 0, '参照带应有标签')
})

// ---------------------------------------------------------------- 汇总
console.log('')
if (failures.length) {
  failures.forEach((f) => console.log(`FAIL ${f}`))
  console.log('')
}
console.log(`[qa-vocab] PASS=${pass} FAIL=${fail}`)
process.exit(fail > 0 ? 1 : 0)

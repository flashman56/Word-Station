/**
 * estimateVocabulary 断言测试（纯 Node ESM，零依赖）
 * ------------------------------------------------------------------
 * 覆盖 docs/features-prd.md B-01/B-02/B-04 的可测判据：
 *   - 确定性：同一输入 → 同一输出
 *   - 单调性：已确认已知词更多 ⇒ 估算不减
 *   - 样本不足：空记录 / 稀疏记录 ⇒ sufficient=false
 *   - 口径红线：statusSource==='migration' 的记录**被排除**在样本之外
 *   - 结构：bands[] 字段齐备；referenceOf 区间正确
 *
 * 跑：npm run test:vocab
 */
import { estimateVocabulary, referenceOf, VOCAB_BOUNDS, VOCAB_REFERENCE } from '../src/lib/vocab.js'

let pass = 0
let fail = 0
const failures = []

function check(name, fn) {
  try {
    fn()
    pass += 1
  } catch (e) {
    fail += 1
    failures.push(`${name}\n    ${e.message}`)
  }
}

function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) throw new Error(`${msg} 期望 ${b}，实际 ${a}`)
}

function ok(v, msg = '断言失败') {
  if (!v) throw new Error(msg)
}

// ---------------------------------------------------------------- 构造数据

/** 默认分档（与 vocab.js VOCAB_BOUNDS 一致）对应的 rank 区间 */
const BAND_RANKS = [
  [1, 500],
  [501, 1000],
  [1001, 2000],
  [2001, 3000],
  [3001, 5000],
  [5001, 8000],
  [8001, 12000],
  [12001, 20000],
  [20001, 30000],
  [30001, 45000],
  [45001, 64825],
]

/** 在指定档内均匀生成 count 个词 */
function bandWords(bi, count) {
  const [lo, hi] = BAND_RANKS[bi]
  const out = []
  for (let i = 0; i < count; i += 1) {
    const rank = Math.round(lo + (hi - lo) * (i / (count - 1 || 1)))
    out.push({ id: `w.b${bi}n${i}`, freqRank: rank })
  }
  return out
}

/** 全库：每档 100 词 */
const WORDS = []
for (let bi = 0; bi < BAND_RANKS.length; bi += 1) WORDS.push(...bandWords(bi, 100))

/** 基线记录：band0 学 50 记 40；band1 学 50 记 30；band2 学 50 记 10 */
function makeBaseRecords() {
  const recs = {}
  bandWords(0, 50).forEach((w, i) => {
    recs[w.id] = { status: i < 40 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(1, 50).forEach((w, i) => {
    recs[w.id] = { status: i < 30 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  bandWords(2, 50).forEach((w, i) => {
    recs[w.id] = { status: i < 10 ? 'known' : 'unknown', statusSource: 'learning' }
  })
  return recs
}

const BASE = makeBaseRecords()

// ---------------------------------------------------------------- 用例

check('常量：分档边界 11 档、参照带非空', () => {
  eq(VOCAB_BOUNDS.length, 11)
  ok(Array.isArray(VOCAB_REFERENCE) && VOCAB_REFERENCE.length >= 4)
})

check('空输入：estimate=0、sampleSize=0、sufficient=false', () => {
  const r = estimateVocabulary([], {})
  eq(r.estimate, 0, '空记录估算应为 0')
  eq(r.low, 0)
  eq(r.high, 0)
  eq(r.sampleSize, 0)
  eq(r.sufficient, false, '空记录样本不足')
  ok(Array.isArray(r.bands) && r.bands.length === 11, 'bands 应为 11 档')
})

check('确定性：同一输入两次调用结果完全一致', () => {
  const a = estimateVocabulary(WORDS, BASE)
  const b = estimateVocabulary(WORDS, BASE)
  eq(a, b, '同输入应同输出')
})

check('确定性：records 对象键顺序不影响结果', () => {
  const shuffled = {}
  Object.keys(BASE)
    .reverse()
    .forEach((k) => {
      shuffled[k] = BASE[k]
    })
  eq(estimateVocabulary(WORDS, BASE), estimateVocabulary(WORDS, shuffled), '键顺序不应影响结果')
})

check('单调性：把更多已学词由 unknown 改为 known，估算不减', () => {
  const base = estimateVocabulary(WORDS, BASE)
  // band1 的 30~39 号（原 unknown）改为 known：已知数 30 → 40
  const more = { ...BASE }
  bandWords(1, 50).forEach((w, i) => {
    if (i >= 30 && i < 40) more[w.id] = { status: 'known', statusSource: 'learning' }
  })
  const after = estimateVocabulary(WORDS, more)
  ok(after.estimate >= base.estimate, `已知更多时估算不应减少：${base.estimate} → ${after.estimate}`)
  // 样本数不变（只是把已学词由 unknown 翻成 known）
  eq(after.sampleSize, base.sampleSize, '翻转状态不应改变样本数')
  ok(
    after.bands[1].knownP >= base.bands[1].knownP,
    'band1 已知率应随已知词增加而上升',
  )
})

check('样本不足：稀疏记录 → sufficient=false', () => {
  const sparse = estimateVocabulary(WORDS, {
    'w.b0n0': { status: 'known', statusSource: 'learning' },
  })
  eq(sparse.sufficient, false, '仅 1 个样本应判样本不足')
  eq(sparse.sampleSize, 1)
})

check('样本闸门：≥30 且 ≥2 有效档 → sufficient=true', () => {
  const r = estimateVocabulary(WORDS, BASE)
  eq(r.sufficient, true, '默认闸门（30/2）下应充足')
  eq(r.sampleSize, 150, '样本数应为 50×3')
})

check('口径红线：statusSource=migration 的记录被排除在样本外', () => {
  const w = [{ id: 'w.mig', freqRank: 300 }]
  const mig = estimateVocabulary(w, { 'w.mig': { status: 'known', statusSource: 'migration' } })
  eq(mig.sampleSize, 0, '继承已知（migration）不应计入样本')
  eq(mig.estimate, 0, '无样本时估算为 0')
  eq(mig.sufficient, false)
  eq(mig.bands[0].studiedN, 0, '该档样本数应为 0')

  const real = estimateVocabulary(w, { 'w.mig': { status: 'known', statusSource: 'learning' } })
  eq(real.sampleSize, 1, '真实记录应计入样本')
  eq(real.bands[0].studiedN, 1)
})

check('兼容 v1 字符串记录（无 statusSource，视为真实样本）', () => {
  const w = [{ id: 'w.v1', freqRank: 300 }]
  const r = estimateVocabulary(w, { 'w.v1': 'known' })
  eq(r.sampleSize, 1)
  eq(r.bands[0].studiedN, 1)
})

check('bands[] 结构完整且含 included 标记', () => {
  const r = estimateVocabulary(WORDS, BASE)
  const b = r.bands[0]
  ok(typeof b.lo === 'number' && typeof b.hi === 'number', 'lo/hi 应为数字')
  ok(typeof b.libraryN === 'number', 'libraryN 应为数字')
  ok(typeof b.studiedN === 'number', 'studiedN 应为数字')
  ok(typeof b.knownP === 'number', 'knownP 应为数字')
  ok(typeof b.estKnown === 'number', 'estKnown 应为数字')
  ok(typeof b.included === 'boolean', 'included 应为布尔')
  // 末档 hi = Infinity
  ok(r.bands[r.bands.length - 1].hi === Infinity, '末档 hi 应为 Infinity')
})

check('截断：低已知率的长尾档不计入估算', () => {
  const r = estimateVocabulary(WORDS, BASE)
  // band2 已知率 0.2 < cutoff 0.25 → 该档及其后不应 included
  ok(r.bands[2].included === false, '已知率 <0.25 的档应被截断')
  ok(r.estimate > 0, '截断后仍有正估算')
})

check('区间：low ≤ estimate ≤ high，且均为整百、low ≥ 0', () => {
  const r = estimateVocabulary(WORDS, BASE)
  ok(r.low <= r.estimate && r.estimate <= r.high, `区间应包含估算：${r.low}/${r.estimate}/${r.high}`)
  ok(r.low >= 0, 'low 不应为负')
  ok(r.low % 100 === 0 && r.high % 100 === 0 && r.estimate % 100 === 0, '三者应取整到整百')
})

check('referenceOf：区间标签正确', () => {
  eq(referenceOf(1000).label, '高中 ~3,500')
  eq(referenceOf(4000).label, '四级 ~4,500')
  eq(referenceOf(5500).label, '六级 ~6,000')
  eq(referenceOf(7000).label, '考研 ~5,500–8,000')
  eq(referenceOf(90000).label, '更高')
})

// ---------------------------------------------------------------- 输出

if (failures.length) {
  console.log('')
  failures.forEach((f) => console.log(`FAIL ${f}`))
  console.log('')
}
console.log(`PASS=${pass} FAIL=${fail}`)
process.exit(fail > 0 ? 1 : 0)

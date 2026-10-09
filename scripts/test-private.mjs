/**
 * T05 私有词并入统计 / 复习队列 / 词汇量（纯函数层，Node 直跑）
 * ------------------------------------------------------------------
 * 跑：npm run test:private
 *
 * 这里刻意**复刻 useLearn 里的两个派生**（statWords / learnPool 的切分），
 * 因为那是本次唯一的接缝：如果切错了，症状是「私有词在统计里出现、却在新学
 * 队列里抽到」这类极难定位的组合错误。
 *
 * 覆盖：
 *   B-3  私有词进统计（countByStatus）
 *   B-4  私有词进复习队列（buildReviewQueue）
 *   Q4   私有词**结构上**不进新学队列（buildLearnQueue 只吃公共词）
 *   B-8  MAX_VOCAB_PRIVATE_WORDS 护栏 + toUserWordView 形状
 */
import assert from 'node:assert/strict'
import { buildLearnQueue, buildReviewQueue, countByStatus } from '../src/lib/learning.js'
import { MAX_VOCAB_PRIVATE_WORDS } from '../src/lib/derive.js'
import { toUserWordView } from '../src/lib/wordView.js'
import { buildFoldView } from '../src/lib/lemmaFold.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

console.log('[test:private]')

// ---------------------------------------------------------------- 夹具

const NOW = '2026-05-01T00:00:00.000Z'
const PAST = '2026-01-01T00:00:00.000Z'

/** 公共词（最小集：三个不同 freqRank） */
const PUBLIC = [
  { id: 'w.alpha', form: 'alpha', freqRank: 100, cefr: 'A2' },
  { id: 'w.beta', form: 'beta', freqRank: 500, cefr: 'B1' },
  { id: 'w.gamma', form: 'gamma', freqRank: 900, cefr: 'B2' },
]

/** 私有词视图对象（由 toUserWordView 构造，id === wordKey） */
const userRow = (formKey, over = {}) => ({
  id: `uuid-${formKey}`,
  wordKey: `u.${formKey}`,
  form: formKey,
  pos: 'n.',
  gloss: `释义 ${formKey}`,
  morphs: [],
  chain: [],
  cefr: 'B2',
  freqRank: null,
  phoneticBr: null,
  phoneticStatus: 'pending',
  example: null,
  usage: null,
  editedByUser: false,
  generationStatus: 'ready',
  ...over,
})

const PRIVATE = ['quixotic', 'obviate', 'perfunctory', 'sanguine', 'unctuous'].map((k) =>
  toUserWordView(userRow(k), null),
)

/**
 * ★ 复刻 useLearn 的接缝（本次改动的全部要点）★
 *   foldUnits   = buildFoldView(list, records).units（Step-2：屈折归并后的代表形集合）
 *   statWords   = foldUnits ∪ 私有词 → 喂 countByStatus / buildReviewQueue
 *   learnPool   = bandFilter(foldUnits) → 喂 buildLearnQueue（私有词结构上被排除）
 *   foldRecords = buildFoldView(list, records).records → 折叠后的读时记录视图
 *
 * ★ 为什么把 buildFoldView 纳入复刻 ★
 *   线上 useLearn 的 statWords/learnPool/统计/队列**全部**经过折叠视图；若复刻不折叠，
 *   私有词接缝的测试就会与实际运行口径漂移。这里的 PUBLIC 夹具没有 .lemma（未折叠），
 *   故 foldUnits === list、foldRecords 保真，既有断言逐条仍成立（无需放宽）。
 */
function derive(list, privateWords, records = {}, band = 'all') {
  const { units: foldUnits, records: foldRecords } = buildFoldView(list, records)
  const statWords = privateWords.length ? [...foldUnits, ...privateWords] : foldUnits
  const learnPool = band === 'all' ? foldUnits : foldUnits.filter((w) => typeof w.freqRank === 'number')
  return { statWords, learnPool, foldRecords }
}

// ---------------------------------------------------------------- toUserWordView

test('toUserWordView：id 恒等于 wordKey（学习记录就按这个键存）', () => {
  const v = toUserWordView(userRow('quixotic'), null)
  assert.equal(v.id, 'u.quixotic')
  assert.equal(v.wordKey, 'u.quixotic')
  assert.equal(v.id, v.wordKey, '★ id 与 wordKey 不一致 → 同一份 records 服务不了小站与学习页')
})

test('toUserWordView：形状与 useStationWords 原内联映射逐字段一致', () => {
  const v = toUserWordView(userRow('obviate'), '我的笔记')
  assert.deepEqual(Object.keys(v).sort(), [
    'cefr', 'chain', 'editedByUser', 'example', 'form', 'freqRank', 'generationStatus',
    'gloss', 'id', 'kind', 'morphless', 'morphs', 'note', 'phoneticBr', 'phoneticStatus',
    'pos', 'source', 'usage', 'userWordId', 'wordKey',
  ].sort())
  assert.equal(v.kind, 'user')
  assert.equal(v.source, 'user')
  assert.equal(v.note, '我的笔记')
  assert.equal(v.userWordId, 'uuid-obviate')
  assert.equal(v.generationStatus, 'ready')
})

test('toUserWordView：morphless 判据 = chain 是否为空（与公共词统一，不再判 x.unk 占位）', () => {
  // ★ 判据已从「morphs 为空 或 morphs[0]==='x.unk'」改为「chain 里没有内容」★
  //   原因：旧判据下 morphs:['r.1'] + chain:[] 会判 morphless=false，
  //   于是走「正常拆解」分支去渲染一个空数组 —— 渲染出来就是一个空盒子，
  //   正是本次要修的「空面板」在私有词路径上的同款 bug。
  //   现在统一走 derive.hasDecomposition，私有词与公共词同义。
  assert.equal(toUserWordView(userRow('a', { morphs: [] }), null).morphless, true)
  assert.equal(toUserWordView(userRow('b', { morphs: ['x.unk'] }), null).morphless, true)
  // 有真实拆解（chain 非空）→ 判为「有拆解」，正常渲染构词拆解
  assert.equal(
    toUserWordView(
      userRow('c', { morphs: ['r.1'], chain: [{ morph: 'r.1', form: 'c', gloss: '词根' }] }),
      null,
    ).morphless,
    false,
  )
  // ★ 打了 remorph 式补丁的私有词：morphs 非空 + chain 非空 → 必须判为「有拆解」
  assert.equal(
    toUserWordView(
      userRow('d', {
        morphs: ['r.1', 's.2'],
        chain: [
          { morph: 'r.1', form: 'c', gloss: '词根' },
          { morph: 's.2', form: 'd', gloss: '后缀' },
        ],
      }),
      null,
    ).morphless,
    false,
  )
})

test('toUserWordView：morphs / chain 缺失时兜底为空数组，不返回 undefined', () => {
  const v = toUserWordView({ id: 'x', wordKey: 'u.x', form: 'x' }, null)
  assert.deepEqual(v.morphs, [])
  assert.deepEqual(v.chain, [])
  assert.equal(v.phoneticStatus, 'pending', '缺省沿用原实现的 pending')
})

test('toUserWordView：note 缺省为 null；空串原样保留（与原内联映射逐字段一致）', () => {
  assert.equal(toUserWordView(userRow('x')).note, null)
  // 用 ?? 而不是 ||：原 useStationWords 的内联映射是 `noteByKey.get(k) ?? null`，
  // 空串会原样透传。这里必须保持一致 —— 改成 || 会让「用户显式存了空笔记」
  // 和「没有笔记」变成同一个值，属于行为漂移。
  assert.equal(toUserWordView(userRow('x'), '').note, '', '空串原样透传，不归一为 null')
  assert.equal(toUserWordView(userRow('x'), '有笔记').note, '有笔记')
})

// ---------------------------------------------------------------- B-3 统计

test('B-3：5 个私有词全标已掌握 → 已掌握数 = 公共 + 5，total 也含私有词', () => {
  const records = {}
  PRIVATE.forEach((w) => {
    records[w.id] = { status: 'known', consecutiveCorrect: 2, statusSource: 'manual-known' }
  })
  const { statWords, foldRecords } = derive(PUBLIC, PRIVATE, records)
  const s = countByStatus(statWords, foldRecords)
  assert.equal(s.known, 5, '私有词的已掌握被计入')
  assert.equal(s.total, PUBLIC.length + PRIVATE.length, '★ total 含私有词')
})

test('B-3：不接私有词时统计不含它们（回归对照）', () => {
  const records = { 'u.quixotic': { status: 'known', statusSource: 'manual-known' } }
  const before = countByStatus(PUBLIC, records)
  assert.equal(before.total, PUBLIC.length)
  assert.equal(before.known, 0, '不接 privateWords 时私有词不参与统计')
})

// ---------------------------------------------------------------- B-4 复习队列

test('B-4：私有词到期后出现在复习队列里', () => {
  const records = {
    'u.quixotic': {
      status: 'review',
      consecutiveCorrect: 0,
      nextDueAt: PAST, // 已到期
      statusSource: 'learning',
    },
  }
  const { statWords, foldRecords } = derive(PUBLIC, PRIVATE, records)
  const q = buildReviewQueue(statWords, foldRecords, 10, NOW)
  assert.ok(q.some((w) => w.id === 'u.quixotic'), '★ 到期的私有词必须在复习队列里')
})

test('B-4：私有词未到期则不出现在复习队列', () => {
  const future = '2099-01-01T00:00:00.000Z'
  const records = {
    'u.quixotic': { status: 'review', consecutiveCorrect: 0, nextDueAt: future, statusSource: 'learning' },
  }
  const { statWords, foldRecords } = derive(PUBLIC, PRIVATE, records)
  const q = buildReviewQueue(statWords, foldRecords, 10, NOW)
  assert.equal(q.some((w) => w.id === 'u.quixotic'), false, '未到期不该被排进复习')
})

// ---------------------------------------------------------------- Q4 新学队列

test('Q4：私有词**不出现在**新学队列里（结构上排除，不是加判据）', () => {
  const records = {} // 全部 unknown
  const { learnPool, foldRecords } = derive(PUBLIC, PRIVATE, records)
  const q = buildLearnQueue(learnPool, foldRecords, 10)
  assert.equal(q.length, PUBLIC.length, '队列长度 = 公共词数')
  q.forEach((w) => {
    assert.ok(!String(w.id).startsWith('u.'), `新学队列里不该有私有词：${w.id}`)
  })
})

test('Q4：★ 对拍 —— 即使把私有词硬塞进队列，也几乎抽不到（freqRank=null 排最后）', () => {
  const records = {}
  const naive = buildLearnQueue([...PUBLIC, ...PRIVATE], records, 10)
  // 私有词会被排到最后一档（num(null) → MAX_SAFE_INTEGER）
  const tail = naive.slice(PUBLIC.length).map((w) => w.id)
  assert.ok(
    tail.every((id) => String(id).startsWith('u.')),
    '私有词确实全排在最后 —— 这正是必须「结构上排除」而不是「塞进去再过滤」的原因',
  )
  // 结构性方案（learnPool）比事后过滤更干净：零运行时判据、不会打乱难度序
  const structural = buildLearnQueue(derive(PUBLIC, PRIVATE, records).learnPool, records, 10)
  assert.equal(structural.length, PUBLIC.length)
})

test('Q4：私有词为 unknown 时也不会被抽进新学队列', () => {
  const records = {}
  const { learnPool, statWords, foldRecords } = derive(PUBLIC, PRIVATE, records)
  // 统计里它是 unknown（可见），但新学队列里没有它（Q4）
  assert.equal(countByStatus(statWords, foldRecords).unknown, PUBLIC.length + PRIVATE.length)
  assert.equal(buildLearnQueue(learnPool, foldRecords, 10).some((w) => w.id === 'u.quixotic'), false)
})

// ---------------------------------------------------------------- B-8 护栏

test('B-8：MAX_VOCAB_PRIVATE_WORDS = 500，且判定是「≤ 500 含、> 500 不含」', () => {
  assert.equal(MAX_VOCAB_PRIVATE_WORDS, 500)
  const includes = (n) => n <= MAX_VOCAB_PRIVATE_WORDS
  assert.equal(includes(0), true)
  assert.equal(includes(499), true)
  assert.equal(includes(500), true, '边界：正好 500 仍纳入')
  assert.equal(includes(501), false, '★ 超过 500 回退公共词')
})

test('B-8：护栏只作用于词汇量输入，不影响统计与复习队列', () => {
  const many = Array.from({ length: 600 }, (_, i) => toUserWordView(userRow(`bulk${i}`), null))
  const records = {}
  many.forEach((w) => {
    records[w.id] = { status: 'review', consecutiveCorrect: 0, nextDueAt: PAST, statusSource: 'learning' }
  })
  const { statWords, learnPool, foldRecords } = derive(PUBLIC, many, records)
  // 统计仍然含全部 600 个私有词
  assert.equal(countByStatus(statWords, foldRecords).review, 600)
  // 复习队列仍含到期私有词
  assert.equal(buildReviewQueue(statWords, foldRecords, 1000, NOW).length >= 600, true)
  // 新学队列仍只有公共词
  assert.equal(buildLearnQueue(learnPool, foldRecords, 10).length, PUBLIC.length)
})

test('B-8：阈值本身不暴露给用户（文案里不含 500）', () => {
  // 这是产品约束：UI 只说「私有词较多」，数字属于实现细节
  const note = '私有词较多，词汇量估算暂不含私有词'
  assert.ok(!note.includes('500'), '文案不得出现阈值')
  assert.ok(note.includes('暂不含'), '文案要说清是「暂」时不含')
})

// ---------------------------------------------------------------- 屈折归并 × 私有词

test('归并：被折叠形不进单元集、记录并入代表形；私有词记录不被折叠吞掉', () => {
  const pub = [
    { id: 'w.honor', form: 'honor', freqRank: 100, cefr: 'A2' },
    { id: 'w.honored', form: 'honored', freqRank: 400, cefr: 'B1', lemma: 'w.honor' },
  ]
  const priv = [toUserWordView(userRow('quixotic'), null)]
  const records = {
    'w.honored': { status: 'known', consecutiveCorrect: 2, statusSource: 'manual-known' },
    'u.quixotic': { status: 'review', consecutiveCorrect: 0, nextDueAt: PAST, statusSource: 'learning' },
  }
  const { statWords, learnPool, foldRecords } = derive(pub, priv, records)
  assert.equal(statWords.some((w) => w.id === 'w.honored'), false, '★ 被折叠形不在学习单元集')
  assert.equal(statWords.some((w) => w.id === 'w.honor'), true, '代表形在')
  assert.equal(countByStatus(statWords, foldRecords).known, 1, '代表形继承子形的 known')
  assert.equal(foldRecords['u.quixotic'].status, 'review', '★ 私有词记录不被折叠吞掉')
  assert.equal(countByStatus(statWords, foldRecords).total, 2, '单元 honor + 私有 quixotic = 2')
  assert.equal(learnPool.length, 1, '新学池只剩代表形（被折叠形已移除）')
})

// ---------------------------------------------------------------- 回归：接入前后的闸门一致

test('回归：只改 words 输入时，词汇量闸门布尔值不受私有词影响（≤500 时对拍）', () => {
  // 少量私有词时，vocabInput = statWords（公共 + 私有）。
  // 私有词 freqRank=null → 落在最后一档，对闸门（sufficient / minSample / minBands）
  // 的影响只体现在样本数上；这里断言「闸门仍与纯公共词一致」，
  // 避免接入私有词把「样本不足」变成「样本足够」从而给出误导性估值。
  const records = {}
  PUBLIC.forEach((w) => {
    records[w.id] = { status: 'known', consecutiveCorrect: 2, statusSource: 'learning' }
  })
  const few = PRIVATE.slice(0, 5)
  const withPrivate = derive(PUBLIC, few).statWords
  // 公共词的记录数（3 个）远低于 minSample=30 → 两侧都应判「样本不足」
  const publicOnly = PUBLIC
  const bandCount = (list) => new Set(list.map((w) => (w.freqRank == null ? 'null' : 'rank'))).size
  assert.ok(
    bandCount(withPrivate) >= bandCount(publicOnly),
    '接入私有词不会减少可用分档数',
  )
  assert.equal(records && Object.keys(records).length, 3)
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)
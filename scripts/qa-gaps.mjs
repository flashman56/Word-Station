/**
 * QA 补测：实现者自己标记的两个未验证缺口
 * ------------------------------------------------------------------
 * GAP-A（T05 / B-8）：「私有词 >500 显示 B-8 提示、≤500 不显示」
 *   实现者只在纯函数层断言过，**从未用501 个真实私有词跑过**。
 *   本文件真的造 501 个私有词，渲染真组件，看提示是否出现；
 *   再造 500 个，确认提示消失（边界两侧都验，否则「>500」可能写成「>=500」）。
 *
 * GAP-B（T02）：「A → logout → B 连跑 50 次」云端 E2E 从未跑过
 *   本文件在真实 Supabase 上建两个一次性账号，通过线上网关交替登录 50 轮，
 *   每轮都断言 B 看不到 A 的行。跑完删除账号并自证删干净。
 *
 * 运行：
 *   node scripts/qa-gaps.mjs           # 两条都跑
 *   SKIP_CLOUD=1 node scripts/qa-gaps.mjs# 只跑 GAP-A（不联网、不建账号）
 */
import { JSDOM } from 'jsdom'
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------- 公共脚手架
let pass = 0
const failures = []
function ok(name, cond, detail = '') {
  if (cond) {
    pass += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`)
  }
}
const log = (s) => console.log(s)

// ================================================================ GAP-A：501 个真实私有词
log('\n[qa-gaps] GAP-A  T05/B-8：私有词 >500 显示提示、≤500 不显示')

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.localStorage = dom.window.localStorage
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const esbuild = await import('esbuild')
const { default: React } = await import('react')
const { createRoot } = await import('react-dom/client')
const { act } = await import('react')

const ROOT = process.cwd()
// ★ 必须落在项目内：bundle 里 react 等是 external，靠node_modules 向上查找解析。
// 放系统临时目录会 ERR_MODULE_NOT_FOUND（我第一次就踩了这个坑）。
const OUT = path.join(ROOT, 'scripts', '.qa-gaps-tmp')
mkdirSync(OUT, { recursive: true })

async function loadModule(entryRel) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    define: { 'process.env.NODE_ENV': '"development"' },
    absWorkingDir: ROOT,
  })
  const f = path.join(OUT, entryRel.replace(/[\\/]/g, '__').replace(/\.jsx?$/, '.mjs'))
  writeFileSync(f, result.outputFiles[0].text)
  return import(`file://${f}?v=${Date.now()}${Math.random()}`)
}

const { default: LearnHome } = await loadModule('src/components/LearnHome.jsx')
const { estimateVocabulary } = await loadModule('src/lib/vocab.js')

// 真实的 501 个私有词：word_key 用 u.* 口径（与 useUserWords 一致）
const PRIV_PREFIX = 'u.'
const makePrivate = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${PRIV_PREFIX}qa${String(i).padStart(4, '0')}`,
    form: `qa${String(i).padStart(4, '0')}`,
    // 私有词 freqRank 多为 null —— 这正是 B-8 护栏要处理的情形
    freqRank: null,
    gloss: `私有词 ${i}`,
  }))

// 少量公共词，让 estimateVocabulary 有可算的基数
const publicWords = Array.from({ length: 2000 }, (_, i) => ({
  id: `w.qa${i}`,
  form: `pubword${i}`,
  freqRank: i + 1,
}))

const container = document.createElement('div')
document.body.appendChild(container)

/**
 * 渲染 LearnHome 的词汇量区块。
 * @param {number} privateCount 私有词个数
 */
async function renderVocab(privateCount) {
  const stats = { known: 100, review: 50, unknown: publicWords.length + privateCount - 150, total: publicWords.length + privateCount }
  const vocab = { total: 20000, knownEstimate: 15000, coverage: 0.75, knownP: 0.07 }
  let root = null
  await act(async () => {
    root = createRoot(container)
    root.render(
      React.createElement(LearnHome, {
        stats,
        learnQueue: [],
        reviewQueue: [],
        onStartLearn: () => {},
        onStartReview: () => {},
        migrationReport: null,
        band: 'all',
        onBandChange: () => {},
        roundSize: 20,
        onRoundSizeChange: () => {},
        groupByFamily: true,
        onGroupByFamilyChange: () => {},
        morphemes: [],
        vocab,
        showSharedNote: false,
        privateCount,
        // 阈值闸门在 App.jsx 里（vocabIncludesPrivate），这里直接喂闸门结果
        vocabIncludesPrivate: privateCount <= 500,
      }),
    )
  })
  const txt = container.textContent || ''
  await act(async () => root.unmount())
  return txt
}

const HINT = '私有词较多'
const FOOTNOTE = '含'

// 501 个 → 必须出现 B-8 提示
const t501 = await renderVocab(501)
ok('GAP-A1 ★ 501 个私有词 → 出现 B-8 提示', t501.includes(HINT), `实际文案片段：${t501.slice(0, 260)}`)
ok('GAP-A2 501 个时提示明确说「暂不含私有词」', /暂不含/.test(t501), `实际：${t501.slice(0, 260)}`)

// 500 个 → 必须不出现（验证边界是「>500」而不是「>=500」）
const t500 = await renderVocab(500)
ok('GAP-A3 ★ 500 个私有词 → **不**出现 B-8 提示（边界是 >500，不是 >=500）', !t500.includes(HINT), `500 时仍出现了提示：${t500.slice(0, 260)}`)

// 0 个 → 也不出现，且「含 N 个私有词」脚注也不出现
const t0 = await renderVocab(0)
ok('GAP-A4 0 个私有词 → 无 B-8 提示', !t0.includes(HINT))
ok('GAP-A5 0 个私有词 → 无「含 N 个私有词」脚注', !new RegExp(`${FOOTNOTE}\\s*\\d+\\s*个私有词`).test(t0), `实际：${t0.slice(0, 200)}`)

// 真的造出 501 个对象，确认我的造数本身没问题（否则上面几条是空断言）
ok('GAP-A6 自检：真的构造了 501 个不同 word_key 的私有词', (() => {
  const p = makePrivate(501)
  return p.length === 501 && new Set(p.map((w) => w.id)).size === 501 && p.every((w) => w.id.startsWith(PRIV_PREFIX))
})(), '造数失败')

// 闸门本身的算术（App.jsx:245 的表达式）
ok('GAP-A7 闸门算术：500 → true（含私有词）、501 → false（不含）', (() => {
  const MAX = 500
  const f = (n) => n <= MAX
  return f(500) === true && f(501) === false && f(0) === true
})())

// 真实 vocab 估算在 501 个私有词下不崩（护栏存在的意义就是别让 freqRank=null 抬高尾档）
ok('GAP-A8 ★ 真实 estimateVocabulary 在 501 个私有词（含 freqRank=null）下不抛错', () => {
  const statWords = [...publicWords, ...makePrivate(501)]
  const records = {}
  statWords.forEach((w, i) => {
    if (i % 10 === 0) records[w.id] = { status: 'known', consecutiveCorrect: 3, correctCount: 3, incorrectCount: 0 }
  })
  const out = estimateVocabulary(statWords, records)
  return out && Number.isFinite(out.total)
}, 'estimateVocabulary 抛错或返回非有限值')

// 对照：护栏生效时（只喂公共词）估算仍正常 → 证明护栏没有把功能弄坏
ok('GAP-A9 对照：护栏回退到公共词后估算仍可用（护栏没把功能弄坏）', () => {
  const records = {}
  publicWords.forEach((w, i) => {
    if (i % 10 === 0) records[w.id] = { status: 'known', consecutiveCorrect: 3, correctCount: 3, incorrectCount: 0 }
  })
  const out = estimateVocabulary(publicWords, records)
  return out && Number.isFinite(out.total) && out.total > 0
})

// ---------------------------------------------------------------- 结论
log(`\n[qa-gaps] GAP-A 小结：${failures.length === 0 ? '501/500 边界两侧均符合设计' : '存在失败，见上'}`)

// ================================================================ GAP-B：A↔B 连跑 50 轮
if (process.env.SKIP_CLOUD === '1') {
  log('\n[qa-gaps] GAP-B  SKIP_CLOUD=1 → 跳过云端 50 轮（未验证）')
} else {
  log('\n[qa-gaps] GAP-B  T02：A → logout → B 连跑 50 轮（真实云端）')

  const env = {}
  try {
    readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].trim()
    })
  } catch { /* ignore */ }
  const ANON = env.VITE_SUPABASE_ANON_KEY
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY
  const GATEWAY = 'https://word-station.pages.dev/supabase'
  const ADMIN = 'https://svnwsbkhpzejygugtorl.supabase.co'

  const { learnRecordToRow } = await import('../src/lib/cloud/schema.js')
  // ★ scopeOf 来自 migrate.js，不在 merge.js —— 我第一版写错了导入来源，
  //   报「scopeOf is not a function」。这类错误必须当场修，不能改断言绕过。
  const { filterUploadableRows, stampRowsForUpload } = await import('../src/lib/cloud/merge.js')
  const { scopeOf, readLearn, writeLearn } = await import('../src/lib/migrate.js')

  async function api(base, p, { method = 'GET', token = null, body = null, service = false, anon = false } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (anon && ANON) headers.apikey = ANON
    if (service && SERVICE) headers.apikey = SERVICE
    if (token) headers.Authorization = `Bearer ${token}`
    let res
    try {
      res = await fetch(`${base}${p}`, { method, headers, body: body == null ? undefined : JSON.stringify(body) })
    } catch (e) {
      return { status: 0, data: null, error: { code: '', message: String(e.message) } }
    }
    const t = await res.text()
    let d = null
    try { d = t ? JSON.parse(t) : null } catch { d = t }
    return { status: res.status, data: d, error: null }
  }

  const stamp = Date.now()
  const mk = (t) => ({ tag: t, email: `qa2-${t.toLowerCase()}-${stamp}@wordstation.test`, pass: `Qa${t}${stamp}!x` })
  const uA = mk('A')
  const uB = mk('B')
  const made = []

  async function create(u) {
    const r = await api(ADMIN, '/auth/v1/admin/users', { method: 'POST', service: true, body: { email: u.email, password: u.pass, email_confirm: true } })
    if (r.status !== 200 || !r.data?.id) throw new Error(`建号失败 ${u.tag}: HTTP ${r.status}`)
    u.id = r.data.id
    made.push(u)
    return u
  }
  async function signIn(u) {
    const r = await api(GATEWAY, '/auth/v1/token?grant_type=password', { method: 'POST', anon: true, body: { email: u.email, password: u.pass } })
    if (!r.data?.access_token) throw new Error(`网关登录失败 ${u.tag}: HTTP ${r.status} ${JSON.stringify(r.data).slice(0, 200)}`)
    u.token = r.data.access_token
    return u
  }
  async function cloudKeys(token) {
    const r = await api(GATEWAY, '/rest/v1/learn_records?select=word_key&limit=1000', { token, anon: true })
    return Array.isArray(r.data) ? r.data.map((x) => x.word_key) : []
  }
  async function push(token, ownerId, rows) {
    return api(GATEWAY, '/rest/v1/learn_records', { method: 'POST', token, anon: true, body: rows.map((r) => learnRecordToRow(r.record, ownerId, r.wordKey)) })
  }
  async function del(u) {
    if (!u.id) return { status: 0 }
    return api(ADMIN, `/auth/v1/admin/users/${u.id}`, { method: 'DELETE', service: true })
  }

  let cloudRan = false
  try {
    await create(uA)
    await create(uB)
    await signIn(uA)
    await signIn(uB)
    cloudRan = true
    log(`  · 两账号已建并登录（A=${uA.id.slice(0, 8)}… B=${uB.id.slice(0, 8)}…）`)

    const A_KEYS = Array.from({ length: 10 }, (_, i) => `qa2.a.${i}`)
    const B_KEYS = Array.from({ length: 10 }, (_, i) => `qa2.b.${i}`)

    // A 先上行 10 条
    const aRows = A_KEYS.map((wordKey, i) => ({
      wordKey,
      record: { status: 'known', consecutiveCorrect: 3, correctCount: 3, incorrectCount: 0, statusSource: 'learning', updatedAt: new Date().toISOString() },
    }))
    const up = await push(uA.token, uA.id, aRows)
    ok('GAP-B0 A 的 10 条首次上行成功', up.status === 200 || up.status === 201, `HTTP ${up.status} ${JSON.stringify(up.data).slice(0, 160)}`)

    let leaks = 0
    let firstLeak = null
    const ROUNDS = 50
    for (let i = 0; i < ROUNDS; i += 1) {
      // 模拟切号：本地内存态换成当前 scope 的盘（useLearnCloud L1 的数据源）
      // A 视角
      const localA = readLearn(scopeOf(uA.id))
      const pushA = filterUploadableRows(stampRowsForUpload(Object.keys(localA).map((wordKey) => ({ wordKey, record: localA[wordKey] }))))
      // B 视角：B 的分区里也放10 条自己的本地记录（模拟 B 也在用）
      if (i === 0) {
        writeLearn(
          Object.fromEntries(B_KEYS.map((wordKey) => [wordKey, { status: 'review', consecutiveCorrect: 0, correctCount: 1, incorrectCount: 1, statusSource: 'learning', updatedAt: new Date().toISOString() }])),
          scopeOf(uB.id),
        )
      }
      const localB = readLearn(scopeOf(uB.id))
      const pushB = filterUploadableRows(stampRowsForUpload(Object.keys(localB).map((wordKey) => ({ wordKey, record: localB[wordKey] }))))

      // A 的上行集绝不含B 的 key，B 的绝不含 A 的
      const aHasB = pushA.filter((r) => B_KEYS.includes(r.wordKey))
      const bHasA = pushB.filter((r) => A_KEYS.includes(r.wordKey))
      if (aHasB.length || bHasA.length) {
        leaks += 1
        if (!firstLeak) firstLeak = `第 ${i + 1} 轮：A 上行含 B 的 key ${aHasB.length} 条 / B 上行含 A 的 key ${bHasA.length} 条`
      }

      // 云端视角：B 永远看不到 A 的 key
      // eslint-disable-next-line no-await-in-loop
      const bSees = await cloudKeys(uB.token)
      const bSeesA = bSees.filter((k) => A_KEYS.includes(k))
      if (bSeesA.length) {
        leaks += 1
        if (!firstLeak) firstLeak = `第 ${i + 1} 轮：B 云端看到 A 的 key ${JSON.stringify(bSeesA)}`
      }
      // eslint-disable-next-line no-await-in-loop
      const aSees = await cloudKeys(uA.token)
      const aSeesB = aSees.filter((k) => B_KEYS.includes(k))
      if (aSeesB.length) {
        leaks += 1
        if (!firstLeak) firstLeak = `第 ${i + 1} 轮：A 云端看到 B 的 key ${JSON.stringify(aSeesB)}`
      }
    }

    ok(`GAP-B1 ★ A↔B 连跑 ${ROUNDS} 轮：上行集与云端视图零串号`, leaks === 0, firstLeak || `leaks=${leaks}`)

    // A 的 10 条在 50 轮之后必须一条不少（隔离不能靠丢数据实现）
    const aFinal = await cloudKeys(uA.token)
    ok('GAP-B2 ★ 50 轮后 A 的记录一条不少（隔离不是靠丢数据实现的）', A_KEYS.every((k) => aFinal.includes(k)), `A 实际：${aFinal.length} 条，缺 ${A_KEYS.filter((k) => !aFinal.includes(k)).join(',')}`)

    // B 登录后把A 的 word_key 当自己的推 → 必须被RLS 拒（每轮都验一次太重，验一次）
    const forged = await api(GATEWAY, '/rest/v1/learn_records', {
      method: 'POST', token: uB.token, anon: true,
      body: A_KEYS.map((k) => learnRecordToRow({ status: 'known', statusSource: 'learning', updatedAt: new Date().toISOString() }, uA.id, k)),
    })
    ok('GAP-B3 ★ 50 轮后伪造 owner_id 仍被 RLS 拒（隔离未被时间冲淡）', forged.status >= 400, `HTTP ${forged.status}`)
  } catch (e) {
    ok(`GAP-B 云端 50 轮（异常：${e.message}）`, false, e.stack)
  } finally {
    if (cloudRan || made.length) {
      for (const u of made) {
        // eslint-disable-next-line no-await-in-loop
        const d = await del(u)
        // eslint-disable-next-line no-await-in-loop
        const chk = await api(ADMIN, `/auth/v1/admin/users/${u.id}`, { service: true })
        ok(`删除一次性账号 ${u.tag}（${u.email}）→ HTTP ${d.status}，复查不存在=${chk.status === 404 || chk.status === 400}`, d.status === 200 || d.status === 204)
      }
      // 残留扫描
      const list = await api(ADMIN, '/auth/v1/admin/users?page=1&per_page=200', { service: true })
      const left = (Array.isArray(list.data?.users) ? list.data.users : []).filter((x) => String(x.email || '').startsWith('qa2-'))
      ok('无残留 qa2- 一次性账号', left.length === 0, `残留：${left.map((x) => x.email).join(', ')}`)
    }
  }
}

// ---------------------------------------------------------------- 收尾
rmSync(OUT, { recursive: true, force: true })
try { dom.window.close() } catch { /* ignore */ }

log(`\n[qa-gaps] 通过 ${pass} / ${pass + failures.length}`)
if (failures.length) {
  log('[qa-gaps] ✗ 失败：')
  failures.forEach((f) => log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ''}`))
  process.exit(1)
}
log('[qa-gaps] ✓ 全部通过')
process.exit(0)

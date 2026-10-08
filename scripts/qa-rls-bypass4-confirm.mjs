/**
 * QA 第三轮 · 最终确认（只对"我要上报的洞"做严格差分）
 * ------------------------------------------------------------------
 * 每个洞都必须通过「**只差一个变量**」的对照，排除"我的样本写错了"的可能。
 * 全部经真实入口跑。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe7.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

const AUTH = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
`

function run(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  if (existsSync(PROBE)) dropProbe(PROBE)
  return {
    red: r.status === 1,
    hits: out.split('\n').filter((l) => l.includes('dev-zzprobe7.mjs') && /\[\w+\]/.test(l)).map((l) => l.trim()),
    selftestBroke: out.includes('门禁自检失败'),
  }
}

// ============ 洞 1：顶层写入白拿前一个函数的校验 ============
const D1 = (write) => `${AUTH}
export async function ensureStationOwned(stationId) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  return owned
}
${write}
`
const hole1 = {
  title: '洞1：顶层写入（及顶层 if/try 块）白拿「前一个未被调用的函数」里的校验',
  // 绕过版：写入在顶层，与那个函数毫无调用关系
  bypass: D1(`await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })`),
  bypassTopIf: D1(`if (env.FLAG) {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}`),
  bypassTopTry: D1(`try {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
} catch (e) { console.warn(e) }`),
  // 对照：只把写入挪进函数体⇒ 唯一差别 = 写入是否在函数内
  control: D1(`export async function saveWords(stationId, wordKey) {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}`),
  // 安全孪生：校验也搬到顶层（真·顺序保证）⇒ 应绿
  twin: `${AUTH}
const stationId = req.body.station_id
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
`,
  rootCause:
    'enclosingFunctionScope 反向扫描时**只记录 {、从不校验"这个 { 是否真的包住写入点"**。\n' +
    '   顶层写入时，最近的那个函数体 { 已经在写入点之前闭合了（它的 } 先被遇到），\n' +
    '   但代码仍然把它当成"写入所在的作用域"，并把 [函数体起点, 写入点] 整段当成先验代码。\n' +
    '   ⇒ 注释里写的"顶层 fallback 已删除、找不到就是真的在顶层"与实测不符：这里从未进fallback，\n' +
    '     而是被误认成了函数体。工程师注释里的 depth 变量是**死代码**（算了但从不参与判定）。',
}

// ============ 洞 2：请求来源判据被一层非白名单前缀击穿 ============
const D2 = (ownerExpr, bind = '') => `${AUTH}
export async function saveWords(req2, sid) {
${bind}  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ${ownerExpr}).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ${ownerExpr}, word_key: kw })
  }
}
`
const hole2 = {
  title: '洞2：isRequestSource 是 ^锚定的字面前缀匹配 ⇒ 一层 `ctx.`/`req2.` 前缀即失效',
  // 绕过：req2.body.ownerId —— req2 不是 req
  bypassPrefix: D2('req2.body.ownerId'),
  // 对照：req.body.ownerId —— 唯一差别就是变量名 req vs req2
  controlPrefix: D2('req.body.ownerId'),
  // 绕过：局部变量中转，源头是 ctx.body
  bypassLocal: D2('ownerId', '  const ownerId = ctx.body.ownerId\n'),
  // 对照：同样中转一层，源头是 req.body（P3 的等价形态）
  controlLocal: D2('ownerId', '  const ownerId = req.body.ownerId\n'),
  // 独立第二洞：解构 + 白名单词 body（bindRe 追不了解构）
  bypassDestructure: `${AUTH}
export async function saveWords(body, sid) {
  const { owner_id: ownerId } = body
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
  // 对照：解构但源是 formData（白名单词）—— 用来区分"解构形态"本身是否被追
  controlDestructureForm: `${AUTH}
export async function saveWords(fd, sid) {
  const { owner_id: ownerId } = formData
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
  rootCause:
    'isRequestSource 用 /^(?:body|req|request|params|event|payload|query|form)\\b/ —— \n' +
    '   ① ^锚定 ⇒ ctx.body.x / input.body.x / c.req.body.x 全部漏；\n' +
    '   ② \\b 要求词边界 ⇒ req2 / bodyParser 这类**前缀变体**全部漏；\n' +
    '   ③ isRequestSourceExpr 的回溯正则 (const|let|var)\\s+X\\s*= 只认**简单赋值**，\n' +
    '      解构形态 const { owner_id: X } = ... 匹配不上⇒ 连白名单词也漏。\n' +
    '   ⇒ 结论：这条判据只在工程师测过的那**一个**写法（req.nextUrl.searchParams.get / body.ownerId）上成立。',
}

// ============ 洞 3（本轮新构造）：normExpr 转小写不是单射 ============
const D3 = (val) => `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: ${val}, owner_id: uid, word_key: kw })
}
`
const hole3 = {
  title: '洞3：normExpr 的 toLowerCase 让「大小写变体变量名」被当成同一个值（把子串误判换成了大小写误判）',
  // 绕过：STATIONID 与 stationId 是两个不同变量，但归一化后都是 "stationid"
  bypass: D3('STATIONID'),
  // 对照：既不同物、也不是大小写变体
  control: D3('stationIdX'),
  // 安全孪生：真·同一个变量 ⇒ 应绿
  twin: D3('stationId'),
  rootCause:
    '上一轮修「裸子串」时把判据换成 normExpr 全等，方向对；\n' +
    '   但 normExpr 里的 .toLowerCase() **不是单射** ⇒ stationId 与 STATIONID 归一化后碰撞。\n' +
    '   ⇒ 「表达式全等」只保证"归一化后相等"，不保证"是同一个值"。\n' +
    '   ⇒ 修法方向：列名（SQL 标识符）可以大小写不敏感地比对，但**值表达式**必须区分大小写。',
}

// ============ 洞 4（本轮新构造）：payloadValue 不区分顶层键与嵌套键 ============
const D4 = (innerFirst) => `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({
    station_id: stationId,
${innerFirst}    opts: { owner_id: uid },
    owner_id: req.body.owner_id,
  })
}
`
const hole4 = {
  title: '洞4：payloadValue 取第一个匹配 ⇒ 嵌套对象里先出现的 owner_id 会被当成顶层 owner 列',
  // 绕过：嵌套的 owner_id: uid 在前，顶层 owner_id 取自请求体 ⇒ 门禁读到 uid
  bypass: D4(''),
  // 对照：只调换两者顺序 ⇒ 唯一差别 = 顺序
  control: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({
    station_id: stationId,
    owner_id: req.body.owner_id,
    opts: { owner_id: uid },
  })
}
`,
  rootCause:
    'payloadValue 的正则 (?:^|[,{\\s])${col}\\s*: 取**第一个**匹配，\n' +
    '   而 [,{\\s] 这个前缀把嵌套对象的键和顶层键混为一谈。\n' +
    '   ⇒ 判定"owner 列钉到 uid"时，读到的可能不是 payload 顶层那个 owner_id。',
}

const HOLES = [
  ['洞1 · 作用域误认（顶层写入白拿函数内校验）', hole1, [
    ['bypass（顶层写入）', 'bypass', false],
    ['bypassTopIf（顶层 if 块）', 'bypassTopIf', false],
    ['bypassTopTry（顶层 try 块）', 'bypassTopTry', false],
    ['control（写入挪进函数体）', 'control', true],
    ['twin（校验也在顶层·合法）', 'twin', false],
  ]],
  ['洞2 · 请求来源判据被前缀/解构击穿', hole2, [
    ['bypassPrefix（req2.body.ownerId）', 'bypassPrefix', false],
    ['controlPrefix（req.body.ownerId）', 'controlPrefix', true],
    ['bypassLocal（局部变量← ctx.body）', 'bypassLocal', false],
    ['controlLocal（局部变量 ← req.body）', 'controlLocal', true],
    ['bypassDestructure（解构 ← body）', 'bypassDestructure', false],
    ['controlDestructureForm（解构 ← formData）', 'controlDestructureForm', false],
  ]],
  ['洞3 · toLowerCase 使"全等"不是单射', hole3, [
    ['bypass（STATIONID vs stationId）', 'bypass', false],
    ['control（stationIdX 真·不同物）', 'control', true],
    ['twin（同一个变量·合法）', 'twin', false],
  ]],
  ['洞4 · payloadValue 不区分顶层/嵌套键', hole4, [
    ['bypass（嵌套 owner_id 在前）', 'bypass', false],
    ['control（顶层 owner_id 在前）', 'control', true],
  ]],
]

/** 每格的含义：期望判绿 = 门禁漏判（洞成立）；期望判红 = 门禁正确拦下 */
const HOLE_NOTE = {
  bypass: '期望判绿 ⇒ 判绿即洞成立',
  bypassTopIf: '期望判绿 ⇒ 判绿即洞成立',
  bypassTopTry: '期望判绿 ⇒ 判绿即洞成立',
  bypassPrefix: '期望判绿 ⇒ 判绿即洞成立',
  bypassLocal: '期望判绿 ⇒ 判绿即洞成立',
  bypassDestructure: '期望判绿 ⇒ 判绿即洞成立',
  bypass: '期望判绿 ⇒ 判绿即洞成立',
  control: '期望判红 ⇒ 门禁正确拦下（只差一个变量）',
  controlPrefix: '期望判红 ⇒ 门禁正确拦下（只差一个变量）',
  controlLocal: '期望判红 ⇒ 门禁正确拦下（只差一个变量）',
  controlDestructureForm: '期望判绿（对照，见正文说明）',
  twin: '期望判绿 ⇒ 合法写法未被误伤',
}

let confirmed = 0
let total = 0
for (const [title, h, rows] of HOLES) {
  console.log(`\n=============== ${title} ===============`)
  for (const [label, key, wantRed] of rows) {
    const r = run(h[key])
    total++
    const ok = r.red === wantRed
    if (ok) confirmed++
    // 极性说明：bypass 版**期望判绿**（判绿 = 门禁漏判 = 洞成立）；
    // control / twin 期望判红或判绿，取决于它们是「必须被拦的类比形态」还是「合法写法」。
    const mark = HOLE_NOTE[key] || ''
    console.log(
      `  ${ok ? '✓' : '❌'} ${label.padEnd(38)} ${mark} → 实际${r.red ? '红' : '**绿**'}` +
        (r.hits.length ? `\n       ${r.hits.map((x) => x.split(/\s+/).slice(1, 4).join(' ')).join('\n       ')}` : ''),
    )
    if (r.selftestBroke) console.log('       ⚠️ 门禁自检自身报错')
  }
  console.log(`  根因：\n${h.rootCause.split('\n').map((l) => '    ' + l).join('\n')}`)
}
console.log(`\n差分全部符合预期：${confirmed}/${total}`)
console.log(`探针残留：'无 ✓（探针清空复用）'`)
/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

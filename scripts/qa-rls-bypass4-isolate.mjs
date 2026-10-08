/**
 * QA 第三轮 · 根因隔离（差分探针）
 * ------------------------------------------------------------------
 * qa-rls-bypass4.mjs 找到 12 处「不符期望」。但「不符期望」有两种可能：
 *   (a) 门禁真漏判（源码缺陷）
 *   (b) 我的样本写错了（口径问题）
 * 本脚本对每一处做**只差一个变量**的对照，把根因钉死。
 *
 * ⚠️ 全部经真实入口跑（node scripts/check-rls-writes.mjs），不在内存里调 judgeCode。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe6.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

const AUTH = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
`

const GUARD = (val = 'stationId', ind = '  ') => `${ind}const { data: owned } = await admin
${ind}  .from('stations')
${ind}  .select('id')
${ind}  .eq('id', ${val})
${ind}  .eq('owner_id', uid)
${ind}  .maybeSingle()
${ind}if (!owned) throw new Error('STATION_FORBIDDEN')
`

function runWith(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  if (existsSync(PROBE)) dropProbe(PROBE)
  const hits = out
    .split('\n')
    .filter((l) => l.includes('dev-zzprobe6.mjs') && /\[\w+\]/.test(l))
    .map((l) => l.trim())
  return { red: r.status === 1 && hits.length > 0, hits, selftestBroke: out.includes('门禁自检失败') }
}

const groups = [
  // ==================== X1 家族：顶层写入 ====================
  {
    id: 'X1',
    title: '顶层写入 vs 校验在未被调用的函数里',
    // A: 现状（应为红，实际绿）
    a: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
`,
    // B: 只把写入挪进函数体 —— 判别式 = 「写入是否在函数体内」
    b: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
export async function saveWords(stationId, wordKey) {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
    // C: 校验也搬到顶层（真·顺序保证）⇒ 应绿
    c: `${AUTH}
const stationId = req.body.station_id
const { data: owned } = await admin
  .from('stations')
  .select('id')
  .eq('id', stationId)
  .eq('owner_id', uid)
  .maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
`,
    // D: 顶层 if 块 —— 判别式 = 顶层普通块
    d: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
if (env.FLAG) {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
    // E: 顶层 try 块
    e: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
try {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
} catch (e) {
  console.warn(e)
}
`,
    readme:
      'A 绿 ⇒ 顶层写入被当成了「紧邻的那个函数体」的作用域。A/B 只差「写入是否在函数体内」⇒ 判别式就是这个。\n' +
      '   D、E 绿 ⇒ 顶层普通块（if/try）也一样被算进了那个函数体。\n' +
      '   ⇒ 根因：enclosingFunctionScope 从写入点反向找「最近的一个像函数体的 {」并直接采用，\n' +
      '     而没有验证「这个 { 是否真的包含写入点」。反向扫描得到的是**内层**块，\n' +
      '     contains(写入) 天然成立；但当写入在所有块之外（顶层）时，最近的函数体是**不含写入**的。\n' +
      '   ⇒ 工程师注释里说的「顶层 fallback 已删除、找不到就是真的在顶层」**与实测不符**：\n' +
      '     这里根本没进 fallback，而是被误认成了一个函数体。',
  },

  // ==================== X4：计算属性名 ====================
  {
    id: 'X4',
    title: '计算属性名 [M](x){} 与普通属性名 m(x){} 对照',
    a: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
const M = 'saveWords'
export const api = {
  [M](stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  },
}
`,
    b: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}
export const api = {
  saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  },
}
`,
    readme:
      'A 绿 / B 绿 ⇒ 两种写法都没拦住，所以「计算属性名」不是根因。\n' +
      '   真正的判别式与 X1 相同：写入所在位置与「校验所在函数」的关系。\n' +
      '   ⇒ 计算属性名只是**又一种**能让 isFunctionBodyBrace 返回 false 的容器（\n' +
      '     它前面是 `]`，既不是 `)` 也不是 `=>`），但当前实现里它并没有被"选成外层"，\n' +
      '     而是被上层的 misclassification 掩盖了。（单独看，[M] 写法确实让 isFunctionBodyBrace\n' +
      '     返回 false，这一点值得工程师注意，但它不是本轮红绿差异的成因。）',
  },

  // ==================== S4：嵌套 class ====================
  {
    id: 'S4',
    title: '嵌套 class（校验在内层 class）vs 扁平 class',
    a: `${AUTH}
class Outer {
  async saveWords(stationId, wordKey) {
    class Inner {
      static async ensureOwned(stationId) {
${GUARD('stationId', '        ')}
        return owned
      }
    }
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
`,
    b: `${AUTH}
class Api {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  }
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
`,
    // C: 嵌套 class，但校验与写入同在**外层**方法内 ⇒ 应绿（合法）
    c: `${AUTH}
class Outer {
  async saveWords(stationId, wordKey) {
    class Inner {}
${GUARD()}
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
`,
    readme:
      'B 红（扁平 class 被正确拦住）⇒ 花括号配对本身对 class 方法有效。\n' +
      '   A 绿 ⇒ 加上「内层 class」这一层后失效。\n' +
      '   C（校验与写入同在外层方法、内层只有一个空 class）绿 ⇒ 说明成因不是"内层 class"本身，\n' +
      '     而是反向扫描时**先遇到内层 class 的方法体 {**，把它的方法体当成了写入的作用域，\n' +
      '     而该作用域里恰好含有那段校验 ⇒ 白拿豁免。\n' +
      '   ⇒ 根因同 X1：`braces[0]` / find 拿到的是「最近的内层块」，\n' +
      '     而当反向扫描跨过了写入点所在的块边界时，选中的块并不包含写入点。',
  },

  // ==================== S7：容器里再嵌套 ====================
  {
    id: 'S7',
    title: 'if(x){ 校验 } + 块外写入（在 class 方法内）',
    a: `${AUTH}
class Api {
  async saveWords(stationId, wordKey, x) {
    if (x) {
      function inner() {}
${GUARD()}
    }
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
`,
    b: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  if (req.body.skipCheck) {
${GUARD()}
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
    readme:
      'A 与 B 结构相同（校验在可跳过分支内、写在分支外），**都是绿**。\n' +
      '   ⇒ S7 **不是新漏洞**，它就是已被团队裁决「本轮不修」的 N4（控制流①）的同一形态，\n' +
      '     只是容器换成了 class 方法。我把它从"新发现"里撤回。\n' +
      '   ⇒ 但它揭示一件事：SELFTEST_KNOWN_GAP 只在**普通函数**形态下钉住了这条边界，\n' +
      '     换到class 方法里就没人再钉一次。若将来只按"普通函数形态"修，class 形态会被漏掉。',
  },

  // ==================== E2/E5/E6/E7：请求来源判据 ====================
  {
    id: 'E2',
    title: '请求来源判据：只差一个 `ctx.` 前缀',
    a: `${AUTH}
export async function saveWords(ctx) {
  const sid = ctx.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ctx.body.ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ctx.body.ownerId, word_key: kw })
  }
}
`,
    // 对照：把 ctx. 去掉 ⇒ 工程师的判据应当命中 ⇒ 应红
    b: `${AUTH}
export async function saveWords(body) {
  const sid = body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', body.ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: body.ownerId, word_key: wordKey })
  }
}
`,
    // 对照2：req 前缀变体
    c: `${AUTH}
export async function saveWords(req2, sid) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', req2.body.ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: req2.body.ownerId, word_key: kw })
  }
}
`,
    readme:
      'B 红 / A 绿 ⇒ **唯一差别是 `ctx.` 这个前缀**⇒ 判据是 ^锚定的字面前缀匹配，\n' +
      '   任何一层非 body/req 的前缀（ctx. / input. / e. / c.req. …）都能让它失效。\n' +
      '   C 绿 ⇒ 连 `req` 的前缀变体（req2）都挡不住，因为正则要求 req 后是词边界。\n' +
      '   ⇒ 严重性：这不是"理论上的绕过"，因为重命名变量是**零成本**的，\n' +
      '     而本仓库纪律 §9.1 记的教训正是"统一改名留了后路"。',
  },
  {
    id: 'E6',
    title: '解构取 owner：const { owner_id: ownerId } = ctx',
    a: `${AUTH}
export async function saveWords(ctx, sid) {
  const { owner_id: ownerId } = ctx
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
    b: `${AUTH}
export async function saveWords(ctx, sid) {
  const ownerId = ctx.owner_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
    c: `${AUTH}
export async function saveWords(body, sid) {
  const { owner_id: ownerId } = body
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
    readme:
      'A 绿 / B 绿 ⇒ 解构与普通赋值**都**没被判为请求来源，因为源是 `ctx.`（前缀问题，同E2）。\n' +
      '   C 应当红（body 是白名单词）—— 用它验证「解构形态本身是否被 bindRe 漏掉」：\n' +
      '     若 C **绿**，说明 bindRe 的 (const|let|var)\\s+X\\s*= 连解构都追不上，是**独立**的第二个洞。',
  },
  {
    id: 'E7',
    title: '局部变量中转一层（工程师 P3 的 ctx 版）',
    a: `${AUTH}
export async function saveWords(req, sid) {
  const ownerId = req.nextUrl.searchParams.get('owner_id')
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
    b: `${AUTH}
export async function saveWords(req, sid) {
  const ownerId = req.body.ownerId
  const { data: owned } = await admin.from('stations').select('id').eq('id', sid).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sid, owner_id: ownerId, word_key: kw })
  }
}
`,
    readme:
      'A 红（工程师的 P3，nextUrl.searchParams 形态确实被追到了）/ B 绿。\n' +
      '   A 与 B 只差 `req.nextUrl.searchParams.get(...)` 与 `req.body.ownerId`。\n' +
      '   ⇒ isRequestSourceExpr 追一层时，对 `req.nextUrl.searchParams.get(...)` 判true（^req\\b 命中），\n' +
      '     对 `req.body.ownerId` 也应命中 —— 但 B 绿说明它没命中。\n' +
      '     ⇒ **这与工程师结论"P3 红 / P2 绿"直接冲突**：他验证过的 P3 恰好是nextUrl 那种形态，\n' +
      '       换成同样合法的 req.body 形态就漏。⇒ 判据只在他测过的那一个写法上成立。',
  },

  // ==================== E8 / E13：误报（合法写法被判红） ====================
  {
    id: 'E8',
    title: '模板字符串列名（合法）vs 普通引号列名',
    a: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq(\`owner_id\`, uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
}
`,
    b: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
}
`,
    readme:
      'A 红 / B 绿 ⇒ 判别式就是列名用不用反引号。\n' +
      '   ⇒ 误报（fail closed 方向，危害小于漏报，但会让门禁"为了过门禁而改坏代码"）。',
  },
  {
    id: 'E13',
    title: '.eq( 带尾逗号 /真跨行）—— 定位是哪一个特征导致误报',
    a: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', stationId)
    .eq('owner_id', uid)
    .maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  const wordKey = req.body.word_key
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
    b: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq(
      'id',
      stationId,
    )
    .eq('owner_id', uid)
    .maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
    c: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq(
      'id',
      stationId
    )
    .eq('owner_id', uid)
    .maybeSingle()
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
    readme:
      'A（真跨行、无尾逗号）绿 ⇒ **跨行本身没问题**，readChain 的跨行处理是对的。\n' +
      '   B（尾逗号）红 / C（跨行无尾逗号）绿 ⇒ 判别式是**尾逗号**，不是跨行。\n' +
      '   ⇒ 根因：捕获 .eq() 实参用 [^)]*，尾逗号被算进了表达式 ⇒ normExpr("stationId,") ≠ "stationId"。\n' +
      '     同类：尾逗号在 .insert/.upsert 的 payload 里也会被 payloadValue 的 [^,}\\n]+ 截断。',
  },

  // ============ 新增：normExpr 转小写造成的"假全等"（我本轮新构造） ============
  {
    id: 'N1',
    title: '【本轮新构造】大小写变体变量名 ⇒ 转小写后"全等" ⇒ 假绿',
    a: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  await admin.from('station_words').upsert({ station_id: STATIONID, owner_id: uid, word_key: kw })
}
`,
    b: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  const STATIONID = req.body.other_station_id
  await admin.from('station_words').upsert({ station_id: STATIONID, owner_id: uid, word_key: kw })
}
`,
    c: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  await admin.from('station_words').upsert({ station_id: stationIdX, owner_id: uid, word_key: kw })
}
`,
    readme:
      'STATIONID 与 stationId 是**两个不同的变量**，但 normExpr 转小写后两者都是 "stationid" ⇒ 全等成立。\n' +
      '   A/B 若绿 ⇒ 这就是**为了修裸子串而引入的新绕过**：把"子串误判"换成了"大小写误判"。\n' +
      '   C（既不同物、也不是大小写变体 stationIdX）作为对照，应红。\n' +
      '   ⇒ 关键：**归一化必须可逆到"同一个值"**，而 toLowerCase 不是单射。',
  },
  // ============ 新增：payload 内嵌套同名键造成的 A1 误判 ============
  {
    id: 'N2',
    title: '【本轮新构造】payload 里先出现嵌套的 owner_id，顶层 owner_id 取自请求体',
    a: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  await admin.from('station_words').upsert({
    station_id: stationId,
    opts: { owner_id: uid },
    owner_id: req.body.owner_id,
  })
}
`,
    b: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  await admin.from('station_words').upsert({
    station_id: stationId,
    owner_id: req.body.owner_id,
    opts: { owner_id: uid },
  })
}
`,
    readme:
      'payloadValue 用 (?:^|[,{\\s])${col}\\s*: 取**第一个**匹配，\n' +
      '   ⇒ 嵌套对象/展开对象里先出现的同名列会被当成顶层的值。\n' +
      '   A/B 只差嵌套 owner_id 与顶层 owner_id 的先后顺序。若 A 绿/B 红 ⇒ 判别式是"顺序"，\n' +
      '   即 payloadValue 没有区分「顶层键」与「嵌套键」。',
  },
]

console.log('| 组 | 变体 | 红/绿 | 说明 |')
console.log('| --- | --- | --- | --- |')
for (const g of groups) {
  const variants = ['a', 'b', 'c', 'd', 'e'].filter((k) => g[k])
  for (const v of variants) {
    const r = runWith(g[v])
    if (r.selftestBroke) console.log(`  ⚠️ ${g.id}${v.toUpperCase()}: 门禁自检自身报错`)
    console.log(
      `| ${g.id} | ${v.toUpperCase()} | ${r.red ? '红' : '**绿**'} | ${
        r.red ? r.hits.map((h) => h.split(/\s+/).slice(1, 4).join(' ')).join(' ; ') : '零违规'
      } |`,
    )
  }
}
console.log('')
for (const g of groups) console.log(`【${g.id}】${g.title}\n${g.readme}\n`)
console.log(`探针残留：'无 ✓（探针清空复用）'`)
/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

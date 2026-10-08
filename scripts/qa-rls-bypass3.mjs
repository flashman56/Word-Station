/**
 * QA 第二轮 · 根因隔离（差分探针）
 * ------------------------------------------------------------------
 * qa-rls-bypass2.mjs 找到 6 个绕过形态。本脚本回答**每一个的根因是什么** ——
 * 因为「门禁绿了」有两种完全不同的可能：
 *   (a) 门禁真的漏判了（源码缺陷）
 *   (b) 我的探针没被真正执行（样本/口径问题）
 *
 * 做法：每个形态跑一组**只差一个变量**的对照。
 *   - 若「绕过版绿 /对照版红」⇒ 该形态的根因被证实，且判别式就是那一个变量。
 *   - 对照版也要用真实入口跑，不能靠推理。
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe3.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

const AUTH = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
`
const GUARD = (val = 'stationId') => `
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', ${val})
    .eq('owner_id', uid)
    .maybeSingle()
`

function runWith(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  if (existsSync(PROBE)) dropProbe(PROBE)
  return {
    code: r.status,
    hits: out
      .split('\n')
      .filter((l) => l.includes('dev-zzprobe3.mjs') && /\[\w+\]/.test(l))
      .map((l) => l.trim()),
  }
}

//每组：[标题, 绕过版(应绿=被绕过), 对照版(应红=没被绕过), 判别式说明]
const groups = [
  {
    id: 'N1',
    title: 'class 方法：判别式 = 校验所在位置是不是「被正则识别的函数起点」',
    bypass: `${AUTH}
class Api {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  }
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
export async function handler(req) {
  return new Api(admin).saveWords(req.body.station_id, req.body.word_key)
}
`,
    //★ 精确根因对照：**唯一**差别 = 在「校验」与「写入」之间插一个具名 function。
    //   若根因真是「class 方法不被识别为函数起点」，则切片起点后移 ⇒ 校验被排除 ⇒ 红。
    control: `${AUTH}
class Api {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  }
  async saveWords(stationId, wordKey) {
    function _pad() {}
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}
export async function handler(req) {
  return new Api(admin).saveWords(req.body.station_id, req.body.word_key)
}
`,
    why: '绕过版：写入前最近的「函数起点标记」是 class 之前（此处 marks 为空 ⇒ fallback start=0）⇒ 校验仍在切片内 ⇒ 绿。对照版：只加了一行 function _pad(){}，最近的标记变成它 ⇒ 切片从_pad 起 ⇒ 校验被排除 ⇒ 红。⇒ 证实根因是「函数起点正则只认 function具名 / => {，不认 class 方法」，且 fallback 会退回「看整个文件」。',
  },
  {
    id: 'N1b',
    title: 'class 方法（对象字面量写法，同一形态的另一种语法糖）',
    bypass: `${AUTH}
const api = {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  },
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  },
}
export async function handler(req) {
  return api.saveWords(req.body.station_id, req.body.word_key)
}
`,
    control: `${AUTH}
const api = {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  },
  async saveWords(stationId, wordKey) {
    const _pad = function _padInner() {}
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  },
}
export async function handler(req) {
  return api.saveWords(req.body.station_id, req.body.word_key)
}
`,
    why: '同 N1，换成对象字面量方法⇒ 同样绕过。对照版只插了一个**具名** function _padInner(){} ⇒ 转红。（注：先试过 const _pad = function () {} 匿名写法，**没能**转红 —— 因为匿名 function 同样不被「函数起点」正则识别。这说明该正则对函数形态的覆盖比注释宣称的更窄：只认 function + 名字。）⇒ 该缺陷是**语法糖级别**的：class 方法 / 对象方法 / 匿名 default export 都可复现。',
  },
  {
    id: 'N3',
    title: '「同一个外键值」：判别式 = 写入侧变量名是否为校验链文本的**子串**',
    bypass: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('FORBIDDEN')
  const id = req.body.other_station_id
  await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
}
`,
    control: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('FORBIDDEN')
  const zzz_unrelated_name = req.body.other_station_id
  await admin.from('station_words').upsert({ station_id: zzz_unrelated_name, owner_id: uid, word_key: req.body.word_key })
}
`,
    why: '绕过版写入变量名 id，而 id 是校验链文本（.eq(\'id\',...)）的子串 ⇒ includes() 为真 ⇒ 绿。对照版变量名不出现在链文本中 ⇒ includes() 为假 ⇒ 红。⇒ 证实判据是**裸子串**，不是同一个值。',
  },
  {
    id: 'N4',
    title: '控制流：校验包在「调用方可跳过」的分支里',
    controlSafeTwin: true,
    bypass: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  if (req.body.skipCheck) {
${GUARD()}
    if (!owned) throw new Error('FORBIDDEN')
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
    // ★ 对照组保留**完全相同**的 if 包裹，唯一差别 = 分支条件恒真（if (1)），
    //   即「校验一定执行」。若门禁有控制流关联能力，两版应同红；
    //   若两版都绿 ⇒ 门禁对「校验是否真的会执行」毫无感知。
    control: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  if (1) {
${GUARD()}
    if (!owned) throw new Error('FORBIDDEN')
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
    why: '两版的if 结构、写入侧、变量名全同，只差「分支能否被调用方跳过」。**两版都绿**⇒ 门禁只做文本先后判断，对「校验是否真的执行到」零感知 ⇒ 攻击者用 body.skipCheck=true 即可完全跳过归属校验。这是源码缺陷，不是我的样本问题（对照组的 if(1) 是恒真分支，本就合法，但它同样绿说明门禁分不出这两者）。',
  },
  {
    id: 'N5',
    title: 'try/catch：校验在 try 内且异常被吞掉',
    controlSafeTwin: true,
    bypass: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  try {
${GUARD()}
  } catch (e) {
    console.warn(e)
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
    // ★ 对照组：把 owned 真正用起来做拒绝（catch 里也拒绝）。
    control: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  try {
${GUARD()}
    if (!owned) throw new Error('FORBIDDEN')
  } catch (e) {
    throw new Error('FORBIDDEN')
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
    why: '对照组是**真正的**防御写法（try 内拒绝 + catch 拒绝），语义上安全，但它同样绿——所以本组的判别意义是：门禁接受 try/catch 包裹的校验，且无法区分「catch 吞掉异常后继续写入」（绕过版，真实越权）与「catch 也拒绝」（对照版，安全）。⇒ catch 吞异常即可让归属校验形同虚设。',
  },
  {
    id: 'N6',
    title: '循环：判别式 = 写入是否在循环体内且循环变量来自请求',
    bypass: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('FORBIDDEN')
  for (const id of req.body.targets) {
    await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
  }
}
`,
    control: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('FORBIDDEN')
  for (const zzz_unrelated_name of req.body.targets) {
    await admin.from('station_words').upsert({ station_id: zzz_unrelated_name, owner_id: uid, word_key: req.body.word_key })
  }
}
`,
    why: '绕过版循环变量名 id 命中子串 ⇒ 绿。对照版改名即红 ⇒ 同一函数内**整个循环体**都在A2 判定范围内，无「每轮重新校验」的概念。',
  },
]

console.log('| 组 | 形态 | 绕过版 | 安全孪生对照版 | 证实 |')
console.log('| --- | --- | --- | --- | --- |')
let confirmed = 0
for (const g of groups) {
  const b = runWith(g.bypass)
  const c = runWith(g.control)
  const bGreen = !(b.code === 1 && b.hits.length > 0)
  const cRed = c.code === 1 && c.hits.length > 0
  // 两类证实：
  //   A) 判别式对照：绕过版绿 + 对照版红 ⇒ 根因被隔离到那一个变量上
  //   B) 安全孪生对照：绕过版绿 + 对照版也绿（对照版本身是**安全**写法，本就该绿）
  //      ⇒ 证实门禁对「安全孪生 / 不安全孪生」毫无区分能力
  const wantControlRed = g.controlSafeTwin !== true
  const ok = wantControlRed ? bGreen && cRed : bGreen && !cRed
  const how = wantControlRed
    ? cRed
      ? '红 ✅ 判别式隔离'
      : '绿⚠️'
    : !cRed
      ? '绿 ✅ 安全孪生也不拦（无区分力）'
      : '红 ⚠️'
  if (ok) confirmed++
  console.log(
    `| ${g.id} | ${g.title} | ${bGreen ? '**绿=被绕过**' : '红'} | ${wantControlRed ? (cRed ? '红 ✅' : '绿 ⚠️') : (cRed ? '红' : '**绿**')} | ${how} |`,
  )
}
console.log('')
console.log(`证实：${confirmed}/${groups.length}`)
console.log('')
for (const g of groups) {
  console.log(`【${g.id}】${g.why}`)
  console.log('')
}
process.exit(confirmed === groups.length ? 0 : 1)
/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

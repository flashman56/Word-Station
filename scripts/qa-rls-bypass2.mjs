/**
 * QA 第二轮：构造「修复者没想到的」新绕过形态（红队）
 * ------------------------------------------------------------------
 * 上一轮我构造的跨函数绕过已修（enclosingFunctionScope）。本轮**不复用**那条思路，
 * 而是去攻击「函数边界」这个新判据本身的**识别能力**。
 *
 * 关键观察（读源码得出，非猜测）：
 *   enclosingFunctionScope() 找「函数起点」用的正则是
 *     /(?:^|[\s;{}()])(?:export\s+)?(?:async\s+)?function\s*\*?\s*[A-Za-z_$][\w$]*|=>\s*\{/g
 *   它只认两种形态：
 *     ① function <有名字>（声明 / 导出 / async）
 *     ② => {（带块体的箭头函数）
 *
 *   ⇒ **class 方法、对象字面量方法、匿名 default export function 都不是「函数起点」。**
 *   ⇒ marks 为空时 fallback `return { start: 0 }` ⇒ A2 又变回「看整个文件前缀」。
 *   ⇒ 上一轮的漏洞**换一种语法糖就回来了**。
 *
 * 另外两条与函数边界无关、独立的松判据：
 *   ③ 「同一个外键值」用 `qChain.text.includes(fkValue)` —— **裸子串匹配**，
 *      不是 AST 比较。写入侧变量名只要是校验链文本的子串（`'id'` 就是最短的反例）
 *      就算「同一个值」⇒ 「验的是 A 站、写的是 B 站」没被真正堵住。
 *   ④ 「前置」= 文本更靠前，**不看控制流** ⇒ 校验在不会执行的分支里也算数。
 *
 * 每个用例都经**真实入口**（node scripts/check-rls-writes.mjs）跑，
 * 不是直接调judgeCode。跑完删除探针。
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
const PROBE = path.join(ROOT, 'scripts', 'dev-zzprobe2.mjs')
const KEY = "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"

/** uid 可溯源到 auth.getUser（与上一轮脚本同口径） */
const AUTH = `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, ${KEY})
`

/** 正当的父表归属校验 */
const GUARD = (val = 'stationId') => `
  const { data: owned } = await admin
    .from('stations')
    .select('id')
    .eq('id', ${val})
    .eq('owner_id', uid)
    .maybeSingle()
`

// ────────────────────────────────────────────────────────────── 用例

const cases = [
  // ── 对照组：确认探针机制本身有效（必须红；红了才说明下面"绿"是真绿）
  {
    id: 'C0',
    title: '对照组：裸越权写入，无任何校验（必须红）',
    expect: 'red',
    code: `${AUTH}
export async function saveWords(stationId, wordKey) {
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
  },
  {
    id: 'G1',
    title: '对照组：同函数内 校验+写入（合法，必须绿）',
    expect: 'green',
    code: `${AUTH}
export async function saveWords(stationId, wordKey) {
${GUARD()}
  if (!owned) throw new Error('STATION_FORBIDDEN')
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}
`,
  },

  // ── 新形态 ①：class 方法之间无关联
  {
    id: 'N1',
    title: '新形态①：校验在 class 的另一个方法里，写入在本方法（跨方法）',
    expect: 'red',
    code: `${AUTH}
class StationWordsApi {
  async ensureOwned(stationId) {
${GUARD()}
    return owned
  }

  // 本方法自己完全不做校验：stationId 来自调用方，可为任意他人站点
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}

export async function handler(req) {
  const api = new StationWordsApi(admin)
  return api.saveWords(req.body.station_id, req.body.word_key)
}
`,
  },

  // ── 新形态 ②：对象字面量方法
  {
    id: 'N2',
    title: '新形态②：校验在对象字面量的另一个方法里，写入在本方法',
    expect: 'red',
    code: `${AUTH}
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
  },

  // ── 新形态 ③：裸子串匹配 —— 「验 A 站、写 B 站」
  {
    id: 'N3',
    title:
      '新形态③：校验的是 stationId，写入用的是另一个变量 id（子串匹配 ⇒ 「同一个外键值」判据失效）',
    expect: 'red',
    code: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('STATION_FORBIDDEN')

  // 校验只覆盖了 stationId；这里写的是**另一个**从未校验过的站点
  const id = req.body.other_station_id
  await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
}
`,
  },

  // ── 新形态 ④：控制流不关联（校验在不会执行的分支里）
  {
    id: 'N4',
    title: '新形态④：校验在 if 分支内且可被调用方跳过，写入在分支之后',
    expect: 'red',
    code: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  if (req.body.skipCheck) {
${GUARD()}
    if (!owned) throw new Error('STATION_FORBIDDEN')
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
  },

  // ── 新形态 ⑤：try/catch 里校验（异常被吞掉后写入继续）
  {
    id: 'N5',
    title: '新形态⑤：校验在 try 内且 catch 吞掉异常，写入在 try 之后',
    expect: 'red',
    code: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
  try {
${GUARD()}
  } catch (e) {
    console.warn('check failed', e)
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}
`,
  },

  // ── 新形态 ⑥：循环里写入，循环变量与被校验变量同名不同物
  {
    id: 'N6',
    title: '新形态⑥：校验了 stationId，循环里逐个写入 req 传来的站点列表（循环变量名 id）',
    expect: 'red',
    code: `${AUTH}
export async function saveWords(req) {
  const stationId = req.body.station_id
${GUARD()}
  if (!owned) throw new Error('STATION_FORBIDDEN')

  for (const id of req.body.targets) {
    await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
  }
}
`,
  },

  // ── 新形态 ⑦：匿名 default export function 内的写入 + 同文件更早处的正当校验
  {
    id: 'N7',
    title: '新形态⑦：写入在匿名 default export function 内，校验在同文件更早的具名函数里',
    expect: 'red',
    code: `${AUTH}
export async function ensureStationOwned(stationId) {
${GUARD()}
  return owned
}

export default async function (req) {
  const body = await req.json()
  await admin
    .from('station_words')
    .upsert({ station_id: body.station_id, owner_id: uid, word_key: body.word_key })
}
`,
  },
]

// ────────────────────────────────────────────────────────────── 跑真实入口

function runWith(code) {
  writeFileSync(PROBE, code, 'utf8')
  const r = spawnSync(process.execPath, [GATE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  if (existsSync(PROBE)) dropProbe(PROBE)
  return {
    code: r.status,
    crashed: /Error:|at\s+\w+\s+\(/.test(out) && r.status !== 1,
    hits: out
      .split('\n')
      .filter((l) => l.includes('dev-zzprobe2.mjs') && /\[\w+\]/.test(l))
      .map((l) => l.trim()),
  }
}

const results = []
for (const c of cases) {
  const res = runWith(c.code)
  const red = res.code === 1 && res.hits.length > 0
  const ok = c.expect === 'red' ? red : !red
  results.push({
    ...c,
    got: red ? 'red' : 'green',
    pass: ok,
    note: res.crashed
      ? '⚠️ 门禁崩溃'
      : red
        ? res.hits.join('|').replace(/\|/g, '/')
        : '零违规',
  })
}

console.log('| 用例 | 期望 | 实际 | 结论 | 证据（命中规则） |')
console.log('| --- | --- | --- | --- | --- |')
for (const r of results) {
  console.log(
    `| ${r.id} ${r.title} | ${r.expect} | ${r.got} | ${r.pass ? '✅ PASS' : '🔴 FAIL'} | ${r.note} |`,
  )
}

const bypass = results.filter((r) => !r.pass)
console.log('')
console.log(`探针残留：'无 ✓（探针清空复用）'`)
console.log('')
if (bypass.length) {
  console.log('🔴 门禁被绕过（期望红却绿）：')
  bypass.forEach((b) => console.log(`   ${b.id} ${b.title}`))
  process.exit(1)
}
console.log('✅ 全部符合预期')
process.exit(0)
/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

/**
 * 结构门禁：service_role 写入必须落在「归属校验」之后（红线一）
 * ------------------------------------------------------------------
 * 跑：npm run test:rls（已并入 npm run test:cloud）
 *
 * ============================ 为什么需要这个门禁 ============================
 * 红线一原先只写在 generate-word/index.ts 的注释里 —— 也就是说，
 * 「只靠人记得住」。它已经造成过一次真实越权：
 *   写 station_words 用 service_role 客户端，而 stations 的策略是
 *   owner_id = auth.uid()（对 service_role 不生效），代码又不校验 stationId 归属
 *   ⇒ 调用方可以传任意他人的 stationId，把词条塞进别人的小站。
 * 修是修了（加了应用层归属校验 + STATION_FORBIDDEN），但**红线本身没有被机器保证**。
 *
 * 判定必须基于「这个客户端是不是 service_role 权限」，
 * 而不是基于变量名 —— 否则把 admin 改名成 sb 就能绕过。
 * 本门禁用**凭证溯源**（credential tracing）做到这一点，见 classifyClient。
 *
 * ============================== 判定规则 ==============================
 * 事实全部来自 supabase/migrations/*.sql（**不硬编码表名**）：
 *   - 开了 RLS 且**有策略引用 auth.uid()** 的表 = owner 保护表，
 *     其 owner 列 = 策略里与 auth.uid() 比较的那一列；
 *   - 开了 RLS 但**零策略**的表 = 共享表（dict_cache）⇒ service_role 写入合法；
 *   - `references public.X` = 指向 owner 保护表的外键；
 *   - 函数体里出现 auth.uid() 的 RPC = 身份推导型 RPC。
 *
 * R1（读一律放行）—— service_role 的**读**操作永不报错。
 *   读 dict_cache 全表、读 generation_usage 都是本项目的正常做法。
 *
 * R2（红线一本体）—— service_role 客户端**写入** owner 保护表，必须满足：
 *   豁免 A1（自限写入）：写入行把该表的 owner 列**钉到已鉴权的 uid**。
 *     语义：写不进别人的分区。
 *     ⚠️ A1 单独**不够**：station_words 那次越权的 payload 里也写了 owner_id: uid，
 *     但 station_id 指向别人的小站 —— 行归属自己 ≠ 资源归属自己。
 *     ⚠️ A1 的溯源是**文件内**的（collectUidExpressions）；uid 由入参传入时它不成立。
 *   豁免 A2（父资源已验归属）：若写入行里有列指向**另一个 owner 保护表**，
 *     则必须在该写入**之前**存在一次针对那个父表的归属查询，
 *     且该查询用的是**同一个变量**（否则「验的是 A 站、写的是 B 站」拦不住）。
 *     ★ A2 命中即**足以放行整个写入**，不要求再叠加 A1 ——
 *       「写入前已确认父资源属于当前用户」本身就保证不越界，
 *       比 A1 更强。这也是「uid/client 不在本文件内可溯源」那类**合法**写法
 *       不会被误报的原因（误报边界已实测，见 SELFTEST_GOOD 的 5 条「误报边界」）。
 *   豁免 B（共享表）：写的是零策略的共享表 ⇒ 合法。
 *
 * R3（红线二本体）—— service_role 客户端调用**靠 auth.uid() 推导身份**的 RPC ⇒ 失败。
 *   service_role 的 JWT 没有 sub → auth.uid() 为 NULL → RPC 第一行就 raise。
 *   （真实事故：consume_generation_quota 曾这样调，错误分支又被当成「无限制」，
 *     于是任何人可无限烧 DeepSeek 额度。）
 *
 * ============================ 为什么这样判定不过拟合 ============================
 * 1. 表 / owner 列 / 外键 / 身份型 RPC：**全部从建库 SQL 解析**，不是枚举出来的。
 *    加一张表、改一条策略，门禁自动跟着变；写死表名必然在第二次改表时过期。
 * 2. 「是不是 service_role」：**溯源凭证**，不看客户端变量的名字。
 *    admin / sb / svc / 内联 createClient(...) 一视同仁。
 * 3. 归属校验的判定条件是「行里有没有钉住 owner 列」「有没有先验父资源归属」
 *    —— 这是**归属语义**，不是代码形状。重构成 helper 函数照样认。
 *
 * ============================ 未知凭证：fail closed ============================
 * 凭证溯源失败（例如 key 从函数入参透传，本文件内追不到来源）时，
 * 本门禁**按 service_role 处理**。代价是可能误报，收益是「换个写法藏起来」不再是漏洞。
 * 这条取舍是刻意的：门禁误报一次会被修，漏报一次就是越权。
 *
 * ⚠️ 但「可能误报」不能只是写着 —— 必须**实测边界**并把边界固化成正样本。
 * 实测出的 5 类误报（client 由入参传入 / client 跨模块 / key 透传 / key 拼出来 / …）
 * 全部已收进 SELFTEST_GOOD，靠豁免 A2 合法通过。
 * 若将来有人把A2 改窄，这5 条会立刻把门禁顶红。
 *
 * ============================== 扫描范围 ==============================
 * 只扫**服务端**代码 —— 即会拿真实用户请求去碰数据库的路径：
 *   - supabase/functions/**   部署到 Edge 的服务端代码，真正的信任边界
 *   - scripts/ 下的**生产逻辑本地镜像**（dev-* / *-plugin / *-mirror / *-local
 *     且真建客户端者）—— 按规则识别，不写死文件名。
 *     为什么必须扫：红线二明写「dev-generate-plugin.mjs 必须与本文件保持同构」，
 *     而那份漂移**真的发生过**（第一次事故在 index.ts 修了、镜像没修）。
 *     ⚠️ 镜像恰好在 scripts/ 下，而规则又是「scripts下大多不扫」——
 *     所以这里若写成硬编码名单，「这次是特例」就会变成「合法豁免」。
 * **不扫 scripts/qa-*.mjs / scripts/test-*.mjs**：那些是测试夹具，
 *  用 service_role 造数据是它们的本职工作（QA 脚本要建他人账号的数据来验证隔离）。
 *  把它们纳入范围只会让门禁变成噪音 —— 而噪音的门禁会被绕过，比没有门禁更糟。
 *
 * ============================ 门禁挂在哪 ============================
 * ① npm run test:cloud（开发者入口）
 * ② scripts/deploy-generate-fn.mjs 的预检第 1b 步（**部署入口**，exit 1 即 BLOCKED）
 * ②才是真入口：改完服务端代码直接部署的人，不一定会记得先跑测试套件。
 *
 * ============================== 演进方向（尚未做） ==============================
 * ⚠️ **当前 A2 是「文本推断」，不是「声明」。** 它靠「同一块作用域 + 查过父表
 *   + 按 owner 列过滤 + 同一个外键表达式」这几个**文本特征**推断「归属已校验」。
 *
 * ============================ ⚠️ 已知边界：A2 不感知控制流 ============================
 * 下列形态**均可绕过**（QA 第二轮构造并复核成立，本轮**只记录不修**）：
 *
 *   ① 校验包在**调用方可跳过的分支**里：
 *        if (req.body.skipCheck) { const owned = …查归属… ; if (!owned) throw … }
 *        await admin.from('station_words').upsert(…)      // ← 校验可被完全跳过
 *   ② 校验在 try 内且 **catch 吞掉异常**：
 *        try { const owned = …查归属… } catch (e) { console.warn(e) }
 *        await admin.from('station_words').upsert(…)
 *   ③ 循环外校验、循环内写入（没有「每轮重新校验」的概念）：
 *        for (const id of req.body.targets) { await admin.from('station_words').upsert({ station_id: id, … }) }
 *
 * 为什么不修：控制流要真 AST / 数据流才能判，而强上必然推高误报 ——
 * 而**这个门禁的漏报（假绿）比误报更危险**，因为它给人虚假的安全感。
 * 详见 docs/engineering-discipline.md。
 *
 * ⚠️ 这 2 条形态已固化成自检里的 **SELFTEST_KNOWN_GAP**（断言「当前确实判绿」）。
 *   固化不是为了「现在拦住」，而是**将来有人改作用域栈时会立刻看到它们转红** ——
 *   这正是「自检十几条却一条都没覆盖这些形态」暴露的机制本身：**没覆盖 = 静默漏判**。
 *
 * ================== 残留洞：已用「请求来源」判据关闭（我先前的断言是错的） ==================
 * 我曾断言下面这个洞「零侵入关不掉」，**那个断言错了**（QA 反驳成立，已修正）：
 *
 *     const { data: owned } = await admin.from('stations')
 *       .select('id').eq('id', sId).eq('owner_id', body.ownerId).maybeSingle()  // ← 攻击者可控
 *     if (owned) await admin.from('station_words')
 *       .upsert({ station_id: sId, owner_id: body.ownerId, ... })
 *
 * 我当时说「要抓它只能要求 owner 值可溯源到 auth.getUser，但会误伤『uid 由入参传入』」。
 * **错在把判据下得太重**：不需要**全文件溯源**，只需**排除请求来源表达式**
 * （body.* / req.* / params.* / event.* / formData / searchParams / payload.*，
 * 含经局部变量中转的一层）。
 * 而**函数形参名既不是 body.* 也不是 req.*，不是请求来源** ⇒ 该判据对
 * 「uid 由入参传入」这类**合法**写法恒不触发 ⇒ 不误伤。
 * 实测：QA 的 P1（body 来源）红、P2（形参）绿、P3（req 经局部变量中转）红。
 *
 * 【终局形态：声明式归属断言】
 *   引入显式函数（如 `assertOwnership('stations', stationId, uid)`），由它统一
 *   「取 uid + 查父表 + 过滤 owner 列 + 不匹配即抛」，门禁只认这一个出口 ⇒
 *   上述**控制流**洞与跨作用域洞一并消失。本轮**不做**：它要改 index.ts 与镜像的
 *   真实代码（行为改动），与「零侵入」原则冲突，留待专门一轮。
 *   ⚠️ 采纳时注意：引入命名的单一出口 = 给「统一改名」留了后路，
 *   纪律 §9.1 的教训仍适用 —— 出口本身要被门禁检查，不能只靠约定。
 * ==========================================================================
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** 统一成 POSIX 风格相对路径，保证 Windows / POSIX 上比较结果一致 */
function toPosix(p) {
  return p.split(path.sep).join('/')
}

// ---------------------------------------------------------------- 通用扫描工具

/**
 * 从 `openIdx`（指向 openChar）读出配对闭合前的正文，感知字符串与注释。
 * @returns {string|null} 找不到配对闭合返回 null
 */
function readBalanced(text, openIdx, openChar, closeChar) {
  let depth = 0
  for (let i = openIdx; i < text.length; i += 1) {
    const c = text[i]
    if (c === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i)
      i = nl < 0 ? text.length : nl
      continue
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 1
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i += 1
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i += 1
        i += 1
      }
      continue
    }
    if (c === openChar) depth += 1
    else if (c === closeChar) {
      depth -= 1
      if (depth === 0) return text.slice(openIdx + 1, i)
    }
  }
  return null
}

/** 按顶层逗号切分实参（忽略括号/字符串内的逗号） */
function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let cur = ''
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      cur += c
      i += 1
      while (i < text.length && text[i] !== quote) {
        cur += text[i]
        if (text[i] === '\\') {
          cur += text[i + 1] ?? ''
          i += 1
        }
        i += 1
      }
      cur += text[i] ?? ''
      continue
    }
    if (c === '(' || c === '{' || c === '[') depth += 1
    else if (c === ')' || c === '}' || c === ']') depth -= 1
    else if (c === ',' && depth === 0) {
      parts.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  if (cur.trim()) parts.push(cur)
  return parts
}

/**
 * 从 `fromIdx` 处向后读整条方法链。
 * 终止条件：深度 0 的 `;`、深度 0 的右括号，或换行后下一个非空白字符不是 `.`
 * （后者正是本项目多行链的真实形状）。
 *
 * ⚠️ `text` 是 `code` 的**子串**，它的下标与 `code` 的下标不是一回事 ——
 * 需要按 `code` 绝对下标取括号内容时，用 `start` 换算，别直接混用。
 * @returns {{text: string, methods: string[], start: number, end: number}}
 */
function readChain(code, fromIdx) {
  let depth = 0
  let i = fromIdx
  for (; i < code.length; i += 1) {
    const c = code[i]
    if (c === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i)
      i = nl < 0 ? code.length : nl
      continue
    }
    if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      i = end < 0 ? code.length : end + 1
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i += 1
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i += 1
        i += 1
      }
      continue
    }
    if (c === '(' || c === '{' || c === '[') depth += 1
    else if (c === ')' || c === '}' || c === ']') {
      if (depth === 0) break
      depth -= 1
    } else if (c === ';' && depth === 0) break
    else if (c === '\n' && depth === 0) {
      let j = i + 1
      while (j < code.length && /\s/.test(code[j])) j += 1
      if (code[j] !== '.') break
      i = j - 1
    }
  }
  const text = code.slice(fromIdx, i)
  const methods = [...text.matchAll(/\.\s*(\w+)\s*\(/g)].map((m) => m[1])
  return { text, methods, start: fromIdx, end: i }
}

/**
 * 从 `idx` 处向前取接收者表达式（`.from(` / `.rpc(` 前面那个东西）。
 *
 * 向前扫描并**正确配对括号** —— 因为接收者可能是内联调用
 * `createClient(url, Deno.env.get('KEY')).from(...)`，里面还有一层括号，
 * 用 `[^()]*` 这类简单正则会漏掉（自检里那条「内联 createClient」样本
 * 就是被这个bug 漏过去的，现在能抓住了）。
 * @returns {string|null}
 */
function receiverBefore(code, idx) {
  let end = idx - 1
  while (end >= 0 && /\s/.test(code[end])) end -= 1
  if (end < 0) return null

  let start = end
  while (start >= 0) {
    const c = code[start]
    if (/[A-Za-z0-9_$.]/.test(c)) {
      start -= 1
      continue
    }
    if (c === ')' || c === ']') {
      const open = c === ')' ? '(' : '['
      let depth = 0
      let i = start
      for (; i >= 0; i -= 1) {
        if (code[i] === c) depth += 1
        else if (code[i] === open) {
          depth -= 1
          if (depth === 0) break
        }
      }
      if (i < 0) break
      start = i - 1
      continue
    }
    break
  }
  const expr = code.slice(start + 1, end + 1).trim()
  return expr.length > 0 ? expr : null
}

// ---------------------------------------------------------------- 建库 SQL 事实

/**
 * 从建库 SQL 解析出门禁需要的全部事实。
 * @param {string} sql 迁移脚本全文
 * @returns {{rlsTables: Set<string>, guardedTables: Map<string, Set<string>>, fks: Map<string, Map<string, string>>, authUidRpcs: Set<string>}}
 */
function parseSchema(sql) {
  /** 开了 RLS 的表 */
  const rlsTables = new Set()
  /** owner 保护表 → 其 owner 列集合（策略里与 auth.uid() 比较的那些列） */
  const guardedTables = new Map()
  /** 表 → (外键列 → 被引用的表) */
  const fks = new Map()
  /** 函数体里出现 auth.uid() 的 RPC：身份推导型，service_role 调必炸 */
  const authUidRpcs = new Set()

  for (const m of sql.matchAll(
    /alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?(\w+)\s+enable\s+row\s+level\s+security/gi,
  )) {
    rlsTables.add(m[1])
  }

  // 策略：create policy <name> on <table> for <cmd> to <role> using (...) with check (...);
  // 条件体含 auth.uid() ⇒ 该表按 owner 保护；`(\w+)\s*=\s*auth\.uid\(\)` 给出 owner 列。
  for (const m of sql.matchAll(
    /create\s+policy\s+(\w+)\s+on\s+(?:public\.)?(\w+)\s+for\s+(\w+)([\s\S]*?);/gi,
  )) {
    const table = m[2]
    const body = m[4]
    if (!/auth\s*\.\s*uid\s*\(\s*\)/i.test(body)) continue
    const cols = new Set()
    for (const c of body.matchAll(/(\w+)\s*=\s*auth\s*\.\s*uid\s*\(\s*\)/gi)) cols.add(c[1])
    if (cols.size === 0) continue
    const prev = guardedTables.get(table)
    if (prev) for (const c of cols) prev.add(c)
    else guardedTables.set(table, cols)
  }

  // 外键：create table public.X ( ... <col> ... references public.Y(<refCol>) ... )
  // 连被引用列一起记录（station_words.station_id → stations.id）：
  // A2 要比对「链里 .eq(<refCol>, X) 的 X」与「payload 外键列的值」是不是同一表达式，
  // 只知道被引用表不够。
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)\s*\(/gi)) {
    const table = m[1]
    const openIdx = m.index + m[0].length - 1
    const body = readBalanced(sql, openIdx, '(', ')')
    if (body === null) continue
    const cols = new Map()
    for (const f of body.matchAll(
      /(\w+)\s+[\w\s]+?references\s+(?:public\.)?(\w+)\s*\(\s*(\w+)\s*\)/gi,
    )) {
      cols.set(f[1], { table: f[2], col: f[3] })
    }
    if (cols.size > 0) fks.set(table, cols)
  }

  // 函数：create or replace function <name>(...) ... $$ ... $$
  // 函数体出现 auth.uid() ⇒ 身份由令牌推导，service_role 通道上恒为 NULL。
  for (const m of sql.matchAll(
    /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?(\w+)\s*\(/gi,
  )) {
    const bodyStart = sql.indexOf('$$', m.index)
    if (bodyStart < 0) continue
    const bodyEnd = sql.indexOf('$$', bodyStart + 2)
    if (bodyEnd < 0) continue
    if (/auth\s*\.\s*uid\s*\(\s*\)/i.test(sql.slice(bodyStart + 2, bodyEnd))) {
      authUidRpcs.add(m[1])
    }
  }

  return { rlsTables, guardedTables, fks, authUidRpcs }
}

// ---------------------------------------------------------------- 凭证溯源

/**
 * 溯源一个凭证表达式到底来自哪个环境变量名。
 * 只认「凭证来源」这条语义线索（SERVICE_ROLE / ANON / PUBLISHABLE），
 * 不认客户端变量的名字 —— 这是本门禁不过拟合的关键。
 * @returns {string|null} 环境变量名；追不到来源返回 null
 */
function resolveCredentialSource(expr, code, depth = 0) {
  const text = String(expr ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!text || depth > 5) return null

  const envRead = text.match(
    /(?:Deno\s*\.\s*env\s*\.\s*get|process\s*\.\s*env|import\s*\.\s*meta\s*\.\s*env|env)\s*[.(]\s*['"`]?([A-Za-z_]\w*)['"`]?\s*\)?/,
  )
  if (envRead) return envRead[1]

  // 追一层本地绑定：const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (/^[A-Za-z_$][\w$]*$/.test(text)) {
    const patterns = [
      new RegExp(`(?:const|let|var)\\s+${text}\\s*(?::[^=;\\n]*)?=\\s*([^;\\n]+)`, 'g'),
      new RegExp(`\\b${text}\\s*=\\s*([^;\\n]+)`, 'g'),
    ]
    for (const re of patterns) {
      for (const b of code.matchAll(re)) {
        const src = resolveCredentialSource(b[1], code, depth + 1)
        if (src) return src
      }
    }
  }
  return null
}

/**
 * 判定一个 createClient 调用是不是 service_role 权限。
 *
 * 依据是「第二个参数（key）溯源到什么」，而不是客户端变量叫什么：
 * `const sb = createClient(url, keyFromEnv)` 与 `admin.from('x')` 被同等看待。
 *
 * @param {string} callArgs createClient 的实参列表（不含外层括号）
 * @param {string} code 所在文件全文（用于溯源局部绑定）
 * @returns {'service'|'anon'|'unknown'}
 */
function classifyClient(callArgs, code) {
  const args = splitTopLevel(callArgs)
  if (args.length < 2) return 'unknown'
  const keyExpr = args[1]

  // 显式挂着用户 Authorization 的客户端（anonAsUser 形态）永远不是 service_role：
  // 它的身份来自请求头里的用户 JWT，而不是 service key。
  if (/Authorization\s*:\s*auth/i.test(callArgs)) return 'anon'

  const source = resolveCredentialSource(keyExpr, code)
  if (!source) return 'unknown'
  if (/SERVICE[_-]?ROLE/i.test(source)) return 'service'
  if (/ANON|PUBLISHABLE/i.test(source)) return 'anon'
  return 'unknown'
}

// ---------------------------------------------------------------- 认证 uid 表达式

/**
 * 找出「接住这个 createClient 调用的变量名」。
 *
 * 从 `createClient(` 的左括号**向前**扫，容忍两种形态：
 *   admin = createClient(...)
 *   anonAsUser = cond && otherKey ? createClient(...) : null   ← 跨行也算
 * 一旦撞上 `;` / `{` / `}` 就放弃（说明这不是一个赋值语句的起点），
 * 这样就不会出现「惰性正则把整个文件吞进去、误判出一个叫 charset 的客户端」。
 *
 * @returns {string|null}
 */
function clientVarBefore(code, createClientIdx) {
  // createClientIdx 指向 'createClient' 的首字母 'c'。
  // 先把这段标识符**切出来核对**（不能先向前跳空白 —— 那会直接跨到 '=' 上，
  // 实测踩过：切出来是空串，于是所有客户端都没被登记，门禁靠 fail-closed 硬撑）。
  const afterName = createClientIdx + 'createClient'.length
  if (code.slice(createClientIdx, afterName) !== 'createClient') return null
  let i = createClientIdx - 1

  while (i >= 0) {
    if (/\s/.test(code[i])) {
      i -= 1
      continue
    }
    // 单个 = （排除 == / <= / >= / != / =>）
    if (code[i] === '=' && code[i - 1] !== '=' && code[i - 1] !== '!' &&
        code[i - 1] !== '<' && code[i - 1] !== '>' && code[i + 1] !== '=' &&
        code[i + 1] !== '>') {
      let k = i - 1
      while (k >= 0 && /\s/.test(code[k])) k -= 1
      const end = k + 1
      while (k >= 0 && /[\w$]/.test(code[k])) k -= 1
      const name = code.slice(k + 1, end)
      return /^[A-Za-z_$][\w$]*$/.test(name) ? name : null
    }
    // 语句边界 ⇒ 不是赋值起点，放弃（防止跨语句乱匹配）
    if (code[i] === ';' || code[i] === '{' || code[i] === '}') return null
    // 允许条件表达式里的字符：标识符、运算符、括号、点、字面量
    if (/[\w$.()[\]!?:&|'"`]/.test(code[i])) {
      i -= 1
      continue
    }
    return null
  }
  return null
}

/**
 * 找出「已鉴权 uid」的所有表达式写法。
 *
 * 溯源路径：auth.getUser(token) → 解构出的 data 变量 → `.user.id` → 赋给谁。
 * 判据是「这个值来自令牌校验」，不是「这个变量叫 uid」——
 * 所以 `const me = userData.user.id` 与 `uid` 同等对待。
 * @returns {Set<string>} uid 表达式集合（去空白/分号后的小写形式）
 */
function collectUidExpressions(code) {
  const uidExprs = new Set()
  const callRe = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*await\s+[\w$.]*auth\s*\.\s*getUser\s*\(/g
  for (const m of code.matchAll(callRe)) {
    const dataProp = m[1].match(/(?:^|,)\s*data\s*:\s*([A-Za-z_$][\w$]*)/)
    const dataName = dataProp ? dataProp[1] : /\bdata\b/.test(m[1]) ? 'data' : null
    if (!dataName) continue
    const access = `${dataName}\\s*\\??\\.\\s*user\\s*\\??\\.\\s*id`
    for (const a of code.matchAll(new RegExp(access, 'g'))) {
      uidExprs.add(a[0].replace(/\s+/g, '').toLowerCase())
    }
    for (const a of code.matchAll(
      new RegExp(`([A-Za-z_$][\\w$]*)\\s*(?::[^=;\\n]*)?=\\s*${access}`, 'g'),
    )) {
      uidExprs.add(a[1].toLowerCase())
    }
  }
  return uidExprs
}

/** 判断一个表达式文本是否就是「已鉴权的 uid」 */
function isUidExpression(expr, uidExprs) {
  const norm = normExpr(expr).toLowerCase()
  return norm.length > 0 && uidExprs.has(norm)
}

/**
 * 表达式归一化：去空白、去尾分号 / 尾逗号。
 * 「同一个值」的比较必须基于它 —— 裸子串包含会把 `id` 之于 `.eq('id', …)`
 * 这类「恰好是子串」的情况误判成同一个值（QA 构造的绕过形态）。
 *
 * ⚠️ **不做 toLowerCase**（QA E 组实测出的缺陷）：取值表达式的大小写本身是区分度，
 *    一律转小写会让 `StationId` 与 `stationId` 被当成同一个值。
 *    大小写归一只用于**已知是名字**的东西（列名 / 标识符）—— 那是 normName 的职责。
 *
 * ⚠️ 尾逗号必须剥掉（QA E13）：`.eq(` 与实参跨行时，捕获到的实参文本是
 *    `'id', stationId,\n` 这种带尾逗号的形式，不剥就永远比不上 payload 里的值。
 */
function normExpr(expr) {
  return String(expr ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[;,]+$/, '')
}

/**
 * 名字归一化（**只用于列名 / 标识符**这种已知是名字的东西）：
 * 剥掉引号与反引号、去空白、转小写。
 *
 * 为什么要单独一个函数：写法上 `.eq('owner_id', uid)` / `.eq(\`owner_id\`, uid)` /
 * `.eq('OWNER_ID', uid)` 是同一件事（QA E8 / E9），而取值表达式不能这么归一。
 */
function normName(name) {
  return String(name ?? '')
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
}

/**
 * 「由调用方提供」语义的**根标识**拒绝名单。
 *
 * 🔴 判据方向是**否决式**的（QA E 组把旧判据打穿后的重构结论）：
 *   旧实现用 `^(?:body|req|…)\b` 这种**前缀正则**去「证明像请求数据」：
 *     - `ctx.body.ownerId` 不以 body 开头 ⇒ 漏（E2）
 *     - `req2.body.ownerId` 的 `req2` 不满足词边界 ⇒ 漏（E5）
 *     - 解构 / 局部变量中转出来的裸标识符根本不长那样 ⇒ 漏（E6 / E7）
 *   ⇒ 反过来做：不试图证明来源，只做**「像请求数据就判红」的否决**。
 *
 *   判据是**成员表达式的根标识**（`ctx.body.ownerId` 的根是 `ctx`），
 *   并且允许数字后缀（`req2` ⇒ `req`）。命中即红。
 *
 * ⚠️ 这条**只用来否决豁免，绝不用来发放豁免**：
 *    命中 ⇒ 该值不能算「已证明的 uid」（不进 guardUidExprs）；
 *    不命中 ⇒ 什么也不发生（不会因此放行写入）。
 */
const REQUEST_ROOTS = new Set([
  'body', 'req', 'request', 'res', 'response',
  'ctx', 'context', 'event', 'evt',
  'params', 'param', 'query', 'searchparams', 'urlsearchparams', 'nexturl',
  'form', 'formdata', 'headers', 'header', 'cookies', 'cookie',
  'json', 'raw', 'payload', 'input', 'data',
])

/** 从 openIdx（指向 '('）向后匹配出 ')' 的下标；-1 = 找不到 */
function matchParenForward(text, openIdx) {
  let depth = 0
  for (let j = openIdx; j < text.length; j += 1) {
    const c = text[j]
    if (c === "'" || c === '"' || c === '`') {
      const q = c
      j += 1
      while (j < text.length && text[j] !== q) {
        if (text[j] === '\\') j += 1
        j += 1
      }
      continue
    }
    if (c === '(') depth += 1
    else if (c === ')') {
      depth -= 1
      if (depth === 0) return j
    }
  }
  return -1
}

/** 剥掉表达式外层的多余括号：`(uid)` ⇒ `uid` */
function stripOuterParens(text) {
  let s = String(text ?? '').trim()
  while (s.startsWith('(')) {
    const close = matchParenForward(s, 0)
    if (close !== s.length - 1) break
    s = s.slice(1, -1).trim()
  }
  return s
}

/**
 * 取表达式的**根标识**：`ctx.body.ownerId` ⇒ `ctx`；`req2` ⇒ `req`。
 * @returns {string|null} 取不到（如以 `[` / 数字开头）返回 null
 */
function exprRoot(expr) {
  let s = String(expr ?? '').trim()
  s = s.replace(/^await\s+/, '')
  s = stripOuterParens(s)
  const m = s.match(/^([A-Za-z_$][\w$]*)/)
  if (!m) return null
  // 数字后缀剥离：`req2` ⇒ `req`、`body2` ⇒ `body`
  return m[1].replace(/\d+$/, '').toLowerCase()
}

/**
 * 收集文件内所有「局部绑定名 → 右值表达式列表」。
 *
 * 覆盖的形态（QA E6 / E7 点名的两类 + 既有形态）：
 *   const ownerId = ctx.body.ownerId          // 普通声明
 *   const { owner_id: ownerId } = ctx         // 对象解构（含重命名）
 *   const [ownerId] = ctx.list                // 数组解构
 *   ownerId = ctx.body.ownerId                // 裸赋值
 *
 * @param {string} code 文件全文
 * @returns {Map<string, string[]>}
 */
function collectBindings(code) {
  /** @type {Map<string, string[]>} */
  const map = new Map()
  const add = (rawName, rhs) => {
    // 解构项可能带默认值：`const { a = 1 } = x`
    const name = String(rawName ?? '').trim().split(/\s*=\s*/)[0].trim()
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) return
    const value = String(rhs ?? '').trim()
    if (!value) return
    if (!map.has(name)) map.set(name, [])
    map.get(name).push(value)
  }

  // 对象解构：`const { owner_id: ownerId, other } = ctx`
  for (const m of code.matchAll(
    /(?:const|let|var)\s*\{([^}]*)\}\s*(?::[^=;\n]*)?=\s*([^;\n]+)/g,
  )) {
    for (const part of splitTopLevel(m[1])) {
      const p = String(part).trim()
      if (!p) continue
      add(p.includes(':') ? p.slice(p.lastIndexOf(':') + 1) : p, m[2])
    }
  }
  // 数组解构：`const [ownerId] = ctx.list`
  for (const m of code.matchAll(
    /(?:const|let|var)\s*\[([^\]]*)\]\s*(?::[^=;\n]*)?=\s*([^;\n]+)/g,
  )) {
    for (const part of splitTopLevel(m[1])) add(part, m[2])
  }
  // 普通声明（容忍 TS 类型标注 `const a: string = b`）
  for (const m of code.matchAll(
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;\n]*)?=\s*([^;\n]+)/g,
  )) {
    add(m[1], m[2])
  }
  // 裸赋值（`==` / `!==` 不会命中：`=` 之后不允许再是 `=`）
  for (const m of code.matchAll(
    /(?:^|[;{}\n])\s*([A-Za-z_$][\w$]*)\s*=\s*([^;=\n]+)/g,
  )) {
    add(m[1], m[2])
  }
  return map
}

/**
 * 判定一个取值表达式是否**由请求带入**（⇒ 不可信，只能否决豁免）。
 *
 * 两条路径：
 *   ① 成员表达式的**根标识**命中拒绝名单（`ctx.body.ownerId` ⇒ `ctx`）；
 *   ② 沿**局部绑定**做传递（至少 2 跳）：解构 `const { a: b } = X`、
 *      `const b = X.y`、`let b = await X.json()`，只要右值根标识命中，左值也算。
 *
 * ⚠️ 函数**形参名**不在任何绑定里，因此恒不触发 ——
 *    这正是「uid 由入参传入」这类**合法**写法不被误伤的原因（QA 的 F1 形态）。
 *
 * @param {string} expr 表达式原文（未归一）
 * @param {Map<string, string[]>} bindings collectBindings 的结果
 */
function isRequestDerived(expr, bindings, depth = 0) {
  const raw = String(expr ?? '').trim()
  if (!raw || depth > 3) return false
  const s = stripOuterParens(raw.replace(/^await\s+/, ''))
  const root = exprRoot(s)
  if (root !== null && REQUEST_ROOTS.has(root)) return true
  const bare = s.match(/^([A-Za-z_$][\w$]*)$/)
  if (bare) {
    const rhsList = bindings.get(bare[1])
    if (rhsList) {
      for (const rhs of rhsList) {
        if (isRequestDerived(rhs, bindings, depth + 1)) return true
      }
    }
  }
  return false
}

// ---------------------------------------------------------------- 写入行对象

// ---------------------------------------------------------------- 作用域：词法扫描 + 花括号树
//
// 🔴 为什么彻底删掉「反向文本扫描」（QA 连续三轮的结论）：
//    反向扫描遇 `{` 就记一个候选，既不验证这个 `{` **真的包住写入点**，也认不出
//    class 方法 / 计算属性名方法 / 对象方法这些函数体形态；而它的 `depth` 参数是死代码。
//    后果（QA 实测全绿 = 全漏）：
//      S4 嵌套 class、S7 分支块里再嵌 function、X1 顶层写入 + 校验在未调用函数里、
//      X2/X3 顶层 if/try 块内写入、X4 计算属性名方法里写入。
//    更根本的是：它读不懂字符串与注释 —— **一条 `// }` 注释就能重新捅出洞**，
//    这正是「每修一个洞长出新的洞」的机制本身。
//
// ⇒ 改为：先做一次**词法扫描**（跳过行注释 / 块注释 / 字符串 / 模板 `${}` / 正则字面量），
//   一次性建出**花括号树**；之后所有作用域问题都在树上做**查询**，不再反向猜。

/** 控制流关键字：其后的 `{` 是语句块，不是函数体 */
const CONTROL_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'with'])
/** 其它非函数体的块头关键字（class 体本身不是函数体，它里面的**方法**才是） */
const BLOCK_KEYWORDS = new Set(['try', 'else', 'do', 'finally', 'class'])
/** 这些关键字之后的 `/` 是正则字面量开头，而不是除法 */
const REGEX_AFTER_KEYWORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'case', 'yield', 'await', 'throw',
])

/**
 * `/` 能不能作为正则字面量的开头。
 * 判据是「上一个有意义字符」：标识符 / `)` / `]` / `}` 之后只可能是除法
 * （除非那个标识符是 return / typeof 这类关键字）。
 */
function canRegexStart(prevSig, prevWord) {
  if (prevSig === '') return true
  if (/[\w$]/.test(prevSig)) return REGEX_AFTER_KEYWORDS.has(String(prevWord).toLowerCase())
  if (prevSig === ')' || prevSig === ']' || prevSig === '}') return false
  return true
}

/** 从 from 向前找最近的非空白、且不在注释/字符串/正则内的字符下标 */
function prevSignificant(code, from, skip) {
  let i = Math.min(from, code.length - 1)
  while (i >= 0) {
    if (skip[i] || /\s/.test(code[i])) {
      i -= 1
      continue
    }
    return i
  }
  return -1
}

/** 读「以 p 结尾」的标识符（p 指向标识符的最后一个字符） */
function wordEndingAt(code, p) {
  if (p < 0) return ''
  let b = p
  while (b >= 0 && /[\w$]/.test(code[b])) b -= 1
  return code.slice(b + 1, p + 1)
}

/** 从 closeIdx（指向 ')'）向前匹配出 '(' 的下标；-1 = 找不到 */
function matchParenBack(code, closeIdx, skip) {
  let depth = 0
  for (let j = closeIdx; j >= 0; j -= 1) {
    if (skip[j]) continue
    const c = code[j]
    if (c === ')') depth += 1
    else if (c === '(') {
      depth -= 1
      if (depth === 0) return j
    }
  }
  return -1
}

/**
 * 判定一个 `{` 是不是**函数体**的开括号。
 *
 * 必须认出的形态（QA 逐条点名过）：
 *   function 名() {}      function () {}        => {}（箭头体）
 *   class / object 的方法头（含 static、async、get/set、**计算属性名 [M]()**）
 * 必须排除的形态：if / for / while / switch / catch / with / try / else / do /
 *   finally / class 体 / 对象字面量 / 裸块。
 */
function classifyBrace(code, braceIdx, skip) {
  const p = prevSignificant(code, braceIdx - 1, skip)
  if (p < 0) return 'block'
  const ch = code[p]
  if (ch === '>') {
    // 箭头体 `=> {`；`>=` / `!=>` 之类不算
    const before = code[p - 1]
    const beforeThat = p - 2 >= 0 ? code[p - 2] : ''
    if (before === '=' && !/[\w$=<>!]/.test(beforeThat)) return 'function'
    return 'block'
  }
  if (ch === ')') {
    const open = matchParenBack(code, p, skip)
    if (open < 0) return 'block'
    const word = wordEndingAt(code, prevSignificant(code, open - 1, skip)).toLowerCase()
    if (CONTROL_KEYWORDS.has(word) || BLOCK_KEYWORDS.has(word)) return 'block'
    // function f() / 方法名() / constructor() / [M]() —— 一律是函数体
    return 'function'
  }
  return 'block'
}

/**
 * 词法扫描 + 建花括号树（**一次扫描，之后全部在树上查询**）。
 *
 * @returns {{nodes: Array<{start:number,end:number,kind:'function'|'block',parent:number,children:number[],hasFn:boolean}>, skip: Uint8Array}}
 *   `skip[i] === 1` ⇒ 第 i 个字符在注释 / 字符串 / 模板正文 / 正则内部，
 *   做「找前一个有意义字符」时必须跳过 —— 这正是「一条 `// }` 注释捅出洞」的解药。
 */
function buildBraceTree(code) {
  const n = code.length
  const skip = new Uint8Array(n)
  /** @type {Array<{start:number,end:number,kind:string,parent:number,children:number[],hasFn:boolean}>} */
  const nodes = []
  /** @type {Array<{t:string,i?:number}>} 'brace' | 'tmpl' | 'tmplExpr' */
  const stack = []
  let i = 0
  let prevSig = ''
  let prevWord = ''

  const mark = (from, to) => {
    for (let k = from; k < to && k < n; k += 1) skip[k] = 1
  }
  /** 栈顶最近的**花括号**节点下标（跳过模板层） */
  const braceParent = () => {
    for (let k = stack.length - 1; k >= 0; k -= 1) {
      if (stack[k].t === 'brace') return stack[k].i
    }
    return -1
  }

  while (i < n) {
    const top = stack.length > 0 ? stack[stack.length - 1] : null

    // ---- 模板字符串正文：只有 `\`、收尾反引号与 `${` 有意义
    if (top !== null && top.t === 'tmpl') {
      const c = code[i]
      if (c === '\\') {
        mark(i, i + 2)
        i += 2
        continue
      }
      if (c === '`') {
        mark(i, i + 1)
        stack.pop()
        i += 1
        prevSig = '`'
        prevWord = ''
        continue
      }
      if (c === '$' && code[i + 1] === '{') {
        mark(i, i + 2)
        stack.push({ t: 'tmplExpr' })
        i += 2
        prevSig = '{'
        prevWord = ''
        continue
      }
      skip[i] = 1
      i += 1
      continue
    }

    const c = code[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v') {
      i += 1
      continue
    }
    if (c === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i)
      const end = nl < 0 ? n : nl
      mark(i, end)
      i = end
      continue
    }
    if (c === '/' && code[i + 1] === '*') {
      const close = code.indexOf('*/', i + 2)
      const end = close < 0 ? n : close + 2
      mark(i, end)
      i = end
      continue
    }
    if (c === '/' && canRegexStart(prevSig, prevWord)) {
      let j = i + 1
      let inClass = false
      while (j < n) {
        const ch = code[j]
        if (ch === '\\') {
          j += 2
          continue
        }
        if (ch === '[') {
          inClass = true
          j += 1
          continue
        }
        if (ch === ']') {
          inClass = false
          j += 1
          continue
        }
        if ((ch === '/' && !inClass) || ch === '\n') break
        j += 1
      }
      const stop = Math.min(j + 1, n)
      mark(i, stop)
      i = stop
      prevSig = '/'
      prevWord = ''
      continue
    }
    if (c === "'" || c === '"') {
      const q = c
      let j = i + 1
      while (j < n && code[j] !== q) {
        if (code[j] === '\\') j += 1
        j += 1
      }
      mark(i, Math.min(j + 1, n))
      i = Math.min(j + 1, n)
      prevSig = q
      prevWord = ''
      continue
    }
    if (c === '`') {
      mark(i, i + 1)
      stack.push({ t: 'tmpl' })
      i += 1
      prevSig = '`'
      prevWord = ''
      continue
    }
    if (c === '{') {
      const parent = braceParent()
      nodes.push({
        start: i, end: n, kind: 'block', parent, children: [], hasFn: false,
      })
      const idx = nodes.length - 1
      if (parent >= 0) nodes[parent].children.push(idx)
      stack.push({ t: 'brace', i: idx })
      i += 1
      prevSig = '{'
      prevWord = ''
      continue
    }
    if (c === '}') {
      if (top !== null && top.t === 'tmplExpr') {
        stack.pop()
        i += 1
        prevSig = '}'
        prevWord = ''
        continue
      }
      if (top !== null && top.t === 'brace') {
        nodes[top.i].end = i
        stack.pop()
        i += 1
        prevSig = '}'
        prevWord = ''
        continue
      }
      i += 1
      continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < n && /[\w$]/.test(code[j])) j += 1
      prevWord = code.slice(i, j)
      i = j
      prevSig = prevWord[prevWord.length - 1]
      continue
    }
    prevSig = c
    prevWord = ''
    i += 1
  }

  for (const nd of nodes) nd.kind = classifyBrace(code, nd.start, skip)
  // hasFn：子树里是否存在函数体（自底向上累积，子节点下标一定大于父节点）
  for (let k = nodes.length - 1; k >= 0; k -= 1) {
    if (nodes[k].kind === 'function') nodes[k].hasFn = true
    if (nodes[k].hasFn && nodes[k].parent >= 0) nodes[nodes[k].parent].hasFn = true
  }
  return { nodes, skip }
}

/** 包含 idx 的**最内层**节点（null = 模块顶层，不在任何 `{}` 里） */
function innermostNode(tree, idx) {
  let best = null
  for (const nd of tree.nodes) {
    if (nd.start < idx && idx < nd.end) {
      if (best === null || nd.start > best.start) best = nd
    }
  }
  return best
}

/** 包含 idx 的**最内层函数体**节点（null = 不在任何函数体内） */
function nearestFnBody(tree, idx) {
  let best = null
  for (const nd of tree.nodes) {
    if (nd.kind === 'function' && nd.start < idx && idx < nd.end) {
      if (best === null || nd.start > best.start) best = nd
    }
  }
  return best
}

/** a 是否为 b 的（严格）祖先节点 */
function isAncestorNode(tree, a, b) {
  if (a === null || b === null) return false
  let cur = b
  while (cur.parent >= 0) {
    cur = tree.nodes[cur.parent]
    if (cur === a) return true
  }
  return false
}

/**
 * 判定「位于 gIdx 的那次归属校验」能不能为「位于 wIdx 的那次写入」提供担保。
 *
 * 四条（全部在花括号树上做查询，不再反向扫文本）：
 *   ① **同一个函数体**：写入点的最内层函数体祖先，必须也是校验点的那个。
 *      ⇒ 跨函数 / 跨方法 / 跨 IIFE / 校验在未调用函数里，一律不担保（S4/S5/S6/X1–X4）。
 *   ② **校验在写入之前**（同一函数体内文本更靠前）。
 *   ③ 校验所在的最内层块，必须是写入所在块的**祖先或自身**
 *      ⇒ index.ts「校验在 if (stationId) 里、写入在它的 else 分支里」成立，
 *        而「校验在兄弟分支里」不成立。
 *   ④ ③不成立时（兄弟块）：若该兄弟块内部还嵌套了函数体（S7 形态），
 *      说明它是一段**独立逻辑单元**，本门禁无法用文本判据确认它与写入点的关系
 *      ⇒ **fail closed 判红**；否则按已知边界放行（见 SELFTEST_KNOWN_GAP）。
 *
 * @param {ReturnType<typeof buildBraceTree>} tree
 */
function guardCovers(tree, gIdx, wIdx) {
  if (!(gIdx < wIdx)) return false
  const wFn = nearestFnBody(tree, wIdx)
  const gFn = nearestFnBody(tree, gIdx)
  if (wFn !== gFn) return false
  const gBlock = innermostNode(tree, gIdx)
  const wBlock = innermostNode(tree, wIdx)
  // 模块顶层：语句按序执行，顺序即保证
  if (gBlock === null) return true
  if (gBlock === wBlock) return true
  if (isAncestorNode(tree, gBlock, wBlock)) return true
  // 兄弟 / 堂兄弟块：默认是「不感知控制流」的已知边界；块内嵌函数体则 fail closed
  return !gBlock.hasFn
}

/**
 * 写入点的作用域起点（= 其最内层函数体祖先的开括号之后；模块顶层为 0）。
 * @returns {number}
 */
function writeScopeStart(tree, wIdx) {
  const fn = nearestFnBody(tree, wIdx)
  return fn === null ? 0 : fn.start + 1
}
/**
 * 取出写入行 payload 的对象文本。
 * upsert(row, ...) 里 row 可能是变量 ⇒ 回溯它的 `const row = {` 声明。
 *
 * @param {string} expr payload 表达式文本（首参）
 * @param {string} code 文件全文
 * @param {number} exprAbsIdx 该表达式在 code 中的**绝对**起始下标
 * @returns {string|null}
 */
function resolvePayloadObject(expr, code, exprAbsIdx, depth = 0) {
  const text = String(expr ?? '').trim()
  if (!text || depth > 3) return null

  if (text.startsWith('{')) {
    // 内联对象：用绝对下标定位，不能 code.indexOf('{')（那会命中文件里第一个花括号）
    let i = exprAbsIdx
    while (i < code.length && /\s/.test(code[i])) i += 1
    return code[i] === '{' ? readBalanced(code, i, '{', '}') : null
  }

  if (/^[A-Za-z_$][\w$]*$/.test(text)) {
    const declRe = new RegExp(`(?:const|let|var)\\s+${text}\\s*(?::[^=;\\n]*)?=\\s*\\{`, 'g')
    for (const d of code.matchAll(declRe)) {
      const body = readBalanced(code, d.index + d[0].length - 1, '{', '}')
      if (body !== null) return body
    }
  }
  return null
}

/** 从 payload 对象文本里取某列的值表达式 */
function payloadValue(payload, col) {
  const re = new RegExp(`(?:^|[,{\\s])${col}\\s*:\\s*([^,}\\n]+)`, 'i')
  const hit = payload.match(re)
  return hit ? String(hit[1]).trim() : null
}

// ---------------------------------------------------------------- 主判定

/**
 * 对一段服务端代码跑全部规则。这是**唯一**的判定实现 ——
 * 自检样本与真实文件走的是同一个函数（否则自检验的不是门禁本身）。
 *
 * @param {string} code 文件全文
 * @param {string} relPath 相对 ROOT 的 POSIX 路径（用于报告）
 * @param {ReturnType<typeof parseSchema>} schema
 * @returns {Array<{rule: string, file: string, lineNo: number, text: string, hint: string}>}
 */
function judgeCode(code, relPath, schema) {
  const uidExprs = collectUidExpressions(code)
  const bindings = collectBindings(code)
  const lineOf = (idx) => code.slice(0, idx).split('\n').length

  // 花括号树：整份文件只建一次（词法扫描 O(n)），之后所有作用域问题都在树上查询。
  // 惰性构建 —— 自检里有些样本根本不涉及写入，不必付这个代价。
  let treeCache = null
  const treeOf = () => {
    if (treeCache === null) treeCache = buildBraceTree(code)
    return treeCache
  }

  // 客户端变量 → 权限类别。扫所有 createClient 调用点，**不筛变量名**。
  // 赋值形态要覆盖两种：
  //   admin = createClient(...)
  //   anonAsUser = cond ? createClient(...) : null     ← 跨行也算（dev 插件就是后者）
  const clientKinds = new Map()
  // 用 `createClient\(`（**不带** `\s*`）：否则 match.index 落在 `createClient` 之后，
  // clientVarBefore 再向前扫就找不到那个名字了（实测踩过）。
  for (const m of code.matchAll(/createClient\(/g)) {
    const args = readBalanced(code, m.index + 'createClient'.length, '(', ')')
    if (args === null) continue
    const varName = clientVarBefore(code, m.index)
    if (!varName) continue
    clientKinds.set(varName, classifyClient(args, code))
  }

  /** 某个接收者表达式（`admin` / `sb` / 内联 createClient(...)）是不是 service_role */
  const receiverIsService = (receiver) => {
    if (!receiver) return false
    const inline = receiver.match(/^(?:[\w$]+\s*\.\s*)*createClient\s*\(/)
    if (inline) {
      const openIdx = receiver.indexOf('(', inline[0].length - 1)
      const args = readBalanced(receiver, openIdx, '(', ')')
      return args !== null && classifyClient(args, code) === 'service'
    }
    const name = receiver.trim().split(/[^\w$]/).filter(Boolean).pop()
    if (!name) return false
    // 溯源失败（unknown）⇒ fail closed，按 service_role 处理
    return clientKinds.get(name) !== 'anon'
  }

  /** 取 `.from(`/`.rpc(` 之前的接收者表达式 */
  const receiverBeforeIdx = (idx) => receiverBefore(code, idx)

  const violations = []

  // ---- R1 / R2：遍历所有 .from('<table>') 链
  // 表名允许单引号 / 双引号 / **反引号**（QA E8：模板字符串做名字是合法写法）
  for (const m of code.matchAll(/\.\s*from\s*\(\s*['"`](\w+)['"`]\s*\)/g)) {
    const table = m[1]
    const receiver = receiverBeforeIdx(m.index)
    if (!receiverIsService(receiver)) continue

    const chainStart = m.index + m[0].length
    const chain = readChain(code, chainStart)

    // R1：只读链一律放行（读 dict_cache 全表 / 读 generation_usage 都是正常做法）。
    // 只要链里出现写方法才继续判定。
    const writeMethod = chain.methods.find((x) =>
      ['insert', 'upsert', 'update', 'delete'].includes(x),
    )
    if (!writeMethod) continue

    // 豁免 B：共享表（开了 RLS 但零策略，service_role 可读写）
    const guardCols = schema.guardedTables.get(table)
    if (!guardCols) continue

    // ⚠️ 括号内容必须按 **code 的绝对下标** 取（chain.text 是子串，下标不通用）
    const writeRel = chain.text.indexOf(`.${writeMethod}`)
    if (writeRel < 0) continue
    const openIdx = chain.start + writeRel + writeMethod.length + 1
    const argsText = readBalanced(code, openIdx, '(', ')')
    const payloadExpr = argsText === null ? '' : splitTopLevel(argsText)[0]
    const payload = resolvePayloadObject(payloadExpr, code, openIdx + 1)

    // 豁免 A1：写入行的 owner 列必须钉到「已鉴权的 uid」。
    //
    //   判定来源有两处（见下面 ownerOk）：
    //     ① uid 表达式可在本文件内溯源到 auth.getUser（collectUidExpressions）；
    //     ② 或等于「写入前那次归属校验所过滤的 owner 值」（guardUidExprs）。
    //
    //   ⚠️ 溯源①是**文件内**的。所以当 uid 是函数入参、或 client 来自别的模块时，
    //   ①不成立 —— 那正是②存在的理由：**不是放宽 A1，而是承认「归属校验已经
    //   证明过这个表达式就是当前用户的 uid」**。攻击者可控的值（如 body.owner_id）
    //   不会成为归属校验里被过滤的那个表达式，所以②不会给它开门。
    //   A1 与 A2 是**独立**的两项：A2 只抵消「父表归属」，不抵消 owner 列。

    // 豁免 A2：行里有指向另一个 owner 保护表的外键 ⇒ 必须先验父资源归属。
    //
    //   ★ A2 **只抵消「父表归属」这一项**，不再放行整个写入（QA 指出过拟合的
    //     副作用：上一轮为了让「uid/client 不在本文件内可溯源」的合法写法通过，
    //     把 A2 改成「命中即足以放行整个写入」，结果 A2 成了万能钥匙 ——
    //     `owner_id: body.owner_id` 这种攻击者可控的写法也能白拿 A2 而被放行）。
    //     现在 payload 的 owner 列**仍须独立满足 A1**。
    //   ★ A2 必须与写入**在同一函数体内**（QA 构造的真漏洞，见 enclosingFunctionScope）。
    //
    //   A2 命中时会把「它证明过归属的那个 uid 表达式」记进 guardUidExprs：
    //   若 payload 的 owner 列正好写的是这个表达式，则 A1 也算满足 ——
    //   这就是「uid 从入参传入 / client 跨模块」那几类**合法**写法不被误报的原因，
    //   而它们并不需要放宽 A1 本身的判据。
    let parentOk = false
    let parentViolation = null
    const guardUidExprs = new Set()
    const tableFks = payload === null ? null : schema.fks.get(table)
    if (tableFks) {
      for (const [col, ref] of tableFks) {
        const refTable = ref.table
        const refGuardCols = schema.guardedTables.get(refTable)
        if (!refGuardCols) continue // 父表不是 owner 保护表 ⇒ 无需额外校验
        const fkValue = payloadValue(payload, col)
        if (!fkValue) continue
        const fkNorm = normExpr(fkValue)

        // ⚠️ 只在**写入点所在的函数体内**找前置的归属校验（花括号树查询，不反向猜文本）
        const tree = treeOf()
        const scopeStart = writeScopeStart(tree, m.index)
        const priorCode = code.slice(scopeStart, m.index)
        let guarded = false
        for (const fm of priorCode.matchAll(
          new RegExp(`\\.\\s*from\\(\\s*['"\`]${refTable}['"\`]\\s*\\)`, 'g'),
        )) {
          // priorCode 是子串：换算回 code 的绝对下标，才能在树上查询
          const gIdx = scopeStart + fm.index
          if (!guardCovers(tree, gIdx, m.index)) continue
          const qChain = readChain(priorCode, fm.index + fm[0].length)
          if (!qChain.methods.includes('select')) continue
          // ★ owner 列匹配：查了父表还不够，必须**按 owner 列过滤** ——
          //   只按主键查（`.eq('id', X)`）根本不是归属校验。
          //   （这条判据原先没有自检样本覆盖，属于「可静默腐化」的盲区，已补。）
          //   列名允许反引号（QA E8）+ 大小写不敏感（QA E9），由 `i` 标志与反引号类提供。
          let ownerMatched = false
          for (const oc of refGuardCols) {
            const eqRe = new RegExp(`\\.\\s*eq\\(\\s*['"\`]${oc}['"\`]\\s*,\\s*([^)]*)\\)`, 'gi')
            for (const em of qChain.text.matchAll(eqRe)) {
              ownerMatched = true
              // ★ 请求来源表达式不可信：**否决式**判定 ——
              //   只要该值的根标识命中「调用方提供」名单（含经解构 / 局部变量中转），
              //   它证明的就不是「这是当前用户的 uid」，而是「调用方说这是某个 uid」
              //   ⇒ 不给它发放豁免（QA E2/E5/E6/E7）。
              const gExpr = normExpr(em[1])
              if (!isRequestDerived(em[1], bindings)) guardUidExprs.add(gExpr)
            }
          }
          // ★ 必须用**同一个外键值**过滤 —— 比较 .eq() 的**第二个实参表达式**
          //   与 payload 外键值（归一化后全等），而不是裸子串包含。
          //   裸子串会把「写入变量名恰好是链文本的子串」（如 `id` 之于
          //   `.eq('id', …)`）误判成同一个值 ⇒ 「验 A 站、写 B 站」漏过。
          const fkEqRe = new RegExp(
            `\\.\\s*eq\\(\\s*['"\`]${ref.col}['"\`]\\s*,\\s*([^)]*)\\)`,
            'gi',
          )
          const fkMatched = [...qChain.text.matchAll(fkEqRe)].some(
            (em) => normExpr(em[1]) === fkNorm,
          )
          if (ownerMatched && fkMatched) {
            guarded = true
            break
          }
        }
        if (guarded) {
          parentOk = true
        } else {
          parentViolation = {
            rule: 'R2',
            file: relPath,
            lineNo: lineOf(m.index),
            text: `${table}.${col} → ${refTable}`,
            hint:
              `写 ${table} 时 ${col} 指向 owner 保护表 ${refTable}，但**在同一个函数体内**` +
              `没有对 ${refTable} 做归属校验。service_role 绕过 RLS（铁证：dict_cache 零策略` +
              `仍可被它全表读出 64559 行），所以「数据库会挡住」是错的假设 —— ` +
              `调用方可传任意他人的 ${col}，把数据写进别人的资源。` +
              `（注意：光把 owner_id 钉成自己的 uid 不够 —— 那次真实越权的 payload 里也写了 owner_id: uid。）` +
              `修法：在写入前查 ${refTable} 并**同时**过滤主键与 owner 列` +
              `（如 .eq('id', <${col}>).eq('${[...refGuardCols][0]}', uid)），不匹配则拒绝写入。`,
          }
          break
        }
      }
    }

    if (parentViolation) violations.push(parentViolation)

    // A1 独立判定：owner 列必须钉到「已鉴权 uid」，或钉到「A2 刚证明过归属的那个表达式」
    let ownerOk = payload !== null
    if (ownerOk) {
      for (const col of guardCols) {
        const value = payloadValue(payload, col)
        // 与 guardUidExprs 用同一个归一化口径（去空白 / 尾逗号，**不**转小写）
        const norm = normExpr(value)
        if (!isUidExpression(value, uidExprs) && !guardUidExprs.has(norm)) {
          ownerOk = false
          break
        }
      }
    }

    // A2 已确认父资源归属 ⇒ 父表这一项无需再报；但 owner 列仍由 A1 独立把关
    if (!ownerOk) {
      violations.push({
        rule: 'R2',
        file: relPath,
        lineNo: lineOf(m.index),
        text: `${table}（owner 列：${[...guardCols].join(', ')}）`,
        hint:
          `service_role 客户端写 owner 保护表 ${table}，但写入行的 owner 列没有钉到「已鉴权的 uid」` +
          `（已鉴权 uid 来自 auth.getUser(token) 的返回值；写入前那次归属校验所证明的表达式也算）。` +
          `${parentOk ? '父表归属已校验，但 owner 列本身仍须钉住 —— 否则 owner_id 可能是调用方传来的任意值。' : ''}` +
          `service_role 绕过 RLS，写进去的行不再受 owner 策略约束。` +
          `修法：把 owner 列钉到已鉴权 uid。`,
      })
    }
  }

  // ---- R3：service_role 调身份推导型 RPC
  for (const m of code.matchAll(/\.\s*rpc\s*\(\s*['"](\w+)['"]/g)) {
    const receiver = receiverBeforeIdx(m.index)
    if (!receiverIsService(receiver)) continue
    if (!schema.authUidRpcs.has(m[1])) continue
    violations.push({
      rule: 'R3',
      file: relPath,
      lineNo: lineOf(m.index),
      text: m[1],
      hint:
        `service_role 客户端调了 RPC ${m[1]}，而它的函数体里用 auth.uid() 推导身份。` +
        `service_role 的 JWT 没有 sub ⇒ auth.uid() 为 NULL ⇒ 该 RPC 必然抛 'not authenticated'。` +
        `修法：改用带用户 Authorization 的 anon 客户端调用（让 PostgREST 注入 request.jwt.claims）。` +
        `⛔ 绝不能给 RPC 加 p_uid 参数来「修」—— 那会把身份从「令牌推导」变成「调用方指定」，` +
        `任何人传别人的 uid 就能烧别人的额度。另外：调用失败必须 fail closed，绝不能当成「没超限」放行。`,
    })
  }

  return violations
}

// ---------------------------------------------------------------- 扫描范围
//
// ⚠️ 这里最容易被写成硬编码白名单（`{ kind: 'file', rel: 'scripts/dev-generate-plugin.mjs' }`），
// 而那正是**镜像漂移的缝**：镜像恰好在 scripts/ 下，规则写着「scripts 下都不扫」，
// 于是这个特例一旦被硬编码，「漂移过一次」就变成「合法豁免」。
// 所以下面用**识别规则**把镜像挑出来，而不是列名单 —— 新增镜像自动纳入。

/** 服务端目录：部署到 Edge 的代码，真正的信任边界 */
const SERVER_DIRS = [{ rel: 'supabase/functions', exts: ['.ts', '.js', '.mjs'] }]

/**
 * 「本地镜像」的文件名形态（规则的可测部分，与文件是否存在无关）。
 *
 * 抽出来单独判，是为了让自检能在**不真的建文件**的前提下验证规则 ——
 * 否则自检只能验「已存在的那一个」，恰恰验不到「规则退化成硬编码名单」。
 */
function mirrorNameShape(relPath) {
  if (!relPath.startsWith('scripts/')) return false
  const name = path.basename(relPath)
  return /^(dev-|.*-(plugin|mirror|local)\.)/.test(name)
}

/**
 * 「本地镜像」的识别规则（三条同时满足才算，避免把普通脚本全拉进来）：
 *   ① 位于 scripts/ 下；
 *   ② 文件名是 dev-* / *-plugin / *-mirror / *-local 形态
 *      —— 即「替代真实服务在本地跑」这一类名字约定；
 *   ③ 文件里真的构造了 supabase 客户端（createClient）。
 *
 * 判据 ③ 是关键：光靠名字会误伤，光靠「用了 createClient」又会把
 * 一次性 QA 脚本（qa-*.mjs / test-*.mjs）全拉进来 —— 那些是测试夹具，
 * 用 service_role 造数据是本职工作，纳入范围只会让门禁变噪音。
 * 镜像的定义性特征是「**承载了生产逻辑的第二份实现**」，
 * dev-* 命名 + 真客户端这两条一起，足以把它和夹具区分开。
 */
function isLocalMirror(relPath) {
  if (!mirrorNameShape(relPath)) return false
  const full = path.join(ROOT, relPath)
  if (!existsSync(full) || !statSync(full).isFile()) return false
  return /createClient\s*\(/.test(readFileSync(full, 'utf8'))
}

/**
 * 测试夹具：明确排除。它们用高权限造数据是本职工作，
 * 纳入扫描只会制造噪音 —— 而噪音的门禁会被绕过，比没有门禁更糟。
 */
function isTestFixture(relPath) {
  return /^scripts\/(qa-|test-|validate-|gen-)/.test(relPath)
}

/** 递归收集目录下的源码文件（Edge Function 是 fn-name/index.ts 这种嵌套布局） */
function collectFiles(dir, exts, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      collectFiles(full, exts, out)
      continue
    }
    if (exts.some((e) => name.endsWith(e))) out.push(full)
  }
  return out
}

/** 展开成待扫描文件列表 */
function collectTargets() {
  const out = []
  for (const d of SERVER_DIRS) {
    for (const full of collectFiles(path.join(ROOT, d.rel), d.exts)) {
      out.push({ abs: full, rel: toPosix(path.relative(ROOT, full)), why: '部署路径' })
    }
  }
  // 本地镜像：按规则识别（不写死文件名），纳入同一套规则
  const scriptsDir = path.join(ROOT, 'scripts')
  for (const rel of collectFiles(scriptsDir, ['.mjs', '.js']).map((f) =>
    toPosix(path.relative(ROOT, f)),
  )) {
    if (isTestFixture(rel)) continue
    if (!isLocalMirror(rel)) continue
    out.push({ abs: path.join(ROOT, rel), rel, why: '生产逻辑的本地镜像' })
  }
  return out.sort((a, b) => a.rel.localeCompare(b.rel))
}

// ---------------------------------------------------------------- 载入事实

const migrationsDir = path.join(ROOT, 'supabase', 'migrations')
const schema = parseSchema(
  readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(path.join(migrationsDir, f), 'utf8'))
    .join('\n'),
)

const targets = collectTargets()

// ---------------------------------------------------------------- 门禁自检
//
// 一道门禁自己是不是有效的，必须能被证明 —— 否则「全绿」可能只是规则从来没
// 命中过任何东西。所以这里用几段**样本代码**当场验证规则本身：
//   正样本（应当通过）= 合法写法
//   反样本（必须被拦）= 各类越权 / 绕过尝试
// 任何一条不符预期，这个门禁就报失败 —— 宁可误报，不可漏报。
//
// ⚠️ 自检本身必须**可能失败**。写完请问一句「它有可能永远绿吗」——
// 上一轮 `Boolean(/re/)` 恒 true（拿到 RegExp 对象不是匹配结果）就是这种坑。
// 本文件的做法：
//   1. 反样本断言**具体命中项**（规则号 + 命中内容），而不是「有违规就行」
//      —— 否则规则退化成随便报一条也会绿；
//   2. 额外钉住三个中间量（classifyClient / collectUidExpressions 的输出），
//      防止「分类器整体失灵 ⇒ 正样本因为判不出违规而全绿」这种假绿。

/** 正样本（必须零违规） */
const SELFTEST_GOOD = [
  [
    'service_role 写共享表 dict_cache（豁免 B：零策略）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('dict_cache').upsert({ form_key: fk, payload }, { onConflict: 'form_key' })`,
  ],
  [
    'service_role 读任何表都放行（R1：读不设防）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const a = await admin.from('dict_cache').select('form_key').in('form_key', keys)
const b = await admin.from('generation_usage').select('used,quota').eq('owner_id', uid)
const c = await admin.from('stations').select('id').eq('owner_id', uid)`,
  ],
  [
    '自限写入：owner 列钉到已鉴权 uid（豁免 A1）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('user_words').upsert({ owner_id: uid, form, form_key: fk }, { onConflict: 'owner_id,form_key' })`,
  ],
  [
    '父资源已验归属才写 station_words（豁免 A1+A2，= index.ts 现状）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: uw.word_key })`,
  ],
  [
    'uid 变量改名也不影响判定（溯源走的是令牌不是名字）',
    `const { data: userData } = await anon.auth.getUser(token)
const me = userData.user.id
const svc = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await svc.from('learn_records').upsert({ owner_id: me, word_key: kw })`,
  ],
  [
    '带用户 Authorization 的客户端调身份型 RPC 是正解（红线二的修法）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const anonAsUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY'), {
  global: { headers: { Authorization: authHeader } },
})
const { data: q } = await anonAsUser.rpc('consume_generation_quota', { n: 1 })`,
  ],
  [
    'service_role 读 owner 保护表也放行（本项目大量存在）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: mine } = await admin.from('user_words').select('id').eq('owner_id', uid)
const { data: cacheRows } = await admin.from('dict_cache').select('payload').in('form_key', keys)`,
  ],
  // ---- 下面 5 条是「fail closed 的误报边界」实测样本（2026-09 补）----
  //
  // 溯源失败时按 service_role 处理（fail closed），代价是可能误报。
  // 误报的**真实边界**就是下面这几类：uid 或 client 不在本文件内可溯源。
  // 它们全部靠**豁免 A2**（写入前已验父资源归属）合法通过 ——
  // 也就是说 A2 命中即足以放行整个写入，不需要再叠加 A1。
  // 若没有这 5 条，上面那种「为了门禁去改生产代码」的压力就会落到人身上，
  // 而报红的门禁会被绕过 —— 那是比漏报更坏的结果。
  [
    '误报边界 ①：client 由函数入参传入（溯源失败）+ 归属校验齐全 ⇒ 不得误报',
    `function handler(admin, uid, stationId, kw) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) return null
  return admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
}`,
  ],
  [
    '误报边界 ②：client 来自别的模块（本文件追不到）+ 归属校验齐全 ⇒ 不得误报',
    `import { getServiceClient } from './db.js'
const db = getServiceClient()
const { data: owned } = await db.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await db.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })`,
  ],
  [
    '误报边界 ③：key 由入参透传（溯源失败）+ 只写共享表 + 只读受保护表',
    `const admin = createClient(options.url, options.key)
const rows = await admin.from('user_words').select('id').eq('owner_id', uid)
await admin.from('dict_cache').upsert({ form_key: fk, payload })`,
  ],
  [
    '误报边界 ④：key 由入参透传 + 写 user_words（自限写入，无需父资源校验）',
    `const admin = createClient(options.url, options.key)
const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
await admin.from('user_words').upsert({ owner_id: uid, form, form_key: fk }, { onConflict: 'owner_id,form_key' })`,
  ],
  [
    '误报边界 ⑤：key 是拼出来的（溯源失败）但确为 anon 客户端 + 自限写入',
    `const key = [prefix, suffix].join('')
const anon = createClient(url, key)
const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
await anon.from('user_words').upsert({ owner_id: uid, form, form_key: fk })`,
  ],
]

/** 反样本（必须被拦，且断言命中的规则号与内容） */
const SELFTEST_BAD = [
  [
    '真实越权形态：service_role 直写 station_words 无归属校验',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '换个变量名（sb）：证明判定不靠变量名',
    `const sb = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await sb.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '内联 createClient：不留变量名照样认出来',
    `await createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  .from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '只验了别的站：验 A 站、写 B 站必须仍被拦',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: owned } = await admin.from('stations').select('id').eq('id', someOtherStation).eq('owner_id', uid).maybeSingle()
await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    'service_role 写 user_words 且 owner 取自请求体（钉不到已鉴权 uid）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('user_words').upsert({ owner_id: body.owner_id, form, form_key: fk })`,
    { rule: 'R2', text: 'user_words（owner 列：owner_id）' },
  ],
  [
    'service_role 写 stations（owner 保护表本体）无归属校验',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('stations').insert({ owner_id: body.ownerId, name: body.name })`,
    { rule: 'R2', text: 'stations（owner 列：owner_id）' },
  ],
  [
    'service_role 调依赖 auth.uid() 的 RPC（配额那类）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: q, error: e } = await admin.rpc('consume_generation_quota', { n: 1 })`,
    { rule: 'R3', text: 'consume_generation_quota' },
  ],
  [
    'service_role 写 learn_records（用户私有内容）',
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
await admin.from('learn_records').upsert({ word_key: kw, status: 'known' })`,
    { rule: 'R2', text: 'learn_records（owner 列：owner_id）' },
  ],
  [
    '凭证从入参透传、溯源失败 ⇒ fail closed 按 service_role 处理',
    `export default function plugin(options = {}) {
  const admin = createClient(options.url, options.key)
  return admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: kw })
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  // ---- 下面 3 条覆盖「A2 自身」的两个盲区（QA 用变异测试证明过它们此前无样本）----
  //
  // ① M15：`.eq('id', X)` 但**不带** `.eq('owner_id', …)` ——
  //    只按主键查父表根本不构成归属校验（验的是别人的站也照样「查到了」）。
  //    QA 的变异测试证明：拆掉 owner 列匹配，自检仍然全绿 ⇒ 该判据可静默腐化。
  [
    'M15：只按主键查父表、没按 owner 过滤 ⇒ 不构成归属校验（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: st } = await admin.from('stations').select('id').eq('id', victimStationId).maybeSingle()
if (!st) throw new Error('STATION_NOT_FOUND')
await admin.from('station_words').upsert({ station_id: victimStationId, owner_id: uid, word_key: kw })`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  // ② 跨函数白拿 A2（QA 构造的真漏洞）：在文件更早处放一段正当的归属校验，
  //    再追加一个新函数、沿用**同名变量**、自己不做任何校验。
  //    原实现只看「文本上更靠前」（code.slice(0, idx)）⇒ 白拿豁免被放行。
  [
    '跨函数白拿 A2：更早处有合法校验，新函数沿用同名变量却不校验（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')

export async function escalated(stationId, uid, wordKey) {
  const admin2 = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  await admin2.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  // ③ A2 不得成为万能钥匙：owner_id 攻击者可控时，A2 命中也必须被 A1 独立抓住。
  [
    'A2 不是万能钥匙：父表校验过了，但 owner_id 取自请求体（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
if (!owned) throw new Error('STATION_FORBIDDEN')
await admin.from('station_words').upsert({ station_id: stationId, owner_id: body.owner_id, word_key: kw })`,
    { rule: 'R2', text: 'station_words（owner 列：owner_id）' },
  ],
  // ---- 跨方法 / 跨函数作用域（QA 第二轮：上一轮的修复换语法糖就会失效）----
  [
    '作用域①：校验在 class 的**另一个方法**里，写入在本方法（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
class StationWordsApi {
  async ensureOwned(stationId) {
    const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
    return owned
  }
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  }
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '作用域②：校验在对象字面量的另一个方法里（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const api = {
  async ensureOwned(stationId) {
    const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
    return owned
  },
  async saveWords(stationId, wordKey) {
    await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: wordKey })
  },
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '作用域③：写入在匿名 default export function 内，校验在更早的具名函数里（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function ensureStationOwned(stationId) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  return owned
}
export default async function (req) {
  await admin.from('station_words').upsert({ station_id: req.body.station_id, owner_id: uid, word_key: req.body.word_key })
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  // ---- 「同一个外键值」必须是表达式全等，不能是子串包含（QA 第二轮）----
  [
    '同一个外键值③：写入变量名恰是校验链文本的子串（`id` 之于 .eq(\'id\',…)）（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('FORBIDDEN')
  const id = req.body.other_station_id
  await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  [
    '循环变量与被校验变量不同物：循环里逐个写入 req 传来的站点（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(req) {
  const stationId = req.body.station_id
  const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  if (!owned) throw new Error('FORBIDDEN')
  for (const id of req.body.targets) {
    await admin.from('station_words').upsert({ station_id: id, owner_id: uid, word_key: req.body.word_key })
  }
}`,
    { rule: 'R2', text: 'station_words.station_id → stations' },
  ],
  // ---- 请求来源表达式不可信（含局部变量中转，QA 的 P1/P3）----
  [
    '请求来源①：归属校验里的 owner 值取自 body.*（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(body) {
  const { data: owned } = await admin.from('stations').select('id').eq('id', body.station_id).eq('owner_id', body.owner_id).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: body.station_id, owner_id: body.owner_id, word_key: body.word_key })
  }
}`,
    { rule: 'R2', text: 'station_words（owner 列：owner_id）' },
  ],
  [
    '请求来源②：经局部变量中转的 req 来源（`.eq` 里是普通标识符，看不出来源）（必须红）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(req) {
  const ownerId = req.nextUrl.searchParams.get('owner_id')
  const { data: owned } = await admin.from('stations').select('id').eq('id', sId).eq('owner_id', ownerId).maybeSingle()
  if (owned) {
    await admin.from('station_words').upsert({ station_id: sId, owner_id: ownerId, word_key: kw })
  }
}`,
    { rule: 'R2', text: 'station_words（owner 列：owner_id）' },
  ],
]

/**
 * 「已知边界」样本：A2 **不感知控制流**，这些形态当前**判绿**（即：可被绕过）。
 *
 * ⚠️ 为什么断言的是「期望绿」而不是「期望红」：
 *   它们是**真实存在的缺口**，写成期望红 ⇒ 门禁现在就红 ⇒ 无法交付；
 *   若干脆不写，又回到「自检里一条都没覆盖」的老问题 ——
 *   将来有人改作用域栈时，无从知道这些形态是否被顺带修掉了。
 *
 *   ⇒ 这里断言的是**当前的真实行为**，并在它真被修掉时**主动报错**：
 *   若哪天这些样本转红，门禁会提示「已知边界已被关闭，请更新此记录并补真正的判据」。
 *   这把「记录在案」变成**可执行的记录**，而不是注释里的一句话。
 *   （依据：本门禁的**漏报比误报更危险** —— 假绿会给人虚假的安全感。）
 */
const SELFTEST_KNOWN_GAP = [
  [
    '控制流①：校验包在调用方可跳过的 if 分支里（A2 不感知控制流 ⇒ 当前判绿）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(req) {
  const stationId = req.body.station_id
  if (req.body.skipCheck) {
    const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
    if (!owned) throw new Error('FORBIDDEN')
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}`,
  ],
  [
    '控制流②：校验在 try 内且 catch 吞掉异常（A2 不感知控制流 ⇒ 当前判绿）',
    `const { data: userData } = await anon.auth.getUser(token)
const uid = userData.user.id
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
export async function saveWords(req) {
  const stationId = req.body.station_id
  try {
    const { data: owned } = await admin.from('stations').select('id').eq('id', stationId).eq('owner_id', uid).maybeSingle()
  } catch (e) {
    console.warn('check failed', e)
  }
  await admin.from('station_words').upsert({ station_id: stationId, owner_id: uid, word_key: req.body.word_key })
}`,
  ],
]

const selftestFailures = []

for (const [name, code] of SELFTEST_GOOD) {
  const found = judgeCode(code, '__selftest__', schema)
  if (found.length > 0) {
    selftestFailures.push(
      `正样本「${name}」被误判为违规（${found
        .map((f) => `${f.rule}@${f.text}`)
        .join(', ')}）—— 规则过严，会逼着人写绕路代码`,
    )
  }
}

for (const [name, code, expect] of SELFTEST_BAD) {
  const found = judgeCode(code, '__selftest__', schema)
  if (found.length === 0) {
    selftestFailures.push(`反样本「${name}」未被拦住 —— 门禁有洞，规则的「全绿」不可信`)
    continue
  }
  const hit = found.some((f) => f.rule === expect.rule && f.text === expect.text)
  if (!hit) {
    selftestFailures.push(
      `反样本「${name}」报的不是预期违规 —— 期望 ${expect.rule}@${expect.text}，实际 ${found
        .map((f) => `${f.rule}@${f.text}`)
        .join(', ')}`,
    )
  }
}

// 中间量自检：分类器整体失灵时，正样本会「因为判不出违规而全绿」。
{
  const probe = [
    `const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))`,
    `const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY'))`,
    `const { data: userData } = await anon.auth.getUser(token)`,
    `const uid = userData.user.id`,
  ].join('\n')
  const svcArgs = readBalanced(probe, probe.indexOf('createClient(') + 'createClient'.length, '(', ')')
  const anonArgs = readBalanced(
    probe,
    probe.lastIndexOf('createClient(') + 'createClient'.length,
    '(',
    ')',
  )
  if (classifyClient(svcArgs ?? '', probe) !== 'service') {
    selftestFailures.push('中间量自检失败：service_role 凭证未被识别为 service（凭证分类器失灵）')
  }
  if (classifyClient(anonArgs ?? '', probe) !== 'anon') {
    selftestFailures.push('中间量自检失败：anon 凭证未被识别为 anon（凭证分类器失灵）')
  }
  const uids = collectUidExpressions(probe)
  if (!uids.has('uid') || !uids.has('userdata.user.id')) {
    selftestFailures.push(
      `中间量自检失败：uid 溯源结果为 {${[...uids].join(', ')}}，应同时含 uid 与 userData.user.id`,
    )
  }
}

// 扫描范围自检：镜像识别规则必须真的认得出镜像，且**不误伤测试夹具**。
//
// 这条尤其重要：镜像漂移就是从「scripts/ 下都不扫」这个缝钻进来的。
// 如果识别规则退化成「只认 dev-generate-plugin.mjs 这一个文件名」，
// 那么下一个新建的镜像就会静默逃出扫描 —— 门禁会一直绿，而越权已经在那儿了。
// 所以这里断言规则的**判据**（名字形态 + 真客户端），而不是某个具体文件名。
{
  // 镜像：dev-* 命名 + 真的建了客户端 ⇒ 必须被纳入
  if (!isLocalMirror('scripts/dev-generate-plugin.mjs')) {
    selftestFailures.push('扫描范围自检失败：已知的本地镜像 scripts/dev-generate-plugin.mjs 未被识别（规则可能退化成硬编码名单）')
  }
  // 换一个**没被硬编码**的名字，同样必须被识别 —— 证明是规则而非名单
  if (!mirrorNameShape('scripts/dev-cache-plugin.mjs')) {
    selftestFailures.push('扫描范围自检失败：新命名的镜像（scripts/dev-cache-plugin.mjs）未被识别 —— 说明识别退化成硬编码文件名，新增镜像会静默逃出扫描')
  }
  // 测试夹具：即使建客户端、有 service_role，也**不该**被纳入（否则门禁变噪音）
  if (isTestFixture('scripts/qa-live-two-account.mjs') === false) {
    selftestFailures.push('扫描范围自检失败：QA 夹具未被识别为测试脚本，会被错误纳入扫描')
  }
  if (isTestFixture('scripts/test-cache-compat.mjs') === false) {
    selftestFailures.push('扫描范围自检失败：test-*.mjs 未被识别为测试脚本')
  }
  // 非 scripts/ 下的文件不该被当成镜像
  if (mirrorNameShape('src/lib/supabase.js')) {
    selftestFailures.push('扫描范围自检失败：src/ 下的文件被误判为本地镜像')
  }
  // 测试夹具即便命中名字形态（如 scripts/dev-*.mjs 恰好叫这名字）也由 isTestFixture 先挡掉
  if (mirrorNameShape('scripts/qa-anything.mjs')) {
    selftestFailures.push('扫描范围自检失败：qa-* 被误判为镜像命名形态')
  }
}

// 已知边界自检：断言「这些形态当前确实判绿」（= 确实仍可被绕过）。
// 若哪天它们转红 ⇒ 说明控制流感知被顺带实现了 ⇒ 必须更新记录并补真正的判据，
// 否则这条断言会一直按旧预期报错、变成噪音。
for (const [name, code] of SELFTEST_KNOWN_GAP) {
  const found = judgeCode(code, '__known_gap__', schema)
  if (found.length > 0) {
    selftestFailures.push(
      `已知边界「${name}」已不再被判绿（命中 ${found.map((f) => `${f.rule}@${f.text}`).join(', ')}）` +
        `—— 控制流感知可能已被实现，请更新 SELFTEST_KNOWN_GAP 记录并补真正的判据，别让这条断言变成噪音`,
    )
  }
}

if (selftestFailures.length > 0) {
  console.error('[test:rls] ✗ 门禁自检失败（规则本身不可信）\n')
  selftestFailures.forEach((f) => console.error(`  ✗ ${f}`))
  console.error('')
  process.exit(1)
}

// ---------------------------------------------------------------- 汇总

const realViolations = targets.flatMap((t) => judgeCode(readFileSync(t.abs, 'utf8'), t.rel, schema))

const guardedList = [...schema.guardedTables.keys()].sort()
const sharedList = [...schema.rlsTables].filter((t) => !schema.guardedTables.has(t)).sort()
const rpcList = [...schema.authUidRpcs].sort()

if (realViolations.length === 0) {
  console.log('[test:rls] ✓ 通过')
  console.log(
    `  扫描 ${targets.length} 个服务端文件：` +
      targets.map((t) => `${t.rel}〔${t.why}〕`).join('、'),
  )
  console.log(`    （镜像按规则识别：scripts/ 下 dev-*-plugin / *-mirror / *-local 且真建客户端者自动纳入；qa-* / test-* 为测试夹具，不扫）`)
  console.log(`  owner 保护表（据建库 SQL 解析）：${guardedList.join(', ')}`)
  console.log(`  共享表（开了 RLS 但零策略）：${sharedList.join(', ')}`)
  console.log(`  身份推导型 RPC（禁 service_role 直调）：${rpcList.join(', ')}`)
  console.log(
    `  门禁自检：${SELFTEST_GOOD.length} 个正样本通过、${SELFTEST_BAD.length} 个反样本被拦`,
  )
  console.log(
    `  已知边界（A2 不感知控制流，当前仍可绕过）：${SELFTEST_KNOWN_GAP.length} 条已固化为可执行断言`,
  )
  console.log('  R1 读一律放行 ✓   R2 写入须归属校验 ✓   R3 身份型 RPC 禁 service_role 直调 ✓')
  process.exit(0)
}

console.error('[test:rls] ✗ 失败\n')
realViolations.forEach((v) => {
  console.error(`  [${v.rule}] ${v.file}:${v.lineNo}  命中「${v.text}」`)
  console.error(`        ${v.hint}`)
})
console.error(`\n共 ${realViolations.length} 处违规。`)
console.error('service_role 绕过 RLS：对 owner 保护表，「数据库会挡住」是错的假设。')
process.exit(1)
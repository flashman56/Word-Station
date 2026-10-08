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
 * ⚠️ **当前 A2 是「文本推断」，不是「声明」。** 它靠「同一函数体内 + 查过父表
 *   + 按 owner 列过滤 + 用同一个外键值」这几个**文本特征**推断「归属已校验」。
 *
 *   【残留洞（已实测，零侵入前提下关不掉）】
 *   下面这个形态与「uid 由函数入参传入」的**合法**写法结构上**完全同形**，
 *   静态推断无法区分 —— 只能靠「uid 的可信来源」才能分辨：
 *
 *     const { data: owned } = await admin.from('stations')
 *       .select('id').eq('id', sId).eq('owner_id', body.ownerId).maybeSingle()  // ← 攻击者可控
 *     if (owned) await admin.from('station_words')
 *       .upsert({ station_id: sId, owner_id: body.ownerId, ... })
 *
 *   此处 owner_id 与归属校验里过滤的值是**同一个** body.ownerId ⇒ A1② 与 A2 都成立。
 *   要抓它，只能要求「归属校验里过滤的 owner 值」本身可溯源到 auth.getUser ——
 *   但那会把「uid 从入参传入」这类**合法**写法全部误报（正是本轮修掉的 5 类）。
 *   ⇒ 这是文本推断的**固有边界**，不是调参能消掉的问题。
 *
 * 【终局形态：声明式归属断言】
 *   引入显式函数（如 `assertOwnership('stations', stationId, uid)`），由它统一
 *   「取 uid + 查父表 + 过滤 owner 列 + 不匹配即抛」，门禁只认这一个出口 ⇒
 *   上述残留洞与跨函数洞一并消失。本轮**不做**：它要改 index.ts 与镜像的真实代码
 *   （行为改动），与「零侵入」原则冲突，留待专门一轮。
 *   ⚠️ 采纳时注意：引入命名的单一出口 = 给「统一改名」留了后路，
 *   纪律 §9.1 的教训仍适用 —— 出口本身要被门禁检查，不能只靠约定。
 * ================================================================
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

  // 外键：create table public.X ( ... <col> ... references public.Y(...) ... )
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)\s*\(/gi)) {
    const table = m[1]
    const openIdx = m.index + m[0].length - 1
    const body = readBalanced(sql, openIdx, '(', ')')
    if (body === null) continue
    const cols = new Map()
    for (const f of body.matchAll(
      /(\w+)\s+[\w\s]+?references\s+(?:public\.)?(\w+)\s*\(\s*(\w+)\s*\)/gi,
    )) {
      cols.set(f[1], f[2])
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
  const norm = String(expr ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/;$/, '')
    .toLowerCase()
  return norm.length > 0 && uidExprs.has(norm)
}

// ---------------------------------------------------------------- 写入行对象

/**
 * 取「包含 idx 的那个函数」的代码切片 —— A2 归属校验**必须在同一函数体内**。
 *
 * 🔴 为什么必须限定函数（QA 构造出的真漏洞）：
 *   原来用 `code.slice(0, idx)`，只看「文本上更靠前」。于是可以在文件更早处
 *   放一段正当的归属校验，再**追加一个新函数**、沿用同一个变量名、
 *   自己不做任何校验 ⇒ 白拿 A2 豁免，门禁放行。
 *   唯一防线是「换个变量名」—— 纯约定，编译器不管、也没人提醒。
 *
 * 做法：从 idx 往前找最近一个「函数起点」标记（function 声明 / 箭头函数 /
 * 方法定义），从那里切到 idx。找不到就说明写入在顶层（如 Edge Function 的
 * 模块级代码），此时用整段文件的前半部分 —— 与旧行为一致。
 *
 * @returns {{start: number, text: string}} start 是该函数起点在 code 中的绝对下标
 */
function enclosingFunctionScope(code, idx) {
  const before = code.slice(0, idx)
  // 函数起点标记：function 声明、箭头函数、async 方法定义
  const marks = [...before.matchAll(/(?:^|[\s;{}()])(?:export\s+)?(?:async\s+)?function\s*\*?\s*[A-Za-z_$][\w$]*|=>\s*\{/g)]
  if (marks.length === 0) return { start: 0, text: before }
  const last = marks[marks.length - 1]
  const start = last.index + (last[0].length - (last[0].trimStart().length))
  return { start, text: code.slice(start, idx) }
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
  const lineOf = (idx) => code.slice(0, idx).split('\n').length

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
  for (const m of code.matchAll(/\.\s*from\s*\(\s*['"](\w+)['"]\s*\)/g)) {
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
      for (const [col, refTable] of tableFks) {
        const refGuardCols = schema.guardedTables.get(refTable)
        if (!refGuardCols) continue // 父表不是 owner 保护表 ⇒ 无需额外校验
        const fkValue = payloadValue(payload, col)
        if (!fkValue) continue

        // ⚠️ 只在**同一函数体内**找前置的归属校验
        const scope = enclosingFunctionScope(code, m.index)
        const priorCode = scope.text
        let guarded = false
        for (const fm of priorCode.matchAll(
          new RegExp(`\\.\\s*from\\(\\s*['"]${refTable}['"]\\s*\\)`, 'g'),
        )) {
          const qChain = readChain(priorCode, fm.index + fm[0].length)
          if (!qChain.methods.includes('select')) continue
          // ★ owner 列匹配：查了父表还不够，必须**按 owner 列过滤** ——
          //   只按主键查（`.eq('id', X)`）根本不是归属校验。
          //   （这条判据原先没有自检样本覆盖，属于「可静默腐化」的盲区，已补。）
          let ownerMatched = false
          for (const oc of refGuardCols) {
            const eqRe = new RegExp(`\\.\\s*eq\\(\\s*['"]${oc}['"]\\s*,\\s*([^)]*)\\)`, 'gi')
            for (const em of qChain.text.matchAll(eqRe)) {
              ownerMatched = true
              guardUidExprs.add(String(em[1]).trim().replace(/\s+/g, '').toLowerCase())
            }
          }
          // 且必须用**同一个外键值**过滤 —— 否则「验的是 A 站、写的是 B 站」拦不住
          if (ownerMatched && qChain.text.includes(fkValue)) {
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
        const norm = String(value ?? '')
          .trim()
          .replace(/\s+/g, '')
          .toLowerCase()
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
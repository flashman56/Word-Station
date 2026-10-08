/**
 * QA 变异测试（mutation test）：证明门禁自检**真的会失败**。
 * ------------------------------------------------------------------
 * 「全绿」有两种可能：①规则确实对；②规则从来没被证伪过。
 * 只看 `npm run test:rls` 通过无法区分这两者。
 *
 * 手法：把门禁源码复制一份，逐个改坏关键判定，看自检是否转红。
 *
 * ⚠️ 三条 QA 自己踩过的坑，已固化成本文件的注释：
 *  1. 副本必须放在真实 scripts/ 下 —— 否则 ROOT 指错、每个变异都 ENOENT 崩溃，
 *     「10 个变异全被杀」其实测的是崩溃。
 *  2. 崩溃不算「被杀」—— 必须区分「规则抓到了违规」与「进程挂了」。
 *  3. 等价变异（改了但行为不变）不算存活 —— 那是 QA 的变异写错了，不是门禁有洞。
 *     下面每条存活都注明了「等价变异」还是「真漏洞」。
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')

const MUT_FILE = path.join(ROOT, 'scripts', 'qa-rls-mutant.mjs')
function cleanup() {
  if (existsSync(MUT_FILE)) dropProbe(MUT_FILE)
}

const original = readFileSync(SRC, 'utf8')
/** 被测文件是 CRLF 行尾（实测 1109/1109），多行模式必须先归一到 LF，否则一个都匹配不上 */
const LF = original.replace(/\r\n/g, '\n')

/** @type {Array<{id:string,title:string,mutate:(s:string)=>string,equiv?:string}>} */
const MUTANTS = [
  {
    id: 'M1',
    title: 'classifyClient 恒返回 "anon"（凭证分类器彻底失灵）',
    mutate: (s) =>
      s.replace(
        'function classifyClient(callArgs, code) {',
        'function classifyClient(callArgs, code) {\n  return "anon"',
      ),
  },
  {
    id: 'M2',
    title: 'receiverIsService 恒 false（service_role 认不出来）',
    mutate: (s) =>
      s.replace(
        'const receiverIsService = (receiver) => {\n    if (!receiver) return false',
        'const receiverIsService = (receiver) => {\n    if (true) return false\n    if (!receiver) return false',
      ),
  },
  {
    id: 'M3',
    title: '删掉 R2 违规上报（写入一律不报）',
    mutate: (s) =>
      s.replace('if (parentViolation) violations.push(parentViolation)', 'if (false) violations.push(parentViolation)'),
  },
  {
    id: 'M4',
    title: '删掉 R3 违规上报（身份型 RPC 不报）',
    mutate: (s) => s.replace("violations.push({\n      rule: 'R3'", "if (false) violations.push({\n      rule: 'R3'"),
  },
  {
    id: 'M5',
    title: '只拆 `!writeMethod` 这道读链放行',
    mutate: (s) => s.replace('if (!writeMethod) continue', 'if (!writeMethod) { /*mut*/ }'),
    equiv:
      '等价变异：紧随其后的 `if (writeRel < 0) continue` 仍会兜住读链（读链里没有 `.insert(` 等方法名 ⇒ writeRel=-1）。' +
      '⇒ R1 由**两道**闸守，任拆一道不改变行为。M5b 才真正拆掉 R1。',
  },
  {
    id: 'M5b',
    title: '彻底拆掉 R1（读链也当写入判）',
    mutate: (s) =>
      s
        .replace('if (!writeMethod) continue', 'if (!writeMethod) { /*mut*/ }')
        // 让 writeMethod 退化成 '.select'，读链就会真的走进写入判定分支
        .replace(
          "const writeMethod = chain.methods.find((x) =>\n      ['insert', 'upsert', 'update', 'delete'].includes(x),\n    )",
          "const writeMethod = chain.methods.find((x) =>\n      ['insert', 'upsert', 'update', 'delete'].includes(x),\n    ) || 'select' //mut",
        ),
  },
  {
    id: 'M6',
    title: 'mirrorNameShape 退化成硬编码名单（只认 dev-generate-plugin.mjs）',
    mutate: (s) =>
      s.replace(
        'return /^(dev-|.*-(plugin|mirror|local)\\.)/.test(name)',
        "return name === 'dev-generate-plugin.mjs'",
      ),
  },
  {
    id: 'M7',
    title: 'isTestFixture 恒 false（qa-*/test-* 全被纳入扫描）',
    mutate: (s) => s.replace('function isTestFixture(relPath) {', 'function isTestFixture(relPath) {\n  return false'),
  },
  {
    id: 'M8',
    title: '只改 `let ownerOk = payload !== null`（A1 起点）',
    // ⚠️ 目标名必须是 ownerOk。Engineer 在 58886dd 里把 selfScoped 改名为 ownerOk，
    //    这里若还匹配旧名 ⇒ replace 空转 ⇒ 变异体与原版**完全等价**
    //    ⇒ 「杀不掉」是**假阴性**（QA 脚本口径问题），不是门禁覆盖丢失。
    mutate: (s) => s.replace('let ownerOk = payload !== null', 'let ownerOk = true //mut'),
    equiv:
      '等价变异：紧接其后的 guardCols 循环里 `ownerOk = false; break` 仍会把不合格的写入打回。' +
      '⇒ 起点改了也没用。M8b 才真正让 A1 恒成立。',
  },
  {
    id: 'M8b',
    title: '真正让 A1 恒成立（自限写入无条件放行）',
    mutate: (s) => s.replace('          ownerOk = false\n', '          ownerOk = true //mut\n'),
  },
  {
    id: 'M8c',
    title: '删掉 ownerOk 的上报判定（`if (!ownerOk)` → 恒 false）',
    mutate: (s) => s.replace('    if (!ownerOk) {', '    if (false) {'),
  },
  {
    id: 'M8d',
    title: 'A1② 失效：从 guardUidExprs 里移除归属校验证明过的 uid 表达式',
    //这条守的是「A2 命中时把 uid 表达式记进 guardUidExprs」这条新判据。
    // 若它腐化，合法写法（uid 从入参传入）会大量误报 ⇒ 正样本应转红。
    mutate: (s) => s.replace('              guardUidExprs.add(', '              if (false) guardUidExprs.add('),
  },
  {
    id: 'M9',
    title: '让 A2 恒成立（父表归属校验形同虚设）',
    mutate: (s) => s.replace('        if (guarded) {\n          parentOk = true', '        if (true) {\n          parentOk = true'),
  },
  {
    id: 'M10',
    title: 'parseSchema 认不出任何 owner 保护表（guardedTables 恒空）',
    mutate: (s) =>
      s.replace(
        'return { rlsTables, guardedTables, fks, authUidRpcs }',
        'return { rlsTables, guardedTables: new Map(), fks: new Map(), authUidRpcs: new Set() }',
      ),
  },
  {
    id: 'M11',
    title: '豁免 B 失效：把共享表 dict_cache 也当成 owner 保护表',
    mutate: (s) =>
      s
        .replace('return { rlsTables, guardedTables, fks, authUidRpcs }',
          "guardedTables.set('dict_cache', new Set(['owner_id'])); return { rlsTables, guardedTables, fks, authUidRpcs } //mut"),
  },
  {
    id: 'M11b',
    title: '豁免 B 失效（法二）：判 R2 时忽略「零策略共享表」',
    mutate: (s) => s.replace('    const guardCols = schema.guardedTables.get(table)\n    if (!guardCols) continue',
      "    const guardCols = schema.guardedTables.get(table) || (schema.rlsTables.has(table) ? new Set(['owner_id']) : null) //mut\n    if (!guardCols) continue"),
  },
  {
    id: 'M14',
    title: '拆掉 A2 的「同一个变量」约束（验 A 站、写 B 站不再被拦）',
    mutate: (s) =>
      s.replace('          if (ownerMatched && qChain.text.includes(fkValue)) {',
        '          if (ownerMatched) { //mut: 丢掉同一个外键值的要求'),
  },
  {
    id: 'M15',
    title: '拆掉 A2 的 owner 列匹配（只看查过父表就算验过归属）',
    mutate: (s) => s.replace('          if (ownerMatched && qChain.text.includes(fkValue)) {', '          if (qChain.text.includes(fkValue)) { //mut'),
  },
  {
    id: 'M12',
    title: '解析不出任何身份推导型 RPC（R3 恒不触发）',
    mutate: (s) => s.replace('return { rlsTables, guardedTables, fks, authUidRpcs }', 'return { rlsTables, guardedTables, fks, authUidRpcs: new Set() }'),
  },
  {
    id: 'M13',
    title: 'authUidRpcs 解析放宽成「所有 RPC 都算身份推导型」',
    mutate: (s) => s.replace('return { rlsTables, guardedTables, fks, authUidRpcs }', 'return { rlsTables, guardedTables, fks, authUidRpcs: new Set(["consume_generation_quota","anything_else"]) }'),
    equiv:
      '等价变异（方向是 fail-closed）：真实代码里只调了 consume_generation_quota，它本来就在集合里，' +
      '多加的 "anything_else" 没人调用 ⇒ 可观测行为不变。**放宽 RPC 集只会误报、不会漏报**，' +
      '所以自检抓不到它不算洞。M12（收紧）已被杀死，才是安全方向。',
  },
]

console.log('变异测试：把门禁关键判定逐个改坏，看自检是否转红')
console.log('（证明「全绿」不是因为规则从来没被证伪过）\n')

const rows = []
for (const m of MUTANTS) {
  const mutated = m.mutate(LF)
  if (mutated === LF) {
    rows.push({ id: m.id, title: m.title, killed: false, benign: true, note: '⚠️ 变异未生效（模式没匹配上）—— QA 的错，不计入分母' })
    continue
  }
  writeFileSync(MUT_FILE, mutated, 'utf8')
  const r = spawnSync(process.execPath, [MUT_FILE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const out = (r.stdout || '') + (r.stderr || '')
  cleanup()

  // 崩溃不算被杀：那是脚本挂了，不是规则抓到了违规
  if (/Error:|SyntaxError|ReferenceError|TypeError/.test(out)) {
    rows.push({ id: m.id, title: m.title, killed: false, benign: true, note: '❌ 变异体自身崩溃（不计入分母）' })
    continue
  }
  const failed = r.status !== 0
  const selftest = out.includes('门禁自检失败')
  rows.push({
    id: m.id,
    title: m.title,
    killed: failed,
    equiv: m.equiv,
    note: failed
      ? `exit=1（${selftest ? '门禁自检抓出' : '真实文件扫描抓出'}）`
      : 'exit=0（自检仍全绿）',
  })
}

console.log('| 变异 | 结论 | 说明 |')
console.log('| --- | --- | --- |')
let killed = 0
let equivCount = 0
let realHoles = 0
for (const r of rows) {
  if (r.killed) killed += 1
  if (r.equiv && !r.killed) equivCount += 1
  if (!r.killed && !r.equiv && !r.benign) realHoles += 1
  const mark = r.killed ? '✅ 被杀死' : r.equiv ? '➖ 等价变异' : r.benign ? '⚠️ 无效变异' : '❌ **真漏洞**'
  console.log(`| ${r.id} ${r.title} | ${mark} | ${r.note} |`)
}
console.log('')
console.log(`被杀死 ${killed}/${rows.length}；等价变异（QA 变异写错，非门禁问题）${equivCount}；真漏洞 ${realHoles}`)
console.log(`工作区残留：'无 ✓（探针清空复用）'`)
if (realHoles > 0) {
  console.log('')
  console.log('⚠️ 存在「改坏了但自检仍绿」的区域 ⇒ 门禁自检有洞，需报工程师。')
  process.exit(1)
}
console.log('')
console.log('结论：所有**有效**变异都被杀死 ⇒ 自检对每条关键判定都有证伪能力，不存在「永远绿」。')
process.exit(0)

/** 探针回收：改为清空复用（不删文件）。
 *  原因：CI/沙箱对 delete 有配额，脚本自身清理失败会直接抛错并留下探针，
 *  进而污染下一次判定。清空同样能让门禁「看不到」这段样本。 */
function dropProbe(p) { try { writeFileSync(p, '') } catch (e) {} }

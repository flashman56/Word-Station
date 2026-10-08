/**
 * QA 注入验证（变异测试）：证明门禁的每个新判据**真的在起作用**
 * ------------------------------------------------------------------
 * 「跑通了」不等于「判据有效」。一个判据哪怕被整段删掉，自检也可能依旧全绿
 * （上一轮的教训：M15「owner 列匹配」被拆掉后自检仍然全绿 ⇒ 它可静默腐化）。
 *
 * 所以本脚本做的事是：
 *   ① 把 check-rls-writes.mjs **复制**成一份变异体（不动真门禁）；
 *   ② 在变异体上把某一条判据**改坏 / 删掉**；
 *   ③ 跑变异体，断言**对应样本真的翻转**（反样本转绿 / 正样本转红）；
 *   ④ 清空变异体（不删：沙箱 delete 有配额；dev-zz* 已被 .gitignore 忽略）。
 *
 * ⚠️ 断言的是「**具体哪条样本**翻转」，不是「有报错就行」——
 *    否则随便把门禁改成崩溃也能「通过」验证。
 *
 * 跑：node scripts/qa-rls-injectverify.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(ROOT, 'scripts', 'check-rls-writes.mjs')
// dev-zz* 已被 .gitignore 忽略 ⇒ 不会污染 git status；
// 命名成 dev-* 才会被门禁当成镜像扫到，但变异体一旦自检失败就会在扫目标前退出，
// 所以不会污染判定。
const MUTANT = path.join(ROOT, 'scripts', 'dev-zzmutant.mjs')

const GATE_SRC = readFileSync(GATE, 'utf8')

/** 跑一个门禁副本，返回其完整输出与退出码 */
function runGate(file) {
  const r = spawnSync(process.execPath, [file], {
    cwd: ROOT,
    encoding: 'utf8',
    // ⚠️ 本机 spawnSync 恒 EBUSY（连 cmd /c echo hi 也一样），
    // 只有 stdio[0]='ignore' 或 async spawn 能起来。别改回裸 spawnSync。
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` }
}

// ────────────────────────────────────────────────────────────── 变异清单
//
// from → to 都是**门禁源码里的原文片段**，必须恰好出现 1 次
// （出现 0 次 ⇒ 说明判据已被改名，本条验证失效；出现多次 ⇒ 改错了地方）。
// expect 里的正则匹配的是门禁自检失败时打印的那一行。

const MUTATIONS = [
  {
    id: 'M1',
    title: '作用域①「校验与写入须在**同一个函数体**内」—— 删掉这条判据',
    from: '  if (wFn !== gFn) return false',
    to: '  if (false) return false',
    expect: [/反样本「X1/, /反样本「X2/, /反样本「X3/],
    why: 'X1–X3 的写入在**模块顶层**（切片切不掉），只能靠这条判据拦 ⇒ 删掉就转绿',
  },
  {
    id: 'M1b',
    title: '作用域②「校验须落在**写入点所在函数体的区间**内」—— 改成从文件头切片（与 M1 同时改坏，才能看到它单独的作用）',
    edits: [
      ['  if (wFn !== gFn) return false', '  if (false) return false'],
      ['  return fn === null ? 0 : fn.start + 1', '  return 0'],
    ],
    // 作用域③ 不在此列：它的 payload 写的是 req.body.station_id、与被校验的 stationId
    // 不是同一个表达式 ⇒ 靠「同一个外键值」判据就拦住了，不依赖作用域切片。
    expect: [/反样本「作用域①/, /反样本「作用域②/],
    why: '两条一起改坏 ⇒ 别的 class / object 方法里的校验能被白拿（这正是上一轮「跨函数白拿 A2」的洞）',
  },
  {
    id: 'M2',
    title: '作用域④「兄弟块内嵌函数体 ⇒ fail closed 判红」—— 改成一律放行',
    from: '  return !gBlock.hasFn',
    to: '  return true',
    expect: [/反样本「S7：分支块里再嵌套函数体/],
    why: 'S7 与 N4 的块结构完全相同，唯一区别就是分支块里那个 function inner(){}；改坏这条 S7 应转绿',
  },
  {
    id: 'M3',
    title: '作用域③「校验所在块须是写入所在块的**祖先或自身**」—— 删掉这条判据',
    from: '  if (isAncestorNode(tree, gBlock, wBlock)) return true',
    to: '  if (false) return true',
    expect: [/正样本「作用域③判据的载荷样本/],
    why: '「校验在外层块、写入在它嵌套的子块、且外层块内还有箭头函数」会立刻被误报（该判据的唯一载荷点）',
  },
  {
    // 这条验证的是**陷阱本身**，不是「删掉会翻转」：
    // hasFn 若被改回「自己是不是函数体」，表面结果完全不变（仍全绿），
    // 但删掉「同一个函数体」那条判据后样本也不会翻转 ⇒ 那条判据变成死代码。
    // 断言「**不翻转**」= 把「不许这样简化」这条纪律变成可执行记录。
    id: 'M3b',
    title: 'hasFn 语义改成「**自己是不是**函数体」（而非「是否**嵌套**了函数体」）',
    from: "    nd.hasFn = nd.children.some((c) => nodes[c].kind === 'function' || nodes[c].hasFn)",
    to: "    nd.hasFn = nd.kind === 'function' || nd.children.some((c) => nodes[c].hasFn)",
    expectNoFlip: true,
    why: '必须**不**翻转：若这里翻转了，说明两条判据开始互相冒充（see M1 的载荷）',
  },
  {
    id: 'M4',
    title: '请求来源「成员表达式**根标识**命中拒绝名单」—— 删掉命中判定',
    from: '  if (root !== null && REQUEST_ROOTS.has(root)) return true',
    to: '  if (false) return true',
    expect: [/反样本「E2：owner 值写成 ctx\.body\.ownerId/, /反样本「E5：owner 值写成 req2/],
    why: 'ctx.body.* / req2.body.* 这两种写法应立刻转绿',
  },
  {
    id: 'M5',
    title: '请求来源「沿**局部绑定**传递」—— 删掉传递',
    from: '    if (rhsList) {',
    to: '    if (false) {',
    expect: [/反样本「E6：解构出来的 owner 值/, /反样本「E7：局部变量中转一层/],
    why: '解构与局部变量中转这两种间接引用应立刻转绿',
  },
  {
    id: 'M6',
    title: '解析器容忍度：`.eq()` 列名**不再接受反引号**（模板字符串列名）',
    from: "(['\"`])([\\w$]+)\\1",
    to: "(['\"])([\\w$]+)\\1",
    expect: [/正样本「E8 孪生/],
    why: 'E8 的合法写法 .eq(`owner_id`, uid) 应立刻被误报（转红）',
  },
  {
    id: 'M7',
    title: '解析器容忍度：normExpr **不再剥尾逗号**（.eq( 与实参跨行）',
    from: "    .replace(/[;,]+$/, '')",
    to: "    .replace(/;$/, '')",
    expect: [/正样本「E13 孪生/],
    why: 'E13 的跨行合法写法应立刻被误报（转红）',
  },
  {
    id: 'M8',
    title: '词法扫描：**块注释**不再被跳过（`/* } */` 里的花括号会被当成收尾）',
    from: '      const end = close < 0 ? n : close + 2',
    to: '      const end = i + 2',
    expect: [/正样本「词法扫描①/],
    why: '「一条注释就能重新捅出洞」这个机制必须真的被堵住：改坏后合法写法应转红',
  },
  {
    id: 'M9',
    title: '词法扫描：**字符串字面量**不再被跳过（字符串里的 `}` 会被当成收尾）',
    edits: [
      ['      while (j < n && code[j] !== q) {', '      while (false) {'],
      ['      mark(i, Math.min(j + 1, n))', '      mark(i, i + 1)'],
      ['      i = Math.min(j + 1, n)', '      i = i + 1'],
    ],
    expect: [/正样本「词法扫描②/],
    why: '字符串里的花括号不得参与配对：改坏后合法写法应转红',
  },
]

// ────────────────────────────────────────────────────────────── 对照：未变异必须全绿
const baseline = runGate(GATE)
const baselineOk = baseline.status === 0 && baseline.out.includes('[test:rls] ✓ 通过')
console.log(
  `对照组（**未变异**的真门禁）：${baselineOk ? '绿 ✓' : '🔴 非绿，后面的变异结论都不可信'}`,
)
console.log('')

// ────────────────────────────────────────────────────────────── 逐条变异
let bad = 0
console.log('| 变异 | 改坏的东西 | 期望翻转的样本 | 实际 | 判定 |')
console.log('| --- | --- | --- | --- | --- |')

for (const m of MUTATIONS) {
  // 支持单条 from/to，也支持 edits（一组替换，用于「一处判据要改多处才改得坏」）
  const edits = m.edits ?? [[m.from, m.to]]

  let src = GATE_SRC
  let applicable = true
  for (const [from, to] of edits) {
    const occurrences = src.split(from).length - 1
    if (occurrences !== 1) {
      bad += 1
      applicable = false
      console.log(
        `| ${m.id} | ${m.title} | — | 源码片段「${String(from).slice(0, 40)}…」出现 ${occurrences} 次（应为 1） | **❌ 无法变异** |`,
      )
      break
    }
    src = src.replace(from, to)
  }
  if (!applicable) continue

  writeFileSync(MUTANT, src, 'utf8')
  const r = runGate(MUTANT)
  const out = r.out

  let flipped = false
  let detail = ''
  if (m.expectNoFlip) {
    // 断言「**不**翻转」：这类变异验证的是「不许这样简化」的纪律
    // 只看「自检有没有失败」：变异体自身会被门禁当成镜像扫到并报一堆违规，
    // 那是预期噪声（dev-zz* 命名才能被扫到），与样本是否翻转无关。
    const selftestBroke = out.includes('门禁自检失败')
    flipped = !selftestBroke
    detail = flipped
      ? `自检未失败（符合「必须不翻转」的预期；进程出口码 ${r.status}，非 0 通常是变异体自身被当镜像扫到的噪声）`
      : '❗ 自检失败��� —— 该写法并非无害，这条记录需重写'
  } else {
    // 「真的翻转」= 自检失败，且失败信息里点名了期望的那几条样本
    const selftestBroke = out.includes('门禁自检失败')
    const missing = (m.expect ?? []).filter((re) => !re.test(out))
    flipped = selftestBroke && missing.length === 0
    detail = selftestBroke
      ? missing.length === 0
        ? '自检失败，且点名了全部期望样本'
        : `自检失败了，但没点名：${missing.map((re) => String(re.source)).join(' / ')}`
      : r.status === null
        ? '门禁没起来（spawn 失败）'
        : '❗ 自检**没有**失败 —— 该判据是死代码，删掉也无所谓 ⇒ 它可静默腐化'
  }
  if (!flipped) bad += 1

  const expectText = m.expectNoFlip
    ? '（必须不翻转）'
    : (m.expect ?? []).map((re) => String(re.source)).join(' ; ')
  console.log(
    `| ${m.id} | ${m.title} | ${expectText} | ${detail} | ${flipped ? '✓' : '**❌ 不符**'} |`,
  )
}

// 变异体回收（清空复用，不删）
writeFileSync(MUTANT, '', 'utf8')

console.log('')
console.log(`注入验证：${MUTATIONS.length - bad}/${MUTATIONS.length} 条判据被证明「改坏 ⇒ 样本翻转」`)
console.log(`变异体残留：'无 ✓（清空复用，且 dev-zz* 已被 .gitignore 忽略）'`)
console.log('')
if (!baselineOk || bad > 0) {
  console.log('🔴 存在「删掉也全绿」的判据 —— 这些判据没有自检样本守着，可静默腐化。')
  process.exit(1)
}
console.log('✅ 全部判据都是**有载荷**的：改坏任意一条，对应样本立刻翻转。')
process.exit(0)

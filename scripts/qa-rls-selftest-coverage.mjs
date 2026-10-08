/**
 * QA 第三轮 · 自检样本覆盖度分析（不是绕过探针，是回答lead 的问题 4）
 * ------------------------------------------------------------------
 * 问题：工程师自报第一版 depth 语义写反 ⇒「只收集到最内层块、外层函数体进不了候选」
 *      ⇒ index.ts 的合法写法被误报。请核实：
 *   (a) 这个 bug 现在真的修好了吗？   —— 由 qa-rls-bypass4 的 F2 回答（真入口，绿）
 *   (b) 自检里有多少条样本能覆盖「外层函数体」这个形态？—— 本脚本来答
 *
 * 「外层函数体」形态的严格定义（我要找的是这个）：
 *   写入在某个函数体 F 里，而 F 的内部**还嵌着另一个块** B，
 *   且**归属校验位于 B 之前、F 之内** ⇒ 反向扫描必须越过 B 才能拿到 F。
 *   判别式：若实现只取最内层块且不外扩，则校验会被切掉 ⇒ 误报。
 *
 * 本脚本**只读源码做覆盖度统计**，不跑门禁、不注入 —— 它回答的是
 * "自检里有没有这条形态的样本"，而不是"门禁判得对不对"。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(path.join(ROOT, 'scripts', 'check-rls-writes.mjs'), 'utf8')

/** 取出某个自检数组的原始文本 */
function block(name) {
  const i = src.indexOf(`const ${name} = [`)
  if (i < 0) return ''
  const j = src.indexOf('\n]\n', i)
  return src.slice(i, j === -1 ? src.length : j)
}

/** 把样本数组切成 [{label, code, expect}] */
function parse(name, expectKind) {
  const b = block(name)
  const out = []
  for (const chunk of b.split('\n  [\n').slice(1)) {
    const labelM = chunk.match(/^\s*'((?:[^'\\]|\\.)*)'/)
    // 闭合反引号后面跟的是 `,`（最后一个元素则是 `\n  ],`），不是紧跟换行
    const codeM = chunk.match(/\n\s*`([\s\S]*?)`\s*(?:,|$)/m)
    const expectM = chunk.match(/\{\s*rule:\s*'(\w+)',\s*text:\s*'([^']*)'\s*\}/)
    out.push({
      label: labelM ? labelM[1] : '(未命名)',
      code: codeM ? codeM[1] : '',
      expect: expectKind === 'bad' ? (expectM ? `${expectM[1]}@${expectM[2]}` : '?') : expectKind === 'gap' ? 'green' : 'green',
    })
  }
  return out
}

/**
 * 形态判定：写入在函数体 F 内，F 内有嵌套块 B，校验在 B 之前。
 * 用「写入所在行之前、函数体内、是否存在一个已闭合的嵌套块」来近似：
 * 若函数体开头有 `{`，之后又出现 `{`…`}`，且写入在那个 `}` 之后 ⇒ 命中该形态。
 */
function hasOuterFnWithInnerBlock(code) {
  // 找写入位置（最后一次station_words 写入）
  const w = code.lastIndexOf('.upsert(')
  if (w < 0) return false
  const before = code.slice(0, w)
  // 校验必须在写入之前
  const g = before.lastIndexOf(".eq('owner_id'")
  if (g < 0) return false
  // 从校验位置往后到写入之间，是否有闭合的嵌套块（有 '}' 出现）
  const between = code.slice(g, w)
  return between.includes('}')
}

const sets = [
  ['SELFTEST_GOOD', 'good', '必须零违规（合法写法）'],
  ['SELFTEST_BAD', 'bad', '必须被拦（越权/绕过）'],
  ['SELFTEST_KNOWN_GAP', 'gap', '断言当前判绿（已知边界）'],
]

console.log('【自检样本对「外层函数体 + 内层嵌套块」形态的覆盖度】')
console.log('判别式：写入之前存在归属校验，且两者之间有已闭合的嵌套块')
console.log('（这种形态下，���向扫描必须能向外扩张越过内层块才拿得到外层函数体）')
console.log('')
let totalCover = 0
for (const [name, kind, desc] of sets) {
  const items = parse(name, kind)
  const hits = items.filter((x) => hasOuterFnWithInnerBlock(x.code))
  totalCover += hits.length
  console.log(`${name}（${desc}）共 ${items.length} 条，命中该形态 ${hits.length} 条`)
  for (const h of hits) console.log(`    ✓ ${h.label}`)
  console.log('')
}

console.log(`合计：${totalCover} 条样本能覆盖「外层函数体」形态。`)
console.log('')

// 附带一个更有价值的统计：自检里「函数体内写入」的样本分布
console.log('【附带统计：各集合里"写入被包在函数体内"的样本数】')
for (const [name, kind] of sets) {
  const items = parse(name, kind)
  const inFn = items.filter((x) => /\n\s*(export\s+)?(async\s+)?function\s/.test(x.code) || /=>/.test(x.code))
  console.log(`  ${name}: ${inFn.length}/${items.length}`)
}
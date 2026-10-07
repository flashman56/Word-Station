/**
 * GAP-A（QA 发现）：drain 在「结构损坏 → 真丢弃」分支里跳过了一条草稿
 * ------------------------------------------------------------------
 * 跑：node scripts/qa2-bug-drain-skip.mjs
 *
 * 根因（src/lib/cloud/offline.js:478与 482）：
 *   `queue.splice(i, 1)` 已经把后面的元素左移到了 i，
 *   紧接着又执行 `i += 1` → 下一个元素被整个跳过。
 *
 *   两条分支的处理方式不对称：
 *     - park 分支（472）：`queue[i] = {...}` 不改变length → `i += 1` 正确；
 *     - skip 分支（478）：`queue.splice(i, 1)` 改变 length → 不该再`i += 1`。
 *
 * 后果：**排在一条结构损坏草稿之后的那一条，本轮不会被推送。**
 *   注意它是「本轮」而不是「永远」：下一轮 drain 时那条还在队列里，所以
 *   反复 drain 最终能推上去。但单轮 drain 的契约是「逐条走完队列」，
 *   首页登录时那一次 drain 就很可能漏掉它 —— 而那恰好是用户最期望
 *   「离线期间的进度补上」的时刻。
 *
 * 本脚本用最小 fixture 复现，并给出「修好之后应当是什么结果」的对照。
 *
 * ── 现状：已修复，本脚本是「修复前红、修复后绿」的 repro ──────────
 *   修法：`drain()` 里每个分支自己决定要不要推进 `i` ——
 *     - `splice(i, 1)`（真丢弃 / 推成功）→ length 变了，**不**推进；
 *     - 原地改写（park）→ length 未变，**必须**推进，否则死循环重访同一条。
 *
 *   判别力由断言 2（第一轮 attempted 含 w.good1 + w.good2）与断言 3
 *   （第二轮 second 为空，即「第一轮就走完、不留尾巴」）**合起来**提供。
 *
 *   ★ 断言 3 原本是「第二轮补推 w.good1」——那是**对 bug 的取证**，
 *     与断言 2 逻辑互斥、永远无法转绿（推理见该处注释）。现已转为
 *     前瞻性契约断言。取证价值没有丢：bug 的复现记录与「注入 bug 验证」
 *     的过程都留在提交历史与评审记录里。
 */
import assert from 'node:assert/strict'

function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    has: (k) => map.has(k),
    keys: () => [...map.keys()],
  }
}
globalThis.localStorage = fakeStorage()

const { drain, enqueue, readDrafts, pendingCount } = await import('../src/lib/cloud/offline.js')

const UID = 'uid-x'
let pass = 0
let fail = 0
function ok(c, m) {
  if (c) {
    pass += 1
    console.log(`  PASS  ${m}`)
  } else {
    fail += 1
    console.error(`  FAIL  ${m}`)
  }
}

console.log('[qa2:bug-drain-skip] drain 在真丢弃分支后跳过一条草稿\n')

// 队列：[0]= 结构损坏的草稿（rows 不是数组）  [1] 正常草稿  [2] 正常草稿
enqueue('learn', { ownerId: UID, queuedAt: '', rows: 'BROKEN' }, UID)
enqueue('learn', { ownerId: UID, queuedAt: '', rows: [{ wordKey: 'w.good1', record: { status: 'review' } }] }, UID)
enqueue('learn', { ownerId: UID, queuedAt: '', rows: [{ wordKey: 'w.good2', record: { status: 'review' } }] }, UID)

const attempted = []
const res = await drain({
  scope: UID,
  uid: UID,
  force: true,
  push: async (kind, item) => {
    attempted.push(item.rows[0].wordKey)
    return { ok: true, error: null }
  },
})

console.log(`  · drain 尝试推送：${JSON.stringify(attempted)}`)
console.log(`  · drain 返回：pushed=${res.pushed} discarded=${res.discarded}`)
console.log(`  · 队列剩余：${JSON.stringify((readDrafts(UID).learn || []).map((i) => (i.rows && i.rows[0] && i.rows[0].wordKey) || 'BROKEN'))}\n`)

// 断言 1：损坏的那条确实被真丢弃（这部分实现是对的）
ok(res.discarded === 1, `结构损坏那条被真丢弃（实际 ${res.discarded}）`)

// 断言 2：两条正常草稿本轮都应该被推 —— 这条现在是红的
ok(
  attempted.length === 2,
  `★ 排在损坏草稿之后的两条本轮都应被推送（实际只推了 ${attempted.length} 条：${JSON.stringify(attempted)}）`,
)
ok(attempted.includes('w.good1'), `★ w.good1 被推送（实际：${attempted.join(',') || '无'}）`)
ok(attempted.includes('w.good2'), `★ w.good2 被推送（实际：${attempted.join(',') || '无'}）`)
ok(res.pushed === 2, `drain 报 pushed=2（实际 ${res.pushed}）`)
ok(pendingCount(UID) === 0, `队列清空（实际还剩 ${pendingCount(UID)} 条）`)

// 断言 3：**第一轮就该推完，不给第二轮留尾巴**
//
// ── 它原本是什么 ──────────────────────────────────────────────
// 原文是「第二轮 drain 能把漏掉的那条推上去」，断言
// `second.length === 1 && second[0] === 'w.good1'`。那是**对 bug 存在时的取证**
// —— 它用来界定严重程度：数据没丢、只是「本轮漏推」，下一轮会补上。
//
// ── 为什么必须换掉，而不能留着 ──────────────────────────────────
// 它与断言 2（`attempted.length === 2`）**逻辑互斥**，两者不可能同时成立：
//   断言 2 过 ⇒ 第一轮推完 2 条 ⇒ 第二轮无事可做 ⇒ second === [] ⇒ 断言 3 失败
//   断言 3 过 ⇒ 第一轮漏推 ⇒ attempted.length < 2 ⇒ 断言 2 失败
// 而断言 2 才是钉住修复的那一条。于是修好之后断言 3 必然变红 —— 一个**永远
// 无法转绿**的断言，让这个 repro 失去了区分能力：它分不出「修好的实现」和
// 「有 bug 的实现」。repro 的价值全在区分能力上，所以这条必须转成规格断言。
//
// ── 现在的语义 ────────────────────────────────────────────────
// 保留它背后的真实关切（「单轮 drain 必须走完队列」），但表述为**前瞻性契约**：
// 修好的实现第一轮就推完了，第二轮不该再有任何东西可推。
//
// 判别力由断言 2 + 断言 3 **合起来**提供，缺一不可：
//   - 有 bug：第一轮只推 w.good2 → 断言 2 失败（且断言 3 失败，因为第二轮确有尾巴）
//   - 修好  ：第一轮两条都推       → 断言 2 过、断言 3 过
const second = []
await drain({ scope: UID, uid: UID, force: true, push: async (k, item) => { second.push(item.rows[0].wordKey); return { ok: true, error: null } } })
ok(
  second.length === 0,
  `★ 第一轮已推完，第二轮不该再有任何尾巴（实际又推了 ${JSON.stringify(second)}）—— 单轮 drain 必须走完队列`,
)
ok(pendingCount(UID) === 0, `两轮之后队列确实清空（实际还剩 ${pendingCount(UID)} 条）`)

console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
if (fail > 0) {
  console.error(
    '\n★ 这说明 drain 的游标契约又被破坏了（不是测试写错）。判别依据：' +
      '\n  断言 2 失败 → 第一轮漏推了 → 真丢弃分支在 splice 之后又推进了 i；' +
      '\n  断言 3 失败 → 第一轮没走完队列就给第二轮留了尾巴。' +
      '\n  修法：drain() 里 splice(i,1) 之后**不**推进 i；原地改写（park）才推进。' +
      '\n  （改前请先读循环上方那段「游标契约」注释。）',
  )
}
process.exit(fail === 0 ? 0 : 1)

void assert
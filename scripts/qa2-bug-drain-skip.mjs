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

// 断言 3：第二轮 drain 能把漏掉的那条推上去 → 说明是「本轮漏推」而非「永久卡死」
//（这一条是绿的，它界定了 bug 的严重程度：数据没丢，但单轮 drain 的「逐条走完」
//  契约被破坏，且首页登录那一次 drain 恰恰最可能就是唯一一次 drain。）
const second = []
await drain({ scope: UID, uid: UID, force: true, push: async (k, item) => { second.push(item.rows[0].wordKey); return { ok: true, error: null } } })
ok(
  second.length === 1 && second[0] === 'w.good1',
  `对照：第二轮确实补推了本轮漏掉的 w.good1（实际 ${JSON.stringify(second)}）→ 是「单轮漏推」，数据没丢`,
)
ok(pendingCount(UID) === 0, `两轮之后队列确实清空（实际还剩 ${pendingCount(UID)} 条）`)

console.log(`\n---------- PASS=${pass}  FAIL=${fail} ----------`)
if (fail > 0) {
  console.error(
    '\n★ 这是 SOURCE BUG（不是测试写错）：offline.js 的 drain 在 queue.splice(i,1) 之后又i += 1，' +
      '导致其后一条草稿本轮被跳过。修法：skip 分支里去掉 i += 1（或改成 i 不动）。',
  )
}
process.exit(fail === 0 ? 0 : 1)

void assert
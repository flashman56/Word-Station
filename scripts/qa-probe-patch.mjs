/**
 * 探针：`localStorage.setItem` patch 实例 vs patch 原型 —— 哪个真的生效？
 * 跑：node scripts/qa-probe-patch.mjs
 *
 * 目的：QA 的 A-12 测试必须建立在**实测**结论上，不能靠"听说"。
 * 结论：必须 patch Storage.prototype。
 */
import { JSDOM } from 'jsdom'

function fresh() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://qa.test/' })
  return dom
}

// ---------------------------------------------------------------- 结构事实
const domA = fresh()
const ls = domA.window.localStorage
console.log('=== 结构事实（jsdom 30） ===')
console.log('constructor                 :', ls.constructor.name)
console.log('own setItem?                :', Object.prototype.hasOwnProperty.call(ls, 'setItem'))
console.log('setItem 实际来自            :', (() => {
  let o = ls
  while (o && !Object.prototype.hasOwnProperty.call(o, 'setItem')) o = Object.getPrototypeOf(o)
  return o === ls ? '实例自身' : `${o.constructor.name}.prototype`
})())

// ---------------------------------------------------------------- 实验 1：patch 实例
console.log('\n=== 实验 1：patch 实例（localStorage.setItem = fn） ===')
{
  const d = fresh()
  const store = d.window.localStorage
  let instCalls = 0
  store.setItem = function patched() {
    instCalls += 1
    const e = new Error('quota from instance patch')
    e.name = 'QuotaExceededError'
    throw e
  }
  // 确认赋值确实落在某处
  console.log('赋值后 own setItem?         :', Object.prototype.hasOwnProperty.call(store, 'setItem'))
  console.log('赋值后 setItem === patched? :', store.setItem.name === 'patched')
  let threw = false
  try {
    store.setItem('k', 'v')
  } catch (e) {
    threw = e.name === 'QuotaExceededError'
  }
  console.log('patched 被调用次数          :', instCalls)
  console.log('写盘真的抛 QuotaExceededError:', threw)
  console.log('结论                        :', threw ? '实例 patch **生效**' : '实例 patch **无效**（赋值被 Proxy 吞掉）')
  console.log('副作用：值真的写进去了吗      :', store.getItem('k') === 'v' ? '是（所以是"静默失效"）' : '否')
  d.window.close()
}

// ---------------------------------------------------------------- 实验 2：patch 原型
console.log('\n=== 实验 2：patch 原型（Storage.prototype.setItem = fn） ===')
{
  const d = fresh()
  const store = d.window.localStorage
  const proto = d.window.Storage.prototype
  const real = proto.setItem
  let protoCalls = 0
  proto.setItem = function patched() {
    protoCalls += 1
    const e = new Error('quota from proto patch')
    e.name = 'QuotaExceededError'
    throw e
  }
  let threw = false
  try {
    store.setItem('k', 'v')
  } catch (e) {
    threw = e.name === 'QuotaExceededError'
  }
  console.log('patched 被调用次数          :', protoCalls)
  console.log('写盘真的抛 QuotaExceededError:', threw)
  console.log('结论                        :', threw ? '原型 patch **生效** ✓' : '原型 patch **无效**')
  proto.setItem = real
  d.window.close()
}

// ---------------------------------------------------------------- 实验 3：源码路径
console.log('\n=== 实验 3：migrate.js 的 writeJSON 走哪条路 ===')
{
  const d = fresh()
  globalThis.localStorage = d.window.localStorage
  globalThis.window = d.window
  const migrate = await import('../src/lib/migrate.js')
  const proto = d.window.Storage.prototype
  const real = proto.setItem
  let calls = 0
  proto.setItem = function patched(k, v) {
    calls += 1
    return real.call(this, k, v)
  }
  migrate.writeLearn({ 'w.1': { status: 'known' } }, 'qa-scope')
  console.log('writeLearn 触发的 setItem 次数:', calls, calls > 0 ? '→ 走的是原型链，原型 patch 可拦截 ✓' : '→ 未拦截')
  proto.setItem = real
  d.window.close()
}

process.exit(0)

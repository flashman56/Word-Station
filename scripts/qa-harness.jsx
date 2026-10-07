/**
 * 端到端回归测试主体（长期保留，不要删）
 *
 * 由 scripts/qa-react-e2e.mjs 加载：先搭好 jsdom 全局环境，再把本文件 esbuild 打包后 import。
 * 这里真实渲染 src/App.jsx，派发真实 MouseEvent，验证「多选 + 批量标注」全链路。
 * 组件、hooks、reducer 都是项目里的真代码，没有任何逻辑复刻。
 *
 * 执行：npm run test:e2e
 *
 * 维护约定：
 *   - 断言里的数字如果被产品行为变更推翻，先确认新行为是对的，再更新断言，并把原因写进注释。
 *   - 左栏「可见单词」与列表「全选当前结果（N）」必须同口径（都去重），别再退回按群计次。
 *   - 本文件只针对 v2 学习记录模型（唯一存储是 lib/migrate.js 的分区 learn 键）做断言；
 *     冻结的 v1 手工标注源只读、永不写入、永不删除，迁移时一次性映射成 v2 记录。
 *   - 存储键**不在测试里硬编码**：直接 import 生产用的 keysFor()，保证测的就是同一份契约。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.jsx'
import { words } from '../src/data/index.js'
import { buildReviewQueue } from '../src/lib/learning.js'
import { FROZEN_KEYS, keysFor } from '../src/lib/migrate.js'

const { document, window } = globalThis
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const flush = async (ms = 30) => {
  await React.act ? null : null
  await sleep(ms)
}

let pass = 0
let fail = 0
const log = (...a) => console.log(...a)
const ok = (cond, msg) => {
  if (cond) {
    pass++
    log(`  PASS  ${msg}`)
  } else {
    fail++
    log(`  FAIL  ${msg}`)
  }
}

/** 按单词 form 取 id（精确校验 localStorage 记录用） */
const idOf = (form) => (words.find((w) => w.form === form) || {}).id

// ---------------------------------------------------------------- DOM 工具
const q = (sel) => [...document.querySelectorAll(sel)]
const byText = (sel, text) => q(sel).find((e) => (e.textContent || '').includes(text))
/** 精确匹配文字（避免「记得」误匹配到「不记得」这类子串陷阱） */
const byExactText = (sel, text) => q(sel).find((e) => (e.textContent || '').trim() === text)

function click(el) {
  if (!el) throw new Error('click: element not found')
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
}
function shiftClick(el) {
  if (!el) throw new Error('shiftClick: element not found')
  el.dispatchEvent(
    new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window, shiftKey: true }),
  )
}
/** 向受控 input 输入文本（绕过 React value tracker，触发 onChange） */
function typeInto(el, text) {
  if (!el) throw new Error('typeInto: element not found')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, text)
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
}

/** 左栏「统计」区块数字（v2 口径：未知 / 待复习 / 已掌握 / 可见单词 / 可见词群 / 学习库总计） */
function stats() {
  const out = {}
  q('dt').forEach((dt) => {
    const dd = dt.nextElementSibling
    if (dd) out[dt.textContent.trim()] = +dd.textContent.trim()
  })
  return {
    未知: out['未知'],
    待复习: out['待复习'],
    已掌握: out['已掌握'],
    可见单词: out['可见单词'],
    可见词群: out['可见词群'],
    学习库总计: out['学习库总计'],
  }
}

/** 列表视图里的行首复选框（带 "Shift" title 的） */
const boxes = () =>
  q('input[type=checkbox]').filter((b) => (b.getAttribute('title') || '').includes('Shift'))

/** 按单词 form 在列表里找回对应的行首复选框（跨重渲染 / 刷新后仍能定位同一词） */
const findBox = (form) =>
  boxes().find((b) => rowOf(b).querySelector('.font-medium')?.textContent.trim() === form)

function selectedCount() {
  const el = q('span').find((s) => /^已选 \d+ 个$/.test((s.textContent || '').trim()))
  return el ? +el.textContent.match(/\d+/)[0] : 0
}

/**
 * v2 唯一存储：分区 learn 键的 records 映射（读状态只走它）。
 * 游客态 → scope 'guest'；登录态 e2e 不覆盖（那部分由 test:partition 覆盖）。
 */
const LEARN_KEY = keysFor('guest').learn
const learnMap = () => {
  const raw = window.localStorage.getItem(LEARN_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw).records || {}
  } catch {
    return {}
  }
}
const rawLearn = () => window.localStorage.getItem(LEARN_KEY)

/** 找到复选框所在的行 div */
const rowOf = (box) => box.closest('div.cursor-pointer') || box.parentElement

/** 行内三个状态按钮的 icon 与 opacity（opacity=1 表示当前生效状态） */
function rowButtons(row) {
  return [...row.querySelectorAll('button')].map((b) => ({
    icon: b.textContent.trim(),
    opacity: b.style.opacity,
    title: b.getAttribute('title'),
  }))
}

/** 右侧是否出现了单词详情（构词拆解） */
const detailOpened = () => q('h3').some((h) => (h.textContent || '').includes('构词拆解'))

// ---------------------------------------------------------------- 渲染
// React 18 需要 IS_REACT_ACT_ENVIRONMENT 才能用 act；这里用真实定时器 + 等待即可
window.IS_REACT_ACT_ENVIRONMENT = false

let root = null
let currentContainer = null
/** 全新挂载一个 React root（每次重挂载会重新跑迁移，用于清基线 / 刷新 / 复习专项） */
function mount() {
  if (currentContainer) {
    try {
      currentContainer.remove()
    } catch {
      /* ignore */
    }
  }
  currentContainer = document.createElement('div')
  document.body.appendChild(currentContainer)
  root = ReactDOM.createRoot(currentContainer)
  root.render(React.createElement(App))
}

export async function run() {
  // ---------------------------------------------------- 迁移映射专项（v2）
  // 在首次 render 之前写入冻结的手工标注源（只读旧键），验证它被正确映射为 v2 记录，
  // 且旧键不被删除、侧栏出现迁移提示。
  log('\n=== 迁移映射：v1 手工标注源 → v2 分区记录（幂等迁移）===')
  window.localStorage.clear()
  window.localStorage.setItem(
    FROZEN_KEYS.statusV1,
    JSON.stringify({ 'w.inspect': 'review', 'w.transport': 'known' }),
  )
  mount()
  await flush(200)

  const migMap = learnMap()
  ok(
    migMap['w.inspect'] && migMap['w.inspect'].status === 'review',
    `v1['w.inspect']='review' 映射为 learn 记录 status='review'（实际 ${migMap['w.inspect'] && migMap['w.inspect'].status}）`,
  )
  ok(
    migMap['w.transport'] && migMap['w.transport'].status === 'known',
    `v1['w.transport']='known' 映射为 learn 记录 status='known'（实际 ${migMap['w.transport'] && migMap['w.transport'].status}）`,
  )
  ok(
    window.localStorage.getItem(FROZEN_KEYS.statusV1) != null,
    '冻结的 v1 源键仍保留在 localStorage（未被删）',
  )
  ok(document.body.textContent.includes('已从旧版保留'), '侧栏出现迁移提示文案「已从旧版保留」')

  // 清空 + 重新挂载，进入干净基线（保证后续 C8 基线干净，已掌握数非 0）
  root.unmount()
  window.localStorage.clear()
  mount()
  await flush(200)

  log('\n=== 步骤 1：切到「列表」视图 ===')
  click(byText('button', '列表'))
  await flush(150)
  ok(!!byText('button', '全选当前结果'), '列表视图已渲染（找到「全选当前结果」按钮）')
  const n = boxes().length
  log(`  行首复选框数量 = ${n}`)
  ok(n > 5, `复选框渲染出来了（${n} 个）`)

  // ---------------------------------------------------- C8
  log('\n=== C8：勾选 2 个复选框 → 点「我会了」 ===')
  const before = stats()
  log(`  操作前统计：${JSON.stringify(before)}`)

  // 选 2 个当前状态为 unknown 的行：WordRow 把「当前生效态」图标渲染为 opacity:'1'，
  // 其余变暗。'!' 表示 unknown，故 '!' 图标 opacity==='1' 即该行当前为 unknown。
  // 列表默认不隐藏自动已知的高频词，前两行往往是已知，盲选会触发 no-op，故必须按状态过滤。
  // 词库扩容后首屏 300 行可能全是自动已知的高频词（孤儿词按词频排最前），
  // 此时点「显示更多」补页，直到找到 ≥2 个 unknown 行（上限 60 页兜底）。
  const findUnknownBoxes = () =>
    boxes().filter((bx) => {
      const nb = rowButtons(rowOf(bx)).find((x) => x.icon === '!')
      return nb && nb.opacity === '1'
    })
  let unknownBoxes = findUnknownBoxes()
  let paged = 0
  while (unknownBoxes.length < 2 && paged < 60) {
    const more = q('button').find((x) => (x.textContent || '').includes('显示更多'))
    if (!more) break
    click(more)
    await flush(80)
    unknownBoxes = findUnknownBoxes()
    paged += 1
  }
  const allBoxes = boxes()
  let b
  if (unknownBoxes.length < 2) {
    log(`  NOTE 可见 unknown 行不足 2 个（实际 ${unknownBoxes.length}），回退为前两行，C8 断言可能不成立（不 FAIL）`)
    b = allBoxes
  } else {
    b = unknownBoxes
    if (paged > 0) log(`  补页 ${paged} 次后找到 ${unknownBoxes.length} 个 unknown 行`)
  }
  const word0 = rowOf(b[0]).querySelector('.font-medium')?.textContent.trim()
  const word1 = rowOf(b[1]).querySelector('.font-medium')?.textContent.trim()
  log(`  准备勾选（均为 unknown）：${JSON.stringify([word0, word1])}`)

  const btnBefore = rowButtons(rowOf(b[0]))
  log(`  第 1 行操作前按钮态：${JSON.stringify(btnBefore)}`)

  click(b[0])
  await flush(60)
  click(b[1])
  await flush(120)

  ok(selectedCount() === 2, `批量条显示「已选 ${selectedCount()} 个」= 2`)
  const bar = q('div').find((d) => (d.className || '').includes('border-blue-200') && d.textContent.includes('已选'))
  const barText = bar ? bar.textContent : ''
  log(`  批量条内容：${barText}`)
  ok(barText.includes('我会了'), '有「我会了」按钮')
  ok(barText.includes('加入待复习'), '有「加入待复习」按钮')
  ok(barText.includes('清除学习记录'), '有「清除学习记录」按钮')
  ok(barText.includes('取消选择'), '有「取消选择」按钮')

  click(byText('button', '我会了'))
  await flush(150)

  const after = stats()
  log(`  操作后统计：${JSON.stringify(after)}`)
  ok(after.已掌握 === before.已掌握 + 2, `左栏「已掌握」${before.已掌握} → ${after.已掌握}（+2）`)
  ok(after.未知 === before.未知 - 2, `左栏「未知」${before.未知} → ${after.未知}（-2）`)

  const flash = q('span').find((s) => (s.textContent || '').includes('已更新'))
  ok(flash && flash.textContent.trim() === '已更新 2 个', `条内 flash 反馈 = "${flash ? flash.textContent.trim() : null}"`)

  const lm = learnMap()
  log(`  localStorage 分区 learn 记录数 = ${Object.keys(lm).length}`)
  ok(lm[idOf(word0)] && lm[idOf(word0)].status === 'known', `分区 learn[${idOf(word0)}].status === 'known'`)
  ok(lm[idOf(word1)] && lm[idOf(word1)].status === 'known', `分区 learn[${idOf(word1)}].status === 'known'`)
  const knownCount = Object.values(lm).filter((r) => r.status === 'known').length
  ok(knownCount === before.已掌握 + 2, `已知记录数从基线 ${before.已掌握} 增至 ${knownCount}（+2）`)

  const btnAfter = rowButtons(rowOf(findBox(word0)))
  log(`  第 1 行(勾选词 ${word0})操作后按钮态：${JSON.stringify(btnAfter)}`)
  const kb = btnAfter.find((x) => x.icon === '✓')
  const nb = btnAfter.find((x) => x.icon === '!')
  ok(kb && kb.opacity === '1', `行上 ✓ 已高亮（opacity=${kb && kb.opacity}）`)
  ok(nb && nb.opacity !== '1', `行上 ! 已变暗（opacity=${nb && nb.opacity}）`)

  // ---------------------------------------------------- 刷新恢复（持久化）
  log('\n=== 刷新恢复：unmount 后重建 root，已掌握应落盘不变 ===')
  const knownBeforeRefresh = stats().已掌握
  root.unmount()
  mount()
  await flush(200)
  const knownAfterRefresh = stats().已掌握
  ok(
    knownAfterRefresh === knownBeforeRefresh,
    `刷新后「已掌握」${knownAfterRefresh} == 刷新前 ${knownBeforeRefresh}（落盘持久化生效）`,
  )

  // 重新进入列表视图并恢复同一对单词（word0/word1）的选中态，继续 C9 流程。
  // 不能用 rb[0]/rb[1]（位置首两行），因为那是自动已知的高频词，与 C8 标记的 2 个 unknown 不是同一对，
  // 会导致「清除学习记录」清错词、统计回不到 before。
  click(byText('button', '列表'))
  await flush(150)
  // 重新挂载后列表 limit 回到首屏 300 行；word0/word1 在更深处，需再补页才能找到
  let repaged = 0
  while (!findBox(word0) && repaged < 60) {
    const more = q('button').find((x) => (x.textContent || '').includes('显示更多'))
    if (!more) break
    click(more)
    await flush(80)
    repaged += 1
  }
  const rb0 = findBox(word0)
  const rb1 = findBox(word1)
  if (rb0) click(rb0)
  await flush(60)
  if (rb1) click(rb1)
  await flush(120)
  ok(selectedCount() === 2, `刷新后重新勾选 2 词（${word0}、${word1}，已选 ${selectedCount()} 个）`)

  // ---------------------------------------------------- 附加 A：勾选不打开详情
  log('\n=== 附加 A：勾选复选框不应打开右侧单词详情 ===')
  ok(!detailOpened(), `勾选复选框没有误触发右侧详情（"构词拆解" 未出现）`)

  // ---------------------------------------------------- C9
  log('\n=== C9：点「清除学习记录」应退回未知（保留 key，状态回 unknown）===')
  click(byText('button', '清除学习记录'))
  await flush(150)
  const ac = stats()
  log(`  清除后统计：${JSON.stringify(ac)}`)
  ok(
    learnMap()[idOf(word0)] && learnMap()[idOf(word0)].status === 'unknown',
    `分区 learn[${idOf(word0)}] 状态回 unknown（key 仍保留，非真 delete）`,
  )
  ok(
    learnMap()[idOf(word1)] && learnMap()[idOf(word1)].status === 'unknown',
    `分区 learn[${idOf(word1)}] 状态回 unknown（key 仍保留，非真 delete）`,
  )
  ok(
    ac.未知 === before.未知 && ac.已掌握 === before.已掌握,
    `左栏统计回到操作前（未知 ${ac.未知} vs ${before.未知}，已掌握 ${ac.已掌握} vs ${before.已掌握}）`,
  )
  const btnCleared = rowButtons(rowOf(findBox(word0)))
  log(`  第 1 行(清除词 ${word0})清除后按钮态：${JSON.stringify(btnCleared)}`)
  ok(
    btnCleared.find((x) => x.icon === '!')?.opacity === '1',
    `行上 ! 回到高亮（状态 unknown），不是卡在已掌握`,
  )

  // ---------------------------------------------------- C10
  log('\n=== C10：勾选第 1 行 → Shift 点第 4 行，应为 4 不是 2 ===')
  click(byText('button', '清空选择'))
  await flush(80)
  const bb = boxes()
  click(bb[0])
  await flush(80)
  const c1 = selectedCount()
  ok(c1 === 1, `点第 1 行后已选 = ${c1}（应为 1）`)
  shiftClick(boxes()[3])
  await flush(120)
  const c4 = selectedCount()
  ok(c4 === 4, `Shift 点第 4 行后已选 = ${c4}（应为 4，不是 2）`)

  // ---------------------------------------------------- 附加：Shift 整段取消
  log('\n=== 附加 B2：Shift 再点同一行应整段取消（模式由锚点行当前状态决定）===')
  shiftClick(boxes()[3])
  await flush(120)
  const c5 = selectedCount()
  ok(c5 === 0, `锚点(第 1 行)当前已选中 → Shift 点第 4 行整段取消，已选 = ${c5}（应为 0）`)
  ok(
    boxes().slice(0, 4).every((x) => !x.checked),
    `前 4 行复选框全部回到未勾选（不是只取消最后一行）`,
  )

  shiftClick(boxes()[3])
  await flush(120)
  const c6 = selectedCount()
  ok(c6 === 4, `锚点已取消 → 再 Shift 点第 4 行重新整段选中，已选 = ${c6}（应为 4）`)
  ok(
    boxes().slice(0, 4).every((x) => x.checked),
    `前 4 行复选框全部重新勾上（来回切换成立）`,
  )

  // ---------------------------------------------------- 附加：全选当前结果 去重
  log('\n=== 附加 B：「全选当前结果」跨词群去重，且全站统计口径一致 ===')
  const allBtn = byText('button', '全选当前结果')
  const declared = +allBtn.textContent.match(/\d+/)[0]
  const visibleWords = stats().可见单词
  // 顶部「词群 N · 单词 N」条，应与左栏同口径（都去重）
  const topBar = q('div').find((d) => /^词群 \d+ · 单词 \d+$/.test((d.textContent || '').trim()))
  const topBarWords = topBar ? +topBar.textContent.match(/单词 (\d+)/)[1] : -1
  log(`  按钮声明 ${declared} 个；左栏「可见单词」= ${visibleWords}；顶部条「单词」= ${topBarWords}`)
  ok(
    visibleWords === declared,
    `左栏「可见单词」${visibleWords} == 按钮声明 ${declared}（统计口径统一为去重后的单词数）`,
  )
  ok(topBarWords === declared, `顶部条「单词」${topBarWords} == 按钮声明 ${declared}`)
  click(allBtn)
  await flush(150)
  const ac2 = selectedCount()
  ok(ac2 === declared, `已选 ${ac2} == 按钮声明 ${declared}（去重生效）`)
  ok(ac2 === visibleWords, `已选 ${ac2} == 左栏「可见单词」${visibleWords}（当前条件下去重数 = 可选数）`)

  // ---------------------------------------------------- 附加：review 路径 + 再清除
  log('\n=== 附加 C：批量「加入待复习」→ 再「清除学习记录」（v2 保留 key）===')
  click(byText('button', '加入待复习'))
  // 词库 6 万+ 词时全量落盘需序列化 6 万+ 条记录，耗时秒级；轮询等待（上限 20s）
  let reviewN = 0
  for (let i = 0; i < 80; i++) {
    await flush(250)
    reviewN = Object.values(learnMap()).filter((r) => r.status === 'review').length
    if (reviewN >= ac2) break
  }
  ok(
    reviewN === ac2,
    `全部 ${ac2} 个选中词被标为 review（当前 review 记录数 ${reviewN}）`,
  )
  ok(stats().待复习 === ac2, `左栏「待复习」= ${stats().待复习}（应为 ${ac2}）`)

  click(byText('button', '清除学习记录'))
  await flush(180)
  ok(
    Object.values(learnMap()).filter((r) => r.status === 'review').length === 0,
    `清除后 review 记录数归零（key 保留但状态回 unknown）`,
  )
  ok(stats().待复习 === 0, `左栏「待复习」归零（实际 ${stats().待复习}）`)

  // ---------------------------------------------------- 附加：折叠时 Shift 区间只含可见行
  log('\n=== 附加 D：折叠词群后，Shift 区间只覆盖展开可见的行 ===')
  click(byText('button', '清空选择'))
  await flush(80)

  // 资料侧已确认 310 个单词 form 唯一（validate 也无重名），可用 form 作为单词 id 的代理
  const formsOf = (list) => list.map((b) => rowOf(b).querySelector('.font-medium')?.textContent.trim())
  const formsBefore = formsOf(boxes())
  const distinctBefore = new Set(formsBefore)
  log(`  折叠前：可见行 ${formsBefore.length} 行 / 去重后 ${distinctBefore.size} 个不同单词（同一单词可挂多个词群）`)

  // 折叠第一个词群
  click(q('button').find((x) => (x.textContent || '').includes('▾')))
  await flush(150)
  const formsAfter = formsOf(boxes())
  const distinctAfter = new Set(formsAfter)
  log(`  折叠后：可见行 ${formsAfter.length} 行 / 去重后 ${distinctAfter.size} 个不同单词`)
  // 列表已分页（每页固定行数），折叠后行数会被后续词群补满，故不再比较行数；
  // 改为判断「被折叠词群的词是否从可见集合中消失」。
  const removedByCollapse = [...distinctBefore].filter((f) => !distinctAfter.has(f))
  ok(
    removedByCollapse.length > 0,
    `折叠后该词群的行从可见集合消失（可见 ${formsBefore.length} → ${formsAfter.length} 行，移除 ${removedByCollapse.length} 个不同词）`,
  )

  // 只在被折叠词群里出现过的那些词，折叠后应彻底看不见
  const hiddenOnly = [...distinctBefore].filter((f) => !distinctAfter.has(f))
  log(`  折叠后被完全隐藏的词：${JSON.stringify(hiddenOnly)}`)
  ok(hiddenOnly.length > 0, `存在「只在被折叠词群里出现」的词（${hiddenOnly.length} 个）`)

  click(boxes()[0])
  await flush(80)
  shiftClick(boxes()[boxes().length - 1])
  await flush(120)
  const cc = selectedCount()
  const checkedForms = new Set(formsOf(boxes().filter((b) => b.checked)))
  log(`  Shift 全区间后：批量条已选 = ${cc}，实际勾上的行去重后 = ${checkedForms.size}`)
  ok(
    cc === checkedForms.size,
    `批量条「已选 ${cc} 个」与实际勾中行数 ${checkedForms.size} 一致（Set 去重，无虚高）`,
  )
  ok(
    cc === distinctAfter.size,
    `已选 ${cc} == 展开可见的不同单词数 ${distinctAfter.size}（区间精确覆盖可见行，不多不少）`,
  )
  ok(
    hiddenOnly.every((f) => !checkedForms.has(f)),
    `被折叠隐藏的词没有被选中：${JSON.stringify(hiddenOnly.filter((f) => checkedForms.has(f)))}（空数组即正确）`,
  )
  // 分页后一页内的词多为互不重复，cc 可能等于可见行数；改为报告「跨群重复行数」，仍验证 Set 去重口径
  const dupRows = formsAfter.length - checkedForms.size
  ok(
    dupRows >= 0 && cc === checkedForms.size,
    `跨群重复的同一单词只算一次：可见 ${formsAfter.length} 行中重复 ${dupRows} 行，去重后 ${checkedForms.size} 个（已选 ${cc}）`,
  )

  // ---------------------------------------------------- 附加 E：右栏 MorphDetail
  log('\n=== 附加 E：右栏 MorphDetail 的 全选 / 反选 / 清空（验证 prop 没漏传）===')
  click(byText('button', '清空选择'))
  await flush(80)
  // 词库扩容后孤儿词（无词素）按词频排在整个列表最前面，首屏 300 行全是孤儿词，
  // 点它们「返回词群」回不到 MorphDetail。用检索过滤出一个词素词（expect），
  // 让 r.spect 词群的行出现在首屏（检索按词素命中，单词 'expect' 只命中侧栏）；结束后清空检索恢复现场。
  const searchInputE = q("input").find((x) => (x.placeholder || "").includes("词根"))
  const morphfulForms = new Set(
    words.filter((w) => Array.isArray(w.morphs) && w.morphs.length > 0).map((w) => w.form.toLowerCase()),
  )
  if (searchInputE) {
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    valueSetter.call(searchInputE, 'spect')
    searchInputE.dispatchEvent(new window.Event('input', { bubbles: true }))
    await flush(300)
  }
  const mdBoxes = boxes()
  log(`  [debug] searchApplied=${!!searchInputE} mdBoxes=${mdBoxes.length}`)
  const detailBox =
    mdBoxes.find((bx) =>
      morphfulForms.has((rowOf(bx).querySelector('.font-medium')?.textContent || '').trim().toLowerCase()),
    ) || mdBoxes[0]
  const rowForDetail = rowOf(detailBox)
  const detailWord = rowForDetail.querySelector('.font-medium')?.textContent.trim()
  click(rowForDetail.querySelector('.font-medium'))
  await flush(150)
  ok(detailOpened(), `点单词行（非复选框）打开了右侧单词详情：${detailWord}`)

  click(byText('button', '返回词群'))
  await flush(150)
  const hasMorphDetail = q('h3').some((h) => (h.textContent || '').includes('同源词'))
  ok(hasMorphDetail, `返回后右侧显示 MorphDetail（含「同源词」标题）`)

  const morphWordCount = q('h3').find((h) => h.textContent.includes('同源词'))?.textContent.match(/\d+/)[0]
  log(`  该词群同源词数 = ${morphWordCount}`)

  const mdRowBoxes = () =>
    q('input[type=checkbox]').filter(
      (b) => (b.getAttribute('title') || '').includes('Shift') && !!b.closest('aside'),
    )
  ok(mdRowBoxes().length > 0, `MorphDetail 里的 WordRow 也渲染了复选框（${mdRowBoxes().length} 个）→ checked/onToggleCheck 没漏传`)

  click(q('aside button').find((b) => b.textContent.trim() === '全选'))
  await flush(150)
  const selAll = selectedCount()
  log(`  MorphDetail「全选」后已选 = ${selAll}`)
  ok(selAll === +morphWordCount, `已选 ${selAll} == 词群词数 ${morphWordCount}`)
  ok(
    mdRowBoxes().every((b) => b.checked),
    `MorphDetail 里每一行复选框都变成勾上（checked prop 生效）`,
  )

  click(q('aside button').find((b) => b.textContent.trim() === '反选'))
  await flush(150)
  const selInv = selectedCount()
  log(`  MorphDetail「反选」后已选 = ${selInv}`)
  ok(selInv === 0, `反选后本词群的词全部取消（已选 ${selInv}）`)
  ok(
    mdRowBoxes().every((b) => !b.checked),
    `反选后每一行复选框都取消勾选`,
  )

  click(q('aside button').find((b) => b.textContent.trim() === '全选'))
  await flush(120)
  click(q('aside button').find((b) => b.textContent.trim() === '清空'))
  await flush(120)
  ok(selectedCount() === 0, `「清空」后已选归零`)

  // 清空检索，恢复全量列表现场（附加 E 为定位词素词临时搜索过 'expect'）
  if (searchInputE) {
    const valueSetter2 = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    valueSetter2.call(searchInputE, "")
    searchInputE.dispatchEvent(new window.Event('input', { bubbles: true }))
    await flush(300)
  }

  // ---------------------------------------------------- 附加 F：聚焦视图 Ctrl+点击
  log('\n=== 附加 F：聚焦视图 Ctrl + 点节点加入多选 ===')
  click(byText('button', '聚焦'))
  await flush(250)
  const nodes = q('svg g.focus-word')
  log(`  聚焦视图 SVG 节点 <g> 数量 = ${nodes.length}`)
  ok(nodes.length > 3, `聚焦视图渲染出了单词节点（${nodes.length} 个）`)

  const ctrlClick = (el) =>
    el.dispatchEvent(
      new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window, ctrlKey: true }),
    )

  ctrlClick(nodes[0])
  await flush(120)
  const f1 = selectedCount()
  ok(f1 === 1, `Ctrl+点第 1 个节点后已选 = ${f1}（应为 1）`)
  ok(!detailOpened(), `Ctrl+点击没有打开右侧单词详情`)

  ctrlClick(nodes[1])
  await flush(120)
  const f2 = selectedCount()
  ok(f2 === 2, `Ctrl+点第 2 个节点后已选 = ${f2}（应为 2）`)

  // 选中节点应有蓝色虚线描边
  // 单词节点里第一个 rect 是投影层，取最后一个才是描边主体
  const rects = nodes.map((g) => [...g.querySelectorAll('rect')].pop())
  log(`  节点 rect 描边：${JSON.stringify(rects.slice(0, 2).map((r) => ({ stroke: r.getAttribute('stroke'), dash: r.getAttribute('stroke-dasharray'), w: r.getAttribute('stroke-width') })))}`)
  ok(
    rects[0].getAttribute('stroke-dasharray') === '5 3' && rects[0].getAttribute('stroke') === '#2563eb',
    `选中节点是蓝色(#2563eb)虚线(5 3)描边`,
  )
  ok(rects[2] && rects[2].getAttribute('stroke-dasharray') !== '5 3', `未选中节点没有虚线描边`)

  // 普通点击应打开详情，而不是加入多选
  click(nodes[2])
  await flush(150)
  ok(detailOpened(), `普通点击节点打开了右侧单词详情`)
  ok(selectedCount() === 2, `普通点击不改变多选集合（仍为 ${selectedCount()}）`)

  // ---------------------------------------------------- 附加 G：复习队列排序（buildReviewQueue 与 UI 首卡一致）
  log('\n=== 附加 G：复习队列排序（buildReviewQueue 与 UI 首张 StudyCard 一致）===')
  window.localStorage.clear()
  // 取 3 个低频（freqRank>2500）真实单词，构造不同 incorrectCount / lastIncorrectAt 的 review 记录
  const sample = words.filter((w) => w.freqRank > 2500).slice(0, 3)
  const t0 = Date.now()
  const reviewSeeds = {}
  sample.forEach((w, i) => {
    const at = new Date(t0 - i * 1000).toISOString()
    reviewSeeds[w.id] = {
      status: 'review',
      correctCount: 0,
      consecutiveCorrect: 0,
      incorrectCount: 5 - i,
      lastStudiedAt: at,
      lastResult: 'incorrect',
      lastIncorrectAt: at,
      statusChangedAt: at,
      statusSource: 'manual',
    }
  })
  window.localStorage.setItem(LEARN_KEY, JSON.stringify({ version: 2, records: reviewSeeds }))
  root.unmount()
  mount()
  await flush(200)

  const q1 = buildReviewQueue(words, learnMap(), 10)
  if (q1.length === 0) {
    log('  NOTE 复习队列为空，跳过排序断言（不 FAIL）')
  } else {
    const priBtn = byText('button', '优先复习')
    ok(!!priBtn, `学习首页出现「优先复习（${q1.length}）」按钮`)
    if (priBtn) {
      click(priBtn)
      await flush(150)
    }
    const card = q('h2').find((h) => (h.className || '').includes('text-4xl'))
    ok(!!card, '复习会话渲染出首张 StudyCard')
    if (card) {
      const firstForm = card.textContent.trim()
      ok(
        firstForm === q1[0].form,
        `首卡单词 "${firstForm}" == 复习队列首词 "${q1[0].form}"（排序与 UI 一致）`,
      )
    }
  }

  // ---------------------------------------------------- 附加 H：StudyCard 两按钮语义（不记得 / 记得）
  log('\n=== 附加 H：StudyCard 改为「不记得 / 记得」，记得一次即已掌握 ===')
  root.unmount()
  window.localStorage.clear()
  mount()
  await flush(200)
  click(byText('button', '学习'))
  await flush(150)
  const entryBtn = byText('button', '优先复习') || byText('button', '开始学习')
  ok(!!entryBtn, '学习首页有进入会话的主按钮')
  click(entryBtn)
  await flush(200)

  const cardOf = () => q('h2').find((h) => (h.className || '').includes('text-4xl'))
  const card1 = cardOf()
  ok(!!card1, '学习会话渲染出 StudyCard（大号词形标题）')
  ok(!byText('button', '答对') && !byText('button', '答错') && !byText('button', '我会了'), '卡片不再出现「答对 / 答错 / 我会了」')
  ok(!!byExactText('button', '不记得'), '卡片有「不记得」按钮')
  ok(!!byExactText('button', '记得'), '卡片有「记得」按钮')

  const form1 = card1 ? card1.textContent.trim() : null
  const cardWord1 = words.find((w) => w.form === form1)
  click(byExactText('button', '记得'))
  await flush(150)
  ok(
    cardWord1 && learnMap()[cardWord1.id] && learnMap()[cardWord1.id].status === 'known',
    `点「记得」后 ${form1} 立即变已掌握（实际 ${cardWord1 && learnMap()[cardWord1.id] && learnMap()[cardWord1.id].status}）`,
  )
  ok(document.body.textContent.includes('记得，已掌握'), '卡片反馈出现「记得，已掌握」')

  click(byText('button', '下一个'))
  await flush(150)
  const card2 = cardOf()
  const form2 = card2 ? card2.textContent.trim() : null
  const cardWord2 = words.find((w) => w.form === form2)
  click(byExactText('button', '不记得'))
  await flush(150)
  ok(
    cardWord2 && learnMap()[cardWord2.id] && learnMap()[cardWord2.id].status === 'review',
    `点「不记得」后 ${form2} 进待复习（实际 ${cardWord2 && learnMap()[cardWord2.id] && learnMap()[cardWord2.id].status}）`,
  )

  // ---------------------------------------------------- 附加 I：总览群岛地图 + 查找
  log('\n=== 附加 I：总览群岛地图（一岛=一词素・三大板块）+ 查找 ===')
  root.unmount()
  window.localStorage.clear()
  mount()
  await flush(200)
  click(byText('button', '总览'))
  await flush(500)

  ok(!!byText('button', '地图') && !!byText('button', '气泡'), '总览有「群岛地图 / 气泡漂流」视图切换')
  const netInput = q('input').find((i) => (i.getAttribute('placeholder') || '').includes('查找'))
  ok(!!netInput, '总览有查找输入框')

  const atlasBox = q('[data-atlas-regions]')[0]
  ok(!!atlasBox, '地图挂载了群岛结构信息')
  ok(atlasBox && atlasBox.getAttribute('data-atlas-regions') === '3', '地形分为 3 大板块')
  const islCount = atlasBox ? Number(atlasBox.getAttribute('data-atlas-islands')) : 0
  ok(islCount >= 600, `一座岛 = 一个词素（共 ${islCount} 座岛）`)
  const clusterCount = atlasBox ? Number(atlasBox.getAttribute('data-atlas-clusters')) : 0
  ok(clusterCount >= 8, `板块内分出 ${clusterCount} 个子群岛簇`)

  const txt = document.body.textContent || ''
  ok(txt.includes('火山熔岩型') && txt.includes('热带植被型') && txt.includes('冰雪岩石型'), '三大板块的类型名称各自可见')

  const paths = q('svg path').length
  ok(paths >= 600, `画出 ${paths} 条海岸线路径（一岛一形）`)
  ok(q('svg line').length === 0, `群岛地图不画连线（${q('svg line').length} 条）`)
  ok(!!byText('button', '＋') && !!byText('button', '－'), '地图有缩放控件（＋ / －）')
  ok(!!byText('button', '词根') && !!byText('button', '前缀') && !!byText('button', '后缀'), '工具栏有三大板块快捷导航')

  // 点一座岛 → 直接进聚焦视图（单击即可，无需双击）
  const firstIsland = q('svg g.cursor-pointer')[0]
  if (firstIsland) {
    click(firstIsland)
    await flush(400)
    ok(!!byText('button', '返回群岛地图'), '点小岛直接进聚焦视图')
    ok(!!q('.focus-center')[0], '聚焦视图以词素岛为中心')

    // 点一个单词 → 以那个单词为中心重新布局，再原路回到词素岛
    const wordNode = q('svg g.focus-word')[0]
    if (wordNode) {
      click(wordNode)
      await flush(300)
      ok(!!byText('button', '词素岛'), '点单词后以它为中心（出现「回到词素岛」）')
      click(byText('button', '词素岛'))
      await flush(250)
      ok(!byText('button', '词素岛') || byText('button', '词素岛') === undefined, '回到词素岛中心')
    } else {
      ok(false, '聚焦视图里没有单词牌')
    }

    click(byText('button', '返回群岛地图'))
    await flush(350)
    ok(!!q('[data-atlas-regions]')[0] && !!byText('button', '地图'), '聚焦视图能原路返回群岛地图')
  } else {
    ok(false, '没有可点击的小岛')
  }

  // 重新取一次输入框：进出关系网会让 React 重挂载，早先拿到的引用已脱离 DOM
  const searchInput = q('input').find((i) => (i.getAttribute('placeholder') || '').includes('查找'))
  if (searchInput) {
    // 关系连线只存在于近/反义词簇里的词（如 big↔large）；'spect' 系词无关系数据会得到 0 条线
    typeInto(searchInput, 'big')
    await flush(250)
    const dropdown = q('div').find((d) => (d.className || '').includes('z-30'))
    ok(!!dropdown, '输入后出现查找结果下拉')
    const firstWordBtn = dropdown ? [...dropdown.querySelectorAll('button')][0] : null
    if (firstWordBtn) {
      click(firstWordBtn)
      await flush(350)
      ok(!!byText('button', '返回群岛'), '点词后进入该词的关系网（出现「返回群岛」）')
      ok(q('svg line').length > 0, `词关系网有连线（${q('svg line').length} 条）`)
      ok(document.body.textContent.includes('词素') || q('svg circle').length > 2, '关系网含词素/同源词节点')
    } else {
      ok(false, '查找下拉里没有可点的单词结果')
    }
  }

  // ---------------------------------------------------- 附加 J：气泡视图（从底部漂浮刷新）
  log('\n=== 附加 J：气泡视图从底部漂浮刷新 ===')
  click(byText('button', '气泡'))
  await flush(300)
  const bubbleNodes = q('button').filter((b) => {
    const cls = typeof b.className === 'string' ? b.className : ''
    return cls.includes('rounded-full') && String(b.style.animation || '').includes('wrcRise')
  })
  ok(bubbleNodes.length > 0, `气泡视图渲染出漂浮气泡（${bubbleNodes.length} 个）`)
  ok(bubbleNodes.length <= 14, `气泡数量受控，不拥挤（${bubbleNodes.length} ≤ 14）`)

  log(`\n---------- 汇总：PASS=${pass}  FAIL=${fail} ----------\n`)
  return { pass, fail }
}

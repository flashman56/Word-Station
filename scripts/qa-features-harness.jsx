/**
 * scripts/qa-features-harness.jsx —— 三大新功能 E2E 主体（QA 独立编写）
 * ------------------------------------------------------------------
 * 由 scripts/qa-features-e2e.mjs 加载：先搭好 jsdom 全局环境（按模式注入 / 移除
 * 伪 speechSynthesis），再把本文件 esbuild 打包后 import 执行。
 * 这里**真实渲染** src/components 里的组件，派发真实 MouseEvent，不是逻辑复刻。
 *
 * 覆盖：
 *   (a) [with-speech] 点 SpeakerButton → speak 用 en-US voice（给定伪 voice 列表）
 *   (b) [no-speech]  speechSynthesis 缺失 → 按钮 disabled、不抛错
 *   (c) VocabCard：空记录显示「样本不足」，样本充足显示数字
 *   (d) EtymologyPanel：已知 id 走精编（「同源词」），未知 id 走组合（「同词素词」）
 *
 * 模式（由 runner 经 globalThis.__QA_MODE__ 传入）：'with-speech' | 'no-speech'
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import SpeakerButton from '../src/components/SpeakerButton.jsx'
import VocabCard from '../src/components/VocabCard.jsx'
import EtymologyPanel from '../src/components/EtymologyPanel.jsx'
import { estimateVocabulary } from '../src/lib/vocab.js'

const { document, window } = globalThis
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const flush = async (ms = 60) => {
  await sleep(ms)
}

let pass = 0
let fail = 0
const ok = (cond, msg) => {
  if (cond) {
    pass++
    console.log(`  PASS  ${msg}`)
  } else {
    fail++
    console.log(`  FAIL  ${msg}`)
  }
}

const containers = []

/** 挂载一个元素，返回 { container, unmount } */
function mount(el) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = ReactDOM.createRoot(container)
  root.render(el)
  containers.push(container)
  return {
    container,
    unmount: () => {
      try {
        root.unmount()
      } catch {
        /* ignore */
      }
    },
  }
}

function click(el) {
  if (!el) throw new Error('click: element not found')
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
}

const txt = (el) => (el && el.textContent) || ''

// ---------------------------------------------------------------- 构造测试数据
const EDGES = [0, 500, 1000, 2000, 3000, 5000, 8000, 12000, 20000, 30000, 45000, 64825]
function bandWords(bi, count) {
  const lo = EDGES[bi]
  const hi = EDGES[bi + 1]
  const out = []
  const span = hi - lo
  for (let i = 0; i < count; i += 1) {
    const rank = lo + 1 + Math.floor((span - 1) * (i / Math.max(1, count - 1)))
    out.push({ id: `e2e.b${bi}.${i}`, freqRank: Math.min(hi, rank) })
  }
  return out
}
const LIB = []
for (let bi = 0; bi < EDGES.length - 1; bi += 1) LIB.push(...bandWords(bi, 60))

/** 样本充足：30 条跨 2 档、全 known（band0 已知率高 → 有正估算） */
function enoughRecords() {
  const recs = {}
  bandWords(0, 20).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  bandWords(1, 15).forEach((w) => {
    recs[w.id] = { status: 'known', statusSource: 'learning' }
  })
  return recs
}

/** 组合叙述用词素（未知 id + words），用于「同词素词」标签 */
const COMPOSED_MORPH = {
  id: 'r.__qa_missing__',
  form: 'zzz',
  display: 'zzz-',
  gloss: 'QA 测试义',
  glossEn: 'qa-test',
  origin: 'latin',
  type: 'root',
  words: [
    { id: 'w.qa1', form: 'zazzy', gloss: '花哨的' },
    { id: 'w.qa2', form: 'zizzle', gloss: '嘶嘶声' },
  ],
}

const KNOWN_MORPH = { id: 'r.gen', origin: 'latin', form: 'gen', display: 'gen' }

// ---------------------------------------------------------------- 用例
export async function run(mode) {
  console.log(`\n=== 模式：${mode} ===`)

  // ------------------------------ (a) 发音：点击 → en-US voice
  if (mode === 'with-speech') {
    console.log('\n--- (a) SpeakerButton 用 en-US voice 朗读 ---')
    const spoken = window.__spoken || []
    const before = spoken.length
    const { container, unmount } = mount(React.createElement(SpeakerButton, { text: 'transport' }))
    await flush(60)
    const btn = container.querySelector('button')
    ok(!!btn, 'SpeakerButton 渲染出 button')
    click(btn)
    await flush(60)
    ok(spoken.length === before + 1, `点击一次 → speak 被调用一次（spoken ${before} → ${spoken.length}）`)
    const u = spoken[spoken.length - 1]
    if (u) {
      ok(u.text === 'transport', `朗读文本 = transport（实际 ${u.text}）`)
      ok(u.voice && u.voice.lang === 'en-US', `选中 en-US voice（实际 ${u.voice && u.voice.lang}）`)
      ok(u.lang === 'en-US', `utterance.lang = en-US（实际 ${u.lang}）`)
    } else {
      ok(false, '未捕获到 utterance')
    }

    // 再点同一词 = 停止（cancel 被调用，不新增 speak）
    const cancelsBefore = window.__cancels
    const spokenBefore = spoken.length
    click(btn)
    await flush(60)
    ok(window.__cancels > cancelsBefore, `再次点同一词 → 触发 cancel（停止朗读）`)
    ok(spoken.length === spokenBefore, `停止时不产生新的 speak（仍 ${spoken.length} 次）`)
    unmount()
  }

  // ------------------------------ (b) 无 speechSynthesis → 禁用且不抛错
  if (mode === 'no-speech') {
    console.log('\n--- (b) 无 speechSynthesis：按钮禁用、不抛错 ---')
    let threw = null
    let container = null
    try {
      const m = mount(React.createElement(SpeakerButton, { text: 'transport' }))
      container = m.container
      await flush(60)
    } catch (e) {
      threw = e
    }
    ok(!threw, `缺失 speechSynthesis 时挂载不抛错${threw ? '：' + threw.message : ''}`)
    const btn = container && container.querySelector('button')
    ok(!!btn, 'SpeakerButton 仍渲染出 button')
    ok(btn && btn.disabled === true, `按钮应 disabled（实际 ${btn && btn.disabled}）`)
    ok(
      btn && (btn.getAttribute('title') || '').includes('不支持'),
      `title 提示不支持（实际 ${btn && btn.getAttribute('title')}）`,
    )
    // 即便被强制点击也不应抛错
    let clickThrew = null
    try {
      click(btn)
      await flush(30)
    } catch (e) {
      clickThrew = e
    }
    ok(!clickThrew, `禁用态点击不抛错${clickThrew ? '：' + clickThrew.message : ''}`)
  }

  // ------------------------------ (c) VocabCard：样本不足 / 充足
  console.log('\n--- (c) VocabCard 样本不足 vs 充足 ---')
  {
    const empty = estimateVocabulary(LIB, {})
    const m1 = mount(React.createElement(VocabCard, { result: empty }))
    await flush(60)
    ok(txt(m1.container).includes('样本不足'), '空记录 → 显示「样本不足」')
    m1.unmount()

    const enough = estimateVocabulary(LIB, enoughRecords())
    const m2 = mount(React.createElement(VocabCard, { result: enough }))
    await flush(60)
    const t2 = txt(m2.container)
    ok(enough.sufficient === true, '（前置）充足样本 sufficient=true')
    ok(t2.includes('≈'), '样本充足 → 显示「≈」估算数字')
    ok(/\d/.test(t2), '样本充足 → 文本含数字')
    ok(!t2.includes('样本不足'), '样本充足时不再显示「样本不足」')
    m2.unmount()
  }

  // ------------------------------ (d) EtymologyPanel：精编 vs 组合
  console.log('\n--- (d) EtymologyPanel 精编 / 组合 ---')
  {
    // 精编：已知 id（r.gen）
    const m1 = mount(React.createElement(EtymologyPanel, { morph: KNOWN_MORPH, defaultOpen: true }))
    // 精编走动态 import，等久一点
    for (let i = 0; i < 12; i += 1) await flush(60)
    const t1 = txt(m1.container)
    ok(t1.includes('词源故事'), '面板标题「词源故事」可见')
    ok(t1.includes('精编'), '已知 id → 显示「精编」徽标')
    ok(t1.includes('同源词'), '精编条目 → 词标签为「同源词」')
    ok(!t1.includes('同词素词'), '精编条目不使用「同词素词」标签')
    m1.unmount()

    // 组合：未知 id（有 words）
    const m2 = mount(React.createElement(EtymologyPanel, { morph: COMPOSED_MORPH, defaultOpen: true }))
    for (let i = 0; i < 12; i += 1) await flush(60)
    const t2 = txt(m2.container)
    ok(t2.includes('组合叙述'), '未知 id → 显示「组合叙述」徽标')
    ok(t2.includes('同词素词'), '组合叙述 → 词标签为「同词素词」')
    ok(!t2.includes('同源词'), '组合叙述不使用「同源词」标签')
    m2.unmount()
  }

  console.log(`\n---------- [qa-features-e2e] 模式 ${mode}：PASS=${pass} FAIL=${fail} ----------\n`)
  return { pass, fail }
}

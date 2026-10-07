/**
 * dict.js 的测试替身（由 test-a01-words.mjs 通过 esbuild 插件注入）
 *
 * 为什么需要替身：AddWordsPanel 在模块顶层 import 了 isIndexReady / loadIndex /
 * lookupForms，而 ESM 的命名空间对象是冻结的 —— 测试**无法**在运行时给
 * `dict.isIndexReady` 赋值（严格模式下抛 TypeError）。而 A-01 的复现前提恰恰是
 * 「停在索引未就绪的那一帧」，所以必须能控制它。
 *
 * 所以这里用模块级可变状态 + 由测试驱动的 setter，而不是运行时打补丁。
 */

/**
 * 由测试控制的状态
 *
 * ⚠ `indexReady` 只是一个**开关**，但 A-01 的复现还需要面板**停留在**未就绪那一帧。
 *   所以 loadIndex 必须返回一个**由测试决定何时兑现**的 Promise：如果它立刻
 *   resolve，面板的 `loadIndex().then(() => setIndexReady(true))` 会立刻把
 *   indexReady 翻成 true —— 于是整段测试跑的根本不是「索引未就绪」路径，
 *   而且一行错都不会报。这是本文件最重要的一条纪律。
 */
const state = {
  indexReady: true,
  known: ['photosynthesis', 'quixotic'],
  /** 未兑现的 loadIndex resolver（测试调 __resolveIndex 兑现它） */
  pendingLoad: null,
}

export function __setIndexReady(v) {
  state.indexReady = Boolean(v)
}
export function __setKnownForms(list) {
  state.known = Array.isArray(list) ? list : []
}

/** 兑现挂起的 loadIndex（模拟「1.7MB 索引终于加载完」） */
export function __resolveIndex() {
  if (state.pendingLoad) {
    const r = state.pendingLoad
    state.pendingLoad = null
    r()
  }
}

export function isIndexReady() {
  return state.indexReady
}

/** ★ 挂起而不是立刻 resolve —— 见 state.pendingLoad 的注释 */
export function loadIndex() {
  return new Promise((resolve) => {
    state.pendingLoad = resolve
  })
}

export function indexSize() {
  return 0
}

/**
 * 假 lookup：**逐字复刻真 lookupForms 的三条去重/跳过规则**。
 *
 * ★ 为什么不能简化成「known 里算 hit，其余算 miss」★
 *   真的 lookupForms（src/lib/dict.js）有三条会让某个 form **既不进 hit 也不进 miss**
 *   的规则，于是它在 AddWordsPanel 里落成 kind:'unknown'（A-02 的「不可提交行」）：
 *     ① `if (!s || seen.has(s)) return` —— slug 去重。两个**不同 formKey** 可以
 *        共享同一个 slug（'hello-world' 与 'helloworld' 都 slug 成 'helloworld'），
 *        于是第二个既不命中也不待生成 → 变成 unknown 行。
 *        ★ 这条是「索引就绪但仍有不可提交行」的真实生产路径，不是理论构造 ——
 *          它同时也是 M1 那个判据问题的真实触发条件。
 *     ② 索引未就绪时全部算 miss（真实现里 indexCache 为 null 的分支）。
 *     ③ index.get(s) 未命中 → miss。
 *   早先的简化版把 ① 漏掉了，于是测试里 `unknown` 行**只可能**在索引未就绪时出现。
 *   后果：注入「canSubmit 去掉 indexReady」与「toggleAll 判据退回 rows.length」
 *   两处缺陷时，测试**依然全绿** —— 因为在那个简化世界里这两处缺陷恰好等价于
 *   正确实现。这正是「测了等于没测」的典型形态，靠人眼读断言是发现不了的。
 */
export function lookupForms(forms) {
  const hit = []
  const miss = []
  if (!state.indexReady) {
    // 真实现的 indexCache === null 分支：全部视为 miss
    ;(forms || []).forEach((form) => {
      miss.push({ form, formKey: String(form ?? '').trim().toLowerCase() })
    })
    return { hit, miss }
  }
  const seen = new Set()
  ;(forms || []).forEach((form) => {
    const s = slugOf(form)
    const formKey = String(form ?? '').trim().toLowerCase()
    // ★ 规则 ①：slug 去重 → 这个 form 被**丢弃**（不进 hit 也不进 miss）→ unknown 行
    if (!s || seen.has(s)) return
    seen.add(s)
    if (!state.known.includes(formKey)) {
      miss.push({ form, formKey })
      return
    }
    hit.push({ form, formKey, wordKey: `w.${s}`, cefr: 'B2', freqRank: 12000 })
  })
  return { hit, miss }
}

/** 与 lib/wordKey.js 的 slug 同口径（去变音符号 + 去非字母数字 + 小写） */
function slugOf(form) {
  return String(form ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export async function loadWords(wordKeys) {
  return (wordKeys || []).map((id) => ({ id, form: String(id).slice(2), morphs: [], chain: [] }))
}

export async function loadShard() {
  return []
}

export async function phoneticsOfAsync() {
  return null
}

export function __resetDictMemory() {}

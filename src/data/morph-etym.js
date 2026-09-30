/**
 * morph-etym.js —— 精编词源数据 { [morphId]: EtymEntry }
 * ------------------------------------------------------------------
 * ★ 本文件为「夜间生成任务」的产出目标（scripts/gen-etym.mjs），当前为占位空对象。
 * ★ 只允许通过 src/lib/etym.js 内的动态 import('../data/morph-etym.js') 加载；
 *    禁止任何其它文件静态 import —— 否则数据会进首屏 bundle。
 *
 * 条目结构（可选用例参考 docs/features-design.md C.3）：
 *   {
 *     origin: 'latin',            // 来源：latin|greek|germanic|old_english|french|other
 *     proto: '*spek-',            // 可选：原始（重构）形态
 *     protoGloss: '注视',          // 可选：原始形态释义
 *     pie: true,                  // proto 是否为 PIE 重构形（为真时 UI 标「重构形」）
 *     story: '……',                 // 一段词源叙述
 *     timeline: [ { era: '拉丁', text: '……' } ],
 *     cognates: [ { form: 'spectator', gloss: '观众', wordId: 'w.spectator' } ],
 *   }
 *
 * ★ 音标红线：本文件**禁止**出现任何音标字段（phonetic / phon / ipa …）。
 * ★ 键必须 ⊂ 现有词素 id（src/data/morphemes.js），由 scripts/validate-etym.mjs 校验。
 */
export default {}

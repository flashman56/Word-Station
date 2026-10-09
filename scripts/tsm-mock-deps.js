/**
 * StudyCard DOM 级测试的依赖替身（由 test-studycard-morphless.mjs 经 esbuild
 * onResolve 插件注入，勿直接运行）。
 * ------------------------------------------------------------------
 * 本文件同时替换 StudyCard 依赖的三个**真模块**：
 *   - src/lib/dict.js            （StudyCard 只用 phoneticsOfAsync；真实现会 fetch
 *                                 音标分片并碰 IndexedDB，jsdom 里不该真发请求）
 *   - src/hooks/useSpeech.js     （jsdom 无 speechSynthesis；替身让朗读链路惰性）
 *   - src/lib/usageSupplement.js （真实现同样 fetch 分片；替身直接返回 null →
 *                                 UsageSupplement 渲染 null，零网络）
 *
 * ★ 标记 __TSM_MOCK__ 供测试做「替身真的被打进 bundle」的前置自检 ★
 *   没有这个自检时，一个没生效的替换会让断言全部假绿（真模块照样能渲染）。
 *
 * ★ 为什么三个模块共用一个替身文件 ★
 *   esbuild 的 onResolve 把三个 import 都指向本文件，ESM 要求被替换模块导出的
 *   符号在本文件都存在。所以这里导出三者的**并集**（StudyCard/SpeakerButton
 *   真正用到的那几个），不做多余实现。
 */
export const __TSM_MOCK__ = 'tsm-mock-deps-v1'

// ★ 标记必须是**有副作用的顶层语句**才不会被 tree-shaking 丢掉 ★
//   单纯 `export const X = '...'` 若无人 import，esbuild 打包时会把声明摇掉，
//   于是「前置自检：替身在 bundle 里」会假红。挂到 globalThis 是副作用，会被保留。
if (typeof globalThis !== 'undefined') {
  globalThis.__TSM_MOCK_MARKER__ = 'tsm-mock-deps-v1'
}

// ---------------------------------------------------------------- dict.js
/** 音标查询替身：永远「查不到」（真实现会 fetch + IndexedDB）。 */
export async function phoneticsOfAsync() {
  return null
}

// ---------------------------------------------------------------- useSpeech.js
/** 语音合成替身：完全不支持 → 所有朗读路径惰性返回。 */
export function useSpeech() {
  return {
    supported: false,
    voicesReady: false,
    speaking: false,
    voiceLang: null,
    speak: () => {},
    cancel: () => {},
    stop: () => {},
  }
}
export default useSpeech

// ---------------------------------------------------------------- usageSupplement.js
/** 用法补充替身：永远无条目 → 组件渲染 null。 */
export async function getUsageSupplement() {
  return null
}

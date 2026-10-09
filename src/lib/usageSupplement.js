/**
 * 用法补充数据的懒加载封装。
 * ------------------------------------------------------------------
 * src/data/usage-extra.js 约 124KB，绝不能静态 import —— 否则会撑大主 chunk、
 * 拖慢首屏。这里按需动态加载，并把 import 的 Promise 缓存到模块级变量，
 * 使全应用只真正拉取一次（多个 UsageSupplement 实例共享同一份缓存）。
 *
 * 红线：本模块只承载「固定搭配 / 背景 / 用法」三类内容，
 *       绝不引入任何音标数据（音标永远来自 src/lib/dict.js 查表）。
 */

/**
 * 模块级缓存：首次调用时建立，之后所有调用复用同一个 Promise。
 * 这样即便 WordDetail 与 StudyCard 同时挂载，也只下载一次数据文件。
 * @type {Promise<{usageExtraOf?: Function}|null>|null}
 */
let importPromise = null

/**
 * 动态加载 usage-extra 模块；缓存 Promise，保证只加载一次。
 * 任何加载失败（文件缺失 / 被排除 / 网络错误）都静默降级为 null，
 * 绝不让上层组件崩溃。
 * @returns {Promise<{usageExtraOf?: Function}|null>}
 */
function loadUsageExtraModule() {
  if (!importPromise) {
    importPromise = import('../data/usage-extra.js')
      .then((mod) => mod || null)
      .catch((err) => {
        // 数据文件可能在某些构建中缺失；告警即可，不影响主流程
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(
            '[usageSupplement] usage-extra.js 加载失败，已跳过：',
            err && err.message ? err.message : err,
          )
        }
        return null
      })
  }
  return importPromise
}

/**
 * 按词形查询用法补充（固定搭配 / 背景 / 用法）。
 *
 * @param {string|undefined|null} form 词形（大小写不限，内部转小写查表）
 * @returns {Promise<{collocations: string[], background: string, usage: string}|null>}
 *   - 命中且有内容：{ collocations, background, usage }
 *   - 无条目 / 词形非法 / 模块缺失 / 加载失败：null
 *     调用方据此渲染 null，实现「无数据 = 不显示任何内容」的优雅降级。
 */
export async function getUsageSupplement(form) {
  if (!form || typeof form !== 'string') return null
  const mod = await loadUsageExtraModule()
  if (!mod || typeof mod.usageExtraOf !== 'function') return null
  let entry = null
  try {
    entry = mod.usageExtraOf(form)
  } catch {
    entry = null
  }
  if (!entry || typeof entry !== 'object') return null
  // usageExtraOf 已做归一化；这里再兜底一次，确保字段类型稳定。
  return {
    collocations: Array.isArray(entry.collocations) ? entry.collocations : [],
    background: typeof entry.background === 'string' ? entry.background : '',
    usage: typeof entry.usage === 'string' ? entry.usage : '',
  }
}

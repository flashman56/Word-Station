/**
 * placementStore.js —— 起点测评结果的持久化（**只经由 migrate.js 的分区访问器**）
 * ------------------------------------------------------------------
 * ★ 为什么这个文件里一个存储键名都没有 ★
 *   本应用的键命名空间只有一个来源：src/lib/migrate.js。业务代码传 `scope`
 *   （`scopeOf(ownerId)` 的结果）给 keysFor()，永不自己拼键、永不判断键。
 *   scripts/check-storage-keys.mjs（npm run test:keys，并入 test:cloud）会扫
 *   **含注释**的命名空间字面量，出现即失败 —— 所以「顺手在注释里写一下键名」
 *   同样会被拦。（本行的上一版把前缀原样写进了这段注释，于是 test:keys 直接变红：
 *   门禁连注释一起扫这件事是真的，不是文档里的传说。）这不是形式主义：键名知识
 *   一旦离开 migrate.js，改键名 / 加分区键时就必然漏改一处，
 *   而漏改的那一处要等用户换号才炸。
 *
 * ★ 为什么测评结果不写进 learn 记录 ★
 *   见 src/lib/placement.js 头部的说明：vocab.js 的证据判别式把任何
 *   `status:'known'` 的记录都当成**实测**证据。自评写进去会被读成
 *   「你认识全库 64,700 词」。所以这里是一个**独立于 learn 分区的键**：
 *   测评证据与实测学习证据，物理隔离。
 *
 * 载荷形状（整份替换，无浅合并 —— 见 writePlacement 注释）：
 *   { v: 1, at: ISO, probe: {items, bandIndexes, size}, answers: {id: 'known'|...} }
 */
import { readSettingsV2, scopeOf, writeSettingsV2 } from '../lib/migrate.js'

/** 载荷版本号 */
export const PLACEMENT_STORE_VERSION = 1

/** 载荷在 settings v2 里的字段名。设备级（与账号无关：它是「这台设备上的我」） */
export const PLACEMENT_FIELD = 'placementV1'

/**
 * 该字段是否形状可读。
 *
 * ★ 为什么要逐层校验而不是只判 typeof object ★
 *   localStorage 里的东西是**用户可编辑的**，且跨版本长期存在。少一层校验，
 *   一个手改过的 / 旧版的载荷就会让 scorePlacement 在渲染期抛错 —— 那正是
 *   「整页白屏」类故障的最短路径。实测过的两种坏载荷：
 *     `{placementV1: "abc"}`         → 字符串，v/probe 都不是对象
 *     `{placementV1: {v:1}}`         → 缺 probe / answers
 *   两者都必须退回「没测过」，而不是崩。
 *
 * @param {*} raw
 * @returns {boolean}
 */
export function isValidPlacement(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  if (raw.v !== PLACEMENT_STORE_VERSION) return false
  if (!raw.probe || typeof raw.probe !== 'object' || Array.isArray(raw.probe)) return false
  if (!Array.isArray(raw.probe.items)) return false
  if (!raw.answers || typeof raw.answers !== 'object' || Array.isArray(raw.answers)) return false
  return true
}

/**
 * 读当前 scope 的测评结果；没有 / 形状不对一律返回 null（当作没测过）。
 *
 * ★ 为什么按 scope 分区而不是设备级共享 ★
 *   家庭共用一台电脑时，A 的词汇量不该出现在 B 的界面上。分区键由
 *   `keysFor(scope)` 在 migrate.js 内部生成，本文件只负责传 scope。
 *
 * @param {string} [scope] scopeOf(ownerId) 的结果
 * @returns {{v:number, at:string|null, probe:object, answers:object}|null}
 */
export function readPlacement(scope) {
  const sc = scopeOf(scope)
  const settings = readSettingsV2()
  const raw = settings && typeof settings === 'object' ? settings[PLACEMENT_FIELD] : null
  if (!raw || typeof raw !== 'object') return null
  // 按 scope 存放：{ guest: payload, 'uid-A': payload, ... }
  const bucket = raw.byScope && typeof raw.byScope === 'object' ? raw.byScope[sc] : null
  return isValidPlacement(bucket) ? bucket : null
}

/**
 * 写当前 scope 的测评结果（整份替换该 scope 的那一份，其他 scope 原样保留）。
 *
 * ★ 为什么要「读 → 改 → 写」而不是浅合并 ★
 *   `writeSettingsV2` 是**整对象覆盖**（useSettings 也用它写难度档等）。
 *   若这里直接把 `{placementV1: payload}` 写进去，会把用户在设置页改过的
 *   难度档 / 词族开关一起抹掉。所以先读回整份、按 scope 槽位替换、再整份写回。
 *
 * @param {{items:Array, bandIndexes?:number[], size?:number}} probe 当时那份题目
 * @param {Record<string,string>} answers
 * @param {string} [scope]
 * @param {string} [at] ISO 时间（便于测试注入固定时钟）
 * @returns {boolean} 是否写成功
 */
export function writePlacement(probe, answers, scope, at) {
  if (!probe || typeof probe !== 'object' || !Array.isArray(probe.items)) return false
  const cleanAnswers = {}
  Object.keys(answers && typeof answers === 'object' ? answers : {}).forEach((k) => {
    cleanAnswers[k] = answers[k]
  })
  const payload = {
    v: PLACEMENT_STORE_VERSION,
    at: at || new Date().toISOString(),
    probe: {
      items: probe.items.map((it) => ({
        id: it.id,
        form: it.form,
        freqRank: it.freqRank,
        bandIndex: it.bandIndex,
      })),
      bandIndexes: Array.isArray(probe.bandIndexes) ? probe.bandIndexes.slice() : [],
      size: probe.items.length,
    },
    answers: cleanAnswers,
  }

  try {
    const sc = scopeOf(scope)
    const settings = readSettingsV2()
    const base = settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {}
    const existing =
      base[PLACEMENT_FIELD] && typeof base[PLACEMENT_FIELD] === 'object' && !Array.isArray(base[PLACEMENT_FIELD])
        ? base[PLACEMENT_FIELD]
        : {}
    const byScope =
      existing.byScope && typeof existing.byScope === 'object' && !Array.isArray(existing.byScope)
        ? existing.byScope
        : {}
    writeSettingsV2({ ...base, [PLACEMENT_FIELD]: { ...existing, byScope: { ...byScope, [sc]: payload } } })
    return true
  } catch {
    /* 隐私模式 / 配额用尽：内存态照常，测评结果这一轮不落盘 */
    return false
  }
}

/**
 * 清掉当前 scope 的测评结果（「重测」用）。不碰其他 scope，也不碰任何其他设置。
 *
 * @param {string} [scope]
 * @returns {boolean}
 */
export function clearPlacement(scope) {
  try {
    const sc = scopeOf(scope)
    const settings = readSettingsV2()
    const base = settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {}
    const existing =
      base[PLACEMENT_FIELD] && typeof base[PLACEMENT_FIELD] === 'object' && !Array.isArray(base[PLACEMENT_FIELD])
        ? base[PLACEMENT_FIELD]
        : {}
    const byScope =
      existing.byScope && typeof existing.byScope === 'object' && !Array.isArray(existing.byScope)
        ? existing.byScope
        : {}
    if (!(sc in byScope)) return true
    const next = { ...byScope }
    delete next[sc]
    writeSettingsV2({ ...base, [PLACEMENT_FIELD]: { ...existing, byScope: next } })
    return true
  } catch {
    return false
  }
}

export default { readPlacement, writePlacement, clearPlacement, isValidPlacement, PLACEMENT_FIELD }
/**
 * 过滤设置持久化（读写设备级 v2 设置，键约定见 lib/migrate.js）
 * ------------------------------------------------------------------
 * 从已废弃的 useStatus.js 抽出来：去掉对 src/data/index.js（28MB）的依赖，
 * 否则设置钩子会把整个词库拖进首屏 bundle。
 *
 * 首次读取顺序：默认值 → 旧 v1 设置（键由 migrate.js 托管，只读一次）→ v2 设置（后者覆盖前者）。
 *
 * ★ 本文件**只管设备级偏好**（难度档 / 词族成组 / 自动朗读 —— 它们与账号无关，
 *   跨账号共享是对的）。
 *   「高频词继承为已掌握」是**账号级**开关，已迁到分区 prefs 键，
 *   由 lib/migrate.js 的 readPrefs / writePrefs 负责；混进这里会让切账号时
 *   把上一个账号的策略带给下一个账号（scripts/check-storage-keys.mjs 的 R3 会拦）。
 *
 * ★ 本文件**不出现任何存储键名**：旧 v1 设置的读也走 migrate.js 的 readSettingsV1()
 *   出口 —— 这样「冻结键只在 migrate.js 内被命名」才是可被机器保证的不变量，
 *   而不是靠约定。
 */
import { useCallback, useState } from 'react'
import { readSettingsV1, readSettingsV2, writeSettingsV2 } from '../lib/migrate.js'
import { LEARN_STORE_VERSION } from '../lib/learning.js'

/**
 * @param {object} defaults 默认设置（含 learnBand / groupByFamily 等）
 * @returns {[object, (next: object | ((prev: object) => object)) => object]}
 */
export function useSettings(defaults) {
  const [settings, setSettings] = useState(() => ({
    ...defaults,
    ...readSettingsV1(),
    ...readSettingsV2(),
  }))

  // 同步写 v2（不用 useEffect，避免首帧把默认值覆盖刚迁移出的设置）
  const update = useCallback((next) => {
    setSettings((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      try {
        writeSettingsV2(value)
      } catch {
        /* 隐私模式写入失败忽略，内存态仍可用 */
      }
      return value
    })
  }, [])

  return [settings, update]
}

/** 当前学习记录结构版本（导出/导入用） */
export const SETTINGS_STORE_VERSION = LEARN_STORE_VERSION

export default useSettings
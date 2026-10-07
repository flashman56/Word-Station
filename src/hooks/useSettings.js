/**
 * 过滤设置持久化（读写 v2：wrc.settings.v2）
 * ------------------------------------------------------------------
 * 从已废弃的 useStatus.js 抽出来：去掉对 src/data/index.js（28MB）的依赖，
 * 否则设置钩子会把整个词库拖进首屏 bundle。
 *
 * 首次读取顺序：默认值 → 旧 v1 设置 → v2 设置（后者覆盖前者）。
 */
import { useCallback, useState } from 'react'
import { KEYS, readSettingsV2 } from '../lib/migrate.js'
import { LEARN_STORE_VERSION } from '../lib/learning.js'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * @param {object} defaults 默认设置（含 learnBand / groupByFamily 等）
 * @returns {[object, (next: object | ((prev: object) => object)) => object]}
 */
export function useSettings(defaults) {
  const [settings, setSettings] = useState(() => ({
    ...defaults,
    ...readJSON(KEYS.settingsV1, {}),
    ...readSettingsV2(),
  }))

  // 同步写 v2（不用 useEffect，避免首帧把默认值覆盖刚迁移出的设置）
  const update = useCallback((next) => {
    setSettings((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      try {
        localStorage.setItem(KEYS.settings, JSON.stringify(value))
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

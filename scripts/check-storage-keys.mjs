/**
 * 结构回归门禁：存储键字面量独占
 * ------------------------------------------------------------------
 * 跑：npm run test:keys（已并入 npm run test:cloud）
 *
 * 为什么需要这个门禁：分区 bug（读 A 的分区、写 B 的分区）的根源永远是
 * 「某个文件自己拼了一个键名」。这类 bug 代码评审看不出来、运行时也不一定立刻
 * 爆炸（要等用户真的换号），所以必须机器保证。
 *
 * 判定规则（设计 §3.5）：
 *   R1 键字面量独占 —— 除 src/lib/migrate.js 与 src/lib/dict.js 外，
 *      src 下的 .js / .jsx 里出现任何分区键字面量 → 失败。
 *      **含注释**：允许在注释里写键名，正是「工程师照着过时注释改代码」
 *      这条 bug 回流路径。严格换来「migrate.js 之外不可能出现存储键」这条
 *      可被机器保证的不变量。
 *   R2 IndexedDB 白名单 —— dict.js 只允许 wrc.dict.v1:（设备级词库缓存，
 *      与账号无关；⚠ 禁止把 u.* 私有词写入本缓存）。
 *   R3 继承开关隔离 —— inheritFreqKnown 不得出现在 useSettings.js
 *      （它已不是设备级设置，混进去会让切账号时把上一个账号的策略带给下一个）。
 *   R4 单一入口 —— migrate.js 必须导出 keysFor / scopeOf / LEGACY_KEYS / FROZEN_KEYS。
 *   R5 冻结键只读 —— FROZEN_KEYS 的四个键只允许出现在 migrate.js 内，
 *      且不得被 writeJSON / removeKey 触达。
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')

/** 统一成 POSIX 风格相对路径，保证 Windows / POSIX 上比较结果一致 */
function toPosix(p) {
  return p.split(path.sep).join('/')
}

/** 唯一允许出现键字面量的文件：存储键访问器本体 */
const KEY_OWNER = 'lib/migrate.js'
/** 设备级 IndexedDB 词库缓存（白名单） */
const DICT_FILE = 'lib/dict.js'
/** 设备级设置钩子：禁止出现继承开关 */
const SETTINGS_FILE = 'hooks/useSettings.js'

/** 分区键前缀集合（命中即违规，除非在 KEY_OWNER 内） */
const PARTITION_KEY_PATTERN =
  /wrc\.(?:learn\.v2|prefs\.v1|status\.v1(?!\.)|settings\.v1|migration\.v2|migration\.cloud|sync\.v1|drafts\.v1|drafts\.discarded|station\.current|partition\.v1|userwords\.v1)/g

/** 设备级键：豁免（难度档 / 词族成组 / 自动朗读本就与账号无关，共享是对的） */
const DEVICE_KEY_PATTERN = /wrc\.settings\.v2/g

/** 冻结键的四个名字 */
const FROZEN_NAMES = ['wrc.status.v1', 'wrc.status.v1.backup', 'wrc.settings.v1', 'wrc.settings.v1.backup']

/** 递归收集 src 下的 .js / .jsx 源文件 */
function collect(dir, out = []) {
  readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') return
      collect(full, out)
      return
    }
    if (/\.(js|jsx)$/.test(name)) out.push(full)
  })
  return out
}

const files = collect(SRC)
const violations = []

/**
 * 记录一次违规。
 * @param {string} rule
 * @param {string} file 相对 src 的路径
 * @param {number} lineNo 1-based
 * @param {string} text 命中的原文
 * @param {string} hint
 */
function fail(rule, file, lineNo, text, hint) {
  violations.push({ rule, file, lineNo, text, hint })
}

/** 找出某文件里 pattern 的全部命中行（逐行扫描，报告行号便于定位） */
function hitsPerLine(text, pattern) {
  const lines = text.split(/\r?\n/)
  const out = []
  lines.forEach((line, i) => {
    const re = new RegExp(pattern.source, 'g')
    let m = re.exec(line)
    while (m) {
      out.push({ lineNo: i + 1, text: m[0], line: line.trim().slice(0, 100) })
      m = re.exec(line)
    }
  })
  return out
}

// ---------------------------------------------------------------- R1 / R2 / R3

files.forEach((full) => {
  const rel = toPosix(path.relative(SRC, full))
  const abs = toPosix(path.relative(ROOT, full))
  if (rel === KEY_OWNER) return // 键的唯一来源，跳过
  const text = readFileSync(full, 'utf8')

  // R1：分区键字面量独占（含注释）
  hitsPerLine(text, PARTITION_KEY_PATTERN).forEach((h) => {
    fail('R1', abs, h.lineNo, h.text, `分区键字面量只能写在 src/${KEY_OWNER}；请改用 keysFor(scopeOf(ownerId))。注释里也不许留旧键名。`)
  })

  // R2：IndexedDB 白名单 —— dict.js 只允许 wrc.dict.v1:
  if (rel === DICT_FILE) {
    hitsPerLine(text, /wrc\.[A-Za-z0-9_.:]*/g).forEach((h) => {
      if (h.text !== 'wrc.dict.v1:') {
        fail('R2', abs, h.lineNo, h.text, 'dict.js 只允许 wrc.dict.v1: 前缀；⚠ 禁止把 u.* 私有词写入本缓存（会跨账号泄露私有词释义）。')
      }
    })
    return
  }

  // R3：继承开关不得混入设备级设置
  if (rel === SETTINGS_FILE && text.includes('inheritFreqKnown')) {
    const lineNo = text.split(/\r?\n/).findIndex((l) => l.includes('inheritFreqKnown')) + 1
    fail('R3', abs, lineNo, 'inheritFreqKnown', 'inheritFreqKnown 已迁到按账号分区的 prefs 键，不能作为设备级设置。')
  }

  // R5（跨文件部分）：冻结键只允许出现在 migrate.js
  FROZEN_NAMES.forEach((name) => {
    const re = new RegExp(name.replace(/\./g, '\\.'), 'g')
    hitsPerLine(text, re).forEach((h) => {
      fail('R5', abs, h.lineNo, h.text, '冻结键只允许出现在 src/lib/migrate.js 的 runMigration 内（读 v1 源 + 一次性写 backup），不得被任何其他文件访问。')
    })
  })

  // R5（符号级）：migrate.js 之外的任何文件都不得「拿到」冻结键 / 旧键的键名清单。
  // 这比字面量检查更强：调用方拿不到键名，就没法把它们写回去或删掉。
  // 旧 v1 设置的读请走 migrate.js 的 readSettingsV1() 具名出口。
  if (rel !== KEY_OWNER) {
    hitsPerLine(text, /\bFROZEN_KEYS\b/g).forEach((h) => {
      fail('R5', abs, h.lineNo, h.text, 'FROZEN_KEYS 不得在 migrate.js 之外被引用：冻结键的读写必须走 migrate.js 的具名出口（如 readSettingsV1）。')
    })
    hitsPerLine(text, /\bLEGACY_KEYS\b/g).forEach((h) => {
      fail('R1', abs, h.lineNo, h.text, 'LEGACY_KEYS 只属于 migrate.js：业务代码一律用 keysFor(scope)。')
    })
  }

  // 设备级键豁免说明：settings.v2 允许出现在任意文件，但仅 migrate.js 应写入
  if (rel !== DICT_FILE) {
    hitsPerLine(text, DEVICE_KEY_PATTERN).forEach(() => {
      // 仅提示，不判失败：豁免是有意的，这里刻意不做任何断言
    })
  }
})

// ---------------------------------------------------------------- R4 / R5（migrate.js 本体）

const migratePath = path.join(SRC, ...KEY_OWNER.split('/'))
const migrateText = readFileSync(migratePath, 'utf8')

// R4：单一入口必须导出四个符号
;['scopeOf', 'keysFor', 'LEGACY_KEYS', 'FROZEN_KEYS'].forEach((sym) => {
  const exported = new RegExp(`export\\s+(?:async\\s+)?(?:function|const|let|var)\\s+${sym}\\b`).test(migrateText)
  if (!exported) {
    fail('R4', `src/${KEY_OWNER}`, 0, sym, `migrate.js 必须导出 ${sym}（键访问器的单一入口契约）`)
  }
})

// R5（migrate.js 本体）：冻结键不得出现在写操作调用里
const writeCalls = ['writeJSON(', 'localStorage.setItem(', 'removeKey(', 'localStorage.removeItem(']
migrateText.split(/\r?\n/).forEach((line, i) => {
  const hasWrite = writeCalls.some((w) => line.includes(w))
  if (!hasWrite) return
  FROZEN_NAMES.forEach((name) => {
    if (line.includes(name)) {
      // 允许 readJSON(FROZEN_KEYS.statusV1, ...) 这种读；但本行含写调用即不允许
      fail('R5', `src/${KEY_OWNER}`, i + 1, name, '冻结键绝不可被写入或删除（铁律：v1 源原样保留）。')
    }
  })
})

// ---------------------------------------------------------------- 汇总

if (violations.length === 0) {
  console.log('[test:keys] ✓ 通过')
  console.log(`  扫描 ${files.length} 个源文件，migrate.js 与 dict.js 白名单外无任何存储键字面量`)
  console.log('  R1 键字面量独占 ✓   R2 IndexedDB 白名单 ✓   R3 继承开关隔离 ✓   R4 单一入口 ✓   R5 冻结键只读 ✓')
  process.exit(0)
}

console.error('[test:keys] ✗ 失败\n')
violations.forEach((v) => {
  const where = v.lineNo ? `${v.file}:${v.lineNo}` : v.file
  console.error(`  [${v.rule}] ${where}  命中「${v.text}」`)
  console.error(`        ${v.hint}`)
})
console.error(`\n共 ${violations.length} 处违规。键的唯一来源是 src/lib/migrate.js 的 keysFor()。`)
process.exit(1)

// 保持 assert 被引用（Node 严格模式下未使用的 import 不报错，但显式声明意图更清晰）
void assert
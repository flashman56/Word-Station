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

/**
 * R1 的核心规则：**命名空间裸前缀也禁**。
 *
 * 收紧这条的原因（P1，QA 在生产 bundle 里查出来）：规则原先只枚举具体键名，
 * 于是 `useLearnCloud.js` 里那句 `key.startsWith('wrc.')` 两条规则都判过 ——
 * 而它恰恰是「键名知识泄漏回业务文件」的同一种写法。业务代码一旦可以自己
 * 判断命名空间，改键名 / 加分区键时就必然漏改一处。
 *
 * 所以这里匹配的是整个命名空间前缀，而不是某个键名。需要做这种判断时
 * 调 migrate.js 的 `isStorageKey()` / `affectsLocalScope()`。
 */
const NAMESPACE_PATTERN = /wrc\./g

/**
 * 具体分区键名（保留更强的定位信息，命中时给出更精确的提示）。
 * 注意它**不能**替代 NAMESPACE_PATTERN —— 裸前缀不含任何具体键名。
 */
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

  // R2：IndexedDB 白名单 —— dict.js 只允许 wrc.dict.v1:
  //
  // 放在 R1 之前 return：dict.js 是**有意**的第二个键名持有者（设备级 IndexedDB
  // 词库缓存，与账号无关）。它不受 R1 的命名空间独占约束，但仍受 R2 约束 ——
  // 只允许那一个前缀，不许有第二个。
  if (rel === DICT_FILE) {
    hitsPerLine(text, /wrc\.[A-Za-z0-9_.:]*/g).forEach((h) => {
      if (h.text !== 'wrc.dict.v1:') {
        fail('R2', abs, h.lineNo, h.text, 'dict.js 只允许 wrc.dict.v1: 前缀；⚠ 禁止把 u.* 私有词写入本缓存（会跨账号泄露私有词释义）。')
      }
    })
    return
  }

  // R1：存储命名空间字面量独占（含注释、含裸前缀）
  //
  // 先扫裸前缀（粗但周全），再扫具体键名（细、提示更精确）。两者都要：
  // 裸前缀保证「没有键名知识泄漏到业务文件」这条不变量无漏洞 ——
  // `k.startsWith('wrc.')` 这类写法不含任何具体键名，只靠具体键名规则会漏判。
  hitsPerLine(text, NAMESPACE_PATTERN).forEach((h) => {
    fail('R1', abs, h.lineNo, h.text, `存储键命名空间只能出现在 src/${KEY_OWNER}。读键请用 keysFor(scope)；判断「某 key 是不是我们的」请用 migrate.js 的 isStorageKey() / affectsLocalScope()，不要自己写前缀比较。注释里也不许留键名。`)
  })
  hitsPerLine(text, PARTITION_KEY_PATTERN).forEach((h) => {
    fail('R1', abs, h.lineNo, h.text, `分区键字面量只能写在 src/${KEY_OWNER}；请改用 keysFor(scopeOf(ownerId))。注释里也不许留旧键名。`)
  })

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
    // LEGACY_KEYS / STORAGE_PREFIX / KEYS 同理：三者都是「键名载体」。
    // 特别说明 STORAGE_PREFIX —— 它本身只是个前缀常量，但业务代码拿它拼出
    // `${STORAGE_PREFIX}learn.v2:${uid}` 与直接写字面量是同一件事（键名知识泄漏），
    // 而它**不含任何 `wrc.` 字面量**，只靠 R1 的字面量规则抓不到。
    // 这条是门禁自检里的反样本「裸前缀字面量（模板拼接）」逼出来的。
    ;[
      ['LEGACY_KEYS', '旧键清单只能由 migrate.js 使用；业务代码一律用 keysFor(scope)'],
      ['STORAGE_PREFIX', '命名空间前缀只能由 migrate.js 使用；要判断键请调 isStorageKey() / affectsLocalScope()'],
      ['KEYS', '键名表只能由 migrate.js 使用；业务代码一律用 keysFor(scope)'],
    ].forEach(([sym, hint]) => {
      hitsPerLine(text, new RegExp(`\\b${sym}\\b`, 'g')).forEach((h) => {
        fail('R1', abs, h.lineNo, h.text, `${hint}。`)
      })
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

// ---------------------------------------------------------------- 门禁自检
//
// 一道门禁自己是不是有效的，必须能被证明 —— 否则「全绿」可能只是规则从来没
// 命中过任何东西。P1 的成因正是如此：R1 只枚举具体键名，裸前缀写法两条规则
// 都判过，于是它一直「全绿」却漏掉了生产代码里的一处真实违规。
//
// 所以这里用几段**样本代码**当场验证规则本身：
//   正样本（应当通过）= 迁移到新写法后的业务代码
//   反样本（必须被拦）= 迁移前的旧写法 / 各类绕过尝试
// 任何一条不符合预期，这个门禁就报失败 —— 宁可误报，不可漏报。

const SELFTEST_GOOD = [
  ['命名空间判定交给 migrate.js', `import { affectsLocalScope } from '../lib/migrate.js'\nif (!affectsLocalScope(e.key)) return`],
  ['用 keysFor 读写分区键', `const keys = keysFor(scopeOf(ownerId))\nlocalStorage.getItem(keys.learn)`],
  ['设备级设置也是走访问器', `writeSettingsV2({ band })`],
  ['注释里提到「键约定见 migrate.js」', `// 存储键约定见 lib/migrate.js，本文件不出现键名`],
]

const SELFTEST_BAD = [
  ['裸前缀比较（就是 P1 那处）', `if (!key.startsWith('wrc.')) return`],
  ['裸前缀字面量（模板拼接）', "const k = `${STORAGE_PREFIX}learn.v2:${uid}`"],
  ['裸前缀比较（includes）', `if (key.includes('wrc.')) reload()`],
  ['直接拼分区键名', `localStorage.setItem('wrc.learn.v2:' + uid, JSON.stringify(v))`],
  ['注释里留旧键名', `// 读的是 wrc.learn.v2:<scope> 这个键`],
  ['引用 FROZEN_KEYS 拿键名', `localStorage.getItem(FROZEN_KEYS.statusV1)`],
  ['引用 LEGACY_KEYS 拼旧键', `localStorage.getItem(LEGACY_KEYS.learn)`],
  ['引用 KEYS 拼分区键', `localStorage.getItem(KEYS.learn + ':' + uid)`],
]

/** 对一段样本代码跑 R1/R5 的字面量判定，返回命中的规则名数组 */
function judgeSample(text) {
  const rules = new Set()
  if (hitsPerLine(text, NAMESPACE_PATTERN).length > 0) rules.add('R1')
  if (hitsPerLine(text, PARTITION_KEY_PATTERN).length > 0) rules.add('R1')
  FROZEN_NAMES.forEach((name) => {
    if (hitsPerLine(text, new RegExp(name.replace(/\./g, '\\.'), 'g')).length > 0) rules.add('R5')
  })
  if (hitsPerLine(text, /\bFROZEN_KEYS\b/g).length > 0) rules.add('R5')
  ;['LEGACY_KEYS', 'STORAGE_PREFIX', 'KEYS'].forEach((sym) => {
    if (hitsPerLine(text, new RegExp(`\\b${sym}\\b`, 'g')).length > 0) rules.add('R1')
  })
  return [...rules]
}

const selftestFailures = []

SELFTEST_GOOD.forEach(([name, code]) => {
  const rules = judgeSample(code)
  if (rules.length > 0) {
    selftestFailures.push(`正样本「${name}」被误判为违规（命中 ${rules.join(',')}）—— 规则过严，会逼着人写绕路代码`)
  }
})

SELFTEST_BAD.forEach(([name, code]) => {
  const rules = judgeSample(code)
  if (rules.length === 0) {
    selftestFailures.push(`反样本「${name}」未被拦住 —— 门禁有洞，规则的「全绿」不可信`)
  }
})

if (selftestFailures.length > 0) {
  console.error('[test:keys] ✗ 门禁自检失败（规则本身不可信）\n')
  selftestFailures.forEach((f) => console.error(`  ✗ ${f}`))
  console.error('')
  process.exit(1)
}

// ---------------------------------------------------------------- 汇总

if (violations.length === 0) {
  console.log('[test:keys] ✓ 通过')
  console.log(`  扫描 ${files.length} 个源文件，migrate.js 与 dict.js 白名单外无任何存储键字面量`)
  console.log(
    `  门禁自检：${SELFTEST_GOOD.length} 个正样本通过、${SELFTEST_BAD.length} 个反样本被拦（含裸前缀写法）`,
  )
  console.log('  R1 键命名空间独占 ✓   R2 IndexedDB 白名单 ✓   R3 继承开关隔离 ✓   R4 单一入口 ✓   R5 冻结键只读 ✓')
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
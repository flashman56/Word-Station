/**
 * QA 独立版存储键门禁（比 check-storage-keys.mjs 更严）
 * ------------------------------------------------------------------
 * 跑：node scripts/qa-gate-strict.mjs
 *
 * 目的：independently 复核 `npm run test:keys` 是否真的兜住了所有分区键出口。
 * 官方门禁的正则是「枚举已知键名」，因此**裸 `wrc.` 前缀拼接**是盲区。
 * 本脚本在官方规则之上再加两条：
 *   G1  src 下（migrate.js / dict.js 白名单外）出现任何 `wrc.` 字面量 → 违规
 *       （官方只匹配 `wrc.<已知键>`，裸前缀 / 未来新增的键 / 拼错的键都漏）
 *   G2  src 下出现 `localStorage.getItem/setItem/removeItem` 的**变量键**调用
 *       （键不是字面量也不是 keysFor 的返回值）→ 违规
 *
 * 官方门禁跑一遍，本脚本跑一遍，两者结论并排输出，便于对比。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
const KEY_OWNER = 'lib/migrate.js'
const DICT_FILE = 'lib/dict.js'

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
const findings = []
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

files.forEach((full) => {
  const r = rel(full)
  if (r === `src/${KEY_OWNER}`) return // 键的唯一来源
  const lines = readFileSync(full, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    // G1：任何 wrc. 字面量（dict.js 的 IndexedDB 前缀除外）
    if (line.includes('wrc.')) {
      if (r === `src/${DICT_FILE}` && !line.includes('wrc.dict.v1:')) {
        findings.push({ rule: 'G1-dict', where: `${r}:${i + 1}`, text: line.trim().slice(0, 110) })
      } else if (r !== `src/${DICT_FILE}`) {
        findings.push({ rule: 'G1', where: `${r}:${i + 1}`, text: line.trim().slice(0, 110) })
      }
    }
    // G2：变量键的 localStorage 调用（键不是字面量）
    const m = line.match(/localStorage\.(getItem|setItem|removeItem)\s*\(\s*([A-Za-z_$][\w$.[\]]*)\s*[,)]/)
    if (m && !['keysFor', 'LEGACY_KEYS', 'FROZEN_KEYS', 'KEYS'].some((s) => m[2].startsWith(s))) {
      findings.push({ rule: 'G2', where: `${r}:${i + 1}`, text: line.trim().slice(0, 110) })
    }
  })
})

console.log(`[qa-gate] 扫描 ${files.length} 个源文件`)
console.log(`[qa-gate] 官方门禁（npm run test:keys）只匹配「已知键名枚举」，以下为更严规则的发现：\n`)

if (!findings.length) {
  console.log('[qa-gate] ✓ 更严规则下也没有违规')
} else {
  console.log(`[qa-gate] 发现 ${findings.length} 处官方门禁放过的命中：\n`)
  findings.forEach((f) => {
    console.log(`  [${f.rule}] ${f.where}`)
    console.log(`      ${f.text}`)
  })
}

// 官方门禁会不会抓到这些？逐条自查
console.log('\n[qa-gate] 交叉核对：这些命中官方门禁会不会报？')
const OFFICIAL = /wrc\.(?:learn\.v2|prefs\.v1|status\.v1(?!\.)|settings\.v1|migration\.v2|migration\.cloud|sync\.v1|drafts\.v1|drafts\.discarded|station\.current|partition\.v1|userwords\.v1)/
findings.forEach((f) => {
  const caught = OFFICIAL.test(f.text)
  console.log(`  ${caught ? '官方会报' : '★ 官方【漏】'}  ${f.where}`)
})

process.exit(0)

/**
 * 垃圾词条清除脚本（A 类：gloss 自认是错词的条目）
 * ------------------------------------------------------------------
 * 背景：scripts/seed-words.txt 里混进了一批非词（OCR/切分残渣、拼写错误串），
 * DeepSeek 标注时被如实标注成「（拼写有误，疑为 everything）」之类，
 * 于是它们像正常单词一样进了学习队列、词云和统计。
 *
 * 本脚本从 reports/junk-scan.json 读取 A 类清单，按行号精确删除，并：
 *   1. 同步修正 words-mono-seed.js 头部的「词数: N」注释；
 *   2. 清理 synants-mono-seed.js 中引用了被删词的近义/反义对，并同步头部计数；
 *   3. 打印前后词数，便于核对 STATS_SCOPE 等常量。
 *
 * 幂等：重复执行不会重复删除（行号找不到匹配 form 就跳过）。
 *
 * 用法：node scripts/purge-junk-words.mjs [--dry]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SCAN_FILE = path.join(ROOT, 'reports/junk-scan.json')
const REL_FILE = path.join(ROOT, 'src/data/synants-mono-seed.js')

const DRY = process.argv.includes('--dry')

/**
 * 从头部注释里取出「词数: N」并原地替换成新值。
 * @param {string[]} lines 文件行数组
 * @param {number} count 新的词数
 * @returns {boolean} 是否成功替换
 */
function updateCountHeader(lines, count) {
  for (let i = 0; i < lines.length; i += 1) {
    if (/词数:\s*\d+/.test(lines[i])) {
      lines[i] = lines[i].replace(/词数:\s*\d+/, `词数: ${count}`)
      return true
    }
  }
  return false
}

/** 主流程 */
function main() {
  if (!fs.existsSync(SCAN_FILE)) {
    console.error(`缺少扫描结果 ${SCAN_FILE}，请先运行：node scripts/scan-junk-words.mjs`)
    process.exit(1)
  }
  const scan = JSON.parse(fs.readFileSync(SCAN_FILE, 'utf8'))
  const classA = scan.classA || []
  if (classA.length === 0) {
    console.log('A 类清单为空，无需清理。')
    return
  }

  // 按文件分组，记录 { line -> form }
  const byFile = new Map()
  for (const item of classA) {
    if (!byFile.has(item.file)) byFile.set(item.file, new Map())
    byFile.get(item.file).set(item.line, item.form)
  }

  const removed = []
  const missing = []

  for (const [file, lineMap] of byFile) {
    const abs = path.join(ROOT, 'src/data', file)
    if (!fs.existsSync(abs)) {
      console.error(`文件不存在：${abs}`)
      process.exit(1)
    }
    const lines = fs.readFileSync(abs, 'utf8').split('\n')
    const before = lines.length

    const kept = []
    let entryCount = 0
    for (let i = 0; i < lines.length; i += 1) {
      const lineNo = i + 1
      const want = lineMap.get(lineNo)
      if (want != null && lines[i].includes(`"form":"${want}"`)) {
        removed.push({ file, line: lineNo, form: want })
        lineMap.delete(lineNo)
        continue
      }
      // 统计保留下来的词条行
      if (lines[i].trim().startsWith('{"id"')) entryCount += 1
      kept.push(lines[i])
    }

    for (const [lineNo, form] of lineMap) missing.push({ file, line: lineNo, form })

    if (!updateCountHeader(kept, entryCount)) {
      console.warn(`[warn] ${file} 未找到「词数:」头部注释，未更新计数`)
    }

    console.log(`${file}: 删除 ${removed.filter((r) => r.file === file).length} 条，剩余词条 ${entryCount} 行（原文 ${before} 行）`)
    if (!DRY) fs.writeFileSync(abs, kept.join('\n'), 'utf8')
  }

  // ---- 清理 synants-mono-seed.js 中引用被删词的关系对 ----
  const removedForms = new Set(removed.map((r) => r.form.toLowerCase()))
  if (fs.existsSync(REL_FILE) && removedForms.size > 0) {
    const text = fs.readFileSync(REL_FILE, 'utf8')
    const lines = text.split('\n')
    const kept = []
    let synCount = 0
    let antCount = 0
    let inSyn = false
    let inAnt = false
    let dropped = 0

    for (const line of lines) {
      if (line.includes('export const MONO_SEED_SYNONYMS')) inSyn = true
      if (line.includes('export const MONO_SEED_ANTONYMS')) {
        inSyn = false
        inAnt = true
      }
      const m = line.match(/^\s*\{\s*a:\s*"([^"]*)"\s*,\s*b:\s*"([^"]*)"/)
      if (m) {
        const a = m[1].toLowerCase()
        const b = m[2].toLowerCase()
        if (removedForms.has(a) || removedForms.has(b)) {
          dropped += 1
          continue
        }
        if (inSyn) synCount += 1
        else if (inAnt) antCount += 1
        kept.push(line)
        continue
      }
      kept.push(line)
    }

    for (let i = 0; i < kept.length; i += 1) {
      kept[i] = kept[i].replace(/近义对:\s*\d+/, `近义对: ${synCount}`).replace(/反义对:\s*\d+/, `反义对: ${antCount}`)
    }

    console.log(
      `synants-mono-seed.js: 删除引用被删词的关系 ${dropped} 对，剩余 近义 ${synCount} / 反义 ${antCount}`,
    )
    if (!DRY) fs.writeFileSync(REL_FILE, kept.join('\n'), 'utf8')
  }

  console.log(`\n本次删除 A 类词条 ${removed.length} 条${DRY ? '（dry-run，未写盘）' : ''}`)
  if (missing.length > 0) {
    console.log(`[warn] ${missing.length} 条按行号未命中（可能已被删除）：`)
    for (const m of missing) console.log(`  ${m.file}:${m.line} ${m.form}`)
  }
  const outFile = path.join(ROOT, 'reports/purged-junk.json')
  fs.writeFileSync(outFile, JSON.stringify({ at: new Date().toISOString(), removed, missing }, null, 2), 'utf8')
  console.log(`明细已写入 ${outFile}`)
}

main()

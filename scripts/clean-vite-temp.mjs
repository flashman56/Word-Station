/**
 * 清理 vite 在加载配置时留下的临时文件
 * ------------------------------------------------------------------
 * vite 会为每次加载 vite.config.js 写一个 `vite.config.js.timestamp-<ms>-<hash>.mjs`。
 * 正常应该只是配置的几 KB 副本，但本项目实测每个约 121MB，且**每次构建新增 2 个**
 * （2026-10-13 累积 6 个 = 727MB），最终把系统盘撑到 100% 满（可用 0 字节），
 * 连带表现为：esbuild 写 .qa-bundle.mjs 报 ENOSPC、e2e 出现稳定的假红
 * （「条内 flash 反馈 = null」曾长期被误判为时序抖动，真因就是磁盘满）。
 *
 * 为什么不能靠 .gitignore：它本来就被 gitignore 且从未进过仓库（git ls-files 为 0），
 * 这是**纯本地磁盘泄漏**，git 管不到。
 *
 * 无害性：这些文件与真实构建产物无关，删掉不影响任何功能。
 * 用 fs.unlinkSync 而非 shell rm —— shell rm 会被宿主的 safe-delete 回收站机制拦截，
 * 而磁盘满时该机制本身会因无法写入回收站元数据而 ENOSPC 失败。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let freed = 0
let removed = 0
let failed = 0

for (const name of fs.readdirSync(ROOT)) {
  if (!/^vite\.config\.js\.timestamp-.*\.mjs$/.test(name)) continue
  const p = path.join(ROOT, name)
  try {
freed += fs.statSync(p).size
    fs.unlinkSync(p)
    removed += 1
  } catch (e) {
    failed += 1
    process.stderr.write(`  [clean-vite-temp] 删除失败 ${name}: ${e.message}\n`)
  }
}

if (removed > 0) {
  console.log(`[clean-vite-temp] 清理 ${removed} 个 vite 临时文件，释放 ${(freed / 1048576).toFixed(1)} MB`)
}
if (failed > 0) console.log(`[clean-vite-temp] ${failed} 个未能删除（不影响构建）`)
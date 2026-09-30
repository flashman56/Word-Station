/**
 * 导出 dict_cache 导入文件（供 Supabase 建库后一次性导入）
 * ------------------------------------------------------------------
 * dict_cache 承担三个职责：
 *   ① 公共库命中判定（word_id 非空 = 已在公共库，禁止再生成）
 *   ② 音标权威查表（红线：音标只来自这里，模型产出的音标一律丢弃）
 *   ③ 跨用户同名词生成缓存
 *
 * 产出（两种格式，任选其一导入）：
 *   supabase/dict_cache.csv        form_key,word_id,phonetic   —— Dashboard → Table Editor → Import CSV
 *   supabase/dict_cache.sql        COPY 语句                    —— SQL Editor 粘贴执行（需能读服务端文件，一般不用）
 *
 * 用法：npm run export:dict
 *
 * 红线：本脚本只搬运既有 ECDICT 音标（src/data/phonetics.js），绝不生成音标。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { words, phonetics } from '../src/data/index.js'
import { publicKey } from '../src/lib/wordKey.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'supabase')

/** CSV 字段转义：包引号 + 双写内部引号；含逗号/引号/换行才需要包 */
function csvCell(value) {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.split('"').join('""')}"`
  return s
}

function main() {
  const rows = []
  const seen = new Set()

  words.forEach((w) => {
    if (!w || !w.form) return
    const key = publicKey(w.form)
    if (seen.has(key)) return
    seen.add(key)
    const phonEntry = phonetics[String(w.form).toLowerCase()]
    const phonetic = phonEntry && typeof phonEntry.p === 'string' ? phonEntry.p : ''
    rows.push([key.slice(2), key, phonetic])
  })

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  // ---------------------------------------------------------------- CSV
  const csvLines = ['form_key,word_id,phonetic']
  rows.forEach((r) => csvLines.push(r.map(csvCell).join(',')))
  writeFileSync(resolve(OUT_DIR, 'dict_cache.csv'), `${csvLines.join('\n')}\n`, 'utf8')

  // ---------------------------------------------------------------- SQL（批量 insert，供无 CSV 导入权限时用）
  const SQL_BATCH = 1000
  const sqlChunks = [
    '-- dict_cache 初始导入（由 scripts/export-dict-cache.mjs 生成，可重复执行）',
    '-- 用法：Supabase Dashboard → SQL Editor → 粘贴执行',
    'truncate table public.dict_cache;',
  ]
  for (let i = 0; i < rows.length; i += SQL_BATCH) {
    const batch = rows.slice(i, i + SQL_BATCH)
    const values = batch
      .map(([formKey, wordId, phonetic]) => {
        const esc = (s) => `'${String(s).split("'").join("''")}'`
        return `  (${esc(formKey)},${esc(wordId)},${esc(phonetic)})`
      })
      .join(',\n')
    sqlChunks.push(
      `insert into public.dict_cache (form_key, word_id, phonetic) values\n${values}\non conflict (form_key) do update set word_id = excluded.word_id, phonetic = excluded.phonetic;`,
    )
  }
  writeFileSync(resolve(OUT_DIR, 'dict_cache.sql'), `${sqlChunks.join('\n\n')}\n`, 'utf8')

  const withPhonetic = rows.filter((r) => r[2]).length
  /* eslint-disable no-console */
  console.log('[export:dict] 完成')
  console.log(`  总行数        ${rows.length}`)
  console.log(`  含音标行数    ${withPhonetic}（${((withPhonetic / rows.length) * 100).toFixed(1)}%）`)
  console.log(`  CSV           supabase/dict_cache.csv`)
  console.log(`  SQL           supabase/dict_cache.sql（${Math.ceil(rows.length / SQL_BATCH)} 批）`)
  /* eslint-enable no-console */
}

main()

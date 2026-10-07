/**
 * scripts/qa-etym.mjs —— QA 独立单测：词源解析优先级 + 音标红线
 * ------------------------------------------------------------------
 * 验证 resolveEtymology：
 *   - 精编优先：键存在（如 r.gen）→ source='curated'，字段取自精编数据
 *   - 缺失回退：键不存在 / 无 id / 传 null → source='composed'（本地组合，不抛错）
 *   - 音标红线：组合叙述输出**无任何音标类字段**（键名黑名单递归扫描）
 *
 * 纯 Node ESM，零依赖。跑：node scripts/qa-etym.mjs
 */
import { composeEtymology, resolveEtymology, loadEtymologyMap } from '../src/lib/etym.js'

let pass = 0
let fail = 0
const failures = []
const pending = []

function check(name, fn) {
  pending.push(
    Promise.resolve()
      .then(fn)
      .then(() => {
        pass += 1
        console.log(`  PASS  ${name}`)
      })
      .catch((e) => {
        fail += 1
        failures.push(`${name}\n    ${e.message}`)
        console.log(`  FAIL  ${name}\n        ${e.message}`)
      }),
  )
}
const ok = (v, msg = '断言失败') => {
  if (!v) throw new Error(msg)
}

const PHONETIC_KEY = /phonetic|pronunc|pronunciation|ipa|音标|读音|发音/i

/** 递归扫描对象所有**键名**，返回命中音标黑名单的路径 */
function phoneticKeys(obj, pathStr = '$', out = []) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => phoneticKeys(v, `${pathStr}[${i}]`, out))
    return out
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (PHONETIC_KEY.test(k)) out.push(`${pathStr}.${k}`)
      phoneticKeys(v, `${pathStr}.${k}`, out)
    }
  }
  return out
}

/** 一个用于回退的有 words 的词素（组合叙述据此产出「同词素词」cognates） */
const COMPOSED_MORPH = {
  id: 'r.__qa_missing__',
  form: 'zzz',
  display: 'zzz-',
  gloss: 'QA 测试义',
  glossEn: 'qa-test',
  origin: 'latin',
  type: 'root',
  note: 'QA 备注',
  variants: ['zzz-', 'zz-'],
  words: [
    { id: 'w.qa1', form: 'zazzy', gloss: '花哨的' },
    { id: 'w.qa2', form: 'zizzle', gloss: '嘶嘶声' },
  ],
}

// ---------------------------------------------------------------- 用例

check('精编优先：r.gen → source=curated，字段来自精编数据', async () => {
  const map = await loadEtymologyMap()
  ok(map && map['r.gen'], '精编映射应包含 r.gen（前提：数据已生成）')
  const e = await resolveEtymology({ id: 'r.gen', origin: 'latin', form: 'gen' })
  ok(e.source === 'curated', `source 应为 curated，实际 ${e.source}`)
  ok(e.origin === map['r.gen'].origin, `origin 应取自精编（${map['r.gen'].origin}），实际 ${e.origin}`)
  ok(typeof e.story === 'string' && e.story.length > 0, '精编应有非空 story')
  ok(Array.isArray(e.timeline), 'timeline 应为数组')
  ok(phoneticKeys(e).length === 0, `精编输出不应含音标字段：${JSON.stringify(phoneticKeys(e))}`)
})

check('缺失回退：未知 id（有 words）→ source=composed，带「同词素词」', async () => {
  const e = await resolveEtymology(COMPOSED_MORPH)
  ok(e.source === 'composed', `source 应为 composed，实际 ${e.source}`)
  ok(e.proto === null && e.protoGloss === null, '组合叙述 proto/protoGloss 应为 null')
  ok(e.pie === false, '组合叙述 pie 应为 false')
  ok(e.cognates.length === 2, `应带出 2 个同词素词，实际 ${e.cognates.length}`)
  ok(e.cognates.every((c) => !!c.form), '每个同词素词都应有 form')
})

check('边界：无 id / 传 null 也不抛错，走组合叙述', async () => {
  const a = await resolveEtymology({ form: 'x', origin: 'greek', type: 'prefix' })
  ok(a.source === 'composed', `无 id 应走 composed，实际 ${a.source}`)
  const b = await resolveEtymology(null)
  ok(b && b.source === 'composed', '传 null 应安全回退 composed，不抛错')
})

check('音标红线：composeEtymology 输出无任何音标类字段', () => {
  const e = composeEtymology(COMPOSED_MORPH)
  const hits = phoneticKeys(e)
  ok(hits.length === 0, `组合叙述不应含音标字段，命中：${JSON.stringify(hits)}`)
  // 显式核对：不应存在 phonetic/ipa/proto 之外的发音字段
  const keys = Object.keys(e)
  ok(!keys.includes('phonetic') && !keys.includes('ipa'), '不应有 phonetic/ipa 键')
})

check('音标红线：resolveEtymology 组合路径同样无音标字段', async () => {
  const e = await resolveEtymology(COMPOSED_MORPH)
  ok(phoneticKeys(e).length === 0, `回退路径也不应含音标字段：${JSON.stringify(phoneticKeys(e))}`)
})

// ---------------------------------------------------------------- 汇总
await Promise.all(pending)
console.log('')
if (failures.length) {
  failures.forEach((f) => console.log(`FAIL ${f}`))
  console.log('')
}
console.log(`[qa-etym] PASS=${pass} FAIL=${fail}`)
process.exit(fail > 0 ? 1 : 0)

/**
 * parseForms 单测（裸 node 脚本，与项目现有测试风格一致）
 * 用法：npm run test:parse-forms
 */
import assert from 'node:assert/strict'
import { MAX_FORM_LENGTH, checkForm, dedupe, parse, parseUsable } from '../src/lib/parseForms.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed += 1
    console.error(`  ✗ ${name}\n    ${e && e.message ? e.message : e}`)
  }
}

console.log('[test:parse-forms]')

test('空输入 → 0 项', () => {
  assert.equal(parse('').items.length, 0)
  assert.equal(parse(null).items.length, 0)
})

test('逗号分隔', () => {
  const r = parse('apple, banana, cherry')
  assert.equal(r.stats.valid, 3)
  assert.deepEqual(
    r.items.map((i) => i.form),
    ['apple', 'banana', 'cherry'],
  )
})

test('中文逗号 / 分号 / 中文分号', () => {
  const r = parse('apple，banana; cherry；date')
  assert.equal(r.stats.valid, 4)
})

test('空格 / 换行 / Tab 都算分隔符', () => {
  const r = parse('apple banana\ncherry\tdate')
  assert.equal(r.stats.valid, 4)
})

test('混用分隔符 + 连续分隔符', () => {
  const r = parse('apple,,  banana;;\n\ncherry')
  assert.equal(r.stats.valid, 3)
})

test('大小写去重（保留首次出现）', () => {
  const r = parse('Apple, apple, APPLE')
  assert.equal(r.stats.valid, 1)
  assert.equal(r.stats.duplicate, 2)
  assert.equal(r.items[0].form, 'Apple')
})

test('非法词被标出：数字开头 / 纯数字 / 含中文', () => {
  const r = parse('apple, 123, 2fast, 单词, good')
  assert.equal(r.stats.valid, 2)
  assert.equal(r.stats.invalid, 3)
  const bad = r.items.filter((i) => !i.valid).map((i) => i.form)
  assert.deepEqual(bad, ['123', '2fast', '单词'])
})

test('边缘标点被修剪（引号 / 括号 / 句号）', () => {
  const r = parse('"apple", (banana), cherry.')
  assert.deepEqual(
    r.items.filter((i) => i.valid).map((i) => i.form),
    ['apple', 'banana', 'cherry'],
  )
})

test('合法词形允许连字符与撇号，但必须以字母开头', () => {
  assert.equal(checkForm('well-known').valid, true)
  assert.equal(checkForm("don't").valid, true)
  assert.equal(checkForm('-able').valid, false)
  assert.equal(checkForm("'em").valid, false)
})

test('超长词被判非法', () => {
  const long = 'a'.repeat(MAX_FORM_LENGTH + 1)
  assert.equal(checkForm(long).valid, false)
  assert.equal(checkForm('a'.repeat(MAX_FORM_LENGTH)).valid, true)
})

test('parseUsable 只返回有效且去重的词形', () => {
  const out = parseUsable('Apple, apple; 123; cherry')
  assert.deepEqual(out, [
    { form: 'Apple', formKey: 'apple' },
    { form: 'cherry', formKey: 'cherry' },
  ])
})

test('dedupe 保持顺序且按 formKey 去重', () => {
  const out = dedupe([{ form: 'Bee' }, { form: 'bee' }, { form: 'Cat' }])
  assert.deepEqual(
    out.map((o) => o.form),
    ['Bee', 'Cat'],
  )
})

test('PRD R-03：20 词解析准确率 100%', () => {
  const raw = Array.from({ length: 20 }, (_, i) => `word${i}`).join(', ')
  const r = parse(raw)
  assert.equal(r.stats.valid, 20)
  assert.equal(r.stats.invalid, 0)
  assert.equal(r.stats.duplicate, 0)
})

console.log(`\n通过 ${passed} · 失败 ${failed}`)
process.exit(failed === 0 ? 0 : 1)

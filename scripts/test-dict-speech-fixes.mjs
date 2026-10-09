import assert from 'node:assert/strict'

import { buildDictCacheKey } from '../src/lib/dict.js'
import { pickVoice, scheduleSpeech } from '../src/hooks/useSpeech.js'
import { shouldShowPhoneticPending } from '../src/lib/phoneticDisplay.js'

function voice(name, lang, localService, voiceURI = name) {
  return { name, lang, localService, voiceURI }
}

function testCacheVersioning() {
  const manifestA = { generatedAt: '2026-09-30T17:27:06.926Z' }
  const manifestB = { generatedAt: '2026-10-01T09:00:00.000Z' }
  const first = buildDictCacheKey(manifestA, 'phon-a')
  const sameVersion = buildDictCacheKey({ ...manifestA }, 'phon-a')
  const nextVersion = buildDictCacheKey(manifestB, 'phon-a')

  assert.equal(first, sameVersion, '相同 generatedAt 必须生成相同缓存键')
  assert.notEqual(first, nextVersion, '不同 generatedAt 必须生成不同缓存键')
  console.log(`[cache-version] same=true different=true\n  A=${first}\n  B=${nextVersion}`)
}

function testDeterministicVoiceSelection() {
  const voices = [
    voice('Hindi English', 'en-IN', true),
    voice('Network US', 'en-US', false),
    voice('中文语音', 'zh-CN', true),
    voice('Local British', 'en-GB', true),
    voice('Local American', 'en-US', true),
  ]
  const selections = Array.from({ length: 5 }, (_, index) => {
    const rotated = voices.slice(index).concat(voices.slice(0, index))
    return pickVoice(rotated)?.name || null
  })

  assert.deepEqual(selections, Array(5).fill('Local American'))
  console.log(`[pickVoice] selections=${selections.join(' | ')}`)
}

async function testVoicesNotReadyDoesNotSpeak() {
  const calls = { speak: 0, resume: 0 }
  const synthesis = {
    paused: true,
    speak() {
      calls.speak += 1
    },
    resume() {
      calls.resume += 1
    },
  }
  class FakeUtterance {
    constructor(text) {
      this.text = text
      this.voice = null
      this.lang = ''
      this.rate = 1
      this.onend = null
      this.onerror = null
    }
  }

  const scheduled = scheduleSpeech({
    synthesis,
    UtteranceCtor: FakeUtterance,
    voices: [],
    text: 'hello',
    delayMs: 0,
  })
  await new Promise((resolve) => setTimeout(resolve, 10))

  assert.equal(scheduled, null)
  assert.equal(calls.speak, 0, 'voices 未就绪时绝不能调用 speak')
  console.log(`[voices-not-ready] scheduled=${String(scheduled)} speakCalls=${calls.speak}`)
}

function testPhrasePendingHint() {
  const cases = [
    ['look forward to', { form: 'look forward to' }, false],
    ['well-being', { form: 'well-being' }, false],
    ['kind=phrase', { form: 'icecream', kind: 'phrase' }, false],
    ['ordinary word', { form: 'hello' }, true],
  ]
  const output = cases.map(([name, word, expected]) => {
    const actual = shouldShowPhoneticPending(word, null)
    assert.equal(actual, expected, name)
    return `${name}:${actual}`
  })
  console.log(`[phrase-hint] ${output.join(' | ')}`)
}

async function main() {
  testCacheVersioning()
  testDeterministicVoiceSelection()
  await testVoicesNotReadyDoesNotSpeak()
  testPhrasePendingHint()
  console.log('[test:dict-speech-fixes] ✓ 4 项行为自验通过')
}

main().catch((error) => {
  console.error('[test:dict-speech-fixes] ✗', error)
  process.exit(1)
})

/**
 * useSpeech —— 浏览器原生语音合成（window.speechSynthesis）封装。
 *
 * 所有实例共享 voice 列表、voiceschanged 监听与播放状态；只有英语 voice 真正
 * 就绪后才允许朗读，避免 Chrome 首帧空列表时落到中文默认引擎。
 *
 * ★ 音标红线：本文件绝不产出或存储音标，音标只经 src/lib/dict.js 查表。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_RATE = 0.85
const SPEAK_DELAY_MS = 60
const EXCLUDED_ACCENTS = new Set(['en-in', 'en-ng', 'en-za', 'en-ph'])

/** 是否具备语音合成能力（模块级只判定一次）。 */
const SUPPORTED =
  typeof window !== 'undefined' &&
  typeof window.speechSynthesis !== 'undefined' &&
  typeof window.SpeechSynthesisUtterance === 'function'

/** 所有 useSpeech 实例共享的 voice 缓存与播放态。 */
const state = {
  supported: SUPPORTED,
  voices: [],
  voicesReady: false,
  selectedVoiceSignature: '',
  activeText: null,
  /** 当前 utterance 的强引用（Chrome 已知问题：utterance 被回收会导致朗读中断） */
  activeUtterance: null,
  listenerAttached: false,
  pendingTimer: null,
  playbackToken: 0,
  iosPrimed: false,
}

/** voice 就绪或播放态变化时统一通知所有 hook 实例。 */
const subscribers = new Set()

function notify() {
  subscribers.forEach((subscriber) => {
    try {
      subscriber()
    } catch {
      /* 单个订阅者出错不影响其他订阅者 */
    }
  })
}

/**
 * 将浏览器可能返回的语言标签统一为小写 BCP-47 形式。
 * @param {unknown} lang
 * @returns {string}
 */
function normalizeLang(lang) {
  return typeof lang === 'string' ? lang.trim().toLowerCase().replace(/_/g, '-') : ''
}

/**
 * 英语地区的产品优先级：美音 > 加拿大/澳洲 > 英音 > 其他英语。
 * @param {string} lang
 * @returns {number}
 */
function languageScore(lang) {
  if (lang === 'en-us' || lang.startsWith('en-us-')) return 4
  if (lang === 'en-ca' || lang.startsWith('en-ca-') || lang === 'en-au' || lang.startsWith('en-au-')) {
    return 3
  }
  if (lang === 'en-gb' || lang.startsWith('en-gb-')) return 2
  return 1
}

/**
 * 确定性选择英语 voice。
 *
 * 排序规则：本地离线引擎优先；排除 en-IN/en-NG/en-ZA/en-PH；地区按
 * en-US > en-CA/en-AU > en-GB > 其他英语；同分按 name、voiceURI 字典序。
 * requested 参数为兼容旧调用保留，产品始终采用上述固定美音优先级。
 *
 * @param {SpeechSynthesisVoice[]} voices
 * @param {string} [requested]
 * @returns {SpeechSynthesisVoice|null}
 */
function pickVoice(voices, requested = 'en-US') {
  void requested
  const candidates = (Array.isArray(voices) ? voices : [])
    .filter((voice) => {
      if (!voice || typeof voice.lang !== 'string') return false
      const lang = normalizeLang(voice.lang)
      if (!(lang === 'en' || lang.startsWith('en-'))) return false
      return ![...EXCLUDED_ACCENTS].some((accent) => lang === accent || lang.startsWith(`${accent}-`))
    })
    .slice()

  candidates.sort((left, right) => {
    const localDifference = Number(Boolean(right.localService)) - Number(Boolean(left.localService))
    if (localDifference !== 0) return localDifference

    const languageDifference = languageScore(normalizeLang(right.lang)) - languageScore(normalizeLang(left.lang))
    if (languageDifference !== 0) return languageDifference

    const leftName = String(left.name || '')
    const rightName = String(right.name || '')
    if (leftName < rightName) return -1
    if (leftName > rightName) return 1

    const leftUri = String(left.voiceURI || '')
    const rightUri = String(right.voiceURI || '')
    if (leftUri < rightUri) return -1
    if (leftUri > rightUri) return 1
    return 0
  })

  return candidates[0] || null
}

/**
 * 安排一次实际朗读。没有可用英语 voice 时不会构造 utterance，更不会调用 speak。
 * 此函数接收依赖参数，便于用假 speechSynthesis 验证浏览器边界行为。
 *
 * @param {object} params
 * @param {SpeechSynthesis} params.synthesis
 * @param {typeof SpeechSynthesisUtterance} params.UtteranceCtor
 * @param {SpeechSynthesisVoice[]} params.voices
 * @param {string} params.text
 * @param {string} [params.lang]
 * @param {number} [params.rate]
 * @param {number} [params.delayMs]
 * @param {() => boolean} [params.shouldSpeak]
 * @param {() => void} [params.onBeforeSpeak]
 * @param {() => void} [params.onEnd]
 * @param {() => void} [params.onError]
 * @returns {{utterance: SpeechSynthesisUtterance, timer: ReturnType<typeof setTimeout>}|null}
 */
export function scheduleSpeech({
  synthesis,
  UtteranceCtor,
  voices,
  text,
  lang = 'en-US',
  rate = DEFAULT_RATE,
  delayMs = SPEAK_DELAY_MS,
  shouldSpeak = () => true,
  onBeforeSpeak = () => {},
  onEnd = () => {},
  onError = () => {},
}) {
  const voice = pickVoice(voices, lang)
  if (!voice || !synthesis || typeof synthesis.speak !== 'function' || typeof UtteranceCtor !== 'function') {
    return null
  }

  let utterance
  try {
    utterance = new UtteranceCtor(String(text == null ? '' : text))
  } catch {
    return null
  }

  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = Number.isFinite(rate) ? Math.min(10, Math.max(0.1, rate)) : DEFAULT_RATE
  utterance.onend = onEnd
  utterance.onerror = onError

  const run = () => {
    if (!shouldSpeak()) return
    onBeforeSpeak()
    try {
      if (synthesis.paused && typeof synthesis.resume === 'function') synthesis.resume()
      synthesis.speak(utterance)
    } catch {
      onError()
    }
  }

  // ★ delayMs <= 0 ⇒ **同步** speak，留在用户点击的调用栈里。
  //   Android Chrome 要求 speak() 处于用户激活窗口内；把它推到 setTimeout 里会静音
  //   （表现为：按钮可点、voice 已就绪，但点击后没有任何声音）。
  if (!(delayMs > 0)) {
    run()
    return { utterance, timer: null }
  }

  const timer = setTimeout(run, delayMs)

  return { utterance, timer }
}

/** 拉取 voice 列表；首帧为空时等待 voiceschanged 再次触发。 */
function refreshVoices() {
  if (!state.supported) return
  try {
    const voices = window.speechSynthesis.getVoices() || []
    const selected = pickVoice(voices)
    const signature = selected
      ? `${selected.name || ''}|${selected.lang || ''}|${selected.voiceURI || ''}|${Boolean(selected.localService)}`
      : ''
    const readinessChanged = state.voicesReady !== Boolean(selected)
    const selectionChanged = state.selectedVoiceSignature !== signature

    state.voices = Array.isArray(voices) ? voices : []
    state.voicesReady = Boolean(selected)
    state.selectedVoiceSignature = signature
    if (readinessChanged || selectionChanged) notify()
  } catch {
    state.voices = []
    if (state.voicesReady) {
      state.voicesReady = false
      state.selectedVoiceSignature = ''
      notify()
    }
  }
}

/** 挂载全局唯一的 voiceschanged 监听。 */
function ensureListener() {
  if (!state.supported || state.listenerAttached) return
  state.listenerAttached = true
  try {
    const synthesis = window.speechSynthesis
    if (typeof synthesis.addEventListener === 'function') {
      synthesis.addEventListener('voiceschanged', refreshVoices)
    } else {
      synthesis.onvoiceschanged = refreshVoices
    }
  } catch {
    /* 老旧或受限环境无法监听时，仍由调用方的 refreshVoices 尝试读取 */
  }
  refreshVoices()
}

/**
 * iOS Safari 只允许在用户手势调用栈中首次启动语音。用一次无声 utterance 解锁，
 * 随后的正式 utterance 仍遵守 cancel 后延迟 60ms 的 Chrome 兼容路径。
 * @param {SpeechSynthesisVoice} voice
 */
function primeIosSynthesis(voice) {
  if (state.iosPrimed || !state.supported || typeof navigator === 'undefined') return
  const userAgent = String(navigator.userAgent || '')
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent)
  if (!isIos || !isSafari) return

  state.iosPrimed = true
  try {
    const primer = new window.SpeechSynthesisUtterance('\u00a0')
    primer.voice = voice
    primer.lang = voice.lang
    primer.volume = 0
    window.speechSynthesis.speak(primer)
  } catch {
    // 预热失败不应阻止正式发音；下次点击仍走正常路径。
    state.iosPrimed = false
  }
}

/** 取消待执行和正在播放的朗读，并使旧回调失效。 */
function cancelPlayback() {
  state.playbackToken += 1
  if (state.pendingTimer != null) {
    clearTimeout(state.pendingTimer)
    state.pendingTimer = null
  }
  if (state.supported) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* cancel 失败也必须复位模块状态 */
    }
  }
  state.activeText = null
  state.activeUtterance = null
  notify()
}

// 模块加载时先尝试一次；Chrome 返回空数组时后续由 voiceschanged 补齐。
ensureListener()

/**
 * 浏览器语音合成 hook。
 * @returns {{supported: boolean, voicesReady: boolean, speaking: boolean,
 *   voiceLang: string|null, speak: (text: string, opts?: {lang?: string, rate?: number}) => void,
 *   cancel: () => void, stop: () => void}}
 */
export function useSpeech() {
  const [, setTick] = useState(0)
  const textRef = useRef(null)

  useEffect(() => {
    const subscriber = () => setTick((tick) => tick + 1)
    subscribers.add(subscriber)
    ensureListener()
    refreshVoices()

    return () => {
      subscribers.delete(subscriber)
      // 只取消本实例发起的朗读，避免卸载无关按钮时打断其他按钮。
      if (textRef.current != null && state.activeText === textRef.current) cancelPlayback()
    }
  }, [])

  const speak = useCallback((text, options = {}) => {
    if (!state.supported) return
    const normalizedText = String(text == null ? '' : text).trim()
    if (!normalizedText) return

    // 再点正在朗读的同一文本即停止；此分支不依赖 voice 列表仍然可见。
    if (state.activeText === normalizedText) {
      cancelPlayback()
      textRef.current = null
      return
    }

    refreshVoices()
    if (!state.voicesReady) return

    const selectedVoice = pickVoice(state.voices, options.lang || 'en-US')
    if (!selectedVoice) return
    primeIosSynthesis(selectedVoice)

    // ★ Android Chrome 修复：speak() 必须落在用户激活窗口内。
    //   旧实现无条件 cancel() + setTimeout(60ms)，把真正的 speak 推到手势栈之外 →
    //   安卓上按钮可点、voice 已就绪，但点击后静音。
    //   修法：没有正在播放的内容时**不调 cancel、不延迟**，直接在点击栈里同步 speak；
    //   确实要打断旧朗读时才走 cancel + 60ms 延迟（桌面 Chrome cancel 后紧跟 speak 会吞音）。
    const hadActive = state.activeText != null
    if (hadActive) {
      cancelPlayback()
    } else {
      state.playbackToken += 1
      if (state.pendingTimer != null) {
        clearTimeout(state.pendingTimer)
        state.pendingTimer = null
      }
    }
    const token = state.playbackToken

    // 在用户点击的同步调用栈中 resume，可兼容 iOS Safari 的手势激活要求；
    // 定时器真正 speak 前还会再次检查 paused。
    try {
      if (window.speechSynthesis.paused && typeof window.speechSynthesis.resume === 'function') {
        window.speechSynthesis.resume()
      }
    } catch {
      /* resume 失败时仍尝试正常排队 */
    }

    const finish = () => {
      if (state.playbackToken === token && state.activeText === normalizedText) {
        state.activeText = null
        state.pendingTimer = null
        state.activeUtterance = null
        notify()
      }
    }

    // 先落 activeText —— 同步 speak 时 shouldSpeak() 需要它已就位
    textRef.current = normalizedText
    state.activeText = normalizedText

    const scheduled = scheduleSpeech({
      synthesis: window.speechSynthesis,
      UtteranceCtor: window.SpeechSynthesisUtterance,
      voices: state.voices,
      text: normalizedText,
      lang: options.lang || 'en-US',
      rate: typeof options.rate === 'number' ? options.rate : DEFAULT_RATE,
      delayMs: hadActive ? SPEAK_DELAY_MS : 0,
      shouldSpeak: () => state.playbackToken === token && state.activeText === normalizedText,
      onBeforeSpeak: () => {
        state.pendingTimer = null
      },
      onEnd: finish,
      onError: finish,
    })
    if (!scheduled) {
      state.activeText = null
      textRef.current = null
      state.activeUtterance = null
      notify()
      return
    }

    // Chrome 已知问题：utterance 被回收会导致朗读中断 → 保持强引用
    state.activeUtterance = scheduled.utterance
    state.pendingTimer = scheduled.timer
    notify()
  }, [])

  const cancel = useCallback(() => {
    if (!state.supported) return
    cancelPlayback()
    textRef.current = null
  }, [])

  const voice = pickVoice(state.voices)
  return {
    supported: state.supported,
    voicesReady: state.voicesReady,
    speaking: state.activeText != null && state.activeText === textRef.current,
    voiceLang: voice ? voice.lang : null,
    speak,
    cancel,
    stop: cancel,
  }
}

export { pickVoice }
export default useSpeech

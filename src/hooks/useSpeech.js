/**
 * useSpeech —— 浏览器原生语音合成（window.speechSynthesis）封装
 * ------------------------------------------------------------------
 * 设计要点（对应 docs/features-design.md A·发音）：
 *   1. 模块级「单例」voice 缓存 + **单一** voiceschanged 监听：再多的喇叭按钮
 *      也只挂一个监听器，voice 就绪后统一通知所有订阅者（避免 N 个按钮各挂监听）。
 *   2. 选声优先级：en-US → en-GB → 任意 en* → null（交给浏览器默认）。
 *   3. 连点不重叠：每次 speak() 前先 speechSynthesis.cancel()；
 *      再次点击「同一文本」且正在播 → 视为「停止」。
 *   4. 优雅降级：环境中不存在 speechSynthesis / SpeechSynthesisUtterance 时
 *      supported=false，按钮据此禁用，且本模块任何路径都**不抛异常**。
 *   5. 零依赖：只用浏览器原生 API，不引入任何 npm 包。
 *
 * 导出：useSpeech() → { supported, speaking, voiceLang, speak, cancel, stop }
 *   - supported : 当前环境是否具备语音合成能力（API 存在）
 *   - speaking  : 「本实例最近朗读的那段文本」是否正在播（用于图标三态）
 *   - voiceLang : 实际选中的 voice.lang（无语音时 null）
 *   - speak(text, opts?) : 朗读；同一文本再点一次 = 停止
 *   - cancel()/stop()    : 立即停止并复位
 *
 * ★ 音标红线：本文件绝不产出/存储音标，音标只经 src/lib/dict.js 查表。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/** 是否具备语音合成能力（模块级只判定一次） */
const SUPPORTED =
  typeof window !== 'undefined' &&
  typeof window.speechSynthesis !== 'undefined' &&
  typeof window.SpeechSynthesisUtterance === 'function'

/** 模块级共享状态：所有 useSpeech 实例共用同一份 voice 缓存与播放态 */
const state = {
  supported: SUPPORTED,
  voices: [], // SpeechSynthesisVoice[]
  activeText: null, // 当前正在朗读的文本（null = 空闲）
  listenerAttached: false,
}

/** 订阅者集合：voice 就绪 / 播放态变化时统一通知 */
const subscribers = new Set()

function notify() {
  subscribers.forEach((fn) => {
    try {
      fn()
    } catch {
      /* 单个订阅者出错不影响其他订阅者 */
    }
  })
}

/**
 * 选声：按优先级挑一个英语 voice。
 * 顺序：请求的 lang 精确匹配 → en-US → en-GB → 任意 en* → null。
 * @param {SpeechSynthesisVoice[]} voices
 * @param {string} [requested] 期望语言，默认 'en-US'
 * @returns {SpeechSynthesisVoice|null}
 */
function pickVoice(voices, requested = 'en-US') {
  const list = Array.isArray(voices) ? voices : []
  if (list.length === 0) return null
  const req = String(requested || 'en-US').toLowerCase()
  const byLang = (lang) => list.find((v) => v && typeof v.lang === 'string' && v.lang.toLowerCase() === lang)
  return (
    byLang(req) ||
    byLang('en-us') ||
    byLang('en-gb') ||
    list.find((v) => v && typeof v.lang === 'string' && v.lang.toLowerCase().startsWith('en')) ||
    null
  )
}

/**
 * 拉取一次 voice 列表；有变化（首次拿到非空）时通知订阅者。
 * 首帧 getVoices() 常为空，靠 voiceschanged 回调再次触发。
 */
function refreshVoices() {
  if (!state.supported) return
  try {
    const list = window.speechSynthesis.getVoices() || []
    if (list.length && list.length !== state.voices.length) {
      state.voices = list
      notify()
    } else if (list.length) {
      state.voices = list
    }
  } catch {
    /* 忽略：某些环境 getVoices 可能抛错 */
  }
}

/** 挂一次 voiceschanged 监听（幂等） */
function ensureListener() {
  if (!state.supported || state.listenerAttached) return
  state.listenerAttached = true
  try {
    const synth = window.speechSynthesis
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', refreshVoices)
    } else {
      // 老浏览器兜底：直接覆盖 onvoiceschanged（全局只有一个 consumer）
      synth.onvoiceschanged = refreshVoices
    }
  } catch {
    /* 忽略 */
  }
  refreshVoices()
}

// 模块加载即尝试就绪一次（有 window 时）
ensureListener()

/**
 * @returns {{ supported: boolean, speaking: boolean, voiceLang: string|null,
 *            speak: (text: string, opts?: {lang?: string, rate?: number}) => void,
 *            cancel: () => void, stop: () => void }}
 */
export function useSpeech() {
  const [, setTick] = useState(0)
  // 本实例最近一次朗读的文本，用于判定 speaking（哪个按钮在播）
  const textRef = useRef(null)

  useEffect(() => {
    const fn = () => setTick((x) => x + 1)
    subscribers.add(fn)
    // 组件挂载时 voice 可能刚就绪
    ensureListener()
    refreshVoices()
    return () => {
      subscribers.delete(fn)
    }
  }, [])

  const speak = useCallback((text, opts) => {
    if (!state.supported) return
    const t = String(text == null ? '' : text).trim()
    if (!t) return
    const synth = window.speechSynthesis

    // 同一文本正在播 → 视为「停止」
    if (state.activeText === t) {
      try {
        synth.cancel()
      } catch {
        /* 忽略 */
      }
      state.activeText = null
      notify()
      return
    }

    // 清空队列，避免连点叠加
    try {
      synth.cancel()
    } catch {
      /* 忽略 */
    }

    const lang = (opts && opts.lang) || 'en-US'
    const rate = opts && typeof opts.rate === 'number' ? opts.rate : 0.9

    let u
    try {
      u = new window.SpeechSynthesisUtterance(t)
    } catch {
      return
    }
    u.lang = lang
    u.rate = rate
    const voice = pickVoice(state.voices, lang)
    if (voice) u.voice = voice

    textRef.current = t
    state.activeText = t

    u.onend = () => {
      if (state.activeText === t) {
        state.activeText = null
        notify()
      }
    }
    // 播放失败：静默复位，不向控制台抛错
    u.onerror = () => {
      if (state.activeText === t) {
        state.activeText = null
        notify()
      }
    }

    try {
      synth.speak(u)
      notify()
    } catch {
      state.activeText = null
      notify()
    }
  }, [])

  const cancel = useCallback(() => {
    if (!state.supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* 忽略 */
    }
    state.activeText = null
    textRef.current = null
    notify()
  }, [])

  const voice = pickVoice(state.voices, 'en-US')

  return {
    supported: state.supported,
    speaking: state.activeText != null && state.activeText === textRef.current,
    voiceLang: voice ? voice.lang : null,
    speak,
    cancel,
    stop: cancel,
  }
}

/** 直接暴露选声函数，便于单测（纯函数，无副作用） */
export { pickVoice }

export default useSpeech

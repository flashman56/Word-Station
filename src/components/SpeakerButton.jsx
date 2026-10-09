/**
 * SpeakerButton —— 通用「点喇叭朗读」按钮
 * ------------------------------------------------------------------
 * 三态：可用 / 播放中（图标变化）/ 不可用或 voice 加载中（disabled + title）。
 * 4 个展示位置（WordDetail 词头 / WordRow 列表行 / StudyCard 学习卡 / MorphDetail 词群行）
 * 共用同一实现，底层都走 useSpeech()（模块级共享 voice 缓存 + 单例监听）。
 *
 * 事件隔离：默认 stopPropagation=true —— 点喇叭不会触发所在行的选中 / 多选。
 *
 * ★ 音标红线：本组件只朗读文本，不产出 / 存储任何音标。
 *
 * props:
 *   text             要朗读的文本（通常 word.form）—— 必填
 *   size             'xs' | 'sm' | 'md'，默认 'sm'
 *   rate             语速，默认 0.85
 *   lang             语言，默认 'en-US'
 *   stopPropagation  是否阻止冒泡，默认 true（列表行内用）
 *   className        追加类名
 *   title            自定义 title（缺省按状态自动生成）
 */
import React from 'react'
import { useSpeech } from '../hooks/useSpeech.js'

/** 尺寸 → 类名（显式列举，避免 Tailwind 动态类名被 purge） */
const SIZE_CLASS = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
}

/** 图标像素尺寸 */
const ICON_SIZE = { xs: 12, sm: 15, md: 20 }

/**
 * 喇叭图标：播放中显示「声波」，静止显示「静音喇叭」轮廓。
 * @param {{ speaking: boolean, px: number }} props
 */
function SpeakerIcon({ speaking, px }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 喇叭主体（两态共用） */}
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {speaking ? (
        <>
          {/* 播放中：向外声波 */}
          <path d="M15.5 8.5a5 5 0 0 1 0 7" className="animate-pulse" />
          <path d="M18.5 6a9 9 0 0 1 0 12" className="animate-pulse" />
        </>
      ) : (
        <>
          {/* 静止：一道短声波 */}
          <path d="M15.5 9a4 4 0 0 1 0 6" />
        </>
      )}
    </svg>
  )
}

export default function SpeakerButton({
  text,
  size = 'sm',
  rate = 0.85,
  lang = 'en-US',
  stopPropagation = true,
  className = '',
  title,
}) {
  const { supported, voicesReady, speaking, speak } = useSpeech()
  const label = String(text == null ? '' : text)
  const enabled = supported && (voicesReady || speaking)

  const handleClick = (e) => {
    if (stopPropagation) e.stopPropagation()
    if (!enabled) return
    speak(label, { lang, rate })
  }

  const tip = !supported
    ? '当前环境不支持语音朗读'
    : speaking
      ? `停止朗读「${label}」`
      : !voicesReady
        ? '英语语音引擎正在加载，请稍候'
        : title || `朗读「${label}」`

  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.sm
  const px = ICON_SIZE[size] || ICON_SIZE.sm

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!enabled}
      title={tip}
      aria-label={tip}
      className={`inline-flex items-center justify-center rounded shrink-0 align-middle ${sizeClass} ${
        enabled
          ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
          : 'text-slate-300 cursor-not-allowed'
      } ${speaking ? 'text-blue-600 bg-blue-50' : ''} ${className}`}
    >
      <SpeakerIcon speaking={speaking} px={px} />
    </button>
  )
}

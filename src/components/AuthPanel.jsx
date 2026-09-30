import React, { useEffect, useState } from 'react'

/**
 * 账号面板：注册 / 登录 / 登出 / 找回密码（邮箱 + 密码，Supabase Auth）
 *
 * props:
 *   auth  useAuth() 的返回值
 *
 * 未配置 Supabase 或未登录时显示游客态，不阻塞任何本地功能。
 */
export default function AuthPanel({ auth }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [open, setOpen] = useState(false)

  // 登录成功后自动收起面板
  useEffect(() => {
    if (auth.user && open) setOpen(false)
  }, [auth.user, open])

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'signin') await auth.signIn(email, password)
    else if (mode === 'signup') await auth.signUp(email, password)
    else await auth.resetPassword(email)
  }

  if (auth.user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          {auth.email}
        </span>
        <button
          onClick={() => auth.signOut()}
          disabled={auth.busy}
          className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          {auth.busy ? '…' : '登出'}
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">游客模式（进度仅存本机）</span>
        <button
          onClick={() => setOpen(true)}
          className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          登录 / 注册
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={submit} className="flex items-center gap-1.5 text-xs">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          autoComplete="email"
          className="w-44 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
        />
        {mode !== 'reset' && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（≥6 位）"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-36 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
          />
        )}
        <button
          type="submit"
          disabled={auth.busy}
          className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {auth.busy ? '处理中…' : mode === 'signin' ? '登录' : mode === 'signup' ? '注册' : '发邮件'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          {mode === 'signin' ? '注册' : '登录'}
        </button>
        {mode !== 'reset' && (
          <button
            type="button"
            onClick={() => setMode('reset')}
            className="px-2 py-1 text-slate-400 hover:text-blue-600"
          >
            忘记密码
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="px-1 text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </form>
      {auth.error && <div className="absolute right-0 top-full mt-1 z-20 w-72 px-2 py-1.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">{auth.error}</div>}
      {auth.notice && !auth.error && (
        <div className="absolute right-0 top-full mt-1 z-20 w-72 px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {auth.notice}
        </div>
      )}
    </div>
  )
}

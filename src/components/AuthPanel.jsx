import React, { useEffect, useState } from 'react'

/**
 * 账号面板：注册 / 登录 / 登出 / 找回密码（邮箱 + 密码，Supabase Auth）
 *
 * 未配置 Supabase 或未登录时显示游客态，不阻塞任何本地功能。
 *
 * props:
 *   auth           useAuth() 的返回值
 *   beforeSignOut  () => Promise<boolean>（Q7，可选）
 *                  登出前的收尾钩子：先把 dirty 推上去、把草稿补传。
 *                  返回 false 表示「还没准备好，先别登出」—— 用户点取消时
 *                  保持在登录态，不丢任何未上传的东西。
 *   pendingCount   未上传条数（可选）：>0 时点登出会多问一次
 *   pendingStuck   传不上去的条数（可选）：并入提示，让用户知道登出后它们仍在本地
 *   manualInherited 手工标注继承条数（可选，U3）：>0 时说明「换账号也会继承」
 */
export default function AuthPanel({
  auth,
  beforeSignOut = null,
  pendingCount = 0,
  pendingStuck = 0,
  manualInherited = 0,
}) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // 登录成功后自动收起面板
  useEffect(() => {
    if (auth.user && open) setOpen(false)
  }, [auth.user, open])

  /**
   * U3：设备级 v1 手工标注的归属说明。
   *
   * 它是**设备级**源数据，所以同一台电脑上换账号也会被继承 —— 这不是 bug，
   * 是有意保留的语义（铁律：v1 键只读、永不删除）。但用户看到「我的进度怎么
   * 跑到另一个账号了」会以为出了故障，所以登出确认里把这半句说清楚。
   * 继承数为 0 时不显示这半句（没有可继承的东西，提了纯噪音）。
   */
  const u3Note =
    manualInherited > 0 ? `这台电脑上已手工标注过的 ${manualInherited} 个词会作为初始词表被继承。` : ''

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'signin') await auth.signIn(email, password)
    else if (mode === 'signup') await auth.signUp(email, password)
    else await auth.resetPassword(email)
  }

  /**
   * 登出（Q7）：先把该传的传完，再确认要不要真的登出。
   * 顺序很重要 —— 先问后 flush。用户点「取消」就什么都不要发生；
   * 反过来（先 flush 再问）会让用户取消也已经把数据推出去了。
   */
  const handleSignOut = async () => {
    // ① 有未上传内容 → 先问一次（Q7）。取消则中止登出。
    const total = pendingCount + pendingStuck
    if (total > 0) {
      const stuckNote = pendingStuck > 0 ? `\n其中 ${pendingStuck} 条暂时传不上去，会留在这台电脑上。` : ''
      const msg =
        `还有 ${pendingCount} 条改动没上传完，现在登出会留在本机。\n` +
        `建议先等它们传完再登出。\n${stuckNote}\n` +
        (u3Note ? `\n${u3Note}\n` : '\n') +
        '确定要登出吗？'
      if (!window.confirm(msg)) return
    }
    // ② 收尾钩子：推 dirty + 补传草稿。返回 false 表示还没准备好。
    if (beforeSignOut) {
      setSigningOut(true)
      try {
        const ok = await beforeSignOut()
        if (ok === false) {
          setSigningOut(false)
          return
        }
      } catch {
        // 收尾失败不阻塞登出：用户要的是登出，卡住他更糟
      }
      setSigningOut(false)
    }
    await auth.signOut()
  }

  if (auth.user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span
          className="hidden sm:inline px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
          title={u3Note ? `登出提示：${u3Note}` : undefined}
        >
          {auth.email}
        </span>
        <button
          onClick={handleSignOut}
          disabled={auth.busy || signingOut}
          title={u3Note ? `登出提示：${u3Note}` : undefined}
          className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          {auth.busy || signingOut ? '…' : '登出'}
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="hidden sm:inline text-slate-400">游客模式（进度仅存本机）</span>
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

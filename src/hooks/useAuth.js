/**
 * 账号会话：注册 / 登录 / 登出 / 找回密码
 * ------------------------------------------------------------------
 * 邮箱 + 密码（Supabase Auth）。未配置 Supabase 或未登录 → isGuest = true，
 * 组件不得假设 user 非空（PRD R-01 / 设计 §10.13 游客模式）。
 */
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * @param {string} email
 * @returns {string|null} 不合法时返回中文提示
 */
function checkEmail(email) {
  const v = String(email ?? '').trim()
  if (!v) return '请填写邮箱'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '邮箱格式不正确'
  return null
}

/**
 * @param {string} password
 * @returns {string|null}
 */
function checkPassword(password) {
  const v = String(password ?? '')
  if (v.length < 6) return '密码至少 6 位'
  return null
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })
    return () => {
      alive = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const run = useCallback(async (fn) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      return await fn()
    } finally {
      setBusy(false)
    }
  }, [])

  /**
   * 邮箱 + 密码注册。
   * 注意：Supabase 默认开启邮箱验证，未验证时登录会报 "Email not confirmed"，
   * 这里给出明确提示而不是静默失败。
   */
  const signUp = useCallback(
    async (email, password) => {
      const bad = checkEmail(email) || checkPassword(password)
      if (bad) {
        setError(bad)
        return { ok: false, error: bad }
      }
      if (!supabase) {
        setError('未配置 Supabase，无法注册')
        return { ok: false, error: '未配置 Supabase' }
      }
      return run(async () => {
        const { data, error: err } = await supabase.auth.signUp({
          email: String(email).trim(),
          password,
        })
        if (err) {
          setError(err.message)
          return { ok: false, error: err.message }
        }
        if (data?.session) {
          setNotice('注册成功，已自动登录')
          return { ok: true, needConfirm: false }
        }
        setNotice('注册成功：请先到邮箱点确认链接，再回来登录（也可在 Supabase 后台关闭邮箱验证）')
        return { ok: true, needConfirm: true }
      })
    },
    [run],
  )

  const signIn = useCallback(
    async (email, password) => {
      const bad = checkEmail(email) || checkPassword(password)
      if (bad) {
        setError(bad)
        return { ok: false, error: bad }
      }
      if (!supabase) {
        setError('未配置 Supabase，无法登录')
        return { ok: false, error: '未配置 Supabase' }
      }
      return run(async () => {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: String(email).trim(),
          password,
        })
        if (err) {
          const msg = /not confirmed/i.test(err.message || '')
            ? '邮箱尚未验证，请先到邮箱点确认链接'
            : /invalid login/i.test(err.message || '')
              ? '邮箱或密码不正确'
              : err.message
          setError(msg)
          return { ok: false, error: msg }
        }
        setUser(data?.user ?? null)
        setSession(data?.session ?? null)
        setNotice('登录成功')
        return { ok: true }
      })
    },
    [run],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return { ok: true }
    return run(async () => {
      const { error: err } = await supabase.auth.signOut()
      if (err) {
        setError(err.message)
        return { ok: false, error: err.message }
      }
      setUser(null)
      setSession(null)
      setNotice('已登出（本地进度保留）')
      return { ok: true }
    })
  }, [run])

  /** 找回密码：发重置邮件 */
  const resetPassword = useCallback(
    async (email) => {
      const bad = checkEmail(email)
      if (bad) {
        setError(bad)
        return { ok: false, error: bad }
      }
      if (!supabase) {
        setError('未配置 Supabase')
        return { ok: false, error: '未配置 Supabase' }
      }
      return run(async () => {
        const { error: err } = await supabase.auth.resetPasswordForEmail(String(email).trim())
        if (err) {
          setError(err.message)
          return { ok: false, error: err.message }
        }
        setNotice('重置密码邮件已发送，请查收')
        return { ok: true }
      })
    },
    [run],
  )

  return {
    user,
    session,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    isGuest: !user,
    loading,
    busy,
    error,
    notice,
    clearError: useCallback(() => setError(null), []),
    clearNotice: useCallback(() => setNotice(null), []),
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}

export default useAuth

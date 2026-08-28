'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 💡 直接使用全站 Theme Provider 的狀態與切換函式
  const { theme, setTheme } = useTheme()

  // 步驟 1：帳密驗證
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStep(2)
      } else {
        setError(data.message || '帳號或密碼錯誤')
      }
    } catch (err) {
      setError('伺服器連線失敗')
    } finally {
      setLoading(false)
    }
  }

  // 步驟 2：2FA 驗證
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        window.location.replace('/admin')
      } else {
        const data = await res.json()
        setError(data.error || '驗證碼錯誤或已過期')
      }
    } catch (err) {
      setError('伺服器連線失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 relative">

      {/* 登入卡片：直接使用 Tailwind 的 dark: 類別相容全站 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 transition-colors duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-500">
            {step === 1 ? '🔒 後台管理員登入' : '📱 二次身份驗證 (2FA)'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {step === 1 ? '請輸入管理帳號與密碼' : '請輸入 Authenticator 6 位數動態碼'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                管理員帳號
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                管理員密碼
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? '驗證中...' : '下一步 (2FA 驗證)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                6 位數驗證碼
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="例：123456"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? '驗證中...' : '確認登入'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="w-full text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition text-center pt-2 block"
            >
              ← 返回輸入帳密
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
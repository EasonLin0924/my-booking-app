'use client'

import { useTheme } from '@/app/providers'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition border border-stone-200 dark:border-stone-700"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? '☀️ 淺色模式' : '🌙 深色模式'}
    </button>
  )
}
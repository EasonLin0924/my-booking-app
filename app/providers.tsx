'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 尚未在 Client 端 Mount 前先不渲染 ThemeProvider，避開腳本注入警示
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
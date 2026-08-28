'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 左側：民宿名稱 / 品牌標題 */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏝️</span>
          <span className="font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition">
            A路小琉球民宿
          </span>
        </Link>

        {/* 右側：導覽連結與深淺色切換按鈕 */}
        <div className="flex items-center gap-3 sm:gap-4">

          
          {/* 深淺色模式切換按鈕 */}
          <ThemeToggle />
        </div>

      </div>
    </header>
  )
}
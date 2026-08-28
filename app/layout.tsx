import './globals.css'
import Providers from '@/app/providers'
import Navbar from '@/components/Navbar' // 👈 1. 引入 Navbar

export const metadata = {
  title: 'A路小琉球民宿',
  description: '小琉球優質旅宿與行程預訂',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="dark" suppressHydrationWarning>
      <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen flex flex-col transition-colors duration-300">
        <Providers>
          {/* 👈 2. 常駐導覽列（包含標題與深淺色按鈕） */}
          <Navbar />
          
          {/* 主要頁面內容 */}
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
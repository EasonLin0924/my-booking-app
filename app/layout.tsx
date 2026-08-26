import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'A路小琉球民宿 ⧗ A·road B&B',
  description: '線上訂房管理系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      {/* 讓 body 負責全站底色，完全滿版延伸 */}
      <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
'use client'

import { useEffect, useState } from 'react'

export default function Setup2FAPage() {
  const [data, setData] = useState<{ base32Secret: string; qrCodeUrl: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/generate-2fa')
      .then((res) => res.json())
      .then((resData) => setData(resData))
  }, [])

  if (!data) return <div className="p-8 text-center">載入 2FA 數據中...</div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-md w-full text-center">
        <h1 className="text-xl font-bold mb-4">綁定 Google Authenticator</h1>
        
        <p className="text-sm text-stone-500 mb-6">
          請用手機開啟 Google Authenticator 或 Authenticator App，掃描下方 QR Code：
        </p>

        {/* 渲染 QR Code 圖片 */}
        <div className="flex justify-center mb-6">
          <img src={data.qrCodeUrl} alt="2FA QR Code" className="w-56 h-56 border-4 border-white rounded-xl shadow" />
        </div>

        <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg text-xs font-mono break-all mb-4">
          <p className="text-stone-400 mb-1">或手動輸入金鑰：</p>
          <span className="text-amber-500 font-bold select-all">{data.base32Secret}</span>
        </div>

        <p className="text-xs text-stone-400">
          掃描完成後，請將金鑰貼入 <code className="text-amber-500">.env.local</code> 的 <code className="text-amber-500">ADMIN_2FA_SECRET</code> 欄位中。
        </p>
      </div>
    </div>
  )
}
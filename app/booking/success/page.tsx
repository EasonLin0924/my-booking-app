'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-stone-900 border border-amber-500/30 rounded-2xl text-center space-y-6 shadow-2xl text-stone-100">
      <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
        ✓
      </div>
      <div>
        <h1 className="text-2xl font-bold text-amber-500">訂房成功！</h1>
        <p className="text-stone-400 text-sm mt-2">我們已收到您的預訂需求，期待您的光臨。</p>
        {bookingId && (
          <p className="text-xs text-stone-500 mt-1 font-mono">訂單編號：#{bookingId}</p>
        )}
      </div>
      
      <div className="pt-4 border-t border-stone-800">
        <button
          onClick={() => router.push('/')}
          className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-3 rounded-xl font-bold text-sm transition"
        >
          返回首頁
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-amber-500">載入中...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
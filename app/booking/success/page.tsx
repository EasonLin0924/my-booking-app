'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type AddonItem = {
  id: string
  name: string
  count: number
  price: number
  subtotal: number
}

type BookingDetail = {
  id: number
  created_at: string
  check_in: string
  check_out: string
  room_count: number
  guest_name: string
  guest_phone: string
  adults: number
  children: number
  room_total_price: number
  addons_total_price: number
  grand_total_price: number
  selected_addons: AddonItem[]
  rooms?: { name: string }
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const supabase = createClient()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('bookings')
        .select('*, rooms(name)')
        .eq('id', bookingId)
        .single()

      if (data) setBooking(data as BookingDetail)
      setLoading(false)
    }

    fetchBooking()
  }, [bookingId])

  // 複製訂單編號
  const handleCopyId = () => {
    if (!booking) return
    navigator.clipboard.writeText(`#${booking.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 產生一鍵加 LINE 的專屬連結 (自動帶入對話內容)
  const getLineUrl = () => {
    if (!booking) return '#'
    const lineId = '@aroad2020' // 💡 請替換為您的官方 LINE ID
    const msg = 
      `你好！我已完成線上訂房：\n` +
      `-------------------\n` +
      `【訂單編號】#${booking.id}\n` +
      `【聯絡姓名】${booking.guest_name}\n` +
      `【房型】${booking.rooms?.name || '客房'}\n` +
      `【入住日期】${booking.check_in} ～ ${booking.check_out} (${booking.room_count}間)\n` +
      `【總預估金額】NT$ ${booking.grand_total_price.toLocaleString()}\n` +
      `-------------------\n` +
      `我想確認匯款與後續入住細節！`

    return `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent(msg)}`
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold">
        正在載入您的訂單資訊...
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">查無此訂單紀錄</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm">請確認您的訂單連結是否正確。</p>
        <Link
          href="/"
          className="mt-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl transition shadow-md"
        >
          返回首頁
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      
      {/* 頂部成功打勾 Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">預訂申請已送出！</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-md mx-auto">
          感謝您的預訂。請完成下方轉帳並加 LINE 聯繫管家對帳，我們將儘速為您保留房間！
        </p>
      </div>

      {/* 1. 主行動呼籲區塊 (一鍵 LINE 與電話) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-md dark:shadow-none transition-colors">
        <h2 className="text-base font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
          📲 快速聯繫民宿管家
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          點擊下方按鈕將自動打開 LINE，並帶入您的預訂資訊，無需手動打字！
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 一鍵加 LINE 按鈕 */}
          <a
            href={getLineUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md text-sm"
          >
            💬 加 LINE 聯絡管家 (帶入訂單)
          </a>

          {/* 一鍵撥打電話按鈕 */}
          <a
            href="tel:0912345678" // 💡 請替換為您的民宿聯絡電話
            className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-3.5 px-4 rounded-xl transition border border-stone-200 dark:border-stone-700 text-sm"
          >
            📞 直接撥打管家電話
          </a>
        </div>
      </div>

      {/* 2. 訂單明細卡片 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none transition-colors">
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">訂單編號</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">#{booking.id}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-lg font-bold transition border border-stone-200 dark:border-stone-700"
          >
            {copied ? '✓ 已複製' : '📋 複製編號'}
          </button>
        </div>

        {/* 預訂基本資料 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-stone-400 dark:text-stone-500">預訂房型</p>
            <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
              {booking.rooms?.name || '指定房型'} ({booking.room_count} 間)
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-stone-400 dark:text-stone-500">入住／退房日期</p>
            <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
              {booking.check_in} ➔ {booking.check_out}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-stone-400 dark:text-stone-500">聯絡人</p>
            <p className="font-bold text-stone-800 dark:text-stone-200">
              {booking.guest_name} ({booking.guest_phone})
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-stone-400 dark:text-stone-500">入住人數</p>
            <p className="font-bold text-stone-800 dark:text-stone-200">
              {booking.adults} 大 {booking.children > 0 && `/ ${booking.children} 小`}
            </p>
          </div>
        </div>

        {/* 加購行程明細 (若有) */}
        {booking.selected_addons && booking.selected_addons.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-2">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">加購體驗項目：</p>
            <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800/80">
              {booking.selected_addons.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-stone-700 dark:text-stone-300">
                  <span>{item.name} × {item.count}</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">NT$ {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 費用結算 */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
            <span>房間費用小計</span>
            <span className="font-mono">NT$ {booking.room_total_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
            <span>加購行程小計</span>
            <span className="font-mono">NT$ {booking.addons_total_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 dark:border-stone-800">
            <span className="text-base font-bold text-stone-900 dark:text-stone-100">預估應付總額</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              NT$ {booking.grand_total_price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 轉帳對帳資訊卡片 */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          🏦 匯款對帳資訊
        </h3>
        <div className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 leading-relaxed font-mono">
          <p>銀行名稱：<strong className="text-stone-900 dark:text-stone-100">中華郵政 (700)</strong></p>
          <p>戶名：<strong className="text-stone-900 dark:text-stone-100">A路小琉球民宿</strong></p>
          <p>帳號：<strong className="text-stone-900 dark:text-stone-100">0041234 5678901</strong></p>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-amber-500/20">
          💡 請於下單後 <strong className="text-amber-600 dark:text-amber-400">1 小時內</strong> 完成匯款，並加 LINE 告知管家「帳號末五碼」，我們將於核對後為您確認保留房間！
        </p>
      </div>

      {/* 返回首頁 */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 underline transition"
        >
          ← 返回民宿首頁
        </Link>
      </div>

    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-amber-500">載入預訂資料中...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
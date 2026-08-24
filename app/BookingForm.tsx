'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Room = {
  id: number
  name: string
  base_price: number
  total_stock: number
}

export default function BookingForm({ room }: { room: Room }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  // 取得今天日期 YYYY-MM-DD 作為入住最小限制
  const todayStr = new Date().toISOString().split('T')[0]

  // 退房最小限制為入住日期的隔天
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr

  function validatePhone(phone: string) {
    return /^[0-9-]{8,12}$/.test(phone)
  }

  async function handleSubmit() {
    setMessage(null)

    if (!checkIn || !checkOut || !guestName || !guestPhone) {
      setMessage({ type: 'error', text: '請填寫完整訂房資料' })
      return
    }
    if (checkIn >= checkOut) {
      setMessage({ type: 'error', text: '退房日期必須晚於入住日期' })
      return
    }
    if (!validatePhone(guestPhone)) {
      setMessage({ type: 'error', text: '請輸入正確的電話號碼（僅限數字與 -，8~12 碼）' })
      return
    }

    setLoading(true)

    // 檢查重疊訂單（Overlapping Check）
    const { data: overlapping, error: queryError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room.id)
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    if (queryError) {
      setMessage({ type: 'error', text: '查詢空房失敗：' + queryError.message })
      setLoading(false)
      return
    }

    const bookedCount = overlapping?.length || 0
    const remaining = room.total_stock - bookedCount

    if (remaining <= 0) {
      setMessage({ type: 'error', text: '該區間已無剩餘空房，請選擇其他日期' })
      setLoading(false)
      return
    }

    // 新增訂單記錄
    const { error: insertError } = await supabase.from('bookings').insert({
      room_id: room.id,
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      check_in: checkIn,
      check_out: checkOut,
    })

    setLoading(false)

    if (insertError) {
      setMessage({ type: 'error', text: '訂房失敗：' + insertError.message })
      return
    }

    setMessage({ type: 'success', text: '🎉 訂房成功！我們會盡快與您聯繫確認。' })
    setCheckIn('')
    setCheckOut('')
    setGuestName('')
    setGuestPhone('')
  }

  return (
    <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
      {/* 日期選擇區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">入住日期</label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value)
              if (checkOut && e.target.value >= checkOut) {
                setCheckOut('')
              }
            }}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">退房日期</label>
          <input
            type="date"
            min={minCheckOut}
            disabled={!checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]"
          />
        </div>
      </div>

      {/* 聯絡人資訊 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">姓名</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="請輸入姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">聯絡電話</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="例如：0912345678"
          />
        </div>
      </div>

      {/* 送出按鈕 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-lg py-2.5 transition duration-150 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {loading ? '處理中...' : '確認訂房'}
      </button>

      {/* 訊息提示 */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-950/50 border-green-800 text-green-300'
              : 'bg-red-950/50 border-red-800 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
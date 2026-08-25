'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// 加購項目清單
const ADDON_OPTIONS = [
  { id: 'bbq', name: '🔥 BBQ', price: 400, unit: '人' },
  { id: 'scuba', name: '🤿 體驗潛水', price: 2500, unit: '人' },
  { id: 'snorkeling', name: '🐠 浮潛', price: 400, unit: '人' },
  { id: 'canoe', name: '🛶 獨木舟', price: 600, unit: '人' },
  { id: 'night_tour', name: '🌙 潮間帶／夜間導覽', price: 150, unit: '人' },
  { id: 'sup_1', name: '🏄 SUP 立式划槳 (1人1板)', price: 1200, unit: '板' },
  { id: 'sup_2', name: '🏄 SUP 立式划槳 (2人1板)', price: 950, unit: '板' },
  { id: 'surf_1', name: '🌊 水上衝浪板 (1人1板)', price: 600, unit: '板' },
  { id: 'surf_2', name: '🌊 水上衝浪板 (2人1板)', price: 800, unit: '板' },
  { id: 'sub_adult', name: '🚢 探索拉美半潛艇 (全票)', price: 350, unit: '人' },
  { id: 'sub_half', name: '🚢 探索拉美半潛艇 (半票)', price: 250, unit: '人' },
  { id: 'sub_child', name: '🚢 探索拉美半潛艇 (幼兒)', price: 60, unit: '人' },
]

function BookingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const roomId = searchParams.get('room')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  
  // 抓取網址傳進來的間數 (rooms)，預設為 1 間
  const roomCountParam = searchParams.get('rooms')
  const roomCount = roomCountParam ? Math.max(1, parseInt(roomCountParam, 10)) : 1

  // 房型與房費 State
  const [roomName, setRoomName] = useState('載入中...')
  const [roomImg, setRoomImg] = useState('')
  const [roomTotalPrice, setRoomTotalPrice] = useState<number>(0)
  const [nights, setNights] = useState<number>(0)

  // 聯絡人與人數 State
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  // 加購項目 State (紀錄數量)
  const [addons, setAddons] = useState<Record<string, number>>({})

  // 1. 撈取房型名稱、圖片並計算「乘上間數後的總房費」
  useEffect(() => {
    async function fetchRoomAndPrice() {
      if (!roomId || !checkIn || !checkOut) return

      // 撈房型資訊
      const { data: room } = await supabase.from('rooms').select('name, base_price').eq('id', roomId).single()
      if (room) {
        setRoomName(room.name)

        // 動態設定圖片
        if (room.name.includes('雙人')) {
          setRoomImg('/images/rooms/view-double.jpg')
        } else if (room.name.includes('四人')) {
          setRoomImg('/images/rooms/family-quad.jpg')
        } else {
          setRoomImg('https://images.unsplash.com/photo-1551882547-ff40c0dfe09a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
        }

        // 撈取特殊房價設定
        const { data: customPrices } = await supabase.from('room_prices').select('date, price').eq('room_id', roomId)
        const priceMap: Record<string, number> = {}
        customPrices?.forEach((p) => { priceMap[p.date] = p.price })

        // 逐日加總單間房費
        let singleRoomTotal = 0
        let count = 0
        let curr = new Date(checkIn)
        const end = new Date(checkOut)

        while (curr < end) {
          const y = curr.getFullYear()
          const m = String(curr.getMonth() + 1).padStart(2, '0')
          const d = String(curr.getDate()).padStart(2, '0')
          const dateStr = `${y}-${m}-${d}`

          singleRoomTotal += priceMap[dateStr] !== undefined ? priceMap[dateStr] : room.base_price
          count++
          curr.setDate(curr.getDate() + 1)
        }

        // 關鍵：將單間總房費乘以房間間數 (roomCount)
        setRoomTotalPrice(singleRoomTotal * roomCount)
        setNights(count)
      }
    }

    fetchRoomAndPrice()
  }, [roomId, checkIn, checkOut, roomCount])

  // 電話輸入過濾：只保留數字，限制最多 10 碼
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const cleanedValue = rawValue.replace(/\D/g, '').slice(0, 10)
    setGuestPhone(cleanedValue)
  }

  // 驗證台灣電話格式 (手機 09 開頭 10 碼，或市話 9~10 碼)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/
    return phoneRegex.test(phone)
  }

  // 更新加購數量
  const updateAddon = (id: string, delta: number) => {
    setAddons((prev) => {
      const current = prev[id] || 0
      const next = current + delta
      if (next < 0) return prev
      return { ...prev, [id]: next }
    })
  }

  // 篩選出已選取的加購項目明細
  const selectedAddonList = ADDON_OPTIONS.map((item) => ({
    ...item,
    count: addons[item.id] || 0,
    total: (addons[item.id] || 0) * item.price,
  })).filter((item) => item.count > 0)

  // 計算加購總額
  const addonsTotal = selectedAddonList.reduce((sum, item) => sum + item.total, 0)

  // 最終總金額 (房費 + 加購)
  const grandTotal = roomTotalPrice + addonsTotal

  // 送出訂單處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!guestName.trim()) {
      alert('請填寫聯絡人姓名！')
      return
    }

    if (!validatePhone(guestPhone)) {
      alert('⚠️ 請輸入有效的台灣電話號碼！\n例如：手機 0912345678 或 市話 071234567')
      return
    }

    const addonsData = selectedAddonList.map((item) => ({
      id: item.id,
      name: item.name,
      count: item.count,
      price: item.price,
      subtotal: item.total,
    }))

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          room_id: Number(roomId),
          check_in: checkIn,
          check_out: checkOut,
          room_count: roomCount,
          guest_name: guestName,
          guest_phone: guestPhone,
          adults: adults,
          children: children,
          room_total_price: roomTotalPrice,
          addons_total_price: addonsTotal,
          grand_total_price: grandTotal,
          selected_addons: addonsData,
        },
      ])
      .select('id')
      .single()

    if (error) {
      alert('訂房失敗：' + error.message)
      return
    }

    router.push(`/booking/success?bookingId=${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 text-stone-100">
      {/* 標題 */}
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-3xl font-bold text-amber-500">確認訂房與加購行程</h1>
        <p className="text-stone-400 mt-1">請核對您的預訂資訊，並填寫聯絡人資料。</p>
      </div>

      {/* 左右雙欄佈局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= 左側：資料填寫與加購選項 (7 欄) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 房型與日期卡片 */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
            {roomImg ? (
              <img src={roomImg} alt="Room" className="w-full sm:w-2/5 h-48 sm:h-auto object-cover" />
            ) : (
              <div className="w-full sm:w-2/5 h-48 sm:h-auto bg-stone-800 animate-pulse flex items-center justify-center">
                <span className="text-stone-500 text-sm">載入圖片中...</span>
              </div>
            )}
            <div className="p-5 flex flex-col justify-center space-y-3 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-100">{roomName}</h2>
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
                  預訂 {roomCount} 間
                </span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex justify-between items-center text-xs">
                <div>
                  <p className="text-stone-500">入住</p>
                  <p className="font-bold text-amber-400 text-base">{checkIn}</p>
                </div>
                <div className="text-stone-600">➔</div>
                <div className="text-right">
                  <p className="text-stone-500">退房 ({nights} 晚)</p>
                  <p className="font-bold text-amber-400 text-base">{checkOut}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 聯絡人與人數填寫 */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
              📝 聯絡人資訊
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-400">聯絡人姓名 *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="如：林大熊"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-400">聯絡人電話 *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={handlePhoneChange}
                  placeholder="如：0912345678"
                  maxLength={10}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                />
                {guestPhone && !validatePhone(guestPhone) && (
                  <p className="text-[11px] text-red-400 mt-1">
                    ✕ 請輸入正確的 10 位手機號碼 (09開頭) 或市話
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-400">大人人數</label>
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-500 font-bold transition">-</button>
                  <div className="flex-1 text-center font-bold text-sm">{adults}</div>
                  <button type="button" onClick={() => setAdults(adults + 1)} className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-500 font-bold transition">+</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-400">小孩人數</label>
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-500 font-bold transition">-</button>
                  <div className="flex-1 text-center font-bold text-sm">{children}</div>
                  <button type="button" onClick={() => setChildren(children + 1)} className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-500 font-bold transition">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* 加購行程區塊 */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2 border-b border-stone-800 pb-3">
              🏄 水上活動與加購體驗
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADDON_OPTIONS.map((addon) => (
                <div key={addon.id} className="flex justify-between items-center bg-stone-950 p-3 rounded-xl border border-stone-800/60 hover:border-amber-900/40 transition">
                  <div>
                    <p className="text-xs font-bold text-stone-200">{addon.name}</p>
                    <p className="text-[11px] text-amber-500 mt-0.5">NT$ {addon.price.toLocaleString()} / {addon.unit}</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-stone-900 rounded-lg p-1 border border-stone-800">
                    <button type="button" onClick={() => updateAddon(addon.id, -1)} className="w-6 h-6 rounded hover:bg-stone-800 text-stone-400 font-bold text-xs transition">-</button>
                    <span className="w-4 text-center text-xs font-bold">{addons[addon.id] || 0}</span>
                    <button type="button" onClick={() => updateAddon(addon.id, 1)} className="w-6 h-6 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 font-bold text-xs transition">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= 右側：固定跟隨的「總結算卡片」(5 欄) ================= */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-xl font-bold text-amber-400 border-b border-stone-800 pb-3">
              💳 費用總計明細
            </h3>

            {/* 房費與基礎統計 */}
            <div className="space-y-2 text-sm text-stone-300">
              <div className="flex justify-between items-center">
                <span>{roomName} ({roomCount} 間 / {nights} 晚)</span>
                <span className="font-mono font-semibold text-amber-400">NT$ {roomTotalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>入住人數</span>
                <span>{adults} 位大人 {children > 0 && ` / ${children} 位小孩`}</span>
              </div>
            </div>

            {/* 加購項目動態列表 */}
            <div className="border-t border-stone-800 pt-3 space-y-2">
              <p className="text-xs font-medium text-stone-400 mb-1">加購體驗明細：</p>

              {selectedAddonList.length === 0 ? (
                <p className="text-xs text-stone-600 italic">尚未選擇任何加購項目</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedAddonList.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-stone-300 bg-stone-950 px-3 py-2 rounded-lg border border-stone-800/50">
                      <span>{item.name} × {item.count}</span>
                      <span className="font-mono text-amber-400/90">NT$ {item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 金額統計總計區塊 */}
            <div className="border-t border-stone-800 pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>房間費用小計 ({roomCount} 間)</span>
                <span className="font-mono">NT$ {roomTotalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>加購行程小計</span>
                <span className="font-mono">NT$ {addonsTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-stone-800/80">
                <span className="text-base font-bold text-stone-100">預估應付總額</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-400 font-mono">
                    NT$ {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 提交按鈕 */}
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 py-3.5 rounded-xl font-bold text-base transition shadow-[0_0_20px_rgba(217,119,6,0.3)] mt-2"
            >
              確認送出訂單
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-amber-500">正在準備您的訂單...</div>}>
      <BookingForm />
    </Suspense>
  )
}
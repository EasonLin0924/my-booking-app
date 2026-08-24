'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Room = { 
  id: number; 
  name: string; 
  base_price: number; 
  total_stock: number;
  close_weekend: boolean; // 新增這行
}
type Booking = { id: number; room_id: number; guest_name: string; guest_phone: string; check_in: string; check_out: string; total_price: number }

export default function AdminPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  
  // 房價房況設定 Form
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1)
  const [targetDate, setTargetDate] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [msg, setMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // 撈房型
    const { data: roomsData } = await supabase.from('rooms').select('*')
    if (roomsData) setRooms(roomsData)

    // 撈訂單
    const { data: bookingsData } = await supabase.from('bookings').select('*').order('id', { ascending: false })
    if (bookingsData) setBookings(bookingsData)
  }
// 切換週末開放/關閉狀態
  async function toggleCloseWeekend(roomId: number, currentStatus: boolean) {
    const { error } = await supabase
      .from('rooms')
      .update({ close_weekend: !currentStatus })
      .eq('id', roomId)

    if (error) {
      alert('切換失敗: ' + error.message)
    } else {
      fetchData() // 重新抓取最新狀態
    }
  }
  // 設定特定日期的特殊房價 (寫入 room_prices)
  async function handleSetPrice() {
  setMsg('')
  if (!targetDate || !customPrice) {
    setMsg('請填寫完整日期與金額')
    return
  }

  // 修改這裡：明確指定以 room_id,date 作為衝突比對目標
  const { error } = await supabase.from('room_prices').upsert(
    {
      room_id: selectedRoomId,
      date: targetDate,
      price: Number(customPrice),
    },
    { 
      onConflict: 'room_id,date'  // 關鍵：告訴 Supabase 遇到同房型同日期就改用 UPDATE
    }
  )

  if (error) {
    setMsg('設定失敗：' + error.message)
  } else {
    setMsg(`✅ 成功將 ${targetDate} 的房價設為 NT$ ${customPrice}`)
    setTargetDate('')
    setCustomPrice('')
  }
}

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-stone-100">
      <h1 className="text-3xl font-bold text-amber-500 border-b border-stone-800 pb-4">
        🛠️ 旅宿後台管理系統
      </h1>

      {/* 快速設定房價與房況區塊 */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-amber-400">快速設定特殊日期房價</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-stone-400 mb-1">選擇房型</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (預設 ${r.base_price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-stone-400 mb-1">指定日期</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-400 mb-1">當日特殊價格 (NT$)</label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="例如: 3800"
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleSetPrice}
          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-6 py-2.5 rounded-lg transition"
        >
          儲存特殊房價
        </button>

        {msg && <p className="text-sm font-medium text-emerald-400 mt-2">{msg}</p>}
      </div>
{/* 房型六日滿房開關設定 */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-amber-400">週末 (六日) 滿房一鍵開關</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 border border-stone-800 rounded-lg bg-stone-950">
              <div>
                <p className="font-bold text-stone-200">{r.name}</p>
                <p className="text-xs mt-1">
                  狀態：{r.close_weekend 
                    ? <span className="text-red-400">🔴 六日已強制滿房</span> 
                    : <span className="text-emerald-400">🟢 六日正常開放</span>}
                </p>
              </div>
              <button
                onClick={() => toggleCloseWeekend(r.id, r.close_weekend)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  r.close_weekend 
                    ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' 
                    : 'bg-red-900/20 text-red-400 hover:bg-red-900/50 border border-red-800/50'
                }`}
              >
                {r.close_weekend ? '重新開放週末' : '一鍵關閉週末'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* 查看最新訂單紀錄 */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-amber-400">所有訂單紀錄 ({bookings.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-3">編號</th>
                <th className="p-3">訂房人</th>
                <th className="p-3">電話</th>
                <th className="p-3">入住日期</th>
                <th className="p-3">退房日期</th>
                <th className="p-3">總金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-800/50">
                  <td className="p-3">#{b.id}</td>
                  <td className="p-3 font-medium text-stone-200">{b.guest_name}</td>
                  <td className="p-3 text-stone-400">{b.guest_phone}</td>
                  <td className="p-3 text-amber-400/90">{b.check_in}</td>
                  <td className="p-3 text-amber-400/90">{b.check_out}</td>
                  <td className="p-3 font-bold text-emerald-400">NT$ {b.total_price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
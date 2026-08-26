'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Room = {
  id: number
  name: string
  base_price: number
  total_stock: number
  close_weekend: boolean
}

type AddonItem = {
  id: string
  name: string
  count: number
  price: number
  subtotal: number
}

type Booking = {
  id: number
  created_at: string
  room_id: number
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

const ADDON_PRICES: Record<string, { name: string; price: number }> = {
  bbq: { name: '🔥 BBQ', price: 400 },
  scuba: { name: '🤿 體驗潛水', price: 2500 },
  snorkeling: { name: '🐠 浮潛', price: 400 },
  canoe: { name: '🛶 獨木舟', price: 600 },
  night_tour: { name: '🌙 潮間帶／夜間導覽', price: 150 },
  sup_1: { name: '🏄 SUP 立式划槳 (1人1板)', price: 1200 },
  sup_2: { name: '🏄 SUP 立式划槳 (2人1板)', price: 950 },
  surf_1: { name: '🌊 水上衝浪板 (1人1板)', price: 600 },
  surf_2: { name: '🌊 水上衝浪板 (2人1板)', price: 800 },
  sub_adult: { name: '🚢 探索拉美半潛艇 (全票)', price: 350 },
  sub_half: { name: '🚢 探索拉美半潛艇 (半票)', price: 250 },
  sub_child: { name: '🚢 探索拉美半潛艇 (幼兒)', price: 60 },
}

export default function AdminPage() {
  const supabase = createClient()

  // 1. 登入驗證 State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authenticating, setAuthenticating] = useState(false)

  // 2. 資料庫 State
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  // 3. 特殊房價設定 State
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0)
  const [customDate, setCustomDate] = useState('')
  const [customPriceInput, setCustomPriceInput] = useState('')
  const [settingPrice, setSettingPrice] = useState(false)

  // 4. 編輯 Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [saving, setSaving] = useState(false)

  // 透過後端 API 驗證帳密（安全）
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticating(true)
    setLoginError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        setLoginError(data.message || '帳號或密碼錯誤！')
      }
    } catch (err) {
      setLoginError('連線失敗，請稍後再試。')
    } finally {
      setAuthenticating(false)
    }
  }

  // 撈取房型與訂單資料
  async function fetchData() {
    setLoading(true)

    const { data: roomsData } = await supabase
      .from('rooms')
      .select('id, name, base_price, total_stock, close_weekend')
      .order('id')

    if (roomsData) {
      setRooms(roomsData)
      if (roomsData.length > 0 && selectedRoomId === 0) {
        setSelectedRoomId(roomsData[0].id)
      }
    }

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, rooms(name)')
      .order('id', { ascending: false })

    if (bookingsData) setBookings(bookingsData as Booking[])

    setLoading(false)
  }

  // 設定每日特殊房價
  const handleSetCustomPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoomId || !customDate) {
      alert('請選擇房型與日期！')
      return
    }

    setSettingPrice(true)
    const priceVal = Number(customPriceInput)

    if (priceVal <= 0 || isNaN(priceVal)) {
      const { error } = await supabase
        .from('room_prices')
        .delete()
        .eq('room_id', selectedRoomId)
        .eq('date', customDate)

      if (error) alert('清除失敗: ' + error.message)
      else alert(`✅ 已恢復 ${customDate} 的預設房價！`)
    } else {
      const { error } = await supabase
        .from('room_prices')
        .upsert(
          { room_id: selectedRoomId, date: customDate, price: priceVal },
          { onConflict: 'room_id,date' }
        )

      if (error) alert('設定失敗: ' + error.message)
      else alert(`✅ 成功將 ${customDate} 的房價調整為 NT$ ${priceVal.toLocaleString()}！`)
    }

    setSettingPrice(false)
    setCustomPriceInput('')
  }

  // 切換週末開關
  async function toggleCloseWeekend(roomId: number, currentStatus: boolean) {
    const { error } = await supabase
      .from('rooms')
      .update({ close_weekend: !currentStatus })
      .eq('id', roomId)

    if (error) alert('切換失敗: ' + error.message)
    else fetchData()
  }

  // 刪除訂單
  async function handleDeleteBooking(bookingId: number) {
    if (!confirm(`確定要取消並刪除編號 #${bookingId} 的訂單嗎？`)) return

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)

    if (error) alert('刪除失敗: ' + error.message)
    else {
      alert('訂單已刪除！')
      fetchData()
    }
  }

  // 開啟編輯視窗
  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking(JSON.parse(JSON.stringify(booking)))
  }

  // 更新編輯中的加購數量
  const handleUpdateAddonCount = (addonId: string, delta: number) => {
    if (!editingBooking) return

    const currentAddons = [...(editingBooking.selected_addons || [])]
    const index = currentAddons.findIndex((a) => a.id === addonId)

    if (index > -1) {
      const newCount = currentAddons[index].count + delta
      if (newCount <= 0) {
        currentAddons.splice(index, 1)
      } else {
        currentAddons[index].count = newCount
        currentAddons[index].subtotal = newCount * currentAddons[index].price
      }
    } else if (delta > 0 && ADDON_PRICES[addonId]) {
      const info = ADDON_PRICES[addonId]
      currentAddons.push({
        id: addonId,
        name: info.name,
        count: 1,
        price: info.price,
        subtotal: info.price,
      })
    }

    const newAddonsTotal = currentAddons.reduce((sum, a) => sum + a.subtotal, 0)
    const newGrandTotal = editingBooking.room_total_price + newAddonsTotal

    setEditingBooking({
      ...editingBooking,
      selected_addons: currentAddons,
      addons_total_price: newAddonsTotal,
      grand_total_price: newGrandTotal,
    })
  }

  // 儲存編輯結果
  const handleSaveBooking = async () => {
    if (!editingBooking) return
    setSaving(true)

    const { error } = await supabase
      .from('bookings')
      .update({
        guest_name: editingBooking.guest_name,
        guest_phone: editingBooking.guest_phone,
        room_count: editingBooking.room_count,
        adults: editingBooking.adults,
        children: editingBooking.children,
        check_in: editingBooking.check_in,
        check_out: editingBooking.check_out,
        addons_total_price: editingBooking.addons_total_price,
        grand_total_price: editingBooking.grand_total_price,
        selected_addons: editingBooking.selected_addons,
      })
      .eq('id', editingBooking.id)

    setSaving(false)

    if (error) {
      alert('更新訂單失敗: ' + error.message)
    } else {
      alert('✅ 訂單更新成功！')
      setEditingBooking(null)
      fetchData()
    }
  }

  // 未登入時顯示登入畫面
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 text-stone-900 dark:text-stone-100 transition-colors"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-500">🔒 後台管理員登入</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">請輸入管理帳號與密碼以繼續</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-lg text-center font-bold">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">管理員帳號</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入帳號"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">管理員密碼</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authenticating}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {authenticating ? '驗證中...' : '驗證並登入'}
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return <div className="p-12 text-center text-amber-500">載入管理後台數據中...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* 頁面標題列 */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-500">旅宿管理後台</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">即時控管每日房價、六日開關與顧客預訂紀錄。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-4 py-2 rounded-lg text-xs font-bold transition border border-stone-200 dark:border-stone-700"
          >
            🔄 重新整理
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition border border-red-500/20"
          >
            🚪 登出
          </button>
        </div>
      </div>

      {/* 1. 每日單獨房價設定區塊 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          📅 日期特殊房價設定 (連假 / 旺季調價)
        </h2>
        <form onSubmit={handleSetCustomPrice} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">選擇房型</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (預設 NT$ {r.base_price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">選擇日期</label>
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">設定當日房價 (留空或 0 恢復預設)</label>
            <input
              type="number"
              placeholder="例：3200"
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={settingPrice}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 px-4 rounded-lg text-sm transition shadow-md disabled:opacity-50"
          >
            {settingPrice ? '儲存中...' : '儲存特殊房價'}
          </button>
        </form>
      </div>

      {/* 2. 房型六日滿房一鍵開關區塊 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          ⚙️ 週末 (六日) 滿房一鍵開關
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-950 transition-colors">
              <div>
                <p className="font-bold text-stone-800 dark:text-stone-200">{r.name}</p>
                <p className="text-xs mt-1">
                  狀態：{r.close_weekend 
                    ? <span className="text-red-500 font-bold">🔴 六日強制滿房</span> 
                    : <span className="text-emerald-600 dark:text-emerald-400 font-bold">🟢 六日正常開放</span>}
                </p>
              </div>
              <button
                onClick={() => toggleCloseWeekend(r.id, r.close_weekend)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                  r.close_weekend 
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:opacity-80' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/30'
                }`}
              >
                {r.close_weekend ? '重新開放週末' : '一鍵關閉週末'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 所有顧客訂單紀錄區塊 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          📋 所有訂單紀錄 ({bookings.length} 筆)
        </h2>

        {bookings.length === 0 ? (
          <p className="text-stone-500 text-sm italic py-8 text-center">目前尚無任何訂單紀錄</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 hover:border-amber-500/40 transition">
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-xs bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold mr-2">
                      #{b.id}
                    </span>
                    <span className="text-base font-bold text-stone-900 dark:text-stone-200 mr-3">
                      {b.rooms?.name || `房型 ID: ${b.room_id}`}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      ({b.room_count} 間 / {b.check_in} ～ {b.check_out})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">總金額</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                      NT$ {(b.grand_total_price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800/60 space-y-1">
                    <p className="text-stone-500 font-medium">👤 聯絡資訊</p>
                    <p className="text-stone-800 dark:text-stone-200 font-bold">{b.guest_name || '未填寫'} ({b.guest_phone || '未填寫'})</p>
                    <p className="text-stone-500 dark:text-stone-400">入住人數：{b.adults || 0} 大 / {b.children || 0} 小</p>
                  </div>

                  <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800/60 space-y-1">
                    <p className="text-stone-500 font-medium">💰 費用拆解</p>
                    <p className="text-stone-600 dark:text-stone-300">房間費用：<span className="font-mono text-stone-900 dark:text-stone-200">NT$ {(b.room_total_price || 0).toLocaleString()}</span></p>
                    <p className="text-stone-600 dark:text-stone-300">加購行程：<span className="font-mono text-amber-600 dark:text-amber-400">NT$ {(b.addons_total_price || 0).toLocaleString()}</span></p>
                  </div>

                  <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800/60 space-y-1">
                    <p className="text-stone-500 font-medium">🏄 加購體驗明細</p>
                    {(!b.selected_addons || b.selected_addons.length === 0) ? (
                      <p className="text-stone-400 dark:text-stone-600 italic">無加購項目</p>
                    ) : (
                      <ul className="space-y-0.5 max-h-20 overflow-y-auto pr-1">
                        {b.selected_addons.map((addon, idx) => (
                          <li key={idx} className="text-stone-700 dark:text-stone-300 flex justify-between">
                            <span>{addon.name} × {addon.count}</span>
                            <span className="font-mono text-amber-600 dark:text-amber-500/80">NT$ {addon.subtotal}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px] text-stone-500 border-t border-stone-200 dark:border-stone-900">
                  <span>下單時間：{new Date(b.created_at).toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold transition"
                    >
                      ✏️ 編輯訂單
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold transition"
                    >
                      取消並刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 彈出式訂單編輯視窗 (Modal) */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-stone-900 dark:text-stone-100 transition-colors">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500">
                ✏️ 編輯訂單 #{editingBooking.id}
              </h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-300 border-l-2 border-amber-500 pl-2">
                顧客與人數資訊
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">姓名</label>
                  <input
                    type="text"
                    value={editingBooking.guest_name}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guest_name: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">電話</label>
                  <input
                    type="text"
                    value={editingBooking.guest_phone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guest_phone: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">預訂間數</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBooking.room_count}
                    onChange={(e) => setEditingBooking({ ...editingBooking, room_count: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">大人</label>
                    <input
                      type="number"
                      min="1"
                      value={editingBooking.adults}
                      onChange={(e) => setEditingBooking({ ...editingBooking, adults: Number(e.target.value) })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">小孩</label>
                    <input
                      type="number"
                      min="0"
                      value={editingBooking.children}
                      onChange={(e) => setEditingBooking({ ...editingBooking, children: Number(e.target.value) })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-300 border-l-2 border-amber-500 pl-2">
                調整加購行程
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(ADDON_PRICES).map(([id, info]) => {
                  const existing = editingBooking.selected_addons?.find((a) => a.id === id)
                  const count = existing ? existing.count : 0

                  return (
                    <div key={id} className="flex justify-between items-center bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800/80 text-xs">
                      <div>
                        <p className="font-bold text-stone-800 dark:text-stone-200">{info.name}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500">NT$ {info.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateAddonCount(id, -1)}
                          className="w-6 h-6 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-400 rounded font-bold"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold">{count}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateAddonCount(id, 1)}
                          className="w-6 h-6 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-400 rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>房間費用 (不可更動)</span>
                <span className="font-mono">NT$ {editingBooking.room_total_price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>加購行程總額</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">NT$ {editingBooking.addons_total_price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>重算後總金額</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono text-base">NT$ {editingBooking.grand_total_price?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveBooking}
                disabled={saving}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold transition shadow-md disabled:opacity-50"
              >
                {saving ? '儲存中...' : '確認變更並儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
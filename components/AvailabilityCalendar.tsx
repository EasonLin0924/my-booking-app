'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import 'react-datepicker/dist/react-datepicker.css'

type CalendarProps = {
  roomId: number
}

type PriceMap = Record<string, number>
type StockMap = Record<string, number>

export default function AvailabilityCalendar({ roomId }: CalendarProps) {
  const router = useRouter()
  const supabase = createClient()

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  
  const [basePrice, setBasePrice] = useState<number>(0)
  const [totalStock, setTotalStock] = useState<number>(0)
  const [closeWeekend, setCloseWeekend] = useState<boolean>(false)
  const [customPrices, setCustomPrices] = useState<PriceMap>({})
  const [bookedCounts, setBookedCounts] = useState<StockMap>({})
  
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  // 1. 初始化撈取基本房型資訊與價格/訂單資料
  useEffect(() => {
    async function loadRoomData() {
      setLoading(true)
      
      // 撈取基本房價與總庫存
      const { data: room } = await supabase
        .from('rooms')
        .select('base_price, total_stock, close_weekend')
        .eq('id', roomId)
        .single()

      if (room) {
        setBasePrice(room.base_price)
        setTotalStock(room.total_stock)
        setCloseWeekend(room.close_weekend || false)
      }

      await fetchCalendarData()
      setLoading(false)
    }

    loadRoomData()
  }, [roomId])

  // 2. 撈取該房型的特殊價格與已訂房數量
  // 2. 撈取該房型的特殊價格與已訂房數量
  async function fetchCalendarData() {
    setFetching(true)

    console.log(`[日曆測試] 正在查詢的房型 ID:`, roomId)

    // 撈取特殊房價
    const { data: prices, error: priceError } = await supabase
      .from('room_prices')
      .select('date, price')
      .eq('room_id', roomId)

    if (priceError) console.error('[日曆測試] 抓房價失敗:', priceError)
    console.log('[日曆測試] 抓到的特殊日期與房價:', prices)

    const priceMap: PriceMap = {}
    prices?.forEach((p) => {
      priceMap[p.date] = p.price
    })
    setCustomPrices(priceMap)

    // 撈取所有已成立訂單以計算每日佔用量
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('room_id', roomId)

    if (bookError) console.error('[日曆測試] 抓訂單失敗:', bookError)
    console.log('[日曆測試] 抓到的所有訂單:', bookings)

    // 計算每一天的已預訂數量
    const countMap: StockMap = {}
    bookings?.forEach((b) => {
      let curr = new Date(b.check_in)
      const end = new Date(b.check_out)
      while (curr < end) {
        const dateStr = curr.toISOString().split('T')[0]
        countMap[dateStr] = (countMap[dateStr] || 0) + 1
        curr.setDate(curr.getDate() + 1)
      }
    })
    setBookedCounts(countMap)
    setFetching(false)
  }

  // 轉格式輔助函式 YYYY-MM-DD
  const formatDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 取得某天的價格
  const getDayPrice = (date: Date) => {
    const str = formatDateStr(date)
    return customPrices[str] !== undefined ? customPrices[str] : basePrice
  }

  // 取得某天的剩餘房間數
  const getRemainingStock = (date: Date) => {
    const str = formatDateStr(date)
    const booked = bookedCounts[str] || 0
    return Math.max(0, totalStock - booked)
  }

  // 判斷日期是否禁用（過去日期或滿房）
  const isDateDisabled = (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 1. 過去日期一律禁用
      if (date < today) return true

      // 2. 六日強制滿房檢查 (getDay() 0 是週日, 6 是週六)
      const dayOfWeek = date.getDay()
      if (closeWeekend && (dayOfWeek === 0 || dayOfWeek === 6)) {
        return true
      }

      // 3. 檢查實際剩餘房數
      return getRemainingStock(date) <= 0
    }

  // 選擇入住/退房區間變更處理
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // 前往訂房頁面帶入參數
  const handleProceedBooking = () => {
    if (!startDate || !endDate) return
    const checkIn = formatDateStr(startDate)
    const checkOut = formatDateStr(endDate)
    router.push(`/booking?room=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  // 自訂日曆格子內的渲染內容 (顯示日期、金額、剩餘房數)
  const renderDayContents = (day: number, date: Date) => {
    const price = getDayPrice(date)
    const remaining = getRemainingStock(date)
    const disabled = isDateDisabled(date)

    return (
      <div className="flex flex-col items-center justify-between h-full py-1 text-xs">
        <span className="font-bold text-sm">{day}</span>
        {!disabled && (
          <>
            <span className="text-[10px] text-amber-400 font-medium">
              ${price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
            </span>
            <span className="text-[9px] text-stone-400">
              餘 {remaining} 間
            </span>
          </>
        )}
        {disabled && <span className="text-[9px] text-stone-600">滿房</span>}
      </div>
    )
  }

  if (loading) {
    return <div className="p-8 text-center text-amber-500">載入房況中...</div>
  }

  return (
    <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-6 text-stone-100 max-w-xl mx-auto space-y-4">
      {/* 切換月份時顯示薄遮罩，維持 DatePicker 不被銷毀 */}
      {fetching && (
        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-xs text-amber-400 font-semibold bg-stone-900 px-3 py-1 rounded-full border border-amber-500/30">
            更新房況中...
          </span>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-stone-800 pb-3">
        <h3 className="text-lg font-bold text-amber-500">房況與即時試算</h3>
        <span className="text-xs text-stone-400">基本房價：NT$ {basePrice.toLocaleString()} / 晚</span>
      </div>

      {/* 互動日曆區 */}
      <div className="flex justify-center custom-calendar-container">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          filterDate={(date) => !isDateDisabled(date)}
          renderDayContents={renderDayContents}
          minDate={new Date()}
        />
      </div>

      {/* 選取結果與按鈕 */}
      {startDate && endDate && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400">已選區間：</p>
            <p className="text-sm font-semibold text-amber-400">
              {formatDateStr(startDate)} ～ {formatDateStr(endDate)}
            </p>
          </div>
          <button
            onClick={handleProceedBooking}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-2 rounded-lg text-sm transition shadow-md"
          >
            前往預約
          </button>
        </div>
      )}
    </div>
  )
}
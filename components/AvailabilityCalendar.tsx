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
  const [selectedRooms, setSelectedRooms] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    async function loadRoomData() {
      setLoading(true)
      
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

    const onFocus = () => {
      fetchCalendarData()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [roomId])

  async function fetchCalendarData() {
    setFetching(true)

    const { data: prices } = await supabase
      .from('room_prices')
      .select('date, price')
      .eq('room_id', roomId)

    const priceMap: PriceMap = {}
    prices?.forEach((p) => {
      priceMap[p.date] = p.price
    })
    setCustomPrices(priceMap)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('check_in, check_out, room_count')
      .eq('room_id', roomId)

    const countMap: StockMap = {}
    bookings?.forEach((b) => {
      const startStr = b.check_in.split('T')[0]
      const endStr = b.check_out.split('T')[0]
      
      let curr = new Date(`${startStr}T00:00:00`)
      const end = new Date(`${endStr}T00:00:00`)
      const countToDeduct = b.room_count || 1

      while (curr < end) {
        const dateStr = formatDateStr(curr)
        countMap[dateStr] = (countMap[dateStr] || 0) + countToDeduct
        curr.setDate(curr.getDate() + 1)
      }
    })

    setBookedCounts(countMap)
    setFetching(false)
  }

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const getDayPrice = (date: Date) => {
    const str = formatDateStr(date)
    return customPrices[str] !== undefined ? customPrices[str] : basePrice
  }

  const getRemainingStock = (date: Date) => {
    const str = formatDateStr(date)
    const booked = bookedCounts[str] || 0
    return Math.max(0, totalStock - booked)
  }

  // 判斷當天是否滿房（無房可供「入住」）
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true

    const dayOfWeek = date.getDay()
    if (closeWeekend && (dayOfWeek === 0 || dayOfWeek === 6)) return true

    return getRemainingStock(date) <= 0
  }

  // 💡 關鍵：選取區間變化時的防護與退房日允許邏輯
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates

    // 1. 單選入住日：入住日絕對不能是滿房日
    if (start && !end) {
      if (isDateDisabled(start)) {
        alert('⚠️ 該日期已滿房或不開放入住，請選擇其他日期！')
        setStartDate(null)
        setEndDate(null)
        return
      }
      setStartDate(start)
      setEndDate(null)
      return
    }

    // 2. 選擇退房日：檢查 [start, end) 區間內是否有滿房日
    if (start && end) {
      let curr = new Date(start)
      let hasBlockedDateInBetween = false

      // 檢查入住日～退房日【前一天】是否有滿房日
      // 注意：curr < end 確保不包含 end（退房日）本身！
      while (curr < end) {
        if (isDateDisabled(curr)) {
          hasBlockedDateInBetween = true
          break
        }
        curr.setDate(curr.getDate() + 1)
      }

      if (hasBlockedDateInBetween) {
        alert('⚠️ 您選擇的預訂區間包含了滿房日，無法跨越預訂！')
        setStartDate(start)
        setEndDate(null)
        return
      }

      setStartDate(start)
      setEndDate(end)
    }
  }

  // 計算選取區間明細
  const calculatePriceBreakdown = () => {
    if (!startDate || !endDate) return { breakdown: [], totalPrice: 0, nights: 0 }

    const breakdown: { date: string; price: number; isCustom: boolean }[] = []
    let totalPrice = 0
    let curr = new Date(startDate)

    while (curr < endDate) {
      const dateStr = formatDateStr(curr)
      const price = getDayPrice(curr)
      const isCustom = customPrices[dateStr] !== undefined

      breakdown.push({ date: dateStr, price, isCustom })
      totalPrice += price
      curr.setDate(curr.getDate() + 1)
    }

    return { breakdown, totalPrice, nights: breakdown.length }
  }

  const { breakdown, totalPrice, nights } = calculatePriceBreakdown()

  const handleProceedBooking = () => {
    if (!startDate || !endDate) return
    const checkIn = formatDateStr(startDate)
    const checkOut = formatDateStr(endDate)
    router.push(`/booking?room=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`)
  }

  const renderDayContents = (day: number, date: Date) => {
    const price = getDayPrice(date)
    const remaining = getRemainingStock(date)
    const disabled = isDateDisabled(date)

    const isCheckOutDate =
      startDate &&
      endDate &&
      date.getTime() === endDate.getTime() &&
      startDate.getTime() !== endDate.getTime()

    return (
      <div className="flex flex-col items-center justify-between h-full py-1 text-xs">
        <span className="font-bold text-sm">{day}</span>
        
        {!disabled && (
          <>
            {isCheckOutDate ? (
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">退房</span>
            ) : (
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                ${price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
              </span>
            )}
            
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isCheckOutDate ? '—' : `餘 ${remaining} 間`}
              </span>
          </>
        )}
        
        {disabled && (
          <span className="text-[9px] text-stone-400 dark:text-stone-600">
            {isCheckOutDate ? '退房' : '滿房'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 text-stone-900 dark:text-stone-100 max-w-xl mx-auto space-y-4 shadow-sm dark:shadow-none transition-colors duration-300">
      {fetching && (
        <div className="absolute inset-0 bg-white/40 dark:bg-stone-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-stone-50 dark:bg-stone-900 px-3 py-1 rounded-full border border-amber-500/30">
            更新房況中...
          </span>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3 transition-colors">
        <h3 className="text-lg font-bold text-amber-600 dark:text-amber-500">房況與即時試算</h3>
        <span className="text-xs text-stone-500 dark:text-stone-400">預設房價：NT$ {basePrice.toLocaleString()} / 晚</span>
      </div>

      <div className="flex justify-center custom-calendar-container">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          // 💡 關鍵修復：如果是選退房日，允許點擊「滿房日」作為退房日
          filterDate={(date) => {
            if (startDate && !endDate && date > startDate) {
              return true // 允許後續日期被點選為退房日
            }
            return !isDateDisabled(date)
          }}
          renderDayContents={renderDayContents}
          minDate={new Date()}
        />
      </div>

      {startDate && endDate && breakdown.length > 0 && (
        <div className="bg-stone-50 dark:bg-stone-950 border border-amber-500/30 rounded-xl p-4 space-y-3 transition-colors duration-300">
          <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">已選預訂區間</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {formatDateStr(startDate)} ～ {formatDateStr(endDate)} （共 {nights} 晚）
            </span>
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 transition-colors">
            <span className="text-xs text-stone-600 dark:text-stone-300">預訂間數</span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSelectedRooms((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-500 font-bold text-sm flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono w-8 text-center">
                {selectedRooms} 間
              </span>
              <button
                type="button"
                onClick={() => setSelectedRooms((prev) => prev + 1)}
                className="w-7 h-7 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-500 font-bold text-sm flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {breakdown.map((item) => (
              <div key={item.date} className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
                <span>
                  {item.date}
                  {item.isCustom && <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-500 font-medium">(特殊房價)</span>}
                </span>
                <span className="font-mono">
                  NT$ {(item.price * selectedRooms).toLocaleString()}
                  {selectedRooms > 1 && <span className="text-[10px] text-stone-400 dark:text-stone-500 font-normal"> ({selectedRooms}間)</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between transition-colors">
            <div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">預估總金額 ({selectedRooms} 間房)</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                NT$ {(totalPrice * selectedRooms).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleProceedBooking}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-lg text-sm transition shadow-md"
            >
              確認訂房資訊
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export default function BookingDatePicker() {
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
      <DatePicker
        selected={checkIn}
        onChange={(date: Date | null) => {
          setCheckIn(date)
          setCheckOut(null)
        }}
        minDate={new Date()}
        filterDate={(date: Date) => !isWeekend(date)}
        placeholderText="選擇入住日期"
        dateFormat="yyyy/MM/dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className="w-full rounded-lg bg-stone-900 p-3 text-sm text-white outline-none"
      />

      <DatePicker
        selected={checkOut}
        onChange={(date: Date | null) => setCheckOut(date)}
        minDate={checkIn ?? new Date()}
        filterDate={(date: Date) => !isWeekend(date)}
        placeholderText="選擇退房日期"
        dateFormat="yyyy/MM/dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        disabled={!checkIn}
        className="w-full rounded-lg bg-stone-900 p-3 text-sm text-white outline-none disabled:opacity-50"
      />

      <a
        href="/booking"
        className="rounded-lg bg-amber-500 px-5 py-3 text-center font-bold text-stone-950 hover:bg-amber-400"
      >
        搜尋剩房
      </a>
    </div>
  )
}
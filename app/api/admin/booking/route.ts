import { NextResponse } from 'next/server'

// 💡 建立 Discord 發送通告函式
async function sendDiscordNotification(booking: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  // 整理加購項目的顯示文字
  const addonsText = booking.selected_addons && booking.selected_addons.length > 0
    ? booking.selected_addons.map((a: any) => `• ${a.name} × ${a.count} ($${a.subtotal})`).join('\n')
    : '無加購項目'

  // 組合漂亮的 Discord Embed 訊息卡片
  const embed = {
    title: '🎉 收到全新預訂訂單！',
    color: 0xf59e0b, // 經典 Amber 橘黃色
    fields: [
      { name: '👤 訂客姓名', value: booking.guest_name || '未填寫', inline: true },
      { name: '📞 聯絡電話', value: booking.guest_phone || '未填寫', inline: true },
      { name: '🛏️ 預訂房型', value: booking.room_name || `房型 ID: ${booking.room_id}`, inline: false },
      { name: '📅 入住／退房日期', value: `${booking.check_in} ～ ${booking.check_out}`, inline: false },
      { name: '👥 入住人數', value: `${booking.adults} 大 / ${booking.children} 小 (${booking.room_count} 間)`, inline: true },
      { name: '💰 訂單總額', value: `**NT$ ${Number(booking.grand_total_price || 0).toLocaleString()}**`, inline: true },
      { name: '🏄 加購體驗行程', value: addonsText, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: '旅宿線上預訂系統通知' },
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (err) {
    console.error('Discord Webhook 通知發送失敗:', err)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. 你的 Supabase 寫入邏輯...
    // const { data, error } = await supabase.from('bookings').insert([...]).select().single()

    // 2. 寫入資料庫成功後，觸發 Discord 通知（可非同步背景執行）
    // sendDiscordNotification(data)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: '下單失敗' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('--------------------------------------------------')
  console.log('🚀 [Discord API] 收到觸發請求！')

  try {
    const booking = await request.json()
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    console.log('🔑 [Discord API] DISCORD_WEBHOOK_URL 讀取結果：', webhookUrl ? '✅ 成功讀取' : '❌ 未讀取到 (Undefined)')

    if (!webhookUrl) {
      return NextResponse.json({ error: 'DISCORD_WEBHOOK_URL未設定' }, { status: 500 })
    }

    const addonsText =
      booking.selected_addons && booking.selected_addons.length > 0
        ? booking.selected_addons
            .map((a: any) => `• ${a.name} × ${a.count} (NT$ ${Number(a.subtotal || 0).toLocaleString()})`)
            .join('\n')
        : '無加購項目'

    const embed = {
      title: '🎉 收到全新預訂訂單！',
      color: 0xf59e0b,
      fields: [
        { name: '👤 訂客姓名', value: booking.guest_name || '未提供', inline: true },
        { name: '📞 聯絡電話', value: booking.guest_phone || '未提供', inline: true },
        { name: '🛏️ 預訂房型', value: `${booking.room_name || '房型 ID: ' + booking.room_id} (${booking.room_count || 1} 間)`, inline: false },
        { name: '📅 入住／退房日期', value: `${booking.check_in} ～ ${booking.check_out}`, inline: false },
        { name: '👥 入住人數', value: `${booking.adults || 0} 大 / ${booking.children || 0} 小`, inline: true },
        { name: '💰 訂單總額', value: `**NT$ ${Number(booking.grand_total_price || 0).toLocaleString()}**`, inline: true },
        { name: '🏄 加購體驗行程', value: addonsText, inline: false },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: '旅宿線上預訂系統' },
    }

    console.log('📤 [Discord API] 正在發送 POST 請求給 Discord...')
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('❌ [Discord API] Discord 回傳失敗：', res.status, errText)
      return NextResponse.json({ error: errText }, { status: 400 })
    }

    console.log('✅ [Discord API] 通知成功發送至 Discord！')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('💥 [Discord API] 系統例外錯誤：', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
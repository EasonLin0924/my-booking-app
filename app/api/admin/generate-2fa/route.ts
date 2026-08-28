import { NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function GET() {
  try {
    // 直接從 .env.local 讀取固定的 Secret
    const secret = process.env.ADMIN_2FA_SECRET?.trim()

    if (!secret) {
      return NextResponse.json({ error: '.env.local 未設定 ADMIN_2FA_SECRET' }, { status: 500 })
    }

    // 根據固定的 Secret 產生對應的 otpauth URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: 'A路小琉球民宿 (Admin)',
      encoding: 'base32',
    })

    // 轉成 QR Code 圖片
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)

    return NextResponse.json({
      base32Secret: secret,
      qrCodeUrl,
    })
  } catch (error) {
    return NextResponse.json({ error: '產生 QR Code 失敗' }, { status: 500 })
  }
}
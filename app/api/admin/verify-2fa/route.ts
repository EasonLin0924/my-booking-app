import { NextResponse } from 'next/server'
import speakeasy from 'speakeasy'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const secret = process.env.ADMIN_2FA_SECRET?.trim()

    if (!secret) {
      return NextResponse.json({ error: '伺服器未設定 2FA 金鑰' }, { status: 500 })
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code.trim(),
      window: 1,
    })

    if (!verified) {
      return NextResponse.json({ error: '驗證碼錯誤或已過期' }, { status: 400 })
    }

    // 建立 Response 並強制加上標準 Set-Cookie Header
    const response = NextResponse.json({ success: true })

    // 💡 關鍵：明確設定 Path、SameSite 與 MaxAge，讓瀏覽器收到 Response 時秒寫入 Cookie
    response.cookies.set('admin_token', 'authenticated_session', {
      httpOnly: false, // 暫時設為 false 讓前端 document.cookie 也讀得到
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 天有效
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: '伺服器驗證失敗' }, { status: 500 })
  }
}
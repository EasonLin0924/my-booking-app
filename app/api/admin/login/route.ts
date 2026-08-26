import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const envUsername = process.env.ADMIN_USERNAME
    const envPassword = process.env.ADMIN_PASSWORD

    // 在伺服器端比對環境變數
    if (username === envUsername && password === envPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, message: '帳號或密碼錯誤！' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '伺服器內部錯誤' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const expectedUsername = process.env.ADMIN_USERNAME
    const expectedPassword = process.env.ADMIN_PASSWORD

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json({ message: '伺服器未設定 ADMIN_USERNAME 或 ADMIN_PASSWORD' }, { status: 500 })
    }

    if (username === expectedUsername && password === expectedPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ message: '帳號或密碼錯誤！' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ message: '伺服器驗證失敗' }, { status: 500 })
  }
}
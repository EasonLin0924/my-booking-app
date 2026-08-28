import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // 徹底清除登入 Token
  response.cookies.delete('admin_token')
  
  return response
}
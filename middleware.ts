import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // 1. 如果是 API 或登入頁面，直接放行
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. 存取 /admin 底下的其他頁面且沒有 token 時，強制轉址到 /admin/login
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/src/lib/session'

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

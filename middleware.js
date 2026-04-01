import { NextResponse } from 'next/server'

export function middleware(request) {
  const authCookie = request.cookies.get('kairo-auth')

  if (authCookie?.value === 'granted') {
    return NextResponse.next()
  }

  return NextResponse.redirect('https://meetkairo.ai/password')
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

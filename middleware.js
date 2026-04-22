import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Analytics pages are password-protected
  if (!pathname.startsWith('/visitors') && !pathname.startsWith('/numbers')) return NextResponse.next()

  const auth = request.cookies.get('kairo-auth')
  if (!auth || auth.value !== 'granted') {
    const url = request.nextUrl.clone()
    url.pathname = '/password'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|.*\.png$|.*\.jpg$|.*\.jpeg$|.*\.svg$|.*\.ico$).*)',
  ],
}

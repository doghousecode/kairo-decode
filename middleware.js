import { NextResponse } from 'next/server'

export function middleware(request) {
  if (process.env.DISABLE_AUTH === 'true') return NextResponse.next()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/password') || pathname.startsWith('/api/password') || pathname.startsWith('/asoworkshop')) {
    return NextResponse.next()
  }

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

import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://decode.meetkairo.ai'))
  response.cookies.set('kairo-auth', '', { maxAge: 0, path: '/' })
  response.cookies.set('kairo-admin-ui', '', { maxAge: 0, path: '/' })
  return response
}

import { NextResponse } from 'next/server'
import { timingSafeEqual } from '@/lib/security'

export async function POST(request) {
  const { password } = await request.json()
  const correct = process.env.SITE_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'Password not configured.' }, { status: 500 })
  }

  if (typeof password !== 'string' || !timingSafeEqual(password, correct)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('kairo-auth', 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  response.cookies.set('kairo-admin-ui', '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}

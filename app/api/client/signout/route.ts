import { NextResponse } from 'next/server';
import { SESSION_COOKIE, OTP_COOKIE } from '@/lib/client-auth';

/**
 * Client sign-out: clears the httpOnly session cookie server-side.
 * The cookie is httpOnly so JavaScript cannot delete it — this route must be called instead.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear session cookie
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Clear any stale OTP challenge cookie too
  res.cookies.set(OTP_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return res;
}

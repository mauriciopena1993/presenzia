import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/admin-auth';

/**
 * Admin sign-out: clears the httpOnly session cookie server-side.
 * The cookie is httpOnly so JavaScript cannot delete it — this route must be called instead.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return res;
}

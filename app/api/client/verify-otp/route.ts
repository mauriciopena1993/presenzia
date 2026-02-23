import { NextRequest, NextResponse } from 'next/server';
import { verifyOTPChallenge, createSessionToken, SESSION_COOKIE, OTP_COOKIE, SESSION_MAX_AGE } from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const challenge = req.cookies.get(OTP_COOKIE)?.value;

  if (!challenge || !code) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = verifyOTPChallenge(challenge, String(code));
  if (!result.valid || !result.email) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  const sessionToken = createSessionToken(result.email);
  const res = NextResponse.json({ ok: true });

  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  // Clear the OTP challenge cookie
  res.cookies.set(OTP_COOKIE, '', { maxAge: 0, path: '/' });

  return res;
}

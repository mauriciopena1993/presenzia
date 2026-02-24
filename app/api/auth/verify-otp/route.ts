import { NextRequest, NextResponse } from 'next/server';
import {
  isAdminEmail,
  verifyChallengeToken,
  createSessionToken as createAdminSession,
  SESSION_COOKIE as ADMIN_COOKIE,
} from '@/lib/admin-auth';
import {
  verifyOTPChallenge,
  createSessionToken as createClientSession,
  OTP_COOKIE,
  SESSION_COOKIE as CLIENT_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  const { email, code, challengeToken } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();

  // ── Admin verification ─────────────────────────────────────────────────────
  if (isAdminEmail(normalizedEmail)) {
    if (!challengeToken) {
      return NextResponse.json({ error: 'Missing challenge token' }, { status: 400 });
    }

    const result = verifyChallengeToken(challengeToken, code);
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    const sessionToken = createAdminSession();
    const res = NextResponse.json({ success: true, redirect: '/admin' });
    res.cookies.set(ADMIN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return res;
  }

  // ── Client verification ────────────────────────────────────────────────────
  const challenge = req.cookies.get(OTP_COOKIE)?.value;
  if (!challenge) {
    return NextResponse.json(
      { error: 'Session expired. Please request a new code.' },
      { status: 401 }
    );
  }

  const result = verifyOTPChallenge(challenge, code);
  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  const sessionToken = createClientSession(result.email!);
  const res = NextResponse.json({ success: true, redirect: '/dashboard' });
  res.cookies.set(CLIENT_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  res.cookies.delete(OTP_COOKIE);
  return res;
}

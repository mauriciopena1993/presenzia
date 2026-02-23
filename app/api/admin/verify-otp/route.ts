import { NextRequest, NextResponse } from 'next/server';
import { verifyChallengeToken, createSessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { otp, challengeToken } = await req.json();

  if (!otp || !challengeToken) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const result = verifyChallengeToken(challengeToken, otp);

  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  const sessionToken = createSessionToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}

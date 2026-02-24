import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createSessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // Timing-safe comparison to prevent oracle attacks
  let match = false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    if (a.length === b.length) {
      match = timingSafeEqual(a, b);
    }
  } catch {
    match = false;
  }

  if (!match) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
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

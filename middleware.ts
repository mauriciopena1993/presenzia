import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = '__presenzia_admin';
const CLIENT_SESSION_COOKIE = '__presenzia_client';
const ADMIN_EMAIL = 'hello@presenzia.ai';

async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return false;

    const parts = token.split('|');
    if (parts.length !== 3) return false;

    const [email, expiry, sig] = parts;
    if (email !== ADMIN_EMAIL) return false;
    if (Date.now() > parseInt(expiry, 10)) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${email}|${expiry}`)
    );
    const expectedSig = Array.from(new Uint8Array(expectedSigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (sig.length !== expectedSig.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

async function verifyClientSession(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return false;

    const parts = token.split('|');
    if (parts.length !== 3) return false;

    const [email, expiry, sig] = parts;
    if (!email || !expiry) return false;
    if (Date.now() > parseInt(expiry, 10)) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const payload = `client-session:${email}|${expiry}`;
    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    const expectedSig = Array.from(new Uint8Array(expectedSigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (sig.length !== expectedSig.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token || !(await verifyAdminSession(token))) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Protect /dashboard/* (except /dashboard/login)
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/login')) {
    const token = req.cookies.get(CLIENT_SESSION_COOKIE)?.value;
    if (!token || !(await verifyClientSession(token))) {
      return NextResponse.redirect(new URL('/dashboard/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

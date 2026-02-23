import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = '__presenzia_admin';
const ADMIN_EMAIL = 'hello@presenzia.ai';

async function verifySessionEdge(token: string): Promise<boolean> {
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !(await verifySessionEdge(token))) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

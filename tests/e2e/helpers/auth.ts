/**
 * Playwright E2E auth helpers.
 * Generates valid HMAC session tokens that pass the Next.js middleware.
 */
import crypto from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load ADMIN_SESSION_SECRET from .env.local — must match the dev server
// (E2E tests run against the dev server which uses .env.local, not .env.test)
config({ path: resolve(__dirname, '../../../.env.local'), override: true });

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function hmacHex(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET not set — needed for E2E auth tokens');
  return s;
}

/** Create a valid client session token that passes middleware verification */
export function createClientSessionToken(email: string): string {
  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  const data = `${email}|${expiry}`;
  const sig = hmacHex(`client-session:${data}`, getSecret());
  return `${data}|${sig}`;
}

/** Create a valid admin session token that passes middleware verification */
export function createAdminSessionToken(): string {
  const email = 'hello@presenzia.ai';
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const data = `${email}|${expiry}`;
  const sig = hmacHex(data, getSecret());
  return `${data}|${sig}`;
}

/** Cookie config for Playwright context.addCookies() */
export function clientAuthCookie(email: string) {
  return {
    name: '__presenzia_client',
    value: createClientSessionToken(email),
    domain: 'localhost',
    path: '/',
  };
}

export function adminAuthCookie() {
  return {
    name: '__presenzia_admin',
    value: createAdminSessionToken(),
    domain: 'localhost',
    path: '/',
  };
}

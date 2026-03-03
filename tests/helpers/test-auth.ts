/**
 * Test helpers for creating valid authentication cookies.
 * Uses the same token creation functions as the production code.
 */
import {
  createSessionToken as createClientSession,
  SESSION_COOKIE as CLIENT_SESSION_COOKIE,
} from '@/lib/client-auth';
import {
  createSessionToken as createAdminSession,
  SESSION_COOKIE as ADMIN_SESSION_COOKIE,
} from '@/lib/admin-auth';

/** Create a valid client session cookie header value */
export function clientSessionCookie(email: string): string {
  const token = createClientSession(email);
  return `${CLIENT_SESSION_COOKIE}=${token}`;
}

/** Create a valid admin session cookie header value */
export function adminSessionCookie(): string {
  const token = createAdminSession();
  return `${ADMIN_SESSION_COOKIE}=${token}`;
}

/** Create a NextRequest-compatible headers object with a session cookie */
export function clientHeaders(email: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Cookie: clientSessionCookie(email),
  };
}

export function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Cookie: adminSessionCookie(),
  };
}

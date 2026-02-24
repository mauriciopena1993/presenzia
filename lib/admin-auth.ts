/**
 * Admin authentication utilities.
 * Stateless OTP flow — no DB required.
 * Session is a signed HTTP-only cookie.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_EMAIL = 'hello@presenzia.ai';
const OTP_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

function hmac(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

// --- OTP Challenge (stateless) ---

export function createChallengeToken(otp: string): string {
  const timestamp = Date.now().toString();
  const data = `${otp}|${timestamp}`;
  const sig = hmac(data);
  return Buffer.from(`${data}|${sig}`).toString('base64url');
}

/**
 * Decode a challenge token to extract the OTP without verifying a submitted code.
 * Used by send-otp resend to reuse the same OTP instead of generating a new one.
 */
export function decodeChallengeToken(token: string): { valid: boolean; otp?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return { valid: false };

    const [storedOtp, timestamp, sig] = parts;
    const data = `${storedOtp}|${timestamp}`;

    if (!safeEqual(sig, hmac(data))) return { valid: false };
    if (Date.now() - parseInt(timestamp, 10) > OTP_TTL_MS) return { valid: false }; // expired

    return { valid: true, otp: storedOtp };
  } catch {
    return { valid: false };
  }
}

export interface ChallengeVerifyResult {
  valid: boolean;
  reason?: string;
}

export function verifyChallengeToken(token: string, otp: string): ChallengeVerifyResult {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return { valid: false, reason: 'malformed' };

    const [storedOtp, timestamp, sig] = parts;
    const data = `${storedOtp}|${timestamp}`;

    // Verify HMAC
    if (!safeEqual(sig, hmac(data))) {
      return { valid: false, reason: 'invalid signature' };
    }

    // Check expiry
    if (Date.now() - parseInt(timestamp, 10) > OTP_TTL_MS) {
      return { valid: false, reason: 'expired' };
    }

    // Check OTP matches
    if (!safeEqual(storedOtp, otp.trim())) {
      return { valid: false, reason: 'wrong otp' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'error' };
  }
}

// --- Session Token ---

export function createSessionToken(): string {
  const expiry = (Date.now() + SESSION_TTL_MS).toString();
  const data = `${ADMIN_EMAIL}|${expiry}`;
  const sig = hmac(data);
  return `${data}|${sig}`;
}

export interface SessionVerifyResult {
  valid: boolean;
  email?: string;
}

export function verifySessionToken(token: string): SessionVerifyResult {
  try {
    const parts = token.split('|');
    if (parts.length !== 3) return { valid: false };

    const [email, expiry, sig] = parts;
    const data = `${email}|${expiry}`;

    if (!safeEqual(sig, hmac(data))) return { valid: false };
    if (Date.now() > parseInt(expiry, 10)) return { valid: false };
    if (email !== ADMIN_EMAIL) return { valid: false };

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export const SESSION_COOKIE = '__presenzia_admin';

// --- Password hashing (HMAC-SHA256 keyed by ADMIN_SESSION_SECRET) ---

/**
 * Returns a deterministic hash of a plaintext password using HMAC-SHA256.
 * The hash is keyed by ADMIN_SESSION_SECRET so it cannot be reversed without the secret.
 */
export function hashAdminPassword(plaintext: string): string {
  return hmac(`admin-password:${plaintext}`);
}

/**
 * Timing-safe comparison of a submitted password against a stored hash.
 */
export function checkAdminPassword(plaintext: string, storedHash: string): boolean {
  return safeEqual(hashAdminPassword(plaintext), storedHash);
}

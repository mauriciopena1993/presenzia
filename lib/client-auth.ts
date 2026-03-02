/**
 * Client portal authentication utilities.
 * OTP-based login: email → 6-digit code → session cookie.
 * Uses HMAC-SHA256 with ADMIN_SESSION_SECRET (with client-specific namespace prefix).
 */
import crypto from 'crypto';

export const SESSION_COOKIE = '__presenzia_client';
export const OTP_COOKIE = '__presenzia_client_otp';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const OTP_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET not set');
  return s;
}

function hmacHex(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Create an OTP challenge token (stored as a short-lived cookie).
 * Encodes: email + expiry + code, signed with HMAC.
 */
export function createOTPChallenge(email: string, code: string): string {
  const expiry = Date.now() + OTP_DURATION_MS;
  const payload = `${email}|${expiry}|${code}`;
  const sig = hmacHex(`client-otp:${payload}`, getSecret());
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

/**
 * Decode an existing OTP challenge to extract email + code (without verifying the submitted code).
 * Used by send-otp to resend the same code instead of generating a new one.
 */
export function decodeOTPChallenge(
  challenge: string,
): { valid: boolean; email?: string; code?: string } {
  try {
    const decoded = Buffer.from(challenge, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return { valid: false };

    const [email, expiryStr, code, sig] = parts;
    if (Date.now() > parseInt(expiryStr, 10)) return { valid: false }; // expired

    const expectedSig = hmacHex(`client-otp:${email}|${expiryStr}|${code}`, getSecret());
    if (sig !== expectedSig) return { valid: false }; // tampered

    return { valid: true, email, code };
  } catch {
    return { valid: false };
  }
}

/**
 * Verify the OTP challenge against the submitted code.
 */
export function verifyOTPChallenge(
  challenge: string,
  submittedCode: string,
): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(challenge, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return { valid: false };

    const [email, expiryStr, code, sig] = parts;
    if (Date.now() > parseInt(expiryStr, 10)) return { valid: false };

    const trimmed = submittedCode.replace(/\s/g, '');
    // Timing-safe comparison to prevent timing attacks
    const codeBuffer = Buffer.from(code);
    const trimmedBuffer = Buffer.from(trimmed);
    if (codeBuffer.length !== trimmedBuffer.length || !crypto.timingSafeEqual(codeBuffer, trimmedBuffer)) {
      return { valid: false };
    }

    const expectedSig = hmacHex(`client-otp:${email}|${expiryStr}|${code}`, getSecret());
    if (sig !== expectedSig) return { valid: false };

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

/**
 * Create a session token (stored as a long-lived cookie).
 */
export function createSessionToken(email: string): string {
  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  const data = `${email}|${expiry}`;
  const sig = hmacHex(`client-session:${data}`, getSecret());
  return `${data}|${sig}`;
}

/**
 * Verify a session token (Node.js crypto — use in API routes only).
 */
export function verifySessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const parts = token.split('|');
    if (parts.length !== 3) return { valid: false };
    const [email, expiryStr, sig] = parts;

    if (Date.now() > parseInt(expiryStr, 10)) return { valid: false };

    const expectedSig = hmacHex(`client-session:${email}|${expiryStr}`, getSecret());
    if (sig !== expectedSig) return { valid: false };

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

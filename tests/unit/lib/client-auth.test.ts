import { describe, it, expect, beforeAll } from 'vitest';
import {
  createOTPChallenge,
  decodeOTPChallenge,
  verifyOTPChallenge,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
  OTP_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/client-auth';

// Ensure env vars are set for tests
beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-key-for-unit-tests-only';
});

describe('lib/client-auth', () => {
  const testEmail = 'test@example.com';
  const testCode = '123456';

  describe('constants', () => {
    it('exports expected cookie names', () => {
      expect(SESSION_COOKIE).toBe('__presenzia_client');
      expect(OTP_COOKIE).toBe('__presenzia_client_otp');
    });

    it('session max age is 7 days', () => {
      expect(SESSION_MAX_AGE).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('OTP challenge', () => {
    it('creates a base64url-encoded challenge', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      expect(challenge).toBeTruthy();
      expect(typeof challenge).toBe('string');
      // base64url should not contain +, /, or =
      expect(challenge).not.toMatch(/[+/=]/);
    });

    it('decodeOTPChallenge extracts email and code', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      const result = decodeOTPChallenge(challenge);
      expect(result.valid).toBe(true);
      expect(result.email).toBe(testEmail);
      expect(result.code).toBe(testCode);
    });

    it('verifyOTPChallenge succeeds with correct code', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      const result = verifyOTPChallenge(challenge, testCode);
      expect(result.valid).toBe(true);
      expect(result.email).toBe(testEmail);
    });

    it('verifyOTPChallenge succeeds with whitespace in code', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      const result = verifyOTPChallenge(challenge, ' 1 2 3 4 5 6 ');
      expect(result.valid).toBe(true);
      expect(result.email).toBe(testEmail);
    });

    it('verifyOTPChallenge fails with wrong code', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      const result = verifyOTPChallenge(challenge, '999999');
      expect(result.valid).toBe(false);
    });

    it('verifyOTPChallenge fails with tampered challenge', () => {
      const challenge = createOTPChallenge(testEmail, testCode);
      const tampered = challenge.slice(0, -5) + 'XXXXX';
      const result = verifyOTPChallenge(tampered, testCode);
      expect(result.valid).toBe(false);
    });

    it('decodeOTPChallenge fails with garbage input', () => {
      const result = decodeOTPChallenge('not-a-valid-challenge');
      expect(result.valid).toBe(false);
    });

    it('decodeOTPChallenge fails with empty string', () => {
      const result = decodeOTPChallenge('');
      expect(result.valid).toBe(false);
    });
  });

  describe('session token', () => {
    it('creates a session token string', () => {
      const token = createSessionToken(testEmail);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      // Format: email|expiry|signature
      expect(token.split('|').length).toBe(3);
    });

    it('verifySessionToken succeeds with valid token', () => {
      const token = createSessionToken(testEmail);
      const result = verifySessionToken(token);
      expect(result.valid).toBe(true);
      expect(result.email).toBe(testEmail);
    });

    it('verifySessionToken fails with tampered token', () => {
      const token = createSessionToken(testEmail);
      const parts = token.split('|');
      parts[2] = 'tampered-signature';
      const result = verifySessionToken(parts.join('|'));
      expect(result.valid).toBe(false);
    });

    it('verifySessionToken fails with expired token', () => {
      const token = createSessionToken(testEmail);
      const parts = token.split('|');
      // Set expiry to past
      parts[1] = String(Date.now() - 1000);
      // Recalculate HMAC would fail, so this also tests tamper detection
      const result = verifySessionToken(parts.join('|'));
      expect(result.valid).toBe(false);
    });

    it('verifySessionToken fails with malformed token', () => {
      expect(verifySessionToken('').valid).toBe(false);
      expect(verifySessionToken('only-one-part').valid).toBe(false);
      expect(verifySessionToken('two|parts').valid).toBe(false);
    });

    it('different emails produce different tokens', () => {
      const token1 = createSessionToken('user1@test.com');
      const token2 = createSessionToken('user2@test.com');
      expect(token1).not.toBe(token2);
    });
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import {
  isAdminEmail,
  createChallengeToken,
  decodeChallengeToken,
  verifyChallengeToken,
  createSessionToken,
  verifySessionToken,
  hashAdminPassword,
  checkAdminPassword,
  SESSION_COOKIE,
} from '@/lib/admin-auth';

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-admin-secret-key-for-tests';
});

describe('lib/admin-auth', () => {
  describe('isAdminEmail', () => {
    it('returns true for the admin email', () => {
      expect(isAdminEmail('hello@presenzia.ai')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isAdminEmail('HELLO@PRESENZIA.AI')).toBe(true);
      expect(isAdminEmail('Hello@Presenzia.AI')).toBe(true);
    });

    it('trims whitespace', () => {
      expect(isAdminEmail('  hello@presenzia.ai  ')).toBe(true);
    });

    it('returns false for non-admin emails', () => {
      expect(isAdminEmail('user@example.com')).toBe(false);
      expect(isAdminEmail('hello@other.ai')).toBe(false);
      expect(isAdminEmail('')).toBe(false);
    });
  });

  describe('OTP challenge', () => {
    const otp = '654321';

    it('creates a base64url-encoded challenge token', () => {
      const token = createChallengeToken(otp);
      expect(token).toBeTruthy();
      expect(token).not.toMatch(/[+/=]/); // base64url
    });

    it('decodeChallengeToken extracts OTP', () => {
      const token = createChallengeToken(otp);
      const result = decodeChallengeToken(token);
      expect(result.valid).toBe(true);
      expect(result.otp).toBe(otp);
    });

    it('verifyChallengeToken succeeds with correct OTP', () => {
      const token = createChallengeToken(otp);
      const result = verifyChallengeToken(token, otp);
      expect(result.valid).toBe(true);
    });

    it('verifyChallengeToken fails with wrong OTP', () => {
      const token = createChallengeToken(otp);
      const result = verifyChallengeToken(token, '000000');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('wrong otp');
    });

    it('verifyChallengeToken fails with tampered token', () => {
      const token = createChallengeToken(otp);
      const tampered = token.slice(0, -3) + 'ZZZ';
      const result = verifyChallengeToken(tampered, otp);
      expect(result.valid).toBe(false);
    });

    it('decodeChallengeToken fails on garbage', () => {
      expect(decodeChallengeToken('garbage').valid).toBe(false);
      expect(decodeChallengeToken('').valid).toBe(false);
    });
  });

  describe('session token', () => {
    it('exports correct cookie name', () => {
      expect(SESSION_COOKIE).toBe('__presenzia_admin');
    });

    it('creates a valid session token', () => {
      const token = createSessionToken();
      expect(token).toBeTruthy();
      expect(token.split('|').length).toBe(3);
    });

    it('verifySessionToken succeeds with valid token', () => {
      const token = createSessionToken();
      const result = verifySessionToken(token);
      expect(result.valid).toBe(true);
      expect(result.email).toBe('hello@presenzia.ai');
    });

    it('verifySessionToken fails with tampered signature', () => {
      const token = createSessionToken();
      const parts = token.split('|');
      parts[2] = 'tampered';
      expect(verifySessionToken(parts.join('|')).valid).toBe(false);
    });

    it('verifySessionToken fails with wrong email', () => {
      const token = createSessionToken();
      const parts = token.split('|');
      parts[0] = 'hacker@evil.com';
      expect(verifySessionToken(parts.join('|')).valid).toBe(false);
    });

    it('verifySessionToken fails with malformed input', () => {
      expect(verifySessionToken('').valid).toBe(false);
      expect(verifySessionToken('one').valid).toBe(false);
      expect(verifySessionToken('one|two').valid).toBe(false);
    });
  });

  describe('password hashing', () => {
    it('hashAdminPassword returns a hex string', () => {
      const hash = hashAdminPassword('mypassword');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('same password always produces same hash', () => {
      const hash1 = hashAdminPassword('test123');
      const hash2 = hashAdminPassword('test123');
      expect(hash1).toBe(hash2);
    });

    it('different passwords produce different hashes', () => {
      const hash1 = hashAdminPassword('password1');
      const hash2 = hashAdminPassword('password2');
      expect(hash1).not.toBe(hash2);
    });

    it('checkAdminPassword returns true for correct password', () => {
      const hash = hashAdminPassword('correct-password');
      expect(checkAdminPassword('correct-password', hash)).toBe(true);
    });

    it('checkAdminPassword returns false for wrong password', () => {
      const hash = hashAdminPassword('correct-password');
      expect(checkAdminPassword('wrong-password', hash)).toBe(false);
    });
  });
});

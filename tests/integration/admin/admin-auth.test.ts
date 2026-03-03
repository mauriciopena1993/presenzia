import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must be declared BEFORE imports of route handlers
// ---------------------------------------------------------------------------

// Mock admin-auth
const mockVerifySession = vi.fn();
const mockIsAdminEmail = vi.fn();
const mockCreateChallengeToken = vi.fn();
const mockDecodeChallengeToken = vi.fn();
const mockVerifyChallengeToken = vi.fn();
const mockCreateSessionToken = vi.fn();

vi.mock('@/lib/admin-auth', () => ({
  verifySessionToken: (...args: unknown[]) => mockVerifySession(...args),
  SESSION_COOKIE: '__presenzia_admin',
  isAdminEmail: (...args: unknown[]) => mockIsAdminEmail(...args),
  createChallengeToken: (...args: unknown[]) => mockCreateChallengeToken(...args),
  decodeChallengeToken: (...args: unknown[]) => mockDecodeChallengeToken(...args),
  verifyChallengeToken: (...args: unknown[]) => mockVerifyChallengeToken(...args),
  createSessionToken: (...args: unknown[]) => mockCreateSessionToken(...args),
}));

// Mock supabase
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'audit_jobs') {
        return {
          update: (...args: unknown[]) => {
            mockUpdate(...args);
            return { eq: (...eqArgs: unknown[]) => { mockEq(...eqArgs); return Promise.resolve({ data: null, error: null }); } };
          },
        };
      }
      return { select: vi.fn() };
    }),
  },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

// Note: global fetch is spied on per-test via vi.spyOn(globalThis, 'fetch')
// because MSW (from setup.ts) patches globalThis.fetch after vi.stubGlobal runs.

// ---------------------------------------------------------------------------
// Imports — route handlers (resolved AFTER mocks are in place)
// ---------------------------------------------------------------------------

import { POST as retryAudit } from '@/app/api/admin/retry-audit/route';
import { POST as sendOtp } from '@/app/api/admin/send-otp/route';
import { POST as verifyOtp } from '@/app/api/admin/verify-otp/route';
import { POST as verifyPassword } from '@/app/api/admin/verify-password/route';
import { POST as signout } from '@/app/api/admin/signout/route';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createPostRequest(
  path: string,
  body: unknown,
  cookies: Record<string, string> = {},
): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  } as never);
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
    }),
  });
  return req;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Defaults — override in individual tests as needed
  mockVerifySession.mockReturnValue({ valid: true });
  mockIsAdminEmail.mockImplementation((email: string) => email === 'hello@presenzia.ai');
  mockCreateChallengeToken.mockReturnValue('mock-challenge-token');
  mockDecodeChallengeToken.mockReturnValue({ valid: true, otp: '123456' });
  mockVerifyChallengeToken.mockReturnValue({ valid: true });
  mockCreateSessionToken.mockReturnValue('mock-session-token');

  // Ensure ADMIN_PASSWORD is set by default
  process.env.ADMIN_PASSWORD = 'test-password';
  process.env.RESEND_API_KEY = 'test_resend_key';
});

// ===========================================================================
// Tests
// ===========================================================================

describe('Admin Auth Routes', () => {
  // -------------------------------------------------------------------------
  // POST /api/admin/retry-audit
  // -------------------------------------------------------------------------
  describe('POST /api/admin/retry-audit', () => {
    it('rejects unauthenticated requests (no cookie) with 401', async () => {
      const req = createPostRequest('/api/admin/retry-audit', { jobId: 'job-1' });
      const res = await retryAudit(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('rejects invalid session token with 401', async () => {
      mockVerifySession.mockReturnValue({ valid: false });

      const req = createPostRequest(
        '/api/admin/retry-audit',
        { jobId: 'job-1' },
        { __presenzia_admin: 'bad-token' },
      );
      const res = await retryAudit(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 400 if jobId is missing', async () => {
      const req = createPostRequest(
        '/api/admin/retry-audit',
        {},
        { __presenzia_admin: 'valid-token' },
      );
      const res = await retryAudit(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('jobId required');
    });

    it('successfully resets job and triggers retry', async () => {
      // Spy on the actual global fetch (after MSW setup has patched it)
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

      const req = createPostRequest(
        '/api/admin/retry-audit',
        { jobId: 'job-42' },
        { __presenzia_admin: 'valid-token' },
      );
      const res = await retryAudit(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);

      // Verify supabase update was called with correct args
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'pending',
        error: null,
        started_at: null,
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'job-42');

      // Allow microtask queue to flush (fire-and-forget fetch)
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify fire-and-forget fetch was triggered to process-audit
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/process-audit'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ jobId: 'job-42' }),
        }),
      );

      fetchSpy.mockRestore();
    });

    it('returns 500 if database update fails', async () => {
      // Override supabase mock to return an error
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      } as never);

      const req = createPostRequest(
        '/api/admin/retry-audit',
        { jobId: 'job-fail' },
        { __presenzia_admin: 'valid-token' },
      );
      const res = await retryAudit(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Failed to reset job');
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/admin/send-otp
  // -------------------------------------------------------------------------
  describe('POST /api/admin/send-otp', () => {
    it('returns { sent: true } for non-admin email (no enumeration leak)', async () => {
      const req = createPostRequest('/api/admin/send-otp', { email: 'random@example.com' });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.sent).toBe(true);
      // No challenge token should be returned for non-admin
      expect(data.challengeToken).toBeUndefined();
      // No email should be sent
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('returns { sent: true } for empty email (no enumeration leak)', async () => {
      const req = createPostRequest('/api/admin/send-otp', { email: '' });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.sent).toBe(true);
      expect(data.challengeToken).toBeUndefined();
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('sends OTP and returns challengeToken for admin email', async () => {
      const req = createPostRequest('/api/admin/send-otp', { email: 'hello@presenzia.ai' });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.sent).toBe(true);
      expect(data.challengeToken).toBe('mock-challenge-token');
      expect(mockEmailSend).toHaveBeenCalledOnce();
      expect(mockCreateChallengeToken).toHaveBeenCalledWith(expect.any(String));
    });

    it('reuses existing challenge token on resend when token is valid', async () => {
      const req = createPostRequest('/api/admin/send-otp', {
        email: 'hello@presenzia.ai',
        existingChallengeToken: 'existing-valid-token',
      });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.sent).toBe(true);
      // Should reuse existing token, NOT create new
      expect(data.challengeToken).toBe('existing-valid-token');
      expect(mockCreateChallengeToken).not.toHaveBeenCalled();
      // Should still send the email
      expect(mockEmailSend).toHaveBeenCalledOnce();
    });

    it('generates fresh OTP when existing challenge token is invalid/expired', async () => {
      mockDecodeChallengeToken.mockReturnValue({ valid: false });

      const req = createPostRequest('/api/admin/send-otp', {
        email: 'hello@presenzia.ai',
        existingChallengeToken: 'expired-token',
      });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.sent).toBe(true);
      // Should generate a new token since old one is invalid
      expect(data.challengeToken).toBe('mock-challenge-token');
      expect(mockCreateChallengeToken).toHaveBeenCalledWith(expect.any(String));
      expect(mockEmailSend).toHaveBeenCalledOnce();
    });

    it('returns 500 if Resend email send fails', async () => {
      mockEmailSend.mockRejectedValueOnce(new Error('Resend API error'));

      const req = createPostRequest('/api/admin/send-otp', { email: 'hello@presenzia.ai' });
      const res = await sendOtp(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to send email');
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/admin/verify-otp
  // -------------------------------------------------------------------------
  describe('POST /api/admin/verify-otp', () => {
    it('returns 400 if otp is missing', async () => {
      const req = createPostRequest('/api/admin/verify-otp', {
        challengeToken: 'some-token',
      });
      const res = await verifyOtp(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing fields');
    });

    it('returns 400 if challengeToken is missing', async () => {
      const req = createPostRequest('/api/admin/verify-otp', {
        otp: '123456',
      });
      const res = await verifyOtp(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing fields');
    });

    it('returns 400 if both fields are missing', async () => {
      const req = createPostRequest('/api/admin/verify-otp', {});
      const res = await verifyOtp(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing fields');
    });

    it('returns 401 if OTP is invalid or expired', async () => {
      mockVerifyChallengeToken.mockReturnValue({ valid: false, reason: 'wrong otp' });

      const req = createPostRequest('/api/admin/verify-otp', {
        otp: '000000',
        challengeToken: 'some-token',
      });
      const res = await verifyOtp(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Invalid or expired code');
    });

    it('returns 200 and sets session cookie on valid OTP', async () => {
      mockVerifyChallengeToken.mockReturnValue({ valid: true });

      const req = createPostRequest('/api/admin/verify-otp', {
        otp: '123456',
        challengeToken: 'valid-challenge',
      });
      const res = await verifyOtp(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCreateSessionToken).toHaveBeenCalledOnce();

      // Verify session cookie is set
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('__presenzia_admin');
      expect(setCookie).toContain('mock-session-token');
    });

    it('calls verifyChallengeToken with correct arguments', async () => {
      mockVerifyChallengeToken.mockReturnValue({ valid: true });

      const req = createPostRequest('/api/admin/verify-otp', {
        otp: '654321',
        challengeToken: 'my-challenge',
      });
      await verifyOtp(req);

      expect(mockVerifyChallengeToken).toHaveBeenCalledWith('my-challenge', '654321');
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/admin/verify-password
  // -------------------------------------------------------------------------
  describe('POST /api/admin/verify-password', () => {
    it('returns 400 if password is missing', async () => {
      const req = createPostRequest('/api/admin/verify-password', {});
      const res = await verifyPassword(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Password required');
    });

    it('returns 400 if password is not a string', async () => {
      const req = createPostRequest('/api/admin/verify-password', { password: 12345 });
      const res = await verifyPassword(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Password required');
    });

    it('returns 500 if ADMIN_PASSWORD env var is not set', async () => {
      delete process.env.ADMIN_PASSWORD;

      const req = createPostRequest('/api/admin/verify-password', { password: 'anything' });
      const res = await verifyPassword(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Server misconfiguration');
    });

    it('returns 401 if password is incorrect', async () => {
      const req = createPostRequest('/api/admin/verify-password', { password: 'wrong-password' });
      const res = await verifyPassword(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Incorrect password');
    });

    it('returns 200 and sets session cookie if password is correct', async () => {
      const req = createPostRequest('/api/admin/verify-password', { password: 'test-password' });
      const res = await verifyPassword(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCreateSessionToken).toHaveBeenCalledOnce();

      // Verify session cookie is set
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('__presenzia_admin');
      expect(setCookie).toContain('mock-session-token');
    });

    it('rejects password that differs only by length (timing-safe)', async () => {
      const req = createPostRequest('/api/admin/verify-password', { password: 'test-password-extra' });
      const res = await verifyPassword(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Incorrect password');
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/admin/signout
  // -------------------------------------------------------------------------
  describe('POST /api/admin/signout', () => {
    it('returns { ok: true } and clears session cookie', async () => {
      const req = createPostRequest('/api/admin/signout', {});
      const res = await signout();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);

      // Verify session cookie is cleared (maxAge: 0)
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('__presenzia_admin');
      expect(setCookie).toContain('Max-Age=0');
    });

    it('clears cookie with correct security attributes', async () => {
      const res = await signout();
      const setCookie = res.headers.get('set-cookie');

      expect(setCookie).toContain('HttpOnly');
      // Next.js serializes SameSite value in lowercase
      expect(setCookie?.toLowerCase()).toContain('samesite=strict');
      expect(setCookie).toContain('Path=/');
    });
  });
});

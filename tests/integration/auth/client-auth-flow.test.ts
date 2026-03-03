import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client-auth
const mockCreateOTP = vi.fn().mockReturnValue('challenge_token_123');
const mockDecodeOTP = vi.fn().mockReturnValue(null);
const mockVerifyOTP = vi.fn();
const mockCreateSession = vi.fn().mockReturnValue('session_token_123');
const mockVerifySession = vi.fn();

vi.mock('@/lib/client-auth', () => ({
  createOTPChallenge: (...args: unknown[]) => mockCreateOTP(...args),
  decodeOTPChallenge: (...args: unknown[]) => mockDecodeOTP(...args),
  verifyOTPChallenge: (...args: unknown[]) => mockVerifyOTP(...args),
  createSessionToken: (...args: unknown[]) => mockCreateSession(...args),
  verifySessionToken: (...args: unknown[]) => mockVerifySession(...args),
  OTP_COOKIE: '__presenzia_otp',
  SESSION_COOKIE: '__presenzia_client',
  SESSION_MAX_AGE: 7 * 24 * 60 * 60,
}));

// Mock supabase
const mockClientData = { id: 'client-123', status: 'active', business_name: 'Test Wealth' };
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockClientData, error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    }),
  },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ id: 'email-1', error: null });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

import { POST as sendOTP } from '@/app/api/client/send-otp/route';
import { POST as verifyOTP } from '@/app/api/client/verify-otp/route';
import { NextRequest } from 'next/server';

function createRequest(path: string, body: Record<string, unknown>, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  } as never);
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    }),
  });
  return req;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = 'test_resend_key';
  mockDecodeOTP.mockReturnValue(null);
});

describe('Client auth flow', () => {
  describe('POST /api/client/send-otp', () => {
    it('sends OTP for existing client', async () => {
      const req = createRequest('/api/client/send-otp', { email: 'test@test.com' });
      const res = await sendOTP(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(mockEmailSend).toHaveBeenCalled();
      expect(mockCreateOTP).toHaveBeenCalledWith('test@test.com', expect.any(String));
    });

    it('returns 404 for non-existing client', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      } as never);

      const req = createRequest('/api/client/send-otp', { email: 'nobody@test.com' });
      const res = await sendOTP(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('no_account');
    });

    it('rejects missing email', async () => {
      const req = createRequest('/api/client/send-otp', {});
      const res = await sendOTP(req);
      expect(res.status).toBe(400);
    });

    it('normalizes email to lowercase', async () => {
      const req = createRequest('/api/client/send-otp', { email: '  Test@Test.COM  ' });
      await sendOTP(req);

      expect(mockCreateOTP).toHaveBeenCalledWith('test@test.com', expect.any(String));
    });

    it('reuses existing OTP when cookie is valid', async () => {
      mockDecodeOTP.mockReturnValue({ valid: true, email: 'test@test.com', code: '123456' });

      const req = createRequest('/api/client/send-otp', { email: 'test@test.com' }, {
        __presenzia_otp: 'existing_challenge',
      });
      const res = await sendOTP(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      // Should NOT create a new challenge
      expect(mockCreateOTP).not.toHaveBeenCalled();
      // Should still send the email
      expect(mockEmailSend).toHaveBeenCalled();
    });

    it('sets OTP cookie on fresh challenge', async () => {
      const req = createRequest('/api/client/send-otp', { email: 'test@test.com' });
      const res = await sendOTP(req);

      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('__presenzia_otp');
    });
  });

  describe('POST /api/client/verify-otp', () => {
    it('verifies valid code and creates session', async () => {
      mockVerifyOTP.mockReturnValue({ valid: true, email: 'test@test.com' });

      const req = createRequest('/api/client/verify-otp', { code: '123456' }, {
        __presenzia_otp: 'challenge_token',
      });
      const res = await verifyOTP(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(mockCreateSession).toHaveBeenCalledWith('test@test.com');

      // Should set session cookie and clear OTP cookie
      const cookies = res.headers.get('set-cookie');
      expect(cookies).toContain('__presenzia_client');
    });

    it('rejects invalid code', async () => {
      mockVerifyOTP.mockReturnValue({ valid: false });

      const req = createRequest('/api/client/verify-otp', { code: '000000' }, {
        __presenzia_otp: 'challenge_token',
      });
      const res = await verifyOTP(req);
      expect(res.status).toBe(401);
    });

    it('rejects missing OTP cookie', async () => {
      const req = createRequest('/api/client/verify-otp', { code: '123456' });
      const res = await verifyOTP(req);
      expect(res.status).toBe(400);
    });

    it('rejects missing code', async () => {
      const req = createRequest('/api/client/verify-otp', {}, {
        __presenzia_otp: 'challenge_token',
      });
      const res = await verifyOTP(req);
      expect(res.status).toBe(400);
    });
  });
});

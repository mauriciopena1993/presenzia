import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client-auth
vi.mock('@/lib/client-auth', () => ({
  verifySessionToken: vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' }),
  SESSION_COOKIE: '__presenzia_client',
}));

// Mock Stripe
const mockSubscriptionCancel = vi.fn().mockResolvedValue({});
vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      cancel: (...args: unknown[]) => mockSubscriptionCancel(...args),
    },
  },
}));

// Mock supabase
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  in: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'client-123', email: 'test@test.com', stripe_subscription_id: 'sub_123', stripe_customer_id: 'cus_123' },
                error: null,
              }),
            }),
          }),
          delete: () => mockDelete(),
        };
      }
      if (table === 'audit_jobs') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'job-1', report_path: 'reports/test.pdf' }],
              error: null,
            }),
          }),
          delete: () => mockDelete(),
        };
      }
      return { delete: () => mockDelete() };
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  },
}));

import { POST } from '@/app/api/client/delete/route';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>, cookies: Record<string, string> = { __presenzia_client: 'valid-token' }): NextRequest {
  const req = new NextRequest(new URL('http://localhost:3000/api/client/delete'), {
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
});

describe('POST /api/client/delete', () => {
  it('deletes account with confirmation', async () => {
    const req = createRequest({ confirm: true });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSubscriptionCancel).toHaveBeenCalledWith('sub_123');
  });

  it('clears session cookie on deletion', async () => {
    const req = createRequest({ confirm: true });
    const res = await POST(req);

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('__presenzia_client');
    expect(setCookie).toContain('Max-Age=0');
  });

  it('rejects without confirm=true', async () => {
    const req = createRequest({ confirm: false });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('confirm');
  });

  it('rejects unauthenticated requests', async () => {
    const req = createRequest({ confirm: true }, {});
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('handles missing Stripe subscription gracefully', async () => {
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'client-123', email: 'test@test.com', stripe_subscription_id: null, stripe_customer_id: null },
            error: null,
          }),
        }),
      }),
      delete: () => mockDelete(),
    } as never);

    const req = createRequest({ confirm: true });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSubscriptionCancel).not.toHaveBeenCalled();
  });
});

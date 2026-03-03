import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client-auth
vi.mock('@/lib/client-auth', () => ({
  verifySessionToken: vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' }),
  SESSION_COOKIE: '__presenzia_client',
}));

// Mock supabase
const mockUpsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: { id: 'rating-1', rating: 5, comment: null, created_at: '2024-01-15' },
      error: null,
    }),
  }),
});

const mockClientUpdate = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'client-123', business_name: 'Test Wealth' },
                error: null,
              }),
            }),
          }),
          update: (...args: unknown[]) => {
            mockClientUpdate(...args);
            return {
              eq: vi.fn().mockReturnValue({
                then: vi.fn().mockImplementation((cb: (v: { error: null }) => void) => cb({ error: null })),
              }),
            };
          },
        };
      }
      if (table === 'audit_jobs') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'job-1' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'report_ratings') {
        return {
          upsert: (...args: unknown[]) => {
            mockUpsert(...args);
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'rating-1', rating: 5, comment: null, created_at: '2024-01-15' },
                  error: null,
                }),
              }),
            };
          },
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) };
    }),
  },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ id: 'email-1' });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

// Mock email templates
vi.mock('@/lib/email/templates', () => ({
  FROM_EMAIL: 'test@test.com',
  adminDissatisfiedAlert: vi.fn().mockReturnValue({
    subject: 'Dissatisfied client',
    html: '<p>Alert</p>',
  }),
}));

import { POST, GET } from '@/app/api/client/rate/route';
import { NextRequest } from 'next/server';

function createRequest(
  path: string,
  method: string,
  body?: Record<string, unknown>,
  cookies: Record<string, string> = { __presenzia_client: 'valid-token' },
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');
  const init: Record<string, unknown> = { method, headers: { 'content-type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  const req = new NextRequest(url, init as never);
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
});

describe('POST /api/client/rate', () => {
  it('upserts a 5-star rating', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 5 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.rating).toBeTruthy();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5, audit_job_id: 'job-1' }),
      expect.any(Object),
    );
  });

  it('suppresses marketing on 1-3 star ratings', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 2, comment: 'Not good' });
    await POST(req);

    expect(mockClientUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ marketing_suppressed: true }),
    );
  });

  it('sends admin alert on dissatisfied rating', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 1 });
    await POST(req);

    expect(mockEmailSend).toHaveBeenCalled();
  });

  it('clears marketing suppression on 4-5 star ratings', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 4 });
    await POST(req);

    expect(mockClientUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ marketing_suppressed: false }),
    );
  });

  it('rejects invalid rating (0)', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 0 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects invalid rating (6)', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 6 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects non-integer rating', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 3.5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects missing jobId', async () => {
    const req = createRequest('/api/client/rate', 'POST', { rating: 5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated requests', async () => {
    const req = createRequest('/api/client/rate', 'POST', { jobId: 'job-1', rating: 5 }, {});
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/client/rate', () => {
  it('returns existing rating for job', async () => {
    const req = createRequest('/api/client/rate?jobId=job-1', 'GET');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('rating');
  });

  it('rejects missing jobId', async () => {
    const req = createRequest('/api/client/rate', 'GET');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated requests', async () => {
    const req = createRequest('/api/client/rate?jobId=job-1', 'GET', undefined, {});
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

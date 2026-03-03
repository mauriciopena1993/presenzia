import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
const mockJobInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: 'new-job-123' }, error: null }),
  }),
});

const mockClients = [
  { id: 'client-1', email: 'growth@test.com', business_name: 'Growth Firm', plan: 'growth', status: 'active' },
  { id: 'client-2', email: 'premium@test.com', business_name: 'Premium Firm', plan: 'premium', status: 'active' },
];

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
            }),
          }),
        };
      }
      if (table === 'audit_jobs') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: 'old-job',
                        completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
              in: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }), // no pending
                }),
              }),
            }),
          }),
          insert: (...args: unknown[]) => {
            mockJobInsert(...args);
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'new-job-123' }, error: null }),
              }),
            };
          },
        };
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) };
    }),
  },
}));

// Mock fetch (for process-audit trigger)
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

import { GET } from '@/app/api/cron/reaudit/route';
import { NextRequest } from 'next/server';

function createCronRequest(authorized = true): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authorized) headers['authorization'] = 'Bearer test_cron_secret';
  return new NextRequest(new URL('http://localhost:3000/api/cron/reaudit'), {
    method: 'GET',
    headers,
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = 'test_cron_secret';
  process.env.INTERNAL_API_SECRET = 'test_internal_secret';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

describe('GET /api/cron/reaudit', () => {
  it('triggers re-audits for due clients', async () => {
    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.triggered).toBeGreaterThan(0);
    expect(data.total).toBe(2);
  });

  it('rejects unauthorized requests', async () => {
    const req = createCronRequest(false);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('rejects wrong cron secret', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/cron/reaudit'), {
      method: 'GET',
      headers: { authorization: 'Bearer wrong_secret' },
    } as never);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('creates new audit jobs for due clients', async () => {
    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    // Should have created audit jobs
    expect(mockJobInsert).toHaveBeenCalled();
    expect(data.results.some((r: { job_id?: string }) => r.job_id)).toBe(true);
  });

  it('returns 500 when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest(new URL('http://localhost:3000/api/cron/reaudit'), {
      method: 'GET',
      headers: { authorization: 'Bearer anything' },
    } as never);
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

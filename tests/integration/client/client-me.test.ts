import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client-auth
vi.mock('@/lib/client-auth', () => ({
  verifySessionToken: vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' }),
  SESSION_COOKIE: '__presenzia_client',
}));

// Mock supabase
const mockClient = {
  id: 'client-123',
  email: 'test@test.com',
  plan: 'growth',
  status: 'active',
  business_name: 'Test Wealth',
  business_type: 'IFA',
  location: 'London',
  website: 'https://test.com',
  keywords: 'wealth',
  created_at: '2024-01-01',
  pending_plan_change: null,
  pending_change_date: null,
};

const mockLatestJob = {
  id: 'job-1',
  status: 'completed',
  overall_score: 75,
  grade: 'B',
  summary: 'Good visibility',
  platforms_json: [],
  competitors_json: [],
  report_path: '/reports/test.pdf',
  created_at: '2024-01-15',
  completed_at: '2024-01-15',
  insights_json: null,
};

const mockPendingJob = null;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
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
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockLatestJob, error: null }),
                  }),
                }),
              }),
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockPendingJob, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) };
    }),
  },
}));

import { GET } from '@/app/api/client/me/route';
import { NextRequest } from 'next/server';

function createGetRequest(cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL('http://localhost:3000/api/client/me'), { method: 'GET' } as never);
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

describe('GET /api/client/me', () => {
  it('returns client data with latest job for authenticated user', async () => {
    const req = createGetRequest({ __presenzia_client: 'valid-token' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.client.email).toBe('test@test.com');
    expect(data.client.plan).toBe('growth');
    expect(data.client.business_name).toBe('Test Wealth');
    expect(data.latestJob).toBeTruthy();
    expect(data.latestJob.overall_score).toBe(75);
  });

  it('rejects unauthenticated requests', async () => {
    const req = createGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('rejects invalid session token', async () => {
    const { verifySessionToken } = await import('@/lib/client-auth');
    vi.mocked(verifySessionToken).mockReturnValueOnce({ valid: false, email: null } as never);

    const req = createGetRequest({ __presenzia_client: 'invalid-token' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns client even with pending plan fields', async () => {
    mockClient.pending_plan_change = null;
    const req = createGetRequest({ __presenzia_client: 'valid-token' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.client.pending_plan_change).toBeNull();
  });

  it('includes pending plan change info', async () => {
    mockClient.pending_plan_change = 'audit' as never;
    mockClient.pending_change_date = '2024-02-01' as never;

    const req = createGetRequest({ __presenzia_client: 'valid-token' });
    const res = await GET(req);
    const data = await res.json();

    expect(data.client.pending_plan_change).toBe('audit');
    expect(data.client.pending_change_date).toBe('2024-02-01');

    // Reset
    mockClient.pending_plan_change = null;
    mockClient.pending_change_date = null;
  });
});

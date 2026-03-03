import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock data ──────────────────────────────────────────────────────────
const mockClient = {
  id: 'client-123',
  email: 'client@example.com',
  business_name: 'Wealth Partners Ltd',
  marketing_suppressed: false,
};

const mockFreeScore = {
  email: 'freescore@example.com',
  business_name: 'Free Score Advisors',
};

// ── Track mock behaviour per-test ──────────────────────────────────────
let clientSelectResult: { data: typeof mockClient | null; error: null } = {
  data: mockClient,
  error: null,
};
let freeScoreSelectResult: { data: typeof mockFreeScore | null; error: null } = {
  data: mockFreeScore,
  error: null,
};
let clientUpdateResult: { data: { id: string } | null; error: null | { message: string } } = {
  data: { id: 'client-123' },
  error: null,
};

// ── Mock supabase BEFORE importing route ───────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          // GET path: select → eq → single
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(clientSelectResult),
            }),
          }),
          // POST path: update → eq → select → single
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(clientUpdateResult),
              }),
            }),
          }),
        };
      }
      if (table === 'free_scores') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(freeScoreSelectResult),
              }),
            }),
          }),
        };
      }
      // Fallback for unknown tables
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    }),
  },
}));

// ── Import route AFTER mocks ───────────────────────────────────────────
import { GET, POST } from '@/app/api/email-preferences/route';
import { NextRequest } from 'next/server';

// ── Request helpers ────────────────────────────────────────────────────
function createGetRequest(email?: string): NextRequest {
  const url = email
    ? `http://localhost:3000/api/email-preferences?email=${encodeURIComponent(email)}`
    : 'http://localhost:3000/api/email-preferences';
  return new NextRequest(new URL(url), { method: 'GET' } as never);
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/email-preferences'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } as never);
}

// ── Reset mocks & data between tests ───────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  // Reset to defaults
  clientSelectResult = { data: { ...mockClient }, error: null };
  freeScoreSelectResult = { data: { ...mockFreeScore }, error: null };
  clientUpdateResult = { data: { id: 'client-123' }, error: null };
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/email-preferences
// ═══════════════════════════════════════════════════════════════════════
describe('GET /api/email-preferences', () => {
  it('returns 400 when email param is missing', async () => {
    const req = createGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing email');
  });

  it('returns client data when email matches a client', async () => {
    const req = createGetRequest('client@example.com');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBe(true);
    expect(data.email).toBe('client@example.com');
    expect(data.business_name).toBe('Wealth Partners Ltd');
    expect(data.marketing_suppressed).toBe(false);
  });

  it('returns marketing_suppressed true when client has it set', async () => {
    clientSelectResult = {
      data: { ...mockClient, marketing_suppressed: true },
      error: null,
    };

    const req = createGetRequest('client@example.com');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBe(true);
    expect(data.marketing_suppressed).toBe(true);
  });

  it('falls back to free_scores when no client found', async () => {
    clientSelectResult = { data: null, error: null };

    const req = createGetRequest('freescore@example.com');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBe(true);
    expect(data.email).toBe('freescore@example.com');
    expect(data.business_name).toBe('Free Score Advisors');
    expect(data.marketing_suppressed).toBe(false);
  });

  it('returns found: false when email is not in clients or free_scores', async () => {
    clientSelectResult = { data: null, error: null };
    freeScoreSelectResult = { data: null, error: null };

    const req = createGetRequest('nobody@example.com');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBe(false);
  });

  it('handles email with special characters correctly', async () => {
    clientSelectResult = {
      data: { ...mockClient, email: 'test+tag@example.com' },
      error: null,
    };

    const req = createGetRequest('test+tag@example.com');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBe(true);
    expect(data.email).toBe('test+tag@example.com');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/email-preferences
// ═══════════════════════════════════════════════════════════════════════
describe('POST /api/email-preferences', () => {
  it('returns 400 when email is missing', async () => {
    const req = createPostRequest({ marketing_suppressed: true });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 when marketing_suppressed is missing', async () => {
    const req = createPostRequest({ email: 'client@example.com' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 when marketing_suppressed is not a boolean', async () => {
    const req = createPostRequest({
      email: 'client@example.com',
      marketing_suppressed: 'yes',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 when body is empty', async () => {
    const req = createPostRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('updates marketing_suppressed to true for existing client', async () => {
    clientUpdateResult = { data: { id: 'client-123' }, error: null };

    const req = createPostRequest({
      email: 'client@example.com',
      marketing_suppressed: true,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.marketing_suppressed).toBe(true);
  });

  it('updates marketing_suppressed to false for existing client', async () => {
    clientUpdateResult = { data: { id: 'client-123' }, error: null };

    const req = createPostRequest({
      email: 'client@example.com',
      marketing_suppressed: false,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.marketing_suppressed).toBe(false);
  });

  it('returns success with note when client record not found (free score user)', async () => {
    clientUpdateResult = { data: null, error: null };

    const req = createPostRequest({
      email: 'freescore@example.com',
      marketing_suppressed: true,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.note).toBeTruthy();
    expect(data.marketing_suppressed).toBeUndefined();
  });

  it('returns success with note when update errors', async () => {
    clientUpdateResult = {
      data: null,
      error: { message: 'No rows returned' },
    };

    const req = createPostRequest({
      email: 'unknown@example.com',
      marketing_suppressed: true,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.note).toBeTruthy();
  });
});

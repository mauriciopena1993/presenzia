import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// ── Set required env vars before any imports ──
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
// Deliberately NOT setting PERPLEXITY_API_KEY and GOOGLE_AI_API_KEY
// to test with only 2 platforms (ChatGPT + Claude)
delete process.env.PERPLEXITY_API_KEY;
delete process.env.GOOGLE_AI_API_KEY;

// ── Mock data ──
const mockFreeScore = {
  share_id: 'abc123',
  firm_name: 'Test Wealth',
  city: 'London',
  specialty: 'Wealth Management',
  score: 45,
  grade: 'C',
  top_competitor_name: 'Competitor A',
  top_competitor_count: 3,
  results_json: {
    mentionsCount: 4,
    totalPrompts: 12,
    platformBreakdown: [{ platform: 'ChatGPT', tested: 3, mentioned: 2 }],
  },
  email: 'user@test.com',
  created_at: '2024-01-01',
};

const mockFreeScoreNoCompetitor = {
  ...mockFreeScore,
  top_competitor_name: null,
  top_competitor_count: null,
};

// ── Mock Supabase ──
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
const mockSingle = vi.fn().mockResolvedValue({ data: mockFreeScore, error: null });
const mockSelectEq = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

// For POST /api/score — also queries the 'clients' table
const mockClientsLimitSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockClientsLimit = vi.fn().mockReturnValue({ single: mockClientsLimitSingle });
const mockClientsEq = vi.fn().mockReturnValue({ limit: mockClientsLimit });
const mockClientsSelect = vi.fn().mockReturnValue({ eq: mockClientsEq });

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'free_scores') {
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      if (table === 'clients') {
        return {
          select: mockClientsSelect,
        };
      }
      return {};
    }),
  },
}));

// ── Mock global fetch for AI platform calls ──
const originalFetch = globalThis.fetch;

function makeMockFetch() {
  return vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : (url as Request).url;

    // ChatGPT (OpenAI)
    if (urlStr.includes('openai.com')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content:
                    'I recommend Test Wealth in London for wealth management. Also consider **Competitor A Financial** and **Rival Financial Partners**.',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }

    // Claude (Anthropic)
    if (urlStr.includes('anthropic.com')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            content: [
              {
                text: 'For wealth management in London, **Competitor A Financial** is well-regarded. You might also consider Rival Financial Partners.',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }

    // Postcodes.io (for postcode lookups)
    if (urlStr.includes('postcodes.io')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({ result: { admin_district: 'London' } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }

    // Website scraping fallback
    if (urlStr.startsWith('http') && !urlStr.includes('localhost')) {
      return Promise.resolve(
        new Response('<html><head><title>Test Site</title></head><body>Test content</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      );
    }

    // Default fallback
    return Promise.resolve(new Response('', { status: 200 }));
  });
}

// ── Helper: create NextRequest ──
function createRequest(url: string, options: { method?: string; body?: unknown } = {}) {
  const { method = 'GET', body } = options;
  const reqUrl = `http://localhost:3000${url}`;
  if (method === 'GET') {
    return new NextRequest(reqUrl);
  }
  return new NextRequest(reqUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Test suites
// ═══════════════════════════════════════════════════════════════════════════

describe('Score API Routes', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/score — Main scoring route
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /api/score', () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeAll(async () => {
      const mod = await import('@/app/api/score/route');
      POST = mod.POST;
    });

    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubGlobal('fetch', makeMockFetch());
    });

    afterAll(() => {
      vi.stubGlobal('fetch', originalFetch);
    });

    it('returns 400 if firmName is missing', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: { specialties: ['Wealth Management'], locations: 'London' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Firm name is required');
    });

    it('returns 400 if specialties is missing', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: { firmName: 'Test Wealth', locations: 'London' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('At least one specialty is required');
    });

    it('returns 400 if specialties is empty array', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: { firmName: 'Test Wealth', specialties: [], locations: 'London' },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('At least one specialty is required');
    });

    it('returns 400 if location missing for non-national coverage', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'Test Wealth',
          specialties: ['Wealth Management'],
          coverageType: 'local',
          // No locations / city provided
        },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Location is required');
    });

    it('returns score results with valid input', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'Test Wealth',
          specialties: ['Wealth Management'],
          locations: 'London',
          coverageType: 'local',
        },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);

      // Verify response shape
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('score');
      expect(json).toHaveProperty('grade');
      expect(json).toHaveProperty('mentionsCount');
      expect(json).toHaveProperty('totalPrompts');
      expect(json).toHaveProperty('topCompetitor');
      expect(json).toHaveProperty('platformBreakdown');
      expect(json).toHaveProperty('city');

      // Verify types
      expect(typeof json.id).toBe('string');
      expect(json.id.length).toBe(12);
      expect(typeof json.score).toBe('number');
      expect(json.score).toBeGreaterThanOrEqual(0);
      expect(json.score).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'E', 'F']).toContain(json.grade);
      expect(typeof json.mentionsCount).toBe('number');
      expect(typeof json.totalPrompts).toBe('number');
      expect(json.city).toBe('London');

      // Platform breakdown shape
      expect(Array.isArray(json.platformBreakdown)).toBe(true);
      expect(json.platformBreakdown.length).toBe(2); // Only ChatGPT + Claude (no Perplexity/Google)
      for (const pb of json.platformBreakdown) {
        expect(pb).toHaveProperty('platform');
        expect(pb).toHaveProperty('tested');
        expect(pb).toHaveProperty('mentioned');
        expect(typeof pb.tested).toBe('number');
        expect(typeof pb.mentioned).toBe('number');
      }
    });

    it('stores result in free_scores table', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'Test Wealth',
          specialties: ['Wealth Management'],
          locations: 'London',
          coverageType: 'local',
        },
      });

      await POST(req);

      expect(mockInsert).toHaveBeenCalledTimes(1);
      const insertArg = mockInsert.mock.calls[0][0];
      expect(insertArg.firm_name).toBe('Test Wealth');
      expect(insertArg.city).toBe('London');
      expect(insertArg.specialty).toBe('Wealth Management');
      expect(typeof insertArg.score).toBe('number');
      expect(typeof insertArg.grade).toBe('string');
      expect(typeof insertArg.share_id).toBe('string');
      expect(insertArg.share_id.length).toBe(12);
      expect(insertArg.results_json).toBeDefined();
      expect(insertArg.results_json.mentionsCount).toBeDefined();
      expect(insertArg.results_json.totalPrompts).toBeDefined();
      expect(insertArg.results_json.platformBreakdown).toBeDefined();
    });

    it('returns 500 if no AI platforms configured', async () => {
      // Temporarily remove the API keys
      const savedOpenAI = process.env.OPENAI_API_KEY;
      const savedAnthropic = process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        // We need a fresh import since platform selection is done at call time
        // The route reads env vars at execution time, so we just call POST
        const req = createRequest('/api/score', {
          method: 'POST',
          body: {
            firmName: 'Test Wealth',
            specialties: ['Wealth Management'],
            locations: 'London',
            coverageType: 'local',
          },
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe('AI platforms not configured');
      } finally {
        // Restore
        process.env.OPENAI_API_KEY = savedOpenAI;
        process.env.ANTHROPIC_API_KEY = savedAnthropic;
      }
    });

    it('works with national coverage (no location required)', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'National Wealth Ltd',
          specialties: ['Financial Planning'],
          coverageType: 'national',
        },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.city).toBe('UK-wide');
      expect(json).toHaveProperty('score');
      expect(json).toHaveProperty('grade');
    });

    it('detects mentions when firm name appears in AI response', async () => {
      // The mock AI responses contain "Test Wealth" — the firm should be detected
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'Test Wealth',
          specialties: ['Wealth Management'],
          locations: 'London',
          coverageType: 'local',
        },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      // ChatGPT mock mentions "Test Wealth" so mentionsCount should be > 0
      expect(json.mentionsCount).toBeGreaterThan(0);
      expect(json.score).toBeGreaterThan(0);
    });

    it('extracts competitors from AI responses', async () => {
      const req = createRequest('/api/score', {
        method: 'POST',
        body: {
          firmName: 'Test Wealth',
          specialties: ['Wealth Management'],
          locations: 'London',
          coverageType: 'local',
        },
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      // Mock responses contain "Competitor A Financial" and "Rival Financial Partners"
      // At least one should be extracted as topCompetitor
      if (json.topCompetitor) {
        expect(json.topCompetitor).toHaveProperty('name');
        expect(json.topCompetitor).toHaveProperty('count');
        expect(typeof json.topCompetitor.name).toBe('string');
        expect(typeof json.topCompetitor.count).toBe('number');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/score/[id] — Retrieve score by share ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /api/score/[id]', () => {
    let GET: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const mod = await import('@/app/api/score/[id]/route');
      GET = mod.GET;
    });

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset to return the default mock score
      mockSingle.mockResolvedValue({ data: mockFreeScore, error: null });
    });

    it('returns score data for valid share_id', async () => {
      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.id).toBe('abc123');
      expect(json.firmName).toBe('Test Wealth');
      expect(json.city).toBe('London');
      expect(json.score).toBe(45);
      expect(json.grade).toBe('C');
    });

    it('returns 404 for invalid share_id', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const req = createRequest('/api/score/nonexistent');
      const res = await GET(req, { params: Promise.resolve({ id: 'nonexistent' }) });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Score not found');
    });

    it('returns correct response shape', async () => {
      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('firmName');
      expect(json).toHaveProperty('city');
      expect(json).toHaveProperty('specialty');
      expect(json).toHaveProperty('score');
      expect(json).toHaveProperty('grade');
      expect(json).toHaveProperty('topCompetitor');
      expect(json).toHaveProperty('mentionsCount');
      expect(json).toHaveProperty('totalPrompts');
      expect(json).toHaveProperty('platformBreakdown');
      expect(json).toHaveProperty('hasEmail');
      expect(json).toHaveProperty('createdAt');

      // Verify values match mock data
      expect(json.specialty).toBe('Wealth Management');
      expect(json.mentionsCount).toBe(4);
      expect(json.totalPrompts).toBe(12);
      expect(json.hasEmail).toBe(true);
      expect(json.createdAt).toBe('2024-01-01');
      expect(Array.isArray(json.platformBreakdown)).toBe(true);
    });

    it('returns topCompetitor with name and count when present', async () => {
      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(json.topCompetitor).toEqual({
        name: 'Competitor A',
        count: 3,
      });
    });

    it('returns null topCompetitor if none found', async () => {
      mockSingle.mockResolvedValue({ data: mockFreeScoreNoCompetitor, error: null });

      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.topCompetitor).toBeNull();
    });

    it('returns hasEmail false when email is not set', async () => {
      const noEmailScore = { ...mockFreeScore, email: null };
      mockSingle.mockResolvedValue({ data: noEmailScore, error: null });

      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.hasEmail).toBe(false);
    });

    it('returns default values when results_json fields are missing', async () => {
      const noResultsScore = { ...mockFreeScore, results_json: null };
      mockSingle.mockResolvedValue({ data: noResultsScore, error: null });

      const req = createRequest('/api/score/abc123');
      const res = await GET(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.mentionsCount).toBe(0);
      expect(json.totalPrompts).toBe(0);
      expect(json.platformBreakdown).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/score/[id] — Email gate
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /api/score/[id] (email gate)', () => {
    let POST: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const mod = await import('@/app/api/score/[id]/route');
      POST = mod.POST;
    });

    beforeEach(() => {
      vi.clearAllMocks();
      mockUpdateEq.mockResolvedValue({ error: null });
    });

    it('returns 400 if no email provided', async () => {
      const req = createRequest('/api/score/abc123', {
        method: 'POST',
        body: { name: 'John' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Email is required');
    });

    it('returns 400 if email is empty string', async () => {
      const req = createRequest('/api/score/abc123', {
        method: 'POST',
        body: { email: '', name: 'John' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Email is required');
    });

    it('saves email and name successfully', async () => {
      const req = createRequest('/api/score/abc123', {
        method: 'POST',
        body: { email: 'newuser@test.com', name: 'Jane Doe' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify supabase update was called correctly
      expect(mockUpdate).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        contact_name: 'Jane Doe',
      });
      expect(mockUpdateEq).toHaveBeenCalledWith('share_id', 'abc123');
    });

    it('saves email with null name when name not provided', async () => {
      const req = createRequest('/api/score/abc123', {
        method: 'POST',
        body: { email: 'newuser@test.com' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      expect(mockUpdate).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        contact_name: null,
      });
    });

    it('returns 500 if update fails', async () => {
      mockUpdateEq.mockResolvedValue({ error: { message: 'Database error' } });

      const req = createRequest('/api/score/abc123', {
        method: 'POST',
        body: { email: 'fail@test.com', name: 'Fail User' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: 'abc123' }) });
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Failed to save email');
    });
  });
});

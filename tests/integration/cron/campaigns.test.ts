import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Env vars (set before any imports that read them) ─────────────────────────
process.env.CRON_SECRET = 'test-cron-secret';
process.env.RESEND_API_KEY = 'test-resend-key';

// ── Date helpers ─────────────────────────────────────────────────────────────
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// ── Mock data ────────────────────────────────────────────────────────────────
const mockFreeScores = [
  { email: 'lead1@test.com', business_name: 'Lead Firm 1', overall_score: 30, created_at: daysAgo(1.5) }, // Should get nurture email 1
  { email: 'lead2@test.com', business_name: 'Lead Firm 2', overall_score: 50, created_at: daysAgo(4) },   // Should get nurture email 2
  { email: 'lead3@test.com', business_name: 'Lead Firm 3', overall_score: 70, created_at: daysAgo(8) },   // Should get nurture email 3
  { email: null, business_name: 'No Email Firm', overall_score: 40, created_at: daysAgo(2) },              // Should be skipped (no email)
];

const mockRecentAudits = [
  {
    id: 'audit-1',
    client_id: 'client-1',
    overall_score: 60,
    completed_at: daysAgo(3),
    clients: { email: 'client1@test.com', business_name: 'Client Firm 1', marketing_suppressed: false },
  },
];

const mockHappyRatings = [
  {
    id: 'rating-1',
    client_id: 'client-2',
    rating: 5,
    created_at: hoursAgo(18),
    clients: { email: 'happy@test.com', business_name: 'Happy Firm', marketing_suppressed: false },
  },
];

const mockDissatisfiedRatings = [
  {
    id: 'rating-2',
    client_id: 'client-3',
    rating: 2,
    created_at: daysAgo(1.5),
    clients: { email: 'unhappy@test.com', business_name: 'Unhappy Firm', marketing_suppressed: false },
  },
];

const mockCancelledClients = [
  {
    id: 'client-4',
    email: 'cancelled@test.com',
    business_name: 'Cancelled Firm',
    status: 'cancelled',
    updated_at: daysAgo(8),
    marketing_suppressed: false,
  },
];

// ── Track mock state ─────────────────────────────────────────────────────────
// NOTE: vi.hoisted() ensures these are available when hoisted vi.mock() factories run.
const { mockEmailSend, mockCampaignInsert } = vi.hoisted(() => ({
  mockEmailSend: vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null }),
  mockCampaignInsert: vi.fn().mockResolvedValue({ error: null }),
}));

// These allow individual tests to override mock data
let currentFreeScores = mockFreeScores;
let currentRecentAudits = mockRecentAudits;
let currentHappyRatings = mockHappyRatings;
let currentDissatisfiedRatings = mockDissatisfiedRatings;
let currentCancelledClients = mockCancelledClients;
let clientLookupByEmail: Record<string, unknown> = {};
let clientLookupById: Record<string, { marketing_suppressed: boolean }> = {};
let existingRatingForAudit: Record<string, unknown> = {};
let sentCampaignKeys: Set<string> = new Set();

// ── Supabase mock ────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      // ── free_scores table ──
      if (table === 'free_scores') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: currentFreeScores, error: null }),
            }),
          }),
        };
      }

      // ── audit_jobs table ──
      if (table === 'audit_jobs') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: currentRecentAudits, error: null }),
                }),
              }),
            }),
          }),
        };
      }

      // ── report_ratings table ──
      if (table === 'report_ratings') {
        return {
          select: vi.fn().mockImplementation(() => ({
            // .gte('rating', 4) → happy ratings
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: currentHappyRatings, error: null }),
              }),
            }),
            // .lte('rating', 3) → dissatisfied ratings
            lte: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: currentDissatisfiedRatings, error: null }),
              }),
            }),
            // .eq('audit_job_id', ...) → existing rating check
            eq: vi.fn().mockImplementation((_col: string, auditJobId: string) => ({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: existingRatingForAudit[auditJobId] || null,
                  error: existingRatingForAudit[auditJobId] ? null : { code: 'PGRST116' },
                }),
              }),
            })),
          })),
        };
      }

      // ── campaign_emails table ──
      if (table === 'campaign_emails') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation((_col: string, _email: string) => ({
              eq: vi.fn().mockImplementation((_col2: string, campaignKey: string) => ({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockImplementation(() => {
                    // If we've recorded this campaign key as sent, return data
                    if (sentCampaignKeys.has(campaignKey)) {
                      return Promise.resolve({ data: { id: 'existing' }, error: null });
                    }
                    return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
                  }),
                }),
              })),
            })),
          }),
          insert: (...args: unknown[]) => {
            mockCampaignInsert(...args);
            return Promise.resolve({ error: null });
          },
        };
      }

      // ── clients table ──
      if (table === 'clients') {
        return {
          select: vi.fn().mockImplementation((selectStr: string) => {
            // Two usage patterns:
            // 1. .select('id').eq('email', ...) → check if lead converted to client (free_scores campaign)
            // 2. .select('marketing_suppressed').eq('id', ...) → check marketing suppression
            // 3. .select('id, email, business_name, ...').eq('status', 'cancelled') → cancelled clients

            if (selectStr.includes('marketing_suppressed') && !selectStr.includes('email')) {
              // isMarketingSuppressed check: .select('marketing_suppressed').eq('id', clientId).single()
              return {
                eq: vi.fn().mockImplementation((_col: string, clientId: string) => ({
                  single: vi.fn().mockResolvedValue({
                    data: clientLookupById[clientId] || { marketing_suppressed: false },
                    error: null,
                  }),
                })),
              };
            }

            if (selectStr.startsWith('id') && !selectStr.includes(',')) {
              // Client lookup by email: .select('id').eq('email', email).limit(1).single()
              return {
                eq: vi.fn().mockImplementation((_col: string, email: string) => ({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: clientLookupByEmail[email] || null,
                      error: clientLookupByEmail[email] ? null : { code: 'PGRST116' },
                    }),
                  }),
                })),
              };
            }

            // Cancelled clients query: .select('id, email, ...').eq('status', 'cancelled').limit(200)
            return {
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: currentCancelledClients, error: null }),
              }),
            };
          }),
        };
      }

      // Fallback
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
    }),
  },
}));

// ── Mock Resend ──────────────────────────────────────────────────────────────
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockEmailSend };
    },
  };
});

// ── Mock email templates ─────────────────────────────────────────────────────
vi.mock('@/lib/email/templates', () => ({
  FROM_EMAIL: 'test@presenzia.ai',
  REPLY_TO: 'reply@presenzia.ai',
  freeScoreNurture1: vi.fn().mockReturnValue({ subject: 'Nurture 1', html: '<p>Nurture 1</p>' }),
  freeScoreNurture2: vi.fn().mockReturnValue({ subject: 'Nurture 2', html: '<p>Nurture 2</p>' }),
  freeScoreNurture3: vi.fn().mockReturnValue({ subject: 'Nurture 3', html: '<p>Nurture 3</p>' }),
  ratingRequest: vi.fn().mockReturnValue({ subject: 'Rate us', html: '<p>Rate</p>' }),
  happyReviewRequest: vi.fn().mockReturnValue({ subject: 'Review', html: '<p>Review</p>' }),
  happyReferralRequest: vi.fn().mockReturnValue({ subject: 'Refer', html: '<p>Refer</p>' }),
  happySocialFollow: vi.fn().mockReturnValue({ subject: 'Follow', html: '<p>Follow</p>' }),
  dissatisfiedOutreach: vi.fn().mockReturnValue({ subject: 'Sorry', html: '<p>Sorry</p>' }),
  winBack1: vi.fn().mockReturnValue({ subject: 'Come back', html: '<p>Come back</p>' }),
  winBack2: vi.fn().mockReturnValue({ subject: 'Miss you', html: '<p>Miss you</p>' }),
}));

// ── Import the route handler (AFTER all mocks) ──────────────────────────────
import { GET } from '@/app/api/cron/campaigns/route';
import { NextRequest } from 'next/server';

// ── Request helper ───────────────────────────────────────────────────────────
function createCronRequest(authorized = true): NextRequest {
  const headers: Record<string, string> = {};
  if (authorized) headers['authorization'] = 'Bearer test-cron-secret';
  return new NextRequest(new URL('http://localhost:3000/api/cron/campaigns'), {
    method: 'GET',
    headers,
  });
}

// ── Test setup ───────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = 'test-cron-secret';
  process.env.RESEND_API_KEY = 'test-resend-key';

  // Reset mock data to defaults
  currentFreeScores = mockFreeScores;
  currentRecentAudits = mockRecentAudits;
  currentHappyRatings = mockHappyRatings;
  currentDissatisfiedRatings = mockDissatisfiedRatings;
  currentCancelledClients = mockCancelledClients;
  clientLookupByEmail = {};
  clientLookupById = {};
  existingRatingForAudit = {};
  sentCampaignKeys = new Set();
});

// =============================================================================
// AUTH TESTS
// =============================================================================
describe('GET /api/cron/campaigns — Auth', () => {
  it('returns 401 if no authorization header', async () => {
    const req = createCronRequest(false);
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 if wrong cron secret', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/cron/campaigns'), {
      method: 'GET',
      headers: { authorization: 'Bearer wrong-secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 500 if CRON_SECRET env var is not set', async () => {
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;

    const req = new NextRequest(new URL('http://localhost:3000/api/cron/campaigns'), {
      method: 'GET',
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Server misconfigured');

    process.env.CRON_SECRET = saved;
  });
});

// =============================================================================
// HAPPY-PATH: FULL RUN
// =============================================================================
describe('GET /api/cron/campaigns — Happy path', () => {
  it('returns success with stats for a normal run', async () => {
    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(typeof data.stats.sent).toBe('number');
    expect(typeof data.stats.skipped).toBe('number');
    expect(typeof data.stats.errors).toBe('number');
  });

  it('sends emails and stats.sent > 0 when campaigns are due', async () => {
    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBeGreaterThan(0);
    expect(mockEmailSend).toHaveBeenCalled();
  });

  it('records campaign emails after sending', async () => {
    const req = createCronRequest();
    await GET(req);

    // recordSent is called via supabase.from('campaign_emails').insert(...)
    expect(mockCampaignInsert).toHaveBeenCalled();
  });
});

// =============================================================================
// CAMPAIGN 1: FREE SCORE NURTURE
// =============================================================================
describe('GET /api/cron/campaigns — Free Score Nurture', () => {
  it('sends nurture email 1 for scores 1-3 days old', async () => {
    // Only include one score in the 1-3 day window
    currentFreeScores = [
      { email: 'lead1@test.com', business_name: 'Lead Firm 1', overall_score: 30, created_at: daysAgo(1.5) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lead1@test.com',
        subject: 'Nurture 1',
      }),
    );
  });

  it('sends nurture email 2 for scores 3-7 days old', async () => {
    currentFreeScores = [
      { email: 'lead2@test.com', business_name: 'Lead Firm 2', overall_score: 50, created_at: daysAgo(4) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lead2@test.com',
        subject: 'Nurture 2',
      }),
    );
  });

  it('sends nurture email 3 for scores 7-14 days old', async () => {
    currentFreeScores = [
      { email: 'lead3@test.com', business_name: 'Lead Firm 3', overall_score: 70, created_at: daysAgo(8) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lead3@test.com',
        subject: 'Nurture 3',
      }),
    );
  });

  it('skips free scores with no email', async () => {
    currentFreeScores = [
      { email: null, business_name: 'No Email Firm', overall_score: 40, created_at: daysAgo(2) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('skips leads that already converted to clients', async () => {
    currentFreeScores = [
      { email: 'converted@test.com', business_name: 'Converted Firm', overall_score: 45, created_at: daysAgo(2) },
    ];
    // Mark this email as belonging to an existing client
    clientLookupByEmail = { 'converted@test.com': { id: 'existing-client-99' } };
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('does not send nurture for scores less than 1 day old', async () => {
    currentFreeScores = [
      { email: 'toosoon@test.com', business_name: 'Too Soon Firm', overall_score: 60, created_at: hoursAgo(12) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('does not send nurture for scores older than 14 days', async () => {
    currentFreeScores = [
      { email: 'old@test.com', business_name: 'Old Firm', overall_score: 35, created_at: daysAgo(15) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CAMPAIGN 2: POST-AUDIT RATING REQUEST
// =============================================================================
describe('GET /api/cron/campaigns — Post-Audit Rating Request', () => {
  it('sends rating request for audits completed 2-7 days ago', async () => {
    currentFreeScores = [];
    currentRecentAudits = [
      {
        id: 'audit-1',
        client_id: 'client-1',
        overall_score: 60,
        completed_at: daysAgo(3),
        clients: { email: 'client1@test.com', business_name: 'Client Firm 1', marketing_suppressed: false },
      },
    ];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'client1@test.com',
        subject: 'Rate us',
      }),
    );
  });

  it('skips if audit already has a rating', async () => {
    currentFreeScores = [];
    currentRecentAudits = [
      {
        id: 'audit-rated',
        client_id: 'client-1',
        overall_score: 60,
        completed_at: daysAgo(3),
        clients: { email: 'rated@test.com', business_name: 'Already Rated Firm', marketing_suppressed: false },
      },
    ];
    existingRatingForAudit = { 'audit-rated': { id: 'existing-rating' } };
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('respects marketing_suppressed for audit rating requests', async () => {
    currentFreeScores = [];
    currentRecentAudits = [
      {
        id: 'audit-suppressed',
        client_id: 'client-suppressed',
        overall_score: 55,
        completed_at: daysAgo(3),
        clients: { email: 'suppressed@test.com', business_name: 'Suppressed Firm', marketing_suppressed: true },
      },
    ];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CAMPAIGN 3: HAPPY CUSTOMER SEQUENCE
// =============================================================================
describe('GET /api/cron/campaigns — Happy Customer', () => {
  it('sends review request for 4-5 star ratings (0.5-3 days old)', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [
      {
        id: 'rating-happy-1',
        client_id: 'client-happy',
        rating: 5,
        created_at: hoursAgo(18), // 0.75 days — within [0.5, 3)
        clients: { email: 'happy@test.com', business_name: 'Happy Firm', marketing_suppressed: false },
      },
    ];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'happy@test.com',
        subject: 'Review',
      }),
    );
  });

  it('sends referral request for 4-5 star ratings (3-7 days old)', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [
      {
        id: 'rating-referral',
        client_id: 'client-referral',
        rating: 4,
        created_at: daysAgo(4), // 4 days — within [3, 7)
        clients: { email: 'referral@test.com', business_name: 'Referral Firm', marketing_suppressed: false },
      },
    ];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'referral@test.com',
        subject: 'Refer',
      }),
    );
  });

  it('sends social follow for 4-5 star ratings (7-14 days old)', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [
      {
        id: 'rating-social',
        client_id: 'client-social',
        rating: 5,
        created_at: daysAgo(10), // 10 days — within [7, 14)
        clients: { email: 'social@test.com', business_name: 'Social Firm', marketing_suppressed: false },
      },
    ];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'social@test.com',
        subject: 'Follow',
      }),
    );
  });

  it('respects marketing_suppressed for happy customer emails', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [
      {
        id: 'rating-suppressed-happy',
        client_id: 'client-suppressed-happy',
        rating: 5,
        created_at: hoursAgo(18),
        clients: { email: 'suppressed-happy@test.com', business_name: 'Suppressed Happy', marketing_suppressed: true },
      },
    ];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CAMPAIGN 4: DISSATISFIED CUSTOMER OUTREACH
// =============================================================================
describe('GET /api/cron/campaigns — Dissatisfied Outreach', () => {
  it('sends dissatisfied outreach for 1-3 star ratings (1-7 days old)', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [
      {
        id: 'rating-unhappy-1',
        client_id: 'client-unhappy',
        rating: 2,
        created_at: daysAgo(1.5), // 1.5 days — within [1, 7)
        clients: { email: 'unhappy@test.com', business_name: 'Unhappy Firm', marketing_suppressed: false },
      },
    ];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'unhappy@test.com',
        subject: 'Sorry',
      }),
    );
  });

  it('does not send outreach for dissatisfied ratings less than 24h old', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [
      {
        id: 'rating-recent-unhappy',
        client_id: 'client-recent-unhappy',
        rating: 1,
        created_at: hoursAgo(12), // Too soon
        clients: { email: 'toosoon-unhappy@test.com', business_name: 'Too Soon', marketing_suppressed: false },
      },
    ];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CAMPAIGN 5: WIN-BACK
// =============================================================================
describe('GET /api/cron/campaigns — Win-back', () => {
  it('sends win-back email 1 for clients cancelled 7-14 days ago', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [
      {
        id: 'client-wb1',
        email: 'cancelled@test.com',
        business_name: 'Cancelled Firm',
        status: 'cancelled',
        updated_at: daysAgo(8), // 8 days — within [7, 14)
        marketing_suppressed: false,
      },
    ];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cancelled@test.com',
        subject: 'Come back',
      }),
    );
  });

  it('sends win-back email 2 for clients cancelled 30-45 days ago', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [
      {
        id: 'client-wb2',
        email: 'cancelled-long@test.com',
        business_name: 'Cancelled Long Firm',
        status: 'cancelled',
        updated_at: daysAgo(35), // 35 days — within [30, 45)
        marketing_suppressed: false,
      },
    ];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(1);
    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cancelled-long@test.com',
        subject: 'Miss you',
      }),
    );
  });

  it('skips cancelled clients with marketing_suppressed', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [
      {
        id: 'client-wb-suppressed',
        email: 'suppressed-cancelled@test.com',
        business_name: 'Suppressed Cancelled',
        status: 'cancelled',
        updated_at: daysAgo(8),
        marketing_suppressed: true,
      },
    ];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it('skips cancelled clients with no email', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [
      {
        id: 'client-wb-noemail',
        email: null,
        business_name: 'No Email Cancelled',
        status: 'cancelled',
        updated_at: daysAgo(8),
        marketing_suppressed: false,
      },
    ];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.sent).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// IDEMPOTENCY: ALREADY-SENT CAMPAIGNS
// =============================================================================
describe('GET /api/cron/campaigns — Idempotency', () => {
  it('skips campaigns that were already sent', async () => {
    // Mark the nurture 1 campaign as already sent for lead1
    sentCampaignKeys.add('free_score_nurture_1');
    currentFreeScores = [
      { email: 'lead1@test.com', business_name: 'Lead Firm 1', overall_score: 30, created_at: daysAgo(1.5) },
    ];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    // Should have been skipped because wasSent returned true
    expect(data.stats.skipped).toBeGreaterThanOrEqual(1);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

// =============================================================================
// EMPTY DATA: NO CAMPAIGNS TO PROCESS
// =============================================================================
describe('GET /api/cron/campaigns — Empty data', () => {
  it('returns success with zero stats when no data exists', async () => {
    currentFreeScores = [];
    currentRecentAudits = [];
    currentHappyRatings = [];
    currentDissatisfiedRatings = [];
    currentCancelledClients = [];

    const req = createCronRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.sent).toBe(0);
    expect(data.stats.skipped).toBe(0);
    expect(data.stats.errors).toBe(0);
    expect(mockEmailSend).not.toHaveBeenCalled();
  });
});

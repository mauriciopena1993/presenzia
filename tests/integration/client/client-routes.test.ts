import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

// Set env vars before any imports
process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.RESEND_API_KEY = 'test_resend_key';

// ── Mock client-auth ──
const mockVerifySession = vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' });
const mockCreateOTP = vi.fn().mockReturnValue('mock-otp-cookie');
const mockDecodeOTP = vi.fn().mockReturnValue(null);
const mockVerifyOTP = vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' });
const mockCreateSession = vi.fn().mockReturnValue('mock-session-token');

vi.mock('@/lib/client-auth', () => ({
  verifySessionToken: (...args: unknown[]) => mockVerifySession(...args),
  SESSION_COOKIE: '__presenzia_client',
  OTP_COOKIE: '__presenzia_client_otp',
  SESSION_MAX_AGE: 7 * 24 * 60 * 60,
  createOTPChallenge: (...args: unknown[]) => mockCreateOTP(...args),
  decodeOTPChallenge: (...args: unknown[]) => mockDecodeOTP(...args),
  verifyOTPChallenge: (...args: unknown[]) => mockVerifyOTP(...args),
  createSessionToken: (...args: unknown[]) => mockCreateSession(...args),
}));

// ── Fixtures ──
const mockClient = {
  id: 'client-123',
  email: 'test@test.com',
  business_name: 'Test Wealth',
  business_type: 'IFA',
  location: 'London',
  plan: 'growth',
  status: 'active',
  marketing_suppressed: false,
};

const mockReports = [
  { id: 'job-1', status: 'completed', overall_score: 75, grade: 'B', completed_at: '2024-01-15', created_at: '2024-01-15', report_path: 'job-1.pdf', platforms_json: [] },
  { id: 'job-2', status: 'running', overall_score: null, grade: null, completed_at: null, created_at: '2024-02-01', report_path: null, platforms_json: null },
];

const mockJob = {
  id: 'job-1',
  status: 'completed',
  report_path: 'job-1.pdf',
  client_id: 'client-123',
  overall_score: 75,
  grade: 'B',
  summary: 'Good visibility',
  platforms_json: [{ platform: 'ChatGPT', score: 80, promptsTested: 3, promptsMentioned: 2, avgPosition: null, competitors: [] }],
  competitors_json: [{ name: 'Competitor A', count: 3 }],
  completed_at: '2024-01-15',
};

// ── Mock supabase ──
// We need flexible mocking so individual tests can override behavior.
// The default chain: from(table).select(...).eq(...).eq(...).single() etc.
let mockClientResult: { data: typeof mockClient | null; error: unknown } = { data: mockClient, error: null };
let mockReportsResult: { data: typeof mockReports | null; error: unknown } = { data: mockReports, error: null };
let mockJobResult: { data: typeof mockJob | null; error: unknown } = { data: mockJob, error: null };
let mockStorageResult: { data: Blob | null; error: unknown } = {
  data: new Blob(['pdf-content'], { type: 'application/pdf' }),
  error: null,
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockImplementation(() => Promise.resolve(mockClientResult)),
            }),
          }),
        };
      }
      if (table === 'audit_jobs') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation(() => ({
              order: vi.fn().mockImplementation(() => Promise.resolve(mockReportsResult)),
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockImplementation(() => Promise.resolve(mockJobResult)),
              }),
            })),
          }),
        };
      }
      return { select: vi.fn() };
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        download: vi.fn().mockImplementation(() => Promise.resolve(mockStorageResult)),
      }),
    },
  },
}));

// ── Mock Resend ──
const mockEmailSend = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

// ── Track Claude API calls via MSW ──
let capturedClaudeBody: Record<string, unknown> | null = null;

// ── Imports (AFTER mocks) ──
import { GET as getReports } from '@/app/api/client/reports/route';
import { POST as postChat } from '@/app/api/client/chat/route';
import { GET as getDownload } from '@/app/api/client/download/route';
import { POST as postSendOTP } from '@/app/api/client/send-otp/route';
import { POST as postVerifyOTP } from '@/app/api/client/verify-otp/route';
import { POST as postSignout } from '@/app/api/client/signout/route';
import { NextRequest } from 'next/server';

// ── Helpers ──
function createGetRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), { method: 'GET' } as never);
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    }),
  });
  return req;
}

function createPostRequest(path: string, body: unknown, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    }),
  });
  return req;
}

// ── Reset between tests ──
beforeEach(() => {
  vi.clearAllMocks();

  // Reset mock return values to defaults
  mockVerifySession.mockReturnValue({ valid: true, email: 'test@test.com' });
  mockDecodeOTP.mockReturnValue(null);
  mockVerifyOTP.mockReturnValue({ valid: true, email: 'test@test.com' });
  mockCreateOTP.mockReturnValue('mock-otp-cookie');
  mockCreateSession.mockReturnValue('mock-session-token');

  mockClientResult = { data: mockClient, error: null };
  mockReportsResult = { data: mockReports, error: null };
  mockJobResult = { data: mockJob, error: null };
  mockStorageResult = {
    data: new Blob(['pdf-content'], { type: 'application/pdf' }),
    error: null,
  };

  capturedClaudeBody = null;

  // Override the default MSW Claude handler to capture the request body
  // and return a controlled response for chat tests
  server.use(
    http.post('https://api.anthropic.com/v1/messages', async ({ request }) => {
      capturedClaudeBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ content: [{ text: 'AI response here' }] });
    })
  );

  mockEmailSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.RESEND_API_KEY = 'test_resend_key';
});

// ════════════════════════════════════════════════════════════════════
// 1. GET /api/client/reports
// ════════════════════════════════════════════════════════════════════
describe('GET /api/client/reports', () => {
  it('rejects unauthenticated requests (no cookie)', async () => {
    const req = createGetRequest('/api/client/reports');
    const res = await getReports(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('rejects invalid session token', async () => {
    mockVerifySession.mockReturnValueOnce({ valid: false, email: null });
    const req = createGetRequest('/api/client/reports', { __presenzia_client: 'bad-token' });
    const res = await getReports(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 if client not found', async () => {
    mockClientResult = { data: null, error: null };
    const req = createGetRequest('/api/client/reports', { __presenzia_client: 'valid-token' });
    const res = await getReports(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Client not found');
  });

  it('returns reports for authenticated client', async () => {
    const req = createGetRequest('/api/client/reports', { __presenzia_client: 'valid-token' });
    const res = await getReports(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reports).toHaveLength(2);
    expect(data.reports[0].id).toBe('job-1');
    expect(data.reports[0].overall_score).toBe(75);
    expect(data.reports[1].id).toBe('job-2');
    expect(data.reports[1].status).toBe('running');
  });

  it('returns empty array if no reports', async () => {
    mockReportsResult = { data: null, error: null };
    const req = createGetRequest('/api/client/reports', { __presenzia_client: 'valid-token' });
    const res = await getReports(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reports).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════
// 2. POST /api/client/chat
// ════════════════════════════════════════════════════════════════════
describe('POST /api/client/chat', () => {
  it('rejects unauthenticated requests (no cookie)', async () => {
    const req = createPostRequest('/api/client/chat', { messages: [{ role: 'user', content: 'hi' }] });
    const res = await postChat(req);
    expect(res.status).toBe(401);
  });

  it('rejects invalid session token', async () => {
    mockVerifySession.mockReturnValueOnce({ valid: false, email: null });
    const req = createPostRequest('/api/client/chat', { messages: [{ role: 'user', content: 'hi' }] }, { __presenzia_client: 'bad-token' });
    const res = await postChat(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 if client not found', async () => {
    mockClientResult = { data: null, error: null };
    const req = createPostRequest('/api/client/chat', { messages: [{ role: 'user', content: 'hi' }] }, { __presenzia_client: 'valid-token' });
    const res = await postChat(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Client not found');
  });

  it('returns 400 if no messages provided', async () => {
    const req = createPostRequest('/api/client/chat', { messages: [] }, { __presenzia_client: 'valid-token' });
    const res = await postChat(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('No message');
  });

  it('returns AI response for authenticated client', async () => {
    const req = createPostRequest('/api/client/chat', {
      messages: [{ role: 'user', content: 'How can I improve?' }],
    }, { __presenzia_client: 'valid-token' });
    const res = await postChat(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('AI response here');
  });

  it('calls Claude API with correct parameters', async () => {
    const req = createPostRequest('/api/client/chat', {
      messages: [{ role: 'user', content: 'What is my score?' }],
    }, { __presenzia_client: 'valid-token' });
    await postChat(req);

    expect(capturedClaudeBody).not.toBeNull();
    expect(capturedClaudeBody!.model).toBe('claude-haiku-4-5-20251001');
    expect(capturedClaudeBody!.max_tokens).toBe(600);
    expect(capturedClaudeBody!.system).toContain('Test Wealth');
    const messages = capturedClaudeBody!.messages as Array<{ role: string; content: string }>;
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('What is my score?');
  });

  it('includes report context when jobId provided', async () => {
    const req = createPostRequest('/api/client/chat', {
      messages: [{ role: 'user', content: 'Explain my audit' }],
      jobId: 'job-1',
    }, { __presenzia_client: 'valid-token' });
    await postChat(req);

    expect(capturedClaudeBody).not.toBeNull();
    const systemPrompt = capturedClaudeBody!.system as string;
    expect(systemPrompt).toContain('75/100');
    expect(systemPrompt).toContain('Grade: B');
    expect(systemPrompt).toContain('ChatGPT');
    expect(systemPrompt).toContain('Good visibility');
    expect(systemPrompt).toContain('Competitor A');
  });

  it('returns 500 if Claude API fails', async () => {
    // Override MSW handler to return an error
    server.use(
      http.post('https://api.anthropic.com/v1/messages', () => {
        return new HttpResponse('Internal Server Error', { status: 500 });
      })
    );

    const req = createPostRequest('/api/client/chat', {
      messages: [{ role: 'user', content: 'hello' }],
    }, { __presenzia_client: 'valid-token' });
    const res = await postChat(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('AI unavailable');
  });

  it('slices messages to last 10 and starts from first user message', async () => {
    const messages = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }));

    const req = createPostRequest('/api/client/chat', { messages }, { __presenzia_client: 'valid-token' });
    await postChat(req);

    expect(capturedClaudeBody).not.toBeNull();
    const apiMessages = capturedClaudeBody!.messages as Array<{ role: string; content: string }>;
    // Should be sliced to last 10 and start from first user message
    expect(apiMessages.length).toBeLessThanOrEqual(10);
    expect(apiMessages[0].role).toBe('user');
  });
});

// ════════════════════════════════════════════════════════════════════
// 3. GET /api/client/download
// ════════════════════════════════════════════════════════════════════
describe('GET /api/client/download', () => {
  it('rejects unauthenticated requests (no cookie)', async () => {
    const req = createGetRequest('/api/client/download?jobId=job-1');
    const res = await getDownload(req);
    expect(res.status).toBe(401);
  });

  it('rejects invalid session token', async () => {
    mockVerifySession.mockReturnValueOnce({ valid: false, email: null });
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'bad-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 if jobId missing', async () => {
    const req = createGetRequest('/api/client/download', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('jobId required');
  });

  it('returns 404 if client not found', async () => {
    mockClientResult = { data: null, error: null };
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Client not found');
  });

  it('returns 404 if job not found or has no report_path', async () => {
    mockJobResult = { data: null, error: null };
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Report not found');
  });

  it('returns 404 if job exists but report_path is null', async () => {
    mockJobResult = { data: { ...mockJob, report_path: null } as never, error: null };
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Report not found');
  });

  it('returns PDF for valid job', async () => {
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('presenzia-audit-job-1.pdf');
    expect(res.headers.get('Content-Length')).toBeTruthy();
  });

  it('returns 404 if storage download fails', async () => {
    mockStorageResult = { data: null, error: { message: 'File not found' } };
    const req = createGetRequest('/api/client/download?jobId=job-1', { __presenzia_client: 'valid-token' });
    const res = await getDownload(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('File not available');
  });
});

// ════════════════════════════════════════════════════════════════════
// 4. POST /api/client/send-otp
// ════════════════════════════════════════════════════════════════════
describe('POST /api/client/send-otp', () => {
  it('returns 400 if no email provided', async () => {
    const req = createPostRequest('/api/client/send-otp', {});
    const res = await postSendOTP(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email required');
  });

  it('returns 404 for non-existent email (no_account)', async () => {
    mockClientResult = { data: null, error: { message: 'Not found' } };
    const req = createPostRequest('/api/client/send-otp', { email: 'nobody@test.com' });
    const res = await postSendOTP(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('no_account');
  });

  it('returns { ok: true } for existing client', async () => {
    const req = createPostRequest('/api/client/send-otp', { email: 'test@test.com' });
    const res = await postSendOTP(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('sends email via Resend', async () => {
    const req = createPostRequest('/api/client/send-otp', { email: 'test@test.com' });
    await postSendOTP(req);

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    const emailArgs = mockEmailSend.mock.calls[0][0];
    expect(emailArgs.to).toBe('test@test.com');
    expect(emailArgs.subject).toContain('login code');
  });

  it('creates OTP challenge for fresh request', async () => {
    const req = createPostRequest('/api/client/send-otp', { email: 'test@test.com' });
    await postSendOTP(req);

    expect(mockCreateOTP).toHaveBeenCalledWith('test@test.com', expect.any(String));
  });

  it('sets OTP cookie on fresh challenge', async () => {
    const req = createPostRequest('/api/client/send-otp', { email: 'test@test.com' });
    const res = await postSendOTP(req);

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('__presenzia_client_otp');
  });

  it('reuses existing OTP cookie on resend (same email)', async () => {
    mockDecodeOTP.mockReturnValueOnce({ valid: true, email: 'test@test.com', code: '123456' });

    const req = createPostRequest('/api/client/send-otp', { email: 'test@test.com' }, {
      __presenzia_client_otp: 'existing_challenge',
    });
    const res = await postSendOTP(req);
    const data = await res.json();

    expect(data.ok).toBe(true);
    // Should NOT create a new challenge
    expect(mockCreateOTP).not.toHaveBeenCalled();
    // Should still send the email
    expect(mockEmailSend).toHaveBeenCalled();
    // Should NOT set a new cookie (resend reuses existing)
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeNull();
  });

  it('normalizes email to lowercase', async () => {
    const req = createPostRequest('/api/client/send-otp', { email: '  Test@Test.COM  ' });
    await postSendOTP(req);

    expect(mockCreateOTP).toHaveBeenCalledWith('test@test.com', expect.any(String));
  });
});

// ════════════════════════════════════════════════════════════════════
// 5. POST /api/client/verify-otp
// ════════════════════════════════════════════════════════════════════
describe('POST /api/client/verify-otp', () => {
  it('returns 400 if missing code', async () => {
    const req = createPostRequest('/api/client/verify-otp', {}, {
      __presenzia_client_otp: 'challenge_token',
    });
    const res = await postVerifyOTP(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 if missing OTP cookie', async () => {
    const req = createPostRequest('/api/client/verify-otp', { code: '123456' });
    const res = await postVerifyOTP(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('returns 401 if invalid code', async () => {
    mockVerifyOTP.mockReturnValueOnce({ valid: false });

    const req = createPostRequest('/api/client/verify-otp', { code: '000000' }, {
      __presenzia_client_otp: 'challenge_token',
    });
    const res = await postVerifyOTP(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid or expired code');
  });

  it('returns { ok: true } and sets session cookie on valid code', async () => {
    mockVerifyOTP.mockReturnValueOnce({ valid: true, email: 'test@test.com' });

    const req = createPostRequest('/api/client/verify-otp', { code: '123456' }, {
      __presenzia_client_otp: 'challenge_token',
    });
    const res = await postVerifyOTP(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockCreateSession).toHaveBeenCalledWith('test@test.com');

    // Should set session cookie and clear OTP cookie
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toContain('__presenzia_client');
  });

  it('clears OTP cookie on successful verification', async () => {
    mockVerifyOTP.mockReturnValueOnce({ valid: true, email: 'test@test.com' });

    const req = createPostRequest('/api/client/verify-otp', { code: '123456' }, {
      __presenzia_client_otp: 'challenge_token',
    });
    const res = await postVerifyOTP(req);

    // The OTP cookie should be cleared (maxAge: 0)
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toContain('__presenzia_client_otp');
    expect(cookies).toContain('Max-Age=0');
  });
});

// ════════════════════════════════════════════════════════════════════
// 6. POST /api/client/signout
// ════════════════════════════════════════════════════════════════════
describe('POST /api/client/signout', () => {
  it('returns { ok: true }', async () => {
    const req = createPostRequest('/api/client/signout', {});
    const res = await postSignout();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('clears session cookie', async () => {
    const res = await postSignout();

    const cookies = res.headers.get('set-cookie');
    expect(cookies).toContain('__presenzia_client');
    // Both cookies should have maxAge 0
    expect(cookies).toContain('Max-Age=0');
  });

  it('clears OTP cookie', async () => {
    const res = await postSignout();

    const cookies = res.headers.get('set-cookie');
    expect(cookies).toContain('__presenzia_client_otp');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Environment ──────────────────────────────────────────────
process.env.INTERNAL_API_SECRET = 'test-secret';
process.env.RESEND_API_KEY = 'test-resend';

// ── Fixtures ─────────────────────────────────────────────────

const mockJob = {
  id: 'job-1',
  client_id: 'client-1',
  status: 'pending',
  clients: {
    id: 'client-1',
    email: 'test@test.com',
    business_name: 'Test Wealth',
    business_type: 'IFA',
    location: 'London',
    description: 'A boutique IFA',
    keywords: ['wealth management'],
    website: 'https://test.com',
  },
};

const mockJobNoOnboarding = {
  id: 'job-2',
  client_id: 'client-2',
  status: 'pending',
  clients: {
    id: 'client-2',
    email: 'new@test.com',
    business_name: null,
    business_type: null,
    location: null,
  },
};

const mockJobPartialOnboarding = {
  id: 'job-3',
  client_id: 'client-3',
  status: 'pending',
  clients: {
    id: 'client-3',
    email: 'partial@test.com',
    business_name: 'Partial Firm',
    business_type: 'IFA',
    location: null, // Missing location
  },
};

const mockJobNoEmail = {
  id: 'job-4',
  client_id: 'client-4',
  status: 'pending',
  clients: {
    id: 'client-4',
    email: null,
    business_name: 'No Email Firm',
    business_type: 'IFA',
    location: 'Manchester',
    description: '',
    keywords: [],
    website: null,
  },
};

const mockAuditResult = {
  results: [{ platform: 'ChatGPT', prompt: 'test', found: true }],
  score: {
    overall: 65,
    grade: 'B',
    summary: 'Good visibility',
    platforms: [{ name: 'ChatGPT', score: 70 }],
    topCompetitors: [{ name: 'Competitor A', count: 3 }],
  },
};

// ── Mocks ────────────────────────────────────────────────────

const mockRunAudit = vi.fn().mockResolvedValue(mockAuditResult);
vi.mock('@/lib/audit/runner', () => ({
  runAudit: (...args: unknown[]) => mockRunAudit(...args),
}));

const mockGeneratePDF = vi.fn().mockResolvedValue(Buffer.from('fake-pdf'));
vi.mock('@/lib/report/generate', () => ({
  generatePDFReport: (...args: unknown[]) => mockGeneratePDF(...args),
}));

const mockGenerateInsights = vi.fn().mockReturnValue({ categories: [], actions: [] });
vi.mock('@/lib/report/insights', () => ({
  generateInsights: (...args: unknown[]) => mockGenerateInsights(...args),
}));

const { mockResendSend } = vi.hoisted(() => {
  const mockResendSend = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  return { mockResendSend };
});
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockResendSend };
    },
  };
});

// ── Supabase mock with call tracking ─────────────────────────

// Each mockEq tracks calls so we can verify status transitions
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
const mockUpload = vi.fn().mockResolvedValue({ error: null });

// Default: return the full mockJob
const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockJob, error: null });
const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'audit_jobs') {
        return {
          select: mockSelect,
          update: mockUpdate,
        };
      }
      return {};
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: (...args: unknown[]) => mockUpload(...args),
      }),
    },
  },
}));

import { POST } from '@/app/api/process-audit/route';
import { NextRequest } from 'next/server';

// ── Helper ───────────────────────────────────────────────────

function createProcessRequest(body: unknown, secret = 'test-secret'): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['x-internal-secret'] = secret;
  return new NextRequest(new URL('http://localhost:3000/api/process-audit'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}

function createRequestNoSecret(body: unknown): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/process-audit'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  process.env.INTERNAL_API_SECRET = 'test-secret';
  process.env.RESEND_API_KEY = 'test-resend';

  // Reset supabase mocks to defaults
  mockSelectSingle.mockResolvedValue({ data: mockJob, error: null });
  mockUpdateEq.mockResolvedValue({ error: null });
  mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  mockUpload.mockResolvedValue({ error: null });
  mockRunAudit.mockResolvedValue(mockAuditResult);
  mockGeneratePDF.mockResolvedValue(Buffer.from('fake-pdf'));
  mockGenerateInsights.mockReturnValue({ categories: [], actions: [] });
  mockResendSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });
});

// ══════════════════════════════════════════════════════════════
// AUTHENTICATION
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Authentication', () => {
  it('returns 401 if no x-internal-secret header', async () => {
    const req = createRequestNoSecret({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 if wrong x-internal-secret', async () => {
    const req = createProcessRequest({ jobId: 'job-1' }, 'wrong-secret');
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 if jobId is missing from body', async () => {
    const req = createProcessRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('jobId is required');
  });

  it('returns 400 if jobId is null', async () => {
    const req = createProcessRequest({ jobId: null });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('jobId is required');
  });

  it('returns 400 if jobId is empty string', async () => {
    const req = createProcessRequest({ jobId: '' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('jobId is required');
  });

  it('does not call supabase if unauthorized', async () => {
    const { supabase } = await import('@/lib/supabase');
    const req = createRequestNoSecret({ jobId: 'job-1' });
    await POST(req);

    expect(supabase.from).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// JOB LOOKUP
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Job Lookup', () => {
  it('returns 404 if job not found (null data)', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: null, error: null });

    const req = createProcessRequest({ jobId: 'nonexistent-job' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Job not found');
  });

  it('returns 404 if supabase returns an error', async () => {
    mockSelectSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error', details: '', hint: '', code: 'PGRST116' },
    });

    const req = createProcessRequest({ jobId: 'bad-job' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Job not found');
  });

  it('queries audit_jobs with correct jobId and joins clients', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockSelect).toHaveBeenCalledWith('*, clients(*)');
    expect(mockSelectEq).toHaveBeenCalledWith('id', 'job-1');
  });
});

// ══════════════════════════════════════════════════════════════
// PENDING ONBOARDING
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Pending Onboarding', () => {
  it('returns pending_onboarding when client has no business details', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoOnboarding, error: null });

    const req = createProcessRequest({ jobId: 'job-2' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('pending_onboarding');
  });

  it('marks job as pending with onboarding error message', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoOnboarding, error: null });

    const req = createProcessRequest({ jobId: 'job-2' });
    await POST(req);

    expect(mockUpdate).toHaveBeenCalledWith({
      status: 'pending',
      error: 'Awaiting client onboarding details',
    });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'job-2');
  });

  it('returns pending_onboarding when client has partial details (missing location)', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobPartialOnboarding, error: null });

    const req = createProcessRequest({ jobId: 'job-3' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('pending_onboarding');
  });

  it('does not run the audit when client details are missing', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoOnboarding, error: null });

    const req = createProcessRequest({ jobId: 'job-2' });
    await POST(req);

    expect(mockRunAudit).not.toHaveBeenCalled();
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// SUCCESSFUL AUDIT
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Successful Audit', () => {
  it('marks job as running before starting audit', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // First update call should be status: 'running'
    const firstUpdateCall = mockUpdate.mock.calls[0][0];
    expect(firstUpdateCall.status).toBe('running');
    expect(firstUpdateCall.started_at).toBeDefined();
    expect(typeof firstUpdateCall.started_at).toBe('string');
  });

  it('calls runAudit with correct config from client data', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockRunAudit).toHaveBeenCalledWith({
      businessName: 'Test Wealth',
      businessType: 'IFA',
      description: 'A boutique IFA',
      location: 'London',
      keywords: ['wealth management'],
      website: 'https://test.com',
    });
  });

  it('generates insights from audit results', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockGenerateInsights).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: 'Test Wealth' }),
      mockAuditResult.score,
      mockAuditResult.results,
    );
  });

  it('generates PDF report', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockGeneratePDF).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: 'Test Wealth' }),
      mockAuditResult.score,
      mockAuditResult.results,
      { categories: [], actions: [] },
      'job-1',
    );
  });

  it('uploads PDF to supabase storage', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockUpload).toHaveBeenCalledWith(
      'job-1.pdf',
      Buffer.from('fake-pdf'),
      { contentType: 'application/pdf', upsert: true },
    );
  });

  it('updates job with completed status and results', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // The second update should be the completed update
    const completedCall = mockUpdate.mock.calls[1][0];
    expect(completedCall.status).toBe('completed');
    expect(completedCall.overall_score).toBe(65);
    expect(completedCall.grade).toBe('B');
    expect(completedCall.summary).toBe('Good visibility');
    expect(completedCall.platforms_json).toEqual([{ name: 'ChatGPT', score: 70 }]);
    expect(completedCall.competitors_json).toEqual([{ name: 'Competitor A', count: 3 }]);
    expect(completedCall.report_path).toBe('job-1.pdf');
    expect(completedCall.completed_at).toBeDefined();
    expect(completedCall.insights_json).toEqual({ categories: [], actions: [] });
  });

  it('returns completed status with score and grade', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('completed');
    expect(data.score).toBe(65);
    expect(data.grade).toBe('B');
  });

  it('sends report email to client', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockResendSend).toHaveBeenCalled();
    const emailCall = mockResendSend.mock.calls[0][0];
    expect(emailCall.to).toBe('test@test.com');
    expect(emailCall.subject).toContain('65/100');
    expect(emailCall.subject).toContain('Test Wealth');
    expect(emailCall.attachments).toBeDefined();
    expect(emailCall.attachments[0].filename).toContain('test-wealth');
    expect(emailCall.attachments[0].filename).toMatch(/\.pdf$/);
  });

  it('does not send email if client has no email', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoEmail, error: null });

    const req = createProcessRequest({ jobId: 'job-4' });
    await POST(req);
    const data = await (await POST(createProcessRequest({ jobId: 'job-4' }))).json();

    // For this test, only check the first call sequence
    // The resend send should not be called for report emails
    // (it may be called 0 or more times depending on the mock, but we reset first)
    vi.clearAllMocks();
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoEmail, error: null });
    mockUpdateEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockUpload.mockResolvedValue({ error: null });

    const req2 = createProcessRequest({ jobId: 'job-4' });
    await POST(req2);

    // Should not have called resend for report email (no client email)
    // The only call would be if there were a failure email, but no failure here
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it('handles client with no description, keywords, or website gracefully', async () => {
    const minimalJob = {
      ...mockJob,
      id: 'job-minimal',
      clients: {
        ...mockJob.clients,
        description: null,
        keywords: null,
        website: null,
      },
    };
    mockSelectSingle.mockResolvedValueOnce({ data: minimalJob, error: null });

    const req = createProcessRequest({ jobId: 'job-minimal' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('completed');

    // Config should use fallback values
    expect(mockRunAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: '',
        keywords: [],
        website: undefined,
      }),
    );
  });
});

// ══════════════════════════════════════════════════════════════
// PDF UPLOAD FAILURE
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — PDF Upload Failure', () => {
  it('sets report_path to null when upload fails but still completes', async () => {
    mockUpload.mockResolvedValueOnce({ error: { message: 'Storage full' } });

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('completed');

    // The completed update should have report_path: null
    const completedCall = mockUpdate.mock.calls[1][0];
    expect(completedCall.report_path).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════
// INSIGHTS_JSON FALLBACK
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Insights Fallback', () => {
  it('retries update without insights_json if first update fails', async () => {
    // First update = running (succeeds), second update = completed (fails), then retry (succeeds)
    let updateCallCount = 0;
    mockUpdateEq.mockImplementation(() => {
      updateCallCount++;
      // The 2nd call to mockUpdateEq is the completed update (1st eq for running, 2nd for completed)
      if (updateCallCount === 2) {
        return Promise.resolve({ error: { message: 'column insights_json does not exist' } });
      }
      return Promise.resolve({ error: null });
    });

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('completed');

    // Should have called update 3 times: running, completed (failed), completed retry (without insights)
    expect(mockUpdate).toHaveBeenCalledTimes(3);
    const retryCall = mockUpdate.mock.calls[2][0];
    expect(retryCall.insights_json).toBeUndefined();
    expect(retryCall.status).toBe('completed');
  });
});

// ══════════════════════════════════════════════════════════════
// AUDIT FAILURE
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Audit Failure', () => {
  it('marks job as failed when runAudit throws', async () => {
    mockRunAudit.mockRejectedValueOnce(new Error('AI platform timeout'));

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.status).toBe('failed');
    expect(data.error).toBe('AI platform timeout');
  });

  it('updates job status to failed with error message', async () => {
    mockRunAudit.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // First update: running, Second update: failed
    const failedCall = mockUpdate.mock.calls[1][0];
    expect(failedCall.status).toBe('failed');
    expect(failedCall.error).toBe('Rate limit exceeded');
    expect(failedCall.completed_at).toBeDefined();
  });

  it('handles non-Error thrown values', async () => {
    mockRunAudit.mockRejectedValueOnce('string error');

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.status).toBe('failed');
    expect(data.error).toBe('Unknown error');
  });

  it('marks job as failed when PDF generation throws', async () => {
    mockGeneratePDF.mockRejectedValueOnce(new Error('PDF render failed'));

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.status).toBe('failed');
    expect(data.error).toBe('PDF render failed');
  });

  it('marks job as failed when insights generation throws', async () => {
    mockGenerateInsights.mockImplementationOnce(() => {
      throw new Error('Insights calculation error');
    });

    const req = createProcessRequest({ jobId: 'job-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.status).toBe('failed');
    expect(data.error).toBe('Insights calculation error');
  });

  it('sends admin failure alert email when audit fails', async () => {
    mockRunAudit.mockRejectedValueOnce(new Error('Platform down'));

    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // resend.emails.send is called for the failure alert
    expect(mockResendSend).toHaveBeenCalled();
    const alertCall = mockResendSend.mock.calls[0][0];
    expect(alertCall.to).toBe('hello@presenzia.ai');
    expect(alertCall.subject).toContain('Audit failed');
    expect(alertCall.subject).toContain('Test Wealth');
  });

  it('still marks job as running before the audit attempt', async () => {
    mockRunAudit.mockRejectedValueOnce(new Error('Crash'));

    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // First update should still be 'running'
    const runningCall = mockUpdate.mock.calls[0][0];
    expect(runningCall.status).toBe('running');
  });
});

// ══════════════════════════════════════════════════════════════
// STATUS TRANSITION SEQUENCE
// ══════════════════════════════════════════════════════════════

describe('POST /api/process-audit — Status Transitions', () => {
  it('transitions: pending -> running -> completed on success', async () => {
    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    // update call order
    expect(mockUpdate.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(mockUpdate.mock.calls[0][0].status).toBe('running');
    expect(mockUpdate.mock.calls[1][0].status).toBe('completed');
  });

  it('transitions: pending -> running -> failed on error', async () => {
    mockRunAudit.mockRejectedValueOnce(new Error('boom'));

    const req = createProcessRequest({ jobId: 'job-1' });
    await POST(req);

    expect(mockUpdate.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(mockUpdate.mock.calls[0][0].status).toBe('running');
    expect(mockUpdate.mock.calls[1][0].status).toBe('failed');
  });

  it('transitions: pending -> pending (onboarding) when client incomplete', async () => {
    mockSelectSingle.mockResolvedValueOnce({ data: mockJobNoOnboarding, error: null });

    const req = createProcessRequest({ jobId: 'job-2' });
    await POST(req);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0][0].status).toBe('pending');
  });
});

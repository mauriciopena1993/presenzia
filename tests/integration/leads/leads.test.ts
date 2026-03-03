import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track mock calls for assertions
const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

// Mock supabase BEFORE importing the route
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'leads') {
        return {
          upsert: mockUpsert,
          insert: mockInsert,
        };
      }
      return {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
  },
}));

import { POST } from '@/app/api/leads/route';
import { NextRequest } from 'next/server';

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/leads'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({ data: null, error: null });
  mockInsert.mockResolvedValue({ data: null, error: null });
});

describe('POST /api/leads', () => {
  // ─── Valid submissions ─────────────────────────────────────────────

  it('upserts lead with email and all fields', async () => {
    const req = createPostRequest({
      email: '  Test@Example.com  ',
      contact_name: 'John Smith',
      business_name: '  Wealth Co  ',
      business_type: '  IFA  ',
      location: '  London  ',
      website: '  https://wealth.co  ',
      keywords: 'wealth, pension, retirement',
      plan: 'growth',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);

    // Should call upsert (not insert) when email is present
    expect(mockUpsert).toHaveBeenCalledOnce();
    expect(mockInsert).not.toHaveBeenCalled();

    // Verify upsert args
    const [upsertData, upsertOptions] = mockUpsert.mock.calls[0];
    expect(upsertData.email).toBe('test@example.com'); // trimmed + lowercased
    expect(upsertData.contact_name).toBe('John Smith');
    expect(upsertData.business_name).toBe('Wealth Co'); // trimmed
    expect(upsertData.business_type).toBe('IFA'); // trimmed
    expect(upsertData.location).toBe('London'); // trimmed
    expect(upsertData.website).toBe('https://wealth.co'); // trimmed
    expect(upsertData.keywords).toEqual(['wealth', 'pension', 'retirement']);
    expect(upsertData.plan).toBe('growth');
    expect(upsertData.updated_at).toBeDefined();

    // Verify onConflict options
    expect(upsertOptions.onConflict).toBe('email');
    expect(upsertOptions.ignoreDuplicates).toBe(false);
  });

  it('inserts lead without email (no upsert)', async () => {
    const req = createPostRequest({
      business_name: 'NoEmail Corp',
      business_type: 'Wealth Manager',
      plan: 'audit',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);

    // Should call insert (not upsert) when no email
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockUpsert).not.toHaveBeenCalled();

    // Verify insert args
    const [insertData] = mockInsert.mock.calls[0];
    expect(insertData.contact_name).toBeNull();
    expect(insertData.business_name).toBe('NoEmail Corp');
    expect(insertData.business_type).toBe('Wealth Manager');
    expect(insertData.location).toBeNull();
    expect(insertData.website).toBeNull();
    expect(insertData.keywords).toBeNull();
    expect(insertData.plan).toBe('audit');
    // insert path should NOT have updated_at or email
    expect(insertData.email).toBeUndefined();
    expect(insertData.updated_at).toBeUndefined();
  });

  // ─── Missing required fields ───────────────────────────────────────

  it('returns ok:true silently when business_name is missing', async () => {
    const req = createPostRequest({
      email: 'test@test.com',
      business_type: 'IFA',
      plan: 'growth',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    // Should not call supabase at all
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns ok:true silently when business_type is missing', async () => {
    const req = createPostRequest({
      email: 'test@test.com',
      business_name: 'Test Co',
      plan: 'growth',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns ok:true silently when plan is missing', async () => {
    const req = createPostRequest({
      email: 'test@test.com',
      business_name: 'Test Co',
      business_type: 'IFA',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns ok:true silently when all required fields are missing', async () => {
    const req = createPostRequest({
      email: 'test@test.com',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns ok:true when body is empty object', async () => {
    const req = createPostRequest({});

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // ─── Keywords parsing ──────────────────────────────────────────────

  it('parses comma-separated keywords into array', async () => {
    const req = createPostRequest({
      email: 'keywords@test.com',
      business_name: 'KW Corp',
      business_type: 'IFA',
      plan: 'audit',
      keywords: 'wealth, retirement ,pension',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.keywords).toEqual(['wealth', 'retirement', 'pension']);
  });

  it('handles single keyword without comma', async () => {
    const req = createPostRequest({
      email: 'single@test.com',
      business_name: 'Single KW',
      business_type: 'IFA',
      plan: 'audit',
      keywords: 'wealth',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.keywords).toEqual(['wealth']);
  });

  it('sets keywords to null when not provided', async () => {
    const req = createPostRequest({
      email: 'nokw@test.com',
      business_name: 'No KW Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.keywords).toBeNull();
  });

  it('filters out empty strings from keywords', async () => {
    const req = createPostRequest({
      email: 'empty@test.com',
      business_name: 'Empty KW',
      business_type: 'IFA',
      plan: 'audit',
      keywords: 'wealth,,, pension,,',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.keywords).toEqual(['wealth', 'pension']);
  });

  // ─── Optional fields handling ──────────────────────────────────────

  it('sets optional fields to null when not provided', async () => {
    const req = createPostRequest({
      email: 'minimal@test.com',
      business_name: 'Minimal Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.contact_name).toBeNull();
    expect(upsertData.location).toBeNull();
    expect(upsertData.website).toBeNull();
    expect(upsertData.keywords).toBeNull();
  });

  it('handles contact_name as empty string (falsy) -> null', async () => {
    const req = createPostRequest({
      email: 'noname@test.com',
      business_name: 'No Name Corp',
      business_type: 'IFA',
      plan: 'audit',
      contact_name: '',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.contact_name).toBeNull();
  });

  // ─── Duplicate email handling (upsert behavior) ────────────────────

  it('uses upsert with onConflict email to handle duplicates', async () => {
    const req = createPostRequest({
      email: 'duplicate@test.com',
      business_name: 'Dupe Corp',
      business_type: 'IFA',
      plan: 'growth',
    });

    await POST(req);

    expect(mockUpsert).toHaveBeenCalledOnce();
    const [, upsertOptions] = mockUpsert.mock.calls[0];
    expect(upsertOptions.onConflict).toBe('email');
    expect(upsertOptions.ignoreDuplicates).toBe(false);
  });

  it('includes updated_at timestamp on upsert for tracking updates', async () => {
    const before = new Date().toISOString();

    const req = createPostRequest({
      email: 'timestamp@test.com',
      business_name: 'Time Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    const after = new Date().toISOString();

    expect(upsertData.updated_at).toBeDefined();
    expect(upsertData.updated_at >= before).toBe(true);
    expect(upsertData.updated_at <= after).toBe(true);
  });

  // ─── Error handling (never blocks checkout) ────────────────────────

  it('returns ok:true even when supabase upsert throws', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = createPostRequest({
      email: 'error@test.com',
      business_name: 'Error Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('returns ok:true even when supabase insert throws', async () => {
    mockInsert.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = createPostRequest({
      business_name: 'Error Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('returns ok:true when request body is invalid JSON', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/leads'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  // ─── Email normalization ───────────────────────────────────────────

  it('trims and lowercases email before upsert', async () => {
    const req = createPostRequest({
      email: '  UPPER@CASE.COM  ',
      business_name: 'Case Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    await POST(req);

    const [upsertData] = mockUpsert.mock.calls[0];
    expect(upsertData.email).toBe('upper@case.com');
  });

  // ─── All plans accepted ────────────────────────────────────────────

  it('accepts audit plan', async () => {
    const req = createPostRequest({
      business_name: 'Plan Corp',
      business_type: 'IFA',
      plan: 'audit',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  it('accepts growth plan', async () => {
    const req = createPostRequest({
      business_name: 'Plan Corp',
      business_type: 'IFA',
      plan: 'growth',
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  it('accepts premium plan', async () => {
    const req = createPostRequest({
      business_name: 'Plan Corp',
      business_type: 'IFA',
      plan: 'premium',
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledOnce();
  });
});

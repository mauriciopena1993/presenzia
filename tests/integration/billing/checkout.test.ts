import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PLANS } from '@/lib/plans';

// Mock Stripe
const mockCreate = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: (...args: unknown[]) => mockCreate(...args) } },
  },
  PLANS: {
    audit: { priceId: 'price_test_audit', name: 'Full AI Audit & Action Plan', price: 297 },
    starter: { priceId: 'price_test_starter', name: 'Starter', price: 99 },
    growth: { priceId: 'price_test_growth', name: 'Growth Retainer', price: 697 },
    premium: { priceId: 'price_test_premium', name: 'Premium', price: 1997 },
  },
}));

// Import AFTER mocking
import { POST } from '@/app/api/checkout/route';
import { createRequest } from '@/tests/helpers/test-request';

beforeEach(() => {
  vi.clearAllMocks();
  mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test-session' });
});

describe('POST /api/checkout', () => {
  const validBody = {
    plan: 'audit',
    email: 'test@example.com',
    business_name: 'Test Wealth Ltd',
    business_type: 'IFA',
    description: 'Wealth management',
    location: 'London',
    website: 'https://test.com',
    keywords: 'wealth, ifa',
  };

  it('returns checkout URL for valid audit plan', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/test-session');
  });

  it('creates subscription mode session for audit plan', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const params = mockCreate.mock.calls[0][0];
    expect(params.mode).toBe('subscription');
    expect(params.metadata.plan).toBe('audit');
    expect(params.subscription_data).toBeDefined();
    expect(params.subscription_data.metadata.plan).toBe('audit');
  });

  it('creates subscription mode session for growth plan', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, plan: 'growth' },
    });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.mode).toBe('subscription');
    expect(params.subscription_data).toBeDefined();
    expect(params.subscription_data.metadata.plan).toBe('growth');
  });

  it('creates subscription mode session for premium plan', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, plan: 'premium' },
    });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.mode).toBe('subscription');
    expect(params.subscription_data.metadata.plan).toBe('premium');
  });

  it('passes correct price ID from PLANS config', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.line_items[0].price).toBe('price_test_audit');
  });

  it('includes business details in metadata', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.metadata.business_name).toBe('Test Wealth Ltd');
    expect(params.metadata.business_type).toBe('IFA');
    expect(params.metadata.location).toBe('London');
  });

  it('sets correct success and cancel URLs', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.success_url).toContain('/success');
    expect(params.success_url).toContain('session_id=');
    expect(params.success_url).toContain('plan=audit');
    expect(params.cancel_url).toContain('/onboarding?plan=audit');
  });

  it('enables VAT/tax ID collection', async () => {
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    await POST(req);

    const params = mockCreate.mock.calls[0][0];
    expect(params.billing_address_collection).toBe('required');
    expect(params.tax_id_collection.enabled).toBe(true);
    expect(params.allow_promotion_codes).toBe(true);
  });

  // ── Error cases ──

  it('rejects invalid plan', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, plan: 'nonexistent' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid plan');
  });

  it('rejects missing plan', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, plan: '' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects missing business_name', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, business_name: '' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('required');
  });

  it('rejects missing business_type', async () => {
    const req = createRequest('/api/checkout', {
      method: 'POST',
      body: { ...validBody, business_type: '' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles Stripe API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('Stripe API down'));
    const req = createRequest('/api/checkout', { method: 'POST', body: validBody });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Stripe API down');
  });

  it('handles email being optional', async () => {
    const { email, ...bodyNoEmail } = validBody;
    const req = createRequest('/api/checkout', { method: 'POST', body: bodyNoEmail });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const params = mockCreate.mock.calls[0][0];
    expect(params.customer_email).toBeUndefined();
  });
});

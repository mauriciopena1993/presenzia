import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client-auth
vi.mock('@/lib/client-auth', () => ({
  verifySessionToken: vi.fn().mockReturnValue({ valid: true, email: 'test@test.com' }),
  SESSION_COOKIE: '__presenzia_client',
}));

// Mock supabase
const mockClient = {
  id: 'client-123',
  plan: 'growth',
  business_name: 'Test Wealth',
  stripe_subscription_id: 'sub_123',
  stripe_customer_id: 'cus_123',
  pending_plan_change: null,
};

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
        }),
      }),
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return { eq: vi.fn().mockResolvedValue({ data: null, error: null }) };
      },
    })),
  },
}));

// Mock Stripe
const mockSubscriptionRetrieve = vi.fn().mockResolvedValue({
  items: { data: [{ id: 'si_123', current_period_start: 1700000000, current_period_end: 1702592000, price: { id: 'price_test_growth' } }] },
  schedule: null,
  cancel_at_period_end: false,
});
const mockSubscriptionUpdate = vi.fn().mockResolvedValue({});
const mockInvoicePreview = vi.fn().mockResolvedValue({ amount_due: 50000 });
const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/session_123' });
const mockScheduleCreate = vi.fn().mockResolvedValue({ id: 'sch_123' });
const mockScheduleUpdate = vi.fn().mockResolvedValue({});
const mockScheduleList = vi.fn().mockResolvedValue({ data: [] });
const mockScheduleRelease = vi.fn().mockResolvedValue({});

vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      retrieve: (...args: unknown[]) => mockSubscriptionRetrieve(...args),
      update: (...args: unknown[]) => mockSubscriptionUpdate(...args),
    },
    invoices: {
      createPreview: (...args: unknown[]) => mockInvoicePreview(...args),
    },
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockCheckoutCreate(...args),
      },
    },
    subscriptionSchedules: {
      create: (...args: unknown[]) => mockScheduleCreate(...args),
      update: (...args: unknown[]) => mockScheduleUpdate(...args),
      list: (...args: unknown[]) => mockScheduleList(...args),
      release: (...args: unknown[]) => mockScheduleRelease(...args),
    },
  },
  PLANS: {
    audit: { priceId: 'price_test_audit' },
    starter: { priceId: 'price_test_starter' },
    growth: { priceId: 'price_test_growth' },
    premium: { priceId: 'price_test_premium' },
  },
  planFromPriceId: vi.fn(),
}));

// Mock plans
vi.mock('@/lib/plans', () => ({
  PLAN_LABELS: { audit: 'Full AI Audit & Action Plan', starter: 'Starter', growth: 'Growth Retainer', premium: 'Premium' },
  PLAN_PRICES: { audit: '£99', starter: '£99/month', growth: '£249/month', premium: '£599/month' },
  PLAN_FEATURES: {
    audit: ['One-time audit'],
    growth: ['Weekly re-audits', 'AI chat'],
    premium: ['Daily re-audits', 'AI chat', 'Strategy calls'],
  },
  PLAN_RANK: { audit: 1, starter: 2, growth: 3, premium: 4 },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ id: 'email-1' });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

import { POST } from '@/app/api/client/change-plan/route';
import { NextRequest } from 'next/server';

function createChangePlanRequest(body: Record<string, unknown>): NextRequest {
  const req = new NextRequest(new URL('http://localhost:3000/api/client/change-plan'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  } as never);
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => name === '__presenzia_client' ? { value: 'valid-token' } : undefined,
    }),
  });
  return req;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = 'test_resend_key';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  // Reset client to default state
  mockClient.plan = 'growth';
  mockClient.pending_plan_change = null;
  mockClient.stripe_subscription_id = 'sub_123';
  mockClient.stripe_customer_id = 'cus_123';
  // Reset subscription mock
  mockSubscriptionRetrieve.mockResolvedValue({
    items: { data: [{ id: 'si_123', current_period_start: 1700000000, current_period_end: 1702592000, price: { id: 'price_test_growth' } }] },
    schedule: null,
    cancel_at_period_end: false,
  });
});

describe('POST /api/client/change-plan', () => {
  describe('auth', () => {
    it('rejects unauthenticated requests', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/client/change-plan'), {
        method: 'POST',
        body: JSON.stringify({ targetPlan: 'premium' }),
        headers: { 'content-type': 'application/json' },
      } as never);
      Object.defineProperty(req, 'cookies', {
        get: () => ({ get: () => undefined }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('validation', () => {
    it('rejects invalid plan', async () => {
      const req = createChangePlanRequest({ targetPlan: 'nonexistent' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid plan');
    });

    it('rejects same plan', async () => {
      const req = createChangePlanRequest({ targetPlan: 'growth' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Already on this plan');
    });
  });

  describe('upgrade (growth → premium)', () => {
    it('creates checkout session with prorated amount', async () => {
      mockInvoicePreview.mockResolvedValue({ amount_due: 65000 });
      mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/upgrade' });

      const req = createChangePlanRequest({ targetPlan: 'premium' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.checkoutUrl).toBe('https://checkout.stripe.com/upgrade');
      expect(data.prorationAmount).toBe(65000);
      expect(data.formattedAmount).toBe('£650.00');
      expect(data.immediate).toBe(false);

      // Verify checkout session params
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          mode: 'payment',
        })
      );
    });

    it('applies upgrade immediately when no proration charge', async () => {
      mockInvoicePreview.mockResolvedValue({ amount_due: 0 });

      const req = createChangePlanRequest({ targetPlan: 'premium' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.immediate).toBe(true);
      expect(data.newPlan).toBe('premium');

      // Should update subscription directly
      expect(mockSubscriptionUpdate).toHaveBeenCalledWith('sub_123', expect.objectContaining({
        items: [{ id: 'si_123', price: 'price_test_premium' }],
      }));

      // Should send confirmation email
      expect(mockEmailSend).toHaveBeenCalled();
    });
  });

  describe('downgrade (growth → audit)', () => {
    it('creates subscription schedule for end-of-period downgrade', async () => {
      const req = createChangePlanRequest({ targetPlan: 'audit' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.immediate).toBe(false);
      expect(data.newPlan).toBe('audit');
      expect(data.effectiveDate).toBeTruthy();

      // Should have created a schedule
      expect(mockScheduleCreate).toHaveBeenCalledWith({
        from_subscription: 'sub_123',
      });

      // Should have updated the schedule with two phases
      expect(mockScheduleUpdate).toHaveBeenCalledWith('sch_123', expect.objectContaining({
        end_behavior: 'release',
        phases: expect.arrayContaining([
          expect.objectContaining({ items: [{ price: 'price_test_growth' }] }),
          expect.objectContaining({ items: [{ price: 'price_test_audit' }] }),
        ]),
      }));

      // Should record pending change in DB
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ pending_plan_change: 'audit' })
      );

      // Should send email
      expect(mockEmailSend).toHaveBeenCalled();
    });
  });

  describe('cancel-pending', () => {
    it('cancels pending downgrade', async () => {
      mockClient.pending_plan_change = 'audit' as never;
      mockSubscriptionRetrieve.mockResolvedValue({
        items: { data: [{ id: 'si_123' }] },
        schedule: 'sch_456',
        cancel_at_period_end: false,
      });

      const req = createChangePlanRequest({ action: 'cancel-pending' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);

      // Should have released the schedule
      expect(mockScheduleRelease).toHaveBeenCalledWith('sch_456');

      // Should clear pending state in DB
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ pending_plan_change: null, pending_change_date: null })
      );
    });

    it('cancels pending cancellation (undo cancel_at_period_end)', async () => {
      mockClient.pending_plan_change = 'cancel' as never;

      const req = createChangePlanRequest({ action: 'cancel-pending' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);

      // Should undo Stripe cancellation
      expect(mockSubscriptionUpdate).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: false,
      });
    });
  });

  describe('release existing schedule before change', () => {
    it('releases existing schedule before applying new change', async () => {
      mockSubscriptionRetrieve
        .mockResolvedValueOnce({
          items: { data: [{ id: 'si_123', current_period_start: 1700000000, current_period_end: 1702592000, price: { id: 'price_test_growth' } }] },
          schedule: 'sch_existing',
          cancel_at_period_end: false,
        })
        .mockResolvedValueOnce({
          items: { data: [{ id: 'si_123', current_period_start: 1700000000, current_period_end: 1702592000, price: { id: 'price_test_growth' } }] },
          schedule: null,
          cancel_at_period_end: false,
        });

      const req = createChangePlanRequest({ targetPlan: 'audit' });
      const res = await POST(req);
      expect(res.status).toBe(200);

      // Should release the existing schedule first
      expect(mockScheduleRelease).toHaveBeenCalledWith('sch_existing');
    });
  });

  describe('no subscription', () => {
    it('rejects when no subscription exists', async () => {
      mockClient.stripe_subscription_id = '' as never;

      const req = createChangePlanRequest({ targetPlan: 'premium' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('No active subscription');
    });
  });
});

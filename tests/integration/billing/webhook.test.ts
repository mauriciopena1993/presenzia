import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
const mockUpsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'client-123' }, error: null }) }) });
const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'job-456' }, error: null }) }) });
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) });
const mockSelect = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') return {
        upsert: mockUpsert,
        update: (...args: unknown[]) => {
          mockUpdate(...args);
          return { eq: vi.fn().mockReturnValue({ is: vi.fn().mockResolvedValue({ data: null, error: null }) }) };
        },
        select: (...args: unknown[]) => {
          mockSelect(...args);
          return {
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'client-123', email: 'test@test.com', business_name: 'Test', plan: 'audit', status: 'active', pending_plan_change: null }, error: null }),
              limit: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
            }),
          };
        },
      };
      if (table === 'audit_jobs') return { insert: mockInsert };
      if (table === 'leads') return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ is: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) };
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) };
    }),
  },
}));

// Mock Stripe
const mockConstructEvent = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
  planFromPriceId: vi.fn().mockReturnValue('growth'),
  PLANS: {
    audit: { priceId: 'price_test_audit' },
    growth: { priceId: 'price_test_growth' },
    premium: { priceId: 'price_test_premium' },
  },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ id: 'email-1' });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

// Mock plan change email
vi.mock('@/app/api/client/change-plan/route', () => ({
  sendPlanChangeEmail: vi.fn(),
}));

// Mock fetch for process-audit trigger
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

import { POST } from '@/app/api/webhook/route';
import { NextRequest } from 'next/server';

function createWebhookRequest(body: string, signature: string): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/webhook'), {
    method: 'POST',
    body,
    headers: {
      'stripe-signature': signature,
      'content-type': 'application/json',
    },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.RESEND_API_KEY = 'test_resend_key';
  process.env.INTERNAL_API_SECRET = 'test_internal_secret';
});

describe('POST /api/webhook', () => {
  describe('signature verification', () => {
    it('rejects requests without stripe-signature header', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/webhook'), {
        method: 'POST',
        body: '{}',
      } as never);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('No signature');
    });

    it('rejects requests with invalid signature', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      const req = createWebhookRequest('{}', 'invalid_sig');
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid signature');
    });
  });

  describe('checkout.session.completed', () => {
    it('creates client and audit job for new signup', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: 'new@test.com',
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              plan: 'audit',
              business_name: 'Test Wealth',
              business_type: 'IFA',
              description: 'Wealth management',
              location: 'London',
              website: 'https://test.com',
              keywords: 'wealth, ifa',
            },
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.received).toBe(true);

      // Should have created client (upsert)
      expect(mockUpsert).toHaveBeenCalled();
      // Should have created audit job
      expect(mockInsert).toHaveBeenCalled();
    });

    it('handles plan upgrade checkout', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            amount_total: 50000,
            metadata: {
              type: 'plan_upgrade',
              client_id: 'client-123',
              to_plan: 'premium',
              subscription_id: 'sub_123',
              subscription_item_id: 'si_123',
              price_id: 'price_test_premium',
              email: 'test@test.com',
              business_name: 'Test Wealth',
            },
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it('skips when email is missing', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: null,
            customer_details: { email: null },
            metadata: { plan: 'audit', business_name: 'Test' },
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
      // Should not have tried to create client
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates client status and plan', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'active',
            items: { data: [{ price: { id: 'price_test_growth' } }] },
            metadata: { plan: 'growth' },
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('customer.subscription.deleted', () => {
    it('marks client as cancelled', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('invoice.payment_failed', () => {
    it('marks client as past_due', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_123',
            amount_due: 24900,
            attempt_count: 1,
          },
        },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('unknown event types', () => {
    it('acknowledges unknown events without crashing', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'unknown.event.type',
        data: { object: {} },
      });

      const req = createWebhookRequest('body', 'valid_sig');
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.received).toBe(true);
    });
  });
});

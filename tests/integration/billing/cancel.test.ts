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
  last_retention_offer_at: null,
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })),
  },
}));

// Mock Stripe
const mockSubscriptionUpdate = vi.fn().mockResolvedValue({});
const mockSubscriptionRetrieve = vi.fn().mockResolvedValue({
  items: { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30 }] },
});
const mockCouponCreate = vi.fn().mockResolvedValue({ id: 'coupon_123' });
const mockPromoCodeCreate = vi.fn().mockResolvedValue({ id: 'promo_123', code: 'STAY-ABC123' });

vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      update: (...args: unknown[]) => mockSubscriptionUpdate(...args),
      retrieve: (...args: unknown[]) => mockSubscriptionRetrieve(...args),
    },
    coupons: {
      create: (...args: unknown[]) => mockCouponCreate(...args),
    },
    promotionCodes: {
      create: (...args: unknown[]) => mockPromoCodeCreate(...args),
    },
  },
}));

// Mock plans
vi.mock('@/lib/plans', () => ({
  PLAN_LABELS: { audit: 'Full AI Audit & Action Plan', growth: 'Growth Retainer', premium: 'Premium' },
}));

// Mock Resend
const mockEmailSend = vi.fn().mockResolvedValue({ id: 'email-1' });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: (...args: unknown[]) => mockEmailSend(...args) };
  },
}));

import { POST } from '@/app/api/client/cancel/route';
import { NextRequest } from 'next/server';

function createCancelRequest(body: Record<string, unknown>): NextRequest {
  const req = new NextRequest(new URL('http://localhost:3000/api/client/cancel'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  } as never);
  // Mock the cookie
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
  mockClient.last_retention_offer_at = null;
});

describe('POST /api/client/cancel', () => {
  describe('check-retention', () => {
    it('returns eligible=true when no previous offer', async () => {
      const req = createCancelRequest({ action: 'check-retention' });
      const res = await POST(req);
      const data = await res.json();
      expect(data.eligible).toBe(true);
    });

    it('returns eligible=false when offer was recent', async () => {
      mockClient.last_retention_offer_at = new Date().toISOString() as never;
      const req = createCancelRequest({ action: 'check-retention' });
      const res = await POST(req);
      const data = await res.json();
      expect(data.eligible).toBe(false);
    });
  });

  describe('accept-offer', () => {
    it('creates 50% coupon and generates a promo code', async () => {
      const req = createCancelRequest({ action: 'accept-offer' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.action).toBe('code-generated');
      expect(data.promoCode).toBe('STAY-ABC123');
      expect(mockCouponCreate).toHaveBeenCalledWith(
        expect.objectContaining({ percent_off: 50, duration: 'once', max_redemptions: 1 })
      );
      expect(mockPromoCodeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          coupon: 'coupon_123',
          max_redemptions: 1,
        })
      );
      // Should NOT auto-apply to subscription (user enters code at checkout)
      expect(mockSubscriptionUpdate).not.toHaveBeenCalled();
    });

    it('rejects if offer was already used recently', async () => {
      mockClient.last_retention_offer_at = new Date().toISOString() as never;
      const req = createCancelRequest({ action: 'accept-offer' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('already used recently');
    });
  });

  describe('confirm-cancel', () => {
    it('sets cancel_at_period_end on Stripe subscription', async () => {
      const req = createCancelRequest({ action: 'confirm-cancel' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.action).toBe('cancellation-scheduled');
      expect(data.endDate).toBeTruthy();
      expect(mockSubscriptionUpdate).toHaveBeenCalledWith('sub_123', { cancel_at_period_end: true });
    });
  });

  describe('undo-cancel', () => {
    it('removes cancel_at_period_end', async () => {
      const req = createCancelRequest({ action: 'undo-cancel' });
      const res = await POST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.action).toBe('cancellation-reversed');
      expect(mockSubscriptionUpdate).toHaveBeenCalledWith('sub_123', { cancel_at_period_end: false });
    });
  });

  describe('submit-feedback', () => {
    it('sends feedback email to admin', async () => {
      const req = createCancelRequest({ action: 'submit-feedback', feedback: 'Too expensive' });
      const res = await POST(req);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('handles empty feedback gracefully', async () => {
      const req = createCancelRequest({ action: 'submit-feedback', feedback: '' });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('invalid action', () => {
    it('returns 400 for unknown action', async () => {
      const req = createCancelRequest({ action: 'invalid-action' });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});

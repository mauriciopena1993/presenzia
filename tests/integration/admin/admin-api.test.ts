import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock admin-auth
vi.mock('@/lib/admin-auth', () => ({
  verifySessionToken: vi.fn().mockReturnValue({ valid: true }),
  SESSION_COOKIE: '__presenzia_admin',
}));

// Mock supabase
const mockClients = [
  { id: 'client-1', email: 'c1@test.com', plan: 'growth', status: 'active', business_name: 'Firm A', audit_jobs: [] },
  { id: 'client-2', email: 'c2@test.com', plan: 'premium', status: 'active', business_name: 'Firm B', audit_jobs: [] },
];

const mockLeads = [
  { id: 'lead-1', email: 'lead@test.com', name: 'Lead User', created_at: '2024-01-01' },
];

const mockFreeScores = [
  { id: 'fs-1', firm_name: 'Test Firm', score: 45, grade: 'C', created_at: '2024-01-01' },
];

const mockRatings = [
  { client_id: 'client-1', rating: 5, comment: 'Great', created_at: '2024-01-15' },
];

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
          }),
        };
      }
      if (table === 'leads') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockLeads, error: null }),
          }),
        };
      }
      if (table === 'free_scores') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFreeScores, error: null }),
          }),
        };
      }
      if (table === 'report_ratings') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockRatings, error: null }),
          }),
        };
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) };
    }),
  },
}));

import { GET as getClients } from '@/app/api/admin/clients/route';
import { GET as getLeads } from '@/app/api/admin/leads/route';
import { GET as getFreeScores } from '@/app/api/admin/free-scores/route';
import { NextRequest } from 'next/server';

function createAdminRequest(path: string, authenticated = true): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), { method: 'GET' } as never);
  Object.defineProperty(req, 'cookies', {
    get: () => ({
      get: (name: string) => {
        if (name === '__presenzia_admin' && authenticated) return { value: 'valid-admin-token' };
        return undefined;
      },
    }),
  });
  return req;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Admin APIs', () => {
  describe('GET /api/admin/clients', () => {
    it('returns clients with ratings for authenticated admin', async () => {
      const req = createAdminRequest('/api/admin/clients');
      const res = await getClients(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.clients).toHaveLength(2);
      expect(data.clients[0].latest_rating).toBe(5);
      expect(data.clients[1].latest_rating).toBeNull();
    });

    it('rejects unauthenticated requests', async () => {
      const req = createAdminRequest('/api/admin/clients', false);
      const res = await getClients(req);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/leads', () => {
    it('returns leads for authenticated admin', async () => {
      const req = createAdminRequest('/api/admin/leads');
      const res = await getLeads(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.leads).toHaveLength(1);
      expect(data.leads[0].email).toBe('lead@test.com');
    });

    it('rejects unauthenticated requests', async () => {
      const req = createAdminRequest('/api/admin/leads', false);
      const res = await getLeads(req);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/free-scores', () => {
    it('returns free scores for authenticated admin', async () => {
      const req = createAdminRequest('/api/admin/free-scores');
      const res = await getFreeScores(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.scores).toHaveLength(1);
      expect(data.scores[0].firm_name).toBe('Test Firm');
    });

    it('rejects unauthenticated requests', async () => {
      const req = createAdminRequest('/api/admin/free-scores', false);
      const res = await getFreeScores(req);
      expect(res.status).toBe(401);
    });
  });
});

import { test, expect } from '@playwright/test';
import { clientAuthCookie } from './helpers/auth';

// ── Shared mock data ────────────────────────────────────────────

const MOCK_AUDIT_CLIENT = {
  id: 'client-audit-uuid',
  email: 'auditor@example.com',
  plan: 'audit',
  status: 'active',
  business_name: 'Test Wealth Ltd',
  business_type: 'IFA',
  location: 'London',
  website: 'https://testwealth.com',
  created_at: '2026-01-01T00:00:00Z',
  pending_plan_change: null,
  pending_change_date: null,
};

const MOCK_PLATFORMS_JSON = [
  { platform: 'ChatGPT', score: 65, promptsTested: 30, promptsMentioned: 8, avgPosition: 3.2, competitors: ['Firm A'] },
  { platform: 'Claude', score: 45, promptsTested: 30, promptsMentioned: 4, avgPosition: 5.1, competitors: [] },
  { platform: 'Perplexity', score: 80, promptsTested: 30, promptsMentioned: 12, avgPosition: 2.0, competitors: ['Firm B'] },
  { platform: 'Google AI', score: 70, promptsTested: 30, promptsMentioned: 10, avgPosition: 2.8, competitors: ['Firm A', 'Firm C'] },
];

const MOCK_COMPETITORS_JSON = [
  { name: 'Firm A', count: 15 },
  { name: 'Firm B', count: 8 },
];

const MOCK_INSIGHTS_JSON = {
  categories: [],
  actions: [],
  nextMonthHints: [],
  totalSearches: 120,
  totalFound: 34,
};

const MOCK_LATEST_JOB = {
  id: 'job-audit-uuid',
  status: 'completed',
  overall_score: 72,
  grade: 'C',
  summary: 'Your firm shows moderate AI visibility across the four major platforms tested.',
  platforms_json: MOCK_PLATFORMS_JSON,
  competitors_json: MOCK_COMPETITORS_JSON,
  report_path: '/reports/test-audit.pdf',
  created_at: '2026-01-15T00:00:00Z',
  completed_at: '2026-01-15T00:30:00Z',
  insights_json: MOCK_INSIGHTS_JSON,
};

// ── Helper to set up route mocks for audit-tier dashboard ────────

function setupAuditDashboardMocks(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: MOCK_AUDIT_CLIENT,
          latestJob: MOCK_LATEST_JOB,
          pendingJob: null,
        }),
      })
    ),
    page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports: [MOCK_LATEST_JOB] }),
      })
    ),
  ]);
}

test.describe('Dashboard — Audit Tier', () => {
  test.beforeEach(async ({ context }) => {
    // Set auth cookie so middleware doesn't redirect
    await context.addCookies([clientAuthCookie('auditor@example.com')]);
  });

  // ─── Page Load & Business Info ─────────────────────────────

  test('dashboard loads for audit-tier client with report visible', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    // Loading state disappears and content appears
    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Business name should be visible in the nav
    await expect(page.getByText('Test Wealth Ltd')).toBeVisible();
  });

  test('shows business name and plan badge ("Full AI Audit")', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Test Wealth Ltd')).toBeVisible();
    await expect(page.getByText('Full AI Audit')).toBeVisible();
  });

  // ─── Score & Grade ─────────────────────────────────────────

  test('shows audit score (72) and grade (C) in the report', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // The InteractiveReport renders the score and grade
    // Score 72 should be visible
    await expect(page.locator('text=72').first()).toBeVisible();
    // Grade C
    await expect(page.getByText('Grade C').first()).toBeVisible();
  });

  // ─── Tab Structure ─────────────────────────────────────────

  test('audit tier shows only "Your Audit" tab (no History or Ask AI)', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Audit tier: single tab labelled "Your Audit"
    await expect(page.getByRole('button', { name: 'Your Audit' })).toBeVisible();

    // Should NOT show Growth/Premium tabs
    await expect(page.getByRole('button', { name: 'Latest Audit' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /ask ai/i })).not.toBeVisible();
  });

  // ─── Report Date & Frequency ───────────────────────────────

  test('shows report date and "One-off" frequency badge', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Report date
    await expect(page.getByText('15 January 2026')).toBeVisible();

    // One-off frequency badge
    await expect(page.getByText('One-off')).toBeVisible();
  });

  // ─── Upsell Section ────────────────────────────────────────

  test('shows upsell section to Growth plan', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Want ongoing visibility tracking?')).toBeVisible();
    await expect(page.getByRole('button', { name: /upgrade to growth retainer/i })).toBeVisible();
  });

  test('shows "Want an updated audit?" section for re-purchase', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Want an updated audit?')).toBeVisible();
    await expect(page.getByRole('button', { name: /buy another audit/i })).toBeVisible();
  });

  // ─── No Chat Sidebar ──────────────────────────────────────

  test('does NOT show AI Audit Assistant chat (audit tier)', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // No chat pane header visible
    await expect(page.getByText('AI Audit Assistant')).not.toBeVisible();
    // No chat input
    await expect(page.getByPlaceholder('Ask about your results…')).not.toBeVisible();
  });

  // ─── Subscription Plans Section ────────────────────────────

  test('shows subscription plans for upgrade (Growth and Premium)', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Subscription plans')).toBeVisible();

    // Should show both Growth and Premium upgrade options
    const upgradeGrowth = page.getByRole('button', { name: /upgrade to growth retainer/i });
    await expect(upgradeGrowth.first()).toBeVisible();

    const upgradePremium = page.getByRole('button', { name: /upgrade to premium/i });
    await expect(upgradePremium.first()).toBeVisible();
  });

  test('shows Growth plan price (£697/mo) and Premium price (£1,997/mo) in plan cards', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('£697').first()).toBeVisible();
    await expect(page.getByText('£1,997').first()).toBeVisible();
  });

  // ─── Sign Out ──────────────────────────────────────────────

  test('sign out button is visible', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  // ─── Footer ────────────────────────────────────────────────

  test('dashboard footer has Contact, Privacy, and Terms links', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    const footer = page.locator('footer');
    await expect(footer.locator('a[href="mailto:hello@presenzia.ai"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
  });

  // ─── Nav Tier Colour ───────────────────────────────────────

  test('nav has presenzia.ai logo linking to homepage', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toContainText('presenzia');
    await expect(logo).toContainText('.ai');
  });

  // ─── Redirect When Unauthenticated ─────────────────────────

  test('redirects to /dashboard/login when not authenticated (401)', async ({ context, page }) => {
    // Clear the cookie
    await context.clearCookies();

    // Mock /api/client/me to return 401
    await page.route('**/api/client/me', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
    );

    await page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
    );

    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('**/dashboard/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard\/login/);
  });

  // ─── Delete Account ────────────────────────────────────────

  test('shows "Delete account and all data" link', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /delete account and all data/i })).toBeVisible();
  });

  test('clicking delete account shows confirmation dialog', async ({ page }) => {
    await setupAuditDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /delete account and all data/i }).click();

    await expect(page.getByText('Delete your account?')).toBeVisible();
    await expect(page.getByText('This will permanently delete your account')).toBeVisible();
    await expect(page.getByRole('button', { name: /yes, delete everything/i })).toBeVisible();
  });

  // ─── No Pending Job State ──────────────────────────────────

  test('shows pending job banner when audit is running', async ({ page }) => {
    await page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: MOCK_AUDIT_CLIENT,
          latestJob: null,
          pendingJob: { id: 'pending-job-id', status: 'running' },
        }),
      })
    );
    await page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports: [] }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/audit is running/i)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { clientAuthCookie } from './helpers/auth';

// ── Shared mock data ────────────────────────────────────────────

const MOCK_PREMIUM_CLIENT = {
  id: 'client-premium-uuid',
  email: 'premium@example.com',
  plan: 'premium',
  status: 'active',
  business_name: 'Elite Wealth Advisors',
  business_type: 'IFA',
  location: 'Edinburgh',
  website: 'https://elitewealth.co.uk',
  created_at: '2025-10-01T00:00:00Z',
  pending_plan_change: null,
  pending_change_date: null,
};

const MOCK_PLATFORMS_JSON = [
  { platform: 'ChatGPT', score: 82, promptsTested: 30, promptsMentioned: 18, avgPosition: 1.8, competitors: ['Firm A'] },
  { platform: 'Claude', score: 75, promptsTested: 30, promptsMentioned: 14, avgPosition: 2.1, competitors: ['Firm B'] },
  { platform: 'Perplexity', score: 90, promptsTested: 30, promptsMentioned: 22, avgPosition: 1.4, competitors: [] },
  { platform: 'Google AI', score: 85, promptsTested: 30, promptsMentioned: 20, avgPosition: 1.6, competitors: ['Firm A'] },
];

const MOCK_COMPETITORS_JSON = [
  { name: 'Firm A', count: 12 },
  { name: 'Firm B', count: 5 },
];

const MOCK_INSIGHTS_JSON = {
  categories: [],
  actions: [],
  nextMonthHints: [],
  totalSearches: 120,
  totalFound: 74,
};

const MOCK_LATEST_JOB = {
  id: 'job-premium-1',
  status: 'completed',
  overall_score: 85,
  grade: 'B',
  summary: 'Your firm has strong AI visibility across all platforms tested.',
  platforms_json: MOCK_PLATFORMS_JSON,
  competitors_json: MOCK_COMPETITORS_JSON,
  report_path: '/reports/premium-latest.pdf',
  created_at: '2026-01-20T00:00:00Z',
  completed_at: '2026-01-20T06:30:00Z',
  insights_json: MOCK_INSIGHTS_JSON,
};

const MOCK_HISTORY_REPORTS = [
  {
    id: 'job-premium-1',
    status: 'completed',
    overall_score: 85,
    grade: 'B',
    completed_at: '2026-01-20T06:30:00Z',
    created_at: '2026-01-20T00:00:00Z',
    report_path: '/reports/premium-1.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
  {
    id: 'job-premium-2',
    status: 'completed',
    overall_score: 80,
    grade: 'B',
    completed_at: '2026-01-19T06:30:00Z',
    created_at: '2026-01-19T00:00:00Z',
    report_path: '/reports/premium-2.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
  {
    id: 'job-premium-3',
    status: 'completed',
    overall_score: 76,
    grade: 'B',
    completed_at: '2026-01-18T06:30:00Z',
    created_at: '2026-01-18T00:00:00Z',
    report_path: '/reports/premium-3.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
  {
    id: 'job-premium-4',
    status: 'completed',
    overall_score: 72,
    grade: 'C',
    completed_at: '2026-01-17T06:30:00Z',
    created_at: '2026-01-17T00:00:00Z',
    report_path: '/reports/premium-4.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
];

// ── Helper ──────────────────────────────────────────────────────

function setupPremiumDashboardMocks(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: MOCK_PREMIUM_CLIENT,
          latestJob: MOCK_LATEST_JOB,
          pendingJob: null,
        }),
      })
    ),
    page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports: MOCK_HISTORY_REPORTS }),
      })
    ),
  ]);
}

test.describe('Dashboard — Premium Tier', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([clientAuthCookie('premium@example.com')]);
  });

  // ─── Page Load & Business Info ─────────────────────────────

  test('dashboard loads for premium-tier client', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Elite Wealth Advisors')).toBeVisible();
  });

  test('shows "Premium" plan badge', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Premium')).toBeVisible();
  });

  // ─── Tab Structure ─────────────────────────────────────────

  test('shows three tabs: Latest Audit, History, Ask AI', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Latest Audit' })).toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask AI' })).toBeVisible();
  });

  // ─── Premium-Exclusive: Daily Monitoring ───────────────────

  test('shows "Daily monitoring" indicator in nav', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Daily monitoring')).toBeVisible();
  });

  test('shows "Daily" frequency badge in report header', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Daily')).toBeVisible();
  });

  // ─── Premium-Exclusive: Next Audit Date (daily) ────────────

  test('shows next audit date (1 day after latest)', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Latest completed_at is 2026-01-20, next daily audit = 2026-01-21
    await expect(page.getByText('21 January 2026')).toBeVisible();
  });

  // ─── Premium-Exclusive: Strategy Call Banner ───────────────

  test('shows strategy call booking banner', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Monthly strategy call')).toBeVisible();
    await expect(page.getByText('Book your 1:1 with your account manager')).toBeVisible();
    await expect(page.locator('a', { hasText: /book a slot/i })).toBeVisible();
  });

  test('strategy call booking link points to Calendly', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    const bookLink = page.locator('a', { hasText: /book a slot/i });
    await expect(bookLink).toHaveAttribute('href', /calendly/);
    await expect(bookLink).toHaveAttribute('target', '_blank');
  });

  // ─── Chat Tab ──────────────────────────────────────────────

  test('Ask AI tab shows chat pane', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Ask AI' }).click();

    await expect(page.getByText('AI Audit Assistant')).toBeVisible();
    await expect(page.getByPlaceholder('Ask about your results…')).toBeVisible();
  });

  // ─── History Tab ───────────────────────────────────────────

  test('History tab shows all 4 audit reports', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /history.*4/i }).click();

    // All report dates should be visible
    await expect(page.getByText('20 January 2026')).toBeVisible();
    await expect(page.getByText('19 January 2026')).toBeVisible();
    await expect(page.getByText('18 January 2026')).toBeVisible();
    await expect(page.getByText('17 January 2026')).toBeVisible();
  });

  // ─── Score Trend Graph ─────────────────────────────────────

  test('shows Score Evolution with "Updated daily" label', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Score Evolution')).toBeVisible();
    await expect(page.getByText('Updated daily')).toBeVisible();
  });

  // ─── Plan Management ──────────────────────────────────────

  test('shows "Your plan" section with Premium highlighted as current', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Your plan')).toBeVisible();
    await expect(page.getByText('Current plan')).toBeVisible();
  });

  test('does NOT show upgrade option (already on highest tier)', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Premium is the highest tier — no upgrade button should exist
    await expect(page.getByRole('button', { name: /upgrade to premium/i })).not.toBeVisible();
  });

  test('shows downgrade to Growth option', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /downgrade to growth retainer/i })).toBeVisible();
  });

  test('shows cancel subscription link', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /cancel subscription/i })).toBeVisible();
  });

  // ─── No Audit-Tier Features ────────────────────────────────

  test('does NOT show audit-tier upsell sections', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Want an updated audit?')).not.toBeVisible();
    await expect(page.getByText('Want ongoing visibility tracking?')).not.toBeVisible();
  });

  // ─── Billing Info ──────────────────────────────────────────

  test('shows Premium price (£1,997/mo) in plan management', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('£1,997').first()).toBeVisible();
    await expect(page.getByText('per month').first()).toBeVisible();
  });

  // ─── Score & Grade ─────────────────────────────────────────

  test('shows audit score (85) and grade (B)', async ({ page }) => {
    await setupPremiumDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=85').first()).toBeVisible();
    await expect(page.getByText('Grade B').first()).toBeVisible();
  });

  // ─── Cancelled Premium Client ──────────────────────────────

  test('cancelled premium client sees resubscribe banner', async ({ page }) => {
    const cancelledClient = { ...MOCK_PREMIUM_CLIENT, status: 'cancelled' };

    await page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: cancelledClient,
          latestJob: MOCK_LATEST_JOB,
          pendingJob: null,
        }),
      })
    );
    await page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports: MOCK_HISTORY_REPORTS }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('No active subscription')).toBeVisible();
    await expect(page.locator('a', { hasText: /view plans & resubscribe/i })).toBeVisible();
  });

  test('cancelled premium client does NOT see strategy call banner', async ({ page }) => {
    const cancelledClient = { ...MOCK_PREMIUM_CLIENT, status: 'cancelled' };

    await page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: cancelledClient,
          latestJob: MOCK_LATEST_JOB,
          pendingJob: null,
        }),
      })
    );
    await page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports: MOCK_HISTORY_REPORTS }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Monthly strategy call')).not.toBeVisible();
  });
});

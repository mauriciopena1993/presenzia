import { test, expect } from '@playwright/test';
import { clientAuthCookie } from './helpers/auth';

// ── Shared mock data ────────────────────────────────────────────

const MOCK_GROWTH_CLIENT = {
  id: 'client-growth-uuid',
  email: 'growth@example.com',
  plan: 'growth',
  status: 'active',
  business_name: 'Growth Wealth Partners',
  business_type: 'IFA',
  location: 'Manchester',
  website: 'https://growthwealth.co.uk',
  created_at: '2025-11-01T00:00:00Z',
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
  id: 'job-growth-1',
  status: 'completed',
  overall_score: 72,
  grade: 'C',
  summary: 'Your firm shows moderate AI visibility.',
  platforms_json: MOCK_PLATFORMS_JSON,
  competitors_json: MOCK_COMPETITORS_JSON,
  report_path: '/reports/growth-latest.pdf',
  created_at: '2026-01-15T00:00:00Z',
  completed_at: '2026-01-15T00:30:00Z',
  insights_json: MOCK_INSIGHTS_JSON,
};

const MOCK_HISTORY_REPORTS = [
  {
    id: 'job-growth-1',
    status: 'completed',
    overall_score: 72,
    grade: 'C',
    completed_at: '2026-01-15T00:30:00Z',
    created_at: '2026-01-15T00:00:00Z',
    report_path: '/reports/growth-1.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
  {
    id: 'job-growth-2',
    status: 'completed',
    overall_score: 68,
    grade: 'D',
    completed_at: '2026-01-08T00:30:00Z',
    created_at: '2026-01-08T00:00:00Z',
    report_path: '/reports/growth-2.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
  {
    id: 'job-growth-3',
    status: 'completed',
    overall_score: 60,
    grade: 'D',
    completed_at: '2026-01-01T00:30:00Z',
    created_at: '2026-01-01T00:00:00Z',
    report_path: '/reports/growth-3.pdf',
    platforms_json: MOCK_PLATFORMS_JSON,
  },
];

// ── Helper ──────────────────────────────────────────────────────

function setupGrowthDashboardMocks(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: MOCK_GROWTH_CLIENT,
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

test.describe('Dashboard — Growth Tier', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([clientAuthCookie('growth@example.com')]);
  });

  // ─── Page Load & Business Info ─────────────────────────────

  test('dashboard loads for growth-tier client', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Growth Wealth Partners')).toBeVisible();
  });

  test('shows "Growth Retainer" plan badge', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Growth Retainer')).toBeVisible();
  });

  // ─── Tab Structure ─────────────────────────────────────────

  test('shows three tabs: Latest Audit, History, Ask AI', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Latest Audit' })).toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask AI' })).toBeVisible();
  });

  // ─── Weekly Monitoring Badge ───────────────────────────────

  test('shows "Weekly updates" monitoring indicator in nav', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Weekly updates')).toBeVisible();
  });

  test('shows "Weekly" frequency badge in report header', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Weekly')).toBeVisible();
  });

  // ─── Next Audit Date ──────────────────────────────────────

  test('shows next audit date (7 days after latest)', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Latest completed_at is 2026-01-15, next weekly audit = 2026-01-22
    await expect(page.getByText('22 January 2026')).toBeVisible();
  });

  // ─── Chat Tab ──────────────────────────────────────────────

  test('Ask AI tab shows chat pane with AI Audit Assistant', async ({ page }) => {
    await setupGrowthDashboardMocks(page);

    // Mock chat API
    await page.route('**/api/client/chat', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Here is my analysis of your results...' }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Click on Ask AI tab
    await page.getByRole('button', { name: 'Ask AI' }).click();

    // Should show the chat pane
    await expect(page.getByText('AI Audit Assistant')).toBeVisible();
    await expect(page.getByPlaceholder('Ask about your results…')).toBeVisible();
  });

  test('chat shows welcome message with business name', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Ask AI' }).click();

    // Welcome message should reference the business name
    await expect(page.getByText(/growth wealth partners/i)).toBeVisible();
  });

  test('chat has input field and send button', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Ask AI' }).click();

    const chatInput = page.getByPlaceholder('Ask about your results…');
    await expect(chatInput).toBeVisible();

    // Send button exists (arrow →)
    const sendButton = page.getByRole('button', { name: '→' });
    await expect(sendButton).toBeVisible();
    // Disabled when empty
    await expect(sendButton).toBeDisabled();
  });

  test('chat description text is shown on the Ask AI tab', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Ask AI' }).click();

    await expect(page.getByText(/ask anything about your results/i)).toBeVisible();
  });

  // ─── History Tab ───────────────────────────────────────────

  test('History tab shows multiple audit reports', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Click History tab — shows count
    await page.getByRole('button', { name: /history.*3/i }).click();

    // Should show dates of all 3 reports
    await expect(page.getByText('15 January 2026')).toBeVisible();
    await expect(page.getByText('8 January 2026')).toBeVisible();
    await expect(page.getByText('1 January 2026')).toBeVisible();
  });

  test('History tab shows "Latest" badge on first report', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /history/i }).click();

    await expect(page.getByText('Latest')).toBeVisible();
  });

  test('History tab shows scores and grades for each report', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /history/i }).click();

    // Score 72 and Grade C for the latest
    await expect(page.getByText('/ 100 · Grade C').first()).toBeVisible();
    // Score 68 and Grade D for the second
    await expect(page.getByText('/ 100 · Grade D').first()).toBeVisible();
  });

  test('History tab shows download buttons for completed reports', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /history/i }).click();

    // Should have download buttons (text: "↓ Audit")
    const downloadButtons = page.getByRole('button', { name: /audit/i });
    // At least the first report's download button
    await expect(downloadButtons.first()).toBeVisible();
  });

  // ─── Score Trend Graph ─────────────────────────────────────

  test('shows Score Evolution trend graph (with 3 completed audits)', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // Score evolution section should be visible (growth has 3 reports, >= 2)
    await expect(page.getByText('Score Evolution')).toBeVisible();
    // Should show the updated frequency
    await expect(page.getByText('Updated weekly')).toBeVisible();
  });

  // ─── Plan Management ──────────────────────────────────────

  test('shows "Your plan" section with Growth highlighted as current', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Your plan')).toBeVisible();
    // Growth should show "Current plan" indicator
    await expect(page.getByText('Current plan')).toBeVisible();
  });

  test('shows upgrade to Premium option', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /upgrade to premium/i })).toBeVisible();
  });

  test('shows cancel subscription link', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /cancel subscription/i })).toBeVisible();
  });

  // ─── No Audit-Tier Upsell ─────────────────────────────────

  test('does NOT show audit-tier upsell sections', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // These are audit-tier only messages
    await expect(page.getByText('Want an updated audit?')).not.toBeVisible();
    await expect(page.getByText('Want ongoing visibility tracking?')).not.toBeVisible();
  });

  // ─── No Premium Features ──────────────────────────────────

  test('does NOT show premium strategy call banner', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Monthly strategy call')).not.toBeVisible();
    await expect(page.getByText(/book a slot/i)).not.toBeVisible();
  });

  test('does NOT show "Daily monitoring" text', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Daily monitoring')).not.toBeVisible();
  });

  // ─── Billing Info ──────────────────────────────────────────

  test('shows Growth price (£697/mo) and per-month label', async ({ page }) => {
    await setupGrowthDashboardMocks(page);
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // In plan management section
    await expect(page.getByText('£697').first()).toBeVisible();
    await expect(page.getByText('per month').first()).toBeVisible();
  });
});

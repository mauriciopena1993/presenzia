import { test, expect } from '@playwright/test';
import { clientAuthCookie } from './helpers/auth';

// ── Shared mock data ────────────────────────────────────────────

const MOCK_PLATFORMS_JSON = [
  { platform: 'ChatGPT', score: 65, promptsTested: 30, promptsMentioned: 8, avgPosition: 3.2, competitors: ['Firm A'] },
  { platform: 'Claude', score: 45, promptsTested: 30, promptsMentioned: 4, avgPosition: 5.1, competitors: [] },
  { platform: 'Perplexity', score: 80, promptsTested: 30, promptsMentioned: 12, avgPosition: 2.0, competitors: ['Firm B'] },
  { platform: 'Google AI', score: 70, promptsTested: 30, promptsMentioned: 10, avgPosition: 2.8, competitors: ['Firm A', 'Firm C'] },
];

const MOCK_LATEST_JOB = {
  id: 'job-billing-uuid',
  status: 'completed',
  overall_score: 72,
  grade: 'C',
  summary: 'Your firm shows moderate AI visibility.',
  platforms_json: MOCK_PLATFORMS_JSON,
  competitors_json: [{ name: 'Firm A', count: 15 }],
  report_path: '/reports/billing-test.pdf',
  created_at: '2026-01-15T00:00:00Z',
  completed_at: '2026-01-15T00:30:00Z',
  insights_json: { categories: [], actions: [], nextMonthHints: [], totalSearches: 120, totalFound: 34 },
};

function makeClient(plan: string, overrides = {}) {
  return {
    id: `client-${plan}-uuid`,
    email: `${plan}@example.com`,
    plan,
    status: 'active',
    business_name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Wealth Ltd`,
    business_type: 'IFA',
    location: 'London',
    website: 'https://test.com',
    created_at: '2025-11-01T00:00:00Z',
    pending_plan_change: null,
    pending_change_date: null,
    ...overrides,
  };
}

function setupDashboardMocks(page: import('@playwright/test').Page, plan: string, clientOverrides = {}) {
  const client = makeClient(plan, clientOverrides);
  const reports = plan === 'audit'
    ? [MOCK_LATEST_JOB]
    : [
        MOCK_LATEST_JOB,
        { ...MOCK_LATEST_JOB, id: 'job-2', overall_score: 68, grade: 'D', completed_at: '2026-01-08T00:30:00Z', created_at: '2026-01-08T00:00:00Z' },
      ];

  return Promise.all([
    page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client,
          latestJob: MOCK_LATEST_JOB,
          pendingJob: null,
        }),
      })
    ),
    page.route('**/api/client/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports }),
      })
    ),
  ]);
}

test.describe('Dashboard — Billing Flows', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([clientAuthCookie('billing@example.com')]);
  });

  // ─── Upgrade ──────────────────────────────────────────────

  test('Growth plan: upgrade to Premium button is visible', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /upgrade to premium/i })).toBeVisible();
  });

  test('Growth plan: clicking upgrade shows confirmation modal', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /upgrade to premium/i }).first().click();

    // PlanConfirmModal should appear
    await expect(page.getByRole('heading', { name: /upgrade to premium/i })).toBeVisible();
    // Should mention prorated charge
    await expect(page.getByText(/prorated difference/i)).toBeVisible();
    // Should have confirm and cancel buttons
    await expect(page.getByRole('button', { name: /upgrade to premium/i }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: /never mind/i })).toBeVisible();
  });

  test('upgrade confirmation modal can be dismissed with "Never mind"', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /upgrade to premium/i }).first().click();
    await expect(page.getByRole('heading', { name: /upgrade to premium/i })).toBeVisible();

    await page.getByRole('button', { name: /never mind/i }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: /upgrade to premium/i })).not.toBeVisible();
  });

  test('Audit plan: shows upgrade buttons for Growth and Premium', async ({ page }) => {
    await setupDashboardMocks(page, 'audit');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    // In the subscription plans section
    await expect(page.getByText('Subscription plans')).toBeVisible();

    const upgradeGrowthBtns = page.getByRole('button', { name: /upgrade to growth retainer/i });
    await expect(upgradeGrowthBtns.first()).toBeVisible();

    const upgradePremiumBtns = page.getByRole('button', { name: /upgrade to premium/i });
    await expect(upgradePremiumBtns.first()).toBeVisible();
  });

  // ─── Downgrade ────────────────────────────────────────────

  test('Premium plan: downgrade button shows', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /downgrade to growth retainer/i })).toBeVisible();
  });

  test('Premium plan: clicking downgrade shows confirmation modal', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /downgrade to growth retainer/i }).click();

    // PlanConfirmModal for downgrade
    await expect(page.getByRole('heading', { name: /switch to growth retainer/i })).toBeVisible();
    // Should mention end of billing cycle
    await expect(page.getByText(/end of your billing cycle/i)).toBeVisible();
    // Should show what you'll lose
    await expect(page.getByText(/what you'll lose/i)).toBeVisible();
  });

  // ─── Cancel Subscription ──────────────────────────────────

  test('cancel button opens cancellation flow', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    // Mock the retention check
    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();

    // Step 1: "Are you sure?" with loss list
    await expect(page.getByText('Are you sure?')).toBeVisible();
    await expect(page.getByText(/if you cancel your growth retainer plan/i)).toBeVisible();
  });

  test('cancellation step 1 shows list of features to be lost', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();

    // Should list the features they'll lose
    await expect(page.getByText('Monthly re-audits')).toBeVisible();
    await expect(page.getByText('AI audit assistant')).toBeVisible();
    await expect(page.getByText('Competitor deep-dive analysis')).toBeVisible();
  });

  test('"Never mind, keep my plan" button closes cancellation flow', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await expect(page.getByText('Are you sure?')).toBeVisible();

    await page.getByRole('button', { name: /never mind, keep my plan/i }).click();

    // Should close the cancellation flow
    await expect(page.getByText('Are you sure?')).not.toBeVisible();
    // Cancel button should reappear
    await expect(page.getByRole('button', { name: /cancel subscription/i })).toBeVisible();
  });

  // ─── Cancel: Downgrade Offer (Premium → Growth) ───────────

  test('Premium cancel: step 2 shows downgrade offer before retention', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await expect(page.getByText('Are you sure?')).toBeVisible();

    // Click "I want to cancel"
    await page.getByRole('button', { name: /i want to cancel/i }).click();

    // Premium has rank > 0, so downgrade offer appears first
    await expect(page.getByText('Would you rather switch to a cheaper plan?')).toBeVisible();
    // Should show Growth as an option
    await expect(page.getByRole('button', { name: /switch to growth retainer/i })).toBeVisible();
  });

  test('Premium cancel: "No thanks, cancel completely" skips to retention or confirm', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();

    // Downgrade offer step
    await expect(page.getByText('Would you rather switch to a cheaper plan?')).toBeVisible();

    // Skip downgrade
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();

    // Should show retention offer (eligible = true)
    await expect(page.getByText('Before you go...')).toBeVisible();
    await expect(page.getByText('50% off your next month')).toBeVisible();
  });

  // ─── Cancel: Retention Offer ──────────────────────────────

  test('Growth cancel: retention offer shows 50% off when eligible', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    // Growth has no downgrade offer (rank 1, but audit is rank 0)
    // Actually growth has PLAN_ORDER.indexOf('growth') = 1, so it WILL show downgrade offer
    await page.getByRole('button', { name: /i want to cancel/i }).click();

    // Growth shows downgrade offer since planRank > 0
    await expect(page.getByText('Would you rather switch to a cheaper plan?')).toBeVisible();
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();

    // Retention offer
    await expect(page.getByText('Before you go...')).toBeVisible();
    await expect(page.getByText('50% off your next month')).toBeVisible();
    await expect(page.getByRole('button', { name: /yes, give me 50% off/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /no thanks, cancel anyway/i })).toBeVisible();
  });

  test('accepting retention offer shows "Discount applied!" confirmation', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    let callCount = 0;
    await page.route('**/api/client/cancel', route => {
      callCount++;
      if (callCount === 1) {
        // First call: check-retention
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ eligible: true }),
        });
      }
      // Second call: accept-offer
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();
    // Skip downgrade offer
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();
    // Accept retention
    await page.getByRole('button', { name: /yes, give me 50% off/i }).click();

    await expect(page.getByText('Discount applied!')).toBeVisible();
    await expect(page.getByText(/your next month is 50% off/i)).toBeVisible();
  });

  // ─── Cancel: Final Confirmation ───────────────────────────

  test('declining retention offer shows final confirmation step', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();
    // Skip downgrade
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();
    // Decline retention
    await page.getByRole('button', { name: /no thanks, cancel anyway/i }).click();

    // Final confirmation
    await expect(page.getByText('Last step')).toBeVisible();
    await expect(page.getByText(/remain active until the end of your current billing period/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm cancellation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /never mind/i })).toBeVisible();
  });

  test('confirming cancellation shows "sad to see you go" with feedback form', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    let callCount = 0;
    await page.route('**/api/client/cancel', route => {
      callCount++;
      if (callCount <= 1) {
        // check-retention
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ eligible: false }),
        });
      }
      // confirm-cancel
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, formattedEndDate: '15 February 2026', endDate: '2026-02-15T00:00:00Z' }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();
    // Downgrade offer step (Growth has rank > 0)
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();

    // Not eligible for retention, goes straight to confirming
    await expect(page.getByText('Last step')).toBeVisible();
    await page.getByRole('button', { name: /confirm cancellation/i }).click();

    // Done step
    await expect(page.getByText(/sad to see you go/i)).toBeVisible();
    await expect(page.getByText('15 February 2026')).toBeVisible();
    await expect(page.getByText('No further payments will be made.')).toBeVisible();
  });

  test('feedback textarea and send button appear after cancellation', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    let callCount = 0;
    await page.route('**/api/client/cancel', route => {
      callCount++;
      if (callCount <= 1) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ eligible: false }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, formattedEndDate: '15 February 2026' }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();
    await page.getByRole('button', { name: /confirm cancellation/i }).click();

    // Feedback form
    await expect(page.getByText(/would you mind sharing why/i)).toBeVisible();
    const textarea = page.getByPlaceholder('What could we have done better?');
    await expect(textarea).toBeVisible();

    // Send feedback button is disabled when empty
    const sendBtn = page.getByRole('button', { name: /send feedback/i });
    await expect(sendBtn).toBeDisabled();

    // Fill in feedback and button enables
    await textarea.fill('The service was good but too expensive.');
    await expect(sendBtn).toBeEnabled();
  });

  test('submitting feedback shows thank-you message', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');

    let callCount = 0;
    await page.route('**/api/client/cancel', route => {
      callCount++;
      if (callCount <= 1) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ eligible: false }),
        });
      }
      // For both confirm-cancel and submit-feedback
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, formattedEndDate: '15 February 2026' }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();
    await page.getByRole('button', { name: /no thanks, i want to cancel completely/i }).click();
    await page.getByRole('button', { name: /confirm cancellation/i }).click();

    await page.getByPlaceholder('What could we have done better?').fill('Too expensive for our budget.');
    await page.getByRole('button', { name: /send feedback/i }).click();

    await expect(page.getByText(/thank you for your feedback/i)).toBeVisible();
  });

  // ─── Pending Plan Change Banner ───────────────────────────

  test('shows pending cancellation banner at top of page', async ({ page }) => {
    await setupDashboardMocks(page, 'growth', {
      pending_plan_change: 'cancel',
      pending_change_date: '2026-02-15T00:00:00Z',
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Your subscription is ending')).toBeVisible();
    await expect(page.getByText(/15 february 2026/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /undo cancellation/i })).toBeVisible();
  });

  test('shows pending downgrade banner', async ({ page }) => {
    await setupDashboardMocks(page, 'premium', {
      pending_plan_change: 'growth',
      pending_change_date: '2026-02-20T00:00:00Z',
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/switching to growth retainer/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /keep current plan/i })).toBeVisible();
  });

  test('undo cancellation removes the pending banner', async ({ page }) => {
    await setupDashboardMocks(page, 'growth', {
      pending_plan_change: 'cancel',
      pending_change_date: '2026-02-15T00:00:00Z',
    });

    await page.route('**/api/client/change-plan', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Your subscription is ending')).toBeVisible();

    // Click undo — there may be multiple "Undo cancellation" buttons (top banner + plan section)
    await page.getByRole('button', { name: /undo cancellation/i }).first().click();

    // Banner should disappear
    await expect(page.getByText('Your subscription is ending')).not.toBeVisible();
  });

  // ─── Downgrade within Cancel Flow ─────────────────────────

  test('Premium cancel: accepting downgrade offer shows "Plan change confirmed"', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');

    await page.route('**/api/client/cancel', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: true }),
      })
    );

    await page.route('**/api/client/change-plan', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, effectiveDate: '2026-02-20T00:00:00Z' }),
      })
    );

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /i want to cancel/i }).click();

    // Downgrade offer: switch to Growth
    await expect(page.getByText('Would you rather switch to a cheaper plan?')).toBeVisible();

    // For the downgrade within cancel flow, clicking switch triggers handleChangePlan
    // which opens the PlanConfirmModal
    await page.getByRole('button', { name: /switch to growth retainer/i }).click();

    // Confirm modal or switched step
    // The CancelFlow's onChangePlan calls handleChangePlan → opens PlanConfirmModal
    // If PlanConfirmModal appears, confirm it
    const confirmBtn = page.getByRole('button', { name: /switch to growth retainer/i }).last();
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    // Should show "Plan change confirmed!" in the cancel flow
    await expect(page.getByText('Plan change confirmed!')).toBeVisible({ timeout: 5000 });
  });

  // ─── Upgrade Info in Confirmation Modal ────────────────────

  test('upgrade confirmation shows features list for target plan', async ({ page }) => {
    await setupDashboardMocks(page, 'growth');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /upgrade to premium/i }).first().click();

    // Modal should show target plan features
    await expect(page.getByText(/what you'll get/i)).toBeVisible();
    await expect(page.getByText('Everything in Growth')).toBeVisible();
    await expect(page.getByText('Daily dashboard updates')).toBeVisible();
  });

  test('downgrade confirmation shows features that will be lost', async ({ page }) => {
    await setupDashboardMocks(page, 'premium');
    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /downgrade to growth retainer/i }).click();

    // Modal should show what you'll lose
    await expect(page.getByText(/what you'll lose/i)).toBeVisible();
    await expect(page.getByText('Daily dashboard updates')).toBeVisible();
    await expect(page.getByText('Dedicated account manager')).toBeVisible();
  });

  // ─── Pending Change Overwrite Warning ─────────────────────

  test('upgrade modal warns about overwriting pending cancellation', async ({ page }) => {
    await setupDashboardMocks(page, 'growth', {
      pending_plan_change: 'cancel',
      pending_change_date: '2026-02-15T00:00:00Z',
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /upgrade to premium/i }).first().click();

    // Should warn about the pending cancellation being overwritten
    await expect(page.getByText(/pending cancellation/i)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  // ─── Price Display ──────────────────────────────────────────

  test('shows correct price for Audit plan (£99)', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('£99')).toBeVisible();
  });

  test('shows correct price for Growth plan (£249)', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('£249')).toBeVisible();
  });

  test('shows correct price for Premium plan (£599)', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('£599')).toBeVisible();
  });

  // ─── Plan Names ─────────────────────────────────────────────

  test('shows all three plan names', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('FULL AI AUDIT & ACTION PLAN')).toBeVisible();
    await expect(desktop.getByText('GROWTH RETAINER')).toBeVisible();
    await expect(desktop.getByText('PREMIUM')).toBeVisible();
  });

  // ─── Period Labels ──────────────────────────────────────────

  test('Audit shows "one-off" label, Growth and Premium show "/month"', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('one-off')).toBeVisible();
    await expect(desktop.getByText('/month').first()).toBeVisible();
  });

  // ─── CTA Buttons ────────────────────────────────────────────

  test('Audit CTA "Get my audit" navigates to /score', async ({ page }) => {
    await page.goto('/pricing');
    const auditCta = page.locator('.pricing-desktop button', { hasText: 'Get my audit' });
    await auditCta.click();
    await expect(page).toHaveURL(/\/score/);
  });

  test('Growth CTA "Start growing" navigates to /score?plan=growth', async ({ page }) => {
    await page.goto('/pricing');
    const growthCta = page.locator('.pricing-desktop button', { hasText: 'Start growing' });
    await growthCta.click();
    await expect(page).toHaveURL(/\/score\?plan=growth/);
  });

  test('Premium CTA says "Get started" with discovery call link below', async ({ page }) => {
    await page.goto('/pricing');
    const premiumCta = page.locator('.pricing-desktop button', { hasText: 'Get started' });
    await expect(premiumCta).toBeVisible();
    await expect(page.locator('.pricing-desktop a', { hasText: /discovery call/i })).toBeVisible();
  });

  // ─── Growth Badge ───────────────────────────────────────────

  test('Growth plan shows "Most popular" badge', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('MOST POPULAR')).toBeVisible();
  });

  // ─── Compare Features Table ─────────────────────────────────

  test('compare features table toggles open and closed', async ({ page }) => {
    await page.goto('/pricing');

    const toggleBtn = page.getByRole('button', { name: /compare all features/i });
    await expect(toggleBtn).toBeVisible();

    // Click to open
    await toggleBtn.click();

    // Button text changes to "Hide comparison"
    await expect(page.getByRole('button', { name: /hide comparison/i })).toBeVisible();

    // Comparison rows should be visible
    await expect(page.getByText('Full AI audit').first()).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('Personalised action plan').first()).toBeVisible();

    // Click to close
    await page.getByRole('button', { name: /hide comparison/i }).click();

    // Button text reverts
    await expect(page.getByRole('button', { name: /compare all features/i })).toBeVisible();
  });

  // ─── Marketing Descriptions ─────────────────────────────────

  test('plan cards show marketing descriptions', async ({ page }) => {
    await page.goto('/pricing');
    const desktop = page.locator('.pricing-desktop');
    await expect(desktop.getByText('See exactly where your firm stands, and what to fix.')).toBeVisible();
    await expect(desktop.getByText('Ongoing monitoring, recommendations, and measurable improvement.')).toBeVisible();
    await expect(desktop.getByText('We do the work. You get the clients.')).toBeVisible();
  });

  // ─── Section Header ─────────────────────────────────────────

  test('pricing page has the section heading', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /invest less than the value of one client/i })).toBeVisible();
  });

  // ─── VAT Note ───────────────────────────────────────────────

  test('shows VAT and cancellation notice', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/all prices exclude vat/i).first()).toBeVisible();
    await expect(page.getByText(/cancel anytime/i).first()).toBeVisible();
  });
});

// ─── Mobile View ──────────────────────────────────────────────

test.describe('Pricing Page — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile tabs default to Growth', async ({ page }) => {
    await page.goto('/pricing');

    const mobileTabs = page.locator('.pricing-mobile-tabs');
    await expect(mobileTabs).toBeVisible();
    await expect(mobileTabs.getByText('£249')).toBeVisible();
    await expect(mobileTabs.locator('button', { hasText: 'Start growing' })).toBeVisible();
  });

  test('mobile tabs switch to Audit plan', async ({ page }) => {
    await page.goto('/pricing');

    const mobileTabs = page.locator('.pricing-mobile-tabs');
    await mobileTabs.getByRole('button', { name: /full ai audit/i }).click();

    await expect(mobileTabs.getByText('£99')).toBeVisible();
    await expect(mobileTabs.locator('button', { hasText: 'Get my audit' })).toBeVisible();
    await expect(mobileTabs.getByText('one-off')).toBeVisible();
  });

  test('mobile tabs switch to Premium plan', async ({ page }) => {
    await page.goto('/pricing');

    const mobileTabs = page.locator('.pricing-mobile-tabs');
    await mobileTabs.getByRole('button', { name: /premium/i }).click();

    await expect(mobileTabs.getByText('£599')).toBeVisible();
    await expect(mobileTabs.locator('button', { hasText: 'Book a discovery call' })).toBeVisible();
    await expect(mobileTabs.getByText('/month')).toBeVisible();
  });

  test('mobile: Audit CTA navigates to /score', async ({ page }) => {
    await page.goto('/pricing');

    const mobileTabs = page.locator('.pricing-mobile-tabs');
    await mobileTabs.getByRole('button', { name: /full ai audit/i }).click();
    await mobileTabs.locator('button', { hasText: 'Get my audit' }).click();
    await expect(page).toHaveURL(/\/score/);
  });

  test('mobile: Growth CTA navigates to /score', async ({ page }) => {
    await page.goto('/pricing');

    const mobileTabs = page.locator('.pricing-mobile-tabs');
    await mobileTabs.locator('button', { hasText: 'Start growing' }).click();
    await expect(page).toHaveURL(/\/score\?plan=growth/);
  });

  test('mobile: desktop grid is hidden', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('.pricing-desktop')).not.toBeVisible();
  });
});

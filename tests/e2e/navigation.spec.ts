import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  // ─── Page Loads ───────────────────────────────────────────────

  test('homepage loads with correct title containing "presenzia"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/presenzia/i);
  });

  test('pricing page loads at /pricing', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveTitle(/pricing/i);
    await expect(page).toHaveTitle(/presenzia/i);
  });

  test('score page loads at /score', async ({ page }) => {
    await page.goto('/score');
    // Score page is a client component — verify it renders key content
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/score/);
  });

  test('about page loads at /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/about/i);
    await expect(page).toHaveTitle(/presenzia/i);
  });

  test('contact is a mailto link (no dedicated /contact page)', async ({ page }) => {
    // The site uses mailto:hello@presenzia.ai for contact, not a /contact route.
    // Verify the footer contains the mailto link.
    await page.goto('/');
    const contactLink = page.locator('footer a[href^="mailto:"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', 'mailto:hello@presenzia.ai');
  });

  test('privacy page loads at /privacy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/privacy/i);
    await expect(page).toHaveTitle(/presenzia/i);
  });

  test('terms page loads at /terms', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/terms/i);
    await expect(page).toHaveTitle(/presenzia/i);
  });

  test('404 page shows for invalid URL', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/404/i);
    // Verify 404 content is displayed
    await expect(page.locator('text=This page doesn\'t exist')).toBeVisible();
  });

  // ─── Navbar ───────────────────────────────────────────────────

  test('navbar has presenzia.ai logo/text', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    // Logo text: "presenzia" followed by ".ai"
    await expect(nav.locator('a[href="/"]')).toContainText('presenzia');
    await expect(nav.locator('a[href="/"]')).toContainText('.ai');
  });

  // ─── Footer ───────────────────────────────────────────────────

  test('footer has links to About, Pricing, Privacy, Terms, and Contact', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // About link
    const aboutLink = footer.locator('a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toContainText('About');

    // Pricing link
    const pricingLink = footer.locator('a[href="/pricing"]');
    await expect(pricingLink).toBeVisible();
    await expect(pricingLink).toContainText('Pricing');

    // Privacy link
    const privacyLink = footer.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText('Privacy');

    // Terms link
    const termsLink = footer.locator('a[href="/terms"]');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toContainText('Terms');

    // Contact (mailto link)
    const contactLink = footer.locator('a[href="mailto:hello@presenzia.ai"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toContainText('Contact');
  });
});

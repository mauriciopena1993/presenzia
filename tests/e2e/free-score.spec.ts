import { test, expect } from '@playwright/test';

const SPECIALTIES = [
  'Wealth Management',
  'Financial Planning',
  'Retirement & Pensions',
  'Tax Planning',
  'Inheritance & Estate Planning',
  'Mortgage & Protection',
  'Investment Management',
  'Corporate Financial Advisory',
  'General Financial Advisory',
];

const TARGET_CLIENTS = [
  'High-net-worth individuals (£250k+)',
  'Retirees & pre-retirees',
  'Business owners & entrepreneurs',
  'Professionals (doctors, lawyers, etc.)',
  'Families & estate planning',
  'Expats & international clients',
  'General / all client types',
];

const COVERAGE_TYPES = [
  { value: 'local', label: 'Local', desc: 'Primarily serve one city or town' },
  { value: 'multi', label: 'Multi-location', desc: 'Offices or clients in several cities' },
  { value: 'regional', label: 'Regional', desc: 'Serve a wider area (e.g. South East, North West)' },
  { value: 'national', label: 'National / Online', desc: 'Serve clients across the UK' },
];

test.describe('Free Score Page — /score', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/score');
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Form renders with all required fields
  // ─────────────────────────────────────────────────────────────
  test('renders form with all required fields', async ({ page }) => {
    // Firm name input
    await expect(page.getByPlaceholder('e.g. Hartfield Wealth Management')).toBeVisible();

    // Website input
    await expect(page.getByPlaceholder('www.yourfirm.co.uk')).toBeVisible();
    // The "https://" prefix label
    await expect(page.getByText('https://')).toBeVisible();

    // Client reach buttons (all four coverage types)
    for (const ct of COVERAGE_TYPES) {
      await expect(page.getByRole('button', { name: new RegExp(ct.label) })).toBeVisible();
    }

    // Specialties buttons (all nine)
    for (const s of SPECIALTIES) {
      await expect(page.getByRole('button', { name: s })).toBeVisible();
    }

    // Target client dropdown
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue(''); // default empty

    // Firm description textarea (optional/recommended)
    await expect(
      page.getByPlaceholder(/Boutique Chartered firm/),
    ).toBeVisible();

    // Additional context textarea (optional)
    await expect(
      page.getByPlaceholder(/We recently rebranded/),
    ).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Form validation — empty submit stays on form
  // ─────────────────────────────────────────────────────────────
  test('submitting empty form does not navigate away', async ({ page }) => {
    // The submit button should be visible but disabled when no coverage type selected
    const submitBtn = page.getByRole('button', { name: /get my score/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Even if we force-click, the page should remain on the form step
    await submitBtn.click({ force: true });

    // Still on the form — heading still visible
    await expect(page.getByText('Free AI Visibility Score')).toBeVisible();
    await expect(page.getByText('How visible is your firm to AI?')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Selecting "National / Online" does NOT show location field
  // ─────────────────────────────────────────────────────────────
  test('selecting National / Online hides the location field', async ({ page }) => {
    // Click "National / Online"
    await page.getByRole('button', { name: /National \/ Online/i }).click();

    // Location input should NOT be visible
    await expect(page.getByPlaceholder('e.g. Guildford, Bath, Edinburgh')).not.toBeVisible();
    await expect(page.getByPlaceholder('e.g. London, Manchester, Birmingham')).not.toBeVisible();
    await expect(page.getByPlaceholder(/South East England/)).not.toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Selecting "Local" shows location input
  // ─────────────────────────────────────────────────────────────
  test('selecting Local shows the location input', async ({ page }) => {
    // Click "Local"
    await page.getByRole('button', { name: /^Local/ }).click();

    // Location input should appear with local-specific placeholder
    const locationInput = page.getByPlaceholder('e.g. Guildford, Bath, Edinburgh');
    await expect(locationInput).toBeVisible();

    // Label should say "Which city or town?"
    await expect(page.getByText('Which city or town?')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 4b. Multi-location and Regional also show location inputs
  // ─────────────────────────────────────────────────────────────
  test('selecting Multi-location shows the location input with cities placeholder', async ({ page }) => {
    await page.getByRole('button', { name: /Multi-location/ }).click();

    await expect(
      page.getByPlaceholder('e.g. London, Manchester, Birmingham'),
    ).toBeVisible();
    await expect(page.getByText('Which cities?')).toBeVisible();
  });

  test('selecting Regional shows the location input with region placeholder', async ({ page }) => {
    await page.getByRole('button', { name: /Regional/ }).click();

    await expect(
      page.getByPlaceholder(/South East England, Greater London, Yorkshire/),
    ).toBeVisible();
    await expect(page.getByText('Which region or area?')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Clicking specialty buttons toggles them (checkmark appears)
  // ─────────────────────────────────────────────────────────────
  test('clicking a specialty button toggles its selected state', async ({ page }) => {
    const specialtyBtn = page.getByRole('button', { name: 'Wealth Management' });

    // Initially no checkmark
    await expect(specialtyBtn).not.toHaveText(/✓/);

    // Click to select
    await specialtyBtn.click();
    await expect(specialtyBtn).toHaveText(/✓/);

    // Click again to deselect
    await specialtyBtn.click();
    await expect(specialtyBtn).not.toHaveText(/✓/);
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Selecting multiple specialties works
  // ─────────────────────────────────────────────────────────────
  test('multiple specialties can be selected simultaneously', async ({ page }) => {
    const specialtiesToSelect = [
      'Wealth Management',
      'Tax Planning',
      'Investment Management',
    ];

    // Select all three
    for (const s of specialtiesToSelect) {
      await page.getByRole('button', { name: s }).click();
    }

    // Verify all three show checkmarks
    for (const s of specialtiesToSelect) {
      await expect(page.getByRole('button', { name: `✓ ${s}` })).toBeVisible();
    }

    // Verify unselected ones do NOT have checkmarks
    const unselected = SPECIALTIES.filter(s => !specialtiesToSelect.includes(s));
    for (const s of unselected) {
      const btn = page.getByRole('button', { name: s });
      await expect(btn).not.toHaveText(/✓/);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Target client dropdown has all options
  // ─────────────────────────────────────────────────────────────
  test('target client dropdown contains all expected options', async ({ page }) => {
    const select = page.locator('select');

    // Check the disabled placeholder option
    const placeholderOption = select.locator('option[disabled]');
    await expect(placeholderOption).toHaveText('Who do you primarily work with?');

    // Check each target client option exists
    for (const client of TARGET_CLIENTS) {
      const option = select.locator(`option:text-is("${client}")`);
      await expect(option).toBeAttached();
    }

    // Total options: 1 placeholder + 7 client types = 8
    const allOptions = select.locator('option');
    await expect(allOptions).toHaveCount(8);
  });

  test('target client dropdown selection works', async ({ page }) => {
    const select = page.locator('select');

    // Select a specific option
    await select.selectOption({ label: 'Business owners & entrepreneurs' });
    await expect(select).toHaveValue('Business owners & entrepreneurs');

    // Switch to another option
    await select.selectOption({ label: 'Retirees & pre-retirees' });
    await expect(select).toHaveValue('Retirees & pre-retirees');
  });

  // ─────────────────────────────────────────────────────────────
  // 8. "Get my score" button is visible
  // ─────────────────────────────────────────────────────────────
  test('"Get my score" button is visible', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /get my score/i });
    await expect(submitBtn).toBeVisible();
  });

  test('"Get my score" button is disabled until coverage type is selected', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /get my score/i });

    // Initially disabled (no coverage type selected)
    await expect(submitBtn).toBeDisabled();

    // Select a coverage type
    await page.getByRole('button', { name: /National \/ Online/i }).click();

    // Now enabled
    await expect(submitBtn).toBeEnabled();
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Page shows "FREE AI VISIBILITY SCORE" heading
  // ─────────────────────────────────────────────────────────────
  test('page displays "Free AI Visibility Score" heading', async ({ page }) => {
    // The uppercase label
    await expect(page.getByText('Free AI Visibility Score')).toBeVisible();

    // The main heading
    await expect(
      page.getByRole('heading', { name: /how visible is your firm to ai/i }),
    ).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // 10. Footer shows trust signals
  // ─────────────────────────────────────────────────────────────
  test('footer shows "Completely free", "Real AI data", "No credit card"', async ({ page }) => {
    await expect(page.getByText('Completely free')).toBeVisible();
    await expect(page.getByText('Real AI data')).toBeVisible();
    await expect(page.getByText('No credit card')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // Additional interaction tests
  // ─────────────────────────────────────────────────────────────
  test('coverage type buttons highlight when selected', async ({ page }) => {
    // Click Local
    const localBtn = page.getByRole('button', { name: /^Local/ });
    await localBtn.click();

    // The selected button should have the gold border colour
    await expect(localBtn).toHaveCSS('border-color', 'rgba(201, 168, 76, 0.5)');

    // Switch to Regional
    const regionalBtn = page.getByRole('button', { name: /Regional/ });
    await regionalBtn.click();

    // Regional should now be highlighted
    await expect(regionalBtn).toHaveCSS('border-color', 'rgba(201, 168, 76, 0.5)');
  });

  test('location field disappears when switching from Local to National', async ({ page }) => {
    // Select Local first — location field appears
    await page.getByRole('button', { name: /^Local/ }).click();
    await expect(page.getByPlaceholder('e.g. Guildford, Bath, Edinburgh')).toBeVisible();

    // Switch to National — location field disappears
    await page.getByRole('button', { name: /National \/ Online/i }).click();
    await expect(page.getByPlaceholder('e.g. Guildford, Bath, Edinburgh')).not.toBeVisible();
  });

  test('firm name and website inputs accept text', async ({ page }) => {
    const firmInput = page.getByPlaceholder('e.g. Hartfield Wealth Management');
    await firmInput.fill('Test Financial Advisors');
    await expect(firmInput).toHaveValue('Test Financial Advisors');

    const websiteInput = page.getByPlaceholder('www.yourfirm.co.uk');
    await websiteInput.fill('www.testfirm.co.uk');
    await expect(websiteInput).toHaveValue('www.testfirm.co.uk');
  });

  test('website input strips https:// prefix if pasted', async ({ page }) => {
    const websiteInput = page.getByPlaceholder('www.yourfirm.co.uk');

    // The onChange handler strips https:// and http://
    // Simulate typing with prefix
    await websiteInput.fill('');
    await websiteInput.pressSequentially('https://www.example.co.uk');

    // The component strips the protocol on each change event, but fill()
    // triggers a single input event. Let's use the expected behaviour:
    // after typing, the value should have the prefix stripped.
    // Note: pressSequentially fires per-character, so each keystroke
    // triggers onChange which strips the prefix progressively.
    // The final value won't have "https://" because once "https://" is typed,
    // the next char triggers the strip, leaving the rest.
    // With fill() it's simpler — the handler runs once with the full value.
    await websiteInput.fill('https://www.example.co.uk');
    await expect(websiteInput).toHaveValue('www.example.co.uk');
  });

  test('form validation shows error when specialties missing but coverage selected', async ({ page }) => {
    // Fill required fields except specialties
    await page.getByPlaceholder('e.g. Hartfield Wealth Management').fill('Test Firm');
    await page.getByPlaceholder('www.yourfirm.co.uk').fill('www.test.co.uk');
    await page.getByRole('button', { name: /National \/ Online/i }).click();
    await page.locator('select').selectOption({ label: 'General / all client types' });

    // Attempt submit without selecting any specialties
    // We need to intercept the API call to prevent actual submission
    await page.route('/api/score', route => route.abort());

    await page.getByRole('button', { name: /get my score/i }).click();

    // Should show specialty validation error
    await expect(page.getByText('Please select at least one specialty.')).toBeVisible();

    // Should still be on the form
    await expect(page.getByText('Free AI Visibility Score')).toBeVisible();
  });

  test('form validation shows error when location missing for local coverage', async ({ page }) => {
    // Fill required fields but leave location empty
    await page.getByPlaceholder('e.g. Hartfield Wealth Management').fill('Test Firm');
    await page.getByPlaceholder('www.yourfirm.co.uk').fill('www.test.co.uk');
    await page.getByRole('button', { name: /^Local/ }).click();
    // Don't fill location
    await page.getByRole('button', { name: 'Wealth Management' }).click();
    await page.locator('select').selectOption({ label: 'General / all client types' });

    await page.route('/api/score', route => route.abort());

    // Clear the location field (the required attribute on the HTML input
    // will prevent form submission via browser validation, so we need to
    // remove the required attribute to test the JS-level validation)
    const locationInput = page.getByPlaceholder('e.g. Guildford, Bath, Edinburgh');
    await locationInput.evaluate(el => el.removeAttribute('required'));
    await locationInput.fill('');

    await page.getByRole('button', { name: /get my score/i }).click();

    // Should show location validation error
    await expect(
      page.getByText('Please enter the city, cities, or region you serve.'),
    ).toBeVisible();
  });

  test('header has logo link and back to home link', async ({ page }) => {
    // Logo link
    const logoLink = page.getByRole('link', { name: /presenzia/i });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');

    // Back to home link
    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('description paragraph is visible', async ({ page }) => {
    await expect(
      page.getByText(/We test real AI search prompts across ChatGPT and Claude/),
    ).toBeVisible();
  });

  test('value reinforcement box is visible', async ({ page }) => {
    await expect(
      page.getByText(/The more detail you share/),
    ).toBeVisible();
  });
});

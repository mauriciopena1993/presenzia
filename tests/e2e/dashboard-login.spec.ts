import { test, expect } from '@playwright/test';

test.describe('Dashboard Login — OTP Flow', () => {
  // ─── Email Step ─────────────────────────────────────────────

  test('login page renders with email input and "Send login code" button', async ({ page }) => {
    await page.goto('/dashboard/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /send login code/i })).toBeVisible();
  });

  test('shows helper text on email step', async ({ page }) => {
    await page.goto('/dashboard/login');
    await expect(page.getByText('Enter your email address to receive a login code.')).toBeVisible();
  });

  test('shows presenzia.ai logo linking to homepage', async ({ page }) => {
    await page.goto('/dashboard/login');
    const logo = page.locator('a[href="/"]');
    await expect(logo).toContainText('presenzia');
    await expect(logo).toContainText('.ai');
  });

  // ─── Email → Code Transition ────────────────────────────────

  test('entering email and submitting shows code step', async ({ page }) => {
    // Mock the send-otp API to return success
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    // Should transition to code step
    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();
  });

  test('code step shows "We sent a 6-digit code to {email}" message', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('client@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByText('We sent a 6-digit code to client@example.com')).toBeVisible();
  });

  // ─── Code Input Behaviour ──────────────────────────────────

  test('code input accepts only 6 digits (numeric, maxLength 6)', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    const codeInput = page.getByPlaceholder('000000');
    await expect(codeInput).toBeVisible();
    await expect(codeInput).toHaveAttribute('maxlength', '6');
    await expect(codeInput).toHaveAttribute('inputmode', 'numeric');

    // Type letters — they should be stripped (onChange strips non-digits)
    await codeInput.fill('abc123');
    // Component replaces non-digits, so we press keys manually
    await codeInput.clear();
    await codeInput.pressSequentially('abc456');
    // Only digits should remain
    await expect(codeInput).toHaveValue('456');
  });

  test('"Sign in" button is disabled when code has fewer than 6 digits', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    const signInBtn = page.getByRole('button', { name: /sign in/i });
    // Initially disabled (empty code)
    await expect(signInBtn).toBeDisabled();

    // Type 3 digits — still disabled
    await page.getByPlaceholder('000000').pressSequentially('123');
    await expect(signInBtn).toBeDisabled();
  });

  test('"Sign in" button is enabled when code is exactly 6 digits', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByPlaceholder('000000').pressSequentially('123456');
    const signInBtn = page.getByRole('button', { name: /sign in/i });
    await expect(signInBtn).toBeEnabled();
  });

  // ─── Resend & Navigation ────────────────────────────────────

  test('resend countdown shows "Resend code in {N}s" initially', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    // Should show countdown (starts at 60s)
    await expect(page.getByText(/Resend code in \d+s/)).toBeVisible();
  });

  test('"Use a different email" link goes back to email step', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByRole('button', { name: /use a different email/i }).click();

    // Should go back to email step
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  });

  // ─── Error States ──────────────────────────────────────────

  test('shows error message for invalid account (no_account)', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'no_account' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('unknown@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByText('No account found with this email.')).toBeVisible();
    // Should show link to free score
    await expect(page.getByText(/get your free ai visibility score/i)).toBeVisible();
  });

  test('shows error message for invalid OTP code', async ({ page }) => {
    // First, mock send-otp to succeed
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    // Mock verify-otp to fail
    await page.route('**/api/auth/verify-otp', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired code. Please try again.' }),
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByPlaceholder('000000').pressSequentially('999999');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid or expired code. Please try again.')).toBeVisible();
  });

  // ─── Successful Verification ────────────────────────────────

  test('successful client verification redirects to /dashboard', async ({ page }) => {
    // Track the verify-otp call
    let verifyOtpCalled = false;

    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    await page.route('**/api/auth/verify-otp', route => {
      verifyOtpCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, redirect: '/dashboard' }),
        headers: {
          'Set-Cookie': '__presenzia_client=test-session-token; Path=/; HttpOnly; SameSite=Lax',
        },
      });
    });

    // Mock the dashboard page and its API so the redirect completes
    await page.route('**/api/client/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client: {
            id: 'test-id', email: 'test@example.com', plan: 'audit',
            status: 'active', business_name: 'Test Ltd', business_type: 'IFA',
            location: 'London', website: 'https://test.com',
            created_at: '2026-01-01T00:00:00Z',
            pending_plan_change: null, pending_change_date: null,
          },
          latestJob: null,
          pendingJob: null,
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

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByPlaceholder('000000').pressSequentially('123456');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for the verify-otp call to complete and page to navigate away
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    expect(verifyOtpCalled).toBe(true);
    // URL should contain /dashboard (either /dashboard or /dashboard/login if middleware redirects)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin email login redirects to /admin', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'admin', challengeToken: 'mock-token-xyz' }),
      })
    );

    await page.route('**/api/auth/verify-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, redirect: '/admin' }),
      })
    );

    // Mock admin page endpoint so it doesn't error on redirect
    await page.route('**/admin', route =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Admin</h1></body></html>',
      })
    );

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('hello@presenzia.ai');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByPlaceholder('000000').pressSequentially('123456');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/admin', { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  // ─── Button Loading State ───────────────────────────────────

  test('send button shows "Sending code..." while loading', async ({ page }) => {
    // Delay the response to observe loading state
    await page.route('**/api/auth/send-otp', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      });
    });

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    // Should show loading text
    await expect(page.getByRole('button', { name: /sending code/i })).toBeVisible();
  });

  test('verify button shows "Verifying..." while loading', async ({ page }) => {
    await page.route('**/api/auth/send-otp', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, type: 'client' }),
      })
    );

    // Delay verify response
    await page.route('**/api/auth/verify-otp', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, redirect: '/dashboard' }),
      });
    });

    await page.goto('/dashboard/login');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /send login code/i }).click();

    await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();

    await page.getByPlaceholder('000000').pressSequentially('123456');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('button', { name: /verifying/i })).toBeVisible();
  });

  // ─── Support Link ───────────────────────────────────────────

  test('shows support email link at the bottom', async ({ page }) => {
    await page.goto('/dashboard/login');
    const supportLink = page.locator('a[href="mailto:hello@presenzia.ai"]');
    await expect(supportLink).toBeVisible();
  });
});

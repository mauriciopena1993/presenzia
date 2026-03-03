# TESTING DIRECTIVE

> **Read this before every task. No exceptions.**

---

## GOLDEN RULE

**You are the QA team.** Never tell me to "test manually", "check in the browser", or "verify with real data." You build the test infrastructure, write the tests, run them, and fix every failure yourself. The only things I should verify are visual/design judgements. Everything else — data flow, billing, auth, emails, redirects, API responses, state management, webhooks — you test programmatically.

---

## PART 1: PRICING — SINGLE SOURCE OF TRUTH

All pricing must flow from ONE config source (env vars or a config file). Prices will change. **Never hardcode any price, plan name, or feature list anywhere — not in code, tests, emails, or UI.** Everything reads from config.

Write a test that:
1. Reads every price from config
2. Fetches the matching Stripe Price object via API
3. Asserts they match
4. Checks the pricing page and asserts displayed prices match config
5. Checks email templates and asserts prices match config
6. Checks the dashboard "Your Plan" section and asserts it matches config

If prices change, only the config changes. Everything else pulls from it automatically. The test proves it.

---

## PART 2: TEST ENVIRONMENT

Build this before any other work. If it doesn't exist yet, this is task #1.

### Test Database
- Separate test DB from dev/prod
- Seed it with test users covering every state the app supports (active on each plan, cancelled, past due, trialing, free, fresh signup, one-off purchase, etc.)
- Seed command: `npm run seed:test`
- Reset command: `npm run reset:test`
- Both idempotent and fast

### Stripe Test Mode
- Use Stripe test API keys (`sk_test_...`, `pk_test_...`)
- Create test fixtures matching config exactly
- Map test customers to seeded test users
- Use Stripe test cards: `4242424242424242` (success), `4000000000000341` (declined), `4000000000003220` (3DS), `4000000000009995` (insufficient funds)
- Automated test confirms every Stripe price ID in config exists and returns the expected amount

### Test Runner
- Single command: `npm test`
- Clear pass/fail with descriptive names
- No `.skip()`, no `xit()`, no commented-out tests
- 100% coverage on billing/webhook logic, 80%+ elsewhere

---

## PART 3: WHAT TO TEST

Test every user journey, state transition, and edge case that exists in the app. This means:

### Every purchase flow
- Each product/plan → checkout → payment succeeds → account state correct
- Payment fails → error shown → can retry → no orphaned account or ghost Stripe customer
- Browser closed mid-checkout → no charge, no broken state

### Every plan change
- Every upgrade path → Stripe updates → features change → proration correct
- Every downgrade path → features restricted at correct time → Stripe updated
- Monthly ↔ annual switch → correct price from config → Stripe reflects it
- Rapid changes (upgrade then downgrade in same session) → final state consistent

### Cancellation & reactivation
- Cancel → confirmation required → access retained until period end → Stripe cancelled
- Reactivate before period end → subscription resumes
- After period end → resubscribe as new
- Cancel twice → idempotent, no errors

### Billing & webhooks
- Successful renewal → account stays active → receipt email correct
- Failed payment → dunning email → grace period → card update → recovery
- Every webhook handler: idempotent, signature-verified, handles out-of-order delivery
- Unknown webhook types logged but don't crash

### Feature access
- Each plan level can only access what it should — test the API, not just the UI
- Cancelled/expired/past-due users see correct restricted state
- Restricted access returns proper error with upgrade messaging

### Audit/report delivery
- Audit triggers → processes → results stored → report generated → email sent → dashboard updated
- Audit fails mid-process → graceful error → user notified → retry available
- Concurrent audits for different users → no data bleed

### Emails
- Every transactional email sends with correct dynamic content from config (no hardcoded prices)
- All links point to production URLs, not localhost
- Correct from address, plain text fallback works

### Navigation
- Every CTA → correct destination
- Auth redirects work (logged out → login → return, logged in → dashboard)
- 404 page exists
- Mobile nav works

### Edge cases
- Double-click checkout → only one charge
- Two tabs, conflicting actions → consistent state
- Empty states (new user, no data) → no crashes
- Special characters in inputs → no XSS, no DB errors
- All forms validate client AND server
- Stripe unreachable → friendly error, no broken state

---

## PART 4: RULES

### Before writing code:
1. Read this document
2. Confirm test environment exists. If not, build it first.
3. Bug fixes: write a failing test that reproduces the bug BEFORE the fix
4. New features: write tests BEFORE or ALONGSIDE implementation

### Before marking a task done:
1. All new tests pass
2. All existing tests still pass
3. No skipped or commented-out tests
4. You ran the full suite and confirmed the output

### Never:
- ❌ "Please test this manually"
- ❌ "I need real Stripe data" — use test mode
- ❌ "I need to log in" — use seeded test users
- ❌ "The code looks correct" without running tests
- ❌ Skip tests for "simple" changes
- ❌ Delete a failing test instead of fixing the code
- ❌ Mock everything — use real Stripe test API and real test DB
- ❌ Hardcode any price or plan name anywhere

### Always:
- ✅ Prices and plan names from config
- ✅ Stripe test mode for payments
- ✅ Seeded test users for auth
- ✅ Happy path + at least 2 failure paths per feature
- ✅ Test state transitions
- ✅ Assert specific values, not just "didn't crash"
- ✅ Run full suite after every change

---

## PART 5: DEPLOYMENT CHECKLIST

Before saying "ready to launch", every item verified by a passing test:

- [ ] All prices on site match Stripe match config
- [ ] Every purchase flow works end-to-end
- [ ] Every plan change works
- [ ] Cancellation and reactivation work
- [ ] Failed payment recovery works
- [ ] All webhooks idempotent and signature-verified
- [ ] Every page loads without console errors
- [ ] Every link and CTA works
- [ ] Mobile responsive
- [ ] Auth works (login, logout, sessions, redirects)
- [ ] Empty and error states handled
- [ ] All emails correct with no hardcoded prices
- [ ] No test data or test keys in production
- [ ] All forms validate client and server
- [ ] Rate limiting on key endpoints
- [ ] HTTPS enforced
- [ ] Error tracking and uptime monitoring active

---

## ACTIVATION

Put this file at the project root as `TESTING-DIRECTIVE.md`.

Add to `CLAUDE.md`:

```
Always read and follow TESTING-DIRECTIVE.md before starting any task. Build the test infrastructure first if it doesn't exist.
```

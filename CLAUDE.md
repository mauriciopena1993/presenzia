# Presenzia.ai — Project Context

## What It Is
A B2B SaaS that audits how visible a local business is in AI search engines (ChatGPT, Claude, Perplexity, Google AI). Clients pay a subscription and get a scored report showing where they appear (or don't) when people ask AI chatbots for business recommendations.

## Tech Stack
- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Payments:** Stripe (subscription billing)
- **Database:** Supabase (configured, not yet wired up)
- **Email:** Resend
- **PDF Reports:** @react-pdf/renderer
- **Animations:** Framer Motion

## Project Structure
```
app/
  page.tsx              — Landing page (Navbar, Hero, HowItWorks, SampleReport, Pricing, Testimonials, Footer)
  api/
    audit/route.ts      — POST: runs audit, returns score + competitor data
    checkout/route.ts   — POST: creates Stripe checkout session
    webhook/route.ts    — POST: handles Stripe webhook events
  checkout/             — Checkout flow pages
  success/page.tsx      — Post-payment success page
components/             — All landing page sections (Navbar, Hero, HowItWorks, SampleReport, Pricing, Testimonials, Footer)
lib/
  stripe.ts             — Stripe client + PLANS config (Starter £149, Growth £299, Premium £599)
  audit/
    runner.ts           — Queries ChatGPT, Claude, Perplexity, Google AI with prompts; detects mentions + competitors
    scorer.ts           — Calculates 0-100 visibility score + A-F grade per platform and overall
    prompts.ts          — Builds prompt list from business type/location/keywords
  report/
    generate.tsx        — PDF report generation
```

## Pricing Plans
| Plan     | Price  | Cadence                        |
|----------|--------|--------------------------------|
| Starter  | £149   | Monthly audit                  |
| Growth   | £299   | Weekly audits + dashboard      |
| Premium  | £599   | Full service + strategy calls  |

## Env Vars Needed (.env.local)
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PREMIUM`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `PERPLEXITY_API_KEY` (optional, falls back to OpenAI)
- `GOOGLE_AI_API_KEY` (optional, falls back to OpenAI)
- Supabase vars (to be added)

## Env Vars to add to .env.local
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase dashboard → Settings → API
- `RESEND_API_KEY` — resend.com
- `INTERNAL_API_SECRET` — any random string: `openssl rand -hex 32`
- Run `scripts/setup-stripe.ts` to create Stripe products and get STRIPE_PRICE_* IDs

## Supabase Setup (one-time)
1. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor
2. Create a storage bucket named `reports` (Storage → New bucket, set to private)

## Current Status / What's Done
- [x] Landing page (fonts, CTAs, mobile nav all fixed)
- [x] Audit engine (4 AI platforms run concurrently, scores results)
- [x] Stripe checkout + fully implemented webhook (saves client, queues audit, handles renewals/cancellations)
- [x] PDF report generation (lib/report/generate.tsx)
- [x] Supabase schema: clients + audit_jobs tables
- [x] lib/supabase.ts — server-side service role client
- [x] /api/process-audit — background runner: runs audit, uploads PDF, emails via Resend
- [x] /api/report — PDF download endpoint
- [x] /api/verify-session — validates Stripe session_id on success page
- [x] /api/audit — protected with INTERNAL_API_SECRET
- [x] scripts/setup-stripe.ts — creates Stripe products + prices

## TODOs / What's Left
- [ ] Run Supabase migration in SQL editor
- [ ] Create Supabase 'reports' storage bucket
- [ ] Run setup-stripe.ts → add price IDs to .env.local
- [ ] Add missing env vars to .env.local (see above)
- [ ] Onboarding flow: after payment, collect business_name/business_type/location/keywords (webhook queues job but won't run audit until these are set)
- [ ] Client dashboard (/dashboard route + Supabase Auth)
- [ ] Privacy Policy + Terms of Service pages (required for UK GDPR)
- [ ] vercel.json: set maxDuration=300 for /api/process-audit (requires Vercel Pro)

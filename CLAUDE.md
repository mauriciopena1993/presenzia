# Presenzia.ai — Project Context

## What It Is
A B2B SaaS that audits how visible a local UK business is in AI search engines (ChatGPT, Claude, Perplexity, Google AI). Clients pay a monthly subscription and get a scored report showing where they appear (or don't) when people ask AI chatbots for business recommendations.

## Tech Stack
- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Inline styles (no Tailwind)
- **Payments:** Stripe (subscription billing, plan changes, cancellation schedules)
- **Database:** Supabase (PostgreSQL — clients, audit_jobs tables)
- **Email:** Resend
- **PDF Reports:** @react-pdf/renderer
- **AI Audit Engine:** OpenAI, Anthropic, Perplexity, Google AI (Gemini)
- **Hosting:** Vercel (auto-deploy from main)

## Project Structure
```
app/
  page.tsx                — Landing page (Navbar, Hero, HowItWorks, SampleReport, Pricing, Testimonials, FAQ, Footer)
  about/page.tsx          — About page
  blog/[slug]/page.tsx    — Blog post pages
  terms/page.tsx          — Terms of Service
  privacy/page.tsx        — Privacy Policy
  success/page.tsx        — Post-payment success page
  onboarding/page.tsx     — Business details collection after payment
  dashboard/
    page.tsx              — Client dashboard (reports, score trends, plan management, AI chat, cancellation flow)
    login/page.tsx        — Client login (OTP-based)
    rate/page.tsx         — Audit rating page
  admin/page.tsx          — Admin dashboard
  api/
    audit/route.ts        — POST: runs audit engine
    process-audit/route.ts — Background runner: runs audit, generates PDF, uploads, emails
    checkout/route.ts     — POST: creates Stripe checkout session
    webhook/route.ts      — POST: handles Stripe webhook events
    verify-session/       — Validates Stripe session_id
    chat/route.ts         — AI audit assistant (Growth/Premium)
    report/route.ts       — PDF download endpoint
    client/
      change-plan/route.ts — Plan upgrades/downgrades via Stripe
      cancel/route.ts      — Cancellation flow (confirm, retention offer, feedback)
      send-otp/route.ts    — Client OTP login
    auth/                  — Admin auth (OTP-based)
    admin/                 — Admin API routes
components/
  Navbar.tsx, Hero.tsx, HowItWorks.tsx, SampleReport.tsx,
  Pricing.tsx, Testimonials.tsx, FAQ.tsx, Footer.tsx,
  AmbientBackground.tsx (hidden on /dashboard routes)
lib/
  stripe.ts               — Stripe client + PLANS config
  supabase.ts             — Supabase service-role client + types
  client-auth.ts          — Client session/OTP helpers
  admin-auth.ts           — Admin session/OTP helpers
  blog-posts.ts           — Blog content data
  audit/
    runner.ts             — Queries 4 AI platforms concurrently
    scorer.ts             — Calculates 0-100 score + A-F grade
    prompts.ts            — Builds prompt list from business config
  report/
    generate.tsx          — PDF report generation (react-pdf)
    insights.ts           — AI-generated action plan insights
scripts/
  setup-stripe.ts         — One-time Stripe product/price creation
supabase/
  migrations/             — SQL migration files
```

## Pricing Plans
| Plan    | Price | What's included                                                                        |
|---------|-------|----------------------------------------------------------------------------------------|
| Starter | £99/mo  | Monthly AI visibility audit (4 platforms), PDF report by email                       |
| Growth  | £199/mo | Everything in Starter + online dashboard (weekly updates), AI assistant, competitor deep-dive, priority support |
| Premium | £599/mo | Everything in Growth + daily dashboard updates, dedicated account manager, monthly 1:1 strategy call, custom prompt testing & benchmarking |

**Key distinction:** All plans get a monthly audit. Growth/Premium additionally get dashboard updates at weekly/daily frequency.

## Env Vars (.env.local)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PREMIUM`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`
- `RESEND_API_KEY`
- `INTERNAL_API_SECRET`

## Supabase
- **Project ref:** yocrheqdmlgibwhyuyeq
- **Tables:** clients, audit_jobs
- **Storage bucket:** reports (private)
- **Migrations:** 001–005 all executed

## Vercel
- **Project:** mauriciopena1993-1720s-projects/presenzia
- **Auto-deploy:** pushes to `main` trigger production deployment

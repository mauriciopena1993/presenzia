# Presenzia.ai — Project Context

## What It Is
A B2B SaaS that audits how visible UK wealth managers and IFAs are in AI search engines (ChatGPT, Claude, Perplexity, Google AI). Clients get a scored report showing where they appear (or don't) when prospective clients ask AI chatbots for financial advisor recommendations.

## Tech Stack
- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Inline styles (no Tailwind)
- **Payments:** Stripe (one-off payments + subscription billing, plan changes, cancellation schedules)
- **Database:** Supabase (PostgreSQL — clients, audit_jobs, report_ratings, campaign_emails, free_scores tables)
- **Email:** Resend (transactional + campaign emails)
- **PDF Reports:** @react-pdf/renderer
- **AI Audit Engine:** OpenAI, Anthropic, Perplexity, Google AI (Gemini)
- **Hosting:** Vercel (auto-deploy from main)
- **Cron Jobs:** Vercel Cron (re-audits at 06:00 UTC, campaigns at 08:00 UTC)

## Project Structure
```
app/
  page.tsx                — Landing page (Navbar, Hero, HowItWorks, SampleReport, Testimonials, FAQ, Footer)
  about/page.tsx          — About page
  blog/page.tsx           — Blog listing page
  blog/[slug]/page.tsx    — Blog post pages (with dynamic OG images)
  pricing/page.tsx        — Dedicated pricing page (with Product schema)
  score/page.tsx          — Free AI visibility score tool (lead magnet)
  score/[id]/page.tsx     — Shareable score results page
  terms/page.tsx          — Terms of Service
  privacy/page.tsx        — Privacy Policy
  email-preferences/page.tsx — Email preferences management
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
    score/route.ts        — Free score API
    score/[id]/route.ts   — Get score by ID
    leads/route.ts        — Lead capture API
    email-preferences/route.ts — Email preference management API
    cron/
      reaudit/route.ts    — Daily cron: triggers scheduled re-audits (Growth=weekly, Premium=daily)
      campaigns/route.ts  — Daily cron: sends marketing email campaigns
    client/
      me/route.ts         — Client profile
      reports/route.ts    — Client reports list
      rate/route.ts       — Submit/get audit rating (flags dissatisfied customers)
      change-plan/route.ts — Plan upgrades/downgrades via Stripe
      cancel/route.ts     — Cancellation flow (confirm, retention offer, feedback)
      upgrade/route.ts    — Plan upgrade
      download/route.ts   — PDF download
      send-otp/route.ts   — Client OTP login
      verify-otp/route.ts — Client OTP verification
      chat/route.ts       — Client chat
      signout/route.ts    — Client signout
    auth/                  — Auth routes (OTP-based)
    admin/                 — Admin API routes
components/
  Navbar.tsx, Hero.tsx, HowItWorks.tsx, SampleReport.tsx,
  Pricing.tsx, Testimonials.tsx, FAQ.tsx, FAQAccordion.tsx, Footer.tsx,
  AmbientBackground.tsx (hidden on /dashboard routes)
lib/
  stripe.ts               — Stripe client + PLANS config
  supabase.ts             — Supabase service-role client + types
  client-auth.ts          — Client session/OTP helpers
  admin-auth.ts           — Admin session/OTP helpers
  blog-posts.ts           — Blog content data (3 posts)
  email/
    templates.ts          — 11 branded email templates (campaign + transactional)
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
| Plan    | Price        | What's included                                                                        |
|---------|-------------|----------------------------------------------------------------------------------------|
| Audit   | £297 one-off | One-off AI visibility audit (120+ prompts, 4 platforms), online dashboard + downloadable PDF report, personalised action plan |
| Growth  | £697/month   | Everything in Audit + weekly re-audits, weekly dashboard updates, AI audit assistant, competitor deep-dive, priority email support |
| Premium | £1,997/month | Everything in Growth + daily dashboard updates, dedicated account strategist, monthly 1-hour strategy calls, done-for-you content (4 articles/month), exclusive territory protection |

**Key distinction:** Audit is one-off. Growth/Premium are subscriptions with recurring re-audits. All tiers get the full online dashboard + PDF download.

## Dashboard Tier Logic
- **Audit:** InteractiveReport (4 tabs) + PDF download + upsell to Growth. No chat, no history, no trend graph.
- **Growth:** Full dashboard + Chat + History tab + Score trend graph ("Updated weekly") + Next audit date.
- **Premium:** Everything Growth has + purple accent (#9b6bcc) + "Updated daily" indicator + strategy call banner.

## Email Campaigns (via Vercel Cron at 08:00 UTC daily)
- Free Score nurture (3 emails over days)
- Post-audit rating request (48h after audit)
- Happy customer sequence (review → referral → social follow)
- Dissatisfied outreach (24h after 1-3★ rating, company voice, links to email preferences)
- Win-back (7 days + 30 days after cancellation)

## Customer Flagging
- 1-3★ rating: Sets `marketing_suppressed=true`, alerts admin, sends outreach 24h later
- 4-5★ rating: Clears `marketing_suppressed`, triggers review/referral/social sequence

## SEO Structure
- Sitemap: All public pages included with priorities
- Robots.txt: Disallows /api/, /dashboard, /admin, /onboarding, /success
- Structured data: Organization + WebSite (root), FAQPage (home), Product/Offer (pricing), BlogPosting (blog posts)
- All pages have: title, description, canonical URL, OpenGraph tags, Twitter cards
- Content flywheel: Blog → /score (free lead magnet) → /pricing → /onboarding

## Env Vars (.env.local)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_AUDIT`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PREMIUM`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`
- `RESEND_API_KEY`
- `INTERNAL_API_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_GA_ID` (Google Analytics 4)

## Supabase
- **Project ref:** yocrheqdmlgibwhyuyeq
- **Tables:** clients, audit_jobs, report_ratings, campaign_emails, free_scores
- **Storage bucket:** reports (private)

## Vercel
- **Project:** mauriciopena1993-1720s-projects/presenzia
- **Auto-deploy:** pushes to `main` trigger production deployment
- **Crons:** reaudit (06:00 UTC daily), campaigns (08:00 UTC daily)

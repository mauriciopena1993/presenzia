# Presenzia.ai — Master Backlog
> Last updated: 2026-03-03

---

## PHASE 2: Technical & Quality (COMPLETE)
- [x] Add Perplexity API key (`PERPLEXITY_API_KEY`) to Vercel — keys in `.env.local`, need manual Vercel dashboard addition
- [x] Add Google AI API key (`GOOGLE_AI_API_KEY`) to Vercel — keys in `.env.local`, need manual Vercel dashboard addition
- [x] Improve audit report depth and quality (richer analysis, better prompts)
  - Position-weighted scoring (pos 1-2: 100%, 3: 90%, 4-5: 70%, 6+: 40%)
  - Top-3 appearance tracking per platform and overall
  - 8 new prompts: ranking quality (4) + accreditation/trust signals (4)
  - System prompt for all AI platforms for more specific firm recommendations
  - Data-driven action prioritisation based on weakest platform/category
  - Richer summary generation with top-3 context and competitor data
  - Top-3 stat added to PDF report
- [x] End-to-end QA: 503 unit/integration tests + 124 E2E tests (desktop + mobile)
  - Enriched admin dashboard with per-platform score bars, score trends, ratings history
  - 5 new E2E test suites: login, audit dashboard, growth dashboard, premium dashboard, billing
- [x] Ensure all flows work smoothly on mobile
  - Replaced fixed padding with clamp() across Hero, HowItWorks, FAQ, Testimonials, Footer

## PHASE 3: Growth & Launch
- [ ] Pricing strategy review (Alex Hormozi "Money Models" approach)
- [ ] Drive traffic / launch marketing
- [ ] Analytics & conversion tracking

---

## COMPLETED
- [x] SPF DNS fix (include:amazonses.com for Resend deliverability)
- [x] Client login redirect fix (window.location.href)
- [x] Admin login redirect fix (window.location.href)
- [x] OTP system fix (30-min TTL, resend reuses same code)
- [x] Unified login page (/dashboard/login handles both admin + client)
- [x] Navbar copy: "Client login" → "Login"
- [x] Login page copy: "Portal access / Sign in" → "Login"
- [x] Remove ChatWidget from layout
- [x] Brand audit: full contrast, typography, and font-size audit across all pages
- [x] Fix landing page components (8 files): contrast #555→#999, fonts 0.7rem→0.75rem, copy polish
- [x] Fix static pages (blog, blog post, privacy, terms, about): contrast and font fixes
- [x] Fix login page: contrast #333→#888, #444→#999
- [x] Fix client dashboard: all section labels 0.6rem→0.75rem, 0.65rem→0.75rem, #555→#888
- [x] Fix admin dashboard: stat labels, table headers, badges — all contrast + font fixes
- [x] Revamp email templates: OTP footer/disclaimer readability, admin notification contrast
- [x] PDF report redesign: dark bg → white bg, warm cream surfaces, dark header stripe
- [x] SEO: dynamic favicon (icon.tsx), RSS feed (/feed.xml), feed auto-discovery link
- [x] Blog OG images (previous session)
- [x] Admin email notifications (previous session)
- [x] FAQ cleanup (previous session)
- [x] Dashboard PlatformBar color coding (previous session)
- [x] SEO canonical URLs, sitemap, robots.txt (previous session)
- [x] Email deliverability improvements (previous session)

---

## Brand Identity Reference
- **Primary BG**: Obsidian `#0A0A0A`
- **Card/Surface**: `#111111`
- **Border**: `#1A1A1A` / `#2A2A2A`
- **Accent Gold**: `#C9A84C`
- **Text Primary**: Cream `#F5F0E8`
- **Text Secondary**: minimum `#999` on dark, `#555` on white
- **Text Muted**: `#888` on dark
- **Heading Font**: Playfair Display (serif)
- **Body Font**: Inter (sans-serif)
- **Reports/Emails**: White background for readability
- **Min font size**: `0.75rem` (12px) everywhere

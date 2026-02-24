# Presenzia.ai — Master Backlog
> Last updated: 2026-02-24

---

## PHASE 1: Brand & Design Revamp (CURRENT)
- [ ] Brand audit: review all color, typography, contrast across the entire site
- [ ] Fix low-contrast grey text throughout (readable on obsidian #0A0A0A bg)
- [ ] Revamp landing page: copy, layout, CTA hierarchy, responsive polish
- [ ] Revamp email templates: OTP codes, admin notifications, report delivery
- [ ] Revamp PDF report: white background, professional layout, brand-consistent
- [ ] Revamp login page: styling and polish
- [ ] Revamp admin dashboard UI
- [ ] Revamp client dashboard UI (major improvements needed)
- [ ] SEO audit: meta tags, structured data, OG images, sitemap consistency

## PHASE 2: Technical & Quality
- [ ] Add Perplexity API key (`PERPLEXITY_API_KEY`) to Vercel
- [ ] Add Google AI API key (`GOOGLE_AI_API_KEY`) to Vercel
- [ ] Improve audit report depth and quality (richer analysis, better prompts)
- [ ] End-to-end QA: signup → payment → onboarding → audit → report → dashboard
- [ ] Ensure all flows work smoothly on mobile

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
- [x] PDF report redesign (previous session)
- [x] Blog OG images (previous session)
- [x] Admin email notifications (previous session)
- [x] FAQ cleanup (previous session)
- [x] Dashboard PlatformBar color coding (previous session)
- [x] SEO canonical URLs (previous session)
- [x] Email deliverability improvements (previous session)

---

## Brand Identity Reference
- **Primary BG**: Obsidian `#0A0A0A`
- **Card/Surface**: `#111111`
- **Border**: `#1A1A1A` / `#2A2A2A`
- **Accent Gold**: `#C9A84C`
- **Text Primary**: Cream `#F5F0E8`
- **Text Secondary**: should be minimum `#999` (currently many at `#555`/`#666` — too low contrast)
- **Heading Font**: Playfair Display (serif)
- **Body Font**: Inter (sans-serif)
- **Reports/Emails**: White background for readability

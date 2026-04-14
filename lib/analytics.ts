// Safe gtag wrapper — no-ops if GA4 not loaded (SSR, test env, ad blockers)
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

export const track = {
  // Free score tool
  freeScoreStart: () => trackEvent('free_score_start'),
  freeScoreSubmit: (businessType: string) =>
    trackEvent('free_score_submit', { business_type: businessType }),
  freeScoreEmailGate: (score: number) =>
    trackEvent('free_score_email_gate', { score }),
  freeScoreEmailSubmit: () => trackEvent('free_score_email_submit'),

  // CTAs
  ctaClick: (location: string, destination: string) =>
    trackEvent('cta_click', { location, destination }),

  // Pricing
  viewPricing: () => trackEvent('view_pricing'),
  checkoutStart: (plan: string, price: number) =>
    trackEvent('checkout_start', { plan, price }),

  // Purchase (fires on /success)
  purchase: (plan: string) => trackEvent('purchase', { plan }),

  // Content
  blogRead: (slug: string, title: string) =>
    trackEvent('blog_read', { slug, title }),

  // Navigation
  viewScore: (scoreId: string) =>
    trackEvent('view_score', { score_id: scoreId }),
};

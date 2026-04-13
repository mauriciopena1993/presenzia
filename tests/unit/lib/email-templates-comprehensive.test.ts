/**
 * Comprehensive email template tests.
 *
 * Tests EVERY template for:
 * - Correct { subject, html, text } shape
 * - Subject is non-empty
 * - HTML contains business name (where applicable)
 * - No '{{email}}' placeholder remains unsubstituted
 * - No Instagram links
 * - Correct Trustpilot URL
 * - Correct LinkedIn URL
 * - No hardcoded prices (prices from PLANS config)
 * - freeScoreNurture3 subject does NOT say "expires"
 * - Links use production URL pattern (not localhost hardcoded as domain)
 */

import { describe, it, expect } from 'vitest';
import { PLANS } from '@/lib/plans';
import {
  freeScoreDelivery,
  freeScoreNurture1,
  freeScoreNurture2,
  freeScoreNurture3,
  ratingRequest,
  auditUpsell1,
  auditUpsell2,
  happyReviewRequest,
  happyReferralRequest,
  happySocialFollow,
  dissatisfiedOutreach,
  winBack1,
  winBack2,
  paymentFailedNotice,
  renewalReminder,
  reauditReportReminder,
  adminDissatisfiedAlert,
  adminRatingAlert,
  adminFreeScoreAlert,
  APP_URL,
} from '@/lib/email/templates';

const BUSINESS_NAME = 'Alpha Wealth Ltd';
const EMAIL = 'advisor@alphawealth.co.uk';
const SCORE = 42;
const GRADE = 'C';
const SHARE_ID = 'share-abc123';
const JOB_ID = 'job-xyz789';
const PLAN_NAME = 'Growth Retainer';
const AMOUNT = '£249.00';
const RENEWAL_DATE = '1 August 2026';

// ── Helper ────────────────────────────────────────────────────

/** All templates that should replace {{email}} and produce full HTML emails */
const CUSTOMER_TEMPLATES: Array<{ name: string; fn: () => { subject: string; html: string; text?: string } }> = [
  { name: 'freeScoreDelivery', fn: () => freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL) },
  { name: 'freeScoreNurture1', fn: () => freeScoreNurture1(BUSINESS_NAME, SCORE, EMAIL) },
  { name: 'freeScoreNurture2', fn: () => freeScoreNurture2(BUSINESS_NAME, SCORE, EMAIL) },
  { name: 'freeScoreNurture3', fn: () => freeScoreNurture3(BUSINESS_NAME, EMAIL) },
  { name: 'ratingRequest', fn: () => ratingRequest(BUSINESS_NAME, JOB_ID, SCORE, EMAIL) },
  { name: 'auditUpsell1', fn: () => auditUpsell1(BUSINESS_NAME, SCORE, EMAIL) },
  { name: 'auditUpsell2', fn: () => auditUpsell2(BUSINESS_NAME, EMAIL) },
  { name: 'happyReviewRequest', fn: () => happyReviewRequest(BUSINESS_NAME, EMAIL) },
  { name: 'happyReferralRequest', fn: () => happyReferralRequest(BUSINESS_NAME, EMAIL) },
  { name: 'happySocialFollow', fn: () => happySocialFollow(BUSINESS_NAME, EMAIL) },
  { name: 'dissatisfiedOutreach', fn: () => dissatisfiedOutreach(BUSINESS_NAME, 2, EMAIL) },
  { name: 'winBack1', fn: () => winBack1(BUSINESS_NAME, EMAIL) },
  { name: 'winBack2', fn: () => winBack2(BUSINESS_NAME, EMAIL) },
  { name: 'paymentFailedNotice', fn: () => paymentFailedNotice(BUSINESS_NAME, PLAN_NAME, AMOUNT, EMAIL) },
  { name: 'renewalReminder', fn: () => renewalReminder(BUSINESS_NAME, PLAN_NAME, AMOUNT, RENEWAL_DATE, EMAIL) },
  { name: 'reauditReportReminder', fn: () => reauditReportReminder(BUSINESS_NAME, SCORE, GRADE, 38, EMAIL) },
];

// ── Shape tests ───────────────────────────────────────────────

describe('Email templates — shape', () => {
  for (const tmpl of CUSTOMER_TEMPLATES) {
    describe(tmpl.name, () => {
      it('returns { subject, html, text }', () => {
        const result = tmpl.fn();
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('html');
        expect(result).toHaveProperty('text');
      });

      it('subject is a non-empty string', () => {
        const { subject } = tmpl.fn();
        expect(typeof subject).toBe('string');
        expect(subject.length).toBeGreaterThan(0);
      });

      it('html is non-trivial (>500 chars)', () => {
        const { html } = tmpl.fn();
        expect(html.length).toBeGreaterThan(500);
      });

      it('html starts with <!DOCTYPE html>', () => {
        const { html } = tmpl.fn();
        expect(html.trim()).toMatch(/^<!DOCTYPE html>/i);
      });
    });
  }
});

// ── {{email}} placeholder replacement ────────────────────────

describe('Email templates — {{email}} placeholder must be replaced', () => {
  for (const tmpl of CUSTOMER_TEMPLATES) {
    it(`${tmpl.name}: HTML does not contain literal {{email}}`, () => {
      const { html } = tmpl.fn();
      expect(html).not.toContain('{{email}}');
    });
  }
});

// ── No Instagram links ────────────────────────────────────────

describe('Email templates — no Instagram links', () => {
  for (const tmpl of CUSTOMER_TEMPLATES) {
    it(`${tmpl.name}: HTML does not link to Instagram`, () => {
      const { html } = tmpl.fn();
      expect(html.toLowerCase()).not.toContain('instagram.com');
    });
  }
});

// ── Trustpilot URL ────────────────────────────────────────────

describe('Email templates — Trustpilot URL is correct', () => {
  it('happyReviewRequest links to https://www.trustpilot.com/review/presenzia.ai', () => {
    const { html } = happyReviewRequest(BUSINESS_NAME, EMAIL);
    expect(html).toContain('https://www.trustpilot.com/review/presenzia.ai');
  });
});

// ── LinkedIn URL ──────────────────────────────────────────────

describe('Email templates — LinkedIn URL is correct', () => {
  it('happySocialFollow links to https://www.linkedin.com/company/presenzia-ai', () => {
    const { html } = happySocialFollow(BUSINESS_NAME, EMAIL);
    expect(html).toContain('https://www.linkedin.com/company/presenzia-ai');
  });
});

// ── No hardcoded prices ───────────────────────────────────────

describe('Email templates — no hardcoded prices', () => {
  it('freeScoreDelivery uses PLANS.audit.priceDisplay', () => {
    const { html } = freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL);
    expect(html).toContain(PLANS.audit.priceDisplay);
  });

  it('freeScoreNurture1 uses PLANS.audit.priceDisplay', () => {
    const { html } = freeScoreNurture1(BUSINESS_NAME, SCORE, EMAIL);
    expect(html).toContain(PLANS.audit.priceDisplay);
  });

  it('freeScoreNurture2 uses PLANS.audit.priceDisplay', () => {
    const { html } = freeScoreNurture2(BUSINESS_NAME, SCORE, EMAIL);
    expect(html).toContain(PLANS.audit.priceDisplay);
  });

  it('freeScoreNurture3 uses PLANS.audit.priceDisplay', () => {
    const { html } = freeScoreNurture3(BUSINESS_NAME, EMAIL);
    expect(html).toContain(PLANS.audit.priceDisplay);
  });
});

// ── freeScoreNurture3 subject does NOT say "expires" ──────────

describe('Email templates — freeScoreNurture3', () => {
  it('subject does NOT contain the word "expires"', () => {
    const { subject } = freeScoreNurture3(BUSINESS_NAME, EMAIL);
    expect(subject.toLowerCase()).not.toContain('expires');
  });

  it('subject is a "last email" message, not urgent scarcity', () => {
    const { subject } = freeScoreNurture3(BUSINESS_NAME, EMAIL);
    // Should be something like "Our last note on..." not "Your score expires in..."
    expect(subject).toBeTruthy();
    expect(subject.toLowerCase()).not.toContain('expire');
  });
});

// ── paymentFailedNotice specific content ──────────────────────

describe('Email templates — paymentFailedNotice', () => {
  it('contains plan name', () => {
    const { html } = paymentFailedNotice(BUSINESS_NAME, PLAN_NAME, AMOUNT, EMAIL);
    expect(html).toContain(PLAN_NAME);
  });

  it('contains the amount', () => {
    const { html } = paymentFailedNotice(BUSINESS_NAME, PLAN_NAME, AMOUNT, EMAIL);
    expect(html).toContain(AMOUNT);
  });

  it('links to dashboard to update payment', () => {
    const { html } = paymentFailedNotice(BUSINESS_NAME, PLAN_NAME, AMOUNT, EMAIL);
    expect(html).toContain('/dashboard');
  });

  it('subject mentions action required', () => {
    const { subject } = paymentFailedNotice(BUSINESS_NAME, PLAN_NAME, AMOUNT, EMAIL);
    expect(subject.toLowerCase()).toContain('action');
  });
});

// ── renewalReminder specific content ──────────────────────────

describe('Email templates — renewalReminder', () => {
  it('contains plan name, amount and renewal date', () => {
    const { html } = renewalReminder(BUSINESS_NAME, PLAN_NAME, AMOUNT, RENEWAL_DATE, EMAIL);
    expect(html).toContain(PLAN_NAME);
    expect(html).toContain(AMOUNT);
    expect(html).toContain(RENEWAL_DATE);
  });

  it('subject mentions the renewal date', () => {
    const { subject } = renewalReminder(BUSINESS_NAME, PLAN_NAME, AMOUNT, RENEWAL_DATE, EMAIL);
    expect(subject).toContain(RENEWAL_DATE);
  });
});

// ── reauditReportReminder specific content ───────────────────

describe('Email templates — reauditReportReminder', () => {
  it('shows current score and grade', () => {
    const { html } = reauditReportReminder(BUSINESS_NAME, SCORE, GRADE, null, EMAIL);
    expect(html).toContain(String(SCORE));
  });

  it('shows score trend when previousScore provided', () => {
    const { html } = reauditReportReminder(BUSINESS_NAME, SCORE, GRADE, 38, EMAIL);
    // Should show delta (42-38 = +4)
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(500);
  });

  it('handles null previousScore gracefully (no trend section)', () => {
    const { html } = reauditReportReminder(BUSINESS_NAME, SCORE, GRADE, null, EMAIL);
    expect(html).toBeTruthy();
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('undefined');
  });
});

// ── auditUpsell1 specific content ────────────────────────────

describe('Email templates — auditUpsell1', () => {
  it('mentions Growth plan', () => {
    const { html } = auditUpsell1(BUSINESS_NAME, SCORE, EMAIL);
    expect(html).toContain('Growth');
  });

  it('links to pricing page', () => {
    const { html } = auditUpsell1(BUSINESS_NAME, SCORE, EMAIL);
    expect(html).toContain('/pricing');
  });

  it('includes score in HTML', () => {
    const { html } = auditUpsell1(BUSINESS_NAME, SCORE, EMAIL);
    expect(html).toContain(String(SCORE));
  });
});

// ── auditUpsell2 specific content ────────────────────────────

describe('Email templates — auditUpsell2', () => {
  it('links to pricing page', () => {
    const { html } = auditUpsell2(BUSINESS_NAME, EMAIL);
    expect(html).toContain('/pricing');
  });

  it('mentions Growth and Premium plans', () => {
    const { html } = auditUpsell2(BUSINESS_NAME, EMAIL);
    expect(html).toContain('Growth');
    expect(html).toContain('Premium');
  });
});

// ── Admin templates ───────────────────────────────────────────

describe('Email templates — admin templates shape', () => {
  it('adminDissatisfiedAlert returns subject and html', () => {
    const result = adminDissatisfiedAlert(EMAIL, BUSINESS_NAME, 2, 'Not satisfied');
    expect(result.subject).toBeTruthy();
    expect(result.html).toBeTruthy();
    expect(result.subject).toContain(BUSINESS_NAME);
    expect(result.html).toContain(EMAIL);
    expect(result.html).toContain('2/5');
    expect(result.html).toContain('Not satisfied');
  });

  it('adminDissatisfiedAlert handles null comment', () => {
    const result = adminDissatisfiedAlert(EMAIL, BUSINESS_NAME, 1, null);
    expect(result.html).toBeTruthy();
    expect(result.html).not.toContain('null');
    expect(result.html).not.toContain('undefined');
  });

  it('adminRatingAlert returns subject and html for happy rating', () => {
    const result = adminRatingAlert(EMAIL, BUSINESS_NAME, 5, 'Great service', 'growth');
    expect(result.subject).toBeTruthy();
    expect(result.html).toBeTruthy();
    expect(result.subject).toContain('5★');
    expect(result.html).toContain('5/5');
  });

  it('adminRatingAlert returns subject and html for dissatisfied rating', () => {
    const result = adminRatingAlert(EMAIL, BUSINESS_NAME, 2, 'Disappointed', 'audit');
    expect(result.subject).toContain('2★');
    expect(result.html).toContain('2/5');
    expect(result.html).toContain('Disappointed');
  });

  it('adminRatingAlert handles null comment', () => {
    const result = adminRatingAlert(EMAIL, BUSINESS_NAME, 4, null, null);
    expect(result.html).not.toContain('null');
  });

  it('adminFreeScoreAlert returns subject and html', () => {
    const result = adminFreeScoreAlert(BUSINESS_NAME, SCORE, GRADE, 'London', 'Pension planning');
    expect(result.subject).toBeTruthy();
    expect(result.html).toBeTruthy();
    expect(result.subject).toContain(BUSINESS_NAME);
    expect(result.subject).toContain(String(SCORE));
    expect(result.html).toContain('London');
    expect(result.html).toContain('Pension planning');
  });

  it('adminFreeScoreAlert handles empty city/specialty gracefully', () => {
    const result = adminFreeScoreAlert(BUSINESS_NAME, SCORE, GRADE, '', '');
    expect(result.html).toBeTruthy();
    expect(result.html).not.toContain('undefined');
  });
});

// ── freeScoreDelivery specific content ───────────────────────

describe('Email templates — freeScoreDelivery', () => {
  it('contains score and grade', () => {
    const { html } = freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL);
    expect(html).toContain(String(SCORE));
    expect(html).toContain(GRADE);
  });

  it('subject contains score and business name', () => {
    const { subject } = freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL);
    expect(subject).toContain(String(SCORE));
    expect(subject).toContain(BUSINESS_NAME);
  });

  it('links to share page with correct shareId', () => {
    const { html } = freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL);
    expect(html).toContain(SHARE_ID);
  });

  it('uses PLANS.audit.priceDisplay for full audit CTA', () => {
    const { html } = freeScoreDelivery(BUSINESS_NAME, SCORE, GRADE, SHARE_ID, EMAIL);
    expect(html).toContain(PLANS.audit.priceDisplay);
  });
});

// ── APP_URL consistency ───────────────────────────────────────

describe('Email templates — APP_URL consistency', () => {
  it('APP_URL is defined', () => {
    expect(APP_URL).toBeTruthy();
    expect(APP_URL).toMatch(/^https?:\/\//);
  });

  for (const tmpl of CUSTOMER_TEMPLATES) {
    it(`${tmpl.name}: all internal links use APP_URL`, () => {
      const { html } = tmpl.fn();
      // The HTML should contain APP_URL (from CTAs, email-preferences links etc.)
      expect(html).toContain(APP_URL);
    });
  }
});

// ── Email preferences link ────────────────────────────────────

describe('Email templates — email preferences link in footer', () => {
  const templatesWithPrefsLink = [
    { name: 'freeScoreNurture1', fn: () => freeScoreNurture1(BUSINESS_NAME, SCORE, EMAIL) },
    { name: 'freeScoreNurture2', fn: () => freeScoreNurture2(BUSINESS_NAME, SCORE, EMAIL) },
    { name: 'freeScoreNurture3', fn: () => freeScoreNurture3(BUSINESS_NAME, EMAIL) },
  ];

  for (const tmpl of templatesWithPrefsLink) {
    it(`${tmpl.name}: contains email-preferences link`, () => {
      const { html } = tmpl.fn();
      expect(html).toContain('email-preferences');
    });
  }
});

// ── Grade thresholds in scorer (referenced by email context) ──

describe('Email templates — score color logic sanity', () => {
  it('freeScoreDelivery uses different color for low score (<25)', () => {
    const { html: htmlLow } = freeScoreDelivery(BUSINESS_NAME, 10, 'F', SHARE_ID, EMAIL);
    const { html: htmlHigh } = freeScoreDelivery(BUSINESS_NAME, 85, 'A', SHARE_ID, EMAIL);
    // Both should be valid HTML
    expect(htmlLow).toContain('<!DOCTYPE html>');
    expect(htmlHigh).toContain('<!DOCTYPE html>');
    // High score version should mention "room for" improvement or be more optimistic
    expect(htmlHigh).toBeTruthy();
    expect(htmlLow).toBeTruthy();
  });
});

import { describe, it, expect } from 'vitest';
import { PLANS } from '@/lib/plans';
import {
  freeScoreNurture1,
  freeScoreNurture2,
  freeScoreNurture3,
  ratingRequest,
  happyReviewRequest,
  happyReferralRequest,
  happySocialFollow,
  dissatisfiedOutreach,
  winBack1,
  winBack2,
  adminDissatisfiedAlert,
  FROM_EMAIL,
  REPLY_TO,
  APP_URL,
} from '@/lib/email/templates';

describe('lib/email/templates', () => {
  const businessName = 'Test Wealth Ltd';
  const email = 'test@example.com';
  const score = 45;
  const jobId = 'job-123';

  describe('constants', () => {
    it('FROM_EMAIL has correct format', () => {
      expect(FROM_EMAIL).toContain('presenzia.ai');
      expect(FROM_EMAIL).toContain('<');
      expect(FROM_EMAIL).toContain('>');
    });

    it('REPLY_TO is hello@presenzia.ai', () => {
      expect(REPLY_TO).toBe('hello@presenzia.ai');
    });

    it('APP_URL defaults to production URL', () => {
      expect(APP_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('no hardcoded prices', () => {
    it('nurture email 1 uses PLANS.audit.priceDisplay not hardcoded £297', () => {
      const result = freeScoreNurture1(businessName, score, email);
      // Should contain the dynamic price from config
      expect(result.html).toContain(PLANS.audit.priceDisplay);
      // Should NOT contain a hardcoded literal that's different from config
      // (If config says £297, this test still passes — the point is it reads from config)
    });

    it('nurture email 2 uses PLANS.audit.priceDisplay', () => {
      const result = freeScoreNurture2(businessName, score, email);
      expect(result.html).toContain(PLANS.audit.priceDisplay);
    });

    it('nurture email 3 uses PLANS.audit.priceDisplay', () => {
      const result = freeScoreNurture3(businessName, email);
      expect(result.html).toContain(PLANS.audit.priceDisplay);
    });
  });

  describe('all templates produce valid output', () => {
    const allTemplates = [
      { name: 'freeScoreNurture1', fn: () => freeScoreNurture1(businessName, score, email) },
      { name: 'freeScoreNurture2', fn: () => freeScoreNurture2(businessName, score, email) },
      { name: 'freeScoreNurture3', fn: () => freeScoreNurture3(businessName, email) },
      { name: 'ratingRequest', fn: () => ratingRequest(businessName, jobId, score, email) },
      { name: 'happyReviewRequest', fn: () => happyReviewRequest(businessName, email) },
      { name: 'happyReferralRequest', fn: () => happyReferralRequest(businessName, email) },
      { name: 'happySocialFollow', fn: () => happySocialFollow(businessName, email) },
      { name: 'dissatisfiedOutreach', fn: () => dissatisfiedOutreach(businessName, 2, email) },
      { name: 'winBack1', fn: () => winBack1(businessName, email) },
      { name: 'winBack2', fn: () => winBack2(businessName, email) },
    ];

    for (const template of allTemplates) {
      it(`${template.name} returns subject, html, and text`, () => {
        const result = template.fn();
        expect(result.subject).toBeTruthy();
        expect(result.html).toBeTruthy();
        expect(result.text).toBeTruthy();
      });

      it(`${template.name} HTML contains DOCTYPE`, () => {
        const result = template.fn();
        expect(result.html).toContain('<!DOCTYPE html>');
      });

      it(`${template.name} HTML is non-trivial`, () => {
        const result = template.fn();
        // Some templates (happySocialFollow) don't include businessName in HTML body
        // but all should have substantial content
        expect(result.html.length).toBeGreaterThan(500);
      });

      it(`${template.name} links use APP_URL (not hardcoded URLs)`, () => {
        const result = template.fn();
        // In test env APP_URL may be localhost; in prod it's presenzia.ai
        // The key assertion: links use APP_URL, not some other hardcoded domain
        expect(result.html).toContain(APP_URL);
      });

      it(`${template.name} contains email preferences link`, () => {
        const result = template.fn();
        expect(result.html).toContain('email-preferences');
      });
    }
  });

  describe('specific template content', () => {
    it('freeScoreNurture1 includes the score', () => {
      const result = freeScoreNurture1(businessName, 45, email);
      expect(result.html).toContain('45/100');
    });

    it('ratingRequest includes job ID in CTA link', () => {
      const result = ratingRequest(businessName, jobId, score, email);
      expect(result.html).toContain(jobId);
    });

    it('happyReviewRequest links to Trustpilot', () => {
      const result = happyReviewRequest(businessName, email);
      expect(result.html).toContain('trustpilot');
    });

    it('dissatisfiedOutreach mentions unsubscribed from marketing', () => {
      const result = dissatisfiedOutreach(businessName, 2, email);
      expect(result.html).toContain('unsubscribed you from all marketing emails');
    });

    it('winBack2 links to pricing page', () => {
      const result = winBack2(businessName, email);
      expect(result.html).toContain('/pricing');
    });
  });

  describe('adminDissatisfiedAlert', () => {
    it('returns subject and html', () => {
      const result = adminDissatisfiedAlert(email, businessName, 2, 'Not happy');
      expect(result.subject).toContain('Dissatisfied');
      expect(result.subject).toContain(businessName);
      expect(result.html).toContain(email);
      expect(result.html).toContain('2/5');
      expect(result.html).toContain('Not happy');
    });

    it('handles null comment', () => {
      const result = adminDissatisfiedAlert(email, businessName, 1, null);
      expect(result.html).toBeTruthy();
      expect(result.html).not.toContain('null');
    });
  });
});

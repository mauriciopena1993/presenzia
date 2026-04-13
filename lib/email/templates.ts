/**
 * Shared email template system for presenzia.ai
 *
 * All marketing and transactional emails use this branded wrapper.
 * Dark-mode-safe HTML email templates with the presenzia gold accent.
 */

import { PLANS } from '@/lib/plans';

const FROM_EMAIL = 'presenzia.ai <reports@presenzia.ai>';
const REPLY_TO = 'hello@presenzia.ai';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://presenzia.ai';

export { FROM_EMAIL, REPLY_TO, APP_URL };

function emailWrapper(content: string, options?: { accentColor?: string; preheader?: string }) {
  const accent = options?.accentColor || '#C9A84C';
  const preheader = options?.preheader
    ? `<span style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${options.preheader}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
${preheader}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:560px;width:100%;">
  <tr><td style="padding:28px 32px;border-bottom:2px solid ${accent};">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:${accent};">.ai</span></span>
  </td></tr>
  <tr><td style="padding:32px;">
    ${content}
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai &middot; Ketzal LTD (Co. No. 14570156) &middot; <a href="mailto:hello@presenzia.ai" style="color:${accent};text-decoration:none;">hello@presenzia.ai</a></p>
    <p style="font-size:11px;color:#BBBBBB;margin:4px 0 0;">You received this because you used presenzia.ai. <a href="${APP_URL}/email-preferences?email={{email}}" style="color:#999999;text-decoration:underline;">Manage email preferences</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function ctaButton(text: string, url: string, color = '#0A0A0A', textColor = '#C9A84C') {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="background:${color};padding:12px 24px;">
      <a href="${url}" style="color:${textColor};text-decoration:none;font-size:13px;font-weight:700;">${text}</a>
    </td></tr>
  </table>`;
}

// ════════════════════════════════════════════════════════════════════════
// TRANSACTIONAL: Immediate Score Delivery (sent on email gate submission)
// ════════════════════════════════════════════════════════════════════════

export function freeScoreDelivery(firmName: string, score: number, grade: string, shareId: string, email: string) {
  const scoreColor = score >= 70 ? '#4a9e6a' : score >= 45 ? '#C9A84C' : score >= 25 ? '#cc8833' : '#cc4444';
  const resultsUrl = `${APP_URL}/score/${shareId}`;

  const subject = `Your AI visibility score: ${score}/100 — ${firmName}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your AI visibility score is ready</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 20px;line-height:1.7;">Here are the results for <strong style="color:#111;">${firmName}</strong>:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;border:1px solid #E0E0E0;margin:0 0 20px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;font-weight:700;color:${scoreColor};line-height:1;font-family:Arial,sans-serif;">${score}</div>
        <div style="font-size:13px;color:#888888;margin:6px 0 0;">out of 100 · Grade ${grade}</div>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">This score reflects how often ${firmName} appears when potential clients ask AI assistants like ChatGPT, Claude, and Perplexity to recommend a financial adviser.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">${score >= 50 ? 'You have some AI visibility, but there is room for significant improvement. Your competitors may be appearing more often.' : 'Your firm is largely invisible to AI search. When clients ask AI for a recommendation, your competitors are being suggested instead.'}</p>

    ${ctaButton('View your full results →', resultsUrl)}

    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;"><strong style="color:#111;">Want the full picture?</strong> Our comprehensive audit tests <strong>120+ wealth-specific prompts</strong> across 4 AI platforms and gives you a step-by-step action plan.</p>

    ${ctaButton(`Get your full AI audit for ${PLANS.audit.priceDisplay} →`, `${APP_URL}/score?plan=audit`)}

    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Questions? Reply to this email — we read every one.</p>
  `.replace('{{email}}', email), { preheader: `${firmName} scored ${score}/100 on AI visibility. See your full results.` });

  const text = `Your AI visibility score for ${firmName}: ${score}/100 (Grade ${grade}). View results: ${resultsUrl}`;

  return { subject, html, text };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 1: Free Score → Full Audit Nurture
// ════════════════════════════════════════════════════════════════════════

export function freeScoreNurture1(businessName: string, score: number, email: string) {
  const subject = `${businessName}, your AI visibility competitors are pulling ahead`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your competitors are gaining ground</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi there,</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Yesterday you checked ${businessName}'s AI visibility and scored <strong style="color:#111;">${score}/100</strong>.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Here's what that means: when a potential client asks ChatGPT, Claude, or Perplexity to recommend a financial adviser in your area, ${score >= 50 ? 'you appear sometimes, but your competitors appear more often.' : 'your competitors are being recommended instead of you.'}</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Our full audit tests <strong>120 wealth-specific prompts</strong> across 4 AI platforms, and gives you a step-by-step action plan to improve your ranking.</p>
    ${ctaButton(`Get your full AI audit for ${PLANS.audit.priceDisplay} →`, `${APP_URL}/score?plan=audit`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Results delivered in 15 minutes via your online dashboard and PDF.</p>
  `.replace('{{email}}', email), { preheader: `Your AI visibility score was ${score}/100. Here's what to do about it.` });

  return { subject, html, text: `${businessName} scored ${score}/100 on the free AI visibility check. Your competitors are appearing more often. Get the full audit at ${APP_URL}/score?plan=audit` };
}

export function freeScoreNurture2(businessName: string, score: number, email: string) {
  const subject = `The 3 things hurting ${businessName}'s AI visibility`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">3 reasons AI isn't recommending you</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">A few days ago you checked ${businessName}'s AI visibility. The most common reasons wealth managers score below 70:</p>
    <ol style="font-size:14px;color:#555555;margin:0 0 16px;padding-left:20px;line-height:1.8;">
      <li><strong>No structured online presence.</strong> AI models need clear, crawlable content to reference you.</li>
      <li><strong>Competitors have more mentions.</strong> They appear in directories, articles, and reviews that AI models train on.</li>
      <li><strong>Missing from niche queries.</strong> You may appear for broad terms but not the specific questions clients actually ask.</li>
    </ol>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Our full audit identifies exactly which of these apply to you, across 120 prompts on ChatGPT, Claude, Perplexity, and Google AI. You get a scored report with a personalised action plan.</p>
    ${ctaButton(`See what's holding you back for ${PLANS.audit.priceDisplay} →`, `${APP_URL}/score?plan=audit`)}
  `.replace('{{email}}', email), { preheader: 'The 3 most common reasons AI assistants recommend your competitors instead.' });

  return { subject, html, text: `3 reasons AI isn't recommending ${businessName}. Get the full audit at ${APP_URL}/score?plan=audit` };
}

export function freeScoreNurture3(businessName: string, email: string) {
  const subject = `Our last note on ${businessName}'s AI visibility`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">One last thought</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">This is the last email we'll send about your AI visibility check for ${businessName}.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">AI is changing how clients find financial advisers. The firms that act now will dominate these new referral channels. Those that wait will wonder where their leads went.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">The full audit takes 15 minutes to deliver and comes with a step-by-step plan you can action immediately.</p>
    ${ctaButton(`Get your audit now for ${PLANS.audit.priceDisplay} →`, `${APP_URL}/score?plan=audit`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Questions? Just reply to this email.</p>
  `.replace('{{email}}', email), { preheader: 'Last reminder about your AI visibility assessment.' });

  return { subject, html, text: `Last email: get the full AI audit for ${businessName} at ${APP_URL}/score?plan=audit` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 2: Post-Audit → Rating Request
// ════════════════════════════════════════════════════════════════════════

export function ratingRequest(businessName: string, jobId: string, score: number, email: string) {
  const subject = `How was your audit, ${businessName}?`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">We'd love your feedback</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Your AI visibility audit for ${businessName} scored <strong style="color:#111;">${score}/100</strong>. We hope you found it valuable.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Could you take 30 seconds to rate your experience? Your feedback helps us improve and helps other advisers decide if an audit is right for them.</p>
    ${ctaButton('Rate your audit →', `${APP_URL}/dashboard/rate?jobId=${jobId}`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">It takes less than a minute. Thank you!</p>
  `.replace('{{email}}', email), { preheader: 'Quick question about your AI visibility audit.' });

  return { subject, html, text: `Rate your audit experience at ${APP_URL}/dashboard/rate?jobId=${jobId}` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 2b: Audit → Growth/Premium Upsell (one-off audit customers)
// ════════════════════════════════════════════════════════════════════════

export function auditUpsell1(businessName: string, score: number, email: string) {
  const prefsUrl = `${APP_URL}/email-preferences?email=${encodeURIComponent(email)}`;
  const subject = `Your competitors' AI visibility could change this week, ${businessName}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">AI visibility shifts every week</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi ${businessName},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Your one-off audit scored <strong style="color:#111;">${score}/100</strong> — but AI platforms update their recommendations constantly. Your competitors could overtake you this week without you knowing.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">With our <strong style="color:#111;">Growth plan</strong>, you'd get:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr><td style="padding:10px 16px;border-left:3px solid #C9A84C;background:#FAFAF8;font-size:13px;color:#555;">Weekly automated re-audits — always know your score</td></tr>
      <tr><td style="padding:10px 16px;border-left:3px solid #C9A84C;background:#FAFAF8;font-size:13px;color:#555;border-top:1px solid #eee;">Competitor tracking — see who's gaining ground</td></tr>
      <tr><td style="padding:10px 16px;border-left:3px solid #C9A84C;background:#FAFAF8;font-size:13px;color:#555;border-top:1px solid #eee;">Updated action plans — specific recommendations each week</td></tr>
    </table>
    ${ctaButton('Explore Growth plan →', `${APP_URL}/pricing`)}
    <p style="font-size:12px;color:#999999;margin:24px 0 0;line-height:1.6;"><a href="${prefsUrl}" style="color:#C9A84C;text-decoration:none;">Email preferences</a></p>
  `.replace('{{email}}', email), { preheader: 'Your competitors could overtake you this week.' });

  return { subject, html, text: `AI visibility shifts every week. Your score was ${score}/100 — see how Growth monitoring keeps you ahead: ${APP_URL}/pricing` };
}

export function auditUpsell2(businessName: string, email: string) {
  const prefsUrl = `${APP_URL}/email-preferences?email=${encodeURIComponent(email)}`;
  const subject = `Final thought: weekly monitoring vs. guessing, ${businessName}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">One audit is good. Continuous monitoring is better.</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi ${businessName},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We see it all the time: firms run one audit, implement the recommendations, and then lose ground within weeks because they stop tracking.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">The firms winning in AI search are the ones who treat visibility like a metric — tracking it weekly, adjusting their strategy, and staying ahead.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Our Growth and Premium plans do the heavy lifting for you. We'd love to help you stay visible.</p>
    ${ctaButton('See monitoring plans →', `${APP_URL}/pricing`)}
    <p style="font-size:12px;color:#999999;margin:24px 0 0;line-height:1.6;"><a href="${prefsUrl}" style="color:#C9A84C;text-decoration:none;">Email preferences</a></p>
  `.replace('{{email}}', email), { preheader: 'The firms winning in AI search track visibility weekly.' });

  return { subject, html, text: `One audit is good. Continuous monitoring is better. See plans: ${APP_URL}/pricing` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 3: Happy Customer (4-5★) → Referral, Review, Social
// ════════════════════════════════════════════════════════════════════════

export function happyReviewRequest(businessName: string, email: string) {
  const subject = `Thank you! Could you share your experience?`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Thank you for the great rating!</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We're thrilled you found the audit valuable for ${businessName}. Ratings like yours keep us going.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Would you mind sharing a quick review on Trustpilot? It helps other wealth managers discover presenzia.ai, and it takes less than 2 minutes.</p>
    ${ctaButton('Leave a Trustpilot review →', 'https://www.trustpilot.com/review/presenzia.ai')}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Every review makes a real difference. Thank you!</p>
  `.replace('{{email}}', email), { preheader: 'Your review helps other advisers find us.' });

  return { subject, html, text: `Thank you for rating us! Leave a Trustpilot review at https://www.trustpilot.com/review/presenzia.ai` };
}

export function happyReferralRequest(businessName: string, email: string) {
  const subject = `Know another adviser who needs more AI visibility?`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Refer a colleague</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">You clearly understand the importance of AI visibility for ${businessName}. Do you know another wealth manager or IFA who could benefit from an AI audit?</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Simply forward this email to a colleague, or share our free score checker. They'll get a quick AI visibility assessment at no cost, and if they find it useful, they can go deeper with the full audit.</p>
    ${ctaButton('Share the free AI score checker →', `${APP_URL}/score`)}
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Word of mouth from trusted professionals like you is the best way to grow. Thank you for spreading the word.</p>
  `.replace('{{email}}', email), { preheader: 'Know another adviser who should check their AI visibility?' });

  return { subject, html, text: `Know another adviser? Share the free AI score checker: ${APP_URL}/score` };
}

export function happySocialFollow(businessName: string, email: string) {
  const subject = `Stay in the loop: AI visibility tips for wealth managers`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Follow us for AI visibility tips</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We regularly share insights on how AI is reshaping client acquisition for wealth managers, along with practical tips you can act on immediately.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Follow us on LinkedIn for the latest AI visibility insights and tips:</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:8px 16px 8px 0;"><a href="https://www.linkedin.com/company/presenzia-ai" style="color:#0A66C2;text-decoration:none;font-size:14px;font-weight:600;">Follow on LinkedIn →</a></td>
      </tr>
    </table>
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Thank you for being part of the presenzia.ai community.</p>
  `.replace('{{email}}', email), { preheader: 'Practical AI visibility tips for your firm.' });

  return { subject, html, text: `Follow presenzia.ai on LinkedIn for AI visibility tips: https://www.linkedin.com/company/presenzia-ai` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 4: Dissatisfied Customer (1-3★) → Personal Outreach
// ════════════════════════════════════════════════════════════════════════

export function dissatisfiedOutreach(businessName: string, rating: number, email: string) {
  const prefsUrl = `${APP_URL}/email-preferences?email=${encodeURIComponent(email)}`;
  const subject = `About your recent experience with presenzia.ai`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">We hear you, and we appreciate your honesty</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Thank you for taking the time to rate your audit for ${businessName}. Your feedback is important to us. It helps us understand where we fell short and how we can improve.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We are actively reviewing your feedback and working on making the experience better. If there is anything specific you would like us to address, or if you have any further thoughts, please reply to this email. We read every response and will get back to you promptly.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We also want to let you know that <strong>we have unsubscribed you from all marketing emails</strong>. We understand that our product may not be the right fit for everyone, and the last thing we want is to clutter your inbox.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">If you ever change your mind and would like to hear from us again, you can update your preferences at any time:</p>
    ${ctaButton('Manage email preferences →', prefsUrl)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Thank you again for your candid feedback. It genuinely helps us improve.</p>
    <p style="font-size:13px;color:#888888;margin:8px 0 0;line-height:1.6;">The presenzia.ai team</p>
  `.replace('{{email}}', email), { preheader: 'Thank you for your feedback. We are working on it.' });

  return { subject, html, text: `Thank you for your feedback on the audit for ${businessName}. We are reviewing it and have unsubscribed you from marketing emails. Manage your preferences: ${prefsUrl}` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 5: Win-back for Cancelled Clients
// ════════════════════════════════════════════════════════════════════════

export function winBack1(businessName: string, email: string) {
  const subject = `We miss you, ${businessName}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your AI visibility has been changing</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">It's been a week since you cancelled your presenzia.ai plan for ${businessName}. We respect your decision, but we wanted to let you know that AI recommendations for financial advisers are still changing rapidly.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Without regular monitoring, your competitors may be overtaking your position. A quick check could reveal opportunities you're missing.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">If you'd like to see where you stand, you can always run a free score check or resubscribe from your dashboard.</p>
    ${ctaButton('Check your score for free →', `${APP_URL}/score`)}
  `.replace('{{email}}', email), { preheader: 'Your AI visibility has been changing while you were away.' });

  return { subject, html, text: `It's been a week since you left. Check your AI visibility: ${APP_URL}/score` };
}

export function winBack2(businessName: string, email: string) {
  const subject = `A lot has changed in AI, ${businessName}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">AI visibility is evolving fast</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">It's been a month since you stopped monitoring ${businessName}'s AI visibility. A lot can change in 30 days: new AI models, updated training data, and shifting competitor landscapes.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Firms that track their AI presence regularly are consistently outperforming those that don't. The gap widens every month.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">We'd love to have you back. Your dashboard and historical data are still available. Simply resubscribe and pick up where you left off.</p>
    ${ctaButton('View plans and resubscribe →', `${APP_URL}/pricing`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Or run a free quick check first: <a href="${APP_URL}/score" style="color:#C9A84C;text-decoration:none;">presenzia.ai/score</a></p>
  `.replace('{{email}}', email), { preheader: 'AI recommendations have shifted in the past month.' });

  return { subject, html, text: `A lot has changed in AI. Resubscribe: ${APP_URL}/pricing` };
}

// ════════════════════════════════════════════════════════════════════════
// TRANSACTIONAL: Payment Failed Notification
// ════════════════════════════════════════════════════════════════════════

export function paymentFailedNotice(businessName: string, planName: string, amount: string, email: string) {
  const subject = `Action required: payment failed for your presenzia.ai subscription`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your payment didn't go through</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi${businessName ? ` ${businessName}` : ''},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">We were unable to process your ${amount} payment for your <strong style="color:#111;">${planName}</strong> subscription.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">This can happen if your card has expired, your bank declined the charge, or there were insufficient funds. Don't worry — we'll automatically retry in a few days.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 8px;line-height:1.7;"><strong style="color:#111;">To avoid any interruption to your service:</strong></p>
    <ul style="font-size:14px;color:#555555;margin:0 0 24px;padding-left:20px;line-height:1.8;">
      <li>Check that your card details are up to date</li>
      <li>Ensure sufficient funds are available</li>
      <li>Contact your bank if the issue persists</li>
    </ul>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Your dashboard and audit history remain accessible while we resolve this. If your payment isn't updated, your subscription may be paused.</p>
    ${ctaButton('Update payment details →', `${APP_URL}/dashboard`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Need help? Reply to this email or contact us at <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a>.</p>
  `.replace('{{email}}', email), { preheader: 'Your payment didn\'t go through. Please update your card details.' });

  return { subject, html, text: `Your ${amount} payment for ${planName} failed. Please update your payment details at ${APP_URL}/dashboard or contact hello@presenzia.ai for help.` };
}

// ════════════════════════════════════════════════════════════════════════
// CAMPAIGN 6: Renewal Reminder (7 days before billing)
// ════════════════════════════════════════════════════════════════════════

export function renewalReminder(businessName: string, planName: string, amount: string, renewalDate: string, email: string) {
  const subject = `Your presenzia.ai subscription renews on ${renewalDate}`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Subscription renewal reminder</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi${businessName ? ` ${businessName}` : ''},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Just a heads-up: your <strong style="color:#111;">${planName}</strong> subscription will automatically renew on <strong style="color:#111;">${renewalDate}</strong> for ${amount}.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">No action is needed if you'd like to continue. Your AI visibility monitoring, re-audits, and dashboard access will continue uninterrupted.</p>
    <div style="background:#F7F7F5;border:1px solid #E0E0E0;padding:16px 20px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="color:#888;padding:4px 0;width:120px;">Plan</td><td style="color:#111;font-weight:600;">${planName}</td></tr>
        <tr><td style="color:#888;padding:4px 0;">Amount</td><td style="color:#111;font-weight:600;">${amount}</td></tr>
        <tr><td style="color:#888;padding:4px 0;">Renewal date</td><td style="color:#111;font-weight:600;">${renewalDate}</td></tr>
      </table>
    </div>
    ${ctaButton('View your dashboard →', `${APP_URL}/dashboard`)}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Want to change or cancel your plan? Visit your <a href="${APP_URL}/dashboard" style="color:#C9A84C;text-decoration:none;">dashboard settings</a> or reply to this email.</p>
  `.replace('{{email}}', email), { preheader: `Your ${planName} subscription renews on ${renewalDate} for ${amount}.` });

  return { subject, html, text: `Your ${planName} subscription renews on ${renewalDate} for ${amount}. No action needed to continue. Manage your plan at ${APP_URL}/dashboard.` };
}

// ════════════════════════════════════════════════════════════════════════
// Admin notification for dissatisfied customer
// ════════════════════════════════════════════════════════════════════════

export function adminDissatisfiedAlert(clientEmail: string, businessName: string, rating: number, comment: string | null, plan: string | null = null) {
  const tierLabel = plan ? (plan.charAt(0).toUpperCase() + plan.slice(1)) : 'Unknown';
  const tierColor = plan === 'premium' ? '#9b6bcc' : plan === 'growth' ? '#5BA88C' : '#C9A84C';
  const subject = `⚠️ Dissatisfied client: ${businessName || clientEmail} (${rating}★) [${tierLabel}]`;
  const html = `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:40px;">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px;border-bottom:2px solid #cc4444;padding-bottom:12px;margin-bottom:24px;">
      presenzia<span style="color:#C9A84C;">.ai</span> <span style="color:#888;font-size:12px;font-weight:400;">Dissatisfied client alert</span>
    </div>
    <div style="background:#111;border:1px solid rgba(204,68,68,0.3);padding:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#999;font-size:12px;padding:6px 0;width:130px;">Client</td><td style="color:#F5F0E8;font-size:13px;">${businessName || '—'}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Email</td><td style="color:#F5F0E8;font-size:13px;">${clientEmail}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Plan</td><td style="font-size:13px;font-weight:600;color:${tierColor};">${tierLabel}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Rating</td><td style="color:#cc4444;font-size:13px;font-weight:600;">${rating}/5</td></tr>
        ${comment ? `<tr><td style="color:#999;font-size:12px;padding:6px 0;">Comment</td><td style="color:#F5F0E8;font-size:13px;">${comment}</td></tr>` : ''}
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Action</td><td style="color:#cc8833;font-size:13px;">Marketing suppressed. Personal outreach email sent.</td></tr>
      </table>
    </div>
    <p style="color:#888;font-size:12px;margin-top:16px;">Please follow up personally with this client within 24 hours.</p>
  </div>`;

  return { subject, html };
}

// ════════════════════════════════════════════════════════════════════════
// Admin notification for ALL ratings (happy included)
// ════════════════════════════════════════════════════════════════════════

export function adminRatingAlert(clientEmail: string, businessName: string, rating: number, comment: string | null, plan: string | null = null) {
  const tierLabel = plan ? (plan.charAt(0).toUpperCase() + plan.slice(1)) : 'Unknown';
  const tierColor = plan === 'premium' ? '#9b6bcc' : plan === 'growth' ? '#5BA88C' : '#C9A84C';
  const isHappy = rating >= 4;
  const emoji = isHappy ? '⭐' : '⚠️';
  const borderColor = isHappy ? '#4a9e6a' : '#cc4444';
  const ratingColor = isHappy ? '#4a9e6a' : '#cc4444';
  const label = isHappy ? 'Positive review' : 'Dissatisfied client alert';
  const subject = `${emoji} ${businessName || clientEmail} rated ${rating}★ [${tierLabel}]`;
  const html = `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:40px;">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px;border-bottom:2px solid ${borderColor};padding-bottom:12px;margin-bottom:24px;">
      presenzia<span style="color:#C9A84C;">.ai</span> <span style="color:#888;font-size:12px;font-weight:400;">${label}</span>
    </div>
    <div style="background:#111;border:1px solid rgba(${isHappy ? '74,158,106' : '204,68,68'},0.3);padding:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#999;font-size:12px;padding:6px 0;width:130px;">Client</td><td style="color:#F5F0E8;font-size:13px;">${businessName || '—'}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Email</td><td style="color:#F5F0E8;font-size:13px;">${clientEmail}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Plan</td><td style="font-size:13px;font-weight:600;color:${tierColor};">${tierLabel}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Rating</td><td style="color:${ratingColor};font-size:13px;font-weight:600;">${rating}/5</td></tr>
        ${comment ? `<tr><td style="color:#999;font-size:12px;padding:6px 0;">Comment</td><td style="color:#F5F0E8;font-size:13px;">${comment}</td></tr>` : ''}
        ${!isHappy ? `<tr><td style="color:#999;font-size:12px;padding:6px 0;">Action</td><td style="color:#cc8833;font-size:13px;">Marketing suppressed. Personal outreach email scheduled.</td></tr>` : ''}
      </table>
    </div>
    ${isHappy
      ? `<p style="color:#888;font-size:12px;margin-top:16px;">Great news! Consider reaching out to thank them and ask for a testimonial.</p>`
      : `<p style="color:#888;font-size:12px;margin-top:16px;">Please follow up personally with this client within 24 hours.</p>`
    }
  </div>`;

  return { subject, html };
}

// ════════════════════════════════════════════════════════════════════════
// Admin notification for free score completed
// ════════════════════════════════════════════════════════════════════════

export function adminFreeScoreAlert(firmName: string, score: number, grade: string, city: string, specialty: string) {
  const scoreColor = score >= 70 ? '#4a9e6a' : score >= 45 ? '#C9A84C' : score >= 25 ? '#cc8833' : '#cc4444';
  const subject = `🆓 New free score: ${firmName} — ${score}/100 (${grade})`;
  const html = `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:40px;">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px;border-bottom:2px solid #C9A84C;padding-bottom:12px;margin-bottom:24px;">
      presenzia<span style="color:#C9A84C;">.ai</span> <span style="color:#888;font-size:12px;font-weight:400;">New free score</span>
    </div>
    <div style="background:#111;border:1px solid rgba(201,168,76,0.3);padding:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#999;font-size:12px;padding:6px 0;width:130px;">Firm</td><td style="color:#F5F0E8;font-size:13px;font-weight:600;">${firmName}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Location</td><td style="color:#F5F0E8;font-size:13px;">${city || '—'}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Specialty</td><td style="color:#F5F0E8;font-size:13px;">${specialty || '—'}</td></tr>
        <tr><td style="color:#999;font-size:12px;padding:6px 0;">Score</td><td style="font-size:13px;font-weight:600;color:${scoreColor};">${score}/100 (Grade ${grade})</td></tr>
      </table>
    </div>
    <p style="color:#888;font-size:12px;margin-top:16px;">This lead has not yet provided an email. They may return to enter their details for the nurture sequence.</p>
  </div>`;

  return { subject, html };
}

// ════════════════════════════════════════════════════════════════════════
// Gentle reminder: new re-audit report is available (monthly digest)
// ════════════════════════════════════════════════════════════════════════

export function reauditReportReminder(businessName: string, score: number, grade: string, previousScore: number | null, email: string) {
  const scoreColor = score >= 70 ? '#4a9e6a' : score >= 45 ? '#C9A84C' : score >= 25 ? '#cc8833' : '#cc4444';
  const prefsUrl = `${APP_URL}/email-preferences?email=${encodeURIComponent(email)}`;

  let trendHtml = '';
  if (previousScore != null) {
    const delta = score - previousScore;
    const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    const trendColor = delta > 0 ? '#4a9e6a' : delta < 0 ? '#cc4444' : '#888888';
    const trendWord = delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'unchanged';
    trendHtml = `<p style="font-size:14px;color:${trendColor};margin:0 0 16px;line-height:1.7;font-weight:600;">${arrow} ${Math.abs(delta)} points ${trendWord} since your last report</p>`;
  }

  const subject = `Your latest AI visibility report is ready — ${score}/100`;
  const html = emailWrapper(`
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your new report is ready</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi${businessName ? ` ${businessName}` : ''},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 20px;line-height:1.7;">We've completed your latest AI visibility audit. Here's a quick snapshot:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;border:1px solid #E0E0E0;margin:0 0 20px;">
      <tr><td style="padding:20px;text-align:center;">
        <div style="font-size:42px;font-weight:700;color:${scoreColor};line-height:1;font-family:Arial,sans-serif;">${score}</div>
        <div style="font-size:12px;color:#888888;margin:4px 0 0;">/ 100 · Grade ${grade}</div>
      </td></tr>
    </table>

    ${trendHtml}

    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Log in to your dashboard to see the full breakdown, competitor analysis, and updated recommendations.</p>

    ${ctaButton('View your report →', `${APP_URL}/dashboard`)}

    <p style="font-size:12px;color:#999999;margin:24px 0 0;line-height:1.6;">You're receiving this because you're on an active monitoring plan. <a href="${prefsUrl}" style="color:#C9A84C;text-decoration:none;">Email preferences</a></p>
  `.replace('{{email}}', email), { preheader: `Your AI visibility score is ${score}/100. View your latest report.` });

  const text = `Your new AI visibility report is ready.\n\nScore: ${score}/100 (Grade ${grade})${previousScore != null ? `\nChange: ${score > previousScore ? '+' : ''}${score - previousScore} points` : ''}\n\nView your report: ${APP_URL}/dashboard\n\npresenzia.ai`;

  return { subject, html, text };
}

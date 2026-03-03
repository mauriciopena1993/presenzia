import { http, HttpResponse } from 'msw';

// ── Captured emails for test assertions ──
export const sentEmails: Array<{ to: string | string[]; subject: string; html: string }> = [];

export function clearSentEmails() {
  sentEmails.length = 0;
}

// ── AI fixture responses ──
// Some mention "Test Wealth Firm" to simulate being found, others don't

const CHATGPT_RESPONSE = `Here are some recommended wealth managers in London:

1. **St. James's Place** - One of the UK's largest wealth management firms
2. **Test Wealth Firm** - A well-regarded boutique wealth manager
3. **Brewin Dolphin** - Established investment management firm
4. **Rathbones** - Award-winning wealth management
5. **Quilter Cheviot** - Leading discretionary fund manager
6. **Charles Stanley** - Comprehensive wealth planning
7. **Schroders Personal Wealth** - Part of the Schroders group
8. **Tilney Smith & Williamson** - Full-service wealth management`;

const CLAUDE_RESPONSE = `I'd recommend considering these wealth management firms in London:

1. **St. James's Place** - Major UK wealth management network
2. **Brewin Dolphin** - Strong track record in investment management
3. **Quilter Cheviot** - Excellent discretionary management
4. **Rathbones** - Well-established wealth manager
5. **Charles Stanley** - Comprehensive financial planning
6. **Evelyn Partners** - Formerly Tilney Smith & Williamson`;

const PERPLEXITY_RESPONSE = `Based on my research, here are top wealth managers in London:

1. **Test Wealth Firm** - Highly rated on VouchedFor for personalised wealth management
2. **St. James's Place** - UK's largest wealth management firm
3. **Brewin Dolphin** - Over 200 years of investment management
4. **Rathbones** - Specialist wealth management
5. **Quilter Cheviot** - Part of Quilter Group`;

const GOOGLE_AI_RESPONSE = `Here are some of the best wealth management firms in London:

1. **St. James's Place** - Large UK wealth management network
2. **Brewin Dolphin** - Investment and wealth management
3. **Test Wealth Firm** - Specialist wealth management in London
4. **Rathbones** - Heritage wealth management
5. **Schroders Personal Wealth** - Backed by Schroders Group`;

export const handlers = [
  // ── OpenAI ChatGPT ──
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{ message: { content: CHATGPT_RESPONSE } }],
    });
  }),

  // ── Anthropic Claude ──
  http.post('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      content: [{ text: CLAUDE_RESPONSE }],
    });
  }),

  // ── Perplexity ──
  http.post('https://api.perplexity.ai/chat/completions', () => {
    return HttpResponse.json({
      choices: [{ message: { content: PERPLEXITY_RESPONSE } }],
    });
  }),

  // ── Google AI (Gemini) ──
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{ content: { parts: [{ text: GOOGLE_AI_RESPONSE }] } }],
    });
  }),

  // ── Resend (email delivery) ──
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    sentEmails.push({
      to: body.to as string | string[],
      subject: body.subject as string,
      html: body.html as string,
    });
    return HttpResponse.json({ id: `test-email-${Date.now()}` });
  }),

  // ── Postcodes.io ──
  http.get('https://api.postcodes.io/postcodes/:postcode', () => {
    return HttpResponse.json({
      status: 200,
      result: {
        postcode: 'SW1A 1AA',
        admin_district: 'Westminster',
        parliamentary_constituency: 'Cities of London and Westminster',
        region: 'London',
      },
    });
  }),
];

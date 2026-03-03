/**
 * Prompt templates for AI visibility auditing.
 * These are the exact prompts we test across ChatGPT, Claude, Perplexity, Google AI.
 *
 * The system builds SPECIFIC prompts for each firm using their description,
 * keywords/specialties, and firm type.
 *
 * Example: A "Chartered Financial Planner" specialising in "retirement planning
 * and pension transfers" in "Guildford" should generate prompts like:
 *   - "Best financial advisor in Guildford"
 *   - "Pension transfer specialist near Guildford"
 *   - "Who should I speak to about retirement planning in Guildford?"
 */

export interface PromptTemplate {
  id: string;
  category: 'recommendation' | 'comparison' | 'local' | 'service' | 'review';
  template: string;
  weight: number; // 1-10, higher = more important to ranking
}

/**
 * Derives a natural search term from the firm type.
 * "Independent Financial Advisor (IFA)" → "financial advisor"
 * "Chartered Financial Planner" → "financial planner"
 * "Wealth Management Firm" → "wealth manager"
 */
function deriveSearchTerm(firmType: string): string {
  const typeMap: Record<string, string> = {
    'independent financial advisor (ifa)': 'financial advisor',
    'chartered financial planner': 'financial planner',
    'wealth management firm': 'wealth manager',
    'discretionary fund manager': 'investment manager',
    'financial planning practice': 'financial planner',
    'multi-advisor ifa network': 'financial advisor',
    'restricted financial advisor': 'financial advisor',
    'retirement specialist': 'retirement advisor',
    'estate & inheritance planning': 'inheritance tax advisor',
    'corporate financial advisor': 'financial advisor',
  };

  const key = firmType.toLowerCase().trim();
  if (typeMap[key]) return typeMap[key];

  // Fallback: extract primary term
  const primary = firmType.split('/')[0].trim().toLowerCase();
  return primary.replace(/\(.*?\)/g, '').trim() || 'financial advisor';
}

export function buildPrompts(
  firmType: string,
  location: string,
  keywords: string[],
  description?: string
): Array<{ promptId: string; text: string; weight: number }> {
  const prompts: Array<{ promptId: string; text: string; weight: number }> = [];
  const seen = new Set<string>();

  const searchTerm = deriveSearchTerm(firmType);
  const loc = location || 'the UK';

  function add(id: string, text: string, weight: number) {
    const normalized = text.toLowerCase().trim();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    prompts.push({ promptId: id, text, weight });
  }

  // ── 1. CORE DISCOVERY PROMPTS (highest value) ──
  add('core_best',      `What is the best ${searchTerm} in ${loc}?`, 10);
  add('core_rec',       `Can you recommend a ${searchTerm} near ${loc}?`, 10);
  add('core_top',       `Who are the top-rated ${searchTerm}s in ${loc}?`, 9);
  add('core_suggest',   `I need a ${searchTerm} in ${loc}. Who should I use?`, 9);
  add('core_ifa',       `Can you recommend an independent financial advisor in ${loc}?`, 9);
  add('core_fa_best',   `Best financial advisor in ${loc}`, 10);
  add('core_planner',   `Recommend a financial planner near ${loc}`, 8);
  add('core_wealth',    `Best wealth management firm in ${loc}`, 8);

  // ── 2. KEYWORD/SPECIALTY PROMPTS (what clients actually search) ──
  for (let i = 0; i < Math.min(keywords.length, 5); i++) {
    const kw = keywords[i];
    add(`kw_rec_${i}`,   `What is the best ${kw} in ${loc}?`, 10);
    add(`kw_find_${i}`,  `Can you recommend a ${kw} near ${loc}?`, 9);
    add(`kw_need_${i}`,  `I need help with ${kw} in ${loc}. Who should I speak to?`, 9);
    add(`kw_spec_${i}`,  `${kw} specialist in ${loc}`, 8);

    if (i < 3) {
      add(`kw_trust_${i}`, `Most trusted ${kw} in ${loc}`, 7);
      add(`kw_top_${i}`,   `Top ${kw} firms in ${loc}`, 7);
    }
  }

  // ── 3. SERVICE-SPECIFIC PROMPTS (IFA-focused scenarios) ──
  add('svc_pension',    `Who should I speak to about pension transfers in ${loc}?`, 9);
  add('svc_iht',        `I need inheritance tax planning advice in ${loc}`, 8);
  add('svc_retire',     `Best retirement planning advisor in ${loc}`, 9);
  add('svc_invest',     `Where can I get investment advice in ${loc}?`, 8);
  add('svc_drawdown',   `Pension drawdown specialist near ${loc}`, 7);
  add('svc_hnw',        `Financial advisor for high-net-worth clients in ${loc}`, 8);
  add('svc_sipp',       `SIPP specialist in ${loc}`, 7);
  add('svc_db',         `Defined benefit pension transfer advisor in ${loc}`, 8);

  // ── 4. DESCRIPTION-BASED PROMPTS ──
  if (description && description.trim()) {
    const desc = description.trim();
    if (desc.length <= 80) {
      add('desc_rec',  `Recommend a ${desc} in ${loc}`, 9);
      add('desc_best', `Best ${desc} in ${loc}`, 8);
    }
    add('desc_find',   `I'm looking for a ${searchTerm} specialising in ${desc.substring(0, 60)} near ${loc}`, 8);
  }

  // ── 5. RANKING QUALITY PROMPTS (tests top-3 positioning) ──
  add('rank_top3',      `What are the top 3 ${searchTerm}s in ${loc}?`, 10);
  add('rank_no1',       `Who is the number one ${searchTerm} in ${loc}?`, 10);
  add('rank_top5_ifa',  `List the top 5 financial advisors in ${loc}`, 9);
  add('rank_must',      `If I could only speak to one ${searchTerm} in ${loc}, who should it be?`, 9);

  // ── 6. COMPARISON & ALTERNATIVE PROMPTS ──
  add('cmp_leading',    `Who are the leading financial advisory firms in ${loc}?`, 6);
  add('cmp_compare',    `Compare the best ${searchTerm}s in ${loc}`, 6);
  add('cmp_options',    `What are my options for financial advice in ${loc}?`, 6);
  add('cmp_vs_sj',      `Is St. James's Place the best option for financial advice in ${loc} or are there better alternatives?`, 7);

  // ── 7. LOCAL TRUST & REVIEW PROMPTS ──
  add('loc_find',       `Find me a ${searchTerm} in ${loc}`, 7);
  add('loc_local',      `Local ${searchTerm} recommendations in ${loc}`, 6);
  add('loc_highly',     `Highly recommended ${searchTerm} in ${loc}`, 7);
  add('rev_reviews',    `Which ${searchTerm} in ${loc} has the best client reviews?`, 6);
  add('rev_trusted',    `Most trusted financial advisor in ${loc}`, 7);
  add('rev_vouched',    `Best rated financial advisor on VouchedFor near ${loc}`, 6);

  // ── 8. ACCREDITATION & TRUST SIGNAL PROMPTS ──
  add('acc_chartered',  `Chartered financial planner in ${loc}`, 8);
  add('acc_fca',        `FCA regulated financial advisor in ${loc}`, 8);
  add('acc_vouched',    `Which financial advisors in ${loc} are listed on VouchedFor?`, 7);
  add('acc_unbiased',   `Financial advisor in ${loc} listed on Unbiased`, 7);

  // ── 9. SITUATIONAL PROMPTS ──
  add('sit_moving',     `I'm moving to ${loc} and need a financial advisor. Who do you recommend?`, 7);
  add('sit_lump',       `I've received a large inheritance and need financial advice in ${loc}`, 7);
  add('sit_business',   `Financial advisor for business owners in ${loc}`, 7);
  add('sit_couple',     `Best financial advisor for couples planning retirement in ${loc}`, 7);

  // ── 10. CROSS-KEYWORD COMBINATIONS ──
  if (keywords.length >= 2) {
    add('combo_1', `Best ${keywords[0]} and ${keywords[1]} advisor in ${loc}`, 7);
    add('combo_2', `${searchTerm} specialising in ${keywords[0]} and ${keywords[1]} in ${loc}`, 6);
  }

  // Sort by weight (highest first) and limit to 30 prompts per platform
  return prompts
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 30);
}

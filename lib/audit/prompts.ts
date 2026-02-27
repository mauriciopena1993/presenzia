/**
 * Prompt templates for AI visibility auditing.
 * These are the exact prompts we test across ChatGPT, Claude, Perplexity, Google AI.
 *
 * The system builds SPECIFIC prompts for each business using their description,
 * keywords, and business type — not generic category queries.
 *
 * Example: A "Family-run Italian restaurant specialising in homemade pasta" in
 * "Clapham" should generate prompts like:
 *   - "Best Italian restaurant in Clapham"
 *   - "Where can I get homemade pasta in Clapham?"
 *   - "Recommend a family restaurant in Clapham"
 * NOT:
 *   - "Best Restaurant / Cafe / Food & Drink in Clapham" (useless)
 */

export interface PromptTemplate {
  id: string;
  category: 'recommendation' | 'comparison' | 'local' | 'service' | 'review';
  template: string;
  weight: number; // 1-10, higher = more important to ranking
}

/**
 * Derives a short, natural search term from the business type dropdown.
 * "Solicitor / Law Firm" → "solicitor"
 * "Restaurant / Cafe" → "restaurant"
 * "Plumber / Electrician / Tradesperson" → "plumber"
 * Takes only the first option before the slash as the primary type.
 */
function deriveSearchTerm(businessType: string): string {
  const primary = businessType.split('/')[0].trim().toLowerCase();
  // Remove any parenthetical content
  return primary.replace(/\(.*?\)/g, '').trim();
}

/**
 * Extracts meaningful descriptors from the business description.
 * "Family-run Italian restaurant specialising in homemade pasta"
 * → ["Italian restaurant", "family-run", "homemade pasta"]
 */
function extractDescriptors(description: string, businessType: string): string[] {
  if (!description) return [];

  const desc = description.trim();
  const descriptors: string[] = [];

  // The full description itself is a great search phrase if short enough
  if (desc.length <= 60) {
    descriptors.push(desc.toLowerCase());
  }

  return descriptors;
}

export function buildPrompts(
  businessType: string,
  location: string,
  keywords: string[],
  description?: string
): Array<{ promptId: string; text: string; weight: number }> {
  const prompts: Array<{ promptId: string; text: string; weight: number }> = [];
  const seen = new Set<string>();

  const searchTerm = deriveSearchTerm(businessType);
  const loc = location || 'the UK';

  function add(id: string, text: string, weight: number) {
    const normalized = text.toLowerCase().trim();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    prompts.push({ promptId: id, text, weight });
  }

  // ── 1. KEYWORD-BASED PROMPTS (highest value — these are what customers actually search) ──
  // Keywords like "Italian restaurant", "homemade pasta", "private dining"
  for (let i = 0; i < Math.min(keywords.length, 5); i++) {
    const kw = keywords[i];
    add(`kw_rec_${i}`,  `What is the best ${kw} in ${loc}?`, 10);
    add(`kw_find_${i}`, `Recommend a good ${kw} near ${loc}`, 9);
    add(`kw_top_${i}`,  `Top rated ${kw} in ${loc}`, 8);

    if (i < 3) {
      add(`kw_trust_${i}`,  `Most trusted ${kw} in ${loc}`, 7);
      add(`kw_where_${i}`,  `Where can I find ${kw} in ${loc}?`, 7);
    }
  }

  // ── 2. DESCRIPTION-BASED PROMPTS (high value — uses their actual business description) ──
  if (description && description.trim()) {
    const desc = description.trim();
    // Use the description to build natural-sounding prompts
    add('desc_rec',    `Recommend a ${desc} in ${loc}`, 9);
    add('desc_find',   `Where can I find a ${desc} in ${loc}?`, 8);
    add('desc_best',   `Best ${desc} in ${loc}`, 9);
  }

  // ── 3. PRIMARY BUSINESS TYPE PROMPTS (good baseline) ──
  add('type_best',     `What is the best ${searchTerm} in ${loc}?`, 8);
  add('type_rec',      `Recommend a good ${searchTerm} near ${loc}`, 8);
  add('type_top',      `Who is the top ${searchTerm} in ${loc}?`, 7);
  add('type_suggest',  `Can you suggest a reliable ${searchTerm} in ${loc}?`, 7);
  add('type_need',     `I need a ${searchTerm} in ${loc}, who should I use?`, 7);

  // ── 4. COMPARISON & DISCOVERY PROMPTS ──
  add('cmp_leading',   `Who are the leading ${searchTerm}s in ${loc}?`, 6);
  add('cmp_compare',   `Compare the best ${searchTerm} options in ${loc}`, 6);
  add('cmp_options',   `What are my options for a ${searchTerm} in ${loc}?`, 5);

  // ── 5. LOCAL & TRUST PROMPTS ──
  add('loc_find',      `Find me a ${searchTerm} in ${loc}`, 7);
  add('loc_local',     `Local ${searchTerm} in ${loc} recommendations`, 6);
  add('loc_highly',    `Highly recommended ${searchTerm} in ${loc}`, 7);
  add('rev_reviews',   `Which ${searchTerm} in ${loc} has the best reviews?`, 6);
  add('rev_trusted',   `Most trusted ${searchTerm} in ${loc}`, 7);

  // ── 6. CROSS-KEYWORD COMBINATION PROMPTS (if multiple keywords) ──
  if (keywords.length >= 2) {
    // Combine first two keywords for more specific queries
    add('combo_1', `Best ${keywords[0]} and ${keywords[1]} in ${loc}`, 7);
    add('combo_2', `${keywords[0]} with ${keywords[1]} in ${loc}`, 6);
  }

  // Sort by weight (highest first) and limit to 20
  return prompts
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}

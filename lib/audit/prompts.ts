/**
 * Prompt templates for AI visibility auditing.
 * These are the exact prompts we test across ChatGPT, Claude, Perplexity, Google AI.
 */

export interface PromptTemplate {
  id: string;
  category: 'recommendation' | 'comparison' | 'local' | 'service' | 'review';
  template: string;
  weight: number; // 1-10, higher = more important to ranking
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Direct recommendation prompts (highest weight)
  {
    id: 'rec_1',
    category: 'recommendation',
    template: 'What is the best {businessType} in {location}?',
    weight: 10,
  },
  {
    id: 'rec_2',
    category: 'recommendation',
    template: 'Recommend a good {businessType} near {location}',
    weight: 10,
  },
  {
    id: 'rec_3',
    category: 'recommendation',
    template: 'Who is the top {businessType} in {location}?',
    weight: 9,
  },
  {
    id: 'rec_4',
    category: 'recommendation',
    template: 'Can you suggest a reliable {businessType} in {location}?',
    weight: 9,
  },
  {
    id: 'rec_5',
    category: 'recommendation',
    template: 'I need a {businessType} in {location}, who should I use?',
    weight: 8,
  },

  // Service-specific prompts
  {
    id: 'svc_1',
    category: 'service',
    template: 'Best {keyword} services in {location}',
    weight: 8,
  },
  {
    id: 'svc_2',
    category: 'service',
    template: 'Where can I find {keyword} in {location}?',
    weight: 7,
  },
  {
    id: 'svc_3',
    category: 'service',
    template: 'Top rated {keyword} providers in {location}',
    weight: 8,
  },
  {
    id: 'svc_4',
    category: 'service',
    template: 'Affordable {keyword} in {location}',
    weight: 6,
  },
  {
    id: 'svc_5',
    category: 'service',
    template: 'Professional {keyword} services near {location}',
    weight: 7,
  },

  // Comparison prompts
  {
    id: 'cmp_1',
    category: 'comparison',
    template: 'Who are the leading {businessType} companies in {location}?',
    weight: 7,
  },
  {
    id: 'cmp_2',
    category: 'comparison',
    template: 'Compare the best {businessType} options in {location}',
    weight: 6,
  },
  {
    id: 'cmp_3',
    category: 'comparison',
    template: 'What are my options for {businessType} in {location}?',
    weight: 6,
  },

  // Local/proximity prompts
  {
    id: 'loc_1',
    category: 'local',
    template: 'Find me a {businessType} in {location}',
    weight: 9,
  },
  {
    id: 'loc_2',
    category: 'local',
    template: 'Local {businessType} in {location} recommendations',
    weight: 7,
  },
  {
    id: 'loc_3',
    category: 'local',
    template: 'Highly recommended {businessType} in {location}',
    weight: 8,
  },

  // Review/trust prompts
  {
    id: 'rev_1',
    category: 'review',
    template: 'Which {businessType} in {location} has the best reviews?',
    weight: 7,
  },
  {
    id: 'rev_2',
    category: 'review',
    template: 'Most trusted {businessType} in {location}',
    weight: 8,
  },
  {
    id: 'rev_3',
    category: 'review',
    template: 'Well-known {businessType} in {location}',
    weight: 6,
  },
];

export function buildPrompts(
  businessType: string,
  location: string,
  keywords: string[]
): Array<{ promptId: string; text: string; weight: number }> {
  const prompts: Array<{ promptId: string; text: string; weight: number }> = [];

  for (const template of PROMPT_TEMPLATES) {
    // Build with businessType
    const text = template.template
      .replace('{businessType}', businessType)
      .replace('{location}', location)
      .replace('{keyword}', businessType);

    prompts.push({
      promptId: template.id,
      text,
      weight: template.weight,
    });

    // Also build keyword variations
    for (const keyword of keywords.slice(0, 3)) {
      if (template.category === 'service') {
        const kwText = template.template
          .replace('{businessType}', businessType)
          .replace('{location}', location)
          .replace('{keyword}', keyword);

        if (kwText !== text) {
          prompts.push({
            promptId: `${template.id}_kw_${keyword.replace(/\s+/g, '_')}`,
            text: kwText,
            weight: template.weight - 1,
          });
        }
      }
    }
  }

  return prompts;
}

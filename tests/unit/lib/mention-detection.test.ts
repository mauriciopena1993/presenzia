import { describe, it, expect } from 'vitest';

// ────────────────────────────────────────────────────────────────────────────
// These functions are defined in app/api/score/route.ts but are not exported.
// We replicate them here verbatim for unit testing. If the route is refactored
// to export them from a shared lib file, these tests should import from there.
// ────────────────────────────────────────────────────────────────────────────

function cleanFirmName(name: string): string {
  return name
    .replace(/\.(com|co\.uk|ai|org|net|io)$/i, '')
    .replace(/\b(ltd|limited|llp|plc|group|inc|corp)\b/gi, '')
    .replace(/\s+&\s+co\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDomainName(website: string): string {
  const domain = website
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
  return domain.replace(/\.(com|co\.uk|org\.uk|ai|org|net|io|uk)$/i, '').trim();
}

function getPosition(index: number, totalLength: number): 'first' | 'prominent' | 'mentioned' {
  const firstThird = totalLength / 3;
  if (index < firstThird) return 'first';
  if (index < firstThird * 2) return 'prominent';
  return 'mentioned';
}

function checkMention(
  response: string,
  firmName: string,
  website?: string,
): { mentioned: boolean; position: 'first' | 'prominent' | 'mentioned' | null } {
  const responseLower = response.toLowerCase();
  const cleaned = cleanFirmName(firmName).toLowerCase();

  // 1. Exact match on cleaned firm name
  if (cleaned && responseLower.includes(cleaned)) {
    const index = responseLower.indexOf(cleaned);
    return { mentioned: true, position: getPosition(index, response.length) };
  }

  // 2. Original firm name (in case cleaning removed too much)
  const firmLower = firmName.toLowerCase().trim();
  if (firmLower !== cleaned && responseLower.includes(firmLower)) {
    const index = responseLower.indexOf(firmLower);
    return { mentioned: true, position: getPosition(index, response.length) };
  }

  // 3. Word-boundary match for each significant word (>= 4 chars)
  const cleanedWords = cleaned.split(/\s+/).filter((w) => w.length >= 4);
  for (const word of cleanedWords) {
    try {
      const regex = new RegExp(
        `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'i',
      );
      const match = regex.exec(response);
      if (match) {
        return { mentioned: true, position: getPosition(match.index, response.length) };
      }
    } catch {
      /* skip */
    }
  }

  // 4. Partial match: 2+ significant words found
  if (cleanedWords.length >= 2) {
    const matchCount = cleanedWords.filter((w) => responseLower.includes(w)).length;
    if (matchCount >= 2) {
      return { mentioned: true, position: 'mentioned' };
    }
  }

  // 5. Domain name word-boundary match
  if (website) {
    const domainName = extractDomainName(website);
    if (domainName && domainName.length >= 3) {
      try {
        const regex = new RegExp(
          `\\b${domainName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
          'i',
        );
        const match = regex.exec(response);
        if (match) {
          return { mentioned: true, position: getPosition(match.index, response.length) };
        }
      } catch {
        if (responseLower.includes(domainName)) {
          return { mentioned: true, position: 'mentioned' };
        }
      }
    }

    // Full domain mention (e.g. "coutts.com")
    const fullDomain = website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
    if (fullDomain && responseLower.includes(fullDomain)) {
      return { mentioned: true, position: 'mentioned' };
    }
  }

  return { mentioned: false, position: null };
}

function extractCompetitors(response: string, firmName: string): string[] {
  const firmPattern =
    /(?:[A-Z][a-z]+(?:\s+(?:&\s+)?[A-Z][a-z]+)*)\s+(?:Financial|Wealth|Advisory|Planning|Advisors|Partners|Capital|Associates|Consulting|Management)/g;
  const found = new Set<string>();
  let match;
  while ((match = firmPattern.exec(response)) !== null) {
    const name = match[0].trim();
    if (
      name.toLowerCase() !== firmName.toLowerCase() &&
      name.length > 5 &&
      name.length < 100
    ) {
      found.add(name);
    }
  }
  const patterns = [/\d+\.\s+\*\*(.+?)\*\*/g, /\*\*([A-Z][^*]{3,60})\*\*/g];
  for (const pattern of patterns) {
    while ((match = pattern.exec(response)) !== null) {
      const name = match[1].trim();
      if (
        name.toLowerCase() !== firmName.toLowerCase() &&
        name.length > 3 &&
        name.length < 80 &&
        !name.includes('http')
      ) {
        found.add(name);
      }
    }
  }
  return Array.from(found).slice(0, 10);
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('cleanFirmName', () => {
  it('strips .com suffix', () => {
    expect(cleanFirmName('TestFirm.com')).toBe('TestFirm');
  });

  it('strips .co.uk suffix', () => {
    expect(cleanFirmName('TestFirm.co.uk')).toBe('TestFirm');
  });

  it('strips .ai suffix', () => {
    expect(cleanFirmName('TestFirm.ai')).toBe('TestFirm');
  });

  it('strips .org suffix', () => {
    expect(cleanFirmName('TestFirm.org')).toBe('TestFirm');
  });

  it('strips .net suffix', () => {
    expect(cleanFirmName('TestFirm.net')).toBe('TestFirm');
  });

  it('strips .io suffix', () => {
    expect(cleanFirmName('TestFirm.io')).toBe('TestFirm');
  });

  it('strips Ltd', () => {
    expect(cleanFirmName('Acme Wealth Ltd')).toBe('Acme Wealth');
  });

  it('strips Limited', () => {
    expect(cleanFirmName('Acme Wealth Limited')).toBe('Acme Wealth');
  });

  it('strips LLP', () => {
    expect(cleanFirmName('Smith & Jones LLP')).toBe('Smith & Jones');
  });

  it('strips PLC', () => {
    // Note: "Corp" is also in the strip list, so "Big Corp PLC" -> "Big"
    expect(cleanFirmName('Big Corp PLC')).toBe('Big');
    // Use a name without "Corp" to test PLC stripping in isolation
    expect(cleanFirmName('Barclays PLC')).toBe('Barclays');
  });

  it('strips Group', () => {
    expect(cleanFirmName('Acme Group')).toBe('Acme');
  });

  it('strips Inc', () => {
    expect(cleanFirmName('Acme Inc')).toBe('Acme');
  });

  it('strips Corp', () => {
    expect(cleanFirmName('Acme Corp')).toBe('Acme');
  });

  it('strips & Co', () => {
    expect(cleanFirmName('Smith & Co')).toBe('Smith');
  });

  it('strips multiple suffixes at once', () => {
    expect(cleanFirmName('Acme Wealth Group Ltd')).toBe('Acme Wealth');
  });

  it('collapses multiple whitespace', () => {
    expect(cleanFirmName('Acme   Wealth')).toBe('Acme Wealth');
  });

  it('trims leading and trailing whitespace', () => {
    expect(cleanFirmName('  Acme Wealth  ')).toBe('Acme Wealth');
  });

  it('handles already clean names', () => {
    expect(cleanFirmName('Coutts')).toBe('Coutts');
  });

  it('handles a name that is only a suffix', () => {
    // "Group Ltd" -> cleaning removes both -> empty
    expect(cleanFirmName('Group Ltd')).toBe('');
  });

  it('is case-insensitive for suffix stripping', () => {
    expect(cleanFirmName('Acme Wealth LIMITED')).toBe('Acme Wealth');
    expect(cleanFirmName('Acme Wealth plc')).toBe('Acme Wealth');
  });

  it('handles compound names with hyphens', () => {
    expect(cleanFirmName('Smith-Jones Wealth')).toBe('Smith-Jones Wealth');
  });
});

describe('extractDomainName', () => {
  it('extracts domain from https URL', () => {
    expect(extractDomainName('https://coutts.com')).toBe('coutts');
  });

  it('extracts domain from http URL', () => {
    expect(extractDomainName('http://coutts.com')).toBe('coutts');
  });

  it('handles www prefix', () => {
    expect(extractDomainName('https://www.coutts.com')).toBe('coutts');
  });

  it('strips .co.uk TLD', () => {
    expect(extractDomainName('https://novawm.co.uk')).toBe('novawm');
  });

  it('strips .org.uk TLD', () => {
    expect(extractDomainName('https://example.org.uk')).toBe('example');
  });

  it('strips .ai TLD', () => {
    expect(extractDomainName('https://presenzia.ai')).toBe('presenzia');
  });

  it('strips .io TLD', () => {
    expect(extractDomainName('https://dashboard.io')).toBe('dashboard');
  });

  it('strips .net TLD', () => {
    expect(extractDomainName('https://example.net')).toBe('example');
  });

  it('strips .org TLD', () => {
    expect(extractDomainName('https://example.org')).toBe('example');
  });

  it('strips standalone .uk TLD', () => {
    expect(extractDomainName('https://example.uk')).toBe('example');
  });

  it('ignores paths after domain', () => {
    expect(extractDomainName('https://coutts.com/wealth-management/about')).toBe('coutts');
  });

  it('handles bare domain without protocol', () => {
    expect(extractDomainName('coutts.com')).toBe('coutts');
  });

  it('lowercases the domain', () => {
    expect(extractDomainName('https://COUTTS.COM')).toBe('coutts');
  });

  it('handles subdomain (keeps full domain minus TLD)', () => {
    // "app.example.com" -> strip protocol/www -> "app.example.com" -> split('/')[0] -> "app.example.com"
    // -> remove .com -> "app.example"
    expect(extractDomainName('https://app.example.com')).toBe('app.example');
  });
});

describe('getPosition', () => {
  it('returns "first" for index in the first third', () => {
    expect(getPosition(0, 300)).toBe('first');
    expect(getPosition(50, 300)).toBe('first');
    expect(getPosition(99, 300)).toBe('first');
  });

  it('returns "prominent" for index in the second third', () => {
    expect(getPosition(100, 300)).toBe('prominent');
    expect(getPosition(150, 300)).toBe('prominent');
    expect(getPosition(199, 300)).toBe('prominent');
  });

  it('returns "mentioned" for index in the last third', () => {
    expect(getPosition(200, 300)).toBe('mentioned');
    expect(getPosition(250, 300)).toBe('mentioned');
    expect(getPosition(299, 300)).toBe('mentioned');
  });

  it('handles index at exact boundary of first/second third', () => {
    // totalLength=90 -> firstThird=30 -> index 30 is NOT < 30, so "prominent"
    expect(getPosition(30, 90)).toBe('prominent');
  });

  it('handles index at exact boundary of second/last third', () => {
    // totalLength=90 -> firstThird=30 -> index 60 is NOT < 60, so "mentioned"
    expect(getPosition(60, 90)).toBe('mentioned');
  });

  it('handles very short text (length=1)', () => {
    expect(getPosition(0, 1)).toBe('first');
  });

  it('handles index 0 always as "first"', () => {
    expect(getPosition(0, 10)).toBe('first');
    expect(getPosition(0, 1000)).toBe('first');
  });
});

describe('checkMention', () => {
  // Helper to build a response string where the firm name appears at a specific
  // position (start, middle, or end) within a block of text.
  function responseAt(position: 'start' | 'middle' | 'end', name: string): string {
    const padding = 'x'.repeat(200);
    if (position === 'start') return `${name} ${padding}${padding}`;
    if (position === 'middle') return `${padding} ${name} ${padding}`;
    return `${padding}${padding} ${name}`;
  }

  describe('exact cleaned name match', () => {
    it('detects exact firm name in response', () => {
      const result = checkMention(
        'We recommend Acme Wealth for investment management.',
        'Acme Wealth',
      );
      expect(result.mentioned).toBe(true);
      expect(result.position).not.toBeNull();
    });

    it('is case-insensitive', () => {
      const result = checkMention(
        'we recommend acme wealth for your needs.',
        'Acme Wealth',
      );
      expect(result.mentioned).toBe(true);
    });

    it('detects cleaned name (strips Ltd)', () => {
      const result = checkMention(
        'Consider speaking to Acme Wealth about your portfolio.',
        'Acme Wealth Ltd',
      );
      expect(result.mentioned).toBe(true);
    });

    it('detects cleaned name (strips PLC)', () => {
      const result = checkMention(
        'Barclays Wealth is a well-known UK firm.',
        'Barclays Wealth PLC',
      );
      expect(result.mentioned).toBe(true);
    });
  });

  describe('original firm name fallback', () => {
    it('matches original name if cleaning changes it and cleaned version not found', () => {
      // If the original name contains "Group" etc., but the full original appears in text
      const response = 'You could try Apex Group Ltd for corporate advice.';
      const result = checkMention(response, 'Apex Group Ltd');
      // "Apex Group Ltd" cleaned => "Apex", but "apex" is < 4 chars for word boundary check
      // However the full original "apex group ltd" should be found
      expect(result.mentioned).toBe(true);
    });
  });

  describe('word boundary matching on significant words', () => {
    it('matches individual significant word (>= 4 chars) with word boundary', () => {
      const result = checkMention(
        'Brewin Dolphin is one of the oldest firms in the UK.',
        'Brewin Dolphin Wealth Management',
      );
      expect(result.mentioned).toBe(true);
    });

    it('does NOT match substring that is not a word boundary', () => {
      // "Nova" appears inside "innovation" but should NOT match via word boundary
      const result = checkMention(
        'The innovation in financial services is remarkable.',
        'Nova Wealth',
      );
      expect(result.mentioned).toBe(false);
    });

    it('does NOT false-match "courts" when firm is "Coutts"', () => {
      const result = checkMention(
        'The courts ruled in favour of the defendant. There are many courts across the UK.',
        'Coutts',
      );
      // "Coutts" cleaned is "Coutts" -> only word is "coutts" (6 chars)
      // Word boundary match for "coutts" should NOT match "courts"
      expect(result.mentioned).toBe(false);
    });

    it('matches "Coutts" when "Coutts" actually appears', () => {
      const result = checkMention(
        'Coutts is an exclusive private bank for high net worth individuals.',
        'Coutts',
      );
      expect(result.mentioned).toBe(true);
      expect(result.position).toBe('first');
    });

    it('skips words shorter than 4 characters', () => {
      // Firm "AJ Bell" -> cleaned "AJ Bell" -> words: "aj" (2 chars), "bell" (4 chars)
      // "bell" should match via word boundary
      const result = checkMention(
        'Consider Bell Investments for your ISA.',
        'AJ Bell',
      );
      expect(result.mentioned).toBe(true);
    });
  });

  describe('partial match (2+ significant words)', () => {
    it('matches when 2+ significant words appear anywhere in response', () => {
      // "Amber Financial Planning" -> cleaned "Amber Financial Planning"
      // words >= 4 chars: "amber", "financial", "planning"
      // If none match via word boundary individually but 2+ appear as substrings:
      // Actually, word boundary check runs first. Let's craft a case where boundary
      // check fails but partial succeeds:
      // We need all words to fail boundary check but appear as substrings.
      // That's tricky because boundary check is quite broad.
      // Let's instead verify the mechanism with a known case.
      const response = 'There are amber-tinted windows and financial difficulties with planning ahead.';
      const result = checkMention(response, 'Amber Financial Planning Ltd');
      // "amber" appears after hyphen - but \bamber\b should still match "amber" after hyphen
      // because "-" is not a word character. So this would match via word boundary for "amber".
      expect(result.mentioned).toBe(true);
    });
  });

  describe('domain name matching', () => {
    it('matches via domain name extracted from website', () => {
      const result = checkMention(
        'You might want to look at novawm for their services.',
        'Nova Wealth Management',
        'https://www.novawm.co.uk',
      );
      // "novawm" extracted from domain -> word boundary match
      expect(result.mentioned).toBe(true);
    });

    it('matches via full domain mention (e.g. "coutts.com")', () => {
      const result = checkMention(
        'Visit coutts.com for more details on their private banking services.',
        'Coutts & Company',
        'https://www.coutts.com',
      );
      expect(result.mentioned).toBe(true);
    });

    it('does not match very short domain names (< 3 chars)', () => {
      // domain "ab" should be skipped
      const result = checkMention(
        'The response mentions ab several times but ab is not relevant.',
        'Some Firm',
        'https://ab.com',
      );
      expect(result.mentioned).toBe(false);
    });

    it('matches domain even when firm name does not appear', () => {
      const result = checkMention(
        'We found that killik is highly recommended for investment management.',
        'Killik & Co',
        'https://www.killik.com',
      );
      expect(result.mentioned).toBe(true);
    });
  });

  describe('no mention', () => {
    it('returns not mentioned when firm name is absent', () => {
      const result = checkMention(
        'St James Place and Hargreaves Lansdown are popular choices.',
        'Acme Wealth',
      );
      expect(result.mentioned).toBe(false);
      expect(result.position).toBeNull();
    });

    it('returns not mentioned when only very short words from name appear', () => {
      // "AZ Capital" -> cleaned "AZ Capital" -> words >= 4 chars: "capital"
      // If "capital" appears, that would match via word boundary...
      // Let's use a name with no significant words appearing:
      const result = checkMention(
        'There are many investment firms in London that offer portfolio management.',
        'Xyz Abc',
      );
      expect(result.mentioned).toBe(false);
      expect(result.position).toBeNull();
    });

    it('returns not mentioned with no website and no name match', () => {
      const result = checkMention(
        'Here are the top firms in Manchester: Brewin Dolphin, Rathbones, and Brooks Macdonald.',
        'Totally Unknown Firm',
        undefined,
      );
      expect(result.mentioned).toBe(false);
    });
  });

  describe('position accuracy', () => {
    it('returns "first" when mention is at the start', () => {
      const response = responseAt('start', 'Acme Wealth');
      const result = checkMention(response, 'Acme Wealth');
      expect(result.mentioned).toBe(true);
      expect(result.position).toBe('first');
    });

    it('returns "prominent" when mention is in the middle', () => {
      const response = responseAt('middle', 'Acme Wealth');
      const result = checkMention(response, 'Acme Wealth');
      expect(result.mentioned).toBe(true);
      expect(result.position).toBe('prominent');
    });

    it('returns "mentioned" when mention is at the end', () => {
      const response = responseAt('end', 'Acme Wealth');
      const result = checkMention(response, 'Acme Wealth');
      expect(result.mentioned).toBe(true);
      expect(result.position).toBe('mentioned');
    });
  });

  describe('edge cases', () => {
    it('handles empty response', () => {
      const result = checkMention('', 'Acme Wealth');
      expect(result.mentioned).toBe(false);
      expect(result.position).toBeNull();
    });

    it('handles firm name with special regex characters', () => {
      // Firm name with parentheses, periods, etc.
      const result = checkMention(
        'We recommend Smith (UK) Ltd for your needs.',
        'Smith (UK) Ltd',
      );
      expect(result.mentioned).toBe(true);
    });

    it('handles firm name that is the entire response', () => {
      const result = checkMention('Acme Wealth', 'Acme Wealth');
      expect(result.mentioned).toBe(true);
      expect(result.position).toBe('first');
    });

    it('handles website with trailing path', () => {
      const result = checkMention(
        'For more info visit quilter or their website.',
        'Quilter Financial Planning',
        'https://www.quilter.com/financial-planning/',
      );
      expect(result.mentioned).toBe(true);
    });

    it('matches firm name with .com suffix in the name itself', () => {
      const result = checkMention(
        'Check out wealthify for robo-advisory.',
        'wealthify.com',
        'https://www.wealthify.com',
      );
      // cleanFirmName strips .com -> "wealthify"
      expect(result.mentioned).toBe(true);
    });
  });
});

describe('extractCompetitors', () => {
  it('finds firms with "Wealth Management" pattern', () => {
    // The regex greedily matches preceding Title Case words, so we start
    // the firm name at the beginning or after non-Title-Case text.
    const response = 'Top picks: 1) Brewin Dolphin Wealth Management 2) Rathbone Wealth Management.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Brewin Dolphin Wealth Management');
    expect(competitors).toContain('Rathbone Wealth Management');
  });

  it('finds firms with "Financial" pattern', () => {
    const response = 'St James Place Financial and Quilter Financial are popular choices.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    // The pattern requires Title Case words before the keyword
    expect(competitors.some((c) => c.includes('Financial'))).toBe(true);
  });

  it('finds firms with "Advisory" pattern', () => {
    const response = 'Close Brothers Advisory is a well-known firm.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Close Brothers Advisory');
  });

  it('finds firms with "Partners" pattern', () => {
    const response = 'Evelyn Partners is an excellent choice for wealthy clients.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Evelyn Partners');
  });

  it('finds firms with "Capital" pattern', () => {
    const response = 'London Capital is recommended for asset management.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('London Capital');
  });

  it('finds firms with "Associates" pattern', () => {
    const response = 'Chase De Vere Associates provides independent financial advice.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Chase De Vere Associates');
  });

  it('finds firms with "Consulting" pattern', () => {
    const response = 'Barnett Waddingham Consulting is a pension specialist.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Barnett Waddingham Consulting');
  });

  it('finds firms with "Planning" pattern', () => {
    const response = 'Ascot Lloyd Planning offers whole-of-market advice.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Ascot Lloyd Planning');
  });

  it('finds firms with "Advisors" pattern', () => {
    const response = 'True Potential Advisors has a strong digital platform.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('True Potential Advisors');
  });

  it('excludes the firm being tested', () => {
    const response = 'Acme Wealth Management and Brewin Dolphin Wealth Management are top choices.';
    const competitors = extractCompetitors(response, 'Acme Wealth Management');
    expect(competitors).not.toContain('Acme Wealth Management');
    expect(competitors).toContain('Brewin Dolphin Wealth Management');
  });

  it('finds bold markdown names (numbered list)', () => {
    const response = `
Here are the top firms:
1. **Brewin Dolphin**
2. **Rathbones**
3. **Brooks Macdonald**
    `;
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Brewin Dolphin');
    expect(competitors).toContain('Rathbones');
    expect(competitors).toContain('Brooks Macdonald');
  });

  it('finds standalone bold markdown names', () => {
    const response = 'You should also consider **Quilter Cheviot** for discretionary management.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toContain('Quilter Cheviot');
  });

  it('ignores bold names that contain URLs', () => {
    const response = 'Visit **https://example.com/wealth** for more information.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toHaveLength(0);
  });

  it('ignores names shorter than required length', () => {
    // firmPattern requires length > 5, bold pattern requires length > 3
    // But bold names also require starting with uppercase
    const response = '1. **AB**\n2. **Brewin Dolphin**';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    // "AB" is too short (length 2, must be > 3)
    expect(competitors).not.toContain('AB');
    expect(competitors).toContain('Brewin Dolphin');
  });

  it('limits results to 10 competitors', () => {
    const names = Array.from({ length: 15 }, (_, i) => `Firm${String.fromCharCode(65 + i)} Wealth Management`);
    const response = names.join('. ');
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors.length).toBeLessThanOrEqual(10);
  });

  it('handles response with no competitors', () => {
    const response = 'There are many options available for investment in the UK market.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    expect(competitors).toHaveLength(0);
  });

  it('handles firm with & in name pattern', () => {
    const response = 'Smith & Williamson Financial is a respected firm.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    // The pattern allows (?:&\s+) between title-case words
    expect(competitors).toContain('Smith & Williamson Financial');
  });

  it('deduplicates competitors found by multiple patterns', () => {
    const response = '1. **Brewin Dolphin Wealth Management** - Brewin Dolphin Wealth Management is excellent.';
    const competitors = extractCompetitors(response, 'Acme Wealth');
    const count = competitors.filter((c) => c === 'Brewin Dolphin Wealth Management').length;
    expect(count).toBe(1);
  });
});

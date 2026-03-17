/**
 * IFA Visibility Research Study
 *
 * Tests whether GPT-4o can recommend real UK IFA firms when asked
 * about financial advisers in different UK regions.
 *
 * Usage:
 *   npx tsx scripts/ifa-visibility-research.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

// ─── Firm Database ──────────────────────────────────────────────────────────

interface Firm {
  name: string;
  region: string;
}

const FIRMS: Firm[] = [
  // ── London (25 firms) ──
  { name: "Quilter", region: "London" },
  { name: "St. James's Place", region: "London" },
  { name: "Brewin Dolphin", region: "London" },
  { name: "Rathbones", region: "London" },
  { name: "Charles Stanley", region: "London" },
  { name: "Schroders Personal Wealth", region: "London" },
  { name: "Raymond James", region: "London" },
  { name: "Canaccord Genuity Wealth Management", region: "London" },
  { name: "Smith & Williamson", region: "London" },
  { name: "Sanlam", region: "London" },
  { name: "7IM", region: "London" },
  { name: "Succession Wealth", region: "London" },
  { name: "Chase de Vere", region: "London" },
  { name: "Mazars Financial Planning", region: "London" },
  { name: "True Potential", region: "London" },
  { name: "Paradigm Norton", region: "London" },
  { name: "London & Capital", region: "London" },
  { name: "Hawksford", region: "London" },
  { name: "Saunderson House", region: "London" },
  { name: "JM Finn", region: "London" },
  { name: "Weatherbys Private Bank", region: "London" },
  { name: "Thesis Asset Management", region: "London" },
  { name: "Tilney", region: "London" },
  { name: "Waverton Investment Management", region: "London" },
  { name: "Close Brothers Asset Management", region: "London" },

  // ── South East (20 firms) ──
  { name: "Investec Wealth & Investment", region: "South East" },
  { name: "Brooks Macdonald", region: "South East" },
  { name: "Evelyn Partners", region: "South East" },
  { name: "Killik & Co", region: "South East" },
  { name: "Cazenove Capital", region: "South East" },
  { name: "Bestinvest", region: "South East" },
  { name: "Arbuthnot Latham", region: "South East" },
  { name: "Fidelity Wealth", region: "South East" },
  { name: "Skerritts Wealth Management", region: "South East" },
  { name: "Informed Financial Planning", region: "South East" },
  { name: "Grayside Financial Services", region: "South East" },
  { name: "Heathgate Wealth Management", region: "South East" },
  { name: "Plan4Life Financial Planners", region: "South East" },
  { name: "FPC Financial Planning Consultants", region: "South East" },
  { name: "Cornerstone Financial Planning", region: "South East" },
  { name: "Kellands", region: "South East" },
  { name: "Satis Asset Management", region: "South East" },
  { name: "Richard Nelson Financial Services", region: "South East" },
  { name: "Lumin Wealth", region: "South East" },
  { name: "EQ Investors", region: "South East" },

  // ── North West / Manchester (18 firms) ──
  { name: "Kingswood Group", region: "North West" },
  { name: "Foster Denovo", region: "North West" },
  { name: "Tatton Asset Management", region: "North West" },
  { name: "Active Wealth", region: "North West" },
  { name: "Equilibrium Financial Planning", region: "North West" },
  { name: "Progeny Wealth", region: "North West" },
  { name: "Blacktower Financial Management", region: "North West" },
  { name: "SG Wealth Management", region: "North West" },
  { name: "Sedulo Wealth", region: "North West" },
  { name: "Sanlam Wealth Planning", region: "North West" },
  { name: "Pearson Solicitors Financial Planning", region: "North West" },
  { name: "Fiducia Wealth Management", region: "North West" },
  { name: "Haven IFA", region: "North West" },
  { name: "Thornton Jones Wealth Management", region: "North West" },
  { name: "Four Wealth Management", region: "North West" },
  { name: "Albert Goodman Financial Planning", region: "North West" },
  { name: "Cortland Wealth Management", region: "North West" },
  { name: "Pannells Financial Planning", region: "North West" },

  // ── Scotland / Edinburgh (15 firms) ──
  { name: "Nucleus Financial", region: "Scotland" },
  { name: "Abrdn Personal Wealth", region: "Scotland" },
  { name: "Anderson Strathern Asset Management", region: "Scotland" },
  { name: "Murray Asset Management", region: "Scotland" },
  { name: "Turcan Connell", region: "Scotland" },
  { name: "AAB Wealth", region: "Scotland" },
  { name: "Cornerstone Asset Management", region: "Scotland" },
  { name: "Thorntons Investments", region: "Scotland" },
  { name: "Wheatley Wealth Management", region: "Scotland" },
  { name: "Johnston Carmichael Wealth", region: "Scotland" },
  { name: "Courtiers", region: "Scotland" },
  { name: "Bellwether Wealth Management", region: "Scotland" },
  { name: "1825 Financial Planning", region: "Scotland" },
  { name: "Hymans Robertson Personal Wealth", region: "Scotland" },
  { name: "Grant Thornton Wealth Advisory", region: "Scotland" },

  // ── Midlands / Birmingham (15 firms) ──
  { name: "Mattioli Woods", region: "Midlands" },
  { name: "NFU Mutual Financial Services", region: "Midlands" },
  { name: "Smith Cooper Wealth", region: "Midlands" },
  { name: "Rowley Turton", region: "Midlands" },
  { name: "Berry & Oak Financial Planning", region: "Midlands" },
  { name: "Stonebridge Financial Group", region: "Midlands" },
  { name: "Dains Financial", region: "Midlands" },
  { name: "BRI Wealth Management", region: "Midlands" },
  { name: "Amber River Financial Planning", region: "Midlands" },
  { name: "Solomons IFA", region: "Midlands" },
  { name: "Wesleyan Financial Services", region: "Midlands" },
  { name: "MHA Moore & Smalley Wealth Management", region: "Midlands" },
  { name: "Smith & Pinching", region: "Midlands" },
  { name: "PHD Wealth Management", region: "Midlands" },
  { name: "Finura Partners", region: "Midlands" },

  // ── Yorkshire / Leeds (15 firms) ──
  { name: "Progeny", region: "Yorkshire" },
  { name: "Punter Southall Wealth", region: "Yorkshire" },
  { name: "Clarion Wealth", region: "Yorkshire" },
  { name: "Irwin Mitchell Financial Planning", region: "Yorkshire" },
  { name: "York Place Financial Planning", region: "Yorkshire" },
  { name: "Walker Crips", region: "Yorkshire" },
  { name: "Armstrong Watson Financial Planning", region: "Yorkshire" },
  { name: "Hartsfield Wealth Management", region: "Yorkshire" },
  { name: "Aspire Wealth Management", region: "Yorkshire" },
  { name: "Castle Financial Management", region: "Yorkshire" },
  { name: "The Retirement Planning Group", region: "Yorkshire" },
  { name: "Barkworth Investment Group", region: "Yorkshire" },
  { name: "Helmsley Wealth Management", region: "Yorkshire" },
  { name: "Consilio Wealth Advisors", region: "Yorkshire" },
  { name: "Black Swan Capital", region: "Yorkshire" },

  // ── South West / Bristol (15 firms) ──
  { name: "Hargreaves Lansdown", region: "South West" },
  { name: "AJ Bell", region: "South West" },
  { name: "Old Mill Financial Planning", region: "South West" },
  { name: "Wessex Asset Management", region: "South West" },
  { name: "PKF Francis Clark Financial Planning", region: "South West" },
  { name: "Bishop Fleming Wealth Management", region: "South West" },
  { name: "RBC Brewin Dolphin", region: "South West" },
  { name: "Barnett Waddingham", region: "South West" },
  { name: "Kingswood Financial Planning", region: "South West" },
  { name: "Moreton Smith Wealth Management", region: "South West" },
  { name: "Montpelier Financial Planning", region: "South West" },
  { name: "Babbé Wealth Management", region: "South West" },
  { name: "Hoxton Wealth", region: "South West" },
  { name: "Heron Financial", region: "South West" },
  { name: "Thomas Miller Investment", region: "South West" },

  // ── Wales (10 firms) ──
  { name: "Hodge Bank", region: "Wales" },
  { name: "Principality Building Society Financial Advice", region: "Wales" },
  { name: "Ludlow Wealth Management", region: "Wales" },
  { name: "Berry Smith Financial Planning", region: "Wales" },
  { name: "Bevan & Buckland Wealth Management", region: "Wales" },
  { name: "Golley Slater Wealth Management", region: "Wales" },
  { name: "WP Financial Services", region: "Wales" },
  { name: "Newport IFA", region: "Wales" },
  { name: "OAK Financial Planning Wales", region: "Wales" },
  { name: "Greenaway Financial Advice", region: "Wales" },

  // ── East Anglia (10 firms) ──
  { name: "Almary Green Investments", region: "East Anglia" },
  { name: "Chadwicks IFA", region: "East Anglia" },
  { name: "Hansard Wealth Management", region: "East Anglia" },
  { name: "Colchester Wealth Management", region: "East Anglia" },
  { name: "Financial Advice Cambridge", region: "East Anglia" },
  { name: "Magenta Financial Planning", region: "East Anglia" },
  { name: "Larking Gowen Financial Planning", region: "East Anglia" },
  { name: "Ensors Wealth Management", region: "East Anglia" },
  { name: "Raymond James Norwich", region: "East Anglia" },
  { name: "Aston Shaw Financial Planning", region: "East Anglia" },

  // ── North East (7 firms) ──
  { name: "Vertem Asset Management", region: "North East" },
  { name: "Tier One Capital", region: "North East" },
  { name: "Robson Laidler Wealth", region: "North East" },
  { name: "Sanlam Wealth Newcastle", region: "North East" },
  { name: "Baxter Financial Planning", region: "North East" },
  { name: "Lowes Financial Management", region: "North East" },
  { name: "Fairstone Financial Management", region: "North East" },
];

console.log(`Loaded ${FIRMS.length} firms across ${[...new Set(FIRMS.map(f => f.region))].length} regions\n`);

// ─── Regions & Prompts ──────────────────────────────────────────────────────

const REGIONS = [
  "London",
  "South East England",
  "South West England",
  "West Midlands",
  "North West England",
  "North East England",
  "Scotland",
  "Wales",
  "East Anglia",
  "Yorkshire",
];

const PROMPT_VARIANTS = [
  (region: string) =>
    `Can you recommend a good independent financial adviser in ${region}? I'm looking for an IFA who can help with retirement planning and investments.`,
  (region: string) =>
    `Who are the best independent financial advisers in ${region}? I need wealth management and pension advice.`,
  (region: string) =>
    `I'm looking for a trusted financial adviser in ${region}. Can you suggest some reputable IFA firms that handle investment management and financial planning?`,
];

// ─── OpenAI API Call ────────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When recommending financial advisers, please mention specific firm names that you know of in the requested area.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ─── Rate limiter ───────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main Research Function ─────────────────────────────────────────────────

interface RegionResult {
  region: string;
  promptVariant: number;
  prompt: string;
  response: string;
  firmsFound: string[];
  firmsNotFound: string[];
}

interface FirmResult {
  name: string;
  region: string;
  mentionedInAnyResponse: boolean;
  mentionedInResponses: string[]; // which region queries mentioned it
  mentionCount: number;
}

interface ResearchResults {
  metadata: {
    date: string;
    model: string;
    totalFirms: number;
    totalRegions: number;
    totalApiCalls: number;
    totalPromptVariants: number;
  };
  summary: {
    totalFirmsFound: number;
    totalFirmsNotFound: number;
    percentageNotFound: number;
    percentageFound: number;
  };
  byRegion: {
    [region: string]: {
      firmsInDatabase: number;
      firmsFound: number;
      firmsNotFound: number;
      percentageNotFound: number;
      firmsMentioned: string[];
      firmsNeverMentioned: string[];
    };
  };
  allFirmResults: FirmResult[];
  regionResponses: RegionResult[];
}

async function runResearch(): Promise<ResearchResults> {
  const regionResponses: RegionResult[] = [];
  const allResponses: string[] = [];

  let callCount = 0;

  console.log('Starting AI visibility research...');
  console.log(`Will make ${REGIONS.length * PROMPT_VARIANTS.length} API calls\n`);

  // Make API calls: 10 regions x 3 prompt variants = 30 calls
  for (const region of REGIONS) {
    for (let v = 0; v < PROMPT_VARIANTS.length; v++) {
      const prompt = PROMPT_VARIANTS[v](region);
      callCount++;

      console.log(`[${callCount}/30] Querying: ${region} (variant ${v + 1})...`);

      try {
        const response = await callOpenAI(prompt);
        allResponses.push(response);

        // Check which firms from our database appear in this response
        const responseLower = response.toLowerCase();
        const firmsFound: string[] = [];
        const firmsNotFound: string[] = [];

        for (const firm of FIRMS) {
          // Check various name forms
          const nameVariants = getNameVariants(firm.name);
          const found = nameVariants.some(variant => responseLower.includes(variant.toLowerCase()));
          if (found) {
            firmsFound.push(firm.name);
          } else {
            firmsNotFound.push(firm.name);
          }
        }

        regionResponses.push({
          region,
          promptVariant: v + 1,
          prompt,
          response,
          firmsFound,
          firmsNotFound,
        });

        console.log(`   -> Found ${firmsFound.length} firms, missed ${firmsNotFound.length}`);
        if (firmsFound.length > 0) {
          console.log(`   -> Mentioned: ${firmsFound.join(', ')}`);
        }

      } catch (err: any) {
        console.error(`   ERROR: ${err.message}`);
        regionResponses.push({
          region,
          promptVariant: v + 1,
          prompt,
          response: `ERROR: ${err.message}`,
          firmsFound: [],
          firmsNotFound: FIRMS.map(f => f.name),
        });
      }

      // Rate limiting: wait 1.5 seconds between calls
      if (callCount < REGIONS.length * PROMPT_VARIANTS.length) {
        await sleep(1500);
      }
    }
  }

  // ── Aggregate results ──

  // For each firm, check if it was mentioned in ANY response
  const firmResults: FirmResult[] = FIRMS.map(firm => {
    const nameVariants = getNameVariants(firm.name);
    const mentionedIn: string[] = [];
    let count = 0;

    for (const rr of regionResponses) {
      if (rr.response.startsWith('ERROR:')) continue;
      const responseLower = rr.response.toLowerCase();
      const found = nameVariants.some(v => responseLower.includes(v.toLowerCase()));
      if (found) {
        mentionedIn.push(`${rr.region} (v${rr.promptVariant})`);
        count++;
      }
    }

    return {
      name: firm.name,
      region: firm.region,
      mentionedInAnyResponse: mentionedIn.length > 0,
      mentionedInResponses: mentionedIn,
      mentionCount: count,
    };
  });

  const totalFound = firmResults.filter(f => f.mentionedInAnyResponse).length;
  const totalNotFound = firmResults.filter(f => !f.mentionedInAnyResponse).length;

  // Per-region breakdown
  const regions = [...new Set(FIRMS.map(f => f.region))];
  const byRegion: ResearchResults['byRegion'] = {};

  for (const region of regions) {
    const regionFirms = firmResults.filter(f => f.region === region);
    const found = regionFirms.filter(f => f.mentionedInAnyResponse);
    const notFound = regionFirms.filter(f => !f.mentionedInAnyResponse);

    byRegion[region] = {
      firmsInDatabase: regionFirms.length,
      firmsFound: found.length,
      firmsNotFound: notFound.length,
      percentageNotFound: Math.round((notFound.length / regionFirms.length) * 100),
      firmsMentioned: found.map(f => f.name),
      firmsNeverMentioned: notFound.map(f => f.name),
    };
  }

  return {
    metadata: {
      date: new Date().toISOString(),
      model: 'gpt-4o',
      totalFirms: FIRMS.length,
      totalRegions: REGIONS.length,
      totalApiCalls: callCount,
      totalPromptVariants: PROMPT_VARIANTS.length,
    },
    summary: {
      totalFirmsFound: totalFound,
      totalFirmsNotFound: totalNotFound,
      percentageNotFound: Math.round((totalNotFound / FIRMS.length) * 100),
      percentageFound: Math.round((totalFound / FIRMS.length) * 100),
    },
    byRegion,
    allFirmResults: firmResults,
    regionResponses,
  };
}

// ─── Name variant matching ──────────────────────────────────────────────────

function getNameVariants(name: string): string[] {
  const variants = [name];

  // Handle common abbreviations and name forms
  // "St. James's Place" should match "St James's Place", "St. James' Place", "SJP"
  if (name.includes("St. James")) {
    variants.push("St James's Place", "St. James' Place", "SJP", "St James' Place");
  }
  if (name === "7IM") {
    variants.push("Seven Investment Management");
  }
  if (name === "AJ Bell") {
    variants.push("A.J. Bell", "AJ Bell Youinvest");
  }
  if (name === "Abrdn Personal Wealth") {
    variants.push("abrdn", "Aberdeen", "Aberdeen Standard");
  }
  if (name.includes("NFU Mutual")) {
    variants.push("NFU Mutual", "NFU");
  }
  if (name === "Evelyn Partners") {
    variants.push("Tilney Smith & Williamson", "Tilney");
  }
  if (name === "Hargreaves Lansdown") {
    variants.push("HL", "Hargreaves");
  }
  if (name.includes("Canaccord")) {
    variants.push("Canaccord", "Canaccord Genuity");
  }
  if (name.includes("RBC Brewin Dolphin")) {
    variants.push("Brewin Dolphin");
  }
  if (name === "Punter Southall Wealth") {
    variants.push("Punter Southall", "PS Wealth");
  }
  if (name === "Schroders Personal Wealth") {
    variants.push("Schroders", "SPW");
  }
  if (name === "Close Brothers Asset Management") {
    variants.push("Close Brothers");
  }
  if (name === "Investec Wealth & Investment") {
    variants.push("Investec Wealth", "Investec");
  }
  if (name === "Irwin Mitchell Financial Planning") {
    variants.push("Irwin Mitchell");
  }
  if (name.includes("Armstrong Watson")) {
    variants.push("Armstrong Watson");
  }
  if (name.includes("Johnston Carmichael")) {
    variants.push("Johnston Carmichael");
  }
  if (name === "Fairstone Financial Management") {
    variants.push("Fairstone");
  }
  if (name.includes("Walker Crips")) {
    variants.push("Walker Crips");
  }
  if (name === "Wesleyan Financial Services") {
    variants.push("Wesleyan");
  }
  if (name === "Brooks Macdonald") {
    variants.push("Brooks MacDonald");
  }
  if (name === "Thomas Miller Investment") {
    variants.push("Thomas Miller");
  }
  if (name.includes("Barnett Waddingham")) {
    variants.push("Barnett Waddingham");
  }
  if (name.includes("Amber River")) {
    variants.push("Amber River");
  }

  // Generic: also try just the first word if it's distinctive (3+ letters)
  const firstWord = name.split(' ')[0];
  if (firstWord.length >= 5 && !['Close', 'Smith', 'Berry', 'Black', 'South', 'North', 'Grant', 'Castle', 'Active', 'Haven', 'Tower', 'Royal', 'Albert'].includes(firstWord)) {
    variants.push(firstWord);
  }

  return [...new Set(variants)];
}

// ─── Output generators ──────────────────────────────────────────────────────

function generateMarkdownSummary(results: ResearchResults): string {
  const lines: string[] = [];

  lines.push('# UK IFA AI Visibility Research Study');
  lines.push('');
  lines.push(`**Date:** ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  lines.push(`**Model:** ${results.metadata.model}`);
  lines.push(`**Firms Tested:** ${results.metadata.totalFirms}`);
  lines.push(`**UK Regions:** ${results.metadata.totalRegions}`);
  lines.push(`**API Calls Made:** ${results.metadata.totalApiCalls}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Key Finding');
  lines.push('');
  lines.push(`**${results.summary.percentageNotFound}% of UK IFA firms are invisible to AI.**`);
  lines.push('');
  lines.push(`When GPT-4o was asked to recommend independent financial advisers across 10 UK regions using 3 different prompt styles (30 total queries), only **${results.summary.totalFirmsFound}** out of **${results.metadata.totalFirms}** real IFA firms were ever mentioned.`);
  lines.push('');
  lines.push(`- Firms mentioned by AI: **${results.summary.totalFirmsFound}** (${results.summary.percentageFound}%)`);
  lines.push(`- Firms completely invisible: **${results.summary.totalFirmsNotFound}** (${results.summary.percentageNotFound}%)`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Results by Region');
  lines.push('');
  lines.push('| Region | Firms Tested | Found by AI | Invisible | % Invisible |');
  lines.push('|--------|-------------|-------------|-----------|-------------|');

  const sortedRegions = Object.entries(results.byRegion).sort((a, b) => b[1].percentageNotFound - a[1].percentageNotFound);

  for (const [region, data] of sortedRegions) {
    lines.push(`| ${region} | ${data.firmsInDatabase} | ${data.firmsFound} | ${data.firmsNotFound} | ${data.percentageNotFound}% |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Firms Found by AI (Mentioned at Least Once)');
  lines.push('');

  const foundFirms = results.allFirmResults
    .filter(f => f.mentionedInAnyResponse)
    .sort((a, b) => b.mentionCount - a.mentionCount);

  if (foundFirms.length === 0) {
    lines.push('*No firms from our database were mentioned.*');
  } else {
    lines.push('| Firm | Region | Times Mentioned | In Which Queries |');
    lines.push('|------|--------|-----------------|------------------|');
    for (const firm of foundFirms) {
      lines.push(`| ${firm.name} | ${firm.region} | ${firm.mentionCount} | ${firm.mentionedInResponses.join(', ')} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Firms Invisible to AI');
  lines.push('');

  for (const [region, data] of sortedRegions) {
    if (data.firmsNeverMentioned.length > 0) {
      lines.push(`### ${region} (${data.firmsNotFound}/${data.firmsInDatabase} invisible)`);
      for (const firm of data.firmsNeverMentioned) {
        lines.push(`- ${firm}`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('## Methodology');
  lines.push('');
  lines.push('This study tested whether GPT-4o would organically recommend real UK IFA firms when asked for financial adviser recommendations. Three prompt variants were used per region:');
  lines.push('');
  lines.push('1. "Can you recommend a good independent financial adviser in [region]?"');
  lines.push('2. "Who are the best independent financial advisers in [region]?"');
  lines.push('3. "I\'m looking for a trusted financial adviser in [region]. Can you suggest some reputable IFA firms?"');
  lines.push('');
  lines.push('A firm was counted as "found" if its name (or a common variant) appeared in any of the 30 responses.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Research conducted by Presenzia.ai*');

  return lines.join('\n');
}

// ─── Run ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('  UK IFA AI Visibility Research Study');
  console.log('  Model: GPT-4o | Firms: ' + FIRMS.length + ' | Regions: ' + REGIONS.length);
  console.log('='.repeat(60));
  console.log('');

  const results = await runResearch();

  // Save JSON
  const jsonPath = path.join(__dirname, '..', 'ifa-visibility-research.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\nJSON results saved to: ${jsonPath}`);

  // Save Markdown
  const mdPath = path.join(__dirname, '..', 'ifa-visibility-summary.md');
  const markdown = generateMarkdownSummary(results);
  fs.writeFileSync(mdPath, markdown);
  console.log(`Markdown summary saved to: ${mdPath}`);

  // Print summary to console
  console.log('\n' + '='.repeat(60));
  console.log('  RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Total firms tested: ${results.metadata.totalFirms}`);
  console.log(`  Firms found by AI:  ${results.summary.totalFirmsFound} (${results.summary.percentageFound}%)`);
  console.log(`  Firms invisible:    ${results.summary.totalFirmsNotFound} (${results.summary.percentageNotFound}%)`);
  console.log('');
  console.log('  By region:');
  for (const [region, data] of Object.entries(results.byRegion)) {
    console.log(`    ${region.padEnd(15)} ${data.firmsFound}/${data.firmsInDatabase} found (${data.percentageNotFound}% invisible)`);
  }
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

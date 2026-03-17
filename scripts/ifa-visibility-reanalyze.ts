/**
 * Re-analyze saved IFA visibility research responses
 * Fixes false-positive matching issues
 *
 * Usage: npx tsx scripts/ifa-visibility-reanalyze.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load saved data
const jsonPath = path.join(__dirname, '..', 'ifa-visibility-research.json');
const savedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// ─── Firm Database (same as original minus problematic entries) ─────────────

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

console.log(`Re-analyzing with ${FIRMS.length} firms (removed 'Financial Advice Cambridge' false positive)\n`);

// ─── Stricter name matching ──────────────────────────────────────────────────

function getNameVariants(name: string): string[] {
  const variants = [name];

  // Only add SPECIFIC known aliases, no generic first-word matching
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
    variants.push("abrdn Personal Wealth", "abrdn personal wealth");
    // Don't match just "abrdn" as it's too short/generic
  }
  if (name.includes("NFU Mutual")) {
    variants.push("NFU Mutual");
  }
  if (name === "Evelyn Partners") {
    variants.push("Evelyn Partners");
  }
  if (name === "Hargreaves Lansdown") {
    variants.push("Hargreaves Lansdown");
  }
  if (name.includes("Canaccord")) {
    variants.push("Canaccord Genuity");
  }
  if (name.includes("RBC Brewin Dolphin")) {
    variants.push("Brewin Dolphin");
  }
  if (name === "Punter Southall Wealth") {
    variants.push("Punter Southall");
  }
  if (name === "Schroders Personal Wealth") {
    variants.push("Schroders Personal Wealth");
  }
  if (name === "Close Brothers Asset Management") {
    variants.push("Close Brothers");
  }
  if (name === "Investec Wealth & Investment") {
    variants.push("Investec Wealth");
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
  if (name === "Wesleyan Financial Services") {
    variants.push("Wesleyan Financial");
  }
  if (name === "Brooks Macdonald") {
    variants.push("Brooks MacDonald");
  }
  if (name === "Thomas Miller Investment") {
    variants.push("Thomas Miller Investment");
  }
  if (name.includes("Barnett Waddingham")) {
    variants.push("Barnett Waddingham");
  }
  if (name.includes("Amber River")) {
    variants.push("Amber River");
  }
  if (name === "Thornton Jones Wealth Management") {
    variants.push("Thornton Jones");
  }
  if (name === "Thorntons Investments") {
    variants.push("Thorntons Investments");
  }
  if (name === "Cornerstone Financial Planning") {
    variants.push("Cornerstone Financial Planning");
  }
  if (name === "Cornerstone Asset Management") {
    variants.push("Cornerstone Asset Management");
  }

  return [...new Set(variants)];
}

// Use word-boundary-aware matching to avoid substring false positives
function firmMentioned(firmName: string, responseText: string): boolean {
  const variants = getNameVariants(firmName);
  const responseLower = responseText.toLowerCase();

  for (const variant of variants) {
    const variantLower = variant.toLowerCase();

    // For very short names, require exact word match or bold formatting
    if (variantLower.length <= 5) {
      // Check for bold formatting: **7IM** or **SJP**
      if (responseText.includes(`**${variant}**`)) return true;
      // Check as standalone word
      const wordRegex = new RegExp(`\\b${escapeRegex(variantLower)}\\b`, 'i');
      if (wordRegex.test(responseText)) return true;
    } else {
      // For longer names, simple includes is fine
      if (responseLower.includes(variantLower)) return true;
    }
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Verify specific potential false positives ──

// Check "Cornerstone" matches - is it really the firm or generic text?
function verifyCornerstone(responses: any[]): void {
  for (const r of responses) {
    if (r.response.startsWith('ERROR:')) continue;
    const lower = r.response.toLowerCase();
    if (lower.includes('cornerstone')) {
      const idx = lower.indexOf('cornerstone');
      const context = r.response.substring(Math.max(0, idx - 30), idx + 60);
      console.log(`  Cornerstone in ${r.region} v${r.promptVariant}: "${context}"`);
    }
  }
}

console.log('Verifying "Cornerstone" mentions:');
verifyCornerstone(savedData.regionResponses);
console.log('');

// ── Re-run analysis ──

interface FirmResult {
  name: string;
  region: string;
  mentionedInAnyResponse: boolean;
  mentionedInResponses: string[];
  mentionCount: number;
}

const regionResponses = savedData.regionResponses;

const firmResults: FirmResult[] = FIRMS.map(firm => {
  const mentionedIn: string[] = [];
  let count = 0;

  for (const rr of regionResponses) {
    if (rr.response.startsWith('ERROR:')) continue;
    if (firmMentioned(firm.name, rr.response)) {
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
const totalFirms = FIRMS.length;

// Per-region breakdown
const regions = [...new Set(FIRMS.map(f => f.region))];
const byRegion: Record<string, any> = {};

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

const results = {
  metadata: {
    ...savedData.metadata,
    totalFirms,
    reanalyzedAt: new Date().toISOString(),
    notes: "Re-analyzed with stricter matching. Removed 'Financial Advice Cambridge' (false positive). Total firms: 149 -> uses word-boundary matching.",
  },
  summary: {
    totalFirmsFound: totalFound,
    totalFirmsNotFound: totalNotFound,
    percentageNotFound: Math.round((totalNotFound / totalFirms) * 100),
    percentageFound: Math.round((totalFound / totalFirms) * 100),
  },
  byRegion,
  allFirmResults: firmResults,
  regionResponses: savedData.regionResponses,
};

// Save updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
console.log(`Updated JSON saved to: ${jsonPath}`);

// Generate updated markdown
function generateMarkdownSummary(): string {
  const lines: string[] = [];

  lines.push('# UK IFA AI Visibility Research Study');
  lines.push('');
  lines.push(`**Date:** ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  lines.push(`**Model:** GPT-4o`);
  lines.push(`**Firms Tested:** ${totalFirms}`);
  lines.push(`**UK Regions:** ${results.metadata.totalRegions}`);
  lines.push(`**API Calls Made:** ${results.metadata.totalApiCalls} (10 regions x 3 prompt variants)`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Key Finding');
  lines.push('');
  lines.push(`**${results.summary.percentageNotFound}% of UK IFA firms are invisible to AI.**`);
  lines.push('');
  lines.push(`When GPT-4o was asked to recommend independent financial advisers across 10 UK regions using 3 different prompt styles (30 total queries), only **${results.summary.totalFirmsFound}** out of **${totalFirms}** real IFA firms were ever mentioned.`);
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

  const sortedRegions = Object.entries(byRegion).sort((a: any, b: any) => b[1].percentageNotFound - a[1].percentageNotFound);

  for (const [region, data] of sortedRegions as any) {
    lines.push(`| ${region} | ${data.firmsInDatabase} | ${data.firmsFound} | ${data.firmsNotFound} | ${data.percentageNotFound}% |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Firms Found by AI (Mentioned at Least Once)');
  lines.push('');

  const foundFirms = firmResults
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

  for (const [region, data] of sortedRegions as any) {
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
  lines.push('A firm was counted as "found" if its name (or a known variant/alias) appeared in any of the 30 responses. Word-boundary matching was used to prevent false positives from generic terms.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Research conducted by Presenzia.ai*');

  return lines.join('\n');
}

const mdPath = path.join(__dirname, '..', 'ifa-visibility-summary.md');
fs.writeFileSync(mdPath, generateMarkdownSummary());
console.log(`Updated Markdown saved to: ${mdPath}`);

// Print summary
console.log('\n' + '='.repeat(60));
console.log('  CORRECTED RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`  Total firms tested: ${totalFirms}`);
console.log(`  Firms found by AI:  ${totalFound} (${results.summary.percentageFound}%)`);
console.log(`  Firms invisible:    ${totalNotFound} (${results.summary.percentageNotFound}%)`);
console.log('');
console.log('  By region:');
for (const [region, data] of Object.entries(byRegion) as any) {
  console.log(`    ${region.padEnd(15)} ${data.firmsFound}/${data.firmsInDatabase} found (${data.percentageNotFound}% invisible)`);
}

console.log('');
console.log('  Top mentioned firms:');
const topFirms = firmResults.filter(f => f.mentionedInAnyResponse).sort((a, b) => b.mentionCount - a.mentionCount).slice(0, 15);
for (const f of topFirms) {
  console.log(`    ${f.name.padEnd(40)} ${f.mentionCount} mentions`);
}

console.log('='.repeat(60));

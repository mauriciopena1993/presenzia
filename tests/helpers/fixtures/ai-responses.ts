/**
 * Deterministic AI platform responses for testing.
 * Test firm: "Test Wealth Firm" in London, specialising in Wealth Management.
 * ChatGPT, Perplexity, and Google AI mention the firm. Claude does not.
 * This gives a predictable score for test assertions.
 */

export const TEST_FIRM = {
  firmName: 'Test Wealth Firm',
  website: 'www.testwealthfirm.co.uk',
  coverageType: 'local' as const,
  locations: 'London',
  specialties: ['Wealth Management'],
  targetClient: 'High-net-worth individuals (£250k+)',
  firmDescription: 'A boutique wealth management firm specialising in HNW clients.',
};

export const COMPETITORS = [
  'St. James\'s Place',
  'Brewin Dolphin',
  'Rathbones',
  'Quilter Cheviot',
  'Charles Stanley',
];

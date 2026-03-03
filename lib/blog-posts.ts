export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author?: string;
  content: string;
  heroImage: string;
  heroImageAlt: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'we-tested-50-uk-ifa-firms-on-chatgpt-only-3-were-recommended',
    title: "We Tested 50 UK IFA Firms on ChatGPT. Only 3 Were Recommended.",
    description: "We audited 50 UK financial advisory firms across ChatGPT, Claude, Perplexity, and Google AI. The results were stark: 94% of firms were invisible. Here's what we found.",
    date: '2026-02-18',
    readTime: '7 min read',
    category: 'Research',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Data analytics dashboard showing charts and metrics',
    content: `
We recently ran a comprehensive AI visibility audit across 50 UK financial advisory firms. We tested each firm against ChatGPT, Claude, Perplexity, and Google AI using prompts that real prospective clients actually type: "best financial advisor in [city]", "pension transfer specialist near me", and "who should I speak to about inheritance tax planning in [city]?"

The results were stark.

## The Numbers

Of 50 firms tested across four AI platforms:

- **Only 3 firms** were consistently recommended by at least two platforms
- **6 firms** appeared at least once across all tests
- **41 firms** were completely invisible — not a single AI mention across any platform
- The average visibility score was **14 out of 100**

To put that in context: when a high-net-worth individual asks ChatGPT to recommend a financial advisor in their area, 94% of firms will never be mentioned. The same few names appear repeatedly, while the vast majority of qualified, experienced advisors are simply invisible.

## What the Top 3 Had in Common

The three firms that consistently appeared in AI recommendations shared clear characteristics:

**1. Strong, specific website content**
Not just a services page — genuine thought leadership. Articles about pension transfers, inheritance tax planning, and retirement strategies. FAQ pages answering the exact questions prospective clients ask.

**2. Consistent citations across authoritative platforms**
Complete profiles on VouchedFor, Unbiased, FTAdviser, and Google Business Profile. The same firm name, address, and services described consistently everywhere.

**3. Structured data on their websites**
FinancialService schema markup that tells AI systems exactly what services they offer, where they are located, and their regulatory credentials.

**4. Client reviews mentioning specialties**
Not just "great advisor" — reviews that mention specific services: "helped us with our pension transfer", "brilliant inheritance tax planning advice." This teaches AI to match the firm with specific queries.

## What the Invisible 41 Had in Common

The pattern was equally clear for firms that scored zero:

- **Generic website copy** — "We provide comprehensive financial planning solutions" could describe any firm in the country
- **No VouchedFor or Unbiased presence** — or thin profiles with minimal reviews
- **No content beyond a services page** — no articles, no guides, no FAQs
- **Inconsistent or incomplete Google Business Profile** — missing service categories, no reviews, outdated information

## Why This Matters Now

AI search is not a future trend. Over 15 million UK adults now use AI assistants regularly, and that number is growing rapidly. For high-net-worth individuals — exactly the clients IFA firms want to attract — AI adoption is even higher.

When a prospective client worth tens of thousands in lifetime fees asks AI for a financial advisor recommendation, the firms that appear get the call. The firms that don't get nothing. There is no page two in AI search.

## The Opportunity

The good news is that the barrier to entry is currently low. Because so few IFA firms have optimised for AI visibility, the firms that start now can establish a dominant position in their area relatively quickly.

The window won't stay open forever. As awareness grows, competition will increase. The firms that move first will have an advantage that is very difficult to overcome, because AI systems are conservative: once they form a view of which firms to recommend, it takes sustained new evidence to change it.

## What You Should Do

Start by understanding where you stand. A free AI visibility score takes 60 seconds and shows you whether AI platforms are currently recommending your firm.

If you score below 30 — and based on our research, most firms will — the full AI Visibility Audit provides a complete breakdown across all four platforms with a specific, prioritised action plan.

The firms that take this seriously in 2026 will own their local market in AI search for years to come.
    `.trim(),
  },
  {
    slug: 'what-makes-ai-recommend-one-financial-advisor-over-another',
    title: "What Makes AI Recommend One Financial Advisor Over Another?",
    description: "AI platforms don't recommend financial advisors randomly. There are specific signals that determine which firms appear. Here's what actually matters and how to build it.",
    date: '2026-02-25',
    readTime: '8 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Business analytics and data displayed on a laptop screen',
    content: `
When someone asks ChatGPT "who is the best financial advisor in Guildford?", the AI doesn't search a database. It synthesises information from across the entire web to form an opinion about which firms to recommend.

Understanding the signals that drive these recommendations is the first step to improving your firm's visibility. Here's what actually matters.

## The Five Signals That Matter Most

### 1. Content Authority

AI models give the highest weight to firms they perceive as experts. This perception is built primarily through published content: articles, guides, case studies, and commentary that demonstrate deep knowledge.

A firm that publishes a detailed guide on "How Pension Transfers Work in 2026" is telling AI systems that it has genuine expertise in pension transfers. When someone asks AI for a pension transfer specialist, that firm is more likely to be recommended.

The content needs to be substantial and specific. A 200-word services page saying "we offer pension transfer advice" carries far less weight than a 1,500-word guide that explains the process, the risks, the FCA requirements, and what clients should consider.

### 2. Citation Consistency

AI models cross-reference information across multiple sources. A firm that is described consistently across VouchedFor, Unbiased, FTAdviser, Google Business Profile, and its own website is perceived as established and reliable.

Inconsistency raises flags. If your firm name is slightly different on different platforms, or your services are described differently, AI systems have lower confidence in recommending you.

The fix is straightforward: audit every directory listing and ensure your firm name, address, contact details, and service descriptions are identical everywhere.

### 3. Client Reviews

Reviews are one of the most powerful signals because they represent third-party validation. But not all reviews are equal in AI's eyes.

**High-value reviews** mention specific services: "helped us transfer a defined benefit pension", "excellent inheritance tax planning advice for our family." These teach AI to match your firm with specific queries.

**Low-value reviews** are generic: "great service, highly recommend." These tell AI nothing about what you actually do well.

The most impactful reviews are on Google and VouchedFor, because these platforms are most frequently referenced by AI systems.

### 4. Structured Data

FinancialService schema markup on your website is a direct signal to AI systems about what your firm does. It's the equivalent of handing AI a structured fact sheet about your firm.

Without schema markup, AI has to infer your services from unstructured text. With it, the information is explicit and unambiguous.

Schema markup should include: your firm name, address, services offered, areas served, FCA registration number, qualifications, and any accreditations.

### 5. Third-Party Mentions

Being mentioned by authoritative third parties carries more weight than anything you say about yourself. For financial advisors, this means:

- Features or listings in FTAdviser, Money Marketing, or Professional Adviser
- Mentions in local newspaper business sections
- Listings in professional body directories (PFS, CISI)
- Features in industry award lists
- Mentions in local chamber of commerce content

Each mention is a vote of confidence that AI systems use to calibrate their recommendations.

## What Doesn't Matter (As Much As You Think)

**Your Google search ranking** — A firm can rank #1 on Google for "financial advisor [city]" and still score zero on AI visibility. The signals are different.

**Your social media following** — LinkedIn posts and Twitter activity are largely invisible to AI training data. They matter for engagement, not for AI visibility.

**Paid advertising spend** — Google Ads, VouchedFor sponsorships, and other paid placements do not directly improve AI visibility. AI recommendations are based on organic signals, not advertising.

**Your website design** — A beautiful website doesn't help if it contains generic, undifferentiated content. AI reads text, not visual design.

## The Compound Effect

The most encouraging aspect of AI visibility is that improvements compound. Each piece of content you publish, each review you collect, each directory listing you complete makes the next recommendation more likely.

Firms that start building these signals now will have a significant, self-reinforcing advantage within 3-6 months. The longer you wait, the harder it becomes to catch up with competitors who started earlier.

## Start With Measurement

You cannot improve what you cannot measure. A free AI visibility score shows you where your firm currently stands across the major AI platforms, and a full audit provides the specific, prioritised action plan to improve.

The signals are clear. The question is whether your firm will act on them before your competitors do.
    `.trim(),
  },
  {
    slug: 'ai-search-vs-google-why-your-seo-strategy-wont-save-you',
    title: "AI Search vs Google: Why Your SEO Strategy Won't Save You",
    description: "You can rank #1 on Google and still be invisible to ChatGPT. AI search works differently. Here's what every financial advisor needs to understand.",
    date: '2026-03-04',
    readTime: '7 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Search analytics interface showing performance metrics',
    content: `
If your financial advisory firm has invested in SEO, you might assume you're covered for AI search too. After all, if Google can find you, surely ChatGPT can as well?

Unfortunately, that assumption is wrong. We regularly see firms that rank on the first page of Google for competitive financial advisor keywords yet score zero on AI visibility. The two systems work fundamentally differently, and optimising for one does not guarantee success with the other.

## How Google Search Works

Traditional SEO is about making your website easy for Google's crawler to find, understand, and rank. Google maintains an index of web pages and ranks them based on signals like keyword relevance, backlink authority, page speed, mobile optimisation, and user engagement.

When someone searches "financial advisor in Guildford," Google returns a ranked list of web pages. Your position in that list depends on how well your page matches Google's ranking algorithm.

The output: a list of blue links, with your website somewhere in the results.

## How AI Search Works

AI search is fundamentally different. When someone asks ChatGPT "who is the best financial advisor in Guildford?", the AI doesn't search an index. It draws on its training data — a vast synthesis of web content — to form an opinion about which firms to recommend.

The AI is not returning search results. It is making a recommendation. It is telling the user "based on everything I know, these are the firms you should consider."

This is a crucial distinction. In traditional search, you compete for visibility. In AI search, you compete for recommendation. The signals that win each competition are different.

## Where the Signals Diverge

**Traditional SEO prioritises:**
- Keyword density and placement
- Backlink profiles
- Technical page speed and Core Web Vitals
- Mobile responsiveness
- Click-through rates

**AI visibility prioritises:**
- Content authority and depth
- Citation consistency across multiple platforms
- Review quality and specificity
- Third-party mentions in authoritative sources
- Structured data that AI can parse

A financial advisory firm can have perfect technical SEO — fast loading, mobile-optimised, keyword-rich — and still be invisible to AI if its content is generic, its directory listings are incomplete, and it has few specific client reviews.

Conversely, a firm with a modest website but strong VouchedFor reviews, detailed FTAdviser listings, published thought leadership, and consistent directory citations can score highly on AI visibility despite mediocre Google rankings.

## The Practical Implications for IFAs

If you have been investing in SEO and Google Ads, that investment is not wasted. Traditional search still drives traffic and enquiries. But it is no longer sufficient on its own.

Here is what you need to add to your marketing strategy:

**1. Publish substantial thought leadership content**
Not 300-word blog posts stuffed with keywords. Detailed, authoritative guides about pension transfers, inheritance tax planning, retirement strategies, and market commentary. AI values depth and expertise.

**2. Build your presence across financial directories**
VouchedFor, Unbiased, FTAdviser, the PFS directory, and Google Business Profile. Each listing is a citation that AI uses to validate your expertise and relevance.

**3. Collect specific client reviews**
Reviews that mention what you helped with, not just generic praise. These teach AI to match your firm with specific client needs.

**4. Add FinancialService schema markup**
This is the structured data equivalent of handing AI a business card. It tells AI systems exactly what you do, where you are, and what credentials you hold.

**5. Seek mentions in trade publications**
Being referenced in FTAdviser, Money Marketing, Professional Adviser, or local business press creates the third-party authority signals that AI weights most heavily.

## The Convergence Ahead

Over time, traditional search and AI search will likely converge. Google's AI Overviews are already blending the two approaches. But right now, they are distinct channels that require distinct strategies.

The firms that treat AI visibility as a separate, important marketing channel alongside SEO will capture clients from both discovery paths. The firms that assume SEO covers everything will increasingly lose ground to competitors who are visible in both.

## Know Where You Stand

The first step is measurement. A free AI visibility score shows you how your firm currently appears across AI platforms — and it may surprise you how different the result is from your Google rankings.

Understanding the gap is the beginning of closing it.
    `.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

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
    slug: 'we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible',
    title: "We Tested 149 UK IFA Firms on ChatGPT. 79% Were Invisible.",
    description: "We asked GPT-4o to recommend financial advisers across 10 UK regions. Of 149 real IFA firms, only 32 were ever mentioned. Here's the full breakdown by region.",
    date: '2026-03-09',
    readTime: '8 min read',
    category: 'Research',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Data analytics dashboard showing charts and metrics',
    content: `
We ran 30 real queries against GPT-4o, asking it to recommend independent financial advisers across 10 UK regions. We tested 149 real, FCA-registered IFA firms to see which ones AI would actually mention.

The results were stark.

## The headline number

**79% of UK IFA firms are invisible to AI.**

Of 149 firms tested, only 32 were ever mentioned in any response. The remaining 117 firms never appeared once, no matter how we phrased the question.

## How we tested

We used three prompt variants for each of 10 UK regions (30 queries total):

1. "Can you recommend a good independent financial adviser in [region]?"
2. "Who are the best independent financial advisers in [region]?"
3. "I'm looking for a trusted financial adviser in [region]. Can you suggest some reputable IFA firms?"

These are the kinds of questions real prospective clients type into ChatGPT every day. We recorded every response and checked whether each of our 149 firms was mentioned.

## Results by region

The regional breakdown reveals a clear pattern: the further from London, the worse the visibility.

| Region | Firms tested | Found by AI | Invisible |
|--------|-------------|-------------|-----------|
| London | 25 | 13 | 48% invisible |
| Scotland | 15 | 5 | 67% invisible |
| North East | 7 | 2 | 71% invisible |
| South East | 20 | 4 | 80% invisible |
| South West | 15 | 3 | 80% invisible |
| North West | 18 | 2 | 89% invisible |
| Wales | 10 | 1 | 90% invisible |
| Yorkshire | 15 | 1 | 93% invisible |
| Midlands | 15 | 1 | 93% invisible |
| East Anglia | 9 | 0 | 100% invisible |

East Anglia had zero firms recognised. Not one. The Midlands and Yorkshire were barely better at 93% invisible. Even in London, the most visible region, nearly half of firms were never mentioned.

## The winner-takes-all problem

A handful of large national firms dominate AI recommendations. Chase de Vere appeared in 15 out of 30 queries, half of all responses. Brewin Dolphin appeared in 7. Charles Stanley in 4.

Meanwhile, well-established firms like Investec Wealth, Schroders Personal Wealth, Cazenove Capital, AJ Bell, Mattioli Woods, and Canaccord Genuity were completely invisible. These are not small firms. They manage billions in client assets. Yet AI does not mention them.

This is the winner-takes-all dynamic of AI search. Unlike Google, where you can appear on page two or three, AI gives a short list of recommendations and nothing else. If you are not on that list, you do not exist.

## What the visible firms had in common

The firms that appeared consistently shared clear characteristics:

**1. National brand recognition.** Chase de Vere, Brewin Dolphin, and St. James's Place have the kind of brand presence that appears across hundreds of web sources. AI models absorb this.

**2. Strong content footprint.** Firms that publish thought leadership, guides, and commentary give AI models more material to draw from when forming recommendations.

**3. Consistent citations across platforms.** Complete profiles on directories, industry publications, and review sites. The same firm name and description everywhere.

**4. Structured data and schema markup.** FinancialService schema that tells AI systems exactly what services they offer, where they operate, and their regulatory credentials.

## What the invisible firms had in common

The pattern was equally clear:

- **Generic website copy.** "We provide comprehensive financial planning solutions" could describe any firm in the country. AI cannot distinguish you if you sound like everyone else.
- **Thin or absent directory presence.** No VouchedFor profile, no Unbiased listing, or profiles with minimal information and no reviews.
- **No published content beyond a services page.** No articles, no guides, no FAQs. Nothing for AI to learn from.
- **Regional firms without national signals.** A firm that operates only in one city has far fewer web mentions than a national brand. Without deliberate effort to build online authority, regional firms are structurally disadvantaged.

## Why this matters now

AI search is not a future trend. Over 15 million UK adults already use AI assistants regularly, and adoption among high-net-worth individuals is even higher.

When a prospective client asks ChatGPT for a financial adviser recommendation, the firms that appear get the enquiry. The firms that do not get nothing. There is no page two in AI search.

A single high-net-worth client is worth tens of thousands in lifetime fees. The cost of being invisible is not theoretical. It is real clients going to competitors you have never heard of, simply because AI recommends them and not you.

## The opportunity

The good news: the barrier to entry is currently low. Because so few IFA firms have optimised for AI visibility, the firms that start now can establish a dominant position in their area relatively quickly.

The window will not stay open forever. As awareness grows, competition will increase. AI systems are conservative: once they form a view of which firms to recommend, it takes sustained new evidence to change it. The firms that move first will have an advantage that is very difficult to overcome.

## What you should do

Start by understanding where you stand. A free AI visibility score takes 60 seconds and shows you whether AI platforms are currently recommending your firm.

If you score below 30 (and based on our research, most firms will), the full AI Visibility Audit provides a complete breakdown across all four platforms with a specific, prioritised action plan.

The firms that take this seriously in 2026 will own their local market in AI search for years to come.
    `.trim(),
  },
  {
    slug: 'what-makes-ai-recommend-one-financial-advisor-over-another',
    title: "What Makes AI Recommend One Financial Adviser Over Another?",
    description: "AI platforms don't recommend financial advisers randomly. There are specific signals that determine which firms appear. Here's what actually matters and how to build it.",
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

Being mentioned by authoritative third parties carries more weight than anything you say about yourself. For financial advisers, this means:

- Features or listings in FTAdviser, Money Marketing, or Professional Adviser
- Mentions in local newspaper business sections
- Listings in professional body directories (PFS, CISI)
- Features in industry award lists
- Mentions in local chamber of commerce content

Each mention is a vote of confidence that AI systems use to calibrate their recommendations.

## What Doesn't Matter (As Much As You Think)

**Your Google search ranking.** A firm can rank #1 on Google for "financial advisor [city]" and still score zero on AI visibility. The signals are different.

**Your social media following.** LinkedIn posts and Twitter activity are largely invisible to AI training data. They matter for engagement, not for AI visibility.

**Paid advertising spend.** Google Ads, VouchedFor sponsorships, and other paid placements do not directly improve AI visibility. AI recommendations are based on organic signals, not advertising.

**Your website design.** A beautiful website doesn't help if it contains generic, undifferentiated content. AI reads text, not visual design.

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
    description: "You can rank #1 on Google and still be invisible to ChatGPT. AI search works differently. Here's what every financial adviser needs to understand.",
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

AI search is fundamentally different. When someone asks ChatGPT "who is the best financial advisor in Guildford?", the AI doesn't search an index. It draws on its training data (a vast synthesis of web content) to form an opinion about which firms to recommend.

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

A financial advisory firm can have perfect technical SEO (fast loading, mobile-optimised, keyword-rich) and still be invisible to AI if its content is generic, its directory listings are incomplete, and it has few specific client reviews.

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

The first step is measurement. A free AI visibility score shows you how your firm currently appears across AI platforms, and it may surprise you how different the result is from your Google rankings.

Understanding the gap is the beginning of closing it.
    `.trim(),
  },
  {
    slug: 'is-your-firm-invisible-to-chatgpt-how-ai-is-changing-client-acquisition',
    title: "Is Your Firm Invisible to ChatGPT? How AI Is Changing Client Acquisition for Wealth Managers",
    description: "77% of UK investors believe ChatGPT could give reliable financial advice. But when they ask it for a recommendation, will your firm appear? Most won't.",
    date: '2026-03-05',
    readTime: '8 min read',
    category: 'Research',
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Artificial intelligence concept with digital neural network visualization',
    content: `
Something fundamental has changed in the way prospective clients find financial advisers. For two decades, the playbook was straightforward: build a website, optimise it for Google, and wait for people to search "financial adviser near me." That playbook is now obsolete.

Today, a growing number of high-net-worth individuals are bypassing Google entirely. Instead, they open ChatGPT, Perplexity, or Claude and type something like: "Who are the best independent financial advisers for retirement planning in London?" or "Which UK wealth managers specialise in tax-efficient investing for business owners?"

The answer they receive will shape their shortlist. And for the vast majority of UK financial advice firms, that answer will not include them.

## The Scale of the Shift

The numbers are difficult to ignore. A 2025 survey by Boring Money found that 77% of UK investors believe AI tools like ChatGPT could provide reliable financial guidance. Among investors under 45, that figure rises to 89%. Meanwhile, ChatGPT alone surpassed 300 million weekly active users globally in early 2026, with the UK representing one of its fastest-growing markets.

This is not a fringe behaviour. It is mainstream, and it is accelerating.

Consider what this means in practice. When a potential client with a significant pension pot asks ChatGPT to recommend wealth managers who specialise in drawdown strategies, the AI does not consult a directory. It draws on its training data, its access to the web, and the digital footprint of every firm it can find. If your firm has a thin online presence, generic website copy, and limited thought leadership, you simply do not exist in that conversation.

The first touchpoint is no longer Google. It is AI. And the firms that understand this shift first will secure a disproportionate share of new client enquiries over the next three to five years.

## Why Most Firms Are Invisible

There are roughly 5,000 directly authorised financial advice firms in the UK. The overwhelming majority have websites that were built for human visitors and Google crawlers. They contain the standard pages: about us, our services, contact us, perhaps a blog that has not been updated since 2024.

This approach served firms well in the age of traditional search. But AI models evaluate content differently. When ChatGPT or Perplexity generates a recommendation, it looks for several signals that most IFA websites fail to provide.

**Specificity of expertise.** AI models favour firms that clearly articulate what they specialise in, who they serve, and what outcomes they deliver. A generic statement like "we provide holistic financial planning" gives the AI nothing to work with. A firm that states "we specialise in retirement income planning for NHS consultants and senior doctors" gives the AI a clear, citable reason to recommend them.

**Authority and citations.** AI models weight content that has been referenced, quoted, or cited by other credible sources. Firms that publish original research, contribute to industry publications, or are quoted in the financial press build the kind of authority that AI recognises. Firms that only publish content on their own website, with no external validation, are significantly less likely to appear in AI-generated answers.

**Depth of content.** A 300-word blog post titled "Five Tips for Retirement Planning" adds no value to an AI model that has already consumed thousands of similar articles. What AI models surface is depth: detailed, authoritative content that demonstrates genuine expertise. Think 1,500-word guides on specific tax planning strategies, detailed case studies (anonymised, of course), or data-driven analysis of market trends affecting specific client segments.

**Structured information.** AI models parse structured data more effectively than unstructured prose. Firms that present their credentials, specialisms, fee structures, and client outcomes in clear, well-organised formats are more likely to be understood and cited by AI systems.

## The First-Mover Advantage Is Real

In traditional SEO, catching up to established competitors was always possible. Google re-crawls websites frequently, and a sustained content strategy could improve rankings over time. The competitive dynamics of AI visibility are different, and they favour early movers more heavily.

Here is why. AI models are trained on snapshots of the internet. The content that exists today shapes the answers these models give for months or even years. Firms that establish a strong AI-visible presence now will be embedded in the training data that powers the next generation of AI responses. Firms that wait will find themselves competing not just against other advisers, but against the entrenched position of those who moved first.

There is also a compounding effect. When an AI model recommends a firm, that recommendation generates traffic, press mentions, and further citations, all of which reinforce the firm's position in future AI responses. The rich get richer.

Early data from the US market, where AI adoption in financial services is roughly 12 to 18 months ahead of the UK, supports this. Firms that invested in AI visibility strategies in 2024 are now receiving between 15% and 30% of their new client enquiries through AI-assisted channels. Firms that did not invest are seeing their overall enquiry volumes decline as traditional search traffic erodes.

## What Prospective Clients Actually Ask AI

Understanding the types of queries prospective clients are putting to AI tools is essential for any firm that wants to become visible. Based on analysis of AI query patterns in the UK financial services space, the most common categories include:

- **Adviser discovery.** "Who are the best financial advisers in [city/region]?" or "Which IFAs specialise in [specific need]?" These are direct recommendation queries, and AI models will name specific firms if they have sufficient data to do so.

- **Service comparison.** "What is the difference between a financial adviser and a wealth manager?" or "Should I use a restricted or independent adviser?" These queries allow AI to cite firms that have published clear, authoritative explanations of these distinctions.

- **Problem-solving.** "How should I invest a £500,000 inheritance?" or "What are the most tax-efficient ways to pass on wealth?" These queries give AI an opportunity to recommend firms that have demonstrated expertise in these specific areas.

- **Due diligence.** "Is [firm name] a good financial adviser?" or "What do clients say about [firm name]?" These queries pull from reviews, testimonials, press mentions, and any publicly available information about a specific firm.

The firms that appear in these AI-generated answers share common characteristics: they have deep, specific content on their websites; they are mentioned or cited by credible third-party sources; and they have a clear, differentiated positioning that gives the AI a reason to recommend them over thousands of alternatives.

## The Convergence of Regulation and AI

The FCA's Consumer Duty, which came into full force in 2024, has pushed firms to demonstrate better client outcomes and clearer communication. This regulatory pressure, somewhat inadvertently, aligns with what AI models reward.

Firms that have invested in clear, jargon-free content that explains their services, fees, and client outcomes in plain English are not only meeting their regulatory obligations but also building the kind of content that AI models can parse, understand, and cite. There is a genuine opportunity here for compliance-driven content to serve a dual purpose.

Conversely, firms that treat their website as a regulatory tick-box exercise, with dense legal language and minimal substantive content, are failing on both fronts: they are not meeting the spirit of Consumer Duty, and they are invisible to AI.

## The Cost of Inaction

The financial advice profession has weathered multiple waves of change: RDR, pension freedoms, Consumer Duty. Each time, the firms that adapted earliest gained a lasting advantage. The AI shift is no different in this respect, but it is moving faster than any previous disruption.

Consider the trajectory. In 2024, AI-assisted search was a curiosity. By 2025, it was a meaningful channel. In 2026, it is becoming a primary channel for a significant and growing segment of prospective clients. By 2027, firms that are invisible to AI will be relying entirely on referrals and existing client relationships for growth. That is a viable strategy, but one that places a hard ceiling on scale.

The firms that will thrive over the next decade are those that recognise AI visibility as a core part of their client acquisition strategy. Not a marketing gimmick, but a fundamental shift in how prospective clients discover, evaluate, and choose their financial adviser.

## What You Can Do Today

The first step is understanding where you stand. Before investing in content, restructuring your website, or engaging a marketing agency, you need to know how visible your firm currently is to the AI platforms that prospective clients are actually using.

This is not something you can determine by asking ChatGPT about yourself once. AI visibility depends on multiple factors across multiple platforms, and a single query gives you an incomplete and potentially misleading picture.

If you want a clear, data-driven assessment of how your firm appears across ChatGPT, Perplexity, Claude, and Google AI, and where the specific gaps are, you can check your firm's AI visibility score for free at Presenzia. It takes less than 60 seconds, and the results may challenge your assumptions about how visible you truly are.
    `.trim(),
  },
  {
    slug: 'geo-vs-seo-why-google-rankings-are-no-longer-enough-for-financial-advisers',
    title: "GEO vs SEO: Why Google Rankings Are No Longer Enough for Financial Advisers",
    description: "There's less than 30% overlap between Google's top results and AI-generated answers for financial queries. A new discipline called GEO is emerging, and most advisers haven't heard of it.",
    date: '2026-03-07',
    readTime: '9 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Digital marketing analytics dashboard showing search performance data',
    content: `
For the past 15 years, SEO has been the dominant framework for how financial advice firms think about online visibility. Rank well on Google, and clients will find you. It was simple, measurable, and effective. And for many firms, it still generates results.

But a new discipline is emerging that most financial advisers have never heard of: GEO, or Generative Engine Optimisation. It addresses a fundamentally different challenge: how to ensure your firm appears in the answers generated by AI tools like ChatGPT, Perplexity, Claude, and Google's own AI Overviews.

The distinction matters enormously, because research consistently shows there is less than 30% overlap between the sources that rank well on traditional Google search and the sources that AI models cite when generating answers. A firm that ranks number one on Google for "independent financial adviser London" may score zero across every major AI platform.

Understanding the difference between SEO and GEO, and why both now matter, is essential for any IFA or wealth management firm serious about client acquisition in 2026 and beyond.

## What Is Generative Engine Optimisation?

GEO is the practice of optimising your firm's digital presence so that AI-powered answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews, and others) reference, cite, or recommend your firm when users ask relevant questions.

Where SEO focuses on ranking in a list of blue links, GEO focuses on being selected as a source within an AI-generated narrative. The distinction is critical. In a traditional Google search, users see ten results and choose which to click. In an AI-generated answer, the model has already made that choice for them. It has selected which firms, which articles, and which data points to include in its response. If your firm is not selected, there is no "page two" to scroll to. You simply do not exist.

The term GEO was first coined in academic research from Princeton, Georgia Tech, the Allen Institute for AI, and IIT Delhi in late 2023, and has since gained significant traction among digital marketing professionals. But within financial services, particularly among UK IFAs, awareness remains extremely low.

## Why Google Rankings and AI Citations Diverge

To understand why a strong Google ranking does not guarantee AI visibility, you need to understand how these systems evaluate content differently.

**Google's ranking algorithm** weighs hundreds of factors, but at its core, it prioritises backlinks (how many other websites link to you), domain authority (the overall strength of your website), technical SEO (page speed, mobile responsiveness, structured data), and keyword relevance. A firm with a well-optimised website and strong backlink profile can rank well even if its content is relatively generic.

**AI models evaluate content differently.** When ChatGPT or Perplexity generates an answer, it is not ranking pages. It is synthesising information from multiple sources into a single coherent response. The factors that influence which sources get cited include:

- **Specificity and depth.** AI models prefer sources that provide detailed, specific information over generic overviews. A 2,000-word guide on "inheritance tax planning for business owners selling a company" is far more likely to be cited than a 400-word page titled "Our Tax Planning Services."

- **Factual density.** Content that includes specific data points, statistics, regulatory references, and concrete examples gives AI models material to cite. Vague, high-level content does not.

- **Authority signals beyond backlinks.** While backlinks matter for SEO, AI models also assess authority through mentions in credible publications, consistency of information across sources, author credentials, and the presence of original research or data.

- **Content structure.** AI models parse well-structured content more effectively. Clear headings, defined sections, and logical information architecture help AI systems extract and cite relevant passages.

- **Freshness and relevance.** AI models with web access prioritise recent, up-to-date content. A blog post from 2021 about pension rules that have since changed will be deprioritised in favour of current, accurate information.

This divergence in evaluation criteria explains the less-than-30% overlap. A firm might have excellent backlinks and strong technical SEO, enough to rank well on Google, while simultaneously lacking the depth, specificity, and authority signals that AI models require.

## The Practical Differences for Financial Advisers

Let us make this concrete with an example relevant to most IFAs.

**The SEO approach to pension planning content** might involve creating a page titled "Pension Planning Services," optimising it for keywords like "pension adviser" and "retirement planning UK," building backlinks from directories and local business sites, and ensuring the page loads quickly on mobile devices. This approach can absolutely achieve a strong Google ranking.

**The GEO approach to the same topic** would involve publishing a comprehensive guide on "How the 2025/26 pension annual allowance changes affect high earners," including specific calculations, worked examples, and references to HMRC guidance. It would involve being quoted in an industry publication like FTAdviser or Money Marketing on this topic. It would mean publishing original analysis, perhaps aggregated, anonymised data from your own client base showing how many clients are affected by the tapered annual allowance. And it would mean structuring this information so that AI models can easily extract key facts and attribute them to your firm.

The SEO approach gets you clicks from Google. The GEO approach gets you cited by AI. In 2026, you need both.

## Five GEO Strategies for UK Financial Advisers

Based on emerging research and early data from firms that have begun optimising for AI visibility, here are five practical strategies that IFAs and wealth managers should consider.

**1. Develop deep, niche content around your specialisms.**

The single most effective GEO strategy is to create authoritative content that goes significantly deeper than what is widely available online. AI models are essentially looking for the best possible source to cite on any given topic. If your firm publishes the most detailed, accurate, and current guide to a specific financial planning challenge, AI models will find it and cite it.

This means moving away from generic content calendars filled with "Five Tips for..." articles. Instead, identify two or three areas where your firm has genuine expertise and create definitive resources on those topics. If you specialise in advising medical professionals, publish detailed guides on NHS pension schemes, locum tax planning, and medical partnership structures. If you focus on business owners, create comprehensive content on EMI schemes, entrepreneurs' relief (now business asset disposal relief), and exit planning strategies.

**2. Build external authority through earned media.**

AI models weight third-party mentions heavily. Being quoted in the Financial Times, cited in a Professional Adviser article, or referenced in an FCA discussion paper signals to AI systems that your firm is a credible authority.

This does not require a six-figure PR budget. Contributing expert commentary to trade publications, participating in industry research, speaking at conferences (which generates online mentions), and building relationships with financial journalists are all accessible strategies for most firms.

**3. Optimise for entities, not just keywords.**

Traditional SEO thinks in terms of keywords: specific phrases that users type into Google. GEO thinks in terms of entities: the people, organisations, concepts, and relationships that AI models understand.

For a financial advice firm, this means ensuring that AI models understand your firm as an entity: what it does, who it serves, where it operates, who the key people are, and what makes it distinctive. This requires consistent information across your website, LinkedIn profiles, Companies House listing, FCA register entry, directory listings, and any other online presence. Inconsistencies confuse AI models and reduce your chances of being cited.

**4. Publish original data and research.**

Nothing attracts AI citations like original data. If your firm can publish proprietary insights (anonymised trends from your client base, analysis of local property markets, research on retirement spending patterns among your clients) you create content that AI models cannot find anywhere else.

This does not need to be academically rigorous. A simple analysis like "We reviewed 200 retirement plans for clients in the South East and found that 67% had not accounted for the impact of inflation on their target income" is the kind of specific, data-driven insight that AI models are designed to surface.

**5. Structure your content for AI extraction.**

AI models are sophisticated, but they still benefit from well-structured content. Use clear headings that describe what each section contains. Include summary statements at the beginning or end of detailed sections. Present key facts and figures in formats that are easy to parse. Define technical terms when you first use them.

Think of it this way: if an AI model reads your content and needs to extract a single paragraph to answer a user's question, how easy is it to find the right paragraph? The easier you make this, the more likely your content will be cited.

## Why You Cannot Afford to Choose One Over the Other

Some firms may be tempted to abandon SEO in favour of GEO. This would be a mistake. Google still processes billions of searches daily, and traditional search remains a significant source of client enquiries. The firms that will perform best are those that develop an integrated strategy addressing both.

The good news is that many GEO strategies also benefit SEO. Deep, authoritative content tends to rank well on Google. External media mentions generate backlinks. Well-structured content improves both AI comprehension and user experience. The two disciplines are complementary, not competing.

The bad news is that most financial advice firms are currently doing neither well. Their websites contain thin, generic content that neither ranks strongly on Google nor registers with AI models. The gap between firms that invest in both SEO and GEO and those that invest in neither will widen significantly over the next two to three years.

## Measuring Your GEO Performance

One of the challenges with GEO is measurement. With SEO, you can track rankings, traffic, and conversions using well-established tools. GEO measurement is less mature, but it is developing rapidly.

The most direct approach is to systematically query the major AI platforms with the types of questions your prospective clients are likely to ask, and assess whether your firm appears in the responses. This needs to be done across multiple platforms (ChatGPT, Perplexity, Claude, and Google AI Overviews) because each model may surface different sources for the same query.

If you want to understand how your firm currently performs across these AI platforms without manually testing dozens of queries, Presenzia offers a free AI visibility score that analyses your firm's presence across the major generative engines. It is a useful starting point for understanding where you stand and where the gaps are before developing your GEO strategy.
    `.trim(),
  },
  {
    slug: 'zero-click-searches-what-ai-overviews-mean-for-ifa-websites',
    title: "60% of Searches Now End Without a Click: What AI Overviews Mean for IFA Websites",
    description: "Google's AI Overviews appear on over half of financial FAQ queries. Website traffic across industries is down 33%. Here's what UK financial advisers need to understand about zero-click search.",
    date: '2026-03-10',
    readTime: '7 min read',
    category: 'Research',
    heroImage: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Person using smartphone to search for information online',
    content: `
There is a quiet crisis unfolding for firms that depend on website traffic for client acquisition, and most UK financial advisers are not yet aware of it.

The crisis has a name: zero-click search. It refers to searches where the user gets the information they need directly on the search results page (from featured snippets, knowledge panels, or increasingly, AI-generated overviews) without ever clicking through to a website.

In 2023, approximately 56% of Google searches ended without a click to any website. By late 2025, that figure had risen to 65%. Current estimates for early 2026 place it closer to 69% for informational queries. For financial services queries specifically, the impact is even more pronounced.

This is not a minor trend. It is a structural shift in how search works, and it has direct implications for every IFA and wealth management firm that relies on its website as a client acquisition channel.

## What Are Google AI Overviews?

Google AI Overviews (formerly known as Search Generative Experience or SGE) are AI-generated summaries that appear at the top of Google search results for many queries. Rather than presenting a list of links and letting users choose which to visit, Google now synthesises information from multiple sources into a comprehensive answer displayed directly on the results page.

For a query like "what is the pension annual allowance for 2025/26," Google no longer simply shows links to HMRC, pension providers, and financial advice firms. Instead, it generates a detailed answer that includes the current allowance figure, how tapering works for high earners, and relevant context, all without the user needing to visit any website.

Research from authoritative SEO sources indicates that AI Overviews now appear on approximately 54% of financial FAQ queries in the UK. These include questions about pension rules, ISA allowances, inheritance tax thresholds, capital gains tax rates, and other topics that financial advice firms have traditionally used as entry points to attract website visitors.

The implications are significant. If Google is answering these questions directly, the traditional strategy of publishing educational content to attract search traffic and convert visitors into enquiries is fundamentally undermined.

## The Traffic Impact Is Already Measurable

This is not a theoretical concern. Website analytics data from across industries shows that organic traffic from Google has declined by an average of 33% for informational queries since the widespread rollout of AI Overviews. For financial services firms specifically, the decline is concentrated in exactly the content categories that most IFAs rely on: educational articles about tax rules, pension regulations, and investment basics.

Consider a typical IFA website's content strategy. The firm publishes articles on topics like "How much can I pay into my pension in 2025/26?" or "What is the inheritance tax nil-rate band?" These articles are designed to rank on Google, attract visitors, demonstrate expertise, and convert a percentage of those visitors into enquiry form submissions or phone calls.

When Google AI Overviews answer these questions directly on the search results page, the user has no reason to click through to the firm's website. The firm's article might still rank on page one, but below an AI Overview that has already satisfied the user's query. The click never happens. The visitor never arrives. The enquiry never materialises.

For firms that have invested heavily in SEO-driven content marketing, this represents a significant erosion of their primary digital acquisition channel.

## From "Getting Found" to "Being Cited"

The zero-click phenomenon forces a fundamental rethinking of what online visibility means for financial advisers. In the traditional model, the goal was to get found: to appear in search results so that users would click through to your website. In the emerging model, the goal is to get cited: to be the source that Google AI Overviews, ChatGPT, Perplexity, and other AI systems reference when generating their answers.

This is a crucial distinction. When Google generates an AI Overview about pension planning, it cites specific sources. Those citations appear as small links within the AI-generated text. While these citations generate fewer clicks than traditional search results, they carry significant weight: users who do click through from an AI citation tend to be more engaged, more qualified, and further along in their decision-making process.

More importantly, being cited by AI systems, whether Google's AI Overviews or standalone AI tools like ChatGPT, functions as a form of endorsement. When an AI system references your firm or your content as a source, it signals authority and credibility in a way that a simple search ranking does not.

The firms that will thrive in a zero-click world are those that shift their strategy from "creating content that ranks" to "creating content that AI systems want to cite."

## Why Financial Advice Is Particularly Affected

Not all industries are equally impacted by zero-click search. Financial advice is disproportionately affected for several reasons.

**High proportion of informational queries.** Many people searching for financial topics are seeking information, not immediately looking to hire an adviser. Queries like "how does pension drawdown work" or "what is the capital gains tax rate" are purely informational, and these are precisely the queries that AI Overviews handle most effectively.

**Regulatory complexity creates ideal AI Overview territory.** Financial regulations are factual, specific, and relatively straightforward for AI to summarise accurately. Tax thresholds, allowance limits, and regulatory requirements are exactly the type of content that AI Overviews present well, reducing the need for users to visit specialist websites.

**The long consideration cycle.** Financial advice is a high-stakes, considered purchase. Prospective clients typically research extensively before making contact. In the past, this research drove multiple website visits. Now, much of that research happens within AI-generated answers, and the prospective client may narrow their shortlist before ever visiting a firm's website.

**Commoditised educational content.** Hundreds of financial advice firms publish near-identical content about pension rules, ISA allowances, and tax planning basics. When multiple sources say essentially the same thing, AI systems have little reason to direct users to any particular firm's version. The content is treated as common knowledge, summarised by the AI, and no individual firm benefits.

## Practical Steps to Adapt Your Strategy

Understanding the problem is the first step. Adapting your firm's digital strategy to the reality of zero-click search is the next. Here are the approaches that are proving most effective for forward-thinking financial advice firms.

**1. Shift from educational basics to proprietary insights.**

Stop competing with every other IFA to explain what the pension annual allowance is. AI Overviews handle that better than any individual firm's blog post ever could. Instead, invest your content budget in insights that only your firm can provide.

This might include analysis of how regulatory changes specifically affect your client base, anonymised case studies showing how you solved complex planning challenges, or commentary on market trends from your firm's particular perspective. This type of content cannot be commoditised or summarised away by an AI Overview, because it is unique to your firm.

**2. Optimise for citation, not just ranking.**

Structure your content so that AI systems can easily extract and cite specific passages. This means including clear, factual statements supported by data. It means attributing insights to named individuals within your firm (AI systems cite people, not just websites). And it means ensuring your content includes specific, verifiable information rather than vague generalities.

When you publish a piece of analysis, ask yourself: "If an AI system were answering a question about this topic, is there a specific sentence or paragraph in this article that it would want to cite?" If the answer is no, the content needs to be more specific.

**3. Build authority beyond your own website.**

AI systems, including Google's AI Overviews, weight third-party sources heavily when deciding what to cite. A firm that is mentioned in the Financial Times, quoted in FTAdviser, or referenced in an industry research report is far more likely to be cited in AI-generated answers than a firm whose expertise exists only on its own website.

Pursue opportunities to contribute expert commentary to trade publications, participate in industry surveys and research, and build a profile for your firm's key people on platforms that AI models monitor. LinkedIn, in particular, has become a significant source for AI systems seeking expert perspectives.

**4. Focus on conversion, not just traffic.**

If overall website traffic is declining due to zero-click search (and it almost certainly is) the response should not be solely to try to recapture that traffic. It should also be to maximise the value of the traffic you do receive.

Review your website's conversion paths. Are there clear, compelling calls to action on every page? Is it easy for a visitor to request a consultation? Do you offer value exchanges (like downloadable guides or assessment tools) that capture contact details? A 33% decline in traffic is far less damaging if you simultaneously improve your conversion rate from 1% to 3%.

**5. Diversify your acquisition channels.**

Zero-click search is a reminder that over-reliance on any single acquisition channel is risky. Firms that supplement search-driven traffic with referral programmes, strategic partnerships, social media presence, and direct outreach are better positioned to weather the ongoing decline in organic search traffic.

## The Urgency of Understanding Your Position

The shift to zero-click search is not coming. It is here. Every month that passes sees AI Overviews appearing on more queries, covering more topics, and providing more comprehensive answers. The window for financial advice firms to adapt their strategies is narrowing.

The firms that will navigate this transition successfully are those that understand their current position clearly: how much of their traffic comes from queries that AI Overviews now answer, how visible they are across AI platforms, and where the specific opportunities exist to become a cited source rather than a bypassed search result.

If you are unsure where your firm stands in this new landscape, Presenzia's free AI visibility score can help you understand how your firm appears across ChatGPT, Perplexity, Claude, and Google AI, giving you a clear picture of your current position and the areas where improvement would have the greatest impact on your client acquisition pipeline.
    `.trim(),
  },
  {
    slug: 'the-great-wealth-transfer-why-next-generation-clients-will-find-advisers-through-ai',
    title: "The Great Wealth Transfer: Why the Next Generation Will Find Their Adviser Through AI, Not Google",
    description: "£7 trillion will change hands over the next 30 years, and two-thirds of heirs plan to switch wealth managers. The next generation of clients won't be googling. They'll be asking ChatGPT.",
    date: '2026-03-12',
    readTime: '8 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Financial planning documents and charts on a modern desk',
    content: `
The largest intergenerational wealth transfer in British history is already underway. Over the next three decades, an estimated £7 trillion will pass from baby boomers to their children and grandchildren. For IFAs and wealth managers, this represents both an extraordinary opportunity and an existential threat.

The threat is simple: research consistently shows that between 60% and 70% of heirs change financial adviser after inheriting wealth. Your best client relationships, built over decades, are statistically unlikely to survive the generational handover.

The opportunity is equally clear. Millions of newly wealthy individuals will be actively searching for financial advice, many for the first time. The firms that capture even a fraction of this transfer will define the next era of UK wealth management.

But here is the critical question most firms are not asking: **how will these new clients actually find their next adviser?**

## The Search Behaviour Shift Nobody Is Talking About

When a 55-year-old inherits their parents' estate, they do not behave like their parents did. They do not phone a friend for a recommendation. They do not look up advisers in a professional directory. And increasingly, they do not even type a query into Google.

They ask an AI.

A 2025 study by Capgemini found that Gen X and Millennial high-net-worth individuals are three times more likely than baby boomers to use AI-powered tools when making financial decisions. Separate research from Accenture showed that 67% of affluent consumers under 50 have used a conversational AI tool (such as ChatGPT, Copilot, or Gemini) to research financial services in the past 12 months.

This is not a future trend. It is current behaviour. And it is accelerating.

When someone asks ChatGPT "Who are the best independent financial advisers in Surrey for inheritance tax planning?", the AI does not return a list of ten blue links. It provides a curated, authoritative answer, typically naming three to five firms with a brief explanation of why each was recommended.

If your firm is not among those recommendations, you are invisible to a growing segment of the wealthiest prospective clients in the country.

## Why Referrals Alone Will Not Survive the Transfer

The traditional advisory model relies heavily on referral networks. A satisfied client introduces a colleague. A solicitor recommends a trusted adviser. An accountant passes along a name. This model has served the industry well for decades, and it will not disappear overnight.

But it is fundamentally inadequate for the wealth transfer.

Consider the dynamics. When an adult child inherits wealth, they are often geographically distant from their parents' adviser. They may live in a different city or even a different country. Their parents' professional network (the solicitor, the accountant, the golf club contact) is not their network.

More importantly, the inheriting generation has different expectations around how they discover and evaluate professional services. They are accustomed to researching independently before making contact. They read reviews. They compare options online. And now, they consult AI.

A 2025 survey by Schroders found that only 23% of inheritors contacted their parents' existing wealth manager as a first step. The majority began their search online, with a growing proportion using AI-assisted search as their primary discovery method.

The referral pipeline that sustains most advisory firms today will narrow significantly as the wealth transfer accelerates. Firms that rely solely on word-of-mouth are building on a foundation that is actively eroding.

## What AI Recommendations Actually Look Like

To understand the opportunity, you need to understand how AI recommendations work in practice.

When a prospective client asks an AI tool for adviser recommendations, the AI synthesises information from across the internet. It draws on firm websites, Google Business profiles, client reviews, directory listings, published content, regulatory records, and professional profiles. It then constructs a response that typically includes:

- **Named firms** with a brief description of their specialisms
- **Geographic relevance** based on the user's location or stated preference
- **Social proof** drawn from reviews and testimonials
- **Differentiation** highlighting what makes each firm distinctive

The AI is not making random selections. It is evaluating which firms have the strongest, most consistent, and most authoritative digital presence across multiple sources. Firms with thin or inconsistent online profiles are systematically excluded.

This means that AI visibility is not a marketing nice-to-have. It is rapidly becoming the primary gateway through which the next generation of wealthy clients will discover their adviser.

## The Convergence That Creates Urgency

Two trends are converging in a way that demands immediate attention from forward-thinking advisory firms.

**Trend one: the wealth transfer is accelerating.** The Office for National Statistics projects that inheritance receipts in the UK will increase by over 60% in real terms over the next 15 years. The volume of people actively searching for new financial advisers will grow substantially year on year.

**Trend two: AI adoption is accelerating faster.** ChatGPT reached 100 million users faster than any technology in history. Google has integrated AI overviews into its search results. Microsoft Copilot is embedded in the tools millions of professionals use daily. The proportion of people who use AI as a research tool is growing month on month, not year on year.

The intersection of these trends creates a narrow window. Firms that establish strong AI visibility now will compound that advantage over the coming years, capturing a disproportionate share of new client enquiries as both trends accelerate.

Firms that wait will find the gap increasingly difficult to close. AI systems develop persistent associations between queries and recommended firms. Early movers build a self-reinforcing advantage: more visibility leads to more engagement, which leads to more data, which leads to more visibility.

## What the Next Generation Actually Wants

Understanding how inheritors search is only half the equation. Understanding what they search for reveals why AI visibility matters even more than traditional SEO.

Research from EY's 2025 Global Wealth Management Report identified the top priorities for next-generation wealth clients:

1. **Transparency on fees:** they want to understand exactly what they are paying
2. **Specialisation:** they prefer advisers who demonstrate expertise in their specific situation
3. **Digital-first communication:** they expect portals, apps, and responsive digital service
4. **Values alignment:** ESG considerations and ethical investing matter more to younger inheritors
5. **Evidence of competence:** they want proof, not promises

When these individuals ask an AI for recommendations, the AI evaluates firms against precisely these criteria. A firm whose website clearly explains its fee structure, whose content demonstrates deep expertise in inheritance planning, and whose reviews reference excellent digital service will be recommended repeatedly.

A firm with a generic brochure website and no client reviews will not appear at all.

## Five Actions Firms Should Take Now

The wealth transfer is not a theoretical future event. It is happening today, and the firms that act now will benefit disproportionately. Here are five practical steps to position your firm for this opportunity.

**1. Audit your AI visibility immediately.** Before you can improve your position, you need to understand where you stand. Test what happens when someone asks ChatGPT or Gemini to recommend advisers in your area or specialism. The results may surprise you.

**2. Build content around inheritance and intergenerational planning.** The clients you want to attract are dealing with specific, complex situations. Content that addresses inheritance tax planning, trust structures, estate consolidation, and the emotional aspects of managing inherited wealth will signal relevance to both AI systems and prospective clients.

**3. Strengthen your review presence.** AI tools weigh client reviews heavily when making recommendations. If you have no reviews, or only a handful, you are at a significant disadvantage. Establish a systematic process for requesting and publishing client testimonials across Google, VouchedFor, and other relevant platforms.

**4. Ensure consistency across every digital touchpoint.** AI systems cross-reference information from multiple sources. If your firm name, services, or contact details are inconsistent between your website, Google Business profile, FCA register entry, LinkedIn, and directory listings, the AI's confidence in recommending you decreases. Consistency builds trust, not just with humans, but with algorithms.

**5. Develop a clear proposition for next-generation clients.** If your website and content speak exclusively to retirees, you will not be recommended to a 45-year-old who has just inherited £500,000. Consider how your messaging, service offering, and digital experience appeal to younger, digitally native clients without alienating your existing base.

## The Window Is Open, But Not Forever

The great wealth transfer will unfold over decades, but the window to establish AI visibility advantage is measured in months, not years. AI systems are forming their understanding of the advisory landscape right now. The firms that are visible, authoritative, and well-reviewed today are building compound advantages that will be extremely difficult to replicate later.

This is not about chasing a trend. It is about recognising a fundamental shift in how the next generation of wealthy clients will discover, evaluate, and choose their financial adviser. The firms that understand this shift and act on it will capture a disproportionate share of the largest wealth transfer in British history.

The firms that do not will be left wondering where the next generation went.

If you want to understand where your firm stands in this new landscape, check your free AI visibility score at Presenzia. It takes 30 seconds and shows you exactly how AI tools like ChatGPT and Gemini currently perceive your firm, and what you can do about it.
    `.trim(),
  },
  {
    slug: 'google-reviews-are-your-ai-strategy-how-reviews-determine-chatgpt-recommendations',
    title: "Your Google Reviews Are Your AI Strategy: How Reviews Determine Whether ChatGPT Recommends Your Firm",
    description: "Only 9% of UK financial advisers have published client reviews online. Yet reviews are the single biggest factor AI tools use when deciding which firms to recommend. Here's the opportunity.",
    date: '2026-03-14',
    readTime: '7 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Customer rating and review concept with star ratings on digital screen',
    content: `
When ChatGPT recommends a financial adviser, it does not flip a coin. It does not pick firms at random from the FCA register. It evaluates evidence, and the single most influential type of evidence it considers is client reviews.

This creates a striking problem for the UK advisory profession. According to analysis of FCA-registered firms, only around 9.3% of independent financial advisers in the UK have published client reviews on any major platform. Fewer than 5% have more than ten reviews.

In an industry where trust is everything, the overwhelming majority of firms have zero publicly visible proof that their clients trust them at all.

For traditional marketing, this was a missed opportunity. For AI visibility, it is a critical gap, and for the small number of firms willing to act, it represents one of the easiest competitive advantages available in financial services today.

## Why AI Tools Prioritise Reviews Above Almost Everything Else

To understand why reviews matter so much to AI, you need to understand how large language models construct recommendations.

When someone asks ChatGPT "Who are the best financial advisers in Manchester?", the AI does not simply search the web in real time. It draws on a vast corpus of training data and, depending on the tool, supplements this with live web retrieval. It then evaluates multiple signals to determine which firms deserve a recommendation.

These signals include website content, directory listings, professional credentials, published articles, and social media presence. But reviews occupy a uniquely powerful position in this evaluation for three reasons.

**First, reviews are third-party validation.** A firm can claim anything on its own website. Reviews represent independent evidence from real clients. AI systems are trained to weight third-party validation more heavily than first-party claims, because this mirrors how humans evaluate trustworthiness.

**Second, reviews contain natural language that matches user queries.** When a client writes "They helped us with our retirement planning and made the whole process stress-free," that review contains exactly the kind of language a prospective client would use when asking an AI for help. This natural language alignment makes reviewed firms more likely to surface for relevant queries.

**Third, reviews provide specificity.** A firm's website might say "We offer comprehensive financial planning." A review might say "They restructured our pensions, set up a junior ISA for our daughter, and saved us £12,000 in inheritance tax." AI systems favour specific, detailed information over generic claims.

The result is that firms with a strong body of detailed, genuine client reviews are dramatically more likely to appear in AI recommendations than firms without them, regardless of how polished their website might be.

## The 9% Opportunity

The fact that over 90% of UK advisers have no published reviews creates an extraordinary window. In most industries, building a competitive advantage through reviews requires outperforming hundreds of well-reviewed competitors. In UK financial advice, you need only outperform near-total silence.

Consider the maths. If you practise in a city with 200 registered IFAs, roughly 18 of them have any reviews at all. Perhaps five have more than ten reviews. If your firm accumulates 20 or 30 genuine, detailed client reviews, you are likely to have the strongest review profile of any adviser in your area.

That strength translates directly into AI visibility. When a prospective client asks an AI for adviser recommendations in your area, the AI will disproportionately favour firms it can verify through third-party evidence. Your reviews become your proof, and in a landscape where proof is scarce, even a modest review presence creates outsized impact.

This will not last forever. As awareness grows, more firms will begin actively collecting reviews. The competitive advantage available today, being among the first in your area to build a serious review presence, will diminish over time. But the firms that move early will benefit from compound effects that are extremely difficult for latecomers to replicate.

## Which Platforms Matter Most

Not all review platforms carry equal weight with AI systems. The platforms that matter most are those that AI tools can readily access, that carry broad public trust, and that have high domain authority.

**Google Business Profile** is the single most important platform. Google reviews are publicly accessible, widely trusted, and deeply integrated into the data sources that AI systems draw upon. If you do nothing else, build your Google review presence.

**VouchedFor** occupies a unique position in UK financial services. As the leading specialist review platform for advisers, it carries sector-specific authority. AI systems recognise VouchedFor as a credible, regulated source of adviser reviews, and firms with strong VouchedFor profiles frequently appear in AI recommendations for UK-specific queries.

**Trustpilot** carries significant general authority and is well-known to AI systems, though it is less commonly associated with financial advice specifically.

**Unbiased** and other professional directories contribute to your overall digital footprint, though their direct impact on AI recommendations is secondary to Google and VouchedFor.

The ideal strategy is to build primary strength on Google and VouchedFor while maintaining a consistent presence across other relevant platforms. This creates multiple data points that reinforce each other, increasing the AI's confidence in recommending your firm.

## The Difference Between a Review and an AI-Optimised Review

Here is where most guidance on reviews falls short. Getting a review is valuable. Getting the right kind of review is transformative.

A generic review ("Great service, would recommend") is better than nothing, but it gives AI systems very little to work with. It contains no specific information about what the firm does, who it serves, or what outcomes it delivers.

An AI-optimised review naturally includes the details that help AI systems match your firm to relevant queries. Consider the difference:

- **Generic:** "Really happy with the service. Very professional team."
- **Detailed:** "After inheriting from my parents, I needed help understanding my options for inheritance tax planning. The team reviewed our entire financial position, consolidated three old pensions, and put together a plan that gives us confidence for the next 20 years. They specialise in working with clients who have recently inherited and it really showed."

The second review contains multiple signals that an AI system can use: inheritance, IHT planning, pension consolidation, long-term planning, specialism in inherited wealth. When a prospective client asks an AI about advisers who help with inherited wealth, the firm with the second type of review is far more likely to be recommended.

Crucially, this is not about fabricating reviews or coaching clients to use specific keywords. It is about asking the right questions when requesting feedback, questions that naturally prompt detailed, specific responses.

## How to Ask Clients for Reviews That Actually Help

The single biggest barrier to collecting reviews is that most advisers either do not ask, or ask in a way that produces minimal results. Here is a practical framework that consistently generates detailed, useful reviews.

**1. Ask at the right moment.** The best time to request a review is immediately after a significant milestone: completing a financial plan, resolving a complex tax issue, finalising a retirement strategy. The client's positive experience is fresh, and they can speak to specific outcomes.

**2. Make it personal, not automated.** A personal email or conversation is dramatically more effective than an automated request. "I would really value your honest feedback on our work together" generates far better responses than a generic survey link.

**3. Provide gentle prompts that encourage specificity.** Rather than asking "Could you leave us a review?", try: "It would be really helpful if you could share a few words about what brought you to us, what we worked on together, and how you felt about the process." This naturally guides clients toward the kind of detailed, AI-relevant review that creates compound value.

**4. Make the process effortless.** Send a direct link to your Google review page. Provide clear, simple instructions. Remove every possible point of friction. The fewer clicks required, the higher your conversion rate.

**5. Respond to every review.** When clients see that you read and respond to reviews, they are more likely to leave one themselves. Responses also add additional content to your review profile, creating more signals for AI systems to evaluate.

## The Compound Effect of Reviews on AI Visibility

Reviews do not operate in isolation. They create compound effects that strengthen your overall AI visibility in ways that are greater than the sum of their parts.

**Reviews improve your website's relevance.** When AI systems see consistent themes across your reviews and your website content (for example, both referencing retirement planning expertise) the alignment increases confidence in recommending you for those topics.

**Reviews strengthen your Google Business Profile.** A well-reviewed Google profile ranks higher in local search, which in turn increases the likelihood that AI systems with web access will discover and reference your firm.

**Reviews generate natural language data.** Every review adds to the corpus of text associated with your firm. Over time, this creates a rich, diverse body of content that helps AI systems understand your firm's strengths, specialisms, and client base with increasing precision.

**Reviews build social proof that encourages more reviews.** Prospective clients who see existing reviews are more likely to become clients, and satisfied clients who see that others have left reviews are more likely to leave their own. This creates a virtuous cycle that accelerates over time.

The firms that start building their review presence today will benefit from these compound effects for years to come. Each review makes the next one easier to obtain and more impactful when published.

## Addressing the Compliance Question

Some advisers hesitate to pursue reviews because of concerns about FCA regulations regarding testimonials and endorsements. This is an understandable concern, but the regulatory position is clearer than many assume.

Since the FCA's Consumer Duty came into force, the regulator has explicitly acknowledged that client reviews and testimonials can be used in financial promotions, provided they are genuine, not misleading, and accompanied by appropriate context. Google reviews and VouchedFor testimonials, where the client independently shares their experience on a third-party platform, are generally well within acceptable boundaries.

The key requirements are straightforward: do not fabricate or selectively edit reviews, do not incentivise clients to leave positive reviews, and ensure that any reviews used in your own marketing materials comply with financial promotion rules. Genuine, unsolicited client feedback shared on public platforms is not only permissible but arguably aligned with the Consumer Duty's emphasis on transparency and consumer empowerment.

If you have specific concerns, consult your compliance team or professional body. But do not let vague regulatory anxiety prevent you from building what is rapidly becoming the most important component of your digital presence.

## A Simple 90-Day Plan

Building a meaningful review presence does not require a massive investment of time or money. Here is a straightforward 90-day plan.

**Days 1 to 7:** Set up or optimise your Google Business Profile. Ensure your firm name, address, services, and contact details are accurate and complete. Do the same on VouchedFor if you are not already listed.

**Days 8 to 30:** Identify 15 to 20 long-standing clients with whom you have strong relationships. Send each a personal email explaining that you are building your online presence and would value their honest feedback. Include direct links and the gentle prompts described above.

**Days 31 to 60:** Follow up with clients who have not yet responded. Begin identifying additional clients to approach. Start responding to every review you receive. A brief, genuine acknowledgement is sufficient.

**Days 61 to 90:** Evaluate your progress. Integrate review requests into your standard client process, for example requesting feedback after every annual review meeting. Set a target of two to three new reviews per month going forward.

Within 90 days, most firms can build a review presence that places them in the top 5% of advisers in their area. That positioning will translate directly into AI visibility, and the compound effects will continue to grow long after the initial effort.

## The Opportunity Is Clear, And Temporary

The gap between reviewed and unreviewed firms in UK financial advice is one of the most significant competitive asymmetries in any professional services sector. It will not persist indefinitely. As awareness of AI visibility grows, more firms will begin actively collecting reviews, and the bar for standing out will rise.

Right now, the barrier to entry is remarkably low. A handful of genuine, detailed client reviews can transform your firm's visibility to the AI tools that an increasing number of prospective clients use to find their adviser.

The question is not whether reviews matter for AI visibility. The evidence is clear that they do. The question is whether you will act while the competitive advantage is still available.

To see exactly how AI tools currently perceive your firm, including how your review presence affects your recommendations, check your free AI visibility score at Presenzia. It takes 30 seconds and provides a clear picture of where you stand and what to prioritise next.
    `.trim(),
  },
  {
    slug: 'ai-visibility-checklist-15-things-every-uk-financial-adviser-should-fix',
    title: "The AI Visibility Checklist: 15 Things Every UK Financial Adviser Should Fix This Month",
    description: "A practical, step-by-step checklist of the 15 highest-impact actions IFAs can take right now to improve how ChatGPT, Perplexity, and other AI tools recommend their firm.",
    date: '2026-03-16',
    readTime: '9 min read',
    category: 'Guide',
    heroImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Checklist on a clipboard with a pen on a clean desk',
    content: `
You understand that AI visibility matters. You have read about the shift from Google search to AI recommendations. You know that 79% of UK IFA firms are invisible to ChatGPT. The question you are now asking is: what do I actually do about it?

This checklist gives you the answer. These are the 15 highest-impact actions you can take this month to improve your firm's visibility across ChatGPT, Perplexity, Claude, and Google AI Overviews. They are ordered by impact and difficulty, so you can start at the top and work your way down.

## The Quick Wins (Do This Week)

### 1. Claim and complete your Google Business Profile

This is the single easiest action with the biggest impact. Google Business Profile data feeds directly into multiple AI systems, including ChatGPT's web-search mode and Google's own AI Overviews. If your profile is incomplete or unclaimed, you are invisible to every AI system that references Google's local data.

Ensure your profile includes: your full firm name (exactly as it appears on the FCA register), your office address, phone number, website URL, opening hours, a detailed business description that mentions your specialisms, and at least five high-quality photos of your office and team.

### 2. Match your firm name across every platform

AI models cross-reference information from multiple sources. If you are "Smith & Partners Financial Planning Ltd" on your website, "Smith Financial" on Google, and "S&P Wealth" on VouchedFor, AI systems cannot confidently identify you as the same entity.

Audit your firm name on: your website, Google Business Profile, FCA Register, Companies House, LinkedIn company page, VouchedFor, Unbiased, and any other directories. Make them identical.

### 3. Update your website's meta descriptions

Your homepage and key service pages should have meta descriptions that clearly state who you are, where you operate, and what you specialise in. These descriptions are indexed by search engines and often referenced by AI systems when evaluating your firm.

A meta description like "Independent financial advisers in Manchester specialising in retirement planning, pension transfers, and inheritance tax planning for high-net-worth individuals" is far more useful to AI than "Welcome to our website. We provide financial services."

### 4. Add your FCA registration number to your website footer

This seems minor, but it creates a verifiable link between your website and the FCA Register. AI systems use regulatory registration as an authority signal. Making your FCA number visible and consistent across your website, Google Business Profile, and directory listings reinforces your legitimacy.

### 5. Request three client reviews this week

You do not need 50 reviews to make a difference. Even three genuine, detailed reviews on Google can move you from invisible to visible in AI recommendations for your local area. Identify three long-standing clients with whom you have a strong relationship and send a personal request today.

## The Content Actions (Do This Fortnight)

### 6. Write one detailed guide about your core specialism

AI systems recommend firms that demonstrate expertise. A single 1,500-word guide on a topic you genuinely know well, such as pension drawdown strategies for NHS consultants, or inheritance tax planning for property portfolios, creates a substantial signal that AI can reference.

Write for a reader who is intelligent but not a financial expert. Be specific. Include actual figures, thresholds, and examples. Avoid jargon without explanation.

### 7. Create a clear "About Us" page with named individuals

AI models identify people as entities. A page that names your advisers, lists their qualifications (Chartered Financial Planner, CII Diploma, etc.), mentions their specialisms, and includes their professional experience gives AI models structured information about who is behind your firm.

Generic copy like "Our experienced team of professionals" tells AI nothing. Named individuals with credentials tell AI everything.

### 8. Publish a clear fee structure page

Transparency on fees is one of the most commonly requested pieces of information from prospective clients asking AI for adviser recommendations. AI tools frequently mention fee transparency as a positive when recommending firms.

You do not need to list exact prices if that is not appropriate for your business model. Even stating "We charge an initial advice fee of between 1% and 3% of the funds under consideration, depending on complexity" is significantly more useful than no fee information at all.

### 9. Add a detailed FAQ section to your website

FAQs are structured in a question-and-answer format that AI systems parse exceptionally well. Create a page with 10 to 15 genuine questions that your clients commonly ask, with thorough, honest answers.

Questions like "How much money do I need to work with a financial adviser?", "What is the difference between restricted and independent advice?", and "How often will we meet?" are exactly the types of queries that prospective clients ask AI tools. If your website answers them clearly, AI systems may cite your firm.

## The Authority Builders (Do This Month)

### 10. Complete your VouchedFor profile

VouchedFor is the most widely referenced UK-specific adviser review platform in AI training data. If you do not have a profile, create one. If you have one, ensure it is complete: qualifications, specialisms, a detailed biography, your fee model, and the types of clients you typically work with.

A complete VouchedFor profile with even a handful of reviews can significantly improve your visibility to AI systems making UK-specific adviser recommendations.

### 11. Update your LinkedIn company page and personal profiles

LinkedIn is one of the largest data sources that AI models reference. Your company page should include a clear description of your firm, your specialisms, and your location. Individual adviser profiles should list qualifications, areas of expertise, and professional history.

Importantly, LinkedIn content (articles and posts) published by named individuals at your firm contributes to the authority signals that AI models evaluate. Regular, thoughtful posts about your area of expertise compound over time.

### 12. Ensure your Unbiased profile is current

Like VouchedFor, Unbiased is a UK-specific directory that AI systems reference when generating adviser recommendations. If your profile is outdated or incomplete, update it with your current services, specialisms, minimum portfolio size, and fee structure.

### 13. Add FinancialService schema markup to your website

Schema markup is structured data that you add to your website's code to tell AI systems explicitly what your firm does. FinancialService schema can include your firm name, address, services, areas covered, FCA number, and qualifications.

This is the most technical item on the list, and you will likely need your web developer to implement it. But research suggests that schema markup can improve AI citation rates by over 30%. It is worth the small investment.

### 14. Publish a second piece of thought leadership

If you completed item 6, you have one detailed guide. Now write a second, on a different topic. This could be market commentary, a case study (anonymised), or an analysis of a recent regulatory change and its impact on your clients.

Two substantial content pieces signal to AI systems that your firm produces ongoing thought leadership, not a single one-off effort. Consistency matters.

### 15. Set up a quarterly content calendar

This is not an immediate visibility fix, but it creates the foundation for sustained improvement. Commit to publishing one substantial piece of content per month: a guide, a market commentary, a case study, or an analysis piece.

The firms that will dominate AI recommendations in 12 months are the ones that start a consistent publishing rhythm now. Each piece compounds the authority signals that AI models use to evaluate your firm.

## How to Prioritise

If you can only do five things this month, do these: claim your Google Business Profile (1), match your firm name everywhere (2), get three client reviews (5), write one detailed guide (6), and complete your VouchedFor profile (10). These five actions will have more impact on your AI visibility than anything else you could do with the same time investment.

## Measuring Progress

After completing these actions, give it two to four weeks for changes to be reflected in AI responses. Then test your visibility by asking ChatGPT, Perplexity, and Claude to recommend financial advisers in your area or specialism. Compare the results with what you see today.

If you want an objective measure of where you stand right now and how much progress you have made, Presenzia's free AI visibility score tests your firm across all four major AI platforms in under 60 seconds. It provides a baseline you can track as you work through this checklist, showing you exactly which actions are making the biggest difference.
    `.trim(),
  },
  {
    slug: 'google-business-profile-is-now-your-chatgpt-profile',
    title: "Your Google Business Profile Is Now Your ChatGPT Profile: How to Optimise It for AI Search",
    description: "ChatGPT now pulls directly from Google Business Profile data for local queries. Most IFA profiles are incomplete. Here's exactly how to optimise yours for AI recommendations.",
    date: '2026-03-18',
    readTime: '8 min read',
    category: 'Guide',
    heroImage: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Person holding phone showing Google Maps local business listing with reviews',
    content: `
When a prospective client asks ChatGPT "Who are the best financial advisers near me?", the AI does not consult a secret database of advisory firms. It draws on multiple data sources, and one of the most important is Google Business Profile.

Since OpenAI integrated real-time web search into ChatGPT, Google Business Profile data has become a primary input for local recommendations. When ChatGPT needs to recommend businesses in a specific location, it frequently references the same structured data that powers Google Maps and local search results. Your Google Business Profile is, in effect, your ChatGPT profile.

Yet the majority of UK financial advice firms either do not have a Google Business Profile, have one that is unclaimed, or have one that is so incomplete that AI systems cannot extract meaningful information from it.

This guide explains exactly what to do about it.

## Why Google Business Profile Matters More Than Your Website for AI

This might sound counterintuitive, but for local recommendations, your Google Business Profile often carries more weight with AI systems than your firm's website.

There are three reasons for this.

**Structured data.** Google Business Profiles present information in a standardised, structured format: business name, address, phone number, category, services, hours, reviews, photos. AI systems can parse this structured data far more efficiently than they can extract the same information from an unstructured website.

**Trust signals.** Google verifies business ownership and validates addresses. This verification provides AI systems with a baseline level of confidence that the business is real, established, and operating at the stated location.

**Review integration.** Google reviews are directly associated with the Business Profile, creating a combined data package that tells AI systems not just what you do and where you are, but what your clients think of you.

When ChatGPT or Perplexity generates a local recommendation, it is looking for businesses with complete, verified profiles and strong review signals. An IFA with a polished website but no Google Business Profile is at a significant disadvantage compared to an IFA with a basic website but a complete, well-reviewed profile.

## The Seven Fields That Matter Most

Not every field on your Google Business Profile is equally important for AI visibility. Here are the seven that have the greatest impact.

### 1. Business Name

This must match your FCA-registered name exactly. Do not add keywords ("Smith Financial — Best IFA in Manchester"). Google penalises keyword-stuffed names, and AI systems use the name to cross-reference against the FCA register, Companies House, and other data sources. Consistency is critical.

### 2. Business Category

Select "Financial Planner" or "Financial Consultant" as your primary category. You can add secondary categories such as "Pension Fund Manager," "Investment Service," or "Insurance Agency" if relevant to your services. These categories directly influence which queries AI systems match you to.

### 3. Business Description

You have 750 characters. Use every one of them. This description should include: what kind of advice you provide (independent, restricted, specialist), who you typically work with (retirees, business owners, high-net-worth families), where you operate, and what makes you distinctive.

A strong description: "Smith & Partners is a Chartered independent financial planning firm based in Guildford, Surrey. We specialise in retirement income planning, pension transfers, and inheritance tax strategies for professionals and business owners with investable assets above £250,000. Founded in 2005, our team of four Chartered Financial Planners provides ongoing, personalised advice."

A weak description: "We are a financial services company providing financial advice and planning solutions."

### 4. Services

Google allows you to list specific services with descriptions. Add every relevant service: retirement planning, pension transfers, inheritance tax planning, investment management, protection insurance, estate planning, and any specialist areas. Each service is a potential match point for AI queries.

### 5. Photos

Profiles with photos receive significantly more engagement, and AI systems that incorporate visual analysis use photos to validate business legitimacy. Upload at least five photos: your office exterior, reception area, meeting room, and team photos. Avoid stock images, as they undermine authenticity.

### 6. Business Hours

Complete and accurate hours signal an active, operational business. Update these if they change seasonally. An empty hours field suggests an inactive or abandoned listing.

### 7. Q&A Section

Google Business Profiles have a built-in Q&A feature that most IFAs ignore entirely. You can post your own questions and answer them. This creates additional structured content associated with your profile.

Post questions like: "What is the minimum investment amount to work with your firm?", "Do you offer pension transfer advice?", "Are you independent or restricted?", and answer them thoroughly. This content becomes part of the data that AI systems reference.

## The Review Strategy Specific to Google Business Profile

Reviews on Google carry particular weight because they are directly embedded in the structured data that AI systems access. The strategy for maximising their AI impact is specific.

**Quantity establishes relevance.** AI systems are more confident recommending a business with 20 reviews than one with two. Aim for a minimum of 15 reviews as a near-term target.

**Recency signals activity.** A business with 30 reviews from 2022 and none since appears inactive. AI systems favour businesses with recent review activity. Aim for at least one to two new reviews per month to maintain a signal of ongoing client satisfaction.

**Response demonstrates engagement.** Responding to reviews, particularly with substantive replies that add context or express genuine gratitude, creates additional text associated with your profile. AI systems see engaged businesses as more credible than those that collect reviews passively.

**Specificity enables matching.** Reviews that mention specific services ("excellent pension transfer advice," "helped us plan for inheritance tax") allow AI to match your profile to queries about those specific topics. When requesting reviews, gently prompt clients to mention what you worked on together.

## Common Mistakes That Undermine Your Profile

**Using a PO Box or virtual office address.** AI systems and Google itself penalise businesses that do not have a genuine physical location. If you operate remotely, consider using a serviced office address where you genuinely conduct client meetings.

**Leaving the description blank.** A profile without a description provides AI systems with almost nothing to work with beyond your business name and category. This is one of the most common and most damaging omissions.

**Inconsistent NAP data.** NAP stands for Name, Address, Phone number. If these details differ between your Google profile, your website, your FCA register entry, and your directory listings, AI systems struggle to confidently identify you as a single entity. Audit and align all instances.

**Ignoring negative reviews.** Negative reviews are not necessarily harmful if handled well. A thoughtful, professional response to criticism can actually strengthen your profile. Ignoring negative reviews, or responding defensively, damages credibility with both human readers and AI systems.

**Setting up multiple profiles for one location.** Some firms create separate profiles for different advisers at the same office. This confuses both Google and AI systems. One profile per physical location is the correct approach.

## The Integration With Your Broader AI Visibility

Your Google Business Profile does not operate in isolation. It is one component of the entity data that AI systems use to evaluate your firm. For maximum impact, it should be consistent with and reinforced by your website, your VouchedFor profile, your LinkedIn presence, and your FCA register entry.

When all of these sources present consistent, detailed, aligned information about your firm, AI systems develop high confidence in recommending you. When they conflict or when some sources are incomplete, that confidence drops.

Think of your Google Business Profile as the foundation of your local AI visibility. Your website provides depth. Your directory listings provide validation. Your reviews provide social proof. Together, they create a comprehensive digital presence that AI systems can evaluate, understand, and recommend.

## Start Today

Optimising your Google Business Profile takes approximately 45 minutes if you have a profile that needs updating, or roughly 90 minutes if you need to create one from scratch. The return on that time investment, in terms of AI visibility, is potentially the highest of any single action you can take.

If you want to see how your overall AI visibility compares before and after optimising your Google profile, check your free AI visibility score at Presenzia. It tests your firm across ChatGPT, Perplexity, Claude, and Google AI in under 60 seconds, giving you a concrete baseline to measure your progress against.
    `.trim(),
  },
  {
    slug: 'what-to-write-on-your-website-so-ai-recommends-you',
    title: "What to Write on Your Website So AI Actually Recommends You: A Content Strategy for IFAs",
    description: "Generic website copy makes you invisible to AI. Here's a practical content framework that helps ChatGPT, Perplexity, and Claude recognise your firm as the expert to recommend.",
    date: '2026-03-20',
    readTime: '9 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Person writing content strategy notes with a laptop on a wooden desk',
    content: `
There is a line that appears on roughly two-thirds of UK IFA websites. It reads something like: "We provide comprehensive, independent financial planning tailored to your individual needs."

It means nothing.

Not to prospective clients, who have seen the same sentence hundreds of times. And certainly not to AI systems, which have processed that exact phrase (or near-identical variations) from thousands of advisory firm websites and learned to ignore it entirely.

When ChatGPT decides which financial advisers to recommend, it is looking for firms it can distinguish. Firms it can match to a specific query. Firms that have given it a reason to recommend them over the other 5,000 directly authorised advice firms in the UK.

Generic copy makes that impossible. Here is what to write instead.

## The Core Problem: Commoditised Content

Most IFA websites suffer from what might be called the "brochure problem." They were designed to look professional and say the right things to human visitors. But from an AI perspective, they all say the same things. The same service descriptions, the same vague value propositions, the same stock language about "putting clients first."

AI models process content from across the internet. When every financial adviser website contains effectively the same text, none of those websites provides a reason for the AI to recommend one firm over another. The AI either recommends the handful of firms that do differentiate themselves, or it falls back on brand recognition and review volume.

The solution is not to write more content. It is to write different content, content that is genuinely unique to your firm, your expertise, and the clients you serve best.

## The Pillar Content Framework for IFAs

A pillar content framework involves building your website around three to five "pillar" topics where your firm has genuine, deep expertise. Each pillar topic gets a comprehensive guide (1,500 to 2,500 words) supported by related shorter articles that explore specific aspects in more detail.

### Step 1: Identify Your Genuine Specialisms

Every IFA firm has areas where they are genuinely stronger than average. These might be driven by your client base, your qualifications, your professional background, or your geographic location.

Common IFA specialisms that work well for AI differentiation:

- Pension transfers and defined benefit scheme advice
- Retirement income planning (drawdown, annuities, hybrid strategies)
- Inheritance tax planning for property-heavy estates
- Financial planning for NHS doctors and consultants
- Business exit planning and entrepreneurs' relief
- Divorce financial planning and pension sharing orders
- Financial planning for expatriates or returning expats
- Intergenerational wealth planning for farming families
- Investment management for charities and trusts

The key is specificity. "We specialise in pensions" does not differentiate you. "We specialise in defined benefit pension transfer advice for scheme members approaching retirement" does.

### Step 2: Write a Pillar Guide for Each Specialism

Each pillar guide should be the most thorough, accurate, and useful resource available online on that specific topic. This sounds ambitious, but for niche financial topics, the bar is surprisingly low. Most existing content on specialist planning topics is either superficial, outdated, or written by generic content marketing agencies with no real financial expertise.

A pillar guide on pension transfers, for example, might cover:

- What a defined benefit pension transfer actually involves
- The current regulatory framework (FCA requirements, CETV process)
- Who should and should not consider a transfer (with specific scenarios)
- The risks and how they are assessed
- What the advice process looks like in practice
- Common misconceptions and how to avoid pitfalls
- Relevant thresholds and figures for the current tax year

Write as if you are explaining this to an intelligent person who has no financial background but has a genuine need for this information. Be specific. Use real numbers and current figures. Reference actual regulations. This is the kind of content that AI systems surface because it is genuinely authoritative.

### Step 3: Create Supporting Content

Each pillar guide should be supported by three to five shorter articles (800 to 1,200 words) that address specific questions related to the pillar topic.

For a pension transfer pillar, supporting articles might include:

- "What happens to my final salary pension if my company goes bust?"
- "How is the transfer value of a defined benefit pension calculated?"
- "Can I transfer my pension after I have started drawing benefits?"
- "Tax implications of pension transfers in 2026/27"

These supporting articles create a cluster of content that signals to AI systems that your firm has comprehensive expertise in this area. They also match the specific questions that prospective clients type into AI tools.

## How to Write for AI Without Sounding Robotic

Writing for AI does not mean writing for robots. The characteristics that AI systems reward, specificity, authority, factual density, clear structure, are exactly the same characteristics that make content useful for human readers.

Here are the practical principles.

**Use clear, descriptive headings.** AI systems use headings to understand content structure. "Understanding Your Options" is vague. "Drawdown vs Annuity: How to Choose Your Retirement Income Strategy" is specific and tells AI exactly what the section covers.

**Include specific figures and thresholds.** "The pension annual allowance is currently £60,000 for the 2025/26 tax year" is a factual statement that AI can cite. "The allowance is subject to change" is meaningless.

**Define technical terms when you first use them.** "A CETV (Cash Equivalent Transfer Value) is the lump sum your pension scheme calculates as the equivalent value of your defined benefit pension" helps AI understand and explain concepts using your content as the source.

**Attribute expertise to named individuals.** "According to James Harrison, Chartered Financial Planner at Smith & Partners" gives AI a named expert to cite. This makes your content more quotable and more likely to be referenced.

**Include practical examples.** "Consider a 57-year-old NHS consultant with 30 years of pensionable service and a CETV offer of £1.2 million" is the kind of worked example that AI systems find highly useful for constructing answers to complex queries.

**Structure content for extraction.** Think about how an AI might extract a single paragraph from your content to answer a user's question. Each paragraph should ideally make a self-contained point. This makes your content more modular and more likely to be cited.

## The Content You Should Stop Writing

Some content types that many IFAs produce are actively unhelpful for AI visibility.

**Generic market commentary.** "Markets were volatile this week" adds nothing. Hundreds of firms and financial publications produce virtually identical commentary. AI has no reason to cite yours.

**Thin blog posts.** A 300-word article titled "Five Tips for Saving Money" competes with thousands of identical pieces across the internet. AI systems ignore commoditised content.

**Keyword-stuffed service pages.** Pages that repeat "financial adviser in Manchester" fifteen times are optimised for a version of Google that no longer exists. They provide no useful information for AI systems.

**Content that is all opinion with no substance.** "We believe in putting clients first" is an opinion that cannot be verified. "Our average client retention rate over the past five years is 97%" is a fact that AI can cite.

Replace these with fewer, better, more specific pieces of content. One excellent pillar guide is worth more than twenty thin blog posts.

## Building a 12-Month Content Calendar

Consistency matters for AI visibility. A burst of content followed by months of silence sends a weaker signal than a steady publishing rhythm. Here is a practical approach.

**Month 1:** Publish your first pillar guide on your primary specialism. This is your most important content investment.

**Months 2 to 3:** Publish two to three supporting articles for your first pillar. Each article should address a specific question related to your specialism.

**Month 4:** Publish your second pillar guide on a different specialism.

**Months 5 to 6:** Supporting articles for pillar two, plus begin collecting and publishing case studies (anonymised) that demonstrate your expertise in practice.

**Months 7 to 12:** Continue the pattern: publish pillar three, supporting content, case studies, and begin adding commentary on regulatory or market developments relevant to your specialisms.

By month 12, you will have three comprehensive pillar guides, 12 to 15 supporting articles, several case studies, and a body of commentary that signals ongoing expertise. This is more substantive content than 95% of IFA firms have ever published, and it creates a significant, durable advantage in AI visibility.

## Measuring Content Impact

The impact of content on AI visibility is not immediate. AI systems need time to index and evaluate new content. Expect to see measurable changes in how AI tools reference your firm within four to eight weeks of publishing substantial content.

Test your visibility regularly by asking AI tools the kinds of questions your target clients would ask. Track whether your firm starts appearing in responses, and note which content pieces are being referenced.

For a structured measurement of your progress, check your AI visibility score at Presenzia before you begin your content strategy and then monthly as you publish. This gives you an objective baseline and a clear view of how your content investment is translating into actual AI recommendations across ChatGPT, Perplexity, Claude, and Google AI.
    `.trim(),
  },
  {
    slug: 'how-to-test-your-firm-on-chatgpt-and-what-to-do-about-the-answer',
    title: "How to Test Your Firm on ChatGPT (And What to Do When It Doesn't Recommend You)",
    description: "A step-by-step guide to testing how ChatGPT, Perplexity, Claude, and Google AI see your firm. Includes the exact prompts to use, how to interpret the results, and what to fix first.",
    date: '2026-03-22',
    readTime: '8 min read',
    category: 'Guide',
    heroImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Person testing AI chatbot interface on a laptop screen',
    content: `
Most financial advisers have never asked ChatGPT to recommend them. The ones who have tried it once, seen that they were not mentioned, and moved on without knowing what to do about it.

This guide gives you a systematic method for testing your AI visibility across all four major platforms, interpreting what the results mean, and taking the specific actions most likely to change the outcome.

## The Testing Method

Testing your AI visibility properly requires more than a single query. AI responses vary based on how questions are phrased, what the model has recently processed, and which platform you use. A thorough test covers multiple platforms and multiple query types.

### Platform 1: ChatGPT

Open ChatGPT (the free version works, though GPT-4 gives more detailed responses). Run these five queries, replacing the bracketed text with your actual location and specialisms:

1. "Can you recommend a good independent financial adviser in [your town/city]?"
2. "Who are the best financial advisers in [your county/region] for [your primary specialism]?"
3. "I need a financial adviser who specialises in [your primary specialism]. Can you recommend some firms in [your area]?"
4. "What should I look for in a financial adviser for [specific client scenario you commonly serve]?"
5. "[Your firm name] — is this a good financial adviser? What can you tell me about them?"

Record whether your firm appears in each response, what the AI says about you (or does not say), and which competitors are mentioned instead.

### Platform 2: Perplexity

Perplexity is distinct because it cites its sources with links. This makes it particularly valuable for testing because you can see exactly which web pages the AI is drawing from. Run the same five queries.

Pay attention to the sources Perplexity cites. If your competitors are appearing, click through to the cited sources to understand why the AI chose them. This often reveals the specific content, directory listing, or review profile that gave them the edge.

### Platform 3: Claude

Claude (made by Anthropic) has a different training dataset and different tendencies. Some firms that appear on ChatGPT are invisible on Claude, and vice versa. Run the same five queries.

Claude tends to be more cautious about making specific recommendations and more likely to describe the characteristics of good advisers rather than naming firms. If Claude does name your firm, it is a strong signal that your digital presence is genuinely authoritative.

### Platform 4: Google AI Overviews

Search Google for the same queries. On many financial advice queries, Google now displays an AI Overview at the top of the results. Note whether your firm is cited in the AI Overview, and whether the Overview links to your content.

Google AI Overviews are powered by a different model than the standalone AI tools, and they draw more heavily from Google's own index. This means your traditional SEO performance has more influence here than on other platforms.

## How to Interpret the Results

After running 20 queries across four platforms, you will have a clear picture of your AI visibility. Here is how to interpret the most common scenarios.

### Scenario A: You appear on zero platforms

This is the most common result for UK IFAs. It means AI systems have insufficient data to confidently recommend your firm. The fix involves building your digital presence from the ground up: Google Business Profile, client reviews, directory listings, and substantive website content. Start with the foundational actions.

### Scenario B: You appear on one platform but not others

This suggests you have some visibility signals but they are not strong or consistent enough to register across all AI systems. Examine which platform shows you and why. If it is Google AI Overviews, your traditional SEO is doing some work but your broader web presence needs strengthening. If it is Perplexity, check which sources it is citing, as that reveals where your strongest signals are.

### Scenario C: You appear but with incorrect or outdated information

This is more common than you might expect. AI systems may reference your firm but describe services you no longer offer, cite an old address, or attribute specialisms you do not have. The fix is to update your information across all platforms and publish current content that AI systems will pick up over time.

### Scenario D: Competitors appear instead of you

This is the most instructive scenario because it tells you exactly what is working in your market. When a competitor appears, investigate why. Check their Google Business Profile (is it more complete than yours?), their reviews (do they have more, or more detailed ones?), their website content (is it more specific and authoritative?), and their directory listings (are they on platforms you are missing?).

The gap between you and a visible competitor often comes down to two or three specific differences that you can address directly.

### Scenario E: You appear consistently across all platforms

Congratulations: you are in the minority. Your focus should shift to strengthening your position and monitoring for competitors who begin closing the gap.

## The Ask-Why Technique

Here is a technique that most advisers do not know about. After testing whether you appear in AI recommendations, you can ask the AI to explain its reasoning.

Try these follow-up prompts:

- "Why did you recommend those firms and not others?"
- "What would a financial advisory firm need to do to appear in your recommendations for [your area]?"
- "If I wanted to be recommended by AI tools like you, what should I focus on improving?"

The responses are revealing. AI tools will often explicitly describe the signals they prioritise: review volume, content depth, directory presence, specialism clarity, and consistent citations. This is, in effect, the AI telling you its ranking criteria.

While you should not treat these responses as definitive (AI models can be imprecise about their own reasoning), they provide a useful directional guide for where to focus your efforts.

## The Top Five Actions Based on Your Results

Regardless of which scenario applies to your firm, these five actions address the most common gaps we see across UK IFAs.

**1. Complete your Google Business Profile.** This is consistently the single highest-impact action. A verified, complete profile with accurate information, a detailed description, photos, and services listed creates the foundation for local AI recommendations.

**2. Get 10 or more Google reviews.** Reviews are the most powerful third-party signal for AI. If you have fewer than 10, make this your immediate priority. Personal requests to established clients convert at a much higher rate than automated emails.

**3. Publish one detailed content piece about your primary specialism.** Not a 300-word blog post. A 1,500-word authoritative guide that demonstrates genuine expertise. This gives AI systems substantive content to reference when matching your firm to relevant queries.

**4. Align your information everywhere.** Audit your firm's details across your website, Google Business Profile, FCA Register, Companies House, VouchedFor, Unbiased, and LinkedIn. Make sure the name, address, phone number, and service descriptions are identical. Consistency is an authority signal.

**5. Request FinancialService schema markup on your website.** Ask your web developer to add this structured data. It explicitly tells AI systems what your firm does, where you operate, and your regulatory credentials. The implementation takes a few hours and creates a permanent improvement in how AI systems parse your website.

## When to Retest

After making changes, allow two to four weeks before retesting. AI systems with web access (ChatGPT in search mode, Perplexity, Google AI Overviews) will pick up changes faster. Models that rely more on training data may take longer to reflect improvements.

Test quarterly at minimum, and test immediately after making significant changes to your website content, Google profile, or directory listings.

For a faster and more systematic assessment than manual testing, you can check your AI visibility score at Presenzia. It runs over 120 wealth-specific queries across all four major platforms in under 60 seconds, giving you a comprehensive score, a grade, and a specific action plan based on exactly where your gaps are.

Manual testing is valuable for understanding the qualitative aspects of how AI perceives your firm. An automated assessment is valuable for quantitative tracking of your progress over time. Both have their place.
    `.trim(),
  },
  {
    slug: 'which-ifa-directories-feed-into-ai-recommendations',
    title: "The IFA Directory Audit: Which Listings Actually Feed Into AI Recommendations",
    description: "Not all adviser directories are equal in the eyes of AI. Some directly feed ChatGPT and Perplexity recommendations. Others are invisible. Here's which ones matter and how to optimise them.",
    date: '2026-03-24',
    readTime: '8 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Business directory listing documents and folders organised on a desk',
    content: `
Financial advisers have always known that directory listings matter. A presence on VouchedFor, Unbiased, or the PFS directory has traditionally been about generating direct enquiries from consumers searching those platforms.

But directories now serve a second, increasingly important purpose: they feed data to AI systems. When ChatGPT, Perplexity, or Google AI Overviews construct recommendations for financial advisers, they draw on information from these directories to validate that a firm is legitimate, active, and specialised in the areas a prospective client is asking about.

Not all directories carry equal weight with AI systems. Some are heavily referenced. Others are effectively invisible. Understanding which directories matter, and what information AI systems actually extract from them, allows you to focus your effort where it has the greatest impact.

## How AI Systems Use Directory Data

AI systems do not use directories the way consumers do. A consumer visits VouchedFor to read reviews and compare advisers. An AI system uses VouchedFor data as one of many inputs when forming an opinion about which firms to recommend.

Specifically, AI systems extract three things from directory listings:

**Entity confirmation.** The fact that your firm appears on a reputable directory confirms to the AI that your firm exists, is active, and is regulated. This sounds basic, but for firms with a thin web presence, directory listings may be the primary evidence that the AI has of their existence.

**Service and specialism data.** Directory profiles typically include structured information about what services a firm offers and who it serves. AI systems use this to match firms to specific client queries. A VouchedFor profile that lists "pension transfers" and "inheritance tax planning" as specialisms helps the AI recommend your firm when a user asks about those topics.

**Review and rating data.** Reviews on directories provide the third-party validation that AI systems weight heavily. A firm with 40 five-star reviews on VouchedFor sends a stronger signal than a firm with no reviews anywhere.

## The Directory Tier System

Based on how frequently AI systems reference different directories when generating adviser recommendations, the landscape breaks down into three tiers.

### Tier 1: High AI Impact

These directories are the most frequently referenced by AI systems and should be your top priority.

**Google Business Profile.** Technically not a traditional directory, but it functions as one and is the single most important listing for local AI recommendations. ChatGPT's web search mode, Perplexity, and Google AI Overviews all reference Google Business data extensively.

**VouchedFor.** The UK's largest specialist adviser review platform. VouchedFor profiles are frequently cited by AI systems when recommending UK financial advisers, particularly because of the review data and the structured specialism information they contain. VouchedFor's high domain authority and its recognition as a regulated review platform give it significant weight.

**Unbiased.** One of the longest-established consumer-facing directories for finding financial advisers in the UK. Unbiased profiles appear in AI-generated recommendations with notable frequency, and the platform's search data likely influences how AI models understand which firms serve which areas and specialisms.

**FCA Register.** AI systems reference the FCA Register as an authoritative source for validating that a firm is regulated and authorised. While the Register itself does not contain marketing content, ensuring your Register entry is accurate and up to date prevents discrepancies that could reduce AI confidence in recommending you.

### Tier 2: Moderate AI Impact

These directories contribute to your overall digital footprint and are worth maintaining, though their direct impact on AI recommendations is secondary.

**LinkedIn (Company Page).** LinkedIn profiles are indexed by AI systems and contribute to entity recognition and authority signals. A complete company page with a clear description, location, and employee profiles strengthens the overall picture that AI systems build of your firm.

**PFS (Personal Finance Society) Directory.** As a professional body directory, PFS listings carry authority in the eyes of AI systems, particularly for queries that reference Chartered status or professional credentials.

**CISI (Chartered Institute for Securities & Investment) Directory.** Similar to PFS, CISI listings validate professional credentials and contribute to AI authority signals.

**Trustpilot.** While less commonly associated with financial advice specifically, Trustpilot carries high general domain authority. Reviews here contribute to your firm's overall review profile as seen by AI systems.

### Tier 3: Lower AI Impact but Still Valuable

These directories have less direct influence on AI recommendations but contribute to the broader web presence that AI systems evaluate.

**AdviserBook.** A newer directory that is building recognition. Worth maintaining a profile for completeness and for the incremental value of consistent entity data.

**Yell/Thomson Local.** Traditional business directories with declining consumer usage but still indexed by AI systems for entity validation.

**Local chamber of commerce directories.** These carry local authority signals and can be particularly relevant for AI queries that specify a geographic area.

**Professional Adviser/FTAdviser profiles.** If you have contributed articles or commentary to these trade publications, those listings create high-authority third-party mentions that AI systems reference.

## How to Optimise Each Listing

The value of a directory listing depends entirely on how complete and accurate it is. An incomplete listing can be worse than no listing at all, because it introduces inconsistencies into the data that AI systems evaluate.

For each directory where you maintain a profile, ensure the following:

**Firm name consistency.** Your firm name should be identical across every directory, matching your FCA Register entry and your website. Even minor variations ("& Partners" versus "and Partners") can reduce AI confidence in identifying you as a single entity.

**Complete service descriptions.** Do not leave service fields blank. List every relevant service and specialism. AI systems use this structured data to match your firm to specific queries.

**Geographic information.** Ensure your address and areas served are clearly stated. AI recommendations for local advisers depend heavily on geographic data.

**Qualifications and accreditations.** List Chartered status, CII qualifications, CISI memberships, and any other professional credentials. These are authority signals that AI systems evaluate.

**Up-to-date information.** Review and update your directory profiles at least quarterly. Outdated information, particularly old addresses, discontinued services, or staff who have left, creates data conflicts that reduce AI confidence.

## The Consistency Principle

The most important takeaway from this analysis is not which individual directory matters most. It is that consistency across all directories matters enormously.

AI systems are fundamentally pattern-matching engines. When they find the same firm name, the same address, the same services, and the same description across multiple independent sources, they develop high confidence that this firm is real, established, and credible. When they find inconsistencies, partial information, or conflicting data, that confidence drops.

A firm with consistent, complete profiles across eight directories will almost always be recommended ahead of a firm with a perfect profile on one directory and gaps everywhere else. The aggregate effect is greater than the sum of individual listings.

## The 60-Minute Directory Audit

Here is a practical audit you can complete in about an hour.

**Step 1 (10 minutes):** Create a spreadsheet with columns for each directory listed above. Add rows for: firm name, address, phone, website, services listed, qualifications listed, and number of reviews.

**Step 2 (30 minutes):** Visit each directory where you have a listing and populate the spreadsheet with your current information. Note any gaps or inconsistencies.

**Step 3 (10 minutes):** Identify the most critical gaps. Any Tier 1 directory where you do not have a profile, or where your profile is substantially incomplete, should be your first priority.

**Step 4 (10 minutes):** Create a plan to address the gaps. Which profiles need creating? Which need updating? Which have information that conflicts with other sources?

This audit gives you a clear picture of your directory presence and a specific, actionable plan for improvement. The effort required is modest, but the impact on how AI systems perceive and recommend your firm can be significant.

## Measuring the Impact

After updating your directory profiles, allow two to four weeks for changes to be indexed and reflected in AI recommendations. Then test your visibility using the manual testing method described in our testing guide, or check your comprehensive AI visibility score at Presenzia to see how your improved directory presence has affected your scores across all four major AI platforms.

The firms that maintain complete, consistent, up-to-date profiles across all relevant directories are building a structural advantage in AI visibility that is difficult for less diligent competitors to replicate.
    `.trim(),
  },
  {
    slug: 'perplexity-claude-gemini-why-optimising-for-chatgpt-alone-is-not-enough',
    title: "Perplexity, Claude, Gemini: Why Optimising for ChatGPT Alone Is Not Enough",
    description: "Each AI platform recommends financial advisers differently. A firm visible on ChatGPT may be invisible on Perplexity. Here's how the four major AI platforms differ and what it means for your strategy.",
    date: '2026-03-26',
    readTime: '9 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Multiple screens showing different AI interfaces and technology platforms',
    content: `
When most financial advisers think about AI visibility, they think about ChatGPT. It is the name they recognise, the platform their clients mention, the tool that dominates headlines.

But ChatGPT is one of four major AI platforms that prospective clients are using to find financial advisers. The others, Perplexity, Claude, and Google's Gemini (including AI Overviews), each evaluate and recommend firms differently. A firm that appears prominently on ChatGPT may be completely invisible on Perplexity. A firm that is missing from ChatGPT may be the top recommendation on Claude.

Optimising for only one platform is like optimising your website for only one browser. You miss a significant portion of your potential audience. Understanding how each platform differs, and what each one prioritises, is essential for a complete AI visibility strategy.

## The Four Platforms and How They Differ

### ChatGPT (OpenAI)

ChatGPT is the most widely used AI assistant globally, with over 300 million weekly active users. When ChatGPT generates recommendations, it draws on two sources: its training data (a massive synthesis of web content) and, when web search is enabled, real-time web results.

**What ChatGPT prioritises:**
- Brand recognition and frequency of mention across the web
- Content authority, particularly from well-established websites
- Google Business Profile data (when web search is active)
- Review presence, particularly Google reviews
- Consistent entity information across multiple sources

**ChatGPT's tendencies:**
ChatGPT tends to recommend larger, nationally recognised firms unless the user specifies a location. It responds well to specific geographic queries and will surface local firms if they have a strong local digital presence. It also tends to provide relatively detailed descriptions of recommended firms, drawing on information from multiple sources.

**What this means for IFAs:**
To perform well on ChatGPT, you need a strong overall web presence: complete Google Business Profile, consistent directory listings, substantial website content, and visible client reviews. ChatGPT rewards firms that appear credible across multiple data sources.

### Perplexity

Perplexity is growing rapidly among professionals and researchers because of one distinctive feature: it cites its sources. Every claim Perplexity makes is accompanied by a clickable link to the web page it drew from. This makes Perplexity uniquely transparent about why it recommends particular firms.

**What Perplexity prioritises:**
- Recent, indexable web content (Perplexity searches the web in real time)
- Source authority and credibility
- Content that directly answers the user's specific query
- Pages with clear, well-structured information
- Recent publication dates (freshness matters more here than on ChatGPT)

**Perplexity's tendencies:**
Perplexity tends to recommend firms that have recently published relevant content. It also favours firms listed on high-authority directories (VouchedFor, Unbiased) because these platforms appear frequently in its search results. Perplexity is more likely to cite a specific page on your website than to reference your firm generally.

**What this means for IFAs:**
Perplexity rewards content freshness and specificity. Publishing regular, high-quality content about your specialisms gives you more indexed pages that Perplexity can cite. Having complete profiles on established directories ensures you appear in Perplexity's results even if your own website's domain authority is modest.

### Claude (Anthropic)

Claude approaches recommendations differently from both ChatGPT and Perplexity. It tends to be more cautious, more nuanced, and more focused on providing balanced, well-reasoned responses rather than definitive lists.

**What Claude prioritises:**
- Depth and quality of content over quantity
- Balanced, well-reasoned information
- Specific expertise signals (qualifications, specialisms, regulatory status)
- Content that demonstrates genuine authority rather than marketing language
- Professional credentials and regulatory compliance signals

**Claude's tendencies:**
Claude is less likely to produce a confident "top 5" list and more likely to describe what to look for in a good adviser, occasionally naming firms that exemplify those qualities. When Claude does recommend specific firms, it tends to reference firms with very strong authority signals: detailed content, professional credentials, and substantive third-party mentions.

**What this means for IFAs:**
Claude rewards genuine expertise. If your website contains deep, authoritative content written by qualified professionals, Claude is more likely to reference your firm. Marketing-style content and keyword-stuffed pages are less effective on Claude than on other platforms. Focus on quality and depth rather than volume.

### Google Gemini and AI Overviews

Google's AI capabilities appear in two forms: Gemini (the standalone AI assistant) and AI Overviews (AI-generated summaries that appear at the top of Google search results). Both draw heavily from Google's existing search index.

**What Google AI prioritises:**
- Traditional SEO signals (domain authority, backlinks, page quality)
- Google Business Profile completeness and review quality
- Structured data (schema markup, particularly FinancialService schema)
- Content relevance to the specific search query
- Local search signals (proximity, local backlinks, local reviews)

**Google AI's tendencies:**
Google AI Overviews lean heavily on the same data sources that power traditional Google search. This means that firms with strong Google SEO performance have an advantage on this platform that they may not have on ChatGPT or Perplexity. Google AI is also the most responsive to schema markup and structured data.

**What this means for IFAs:**
Google AI is where your traditional SEO investment pays the most dividends for AI visibility. If you have already invested in SEO, you have a head start on this platform. Adding schema markup and maintaining your Google Business Profile will maximise the AI visibility benefit of your existing SEO work.

## Where the Platforms Agree

Despite their differences, all four platforms share some common priorities. Understanding these shared signals helps you build a foundation that works everywhere.

**Reviews matter everywhere.** Every platform weights client reviews when making recommendations. Google reviews and VouchedFor reviews are referenced most frequently across all four platforms.

**Consistency is universal.** All four platforms cross-reference information from multiple sources. Consistent entity data (name, address, services) across your website, Google Business Profile, directories, and social media strengthens your position on every platform.

**Depth outperforms breadth.** All four platforms prefer detailed, authoritative content over thin, generic pages. A single comprehensive guide on your specialism is more valuable than ten superficial blog posts.

**Structured data helps everywhere.** While Google AI benefits most directly from schema markup, all platforms can extract structured information more efficiently than unstructured prose.

## Building a Multi-Platform Strategy

The practical implication is that you should not optimise for one platform at the expense of others. Instead, build a layered strategy:

**Layer 1: Foundation (works across all platforms)**
- Complete, verified Google Business Profile
- Consistent firm information across all directories
- Active review collection on Google and VouchedFor
- FinancialService schema markup on your website
- At least three to five detailed content pieces on your specialisms

**Layer 2: ChatGPT-specific**
- Broad web presence with mentions across multiple sources
- Complete directory profiles (VouchedFor, Unbiased, PFS)
- Strong brand consistency across all platforms

**Layer 3: Perplexity-specific**
- Regular content publication (at least monthly)
- Well-structured content with clear headings and factual density
- High-authority directory listings that Perplexity can cite

**Layer 4: Claude-specific**
- Deep, expert-level content that demonstrates genuine authority
- Professional credentials clearly stated
- Content written by named, qualified individuals

**Layer 5: Google AI-specific**
- Traditional SEO best practices
- Local SEO signals (local backlinks, local press mentions)
- Schema markup and structured data

## The Danger of Single-Platform Thinking

Focusing exclusively on one platform creates a fragile visibility position. Platform dynamics change frequently. ChatGPT updates its web search capabilities. Perplexity changes its ranking algorithm. Google modifies how AI Overviews select sources. A firm that is visible on one platform today could become invisible tomorrow if that platform changes its approach.

A multi-platform strategy creates resilience. If your visibility drops on one platform due to an algorithm change, your presence on the other three platforms continues to generate recommendations. This diversification is particularly important for financial advisers, where a single new client relationship can be worth tens of thousands of pounds in lifetime fees.

## Measuring Across Platforms

Understanding your visibility on each individual platform, not just an overall score, allows you to identify specific gaps and target your efforts effectively. You may discover that you perform strongly on Google AI but poorly on Perplexity, which would indicate a need for more recent published content. Or you may find strong Perplexity visibility but weak ChatGPT presence, suggesting your broader web footprint needs strengthening.

Presenzia's free AI visibility score tests your firm across all four major platforms, giving you a separate score for each and an overall grade. This platform-by-platform breakdown shows you exactly where you are strong, where you are weak, and which specific actions will have the greatest impact on each platform. It takes under 60 seconds and provides the multi-platform view that manual testing across four separate AI tools would take hours to replicate.

The firms that will dominate AI-driven client acquisition are those that treat all four platforms as important, building a presence that is visible, authoritative, and consistent across the entire AI landscape that prospective clients are using.
    `.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

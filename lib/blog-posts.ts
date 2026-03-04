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

**Depth of content.** A 300-word blog post titled "Five Tips for Retirement Planning" adds no value to an AI model that has already consumed thousands of similar articles. What AI models surface is depth — detailed, authoritative content that demonstrates genuine expertise. Think 1,500-word guides on specific tax planning strategies, detailed case studies (anonymised, of course), or data-driven analysis of market trends affecting specific client segments.

**Structured information.** AI models parse structured data more effectively than unstructured prose. Firms that present their credentials, specialisms, fee structures, and client outcomes in clear, well-organised formats are more likely to be understood and cited by AI systems.

## The First-Mover Advantage Is Real

In traditional SEO, catching up to established competitors was always possible. Google re-crawls websites frequently, and a sustained content strategy could improve rankings over time. The competitive dynamics of AI visibility are different, and they favour early movers more heavily.

Here is why. AI models are trained on snapshots of the internet. The content that exists today shapes the answers these models give for months or even years. Firms that establish a strong AI-visible presence now will be embedded in the training data that powers the next generation of AI responses. Firms that wait will find themselves competing not just against other advisers, but against the entrenched position of those who moved first.

There is also a compounding effect. When an AI model recommends a firm, that recommendation generates traffic, press mentions, and further citations — all of which reinforce the firm's position in future AI responses. The rich get richer.

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

Firms that have invested in clear, jargon-free content that explains their services, fees, and client outcomes in plain English are not only meeting their regulatory obligations — they are also building the kind of content that AI models can parse, understand, and cite. There is a genuine opportunity here for compliance-driven content to serve a dual purpose.

Conversely, firms that treat their website as a regulatory tick-box exercise, with dense legal language and minimal substantive content, are failing on both fronts: they are not meeting the spirit of Consumer Duty, and they are invisible to AI.

## The Cost of Inaction

The financial advice profession has weathered multiple waves of change — RDR, pension freedoms, Consumer Duty. Each time, the firms that adapted earliest gained a lasting advantage. The AI shift is no different in this respect, but it is moving faster than any previous disruption.

Consider the trajectory. In 2024, AI-assisted search was a curiosity. By 2025, it was a meaningful channel. In 2026, it is becoming a primary channel for a significant and growing segment of prospective clients. By 2027, firms that are invisible to AI will be relying entirely on referrals and existing client relationships for growth — a viable strategy, but one that places a hard ceiling on scale.

The firms that will thrive over the next decade are those that recognise AI visibility as a core part of their client acquisition strategy — not a marketing gimmick, but a fundamental shift in how prospective clients discover, evaluate, and choose their financial adviser.

## What You Can Do Today

The first step is understanding where you stand. Before investing in content, restructuring your website, or engaging a marketing agency, you need to know how visible your firm currently is to the AI platforms that prospective clients are actually using.

This is not something you can determine by asking ChatGPT about yourself once. AI visibility depends on multiple factors across multiple platforms, and a single query gives you an incomplete and potentially misleading picture.

If you want a clear, data-driven assessment of how your firm appears across ChatGPT, Perplexity, Claude, and Google AI — and where the specific gaps are — you can check your firm's AI visibility score for free at Presenzia. It takes less than 60 seconds, and the results may challenge your assumptions about how visible you truly are.
    `.trim(),
  },
  {
    slug: 'geo-vs-seo-why-google-rankings-are-no-longer-enough-for-financial-advisers',
    title: "GEO vs SEO: Why Google Rankings Are No Longer Enough for Financial Advisers",
    description: "There's less than 30% overlap between Google's top results and AI-generated answers for financial queries. A new discipline called GEO is emerging — and most advisers haven't heard of it.",
    date: '2026-03-07',
    readTime: '9 min read',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&h=630&fit=crop&q=80',
    heroImageAlt: 'Digital marketing analytics dashboard showing search performance data',
    content: `
For the past 15 years, SEO has been the dominant framework for how financial advice firms think about online visibility. Rank well on Google, and clients will find you. It was simple, measurable, and effective. And for many firms, it still generates results.

But a new discipline is emerging that most financial advisers have never heard of: GEO, or Generative Engine Optimisation. It addresses a fundamentally different challenge — how to ensure your firm appears in the answers generated by AI tools like ChatGPT, Perplexity, Claude, and Google's own AI Overviews.

The distinction matters enormously, because research consistently shows there is less than 30% overlap between the sources that rank well on traditional Google search and the sources that AI models cite when generating answers. A firm that ranks number one on Google for "independent financial adviser London" may score zero across every major AI platform.

Understanding the difference between SEO and GEO — and why both now matter — is essential for any IFA or wealth management firm serious about client acquisition in 2026 and beyond.

## What Is Generative Engine Optimisation?

GEO is the practice of optimising your firm's digital presence so that AI-powered answer engines — ChatGPT, Perplexity, Claude, Google AI Overviews, and others — reference, cite, or recommend your firm when users ask relevant questions.

Where SEO focuses on ranking in a list of blue links, GEO focuses on being selected as a source within an AI-generated narrative. The distinction is critical. In a traditional Google search, users see ten results and choose which to click. In an AI-generated answer, the model has already made that choice for them. It has selected which firms, which articles, and which data points to include in its response. If your firm is not selected, there is no "page two" to scroll to. You simply do not exist.

The term GEO was first coined in academic research from Princeton, Georgia Tech, the Allen Institute for AI, and IIT Delhi in late 2023, and has since gained significant traction among digital marketing professionals. But within financial services — particularly among UK IFAs — awareness remains extremely low.

## Why Google Rankings and AI Citations Diverge

To understand why a strong Google ranking does not guarantee AI visibility, you need to understand how these systems evaluate content differently.

**Google's ranking algorithm** weighs hundreds of factors, but at its core, it prioritises backlinks (how many other websites link to you), domain authority (the overall strength of your website), technical SEO (page speed, mobile responsiveness, structured data), and keyword relevance. A firm with a well-optimised website and strong backlink profile can rank well even if its content is relatively generic.

**AI models evaluate content differently.** When ChatGPT or Perplexity generates an answer, it is not ranking pages — it is synthesising information from multiple sources into a single coherent response. The factors that influence which sources get cited include:

- **Specificity and depth.** AI models prefer sources that provide detailed, specific information over generic overviews. A 2,000-word guide on "inheritance tax planning for business owners selling a company" is far more likely to be cited than a 400-word page titled "Our Tax Planning Services."

- **Factual density.** Content that includes specific data points, statistics, regulatory references, and concrete examples gives AI models material to cite. Vague, high-level content does not.

- **Authority signals beyond backlinks.** While backlinks matter for SEO, AI models also assess authority through mentions in credible publications, consistency of information across sources, author credentials, and the presence of original research or data.

- **Content structure.** AI models parse well-structured content more effectively. Clear headings, defined sections, and logical information architecture help AI systems extract and cite relevant passages.

- **Freshness and relevance.** AI models with web access prioritise recent, up-to-date content. A blog post from 2021 about pension rules that have since changed will be deprioritised in favour of current, accurate information.

This divergence in evaluation criteria explains the less-than-30% overlap. A firm might have excellent backlinks and strong technical SEO — enough to rank well on Google — while simultaneously lacking the depth, specificity, and authority signals that AI models require.

## The Practical Differences for Financial Advisers

Let us make this concrete with an example relevant to most IFAs.

**The SEO approach to pension planning content** might involve creating a page titled "Pension Planning Services," optimising it for keywords like "pension adviser" and "retirement planning UK," building backlinks from directories and local business sites, and ensuring the page loads quickly on mobile devices. This approach can absolutely achieve a strong Google ranking.

**The GEO approach to the same topic** would involve publishing a comprehensive guide on "How the 2025/26 pension annual allowance changes affect high earners," including specific calculations, worked examples, and references to HMRC guidance. It would involve being quoted in an industry publication like FTAdviser or Money Marketing on this topic. It would mean publishing original analysis — perhaps aggregated, anonymised data from your own client base showing how many clients are affected by the tapered annual allowance. And it would mean structuring this information so that AI models can easily extract key facts and attribute them to your firm.

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

Traditional SEO thinks in terms of keywords — specific phrases that users type into Google. GEO thinks in terms of entities — the people, organisations, concepts, and relationships that AI models understand.

For a financial advice firm, this means ensuring that AI models understand your firm as an entity: what it does, who it serves, where it operates, who the key people are, and what makes it distinctive. This requires consistent information across your website, LinkedIn profiles, Companies House listing, FCA register entry, directory listings, and any other online presence. Inconsistencies confuse AI models and reduce your chances of being cited.

**4. Publish original data and research.**

Nothing attracts AI citations like original data. If your firm can publish proprietary insights — anonymised trends from your client base, analysis of local property markets, research on retirement spending patterns among your clients — you create content that AI models cannot find anywhere else.

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

The most direct approach is to systematically query the major AI platforms with the types of questions your prospective clients are likely to ask, and assess whether your firm appears in the responses. This needs to be done across multiple platforms — ChatGPT, Perplexity, Claude, and Google AI Overviews — because each model may surface different sources for the same query.

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
There is a quiet crisis unfolding for businesses that depend on website traffic for client acquisition, and most UK financial advisers are not yet aware of it.

The crisis has a name: zero-click search. It refers to searches where the user gets the information they need directly on the search results page — from featured snippets, knowledge panels, or increasingly, AI-generated overviews — without ever clicking through to a website.

In 2023, approximately 56% of Google searches ended without a click to any website. By late 2025, that figure had risen to 65%. Current estimates for early 2026 place it closer to 69% for informational queries. For financial services queries specifically, the impact is even more pronounced.

This is not a minor trend. It is a structural shift in how search works, and it has direct implications for every IFA and wealth management firm that relies on its website as a client acquisition channel.

## What Are Google AI Overviews?

Google AI Overviews — formerly known as Search Generative Experience or SGE — are AI-generated summaries that appear at the top of Google search results for many queries. Rather than presenting a list of links and letting users choose which to visit, Google now synthesises information from multiple sources into a comprehensive answer displayed directly on the results page.

For a query like "what is the pension annual allowance for 2025/26," Google no longer simply shows links to HMRC, pension providers, and financial advice firms. Instead, it generates a detailed answer that includes the current allowance figure, how tapering works for high earners, and relevant context — all without the user needing to visit any website.

Research from authoritative SEO sources indicates that AI Overviews now appear on approximately 54% of financial FAQ queries in the UK. These include questions about pension rules, ISA allowances, inheritance tax thresholds, capital gains tax rates, and other topics that financial advice firms have traditionally used as entry points to attract website visitors.

The implications are significant. If Google is answering these questions directly, the traditional strategy of publishing educational content to attract search traffic and convert visitors into enquiries is fundamentally undermined.

## The Traffic Impact Is Already Measurable

This is not a theoretical concern. Website analytics data from across industries shows that organic traffic from Google has declined by an average of 33% for informational queries since the widespread rollout of AI Overviews. For financial services firms specifically, the decline is concentrated in exactly the content categories that most IFAs rely on: educational articles about tax rules, pension regulations, and investment basics.

Consider a typical IFA website's content strategy. The firm publishes articles on topics like "How much can I pay into my pension in 2025/26?" or "What is the inheritance tax nil-rate band?" These articles are designed to rank on Google, attract visitors, demonstrate expertise, and convert a percentage of those visitors into enquiry form submissions or phone calls.

When Google AI Overviews answer these questions directly on the search results page, the user has no reason to click through to the firm's website. The firm's article might still rank on page one — but below an AI Overview that has already satisfied the user's query. The click never happens. The visitor never arrives. The enquiry never materialises.

For firms that have invested heavily in SEO-driven content marketing, this represents a significant erosion of their primary digital acquisition channel.

## From "Getting Found" to "Being Cited"

The zero-click phenomenon forces a fundamental rethinking of what online visibility means for financial advisers. In the traditional model, the goal was to get found — to appear in search results so that users would click through to your website. In the emerging model, the goal is to get cited — to be the source that Google AI Overviews, ChatGPT, Perplexity, and other AI systems reference when generating their answers.

This is a crucial distinction. When Google generates an AI Overview about pension planning, it cites specific sources. Those citations appear as small links within the AI-generated text. While these citations generate fewer clicks than traditional search results, they carry significant weight: users who do click through from an AI citation tend to be more engaged, more qualified, and further along in their decision-making process.

More importantly, being cited by AI systems — whether Google's AI Overviews or standalone AI tools like ChatGPT — functions as a form of endorsement. When an AI system references your firm or your content as a source, it signals authority and credibility in a way that a simple search ranking does not.

The firms that will thrive in a zero-click world are those that shift their strategy from "creating content that ranks" to "creating content that AI systems want to cite."

## Why Financial Advice Is Particularly Affected

Not all industries are equally impacted by zero-click search. Financial advice is disproportionately affected for several reasons.

**High proportion of informational queries.** Many people searching for financial topics are seeking information, not immediately looking to hire an adviser. Queries like "how does pension drawdown work" or "what is the capital gains tax rate" are purely informational — and these are precisely the queries that AI Overviews handle most effectively.

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

AI systems — including Google's AI Overviews — weight third-party sources heavily when deciding what to cite. A firm that is mentioned in the Financial Times, quoted in FTAdviser, or referenced in an industry research report is far more likely to be cited in AI-generated answers than a firm whose expertise exists only on its own website.

Pursue opportunities to contribute expert commentary to trade publications, participate in industry surveys and research, and build a profile for your firm's key people on platforms that AI models monitor. LinkedIn, in particular, has become a significant source for AI systems seeking expert perspectives.

**4. Focus on conversion, not just traffic.**

If overall website traffic is declining due to zero-click search — and it almost certainly is — the response should not be solely to try to recapture that traffic. It should also be to maximise the value of the traffic you do receive.

Review your website's conversion paths. Are there clear, compelling calls to action on every page? Is it easy for a visitor to request a consultation? Do you offer value exchanges (like downloadable guides or assessment tools) that capture contact details? A 33% decline in traffic is far less damaging if you simultaneously improve your conversion rate from 1% to 3%.

**5. Diversify your acquisition channels.**

Zero-click search is a reminder that over-reliance on any single acquisition channel is risky. Firms that supplement search-driven traffic with referral programmes, strategic partnerships, social media presence, and direct outreach are better positioned to weather the ongoing decline in organic search traffic.

## The Urgency of Understanding Your Position

The shift to zero-click search is not coming — it is here. Every month that passes sees AI Overviews appearing on more queries, covering more topics, and providing more comprehensive answers. The window for financial advice firms to adapt their strategies is narrowing.

The firms that will navigate this transition successfully are those that understand their current position clearly: how much of their traffic comes from queries that AI Overviews now answer, how visible they are across AI platforms, and where the specific opportunities exist to become a cited source rather than a bypassed search result.

If you are unsure where your firm stands in this new landscape, Presenzia's free AI visibility score can help you understand how your firm appears across ChatGPT, Perplexity, Claude, and Google AI — giving you a clear picture of your current position and the areas where improvement would have the greatest impact on your client acquisition pipeline.
    `.trim(),
  },
  {
    slug: 'the-great-wealth-transfer-why-next-generation-clients-will-find-advisers-through-ai',
    title: "The Great Wealth Transfer: Why the Next Generation Will Find Their Adviser Through AI, Not Google",
    description: "£7 trillion will change hands over the next 30 years — and two-thirds of heirs plan to switch wealth managers. The next generation of clients won't be googling. They'll be asking ChatGPT.",
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

A 2025 study by Capgemini found that Gen X and Millennial high-net-worth individuals are three times more likely than baby boomers to use AI-powered tools when making financial decisions. Separate research from Accenture showed that 67% of affluent consumers under 50 have used a conversational AI tool — such as ChatGPT, Copilot, or Gemini — to research financial services in the past 12 months.

This is not a future trend. It is current behaviour. And it is accelerating.

When someone asks ChatGPT "Who are the best independent financial advisers in Surrey for inheritance tax planning?", the AI does not return a list of ten blue links. It provides a curated, authoritative answer — typically naming three to five firms with a brief explanation of why each was recommended.

If your firm is not among those recommendations, you are invisible to a growing segment of the wealthiest prospective clients in the country.

## Why Referrals Alone Will Not Survive the Transfer

The traditional advisory model relies heavily on referral networks. A satisfied client introduces a colleague. A solicitor recommends a trusted adviser. An accountant passes along a name. This model has served the industry well for decades, and it will not disappear overnight.

But it is fundamentally inadequate for the wealth transfer.

Consider the dynamics. When an adult child inherits wealth, they are often geographically distant from their parents' adviser. They may live in a different city or even a different country. Their parents' professional network — the solicitor, the accountant, the golf club contact — is not their network.

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

1. **Transparency on fees** — they want to understand exactly what they are paying
2. **Specialisation** — they prefer advisers who demonstrate expertise in their specific situation
3. **Digital-first communication** — they expect portals, apps, and responsive digital service
4. **Values alignment** — ESG considerations and ethical investing matter more to younger inheritors
5. **Evidence of competence** — they want proof, not promises

When these individuals ask an AI for recommendations, the AI evaluates firms against precisely these criteria. A firm whose website clearly explains its fee structure, whose content demonstrates deep expertise in inheritance planning, and whose reviews reference excellent digital service will be recommended repeatedly.

A firm with a generic brochure website and no client reviews will not appear at all.

## Five Actions Firms Should Take Now

The wealth transfer is not a theoretical future event. It is happening today, and the firms that act now will benefit disproportionately. Here are five practical steps to position your firm for this opportunity.

**1. Audit your AI visibility immediately.** Before you can improve your position, you need to understand where you stand. Test what happens when someone asks ChatGPT or Gemini to recommend advisers in your area or specialism. The results may surprise you.

**2. Build content around inheritance and intergenerational planning.** The clients you want to attract are dealing with specific, complex situations. Content that addresses inheritance tax planning, trust structures, estate consolidation, and the emotional aspects of managing inherited wealth will signal relevance to both AI systems and prospective clients.

**3. Strengthen your review presence.** AI tools weigh client reviews heavily when making recommendations. If you have no reviews — or only a handful — you are at a significant disadvantage. Establish a systematic process for requesting and publishing client testimonials across Google, VouchedFor, and other relevant platforms.

**4. Ensure consistency across every digital touchpoint.** AI systems cross-reference information from multiple sources. If your firm name, services, or contact details are inconsistent between your website, Google Business profile, FCA register entry, LinkedIn, and directory listings, the AI's confidence in recommending you decreases. Consistency builds trust — not just with humans, but with algorithms.

**5. Develop a clear proposition for next-generation clients.** If your website and content speak exclusively to retirees, you will not be recommended to a 45-year-old who has just inherited £500,000. Consider how your messaging, service offering, and digital experience appeal to younger, digitally native clients without alienating your existing base.

## The Window Is Open — But Not Forever

The great wealth transfer will unfold over decades, but the window to establish AI visibility advantage is measured in months, not years. AI systems are forming their understanding of the advisory landscape right now. The firms that are visible, authoritative, and well-reviewed today are building compound advantages that will be extremely difficult to replicate later.

This is not about chasing a trend. It is about recognising a fundamental shift in how the next generation of wealthy clients will discover, evaluate, and choose their financial adviser. The firms that understand this shift and act on it will capture a disproportionate share of the largest wealth transfer in British history.

The firms that do not will be left wondering where the next generation went.

If you want to understand where your firm stands in this new landscape, check your free AI visibility score at Presenzia. It takes 30 seconds and shows you exactly how AI tools like ChatGPT and Gemini currently perceive your firm — and what you can do about it.
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
When ChatGPT recommends a financial adviser, it does not flip a coin. It does not pick firms at random from the FCA register. It evaluates evidence — and the single most influential type of evidence it considers is client reviews.

This creates a striking problem for the UK advisory profession. According to analysis of FCA-registered firms, only around 9.3% of independent financial advisers in the UK have published client reviews on any major platform. Fewer than 5% have more than ten reviews.

In an industry where trust is everything, the overwhelming majority of firms have zero publicly visible proof that their clients trust them at all.

For traditional marketing, this was a missed opportunity. For AI visibility, it is a critical gap — and for the small number of firms willing to act, it represents one of the easiest competitive advantages available in financial services today.

## Why AI Tools Prioritise Reviews Above Almost Everything Else

To understand why reviews matter so much to AI, you need to understand how large language models construct recommendations.

When someone asks ChatGPT "Who are the best financial advisers in Manchester?", the AI does not simply search the web in real time. It draws on a vast corpus of training data and, depending on the tool, supplements this with live web retrieval. It then evaluates multiple signals to determine which firms deserve a recommendation.

These signals include website content, directory listings, professional credentials, published articles, and social media presence. But reviews occupy a uniquely powerful position in this evaluation for three reasons.

**First, reviews are third-party validation.** A firm can claim anything on its own website. Reviews represent independent evidence from real clients. AI systems are trained to weight third-party validation more heavily than first-party claims, because this mirrors how humans evaluate trustworthiness.

**Second, reviews contain natural language that matches user queries.** When a client writes "They helped us with our retirement planning and made the whole process stress-free," that review contains exactly the kind of language a prospective client would use when asking an AI for help. This natural language alignment makes reviewed firms more likely to surface for relevant queries.

**Third, reviews provide specificity.** A firm's website might say "We offer comprehensive financial planning." A review might say "They restructured our pensions, set up a junior ISA for our daughter, and saved us £12,000 in inheritance tax." AI systems favour specific, detailed information over generic claims.

The result is that firms with a strong body of detailed, genuine client reviews are dramatically more likely to appear in AI recommendations than firms without them — regardless of how polished their website might be.

## The 9% Opportunity

The fact that over 90% of UK advisers have no published reviews creates an extraordinary window. In most industries, building a competitive advantage through reviews requires outperforming hundreds of well-reviewed competitors. In UK financial advice, you need only outperform near-total silence.

Consider the maths. If you practise in a city with 200 registered IFAs, roughly 18 of them have any reviews at all. Perhaps five have more than ten reviews. If your firm accumulates 20 or 30 genuine, detailed client reviews, you are likely to have the strongest review profile of any adviser in your area.

That strength translates directly into AI visibility. When a prospective client asks an AI for adviser recommendations in your area, the AI will disproportionately favour firms it can verify through third-party evidence. Your reviews become your proof, and in a landscape where proof is scarce, even a modest review presence creates outsized impact.

This will not last forever. As awareness grows, more firms will begin actively collecting reviews. The competitive advantage available today — being among the first in your area to build a serious review presence — will diminish over time. But the firms that move early will benefit from compound effects that are extremely difficult for latecomers to replicate.

## Which Platforms Matter Most

Not all review platforms carry equal weight with AI systems. The platforms that matter most are those that AI tools can readily access, that carry broad public trust, and that have high domain authority.

**Google Business Profile** is the single most important platform. Google reviews are publicly accessible, widely trusted, and deeply integrated into the data sources that AI systems draw upon. If you do nothing else, build your Google review presence.

**VouchedFor** occupies a unique position in UK financial services. As the leading specialist review platform for advisers, it carries sector-specific authority. AI systems recognise VouchedFor as a credible, regulated source of adviser reviews, and firms with strong VouchedFor profiles frequently appear in AI recommendations for UK-specific queries.

**Trustpilot** carries significant general authority and is well-known to AI systems, though it is less commonly associated with financial advice specifically.

**Unbiased** and other professional directories contribute to your overall digital footprint, though their direct impact on AI recommendations is secondary to Google and VouchedFor.

The ideal strategy is to build primary strength on Google and VouchedFor while maintaining a consistent presence across other relevant platforms. This creates multiple data points that reinforce each other, increasing the AI's confidence in recommending your firm.

## The Difference Between a Review and an AI-Optimised Review

Here is where most guidance on reviews falls short. Getting a review is valuable. Getting the right kind of review is transformative.

A generic review — "Great service, would recommend" — is better than nothing, but it gives AI systems very little to work with. It contains no specific information about what the firm does, who it serves, or what outcomes it delivers.

An AI-optimised review naturally includes the details that help AI systems match your firm to relevant queries. Consider the difference:

- **Generic:** "Really happy with the service. Very professional team."
- **Detailed:** "After inheriting from my parents, I needed help understanding my options for inheritance tax planning. The team reviewed our entire financial position, consolidated three old pensions, and put together a plan that gives us confidence for the next 20 years. They specialise in working with clients who have recently inherited and it really showed."

The second review contains multiple signals that an AI system can use: inheritance, IHT planning, pension consolidation, long-term planning, specialism in inherited wealth. When a prospective client asks an AI about advisers who help with inherited wealth, the firm with the second type of review is far more likely to be recommended.

Crucially, this is not about fabricating reviews or coaching clients to use specific keywords. It is about asking the right questions when requesting feedback — questions that naturally prompt detailed, specific responses.

## How to Ask Clients for Reviews That Actually Help

The single biggest barrier to collecting reviews is that most advisers either do not ask, or ask in a way that produces minimal results. Here is a practical framework that consistently generates detailed, useful reviews.

**1. Ask at the right moment.** The best time to request a review is immediately after a significant milestone — completing a financial plan, resolving a complex tax issue, finalising a retirement strategy. The client's positive experience is fresh, and they can speak to specific outcomes.

**2. Make it personal, not automated.** A personal email or conversation is dramatically more effective than an automated request. "I would really value your honest feedback on our work together" generates far better responses than a generic survey link.

**3. Provide gentle prompts that encourage specificity.** Rather than asking "Could you leave us a review?", try: "It would be really helpful if you could share a few words about what brought you to us, what we worked on together, and how you felt about the process." This naturally guides clients toward the kind of detailed, AI-relevant review that creates compound value.

**4. Make the process effortless.** Send a direct link to your Google review page. Provide clear, simple instructions. Remove every possible point of friction. The fewer clicks required, the higher your conversion rate.

**5. Respond to every review.** When clients see that you read and respond to reviews, they are more likely to leave one themselves. Responses also add additional content to your review profile, creating more signals for AI systems to evaluate.

## The Compound Effect of Reviews on AI Visibility

Reviews do not operate in isolation. They create compound effects that strengthen your overall AI visibility in ways that are greater than the sum of their parts.

**Reviews improve your website's relevance.** When AI systems see consistent themes across your reviews and your website content — for example, both referencing retirement planning expertise — the alignment increases confidence in recommending you for those topics.

**Reviews strengthen your Google Business Profile.** A well-reviewed Google profile ranks higher in local search, which in turn increases the likelihood that AI systems with web access will discover and reference your firm.

**Reviews generate natural language data.** Every review adds to the corpus of text associated with your firm. Over time, this creates a rich, diverse body of content that helps AI systems understand your firm's strengths, specialisms, and client base with increasing precision.

**Reviews build social proof that encourages more reviews.** Prospective clients who see existing reviews are more likely to become clients, and satisfied clients who see that others have left reviews are more likely to leave their own. This creates a virtuous cycle that accelerates over time.

The firms that start building their review presence today will benefit from these compound effects for years to come. Each review makes the next one easier to obtain and more impactful when published.

## Addressing the Compliance Question

Some advisers hesitate to pursue reviews because of concerns about FCA regulations regarding testimonials and endorsements. This is an understandable concern, but the regulatory position is clearer than many assume.

Since the FCA's Consumer Duty came into force, the regulator has explicitly acknowledged that client reviews and testimonials can be used in financial promotions, provided they are genuine, not misleading, and accompanied by appropriate context. Google reviews and VouchedFor testimonials, where the client independently shares their experience on a third-party platform, are generally well within acceptable boundaries.

The key requirements are straightforward: do not fabricate or selectively edit reviews, do not incentivise clients to leave positive reviews, and ensure that any reviews used in your own marketing materials comply with financial promotion rules. Genuine, unsolicited client feedback shared on public platforms is not only permissible — it is arguably aligned with the Consumer Duty's emphasis on transparency and consumer empowerment.

If you have specific concerns, consult your compliance team or professional body. But do not let vague regulatory anxiety prevent you from building what is rapidly becoming the most important component of your digital presence.

## A Simple 90-Day Plan

Building a meaningful review presence does not require a massive investment of time or money. Here is a straightforward 90-day plan.

**Days 1 to 7:** Set up or optimise your Google Business Profile. Ensure your firm name, address, services, and contact details are accurate and complete. Do the same on VouchedFor if you are not already listed.

**Days 8 to 30:** Identify 15 to 20 long-standing clients with whom you have strong relationships. Send each a personal email explaining that you are building your online presence and would value their honest feedback. Include direct links and the gentle prompts described above.

**Days 31 to 60:** Follow up with clients who have not yet responded. Begin identifying additional clients to approach. Start responding to every review you receive — a brief, genuine acknowledgement is sufficient.

**Days 61 to 90:** Evaluate your progress. Integrate review requests into your standard client process — for example, requesting feedback after every annual review meeting. Set a target of two to three new reviews per month going forward.

Within 90 days, most firms can build a review presence that places them in the top 5% of advisers in their area. That positioning will translate directly into AI visibility, and the compound effects will continue to grow long after the initial effort.

## The Opportunity Is Clear — And Temporary

The gap between reviewed and unreviewed firms in UK financial advice is one of the most significant competitive asymmetries in any professional services sector. It will not persist indefinitely. As awareness of AI visibility grows, more firms will begin actively collecting reviews, and the bar for standing out will rise.

Right now, the barrier to entry is remarkably low. A handful of genuine, detailed client reviews can transform your firm's visibility to the AI tools that an increasing number of prospective clients use to find their adviser.

The question is not whether reviews matter for AI visibility. The evidence is clear that they do. The question is whether you will act while the competitive advantage is still available.

To see exactly how AI tools currently perceive your firm — including how your review presence affects your recommendations — check your free AI visibility score at Presenzia. It takes 30 seconds and provides a clear picture of where you stand and what to prioritise next.
    `.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

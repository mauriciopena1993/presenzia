export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-your-local-restaurant-is-invisible-to-chatgpt',
    title: "Why Your Local Restaurant Doesn't Show Up When People Ask ChatGPT",
    description: "Millions of people now ask AI for restaurant recommendations instead of searching Google. If your restaurant isn't showing up, you're losing real customers. Here's why it happens and what you can do.",
    date: '2026-01-28',
    readTime: '5 min read',
    category: 'Local Business',
    content: `
When someone is hungry and unfamiliar with an area, fewer and fewer people type "best Italian restaurant near me" into Google. Instead, they open ChatGPT or Google's AI Overview and ask: "What's a good Italian restaurant in Shoreditch?"

The AI gives them three or four names. The first name it mentions gets the booking.

If your restaurant isn't in that list, the customer never finds you. Not because you don't have great food. Not because your reviews are bad. Simply because AI doesn't know enough about you to recommend you with confidence.

## Why AI Recommends Some Restaurants and Not Others

AI platforms like ChatGPT, Claude, and Perplexity learn from the web. They build up a picture of a business based on every mention across every website, review platform, blog, and news article. When someone asks for a recommendation, the AI recommends businesses it has seen consistently cited as good examples in that category.

This means a restaurant with:
- A well-optimised Google Business Profile
- Consistent mentions in local food blogs
- Detailed reviews on multiple platforms
- A website with clear descriptions of the cuisine, atmosphere, and location

...will almost always beat a restaurant with better food but a thin online presence.

## The Gap Is Growing Fast

A year ago, AI recommendations were a curiosity. Today, they are a genuine channel for customer acquisition, especially among under-40s who have largely moved away from traditional search. Within 18 months, AI search is expected to account for 30% or more of discovery for local businesses in urban areas.

The businesses that start building their AI visibility now will have a head start that is very hard to close later.

## What You Can Do This Week

**1. Complete your Google Business Profile**
This is the single most impactful action. Fill in every field: opening hours, menu link, photos, responses to reviews. AI systems pull heavily from verified business data.

**2. Get more detailed reviews**
Generic reviews like "great food!" are less useful than specific ones: "The truffle pasta at The Oak Brasserie is the best I've had in London." Encourage happy customers to be specific in their reviews.

**3. Add a FAQ page to your website**
Create a page that answers "What is the best Italian restaurant in [your area]?" with your answer being your own restaurant. This sounds odd, but it is exactly the pattern AI systems look for.

**4. Get mentioned in local food content**
A mention in a local food blog, a city guide, or a neighbourhood newsletter carries significant weight. Reach out to local food writers.

## How Bad Is Your Current Visibility?

Most restaurant owners are shocked when they discover how little AI knows about them. A business that has been operating for ten years with consistently good reviews can still score 0 out of 100 on AI visibility, simply because no one has optimised for this new channel.

That's exactly what presenzia.ai measures. We test your restaurant across ChatGPT, Claude, Perplexity, and Google AI using the exact prompts real customers type, then tell you where you stand and what to fix.

The businesses that take this seriously now will own their category in AI search by the end of the year.
    `.trim(),
  },
  {
    slug: 'is-your-gym-invisible-to-ai',
    title: "Is Your Gym Invisible to AI? How Fitness Studios Win in the New Search Era",
    description: "A potential member asks ChatGPT to recommend a gym in your area. Do you appear? Most gyms don't. Here's the straightforward guide to fixing your AI visibility.",
    date: '2026-02-04',
    readTime: '6 min read',
    category: 'Fitness & Wellness',
    content: `
January is peak season for gyms. New Year, new resolutions, and a flood of people actively looking for a fitness studio. Increasingly, that search begins not with Google but with a direct question to an AI assistant.

"What's a good gym in Brixton with yoga classes?"

"Best CrossFit box in Manchester?"

"Affordable personal training studios in Edinburgh?"

The AI picks a handful of names and presents them as the answer. For many potential members, the conversation ends there.

## Why Most Gyms Score Poorly on AI Visibility

We have audited dozens of fitness businesses across the UK. The results follow a consistent pattern:

- **Boutique studios** (yoga, Pilates, CrossFit) tend to have slightly better visibility because they attract niche content online
- **Traditional gyms** often perform poorly because their online presence is built around generic terms that don't differentiate them
- **Personal trainers** almost universally have zero AI visibility, because their presence is largely built on Instagram rather than crawlable web content

The common factor for those who do well: **specific, location-tied content** that tells AI exactly what the business offers and where it is.

## What AI Is Looking For

When you ask an AI for a gym recommendation, it is synthesising information from many sources. It gives more weight to:

**Specificity** — "Hackney-based CrossFit box specialising in Olympic lifting and 6am early morning classes" beats "gym in East London."

**Authority** — Mentions in Time Out, local news, fitness blogs, and review aggregators signal that real humans have found this business worth writing about.

**Consistency** — A business that is described the same way across many sources is seen as reliable and established.

**Recency** — New content and recent reviews signal an active, operating business.

## The Five-Step Visibility Fix

**Step 1: Rewrite your Google Business Profile description**
Be specific about every service you offer. Don't just say "gym." Say "open plan free weights gym with daily group classes, personal training, and a specialist women's strength training programme, based in Stoke Newington."

**Step 2: Add schema markup to your website**
Schema.org markup helps AI systems understand what your business is and where it is. A developer can add this in under an hour, and it makes a measurable difference.

**Step 3: Get written up by local content**
A 300-word mention in a local lifestyle newsletter is worth more than 50 Instagram posts for AI visibility. Reach out to local writers.

**Step 4: Respond to every review with specifics**
When you respond to a review mentioning "the early morning boot camp classes," that creates another indexed piece of content associating those words with your business.

**Step 5: Measure your starting point**
You cannot improve what you cannot measure. Running an AI visibility audit before you start gives you a baseline, so you can see whether what you are doing is working.

## Gyms That Act Now Will Own Their Market

The fitness industry is intensely local. In most areas, there are only a handful of serious competitors. The gym that achieves strong AI visibility in its area by mid-2026 will likely hold that position for years, because AI systems are conservative: once they form a view of who the best options are in a market, it takes sustained new evidence to change it.

The window to be an early mover in this channel is closing. Most gym owners haven't thought about it yet. That is an opportunity.
    `.trim(),
  },
  {
    slug: 'ai-visibility-vs-seo-the-difference-every-small-business-must-understand',
    title: 'AI Visibility vs SEO: The Difference Every Small Business Must Understand',
    description: "SEO gets you found on Google. AI visibility gets you recommended by ChatGPT, Claude, and Perplexity. They're related but not the same — and both matter now.",
    date: '2026-02-11',
    readTime: '7 min read',
    category: 'Strategy',
    content: `
Ten years ago, the question was: "Does my business appear on the first page of Google?"

Today, there are two questions:

1. Does my business appear on the first page of Google?
2. Does my business get recommended when someone asks an AI assistant?

The answers can be completely different. A business can rank #1 on Google for its primary keyword and still score zero on AI visibility. And a business with modest Google rankings can be consistently recommended by ChatGPT because it has been mentioned in the right places.

Understanding the difference, and the overlap, is becoming a basic requirement for running a local business in 2026.

## What SEO Does

Traditional search engine optimisation focuses on making your website easy for Google's crawler to find, understand, and rank. The goal is to appear high in search results when someone types a query.

The main signals: keyword relevance, backlink authority, page speed, mobile optimisation, and structured data.

The result: traffic to your website from people actively searching.

## What AI Visibility Does

AI visibility is about whether language models have absorbed enough accurate, positive information about your business to recommend you when asked.

These models are trained on vast amounts of web content. They learn to associate certain businesses with certain qualities, locations, and contexts. When asked "best physiotherapist in Bristol," they recall the businesses most consistently associated with that description across their training data.

The main signals: consistent NAP (name, address, phone) data across directories, quality reviews with specific language, mentions in authoritative local content, and a website that clearly describes what you do and where.

The result: recommendations in AI conversations, which increasingly precede any website visit at all.

## Where They Overlap

Good SEO generally helps AI visibility. A well-indexed website with clear content gives AI systems reliable data to work with. Strong backlinks mean more external sites mentioning your business, which feeds AI training.

But the overlap is partial. AI systems weight signals differently from search engines. They give more relative importance to:

- **Review content** (the actual text of reviews, not just the star rating)
- **Third-party descriptions** (how other sites describe your business, not how you describe yourself)
- **Consistency** (whether the same information appears across many sources)

A business that has invested heavily in technical SEO but neglected its wider web footprint can perform well on Google and poorly with AI.

## A Practical Example

Imagine two accountancy firms in Birmingham. Firm A has a technically excellent website, fast loading times, and ranks #3 for "accountants Birmingham." But most of their online presence is their own website.

Firm B has a simpler website, ranks #8 on Google. But they have been mentioned in three local business blogs, their clients write detailed reviews that mention "small business accounting" and "VAT returns," and the local Chamber of Commerce directory has a full description of their services.

When someone asks ChatGPT "best small business accountant in Birmingham," Firm B almost certainly gets recommended. Firm A might not appear at all.

## What Smart Small Businesses Are Doing

The businesses that are ahead of this trend are building what you might call a "web footprint": a consistent, detailed presence across all the places where AI systems look for information.

This doesn't require a large budget. It requires:

- Completing and maintaining your Google Business Profile
- Actively collecting detailed reviews
- Getting mentioned in local content (directories, news, blogs)
- Writing specific, descriptive content on your own website
- Running periodic audits to check where you actually stand

The last point matters more than most business owners realise. Without measurement, you're guessing. With measurement, you can focus effort where it has the most impact.

That's what presenzia.ai is built for.
    `.trim(),
  },
  {
    slug: 'how-small-businesses-can-appear-in-chatgpt-recommendations',
    title: 'How to Make Your Small Business Appear in ChatGPT Recommendations',
    description: "A practical, no-jargon guide for UK small business owners who want to be recommended by AI assistants. No technical expertise required.",
    date: '2026-02-18',
    readTime: '8 min read',
    category: 'How-To',
    content: `
If you own a local business and someone in your area asks ChatGPT for a recommendation in your category, there are two possible outcomes: your business is mentioned, or a competitor's is.

There is no middle ground. You either get the recommendation, or someone else does.

The good news is that AI visibility for local businesses is still a wide open playing field. Most small businesses haven't started thinking about this yet. The steps to improve your position are not complex, and they are available to any business owner willing to spend a few hours on them.

Here is the practical guide.

## Understand What AI Looks At

AI assistants like ChatGPT, Claude, Perplexity, and Google AI are trained on, or actively search, web content. They build up a picture of local businesses by reading:

- Your Google Business Profile
- Review sites (Google Reviews, Trustpilot, Yelp, industry-specific directories)
- Your own website
- Local news, blogs, and directories that mention you
- Social media content that is publicly crawlable

The AI is trying to answer: "Of all the businesses in this category and location, which ones can I confidently recommend?"

It recommends businesses that have a clear, consistent, positive presence across multiple sources.

## The 6 Steps

**Step 1: Complete your Google Business Profile fully**

This is the most important single action. Log into Google Business Profile and fill in every field:
- Business description (be specific: what you do, who for, what makes you different)
- All relevant categories
- Opening hours (kept up to date)
- Photos (at least 10, including of your premises)
- Products or services listed with descriptions
- Website link

If you haven't verified your profile, do that first. An unverified profile carries very little weight.

**Step 2: Get on the right directories**

For UK businesses: Yell.com, Checkatrade (for trades), FreeIndex, Thomson Local, and any industry-specific directories. Each listing is another source of consistent information about your business.

Consistency matters. Your business name, address, and phone number should be identical everywhere.

**Step 3: Collect detailed reviews**

Reviews are powerful AI training data. Ask satisfied customers to leave reviews that mention:
- What they hired you for specifically
- The location
- What made the experience positive

A review that says "Sarah fixed our blocked drain in under an hour in Hackney, absolute lifesaver" is worth ten that say "great service 5 stars."

The best time to ask is immediately after a positive interaction. A text message with a direct link to your Google review page works well.

**Step 4: Get mentioned by others**

The most trusted signal is when someone other than you describes your business positively. Pursue:

- A mention in a local neighbourhood newsletter
- A listing in your local council's business directory
- Coverage in a local news article
- A feature in a local blogger's recommendations
- Membership of your local Chamber of Commerce or FSB

You don't need national press. Local mentions are exactly what AI systems use for local recommendations.

**Step 5: Write specific content on your website**

Your website should answer the questions that AI is being asked. Add pages or sections that specifically address:

- "Best [your business type] in [your town]"
- FAQ pages answering common questions about your services
- Case studies or testimonials that mention your location

The language should be natural, not stuffed with keywords. You're writing for people, but the information should be clear enough for an AI to understand your relevance.

**Step 6: Measure your results**

None of the above is worth doing if you can't tell whether it's working.

Most business owners who start paying attention to AI visibility are surprised by how quickly improvements show up in audit scores. The landscape is moving fast, and businesses that start measuring now have a real advantage over those that wait.

## What Not to Do

**Don't try to game AI directly.** There is no equivalent of keyword stuffing for AI. Attempts to manipulate AI recommendations through fake reviews or low-quality mass content creation generally backfire, damaging your reputation and your visibility.

**Don't rely only on social media.** Instagram and TikTok content is largely invisible to AI training data. It matters for direct engagement with customers, but it does not build AI visibility the way indexed web content does.

**Don't assume your current SEO is enough.** As described, SEO and AI visibility overlap but are not the same thing. A business ranking well on Google can still score very poorly with AI assistants.

## The Bottom Line

Your potential customers are already asking AI for recommendations. The businesses being recommended right now are the ones that happen to have a strong web footprint, not necessarily the best businesses.

That gap is an opportunity. The businesses that deliberately build their AI visibility over the next 12 months will own their local market in AI search for years to come.

Start by finding out where you stand.
    `.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';

// High-value posts get priority 0.8, others 0.6
const HIGH_PRIORITY_SLUGS = new Set([
  'we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible',
  'what-makes-ai-recommend-one-financial-advisor-over-another',
  'ai-visibility-checklist-15-things-every-uk-financial-adviser-should-fix',
  'geo-vs-seo-why-google-rankings-are-no-longer-enough-for-financial-advisers',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://presenzia.ai';

  // Use today's date for posts updated with cross-links and expanded content
  const contentUpdateDate = new Date('2026-03-11');

  const blogPostUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: contentUpdateDate,
    changeFrequency: 'monthly' as const,
    priority: HIGH_PRIORITY_SLUGS.has(post.slug) ? 0.8 : 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/score`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...blogPostUrls,
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}

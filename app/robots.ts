import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/onboarding', '/success', '/dashboard', '/admin'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/onboarding', '/success', '/dashboard', '/admin'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/onboarding', '/success', '/dashboard', '/admin'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/onboarding', '/success', '/dashboard', '/admin'],
      },
    ],
    sitemap: 'https://presenzia.ai/sitemap.xml',
  };
}

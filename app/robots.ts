import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/onboarding', '/success', '/dashboard'],
      },
    ],
    sitemap: 'https://presenzia.ai/sitemap.xml',
  };
}

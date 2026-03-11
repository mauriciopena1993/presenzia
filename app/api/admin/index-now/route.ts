import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin-auth';
import { BLOG_POSTS } from '@/lib/blog-posts';

const INDEXNOW_KEY = '620f1b91770c452ea15d787457f50105';
const BASE_URL = 'https://presenzia.ai';

// All public URLs to submit for indexing
function getAllUrls(): string[] {
  const staticPages = [
    BASE_URL,
    `${BASE_URL}/score`,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/about`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`,
  ];

  const blogUrls = BLOG_POSTS.map(p => `${BASE_URL}/blog/${p.slug}`);

  return [...staticPages, ...blogUrls];
}

export async function POST() {
  // Admin-only endpoint
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const urls = getAllUrls();

  // Submit to IndexNow (reaches Bing, Yandex, DuckDuckGo)
  const results: { engine: string; status: number; ok: boolean }[] = [];

  for (const engine of ['api.indexnow.org', 'www.bing.com', 'yandex.com']) {
    try {
      const res = await fetch(`https://${engine}/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: 'presenzia.ai',
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: urls,
        }),
      });
      results.push({ engine, status: res.status, ok: res.ok || res.status === 202 });
    } catch (err) {
      results.push({ engine, status: 0, ok: false });
    }
  }

  return NextResponse.json({
    success: true,
    urlCount: urls.length,
    urls,
    results,
    message: `Submitted ${urls.length} URLs to IndexNow (Bing, Yandex, DuckDuckGo)`,
  });
}

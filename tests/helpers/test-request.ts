/**
 * Helper to create NextRequest objects for testing API route handlers directly.
 */
import { NextRequest } from 'next/server';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}

/**
 * Create a NextRequest for testing route handlers.
 * Usage: const req = createRequest('/api/checkout', { method: 'POST', body: { plan: 'audit' } });
 */
export function createRequest(path: string, options: RequestOptions = {}): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options;

  const url = new URL(path, 'http://localhost:3000');
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init as never);
}

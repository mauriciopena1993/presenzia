'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  slug: string;
  title: string;
}

export default function BlogScrollTracker({ slug, title }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (fired.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = scrollTop / docHeight;
      if (percent >= 0.8) {
        fired.current = true;
        track.blogRead(slug, title);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, title]);

  return null;
}

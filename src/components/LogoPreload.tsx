'use client';

import { useEffect } from 'react';

import { SITE_IMAGE, SITE_IMAGE_DARK } from '@/lib/constants';

export default function LogoPreload() {
  useEffect(() => {
    let theme = 'light';

    try {
      const stored =
        localStorage.getItem('morning-portion-theme') ||
        localStorage.getItem('daily-word-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = stored || (prefersDark ? 'dark' : 'light');
    } catch {
      // Ignore storage access errors.
    }

    const href = theme === 'dark' ? SITE_IMAGE_DARK : SITE_IMAGE;
    const exists = Array.from(document.head.querySelectorAll('link[rel="preload"][as="image"]')).some(
      (link) => link.getAttribute('href') === href,
    );
    if (exists) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }, []);

  return null;
}

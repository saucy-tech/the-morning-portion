import Link from 'next/link';

import { PERSONAL_SITE_URL } from '@/lib/constants';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>The Daily Word</p>
      <nav aria-label="Footer navigation">
        <Link href="/rss.xml">RSS</Link>
        <a href={PERSONAL_SITE_URL}>Saucy.Tech</a>
      </nav>
    </footer>
  );
}

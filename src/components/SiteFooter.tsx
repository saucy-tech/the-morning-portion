import Link from 'next/link';

import { PERSONAL_SITE_URL, SITE_NAME } from '@/lib/constants';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{SITE_NAME}</p>
      <nav aria-label="Footer navigation">
        <Link href="/support">Support</Link>
        <Link href="/rss.xml">RSS</Link>
        <a href={PERSONAL_SITE_URL}>Saucy.Tech</a>
      </nav>
    </footer>
  );
}

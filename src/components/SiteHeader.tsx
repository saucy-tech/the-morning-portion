import Link from 'next/link';

import ThemeToggle from '@/components/ThemeToggle';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        The Daily Word
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#latest">Latest</Link>
        <Link href="/#archive">Archive</Link>
        <Link href="/#subscribe">Subscribe</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

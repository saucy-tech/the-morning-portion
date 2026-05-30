import Image from 'next/image';
import Link from 'next/link';

import ThemeToggle from '@/components/ThemeToggle';
import { SITE_NAME } from '@/lib/constants';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <Image
          className="brand-mark brand-mark-light"
          src="/images/mark.png"
          alt=""
          width={55}
          height={30}
        />
        <Image
          className="brand-mark brand-mark-dark"
          src="/images/mark-dark.png"
          alt=""
          width={55}
          height={30}
        />
        <span>{SITE_NAME}</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/">Today</Link>
        <Link href="/#archive">Archive</Link>
        <Link href="/#series">Series</Link>
      </nav>
      <div className="site-header-actions">
        <ThemeToggle />
        <Link className="button primary" href="/#subscribe">
          Subscribe
        </Link>
      </div>
    </header>
  );
}

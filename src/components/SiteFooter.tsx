import Image from 'next/image';
import Link from 'next/link';

import { FACEBOOK_URL, PERSONAL_SITE_URL, SITE_NAME, X_URL } from '@/lib/constants';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{SITE_NAME}</p>
      <nav aria-label="Footer navigation">
        <Link href="/rss.xml">RSS</Link>
        <a href={PERSONAL_SITE_URL}>Saucy.Tech</a>
        <a
          className="footer-social"
          href={FACEBOOK_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={`${SITE_NAME} on Facebook`}
        >
          <Image
            className="footer-social-icon"
            src="/icons/facebook.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </a>
        <a
          className="footer-social"
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={`${SITE_NAME} on X`}
        >
          <Image
            className="footer-social-icon"
            src="/icons/x.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </a>
      </nav>
    </footer>
  );
}

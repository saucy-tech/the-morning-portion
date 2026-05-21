import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { SITE_DESCRIPTION, SITE_IMAGE, SITE_NAME, SITE_URL } from '@/lib/constants';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--tdw-serif',
  axes: ['SOFT', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--tdw-sans',
});

export const viewport: Viewport = {
  themeColor: '#FBF6EC',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Brandon' }],
  creator: 'Brandon',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_IMAGE,
        width: 1254,
        height: 1254,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}${SITE_IMAGE}`],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const enableVercelScripts = process.env.VERCEL === '1';
  const themeScript = `
    (() => {
      try {
        const stored =
          localStorage.getItem('morning-portion-theme') ||
          localStorage.getItem('daily-word-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      } catch {
        document.documentElement.dataset.theme = 'light';
      }
    })();
  `;

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script id="morning-portion-theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteHeader />
        {children}
        <SiteFooter />
        {enableVercelScripts && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}

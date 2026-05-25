import Link from 'next/link';

import { Sun } from '@/components/Ornaments';
import PostList from '@/components/PostList';
import SubscribeForm from '@/components/SubscribeForm';
import { getReadingTime, seriesSlug } from '@/lib/format';
import { SITE_IMAGE, SITE_IMAGE_DARK, SITE_NAME } from '@/lib/constants';
import {
  getAllPostsMeta,
  getAllSeries,
  getLatestPost,
  getPostBySlug,
  getPostNumbers,
} from '@/lib/posts';

function devotionNumber(n: number): string {
  return `№ ${String(n).padStart(3, '0')}`;
}

function formatHeroDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!match) return date;
  const [, year, month, day] = match;
  const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc);
}

export default async function Home() {
  const allPosts = getAllPostsMeta();
  const latest = getLatestPost();
  const series = getAllSeries();
  const recentPosts = allPosts.slice(1, 7);
  const totalCount = allPosts.length;
  const numbers = getPostNumbers();

  const latestFull = latest ? await getPostBySlug(latest.slug) : null;
  const readingTime = latestFull ? getReadingTime(latestFull.content) : 0;
  const verse = latest?.verse;
  const reference = latest?.reference;
  const logoPreloadScript = `
    (() => {
      let theme = 'light';
      try {
        const stored =
          localStorage.getItem('morning-portion-theme') ||
          localStorage.getItem('daily-word-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = stored || (prefersDark ? 'dark' : 'light');
      } catch {}

      const href = theme === 'dark' ? ${JSON.stringify(SITE_IMAGE_DARK)} : ${JSON.stringify(SITE_IMAGE)};
      const exists = Array.from(document.head.querySelectorAll('link[rel="preload"][as="image"]'))
        .some((link) => link.getAttribute('href') === href);
      if (exists) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    })();
  `;

  return (
    <main>
      {latest && (
        <>
          <script dangerouslySetInnerHTML={{ __html: logoPreloadScript }} />
          <section className="brand-band" aria-label={SITE_NAME}>
            <div className="brand-band-logo" role="img" aria-label={SITE_NAME} />
          </section>
        </>
      )}
      {latest && (
        <section className="hero" aria-label="Today's reflection">
          <div className="hero-ornament">
            <Sun size={300} />
          </div>
          <div className="hero-inner">
            <div className="hero-meta-row">
              <span className="eyebrow">{formatHeroDate(latest.date)}</span>
              <span className="rule" aria-hidden="true" />
              <span className="stamp">{devotionNumber(totalCount)}</span>
            </div>
            {reference && (
              <p className="hero-source">
                From today&apos;s reading — <em>{reference}</em>
              </p>
            )}
            <h1 className="tdw-display hero-verse">
              {verse ? (
                <>
                  <span className="quote">&ldquo;</span>
                  {verse}
                  <span className="quote">&rdquo;</span>
                </>
              ) : (
                latest.title
              )}
            </h1>
            <div className="hero-actions">
              <Link className="button primary" href={`/posts/${latest.slug}`}>
                Read today&apos;s reflection →
              </Link>
              {latest.audio && (
                <Link className="button ghost" href={`/posts/${latest.slug}?listen=1`}>
                  Listen to devotion →
                </Link>
              )}
              <span className="meta">
                <em>{latest.title}</em>
                {readingTime > 0 && ` · ${readingTime} min`}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="section" id="archive">
        <div className="section-inner">
          <div className="section-heading">
            <p className="eyebrow">This week</p>
            <h2 className="tdw-display">
              Recent <span className="accent">readings</span>
            </h2>
          </div>
          <PostList
            posts={recentPosts.length > 0 ? recentPosts : allPosts}
            numbers={numbers}
          />
        </div>
      </section>

      <section className="section subscribe-section" id="subscribe">
        <div className="section-inner subscribe-grid">
          <div className="section-heading">
            <p className="eyebrow">Email</p>
            <h2 className="tdw-display">
              Never miss a <span className="accent">morning.</span>
            </h2>
            <p>Short, KJV-rooted readings for people who want the Word before the day gets loud.</p>
          </div>
          <SubscribeForm />
        </div>
      </section>

      {series.length > 0 && (
        <section className="section" id="series" aria-label="Series">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">{series.length} Series</p>
              <h2 className="tdw-display">
                Study the <span className="accent">series.</span>
              </h2>
            </div>
            <div className="series-grid">
              {series.map((item) => (
                <Link
                  key={item.slug}
                  className="series-item"
                  href={`/series/${seriesSlug(item.name)}`}
                >
                  <span>{item.count} readings</span>
                  <h3>{item.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

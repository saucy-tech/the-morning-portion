import Link from 'next/link';

import { Sun } from '@/components/Ornaments';
import PostList from '@/components/PostList';
import SubscribeForm from '@/components/SubscribeForm';
import { getReadingTime, seriesSlug } from '@/lib/format';
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

  return (
    <main>
      {latest && (
        <section className="hero" aria-label="The Morning Portion — a daily scripture reading">
          <div className="hero-ornament">
            <Sun size={300} />
          </div>
          <div className="hero-inner hero-pitch">
            <p className="eyebrow">Every weekday morning</p>
            <h1 className="tdw-display hero-headline">
              The Word, before the day gets <span className="accent">loud.</span>
            </h1>
            <p className="hero-lede">
              A short, KJV-rooted reading in your inbox each weekday morning. Always free.
              Unsubscribe anytime.
            </p>
            <div className="hero-subscribe">
              <div className="hero-subscribe-head">
                <span className="eyebrow">Start tomorrow morning</span>
                <span className="rule" aria-hidden="true" />
              </div>
              <SubscribeForm cta="Receive the morning portion" loadingLabel="Sending" />
            </div>
            <Link className="hero-today" href={`/posts/${latest.slug}`}>
              <span className="hero-today-meta">
                <span className="eyebrow">Today · {formatHeroDate(latest.date)}</span>
                <span className="rule" aria-hidden="true" />
                <span className="stamp">{devotionNumber(totalCount)}</span>
              </span>
              <h2 className="hero-today-title">{latest.title}</h2>
              {verse ? (
                <p className="hero-today-verse verse">
                  &ldquo;{verse}&rdquo;
                  {reference && <span className="hero-today-ref"> — {reference}</span>}
                </p>
              ) : (
                <p className="hero-today-excerpt">{latest.excerpt}</p>
              )}
              <span className="hero-today-cta">
                Read today&apos;s portion
                {readingTime > 0 && <span className="hero-today-time"> · {readingTime} min</span>}
                <span className="arrow" aria-hidden="true">
                  {' '}
                  →
                </span>
              </span>
            </Link>
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

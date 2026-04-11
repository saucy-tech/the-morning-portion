import Link from 'next/link';

import PostList from '@/components/PostList';
import SubscribeForm from '@/components/SubscribeForm';
import { formatPostDate, seriesSlug } from '@/lib/format';
import { getAllPostsMeta, getAllSeries, getLatestPost } from '@/lib/posts';

export default function Home() {
  const posts = getAllPostsMeta();
  const latest = getLatestPost();
  const series = getAllSeries();
  const recentPosts = posts.slice(1, 7);

  return (
    <main>
      <section className="hero" aria-label="The Daily Word">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Weekday Scripture Reflection</p>
          <h1>The Daily Word</h1>
          <p>
            Start the morning with a short reflection rooted in the Sunday School lesson series.
          </p>
          <div className="hero-actions">
            {latest && (
              <Link className="button primary" href={`/posts/${latest.slug}`}>
                Read latest
              </Link>
            )}
            <a className="button secondary" href="#subscribe">
              Subscribe
            </a>
          </div>
        </div>
      </section>

      {latest && (
        <section className="latest-section" id="latest">
          <div className="section-heading">
            <p className="eyebrow">Latest</p>
            <h2>{latest.title}</h2>
            <p>{latest.excerpt}</p>
          </div>
          <div className="latest-meta">
            <span>{formatPostDate(latest.date)}</span>
            {latest.series && (
              <Link href={`/series/${seriesSlug(latest.series)}`}>{latest.series}</Link>
            )}
          </div>
          <Link className="text-link" href={`/posts/${latest.slug}`}>
            Continue reading
          </Link>
        </section>
      )}

      <section className="subscribe-section" id="subscribe">
        <div className="section-heading">
          <p className="eyebrow">Email</p>
          <h2>Free weekday reflections.</h2>
          <p>Short, KJV-rooted readings for people who want the Word before the day gets loud.</p>
        </div>
        <SubscribeForm />
      </section>

      <section className="archive-section" id="archive">
        <div className="section-heading">
          <p className="eyebrow">{posts.length} Reflections</p>
          <h2>Archive</h2>
        </div>
        <PostList posts={recentPosts.length > 0 ? recentPosts : posts} />
      </section>

      {series.length > 0 && (
        <section className="series-section" aria-label="Series">
          <div className="section-heading">
            <p className="eyebrow">{series.length} Series</p>
            <h2>Read by series.</h2>
          </div>
          <div className="series-grid">
            {series.map((item) => (
              <Link key={item.slug} className="series-item" href={`/series/${item.slug}`}>
                <span>{item.count} readings</span>
                <h3>{item.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

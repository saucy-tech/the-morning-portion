import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

import SubscribeForm from '@/components/SubscribeForm';
import { formatPostDate, getReadingTime, seriesSlug } from '@/lib/format';
import { getAllPostsMeta, getPostBySlug, getPostOgMeta, getPostUrl } from '@/lib/posts';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export async function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const metadata = await getPostOgMeta(slug);
  if (!metadata) {
    notFound();
  }

  return metadata;
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const readingTime = getReadingTime(post.content);
  const relatedPosts = getAllPostsMeta()
    .filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) => !post.series || candidate.series === post.series)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: getPostUrl(post.slug),
    author: {
      '@type': 'Person',
      name: 'Brandon',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    articleSection: 'Daily Word',
    keywords: post.tags,
  };

  return (
    <main className="post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">The Daily Word</Link>
        <span>/</span>
        <span>{post.title}</span>
      </nav>

      <article className="reading-layout">
        <header className="post-header">
          <p className="eyebrow">Daily Word</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="post-meta">
            <span>{formatPostDate(post.date)}</span>
            <span>{readingTime} min read</span>
            {post.series && (
              <Link href={`/series/${seriesSlug(post.series)}`}>{post.series}</Link>
            )}
          </div>
        </header>

        <div className="post-body">
          <MDXRemote source={post.content} />
        </div>
      </article>

      <section className="subscribe-section compact">
        <div className="section-heading">
          <p className="eyebrow">Email</p>
          <h2>Get the next reflection.</h2>
        </div>
        <SubscribeForm />
      </section>

      {relatedPosts.length > 0 && (
        <section className="archive-section">
          <div className="section-heading">
            <p className="eyebrow">Keep Reading</p>
            <h2>More from this thread.</h2>
          </div>
          <div className="post-list compact">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} className="post-row" href={`/posts/${relatedPost.slug}`}>
                <div>
                  <p className="metadata">{formatPostDate(relatedPost.date)}</p>
                  <h3>{relatedPost.title}</h3>
                </div>
                <span aria-hidden="true">Read</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

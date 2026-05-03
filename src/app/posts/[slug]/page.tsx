import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

import PostList from '@/components/PostList';
import SubscribeForm from '@/components/SubscribeForm';
import { formatPostDate, getReadingTime, seriesSlug } from '@/lib/format';
import {
  getAllPostsMeta,
  getPostBySlug,
  getPostNumbers,
  getPostOgMeta,
  getPostUrl,
} from '@/lib/posts';
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

  const allPosts = getAllPostsMeta();
  const numbers = getPostNumbers();
  const number = numbers.get(post.slug);
  const readingTime = getReadingTime(post.content);
  const relatedPosts = allPosts
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
        <span aria-hidden="true">/</span>
        {post.series && (
          <>
            <Link href={`/series/${seriesSlug(post.series)}`}>{post.series}</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span>{post.title}</span>
      </nav>

      <article className="reading-layout">
        <header className="post-header">
          {typeof number === 'number' && (
            <p className="stamp">№ {String(number).padStart(3, '0')}</p>
          )}
          <h1>{post.title}</h1>
          <p className="excerpt">{post.excerpt}</p>
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

      <section className="section subscribe-section">
        <div className="section-inner subscribe-grid">
          <div className="section-heading">
            <p className="eyebrow">Stay in the Word</p>
            <h2 className="tdw-display">
              Get the next <span className="accent">reflection.</span>
            </h2>
          </div>
          <SubscribeForm />
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Keep reading</p>
              <h2 className="tdw-display">
                More from this <span className="accent">thread.</span>
              </h2>
            </div>
            <PostList posts={relatedPosts} compact numbers={numbers} />
          </div>
        </section>
      )}
    </main>
  );
}

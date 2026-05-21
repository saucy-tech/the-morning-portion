import Link from 'next/link';
import { notFound } from 'next/navigation';

import PostList from '@/components/PostList';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { getAllSeries, getPostNumbers, getSeriesBySlug } from '@/lib/posts';

export async function generateStaticParams() {
  return getAllSeries().map((series) => ({ series: series.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }) {
  const { series: seriesParam } = await params;
  const series = getSeriesBySlug(seriesParam);
  if (!series) {
    notFound();
  }

  return {
    title: series.name,
    description: `${series.count} Morning Portion reflections from ${series.name}.`,
    alternates: {
      canonical: `${SITE_URL}/series/${series.slug}`,
    },
    openGraph: {
      title: `${series.name} | ${SITE_NAME}`,
      description: `${series.count} Morning Portion reflections from ${series.name}.`,
      url: `${SITE_URL}/series/${series.slug}`,
    },
  };
}

interface SeriesPageProps {
  params: Promise<{ series: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { series: seriesParam } = await params;
  const series = getSeriesBySlug(seriesParam);
  if (!series) {
    notFound();
  }

  const numbers = getPostNumbers();

  return (
    <main className="series-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">{SITE_NAME}</Link>
        <span aria-hidden="true">/</span>
        <span>{series.name}</span>
      </nav>

      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <p className="eyebrow">{series.count} Reflections</p>
            <h1 className="tdw-display">{series.name}</h1>
            <p>Read the series in order, from the first reflection to the most recent.</p>
          </div>
          <PostList posts={series.posts} numbers={numbers} />
        </div>
      </section>
    </main>
  );
}

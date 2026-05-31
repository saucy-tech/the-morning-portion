import { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/constants';
import { getAllPostsMeta, getAllSeries } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta().map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const seriesPages = getAllSeries().map((series) => ({
    url: `${SITE_URL}/series/${series.slug}`,
    lastModified: series.posts[series.posts.length - 1]?.date ?? new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/rss.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...seriesPages,
    ...posts,
  ];
}

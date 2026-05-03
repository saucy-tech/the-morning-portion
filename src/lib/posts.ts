import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

import matter from 'gray-matter';
import yaml from 'js-yaml';
import { z } from 'zod';

import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { seriesSlug } from '@/lib/format';

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  series?: string;
  tags: string[];
  verse?: string;
  reference?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export interface SeriesMeta {
  name: string;
  slug: string;
  posts: PostMeta[];
  count: number;
}

interface PostQueryOptions {
  includeFuture?: boolean;
}

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: z.string().min(1),
  category: z.string().optional(),
  series: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  verse: z.string().optional(),
  reference: z.string().optional(),
});

// Configure gray-matter to use js-yaml 4.x's load function.
// @ts-expect-error gray-matter supports custom engines at runtime.
matter.engines.yaml = {
  parse: (str: string) => yaml.load(str) as Record<string, unknown>,
  stringify: (obj: Record<string, unknown>) => yaml.dump(obj),
};

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const SITE_TIME_ZONE = 'America/New_York';

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function getPostPath(slug: string): string {
  return path.join(POSTS_DIR, `${slug}.mdx`);
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeTags(value: unknown): string[] {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const seen = new Set<string>();

  return rawTags
    .map((tag) => normalizeText(tag))
    .filter((tag): tag is string => Boolean(tag))
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function toPostMeta(slug: string, data: Record<string, unknown>): PostMeta {
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Frontmatter validation failed for "${slug}.mdx":\n${issues}`);
  }

  return {
    slug,
    title: result.data.title,
    date: result.data.date,
    excerpt: result.data.excerpt,
    series: normalizeText(result.data.series),
    tags: normalizeTags(result.data.tags),
    verse: normalizeText(result.data.verse),
    reference: normalizeText(result.data.reference),
  };
}

function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function isPublishedDate(date: string): boolean {
  return !date || date <= getTodayDateString();
}

export function getPostSlugs(): string[] {
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

export function getAllPostsMeta(options: PostQueryOptions = {}): PostMeta[] {
  const { includeFuture = false } = options;

  return getPostSlugs()
    .map((slug) => {
      const fileContent = fs.readFileSync(getPostPath(slug), 'utf-8');
      const { data } = matter(fileContent);
      return toPostMeta(slug, data);
    })
    .filter((post) => includeFuture || isPublishedDate(post.date))
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export async function getPostBySlug(
  slug: string,
  options: PostQueryOptions = {}
): Promise<Post | null> {
  const { includeFuture = false } = options;
  const postPath = getPostPath(slug);
  if (!fs.existsSync(postPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(postPath, 'utf-8');
  const { data, content } = matter(fileContent);
  const post = {
    ...toPostMeta(slug, data),
    content,
  };

  if (!includeFuture && !isPublishedDate(post.date)) {
    return null;
  }

  return post;
}

export function getLatestPost(): PostMeta | undefined {
  return getAllPostsMeta()[0];
}

export function getAllSeries(): SeriesMeta[] {
  const seriesMap = new Map<string, PostMeta[]>();

  getAllPostsMeta().forEach((post) => {
    if (!post.series) {
      return;
    }

    const existing = seriesMap.get(post.series) ?? [];
    existing.push(post);
    seriesMap.set(post.series, existing);
  });

  return Array.from(seriesMap.entries())
    .map(([name, posts]) => {
      const sorted = posts.sort((a, b) => a.date.localeCompare(b.date));
      return {
        name,
        slug: seriesSlug(name),
        posts: sorted,
        count: sorted.length,
      };
    })
    .sort((a, b) => {
      const aLatest = a.posts[a.posts.length - 1]?.date ?? '';
      const bLatest = b.posts[b.posts.length - 1]?.date ?? '';
      return bLatest.localeCompare(aLatest) || a.name.localeCompare(b.name);
    });
}

export function getSeriesBySlug(slug: string): SeriesMeta | undefined {
  return getAllSeries().find((series) => series.slug === slug);
}

export function getPostUrl(slug: string): string {
  return `${SITE_URL}/posts/${slug}`;
}

export function getPostOgImageUrl(slug: string): string {
  return `${SITE_URL}/posts/${slug}/opengraph-image`;
}

export async function getPostOgMeta(slug: string): Promise<Metadata | null> {
  const post = await getPostBySlug(slug);
  if (!post) {
    return null;
  }

  const imageUrl = getPostOgImageUrl(slug);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: getPostUrl(slug),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: getPostUrl(slug),
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
  };
}

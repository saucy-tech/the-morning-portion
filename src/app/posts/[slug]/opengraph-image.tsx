import { ImageResponse } from 'next/og';

import { formatPostDate } from '@/lib/format';
import { getAllPostsMeta, getPostBySlug } from '@/lib/posts';
import { SITE_NAME } from '@/lib/constants';

export const alt = `${SITE_NAME} preview image`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FBF7ED',
          color: '#0B2633',
          fontSize: '40px',
          fontWeight: 500,
        }}
      >
        {SITE_NAME}
      </div>,
      { ...size }
    );
  }

  const titleFontSize = post.title.length > 72 ? 48 : post.title.length > 44 ? 58 : 68;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#FBF7ED',
        color: '#0B2633',
        padding: '64px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px' }}>
        <div style={{ display: 'flex', color: '#B8842D', fontWeight: 500 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', color: '#64705C' }}>{formatPostDate(post.date)}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '980px' }}>
        {post.series && (
          <div style={{ display: 'flex', color: '#64705C', fontSize: '28px' }}>{post.series}</div>
        )}
        <div
          style={{
            display: 'flex',
            fontSize: titleFontSize,
            lineHeight: 1.08,
            fontWeight: 500,
          }}
        >
          {post.title}
        </div>
        <div style={{ display: 'flex', color: '#344553', fontSize: '28px', lineHeight: 1.35 }}>
          {post.excerpt}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#64705C' }}>
        <div style={{ width: '56px', height: '4px', background: '#B8842D' }} />
        <div style={{ display: 'flex', fontSize: '22px' }}>Morning Scripture Reflection</div>
      </div>
    </div>,
    { ...size }
  );
}

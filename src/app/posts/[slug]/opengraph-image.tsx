import { ImageResponse } from 'next/og';

import { formatPostDate } from '@/lib/format';
import { getAllPostsMeta, getPostBySlug } from '@/lib/posts';

export const alt = 'The Daily Word preview image';
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
          background: '#ffffff',
          color: '#171A20',
          fontSize: '40px',
          fontWeight: 500,
        }}
      >
        The Daily Word
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
        background: '#FFFFFF',
        color: '#171A20',
        padding: '64px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px' }}>
        <div style={{ display: 'flex', color: '#3E6AE1', fontWeight: 500 }}>
          The Daily Word
        </div>
        <div style={{ display: 'flex', color: '#5C5E62' }}>{formatPostDate(post.date)}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '980px' }}>
        {post.series && (
          <div style={{ display: 'flex', color: '#5C5E62', fontSize: '28px' }}>{post.series}</div>
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
        <div style={{ display: 'flex', color: '#393C41', fontSize: '28px', lineHeight: 1.35 }}>
          {post.excerpt}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#8E8E8E' }}>
        <div style={{ width: '56px', height: '4px', background: '#3E6AE1' }} />
        <div style={{ display: 'flex', fontSize: '22px' }}>Weekday Scripture Reflection</div>
      </div>
    </div>,
    { ...size }
  );
}

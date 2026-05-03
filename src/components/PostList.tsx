import Link from 'next/link';

import { formatPostDate } from '@/lib/format';
import type { PostMeta } from '@/lib/posts';

interface PostListProps {
  posts: PostMeta[];
  compact?: boolean;
  numbers: Map<string, number>;
}

export default function PostList({ posts, compact = false, numbers }: PostListProps) {
  return (
    <ol className="post-list">
      {posts.map((post) => {
        const number = numbers.get(post.slug);
        return (
          <li key={post.slug}>
            <Link className={compact ? 'post-row compact' : 'post-row'} href={`/posts/${post.slug}`}>
              {typeof number === 'number' && (
                <span className="stamp">№{String(number).padStart(3, '0')}</span>
              )}
              <div>
                <p className="row-meta">
                  {formatPostDate(post.date)}
                  {post.series ? ` · ${post.series}` : ''}
                </p>
                <h3>{post.title}</h3>
              </div>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

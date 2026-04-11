import Link from 'next/link';

import { formatPostDate } from '@/lib/format';
import type { PostMeta } from '@/lib/posts';

interface PostListProps {
  posts: PostMeta[];
  compact?: boolean;
}

export default function PostList({ posts, compact = false }: PostListProps) {
  return (
    <div className={compact ? 'post-list compact' : 'post-list'}>
      {posts.map((post) => (
        <Link key={post.slug} className="post-row" href={`/posts/${post.slug}`}>
          <div>
            <p className="metadata">{formatPostDate(post.date)}</p>
            <h3>{post.title}</h3>
            {!compact && <p>{post.excerpt}</p>}
          </div>
          <span aria-hidden="true">Read</span>
        </Link>
      ))}
    </div>
  );
}

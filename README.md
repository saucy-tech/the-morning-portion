# The Daily Word

Standalone Next.js application for The Daily Word, a weekday scripture reflection project spun out from `personal-site`.

## Local Development

```bash
pnpm install
pnpm dev
```

## Content Sync

Daily Word posts are stored in `src/content/posts`. To refresh them from the local personal-site repo:

```bash
pnpm sync:posts
```

By default, the script reads from `../personal-site/src/posts`. Override with:

```bash
PERSONAL_SITE_POSTS_DIR=/path/to/posts pnpm sync:posts
```

## Environment

Copy `.env.example` to `.env.local` for a fresh setup. Reuse the applicable Kit/ConvertKit values from `personal-site`; `.env.local` is ignored and must not be committed.

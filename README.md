# The Daily Word

Standalone Next.js application for The Daily Word, a weekday scripture reflection project spun out from `personal-site`.

## Stack

- Next.js 16 (App Router) on Vercel Fluid Compute
- React 19, TypeScript
- MDX content via `next-mdx-remote`
- Fraunces (variable serif) + Inter via `next/font/google`
- Tailwind 3 base + custom token system in `src/app/globals.css`
- ConvertKit for the subscribe flow
- `@vercel/analytics` + `@vercel/speed-insights`

See [DESIGN.md](DESIGN.md) for the visual identity (Direction A: verse-as-typography).

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

## Post frontmatter

Each MDX file in `src/content/posts/` carries:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Used in the post header and lists |
| `date` | yes | `YYYY-MM-DD`. Future dates are hidden in production. |
| `excerpt` | yes | Shown under the title and in OG cards |
| `series` | no | Groups posts on `/series/[slug]` |
| `category` | no | Free-form |
| `tags` | no | Array or comma-separated string |
| `verse` | no | Activates the verse-as-typography hero on the home page when present on the latest post |
| `reference` | no | Companion to `verse` (e.g. `"Matthew 16:25 (KJV)"`) — printed in italic above the verse |

When `verse` is absent on the latest post, the hero falls back to the title in big Fraunces. Schema enforced in `src/lib/posts.ts`.

The numbered colophon (`№NNN`) is computed automatically from the global post ordering — no per-post field needed.

## Environment

Copy `.env.example` to `.env.local` for a fresh setup. Reuse the applicable Kit/ConvertKit values from `personal-site`; `.env.local` is ignored and must not be committed.

### GitHub Secrets

No GitHub repository secrets or variables are required right now. This app does not include a GitHub Actions broadcast workflow.

### Vercel Environment Variables

Set these in Vercel after connecting `saucy-tech/the-daily-word`:

| Name | Required | Source |
| --- | --- | --- |
| `CONVERTKIT_API_KEY` | Yes | Copy the value from `personal-site` |
| `CONVERTKIT_FORM_ID` | Yes | Copy the value from `personal-site` |
| `NEXT_PUBLIC_DAILY_WORD_URL` | Recommended | Set to the stable Vercel production URL once Vercel creates it |
| `NEXT_PUBLIC_PERSONAL_SITE_URL` | Optional | Defaults to `https://saucy.tech` |

Do not copy `CK_SECRET_KEY`, `CK_PUBLISHER_ID`, or `KIT_API_KEY` unless a future broadcast workflow is added to this repo. Those are not used by the current app.

Vercel should use the default project settings:

- Framework preset: Next.js
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: Next.js default

# The Morning Portion

Standalone Next.js application for The Morning Portion, a morning scripture reflection project spun out from `personal-site`.

## Stack

- Next.js 16 (App Router) on Vercel Fluid Compute
- React 19, TypeScript
- MDX content via `next-mdx-remote`
- Fraunces (variable serif) + Inter via `next/font/google`
- Tailwind 3 base + custom token system in `src/app/globals.css`
- Kit/ConvertKit for the subscribe flow and manual broadcast draft creation
- `@vercel/analytics` + `@vercel/speed-insights`

See [DESIGN.md](DESIGN.md) for the visual identity.

## Local Development

```bash
pnpm install
pnpm dev
```

## Scripts

| Script            | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `pnpm dev`        | Next.js dev server on `http://localhost:3000`             |
| `pnpm build`      | Production build                                          |
| `pnpm start`      | Run the production build locally                          |
| `pnpm lint`       | ESLint over the repo                                      |
| `pnpm sync:posts` | Pull Morning Portion MDX from `personal-site` (see below) |

## Project Layout

```
src/
  app/                # Next.js App Router routes
    page.tsx          # Home (verse hero + post list)
    posts/[slug]/     # Post page + dynamic OG image
    series/[series]/  # Series index pages
    api/subscribe/    # ConvertKit subscribe endpoint
    rss.xml/          # RSS feed
    sitemap.ts        # Sitemap
  components/         # SiteHeader, SiteFooter, PostList, SubscribeForm, ThemeToggle, Ornaments
  content/posts/      # MDX posts (synced from personal-site, do not hand-edit)
  lib/                # posts.ts (load + zod-validate frontmatter), constants, format, subscribe
scripts/
  sync-morning-portion-posts.mjs  # Mirrors the devotional MDX stream from personal-site
public/images/        # Logo + static images
DESIGN.md             # Visual identity / typography notes
```

## Content Sync

Morning Portion posts are stored in `src/content/posts`. To refresh them from the local personal-site repo:

```bash
pnpm sync:posts
```

By default, the script reads from `../personal-site/src/posts`. Override with:

```bash
PERSONAL_SITE_POSTS_DIR=/path/to/posts pnpm sync:posts
```

The authoring repo currently labels this stream as `category: Daily Word`; this app publishes that stream as The Morning Portion.

## Post frontmatter

Each MDX file in `src/content/posts/` carries:

| Field       | Required | Notes                                                                                   |
| ----------- | -------- | --------------------------------------------------------------------------------------- |
| `title`     | yes      | Used in the post header and lists                                                       |
| `date`      | yes      | `YYYY-MM-DD`. Future dates are hidden in production.                                    |
| `excerpt`   | yes      | Shown under the title and in OG cards                                                   |
| `series`    | no       | Groups posts on `/series/[slug]`                                                        |
| `category`  | no       | Free-form                                                                               |
| `tags`      | no       | Array or comma-separated string                                                         |
| `verse`     | no       | Activates the verse-as-typography hero on the home page when present on the latest post |
| `reference` | no       | Companion to `verse` (e.g. `"Matthew 16:25 (KJV)"`) — printed in italic above the verse |

When `verse` is absent on the latest post, the hero falls back to the title in big Fraunces. Schema enforced in `src/lib/posts.ts`.

The numbered colophon (`№NNN`) is computed automatically from the global post ordering — no per-post field needed.

## Environment

Copy `.env.example` to `.env.local` for a fresh setup. Reuse the applicable Kit/ConvertKit values from `personal-site`; `.env.local` is ignored and must not be committed.

### GitHub Actions

This repo includes:

- `CI` on pushes/PRs to `main`, running `pnpm lint` and `pnpm build`.
- `Devotion Broadcast Draft`, a manual `workflow_dispatch` workflow that creates a Kit draft for one post. It defaults to a test tag, does not schedule or send the email, and requires a confirmation phrase before targeting the real Morning Portion audience.

Configure these in **GitHub → Settings → Secrets and variables → Actions**:

| Name                              | Type     | Required by              | Description                                               |
| --------------------------------- | -------- | ------------------------ | --------------------------------------------------------- |
| `KIT_API_KEY`                     | Secret   | `devotion-broadcast.yml` | Kit v4 API key used to create the draft broadcast         |
| `NEXT_PUBLIC_APP_URL`             | Variable | `devotion-broadcast.yml` | Production site URL, `https://morningportion.com`         |
| `KIT_EMAIL_ADDRESS`               | Variable | `devotion-broadcast.yml` | Verified Kit sender, e.g. `newsletter@morningportion.com` |
| `KIT_MORNING_PORTION_TAG_ID`      | Variable | `devotion-broadcast.yml` | Numeric Kit tag ID for the Morning Portion audience       |
| `KIT_MORNING_PORTION_TEST_TAG_ID` | Variable | `devotion-broadcast.yml` | Numeric Kit tag ID for a small test-only audience         |

Also create a GitHub Environment named `morning-portion-broadcast` and add a required reviewer. The workflow references that environment before it creates the Kit draft.

For test runs, leave the workflow `audience` input set to `test`; the generated subject is prefixed with `[TEST]` and targets `KIT_MORNING_PORTION_TEST_TAG_ID`. To draft for the real audience, choose `audience: morning-portion` and type `MORNING PORTION` in `confirm_morning_portion`.

### Vercel Environment Variables

Set these in Vercel after connecting or renaming the project:

| Name                              | Required    | Source                                                              |
| --------------------------------- | ----------- | ------------------------------------------------------------------- |
| `CONVERTKIT_API_KEY`              | Yes         | Copy the value from `personal-site`                                 |
| `CONVERTKIT_FORM_ID`              | Yes         | Copy the value from `personal-site`                                 |
| `NEXT_PUBLIC_MORNING_PORTION_URL` | Recommended | Set to the stable production URL, e.g. `https://morningportion.com` |
| `NEXT_PUBLIC_PERSONAL_SITE_URL`   | Optional    | Defaults to `https://saucy.tech`                                    |

`NEXT_PUBLIC_DAILY_WORD_URL` is still honored as a legacy fallback during the rename.

Do not copy `CK_SECRET_KEY` or `CK_PUBLISHER_ID`. Those belong to the old manual fallback script in `personal-site`, not this app. This repo only needs `KIT_API_KEY` as a GitHub Actions secret for draft broadcast creation.

Vercel should use the default project settings:

- Framework preset: Next.js
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: Next.js default

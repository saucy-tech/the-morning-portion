# The Morning Portion

Standalone Next.js application for The Morning Portion, a morning scripture reflection project. Devotional posts are authored directly in this repo.

## Stack

- Next.js 16 (App Router) on Vercel Fluid Compute
- React 19, TypeScript
- MDX content via `next-mdx-remote`
- Fraunces (variable serif) + Inter via `next/font/google`
- Tailwind 3 base + custom token system in `src/app/globals.css`
- Kit v4 for the subscribe flow and draft broadcast creation
- `@vercel/analytics` + `@vercel/speed-insights`

See [DESIGN.md](DESIGN.md) for the visual identity.

## Local Development

```bash
pnpm install
pnpm dev
```

## Scripts

| Script       | Purpose                                       |
| ------------ | --------------------------------------------- |
| `pnpm dev`   | Next.js dev server on `http://localhost:3000` |
| `pnpm build` | Production build                              |
| `pnpm start` | Run the production build locally              |
| `pnpm lint`  | ESLint over the repo                          |
| `pnpm generate-audio <slug>` | Generate devotion MP3 + alignment via ElevenLabs (`--align-only`, `--dry-run`, `--output-dir`) |

## Project Layout

```
src/
  app/                # Next.js App Router routes
    page.tsx          # Home (verse hero + post list)
    posts/[slug]/     # Post page + dynamic OG image
    series/[series]/  # Series index pages
    api/subscribe/    # Kit subscribe endpoint
    rss.xml/          # RSS feed
    sitemap.ts        # Sitemap
  components/         # SiteHeader, SiteFooter, PostList, SubscribeForm, ThemeToggle, Ornaments
  content/posts/      # MDX devotion posts authored directly in this repo
  lib/                # posts.ts (load + zod-validate frontmatter), constants, format, subscribe
public/images/        # Logo + static images
DESIGN.md             # Visual identity / typography notes
```

## Authoring posts

Devotion posts live in `src/content/posts/<YYYY-MM-DD-slug>.mdx`. Add a new file, fill in the required frontmatter (see below), and open a PR with the `devotion` label. When the PR merges to `main`, the `Devotion Broadcast Draft` workflow auto-fires and creates a Kit draft for the Morning Portion audience (see GitHub Actions section below).

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
| `audio`     | no       | Public URL to the devotion MP3 (e.g. `/audio/2026-05-25-slug.mp3`). Auto-detected if `public/audio/{slug}.mp3` exists. |
| `audioAlignment` | no  | Public URL to sentence-timing JSON for synced reading (e.g. `/audio/2026-05-25-slug.alignment.json`). Auto-detected if the file exists. |

When `verse` is absent on the latest post, the hero falls back to the title in big Fraunces. Schema enforced in `src/lib/posts.ts`.

### Listen to devotion audio

Optional audio playback with synced reading on the post page:

1. **Manual:** Drop `public/audio/{slug}.mp3`, then run `pnpm generate-audio {slug} --align-only` to create alignment JSON (requires `ELEVENLABS_API_KEY` in `.env.local`).
2. **Automated:** Run `pnpm generate-audio {slug}` to generate MP3 + alignment via ElevenLabs (requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`).

The home hero shows a **Listen to devotion** button when audio is available; it links to `/posts/{slug}?listen=1` to auto-start playback on the post page.

The numbered colophon (`№NNN`) is computed automatically from the global post ordering — no per-post field needed.

## Environment

Copy `.env.example` to `.env.local` for a fresh setup. Use Kit v4 values for the Morning Portion form and audience tag; `.env.local` is ignored and must not be committed.

### GitHub Actions

This repo includes:

- `CI` on pushes/PRs to `main`, running `pnpm lint` and `pnpm build`.
- `Devotion Broadcast Draft`, which creates a Kit draft for one post. Auto-fires when a PR labeled `devotion` is merged into `main` and defaults to the Morning Portion audience. Can also be triggered manually via `workflow_dispatch` with a slug — manual runs default to the test tag and require a confirmation phrase to target the real audience. The workflow never schedules or sends; it always creates a draft (`send_at: null`) for final review and send in Kit.

Configure these in **GitHub → Settings → Secrets and variables → Actions**:

| Name                              | Type     | Required by              | Description                                               |
| --------------------------------- | -------- | ------------------------ | --------------------------------------------------------- |
| `KIT_API_KEY`                     | Secret   | `devotion-broadcast.yml` | Kit v4 API key used to create the draft broadcast         |
| `NEXT_PUBLIC_APP_URL`             | Variable | `devotion-broadcast.yml` | Production site URL, `https://morningportion.com`         |
| `KIT_EMAIL_ADDRESS`               | Variable | `devotion-broadcast.yml` | Verified Kit sender, e.g. `newsletter@morningportion.com` |
| `KIT_MORNING_PORTION_TAG_ID`      | Variable | `devotion-broadcast.yml` | Numeric Kit tag ID for the Morning Portion audience       |
| `KIT_MORNING_PORTION_TEST_TAG_ID` | Variable | `devotion-broadcast.yml` | Numeric Kit tag ID for a small test-only audience         |

Also create a GitHub Environment named `morning-portion-broadcast` and (optionally) add a required reviewer. The workflow references that environment before it creates the Kit draft. With a required reviewer, the auto-fire on PR merge will pause until you approve the deployment.

For manual test runs (`workflow_dispatch`), leave the `audience` input set to `test`; the generated subject is prefixed with `[TEST]` and targets `KIT_MORNING_PORTION_TEST_TAG_ID`. To draft for the real audience manually, choose `audience: morning-portion` and type `MORNING PORTION` in `confirm_morning_portion`. Auto-fire on PR merge always targets the Morning Portion audience — the `devotion` label is the safety gate.

### Vercel Environment Variables

Set these in Vercel after connecting or renaming the project:

| Name                              | Required    | Source                                                              |
| --------------------------------- | ----------- | ------------------------------------------------------------------- |
| `KIT_API_KEY`                     | Yes         | Kit V4 personal access token; can reuse the GitHub Actions value    |
| `CONVERTKIT_FORM_ID`              | Yes         | Morning Portion subscribe form ID (same numeric ID on Kit V4)       |
| `KIT_MORNING_PORTION_TAG_ID`      | Yes         | Morning Portion Kit tag ID applied during signup and used by drafts |
| `NEXT_PUBLIC_MORNING_PORTION_URL` | Recommended | Set to the stable production URL, e.g. `https://morningportion.com` |
| `NEXT_PUBLIC_PERSONAL_SITE_URL`   | Optional    | Defaults to `https://saucy.tech`                                    |

`NEXT_PUBLIC_DAILY_WORD_URL` is still honored as a legacy fallback during the rename.

The subscribe route calls Kit V4 (`api.kit.com/v4/forms/:id/subscribers`) using `KIT_API_KEY` as the `X-Kit-Api-Key` header, then applies `KIT_MORNING_PORTION_TAG_ID` so new subscribers are included in tag-targeted broadcasts. The same V4 token also powers the GitHub Actions draft broadcast workflow.

Vercel should use the default project settings:

- Framework preset: Next.js
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: Next.js default

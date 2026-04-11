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

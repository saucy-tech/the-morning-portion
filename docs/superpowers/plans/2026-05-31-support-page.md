# Support Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a simple `/support` page with one-time Lightning/Alby support now and hidden Stripe Payment Link support when configured.

**Architecture:** Keep the MVP static and link-based. Public support URLs live in `src/lib/constants.ts`, `/support` renders a server component with compact action logic, and existing global CSS handles the page layout. No new packages, server routes, payment APIs, auth, accounts, or Alby/NWC secrets are introduced.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 3/global CSS tokens, pnpm.

---

## Scope Check

This spec is one deployable slice. It touches the public support page, public env configuration, navigation, sitemap, documentation, and verification only. It does not include the richer personal-site Lightning tip jar, Stripe Checkout API, webhooks, subscriptions, Clerk, or any account system.

## File Structure

- Modify `src/lib/constants.ts`: add validated public support URL constants.
- Create `src/app/support/page.tsx`: render the static support page and action row.
- Modify `src/app/globals.css`: add narrowly scoped support-page layout classes.
- Modify `src/components/SiteHeader.tsx`: add the `Support` nav link.
- Modify `src/components/SiteFooter.tsx`: add the `Support` footer link.
- Modify `src/app/sitemap.ts`: include `/support` in generated sitemap output.
- Modify `.env.example`: document optional support-page environment variables.
- Modify `README.md`: document support env vars in the existing Vercel environment table.

## Implementation Tasks

### Task 1: Add Public Support URL Constants

**Files:**

- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Add a public URL sanitizer and support constants**

Update `src/lib/constants.ts` so the file contains this exact content:

```ts
export const SITE_NAME = 'The Morning Portion';
export const SITE_DESCRIPTION =
  'Morning scripture reflections rooted in the Sunday School lesson series.';
export const SITE_IMAGE = '/images/the-morning-portion-logo.png';
export const SITE_IMAGE_DARK = '/images/the-morning-portion-logo-dark.png';

function getVercelUrl() {
  if (!process.env.VERCEL_URL) {
    return undefined;
  }

  return `https://${process.env.VERCEL_URL}`;
}

function getPublicExternalUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    const isHttps = url.protocol === 'https:';
    const isLocalHttp = process.env.NODE_ENV === 'development' && url.protocol === 'http:';

    if (!isHttps && !isLocalHttp) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_MORNING_PORTION_URL ||
  process.env.NEXT_PUBLIC_DAILY_WORD_URL ||
  getVercelUrl() ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://morningportion.com');

export const PERSONAL_SITE_URL = process.env.NEXT_PUBLIC_PERSONAL_SITE_URL || 'https://saucy.tech';

export const MORNING_PORTION_LIGHTNING_URL = getPublicExternalUrl(
  process.env.NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL
);

export const STRIPE_PAYMENT_LINK_URL = getPublicExternalUrl(
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
);
```

- [ ] **Step 2: Run lint after constants change**

Run:

```bash
pnpm lint
```

Expected: command exits `0` with no ESLint errors.

- [ ] **Step 3: Commit constants change**

Run:

```bash
git add src/lib/constants.ts
git commit -m "feat: add support link constants"
```

Expected: commit succeeds and includes only `src/lib/constants.ts`.

### Task 2: Build the `/support` Page and Styles

**Files:**

- Create: `src/app/support/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create the support page route**

Create `src/app/support/page.tsx` with this exact content:

```tsx
import type { Metadata } from 'next';

import {
  MORNING_PORTION_LIGHTNING_URL,
  STRIPE_PAYMENT_LINK_URL,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Support The Morning Portion and help keep weekday scripture reflections freely available.',
  alternates: {
    canonical: '/support',
  },
  openGraph: {
    title: 'Support The Morning Portion',
    description:
      'Support The Morning Portion and help keep weekday scripture reflections freely available.',
    url: '/support',
    type: 'website',
  },
};

type SupportAction = {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
};

function getSupportActions(): SupportAction[] {
  const actions: SupportAction[] = [];

  if (STRIPE_PAYMENT_LINK_URL) {
    actions.push({
      href: STRIPE_PAYMENT_LINK_URL,
      label: 'Support with card',
      variant: 'primary',
    });
  }

  if (MORNING_PORTION_LIGHTNING_URL) {
    actions.push({
      href: MORNING_PORTION_LIGHTNING_URL,
      label: 'Support with Lightning',
      variant: STRIPE_PAYMENT_LINK_URL ? 'secondary' : 'primary',
    });
  }

  return actions;
}

export default function SupportPage() {
  const actions = getSupportActions();

  return (
    <main className="support-page">
      <div className="support-content">
        <section className="support-intro" aria-labelledby="support-heading">
          <p className="eyebrow">Support</p>
          <h1 id="support-heading" className="tdw-display">
            Help keep The Morning Portion freely available.
          </h1>
          <p>
            These readings are free and will stay that way. One-time support helps with the time,
            tools, and publishing costs behind each weekday reflection.
          </p>
        </section>

        <section className="support-row" aria-labelledby="support-action-heading">
          <div className="support-row-copy">
            <p>One-time support</p>
            <h2 id="support-action-heading">Send a simple gift</h2>
          </div>

          {actions.length > 0 ? (
            <div className="support-actions">
              {actions.map((action) => (
                <a
                  key={action.href}
                  className={`button ${action.variant}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="support-pending">
              Support options are being set up. Thank you for wanting to help.
            </p>
          )}
        </section>

        <p className="support-note">
          No account required. Support is optional; subscribing and reading remain free.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add support page CSS**

In `src/app/globals.css`, add this block after the `.not-found p:not(.eyebrow)` rule and before `.sr-only`:

```css
/* Support page */
.support-page {
  padding: 80px 64px 96px;
}

.support-content {
  max-width: 820px;
  margin: 0 auto;
}

.support-intro {
  margin-bottom: 46px;
}

.support-intro h1 {
  margin-top: 12px;
  max-width: 780px;
  font-size: 56px;
  line-height: 1.05;
}

.support-intro p:not(.eyebrow) {
  max-width: 680px;
  margin: 18px 0 0;
  color: var(--tdw-ink-soft);
  font-size: 18px;
  line-height: 1.7;
}

.support-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--tdw-rule);
  border-bottom: 1px solid var(--tdw-rule);
}

.support-row-copy p {
  margin: 0 0 6px;
  color: var(--tdw-ink-mute);
  font-size: 13px;
}

.support-row-copy h2 {
  font-family: var(--tdw-serif), Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--tdw-ink);
}

.support-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.support-pending {
  max-width: 280px;
  margin: 0;
  color: var(--tdw-ink-mute);
  font-size: 14px;
  line-height: 1.5;
  text-align: right;
}

.support-note {
  margin: 24px 0 0;
  color: var(--tdw-ink-mute);
  font-size: 14px;
  line-height: 1.7;
}
```

- [ ] **Step 3: Add responsive support styles**

In `src/app/globals.css`, inside the existing `@media (max-width: 860px)` block, add these rules after the `.site-footer` rule:

```css
  .support-page {
    padding: 64px 24px 80px;
  }

  .support-intro h1 {
    font-size: 40px;
  }

  .support-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .support-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .support-pending {
    max-width: none;
    text-align: left;
  }
```

In the existing `@media (max-width: 520px)` block, add this rule after `.hero-headline`:

```css
  .support-intro h1 {
    font-size: 34px;
  }
```

- [ ] **Step 4: Run lint after page and CSS changes**

Run:

```bash
pnpm lint
```

Expected: command exits `0` with no ESLint errors.

- [ ] **Step 5: Commit support page**

Run:

```bash
git add src/app/support/page.tsx src/app/globals.css
git commit -m "feat: add support page"
```

Expected: commit succeeds and includes only the support page and CSS changes.

### Task 3: Add Navigation and Sitemap Entries

**Files:**

- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add Support to the header nav**

Update the `<nav>` in `src/components/SiteHeader.tsx` to this exact block:

```tsx
      <nav aria-label="Main navigation">
        <Link href="/">Today</Link>
        <Link href="/#archive">Archive</Link>
        <Link href="/#series">Series</Link>
        <Link href="/support">Support</Link>
      </nav>
```

- [ ] **Step 2: Add Support to the footer nav**

Update the `<nav>` in `src/components/SiteFooter.tsx` to this exact block:

```tsx
      <nav aria-label="Footer navigation">
        <Link href="/support">Support</Link>
        <Link href="/rss.xml">RSS</Link>
        <a href={PERSONAL_SITE_URL}>Saucy.Tech</a>
      </nav>
```

- [ ] **Step 3: Add `/support` to the sitemap**

Update the returned array in `src/app/sitemap.ts` to include this object after the home page object and before the RSS object:

```ts
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
```

The final return block should have this order:

```ts
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/rss.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...seriesPages,
    ...posts,
  ];
```

- [ ] **Step 4: Run lint after navigation and sitemap changes**

Run:

```bash
pnpm lint
```

Expected: command exits `0` with no ESLint errors.

- [ ] **Step 5: Commit navigation and sitemap changes**

Run:

```bash
git add src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/app/sitemap.ts
git commit -m "feat: link support page"
```

Expected: commit succeeds and includes only header, footer, and sitemap changes.

### Task 4: Document Support Configuration

**Files:**

- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Document support env vars in `.env.example`**

In `.env.example`, add this block after `NEXT_PUBLIC_PERSONAL_SITE_URL=` and before the Kit section:

```dotenv
# Optional one-time support links for /support.
# Use a public Alby profile/pay URL for Lightning. Leave Stripe blank until a Payment Link exists.
NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL=
```

- [ ] **Step 2: Document support env vars in README**

In `README.md`, in the `### Vercel Environment Variables` table, add these rows after `NEXT_PUBLIC_PERSONAL_SITE_URL`:

```md
| `NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL` | Optional | Public Alby profile/pay URL used by `/support` for one-time Lightning support |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL`       | Optional | One-time Stripe Payment Link used by `/support` once Stripe is configured     |
```

- [ ] **Step 3: Run lint after documentation changes**

Run:

```bash
pnpm lint
```

Expected: command exits `0` with no ESLint errors. Documentation-only edits should not affect lint, but this catches accidental formatting issues in touched TypeScript from earlier tasks.

- [ ] **Step 4: Commit documentation changes**

Run:

```bash
git add .env.example README.md
git commit -m "docs: document support links"
```

Expected: commit succeeds and includes only `.env.example` and `README.md`.

### Task 5: Final Verification

**Files:**

- Verify all files changed by Tasks 1-4.

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm build
```

Expected: command exits `0` and Next.js builds `/support` without route or metadata errors.

- [ ] **Step 2: Start local dev server with a fake Lightning URL**

Run:

```bash
NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL=https://getalby.com/p/morningportion pnpm dev
```

Expected: dev server starts on `http://localhost:3000`. If port `3000` is busy, use the URL printed by Next.js.

- [ ] **Step 3: Browser-check `/support` with Lightning only**

Open:

```text
http://localhost:3000/support
```

Expected:

- Heading reads `Help keep The Morning Portion freely available.`
- There is one compact support row, not payment-method cards.
- The visible action is `Support with Lightning`.
- Footer note reads `No account required. Support is optional; subscribing and reading remain free.`
- Header and footer both include `Support`.
- Mobile viewport does not overflow; the action stacks below the row copy.

- [ ] **Step 4: Restart dev server with Stripe and Lightning URLs**

Stop the dev server, then run:

```bash
NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL=https://getalby.com/p/morningportion NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL=https://buy.stripe.com/test_123 pnpm dev
```

Expected: dev server starts and `/support` shows `Support with card` as the primary action and `Support with Lightning` as the secondary action in the same compact row.

- [ ] **Step 5: Restart dev server with no support URLs**

Stop the dev server, then run:

```bash
pnpm dev
```

Expected: `/support` renders the editorial page and the setup note `Support options are being set up. Thank you for wanting to help.` There are no broken support buttons.

- [ ] **Step 6: Commit any missed verification fixes**

If verification required fixes, run:

```bash
git add src/lib/constants.ts src/app/support/page.tsx src/app/globals.css src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/app/sitemap.ts .env.example README.md
git commit -m "fix: polish support page verification"
```

Expected: only run this command if fixes were made during verification. If no fixes were needed, skip this step.

- [ ] **Step 7: Confirm final working tree**

Run:

```bash
git status --short
```

Expected: no unstaged or uncommitted implementation changes remain.

# The Morning Portion Support Page Design

## Status

Approved for implementation.

## Goal

Add a simple `/support` page for one-time support of The Morning Portion. The page should feel like part of the devotional reading experience, not like a payment dashboard. It must avoid accounts, Clerk, customer portals, checkout API work, and any recurring-support surface for the MVP.

## Scope

In scope:

- Add a public `/support` route.
- Make Lightning/Alby the available support method at launch.
- Keep Stripe Payment Link support configuration-ready, but invisible unless a Stripe URL exists.
- Add restrained navigation entry points.
- Document the new public environment variables.
- Verify with `pnpm lint` and `pnpm build`.

Out of scope:

- Server-side Nostr Wallet Connect invoice generation.
- Payment status polling, QR generation, confetti, memo capture, or sats amount selection.
- Stripe Checkout API, webhooks, customer accounts, subscriptions, or recurring donations.
- Clerk or any other auth/account system.

## User Experience

The page opens with the approved editorial copy:

- Eyebrow: `Support`
- Heading: `Help keep The Morning Portion freely available.`
- Body: `These readings are free and will stay that way. One-time support helps with the time, tools, and publishing costs behind each weekday reflection.`

Below the intro, render one compact support row rather than separate payment cards. The row uses existing Morning Portion design language: hairline borders, serif heading, muted metadata, and one primary pill action.

Initial launch state:

- Label: `One-time support`
- Heading: `Send a simple gift`
- Primary action: `Support with Lightning`
- Footer note: `No account required. Support is optional; subscribing and reading remain free.`

If Stripe is configured, render it as the primary action in the same compact row with the label `Support with card`. If Lightning is also configured, render Lightning as a secondary inline action. If Stripe is not configured and Lightning is configured, render Lightning as the primary action. This must not reintroduce boxed payment choices or a multi-card payment comparison.

## Architecture

Create a static App Router page:

- `src/app/support/page.tsx`

Use the existing root layout, site header, footer, theme tokens, and global CSS. The page should not add a client component unless the implementation later introduces interactive payment behavior.

Keep support-link configuration in `src/lib/constants.ts`, alongside the existing site URL constants.

No new package dependencies are needed for the MVP.

## Configuration

Add public environment variables:

- `NEXT_PUBLIC_MORNING_PORTION_LIGHTNING_URL`: public Alby profile/pay URL or other Lightning support URL used by the launch button.
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL`: optional one-time Stripe Payment Link URL. If unset, Stripe is not shown.

The MVP should not use `NOSTR_WALLET_CONNECT_URL` or any Alby/NWC secret. If Morning Portion later adopts the richer personal-site tip jar, add a separate server-only secret at that time and do not reuse the personal-site key.

Update `.env.example` and the README environment table when implementing these variables.

## Navigation

Add `Support` to the header navigation in the same text-link style as `Today`, `Archive`, and `Series`. Keep the existing Subscribe button.

Add `Support` to the footer navigation near RSS and Saucy.Tech so the page remains discoverable on mobile where the header nav is hidden.

## Data Flow

At request/render time:

1. Read public support URLs from environment-backed constants.
2. Render `/support` with the editorial copy.
3. If a Stripe Payment Link exists, render `Support with card` as the primary action.
4. If a Lightning URL exists, render `Support with Lightning` as the primary action when Stripe is absent, or as a secondary inline action when Stripe is present.
5. If no support URL exists, keep the page readable and show no broken link.

Clicking either action sends the visitor to the external provider. External links should use `target="_blank"` and `rel="noopener noreferrer"`.

## Error Handling

The page must not throw if support env vars are missing. Missing config should hide the corresponding action.

Invalid or empty URLs should not render clickable actions. A minimal URL guard is enough for the MVP; this is not a payment-processing boundary because the app is only linking to public provider pages.

## Styling

Use existing tokens and patterns from `src/app/globals.css`:

- `.section`, `.section-inner`, `.eyebrow`, `.tdw-display`, `.button.primary`, and existing color tokens.
- Add narrowly scoped CSS classes only for support-page layout if existing utilities are insufficient.
- Avoid cards for each payment method.
- Avoid marketing-style hero imagery, gradients, or decorative payment icons.
- Keep typography fixed at existing breakpoint sizes.

The approved visual direction is a quiet editorial page with a single compact support row under the intro.

## Metadata

Add page metadata:

- Title: `Support`
- Description: `Support The Morning Portion and help keep weekday scripture reflections freely available.`
- Canonical: `/support`

## Verification

Run:

```bash
pnpm lint
pnpm build
```

Manual checks:

- `/support` renders in light and dark themes.
- Header and footer links navigate to `/support`.
- Missing Stripe URL hides Stripe.
- Missing Lightning URL does not create a broken button.
- Mobile layout does not overflow or crowd the support row.

## References

- Stripe Payment Links are suitable for shareable one-time donation links without custom checkout code: [Stripe Payment Links documentation](https://docs.stripe.com/no-code/payment-links?locale=en-GB).
- Alby supports receiving Lightning payments through a public Lightning address/profile-style flow; deeper app integrations can be added in a future tip-jar iteration: [Alby Lightning receiving guide](https://guides.getalby.com/developer-guide/lightning-tools).

# Morning Portion Kit Migration and Masthead Design

## Goal

Set up The Morning Portion as its own Kit audience surface while preserving the existing personal-site Daily Word setup. The new audience should use `newsletter@morningportion.com`, copy only active Daily Word subscribers, and stay unable to send automated post emails until a later explicit implementation phase.

## Decisions

- Migration posture: separate but copied.
- Source audience: the current personal-site Daily Word form/list.
- Destination audience: a new Morning Portion form/list in Kit.
- Subscriber filter: active subscribers only.
- Sender identity: `newsletter@morningportion.com`.
- Visual direction: coffee/Bible masthead with the new Morning Portion logo used as a smaller side seal.
- Safety gate: no broadcasts, schedules, sequences, or site-triggered email sends during this phase.

## Kit Account Design

Use the Kit MCP as the preferred control surface once a fresh Codex session has loaded the newly registered `kit` MCP server. If the MCP surface cannot create a particular Kit object or requires browser confirmation, use the authenticated Kit UI through Helium/browser for that specific step.

Create or verify these Kit objects:

- A form named `The Morning Portion Newsletter`.
- A durable audience tag named `Morning Portion`.
- A sender identity for `newsletter@morningportion.com`.
- Any required `morningportion.com` sending-domain DNS records, if Kit asks for domain authentication.

The form is the subscription entry point for the website. The tag is the stable targeting marker for copied subscribers and future broadcasts. The old Daily Word form remains in place and unchanged.

## Migration Flow

1. Discover the current Daily Word source form from the personal-site configuration and/or Kit account.
2. List subscribers for that source form.
3. Filter to records whose state is active.
4. Produce a dry-run report:
   - source form name and ID
   - destination form name and ID
   - destination tag name and ID
   - active subscriber count
   - excluded non-active count, or note that the source surface did not expose non-active records
5. Pause for confirmation before writing subscriber changes.
6. Copy active subscribers into the Morning Portion audience by adding each active subscriber to the new form and applying the `Morning Portion` tag.
7. Verify destination counts against the dry run.

Do not persist subscriber emails in committed files. If a temporary migration artifact is needed, keep it outside git, preferably under `/tmp`, and include only counts or redacted samples in user-facing summaries.

## Sender Identity

Use `newsletter@morningportion.com` as the intended sender address. If Kit requires mailbox or DNS verification, complete that through Kit and the domain DNS provider before any broadcast automation is enabled. If DNS changes are needed, record the exact records Kit requests and confirm they resolve before treating the sender as ready.

## Site Integration Later

The current Morning Portion app already subscribes users through `CONVERTKIT_FORM_ID` and `CONVERTKIT_API_KEY`. In the later site phase, update deployment environment values so `CONVERTKIT_FORM_ID` points to the new Morning Portion form. Keep the API server-side.

Recommended later code work:

- Update any old `The-Daily-Word` user-agent text to `The-Morning-Portion`.
- Preserve existing rate limiting and request validation.
- Add the personal-site "already subscribed" handling if it is still missing here.
- Keep broadcast/email publishing behind an explicit manual gate.
- Run `pnpm lint` and `pnpm build` before declaring the site phase done.

## Masthead Design

Use the existing `public/images/daily-word-banner.png` as a warm masthead image. Overlay or position the new Morning Portion logo as a small seal on the side, not as a competing full-size logo block. The masthead should feel like the older Daily Word coffee/Bible header while still making the new Morning Portion identity clear.

The current standalone logo can remain available elsewhere, including metadata images, favicon-adjacent usage, and compact header branding. The homepage masthead should lead with devotional atmosphere.

## Verification

Before subscriber copy:

- Confirm source Daily Word form/list.
- Confirm destination Morning Portion form and tag.
- Confirm `newsletter@morningportion.com` sender setup status.
- Confirm active-subscriber dry-run count.

After subscriber copy:

- Confirm destination form count matches the dry-run active count, accounting for any already-present duplicates.
- Confirm the `Morning Portion` tag count matches expected copied active subscribers.
- Confirm old Daily Word form/list still exists and still has its subscribers.
- Confirm no broadcasts, sequences, or automations were started.

For the later site phase:

- Confirm Vercel/local env points to the new Morning Portion form ID.
- Submit a test email through the site form.
- Verify the test subscriber lands in the new Morning Portion form/tag.
- Run `pnpm lint`.
- Run `pnpm build`.

## Open Risks

- Kit MCP tools may not be visible in the current Codex session until the session is restarted after MCP setup.
- Kit may require browser-based confirmation for sender identity, DNS, or destructive/write actions.
- API or MCP support for creating forms may differ from subscriber/tag operations. If form creation is unavailable through MCP, use the Kit UI for form creation and MCP for discovery/copy/verification.
- Copying subscribers into a new audience is account-level data mutation, so it must remain dry-run-first with explicit confirmation.

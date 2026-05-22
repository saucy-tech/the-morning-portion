# Morning Portion Kit Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a separate Morning Portion Kit audience, copy only active Daily Word subscribers into it after a dry-run confirmation, and update the site masthead/subscribe integration without enabling automated sends.

**Architecture:** Treat Kit account changes and site changes as separate phases. Kit work is MCP-first with browser/UI fallback for sender identity and domain verification; site work is a small Next.js update using the existing server-side subscribe endpoint, existing assets, and existing Tailwind/CSS token system.

**Tech Stack:** Kit MCP, Kit web UI through Helium/browser as needed, Next.js 16 App Router, React 19, TypeScript, Tailwind 3, pnpm.

---

## Scope Check

This plan covers two dependent pieces:

- Kit account setup and subscriber copy, which must run before production site env changes.
- Site masthead and subscribe-handler cleanup, which can be implemented and verified independently while the production `CONVERTKIT_FORM_ID` remains unchanged.

Do not create broadcasts, schedules, sequences, automations, or any post-publish email workflow in this plan.

## File Structure

- Modify: `/Users/brandon/Developer/the-morning-portion/src/app/page.tsx`
  - Replace the current logo-only `brand-band` with a masthead that uses the coffee/Bible banner and a small Morning Portion logo seal.
- Modify: `/Users/brandon/Developer/the-morning-portion/src/app/globals.css`
  - Add responsive styles for the banner masthead.
  - Remove or retire the logo-only `brand-band` styles once no component uses them.
- Modify: `/Users/brandon/Developer/the-morning-portion/src/lib/subscribe.ts`
  - Update the Kit user-agent string.
  - Treat Kit "already subscribed" responses as success, matching personal-site behavior.
- Modify: `/Users/brandon/Developer/the-morning-portion/README.md`
  - Document that `CONVERTKIT_FORM_ID` should point to `The Morning Portion Newsletter`.
  - Document that `newsletter@morningportion.com` is the intended sender identity.
- Modify: `/Users/brandon/Developer/the-morning-portion/.env.example`
  - Add comments or clearer placeholder values for the Morning Portion Kit form.
- Do not modify: `/Users/brandon/Developer/the-morning-portion/src/content/posts/*.mdx`
  - Posts are synced content and are out of scope.

## Task 1: Confirm Kit MCP Readiness

**Files:**
- No file changes.

- [ ] **Step 1: Start from a fresh Codex session if Kit tools are missing**

Run:

```bash
codex mcp list
```

Expected: output includes this HTTP server:

```text
kit     https://app.kit.com/mcp     enabled
```

If the `kit` MCP server is listed but no Kit MCP tools are exposed in the agent tool list, stop and restart the Codex session from `/Users/brandon/Developer/the-morning-portion`. Do not use raw API scripting as a substitute unless Brandon explicitly approves that fallback.

- [ ] **Step 2: Discover Kit MCP tools**

Use tool discovery with this query:

```text
kit subscribers forms tags broadcasts account sender
```

Expected: Kit account tools are available for reading subscribers/forms/tags and for creating or updating forms/tags/subscriber memberships. If only generic tools are returned, the session has not loaded the new MCP server; restart the session before continuing.

- [ ] **Step 3: Confirm no account writes yet**

Report to Brandon:

```text
Kit MCP is available. I have not created forms, tags, subscribers, sender identities, broadcasts, sequences, or automations yet.
```

Expected: Brandon can approve continuing to Kit discovery.

## Task 2: Dry-Run Daily Word Source Discovery

**Files:**
- Read: `/Users/brandon/Developer/personal-site/.env.local`
- Read: `/Users/brandon/Developer/the-morning-portion/.env.local`
- No committed file changes.

- [ ] **Step 1: Read source form IDs without printing secrets**

Run:

```bash
awk -F= '/^CONVERTKIT_FORM_ID=/{print FILENAME ": " $1 "=<redacted>"}' /Users/brandon/Developer/personal-site/.env.local /Users/brandon/Developer/the-morning-portion/.env.local
```

Expected: both files contain `CONVERTKIT_FORM_ID=<redacted>`. Do not print `CONVERTKIT_API_KEY`.

- [ ] **Step 2: Identify the current Daily Word source form**

Use Kit MCP read-only form/list tools to locate the form whose ID matches the personal-site `CONVERTKIT_FORM_ID` value. If the MCP tool requires the form ID, read the value locally but do not echo it in terminal or final output.

Expected report format:

```text
Source form: Daily Word-related form, ID <redacted except last 4 digits>, status found.
```

- [ ] **Step 3: Count source subscribers by active state**

Use Kit MCP read-only subscriber/form tools to list subscribers for the source form. Filter records where `state === "active"`.

Expected report format:

```text
Dry run:
- Source form: <name>, ID ending <last4>
- Active subscribers: <count>
- Non-active records excluded: <count or "not exposed by source listing">
- No account writes performed
```

- [ ] **Step 4: Ask for confirmation before creating destination objects**

Ask Brandon:

```text
This dry-run source count is <count> active subscribers. Should I create/verify the Morning Portion Kit form/tag next?
```

Expected: Do not proceed without explicit confirmation.

## Task 3: Create or Verify Morning Portion Kit Objects

**Files:**
- No committed file changes.

- [ ] **Step 1: Create or verify the destination tag**

Use Kit MCP tag tools to find a tag named:

```text
Morning Portion
```

If it does not exist, create it.

Expected report format:

```text
Destination tag: Morning Portion, ID ending <last4>, created|already existed.
```

- [ ] **Step 2: Create or verify the destination form**

Use Kit MCP form tools or the Kit UI through Helium/browser to create a form named:

```text
The Morning Portion Newsletter
```

Expected report format:

```text
Destination form: The Morning Portion Newsletter, ID ending <last4>, created|already existed.
```

If Kit UI is required, use Helium/browser only for that form creation step and return to MCP for read-only verification.

- [ ] **Step 3: Verify the planned sender identity**

Use Kit MCP account/sender tools or Kit UI to check whether this sender identity exists and is verified:

```text
newsletter@morningportion.com
```

Expected report format:

```text
Sender identity: newsletter@morningportion.com, verified|pending DNS|pending mailbox confirmation|not created.
```

If DNS records are needed, record them in the terminal response exactly as Kit displays them, but do not change DNS without a separate explicit approval.

- [ ] **Step 4: Confirm no send-capable automation exists**

Use Kit MCP read-only tools or Kit UI to confirm no broadcast, sequence, or automation was created as part of this work.

Expected report:

```text
No broadcasts, sequences, schedules, or automations were created.
```

## Task 4: Subscriber Copy Confirmation Gate

**Files:**
- No committed file changes.

- [ ] **Step 1: Prepare write plan summary**

Prepare this exact confirmation summary with real counts and redacted IDs:

```text
Ready to copy active subscribers:
- From: <Daily Word source form name>, ID ending <last4>
- To form: The Morning Portion Newsletter, ID ending <last4>
- To tag: Morning Portion, ID ending <last4>
- Active subscribers to copy: <count>
- Excluded non-active records: <count or "not exposed by source listing">

This will not send emails and will not alter the old Daily Word form.
Proceed with the copy?
```

- [ ] **Step 2: Wait for explicit confirmation**

Expected: Brandon must say to proceed with the subscriber copy. If he asks for changes, stop and adjust the destination object setup before copying.

## Task 5: Copy Active Subscribers

**Files:**
- No committed file changes.
- Temporary artifacts, if required: `/tmp/morning-portion-kit-migration-YYYYMMDD.json`

- [ ] **Step 1: Re-fetch source active subscribers**

Use Kit MCP read-only tools to re-fetch the current active source subscriber list immediately before writing.

Expected:

```text
Fetched <count> active source subscribers immediately before copy.
```

If the count differs from the confirmed dry-run count, stop and ask Brandon whether to proceed with the new count.

- [ ] **Step 2: Copy subscribers in small batches**

For each active subscriber:

```text
1. Ensure subscriber exists in Kit without changing inactive state.
2. Add subscriber to The Morning Portion Newsletter form.
3. Apply the Morning Portion tag.
```

Use Kit MCP subscriber/form/tag tools. If a subscriber already belongs to the destination form or already has the destination tag, treat that as success and continue.

Expected progress report every 100 subscribers, or at completion if there are fewer than 100:

```text
Copied <completed>/<total> active subscribers. Failures: <failure_count>.
```

- [ ] **Step 3: Record failures without committing addresses**

If failures occur, keep the detailed failure artifact outside git:

```text
/tmp/morning-portion-kit-migration-failures-YYYYMMDD.json
```

User-facing report should redact email addresses:

```text
Failures:
- Subscriber ID ending <last4>: <Kit error message>
```

- [ ] **Step 4: Verify destination counts**

Use Kit MCP read-only tools to count:

```text
The Morning Portion Newsletter form subscribers
Morning Portion tag subscribers
Daily Word source form subscribers
```

Expected:

```text
Destination form count: <count>
Destination tag count: <count>
Source form still present: yes
No broadcasts/sequences/automations created: yes
```

## Task 6: Update Subscribe Handler Behavior

**Files:**
- Modify: `/Users/brandon/Developer/the-morning-portion/src/lib/subscribe.ts`

- [ ] **Step 1: Add Kit response helpers**

In `/Users/brandon/Developer/the-morning-portion/src/lib/subscribe.ts`, add these helpers above `secureError`:

```ts
function extractKitMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') {
    return record.message;
  }

  const error = record.error;
  if (typeof error === 'string') {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return '';
}

function isAlreadySubscribedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already subscribed') ||
    normalized.includes('already a subscriber') ||
    normalized.includes('subscriber already') ||
    normalized.includes('already exists')
  );
}
```

Expected: TypeScript compiles with no new imports.

- [ ] **Step 2: Update failed Kit response handling**

Replace this block:

```ts
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return secureError('Failed to subscribe', 502, data);
    }
```

with:

```ts
    if (!response.ok) {
      const data: unknown = await response.json().catch(() => ({}));
      const message = extractKitMessage(data);

      if (isAlreadySubscribedMessage(message)) {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }

      return secureError('Failed to subscribe', 502, data);
    }
```

Expected: existing error behavior remains for non-duplicate failures.

- [ ] **Step 3: Update the user-agent**

Replace:

```ts
        'User-Agent': 'The-Daily-Word/1.0',
```

with:

```ts
        'User-Agent': 'The-Morning-Portion/1.0',
```

Expected: all subscribe requests identify the new site.

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit subscribe handler cleanup**

Run:

```bash
git add src/lib/subscribe.ts
git commit -m "Update Morning Portion subscribe handling"
```

Expected: commit succeeds.

## Task 7: Replace Logo-Only Brand Band With Banner Masthead

**Files:**
- Modify: `/Users/brandon/Developer/the-morning-portion/src/app/page.tsx`
- Modify: `/Users/brandon/Developer/the-morning-portion/src/app/globals.css`

- [ ] **Step 1: Update the home page masthead markup**

In `/Users/brandon/Developer/the-morning-portion/src/app/page.tsx`, replace the current `brand-band` section:

```tsx
          <section className="brand-band" aria-label={SITE_NAME}>
            <div className="brand-band-logo" role="img" aria-label={SITE_NAME} />
          </section>
```

with:

```tsx
          <section className="morning-masthead" aria-label={SITE_NAME}>
            <div className="morning-masthead-image" aria-hidden="true" />
            <div className="morning-masthead-inner">
              <div className="morning-masthead-copy">
                <p className="eyebrow">The Morning Portion</p>
                <p className="tdw-display">Begin in the Word.</p>
              </div>
              <div className="morning-masthead-seal" role="img" aria-label={SITE_NAME} />
            </div>
          </section>
```

Expected: homepage renders a masthead before the verse hero.

- [ ] **Step 2: Replace brand-band CSS**

In `/Users/brandon/Developer/the-morning-portion/src/app/globals.css`, replace the whole block beginning with:

```css
/* Brand band — logo masthead above the verse hero (home only) */
.brand-band {
```

and ending after the `@media (max-width: 520px)` block for `.brand-band`, with:

```css
/* Morning masthead — coffee/Bible image with logo seal (home only) */
.morning-masthead {
  position: relative;
  overflow: hidden;
  min-height: 340px;
  border-bottom: 1px solid var(--tdw-rule-soft);
  background: var(--tdw-bg-deep);
}

.morning-masthead-image {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(11, 38, 51, 0.72), rgba(11, 38, 51, 0.22)),
    url('/images/daily-word-banner.png');
  background-position: center;
  background-size: cover;
}

.morning-masthead-inner {
  position: relative;
  display: flex;
  min-height: 340px;
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding: 48px 0;
}

.morning-masthead-copy {
  max-width: 620px;
  color: #fffaf0;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.32);
}

.morning-masthead-copy .eyebrow {
  color: rgba(255, 250, 240, 0.82);
}

.morning-masthead-copy .tdw-display {
  margin: 10px 0 0;
  font-size: 56px;
  line-height: 1;
}

.morning-masthead-seal {
  width: 118px;
  aspect-ratio: 1;
  flex: 0 0 auto;
  border: 1px solid rgba(255, 250, 240, 0.7);
  border-radius: var(--tdw-radius-pill);
  background:
    color-mix(in srgb, var(--tdw-paper) 92%, transparent)
    var(--tdw-logo-image) center / 74% no-repeat;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

html[data-theme='dark'] .morning-masthead-seal {
  border-color: rgba(244, 237, 221, 0.38);
  background:
    color-mix(in srgb, var(--tdw-bg-deep) 82%, transparent)
    var(--tdw-logo-image) center / 74% no-repeat;
}
```

Expected: the old logo-only masthead styles are gone, and the old `.brand-band + .hero .hero-ornament` rule still remains for the next step.

- [ ] **Step 3: Update the hero ornament selector**

Replace:

```css
.brand-band + .hero .hero-ornament {
  display: none;
}
```

with:

```css
.morning-masthead + .hero .hero-ornament {
  display: none;
}
```

Expected: no `.brand-band` selectors remain in `/Users/brandon/Developer/the-morning-portion/src/app/globals.css`.

- [ ] **Step 4: Add responsive masthead CSS**

Add this before the existing `/* Scrollbar */` section:

```css
@media (max-width: 860px) {
  .morning-masthead {
    min-height: 280px;
  }

  .morning-masthead-inner {
    min-height: 280px;
    width: min(100% - 48px, 1240px);
    align-items: flex-end;
    padding: 36px 0;
  }

  .morning-masthead-copy .tdw-display {
    font-size: 42px;
  }

  .morning-masthead-seal {
    width: 92px;
  }
}

@media (max-width: 520px) {
  .morning-masthead {
    min-height: 250px;
  }

  .morning-masthead-inner {
    min-height: 250px;
    width: calc(100% - 32px);
    gap: 18px;
    padding: 28px 0;
  }

  .morning-masthead-copy .tdw-display {
    font-size: 34px;
  }

  .morning-masthead-seal {
    width: 72px;
  }
}
```

Expected: masthead text and seal fit mobile widths without overlap.

- [ ] **Step 5: Run static checks**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 6: Commit masthead update**

Run:

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "Add Morning Portion banner masthead"
```

Expected: commit succeeds.

## Task 8: Document Morning Portion Kit Configuration

**Files:**
- Modify: `/Users/brandon/Developer/the-morning-portion/README.md`
- Modify: `/Users/brandon/Developer/the-morning-portion/.env.example`

- [ ] **Step 1: Update `.env.example` placeholders**

Change `.env.example` so the ConvertKit variables read:

```dotenv
CONVERTKIT_API_KEY=
# Kit form ID for "The Morning Portion Newsletter"
CONVERTKIT_FORM_ID=
```

Expected: no secret values are added.

- [ ] **Step 2: Update README environment table**

In `/Users/brandon/Developer/the-morning-portion/README.md`, update the `CONVERTKIT_FORM_ID` row to:

```markdown
| `CONVERTKIT_FORM_ID` | Yes | Kit form ID for `The Morning Portion Newsletter` |
```

Expected: README points future operators to the new form.

- [ ] **Step 3: Add sender identity note**

Add this paragraph after the Vercel environment variables table:

```markdown
The intended Kit sender identity for Morning Portion email is `newsletter@morningportion.com`. Do not enable automated broadcast sending until that sender identity and any required `morningportion.com` DNS records are verified in Kit.
```

Expected: deployment docs capture the no-send gate.

- [ ] **Step 4: Commit docs update**

Run:

```bash
git add .env.example README.md
git commit -m "Document Morning Portion Kit configuration"
```

Expected: commit succeeds.

## Task 9: Verify Site Locally

**Files:**
- No file changes unless verification reveals bugs.

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 2: Start local production server**

Run:

```bash
pnpm start
```

Expected: server starts on `http://localhost:3000`. If port 3000 is busy, stop the conflicting app only after confirming it is safe, or use a different port with Next.js-supported options.

- [ ] **Step 3: Verify the homepage in Browser**

Use the in-app Browser plugin to open:

```text
http://localhost:3000
```

Expected:

```text
Coffee/Bible masthead appears above the verse hero.
Morning Portion logo appears as a small side seal.
Header, hero, and subscribe sections do not overlap at desktop width.
```

- [ ] **Step 4: Verify mobile layout**

Use Browser screenshot or viewport controls for a mobile-width viewport around 390px wide.

Expected:

```text
Masthead text and logo seal both fit.
No button text overflows.
No masthead content overlaps the sticky header or verse hero.
```

- [ ] **Step 5: Stop local server**

Stop the `pnpm start` session.

Expected: no long-running server process remains from this task.

## Task 10: Production Environment Cutover Gate

**Files:**
- No repository changes.

- [ ] **Step 1: Confirm Kit migration completion**

Before changing Vercel env, report:

```text
Kit migration status:
- The Morning Portion Newsletter form exists: yes
- Morning Portion tag exists: yes
- Active subscribers copied: yes, <count>
- newsletter@morningportion.com sender status: verified|pending
- No automated sends configured: yes
```

Expected: If sender status is pending, do not enable any broadcast workflow.

- [ ] **Step 2: Update Vercel form ID only after approval**

After Brandon explicitly approves production cutover, update Vercel `CONVERTKIT_FORM_ID` to the new Morning Portion form ID. Do not change `CONVERTKIT_API_KEY` unless the current key cannot access the new form.

Expected:

```text
Vercel CONVERTKIT_FORM_ID now points to The Morning Portion Newsletter.
```

- [ ] **Step 3: Submit one controlled subscription test**

Use a test email address approved by Brandon and submit the live or preview site form once.

Expected:

```text
Test subscriber appears in The Morning Portion Newsletter form.
Test subscriber receives only the normal Kit subscription confirmation, if that form is configured to send one.
No broadcast is sent.
```

## Final Verification Checklist

- [ ] `pnpm lint` passed.
- [ ] `pnpm build` passed.
- [ ] Header masthead uses `daily-word-banner.png` and the Morning Portion logo seal.
- [ ] `src/lib/subscribe.ts` uses `The-Morning-Portion/1.0`.
- [ ] Already-subscribed Kit responses return success.
- [ ] README documents the new form and sender identity.
- [ ] Old Daily Word form remains unchanged.
- [ ] New Morning Portion form/tag contain only active copied subscribers, plus any intentional test addresses.
- [ ] No broadcasts, schedules, sequences, or automated sends were created.

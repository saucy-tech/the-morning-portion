# Implementation Notes - Morning Portion Actions

**Spec:** User-approved request to add CI and an approval-gated Morning Portion broadcast workflow.
**Started:** 2026-05-22
**Status:** complete

## How to read this file

Running log of decisions, deviations, and tradeoffs made while implementing the GitHub Actions setup. Entries are append-only and chronological.

## Decisions not covered by the spec

### Default workflow dispatch to test tag - 2026-05-22

**Spec section:** Safety follow-up
After Brandon warned not to send to all subscribers while testing, I changed the broadcast workflow to default to `audience: test`. Test drafts require `KIT_MORNING_PORTION_TEST_TAG_ID`, prefix the subject with `[TEST]`, and fail closed if the test tag is not configured.

### Use draft-only Kit broadcasts first - 2026-05-22

**Spec section:** Conversation approval
The workflow creates Kit broadcasts with `send_at: null` instead of scheduling or sending them. This keeps GitHub Actions useful for building the email while preserving a manual review/send step in Kit.

### Require a Morning Portion tag variable - 2026-05-22

**Spec section:** Conversation approval
The broadcast workflow requires `KIT_MORNING_PORTION_TAG_ID` and targets that tag through `subscriber_filter`. If the variable is missing, the workflow fails rather than defaulting to all subscribers.

### Require confirmation for real audience drafts - 2026-05-22

**Spec section:** Safety follow-up
Targeting the real Morning Portion audience now requires selecting `audience: morning-portion` and entering `MORNING PORTION` in `confirm_morning_portion`. This is separate from the GitHub Environment reviewer gate and protects against accidental real-audience draft creation during tests.

### Configure known GitHub variables and environment - 2026-05-22

**Spec section:** GitHub Actions setup
I set the known repository variables `NEXT_PUBLIC_APP_URL=https://morningportion.com` and `KIT_EMAIL_ADDRESS=newsletter@morningportion.com`, and created the `morning-portion-broadcast` GitHub Environment with Brandon's account as a required reviewer. I did not set `KIT_API_KEY` or `KIT_MORNING_PORTION_TAG_ID` because those values are not readable from this session.

### Complete GitHub Kit configuration - 2026-05-22

**Spec section:** GitHub Actions setup
I created a new Kit V4 API key named `the-morning-portion-github-actions`, saved it as the GitHub Actions secret `KIT_API_KEY`, verified the key against the Kit V4 broadcasts endpoint with a read-only request, and cleared the local clipboard. I also set `KIT_MORNING_PORTION_TAG_ID=19735220` and `KIT_MORNING_PORTION_TEST_TAG_ID=19735889`.

## Deviations from the spec

## Tradeoffs accepted

### Inline workflow renderer instead of shared script - 2026-05-22

**Spec section:** Conversation approval
I kept the MDX-to-email renderer inside the workflow rather than adding a reusable local script. This avoids adding a repo command for a single GitHub-only path, but it means future email template changes happen in YAML.

## Surprises and gotchas

### ESLint scanned ignored worktrees - 2026-05-22

**Spec section:** Verification
`pnpm lint` walked `.worktrees/` and linted generated `.next` output from a sibling worktree. I added explicit ESLint ignores for generated/local workspace directories so the documented verification command matches the repo ignore policy.

## Open questions for review

- Run the manual GitHub workflow once with `audience: test` and a known synced slug to inspect the generated Kit draft before using the real audience option.

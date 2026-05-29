# Homepage conversion roadmap

Follow-ups from the first-time-visitor UX/conversion review of the homepage. The
**lens is conversion** — the homepage's primary job is turning a first-time
visitor into an email subscriber, without degrading the daily experience for
the returning reader.

## ✅ Shipped — Change 1: value-prop + capture hero

The first screen now leads with a message and a single ask instead of a logo.

- Replaced the title/verse hero with a stable, descriptive **H1 value
  proposition** ("The Word, before the day gets loud.") — also fixes the SEO
  problem of the H1 being a different raw verse/title every day.
- Added an **eyebrow cadence** ("Every weekday morning") and a **lede** that
  answers the four newcomer questions: what / who / how often / free.
- Moved the **email capture above the fold** as the one primary ask
  (`SubscribeForm` now accepts `cta` / `loadingLabel` props; the hero CTA reads
  "Receive the morning portion").
- Kept a single **"today's reading" card** below the ask — it doubles as the
  voice sample for newcomers and the entry point for returning readers (shows
  the verse when present, otherwise the excerpt). This resolves the two-audience
  conflict without a second competing CTA.
- **Demoted the logo masthead** below the hero and removed `LogoPreload` (it
  injected a `fetchpriority=high` preload from a client `useEffect`, so it never
  helped first paint, and the full-bleed logo was the likely LCP element).

Files: `src/app/page.tsx`, `src/app/globals.css`, `src/components/SubscribeForm.tsx`,
deleted `src/components/LogoPreload.tsx`.

---

## Backlog (ordered by impact)

### Change 2 — Make the subscribe offer concrete (issue ②)
Wherever the form appears (mid-page band + post page), add the specifics that
convert and set the double-opt-in expectation.

- Bullets beside/under the form:
  - "A short reading every weekday morning"
  - "Rooted in the KJV and the weekly Sunday School lesson"
  - "Always free — unsubscribe in one click"
- A "Read a recent reading →" preview link so people can sample before signing up.
- **Set the double-opt-in expectation** before and after submit (Kit sends a
  confirmation; unconfirmed signups leak silently). Update the success copy to:
  *"Welcome. Check your inbox to confirm — tomorrow's portion will follow."*
- Note: the mid-page subscribe band still uses the default "Subscribe" CTA; align
  it with the hero copy here if testing favors it.

### Change 3 — Add a human and honest proof (issue ③)
The site is currently anonymous; faith readers vet who is teaching them.

- One author/about line near the hero or in a slim strip:
  *"Written by Brandon — a daily portion from the weekly Sunday School lesson,
  in the King James tradition."* → link to a short **About** page.
- Honest proof (avoid growth-tally cadence like "68 mornings and counting" or
  "Join N readers"): *"A new reading every weekday since [month]."*
- One real reader line as a testimonial if obtainable.
- Footer: add About, Contact, and a social link; keep RSS.

### Issue ⑤ — Mobile nav + accessibility
- The header `<nav>` is `display:none` under 860px **with no hamburger** —
  Archive/Series are unreachable from the header on phones, and `display:none`
  also removes them from the accessibility tree. Add a real mobile menu.

### Performance — right-size the logo
- `public/images/the-morning-portion-logo.png` is ~196KB rendered full-bleed.
  Export an SVG or a properly sized/compressed asset. (The preload was already
  removed in Change 1.)

### Content hygiene — series section (issue ③, trust)
- 13 series with duplicates ("He Is Risen…" vs "He Has Risen Series"),
  inconsistent naming (some end in "Series", some don't), and mostly-empty cards
  make the site read as unfinished. Consolidate/rename; consider collapsing or
  paginating below a threshold.

---

## Measuring it (A/B plan)

This is a small site; a clean two-arm A/B test will almost certainly **not
converge**. Worked numbers (80% power, 95% confidence, to detect a large
relative +30% lift): ~3,800 visitors/arm at a 5% subscribe baseline, ~9,800/arm
at 2% — i.e. **7–20 weeks per single test** at ~1k visits/week.

**Step 0 — instrument first.** Confirm `visit → form submit → confirmed
subscribe` is tracked end-to-end (Vercel Analytics + free Microsoft Clarity).
You need the baseline subscribe rate just to know which plan applies.

**Run this (low traffic — most likely):**
1. Sequential **before/after** on the redesign: baseline 2–4 weeks, ship, measure
   the next 2–4 weeks as *directional*, controlling for confounders (traffic
   source, a viral post, Easter seasonality).
2. Qualitative, which beats underpowered quant here: a **5-second test** (show
   the hero to 5–10 people: "what is this, how often, is it free?"), session
   recordings/heatmaps, and painted-door micro-tests for cheap copy calls.
3. Ship bar: directional lift + no qualitative red flags.

**Earn a real A/B later:** once sustaining ~1,000+ homepage visits/week at a
~5%+ subscribe rate, run a 50/50 test of the hero **as one holistic variant**
(the changes are interdependent). Pick the MDE and compute N *before* launch;
stop at N. Guardrail metric: today's-post click-through, so you don't win
subscribers by starving the returning readers.

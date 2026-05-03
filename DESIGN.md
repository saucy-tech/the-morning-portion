# The Daily Word — Design System

Direction A: **Verse-as-typography**. Editorial, cream-paper feel with a single italic-quoted scripture as the daily hero. Warm coral accent, navy ink, hand-drawn sun ornament. Inspired by quiet morning reading rooms and late-19th-century devotional broadsides.

Source prototype: `~/Downloads/The Daily Word/` (three hero directions explored; A shipped). Variants B (split layout + side verse) and C (mission-first warm dark) remain in the prototype folder for a possible future themes feature.

## Visual Theme & Atmosphere

The page should feel like a single page torn from a printed devotional — cream stock, generous margins, one italic verse holding the screen, a small numbered colophon, no decoration competing with scripture. Photography is not used. A single hand-drawn sun ornament sits at the upper right of the hero as quiet atmosphere.

Use radical typographic restraint. The verse is the page. Everything else (date row, source, CTA, meta) is small, subordinate, and aligned to a single column.

## Color Palette & Roles

| Token | Value | Role |
| --- | --- | --- |
| `--tdw-bg` | `#FBF6EC` | Cream page background |
| `--tdw-bg-alt` | `#F4ECDB` | Subscribe band, soft section alternation |
| `--tdw-paper` | `#FFFFFF` | Inputs, series cards |
| `--tdw-ink` | `#1A2236` | Headings, primary buttons, body emphasis |
| `--tdw-ink-soft` | `#3A4258` | Body copy |
| `--tdw-ink-mute` | `#6E7080` | Metadata, secondary text |
| `--tdw-rule` | `#E5DCC8` | Hairline dividers, post-list rules |
| `--tdw-rule-soft` | `#EDE5D2` | Header bottom border |
| `--tdw-warm` | `#B5552E` | Coral accent — eyebrows, № stamps, italic accents, hover |
| `--tdw-warm-deep` | `#8E3F1F` | Coral hover state |
| `--tdw-blue` | `#2C5FA8` | Reserved for occasional secondary accent |

**Dark mode** flips the surface to `#14181F` with ivory ink (`#F2EAD8`) and warmer coral (`#D4825A`). Tokens overridden under `html[data-theme='dark']`. Stored in `localStorage` as `daily-word-theme`; respects `prefers-color-scheme` on first paint via inline script in `layout.tsx`.

Do not introduce gold, brown-paper textures, gradient overlays, or dark navy chrome. Warmth comes from the cream stock + a single coral accent, not from many colors.

## Typography

- **Display/Serif**: Fraunces (variable, axes `SOFT` + `opsz`). Hero verse, post titles, section headings, blockquotes, brand wordmark, № stamps. Loaded via `next/font/google` and exposed as `--tdw-serif`.
- **Body/Sans**: Inter. Eyebrows, body copy in articles, metadata, buttons. Exposed as `--tdw-sans`.

Letter-spacing is subtractive on display (`-0.01em`). Italic + light weights are reserved for scripture and № stamps. No uppercase outside the eyebrow.

| Role | Family | Size | Weight | Line height | Notes |
| --- | --- | --- | --- | --- | --- |
| Hero verse | Fraunces | `90px` (1024–) → `64px` → `44px` (≤860) → `36px` (≤520) | 400 | 1.02 | Italic curly quotes in `--tdw-warm` wrap the verse |
| Section heading | Fraunces | `44px` → `32px` (≤860) | 500 | 1.1 | Italic-coral accent span permitted (`<span class="accent">`) |
| Post page H1 | Fraunces | `56px` → `40px` (≤860) | 500 | 1.05 | |
| Post body H2 | Fraunces | `28px` | 500 | 1.2 | `margin: 56px 0 20px` |
| Body | Inter | `18px` | 400 | 1.75 | Color `--tdw-ink-soft` |
| Eyebrow | Inter | `12px` | 600 | — | `letter-spacing: 0.14em`, uppercase, `--tdw-warm` |
| № stamp | Fraunces italic | `16–18px` | 300 | — | `--tdw-warm` |
| Metadata | Inter | `13–14px` | 400 | 1.5 | `--tdw-ink-mute` |

## Components

### Header (`.site-header`)
Sticky cream-tinted bar with backdrop blur, 72px min-height. Book-mark SVG + serif wordmark left, simple text nav center (Today / Archive / Series), pill ThemeToggle + pill Subscribe right. Single hairline border-bottom in `--tdw-rule-soft`.

### Hero (`.hero`)
Cream surface, no photography. Layout (top to bottom inside `.hero-inner`):

1. `.hero-meta-row` — eyebrow date · 1px rule · italic № stamp
2. `.hero-source` — "From today's reading — *Reference*" in muted ink
3. `.hero-verse` — big Fraunces verse with curly warm quotes
4. `.hero-actions` — pill primary "Read today's reflection →" + italic post title · reading time

`.hero-ornament` (hand-drawn Sun SVG, 300px) sits absolutely at the upper right with `opacity: 0.18`. Hidden on mobile.

### Buttons (`.button`)
Pill (`border-radius: 999px`), 14/24 padding, 44px min-height, weight 600.

- `.primary` — `--tdw-ink` background, cream text. Hover: switches to `--tdw-warm` background.
- `.ghost` — transparent, inset 1px ink ring, ink text. Hover inverts.

### Theme toggle (`.theme-toggle`)
Pill, 36×36, 1px rule border, sun/moon SVG.

### Post list (`.post-list`)
Ordered list, top + bottom hairline rules per row. Each `.post-row` is a 3-column grid: italic № stamp · (date · series + Fraunces title) · → arrow. Hover tints text `--tdw-warm`.

Numbers come from a global `Map<slug, n>` produced by `getPostNumbers()` in `src/lib/posts.ts` so filtered subsets (series page, related list) keep the global devotion number.

### Series grid (`.series-grid`)
Auto-fill cards, `min(280px)` columns, 16px gap. Card: paper background, 1px rule border, 24px padding, 180px min-height. Footer holds a Fraunces title; header holds count meta. Hover: border tints warm.

### Subscribe band (`.subscribe-section`)
Background `--tdw-bg-alt`. Two-column grid (title left, form right, 64px gap). Pill submit, 1px-rule input with paper background, focus ring uses `--tdw-ink` color-mix.

### Reading layout (`.reading-layout`)
720px max-width centered column. Italic № stamp colophon, Fraunces H1, Inter body at 18/1.75, blockquote with 3px warm left border in italic Fraunces. Anchor color `--tdw-warm` underlined.

### Footer (`.site-footer`)
Single-row, top-rule. Serif wordmark left, two text links right (RSS, saucy.tech).

## Ornaments

`src/components/Ornaments.tsx` — hand-drawn SVG strokes (1.0–1.4 weight, round caps).

| Component | Use |
| --- | --- |
| `Sun` | Hero atmosphere, top-right at 0.18 opacity |
| `Hills` | Reserved for Direction B (not currently rendered) |
| `Arc` | Reserved for Direction C |
| `Mark` | Logomark (open book + small dot of light) used in `.brand` |

All take `currentColor` so they inherit ink/warm from the parent.

## Layout & spacing

8px base. Sections share `.section` (64px padding) wrapping a `.section-inner` capped at 1240px.

| Token | Value | Role |
| --- | --- | --- |
| 4px | Tiny adjustments |
| 8px | Base gap |
| 16px | Compact spacing |
| 24px | Button horizontal padding |
| 64px | Section padding (24px on ≤860) |
| 100px / 80px | Hero top / bottom padding (64/56 on ≤860) |

The hero never uses a fixed viewport height. The page reads top-down: hero → archive → subscribe → series → footer.

## Responsive

| Breakpoint | Behavior |
| --- | --- |
| `≤1024px` | Hero verse 64px |
| `≤860px` | Header nav hidden, hero verse 44px, sun ornament hidden, sections 24px gutter, subscribe stacks |
| `≤520px` | Hero verse 36px, hero actions stack full-width, post-row drops the → arrow |

All typography uses fixed sizes (no viewport scaling) so reading remains predictable across devices.

## Do / Don't

**Do**
- Let one italic verse hold the screen.
- Keep the № stamp in italic Fraunces, warm color, never bold.
- Use the curly quotation marks (`“ ”`) in coral, not straight quotes.
- Treat the Sun ornament as atmosphere only — never a content marker.
- Maintain hairline rules for separation; depth comes from typography, not shadows.

**Don't**
- Don't add a photographic hero.
- Don't introduce gradients, frosted blobs, or accent colors beyond coral.
- Don't bold the № stamp or use uppercase outside the eyebrow.
- Don't wrap content in cards-inside-cards.
- Don't scale type with viewport; respect the breakpoint table.

## Frontmatter contract for the verse hero

The hero falls back to the post title when scripture frontmatter is absent. To activate the verse-as-typography hero, add to the latest MDX:

```yaml
verse: "For whosoever will save his life shall lose it..."
reference: "Matthew 16:25 (KJV)"
```

Both are optional. Schema lives in `src/lib/posts.ts`.

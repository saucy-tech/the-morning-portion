# The Daily Word Design System

Source note: this file is adapted from the Tesla-inspired Awesome DESIGN.md entry requested for this project. The local Awesome Design MD repo only contained a pointer, and `npx getdesign@latest add tesla` failed with `No versions available for getdesign`, so these tokens are derived from the public Tesla preview and tailored for The Daily Word.

## Visual Theme & Atmosphere

The interface should feel like a quiet reading room with the restraint of a product launch page: one message per screen, very little chrome, and photography used as atmosphere rather than decoration. Warmth should come from softer language, the morning image, and a restrained coral accent, not from a brown or gold palette.

Use radical subtraction. The page should have fewer things, not smaller things. Large open areas, direct copy, precise alignment, and minimal navigation are the core rules.

The Daily Word adaptation replaces automotive language with scripture-first editorial rhythm. Treat the latest reflection as the primary product. Treat the archive as a simple library.

## Color Palette & Roles

| Token | Value | Role |
| --- | --- | --- |
| Electric Blue | `#3E6AE1` | Primary action, focus ring, active link |
| Warm Coral | `#B6534D` | Small accent for scripture and subscribe moments |
| Pure White | `#FFFFFF` | Primary background and button surface |
| Light Ash | `#F4F4F4` | Alternate surface and quiet band |
| Carbon Dark | `#171A20` | Headings, navigation, dark overlays |
| Graphite | `#393C41` | Body copy |
| Pewter | `#5C5E62` | Secondary text and metadata |
| Silver Fog | `#8E8E8E` | Tertiary text and disabled state |
| Cloud Gray | `#EEEEEE` | Hairline dividers |
| Pale Silver | `#D0D1D2` | Input borders and subtle delineation |
| Frosted Glass | `rgba(255,255,255,0.75)` | Header backdrop when layered over imagery |

Do not build a gold, beige, brown, purple, or dark-blue theme. Use the project-owned hero image with restraint so the interface still reads white, graphite, blue, and a small coral accent.

Dark mode uses the same system in charcoal: near-black page background, warm off-white text, blue action color, and coral scripture accents. The toggle must persist in `localStorage` and respect system preference before the reader chooses a mode.

## Typography Rules

Use Inter as the practical substitute for Universal Sans.

| Role | Size | Weight | Line Height | Notes |
| --- | --- | --- | --- | --- |
| Hero Title | `40px` | `500` | `48px` | Plain sentence case |
| Hero Kicker | `14px` | `500` | `20px` | Uppercase is allowed with normal letter spacing only |
| Promo Text | `22px` | `400` | `30px` | Use over darkened image areas |
| Post Title | `32px` | `500` | `40px` | Reading pages |
| Nav Item | `14px` | `500` | `18px` | Minimal header links |
| Body Text | `16px` | `400` | `26px` | Reading optimized |
| Metadata | `14px` | `400` | `20px` | Pewter |

No negative letter spacing. Do not scale font size with viewport width.

## Component Styling

Buttons are barely rounded rectangles. Radius is `4px`. Primary buttons use Electric Blue with white text. Secondary buttons use white with Carbon Dark text. Text links use Pewter or Carbon Dark and underline on hover.

Inputs use white backgrounds, Pale Silver borders, `4px` radius, and Electric Blue focus states.

Post list items may use a single flat border or none. Avoid shadows. Repeated post items can use a `1px` Cloud Gray divider and a white background.

Newsletter forms can be framed as a functional control surface, but do not put cards inside cards.

## Layout Principles

Use an 8px spacing base.

| Token | Value | Role |
| --- | --- | --- |
| `4px` | Button inner adjustments |
| `8px` | Base gap |
| `16px` | Compact content gap |
| `24px` | Button horizontal padding |
| `40px` | Section horizontal padding |
| `80px` | Section vertical padding |
| `82svh` | Hero height so the next section remains visible |

The homepage should begin with the actual Daily Word experience, not a landing page pitch. Put the latest reflection, subscription action, and archive path above the fold.

## Depth & Elevation

Default to flat. No decorative shadows. Depth comes from photography, opacity layering, and whitespace.

Use frosted navigation sparingly. Avoid blobs, gradient orbs, bokeh decoration, and framed preview containers.

## Responsive Behavior

Collapse header navigation into a compact row, not a hidden menu, unless the app grows. Keep tap targets at least `40px` tall. Keep hero content readable with a dark image overlay and enough width for long titles.

Post lists should become single-column on mobile. Forms should stack on mobile and sit inline only when space allows.

## Do's And Don'ts

Do:
- Let the latest reflection dominate the first screen.
- Use the Daily Word hero image as atmosphere, cooled and darkened.
- Keep copy direct and reader-facing.
- Prefer `4px` radius for controls and `8px` maximum for repeated items.

Don't:
- Use gold-on-green styling from the personal site.
- Turn the site into a generic newsletter landing page.
- Add decorative gradients or floating glow shapes.
- Use self-referential UI copy such as "this page shows".
- Create a beige, brown, or orange visual system from the banner image.

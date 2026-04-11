# The Daily Word Design System
## Inspired by Bible Project

Source: Extracted and adapted from [BibleProject.com](https://bibleproject.com/) visual identity and component patterns. This design system emphasizes **educational accessibility**, **welcoming aesthetics**, and **illustration-driven layouts** suitable for scripture reading and spiritual reflection.

## Visual Theme & Atmosphere

The interface should feel like a welcoming, accessible learning space. Think: a nonprofit educational platform focused on helping people understand and explore scripture. The design should:

- Use **semantic HTML** with clear, accessible component patterns
- Emphasize **readability for long-form content** (reflection, study guides, scripture passages)
- Feature **illustration-heavy design** with geometric, friendly artwork
- Convey warmth and approachability (not cold, corporate)
- Support **multiple content types** (videos, guides, classes/lessons, podcasts/reflections)
- Build **community focus** and accessibility-first design

The philosophy: "We create resources to help people understand [The Daily Word]" — **Educational, Accessible, Welcoming**.

## Color Palette & Roles

| Token | Value | Role | Notes |
| --- | --- | --- | --- |
| Primary White | `#FFFFFF` | Primary background, reading surfaces | Clean, readable for long text |
| Deep Navy/Dark | `#1A1A2E` | Secondary background, navigation | Dark mode or contrast areas |
| Accent Blue | `#4A90E2` | Interactive elements, links, CTAs | Clear, accessible blue |
| Warm Accent | `#C08552` | Scripture highlights, callouts, emphasis | Warm terracotta tone |
| Text Dark | `#2C3E50` | Body text, headings, primary content | High contrast on white |
| Text Medium | `#7F8C8D` | Secondary text, metadata, captions | Readable secondary hierarchy |
| Neutral Light | `#ECF0F1` | Subtle backgrounds, borders, dividers | Minimal visual noise |
| Illustration Palette | Multi-color | Decorative illustrations, icons, visual interest | Geometric, friendly, varied |

**Dark Mode:** Invert backgrounds (Near-black pages, off-white text), maintain Blue accent and Warm Accent, ensure sufficient contrast for readability.

Do not use: gold, brown, purple, or corporate grays. Keep the palette warm, accessible, and illustration-friendly.

## Typography Rules

Use a readable, friendly system font stack or open-source typeface (e.g., Inter, Outfit, or system fonts).

| Role | Size | Weight | Line Height | Notes |
| --- | --- | --- | --- | --- |
| Page Title | `40-48px` | `600` | `1.2` | Educational material headings |
| Section Title | `28-32px` | `600` | `1.3` | Lesson sections, guides |
| Card Title | `20-24px` | `600` | `1.3` | Resource cards, module titles |
| Body Text | `16px` | `400` | `1.6-1.8` | Reading optimized, generous line height |
| Navigation | `14px` | `500` | `1.5` | Menu items, links |
| Metadata | `13px` | `400` | `1.5` | Dates, categories, secondary info |
| Label | `12px` | `500` | `1.4` | Form labels, small UI text |

**Emphasis:** Use weight variation (400 to 600) more than size variation. Generous line heights improve readability for educational content.

## Component Styling

### Navigation
- **Header**: Semantic HTML (`<nav>`), horizontal menu with primary items (Daily Word, Guides, Classes, Podcast, More)
- **Submenus**: Dropdown patterns for secondary navigation (Languages, User Account, Settings)
- **Mobile**: Menu toggle button, accessible label. Keep tap targets ≥40px
- **Accessibility**: Skip-to-content link at top, ARIA labels for all interactive elements

### Buttons
- **Primary CTA**: Accent Blue background, white text, `4px` radius, hover state darkens blue
- **Secondary**: Outlined or white with text color, `4px` radius
- **Subscribe/Support**: Warm Accent (#C08552) for call-to-action prominence
- **Disabled**: Gray text, reduced opacity, no hover effect

### Cards & Components
- **Resource Cards**: Illustration-based, with rounded corners (`8px`), shadow optional (use sparingly)
- **Card Content**: Title, brief description, illustration/image at top or side
- **Lists**: Single flat border or minimal divider (`1px` Neutral Light), white background
- **Forms**: White inputs with `4px` radius, Blue focus ring, clear labels with `for` attribute

### Links
- **Inline Links**: Accent Blue with underline, hover shows darker blue
- **External Links**: Indicate with icon or note
- **Accessible**: Focus ring visible, sufficient color contrast

## Layout Principles

Use an **8px base spacing grid**.

| Token | Value | Role |
| --- | --- | --- |
| `4px` | Micro adjustments, button internals |
| `8px` | Base gap between adjacent elements |
| `16px` | Compact content spacing, nested items |
| `24px` | Button horizontal padding |
| `40px` | Section horizontal padding, medium gaps |
| `80px` | Section vertical padding, major section spacing |

**Structure**: 
- Hero section at top with featured Daily Word reflection or callout
- Primary content area (reading, study guide, lesson)
- Navigation to archive or related resources below
- Footer with support/community links

**Content Hierarchy**:
1. Hero section / Featured reflection (dominant)
2. Primary content area (study material, reflection text)
3. Related resources or next steps
4. Archive / browse section (library-style)

Keep layouts **single-column on mobile**, **multi-column on desktop** (if needed). Prioritize **readability and focus** over visual complexity.

## Depth & Elevation

Default to **flat design**. Depth comes from:
- **Whitespace** and breathing room
- **Typography hierarchy** (size, weight, color)
- **Photography** (subtle background imagery, never dominating)
- **Illustration** (friendly, geometric, supporting content)

Avoid:
- Decorative shadows (use sparingly, only for layering clarity)
- Gradient overlays (keep subtle, preserve legibility)
- Floating blobs or decorative shapes
- Multiple nested cards

Use **semantic layering** — implied depth through content hierarchy, not visual tricks.

## Responsive Behavior

- **Breakpoint philosophy**: Mobile-first, expand from narrow to wide
- **Hero height**: Use `100vh` or `82svh` to keep next section visible (draws reader down)
- **Navigation**: Collapse to icon-based or vertical menu if needed; keep accessible
- **Touch targets**: Minimum `40px` height, `44px` recommended
- **Typography**: Fixed sizes (no viewport scaling), maintain `16px` minimum for accessibility
- **Content width**: Max-width `65-75ch` (characters per line) for readability on wide screens

## Accessibility Standards

- **WCAG 2.1 AA minimum**: All text ≥4.5:1 contrast ratio
- **Semantic HTML**: Use `<nav>`, `<main>`, `<article>`, `<footer>` correctly
- **ARIA labels**: On icons, buttons without text, and custom components
- **Keyboard navigation**: Tab through all interactive elements, logical order
- **Skip links**: "Skip to content" at top
- **Focus visible**: Clear focus ring on all interactive elements
- **Images**: Descriptive `alt` text for illustrations, decorative images marked `alt=""`
- **Forms**: Associated labels, clear error messages, optional vs required indication
- **Color**: Don't rely on color alone (use text labels, icons, patterns)

## Do's And Don'ts

### Do:
- Let the featured Daily Word reflection or lesson **dominate the first screen**
- Use **illustrations** to support learning and break text
- Create **clear hierarchy** through typography and spacing
- Design for **mobile-first readability** (generous line heights, tap targets)
- Include **navigation to archive** and related resources
- Make **accessibility a feature**, not an afterthought (labels, skip links, focus management)
- Support **multiple content types** (reflections, guides, lessons, podcasts)
- Use **semantic HTML** throughout

### Don't:
- Create a **generic newsletter layout** — emphasize the content, not the platform
- Use **dark/corporate color palettes** — keep it warm and welcoming
- Rely on **tiny text or dense layouts** — this is an educational platform, not a news site
- Add **decorative gradients or floating shapes** — clarity over decoration
- Forget **accessibility** — captions, labels, ARIA, keyboard navigation matter
- Build **complex multi-level menus** — keep navigation simple and flat
- Use **auto-playing audio or video** — put the user in control
- Ignore **dark mode** — support both light and dark preferences

## Agent Prompt Guide

When building UI for The Daily Word using this design system:

> Build a reading interface inspired by BibleProject.com. Features: welcoming, accessible educational design with warm accents and illustration support. Navigation: Daily Word (featured), Guides, Classes, Podcast, More. Color: white/dark backgrounds, accent blue (#4A90E2), warm accent (#C08552). Typography: readable sans-serif, generous line heights (1.6-1.8), semantic hierarchy. Components: semantic navigation, card-based resource lists, clear CTAs, form inputs with focus rings. Accessibility first: ARIA labels, skip links, keyboard nav, high contrast. Layout: mobile-first, 8px grid, max-width for reading comfort. Avoid: decorative elements, dark/corporate palettes, inaccessible patterns.

## References

- **Source inspiration**: [BibleProject.com](https://bibleproject.com/)
- **Design philosophy**: Educational, accessible, community-focused content platform
- **Format**: Adapted from Google Stitch [DESIGN.md specification](https://stitch.withgoogle.com/docs/design-md/)

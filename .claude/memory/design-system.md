# Design System — Tier 2 Reference

## Color Palette

All colors defined as CSS custom properties in `:root` (`styles.css:5-16`):

| Token | Hex | Context |
|-------|-----|---------|
| `--bg-primary` | `#1A1A1A` | Dark scene backgrounds, body background |
| `--bg-cream` | `#FFF8F0` | CTA button text color |
| `--bg-sakura-tint` | `#FEF0F0` | Scene 5 background only |
| `--green-sage` | `#4A7C59` | CTA buttons default state |
| `--green-sage-hover` | `#5A9469` | CTA hover + box-shadow |
| `--pink-sakura` | `#E8A0BF` | Sakura particle accent |
| `--gold` | `#C9A86C` | h3 headings, header wordmark, stars, italic accent text |
| `--text-light` | `#F5F0EB` | Primary text on dark backgrounds |
| `--text-dark` | `#1A1A1A` | Text on light backgrounds (Scene 5 only) |
| `--text-muted` | `#A89F95` | Subheadlines, micro text, trust strip, badges |

**Dark/light switching**: Scene 5 is the only light section. Its headings and text use `--text-dark`. All other scenes use `--text-light`.

## Typography

| Role | Font | Weight | Desktop → Mobile |
|------|------|--------|-----------------|
| h1 (hero headline) | Cormorant Garamond | 300 | 72px → 40px → 36px (480px) |
| h2 (section headline) | Cormorant Garamond | 300 | 48px → 32px |
| h3 (card/block heading) | Cormorant Garamond | 400 | 28px → 22px |
| Body text | Lato | 300 | 18px → 16px |
| Micro/labels | Lato | 400 | 13–14px (no change) |
| Wordmark | Cormorant Garamond | 400 | 20px, `--gold`, uppercase, 3px letter-spacing |

Font loading: `<link>` with `preconnect` to Google Fonts. `display=swap` ensures text renders before font loads.

## CTA Buttons

- Class: `.cta-button` — pill shape (`border-radius: 50px`)
- Default: `padding: 18px 48px`, `font-size: 16px`, uppercase, 2px letter-spacing
- Small: `.cta-button--small` — `padding: 10px 28px`, `font-size: 13px`
- Hover: background → `--green-sage-hover`, `box-shadow: 0 4px 24px rgba(74,124,89,0.3)`
- Mobile (≤768px): `width: 100%`, `max-width: 400px`
- Mobile (≤480px): `width: calc(100% - 48px)`, `max-width: none`

## Spacing Conventions

| Context | Desktop | Mobile (≤768px) |
|---------|---------|-----------------|
| Section vertical padding | `100px 0` | `60px 0` |
| Inner container max-width | `1100–1200px` | Same, constrained by viewport |
| Inner container side padding | `0 48px` | `0 24px` |
| Card gaps | `24–32px` | Same |
| Content element gaps | `64px` | `40px` |
| Headline bottom margin | `64–80px` | `48px` |

## Responsive Breakpoints

### 768px (Tablet)
- `.section-headline`: 48px → 32px
- Body: 18px → 16px
- Scene 2: flex-direction column, gap 40px
- Scene 4: craft blocks stack, image full-width
- Scene 5: 3-col → 2-col grid
- Scene 6: benefits stack vertically
- CTA: full-width (max 400px)
- Mobile CTA bar: `display: flex` (hidden on desktop)

### 480px (Mobile)
- h1: 40px → 36px
- Testimonials: 2-col → 1-col
- CTA: `calc(100% - 48px)`, no max-width
- Trust strip: flex → `grid 1fr 1fr` (2×2 layout)

## CSS Architecture

- **No preprocessor** — vanilla CSS only
- **Custom properties** for all colors — change palette by editing `:root`
- **BEM-like naming**: `.scene-1__headline`, `.craft-block--right`, `.cta-button--small`
- **Scene-scoped overrides**: `.scene-3__content [data-delay="1"]` overrides global delays
- **Transition divs**: `.transition-dark-to-light` / `.transition-light-to-dark` — 80px gradient bands

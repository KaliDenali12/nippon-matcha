# Nippon Matcha — Design System (Current State)

> **Generated**: 2026-03-25 | **Source**: `styles.css` (943 lines) + `script.js` (249 lines)
> **Purpose**: Documents what the design system *actually is* today, not what it should be.

---

## Color Palette

### CSS Custom Properties (`:root`)

| Token | Value | Role | Usage |
|-------|-------|------|-------|
| `--bg-primary` | `#1A1A1A` | Dark backgrounds | Body, Scenes 2/4/6, transitions |
| `--bg-cream` | `#FFF8F0` | CTA text | Button text on green, skip-link text |
| `--bg-sakura-tint` | `#FEF0F0` | Light background | Scene 5, transition gradients |
| `--green-sage` | `#4A7C59` | Primary CTA | Button backgrounds, skip-link bg |
| `--green-sage-hover` | `#5A9469` | CTA hover | Button hover state |
| `--pink-sakura` | `#E8A0BF` | **Unused in CSS** | Defined but only appears as hardcoded hex in JS |
| `--gold` | `#C9A86C` | Accent | h3 headings, wordmark, stars, focus outline |
| `--text-light` | `#F5F0EB` | Primary text (dark bg) | Body text on dark scenes |
| `--text-dark` | `#1A1A1A` | Primary text (light bg) | Scene 5 text |
| `--text-muted` | `#A89F95` | Secondary text | Subheadlines, meta text, prices |

### Hardcoded Colors (Not Tokenized)

| Value | Where | Should Be |
|-------|-------|-----------|
| `#FFFFFF` | `.testimonial-card` background | Needs `--bg-white` or `--bg-card` variable |
| `rgba(26,26,26, 0.85/0.92)` | Header, mobile bar backdrop | RGBA variant of `--bg-primary` |
| `rgba(26,26,26, 0.4–0.75)` | Scene overlays (1, 3, 7) | RGBA variant of `--bg-primary` |
| `rgba(255,255,255, 0.05)` | Craft image, benefit card bg | Subtle white wash |
| `rgba(201,168,108, 0.2–0.3)` | Benefit card/craft image border | RGBA variant of `--gold` |
| `rgba(74,124,89, 0.3–0.4)` | CTA hover/focus shadows | RGBA variant of `--green-sage` |
| `rgba(0,0,0, 0.06–0.5)` | Card shadow, tin drop-shadow | Generic black |

### JS-Only Colors (Sakura Particles)

| Value | CSS Variable | Status |
|-------|-------------|--------|
| `#F7D1D5` | — | No CSS variable |
| `#EDAFCA` | — | No CSS variable |
| `#E8A0BF` | `--pink-sakura` | Matches but not referenced via variable |
| `#D4A0A0` | — | No CSS variable |

---

## Typography Scale

### Fonts

| Role | Family | Weight | Source |
|------|--------|--------|--------|
| Headings | Cormorant Garamond | 300 (h1/h2), 400 (h3) | Google Fonts |
| Body | Lato | 300 (body), 400 (labels/micro) | Google Fonts |

### Font Sizes (Desktop → Tablet → Mobile)

| Element | Desktop | 768px | 480px |
|---------|---------|-------|-------|
| h1 (`.scene-1__headline`) | 72px | 40px | 36px |
| h2 (`.section-headline`) | 48px | 32px | — |
| h3 (`.craft-block__text h3`) | 28px | 22px | — |
| Stars (`.scene-5__stars`) | 24px | — | — |
| Subheadline | 20px | 16px | — |
| Body (`p`) | 18px | 16px | — |
| CTA button | 16px | — | — |
| Card body (benefit, testimonial) | 16px | — | — |
| Meta text (micro, price, name) | 14px | — | — |
| Small text (badge, trust, risk, CTA small) | 13px | — | — |

**Total unique font-size values**: 13 (no modular scale)

### Line Heights

| Context | Value |
|---------|-------|
| Headings (h1/h2/h3) | 1.2 |
| Body paragraphs | 1.7 |
| Scene 3 paragraphs | 1.8 |
| Testimonial blockquotes | 1.6 |

---

## Spacing Scale

### Base Unit: 8px (loosely followed)

| Token | On 8px Grid? | Common Uses |
|-------|-------------|-------------|
| 4px | Yes (0.5x) | Card name bottom margin |
| 10px | No | CTA small vertical padding |
| 12px | No | Skip-link padding, trust strip gap (480px) |
| 16px | Yes (2x) | Component internal margins, CTA margins |
| 20px | No | Scene 2 paragraph margin |
| 24px | Yes (3x) | Scene padding (mobile), content gaps |
| 28px | No | CTA small horizontal padding |
| 32px | Yes (4x) | Hero subheadline margin, section gaps |
| 40px | Yes (5x) | Benefit card padding, mobile section gaps |
| 48px | Yes (6x) | Scene side padding (desktop), craft block gap |
| 60px | No | Section padding (tablet) |
| 64px | Yes (8x) | Scene 2 column gap, craft block gap |
| 80px | Yes (10x) | Scene 4 headline margin, transition height |
| 100px | No | Section vertical padding (desktop) |

**On grid (8px multiples)**: 8 of 14 values (57%)

### Layout Containers (max-width)

| Value | Selectors |
|-------|-----------|
| 1200px | `.header-inner`, `.scene-2__inner`, `.scene-6__inner` |
| 1100px | `.scene-4__inner`, `.scene-5__inner` |
| 800px | `.scene-1__headline` |
| 640px | `.scene-3__content` |
| 560px | `.scene-7__body` |
| 400px | `.cta-button` (768px breakpoint) |
| 360px | `.benefit-card` |

---

## Border Radius

| Value | Usage |
|-------|-------|
| 8px | Skip-link (bottom corners only) |
| 12px | Craft block image placeholders |
| 16px | Testimonial cards, benefit cards |
| 50px | CTA buttons (pill shape) |

**Dominant card radius**: 16px

---

## Shadows

| Value | Usage |
|-------|-------|
| `0 4px 24px rgba(74,124,89,0.3)` | CTA hover glow |
| `0 0 0 5px rgba(74,124,89,0.4)` | CTA focus ring |
| `0 2px 16px rgba(0,0,0,0.06)` | Testimonial card subtle shadow |
| `drop-shadow(0 12px 32px rgba(0,0,0,0.5))` | Tin product images (×3 duplicated) |
| `blur(12px)` | Header + mobile bar backdrop |

---

## Transitions & Animation

### Easing Functions

| Curve | Usage | Count |
|-------|-------|-------|
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Scroll animations, header/bar slide | 4× |
| `ease` | CTA hover | 1× |
| `ease-in-out` | Float, pulse, sakura sway | 3× |
| `linear` | Sakura fall, sakura spin | 2× |

**Signature easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (not tokenized)

### Durations

| Duration | Context |
|----------|---------|
| 300ms | CTA hover (standard interaction) |
| 400ms | Header/bar slide (UI chrome) |
| 800ms | Default scroll entrance |
| 1000ms | Scene 7 tin entrance |
| 1200ms | Scene 3 ritual entrance |
| 2s | CTA pulse (Scene 7) |
| 3s | Tin float (Scene 1) |

### Stagger System

Three separate increment patterns:

| Context | Base Delay | Increment | Range |
|---------|-----------|-----------|-------|
| Default (`[data-delay]`) | 0ms | 200ms | 0–1000ms |
| Scene 1 hero | 500ms | 300ms | 500–1400ms |
| Scene 3 ritual | 0ms | 600ms | 0–1800ms |

---

## Breakpoints

| Breakpoint | Type | Approach |
|------------|------|----------|
| 768px | `max-width` | Desktop-first. Stacking, 2-col grids, reduced padding |
| 480px | `max-width` | Further simplification. 1-col, smallest type |
| `prefers-reduced-motion` | Preference | Disables all animations, transitions, scroll-behavior, sakura petals |

---

## Z-Index Scale

| Value | Element | Purpose |
|-------|---------|---------|
| 0 | `.bg-video` | Background videos |
| 1 | `.scene-overlay`, `.sakura-container` | Overlays, particles |
| 2 | Scene content wrappers | Text/images above overlays |
| 999 | `.mobile-cta-bar` | Fixed mobile CTA |
| 1000 | `.floating-header` | Fixed navigation |
| 10000 | `.skip-link` | Accessibility skip nav |

---

## Deviations from Dominant Patterns

### Values That Don't Fit the System

| Category | Deviation | Expected | Actual |
|----------|-----------|----------|--------|
| Font size | 13px vs 14px | Single small tier | Two nearly-identical sizes |
| Font size | 24px stars | Part of heading scale | One-off for stars only |
| Spacing | 10px, 12px, 20px, 28px | 8px multiples | Off-grid values |
| Spacing | 60px, 100px | 8px multiples | 60 = 7.5×, 100 = 12.5× |
| Max-width | 1100px vs 1200px | Single container width | Two competing widths |
| Border-radius | 12px | 8 or 16px | Between the card and skip-link values |
| Colors | `#FFFFFF` hardcoded | Variable | No white token exists |
| Colors | `--pink-sakura` | Used in CSS | Defined but unused |
| Easing | `ease` on CTA | Project cubic-bezier | Different curve for primary interaction |

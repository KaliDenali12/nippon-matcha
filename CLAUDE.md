# Nippon Matcha — AI Codebase Guide

Premium landing page for Nippon Matcha — organic ceremonial-grade matcha from a single estate in Uji, Kyoto. Static, scroll-driven storytelling with video backgrounds, scroll-linked animations, sakura particle effects, and a direct-to-Amazon purchase flow. No build tools, no framework — vanilla HTML, CSS, and JavaScript.

---

## Workflow Rules

- **No build step** — static site. Serve with `npx serve .`, `python -m http.server 8000`, or VS Code Live Server
- **No tests** — no test suite exists. Verify visually in browser at desktop, 768px, and 480px widths
- **Videos are large** — `assets/videos/` contains MP4 files. Be mindful of git push times and repo size
- **Single-page architecture** — all content lives in `index.html`. No routing, no multi-page navigation
- **All external links** use `target="_blank" rel="noopener"`
- **Purchase CTAs** all link to: `https://www.amazon.com/Nippon-Matcha-Ceremonial-Certified-Stone-Ground/dp/B0FFSXTJWK`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Vanilla HTML5 |
| Styling | Vanilla CSS3 (custom properties, flexbox, grid, keyframe animations) |
| Scripting | Vanilla JavaScript (ES6, IIFE pattern) |
| Fonts | Google Fonts — Cormorant Garamond (headings), Lato (body) |
| Hosting | TODO: Netlify, GitHub Pages, or similar static host |

---

## Project Structure

```
nippon-matcha/
├── index.html              # Single-page site (all 7 scenes, ~238 lines)
├── styles.css              # All styles (~960 lines)
├── script.js               # All interactions (~249 lines, IIFE)
├── CLAUDE.md               # This file
├── .gitignore
├── assets/
│   ├── images/
│   │   └── tin-100g.png    # Product tin image (8.4 MB — used in scenes 1, 2, 7)
│   └── videos/
│       ├── sakura-hero.mp4 # Scene 1 hero background (3.1 MB, preloaded)
│       ├── ritual-pour.mp4 # Scene 3 ritual background (5.7 MB, preload="none")
│       └── ready-bowl.mp4  # Scene 7 final CTA background (4.1 MB, preload="none")
├── docs/
│   └── DESIGN_SYSTEM.md    # Human-facing design system reference
├── audit-reports/          # Automated audit reports (performance, cleanup, etc.)
└── .claude/
    └── memory/
        └── MEMORY.md       # AI memory index
```

---

## Build & Run Commands

```bash
npx serve .                    # Node static server
python -m http.server 8000     # Python alternative
# No build, no tests, no deploy pipeline yet
```

---

## Page Architecture: 7 Scenes

Vertical scroll through 7 full-viewport narrative sections:

| # | Scene | ID | Background | Key Feature |
|---|-------|----|------------|-------------|
| 1 | The Arrival | `#scene-1` | `sakura-hero.mp4` (autoplay loop) | Floating tin, hero headline, CTA |
| 2 | The Origin | `#scene-2` | Solid dark | Scroll-linked tin rotation (360° Y-axis) |
| 3 | The Ritual | `#scene-3` | `ritual-pour.mp4` (play once) | Slow entrance animations (1200ms) |
| 4 | The Craft | `#scene-4` | Solid dark | 4 alternating image/text blocks (images are placeholders) |
| 5 | The Testimony | `#scene-5` | Light sakura tint | 5 testimonial cards, 3→2→1 col responsive |
| 6 | The Promise | `#scene-6` | Solid dark | 3 benefit cards |
| 7 | The Invitation | `#scene-7` | `ready-bowl.mp4` (play/pause) | Final CTA, trust strip, pulse animation |

Dark↔light transitions use gradient divs: `.transition-dark-to-light`, `.transition-light-to-dark`.

---

## Architectural Rules

### Animation System
- Scroll-triggered entrances via `IntersectionObserver` on `[data-animate]` elements
- Types: `slide-up`, `slide-right`, `scale-up`, `fade-only`
- Stagger via `[data-delay="0-5"]` (200ms increments; hero uses 300ms, Scene 3 uses 600ms)
- Elements get `.visible` class **once** — animations fire once, never re-trigger
- All JS is wrapped in a single IIFE — no globals

### Video Strategy
- Scene 1: `autoplay loop muted playsinline` (always playing), preloaded via `<link rel="preload">`
- Scene 3: `muted playsinline preload="none"`, plays once via IntersectionObserver
- Scene 7: `muted playsinline preload="none"`, plays/pauses on visibility toggle
- All videos: `object-fit: cover`, absolute-positioned backgrounds
- Below-fold videos use `preload="none"` to avoid fetching ~10 MB on initial load

### Interactive Elements
- **Scene 2 tin rotation**: Scroll progress → 360° Y-axis rotation with lerp (0.08 factor) + `scaleX` for 3D effect. rAF loop gated by IntersectionObserver (only runs when visible)
- **Scene 7 CTA pulse**: 2-cycle scale pulse triggered 1s after entering viewport
- **Floating header**: Appears when Scene 1 leaves viewport (threshold 0.5)
- **Mobile sticky CTA bar**: Appears after Scene 3 exits (≤768px only)
- **Scene 4 parallax**: Image placeholders translate on scroll (`0.4` factor)

### Sakura Particles
- Fixed overlay, SVG petal shapes, CSS keyframe animations (fall + sway + spin)
- 10 petals desktop, 5 mobile. Randomized: position, size, color, opacity, duration, direction, delay

---

## Design System (Quick Reference)

### Colors (CSS Custom Properties)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#1A1A1A` | Dark scene backgrounds |
| `--bg-cream` | `#FFF8F0` | CTA button text |
| `--bg-sakura-tint` | `#FEF0F0` | Scene 5 (testimonials) background |
| `--green-sage` | `#4A7C59` | Primary CTA buttons |
| `--green-sage-hover` | `#5A9469` | CTA hover state |
| `--pink-sakura` | `#E8A0BF` | Defined but unused — sakura particles hardcode colors in `script.js:186` |
| `--gold` | `#C9A86C` | h3 headings, header wordmark, stars |
| `--text-light` | `#F5F0EB` | Text on dark backgrounds |
| `--text-dark` | `#1A1A1A` | Text on light backgrounds (Scene 5) |
| `--text-muted` | `#A89F95` | Secondary/subtle text |

### Typography
- **Headings**: Cormorant Garamond, weight 300 (h1/h2) or 400 (h3)
- **Body**: Lato, weight 300 (body) or 400 (labels/micro)
- **h1**: 72px → 40px → 36px | **h2**: 48px → 32px | **h3**: 28px → 22px | **body**: 18px → 16px

### Responsive Breakpoints
| Breakpoint | Key Changes |
|------------|-------------|
| `768px` | Scenes 2/4/6 stack, testimonials 2-col, benefits stack, mobile CTA bar shows, scene CTAs full-width (header/mobile bar CTAs excluded) |
| `480px` | h1→36px, testimonials 1-col, trust strip 2×2 grid, scene CTAs no max-width |

---

## Coding Conventions

- **CSS**: BEM-like naming (`scene-1__headline`, `craft-block--right`), custom properties for all colors
- **JS**: Single IIFE, no global variables, `'use strict'`, IntersectionObserver for all visibility logic
- **HTML**: Semantic sections wrapped in `<main>`, `data-animate` + `data-delay` attributes for animation, `aria-hidden="true"` on decorative elements, `aria-label` on all `<section>` landmarks
- **Accessibility**: Skip-link (`<a class="skip-link">`), `:focus-visible` styles on all interactive elements, `aria-hidden` toggles with visibility on floating header and mobile CTA bar, `prefers-reduced-motion` media query disables all animations
- **No dependencies**: No npm, no CDN libraries — just Google Fonts

---

## Known TODOs

- **`tin-100g.png` is 8.4 MB** — needs conversion to WebP/AVIF (~50–150 KB target) with `<picture>` fallback. This is the #1 performance bottleneck
- Scene 4 image placeholders (dashed-border divs with `<span>` text instead of real images)
- Missing `width`/`height` attributes on `<img>` tags (causes CLS)
- No favicon
- No analytics/tracking
- No deploy pipeline
- No `<meta og:image>` or social sharing images

---

## Documentation Hierarchy

| Layer | Loaded | What goes here |
|-------|--------|----------------|
| **CLAUDE.md** | Every conversation | Rules preventing mistakes on ANY task |
| **MEMORY.md** | Every conversation | Navigation index + cross-cutting patterns |
| **Topic files** (`.claude/memory/`) | On demand | Per-topic implementation details |
| **Inline comments** | When code is read | Non-obvious "why" explanations |

**Navigation**: MEMORY.md index → topic file. Max 1 hop from cold start to answer. Every file reachable from MEMORY.md.

Rule: Prevents mistakes on unrelated tasks → CLAUDE.md. Spans features → MEMORY.md cross-cutting patterns. One feature → topic file. Single line → inline comment.

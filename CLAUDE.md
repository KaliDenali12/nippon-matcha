# Nippon Matcha — AI Codebase Guide

A premium landing page for Nippon Matcha, an organic ceremonial-grade matcha brand sourced from a single estate in Uji, Kyoto. The site is a static, scroll-driven storytelling experience with video backgrounds, scroll-linked animations, sakura particle effects, and a direct-to-Amazon purchase flow. No build tools, no framework — vanilla HTML, CSS, and JavaScript.

---

## Workflow Rules

- **No build step**: This is a static site. Open `index.html` directly or serve with any static server (e.g., `npx serve .`, Python `http.server`, or VS Code Live Server)
- **Test locally before pushing**: Preview in browser at multiple viewport widths (desktop, tablet 768px, mobile 480px) after any change
- **Videos are large**: The `assets/videos/` folder contains MP4 files. Be mindful of git push times and repo size

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Vanilla HTML5 |
| Styling | Vanilla CSS3 (custom properties, flexbox, grid, keyframe animations) |
| Scripting | Vanilla JavaScript (ES6, IIFE pattern) |
| Fonts | Google Fonts — Cormorant Garamond (headings), Lato (body) |
| Hosting | TODO: Netlify, GitHub Pages, or similar static host |
| External Links | Amazon product listing (direct CTA) |

---

## Project Structure

```
nippon-matcha/
├── .gitignore
├── CLAUDE.md               # This file — AI codebase guide
├── index.html              # Single-page site (all 7 scenes)
├── styles.css              # All styles (~877 lines)
├── script.js               # All interactions (~224 lines)
├── assets/
│   ├── images/
│   │   └── tin-100g.png    # Product tin image
│   └── videos/
│       ├── sakura-hero.mp4 # Scene 1 hero background
│       ├── ritual-pour.mp4 # Scene 3 ritual background
│       └── ready-bowl.mp4  # Scene 7 final CTA background
└── .claude/
    └── memory/
        └── MEMORY.md       # AI memory index
```

---

## Build & Run Commands

```bash
# Local dev — any static server works
npx serve .                          # Node (install: npm i -g serve)
python -m http.server 8000           # Python
# Or use VS Code "Live Server" extension

# No build, no tests, no deploy commands yet
```

---

## Page Architecture: 7 Scenes

The page is a vertical scroll through 7 narrative "scenes", each a full-viewport section:

| Scene | ID | Purpose | Background |
|-------|----|---------|------------|
| 1 — The Arrival | `#scene-1` | Hero with floating tin, headline, CTA | `sakura-hero.mp4` (autoplay loop) |
| 2 — The Origin | `#scene-2` | Brand story, scroll-linked tin rotation | Solid dark (`--bg-primary`) |
| 3 — The Ritual | `#scene-3` | Sensory description of drinking matcha | `ritual-pour.mp4` (play once on visible) |
| 4 — The Craft | `#scene-4` | Four alternating image/text craft blocks | Solid dark |
| 5 — The Testimony | `#scene-5` | 5 customer testimonial cards | Light sakura tint (`--bg-sakura-tint`) |
| 6 — The Promise | `#scene-6` | 3 benefit cards | Solid dark |
| 7 — The Invitation | `#scene-7` | Final CTA with tin, trust strip | `ready-bowl.mp4` (play/pause on visibility) |

Transitions between dark/light sections use gradient divs (`.transition-dark-to-light`, `.transition-light-to-dark`).

---

## Key Architectural Rules

### Animation System
- **Scroll-triggered entrances** via `IntersectionObserver` on `[data-animate]` elements
- Animation types: `slide-up`, `slide-right`, `scale-up`, `fade-only`
- Stagger delays via `[data-delay="0-5"]` attributes (200ms increments, hero uses 300ms)
- Elements get `.visible` class once — animations fire once, not on re-entry
- Scene 3 uses slower timing (1200ms duration, 600ms stagger)

### Video Strategy
- Scene 1: autoplay + loop + muted + playsinline (always playing)
- Scene 3: muted + playsinline, plays once when visible via IntersectionObserver
- Scene 7: muted + playsinline, plays/pauses on visibility toggle
- All videos use `object-fit: cover` as absolute-positioned backgrounds

### Interactive Elements
- **Scene 2 tin rotation**: Scroll-linked 360deg Y-axis rotation with lerped animation (0.08 factor)
- **Scene 7 CTA pulse**: 2-cycle scale pulse animation triggered 1s after entering viewport
- **Floating header**: Appears when Scene 1 scrolls out of view (IntersectionObserver threshold 0.5)
- **Mobile sticky CTA bar**: Appears after Scene 3 scrolls out of viewport (768px and below)

### Sakura Particles
- Fixed overlay with SVG petal shapes, CSS keyframe animations (fall + sway + spin)
- 10 petals on desktop, 5 on mobile
- Randomized: position, size, color, opacity, duration, direction, delay

---

## Design System

### Color Palette (CSS Custom Properties)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#1A1A1A` | Dark scene backgrounds |
| `--bg-cream` | `#FFF8F0` | CTA button text |
| `--bg-sakura-tint` | `#FEF0F0` | Scene 5 (testimonials) background |
| `--green-sage` | `#4A7C59` | Primary CTA buttons |
| `--green-sage-hover` | `#5A9469` | CTA hover state |
| `--pink-sakura` | `#E8A0BF` | Sakura accent |
| `--gold` | `#C9A86C` | Headings (h3), header wordmark, stars, italic accents |
| `--text-light` | `#F5F0EB` | Primary text on dark backgrounds |
| `--text-dark` | `#1A1A1A` | Text on light backgrounds (Scene 5) |
| `--text-muted` | `#A89F95` | Secondary/subtle text |

### Typography
| Element | Font | Weight | Size (desktop) |
|---------|------|--------|----------------|
| h1, h2, h3 | Cormorant Garamond | 300 | Varies |
| Page headline (h1) | Cormorant Garamond | 300 | 72px → 40px mobile |
| Section headline (h2) | Cormorant Garamond | 300 | 48px → 32px mobile |
| Craft/benefit heading (h3) | Cormorant Garamond | 400 | 28px → 22px mobile |
| Body text | Lato | 300 | 18px → 16px mobile |
| Micro/labels | Lato | 400 | 13–14px |

### CTA Buttons
- Pill shape (`border-radius: 50px`)
- Default: `18px 48px` padding, `16px` font
- Small variant: `10px 28px` padding, `13px` font
- Full-width on mobile (max 400px, then no max at 480px)

### Spacing Conventions
- Section padding: `100px 0` desktop → `60px 0` mobile
- Inner containers: `max-width: 1100–1200px`, `padding: 0 48px` → `0 24px` mobile
- Card gaps: `24–32px`
- Content element gaps: `64px` (desktop scene 2) → `40px` (mobile)

---

## Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| `768px` | Scene 2 stacks vertically, Scene 4 craft blocks stack, Scene 5 goes 2-col grid, benefits stack, mobile CTA bar shows, CTAs go full-width |
| `480px` | Headline shrinks to 36px, testimonials go 1-col, trust strip becomes 2x2 grid |

---

## External Links

All purchase CTAs link to: `https://www.amazon.com/Nippon-Matcha-Ceremonial-Certified-Stone-Ground/dp/B0FFSXTJWK`

All external links use `target="_blank" rel="noopener"`.

---

## Known TODOs

- Scene 4 image placeholders: The craft blocks use dashed-border divs with `<span>` text descriptions instead of actual images
- No favicon
- No analytics/tracking
- No deploy pipeline configured
- TODO: decide on hosting (Netlify, GitHub Pages, Vercel, etc.)

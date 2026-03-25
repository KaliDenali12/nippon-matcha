# Page Architecture — Tier 2 Reference

## HTML Structure

Single `index.html` with this DOM order:
1. `<a class="skip-link">` — skip navigation, visually hidden until focused
2. `<header class="floating-header">` — fixed, hidden by default, shows after Scene 1. `aria-hidden` toggled by JS with visibility
3. `<div class="sakura-container">` — fixed particle overlay, `aria-hidden="true"`
4. `<main>` — wraps all content sections
5. Scenes 1–4 (`<section class="scene scene-N" id="scene-N" aria-label="...">`)
6. `.transition-dark-to-light` gradient div (`aria-hidden="true"`)
7. Scene 5 (light background)
8. `.transition-light-to-dark` gradient div (`aria-hidden="true"`)
9. Scenes 6–7
10. `</main>`
11. `<div class="mobile-cta-bar">` — fixed bottom bar, mobile only. `aria-hidden` toggled by JS with visibility
12. `<script src="script.js" defer>`

All decorative elements (videos, overlays, transition divs, sakura container) have `aria-hidden="true"`. All sections have `aria-label` for AT navigation. All `.scene` elements have `scroll-margin-top: 64px` to offset anchor links below the floating header.

## Scene Breakdown

### Scene 1 — The Arrival (Hero)
- Video background: `sakura-hero.mp4` with `autoplay loop muted playsinline` (preloaded via `<link rel="preload">`)
- `.scene-overlay` gradient: transparent→dark bottom fade
- Content: tin image (`fetchpriority="high"`, floating animation), h1, subheadline, CTA, micro text
- CTA links to `#scene-2` (scroll anchor, not Amazon)
- Hero animation delays use 200ms stagger (200ms base) — fastest scene entrance
- Critical CSS for hero layout is inlined in `<head>` to prevent FOUC

### Scene 2 — The Origin
- No video, solid `--bg-primary` background
- Two-column layout: 40% tin column + text column
- Tin image has scroll-linked 360° Y-axis rotation (see `animations-interactions.md`)
- Final paragraph styled italic with `--gold` color (via `.scene-2__text-col .scene-2__final` specificity)

### Scene 3 — The Ritual
- Video: `ritual-pour.mp4` — `preload="none"`, plays **once** when visible (triggered by IntersectionObserver), does not loop
- Slower animation timing: 1000ms duration, 300ms stagger between elements
- Narrow content width: `max-width: 640px`

### Scene 4 — The Craft
- 4 alternating `.craft-block` rows (left/right via `--left`/`--right` modifier)
- **Image placeholders**: dashed-border divs with `<span>` text — NOT real images yet
- Images have `.parallax-image` class for scroll-based translateY
- Right blocks use `flex-direction: row-reverse`

### Scene 5 — The Testimony (Light Section)
- Only light-background scene: `--bg-sakura-tint` (#FEF0F0)
- Text colors switch to `--text-dark`
- 5 testimonial cards in 3-col grid → 2-col at 768px → 1-col at 480px
- Stars use HTML entities: `&#9733;` (★)

### Scene 6 — The Promise
- 3 benefit cards in flex row → stacked at 768px
- Cards have subtle border: `rgba(201, 168, 108, 0.2)` (gold-tinted)
- Animation type: `scale-up` (unique to this scene)

### Scene 7 — The Invitation (Final CTA)
- Video: `ready-bowl.mp4` — `loop muted playsinline preload="none"`, plays/pauses on visibility
- Tin has deeper slide-up (40px vs standard 30px) and longer duration (800ms)
- CTA gets `.pulse` class 1s after entering viewport (2-cycle animation)
- Trust strip: 4 spans in flex row → 2×2 grid at 480px
- This is the primary Amazon purchase CTA

## Video Gotchas

- Videos must have `muted` attribute — browsers block autoplay without it
- Below-fold videos (Scenes 3, 7) start with `preload="none"` — an IntersectionObserver with `rootMargin: '100% 0px'` switches to `preload="auto"` when user is ~1 viewport away
- Scene 1 hero video has `<link rel="preload" as="video">` in `<head>` for faster first paint
- Hero tin image also preloaded via `<link rel="preload" as="image">`
- Scene 3 video plays only once (observer unobserves after play)
- Scene 7 video toggles play/pause continuously as user scrolls in/out
- All videos need `object-fit: cover` and absolute positioning within `.scene`
- `.play().catch(function(){})` — silently catches autoplay errors (mobile Safari)

## Floating Header & Mobile CTA Bar

- **Header**: Hidden (`translateY(-100%)`) until Scene 1 leaves viewport. Uses IntersectionObserver with `threshold: [0, 0.5]`. JS toggles both `.visible` class and `aria-hidden` attribute simultaneously
- **Mobile CTA bar**: Hidden (`translateY(100%)`) until Scene 3 exits viewport AND `rect.bottom < 0`. Only visible at ≤768px (CSS `display: none` on desktop). Also listens to scroll event for back-up detection. JS toggles both `.visible` class and `aria-hidden` attribute simultaneously

**Important**: When showing/hiding these elements, always toggle `aria-hidden` alongside the `.visible` class — otherwise interactive links inside them become invisible to screen readers while visible, or vice versa.

## Rendering Performance

- **`content-visibility: auto`** on Scenes 2–7: browser skips rendering off-screen scenes. `contain-intrinsic-size: auto 100vh` preserves scroll height
- **Critical CSS** for hero section layout inlined in `<head>` (prevents FOUC before `styles.css` loads)
- **`will-change`** on animated elements during animation, cleared on `.visible`. Permanent on fixed chrome (header, mobile CTA bar)
- **`contain: layout style`** on header and mobile CTA bar

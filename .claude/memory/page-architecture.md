# Page Architecture — Tier 2 Reference

## HTML Structure

Single `index.html` with this DOM order:
1. `<header class="floating-header">` — fixed, hidden by default, shows after Scene 1
2. `<div class="sakura-container">` — fixed particle overlay, `aria-hidden="true"`
3. Scenes 1–4 (`<section class="scene scene-N" id="scene-N">`)
4. `.transition-dark-to-light` gradient div
5. Scene 5 (light background)
6. `.transition-light-to-dark` gradient div
7. Scenes 6–7
8. `<div class="mobile-cta-bar">` — fixed bottom bar, mobile only
9. `<script src="script.js">`

## Scene Breakdown

### Scene 1 — The Arrival (Hero)
- Video background: `sakura-hero.mp4` with `autoplay loop muted playsinline`
- `.scene-overlay` gradient: transparent→dark bottom fade
- Content: tin image (floating animation), h1, subheadline, CTA, micro text
- CTA links to `#scene-2` (scroll anchor, not Amazon)
- Hero animation delays use 300ms stagger (500ms base) — different from default 200ms

### Scene 2 — The Origin
- No video, solid `--bg-primary` background
- Two-column layout: 40% tin column + text column
- Tin image has scroll-linked 360° Y-axis rotation (see `animations-interactions.md`)
- Final paragraph styled italic with `--gold` color via `!important`

### Scene 3 — The Ritual
- Video: `ritual-pour.mp4` — plays **once** when visible, does not loop
- Slower animation timing: 1200ms duration, 600ms stagger between elements
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
- Video: `ready-bowl.mp4` — `loop muted playsinline`, plays/pauses on visibility
- Tin has deeper slide-up (60px vs standard 30px) and longer duration (1000ms)
- CTA gets `.pulse` class 1s after entering viewport (2-cycle animation)
- Trust strip: 4 spans in flex row → 2×2 grid at 480px
- This is the primary Amazon purchase CTA

## Video Gotchas

- Videos must have `muted` attribute — browsers block autoplay without it
- Scene 3 video plays only once (observer unobserves after play)
- Scene 7 video toggles play/pause continuously as user scrolls in/out
- All videos need `object-fit: cover` and absolute positioning within `.scene`
- `.play().catch(function(){})` — silently catches autoplay errors (mobile Safari)

## Floating Header & Mobile CTA Bar

- **Header**: Hidden (`translateY(-100%)`) until Scene 1 leaves viewport. Uses IntersectionObserver with `threshold: [0, 0.5]`
- **Mobile CTA bar**: Hidden (`translateY(100%)`) until Scene 3 exits viewport AND `rect.bottom < 0`. Only visible at ≤768px (CSS `display: none` on desktop). Also listens to scroll event for back-up detection

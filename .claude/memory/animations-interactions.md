# Animations & Interactions — Tier 2 Reference

## script.js Architecture

All JS lives in a single IIFE (`script.js:5-224`). No globals, no modules, no external libraries. Six independent systems:

1. Entrance animation observer
2. Scene 2 tin rotation
3. Scene 3 ritual video control
4. Scene 7 video + CTA pulse
5. Floating header + mobile CTA bar
6. Sakura particle generator

## Scroll-Triggered Entrance Animations

**CSS setup** (`styles.css:64-101`):
- `[data-animate]` elements start `opacity: 0` with a transform
- `.visible` class restores `opacity: 1` and identity transform
- Duration: 800ms default, 1200ms for Scene 3
- Stagger: `[data-delay="0-5"]` → 200ms increments (0ms, 200ms, 400ms, 600ms, 800ms, 1000ms)
- Scene 1 overrides: 500ms base, 300ms stagger (delays: 500, 800, 1100, 1400ms)
- Scene 3 overrides: 600ms stagger (delays: 600, 1200, 1800ms)

**JS setup** (`script.js:10-24`):
- `IntersectionObserver` with `threshold: 0.15`
- Adds `.visible` class **once** — then `unobserve()` (no re-triggering)
- Selects all `[data-animate]` elements

**Adding new animated elements:**
1. Add `data-animate="slide-up|slide-right|scale-up|fade-only"` to HTML element
2. Add `data-delay="0-5"` for stagger position
3. No JS changes needed — observer auto-selects `[data-animate]`

## Scene 2: Scroll-Linked Tin Rotation

`script.js:28-70` — The tin image rotates 360° on Y-axis as user scrolls through Scene 2.

- **Progress**: `0–1` based on how far Scene 2 has scrolled past viewport top
- **Lerp**: `currentRotation += (targetRotation - currentRotation) * 0.08` — smooth interpolation
- **3D effect**: `scaleX = max(abs(cos(radians)), 0.3)` — simulates perspective narrowing
- **Transform**: `rotateY(Ndeg) scaleX(N)` applied via `requestAnimationFrame` loop
- **Scroll listener**: passive, updates `targetRotation` only
- **Visibility gating**: rAF loop starts/stops via `rotationObserver` (IntersectionObserver with `rootMargin: '100px 0px'`). Loop only runs when Scene 2 is visible (±100px margin).

## Video Playback Control

Three separate IntersectionObservers for three different video behaviors:

| Video | Class | Behavior | Observer |
|-------|-------|----------|----------|
| Scene 1 hero | `.bg-video` (in Scene 1) | HTML `autoplay loop` — no JS needed | None |
| Scene 3 ritual | `.ritual-video` | Play once on visible → unobserve | `ritualObserver` |
| Scene 7 ready | `.ready-video` | Play on visible, pause on not visible | `readyObserver` |

- All use `.play().catch(function(){})` to swallow autoplay errors
- Threshold: `0.15` for Scenes 3 and 7

## Floating Header

`script.js:129-150`

- Observer on `.scene-1` with `threshold: [0, 0.5]`
- Scene 1 visible (ratio > 0.5) → header hidden (`remove('visible')`, `aria-hidden="true"`)
- Scene 1 not visible → header shown (`add('visible')`, `aria-hidden="false"`)
- Both `.visible` class and `aria-hidden` attribute must be toggled together
- CSS: `transform: translateY(-100%)` ↔ `translateY(0)`, 400ms transition

## Mobile Sticky CTA Bar

`script.js:152-183`

- Observer on `.scene-3` + scroll listener (backup)
- Shows when `scene3.getBoundingClientRect().bottom < 0` (scrolled past Scene 3)
- Hides when scrolling back up above Scene 3
- Both `.visible` class and `aria-hidden` attribute must be toggled together
- CSS: `display: none` on desktop, `display: flex` at ≤768px
- Transform: `translateY(100%)` ↔ `translateY(0)`, 400ms transition

## Sakura Particles

`script.js:181-223`

- Creates SVG petal elements dynamically and appends to `.sakura-container`
- Count: 10 on desktop, 5 on mobile (< 768px check)
- Each petal gets randomized CSS custom properties for 3 concurrent animations:
  - `sakuraFall`: vertical drop from -20px to beyond viewport
  - `sakuraSway`: horizontal drift (30px)
  - `sakuraSpin`: full rotation, random direction
- Colors: `['#F7D1D5', '#EDAFCA', '#E8A0BF', '#D4A0A0']`
- Fall duration: 15–28s. Negative delay distributes petals across cycle

## Scene 4 Parallax

`script.js:164-177`

- `.parallax-image` elements translate vertically on scroll
- Factor: `0.4` — offset = `(rect.top - viewH/2) * 0.4`
- Only active when element is in viewport (`rect.top < viewH && rect.bottom > 0`)
- Passive scroll listener

## Common Patterns

- **All IntersectionObservers** use `threshold: 0.15` except: header (`[0, 0.5]`), rotation (`threshold: 0, rootMargin: '100px 0px'`)
- **All scroll listeners** use `{ passive: true }` — never call `preventDefault()`
- **Video play** always wrapped in `.catch()` — mobile browsers may reject autoplay
- **rAF cleanup**: Scene 2 rotation loop gated by IntersectionObserver — starts/stops on visibility. Observers themselves persist for page lifetime (fine for single-page site)

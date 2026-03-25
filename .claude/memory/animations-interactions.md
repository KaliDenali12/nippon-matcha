# Animations & Interactions — Tier 2 Reference

## script.js Architecture

All JS lives in a single IIFE (`script.js:5-288`). No globals, no modules, no external libraries. Key systems:

1. **rAF scroll throttle** — single scroll listener batches all scroll callbacks
2. Entrance animation observer
3. Scene 2 tin rotation (via scroll callback)
4. Below-fold video prefetch observer
5. Scene 3 ritual video control
6. Scene 7 video + CTA pulse
7. Floating header + mobile CTA bar (mobile CTA via scroll callback)
8. Scene 4 parallax (via scroll callback)
9. Sakura particle generator

## Scroll-Triggered Entrance Animations

**CSS setup**:
- `[data-animate]` elements start `opacity: 0` with a transform + `will-change: opacity, transform`
- `.visible` class restores `opacity: 1`, identity transform, and `will-change: auto` (frees GPU layer)
- Duration: **600ms** default, **1000ms** for Scene 3
- Stagger: `[data-delay="0-5"]` → **150ms** increments (0, 150, 300, 450, 600, 750ms)
- Scene 1 overrides: **200ms** base, **200ms** stagger (delays: 200, 400, 600, 800ms)
- Scene 3 overrides: **300ms** stagger (delays: 300, 600, 900ms)

**JS setup** (`script.js:29-43`):
- `IntersectionObserver` with `threshold: 0.15`
- Adds `.visible` class **once** — then `unobserve()` (no re-triggering)
- Selects all `[data-animate]` elements

**Adding new animated elements:**
1. Add `data-animate="slide-up|slide-right|scale-up|fade-only"` to HTML element
2. Add `data-delay="0-5"` for stagger position
3. No JS changes needed — observer auto-selects `[data-animate]`

## rAF Scroll Throttle

`script.js:10-25` — All scroll-dependent logic runs through a single throttled loop:

- One `scroll` event listener (`passive: true`) sets a `scrollTicking` flag
- On next `requestAnimationFrame`, all registered callbacks execute, flag resets
- **To add scroll behavior**: `scrollCallbacks.push(function() { ... })` — never add raw scroll listeners
- Currently 3 callbacks: tin rotation target, mobile CTA visibility, parallax transforms

## Scene 2: Scroll-Linked Tin Rotation

`script.js:47-89` — The tin image rotates 360° on Y-axis as user scrolls through Scene 2.

- **Progress**: `0–1` based on how far Scene 2 has scrolled past viewport top
- **Lerp**: `currentRotation += (targetRotation - currentRotation) * 0.08` — smooth interpolation
- **3D effect**: `scaleX = max(abs(cos(radians)), 0.3)` — simulates perspective narrowing
- **Transform**: `rotateY(Ndeg) scaleX(N)` applied via `requestAnimationFrame` loop
- **Scroll callback**: registered via `scrollCallbacks.push()`, updates `targetRotation` only
- **Visibility gating**: rAF loop starts/stops via `rotationObserver` (IntersectionObserver with `rootMargin: '100px 0px'`). Loop only runs when Scene 2 is visible (±100px margin).

## Below-Fold Video Prefetching

`script.js:94-108` — Proactively loads video data before user scrolls to it:

- Selects all `video[preload="none"]` elements
- IntersectionObserver with `rootMargin: '100% 0px'` (1 viewport ahead)
- When intersecting: sets `preload = 'auto'` → browser starts buffering
- Unobserves after triggering — one-shot per video

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

`script.js:167-188`

- Observer on `.scene-1` with `threshold: [0, 0.5]`
- Scene 1 visible (ratio > 0.5) → header hidden (`remove('visible')`, `aria-hidden="true"`)
- Scene 1 not visible → header shown (`add('visible')`, `aria-hidden="false"`)
- Both `.visible` class and `aria-hidden` attribute must be toggled together
- CSS: `transform: translateY(-100%)` ↔ `translateY(0)`, **250ms** transition, `will-change: transform`, `contain: layout style`

## Mobile Sticky CTA Bar

`script.js:190-223`

- Observer on `.scene-3` + scroll callback (backup, via `scrollCallbacks.push()`)
- Shows when `scene3.getBoundingClientRect().bottom < 0` (scrolled past Scene 3)
- Hides when scrolling back up above Scene 3
- Both `.visible` class and `aria-hidden` attribute must be toggled together
- CSS: `display: none` on desktop, `display: flex` at ≤768px
- Transform: `translateY(100%)` ↔ `translateY(0)`, **250ms** transition, `will-change: transform`, `contain: layout style`

## Sakura Particles

`script.js:243-288`

- Creates SVG petal elements dynamically and appends to `.sakura-container`
- Count: 10 on desktop, 5 on mobile (< 768px check)
- Each petal gets randomized CSS custom properties for 3 concurrent animations:
  - `sakuraFall`: vertical drop from -20px to beyond viewport
  - `sakuraSway`: horizontal drift (30px)
  - `sakuraSpin`: full rotation, random direction
- Colors: `['#F7D1D5', '#EDAFCA', '#E8A0BF', '#D4A0A0']`
- Fall duration: 15–28s. Negative delay distributes petals across cycle

## Scene 4 Parallax

`script.js:225-241`

- `.parallax-image` elements translate vertically on scroll
- Factor: `0.4` — offset = `(rect.top - viewH/2) * 0.4`
- Only active when element is in viewport (`rect.top < viewH && rect.bottom > 0`)
- Registered via `scrollCallbacks.push()` (rAF-throttled)

## Common Patterns

- **All IntersectionObservers** use `threshold: 0.15` except: header (`[0, 0.5]`), rotation (`threshold: 0, rootMargin: '100px 0px'`), video prefetch (`rootMargin: '100% 0px'`)
- **All scroll-dependent code** uses `scrollCallbacks.push()` — never add raw scroll listeners
- **Video play** always wrapped in `.catch()` — mobile browsers may reject autoplay
- **rAF cleanup**: Scene 2 rotation loop gated by IntersectionObserver — starts/stops on visibility. Observers themselves persist for page lifetime (fine for single-page site)
- **`will-change` lifecycle**: Set on `[data-animate]` during animation, cleared to `auto` on `.visible`. Set permanently on fixed elements (header, mobile CTA bar)

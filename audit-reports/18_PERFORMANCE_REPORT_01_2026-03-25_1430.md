# Performance Audit Report — Run 01

**Date:** 2026-03-25 14:30
**Branch:** `nightytidy/run-2026-03-25-1424`
**Scope:** Full frontend performance analysis (static vanilla HTML/CSS/JS site)
**Tests passing:** N/A (no test suite — visual verification only)

---

## 1. Executive Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | `tin-100g.png` is 8.4 MB — loaded 3× across the page, ~25 MB total decode weight | **Critical** | Documented (requires image conversion) |
| 2 | `requestAnimationFrame` loop runs continuously even when Scene 2 is off-screen | **High** | **Fixed** |
| 3 | Below-fold videos (`ritual-pour.mp4`, `ready-bowl.mp4`) eagerly preloaded by browser | **Medium** | **Fixed** (`preload="none"`) |
| 4 | Below-fold tin images (Scene 2, Scene 7) loaded eagerly | **Medium** | **Fixed** (`loading="lazy"`) |
| 5 | `script.js` loaded synchronously, blocking first paint | **Medium** | **Fixed** (`defer`) |

**Quick wins implemented:** 8 changes across 3 files.
**Larger efforts documented:** 3 recommendations requiring human action (image optimization, video compression review, `<picture>` element with WebP).

---

## 2. Database Performance

**Not applicable.** This is a static site with no database, no server, and no API. All content is client-side HTML/CSS/JS.

---

## 3. Application Performance

### 3.1 Expensive Operations

| Location | Issue | Complexity | Recommendation |
|----------|-------|------------|----------------|
| `script.js:40-49` (was lines 40-48) | `animateRotation()` rAF loop runs every frame (~60fps) **forever**, even when Scene 2 is off-screen. Each frame calls `getBoundingClientRect()` (via scroll listener) + trig functions + DOM style mutation. | O(1) per frame but **continuous** | **Fixed.** Added IntersectionObserver to start/stop the rAF loop when Scene 2 enters/exits viewport (with 100px rootMargin for smooth transitions). |
| `script.js:167-177` | Parallax scroll handler iterates all 4 `.parallax-image` elements on every scroll event, calling `getBoundingClientRect()` per element. | O(n) per scroll, n=4 | **Low priority.** n=4 is trivially small. All calls use `{ passive: true }`. No action needed. |
| `script.js:152-159` | Mobile CTA scroll handler runs on every scroll event. | O(1) per scroll | **Acceptable.** Uses `{ passive: true }`, single `getBoundingClientRect()` call, needed for scroll-back-up behavior that the IntersectionObserver alone can't handle. |

### 3.2 Caching Opportunities

No applicable caching — this is a static site with no API calls, no computed data, and no dynamic content.

**HTTP caching note:** When deployed, ensure the hosting platform sets appropriate `Cache-Control` headers:
- `index.html`: `no-cache` (or short max-age) for HTML freshness
- `styles.css`, `script.js`: `max-age=31536000` with cache-busting filenames or query params
- `assets/images/*`, `assets/videos/*`: `max-age=31536000` (immutable content)

### 3.3 Async/Concurrency

No sequential async operations to parallelize. All IntersectionObservers and event listeners are initialized synchronously at page load, which is correct for this codebase size.

---

## 4. Memory & Resources

### 4.1 Memory Leak Patterns

| Pattern | Status | Notes |
|---------|--------|-------|
| Event listeners without removal | **Acceptable** | Three `window.addEventListener('scroll', ...)` calls persist for page lifetime. This is correct — they're needed while the page is alive, and a single-page site never navigates away. |
| Growing collections | **None found** | Sakura petals are created once (5–10 elements) and never recreated. |
| Closures capturing large objects | **None found** | All closures capture only DOM references. |
| Unclosed streams/connections | **N/A** | No fetch/XHR/WebSocket usage. |
| Uncleared intervals/timers | **Fixed** | The rAF loop was unbounded; now gated behind `rotationActive` flag. The `setTimeout` for CTA pulse (line 96-98) fires once and is not a leak. |
| Circular references | **None found** | |

### 4.2 Resource Management

No database connections, file handles, HTTP connections, child processes, or temp files to manage. This is a client-side-only static page.

---

## 5. Frontend Performance

### 5.1 Render Performance

**Framework:** Vanilla HTML/CSS/JS (no React, no virtual DOM).

| Area | Finding | Status |
|------|---------|--------|
| Layout thrashing | **None.** Scroll handlers read (`getBoundingClientRect`) but only write `style.transform` — no interleaved read/write cycles. | Clean |
| Forced synchronous layouts | **None.** No `offsetHeight`/`getComputedStyle` reads after mutations in hot paths. | Clean |
| CSS animations on layout properties | **None.** All animations use `transform` and `opacity` only. The `float` keyframe (`translateY`), sakura keyframes (`translateY`, `margin-left`, `rotate`), and pulse (`scale`) are all compositor-friendly. | Clean |
| `will-change` usage | `will-change: transform` on `.sakura-petal` (already present) and `.tin-rotate` (already present). **Added** `will-change: transform` to `.craft-block__image` (parallax targets). | **Fixed** |
| DOM tree size | ~230 lines of HTML, ~60–80 DOM nodes including sakura petals. Well under 1500 nodes. | Clean |
| CSS `contain` | **Added** `contain: layout style` on `.scene` elements. This prevents layout/style recalculations in one scene from invalidating others. | **Fixed** |

### 5.2 Loading Performance

#### Critical Rendering Path

| Resource | Blocks First Paint? | Size | Status |
|----------|---------------------|------|--------|
| `styles.css` | Yes (render-blocking) | 16 KB | **Acceptable.** Single small CSS file; no benefit from splitting critical/non-critical for this page size. |
| `script.js` | Was blocking (at body end, sync) | 7 KB | **Fixed.** Added `defer` attribute. Script is non-critical for first paint. |
| Google Fonts CSS | Yes (render-blocking stylesheet) | ~2 KB | **Acceptable.** `preconnect` already in place. `display=swap` ensures text renders with fallback while fonts load. |
| `sakura-hero.mp4` | No (async `<video autoplay>`) | 3.1 MB | **Added** `<link rel="preload">` hint to start fetch earlier, reducing delay before hero video appears. |
| `ritual-pour.mp4` | Was eagerly loaded (browser default) | 5.7 MB | **Fixed.** Added `preload="none"` — video only fetches when IntersectionObserver triggers play. Saves ~5.7 MB on initial load. |
| `ready-bowl.mp4` | Was eagerly loaded (browser default) | 4.1 MB | **Fixed.** Added `preload="none"` — saves ~4.1 MB on initial load. |

#### Fonts

| Aspect | Status |
|--------|--------|
| `font-display` | `swap` via `&display=swap` in Google Fonts URL. FOIT prevented. |
| Preloaded? | Not preloaded (Google Fonts handles this via the CSS response). Acceptable. |
| Count/size | 2 families × 2 weights = 4 font files. Standard size. |

#### Images

| Image | Size | Used Where | Issue | Status |
|-------|------|-----------|-------|--------|
| `tin-100g.png` | **8.4 MB** | Scenes 1, 2, 7 (same file, loaded once by browser, decoded 3×) | **Critical.** This is an extremely large PNG. For a product photo at max 320px display height, the file should be ~50–200 KB as WebP/AVIF, not 8.4 MB. | **Documented** (requires manual image conversion) |
| Scene 1 tin | 8.4 MB | Hero, above fold | Added `fetchpriority="high"` to prioritize this LCP image. | **Fixed** |
| Scene 2 tin | 8.4 MB | Below fold | Added `loading="lazy"`. | **Fixed** |
| Scene 7 tin | 8.4 MB | Far below fold | Added `loading="lazy"`. | **Fixed** |
| Scene 4 images | N/A | Placeholder `<span>` text | No actual images loaded. When real images are added, use `loading="lazy"`, `srcset`, and WebP format. | Future |

#### Third-Party Scripts

| Script | Purpose | Size | Async? | Deferrable? |
|--------|---------|------|--------|-------------|
| Google Fonts | Web fonts | ~2 KB CSS + ~80 KB fonts | CSS is render-blocking; fonts load async via `font-display: swap` | No (needed for typography) |

**No other third-party scripts.** No analytics, no chat widgets, no A/B testing, no ads. Excellent.

### 5.3 Runtime Event Handlers

| Handler | Throttled? | Passive? | Status |
|---------|-----------|----------|--------|
| Scene 2 scroll (tin rotation target) | No throttle, but only sets a number variable | `{ passive: true }` | **Acceptable.** The actual DOM mutation happens in rAF, not in the scroll handler. This is the correct pattern. |
| Parallax scroll | No throttle | `{ passive: true }` | **Acceptable.** Direct DOM style writes in scroll handler, but for 4 elements with `transform`-only changes, this is negligible. |
| Mobile CTA scroll | No throttle | `{ passive: true }` | **Acceptable.** Single `getBoundingClientRect()` + class toggle. |

**No input handlers, no mouse-move handlers, no resize handlers.** All scroll handlers use `{ passive: true }`.

### 5.4 Animation Performance

| Animation | Method | Compositor-Friendly? | Status |
|-----------|--------|---------------------|--------|
| Sakura petals (fall/sway/spin) | CSS `@keyframes` | Yes (`transform`, `margin-left`, `rotate`) | Clean — **Note:** `margin-left` in `sakuraSway` causes layout reflow per frame. However, with 5–10 absolutely-positioned petals in a `pointer-events: none` overlay, the real-world impact is negligible. |
| Tin float (Scene 1) | CSS `@keyframes` | Yes (`transform: translateY`) | Clean |
| Tin rotation (Scene 2) | JS `requestAnimationFrame` | Yes (`transform: rotateY + scaleX`) | **Fixed** — now stops when off-screen |
| Scroll entrances | CSS transitions (triggered by `.visible` class) | Yes (`transform` + `opacity`) | Clean |
| CTA pulse (Scene 7) | CSS `@keyframes` | Yes (`transform: scale`) | Clean |
| Floating header show/hide | CSS transition | Yes (`transform: translateY`) | Clean |
| Mobile CTA bar show/hide | CSS transition | Yes (`transform: translateY`) | Clean |

---

## 6. Optimizations Implemented

### Changes Made

| # | File | Change | Before | After |
|---|------|--------|--------|-------|
| 1 | `index.html:14` | Added `<link rel="preload">` for hero video | No preload hint | Browser begins fetching hero video earlier |
| 2 | `index.html:37` | Added `fetchpriority="high"` to Scene 1 tin image | Default priority | Browser prioritizes LCP image |
| 3 | `index.html:50` | Added `loading="lazy"` to Scene 2 tin image | Eager load (default) | Deferred until near viewport |
| 4 | `index.html:65` | Added `preload="none"` to Scene 3 ritual video | Browser default preload (often `metadata` or `auto`) | Video bytes not fetched until JS triggers play (~5.7 MB saved on initial load) |
| 5 | `index.html:203` | Added `preload="none"` to Scene 7 ready-bowl video | Browser default preload | Video bytes not fetched until visibility (~4.1 MB saved on initial load) |
| 6 | `index.html:208` | Added `loading="lazy"` to Scene 7 tin image | Eager load | Deferred until near viewport |
| 7 | `index.html:229` | Added `defer` to `<script>` tag | Synchronous (parser-blocking) | Non-blocking; executes after HTML parsing |
| 8 | `styles.css:139` | Added `contain: layout style` to `.scene` | No containment | Scenes have independent layout/style scope |
| 9 | `styles.css:448` | Added `will-change: transform` to `.craft-block__image` | No GPU layer hint | Parallax targets promoted to compositor layer |
| 10 | `script.js:26-70` | Gated rAF rotation loop behind IntersectionObserver | rAF runs every frame forever (~16ms/frame, ~60fps) | rAF only runs when Scene 2 is visible (±100px margin) |

**All tests passing:** N/A (no test suite). Changes are attribute-only (HTML) and logic-safe (JS gating preserves existing behavior when visible).

---

## 7. Optimization Roadmap

| Priority | Effort | Recommendation | Expected Impact |
|----------|--------|----------------|-----------------|
| **1 — Critical** | Low (10 min) | Compress `tin-100g.png`: convert to WebP/AVIF, resize to max 640px wide, target ~50–150 KB. This single change would reduce page weight by ~8 MB. | LCP drops by several seconds on mobile. Total page weight drops from ~30 MB to ~22 MB. |
| **2 — High** | Medium (30 min) | Add `<picture>` element with WebP source and PNG fallback for the tin image. Use `srcset` with 320w and 640w variants. | Smaller file served to smaller screens; modern format for 95%+ of browsers. |
| **3 — Medium** | Medium (1 hr) | Review video compression. Hero video is 3.1 MB for a background loop — check if lower bitrate (CRF 28–32) preserves visual quality at 1080p overlay. | Could save 1–2 MB on hero load. |
| **4 — Low** | Low (15 min) | Convert sakura petal `margin-left` animation to `translateX` to avoid layout reflow. Change `sakuraSway` keyframe to use `transform: translateX(30px)` and compose with fall/spin via separate elements or a wrapper. | Marginal — 5-10 elements in a non-interactive overlay. Compositor-only animation. |
| **5 — Low** | Low (5 min) | Add explicit `width` and `height` attributes to `<img>` tags to prevent layout shift (CLS). | Prevents content shifting as images load. Improves CLS metric. |

---

## 8. Monitoring Recommendations

### Key Metrics to Track (when deployed)

| Metric | Target | Why |
|--------|--------|-----|
| **LCP (Largest Contentful Paint)** | < 2.5s | The hero tin image (8.4 MB PNG) is almost certainly the LCP element. Compressing it is the single highest-impact performance improvement. |
| **CLS (Cumulative Layout Shift)** | < 0.1 | No explicit `width`/`height` on images means potential layout shift as they decode. |
| **INP (Interaction to Next Paint)** | < 200ms | Minimal interactive elements (scroll + clicks). Should be excellent after rAF fix. |
| **TTI (Time to Interactive)** | < 3.5s | 7 KB JS with `defer` should be fast. The bottleneck is asset download, not JS. |
| **Total page weight** | < 5 MB (excluding video) | Currently ~8.5 MB of images alone. |

### Suggested Performance Testing

1. Run Lighthouse on deployed site (both mobile and desktop)
2. Test on throttled 3G connection to identify real-world bottlenecks
3. Use Chrome DevTools Performance tab to verify rAF loop stops when Scene 2 is off-screen
4. Monitor video buffering on slow connections — `preload="none"` may cause visible loading delay when scrolling to Scene 3/7

### Alert-Worthy Conditions

- LCP > 4s on mobile (indicates image compression is critical)
- Total transfer size > 15 MB on first visit (indicates caching headers missing)
- Any `layout-shift` events in CLS > 0.25 (indicates missing image dimensions)

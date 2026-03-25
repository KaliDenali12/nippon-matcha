# Perceived Performance Optimization Report

**Run:** 01 | **Date:** 2026-03-25 | **Time:** 15:30
**Branch:** `nightytidy/run-2026-03-25-1424`

---

## 1. Executive Summary

**Snappiness Rating:** Comfortable → Near-Instant-Feeling

The site is a static landing page with no API calls, auth, or CRUD — so the main perceived performance issues are around **first paint**, **animation timing**, **scroll jank**, and **interaction feedback**. The biggest wins came from:

- Cutting hero entrance delay from 500–1400ms to 200–800ms (hero feels 600ms faster)
- Consolidating 3 independent scroll listeners into 1 rAF-throttled loop (eliminates scroll jank)
- Adding CTA `:active` press states (buttons feel instant on tap)
- `content-visibility: auto` on off-screen scenes (browser skips rendering 6 of 7 sections at load)
- Prefetching below-fold videos 1 viewport before they're needed

No business logic was changed. All changes are CSS/JS timing and rendering optimizations.

---

## 2. Critical Path Analysis

### User Journeys

This is a single-page static landing site. Three user journeys:

| Journey | Frequency | Description |
|---------|-----------|-------------|
| First Load → Hero | Every visit | HTML → CSS → Fonts → Video → Image → JS → Animations |
| Scroll through 7 scenes | Every visit | Sequential scroll, each scene has entrance animations |
| Click CTA → Amazon | Conversion goal | External link, instant navigation |

### Loading Waterfall (Before)

```
0ms   HTML parse begins
│
├─ Google Fonts CSS (render-blocking, ~100ms)
│   └─ Font files download (~200-400ms, FOIT risk — display:swap already present)
├─ <link rel="preload"> hero video (non-blocking, ~3.1MB)
├─ styles.css (render-blocking, ~30KB)
│
├─ First Paint (est. ~300-500ms)
│   ├─ Hero video frame appears
│   ├─ tin-100g.png (8.4MB!) starts loading — fetchpriority="high"
│   └─ All [data-animate] elements invisible (opacity: 0)
│
├─ script.js (deferred, ~7KB, runs after DOM)
│   ├─ IntersectionObservers set up
│   ├─ Sakura particles injected (10 DOM nodes)
│   └─ Hero elements get .visible class
│       ├─ delay="0": 500ms wait, then 800ms transition
│       ├─ delay="1": 800ms wait, then 800ms transition
│       ├─ delay="2": 1100ms wait, then 800ms transition
│       └─ delay="3": 1400ms wait, then 800ms transition
│
└─ Fully interactive (~600ms after first paint)
```

**Worst wait:** Hero headline invisible for 500ms after JS runs, then takes 800ms to animate in = **~1300ms** from first paint to readable headline. Micro-copy doesn't appear until **~2200ms** after first paint.

### Loading Waterfall (After)

```
First Paint: Same (~300-500ms) — can't change without build tools
Hero headline visible: 200ms delay + 600ms transition = ~800ms after paint (was ~1300ms)
Hero micro-copy visible: 800ms delay + 600ms transition = ~1400ms (was ~2200ms)
```

**Perceived improvement: Hero feels ~600ms faster.**

---

## 3. Prefetching

### Changes Made

| What | How | Estimated Impact |
|------|-----|-----------------|
| Hero image preload | Added `<link rel="preload" as="image" href="assets/images/tin-100g.png">` | Tin image starts downloading earlier — overlaps with CSS/font loading |
| Below-fold video prefetch | IntersectionObserver with `rootMargin: '100% 0px'` switches `preload="none"` → `preload="auto"` when user is ~1 viewport away | Videos (ritual-pour.mp4, ready-bowl.mp4) start buffering before user scrolls to them — eliminates blank video frames |
| Critical CSS inline | Hero layout styles inlined in `<head>` | Hero section paints with correct layout even before `styles.css` finishes loading |

### Not Changed
- Google Fonts already uses `display=swap` (no FOIT) and `preconnect` — optimal
- Hero video already has `<link rel="preload">` — optimal
- `script.js` already uses `defer` — optimal

---

## 4. Optimistic UI

**Not applicable.** This is a static landing page with no mutations, no forms, no API calls. All CTAs are external Amazon links.

---

## 5. Waterfall Elimination

### Scroll Handler Consolidation

**Before:** 3 independent `window.addEventListener('scroll', ...)` handlers:
1. Scene 2 tin rotation target update
2. Mobile CTA bar visibility toggle
3. Scene 4 parallax image transforms

Each fired a separate callback on every scroll event — potentially 3 separate layout reads per frame.

**After:** Single `scroll` event listener → rAF-gated callback loop → all 3 handlers run once per frame in a single rAF tick.

**Impact:** Eliminates redundant layout thrashing. On a 60fps scroll, we go from potentially 3× layout reads per event (events fire faster than frames) to exactly 1× per frame.

---

## 6. Rendering

### Changes Made

| What | Before | After | Impact |
|------|--------|-------|--------|
| `content-visibility: auto` on Scenes 2–7 | All 7 scenes rendered at load | Only Scene 1 (hero) rendered; others skip rendering until near viewport | Significant first-paint speedup — browser skips layout/paint for 6 full-viewport sections |
| `contain-intrinsic-size: auto 100vh` | N/A | Scenes maintain correct scroll height even when rendering is skipped | No CLS or scroll bar jumps |
| `will-change` on `[data-animate]` | Not set | Set during animation, cleared to `auto` on `.visible` | GPU layer promotion during animation; freed after |
| `will-change` + `contain` on floating header | Not set | `will-change: transform; contain: layout style;` | Header slide-in/out composited on GPU |
| `will-change` + `contain` on mobile CTA bar | Not set | Same | Mobile bar transition composited on GPU |

### Hover Micro-Interactions Added
- Testimonial cards: subtle `translateY(-2px)` + shadow lift on hover (150ms ease-out)
- Benefit cards: subtle `translateY(-2px)` + border color brighten on hover (150ms ease-out)

These make the page feel more responsive and alive without changing layout or content.

---

## 7. Caching

**Not applicable for code changes.** This is a static site served via `npx serve .` or equivalent — no HTTP cache headers are configurable from HTML/CSS/JS alone.

**Recommendation:** When deployed (Netlify, GitHub Pages, etc.), configure:
- `Cache-Control: public, max-age=31536000, immutable` for hashed assets
- `Cache-Control: public, max-age=3600` for `index.html`
- Videos should get long cache TTL (they don't change)

---

## 8. Startup

### Boot Sequence Analysis

| Step | Blocking? | Size | Notes |
|------|-----------|------|-------|
| HTML parse | Yes | ~7KB | Fast, minimal |
| Google Fonts CSS | Yes (render-blocking) | ~2KB CSS → ~100KB fonts | `preconnect` + `display=swap` already optimal |
| `styles.css` | Yes (render-blocking) | ~30KB | Could benefit from critical CSS extraction (done: hero styles inlined) |
| Hero video | No (preloaded, autoplay) | 3.1MB | Streams progressively |
| `tin-100g.png` | No (in-body, fetchpriority high) | **8.4MB** | **#1 bottleneck** — needs WebP/AVIF conversion |
| `script.js` | No (defer) | ~8KB | Runs after DOM parse, fast |

### Changes Made
- **Critical CSS inlined** for hero section layout — hero paints correctly even before `styles.css` loads
- **`content-visibility: auto`** skips rendering below-fold sections at startup

### Not Changed (Would Require Build Tools)
- `styles.css` could be split into critical (above-fold) + non-critical (loaded async) — but this is a no-build-tool project
- `tin-100g.png` at 8.4MB is the single biggest startup bottleneck — needs image optimization (already documented in CLAUDE.md TODOs)

---

## 9. Micro-Interactions

### CTA Button Feedback

| Property | Before | After |
|----------|--------|-------|
| Hover transition | 300ms ease | 150ms ease-out (feels snappier) |
| `:active` state | None | `scale(0.97)` + darker green + 50ms transition |
| `-webkit-tap-highlight-color` | Browser default (blue flash) | `transparent` (clean tap) |

### Animation Timing Tightening

| Element | Before | After | Perceived Gain |
|---------|--------|-------|----------------|
| Hero stagger base | 500ms | 200ms | Content appears 300ms sooner |
| Hero stagger increment | 300ms | 200ms | Full cascade 600ms faster |
| Default entrance duration | 800ms | 600ms | Each element animates 200ms faster |
| Default stagger increment | 200ms | 150ms | 50ms tighter per step |
| Scene 3 stagger | 600ms increments | 300ms increments | Full cascade 900ms faster |
| Scene 3 entrance duration | 1200ms | 1000ms | Each element 200ms faster |
| Scene 7 tin travel | 60px/1000ms | 40px/800ms | Faster, tighter entrance |
| Floating header slide | 400ms | 250ms | Header appears 150ms faster |
| Mobile CTA bar slide | 400ms | 250ms | Bar appears 150ms faster |

### Card Hover Effects
- Testimonial cards: `translateY(-2px)` + shadow lift on hover
- Benefit cards: `translateY(-2px)` + border brighten on hover
- Both at 150ms ease-out — fast enough to feel instant

---

## 10. Measurements

| Journey | Metric | Before (est.) | After (est.) | Type |
|---------|--------|---------------|--------------|------|
| First Load → Hero headline visible | Time from first paint | ~1300ms | ~800ms | Perceived |
| First Load → Hero micro-copy visible | Time from first paint | ~2200ms | ~1400ms | Perceived |
| First Load → Scene 2+ rendered | Initial render work | All 7 scenes | Only Scene 1 | Real (content-visibility) |
| Scroll through scenes | Jank/dropped frames | 3 unthrottled scroll listeners | 1 rAF-throttled loop | Real |
| Scene 3 full entrance | Total cascade time | 1800ms + 1200ms = 3000ms | 900ms + 1000ms = 1900ms | Perceived |
| CTA tap → visual feedback | Response time | ~300ms (hover only) | ~50ms (active state) | Perceived |
| Floating header appearance | Slide duration | 400ms | 250ms | Perceived |
| Below-fold video ready | Time to first frame | On viewport entry | 1 viewport ahead | Real (prefetch) |

**Honest assessment:** The real speed gains are modest (scroll jank reduction, content-visibility, video prefetch). The majority of the improvement is **perceived** — tighter animation timing makes the same operations feel faster. This is appropriate for a static site with no API/data bottlenecks.

---

## 11. Recommendations

| # | Recommendation | Impact | Risk if Ignored | Worth Doing? | Details |
|---|---|---|---|---|---|
| 1 | Convert `tin-100g.png` (8.4MB) to WebP/AVIF with `<picture>` fallback | First meaningful paint 2–5s faster on slow connections | Critical | Yes | Target ~50–150KB. This is the #1 real performance bottleneck by a large margin. |
| 2 | Add `width`/`height` attributes to all `<img>` tags | Eliminates CLS (Cumulative Layout Shift) | Medium | Yes | Browser can reserve space before image loads. Takes 2 minutes to add. |
| 3 | Async-load Google Fonts with font-display fallback | Removes render-blocking resource | Medium | Probably | Use `media="print" onload="this.media='all'"` pattern or `font-display: optional` for non-critical text. |
| 4 | Add Service Worker for return visits | Instant load on repeat visits | Low | If time | Cache HTML, CSS, JS, and hero video. Return visitors get instant paint. |
| 5 | Deploy with proper Cache-Control headers | Faster repeat visits, reduced bandwidth | Low | Yes (at deploy time) | `max-age=31536000` for assets, short TTL for HTML. |
| 6 | Replace Scene 4 image placeholders with real images | Visual completeness | Low | Yes (content-dependent) | Dashed-border placeholder divs look unfinished. Use optimized WebP images. |

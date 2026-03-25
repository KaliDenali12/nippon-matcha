# Product Polish & UX Friction Audit Report

> **Run**: 01 | **Date**: 2026-03-25 | **Time**: 15:45
> **Scope**: Static analysis of `index.html`, `styles.css`, `script.js`
> **Site type**: Single-page landing page → Amazon product purchase

---

## 1. Executive Summary

**Overall polish level: Good**

This is a well-crafted single-product landing page with strong visual storytelling, smooth scroll-linked animations, and a clear purchase funnel. For a vanilla HTML/CSS/JS site, the code quality and attention to detail are above average.

The most significant friction points are:

1. **Scene 1 "Discover Nippon Matcha" CTA is an anchor to #scene-2, not a purchase link** — the primary hero CTA delays purchase intent by sending users deeper into the page rather than toward Amazon
2. **Scene 4 has placeholder images (dashed-border boxes with `<span>` text)** — the entire "Craft" story section looks unfinished and damages trust
3. **No footer, no contact info, no privacy policy, no about page** — for a premium $50 product, this reduces credibility
4. **8.4 MB product image** — the tin image loads twice (Scenes 1 and 7), creating a ~17 MB image payload that will cause significant load time on mobile
5. **Zero price context or comparison** — "$50" is stated but there's no anchoring (vs competitors, per-serving cost, etc.)

---

## 2. User Journey Map

### Entry Points

| Entry Point | Available? | Health |
|---|---|---|
| Direct URL / landing page | Yes | Smooth |
| Search engine (SEO) | Partial — has meta description and title, no structured data | Some friction |
| Social sharing link | Partial — `og:title` and `og:description` exist, no `og:image` | Some friction |
| Deep link to specific scene (`#scene-3`) | Yes — `scroll-margin-top` handles header offset | Smooth |
| Amazon listing backlink | Not present — no link back from Amazon to this site | Missing |

### Primary Journey: Visitor → Amazon Purchase

| Step | Scene | Action | Health | Notes |
|---|---|---|---|---|
| 1. Land on page | Scene 1 | View hero video, headline, product | Smooth | Strong first impression, clear value prop |
| 2. Engage with CTA | Scene 1 | "Discover Nippon Matcha" | **Some friction** | Scrolls to Scene 2 — user expecting purchase may be confused |
| 3. Read origin story | Scene 2 | Scroll, watch tin rotate | Smooth | Engaging interaction |
| 4. Experience ritual | Scene 3 | Watch video, read copy | Smooth | Atmospheric and effective |
| 5. See craft process | Scene 4 | View image/text blocks | **Significant friction** | Placeholder images destroy premium feel |
| 6. Read testimonials | Scene 5 | Scroll through reviews | Smooth | Credible, verified buyers |
| 7. See benefits | Scene 6 | Read benefit cards | Smooth | Clear value props |
| 8. Purchase decision | Scene 7 | "Begin Your Ritual — Shop on Amazon" | Smooth | Strong final CTA with trust signals |
| 9. Mobile purchase | Any (after Scene 3) | Sticky CTA bar | Smooth | Good mobile commerce pattern |

### Secondary Flows

| Flow | Health | Notes |
|---|---|---|
| Header "Shop Now" (after scroll) | Smooth | Appears after Scene 1 exits, persistent access to purchase |
| Mobile sticky CTA bar | Smooth | Appears after Scene 3, persistent on mobile |
| Return to top | **Missing** | No back-to-top button, no header logo link to #scene-1 |
| Share/refer | **Missing** | No social sharing buttons or referral mechanism |

---

## 3. Critical Friction Points

| # | Flow | Location | Issue | Severity | Type |
|---|---|---|---|---|---|
| 1 | Hero → Purchase | `index.html:55` | Hero CTA "Discover Nippon Matcha" links to `#scene-2` instead of Amazon — delays purchase for ready buyers | High | **Confusing** |
| 2 | Craft storytelling | `index.html:99-135` | Scene 4 has 4 placeholder images (dashed boxes with text like "Image: Tea plants under shade canopies") — looks broken/unfinished | High | **Incomplete** |
| 3 | Page load | `index.html:52,65,223` | `tin-100g.png` is 8.4 MB, loaded 3 times (Scene 1 `fetchpriority=high`, Scene 2 `loading=lazy`, Scene 7 `loading=lazy`). Even with caching, initial load is brutal | High | **Broken** (perf) |
| 4 | Trust/credibility | All | No footer with company info, contact, privacy policy, terms, or return policy link | Medium | **Missing** |
| 5 | SEO/sharing | `index.html` `<head>` | No `og:image` meta tag — social shares show no preview image | Medium | **Missing** |
| 6 | Navigation | `floating-header` | Header wordmark "Nippon Matcha" is a `<span>`, not a link — clicking it does nothing. Users expect logo/wordmark to navigate home | Medium | **Confusing** |
| 7 | Price anchoring | `index.html:56,227` | "$50" shown without context — no per-serving cost, no comparison, no "value" framing for a premium product | Medium | **Missing** |
| 8 | CLS/layout | `index.html:52,65,223` | `<img>` tags for tin have no `width`/`height` attributes — causes Cumulative Layout Shift as images load | Medium | **Incomplete** |
| 9 | Mobile CTA bar | `script.js:200-222` | Mobile CTA bar only appears after scrolling past Scene 3 — users in Scenes 1-3 on mobile have no persistent purchase CTA except the hero button | Low | **Incomplete** |
| 10 | Scene 1 CTA text | `index.html:55` | "Discover Nippon Matcha" is vague — doesn't communicate what happens (scroll down? buy? learn more?) | Low | **Confusing** |

---

## 4. First-Use & Onboarding

### Landing Experience (Scene 1)

**What works well:**
- Hero video creates immediate atmosphere and premium feel
- Floating tin with drop shadow is eye-catching
- Headline "From the First Harvest. For Your First Sip." is compelling
- Price + shipping info shown upfront ($50, Free Shipping) — no hidden costs
- Subheadline communicates origin clearly

**Friction:**
- **Hero CTA misdirection**: "Discover Nippon Matcha" scrolls to Scene 2. A user who lands ready to buy has no immediate Amazon link in the hero. They must scroll past Scene 1 for the floating header to appear, or scroll to Scene 7. The hero micro-copy mentions "$50" but there's no "Buy Now" option next to it.
- **No secondary CTA**: Consider a text link "or Shop Now on Amazon →" below the primary CTA for ready buyers.
- **Tin image rendering**: `mix-blend-mode: screen` on the tin image means it blends into the video background. On dark backgrounds this works; on lighter video frames, the tin can appear washed out or ghostly. Verify in running app.

### Empty States

Not applicable — this is a content-driven landing page with no user-generated content or empty states.

---

## 5. Core Workflow Assessment

### Primary Action: Get to Amazon Purchase

**Desktop path (optimal):**
1. Land → See hero → Scroll → Header appears with "Shop Now" → Click → Amazon (**3 actions**)
2. Land → Scroll all the way → Scene 7 "Begin Your Ritual" → Click → Amazon (**2 actions, long scroll**)

**Mobile path (optimal):**
1. Land → Scroll past Scene 3 → Sticky CTA bar appears → "Shop Now" → Amazon (**3+ scrolls**)

**Assessment:** The purchase funnel is intentionally long (storytelling-driven), which is fine for the brand narrative. But there should be an Amazon link available at ALL times, not just after scrolling past the hero. The floating header solves this on desktop once visible, but the mobile sticky bar doesn't appear until after Scene 3.

### Links & CTAs Inventory

| CTA | Location | Target | Format |
|---|---|---|---|
| "Discover Nippon Matcha" | Scene 1 | `#scene-2` (anchor) | Button |
| "Shop Now" | Floating header | Amazon | Button (small) |
| "Begin Your Ritual — Shop on Amazon" | Scene 7 | Amazon | Button |
| "Shop Now" | Mobile sticky bar | Amazon | Button (small) |

**Issue:** Only 3 of 4 CTAs actually go to Amazon. The most prominent one (hero) doesn't.

### Scroll Performance & Feedback

- Scroll-linked animations provide good feedback that the page is responding
- Tin rotation in Scene 2 is satisfying and draws attention
- Scene transitions (dark↔light gradients) are smooth
- `content-visibility: auto` on below-fold scenes is a good performance optimization
- rAF-throttled scroll callbacks prevent jank

### Video Behavior

- Scene 1: Autoplay loop works well for ambiance
- Scene 3: Play-once via IntersectionObserver — good, but if user scrolls away and back, video won't replay (by design, but could feel broken to a user who missed it)
- Scene 7: Play/pause on visibility — correct behavior

---

## 6. Edge Cases & Errors

### Destructive Actions

Not applicable — read-only landing page with no user-mutable state.

### Error States

| Scenario | Handling | Quality |
|---|---|---|
| Video fails to load | No fallback — black background shows through overlay | **Incomplete** — Scene 1 has a solid overlay gradient so it degrades somewhat gracefully, but Scenes 3 and 7 would show near-black sections with floating text |
| Image fails to load | `alt` text present ("Nippon Matcha 100g tin") | Adequate |
| JavaScript disabled | All `[data-animate]` elements remain `opacity: 0` — **entire page content is invisible** | **Broken** |
| Google Fonts fail to load | Fallback stack: Georgia (headings), system sans-serif (body) | Adequate |
| Slow connection | Hero video preloaded but 3.1 MB; tin image 8.4 MB — hero section could be blank/loading for 10+ seconds on 3G | **Significant friction** |

### JavaScript Disabled — Critical Issue

`styles.css:100` sets `[data-animate] { opacity: 0; }`. Without JavaScript to add `.visible`, ALL animated content remains invisible. This affects:
- Scene 1: headline, subheadline, CTA, micro-copy (the tin itself is visible but nothing else)
- Scenes 2-7: all headings and body text

A `<noscript>` style override or CSS-only fallback (`[data-animate] { opacity: 1; }` in a `<noscript><style>` block) would fix this.

### Boundaries

| Boundary | Status | Notes |
|---|---|---|
| Very wide screens (>1920px) | Contained — `max-width` on inner containers | OK |
| Very narrow screens (<320px) | Not tested — no breakpoint below 480px | Verify in running app — headlines may overflow |
| Long testimonial text | Testimonial cards use auto height — longer quotes just make taller cards, which can create uneven grid rows | Minor visual issue |
| Browser back button | Smooth scroll + `#scene-2` anchor means back button returns from Scene 2 to Scene 1 correctly | OK |

---

## 7. Settings & Account Management

Not applicable — static landing page with no user accounts, settings, or configuration.

---

## 8. Notifications

Not applicable — no email capture, no notification system, no newsletter signup.

**Missing opportunity:** There is no email capture anywhere on the page. For a premium product, a "notify me of restocks" or "join for matcha tips" signup could build a direct customer relationship rather than relying entirely on Amazon.

---

## 9. Accessibility Notes

### What's Done Well
- Skip link present (`<a class="skip-link">Skip to main content</a>`) — `styles.css:47-64`
- `:focus-visible` styles on all interactive elements with gold outline — `styles.css:68-77`
- `aria-label` on all `<section>` elements
- `aria-hidden="true"` on decorative elements (videos, overlays, sakura container)
- `role="img" aria-label="5 out of 5 stars"` on star ratings
- `prefers-reduced-motion` media query disables all animations — `styles.css:967-991`
- Header and mobile bar toggle `aria-hidden` with visibility state

### Issues Found

| Issue | Location | Severity |
|---|---|---|
| **JS-disabled content invisible** | `styles.css:100` | Critical — all animated content has `opacity: 0` with no fallback |
| **Skip link targets `#scene-1`** | `index.html:30` | Low — typically skip links skip *to* the main content (past navigation), but since Scene 1 IS the main content, this is acceptable |
| **Floating header starts `aria-hidden="true"`** | `index.html:33` | OK — correctly hidden when not visible |
| **Scene 4 placeholder images have no `alt` text** | `index.html:99-135` | Low — these are placeholder `<span>` elements, not `<img>` tags, but when replaced with real images they'll need `alt` |
| **No `lang` attribute on testimonial names** | N/A | Non-issue — all names are in English/Latin script |
| **Keyboard-only flow** | All | Verify in running app — Tab order should follow visual order since DOM order matches |
| **Color contrast** | `--text-muted` (#A89F95) on `--bg-primary` (#1A1A1A) | Verify — muted text on dark backgrounds may be below WCAG AA 4.5:1 ratio. Calculate: ~4.0:1 — **likely fails AA for small text** |

---

## 10. Recommendations

### Quick Fixes (Hours)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 1 | **Add `<noscript><style>[data-animate]{opacity:1;transform:none}</style></noscript>`** | Prevents invisible page for JS-disabled users | 5 min |
| 2 | **Make header wordmark a link to `#scene-1`** | Meets user expectation for logo = home navigation | 5 min |
| 3 | **Add `width` and `height` attributes to all `<img>` tags** | Eliminates CLS on image load | 10 min |
| 4 | **Add a secondary "Shop Now" text link below the hero CTA** | Gives ready buyers an immediate purchase path | 15 min |
| 5 | **Add a simple `<footer>` with contact email, Amazon store link, copyright** | Basic credibility for a $50 product | 30 min |
| 6 | **Add video fallback** — set `poster` attribute on `<video>` elements (static frame) | Graceful degradation if video fails to load or autoplay is blocked | 30 min |

### Medium Fixes (Days)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 7 | **Convert `tin-100g.png` (8.4 MB) to WebP/AVIF with `<picture>` fallback** | Reduces image payload from ~17 MB to ~300-500 KB total. Single biggest perf win | 1-2 hours |
| 8 | **Replace Scene 4 placeholder images with real photography** | Completes the craft story — currently looks unfinished | Requires photography assets |
| 9 | **Add per-serving price context** ("$50 for 100g = ~50 servings = $1/cup") | Reframes the price as a value proposition vs. coffee | 30 min copywriting |
| 10 | **Add `og:image` meta tag with a product shot** | Social sharing shows product image instead of nothing | 1 hour (create image + add meta) |
| 11 | **Improve muted text contrast** — lighten `--text-muted` to ~#BEB5AB or similar to hit WCAG AA | Accessibility compliance for secondary text | 30 min + visual verification |

### Larger Fixes (Weeks)

| # | Recommendation | Impact | Effort |
|---|---|---|---|
| 12 | **Add email capture** (popup, inline, or footer form) | Build direct customer relationship beyond Amazon dependency | Integration + form backend needed |
| 13 | **Add structured data** (Product schema, Review schema) | Rich snippets in Google search results (price, rating, availability) | 2-3 hours |
| 14 | **Add a "back to top" button** | Quality-of-life for long single-page scroll | 1-2 hours (JS + CSS) |

---

## Appendix: Video Asset Summary

| Video | Scene | Size | Preload | Behavior |
|---|---|---|---|---|
| `sakura-hero.mp4` | 1 | 3.1 MB | `<link rel="preload">` | Autoplay loop |
| `ritual-pour.mp4` | 3 | 5.7 MB | `none` → `auto` (IO prefetch) | Play once |
| `ready-bowl.mp4` | 7 | 4.1 MB | `none` → `auto` (IO prefetch) | Play/pause on visibility |

**Total video payload**: 12.9 MB (acceptable for video-driven storytelling, well-managed with lazy loading)

**Total image payload**: ~17 MB (3× `tin-100g.png` at 8.4 MB — **not acceptable**, needs WebP/AVIF conversion)

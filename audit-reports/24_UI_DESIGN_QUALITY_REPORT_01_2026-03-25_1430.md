# UI Design Quality & Visual Polish Report

> **Run**: #01 | **Date**: 2026-03-25 14:30 UTC
> **Branch**: `nightytidy/run-2026-03-25-1424`
> **Auditor**: Claude Opus 4.6 automated audit
> **Screenshots**: 22/22 captured across 4 viewports
> **Files analyzed**: `index.html` (239 lines), `styles.css` (943 lines), `script.js` (249 lines)

---

## 1. Executive Summary

**Design Quality Rating: Competent** — trending toward Polished

The Nippon Matcha landing page demonstrates strong foundational design craft: a cohesive dark premium aesthetic, well-executed scroll animations, proper use of CSS custom properties for core colors, and thoughtful responsive layouts. The typography pairing (Cormorant Garamond + Lato) is elegant and correctly applied across the hierarchy.

However, several objective quality issues prevent a "Polished" rating:

### Issue Count by Severity

| Severity | Count |
|----------|-------|
| Critical | 6 |
| High | 8 |
| Medium | 14 |
| Low | 14 |
| **Total** | **42** |

### Top 5 Highest-Impact Improvements

1. **Fix WCAG contrast failures** — 6 critical + 3 high failures. Gold stars on light backgrounds (2.04:1), muted text on white cards (2.61:1), and muted text over video overlays all fail basic readability. These affect trust signals and conversion elements.
2. **Scope CTA button width rules** — The 768px and 480px responsive rules for `.cta-button` leak into the floating header and mobile CTA bar, causing buttons to overflow their flex containers on mobile.
3. **Fix CTA hover contrast regression** — Hover state (`--green-sage-hover` #5A9469) drops contrast from 4.62:1 to 3.39:1, failing WCAG AA. The resting state barely passes.
4. **Add `width`/`height` to `<img>` tags** — All 3 images missing intrinsic dimensions. With an 8.4 MB PNG, the CLS window is long.
5. **Increase Scene 3 overlay opacity** — Body text at 18px over the 40-60% overlay fails AA against bright video frames.

### Does a Coherent Design System Exist?

**Partially.** The color palette is well-defined with 10 CSS custom properties covering all semantic roles. However, RGBA variants are hardcoded (12+ instances), font sizes are ad hoc (13 unique values, no modular scale), spacing loosely follows 8px multiples (57% adherence), and there are zero CSS variables for spacing, font-size, border-radius, shadow, or easing values. See `docs/DESIGN_SYSTEM.md` for the full inventory.

---

## 2. Screen-by-Screen Audit

### Scene 1: The Arrival (Hero)

- **Critical**: `--text-muted` (#A89F95) subheadline over video+overlay can drop to ~1.1:1 contrast against bright cherry blossom video frames → Increase overlay minimum opacity or switch to `--text-light`
- **Critical**: `--text-muted` micro text ("100g - Ceremonial Grade - $50") at 14px — worst case ~2.4:1 over video → Same fix as subheadline
- **High**: `<img>` tag for tin missing `width`/`height` attributes — 8.4 MB PNG causes CLS → Add intrinsic dimensions
- **Medium**: `letter-spacing: 1px` on mixed-case micro text reduces readability → Either add `text-transform: uppercase` or remove `letter-spacing`
- **Low**: In-page scroll anchor ("Discover Nippon Matcha") visually identical to purchase CTAs → Consider ghost/outline variant for navigation

### Scene 2: The Origin

- **High**: Anchor link `#scene-2` scroll target lands behind 64px floating header → `scroll-margin-top: 64px` added (**FIXED**)
- **Medium**: `.scene-2__text-col p` margin-bottom 20px (should be 24px to match 8px grid) → Change to 24px
- **Low**: Last paragraph (`.scene-2__final`) has unnecessary trailing 20px margin → Add `p:last-child { margin-bottom: 0 }`

### Scene 3: The Ritual

- **High**: `--text-light` on 40-60% overlay — worst case 4.03:1, body text at 18px fails AA normal → Increase overlay gradient from `rgba(26,26,26,0.4/0.6)` to at least `rgba(26,26,26,0.6/0.75)`
- **Medium**: Scene 3 entrance delays (600ms stagger) create total 1800ms delay for the last paragraph — may feel sluggish → Consider reducing to 400ms stagger

### Scene 4: The Craft

- **Medium**: All 4 image placeholder `<div>`s with visible text ("Image: Tea plants...") lack `aria-hidden="true"` — screen readers announce placeholder text → Add `aria-hidden="true"` to each `.craft-block__image`
- **Medium**: Craft block internal gap (48px) and between-block gap (64px) not reduced on mobile — 384px of whitespace across 4 blocks at 375px → Add responsive gap reduction (24px internal, 40px between)
- **Medium**: Parallax images may clip at extreme scroll positions due to `overflow: hidden` on `.scene` → Clamp translation range in JS or set `overflow: visible` on Scene 4
- **Low**: `will-change: transform` on placeholder divs wastes compositor layers → Remove until real images added
- **Low**: `.craft-block__image` border-radius 12px is an outlier (cards use 16px, skip-link uses 8px) → Align to 16px

### Scene 5: The Testimony

- **Critical**: Gold stars (#C9A86C) on sakura tint (#FEF0F0) — **2.04:1 contrast** — fails every WCAG level → Darken to at least `#8B7535` or add distinct background behind stars
- **Critical**: Gold stars (#C9A86C) on white card (#FFFFFF) — **2.26:1 contrast** (×5 cards) → Same as above
- **Critical**: "Verified Buyer/Reviewer" badge text (`--text-muted` #A89F95 on white) at 13px — **2.61:1 contrast** — functionally illegible for low vision → Darken to at least `#767676`
- **Critical**: White card (#FFFFFF) on sakura tint (#FEF0F0) — **1.11:1 boundary contrast** — card edges invisible to low-vision users (WCAG 1.4.11) → Add `border: 1px solid rgba(0,0,0,0.1)` or increase shadow opacity
- **Medium**: Scene 5 headline missing explicit bottom margin (relies on browser default h2 margin) → Add `margin-bottom: 16px`
- **Low**: Six redundant "5 out of 5 stars" `aria-label` announcements (1 section-level + 5 per-card) → Hide section-level stars from AT

### Scene 6: The Promise

- **High**: Benefit cards stretch to 672px on tablet (768px breakpoint sets `max-width: 100%`) — text lines approach 66+ characters → Cap at `max-width: 560px` on tablet
- **Medium**: Section padding inconsistent — Scene 6 stays at 100px while Scenes 4/5 drop to 60px at 768px → Added responsive override (**FIXED**)
- **Medium**: Inner container side padding inconsistent — Scene 6 stays at 48px while others use 24px at 768px → Added responsive override (**FIXED**)

### Scene 7: The Invitation

- **Critical**: `--text-muted` on video overlay — price (14px), trust strip (13px uppercase), risk text (13px italic) — worst case **2.46:1** → Switch to `--text-light` or increase overlay to 0.85+
- **High**: `<img>` tag for tin missing `width`/`height` → Add intrinsic dimensions
- **High**: Mobile sticky CTA bar (60px) occludes bottom content — trust strip and risk text hidden behind bar → Add `padding-bottom: 80px` to Scene 7 at 768px
- **Medium**: `.scene-7__content` has no max-width — trust strip sprawls on ultrawide → Add `max-width: 800px; margin: 0 auto`
- **Medium**: Seven spacing values in one content stack (16, 24, 32px in irregular sequence) → Standardize to 16px tight + 32px section gaps
- **Low**: `mix-blend-mode: screen` on tin distorts product appearance in purchase context → Consider removing for Scene 7

### Floating Header

- **High**: `--green-sage-hover` (#5A9469) hover state drops CTA contrast from 4.62:1 to **3.39:1** — fails WCAG AA → Darken hover or differentiate via shadow/scale only
- **Medium**: CTA button at 13px with 10px vertical padding yields ~38px height — below 44px tap target minimum → Increase to `min-height: 44px`
- **Medium**: Header wordmark is a `<span>`, not a link — violates universal web convention of clickable logo/wordmark → Change to `<a href="#scene-1">`
- **Low**: Mobile (375px): "NIPPON MATCHA" wordmark wraps to two lines → Consider smaller font or abbreviation

### Mobile CTA Bar

- **High**: CTA button inherits `width: 100%` from 768px rule, squeezes price text → Override added (**FIXED**)
- **Low**: IntersectionObserver callback at script.js:165 doesn't toggle `aria-hidden` (only scroll handler does) → Add `setAttribute` in observer

### Cross-Component

- **High**: At 480px, `.cta-button` gets `width: calc(100% - 48px)` globally — leaks to header and mobile bar → Scoped to scene CTAs only (**FIXED**)
- **Medium**: No `:active` pressed state on any CTA button — zero click/tap feedback → Add `transform: scale(0.97)` active state
- **Medium**: Gold focus outline (#C9A86C) insufficient contrast on light backgrounds (2.3:1 vs sakura tint) → Add scoped dark outline for light sections
- **Medium**: CTA focus ring uses `--bg-cream` which is invisible on light backgrounds → Use `--text-dark` or double-ring technique

---

## 3. Design System State

### Token Inventory Summary

| Category | Unique Values | Tokenized? | System? |
|----------|--------------|------------|---------|
| Colors (variables) | 10 | Yes | Yes |
| Colors (hardcoded) | ~14 | No | No |
| Font sizes | 13 | No | No modular scale |
| Spacing | 14 | No | Loosely 8px-based |
| Border-radius | 4 | No | Weak |
| Shadows | 5 | No | No (same drop-shadow ×3) |
| Transitions | 7 durations, 4 easings | No | Partial (1 dominant easing) |
| Breakpoints | 2 | No | Yes |
| Max-widths | 7 | No | Weak (1100 vs 1200) |
| Z-index | 6 | No | Yes |

### System Coherence: 4/10

The color palette is the strongest part — 10 well-named CSS variables with clear semantic roles. Everything else is ad hoc: font sizes picked per element, spacing values scattered without variables, the same `cubic-bezier` curve repeated verbatim 4 times, and RGBA color variants that hardcode raw channel values instead of referencing the parent variable.

**Full inventory**: `docs/DESIGN_SYSTEM.md`

---

## 4. Interaction Audit

### Hover States

| Element | Has Hover? | Transition? | Quality |
|---------|-----------|-------------|---------|
| `.cta-button` (all) | Yes | 300ms ease | Good (but contrast issue on hover) |
| `.skip-link` | No | — | Missing (low priority) |
| `.testimonial-card` | No | — | Optional polish (not clickable) |
| `.benefit-card` | No | — | Optional polish (not clickable) |
| Header wordmark | N/A | — | Not a link (should be) |

### Focus States

| Element | Focus Rule | Visibility |
|---------|-----------|------------|
| General `:focus-visible` | 2px gold outline, 3px offset | Good on dark, poor on light |
| `.cta-button:focus-visible` | 2px cream outline + green glow | Good on dark, invisible on light |
| `.skip-link:focus` | Position change to `top: 0` | Functional |

### Active/Pressed States

**None exist.** Zero `:active` rules in the entire stylesheet. No click/tap feedback on any interactive element.

### Transitions

All JS-driven class toggles (`.visible`) have corresponding CSS transitions. No missing transitions for state changes. All scroll listeners are `{ passive: true }`. No forced reflows detected.

### Animation Quality

- 9/10 animation types use GPU-composited properties (transform, opacity)
- 1 exception: `sakuraSway` animates `margin-left` (deliberate tradeoff to avoid transform conflicts)
- `prefers-reduced-motion` comprehensively handled
- Scene 2 tin rotation uses textbook scroll-rAF decoupling with lerp smoothing

---

## 5. Fixes Applied

Three CSS fixes were applied — all meeting the criteria of objectively broken, single obvious solution, zero risk of cascade:

1. **CTA button width leak (Critical)**: Scoped the 768px `width: 100%` and 480px `width: calc(100% - 48px)` rules to prevent them from leaking to floating header and mobile CTA bar buttons.
   - Added `.floating-header .cta-button, .mobile-cta-bar .cta-button { width: auto; max-width: none; }` inside the 768px media query
   - Changed 480px rule from `.cta-button` to `.scene-1__cta, .scene-7__cta`

2. **Scroll-margin for floating header (High)**: Added `scroll-margin-top: 64px` to `.scene` to prevent the 64px fixed header from covering content when navigating via `#scene-2` anchor.

3. **Scene 6 responsive padding inconsistency (Medium)**: Added `padding: 60px 0` to `.scene-6` and `padding: 0 24px` to `.scene-6__inner` at the 768px breakpoint, matching Scenes 4 and 5.

---

## 6. Priority Remediation Plan

| # | Recommendation | Screens Affected | Effort | Impact | Worth Doing? | How To Fix |
|---|---|---|---|---|---|---|
| 1 | Fix gold star contrast on light backgrounds | Scene 5 (6 instances) | Hours | Critical | Yes | Darken star color to `#8B7535` or add scoped `--gold-on-light: #8B7535` variable. Apply to `.scene-5__stars` and `.testimonial-card__stars`. |
| 2 | Fix muted text contrast on white cards | Scene 5 (5 cards) | Hours | Critical | Yes | Darken `.testimonial-card__badge` color to `#767676`. Consider a `--text-muted-on-light` variable. |
| 3 | Fix muted text contrast over video overlays | Scenes 1, 7 | Hours | Critical | Yes | Either increase overlay opacities (Scene 7 to `0.8/0.9`, Scene 1 bottom to `0.85`) or switch `--text-muted` elements to `--text-light` in video scenes. |
| 4 | Add visible card boundaries in Scene 5 | Scene 5 (5 cards) | Hours | Critical | Yes | Add `border: 1px solid rgba(0,0,0,0.08)` to `.testimonial-card`. |
| 5 | Fix CTA hover contrast regression | All CTAs | Hours | High | Yes | Change `--green-sage-hover` from `#5A9469` to `#4F7F55` or reuse `--green-sage` and differentiate hover via shadow/scale only. |
| 6 | Add `width`/`height` to all `<img>` tags | Scenes 1, 2, 7 | Hours | High | Yes | Measure `tin-100g.png` intrinsic dimensions and add `width="X" height="Y"` to all 3 `<img>` tags. |
| 7 | Increase Scene 3 overlay opacity | Scene 3 | Hours | High | Yes | Change gradient from `rgba(26,26,26,0.4) 0%, rgba(26,26,26,0.6) 100%` to `rgba(26,26,26,0.6) 0%, rgba(26,26,26,0.75) 100%`. |
| 8 | Fix mobile CTA bar content occlusion | Scene 7 (mobile) | Hours | High | Yes | Add `.scene-7 { padding-bottom: 80px; }` inside 768px media query. |
| 9 | Cap benefit card width on tablet | Scene 6 | Hours | High | Yes | Change `.benefit-card` from `max-width: 100%` to `max-width: 560px` in 768px media query. |
| 10 | Add `:active` pressed state to CTAs | All CTAs | Hours | Medium | Yes | Add `.cta-button:active { transform: scale(0.97); box-shadow: none; }` and include `transform` in the transition shorthand. |
| 11 | Make header wordmark a clickable link | Header | Hours | Medium | Yes | Change `<span class="header-wordmark">` to `<a href="#scene-1" class="header-wordmark">` with `text-decoration: none`. |
| 12 | Increase small CTA tap target to 44px | Header, mobile bar | Hours | Medium | Yes | Add `min-height: 44px; display: inline-flex; align-items: center;` to `.cta-button--small`. |
| 13 | Add `max-width` to Scene 7 content | Scene 7 | Hours | Medium | Probably | Add `max-width: 800px; margin: 0 auto;` to `.scene-7__content`. |
| 14 | Reduce craft block gaps on mobile | Scene 4 | Hours | Medium | Probably | Add `.craft-blocks { gap: 40px; }` and `.craft-block { gap: 24px; }` inside 768px query. |
| 15 | Fix focus ring visibility on light backgrounds | Scene 5 area | Hours | Medium | Probably | Add `.scene-5 :focus-visible { outline-color: var(--text-dark); }`. |
| 16 | Add `aria-hidden` to image placeholders | Scene 4 | Hours | Medium | Yes | Add `aria-hidden="true"` to each `.craft-block__image` div. |
| 17 | Add explicit margin to Scene 5 headline | Scene 5 | Hours | Medium | Probably | Add `margin-bottom: 16px` to `.scene-5__headline`. |
| 18 | Standardize 13px text to 14px | Various | Hours | Medium | Probably | Change font-size from 13px to 14px on `.cta-button--small`, `.testimonial-card__badge`, `.trust-strip span`, `.scene-7__risk`. |
| 19 | Tokenize RGBA color variants | All | Days | Medium | Only if time | Create CSS variables for common RGBA variants or use `color-mix()`. 12+ hardcoded values. |
| 20 | Tokenize easing/duration values | All | Days | Low | Only if time | Create `--ease-default`, `--duration-entrance`, etc. and replace 4 repeated cubic-bezier values. |

---

## 7. Design System Recommendations

### Immediate (Hours)

1. **Add `--bg-white: #FFFFFF`** and `--bg-card: #FFFFFF` tokens — currently the only hardcoded background
2. **Add `--gold-on-light` variant** — a darker gold (~`#8B7535`) for use on light backgrounds where current gold fails contrast
3. **Add `--text-muted-on-light` variant** — at least `#767676` for muted text on white/sakura backgrounds
4. **Consolidate 13px → 14px** — merge the two nearly-identical small text sizes into one

### Short-term (Days)

5. **Tokenize spacing scale** — define `--space-xs: 4px` through `--space-4xl: 80px` and replace hardcoded values
6. **Tokenize font-size scale** — define `--text-xs` through `--text-4xl` and apply to all elements
7. **Tokenize shadow values** — the same `drop-shadow(0 12px 32px rgba(0,0,0,0.5))` is repeated 3 times verbatim
8. **Create a `--ease-default` variable** for the signature `cubic-bezier(0.25, 0.46, 0.45, 0.94)` curve repeated 4 times
9. **Align off-grid spacing** — migrate 10px→12px or 8px, 20px→24px, 28px→24px or 32px, 60px→64px, 100px→96px

### Medium-term (Weeks)

10. **Adopt a modular type scale** — e.g., 1.25 ratio from 16px base: 16, 20, 25, 31, 39, 49, 61 (currently 13 arbitrary sizes)
11. **Define RGBA variants via `color-mix()`** — `color-mix(in srgb, var(--bg-primary) 85%, transparent)` instead of hardcoded channels
12. **Bridge JS/CSS color gap** — read sakura petal colors from CSS custom properties in JS instead of hardcoding

---

## 8. Report & Design System Docs Location

| Document | Path |
|----------|------|
| This report | `audit-reports/24_UI_DESIGN_QUALITY_REPORT_01_2026-03-25_1430.md` |
| Design system | `docs/DESIGN_SYSTEM.md` |
| Screenshots | `audit-reports/screenshots/` (22 files) |

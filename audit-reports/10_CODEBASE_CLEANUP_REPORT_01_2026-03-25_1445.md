# Codebase Cleanup Report

**Run:** 01
**Date:** 2026-03-25 14:45
**Branch:** `nightytidy/run-2026-03-25-1424`
**Codebase:** Nippon Matcha — vanilla static landing page (HTML/CSS/JS, no build tools)

---

## 1. Summary

| Metric | Value |
|--------|-------|
| Total files modified | 2 (`script.js`, `styles.css`) |
| Lines of code changed (net) | 0 (11 replaced in each file — `var`→`const`/`let` + specificity fix) |
| Unused dependencies removed | 0 (no `package.json` exists) |
| Number of commits made | 2 |
| Tests affected | N/A — no test suite exists |

**Context:** This is a small, vanilla static site with 3 source files (230-line HTML, 877-line CSS, 224-line JS), no build tools, no package manager, and no test suite. The codebase is already well-maintained with tight cross-file alignment.

---

## 2. Dead Code Removed

### Removed: None

The codebase has virtually no dead code. Exhaustive cross-reference analysis found:

- **0 orphaned CSS classes** — every CSS selector maps to an HTML class or a JS-created element
- **0 unused JS functions or variables** — every declaration is consumed
- **0 commented-out code blocks** — all comments are section labels or explanatory notes
- **0 unreachable code paths** — no code after returns, no permanently false conditionals
- **0 orphaned files** — every file in the project is referenced
- **0 unused dependencies** — no `package.json` exists; the only external resource is Google Fonts, which is actively used

### Documented but not removed:

| Item | Location | Why not removed |
|------|----------|-----------------|
| `--pink-sakura: #E8A0BF` | `styles.css:11` | Defined as a CSS custom property but never consumed via `var(--pink-sakura)`. However, the same hex value `#E8A0BF` IS used hardcoded in `script.js:186` for sakura petal colors. This is a consistency issue (see Phase 3), not dead code — the design token should exist, it's just not properly consumed. Removing it would make the design system less complete. |
| `craft-block--left` class | `index.html:82,102` | Used in HTML but has no CSS rule (unlike `craft-block--right` at `styles.css:433`). This is intentional BEM convention — the default `flex-direction: row` handles left layout. The class serves a semantic/documentation purpose. |

---

## 3. Duplication Reduced

### Duplicated patterns found: Minimal

This codebase has very little duplication due to its small size and single-purpose architecture.

#### Low-risk patterns (not implemented — too marginal to justify):

| Pattern | Locations | Assessment |
|---------|-----------|------------|
| IntersectionObserver creation | `script.js:10, 55, 73, 92, 114, 135` | Six observers are created with similar patterns but each has different callbacks, thresholds, and behaviors. Abstracting into a factory would add complexity without reducing total code volume. The current explicit approach is more readable. |
| `font-family: 'Lato', sans-serif` | `styles.css:33, 112, 290, 664, 724` | Repeated across several rules. Already partially addressed by the body font-family declaration; the explicit declarations are on elements that need to override inherited serif fonts. Consolidation would require a reset-style approach that's more complexity than it's worth. |
| `filter: drop-shadow(0 12px 32px rgba(0,0,0,0.5))` | `styles.css:262, 334, 636` | Same shadow on three tin/product images. Could be a utility class, but with only 3 occurrences in a single-file CSS, the duplication is trivial. |
| `font-weight: 400; font-size: 14px; color: var(--text-muted)` | `styles.css:291-294, 664-668` | Similar micro-text styling on Scene 1 and Scene 7 price labels. Could be a shared `.micro-label` class, but the rules aren't identical (letter-spacing differs). |

**Verdict:** No duplication significant enough to warrant extraction in a 3-file codebase. All patterns are used in context-specific ways that make abstraction more complex than the duplication.

---

## 4. Consistency Changes

### Changed (2 commits):

#### 1. `var` → `const`/`let` in sakura particle generator (`script.js`)
- **File:** `script.js:194-207`
- **Issue:** The sakura petal creation loop used `var` declarations while the entire rest of the file consistently uses `const`/`let` (ES6 block-scoped)
- **Fix:** Converted all 11 `var` declarations to `const` (values never reassigned) and the loop counter to `let`
- **Pattern enforced:** ES6 `const`/`let` throughout `script.js`

#### 2. Removed `!important` via specificity increase (`styles.css`)
- **File:** `styles.css:353-356`
- **Issue:** `.scene-2__final` used `color: var(--gold) !important` to override the color set by `.scene-2__text-col p`
- **Fix:** Changed selector from `.scene-2__final` to `.scene-2__text-col .scene-2__final` (specificity 0,2,0 beats 0,1,1), eliminating the need for `!important`
- **Pattern enforced:** Zero `!important` declarations in the stylesheet

### Documented but not changed:

| Pattern | Assessment |
|---------|------------|
| **Sakura colors hardcoded in JS vs CSS custom properties** | `script.js:186` defines `['#F7D1D5', '#EDAFCA', '#E8A0BF', '#D4A0A0']` as hardcoded strings. One of these (`#E8A0BF`) matches the unused `--pink-sakura` custom property. Ideally, JS should read CSS custom properties via `getComputedStyle()`, but this would add complexity for a purely aesthetic feature. Documented as a recommendation. |
| **Naming convention is consistent** | BEM-like naming used throughout CSS (`scene-1__headline`, `craft-block--right`). No inconsistencies found. |
| **Quote style is consistent** | Single quotes used throughout JS. No inconsistencies. |
| **Async patterns are consistent** | All async operations use Promise `.catch()` — no callbacks mixed with promises. |
| **Error handling is consistent** | Empty `.catch(function () {})` on video `play()` calls (lines 59, 77) — intentional no-op handlers for browsers that reject autoplay. Consistent pattern. |
| **Import ordering** | N/A — no module imports in this vanilla JS codebase. |

---

## 5. Configuration & Feature Flags

### Feature Flags

**No feature flags found.** The codebase has no environment variables, config files, LaunchDarkly/Flagsmith references, or hardcoded boolean switches. All behavior is unconditional.

### Flag Coupling

N/A — no flags exist.

### Configuration Sprawl

The codebase uses CSS custom properties as its only configuration mechanism. All 10 design tokens are defined in `:root` in `styles.css:5-16`.

| Config | Location | Issue | Action |
|--------|----------|-------|--------|
| `--pink-sakura` | `styles.css:11` | Defined but never consumed via `var()` | Documented — see Phase 1. Recommend keeping as design token. |
| `threshold: 0.15` | `script.js:19,64,83,103` | Same value repeated 4 times | Documented — could be a constant, but extraction adds more complexity than it removes in 224 lines |
| `isMobile` breakpoint `768` | `script.js:184` | Hardcoded, matches CSS `@media (max-width: 768px)` | Documented — consistent with CSS breakpoint |
| Lerp factor `0.08` | `script.js:41` | Hardcoded animation smoothing factor | Documented — single use, clear in context |
| Parallax factor `0.4` | `script.js:173` | Hardcoded parallax intensity | Documented — single use, clear in context |
| Petal counts `5` / `10` | `script.js:185` | Hardcoded mobile/desktop petal counts | Documented — single use |

### Default Value Audit

No configuration with defaults exists — there are no environment variables, no fallback values, no server-side settings. All values are compile-time constants in CSS/JS. No concerns about dev-vs-production defaults.

### TODO/FIXME/HACK Inventory

Only TODOs found in CLAUDE.md documentation (not in source code):

| File | Line | Comment | Category | Priority | Recommendation |
|------|------|---------|----------|----------|----------------|
| `CLAUDE.md` | 26 | `TODO: Netlify, GitHub Pages, or similar static host` | Feature request | Low | Decide and set up hosting when ready to deploy |
| `CLAUDE.md` | 148 | `Scene 4 image placeholders` | Feature request | Medium | Add real product photography to replace placeholder divs |
| `CLAUDE.md` | 149 | `No favicon` | Tech debt | Low | Add favicon for brand presence in browser tabs |
| `CLAUDE.md` | 150 | `No analytics/tracking` | Feature request | Low | Add when ready to measure traffic |
| `CLAUDE.md` | 151 | `No deploy pipeline` | Tech debt | Low | Set up CI/CD when hosting is decided |
| `CLAUDE.md` | 152 | `No <meta og:image> or social sharing images` | Tech debt | Medium | Add for social media sharing preview |

**Zero TODOs/FIXMEs/HACKs exist in source code** (index.html, styles.css, script.js). All TODOs are in documentation.

---

## 6. Couldn't Touch

| Item | Reason |
|------|--------|
| Sakura color hardcoding in JS | Changing `script.js:186` to read CSS custom properties via `getComputedStyle()` would add runtime overhead and complexity for a purely aesthetic feature. The current approach works correctly. |
| Repeated IntersectionObserver pattern | Six observers with different callbacks/thresholds. A factory abstraction would obscure the different behaviors each observer implements. |
| `craft-block--left` semantic class without CSS | Removing it from HTML would lose semantic information. Adding an empty CSS rule would be pointless. Current state is fine — it's BEM convention for the default case. |
| No test suite to verify against | CLAUDE.md explicitly states "no test suite exists" — all verification is visual. Changes were limited to safe, mechanical transformations (var→const, specificity adjustment). |

---

## 7. Recommendations

| # | Recommendation | Impact | Risk if Ignored | Worth Doing? | Details |
|---|---|---|---|---|---|
| 1 | Add Scene 4 real images | Eliminates placeholder appearance, completes visual storytelling | **Medium** — placeholders look unfinished | Yes | Four image placeholders use dashed-border divs with `<span>` text. Replace with actual product/process photography to complete the craft narrative. |
| 2 | Add favicon and OG image | Improves brand presence in browser tabs and social sharing | **Low** — functional but looks unprofessional when shared | Probably | Missing `<link rel="icon">` and `<meta og:image>`. Quick win for brand polish. |
| 3 | Use CSS custom property for sakura colors | Consolidates design tokens to single source of truth | **Low** — colors work fine hardcoded | Only if time allows | `script.js:186` hardcodes `#E8A0BF` which is the `--pink-sakura` variable. Could use `getComputedStyle(document.documentElement).getPropertyValue('--pink-sakura')` but adds runtime cost. Consider adding remaining 3 colors as custom properties if the design system grows. |
| 4 | Add `prefers-reduced-motion` support | Improves accessibility for motion-sensitive users | **Medium** — may cause discomfort for some users | Yes | Sakura particles, scroll animations, parallax, and floating tin animation should respect `@media (prefers-reduced-motion: reduce)`. Currently no motion reduction is implemented. |

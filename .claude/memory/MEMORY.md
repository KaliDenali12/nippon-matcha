# Nippon Matcha — Memory Index

Static landing page for Nippon Matcha (organic ceremonial-grade matcha from Uji, Kyoto). Vanilla HTML/CSS/JS — no framework, no build tools. See CLAUDE.md for rules.

## Current State

- **Files**: 3 source files — `index.html` (~248 lines), `styles.css` (~990 lines), `script.js` (~288 lines)
- **Assets**: 1 product image (`tin-100g.png`, 8.4 MB — needs compression), 3 MP4 videos (~13 MB total)
- **Known debt**: `tin-100g.png` is 8.4 MB (critical perf issue), Scene 4 image placeholders, no favicon, no analytics, no deploy pipeline
- **Performance**: Below-fold videos prefetched 1 viewport ahead via IntersectionObserver, `content-visibility: auto` on Scenes 2–7, critical hero CSS inlined, single rAF-throttled scroll loop, `will-change` managed on animated elements
- **GitHub**: https://github.com/KaliDenali12/nippon-matcha

## Topic Files

| File | When to load |
|------|-------------|
| `page-architecture.md` | Modifying HTML structure, adding/changing scenes, video behavior, header/CTA bar logic |
| `design-system.md` | Changing colors, typography, spacing, CTA buttons, responsive breakpoints, CSS architecture |
| `animations-interactions.md` | Adding/modifying scroll animations, IntersectionObserver, sakura particles, tin rotation, parallax, video control |

## Cross-Cutting Patterns

- **IntersectionObserver everywhere**: All visibility logic (animations, videos, header, mobile CTA, video prefetch) uses IntersectionObserver — never scroll-position checks alone
- **Single rAF scroll loop**: All scroll-dependent handlers (tin rotation, mobile CTA, parallax) register via `scrollCallbacks.push()` and run in one `requestAnimationFrame` batch — never add raw `window.addEventListener('scroll', ...)` handlers
- **Animations fire once**: Elements get `.visible` class then observer `unobserve()`s — no re-triggering on scroll back
- **CSS custom properties**: All colors in `:root`. Change palette there, never hardcode hex values in rules
- **BEM-like naming**: `scene-N__element`, `modifier--variant`, `cta-button--small`
- **No globals**: All JS wrapped in a single IIFE with `'use strict'`
- **Video autoplay**: Always include `muted` attribute. Always `.catch()` the `.play()` promise
- **Amazon link**: All purchase CTAs use the same URL — update in one place if product changes
- **Accessibility**: Skip link, `<main>` landmark, `:focus-visible` styles, `prefers-reduced-motion` media query, `aria-hidden` toggled with visibility on header/mobile CTA bar, `aria-label` on all sections, decorative elements marked `aria-hidden="true"`

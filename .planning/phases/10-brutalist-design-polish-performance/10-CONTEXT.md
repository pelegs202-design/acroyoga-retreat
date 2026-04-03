# Phase 10: Brutalist Design Polish + Performance - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the platform with brutalist interactive design — cursor effects, scroll animations, and unconventional scroll — while maintaining WCAG AA accessibility and Lighthouse 90+ mobile performance. Use Google Stitch for design prototyping (strict: generate previews, match pixel-perfect) and `/frontend-design` skill. Affects public-facing pages primarily.

</domain>

<decisions>
## Implementation Decisions

### Cursor effects & interactions
- **Magnetic buttons:** Yes — buttons/links pull slightly toward cursor on hover (desktop only)
- **Draggable elements:** Claude's discretion — pick the best draggable element for brutalist aesthetic
- **Sound effects:** No sounds — visual-only interactions
- **Hover effects on cards:** Dramatic — scale up, pink glow border, shadow lift
- **Page transitions:** No page transitions — instant navigation
- **Button press animation:** Yes, scale down on press — tactile feel, bounce back
- **Loading animations:** Keep existing — don't change current loading states
- **Form input focus:** Pink glow border on focus — animated, consistent with brand
- **Toggle switches:** Keep current — no changes

### Scroll behavior & animations
- **Homepage effects:** All four — reveal-on-scroll sections, parallax background layers, sticky sections, horizontal scroll section
- **Scroll scope:** Public pages only (homepage + city pages) — app pages stay clean
- **Horizontal scroll content:** Claude's discretion — pick most impactful content
- **Text animation:** No scroll-triggered text animation — animations on containers/sections only
- **Mobile scroll:** Claude's discretion — simplify for Lighthouse 90+ if needed
- **Sticky type:** Claude's discretion — CSS sticky vs scroll snap
- **Custom scrollbar:** Yes — thin dark track with pink thumb (desktop)
- **Scroll progress indicator:** Claude's discretion
- **Back-to-top button:** No
- **Brutalist inspiration:** No specific references — Claude finds the right aesthetic for acroyoga community

### Pages to polish
- **Homepage:** Full brutalist treatment (hero, sections, CTAs, all scroll effects)
- **City landing pages:** Tel Aviv + Kfar Saba — brutalist design matching homepage
- **Quiz flow pages:** Challenge quiz + results — conversion-critical
- **Auth pages:** Login/signup — first impression for new users
- **Header/nav:** Yes, redesign — bolder, more distinctive brutalist styling
- **Footer:** Yes, brutalist footer — brand elements, social links, navigation
- **Mobile hamburger menu:** Standard dropdown — no special animation

### Performance & accessibility
- **Lighthouse 90+ mobile:** NON-NEGOTIABLE — cut animations that hurt performance
- **Reduced motion:** Claude's discretion (WCAG-compliant approach)
- **Image optimization:** Yes — next/image with WebP, blur placeholders, lazy loading throughout
- **Animation engine:** Claude's discretion (CSS for simple, Framer for complex)
- **Font preloading:** Claude's discretion — check current setup and optimize
- **3rd party scripts:** Already deferred (afterInteractive) — no changes needed
- **Performance budget:** Claude's discretion — set reasonable limits
- **WCAG AA checks:** Automated with @axe-core/playwright — catch contrast/a11y issues

### Google Stitch workflow
- **Role:** Strict — generate Stitch screen previews → export HTML → executors MUST match colors, spacing, typography, layout exactly
- **MCP config:** `npx stitch-mcp` with project `glassy-chalice-427116-e6`, service account at `C:/Users/somet/tennis/service-account.json`
- **Workflow:** Generate designs in Stitch → save as preview HTML → plans reference specific screen IDs → executors implement matching the preview

### Claude's Discretion
- Draggable element choice and placement
- Horizontal scroll content
- Mobile scroll simplification strategy
- Sticky section approach (CSS sticky vs scroll snap)
- Scroll progress indicator (yes/no)
- Reduced motion implementation
- Animation engine split (CSS vs Framer)
- Font optimization approach
- Performance budget numbers
- Specific brutalist design aesthetic decisions

</decisions>

<specifics>
## Specific Ideas

- Magnetic buttons should feel subtle but noticeable — not cartoonish, just enough to delight
- Card hovers should be dramatic — scale, glow, shadow — make everything feel alive
- Button press animation with scale-down gives tactile feedback
- Pink glow on form focus is consistent with the hot pink brand
- Custom pink scrollbar is a small touch that reinforces the brand even in scroll behavior
- Stitch workflow is strict: generate HTML previews and match them pixel-perfect

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-brutalist-design-polish-performance*
*Context gathered: 2026-04-04*

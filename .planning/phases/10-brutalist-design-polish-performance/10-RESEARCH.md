# Phase 10: Brutalist Design Polish + Performance - Research

**Researched:** 2026-04-01
**Domain:** Framer Motion scroll animations, CSS interactions, Lighthouse performance, WCAG accessibility, Google Stitch MCP
**Confidence:** HIGH (core stack verified via Context7 + official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Cursor effects & interactions
- **Magnetic buttons:** Yes — buttons/links pull slightly toward cursor on hover (desktop only)
- **Draggable elements:** Claude's discretion — pick the best draggable element for brutalist aesthetic
- **Sound effects:** No sounds — visual-only interactions
- **Hover effects on cards:** Dramatic — scale up, pink glow border, shadow lift
- **Page transitions:** No page transitions — instant navigation
- **Button press animation:** Yes, scale down on press — tactile feel, bounce back
- **Loading animations:** Keep existing — don't change current loading states
- **Form input focus:** Pink glow border on focus — animated, consistent with brand
- **Toggle switches:** Keep current — no changes

#### Scroll behavior & animations
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

#### Pages to polish
- **Homepage:** Full brutalist treatment (hero, sections, CTAs, all scroll effects)
- **City landing pages:** Tel Aviv + Kfar Saba — brutalist design matching homepage
- **Quiz flow pages:** Challenge quiz + results — conversion-critical
- **Auth pages:** Login/signup — first impression for new users
- **Header/nav:** Yes, redesign — bolder, more distinctive brutalist styling
- **Footer:** Yes, brutalist footer — brand elements, social links, navigation
- **Mobile hamburger menu:** Standard dropdown — no special animation

#### Performance & accessibility
- **Lighthouse 90+ mobile:** NON-NEGOTIABLE — cut animations that hurt performance
- **Reduced motion:** Claude's discretion (WCAG-compliant approach)
- **Image optimization:** Yes — next/image with WebP, blur placeholders, lazy loading throughout
- **Animation engine:** Claude's discretion (CSS for simple, Framer for complex)
- **Font preloading:** Claude's discretion — check current setup and optimize
- **3rd party scripts:** Already deferred (afterInteractive) — no changes needed
- **Performance budget:** Claude's discretion — set reasonable limits
- **WCAG AA checks:** Automated with @axe-core/playwright — catch contrast/a11y issues

#### Google Stitch workflow
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 10 polishes the AcroHavura platform with brutalist interactive design. The existing stack (Framer Motion 12.38.0, Next.js 16.2.1, React 19, Tailwind v4) already contains everything needed — no new dependencies required except `@axe-core/playwright` and `@playwright/test` for automated accessibility testing.

The most critical technical constraint is the Lighthouse 90+ mobile non-negotiable. This shapes every decision: prefer `whileInView` over `useScroll` for simple reveals, use `transform`/`opacity`-only animations (compositor-safe), disable parallax and horizontal scroll effects on mobile, and wrap all Framer Motion usage in `MotionConfig reducedMotion="user"` for WCAG 2.3.3 compliance. The ScrollTimeline API (used by Framer Motion 12 for hardware acceleration) is supported in Chrome/Edge but not fully in Safari/Firefox as of 2025 — Framer Motion falls back gracefully.

The Google Stitch MCP is already configured in `.mcp.json` with project `glassy-chalice-427116-e6` and service account credentials. The workflow is: executor calls `get_screen_code` or `build_site` MCP tool → receives HTML → implements matching exactly. The planner must generate Stitch screens for each target page before writing implementation tasks.

**Primary recommendation:** Use Framer Motion 12 for complex effects (magnetic buttons, horizontal scroll, parallax), pure CSS Tailwind transitions for card hovers and button press (no JS overhead), `MotionConfig reducedMotion="user"` at layout level, and `@axe-core/playwright` for CI accessibility gates.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 | Scroll animations, magnetic buttons, reveal effects | Hardware-accelerated via ScrollTimeline API; already in project |
| next | 16.2.1 | `next/image` for image optimization | `priority` deprecated in v16, use `preload` prop instead |
| tailwindcss | 4.x | CSS transitions for hovers, scrollbar, button press | Zero JS, compositor-safe, Tailwind v4 CSS-first config |
| react | 19.2.4 | All components | Already installed |

### New Dependencies (to install)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @axe-core/playwright | ^4.x | WCAG AA automated testing | All accessibility test specs |
| @playwright/test | ^1.x | Test runner for axe | Required peer dep for axe integration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion useScroll (parallax) | CSS scroll-driven `animation-timeline: scroll()` | Native CSS is faster but Safari support incomplete in 2025; Framer already in bundle |
| Framer Motion card hovers | Tailwind CSS `hover:scale-105 hover:shadow-lg` | Pure CSS is better for card hovers — no JS needed, saves bundle, compositor-safe |
| Custom magnetic button logic | Motion+ Cursor library | Adds dependency; the pattern is simple enough to implement inline |

**Installation:**
```bash
cd C:/acroyoga-academy
npm install @axe-core/playwright @playwright/test --save-dev
```

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Redesign — brutalist bold nav
│   │   └── Footer.tsx           # New — brutalist footer
│   ├── effects/
│   │   ├── MagneticWrapper.tsx  # Desktop-only magnetic button wrapper
│   │   ├── ScrollReveal.tsx     # whileInView reveal container
│   │   └── ParallaxLayer.tsx    # useScroll + useTransform parallax
│   └── home/
│       ├── HeroSection.tsx      # Homepage hero (parallax bg)
│       ├── HorizontalScroll.tsx # Sticky horizontal scroll section
│       └── [other sections]
├── app/globals.css              # Custom scrollbar + brutalist base styles
tests/
└── a11y/
    ├── homepage.spec.ts         # axe WCAG AA scan
    ├── city.spec.ts
    └── quiz.spec.ts
```

### Pattern 1: Scroll Reveal with whileInView (preferred for reveals)
**What:** Fades/slides sections into view when entering viewport
**When to use:** All "reveal on scroll" sections — simpler and more performant than useScroll
**Note:** Use `viewport={{ once: true }}` to avoid re-triggering on scroll back

```typescript
// Source: https://motion.dev/docs/react-scroll-animations
"use client";
import { motion } from "framer-motion";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 2: Horizontal Scroll Section (sticky + useScroll)
**What:** Vertical scroll drives horizontal content translation via sticky container
**When to use:** The single horizontal scroll section on the homepage
**Mobile:** Disable on mobile (render as vertical stack or simple carousel)

```typescript
// Source: https://motion.dev/docs/react-scroll-animations (horizontal scroll pattern)
"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HorizontalScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // Maps scroll 0→1 to x translation 0 → -(totalWidth - viewportWidth)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    // Tall outer container — controls scroll distance (300vh = slower feel)
    <div ref={containerRef} className="relative h-[300vh]">
      {/* Sticky wrapper — holds content in viewport during scroll */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full items-center gap-8">
          {/* Cards/items go here */}
        </motion.div>
      </div>
    </div>
  );
}
```

### Pattern 3: Parallax Background Layer
**What:** Background elements translate slower than foreground on scroll
**When to use:** Homepage hero background layers

```typescript
// Source: https://motion.dev/docs/react-use-scroll + useTransform docs
"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Background moves at 40% of scroll speed (parallax depth)
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        {/* Background image/gradient */}
      </motion.div>
      {/* Foreground content */}
    </div>
  );
}
```

### Pattern 4: Magnetic Button Wrapper (desktop only)
**What:** Button translates toward cursor based on proximity
**When to use:** Primary CTAs and nav links on desktop

```typescript
// Source: https://blog.olivierlarose.com/tutorials/magnetic-button (verified pattern)
"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // 0.25 = subtle, 0.5 = strong
}

export function MagneticWrapper({ children, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Desktop-only: mousemove handler
  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={position}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 5: MotionConfig at Layout Level (prefers-reduced-motion)
**What:** Wraps entire app to automatically respect OS reduced motion preference
**When to use:** Root layout — apply once, covers everything

```typescript
// Source: https://motion.dev/docs/react-accessibility
// In src/app/[locale]/layout.tsx or public layout
import { MotionConfig } from "framer-motion";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

**What `reducedMotion="user"` does:** Automatically disables transform and layout animations while preserving opacity and color transitions when OS reduced motion is enabled.

### Pattern 6: Card Hover (pure CSS Tailwind — no JS)
**What:** Scale up + pink glow + shadow lift on hover
**When to use:** All card components — CSS is faster and compositor-safe

```css
/* In Tailwind v4 CSS-first approach — add to component or globals.css */
.card-hover {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card-hover:hover {
  transform: scale(1.03);
  box-shadow: 0 0 0 1px theme(--color-brand), 0 20px 40px rgba(244, 114, 182, 0.2);
}
```

Or Tailwind utility classes:
```tsx
<div className="transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_0_0_1px_#F472B6,0_20px_40px_rgba(244,114,182,0.2)]">
```

### Pattern 7: Custom Pink Scrollbar (desktop only)
**What:** Thin dark track with pink thumb, hidden on mobile
**When to use:** globals.css — applies globally

```css
/* In src/app/globals.css */

/* WebKit (Chrome, Edge, Safari) */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
}
::-webkit-scrollbar-thumb {
  background: #F472B6;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #DB2777;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #F472B6 #1a1a1a;
}

/* Hide on mobile */
@media (max-width: 768px) {
  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; }
}
```

### Pattern 8: next/image with preload (Next.js 16)
**What:** Image optimization with LCP preload, blur placeholder, sizes
**Note:** `priority` prop is deprecated in Next.js 16 — use `preload` instead

```tsx
// Source: Next.js 16 docs — priority → preload migration
import Image from "next/image";

// Hero image (LCP) — use preload prop (priority is deprecated in v16)
<Image
  src="/hero.jpg"
  alt="AcroYoga session"
  fill
  sizes="100vw"
  quality={90}
  preload={true}          // replaces deprecated priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // keep small — large hurts perf
  className="object-cover"
/>

// Regular images — lazy load (default)
<Image
  src="/photo.jpg"
  alt="..."
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={75}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Pattern 9: @axe-core/playwright WCAG AA Test
**What:** Automated accessibility scan on each public page
**When to use:** CI gate — fail build if violations detected

```typescript
// Source: https://playwright.dev/docs/accessibility-testing
// tests/a11y/homepage.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage accessibility", () => {
  test("should pass WCAG AA", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

### Pattern 10: Google Stitch MCP Workflow
**What:** Generate screen designs in Stitch, export HTML, implement pixel-perfect
**How it works:** MCP server exposes `get_screen_code`, `build_site`, `get_screen_image` tools

**Workflow for each screen:**
1. Call Stitch MCP `list_screens` (or `screens` CLI: `npx stitch-mcp screens -p glassy-chalice-427116-e6`) to see available screens
2. Call `get_screen_code` with screenId → returns HTML with exact colors, typography, layout
3. Reference the screen HTML in the PLAN task: executor MUST match pixel-perfect
4. For multi-page: use `build_site` with routes array

**MCP tools available (from official stitch-mcp GitHub):**
- `build_site` — builds full site HTML from project (params: `projectId`, `routes[]`)
- `get_screen_code` — fetches single screen HTML (params: `screenId`)
- `get_screen_image` — fetches screenshot as base64 (params: `screenId`)

**Design tokens already confirmed in codebase:**
- Background: `#0a0a0a` (`--background`)
- Brand pink: `#F472B6` (`--brand`)
- Brand muted: `#DB2777` (`--brand-muted`)
- Font: Heebo 900 (supports Hebrew + Latin)

### Anti-Patterns to Avoid
- **Animating non-compositor properties on scroll:** Never animate `width`, `height`, `top`, `left`, `padding` via useScroll — only `transform` and `opacity`. Everything else triggers layout recalculation, destroying Lighthouse score.
- **useScroll on every section:** Use `whileInView` for simple reveal animations. `useScroll` should only be used for the parallax hero and horizontal scroll section.
- **Magnetic buttons on touch devices:** The `onMouseMove` handler is mouse-only. Mobile users get no magnetic effect — this is correct behavior. Never activate on `touchmove`.
- **Large blurDataURL strings:** Keep base64 blur placeholders under 500 bytes. Large strings are included in the HTML payload and hurt performance.
- **Applying `will-change: transform` globally:** Use only on elements actively animating. Over-use promotes every layer to GPU memory and can cause mobile frame drops.
- **priority prop on Next.js 16:** `priority` is deprecated — use `preload={true}` for LCP images.
- **Skipping `viewport={{ once: true }}`:** Without this, scroll reveals re-fire when scrolling back up, causing janky re-animations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Magnetic button spring physics | Custom lerp animation loop | Framer Motion `animate` + spring transition | Spring physics is complex; FM handles RAF, interruptions, cleanup |
| Scroll progress tracking | Manual scroll event listener | `useScroll` hook | FM uses ScrollTimeline API for hardware acceleration |
| Horizontal parallax mapping | Manual scroll math | `useTransform` with input/output ranges | Handles edge cases, clamping, multiple ranges |
| WCAG violation detection | Manual contrast checking | `@axe-core/playwright` | Catches 57% of WCAG issues; contrast, ARIA, keyboard nav |
| Cross-browser scrollbar | Browser-detect logic | Combined `::-webkit-scrollbar` + `scrollbar-color` | Two CSS blocks cover all modern browsers |
| Reduced motion logic | Custom media query hook | `MotionConfig reducedMotion="user"` | One prop on provider; no per-component logic needed |

**Key insight:** Framer Motion 12 already handles ScrollTimeline hardware acceleration, spring physics interruptions, and RAF cleanup — building any of this custom will be slower and buggier.

---

## Common Pitfalls

### Pitfall 1: Horizontal Scroll Breaking on Mobile
**What goes wrong:** The sticky + tall container pattern requires a fixed viewport height. On mobile, dynamic viewport height (100dvh vs 100vh) causes the sticky section to miscalculate scroll distance.
**Why it happens:** Mobile browsers have dynamic UI (address bar shrinks/expands), changing viewport height during scroll.
**How to avoid:** Either disable the horizontal scroll section on mobile entirely (show vertical stack instead) or use `100dvh` (dynamic viewport height) in the sticky container.
**Warning signs:** Horizontal section works on desktop but scrolls past end or snaps incorrectly on mobile.

### Pitfall 2: Lighthouse CLS from Images Without Dimensions
**What goes wrong:** Images without explicit `width`/`height` or without `fill` + sized container cause Cumulative Layout Shift, tanking CLS score.
**Why it happens:** Browser doesn't know image dimensions until loaded; page reflows on load.
**How to avoid:** Always provide `width`/`height` on `<Image>` or use `fill` mode with a sized parent container. Use `sizes` prop for responsive images.
**Warning signs:** Lighthouse CLS > 0.1; content jumps when page loads.

### Pitfall 3: Framer Motion Server Component Mismatch
**What goes wrong:** Using `motion.*` components in React Server Components throws "ReactDOM.createPortal is not a function" or hydration errors.
**Why it happens:** Framer Motion requires client-side APIs. Next.js App Router defaults to server components.
**How to avoid:** Every file using Framer Motion must have `"use client"` directive at the top. The scroll effect components (ParallaxLayer, HorizontalScroll, MagneticWrapper) are all client components.
**Warning signs:** Build error mentioning `useRef` or motion values in server context.

### Pitfall 4: axe-core False Positives on Dark Theme
**What goes wrong:** axe reports contrast violations on elements that are visually fine because it reads computed color incorrectly with CSS variables.
**Why it happens:** axe-core has limited support for CSS custom properties in some rule checks — it may read `var(--background)` as transparent.
**How to avoid:** Run axe tests against built/running app (not static HTML). If genuine false positive, use `.disableRules(['color-contrast'])` temporarily and add a comment explaining manual verification.
**Warning signs:** axe reports contrast fail on elements that pass WCAG AA when checked manually.

### Pitfall 5: `priority` Prop Deprecated in Next.js 16
**What goes wrong:** Using `priority={true}` on `<Image>` in Next.js 16 causes a deprecation warning and may behave differently than expected.
**Why it happens:** Next.js 16 changed the LCP preload API — `priority` was ambiguous about what exactly it preloaded.
**How to avoid:** Use `preload={true}` on hero/LCP images instead of `priority={true}`.
**Warning signs:** Console warning about deprecated `priority` prop in Next.js 16.

### Pitfall 6: Magnetic Effect Causing Layout Shift
**What goes wrong:** MagneticWrapper uses `motion.div` with `position: relative` but the parent container doesn't account for the translate offset, causing overflow clipping.
**Why it happens:** `animate={{ x, y }}` translates the element but doesn't affect document flow — adjacent elements don't move.
**How to avoid:** Ensure the MagneticWrapper's parent has `overflow: visible` and enough padding to accommodate the max translation distance.
**Warning signs:** Magnetic button clips at container edge or causes neighboring elements to jump.

### Pitfall 7: Stitch-Generated HTML Not Matching RTL Layout
**What goes wrong:** Google Stitch generates LTR HTML; AcroHavura uses Hebrew (RTL). Direct copy-paste breaks layout.
**Why it happens:** Stitch doesn't know about `dir="rtl"` or Hebrew text flow.
**How to avoid:** Use Stitch for color, spacing, and visual design reference only. The executor must adapt all flex/grid directions, text alignment, and spacing to RTL when implementing.
**Warning signs:** Elements appear mirror-flipped compared to Stitch preview.

---

## Code Examples

### Horizontal Scroll — Complete Pattern
```typescript
// Source: https://motion.dev/docs/react-scroll-animations
// Disable on mobile for Lighthouse compliance
"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ITEMS = ["Acrobatics", "Community", "Trust", "Flow", "Play"];

export function HorizontalScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    // Tall container = scroll distance. 400vh = slow, cinematic feel
    <section ref={containerRef} className="relative h-[400vh] hidden md:block">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div style={{ x }} className="flex gap-12 pl-8">
          {ITEMS.map((item) => (
            <div key={item} className="w-[80vw] h-[70vh] flex-shrink-0 ...">
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

### Button Press Scale Animation (pure CSS)
```tsx
// Tailwind v4 — scale down on press, bounce back
<button className="
  transition-transform duration-100 ease-in
  active:scale-95 active:duration-75
  hover:scale-105
">
  Join Jam
</button>
```

### Form Focus Pink Glow
```tsx
// globals.css or component CSS
input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #F472B6, 0 0 12px rgba(244, 114, 182, 0.3);
  transition: box-shadow 200ms ease;
}
```

Or Tailwind classes:
```tsx
<input className="focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:shadow-[0_0_12px_rgba(244,114,182,0.3)] transition-shadow duration-200" />
```

### Playwright Config for axe Tests
```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

### Performance Budget Reference (Lighthouse 90+)
Based on research findings, these thresholds maintain Lighthouse 90+ mobile:
- LCP: < 2.5s
- CLS: < 0.1
- FCP: < 1.8s
- TBT: < 200ms
- Image quality: hero=90, general=75, thumbnails=60
- Avoid animating: width, height, top, left, padding, margin (triggers layout)
- Safe to animate: transform (x, y, scale, rotate), opacity, filter (GPU composited)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `priority={true}` on next/image | `preload={true}` | Next.js 16 | Deprecation warning if using old prop |
| Manual scroll event listeners | `useScroll` + ScrollTimeline API | Framer Motion 11+ | Hardware acceleration in Chrome/Edge |
| Per-component prefers-reduced-motion hook | `MotionConfig reducedMotion="user"` | Framer Motion 7+ | One provider covers all motion components |
| Custom LQIP blur generation | `placeholder="blur"` with `blurDataURL` auto-gen for local images | Next.js 13+ | Static imports auto-generate blur; remote needs manual base64 |
| Firefox-only `scrollbar-color` | Both `::-webkit-scrollbar` + `scrollbar-color` combined | 2023 (global 86% support) | Cross-browser custom scrollbars without JS |
| `@framer-motion` package | `framer-motion` or `motion` package | Framer Motion 11 | Renamed to `motion` on npm; `framer-motion` still works as alias |

**Deprecated/outdated:**
- `priority` prop on `<Image>`: deprecated in Next.js 16, use `preload={true}`
- `useViewportScroll`: renamed to `useScroll` in Framer Motion 9+
- `AnimatePresence` for page transitions: user explicitly rejected page transitions — do not use

---

## Open Questions

1. **Stitch screen IDs for each target page**
   - What we know: Stitch MCP is configured and tools are available (`get_screen_code`, `build_site`)
   - What's unclear: No screens have been generated yet for Phase 10 targets (homepage redesign, city pages, quiz, auth, header, footer)
   - Recommendation: Planner must include a Stitch design generation task as the FIRST task in Phase 10 before any implementation tasks

2. **Horizontal scroll content selection**
   - What we know: Claude's discretion for content; homepage has jams/cities/testimonials as candidates
   - What's unclear: Which content most benefits from horizontal reveal treatment in brutalist aesthetic
   - Recommendation: Use "brutalist features showcase" — 4-5 cards showing unique platform values (community, flyers, cities, trust badges), each ~80vw wide with heavy typography

3. **Scroll progress indicator**
   - What we know: Claude's discretion
   - What's unclear: Whether thin progress bar at top aids UX on long homepage
   - Recommendation: Include a thin 2px pink progress bar at top of viewport on homepage only — reinforces brand, low implementation cost, does not affect Lighthouse

4. **CSS scroll-driven animations (animation-timeline) browser support**
   - What we know: Chrome/Edge fully support; Safari partial; Firefox has gaps as of 2025
   - What's unclear: Exact Safari version where view() is stable
   - Recommendation: Do not use native CSS scroll-driven animations. Use Framer Motion exclusively for scroll effects — it's already in the bundle and falls back gracefully.

5. **Existing Playwright setup**
   - What we know: No `tests/` directory or `playwright.config.ts` exists in the project
   - What's unclear: Whether Playwright is already installed as a dev dep
   - Recommendation: Install from scratch — `npm install @playwright/test @axe-core/playwright --save-dev` then `npx playwright install chromium`

---

## Sources

### Primary (HIGH confidence)
- https://motion.dev/motion/use-scroll/ — useScroll API, offset, target, ScrollTimeline hardware acceleration
- https://motion.dev/docs/react-scroll-animations — horizontal scroll pattern, parallax, whileInView vs useScroll
- https://motion.dev/docs/react-accessibility — MotionConfig reducedMotion="user", useReducedMotion hook
- https://playwright.dev/docs/accessibility-testing — @axe-core/playwright API, withTags, analyze, violation assertions
- https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md — installation, AxeBuilder API
- https://github.com/davideast/stitch-mcp — build_site, get_screen_code, get_screen_image tool specs
- C:/acroyoga-academy/src/app/globals.css — confirmed design tokens (#0a0a0a, #F472B6, Heebo)
- C:/acroyoga-academy/package.json — confirmed framer-motion@12.38.0, next@16.2.1, no existing playwright
- C:/Users/somet/.mcp.json — confirmed stitch MCP config: project glassy-chalice-427116-e6

### Secondary (MEDIUM confidence)
- https://blog.olivierlarose.com/tutorials/magnetic-button — Framer Motion magnetic button implementation (verified against FM docs)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scrollbars_styling — cross-browser scrollbar CSS (MDN official)
- https://www.stefanjudis.com/snippets/how-to-color-the-browser-scrollbar-across-browsers/ — combined webkit + scrollbar-color approach
- Next.js 16 `preload` prop replacing `priority` — found in multiple Next.js 16 optimization guides

### Tertiary (LOW confidence — flag for validation)
- Lighthouse 90+ thresholds (LCP <2.5s, CLS <0.1) — widely cited but verify against actual project measurements
- CSS scroll-driven animation Safari support status — changes rapidly; verify at caniuse.com before using

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from package.json + official docs
- Architecture patterns: HIGH — patterns verified against official motion.dev docs + official Playwright docs
- Magnetic button code: HIGH — verified against Olivier Larose tutorial + confirmed against FM API docs
- Stitch MCP tools: HIGH — confirmed from GitHub README
- Next.js 16 preload vs priority: MEDIUM — found in multiple guides but Next.js docs page was unreachable; cross-referenced with multiple sources
- CSS scrollbar cross-browser: HIGH — MDN official documentation
- Pitfalls: MEDIUM — some from official docs, some from community patterns (Lighthouse numbers, RTL Stitch caveat)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Framer Motion, Next.js release cadence is moderate; CSS browser support evolves)

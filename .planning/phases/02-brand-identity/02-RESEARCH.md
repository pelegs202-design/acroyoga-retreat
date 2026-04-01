# Phase 2: Brand Identity - Research

**Researched:** 2026-04-01
**Domain:** Brand naming + Tailwind v4 design tokens + Next.js App Router metadata + i18n string migration
**Confidence:** HIGH (codebase fully audited; Tailwind v4 docs fetched from official source)

---

## Summary

Phase 2 has two distinct workstreams: (1) naming decision — selecting the brand name that replaces
"AcroYoga Academy" — and (2) technical propagation — applying that name and its visual identity
tokens consistently across every surface in the codebase.

The naming decision cannot be automated. It requires the product owner to choose a name that works
in Hebrew, transliterates reasonably into English, is not already taken in the Israeli acroyoga
space, and aligns with the brutalist-but-energetic design direction. The research below provides a
structured framework for making and documenting that decision, plus the complete technical map of
every file that must be updated once the name is chosen.

The technical implementation is straightforward: Tailwind v4's `@theme` block in `globals.css` is
the single source of truth for all design tokens — colors, typography scale, spacing. Next.js 16
App Router metadata fields are the single source of truth for the `<title>` and `<meta>` tags.
The i18n strings in `messages/en.json` and `messages/he.json` drive every user-visible text
reference. Once those three layers are updated, the rename is complete except for icon assets.

**Primary recommendation:** Decide the name first as a planning step (or document it as a
planner-owned decision). Then one task per surface: tokens in CSS, metadata in layouts, i18n
strings, auth.ts email copy, PWA manifest + icons, and the offline page (which uses inline styles
and hardcoded text).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRAND-01 | Develop new brand name (replacing AcroRetreat) | Naming framework section below. Full technical rename surface documented. Token system (globals.css @theme) is the correct implementation point for visual identity. |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no installs needed)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Tailwind CSS v4 | ^4.x | Design token system via `@theme` | CSS-first config — no tailwind.config.js |
| Next.js App Router | 16.2.1 | `Metadata` export for title/description/og | Per-layout metadata merging |
| next-intl | ^4.8.4 | `messages/en.json` + `messages/he.json` drive all UI text | App Router server/client providers already wired |
| Heebo (next/font/google) | n/a | Hebrew + Latin typography already loaded | subsets: ["latin","hebrew"], variable `--font-heebo` |

### Supporting

| Tool | Purpose | Notes |
|------|---------|-------|
| Resend | Transactional email from-address includes brand name | `src/lib/auth.ts` line 14 and 32 |
| Serwist / PWA manifest | `src/app/manifest.ts` name + short_name | Governs app title when installed to home screen |
| Public icons | `/public/icon-192x192.png` + `/public/icon-512x512.png` | Placeholder Next.js icons — must be replaced with branded assets |

### No Additional Installs Required

Brand identity in this stack is pure CSS custom properties + JSON strings + static assets. There
is no brand/theming library to install.

---

## Architecture Patterns

### Tailwind v4 Token Pattern (verified from tailwindcss.com/docs/theme)

Tailwind v4 uses a CSS-first config system. Design tokens are declared with `@theme` in the
global CSS file — **not** in a `tailwind.config.js`. Tokens in `@theme` automatically generate
utility classes (`bg-brand-500`, `text-brand-primary`, etc.) AND expose CSS custom properties
(`var(--color-brand-500)`).

The project already uses `@theme inline` in `src/app/globals.css`:

```css
/* Current state — src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-heebo), ui-sans-serif, system-ui, ...;
}
```

The correct pattern for adding brand color tokens extends this block:

```css
/* Target state after Phase 2 */
@import "tailwindcss";

:root {
  --background: #0a0a0a;         /* dark-first: the app is always dark */
  --foreground: #ededed;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Brand accent — ONE primary color, ONE on-primary */
  --color-brand: oklch(0.72 0.22 [HUE]);       /* fill with chosen color */
  --color-brand-foreground: oklch(0.05 0 0);   /* near-black for contrast */

  /* Typography tokens */
  --font-sans: var(--font-heebo), ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", monospace;
}
```

Key Tailwind v4 rules:
- `@theme` creates both CSS vars AND utility classes.
- `@theme inline` (used for font alias) means the utility class embeds the value, not a `var()`.
- To reset an entire namespace: `--color-*: initial;` before listing new values.
- Don't use `:root` for tokens that should generate utilities — those go in `@theme`.
- Source: https://tailwindcss.com/docs/theme

### Next.js App Router Metadata Pattern

Two layout files export `metadata`:

```
src/app/layout.tsx             ← root layout, minimal wrapper
src/app/[locale]/layout.tsx    ← locale layout, also exports metadata
```

Both currently have `title: "AcroYoga Academy"`. The correct pattern is to update both. For
per-page titles, use the `template` pattern:

```typescript
// src/app/[locale]/layout.tsx — target state
export const metadata: Metadata = {
  title: {
    default: "[NewBrandName]",
    template: "%s | [NewBrandName]",
  },
  description: "...",
};
```

### next-intl String Pattern

All user-visible text routes through `messages/en.json` and `messages/he.json`. The brand name
key is `common.appName`. The component that uses it is:

```typescript
// src/components/layout/Header.tsx
const t = useTranslations("common");
<span>{t("appName")}</span>
```

The TOS content sections also inline the brand name (3 occurrences in each locale file). These
must be updated as prose replacements, not just key renames.

### PWA Manifest Pattern

`src/app/manifest.ts` uses the Next.js `MetadataRoute.Manifest` type. `name` is the full
display name; `short_name` is the home-screen label (max ~12 chars to avoid truncation on iOS):

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "[NewBrandName]",
    short_name: "[Short]",        // ≤12 chars recommended
    theme_color: "#0a0a0a",       // already correct for dark brutalist
    background_color: "#0a0a0a",  // already correct
    ...
  };
}
```

---

## Complete Rename Surface (Audit)

Every location in the codebase that contains "AcroYoga Academy", "AcroAcademy", or the Hebrew
equivalent "אקדמיית אקרויוגה":

| File | Type | Occurrences | Notes |
|------|------|-------------|-------|
| `messages/en.json` | i18n strings | 4 | `common.appName`, `home.title`, `tosContent.intro.heading`, `tosContent.intro.body` |
| `messages/he.json` | i18n strings | 4 | Same keys in Hebrew |
| `src/app/layout.tsx` | Next.js metadata | 1 | `metadata.title` |
| `src/app/[locale]/layout.tsx` | Next.js metadata | 1 | `metadata.title` |
| `src/app/manifest.ts` | PWA manifest | 2 | `name` + `short_name` ("AcroAcademy") |
| `src/app/~offline/page.tsx` | Inline HTML/JSX | 2 | `<title>` tag + visible `<div>` text (hardcoded, not i18n) |
| `src/components/pwa/InstallPrompt.tsx` | Inline JSX | 1 | Hardcoded "Install AcroYoga Academy" in `<p>` |
| `src/lib/auth.ts` | Email copy | 2 | `FROM_EMAIL` default value + email subject line |
| `public/icon-192x192.png` | Binary asset | — | Placeholder Next.js icon, must be replaced |
| `public/icon-512x512.png` | Binary asset | — | Placeholder Next.js icon, must be replaced |

**Not needing updates:**
- `.planning/` files — historical docs, no need to retroactively rename
- `drizzle/` schema — no brand references
- `src/lib/db/` — no brand references
- `next.config.ts` — no brand references

**Note on `~offline/page.tsx` and `InstallPrompt.tsx`:** These components use inline styles and
hardcoded strings rather than i18n, because the offline page must work without JS/Next.js
hydration and the install prompt predates i18n integration. The rename task must update them
directly. Consider moving `InstallPrompt.tsx` text to i18n as part of this phase.

---

## Naming Decision Framework

This is the core creative/strategic deliverable of BRAND-01. No technical tool can make this
decision; it must be made by the product owner (or delegated to the planner).

### Constraints the name must satisfy

1. **Works in Hebrew** — must be writable in Hebrew script, pronounceable by native speakers,
   and feel natural (not a forced transliteration of a weak English name).
2. **Short enough for PWA short_name** — ≤12 characters in display (the short version, not full
   name) to avoid iOS home screen truncation.
3. **Not already taken** — check: acroyoga IL Facebook/Instagram landscape, .co.il domain
   availability (the domain acroretreat.co.il already belongs to the owner — subdomain or rename
   is possible), App Store / Play Store name search.
4. **Fits the brutalist visual direction** — blunt, energetic, not soft/spa/wellness. The name
   should feel physical and direct.
5. **Differentiates from existing Israeli AcroYoga Academy (TLV Facebook page)** — the name
   "AcroYoga Academy" is already used by a Tel Aviv group; the new name must be distinct.

### Direction categories worth evaluating

| Direction | Hebrew example | Notes |
|-----------|---------------|-------|
| Verb/action (what practitioners do) | "שיווי משקל" (balance), "לעוף" (to fly) | Energetic, direct |
| Community noun | "מעגל" (circle/gathering), "חבורה" (crew/group) | Warm, inclusive |
| Body/physicality | "כוח" (strength/force), "גוף" (body) | Blunt, brutalist-aligned |
| Hebrew portmanteau | Combine acro-relevant concept | Could be distinctive; risk of feeling artificial |
| Domain-first naming | Keep acroretreat.co.il, brand as "AcroRetreat IL" or similar | Minimizes domain work; still moves away from "Academy" framing |

### What the planner should document before planning tasks

The PLAN.md for BRAND-01 should record:
- The chosen brand name (English)
- The chosen brand name (Hebrew)
- The short_name (≤12 chars)
- The primary brand color (oklch value or hex)
- Whether a logotype/wordmark is needed for Phase 2 or deferred
- Whether new icon assets are being generated or placeholder icons are acceptable for now

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS design tokens | Custom CSS var system | Tailwind v4 `@theme` | Already in project; generates utilities automatically |
| Font loading | Manual `@font-face` | `next/font/google` with Heebo | Already wired; handles preloading, CLS prevention, variable injection |
| i18n string management | Scattered string constants | `messages/*.json` + `useTranslations()` | Already wired for both locales |
| Icon generation | Hand-design in code | Real PNG assets (192x192, 512x512) | PWA icons must be actual raster assets; SVG icons are separate from PWA icons |

**Key insight:** The infrastructure for all of this already exists from Phase 1. Phase 2 is
configuration and asset replacement — not new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Updating i18n keys but missing hardcoded strings

**What goes wrong:** Developer updates `messages/en.json` and `messages/he.json` but misses the
two components that hardcode the brand name: `src/app/~offline/page.tsx` and
`src/components/pwa/InstallPrompt.tsx`.

**Why it happens:** These components intentionally bypass i18n for technical reasons (offline
page must work without Next.js; install prompt was built quickly). Easy to forget in a grep.

**How to avoid:** Verification step should grep for the old name string AND the literal text
"AcroYoga" / "AcroAcademy" across the entire `src/` directory, not just `messages/`.

**Warning signs:** App install prompt or offline page still shows old name after rename.

### Pitfall 2: short_name truncation on iOS

**What goes wrong:** `short_name` in `manifest.ts` is set to a string longer than 12 characters.
iOS truncates it with an ellipsis under the home screen icon, making the app look broken.

**Why it happens:** Developer focuses on the full `name` field and picks a descriptive
`short_name` without counting characters.

**How to avoid:** Keep `short_name` to ≤12 characters. Test by adding to iOS home screen in
Safari. If the brand name is longer, abbreviate (e.g. "AcroAcademy" = 11 chars ✓).

### Pitfall 3: Dark theme color mismatch in brand tokens

**What goes wrong:** Brand color is chosen and looks good on a white background, then fails
contrast checks on the dark `neutral-950` / `#0a0a0a` background actually used by the app.

**Why it happens:** Color is designed or previewed in a light-mode tool.

**How to avoid:** All color choices must be validated against `#0a0a0a` background. Use oklch
color space for consistent perceptual brightness. Minimum 4.5:1 contrast ratio (WCAG AA). The
existing neutral palette (neutral-100 text on neutral-950 background) already passes — brand
accent only needs to pass when used as interactive element text or icon color.

### Pitfall 4: Forgetting the email from-address in auth.ts

**What goes wrong:** All visible UI is updated but the password-reset email still comes from
"AcroYoga Academy <noreply@acro.academy>".

**Why it happens:** `src/lib/auth.ts` is not a UI file and is easy to skip in a rename sweep.

**How to avoid:** Include `src/lib/auth.ts` explicitly in the rename task checklist.

### Pitfall 5: `@theme inline` vs plain `@theme` confusion

**What goes wrong:** Developer adds brand color tokens inside the existing `@theme inline` block.
The `inline` modifier makes Tailwind embed variable values directly in utilities rather than
referencing the CSS variable. This breaks dark mode toggling if the color value is conditional.

**Why it happens:** `globals.css` already has `@theme inline` for font aliasing, so a developer
adds color tokens to the same block.

**How to avoid:** Font aliases belong in `@theme inline` (they reference CSS vars that can't be
further reduced). Brand color tokens should go in a plain `@theme` block so that dark mode CSS
variable overrides propagate into utilities at runtime.

---

## Code Examples

### Adding brand tokens to globals.css (verified pattern from tailwindcss.com/docs/theme)

```css
/* src/app/globals.css — Phase 2 target state */
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #ededed;

  /* Brand accent — update HUE value once name/identity is decided */
  --brand: oklch(0.72 0.22 260);      /* example: electric blue */
  --brand-foreground: oklch(0.05 0 0);
}

@theme {
  /* Brand color utilities: bg-brand, text-brand, border-brand, etc. */
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-heebo), ui-sans-serif, system-ui, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
    "DejaVu Sans Mono", monospace;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

### Updating Next.js metadata (App Router)

```typescript
// src/app/[locale]/layout.tsx — target state
export const metadata: Metadata = {
  title: {
    default: "[BrandName]",      // shown on pages without their own title
    template: "%s | [BrandName]", // pages with their own title get " | BrandName" suffix
  },
  description: "[Hebrew-friendly description]",
};
```

### Updating the manifest

```typescript
// src/app/manifest.ts — target state
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "[FullBrandName]",
    short_name: "[≤12chars]",
    description: "...",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",   // or update to brand color once chosen
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

### i18n string replacement (messages/en.json)

Only keys that contain the brand name need to change:

```json
{
  "common": {
    "appName": "[NewBrandName]"
  },
  "home": {
    "title": "Welcome to [NewBrandName]"
  },
  "tosContent": {
    "intro": {
      "heading": "Welcome to [NewBrandName]",
      "body": "[NewBrandName] (\"the Platform\") is a community hub..."
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `tailwind.config.js` theme extension | `@theme` block in CSS file (v4) | No JS config file needed; CSS is the config |
| `tailwind.config.js` `darkMode: 'class'` | CSS `:root` dark vars + media query or data attribute | Dark mode is CSS-native; no Tailwind config involvement |
| `next/head` for metadata | `export const metadata: Metadata` in layout/page | App Router pattern, server-side, no client component needed |

---

## Open Questions

1. **Brand name — the core deliverable of BRAND-01**
   - What we know: "AcroRetreat" is out; "AcroYoga Academy" is a placeholder; an existing TLV FB
     page uses "AcroYoga Academy IL".
   - What's unclear: The chosen name — this is a product decision, not a research finding.
   - Recommendation: The planner should treat this as a required input and either (a) prompt the
     user to supply the name before creating tasks, or (b) make the first task "select and confirm
     brand name" with the framework above as the acceptance criteria.

2. **Logo/wordmark — scope of Phase 2 vs later**
   - What we know: The offline page and header use text-only brand name display. No logo asset
     exists yet. The `/frontend-design` skill + Google Stitch are the design tools.
   - What's unclear: Does Phase 2 require a visual logotype/wordmark, or just the name + color
     token? A wordmark is valuable but could block the phase if design iteration is slow.
   - Recommendation: Minimum viable Phase 2 = name + color token + text-based wordmark in Heebo
     900 weight (already loaded). Actual SVG logo is a nice-to-have that can be added mid-phase or
     deferred to the design polish phase.

3. **Icon assets**
   - What we know: Current icons at `public/icon-192x192.png` and `public/icon-512x512.png` are
     the default Next.js placeholder icons (no brand content). PWA requires these to exist.
   - What's unclear: Will branded icons be created in Phase 2, or are placeholders acceptable
     until design polish?
   - Recommendation: Phase 2 should at minimum update the icons to a neutral dark-background
     placeholder that doesn't show "Next.js" branding. Full branded icons can follow in design
     polish phase.

4. **Domain implication of brand name**
   - What we know: Domain is `acroretreat.co.il` (owned, currently on Site123, will be
     repointed to Vercel). The domain itself says "AcroRetreat".
   - What's unclear: Will a new domain be registered matching the new brand name, or will
     `acroretreat.co.il` be kept regardless?
   - Recommendation: The phase success criteria says "domain and any visible references to the
     old name are updated." For Phase 2 this means codebase references — the actual DNS/domain
     change is a deployment concern and may be deferred.

---

## Sources

### Primary (HIGH confidence)
- https://tailwindcss.com/docs/theme — `@theme` directive, CSS custom properties, design token
  namespaces, `inline` modifier behavior. Fetched 2026-04-01.
- Codebase audit — `src/app/globals.css`, `src/app/manifest.ts`, `src/app/layout.tsx`,
  `src/app/[locale]/layout.tsx`, `messages/en.json`, `messages/he.json`, `src/lib/auth.ts`,
  `src/app/~offline/page.tsx`, `src/components/pwa/InstallPrompt.tsx`. Direct read 2026-04-01.

### Secondary (MEDIUM confidence)
- Next.js App Router Metadata docs (training knowledge, v16 consistent with v13+ pattern) —
  `export const metadata: Metadata` from `next` in layout files.
- next-intl v4 message format — Context7 library ID `/amannn/next-intl`, pattern consistent
  with codebase usage already in Phase 1.

### Tertiary (LOW confidence)
- Hebrew brand naming resources — namefatso.com, rontar.com (web search results). Not
  authoritative for product naming; provided as discovery starting points only.

---

## Metadata

**Confidence breakdown:**
- Rename surface audit: HIGH — every file read directly
- Tailwind v4 token pattern: HIGH — official docs fetched
- Next.js metadata pattern: MEDIUM — consistent with docs, not re-fetched
- Naming framework: LOW (creative/strategic) — no authoritative source possible
- i18n pattern: HIGH — codebase already uses it correctly in Phase 1

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack — Tailwind v4 and Next.js 16 unlikely to change token
API within 30 days)

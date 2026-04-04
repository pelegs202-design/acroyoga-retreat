---
phase: 10-brutalist-design-polish-performance
plan: "03"
subsystem: layout-auth-design
tags: [brutalist, header, footer, mobile-menu, radix-dialog, auth, accessibility, wcag, pink-accents]
dependency_graph:
  requires:
    - src/components/effects/MagneticWrapper (from 10-01)
    - src/components/layout/MotionProvider (from 10-01)
    - globals.css btn-press class (from 10-01)
  provides:
    - src/components/layout/Header (brutalist redesign with magnetic nav + hamburger)
    - src/components/layout/MobileMenu (Radix Dialog Sheet pattern)
    - src/components/layout/Footer (brutalist 4-col footer)
  affects:
    - src/app/[locale]/layout.tsx (Footer added after children)
    - src/app/[locale]/(auth)/layout.tsx (brutalist bordered card)
    - src/components/auth/SignInForm, SignUpForm, ResetPasswordForm (headings + styling)
tech_stack:
  added:
    - "@radix-ui/react-dialog@1.1.15 — Radix UI accessible Dialog primitive (DSGN-04)"
  patterns:
    - Radix Dialog Sheet pattern (focus trap, escape-to-close, aria-modal, scroll lock)
    - MagneticWrapper wrapping desktop nav links (from effects library)
    - CSS logical properties for RTL-safe layout (inset-inline-end, border-s, etc.)
    - Brutalist card framing with border-brand on auth layout
    - btn-press class on all auth submit buttons (from globals.css)
key_files:
  created:
    - src/components/layout/MobileMenu.tsx
    - src/components/layout/Footer.tsx
  modified:
    - src/components/layout/Header.tsx
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/(auth)/layout.tsx
    - src/components/auth/SignInForm.tsx
    - src/components/auth/SignUpForm.tsx
    - src/components/auth/ResetPasswordForm.tsx
    - messages/en.json
    - messages/he.json
    - package.json
decisions:
  - "MobileMenu uses Radix Dialog (not custom dropdown) — provides WCAG AA focus trap, escape-to-close, aria-modal, scroll lock for free per DSGN-04"
  - "Hamburger button only on mobile (sm:hidden) — desktop shows MagneticWrapper nav links; trigger passes isOpen/onOpenChange to Dialog-based MobileMenu"
  - "Auth layout removes inner wrapping div from form components — brutalist card is now purely in layout.tsx; form components render headless into the card"
  - "Input focus uses focus:border-brand focus:ring-1 focus:ring-brand (not globals.css form-focus class) — per-component focus complements global, gives sharp pink border"
  - "Footer uses inline SVG icons for WhatsApp and Instagram — no icon library dependency added; keeps bundle lean"
metrics:
  duration: "15 min"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 2
  files_modified: 9
---

# Phase 10 Plan 03: Brutalist Header, Footer, Mobile Menu, and Auth Polish Summary

**One-liner:** Brutalist Header redesign with MagneticWrapper nav links + accessible MobileMenu using Radix Dialog Sheet pattern (DSGN-04 compliance) + 4-column Footer on all pages + auth pages wrapped in 2px pink-bordered brutalist card with bold headings and pink accents.

## What Was Built

### Task 1: Header, MobileMenu, Footer, Layout Update

**Header.tsx redesigned (184 lines):**
- 72px sticky bar, `bg-[#0a0a0a]/95 backdrop-blur-[8px]`, pink bottom border accent (`border-brand/15`)
- Brand wordmark: 6px pink square dot + "Acro" (white) + "Havura" (pink), `text-2xl font-black`
- Desktop nav links wrapped in `MagneticWrapper` — uppercase, bold, with scale-x-0→1 hover underline bar
- Hamburger button (mobile-only `sm:hidden`) triggers Radix Dialog MobileMenu via `setMenuOpen(true)`
- All existing session check, unread polling, sign-out, language toggle preserved

**MobileMenu.tsx created (155 lines):**
- `"use client"` component built on `@radix-ui/react-dialog` primitives
- `Dialog.Root` (controlled), `Dialog.Portal`, `Dialog.Overlay` (backdrop blur), `Dialog.Content` (slide panel), `Dialog.Title` (sr-only), `Dialog.Close`
- Giant brutalist nav links: `text-[40px] font-black` at 20% opacity → 100% on hover (per stitch-screens spec)
- Bottom CTA: sign-up block (pink) + sign-in link when logged out; sign-out button when logged in
- WCAG AA: focus trap, Escape-to-close, aria-modal, scroll lock — all from Radix for free

**Footer.tsx created (184 lines):**
- `bg-[#0a0a0a]`, `border-t border-brand/20`
- Brand: 8px pink square dot + "Acro" (white) + "Havura" (pink), `text-[28px] font-black`
- Grid: `grid-cols-[2fr_1fr_1fr_1fr]` on desktop → `sm:grid-cols-2` → `grid-cols-1` on mobile
- Platform links wrapped in `MagneticWrapper` on desktop
- Social: WhatsApp + Instagram inline SVG buttons
- Copyright bottom bar with legal links

**layout.tsx updated:** `<Footer />` imported and rendered after `{children}` inside `MotionProvider` — appears on all locale pages.

**i18n:** Added `common.menu`, `common.closeMenu`, and full `footer.*` namespace to `en.json` and `he.json`.

---

### Task 2: Auth Pages Brutalist Polish

**Auth layout.tsx redesigned:**
- Full-screen `bg-[#0a0a0a]` with diagonal pink gradient accent line (`rotate-[20deg]`) and ghosted "ACRO" background text
- Card: `border-2 border-brand bg-neutral-900 p-8 sm:p-12` — sharp 2px pink border, no border-radius (brutalist)

**SignInForm, SignUpForm, ResetPasswordForm updated:**
- Heading: `text-3xl font-black tracking-tighter` (was `text-2xl font-bold`)
- Pink accent bar below heading: `h-1 w-12 bg-brand`
- Inputs: `rounded-none` (square, brutalist) + `focus:border-brand focus:ring-brand` (pink focus glow)
- Submit buttons: `btn-press` class + `font-black uppercase tracking-wide` (was `font-semibold`)
- Links (forgot password, sign-in/sign-up swap): `text-brand hover:text-brand-muted`
- Card wrapper div removed from form components — layout.tsx provides the card
- All auth logic unchanged

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Architecture Notes

- Plan specified the card would have `p-8 sm:p-12` — the auth form components previously had their own card wrapper (`rounded-xl border border-neutral-800 bg-neutral-900 p-8`). Removed the wrapping div from all three form components so the layout.tsx card is the single card source. This is cleaner and avoids double-wrapping.
- MobileMenu uses `data-[state=open]:animate-in / data-[state=closed]:animate-out` Tailwind v4 + Radix data-state attributes for the slide animation rather than Framer Motion — simpler, no JS animation library needed for this use case.

---

## Self-Check

### Files exist:
- FOUND: src/components/layout/Header.tsx (184 lines)
- FOUND: src/components/layout/Footer.tsx (184 lines)
- FOUND: src/components/layout/MobileMenu.tsx (155 lines)
- FOUND: src/app/[locale]/(auth)/layout.tsx
- FOUND: src/app/[locale]/(auth)/sign-in/page.tsx

### Key links verified:
- Header.tsx imports MagneticWrapper
- MobileMenu.tsx imports from @radix-ui/react-dialog
- MobileMenu.tsx uses Dialog.Root, Dialog.Portal, Dialog.Content, Dialog.Overlay, Dialog.Title, Dialog.Close
- layout.tsx imports and renders Footer
- package.json contains @radix-ui/react-dialog

### Commits exist:
- f35daad: feat(10-03): brutalist header, accessible mobile menu (Radix Dialog), and footer
- d537b38: feat(10-03): brutalist auth pages with pink bordered card and pink accents

### TypeScript: npx tsc --noEmit — PASSED (no errors)

## Self-Check: PASSED

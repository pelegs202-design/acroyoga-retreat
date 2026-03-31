# Phase 1: Foundation + Auth - Research

**Researched:** 2026-03-31
**Domain:** Next.js App Router + Better Auth + Drizzle ORM + next-intl + PWA (Serwist)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Auth flow
- Email + password only — no social login (Google, Apple) in v1
- No email verification required — users get immediate access after signup
- Email verification reminder shown later but not blocking
- Quick onboarding wizard after first signup: 2-3 steps (city, base/flyer role, level) so the app feels personalized from the start
- Password reset via standard email link flow (not OTP)

#### Language switching
- Default language detected from browser locale — Hebrew for he-IL, English for everyone else
- Toggle displayed as flag icons (IL/US) in the header — visual, compact, always visible
- URL-based routing: `/he/about`, `/en/about` — each language has its own URL for SEO
- Language preference persisted in user profile for logged-in users — overrides URL/cookie on login

#### PWA behavior
- Install prompt shown after 2nd visit — avoids annoying first-time browsers
- Placeholder app icon — will be replaced in Phase 2 (Brand Identity)
- Dark/monochrome theme color from day one — set the brutalist tone before brand is finalized

#### Terms acceptance
- Separate full-screen step after signup — not an inline checkbox on the signup form
- Users who decline can browse public content but cannot create profile, message, or RSVP
- TOS text generated as part of this phase in both Hebrew and English
- Combined TOS + Privacy Policy in one document — simpler for a community platform
- Acceptance timestamp recorded in database

### Claude's Discretion
- Offline skeleton approach (branded splash vs cached app shell)
- Database schema details for auth and TOS tables
- Email delivery provider for password reset emails (Resend likely, per Phase 7 alignment)
- Exact onboarding wizard step count and field layout
- Heebo font loading strategy

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 1 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Site loads on Vercel with Next.js, Vercel Postgres (Neon), Drizzle ORM | Drizzle + `@neondatabase/serverless` setup documented; drizzle-kit migration workflow confirmed |
| FOUND-02 | Bilingual Hebrew RTL + English with language toggle (next-intl) | next-intl App Router routing confirmed with prefix pattern; browser locale detection via `accept-language` header documented |
| FOUND-03 | PWA installable with home screen icon and offline profile/skills view | Official Next.js PWA guide (v16.2.1, March 2026) + Serwist integration pattern documented |
| FOUND-04 | Mobile-first responsive design across all pages | Tailwind v4 with CSS logical properties for RTL confirmed; `dir` attribute approach verified |
| FOUND-05 | Digital terms of service acceptance on signup | TOS table schema designed; Better Auth custom fields + separate table pattern documented |
| AUTH-01 | User can sign up with email and password | Better Auth `emailAndPassword: { enabled: true }` + `signUp.email()` client method confirmed |
| AUTH-02 | User can log in and stay logged in across sessions (session persistence) | Better Auth cookie-based sessions, 7-day default expiry, `cookieCache` option, `rememberMe` parameter confirmed |
| AUTH-03 | User can reset password via email link | Better Auth `sendResetPassword` callback + Resend integration + `requestPasswordReset()` client method confirmed |
</phase_requirements>

---

## Summary

Phase 1 builds the permanent scaffold that every subsequent phase inherits. The stack is fully verified: Next.js 16 App Router on Vercel, Drizzle ORM against Neon (Vercel Postgres), Better Auth for email/password sessions, next-intl for URL-prefixed bilingual routing with RTL, and Serwist for PWA service worker. All five libraries have current documentation and are actively maintained as of March 2026.

The biggest integration complexity is the three-way interaction between next-intl middleware, Better Auth middleware, and Next.js 16's "proxy" layer (which replaces "middleware" in Next.js 16). These must be composed carefully so locale detection runs before auth checks, and auth checks use server-side session validation (not just cookie presence) to avoid CVE-2025-29927. The onboarding wizard fields (city, role, level) must be added as custom fields on Better Auth's user table now — changing them later requires a migration.

PWA in Next.js 16 is straightforward: the manifest file is a native App Router convention (`app/manifest.ts`), offline support comes via Serwist (the maintained next-pwa successor), and the install prompt deferral (show on 2nd visit) is implemented via `beforeinstallprompt` + `localStorage` visit counter. The official Next.js docs explicitly recommend Serwist for offline support and note it requires webpack (not Turbopack) — keep this in mind for the build config.

**Primary recommendation:** Set up Better Auth + Drizzle + Neon first (the database foundation everything else depends on), then layer next-intl routing, then PWA. This ordering minimizes rework because auth tables feed onboarding schema which feeds i18n locale persistence.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x (App Router) | Framework | Already decided; current LTS; App Router is the standard pattern |
| Better Auth | latest (npm: `better-auth`) | Auth provider | Locked decision; Drizzle adapter built-in; email/password + session + password reset all supported |
| Drizzle ORM | latest (`drizzle-orm`) | Database ORM | Locked decision; Neon adapter (`@neondatabase/serverless`) verified; type-safe schema |
| `@neondatabase/serverless` | latest | Neon connection driver | Required for Drizzle + Neon on Vercel serverless; HTTP-based pooled connections |
| next-intl | v3/v4 (`next-intl`) | i18n + routing | Locked decision; native App Router support; prefix routing (`/he/`, `/en/`) built-in |
| Tailwind CSS | v4 | Styling | Locked decision; CSS logical properties for RTL built-in; no plugin needed for basic RTL |
| Serwist | `@serwist/next` + `serwist` | PWA / Service Worker | Official Next.js docs recommend Serwist for offline support; maintained next-pwa successor |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `resend` | latest | Email delivery | Password reset emails; already aligned with Phase 7 email infrastructure |
| `react-hook-form` | v7 | Form handling | Signup, login, reset, onboarding wizard forms |
| `zod` | v3 | Schema validation | Form validation + API route input validation |
| `drizzle-kit` | latest (dev) | DB migrations | `drizzle-kit push` for dev, `drizzle-kit generate` + `drizzle-kit migrate` for production |
| `next/font/google` | built-in | Heebo font loading | Zero layout shift, self-hosted at build time, no Google DNS leakage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Serwist | `@ducanh2912/next-pwa` | Both are next-pwa forks; Serwist is more actively maintained and recommended by official Next.js docs |
| Serwist | Manual service worker | Serwist handles precaching manifest, Workbox strategies, offline fallback — hand-rolling this is high effort |
| next-intl | `next-i18next` | next-i18next is Pages Router only; App Router requires next-intl |
| Resend | Nodemailer | Resend has a simpler API, better deliverability, and aligns with Phase 7 decisions |
| `react-hook-form` | Server Actions only | Multi-step wizard UX benefits from client-side state; server actions alone are awkward for step navigation |

**Installation:**
```bash
npm install better-auth drizzle-orm @neondatabase/serverless next-intl resend react-hook-form zod
npm install -D drizzle-kit serwist @serwist/next
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── [locale]/                    # next-intl locale segment
│   ├── layout.tsx               # locale-aware root layout (dir, lang, Heebo font)
│   ├── page.tsx                 # home (public)
│   ├── (auth)/                  # auth route group — no nav chrome
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── onboarding/page.tsx  # post-signup wizard
│   │   └── tos/page.tsx         # full-screen TOS acceptance
│   └── (app)/                   # authenticated route group
│       └── dashboard/page.tsx
├── api/
│   └── auth/
│       └── [...all]/route.ts    # Better Auth catch-all handler
├── manifest.ts                  # PWA manifest (Next.js native)
├── sw.ts                        # Serwist service worker source
├── ~offline/page.tsx            # offline fallback page
└── layout.tsx                   # root layout (minimal — locale in [locale]/layout)

src/
├── lib/
│   ├── auth.ts                  # Better Auth server instance
│   ├── auth-client.ts           # Better Auth client instance
│   └── db/
│       ├── index.ts             # Drizzle db instance
│       └── schema.ts            # All table definitions
├── i18n/
│   ├── routing.ts               # next-intl routing config
│   ├── request.ts               # next-intl per-request config
│   └── navigation.ts            # typed Link/useRouter wrappers
└── middleware.ts                # next-intl + Better Auth composed middleware

messages/
├── en.json                      # English strings
└── he.json                      # Hebrew strings

public/
├── icon-192x192.png             # PWA icon (placeholder)
├── icon-512x512.png             # PWA icon (placeholder)
└── sw.js                        # Serwist output (gitignored)
```

### Pattern 1: Better Auth Configuration with Drizzle + Custom User Fields

**What:** Server-side auth instance with email/password, Drizzle adapter, password reset callback, and onboarding fields baked into user schema.
**When to use:** The single source of truth for all auth behavior — configure once, reference everywhere.

```typescript
// Source: https://www.better-auth.com/docs/authentication/email-password
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // Avoid await to prevent timing attacks on serverless
      void resend.emails.send({
        from: "AcroYoga Academy <noreply@acro.academy>",
        to: user.email,
        subject: "Reset your password",
        text: `Click to reset: ${url}`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      city: { type: "string", required: false, input: true },
      role: { type: ["base", "flyer", "both"], required: false, input: true },
      level: { type: ["beginner", "intermediate", "advanced"], required: false, input: true },
      preferredLocale: { type: "string", required: false, input: false },
      tosAcceptedAt: { type: "date", required: false, input: false },
    },
  },
  plugins: [nextCookies()], // must be last
});
```

### Pattern 2: next-intl Routing + Locale Detection

**What:** URL-prefix routing with browser locale detection fallback.
**When to use:** All routing must be locale-aware from the start.

```typescript
// Source: https://next-intl.dev/docs/routing/middleware
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
  localeDetection: true, // uses accept-language header
});
```

```typescript
// src/middleware.ts — IMPORTANT: next-intl middleware runs locale detection
// Better Auth session check is done in Server Components, not middleware
// (to avoid CVE-2025-29927 and Next.js 16 proxy/middleware changes)
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|sw\\.js|manifest\\.json|.*\\..*).*)",
};
```

```typescript
// app/[locale]/layout.tsx — RTL/LTR + Heebo font
// Source: https://nextjs.org/docs/app/getting-started/fonts
import { Heebo } from "next/font/google";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  display: "swap",
  variable: "--font-heebo",
});

export default function LocaleLayout({ children, params: { locale } }) {
  const dir = locale === "he" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir} className={heebo.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Pattern 3: Server-Side Session Check (Safe)

**What:** Validate sessions in Server Components, not middleware, to avoid auth bypass vulnerabilities.
**When to use:** Any protected Server Component or Server Action.

```typescript
// Source: https://better-auth.com/docs/integrations/next
// app/[locale]/(app)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/en/sign-in");
  return <div>Welcome {session.user.name}</div>;
}
```

### Pattern 4: Serwist PWA Setup

**What:** Service worker with offline fallback via Serwist.
**When to use:** Required for PWA installability and offline support.

```typescript
// Source: https://serwist.pages.dev/docs/next/getting-started
// next.config.ts
import withSerwistInit from "@serwist/next";
import crypto from "crypto";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

export default withSerwist({
  // your Next.js config
});
```

```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{
      url: "/~offline",
      matcher({ request }) { return request.destination === "document"; },
    }],
  },
});

serwist.addEventListeners();
```

### Pattern 5: Install Prompt Deferral (2nd Visit)

**What:** Capture `beforeinstallprompt`, store it, and only show after 2nd visit.
**When to use:** Client component — runs in browser only.

```typescript
// src/components/pwa/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Count visits
    const visits = parseInt(localStorage.getItem("visit_count") || "0") + 1;
    localStorage.setItem("visit_count", String(visits));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 2) setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <button onClick={() => { deferredPrompt.prompt(); setShowPrompt(false); }}>
      Install App
    </button>
  );
}
```

**iOS note:** `beforeinstallprompt` does not fire on iOS Safari. Show a static banner with share icon instructions for iOS users (`/iPad|iPhone|iPod/.test(navigator.userAgent)`).

### Pattern 6: TOS Acceptance Flow

**What:** Full-screen TOS step after signup, before onboarding wizard, with timestamp in DB.
**When to use:** Immediately after `signUp.email()` succeeds.

The acceptance timestamp is stored in the `tosAcceptedAt` field on the user record (via Better Auth `additionalFields`). The check is: if `session.user.tosAcceptedAt` is null, redirect to `/[locale]/tos` before any authenticated page.

```typescript
// Post-signup flow (client-side):
// 1. signUp.email() → session created
// 2. Redirect → /[locale]/tos (full-screen acceptance)
// 3. On accept → PATCH /api/user/accept-tos → sets tosAcceptedAt
// 4. Redirect → /[locale]/onboarding (wizard: city, role, level)
// 5. On wizard complete → redirect → /[locale]/dashboard
```

### Anti-Patterns to Avoid

- **Relying solely on middleware for auth:** CVE-2025-29927 allows middleware bypass via crafted `x-middleware-subrequest` headers. Always validate sessions server-side in Server Components for any protected page.
- **Using `getSessionCookie()` in middleware as security gate:** This only checks cookie existence, not validity. Use it only for optimistic redirects (UX), never for security enforcement.
- **Adding Turbopack when using Serwist:** Official Next.js docs state Serwist currently requires webpack configuration. Keep `next dev` (not `next dev --turbopack`) during development.
- **Importing from `"next-intl"` in Server Components without `setRequestLocale()`:** For static rendering, you must call `setRequestLocale(locale)` at the top of every layout and page.
- **Placing locale-agnostic routes outside `[locale]` segment:** All user-facing pages must live inside `app/[locale]/` to get correct `lang` and `dir` attributes.
- **Delaying onboarding schema decisions:** Better Auth generates the user table via `npx auth@latest generate`. If you add `additionalFields` later, you need a new migration. Define city/role/level now.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt wrapper | Better Auth (built-in) | Timing attacks, salt rounds, algorithm upgrades — Better Auth handles all |
| Session tokens | Custom JWT or random string | Better Auth sessions | Token rotation, expiry, revocation, cookie security flags |
| Email verification tokens | Custom token generation + storage | Better Auth `verification` table | Expiry, single-use enforcement, secure random generation |
| Password reset tokens | Custom token flow | Better Auth `sendResetPassword` | Same token security issues; Better Auth generates and validates the URL token |
| Service worker caching | Custom fetch event handler | Serwist + `defaultCache` | Stale-while-revalidate, cache-first, network-first strategies require careful implementation; Workbox handles edge cases |
| Locale detection | Parse `accept-language` manually | next-intl middleware | BCP 47 parsing, regional fallbacks, best-fit matching is non-trivial |
| RTL CSS flipping | Manual `rtl:` overrides everywhere | CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`) | Tailwind v4 supports logical properties natively; `rtl:` variant only needed for complex components |
| Form multi-step state | useState chain | `react-hook-form` with step index | Validation per step, persistence, error summaries |

**Key insight:** The auth domain has a particularly high ratio of "looks simple, is dangerous" problems. Every custom auth component (password reset, session management, email tokens) has security edge cases that Better Auth has already solved.

---

## Common Pitfalls

### Pitfall 1: Middleware Composition Conflict (next-intl + Better Auth)

**What goes wrong:** Combining next-intl's middleware with Better Auth's cookie check in the same middleware file causes locale detection to fail or auth checks to run before locale is resolved.
**Why it happens:** next-intl wraps the entire request to inject locale context; Better Auth's middleware reads cookies and may redirect before next-intl runs.
**How to avoid:** Run next-intl middleware exclusively in `middleware.ts`. Do auth session validation only in Server Components using `auth.api.getSession({ headers: await headers() })`. Do not add Better Auth to middleware.
**Warning signs:** Users getting redirected to `/sign-in` without locale prefix, or locale being `undefined` in auth callbacks.

### Pitfall 2: Serwist Breaks with Turbopack

**What goes wrong:** `next dev --turbopack` causes Serwist to fail with build errors or not generate `sw.js`.
**Why it happens:** Official Next.js PWA docs state: "Note: this plugin currently requires webpack configuration."
**How to avoid:** Keep webpack for builds. Use `next dev` without `--turbopack` flag. Add a note in package.json scripts.
**Warning signs:** Missing `public/sw.js` after build, service worker registration 404.

### Pitfall 3: Hebrew RTL Breaks on Mixed Content

**What goes wrong:** Numbers, URLs, and LTR-embedded text display in wrong order within Hebrew text.
**Why it happens:** Unicode bidirectional algorithm handles mixed LTR/RTL content automatically but imperfectly for edge cases.
**How to avoid:** Use `dir="auto"` on individual text inputs. Wrap English snippets in `<span dir="ltr">`. Test every form field and UI string with Hebrew + English mixed content.
**Warning signs:** Phone numbers appearing reversed, email addresses with display issues.

### Pitfall 4: next-intl `generateStaticParams` Missing

**What goes wrong:** Pages build fine in dev but throw errors on Vercel production build for static pages.
**Why it happens:** Next.js App Router requires `generateStaticParams()` for static segment routes. Without it for `[locale]`, static generation fails.
**How to avoid:** Add `generateStaticParams` to every layout that needs static export:
```typescript
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "he" }];
}
```
**Warning signs:** Vercel build fails with "Dynamic segment `locale` has no `generateStaticParams`".

### Pitfall 5: Better Auth `additionalFields` Not in Generated Schema

**What goes wrong:** Onboarding wizard saves to user fields that don't exist in the database; inserts fail silently or throw column-not-found errors.
**Why it happens:** `additionalFields` in `auth.ts` defines TypeScript types, but the actual DB columns are generated by `npx auth@latest generate`. If you run `generate` before adding fields, columns are missing.
**How to avoid:** Define all `additionalFields` in `auth.ts` before running `npx auth@latest generate` the first time. If adding later, run `generate` + `migrate` again.
**Warning signs:** TypeScript types resolve but Drizzle throws "column does not exist" at runtime.

### Pitfall 6: PWA Manifest Blocked by next-intl Middleware

**What goes wrong:** `/manifest.json` returns a 404 or redirect because next-intl middleware intercepts it.
**Why it happens:** next-intl middleware catches all routes matching its pattern, including `/manifest.json` and `/sw.js`.
**How to avoid:** The middleware matcher must explicitly exclude PWA files:
```typescript
export const config = {
  matcher: "/((?!api|_next|_vercel|sw\\.js|manifest\\.json|icon.*\\.png|.*\\..*).*)",
};
```
**Warning signs:** Browser shows "No manifest found", PWA install prompt never appears.

### Pitfall 7: TOS Acceptance Check Placement

**What goes wrong:** Users who accepted TOS on first visit get redirected to TOS page again after session refresh.
**Why it happens:** `tosAcceptedAt` is stored in the database but not refreshed in the session cookie cache.
**How to avoid:** After TOS acceptance, trigger session refresh: call `authClient.getSession()` again to force a fresh cookie. Check `session.user.tosAcceptedAt` (not a separate API call) in the server component guard.
**Warning signs:** Users in redirect loop on `/tos` page after accepting.

---

## Code Examples

Verified patterns from official sources:

### Drizzle Schema: Auth + TOS + Onboarding Fields

```typescript
// Source: https://orm.drizzle.team/docs/get-started/neon-new
// src/lib/db/schema.ts (custom tables alongside Better Auth's generated tables)
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Better Auth generates: user, session, account, verification tables
// Better Auth additionalFields adds: city, role, level, preferredLocale, tosAcceptedAt to user table

// No separate TOS table needed — tosAcceptedAt is an additionalField on user
// If you need full TOS version tracking (future), add this table:
export const tosAcceptances = pgTable("tos_acceptances", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tosVersion: text("tos_version").notNull().default("v1"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
});
```

### Drizzle Connection Setup (Neon + Vercel)

```typescript
// Source: https://orm.drizzle.team/docs/get-started/neon-new
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### Better Auth Client

```typescript
// Source: https://better-auth.com/docs/integrations/next
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Signup Flow with TOS Redirect

```typescript
// Source: derived from https://better-auth.com/docs/authentication/email-password
// app/[locale]/(auth)/sign-up/page.tsx (client component)
"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

async function handleSignUp(email: string, password: string, name: string) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
  });
  if (error) throw error;
  // Redirect to TOS acceptance (not dashboard yet)
  router.push(`/${locale}/tos`);
}
```

### Password Reset Request

```typescript
// Source: https://better-auth.com/docs/authentication/email-password
const { error } = await authClient.requestPasswordReset({
  email: "user@example.com",
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/reset-password`,
});
```

### Web App Manifest (Brutalist Dark Theme)

```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AcroYoga Academy",
    short_name: "AcroAcademy",
    description: "Find acro partners and events near you",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",   // dark/brutalist
    theme_color: "#0a0a0a",         // dark monochrome — will be updated in Phase 2
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

### Heebo Font Loading (Zero Layout Shift)

```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/[locale]/layout.tsx
import { Heebo } from "next/font/google";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-heebo",
  preload: true,
});
// Apply: className={`${heebo.variable} font-sans`} on <html>
// Tailwind: set fontFamily.sans to ['var(--font-heebo)', ...defaultSans] in CSS
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-pwa` (npm) | Serwist (`@serwist/next`) | 2023-2024 | next-pwa unmaintained; Serwist is the maintained fork with Next.js 13+ support |
| NextAuth v4 | Better Auth or Auth.js v5 | 2024 | NextAuth v4 is legacy; Better Auth has cleaner API + Drizzle adapter built-in |
| Next.js `middleware.ts` | Next.js 16 `proxy.ts` | 2025-2026 | Next.js 16 renamed middleware to proxy; but `middleware.ts` still works via compatibility layer |
| `next-i18next` | `next-intl` | 2023 | next-i18next is Pages Router only; next-intl supports App Router natively |
| Tailwind RTL plugins | CSS logical properties | Tailwind v4 (2024) | Tailwind v4 has logical property utilities built-in; `tailwindcss-rtl` plugin no longer needed |
| `pages/api/auth/[...nextauth].ts` | `app/api/auth/[...all]/route.ts` | Next.js 13+ | App Router route handler pattern |

**Deprecated/outdated:**
- `next-pwa` (npm): Unmaintained; use `@serwist/next` instead
- `next-i18next`: Pages Router only; use `next-intl`
- NextAuth v4: Legacy; use Better Auth or Auth.js v5
- `tailwindcss-rtl` plugin: Superseded by Tailwind v4's built-in logical properties
- `pages/_app.tsx` + `pages/_document.tsx`: Pages Router pattern; use App Router `app/layout.tsx`

---

## Offline Skeleton Recommendation (Claude's Discretion)

**Recommendation: Cached app shell with branded offline splash.**

For a pre-content phase with no real data to cache, a pure cached app shell is the right choice:
- Cache the root layout HTML, the Heebo font, and the main CSS bundle
- Serve a branded `/~offline` page when document requests fail (network down + uncached URL)
- The offline page shows the app name, dark brutalist styling (consistent with Phase 1 theme), and "You're offline — connect to continue"
- No fake content placeholders — users understand offline context

This is better than a splash screen because:
1. Serwist's `fallbacks` option makes it trivially easy (one config line)
2. The page is always visible — no timing/flash issues
3. Works regardless of whether the user has visited specific pages before

---

## Open Questions

1. **Next.js 16 proxy vs middleware naming**
   - What we know: Next.js 16 replaces `middleware.ts` with `proxy.ts` naming convention per community reports; the Better Auth docs still reference middleware
   - What's unclear: Whether `middleware.ts` still works as-is in Next.js 16 or requires migration to `proxy.ts`
   - Recommendation: Start with `middleware.ts`; test on actual Next.js 16 version. The next-intl middleware approach documented here should work either way.

2. **Better Auth `additionalFields` with Drizzle adapter — schema generation**
   - What we know: `npx auth@latest generate` creates SQL for Better Auth's core tables; `additionalFields` should be included
   - What's unclear: Whether `additionalFields` with enum types (`["base", "flyer", "both"]`) generate as Postgres enums or varchar — this affects schema and validation
   - Recommendation: Test `generate` output before committing to schema; may need to use `varchar` type and validate in application layer

3. **Resend free tier limits for Phase 1**
   - What we know: Resend has a free tier; password reset is low-volume in Phase 1
   - What's unclear: Whether any Resend account/domain verification is needed before password reset emails can be sent
   - Recommendation: Set up Resend account and verify sending domain as part of Phase 1 tasks, not as an afterthought

4. **`preferredLocale` synchronization on login**
   - What we know: User decision is: "Language preference persisted in user profile for logged-in users — overrides URL/cookie on login"
   - What's unclear: The exact mechanism — should login redirect to `/${user.preferredLocale}/dashboard` or should the middleware read the field and set the cookie?
   - Recommendation: On successful login, read `session.user.preferredLocale` and redirect to the correct locale path. This happens in the sign-in page client code, not middleware.

---

## Sources

### Primary (HIGH confidence)
- `https://better-auth.com/docs/installation` — installation, Next.js setup, route handler
- `https://better-auth.com/docs/authentication/email-password` — email/password config, password reset, session persistence
- `https://better-auth.com/docs/concepts/session-management` — session expiry, cookie cache, stateless sessions
- `https://better-auth.com/docs/concepts/database` — core tables, additionalFields, custom table definitions
- `https://better-auth.com/docs/integrations/next` — Next.js middleware, getSessionCookie, Server Component session, nextCookies plugin
- `https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing` — App Router URL-prefix routing setup
- `https://next-intl.dev/docs/routing/middleware` — locale detection, middleware config, locale priority
- `https://orm.drizzle.team/docs/get-started/neon-new` — Neon setup, schema syntax, migration workflow
- `https://serwist.pages.dev/docs/next/getting-started` — Serwist installation, next.config setup, service worker
- `https://nextjs.org/docs/app/guides/progressive-web-apps` — Official Next.js PWA guide (v16.2.1, last updated 2026-03-31)
- `https://nextjs.org/docs/app/getting-started/fonts` — next/font/google, Heebo loading strategy

### Secondary (MEDIUM confidence)
- WebSearch: Better Auth + Resend password reset — verified by multiple tutorials and official Better Auth email docs
- WebSearch: Tailwind v4 RTL + CSS logical properties — verified by tailwindcss.com/blog/tailwindcss-v4
- WebSearch: PWA install prompt deferral pattern — cross-referenced with official Next.js PWA docs

### Tertiary (LOW confidence)
- WebSearch: Next.js 16 renaming `middleware.ts` to `proxy.ts` — mentioned in Better Auth community docs but not independently verified against Next.js 16 release notes; needs validation against actual installed Next.js 16 version

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via official docs fetched March 2026
- Architecture: HIGH — patterns derived from official docs; route structure follows Next.js App Router conventions
- Better Auth config: HIGH — installation docs + email/password docs + integration docs all fetched directly
- PWA/Serwist: HIGH — official Next.js 16.2.1 docs fetched (updated 2026-03-31) + Serwist docs
- next-intl RTL: MEDIUM — locale detection and middleware confirmed; RTL `dir` attribute handling mentioned but not fully elaborated in fetched docs
- Tailwind v4 RTL: MEDIUM — logical properties confirmed by v4 release post; exact utility names not exhaustively verified
- Next.js 16 middleware/proxy: LOW — naming change referenced but not confirmed from primary source

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable libraries; check Better Auth changelog if > 30 days old — it moves fast)

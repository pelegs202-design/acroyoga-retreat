# Stack Research

**Domain:** Community platform — partner matching, real-time messaging, quiz funnels, payments
**Researched:** 2026-03-31
**Confidence:** HIGH (core stack verified via npm registry + official docs; payment layer MEDIUM — Green Invoice API docs require login to inspect fully)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.1 | Full-stack framework | App Router, Server Components, Server Actions, built-in image/font optimization, Vercel-native. The de facto standard for SEO-critical, SSR-first React apps in 2025-2026. |
| React | 19.x (bundled with Next.js 16) | UI rendering | Required by Next.js 16; React 19 brings `use()`, `useOptimistic`, and improved Server Components. No choice here. |
| TypeScript | 5.x | Type safety | Standard with `create-next-app`. Prevents entire classes of runtime bugs. Non-negotiable for a multi-domain app with matching, payments, and messaging. |
| Tailwind CSS | 4.2.2 | Styling | v4 drops `tailwind.config.js` in favor of CSS-native config. Brutalist design = raw utility classes, no abstraction layer needed. `@theme` inline variables make custom design tokens first-class. |
| Drizzle ORM | 0.45.2 | Database ORM | Serverless-native, no binary, cold starts under 200ms vs Prisma's 1-3s. Vercel Functions are serverless — this matters. SQL-like syntax gives full visibility into generated queries. Neon official integration guide. |
| Neon (Vercel Postgres) | serverless driver 1.0.2 | Postgres database | Drizzle's `@neondatabase/serverless` driver runs over HTTP in serverless contexts. Zero connection pooling complexity. Already integrated with Vercel dashboard. |
| Better Auth | 1.5.6 | Authentication | Auth.js v5 was absorbed into Better Auth in early 2026 (Auth.js maintainer left Jan 2025; project now in maintenance-only mode). Better Auth has full App Router support, credentials+email, sessions via JWT or DB. Direct replacement with better DX. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.8.4 | i18n — Hebrew RTL + English | Next.js-native, Server Components aware, handles `dir="rtl"` via locale routing. Use from project start — retrofitting i18n is extremely painful. |
| Zod | 4.3.6 | Schema validation | Both client and server-side. Pair with react-hook-form. Also validates incoming API payloads and ORM insert data. |
| react-hook-form | 7.72.0 | Form state management | Handles quiz funnel multi-step forms, partner profile forms, booking forms. Integrates with Zod via `@hookform/resolvers`. |
| @hookform/resolvers | latest | Bridge react-hook-form to Zod | Required glue package for RHF + Zod integration. |
| Supabase Realtime | via supabase-js | WebSocket messaging | Real-time direct messages between partners. Supabase Realtime channels are the simplest WebSocket layer that integrates with Postgres and doesn't require a separate hosted service. Free tier generous for community scale. |
| @supabase/supabase-js | latest | Supabase client | Needed alongside Drizzle: Drizzle handles schema + queries, Supabase client handles Realtime subscriptions. Keep Drizzle as source of truth for schema. |
| serwist | 9.5.7 | PWA / Service Worker | Official next-pwa successor. Handles offline caching, installability, background sync. Next.js 16 has basic PWA manifest support built-in, but serwist is needed for offline + push. |
| web-push | 3.6.7 | Web push notifications | VAPID-based push without third-party broker. Free, no per-message cost. Pair with serwist service worker on client. |
| Resend | 6.10.0 | Transactional email | Modern API, generous free tier (3,000/month), React Email templates, Israeli-friendly. Send booking confirmations, auth emails, reminders. |
| framer-motion | 12.38.0 | Animations / brutalist interactions | Draggable elements, unconventional scroll, cursor followers, quiz step transitions. Required for the brutalist interactive design spec. |
| @tanstack/react-query | 5.96.0 | Server state / cache | Handles partner feed, jam board, message history pagination. Pairs with Server Components: use RSC for initial fetch, React Query for client-side updates. |
| drizzle-kit | 0.31.10 | Database migrations | Schema diffing + migration generation. `drizzle-kit push` for dev, `drizzle-kit migrate` for production. |
| @radix-ui/react-* | 1.x | Accessible UI primitives | Headless components for modals, tooltips, dropdowns. Used under shadcn/ui. Radix handles a11y so you focus on brutalist styling. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| shadcn/ui | Component scaffolding CLI | Use `npx shadcn@latest add` to pull in Radix-based components as editable source files. Brutalist design means you'll heavily customize — owning the source is essential. Do NOT treat shadcn as a locked dependency. |
| Turbopack | Dev server (built into Next.js 16) | `next dev --turbo` is stable. 76% faster local startup. Use it. |
| ESLint 9 + Flat Config | Linting | Next.js 16 ships ESLint 9 support. Use `eslint.config.js` (flat config format). |
| Prettier | Code formatting | Standard. Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |
| tsx / ts-node | Run TypeScript scripts | For seed scripts, migration scripts, one-off admin tasks. |

---

## Installation

```bash
# Scaffold
npx create-next-app@latest acroyoga-academy --typescript --tailwind --app --src-dir --import-alias "@/*"

# Core
npm install better-auth drizzle-orm @neondatabase/serverless next-intl zod react-hook-form @hookform/resolvers

# Real-time + notifications
npm install @supabase/supabase-js web-push resend

# UI + animation
npm install framer-motion @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-select @tanstack/react-query

# PWA
npm install serwist

# Dev
npm install -D drizzle-kit @types/web-push prettier prettier-plugin-tailwindcss
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma | If team is junior and SQL fluency is low. Prisma's schema DSL is more approachable. Avoid on Vercel Functions due to cold start penalty (~1-3s). |
| Better Auth | Clerk | If you want zero-config hosted auth and don't mind per-MAU pricing ($25+/mo at scale). Better Auth is self-hosted, no per-user cost. |
| Better Auth | Supabase Auth | If you were using Supabase as your primary database. We're using Neon/Drizzle, so Supabase Auth adds fragmentation without benefit. |
| Supabase Realtime | Ably | At community scale (hundreds of concurrent users), Supabase Realtime free tier covers it. Use Ably only if you need guaranteed delivery, message history at scale, or 10K+ concurrent connections. |
| Supabase Realtime | Pusher | Pusher pricing is worse than Ably. No reason to use Pusher. |
| next-intl | next-i18next | `next-i18next` is Pages Router-era. Does not support App Router or Server Components. Do not use. |
| serwist | next-pwa | next-pwa is unmaintained (last commit 2022). serwist is the active fork with Next.js 15+ compatibility. |
| web-push | Firebase Cloud Messaging | FCM is free but requires Google account dependency, Android-specific optimizations, more config. web-push is simpler and provider-agnostic. |
| Resend | SendGrid / Mailchimp Transactional | Resend has a modern REST API, React Email support, better DX. SendGrid is legacy complexity. Mailchimp Transactional (Mandrill) is expensive. |
| Tailwind v4 | Tailwind v3 | v3 is still supported but v4's CSS-native config is cleaner. New project: start on v4. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| next-auth v4 | Maintenance-only, no new features, incompatible with React 19 patterns | Better Auth 1.x |
| next-auth v5 (beta) | Absorbed into Better Auth ecosystem; v5 never reached stable, development stalled | Better Auth 1.x |
| next-pwa | Last commit 2022, broken with Next.js 15+. Every PWA tutorial still references it — do not follow them | serwist |
| Prisma on Vercel Functions | Cold start penalty 1-3s per cold boot due to Prisma engine binary. Serverless deployment + Prisma = poor UX on first load | Drizzle ORM |
| next-i18next | Pages Router only. Does not work with App Router Server Components | next-intl |
| Socket.io | Requires persistent Node server, incompatible with Vercel serverless. Medium articles about Socket.io + Next.js all run a separate Express process | Supabase Realtime (WebSocket via hosted service) |
| MySQL | No strong reason vs Postgres. Green Invoice API returns JSON, so Postgres JSONB advantages apply. Neon is Postgres-native | Neon (Postgres) |
| tRPC | Adds abstraction over Server Actions that are already type-safe with Zod. Increases bundle size. Justified only for large team with strict API contract needs | Server Actions + Zod |

---

## Stack Patterns by Variant

**If Israeli payment + invoicing is the only payment need:**
- Use Green Invoice API directly via `fetch` in Server Actions
- No Stripe needed — Green Invoice handles charge + invoice generation natively for Israeli VAT
- JWT Bearer token auth: store API key in env var, exchange on first request for session token
- MEDIUM confidence: full API endpoint list requires Green Invoice developer account inspection; Apiary docs are not publicly crawlable

**If WhatsApp notifications are required (jam reminders, partner match alerts):**
- Use Meta Cloud API (official WhatsApp Business Platform Node.js SDK)
- Requires WhatsApp Business Account and phone number verification (1-3 day setup)
- Alternative (faster setup): Twilio WhatsApp sandbox (higher per-message cost)
- For community scale (<1000 users), Meta Cloud API free tier (1000 conversations/month) covers it

**If admin panel complexity grows:**
- Start with custom Next.js routes + Drizzle queries
- If it exceeds 5 CRUD entities: adopt `react-admin` or build on shadcn data-table pattern
- Do NOT use a hosted admin tool (Retool, Appsmith) — they can't share auth with the app

**For RTL Hebrew brutalist design:**
- Tailwind v4 CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `ml-*`/`mr-*` — required for RTL flip behavior
- Set `dir="rtl"` on `<html>` via next-intl locale detection
- framer-motion: override `x` axis animations for RTL (positive x = leftward in RTL context)
- Load `Heebo` font (Google Fonts) for Hebrew — best Hebrew web font coverage + weights

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.2.1 | react@19.x | Required peer dependency — Next.js 16 mandates React 19 |
| better-auth@1.5.6 | next@16.x, drizzle-orm@0.45.x | Better Auth has Drizzle adapter. Use `@better-auth/drizzle-adapter`. |
| drizzle-orm@0.45.2 | @neondatabase/serverless@1.0.2 | Use `drizzle-orm/neon-http` import path for serverless HTTP driver |
| next-intl@4.8.4 | next@16.x | v4 is the App Router-native version; v3 was compatible with Next.js 14-15 |
| serwist@9.5.7 | next@16.x | Use `@serwist/next` package for the Next.js plugin integration |
| tailwindcss@4.2.2 | next@16.x | Use `@tailwindcss/postcss` plugin, not `tailwindcss` PostCSS plugin (v3 pattern) |
| framer-motion@12.x | react@19.x | v12 is React 19 compatible; v10/v11 had React 19 peer dep warnings |
| @tanstack/react-query@5.x | react@19.x | v5 is compatible with React 19 |
| supabase-js | next@16.x (server + client) | Use `@supabase/ssr` package for cookie-based Supabase auth helpers in Next.js — but we're using Better Auth, so only use supabase-js for Realtime channels |

---

## Green Invoice API — What We Know

**Confidence: MEDIUM** (Apiary docs not publicly machine-readable; based on GitHub notes and community posts)

- Authentication: JWT Bearer token. Exchange API key for session token via `POST /account/token` with `id` + `secret`.
- Tokens expire. Must be refreshed or cached in serverless (use Upstash Redis for token caching across Vercel Function instances).
- Key endpoints: `POST /documents` (create invoice), `GET /clients`, `POST /clients` (create client), `POST /payments` (record payment).
- Webhooks available for payment status changes.
- No official Node.js SDK exists. Build a thin `lib/green-invoice.ts` wrapper with typed request/response shapes.
- **Action required:** Verify full endpoint list against actual developer account at `greeninvoice.co.il/api-docs/` before building payment phase.

---

## Sources

- [Next.js 15 official release blog](https://nextjs.org/blog/next-15) — Next.js features verified HIGH confidence
- [npm registry — all package versions](https://registry.npmjs.org/) — versions fetched 2026-03-31, HIGH confidence
- [Drizzle ORM + Neon official guide](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — HIGH confidence
- [Better Auth homepage + Next.js docs](https://better-auth.com/docs/integrations/next) — HIGH confidence
- [Auth.js absorbed into Better Auth — HN discussion](https://news.ycombinator.com/item?id=45389293) — MEDIUM confidence (community discussion, confirmed by project README)
- [next-intl official docs](https://next-intl.dev/docs/getting-started/app-router) — HIGH confidence
- [serwist as next-pwa successor](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7) — MEDIUM confidence (community article, corroborated by Next.js PWA guide)
- [Next.js PWA official guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — HIGH confidence
- [Green Invoice API Apiary](https://greeninvoice.docs.apiary.io/) + [GitHub developer notes](https://github.com/danielrosehill/Green-Invoice-API-My-Notes) — MEDIUM confidence (Apiary content not machine-readable; endpoint details from community notes)
- [Supabase Realtime + Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — HIGH confidence
- [Drizzle vs Prisma 2025 comparison](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — MEDIUM confidence (independent analysis, aligns with official Drizzle benchmarks)
- [React Hook Form + Zod + Server Actions](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) — MEDIUM confidence

---

*Stack research for: AcroYoga Academy community platform (Israel)*
*Researched: 2026-03-31*

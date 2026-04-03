# Phase 9: SEO + Social Surface - Research

**Researched:** 2026-04-01
**Domain:** Next.js App Router SEO (metadata, JSON-LD, sitemap), Instagram Graph API, Web Share API, Hebrew keyword landscape Israel
**Confidence:** HIGH for Next.js stack, MEDIUM for Instagram API (requires account setup), MEDIUM for Hebrew keywords (no live search volume data available)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**City landing pages**
- Cities: Tel Aviv and Kfar Saba only (per requirements)
- Access: Fully public — no login required, essential for SEO indexing
- Content: Hero with city name + CTA, upcoming jams in that city, member count/community stats, FAQ section, relevant skills display
- URL structure: Claude's discretion (pick SEO-optimal for Hebrew)

**Meta tags & structured data**
- OG image: One branded AcroHavura image (1200x630) used everywhere
- hreflang: Hebrew + English on all pages
- JSON-LD schemas: Organization, Event (for jams), LocalBusiness (per city), FAQPage (on FAQ sections)
- Hebrew keywords: Claude researches the full Hebrew acroyoga keyword landscape in Israel

**AEO (Answer Engine Optimization)**
- Target AI search engines (ChatGPT, Perplexity, etc.) with well-structured content
- FAQ sections should be written to directly answer common Hebrew acroyoga questions
- Structured data helps AI crawlers understand content

**Instagram embed**
- Account: @acroshay on Instagram
- Placement: Homepage / landing page only
- Layout: Grid of recent posts (6-9 posts), 3x2 or 3x3
- Style: Match brutalist design aesthetic

**Share buttons**
- Pages with share: Jam detail pages, city landing pages, quiz results page
- Platforms: WhatsApp, Native share (Web Share API), copy link, Facebook/Instagram
- UI pattern: Floating share button -> bottom sheet with platform options
- Share preview: Use OG meta tags for rich previews in WhatsApp/social

### Claude's Discretion
- City page URL structure (SEO-optimal for Hebrew)
- Exact Hebrew keywords and meta descriptions
- Instagram embed implementation approach (API vs embed widget)
- Share button animation and positioning
- AEO content structure and FAQ question selection
- OG image design

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-01 | Hebrew SEO optimization (meta tags, structured data, hreflang for אקרויוגה terms) | Next.js `generateMetadata` + `alternates.languages`, `schema-dts` JSON-LD typed schemas, Hebrew keyword landscape section |
| SEO-02 | City landing pages for Tel Aviv and Kfar Saba targeting local acroyoga searches | `generateStaticParams` + ISR pattern, LocalBusiness + FAQPage schemas, English slug recommendation, public route group |
| SEO-03 | Instagram feed embed on public pages | Instagram Graph API with Instagram Login, long-lived token refresh, Next.js ISR cache pattern |
| SEO-04 | Share-to-WhatsApp and social share buttons on jams and profiles | `react-share` library, Web Share API fallback, floating bottom sheet pattern |
</phase_requirements>

---

## Summary

Phase 9 covers four distinct technical domains: (1) Next.js metadata and structured data, (2) city landing pages with SEO content, (3) Instagram feed embedding, and (4) social share buttons. The first two are straightforward using built-in Next.js APIs. The third has a significant prerequisite: the Instagram Basic Display API was **fully deprecated December 4, 2024** and cannot be used. The replacement is the Instagram Graph API with Instagram Login, which requires @acroshay's Instagram account to be a Business or Creator account and requires a one-time token setup. This is the critical path blocker for SEO-03.

The Hebrew acroyoga keyword landscape in Israel reveals two dominant spellings ("אקרויוגה" one word, "אקרו יוגה" two words), a small but active ecosystem of practitioners concentrated in Tel Aviv, and virtually no SEO competition for role-specific, city-specific, or AEO-style question queries. For URL slugs, the recommendation is **English/transliterated slugs** (e.g., `/cities/tel-aviv`) rather than Hebrew characters, because Hebrew URL-encoded strings appear as garbled percent-encoded sequences when shared on WhatsApp and social media — the primary share channel.

The share button system requires no external library for the core floating UI (build it custom using Framer Motion per existing project stack), but `react-share` provides the platform-specific URL formatters for WhatsApp, Facebook, and Instagram. The Web Share API handles iOS/Android native share sheet. Build the bottom sheet as a Radix UI primitive, consistent with existing `@radix-ui` usage in the stack.

**Primary recommendation:** Unblock Instagram embed first (it requires external account verification from the @acroshay account owner). The remaining three areas (metadata, JSON-LD, share buttons) can be implemented in parallel with zero external dependencies.

---

## Standard Stack

### Core (no new packages needed — all built-in)

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Next.js `generateMetadata` | Built into Next.js 16 | Per-page and per-locale metadata, OG tags, hreflang alternates | Official App Router metadata API, zero config |
| `next/og` / `ImageResponse` | Built into Next.js 16 | Dynamic OG image generation (optional; static image chosen) | No install needed |
| `sitemap.ts` file convention | Built into Next.js 16 | Dynamic XML sitemap with locale-aware URLs | No library needed; built-in MetadataRoute.Sitemap |
| `robots.ts` file convention | Built into Next.js 16 | robots.txt generation | Built-in |
| `schema-dts` | 1.1.2 (latest) | TypeScript types for JSON-LD Schema.org vocabulary | Google-maintained, 100k+ weekly downloads, type-only (zero runtime cost) |

### New Packages Required

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `react-share` | ^5.1.0 | WhatsApp, Facebook share URL formatters | Platform share URL generation — don't hand-roll WhatsApp URL encoding |

### Supporting (Instagram Feed)

| Approach | Requirement | Notes |
|----------|------------|-------|
| Instagram Graph API direct | @acroshay must be Business/Creator account | Fetch `GET /me/media` with long-lived token; cache with ISR |
| Token refresh cron | Vercel Cron or one-time manual | Long-lived tokens expire in 60 days; refresh every 50 days |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `schema-dts` | Hand-rolled JSON-LD objects | schema-dts catches schema errors at compile time; hand-rolled allows runtime mistakes |
| `react-share` URL formatters | Hand-rolled WhatsApp URLs | WhatsApp `wa.me` URL encoding is simple enough to hand-roll; but react-share handles all platforms consistently |
| Instagram Graph API | Third-party widget (Elfsight, LightWidget) | Third-party widgets add external JS, CLS, and privacy concerns; Graph API is cleaner but requires account setup |
| Built-in `sitemap.ts` | `next-sitemap` npm package | `next-sitemap` is unnecessary overhead; built-in `sitemap.ts` is simpler and cacheable |

**Installation:**
```bash
npm install schema-dts react-share
```

---

## Architecture Patterns

### Recommended New File Structure for Phase 9

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/              # NEW: public-only route group (no auth)
│   │   │   ├── layout.tsx         # No auth guard; public-safe layout
│   │   │   ├── cities/
│   │   │   │   ├── tel-aviv/
│   │   │   │   │   └── page.tsx   # City landing: Tel Aviv
│   │   │   │   └── kfar-saba/
│   │   │   │       └── page.tsx   # City landing: Kfar Saba
│   │   │   └── page.tsx           # Homepage with Instagram embed
│   │   └── (app)/
│   │       └── jams/
│   │           └── [id]/
│   │               └── page.tsx   # Jam detail (add share button)
│   ├── sitemap.ts                 # Dynamic sitemap (locale-aware)
│   └── robots.ts                  # robots.txt
├── components/
│   ├── seo/
│   │   ├── JsonLd.tsx             # Generic JSON-LD script injector
│   │   └── BreadcrumbJsonLd.tsx   # Breadcrumb schema helper
│   ├── social/
│   │   ├── ShareButton.tsx        # Floating share trigger button
│   │   ├── ShareBottomSheet.tsx   # Bottom sheet with platform options
│   │   └── InstagramGrid.tsx      # Instagram feed grid (client component)
│   └── city/
│       ├── CityHero.tsx
│       ├── CityJamList.tsx        # Upcoming jams in city (RSC)
│       ├── CityStats.tsx          # Member count, jam count
│       └── CityFAQ.tsx            # FAQ with FAQPage schema
├── lib/
│   ├── instagram.ts               # Instagram API client (token fetch + cache)
│   ├── seo/
│   │   ├── metadata.ts            # generateMetadata helper (locale-aware)
│   │   └── schemas.ts             # JSON-LD schema builders (typed via schema-dts)
│   └── share.ts                   # Share URL builders (WhatsApp, copy link)
└── public/
    └── og-image.jpg               # Static 1200x630 branded OG image
```

### Pattern 1: Per-Page Locale-Aware generateMetadata

**What:** Each page (homepage, city pages, jam pages) exports `generateMetadata` that reads locale from params and returns locale-appropriate title, description, OG data, and hreflang alternates.
**When to use:** Every page that needs SEO indexing.

```typescript
// src/lib/seo/metadata.ts
// Source: next-intl.dev/docs/environments/actions-metadata-route-handlers
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

const BASE_URL = 'https://acroretreat.co.il'

export async function buildPageMetadata({
  locale,
  namespace,
  path,
}: {
  locale: string
  namespace: string
  path: string
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace })
  const canonicalHe = `${BASE_URL}/he${path}`
  const canonicalEn = `${BASE_URL}/en${path}`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'he' ? canonicalHe : canonicalEn,
      languages: {
        'he': canonicalHe,
        'en': canonicalEn,
        'x-default': canonicalHe,  // Hebrew is x-default for Israel
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: locale === 'he' ? canonicalHe : canonicalEn,
      siteName: 'AcroHavura',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      alternateLocale: locale === 'he' ? 'en_US' : 'he_IL',
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: locale === 'he' ? 'אקרוחבורה - מצא שותף אקרויוגה' : 'AcroHavura - Find Your Acro Partner',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${BASE_URL}/og-image.jpg`],
    },
  }
}
```

### Pattern 2: JSON-LD Injection via Server Component

**What:** Render `<script type="application/ld+json">` inside RSC body. Use `schema-dts` for TypeScript safety. Sanitize the payload to prevent XSS from user-contributed data that might be embedded in JSON-LD (e.g., jam notes).
**When to use:** Organization schema in root layout, Event in jam pages, LocalBusiness + FAQPage in city pages.

```typescript
// src/components/seo/JsonLd.tsx
// Source: nextjs.org/docs/app/guides/json-ld
// NOTE: The payload must be serialized JSON. Replacing '<' with unicode
// '\u003c' is the standard XSS mitigation for JSON in script tags.
// This is safe because the script type is application/ld+json (not text/javascript).
import type { Thing, WithContext } from 'schema-dts'

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
```

```typescript
// src/lib/seo/schemas.ts — typed schema builders
import type { Organization, LocalBusiness, Event, FAQPage, WithContext } from 'schema-dts'

const BASE_URL = 'https://acroretreat.co.il'

export function buildOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AcroHavura',
    alternateName: 'אקרוחבורה',
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512x512.png`,
    sameAs: ['https://instagram.com/acroshay'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'community',
      availableLanguage: ['Hebrew', 'English'],
    },
  }
}

export function buildLocalBusinessSchema(city: 'tel-aviv' | 'kfar-saba'): WithContext<LocalBusiness> {
  const cityData = {
    'tel-aviv': {
      name: 'AcroHavura Tel Aviv',
      alternateName: 'אקרוחבורה תל אביב',
      address: { addressLocality: 'תל אביב', addressRegion: 'מרכז', addressCountry: 'IL' },
    },
    'kfar-saba': {
      name: 'AcroHavura Kfar Saba',
      alternateName: 'אקרוחבורה כפר סבא',
      address: { addressLocality: 'כפר סבא', addressRegion: 'מרכז', addressCountry: 'IL' },
    },
  }[city]

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cityData.name,
    alternateName: cityData.alternateName,
    url: `${BASE_URL}/he/cities/${city}`,
    address: {
      '@type': 'PostalAddress',
      ...cityData.address,
    },
  }
}

export function buildEventSchema(jam: {
  id: string
  scheduledAt: Date
  location: string
  level: string
}): WithContext<Event> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `ג'אם אקרויוגה - ${jam.location}`,
    startDate: jam.scheduledAt.toISOString(),
    location: {
      '@type': 'Place',
      name: jam.location,
      address: { '@type': 'PostalAddress', addressCountry: 'IL' },
    },
    organizer: { '@type': 'Organization', name: 'AcroHavura', url: BASE_URL },
    url: `${BASE_URL}/he/jams/${jam.id}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  }
}

export function buildFAQSchema(faqs: Array<{ q: string; a: string }>): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}
```

### Pattern 3: City Pages as Static Pre-rendered Public Pages

**What:** City pages live in the `(public)` route group with no auth guard. They use `generateStaticParams` to pre-render at build time and `revalidate` to refresh jam data from DB without a full rebuild.
**When to use:** Tel Aviv and Kfar Saba city landing pages.

```typescript
// src/app/[locale]/(public)/cities/[city]/page.tsx
export const revalidate = 3600 // Revalidate every hour (fresh jams)

export function generateStaticParams() {
  return [
    { locale: 'he', city: 'tel-aviv' },
    { locale: 'he', city: 'kfar-saba' },
    { locale: 'en', city: 'tel-aviv' },
    { locale: 'en', city: 'kfar-saba' },
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>
}) {
  const { locale, city } = await params
  return buildPageMetadata({ locale, namespace: `city.${city}`, path: `/cities/${city}` })
}
```

### Pattern 4: Instagram Feed with Graph API + ISR

**What:** Server Component fetches Instagram posts at build time and revalidates every 6 hours. Token is stored as an env var. Never expose token to client.
**When to use:** Homepage Instagram grid (3x3).

```typescript
// src/lib/instagram.ts
const IG_FIELDS = 'id,caption,media_url,permalink,thumbnail_url,timestamp,media_type'
const IG_BASE = 'https://graph.instagram.com'

export type IgPost = {
  id: string
  caption?: string
  media_url: string
  permalink: string
  thumbnail_url?: string
  timestamp: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

export async function fetchInstagramFeed(limit = 9): Promise<IgPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return []

  const res = await fetch(
    `${IG_BASE}/me/media?fields=${IG_FIELDS}&limit=${limit}&access_token=${token}`,
    { next: { revalidate: 21600 } } // 6-hour ISR cache
  )
  if (!res.ok) {
    console.error('[Instagram] Feed fetch failed:', res.status)
    return []
  }
  const data = await res.json()
  return data.data ?? []
}

// Called by /api/admin/refresh-instagram-token (admin-protected route)
// or by Vercel Cron every 50 days
export async function refreshInstagramToken(): Promise<string | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null
  const res = await fetch(
    `${IG_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  )
  if (!res.ok) return null
  const data = await res.json()
  // After getting data.access_token, update INSTAGRAM_ACCESS_TOKEN in Vercel env
  return data.access_token as string
}
```

**Token setup (one-time, owner of @acroshay must do this):**
1. Convert @acroshay to Business or Creator account in Instagram settings (takes 2 min)
2. Create a Meta App at developers.facebook.com
3. Use the Instagram API with Instagram Login OAuth flow to generate a short-lived token
4. Exchange for a long-lived token via `GET https://graph.instagram.com/access_token`
5. Store as `INSTAGRAM_ACCESS_TOKEN` in Vercel environment variables
6. Set up reminder (or Vercel Cron on Pro plan) to refresh every 50 days

### Pattern 5: Floating Share Button + Bottom Sheet

**What:** A fixed-position floating button on jam detail pages, city pages, and quiz result pages. Clicking opens a Radix UI Dialog used as a bottom sheet with share options.
**When to use:** All pages listed in locked decisions.

```typescript
// src/components/social/ShareBottomSheet.tsx
'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { WhatsappShareButton, FacebookShareButton } from 'react-share'

interface ShareBottomSheetProps {
  url: string
  title: string
  open: boolean
  onClose: () => void
}

export function ShareBottomSheet({ url, title, open, onClose }: ShareBottomSheetProps) {
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url })
    } catch {
      // User cancelled or API not available — fail silently
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    // Show success toast (use existing toast primitive)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed bottom-0 inset-x-0 z-50" aria-label="שתף">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="bg-neutral-900 rounded-t-2xl p-6 border-t-2 border-neutral-100"
              >
                <div className="flex gap-6 justify-around">
                  <WhatsappShareButton url={url} title={title}>
                    <div className="flex flex-col items-center gap-1 text-neutral-200">
                      <span className="text-3xl">WhatsApp</span>
                    </div>
                  </WhatsappShareButton>

                  {canNativeShare && (
                    <button onClick={handleNativeShare} className="flex flex-col items-center gap-1 text-neutral-200">
                      שתף
                    </button>
                  )}

                  <button onClick={handleCopy} className="flex flex-col items-center gap-1 text-neutral-200">
                    העתק קישור
                  </button>

                  <FacebookShareButton url={url}>
                    <div className="flex flex-col items-center gap-1 text-neutral-200">
                      <span>Facebook</span>
                    </div>
                  </FacebookShareButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Pattern 6: Sitemap with Locale-Aware URLs

```typescript
// src/app/sitemap.ts
// Source: nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { jamSessions } from '@/lib/db/schema'
import { gte } from 'drizzle-orm'

const BASE_URL = 'https://acroretreat.co.il'
const LOCALES = ['he', 'en']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/cities/tel-aviv', '/cities/kfar-saba']

  const staticEntries = LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  )

  // Only future jams (past jams have no search value)
  const upcomingJams = await db
    .select({ id: jamSessions.id, scheduledAt: jamSessions.scheduledAt })
    .from(jamSessions)
    .where(gte(jamSessions.scheduledAt, new Date()))

  const jamEntries = upcomingJams.flatMap((jam) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/jams/${jam.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  )

  return [...staticEntries, ...jamEntries]
}
```

### Anti-Patterns to Avoid

- **Hebrew characters in URL slugs:** `/cities/תל-אביב` becomes garbled percent-encoding in WhatsApp previews. Use English slugs: `/cities/tel-aviv`.
- **Using the deprecated Instagram Basic Display API:** Shut down December 4, 2024. Any tutorials referencing it are outdated.
- **Client-side JSON-LD via useEffect:** Bots may not execute JavaScript. JSON-LD must be in the SSR HTML output from Server Components.
- **Exposing Instagram access token to client:** Never use `NEXT_PUBLIC_` prefix for the Instagram token. Keep it server-side only.
- **Fetching Instagram feed on every request:** Use `next: { revalidate: 21600 }` in fetch options. Instagram API has rate limits.
- **Using `navigator.share` without feature detection:** Web Share API is not available on desktop Chrome. Always check existence before calling.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WhatsApp/Facebook share URLs | Custom URL formatters | `react-share` `WhatsappShareButton`, `FacebookShareButton` | Platform URL formats change; react-share handles `wa.me` encoding correctly |
| JSON-LD TypeScript types | Inline untyped objects | `schema-dts` | Schema.org has 900+ types; schema-dts catches `@type` typos at compile time |
| Instagram feed cache | Custom polling | Next.js `fetch` with `next: { revalidate: N }` | Built-in ISR caching is sufficient |
| robots.txt | Static `public/robots.txt` file | Next.js `app/robots.ts` | Dynamic robots.ts can disallow auth routes programmatically |
| Sitemap | `next-sitemap` npm package | Built-in `app/sitemap.ts` | next-sitemap predates native App Router support and adds unnecessary build step |

**Key insight:** The biggest trap in this phase is treating Instagram embed as a simple widget problem. It is an OAuth/API problem with a 60-day token lifecycle that requires the account owner (@acroshay) to complete a one-time setup before any code can run. Plan accordingly.

---

## Hebrew Acroyoga Keyword Landscape (Israel)

This section fulfills the supplementary research task from the phase objective.

### Confirmed Active Competitors (SEO Landscape)

| Site | Domain | Focus |
|------|--------|-------|
| acrobyjoe.com | Studio in Tel Aviv | "סטודיו האקרו יוגה הגדול בישראל" |
| acroisrael.co.il | National community org | Conventions, family acro |
| inbaracro.com | Individual instructor Tel Aviv | Classes, courses |
| naim.org.il/acroyoga | Studio Naim Tel Aviv | Classes |
| tattooedflyer.com | Individual flyer/instructor | Niche community |
| acroretreat.co.il | Existing site being replaced | Previous AcroHavura presence |

**SEO opportunity:** No competitor owns role-specific, city+role combined, or question-form queries. The space is thin enough that well-structured content can rank quickly.

### Core Term Variants (HIGH confidence)

| Hebrew | Notes | Intent |
|--------|-------|--------|
| אקרויוגה | One word — most common spelling | Primary brand keyword |
| אקרו יוגה | Two words — secondary spelling | Use both; cover both spellings in page copy |
| אקרו | Short form | High ambiguity; pair with location or activity |
| אקרובטיקה | Acrobatics | Related practice audience |
| יוגה זוגית | Partner yoga | Related term — slightly different audience |
| אקרובאלאנס | Acrobalance | Used by acroisrael.co.il — professional/family angle |

### City-Specific Queries (MEDIUM confidence)

| Hebrew | Notes |
|--------|-------|
| אקרויוגה בתל אביב | Primary city — all competitors target this |
| אקרויוגה תל אביב | Same without preposition |
| שיעורי אקרו יוגה בתל אביב | "Acro yoga classes in Tel Aviv" — exact phrase from acrobyjoe.com |
| אקרויוגה בכפר סבא | Kfar Saba — **zero competitor pages found** — clear ranking opportunity |
| אקרויוגה כפר סבא | Without preposition |
| אקרויוגה במרכז | "Acro yoga in the center" — covers Sharon / Kfar Saba area |
| אקרויוגה בגוש דן | Greater Tel Aviv area |

### Role-Specific Queries (MEDIUM confidence)

| Hebrew | Translation | Notes |
|--------|-------------|-------|
| בייס אקרויוגה | Base in acroyoga | No competitor page found |
| פלייר אקרויוגה | Flyer in acroyoga | No competitor page found |
| להיות בייס | To be a base | Common beginner question |
| להיות פלייר | To be a flyer | Common beginner question |
| תפקיד בייס | Base role | |
| תפקיד פלייר | Flyer role | |
| ספוטר אקרויוגה | Spotter | Safety role |

### Activity-Specific Queries (MEDIUM confidence)

| Hebrew | Translation | Notes |
|--------|-------------|-------|
| ג'אם אקרויוגה | Acro yoga jam | Facebook group "Acro Tel Aviv נפגשים לעוף" confirms usage |
| ג'אם אקרו | Acro jam | Short form |
| סדנת אקרויוגה | Acro yoga workshop | Competitor pages use "סדנאות" |
| קורס אקרויוגה | Acro yoga course | |
| כנס אקרויוגה | Acro yoga convention | Annual Israel Acro Convention |
| שיעורי אקרויוגה | Acro yoga classes | Direct competitor keyword |
| אימון אקרויוגה | Acro yoga training | |
| מחנה אקרויוגה | Acro yoga camp | |
| ריטריט אקרויוגה | Acro yoga retreat | |

### Question Queries / AEO Targets (MEDIUM confidence)

These are the highest-value AEO targets. FAQ sections should directly answer these. Writing style: direct, conversational Hebrew. Keep answers under 3 sentences for AI citation.

| Hebrew | Translation | AEO Priority |
|--------|-------------|--------------|
| מה זה אקרויוגה | What is acroyoga | HIGH |
| איך מתחילים אקרויוגה | How to start acroyoga | HIGH |
| מי יכול לעשות אקרויוגה | Who can do acroyoga | HIGH |
| כמה עולה אקרויוגה | How much does acroyoga cost | HIGH |
| אקרויוגה למתחילים | Acroyoga for beginners | HIGH |
| האם אקרויוגה מסוכן | Is acroyoga dangerous | MEDIUM |
| מה ההבדל בין בייס לפלייר | What's the difference between base and flyer | MEDIUM |
| אקרויוגה לזוגות | Acroyoga for couples | MEDIUM |
| כמה זמן לוקח ללמוד אקרויוגה | How long to learn acroyoga | MEDIUM |
| אקרויוגה לחברים | Acroyoga for friends | LOW |

### Related Terms (MEDIUM confidence)

| Hebrew | Translation | Relevance |
|--------|-------------|-----------|
| אקרובטיקה זוגית | Partner acrobatics | Close related practice |
| פרטנר יוגה | Partner yoga | Related — slightly different community |
| תרגול זוגי | Partner practice | Generic term |
| חבורת אקרו | Acro group / havura | Maps directly to brand name AcroHavura |
| קהילת אקרויוגה | Acroyoga community | Community angle |
| מפגש אקרו | Acro meetup | Social event term |
| עוף אקרו | Acro fly (verb) | "Come fly with us" — used by acroisrael.co.il |
| האיזון | Balance | Conceptual term in acroyoga culture |

### Recommended Meta Descriptions (Hebrew)

| Page | Hebrew Meta Description (under 160 chars) |
|------|------------------------------------------|
| Homepage | אקרוחבורה — קהילת האקרויוגה הישראלית. מצא שותף לאקרויוגה, הצטרף לג'אמים ותרגל עם אנשים שאוהבים אקרו כמוך. תל אביב, כפר סבא ועוד. |
| Tel Aviv city page | אקרויוגה בתל אביב — מצא שותף אקרויוגה, ג'אמים קרובים ואנשים לתרגל איתם בתל אביב. הצטרף לקהילת אקרוחבורה. |
| Kfar Saba city page | אקרויוגה בכפר סבא — ג'אמים, שותפים ואנשים לתרגל איתם בכפר סבא ובשרון. הצטרף לקהילת אקרוחבורה. |
| Jam detail page | ג'אם אקרויוגה — [date] — [location] — לכל הרמות. הצטרף, שתף ותרגל אקרויוגה עם הקהילה. |

### FAQ Content for City Pages (Hebrew, AEO-optimized)

These should be used verbatim in city page FAQ components and in the `buildFAQSchema` builder. Direct, short answers are preferred for AI citation.

```
Q: מה זה אקרויוגה?
A: אקרויוגה היא שילוב של יוגה, אקרובטיקה ואמנויות ריפוי שמתרגלים בזוגות. יש בייס (המאזן שתומך) ופלייר (זה שטס). אפשר להתחיל ממש מאפס, ללא ניסיון קודם.

Q: מי יכול לעשות אקרויוגה?
A: כל אחד. לא צריך גמישות, כוח מיוחד, או ניסיון קודם. רוב האנשים מתחילים מאפס ומתקדמים מהר עם השותף הנכון.

Q: מה ההבדל בין בייס לפלייר?
A: הבייס שוכב על הגב ותומך ברגליים. הפלייר עולה ו"טס" מעל. כולם מוזמנים לנסות את שני התפקידים.

Q: כמה עולה להצטרף לג'אם באקרוחבורה?
A: רוב הג'אמים חינמיים. חלק מהג'אמים המאורגנים עולים 20-50 ₪. הצטרפות לקהילה חינמית.

Q: איפה מתקיימים ג'אמי אקרויוגה בתל אביב?
A: בפארקים, סטודיואים ומרחבים ציבוריים בתל אביב. פרטים מלאים בלוח הג'אמים באקרוחבורה.

Q: איפה מתקיימים ג'אמי אקרויוגה בכפר סבא?
A: בגנים ציבוריים ובמרחבים פנויים בכפר סבא ובסביבה. הצטרף לאקרוחבורה כדי לראות את הג'אמים הקרובים.

Q: האם אקרויוגה מסוכן?
A: לא יותר מכל ספורט אחר. עם ספוטר ומורה מנוסה, הפציעות נדירות. ג'אמי אקרוחבורה תמיד כוללים ספוטינג.
```

---

## Common Pitfalls

### Pitfall 1: Instagram Basic Display API Still in Use

**What goes wrong:** Developer finds a 2022-2023 tutorial, implements old Instagram integration with `instagram_basic` permission scope. Works in dev with old saved token, silently fails in production.
**Why it happens:** The vast majority of blog posts and tutorials predate the December 4, 2024 deprecation.
**How to avoid:** Use only the Instagram Graph API with Instagram Login (Business Login). The correct endpoint is `https://graph.instagram.com/me/media`. Any tutorial mentioning `instagram_basic` permission scope is outdated.
**Warning signs:** Error response: `{"error":{"message":"(#4) Application request limit reached","type":"OAuthException","code":4}}`

### Pitfall 2: Instagram Long-Lived Token Expiry (60-Day Silent Failure)

**What goes wrong:** Feed works at launch, silently returns empty after 60 days because token expired. Users see blank Instagram grid.
**Why it happens:** Long-lived tokens expire after 60 days if not refreshed.
**How to avoid:** Set up Vercel Cron (Pro plan) or an admin route to refresh the token every 50 days. Log the response. Alert on failure.
**Warning signs:** Instagram grid goes blank. Because `fetchInstagramFeed` returns `[]` on error, the failure is silent — add explicit error logging.

### Pitfall 3: Hebrew URLs Breaking WhatsApp Link Previews

**What goes wrong:** City page at `/cities/תל-אביב` when shared in WhatsApp appears as `/cities/%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91` — looks like a broken or phishing link.
**Why it happens:** WhatsApp and social platforms percent-encode non-ASCII characters in displayed URLs.
**How to avoid:** Use English slugs: `/cities/tel-aviv` and `/cities/kfar-saba`. Page content is Hebrew; only the URL slug is English.
**Warning signs:** Test by sharing the URL in WhatsApp before launch. If the preview shows percent signs, fix the slug.

### Pitfall 4: JSON-LD Injected Client-Side (Not Crawlable)

**What goes wrong:** JSON-LD added via `useEffect` is not in the initial HTML. Google's crawler and Perplexity may not execute JavaScript; schema is invisible.
**Why it happens:** Developer treats JSON-LD like any other dynamic content loaded after mount.
**How to avoid:** Always put JSON-LD in Server Components using the `<script type="application/ld+json">` tag pattern. Next.js RSC renders this in the HTML response.
**Warning signs:** Google Rich Results Test shows "No items detected" despite the JSON-LD being present in the component tree.

### Pitfall 5: Missing `x-default` in hreflang

**What goes wrong:** hreflang only has `he` and `en` but no `x-default`. Google Search Console reports hreflang errors.
**Why it happens:** Developers copy minimal hreflang examples without x-default.
**How to avoid:** Include `'x-default': canonicalHe` in `alternates.languages`. Hebrew is the primary market for this site.
**Warning signs:** Google Search Console shows "Hreflang: missing x-default" warnings.

### Pitfall 6: City Pages Behind Auth Guard

**What goes wrong:** City landing pages accidentally inherit the `(app)` route group's `layout.tsx` which redirects unauthenticated users. Google bots get a 401 or 302 redirect and cannot index the pages.
**Why it happens:** City pages placed inside `(app)` route group instead of `(public)`.
**How to avoid:** City pages MUST be in a `(public)` route group with no auth middleware. Verify in `middleware.ts` that `/cities/*` routes are excluded from the auth guard.
**Warning signs:** Google Search Console shows "Page returned 401/403" or "Redirect" for city page URLs.

### Pitfall 7: `navigator.share` Without Feature Detection

**What goes wrong:** `navigator.share()` throws `TypeError: navigator.share is not a function` on desktop Chrome.
**Why it happens:** Web Share API is supported on mobile browsers but not on most desktop browsers.
**How to avoid:** Check `typeof navigator !== 'undefined' && !!navigator.share` before rendering the native share option. Show WhatsApp + copy link as universal fallback.
**Warning signs:** Share button crashes on desktop during testing. Check browser console for TypeError.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Instagram Basic Display API | Instagram Graph API with Instagram Login | December 4, 2024 (deprecated) | All old tutorials/code is broken; Business account required |
| `next-sitemap` npm package | Built-in `app/sitemap.ts` | Next.js 13.3+ | No external package needed |
| `next/head` for metadata | `generateMetadata` export in page/layout | Next.js 13 App Router | Co-located, SSR-correct, cleaner |
| `next-seo` package | Native `Metadata` API in Next.js | Next.js 13.2+ | next-seo is redundant for App Router |
| FAQ schema only for Google Rich Results | FAQPage schema for AEO / AI search citation | 2024-2025 shift | FAQ schema content cited 40-60% more in ChatGPT/Perplexity answers per AEO research |
| Hebrew percent-encoded URLs | English transliterated slugs | Industry best practice | WhatsApp/social sharing with non-Latin URL chars is UX-broken |

**Deprecated/outdated:**
- `instagram_basic` API permission scope: shut down December 4, 2024
- `next-seo` package: unnecessary for App Router (native Metadata API covers all use cases)
- `next-sitemap` package: built-in `sitemap.ts` is simpler and equivalent

---

## Open Questions

1. **Instagram account type for @acroshay**
   - What we know: Instagram Graph API requires the account to be Business or Creator type
   - What's unclear: Is @acroshay currently a Business or Creator account?
   - Recommendation: Check before planning the Instagram embed task. If personal, add a subtask for account type conversion (2-minute change in Instagram app settings under Account Type).

2. **OG image design assets**
   - What we know: Decision is one static 1200x630 image used everywhere
   - What's unclear: Does a branded 1200x630 OG image already exist, or must it be created?
   - Recommendation: Treat as a distinct asset creation task in Phase 9. It should follow the brutalist visual direction from Phase 2.

3. **City column missing in `jamSessions` schema**
   - What we know: The existing `jamSessions` table (Phase 4) stores `location` as a free-text string. There is no structured `city` field.
   - What's unclear: How to filter jams by city for city landing pages without a city enum
   - Recommendation: Two options: (a) add a `city` text column to `jamSessions` (requires DB migration) and update Phase 4 UI, or (b) parse `location` text and match against known city names. Option (a) is cleaner and search-accurate. This schema decision must be resolved before implementing city page jam lists.

4. **Vercel plan (Cron for token refresh)**
   - What we know: Vercel Cron requires a Pro plan ($20/month); Hobby plan has no Cron support
   - What's unclear: What Vercel plan is this project on?
   - Recommendation: If Hobby plan, build a manual refresh admin route (`/api/admin/refresh-instagram-token`) protected by admin auth, and add a 50-day reminder to the admin panel rather than an automated Cron.

---

## Sources

### Primary (HIGH confidence)

- [Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) — JSON-LD injection pattern, XSS sanitization
- [Next.js sitemap.xml file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — sitemap.ts built-in
- [Next.js robots.txt file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — robots.ts built-in
- [next-intl metadata docs](https://next-intl.dev/docs/environments/actions-metadata-route-handlers) — locale-aware generateMetadata with getTranslations
- [schema-dts npm](https://github.com/google/schema-dts) — Google-maintained TypeScript types for Schema.org; type-only, zero runtime cost
- [Instagram Basic Display API deprecation announcement](https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/) — confirmed December 4, 2024 shutdown
- [Instagram Graph API refresh_access_token reference](https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token/) — 60-day token lifecycle, refresh endpoint and parameters

### Secondary (MEDIUM confidence)

- [react-share GitHub](https://github.com/nygardk/react-share) — WhatsApp/Facebook share URL generation; v5.x, actively maintained
- [acrobyjoe.com](https://acrobyjoe.com/) — Hebrew keyword research: "סטודיו האקרו יוגה הגדול בישראל", "שיעורי אקרו יוגה לכל הרמות"
- [acroisrael.co.il](https://acroisrael.co.il/) — Hebrew keyword research: "בואו לעוף איתנו", "אקרובאלאנס", "הצטרפו למשפחת האקרו"
- [buildwithmatija.com: Next.js hreflang guide](https://www.buildwithmatija.com/blog/nextjs-advanced-seo-multilingual-canonical-tags) — hreflang alternates with next-intl
- [frase.io: AEO and FAQ schema citation rates](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo) — 40-60% citation rate in AI search with FAQPage schema
- [elfsight.com: Instagram Graph API Complete Guide 2026](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/) — current Graph API endpoint structure
- [Facebook group: Acro Tel Aviv](https://www.facebook.com/groups/442651256171805/) — "נפגשים לעוף אקרו תל-אביב" — community language patterns
- [o8.agency: AEO Answer Engine Optimization guide](https://www.o8.agency/blog/ai/answer-engine-optimization-guide) — AEO best practices 2026

### Tertiary (LOW confidence — verify before relying on)

- Hebrew keyword search volumes: No keyword tool access confirmed actual monthly volume for אקרויוגה in Israel. Competitor site analysis confirms the terms are used; actual traffic volumes are unverified.
- Kfar Saba acroyoga search demand: No competitor pages found targeting this city. This is either an untapped opportunity or evidence of low demand. Confidence: LOW. The city page should still be built (it's a requirement and serves real community members), but organic traffic expectations should be conservative.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js metadata APIs and sitemap are official and well-documented; schema-dts is Google-maintained
- Architecture patterns: HIGH — established App Router patterns, verified via official docs
- Instagram embed: MEDIUM — Graph API is confirmed correct; requires one-time account owner action that cannot be tested without real @acroshay credentials
- Hebrew keywords: MEDIUM — competitor site analysis is reliable; actual search volume data requires access to Google Search Console or a keyword tool with Israeli data
- Pitfalls: HIGH — Instagram API deprecation is fact (confirmed official blog post); other pitfalls are standard Next.js gotchas verified by multiple sources

**Research date:** 2026-04-01
**Valid until:** 2026-07-01 (Next.js metadata API is stable; Instagram API changes every 6-12 months — re-check before implementation)

# Phase 3: Community Profiles + Partner Matching — Research

**Researched:** 2026-04-01
**Domain:** Profile management, file upload, partner search/filtering, reviews — all within Next.js 16 App Router + Drizzle + Neon + Vercel Blob + Better Auth
**Confidence:** HIGH (stack verified against Context7 + official docs + current codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Profile page layout:** Full page with distinct sections: hero photo, about, skills, reviews
- **Photo:** Single profile photo (not gallery); storage via Vercel Blob
- **Empty sections:** Show prompts to complete ("Add your bio to help partners find you") — nudge, don't hide
- **Profile info shown:** name, photo, city, role, level, bio, skills checklist, feedback count
- **Partner search filters:** Three only — city/area, role, skill level (NO moves filter)
- **Zero results UX:** Show broadening suggestion ("No exact matches. Try removing the level filter.")
- **Skills checklist:** Organized by category (Standing, L-basing, Inversions, Flows, Washing Machines, etc.); tap-to-toggle pink chip pills (selected = pink bg, unselected = neutral); Claude compiles the move list
- **Skills on other profiles:** Show top 5-8 + "and X more" (expandable)
- **Move data:** Static list in code (not DB-managed)
- **Ratings/Reviews:** Thumbs up/down (not stars); gated by shared jam RSVP; optional 1-2 sentence text comment; PRIVATE — only reviewed person sees; no public rating; profile shows feedback count only ("3 reviews received")

### Claude's Discretion
- Search results display format (card grid vs list rows)
- Filter UI pattern (sticky top vs slide-out panel) — should be mobile-first
- Exact categories and moves in the skills checklist (Claude researches and proposes)
- Profile section ordering and spacing
- How the "X more skills" expansion works (inline expand vs modal)

### Deferred Ideas (OUT OF SCOPE)
- Public review display
- Skills filtering in partner search
- Photo gallery (multiple photos)
- Skill-based matching algorithm (MATCH-01 — V2)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-01 | User can create profile with photo, bio, and city | Vercel Blob client upload pattern + extending user table with `bio` + `imageUrl` columns |
| PROF-02 | User can set acroyoga role preference (base / flyer / both) | Already in user table + onboarding — needs edit UI on profile page |
| PROF-03 | User can set skill level (beginner / intermediate / advanced) | Already in user table + onboarding — needs edit UI on profile page |
| PROF-04 | User can select known moves from standard acroyoga skills checklist | New `userSkills` text[] column on user table; static skills constant; chip UI |
| PROF-05 | User can view other members' profiles | Dynamic route `[userId]` server component; public profile query |
| PROF-06 | User can rate and review partners after completing a jam session together | New `reviews` table; gating logic checks shared jam attendance (stub for Phase 4); thumbs + optional comment |
| COMM-01 | User can search for partners by city, role, skill level, and known moves | `/search` page with server-side Drizzle query; `and()` + `ilike()` + `eq()` filters; searchParams as Promise |
</phase_requirements>

---

## Summary

Phase 3 builds on a working auth/onboarding foundation. The user table already has `city`, `role`, `level`, `preferredLocale`, and `tosAcceptedAt`. Three new concerns are introduced: (1) extending the user profile with `bio`, `imageUrl`, and `skills[]` columns, (2) building a partner search page driven by URL search params and Drizzle filters, and (3) a private review system gated by shared jam attendance.

The photo upload flow uses Vercel Blob's **client-upload** pattern: a server route at `/api/upload/avatar` generates a secure token (gating on auth session), and the browser uploads directly to Blob CDN. After upload completes, the server callback updates `user.image` in the database. The `image` field already exists on the Better Auth user table — no new column needed.

The skills checklist is stored as a Postgres `text[]` array on the user table (straightforward to query, no need for a join table at this scale). A static TypeScript constant defines ~60 moves in ~7 categories compiled from the Partner Acrobatics Manual taxonomy. Partner search uses Drizzle's `and()` + `eq()` + `ilike()` conditional filters driven by `searchParams` (which is a `Promise` in Next.js 15+/16 and must be awaited).

**Primary recommendation:** Use client-side Vercel Blob upload (not server-side) to avoid 4.5 MB serverless body limits; store image URL back to `user.image` via the `onUploadCompleted` callback; keep skills as `text[]` array (not JSONB) for simpler indexing and querying.

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `drizzle-orm` | 0.45.2 | Schema + queries | Already used; add new tables/columns |
| `drizzle-kit` | 0.31.10 | Migrations | `drizzle-kit generate` + `drizzle-kit migrate` |
| `better-auth` | 1.5.6 | Auth + user table | `image` field already exists; extend with `bio`, `skills` via new columns |
| `next-intl` | 4.8.4 | i18n | `getTranslations` (server) / `useTranslations` (client) |
| `react-hook-form` + `zod` | 7.72 / 4.3.6 | Form validation | Already used in auth forms — use same pattern |
| `@neondatabase/serverless` | 1.0.2 | DB driver | Already used |

### New Additions
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@vercel/blob` | latest | Photo upload storage | Locked decision; official Vercel product; handles CDN, tokens, deletion |

**Installation:**
```bash
npm install @vercel/blob
```

**Required env var:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```
Add to Vercel dashboard → Storage → Blob → Connect to project.

### Not Needed
- No image processing library (Vercel Blob stores as-is; `<Image>` handles display optimization)
- No search library (Drizzle + Postgres ilike is sufficient for city/role/level filtering)
- No rating library (custom thumbs UI, not a star-rating widget)

---

## Architecture Patterns

### Recommended Project Structure (additions for Phase 3)

```
src/
├── app/[locale]/
│   ├── (app)/
│   │   ├── profile/
│   │   │   └── edit/
│   │   │       └── page.tsx          # Edit own profile (auth-gated)
│   │   ├── members/
│   │   │   ├── page.tsx              # Partner search (COMM-01)
│   │   │   └── [userId]/
│   │   │       └── page.tsx          # Public profile view (PROF-05)
│   │   └── dashboard/
│   │       └── page.tsx              # (existing)
├── api/
│   ├── upload/
│   │   └── avatar/
│   │       └── route.ts              # Vercel Blob token handler (PROF-01)
│   └── reviews/
│       └── route.ts                  # POST review (PROF-06)
├── components/
│   ├── profile/
│   │   ├── ProfileHero.tsx           # Photo + name + city + role + level
│   │   ├── ProfileBio.tsx            # Bio section with empty-state nudge
│   │   ├── SkillsChecklist.tsx       # Tap-to-toggle chip grid (edit mode)
│   │   ├── SkillsDisplay.tsx         # Top 5-8 + "X more" (view mode)
│   │   ├── ReviewForm.tsx            # Thumbs + comment (gated)
│   │   └── AvatarUpload.tsx          # File input + preview + Blob upload
│   └── members/
│       ├── MemberCard.tsx            # Card in search results
│       ├── MemberFilters.tsx         # City/role/level filter bar (client)
│       └── MembersGrid.tsx           # Grid of MemberCard
├── lib/
│   ├── db/
│   │   └── schema.ts                 # Add bio, skills[], reviews table
│   └── skills-data.ts                # Static acroyoga moves constant
```

### Pattern 1: Vercel Blob Client Upload (PROF-01)

**What:** Browser uploads directly to Vercel Blob CDN. Server route generates a short-lived token; after upload, server callback updates DB with the blob URL.

**Why client-upload (not server-upload):** Next.js serverless functions have a ~4.5 MB body limit. Images easily exceed this. Client upload bypasses the server entirely for the file transfer.

**Server route — token handler:**
```typescript
// src/app/api/upload/avatar/route.ts
// Source: https://vercel.com/docs/vercel-blob/client-upload
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      // Validate auth BEFORE issuing upload token
      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const { userId } = JSON.parse(tokenPayload ?? '{}');
      // Save blob URL back to user.image
      await db.update(user).set({ image: blob.url }).where(eq(user.id, userId));
    },
  });

  return NextResponse.json(jsonResponse);
}
```

**Client component — upload trigger:**
```typescript
// Source: https://vercel.com/docs/vercel-blob/client-upload
'use client';
import { upload } from '@vercel/blob/client';

async function handleFileChange(file: File) {
  const blob = await upload(`avatars/${file.name}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload/avatar',
  });
  // blob.url is the CDN URL — display it immediately
  setPreviewUrl(blob.url);
}
```

**Important:** `access: 'public'` is required for profile photos to be viewable without authentication. The Blob URL is stored directly in `user.image`.

### Pattern 2: Drizzle Schema Extension

**New columns on `user` table:**
```typescript
// src/lib/db/schema.ts — additions to user pgTable
bio: text("bio"),
skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
// Note: user.image already exists (Better Auth core field)
```

**New `reviews` table:**
```typescript
// Source: https://github.com/drizzle-team/drizzle-orm-docs
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  reviewerId: text("reviewer_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  revieweeId: text("reviewee_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  jamSessionId: text("jam_session_id"), // null until Phase 4 — stored for future gating
  thumbsUp: boolean("thumbs_up").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("reviews_reviewee_idx").on(table.revieweeId),
  index("reviews_reviewer_idx").on(table.reviewerId),
]);
```

**Migration workflow:**
```bash
npx drizzle-kit generate   # produces SQL in ./drizzle/
npx drizzle-kit migrate    # applies to Neon
```

### Pattern 3: Partner Search with Conditional Drizzle Filters (COMM-01)

**searchParams is a Promise in Next.js 15+/16** — must be awaited:
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/page (v16.2.2, 2026-03-31)
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; role?: string; level?: string }>;
}) {
  const { city, role, level } = await searchParams;
  // ...
}
```

**Drizzle conditional filter query:**
```typescript
// Source: https://github.com/drizzle-team/drizzle-orm-docs (conditional filters guide)
import { and, eq, ilike } from 'drizzle-orm';

const members = await db
  .select({
    id: user.id,
    name: user.name,
    image: user.image,
    city: user.city,
    role: user.role,
    level: user.level,
    bio: user.bio,
    skills: user.skills,
  })
  .from(user)
  .where(
    and(
      city ? ilike(user.city, `%${city}%`) : undefined,
      role ? eq(user.role, role) : undefined,
      level ? eq(user.level, level) : undefined,
      // Only show users who have accepted TOS (completed sign-up)
      isNotNull(user.tosAcceptedAt),
    )
  )
  .limit(50);
```

**Filter UI recommendation (Claude's Discretion):** Sticky top bar on mobile, inline on desktop. Three filter chips or dropdowns — city (text input with `ilike`), role (segmented: Base / Flyer / Both / All), level (dropdown: All / Beginner / Intermediate / Advanced). Filters are URL-driven (update `searchParams` via `router.push`) so results are shareable and server-rendered.

**Results display recommendation (Claude's Discretion):** Card grid (2-col mobile, 3-col desktop). Each card: avatar, name, city, role badge, level badge, top 3 skills. Clicking navigates to `/members/[userId]`.

### Pattern 4: Dynamic Profile Route (PROF-05)

**Route:** `src/app/[locale]/(app)/members/[userId]/page.tsx`

Route param `userId` is passed as `params: Promise<{ userId: string }>`. Look up user by ID. If not found, `notFound()`.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/page
export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  const session = await getAuthSession();
  if (!session) redirect({ href: '/sign-in', locale });

  const [member] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!member) notFound();

  const isOwnProfile = session.user.id === userId;
  // ...render sections
}
```

### Pattern 5: Skills Static Data (PROF-04)

Skills stored as a static TypeScript constant — not in DB. This makes the checklist fast, avoids N+1 queries, and lets you update the list without a migration.

```typescript
// src/lib/skills-data.ts
export type SkillCategory = {
  id: string;
  label: string;
  moves: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  // See "Proposed Acroyoga Skills List" section below
];

export const ALL_MOVES = SKILL_CATEGORIES.flatMap(c => c.moves);
```

User's known moves stored in `user.skills` as `text[]`. When saving: pass `Array.from(selectedSet)`. When reading: compare against `ALL_MOVES` to handle stale entries gracefully.

### Pattern 6: Private Reviews (PROF-06)

Phase 4 (Jam Board) doesn't exist yet. The review feature must be **built** but the jam-gating logic is a stub for now:

- Build the `reviews` table with `jamSessionId` column (nullable for now).
- On POST `/api/reviews`: validate session, validate revieweeId exists, check `reviewerId !== revieweeId`, check no duplicate review for same pair in last 30 days, insert record.
- Jam-gating stub: in Phase 3, skip the "shared jam" check (or always return `canReview: true` from a helper). When Phase 4 ships, replace stub with real attendance lookup.
- Display: on profile page, show only to the profile owner: "You have X pieces of feedback."

### Anti-Patterns to Avoid

- **Server-uploading images via Next.js API route body:** Hits 4.5 MB serverless limit. Use client-upload pattern always.
- **Storing Blob URL before upload completes:** `onUploadCompleted` is the correct place to write to DB — not the client.
- **Synchronous `searchParams` access:** In Next.js 15+/16, `searchParams` is a Promise. `const { city } = searchParams` (no await) silently gives undefined. Always `await searchParams`.
- **Storing skills as JSONB:** Text array (`text[]`) is simpler, indexed correctly, and avoids the JSONB string-encoding bug in some Drizzle drivers. Use `text("skills").array()`.
- **Deleting old Blob on photo update:** Must call `del(oldUrl)` from `@vercel/blob` when user replaces their photo. Skipping this leaks storage.
- **Using `input: true` for `bio` in Better Auth additionalFields:** The `bio` and `skills` columns are safest managed via the project's own `/api/user/update-profile` route (already established pattern), NOT through Better Auth's `updateUser` client — which only handles `image` and `name` natively.
- **Using `authClient.updateUser` for image:** Better Auth's client `updateUser` can update `image`, but it bypasses the Blob upload auth check and doesn't delete the old blob. Use the Blob `onUploadCompleted` callback to write to `user.image` via Drizzle directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Photo CDN / storage | Custom S3 integration | `@vercel/blob` | Token-based auth, CDN, no config needed on Vercel |
| File upload security | Custom upload auth | `handleUpload` with `onBeforeGenerateToken` | Prevents open upload to your store |
| Conditional query filters | Custom query builder | Drizzle `and()` + `ilike()` + `eq()` | Type-safe, handles `undefined` gracefully |
| Image display optimization | `<img>` tags | Next.js `<Image>` | Auto-WebP, lazy loading, layout shift prevention |
| Form state management | Custom useState per field | `react-hook-form` + `zod` (already in project) | Already established pattern |

---

## Common Pitfalls

### Pitfall 1: searchParams is a Promise (Next.js 15+/16)
**What goes wrong:** `const { city } = searchParams` returns `undefined` silently — filters never apply.
**Why it happens:** Next.js 15 changed `searchParams` from synchronous to Promise. Next.js 16 continues this.
**How to avoid:** Always `const { city } = await searchParams` in async server components.
**Source:** Official Next.js 16.2.2 docs (fetched 2026-03-31, verified).

### Pitfall 2: Vercel Blob body limit bypass required
**What goes wrong:** Uploading image via Next.js API route body (multipart/form-data) fails for images > 4.5 MB.
**Why it happens:** Vercel serverless function body limit.
**How to avoid:** Use client-upload pattern — browser uploads directly to Blob, server only issues token and receives completion callback.

### Pitfall 3: Old blob not deleted on photo replace
**What goes wrong:** Every profile photo update leaks a Blob object. Storage costs accumulate.
**Why it happens:** Uploading a new blob creates a new URL; the old one is orphaned.
**How to avoid:** In `onUploadCompleted`, read `user.image` before updating. If a value exists, call `await del(existingUrl)` from `@vercel/blob`.

### Pitfall 4: Review gating with no Phase 4 jam table
**What goes wrong:** Trying to query a jam attendance table that doesn't exist yet.
**Why it happens:** Phase 4 (Jam Board) ships later.
**How to avoid:** Write the review POST route with a `canReview()` helper stub that returns `true` in Phase 3. Add a `// TODO Phase 4: replace with real jam attendance check` comment. When Phase 4 ships, swap in the real query.

### Pitfall 5: Stale session after profile update
**What goes wrong:** User updates their profile, but the Better Auth session cookie still shows old values.
**Why it happens:** Better Auth session cache; session is not automatically invalidated on DB update.
**How to avoid:** The existing project disables cookie cache (see `auth.ts` comment). Direct Drizzle updates to the `user` table will be reflected on next `getSession()` call. No special action needed for server-side updates.

### Pitfall 6: Profile page accessible without auth
**What goes wrong:** `/members/[userId]` is visible to unauthenticated users.
**Why it happens:** Missing auth guard.
**How to avoid:** Follow existing pattern — `const session = await getAuthSession(); if (!session) redirect(...)` at top of every protected page. This is the project's established pattern (CVE-2025-29927 awareness).

### Pitfall 7: RTL / Hebrew layout breaks on profile
**What goes wrong:** Chip pills, filter bar, and card layouts break in Hebrew RTL mode.
**Why it happens:** CSS `flex` and `grid` are direction-aware but some patterns (absolute positioning, `text-align: left`) hardcode LTR.
**How to avoid:** Use Tailwind `rtl:` variants and avoid hardcoded `left`/`right`. The locale layout already sets `dir="rtl"` on `<html>`.

---

## Code Examples

### Drizzle: text array column with empty default
```typescript
// Source: https://github.com/drizzle-team/drizzle-orm-docs (empty-array-default-value guide)
import { sql } from 'drizzle-orm';
import { text, pgTable } from 'drizzle-orm/pg-core';

// Inside user pgTable definition:
skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
bio: text("bio"),
```

### Drizzle: multi-condition conditional filter
```typescript
// Source: https://github.com/drizzle-team/drizzle-orm-docs (conditional filters guide)
import { and, eq, ilike, isNotNull } from 'drizzle-orm';

const results = await db.select().from(user).where(
  and(
    city   ? ilike(user.city, `%${city}%`)   : undefined,
    role   ? eq(user.role, role)             : undefined,
    level  ? eq(user.level, level)           : undefined,
    isNotNull(user.tosAcceptedAt),
  )
).limit(50);
```

### Next.js 16: awaiting searchParams
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/page (v16.2.2)
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; role?: string; level?: string }>;
}) {
  const { city, role, level } = await searchParams;
  // safe to use now
}
```

### Vercel Blob: delete old before saving new
```typescript
// Source: https://vercel.com/docs/vercel-blob/using-blob-sdk
import { del } from '@vercel/blob';

onUploadCompleted: async ({ blob, tokenPayload }) => {
  const { userId } = JSON.parse(tokenPayload ?? '{}');
  const [existing] = await db.select({ image: user.image }).from(user).where(eq(user.id, userId)).limit(1);
  if (existing?.image) {
    await del(existing.image).catch(() => {}); // non-fatal
  }
  await db.update(user).set({ image: blob.url }).where(eq(user.id, userId));
},
```

---

## Proposed Acroyoga Skills List

**Source:** Compiled from Partner Acrobatics Manual taxonomy (partneracrobatics.com/manual/) — HIGH confidence for category names; individual moves are standard community vocabulary (MEDIUM confidence — user will review).

```typescript
// src/lib/skills-data.ts
export const SKILL_CATEGORIES = [
  {
    id: "warm_ups",
    label: "Warm-Ups & Foundations",
    moves: [
      "Front Plank", "Back Plank", "Throne", "Half Frog",
      "Whale", "Toad", "Folded Leaf", "High Flying Whale",
    ],
  },
  {
    id: "l_basing_basics",
    label: "L-Basing Basics",
    moves: [
      "Bird", "Star", "Side Star", "Folded Bird",
      "Reverse Bird", "Foot to Hand (Low)", "Foot to Hand (High)",
      "Shoulderstand", "Candlestick",
    ],
  },
  {
    id: "l_basing_intermediate",
    label: "L-Basing Intermediate",
    moves: [
      "Bow", "Ninja Star", "Back Bird", "Free Star",
      "Hand to Hand (Low)", "Hand to Hand (Extended)", "Barrel Roll",
      "Bed / Log", "Ballerina",
    ],
  },
  {
    id: "washing_machines",
    label: "Washing Machines",
    moves: [
      "Helicopter", "Boomerang", "Corkscrew", "Catherine's Wheel",
      "Nunchucks", "Monkey Frog", "Star Wars", "Swimming Mermaid",
    ],
  },
  {
    id: "inversions",
    label: "Inversions",
    moves: [
      "Supported Handstand", "Foot to Handstand", "Straddle Bat",
      "Tuck Bat", "Cartwheel Entrance", "Icarian Press",
      "Straight Body Press to Handstand",
    ],
  },
  {
    id: "standing",
    label: "Standing Acrobatics",
    moves: [
      "Shoulder Stand (Standing)", "Vertical Dance",
      "Front Bird (Standing)", "Hand to Hand (Standing)",
      "Back Sit", "Shoulder Sit",
    ],
  },
  {
    id: "flows",
    label: "Flows & Sequences",
    moves: [
      "Bird to Star", "Star to Star", "Star to Throne",
      "Reverse Throne Combo", "F2S to S2F",
      "Ninja Flow", "Washing Machine into Inversion",
    ],
  },
];
```

**Total moves: ~60.** User reviews and approves before Phase 3 ships.

---

## Profile Edit Page Strategy

The edit profile experience has two modes:

1. **Own profile page** (`/members/[userId]`) shows an "Edit Profile" button (only when `isOwnProfile`).
2. **`/profile/edit`** — dedicated edit page with all editable fields.

Alternatively: inline editing sections on own profile page (tap section → editable). Given the existing onboarding wizard pattern (simple state + POST to `/api/user/update-profile`), the simpler approach is a **dedicated `/profile/edit` page** that reuses the existing API route for city/role/level/locale and adds bio and skills saving via a new or extended API route.

**Recommended:** Extend `/api/user/update-profile` to accept `bio` (string, max 500 chars) and `skills` (string[]). Add those columns to the user table. This keeps one canonical update endpoint.

---

## i18n Key Namespaces to Add

New `messages/en.json` namespaces needed:
```json
{
  "profile": {
    "editButton": "Edit Profile",
    "bio": "About",
    "bioPlaceholder": "Tell partners about your acro journey...",
    "bioEmpty": "Add your bio to help partners find you",
    "skills": "Skills",
    "skillsEmpty": "Select your known moves",
    "reviews": "Feedback",
    "reviewsEmpty": "No feedback yet",
    "reviewCount": "{count, plural, one {# review} other {# reviews}} received",
    "photoUpload": "Change Photo",
    "andMore": "and {count} more"
  },
  "members": {
    "title": "Find a Partner",
    "filterCity": "City",
    "filterRole": "Role",
    "filterLevel": "Level",
    "filterAll": "All",
    "noResults": "No partners found",
    "noResultsHint": "Try removing the {filter} filter",
    "searchPlaceholder": "Search by city..."
  },
  "review": {
    "thumbsUp": "Great partner",
    "thumbsDown": "Needs improvement",
    "commentPlaceholder": "Optional note (1-2 sentences)...",
    "submit": "Leave Feedback",
    "success": "Feedback submitted",
    "alreadyReviewed": "You've already reviewed this partner"
  }
}
```

Same keys needed in `messages/he.json` (Hebrew translations).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params`/`searchParams` as sync props | Both are `Promise` — must `await` | Next.js 15 (RC), stable in 15.0 | Breaking if not awaited |
| Server-upload images via API body | Client-upload via Blob token | Best practice always existed | Avoids 4.5 MB body limit |
| Star ratings for reviews | Thumbs up/down (less pressure) | Community trend 2024-2025 | Locked decision |
| Storing enum values as Postgres `ENUM` type | App-level validation on `text` columns | Established in this project (see auth.ts comment) | Easier to extend, no migration for new values |

---

## Open Questions

1. **Who can view profiles — all logged-in users, or only TOS-accepted users?**
   - What we know: TOS acceptance is already tracked (`tosAcceptedAt`); the partner search query filters for `isNotNull(tosAcceptedAt)`.
   - What's unclear: Should profile pages (`/members/[userId]`) be viewable by any logged-in user, or only users who have also accepted TOS?
   - Recommendation: Require both login AND TOS acceptance to view any member profile. Follow the same redirect chain as the dashboard.

2. **Profile completeness score or prompts — how prominent?**
   - What we know: Empty sections show nudge copy ("Add your bio to help partners find you").
   - What's unclear: Is there a single top-of-page banner, or per-section inline prompts?
   - Recommendation: Per-section inline nudges (less intrusive, contextual). No progress bar needed in Phase 3.

3. **Skills chips — all categories visible simultaneously, or tabbed?**
   - What we know: Organized by category; tap-to-toggle pink chips; user decision not specified.
   - Recommendation (Claude's Discretion): All categories visible simultaneously, stacked vertically by category label. No tabs (fewer taps). Scroll-friendly on mobile.

4. **Search results — pagination or infinite scroll?**
   - What we know: Drizzle `.limit(50)` is the practical ceiling for now.
   - Recommendation: No pagination in Phase 3 (50-member limit is fine for early community). Add pagination in a future phase when member count warrants it.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/drizzle-team/drizzle-orm-docs` — array columns, conditional filters, ilike, JSONB
- Context7 `/websites/vercel` — Vercel Blob client-upload, server-side put, delete
- Context7 `/amannn/next-intl` — `getTranslations`, `useTranslations`, server/client patterns
- [Next.js 16.2.2 official docs — page.js](https://nextjs.org/docs/app/api-reference/file-conventions/page) (fetched 2026-03-31) — searchParams as Promise
- [Vercel Blob client-upload docs](https://vercel.com/docs/vercel-blob/client-upload) — handleUpload, onBeforeGenerateToken, onUploadCompleted
- [Vercel Blob SDK docs](https://vercel.com/docs/vercel-blob/using-blob-sdk) — del()
- Project codebase — `schema.ts`, `auth.ts`, `auth-guard.ts`, `update-profile/route.ts`, `OnboardingWizard.tsx`, `messages/en.json`

### Secondary (MEDIUM confidence)
- [Partner Acrobatics Manual — L-Basing](https://partneracrobatics.com/manual/l-basing/) — move names and categories (fetched 2026-04-01)
- [Partner Acrobatics Manual — top-level categories](https://partneracrobatics.com/manual/) — category taxonomy
- [Better Auth — Users & Accounts](https://better-auth.com/docs/concepts/users-accounts) — updateUser, image field, additionalFields
- WebSearch: better-auth server-side updateUser patterns, Next.js image preview, conditional filters

### Tertiary (LOW confidence — flag for validation)
- Specific move names within categories (compiled from manual — user should review for accuracy and local naming conventions in the Israeli acroyoga community)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use or officially documented
- Architecture: HIGH — patterns verified against Context7 + official docs + codebase
- Skills list: MEDIUM — category structure solid; individual move names should be user-reviewed
- Pitfalls: HIGH — searchParams Promise confirmed in official Next.js 16 docs; Blob limit is established; others from codebase patterns

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable libraries; Next.js 16 may have minor updates)

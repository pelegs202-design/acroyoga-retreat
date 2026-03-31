import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const VALID_ROLES = ["base", "flyer", "both"] as const;
const VALID_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const VALID_LOCALES = ["en", "he"] as const;

type ValidRole = (typeof VALID_ROLES)[number];
type ValidLevel = (typeof VALID_LEVELS)[number];
type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidRole(v: unknown): v is ValidRole {
  return typeof v === "string" && VALID_ROLES.includes(v as ValidRole);
}
function isValidLevel(v: unknown): v is ValidLevel {
  return typeof v === "string" && VALID_LEVELS.includes(v as ValidLevel);
}
function isValidLocale(v: unknown): v is ValidLocale {
  return typeof v === "string" && VALID_LOCALES.includes(v as ValidLocale);
}

export async function POST(request: NextRequest) {
  // Validate session server-side
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { city, role, level, preferredLocale } = body;

  // Validate fields if provided
  if (role !== undefined && !isValidRole(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be one of: base, flyer, both" },
      { status: 400 }
    );
  }
  if (level !== undefined && !isValidLevel(level)) {
    return NextResponse.json(
      { error: "Invalid level. Must be one of: beginner, intermediate, advanced" },
      { status: 400 }
    );
  }
  if (preferredLocale !== undefined && !isValidLocale(preferredLocale)) {
    return NextResponse.json(
      { error: "Invalid preferredLocale. Must be one of: en, he" },
      { status: 400 }
    );
  }
  if (city !== undefined && typeof city !== "string") {
    return NextResponse.json({ error: "City must be a string" }, { status: 400 });
  }

  const userId = session.user.id;

  // Build the SET clause dynamically — only update fields that were provided
  // Better Auth generates snake_case columns: preferred_locale
  const updates: { col: string; val: string }[] = [];

  if (city !== undefined) updates.push({ col: "city", val: city as string });
  if (role !== undefined) updates.push({ col: "role", val: role as string });
  if (level !== undefined) updates.push({ col: "level", val: level as string });
  if (preferredLocale !== undefined)
    updates.push({ col: "preferred_locale", val: preferredLocale as string });

  if (updates.length === 0) {
    return NextResponse.json({ ok: true, updated: {} });
  }

  try {
    // Build parameterized SET clause using Drizzle sql template tag
    const setFragment = updates
      .map(({ col, val }) => sql`"${sql.raw(col)}" = ${val}`)
      .reduce((acc, fragment, idx) =>
        idx === 0 ? fragment : sql`${acc}, ${fragment}`
      );

    await db.execute(
      sql`UPDATE "user" SET ${setFragment} WHERE "id" = ${userId}`
    );

    const updated = Object.fromEntries(
      updates.map(({ col, val }) => [col, val])
    );

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error("[update-profile] Error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

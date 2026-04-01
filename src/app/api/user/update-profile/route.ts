import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { ALL_MOVES } from "@/lib/skills-data";

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

  const { city, role, level, preferredLocale, bio, skills } = body;

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
  if (bio !== undefined) {
    if (typeof bio !== "string" || bio.length > 500) {
      return NextResponse.json(
        { error: "Bio must be a string under 500 characters" },
        { status: 400 }
      );
    }
  }
  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every((s) => typeof s === "string")) {
      return NextResponse.json(
        { error: "Skills must be an array of strings" },
        { status: 400 }
      );
    }
    const invalidMoves = (skills as string[]).filter((s) => !ALL_MOVES.includes(s));
    if (invalidMoves.length > 0) {
      return NextResponse.json(
        { error: `Unknown moves: ${invalidMoves.join(", ")}` },
        { status: 400 }
      );
    }
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
  if (bio !== undefined) updates.push({ col: "bio", val: bio as string });

  if (updates.length === 0 && skills === undefined) {
    return NextResponse.json({ ok: true, updated: {} });
  }

  try {
    if (updates.length > 0) {
      // Build parameterized SET clause using Drizzle sql template tag
      const setFragment = updates
        .map(({ col, val }) => sql`"${sql.raw(col)}" = ${val}`)
        .reduce((acc, fragment, idx) =>
          idx === 0 ? fragment : sql`${acc}, ${fragment}`
        );

      await db.execute(
        sql`UPDATE "user" SET ${setFragment} WHERE "id" = ${userId}`
      );
    }

    // Skills is a text[] array — use Drizzle typed update for correct array serialization
    if (skills !== undefined) {
      await db
        .update(user)
        .set({ skills: skills as string[] })
        .where(eq(user.id, userId));
    }

    const updated = Object.fromEntries(
      updates.map(({ col, val }) => [col, val])
    );
    if (skills !== undefined) updated.skills = skills as unknown as string;

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error("[update-profile] Error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

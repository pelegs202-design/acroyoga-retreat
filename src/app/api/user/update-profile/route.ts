import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, pushQueue } from "@/lib/db/schema";
import { sql, eq, and, inArray, gte } from "drizzle-orm";
import { ALL_MOVES } from "@/lib/skills-data";
import { queuePushNotification } from "@/lib/notifications";

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

    // ─── Partner-match push trigger (non-blocking) ────────────────────────────
    // Only fire if city, role, or level was included and has a non-empty value
    const hasMeaningfulLocationOrRoleUpdate =
      (city !== undefined && typeof city === "string" && city.trim().length > 0) ||
      (role !== undefined && typeof role === "string" && role.trim().length > 0) ||
      (level !== undefined && typeof level === "string" && level.trim().length > 0);

    if (hasMeaningfulLocationOrRoleUpdate) {
      // Fire partner-match in background — never block the profile update response
      (async () => {
        try {
          // Fetch the updated user's current city, role, level from DB
          const [updatedUser] = await db
            .select({
              id: user.id,
              name: user.name,
              city: user.city,
              role: user.role,
              level: user.level,
            })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

          if (!updatedUser || !updatedUser.city || !updatedUser.role || !updatedUser.level) {
            return; // Incomplete profile — skip matching
          }

          // Complementary roles
          const { role: updatedRole, level: updatedLevel, city: updatedCity } = updatedUser;

          const complementaryRoles: string[] =
            updatedRole === "base"
              ? ["flyer", "both"]
              : updatedRole === "flyer"
              ? ["base", "both"]
              : ["base", "flyer", "both"]; // 'both' matches all

          // Same or adjacent levels
          const compatibleLevels: string[] =
            updatedLevel === "beginner"
              ? ["beginner", "intermediate"]
              : updatedLevel === "intermediate"
              ? ["beginner", "intermediate", "advanced"]
              : ["intermediate", "advanced"];

          // Query matching users (same city, complementary role, adjacent level)
          const matchedUsers = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(
              and(
                eq(user.city, updatedCity),
                inArray(user.role, complementaryRoles),
                inArray(user.level, compatibleLevels),
                // Exclude the updated user themselves
                sql`${user.id} != ${userId}`,
              )
            );

          if (matchedUsers.length === 0) return;

          // Israel timezone start-of-today (UTC+3)
          const israelOffsetMs = 3 * 60 * 60 * 1000;
          const nowMs = Date.now();
          const israelMs = nowMs + israelOffsetMs;
          const ilDate = new Date(israelMs);
          // Start of today in Israel time, converted back to UTC
          const israelMidnightUTC = new Date(
            Date.UTC(ilDate.getUTCFullYear(), ilDate.getUTCMonth(), ilDate.getUTCDate())
          );
          const startOfIsraelToday = new Date(israelMidnightUTC.getTime() - israelOffsetMs);

          for (const matchedUser of matchedUsers) {
            // Rate limit: max 1 partner_match push per user per Israel day
            const [existingToday] = await db
              .select({ id: pushQueue.id })
              .from(pushQueue)
              .where(
                and(
                  eq(pushQueue.userId, matchedUser.id),
                  eq(pushQueue.eventType, "partner_match"),
                  gte(pushQueue.queuedAt, startOfIsraelToday),
                )
              )
              .limit(1);

            if (existingToday) continue; // Already notified today — skip

            const notifBody = `A new ${updatedRole} in ${updatedCity} just joined`;
            await queuePushNotification(
              matchedUser.id,
              "partner_match",
              "New partner near you",
              notifBody,
              `/members/${userId}`,
            );
          }
        } catch (err) {
          console.error("[update-profile] Partner-match push error:", err);
          // Non-blocking — profile update already succeeded
        }
      })();
    }

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error("[update-profile] Error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

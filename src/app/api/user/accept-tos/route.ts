import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tosAcceptances } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  // Validate session server-side
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  // Get IP address from request headers
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;

  try {
    // 1. Insert row in tosAcceptances table for version audit history
    await db.insert(tosAcceptances).values({
      id: crypto.randomUUID(),
      userId,
      tosVersion: "v1",
      acceptedAt: now,
      ipAddress,
    });

    // 2. Update the user's tosAcceptedAt field via raw SQL
    // (Better Auth additionalField marked input:false — cannot be set via authClient.updateUser)
    // Better Auth generates 'user' table with snake_case columns: tos_accepted_at
    await db.execute(
      sql`UPDATE "user" SET "tos_accepted_at" = ${now} WHERE "id" = ${userId}`
    );

    return NextResponse.json({ ok: true, tosAcceptedAt: now.toISOString() });
  } catch (err) {
    console.error("[accept-tos] Error:", err);
    return NextResponse.json(
      { error: "Failed to record TOS acceptance" },
      { status: 500 }
    );
  }
}

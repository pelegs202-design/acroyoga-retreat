import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

const VALID_DAYS = ["mon", "wed", "fri", "sat"];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { sessionId?: string; day?: string };

  if (!body.day || !VALID_DAYS.includes(body.day)) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  // Update the most recent enrollment (sessionId may be 'unknown' from webhook)
  // Use the most recent confirmed enrollment as target
  try {
    const updated = await db
      .update(challengeEnrollments)
      .set({ firstClassDay: body.day })
      .where(sql`id = (SELECT id FROM challenge_enrollments WHERE status = 'confirmed' ORDER BY paid_at DESC LIMIT 1)`)
      .returning({ id: challengeEnrollments.id });

    if (updated.length === 0) {
      return NextResponse.json({ error: "No enrollment found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, day: body.day });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

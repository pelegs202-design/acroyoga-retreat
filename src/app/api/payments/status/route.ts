import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session");

  if (!sessionId) {
    return NextResponse.json({ enrolled: false });
  }

  const [enrollment] = await db
    .select({ id: challengeEnrollments.id })
    .from(challengeEnrollments)
    .where(eq(challengeEnrollments.sessionId, sessionId))
    .limit(1);

  return NextResponse.json({ enrolled: !!enrollment });
}

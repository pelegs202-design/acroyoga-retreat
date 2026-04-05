import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEnrollments } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(challengeEnrollments);

  return NextResponse.json({ count: Number(row?.count ?? 0) });
}

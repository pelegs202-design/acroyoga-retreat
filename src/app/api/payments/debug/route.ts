import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const GI_BASE_URL = process.env.GI_SANDBOX === 'true'
  ? 'https://sandbox.d.greeninvoice.co.il/api/v1'
  : 'https://api.greeninvoice.co.il/api/v1';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session");

  if (!sessionId) {
    return NextResponse.json({ error: "No session" });
  }

  // Get email from quiz lead
  const [lead] = await db
    .select({ email: quizLeads.email })
    .from(quizLeads)
    .where(eq(quizLeads.sessionId, sessionId))
    .limit(1);

  if (!lead) {
    return NextResponse.json({ error: "No lead found", sessionId });
  }

  // Get GI token
  const tokenRes = await fetch(`${GI_BASE_URL}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: process.env.GI_API_KEY_ID,
      secret: process.env.GI_API_KEY_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "GI auth failed", status: tokenRes.status, body: await tokenRes.text() });
  }

  const { token } = await tokenRes.json();

  // Search documents for this email
  const searchBody = {
    page: 1,
    pageSize: 5,
    sort: 'createdAt',
    direction: 'desc',
    type: [320, 305, 400, 100],
    fromDate: '2026-01-01',
    toDate: new Date().toISOString().split('T')[0],
    client: {
      emails: [lead.email],
    },
  };

  const searchRes = await fetch(`${GI_BASE_URL}/documents/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(searchBody),
  });

  const searchData = await searchRes.json();

  return NextResponse.json({
    email: lead.email,
    giBaseUrl: GI_BASE_URL,
    searchStatus: searchRes.status,
    searchBody,
    searchResponse: searchData,
  });
}

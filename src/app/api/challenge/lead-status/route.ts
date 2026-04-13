import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = ["new", "booked", "attended", "converted", "no-show", "lost"];

/**
 * GET /api/challenge/lead-status
 * Update a quiz lead's status. Used from notification emails to mark leads.
 *
 * Query params: ?session={sessionId}&status={newStatus}
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  const status = request.nextUrl.searchParams.get("status");

  if (!sessionId || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid session or status" }, { status: 400 });
  }

  try {
    const updated = await db
      .update(quizLeads)
      .set({ leadStatus: status })
      .where(eq(quizLeads.sessionId, sessionId))
      .returning({ id: quizLeads.id, name: quizLeads.name });

    if (updated.length === 0) {
      return new Response(html("Lead not found", "❌"), { status: 404, headers: { "Content-Type": "text/html" } });
    }

    return new Response(
      html(`${updated[0].name} marked as <strong>${status}</strong>`, "✅"),
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  } catch (err) {
    console.error("[lead-status] Failed:", err);
    return new Response(html("Failed to update", "❌"), { status: 500, headers: { "Content-Type": "text/html" } });
  }
}

function html(message: string, emoji: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Lead Status</title></head>
<body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:white;">
<div style="text-align:center;"><p style="font-size:48px;margin:0;">${emoji}</p><p style="font-size:18px;margin:12px 0;">${message}</p>
<a href="javascript:window.close()" style="color:#F472B6;">Close</a></div></body></html>`;
}

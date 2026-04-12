import { NextRequest, NextResponse } from "next/server";
import { sendFacebookEvent } from "@/lib/facebook-capi";

/**
 * Server-side PageView event for Facebook CAPI.
 * Called from the client on challenge page load.
 * Sends IP + user agent + fbclid/fbp for matching (no PII needed).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fbclid, fbp } = body as {
      url?: string;
      fbclid?: string;
      fbp?: string;
    };

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    // Fire and don't block the response
    sendFacebookEvent({
      eventName: "PageView",
      fbclid: fbclid || undefined,
      fbp: fbp || undefined,
      sourceUrl: url || undefined,
      eventId: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      clientIp,
      clientUserAgent,
    }).catch((err) => {
      console.error("[tracking/pageview] CAPI error:", err);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

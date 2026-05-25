import { NextRequest, NextResponse } from "next/server";
import { sendFacebookEvent } from "@/lib/facebook-capi";

/**
 * Server-side tracking endpoint for Facebook CAPI.
 *
 * Always fires PageView. When `lpVariant` is supplied (warm-lead landing pages),
 * ALSO fires ViewContent with content_category = `lp_<variant>` — this is the
 * higher-quality signal Meta uses to build LP-specific lookalikes and to
 * remarket to viewers of a specific audience segment.
 *
 * The event_id is propagated from the client so the in-browser pixel and the
 * server-side CAPI fire are deduplicated by Meta (no double-counting).
 *
 * Sends IP + user agent + fbclid/fbp for matching (no PII needed).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fbclid, fbp, lpVariant, eventId } = body as {
      url?: string;
      fbclid?: string;
      fbp?: string;
      lpVariant?: string;
      /** Optional client-generated id, so client Pixel + server CAPI dedupe. */
      eventId?: string;
    };

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    const baseId =
      eventId || `pv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Always fire PageView (matches every browser-side fbq('track','PageView'))
    sendFacebookEvent({
      eventName: "PageView",
      fbclid: fbclid || undefined,
      fbp: fbp || undefined,
      sourceUrl: url || undefined,
      eventId: baseId,
      clientIp,
      clientUserAgent,
    }).catch((err) => {
      console.error("[tracking/pageview] PageView CAPI error:", err);
    });

    // Fire ViewContent ONLY for the warm-lead LPs so we don't pollute the
    // funnel for the rest of the site.
    if (lpVariant) {
      sendFacebookEvent({
        eventName: "ViewContent",
        fbclid: fbclid || undefined,
        fbp: fbp || undefined,
        sourceUrl: url || undefined,
        // Distinct eventId from PageView — they're different Meta events.
        // Same suffix so logs can be correlated.
        eventId: `vc_${baseId}`,
        clientIp,
        clientUserAgent,
        contentCategory: `lp_${lpVariant}`,
        lpVariant,
      }).catch((err) => {
        console.error("[tracking/pageview] ViewContent CAPI error:", err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

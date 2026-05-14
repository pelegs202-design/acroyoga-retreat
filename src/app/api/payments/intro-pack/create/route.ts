import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizLeads, classSlots, classBookings } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  createIntroPackCheckoutUrl,
  INTRO_PACK_PRICE_ILS,
} from "@/lib/green-invoice/client";
import { sendFacebookEvent } from "@/lib/facebook-capi";

const SOFT_HOLD_MINUTES = 10;

/**
 * POST /api/payments/intro-pack/create
 *
 * Body: { sessionId?, name, phone, slotId, lpVariant, lpPath, locale }
 *
 * Soft-holds the slot for 10 min, creates a GI hosted-checkout doc,
 * returns the hosted-checkout URL for the client to navigate to.
 *
 * If GI fails, the pending booking row is rolled back so the slot
 * isn't poisoned for the next user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sessionId?: string;
      name?: string;
      phone?: string;
      slotId?: string;
      lpVariant?: string;
      lpPath?: string;
      locale?: string;
    };

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const slotId = body.slotId?.trim();
    const lpVariant = body.lpVariant;
    const lpPath = body.lpPath ?? "direct";
    const locale = body.locale ?? "he";

    if (!name || !phone || !slotId) {
      return NextResponse.json(
        { error: "Missing name, phone, or slotId" },
        { status: 400 },
      );
    }

    // ─── 1. Validate slot exists + is active + in the future ───
    const [slot] = await db
      .select()
      .from(classSlots)
      .where(and(eq(classSlots.id, slotId), eq(classSlots.active, true)))
      .limit(1);

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    if (slot.date.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Slot is in the past" }, { status: 409 });
    }

    // ─── 2. Capacity check (pending + paid count against capacity) ───
    const [usageRow] = await db
      .select({ taken: sql<number>`count(*)::int` })
      .from(classBookings)
      .where(
        and(
          eq(classBookings.slotId, slotId),
          inArray(classBookings.status, ["pending", "paid"]),
        ),
      );

    const taken = Number(usageRow?.taken ?? 0);
    if (taken >= slot.capacity) {
      return NextResponse.json({ error: "Slot is full" }, { status: 409 });
    }

    // ─── 3. Upsert quizLeads row ───
    // Direct path: no quiz session exists yet — create a fresh sessionId.
    // Quiz path: caller passes the existing sessionId; we look it up first.
    let leadId: string;
    let leadEmail: string | null = null;

    if (body.sessionId) {
      const [existing] = await db
        .select({ id: quizLeads.id, email: quizLeads.email })
        .from(quizLeads)
        .where(eq(quizLeads.sessionId, body.sessionId))
        .limit(1);
      if (existing) {
        leadId = existing.id;
        leadEmail = existing.email;
      } else {
        // Session id provided but not found — fall through to insert
        leadId = crypto.randomUUID();
        await db.insert(quizLeads).values({
          id: leadId,
          sessionId: body.sessionId,
          quizType: "intro_pack",
          name,
          // quiz_leads.email is NOT NULL; synthesise a placeholder until GI returns the real one
          email: `${body.sessionId}@unknown.acrohavura`,
          phone,
          answers: "{}",
        });
      }
    } else {
      // Direct path — fresh session id
      const newSessionId = crypto.randomUUID();
      leadId = crypto.randomUUID();
      await db.insert(quizLeads).values({
        id: leadId,
        sessionId: newSessionId,
        quizType: "intro_pack",
        name,
        email: `${newSessionId}@unknown.acrohavura`,
        phone,
        answers: "{}",
      });
    }

    // ─── 4. Create pending booking with 10-min soft-hold ───
    const paymentSessionId = crypto.randomUUID();
    const bookingId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SOFT_HOLD_MINUTES * 60 * 1000);

    await db.insert(classBookings).values({
      id: bookingId,
      slotId,
      leadId,
      paymentSessionId,
      status: "pending",
      lpVariant: lpVariant ?? null,
      lpPath,
      expiresAt,
    });

    // ─── 5. Ask GI for a hosted-checkout URL ───
    let paymentUrl: string;
    try {
      paymentUrl = await createIntroPackCheckoutUrl({
        paymentSessionId,
        name,
        email: leadEmail && !leadEmail.endsWith("@unknown.acrohavura") ? leadEmail : undefined,
        phone,
        locale,
      });
    } catch (giErr) {
      // GI failed — roll back the pending row so the slot isn't poisoned
      await db
        .delete(classBookings)
        .where(eq(classBookings.id, bookingId));
      console.error("[intro-pack/create] GI checkout creation failed:", giErr);
      return NextResponse.json(
        { error: "Payment provider unavailable, please try again" },
        { status: 502 },
      );
    }

    // ─── 6. Fire CAPI InitiateCheckout (non-blocking) ───
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    sendFacebookEvent({
      eventName: "InitiateCheckout",
      phone,
      value: INTRO_PACK_PRICE_ILS,
      currency: "ILS",
      eventId: `intropack_checkout_${paymentSessionId}`,
      sourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://acroyoga-academy.vercel.app"}/${locale}/lp/checkout`,
      clientIp,
      clientUserAgent,
      contentCategory: "intro_pack",
      lpVariant,
      lpPath,
    }).catch((err) => {
      console.error("[intro-pack/create] CAPI InitiateCheckout failed:", err);
    });

    return NextResponse.json({
      ok: true,
      url: paymentUrl,
      paymentSessionId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: unknown) {
    console.error("[intro-pack/create] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

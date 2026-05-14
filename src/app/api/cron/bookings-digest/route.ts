import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { classBookings, classSlots, quizLeads } from "@/lib/db/schema";
import { and, eq, gte, lte, isNull, isNotNull, sql } from "drizzle-orm";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "AcroHavura <shai@acroretreat.co.il>";
const NOTIFY_EMAIL = process.env.ADMIN_DIGEST_EMAIL ?? "pelegs202@gmail.com";

/**
 * GET /api/cron/bookings-digest
 *
 * Daily digest emailed to the admin:
 *  - Yesterday's classes: paid bookings missing first_attended_at (need marking)
 *  - Refund-eligible right now: paid + attended within last 48 hours
 *  - Counts of pending soft-holds expiring soon
 *
 * Runs daily at ~6 AM IL via vercel.json.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!resend) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set" }, { status: 200 });
  }

  const now = new Date();
  const yesterdayStart = new Date(now);
  yesterdayStart.setUTCHours(0, 0, 0, 0);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const todayStart = new Date(yesterdayStart);
  todayStart.setUTCDate(todayStart.getUTCDate() + 1);

  // ─── A. Bookings from yesterday's classes that need attendance marking ───
  const needAttendance = await db
    .select({
      id: classBookings.id,
      leadName: quizLeads.name,
      leadPhone: quizLeads.phone,
      slotLabelHe: classSlots.labelHe,
      slotDate: classSlots.date,
    })
    .from(classBookings)
    .innerJoin(classSlots, eq(classBookings.slotId, classSlots.id))
    .innerJoin(quizLeads, eq(classBookings.leadId, quizLeads.id))
    .where(
      and(
        eq(classBookings.status, "paid"),
        isNull(classBookings.firstAttendedAt),
        gte(classSlots.date, yesterdayStart),
        lte(classSlots.date, todayStart),
      ),
    );

  // ─── B. Refund-eligible right now ───
  const refundEligible = await db
    .select({
      id: classBookings.id,
      leadName: quizLeads.name,
      leadPhone: quizLeads.phone,
      slotLabelHe: classSlots.labelHe,
      firstAttendedAt: classBookings.firstAttendedAt,
    })
    .from(classBookings)
    .innerJoin(classSlots, eq(classBookings.slotId, classSlots.id))
    .innerJoin(quizLeads, eq(classBookings.leadId, quizLeads.id))
    .where(
      and(
        eq(classBookings.status, "paid"),
        isNotNull(classBookings.firstAttendedAt),
        sql`${classBookings.firstAttendedAt} > now() - interval '48 hours'`,
      ),
    );

  // ─── C. Quick funnel snapshot ───
  const variantStats = await db
    .select({
      lpVariant: classBookings.lpVariant,
      paid: sql<number>`count(*) filter (where ${classBookings.status} in ('paid','completed','refunded'))::int`,
      refunded: sql<number>`count(*) filter (where ${classBookings.status} = 'refunded')::int`,
    })
    .from(classBookings)
    .groupBy(classBookings.lpVariant);

  // ─── Skip the email if there's literally nothing to report ───
  if (needAttendance.length === 0 && refundEligible.length === 0 && variantStats.every((s) => Number(s.paid) === 0)) {
    return NextResponse.json({ ok: true, sent: false, reason: "nothing to report" });
  }

  const fmt = (iso: string | Date) => new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

  const attendanceRows = needAttendance.length === 0
    ? "<p style='color:#666'>None — all yesterday's classes have their attendance marked. ✓</p>"
    : `<table style="border-collapse:collapse;width:100%;font-size:14px">
        <thead><tr style="background:#222;color:#fff">
          <th align="left" style="padding:6px 10px">שם</th>
          <th align="left" style="padding:6px 10px">טלפון</th>
          <th align="left" style="padding:6px 10px">שיעור</th>
          <th align="left" style="padding:6px 10px">ID</th>
        </tr></thead>
        <tbody>${needAttendance.map((b) => `
          <tr style="border-bottom:1px solid #ddd">
            <td style="padding:6px 10px">${b.leadName}</td>
            <td style="padding:6px 10px"><a href="https://wa.me/${b.leadPhone.replace(/[+\s-]/g, "")}">${b.leadPhone}</a></td>
            <td style="padding:6px 10px">${b.slotLabelHe} · ${fmt(b.slotDate)}</td>
            <td style="padding:6px 10px"><code style="font-size:11px">${b.id.slice(0, 8)}</code></td>
          </tr>`).join("")}
        </tbody>
      </table>`;

  const refundRows = refundEligible.length === 0
    ? "<p style='color:#666'>None.</p>"
    : `<table style="border-collapse:collapse;width:100%;font-size:14px">
        <thead><tr style="background:#222;color:#fff">
          <th align="left" style="padding:6px 10px">שם</th>
          <th align="left" style="padding:6px 10px">טלפון</th>
          <th align="left" style="padding:6px 10px">שיעור</th>
          <th align="left" style="padding:6px 10px">השתתף ב</th>
        </tr></thead>
        <tbody>${refundEligible.map((b) => `
          <tr style="border-bottom:1px solid #ddd">
            <td style="padding:6px 10px">${b.leadName}</td>
            <td style="padding:6px 10px">${b.leadPhone}</td>
            <td style="padding:6px 10px">${b.slotLabelHe}</td>
            <td style="padding:6px 10px">${fmt(b.firstAttendedAt!)}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;

  const funnelRows = variantStats.length === 0
    ? "<p style='color:#666'>No paid bookings yet.</p>"
    : `<table style="border-collapse:collapse;width:100%;font-size:14px">
        <thead><tr style="background:#222;color:#fff">
          <th align="left" style="padding:6px 10px">Variant</th>
          <th align="right" style="padding:6px 10px">Paid</th>
          <th align="right" style="padding:6px 10px">Refunded</th>
        </tr></thead>
        <tbody>${variantStats.map((s) => `
          <tr style="border-bottom:1px solid #ddd">
            <td style="padding:6px 10px"><strong>${s.lpVariant ?? "unknown"}</strong></td>
            <td style="padding:6px 10px" align="right">${s.paid}</td>
            <td style="padding:6px 10px" align="right">${s.refunded}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#111;max-width:720px">
      <h2 style="margin-bottom:0">📋 Intro-pack daily digest</h2>
      <p style="color:#666;font-size:13px;margin-top:4px">${fmt(now)} · /admin/funnel/lp + /admin/bookings</p>

      <h3 style="margin-top:24px">⚠ Need attendance marked (yesterday's classes)</h3>
      ${attendanceRows}

      <h3 style="margin-top:24px">🕒 Refund-eligible right now (within 48h of class 1)</h3>
      ${refundRows}

      <h3 style="margin-top:24px">📊 Funnel snapshot</h3>
      ${funnelRows}

      <p style="margin-top:32px;font-size:12px;color:#888">
        Auto-generated. Reply via WhatsApp to customers as needed.
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject: `📋 Intro-pack digest · ${needAttendance.length} need attendance · ${refundEligible.length} refund-window`,
    html,
  });

  if (error) {
    console.error("[bookings-digest] Resend failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    emailId: data?.id,
    attendanceCount: needAttendance.length,
    refundEligibleCount: refundEligible.length,
  });
}

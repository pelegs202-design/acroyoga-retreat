import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { gte, desc } from "drizzle-orm";

const TO_EMAIL = "pelegs202@gmail.com";
const TEST_MARKERS = ["test", "Test", "Resend", "example.com", "+972541234567"];
const CITY: Record<string, string> = { "tel-aviv": "תל אביב", "kfar-saba": "כפר סבא", other: "מחוץ לאזור" };
const ARCH: Record<string, string> = { explorer: "מגלה", athlete: "אתלט", artist: "אמן", connector: "מחבר" };

/**
 * GET /api/admin/leads-digest
 * One-shot: emails a digest of real leads from the last N days with pre-written
 * Hebrew WhatsApp messages for the free trial class. Defaults to 7 days.
 */
export async function GET(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") || "7");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const allLeads = await db
    .select()
    .from(quizLeads)
    .where(gte(quizLeads.createdAt, cutoff))
    .orderBy(desc(quizLeads.createdAt));

  const real = allLeads.filter((l) => {
    const s = (l.name || "") + (l.email || "") + (l.phone || "");
    return !TEST_MARKERS.some((m) => s.includes(m));
  });

  const rows = real
    .map((l) => {
      const firstName = (l.name || "").split(" ")[0];
      const phoneDigits = (l.phone || "").replace(/\D/g, "");
      const waText = `היי ${firstName}! ראיתי שמילאת את השאלון של אקרוחבורה 🤸

שיעור הניסיון הראשון במתנה — בלי התחייבות, רק להגיע ולנסות.

יש לנו שיעורים ביום שני ורביעי ב-18:30 ו-19:45 (רוקח 40, ת״א · חניה חינם), ובשישי/שבת ב-13:30 (חוף צ׳ארלס קלור).

מתאים לך שאשריין לך מקום? אני שי, המדריך — אשמח לענות על כל שאלה!`;
      const waLink = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}`;
      const created = new Date(l.createdAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
      const badge =
        l.leadStatus && l.leadStatus !== "new"
          ? `<span style="background:#F472B6;color:#000;padding:2px 8px;font-size:11px;font-weight:bold;border-radius:4px;">${l.leadStatus}${l.firstClassDay ? " · " + l.firstClassDay : ""}</span>`
          : `<span style="background:#dc2626;color:white;padding:2px 8px;font-size:11px;font-weight:bold;border-radius:4px;">NEW</span>`;

      return `
        <div style="border:1px solid #333;border-radius:8px;margin-bottom:16px;overflow:hidden;">
          <div style="background:#111;padding:10px 14px;">
            <div><strong style="color:white;font-size:15px;">${l.name}</strong>
              <span style="color:#888;font-size:12px;margin-left:8px;">${CITY[l.city || ""] || l.city || "—"} · ${ARCH[l.resultType || ""] || l.resultType || "—"}</span>
            </div>
            <div style="margin-top:6px;">${badge}</div>
          </div>
          <div style="padding:10px 14px;background:#1a1a1a;font-size:13px;color:#ccc;">
            <div style="margin-bottom:4px;">📞 <a href="https://wa.me/${phoneDigits}" style="color:#25D366;">${l.phone}</a></div>
            <div style="margin-bottom:4px;">📧 ${l.email}</div>
            <div style="color:#666;font-size:11px;">נוצר: ${created}</div>
          </div>
          <div style="padding:12px 14px;background:#0a0a0a;color:#d4d4d4;font-size:13px;direction:rtl;text-align:right;line-height:1.6;border-top:1px solid #222;">
            ${waText.replace(/\n/g, "<br>")}
          </div>
          <div style="padding:10px 14px;background:#111;">
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:white;padding:10px 20px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:13px;">שלח בוואטסאפ ←</a>
          </div>
        </div>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;background:#000;padding:20px;">
      <h1 style="color:#F472B6;margin:0 0 4px;font-size:22px;">לידים ${days} ימים אחרונים</h1>
      <p style="color:#888;margin:0 0 20px;font-size:13px;">${real.length} לידים אמיתיים</p>
      ${rows || '<p style="color:#888;">אין לידים חדשים.</p>'}
      <p style="color:#555;font-size:11px;margin-top:20px;text-align:center;">AcroHavura · נשלח ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}</p>
    </div>`;

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "AcroHavura <shai@inetclash.com>",
    to: TO_EMAIL,
    subject: `🎯 לידים ${days} ימים (${real.length}) · הודעות וואטסאפ מוכנות`,
    html,
  });

  if (error) return NextResponse.json({ error, count: real.length }, { status: 500 });
  return NextResponse.json({ ok: true, messageId: data?.id, count: real.length });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notificationPreferences, dripEnrollments } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { verifyUnsubToken } from "@/lib/email";
import { nanoid } from "nanoid";

// ─── GET /api/unsubscribe — link-click unsubscribe from email footer ───

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  if (!token || !uid) {
    return unsubPage(false, getLocaleFromRequest(request));
  }

  // Verify token
  if (!verifyUnsubToken(token, uid)) {
    return unsubPage(false, getLocaleFromRequest(request));
  }

  await performUnsub(uid);

  return unsubPage(true, getLocaleFromRequest(request));
}

// ─── POST /api/unsubscribe — RFC 8058 one-click from email client ───

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  if (!token || !uid) {
    return NextResponse.json({ error: "Missing token or uid" }, { status: 400 });
  }

  if (!verifyUnsubToken(token, uid)) {
    return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 400 });
  }

  await performUnsub(uid);

  // Per RFC 8058: return 200 (email client expects this, not a redirect)
  return NextResponse.json({ ok: true, unsubscribed: true });
}

// ─── performUnsub ───

async function performUnsub(userId: string): Promise<void> {
  // Upsert notificationPreferences — set emailMarketing=false
  // If no row exists, insert with emailMarketing=false (other channels remain at defaults)
  await db
    .insert(notificationPreferences)
    .values({
      userId,
      emailMarketing: false,
      pushEnabled: true,
      whatsappEnabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
    })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { emailMarketing: false },
    });

  // Cancel all active email_nurture drip enrollments for this user
  await db
    .update(dripEnrollments)
    .set({
      cancelledAt: new Date(),
      cancelReason: "opted_out",
    })
    .where(
      and(
        eq(dripEnrollments.userId, userId),
        eq(dripEnrollments.sequenceType, "email_nurture"),
        isNull(dripEnrollments.cancelledAt),
        isNull(dripEnrollments.completedAt),
      ),
    );
}

// ─── getLocaleFromRequest ───

function getLocaleFromRequest(request: NextRequest): "he" | "en" {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().includes("he") ? "he" : "en";
}

// ─── unsubPage — returns a minimal HTML confirmation page ───

function unsubPage(success: boolean, locale: "he" | "en"): NextResponse {
  const isHe = locale === "he";
  const dir = isHe ? "rtl" : "ltr";

  const title = success
    ? (isHe ? "בוטלה ההרשמה לדיוור" : "Unsubscribed Successfully")
    : (isHe ? "קישור לא תקין" : "Invalid Link");

  const heading = success
    ? (isHe ? "הוסרת מרשימת הדיוור" : "You've Been Unsubscribed")
    : (isHe ? "קישור לא תקין" : "Invalid Unsubscribe Link");

  const body = success
    ? (isHe
        ? "הוסרת בהצלחה מרשימת המיילים השיווקיים. תמשיך/י לקבל מיילים עסקיים (אישורים, תזכורות לשיעורים)."
        : "You have been successfully removed from marketing emails. You will still receive transactional emails (confirmations, session reminders).")
    : (isHe
        ? "הקישור שבו השתמשת אינו תקין. אם ברצונך להסיר את עצמך, נסה שוב מתוך המייל."
        : "The link you used is invalid. If you'd like to unsubscribe, please try again from the email.");

  const status = success ? 200 : 400;

  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #fafafa;
      font-family: 'Heebo', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #111;
      border: 2px solid ${success ? "#F472B6" : "#444"};
      padding: 40px 32px;
    }
    .label {
      color: ${success ? "#F472B6" : "#888"};
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    p {
      color: #a1a1a1;
      font-size: 15px;
      line-height: 1.7;
    }
    .home-link {
      display: inline-block;
      margin-top: 24px;
      color: #F472B6;
      font-size: 14px;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="label">AcroHavura</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com"}" class="home-link">
      ${isHe ? "חזור לאתר" : "Back to site"}
    </a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

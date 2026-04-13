/**
 * Lead notification sender via Resend.
 * Sends prioritized lead alerts to pelegs202@gmail.com when new quiz leads arrive.
 * Also sends payment confirmation emails to customers.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "AcroHavura <shai@acroretreat.co.il>";
const NOTIFY_EMAIL = "pelegs202@gmail.com";

export async function notifyNewLead(lead: {
  name: string;
  email: string;
  phone: string;
  archetype?: string;
  fear?: string;
  commitment?: string;
  experience?: string;
  city?: string;
  dreamOutcome?: string;
  bodyType?: string;
  schedule?: string;
  availability?: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[notify] RESEND_API_KEY not set — skipping lead notification");
    return;
  }

  const phone = lead.phone.replace("+", "").replace(/[-\s]/g, "");
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    `היי ${lead.name.split(" ")[0]}! ראיתי שמילאת את השאלון של אקרוחבורה. רציתי לשאול אם את/ה מעוניין/ת להצטרף לאתגר? אני שי, המדריך - אשמח לענות על כל שאלה!`
  )}`;

  // Calculate priority score
  let score = 0;
  const flags: string[] = [];
  if (lead.commitment === "3-plus") { score += 40; flags.push("commit=3+"); }
  else if (lead.commitment === "2") { score += 30; flags.push("commit=2"); }
  else if (lead.commitment === "1") { score += 10; flags.push("commit=1 (weak)"); }
  else if (lead.commitment === "just-browsing") { score -= 20; flags.push("JUST BROWSING"); }
  if (lead.city === "tel-aviv" || lead.city === "kfar-saba") { score += 20; }
  else if (lead.city === "other") { score -= 30; flags.push("OUT OF AREA"); }
  if (lead.fear === "ready") { score += 20; flags.push("ready to go!"); }
  if (lead.dreamOutcome === "friends" || lead.dreamOutcome === "skill" || lead.dreamOutcome === "strong") score += 10;
  if (lead.availability === "yes-full") score += 10;
  else if (lead.availability === "no" || lead.availability === "half") { score -= 20; flags.push("LOW AVAILABILITY"); }

  const priority = score >= 60 ? "HOT" : score >= 30 ? "WARM" : "COLD";
  const priorityColor = priority === "HOT" ? "#ff0000" : priority === "WARM" ? "#ff8c00" : "#666";
  const priorityEmoji = priority === "HOT" ? "🔥" : priority === "WARM" ? "🟡" : "❄️";

  const LABELS: Record<string, string> = {
    "never": "אפס ניסיון", "few-times": "ניסה פעם-פעמיים", "sometimes": "מתרגל פה ושם", "instructor": "מדריך",
    "3-plus": "3+ בשבוע", "2": "2 בשבוע", "1": "פעם בשבוע", "just-browsing": "רק מתעניין",
    "ready": "מוכן/ה!", "not-good-enough": "פחד לא מספיק טוב", "socially-awkward": "פחד חברתי",
    "wont-commit": "פחד לא להתמיד", "injury": "פחד מפציעה", "not-flexible": "לא גמיש", "need-partner": "אין פרטנר",
    "tel-aviv": "תל אביב", "kfar-saba": "כפר סבא", "other": "מחוץ לאזור",
    "skill": "לשלוט בתנוחות", "strong": "להרגיש חזק", "friends": "למצוא חברים", "no-expectations": "ללא ציפיות",
    "slim-avg": "רזה/ממוצע", "athletic": "ספורטיבי", "slightly-over": "קצת מעל", "significantly-over": "משקל עודף",
    "morning": "בוקר", "evening": "ערב", "weekend": "סופ\"ש", "flexible": "גמיש",
    "yes-full": "פנוי כל החודש", "yes-mostly": "ברוב הזמן", "half": "חצי חודש", "no": "לא זמין",
  };
  const label = (v?: string) => v ? (LABELS[v] || v) : "—";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px;">
      <div style="background: ${priorityColor}; color: white; padding: 8px 16px; font-weight: bold; font-size: 18px;">
        ${priorityEmoji} ${priority} LEAD: ${lead.name} (score: ${score})
      </div>
      ${flags.length ? `<div style="background: #fff3cd; color: #856404; padding: 6px 16px; font-size: 13px;">${flags.join(" · ")}</div>` : ""}
      <table style="margin-top: 12px; font-size: 14px; width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999; width: 100px;">Phone</td><td style="padding: 6px 0;"><a href="${waLink}" style="color: #25D366; font-weight: bold;">${lead.phone}</a></td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Email</td><td style="padding: 6px 0;">${lead.email}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">City</td><td style="padding: 6px 0;">${label(lead.city)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Archetype</td><td style="padding: 6px 0;">${lead.archetype || "—"}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Commitment</td><td style="padding: 6px 0; font-weight: bold;">${label(lead.commitment)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Fear</td><td style="padding: 6px 0;">${label(lead.fear)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Dream</td><td style="padding: 6px 0;">${label(lead.dreamOutcome)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Experience</td><td style="padding: 6px 0;">${label(lead.experience)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Body</td><td style="padding: 6px 0;">${label(lead.bodyType)}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 6px 12px 6px 0; color: #999;">Schedule</td><td style="padding: 6px 0;">${label(lead.schedule)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #999;">Available</td><td style="padding: 6px 0;">${label(lead.availability)}</td></tr>
      </table>
      <p style="margin-top: 16px;"><a href="${waLink}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">WhatsApp ${lead.name.split(" ")[0]} &rarr;</a></p>
    </div>
  `;

  const subject = `${priorityEmoji} ${priority}: ${lead.name} (${label(lead.city)}, ${label(lead.commitment)})`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject,
    html,
  });

  if (error) {
    console.error("[notify] Resend send failed:", error);
  } else {
    console.log(`[notify] Lead notification sent for ${lead.name}`);
  }
}

/**
 * Send a payment confirmation email to the customer with their success page link.
 */
export async function sendPaymentConfirmation(params: {
  customerEmail: string;
  customerName: string;
  sessionId: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[notify] RESEND_API_KEY not set — skipping payment confirmation");
    return;
  }

  const firstName = params.customerName.split(" ")[0];
  const successUrl = `https://acroyoga-academy.vercel.app/he/quiz/challenge/success?session=${params.sessionId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; direction: rtl; text-align: right;">
      <div style="background: #0a0a0a; padding: 32px; border-radius: 12px;">
        <h1 style="color: #F472B6; margin: 0 0 8px;">!${firstName} ברוכים הבאים</h1>
        <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          התשלום התקבל בהצלחה! אתם רשומים לאתגר שבועיים של אקרוחבורה.
        </p>
        <a href="${successUrl}" style="display: inline-block; background: #F472B6; color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 900; font-size: 16px; border-radius: 0;">
          כניסה לעמוד האישי שלכם
        </a>
        <p style="color: #737373; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">
          בעמוד תוכלו לבחור יום ראשון, להוסיף ליומן, ולראות את כל הפרטים.
        </p>
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <p style="color: #525252; font-size: 12px; margin: 0;">
          שאלות? שלחו הודעה לשי — <a href="https://wa.me/972544280347" style="color: #F472B6;">WhatsApp</a>
        </p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.customerEmail,
    subject: "אקרוחבורה — התשלום התקבל! הנה הגישה שלכם",
    html,
  });

  if (error) {
    console.error("[notify] Payment confirmation send failed:", error);
  } else {
    console.log(`[notify] Payment confirmation sent to ${params.customerEmail}`);
  }
}

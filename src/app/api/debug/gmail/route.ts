import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "AcroHavura <shai@acroretreat.co.il>";

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" });
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: "pelegs202@gmail.com",
      subject: "Resend Test " + new Date().toISOString(),
      html: "<h2 style='color:#F472B6'>Resend is working!</h2><p>Lead notifications will come from this address.</p>",
    });

    if (error) {
      return NextResponse.json({
        error: "Send failed",
        details: error,
        from: fromEmail,
        apiKeyPrefix: apiKey.substring(0, 8) + "...",
      });
    }

    return NextResponse.json({
      ok: true,
      messageId: data?.id,
      from: fromEmail,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: "Exception",
      message: err instanceof Error ? err.message : String(err),
      from: fromEmail,
    });
  }
}

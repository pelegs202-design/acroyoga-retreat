import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({
      error: "Missing env vars",
      has_client_id: !!clientId,
      has_client_secret: !!clientSecret,
      has_refresh_token: !!refreshToken,
    });
  }

  // Try to get access token
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: "Token refresh failed",
        status: res.status,
        details: data,
      });
    }

    // Try sending a test email
    const accessToken = data.access_token;
    const testSubject = "Gmail Test " + new Date().toISOString();
    const headers = [
      `From: AcroHavura <pelegs202@gmail.com>`,
      `To: pelegs202@gmail.com`,
      `Subject: ${testSubject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      "<p>Gmail is working! Token refreshed successfully.</p>",
    ].join("\r\n");

    const raw = Buffer.from(headers)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const sendData = await sendRes.json();

    return NextResponse.json({
      token_refresh: "ok",
      send_status: sendRes.status,
      send_result: sendData,
      subject: testSubject,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: "Exception",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

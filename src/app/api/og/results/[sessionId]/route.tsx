import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getSessionResult } from "@/lib/quiz/get-session-result";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  // Validate UUID format
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return new Response("Invalid session", { status: 400 });
  }

  let archetypeName = { en: "Your Acro Type", he: "הטיפוס שלך" };
  let leadName = "";

  try {
    const data = await getSessionResult(sessionId);
    if (data) {
      archetypeName = data.result.name;
      leadName = data.lead.name;
    }
  } catch (e) {
    console.error("OG image: failed to fetch session", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Pink border frame */}
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, bottom: 20, border: "3px solid #F472B6", display: "flex" }} />

        {/* Brand */}
        <div style={{ position: "absolute", top: 40, right: 50, display: "flex", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
          <span style={{ color: "#F472B6" }}>ACRO</span>
          <span style={{ color: "#ffffff" }}>HAVURA</span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {leadName && <p style={{ color: "#999", fontSize: 24, margin: 0 }}>{leadName}</p>}
          <h1 style={{ color: "#F472B6", fontSize: 96, fontWeight: 900, margin: 0, lineHeight: 1 }}>{archetypeName.he}</h1>
          <div style={{ width: 80, height: 4, backgroundColor: "#F472B6" }} />
          <p style={{ color: "#ededed", fontSize: 32, margin: 0, fontStyle: "italic" }}>{archetypeName.en}</p>
        </div>

        {/* Bottom CTA */}
        <div style={{ position: "absolute", bottom: 50, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ backgroundColor: "#F472B6", color: "#0a0a0a", padding: "12px 32px", fontSize: 24, fontWeight: 900 }}>
            גלו את הטיפוס שלכם
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}

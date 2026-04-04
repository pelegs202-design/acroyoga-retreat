import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ARCHETYPE_NAMES: Record<string, { en: string; he: string }> = {
  explorer: { en: "The Explorer", he: "החוקר" },
  athlete: { en: "The Athlete", he: "הספורטאי" },
  connector: { en: "The Connector", he: "המחבר" },
  artist: { en: "The Artist", he: "האמן" },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  let archetypeName = ARCHETYPE_NAMES.explorer;
  let leadName = "";

  try {
    // Fetch from our own API instead of importing DB directly
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/quiz/results/${sessionId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.result?.name) archetypeName = data.result.name;
      if (data.lead?.name) leadName = data.lead.name;
    }
  } catch (e) {
    console.error("OG image fetch error:", e);
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
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, bottom: 20, border: "3px solid #F472B6", display: "flex" }} />

        <div style={{ position: "absolute", top: 40, right: 50, display: "flex", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
          <span style={{ color: "#F472B6" }}>ACRO</span>
          <span style={{ color: "#ffffff" }}>HAVURA</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {leadName && <p style={{ color: "#999", fontSize: 24, margin: 0 }}>{leadName}</p>}
          <h1 style={{ color: "#F472B6", fontSize: 96, fontWeight: 900, margin: 0, lineHeight: 1 }}>{archetypeName.he}</h1>
          <div style={{ width: 80, height: 4, backgroundColor: "#F472B6" }} />
          <p style={{ color: "#ededed", fontSize: 32, margin: 0, fontStyle: "italic" }}>{archetypeName.en}</p>
        </div>

        <div style={{ position: "absolute", bottom: 50, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ backgroundColor: "#F472B6", color: "#0a0a0a", padding: "12px 32px", fontSize: 24, fontWeight: 900 }}>
            Take the Quiz
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

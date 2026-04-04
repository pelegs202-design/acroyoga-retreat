import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateResult } from "@/lib/quiz/result-calculator";

export const runtime = "edge";

const ARCHETYPE_LABELS: Record<string, { en: string; he: string }> = {
  explorer: { en: "The Explorer", he: "החוקר" },
  athlete: { en: "The Athlete", he: "הספורטאי" },
  connector: { en: "The Connector", he: "המחבר" },
  artist: { en: "The Artist", he: "האמן" },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  let archetypeId = "explorer";
  let leadName = "";

  try {
    const rows = await db
      .select({ answers: quizLeads.answers, name: quizLeads.name })
      .from(quizLeads)
      .where(eq(quizLeads.sessionId, sessionId))
      .limit(1);

    if (rows.length > 0) {
      const answers = JSON.parse(rows[0].answers) as Record<string, string>;
      archetypeId = calculateResult(answers).id;
      leadName = rows[0].name;
    }
  } catch {
    // Fallback to default archetype
  }

  const archetype = ARCHETYPE_LABELS[archetypeId] ?? ARCHETYPE_LABELS.explorer;

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
        {/* Pink accent border frame */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "3px solid #F472B6",
            display: "flex",
          }}
        />

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 50,
            display: "flex",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#F472B6" }}>ACRO</span>
          <span style={{ color: "#ffffff" }}>HAVURA</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {leadName && (
            <p style={{ color: "#999", fontSize: 24, margin: 0 }}>
              {leadName}
            </p>
          )}

          <h1
            style={{
              color: "#F472B6",
              fontSize: 96,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1,
            }}
          >
            {archetype.he}
          </h1>

          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: "#F472B6",
            }}
          />

          <p
            style={{
              color: "#ededed",
              fontSize: 32,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {archetype.en}
          </p>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              backgroundColor: "#F472B6",
              color: "#0a0a0a",
              padding: "12px 32px",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            גלו את הטיפוס שלכם
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

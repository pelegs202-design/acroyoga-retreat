import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Font,
  Preview,
} from "@react-email/components";

// ─── Brand tokens ───
const BRAND = {
  bg: "#0a0a0a",
  surface: "#111111",
  pink: "#F472B6",
  pinkGlow: "#fce7f3",
  white: "#FAFAFA",
  muted: "#A1A1A1",
  border: "#222222",
  gold: "#fbbf24",
};

interface CompletionCertificateProps {
  name: string;
  completionDate: string; // ISO date string
  locale: "he" | "en";
}

const CONTENT = {
  he: {
    preview: "סיימת את האתגר! הנה התעודה שלך",
    badge: "תעודת סיום",
    heading: "כל הכבוד!",
    subheading: "סיימת את אתגר האקרויוגה",
    certificateLabel: "תעודת הצטיינות",
    certificateText: (name: string) => `ניתנת בזאת ל-${name}`,
    achievement: "על השלמה מוצלחת של אתגר האקרויוגה",
    dateLabel: "תאריך:",
    signedBy: "צוות AcroHavura",
    shareHeading: "שתף/י את ההישג שלך",
    shareText:
      "סיימת משהו שלא כולם מצליחים. שתף/י את התעודה שלך בסוציאל או בוואטסאפ ותן/תני לאחרים להיות מונעים.",
    shareButton: "שתף/י את התעודה",
    whatNext: "מה הלאה?",
    nextSteps: [
      "הצטרף/י לאתגר הבא ברמה גבוהה יותר",
      "מצא/י שותפים חדשים לתרגול בפלטפורמה",
      "שתף/י את הניסיון שלך בקהילה",
    ],
    nextButton: "חזור/י לפלטפורמה",
    footer:
      "זהו מייל עסקי. אתה מקבל אותו כי השלמת את האתגר. שאלות? השב למייל זה.",
  },
  en: {
    preview: "You completed the challenge! Here's your certificate",
    badge: "Certificate of Completion",
    heading: "Congratulations!",
    subheading: "You completed the AcroYoga Challenge",
    certificateLabel: "Certificate of Excellence",
    certificateText: (name: string) => `This is to certify that ${name}`,
    achievement: "has successfully completed the AcroYoga Challenge",
    dateLabel: "Date:",
    signedBy: "The AcroHavura Team",
    shareHeading: "Share Your Achievement",
    shareText:
      "You completed something not everyone manages. Share your certificate on social or WhatsApp and let others be inspired.",
    shareButton: "Share Your Certificate",
    whatNext: "What's Next?",
    nextSteps: [
      "Join the next challenge at a higher level",
      "Find new practice partners on the platform",
      "Share your experience with the community",
    ],
    nextButton: "Return to Platform",
    footer:
      "This is a transactional email. You received it because you completed the challenge. Questions? Reply to this email.",
  },
};

export default function CompletionCertificate({
  name,
  completionDate,
  locale = "he",
}: CompletionCertificateProps) {
  const t = CONTENT[locale];
  const isHe = locale === "he";
  const dir = isHe ? "rtl" : "ltr";

  const formattedDate = new Date(completionDate).toLocaleDateString(
    isHe ? "he-IL" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com";
  const certificateUrl = `${appUrl}/certificate/${encodeURIComponent(name)}`;

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <Font
          fontFamily="Heebo"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysd0mm_00.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Heebo"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysd0mm_00.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{t.preview}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, margin: 0, padding: 0, fontFamily: "Heebo, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>

          {/* Hero */}
          <Section style={{ backgroundColor: BRAND.surface, border: `2px solid ${BRAND.gold}`, padding: "40px 24px", textAlign: "center", marginBottom: "0" }}>
            <Text style={{ fontSize: "48px", margin: "0 0 8px 0" }}>🏆</Text>
            <Text style={{ color: BRAND.gold, fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
              {t.badge}
            </Text>
            <Text style={{ color: BRAND.white, fontSize: "42px", fontWeight: 700, margin: "0 0 8px 0", lineHeight: "1.1" }}>
              {t.heading}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: "18px", margin: "0" }}>
              {t.subheading}
            </Text>
          </Section>

          {/* Certificate section — screenshot-friendly */}
          <Section
            style={{
              background: "linear-gradient(135deg, #1a0520 0%, #0d0d1a 50%, #0a1a12 100%)",
              border: `3px solid ${BRAND.gold}`,
              borderTop: "none",
              padding: "40px 32px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Corner decorations */}
            <Text style={{ color: BRAND.gold, fontSize: "20px", margin: "0 0 16px 0" }}>
              ✦ ─────── ✦ ─────── ✦
            </Text>

            <Text style={{ color: BRAND.gold, fontSize: "13px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0" }}>
              {t.certificateLabel}
            </Text>

            <Text style={{ color: BRAND.muted, fontSize: "15px", margin: "0 0 8px 0" }}>
              {t.certificateText(name)}
            </Text>

            <Text style={{ color: BRAND.white, fontSize: "28px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "1px" }}>
              {name}
            </Text>

            <Text style={{ color: BRAND.pinkGlow, fontSize: "15px", margin: "0 0 24px 0", fontStyle: "italic" }}>
              {t.achievement}
            </Text>

            <Hr style={{ borderColor: BRAND.gold, borderStyle: "dashed", margin: "0 0 16px 0" }} />

            <Text style={{ color: BRAND.muted, fontSize: "13px", margin: "0 0 4px 0" }}>
              {t.dateLabel} {formattedDate}
            </Text>
            <Text style={{ color: BRAND.pink, fontSize: "14px", fontWeight: 700, margin: "0 0 16px 0" }}>
              {t.signedBy}
            </Text>

            <Text style={{ color: BRAND.gold, fontSize: "20px", margin: "0" }}>
              ✦ ─────── ✦ ─────── ✦
            </Text>
          </Section>

          {/* Share CTA */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, padding: "32px 24px", textAlign: "center" }}>
            <Text style={{ color: BRAND.pink, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px 0" }}>
              {t.shareHeading}
            </Text>
            <Text style={{ color: BRAND.white, fontSize: "15px", lineHeight: "1.7", margin: "0 0 24px 0" }}>
              {t.shareText}
            </Text>
            <Button
              href={certificateUrl}
              style={{
                backgroundColor: BRAND.pink,
                color: "#000000",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px 32px",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "8px",
              }}
            >
              {t.shareButton}
            </Button>
          </Section>

          <Hr style={{ borderColor: BRAND.border, margin: "0" }} />

          {/* Next steps */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, borderBottom: `2px solid ${BRAND.pink}`, padding: "24px" }}>
            <Text style={{ color: BRAND.pink, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              {t.whatNext}
            </Text>
            {t.nextSteps.map((step, i) => (
              <Text key={i} style={{ color: BRAND.white, fontSize: "15px", margin: "0 0 10px 0" }}>
                {"→ "}{step}
              </Text>
            ))}
            <Hr style={{ borderColor: BRAND.border, margin: "16px 0" }} />
            <Button
              href={appUrl}
              style={{
                backgroundColor: "transparent",
                color: BRAND.pink,
                fontWeight: 700,
                fontSize: "14px",
                padding: "12px 24px",
                textDecoration: "none",
                display: "inline-block",
                border: `2px solid ${BRAND.pink}`,
              }}
            >
              {t.nextButton}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ padding: "24px 0" }}>
            <Text style={{ color: BRAND.border, fontSize: "11px", textAlign: "center", margin: "0" }}>
              {t.footer}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

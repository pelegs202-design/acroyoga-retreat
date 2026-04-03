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
  pinkDark: "#db2777",
  white: "#FAFAFA",
  muted: "#A1A1A1",
  border: "#222222",
};

interface ChallengeConfirmationProps {
  name: string;
  cohortStartDate: string; // ISO date string e.g. "2026-05-01"
  locale: "he" | "en";
}

const CONTENT = {
  he: {
    preview: "ברוך הבא לאתגר האקרויוגה — אתה בפנים!",
    heading: "אתה בפנים! 🎉",
    subheading: "אתגר האקרויוגה מתחיל בקרוב",
    intro: (name: string, date: string) =>
      `היי ${name}! אנחנו שמחים לבשר לך שההרשמה שלך לאתגר האקרויוגה אושרה. האתגר מתחיל ב-${date}.`,
    whatToExpect: "מה לצפות:",
    expectations: [
      "שיעורים קבוצתיים שבועיים עם מדריכים מוסמכים",
      "קהילה תומכת של מתרגלים בכל הרמות",
      "תכנים בלעדיים וטיפים לשיפור הטכניקה",
      "אפשרות להכיר שותפים לתרגול בקרבתך",
    ],
    whatToBring: "מה להביא:",
    bringItems: [
      "בגדים נוחים לתרגול",
      "מזרן יוגה (אם יש)",
      "בקבוק מים",
      "פתיחות וחיוך 😊",
    ],
    waGroup: "הצטרף לקבוצת הוואטסאפ של הקהילה:",
    waButton: "הצטרף לקבוצה",
    calCta: "הוסף ליומן שלך",
    footer:
      "זהו מייל עסקי. אתה מקבל אותו כי נרשמת לאתגר. שאלות? השב למייל זה.",
    regards: "בברכה,\nצוות AcroHavura",
  },
  en: {
    preview: "Welcome to the AcroYoga Challenge — you're in!",
    heading: "You're In! 🎉",
    subheading: "The AcroYoga Challenge starts soon",
    intro: (name: string, date: string) =>
      `Hi ${name}! We're thrilled to confirm your registration for the AcroYoga Challenge. The challenge starts on ${date}.`,
    whatToExpect: "What to expect:",
    expectations: [
      "Weekly group sessions with certified instructors",
      "A supportive community of practitioners at all levels",
      "Exclusive content and technique tips",
      "Opportunities to find practice partners near you",
    ],
    whatToBring: "What to bring:",
    bringItems: [
      "Comfortable practice clothes",
      "A yoga mat (if you have one)",
      "A water bottle",
      "Openness and a smile 😊",
    ],
    waGroup: "Join our community WhatsApp group:",
    waButton: "Join the Group",
    calCta: "Add to Calendar",
    footer:
      "This is a transactional email. You received it because you registered for the challenge. Questions? Reply to this email.",
    regards: "Warm regards,\nThe AcroHavura Team",
  },
};

export default function ChallengeConfirmation({
  name,
  cohortStartDate,
  locale = "he",
}: ChallengeConfirmationProps) {
  const t = CONTENT[locale];
  const isHe = locale === "he";
  const dir = isHe ? "rtl" : "ltr";

  const formattedDate = new Date(cohortStartDate).toLocaleDateString(
    isHe ? "he-IL" : "en-GB",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  const waGroupUrl =
    process.env.NEXT_PUBLIC_CHALLENGE_WA_GROUP_URL ??
    "https://chat.whatsapp.com/placeholder";

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

          {/* Header */}
          <Section style={{ backgroundColor: BRAND.surface, border: `2px solid ${BRAND.pink}`, padding: "32px 24px", marginBottom: "0" }}>
            <Text style={{ color: BRAND.pink, fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
              AcroHavura
            </Text>
            <Text style={{ color: BRAND.white, fontSize: "36px", fontWeight: 700, margin: "0 0 8px 0", lineHeight: "1.1" }}>
              {t.heading}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: "16px", margin: "0" }}>
              {t.subheading}
            </Text>
          </Section>

          {/* Intro */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, padding: "24px" }}>
            <Text style={{ color: BRAND.white, fontSize: "16px", lineHeight: "1.7", margin: "0" }}>
              {t.intro(name, formattedDate)}
            </Text>
          </Section>

          <Hr style={{ borderColor: BRAND.border, margin: "0" }} />

          {/* What to expect */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, padding: "24px" }}>
            <Text style={{ color: BRAND.pink, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              {t.whatToExpect}
            </Text>
            {t.expectations.map((item, i) => (
              <Text key={i} style={{ color: BRAND.white, fontSize: "15px", margin: "0 0 10px 0", paddingRight: isHe ? "0" : undefined, paddingLeft: isHe ? "0" : "16px" }}>
                {"→ "}{item}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: BRAND.border, margin: "0" }} />

          {/* What to bring */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, padding: "24px" }}>
            <Text style={{ color: BRAND.pink, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              {t.whatToBring}
            </Text>
            {t.bringItems.map((item, i) => (
              <Text key={i} style={{ color: BRAND.white, fontSize: "15px", margin: "0 0 10px 0" }}>
                {"✓ "}{item}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: BRAND.border, margin: "0" }} />

          {/* CTA */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, borderBottom: `2px solid ${BRAND.pink}`, padding: "32px 24px", textAlign: "center" }}>
            <Text style={{ color: BRAND.muted, fontSize: "14px", margin: "0 0 16px 0" }}>
              {t.waGroup}
            </Text>
            <Button
              href={waGroupUrl}
              style={{
                backgroundColor: BRAND.pink,
                color: "#000000",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px 32px",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "16px",
              }}
            >
              {t.waButton}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ padding: "24px 0" }}>
            <Text style={{ color: BRAND.muted, fontSize: "12px", textAlign: "center", margin: "0 0 8px 0" }}>
              {t.regards}
            </Text>
            <Text style={{ color: BRAND.border, fontSize: "11px", textAlign: "center", margin: "0" }}>
              {t.footer}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

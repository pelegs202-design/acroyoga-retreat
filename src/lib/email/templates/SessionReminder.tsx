import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Font,
  Preview,
} from "@react-email/components";

// ─── Brand tokens ───
const BRAND = {
  bg: "#0a0a0a",
  surface: "#111111",
  pink: "#F472B6",
  white: "#FAFAFA",
  muted: "#A1A1A1",
  border: "#222222",
  green: "#4ade80",
};

interface SessionReminderProps {
  name: string;
  sessionDate: string; // formatted date string
  sessionTime: string; // e.g. "18:00"
  city: string;
  isEve: boolean; // true = day-before reminder, false = morning-of reminder
  locale: "he" | "en";
}

const CONTENT = {
  he: {
    preview: (isEve: boolean, time: string, city: string) =>
      isEve
        ? `מחר ב-${time} — מתכוננים לאתגר ב${city}`
        : `היום זה קורה! ב-${time} ב${city}`,
    eveHeading: (time: string) => `מחר ב-${time}`,
    eveSubheading: "אתה מוכן? הנה כמה תזכורות",
    morningHeading: "היום זה קורה!",
    morningSubheading: (time: string, city: string) =>
      `נתראה ב-${time} ב${city}`,
    dateLabel: "תאריך:",
    timeLabel: "שעה:",
    cityLabel: "מיקום:",
    eveChecklist: "רשימת הכנה לשיעור:",
    eveItems: [
      "לכבס בגדי תרגול נוחים",
      "להכין מזרן יוגה ובקבוק מים",
      "לאכול ארוחה קלה לפחות שעתיים לפני",
      "לישון מספיק הלילה",
    ],
    morningChecklist: "עוד לפני שיוצאים:",
    morningItems: [
      "בגדי תרגול נוחים — מוכנים?",
      "מזרן יוגה + בקבוק מים",
      "ארוחת בוקר קלה",
      "לצאת מספיק מוקדם",
    ],
    seeYou: (city: string) => `נתראה ב${city}!`,
    footer: "זהו מייל עסקי. אתה מקבל אותו כי נרשמת לאתגר.",
  },
  en: {
    preview: (isEve: boolean, time: string, city: string) =>
      isEve
        ? `Tomorrow at ${time} in ${city} — are you ready?`
        : `Today's the day! See you at ${time} in ${city}`,
    eveHeading: (time: string) => `Tomorrow at ${time}`,
    eveSubheading: "Here's what to prepare",
    morningHeading: "Today's the Day!",
    morningSubheading: (time: string, city: string) =>
      `See you at ${time} in ${city}`,
    dateLabel: "Date:",
    timeLabel: "Time:",
    cityLabel: "Location:",
    eveChecklist: "Pre-session checklist:",
    eveItems: [
      "Prepare comfortable practice clothes",
      "Pack your yoga mat and water bottle",
      "Have a light meal at least 2 hours before",
      "Get a good night's sleep",
    ],
    morningChecklist: "Before you head out:",
    morningItems: [
      "Comfortable clothes — check?",
      "Yoga mat + water bottle",
      "Light breakfast",
      "Leave early enough",
    ],
    seeYou: (city: string) => `See you in ${city}!`,
    footer:
      "This is a transactional email. You received it because you registered for the challenge.",
  },
};

export default function SessionReminder({
  name,
  sessionDate,
  sessionTime,
  city,
  isEve,
  locale = "he",
}: SessionReminderProps) {
  const t = CONTENT[locale];
  const isHe = locale === "he";
  const dir = isHe ? "rtl" : "ltr";

  const heading = isEve
    ? t.eveHeading(sessionTime)
    : t.morningHeading;

  const subheading = isEve
    ? t.eveSubheading
    : t.morningSubheading(sessionTime, city);

  const checklist = isEve
    ? { label: t.eveChecklist, items: t.eveItems }
    : { label: t.morningChecklist, items: t.morningItems };

  const accentColor = isEve ? BRAND.pink : BRAND.green;

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
      </Head>
      <Preview>{t.preview(isEve, sessionTime, city)}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, margin: 0, padding: 0, fontFamily: "Heebo, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>

          {/* Header */}
          <Section style={{ backgroundColor: BRAND.surface, border: `2px solid ${accentColor}`, padding: "32px 24px", marginBottom: "0" }}>
            <Text style={{ color: accentColor, fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
              AcroHavura
            </Text>
            <Text style={{ color: BRAND.white, fontSize: "32px", fontWeight: 700, margin: "0 0 8px 0", lineHeight: "1.1" }}>
              {heading}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: "16px", margin: "0" }}>
              {subheading}
            </Text>
          </Section>

          {/* Session Details */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, padding: "24px" }}>
            <Text style={{ color: BRAND.white, fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
              שלום {name}! / Hi {name}!
            </Text>
            <Hr style={{ borderColor: BRAND.border, margin: "16px 0" }} />

            <Section>
              <Text style={{ color: BRAND.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>
                {t.dateLabel}
              </Text>
              <Text style={{ color: BRAND.white, fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0" }}>
                {sessionDate}
              </Text>

              <Text style={{ color: BRAND.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>
                {t.timeLabel}
              </Text>
              <Text style={{ color: accentColor, fontSize: "24px", fontWeight: 700, margin: "0 0 16px 0" }}>
                {sessionTime}
              </Text>

              <Text style={{ color: BRAND.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>
                {t.cityLabel}
              </Text>
              <Text style={{ color: BRAND.white, fontSize: "16px", fontWeight: 700, margin: "0" }}>
                {city}
              </Text>
            </Section>
          </Section>

          <Hr style={{ borderColor: BRAND.border, margin: "0" }} />

          {/* Checklist */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}`, padding: "24px" }}>
            <Text style={{ color: accentColor, fontSize: "14px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              {checklist.label}
            </Text>
            {checklist.items.map((item, i) => (
              <Text key={i} style={{ color: BRAND.white, fontSize: "15px", margin: "0 0 10px 0" }}>
                {"✓ "}{item}
              </Text>
            ))}
            <Hr style={{ borderColor: BRAND.border, margin: "16px 0" }} />
            <Text style={{ color: BRAND.white, fontSize: "18px", fontWeight: 700, margin: "0" }}>
              {t.seeYou(city)}
            </Text>
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

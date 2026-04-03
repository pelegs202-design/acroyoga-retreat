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
  Link,
} from "@react-email/components";

// ─── Brand tokens ───
const BRAND = {
  bg: "#0a0a0a",
  surface: "#111111",
  pink: "#F472B6",
  white: "#FAFAFA",
  muted: "#A1A1A1",
  border: "#222222",
  yellow: "#facc15",
};

interface NurtureStepProps {
  name: string;
  archetype: string; // e.g. "Explorer", "Artist", "Connector", "Athlete"
  stepNumber: number; // 1-12
  locale: "he" | "en";
  unsubUrl: string;
}

// ─── Archetype display names ───
const ARCHETYPE_LABELS: Record<string, { he: string; en: string }> = {
  Explorer: { he: "חוקר/ת", en: "The Explorer" },
  Artist: { he: "אמן/ית", en: "The Artist" },
  Connector: { he: "מחבר/ת", en: "The Connector" },
  Athlete: { he: "ספורטאי/ת", en: "The Athlete" },
};

// ─── Step content definitions ───
interface StepContent {
  previewHe: string;
  previewEn: string;
  headingHe: string;
  headingEn: string;
  bodyHe: (archetype: string) => string;
  bodyEn: (archetype: string) => string;
  ctaHe?: string;
  ctaEn?: string;
  ctaUrl?: string;
  isDiscount?: boolean;
}

const STEP_CONTENT: Record<number, StepContent> = {
  1: {
    previewHe: "ברוך הבא לעולם האקרויוגה — הנה איפה להתחיל",
    previewEn: "Welcome to AcroYoga — here's where to begin",
    headingHe: "ברוך הבא לעולם האקרויוגה",
    headingEn: "Welcome to AcroYoga",
    bodyHe: (arch) =>
      `לפי הפרופיל שלך, אתה ${ARCHETYPE_LABELS[arch]?.he ?? arch}. זה אומר שהדרך הכי טובה עבורך להיכנס לאקרויוגה היא דרך ${archetypeTipHe(arch)}.\n\nהצעד הראשון פשוט: מצא שותף/ת לתרגול, פרוש מזרן ותנסה את יסודות הבסיס — ידיים ורגליים יציבות, תקשורת פתוחה.`,
    bodyEn: (arch) =>
      `Based on your profile, you're ${ARCHETYPE_LABELS[arch]?.en ?? arch}. That means the best entry point for you is through ${archetypeTipEn(arch)}.\n\nFirst step: Find a practice partner, lay down a mat, and try the base foundations — stable hands and feet, open communication.`,
    ctaHe: "חקור את הקהילה",
    ctaEn: "Explore the community",
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com",
  },
  2: {
    previewHe: "3 תרגילים שכל ${archetype} חייב לנסות",
    previewEn: "3 exercises every ${archetype} should try",
    headingHe: "3 תרגילים להתחלה הנכונה",
    headingEn: "3 Exercises to Start Right",
    bodyHe: (arch) =>
      `בתור ${ARCHETYPE_LABELS[arch]?.he ?? arch}, הנה 3 תרגילים שמתאימים במיוחד לסגנון שלך:\n\n1. Star — תרגיל יסוד קלאסי שמפתח איזון ואמון\n2. Throne — תנוחת מלכות שמחזקת את הגב והכתפיים\n3. Front Bird — הטסה ראשונה שמרגישה כמו טיסה`,
    bodyEn: (arch) =>
      `As ${ARCHETYPE_LABELS[arch]?.en ?? arch}, here are 3 exercises perfectly suited to your style:\n\n1. Star — classic foundation pose that builds balance and trust\n2. Throne — royal pose that strengthens back and shoulders\n3. Front Bird — your first "flight" that actually feels like flying`,
  },
  3: {
    previewHe: "הסיפור של AcroHavura — למה בנינו את הקהילה הזו",
    previewEn: "The story of AcroHavura — why we built this community",
    headingHe: "הסיפור שלנו",
    headingEn: "Our Story",
    bodyHe: () =>
      "AcroHavura נולדה מתוך ניסיון של חיפוש שותפים לתרגול — משהו שכולנו מכירים. אין מספיק אנשים שמתאמנים, הרמות לא תמיד מסתדרות, וקשה לדעת למי לפנות.\n\nבנינו פלטפורמה שפותרת בדיוק את זה: מציאת שותפים לפי רמה, תפקיד ומיקום. קהילה שמאמינה שאקרויוגה היא לכולם.",
    bodyEn: () =>
      "AcroHavura was born from the experience of searching for practice partners — something we all know. Not enough practitioners around, levels don't always match, and it's hard to know who to reach out to.\n\nWe built a platform that solves exactly that: finding partners by level, role, and location. A community that believes AcroYoga is for everyone.",
  },
  4: {
    previewHe: "שאלות נפוצות על האקרויוגה — תשובות ישירות",
    previewEn: "AcroYoga FAQs — straight answers",
    headingHe: "שאלות שאנחנו שומעים כל הזמן",
    headingEn: "Questions We Hear All the Time",
    bodyHe: (arch) =>
      `כ${ARCHETYPE_LABELS[arch]?.he ?? arch}, אלו השאלות שהכי נפוצות:\n\n❓ צריך להיות גמיש? לא בהכרח. חוזק יציב חשוב יותר מגמישות בהתחלה.\n\n❓ כמה זמן לוקח להתקדם? רוב המתרגלים מרגישים שיפור אחרי 3-5 שיעורים.\n\n❓ מה אם אני לא בכושר? זה בסדר — האקרויוגה בונה את הכושר שלך תוך כדי.\n\n❓ אני צריך שותף? לרוב כן, אבל בקהילה שלנו קל למצוא אחד.`,
    bodyEn: (arch) =>
      `As ${ARCHETYPE_LABELS[arch]?.en ?? arch}, here are the most common questions:\n\n❓ Do I need to be flexible? Not necessarily. Stable strength matters more than flexibility at first.\n\n❓ How long to progress? Most practitioners feel improvement after 3-5 sessions.\n\n❓ What if I'm not fit? That's fine — AcroYoga builds your fitness along the way.\n\n❓ Do I need a partner? Usually yes, but in our community it's easy to find one.`,
  },
  5: {
    previewHe: "הצעה מיוחדת — רק למשיבי הסקר שלנו",
    previewEn: "Special offer — just for our survey respondents",
    headingHe: "הגיע הזמן לצעד הבא",
    headingEn: "Time for the Next Step",
    bodyHe: (arch) =>
      `בתור ${ARCHETYPE_LABELS[arch]?.he ?? arch}, ראינו שאתה מוכן לרמה הבאה. לכן אנחנו מציעים לך:\n\n🎯 50 ₪ הנחה על אתגר האקרויוגה הקרוב — רק למי שקיבל 4 מיילים קודמים.\n\nהאתגר כולל 4 שבועות של שיעורים, קהילה פעילה, ומעקב אישי. הנחה זו תקפה ל-72 שעות בלבד.`,
    bodyEn: (arch) =>
      `As ${ARCHETYPE_LABELS[arch]?.en ?? arch}, we can see you're ready for the next level. That's why we're offering you:\n\n🎯 50 NIS off the next AcroYoga Challenge — only for those who received 4 previous emails.\n\nThe challenge includes 4 weeks of sessions, an active community, and personal tracking. This discount is valid for 72 hours only.`,
    ctaHe: "קבל את ההנחה",
    ctaEn: "Claim Your Discount",
    ctaUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com") + "/challenge",
    isDiscount: true,
  },
  6: {
    previewHe: "טיפ שבועי: איך לבנות בסיס יציב",
    previewEn: "Weekly tip: How to build a stable base",
    headingHe: "טיפ: בסיס יציב",
    headingEn: "Tip: Stable Foundation",
    bodyHe: () =>
      "הבסיס הוא הגיבור הלא מוכר של האקרויוגה. רוב המתחילים מתמקדים במה שקורה באוויר — אבל הקסם מתחיל בקרקע.\n\n3 עקרונות לבסיס יציב:\n1. ידיים ישרות, לא נעולות בקפיצה — שרירים פעילים\n2. רגליים מכוונות לכתפיים של הפלאייר\n3. תקשורת מילולית: \"מוכן?\" \"מוכן!\" לפני כל הרמה",
    bodyEn: () =>
      "The base is the unsung hero of AcroYoga. Most beginners focus on what happens in the air — but the magic starts on the ground.\n\n3 principles of a stable base:\n1. Straight arms, not locked at the elbow — active muscles\n2. Feet pointing toward the flyer's shoulders\n3. Verbal communication: 'Ready?' 'Ready!' before every lift",
  },
  7: {
    previewHe: "על תקשורת בתרגול — השיחה שמאפשרת הכל",
    previewEn: "On communication during practice — the conversation that enables everything",
    headingHe: "תקשורת היא הכלי הסודי",
    headingEn: "Communication is the Secret Tool",
    bodyHe: () =>
      "אחד הדברים שמפתיעים מתרגלים חדשים: הרבה מהאקרויוגה קורה דרך מילים.\n\n\"יותר ימינה\" / \"תשחרר קצת\" / \"מוכן לרדת\" — כל אלה הן חלק מהתרגול, לא הפרעה לו.\n\nהקהילה של AcroHavura מאמינה שתקשורת פתוחה בין שותפים היא הבסיס לכל תרגול בטוח ומהנה.",
    bodyEn: () =>
      "One of the things that surprises new practitioners: much of AcroYoga happens through words.\n\n'A bit to the right' / 'Soften a little' / 'Ready to come down' — all of these are part of the practice, not interruptions to it.\n\nThe AcroHavura community believes open communication between partners is the foundation of every safe and enjoyable practice.",
  },
  8: {
    previewHe: "הכירו את המאמנים שלנו",
    previewEn: "Meet our instructors",
    headingHe: "הפנים מאחורי AcroHavura",
    headingEn: "The Faces Behind AcroHavura",
    bodyHe: () =>
      "המאמנים של AcroHavura הם מתרגלים ותיקים עם ניסיון של שנים רבות — ממגוון סגנונות אקרויוגה, יוגה וציראס.\n\nכל מאמן הביא משהו ייחודי: חלקם מגיעים מרקע ספורטיבי, חלקם מהמחול, וחלקם מהיוגה הקלאסית. יחד, הם יוצרים גישה מגוונת ומכלילה.",
    bodyEn: () =>
      "AcroHavura's instructors are veteran practitioners with years of experience — from various AcroYoga, yoga, and circus styles.\n\nEach instructor brings something unique: some come from athletic backgrounds, some from dance, and some from classical yoga. Together, they create a diverse and inclusive approach.",
  },
  9: {
    previewHe: "סיפורי הצלחה מהקהילה — מה קורה כשמתמסרים",
    previewEn: "Community success stories — what happens when you commit",
    headingHe: "מה קורה כשמתמסרים",
    headingEn: "What Happens When You Commit",
    bodyHe: () =>
      "\"התחלתי את אתגר האקרויוגה בלי לדעת כלום. אחרי חודש — אני יכול לעשות Star ו-Throne, ומצאתי שותף קבוע לתרגול שגר ממש ליד.\"\n— מתרגל מהקהילה\n\n\"לא חשבתי שבגיל 45 אוכל ללמוד משהו חדש לגמרי. AcroHavura הוכיחה לי שטעיתי.\"\n— מתרגלת מוותיקות הקהילה",
    bodyEn: () =>
      '"I started the AcroYoga challenge knowing nothing. After one month — I can do Star and Throne, and found a regular practice partner who lives right nearby."\n— Community member\n\n"I didn\'t think I could learn something completely new at 45. AcroHavura proved me wrong."\n— Veteran community member',
  },
  10: {
    previewHe: "האתגר הבא מתחיל בקרוב — הצטרף עכשיו",
    previewEn: "The next challenge starts soon — join now",
    headingHe: "האתגר הבא מתחיל בקרוב",
    headingEn: "The Next Challenge Starts Soon",
    bodyHe: () =>
      "אנחנו מתכוננים לקבוצת האתגר הבאה. הנרשמים הראשונים תמיד מקבלים את המקומות הטובים ביותר — ולפעמים גם הנחה מוקדמת.\n\nהאתגר כולל 4 שבועות מבנה ברור, שיעורים שבועיים, ותמיכה של הקהילה לאורך כל הדרך.",
    bodyEn: () =>
      "We're preparing for the next challenge group. Early registrants always get the best spots — and sometimes an early-bird discount too.\n\nThe challenge includes 4 weeks of clear structure, weekly sessions, and community support throughout.",
    ctaHe: "הרשמה לאתגר",
    ctaEn: "Register for the Challenge",
    ctaUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com") + "/challenge",
  },
  11: {
    previewHe: "כמה הגעת רחוק — זמן לחגוג",
    previewEn: "How far you've come — time to celebrate",
    headingHe: "זמן לחגוג",
    headingEn: "Time to Celebrate",
    bodyHe: (arch) =>
      `כ${ARCHETYPE_LABELS[arch]?.he ?? arch} — עצור רגע ושים לב לדרך שעשית.\n\nכשנרשמת לסקר שלנו, התחלת מסע. מאז קיבלת טיפים, הכרת את הקהילה, ואולי אפילו ניסית כמה תרגילים.\n\nזה כבר הרבה. ואנחנו כאן כדי להמשיך לתמוך בך בכל צעד.`,
    bodyEn: (arch) =>
      `As ${ARCHETYPE_LABELS[arch]?.en ?? arch} — stop for a moment and notice how far you've come.\n\nWhen you signed up for our quiz, you started a journey. Since then you've received tips, met the community, and maybe even tried a few exercises.\n\nThat's already a lot. And we're here to keep supporting you at every step.`,
  },
  12: {
    previewHe: "מה חדש ב-AcroHavura — עדכונים מהקהילה",
    previewEn: "What's new at AcroHavura — updates from the community",
    headingHe: "מה חדש?",
    headingEn: "What's New?",
    bodyHe: () =>
      "קהילת AcroHavura גדלה כל חודש. יש לנו מתרגלים חדשים, ג'אמים חדשים ברחבי הארץ, ותמיד משהו מעניין קורה.\n\nבקר/י בפלטפורמה שלנו וראה/י מה קורה ליד המיקום שלך. אולי חיכה לך שם שותף/ת תרגול.",
    bodyEn: () =>
      "The AcroHavura community grows every month. There are new practitioners, new jams around the country, and something interesting is always happening.\n\nVisit our platform and see what's happening near your location. Maybe a practice partner is waiting for you there.",
    ctaHe: "חקור אירועים קרובים",
    ctaEn: "Explore Upcoming Events",
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://acrohavura.com",
  },
};

// ─── Archetype tip helpers ───
function archetypeTipHe(archetype: string): string {
  switch (archetype) {
    case "Explorer":
      return "ניסוי תרגילים חדשים בכל שיעור";
    case "Artist":
      return "מציאת הקצב והזרימה בין תנועות";
    case "Connector":
      return "בניית אמון עם שותפים שונים";
    case "Athlete":
      return "שיפור הכוח והדיוק הטכני";
    default:
      return "חקירת כל ההיבטים של האקרויוגה";
  }
}

function archetypeTipEn(archetype: string): string {
  switch (archetype) {
    case "Explorer":
      return "trying new poses each session";
    case "Artist":
      return "finding rhythm and flow between movements";
    case "Connector":
      return "building trust with different partners";
    case "Athlete":
      return "improving strength and technical precision";
    default:
      return "exploring all aspects of AcroYoga";
  }
}

export default function NurtureStep({
  name,
  archetype,
  stepNumber,
  locale = "he",
  unsubUrl,
}: NurtureStepProps) {
  const isHe = locale === "he";
  const dir = isHe ? "rtl" : "ltr";

  // Clamp step to 1-12
  const step = Math.max(1, Math.min(12, stepNumber));
  const content = STEP_CONTENT[step] ?? STEP_CONTENT[1];

  const heading = isHe ? content.headingHe : content.headingEn;
  const preview = isHe ? content.previewHe : content.previewEn;
  const body = isHe ? content.bodyHe(archetype) : content.bodyEn(archetype);
  const ctaLabel = isHe ? content.ctaHe : content.ctaEn;

  const archetypeLabel = isHe
    ? (ARCHETYPE_LABELS[archetype]?.he ?? archetype)
    : (ARCHETYPE_LABELS[archetype]?.en ?? archetype);

  const unsubLabel = isHe
    ? "הסר/י אותי מרשימת הדיוור"
    : "Unsubscribe from marketing emails";

  const footerText = isHe
    ? `אתה מקבל מייל זה כי נרשמת לסקר שלנו. ${unsubLabel}.`
    : `You're receiving this because you signed up for our quiz. ${unsubLabel}.`;

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
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, margin: 0, padding: 0, fontFamily: "Heebo, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>

          {/* Header */}
          <Section style={{ backgroundColor: BRAND.surface, border: `2px solid ${BRAND.pink}`, padding: "32px 24px", marginBottom: "0" }}>
            <Text style={{ color: BRAND.pink, fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 4px 0" }}>
              AcroHavura
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: "11px", margin: "0 0 12px 0" }}>
              {isHe ? `הפרופיל שלך: ${archetypeLabel}` : `Your profile: ${archetypeLabel}`}
            </Text>
            <Text style={{ color: BRAND.white, fontSize: "28px", fontWeight: 700, margin: "0", lineHeight: "1.2" }}>
              {heading}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: BRAND.surface, borderLeft: `2px solid ${BRAND.pink}`, borderRight: `2px solid ${BRAND.pink}`, padding: "24px" }}>
            <Text style={{ color: BRAND.white, fontSize: "18px", fontWeight: 700, margin: "0 0 16px 0" }}>
              {isHe ? `שלום ${name},` : `Hi ${name},`}
            </Text>
            {body.split("\n\n").map((paragraph, i) => (
              <Text key={i} style={{ color: BRAND.white, fontSize: "15px", lineHeight: "1.7", margin: "0 0 16px 0", whiteSpace: "pre-line" }}>
                {paragraph}
              </Text>
            ))}
          </Section>

          {/* CTA (if present) */}
          {content.ctaUrl && ctaLabel && (
            <>
              <Hr style={{ borderColor: BRAND.border, margin: "0" }} />
              <Section
                style={{
                  backgroundColor: content.isDiscount ? "#1a0a12" : BRAND.surface,
                  borderLeft: `2px solid ${content.isDiscount ? BRAND.yellow : BRAND.pink}`,
                  borderRight: `2px solid ${content.isDiscount ? BRAND.yellow : BRAND.pink}`,
                  borderBottom: `2px solid ${content.isDiscount ? BRAND.yellow : BRAND.pink}`,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                {content.isDiscount && (
                  <Text style={{ color: BRAND.yellow, fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
                    {isHe ? "הצעה מיוחדת" : "Special Offer"}
                  </Text>
                )}
                <Button
                  href={content.ctaUrl}
                  style={{
                    backgroundColor: content.isDiscount ? BRAND.yellow : BRAND.pink,
                    color: "#000000",
                    fontWeight: 700,
                    fontSize: "15px",
                    padding: "14px 32px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  {ctaLabel}
                </Button>
              </Section>
            </>
          )}

          {/* Footer */}
          <Section style={{ padding: "24px 0" }}>
            <Hr style={{ borderColor: BRAND.border, margin: "0 0 16px 0" }} />
            <Text style={{ color: BRAND.border, fontSize: "11px", textAlign: "center", margin: "0 0 8px 0" }}>
              {isHe
                ? `אתה מקבל מייל זה כי נרשמת לסקר שלנו.`
                : `You're receiving this because you signed up for our quiz.`}
            </Text>
            <Text style={{ textAlign: "center", margin: "0" }}>
              <Link
                href={unsubUrl}
                style={{ color: BRAND.muted, fontSize: "11px", textDecoration: "underline" }}
              >
                {unsubLabel}
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

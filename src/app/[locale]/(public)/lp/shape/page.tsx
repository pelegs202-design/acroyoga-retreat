import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import ShapeLanding from "./ShapeLanding";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHe = locale === "he";
  return {
    title: isHe
      ? "להיכנס לכושר בלי חדר כושר · 3 שיעורי היכרות · אקרוחבורה"
      : "Get In Shape Without the Gym · 3-class intro pack · AcroHavura",
    description: isHe
      ? "פעמיים בשבוע, 90 דקות. שורפים ~500 קלוריות, בונים שריר מוגדר — ובאמת מחכים לשיעור הבא. סיכון אפס."
      : "Twice a week, 90 minutes. Burn ~500 calories, build lean muscle — and actually look forward to the next class. Zero risk.",
    robots: { index: false, follow: true },
  };
}

export default async function ShapeLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <ShapeLanding locale={locale} />
    </main>
  );
}

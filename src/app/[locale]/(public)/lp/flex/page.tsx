import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import FlexLanding from "./FlexLanding";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHe = locale === "he";
  return {
    title: isHe
      ? "תפסיק/י לכאוב מהמחשב · 3 שיעורי היכרות · אקרוחבורה"
      : "Stop Hurting From Your Desk · 3-class intro pack · AcroHavura",
    description: isHe
      ? "אקרו-יוגה זה מתיחות עמוקות עם פרטנר. הגב, הירכיים והכתפיים נפתחים תוך 4 שבועות — גם אם את/ה נוקשה לגמרי היום."
      : "Acro-yoga is deep stretching with a partner. Your back, hips, and shoulders open up in 4 weeks — even if you're completely stiff today.",
    robots: { index: false, follow: true },
  };
}

export default async function FlexLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <FlexLanding locale={locale} />
    </main>
  );
}

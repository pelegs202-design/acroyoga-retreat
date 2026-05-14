import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import ResetLanding from "./ResetLanding";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHe = locale === "he";
  return {
    title: isHe
      ? "שעה וחצי שבהן הראש נכבה · 3 שיעורי היכרות · אקרוחבורה"
      : "90 Minutes Your Head Shuts Off · 3-class intro pack · AcroHavura",
    description: isHe
      ? "בלי טלפון, בלי מיילים, בלי לחשוב על מחר. רק את/ה, בן אדם שסומכים עליו, וטיסה. יוצאים אחרת ממה שנכנסתם."
      : "No phone, no email, no thinking about tomorrow. Just you, someone you trust, and flying. You leave different from how you came in.",
    robots: { index: false, follow: true },
  };
}

export default async function ResetLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <ResetLanding locale={locale} />
    </main>
  );
}

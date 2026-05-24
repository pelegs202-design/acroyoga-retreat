import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LandingPageShell } from "@/components/lp/LandingPageShell";
import { getSyllabus } from "@/lib/lp/syllabi";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "he") return { robots: { index: false, follow: true } };
  return {
    title: "60 שניות הנדסטנד תוך 4 שבועות · קורס אקרו · אקרוחבורה",
    description:
      "הקיצור-דרך להנדסטנד שמורי יוגה לא מספרים לך עליו. קורס של 4 שבועות לעמידת ידיים יציבה — עם בייס שמחזיק אותך, לא קיר.",
    robots: { index: false, follow: true },
  };
}

export default async function HandstandLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("handstand")} />
    </main>
  );
}

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
    title: "תפגוש/י את החבורה שלך · קורס אקרו · אקרוחבורה",
    description:
      "תיכנס/י לבד. תיצא/י עם 15 אנשים שמכירים את השם שלך. קורס של 4 שבועות בתל אביב למי שמחפש/ת חברויות אמיתיות אחרי גיל 30.",
    robots: { index: false, follow: true },
  };
}

export default async function TribeLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("tribe")} />
    </main>
  );
}

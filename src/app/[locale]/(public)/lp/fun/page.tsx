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
    title: "כושר שזה כיף · קורס אקרו · אקרוחבורה",
    description:
      "השעה והחצי היחידה בשבוע שתחכ/י לה — ועדיין תיצא/י מיוזע/ת. קורס אקרו של 4 שבועות בתל אביב למי שמחפש/ת ספורט שמרגיש כמו משחק.",
    robots: { index: false, follow: true },
  };
}

export default async function FunLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("fun")} />
    </main>
  );
}

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
    title: "שליטה גופנית — תרגיש/י כל מילימטר · קורס אקרו · אקרוחבורה",
    description:
      "תרגיש/י כל מילימטר בגוף שלך — בפעם הראשונה. קורס של 4 שבועות בתל אביב לאנשים שרוצים לזוז בכוונה, לא בעיוורון.",
    robots: { index: false, follow: true },
  };
}

export default async function ControlLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("control")} />
    </main>
  );
}

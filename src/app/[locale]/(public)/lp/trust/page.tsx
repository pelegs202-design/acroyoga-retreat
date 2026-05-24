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
    title: "ללמוד לסמוך דרך תנועה · קורס אקרו · אקרוחבורה",
    description:
      "הפעם הראשונה שבאמת תניח/י את הגוף — ותגלה/י שיש מי שתופס. קורס של 4 שבועות בתל אביב לאמון בגוף, לא במילים.",
    robots: { index: false, follow: true },
  };
}

export default async function TrustLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("trust")} />
    </main>
  );
}

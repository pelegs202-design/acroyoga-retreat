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
    title: "אקרו לרקדנים — השכבה החסרה בתנועה שלך · אקרוחבורה",
    description:
      "את/ה כבר יודע/ת לזוז. אקרו ילמד אותך לזוז עם מישהו אחר. קורס של 4 שבועות בתל אביב לרקדנים שמחפשים את השכבה האנכית של פרטנרינג.",
    robots: { index: false, follow: true },
  };
}

export default async function DanceLandingPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "he") notFound();
  setRequestLocale(locale);
  return (
    <main className="bg-[#0a0a0a] text-white">
      <LandingPageShell syllabus={getSyllabus("dance")} />
    </main>
  );
}

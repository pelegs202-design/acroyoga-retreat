import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import ChallengeResultsFlow from "./ChallengeResultsFlow";
import { ShareButton } from "@/components/social/ShareButton";

export const metadata: Metadata = {
  title: "Your Acro Profile | AcroHavura",
  description: "See your personalized acroyoga archetype and join the 30-day challenge.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string }>;
}

export default async function ChallengeResultsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session } = await searchParams;

  setRequestLocale(locale);

  if (!session) {
    redirect(`/${locale}/quiz`);
  }

  const resultsUrl = `https://acroretreat.co.il/${locale}/quiz/challenge/results?session=${session}`;
  const resultsTitle =
    locale === "he"
      ? "תוצאות אתגר האקרויוגה שלי | אקרוחבורה"
      : "My AcroYoga Challenge Results | AcroHavura";

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ChallengeResultsFlow sessionId={session} locale={locale} />
      <ShareButton url={resultsUrl} title={resultsTitle} />
    </main>
  );
}

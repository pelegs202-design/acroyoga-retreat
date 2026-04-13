import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import SuccessContent from "./SuccessContent";

export const metadata: Metadata = {
  title: "Welcome to the Challenge! | AcroHavura",
  description: "You're in! Here's everything you need to know for the 30-day acroyoga challenge.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string; day?: string }>;
}

export default async function ChallengeSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session, day } = await searchParams;

  setRequestLocale(locale);

  if (!session) {
    redirect(`/${locale}/quiz`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <SuccessContent sessionId={session} locale={locale} initialDay={day} />
    </main>
  );
}

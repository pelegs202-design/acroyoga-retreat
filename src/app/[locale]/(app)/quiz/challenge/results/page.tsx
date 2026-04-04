import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getSessionResult } from "@/lib/quiz/get-session-result";
import ChallengeResultsFlow from "./ChallengeResultsFlow";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://acroyoga-academy.vercel.app";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { session } = await searchParams;
  const isHe = locale === "he";

  if (!session) {
    return { title: "AcroHavura" };
  }

  let archetypeName = isHe ? "הטיפוס שלך" : "Your Acro Type";
  let tagline = isHe ? "גלו את הטיפוס האקרו שלכם" : "Discover your acro type";

  try {
    const data = await getSessionResult(session);
    if (data) {
      archetypeName = isHe ? data.result.name.he : data.result.name.en;
      tagline = isHe ? data.result.tagline.he : data.result.tagline.en;
    }
  } catch (e) {
    console.error("generateMetadata: failed to fetch session", e);
  }

  const title = isHe
    ? `אני ${archetypeName}! גלו את הטיפוס שלכם | אקרוחבורה`
    : `I'm ${archetypeName}! Discover yours | AcroHavura`;

  return {
    title,
    description: tagline,
    openGraph: {
      title,
      description: tagline,
      images: [
        {
          url: `${BASE_URL}/api/og/results/${session}`,
          width: 1200,
          height: 630,
          alt: archetypeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tagline,
      images: [`${BASE_URL}/api/og/results/${session}`],
    },
  };
}

export default async function ChallengeResultsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session } = await searchParams;

  setRequestLocale(locale);

  if (!session) {
    redirect(`/${locale}/quiz`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ChallengeResultsFlow sessionId={session} locale={locale} />
    </main>
  );
}

import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { quizLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateResult } from "@/lib/quiz/result-calculator";
import ChallengeResultsFlow from "./ChallengeResultsFlow";

const BASE_URL = "https://acroyoga-academy.vercel.app";

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

  // Fetch archetype for this session
  let archetypeName = isHe ? "הטיפוס שלך" : "Your Acro Type";
  let tagline = isHe ? "גלו את הטיפוס האקרו שלכם" : "Discover your acro type";

  try {
    const rows = await db
      .select({ answers: quizLeads.answers })
      .from(quizLeads)
      .where(eq(quizLeads.sessionId, session))
      .limit(1);

    if (rows.length > 0) {
      const answers = JSON.parse(rows[0].answers) as Record<string, string>;
      const result = calculateResult(answers);
      archetypeName = isHe ? result.name.he : result.name.en;
      tagline = isHe ? result.tagline.he : result.tagline.en;
    }
  } catch {
    // Fallback to defaults
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

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Quiz | AcroHavura",
  description: "Find your acroyoga path — take the 30-day challenge quiz or plan a private workshop.",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function QuizEntryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("quiz.entry");

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-3xl font-black text-white mb-3">{t("title")}</h1>
        <p className="text-neutral-400 text-base">{t("subtitle")}</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-6">
        {/* Challenge Card */}
        <Link
          href="/quiz/challenge"
          className="group flex-1 flex flex-col gap-4 bg-neutral-900 border border-neutral-800 hover:border-brand rounded-2xl p-8 transition-colors duration-200 text-left"
        >
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white">{t("challengeTitle")}</h2>
              <span className="text-xs bg-neutral-800 text-neutral-400 rounded-full px-2.5 py-0.5">
                {t("time")}
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">{t("challengeDesc")}</p>
          </div>
          <span className="inline-block bg-brand text-black text-sm font-bold rounded-lg px-5 py-2.5 group-hover:opacity-90 transition-opacity w-fit">
            {t("challengeCta")}
          </span>
        </Link>

        {/* Workshop Card */}
        <Link
          href="/quiz/workshop"
          className="group flex-1 flex flex-col gap-4 bg-neutral-900 border border-neutral-800 hover:border-brand rounded-2xl p-8 transition-colors duration-200 text-left"
        >
          <div className="text-4xl">🎭</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{t("workshopTitle")}</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">{t("workshopDesc")}</p>
          </div>
          <span className="inline-block bg-neutral-800 text-white text-sm font-bold rounded-lg px-5 py-2.5 border border-neutral-700 group-hover:border-brand transition-colors w-fit">
            {t("workshopCta")}
          </span>
        </Link>
      </div>
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

type CitySlug = "tel-aviv" | "kfar-saba";

type Props = {
  city: CitySlug;
  locale: string;
};

const CITY_KEY: Record<CitySlug, "telAviv" | "kfarSaba"> = {
  "tel-aviv": "telAviv",
  "kfar-saba": "kfarSaba",
};

/**
 * City hero section — server component (content), client scroll-reveal wrapper.
 * Displays the city name in Hebrew (h1) with a strong CTA.
 * Uses both "אקרויוגה" and "אקרו יוגה" spellings for keyword coverage.
 */
export default async function CityHero({ city, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "city" });
  const cityKey = CITY_KEY[city];

  return (
    <ScrollReveal>
      <section className="relative overflow-hidden rounded-none border-4 border-neutral-100 bg-neutral-950 px-8 py-16 text-center sm:px-12 sm:py-24">
        {/* Brutalist accent bar */}
        <div className="absolute inset-x-0 top-0 h-2 bg-brand" />

        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-5xl font-black tracking-tight text-neutral-100 sm:text-7xl">
            {t(`${cityKey}.heroTitle`)}
          </h1>

          {/* Pink accent bar under heading */}
          <div className="mx-auto mb-6 h-1 w-20 bg-brand" />

          {/* Keyword-rich subtitle covering both spellings */}
          <p className="mb-2 text-xl font-medium text-brand sm:text-2xl">
            {t(`${cityKey}.heroSubtitle`)}
          </p>
          <p className="mb-10 text-sm text-neutral-400">
            {locale === "he"
              ? "אקרויוגה · אקרו יוגה · ג׳אמים · שותפים · קהילה"
              : "Acroyoga · Acro Yoga · Jams · Partners · Community"}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/quiz`}
              className="btn-press inline-block border-4 border-neutral-100 bg-brand px-8 py-4 text-lg font-black uppercase tracking-widest text-neutral-950 transition-all hover:bg-neutral-100 hover:text-neutral-950"
            >
              {t(`${cityKey}.heroCta`)}
            </Link>
            <Link
              href={`/${locale}/jams`}
              className="btn-press inline-block border-4 border-neutral-100 bg-transparent px-8 py-4 text-lg font-black uppercase tracking-widest text-neutral-100 transition-all hover:bg-neutral-100 hover:text-neutral-950"
            >
              {locale === "he" ? "כל הג׳אמים" : "All Jams"}
            </Link>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-brand" />
      </section>
    </ScrollReveal>
  );
}

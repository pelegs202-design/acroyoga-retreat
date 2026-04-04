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
 * CityHero — Brutalist hero matching Stitch city-page.html design.
 *
 * Massive heading with pink underline decoration, gray intro text,
 * asymmetric layout with brutalist image frame.
 *
 * @see stitch-screens/city-page.html (Hero Section)
 * @see stitch-screens/city-page.png
 */
export default async function CityHero({ city, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "city" });
  const cityKey = CITY_KEY[city];

  return (
    <ScrollReveal>
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
              {t(`${cityKey}.heroTitle`).split(" ").slice(0, -2).join(" ")}{" "}
              <br />
              <span className="relative">
                {t(`${cityKey}.heroTitle`).split(" ").slice(-2).join(" ")}
                <span className="absolute bottom-2 right-0 w-full h-4 bg-brand -z-10 opacity-80" />
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mb-10 leading-relaxed">
              {t(`${cityKey}.heroSubtitle`)}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/quiz`}
                className="btn-press bg-brand text-black px-10 py-4 text-xl font-black border-[3px] border-neutral-800 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                {t(`${cityKey}.heroCta`)}
              </Link>
              <Link
                href={`/${locale}/jams`}
                className="btn-press bg-transparent text-white px-10 py-4 text-xl font-black border-2 border-white hover:bg-white/10 transition-colors"
              >
                {locale === "he" ? "גלו עוד" : "Discover More"}
              </Link>
            </div>
          </div>
          <div className="relative">
            {/* Brutalist Image Frame — matching Stitch */}
            <div className="relative z-10 border-2 border-white p-4 bg-[#0a0a0a]">
              <div className="w-full aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
                <span className="text-7xl font-black text-brand/10 select-none">
                  {city === "tel-aviv" ? "TLV" : "KFS"}
                </span>
              </div>
              <div className="absolute -bottom-4 -start-4 bg-white text-black font-black px-4 py-1 text-sm border-2 border-black">
                EST. 2024
              </div>
            </div>
            {/* Decorative pink offset border */}
            <div className="absolute -top-6 -end-6 w-full h-full border-2 border-brand -z-10" />
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

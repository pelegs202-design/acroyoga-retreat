import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

type CitySlug = "tel-aviv" | "kfar-saba";

type FaqItem = {
  q: string;
  a: string;
};

type Props = {
  city: CitySlug;
  locale: string;
  faqItems: FaqItem[];
};

/**
 * CityFAQ — Brutalist FAQ accordion matching Stitch city-page.html.
 *
 * Bordered card per FAQ item with pink + indicator, bold question text.
 * Uses details/summary HTML for semantic accordion — no JS needed.
 *
 * @see stitch-screens/city-page.html (FAQ Accordion section)
 */
export default async function CityFAQ({ locale, faqItems }: Props) {
  const t = await getTranslations({ locale, namespace: "city.faq" });

  return (
    <ScrollReveal delay={0.1}>
      <section className="py-24 bg-[#0a0a0a]/50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-12 text-center">
            {t("title")}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group border-2 border-white bg-neutral-900"
              >
                <summary className="w-full p-6 flex items-center justify-between text-start cursor-pointer list-none">
                  <span className="text-xl font-bold">{item.q}</span>
                  <span className="text-brand text-3xl font-black transition-transform group-open:rotate-45 shrink-0 ms-4">
                    +
                  </span>
                </summary>
                <div className="p-6 pt-0 text-gray-400 border-t border-white/5">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

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
 * CityFAQ — server component.
 * AEO-optimized FAQ: answers are short, direct, conversational — targeting AI search engine citation.
 * Each Q/A is h3 + p for semantic HTML (FAQPage schema injected at page level).
 * FAQ content is passed in from page.tsx (bilingual inline constants, not i18n).
 * Brutalist styling: thick left border (border-s-4 border-brand) per FAQ item,
 * bold summary text, pink accent on open state.
 */
export default async function CityFAQ({ locale, faqItems }: Props) {
  const t = await getTranslations({ locale, namespace: "city.faq" });

  return (
    <ScrollReveal delay={0.1}>
      <section>
        <h2 className="mb-3 text-3xl font-black uppercase tracking-tight text-neutral-100">
          {t("title")}
        </h2>
        {/* Pink accent bar under heading */}
        <div className="mb-8 h-1 w-16 bg-brand" />

        <div className="flex flex-col gap-0">
          {faqItems.map((item, idx) => (
            <details
              key={idx}
              className="group border-s-4 border-brand bg-neutral-950 open:bg-neutral-900 transition-colors"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 transition-colors hover:bg-neutral-900">
                <h3 className="text-base font-bold text-neutral-100 group-open:text-brand sm:text-lg transition-colors">
                  {item.q}
                </h3>
                <span className="ms-4 flex-shrink-0 text-2xl font-black text-brand transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="px-6 pb-6 pt-2 border-t border-neutral-800">
                <p className="leading-relaxed text-neutral-300">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

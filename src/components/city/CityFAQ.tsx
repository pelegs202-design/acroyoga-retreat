import { getTranslations } from "next-intl/server";

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
 */
export default async function CityFAQ({ locale, faqItems }: Props) {
  const t = await getTranslations({ locale, namespace: "city.faq" });

  return (
    <section>
      <h2 className="mb-8 text-3xl font-black uppercase tracking-tight text-neutral-100">
        {t("title")}
      </h2>

      <div className="space-y-0 divide-y-4 divide-neutral-800 border-4 border-neutral-800">
        {faqItems.map((item, idx) => (
          <details
            key={idx}
            className="group bg-neutral-950 open:bg-neutral-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 transition-colors hover:bg-neutral-900">
              <h3 className="text-base font-bold text-neutral-100 sm:text-lg">
                {item.q}
              </h3>
              <span className="ml-4 flex-shrink-0 text-2xl font-black text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="px-6 pb-6 pt-2">
              <p className="leading-relaxed text-neutral-300">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

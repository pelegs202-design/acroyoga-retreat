import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import WorkshopAdvantages from "@/components/quiz/WorkshopAdvantages";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quiz.workshop.confirmation" });
  return { title: t("title") };
}

export default async function WorkshopConfirmationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "quiz.workshop.confirmation" });
  const isRtl = locale === "he";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Confirmation header */}
      <section
        className="flex flex-col items-center justify-center px-4 pt-16 pb-10 text-center"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-5xl mb-6" aria-hidden="true">
          &#9989;
        </div>
        <h1 className="text-3xl font-black text-white mb-3">{t("title")}</h1>
        <p className="text-lg text-neutral-300 max-w-md">{t("subtitle")}</p>
        <p className="mt-3 text-sm text-neutral-500">{t("whatsapp")}</p>
      </section>

      {/* Advantages grid */}
      <WorkshopAdvantages locale={locale} />
    </main>
  );
}

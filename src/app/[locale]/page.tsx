import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.home", path: "" });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <HomeContent />;
}

// Client-side translations component
function HomeContent() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-100 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg text-neutral-400">{t("subtitle")}</p>
      </div>
    </main>
  );
}

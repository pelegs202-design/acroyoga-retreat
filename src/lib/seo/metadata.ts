import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const BASE_URL = "https://acroretreat.co.il";

export async function buildPageMetadata({
  locale,
  namespace,
  path,
}: {
  locale: string;
  namespace: string;
  path: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const canonicalHe = `${BASE_URL}/he${path}`;
  const canonicalEn = `${BASE_URL}/en${path}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "he" ? canonicalHe : canonicalEn,
      languages: {
        he: canonicalHe,
        en: canonicalEn,
        "x-default": canonicalHe, // Hebrew is x-default for Israel
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "he" ? canonicalHe : canonicalEn,
      siteName: "AcroHavura",
      locale: locale === "he" ? "he_IL" : "en_US",
      alternateLocale: locale === "he" ? "en_US" : "he_IL",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt:
            locale === "he"
              ? "אקרוחבורה - מצא שותף אקרויוגה"
              : "AcroHavura - Find Your Acro Partner",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

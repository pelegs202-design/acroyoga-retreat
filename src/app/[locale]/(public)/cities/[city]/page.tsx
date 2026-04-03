import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildLocalBusinessSchema, buildFAQSchema } from "@/lib/seo/schemas";
import CityHero from "@/components/city/CityHero";
import CityJamList from "@/components/city/CityJamList";
import CityStats from "@/components/city/CityStats";
import CityFAQ from "@/components/city/CityFAQ";
import { ShareButton } from "@/components/social/ShareButton";

export const revalidate = 3600; // ISR: revalidate every hour for fresh jam data

const SUPPORTED_CITIES = ["tel-aviv", "kfar-saba"] as const;
type CitySlug = (typeof SUPPORTED_CITIES)[number];

const FAQ_ITEMS: Record<CitySlug, Array<{ q: string; a: string }>> = {
  "tel-aviv": [
    {
      q: "מה זה אקרויוגה?",
      a: "אקרויוגה היא שילוב של אקרובטיקה, יוגה ומגע טיפולי. עובדים בזוגות — בייס (תומך) ופלייר (מתרומם) — ביחד יוצרים תנועות מדהימות שבונות כוח, גמישות ואמון.",
    },
    {
      q: "מי יכול לעשות אקרויוגה בתל אביב?",
      a: "כולם! לא צריך ניסיון קודם. כ-80% מהאנשים שמתחילים הם מתחילים מוחלטים. בתל אביב יש ג׳אמים לכל הרמות — מתחילים ועד מתקדמים.",
    },
    {
      q: "מה ההבדל בין בייס לפלייר?",
      a: "הבייס הוא המאזן — השוכב על הגב ומרים את הפלייר ברגליים. הפלייר הוא המתרומם — מתאזן על הבייס. בג׳אמים רוב האנשים מתנסים בשני התפקידים.",
    },
    {
      q: "כמה עולה ג׳אם אקרויוגה בתל אביב?",
      a: "רוב הג׳אמים הקהילתיים בתל אביב הם חינמיים או בתשלום סמלי (10-30 ₪). בדקו את לוח הג׳אמים לפרטים על כל אירוע.",
    },
    {
      q: "איפה מתקיימים ג׳אמי אקרויוגה בתל אביב?",
      a: "הג׳אמים בתל אביב מתקיימים בדרך כלל בפארקים ציבוריים כמו פארק הירקון, חוף הים, ולפעמים בסטודיו פנימי. הכתובת המדויקת מופיעה בכל ג׳אם בלוח.",
    },
    {
      q: "האם אקרויוגה מסוכן?",
      a: "אקרויוגה בטוח כשמתרגלים אותו נכון עם ספוטר (מאבטח). בג׳אמים תמיד יש ספוטרים ומדריכים מנוסים. מתחילים תמיד מתחילים נמוך ומתקדמים בהדרגה.",
    },
  ],
  "kfar-saba": [
    {
      q: "מה זה אקרויוגה?",
      a: "אקרויוגה היא שילוב של אקרובטיקה, יוגה ומגע טיפולי. עובדים בזוגות — בייס (תומך) ופלייר (מתרומם) — ביחד יוצרים תנועות מדהימות שבונות כוח, גמישות ואמון.",
    },
    {
      q: "מי יכול לעשות אקרויוגה בכפר סבא?",
      a: "כולם! לא צריך ניסיון קודם. בכפר סבא וסביבת השרון יש קהילת אקרויוגה פעילה שמקבלת מתחילים בחום.",
    },
    {
      q: "מה ההבדל בין בייס לפלייר?",
      a: "הבייס הוא המאזן — השוכב על הגב ומרים את הפלייר ברגליים. הפלייר הוא המתרומם — מתאזן על הבייס. בג׳אמים רוב האנשים מתנסים בשני התפקידים.",
    },
    {
      q: "כמה עולה ג׳אם אקרויוגה בכפר סבא?",
      a: "רוב הג׳אמים הקהילתיים הם חינמיים או בתשלום סמלי. בדקו את לוח הג׳אמים לפרטים על כל אירוע.",
    },
    {
      q: "איפה מתקיימים ג׳אמי אקרויוגה בכפר סבא?",
      a: "הג׳אמים בכפר סבא מתקיימים בפארקים ציבוריים, גנים ולפעמים בחצר. הכתובת המדויקת מופיעה בכל ג׳אם בלוח.",
    },
    {
      q: "האם אקרויוגה מסוכן?",
      a: "אקרויוגה בטוח כשמתרגלים אותו נכון עם ספוטר (מאבטח). בג׳אמים תמיד יש ספוטרים ומדריכים מנוסים. מתחילים תמיד מתחילים נמוך ומתקדמים בהדרגה.",
    },
  ],
};

type Props = {
  params: Promise<{ locale: string; city: string }>;
};

export async function generateStaticParams() {
  return [
    { locale: "he", city: "tel-aviv" },
    { locale: "he", city: "kfar-saba" },
    { locale: "en", city: "tel-aviv" },
    { locale: "en", city: "kfar-saba" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city } = await params;

  if (!SUPPORTED_CITIES.includes(city as CitySlug)) {
    return {};
  }

  const namespace =
    city === "tel-aviv" ? "seo.cityTelAviv" : "seo.cityKfarSaba";

  return buildPageMetadata({
    locale,
    namespace,
    path: `/cities/${city}`,
  });
}

export default async function CityPage({ params }: Props) {
  const { locale, city } = await params;

  if (!SUPPORTED_CITIES.includes(city as CitySlug)) {
    notFound();
  }

  setRequestLocale(locale);

  const citySlug = city as CitySlug;
  const faqItems = FAQ_ITEMS[citySlug];

  const canonicalUrl = `https://acroretreat.co.il/${locale}/cities/${city}`;
  const cityTitle =
    citySlug === "tel-aviv"
      ? locale === "he"
        ? "אקרויוגה בתל אביב | אקרוחבורה"
        : "Acroyoga in Tel Aviv | AcroHavura"
      : locale === "he"
        ? "אקרויוגה בכפר סבא | אקרוחבורה"
        : "Acroyoga in Kfar Saba | AcroHavura";

  return (
    <>
      <JsonLd data={buildLocalBusinessSchema(citySlug)} />
      <JsonLd data={buildFAQSchema(faqItems)} />

      <div className="space-y-16">
        <CityHero city={citySlug} locale={locale} />
        <CityJamList city={citySlug} locale={locale} />
        <CityStats city={citySlug} />
        <CityFAQ city={citySlug} locale={locale} faqItems={faqItems} />
      </div>

      <ShareButton url={canonicalUrl} title={cityTitle} />
    </>
  );
}

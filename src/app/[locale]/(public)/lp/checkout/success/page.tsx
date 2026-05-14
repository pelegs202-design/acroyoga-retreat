import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SuccessFlow from "./SuccessFlow";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "he" ? "ברוך/ה הבא/ה! · אקרוחבורה" : "Welcome! · AcroHavura",
    robots: { index: false, follow: false },
  };
}

export default async function LpCheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session } = await searchParams;
  setRequestLocale(locale);

  if (!session) {
    redirect(`/${locale}/lp/checkout`);
  }

  return (
    <main className="min-h-screen">
      <SuccessFlow locale={locale} paymentSessionId={session} />
    </main>
  );
}

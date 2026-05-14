import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import CheckoutFlow from "./CheckoutFlow";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    slot?: string;
    source?: string;
    session?: string;
    payment?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "he" ? "השלמת הזמנה · אקרוחבורה" : "Complete Your Booking · AcroHavura",
    robots: { index: false, follow: false },
  };
}

export default async function LpCheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { slot, source, session, payment } = await searchParams;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen">
      <CheckoutFlow
        locale={locale}
        initialSlotId={slot}
        source={source}
        sessionId={session}
        paymentFailed={payment === "failed"}
      />
    </main>
  );
}

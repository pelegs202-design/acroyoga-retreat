"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { trackCheckoutStarted, trackTimeOnPage } from "@/lib/quiz/quiz-analytics";

const MORNING_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MORNING_PAYMENT_URL || "https://morning-sale.page/acroyoga";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <p className="text-neutral-400">Loading checkout...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const sessionId = searchParams.get("session");
  const isHe = locale === "he";
  const mountTime = useRef(Date.now());
  const redirected = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      router.push("/quiz");
      return;
    }

    // Track checkout started
    trackCheckoutStarted(sessionId);
    trackTimeOnPage("checkout", 0);

    // Redirect to external payment page
    if (!redirected.current) {
      redirected.current = true;
      window.location.href = MORNING_PAYMENT_URL;
    }
  }, [sessionId, router]);

  // Show a brief loading state while redirecting
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" />
        <p className="text-white text-lg font-bold">
          {isHe ? "מעבירים לדף התשלום..." : "Redirecting to payment..."}
        </p>
      </div>
      <p className="text-neutral-500 text-sm">
        {isHe ? "₪99 בלבד · תשלום מאובטח · ערבות החזר 30 יום" : "₪99 only · Secure payment · 30-day money back"}
      </p>
    </main>
  );
}

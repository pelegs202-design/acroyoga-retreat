"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";

const MORNING_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MORNING_PAYMENT_URL || "https://mrng.to/c1Syv3Bh2l";

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

  const [redirecting, setRedirecting] = useState(false);

  // Poll Morning API every 5 seconds to check if payment was made
  const checkPayment = useCallback(async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(`/api/payments/status?session=${sessionId}`);
      const data = await res.json();
      return data.paid === true;
    } catch {
      return false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || redirecting) return;

    // Start polling after 10 seconds (give user time to fill in the form)
    const startDelay = setTimeout(() => {
      const interval = setInterval(async () => {
        const paid = await checkPayment();
        if (paid) {
          clearInterval(interval);
          setRedirecting(true);
          window.location.href = `/${locale}/quiz/challenge/success?session=${sessionId}`;
        }
      }, 5000); // Check every 5 seconds

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, 10000);

    return () => clearTimeout(startDelay);
  }, [sessionId, redirecting, checkPayment, locale]);

  if (!sessionId) {
    router.push("/quiz");
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-black text-white text-center mb-2">
          {isHe ? "השלמת תשלום" : "Complete Payment"}
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-6">
          {isHe
            ? "מלאו את פרטי התשלום למטה — תועברו אוטומטית לאחר התשלום"
            : "Fill in your payment details below — you'll be redirected automatically after payment"}
        </p>

        {/* Redirecting indicator */}
        {redirecting && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" />
            <p className="text-green-400 text-sm font-semibold">
              {isHe ? "!תשלום התקבל — מעבירים אתכם" : "Payment received — redirecting..."}
            </p>
          </div>
        )}

        {/* Morning payment form iframe */}
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-white">
          <iframe
            src={MORNING_PAYMENT_URL}
            title={isHe ? "טופס תשלום" : "Payment Form"}
            width="100%"
            height="600"
            style={{ border: "none", minHeight: "600px" }}
            allow="payment"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(`/quiz/challenge/results?session=${sessionId}`)
          }
          className="mt-4 text-neutral-500 text-sm hover:text-neutral-300 transition-colors mx-auto block"
        >
          {isHe ? "← חזרה לתוצאות" : "← Back to results"}
        </button>
      </div>
    </main>
  );
}

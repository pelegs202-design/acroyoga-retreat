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

  const [showButton, setShowButton] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Poll enrollment status every 3 seconds
  // When Morning webhook fires and writes enrollment, this detects it and auto-redirects
  const checkEnrollment = useCallback(async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(`/api/payments/status?session=${sessionId}`);
      const data = await res.json();
      return data.enrolled === true;
    } catch {
      return false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || redirecting) return;
    const interval = setInterval(async () => {
      const enrolled = await checkEnrollment();
      if (enrolled) {
        setRedirecting(true);
        clearInterval(interval);
        router.push(`/quiz/challenge/success?session=${sessionId}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, redirecting, checkEnrollment, router]);

  // Show manual "I've paid" button after 15 seconds as fallback
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 15000);
    return () => clearTimeout(timer);
  }, []);

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

        {/* Redirecting indicator */}
        {redirecting && (
          <p className="mt-4 text-brand text-center text-sm font-semibold animate-pulse">
            {isHe ? "...מעביר לעמוד ההצלחה" : "Redirecting to success page..."}
          </p>
        )}

        {/* Fallback button after 15s in case webhook is slow */}
        {showButton && !redirecting && (
          <button
            type="button"
            onClick={() =>
              router.push(`/quiz/challenge/success?session=${sessionId}`)
            }
            className="mt-6 w-full rounded-xl bg-brand text-white text-center py-4 text-base font-black hover:opacity-90 transition-all"
          >
            {isHe
              ? "✓ שילמתי — קחו אותי לשלב הבא"
              : "✓ I've Paid — Take Me to the Next Step"}
          </button>
        )}

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

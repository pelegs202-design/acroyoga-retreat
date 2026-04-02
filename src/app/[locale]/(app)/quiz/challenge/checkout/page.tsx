"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";

const MORNING_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MORNING_PAYMENT_URL || "https://mrng.to/c1Syv3Bh2l";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const sessionId = searchParams.get("session");
  const isHe = locale === "he";

  const [paid, setPaid] = useState(false);

  // Poll for enrollment confirmation every 3 seconds
  // When the webhook fires and writes the enrollment, this will detect it
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
    if (!sessionId || paid) return;
    const interval = setInterval(async () => {
      const enrolled = await checkEnrollment();
      if (enrolled) {
        setPaid(true);
        clearInterval(interval);
        router.push(`/quiz/challenge/success?session=${sessionId}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, paid, checkEnrollment, router]);

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
            ? "מלאו את פרטי התשלום למטה"
            : "Fill in your payment details below"}
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

        <p className="text-neutral-500 text-xs text-center mt-4">
          {isHe
            ? "לאחר התשלום תועברו אוטומטית לעמוד ההצלחה"
            : "After payment you'll be redirected to the success page automatically"}
        </p>

        <button
          type="button"
          onClick={() => router.push(`/quiz/challenge/results?session=${sessionId}`)}
          className="mt-4 text-neutral-500 text-sm hover:text-neutral-300 transition-colors mx-auto block"
        >
          {isHe ? "← חזרה לתוצאות" : "← Back to results"}
        </button>
      </div>
    </main>
  );
}

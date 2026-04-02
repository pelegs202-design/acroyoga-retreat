"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";

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

  // Listen for PAYMENT_SUCCESS message from the proxied iframe
  useEffect(() => {
    if (!sessionId || redirecting) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "PAYMENT_SUCCESS") {
        setRedirecting(true);
        router.push(`/quiz/challenge/success?session=${sessionId}`);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sessionId, redirecting, router]);

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

        {/* Morning payment form via same-origin proxy */}
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-white">
          <iframe
            src="/api/payments/proxy"
            title={isHe ? "טופס תשלום" : "Payment Form"}
            width="100%"
            height="600"
            style={{ border: "none", minHeight: "600px" }}
            allow="payment"
          />
        </div>

        {redirecting && (
          <p className="mt-4 text-brand text-center text-sm font-semibold animate-pulse">
            {isHe ? "...מעביר לעמוד ההצלחה" : "Redirecting to success page..."}
          </p>
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

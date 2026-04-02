"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";

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

  const [iframeLoads, setIframeLoads] = useState(0);
  const [showPaidButton, setShowPaidButton] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect iframe navigation — Morning reloads/redirects after successful payment
  // First load = payment form. Second load = success page inside iframe.
  const handleIframeLoad = useCallback(() => {
    setIframeLoads((prev) => {
      const next = prev + 1;
      // After the second load (payment completed, Morning shows success),
      // show the "Continue" button
      if (next >= 2) {
        setShowPaidButton(true);
      }
      return next;
    });
  }, []);

  // Also listen for postMessage from Morning (in case they send one)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Log any messages from the iframe for debugging
      console.log("[checkout] postMessage received:", event.origin, event.data);
      // If Morning sends any message after payment, show the button
      if (
        event.origin.includes("greeninvoice") ||
        event.origin.includes("mrng.to") ||
        event.origin.includes("morning")
      ) {
        setShowPaidButton(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-show the "I've paid" button after 30 seconds regardless
  // (user might be slow to fill in payment details)
  useEffect(() => {
    const timer = setTimeout(() => setShowPaidButton(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const goToSuccess = () => {
    router.push(`/quiz/challenge/success?session=${sessionId}`);
  };

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
            ref={iframeRef}
            src={MORNING_PAYMENT_URL}
            title={isHe ? "טופס תשלום" : "Payment Form"}
            width="100%"
            height="600"
            style={{ border: "none", minHeight: "600px" }}
            allow="payment"
            onLoad={handleIframeLoad}
          />
        </div>

        {/* Show "Continue" button after payment detected or after 30s */}
        {showPaidButton && (
          <button
            type="button"
            onClick={goToSuccess}
            className="mt-6 w-full rounded-xl bg-brand text-white text-center py-4 text-base font-black hover:opacity-90 transition-all animate-pulse"
          >
            {isHe ? "✓ שילמתי — קחו אותי לשלב הבא" : "✓ I've Paid — Take Me to the Next Step"}
          </button>
        )}

        {/* Manual fallback link always visible */}
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

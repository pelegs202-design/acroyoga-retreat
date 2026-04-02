"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";

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

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [phase, setPhase] = useState<"waiting" | "paying" | "done">("waiting");
  const [showFallback, setShowFallback] = useState(false);

  // Monitor child frame count inside the Morning iframe
  // Meshulam (payment processor) opens a nested iframe for card form
  // When payment completes, that nested iframe closes → frame count drops
  useEffect(() => {
    if (!iframeRef.current || !sessionId) return;

    let maxFrameCount = 0;
    let payingStartTime = 0;

    const interval = setInterval(() => {
      try {
        const count = iframeRef.current?.contentWindow?.length ?? 0;

        // Frame count increased — payment processor opened
        if (count > maxFrameCount) {
          maxFrameCount = count;
          if (payingStartTime === 0) payingStartTime = Date.now();
          setPhase("paying");
        }

        // Frame count dropped back to 0 after being higher — payment completed
        if (maxFrameCount > 0 && count === 0) {
          clearInterval(interval);
          setPhase("done");
          window.location.href = `/${locale}/quiz/challenge/success?session=${sessionId}`;
        }

        // Fallback: if in paying phase for 15+ seconds, show manual button
        // (covers Bit/PayPal flows that may not use nested iframes)
        if (payingStartTime > 0 && Date.now() - payingStartTime > 15000) {
          setShowFallback(true);
        }
      } catch {
        // contentWindow access might throw — ignore
      }
    }, 500);

    // Also show fallback button after 45 seconds regardless
    // (in case frame count detection doesn't work at all)
    const fallbackTimer = setTimeout(() => setShowFallback(true), 45000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, [sessionId, locale]);

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

        {/* Status indicator */}
        {phase === "paying" && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" />
            <p className="text-brand text-sm font-semibold">
              {isHe ? "...מעבד תשלום" : "Processing payment..."}
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-green-400 text-sm font-semibold animate-pulse">
              {isHe ? "...מעביר לעמוד ההצלחה" : "Redirecting to success page..."}
            </p>
          </div>
        )}

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
          />
        </div>

        {/* Fallback button — appears if auto-detection is slow */}
        {showFallback && phase !== "done" && (
          <button
            type="button"
            onClick={() =>
              (window.location.href = `/${locale}/quiz/challenge/success?session=${sessionId}`)
            }
            className="mt-6 w-full rounded-xl bg-brand text-white text-center py-4 text-base font-black hover:opacity-90 transition-all"
          >
            {isHe
              ? "✓ שילמתי — המשיכו לשלב הבא"
              : "✓ I've Paid — Continue to Next Step"}
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

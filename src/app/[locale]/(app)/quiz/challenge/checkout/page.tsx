"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { trackCheckoutStarted, trackCheckoutAbandoned, trackTimeOnPage } from "@/lib/quiz/quiz-analytics";

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
  const mountTime = useRef(Date.now());

  // Track checkout started + abandonment
  useEffect(() => {
    if (sessionId) trackCheckoutStarted(sessionId);

    const handleUnload = () => {
      if (sessionId) {
        const seconds = Math.round((Date.now() - mountTime.current) / 1000);
        trackCheckoutAbandoned(sessionId, seconds);
        trackTimeOnPage("checkout", seconds);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId]);

  const [redirecting, setRedirecting] = useState(false);
  // Record when user opened checkout — only detect payments AFTER this time
  const [checkoutOpenedAt] = useState(() => new Date().toISOString());

  // Poll Morning API every 5 seconds to check if payment was made
  const checkPayment = useCallback(async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(`/api/payments/status?session=${sessionId}&since=${encodeURIComponent(checkoutOpenedAt)}`);
      const data = await res.json();
      return data.paid === true;
    } catch {
      return false;
    }
  }, [sessionId, checkoutOpenedAt]);

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

  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-black text-white text-center mb-2">
          {isHe ? "השלמת תשלום" : "Complete Payment"}
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-4">
          {isHe
            ? "מלאו את פרטי התשלום למטה — תועברו אוטומטית לאחר התשלום"
            : "Fill in your payment details below — you'll be redirected automatically after payment"}
        </p>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
            {isHe ? "תשלום מאובטח" : "Secure payment"}
          </span>
          <span>{isHe ? "ערבות החזר 30 יום" : "30-day money back"}</span>
          <span>{isHe ? "ביטול בכל עת" : "Cancel anytime"}</span>
        </div>

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
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-white relative">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
              <div className="animate-spin h-8 w-8 border-3 border-pink-400 border-t-transparent rounded-full" />
              <p className="text-neutral-500 text-sm">{isHe ? "טוען טופס תשלום..." : "Loading payment form..."}</p>
            </div>
          )}
          <iframe
            src={MORNING_PAYMENT_URL}
            title={isHe ? "טופס תשלום" : "Payment Form"}
            width="100%"
            height="600"
            style={{ border: "none", minHeight: "600px" }}
            allow="payment"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        <p className="text-center text-neutral-600 text-xs mt-3">
          {isHe ? "₪99 בלבד · ללא חיוב חוזר · ללא התחייבות" : "₪99 only · No recurring charges · No commitment"}
        </p>

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

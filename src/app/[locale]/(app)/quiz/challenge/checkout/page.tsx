"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

/**
 * Legacy checkout page — the funnel is now free trial class booking.
 * Redirects to quiz landing so stale URLs don't show outdated pricing.
 */
export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quiz/challenge");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-neutral-400">Redirecting...</p>
    </main>
  );
}

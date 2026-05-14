"use client";

import Link from "next/link";
import { MoneyBackBadge } from "./MoneyBackBadge";

interface IntroPackOfferProps {
  locale: string;
  /** lp_variant: 'shape' | 'flex' | 'reset' — passed through as ?source= on the CTA href. */
  source: string;
  /** Optional preselected slot id (from <SlotCapacityWidget>) — appended as ?slot= on the CTA. */
  slotId?: string;
  /** Location on the page — for analytics ('hero' | 'offer_box' | 'final'). */
  ctaLocation?: string;
  className?: string;
}

const PRICE_ILS = 149;

export function IntroPackOffer({
  locale,
  source,
  slotId,
  ctaLocation = "offer_box",
  className = "",
}: IntroPackOfferProps) {
  const isHe = locale === "he";

  const checkoutParams = new URLSearchParams({ source });
  if (slotId) checkoutParams.set("slot", slotId);
  if (ctaLocation) checkoutParams.set("location", ctaLocation);
  const href = `/${locale}/lp/checkout?${checkoutParams.toString()}`;

  return (
    <div
      className={`rounded-2xl border-4 border-black bg-white p-6 shadow-lg ${className}`}
      dir={isHe ? "rtl" : "ltr"}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-neutral-600">
        {isHe ? "מסלול ההיכרות" : "Intro Pack"}
      </p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-5xl font-black text-black">₪{PRICE_ILS}</span>
        <span className="text-base text-neutral-600">
          {isHe ? "ל-3 שיעורים" : "for 3 classes"}
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-neutral-500">
        {isHe ? "תשלום חד-פעמי · ללא התחייבות" : "One-time payment · no commitment"}
      </p>

      <ul className="mt-5 space-y-2 text-sm text-neutral-800">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-600">✓</span>
          <span>{isHe ? "3 שיעורים מודרכים, 90 דקות כל אחד" : "3 guided classes, 90 minutes each"}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-600">✓</span>
          <span>{isHe ? "אין צורך בניסיון או בפרטנר" : "No experience or partner needed"}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-600">✓</span>
          <span>{isHe ? "מסלול מותאם למתחילים — אבל תטוסו כבר בשיעור הראשון" : "Built for total beginners — but you'll fly in class 1"}</span>
        </li>
      </ul>

      <Link
        href={href}
        data-cta-location={ctaLocation}
        className="mt-6 block w-full rounded-xl bg-black px-6 py-4 text-center text-lg font-black text-white transition hover:translate-y-0.5"
      >
        {isHe ? `אני בפנים — ${PRICE_ILS} ₪` : `I'm In — Claim My Spot ₪${PRICE_ILS}`}
      </Link>

      <div className="mt-4">
        <MoneyBackBadge locale={locale} variant="full" />
      </div>
    </div>
  );
}

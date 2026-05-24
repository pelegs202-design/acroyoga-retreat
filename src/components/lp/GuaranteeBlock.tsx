"use client";

import { GUARANTEE } from "@/lib/lp/syllabi";

/**
 * Click Coach Pattern 4 — Differentiation via guarantee.
 * Google-able copy. Sits above the syllabus to remove the "what if I hate it" objection.
 */
export function GuaranteeBlock() {
  return (
    <section dir="rtl" className="py-14 px-6 bg-[#0a0a0a] border-y-2 border-brand">
      <div className="max-w-4xl mx-auto">
        <div className="border-[3px] border-brand bg-brand/5 p-6 md:p-10 relative">
          <span className="absolute -top-3 right-6 bg-brand text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {GUARANTEE.badge}
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
            {GUARANTEE.title}
          </h2>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            {GUARANTEE.body}
          </p>
          <div className="mt-6 flex items-center gap-3 text-brand">
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-black text-sm md:text-base">סיכון אפס. סוף סיפור.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

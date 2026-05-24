"use client";

import type { Syllabus } from "@/lib/lp/syllabi";

interface Props {
  syllabus: Syllabus;
}

/**
 * Click Coach Pattern 18 — "Why this works" mechanism cards.
 * Doesn't tell the user WHAT they get; explains WHY the method works
 * (vs alternatives they've tried before).
 */
export function MechanismBlock({ syllabus }: Props) {
  return (
    <section dir="rtl" className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-3">
            למה זה עובד
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
            {syllabus.mechanismTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {syllabus.mechanism.map((m, i) => (
            <article
              key={i}
              className="border-2 border-neutral-700 bg-neutral-900 p-6 hover:border-brand transition-colors"
            >
              <div className="text-brand text-xs font-black uppercase tracking-[0.25em] mb-3">
                {m.label}
              </div>
              <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                {m.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

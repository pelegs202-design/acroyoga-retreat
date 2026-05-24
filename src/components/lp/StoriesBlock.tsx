"use client";

import type { Syllabus } from "@/lib/lp/syllabi";

interface Props {
  syllabus: Syllabus;
}

/**
 * Click Coach Pattern 14 — Customer stories > testimonials.
 * 3-act arc per story: pain (before) → failed attempts (tried) → shift (after).
 */
export function StoriesBlock({ syllabus }: Props) {
  return (
    <section dir="rtl" className="py-16 px-6 bg-neutral-950 border-y-2 border-neutral-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-3">
            סיפורים — לא מילים של נימוס
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
            אנשים שהתחילו בדיוק במקום שאת/ה נמצא/ת בו
          </h2>
        </div>

        <div className="space-y-6">
          {syllabus.stories.map((s, i) => (
            <article
              key={i}
              className="border-2 border-neutral-700 bg-neutral-900 p-6 md:p-8 hover:border-brand transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-brand text-xs font-black uppercase tracking-[0.25em] mb-2">
                    01 · המצב לפני
                  </div>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    {s.before}
                  </p>
                </div>
                <div className="md:border-x-2 md:border-neutral-800 md:px-6">
                  <div className="text-brand text-xs font-black uppercase tracking-[0.25em] mb-2">
                    02 · מה ניסה/תה — שלא עבד
                  </div>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    {s.tried}
                  </p>
                </div>
                <div>
                  <div className="text-brand text-xs font-black uppercase tracking-[0.25em] mb-2">
                    03 · המעבר
                  </div>
                  <p className="text-sm md:text-base text-white leading-relaxed">
                    {s.after}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t-2 border-neutral-800 text-brand text-sm font-black tracking-widest">
                — {s.name}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

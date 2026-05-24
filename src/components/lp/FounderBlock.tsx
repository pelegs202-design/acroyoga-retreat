"use client";

import Image from "next/image";
import { FOUNDER } from "@/lib/lp/syllabi";

/**
 * Click Coach Pattern 17 — The unsung About section.
 * Founder face + story + credibility numbers. "This guy will actually be there."
 * Critical for phone-call close: warm lead needs to see who's on the other end.
 */
export function FounderBlock() {
  return (
    <section dir="rtl" className="py-16 px-6 bg-neutral-950 border-y-2 border-neutral-800">
      <div className="max-w-5xl mx-auto">
        <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-3 text-center md:text-start">
          מי שיענה לך
        </p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight text-center md:text-start">
          {FOUNDER.name} — המייסד והמורה
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-start">
          <div className="relative mx-auto md:mx-0">
            <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] border-[3px] border-brand overflow-hidden">
              <Image
                src={FOUNDER.photo}
                alt={FOUNDER.name}
                fill
                sizes="(max-width: 768px) 200px, 260px"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="absolute -bottom-3 -start-3 bg-brand text-black px-3 py-1.5 font-black text-xs uppercase tracking-widest border-2 border-black">
              {FOUNDER.credibilityLine}
            </div>
          </div>

          <div className="space-y-4">
            {FOUNDER.paragraphs.map((p, i) => (
              <p key={i} className="text-base md:text-lg text-gray-200 leading-relaxed">
                {p}
              </p>
            ))}
            <div className="pt-3 border-t-2 border-neutral-800 mt-4">
              <p className="text-brand font-bold text-sm md:text-base">
                — שי, מייסד אקרוחבורה
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

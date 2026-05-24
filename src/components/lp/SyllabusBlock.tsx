"use client";

import type { Syllabus } from "@/lib/lp/syllabi";

interface Props {
  syllabus: Syllabus;
}

/**
 * The 4-week syllabus card. Each week has:
 *  - week label (e.g. "שבוע 1")
 *  - title (the thematic name)
 *  - body (what happens)
 *  - shift (the "this is the moment when..." emotional payoff — the line that lands)
 */
export function SyllabusBlock({ syllabus }: Props) {
  return (
    <section
      dir="rtl"
      className="py-16 px-6 bg-[#0a0a0a] border-y-2 border-neutral-800"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-3">
            סילבוס הקורס
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 max-w-3xl mx-auto leading-tight">
            {syllabus.syllabusTitle}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {syllabus.syllabusSub}
          </p>
        </div>

        <div className="space-y-4">
          {syllabus.weeks.map((w, i) => (
            <article
              key={i}
              className="group relative border-2 border-neutral-700 bg-neutral-900 p-6 md:p-8 hover:border-brand transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="md:w-40 shrink-0">
                  <div className="text-brand text-xs font-black uppercase tracking-[0.25em] mb-1">
                    {w.week}
                  </div>
                  <div className="text-5xl md:text-6xl font-black text-white/10 group-hover:text-brand/30 transition-colors leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-3 leading-snug">
                    {w.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {w.body}
                  </p>
                  <div className="border-r-4 border-brand pr-4 py-1 bg-brand/5">
                    <p className="text-brand text-sm md:text-base font-bold leading-snug">
                      {w.shift}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

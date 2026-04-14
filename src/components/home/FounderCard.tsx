"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/effects/ScrollReveal";

export function FounderCard() {
  const t = useTranslations("home.founder");

  return (
    <section className="w-full bg-background py-20 px-6">
      <ScrollReveal>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-center bg-neutral-900 border-2 border-neutral-800 p-6 sm:p-10">
            {/* Photo */}
            <div className="relative mx-auto md:mx-0 w-48 h-48 md:w-[260px] md:h-[260px] border-2 border-brand overflow-hidden">
              <Image
                src="/founder-shai.jpg"
                alt={t("name")}
                fill
                sizes="(max-width: 768px) 192px, 260px"
                className="object-cover"
                priority={false}
              />
              <span className="absolute -bottom-3 -end-3 bg-black border-2 border-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
                {t("badge")}
              </span>
            </div>

            {/* Bio */}
            <div className="text-center md:text-start">
              <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-2">
                {t("label")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                {t("name")}
              </h2>
              <p className="text-neutral-300 text-base leading-relaxed mb-4">
                {t("bio")}
              </p>
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">
                  {t("credentialsLabel")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {t.raw("credentials").map((c: string) => (
                    <span
                      key={c}
                      className="inline-block text-xs font-bold text-white bg-neutral-800 border border-neutral-700 px-3 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <blockquote className="border-s-2 border-brand ps-4 mb-6 text-white/80 italic text-sm">
                {t("quote")}
              </blockquote>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/quiz"
                  className="btn-press inline-flex items-center gap-2 bg-brand text-black px-6 py-3 font-black text-sm uppercase border-2 border-brand hover:bg-transparent hover:text-brand transition-all"
                >
                  {t("ctaPrimary")}
                  <span aria-hidden="true">←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

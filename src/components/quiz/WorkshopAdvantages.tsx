"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface AdvantageItem {
  icon: string;
  title: string;
  desc: string;
}

interface WorkshopAdvantagesProps {
  locale: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

export default function WorkshopAdvantages({ locale }: WorkshopAdvantagesProps) {
  const t = useTranslations("quiz.workshop.advantages");
  const items = t.raw("items") as AdvantageItem[];
  const title = t("title");

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-10">
      <motion.h2
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold text-white text-center mb-8"
      >
        {title}
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <span className="text-3xl" aria-hidden="true">{item.icon}</span>
            <h3 className="text-base font-bold text-white">{item.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href={`/${locale}`}
          className="text-sm text-neutral-400 hover:text-pink-400 underline underline-offset-4 transition-colors"
        >
          {locale === "he" ? "חזרה לדף הבית" : "Back to Home"}
        </Link>
      </div>
    </section>
  );
}

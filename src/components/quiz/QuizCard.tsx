"use client";

import { motion } from "framer-motion";
import type { QuestionOption } from "./QuizEngine";

interface QuizCardProps {
  option: QuestionOption;
  onSelect: () => void;
  selected?: boolean;
  locale: string;
}

export default function QuizCard({ option, onSelect, selected = false, locale }: QuizCardProps) {
  const label = locale === "he" ? option.label.he : option.label.en;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={[
        "card-hover btn-press",
        "flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 bg-[#1a1a1a] p-6 text-center cursor-pointer transition-colors focus:outline-none",
        selected
          ? "border-[#F472B6] bg-brand/10"
          : "border-neutral-700 hover:border-[#F472B6]",
      ].join(" ")}
      aria-pressed={selected}
    >
      {option.icon && (
        <span className="text-4xl leading-none" aria-hidden="true">
          {option.icon}
        </span>
      )}
      {option.image && !option.icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={option.image}
          alt=""
          className="w-12 h-12 object-cover rounded-lg"
        />
      )}
      <span className={`text-sm font-medium ${selected ? "text-brand" : "text-white"}`}>
        {label}
      </span>
    </motion.button>
  );
}

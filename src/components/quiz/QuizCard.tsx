"use client";

import { motion } from "framer-motion";
import type { QuestionOption } from "./QuizEngine";

interface QuizCardProps {
  option: QuestionOption;
  onSelect: () => void;
  locale: string;
}

export default function QuizCard({ option, onSelect, locale }: QuizCardProps) {
  const label = locale === "he" ? option.label.he : option.label.en;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center justify-center gap-3 w-full rounded-xl border border-neutral-700 bg-[#1a1a1a] p-6 text-center cursor-pointer transition-colors hover:border-[#F472B6] focus:outline-none focus:border-[#F472B6]"
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
      <span className="text-sm font-medium text-white">{label}</span>
    </motion.button>
  );
}

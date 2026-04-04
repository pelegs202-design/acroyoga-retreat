"use client";

import { motion } from "framer-motion";
import type { QuestionOption } from "./QuizEngine";

interface QuizCardProps {
  option: QuestionOption;
  onSelect: () => void;
  selected?: boolean;
  locale: string;
}

/**
 * QuizCard — Brutalist option card matching Stitch quiz-challenge.html.
 *
 * Full-width card with thick 2px border, centered text.
 * Selected state: pink border + glow shadow + subtle pink tint bg.
 * No rounded corners — sharp brutalist edges.
 *
 * @see stitch-screens/quiz-challenge.html
 * @see stitch-screens/quiz-challenge.png
 */
export default function QuizCard({ option, onSelect, selected = false, locale }: QuizCardProps) {
  const label = locale === "he" ? option.label.he : option.label.en;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={[
        "w-full p-5 text-center font-bold text-lg cursor-pointer transition-colors border-2",
        selected
          ? "border-brand bg-neutral-900 shadow-[0_0_15px_rgba(244,114,182,0.3)]"
          : "border-neutral-800 hover:bg-neutral-900",
      ].join(" ")}
      aria-pressed={selected}
    >
      {option.icon && (
        <span className="text-3xl leading-none block mb-2" aria-hidden="true">
          {option.icon}
        </span>
      )}
      <span className={selected ? "text-brand" : "text-white"}>
        {label}
      </span>
    </motion.button>
  );
}

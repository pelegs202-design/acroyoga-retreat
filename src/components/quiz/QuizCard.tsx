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
 * QuizCard — Brutalist option card with satisfying micro-animations.
 *
 * Full-width card with thick 2px border, centered text.
 * Selected state: pink border + glow shadow + check mark + subtle scale.
 * Hover: lift effect. Tap: bounce compress.
 * No rounded corners — sharp brutalist edges.
 */
export default function QuizCard({ option, onSelect, selected = false, locale }: QuizCardProps) {
  const label = locale === "he" ? option.label.he : option.label.en;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.03, y: -2 }}
      animate={selected ? {
        scale: [1, 1.05, 1],
        borderColor: "#F472B6",
        transition: { scale: { duration: 0.3 } },
      } : {}}
      className={[
        "w-full p-5 text-center font-bold text-lg cursor-pointer transition-colors border-2 relative overflow-hidden",
        selected
          ? "border-brand bg-neutral-900 shadow-[0_0_20px_rgba(244,114,182,0.35)]"
          : "border-neutral-800 hover:bg-neutral-900 hover:border-neutral-600",
      ].join(" ")}
      aria-pressed={selected}
    >
      {/* Selection check mark — appears with spring animation */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute top-2 end-2"
        >
          <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </motion.div>
      )}

      {/* Pink shimmer on selection */}
      {selected && (
        <motion.div
          initial={{ x: "-100%", opacity: 0.4 }}
          animate={{ x: "200%", opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/20 to-transparent"
        />
      )}

      {option.icon && (
        <motion.span
          className="text-3xl leading-none block mb-2"
          aria-hidden="true"
          animate={selected ? { scale: [1, 1.2, 1], transition: { duration: 0.3 } } : {}}
        >
          {option.icon}
        </motion.span>
      )}
      <span className={`transition-colors duration-200 ${selected ? "text-brand" : "text-white"}`}>
        {label}
      </span>
    </motion.button>
  );
}

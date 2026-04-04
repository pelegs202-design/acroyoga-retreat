"use client";

import { motion } from "framer-motion";

interface QuizProgressBarProps {
  current: number;
  total: number;
}

/**
 * QuizProgressBar — Brutalist thin progress bar matching Stitch quiz-challenge.html.
 *
 * Fixed at top, 4px height, pink fill. Step count text below in gray.
 *
 * @see stitch-screens/quiz-challenge.html
 * @see stitch-screens/quiz-challenge.png
 */
export default function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full mb-6">
      {/* Thin brutalist progress bar — 4px height, no rounding */}
      <div className="w-full h-1 bg-neutral-800">
        <motion.div
          className="h-full bg-brand origin-[0%_50%]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
      <div className="flex justify-end p-4">
        <span className="text-xs font-bold text-neutral-400">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

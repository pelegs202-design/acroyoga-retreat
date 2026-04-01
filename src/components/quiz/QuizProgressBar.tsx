"use client";

import { motion } from "framer-motion";

interface QuizProgressBarProps {
  current: number;
  total: number;
}

export default function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full mb-6">
      <p className="text-xs text-neutral-400 mb-1.5">
        Step {current} of {total}
      </p>
      <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#F472B6]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
    </div>
  );
}

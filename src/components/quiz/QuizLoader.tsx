"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface QuizLoaderProps {
  onComplete: () => void;
  locale?: string;
}

const PHASES = [
  {
    en: "Analyzing your answers...",
    he: "מנתחים את התשובות שלך...",
    duration: 800,
  },
  {
    en: "Calculating your acro profile...",
    he: "מחשבים את פרופיל האקרו שלך...",
    duration: 1000,
  },
  {
    en: "Preparing your personal recommendations...",
    he: "מכינים את ההמלצות האישיות שלך...",
    duration: 700,
  },
];

export default function QuizLoader({ onComplete, locale = "en" }: QuizLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let elapsed = 0;

    const timers = PHASES.map((p, i) => {
      const timer = setTimeout(() => {
        if (i < PHASES.length - 1) {
          setPhase(i + 1);
        } else {
          // Final phase — call onComplete after it renders briefly
          setTimeout(onComplete, 400);
        }
      }, elapsed + p.duration);
      elapsed += p.duration;
      return timer;
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseText =
    locale === "he" ? PHASES[phase].he : PHASES[phase].en;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Spinning circle */}
      <div className="relative mb-10">
        <motion.svg
          width={80}
          height={80}
          viewBox="0 0 80 80"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="block"
        >
          <circle
            cx={40}
            cy={40}
            r={32}
            fill="none"
            stroke="#222"
            strokeWidth={5}
          />
          <motion.circle
            cx={40}
            cy={40}
            r={32}
            fill="none"
            stroke="#F472B6"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={200}
            strokeDashoffset={140}
          />
        </motion.svg>
        {/* Inner dot */}
        <span className="absolute inset-0 flex items-center justify-center text-brand text-2xl font-bold">
          ✦
        </span>
      </div>

      {/* Phase text */}
      <div className="h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="text-neutral-300 text-base font-medium text-center px-8"
          >
            {phaseText}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {PHASES.map((_, i) => (
          <motion.span
            key={i}
            animate={{ backgroundColor: i <= phase ? "#F472B6" : "#333" }}
            transition={{ duration: 0.3 }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

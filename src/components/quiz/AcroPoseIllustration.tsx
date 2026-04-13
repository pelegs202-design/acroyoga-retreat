"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Animated acroyoga pose SVG illustrations.
 * Shown between quiz questions to build desire and show what's possible.
 *
 * Each pose is a minimalist silhouette with animated entry:
 * - Figures draw in with path animation
 * - Subtle float/breathe animation loops
 * - Brand pink accent color
 */

type PoseId = "bird" | "throne" | "star" | "whale" | "shoulderstand";

interface AcroPoseProps {
  pose: PoseId;
  caption?: { en: string; he: string };
  locale: string;
}

const floatAnimation = {
  y: [0, -6, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

const drawIn = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut" as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3 } },
};

// ─── Bird Pose (Flyer horizontal on base's feet) ─────────────────────────────
function BirdPose() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Base - lying on back, legs up */}
      <motion.path
        d="M60 140 L60 120 Q60 100 70 95 L80 90 L80 80 Q80 75 85 75 Q90 75 90 80 L90 85"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base legs up */}
      <motion.path
        d="M75 95 L85 60 M85 95 L95 60"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base head */}
      <motion.circle
        cx="90" cy="72" r="7"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Flyer - horizontal on top */}
      <motion.g animate={floatAnimation}>
        <motion.path
          d="M65 55 L120 55"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        />
        {/* Flyer arms spread */}
        <motion.path
          d="M80 55 L70 40 M110 55 L120 40"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        />
        {/* Flyer head */}
        <motion.circle
          cx="125" cy="55" r="7"
          stroke="#F472B6"
          strokeWidth="2.5"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        {/* Flyer legs */}
        <motion.path
          d="M65 55 L55 65 M65 55 L55 45"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
      </motion.g>
    </svg>
  );
}

// ─── Throne Pose (Flyer sitting on base's feet) ──────────────────────────────
function ThronePose() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Base - lying on back */}
      <motion.path
        d="M50 160 L70 160 Q80 160 80 150 L80 130 Q80 120 85 115"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base legs up vertical */}
      <motion.path
        d="M85 115 L90 70 M95 115 L100 70"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base head */}
      <motion.circle
        cx="90" cy="108" r="7"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base arms holding flyer */}
      <motion.path
        d="M85 120 L75 85 M95 120 L105 85"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      />
      {/* Flyer - seated on top */}
      <motion.g animate={floatAnimation}>
        {/* Flyer torso */}
        <motion.path
          d="M95 65 L95 35"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        {/* Flyer head */}
        <motion.circle
          cx="95" cy="28" r="7"
          stroke="#F472B6"
          strokeWidth="2.5"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        />
        {/* Flyer arms up (victory) */}
        <motion.path
          d="M95 45 L80 30 M95 45 L110 30"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        {/* Flyer legs folded */}
        <motion.path
          d="M95 65 L80 75 L80 65 M95 65 L110 75 L110 65"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        />
      </motion.g>
    </svg>
  );
}

// ─── Star Pose (Flyer standing on base's hands) ─────────────────────────────
function StarPose() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Base - wide stance */}
      <motion.path
        d="M75 170 L85 130 L95 130 L105 170"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base torso */}
      <motion.path
        d="M90 130 L90 100"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base head */}
      <motion.circle
        cx="90" cy="93" r="7"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base arms up supporting */}
      <motion.path
        d="M90 110 L70 80 M90 110 L110 80"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      />
      {/* Flyer - standing on hands, arms out */}
      <motion.g animate={floatAnimation}>
        {/* Flyer legs */}
        <motion.path
          d="M80 75 L90 55 L100 75"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        {/* Flyer torso */}
        <motion.path
          d="M90 55 L90 30"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        />
        {/* Flyer head */}
        <motion.circle
          cx="90" cy="23" r="7"
          stroke="#F472B6"
          strokeWidth="2.5"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        {/* Flyer arms spread wide */}
        <motion.path
          d="M90 42 L65 35 M90 42 L115 35"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        />
      </motion.g>
    </svg>
  );
}

// ─── Whale Pose (Flyer backbend on base's feet) ─────────────────────────────
function WhalePose() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Base - lying on back */}
      <motion.path
        d="M50 150 L65 150 Q75 150 75 140 L80 120"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base legs up */}
      <motion.path
        d="M85 110 L90 65 M95 110 L100 65"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base head */}
      <motion.circle
        cx="88" cy="105" r="7"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Flyer - backbend on feet */}
      <motion.g animate={floatAnimation}>
        {/* Flyer back curve */}
        <motion.path
          d="M80 60 Q95 30 120 50"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        {/* Flyer head hanging */}
        <motion.circle
          cx="123" cy="55" r="7"
          stroke="#F472B6"
          strokeWidth="2.5"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        />
        {/* Flyer arms hanging back */}
        <motion.path
          d="M110 45 L120 65 M100 40 L105 60"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        {/* Flyer legs */}
        <motion.path
          d="M80 60 L70 70 M80 60 L75 75"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        />
      </motion.g>
    </svg>
  );
}

// ─── Shoulderstand (Flyer vertical on base's hands) ─────────────────────────
function ShoulderstandPose() {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Base - lying on back */}
      <motion.path
        d="M55 160 L70 160 Q80 160 80 150 L85 130"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base head */}
      <motion.circle
        cx="90" cy="123" r="7"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
      />
      {/* Base arms up straight */}
      <motion.path
        d="M85 125 L85 75 M95 125 L95 75"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        variants={drawIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      />
      {/* Flyer - upside down handstand */}
      <motion.g animate={floatAnimation}>
        {/* Flyer torso (upside down) */}
        <motion.path
          d="M90 70 L90 30"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
        {/* Flyer head at bottom (top of pose visually) */}
        <motion.circle
          cx="90" cy="23" r="7"
          stroke="#F472B6"
          strokeWidth="2.5"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        />
        {/* Flyer legs up */}
        <motion.path
          d="M90 70 L80 85 M90 70 L100 85"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        />
        {/* Flyer arms horizontal balance */}
        <motion.path
          d="M90 45 L70 40 M90 45 L110 40"
          stroke="#F472B6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={drawIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        />
      </motion.g>
    </svg>
  );
}

// ─── Pose map ────────────────────────────────────────────────────────────────

const POSES: Record<PoseId, () => React.ReactNode> = {
  bird: BirdPose,
  throne: ThronePose,
  star: StarPose,
  whale: WhalePose,
  shoulderstand: ShoulderstandPose,
};

// ─── Main component ─────────────────────────────────────────────────────────

export default function AcroPoseIllustration({ pose, caption, locale }: AcroPoseProps) {
  const PoseComponent = POSES[pose];
  const isHe = locale === "he";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col items-center gap-2 my-2"
    >
      <div className="w-32 h-28 text-neutral-600">
        <PoseComponent />
      </div>
      {caption && (
        <p className="text-brand text-xs font-bold tracking-widest uppercase">
          {isHe ? caption.he : caption.en}
        </p>
      )}
    </motion.div>
  );
}

// ─── Question-to-pose mapping ───────────────────────────────────────────────

/** Maps question IDs to the pose to show WITH that question */
export const QUESTION_POSE_MAP: Record<string, { pose: PoseId; caption: { en: string; he: string } }> = {
  "movie-role": {
    pose: "bird",
    caption: { en: "This could be you in 30 days", he: "ככה תיראו בעוד 30 יום" },
  },
  "dream-outcome": {
    pose: "throne",
    caption: { en: "Throne — Week 3 goal", he: "Throne — יעד שבוע 3" },
  },
  "fitness": {
    pose: "star",
    caption: { en: "Every fitness level works", he: "כל רמת כושר מתאימה" },
  },
  "schedule": {
    pose: "whale",
    caption: { en: "Whale — the flow pose", he: "Whale — תנוחת הזרימה" },
  },
};

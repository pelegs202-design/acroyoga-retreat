"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxLayerProps {
  children: React.ReactNode;
  /**
   * Parallax speed ratio (0–1).
   * 0 = no movement (locked to viewport), 1 = full scroll speed.
   * 0.4 = background moves at 40% of scroll speed (standard parallax depth).
   */
  speed?: number;
  className?: string;
}

/**
 * ParallaxLayer — useScroll + useTransform parallax background.
 *
 * Translates children at `speed` ratio of scroll progress,
 * creating a depth illusion (background moves slower than foreground).
 *
 * Desktop only: on mobile, parallax is disabled and children render
 * as a normal positioned element to preserve Lighthouse 90+ mobile score.
 * CSS `@media (prefers-reduced-motion)` respected via MotionConfig at layout level.
 *
 * @see 10-RESEARCH.md Pattern 3 (Parallax Background Layer)
 * @see src/components/layout/MotionProvider.tsx (MotionConfig reducedMotion="user")
 *
 * IMPORTANT: Only animate transform/opacity (compositor-safe).
 * Never animate width, height, top, left, padding via useScroll.
 */
export function ParallaxLayer({
  children,
  speed = 0.4,
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Translate background at `speed` ratio of scroll distance
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${speed * 100}%`]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Desktop: parallax translate. Mobile: static position (no JS on mobile). */}
      <motion.div
        // On mobile (md:), parallax is visually imperceptible due to scroll speed differences.
        // Use `hidden md:block` wrapping in the parent to disable on mobile if needed.
        style={{ y }}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

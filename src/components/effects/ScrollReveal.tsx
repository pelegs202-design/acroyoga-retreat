"use client";

import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Stagger delay in seconds (e.g. 0.1, 0.2).
   * Pass to create staggered reveal groups.
   * Default: 0 (no delay)
   */
  delay?: number;
}

/**
 * ScrollReveal — whileInView fade-up reveal container.
 *
 * Fades and slides children into view when they enter the viewport.
 * Uses `viewport={{ once: true }}` to prevent re-triggering on scroll back.
 * Respects OS prefers-reduced-motion via MotionConfig in layout.tsx.
 *
 * @see 10-RESEARCH.md Pattern 1 (Scroll Reveal with whileInView)
 * @see src/components/layout/MotionProvider.tsx (MotionConfig reducedMotion="user")
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

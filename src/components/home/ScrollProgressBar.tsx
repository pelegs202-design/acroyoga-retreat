"use client";

import { useScroll, motion } from "framer-motion";

/**
 * ScrollProgressBar — Fixed thin bar at top of viewport tracking scroll progress.
 *
 * Fixed position, 2px height, z-[60] to sit above the site header.
 * Uses Framer Motion useScroll().scrollYProgress for page-level tracking.
 * scaleX transforms from 0 (no scroll) to 1 (bottom of page).
 * origin-[0%] works correctly for both LTR and RTL layouts.
 *
 * Background: hot pink #F472B6 (brand color).
 * Reduced motion: MotionConfig at layout level respects OS preference —
 * the bar will still appear but transitions are instant (no animation).
 *
 * @see 10-02-PLAN.md Task 1E
 * @see src/components/layout/MotionProvider.tsx (MotionConfig reducedMotion="user")
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-[0%]"
      style={{
        scaleX: scrollYProgress,
        backgroundColor: "#F472B6",
      }}
      aria-hidden="true"
    />
  );
}

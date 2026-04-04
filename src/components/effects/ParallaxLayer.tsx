"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";

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
 * Desktop only: on mobile (< 768px), parallax is fully disabled — children
 * render as a static positioned element. This prevents useScroll from firing
 * on mobile and preserves Lighthouse 90+ mobile score.
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
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop on mount (client-side only)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Static zero motion value for mobile (no scroll tracking)
  const staticY = useMotionValue("0%");

  // Translate background at `speed` ratio of scroll distance (desktop only)
  const desktopY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${speed * 100}%`]
  );

  const y = isDesktop ? desktopY : staticY;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Desktop: parallax translate via compositor-safe transform.
          Mobile: y = "0%" static — no scroll tracking, no GPU layer. */}
      <motion.div
        style={{ y }}
        className={`absolute inset-0 -z-10 ${isDesktop ? "will-change-transform" : ""}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

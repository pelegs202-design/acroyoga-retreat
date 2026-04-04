"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollSectionProps {
  /**
   * Items to display in the horizontal scroll track.
   * Rendered side-by-side on desktop, stacked vertically on mobile.
   */
  children: React.ReactNode;
  className?: string;
}

/**
 * HorizontalScrollSection — Sticky horizontal scroll (desktop only).
 *
 * Maps vertical scroll progress to horizontal x-translation,
 * creating a horizontal scroll "reveal" effect as the user scrolls down.
 *
 * Desktop only: `hidden md:block` wrapper hides on mobile.
 * Mobile receives `md:hidden` children rendered as a vertical stack.
 *
 * PERFORMANCE NOTES:
 * - Only animates `x` (transform) — compositor-safe, no layout triggers.
 * - `h-[400vh]` outer container controls scroll distance (cinematic feel).
 * - `overflow-hidden` on sticky inner prevents content bleed.
 * - Only one useScroll instance for the entire section.
 *
 * PITFALL: Do NOT use `100vh` in the sticky container on mobile —
 * dynamic viewport height (address bar) causes miscalculation.
 * `100dvh` or desktop-only (`hidden md:block`) avoids this.
 *
 * @see 10-RESEARCH.md Pattern 2 (Horizontal Scroll Section)
 */
export function HorizontalScrollSection({
  children,
  className,
}: HorizontalScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Maps scroll 0→1 to x translation 0 → -75%
  // Adjust -75% based on number of items and card widths
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <>
      {/* Desktop: sticky horizontal scroll */}
      <section
        ref={containerRef}
        className={`relative h-[400vh] hidden md:block ${className ?? ""}`}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <motion.div
            style={{ x }}
            className="flex h-full items-center gap-12 pl-[8vw]"
          >
            {children}
          </motion.div>
        </div>
      </section>

      {/* Mobile: vertical stack fallback */}
      <section className={`flex flex-col gap-6 px-6 py-12 md:hidden ${className ?? ""}`}>
        {children}
      </section>
    </>
  );
}

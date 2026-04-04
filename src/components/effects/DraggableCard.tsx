"use client";

import type { RefObject } from "react";
import { motion } from "framer-motion";

interface DraggableCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Drag constraints — ref to parent element or pixel bounds.
   * Default: { top: 0, left: 0, right: 0, bottom: 0 } — snaps back to origin.
   * Pass a ref to constrain within a container element.
   */
  dragConstraints?: RefObject<Element | null> | { top: number; left: number; right: number; bottom: number };
  /**
   * Rubber-band elasticity at constraints boundary.
   * 0 = hard stop, 0.2 = rubbery (default), 1 = very elastic.
   */
  dragElastic?: number;
}

/**
 * DraggableCard — Framer Motion draggable card element.
 *
 * Satisfies DSGN-01 requirement: "at least one draggable UI element on key pages."
 * Planned for wiring into homepage (Plan 10-02).
 *
 * Features:
 * - Rubber-band return to origin via dragConstraints + dragTransition
 * - Scale + grabbing cursor on drag for tactile feedback
 * - card-hover class for consistent pink glow on hover (from globals.css)
 * - Desktop only: mobile renders children as static card (no drag interference with scroll)
 * - Reduced motion: scale animation disabled via MotionConfig at layout level,
 *   but drag functionality remains (drag is interaction, not animation)
 *
 * Usage:
 * ```tsx
 * const containerRef = useRef(null);
 * <div ref={containerRef} className="relative overflow-hidden h-64 w-96">
 *   <DraggableCard dragConstraints={containerRef}>
 *     <p>Drag me!</p>
 *   </DraggableCard>
 * </div>
 * ```
 *
 * @see src/app/globals.css .card-hover (pink glow on hover)
 * @see src/components/layout/MotionProvider.tsx (MotionConfig reducedMotion="user")
 */
export function DraggableCard({
  children,
  className,
  dragConstraints = { top: 0, left: 0, right: 0, bottom: 0 },
  dragElastic = 0.2,
}: DraggableCardProps) {
  return (
    <>
      {/* Desktop: draggable card */}
      <motion.div
        className={`hidden md:block card-hover cursor-grab ${className ?? ""}`}
        drag={true}
        dragConstraints={dragConstraints}
        dragElastic={dragElastic}
        dragTransition={{
          bounceStiffness: 300,
          bounceDamping: 20,
        }}
        whileDrag={{
          scale: 1.05,
          cursor: "grabbing",
        }}
      >
        {children}
      </motion.div>

      {/* Mobile: static card (no drag — avoids interfering with scroll) */}
      <div className={`md:hidden card-hover ${className ?? ""}`}>
        {children}
      </div>
    </>
  );
}

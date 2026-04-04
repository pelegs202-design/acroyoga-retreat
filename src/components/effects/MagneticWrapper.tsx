"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticWrapperProps {
  children: React.ReactNode;
  /**
   * Magnetic pull strength multiplier.
   * 0.25 = subtle, 0.3 = default, 0.5 = strong
   */
  strength?: number;
}

/**
 * MagneticWrapper — Desktop-only magnetic cursor pull effect.
 *
 * Wraps children in a motion.div that translates toward the cursor
 * based on the cursor's offset from the element's center.
 * Uses spring physics for smooth, interruptible animation.
 *
 * Desktop only: mousemove/mouseleave handlers are mouse-only.
 * Mobile users get no magnetic effect — correct behavior, do not activate on touchmove.
 *
 * @see 10-RESEARCH.md Pattern 4 (Olivier Larose magnetic button pattern)
 * @see src/app/globals.css .btn-press (for press animation complement)
 */
export function MagneticWrapper({
  children,
  strength = 0.3,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={position}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { MotionConfig } from "framer-motion";

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * MotionProvider — Wraps children in MotionConfig with reducedMotion="user".
 *
 * This ensures ALL Framer Motion animations across the entire app automatically
 * respect the OS prefers-reduced-motion preference (WCAG 2.3.3 compliance).
 *
 * What `reducedMotion="user"` does:
 * - When OS reduced motion is ON: disables transform and layout animations
 * - Preserves opacity and color transitions (informational, not distracting)
 * - Drag interactions remain functional (drag is an interaction, not an animation)
 *
 * This is a "use client" component because MotionConfig uses client-side React context.
 * Used in src/app/[locale]/layout.tsx (server component) to wrap children.
 *
 * @see https://motion.dev/docs/react-accessibility
 * @see 10-RESEARCH.md Pattern 5 (MotionConfig at Layout Level)
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

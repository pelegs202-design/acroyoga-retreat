"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Reel shortcode — file expected at /public/reels/<reel>.mp4 + .jpg */
  reel: string;
  /** Optional override opacity for the gradient overlay. 0-1. Default 0.78. */
  overlayOpacity?: number;
  /** Optional extra classes for the wrapper */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Full-bleed looping video hero background.
 *
 * - Loads only when the section enters the viewport (saves bandwidth on cold mobile)
 * - Respects prefers-reduced-motion → renders only the poster image
 * - iOS-safe: muted + playsInline + autoplay
 * - Dark gradient overlay so headline copy stays readable
 */
export function VideoHeroBackground({
  reel,
  overlayOpacity = 0.78,
  className = "",
  children,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    try {
      setReduceMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    } catch {
      /* SSR-safe */
    }
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldRenderVideo(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !shouldRenderVideo || reduceMotion) return;
    v.play().catch(() => {
      /* Some in-app browsers reject autoplay even when muted — poster carries it */
    });
  }, [shouldRenderVideo, reduceMotion]);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-black ${className}`}
    >
      {/* Always render poster img — guarantees a visual even if video fails */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/reels/${reel}.jpg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {shouldRenderVideo && !reduceMotion && (
        <video
          ref={videoRef}
          src={`/reels/${reel}.mp4`}
          poster={`/reels/${reel}.jpg`}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.85}) 50%, rgba(10,10,10,${overlayOpacity}) 100%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
